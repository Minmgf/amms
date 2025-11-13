"use client";
import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FaTimes, FaFileCsv, FaFileExcel } from "react-icons/fa";
import { HistoricalCharts, PerformanceChart, FuelConsumptionChart } from "./HistoricalCharts";
import DynamicRouteMap from "./DynamicRouteMap";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { downloadTelemetryReport, getHistoricalRequestData } from "@/services/monitoringService";
import { SuccessModal, ErrorModal, WarningModal } from "@/app/components/shared/SuccessErrorModal";

const RequestHistoricalModal = ({ isOpen, onClose, requestData }) => {
  const [activeTab, setActiveTab] = useState("historical");
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [temporalFilter, setTemporalFilter] = useState({
    startDate: "",
    endDate: ""
  });

  // Estados para datos históricos
  const [historicalData, setHistoricalData] = useState(null);
  const [loadingHistoricalData, setLoadingHistoricalData] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Función para cargar datos históricos de la solicitud
  const loadHistoricalData = async () => {
    if (!requestData?.tracking_code) return;
    
    setLoadingHistoricalData(true);
    setLoadingProgress(0);
    setLoadingMessage("Iniciando consulta de datos históricos...");
    
    // Simular progreso durante la carga
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev < 90) {
          const increment = Math.random() * 15 + 5; // Incremento aleatorio entre 5-20%
          const newProgress = Math.min(prev + increment, 90);
          
          // Actualizar mensaje según el progreso
          if (newProgress < 30) {
            setLoadingMessage("Conectando con el servidor...");
          } else if (newProgress < 60) {
            setLoadingMessage("Procesando datos de telemetría...");
          } else if (newProgress < 90) {
            setLoadingMessage("Generando gráficas y estadísticas...");
          }
          
          return newProgress;
        }
        return prev;
      });
    }, 800);
    
    try {
      const response = await getHistoricalRequestData(requestData.tracking_code);
      
      // Completar progreso
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setLoadingMessage("¡Datos cargados exitosamente!");
      
      setHistoricalData(response);
      
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
          const formatForDateTimeLocal = (dateStr) => {
            return dateStr.substring(0, 19);
          };
          
          setTemporalFilter({
            startDate: formatForDateTimeLocal(startDate),
            endDate: formatForDateTimeLocal(endDate)
          });
        }
      }
      
      // Pequeña pausa para mostrar el mensaje de éxito
      setTimeout(() => {
        setLoadingHistoricalData(false);
        setLoadingProgress(0);
        setLoadingMessage("");
      }, 1000);
      
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Error loading historical data:", error);
      
      // Verificar si es un error de timeout
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        setErrorMessage("La consulta está tardando más de lo esperado. Por favor, intenta con un rango de fechas más pequeño o contacta al administrador.");
      } else {
        setErrorMessage("Error al cargar los datos históricos. Por favor, intenta nuevamente.");
      }
      
      setShowErrorModal(true);
      setLoadingHistoricalData(false);
      setLoadingProgress(0);
      setLoadingMessage("");
    }
  };

  // Función para filtrar datos por rango temporal
  const filterDataByTimeRange = (data, startDate, endDate) => {
    if (!data || !Array.isArray(data) || data.length === 0) return data;
    if (!startDate || !endDate) return data;

    return data.map(item => ({
      ...item,
      parameters: item.parameters?.map(param => ({
        ...param,
        data_points: param.data_points?.filter(point => {
          const pointTimeStr = point.registered_at.substring(0, 19);
          return pointTimeStr >= startDate && pointTimeStr <= endDate;
        }) || []
      })) || []
    }));
  };

  // Obtener datos filtrados por rango temporal
  const getFilteredHistoricalData = () => {
    if (!historicalData) return null;
    
    if (temporalFilter.startDate && temporalFilter.endDate) {
      return filterDataByTimeRange(historicalData, temporalFilter.startDate, temporalFilter.endDate);
    }
    
    return historicalData;
  };

  // Función para extraer datos específicos de parámetros
  const getParameterData = (data, parameterName) => {
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    
    const parameter = data[0]?.parameters?.find(p => p.parameter_name === parameterName);
    return parameter || null;
  };

  // Función para calcular porcentajes de estado de la maquinaria
  const calculateMachineryStatePercentages = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { off: 0, on: 0, inMotion: 0 };
    }

    const ignitionParam = data[0]?.parameters?.find(p => p.parameter_name === "Estado de Ignición");
    const movementParam = data[0]?.parameters?.find(p => p.parameter_name === "Estado de Movimiento");

    if (!ignitionParam || !movementParam) {
      return { off: 0, on: 0, inMotion: 0 };
    }

    const ignitionData = ignitionParam.data_points || [];
    const movementData = movementParam.data_points || [];

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

    let offCount = 0;
    let onCount = 0;
    let inMotionCount = 0;

    combinedData.forEach(point => {
      if (point.ignition === 0) {
        offCount++;
      } else if (point.ignition === 1 && point.movement === 0) {
        onCount++;
      } else if (point.ignition === 1 && point.movement === 1) {
        inMotionCount++;
      }
    });

    const total = combinedData.length;
    return {
      off: Math.round((offCount / total) * 100),
      on: Math.round((onCount / total) * 100),
      inMotion: Math.round((inMotionCount / total) * 100)
    };
  };

  // Función para generar datos de gráfico de combustible
  const generateFuelConsumptionData = (data) => {
    const fuelParam = getParameterData(data, "Nivel de Combustible");
    const consumptionParam = getParameterData(data, "Consumo instantáneo");
    
    if (!fuelParam || !consumptionParam) return [];
    
    return fuelParam.data_points.map((point, index) => {
      const consumptionPoint = consumptionParam.data_points[index];
      return {
        time: point.registered_at.substring(11, 16),
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
    const eventsParam = getParameterData(data, "Eventos");
    
    if (!speedParam || !rpmParam || !tempParam || !loadParam) return [];
    
    return speedParam.data_points.map((point, index) => {
      const rpmPoint = rpmParam.data_points[index];
      const tempPoint = tempParam.data_points[index];
      const loadPoint = loadParam.data_points[index];
      
      const eventPoint = eventsParam?.data_points.find(
        e => e.registered_at === point.registered_at
      );
      
      return {
        time: point.registered_at.substring(11, 16),
        speed: point.data,
        rpm: rpmPoint ? rpmPoint.data : 0,
        temperature: tempPoint ? tempPoint.data : 0,
        engineLoad: loadPoint ? loadPoint.data : 0,
        gEvent: eventPoint ? eventPoint.data : null,
        timestamp: point.registered_at
      };
    });
  };

  // Obtener datos filtrados
  const filteredHistoricalData = getFilteredHistoricalData();

  // Use actual request data if available, otherwise use mock data
  const requestInfo = requestData ? {
    trackingCode: requestData.tracking_code || "SOL-2025-001",
    client: requestData.legal_entity_name || requestData.client_name || "Cliente no disponible",
    startDate: requestData.scheduled_date ? formatDate(requestData.scheduled_date) : "N/A",
    endDate: requestData.completion_date ? formatDate(requestData.completion_date) : "N/A",
    totalDistance: filteredHistoricalData ? `${filteredHistoricalData[0]?.total_distance_km || 0} km` : "150 km",
  } : {
    trackingCode: "SOL-2025-001",
    client: "Constructora El Dorado S.A.S",
    startDate: "15/01/2025",
    endDate: "28/01/2025",
    totalDistance: "150 km",
  };

  // Dynamic machinery information based on historical data
  const machineryInfo = filteredHistoricalData ? [{
    id: filteredHistoricalData[0]?.id_machinery || 1,
    name: `${filteredHistoricalData[0]?.machinery_name || "Maquinaria"} (${filteredHistoricalData[0]?.serial_number || "N/A"})`,
    totalOperatingTime: `${filteredHistoricalData[0]?.operating_time_hours || 0}h`,
    averageSpeed: (() => {
      const speedParam = getParameterData(filteredHistoricalData, "Velocidad Actual");
      return speedParam ? `${parseFloat(speedParam.statistics.average).toFixed(2)} km/h` : "0.00 km/h";
    })(),
    averageConsumption: (() => {
      const consumptionParam = getParameterData(filteredHistoricalData, "Consumo instantáneo");
      return consumptionParam ? `${parseFloat(consumptionParam.statistics.average).toFixed(2)}L/h` : "0.00L/h";
    })(),
    effectiveWorkingHours: `${filteredHistoricalData[0]?.effective_working_hours || 0}h`,
    operator: filteredHistoricalData[0]?.user_name || "N/A"
  }] : [
    {
      id: 1,
      name: "Excavadora CAT 320",
      totalOperatingTime: "10h",
      averageSpeed: "20 km/h",
      averageConsumption: "14L/h",
      effectiveWorkingHours: "7h",
      operator: "N/A"
    }
  ];

  // Dynamic time percentage chart data
  const timePercentageData = filteredHistoricalData ? (() => {
    const percentages = calculateMachineryStatePercentages(filteredHistoricalData);
    return [{
      machinery: `${filteredHistoricalData[0]?.machinery_name || "Maquinaria"}`,
      off: percentages.off,
      on: percentages.on,
      inMotion: percentages.inMotion
    }];
  })() : [
    { machinery: 'Excavadora CAT 320', off: 15, on: 85, inMotion: 72 }
  ];

  // Dynamic G-Events data
  const gEvents = filteredHistoricalData ? (() => {
    const eventsParam = getParameterData(filteredHistoricalData, "Eventos");
    const gValueParam = getParameterData(filteredHistoricalData, "Valor G de Evento");
    
    if (!eventsParam || !gValueParam) return [];
    
    return eventsParam.data_points.map((eventPoint, index) => {
      const gValuePoint = gValueParam.data_points[index];
      const gValue = gValuePoint ? (gValuePoint.data / 100).toFixed(1) : "0.0";
      
      return {
        type: `Evento G ${Math.floor(eventPoint.data)}`,
        date: new Date(eventPoint.registered_at).toLocaleString('es-ES'),
        duration: "N/A",
        intensity: `${gValue}G`
      };
    });
  })() : [
    { type: "Intensidad de Frenado", date: "2024-01-17 10:30", duration: "30 min", intensity: "-0.8G" },
    { type: "Intensidad de Aceleración", date: "2024-01-17 10:30", duration: "10 min", intensity: "+0.9G" },
    { type: "Intensidad de Curva", date: "2024-01-17 10:30", duration: "15 min", intensity: "0.7G" }
  ];

  // Dynamic OBD Faults data
  const obdFaults = filteredHistoricalData ? (() => {
    const allFaults = [];
    
    filteredHistoricalData[0]?.parameters?.forEach(param => {
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
    
    const uniqueFaults = allFaults.filter((fault, index, self) => 
      index === self.findIndex(f => f.fault === fault.fault)
    );
    
    return uniqueFaults.length > 0 ? uniqueFaults : [];
  })() : [
    { fault: "P0171", example: "Ejemplo", date: "2024-01-11 17:30" },
    { fault: "P0177", example: "Ejemplo", date: "2024-01-11 17:32" },
    { fault: "P0401", example: "Ejemplo", date: "2024-01-11 18:30" }
  ];

  // Datos para gráficos específicos
  const fuelConsumptionChartData = filteredHistoricalData ? generateFuelConsumptionData(filteredHistoricalData) : [];
  const performanceChartData = filteredHistoricalData ? generatePerformanceData(filteredHistoricalData) : [];

  const handleApplyTemporalFilter = () => {
    console.log("Applying temporal filter:", temporalFilter);
  };

  // useEffect para cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen && requestData?.tracking_code) {
      loadHistoricalData();
    }
  }, [isOpen, requestData?.tracking_code]);

  // Función para limpiar datos al cerrar el modal
  const clearModalData = () => {
    setHistoricalData(null);
    setTemporalFilter({
      startDate: "",
      endDate: ""
    });
    setLoadingHistoricalData(false);
    setLoadingProgress(0);
    setLoadingMessage("");
  };

  // Limpiar datos cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      clearModalData();
    }
  }, [isOpen]);

  const handleExportData = async (format) => {
    if (!requestInfo?.trackingCode) {
      setWarningMessage("No hay código de solicitud disponible para exportar");
      setShowWarningModal(true);
      return;
    }

    setIsExporting(true);
    
    try {
      const result = await downloadTelemetryReport(requestInfo.trackingCode, format);
      console.log('Export result:', result);
      
      // Verificar si hay datos disponibles
      if (result.success === false) {
        console.log('No data available, showing warning:', result.message);
        setWarningMessage(result.message);
        setShowWarningModal(true);
      } else {
        console.log('Export successful');
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error(`Error exporting ${format.toUpperCase()} report:`, error);
      console.log('Error response:', error.response);
      console.log('Error response data:', error.response?.data);
      
      // Intentar leer el mensaje del backend
      let backendMessage = null;
      
      // Si la respuesta es un blob, intentar leerlo como JSON
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const jsonData = JSON.parse(text);
          backendMessage = jsonData.message;
          console.log('Parsed error message from blob:', backendMessage);
        } catch (e) {
          console.log('Could not parse blob as JSON');
        }
      } else if (error.response?.data?.message) {
        backendMessage = error.response.data.message;
      } else if (error.response?.data?.detail) {
        backendMessage = error.response.data.detail;
      }
      
      if (backendMessage) {
        // Si el mensaje indica que no hay datos, usar warning en lugar de error
        if (backendMessage.toLowerCase().includes('no hay datos')) {
          setWarningMessage(backendMessage);
          setShowWarningModal(true);
        } else {
          setErrorMessage(backendMessage);
          setShowErrorModal(true);
        }
      } else if (error.response?.status === 204) {
        setWarningMessage("No hay datos disponibles");
        setShowWarningModal(true);
      } else if (error.message) {
        setErrorMessage(error.message);
        setShowErrorModal(true);
      } else {
        setErrorMessage("Error al generar el reporte");
        setShowErrorModal(true);
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-[60]" />
        <Dialog.Content className="modal-theme fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[95vw] max-w-[1400px] max-h-[95vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b sticky top-0 modal-theme z-10" style={{ borderColor: 'var(--color-border)' }}>
            <Dialog.Title className="text-xl font-semibold text-primary">
              Datos Históricos
            </Dialog.Title>
            <Dialog.Close asChild>
              <button 
                aria-label="Cerrar modal" 
                className={`p-2 rounded-full transition-colors ${
                  loadingHistoricalData 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-secondary hover:text-primary cursor-pointer'
                }`}
                onClick={loadingHistoricalData ? undefined : onClose}
                disabled={loadingHistoricalData}
                title={loadingHistoricalData ? "No se puede cerrar mientras se cargan los datos" : "Cerrar modal"}
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="sr-only">Panel de monitoreo de datos históricos de la solicitud</Dialog.Description>

          {/* Pantalla de carga minimalista */}
          {loadingHistoricalData && (
            <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
              <div className="text-center p-6 rounded-xl max-w-sm mx-4" style={{ backgroundColor: 'var(--color-background)', backdropFilter: 'blur(10px)' }}>
                {/* Spinner minimalista */}
                <div className="relative mx-auto mb-4 w-12 h-12">
                  <div 
                    className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'var(--color-primary)' }}
                  ></div>
                </div>
                
                {/* Mensaje simple */}
                <h3 className="text-base font-medium text-primary mb-2">Cargando datos...</h3>
                <p className="text-sm text-secondary">{loadingMessage}</p>
                
                {/* Barra de progreso minimalista */}
                <div className="w-full bg-gray-200 rounded-full h-1 mt-4">
                  <div 
                    className="h-1 rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${loadingProgress}%`,
                      backgroundColor: 'var(--color-primary)'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 space-y-6">
            
            {/* Request Information */}
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
              <h3 className="text-sm font-semibold text-primary mb-3">Información de Solicitud</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-secondary mb-1">Código de seguimiento</p>
                  <p className="text-primary font-medium">{requestInfo.trackingCode}</p>
                </div>
                <div>
                  <p className="text-secondary mb-1">Cliente</p>
                  <p className="text-primary font-medium">{requestInfo.client}</p>
                </div>
                <div>
                  <p className="text-secondary mb-1">Distancia total recorrida</p>
                  <p className="text-primary font-medium">{requestInfo.totalDistance}</p>
                </div>
                <div>
                  <p className="text-secondary mb-1">Fecha de inicio</p>
                  <p className="text-primary font-medium">{requestInfo.startDate}</p>
                </div>
                <div>
                  <p className="text-secondary mb-1">Fecha de fin</p>
                  <p className="text-primary font-medium">{requestInfo.endDate}</p>
                </div>                
              </div>
            </div>

            {/* Temporal Filter */}
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
              <h3 className="text-sm font-semibold text-primary mb-3">Filtro temporal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-secondary mb-2">Fecha de inicio</label>
                  <input 
                    type="datetime-local" 
                    className="input-theme w-full text-sm"
                    value={temporalFilter.startDate}
                    onChange={(e) => setTemporalFilter({...temporalFilter, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs text-secondary mb-2">Fecha de fin</label>
                  <input 
                    type="datetime-local" 
                    className="input-theme w-full text-sm"
                    value={temporalFilter.endDate}
                    onChange={(e) => setTemporalFilter({...temporalFilter, endDate: e.target.value})}
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

            {/* Machinery Information */}
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
              <h3 className="text-sm font-semibold text-primary mb-4">Información de Maquinaria</h3>
              
              {loadingHistoricalData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3 text-secondary">Cargando datos históricos...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {machineryInfo.map((machinery) => (
                    <div key={machinery.id} className="flex gap-4 items-start p-3 rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
                      <div className="w-16 h-16 rounded flex-shrink-0" style={{ backgroundColor: 'var(--color-background-tertiary)' }}>
                        <div className="w-full h-full flex items-center justify-center text-secondary text-xs">IMG</div>
                      </div>
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
                        <div>
                          <p className="text-secondary mb-1">Nombre</p>
                          <p className="text-primary font-medium">{machinery.name}</p>
                        </div>
                        <div>
                          <p className="text-secondary mb-1">Operador</p>
                          <p className="text-primary font-medium">{machinery.operator}</p>
                        </div>
                        <div>
                          <p className="text-secondary mb-1">Tiempo total de operación</p>
                          <p className="text-primary font-medium">{machinery.totalOperatingTime}</p>
                        </div>
                        <div>
                          <p className="text-secondary mb-1">Velocidad promedio</p>
                          <p className="text-primary font-medium">{machinery.averageSpeed}</p>
                        </div>
                        <div>
                          <p className="text-secondary mb-1">Consumo promedio</p>
                          <p className="text-primary font-medium">{machinery.averageConsumption}</p>
                        </div>
                        <div>
                          <p className="text-secondary mb-1">Horas efectivas de trabajo</p>
                          <p className="text-primary font-medium">{machinery.effectiveWorkingHours}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Export Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <button 
                  className="btn-theme btn-secondary flex items-center gap-2 px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleExportData('csv')}
                  disabled={isExporting}
                >
                  <FaFileCsv className="w-4 h-4" />
                  {isExporting ? 'Exportando...' : 'Exportar CSV'}
                </button>
                <button 
                  className="btn-theme btn-primary flex items-center gap-2 px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleExportData('excel')}
                  disabled={isExporting}
                >
                  <FaFileExcel className="w-4 h-4" />
                  {isExporting ? 'Exportando...' : 'Exportar Excel'}
                </button>
              </div>
            </div>

            {/* Time Percentage Chart */}
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
              <h3 className="text-sm font-semibold text-primary mb-4">Gráfico de porcentaje de tiempo</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={timePercentageData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                  <XAxis 
                    dataKey="machinery" 
                    tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
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
                    wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
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

            {/* Tabs Navigation */}
            <div className="flex gap-1 border-b" style={{ borderColor: 'var(--color-border)' }}>
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
              
              {/* Historical Charts Tab */}
              {activeTab === "historical" && (
                <div>
                  {loadingHistoricalData ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      <span className="ml-4 text-secondary">Cargando gráficas históricas...</span>
                    </div>
                  ) : (
                    <HistoricalCharts data={filteredHistoricalData} />
                  )}
                </div>
              )}

              {/* Performance Information Tab */}
              {activeTab === "performance" && (
                <div className="space-y-6">
                  {/* Fuel Consumption Information */}
                  <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                    <h3 className="text-base font-semibold text-primary mb-4">Información de Consumo de Combustible</h3>
                    {loadingHistoricalData ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-3 text-secondary">Cargando datos de combustible...</span>
                      </div>
                    ) : (
                      <FuelConsumptionChart data={fuelConsumptionChartData} />
                    )}
                  </div>

                  {/* Performance Information */}
                  <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                    <h3 className="text-base font-semibold text-primary mb-4">Información de Rendimiento</h3>
                    {loadingHistoricalData ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-3 text-secondary">Cargando datos de rendimiento...</span>
                      </div>
                    ) : (
                      <PerformanceChart data={performanceChartData} />
                    )}
                  </div>

                  {/* Chart Information */}
                  <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                    <h3 className="text-base font-semibold text-primary mb-4">Información del Gráfico</h3>
                    <div className="flex items-center gap-8 mb-6 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                        <span className="text-secondary">Frenado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <span className="text-secondary">Aceleración</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        <span className="text-secondary">Curva</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                        <span className="text-secondary">Apagado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                        <span className="text-secondary">Estacionario</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-400"></div>
                        <span className="text-secondary">En movimiento</span>
                      </div>
                    </div>

                    {/* G-Events and OBD Faults */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* G-Events */}
                      <div>
                        <h4 className="text-sm font-semibold text-primary mb-3">Eventos G</h4>
                        <div className="space-y-3 text-xs">
                          {gEvents.map((event, index) => (
                            <div key={index} className="pb-3 border-b last:border-b-0" style={{ borderColor: 'var(--color-border)' }}>
                              <div className="flex items-start justify-between mb-1">
                                <p className="font-medium text-primary">{event.type}</p>
                                <span className="text-secondary text-[10px]">{event.date}</span>
                              </div>
                              <p className="text-secondary">Duración: <span className="text-primary font-medium">{event.duration}</span></p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* OBD Faults */}
                      <div>
                        <h4 className="text-sm font-semibold text-primary mb-3">Fallas OBD</h4>
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
                </div>
              )}

              {/* Interactive Map Tab */}
              {activeTab === "map" && (
                <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                  <h3 className="text-base font-semibold text-primary mb-4">Mapa de Rutas</h3>
                  {loadingHistoricalData ? (
                    <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                        <p className="text-secondary">Cargando datos del mapa...</p>
                      </div>
                    </div>
                  ) : filteredHistoricalData ? (
                    <DynamicRouteMap requestData={filteredHistoricalData} />
                  ) : (
                    <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 rounded-lg">
                      <p className="text-gray-600">No hay datos disponibles para mostrar en el mapa</p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </Dialog.Content>
      </Dialog.Portal>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Exportación Exitosa"
        message="El reporte se ha generado y descargado correctamente."
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error en la Exportación"
        message={errorMessage}
        buttonText="Cerrar"
      />

      {/* Warning Modal */}
      <WarningModal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        title="Sin Datos Disponibles"
        message={warningMessage}
        buttonText="Aceptar"
      />
    </Dialog.Root>
  );
};

export default RequestHistoricalModal;
