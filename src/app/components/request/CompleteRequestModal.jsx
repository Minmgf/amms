"use client";
import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FaTimes, FaCheckCircle, FaExclamationTriangle, FaTools } from "react-icons/fa";
import { completeRequest, createMaintenanceFromServiceRequest } from "@/services/requestService";

/**
 * Modal para completar una solicitud
 * 
 * Flujo de completado:
 * 1. Crear solicitudes de mantenimiento automático (OBLIGATORIO)
 * 2. Si el paso 1 tiene éxito, completar la solicitud
 * 
 * Permite ingresar:
 * - Fecha de inicio real (manual)
 * - Fecha de finalización real (manual)
 * - Observaciones obligatorias de finalización
 * 
 * @param {boolean} isOpen - Estado de apertura del modal
 * @param {function} onClose - Función para cerrar el modal
 * @param {object} request - Objeto de la solicitud a completar (requiere requestCode o id)
 * @param {function} onSuccess - Callback al completar exitosamente (recibe requestId y maintenanceResponse)
 */
const CompleteRequestModal = ({ isOpen, onClose, request, onSuccess }) => {
  const [observations, setObservations] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [maintenanceInfo, setMaintenanceInfo] = useState(null);
  const [currentStep, setCurrentStep] = useState(""); // Para mostrar el paso actual del proceso

  // Inicializar fechas cuando se abre el modal
  React.useEffect(() => {
    if (isOpen) {
      // Obtener fecha actual en formato YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      setStartDate(request?.scheduledStartDate || today);
      setEndDate(today);
      setMaintenanceInfo(null);
      setCurrentStep("");
      setError("");
    }
  }, [isOpen, request]);

  if (!request) return null;

  const handleConfirm = async () => {
    // Validar que las observaciones no estén vacías
    if (!observations.trim()) {
      setError("Las observaciones son obligatorias");
      return;
    }

    // Validar que las fechas estén completas
    if (!startDate) {
      setError("La fecha de inicio real es obligatoria");
      return;
    }

    if (!endDate) {
      setError("La fecha de finalización real es obligatoria");
      return;
    }

    // Validar que la fecha de fin no sea anterior a la fecha de inicio
    if (new Date(endDate) < new Date(startDate)) {
      setError("La fecha de finalización no puede ser anterior a la fecha de inicio");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMaintenanceInfo(null);

    try {
      const requestId = request.requestCode || request.id;
      
      // PASO 1: Crear solicitudes de mantenimiento automático (OBLIGATORIO)
      console.log('🔧 Paso 1: Creando solicitudes de mantenimiento automático...');
      setCurrentStep("Creando solicitudes de mantenimiento automático...");
      
      let maintenanceResponse;
      try {
        maintenanceResponse = await createMaintenanceFromServiceRequest(requestId);
        console.log('✅ Mantenimiento automático creado exitosamente:', maintenanceResponse);
        setMaintenanceInfo(maintenanceResponse.data);
      } catch (maintenanceError) {
        console.error('❌ Error al crear mantenimiento automático:', maintenanceError);
        
        // Si falla el mantenimiento automático, NO continuar con completar solicitud
        if (maintenanceError.response?.data?.message) {
          setError(`Error al crear mantenimiento automático: ${maintenanceError.response.data.message}`);
        } else if (maintenanceError.response?.data?.error) {
          setError(`Error al crear mantenimiento automático: ${maintenanceError.response.data.error}`);
        } else {
          setError('Error al crear solicitudes de mantenimiento automático. No se puede completar la solicitud sin este paso.');
        }
        return; // Detener la ejecución aquí
      }

      // PASO 2: Si el mantenimiento automático fue exitoso, completar la solicitud
      console.log('🔄 Paso 2: Completando solicitud...');
      setCurrentStep("Completando solicitud...");
      
      const response = await completeRequest(requestId, {
        observations: observations.trim(),
        startDate: startDate,
        endDate: endDate
      });
      
      console.log('✅ Solicitud completada:', response);

      // Resetear el formulario
      setObservations("");
      setStartDate("");
      setEndDate("");
      setCurrentStep("");
      
      // Cerrar el modal
      onClose();

      // Llamar al callback de éxito con el código de la solicitud
      if (onSuccess) {
        onSuccess(response.id_request || requestId, maintenanceResponse);
      }
    } catch (error) {
      console.error('❌ Error al completar solicitud:', error);
      
      // Manejar errores del backend
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (errors.non_field_errors) {
          setError(errors.non_field_errors.join(' '));
        } else if (errors.completion_cancellation_observations) {
          setError(errors.completion_cancellation_observations.join(' '));
        } else {
          setError('Error al completar la solicitud. Por favor, intente nuevamente.');
        }
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 403) {
        setError('No tiene permisos para completar solicitudes');
      } else if (error.response?.status === 404) {
        setError('Solicitud no encontrada');
      } else {
        setError('Error al completar la solicitud. Por favor, intente nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
      setCurrentStep("");
    }
  };

  const handleClose = () => {
    setObservations("");
    setStartDate("");
    setEndDate("");
    setError("");
    setMaintenanceInfo(null);
    setCurrentStep("");
    onClose();
  };

  const remainingChars = 500 - observations.length;

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal-theme fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-primary">
            <Dialog.Title className="text-theme-2xl font-theme-bold text-primary">
              Completar Solicitud
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Cerrar modal"
                className="p-2 hover:bg-hover rounded-full transition-colors cursor-pointer"
                onClick={handleClose}
              >
                <FaTimes className="w-5 h-5 text-secondary" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Información de la solicitud */}
            {request && (
              <div className="mb-4 p-3 card-secondary rounded-theme-lg">
                <p className="text-theme-sm text-secondary">
                  <span className="font-theme-semibold text-primary">Solicitud:</span> {request.requestCode || request.id}
                </p>
                <p className="text-theme-sm text-secondary">
                  <span className="font-theme-semibold text-primary">Cliente:</span> {request.client?.name || 'N/A'}
                </p>
              </div>
            )}

            {/* Campos de fechas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Fecha de inicio real */}
              <div>
                <label className="block text-theme-sm font-theme-medium text-primary mb-2">
                  Fecha de Inicio Real <span className="text-error">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setError("");
                  }}
                  className="parametrization-input"
                  aria-label="Fecha de inicio real"
                  disabled={isSubmitting}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Fecha de finalización real */}
              <div>
                <label className="block text-theme-sm font-theme-medium text-primary mb-2">
                  Fecha de Finalización Real <span className="text-error">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setError("");
                  }}
                  className="parametrization-input"
                  aria-label="Fecha de finalización real"
                  disabled={isSubmitting}
                  min={startDate}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Indicador de progreso durante el envío */}
            {isSubmitting && currentStep && (
              <div className="mb-4 p-4 card-secondary rounded-theme-lg border border-primary">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  <div>
                    <p className="text-theme-sm font-theme-semibold text-primary">{currentStep}</p>
                    <p className="text-theme-xs text-secondary mt-1">
                      Por favor, espere mientras se procesa su solicitud...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Información de mantenimiento creado (éxito) */}
            {maintenanceInfo && maintenanceInfo.count > 0 && (
              <div className="mb-4 p-4 bg-surface border border-success rounded-theme-lg">
                <div className="flex items-start gap-3">
                  <FaTools className="text-success mt-0.5 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <p className="text-theme-sm font-theme-semibold text-success mb-2">
                      Se crearon {maintenanceInfo.count} solicitud(es) de mantenimiento automático
                    </p>
                    <div className="space-y-2">
                      {maintenanceInfo.requests?.map((req, index) => (
                        <div key={index} className="text-theme-xs bg-background p-2 rounded-theme">
                          <p className="font-theme-medium text-primary">
                            <span className="text-secondary">Solicitud:</span> {req.id}
                          </p>
                          <p className="text-secondary mt-1 line-clamp-2">
                            {req.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Campo de observaciones OBLIGATORIO */}
            <div className="mb-2">
              <label className="block text-theme-sm font-theme-medium text-primary mb-3">
                Observaciones de Finalización <span className="text-error">*</span>
              </label>
              <textarea
                value={observations}
                onChange={(e) => {
                  setObservations(e.target.value);
                  setError(""); // Limpiar error al escribir
                }}
                placeholder="Describa el trabajo realizado, resultados obtenidos y cualquier observación relevante sobre la finalización del servicio..."
                maxLength={500}
                rows={7}
                className={`parametrization-input resize-none ${
                  error ? 'border-error' : ''
                }`}
                aria-label="Observaciones de finalización"
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-theme-xs text-error font-theme-medium">
                  Campo obligatorio. Mínimo 1 carácter, máximo 500.
                </p>
                <p className={`text-theme-xs font-theme-medium ${remainingChars < 50 ? 'text-error' : 'text-secondary'}`}>
                  {remainingChars}/500 caracteres
                </p>
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="mt-4 p-3 bg-surface border border-error rounded-theme-lg">
                <div className="flex items-start gap-2">
                  <FaExclamationTriangle className="text-error mt-0.5 flex-shrink-0" />
                  <p className="text-theme-sm text-error">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer con botones */}
          <div className="flex gap-3 p-6 border-t border-primary">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="btn-theme btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Cancelar"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting || !observations.trim() || !startDate || !endDate}
              className="btn-theme btn-success flex-1 disabled:opacity-50 disabled:cursor-not-allowed gap-2"
              aria-label="Completar solicitud"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Completar Solicitud
                </>
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CompleteRequestModal;

