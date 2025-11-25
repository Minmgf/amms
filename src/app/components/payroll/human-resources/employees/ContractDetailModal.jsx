"use client";

import React, { useEffect, useState } from "react";
import { FiX, FiArrowLeft, FiEdit, FiPause, FiPlay } from "react-icons/fi";
import { TbExchange } from "react-icons/tb";
import { getContractDetails, getContractHistory, getHistoryByContract } from "@/services/employeeService";
import { getContractTerminationReasons, terminateContract } from "@/services/contractService";
import { SuccessModal, ErrorModal } from "@/app/components/shared/SuccessErrorModal";
import EndContractModal from "./EndContractModal";
import GenerateAddendumModal from "@/app/components/payroll/contractManagement/contracts/GenerateAddendumModal";
import AddContractModal from "@/app/components/payroll/contractManagement/contracts/AddContractModal";

export default function ContractDetailModal({
  isOpen,
  onClose,
  employeeData
}) {
  const [contractDetails, setContractDetails] = useState(null);
  const [contractHistory, setContractHistory] = useState([]);
  const [contractActionsHistory, setContractActionsHistory] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);

  // Estados para funcionalidades de Otrosí y Terminación (User's work)
  const [showEndContractModal, setShowEndContractModal] = useState(false);
  const [endContractLoading, setEndContractLoading] = useState(false);
  const [terminationReasons, setTerminationReasons] = useState([]);
  const [terminationReasonsLoading, setTerminationReasonsLoading] = useState(false);
  const [showAddendumModal, setShowAddendumModal] = useState(false);
  const [showAddContractModal, setShowAddContractModal] = useState(false);
  const [addendumFields, setAddendumFields] = useState([]);

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Estados para Cambio de Contrato (Colleague's work)
  const [isChangeContractModalOpen, setIsChangeContractModalOpen] = useState(false);
  const [selectedChangeOption, setSelectedChangeOption] = useState("predefined");

  // Cargar historial de contratos al abrir el modal
  useEffect(() => {
    if (isOpen && employeeData?.employeeId) {
      loadContractHistory();
    }
  }, [isOpen, employeeData]);

  // Cargar detalles e historial de acciones cuando cambia el contrato seleccionado
  useEffect(() => {
    if (selectedContract?.contract_code) {
      loadContractDetails();
      loadContractActionsHistory();
    }
  }, [selectedContract]);

  const loadContractHistory = async () => {
    if (!employeeData?.employeeId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getContractHistory(employeeData.employeeId);
      const payload = response?.data || response;
      const historyList = Array.isArray(payload) ? payload : payload?.data || [];

      setContractHistory(historyList || []);

      if (historyList && historyList.length > 0) {
        const activeContract = historyList.find(
          (c) => c.contract_status_name === "Activo" || c.contract_status_name === "Creado"
        );
        setSelectedContract(activeContract || historyList[0]);
      } else {
        setSelectedContract(null);
      }
    } catch (err) {
      console.error("Error loading contract history:", err);
      setError("Error al cargar el historial de contratos");
      setContractHistory([]);
      setSelectedContract(null);
    } finally {
      setLoading(false);
    }
  };

  const loadContractDetails = async () => {
    if (!selectedContract?.contract_code) return;

    setLoadingDetails(true);
    setError(null);
    try {
      const response = await getContractDetails(selectedContract.contract_code);
      const payload = response?.data?.data || response?.data || response;

      if (payload) {
        const mappedDetails = {
          // Información General
          code: payload.contract_code,
          position: payload.employee_charge_name,
          contractType: payload.contract_type_name,
          startDate: payload.start_date,
          endDate: payload.end_date,
          paymentFrequency: payload.payment_frequency_type,
          paymentDate: payload.contract_payments?.[0]?.date_payment
            ? `Día ${payload.contract_payments[0].date_payment}`
            : "No especificado",
          minimumHours: `${payload.minimum_hours} horas`,
          workingDay: payload.workday_type_name,
          workMode: payload.work_mode_type_name,
          description: payload.description,

          // Términos del contrato
          monthlySalary: payload.salary_base,
          currency: payload.currency_type_name,
          vacationDays: `${payload.vacation_days} días`,
          vacationFrequency: `${payload.vacation_frequency_days} días`,
          vacationAccumulation: payload.cumulative_vacation ? "Sí" : "No",
          trialPeriod: `${payload.trial_period_days} días`,
          maxDisabilityDays: `${payload.maximum_disability_days} días`,
          overtime: `${payload.overtime} horas por ${payload.overtime_period}`,
          noticePeriod: `${payload.notice_period_days} días`,

          // Estado
          status: payload.contract_status_name,

          // Fechas de pago (texto completo)
          paymentDates: payload.contract_payments?.map((p) =>
            p.date_payment ? `Día ${p.date_payment}` : p.day_of_week_name
          ).join(", ") || "No especificado",

          // Días de la semana
          workDays: payload.days_of_week?.map((d) => d.day_name).join(", ") || "Todos los días",

          // Deducciones
          deductions: payload.employee_contract_deductions?.map((d) => ({
            name: d.deduction_type_name || "N/A",
            type: d.amount_type || "N/A",
            value:
              d.amount_type === "fijo"
                ? `$${d.amount_value}`
                : `${d.amount_value}%`,
            application: d.application_deduction_type || "N/A",
            validity: `${d.start_date_deduction} - ${d.end_date_deductions || "Indefinido"}`,
            description: d.description || "Sin descripción",
            quantity: d.amount || 1
          })) || [],

          // Incrementos
          increments: payload.employee_contract_increases?.map((i) => ({
            name: i.increase_type_name || "N/A",
            type: i.amount_type || "N/A",
            value:
              i.amount_type === "fijo"
                ? `$${i.amount_value}`
                : `${i.amount_value}%`,
            application: i.application_increase_type || "N/A",
            validity: `${i.start_date_increase} - ${i.end_date_increase || "Indefinido"}`,
            description: i.description || "Sin descripción",
            quantity: i.amount || 1
          })) || []
        };

        setContractDetails(mappedDetails);
      } else {
        setContractDetails(null);
      }
    } catch (err) {
      console.error("Error loading contract details:", err);
      setError("Error al cargar los detalles del contrato");
      setContractDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const loadContractActionsHistory = async () => {
    if (!selectedContract?.contract_code) return;

    try {
      const response = await getHistoryByContract(selectedContract.contract_code);
      const payload = response?.data || response;
      const rawList = Array.isArray(payload) ? payload : payload?.data || [];

      const historyList = rawList.map((item) => ({
        // Si es secundario (Otrosí), lo diferenciamos
        actionLabel: item.secundary_petition ? "Otrosí" : item.contract_status_name,
        statusLabel: item.contract_status_name,
        contractCode: item.contract_code,
        startDate: item.start_date,
        endDate: item.end_date,
        creationDate: item.creation_date,
        user: item.responsible_user_name,
        raw: item
      }));

      setContractActionsHistory(historyList || []);
    } catch (err) {
      console.error("Error loading contract actions history:", err);
      setContractActionsHistory([]);
    }
  };

  const loadTerminationReasons = async () => {
    setTerminationReasonsLoading(true);
    try {
      const response = await getContractTerminationReasons();
      const payload = response?.data || response;
      const list = Array.isArray(payload) ? payload : payload?.data || [];
      setTerminationReasons(list || []);
    } catch (err) {
      console.error("Error loading termination reasons:", err);
      setTerminationReasons([]);
    } finally {
      setTerminationReasonsLoading(false);
    }
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
    if (amount === null || amount === undefined) return "—";

    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Funciones para manejar la finalización del contrato
  const handleEndContract = async () => {
    if (!selectedContract?.contract_code) {
      setErrorMessage("No se ha seleccionado un contrato válido");
      setErrorModalOpen(true);
      return;
    }

    setShowEndContractModal(true);
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
      const payload = {
        contract_termination_reason: parseInt(formData.reasonId, 10),
        observation: formData.description || ""
      };

      const response = await terminateContract(selectedContract.contract_code, payload);

      if (response?.success) {
        setShowEndContractModal(false);
        await loadContractDetails();
        await loadContractHistory();

        setSuccessMessage(response.message || "Contrato finalizado exitosamente.");
        setSuccessModalOpen(true);
      } else {
        const fallbackMessage =
          response?.message || "Error al finalizar el contrato. Intente nuevamente.";
        setErrorMessage(fallbackMessage);
        setErrorModalOpen(true);
      }
    } catch (error) {
      const computedMessage =
        error?.message || "Error al finalizar el contrato. Intente nuevamente.";
      setErrorMessage(computedMessage);
      setErrorModalOpen(true);
    } finally {
      setEndContractLoading(false);
    }
  };

  const handleEndContractCancel = () => {
    setShowEndContractModal(false);
  };

  // Funciones para Otrosí (User's logic)
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

  // Lógica de estado activo mejorada (User's fix)
  const isActiveContract = ["active", "activo", "creado", "vigente"].includes(contractDetails?.status?.toLowerCase() || "");

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
              <p className="text-secondary">Cargando detalles del contrato...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center text-error">
              <p>{error}</p>
            </div>
          </div>
        ) : contractDetails ? (
          <>
            <div className="p-theme-lg">
              {/* Action Buttons - Only show for active contracts */}
              {isActiveContract && (
                <div className="flex justify-center gap-3 mb-6">
                  <button className="btn-theme btn-primary gap-2">
                    <FiEdit className="w-4 h-4" />
                    Corrección de Contrato
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
                  
                  <button
                    className="btn-theme btn-primary gap-2"
                    onClick={() => setIsChangeContractModalOpen(true)}
                  >
                    <TbExchange className="w-4 h-4" />
                    Cambiar contrato
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Column - Contract History */}
                <div className="lg:col-span-1">
                  <div className="card-theme">
                    <div className="p-theme-md border-b border-primary bg-surface">
                      <h3 className="font-theme-semibold text-primary">Historial de Contratos</h3>
                    </div>
                    <div className="p-theme-md space-y-3 max-h-96 overflow-y-auto">
                      {contractHistory.length === 0 ? (
                        <div className="text-center py-4 text-secondary text-theme-sm">
                          No se encontraron contratos para este empleado
                        </div>
                      ) : (
                        contractHistory.map((contract) => (
                          <div
                            key={contract.contract_code}
                            onClick={() => setSelectedContract(contract)}
                            className={`p-theme-sm rounded-theme-lg border cursor-pointer transition-fast ${
                              contract.contract_code === selectedContract?.contract_code
                                ? "border-accent bg-accent/10"
                                : "border-primary hover:bg-hover"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-theme-medium text-theme-sm">
                                {contract.contract_code}
                              </span>
                              <span
                                className={`parametrization-badge ${
                                  contract.contract_status_name === "Activo" ||
                                  contract.contract_status_name === "Active"
                                    ? "parametrization-badge-5"
                                    : contract.contract_status_name === "Finalizado" ||
                                      contract.contract_status_name === "Finished"
                                    ? "parametrization-badge-10"
                                    : "parametrization-badge-1"
                                }`}
                              >
                                {contract.contract_status_name}
                              </span>
                            </div>
                            <div className="text-theme-xs text-secondary">
                              <div>Fecha inicio: {formatDate(contract.start_date)}</div>
                              <div>Fecha fin: {formatDate(contract.end_date)}</div>
                              <div>Creado: {formatDate(contract.creation_date)}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Contract Actions Historical */}
                  <div className="card-theme mt-6">
                    <div className="p-theme-md border-b border-primary bg-surface">
                      <h3 className="font-theme-semibold text-primary">Historial de Acciones del Contrato</h3>
                    </div>
                    <div className="p-theme-md space-y-3 max-h-64 overflow-y-auto">
                      {contractActionsHistory.length === 0 ? (
                        <div className="text-center py-4 text-secondary text-theme-sm">
                          No hay acciones registradas
                        </div>
                      ) : (
                        contractActionsHistory.map((action, index) => (
                          <div
                            key={index}
                            className="p-theme-md border border-primary rounded-theme-lg bg-background"
                          >
                            {/* Fila 1: Código de contrato y estado */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-theme-semibold text-theme-sm text-primary">
                                {action.contractCode}
                              </span>
                              <span
                                className={`parametrization-badge ${
                                  action.statusLabel === "Creacion"
                                    ? "parametrization-badge-5"
                                    : action.statusLabel === "Finalizado"
                                    ? "parametrization-badge-1"
                                    : "parametrization-badge-8"
                                }`}
                              >
                                {action.actionLabel}
                              </span>
                            </div>

                            {/* Fila 2: Rango de fechas */}
                            <div className="text-theme-xs text-secondary mb-2">
                              {`${formatDate(action.startDate)} - ${
                                action.endDate ? formatDate(action.endDate) : "Indefinido"
                              }`}
                            </div>

                            {/* Fila 3: Usuario y fecha/hora */}
                            <div className="flex items-center justify-between text-theme-xs text-secondary">
                              <span>{action.user}</span>
                              <span>{formatDateTime(action.creationDate)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Contract Details */}
                <div className="lg:col-span-3 space-y-6">
                  {/* General Information */}
                  <div className="card-theme">
                    <h3 className="text-theme-lg font-theme-semibold text-primary mb-4">
                      Información General
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InfoField label="Código del contrato" value={contractDetails.code} />
                      <InfoField label="Cargo" value={contractDetails.position} />
                      <InfoField label="Tipo de contrato" value={contractDetails.contractType} />
                      <InfoField label="Fecha de inicio" value={formatDate(contractDetails.startDate)} />
                      <InfoField
                        label="Fecha de finalización"
                        value={contractDetails.endDate ? formatDate(contractDetails.endDate) : "Indefinido"}
                      />
                      <InfoField label="Frecuencia de pago" value={contractDetails.paymentFrequency} />
                      <InfoField label="Fecha de pago" value={contractDetails.paymentDate} />
                      <InfoField label="Mínimo de horas" value={contractDetails.minimumHours} />
                      <InfoField label="Jornada" value={contractDetails.workingDay} />
                      <InfoField label="Modalidad de trabajo" value={contractDetails.workMode} />
                    </div>
                    <div className="mt-4">
                      <InfoField
                        label="Descripción"
                        value={contractDetails.description || "Sin descripción"}
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
                      <InfoField label="Días de vacaciones" value={contractDetails.vacationDays} />
                      <InfoField label="Frecuencia de vacaciones" value={contractDetails.vacationFrequency} />
                      <InfoField label="Acumulación de vacaciones" value={contractDetails.vacationAccumulation} />
                      <InfoField label="Período de prueba" value={contractDetails.trialPeriod} />
                      <InfoField label="Días máximos de incapacidad" value={contractDetails.maxDisabilityDays} />
                      <InfoField label="Horas extra" value={contractDetails.overtime} />
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
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Modal de finalización de contrato (User's work) */}
      <EndContractModal
        isOpen={showEndContractModal}
        onClose={handleEndContractCancel}
        onConfirm={handleEndContractConfirm}
        contractData={selectedContract}
        employeeData={employeeData}
        terminationReasons={terminationReasons}
        loading={endContractLoading || terminationReasonsLoading}
      />

      {/* Modal de Selección de Campos para Otro Sí (User's work) */}
      <GenerateAddendumModal
        isOpen={showAddendumModal}
        onClose={() => setShowAddendumModal(false)}
        onConfirm={handleConfirmAddendum}
        contractData={contractDetails}
      />

      {/* Modal de Creación de Contrato (usado para Otro Sí) (User's work) */}
      {showAddContractModal && (
        <AddContractModal
          isOpen={showAddContractModal}
          onClose={handleAddContractClose}
          contractToEdit={contractDetails}
          onSuccess={handleAddContractSuccess}
          isAddendum={true}
          modifiableFields={addendumFields}
          employeeId={employeeData.employeeId}
        />
      )}

      {/* Change Contract Modal (Colleague's work) */}
      {isChangeContractModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="modal-theme rounded-xl shadow-2xl w-full max-w-lg p-6 bg-white dark:bg-gray-800">
            <h3 className="text-xl font-bold text-center mb-6 text-primary">
              Cambiar Contrato
            </h3>

            <p className="text-secondary mb-6 text-center">
              Por favor seleccione una de las siguientes opciones:
            </p>

            <div className="flex justify-center gap-8 mb-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contractOption"
                  value="predefined"
                  checked={selectedChangeOption === "predefined"}
                  onChange={(e) => setSelectedChangeOption(e.target.value)}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <span className="text-primary">Seleccionar un contrato predefinido</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contractOption"
                  value="new"
                  checked={selectedChangeOption === "new"}
                  onChange={(e) => setSelectedChangeOption(e.target.value)}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <span className="text-primary">Crear un nuevo contrato</span>
              </label>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsChangeContractModalOpen(false)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // Handle selection logic here
                  console.log("Selected option:", selectedChangeOption);
                  setIsChangeContractModalOpen(false);
                }}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                Seleccionar
              </button>
            </div>
          </div>
        </div>
      )}

      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="Contrato finalizado"
        message={successMessage || "Contrato finalizado exitosamente."}
      />

      <ErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        title="Error al finalizar contrato"
        message={errorMessage || "Error al finalizar el contrato. Intente nuevamente."}
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