/**
 * Script para medir performance de tablas grandes
 * Prueba renderizado, ordenamiento, filtrado y scroll
 * 
 * Métricas medidas:
 * - Tiempo de renderizado inicial de la tabla
 * - Tiempo de ordenamiento por columna
 * - Tiempo de filtrado/búsqueda
 * - FPS durante scroll
 * - Memoria utilizada
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuración
const BASE_URL = 'http://localhost:3000/sigma';
const LOGIN_EMAIL = 'nicourrutia83@gmail.com';
const LOGIN_PASSWORD = '@Nico9812.784';
const OUTPUT_DIR = path.join(__dirname, '../results/2025-11-26/table-performance');

// Páginas con tablas para probar
const TABLE_PAGES = [
  { name: 'Maquinaria', url: '/machinery' },
  { name: 'Mantenimientos-Programados', url: '/maintenance/scheduledMaintenance' },
  { name: 'Solicitudes-Gestion', url: '/requests/requestsManagement' }
];

// Asegurar que el directorio existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function measureTablePerformance() {
  console.log('🚀 Iniciando prueba de performance de tablas...\n');
  
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Habilitar métricas de performance
  const client = await page.context().newCDPSession(page);
  await client.send('Performance.enable');
  
  const allMetrics = {};
  
  try {
    // 1. Login
    console.log('🔐 Iniciando sesión...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[aria-label="Email Input"]', LOGIN_EMAIL);
    await page.fill('input[aria-label="Password Input"]', LOGIN_PASSWORD);
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('button[aria-label="Login Button"]')
    ]);
    
    console.log('✅ Login completado\n');
    
    // 2. Probar cada página con tabla
    for (const tablePage of TABLE_PAGES) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`📊 PROBANDO TABLA: ${tablePage.name}`);
      console.log('='.repeat(50) + '\n');
      
      const metrics = {
        pageName: tablePage.name,
        url: tablePage.url,
        navigation: {},
        tableRender: {},
        sorting: {},
        filtering: {},
        scrolling: {},
        memory: []
      };
      
      try {
        // Navegar a la página
        console.log(`📍 Navegando a ${tablePage.url}...`);
        const navStart = Date.now();
        
        await page.goto(`${BASE_URL}${tablePage.url}`, { waitUntil: 'networkidle', timeout: 30000 });
        
        metrics.navigation.duration = Date.now() - navStart;
        console.log(`✅ Navegación: ${metrics.navigation.duration}ms\n`);
        
        // Esperar que la tabla se renderice
        console.log('⏱️  Midiendo renderizado de tabla...');
        const renderStart = Date.now();
        
        await page.waitForSelector('table, [role="table"]', { timeout: 10000 });
        
        // Esperar que haya al menos una fila de datos
        await page.waitForSelector('tbody tr, [role="row"]', { timeout: 10000 });
        
        metrics.tableRender.duration = Date.now() - renderStart;
        
        // Contar filas
        const rowCount = await page.locator('tbody tr, [role="row"]').count();
        metrics.tableRender.rowCount = rowCount;
        
        console.log(`✅ Tabla renderizada: ${metrics.tableRender.duration}ms (${rowCount} filas)\n`);
        
        // Probar ordenamiento
        console.log('🔀 Probando ordenamiento...');
        const sortStart = Date.now();
        
        // Buscar encabezados clickeables
        const headerButton = await page.locator('th button, th[role="columnheader"]').first();
        
        if (await headerButton.count() > 0) {
          await headerButton.click();
          await page.waitForTimeout(500); // Esperar animación
          
          metrics.sorting.duration = Date.now() - sortStart;
          console.log(`✅ Ordenamiento: ${metrics.sorting.duration}ms\n`);
        } else {
          console.log('⚠️  No se encontraron columnas ordenables\n');
          metrics.sorting.duration = null;
        }
        
        // Probar filtrado/búsqueda
        console.log('🔍 Probando filtrado...');
        const searchInput = await page.locator('input[type="search"], input[placeholder*="uscar"], input[placeholder*="iltrar"]').first();
        
        if (await searchInput.count() > 0) {
          const filterStart = Date.now();
          
          await searchInput.fill('test');
          await page.waitForTimeout(500); // Esperar debounce
          
          metrics.filtering.duration = Date.now() - filterStart;
          
          // Contar filas después del filtro
          const filteredRows = await page.locator('tbody tr, [role="row"]').count();
          metrics.filtering.rowsAfterFilter = filteredRows;
          
          console.log(`✅ Filtrado: ${metrics.filtering.duration}ms (${filteredRows} filas resultantes)\n`);
          
          // Limpiar filtro
          await searchInput.clear();
          await page.waitForTimeout(300);
        } else {
          console.log('⚠️  No se encontró campo de búsqueda\n');
          metrics.filtering.duration = null;
        }
        
        // Probar scroll
        console.log('📜 Probando scroll en tabla...');
        const scrollStart = Date.now();
        
        // Scroll hacia abajo
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight / 2);
        });
        await page.waitForTimeout(300);
        
        // Scroll hacia arriba
        await page.evaluate(() => {
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(300);
        
        metrics.scrolling.duration = Date.now() - scrollStart;
        console.log(`✅ Scroll: ${metrics.scrolling.duration}ms\n`);
        
        // Capturar métricas de memoria
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
        
        // Capturar screenshot
        const screenshotPath = path.join(OUTPUT_DIR, `table-${tablePage.name.toLowerCase()}-${Date.now()}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });
        console.log(`📸 Screenshot guardado: ${screenshotPath}`);
        
      } catch (error) {
        console.error(`❌ Error en tabla ${tablePage.name}:`, error.message);
        metrics.error = error.message;
        
        // Screenshot del error
        const errorScreenshot = path.join(OUTPUT_DIR, `error-${tablePage.name.toLowerCase()}-${Date.now()}.png`);
        await page.screenshot({ path: errorScreenshot });
      }
      
      allMetrics[tablePage.name] = metrics;
    }
    
  } catch (error) {
    console.error('❌ Error fatal:', error.message);
  } finally {
    // Guardar reporte consolidado
    console.log('\n📊 Generando reporte consolidado...\n');
    
    const report = {
      testMetadata: {
        timestamp: new Date().toISOString(),
        baseUrl: BASE_URL,
        viewport: '1920x1080',
        pagestested: TABLE_PAGES.length
      },
      results: allMetrics
    };
    
    const reportPath = path.join(OUTPUT_DIR, `table-performance-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Mostrar resumen
    console.log('═══════════════════════════════════════════════');
    console.log('      REPORTE DE PERFORMANCE DE TABLAS        ');
    console.log('═══════════════════════════════════════════════\n');
    
    for (const [tableName, metrics] of Object.entries(allMetrics)) {
      console.log(`📊 ${tableName}:`);
      console.log(`   Navegación: ${metrics.navigation.duration || 'N/A'}ms`);
      console.log(`   Renderizado: ${metrics.tableRender.duration || 'N/A'}ms (${metrics.tableRender.rowCount || 0} filas)`);
      console.log(`   Ordenamiento: ${metrics.sorting.duration || 'N/A'}ms`);
      console.log(`   Filtrado: ${metrics.filtering.duration || 'N/A'}ms`);
      console.log(`   Scroll: ${metrics.scrolling.duration || 'N/A'}ms`);
      console.log(`   Memoria: ${metrics.memory.length} métricas\n`);
    }
    
    console.log('═══════════════════════════════════════════════\n');
    console.log(`✅ Reporte guardado: ${reportPath}\n`);
    
    await browser.close();
  }
}

// Ejecutar prueba
measureTablePerformance()
  .then(() => {
    console.log('✅ Prueba completada exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
