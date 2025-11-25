"use client";

import React, { useEffect, useState } from "react";
import { FiX, FiArrowLeft, FiEdit, FiPause, FiPlay } from "react-icons/fi";
import { getContractDetails, getContractHistory, getHistoryByContract } from "@/services/employeeService";
import { getContractTerminationReasons, terminateContract } from "@/services/contractService";
import EndContractModal from "./EndContractModal";
import { SuccessModal, ErrorModal } from "@/app/components/shared/SuccessErrorModal";

export default function ContractDetailModal({
  isOpen,
  onClose,
  contractData,
  employeeData
}) {
  const [contractDetails, setContractDetails] = useState(null);
  const [contractHistory, setContractHistory] = useState([]);
  const [contractActionsHistory, setContractActionsHistory] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);
  const [showEndContractModal, setShowEndContractModal] = useState(false);
  const [endContractLoading, setEndContractLoading] = useState(false);
  const [terminationReasons, setTerminationReasons] = useState([]);
  const [terminationReasonsLoading, setTerminationReasonsLoading] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen && employeeData?.employeeId) {
      loadContractHistory();
    }
  }, [isOpen, employeeData]);

  // Efecto para cargar detalles cuando se selecciona un contrato
  useEffect(() => {
    if (selectedContract) {
      loadContractDetails();
      loadContractActionsHistory();
    }
  }, [selectedContract]);

  const loadContractDetails = async () => {
    if (!selectedContract?.contract_code) return;
    
    setLoadingDetails(true);
    setError(null);
    try {
      const response = await getContractDetails(selectedContract.contract_code);
      
      if (response) {
        // Mapear los datos de la API a la estructura esperada por el componente
        const mappedDetails = {
          // Información General
          code: response.contract_code,
          department: "N/A", // No viene en la respuesta
          contractType: response.contract_type_name,
          position: response.employee_charge_name,
          startDate: response.start_date,
          endDate: response.end_date,
          indefinite: !response.end_date,
          description: response.description,
          
          // Términos del Contrato
          paymentFrequency: response.payment_frequency_type,
          monthly: response.salary_type === "Mensual fijo",
          workingDay: response.workday_type_name,
          baseModality: response.work_mode_type_name,
          monthlySalary: response.salary_base,
          currency: response.currency_type_name,
          
          // Vacaciones y períodos
          vacationDays: `${response.vacation_days} días`,
          vacationFrequency: `${response.vacation_frequency_days} días`,
          vacationAccumulation: response.cumulative_vacation ? "Sí" : "No",
          trialPeriod: `${response.trial_period_days} días`,
          
          // Horas y tiempo extra
          minimumHours: `${response.minimum_hours} horas`,
          overtime: `${response.overtime} horas extra por ${response.overtime_period}`,
          maxDisabilityDays: `${response.maximum_disability_days} días`,
          noticePeriod: `${response.notice_period_days} días`,
          
          // Estado
          status: response.contract_status_name,
          
          // Fechas de pago
          paymentDates: response.contract_payments?.map(payment => 
            payment.date_payment ? `Día ${payment.date_payment}` : payment.day_of_week_name
          ).join(", ") || "No especificado",
          
          // Días de la semana (si aplica)
          workDays: response.days_of_week?.map(day => day.day_name).join(", ") || "Todos los días",
          
          // Mapear deducciones
          deductions: response.employee_contract_deductions?.map(deduction => ({
            name: deduction.deduction_type_name || "N/A",
            type: deduction.amount_type || "N/A",
            value: deduction.amount_type === "fijo" ? `$${deduction.amount_value}` : `${deduction.amount_value}%`,
            application: deduction.application_deduction_type || "N/A",
            validity: `${deduction.start_date_deduction} - ${deduction.end_date_deductions || 'Indefinido'}`,
            description: deduction.description || "Sin descripción",
            quantity: deduction.amount || 1
          })) || [],
          
          // Mapear incrementos
          increments: response.employee_contract_increases?.map(increase => ({
            name: increase.increase_type_name || "N/A",
            type: increase.amount_type || "N/A",
            value: increase.amount_type === "fijo" ? `$${increase.amount_value}` : `${increase.amount_value}%`,
            application: increase.application_increase_type || "N/A",
            validity: `${increase.start_date_increase} - ${increase.end_date_increase || 'Indefinido'}`,
            description: increase.description || "Sin descripción",
            quantity: increase.amount || 1
          })) || []
        };
        
        setContractDetails(mappedDetails);
      }
    } catch (err) {
      setError("Error al cargar los detalles del contrato");
      console.error("Error loading contract details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const loadContractHistory = async () => {
    if (!employeeData?.employeeId) return;
    
    setLoading(true);
    try {
      const response = await getContractHistory(employeeData.employeeId);
      
      if (response.success && response.data) {
        setContractHistory(response.data);
        
        // Seleccionar el contrato activo por defecto (el primero con estado "Creado" o similar)
        const activeContract = response.data.find(contract => 
          contract.contract_status_name === "Creado" || 
          contract.contract_status_name === "Activo"
        ) || response.data[0];
        
        if (activeContract) {
          setSelectedContract(activeContract);
        }
      }
    } catch (err) {
      console.error("Error loading contract history:", err);
      setContractHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const loadContractActionsHistory = async () => {
    if (!selectedContract?.contract_code) return;
    
    try {
      const response = await getHistoryByContract(selectedContract.contract_code);
      
      if (response.success && response.data) {
        setContractActionsHistory(response.data);
      }
    } catch (err) {
      console.error("Error loading contract actions history:", err);
      setContractActionsHistory([]);
    }
  };

  const loadTerminationReasons = async () => {
    setTerminationReasonsLoading(true);
    try {
      const response = await getContractTerminationReasons();
      setTerminationReasons(response || []);
    } catch (err) {
      console.error("Error loading termination reasons:", err);
      setTerminationReasons([]);
    } finally {
      setTerminationReasonsLoading(false);
    }
  };

  const handleContractSelect = (contract) => {
    setSelectedContract(contract);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Funciones para manejar la finalización del contrato
  const handleEndContract = async () => {
    setShowEndContractModal(true);
    // Cargar razones de terminación cuando se abre el modal
    await loadTerminationReasons();
  };

  const handleEndContractConfirm = async (formData) => {
    if (!selectedContract?.contract_code) {
      setErrorMessage("No se ha seleccionado un contrato válido");
      setErrorModalOpen(true);
      return;
    }

    setEndContractLoading(true);
    try {
      // Preparar payload según la especificación del endpoint
      const payload = {
        contract_termination_reason: parseInt(formData.reasonId),
        observation: formData.description || ""
      };

      // Llamar al servicio para finalizar el contrato
      const response = await terminateContract(selectedContract.contract_code, payload);
      
      if (response.success) {
        // Cerrar modal
        setShowEndContractModal(false);
        
        // Recargar detalles del contrato para reflejar el nuevo estado
        await loadContractDetails();
        await loadContractHistory();
        
        // Mostrar mensaje de éxito con modal reutilizable
        setSuccessMessage(response.message || "Contrato finalizado exitosamente.");
        setSuccessModalOpen(true);
      }
      
    } catch (error) {
      console.error("Error al finalizar contrato:", error);
      
      // Mostrar mensaje de error específico en modal reutilizable
      const errorMsg = error.message || "Error al finalizar el contrato. Intente nuevamente.";
      setErrorMessage(errorMsg);
      setErrorModalOpen(true);
      
      // Si hay errores de validación, podrías manejarlos aquí
      if (error.validationErrors) {
        console.error("Errores de validación:", error.validationErrors);
      }
    } finally {
      setEndContractLoading(false);
    }
  };

  const handleEndContractCancel = () => {
    setShowEndContractModal(false);
  };

  const handleGenerateAddendum = () => {
    setShowAddendumModal(true);
  };

  const handleConfirmAddendum = (selectedFields) => {
    setAddendumFields(selectedFields);
    setShowAddendumModal(false);
    setShowAddContractModal(true);
  };

  const handleAddContractClose = () => {
    setShowAddContractModal(false);
    setAddendumFields([]);
  };

  const handleAddContractSuccess = () => {
    setShowAddContractModal(false);
    setAddendumFields([]);
    loadContractDetails();
    loadContractHistory();
  };

  const isActiveContract = contractDetails?.status === "Active" || contractDetails?.status === "Activo";

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="modal-theme rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-theme-lg border-b border-primary">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-theme-sm hover:bg-hover rounded-theme-md transition-fast"
              aria-label="Volver a detalles del empleado"
            >
              <FiArrowLeft className="w-5 h-5 text-secondary" />
            </button>
            <h2 className="text-theme-2xl font-theme-bold text-primary">
              Información del Contrato
            </h2>
          </div>
          <button
            className="p-theme-sm hover:bg-hover rounded-theme-md transition-fast cursor-pointer"
            onClick={onClose}
            aria-label="Cerrar modal de detalles del contrato"
          >
            <FiX className="w-5 h-5 text-secondary" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
              <p className="text-secondary">Cargando historial de contratos...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center text-error">
              <p>{error}</p>
            </div>
          </div>
        ) : contractHistory.length > 0 ? (
          <>
            <div className="p-theme-lg">
              {/* Action Buttons - Only show for active contracts */}
              {isActiveContract && (
                <div className="flex justify-center gap-3 mb-6">
                  <button className="btn-theme btn-primary gap-2">
                    <FiEdit className="w-4 h-4" />
                    Cambiar Contrato
                  </button>
                  <button 
                    className="btn-theme btn-primary gap-2"
                    onClick={handleEndContract}
                    disabled={endContractLoading}
                  >
                    <FiPause className="w-4 h-4" />
                    Terminar Contrato
                  </button>
                  <button 
                    className="btn-theme btn-primary gap-2"
                    onClick={handleGenerateAddendum}
                  >
                    <FiPlay className="w-4 h-4" />
                    Generar Otrosi
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Contract History */}
                <div className="lg:col-span-1">
                  <div className="card-theme">
                    <div className="p-theme-md border-b border-primary bg-surface">
                      <h3 className="font-theme-semibold text-primary">Historial de Contratos</h3>
                    </div>
                    <div className="p-theme-md space-y-3 max-h-96 overflow-y-auto">
                      {contractHistory.map((contract, index) => (
                        <div
                          key={index}
                          onClick={() => handleContractSelect(contract)}
                          className={`p-theme-sm rounded-theme-lg border cursor-pointer transition-fast ${
                            selectedContract?.contract_code === contract.contract_code
                              ? "border-accent bg-accent/10"
                              : "border-primary hover:bg-hover"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-theme-medium text-theme-sm">{contract.contract_code}</span>
                            <span className={`parametrization-badge ${
                              contract.contract_status_name === "Creado" || contract.contract_status_name === "Activo"
                                ? "parametrization-badge-5"
                                : contract.contract_status_name === "Finalizado"
                                ? "parametrization-badge-10"
                                : "parametrization-badge-1"
                            }`}>
                              {contract.contract_status_name}
                            </span>
                          </div>
                          <div className="text-theme-xs text-secondary">
                            <div>Responsable: {contract.responsible_user_name}</div>
                            <div>Creado: {formatDate(contract.creation_date)}</div>
                            <div>Inicio: {formatDate(contract.start_date)}</div>
                            {contract.end_date && <div>Fin: {formatDate(contract.end_date)}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contract Actions Historical */}
                  <div className="card-theme mt-6">
                    <div className="p-theme-md border-b border-primary bg-surface">
                      <h3 className="font-theme-semibold text-primary">Historial de Acciones del Contrato</h3>
                    </div>
                    <div className="p-theme-md space-y-3 max-h-64 overflow-y-auto">
                      {contractActionsHistory.length > 0 ? contractActionsHistory.map((action, index) => (
                        <div key={index} className="p-theme-sm border border-primary rounded-theme-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-theme-medium text-theme-sm">{action.contract_code}</span>
                            <span className={`parametrization-badge ${
                              action.contract_status_name === "Creacion" ? "parametrization-badge-5" :
                              action.contract_status_name === "Finalizado" ? "parametrization-badge-1" :
                              action.contract_status_name === "Otrosi" ? "parametrization-badge-8" :
                              "parametrization-badge-10"
                            }`}>
                              {action.contract_status_name}
                            </span>
                          </div>
                          <div className="text-theme-xs text-secondary">
                            <div>Fecha: {formatDateTime(action.creation_date)}</div>
                            <div>Usuario: {action.responsible_user_name}</div>
                            <div>Inicio: {formatDate(action.start_date)}</div>
                            {action.end_date && <div>Fin: {formatDate(action.end_date)}</div>}
                            {action.secundary_petition && (
                              <div className="text-blue-600 text-xs mt-1">Petición secundaria</div>
                            )}
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-4 text-secondary text-theme-sm">
                          {selectedContract ? "No hay acciones registradas para este contrato" : "Seleccione un contrato para ver las acciones"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Contract Details */}
                <div className="lg:col-span-2 space-y-6">
                  {loadingDetails ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto mb-4"></div>
                        <p className="text-secondary text-sm">Cargando detalles del contrato...</p>
                      </div>
                    </div>
                  ) : contractDetails ? (
                    <>
                      {/* General Information */}
                      <div className="card-theme">
                    <h3 className="text-theme-lg font-theme-semibold text-primary mb-4">
                      Información General
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InfoField label="Código del Contrato" value={contractDetails.code} />
                      <InfoField label="Tipo de contrato" value={contractDetails.contractType} />
                      <InfoField label="Cargo" value={contractDetails.position} />
                      <InfoField label="Fecha de inicio" value={formatDate(contractDetails.startDate)} />
                      <InfoField label="Fecha de finalización" value={formatDate(contractDetails.endDate)} />
                      <InfoField label="Estado" value={contractDetails.status} />
                      <InfoField label="Jornada laboral" value={contractDetails.workingDay} />
                      <InfoField label="Modalidad de trabajo" value={contractDetails.baseModality} />
                    </div>
                    <div className="mt-4">
                      <InfoField 
                        label="Descripción" 
                        value={contractDetails.description || "Desarrollo y mantenimiento de aplicaciones web usando tecnologías modernas"} 
                      />
                    </div>
                  </div>

                  {/* Contract Terms */}
                  <div className="card-theme">
                    <h3 className="text-theme-lg font-theme-semibold text-primary mb-4">
                      Términos del Contrato
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InfoField label="Salario base" value={formatCurrency(contractDetails.monthlySalary)} />
                      <InfoField label="Moneda" value={contractDetails.currency} />
                      <InfoField label="Frecuencia de pago" value={contractDetails.paymentFrequency} />
                      <InfoField label="Fechas de pago" value={contractDetails.paymentDates} />
                      <InfoField label="Horas mínimas" value={contractDetails.minimumHours} />
                      <InfoField label="Horas extra" value={contractDetails.overtime} />
                      <InfoField label="Días de vacaciones" value={contractDetails.vacationDays} />
                      <InfoField label="Frecuencia de vacaciones" value={contractDetails.vacationFrequency} />
                      <InfoField label="Acumulación de vacaciones" value={contractDetails.vacationAccumulation} />
                      <InfoField label="Período de prueba" value={contractDetails.trialPeriod} />
                      <InfoField label="Días máximos de incapacidad" value={contractDetails.maxDisabilityDays} />
                      <InfoField label="Período de aviso" value={contractDetails.noticePeriod} />
                    </div>
                  </div>

                  {/* Associated Deductions */}
                  <div className="card-theme">
                    <h3 className="text-theme-lg font-theme-semibold text-primary mb-4">
                      Deducciones Asociadas
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Nombre</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Tipo</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Valor</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Aplicación</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Vigencia</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Descripción</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Cantidad</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contractDetails.deductions?.map((deduction, index) => (
                            <tr key={index} className="border-b border-gray-100">
                              <td className="py-2 px-3 text-gray-600">{deduction.name}</td>
                              <td className="py-2 px-3 text-gray-600">{deduction.type}</td>
                              <td className="py-2 px-3 text-gray-900">{deduction.value}</td>
                              <td className="py-2 px-3 text-gray-600">{deduction.application}</td>
                              <td className="py-2 px-3 text-gray-600">{deduction.validity}</td>
                              <td className="py-2 px-3 text-gray-600">{deduction.description}</td>
                              <td className="py-2 px-3 text-gray-600">{deduction.quantity}</td>
                            </tr>
                          )) || (
                            <tr>
                              <td colSpan="7" className="py-4 text-center text-gray-500">
                                No hay deducciones asociadas
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Associated Increments */}
                  <div className="card-theme">
                    <h3 className="text-theme-lg font-theme-semibold text-primary mb-4">
                      Incrementos Asociados
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Nombre</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Tipo</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Valor</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Aplicación</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Vigencia</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Descripción</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Cantidad</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contractDetails.increments?.map((increment, index) => (
                            <tr key={index} className="border-b border-gray-100">
                              <td className="py-2 px-3 text-gray-600">{increment.name}</td>
                              <td className="py-2 px-3 text-gray-600">{increment.type}</td>
                              <td className="py-2 px-3 text-gray-900">{increment.value}</td>
                              <td className="py-2 px-3 text-gray-600">{increment.application}</td>
                              <td className="py-2 px-3 text-gray-600">{increment.validity}</td>
                              <td className="py-2 px-3 text-gray-600">{increment.description}</td>
                              <td className="py-2 px-3 text-gray-600">{increment.quantity}</td>
                            </tr>
                          )) || (
                            <tr>
                              <td colSpan="7" className="py-4 text-center text-gray-500">
                                No hay incrementos asociados
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center text-secondary">
                        <p>Seleccione un contrato de la lista para ver los detalles</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center text-secondary">
              <p>No se encontraron contratos para este empleado</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de finalización de contrato */}
      <EndContractModal
        isOpen={showEndContractModal}
        onClose={handleEndContractCancel}
        onConfirm={handleEndContractConfirm}
        contractData={selectedContract}
        employeeData={employeeData}
        terminationReasons={terminationReasons}
        loading={endContractLoading || terminationReasonsLoading}
      />

      {/* Modal de éxito al finalizar contrato */}
      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="Contrato finalizado"
        message={successMessage}
      />

      {/* Modal de error al finalizar contrato */}
      <ErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        title="Error al finalizar contrato"
        message={errorMessage}
      />
    </div>
  );
}

// Helper component for displaying information fields
function InfoField({ label, value }) {
  return (
    <div>
      <label className="block text-theme-sm font-theme-medium text-secondary mb-1">
        {label}
      </label>
      <div className="text-primary parametrization-text">
        {value || "—"}
      </div>
    </div>
  );
}
