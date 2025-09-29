"use client";
import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import { rejectMaintenanceRequest } from "@/services/maintenanceService";
import { SuccessModal, ErrorModal } from "@/app/components/shared/SuccessErrorModal";

const DeclineRequestModal = ({
  isOpen,
  onClose,
  onDecline,
  request
}) => {
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
        // Llamar a la función de rechazo pasada por props
        onDecline({
          requestId: request.id,
          justification: justification.trim(),
          response: response
        });

        // Limpiar campos
        setJustification("");
        setError("");
        
        // Mostrar modal de éxito
        setModalMessage(response.message || "Solicitud rechazada exitosamente");
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error al rechazar solicitud:", error);
      
      let errorMessage = "Error al rechazar la solicitud. Por favor, intenta de nuevo.";
      
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

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ', ' + date.toLocaleTimeString('es-ES', { 
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Obtener badge de estado
  const getStatusBadge = (status) => {
    const statusColors = {
      'Pendiente': 'bg-yellow-100 text-yellow-800',
      'Programado': 'bg-blue-100 text-blue-800',
      'En Progreso': 'bg-purple-100 text-purple-800',
      'Completado': 'bg-green-100 text-green-800',
      'Rechazado': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
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
          className="bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
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
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Request information */}
            <section className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Información de la Solicitud
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-600 block mb-1">Número Consecutivo</span>
                  <div className="text-sm font-medium text-gray-900">{request.id || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-600 block mb-1">Fecha de Solicitud</span>
                  <div className="text-sm font-medium text-gray-900">{formatDate(request.request_date)}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-600 block mb-1">Solicitante</span>
                  <div className="text-sm font-medium text-gray-900">{request.requester || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-600 block mb-1">Estado</span>
                  <div className="mt-1">
                    {getStatusBadge(request.status)}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-600 block mb-1">Número de Serie</span>
                  <div className="text-sm font-medium text-gray-900">{request.serial_number || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-600 block mb-1">Nombre de Máquina</span>
                  <div className="text-sm font-medium text-gray-900">{request.machine_name || 'N/A'}</div>
                </div>
              </div>
            </section>

            {/* Decline Maintenance Section */}
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Rechazar Mantenimiento
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    error ? 'border-red-500' : 'border-gray-300'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  rows={5}
                  placeholder="Ingrese la razón por la cual se rechaza esta solicitud de mantenimiento..."
                  aria-label="Justificación de rechazo"
                />
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-xs ${remainingCharacters < 50 ? 'text-red-600' : 'text-gray-500'}`}>
                    {remainingCharacters}/{maxCharacters} caracteres
                  </span>
                  {error && (
                    <span className="text-xs text-red-600">{error}</span>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-center">
            <button
              onClick={handleDecline}
              disabled={!justification.trim() || isSubmitting}
              className={`px-8 py-2.5 rounded-lg font-semibold text-white transition-colors ${
                justification.trim() && !isSubmitting
                  ? 'bg-red-500 hover:bg-red-600 cursor-pointer' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
              aria-label="Confirmar rechazo"
            >
              {isSubmitting ? 'Rechazando...' : 'Rechazar'}
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