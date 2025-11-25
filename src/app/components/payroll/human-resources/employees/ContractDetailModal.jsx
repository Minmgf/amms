"use client";

import React, { useEffect, useState } from "react";
import { FiX, FiArrowLeft, FiEdit, FiPause, FiPlay } from "react-icons/fi";
import { TbExchange } from "react-icons/tb";
import {
  getContractDetails,
  getContractHistory,
  getHistoryByContract,
  getEstablishedContracts,
  getEstablishedContractDetails
} from "@/services/employeeService";
import {
  getContractTerminationReasons,
  terminateContract,
  getActiveDepartments,
  getActiveCharges
} from "@/services/contractService";
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

  // Estados para Cambio de Contrato
  const [isChangeContractModalOpen, setIsChangeContractModalOpen] = useState(false);
  const [selectedChangeOption, setSelectedChangeOption] = useState("predefined");
  const [changeContractStep, setChangeContractStep] = useState(1); // 1: selección opción, 2: selección contrato predefinido
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCharge, setSelectedCharge] = useState("");
  const [availableCharges, setAvailableCharges] = useState([]);
  const [predefinedContracts, setPredefinedContracts] = useState([]);
  const [selectedPredefinedContract, setSelectedPredefinedContract] = useState(null);
  const [noveltyDescription, setNoveltyDescription] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingCharges, setLoadingCharges] = useState(false);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [descriptionError, setDescriptionError] = useState("");
  const [isChangeContractMode, setIsChangeContractMode] = useState(false); // Para distinguir entre Cambio de Contrato y Otro Sí
  const [changeContractData, setChangeContractData] = useState(null); // Datos del contrato predefinido seleccionado
  const [changeContractObservation, setChangeContractObservation] = useState(""); // Observación del cambio de contrato

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

    // Si viene en formato YYYY-MM-DD, formatear manualmente para evitar desfases por zona horaria
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year}`;
    }

    // Para otros formatos (con hora incluida), usar toLocaleDateString normalmente
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
    setIsChangeContractMode(false);
    setChangeContractData(null);
    setChangeContractObservation("");
  };

  const handleAddContractSuccess = () => {
    setShowAddContractModal(false);
    setAddendumFields([]);
    setIsChangeContractMode(false);
    setChangeContractData(null);
    setChangeContractObservation("");
    loadContractDetails();
    loadContractHistory();
  };

  // Lógica de estado activo mejorada (User's fix)
  const isActiveContract = ["active", "activo", "creado", "vigente"].includes(contractDetails?.status?.toLowerCase() || "");

  // Funciones para Cambio de Contrato
  const handleOpenChangeContract = async () => {
    setIsChangeContractModalOpen(true);
    setChangeContractStep(1);
    setSelectedChangeOption("predefined");
    setSelectedDepartment("");
    setSelectedCharge("");
    setAvailableCharges([]);
    setPredefinedContracts([]);
    setSelectedPredefinedContract(null);
    setNoveltyDescription("");
    setDescriptionError("");

    // Cargar departamentos al abrir
    await loadDepartments();
  };

  const loadDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const response = await getActiveDepartments();
      const deptList = response?.data || [];
      setDepartments(deptList);
    } catch (error) {
      console.error("Error loading departments:", error);
      setErrorMessage("Error al cargar departamentos");
      setErrorModalOpen(true);
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleDepartmentChange = async (departmentId) => {
    setSelectedDepartment(departmentId);
    setSelectedCharge("");
    setAvailableCharges([]);
    setPredefinedContracts([]);
    setSelectedPredefinedContract(null);

    if (!departmentId) return;

    setLoadingCharges(true);
    try {
      const charges = await getActiveCharges(departmentId);
      // El servicio puede retornar directamente el array o en data
      const chargesList = Array.isArray(charges) ? charges : (charges?.data || []);
      setAvailableCharges(chargesList);
    } catch (error) {
      console.error("Error loading charges:", error);
      setErrorMessage("Error al cargar cargos");
      setErrorModalOpen(true);
      setAvailableCharges([]);
    } finally {
      setLoadingCharges(false);
    }
  };

  const handleChargeChange = async (chargeId) => {
    setSelectedCharge(chargeId);
    setSelectedPredefinedContract(null);
    setPredefinedContracts([]);

    if (!chargeId) return;

    setLoadingContracts(true);
    try {
      const response = await getEstablishedContracts(chargeId);
      const contractsList = response?.data || [];
      setPredefinedContracts(contractsList);
    } catch (error) {
      console.error("Error loading predefined contracts:", error);
      setErrorMessage("Error al cargar contratos predefinidos");
      setErrorModalOpen(true);
      setPredefinedContracts([]);
    } finally {
      setLoadingContracts(false);
    }
  };

  const handleSelectContractOption = () => {
    const trimmedDescription = noveltyDescription.trim();

    // Validar descripción de novedades (obligatorio, máx 350 caracteres)
    if (!trimmedDescription) {
      setDescriptionError("La descripción de novedades es obligatoria");
      return;
    }

    if (trimmedDescription.length > 350) {
      setDescriptionError("La descripción no puede exceder 350 caracteres");
      return;
    }

    if (selectedChangeOption === "new") {
      // Flujo: Crear nuevo contrato
      setIsChangeContractModalOpen(false);
      setIsChangeContractMode(true); // Activar modo cambio de contrato
      setChangeContractData(null); // No hay datos precargados
      setChangeContractObservation(trimmedDescription); // Guardar observación
      setShowAddContractModal(true);
    } else if (selectedChangeOption === "predefined") {
      // Validar que se haya seleccionado departamento, cargo y contrato
      if (!selectedDepartment) {
        setDescriptionError("Debe seleccionar un departamento");
        return;
      }
      if (!selectedCharge) {
        setDescriptionError("Debe seleccionar un cargo");
        return;
      }
      if (!selectedPredefinedContract) {
        setDescriptionError("Debe seleccionar un contrato predefinido");
        return;
      }

      // Flujo: Seleccionar contrato existente
      // Cargar los detalles del contrato seleccionado y abrir AddContractModal con datos precargados
      loadPredefinedContractAndOpenModal();
    }
  };

  const loadPredefinedContractAndOpenModal = async () => {
    try {
      // Usar contract_code para obtener detalles (según la nota en employeeService.js)
      const contractIdentifier = selectedPredefinedContract.id || selectedPredefinedContract.contract_code;
      const response = await getEstablishedContractDetails(contractIdentifier);
      const contractData = response?.data || response;

      setIsChangeContractModalOpen(false);
      setIsChangeContractMode(true); // Activar modo cambio de contrato
      setChangeContractData(contractData); // Guardar datos del contrato predefinido
      setChangeContractObservation(noveltyDescription.trim()); // Guardar observación
      setShowAddContractModal(true);
    } catch (error) {
      console.error("Error loading predefined contract details:", error);
      setErrorMessage("Error al cargar detalles del contrato predefinido");
      setErrorModalOpen(true);
    }
  };

  const handleCloseChangeContractModal = () => {
    setIsChangeContractModalOpen(false);
    setChangeContractStep(1);
    setSelectedChangeOption("predefined");
    setSelectedDepartment("");
    setSelectedCharge("");
    setAvailableCharges([]);
    setPredefinedContracts([]);
    setSelectedPredefinedContract(null);
    setNoveltyDescription("");
    setDescriptionError("");
  };

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
                    onClick={handleOpenChangeContract}
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

      {/* Modal de Creación de Contrato (usado para Otro Sí y Cambio de Contrato) */}
      {showAddContractModal && (
        <AddContractModal
          isOpen={showAddContractModal}
          onClose={handleAddContractClose}
          contractToEdit={isChangeContractMode ? changeContractData : contractDetails}
          onSuccess={handleAddContractSuccess}
          isAddendum={!isChangeContractMode}
          modifiableFields={addendumFields}
          employeeId={employeeData.employeeId}
          isChangeContract={isChangeContractMode}
          changeContractObservation={changeContractObservation}
        />
      )}

      {/* Change Contract Modal */}
      {isChangeContractModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="modal-theme rounded-xl shadow-2xl w-full max-w-2xl p-theme-lg">
            <h3 className="text-theme-xl font-theme-bold text-center mb-theme-lg text-primary">
              Cambiar Contrato
            </h3>

            {/* Descripción de novedades - Siempre visible y obligatorio */}
            <div className="mb-theme-lg">
              <label className="block text-theme-sm font-theme-medium text-primary mb-2">
                Descripción de novedades <span className="text-error">*</span>
              </label>
              <textarea
                value={noveltyDescription}
                onChange={(e) => {
                  setNoveltyDescription(e.target.value);
                  setDescriptionError("");
                }}
                placeholder="Describa los cambios realizados en este contrato (máximo 350 caracteres)"
                className="parametrization-input w-full"
                rows="3"
                maxLength={350}
              />
              <div className="flex justify-between items-center mt-1">
                <span className={`text-theme-xs ${descriptionError ? 'text-error' : 'text-secondary'}`}>
                  {descriptionError || `${noveltyDescription.length}/350 caracteres`}
                </span>
              </div>
            </div>

            <p className="text-secondary mb-theme-md text-center parametrization-text">
              Por favor seleccione una de las siguientes opciones:
            </p>

            {/* Radio buttons para selección de opción */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mb-theme-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contractOption"
                  value="predefined"
                  checked={selectedChangeOption === "predefined"}
                  onChange={(e) => setSelectedChangeOption(e.target.value)}
                  className="w-4 h-4 text-accent focus:ring-accent"
                />
                <span className="text-primary parametrization-text">Seleccionar un contrato predefinido</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contractOption"
                  value="new"
                  checked={selectedChangeOption === "new"}
                  onChange={(e) => setSelectedChangeOption(e.target.value)}
                  className="w-4 h-4 text-accent focus:ring-accent"
                />
                <span className="text-primary parametrization-text">Crear un nuevo contrato</span>
              </label>
            </div>

            {/* Campos condicionales para contrato predefinido */}
            {selectedChangeOption === "predefined" && (
              <div className="space-y-4 mb-theme-lg p-theme-md bg-surface rounded-theme-lg border border-primary">
                {/* Selector de Departamento */}
                <div>
                  <label className="block text-theme-sm font-theme-medium text-primary mb-2">
                    Departamento <span className="text-error">*</span>
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className="parametrization-input w-full"
                    disabled={loadingDepartments}
                  >
                    <option value="">
                      {loadingDepartments ? "Cargando departamentos..." : "Seleccione un departamento"}
                    </option>
                    {departments.map((dept) => (
                      <option key={dept.id_employee_department} value={dept.id_employee_department}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selector de Cargo */}
                <div>
                  <label className="block text-theme-sm font-theme-medium text-primary mb-2">
                    Cargo <span className="text-error">*</span>
                  </label>
                  <select
                    value={selectedCharge}
                    onChange={(e) => handleChargeChange(e.target.value)}
                    className="parametrization-input w-full"
                    disabled={!selectedDepartment || loadingCharges}
                  >
                    <option value="">
                      {loadingCharges ? "Cargando cargos..." : "Seleccione un cargo"}
                    </option>
                    {availableCharges.map((charge) => (
                      <option key={charge.id_employee_charge} value={charge.id_employee_charge}>
                        {charge.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Listado de contratos predefinidos */}
                {selectedCharge && (
                  <div>
                    <label className="block text-theme-sm font-theme-medium text-primary mb-2">
                      Contrato predefinido <span className="text-error">*</span>
                    </label>
                    {loadingContracts ? (
                      <div className="text-center py-theme-md">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
                        <p className="text-secondary text-theme-sm mt-2">Cargando contratos...</p>
                      </div>
                    ) : predefinedContracts.length === 0 ? (
                      <p className="text-secondary text-theme-sm text-center py-theme-md">
                        No hay contratos predefinidos para este cargo
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {predefinedContracts.map((contract) => (
                          <label
                            key={contract.contract_code}
                            className={`flex items-center gap-3 p-theme-sm border rounded-theme-lg cursor-pointer transition-fast ${
                              selectedPredefinedContract?.contract_code === contract.contract_code
                                ? "border-accent bg-accent/10"
                                : "border-primary hover:bg-hover"
                            }`}
                          >
                            <input
                              type="radio"
                              name="predefinedContract"
                              value={contract.contract_code}
                              checked={selectedPredefinedContract?.contract_code === contract.contract_code}
                              onChange={() => setSelectedPredefinedContract(contract)}
                              className="w-4 h-4 text-accent focus:ring-accent"
                            />
                            <div className="flex-1">
                              <div className="font-theme-medium text-primary parametrization-text">{contract.contract_code}</div>
                              <div className="text-theme-xs text-secondary">
                                {contract.contract_type_name || "Tipo de contrato no especificado"}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCloseChangeContractModal}
                className="btn-theme"
                style={{
                  backgroundColor: "#EF4444",
                  color: "white",
                  border: "none",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSelectContractOption}
                className="btn-theme btn-primary"
                style={{
                  backgroundColor: "#000000",
                  color: "white",
                }}
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