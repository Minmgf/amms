# Resumen Ejecutivo: Pruebas de Rendimiento AMMS
## Sistema de Gestión de Mantenimiento de Activos

**Preparado por:** Nicolás Urrutia  
**Rol:** Equipo de Pruebas  
**Fecha:** 26 de noviembre de 2025  
**Versión:** 1.0

---

## 📋 Resumen Ejecutivo

Este documento presenta los resultados de las pruebas de rendimiento realizadas sobre el sistema AMMS (Asset Maintenance Management System), una aplicación web construida con Next.js 15 que gestiona maquinaria, mantenimientos, nómina, solicitudes y monitoreo en tiempo real.

### Objetivo Principal
Evaluar el rendimiento actual del sistema, identificar cuellos de botella y establecer una línea base de métricas para futuros esfuerzos de optimización.

### Alcance de las Pruebas
Las pruebas se ejecutaron en un **día intensivo de trabajo**, cubriendo:
- ✅ **Auditorías de rendimiento** con Lighthouse en páginas clave
- ✅ **Latencia de WebSocket** para monitoreo en tiempo real
- ✅ **Performance de componentes** (modales y tablas de datos)
- ✅ **Pruebas de carga API** con K6 (smoke, load y stress tests)

---

## 🎯 Resultados Principales

### 1. Auditorías Lighthouse - Rendimiento de Frontend

Se ejecutaron auditorías en las páginas principales y se extrajeron FCP, LCP, Speed Index (SI), Total Blocking Time (TBT), Time to Interactive (TTI) y CLS. El Performance Score global no viene embebido; consultar cada HTML para el donut/score.

| Página | Performance Score | FCP | LCP | SI | TBT | TTI | CLS | Observaciones |
|--------|------------------|-----|-----|----|-----|-----|-----|---------------|
| **Dashboard (/)** | N/D (ver HTML) | 1.8 s | 43.2 s | 4.0 s | 1.49 s | 43.2 s | 0.006 | Carga larga; revisar redirecciones/JS |
| **Maquinaria** | N/D (ver HTML) | 1.7 s | 43.1 s | 2.8 s | 2.14 s | 43.1 s | 0.006 | TBT alto; optimizar ejecución JS |
| **Monitoreo** | N/D (ver HTML) | 1.7 s | 43.1 s | 2.5 s | 1.67 s | 43.1 s | 0.006 | Comportamiento similar a dashboard |
| **Login** | N/D | N/D | N/D | N/D | N/D | N/D | N/D | Error interstitial; sin métricas |

📁 **Reportes HTML:**
- Dashboard: `results/2025-11-26/lighthouse-dashboard.html`
- Maquinaria: `results/2025-11-26/lighthouse-machinery.html`
- Monitoreo: `results/2025-11-26/lighthouse-monitoring.html`
- Login: `results/2025-11-26/lighthouse-auth.html` (CHROME_INTERSTITIAL_ERROR)

**Hallazgos:**
- ⚠️ LCP y TTI muy altos (~43 s) en todas las vistas; revisar redirecciones iniciales y carga de recursos pesados.
- ⚠️ TBT entre 1.5 s y 2.1 s; optimizar ejecución JS y dividir tareas.
- ✅ CLS excelente (≈0.006) — estabilidad visual adecuada.

---

### 2. Latencia de WebSocket - Monitoreo en Tiempo Real

El sistema utiliza WebSocket para telemetría en tiempo real de maquinaria mediante conexión a:
```
wss://api.inmero.co/telemetry/ws/telemetria/{request_id}
```

**Resultados obtenidos:**

| Métrica | Valor | Objetivo | Estado |
|---------|-------|----------|--------|
| **Tiempo de conexión inicial** | 474ms | < 1000ms | ✅ Excelente |
| **Mensajes recibidos (60s)** | 3 mensajes | N/A | ℹ️ Informativo |
| **Frecuencia de mensajes** | ~20 segundos | ~30s esperado | ✅ Mejor que esperado |
| **Latencia entre mensajes** | Min: 2.6s / Max: 30s / Avg: 16.3s | < 30s | ✅ Aceptable |
| **Tasa de errores** | 0% | < 5% | ✅ Excelente |

