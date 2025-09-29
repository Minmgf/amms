"use client";
import React from "react";
import { FiX } from "react-icons/fi";
import { useForm } from "react-hook-form";

// Utilidad para contar caracteres
const MAX_CHARS = 350;

const CancelScheduledMaintenance = ({
  isOpen,
  onClose,
  onSubmit,
  maintenanceInfo = {},
  defaultValues = {},
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const justification = watch("justification", "");

  // Cerrar modal al hacer clic fuera del contenido
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
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
        className="bg-background rounded-xl shadow-2xl w-full max-w-full max-h-[95vh] overflow-hidden
          sm:max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-gray-200 sm:px-6 sm:py-5">
          <h2 className="text-lg font-bold text-primary sm:text-xl">
            Cancelar Mantenimiento
          </h2>
          <button
            aria-label="Close Modal Button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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
                {maintenanceInfo.serialNumber || "EXC-2024-0012"}
              </div>
            </div>
            <div>
              <span className="text-theme-sm text-secondary">Nombre de la Máquina</span>
              <div className="font-theme-medium">
                {maintenanceInfo.machineName || "Excavadora Caterpillar 320D"}
              </div>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <span className="text-theme-sm text-secondary">Fecha de la Solicitud</span>
              <div className="font-theme-medium">
                {maintenanceInfo.requestDate || "14 Mar 2025, 9:23 pm"}
              </div>
            </div>
          </div>
        </section>

        {/* Cancel scheduled maintenance card */}
        <form
          onSubmit= {handleSubmit((data) => {
            //onSubmit(data);
            onClose();
          })}
        >
          <section className="card-theme mx-2 mb-3 px-3 py-3 sm:mx-6 sm:mb-4 sm:px-6 sm:py-4">
            <div className="font-theme-semibold text-theme-base mb-2 sm:mb-3">
              Cancelar Mantenimiento Programado
            </div>
            <label className="text-theme-sm text-secondary mb-2 sm:mb-3">
              Justificación
            </label>
            <textarea
              {...register("justification", {
                required: true,
                maxLength: MAX_CHARS,
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
                  Este campo es obligatorio.
                </span>
              )}
              <span className="text-xs text-gray-300 sm:ml-auto">
                {justification.length}/{MAX_CHARS} caracteres
              </span>
            </div>
            {/* Footer button */}
          </section>
          <div className="flex flex-col gap-1 justify-center mb-3 sm:flex-row sm:gap-4 sm:mt-3 sm:mb-3">
            <button
              type="submit"
              className="btn-error btn-theme w-full px-4 py-2 font-semibold rounded-lg sm:w-80 sm:px-8"
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