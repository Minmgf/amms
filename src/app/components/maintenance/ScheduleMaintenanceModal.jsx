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
import PermissionGuard from "@/app/(auth)/PermissionGuard";
import SmartSuggestionCard from "@/app/components/maintenance/SmartSuggestionsCard";
import { getScheduledMaintenanceList } from "@/services/maintenanceService";

const ScheduleMaintenanceModal = ({
  isOpen,
  onClose,
  onSubmit,
  request,
  machines = [],
  technicians = [],
  maintenanceTypes = [],
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState,
    setValue,
    watch,
    clearErrors,
  } = useForm();
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  // Estados para modales de feedback
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduledMaintenances, setScheduledMaintenances] = useState([]);
  const [technicianAvailability, setTechnicianAvailability] = useState({});
  const [useSuggestions, setUseSuggestions] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [suggestionInfo, setSuggestionInfo] = useState(null);

  // Información de la solicitud (solo lectura)
  const requestInfo = request
    ? {
        consecutiveNumber: request.id || "N/A",
        requestDate: request.request_date
          ? new Date(request.request_date).toLocaleString("es-ES")
          : "N/A",
        requester: request.requester || "N/A",
        serialNumber: request.serial_number || "N/A",
        machineName: request.machine_name || "N/A",
        status: request.status || "N/A",
        maintenanceType: request.maintenance_type || "N/A",
        priority: request.priority || "N/A",
      }
    : null;

  // Cargar mantenimientos programados cuando se abre el modal
  useEffect(() => {
    if (isOpen && request) {
      loadScheduledMaintenances();
    }
  }, [isOpen, request]);

  // Función para cargar mantenimientos programados
  const loadScheduledMaintenances = async () => {
    setLoadingAvailability(true);
    try {
      const response = await getScheduledMaintenanceList();
      if (response.success) {
        // Filtrar solo los que están en estado "Programado" (id 13)
        const activeSchedules = response.data.filter(
          (item) => item.status_id === 13 && item.scheduled_at
        );
        setScheduledMaintenances(activeSchedules);
        calculateTechnicianAvailability(activeSchedules);
      }
    } catch (error) {
      console.error("Error loading scheduled maintenances:", error);
      setScheduledMaintenances([]);
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Función para calcular disponibilidad de técnicos
  const calculateTechnicianAvailability = (schedules) => {
    const availability = {};

    technicians.forEach((tech) => {
      const techId = parseInt(tech.value);
      const techSchedules = schedules.filter(
        (s) => s.assigned_technician_id === techId
      );

      // Calcular carga de trabajo ponderada
      const today = new Date();
      const workloadScore = techSchedules.reduce((score, schedule) => {
        const scheduleDate = new Date(schedule.scheduled_at);
        const daysUntil = Math.ceil(
          (scheduleDate - today) / (1000 * 60 * 60 * 24)
        );

        let weight = 1;
        if (daysUntil <= 3) weight = 4;
        else if (daysUntil <= 7) weight = 3;
        else if (daysUntil <= 14) weight = 2;

        return score + weight;
      }, 0);

      availability[techId] = {
        totalScheduled: techSchedules.length,
        workloadScore: workloadScore,
        schedules: techSchedules.map((s) => ({
          date: s.scheduled_at,
          machinery: s.machinery_name,
          id: s.id_maintenance_scheduling,
        })),
      };
    });

    setTechnicianAvailability(availability);
  };

  // Aplicar sugerencias automáticas
  const applySuggestions = (suggestion) => {
    if (suggestion.date) setValue("scheduleDate", suggestion.date);
    if (suggestion.time) setValue("scheduleTime", suggestion.time);
    if (suggestion.technician) setValue("technician", suggestion.technician);
    setUseSuggestions(true);
  };

  // Validar fecha no pasada
  const validateDate = (value) => {
    if (!value) return "La fecha es requerida";

    const selectedDate = new Date(value + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return "No se puede programar en fechas pasadas";
    }
    return true;
  };

  // Validar hora no pasada si es hoy
  const validateTime = (timeValue) => {
    if (!timeValue) return "La hora es requerida";

    const dateValue = watch("scheduleDate");
    if (!dateValue) return true;

    const selectedDate = new Date(dateValue + "T00:00:00");
    const today = new Date();

    // Si es hoy, verificar que la hora no sea pasada
    if (
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate()
    ) {
      const [hours, minutes] = timeValue.split(":").map(Number);
      const selectedDateTime = new Date(today);
      selectedDateTime.setHours(hours, minutes, 0, 0);

      if (selectedDateTime <= new Date()) {
        return "La hora debe ser futura para la fecha de hoy";
      }
    }
    return true;
  };

  // Validar disponibilidad del técnico
  const validateTechnicianAvailability = (technicianId, dateTime) => {
    if (!technicianId || !dateTime) return true;

    const techId = parseInt(technicianId);
    const selectedDateTime = new Date(dateTime);

    // Obtener mantenimientos del técnico
    const techSchedules = scheduledMaintenances.filter(
      (s) => s.assigned_technician_id === techId && s.status_id === 13
    );

    for (const schedule of techSchedules) {
      const scheduleDate = new Date(schedule.scheduled_at);

      // Buffer de 2 horas
      const bufferMs = 2 * 60 * 60 * 1000;
      const timeDiff = Math.abs(selectedDateTime - scheduleDate);

      if (timeDiff < bufferMs) {
        const timeStr = scheduleDate.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return `Conflicto: El técnico tiene programado ${schedule.machinery_name} a las ${timeStr}`;
      }
    }

    return true;
  };

  // Manejar envío del formulario
  const onSubmitForm = async (data) => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // Construir fecha/hora completa
      const scheduledDateTime = new Date(
        `${data.scheduleDate}T${data.scheduleTime}:00`
      );
      const now = new Date();

      // Validar que no sea pasada
      if (scheduledDateTime <= now) {
        throw new Error("La fecha y hora programada debe ser futura");
      }

      // Validar disponibilidad del técnico
      const availabilityCheck = validateTechnicianAvailability(
        data.technician,
        `${data.scheduleDate}T${data.scheduleTime}:00`
      );

      if (availabilityCheck !== true) {
        throw new Error(availabilityCheck);
      }

      // Construir payload para el API
      const payload = {
        scheduled_at: `${data.scheduleDate}T${data.scheduleTime}:00Z`,
        assigned_technician: parseInt(data.technician),
        details: data.maintenanceDetails.trim(),
        maintenance_type: parseInt(data.maintenanceType),
      };

      // Enviar al backend
      await onSubmit(payload);

      // Éxito
      setShowSuccessModal(true);
      setTimeout(() => {
        reset();
        onClose();
        setShowSuccessModal(false);
        setUseSuggestions(false);
      }, 2000);
    } catch (error) {
      // Manejar errores
      let errorMsg = "Error al programar el mantenimiento";

      if (error.response?.status === 422) {
        const details = error.response.data?.details;
        if (details?.assigned_technician) {
          errorMsg = "El técnico no está disponible en esa fecha y hora";
        } else if (details?.scheduled_at) {
          errorMsg = details.scheduled_at[0];
        } else if (error.response.data?.message) {
          errorMsg = error.response.data.message;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }

      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Obtener color según prioridad
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Alta":
        return "text-red-600 bg-red-50 border-red-200";
      case "Media":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Baja":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // Obtener icono según prioridad
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "Alta":
        return "🔴";
      case "Media":
        return "🟡";
      case "Baja":
        return "🟢";
      default:
        return "⚪";
    }
  };

  // Cerrar modal
  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setUseSuggestions(false);
      setErrorMessage("");
      setSuggestionInfo(null);
      onClose();
    }
  };

  // Obtener fecha mínima (mañana)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  if (!isOpen) return null;

  return (
    <>
      <PermissionGuard permission={120}>
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="card-theme rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary">
              <h2 className="text-xl font-bold text-primary">
                Programar Mantenimiento
              </h2>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-2 hover:bg-hover rounded-full transition-colors disabled:opacity-50"
              >
                <FiX className="w-5 h-5 text-secondary" />
              </button>
            </div>

            {/* Content */}
            <form
              onSubmit={handleSubmit(onSubmitForm)}
              className="p-6 overflow-y-auto max-h-[calc(95vh-90px)]"
            >
              {/* Request Info */}
              {requestInfo && (
                <div className="mb-6">
                  <RequestInfoCard
                    request={requestInfo}
                    showMachineInfo={true}
                  />
                </div>
              )}

              {/* Sugerencias Automáticas */}
              <SmartSuggestionCard
                request={request}
                technicians={technicians}
                scheduledMaintenances={scheduledMaintenances}
                technicianAvailability={technicianAvailability}
                onApply={applySuggestions}
                onDismiss={() => setUseSuggestions(true)}
                isApplied={useSuggestions}
              />

              {/* Campos del formulario */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary mb-4">
                  Datos de Programación
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Fecha */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Fecha programada*
                    </label>
                    <input
                      type="date"
                      {...register("scheduleDate", {
                        required: "La fecha es requerida",
                        validate: validateDate,
                      })}
                      min={getMinDate()}
                      disabled={isSubmitting}
                      className="parametrization-input disabled:opacity-50"
                    />
                    {formState.errors.scheduleDate && (
                      <p className="text-xs text-error mt-1">
                        {formState.errors.scheduleDate.message}
                      </p>
                    )}
                  </div>

                  {/* Hora */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Hora programada*
                    </label>
                    <input
                      type="time"
                      {...register("scheduleTime", {
                        required: "La hora es requerida",
                        validate: validateTime,
                      })}
                      disabled={isSubmitting}
                      className="parametrization-input disabled:opacity-50"
                    />
                    {formState.errors.scheduleTime && (
                      <p className="text-xs text-error mt-1">
                        {formState.errors.scheduleTime.message}
                      </p>
                    )}
                  </div>

                  {/* Técnico */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Técnico asignado*
                    </label>
                    <select
                      {...register("technician", {
                        required: "Debe seleccionar un técnico",
                      })}
                      disabled={isSubmitting || technicians.length === 0}
                      className="parametrization-input disabled:opacity-50"
                    >
                      <option value="">Seleccione un técnico</option>
                      {technicians.map((tech) => {
                        const techId = parseInt(tech.value);
                        const availability = technicianAvailability[techId];
                        const count = availability?.totalScheduled || 0;

                        let indicator = "🟢";
                        if (count >= 5) indicator = "🟡";
                        if (count >= 10) indicator = "🔴";

                        return (
                          <option key={tech.value} value={tech.value}>
                            {indicator} {tech.label} ({count} programados)
                          </option>
                        );
                      })}
                    </select>
                    {formState.errors.technician && (
                      <p className="text-xs text-error mt-1">
                        {formState.errors.technician.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tipo de mantenimiento */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Tipo de mantenimiento*
                  </label>
                  <select
                    {...register("maintenanceType", {
                      required: "Debe seleccionar el tipo de mantenimiento",
                    })}
                    disabled={isSubmitting || maintenanceTypes.length === 0}
                    className="parametrization-input disabled:opacity-50"
                    defaultValue={request?.maintenance_type_id || ""}
                  >
                    <option value="">Seleccione el tipo</option>
                    {maintenanceTypes.map((type) => (
                      <option key={type.id_types} value={type.id_types}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {formState.errors.maintenanceType && (
                    <p className="text-xs text-error mt-1">
                      {formState.errors.maintenanceType.message}
                    </p>
                  )}
                </div>

                {/* Detalles */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Detalles del mantenimiento*
                  </label>
                  <textarea
                    {...register("maintenanceDetails", {
                      required: "Los detalles son requeridos",
                      minLength: {
                        value: 10,
                        message: "Mínimo 10 caracteres",
                      },
                      maxLength: {
                        value: 350,
                        message: "Máximo 350 caracteres",
                      },
                    })}
                    disabled={isSubmitting}
                    className="parametrization-input w-full resize-none disabled:opacity-50"
                    rows={3}
                    placeholder="Describa los detalles específicos del mantenimiento a realizar..."
                  />
                  <div className="flex justify-between items-center mt-1">
                    <div>
                      {formState.errors.maintenanceDetails && (
                        <p className="text-xs text-error">
                          {formState.errors.maintenanceDetails.message}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-secondary">
                      {watch("maintenanceDetails")?.length || 0}/350 caracteres
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-center gap-4 mt-6 pt-6 border-t border-primary">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-8 py-3 font-semibold rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Programando..." : "Programar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </PermissionGuard>

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
          title="Error al Programar"
          message={errorMessage}
        />
      )}
    </>
  );
};

export default ScheduleMaintenanceModal;
