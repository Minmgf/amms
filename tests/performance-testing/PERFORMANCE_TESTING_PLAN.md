# Plan de Pruebas de Rendimiento - AMMS (Asset Maintenance Management System)
## 🚀 Plan de Ejecución Acelerado (Hoy)

Este plan está diseñado para ejecutar pruebas clave en un solo día, priorizando módulos críticos y generando un reporte preliminar accionable.

### Bloque 1 (09:00–10:00) — Preparación y Línea Base
- Instalar herramientas (si faltan): Lighthouse, K6, Artillery, wscat
- Levantar servidor: `npm run dev`
- Crear carpeta de resultados del día: `tests/performance-testing/results/YYYY-MM-DD/`
- Ejecutar Lighthouse en páginas clave: login, dashboard, maquinaria, monitoreo

Comandos sugeridos:
```bash
- **Time to Interactive (TTI):** < 5 segundos
- **First Contentful Paint (FCP):** < 1.5 segundos
- **Tiempo de respuesta API:** < 500ms (90% de las peticiones)
- **Latencia WebSocket:** < 100ms
- **Uso de memoria:** < 200MB en navegador

### Bloque 2 (10:00–12:00) — Módulos Críticos
- Monitoreo (WebSocket): latencia, estabilidad, FPS
- Maquinaria: tabla y modal multi-paso (tiempos de interacción)
- Autenticación: tiempo de login completo

Acciones y métricas:
- WebSocket con `wscat` (latencia):
```bash
- **Tasa de error:** < 1%

- Medir apertura del `TrackingDashboardModal` y FPS con Chrome Performance
- Medir render de tabla de maquinaria con 50–100 registros
- Ejecutar login 5 veces y promediar

### Bloque 3 (12:00–13:00) — Pruebas de Carga Básicas (Smoke/Load)
- K6 sobre endpoints críticos (auth, machinery list, requests list)

Ejemplo K6 (guardar en `tests/performance-testing/configs/k6-load-test.js`):
```javascript
---

## 🛠️ Tecnologías y Herramientas

### 1. Pruebas de Rendimiento Frontend

#### **Lighthouse (Google Chrome)**
- **Propósito:** Análisis de rendimiento, accesibilidad, SEO y mejores prácticas
- **Métricas:** Performance Score, FCP, LCP, TTI, TBT, CLS
- **Uso:** Auditorías automatizadas de cada página principal
- **Instalación:** Integrado en Chrome DevTools

```bash
npm install -g lighthouse
lighthouse http://localhost:3000 --output html --output-path ./results/lighthouse-report.html
```

#### **WebPageTest**

Comando:
```bash
- **Propósito:** Análisis detallado de carga de página desde múltiples ubicaciones
- **URL:** https://www.webpagetest.org/

### Bloque 4 (13:00–14:00) — WebSocket Concurrente (Artillery)
- 10–25 conexiones simultáneas al canal de telemetría
- Medir conexiones exitosas, mensajes/segundo y desconexiones

Ejemplo `artillery` (guardar en `tests/performance-testing/configs/artillery-websocket.yml`):
```yaml
- **Métricas:** Waterfall, Speed Index, Filmstrip

#### **Chrome DevTools Performance Profiler**
- **Propósito:** Análisis detallado de ejecución JavaScript, renderizado
- **Uso:** Grabación de actividad durante interacciones críticas
- **Métricas:** Scripting time, Rendering time, Idle time

### 2. Pruebas de Carga y Estrés Backend/API

#### **Apache JMeter**
- **Propósito:** Pruebas de carga para APIs REST
- **Instalación:** https://jmeter.apache.org/download_jmeter.cgi
- **Escenarios:** 
  - Carga normal: 50 usuarios concurrentes
  - Carga pico: 200 usuarios concurrentes
  - Estrés: 500+ usuarios concurrentes

#### **K6 (Grafana)**

Comando:
```bash
- **Propósito:** Pruebas de carga modernas con scripts en JavaScript
- **Instalación:** 

### Bloque 5 (14:00–15:00) — Memoria y Recursos (Ronda Rápida)
- Chrome Memory Profiler: snapshots al inicio y a los 15/30 minutos en monitoreo
- React DevTools Profiler: detectar re-renders costosos
- Objetivos: Heap < 200MB a los 30 min, FPS ≥ 30 durante updates

### Bloque 6 (15:00–16:00) — Consolidación y Reporte Preliminar
- Documentar resultados con `RESULTS_TEMPLATE.md` en `results/YYYY-MM-DD/summary-report.md`
- Resumir KPIs vs objetivos de `METRICS_AND_KPIS.md`
- Lista corta de optimizaciones priorizadas (Top 5)

