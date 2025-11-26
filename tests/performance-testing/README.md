# README - Pruebas de Rendimiento AMMS

## 📋 Descripción General

Este directorio contiene el plan completo de **Pruebas de Rendimiento** para el proyecto AMMS (Asset Maintenance Management System). El objetivo es evaluar y garantizar que el sistema funcione de manera óptima bajo diferentes condiciones de carga y uso.

---

## 📁 Estructura del Directorio

```
performance-testing/
├── README.md                           # Este archivo
├── PERFORMANCE_TESTING_PLAN.md         # Plan maestro de pruebas
├── MODULE_TESTING_BREAKDOWN.md         # Desglose detallado por módulo
├── METRICS_AND_KPIS.md                 # Métricas y KPIs a monitorear
├── RESULTS_TEMPLATE.md                 # Plantilla para reportes de resultados
├── configs/                            # Configuraciones de herramientas
│   ├── k6-load-test.js                 # (Pendiente) Scripts K6
│   ├── artillery-websocket.yml         # (Pendiente) Config Artillery
│   ├── jmeter-test-plan.jmx            # (Pendiente) Plan JMeter
│   └── lighthouse-config.js            # (Pendiente) Config Lighthouse
├── scripts/                            # Scripts de automatización
│   ├── run-lighthouse.sh               # (Pendiente)
│   ├── run-k6-tests.sh                 # (Pendiente)
│   ├── run-websocket-tests.sh          # (Pendiente)
│   └── analyze-memory.js               # (Pendiente)
└── results/                            # Resultados de pruebas ejecutadas
    ├── baseline/                       # Línea base de referencia
    └── YYYY-MM-DD/                     # Resultados por fecha
```

---

## 🚀 Inicio Rápido

### 1. Leer la Documentación Principal

Comienza leyendo los documentos en este orden:

1. **`PERFORMANCE_TESTING_PLAN.md`** - Visión general, tecnologías y metodología
2. **`MODULE_TESTING_BREAKDOWN.md`** - Pruebas específicas por módulo
3. **`METRICS_AND_KPIS.md`** - Métricas a monitorear y objetivos
4. **`RESULTS_TEMPLATE.md`** - Formato para documentar resultados

---

### 2. Instalar Herramientas Necesarias

#### Frontend Performance

**Lighthouse (Google Chrome)**
```bash
npm install -g lighthouse
```

**Puppeteer**
```bash
npm install puppeteer
```

**Playwright**
```bash
npm install -D @playwright/test
```

#### Load Testing