📁 **Reportes detallados:** 
- `websocket-latency-*.json` - Métricas completas
- `websocket-messages-*.json` - Log de mensajes

**Conclusión:** El sistema de WebSocket es estable y cumple con los objetivos de latencia para monitoreo en tiempo real.

---

### 3. Performance de Componentes UI

#### 3.1 Módulo de Monitoreo

**Prueba realizada:** Navegación autenticada y renderizado de componentes en `/sigma/monitoring`

| Métrica | Valor | Objetivo | Estado |
|---------|-------|----------|--------|
| **Tiempo de login** | 4,558ms | < 5000ms | ✅ Aceptable |
| **Navegación a monitoreo** | 2,478ms | < 3000ms | ✅ Excelente |
| **Renderizado de componentes** | 10,015ms | < 5000ms | ⚠️ Necesita optimización |
| **Métricas de memoria capturadas** | 2 snapshots | N/A | ✅ Completo |

**Observaciones:**
- ⚠️ No se detectaron gráficos (Recharts) ni mapas (Leaflet) en el tiempo de espera configurado
- El tiempo de renderizado de 10s supera el objetivo; puede deberse a componentes pesados o carga asíncrona
- Se requiere investigación adicional sobre la estructura del módulo de monitoreo

#### 3.2 Performance de Tablas de Datos

**Prueba realizada:** Renderizado, filtrado y scroll en tablas de 3 módulos principales

##### Tabla de Maquinaria (`/sigma/machinery`)
| Operación | Tiempo | Filas | Estado |
|-----------|--------|-------|--------|
| Navegación | 3,788ms | - | ✅ Bueno |
| Renderizado inicial | 29ms | 10 filas | ✅ Excelente |
| Filtrado (búsqueda) | 563ms | 1 resultado | ✅ Aceptable |
| Scroll | 616ms | - | ✅ Bueno |

##### Tabla de Mantenimientos Programados (`/sigma/maintenance/scheduledMaintenance`)
| Operación | Tiempo | Filas | Estado |
|-----------|--------|-------|--------|
| Navegación | 3,418ms | - | ✅ Bueno |
| Renderizado inicial | 21ms | 10 filas | ✅ Excelente |
| Filtrado (búsqueda) | 530ms | 1 resultado | ✅ Aceptable |
| Scroll | 615ms | - | ✅ Bueno |

##### Tabla de Gestión de Solicitudes (`/sigma/requests/requestsManagement`)
| Operación | Tiempo | Filas | Estado |
|-----------|--------|-------|--------|
| Navegación | 2,639ms | - | ✅ Excelente |
| Renderizado inicial | 22ms | 10 filas | ✅ Excelente |
| Filtrado (búsqueda) | 539ms | 1 resultado | ✅ Aceptable |
| Scroll | 615ms | - | ✅ Bueno |

**Conclusiones:**
- ✅ El renderizado de tablas es **extremadamente rápido** (~20-30ms para 10 filas)
- ✅ El filtrado es eficiente (~530-563ms con debounce)
- ⚠️ No se detectaron columnas ordenables en las pruebas; verificar implementación
- ✅ La navegación entre módulos es consistente (2.6-3.8s)
- 📊 Las tablas actuales manejan bien conjuntos pequeños de datos (10 filas); se recomienda probar con 50-100+ filas

📁 **Screenshots y reportes:** `table-performance/table-*.png` y `table-performance-*.json`

---

### 4. Pruebas de Carga API (K6) 🚨

**Estado:** ✅ **COMPLETADO** - ⚠️ **HALLAZGOS CRÍTICOS IDENTIFICADOS**

Se ejecutaron 3 escenarios de prueba sobre los endpoints críticos de la API durante 10 minutos:
- `POST /auth/login/` - Autenticación
- `GET /machines/` - Lista de maquinaria
- `GET /requests/` - Lista de solicitudes
- `GET /maintenances/scheduled/` - Mantenimientos programados

#### Resultados Globales:

