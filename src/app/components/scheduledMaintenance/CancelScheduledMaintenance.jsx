"use client";
import React from "react";
import { FiX } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { cancelScheduledMaintenance } from "@/services/maintenanceService";

const MAX_CHARS = 350;

const CancelScheduledMaintenance = ({
  isOpen,
  onClose,
  maintenanceData = {},
  onSuccess,
  onError,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      justification: ""
    }
  });

  const justification = watch("justification", "");

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      const response = await cancelScheduledMaintenance(
        maintenanceData.id, 
        {justification: data.justification}
      );

      if (response.success) {
        onSuccess?.(response.message || "Mantenimiento cancelado con éxito");
        reset();
        onClose();
      } else {
        // Manejar diferentes tipos de errores
        let errorMessage = response.message || response.detail || "Error al cancelar el mantenimiento";

        switch (response.status) {
          case 401:
            errorMessage = response.message || "Sesión expirada. Por favor, inicia sesión nuevamente.";
            break;
          case 403:
            errorMessage = response.message || "No tienes permisos para cancelar mantenimientos programados.";
            break;
          case 404:
            errorMessage = response.detail || "Mantenimiento no encontrado.";
            break;
          case 422:
            // Manejo específico de errores de validación
            if (response.details) {
              if (response.details.non_field_errors && response.details.non_field_errors.length > 0) {
                errorMessage = response.details.non_field_errors[0];
              } else if (response.details.justification && response.details.justification.length > 0) {
                errorMessage = response.details.justification[0];
              } else {
                errorMessage = response.message || "Error de validación";
              }
            } else {
              errorMessage = response.message || "Error de validación";
            }
            break;
          case 500:
            errorMessage = response.message || "Error en el servidor. Intenta nuevamente más tarde.";
            break;
        }

        setApiError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMsg = "Error inesperado. Por favor, intenta nuevamente.";
      setApiError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) onClose();
  };

  const handleClose = () => {
    if (!isLoading) {
      setApiError(null);
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={handleBackdropClick}
      id="Cancel Scheduled Maintenance Modal"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-background rounded-xl shadow-2xl w-full max-w-full max-h-[95vh] overflow-y-auto sm:max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-gray-200 sm:px-6 sm:py-5">
          <h2 className="text-lg font-bold text-primary sm:text-xl">
            Cancelar Mantenimiento
          </h2>
          <button
            aria-label="Close Modal Button"
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isLoading}
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Request information card */}
        <section className="card-theme mt-3 mx-2 mb-3 px-3 py-3 sm:mt-6 sm:mx-6 sm:mb-4 sm:px-6 sm:py-4">
          <div className="font-theme-semibold text-theme-base mb-3 sm:mb-4">
            Información de la solicitud
          </div>
          <div className="grid grid-cols-1 gap-y-2 text-sm sm:grid-cols-2 sm:gap-x-6">
            <div>
              <span className="text-theme-sm text-secondary">Número Serial</span>
              <div className="font-theme-medium">
                {maintenanceData?.machinery?.serial || "N/A"}
              </div>
            </div>
            <div>
              <span className="text-theme-sm text-secondary">Nombre de la Máquina</span>
              <div className="font-theme-medium">
                {maintenanceData?.machinery?.name || "N/A"}
              </div>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <span className="text-theme-sm text-secondary">Fecha de Solicitud</span>
              <div className="font-theme-medium">
                {maintenanceData?.request_creation_date 
                  ? new Date(maintenanceData.request_creation_date).toLocaleDateString('es-ES')
                  : "N/A"}
              </div>
            </div>
          </div>
        </section>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <section className="card-theme mx-2 mb-3 px-3 py-3 sm:mx-6 sm:mb-4 sm:px-6 sm:py-4">
            <div className="font-theme-semibold text-theme-base mb-2 sm:mb-3">
              Cancelar Mantenimiento Programado
            </div>
            <label className="text-theme-sm text-secondary mb-2 sm:mb-3">
              Justificación
            </label>
            <textarea
              {...register("justification", {
                required: "Este campo es obligatorio",
                maxLength: {
                  value: MAX_CHARS,
                  message: `Máximo ${MAX_CHARS} caracteres`
                }
              })}
              className={`parametrization-input w-full text-secondary px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-none ${
                errors.justification ? "border-red-500" : ""
              } sm:px-3 sm:py-2`}
              aria-label="Justification Textarea"
              rows={3}
              placeholder="Explique el motivo de la cancelación..."
              maxLength={MAX_CHARS}
              disabled={isLoading}
            />
            <div className="flex flex-col items-start gap-1 mt-1 sm:flex-row sm:justify-between sm:items-center">
              {errors.justification && (
                <span className="text-xs text-red-500">
                  {errors.justification.message}
                </span>
              )}
              <span className="text-xs text-gray-300 sm:ml-auto">
                {justification.length}/{MAX_CHARS} caracteres
              </span>
            </div>
          </section>

          {/* Mensaje de error de API */}
          {apiError && (
            <div className="mx-2 mb-3 sm:mx-6">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {apiError}
              </div>
            </div>
          )}
          
          <div className="flex flex-col gap-1 justify-center mb-3 sm:flex-row sm:gap-4 sm:mt-3 sm:mb-3">
            <button
              type="submit"
              className="btn-error btn-theme w-full px-4 py-2 font-semibold rounded-lg sm:w-80 sm:px-8 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Cancel Scheduled Maintenance Button"
              disabled={isLoading}
            >
              {isLoading ? "Cancelando..." : "Cancelar Mantenimiento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelScheduledMaintenance;