"use client";
import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FaTimes, FaCheckCircle } from "react-icons/fa";
import { completeRequest } from "@/services/requestService";
import { ErrorModal } from "@/app/components/shared/SuccessErrorModal";

/**
 * Modal para completar una solicitud
 * Permite ingresar observaciones de finalización
 * La fecha, hora y usuario se registran automáticamente en el backend
 * 
 * @param {boolean} isOpen - Estado de apertura del modal
 * @param {function} onClose - Función para cerrar el modal
 * @param {object} request - Objeto de la solicitud a completar
 * @param {function} onSuccess - Callback al completar exitosamente
 */
const CompleteRequestModal = ({ isOpen, onClose, request, onSuccess }) => {
  const [observations, setObservations] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!request) return null;

  const handleConfirm = async () => {
    // Validar campo obligatorio
    if (!observations.trim()) {
      setErrorMessage("Las observaciones son obligatorias para completar la solicitud.");
      setIsErrorModalOpen(true);
      return;
    }

    // Validar longitud de observaciones
    if (observations.length > 500) {
      setErrorMessage("Las observaciones no pueden exceder los 500 caracteres.");
      setIsErrorModalOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await completeRequest(request.requestCode || request.id, {
        completion_cancellation_observations: observations.trim()
      });

      if (response.success) {
        // Cerrar el modal
        handleClose();

        // Llamar al callback de éxito con el código de la solicitud
        if (onSuccess) {
          onSuccess(response.id_request || request.requestCode);
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.errors?.non_field_errors?.[0] ||
                      error.response?.data?.errors?.completion_cancellation_observations?.[0] ||
                      "Error al completar la solicitud. Por favor, intente de nuevo.";
      
      setErrorMessage(errorMsg);
      setIsErrorModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setObservations("");
    onClose();
  };

  const remainingChars = 500 - observations.length;

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={handleClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-[60]" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] modal-theme rounded-xl shadow-2xl w-full max-w-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <Dialog.Title className="text-2xl font-bold parametrization-text">
                Completar Solicitud
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  aria-label="Cerrar modal"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                  onClick={handleClose}
                >
                  <FaTimes className="w-5 h-5 text-secondary" />
                </button>
              </Dialog.Close>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Información de la solicitud */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium parametrization-text">
                      Solicitud: <span className="font-bold">{request.requestCode || request.id}</span>
                    </p>
                    <p className="text-xs text-secondary mt-1">
                      La fecha, hora y usuario se registrarán automáticamente al completar la solicitud.
                    </p>
                  </div>
                </div>
              </div>

              {/* Campo de observaciones */}
              <div className="mb-2">
                <label className="block text-sm font-medium parametrization-text mb-3">
                  Observaciones de Finalización <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Ingrese las observaciones sobre la finalización de la solicitud. Este campo es obligatorio."
                  maxLength={500}
                  rows={6}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background parametrization-text focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  aria-label="Observaciones de finalización"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-secondary">
                    Campo obligatorio. Máximo 500 caracteres.
                  </p>
                  <p className={`text-xs font-medium ${remainingChars < 50 ? 'text-red-600' : 'text-secondary'}`}>
                    {remainingChars}/500 caracteres
                  </p>
                </div>
              </div>
            </div>

            {/* Footer con botones */}
            <div className="flex gap-3 p-6 border-t border-border">
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Cancelar"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSubmitting || !observations.trim()}
                className="flex-1 px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Confirmar completar solicitud"
              >
                {isSubmitting ? "Procesando..." : "Confirmar"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal de error */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title="Error"
        message={errorMessage}
      />
    </>
  );
};

export default CompleteRequestModal;