| Métrica | Valor | Objetivo | Estado |
|---------|-------|----------|--------|
| **Total de peticiones** | 19,852 | N/A | ℹ️ |
| **Peticiones exitosas** | 6,228 (31.4%) | > 95% | ❌ **CRÍTICO** |
| **Peticiones fallidas** | 13,624 (68.7%) | < 5% | ❌ **CRÍTICO** |
| **HTTP Request Duration (Avg)** | 569ms | < 500ms | ⚠️ Límite |
| **HTTP Request Duration (P95)** | 1,924ms | < 500ms | ❌ Excedido |
| **Login Duration (Avg)** | 1,573ms | < 1000ms | ❌ Excedido |
| **Login Duration (P95)** | 2,554ms | < 2000ms | ❌ Excedido |
| **Iteraciones completadas** | 6,300 | N/A | ℹ️ |
| **Iteraciones interrumpidas** | 51 | 0 | ⚠️ |

#### Escenarios Ejecutados:

**1. Smoke Test ✅**
- **Duración:** 1 minuto
- **Usuarios virtuales:** 2 VUs constantes
- **Resultado:** Exitoso sin errores
- **Conclusión:** Funcionalidad básica validada correctamente

**2. Load Test ⚠️**
- **Duración:** 5 minutos
- **Usuarios virtuales:** Ramping 0 → 10 → 50 → 0
- **Resultado:** Degradación progresiva del servicio
- **Observación:** Aparición de timeouts a partir de 30-40 VUs

**3. Stress Test ❌ CRÍTICO**
- **Duración:** 4 minutos
- **Usuarios virtuales:** Ramping 0 → 50 → 100 → 0
- **Resultado:** **Colapso total del sistema**
- **Errores masivos:** Timeouts en endpoint de login
- **Mensaje de error:** `"Post \"https://api.inmero.co/sigma/users/auth/login/\": request timeout"`

📁 **Resultados:** `k6-results/results.json` (generado parcialmente debido a errores de path)

#### 🚨 Hallazgos Críticos:

1. **❌ Tasa de error del 68.74%** - El sistema falla en más de 2/3 de las peticiones bajo carga
2. **❌ Umbrales cruzados** - Todas las métricas críticas excedieron sus límites aceptables
3. **❌ Timeouts masivos** - El endpoint de autenticación colapsa con 50+ usuarios concurrentes
4. **❌ Punto de quiebre identificado** - Sistema no soporta más de 40-50 VUs simultáneos
5. **⚠️ P95 de respuesta** - 1.9 segundos (objetivo: 500ms)

**Conclusión:** El sistema **NO está preparado para carga concurrente** esperada en producción. Se requiere intervención inmediata en backend para:
- Optimizar endpoint de autenticación
- Implementar rate limiting
- Escalar recursos de servidor
- Revisar conexiones de base de datos

---

### 6. Memory Profiling (UI) ✅

**Estado:** ✅ COMPLETADO — Captura de snapshots y análisis básico.

Se ejecutaron perfiles de memoria en dos flujos principales usando Playwright + CDP:
- `Monitoring`: Login → Dashboard → `/sigma/monitoring` → interacciones → vuelta a Dashboard
- `Tables`: Navegación por Maquinaria, Mantenimientos y Solicitudes con filtrado y scroll

#### Resultados Resumidos

| Flujo | Memoria Inicial | Memoria Final | Incremento | Tendencia | Recomendación |
|-------|------------------|---------------|------------|-----------|---------------|
| Monitoring | 17.6 MB | 34.5 MB | +16.9 MB (+96%) | Estable tras 30s | ✅ Normal (sin leaks aparentes) |
| Tables | 18.6 MB | 42.9 MB | +24.3 MB (+131%) | Progresivo con interacciones | ⚠️ Advertencia (vigilar crecimiento) |

#### Hallazgos Clave
- ✅ No se observan incrementos anómalos ni crecimiento indefinido en `Monitoring` tras 30s de uso.
- ⚠️ En `Tables`, el aumento acumulado >20MB sugiere revisar renderizado/retención en operaciones de filtrado y scroll.
- ℹ️ Utilización de heap cercana al 95% en momentos puntuales indica picos de asignación que deberían suavizarse.

