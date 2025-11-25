"use client";

import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { ConfirmModal } from "@/app/components/shared/SuccessErrorModal";

/**
 * Modal para finalizar contrato de empleado - HU-EMP-005
 * Permite seleccionar motivo de terminación y agregar descripción opcional
 */
export default function EndContractModal({
  isOpen = false,
  onClose = () => {},
  onConfirm = () => {},
  contractData = null,
  employeeData = null,
  terminationReasons = [],
  loading = false
}) {
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState({});

  // Resetear formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setSelectedReason("");
      setDescription("");
      setShowConfirmation(false);
      setErrors({});
    }
  }, [isOpen]);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedReason) {
      newErrors.reason = "Debe seleccionar un motivo de terminación";
    }
    
    if (description.length > 255) {
      newErrors.description = "La descripción no puede exceder 255 caracteres";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = () => {
    if (!validateForm()) return;
    setShowConfirmation(true);
  };

  // Confirmar finalización
  const handleConfirm = () => {
    const formData = {
      contract_termination_reason: selectedReason,
      observation: description.trim(),
      contractId: contractData?.id || contractData?.contract_code, // Fallback if id is missing
      employeeId: employeeData?.employeeId || employeeData?.id
    };
    
    onConfirm(formData);
  };

  // Cancelar operación
  const handleCancel = () => {
    setShowConfirmation(false);
    setSelectedReason("");
    setDescription("");
    setErrors({});
    onClose();
  };

  // Volver al formulario desde confirmación
  const handleBack = () => {
    setShowConfirmation(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40" 
        onClick={handleCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="modal-theme relative w-[min(700px,95%)] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">
            Terminar Contrato
          </h2>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Cerrar modal"
          >
            <FiX className="w-6 h-6 text-gray-500" />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          {/* Formulario de finalización - Layout vertical */}
          <div className="space-y-6">
            {/* Select de motivo de terminación */}
            <div className="space-y-3">
              <label className="block text-base font-medium text-gray-700">
                Selecciona una razón para la terminación
              </label>
              <div className="relative">
                <select
                  value={selectedReason}
                  onChange={(e) => {
                    setSelectedReason(e.target.value);
                    if (errors.reason) {
                      setErrors(prev => ({ ...prev, reason: null }));
                    }
                  }}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${errors.reason ? 'border-red-500' : ''}`}
                  disabled={loading}
                >
                  <option value="">
                    {loading ? "Cargando razones..." : "Seleccione una razón"}
                  </option>
                  {terminationReasons.map((reason) => (
                    <option key={reason.id || reason.id_types} value={reason.id || reason.id_types}>
                      {reason.name || reason.typeName}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.reason && (
                <p className="text-sm text-red-600">{errors.reason}</p>
              )}
            </div>

            {/* Descripción de la novedad */}
            <div className="space-y-3">
              <label className="block text-base font-medium text-gray-700">
                Observación (Opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) {
                    setErrors(prev => ({ ...prev, description: null }));
                  }
                }}
                placeholder="Ingrese una observación sobre la terminación del contrato..."
                rows={4}
                maxLength={255}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${errors.description ? 'border-red-500' : ''}`}
                disabled={loading}
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {description.length}/255 caracteres
                </span>
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center gap-4 p-6 border-t border-gray-200">
          {/* Botones del formulario - Ocupan todo el ancho */}
          <button
            onClick={handleCancel}
            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
            disabled={loading || !selectedReason}
          >
            {loading ? "Procesando..." : "Confirmar"}
          </button>
        </footer>
      </div>

      {/* Modal de confirmación usando ConfirmModal */}
      <ConfirmModal
        isOpen={showConfirmation}
        onClose={handleBack}
        onConfirm={handleConfirm}
        title="Confirmar Acción"
        message="¿Está seguro de finalizar este contrato? Esta acción no se puede deshacer."
        confirmText="Confirmar"
        cancelText="Cancelar"
        confirmColor="btn-primary"
        cancelColor="btn-error"
      />
    </div>
  );
}
