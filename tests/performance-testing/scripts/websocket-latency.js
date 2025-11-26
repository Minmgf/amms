/**
 * Script para medir latencia del WebSocket de telemetría
 * Requisitos: wscat instalado globalmente (npm install -g wscat)
 * 
 * Conexión: wss://api.inmero.co/telemetry/ws/telemetria/{request_id}?password={password}
 * 
 * Este script:
 * 1. Se conecta al WebSocket con un request_id válido
 * 2. Mide el tiempo de conexión inicial
 * 3. Registra timestamps de cada mensaje recibido
 * 4. Calcula latencia entre mensajes
 * 5. Genera reporte de métricas
 */

const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Configuración
const WS_URL = 'wss://api.inmero.co/telemetry/ws/telemetria';
const PASSWORD = 'telemetry_password_2024';
const REQUEST_ID = 'SOL-2025-0011'; // Cambiar por un request_id válido de tu sistema
const TEST_DURATION_MS = 60000; // 60 segundos de prueba
const OUTPUT_DIR = path.join(__dirname, '../results/2025-11-26/ws-latency');

// Métricas
const metrics = {
  connectionTime: null,
  connectionTimestamp: null,
  messagesReceived: 0,
  messageTimestamps: [],
  latencies: [],
  errors: [],
  connectionStatus: 'disconnected'
};

// Asegurar que el directorio de salida existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🚀 Iniciando prueba de latencia WebSocket...');
console.log(`📡 URL: ${WS_URL}/${REQUEST_ID}`);
console.log(`⏱️  Duración: ${TEST_DURATION_MS / 1000} segundos\n`);

// Crear conexión WebSocket
const wsUrl = `${WS_URL}/${encodeURIComponent(REQUEST_ID)}?password=${encodeURIComponent(PASSWORD)}`;
const ws = new WebSocket(wsUrl);

const startTime = Date.now();

ws.on('open', () => {
  metrics.connectionTime = Date.now() - startTime;
  metrics.connectionTimestamp = new Date().toISOString();
  metrics.connectionStatus = 'connected';
  
  console.log(`✅ Conectado en ${metrics.connectionTime}ms`);
  console.log('📊 Esperando mensajes de telemetría...\n');
});

ws.on('message', (data) => {
  const receiveTime = Date.now();
  const timestamp = new Date().toISOString();
  
  try {
    const message = JSON.parse(data.toString());
    metrics.messagesReceived++;
    
    // Registrar timestamp del mensaje
    metrics.messageTimestamps.push({
      timestamp,
      receiveTime,
      messageType: message.type || 'telemetry',
      imei: message.imei || null
    });
    
    // Calcular latencia entre mensajes consecutivos
    if (metrics.messageTimestamps.length > 1) {
      const prevMessage = metrics.messageTimestamps[metrics.messageTimestamps.length - 2];
      const latency = receiveTime - prevMessage.receiveTime;
      metrics.latencies.push(latency);
      
      console.log(`📨 Mensaje ${metrics.messagesReceived}: ${message.type || 'telemetry'} | IMEI: ${message.imei || 'N/A'} | Δt: ${latency}ms`);
    } else {
      console.log(`📨 Mensaje ${metrics.messagesReceived}: ${message.type || 'telemetry'} | IMEI: ${message.imei || 'N/A'}`);
    }
    
  } catch (error) {
    metrics.errors.push({
      timestamp,
      error: error.message,
      rawData: data.toString().substring(0, 100)
    });
    console.error(`❌ Error al parsear mensaje: ${error.message}`);
  }
});

ws.on('error', (error) => {
  metrics.connectionStatus = 'error';
  metrics.errors.push({
    timestamp: new Date().toISOString(),
    error: error.message,
    type: 'connection_error'
  });
  console.error(`❌ Error de WebSocket: ${error.message}`);
});

