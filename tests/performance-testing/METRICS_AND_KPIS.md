# Métricas y KPIs - Pruebas de Rendimiento AMMS

## 📊 Categorías de Métricas

### 1. Métricas de Rendimiento del Frontend
### 2. Métricas de Red y API
### 3. Métricas de WebSocket (Tiempo Real)
### 4. Métricas de Recursos del Navegador
### 5. Métricas de Experiencia del Usuario
### 6. Métricas de Carga y Estrés

---

## 1. Métricas de Rendimiento del Frontend

### Core Web Vitals (Google)

#### First Contentful Paint (FCP)
**Definición:** Tiempo hasta que se renderiza el primer elemento de contenido  
**Objetivo:**
- ✅ Excelente: < 1.0s
- ⚠️ Aceptable: 1.0s - 1.8s
- ❌ Necesita mejora: > 1.8s

**Cómo medirlo:**
- Lighthouse
- Chrome DevTools Performance
- Web PageTest

**Páginas críticas a medir:**
- Login
- Dashboard principal
- Listado de maquinaria
- Dashboard de monitoreo

---

#### Largest Contentful Paint (LCP)
**Definición:** Tiempo hasta que se renderiza el elemento de contenido más grande  
**Objetivo:**
- ✅ Excelente: < 2.5s
- ⚠️ Aceptable: 2.5s - 4.0s
- ❌ Necesita mejora: > 4.0s

**Impacto:** Percepción de velocidad de carga

**Elementos a monitorear:**
- Imágenes de hero sections
- Tablas grandes
- Gráficos de Recharts
- Mapas de Leaflet

---

#### Time to Interactive (TTI)
**Definición:** Tiempo hasta que la página es completamente interactiva  
**Objetivo:**
- ✅ Excelente: < 3.8s
- ⚠️ Aceptable: 3.8s - 7.3s
- ❌ Necesita mejora: > 7.3s

**Factores que afectan TTI:**
- JavaScript bundle size
- Long tasks (> 50ms)
- Hydration de React

---

#### Total Blocking Time (TBT)
**Definición:** Suma de tiempo de todas las tareas largas entre FCP y TTI  
**Objetivo:**
- ✅ Excelente: < 200ms
- ⚠️ Aceptable: 200ms - 600ms
- ❌ Necesita mejora: > 600ms

**Causas comunes de TBT alto:**
- JavaScript pesado
- Operaciones síncronas costosas
- Re-renders excesivos

---

#### Cumulative Layout Shift (CLS)
**Definición:** Medida de estabilidad visual (cambios inesperados de layout)  
**Objetivo:**
- ✅ Excelente: < 0.1
- ⚠️ Aceptable: 0.1 - 0.25
- ❌ Necesita mejora: > 0.25

**Elementos a vigilar:**
- Imágenes sin dimensiones definidas
- Ads o contenido dinámico
- Fuentes web sin fallback

---

### Lighthouse Performance Score

**Composición del Score:**
- FCP: 10%
- LCP: 25%
- TBT: 30%
- CLS: 25%
- Speed Index: 10%

**Objetivo por página:**
- ✅ Excelente: >= 90
- ⚠️ Bueno: 70-89
- ⚡ Necesita optimización: 50-69
- ❌ Crítico: < 50

---

### Speed Index
**Definición:** Qué tan rápido se muestra visualmente el contenido  
**Objetivo:**
- ✅ Excelente: < 3.4s
- ⚠️ Aceptable: 3.4s - 5.8s
- ❌ Necesita mejora: > 5.8s

---

### Bundle Size y JavaScript

#### JavaScript Bundle Size
**Objetivo:**
- Main bundle: < 200 KB (gzipped)
- Total JS: < 500 KB (gzipped)

**Herramientas:**
- Next.js Bundle Analyzer
- webpack-bundle-analyzer

**Comandos:**
```bash
npm run build
# Analizar bundle size
```

#### Tiempo de Ejecución de JavaScript
**Objetivo:**
- < 2s en dispositivos móviles
- < 1s en desktop

---

## 2. Métricas de Red y API

### Tiempo de Respuesta de API

