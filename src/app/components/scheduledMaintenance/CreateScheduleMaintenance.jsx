"use client";
import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { useForm, Controller } from "react-hook-form";
import {
  getMaintenanceTypes,
  getActiveTechnicians,
  getActiveMachineries,
  createMaintenanceScheduling,
  getScheduledMaintenanceList,
} from "@/services/maintenanceService";
import { SuccessModal, ErrorModal } from "../shared/SuccessErrorModal";
import SmartSuggestionCard from "../maintenance/SmartSuggestionsCard";

const ScheduleMaintenanceModal = ({ isOpen, onClose, onSubmit }) => {
  const [machines, setMachines] = useState([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [scheduledMaintenances, setScheduledMaintenances] = useState([]);
  const [technicianAvailability, setTechnicianAvailability] = useState({});
  const [useSuggestions, setUseSuggestions] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      machineSelector: "",
      maintenanceType: "",
      scheduleDate: "",
      scheduleTime: "",
      assignedTechnician: "",
      maintenanceDetails: "",
    },
  });

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  // Función para cargar todos los datos necesarios
  const loadInitialData = async () => {
    setLoadingAvailability(true);
    try {
      const [typesResponse, techniciansResponse, machinesResponse, schedulesResponse] = await Promise.all([
        getMaintenanceTypes(),
        getActiveTechnicians(),
        getActiveMachineries(),
        getScheduledMaintenanceList(),
      ]);

      // Procesar tipos de mantenimiento
      if (Array.isArray(typesResponse)) {
        setMaintenanceTypes(typesResponse);
      } else if (typesResponse?.data) {
        setMaintenanceTypes(typesResponse.data);
      }

      // Procesar técnicos
      let formattedTechnicians = [];
      if (techniciansResponse?.success && Array.isArray(techniciansResponse.data)) {
        formattedTechnicians = techniciansResponse.data;
      } else if (Array.isArray(techniciansResponse)) {
        formattedTechnicians = techniciansResponse;
      }
      setTechnicians(formattedTechnicians);

      // Procesar máquinas
      if (machinesResponse?.data) {
        setMachines(machinesResponse.data);
      }

      // Procesar mantenimientos programados
      if (schedulesResponse?.success && Array.isArray(schedulesResponse.data)) {
        const activeSchedules = schedulesResponse.data.filter(
          (item) => item.status_id === 13 && item.scheduled_at
        );
        setScheduledMaintenances(activeSchedules);
        calculateTechnicianAvailability(activeSchedules, formattedTechnicians);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      setModalMessage("Error al cargar los datos necesarios");
      setErrorOpen(true);
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Calcular disponibilidad de técnicos
  const calculateTechnicianAvailability = (schedules, techList) => {
    const availability = {};
    const techArray = techList || technicians;

    techArray.forEach((tech) => {
      const techId = parseInt(tech.id);
      const techSchedules = schedules.filter(
        (s) => s.assigned_technician_id === techId
      );

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
    if (suggestion.technician) setValue("assignedTechnician", suggestion.technician);
    setUseSuggestions(true);
  };

  // Validaciones
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

  const validateTime = (timeValue) => {
    if (!timeValue) return "La hora es requerida";
    const dateValue = watch("scheduleDate");
    if (!dateValue) return true;

    const selectedDate = new Date(dateValue + "T00:00:00");
    const today = new Date();

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

  // Convertir formato 24h a 12h para mostrar
  const convertTo12Hour = (time24) => {
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Manejar envío del formulario
  const onSubmitForm = async (data) => {
    setIsSubmitting(true);

    try {
      const scheduledDateTime = new Date(`${data.scheduleDate}T${data.scheduleTime}:00`);
      const now = new Date();

      if (scheduledDateTime <= now) {
        throw new Error("La fecha y hora programada debe ser futura");
      }

      const payload = {
        id_machinery: parseInt(data.machineSelector),
        scheduled_at: `${data.scheduleDate}T${data.scheduleTime}:00Z`,
        details: data.maintenanceDetails.trim(),
        assigned_technician: parseInt(data.assignedTechnician),
        maintenance_type: parseInt(data.maintenanceType),
      };

      const response = await createMaintenanceScheduling(payload);
      
      setModalMessage(response.message || "Mantenimiento programado con éxito.");
      setSuccessOpen(true);
      
      setTimeout(() => {
        reset();
        setUseSuggestions(false);
        onSubmit?.();
        onClose();
        setSuccessOpen(false);
      }, 2000);
    } catch (error) {
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

      setModalMessage(errorMsg);
      setErrorOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cerrar modal
  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setUseSuggestions(false);
      onClose();
    }
  };

  // Obtener fecha mínima (hoy)
  const getMinDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  if (!isOpen) return null;

  // Formatear técnicos para SmartSuggestionCard
  const formattedTechniciansForSuggestion = technicians.map((tech) => ({
    value: tech.id.toString(),
    label: tech.name || `Técnico #${tech.id}`,
  }));

  return (
    <>
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
            {/* Sugerencias Automáticas */}
            <SmartSuggestionCard
              request={{ priority: "Media" }}
              technicians={formattedTechniciansForSuggestion}
              scheduledMaintenances={scheduledMaintenances}
              technicianAvailability={technicianAvailability}
              onApply={applySuggestions}
              onDismiss={() => setUseSuggestions(true)}
              isApplied={useSuggestions}
              customLabels={{
                title: "Sugerencia Inteligente de Programación",
                applyButton: "Aplicar Sugerencia",
                dismissButton: "Programar Manualmente",
              }}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary mb-4">
                Datos de Programación
              </h3>

              {/* Primera fila: Máquina y Tipo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Máquina*
                  </label>
                  <Controller
                    name="machineSelector"
                    control={control}
                    rules={{ required: "Debe seleccionar una máquina" }}
                    render={({ field }) => (
                      <select
                        {...field}
                        disabled={isSubmitting}
                        className="parametrization-input disabled:opacity-50"
                      >
                        <option value="">Seleccionar máquina</option>
                        {machines.map((machine) => (
                          <option
                            key={machine.id_machinery}
                            value={machine.id_machinery}
                          >
                            {machine.machinery_name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.machineSelector && (
                    <p className="text-xs text-error mt-1">
                      {errors.machineSelector.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Tipo de mantenimiento*
                  </label>
                  <Controller
                    name="maintenanceType"
                    control={control}
                    rules={{ required: "Debe seleccionar el tipo de mantenimiento" }}
                    render={({ field }) => (
                      <select
                        {...field}
                        disabled={isSubmitting}
                        className="parametrization-input disabled:opacity-50"
                      >
                        <option value="">Seleccionar tipo</option>
                        {maintenanceTypes.map((type) => (
                          <option key={type.id_types} value={type.id_types}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.maintenanceType && (
                    <p className="text-xs text-error mt-1">
                      {errors.maintenanceType.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Segunda fila: Fecha, Hora y Técnico */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Fecha programada*
                  </label>
                  <Controller
                    name="scheduleDate"
                    control={control}
                    rules={{
                      required: "La fecha es requerida",
                      validate: validateDate,
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="date"
                        min={getMinDate()}
                        disabled={isSubmitting}
                        className="parametrization-input disabled:opacity-50"
                      />
                    )}
                  />
                  {errors.scheduleDate && (
                    <p className="text-xs text-error mt-1">
                      {errors.scheduleDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Hora programada*
                  </label>
                  <Controller
                    name="scheduleTime"
                    control={control}
                    rules={{
                      required: "La hora es requerida",
                      validate: validateTime,
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="time"
                        disabled={isSubmitting}
                        className="parametrization-input disabled:opacity-50"
                      />
                    )}
                  />
                  {errors.scheduleTime && (
                    <p className="text-xs text-error mt-1">
                      {errors.scheduleTime.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Técnico asignado*
                  </label>
                  <Controller
                    name="assignedTechnician"
                    control={control}
                    rules={{ required: "Debe seleccionar un técnico" }}
                    render={({ field }) => (
                      <select
                        {...field}
                        disabled={isSubmitting || technicians.length === 0}
                        className="parametrization-input disabled:opacity-50"
                      >
                        <option value="">Seleccione un técnico</option>
                        {technicians
                          .map((tech) => {
                            const techId = parseInt(tech.id);
                            const availability = technicianAvailability[techId] || {
                              totalScheduled: 0,
                              workloadScore: 0,
                            };

                            return {
                              ...tech,
                              techId,
                              count: availability.totalScheduled,
                              workloadScore: availability.workloadScore,
                            };
                          })
                          .sort((a, b) => a.workloadScore - b.workloadScore)
                          .map((tech) => {
                            let statusText = "●";
                            let statusColor = "green";
                            if (tech.count >= 5) {
                              statusText = "●";
                              statusColor = "yellow";
                            }
                            if (tech.count >= 10) {
                              statusText = "●";
                              statusColor = "red";
                            }

                            return (
                              <option key={tech.id} value={tech.id}>
                                {statusText} {tech.name} ({tech.count} programados)
                              </option>
                            );
                          })}
                      </select>
                    )}
                  />
                  {errors.assignedTechnician && (
                    <p className="text-xs text-error mt-1">
                      {errors.assignedTechnician.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Detalles */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Detalles del mantenimiento*
                </label>
                <Controller
                  name="maintenanceDetails"
                  control={control}
                  rules={{
                    required: "Los detalles son requeridos",
                    minLength: {
                      value: 10,
                      message: "Mínimo 10 caracteres",
                    },
                    maxLength: {
                      value: 350,
                      message: "Máximo 350 caracteres",
                    },
                  }}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      disabled={isSubmitting}
                      className="parametrization-input w-full resize-none disabled:opacity-50"
                      rows={3}
                      placeholder="Describa los detalles específicos del mantenimiento a realizar..."
                    />
                  )}
                />
                <div className="flex justify-between items-center mt-1">
                  <div>
                    {errors.maintenanceDetails && (
                      <p className="text-xs text-error">
                        {errors.maintenanceDetails.message}
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

      {/* Modales de feedback */}
      <SuccessModal
        isOpen={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          onClose();
        }}
        title="¡Éxito!"
        message={modalMessage}
      />

      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Error al Programar"
        message={modalMessage}
      />
    </>
  );
};

export default ScheduleMaintenanceModal;