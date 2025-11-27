"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";
import {
  SuccessModal,
  ErrorModal,
  ConfirmModal,
} from "@/app/components/shared/SuccessErrorModal";
import MassPayrollAdjustmentsModal from "@/app/components/payroll/payroll-runs/masive/MassPayrollAdjustmentsModal";
import { getDepartments, getPositions } from "@/services/employeeService";
import {
  getPayrollApplicableEmployees,
  generateMassivePayroll,
} from "@/services/payrollService";

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

const hasActiveContractInRange = (employee, startDate, endDate) => {
  if (!employee?.contracts || !startDate || !endDate) return false;
  return employee.contracts.some((contract) => {
    if (!contract.isActive) return false;
    return contract.startDate <= startDate && contract.endDate >= endDate;
  });
};

const hasExistingPayrollInRange = (employee, startDate, endDate) => {
  if (!employee?.previousPayrolls) return false;
  return employee.previousPayrolls.some(
    (payroll) => payroll.startDate === startDate && payroll.endDate === endDate
  );
};

const GenerateMassPayrollModal = ({
  isOpen,
  onClose,
  canGeneratePayroll = true,
  onRegisterMassPayroll,
}) => {
  useTheme();

  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedChargeId, setSelectedChargeId] = useState("");
  const [departments, setDepartments] = useState([]);
  const [charges, setCharges] = useState([]);
  const [applicableEmployees, setApplicableEmployees] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [adjustmentsByEmployee, setAdjustmentsByEmployee] = useState({});
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [isAdjustmentsModalOpen, setIsAdjustmentsModalOpen] = useState(false);

  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  const [showNoAdjustmentsConfirm, setShowNoAdjustmentsConfirm] =
    useState(false);
  const [showExistingPayrollConfirm, setShowExistingPayrollConfirm] =
    useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [conflictEmployees, setConflictEmployees] = useState([]);
  const [generatedMassPayrolls, setGeneratedMassPayrolls] = useState([]);

  const hasAdjustments = useMemo(() => {
    const entries = Object.values(adjustmentsByEmployee || {});
    return entries.some((ajustes) => {
      const d = ajustes?.deductions || [];
      const i = ajustes?.increments || [];
      return d.length > 0 || i.length > 0;
    });
  }, [adjustmentsByEmployee]);

  const resetState = () => {
    setSelectedDepartmentId("");
    setSelectedChargeId("");
    setStartDate("");
    setEndDate("");
    setErrors({});
    setLoading(false);
    setAdjustmentsByEmployee({});
    setSelectedEmployeeIds([]);
    setIsAdjustmentsModalOpen(false);
    setShowNoAdjustmentsConfirm(false);
    setShowExistingPayrollConfirm(false);
    setShowCancelConfirm(false);
    setShowSuccessModal(false);
    setShowErrorModal(false);
    setErrorMessage("");
    setConflictEmployees([]);
    setApplicableEmployees([]);
  };

  useEffect(() => {
    if (!isOpen) {
      resetState();
      return;
    }

    resetState();

    const fetchDepartments = async () => {
      try {
        const response = await getDepartments();
        if (response.success) {
          setDepartments(response.data);
        }
      } catch (error) {
        console.error("Error fetching departments", error);
      }
    };
    fetchDepartments();

    const defaultStart = new Date().toISOString().split("T")[0];
    const defaultEnd = new Date().toISOString().split("T")[0];
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
    setCalendarMonth(new Date(defaultStart));
  }, [isOpen]);

  useEffect(() => {
    if (!selectedDepartmentId) {
      setCharges([]);
      return;
    }
    const fetchCharges = async () => {
      try {
        const response = await getPositions(selectedDepartmentId);
        if (response.success) {
          setCharges(response.data);
        }
      } catch (error) {
        console.error("Error fetching charges", error);
      }
    };
    fetchCharges();
  }, [selectedDepartmentId]);

  useEffect(() => {
    if (!selectedChargeId || !startDate || !endDate) {
      setApplicableEmployees([]);
      return;
    }
    const fetchEmployees = async () => {
      try {
        const response = await getPayrollApplicableEmployees(
          selectedChargeId,
          startDate,
          endDate
        );
        if (response.success) {
          const mappedEmployees = response.data.map((emp) => ({
            id: emp.id_employee,
            fullName: emp.full_name,
            document: emp.document_number,
            chargeId: emp.charge_id,
            status: emp.status_name,
            email: emp.email,
          }));
          setApplicableEmployees(mappedEmployees);
        }
      } catch (error) {
        console.error("Error fetching applicable employees", error);
        setApplicableEmployees([]);
      }
    };
    fetchEmployees();
  }, [selectedChargeId, startDate, endDate]);

  const employeesData = useMemo(() => {
    return {
      employeesForCharge: applicableEmployees,
      eligibleEmployees: applicableEmployees,
      employeesWithExistingPayrolls: [], // Handled by backend validation
    };
  }, [applicableEmployees]);

  const hasChanges = () => {
    if (selectedDepartmentId || selectedChargeId || startDate || endDate)
      return true;
    if (hasAdjustments) return true;
    if (selectedEmployeeIds.length > 0) return true;
    return false;
  };

  const handleCancel = () => {
    if (hasChanges()) {
      setShowCancelConfirm(true);
      return;
    }
    onClose?.();
  };

  const handleDepartmentChange = (value) => {
    setSelectedDepartmentId(value);
    setSelectedChargeId("");
    setErrors((prev) => ({ ...prev, department: "", charge: "" }));
  };

  const handleChargeChange = (value) => {
    setSelectedChargeId(value);
    setErrors((prev) => ({ ...prev, charge: "" }));
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

  const validateForm = () => {
    const newErrors = {};

    if (!selectedDepartmentId) {
      newErrors.department = "Debe seleccionar un departamento.";
    }

    if (!selectedChargeId) {
      newErrors.charge = "Debe seleccionar un cargo.";
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

    if (startDate && endDate && selectedChargeId) {
      if (!applicableEmployees || applicableEmployees.length === 0) {
        newErrors.dateRange =
          "No hay empleados activos con contrato vigente en el periodo seleccionado.";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return false;
    }

    if (!canGeneratePayroll) {
      setErrorMessage(
        "No tiene permisos para generar la nómina masiva para este cargo."
      );
      setShowErrorModal(true);
      return false;
    }

    return true;
  };

  const proceedGenerateMassPayroll = async ({ excludeConflicts = false } = {}) => {
    const employeesToProcess =
      selectedEmployeeIds.length > 0
        ? applicableEmployees.filter((emp) => selectedEmployeeIds.includes(emp.id))
        : applicableEmployees;

    if (!employeesToProcess || employeesToProcess.length === 0) {
      setErrorMessage(
        "No hay empleados seleccionados para generar la nómina masiva."
      );
      setShowErrorModal(true);
      return;
    }

    setLoading(true);

    const payloadEmployees = employeesToProcess.map((emp) => {
      const adjustments = adjustmentsByEmployee[emp.id] || {};
      const deductions = (adjustments.deductions || []).map((d) => ({
        deduction_type: d.nombreId, // Assuming nombreId holds the ID
        amount_type: d.tipoMonto === "PERCENT" ? "Porcentaje" : "Monto fijo",
        amount_value: parseFloat(d.valorMonto),
        application_deduction_type:
          d.aplicacion === "BASE" ? "SalarioBase" : "SalarioFinal",
        start_date_deduction: d.fechaInicio || null,
        end_date_deductions: d.fechaFin || null,
        description: d.descripcion,
        amount: parseFloat(d.cantidad) || 1,
      }));

      const increases = (adjustments.increments || []).map((i) => ({
        increase_type: i.nombreId, // Assuming nombreId holds the ID
        amount_type: i.tipoMonto === "PERCENT" ? "Porcentaje" : "Monto fijo",
        amount_value: parseFloat(i.valorMonto),
        application_increase_type:
          i.aplicacion === "BASE" ? "SalarioBase" : "SalarioFinal",
        start_date_increase: i.fechaInicio || null,
        end_date_increase: i.fechaFin || null,
        description: i.descripcion,
        amount: parseFloat(i.cantidad) || 1,
      }));

      return {
        employee_id: emp.id,
        increases,
        deductions,
      };
    });

    const payload = {
      start_date: startDate,
      end_date: endDate,
      id_employee_department: parseInt(selectedDepartmentId),
      id_employee_charge: parseInt(selectedChargeId),
      exclude_conflicts: excludeConflicts,
      employees: payloadEmployees,
    };

    try {
      const response = await generateMassivePayroll(payload);
      if (response.success) {
        setSuccessMessage(response.message);
        setShowSuccessModal(true);
        if (onRegisterMassPayroll) {
          onRegisterMassPayroll(response.data);
        }
      }
    } catch (error) {
      console.error("Error generating massive payroll", error);
      if (error.response?.status === 400 && error.response?.data?.errors?.employees?.rejected) {
        const rejected = error.response.data.errors.employees.rejected;
        setConflictEmployees(rejected.map(r => ({
            id: r.employee_id,
            fullName: r.employee_name,
            reason: r.reason
        })));
        setShowExistingPayrollConfirm(true);
      } else {
        setErrorMessage(
          error.response?.data?.message ||
            "Ocurrió un error al generar la nómina masiva."
        );
        setShowErrorModal(true);
      }
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

    proceedGenerateMassPayroll({ excludeConflicts: false });
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

  const buildExistingPayrollMessage = () => {
    if (!startDate || !endDate || conflictEmployees.length === 0) return null;

    const formatDisplayDate = (isoDate) => {
      const [year, month, day] = isoDate.split("-");
      return `${day}/${month}/${year}`;
    };

    const formattedStart = formatDisplayDate(startDate);
    const formattedEnd = formatDisplayDate(endDate);

    return (
      <div className="text-left">
        <p className="text-secondary text-sm mb-4 leading-relaxed">
          Los siguientes empleados no pueden ser procesados por las siguientes razones ({formattedStart}-{formattedEnd}):
        </p>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-h-60 overflow-y-auto">
          {conflictEmployees.map((emp, index) => (
            <div
              key={emp.id || index}
              className={`px-4 py-3 ${
                index < conflictEmployees.length - 1
                  ? "border-b border-gray-200"
                  : ""
              }`}
            >
              <div className="text-sm font-medium text-primary">
                {emp.fullName}
              </div>
              <div className="text-xs text-secondary">{emp.reason || "Conflicto detectado"}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  const calendarDays = buildCalendarDays();
  const eligibleEmployees = employeesData?.eligibleEmployees || [];
  const effectiveSelectedEmployeeIds =
    selectedEmployeeIds && selectedEmployeeIds.length > 0
      ? selectedEmployeeIds
      : eligibleEmployees.map((emp) => emp.id);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && handleCancel()}
      >
        <div className="card-theme rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-primary">
            <h2 className="text-2xl font-bold text-primary">
              Generación de nómina masiva
            </h2>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-hover rounded-full transition-colors cursor-pointer"
              aria-label="Cerrar modal de generación de nómina masiva"
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
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Departamento *
                </label>
                <select
                  value={selectedDepartmentId}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className={`input-theme ${
                    errors.department ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Seleccione un departamento</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.department}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Cargo *
                </label>
                <select
                  value={selectedChargeId}
                  onChange={(e) => handleChargeChange(e.target.value)}
                  className={`input-theme ${
                    errors.charge ? "border-red-500" : ""
                  }`}
                  disabled={!selectedDepartmentId}
                >
                  <option value="">Seleccione un cargo</option>
                  {charges.map((charge) => (
                    <option key={charge.id} value={charge.id}>
                      {charge.name}
                    </option>
                  ))}
                </select>
                {errors.charge && (
                  <p className="text-red-500 text-xs mt-1">{errors.charge}</p>
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
                Las fechas deben estar dentro de la vigencia de los contratos
                activos asociados al cargo seleccionado.
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
                  disabled={
                    loading || !canGeneratePayroll || eligibleEmployees.length === 0
                  }
                  title={
                    !canGeneratePayroll
                      ? "No tiene permisos para gestionar ajustes adicionales"
                      : eligibleEmployees.length === 0
                      ? "No hay empleados disponibles para aplicar ajustes masivos"
                      : "Gestionar ajustes adicionales de esta nómina masiva"
                  }
                >
                  Ajustes de nómina masiva
                </button>
                <button
                  type="submit"
                  className="btn-theme btn-primary flex-1 disabled:opacity-50"
                  disabled={loading || !canGeneratePayroll}
                  title={
                    !canGeneratePayroll
                      ? "No tiene permisos para generar nómina masiva"
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
          proceedGenerateWithEmployees();
        }}
        title="Confirmar acción"
        message="La nómina masiva que se va a generar no cuenta con ajustes adicionales. ¿Estás seguro?"
        confirmText="Confirmar"
        cancelText="Cancelar"
        confirmColor="btn-primary"
        cancelColor="btn-error"
      />

      <ConfirmModal
        isOpen={showExistingPayrollConfirm}
        onClose={() => setShowExistingPayrollConfirm(false)}
        onConfirm={() => {
          setShowExistingPayrollConfirm(false);
          proceedGenerateWithEmployees({ excludeExisting: true });
        }}
        title="Confirmar acción"
        message={buildExistingPayrollMessage()}
        confirmText="Excluir y continuar"
        cancelText="Cancelar"
        confirmColor="btn-primary"
        cancelColor="btn-error"
        maxWidthClass="max-w-md"
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
        title="Nómina masiva generada correctamente"
        message={successMessage || "La nómina masiva se generó correctamente. Podrá descargar los PDFs individuales desde el listado de nóminas cuando esté disponible."}
      />

      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="No fue posible generar la nómina masiva"
        message={errorMessage}
        buttonText="Cerrar"
      />

      <MassPayrollAdjustmentsModal
        isOpen={isAdjustmentsModalOpen}
        onClose={() => setIsAdjustmentsModalOpen(false)}
        employees={eligibleEmployees}
        initialAdjustmentsByEmployee={adjustmentsByEmployee}
        initialSelectedEmployeeIds={effectiveSelectedEmployeeIds}
        payrollStartDate={startDate}
        payrollEndDate={endDate}
        canManagePayroll={canGeneratePayroll}
        onSave={({
          adjustmentsByEmployee: newAdjustmentsByEmployee,
          selectedEmployeeIds: newSelectedEmployeeIds,
        }) => {
          setAdjustmentsByEmployee(newAdjustmentsByEmployee || {});
          setSelectedEmployeeIds(newSelectedEmployeeIds || []);
          setIsAdjustmentsModalOpen(false);
        }}
      />
    </>
  );
};

export default GenerateMassPayrollModal;