#### Percentiles
| Percentil | Objetivo | Aceptable | Inaceptable |
|-----------|----------|-----------|-------------|
| p50 (mediana) | < 200ms | < 300ms | >= 500ms |
| p75 | < 300ms | < 400ms | >= 600ms |
| p90 | < 400ms | < 500ms | >= 800ms |
| p95 | < 500ms | < 700ms | >= 1000ms |
| p99 | < 800ms | < 1000ms | >= 1500ms |

#### Endpoints Críticos a Monitorear

**Autenticación:**
- `POST /auth/login` - Objetivo: < 500ms
- `POST /auth/refresh` - Objetivo: < 300ms

**Maquinaria:**
- `GET /machinery/list/` - Objetivo: < 400ms
- `POST /machinery/create-general-sheet/` - Objetivo: < 1s
- `GET /machinery/{id}/` - Objetivo: < 300ms

**Monitoreo:**
- `GET /request-monitoring/list/` - Objetivo: < 500ms
- `GET /request/{id}/details/` - Objetivo: < 400ms

**Mantenimiento:**
- `GET /maintenance_request/list/` - Objetivo: < 500ms
- `GET /maintenance_scheduling/list/` - Objetivo: < 500ms

---

### Throughput (Rendimiento)
**Definición:** Número de peticiones procesadas por segundo  
**Objetivo:**
- >= 100 requests/second bajo carga normal
- >= 50 requests/second bajo carga pico

---

### Tasa de Error
**Definición:** Porcentaje de peticiones que fallan  
**Objetivo:**
- ✅ Normal: < 1%
- ⚠️ Aceptable bajo estrés: < 5%
- ❌ Inaceptable: >= 5%

**Tipos de errores:**
- 4xx (Client errors): Idealmente 0%
- 5xx (Server errors): < 1%
- Timeouts: < 1%

---

### Tiempo de First Byte (TTFB)
**Definición:** Tiempo hasta recibir el primer byte de respuesta del servidor  
**Objetivo:**
- ✅ Excelente: < 200ms
- ⚠️ Aceptable: 200ms - 500ms
- ❌ Necesita mejora: > 500ms

---

## 3. Métricas de WebSocket (Tiempo Real)

### 🔴 Crítico para Módulo de Monitoreo

#### Latencia de Conexión
**Definición:** Tiempo para establecer conexión WebSocket  
**Objetivo:**
- Handshake: < 200ms
- Primer mensaje: < 500ms

**Cómo medirlo:**
```javascript
const start = Date.now();
const ws = new WebSocket(url);
ws.onopen = () => {
  console.log('Latency:', Date.now() - start, 'ms');
};
```

---

#### Latencia de Mensajes
**Definición:** Tiempo entre envío del servidor y recepción en cliente  
**Objetivo:**
- ✅ Excelente: < 50ms
- ⚠️ Aceptable: 50ms - 100ms
- ❌ Necesita mejora: > 100ms

**Métricas a medir:**
- Latencia promedio
- Latencia p95
- Latencia p99
- Jitter (variabilidad de latencia)

---

#### Tasa de Mensajes por Segundo
**Objetivo:**
- Soportar >= 10 mensajes/segundo por conexión
- Soportar >= 100 conexiones simultáneas

---

#### Tasa de Pérdida de Mensajes
**Definición:** Porcentaje de mensajes no recibidos  
**Objetivo:**
- ✅ Ideal: 0%
- ⚠️ Aceptable: < 0.1%
- ❌ Inaceptable: >= 1%

---

#### Tasa de Desconexión
**Definición:** Porcentaje de conexiones que se cierran inesperadamente  
**Objetivo:**
- < 1% de desconexiones no planificadas
- Reconexión automática: < 5s

---

#### Tiempo de Reconexión
**Objetivo:** < 5 segundos después de desconexión

---

## 4. Métricas de Recursos del Navegador

### Uso de Memoria (Heap Size)

#### Memoria Inicial
**Objetivo:** < 50 MB al cargar la aplicación

#### Memoria Después de 10 Minutos de Uso
**Objetivo:** < 150 MB