Entregables del día:
- Reportes Lighthouse (4 páginas)
- Resultados K6 y Artillery
- Evidencias de Performance/Memory (screenshots)
- Reporte preliminar con hallazgos y acciones
```bash
npm install -g k6
```
- **Ventajas:** Integración con CI/CD, métricas detalladas, curva de aprendizaje baja

#### **Artillery**
- **Propósito:** Pruebas de carga para APIs y WebSockets
- **Instalación:**
```bash
npm install -g artillery
```
- **Ventaja especial:** Excelente para probar WebSockets de telemetría

### 3. Pruebas de WebSocket

#### **wscat**
- **Propósito:** Cliente WebSocket de línea de comandos
- **Instalación:**
```bash
npm install -g wscat
```

#### **Artillery** (WebSocket específico)
- **Propósito:** Pruebas de carga para conexiones WebSocket
- **Escenarios:** Múltiples clientes conectados simultáneamente al sistema de tracking

### 4. Monitoreo de Recursos del Navegador

#### **Chrome Memory Profiler**
- **Propósito:** Detectar memory leaks, analizar uso de memoria
- **Métricas:** Heap size, Detached DOM nodes

#### **React Developer Tools Profiler**
- **Propósito:** Análisis de renderizado de componentes React
- **Métricas:** Tiempo de render por componente, causas de re-renders

### 5. Automatización

#### **Playwright**
- **Propósito:** Automatización de pruebas de rendimiento E2E
- **Instalación:**
```bash
npm install -D @playwright/test
```
- **Ventajas:** Métricas de rendimiento integradas, trazado de red

#### **Puppeteer**
- **Propósito:** Automatización de Chrome para pruebas de rendimiento
- **Instalación:**
```bash
npm install puppeteer
```

---

## 📊 Metodología de Pruebas

### Fase 1: Pruebas de Rendimiento de Carga Inicial
**Objetivo:** Medir tiempos de carga de cada módulo

**Herramientas:** Lighthouse, Chrome DevTools  
**Procedimiento:**
1. Limpiar caché del navegador
2. Cargar página principal
3. Registrar métricas: FCP, LCP, TTI, TBT
4. Repetir 5 veces y promediar
5. Documentar resultados

### Fase 2: Pruebas de Interacción de Usuario
**Objetivo:** Medir tiempos de respuesta durante operaciones comunes

**Herramientas:** Playwright, Chrome DevTools Performance  
**Procedimiento:**
1. Simular flujos de usuario típicos
2. Medir tiempo de respuesta de cada acción
3. Identificar operaciones lentas (> 500ms)
4. Analizar causas (red, JavaScript, renderizado)

### Fase 3: Pruebas de Carga API
**Objetivo:** Evaluar capacidad de las APIs bajo carga

**Herramientas:** K6, JMeter, Artillery  
**Escenarios:**
- **Smoke Test:** 1-5 usuarios, validar funcionamiento básico
- **Load Test:** 50-100 usuarios, comportamiento bajo carga normal
- **Stress Test:** 200-500 usuarios, identificar punto de quiebre
- **Spike Test:** Aumento súbito de 10 a 200 usuarios
- **Soak Test:** Carga constante durante 1 hora, detectar memory leaks

### Fase 4: Pruebas de WebSocket en Tiempo Real
**Objetivo:** Validar rendimiento del sistema de tracking

**Herramientas:** Artillery, wscat  
**Escenarios:**
1. Conexión única, validar latencia
2. 10 conexiones concurrentes
3. 50 conexiones concurrentes
4. Medir: tiempo de conexión, latencia de mensajes, tasa de pérdida de datos

### Fase 5: Pruebas de Memoria y Recursos
**Objetivo:** Detectar memory leaks y uso excesivo de recursos

**Herramientas:** Chrome Memory Profiler, React DevTools  
**Procedimiento:**
1. Tomar snapshot inicial de memoria
2. Realizar operaciones repetitivas (abrir/cerrar modales, navegar entre páginas)
3. Tomar snapshots periódicos
4. Comparar y analizar crecimiento de memoria
5. Identificar objetos no liberados

### Fase 6: Pruebas de Rendimiento de Gráficos y Visualizaciones
**Objetivo:** Evaluar rendimiento de Recharts y mapas Leaflet

**Herramientas:** Chrome Performance Profiler  
**Métricas:**
- Frame rate (debe ser >= 30 FPS)
- Tiempo de renderizado de gráficos
- Impacto en main thread

---

## 🎯 Criterios de Aceptación

### Performance Score (Lighthouse)
- **Excelente:** >= 90
- **Bueno:** 70-89
- **Necesita mejora:** 50-69
- **Inaceptable:** < 50

