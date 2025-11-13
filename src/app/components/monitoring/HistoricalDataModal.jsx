"use client";
import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FaTimes } from "react-icons/fa";
import { HistoricalCharts, PerformanceChart, FuelConsumptionChart } from "./HistoricalCharts";
import TableList from "../shared/TableList";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getMachineryList } from "@/services/machineryService";
import { getActiveWorkers } from "@/services/requestService";
import { getDataMacineryhOperator, getRequestData } from "@/services/monitoringService";

const HistoricalDataModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("general");
  // Función para obtener fechas por defecto
  const getDefaultDates = () => {
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);
    
    // Formatear para datetime-local usando hora local (YYYY-MM-DDTHH:MM:SS)
    const formatDateTime = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };
    
    return {
      startDate: formatDateTime(oneMonthAgo),
      endDate: formatDateTime(now)
    };
  };

  const [filters, setFilters] = useState({
    machinery: "",
    operator: "",
    startDate: "",
    endDate: ""
  });

  // Estados para datos dinámicos
  const [machineryList, setMachineryList] = useState([]);
  const [operatorsList, setOperatorsList] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Estados para datos de filtros aplicados
  const [filteredData, setFilteredData] = useState(null);
  const [loadingFilters, setLoadingFilters] = useState(false);

  // Estado para solicitud seleccionada
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Estado para datos específicos de la solicitud
  const [requestDetailData, setRequestDetailData] = useState(null);
  const [loadingRequestData, setLoadingRequestData] = useState(false);

  const [temporalFilter, setTemporalFilter] = useState({
    startDate: "",
    endDate: ""
  });

  // Datos de métricas generales (usar filteredData si existe, sino usar mock)
  const generalMetrics = filteredData ? {
    totalTime: filteredData.operating_time_hours || "--",
    averageSpeed: filteredData.average_speed || "--",
    averageConsumption: filteredData.average_consumption || "--",
    totalDistance: filteredData.total_distance_km || "--",
    effectiveWorkingHours: filteredData.effective_working_hours || "--"
  } : {
    totalTime: "--",
    averageSpeed: "--",
    averageConsumption: "--",
    totalDistance: "--",
    effectiveWorkingHours: "--"
  };

  // Datos de solicitudes completadas (usar filteredData si existe, sino usar array vacío)
  const completedRequests = filteredData?.requests ? filteredData.requests.map((request, index) => {
    // Extraer maquinarias del array id_machineries
    const machineryNames = request.id_machineries?.map(machinery => 
      `${machinery.name} (${machinery.serial})`
    ).join(', ') || 'N/A';
    
    // Extraer operadores del array id_operators
    const operatorNames = request.id_operators?.map(operator => 
      operator.name
    ).join(', ') || 'N/A';
    
    return {
      id: request.code,
      startDate: request.scheduled_date,
      finishDate: request.completion_date,
      machinery: machineryNames,
      operator: operatorNames,
      client: `${request.customer_name} (${request.legal_entity_name})`,
      distanceTraveled: request.total_distance_km,
      status: request.request_status_id,
      originalData: request // Guardar datos originales para mostrar detalles
    };
  }) : [];

  // Columns for completed requests table
  const tableColumns = [
    { accessorKey: "id", header: "ID de Solicitud" },
    { accessorKey: "startDate", header: "Fecha de inicio" },
    { accessorKey: "finishDate", header: "Fecha de finalización" },
    { accessorKey: "machinery", header: "Maquinaria" },
    { accessorKey: "operator", header: "Operador" },
    { accessorKey: "client", header: "Cliente" },
    { accessorKey: "distanceTraveled", header: "Distancia recorrida" },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ getValue }) => {
        const status = getValue();
        const getStatusStyle = (status) => {
          switch (status) {
            case 22:
              return { backgroundColor: '#D1FAE5', color: '#065F46' };
            default:
              return { backgroundColor: '#F3F4F6', color: '#374151' };
          }
        };

        return (
          <span className="px-2 py-1 rounded text-xs font-medium" style={getStatusStyle(status)}>
            Finalizada
          </span>
        );
      }
    },
    {
      accessorKey: "actions",
      header: "Detalle",
      cell: ({ row }) => (
        <button
          onClick={() => {
            setSelectedRequest(row.original);
            // Cargar datos específicos de la solicitud
            const requestCode = row.original.originalData.code;
            // Extraer el primer ID de maquinaria y operador de los arrays
            const machineryId = row.original.originalData.id_machineries?.[0]?.id;
            const operatorId = row.original.originalData.id_operators?.[0]?.id;
            loadRequestData(requestCode, machineryId, operatorId);
          }}
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Ver detalles
        </button>
      )
    }
  ];

  // Información de solicitud seleccionada
  const requestInfo = selectedRequest?.originalData ? {
    trackingCode: selectedRequest.originalData.code,
    client: `${selectedRequest.originalData.customer_name} (${selectedRequest.originalData.legal_entity_name})`,
    startDate: selectedRequest.originalData.scheduled_date,
    endDate: selectedRequest.originalData.completion_date,
    totalDistance: selectedRequest.originalData.total_distance_km,
    // Extraer maquinarias y operadores de los arrays
    machinery: selectedRequest.originalData.id_machineries?.map(m => `${m.name} (${m.serial})`).join(', ') || 'N/A',
    operator: selectedRequest.originalData.id_operators?.map(o => o.name).join(', ') || 'N/A',
    averageSpeed: selectedRequest.originalData.average_speed,
    averageConsumption: selectedRequest.originalData.average_consumption,
    effectiveWorkingHours: selectedRequest.originalData.effective_working_hours,
    operatingTimeHours: selectedRequest.originalData.operating_time_hours
  } : null;

  // Función para calcular porcentajes de estado de la maquinaria
  const calculateMachineryStatePercentages = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { off: 0, on: 0, inMotion: 0 };
    }

    // Buscar parámetros de Estado de Ignición y Estado de Movimiento
    const ignitionParam = data[0]?.parameters?.find(p => p.parameter_name === "Estado de Ignición");
    const movementParam = data[0]?.parameters?.find(p => p.parameter_name === "Estado de Movimiento");

    if (!ignitionParam || !movementParam) {
      return { off: 0, on: 0, inMotion: 0 };
    }

    const ignitionData = ignitionParam.data_points || [];
    const movementData = movementParam.data_points || [];

    // Combinar datos por timestamp
    const combinedData = ignitionData.map(ignitionPoint => {
      const movementPoint = movementData.find(mp => 
        mp.registered_at === ignitionPoint.registered_at
      );
      
      return {
        timestamp: ignitionPoint.registered_at,
        ignition: ignitionPoint.data,
        movement: movementPoint ? movementPoint.data : 0
      };
    });

    if (combinedData.length === 0) {
      return { off: 0, on: 0, inMotion: 0 };
    }

    // Calcular estados
    let offCount = 0;
    let onCount = 0;
    let inMotionCount = 0;

    combinedData.forEach(point => {
      if (point.ignition === 0) {
        offCount++; // Apagado
      } else if (point.ignition === 1 && point.movement === 0) {
        onCount++; // Encendido pero sin movimiento
      } else if (point.ignition === 1 && point.movement === 1) {
        inMotionCount++; // En movimiento
      }
    });

    const total = combinedData.length;
    return {
      off: Math.round((offCount / total) * 100),
      on: Math.round((onCount / total) * 100),
      inMotion: Math.round((inMotionCount / total) * 100)
    };
  };

  // Función para extraer datos específicos de parámetros
  const getParameterData = (data, parameterName) => {
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    
    const parameter = data[0]?.parameters?.find(p => p.parameter_name === parameterName);
    return parameter || null;
  };

  // Función para generar datos de gráfico de combustible
  const generateFuelConsumptionData = (data) => {
    const fuelParam = getParameterData(data, "Nivel de Combustible");
    const consumptionParam = getParameterData(data, "Consumo instantáneo");
    
    if (!fuelParam || !consumptionParam) return [];
    
    return fuelParam.data_points.map((point, index) => {
      const consumptionPoint = consumptionParam.data_points[index];
      return {
        time: new Date(point.registered_at).toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        fuelLevel: point.data,
        consumption: consumptionPoint ? consumptionPoint.data : 0,
        timestamp: point.registered_at
      };
    });
  };

  // Función para generar datos de gráfico de rendimiento
  const generatePerformanceData = (data) => {
    const speedParam = getParameterData(data, "Velocidad Actual");
    const rpmParam = getParameterData(data, "Revoluciones (RPM)");
    const tempParam = getParameterData(data, "Temperatura del Motor");
    const loadParam = getParameterData(data, "Carga del Motor");
    
    if (!speedParam || !rpmParam || !tempParam || !loadParam) return [];
    
    return speedParam.data_points.map((point, index) => {
      const rpmPoint = rpmParam.data_points[index];
      const tempPoint = tempParam.data_points[index];
      const loadPoint = loadParam.data_points[index];
      
      return {
        time: new Date(point.registered_at).toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        speed: point.data,
        rpm: rpmPoint ? rpmPoint.data : 0,
        temperature: tempPoint ? tempPoint.data : 0,
        engineLoad: loadPoint ? loadPoint.data : 0,
        timestamp: point.registered_at
      };
    });
  };

  // Función para filtrar datos por rango temporal
  const filterDataByTimeRange = (data, startDate, endDate) => {
    if (!data || !Array.isArray(data) || data.length === 0) return data;
    if (!startDate || !endDate) return data;

    // Comparar directamente los strings de fecha sin conversiones de zona horaria
    // startDate y endDate vienen como: "2025-11-12T21:57:37"
    // point.registered_at viene como: "2025-11-12T21:57:37.671318Z"
    
    return data.map(item => ({
      ...item,
      parameters: item.parameters?.map(param => ({
        ...param,
        data_points: param.data_points?.filter(point => {
          // Extraer solo la parte de fecha-hora sin milisegundos ni Z
          const pointTimeStr = point.registered_at.substring(0, 19);
          return pointTimeStr >= startDate && pointTimeStr <= endDate;
        }) || []
      })) || []
    }));
  };

  // Datos filtrados por rango temporal
  const getFilteredRequestData = () => {
    if (!requestDetailData) return null;
    
    if (temporalFilter.startDate && temporalFilter.endDate) {
      return filterDataByTimeRange(requestDetailData, temporalFilter.startDate, temporalFilter.endDate);
    }
    
    return requestDetailData;
  };

  // Obtener datos filtrados por rango temporal
  const filteredRequestData = getFilteredRequestData();

  // Datos de rendimiento general (usar datos filtrados si existe, sino usar mock)
  const performanceData = filteredRequestData ? {
    machineName: `${filteredRequestData[0]?.machinery_name || "N/A"} (${filteredRequestData[0]?.serial_number || "N/A"})`,
    totalOperatingTime: `${filteredRequestData[0]?.operating_time_hours || 0}h`,
    operator: filteredRequestData[0]?.user_name || selectedRequest?.operator || "N/A",
    averageConsumption: (() => {
      const consumptionParam = getParameterData(filteredRequestData, "Consumo instantáneo");
      return consumptionParam ? `${consumptionParam.statistics.average}L/h` : "0L/h";
    })(),
    totalGEvents: (() => {
      const eventsParam = getParameterData(filteredRequestData, "Eventos");
      return eventsParam ? eventsParam.data_points.length.toString() : "0";
    })(),
    averageTemperature: (() => {
      const tempParam = getParameterData(filteredRequestData, "Temperatura del Motor");
      return tempParam ? `${tempParam.statistics.average}°C` : "0°C";
    })(),
    averageEngineLoad: (() => {
      const loadParam = getParameterData(filteredRequestData, "Carga del Motor");
      return loadParam ? `${loadParam.statistics.average}%` : "0%";
    })(),
    chartData: (() => {
      const percentages = calculateMachineryStatePercentages(filteredRequestData);
      return [
        { 
          name: 'Viaje total', 
          off: percentages.off, 
          on: percentages.on, 
          inMotion: percentages.inMotion 
        }
      ];
    })()
  } : {
    machineName: "Excavadora CAT 320",
    totalOperatingTime: "10h",
    operator: "Juan Pérez",
    averageConsumption: "14L/h",
    totalGEvents: "5",
    averageTemperature: "78°C",
    averageEngineLoad: "76%",
    chartData: [
      { name: 'Viaje total', off: 23, on: 78, inMotion: 58 }
    ]
  };

  // Datos de G-Events (usar datos filtrados si existe, sino usar mock)
  const gEvents = filteredRequestData ? (() => {
    const eventsParam = getParameterData(filteredRequestData, "Eventos");
    const gValueParam = getParameterData(filteredRequestData, "Valor G de Evento");
    
    if (!eventsParam || !gValueParam) return [];
    
    return eventsParam.data_points.map((eventPoint, index) => {
      const gValuePoint = gValueParam.data_points[index];
      const gValue = gValuePoint ? (gValuePoint.data / 100).toFixed(1) : "0.0"; // Convertir de G*100 a G
      
      return {
        type: `Evento G ${Math.floor(eventPoint.data)}`,
        date: new Date(eventPoint.registered_at).toLocaleString('es-ES'),
        duration: "N/A", // No disponible en el JSON
        intensity: `${gValue}G`
      };
    });
  })() : [
    { type: "Intensidad de Frenado", date: "2024-01-17 10:30", duration: "30 min", intensity: "-0.8G" },
    { type: "Intensidad de Aceleración", date: "2024-01-17 10:30", duration: "10 min", intensity: "+0.9G" },
    { type: "Intensidad de Curva", date: "2024-01-17 10:30", duration: "15 min", intensity: "0.7G" }
  ];

  // Datos de OBD Faults (usar datos filtrados si existe, sino usar mock)
  const obdFaults = filteredRequestData ? (() => {
    const allFaults = [];
    
    // Buscar fallas OBD en todos los parámetros
    filteredRequestData[0]?.parameters?.forEach(param => {
      param.data_points?.forEach(point => {
        if (point.obd_fault && point.obd_fault_name) {
          allFaults.push({
            fault: point.obd_fault,
            example: point.obd_fault_name,
            date: new Date(point.registered_at).toLocaleString('es-ES')
          });
        }
      });
    });
    
    // Eliminar duplicados basándose en el código de falla
    const uniqueFaults = allFaults.filter((fault, index, self) => 
      index === self.findIndex(f => f.fault === fault.fault)
    );
    
    return uniqueFaults.length > 0 ? uniqueFaults : [];
  })() : [
    { fault: "P0171", example: "Ejemplo", date: "2024-01-11 17:30" },
    { fault: "P0177", example: "Ejemplo", date: "2024-01-11 17:32" }
  ];

  // Datos para gráficos específicos (usando datos filtrados)
  const fuelConsumptionChartData = filteredRequestData ? generateFuelConsumptionData(filteredRequestData) : [];
  const performanceChartData = filteredRequestData ? generatePerformanceData(filteredRequestData) : [];
  
  // Datos adicionales para métricas (usando datos filtrados)
  const additionalMetrics = filteredRequestData ? {
    totalDistance: `${filteredRequestData[0]?.total_distance_km || 0} km`,
    effectiveWorkingHours: `${filteredRequestData[0]?.effective_working_hours || 0}h`,
    averageSpeed: (() => {
      const speedParam = getParameterData(filteredRequestData, "Velocidad Actual");
      return speedParam ? `${speedParam.statistics.average} km/h` : "0 km/h";
    })(),
    maxSpeed: (() => {
      const speedParam = getParameterData(filteredRequestData, "Velocidad Actual");
      return speedParam ? `${speedParam.statistics.max_value} km/h` : "0 km/h";
    })(),
    fuelUsed: (() => {
      const fuelParam = getParameterData(filteredRequestData, "Combustible Usado (GPS)");
      return fuelParam ? `${fuelParam.statistics.average} L` : "0 L";
    })(),
    oilLevel: (() => {
      const oilParam = getParameterData(filteredRequestData, "Nivel de Aceite");
      return oilParam ? `${oilParam.statistics.average}%` : "0%";
    })()
  } : null;

  const handleApplyFilters = async () => {
    if (!filters.machinery && !filters.operator) {
      alert("Por favor selecciona al menos una maquinaria o un operador");
      return;
    }

    // Limpiar solicitud seleccionada y datos relacionados al aplicar nuevos filtros
    setSelectedRequest(null);
    setRequestDetailData(null);
    setTemporalFilter({
      startDate: "",
      endDate: ""
    });

    setLoadingFilters(true);
    try {
      const filterParams = {
        machinery_id: filters.machinery || undefined,
        operator_id: filters.operator || undefined,
        start_date: filters.startDate || undefined,
        end_date: filters.endDate || undefined
      };

      const response = await getDataMacineryhOperator(filterParams);
      setFilteredData(response);
    } catch (error) {
      console.error("Error applying filters:", error);

      // Manejo específico de errores
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        alert("La consulta está tomando más tiempo del esperado. Los datos pueden ser muy extensos. Por favor intenta con un rango de fechas más específico.");
      } else if (error.response?.status === 500) {
        alert("Error del servidor. Por favor intenta de nuevo en unos momentos.");
      } else {
        alert("Error al aplicar filtros. Verifica tu conexión e intenta de nuevo.");
      }
    } finally {
      setLoadingFilters(false);
    }
  };

  // Función para cargar datos específicos de la solicitud
  const loadRequestData = async (requestCode, machineryId, operatorId) => {
    setLoadingRequestData(true);
    try {
      const response = await getRequestData(requestCode, machineryId, operatorId);
      console.log("Request detail data:", response);
      setRequestDetailData(response);
      
      // Extraer fechas del JSON para llenar el filtro temporal
      if (response && Array.isArray(response) && response.length > 0) {
        const allDataPoints = [];
        
        // Recopilar todos los data_points de todos los parámetros
        response[0]?.parameters?.forEach(param => {
          if (param.data_points && Array.isArray(param.data_points)) {
            allDataPoints.push(...param.data_points);
          }
        });
        
        if (allDataPoints.length > 0) {
          // Ordenar por fecha y obtener el rango completo
          allDataPoints.sort((a, b) => new Date(a.registered_at) - new Date(b.registered_at));
          
          const startDate = allDataPoints[0].registered_at;
          const endDate = allDataPoints[allDataPoints.length - 1].registered_at;
          
          // Formatear para datetime-local (YYYY-MM-DDTHH:MM:SS)
          // Extraer la hora directamente del string UTC sin conversión
          const formatForDateTimeLocal = (dateStr) => {
            // Formato: "2025-11-12T21:57:37.671318Z"
            // Extraer: "2025-11-12T21:57:37"
            return dateStr.substring(0, 19);
          };
          
          setTemporalFilter({
            startDate: formatForDateTimeLocal(startDate),
            endDate: formatForDateTimeLocal(endDate)
          });
        }
      }
    } catch (error) {
      console.error("Error loading request data:", error);
    } finally {
      setLoadingRequestData(false);
    }
  };

  const handleApplyTemporalFilter = () => {
    console.log("Applying temporal filter:", temporalFilter);
    // Los datos se filtran automáticamente a través de getFilteredRequestData()
  };

  // Función para cargar datos iniciales
  const loadInitialData = async () => {
    setLoadingData(true);
    
    // Establecer fechas por defecto
    const defaultDates = getDefaultDates();
    setFilters(prev => ({
      ...prev,
      startDate: defaultDates.startDate,
      endDate: defaultDates.endDate
    }));
    
    try {
      // Cargar maquinaria
      const machineryResponse = await getMachineryList();
      if (machineryResponse.data) {
        const machineryData = Array.isArray(machineryResponse.data.data)
          ? machineryResponse.data.data
          : [];
        setMachineryList(machineryData);
      }

      // Cargar operarios
      const operatorsResponse = await getActiveWorkers();
      if (operatorsResponse) {
        const operatorsData = Array.isArray(operatorsResponse)
          ? operatorsResponse
          : [];
        setOperatorsList(operatorsData);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  // Función para limpiar todos los datos al cerrar el modal
  const clearModalData = () => {
    // Limpiar filtros
    setFilters({
      machinery: "",
      operator: "",
      startDate: "",
      endDate: ""
    });
    
    // Limpiar filtro temporal
    setTemporalFilter({
      startDate: "",
      endDate: ""
    });
    
    // Limpiar datos filtrados
    setFilteredData(null);
    
    // Limpiar solicitud seleccionada
    setSelectedRequest(null);
    
    // Limpiar datos de solicitud específica
    setRequestDetailData(null);
    
    // Resetear estados de carga
    setLoadingFilters(false);
    setLoadingData(false);
    setLoadingRequestData(false);
  };

  // useEffect para cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    } else {
      // Limpiar datos cuando se cierra el modal
      clearModalData();
    }
  }, [isOpen]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-[60]" />
        <Dialog.Content className="modal-theme fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[95vw] max-w-[1400px] max-h-[95vh] overflow-y-auto">

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b sticky top-0 modal-theme z-10" style={{ borderColor: 'var(--color-border)' }}>
            <Dialog.Title className="text-xl font-semibold text-primary">
              Datos históricos por Máquina u Operador
            </Dialog.Title>
            <Dialog.Close asChild>
              <button 
                aria-label="Cerrar modal" 
                className="p-2 text-secondary hover:text-primary rounded-full transition-colors cursor-pointer" 
                onClick={() => {
                  clearModalData();
                  onClose();
                }}
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="sr-only">Panel de monitoreo de datos históricos</Dialog.Description>

          <div className="p-6 space-y-6">

            {/* General Filter */}
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
              <h3 className="text-sm font-semibold text-primary mb-3">Filtro general</h3>
              <div className="mb-3 p-2 rounded text-xs text-secondary" style={{ backgroundColor: 'var(--color-background-tertiary)' }}>
                💡 <strong>Tip:</strong> Para consultas más rápidas, especifica un rango de fechas. Sin fechas, la consulta puede incluir todos los datos históricos.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-secondary mb-2">Maquinaria</label>
                  <select
                    className="input-theme w-full text-sm"
                    value={filters.machinery}
                    onChange={(e) => setFilters({ ...filters, machinery: e.target.value })}
                    disabled={loadingData}
                  >
                    <option value="">{loadingData ? "Cargando..." : "Seleccionar maquinaria"}</option>
                    {Array.isArray(machineryList) && machineryList.map((machinery) => (
                      <option key={machinery.id_machinery} value={machinery.id_machinery}>
                        {machinery.machinery_name} ({machinery.serial_number})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-secondary mb-2">Operador</label>
                  <select
                    className="input-theme w-full text-sm"
                    value={filters.operator}
                    onChange={(e) => setFilters({ ...filters, operator: e.target.value })}
                    disabled={loadingData}
                  >
                    <option value="">{loadingData ? "Cargando..." : "Seleccionar operador"}</option>
                    {Array.isArray(operatorsList) && operatorsList.map((operator) => (
                      <option key={operator.id} value={operator.id}>
                        {operator.name} {operator.first_last_name} {operator.second_last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-secondary mb-2">Fecha de inicio</label>
                  <input
                    type="datetime-local"
                    step="1"
                    className="input-theme w-full text-sm"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-secondary mb-2">Fecha de fin</label>
                  <input
                    type="datetime-local"
                    step="1"
                    className="input-theme w-full text-sm"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  className="btn-primary px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                  onClick={handleApplyFilters}
                  disabled={loadingFilters}
                >
                  {loadingFilters && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {loadingFilters ? "Consultando datos..." : "Aplicar"}
                </button>
              </div>
            </div>

            {/* General Metrics Information */}
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
              <h3 className="text-sm font-semibold text-primary mb-4">Información de Métricas Generales</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-secondary mb-1">Tiempo total</p>
                  <p className="text-sm font-bold text-primary">{generalMetrics.totalTime}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary mb-1">Velocidad promedio</p>
                  <p className="text-sm font-bold text-primary">{generalMetrics.averageSpeed}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary mb-1">Consumo promedio</p>
                  <p className="text-sm font-bold text-primary">{generalMetrics.averageConsumption}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary mb-1">Distancia total recorrida</p>
                  <p className="text-sm font-bold text-primary">{generalMetrics.totalDistance}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary mb-1">Horas efectivas de trabajo</p>
                  <p className="text-sm font-bold text-primary">{generalMetrics.effectiveWorkingHours}</p>
                </div>
              </div>
            </div>

            {/* Completed Requests Table */}
            <div>
              <h3 className="text-sm font-semibold text-primary mb-3">Solicitudes Completadas</h3>
              <TableList
                columns={tableColumns}
                data={completedRequests}
                loading={false}
                globalFilter=""
                onGlobalFilterChange={() => { }}
              />
            </div>

            {/* Mostrar detalles solo si hay una solicitud seleccionada */}
            {selectedRequest && (
              <div className="space-y-6">
                {/* Botón para volver */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    ← Volver a la lista
                  </button>
                  <h2 className="text-lg font-semibold text-primary">
                    Detalles de {selectedRequest.id}
                  </h2>
                </div>

                {/* Request Information */}
                <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                  <h3 className="text-sm font-semibold text-primary mb-3">Información de Solicitud</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-secondary mb-1">Código de seguimiento</p>
                      <p className="text-primary font-medium">{requestInfo?.trackingCode}</p>
                    </div>
                    <div>
                      <p className="text-secondary mb-1">Cliente</p>
                      <p className="text-primary font-medium">{requestInfo?.client}</p>
                    </div>
                    <div>
                      <p className="text-secondary mb-1">Fecha de inicio</p>
                      <p className="text-primary font-medium">{requestInfo?.startDate}</p>
                    </div>
                    <div>
                      <p className="text-secondary mb-1">Fecha de fin</p>
                      <p className="text-primary font-medium">{requestInfo?.endDate}</p>
                    </div>
                    <div>
                      <p className="text-secondary mb-1">Distancia total recorrida</p>
                      <p className="text-primary font-medium">{requestInfo?.totalDistance}</p>
                    </div>
                    <div>
                      <p className="text-secondary mb-1">Maquinaria</p>
                      <p className="text-primary font-medium">{requestInfo?.machinery}</p>
                    </div>
                    <div className="md:col-span-3">
                      <p className="text-secondary mb-1">Operador</p>
                      <p className="text-primary font-medium">{requestInfo?.operator}</p>
                    </div>
                  </div>
                </div>

                {/* Temporal Filter - Solo visible en detalles */}
                <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                  <h3 className="text-sm font-semibold text-primary mb-3">Filtro temporal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-secondary mb-2">Fecha de inicio</label>
                      <input
                        type="datetime-local"
                        step="1"
                        className="input-theme w-full text-sm"
                        value={temporalFilter.startDate}
                        onChange={(e) => setTemporalFilter({ ...temporalFilter, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-secondary mb-2">Fecha de fin</label>
                      <input
                        type="datetime-local"
                        step="1"
                        className="input-theme w-full text-sm"
                        value={temporalFilter.endDate}
                        onChange={(e) => setTemporalFilter({ ...temporalFilter, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      className="btn-primary px-6 py-2 rounded-lg text-sm font-medium"
                      onClick={handleApplyTemporalFilter}
                    >
                      Aplicar
                    </button>
                  </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex gap-1 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <button
                    onClick={() => setActiveTab("general")}
                    className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === "general" ? 'text-primary' : 'text-secondary hover:text-primary'}`}
                  >
                    Rendimiento General
                    {activeTab === "general" && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--color-primary)' }} />}
                  </button>
                  <button
                    onClick={() => setActiveTab("historical")}
                    className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === "historical" ? 'text-primary' : 'text-secondary hover:text-primary'}`}
                  >
                    Gráficas Históricas
                    {activeTab === "historical" && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--color-primary)' }} />}
                  </button>
                  <button
                    onClick={() => setActiveTab("performance")}
                    className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === "performance" ? 'text-primary' : 'text-secondary hover:text-primary'}`}
                  >
                    Información de Rendimiento
                    {activeTab === "performance" && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--color-primary)' }} />}
                  </button>
                  <button
                    onClick={() => setActiveTab("map")}
                    className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === "map" ? 'text-primary' : 'text-secondary hover:text-primary'}`}
                  >
                    Mapa Interactivo
                    {activeTab === "map" && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--color-primary)' }} />}
                  </button>
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                  {/* General Performance Tab */}
                  {activeTab === "general" && (
                    <div className="space-y-6">
                      <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                        <h3 className="text-base font-semibold text-primary mb-4">Rendimiento General</h3>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Left side - Machine info */}
                          <div className="flex gap-4">
                            <div className="w-16 h-16 rounded flex-shrink-0" style={{ backgroundColor: 'var(--color-background-tertiary)' }}>
                              <div className="w-full h-full flex items-center justify-center text-secondary text-xs">IMG</div>
                            </div>
                            <div className="flex-1 space-y-2 text-sm">
                              <p className="font-bold text-primary text-lg">{performanceData.machineName}</p>
                              <p className="text-secondary">Tiempo total de operación: <span className="text-primary font-medium">{performanceData.totalOperatingTime}</span></p>
                              <p className="text-secondary">Operador: <span className="text-primary font-medium">{performanceData.operator}</span></p>
                              <p className="text-secondary">Consumo promedio: <span className="text-primary font-medium">{performanceData.averageConsumption}</span></p>
                              <p className="text-secondary">Total eventos G: <span className="text-primary font-medium">{performanceData.totalGEvents}</span></p>
                              <p className="text-secondary">Temperatura promedio: <span className="text-primary font-medium">{performanceData.averageTemperature}</span></p>
                              <p className="text-secondary">Carga promedio del motor: <span className="text-primary font-medium">{performanceData.averageEngineLoad}</span></p>
                            </div>
                          </div>

                          {/* Right side - Chart */}
                          <div className="flex flex-col items-center justify-center w-full">
                            <h4 className="text-sm font-semibold text-primary mb-4">Gráfico de porcentaje de uso</h4>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={performanceData.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                                <XAxis
                                  dataKey="name"
                                  tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                                  axisLine={{ stroke: 'var(--color-border)' }}
                                />
                                <YAxis
                                  domain={[0, 100]}
                                  tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                                  axisLine={{ stroke: 'var(--color-border)' }}
                                  label={{ value: 'Porcentaje %', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: 'var(--color-text-secondary)' } }}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: 'var(--color-background)',
                                    borderColor: '#3B82F6',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                  }}
                                  formatter={(value) => `${value}%`}
                                />
                                <Legend
                                  wrapperStyle={{ fontSize: '12px' }}
                                  formatter={(value) => {
                                    const labels = {
                                      off: 'Apagado',
                                      on: 'Encendido',
                                      inMotion: 'En movimiento'
                                    };
                                    return labels[value] || value;
                                  }}
                                />
                                <Bar dataKey="off" fill="#1F2937" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="on" fill="#EAB308" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="inMotion" fill="#22C55E" radius={[8, 8, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Historical Charts Tab */}
                  {activeTab === "historical" && (
                    <div>
                      <HistoricalCharts 
                        data={filteredRequestData} 
                        fuelData={fuelConsumptionChartData}
                        performanceData={performanceChartData}
                        additionalMetrics={additionalMetrics}
                      />
                    </div>
                  )}

                  {/* Performance Information Tab */}
                  {activeTab === "performance" && (
                    <div className="space-y-6">
                      {/* Fuel Consumption Information */}
                      <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                        <h3 className="text-base font-semibold text-primary mb-4">Información de Consumo de Combustible</h3>
                        <FuelConsumptionChart 
                          data={fuelConsumptionChartData}
                          metrics={additionalMetrics}
                        />
                      </div>

                      {/* Performance Information */}
                      <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                        <h3 className="text-base font-semibold text-primary mb-4">Información de Rendimiento</h3>
                        <PerformanceChart 
                          data={performanceChartData}
                          metrics={additionalMetrics}
                        />
                      </div>

                      {/* G-Events and OBD Faults */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* G-Events */}
                        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                          <h3 className="text-sm font-semibold text-primary mb-4">Eventos G</h3>
                          <div className="space-y-3 text-xs">
                            {gEvents.map((event, index) => (
                              <div key={index} className="pb-3 border-b last:border-b-0" style={{ borderColor: 'var(--color-border)' }}>
                                <div className="flex items-start justify-between mb-1">
                                  <p className="font-medium text-primary">{event.type}</p>
                                  <span className="text-secondary text-[10px]">{event.date}</span>
                                </div>
                                <p className="text-secondary">Duración: <span className="text-primary font-medium">{event.duration}</span></p>
                                <p className="text-secondary">Intensidad: <span className="text-error font-bold">{event.intensity}</span></p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* OBD Faults */}
                        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                          <h3 className="text-sm font-semibold text-primary mb-4">Fallas OBD</h3>
                          <div className="space-y-3 text-xs">
                            {obdFaults.map((fault, index) => (
                              <div key={index} className="pb-3 border-b last:border-b-0" style={{ borderColor: 'var(--color-border)' }}>
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1 h-8 bg-error rounded"></div>
                                    <div>
                                      <p className="font-bold text-error text-sm">{fault.fault}</p>
                                      <p className="text-[10px] text-secondary">{fault.example}</p>
                                    </div>
                                  </div>
                                  <span className="text-[10px] text-secondary whitespace-nowrap">{fault.date}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interactive Map Tab */}
                  {activeTab === "map" && (
                    <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                      <div className="w-full h-[500px] flex items-center justify-center relative overflow-hidden rounded-lg" style={{ backgroundColor: '#D1D5DB' }}>
                        {/* Map placeholder */}
                        <p className="text-sm text-secondary">Mapa</p>

                        {/* Example route visualization */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 500">
                          {/* Outbound route (green) */}
                          <path
                            d="M 50 450 L 200 400"
                            stroke="#22C55E"
                            strokeWidth="4"
                            fill="none"
                          />

                          {/* Working route (blue) */}
                          <path
                            d="M 200 400 L 250 200 L 300 200 L 300 100 L 350 100 L 350 200 L 400 200 L 400 100 L 450 100"
                            stroke="#3B82F6"
                            strokeWidth="4"
                            fill="none"
                          />

                          {/* Return route (red) */}
                          <path
                            d="M 450 100 L 450 300 L 200 300"
                            stroke="#EF4444"
                            strokeWidth="4"
                            fill="none"
                          />

                          {/* Start marker (green) */}
                          <circle cx="50" cy="450" r="8" fill="white" stroke="#22C55E" strokeWidth="3" />

                          {/* Intermediate markers (blue) */}
                          <circle cx="200" cy="400" r="8" fill="white" stroke="#3B82F6" strokeWidth="3" />
                          <circle cx="450" cy="100" r="8" fill="white" stroke="#3B82F6" strokeWidth="3" />

                          {/* End marker (red) */}
                          <circle cx="200" cy="300" r="8" fill="white" stroke="#EF4444" strokeWidth="3" />
                        </svg>

                        {/* Legend */}
                        <div className="absolute bottom-4 left-4 p-3 rounded shadow-lg bg-white">
                          <div className="flex items-center gap-6 text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-1 rounded" style={{ backgroundColor: '#22C55E' }}></div>
                              <span className="text-gray-700">Salida</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-1 rounded" style={{ backgroundColor: '#3B82F6' }}></div>
                              <span className="text-gray-700">Trabajando</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-1 rounded" style={{ backgroundColor: '#EF4444' }}></div>
                              <span className="text-gray-700">Retorno</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default HistoricalDataModal;
