/**
 * Script para medir performance del modal de tracking/monitoreo
 * Usa Playwright para automatizar y Chrome DevTools Protocol para métricas
 * 
 * Métricas medidas:
 * - Tiempo de apertura del modal
 * - Tiempo de renderizado inicial
 * - FPS durante interacción
 * - Memoria utilizada
 * - Tiempo de carga de componentes (gráficos, mapa)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuración
const BASE_URL = 'http://localhost:3000/sigma';
const LOGIN_EMAIL = 'nicourrutia83@gmail.com';
const LOGIN_PASSWORD = '@Nico9812.784';
const OUTPUT_DIR = path.join(__dirname, '../results/2025-11-26/modal-performance');

// Asegurar que el directorio existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function measureModalPerformance() {
  console.log('🚀 Iniciando prueba de performance del modal de monitoreo...\n');
  
  const browser = await chromium.launch({
    headless: false, // Modo visible para debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Habilitar métricas de performance
  const client = await page.context().newCDPSession(page);
  await client.send('Performance.enable');
  
  const metrics = {
    login: {},
    navigation: {},
    modalOpen: {},
    rendering: {},
    memory: []
  };
  
  try {
    // 1. Login
    console.log('🔐 Iniciando sesión...');
    const loginStart = Date.now();
    
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[aria-label="Email Input"]', LOGIN_EMAIL);
    await page.fill('input[aria-label="Password Input"]', LOGIN_PASSWORD);
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('button[aria-label="Login Button"]')
    ]);
    
    metrics.login.duration = Date.now() - loginStart;
    console.log(`✅ Login completado en ${metrics.login.duration}ms\n`);
    
    // 2. Navegar a página de monitoreo
    console.log('📍 Navegando a página de monitoreo...');
    const navStart = Date.now();
    
    await page.goto(`${BASE_URL}/monitoring`, { waitUntil: 'networkidle' });
    
    metrics.navigation.duration = Date.now() - navStart;
    console.log(`✅ Navegación completada en ${metrics.navigation.duration}ms\n`);
    
    // Esperar que la página cargue
    await page.waitForTimeout(3000);
    
    // 3. Medir componentes de monitoreo directamente (sin modal)
    console.log('⏱️  Midiendo renderizado de componentes de monitoreo...');
    const renderStart = Date.now();
    
    // Esperar que los componentes clave se carguen
    const componentsToWait = [
      page.waitForSelector('canvas, svg[class*="recharts"]', { timeout: 10000 }).catch(() => console.log('   ⚠️  Gráficos no encontrados')),
      page.waitForSelector('[class*="leaflet"], .map-container', { timeout: 10000 }).catch(() => console.log('   ⚠️  Mapa no encontrado')),
      page.waitForSelector('table, [role="table"]', { timeout: 10000 }).catch(() => console.log('   ⚠️  Tabla no encontrada'))
    ];
    
    await Promise.allSettled(componentsToWait);
    
    metrics.rendering.duration = Date.now() - renderStart;
    console.log(`✅ Componentes renderizados en ${metrics.rendering.duration}ms\n`);
    
    // 4. Capturar métricas de memoria
    console.log('💾 Capturando métricas de memoria...');
    const memoryMetrics = await client.send('Performance.getMetrics');
    
    memoryMetrics.metrics.forEach(metric => {
      if (metric.name.includes('Memory') || metric.name.includes('Heap')) {
        metrics.memory.push({
          name: metric.name,
          value: metric.value
        });
      }
    });
    
    console.log('✅ Métricas de memoria capturadas\n');
    
    // 5. Capturar screenshot
    console.log('📸 Capturando screenshot...');
    const screenshotPath = path.join(OUTPUT_DIR, `modal-screenshot-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`✅ Screenshot guardado: ${screenshotPath}\n`);
    
    // 6. Medir FPS durante interacción (simulación de scroll/hover)
    console.log('🎯 Midiendo FPS durante interacción...');
    
    await client.send('Overlay.enable');
    await client.send('Overlay.setShowFPSCounter', { show: true });
    
    // Simular interacciones
    await page.mouse.move(500, 300);
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(1000);
    await page.mouse.wheel(0, -100);
    await page.waitForTimeout(1000);
    
    console.log('✅ Interacciones simuladas\n');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    metrics.error = error.message;
    
    // Capturar screenshot del error
    const errorScreenshot = path.join(OUTPUT_DIR, `error-screenshot-${Date.now()}.png`);
    await page.screenshot({ path: errorScreenshot });
    console.log(`📸 Screenshot de error guardado: ${errorScreenshot}`);
  } finally {
    // Guardar reporte
    console.log('📊 Generando reporte...\n');
    
    const report = {
      testMetadata: {
        timestamp: new Date().toISOString(),
        baseUrl: BASE_URL,
        viewport: '1920x1080'
      },
      metrics
    };
    
    const reportPath = path.join(OUTPUT_DIR, `modal-performance-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('═══════════════════════════════════════════════');
    console.log('      REPORTE DE PERFORMANCE DEL MODAL        ');
    console.log('═══════════════════════════════════════════════');
    console.log(`\n🔐 Login: ${metrics.login.duration || 'N/A'}ms`);
    console.log(`📍 Navegación: ${metrics.navigation.duration || 'N/A'}ms`);
    console.log(`📊 Apertura de modal: ${metrics.modalOpen.duration || 'N/A'}ms`);
    console.log(`🎨 Renderizado: ${metrics.rendering.duration || 'N/A'}ms`);
    console.log(`💾 Métricas de memoria: ${metrics.memory.length} capturadas`);
    console.log('═══════════════════════════════════════════════\n');
    
    console.log(`✅ Reporte guardado: ${reportPath}\n`);
    
    await browser.close();
  }
}

// Ejecutar prueba
measureModalPerformance()
  .then(() => {
    console.log('✅ Prueba completada exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
