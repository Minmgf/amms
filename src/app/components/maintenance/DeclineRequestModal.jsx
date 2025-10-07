"use client";
import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import { rejectMaintenanceRequest } from "@/services/maintenanceService";
import {
  SuccessModal,
  ErrorModal,
} from "@/app/components/shared/SuccessErrorModal";
import RequestInfoCard from "@/app/components/maintenance/RequestInfoCard";

const DeclineRequestModal = ({ isOpen, onClose, onDecline, request }) => {
  const [justification, setJustification] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para los modales de feedback
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  if (!isOpen || !request) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleDecline = async () => {
    // Validar que la justificación no esté vacía
    if (!justification.trim()) {
      setError("La justificación es obligatoria");
      return;
    }

    // Validar longitud mínima
    if (justification.trim().length < 10) {
      setError("La justificación debe tener al menos 10 caracteres");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Llamar al servicio para rechazar la solicitud
      const response = await rejectMaintenanceRequest(
        request.id,
        justification.trim()
      );

      // Si la respuesta es exitosa
      if (response.success) {
        // Llamar a la función de rechazo pasada por props con los datos correctos
        await onDecline({
          requestId: request.id,
          justification: justification.trim(),
          response: response,
        });

        // Limpiar campos
        setJustification("");
        setError("");

        // Mostrar modal de éxito con el mensaje del backend
        setModalMessage(response.message || "Solicitud rechazada exitosamente");
        setShowSuccessModal(true);
      }
    } catch (error) {
      let errorMessage =
        "Error al rechazar la solicitud. Por favor, intenta de nuevo.";

      // Manejar errores de validación del backend (422)
      if (error.response?.status === 422) {
        const details = error.response.data?.details;

        if (details?.non_field_errors) {
          errorMessage = details.non_field_errors[0];
        } else if (details?.justification) {
          errorMessage = details.justification[0];
        } else {
          errorMessage = "Error de validación. Por favor, verifica los datos.";
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      // Mostrar modal de error
      setModalMessage(errorMessage);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onClose(); // Cerrar el modal principal después del éxito
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
    // No cerramos el modal principal para que el usuario pueda corregir
  };

  const handleClose = () => {
    setJustification("");
    setError("");
    onClose();
  };

  const maxCharacters = 350;
  const remainingCharacters = maxCharacters - justification.length;

  return (
    <>
      <div
        id="decline-request-modal"
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
        aria-modal="true"
        role="dialog"
      >
        <div
          className="bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-primary">
              Rechazar Solicitud
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Cerrar modal"
              disabled={isSubmitting}
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(95vh-180px)]">
            {/* Request information */}
            <div className="mb-6">
              <RequestInfoCard request={request} showMachineInfo={true} />
            </div>

            {/* Decline Maintenance Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-primary mb-4">
                Rechazar Mantenimiento
              </h3>
              <div>
                <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                  Justificación <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={justification}
                  onChange={(e) => {
                    if (e.target.value.length <= maxCharacters) {
                      setJustification(e.target.value);
                      setError("");
                    }
                  }}
                  disabled={isSubmitting}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none ${
                    error ? "border-red-500" : "border-gray-300"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                  rows={5}
                  placeholder="Ingrese la razón por la cual se rechaza esta solicitud de mantenimiento..."
                  aria-label="Justificación de rechazo"
                />
                <div className="flex items-center justify-between mt-1">
                  <div>
                    {error && (
                      <span className="text-xs text-red-600">{error}</span>
                    )}
                  </div>
                  <span
                    className={`text-xs ${
                      remainingCharacters < 50
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {justification.length}/{maxCharacters} caracteres
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-center gap-4 p-6 border-t border-gray-200">
            <button
              onClick={handleDecline}
              disabled={!justification.trim() || isSubmitting}
              className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
                justification.trim() && !isSubmitting
                  ? "bg-red-500 hover:bg-red-600 cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              aria-label="Confirmar rechazo"
            >
              {isSubmitting ? "Rechazando..." : "Rechazar"}
            </button>
          </div>
        </div>
      </div>

      {/* Modales de feedback */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Solicitud Rechazada"
        message={modalMessage}
      />

      <ErrorModal
        isOpen={showErrorModal}
        onClose={handleErrorModalClose}
        title="Error al Rechazar"
        message={modalMessage}
        buttonText="Entendido"
      />
    </>
  );
};

export default DeclineRequestModal;
