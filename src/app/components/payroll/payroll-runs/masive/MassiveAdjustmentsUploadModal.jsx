"use client";

import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";
import { ConfirmModal, ErrorModal } from "@/app/components/shared/SuccessErrorModal";
import { uploadMassiveAdjustments } from "@/services/payrollService";

const MassiveAdjustmentsUploadModal = ({
  isOpen,
  onClose,
  onProcessMockFile,
  payrollStartDate,
  payrollEndDate,
  canManagePayroll = true,
  employees = [],
}) => {
  useTheme();

  const [selectedFileName, setSelectedFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const hasChanges = !!selectedFileName;

  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelConfirm(true);
      return;
    }
    onClose?.();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
    } else {
      setSelectedFileName("");
    }
  };

  const validateBeforeUpload = () => {
    if (!selectedFileName) {
      setErrorMessage("Debe seleccionar un archivo Excel para continuar.");
      setErrorOpen(true);
      return false;
    }

    if (!canManagePayroll) {
      setErrorMessage(
        "No tiene permisos para realizar el cargue de ajustes masivos de nómina."
      );
      setErrorOpen(true);
      return false;
    }

    return true;
  };

  const normalizeAdjustmentType = (rawType) => {
    const value = (rawType || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // Backend puede enviar "incremento", "increment", etc.
    if (value.includes("increment")) return "increment";

    // Para deducciones: "deduccion", "deducción" u otras variantes
    return "deduction";
  };

  const normalizeAmountType = (rawType) => {
    const value = (rawType || "").toLowerCase();

    // Backend documentado: "porcentaje" / "fijo". Otros tipos ("monetario", "dias", etc.)
    // los tratamos como monto fijo para efectos de visualización.
    if (value.includes("porcen")) return "percentage";
    return "fixed";
  };

  const handleUploadClick = async () => {
    if (!validateBeforeUpload()) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const formattedEmployees = employees.map((emp) => ({
        id_employee: emp.id,
        document_number: emp.document || emp.documentNumber || String(emp.id),
      }));

      const fileInput = document.querySelector('input[type="file"]');
      const file = fileInput?.files?.[0];

      if (!file) {
        setErrorMessage("No se encontró el archivo seleccionado.");
        setErrorOpen(true);
        setLoading(false);
        return;
      }

      const response = await uploadMassiveAdjustments(
        file,
        payrollStartDate,
        payrollEndDate,
        formattedEmployees
      );

      if (response.success) {
        const root = response || {};
        const inner = root.data || root;
        const apiResults = inner.results || [];
        const batchId = inner.batch_id || null;

        const mappedRows = apiResults.map((row, index) => ({
          id: index,
          document: row.employee_identification,
          employeeName: row.employee_name,
          adjustmentName: row.adjustment_name,
          adjustmentType: normalizeAdjustmentType(row.adjustment_type),
          amountType: normalizeAmountType(row.amount_type),
          amount: parseFloat(row.amount_value),
          application: row.application_type,
          quantity: parseFloat(row.amount),
          startDate: row.start_date_adjustment,
          endDate: row.end_date_adjustment,
          description: row.description,
          status: row.status?.toLowerCase() === "aceptado" ? "accepted" : "rejected",
          rejectionReason: row.reason_rejection,
        }));

        if (onProcessMockFile) {
          onProcessMockFile({
            fileName: selectedFileName,
            description: "",
            rows: mappedRows,
            batchId: batchId,
          });
        }
      } else {
        const root = response || {};
        const inner = root.data || root;
        const apiResults = inner.results || [];
        const batchId = inner.batch_id || null;

        // Caso: success = false pero el backend devuelve resultados detallados
        // (por ejemplo, todas las filas rechazadas). Debemos mostrar igualmente
        // el modal de resultados.
        if (apiResults.length > 0 && onProcessMockFile) {
          const mappedRows = apiResults.map((row, index) => ({
            id: index,
            document: row.employee_identification,
            employeeName: row.employee_name,
            adjustmentName: row.adjustment_name,
            adjustmentType: normalizeAdjustmentType(row.adjustment_type),
            amountType: normalizeAmountType(row.amount_type),
            amount: parseFloat(row.amount_value),
            application: row.application_type,
            quantity: parseFloat(row.amount),
            startDate: row.start_date_adjustment,
            endDate: row.end_date_adjustment,
            description: row.description,
            status:
              row.status?.toLowerCase() === "aceptado" ||
              row.status?.toLowerCase() === "accepted"
                ? "accepted"
                : "rejected",
            rejectionReason: row.reason_rejection,
          }));

          onProcessMockFile({
            fileName: selectedFileName,
            description: "",
            rows: mappedRows,
            batchId: batchId,
          });
        } else {
          const backendMessage = response.error || response.message;
          setErrorMessage(
            backendMessage || "Error al procesar el archivo."
          );
          setErrorOpen(true);
        }
      }
    } catch (error) {
      console.error(error);
      const data = error.response?.data;
      const inner = data?.data || {};
      const apiResults = inner.results || [];
      const batchId = inner.batch_id || null;

      // Caso especial: todas las filas rechazadas pero el backend devuelve
      // el detalle de resultados (results). Debemos mostrar el modal de
      // procesamiento con la tabla de filas rechazadas, incluso si success=false
      // o el estado HTTP es 400.
      if (apiResults.length > 0 && onProcessMockFile) {
        const mappedRows = apiResults.map((row, index) => ({
          id: index,
          document: row.employee_identification,
          employeeName: row.employee_name,
          adjustmentName: row.adjustment_name,
          adjustmentType: normalizeAdjustmentType(row.adjustment_type),
          amountType: normalizeAmountType(row.amount_type),
          amount: parseFloat(row.amount_value),
          application: row.application_type,
          quantity: parseFloat(row.amount),
          startDate: row.start_date_adjustment,
          endDate: row.end_date_adjustment,
          description: row.description,
          status:
            row.status?.toLowerCase() === "aceptado" ||
            row.status?.toLowerCase() === "accepted"
              ? "accepted"
              : "rejected",
          rejectionReason: row.reason_rejection,
        }));

        onProcessMockFile({
          fileName: selectedFileName,
          description: "",
          rows: mappedRows,
          batchId: batchId,
        });
      } else {
        const backendMessage = data?.error || data?.message;
        setErrorMessage(
          backendMessage ||
            "Ocurrió un error al cargar el archivo. Verifique su conexión o el formato del archivo."
        );
        setErrorOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
        style={{ zIndex: 70 }}
        onClick={(e) => e.target === e.currentTarget && handleCancel()}
      >
        <div
          className="card-theme rounded-xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-hidden"
          style={{ zIndex: 71 }}
        >
          <div className="flex items-center justify-between p-4 border-b border-primary">
            <h2 className="text-lg sm:text-xl font-semibold text-primary">
              Importar ajustes masivos
            </h2>
            <button
              type="button"
              onClick={handleCancel}
              className="p-2 hover:bg-hover rounded-full transition-colors cursor-pointer"
              aria-label="Cerrar modal de cargue de ajustes masivos"
            >
              <FiX className="w-5 h-5 text-secondary" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Campo de archivo */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Documento Excel
              </label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center px-4 py-2 rounded-lg border border-primary bg-surface text-sm cursor-pointer hover:bg-hover">
                  <span className="mr-2">📄</span>
                  <span>Seleccionar archivo</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
                <span className="text-xs text-secondary truncate">
                  {selectedFileName || "Ningún archivo seleccionado"}
                </span>
              </div>
            </div>

            {/* Mensaje importante */}
            <div className="mt-2 border border-dashed border-primary/50 rounded-lg p-3 flex items-start gap-3 bg-surface">
              <div className="mt-0.5 text-secondary">
                ℹ️
              </div>
              <div className="text-xs text-secondary leading-relaxed">
                Use un archivo Excel con el formato de ajustes masivos de nómina.
                Debe contener todas las columnas obligatorias (identificación y nombre del empleado,
                nombre del ajuste, tipo de ajuste, tipo de monto, valor, aplicación, cantidad,
                fechas de inicio/fin y descripción). Si falta alguna columna o el formato es inválido,
                el sistema rechazará el archivo y mostrará el detalle del error.
              </div>
            </div>

            {/* Rango de nómina visible como referencia */}
            {payrollStartDate && payrollEndDate && (
              <p className="text-[11px] text-secondary mt-1">
                Rango de nómina: <span className="font-medium">{payrollStartDate}</span>
                {" - "}
                <span className="font-medium">{payrollEndDate}</span>
              </p>
            )}

            {/* Footer */}
            <div className="flex justify-between gap-3 pt-4 border-t border-primary mt-2">
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
                onClick={handleUploadClick}
                className="btn-theme btn-primary flex-1 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Cargando..." : "Cargar archivo"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmación de cancelar */}
      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={() => {
          setShowCancelConfirm(false);
          onClose?.();
        }}
        title="Confirmar acción"
        message="¿Desea descartar la carga de ajustes masivos? Los datos no se guardarán."
        confirmText="Confirmar"
        cancelText="Cancelar"
        confirmColor="btn-primary"
        cancelColor="btn-error"
      />

      {/* Errores */}
      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="No fue posible cargar el archivo"
        message={errorMessage}
        buttonText="Cerrar"
      />
    </>
  );
};

// Construye filas mock de ejemplo con estados aceptado/rechazado
const buildMockRows = (payrollStartDate, payrollEndDate) => {
  return [
    {
      id: 1,
      document: "1234567890",
      employeeName: "Juan Perez Garcia",
      adjustmentName: "Productivity Bonus",
      adjustmentType: "increment",
      amountType: "percentage",
      amount: 15,
      application: "Salario Base",
      quantity: 1,
      startDate: payrollStartDate || "2026-01-01",
      endDate: payrollEndDate || "2026-01-31",
      description: "Example",
      status: "rejected",
      rejectionReason: "Empleado no existe en el sistema.",
    },
    {
      id: 2,
      document: "9876543210",
      employeeName: "Maria Rodriguez Lopez",
      adjustmentName: "Overtime",
      adjustmentType: "increment",
      amountType: "fixed",
      amount: 150000,
      application: "Salario Base",
      quantity: 8,
      startDate: payrollStartDate || "2026-01-01",
      endDate: payrollEndDate || "2026-01-31",
      description: "Example",
      status: "accepted",
      rejectionReason: "",
    },
  ];
};

export default MassiveAdjustmentsUploadModal;
