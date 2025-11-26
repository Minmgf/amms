/**
 * Script de Memory Profiling con Playwright y Chrome DevTools Protocol
 * 
 * Objetivos:
 * 1. Detectar memory leaks en uso prolongado
 * 2. Medir consumo de memoria en módulos críticos
 * 3. Identificar listeners no limpiados o referencias retenidas
 * 4. Validar limpieza de WebSocket y Context API
 * 
 * Módulos a probar:
 * - Módulo de Monitoreo (WebSocket, gráficos, mapas)
 * - Módulo de Tablas (Maquinaria, Mantenimientos, Solicitudes)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuración
let BASE_URL = 'http://localhost:3000/sigma';
const OUTPUT_DIR = path.join(__dirname, '../results/2025-11-26/memory-profiling');
const CREDENTIALS = {
  email: 'nicourrutia83@gmail.com',
  password: '@Nico9812.784'
};

// Asegurar directorio de salida
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Auto-detección de puerto del dev server (3000 o 3001)
async function resolveBaseUrl() {
  const candidates = ['http://localhost:3000/sigma', 'http://localhost:3001/sigma'];
  for (const base of candidates) {
    try {
      const res = await fetch(`${base}/login`, { method: 'GET' });
      if (res && (res.status === 200 || res.status === 304)) {
        BASE_URL = base;
        console.log(`🔎 BASE_URL detectado: ${BASE_URL}`);
        return BASE_URL;
      }
    } catch (e) {
      // ignorar y probar siguiente
    }
  }
  // fallback: 3000
  console.log(`⚠️ No se pudo detectar, usando por defecto: ${BASE_URL}`);
  return BASE_URL;
}

// Utilidad para formatear bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Función para tomar snapshot de memoria
async function takeMemorySnapshot(page, label, metrics) {
  const timestamp = Date.now();
  
  // Obtener métricas de memoria del navegador
  const memoryMetrics = await page.evaluate(() => {
    if (performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  });

  // Obtener métricas del proceso (Chrome DevTools Protocol)
  const cdpSession = await page.context().newCDPSession(page);
  let processMetrics = null;
  try {
    processMetrics = await cdpSession.send('Performance.getMetrics');
  } catch (error) {
    console.warn(`⚠️  No se pudieron obtener métricas del proceso: ${error.message}`);
  }

  const snapshot = {
    label,
    timestamp: new Date().toISOString(),
    memoryMetrics,
    processMetrics: processMetrics ? processMetrics.metrics : null,
    formatted: memoryMetrics ? {
      usedJSHeapSize: formatBytes(memoryMetrics.usedJSHeapSize),
      totalJSHeapSize: formatBytes(memoryMetrics.totalJSHeapSize),
      jsHeapSizeLimit: formatBytes(memoryMetrics.jsHeapSizeLimit),
      heapUtilization: ((memoryMetrics.usedJSHeapSize / memoryMetrics.totalJSHeapSize) * 100).toFixed(2) + '%'
    } : null
  };

  metrics.snapshots.push(snapshot);

  console.log(`📸 Snapshot: ${label}`);
  if (snapshot.formatted) {
    console.log(`   Heap usado: ${snapshot.formatted.usedJSHeapSize} / ${snapshot.formatted.totalJSHeapSize} (${snapshot.formatted.heapUtilization})`);
  }

  await cdpSession.detach();
  return snapshot;
}

// Test 1: Memory profiling del módulo de monitoreo
async function testMonitoringModuleMemory() {
  console.log('\n🔍 TEST 1: Memory Profiling - Módulo de Monitoreo\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--enable-precise-memory-info']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  const metrics = {
    testName: 'Módulo de Monitoreo - Memory Profiling',
    startTime: new Date().toISOString(),
    snapshots: []
  };

  try {
    // Resolver BASE_URL dinámicamente
    await resolveBaseUrl();
    // Snapshot 1: Página de login
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await takeMemorySnapshot(page, '1. Página de Login (inicial)', metrics);
    await page.waitForTimeout(2000);

    // Login
    console.log('🔐 Realizando login...');
    await page.fill('input[aria-label="Email Input"]', CREDENTIALS.email);
    await page.fill('input[aria-label="Password Input"]', CREDENTIALS.password);
    await page.click('button[aria-label="Login Button"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Snapshot 2: Dashboard después de login
    await takeMemorySnapshot(page, '2. Dashboard (después de login)', metrics);
    await page.waitForTimeout(2000);

    // Navegar a monitoreo
    console.log('📊 Navegando a módulo de monitoreo...');
    await page.goto(`${BASE_URL}/monitoring`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Snapshot 3: Módulo de monitoreo cargado
    await takeMemorySnapshot(page, '3. Monitoreo (inicial)', metrics);

    // Esperar a que se carguen componentes (WebSocket, gráficos, mapas)
    console.log('⏳ Esperando carga de componentes (10s)...');
    await page.waitForTimeout(10000);

    // Snapshot 4: Después de carga de componentes
    await takeMemorySnapshot(page, '4. Monitoreo (componentes cargados)', metrics);

    // Simular interacción del usuario
    console.log('🖱️  Simulando interacciones...');
    await page.mouse.move(500, 500);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(2000);
    await page.mouse.wheel(0, -500);
    await page.waitForTimeout(2000);

    // Snapshot 5: Después de interacciones
    await takeMemorySnapshot(page, '5. Monitoreo (después de interacciones)', metrics);

    // Mantener página abierta para observar memory leaks potenciales
    console.log('⏳ Esperando 30s para detectar memory leaks...');
    for (let i = 0; i < 3; i++) {
      await page.waitForTimeout(10000);
      await takeMemorySnapshot(page, `6.${i+1}. Monitoreo (después de ${(i+1)*10}s de uso)`, metrics);
    }

    // Navegar de vuelta al dashboard para verificar limpieza
    console.log('🔄 Navegando de vuelta al dashboard...');
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Snapshot final: Verificar si la memoria se liberó
    await takeMemorySnapshot(page, '7. Dashboard (después de salir de monitoreo)', metrics);

    // Forzar garbage collection (solo funciona con flag --expose-gc)
    await page.evaluate(() => {
      if (window.gc) {
        window.gc();
      }
    });
    await page.waitForTimeout(2000);

    // Snapshot después de GC
    await takeMemorySnapshot(page, '8. Dashboard (después de GC)', metrics);

  } catch (error) {
    console.error(`❌ Error en test de monitoreo: ${error.message}`);
    metrics.error = error.message;
  }

  metrics.endTime = new Date().toISOString();
  
  // Guardar resultados
  const reportPath = path.join(OUTPUT_DIR, `monitoring-memory-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(metrics, null, 2));
  console.log(`\n✅ Reporte guardado: ${reportPath}`);

  await browser.close();
  return metrics;
}

// Test 2: Memory profiling de tablas con navegación
async function testTablesMemory() {
  console.log('\n🔍 TEST 2: Memory Profiling - Módulos de Tablas\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--enable-precise-memory-info']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  const metrics = {
    testName: 'Tablas de Datos - Memory Profiling',
    startTime: new Date().toISOString(),
    snapshots: []
  };

  try {
    // Login
    console.log('🔐 Realizando login...');
    // Resolver BASE_URL dinámicamente
    await resolveBaseUrl();
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[aria-label="Email Input"]', CREDENTIALS.email);
    await page.fill('input[aria-label="Password Input"]', CREDENTIALS.password);
    await page.click('button[aria-label="Login Button"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Snapshot inicial
    await takeMemorySnapshot(page, '1. Dashboard (inicial)', metrics);

    // Probar 3 módulos de tablas
    const tableModules = [
      { name: 'Maquinaria', url: `${BASE_URL}/machinery` },
      { name: 'Mantenimientos', url: `${BASE_URL}/maintenance/scheduledMaintenance` },
      { name: 'Solicitudes', url: `${BASE_URL}/requests/requestsManagement` }
    ];

    for (const module of tableModules) {
      console.log(`\n📊 Probando módulo: ${module.name}`);
      
      // Navegar al módulo
      await page.goto(module.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      await takeMemorySnapshot(page, `${module.name} - Cargado`, metrics);

      // Buscar input de filtro
      const searchInput = await page.locator('input[placeholder*="Buscar"]').first();
      if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('🔍 Probando filtrado...');
        await searchInput.fill('test');
        await page.waitForTimeout(1000);
        await takeMemorySnapshot(page, `${module.name} - Después de filtrado`, metrics);
        await searchInput.clear();
        await page.waitForTimeout(500);
      }

      // Scroll
      console.log('📜 Probando scroll...');
      await page.mouse.wheel(0, 1000);
      await page.waitForTimeout(1000);
      await takeMemorySnapshot(page, `${module.name} - Después de scroll`, metrics);
    }

    // Volver al dashboard
    console.log('\n🔄 Volviendo al dashboard...');
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await takeMemorySnapshot(page, 'Dashboard - Final (después de todos los módulos)', metrics);

    // Forzar GC
    await page.evaluate(() => {
      if (window.gc) {
        window.gc();
      }
    });
    await page.waitForTimeout(2000);
    await takeMemorySnapshot(page, 'Dashboard - Final (después de GC)', metrics);

  } catch (error) {
    console.error(`❌ Error en test de tablas: ${error.message}`);
    metrics.error = error.message;
  }

  metrics.endTime = new Date().toISOString();
  
  // Guardar resultados
  const reportPath = path.join(OUTPUT_DIR, `tables-memory-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(metrics, null, 2));
  console.log(`\n✅ Reporte guardado: ${reportPath}`);

  await browser.close();
  return metrics;
}

// Función para analizar memory leaks
function analyzeMemoryLeaks(metrics) {
  console.log('\n📊 ANÁLISIS DE MEMORY LEAKS\n');
  console.log('═══════════════════════════════════════════════\n');

  const snapshots = metrics.snapshots.filter(s => s.memoryMetrics);
  
  if (snapshots.length < 2) {
    console.log('⚠️  No hay suficientes snapshots para análisis');
    return null;
  }

  const initialMemory = snapshots[0].memoryMetrics.usedJSHeapSize;
  const finalMemory = snapshots[snapshots.length - 1].memoryMetrics.usedJSHeapSize;
  const memoryIncrease = finalMemory - initialMemory;
  const percentageIncrease = ((memoryIncrease / initialMemory) * 100).toFixed(2);

  console.log(`📈 Memoria Inicial: ${formatBytes(initialMemory)}`);
  console.log(`📈 Memoria Final: ${formatBytes(finalMemory)}`);
  console.log(`📊 Incremento: ${formatBytes(memoryIncrease)} (${percentageIncrease}%)\n`);

  // Buscar incrementos progresivos (posible memory leak)
  let hasProgressiveIncrease = false;
  for (let i = 1; i < snapshots.length - 1; i++) {
    const prev = snapshots[i - 1].memoryMetrics.usedJSHeapSize;
    const current = snapshots[i].memoryMetrics.usedJSHeapSize;
    const increase = current - prev;
    
    if (increase > 5 * 1024 * 1024) { // Más de 5MB de incremento
      hasProgressiveIncrease = true;
      console.log(`⚠️  Incremento significativo detectado:`);
      console.log(`   ${snapshots[i - 1].label} → ${snapshots[i].label}`);
      console.log(`   +${formatBytes(increase)}\n`);
    }
  }

  const analysis = {
    initialMemory: formatBytes(initialMemory),
    finalMemory: formatBytes(finalMemory),
    memoryIncrease: formatBytes(memoryIncrease),
    percentageIncrease: `${percentageIncrease}%`,
    hasProgressiveIncrease,
    recommendation: memoryIncrease > 50 * 1024 * 1024 
      ? '❌ CRÍTICO: Memory leak potencial detectado (>50MB incremento)'
      : memoryIncrease > 20 * 1024 * 1024
      ? '⚠️  ADVERTENCIA: Incremento significativo de memoria (>20MB)'
      : '✅ NORMAL: Incremento de memoria dentro de rangos aceptables'
  };

  console.log(analysis.recommendation);
  console.log('\n═══════════════════════════════════════════════\n');

  return analysis;
}

// Función principal
async function runMemoryProfiling() {
  console.log('🚀 Iniciando Memory Profiling\n');
  console.log('📋 Plan:');
  console.log('   1. Memory profiling del módulo de monitoreo (WebSocket, gráficos)');
  console.log('   2. Memory profiling de módulos de tablas');
  console.log('   3. Análisis de memory leaks\n');

  const results = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  try {
    // Test 1: Módulo de monitoreo
    const monitoringMetrics = await testMonitoringModuleMemory();
    const monitoringAnalysis = analyzeMemoryLeaks(monitoringMetrics);
    results.tests.push({
      test: 'monitoring',
      metrics: monitoringMetrics,
      analysis: monitoringAnalysis
    });

    // Test 2: Módulos de tablas
    const tablesMetrics = await testTablesMemory();
    const tablesAnalysis = analyzeMemoryLeaks(tablesMetrics);
    results.tests.push({
      test: 'tables',
      metrics: tablesMetrics,
      analysis: tablesAnalysis
    });

    // Guardar resumen general
    const summaryPath = path.join(OUTPUT_DIR, `memory-profiling-summary-${Date.now()}.json`);
    fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));
    console.log(`\n✅ Resumen general guardado: ${summaryPath}\n`);

    // Mostrar resumen final
    console.log('\n═══════════════════════════════════════════════');
    console.log('        RESUMEN FINAL - MEMORY PROFILING        ');
    console.log('═══════════════════════════════════════════════\n');
    
    results.tests.forEach(test => {
      console.log(`📊 ${test.metrics.testName}`);
      if (test.analysis) {
        console.log(`   Memoria inicial: ${test.analysis.initialMemory}`);
        console.log(`   Memoria final: ${test.analysis.finalMemory}`);
        console.log(`   Incremento: ${test.analysis.memoryIncrease} (${test.analysis.percentageIncrease})`);
        console.log(`   ${test.analysis.recommendation}\n`);
      }
    });

    console.log('═══════════════════════════════════════════════\n');

  } catch (error) {
    console.error(`❌ Error en memory profiling: ${error.message}`);
    results.error = error.message;
  }
}

// Ejecutar
runMemoryProfiling().then(() => {
  console.log('✅ Memory profiling completado\n');
  process.exit(0);
}).catch(error => {
  console.error(`❌ Error fatal: ${error.message}`);
  process.exit(1);
});