**K6 (Grafana)**
```bash
# Windows (con Chocolatey)
choco install k6

# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Artillery**
```bash
npm install -g artillery
```

#### WebSocket Testing

**wscat**
```bash
npm install -g wscat
```

#### Apache JMeter (Opcional)
Descargar desde: https://jmeter.apache.org/download_jmeter.cgi

---

### 3. Configurar el Proyecto

**Iniciar el servidor de desarrollo:**
```bash
npm run dev
```

El proyecto estará disponible en: http://localhost:3000

---

### 4. Ejecutar Pruebas Básicas

#### Prueba de Lighthouse en Página de Login
```bash
lighthouse http://localhost:3000/auth --output html --output-path ./results/lighthouse-auth.html
```

#### Prueba de WebSocket (Manual)
```bash
wscat -c "wss://api.inmero.co/telemetry/ws/telemetria/SOL-2025-0011?password=telemetry_password_2024"
```

---

## 📖 Documentos Principales

### 1. PERFORMANCE_TESTING_PLAN.md
**Contenido:**
- Objetivos de las pruebas de rendimiento
- Tecnologías y herramientas a utilizar
- Metodología (6 fases)
- Criterios de aceptación
- Organización de archivos
- Plan de ejecución

**Cuándo usarlo:** Para entender la estrategia general y las herramientas disponibles.

---

### 2. MODULE_TESTING_BREAKDOWN.md
**Contenido:**
- Desglose detallado de los 10 módulos del sistema
- Funcionalidades críticas de cada módulo
- Pruebas específicas por módulo
- Riesgos identificados
- Criterios de aceptación por módulo
- Priorización de pruebas

**Cuándo usarlo:** Antes de probar un módulo específico para conocer qué evaluar.

**Módulos incluidos:**
1. Autenticación (Auth)
2. Dashboard Principal (Home)
3. Gestión de Maquinaria (Machinery) ⭐
4. Mantenimiento (Maintenance)
5. Monitoreo (Monitoring) ⭐⭐ CRÍTICO
6. Parametrización (Parametrization)
7. Nómina (Payroll)
8. Solicitudes (Requests)
9. Gestión de Usuarios (User Management)
10. Perfil de Usuario (User Profile)

---

### 3. METRICS_AND_KPIS.md
**Contenido:**
- Core Web Vitals (FCP, LCP, TTI, TBT, CLS)
- Métricas de red y API
- Métricas específicas de WebSocket
- Métricas de recursos del navegador (memoria, CPU, FPS)
- Métricas de experiencia de usuario
- Objetivos y criterios de aceptación para cada métrica

**Cuándo usarlo:** Durante y después de las pruebas para validar resultados contra objetivos.

---

### 4. RESULTS_TEMPLATE.md
**Contenido:**
- Plantilla completa para documentar resultados
- Tablas pre-formateadas para cada tipo de prueba
- Secciones para evidencias (screenshots, gráficos)
- Formato de resumen ejecutivo
- Checklist de próximos pasos

**Cuándo usarlo:** Para documentar los resultados de cada sesión de pruebas.

---

## 🎯 Módulos Prioritarios

### 🔴 Prioridad Crítica

#### 1. Módulo de Monitoreo (Monitoring)
**Por qué es crítico:**
- Funcionalidad principal del sistema
- WebSocket en tiempo real
- Visualizaciones complejas (Recharts + Leaflet)
- Mayor complejidad técnica
- Posibles memory leaks

**Pruebas clave:**
- Latencia de WebSocket
- Múltiples conexiones concurrentes
- Frame rate durante actualizaciones
- Memory leak test (30+ minutos)
- Rendimiento de gráficos con datos históricos

---

#### 2. Módulo de Maquinaria (Machinery)
**Por qué es importante:**
- Corazón del sistema (gestión de activos)
- Formulario modal multi-paso (7 pasos)
- Muchas peticiones API anidadas
- Carga de imágenes y documentos
- Tablas con potencialmente muchos registros

**Pruebas clave:**
- Renderizado de tabla con diferentes volúmenes
- Performance del modal multi-paso
- Upload/download de archivos
- Carga de dropdowns dependientes

---

#### 3. Módulo de Autenticación (Auth)
**Por qué es importante:**
- Primera impresión del sistema
- Punto de entrada obligatorio
- Validación en cada navegación

**Pruebas clave:**
- Tiempo de login completo
- Validación de token
- Carga concurrente de logins

---

## 📊 Flujo de Trabajo Recomendado

### Fase 1: Preparación (Día 1)
1. ✅ Instalar todas las herramientas
2. ✅ Configurar entorno de pruebas
3. ✅ Crear línea base (baseline) - Ejecutar Lighthouse en todas las páginas principales
4. ✅ Documentar configuración del entorno

### Fase 2: Pruebas por Módulo (Semana 1-2)
1. Seleccionar módulo a probar
2. Leer `MODULE_TESTING_BREAKDOWN.md` - sección del módulo
3. Ejecutar pruebas definidas
4. Documentar resultados usando `RESULTS_TEMPLATE.md`
5. Repetir para cada módulo (priorizar críticos primero)

### Fase 3: Pruebas de Carga (Semana 3)
1. Configurar K6/Artillery
2. Ejecutar pruebas de carga en APIs críticas
3. Probar WebSocket con múltiples conexiones
4. Documentar capacidad máxima del sistema

### Fase 4: Análisis y Reporte (Semana 4)
1. Consolidar resultados
2. Comparar contra objetivos en `METRICS_AND_KPIS.md`
3. Generar reporte ejecutivo
4. Crear lista priorizada de optimizaciones
5. Presentar hallazgos

---

## 🛠️ Herramientas por Tipo de Prueba

### Performance Frontend
- **Lighthouse** → Auditoría completa de rendimiento
- **Chrome DevTools Performance** → Análisis detallado de ejecución
- **React DevTools Profiler** → Análisis de componentes React

### Carga y Estrés
- **K6** → Pruebas de carga modernas, fácil de usar
- **Artillery** → Excelente para WebSocket
- **JMeter** → Completo pero más complejo

### WebSocket
- **wscat** → Testing manual de WebSocket
- **Artillery** → Pruebas de carga automatizadas

### Memoria y Recursos
- **Chrome Memory Profiler** → Detección de memory leaks
- **Chrome Task Manager** → Monitoreo de recursos

---

## 📈 Métricas Clave a Monitorear

### Rendimiento General
- ✅ **Lighthouse Performance Score:** >= 85
- ✅ **FCP (First Contentful Paint):** < 1.5s
- ✅ **LCP (Largest Contentful Paint):** < 2.5s
- ✅ **TTI (Time to Interactive):** < 3.8s

### APIs
- ✅ **Tiempo de respuesta (p95):** < 500ms
- ✅ **Tasa de error:** < 1%

### WebSocket (Crítico)
- ✅ **Latencia promedio:** < 100ms
- ✅ **Tasa de pérdida:** 0%
- ✅ **50 conexiones concurrentes:** Sin errores

### Recursos
- ✅ **Uso de memoria (10 min):** < 150 MB
- ✅ **Frame rate:** >= 30 FPS
- ✅ **Sin memory leaks**

---

## ⚠️ Riesgos Identificados

### Alto Riesgo
1. **WebSocket puede desconectarse** bajo alta carga
2. **Memory leaks** en listeners de eventos sin limpiar
3. **Renderizado de Leaflet** con muchos marcadores
4. **Recharts** con muchos puntos de datos

### Medio Riesgo
1. **Re-renders excesivos** por Context API
2. **Tablas grandes** sin virtualización
3. **Bundle size** alto por muchas dependencias
4. **Carga de imágenes** sin lazy loading

---

## 📝 Ejemplo: Probar Módulo de Monitoreo

### Paso 1: Leer la documentación
```bash
# Abrir MODULE_TESTING_BREAKDOWN.md
# Ir a la sección: "5. Monitoreo (Monitoring)"
```

### Paso 2: Preparar el entorno
```bash
# Iniciar el servidor
npm run dev