ws.on('close', (code, reason) => {
  metrics.connectionStatus = 'closed';
  console.log(`\n🔌 Conexión cerrada. Código: ${code}, Razón: ${reason || 'N/A'}`);
  generateReport();
});

// Cerrar conexión después de TEST_DURATION_MS
setTimeout(() => {
  console.log('\n⏰ Tiempo de prueba completado. Cerrando conexión...');
  ws.close();
}, TEST_DURATION_MS);

// Función para generar reporte
function generateReport() {
  console.log('\n📊 Generando reporte de métricas...\n');
  
  // Calcular estadísticas
  const stats = calculateStats(metrics.latencies);
  
  const report = {
    testMetadata: {
      url: `${WS_URL}/${REQUEST_ID}`,
      testDuration: `${TEST_DURATION_MS / 1000}s`,
      timestamp: new Date().toISOString()
    },
    connectionMetrics: {
      connectionTime: `${metrics.connectionTime}ms`,
      connectionTimestamp: metrics.connectionTimestamp,
      finalStatus: metrics.connectionStatus
    },
    messageMetrics: {
      totalMessagesReceived: metrics.messagesReceived,
      messagesPerSecond: (metrics.messagesReceived / (TEST_DURATION_MS / 1000)).toFixed(2),
      messageFrequency: metrics.messagesReceived > 1 ? `${(TEST_DURATION_MS / metrics.messagesReceived / 1000).toFixed(1)}s` : 'N/A'
    },
    latencyMetrics: {
      min: stats.min ? `${stats.min}ms` : 'N/A',
      max: stats.max ? `${stats.max}ms` : 'N/A',
      avg: stats.avg ? `${stats.avg.toFixed(2)}ms` : 'N/A',
      median: stats.median ? `${stats.median}ms` : 'N/A',
      p95: stats.p95 ? `${stats.p95}ms` : 'N/A',
      p99: stats.p99 ? `${stats.p99}ms` : 'N/A'
    },
    errors: metrics.errors
  };
  
  // Mostrar reporte en consola
  console.log('═══════════════════════════════════════════════');
  console.log('           REPORTE DE LATENCIA WEBSOCKET       ');
  console.log('═══════════════════════════════════════════════');
  console.log(`\n📡 Conexión: ${metrics.connectionTime}ms`);
  console.log(`📨 Mensajes recibidos: ${metrics.messagesReceived}`);
  console.log(`📈 Frecuencia: ${report.messageMetrics.messageFrequency}`);
  console.log(`\n⚡ Latencia entre mensajes:`);
  console.log(`   Min: ${report.latencyMetrics.min}`);
  console.log(`   Max: ${report.latencyMetrics.max}`);
  console.log(`   Avg: ${report.latencyMetrics.avg}`);
  console.log(`   Median: ${report.latencyMetrics.median}`);
  console.log(`   P95: ${report.latencyMetrics.p95}`);
  console.log(`   P99: ${report.latencyMetrics.p99}`);
  console.log(`\n❌ Errores: ${metrics.errors.length}`);
  console.log('═══════════════════════════════════════════════\n');
  
  // Guardar reporte JSON
  const reportPath = path.join(OUTPUT_DIR, `websocket-latency-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`✅ Reporte guardado: ${reportPath}`);
  
  // Guardar log detallado
  const logPath = path.join(OUTPUT_DIR, `websocket-messages-${Date.now()}.json`);
  fs.writeFileSync(logPath, JSON.stringify(metrics.messageTimestamps, null, 2));
  console.log(`✅ Log de mensajes guardado: ${logPath}\n`);
}

// Función para calcular estadísticas
function calculateStats(values) {
  if (!values || values.length === 0) {
    return { min: null, max: null, avg: null, median: null, p95: null, p99: null };
  }
  
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: sum / sorted.length,
    median: sorted[Math.floor(sorted.length / 2)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)]
  };
}

// Manejo de señales de terminación
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Prueba interrumpida por el usuario');
  ws.close();
  process.exit(0);
});