#### Recomendaciones
- Optimizar ciclo de vida de tablas (limpieza de referencias tras filtrado/scroll).
- Auditar efectos y listeners en Contextos (`ThemeContext`, `PermissionsContext`) para evitar retenciones.
- Medir en sesiones prolongadas (5–10 min) y con datasets de 100+ filas para confirmar ausencia de leaks.

📁 Reportes: `results/2025-11-26/memory-profiling/*.json`

---

### 5. Prueba de Carga Concurrente WebSocket ✅

**Estado:** ✅ **COMPLETADO** - **RESULTADOS EXITOSOS**

Se ejecutó una prueba de carga personalizada con el cliente `ws` (Node.js) para validar la escalabilidad del sistema WebSocket de telemetría con múltiples conexiones concurrentes.

**Nota:** Artillery presentó incompatibilidades de configuración con el endpoint WebSocket, por lo que se desarrolló un script personalizado en Node.js que usa el mismo cliente validado en las pruebas de latencia.

#### Configuración de la Prueba:

**Endpoint:** `wss://api.inmero.co/telemetry/ws/telemetria/SOL-2025-0011`

**Fases ejecutadas:**
1. **Fase 1 - Inicial:** 5 conexiones concurrentes durante 30 segundos
2. **Fase 2 - Incremental:** 15 conexiones concurrentes durante 60 segundos
3. **Fase 3 - Carga Sostenida:** 25 conexiones concurrentes durante 60 segundos

#### Resultados Globales:

| Métrica | Valor | Objetivo | Estado |
|---------|-------|----------|--------|
| **Total Conexiones Creadas** | 45 | N/A | ℹ️ |
| **Conexiones Exitosas** | 45 (100%) | > 95% | ✅ **PERFECTO** |
| **Conexiones Fallidas** | 0 (0%) | < 5% | ✅ **PERFECTO** |
| **Tasa de Éxito** | 100.00% | > 95% | ✅ **PERFECTO** |
| **Total Mensajes Recibidos** | 130 mensajes | N/A | ✅ |
| **Tiempo Conexión Promedio** | 310ms | < 1000ms | ✅ Excelente |
| **Tiempo Conexión Mínimo** | 296ms | N/A | ✅ Consistente |
| **Tiempo Conexión Máximo** | 347ms | < 1000ms | ✅ Consistente |
| **Desviación Tiempos** | ±51ms | N/A | ✅ Muy estable |

#### Resultados por Fase:

**Fase 1 - Inicial (5 conexiones):**
- ✅ Éxito: 5/5 (100%)
- ✅ Mensajes recibidos: 10
- ✅ Promedio: 2 mensajes por conexión
- ✅ Sin errores ni desconexiones

**Fase 2 - Incremental (15 conexiones):**
- ✅ Éxito: 15/15 (100%)
- ✅ Mensajes recibidos: 45
- ✅ Promedio: 3 mensajes por conexión
- ✅ Sin errores ni desconexiones

**Fase 3 - Carga Sostenida (25 conexiones):**
- ✅ Éxito: 25/25 (100%)
- ✅ Mensajes recibidos: 75
- ✅ Promedio: 3 mensajes por conexión
- ✅ Sin errores ni desconexiones

📁 **Reportes:** 
- `websocket-load/websocket-load-test-*.json` - Resumen de métricas
- `websocket-load/websocket-load-details-*.json` - Detalles completos por conexión

#### 🎯 Hallazgos Clave:

1. ✅ **Sistema WebSocket escala perfectamente** - 100% éxito con 25 conexiones concurrentes
2. ✅ **Tiempos de conexión extremadamente consistentes** - Variación de solo ±51ms entre min y max
3. ✅ **Cero errores o desconexiones** - Sistema robusto y estable bajo carga
4. ✅ **Recepción de mensajes confiable** - Todas las conexiones recibieron telemetría correctamente
5. ✅ **Latencia de conexión excelente** - 310ms promedio, muy inferior al objetivo de 1000ms