# En otra terminal, instalar wscat si no lo tienes
npm install -g wscat
```

### Paso 3: Ejecutar Lighthouse
```bash
lighthouse http://localhost:3000/monitoring --output html --output-path ./results/lighthouse-monitoring.html
```

### Paso 4: Probar WebSocket manualmente
```bash
wscat -c "wss://api.inmero.co/telemetry/ws/telemetria/SOL-2025-0011?password=telemetry_password_2024"
# Observar mensajes recibidos
# Medir latencia manualmente
```

### Paso 5: Análisis de memoria (Manual en Chrome)
1. Abrir Chrome DevTools → Memory
2. Tomar snapshot inicial
3. Usar la aplicación por 10 minutos
4. Tomar snapshot final
5. Comparar

### Paso 6: Documentar resultados
```bash
# Copiar RESULTS_TEMPLATE.md
cp RESULTS_TEMPLATE.md results/2025-11-26/monitoring-results.md

# Llenar con resultados obtenidos
```

---

## 🎓 Recursos de Aprendizaje

### Lighthouse
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Web.dev Performance](https://web.dev/performance/)

### K6
- [K6 Documentation](https://k6.io/docs/)
- [K6 Examples](https://k6.io/docs/examples/)

### Artillery
- [Artillery Documentation](https://www.artillery.io/docs)
- [WebSocket Testing Guide](https://www.artillery.io/docs/guides/guides/websocket-testing)

### Performance
- [Core Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)

---

## 📞 Contacto y Soporte

**Responsable QA:** [Tu Nombre]  
**Email:** [tu-email@ejemplo.com]  
**Última actualización:** Noviembre 26, 2025

---

## ✅ Checklist de Inicio

Antes de comenzar las pruebas, asegúrate de:

- [ ] Leer `PERFORMANCE_TESTING_PLAN.md`
- [ ] Instalar todas las herramientas necesarias
- [ ] Configurar entorno de desarrollo
- [ ] Ejecutar servidor en `http://localhost:3000`
- [ ] Crear carpeta de resultados con fecha actual
- [ ] Tener acceso a las credenciales de prueba
- [ ] Conocer endpoints de APIs a probar
- [ ] Revisar módulos prioritarios

---

**¡Buena suerte con las pruebas! 🚀**
