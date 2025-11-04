/**
 * Hook personalizado para manejar WebSocket de tracking en tiempo real
 * 
 * Uso:
 * const { 
 *   machineries,          // Array de maquinarias con datos en tiempo real
 *   isConnected,          // Estado de conexión
 *   reconnect,            // Función para reconectar manualmente
 *   sendCommand           // Función para enviar comandos al servidor
 * } = useTrackingWebSocket(trackingCode);
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080';
const RECONNECT_INTERVAL = 5000; // 5 segundos
const MAX_RECONNECT_ATTEMPTS = 10;

export const useTrackingWebSocket = (trackingCode) => {
  const [machineries, setMachineries] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  // Función para conectar al WebSocket
  const connect = useCallback(() => {
    try {
      // Cerrar conexión existente si hay una
      if (wsRef.current) {
        wsRef.current.close();
      }

      // Crear nueva conexión WebSocket
      const ws = new WebSocket(`${WEBSOCKET_URL}/tracking/${trackingCode}`);

      ws.onopen = () => {
        console.log('✅ WebSocket conectado');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;

        // Enviar mensaje inicial de suscripción
        ws.send(JSON.stringify({
          type: 'subscribe',
          trackingCode: trackingCode
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Manejar diferentes tipos de mensajes
          switch (data.type) {
            case 'initial_data':
              // Datos iniciales al conectar
              setMachineries(data.machineries);
              break;
              
            case 'machinery_update':
              // Actualización de una maquinaria específica
              setMachineries(prev => prev.map(m => 
                m.id === data.machinery.id ? { ...m, ...data.machinery } : m
              ));
              break;
              
            case 'sensor_update':
              // Actualización de sensores específicos
              setMachineries(prev => prev.map(m => 
                m.id === data.machineryId 
                  ? { ...m, sensors: { ...m.sensors, ...data.sensors } }
                  : m
              ));
              break;
              
            case 'location_update':
              // Actualización de ubicación
              setMachineries(prev => prev.map(m => 
                m.id === data.machineryId 
                  ? { ...m, location: data.location, lastUpdate: data.timestamp }
                  : m
              ));
              break;

            case 'chart_data':
              // Actualización de datos para gráficas
              setMachineries(prev => prev.map(m => 
                m.id === data.machineryId 
                  ? { ...m, chartData: data.chartData }
                  : m
              ));
              break;
              
            case 'error':
              console.error('Error del servidor:', data.message);
              setError(data.message);
              break;
              
            default:
              console.warn('Tipo de mensaje desconocido:', data.type);
          }
        } catch (err) {
          console.error('Error al procesar mensaje:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Error en WebSocket:', error);
        setError('Error de conexión');
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket desconectado');
        setIsConnected(false);

        // Intentar reconectar automáticamente
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          console.log(`🔄 Reintentando conexión (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_INTERVAL);
        } else {
          setError('No se pudo conectar al servidor. Intentos máximos alcanzados.');
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Error al crear WebSocket:', err);
      setError('Error al conectar');
    }
  }, [trackingCode]);

  // Función para enviar comandos al servidor
  const sendCommand = useCallback((command) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(command));
    } else {
      console.error('WebSocket no está conectado');
    }
  }, []);

  // Función para reconectar manualmente
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  // Conectar al montar el componente
  useEffect(() => {
    if (trackingCode) {
      connect();
    }

    // Limpiar al desmontar
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [trackingCode, connect]);

  return {
    machineries,
    isConnected,
    error,
    reconnect,
    sendCommand
  };
};

export default useTrackingWebSocket;
