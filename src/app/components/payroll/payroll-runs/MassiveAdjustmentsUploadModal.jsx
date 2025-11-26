"use client";

import React, { useMemo, useState } from "react";
import { FiX } from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";
import { ConfirmModal, ErrorModal } from "@/app/components/shared/SuccessErrorModal";

const MassiveAdjustmentsUploadModal = ({
  isOpen,
  onClose,
  onProcessMockFile,
  payrollStartDate,
  payrollEndDate,
  canManagePayroll = true,
}) => {
  useTheme();

  const [selectedFileName, setSelectedFileName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const hasChanges = useMemo(() => {
    return !!selectedFileName || !!description;
  }, [selectedFileName, description]);

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
    if (!description.trim()) {
      setErrorMessage("Debe ingresar una descripción para continuar.");
      setErrorOpen(true);
      return false;
    }

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

  const handleUploadClick = () => {
    if (!validateBeforeUpload()) return;

    setLoading(true);

    // Simulación de procesamiento mock del archivo
    setTimeout(() => {
      setLoading(false);

      const mockRows = buildMockRows(payrollStartDate, payrollEndDate);

      if (onProcessMockFile) {
        onProcessMockFile({
          fileName: selectedFileName,
          description: description.trim(),
          rows: mockRows,
        });
      }
    }, 800);
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
          className="card-theme rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden"
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

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Descripción *
              </label>
              <textarea
                className="input-theme text-sm resize-none h-20"
                placeholder="Describe el propósito de estos ajustes masivos"
                maxLength={255}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Mensaje importante */}
            <div className="mt-2 border border-dashed border-primary/50 rounded-lg p-3 flex items-start gap-3 bg-surface">
              <div className="mt-0.5 text-secondary">ℹ️</div>
              <div className="text-xs text-secondary leading-relaxed">
                Cargue un archivo .xlsx que respete la estructura definida. El
                archivo debe incluir las columnas requeridas y los tipos de dato
                especificados (documento del empleado, novedad, tipo, valor,
                aplicación, fechas y descripción).
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
