/**
 * Script de prueba de carga para WebSocket
 * Simula múltiples conexiones concurrentes al endpoint de telemetría
 * 
 * Este script reemplaza Artillery debido a incompatibilidades de sintaxis
 * Usa el mismo cliente ws que funcionó en websocket-latency.js
 */

const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Configuración
const WS_URL = 'wss://api.inmero.co/telemetry/ws/telemetria';
const PASSWORD = 'telemetry_password_2024';
const REQUEST_ID = 'SOL-2025-0011';
const OUTPUT_DIR = path.join(__dirname, '../results/2025-11-26/websocket-load');

// Fases de la prueba
const PHASES = [
  { name: 'Fase 1: Inicial', connections: 5, duration: 30000 },
  { name: 'Fase 2: Incremental', connections: 15, duration: 60000 },
  { name: 'Fase 3: Carga sostenida', connections: 25, duration: 60000 }
];

// Métricas globales
const metrics = {
  totalConnectionsCreated: 0,
  activeConnections: 0,
  successfulConnections: 0,
  failedConnections: 0,
  messagesReceived: 0,
  errors: [],
  connectionTimes: [],
  phases: []
};

// Asegurar directorio de salida
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🚀 Iniciando prueba de carga WebSocket\n');
console.log('📋 Plan de prueba:');
PHASES.forEach((phase, i) => {
  console.log(`   Fase ${i+1}: ${phase.connections} conexiones durante ${phase.duration/1000}s`);
});
console.log('');

// Función para crear una conexión WebSocket
function createConnection(id, phaseInfo) {
  return new Promise((resolve) => {
    const wsUrl = `${WS_URL}/${encodeURIComponent(REQUEST_ID)}?password=${encodeURIComponent(PASSWORD)}`;
    const startTime = Date.now();
    
    const connectionMetrics = {
      id,
      phase: phaseInfo.name,
      status: 'connecting',
      connectionTime: null,
      messagesReceived: 0,
      errors: []
    };

    try {
      const ws = new WebSocket(wsUrl);

      ws.on('open', () => {
        const connectionTime = Date.now() - startTime;
        connectionMetrics.connectionTime = connectionTime;
        connectionMetrics.status = 'connected';
        
        metrics.totalConnectionsCreated++;
        metrics.activeConnections++;
        metrics.successfulConnections++;
        metrics.connectionTimes.push(connectionTime);
        
        console.log(`✅ Conexión #${id} establecida en ${connectionTime}ms (${phaseInfo.name})`);
      });

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          connectionMetrics.messagesReceived++;
          metrics.messagesReceived++;
        } catch (error) {
          connectionMetrics.errors.push({
            type: 'parse_error',
            message: error.message
          });
        }
      });

      ws.on('error', (error) => {
        connectionMetrics.status = 'error';
        connectionMetrics.errors.push({
          type: 'connection_error',
          message: error.message
        });
        metrics.failedConnections++;
        console.error(`❌ Error en conexión #${id}: ${error.message}`);
      });

      ws.on('close', () => {
        metrics.activeConnections--;
        if (connectionMetrics.status === 'connected') {
          connectionMetrics.status = 'closed';
        }
      });

      // Cerrar conexión después de la duración de la fase
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
        resolve(connectionMetrics);
      }, phaseInfo.duration);

    } catch (error) {
      connectionMetrics.status = 'failed';
      connectionMetrics.errors.push({
        type: 'creation_error',
        message: error.message
      });
      metrics.failedConnections++;
      console.error(`❌ Error creando conexión #${id}: ${error.message}`);
      resolve(connectionMetrics);
    }
  });
}

// Ejecutar fase de prueba
async function runPhase(phase, phaseIndex) {
  console.log(`\n📊 ${phase.name} - ${phase.connections} conexiones\n`);
  
  const phaseStartTime = Date.now();
  const phaseMetrics = {
    name: phase.name,
    targetConnections: phase.connections,
    duration: phase.duration,
    startTime: new Date().toISOString(),
    connections: []
  };

  // Crear conexiones con pequeño delay entre ellas
  const connectionPromises = [];
  for (let i = 0; i < phase.connections; i++) {
    const connectionId = metrics.totalConnectionsCreated + i + 1;
    
    // Delay progresivo para simular llegada de usuarios
    await new Promise(resolve => setTimeout(resolve, (phase.duration / phase.connections) / 10));
    
    connectionPromises.push(createConnection(connectionId, phase));
  }

  // Esperar a que todas las conexiones completen
  phaseMetrics.connections = await Promise.all(connectionPromises);
  phaseMetrics.endTime = new Date().toISOString();
  phaseMetrics.actualDuration = Date.now() - phaseStartTime;

  // Calcular estadísticas de la fase
  const successfulInPhase = phaseMetrics.connections.filter(c => c.status === 'connected' || c.status === 'closed').length;
  const failedInPhase = phaseMetrics.connections.filter(c => c.status === 'error' || c.status === 'failed').length;
  const messagesInPhase = phaseMetrics.connections.reduce((sum, c) => sum + c.messagesReceived, 0);

  phaseMetrics.summary = {
    successfulConnections: successfulInPhase,
    failedConnections: failedInPhase,
    successRate: ((successfulInPhase / phase.connections) * 100).toFixed(2) + '%',
    totalMessages: messagesInPhase
  };

  metrics.phases.push(phaseMetrics);

  console.log(`\n✅ ${phase.name} completada:`);
  console.log(`   Conexiones exitosas: ${successfulInPhase}/${phase.connections} (${phaseMetrics.summary.successRate})`);
  console.log(`   Mensajes recibidos: ${messagesInPhase}`);
  console.log(`   Conexiones activas: ${metrics.activeConnections}`);
}

