/**
 * Hook para manejar WebSocket de telemetría en tiempo real
 * Basado en la guía oficial del WebSocket de telemetría
 * 
 * Endpoint: https://api.inmero.co/telemetry/api/telemetria/stream/{solicitudCodigo}?password={password}
 * 
 * Uso:
 * const { 
 *   machineriesData,      // Object con datos de maquinarias organizados por IMEI
 *   connectionStatus,     // Estado de conexión: 'conectando', 'conectado', 'desconectado', 'error'
 *   reconnect,            // Función para reconectar manualmente
 *   lastMessage,          // Último mensaje recibido
 *   alerts                // Array de alertas recibidas
 * } = useTrackingWebSocket({
 *   imeiFilter: ['352099001761481', '352099001761482'],  // Opcional: filtrar por IMEIs
 *   requestCode: 'SOL-2025-0031'  // Requerido: código de la solicitud
 * });
 * 
 * Variables de entorno requeridas:
 * - NEXT_PUBLIC_TELEMETRY_WS_URL: URL base (default: https://api.inmero.co/telemetry/api/telemetria/stream)
 * - NEXT_PUBLIC_TELEMETRY_WS_PASSWORD o WEBSOCKET_PASSWORD: Contraseña (default: telemetry_password_2024)
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const RECONNECT_INTERVAL = 5000; // 5 segundos
const MAX_RECONNECT_ATTEMPTS = 10;

export const useTrackingWebSocket = (options = {}) => {
  const { imeiFilter = null, requestCode = null } = options; // Array de IMEIs a filtrar, null = todos; requestCode = código de solicitud
  
  // Estado de datos de maquinarias organizados por IMEI
  const [machineriesData, setMachineriesData] = useState({});
  
  // Estado de conexión
  const [connectionStatus, setConnectionStatus] = useState('conectando');
  
  // Último mensaje recibido
  const [lastMessage, setLastMessage] = useState(null);
  
  // Alertas recibidas
  const [alerts, setAlerts] = useState([]);
  
  // Referencias
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  // Obtener configuración desde variables de entorno
  const WS_BASE_URL = process.env.NEXT_PUBLIC_TELEMETRY_WS_URL || 'https://api.inmero.co/telemetry/api/telemetria/stream';
  const WS_PASSWORD = process.env.NEXT_PUBLIC_TELEMETRY_WS_PASSWORD || process.env.WEBSOCKET_PASSWORD || 'telemetry_password_2024';

  // Función para procesar datos de ubicación GPS
  const parseGpsLocation = useCallback((gpsString) => {
    if (!gpsString) return null;
    
    try {
      // Formato: "+04.60971-074.08175/"
      const cleanStr = gpsString.replace('/', '');
      const latMatch = cleanStr.match(/([+-]\d+\.\d+)/);
      const lngMatch = cleanStr.match(/([+-]\d+\.\d+)$/);
      
      if (latMatch && lngMatch) {
        return {
          lat: parseFloat(latMatch[1]),
          lng: parseFloat(lngMatch[1])
        };
      }
    } catch (error) {
      console.error('Error al parsear ubicación GPS:', error);
    }
    return null;
  }, []);

  // Función para calcular el estado de la maquinaria
  const getMachineryStatus = useCallback((data) => {
    if (!data.ignition_status) return 'off'; // Apagado
    if (!data.movement_status) return 'idle'; // Estacionario
    return 'moving'; // En movimiento
  }, []);

  // Función para formatear timestamp relativo
  const getRelativeTime = useCallback((timestamp) => {
    if (!timestamp) return 'Sin datos';
    
    try {
      const now = new Date();
      const messageTime = new Date(timestamp);
      const diffInSeconds = Math.floor((now - messageTime) / 1000);
      
      if (diffInSeconds < 60) return `${diffInSeconds} seg`;
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min`;
      return `${Math.floor(diffInSeconds / 3600)} h`;
    } catch (error) {
      return 'Tiempo desconocido';
    }
  }, []);

  // Función para procesar mensajes entrantes
  const processMessage = useCallback((message) => {
    try {
      const data = JSON.parse(message);
      
      // Validar estructura del mensaje según la guía
      if (!data.imei || !data.timestamp || !data.data) {
        console.warn('Mensaje con estructura inválida:', data);
        return;
      }

      const { imei, timestamp, data: telemetryData, alerts: messageAlerts } = data;
      
      // Filtrar por IMEI si se especifica un filtro
      if (imeiFilter && Array.isArray(imeiFilter) && imeiFilter.length > 0) {
        if (!imeiFilter.includes(imei)) {
          // Ignorar este mensaje, no pertenece a las maquinarias de esta solicitud
          return;
        }
      }
      
      // Calcular estado de la maquinaria
      const status = getMachineryStatus(telemetryData);
      
      // Parsear ubicación GPS
      const location = parseGpsLocation(telemetryData.gps_location);
      
      // Formatear tiempo relativo
      const relativeTime = getRelativeTime(timestamp);

      // Crear objeto con datos procesados
      const processedData = {
        imei,
        timestamp,
        relativeTime,
        status,
        location,
        // Datos de telemetría (solo los que existan según configuración)
        ignition: telemetryData.ignition_status !== undefined ? telemetryData.ignition_status === 1 : null,
        moving: telemetryData.movement_status !== undefined ? telemetryData.movement_status === 1 : null,
        speed: telemetryData.speed !== undefined ? telemetryData.speed : null,
        gsmSignal: telemetryData.gsm_signal !== undefined ? telemetryData.gsm_signal : null,
        rpm: telemetryData.rpm !== undefined ? telemetryData.rpm : null,
        engineTemp: telemetryData.engine_temp !== undefined ? telemetryData.engine_temp : null,
        engineLoad: telemetryData.engine_load !== undefined ? telemetryData.engine_load : null,
        oilLevel: telemetryData.oil_level !== undefined ? telemetryData.oil_level : null,
        fuelLevel: telemetryData.fuel_level !== undefined ? telemetryData.fuel_level : null,
        fuelUsedGps: telemetryData.fuel_used_gps !== undefined ? telemetryData.fuel_used_gps : null,
        instantConsumption: telemetryData.instant_consumption !== undefined ? telemetryData.instant_consumption : null,
        obdFaults: telemetryData.obd_faults || [],
        odometerTotal: telemetryData.odometer_total !== undefined ? telemetryData.odometer_total : null,
        odometerTrip: telemetryData.odometer_trip !== undefined ? telemetryData.odometer_trip : null,
        eventType: telemetryData.event_type !== undefined ? telemetryData.event_type : null,
        eventGValue: telemetryData.event_g_value !== undefined ? telemetryData.event_g_value : null,
        // Datos crudos para referencia
        raw: telemetryData
      };

      // Actualizar estado de maquinarias
      setMachineriesData(prev => ({
        ...prev,
        [imei]: processedData
      }));

      // Actualizar último mensaje
      setLastMessage(processedData);

      // Procesar alertas si existen
      if (messageAlerts && Array.isArray(messageAlerts) && messageAlerts.length > 0) {
        const newAlerts = messageAlerts.map(alert => ({
          ...alert,
          imei,
          timestamp,
          id: `${imei}-${timestamp}-${alert.parameter}`
        }));
        
        setAlerts(prev => [...newAlerts, ...prev].slice(0, 50)); // Mantener últimas 50 alertas
      }

    } catch (error) {
      console.error('Error al procesar mensaje del WebSocket:', error);
    }
  }, [getMachineryStatus, parseGpsLocation, getRelativeTime, imeiFilter]);

  // Función para conectar al WebSocket
  const connect = useCallback(() => {
    try {
      // Cerrar conexión existente si hay una
      if (wsRef.current) {
        wsRef.current.close();
      }

      // Validar que tenemos el código de solicitud
      if (!requestCode) {
        console.warn('⚠️ No se proporcionó código de solicitud (requestCode)');
        setConnectionStatus('error');
        return;
      }

      // Construir URL con formato correcto: https://api.inmero.co/telemetry/api/telemetria/stream/{solicitudCodigo}?password={password}
      const wsUrl = `${WS_BASE_URL}/${requestCode}?password=${encodeURIComponent(WS_PASSWORD)}`;
      
      console.log('🔌 Conectando al WebSocket de telemetría...');
      console.log('📍 Endpoint:', `${WS_BASE_URL}/${requestCode}?password=***`);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ WebSocket de telemetría conectado');
        setConnectionStatus('conectado');
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        processMessage(event.data);
      };

      ws.onerror = (error) => {
        console.error('❌ Error en WebSocket de telemetría:', error);
        setConnectionStatus('error');
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket de telemetría desconectado');
        
        // Verificar si fue rechazado por contraseña incorrecta
        if (event.code === 4001) {
          console.error('❌ Contraseña incorrecta para WebSocket de telemetría');
          setConnectionStatus('error');
          return;
        }
        
        setConnectionStatus('desconectado');

        // Intentar reconectar automáticamente
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          console.log(`🔄 Reintentando conexión al WebSocket de telemetría (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_INTERVAL);
        } else {
          console.error('❌ Máximo de intentos de reconexión alcanzado');
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error al crear conexión WebSocket:', error);
      setConnectionStatus('error');
    }
  }, [WS_BASE_URL, WS_PASSWORD, requestCode, processMessage]);

  // Función para reconectar manualmente
  const reconnect = useCallback(() => {
    console.log('🔄 Reconectando manualmente...');
    reconnectAttemptsRef.current = 0;
    setConnectionStatus('conectando');
    connect();
  }, [connect]);

  // Efecto para conectar al montar
  useEffect(() => {
    connect();

    // Limpiar al desmontar
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Efecto para actualizar tiempos relativos cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setMachineriesData(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(imei => {
          updated[imei] = {
            ...updated[imei],
            relativeTime: getRelativeTime(updated[imei].timestamp)
          };
        });
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [getRelativeTime]);

  return {
    machineriesData,
    connectionStatus,
    reconnect,
    lastMessage,
    alerts
  };
};

export default useTrackingWebSocket;