### Tiempos de Respuesta
| Operación | Objetivo | Aceptable | Inaceptable |
|-----------|----------|-----------|-------------|
| Carga inicial | < 2s | < 3s | >= 5s |
| Navegación entre páginas | < 500ms | < 1s | >= 2s |
| Abrir modal | < 200ms | < 500ms | >= 1s |
| Consulta API | < 300ms | < 500ms | >= 1s |
| Actualización WebSocket | < 100ms | < 200ms | >= 500ms |
| Renderizado de tabla | < 500ms | < 1s | >= 2s |

### Capacidad de Carga
- **Usuarios concurrentes:** >= 100 sin degradación
- **Tasa de error:** < 1% bajo carga normal
- **Tasa de error:** < 5% bajo carga pico

---

## 📁 Organización de Archivos

```
tests/performance-testing/
├── PERFORMANCE_TESTING_PLAN.md          # Este documento
├── MODULE_TESTING_BREAKDOWN.md          # Desglose por módulos
├── METRICS_AND_KPIS.md                  # Métricas detalladas
├── RESULTS_TEMPLATE.md                  # Plantilla de reportes
├── configs/
│   ├── k6-load-test.js                  # Scripts K6
│   ├── artillery-websocket.yml          # Configuración Artillery
│   ├── jmeter-test-plan.jmx             # Plan JMeter
│   └── lighthouse-config.js             # Configuración Lighthouse
├── scripts/
│   ├── run-lighthouse.sh                # Script automatización Lighthouse
│   ├── run-k6-tests.sh                  # Script pruebas K6
│   ├── run-websocket-tests.sh           # Script pruebas WebSocket
│   └── analyze-memory.js                # Script análisis memoria
└── results/
    ├── 2025-11-26/                      # Resultados por fecha
    │   ├── lighthouse-reports/
    │   ├── k6-results/
    │   ├── memory-profiles/
    │   └── summary-report.md
    └── baseline/                        # Línea base de referencia
```

---

## 🚀 Plan de Ejecución

### Semana 1: Configuración y Pruebas Básicas
- [ ] Instalar todas las herramientas necesarias
- [ ] Configurar scripts de automatización
- [ ] Establecer línea base (baseline) de rendimiento
- [ ] Ejecutar Lighthouse en todas las páginas principales

### Semana 2: Pruebas de Módulos Individuales
- [ ] Probar rendimiento módulo por módulo
- [ ] Documentar resultados en MODULE_TESTING_BREAKDOWN.md
- [ ] Identificar módulos con problemas críticos

### Semana 3: Pruebas de Carga y WebSocket
- [ ] Ejecutar pruebas de carga con K6/JMeter
- [ ] Probar WebSocket con Artillery
- [ ] Documentar capacidad máxima del sistema

### Semana 4: Análisis y Reportes
- [ ] Consolidar todos los resultados
- [ ] Generar reporte ejecutivo
- [ ] Crear lista priorizada de optimizaciones
- [ ] Presentar hallazgos al equipo

---

## 📝 Notas Importantes

### Consideraciones Especiales del Proyecto

1. **Sistema de Monitoreo en Tiempo Real**
   - WebSocket es crítico para el módulo de Monitoring
   - Debe soportar múltiples conexiones simultáneas
   - Latencia debe ser mínima (< 100ms)

2. **Visualizaciones Intensivas**
   - Recharts para gráficos de rendimiento
   - Leaflet para mapas en tiempo real
   - Pueden consumir muchos recursos del navegador

3. **Manejo de Estado**
   - Context API de React (ThemeContext, PermissionsContext)
   - Posibles re-renders innecesarios

4. **Comunicación con APIs**
   - Múltiples servicios (21 archivos en src/services/)
   - Axios para peticiones HTTP
   - Algunos endpoints pueden ser lentos

5. **Autenticación y Tokens**
   - useAuth hook para manejo de sesión
   - Tokens almacenados en localStorage
   - Validación constante de permisos

### Riesgos Identificados

1. **Memory Leaks:** WebSocket y listeners de eventos sin limpiar
2. **Re-renders excesivos:** Context API usado ampliamente
3. **Carga de datos grandes:** Tablas con muchos registros
4. **Mapas y gráficos:** Rendering pesado en módulo de monitoring
5. **Bundle size:** Muchas dependencias (Recharts, Leaflet, etc.)

---

## 🔗 Referencias

- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [K6 Documentation](https://k6.io/docs/)
- [Artillery Documentation](https://www.artillery.io/docs)
- [Web Performance Best Practices](https://web.dev/performance/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)

---

**Última actualización:** Noviembre 26, 2025
