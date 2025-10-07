import React, { useState, useEffect } from "react";
import {
  FaLightbulb,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCircle,
} from "react-icons/fa";
import { MdCircle } from "react-icons/md";

/**
 * SmartSuggestionCard - Componente autónomo con lógica de sugerencias inteligentes
 * 
 * @param {object} request - Objeto con la solicitud (debe incluir priority)
 * @param {array} technicians - Array de técnicos disponibles con formato: [{value, label}]
 * @param {array} scheduledMaintenances - Array de mantenimientos programados
 * @param {object} technicianAvailability - Objeto con disponibilidad por técnico {techId: {totalScheduled, workloadScore, schedules}}
 * @param {function} onApply - Callback cuando se aplica la sugerencia (recibe {date, time, technician})
 * @param {function} onDismiss - Callback cuando se descarta la sugerencia
 * @param {boolean} isApplied - Indica si la sugerencia ya fue aplicada
 * @param {object} customLabels - Etiquetas personalizables
 * @param {object} customConfig - Configuración personalizable
 */
const SmartSuggestionCard = ({
  request,
  technicians = [],
  scheduledMaintenances = [],
  technicianAvailability = {},
  onApply,
  onDismiss,
  isApplied = false,
  customLabels = {},
  customConfig = {},
}) => {
  // Estados internos
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  // Labels por defecto
  const labels = {
    title: "Sugerencia Inteligente",
    optimalBadge: "Óptima",
    dateLabel: "Fecha:",
    timeLabel: "Hora:",
    assigneeLabel: "Técnico:",
    scheduledCount: "programados",
    applyButton: "Aplicar Sugerencia",
    dismissButton: "Programar Manualmente",
    loadingText: "Generando sugerencias inteligentes...",
    ...customLabels,
  };

  // Configuración por defecto según prioridad
  const getDefaultConfig = (priority) => {
    const configs = {
      Alta: {
        targetDaysAhead: 1,
        maxSearchDays: 5,
        preferredHours: ["08:00", "09:00", "10:00"],
        bufferHours: 3,
        maxDailyMaintenances: 2,
      },
      Media: {
        targetDaysAhead: 2,
        maxSearchDays: 10,
        preferredHours: ["09:00", "10:00", "11:00", "14:00"],
        bufferHours: 2,
        maxDailyMaintenances: 3,
      },
      Baja: {
        targetDaysAhead: 3,
        maxSearchDays: 15,
        preferredHours: ["10:00", "14:00", "15:00", "16:00"],
        bufferHours: 2,
        maxDailyMaintenances: 4,
      },
    };
    return configs[priority] || configs["Media"];
  };

  // Función para verificar disponibilidad completa del técnico
  const checkTechnicianFullAvailability = (
    techSchedules,
    requestedDateTime,
    bufferHours,
    maxDaily
  ) => {
    const requestedDate = new Date(requestedDateTime);

    // Verificar conflictos con buffer de tiempo
    for (const schedule of techSchedules) {
      const scheduleDate = new Date(schedule.date);
      const timeDiffHours = Math.abs(requestedDate - scheduleDate) / (1000 * 60 * 60);

      if (timeDiffHours < bufferHours) {
        return false;
      }
    }

    // Verificar límite diario
    const sameDayCount = techSchedules.filter((s) => {
      const scheduleDate = new Date(s.date);
      return (
        scheduleDate.getFullYear() === requestedDate.getFullYear() &&
        scheduleDate.getMonth() === requestedDate.getMonth() &&
        scheduleDate.getDate() === requestedDate.getDate()
      );
    }).length;

    return sameDayCount < maxDaily;
  };

  // Función principal para generar sugerencias
  const generateSuggestion = async () => {
    if (!request || technicians.length === 0) {
      setSuggestion(null);
      return;
    }

    setLoading(true);

    try {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      // Obtener configuración según prioridad
      const defaultConfig = getDefaultConfig(request.priority);
      const config = { ...defaultConfig, ...customConfig };

      // Ordenar técnicos por carga de trabajo
      const techniciansByWorkload = technicians
        .map((tech) => {
          const techId = parseInt(tech.value);
          const availability = technicianAvailability[techId] || {
            totalScheduled: 0,
            workloadScore: 0,
            schedules: [],
          };

          return {
            ...tech,
            techId,
            totalScheduled: availability.totalScheduled,
            workloadScore: availability.workloadScore,
            schedules: availability.schedules,
          };
        })
        .sort((a, b) => a.workloadScore - b.workloadScore);

      // Buscar la mejor combinación fecha/hora/técnico
      let bestCombination = null;
      let searchDate = new Date(tomorrow);
      searchDate.setDate(tomorrow.getDate() + (config.targetDaysAhead - 1));

      searchLoop: for (let dayOffset = 0; dayOffset < config.maxSearchDays; dayOffset++) {
        const testDate = new Date(searchDate);
        testDate.setDate(searchDate.getDate() + dayOffset);

        // Saltar fines de semana
        if (testDate.getDay() === 0 || testDate.getDay() === 6) {
          continue;
        }

        // Probar cada hora preferida
        for (const preferredTime of config.preferredHours) {
          const [hours, minutes] = preferredTime.split(':').map(Number);
          const testDateTime = new Date(testDate);
          testDateTime.setHours(hours, minutes, 0, 0);

          // Verificar que la fecha/hora no sea pasada
          if (testDateTime <= now) {
            continue;
          }

          // Buscar técnico disponible con menor carga
          for (const techInfo of techniciansByWorkload) {
            const isAvailable = checkTechnicianFullAvailability(
              techInfo.schedules,
              testDateTime,
              config.bufferHours,
              config.maxDailyMaintenances
            );

            if (isAvailable) {
              bestCombination = {
                date: testDate.toISOString().split('T')[0],
                time: preferredTime,
                technician: techInfo.value,
                technicianName: techInfo.label,
                workload: techInfo.totalScheduled,
                workloadScore: techInfo.workloadScore,
                daysFromNow: dayOffset + config.targetDaysAhead,
                isOptimal: dayOffset === 0,
              };
              break searchLoop;
            }
          }
        }
      }

      // Si no se encontró combinación óptima, sugerir con advertencia
      if (!bestCombination && techniciansByWorkload.length > 0) {
        const fallbackDate = new Date(tomorrow);
        fallbackDate.setDate(tomorrow.getDate() + (config.targetDaysAhead - 1));

        // Asegurar que sea día laboral
        while (fallbackDate.getDay() === 0 || fallbackDate.getDay() === 6) {
          fallbackDate.setDate(fallbackDate.getDate() + 1);
        }

        bestCombination = {
          date: fallbackDate.toISOString().split('T')[0],
          time: config.preferredHours[0],
          technician: techniciansByWorkload[0].value,
          technicianName: techniciansByWorkload[0].label,
          workload: techniciansByWorkload[0].totalScheduled,
          workloadScore: techniciansByWorkload[0].workloadScore,
          warning: "No se encontró disponibilidad ideal. Se sugiere verificar conflictos de agenda.",
        };
      }

      setSuggestion(bestCombination);
    } catch (error) {
      console.error("Error generating suggestion:", error);
      setSuggestion(null);
    } finally {
      setLoading(false);
    }
  };

  // Generar sugerencias cuando cambien los datos necesarios
  useEffect(() => {
    if (request && technicians.length > 0 && !isApplied) {
      generateSuggestion();
    }
  }, [request, technicians, scheduledMaintenances, technicianAvailability, isApplied]);

  // Función auxiliar para obtener color de prioridad
  const getPriorityColor = (priority) => {
    const colors = {
      Alta: "text-red-600 bg-red-50 border-red-200",
      Media: "text-yellow-600 bg-yellow-50 border-yellow-200",
      Baja: "text-green-600 bg-green-50 border-green-200",
    };
    return colors[priority] || "text-gray-600 bg-gray-50 border-gray-200";
  };

  // Función auxiliar para obtener icono de prioridad
  const getPriorityIcon = (priority) => {
    const iconClass = "w-3 h-3 inline-block";
    const icons = {
      Alta: <FaCircle className={`${iconClass} text-red-500`} />,
      Media: <FaCircle className={`${iconClass} text-yellow-500`} />,
      Baja: <FaCircle className={`${iconClass} text-green-500`} />,
    };
    return icons[priority] || <FaCircle className={`${iconClass} text-gray-400`} />;
  };

  // Formatear fecha legible
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString + "T12:00:00").toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Handler para aplicar sugerencia
  const handleApply = () => {
    if (suggestion && onApply) {
      onApply({
        date: suggestion.date,
        time: suggestion.time,
        technician: suggestion.technician,
      });
    }
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="mb-6 p-4 card-secondary rounded-lg">
        <div className="flex items-center gap-3">
          <div className="animate-spin h-5 w-5 border-2 border-accent border-t-transparent rounded-full" />
          <span className="text-primary">{labels.loadingText}</span>
        </div>
      </div>
    );
  }

  // Si no hay sugerencia o ya fue aplicada, no mostrar
  if (!suggestion || isApplied) {
    return null;
  }

  return (
    <div className="mb-6 p-4 card-secondary rounded-lg border-2 border-accent">
      <div className="flex items-start gap-3">
        {/* Icono */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
            <FaLightbulb className="w-5 h-5 text-accent" />
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1">
          {/* Título con badges */}
          <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2 flex-wrap">
            {labels.title}
            
            {/* Badge de óptima */}
            {suggestion.isOptimal && (
              <span className="text-xs px-2 py-0.5 bg-success text-white rounded-full">
                {labels.optimalBadge}
              </span>
            )}
            
            {/* Badge de prioridad */}
            {request?.priority && (
              <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(request.priority)}`}>
                {getPriorityIcon(request.priority)} Prioridad {request.priority}
              </span>
            )}
          </h4>

          {/* Información de la sugerencia */}
          <div className="space-y-2 text-sm">
            {/* Fecha */}
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="w-4 h-4 text-accent" />
              <span className="font-medium text-primary">{labels.dateLabel}</span>
              <span className="text-secondary">
                {formatDate(suggestion.date)}
              </span>
            </div>

            {/* Hora */}
            <div className="flex items-center gap-2">
              <FaClock className="w-4 h-4 text-accent" />
              <span className="font-medium text-primary">{labels.timeLabel}</span>
              <span className="text-secondary">{suggestion.time}</span>
            </div>

            {/* Técnico */}
            <div className="flex items-center gap-2">
              <FaUser className="w-4 h-4 text-accent" />
              <span className="font-medium text-primary">{labels.assigneeLabel}</span>
              <span className="text-secondary">
                {suggestion.technicianName}
                <span className="text-xs text-secondary ml-2">
                  ({suggestion.workload} {labels.scheduledCount})
                </span>
              </span>
            </div>
          </div>

          {/* Advertencia (si existe) */}
          {suggestion.warning && (
            <div className="mt-3 p-2 bg-warning/10 border border-warning rounded-md">
              <div className="flex items-start gap-2">
                <FaExclamationTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <span className="text-xs text-primary">{suggestion.warning}</span>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2 mt-4">
            {onApply && (
              <button
                type="button"
                onClick={handleApply}
                className="btn-primary px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50"
              >
                <FaCheckCircle className="w-4 h-4 mr-2 inline" />
                {labels.applyButton}
              </button>
            )}
            
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="btn-secondary px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50"
              >
                {labels.dismissButton}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartSuggestionCard;

// Ejemplo de uso:
// 
// <SmartSuggestionCard
//   request={{ priority: "Alta", id: "2025-01" }}
//   technicians={technicians}
//   scheduledMaintenances={scheduledMaintenances}
//   technicianAvailability={technicianAvailability}
//   onApply={(suggestion) => {
//     setValue("scheduleDate", suggestion.date);
//     setValue("scheduleTime", suggestion.time);
//     setValue("technician", suggestion.technician);
//   }}
//   onDismiss={() => setUseSuggestions(true)}
//   isApplied={useSuggestions}
// />