// Función principal
async function runLoadTest() {
  const testStartTime = Date.now();

  try {
    // Ejecutar cada fase secuencialmente
    for (let i = 0; i < PHASES.length; i++) {
      await runPhase(PHASES[i], i);
      
      // Pequeña pausa entre fases
      if (i < PHASES.length - 1) {
        console.log('\n⏸️  Pausa de 5 segundos antes de la siguiente fase...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // Esperar a que todas las conexiones se cierren
    console.log('\n⏳ Esperando cierre de todas las conexiones...');
    while (metrics.activeConnections > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`   Conexiones activas restantes: ${metrics.activeConnections}`);
    }

  } catch (error) {
    console.error(`\n❌ Error en la prueba: ${error.message}`);
    metrics.errors.push({
      type: 'test_error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }

  const testDuration = Date.now() - testStartTime;

  // Generar reporte final
  generateReport(testDuration);
}

// Generar reporte final
function generateReport(testDuration) {
  console.log('\n\n═══════════════════════════════════════════════');
  console.log('      REPORTE DE CARGA WEBSOCKET - RESUMEN      ');
  console.log('═══════════════════════════════════════════════\n');

  // Calcular estadísticas
  const avgConnectionTime = metrics.connectionTimes.length > 0
    ? (metrics.connectionTimes.reduce((a, b) => a + b, 0) / metrics.connectionTimes.length).toFixed(2)
    : 'N/A';
  
  const minConnectionTime = metrics.connectionTimes.length > 0
    ? Math.min(...metrics.connectionTimes)
    : 'N/A';
  
  const maxConnectionTime = metrics.connectionTimes.length > 0
    ? Math.max(...metrics.connectionTimes)
    : 'N/A';

  const successRate = metrics.totalConnectionsCreated > 0
    ? ((metrics.successfulConnections / metrics.totalConnectionsCreated) * 100).toFixed(2)
    : 0;

  console.log(`📊 Resumen General:`);
  console.log(`   Duración total: ${(testDuration / 1000).toFixed(1)}s`);
  console.log(`   Total conexiones creadas: ${metrics.totalConnectionsCreated}`);
  console.log(`   Conexiones exitosas: ${metrics.successfulConnections}`);
  console.log(`   Conexiones fallidas: ${metrics.failedConnections}`);
  console.log(`   Tasa de éxito: ${successRate}%`);
  console.log(`   Total mensajes recibidos: ${metrics.messagesReceived}`);
  
  console.log(`\n⚡ Tiempos de Conexión:`);
  console.log(`   Mínimo: ${minConnectionTime}ms`);
  console.log(`   Máximo: ${maxConnectionTime}ms`);
  console.log(`   Promedio: ${avgConnectionTime}ms`);

  console.log(`\n📈 Resultados por Fase:`);
  metrics.phases.forEach((phase, i) => {
    console.log(`   Fase ${i + 1} (${phase.name}):`);
    console.log(`      Éxito: ${phase.summary.successfulConnections}/${phase.targetConnections} (${phase.summary.successRate})`);
    console.log(`      Mensajes: ${phase.summary.totalMessages}`);
  });

  console.log('\n═══════════════════════════════════════════════\n');

  // Preparar reporte JSON
  const report = {
    testMetadata: {
      timestamp: new Date().toISOString(),
      totalDuration: `${(testDuration / 1000).toFixed(1)}s`,
      targetEndpoint: `${WS_URL}/${REQUEST_ID}`
    },
    summary: {
      totalConnectionsCreated: metrics.totalConnectionsCreated,
      successfulConnections: metrics.successfulConnections,
      failedConnections: metrics.failedConnections,
      successRate: `${successRate}%`,
      totalMessagesReceived: metrics.messagesReceived
    },
    connectionMetrics: {
      min: `${minConnectionTime}ms`,
      max: `${maxConnectionTime}ms`,
      avg: `${avgConnectionTime}ms`
    },
    phases: metrics.phases.map(phase => ({
      name: phase.name,
      targetConnections: phase.targetConnections,
      duration: `${phase.duration / 1000}s`,
      startTime: phase.startTime,
      endTime: phase.endTime,
      summary: phase.summary
    })),
    errors: metrics.errors
  };

  // Guardar reporte
  const reportPath = path.join(OUTPUT_DIR, `websocket-load-test-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`✅ Reporte guardado: ${reportPath}\n`);

  // Guardar detalles completos
  const detailsPath = path.join(OUTPUT_DIR, `websocket-load-details-${Date.now()}.json`);
  fs.writeFileSync(detailsPath, JSON.stringify(metrics, null, 2));
  console.log(`✅ Detalles completos guardados: ${detailsPath}\n`);
}

// Manejo de señales
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Prueba interrumpida por el usuario');
  generateReport(Date.now());
  process.exit(0);
});

// Ejecutar prueba
runLoadTest();
