"use client";
import React, { useState, useEffect } from "react";

import { getActiveTechnicians, getMaintenanceTypes, updateMaintenanceScheduling, getScheduledMaintenanceDetail } from "@/services/maintenanceService";

const UpdateMaintenanceSchedule = ({ onClose, requestData, onSuccess, onError }) => {
  
  // Estados del formulario
  const [scheduleDate, setScheduleDate] = useState(requestData?.scheduleDate || "");
  const [hour, setHour] = useState(requestData?.scheduleHour || "01");
  const [minute, setMinute] = useState(requestData?.scheduleMinute || "00");
  const [period, setPeriod] = useState(requestData?.schedulePeriod || "AM");
  const [assignedTechnician, setAssignedTechnician] = useState(
    requestData?.assignedTechnician || ""
  );
  const [maintenanceDetails, setMaintenanceDetails] = useState("");
  const [maintenanceType, setMaintenanceType] = useState(
    requestData?.maintenanceType || ""
  );
  
  // Estados para UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para datos dinámicos
  const [technicians, setTechnicians] = useState([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para información del mantenimiento
  const [maintenanceInfo, setMaintenanceInfo] = useState({
    machinery_serial: "N/A",
    machinery_name: "N/A", 
    scheduled_at: "N/A"
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
  

        
        const [techniciansList, typesList] = await Promise.all([
          getActiveTechnicians(),
          getMaintenanceTypes()
        ]);
        
        setTechnicians(techniciansList);
        setMaintenanceTypes(typesList);
        
        // Pre-cargar tipo de mantenimiento desde requestData
        if (requestData?.maintenance_type) {
          setMaintenanceType(requestData.maintenance_type.toString());
        }
        
        // Determinar qué ID usar (puede venir con diferentes nombres)
        const maintenanceId = requestData?.id_maintenance_scheduling || requestData?.id || requestData?.maintenance_id;
        
        // Obtener detalle del mantenimiento
        if (requestData) {
          try {
            // Usar directamente requestData que ya contiene todos los datos
            let specificMaintenance = requestData;
            
            // Solo hacer llamada API si requestData no tiene los campos esenciales
            const hasEssentialData = requestData.machinery || 
                                   requestData.machinery_name || 
                                   requestData.machine_name ||
                                   requestData.scheduled_at ||
                                   requestData.scheduled_date;
            
            if (!hasEssentialData && maintenanceId) {
              try {
                specificMaintenance = await getScheduledMaintenanceDetail(maintenanceId);
              } catch (detailError) {
                specificMaintenance = requestData;
              }
            }
            
            if (specificMaintenance) {
              // Mapear información para mostrar
              setMaintenanceInfo({
                machinery_serial: specificMaintenance.machinery?.serial ||
                                 specificMaintenance.machinery_serial || 
                                 specificMaintenance.serial_number ||
                                 specificMaintenance.machine_serial ||
                                 "N/A",
                machinery_name: specificMaintenance.machinery_name || 
                               specificMaintenance.machine_name ||
                               specificMaintenance.machinery_description ||
                               specificMaintenance.machinery?.name ||
                               "N/A",
                scheduled_at: specificMaintenance.scheduled_at || 
                             specificMaintenance.scheduled_date ||
                             specificMaintenance.programmed_date ||
                             specificMaintenance.date ? 
                  (() => {
                    const date = specificMaintenance.scheduled_at || 
                                specificMaintenance.scheduled_date || 
                                specificMaintenance.programmed_date ||
                                specificMaintenance.date;
                    try {
                      const dateObj = new Date(date);
                      // Usar UTC para mantener consistencia con el formulario
                      const day = dateObj.getUTCDate().toString().padStart(2, '0');
                      const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
                      const year = dateObj.getUTCFullYear();
                      const hours = dateObj.getUTCHours().toString().padStart(2, '0');
                      const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
                      
                      return `${day}/${month}/${year}, ${hours}:${minutes}:00`;
                    } catch {
                      return date;
                    }
                  })() : "N/A"
              });
              
              // Pre-llenar campos del formulario con datos existentes
              // 1. Procesar fecha y hora desde scheduled_at
              const scheduledAtValue = specificMaintenance.scheduled_at || 
                                     specificMaintenance.scheduled_date ||
                                     specificMaintenance.programmed_date;
              
              if (scheduledAtValue) {
                try {
                  const scheduledDate = new Date(scheduledAtValue);
                  
                  // Extraer fecha en formato YYYY-MM-DD (usar UTC)
                  const year = scheduledDate.getUTCFullYear();
                  const month = (scheduledDate.getUTCMonth() + 1).toString().padStart(2, '0');
                  const day = scheduledDate.getUTCDate().toString().padStart(2, '0');
                  const dateStr = `${year}-${month}-${day}`;
                  setScheduleDate(dateStr);
                  
                  // Extraer hora y convertir a formato 12h
                  // IMPORTANTE: Usar UTC para evitar problemas de zona horaria
                  const hours24 = scheduledDate.getUTCHours();
                  const minutes = scheduledDate.getUTCMinutes();
                  
                  let hours12;
                  let period;
                  
                  if (hours24 === 0) {
                    // 00:xx = 12:xx AM
                    hours12 = 12;
                    period = 'AM';
                  } else if (hours24 < 12) {
                    // 01:xx - 11:xx = 1:xx - 11:xx AM
                    hours12 = hours24;
                    period = 'AM';
                  } else if (hours24 === 12) {
                    // 12:xx = 12:xx PM
                    hours12 = 12;
                    period = 'PM';
                  } else {
                    // 13:xx - 23:xx = 1:xx - 11:xx PM
                    hours12 = hours24 - 12;
                    period = 'PM';
                  }
                  
                  setHour(hours12.toString().padStart(2, '0'));
                  setMinute(minutes.toString().padStart(2, '0'));
                  setPeriod(period);
                } catch (dateError) {
                  console.warn('Error parsing scheduled_at date:', dateError);
                }
              }
              
              // 2. Técnico asignado
              const technicianId = specificMaintenance.assigned_technician_id || 
                                 specificMaintenance.assigned_technician ||
                                 specificMaintenance.technician_id;
              
              if (technicianId) {
                setAssignedTechnician(technicianId.toString());
              }
              
              // 3. Tipo de mantenimiento
              const maintenanceTypeId = specificMaintenance.maintenance_type || 
                                      specificMaintenance.maintenance_type_id ||
                                      specificMaintenance.type_id;
              
              if (maintenanceTypeId) {
                setMaintenanceType(maintenanceTypeId.toString());
              }
            } else {
              // Si no hay datos específicos, intentar usar requestData básico para formulario
              if (requestData) {
                // Fecha y hora desde requestData
                const scheduledAtValue = requestData.scheduled_at || requestData.scheduled_date || requestData.maintenanceDate;
                if (scheduledAtValue) {
                  try {
                    const scheduledDate = new Date(scheduledAtValue);
                    const dateStr = scheduledDate.toISOString().split('T')[0];
                    setScheduleDate(dateStr);
                    
                    const hours24 = scheduledDate.getHours();
                    const minutes = scheduledDate.getMinutes();
                    
                    let hours12 = hours24;
                    let period = 'AM';
                    
                    if (hours24 === 0) {
                      hours12 = 12;
                      period = 'AM';
                    } else if (hours24 === 12) {
                      hours12 = 12;
                      period = 'PM';
                    } else if (hours24 > 12) {
                      hours12 = hours24 - 12;
                      period = 'PM';
                    }
                    
                    setHour(hours12.toString().padStart(2, '0'));
                    setMinute(minutes.toString().padStart(2, '0'));
                    setPeriod(period);
                  } catch (dateError) {
                    console.warn('Error parsing basic requestData date:', dateError);
                  }
                }
                
                // Técnico desde requestData
                if (requestData.assigned_technician_id) {
                  setAssignedTechnician(requestData.assigned_technician_id.toString());
                }
              }
              
              setMaintenanceInfo({
                machinery_serial: "N/A",
                machinery_name: "N/A", 
                scheduled_at: "N/A"
              });
            }
            
          } catch (detailError) {
            // En caso de error, usar requestData directamente
            if (requestData) {
              // Información para mostrar
              setMaintenanceInfo({
                machinery_serial: requestData.machinery?.serial || requestData.machinery_serial || requestData.serial_number || "N/A",
                machinery_name: requestData.machinery_name || requestData.machine_name || "N/A",
                scheduled_at: requestData.scheduled_at || requestData.scheduled_date ? 
                  new Date(requestData.scheduled_at || requestData.scheduled_date).toLocaleString("es-ES") : "N/A"
              });
              
              // También intentar cargar datos del formulario desde requestData
              // Fecha y hora
              const scheduledAtValue = requestData.scheduled_at || requestData.scheduled_date;
              if (scheduledAtValue) {
                try {
                  const scheduledDate = new Date(scheduledAtValue);
                  const dateStr = scheduledDate.toISOString().split('T')[0];
                  setScheduleDate(dateStr);
                  
                  const hours24 = scheduledDate.getHours();
                  const minutes = scheduledDate.getMinutes();
                  
                  let hours12 = hours24;
                  let period = 'AM';
                  
                  if (hours24 === 0) {
                    hours12 = 12;
                    period = 'AM';
                  } else if (hours24 === 12) {
                    hours12 = 12;
                    period = 'PM';
                  } else if (hours24 > 12) {
                    hours12 = hours24 - 12;
                    period = 'PM';
                  }
                  
                  setHour(hours12.toString().padStart(2, '0'));
                  setMinute(minutes.toString().padStart(2, '0'));
                  setPeriod(period);
                } catch (dateError) {
                  console.warn('Error parsing requestData date:', dateError);
                }
              }
              
              // Técnico asignado
              if (requestData.assigned_technician_id || requestData.assigned_technician) {
                setAssignedTechnician((requestData.assigned_technician_id || requestData.assigned_technician).toString());
              }
              
              // Tipo de mantenimiento
              if (requestData.maintenance_type || requestData.maintenance_type_id) {
                setMaintenanceType((requestData.maintenance_type || requestData.maintenance_type_id).toString());
              }
            }
          }
        }
        
      } catch (error) {
        // Error silencioso en la carga de datos - el modal seguirá funcionando con valores por defecto
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [requestData?.id_maintenance_scheduling, requestData?.id, requestData?.maintenance_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Validaciones de campos obligatorios
      if (!scheduleDate || scheduleDate === "" || scheduleDate === "2000-00-00") {
        throw new Error("Debe seleccionar una fecha programada.");
      }
      
      if (!hour || hour === "00" || hour === "") {
        throw new Error("Debe ingresar una hora válida.");
      }
      
      if (!minute || minute === "") {
        throw new Error("Debe ingresar los minutos.");
      }
      
      if (!period || period === "") {
        throw new Error("Debe seleccionar AM o PM.");
      }
      
      if (!assignedTechnician || assignedTechnician === "" || assignedTechnician === "Selecciona tu tecnico") {
        throw new Error("Debe seleccionar un técnico asignado.");
      }
      
      if (!maintenanceDetails || maintenanceDetails.trim() === "" || maintenanceDetails === "Descripcion....") {
        throw new Error("Debe ingresar los detalles del mantenimiento.");
      }
      
      if (!maintenanceType || maintenanceType === "" || maintenanceType === "Tipo de mantenimiento") {
        throw new Error("Debe seleccionar un tipo de mantenimiento.");
      }
      
      // Validación de fecha futura
      const selectedDate = new Date(scheduleDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        throw new Error("La fecha programada debe ser igual o posterior a hoy.");
      }
      
      // Validación de hora válida
      const hourNum = parseInt(hour);
      const minuteNum = parseInt(minute);
      
      if (hourNum < 1 || hourNum > 12 || minuteNum < 0 || minuteNum > 59) {
        throw new Error("Por favor ingrese una hora válida.");
      }
      
      // Convertir la fecha y hora al formato ISO 8601 para scheduled_at
      const convertTo24Hour = (hour12, minute, period) => {
        // Asegurar que hour12 y minute sean strings numéricos válidos
        const hourNum = parseInt(hour12, 10);
        const minuteStr = String(minute).padStart(2, '0');
        
        let hour24;
        
        // Lógica de conversión de 12h a 24h
        if (period === 'AM') {
          if (hourNum === 12) {
            hour24 = 0; // 12 AM = 00:00
          } else {
            hour24 = hourNum; // 1-11 AM se mantienen igual
          }
        } else if (period === 'PM') {
          if (hourNum === 12) {
            hour24 = 12; // 12 PM = 12:00
          } else {
            hour24 = hourNum + 12; // 1-11 PM = 13-23
          }
        }
        
        return `${hour24.toString().padStart(2, '0')}:${minuteStr}`;
      };

      const time24 = convertTo24Hour(hour, minute, period);
      const scheduledAt = `${scheduleDate}T${time24}:00Z`;

      // Preparar datos para actualización según la estructura del API
      const updateData = {
        scheduled_at: scheduledAt,
        details: maintenanceDetails,
        assigned_technician: parseInt(assignedTechnician),
        maintenance_type: parseInt(maintenanceType)
      };

      // Determinar el ID correcto (consistente con useEffect)
      const maintenanceId = requestData?.id_maintenance_scheduling || requestData?.id || requestData?.maintenance_id;

      // Llamada al endpoint de actualización de mantenimiento programado
      await updateMaintenanceScheduling(maintenanceId, updateData);
      
      // Llamar al callback de éxito para refrescar la lista y mostrar alerta
      if (onSuccess) {
        onSuccess('Mantenimiento programado actualizado exitosamente');
      }
      
      // Cerrar el modal después del éxito
      onClose();
      
    } catch (error) {
      let errorMessage = 'Error al actualizar el mantenimiento';
      
      // Manejar diferentes tipos de respuestas de error del API
      if (error.response?.data) {
        const apiError = error.response.data;
        
        // Si hay un mensaje principal
        if (apiError.message) {
          errorMessage = apiError.message;
        }
        
        // Si hay detalles de error específicos
        if (apiError.details) {
          const detailsArray = Array.isArray(apiError.details) 
            ? apiError.details 
            : Object.values(apiError.details).flat();
          
          if (detailsArray.length > 0) {
            errorMessage += `: ${detailsArray.join(', ')}`;
          }
        }
        
        // Si hay errores de campo específicos
        if (apiError.errors) {
          const fieldErrors = Object.entries(apiError.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          
          if (fieldErrors) {
            errorMessage += `. Errores de campo: ${fieldErrors}`;
          }
        }
        
        // Mensajes específicos para casos comunes
        if (apiError.message?.includes('cancelado')) {
          errorMessage = 'No se puede actualizar un mantenimiento que ha sido cancelado.';
        } else if (apiError.message?.includes('completado')) {
          errorMessage = 'No se puede actualizar un mantenimiento que ya ha sido completado.';
        }
        
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Solo usar callback del padre para mostrar error
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-theme w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-secondary hover:text-primary z-10"
        >
          ×
        </button>
        <h2 className="text-theme-2xl font-theme-bold mb-4 text-primary">Actualizar mantenimiento</h2>

        {/* Información de la solicitud */}
        <div className="border-primary rounded-theme-lg mb-4 border">
          <h3 className="font-theme-semibold px-6 pt-5 pb-3 text-primary">
            Información de la solicitud
          </h3>
          <div className="divide-y border-primary">
            <div className="grid grid-cols-2 border-primary text-theme-sm">
              <div className="px-6 py-3">
                <p className="text-secondary">Número de serie</p>
                <p className="mt-1 font-theme-medium text-primary">{maintenanceInfo.machinery_serial}</p>
              </div>
              <div className="px-6 py-3">
                <p className="text-secondary">Nombre de la máquina</p>
                <p className="mt-1 font-theme-medium text-primary">{maintenanceInfo.machinery_name}</p>
              </div>
            </div>
            <div className="px-6 py-3 text-theme-sm">
              <p className="text-secondary">Fecha programada</p>
              <p className="mt-1 font-theme-medium text-primary">{maintenanceInfo.scheduled_at}</p>
            </div>
          </div>
        </div>

        {/* Información del mantenimiento */}
        <div className="border-primary rounded-theme-lg mb-4 border">
          <h3 className="font-theme-semibold px-6 pt-5 pb-3 text-primary">
            Información del mantenimiento
          </h3>
          <div className="px-6 pb-4">
            <div className="grid grid-cols-3 gap-6 mb-4">
              {/* Fecha programada */}
              <div className="flex flex-col">
                <label
                  htmlFor="scheduleDate"
                  className="text-theme-sm text-secondary mb-1"
                >
                  Fecha programada*
                </label>
                <input
                  id="scheduleDate"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="input-theme w-full"
                />
              </div>

              {/* Hora programada */}
              <div className="flex flex-col">
                <label className="text-theme-sm text-secondary mb-1">
                  Hora programada*
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={parseInt(hour) || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
                        // mantener dos dígitos al guardar, con ‘01’ como valor por defecto
                        setHour(value === '' ? '01' : value.padStart(2, '0'));
                      }
                    }}
                    className="input-theme w-20 text-center"
                    placeholder="HH"
                  />
                  <span className="text-secondary font-theme-medium text-lg">:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={parseInt(minute) || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                        // mantener dos dígitos al guardar, con ‘00’ como valor por defecto
                        setMinute(value === '' ? '00' : value.padStart(2, '0'));
                      }
                    }}
                    className="input-theme w-20 text-center"
                    placeholder="MM"
                  />
                  <div className="relative">
                    <select
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="input-theme px-4 py-2 pr-8 min-w-[70px] appearance-none text-center font-theme-medium"
                      
                    > 
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                      
                    </select>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary pointer-events-none"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

                  

              {/* Técnico asignado */}
              <div className="flex flex-col">
                <label className="text-theme-sm text-secondary mb-1">
                  Técnico asignado*
                </label>
                <div className="relative">
                  <select
                    value={assignedTechnician}
                    onChange={(e) =>
                      setAssignedTechnician(e.target.value)
                    }
                    className="input-theme w-full pr-8 appearance-none"
                  >
                    <option value="">Seleccione un técnico...</option>
                    {technicians.map((technician) => (
                      <option key={technician.id_user || technician.id} value={technician.id_user || technician.id}>
                        {technician.name || technician.first_name + ' ' + technician.last_name || technician.username}
                      </option>
                    ))}
                  </select>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Detalles del mantenimiento completo horizontalmente */}
            <div className="mb-4">
              <label className="block text-theme-sm text-secondary mb-1">
                Detalles del mantenimiento*
              </label>
              <textarea
                value={maintenanceDetails}
                onChange={(e) =>
                  setMaintenanceDetails(e.target.value)
                }
                placeholder="Ingrese los detalles del mantenimiento..."
                rows={4}
                className="input-theme w-full resize-none"
              />
            </div>

            {/* Tipo de mantenimiento debajo */}
            <div>
              <label className="block text-theme-sm text-secondary mb-1">
                Tipo de mantenimiento*
              </label>
              <div className="relative">
                <select
                  value={maintenanceType}
                  onChange={(e) =>
                    setMaintenanceType(e.target.value)
                  }
                  className="input-theme w-full pr-8 appearance-none"
                >
                  <option value="">Seleccione un tipo...</option>
                  {maintenanceTypes.map((type) => (
                    <option key={type.id_types} value={type.id_types}>
                      {type.name}
                    </option>
                  ))}
                </select>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
            className={`btn-theme btn-primary ${
              isSubmitting || isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{
              padding: '0.75rem 3rem',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
            aria-label="Actualizar programación de mantenimiento"
          >
            {isLoading ? 'Cargando...' : isSubmitting ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>


      </div>
    </div>
  );
};

export default UpdateMaintenanceSchedule;
