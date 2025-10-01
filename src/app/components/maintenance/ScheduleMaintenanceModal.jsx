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

  // Estados para sugerencias automáticas
  const [suggestedDate, setSuggestedDate] = useState("");
  const [suggestedTime, setSuggestedTime] = useState("");
  const [suggestedTechnician, setSuggestedTechnician] = useState("");
  const [useSuggestions, setUseSuggestions] = useState(false);

  const [scheduledMaintenances, setScheduledMaintenances] = useState([]);
  const [technicianAvailability, setTechnicianAvailability] = useState({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [suggestionInfo, setSuggestionInfo] = useState(null);

  // Estados para modales de feedback
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    : {
        consecutiveNumber: "N/A",
        requestDate: "N/A",
        requester: "N/A",
        serialNumber: "N/A",
        machineName: "N/A",
        status: "N/A",
        maintenanceType: "N/A",
        priority: "N/A",
      };

  // Observar cambios en campos para generar sugerencias
  const watchedMaintenanceType = watch("maintenanceType");

  // Generar sugerencias automáticas basadas en la prioridad y tipo de mantenimiento
  useEffect(() => {
    if (request && maintenanceTypes.length > 0 && technicians.length > 0) {
      generateSuggestions();
    }
  }, [request, maintenanceTypes, technicians]);

  // Agregar este useEffect después de los estados
  useEffect(() => {
    if (isOpen && request) {
      loadScheduledMaintenances();
    }
  }, [isOpen, request]);

  // Agregar este useEffect para validar en tiempo real cuando cambien los campos
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (
        name === "technician" ||
        name === "scheduleDate" ||
        name === "scheduleTime"
      ) {
        if (value.technician && value.scheduleDate && value.scheduleTime) {
          const dateTime = `${value.scheduleDate}T${value.scheduleTime}:00`;
          const availability = validateTechnicianAvailability(
            value.technician,
            dateTime
          );

          if (availability !== true) {
            // Mostrar advertencia en tiempo real
            setFieldError("technician", {
              type: "manual",
              message: availability,
            });
          } else {
            clearErrors("technician");
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  // Función mejorada para generar sugerencias automáticas
  const generateSuggestions = async () => {
    if (
      !request ||
      technicians.length === 0 ||
      scheduledMaintenances.length === 0
    )
      return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Configuración según prioridad
    const priorityConfig = {
      Alta: {
        targetDaysAhead: 1, // Objetivo: programar mañana
        maxSearchDays: 7,
        preferredHours: ["08:00", "09:00", "10:00"],
        bufferHours: 3, // Mayor buffer para Alta prioridad
        maxDailyMaintenances: 2,
      },
      Media: {
        targetDaysAhead: 3,
        maxSearchDays: 14,
        preferredHours: ["09:00", "10:00", "11:00", "14:00", "15:00"],
        bufferHours: 2,
        maxDailyMaintenances: 3,
      },
      Baja: {
        targetDaysAhead: 7,
        maxSearchDays: 30,
        preferredHours: ["10:00", "11:00", "14:00", "15:00", "16:00"],
        bufferHours: 2,
        maxDailyMaintenances: 4,
      },
    };

    const config = priorityConfig[request.priority] || priorityConfig["Media"];

    // Calcular carga de trabajo de cada técnico
    const technicianWorkloads = technicians
      .map((tech) => {
        const techId = parseInt(tech.value);
        const scheduled = scheduledMaintenances.filter(
          (s) =>
            s.assigned_technician_id === techId &&
            s.status_name === "Programado"
        );

        // Calcular carga ponderada (mantenimientos próximos pesan más)
        const workloadScore = scheduled.reduce((score, schedule) => {
          const scheduleDate = new Date(schedule.scheduled_at);
          const daysUntil = Math.ceil(
            (scheduleDate - today) / (1000 * 60 * 60 * 24)
          );

          // Peso según proximidad
          let weight = 1;
          if (daysUntil <= 3) weight = 4;
          else if (daysUntil <= 7) weight = 3;
          else if (daysUntil <= 14) weight = 2;

          return score + weight;
        }, 0);

        return {
          technician: tech,
          techId: techId,
          totalScheduled: scheduled.length,
          workloadScore: workloadScore,
          schedules: scheduled,
        };
      })
      .sort((a, b) => a.workloadScore - b.workloadScore);

    // Función para verificar disponibilidad de técnico
    const isTechnicianAvailable = (techId, testDateTime, schedules) => {
      const requestedTime = new Date(testDateTime);

      for (const schedule of schedules) {
        const scheduledTime = new Date(schedule.scheduled_at);
        const timeDiffHours =
          Math.abs(requestedTime - scheduledTime) / (1000 * 60 * 60);

        // Verificar buffer de tiempo
        if (timeDiffHours < config.bufferHours) {
          return false;
        }
      }

      // Verificar límite diario
      const sameDayCount = schedules.filter((s) => {
        const scheduleDate = new Date(s.scheduled_at);
        return scheduleDate.toDateString() === requestedTime.toDateString();
      }).length;

      if (sameDayCount >= config.maxDailyMaintenances) {
        return false;
      }

      return true;
    };

    // ESTRATEGIA: Primero buscar fecha óptima, luego técnico disponible
    let bestCombination = null;
    let searchDate = new Date(today);
    searchDate.setDate(today.getDate() + config.targetDaysAhead);

    // Buscar slot disponible expandiendo desde la fecha objetivo
    for (let dayOffset = 0; dayOffset < config.maxSearchDays; dayOffset++) {
      const testDate = new Date(searchDate);
      testDate.setDate(searchDate.getDate() + dayOffset);

      // Saltar fines de semana
      if (testDate.getDay() === 0 || testDate.getDay() === 6) {
        continue;
      }

      // Probar cada hora preferida
      for (const preferredTime of config.preferredHours) {
        const testDateTime = `${
          testDate.toISOString().split("T")[0]
        }T${preferredTime}:00`;

        // Buscar técnico disponible (ordenados por menor carga)
        for (const techInfo of technicianWorkloads) {
          if (
            isTechnicianAvailable(
              techInfo.techId,
              testDateTime,
              techInfo.schedules
            )
          ) {
            bestCombination = {
              date: testDate.toISOString().split("T")[0],
              time: preferredTime,
              technician: techInfo.technician.value,
              technicianName: techInfo.technician.label,
              workload: techInfo.totalScheduled,
              workloadScore: techInfo.workloadScore,
              daysFromTarget: dayOffset,
              isOptimal: dayOffset === 0, // ¿Es la fecha objetivo?
            };
            break;
          }
        }

        if (bestCombination) break;
      }

      if (bestCombination) break;
    }

    // Fallback: Si no hay disponibilidad, sugerir con advertencia
    if (!bestCombination && technicianWorkloads.length > 0) {
      const fallbackDate = new Date(today);
      fallbackDate.setDate(today.getDate() + config.targetDaysAhead);

      bestCombination = {
        date: fallbackDate.toISOString().split("T")[0],
        time: config.preferredHours[0],
        technician: technicianWorkloads[0].technician.value,
        technicianName: technicianWorkloads[0].technician.label,
        workload: technicianWorkloads[0].totalScheduled,
        workloadScore: technicianWorkloads[0].workloadScore,
        warning:
          "⚠️ No se encontró disponibilidad ideal. Verifique conflictos de agenda.",
      };
    }

    // Establecer sugerencias
    if (bestCombination) {
      setSuggestedDate(bestCombination.date);
      setSuggestedTime(bestCombination.time);
      setSuggestedTechnician(bestCombination.technician);

      setSuggestionInfo({
        technicianName: bestCombination.technicianName,
        workload: bestCombination.workload,
        workloadScore: bestCombination.workloadScore,
        daysFromTarget: bestCombination.daysFromTarget,
        isOptimal: bestCombination.isOptimal,
        warning: bestCombination.warning,
      });
    }
  };
  const checkTechnicianAvailability = (
    technicianId,
    dateTime,
    techSchedules
  ) => {
    const requestedTime = new Date(dateTime);

    for (const schedule of techSchedules) {
      const scheduledTime = new Date(schedule.scheduled_at);

      // Considerar un buffer de tiempo entre mantenimientos (2 horas por defecto)
      const bufferHours = 2;
      const timeDiff =
        Math.abs(requestedTime - scheduledTime) / (1000 * 60 * 60);

      if (timeDiff < bufferHours) {
        return false; // Conflicto de horario
      }

      // Si es el mismo día, verificar que no exceda capacidad diaria
      if (requestedTime.toDateString() === scheduledTime.toDateString()) {
        const sameDaySchedules = techSchedules.filter(
          (s) =>
            new Date(s.scheduled_at).toDateString() ===
            requestedTime.toDateString()
        );

        // Límite de mantenimientos por día (configurable)
        const maxPerDay = 3;
        if (sameDaySchedules.length >= maxPerDay) {
          return false;
        }
      }
    }

    return true;
  };

  // Función para cargar mantenimientos programados
  const loadScheduledMaintenances = async () => {
    try {
      const response = await getScheduledMaintenanceList();
      if (response.success) {
        // Filtrar solo los que están en estado "Programado"
        const activeSchedules = response.data.filter(
          (item) => item.status_name === "Programado"
        );
        setScheduledMaintenances(activeSchedules);

        // Calcular disponibilidad de técnicos
        calculateTechnicianAvailability(activeSchedules);
      }
    } catch (error) {
      console.error("Error loading scheduled maintenances:", error);
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

      availability[techId] = {
        totalScheduled: techSchedules.length,
        schedules: techSchedules.map((s) => ({
          date: s.scheduled_at,
          machinery: s.machinery_name,
        })),
      };
    });

    setTechnicianAvailability(availability);
  };

  // Función mejorada para validar disponibilidad del técnico
  const validateTechnicianAvailability = (technicianId, dateTime) => {
    if (!technicianId || !dateTime) return true;

    const techId = parseInt(technicianId);
    const selectedDateTime = new Date(dateTime);

    // Verificar si el técnico tiene mantenimientos en la misma fecha/hora
    const techSchedules = scheduledMaintenances.filter(
      (s) =>
        s.assigned_technician_id === techId && s.status_name === "Programado"
    );

    for (const schedule of techSchedules) {
      const scheduleDate = new Date(schedule.scheduled_at);

      // Considerar un margen de 2 horas antes y después
      const marginHours = 2;
      const scheduleStart = new Date(
        scheduleDate.getTime() - marginHours * 60 * 60 * 1000
      );
      const scheduleEnd = new Date(
        scheduleDate.getTime() + marginHours * 60 * 60 * 1000
      );

      if (
        selectedDateTime >= scheduleStart &&
        selectedDateTime <= scheduleEnd
      ) {
        return `El técnico ya tiene programado el mantenimiento de ${
          schedule.machinery_name
        } a las ${scheduleDate.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      }
    }

    return true;
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

  // Validar hora no pasada si es hoy
  const validateTime = (timeValue) => {
    const dateValue = watch("scheduleDate");
    if (!dateValue) return true;

    const selectedDate = new Date(dateValue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Solo validar si es hoy
    if (selectedDate.getTime() === today.getTime()) {
      const [hours, minutes] = timeValue.split(":");
      const selectedDateTime = new Date();
      selectedDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      if (selectedDateTime < new Date()) {
        return "No se puede programar en horas pasadas";
      }
    }
    return true;
  };

  // Manejar envío del formulario
  const onSubmitForm = async (data) => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // Validar fecha y hora
      const scheduledDateTime = new Date(
        `${data.scheduleDate}T${data.scheduleTime}:00`
      );
      const now = new Date();

      if (scheduledDateTime < now) {
        throw new Error(
          "La fecha y hora programada no puede estar en el pasado"
        );
      }

      // Validar disponibilidad del técnico
      const availabilityCheck = validateTechnicianAvailability(
        data.technician,
        `${data.scheduleDate}T${data.scheduleTime}:00`
      );

      if (availabilityCheck !== true) {
        throw new Error(availabilityCheck);
      }

      // Construir el payload
      const payload = {
        scheduled_at: `${data.scheduleDate}T${data.scheduleTime}:00Z`,
        assigned_technician: parseInt(data.technician),
        details: data.maintenanceDetails.trim(),
        maintenance_type: parseInt(data.maintenanceType),
      };

      // Llamar a la función onSubmit
      await onSubmit(payload);

      // Si llegamos aquí, fue exitoso
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

        // El backend ya valida disponibilidad del técnico
        if (details?.assigned_technician) {
          errorMsg =
            "El técnico seleccionado no está disponible en la fecha y hora indicadas";
        } else if (details?.scheduled_at) {
          errorMsg = details.scheduled_at[0];
        } else if (details?.id_maintenance_request) {
          errorMsg = details.id_maintenance_request[0];
        } else if (details?.maintenance_type) {
          errorMsg = details.maintenance_type[0];
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

  const TechnicianSelect = () => (
    <div>
      <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
        Técnico asignado*
      </label>
      <select
        {...register("technician", {
          required: "Debe seleccionar un técnico",
          validate: (value) => {
            if (!value) return "Debe seleccionar un técnico";

            const dateValue = watch("scheduleDate");
            const timeValue = watch("scheduleTime");

            if (dateValue && timeValue) {
              const check = validateTechnicianAvailability(
                value,
                `${dateValue}T${timeValue}:00`
              );
              if (check !== true) return check;
            }

            return true;
          },
        })}
        disabled={isSubmitting || technicians.length === 0}
        className="parametrization-input disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Technician Select"
        defaultValue=""
      >
        <option value="">
          {technicians.length === 0
            ? "Sin técnicos disponibles"
            : "Seleccione un técnico"}
        </option>
        {technicians.map((tech) => {
          const techId = parseInt(tech.value);
          const workload = technicianAvailability[techId];
          const scheduleCount = workload?.totalScheduled || 0;

          return (
            <option key={tech.value} value={tech.value}>
              {tech.label} ({scheduleCount} mantenimientos programados)
            </option>
          );
        })}
      </select>

      {/* Mostrar información de disponibilidad */}
      {watch("technician") &&
        technicianAvailability[parseInt(watch("technician"))] && (
          <div className="mt-2 text-xs text-gray-600">
            <p>
              Carga actual:{" "}
              {
                technicianAvailability[parseInt(watch("technician"))]
                  .totalScheduled
              }{" "}
              mantenimientos
            </p>
            {technicianAvailability[parseInt(watch("technician"))].schedules
              .length > 0 && (
              <details className="mt-1">
                <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                  Ver agenda del técnico
                </summary>
                <ul className="mt-2 space-y-1">
                  {technicianAvailability[
                    parseInt(watch("technician"))
                  ].schedules.map((schedule, idx) => (
                    <li key={idx} className="text-gray-500">
                      • {new Date(schedule.date).toLocaleDateString("es-ES")} -{" "}
                      {schedule.machinery}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

      {technicians.length === 0 && (
        <p className="text-xs text-yellow-600 mt-1">
          No hay técnicos disponibles. Contacte al administrador.
        </p>
      )}
      {formState.errors.technician && (
        <p className="text-xs text-red-500 mt-1">
          {formState.errors.technician.message}
        </p>
      )}
    </div>
  );

  // Cerrar modal al hacer clic fuera del contenido
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      reset();
      setUseSuggestions(false);
      onClose();
    }
  };

  // Obtener fecha mínima (hoy)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Función para cerrar manualmente
  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setUseSuggestions(false);
      setErrorMessage("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <PermissionGuard permission={120}>
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
              <h2 className="text-xl font-bold text-primary">
                Programar Mantenimiento
              </h2>
              <button
                aria-label="Close modal Button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <RequestInfoCard request={requestInfo} showMachineInfo={true} />
              </div>

              {/* Schedule Maintenance Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-primary mb-4">
                  Datos de Programación
                </h3>
                {/* Sugerencias automáticas */}
                {suggestedDate &&
                  suggestedTime &&
                  suggestedTechnician &&
                  !useSuggestions && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-lg">
                              {suggestionInfo?.isOptimal ? "✨" : "🤖"}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            {suggestionInfo?.isOptimal
                              ? "✅ Sugerencia Óptima"
                              : "🤖 Sugerencia Inteligente"}
                            {request.priority && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  request.priority === "Alta"
                                    ? "bg-red-100 text-red-700"
                                    : request.priority === "Media"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                Prioridad {request.priority}
                              </span>
                            )}
                          </h4>

                          <div className="space-y-2 text-sm text-blue-800">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">📅 Fecha:</span>
                              <span>
                                {new Date(suggestedDate).toLocaleDateString(
                                  "es-ES",
                                  {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                                {suggestionInfo?.daysFromTarget > 0 && (
                                  <span className="text-xs text-blue-600 ml-2">
                                    (+{suggestionInfo.daysFromTarget} días del
                                    objetivo)
                                  </span>
                                )}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-medium">🕐 Hora:</span>
                              <span>{suggestedTime}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-medium">👨‍🔧 Técnico:</span>
                              <span>
                                {suggestionInfo?.technicianName}
                                <span className="text-xs text-blue-600 ml-2">
                                  ({suggestionInfo?.workload} programados,
                                  carga: {suggestionInfo?.workloadScore})
                                </span>
                              </span>
                            </div>
                          </div>

                          {suggestionInfo?.warning && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                              {suggestionInfo.warning}
                            </div>
                          )}

                          <div className="flex gap-2 mt-3">
                            <button
                              type="button"
                              onClick={applySuggestions}
                              disabled={isSubmitting}
                              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                              ✅ Aplicar Sugerencia
                            </button>
                            <button
                              type="button"
                              onClick={() => setUseSuggestions(true)}
                              disabled={isSubmitting}
                              className="px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ✏️ Programar Manualmente
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Schedule date */}
                  <div>
                    <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
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
                      className="parametrization-input disabled:opacity-50 disabled:cursor-not-allowed"
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
                      Hora programada*
                    </label>
                    <input
                      type="time"
                      {...register("scheduleTime", {
                        required: "La hora es requerida",
                        validate: validateTime,
                      })}
                      disabled={isSubmitting}
                      className="parametrization-input disabled:opacity-50 disabled:cursor-not-allowed"
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
                      Técnico asignado*
                    </label>
                    <select
                      {...register("technician", {
                        required: "Debe seleccionar un técnico",
                      })}
                      disabled={isSubmitting || technicians.length === 0}
                      className="parametrization-input disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Seleccione un técnico</option>
                      {technicians.map((tech) => {
                        const techId = parseInt(tech.value);
                        const workload = technicianAvailability[techId];
                        const scheduleCount = workload?.totalScheduled || 0;

                        // Indicador visual de carga
                        let loadIndicator = "🟢"; // Baja carga
                        if (scheduleCount >= 5) loadIndicator = "🟡"; // Media
                        if (scheduleCount >= 10) loadIndicator = "🔴"; // Alta

                        return (
                          <option key={tech.value} value={tech.value}>
                            {loadIndicator} {tech.label} ({scheduleCount}{" "}
                            programados)
                          </option>
                        );
                      })}
                    </select>
                    {technicians.length === 0 && (
                      <p className="text-xs text-yellow-600 mt-1">
                        No hay técnicos disponibles. Contacte al administrador.
                      </p>
                    )}
                    {formState.errors.technician && (
                      <p className="text-xs text-red-500 mt-1">
                        {formState.errors.technician.message}
                      </p>
                    )}
                  </div>
                </div>
                {/* Maintenance type */}
                <div className="mt-4">
                  <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                    Tipo de mantenimiento*
                  </label>
                  <select
                    {...register("maintenanceType", {
                      required: "Debe seleccionar el tipo de mantenimiento",
                    })}
                    disabled={isSubmitting || maintenanceTypes.length === 0}
                    className="parametrization-input disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Maintenance type Select"
                    defaultValue={request?.maintenance_type_id || ""}
                  >
                    <option value="">
                      {maintenanceTypes.length === 0
                        ? "Sin tipos disponibles"
                        : "Seleccione el tipo"}
                    </option>
                    {maintenanceTypes.map((type) => (
                      <option key={type.id_types} value={type.id_types}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {maintenanceTypes.length === 0 && (
                    <p className="text-xs text-yellow-600 mt-1">
                      No hay tipos de mantenimiento disponibles. Contacte al
                      administrador.
                    </p>
                  )}
                  {formState.errors.maintenanceType && (
                    <p className="text-xs text-red-500 mt-1">
                      {formState.errors.maintenanceType.message}
                    </p>
                  )}
                </div>
                {/* Maintenance details */}
                <div className="mt-4">
                  <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
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
                    className="parametrization-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Maintenance details Textarea"
                    rows={3}
                    placeholder="Describa los detalles específicos del mantenimiento a realizar..."
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
              </div>

              {/* Footer buttons */}
              <div className="flex justify-center gap-4 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-8 py-3 font-semibold rounded-lg text-white bg-black hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Schedule Button"
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
