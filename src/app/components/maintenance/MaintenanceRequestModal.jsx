"use client";
import React from "react";
import { FiX } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { useTheme } from "@/contexts/ThemeContext";

const MaintenanceRequestModal = ({
  isOpen,
  onClose,
  onSubmit,
  machines = [],
  maintenanceTypes = [],
  priorities = [],
  defaultValues = {},
}) => {
  const { register, handleSubmit, reset, formState } = useForm({
    defaultValues,
  });
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  // Cerrar modal al hacer clic fuera del contenido
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      id="Maintenance Request Modal"
    >
      <div
        className="bg-background rounded-xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 text-primary">
            Solicitud de Mantenimiento
          </h2>
          <button
            aria-label="Close modal Button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <form
          onSubmit={handleSubmit((data) => {
            onSubmit(data);
            onClose();
          })}
          className="p-6 overflow-y-auto max-h-[calc(95vh-90px)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Machine selector */}
            <div>
              <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                Maquinaria
              </label>
              <select
                {...register("machine", { required: true })}
                className="parametrization-input"
                aria-label="Machine Select"
                defaultValue=""
              >
                <option value="">
                  Seleccione la maquinaria
                </option>
                {machines.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Maintenance type */}
            <div>
              <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                Tipo de Mantenimiento
              </label>
              <select
                {...register("maintenanceType", { required: true })}
                className="parametrization-input"
                aria-label="Maintenance type Select"
                defaultValue=""
              >
                <option value="">
                  Seleccione el tipo
                </option>
                {maintenanceTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            {/* Problem description */}
            <div className="md:col-span-2">
              <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                Descripción del problema
              </label>
              <textarea
                {...register("description", { required: true })}
                className="parametrization-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-none"
                aria-label="Problem description Textarea"
                rows={3}
                placeholder="Describa el problema aquí..."
              />
            </div>
            {/* Priority */}
            <div>
              <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <select
                {...register("priority", { required: true })}
                className="parametrization-input"
                aria-label="Priority Select"
                defaultValue=""
              >
                <option value="">
                  Seleccione la prioridad
                </option>
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            {/* Detection date */}
            <div>
              <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                Fecha de Detección
              </label>
              <div className="relative">
                <input
                  type="date"
                  {...register("detectionDate", { required: true })}
                  className="parametrization-input"
                  aria-label="Detection date Input"
                />
              </div>
            </div>
          </div>
          {/* Footer buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <button
                type="button"
                onClick={onClose}
                className="btn-error btn-theme w-40 px-8 py-2 font-semibold rounded-lg"
                aria-label="Cancel Button"
            >
                Cancelar
            </button>
            <button
                type="submit"
                className="btn-primary w-40 px-8 py-2 font-semibold rounded-lg text-white"
                aria-label="Request Button"
            >
                Solicitar
            </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceRequestModal;