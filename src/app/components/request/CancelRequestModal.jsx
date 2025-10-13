"use client";
import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FaTimes } from "react-icons/fa";

const CancelRequestModal = ({ isOpen, onClose, request, onSuccess }) => {
  const [justification, setJustification] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!request) return null;

  const handleConfirm = async () => {
    if (!justification.trim()) {
      alert("Por favor, ingrese un motivo de cancelación");
      return;
    }

    if (justification.length > 500) {
      alert("El motivo de cancelación no puede exceder los 500 caracteres");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Aquí iría la llamada al API para cancelar la solicitud
      // const response = await cancelRequest(request.id, justification);

      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Cerrar el modal de cancelación
      onClose();

      // Resetear el formulario
      setJustification("");

      // Llamar al callback de éxito con el código de la solicitud
      if (onSuccess) {
        onSuccess(request.requestCode);
      }
    } catch (error) {
      console.error("Error al cancelar solicitud:", error);
      alert("Error al cancelar la solicitud. Por favor, intente de nuevo.");
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
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-background rounded-xl shadow-2xl w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Dialog.Title className="text-2xl font-bold text-primary">
              Cancelar solicitud
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Cerrar modal"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                onClick={handleClose}
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Mensaje de confirmación */}
            <div className="mb-6">
              <p className="text-base text-primary mb-2">
                ¿Está seguro de que desea cancelar esta solicitud?
              </p>
              <p className="text-sm text-red-600 font-medium">
                Esta acción no se puede revertir.
              </p>
            </div>

            {/* Campo de justificación */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-primary mb-3">
                Justificación <span className="text-red-500">*</span>
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Ingrese el motivo de cancelación..."
                maxLength={500}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Campo obligatorio. Máximo 500 caracteres.
                </p>
                <p className={`text-xs font-medium ${remainingChars < 50 ? 'text-red-600' : 'text-gray-500'}`}>
                  {remainingChars}/500 caracteres
                </p>
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="flex gap-3 p-6 border-t border-gray-200">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting || !justification.trim()}
              className="flex-1 px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Procesando..." : "Confirmar"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CancelRequestModal;