#### Memoria Después de 30 Minutos de Uso
**Objetivo:** < 200 MB

#### Memory Leaks
**Definición:** Crecimiento continuo de memoria sin límite  
**Objetivo:** Crecimiento < 10 MB por hora

**Cómo detectarlo:**
1. Tomar snapshot inicial de memoria
2. Realizar acciones repetitivas (abrir/cerrar modales, navegar)
3. Forzar garbage collection
4. Tomar snapshot final
5. Comparar: delta debe ser mínimo

**Herramienta:** Chrome Memory Profiler

---

### Uso de CPU

#### Idle (Sin Actividad)
**Objetivo:** < 5% de uso de CPU

#### Durante Navegación Normal
**Objetivo:** < 30% de uso de CPU

#### Durante Operaciones Pesadas (Gráficos, Mapas)
**Objetivo:** < 60% de uso de CPU

**Picos aceptables:** < 1 segundo de duración

---

### Frame Rate (FPS)

**Objetivo General:** >= 30 FPS (idealmente 60 FPS)

**Escenarios críticos:**
- Scroll de tablas largas: >= 30 FPS
- Animaciones de modales: >= 60 FPS
- Interacción con mapas Leaflet: >= 30 FPS
- Actualización de gráficos Recharts: >= 30 FPS
- Recepción de datos WebSocket en tiempo real: >= 30 FPS

**Cómo medirlo:** Chrome Performance Profiler durante grabación

---

### DOM Size

#### Número de Nodos DOM
**Objetivo:**
- ✅ Óptimo: < 1,500 nodos
- ⚠️ Aceptable: 1,500 - 3,000 nodos
- ❌ Problemático: > 3,000 nodos

#### Profundidad del DOM
**Objetivo:** < 15 niveles de anidación

#### Detached DOM Nodes (Memory Leak)
**Objetivo:** 0 nodos separados

---

## 5. Métricas de Experiencia del Usuario

### Tiempo de Respuesta a Interacciones

| Acción | Objetivo | Aceptable | Inaceptable |
|--------|----------|-----------|-------------|
| Click en botón | < 100ms | < 200ms | >= 500ms |
| Apertura de modal | < 200ms | < 500ms | >= 1s |
| Cierre de modal | < 100ms | < 200ms | >= 500ms |
| Navegación entre páginas | < 500ms | < 1s | >= 2s |
| Aplicación de filtros | < 300ms | < 500ms | >= 1s |
| Búsqueda en tabla | < 200ms | < 300ms | >= 500ms |
| Submit de formulario | < 500ms | < 1s | >= 2s |
| Carga de dropdown | < 200ms | < 300ms | >= 500ms |

---

### Task Completion Time
**Definición:** Tiempo para completar una tarea típica de usuario  

**Ejemplos:**
- Crear nueva maquinaria (7 pasos): < 3 minutos (usuario)
- Crear solicitud de mantenimiento: < 1 minuto
- Ver dashboard de tracking: < 30 segundos
- Aplicar filtro y buscar registro: < 20 segundos

---

### Perceived Performance (Percepción)
**Indicadores:**
- Skeleton loaders durante carga
- Spinners apropiados
- Feedback visual inmediato a acciones
- Animaciones fluidas

---

## 6. Métricas de Carga y Estrés

### Usuarios Concurrentes

#### Carga Normal
**Objetivo:** Soportar 50-100 usuarios concurrentes sin degradación

**Métricas a monitorear:**
- Tiempo de respuesta promedio: < 500ms
- Tasa de error: < 1%
- CPU servidor: < 70%

---

#### Carga Pico
**Objetivo:** Soportar 200 usuarios concurrentes

**Métricas a monitorear:**
- Tiempo de respuesta promedio: < 1s
- Tasa de error: < 5%
- Degradación gradual (no colapso)

---

#### Carga de Estrés
**Objetivo:** Identificar punto de quiebre

**Prueba:**
- Incrementar usuarios de 10 en 10 hasta fallo
- Documentar: número de usuarios donde inicia degradación
- Documentar: número de usuarios donde ocurre fallo

---

