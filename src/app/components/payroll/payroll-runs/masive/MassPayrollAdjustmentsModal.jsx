"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FiX } from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";
import { ErrorModal } from "@/app/components/shared/SuccessErrorModal";
import IndividualPayrollAdjustmentsModal from "@/app/components/payroll/payroll-runs/AdditionalSettingsModal";
import MassiveAdjustmentsUploadModal from "@/app/components/payroll/payroll-runs/masive/MassiveAdjustmentsUploadModal";
import MassiveAdjustmentsProcessingModal from "@/app/components/payroll/payroll-runs/masive/MassiveAdjustmentsProcessingModal";
import { getTypesByCategory } from "@/services/parametrizationService";

const MassPayrollAdjustmentsModal = ({
  isOpen,
  onClose,
  onSave,
  employees = [],
  initialAdjustmentsByEmployee = {},
  initialSelectedEmployeeIds = [],
  payrollStartDate,
  payrollEndDate,
  canManagePayroll = true,
}) => {
  useTheme();

  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [adjustmentsByEmployee, setAdjustmentsByEmployee] = useState({});
  const [isAdditionalModalOpen, setIsAdditionalModalOpen] = useState(false);
  const [adjustMode, setAdjustMode] = useState(null);
  const [activeEmployeeId, setActiveEmployeeId] = useState(null);
  const [currentInitialAdjustments, setCurrentInitialAdjustments] = useState({
    deductions: [],
    increments: [],
  });
  const [lastMassAdjustments, setLastMassAdjustments] = useState({
    deductions: [],
    increments: [],
  });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [lastUploadResult, setLastUploadResult] = useState({
    fileName: "",
    description: "",
    rows: [],
  });

  const [deductionTypes, setDeductionTypes] = useState([]);
  const [incrementTypes, setIncrementTypes] = useState([]);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const [deductions, increments] = await Promise.all([
          getTypesByCategory(18),
          getTypesByCategory(19),
        ]);
        if (deductions.success) setDeductionTypes(deductions.data);
        if (increments.success) setIncrementTypes(increments.data);
      } catch (error) {
        console.error("Error fetching types", error);
      }
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    setSelectedEmployeeIds(initialSelectedEmployeeIds || []);
    setAdjustmentsByEmployee(initialAdjustmentsByEmployee || {});
    setIsAdditionalModalOpen(false);
    setAdjustMode(null);
    setActiveEmployeeId(null);
  }, [isOpen, initialAdjustmentsByEmployee, initialSelectedEmployeeIds]);

  const hasEligibleEmployees = useMemo(
    () => Array.isArray(employees) && employees.length > 0,
    [employees]
  );

  const allEmployeesSelected = useMemo(() => {
    if (!hasEligibleEmployees) return false;
    return selectedEmployeeIds.length === employees.length;
  }, [employees, hasEligibleEmployees, selectedEmployeeIds]);

  const toggleEmployeeSelection = (employeeId) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleOpenUploadModal = () => {
    if (!hasEligibleEmployees) return;
    setIsUploadModalOpen(true);
  };

  const handleProcessMockFile = ({ fileName, description, rows }) => {
    setIsUploadModalOpen(false);
    setLastUploadResult({ fileName, description, rows });
    setIsProcessingModalOpen(true);
  };

  const handleApplyFromProcessing = ({ acceptedRows }) => {
    // Mapear documentos a empleados existentes (mock):
    // asumimos que el "document" de la fila corresponde a employee.document si existiera;
    // para este mock, usaremos el nombre del empleado para encontrarlo.
    const updated = { ...adjustmentsByEmployee };
    const timestamp = new Date().toISOString();

    acceptedRows.forEach((row) => {
      const employee = employees.find(
        (emp) =>
          (emp.fullName &&
            emp.fullName.toLowerCase() === row.employeeName?.toLowerCase()) ||
          (emp.document && String(emp.document) === String(row.document))
      );

      if (!employee) {
        return;
      }

      const existing = updated[employee.id] || {
        deductions: [],
        increments: [],
      };

      let typeId = null;
      if (row.adjustmentType === "deduction" || row.adjustmentType === "deduccion") {
        const type = deductionTypes.find(
          (t) => t.name.toLowerCase() === row.adjustmentName?.toLowerCase()
        );
        typeId = type ? type.id : null;
      } else {
        const type = incrementTypes.find(
          (t) => t.name.toLowerCase() === row.adjustmentName?.toLowerCase()
        );
        typeId = type ? type.id : null;
      }

      const baseAdjustment = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        seleccionado: false,
        nombreId: typeId || row.adjustmentName,
        tipoMonto: row.amountType === "percentage" ? "PERCENT" : "FIXED",
        valorMonto: row.amount,
        aplicacion: row.application === "Salario Final" ? "FINAL" : "BASE",
        cantidad: row.quantity,
        descripcion: row.description || "",
        fechaInicio: row.startDate || "",
        fechaFin: row.endDate || "",
        origin: "EXCEL",
        uploadDescription: lastUploadResult.description || "",
        createdBy: "mock-user",
        createdAt: timestamp,
      };

      if (row.adjustmentType === "deduction" || row.adjustmentType === "deduccion") {
        updated[employee.id] = {
          ...existing,
          deductions: [...(existing.deductions || []), baseAdjustment],
        };
      } else {
        updated[employee.id] = {
          ...existing,
          increments: [...(existing.increments || []), baseAdjustment],
        };
      }
    });

    setAdjustmentsByEmployee(updated);
    setIsProcessingModalOpen(false);
  };

  const toggleSelectAll = () => {
    if (!hasEligibleEmployees) return;
    setSelectedEmployeeIds((prev) =>
      prev.length === employees.length ? [] : employees.map((e) => e.id)
    );
  };

  const getEmployeeAdjustments = (employeeId) => {
    const ajustes = adjustmentsByEmployee?.[employeeId];
    if (!ajustes) {
      return { deductions: [], increments: [] };
    }
    return {
      deductions: ajustes.deductions || [],
      increments: ajustes.increments || [],
    };
  };

  const handleOpenMassAdjust = () => {
    if (selectedEmployeeIds.length === 0) {
      return;
    }
    setAdjustMode("mass");
    setActiveEmployeeId(null);
    setCurrentInitialAdjustments({
      deductions: lastMassAdjustments.deductions || [],
      increments: lastMassAdjustments.increments || [],
    });
    setIsAdditionalModalOpen(true);
  };

  const handleOpenIndividualAdjust = (employeeId) => {
    setAdjustMode("individual");
    setActiveEmployeeId(employeeId);
    setCurrentInitialAdjustments(getEmployeeAdjustments(employeeId));
    setIsAdditionalModalOpen(true);
  };

  const handleSaveAdjustments = (ajustes) => {
    if (!ajustes) {
      return;
    }

    const timestamp = new Date().toISOString();
    const mapWithMeta = (items) =>
      (items || []).map((item) => ({
        ...item,
        origin: "MANUAL",
        createdBy: "mock-user",
        createdAt: timestamp,
      }));

    const normalized = {
      deductions: mapWithMeta(ajustes.deductions),
      increments: mapWithMeta(ajustes.increments),
    };

    if (adjustMode === "mass") {
      setAdjustmentsByEmployee((prev) => {
        const updated = { ...prev };
        selectedEmployeeIds.forEach((employeeId) => {
          updated[employeeId] = {
            deductions: normalized.deductions,
            increments: normalized.increments,
          };
        });
        return updated;
      });
      setLastMassAdjustments({
        deductions: normalized.deductions,
        increments: normalized.increments,
      });
    } else if (adjustMode === "individual" && activeEmployeeId != null) {
      setAdjustmentsByEmployee((prev) => ({
        ...prev,
        [activeEmployeeId]: {
          deductions: mapWithMeta(ajustes.deductions),
          increments: mapWithMeta(ajustes.increments),
        },
      }));
    }
  };

  const handleClose = () => {
    onClose?.();
  };

  const handleApplyAndClose = () => {
    if (onSave) {
      onSave({
        adjustmentsByEmployee,
        selectedEmployeeIds,
      });
    }
  };

  if (!isOpen) return null;

  if (!canManagePayroll) {
    return (
      <ErrorModal
        isOpen={true}
        onClose={onClose}
        title="Acceso restringido"
        message="No tiene permisos para gestionar ajustes adicionales de nómina."
        buttonText="Cerrar"
      />
    );
  }

  return (
    <>
      <div
        className="modal-overlay"
        style={{ padding: "var(--spacing-sm)", zIndex: 60 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        <div
          className="modal-theme"
          style={{
            width: "100%",
            minWidth: "280px",
            maxWidth: "min(95vw, 1200px)",
            maxHeight: "min(95vh, 800px)",
            overflowY: "auto",
            margin: "0 auto",
          }}
        >
          <div className="p-3 sm:p-6 md:p-8 lg:p-theme-xl">
            <div className="flex justify-between items-center mb-4 sm:mb-6 md:mb-8">
              <h2 className="text-lg sm:text-xl md:text-theme-xl font-theme-semibold text-primary">
                Ajuste de nómina masiva
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="text-secondary hover:text-primary cursor-pointer"
                aria-label="Cerrar modal de ajuste de nómina masiva"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="btn-theme btn-primary text-xs px-4 py-2 disabled:opacity-50"
                  onClick={handleOpenMassAdjust}
                  disabled={
                    !hasEligibleEmployees || selectedEmployeeIds.length === 0
                  }
                >
                  Ajuste masivo
                </button>
                <button
                  type="button"
                  className="btn-theme btn-secondary text-xs px-4 py-2"
                  disabled={!hasEligibleEmployees}
                  onClick={handleOpenUploadModal}
                >
                  Cargar ajustes masivos (Excel)
                </button>
              </div>

              <div className="border border-primary rounded-theme-lg overflow-x-auto">
                <div className="min-w-[500px]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-surface text-xs text-secondary border-b border-primary">
                        <th className="px-4 py-2 w-10 text-left">
                          <input
                            type="checkbox"
                            checked={allEmployeesSelected}
                            onChange={toggleSelectAll}
                            disabled={!hasEligibleEmployees}
                            className="cursor-pointer"
                          />
                        </th>
                        <th className="px-4 py-2 text-left">
                          Nombre del empleado
                        </th>
                        <th className="px-4 py-2 w-32 text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {!hasEligibleEmployees && (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 py-4 text-xs text-secondary"
                          >
                            No hay empleados disponibles para el cargo y rango
                            seleccionados.
                          </td>
                        </tr>
                      )}
                      {hasEligibleEmployees &&
                        employees.map((employee) => {
                          const isSelected = selectedEmployeeIds.includes(
                            employee.id
                          );
                          return (
                            <tr
                              key={employee.id}
                              className="border-b border-primary/40 last:border-b-0"
                            >
                              <td className="px-4 py-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() =>
                                    toggleEmployeeSelection(employee.id)
                                  }
                                  className="cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-2 text-sm text-primary">
                                {employee.fullName}
                              </td>
                              <td className="px-4 py-2 text-right">
                                <button
                                  type="button"
                                  className="btn-theme btn-secondary text-xs px-3 py-1"
                                  onClick={() =>
                                    handleOpenIndividualAdjust(employee.id)
                                  }
                                >
                                  Ajustar
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-primary mt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-theme btn-error flex-1 sm:flex-none sm:min-w-[140px]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleApplyAndClose}
                  className="btn-theme btn-primary flex-1 sm:flex-none sm:min-w-[180px]"
                  disabled={!hasEligibleEmployees}
                >
                  Guardar ajustes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <IndividualPayrollAdjustmentsModal
        isOpen={isAdditionalModalOpen}
        onClose={() => setIsAdditionalModalOpen(false)}
        onSave={handleSaveAdjustments}
        initialAdjustments={currentInitialAdjustments}
        payrollStartDate={payrollStartDate}
        payrollEndDate={payrollEndDate}
        canManagePayroll={canManagePayroll}
      />

      <MassiveAdjustmentsUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onProcessMockFile={handleProcessMockFile}
        payrollStartDate={payrollStartDate}
        payrollEndDate={payrollEndDate}
        canManagePayroll={canManagePayroll}
        employees={employees}
      />

      <MassiveAdjustmentsProcessingModal
        isOpen={isProcessingModalOpen}
        onClose={() => setIsProcessingModalOpen(false)}
        fileName={lastUploadResult.fileName}
        description={lastUploadResult.description}
        rows={lastUploadResult.rows}
        onUploadNewFile={() => {
          setIsProcessingModalOpen(false);
          setIsUploadModalOpen(true);
        }}
        onAcceptAndContinue={handleApplyFromProcessing}
      />
    </>
  );
};

export default MassPayrollAdjustmentsModal;

