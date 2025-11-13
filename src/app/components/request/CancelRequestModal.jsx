"use client";
import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FaTimes } from "react-icons/fa";
import { ErrorModal } from "@/app/components/shared/SuccessErrorModal";
import { cancelRequest } from "@/services/requestService";

const CancelRequestModal = ({ isOpen, onClose, request, onSuccess }) => {
  const [justification, setJustification] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!request) return null;

  const handleConfirm = async () => {
    if (!justification.trim()) {
      setErrorMessage("Por favor, ingrese un motivo de cancelación");
      setIsErrorModalOpen(true);
      return;
    }

    if (justification.length > 500) {
      setErrorMessage("El motivo de cancelación no puede exceder los 500 caracteres");
      setIsErrorModalOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await cancelRequest(request.requestId || request.id, justification);

      // Cerrar el modal de cancelación
      onClose();

      // Resetear el formulario
      setJustification("");

      // Llamar al callback de éxito con el código de la solicitud
      if (onSuccess) {
        onSuccess(response.id_request || request.requestCode);
      }
    } catch (error) {
      let errorMsg = "Error al cancelar la solicitud. Por favor, intente de nuevo.";
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Manejar errores de validación
        if (errorData.errors) {
          if (errorData.errors.non_field_errors) {
            errorMsg = errorData.errors.non_field_errors[0];
          } else if (errorData.errors.completion_cancellation_observations) {
            errorMsg = "La justificación es obligatoria.";
          } else {
            errorMsg = errorData.message || errorMsg;
          }
        } else if (errorData.message) {
          errorMsg = errorData.message;
        }
      }

      setErrorMessage(errorMsg);
      setIsErrorModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setJustification("");
    onClose();
  };

  const remainingChars = 500 - justification.length;

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-[60]" />
        <Dialog.Content className="modal-theme fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <Dialog.Title className="text-2xl font-semibold text-primary">
              Cancelar solicitud
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Cerrar modal"
                className="p-2 text-secondary hover:text-primary rounded-full transition-colors cursor-pointer"
                onClick={handleClose}
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <Dialog.Description className="sr-only">
            Formulario para cancelar una solicitud de servicio. Debe proporcionar una justificación obligatoria.
          </Dialog.Description>
          <div className="p-6">
            {/* Mensaje de confirmación */}
            <div className="mb-6">
              <p className="text-base text-primary mb-2">
                ¿Está seguro de que desea cancelar esta solicitud?
              </p>
              <p className="text-sm text-error font-medium">
                Esta acción no se puede revertir.
              </p>
            </div>

            {/* Campo de justificación */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-primary mb-3">
                Justificación <span className="text-error">*</span>
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Ingrese el motivo de cancelación..."
                maxLength={500}
                rows={6}
                className="input-theme resize-none"
                style={{ padding: '0.75rem 1rem' }}
                aria-label="Campo de justificación de cancelación"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-secondary">
                  Campo obligatorio. Máximo 500 caracteres.
                </p>
                <p className={`text-xs font-medium ${remainingChars < 50 ? 'text-error' : 'text-secondary'}`}>
                  {remainingChars}/500 caracteres
                </p>
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="flex gap-3 p-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="btn-theme btn-error w-1/2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Cancelar operación"
              type="button"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting || !justification.trim()}
              className="btn-theme btn-primary w-1/2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Confirmar cancelación"
              type="button"
            >
              {isSubmitting ? "Procesando..." : "Confirmar"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      {/* Modal de Error */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title="Error"
        message={errorMessage}
      />
    </Dialog.Root>
  );
};

export default CancelRequestModal;