### Prueba de Resistencia (Soak Test)

**Duración:** 1 hora con carga constante de 50 usuarios

**Objetivo:**
- Sin memory leaks
- Sin degradación de rendimiento
- Tasa de error: < 1%
- Tiempo de respuesta estable

---

## 📋 Checklist de Métricas por Módulo

### Para Cada Módulo Documentar:

#### Frontend
- [ ] Lighthouse Performance Score
- [ ] FCP, LCP, TTI, TBT, CLS
- [ ] Bundle size de la página
- [ ] Tiempo de carga inicial
- [ ] Uso de memoria (inicial y después de 10 min)

#### Interacción
- [ ] Tiempo de apertura de modales
- [ ] Tiempo de aplicación de filtros
- [ ] Tiempo de búsqueda
- [ ] Frame rate durante interacciones

#### API
- [ ] Tiempo de respuesta (p50, p95, p99)
- [ ] Tasa de error
- [ ] Throughput

#### WebSocket (Solo Módulo de Monitoreo)
- [ ] Latencia de conexión
- [ ] Latencia de mensajes
- [ ] Tasa de pérdida
- [ ] Prueba con múltiples conexiones

---

## 🎯 Objetivos Globales del Sistema

### Rendimiento General
- **Lighthouse Score promedio:** >= 85
- **API response time (p95):** < 500ms
- **Usuarios concurrentes (sin degradación):** >= 100
- **Tasa de error global:** < 1%

### Experiencia de Usuario
- **Tiempo promedio de carga de página:** < 2s
- **Tiempo promedio de interacción:** < 300ms
- **Frame rate mínimo:** >= 30 FPS

### Estabilidad
- **Sin memory leaks:** Crecimiento < 10MB/hora
- **Sin desconexiones WebSocket:** < 1%
- **Uptime durante prueba de 1 hora:** 100%

---

## 📊 Formato de Reporte de Métricas

### Plantilla para Cada Prueba

```markdown
## [Nombre del Módulo] - [Tipo de Prueba]

**Fecha:** YYYY-MM-DD  
**Herramienta:** [Lighthouse/K6/Artillery/etc.]  
**Navegador/Entorno:** [Chrome 119/Firefox/etc.]

### Métricas Obtenidas

| Métrica | Objetivo | Resultado | Estado |
|---------|----------|-----------|--------|
| FCP | < 1.5s | 1.2s | ✅ |
| LCP | < 2.5s | 3.1s | ⚠️ |
| TTI | < 3.8s | 4.5s | ❌ |

### Observaciones
- [Descripción de hallazgos]

### Recomendaciones
- [Acción 1]
- [Acción 2]
```

---

**Última actualización:** Noviembre 26, 2025

---

## 📈 Resultados Obtenidos (26-11-2025)

Este anexo consolida los datos medidos durante la ejecución de las pruebas (Lighthouse, K6, WebSocket, UI y memoria) para trazabilidad dentro del mismo documento.

### A. Frontend – Lighthouse (por página)

Nota: Los reportes HTML generados no incluyen el Performance Score como JSON; el donut/score global se visualiza abriendo cada HTML.

| Página | FCP | LCP | Speed Index | TBT | TTI | CLS |
|--------|-----|-----|-------------|-----|-----|-----|
| Dashboard (`/sigma/`) | 1.8 s | 43.2 s | 4.0 s | 1,490 ms | 43.2 s | 0.006 |
| Maquinaria (`/sigma/machinery`) | 1.7 s | 43.1 s | 2.8 s | 2,140 ms | 43.1 s | 0.006 |
| Monitoreo (`/sigma/monitoring`) | 1.7 s | 43.1 s | 2.5 s | 1,670 ms | 43.1 s | 0.006 |
| Login (`/sigma/login`) | N/D | N/D | N/D | N/D | N/D | N/D |

Observación Login: Lighthouse arrojó error de interstitial (CHROME_INTERSTITIAL_ERROR), por lo que no hay métricas válidas en `lighthouse-auth.html`.

