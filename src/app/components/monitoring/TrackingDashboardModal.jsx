"use client";
import React, { useState, useMemo, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FaTimes, FaSignal, FaMapMarkerAlt } from "react-icons/fa";
import { MdPowerSettingsNew, MdDirectionsCar, MdLocationOn } from "react-icons/md";
import { GaugeCard, CircularProgress, PerformanceChart, FuelConsumptionChart, MapTooltip, RealTimeMap } from "./TrackingDashboardComponents";
import { ErrorModal } from "@/app/components/shared/SuccessErrorModal";
import { useTrackingWebSocket } from "@/hooks/useTrackingWebSocket";
import { getRequestDetails } from "@/services/requestService";
import "@/styles/tracking-animations.css";

const TrackingDashboardModal = ({ isOpen, onClose, requestData }) => {
  const [selectedMachinery, setSelectedMachinery] = useState(0);
  const [activeTab, setActiveTab] = useState("performance");
  const [requestDetails, setRequestDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Estado solo para tooltip del mapa
  const [mapTooltip, setMapTooltip] = useState({ visible: false, machinery: null, position: null });
  
  // Estado para almacenar datos históricos de cada maquinaria
  const [historicalData, setHistoricalData] = useState({});
  
  // Estado para datos formateados de las gráficas
  const [chartData, setChartData] = useState({});
  
  // Estado para histórico de fallas OBD
  const [obdFaultsHistory, setObdFaultsHistory] = useState({});
  
  // Estado para histórico de eventos G
  const [gEventsHistory, setGEventsHistory] = useState({});
  
  // Estado para modal de error de timeout
  const [isTimeoutErrorOpen, setIsTimeoutErrorOpen] = useState(false);
  const [timeoutErrorMessage, setTimeoutErrorMessage] = useState("");
  
  // Cargar datos históricos desde localStorage al montar el componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedData = localStorage.getItem('telemetry_historical_data');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setHistoricalData(parsedData);
        }
        
        const storedOBD = localStorage.getItem('telemetry_obd_faults_history');
        if (storedOBD) {
          const parsedOBD = JSON.parse(storedOBD);
          setObdFaultsHistory(parsedOBD);
        }
        
        const storedGEvents = localStorage.getItem('telemetry_g_events_history');
        if (storedGEvents) {
          const parsedGEvents = JSON.parse(storedGEvents);
          setGEventsHistory(parsedGEvents);
        }
      } catch (error) {
        // Error al cargar datos históricos desde localStorage
      }
    }
  }, []);
  
  // Guardar datos históricos en localStorage cuando se actualizan
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(historicalData).length > 0) {
      try {
        localStorage.setItem('telemetry_historical_data', JSON.stringify(historicalData));
      } catch (error) {
        // Error al guardar datos históricos en localStorage
      }
    }
  }, [historicalData]);
  
  // Guardar histórico de fallas OBD en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(obdFaultsHistory).length > 0) {
      try {
        localStorage.setItem('telemetry_obd_faults_history', JSON.stringify(obdFaultsHistory));
      } catch (error) {
        // Error al guardar histórico de fallas OBD
      }
    }
  }, [obdFaultsHistory]);
  
  // Guardar histórico de eventos G en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(gEventsHistory).length > 0) {
      try {
        localStorage.setItem('telemetry_g_events_history', JSON.stringify(gEventsHistory));
      } catch (error) {
        // Error al guardar histórico de eventos G
      }
    }
  }, [gEventsHistory]);
  
  // Función para limpiar datos históricos
  const clearHistoricalData = () => {
    setHistoricalData({});
    setChartData({});
    setObdFaultsHistory({});
    setGEventsHistory({});
    if (typeof window !== 'undefined') {
      localStorage.removeItem('telemetry_historical_data');
      localStorage.removeItem('telemetry_obd_faults_history');
      localStorage.removeItem('telemetry_g_events_history');
    }
  };
  
  // Función para generar datos de prueba
  const generateTestData = () => {
    const testImei = '357894561234567';
    const testData = [];
    
    // Generar 15 puntos de datos de prueba (más puntos para mejor visualización)
    for (let i = 0; i < 15; i++) {
      const timestamp = new Date(Date.now() - (14 - i) * 30000).toISOString(); // Cada 30 segundos
      testData.push({
        timestamp,
        speed: Math.floor(Math.random() * 60) + 80, // 80-140 km/h
        rpm: Math.floor(Math.random() * 1000) + 3500, // 3500-4500 RPM
        engineTemp: Math.floor(Math.random() * 20) + 90, // 90-110°C
        fuelLevel: Math.floor(Math.random() * 30) + 50, // 50-80%
        fuelUsedGps: 150 + Math.random() * 20,
        instantConsumption: Math.random() * 10 + 15, // 15-25 L/h
        eventType: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : null,
        eventGValue: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 10 : 0,
        engineLoad: Math.floor(Math.random() * 40) + 30
      });
    }
    
    setHistoricalData({ [testImei]: testData });
  };
  
  // Extraer IMEIs de las maquinarias de la solicitud
  const machineryImeis = useMemo(() => {
    if (!requestDetails || !requestDetails.machineries) return null;
    return requestDetails.machineries
      .filter(m => m.telemetry_device_imei)
      .map(m => m.telemetry_device_imei);
  }, [requestDetails]);
  
  // Hook de WebSocket de telemetría con filtro de IMEIs y request ID
  // El requestId debe ser el Código de Seguimiento (tracking_code)
  const requestId = requestData?.tracking_code || requestData?.id;
  const { machineriesData, connectionStatus, reconnect, alerts, timeoutMessage } = useTrackingWebSocket({ 
    requestId: requestId,
    imeiFilter: machineryImeis
  });

  // Mostrar modal de error cuando hay timeout
  useEffect(() => {
    if (timeoutMessage) {
      const errorMsg = `No se han recibido datos para la solicitud ${timeoutMessage.request_id} en ${timeoutMessage.timeout_seconds} segundos. La conexión se ha cerrado.`;
      setTimeoutErrorMessage(errorMsg);
      setIsTimeoutErrorOpen(true);
    }
  }, [timeoutMessage]);

  // Verificar si el WebSocket está recibiendo datos
  useEffect(() => {
    // Monitoreo de estado del WebSocket
  }, [machineriesData, connectionStatus, requestId, machineryImeis, requestData, timeoutMessage]);
  
  // Limpiar datos históricos cuando cambia la solicitud
  useEffect(() => {
    if (requestData && requestData.id) {
      // Limpiar datos históricos para evitar mezclar datos de diferentes solicitudes
      setHistoricalData({});
      setChartData({});
      setObdFaultsHistory({});
      setGEventsHistory({});
      setSelectedMachinery(0);
    }
  }, [requestData?.id]);

  // Cargar detalles de la solicitud cuando se abre el modal
  useEffect(() => {
    const loadRequestDetails = async () => {
      if (!isOpen || !requestData || !requestData.id) return;
      
      setLoadingDetails(true);
      try {
        const details = await getRequestDetails(requestData.id);
        setRequestDetails(details);
      } catch (error) {
        // Error al cargar detalles de la solicitud
      } finally {
        setLoadingDetails(false);
      }
    };
    
    loadRequestDetails();
  }, [isOpen, requestData]);

  // Almacenar datos históricos cuando llegan del WebSocket
  useEffect(() => {
    if (!machineriesData || Object.keys(machineriesData).length === 0) {
      return;
    }

    setHistoricalData(prev => {
      const newData = { ...prev };
      let dataAdded = false;
      
      Object.entries(machineriesData).forEach(([imei, data]) => {
        if (!newData[imei]) {
          newData[imei] = [];
        }
        
        // Agregar nuevo punto de datos con timestamp
        const dataPoint = {
          timestamp: data.timestamp || new Date().toISOString(),
          speed: data.speed !== null && data.speed !== undefined ? data.speed : 0,
          rpm: data.rpm !== null && data.rpm !== undefined ? data.rpm : 0,
          engineTemp: data.engineTemp !== null && data.engineTemp !== undefined ? data.engineTemp : 0,
          fuelLevel: data.fuelLevel !== null && data.fuelLevel !== undefined ? data.fuelLevel : 0,
          fuelUsedGps: data.fuelUsedGps !== null && data.fuelUsedGps !== undefined ? data.fuelUsedGps : 0,
          instantConsumption: data.instantConsumption !== null && data.instantConsumption !== undefined ? data.instantConsumption : 0,
          eventType: data.eventType || null,
          eventGValue: data.eventGValue || 0,
          engineLoad: data.engineLoad !== null && data.engineLoad !== undefined ? data.engineLoad : 0
        };
        
        // Verificar si el último punto tiene el mismo timestamp (evitar duplicados)
        const lastPoint = newData[imei][newData[imei].length - 1];
        if (!lastPoint || lastPoint.timestamp !== dataPoint.timestamp) {
          newData[imei].push(dataPoint);
          dataAdded = true;
        }
        
        // Mantener solo los últimos 50 puntos (aproximadamente 25 minutos de datos)
        if (newData[imei].length > 50) {
          newData[imei] = newData[imei].slice(-50);
        }
      });
      
      return newData;
    });
  }, [machineriesData]);

  // Almacenar histórico de fallas OBD y eventos G
  useEffect(() => {
    if (!machineriesData || Object.keys(machineriesData).length === 0) return;

    setObdFaultsHistory(prev => {
      const newOBDData = { ...prev };
      
      Object.entries(machineriesData).forEach(([imei, data]) => {
        if (data.obdFaults && Array.isArray(data.obdFaults) && data.obdFaults.length > 0) {
          if (!newOBDData[imei]) {
            newOBDData[imei] = [];
          }
          
          data.obdFaults.forEach(faultCode => {
            // faultCode es un string como "P0135"
            const faultWithTimestamp = {
              code: faultCode,
              timestamp: data.timestamp || new Date().toISOString(),
              imei
            };
            
            // Evitar duplicados - buscar por código y timestamp
            const isDuplicate = newOBDData[imei].some(f => 
              f.code === faultCode && f.timestamp === faultWithTimestamp.timestamp
            );
            
            if (!isDuplicate) {
              // Agregar al inicio (nuevos primero)
              newOBDData[imei].unshift(faultWithTimestamp);
            }
          });
          
          // Mantener solo los últimos 50 registros
          if (newOBDData[imei].length > 50) {
            newOBDData[imei] = newOBDData[imei].slice(0, 50);
          }
        }
      });
      
      return newOBDData;
    });

    setGEventsHistory(prev => {
      const newGEventsData = { ...prev };
      
      Object.entries(machineriesData).forEach(([imei, data]) => {
        // Solo agregar si hay un evento válido (eventType no es null)
        if (data.eventType !== null && data.eventType !== undefined && data.eventType !== 0) {
          if (!newGEventsData[imei]) {
            newGEventsData[imei] = [];
          }
          
          const gEvent = {
            timestamp: data.timestamp || new Date().toISOString(),
            eventType: data.eventType,
            eventGValue: data.eventGValue || 0,
            imei
          };
          
          // Evitar duplicados por timestamp y tipo de evento
          const isDuplicate = newGEventsData[imei].some(e => 
            e.eventType === gEvent.eventType && e.timestamp === gEvent.timestamp
          );
          
          if (!isDuplicate) {
            // Agregar al inicio (nuevos primero)
            newGEventsData[imei].unshift(gEvent);
          }
          
          // Mantener solo los últimos 50 registros
          if (newGEventsData[imei].length > 50) {
            newGEventsData[imei] = newGEventsData[imei].slice(0, 50);
          }
        }
      });
      
      return newGEventsData;
    });
  }, [machineriesData]);

  // Verificar históricos de OBD y eventos G
  useEffect(() => {
    // Monitoreo de histórico de OBD y eventos G
  }, [obdFaultsHistory, gEventsHistory]);

  // Formatear datos para las gráficas cuando se actualizan los datos históricos
  useEffect(() => {
    if (!historicalData || Object.keys(historicalData).length === 0) return;

    const formattedChartData = {};
    
    Object.entries(historicalData).forEach(([imei, dataPoints]) => {
      
      // Formatear datos para gráfica de rendimiento (Velocidad vs RPM)
      const performanceData = dataPoints.map(point => {
        const time = new Date(point.timestamp);
        const timeStr = time.toLocaleTimeString('es-CO', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        });
        
        // Determinar el tipo de evento para el marcador
        let event = null;
        if (point.eventType === 1) event = 'acceleration';
        else if (point.eventType === 2) event = 'braking';
        else if (point.eventType === 3) event = 'curve';
        else if (point.speed > 0 && point.rpm > 0) event = 'motion';
        else if (point.speed === 0 && point.rpm > 0) event = 'stationary';
        else event = 'off';
        
        return {
          time: timeStr,
          speed: point.speed,
          rpm: point.rpm,
          event: event,
          eventGValue: point.eventGValue,
          timestamp: point.timestamp
        };
      });
      
      // Formatear datos para gráfica de consumo de combustible
      const fuelConsumptionData = dataPoints.map(point => {
        const time = new Date(point.timestamp);
        const timeStr = time.toLocaleTimeString('es-CO', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        });
        
        return {
          time: timeStr,
          fuelLevel: point.fuelLevel,
          consumption: point.instantConsumption,
          fuelUsedGps: point.fuelUsedGps,
          timestamp: point.timestamp
        };
      });
      
      formattedChartData[imei] = {
        performance: performanceData,
        fuelConsumption: fuelConsumptionData
      };
      
      console.log(`✅ Gráficas formateadas para ${imei}:`, {
        performancePoints: performanceData.length,
        fuelPoints: fuelConsumptionData.length
      });
    });
    
    setChartData(formattedChartData);
    console.log('📊 Datos de gráficas actualizados:', formattedChartData);
    console.log('📊 chartData state actualizado con', Object.keys(formattedChartData).length, 'IMEIs');
  }, [historicalData]);

  // Debug: Verificar chartData
  useEffect(() => {
    console.log('🔍 chartData actual:', chartData);
    console.log('🔍 chartData keys:', Object.keys(chartData));
    Object.entries(chartData).forEach(([imei, data]) => {
      console.log(`🔍 IMEI ${imei}:`, {
        performancePoints: data.performance?.length || 0,
        fuelPoints: data.fuelConsumption?.length || 0
      });
    });
  }, [chartData]);

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper function to format values with "No aplica" fallback
  const formatValue = (value, unit = "") => {
    if (value === null || value === undefined) return "No aplica";
    return `${value}${unit ? ` ${unit}` : ""}`;
  };

  // Información de la solicitud
  const requestInfo = requestData ? {
    trackingCode: requestData.tracking_code || "Sin código",
    client: requestData.legal_entity_name || requestData.client_name || "Sin cliente",
    startDate: requestData.scheduled_date ? formatDate(requestData.scheduled_date) : "Sin fecha",
    endDate: requestData.completion_date ? formatDate(requestData.completion_date) : "Sin fecha",
    placeName: requestData.place_name || "Sin lugar"
  } : {
    trackingCode: "Sin código",
    client: "Sin cliente",
    startDate: "Sin fecha",
    endDate: "Sin fecha",
    placeName: "Sin lugar"
  };

  // Convertir datos del WebSocket a formato de interfaz combinando con datos de la solicitud
  const machineries = useMemo(() => {
    const imeis = Object.keys(machineriesData);
    
    if (imeis.length === 0) {
      return [];
    }
    
    return imeis.map((imei, index) => {
      const data = machineriesData[imei];
      const hasAlert = alerts.some(alert => alert.imei === imei);
      
      // Buscar información de la maquinaria en los detalles de la solicitud
      const machineryInfo = requestDetails?.machineries?.find(
        m => m.telemetry_device_imei === imei
      );
      
      return {
        id: index + 1,
        imei: imei,
        serial: data.serialNumber || machineryInfo?.machinery_serial || imei,
        name: data.machineryName || machineryInfo?.machinery_name || `Maquinaria ${imei.slice(-4)}`,
        operator: data.operatorName || machineryInfo?.operator_name || "Operador asignado",
        implement: machineryInfo?.implement_name || "Sin implemento",
        photo: machineryInfo?.machinery_photo || null,
        currentSpeed: data.speed !== null ? `${data.speed} km/h` : "0 km/h",
        speed: data.speed,
        fuelLevel: data.fuelLevel !== null ? `${data.fuelLevel}%` : "--",
        ignition: data.ignition || false,
        moving: data.moving || false,
        gsmSignal: data.gsmSignal || 0,
        lastUpdate: data.relativeTime || "Sin datos",
        status: hasAlert ? "alert" : data.status,
        location: data.location,
        rpm: data.rpm,
        engineTemp: data.engineTemp,
        engineLoad: data.engineLoad,
        oilLevel: data.oilLevel,
        fuelUsedGps: data.fuelUsedGps,
        instantConsumption: data.instantConsumption,
        obdFaults: data.obdFaults,
        odometerTotal: data.odometerTotal,
        odometerTrip: data.odometerTrip,
        eventType: data.eventType,
        eventGValue: data.eventGValue,
        timestamp: data.timestamp,
        consumptionPrediction: data.consumptionPrediction,
        consumptionComparison: data.consumptionComparison,
        raw: data.raw
      };
    });
  }, [machineriesData, alerts, requestDetails]);

  // Función para formatear odómetro
  const formatOdometer = (meters) => {
    if (!meters) return "0 0 0 0 0 0";
    const km = Math.floor(meters / 1000);
    const kmStr = String(km).padStart(6, '0');
    return kmStr.split('').join(' ');
  };

  // Obtener datos de la maquinaria seleccionada
  const selectedMachineryData = useMemo(() => {
    if (!machineries.length || selectedMachinery >= machineries.length) {
      return null;
    }
    
    const machinery = machineries[selectedMachinery];
    const hasRpmAlert = alerts.some(a => a.imei === machinery.imei && a.parameter === 'rpm');
    
    // Obtener umbrales del JSON si existen, sino usar valores por defecto
    const getThresholds = () => {
      const thresholds = {};
      if (machinery.raw?.thresholds) {
        return machinery.raw.thresholds;
      }
      // Valores por defecto si no vienen en el JSON
      return {
        speed_max: 180,
        rpm_max: 3000,
        engine_temp_max: 120,
        fuel_level_min: 20
      };
    };

    const thresholds = getThresholds();

    return {
      currentSpeed: {
        value: machinery.currentSpeed !== null && machinery.currentSpeed !== "0 km/h" ? parseInt(machinery.currentSpeed) : 0,
        hasData: machinery.speed !== null,
        max: thresholds.speed_max || 180,
        unit: "km/h"
      },
      rpm: { 
        value: machinery.rpm || 0,
        hasData: machinery.rpm !== null,
        max: thresholds.rpm_max || 3000, 
        unit: "RPM", 
        alert: hasRpmAlert 
      },
      engineTemp: { 
        value: machinery.engineTemp || 0,
        hasData: machinery.engineTemp !== null,
        min: 0, 
        max: thresholds.engine_temp_max || 120, 
        alertThreshold: thresholds.engine_temp_max ? thresholds.engine_temp_max * 0.92 : 110,
        unit: "°C" 
      },
      fuelLevel: { 
        value: machinery.fuelLevel !== "--" ? parseInt(machinery.fuelLevel) : 0,
        hasData: machinery.fuelLevel !== null && machinery.fuelLevel !== "--",
        alertThreshold: thresholds.fuel_level_min || 20,
        unit: "%" 
      },
      oilLoad: { 
        value: machinery.oilLevel || 0,
        hasData: machinery.oilLevel !== null,
        unit: "%" 
      },
      engineLoad: { 
        value: machinery.engineLoad || 0,
        hasData: machinery.engineLoad !== null,
        unit: "%" 
      },
      totalOdometer: { 
        value: formatOdometer(machinery.odometerTotal),
        hasData: machinery.odometerTotal !== null,
        unit: "km" 
      },
      tripOdometer: { 
        value: formatOdometer(machinery.odometerTrip),
        hasData: machinery.odometerTrip !== null,
        unit: "km" 
      },
      logisticStatus: "En operación"
    };
  }, [machineries, selectedMachinery, alerts]);

  // Métricas adicionales de la maquinaria seleccionada
  const additionalMetrics = useMemo(() => {
    if (!machineries.length || selectedMachinery >= machineries.length) {
      return null;
    }
    
    const machinery = machineries[selectedMachinery];
    
    return {
      fuelConsumption: {
        fuelUsed: machinery.fuelUsedGps !== null ? `${machinery.fuelUsedGps.toFixed(1)} L` : "No aplica",
        instantConsumption: machinery.instantConsumption !== null ? `${machinery.instantConsumption.toFixed(1)} L/h` : "No aplica",
        prediction: machinery.consumptionPrediction?.consumo_estimado_lh 
          ? `${machinery.consumptionPrediction.consumo_estimado_lh.toFixed(2)} L/h`
          : "No aplica"
      },
      consumptionPrediction: machinery.consumptionPrediction || null,
      consumptionComparison: machinery.consumptionComparison || null,
      obdFaults: machinery.obdFaults || [],
      events: {
        type: machinery.eventType,
        gValue: machinery.eventGValue
      }
    };
  }, [machineries, selectedMachinery]);

  // Handler para tooltip del mapa
  const handleMapMarkerHover = (machinery, event) => {
    setMapTooltip({
      visible: true,
      machinery,
      position: { 
        x: event.clientX, 
        y: event.clientY 
      }
    });
  };

  const handleMapMarkerLeave = () => {
    setMapTooltip({ visible: false, machinery: null, position: null });
  };

  const getCardBackgroundColor = (status) => {
    switch (status) {
      case "alert": return "rgba(239, 68, 68, 0.1)";
      case "disconnected": return "rgba(156, 163, 175, 0.1)";
      case "moving": return "rgba(34, 197, 94, 0.05)";
      default: return "transparent";
    }
  };

  const getMarkerColor = (status) => {
    switch (status) {
      case "off": return "#9CA3AF";
      case "idle": return "#F59E0B";
      case "moving": return "#22C55E";
      default: return "#9CA3AF";
    }
  };

  const getFuelLevelColor = (level) => {
    const numLevel = parseInt(level);
    if (numLevel < 20) return "#EF4444";
    if (numLevel < 50) return "#F59E0B";
    return "#22C55E";
  };

  return (
    <>
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-[60]" />
        <Dialog.Content className="modal-theme fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[95vw] max-w-[1400px] max-h-[95vh] overflow-y-auto">
          
          {/* FILA 1: Header - Título */}
          <div className="flex items-center justify-between p-4 border-b sticky top-0 modal-theme z-10" style={{ borderColor: 'var(--color-border)' }}>
            <Dialog.Title className="text-xl font-semibold text-primary">Panel de Seguimiento</Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Cerrar modal" className="p-2 text-secondary hover:text-primary rounded-full transition-colors cursor-pointer" onClick={onClose}>
                <FaTimes className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="sr-only">Dashboard de monitoreo en tiempo real</Dialog.Description>

          <div className="p-6 space-y-6">
            
            {/* FILA 2: Request Information */}
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
              <h3 className="text-sm font-semibold text-primary mb-3">Información de Solicitud</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div><p className="text-secondary mb-1">Código de seguimiento</p><p className="text-primary font-medium">{requestInfo.trackingCode}</p></div>
                <div><p className="text-secondary mb-1">Cliente</p><p className="text-primary font-medium">{requestInfo.client}</p></div>
                <div><p className="text-secondary mb-1">Fecha de inicio</p><p className="text-primary font-medium">{requestInfo.startDate}</p></div>
                <div><p className="text-secondary mb-1">Fecha de fin</p><p className="text-primary font-medium">{requestInfo.endDate}</p></div>
                <div className="col-span-2 md:col-span-4"><p className="text-secondary mb-1">Nombre del lugar</p><p className="text-primary font-medium">{requestInfo.placeName}</p></div>
              </div>
            </div>

            {/* FILA 3: Dos columnas - Machinery Information + Real Time Ubication */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* FILA 3.1: Machinery Information */}
              <div>
                <h3 className="text-sm font-semibold text-primary mb-3">Información de Maquinaria</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {machineries.length === 0 ? (
                    <div className="p-4 text-center text-secondary">
                      <p>Esperando datos de telemetría...</p>
                      <p className="text-xs mt-2">Estado: {connectionStatus}</p>
                    </div>
                  ) : machineries.map((machinery, index) => (
                    <div key={machinery.id} onClick={() => setSelectedMachinery(index)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedMachinery === index ? 'shadow-lg' : ''}`}
                      style={{ 
                        backgroundColor: getCardBackgroundColor(machinery.status), 
                        borderColor: selectedMachinery === index ? 'var(--color-primary)' : 'var(--color-border)',
                        borderWidth: selectedMachinery === index ? '2px' : '1px',
                        outline: 'none'
                      }}>
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded flex-shrink-0 overflow-hidden" style={{ backgroundColor: 'var(--color-background-tertiary)' }}>
                          {machinery.photo ? (
                            <img src={machinery.photo} alt={machinery.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-secondary text-xs">IMG</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-secondary">{machinery.serial}</p>
                              <p className="text-sm font-semibold text-primary truncate">{machinery.name}</p>
                            </div>
                            <FaSignal className={`flex-shrink-0 ml-2 ${machinery.gsmSignal >= 4 ? 'text-success' : machinery.gsmSignal >= 2 ? 'text-warning' : 'text-error'}`} size={12} />
                          </div>
                          <p className="text-xs text-secondary mb-1">Operador: {machinery.operator}</p>
                          <p className="text-xs text-secondary mb-2">Implemento: {machinery.implement}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><p className="text-secondary mb-0.5">Velocidad actual</p><p className="text-primary font-medium">{machinery.currentSpeed}</p></div>
                            <div><p className="text-secondary mb-0.5">Combustible actual</p><p className="font-medium" style={{ color: getFuelLevelColor(machinery.fuelLevel) }}>{machinery.fuelLevel}</p></div>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <div className="flex items-center gap-1"><MdPowerSettingsNew className={machinery.ignition ? 'text-success' : 'text-error'} size={14} /><span className="text-secondary">{machinery.ignition ? 'Encendido' : 'Apagado'}</span></div>
                            <div className="flex items-center gap-1"><MdDirectionsCar className={machinery.moving ? 'text-success' : 'text-warning'} size={14} /><span className="text-secondary">{machinery.moving ? 'En movimiento' : 'Estacionario'}</span></div>
                            <div className="ml-auto text-secondary text-xs">{machinery.lastUpdate}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FILA 3.2: Real Time Ubication */}
              <div className="relative z-0 overflow-hidden">
                <h3 className="text-sm font-semibold text-primary mb-3">Ubicación en Tiempo Real</h3>
                <div className="overflow-hidden rounded-lg">
                  <RealTimeMap 
                    machineries={machineries} 
                    selectedMachinery={selectedMachinery !== null && machineries[selectedMachinery] ? machineries[selectedMachinery] : null}
                  />
                </div>
                
                {/* Legend */}
                <div className="mt-3 p-3 rounded-lg border text-xs" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22C55E' }} /><span className="text-secondary">En movimiento</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F59E0B' }} /><span className="text-secondary">Estacionario</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#9CA3AF' }} /><span className="text-secondary">Sin conexión</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* FILA 4: Header del vehículo seleccionado */}
            {selectedMachinery !== null && machineries.length > 0 && machineries[selectedMachinery] && (
              <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: '#1F2937' }}>
                      {machineries[selectedMachinery].name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-primary">{machineries[selectedMachinery].name}</h3>
                      <p className="text-xs text-secondary">Serie: {machineries[selectedMachinery].serial}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-secondary mb-1">Última actualización</p>
                    <p className={`text-sm font-semibold ${machineries[selectedMachinery].lastUpdate === 'Sin datos' ? 'text-error' : 'text-success'}`}>
                      {machineries[selectedMachinery].lastUpdate}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* FILA 5: Grid de 8 sensores (4x2) */}
            {selectedMachinery !== null && selectedMachineryData && (
              <div>
                <h3 className="text-base font-bold text-primary mb-4">Sensores y Contadores del Vehículo</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Sensor 1: Current speed */}
                  <GaugeCard 
                    label="Velocidad actual" 
                    value={selectedMachineryData.currentSpeed.value} 
                    max={selectedMachineryData.currentSpeed.max} 
                    unit={selectedMachineryData.currentSpeed.unit} 
                    type="speed"
                    threshold={selectedMachineryData.currentSpeed.max * 0.25}
                    hasData={selectedMachineryData.currentSpeed.hasData}
                  />
                  
                  {/* Sensor 2: Revolutions(RPM) */}
                  <GaugeCard 
                    label="Revoluciones (RPM)" 
                    value={selectedMachineryData.rpm.value} 
                    max={selectedMachineryData.rpm.max} 
                    unit={selectedMachineryData.rpm.unit} 
                    type="rpm" 
                    alert={selectedMachineryData.rpm.alert}
                    threshold={selectedMachineryData.rpm.max * 0.93}
                    hasData={selectedMachineryData.rpm.hasData}
                  />

                  {/* Sensor 3: Engine Temperature */}
                  {selectedMachineryData.engineTemp.hasData ? (
                  <div 
                    className="p-4 rounded-lg border flex flex-col items-center justify-center min-h-[200px] transition-all duration-500"
                    style={{ 
                      backgroundColor: selectedMachineryData.engineTemp.value > selectedMachineryData.engineTemp.alertThreshold ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-background-secondary)',
                      borderColor: selectedMachineryData.engineTemp.value > selectedMachineryData.engineTemp.alertThreshold ? '#EF4444' : 'var(--color-border)',
                      boxShadow: selectedMachineryData.engineTemp.value > selectedMachineryData.engineTemp.alertThreshold ? '0 0 10px rgba(239, 68, 68, 0.2)' : 'none'
                    }}
                  >
                    <p className="text-xs text-secondary mb-3">Temperatura del Motor</p>
                    <div className="relative">
                      {/* Termómetro */}
                      <svg width="50" height="100" viewBox="0 0 50 100" className="mb-2">
                        <defs>
                          <linearGradient id="tempGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
                            <stop offset="50%" style={{ stopColor: '#A78BFA', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#EF4444', stopOpacity: 1 }} />
                          </linearGradient>
                        </defs>
                        
                        {/* Bulbo inferior */}
                        <circle cx="25" cy="85" r="12" fill="url(#tempGradient)" stroke="#9CA3AF" strokeWidth="2" />
                        
                        {/* Tubo del termómetro */}
                        <rect x="20" y="15" width="10" height="70" rx="5" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2" />
                        
                        {/* Líquido del termómetro - Limitar al rango -40 a 130°C */}
                        {(() => {
                          const minTemp = -40;
                          const maxTemp = 130;
                          const clampedTemp = Math.min(Math.max(selectedMachineryData.engineTemp.value, minTemp), maxTemp);
                          const percentage = (clampedTemp - minTemp) / (maxTemp - minTemp);
                          const height = percentage * 68;
                          const yPos = 85 - height;
                          
                          return (
                            <rect 
                              x="22" 
                              y={yPos}
                              width="6" 
                              height={height}
                              rx="3" 
                              fill="url(#tempGradient)"
                              style={{ transition: 'y 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                            />
                          );
                        })()}
                        
                        {/* Marcas de temperatura */}
                        <line x1="30" y1="25" x2="35" y2="25" stroke="#9CA3AF" strokeWidth="1" />
                        <line x1="30" y1="45" x2="35" y2="45" stroke="#9CA3AF" strokeWidth="1" />
                        <line x1="30" y1="65" x2="35" y2="65" stroke="#9CA3AF" strokeWidth="1" />
                      </svg>
                    </div>
                    <p 
                      className="text-2xl font-bold transition-colors duration-500"
                      style={{ color: selectedMachineryData.engineTemp.value > selectedMachineryData.engineTemp.alertThreshold ? '#EF4444' : 'var(--color-primary)' }}
                    >
                      {Math.min(Math.max(selectedMachineryData.engineTemp.value, -40), 130)}°C
                    </p>
                  </div>
                  ) : (
                  <div 
                    className="p-4 rounded-lg border flex flex-col items-center justify-center min-h-[200px]"
                    style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}
                  >
                    <p className="text-xs text-secondary mb-3">Temperatura del Motor</p>
                    <p className="text-lg font-bold text-secondary">No aplica</p>
                  </div>
                  )}

                  {/* Sensor 4: Fuel Level */}
                  {selectedMachineryData.fuelLevel.hasData ? (
                  <div 
                    className="p-4 rounded-lg border flex flex-col items-center justify-center min-h-[200px] transition-all duration-500"
                    style={{ 
                      backgroundColor: selectedMachineryData.fuelLevel.value < selectedMachineryData.fuelLevel.alertThreshold ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-background-secondary)',
                      borderColor: selectedMachineryData.fuelLevel.value < selectedMachineryData.fuelLevel.alertThreshold ? '#EF4444' : 'var(--color-border)',
                      boxShadow: selectedMachineryData.fuelLevel.value < selectedMachineryData.fuelLevel.alertThreshold ? '0 0 10px rgba(239, 68, 68, 0.2)' : 'none'
                    }}
                  >
                    <p className="text-xs text-secondary mb-2">Nivel de combustible</p>
                    <div className="relative w-32 h-20">
                      <svg className="w-full h-full" viewBox="0 0 160 80">
                        {/* Arco de fondo */}
                        <path
                          d="M 20 70 A 60 60 0 0 1 140 70"
                          fill="none"
                          stroke="#E5E5E5"
                          strokeWidth="12"
                          strokeLinecap="round"
                        />
                        
                        {/* Arco de nivel de combustible - Limitar al 180° */}
                        <path
                          d="M 20 70 A 60 60 0 0 1 140 70"
                          fill="none"
                          stroke={getFuelLevelColor(`${Math.min(selectedMachineryData.fuelLevel.value, 100)}`)}
                          strokeWidth="12"
                          strokeLinecap="round"
                          strokeDasharray={`${(Math.min(selectedMachineryData.fuelLevel.value, 100) / 100) * 188} 188`}
                          style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.5s ease' }}
                        />
                        
                        {/* Etiqueta E (Empty) */}
                        <text x="15" y="75" fontSize="10" fill="#9CA3AF" fontWeight="bold">E</text>
                        
                        {/* Etiqueta F (Full) */}
                        <text x="138" y="75" fontSize="10" fill="#9CA3AF" fontWeight="bold">F</text>
                      </svg>
                      
                      {/* Aguja - Limitar rotación a 180° */}
                      <div 
                        className="absolute bottom-2 left-1/2 w-1 h-12 origin-bottom transition-all duration-700 ease-out"
                        style={{ 
                          backgroundColor: selectedMachineryData.fuelLevel.value < selectedMachineryData.fuelLevel.alertThreshold ? '#EF4444' : '#1F2937',
                          transform: `translateX(-50%) rotate(${Math.min(selectedMachineryData.fuelLevel.value, 100) / 100 * 180 - 90}deg)`,
                          borderRadius: '2px'
                        }}
                      />
                      
                      {/* Centro de la aguja */}
                      <div 
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white transition-colors duration-500"
                        style={{ backgroundColor: selectedMachineryData.fuelLevel.value < selectedMachineryData.fuelLevel.alertThreshold ? '#EF4444' : '#1F2937' }}
                      />
                    </div>
                    <p 
                      className="text-2xl font-bold mt-2 transition-colors duration-500"
                      style={{ color: selectedMachineryData.fuelLevel.value < selectedMachineryData.fuelLevel.alertThreshold ? '#EF4444' : 'var(--color-primary)' }}
                    >
                      {Math.min(selectedMachineryData.fuelLevel.value, 100)}%
                    </p>
                    <p className="text-xs text-secondary">~36L / ~90L</p>
                  </div>
                  ) : (
                  <div 
                    className="p-4 rounded-lg border flex flex-col items-center justify-center min-h-[200px]"
                    style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}
                  >
                    <p className="text-xs text-secondary mb-2">Nivel de combustible</p>
                    <p className="text-lg font-bold text-secondary">No aplica</p>
                  </div>
                  )}

                  {/* Sensor 5: Oil level */}
                  <CircularProgress 
                    label="Nivel de aceite" 
                    value={selectedMachineryData.oilLoad.value} 
                    color="#F59E0B"
                    hasData={selectedMachineryData.oilLoad.hasData}
                  />

                  {/* Sensor 6: Engine load */}
                  <CircularProgress 
                    label="Carga del motor" 
                    value={selectedMachineryData.engineLoad.value} 
                    color="#22C55E"
                    hasData={selectedMachineryData.engineLoad.hasData}
                  />

                  {/* Sensor 7: Odometer */}
                  {selectedMachineryData.totalOdometer.hasData || selectedMachineryData.tripOdometer.hasData ? (
                  <div className="p-4 rounded-lg border flex flex-col items-center justify-center min-h-[200px]" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                    <p className="text-xs text-secondary mb-3">Odómetro</p>
                    
                    {/* Total */}
                    {selectedMachineryData.totalOdometer.hasData && (
                    <div className="mb-3">
                      <p className="text-xs text-secondary mb-1 text-center">Total</p>
                      <div className="flex gap-0.5 bg-black p-2 rounded">
                        {selectedMachineryData.totalOdometer.value.split(' ').map((digit, i) => (
                          <div key={i} className="w-6 h-8 flex items-center justify-center bg-gray-900 text-white font-mono text-lg font-bold border border-gray-700">
                            {digit}
                          </div>
                        ))}
                        <div className="flex items-end ml-1 text-white text-xs font-bold pb-1">KM</div>
                      </div>
                    </div>
                    )}
                    
                    {/* Trip */}
                    {selectedMachineryData.tripOdometer.hasData && (
                    <div>
                      <p className="text-xs text-secondary mb-1 text-center">Trip</p>
                      <div className="flex gap-0.5 bg-black p-2 rounded">
                        {selectedMachineryData.tripOdometer.value.split(' ').map((digit, i) => (
                          <div key={i} className="w-6 h-8 flex items-center justify-center bg-gray-900 text-white font-mono text-lg font-bold border border-gray-700">
                            {digit}
                          </div>
                        ))}
                        <div className="flex items-end ml-1 text-white text-xs font-bold pb-1">KM</div>
                      </div>
                    </div>
                    )}

                    {!selectedMachineryData.totalOdometer.hasData && !selectedMachineryData.tripOdometer.hasData && (
                    <p className="text-lg font-bold text-secondary">No aplica</p>
                    )}
                  </div>
                  ) : (
                  <div className="p-4 rounded-lg border flex flex-col items-center justify-center min-h-[200px]" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                    <p className="text-xs text-secondary mb-3">Odómetro</p>
                    <p className="text-lg font-bold text-secondary">No aplica</p>
                  </div>
                  )}

                  {/* Sensor 8: Logistic status */}
                  <div className="p-4 rounded-lg border flex flex-col justify-center min-h-[200px]" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                    <p className="text-xs text-secondary mb-2">Estado logístico</p>
                    <select className="input-theme text-sm w-full mb-3 opacity-50 cursor-not-allowed" value={selectedMachineryData.logisticStatus} onChange={(e) => {}} disabled>
                      <option>Inactivo</option>
                      <option>En tránsito</option>
                      <option>En operación</option>
                      <option>Mantenimiento</option>
                    </select>

                  </div>

                </div>
              </div>
            )}

            {/* FILA 5.5: Fuel Consumption, OBD Faults, G-Events */}
            {selectedMachinery !== null && additionalMetrics && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* Fuel Consumption */}
                <div className="p-5 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                  <div className="mb-5 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <h3 className="text-base font-bold text-primary">Consumo de Combustible</h3>
                  </div>

                  <div className="space-y-5 text-xs">
                    {/* Métricas Principales - 3 Columnas */}
                    <div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(59, 130, 246, 0.08)' }}>
                          <p className="text-secondary text-[11px] font-medium mb-2">Combustible Usado</p>
                          <p className="text-lg font-bold text-primary">{additionalMetrics.fuelConsumption.fuelUsed}</p>
                        </div>
                        <div className="p-3 rounded border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(34, 197, 94, 0.08)' }}>
                          <p className="text-secondary text-[11px] font-medium mb-2">Consumo Instantáneo</p>
                          <p className="text-lg font-bold text-primary">{additionalMetrics.fuelConsumption.instantConsumption}</p>
                        </div>
                        <div className="p-3 rounded border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(245, 158, 11, 0.08)' }}>
                          <p className="text-secondary text-[11px] font-medium mb-2">Predicción (L/h)</p>
                          <p className="text-lg font-bold text-primary">{additionalMetrics.fuelConsumption.prediction}</p>
                        </div>
                      </div>
                    </div>

                    {/* Predicción de Consumo */}
                    {additionalMetrics.consumptionPrediction && (
                      <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                        <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wide">Predicción de Consumo (IA)</p>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="p-3 rounded border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(59, 130, 246, 0.08)' }}>
                            <p className="text-secondary text-[11px] font-medium mb-2">Consumo Estimado</p>
                            <p className="text-lg font-bold text-primary">
                              {additionalMetrics.consumptionPrediction.consumo_estimado_l?.toFixed(2) || "No aplica"} L
                            </p>
                            <p className="text-[11px] text-secondary mt-2 font-medium">
                              {additionalMetrics.consumptionPrediction.consumo_estimado_lh?.toFixed(2) || "No aplica"} L/h
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Comparación Real vs Estimado */}
                    {additionalMetrics.consumptionComparison && (
                      <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                        <p className="text-xs font-semibold text-primary mb-3 uppercase tracking-wide">Comparativa: Real vs Estimado</p>
                        <div className="space-y-3">
                          {/* Fila 1: Consumo Real vs Estimado */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(34, 197, 94, 0.08)' }}>
                              <p className="text-secondary text-[11px] font-medium mb-2">Consumo Real</p>
                              <p className="text-lg font-bold text-primary">
                                {additionalMetrics.consumptionComparison.consumo_real_l?.toFixed(2) || "No aplica"} L
                              </p>
                            </div>
                            <div className="p-3 rounded border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(59, 130, 246, 0.08)' }}>
                              <p className="text-secondary text-[11px] font-medium mb-2">Consumo Estimado</p>
                              <p className="text-lg font-bold text-primary">
                                {additionalMetrics.consumptionComparison.consumo_estimado_l?.toFixed(2) || "No aplica"} L
                              </p>
                            </div>
                          </div>

                          {/* Fila 2: Consumo Instantáneo Promedio */}
                          <div className="p-3 rounded border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(168, 85, 247, 0.08)' }}>
                            <p className="text-secondary text-[11px] font-medium mb-2">Consumo Instantáneo Promedio</p>
                            <p className="text-lg font-bold text-primary">
                              {additionalMetrics.consumptionComparison.consumo_instantaneo_promedio_lh?.toFixed(2) || "No aplica"} L/h
                            </p>
                          </div>

                          {/* Fila 3: Diferencia y Error */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(239, 68, 68, 0.08)' }}>
                              <p className="text-secondary text-[11px] font-medium mb-2">Diferencia Absoluta</p>
                              <p className="text-lg font-bold text-primary">
                                {additionalMetrics.consumptionComparison.diferencia_absoluta_l?.toFixed(2) || "No aplica"} L
                              </p>
                            </div>
                            <div className={`p-3 rounded border`} style={{ 
                              borderColor: 'var(--color-border)', 
                              backgroundColor: additionalMetrics.consumptionComparison.error_porcentual > 20 
                                ? 'rgba(239, 68, 68, 0.12)' 
                                : 'rgba(34, 197, 94, 0.08)'
                            }}>
                              <p className="text-secondary text-[11px] font-medium mb-2">Error Porcentual</p>
                              <p className={`text-lg font-bold ${
                                additionalMetrics.consumptionComparison.error_porcentual > 20 
                                  ? 'text-error' 
                                  : 'text-success'
                              }`}>
                                {additionalMetrics.consumptionComparison.error_porcentual?.toFixed(2) || "No aplica"}%
                              </p>
                            </div>
                          </div>

                          {/* Fila 4: Información del Tanque */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(59, 130, 246, 0.08)' }}>
                              <p className="text-secondary text-[11px] font-medium mb-2">Nivel Inicial</p>
                              <p className="text-lg font-bold text-primary">
                                {additionalMetrics.consumptionComparison.fuel_level_inicial?.toFixed(2) || "No aplica"}%
                              </p>
                            </div>
                            <div className="p-3 rounded border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(59, 130, 246, 0.08)' }}>
                              <p className="text-secondary text-[11px] font-medium mb-2">Nivel Actual</p>
                              <p className="text-lg font-bold text-primary">
                                {additionalMetrics.consumptionComparison.fuel_level_actual?.toFixed(2) || "No aplica"}%
                              </p>
                            </div>
                          </div>

                          {/* Fila 5: Capacidad y Duración */}
                          <div className="grid grid-cols-1 gap-2">
                            <div className="p-3 rounded border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(168, 85, 247, 0.08)' }}>
                              <p className="text-secondary text-[11px] font-medium mb-2">Duración Total</p>
                              <p className="text-lg font-bold text-primary">
                                {additionalMetrics.consumptionComparison.duracion_h?.toFixed(2) || "No aplica"} h
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mensaje si no hay datos */}
                    {!additionalMetrics.consumptionPrediction && !additionalMetrics.consumptionComparison && (
                      <div className="p-4 rounded text-center text-secondary text-xs border" style={{ backgroundColor: 'rgba(156, 163, 175, 0.08)', borderColor: 'var(--color-border)' }}>
                        <p className="font-medium">Sin datos de predicción o comparación disponibles</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* OBD Faults */}
                <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                  <h3 className="text-sm font-semibold text-primary mb-4">Fallas OBD</h3>
                  <div className="space-y-3 text-xs max-h-[100vh] overflow-y-auto">
                    {(() => {
                      const selectedImei = selectedMachinery !== null && machineries[selectedMachinery] ? machineries[selectedMachinery].imei : null;
                      const faults = selectedImei && obdFaultsHistory[selectedImei] ? obdFaultsHistory[selectedImei] : [];
                      
                      console.log('🔍 OBD Debug:', {
                        selectedMachinery,
                        selectedImei,
                        machineries: machineries.map(m => ({ id: m.id, imei: m.imei })),
                        obdFaultsHistory,
                        faults
                      });
                      
                      return faults.length === 0 ? (
                        <p className="text-center text-secondary py-4">Sin fallas OBD detectadas</p>
                      ) : faults.map((fault, index) => (
                        <div key={index} className="pb-3 border-b last:border-b-0" style={{ borderColor: 'var(--color-border)' }}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-8 bg-error rounded"></div>
                              <div>
                                <p className="font-bold text-error text-sm">{fault.code || 'Código desconocido'}</p>
                                <p className="text-[10px] text-secondary">{fault.description || 'Falla OBD detectada'}</p>
                              </div>
                            </div>
                            <span className="text-[10px] text-secondary whitespace-nowrap">
                              {new Date(fault.timestamp).toLocaleString('es-CO')}
                            </span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* G-Events */}
                <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                  <h3 className="text-sm font-semibold text-primary mb-4">Eventos G</h3>
                  <div className="space-y-4 text-xs max-h-[100vh] overflow-y-auto">
                    {(() => {
                      const selectedImei = selectedMachinery !== null && machineries[selectedMachinery] ? machineries[selectedMachinery].imei : null;
                      const events = selectedImei && gEventsHistory[selectedImei] ? gEventsHistory[selectedImei] : [];
                      
                      console.log('🔍 G-Events Debug:', {
                        selectedMachinery,
                        selectedImei,
                        machineries: machineries.map(m => ({ id: m.id, imei: m.imei })),
                        gEventsHistory,
                        events
                      });
                      
                      return events.length === 0 ? (
                        <p className="text-center text-secondary py-4">Sin eventos G detectados</p>
                      ) : events.map((event, index) => (
                        <div key={index} className="pb-3 border-b last:border-b-0" style={{ borderColor: 'var(--color-border)' }}>
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-primary font-medium">
                              {event.eventType === 1 ? 'Aceleración' : 
                               event.eventType === 2 ? 'Frenado' : 
                               event.eventType === 3 ? 'Curva' : 
                               'Evento'}
                            </span>
                            <span className="text-secondary text-[10px]">
                              {new Date(event.timestamp).toLocaleString('es-CO')}
                            </span>
                          </div>
                          <div className="text-secondary">
                            Intensidad: <span className={`font-bold ${
                              event.eventType === 2 ? 'text-error' : 
                              event.eventType === 1 ? 'text-warning' : 
                              'text-primary'
                            }`}>
                              {event.eventGValue}G
                            </span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* FILA 6: Gráficas con tabs */}
            {selectedMachinery !== null && (
              <div>
                <div className="flex gap-1 mb-3 border-b justify-between items-center" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex gap-1">
                    <button onClick={() => setActiveTab("performance")} className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === "performance" ? 'text-primary' : 'text-secondary hover:text-primary'}`}>
                      Información de Rendimiento
                      {activeTab === "performance" && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--color-primary)' }} />}
                    </button>
                    <button onClick={() => setActiveTab("fuel")} className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === "fuel" ? 'text-primary' : 'text-secondary hover:text-primary'}`}>
                      Información de Consumo de Combustible
                      {activeTab === "fuel" && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--color-primary)' }} />}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={clearHistoricalData}
                      className="px-3 py-1 text-xs text-secondary hover:text-error border border-secondary hover:border-error rounded transition-colors"
                      title="Limpiar datos históricos"
                    >
                      Limpiar Datos
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-lg border min-h-[400px]" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                  {(() => {
                    const selectedImei = selectedMachinery && machineries[selectedMachinery]?.imei;
                    
                    // Si no hay datos para el IMEI seleccionado, usar el primer IMEI disponible
                    let performanceData = [];
                    let fuelData = [];
                    let activeImei = selectedImei;
                    
                    if (selectedImei && chartData[selectedImei]) {
                      performanceData = chartData[selectedImei]?.performance || [];
                      fuelData = chartData[selectedImei]?.fuelConsumption || [];
                    } else if (Object.keys(chartData).length > 0) {
                      // Usar el primer IMEI disponible si el seleccionado no tiene datos
                      activeImei = Object.keys(chartData)[0];
                      performanceData = chartData[activeImei]?.performance || [];
                      fuelData = chartData[activeImei]?.fuelConsumption || [];
                      // Usando IMEI alternativo
                    }
                    
                    return activeTab === "performance" ? (
                      <PerformanceChart 
                        data={performanceData}
                      />
                    ) : (
                      <FuelConsumptionChart 
                        data={fuelData}
                      />
                    );
                  })()}
                </div>
              </div>
            )}

          </div>
        </Dialog.Content>

        {/* Tooltip del mapa */}
        <MapTooltip 
          machinery={mapTooltip.machinery}
          position={mapTooltip.position}
          visible={mapTooltip.visible}
        />
      </Dialog.Portal>
    </Dialog.Root>

    {/* Modal de Error - Timeout del WebSocket */}
    <ErrorModal
      isOpen={isTimeoutErrorOpen}
      onClose={() => setIsTimeoutErrorOpen(false)}
      title="Conexión Perdida"
      message={timeoutErrorMessage}
      buttonText="Cerrar"
    />
    </>
  );
};

export default TrackingDashboardModal;
