/**
 * Hook para manejar WebSocket de telemetría en tiempo real
 * 
 * Endpoint: wss://api.inmero.co/telemetry/ws/telemetria/{request_id}?password={password}
 * Actualización: ~30 segundos
 * 
 * Uso:
 * const { 
 *   machineriesData,      // Object con datos de maquinarias organizados por IMEI
 *   connectionStatus,     // Estado de conexión: 'conectando', 'conectado', 'desconectado', 'error'
 *   reconnect,            // Función para reconectar manualmente
 *   lastMessage,          // Último mensaje recibido
 *   alerts                // Array de alertas recibidas
 * } = useTrackingWebSocket({
 *   requestId: 'SOL-2025-0011',  // Required: Código de solicitud
 *   imeiFilter: ['357894561234567', '352099001761482']  // Opcional: filtrar por IMEIs
 * });
 * 
 * Variables de entorno requeridas:
 * - NEXT_PUBLIC_TELEMETRY_WS_URL: URL base (default: wss://api.inmero.co/telemetry/ws/telemetria)
 * - NEXT_PUBLIC_TELEMETRY_WS_PASSWORD o WEBSOCKET_PASSWORD: Contraseña (default: telemetry_password_2024)
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const RECONNECT_INTERVAL = 5000; // 5 segundos
const MAX_RECONNECT_ATTEMPTS = 10;

export const useTrackingWebSocket = (options = {}) => {
  const { requestId = null, imeiFilter = null } = options; // requestId es requerido, Array de IMEIs a filtrar, null = todos
  
  // Estado de datos de maquinarias organizados por IMEI
  const [machineriesData, setMachineriesData] = useState({});
  
  // Estado de conexión
  const [connectionStatus, setConnectionStatus] = useState('conectando');
  
  // Último mensaje recibido
  const [lastMessage, setLastMessage] = useState(null);
  
  // Alertas recibidas
  const [alerts, setAlerts] = useState([]);
  
  // Mensaje de timeout
  const [timeoutMessage, setTimeoutMessage] = useState(null);
  
  // Referencias
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  // Obtener configuración desde variables de entorno
  const WS_URL = process.env.NEXT_PUBLIC_TELEMETRY_WS_URL || 'wss://api.inmero.co/telemetry/ws/telemetria';
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
      console.log('📨 Mensaje recibido del WebSocket:', message);
      const data = JSON.parse(message);
      
      // Manejar mensajes de control del sistema
      if (data.type === 'connection_confirmed') {
        console.log('✅ Conexión confirmada para solicitud:', data.request_id);
        setConnectionStatus('conectado');
        return;
      }
      
      if (data.type === 'timeout') {
        console.warn('⏰ Timeout de conexión para solicitud:', data.request_id);
        console.warn('📋 Detalles del timeout:', {
          request_id: data.request_id,
          message: data.message,
          timeout_seconds: data.timeout_seconds,
          reason: data.reason
        });
        setConnectionStatus('error');
        // Guardar el mensaje de timeout para mostrarlo en el modal
        setTimeoutMessage({
          request_id: data.request_id,
          message: data.message,
          timeout_seconds: data.timeout_seconds,
          reason: data.reason
        });
        return;
      }
      
      // Validar estructura del mensaje de telemetría
      if (!data.imei || !data.timestamp || !data.data) {
        console.warn('Mensaje con estructura inválida:', data);
        return;
      }
      
      console.log('✅ Mensaje válido recibido para IMEI:', data.imei);

      const { imei, timestamp, data: telemetryData, alerts: messageAlerts, serial_number, machinery_name, operator_name } = data;
      
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
        // Información adicional del dispositivo
        serialNumber: serial_number || null,
        machineryName: machinery_name || null,
        operatorName: operator_name || null,
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
      // Validar que se proporcionó un requestId
      if (!requestId) {
        console.error('❌ requestId es requerido para conectar al WebSocket de telemetría');
        setConnectionStatus('error');
        return;
      }
      
      // Cerrar conexión existente si hay una
      if (wsRef.current) {
        wsRef.current.close();
      }

      // Construir URL con requestId y contraseña: wss://api.inmero.co/telemetry/ws/telemetria/{request_id}?password={password}
      const wsUrl = `${WS_URL}/${encodeURIComponent(requestId)}?password=${encodeURIComponent(WS_PASSWORD)}`;
      
      console.log('🔌 Conectando al WebSocket de telemetría...');
      console.log('📍 Endpoint:', `${WS_URL}/${requestId}?password=***`);
      console.log('🎯 Request ID:', requestId);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ WebSocket de telemetría conectado, esperando confirmación...');
        console.log('🔌 URL conectada:', wsUrl);
        setConnectionStatus('conectando');
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        console.log('📨 Evento onmessage disparado');
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
        
        // Verificar si fue un timeout
        if (event.code === 4002) {
          console.warn('⏰ Timeout de conexión para solicitud:', requestId);
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
  }, [WS_URL, WS_PASSWORD, processMessage, requestId]);

  // Función para reconectar manualmente
  const reconnect = useCallback(() => {
    console.log('🔄 Reconectando manualmente...');
    reconnectAttemptsRef.current = 0;
    setConnectionStatus('conectando');
    connect();
  }, [connect]);

  // Efecto para conectar al montar o cuando cambia el requestId
  useEffect(() => {
    // Limpiar datos anteriores cuando cambia el requestId
    if (requestId) {
      console.log('🔄 RequestId cambió a:', requestId);
      setMachineriesData({});
      setAlerts([]);
      reconnectAttemptsRef.current = 0;
      connect();
    }

    // Limpiar al desmontar o cambiar requestId
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [requestId, connect]);

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
    alerts,
    timeoutMessage
  };
};

export default useTrackingWebSocket;
