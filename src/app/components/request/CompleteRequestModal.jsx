"use client";
import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FaTimes, FaCalendarAlt, FaClock } from "react-icons/fa";

/**
 * Modal para completar una solicitud
 * Permite ingresar fecha, hora de finalización y observaciones
 * 
 * @param {boolean} isOpen - Estado de apertura del modal
 * @param {function} onClose - Función para cerrar el modal
 * @param {object} request - Objeto de la solicitud a completar
 * @param {function} onSuccess - Callback al completar exitosamente
 */
const CompleteRequestModal = ({ isOpen, onClose, request, onSuccess }) => {
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [observations, setObservations] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!request) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);

    try {
      // TODO: Aquí iría la llamada al API para completar la solicitud
      // const response = await completeRequest(request.id, { endDate, endTime, observations });

      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Cerrar el modal
      onClose();

      // Resetear el formulario
      setEndDate("");
      setEndTime("");
      setObservations("");

      // Llamar al callback de éxito con el código de la solicitud
      if (onSuccess) {
        onSuccess(request.requestCode);
      }
    } catch (error) {
      alert("Error al completar la solicitud. Por favor, intente de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEndDate("");
    setEndTime("");
    setObservations("");
    onClose();
  };

  const remainingChars = 500 - observations.length;

  // Obtener fecha y hora actual en formato para los inputs
  const now = new Date();
  const maxDate = now.toISOString().split('T')[0];
  const maxTime = now.toTimeString().slice(0, 5);

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-[60]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-background rounded-xl shadow-2xl w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Dialog.Title className="text-2xl font-bold text-primary">
              Completar Solicitud
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
            {/* Campos de fecha y hora */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Fecha de finalización */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  <FaCalendarAlt className="inline mr-2 text-accent" />
                  Fecha de Finalización <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  max={maxDate}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                  aria-label="Fecha de finalización"
                />
              </div>

              {/* Hora de finalización */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  <FaClock className="inline mr-2 text-accent" />
                  Hora de Finalización <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                  aria-label="Hora de finalización"
                />
              </div>
            </div>

            {/* Campo de observaciones */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-primary mb-3">
                Observaciones
              </label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Ingrese observaciones sobre la realización de la solicitud..."
                maxLength={500}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent resize-none transition-colors"
                aria-label="Observaciones"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-secondary">
                  Campo opcional. Máximo 500 caracteres.
                </p>
                <p className={`text-xs font-medium ${remainingChars < 50 ? 'text-red-600' : 'text-secondary'}`}>
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
              aria-label="Cancelar"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting || !endDate || !endTime}
              className="flex-1 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Confirmar completar solicitud"
            >
              {isSubmitting ? "Procesando..." : "Confirmar"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CompleteRequestModal;