Reportes HTML:
- `results/2025-11-26/lighthouse-dashboard.html`
- `results/2025-11-26/lighthouse-machinery.html`
- `results/2025-11-26/lighthouse-monitoring.html`
- `results/2025-11-26/lighthouse-auth.html` (error interstitial)

Hallazgos:
- LCP y TTI muy altos (~43 s) en las vistas auditadas; revisar redirecciones/carga de recursos.
- TBT alto (1.5–2.1 s); reducir carga/ejecución JS y fragmentar tareas.
- CLS excelente (~0.006).

### B. UI – Tiempos de interacción y tablas

Login y navegación (desde pruebas UI):
- Tiempo de login: 4.56 s
- Navegación a Monitoreo: 2.48 s
- Renderizado de componentes de Monitoreo: 10.02 s

Tablas (10 filas, renderizado/filtrado/scroll):

Maquinaria (`/sigma/machinery`)
- Navegación: 3.79 s
- Render inicial: 29 ms
- Filtrado: 563 ms
- Scroll: 616 ms

Mantenimientos Programados (`/sigma/maintenance/scheduledMaintenance`)
- Navegación: 3.42 s
- Render inicial: 21 ms
- Filtrado: 530 ms
- Scroll: 615 ms

Gestión de Solicitudes (`/sigma/requests/requestsManagement`)
- Navegación: 2.64 s
- Render inicial: 22 ms
- Filtrado: 539 ms
- Scroll: 615 ms

Hallazgos:
- Tablas muy rápidas (20–30 ms) en datasets pequeños; falta validar con 50–100+ filas.
- Monitoreo requiere optimización (render ~10 s).

### C. API – K6 (smoke, carga y estrés)

Resumen global (10 min totales en escenarios):
- Total de peticiones: 19,852
- Exitosas: 6,228 (31.4%)
- Fallidas: 13,624 (68.7%)
- HTTP Request Duration (avg): 569 ms
- HTTP Request Duration (p95): 1,924 ms
- Login Duration (avg): 1,573 ms
- Login Duration (p95): 2,554 ms
- Iteraciones completadas: 6,300
- Iteraciones interrumpidas: 51

Escenarios:
- Smoke (1 min, 2 VUs): sin errores.
- Load (5 min, ramp 0→10→50→0): degradación desde 30–40 VUs.
- Stress (4 min, ramp 0→50→100→0): colapso; timeouts masivos en login.

Mensaje típico de error: `Post "https://api.inmero.co/sigma/users/auth/login/": request timeout`.

### D. WebSocket – Latencia y carga concurrente

Latencia (1 conexión, 60 s):
- Tiempo de conexión: 474 ms
- Mensajes recibidos (60s): 3
- Frecuencia: ~20 s
- Latencia entre mensajes: min 2.6 s, max 30 s, avg 16.3 s
- Tasa de errores: 0%

Carga concurrente (cliente `ws`, 3 fases: 5→15→25 conexiones):
- Conexiones creadas: 45 (100% éxito; 0% fallas)
- Mensajes recibidos: 130
- Tiempo conexión promedio: 310 ms (min 296 ms, max 347 ms, ±51 ms)

Contraste REST vs WebSocket:
- REST: 31.4% éxito (K6) vs WS: 100% éxito (25 conexiones concurrentes)

### E. Recursos del Navegador – Memoria (Playwright + CDP)

Monitoring (flujo: login → dashboard → monitoring → interacciones → dashboard):
- Memoria inicial: 17.6 MB
- Memoria final: 34.5 MB
- Incremento: +16.9 MB (+96%)
- Conclusión: normal, sin patrón de leak aparente en 30 s.

Tables (recorridos con filtrado y scroll por 3 módulos):
- Memoria inicial: 18.6 MB
- Memoria final: 42.9 MB
- Incremento: +24.3 MB (+131%)
- Conclusión: advertencia; revisar retención durante interacciones repetitivas.

Fuentes de datos:
- `results/2025-11-26/memory-profiling/*.json`
- `results/2025-11-26/ws-latency/*`, `results/2025-11-26/websocket-load/*`
- `results/2025-11-26/lighthouse-*.html`
- `results/2025-11-26/k6-results/*` (parcial)
