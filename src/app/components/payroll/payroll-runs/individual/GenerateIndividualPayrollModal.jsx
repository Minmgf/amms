"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";
import {
  SuccessModal,
  ErrorModal,
  ConfirmModal,
} from "@/app/components/shared/SuccessErrorModal";
import IndividualPayrollAdjustmentsModal from "@/app/components/payroll/payroll-runs/AdditionalSettingsModal";
import { generateIndividualPayroll } from "@/services/payrollService";
import { getContractHistory } from "@/services/employeeService";

// Datos mock de contratos por empleado mientras se integran los endpoints reales
const MOCK_EMPLOYEE_CONTRACTS = [
  {
    id: 1,
    code: "CT-EMP1-2026-IND",
    name: "Contrato indefinido 2026",
    status: "Vigente",
    isActive: true,
    employeeId: 1,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
  },
  {
    id: 2,
    code: "CT-EMP1-2025-FIN",
    name: "Contrato fijo 2025",
    status: "Finalizado",
    isActive: false,
    employeeId: 1,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
  },
  {
    id: 3,
    code: "CT-EMP2-2024-FIN",
    name: "Contrato fijo 2024",
    status: "Finalizado",
    isActive: false,
    employeeId: 2,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
  },
];

const getMonthLabel = (date) => {
  const formatter = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  });
  return formatter.format(date);
};