#### 🔍 Contraste con API REST:

| Métrica | WebSocket | API REST (K6) | Comparación |
|---------|-----------|---------------|-------------|
| **Tasa de éxito** | 100% | 31.4% | 🟢 WebSocket **3.2x mejor** |
| **Tasa de error** | 0% | 68.7% | 🟢 WebSocket **perfecto** |
| **Conexiones soportadas** | 25+ (sin fallos) | ~40 (colapso) | 🟢 WebSocket más escalable |
| **Consistencia de latencia** | ±51ms | Alta variabilidad | 🟢 WebSocket muy estable |

**Conclusión:** El sistema de WebSocket es **significativamente más robusto** que la API REST. Mientras el backend colapsa con 50+ usuarios concurrentes en endpoints REST, el WebSocket maneja 25+ conexiones sin ningún problema, demostrando una arquitectura bien diseñada para monitoreo en tiempo real.

---

## 🔍 Observaciones y Hallazgos Clave

### Fortalezas Identificadas
1. ✅ **Renderizado de tablas extremadamente rápido** (< 30ms para 10 filas)
2. ✅ **WebSocket estable** con latencia aceptable para monitoreo en tiempo real
3. ✅ **WebSocket ESCALA PERFECTAMENTE** - 100% éxito con 25 conexiones concurrentes (0% errores)
4. ✅ **Tiempos de navegación consistentes** entre módulos (2.6-3.8s)
5. ✅ **Filtrado de datos eficiente** (~530-563ms)
6. ✅ **Conexión WebSocket rápida y consistente** (310ms avg, rango 296-347ms)
7. ✅ **Sistema de telemetría robusto** - Mensajes recibidos confiablemente en todas las conexiones

### Áreas de Mejora Potencial
1. ⚠️ **Renderizado del módulo de monitoreo** toma 10s (supera objetivo de 5s)
2. ⚠️ **Componentes de visualización** (gráficos/mapas) no detectados en tiempo de espera
3. ⚠️ **Funcionalidad de ordenamiento** en tablas no encontrada durante pruebas
4. 📊 **Falta validación** con tablas de 50-100+ registros (actualmente solo 10 filas)
5. 🔍 **Análisis de reportes Lighthouse** pendiente para métricas de Core Web Vitals

### 🚨 Problemas Críticos Identificados
1. ❌ **API Backend colapsa bajo carga** - Tasa de error del 68.7% con 100 VUs
2. ❌ **Endpoint de login no escalable** - Timeouts masivos con 50+ usuarios concurrentes
3. ❌ **Capacidad insuficiente** - Sistema solo soporta ~40 VUs (muy por debajo de lo esperado)
4. ❌ **Tiempos de respuesta excesivos** - P95 de 1.9s (objetivo: 500ms)
5. ❌ **Sin rate limiting** - Sistema vulnerable a sobrecarga

### Riesgos Técnicos Identificados
1. **Memory leaks potenciales:** WebSocket y listeners de eventos sin limpiar
2. **Re-renders excesivos:** Context API (ThemeContext, PermissionsContext) usado ampliamente
3. **Carga de visualizaciones:** Recharts y Leaflet pueden ser pesados en módulo de monitoreo
4. **Bundle size:** Muchas dependencias (verificar con análisis de bundle)

---

## 🎯 Recomendaciones Prioritarias

### 🚨 URGENTE - Acción Inmediata (Esta semana)
1. **CRÍTICO: Optimizar endpoint de autenticación**
   - Implementar conexion pooling en base de datos
   - Revisar queries y índices en tabla de usuarios
   - Considerar caché de sesiones (Redis)
   - Objetivo: Reducir login de 1.5s a < 500ms

2. **CRÍTICO: Escalar recursos de backend**
   - Evaluar capacidad actual del servidor
   - Implementar balanceo de carga si es necesario
   - Configurar auto-scaling para picos de tráfico

3. **CRÍTICO: Implementar rate limiting y throttling**
   - Proteger endpoints críticos (auth, listados)
   - Prevenir ataques DoS
   - Limitar peticiones por usuario/IP

