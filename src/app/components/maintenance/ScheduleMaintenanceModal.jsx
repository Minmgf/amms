"use client";
import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { useTheme } from "@/contexts/ThemeContext";
import RequestInfoCard from "@/app/components/maintenance/RequestInfoCard";
import {
  SuccessModal,
  ErrorModal,
} from "@/app/components/shared/SuccessErrorModal";

const ScheduleMaintenanceModal = ({
  isOpen,
  onClose,
  onSubmit,
  request, // Agregar este prop
  machines = [],
  technicians = [],
  maintenanceTypes = [],
}) => {
  const { register, handleSubmit, reset, formState, setValue, watch } =
    useForm();
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  // Estados para sugerencias automáticas
  const [suggestedDate, setSuggestedDate] = useState("");
  const [suggestedTime, setSuggestedTime] = useState("");
  const [suggestedTechnician, setSuggestedTechnician] = useState("");
  const [useSuggestions, setUseSuggestions] = useState(false);

  // Estados para modales de feedback
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Información de la solicitud (solo lectura)
  const requestInfo = request
    ? {
        consecutiveNumber: request.id || "SOL-2025-001",
        requestDate: request.request_date
          ? new Date(request.request_date).toLocaleString("es-ES")
          : "14 Mar 2025, 9:23 pm",
        requester: request.requester || "Carlos Mendoza",
        serialNumber: request.serial_number || "EXC-2024-0012",
        machineName: request.machine_name || "Excavadora Caterpillar 320D",
        status: request.status || "Pendiente",
      }
    : {
        // Valores por defecto si no hay request
        consecutiveNumber: "N/A",
        requestDate: "N/A",
        requester: "N/A",
        serialNumber: "N/A",
        machineName: "N/A",
        status: "N/A",
      };
  // Observar cambios en campos para generar sugerencias
  const watchedMachine = watch("machine");
  const watchedMaintenanceType = watch("maintenanceType");

  // Generar sugerencias automáticas basadas en la máquina y tipo de mantenimiento
  useEffect(() => {
    if (watchedMachine && watchedMaintenanceType) {
      generateSuggestions();
    }
  }, [watchedMachine, watchedMaintenanceType]);

  // Función para generar sugerencias automáticas
  const generateSuggestions = () => {
    // Lógica simulada para sugerencias
    // En producción, esto vendría del backend
    const today = new Date();
    const suggestedDateObj = new Date(today);
    suggestedDateObj.setDate(today.getDate() + 3); // Sugerir 3 días después

    setSuggestedDate(suggestedDateObj.toISOString().split("T")[0]);
    setSuggestedTime("08:00");

    // Sugerir técnico basado en disponibilidad
    if (technicians.length > 0) {
      setSuggestedTechnician(technicians[0].value);
    }
  };

  // Aplicar sugerencias automáticas
  const applySuggestions = () => {
    setValue("scheduleDate", suggestedDate);
    setValue("scheduleTime", suggestedTime);
    setValue("technician", suggestedTechnician);
    setUseSuggestions(true);
  };

  // Validar fecha no pasada
  const validateDate = (value) => {
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return "No se puede programar en fechas pasadas";
    }
    return true;
  };

  // Manejar envío del formulario
  const onSubmitForm = async (data) => {
    try {
      // Validar disponibilidad del técnico (simulado)
      const isTechnicianAvailable = await checkTechnicianAvailability(
        data.technician,
        data.scheduleDate,
        data.scheduleTime
      );

      if (!isTechnicianAvailable) {
        setErrorMessage(
          "El técnico seleccionado no está disponible en ese horario"
        );
        setShowErrorModal(true);
        return;
      }

      // Enviar datos
      await onSubmit(data);

      // Mostrar éxito
      setShowSuccessModal(true);

      // Limpiar y cerrar después de un tiempo
      setTimeout(() => {
        reset();
        onClose();
        setShowSuccessModal(false);
      }, 2000);
    } catch (error) {
      setErrorMessage("Error al programar el mantenimiento");
      setShowErrorModal(true);
    }
  };

  // Verificar disponibilidad del técnico (simulado)
  const checkTechnicianAvailability = async (technicianId, date, time) => {
    // En producción, esto sería una llamada al backend
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simular 90% de disponibilidad
        resolve(Math.random() > 0.1);
      }, 500);
    });
  };

  // Cerrar modal al hacer clic fuera del contenido
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      reset();
      onClose();
    }
  };

  // Obtener fecha mínima (hoy)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
        id="Schedule Maintenance Modal"
      >
        <div
          className="bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-primary">Schedule request</h2>
            <button
              aria-label="Close modal Button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Modal Content */}
          <form
            onSubmit={handleSubmit(onSubmitForm)}
            className="p-6 overflow-y-auto max-h-[calc(95vh-90px)]"
          >
            {/* Request Info Section */}
            <div className="mb-6">
              <RequestInfoCard request={request} showMachineInfo={true} />
            </div>

            {/* Schedule Maintenance Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-primary mb-4">
                Schedule Maintenance
              </h3>

              {/* Sugerencias automáticas */}
              {suggestedDate &&
                suggestedTime &&
                suggestedTechnician &&
                !useSuggestions && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      📅 Sugerencia automática basada en disponibilidad:
                    </p>
                    <p className="text-xs text-blue-700">
                      Fecha:{" "}
                      {new Date(suggestedDate).toLocaleDateString("es-ES")} a
                      las {suggestedTime}
                    </p>
                    <p className="text-xs text-blue-700 mb-2">
                      Técnico:{" "}
                      {
                        technicians.find((t) => t.value === suggestedTechnician)
                          ?.label
                      }
                    </p>
                    <button
                      type="button"
                      onClick={applySuggestions}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      Aplicar sugerencia
                    </button>
                  </div>
                )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Schedule date */}
                <div>
                  <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                    Schedule date*
                  </label>
                  <input
                    type="date"
                    {...register("scheduleDate", {
                      required: "La fecha es requerida",
                      validate: validateDate,
                    })}
                    min={getMinDate()}
                    className="parametrization-input"
                    aria-label="Schedule date Input"
                  />
                  {formState.errors.scheduleDate && (
                    <p className="text-xs text-red-500 mt-1">
                      {formState.errors.scheduleDate.message}
                    </p>
                  )}
                </div>

                {/* Schedule time */}
                <div>
                  <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                    Schedule hour*
                  </label>
                  <input
                    type="time"
                    {...register("scheduleTime", {
                      required: "La hora es requerida",
                    })}
                    className="parametrization-input"
                    aria-label="Schedule time Input"
                  />
                  {formState.errors.scheduleTime && (
                    <p className="text-xs text-red-500 mt-1">
                      {formState.errors.scheduleTime.message}
                    </p>
                  )}
                </div>

                {/* Assigned technician */}
                <div>
                  <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                    Assigned technician*
                  </label>
                  <select
                    {...register("technician", {
                      required: "Debe seleccionar un técnico",
                    })}
                    className="parametrization-input"
                    aria-label="Technician Select"
                    defaultValue=""
                  >
                    <option value="">Seleccione un técnico</option>
                    {technicians.map((tech) => (
                      <option key={tech.value} value={tech.value}>
                        {tech.label}
                      </option>
                    ))}
                  </select>
                  {formState.errors.technician && (
                    <p className="text-xs text-red-500 mt-1">
                      {formState.errors.technician.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Maintenance details */}
              <div className="mt-4">
                <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                  Maintenance details*
                </label>
                <textarea
                  {...register("maintenanceDetails", {
                    required: "Los detalles son requeridos",
                    maxLength: {
                      value: 350,
                      message: "Máximo 350 caracteres",
                    },
                  })}
                  className="parametrization-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-none"
                  aria-label="Maintenance details Textarea"
                  rows={3}
                  placeholder="Describa los detalles del mantenimiento..."
                />
                <div className="flex justify-between items-center mt-1">
                  <div>
                    {formState.errors.maintenanceDetails && (
                      <p className="text-xs text-red-500">
                        {formState.errors.maintenanceDetails.message}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {watch("maintenanceDetails")?.length || 0}/350 caracteres
                  </p>
                </div>
              </div>

              {/* Maintenance type */}
              <div className="mt-4">
                <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                  Maintenance type*
                </label>
                <select
                  {...register("maintenanceType", {
                    required: "Debe seleccionar el tipo de mantenimiento",
                  })}
                  className="parametrization-input"
                  aria-label="Maintenance type Select"
                  defaultValue=""
                >
                  <option value="">Seleccione el tipo</option>
                  {maintenanceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {formState.errors.maintenanceType && (
                  <p className="text-xs text-red-500 mt-1">
                    {formState.errors.maintenanceType.message}
                  </p>
                )}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex justify-center gap-4 mt-6 pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="btn-primary px-8 py-3 font-semibold rounded-lg text-white bg-black hover:bg-gray-800 transition-colors"
                aria-label="Schedule Button"
              >
                Schedule
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modales de feedback */}
      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="¡Éxito!"
          message="El mantenimiento ha sido programado correctamente"
        />
      )}

      {showErrorModal && (
        <ErrorModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          title="Error"
          message={errorMessage}
        />
      )}
    </>
  );
};

export default ScheduleMaintenanceModal;