const formatDateISO = (date) => {
  if (!(date instanceof Date)) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const GeneratePayrollModal = ({
  isOpen,
  onClose,
  employee,
  generatedPayrolls = [],
  onRegisterPayroll,
  canGeneratePayroll = true,
}) => {
  useTheme();

  const [selectedContractId, setSelectedContractId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [showNoAdjustmentsConfirm, setShowNoAdjustmentsConfirm] =
    useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [adjustments, setAdjustments] = useState({
    deductions: [],
    increments: [],
  });
  const [isAdjustmentsModalOpen, setIsAdjustmentsModalOpen] = useState(false);

  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [employeeContracts, setEmployeeContracts] = useState([]);

  const hasActiveContract = useMemo(
    () => employeeContracts.some((contract) => contract.isActive),
    [employeeContracts]
  );

  const selectedContract = useMemo(() => {
    if (!selectedContractId) return null;
    return (
      employeeContracts.find(
        (contract) => String(contract.id) === String(selectedContractId)
      ) || null
    );
  }, [employeeContracts, selectedContractId]);

  const hasAdjustments = useMemo(() => {
    const d = adjustments?.deductions || [];
    const i = adjustments?.increments || [];
    return d.length > 0 || i.length > 0;
  }, [adjustments]);

  const resetState = () => {
    setSelectedContractId("");
    setStartDate("");
    setEndDate("");
    setErrors({});
    setLoading(false);
    setAdjustments({ deductions: [], increments: [] });
    setShowNoAdjustmentsConfirm(false);
    setShowCancelConfirm(false);
    setIsAdjustmentsModalOpen(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetState();
      setEmployeeContracts([]);
      return;
    }

    resetState();
    setEmployeeContracts([]);

    if (!employee) {
      return;
    }

    const loadContracts = async () => {
      try {
        const response = await getContractHistory(employee.id);

        let rawContracts = [];
        if (Array.isArray(response)) {
          rawContracts = response;
        } else if (Array.isArray(response?.data)) {
          rawContracts = response.data;
        } else if (Array.isArray(response?.contracts)) {
          rawContracts = response.contracts;
        }

        const mappedContracts = (rawContracts || [])
          .map((contract) => {
            const id =
              contract.id ||
              contract.id_contract ||
              contract.id_established_contract ||
              contract.contract_id ||
              contract.contract_code;

            const code =
              contract.contract_code ||
              contract.code ||
              contract.name ||
              (id ? `Contrato ${id}` : "");

            const name = contract.name || contract.contract_name || code;

            const start =
              contract.start_date ||
              contract.startDate ||
              contract.fecha_inicio ||
              "";
            const end =
              contract.end_date ||
              contract.endDate ||
              contract.fecha_fin ||
              "";

            let isActive = false;
            if (typeof contract.is_active !== "undefined") {
              isActive = Boolean(contract.is_active);
            } else if (typeof contract.isActive !== "undefined") {
              isActive = Boolean(contract.isActive);
            } else if (typeof contract.contract_status_name === "string") {
              const status = contract.contract_status_name.toLowerCase();
              isActive = status.includes("activo") || status.includes("vigente");
            } else if (typeof contract.status === "string") {
              const status = contract.status.toLowerCase();
              isActive =
                status.includes("vigente") || status.includes("activo");
            } else {
              // Si el backend no provee estado explícito, asumimos activo para no bloquear
              isActive = true;
            }

            return {
              id,
              code,
              name,
              isActive,
              startDate: start,
              endDate: end,
            };
          })
          .filter((contract) => contract.id && contract.startDate);

        if (!mappedContracts || mappedContracts.length === 0) {
          setErrorMessage(
            "El empleado no tiene contratos registrados. No es posible generar la nómina."
          );
          setShowErrorModal(true);
          return;
        }

        setEmployeeContracts(mappedContracts);

        const activeContract =
          mappedContracts.find((contract) => contract.isActive) ||
          mappedContracts[0];

        setSelectedContractId(String(activeContract.id));
        setStartDate(activeContract.startDate);
        setEndDate(activeContract.endDate);
        setCalendarMonth(
          activeContract.startDate
            ? new Date(activeContract.startDate)
            : new Date()
        );
      } catch (error) {
        console.error("Error fetching employee contract history", error);
        const backendMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message;
        setErrorMessage(
          backendMessage ||
            "Ocurrió un error al cargar los contratos del empleado. Intente nuevamente."
        );
        setShowErrorModal(true);
      }
    };

    loadContracts();
  }, [isOpen, employee]);

  useEffect(() => {
    if (!selectedContract) return;

    setCalendarMonth(new Date(selectedContract.startDate));

    setStartDate((prev) => {
      if (!prev) return selectedContract.startDate;
      if (prev < selectedContract.startDate || prev > selectedContract.endDate) {
        return "";
      }
      return prev;
    });

    setEndDate((prev) => {
      if (!prev) return selectedContract.endDate;
      if (prev < selectedContract.startDate || prev > selectedContract.endDate) {
        return "";
      }
      return prev;
    });

    setErrors((prev) => ({
      ...prev,
      startDate: "",
      endDate: "",
      dateRange: "",
      contract: "",
    }));
  }, [selectedContract]);

  const handleContractChange = (value) => {
    setSelectedContractId(value);
    setErrors((prev) => ({ ...prev, contract: "" }));
  };

  const handleDateChange = (field, value) => {
    if (field === "startDate") {
      setStartDate(value);
      setErrors((prev) => ({ ...prev, startDate: "", dateRange: "" }));
    } else {
      setEndDate(value);
      setErrors((prev) => ({ ...prev, endDate: "", dateRange: "" }));
    }
  };

  const hasChanges = () => {
    if (selectedContractId || startDate || endDate) return true;
    if (hasAdjustments) return true;
    return false;
  };

  const handleCancel = () => {
    if (hasChanges()) {
      setShowCancelConfirm(true);
      return;
    }
    onClose?.();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!employee) {
      newErrors.employee = "No se encontró la información del empleado.";
    }

    if (!selectedContract) {
      newErrors.contract = "Debe seleccionar un contrato.";
    }

    if (!hasActiveContract) {
      newErrors.contract =
        "El empleado debe tener al menos un contrato o 'Otro Sí' activo para generar la nómina.";
    }

    if (!startDate) {
      newErrors.startDate = "Debe seleccionar la fecha de inicio.";
    }

    if (!endDate) {
      newErrors.endDate = "Debe seleccionar la fecha de fin.";
    }

    if (startDate && endDate && startDate > endDate) {
      newErrors.dateRange =
        "La fecha de inicio no puede ser posterior a la fecha final.";
    }

    if (selectedContract && startDate && endDate) {
      const contractStart = selectedContract.startDate;
      const contractEnd = selectedContract.endDate || null;

      if (startDate < contractStart) {
        newErrors.dateRange =
          "Las fechas deben estar dentro de la vigencia del contrato seleccionado.";
      }

      if (contractEnd && endDate > contractEnd) {
        newErrors.dateRange =
          "Las fechas deben estar dentro de la vigencia del contrato seleccionado.";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return false;
    }

    if (!canGeneratePayroll) {
      setErrorMessage(
        "No tiene permisos para generar la nómina individual de este empleado."
      );
      setShowErrorModal(true);
      return false;
    }

    if (employee && selectedContract) {
      const exists = (generatedPayrolls || []).some(
        (payroll) =>
          payroll.employeeId === employee.id &&
          payroll.contractId === selectedContract.id &&
          payroll.startDate === startDate &&
          payroll.endDate === endDate
      );

      if (exists) {
        setErrorMessage(
          "Ya existe una nómina generada para este empleado en el periodo seleccionado."
        );
        setShowErrorModal(true);
        return false;
      }
    }

    return true;
  };

  const proceedGeneratePayroll = async () => {
    if (!validateForm()) return;

    if (!employee || !selectedContract) return;

    setLoading(true);

    const mapDeductions = (items) => {
      return (items || []).map((d) => ({
        deduction_type: d.nombreId != null ? Number(d.nombreId) : null,
        amount_type: d.tipoMonto === "PERCENT" ? "Porcentaje" : "fijo",
        amount_value: parseFloat(d.valorMonto),
        application_deduction_type:
          d.aplicacion === "BASE"
            ? "SalarioBase"
            : d.aplicacion === "HOUR"
            ? "SalarioHora"
            : "SalarioFinal",
        start_date_deduction: d.fechaInicio || null,
        end_date_deductions: d.fechaFin || null,
        description: d.descripcion,
        amount: parseFloat(d.cantidad) || 1,
      }));
    };

    const mapIncrements = (items) => {
      return (items || []).map((i) => ({
        increase_type: i.nombreId != null ? Number(i.nombreId) : null,
        amount_type: i.tipoMonto === "PERCENT" ? "Porcentaje" : "fijo",
        amount_value: parseFloat(i.valorMonto),
        application_increase_type:
          i.aplicacion === "BASE"
            ? "SalarioBase"
            : i.aplicacion === "HOUR"
            ? "SalarioHora"
            : "SalarioFinal",
        start_date_increase: i.fechaInicio || null,
        end_date_increase: i.fechaFin || null,
        description: i.descripcion,
        amount: parseFloat(i.cantidad) || 1,
      }));
    };

    try {
      const payload = {
        id_employee: employee.id,
        contract_code: selectedContract.code,
        start_date: startDate,
        end_date: endDate,
        additional_deductions: mapDeductions(adjustments.deductions),
        additional_increases: mapIncrements(adjustments.increments),
      };

      const response = await generateIndividualPayroll(payload);

      if (response?.success) {
        const backendPayroll = response.data || {};

        const payrollRecord = {
          id: backendPayroll.payroll_id || backendPayroll.id || Date.now(),
          employeeId: employee.id,
          employeeName: employee.fullName,
          contractId: selectedContract.id,
          contractCode: backendPayroll.contract_code || selectedContract.code,
          startDate,
          endDate,
          createdAt:
            backendPayroll.creation_date ||
            backendPayroll.created_at ||
            new Date().toISOString(),
          createdBy:
            backendPayroll.responsible_user?.name ||
            backendPayroll.created_by ||
            "backend",
          baseSalary: backendPayroll.base_salary,
          timeWorked: backendPayroll.time_worked,
          totalDeductions: backendPayroll.total_deductions,
          totalIncrements: backendPayroll.total_increments,
          netPay: backendPayroll.net_pay,
          adjustments: {
            deductions: adjustments.deductions || [],
            increments: adjustments.increments || [],
          },
        };

        if (onRegisterPayroll) {
          onRegisterPayroll(payrollRecord);
        }

        setShowSuccessModal(true);
      } else {
        const backendMessage = response?.message || response?.error;
        setErrorMessage(
          backendMessage ||
            "No fue posible generar la nómina. Intente nuevamente."
        );
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Error generating individual payroll", error);
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      setErrorMessage(
        backendMessage ||
          "Ocurrió un error al generar la nómina individual. Verifique la información e intente nuevamente."
      );
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateClick = () => {
    if (!validateForm()) return;

    if (!hasAdjustments) {
      setShowNoAdjustmentsConfirm(true);
      return;
    }

    proceedGeneratePayroll();
  };

  const changeMonth = (direction) => {
    setCalendarMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const buildCalendarDays = () => {
    const days = [];
    const year = calendarMonth.getFullYear();
    const monthIndex = calendarMonth.getMonth();

    const firstDayOfMonth = new Date(year, monthIndex, 1);
    const dayOfWeek = firstDayOfMonth.getDay();
    const totalDays = new Date(year, monthIndex + 1, 0).getDate();

    for (let i = 0; i < dayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= totalDays; day++) {
      days.push(new Date(year, monthIndex, day));
    }

    return days;
  };

  const isDayInSelectedRange = (date) => {
    if (!date || !startDate || !endDate) return false;

    const dayStr = formatDateISO(date);
    return dayStr >= startDate && dayStr <= endDate;
  };

  if (!isOpen) return null;

  const minDate = selectedContract?.startDate || "";
  const maxDate = selectedContract?.endDate || "";

  const calendarDays = buildCalendarDays();

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && handleCancel()}
      >
        <div className="card-theme rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-primary">
            <h2 className="text-2xl font-bold text-primary">
              Generación de nómina
            </h2>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-hover rounded-full transition-colors cursor-pointer"
              aria-label="Cerrar modal de generación de nómina"
            >
              <FiX className="w-6 h-6 text-secondary" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[calc(95vh-90px)]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGenerateClick();
              }}
              className="p-6 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Nombre completo del empleado
                  </label>
                  <input
                    type="text"
                    value={employee?.fullName || ""}
                    readOnly
                    className="input-theme bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={employee?.position || ""}
                    readOnly
                    className="input-theme bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Contrato *
                </label>
                <select
                  value={selectedContractId}
                  onChange={(e) => handleContractChange(e.target.value)}
                  className={`input-theme ${
                    errors.contract ? "border-red-500" : ""
                  }`}
                  disabled={employeeContracts.length === 0}
                >
                  <option value="">
                    {employeeContracts.length === 0
                      ? "Sin contratos disponibles"
                      : "Seleccione un contrato"}
                  </option>
                  {employeeContracts.map((contract) => (
                    <option key={contract.id} value={contract.id}>
                      {contract.code} - {contract.name} ({" "}
                      {contract.isActive ? "Vigente" : "Finalizado"})
                    </option>
                  ))}
                </select>
                {errors.contract && (
                  <p className="text-red-500 text-xs mt-1">{errors.contract}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Fecha de inicio *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) =>
                        handleDateChange("startDate", e.target.value)
                      }
                      min={minDate}
                      max={maxDate}
                      className={`input-theme ${
                        errors.startDate ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.startDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.startDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Fecha final *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) =>
                        handleDateChange("endDate", e.target.value)
                      }
                      min={minDate}
                      max={maxDate}
                      className={`input-theme ${
                        errors.endDate ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.endDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>

              {errors.dateRange && (
                <p className="text-red-500 text-xs">{errors.dateRange}</p>
              )}

              <p className="text-xs text-secondary">
                Las fechas deben estar dentro de la vigencia del contrato
                seleccionado.
              </p>

              <div>
                <h3 className="text-sm font-medium text-primary mb-2">
                  Periodo seleccionado
                </h3>
                <div className="card-theme p-4">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={() => changeMonth(-1)}
                      className="p-2 rounded-full hover:bg-hover transition-colors"
                      aria-label="Mes anterior"
                    >
                      <FiChevronLeft className="w-4 h-4 text-secondary" />
                    </button>
                    <div className="text-sm font-semibold text-primary">
                      {getMonthLabel(calendarMonth)}
                    </div>
                    <button
                      type="button"
                      onClick={() => changeMonth(1)}
                      className="p-2 rounded-full hover:bg-hover transition-colors"
                      aria-label="Mes siguiente"
                    >
                      <FiChevronRight className="w-4 h-4 text-secondary" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-xs text-secondary mb-2">
                    <span>Dom</span>
                    <span>Lun</span>
                    <span>Mar</span>
                    <span>Mié</span>
                    <span>Jue</span>
                    <span>Vie</span>
                    <span>Sáb</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {calendarDays.map((day, index) => {
                      if (!day) {
                        return <div key={index} />;
                      }

                      const isSelected = isDayInSelectedRange(day);

                      return (
                        <div
                          key={index}
                          className={`h-8 flex items-center justify-center rounded-md border text-xs font-medium ${
                            isSelected
                              ? "bg-accent text-white border-accent"
                              : "border-primary text-secondary"
                          }`}
                        >
                          {day.getDate()}
                        </div>
                      );
                    })}
                  </div>

                  <p className="mt-3 text-xs text-secondary">
                    Los días resaltados están incluidos en el periodo de nómina
                    seleccionado.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 pt-6 pb-6 border-t border-primary">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-theme btn-error flex-1"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdjustmentsModalOpen(true)}
                  className="btn-theme btn-secondary flex-1"
                  disabled={loading || !canGeneratePayroll}
                  title={
                    !canGeneratePayroll
                      ? "No tiene permisos para gestionar ajustes adicionales"
                      : "Gestionar ajustes adicionales de esta nómina"
                  }
                >
                  Ajustes adicionales
                </button>
                <button
                  type="submit"
                  className="btn-theme btn-primary flex-1 disabled:opacity-50"
                  disabled={loading || !canGeneratePayroll}
                  title={
                    !canGeneratePayroll
                      ? "No tiene permisos para generar nómina"
                      : ""
                  }
                >
                  {loading ? "Generando..." : "Generar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showNoAdjustmentsConfirm}
        onClose={() => setShowNoAdjustmentsConfirm(false)}
        onConfirm={() => {
          setShowNoAdjustmentsConfirm(false);
          proceedGeneratePayroll();
        }}
        title="Confirmar generación de nómina"
        message="La nómina que se va a generar no cuenta con ajustes adicionales. ¿Estás seguro?"
        confirmText="Generar sin ajustes"
        cancelText="Cancelar"
        confirmColor="btn-primary"
        cancelColor="btn-error"
      />

      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={() => {
          setShowCancelConfirm(false);
          onClose?.();
        }}
        title="Confirmar Acción"
        message="¿Desea descartar los datos ingresados? Los cambios no se guardarán."
        confirmText="Confirmar"
        cancelText="Cancelar"
        confirmColor="btn-primary"
        cancelColor="btn-error"
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose?.();
        }}
        title="Nómina generada correctamente"
        message="La nómina se generó correctamente. Podrá descargar el PDF desde el listado de nóminas cuando esté disponible."
      />

      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="No fue posible generar la nómina"
        message={errorMessage}
        buttonText="Cerrar"
      />

      <IndividualPayrollAdjustmentsModal
        isOpen={isAdjustmentsModalOpen}
        onClose={() => setIsAdjustmentsModalOpen(false)}
        onSave={(ajustes) => {
          const base = ajustes || { deductions: [], increments: [] };
          const timestamp = new Date().toISOString();
          const mapWithMeta = (items, origin) =>
            (items || []).map((item) => ({
              ...item,
              origin,
              createdBy: "mock-user",
              createdAt: timestamp,
            }));

          setAdjustments({
            deductions: mapWithMeta(base.deductions, "MANUAL"),
            increments: mapWithMeta(base.increments, "MANUAL"),
          });
        }}
        initialAdjustments={adjustments}
        payrollStartDate={startDate}
        payrollEndDate={endDate}
        canManagePayroll={canGeneratePayroll}
      />
    </>
  );
};

export default GeneratePayrollModal;