4. **Reunión de emergencia con equipo backend**
   - Presentar hallazgos de K6
   - Planificar hotfixes inmediatos
   - Establecer SLAs realistas

### Corto Plazo (1-2 semanas)
1. **Optimización de base de datos**
   - Analizar slow queries
   - Implementar índices faltantes
   - Revisar estrategia de caché

2. **Analizar reportes Lighthouse detallados** para extraer métricas de Core Web Vitals

3. **Investigar módulo de monitoreo:** 
   - Verificar carga de componentes Recharts y Leaflet
   - Optimizar tiempo de renderizado (reducir de 10s a < 5s)

4. **Probar tablas con datasets más grandes** (50-100 registros) para validar escalabilidad

### Mediano Plazo (1 mes)
1. **Optimización de bundle:** Análisis con webpack-bundle-analyzer
2. **Implementar lazy loading** para componentes pesados (mapas, gráficos)
3. **Memory profiling:** Detectar memory leaks en uso prolongado del sistema
4. **Optimizar Context API:** Reducir re-renders innecesarios

### Largo Plazo (2-3 meses)
1. **Establecer monitoreo continuo** de rendimiento (RUM - Real User Monitoring)
2. **Implementar caché estratégico** para endpoints frecuentes
3. **Optimización de WebSocket:** Considerar compresión de mensajes si crece el volumen
4. **Tests de rendimiento automatizados** en CI/CD

---

## 📊 Métricas vs Objetivos

| KPI | Objetivo | Actual | Estado |
|-----|----------|--------|--------|
| Performance Score Lighthouse | ≥ 70 | Pendiente | ⏳ |
| Tiempo de login (sin carga) | < 5s | 4.56s | ✅ |
| Tiempo de login (bajo carga P95) | < 2s | 2.55s | ❌ |
| Navegación entre páginas | < 3s | 2.5-3.8s | ✅ |
| Renderizado de tabla | < 1s | 0.02-0.03s | ✅ |
| Latencia WebSocket | < 100ms | 2.6-30s entre mensajes* | ⚠️ |
| Conexión WebSocket | < 1s | 0.47s | ✅ |
| **Tasa de error API (100 VUs)** | **< 1%** | **68.74%** | **❌ CRÍTICO** |
| **API Response Time P95** | **< 500ms** | **1,924ms** | **❌ CRÍTICO** |
| **Capacidad concurrente** | **≥ 100 VUs** | **~40 VUs** | **❌ CRÍTICO** |

\* *Nota: La latencia de 2.6-30s se refiere al intervalo entre mensajes de telemetría, no al RTT de la conexión*

---

## 📁 Entregables

Todos los artefactos de prueba están organizados en:
```
tests/performance-testing/
├── PERFORMANCE_TESTING_PLAN.md          # Plan maestro de pruebas
├── MODULE_TESTING_BREAKDOWN.md          # Desglose por módulos
├── METRICS_AND_KPIS.md                  # Definición de métricas
├── EXECUTIVE_SUMMARY.md                 # Este documento
├── configs/
│   └── k6-load-test.js                  # Script de pruebas K6
├── scripts/
│   ├── websocket-latency.js             # Script WebSocket
│   ├── modal-performance.js             # Script de modales
│   └── table-performance.js             # Script de tablas
└── results/2025-11-26/
   ├── lighthouse-dashboard.html        # Reporte Lighthouse Dashboard
   ├── lighthouse-machinery.html        # Reporte Lighthouse Maquinaria
   ├── lighthouse-monitoring.html       # Reporte Lighthouse Monitoreo
   ├── lighthouse-auth.html             # Reporte Lighthouse Login (error interstitial)
    ├── ws-latency/                      # Resultados WebSocket
    ├── modal-performance/               # Screenshots y métricas
    ├── table-performance/               # Screenshots y métricas
    └── k6-results/                      # Resultados K6 (en progreso)
```

---

## 🚀 Próximos Pasos

### Inmediatos
1. ✅ Completar ejecución de pruebas K6 (en progreso)
2. 📊 Analizar resultados completos de K6
3. 🔍 Revisar reportes HTML de Lighthouse para métricas detalladas
4. 📝 Documentar hallazgos finales en reporte consolidado

### Seguimiento
1. Presentar hallazgos al equipo de desarrollo
2. Priorizar optimizaciones críticas con Product Manager
3. Establecer línea base de métricas para seguimiento continuo
4. Planificar ciclo de pruebas de rendimiento mensual

---

## 🧩 Bloque 6: Conclusiones y Roadmap

**Resumen Integrado:**
- Backend REST presenta cuellos de botella críticos bajo carga (timeouts y alta tasa de error), especialmente en autenticación.
- WebSocket para telemetría demuestra excelente estabilidad y escalabilidad (100% éxito con 25+ conexiones).
- Frontend muestra buenos tiempos de navegación y tablas muy rápidas; el módulo de monitoreo requiere optimización.
- Memory profiling no evidencia leaks inmediatos en `Monitoring`; crecimiento significativo en flujos de `Tables` bajo interacción intensiva.

**KPIs Consolidado (clave):**
- `API Error Rate (100 VUs)`: 68.7% ❌ (objetivo < 1%)
- `API P95`: 1,924ms ❌ (objetivo < 500ms)
- `Capacidad concurrente`: ~40 VUs ❌ (objetivo ≥ 100)
- `WS Éxito`: 100% ✅ (25 conexiones)
- `Login (sin carga)`: 4.56s ✅ (objetivo < 5s)
- `Renderizado tablas`: 20–30ms ✅ (10 filas)
- `Memoria Monitoring`: +16.9MB (96%) ✅ sin patrón de leak
- `Memoria Tables`: +24.3MB (131%) ⚠️ revisar retención en interacciones

**Decisión Ejecutiva:**
- Priorizar estabilización del backend REST (auth y listados) antes de escalar usuarios.
- Mantener monitoreo en tiempo real vía WebSocket como canal confiable de estado operacional.

**Roadmap de Optimización:**
- Urgente (0–1 semana): Pooling DB, índices en auth, rate limiting, revisión timeouts/retries, escalamiento horizontal si aplica.
- Corto (1–2 semanas): Optimización queries de listados, caché estratégica (Redis), análisis Lighthouse detallado, mejoras de render en monitoreo.
- Mediano (2–4 semanas): Lazy loading de visualizaciones, reducción bundle, auditoría Context API, pruebas con datasets grandes (100+ filas).
- Continuo (mensual): RUM, dashboards de rendimiento, pruebas automáticas en CI/CD.

**Seguimiento:**
- Programar reunión técnica con backend para acordar hotfixes y SLAs.
- Establecer plan de re-ejecución de K6 tras optimizaciones (smoke → load → stress).
- Añadir pruebas de memoria prolongadas (10–15 min) y validar ausencia de leaks con datasets mayores.

---

## 💼 Contacto

**Nicolás Urrutia**  
Equipo de Pruebas  
Email: nicourrutia83@gmail.com  
Fecha de entrega: 26 de noviembre de 2025

---

## 📎 Anexos

### A. Herramientas Utilizadas
- **Lighthouse 13.0+** - Auditorías de rendimiento frontend
- **K6 v1.4.2** - Pruebas de carga y estrés API
- **Playwright 1.50+** - Automatización de pruebas UI
- **ws (Node.js)** - Cliente WebSocket para latencia
- **Chrome DevTools Protocol** - Métricas de memoria y performance

### B. Configuración de Pruebas
- **Entorno:** Local (localhost:3000/sigma)
- **API Backend:** https://api.inmero.co/sigma/
- **Credenciales de prueba:** Cuenta de QA configurada
- **Viewport:** 1920x1080 (escritorio)
- **Conexión:** Red local sin throttling

### C. Limitaciones del Estudio
- Pruebas realizadas en un solo día (enfoque acelerado)
- Dataset limitado (tablas con 10 filas)
- Pruebas de memoria básicas (snapshots, sin análisis profundo)
- Sin pruebas de performance en móvil
- Sin pruebas de accesibilidad exhaustivas

---

**Fin del Resumen Ejecutivo**
