# Desglose de Pruebas de Rendimiento por Módulos - AMMS

## 📋 Índice de Módulos

1. [Autenticación (Auth)](#1-módulo-de-autenticación-auth)
2. [Dashboard Principal (Home)](#2-dashboard-principal-home)
3. [Gestión de Maquinaria (Machinery)](#3-gestión-de-maquinaria-machinery)
4. [Mantenimiento (Maintenance)](#4-mantenimiento-maintenance)
5. [Monitoreo (Monitoring)](#5-monitoreo-monitoring)
6. [Parametrización (Parametrization)](#6-parametrización-parametrization)
7. [Nómina (Payroll)](#7-nómina-payroll)
8. [Solicitudes (Requests)](#8-solicitudes-requests)
9. [Gestión de Usuarios (User Management)](#9-gestión-de-usuarios-user-management)
10. [Perfil de Usuario (User Profile)](#10-perfil-de-usuario-user-profile)

---

## 1. Módulo de Autenticación (Auth)

### 📍 Ubicación
- `src/app/(auth)/`
- `src/services/authService.js`
- `src/hooks/useAuth.js`
- `src/utils/tokenManager.js`

### 🎯 Funcionalidades Críticas
1. Login de usuario
2. Logout
3. Validación de tokens
4. Refresh de tokens
5. Redirección post-autenticación

### 🧪 Pruebas de Rendimiento

#### Prueba 1.1: Tiempo de Login
**Objetivo:** Medir tiempo desde submit del formulario hasta redirección al dashboard

**Herramienta:** Playwright + Chrome DevTools  
**Método:**
```javascript
// Pseudocódigo
1. Cargar página de login
2. Ingresar credenciales
3. Click en "Iniciar sesión"
4. Medir tiempo hasta carga completa del dashboard
```

**Métricas:**
- Tiempo de respuesta del API `/auth/login`
- Tiempo de almacenamiento de token
- Tiempo de redirección
- **Objetivo total:** < 2 segundos

#### Prueba 1.2: Validación de Token en Cada Navegación
**Objetivo:** Medir overhead de validación de token

**Método:**
- Navegar entre 10 páginas diferentes
- Medir tiempo de validación en cada navegación
- **Objetivo:** < 50ms por validación

#### Prueba 1.3: Carga Concurrente de Logins
**Objetivo:** Evaluar capacidad del endpoint de autenticación

**Herramienta:** K6  
**Escenario:**
- 50 usuarios intentando login simultáneamente
- 100 usuarios (carga pico)
- 200 usuarios (estrés)

**Métricas:**
- Tasa de éxito
- Tiempo promedio de respuesta
- Percentil 95
- Tasa de error

### ⚠️ Riesgos Identificados
- Token refresh puede ser lento
- Validaciones síncronas en cada navegación
- Posible bloqueo de UI durante login

### ✅ Criterios de Aceptación
- Login completo: < 2s
- Validación de token: < 50ms
- 100 logins concurrentes sin errores

---

## 2. Dashboard Principal (Home)

### 📍 Ubicación
- `src/app/(dashboard)/home/page.jsx`

### 🎯 Funcionalidades Críticas
1. Carga de widgets de resumen
2. Visualización de métricas principales
3. Accesos rápidos
4. Notificaciones recientes

### 🧪 Pruebas de Rendimiento

#### Prueba 2.1: First Contentful Paint (FCP)
**Herramienta:** Lighthouse  
**Objetivo:** < 1.5s

#### Prueba 2.2: Time to Interactive (TTI)
**Herramienta:** Lighthouse  
**Objetivo:** < 3s

#### Prueba 2.3: Carga de Datos del Dashboard
**Método:**
- Medir tiempo de carga de cada widget
- Identificar si hay carga secuencial o paralela
- Optimizar peticiones API si es necesario

**Métricas:**
- Tiempo de cada petición API
- Tiempo total hasta mostrar todos los datos
- **Objetivo:** < 2s

### ⚠️ Riesgos Identificados
- Múltiples peticiones API en cascada
- Posible re-render por Context API

### ✅ Criterios de Aceptación
- Performance Score Lighthouse: >= 85
- FCP: < 1.5s
- TTI: < 3s

---

## 3. Gestión de Maquinaria (Machinery)

### 📍 Ubicación
- `src/app/(dashboard)/machinery/page.jsx`
- `src/services/machineryService.js`

### 🎯 Funcionalidades Críticas
1. Listado de maquinaria (tabla con paginación)
2. Formulario modal multi-paso (7 pasos)
3. Visualización de detalles de maquinaria
4. Carga de imágenes
5. Gestión de documentos
6. Configuración de umbrales de telemetría

### 🧪 Pruebas de Rendimiento

#### Prueba 3.1: Carga de Tabla de Maquinaria
**Objetivo:** Evaluar rendimiento con diferentes volúmenes de datos

**Escenarios:**
- 10 registros
- 50 registros
- 100 registros
- 500 registros (si aplica)

**Herramienta:** Chrome Performance Profiler  
**Métricas:**
- Tiempo de renderizado de tabla
- Frame rate durante scroll
- Uso de memoria
- **Objetivo:** < 1s para 100 registros

#### Prueba 3.2: Apertura de Modal Multi-Paso
**Objetivo:** Medir tiempo de apertura e interacción

**Método:**
1. Click en "Nueva Maquinaria"
2. Medir tiempo hasta renderizado completo del paso 1
3. Navegar entre los 7 pasos midiendo tiempos
4. Medir tiempos de carga de dropdowns (marcas, modelos, etc.)

**Métricas:**
- Tiempo de apertura: < 500ms
- Transición entre pasos: < 200ms
- Carga de dropdowns: < 300ms

#### Prueba 3.3: Carga de Imágenes y Documentos
**Objetivo:** Evaluar rendimiento de upload/download

**Método:**
- Upload de imagen de maquinaria (2MB)
- Download de documento técnico
- Visualización de múltiples documentos

**Métricas:**
- Tiempo de upload
- Tiempo de preview
- **Objetivo:** < 3s para imagen de 2MB

#### Prueba 3.4: Carga de API de Servicios
**Objetivo:** Medir rendimiento de los 21+ endpoints

**Herramienta:** K6  
**Endpoints críticos:**
- `/machinery/list/` (GET)
- `/machinery/create-general-sheet/` (POST)
- `/machinery/{id}/` (GET)
- `/machinery/{id}/update/` (PUT)

**Escenarios:**
- 10 peticiones concurrentes
- 50 peticiones concurrentes
- 100 peticiones concurrentes

**Métricas:**
- Tiempo de respuesta promedio
- Percentil 95
- Tasa de error
- **Objetivo:** < 500ms (p95)

### ⚠️ Riesgos Identificados
- Tabla con muchos registros puede ser lenta
- Modal multi-paso con muchas peticiones API anidadas
- Carga de imágenes sin lazy loading
- 7 pasos del formulario pueden tener memory leaks

### ✅ Criterios de Aceptación
- Tabla de 100 registros: < 1s
- Apertura de modal: < 500ms
- Upload de imagen 2MB: < 3s
- API response time (p95): < 500ms

---

## 4. Mantenimiento (Maintenance)

### 📍 Ubicación
- `src/app/(dashboard)/maintenance/`
  - `maintenanceManagement/`
  - `maintenanceRequest/`
  - `scheduledMaintenance/`
- `src/services/maintenanceService.js`

### 🎯 Funcionalidades Críticas
1. Gestión de mantenimientos (CRUD)
2. Solicitudes de mantenimiento
3. Programación de mantenimientos
4. Reportes de mantenimiento
5. Asignación de técnicos

### 🧪 Pruebas de Rendimiento

#### Prueba 4.1: Listado de Solicitudes de Mantenimiento
**Método:** Similar a maquinaria, tabla con filtros

**Escenarios:**
- 50 solicitudes
- 100 solicitudes
- 200 solicitudes

**Métricas:**
- Tiempo de carga inicial
- Tiempo de aplicación de filtros
- Tiempo de ordenamiento
- **Objetivo:** < 1s para 100 registros

#### Prueba 4.2: Creación de Solicitud de Mantenimiento
**Método:**
1. Abrir modal
2. Llenar formulario
3. Seleccionar maquinaria
4. Seleccionar prioridad
5. Enviar formulario

**Métricas:**
- Tiempo de apertura de modal: < 500ms
- Tiempo de carga de dropdowns: < 300ms
- Tiempo de submit: < 1s

#### Prueba 4.3: Programación de Mantenimiento
**Método:**
- Abrir modal de programación
- Asignar técnicos
- Seleccionar fecha
- Confirmar

**Métricas:**
- Carga de técnicos disponibles: < 500ms
- Tiempo de confirmación: < 1s

#### Prueba 4.4: Generación de Reporte de Mantenimiento
**Objetivo:** Evaluar tiempo de creación y guardado

**Métricas:**
- Tiempo de carga del formulario: < 500ms
- Tiempo de guardado: < 2s

### ⚠️ Riesgos Identificados
- Múltiples tablas con diferentes estados
- Carga de información de técnicos, maquinaria y prioridades
- Posible lag en filtros complejos

### ✅ Criterios de Aceptación
- Carga de listado: < 1s
- Creación de solicitud: < 2s (total)
- Asignación de técnico: < 1s

---

## 5. Monitoreo (Monitoring)

### 📍 Ubicación
- `src/app/(dashboard)/monitoring/`
  - `devicesManagement/`
  - `requestMonitoring/`
- `src/services/monitoringService.js`
- `src/hooks/useTrackingWebSocket.js`
- `src/app/components/monitoring/TrackingDashboardModal.jsx`
- `src/app/components/monitoring/TrackingDashboardComponents.jsx`

### 🎯 Funcionalidades Críticas
1. **Monitoreo en tiempo real vía WebSocket**
2. Dashboard de telemetría con gráficos (Recharts)
3. Mapa en tiempo real (Leaflet)
4. Visualización de múltiples maquinarias simultáneamente
5. Histórico de datos de telemetría
6. Alertas y notificaciones en tiempo real

### 🧪 Pruebas de Rendimiento

#### ⭐ Prueba 5.1: Conexión WebSocket Inicial
**Objetivo:** Medir tiempo de establecimiento de conexión

**Herramienta:** wscat + Chrome DevTools  
**Método:**
```bash
wscat -c "wss://api.inmero.co/telemetry/ws/telemetria/SOL-2025-0011?password=telemetry_password_2024"
```

**Métricas:**
- Tiempo de handshake: < 200ms
- Tiempo hasta primer mensaje: < 500ms
- **Latencia promedio:** < 100ms

#### ⭐ Prueba 5.2: Latencia de Mensajes en Tiempo Real
**Objetivo:** Medir tiempo entre envío del servidor y recepción en cliente

**Método:**
1. Conectar al WebSocket
2. Recibir 100 mensajes de telemetría
3. Calcular latencia de cada mensaje
4. Calcular promedio y percentil 95

**Métricas:**
- Latencia promedio: < 100ms
- Latencia p95: < 200ms
- Pérdida de mensajes: 0%

#### ⭐ Prueba 5.3: Múltiples Conexiones WebSocket Concurrentes
**Objetivo:** Evaluar capacidad del servidor con múltiples clientes

**Herramienta:** Artillery  
**Escenarios:**
- 10 conexiones simultáneas
- 50 conexiones simultáneas
- 100 conexiones simultáneas

**Archivo de configuración:** `configs/artillery-websocket.yml`

**Métricas:**
- Conexiones exitosas
- Tiempo de conexión promedio
- Mensajes recibidos por segundo
- Desconexiones inesperadas

#### ⭐ Prueba 5.4: Renderizado de Dashboard de Tracking
**Objetivo:** Medir rendimiento del componente TrackingDashboardModal

**Método:**
1. Abrir modal de tracking
2. Conectar a WebSocket
3. Recibir datos de 5 maquinarias simultáneamente
4. Medir frame rate durante actualización de datos

**Herramienta:** React DevTools Profiler + Chrome Performance

**Métricas:**
- Tiempo de apertura del modal: < 500ms
- Frame rate durante actualizaciones: >= 30 FPS
- Tiempo de renderizado de gráficos: < 1s
- Uso de memoria después de 10 minutos: < 250MB

#### ⭐ Prueba 5.5: Renderizado de Mapa en Tiempo Real (Leaflet)
**Objetivo:** Evaluar performance del mapa con múltiples marcadores

**Escenarios:**
- 5 maquinarias en el mapa
- 10 maquinarias en el mapa
- 20 maquinarias en el mapa

**Métricas:**
- Tiempo de carga inicial del mapa: < 1s
- Frame rate durante pan/zoom: >= 30 FPS
- Tiempo de actualización de marcadores: < 200ms
- **Objetivo:** Mantener 30 FPS con 20 marcadores

#### ⭐ Prueba 5.6: Renderizado de Gráficos con Recharts
**Objetivo:** Evaluar performance de PerformanceChart y FuelConsumptionChart

**Datos de prueba:**
- 50 puntos de datos
- 100 puntos de datos
- 200 puntos de datos

**Métricas:**
- Tiempo de renderizado inicial: < 1s
- Tiempo de actualización con nuevos datos: < 500ms
- Frame rate durante interacción (hover, zoom): >= 30 FPS

#### Prueba 5.7: Memory Leak en WebSocket
**Objetivo:** Detectar fugas de memoria durante uso prolongado

**Método:**
1. Conectar al WebSocket
2. Dejar corriendo 30 minutos recibiendo datos
3. Tomar snapshots de memoria cada 5 minutos
4. Analizar crecimiento de heap

**Herramienta:** Chrome Memory Profiler

**Métricas:**
- Crecimiento de heap: < 50MB en 30 minutos
- Detached DOM nodes: 0
- **Criterio:** Sin memory leaks detectables

#### Prueba 5.8: Histórico de Telemetría (localStorage)
**Objetivo:** Evaluar impacto de almacenamiento local

**Método:**
- Almacenar 1000 puntos de datos en localStorage
- Medir tiempo de lectura/escritura
- Medir impacto en rendimiento general

**Métricas:**
- Tiempo de escritura: < 100ms
- Tiempo de lectura: < 50ms
- Tamaño de datos: < 5MB

### ⚠️ Riesgos Identificados (Críticos)
1. **WebSocket puede desconectarse bajo alta carga**
2. **Renderizado de Leaflet con muchos marcadores puede causar lag**
3. **Recharts con muchos puntos de datos puede ser lento**
4. **Memory leaks por listeners no removidos**
5. **Re-renders innecesarios del dashboard**
6. **Acumulación de datos históricos sin límite**

### ✅ Criterios de Aceptación
- Latencia WebSocket: < 100ms
- Frame rate del dashboard: >= 30 FPS
- Mapa con 20 marcadores: fluido (30 FPS)
- Sin memory leaks en 30 minutos
- 50 conexiones concurrentes sin errores

---

## 6. Parametrización (Parametrization)

### 📍 Ubicación
- `src/app/(dashboard)/parametrization/`
  - `brands/`
  - `jobTitles/`
  - `mainView/`
  - `status/`
  - `units/`
  - `view/`
- `src/services/parametrizationService.js`

### 🎯 Funcionalidades Críticas
1. Gestión de marcas
2. Gestión de cargos
3. Gestión de estados
4. Gestión de unidades
5. Listados con filtros

### 🧪 Pruebas de Rendimiento

#### Prueba 6.1: Carga de Vistas de Parametrización
**Método:**
- Navegar entre las diferentes vistas
- Medir tiempo de carga de cada tabla

**Métricas:**
- Tiempo de carga: < 1s
- Transición entre vistas: < 500ms

#### Prueba 6.2: Filtrado y Búsqueda
**Método:**
- Aplicar filtros en tablas con 100+ registros
- Medir tiempo de respuesta

**Métricas:**
- Tiempo de aplicación de filtro: < 300ms
- Búsqueda en tiempo real: < 200ms

### ⚠️ Riesgos Identificados
- Múltiples tablas pequeñas, bajo riesgo

### ✅ Criterios de Aceptación
- Carga de tablas: < 1s
- Filtros: < 300ms

---

## 7. Nómina (Payroll)

### 📍 Ubicación
- `src/app/(dashboard)/payroll/`
  - `contractManagement/`
  - `employees/`
  - `generatedPayrolls/`
- `src/services/payrollService.js`

### 🎯 Funcionalidades Críticas
1. Gestión de contratos
2. Gestión de empleados
3. Generación de nóminas
4. Visualización de nóminas generadas

### 🧪 Pruebas de Rendimiento

#### Prueba 7.1: Listado de Empleados
**Escenarios:**
- 50 empleados
- 100 empleados
- 200 empleados

**Métricas:**
- Tiempo de carga: < 1s para 100 empleados

#### Prueba 7.2: Generación de Nómina
**Objetivo:** Medir tiempo de cálculo y generación

**Método:**
- Generar nómina para 50 empleados
- Medir tiempo total

**Métricas:**
- Tiempo de generación: < 5s
- Tiempo de visualización: < 1s

### ⚠️ Riesgos Identificados
- Cálculo de nóminas puede ser costoso
- Posible bloqueo de UI durante generación

### ✅ Criterios de Aceptación
- Listado: < 1s
- Generación: < 5s

---

## 8. Solicitudes (Requests)

### 📍 Ubicación
- `src/app/(dashboard)/requests/`
  - `clients/`
  - `requestsManagement/`
  - `services/`
- `src/services/requestService.js`

### 🎯 Funcionalidades Críticas
1. Gestión de clientes
2. Gestión de solicitudes
3. Gestión de servicios
4. Vinculación con monitoreo

### 🧪 Pruebas de Rendimiento

#### Prueba 8.1: Listado de Solicitudes
**Escenarios:**
- 50 solicitudes
- 100 solicitudes
- 200 solicitudes

**Métricas:**
- Tiempo de carga: < 1s para 100 solicitudes
- Filtrado por estado: < 300ms

#### Prueba 8.2: Creación de Solicitud
**Método:**
- Llenar formulario completo
- Seleccionar cliente
- Asignar maquinarias
- Confirmar

**Métricas:**
- Tiempo total: < 3s

### ⚠️ Riesgos Identificados
- Dependencia con módulo de monitoring
- Posible lag en listado de maquinarias disponibles

### ✅ Criterios de Aceptación
- Listado: < 1s
- Creación: < 3s

---

## 9. Gestión de Usuarios (User Management)

### 📍 Ubicación
- `src/app/(dashboard)/userManagement/`
  - `auditLog/`
  - `mainView/`
  - `roleManagement/`
  - `userInformation/`
- `src/services/userService.js`
- `src/services/roleService.js`
- `src/services/auditService.js`

### 🎯 Funcionalidades Críticas
1. Listado de usuarios
2. CRUD de usuarios
3. Gestión de roles
4. Logs de auditoría

### 🧪 Pruebas de Rendimiento

#### Prueba 9.1: Listado de Usuarios
**Escenarios:**
- 50 usuarios
- 100 usuarios
- 200 usuarios

**Métricas:**
- Tiempo de carga: < 1s para 100 usuarios

#### Prueba 9.2: Logs de Auditoría
**Objetivo:** Evaluar rendimiento con muchos registros

**Escenarios:**
- 100 logs
- 500 logs
- 1000 logs

**Métricas:**
- Tiempo de carga: < 2s para 500 logs
- Filtrado por fecha: < 500ms
- Búsqueda: < 300ms

### ⚠️ Riesgos Identificados
- Logs de auditoría pueden crecer muchísimo
- Necesita paginación eficiente

### ✅ Criterios de Aceptación
- Listado de usuarios: < 1s
- Logs (500 registros): < 2s

---

## 10. Perfil de Usuario (User Profile)

### 📍 Ubicación
- `src/app/(dashboard)/userProfile/`
- `src/services/profileService.js`

### 🎯 Funcionalidades Críticas
1. Visualización de información personal
2. Edición de perfil
3. Cambio de contraseña
4. Cambio de foto de perfil

### 🧪 Pruebas de Rendimiento

#### Prueba 10.1: Carga de Perfil
**Métricas:**
- Tiempo de carga: < 500ms

#### Prueba 10.2: Upload de Foto de Perfil
**Método:**
- Upload de imagen 1MB

**Métricas:**
- Tiempo de upload: < 2s
- Tiempo de preview: < 500ms

### ✅ Criterios de Aceptación
- Carga de perfil: < 500ms
- Upload de foto: < 2s

---

## 📊 Resumen de Prioridades

### 🔴 Crítico (Máxima Prioridad)
1. **Módulo de Monitoreo (WebSocket)**
   - Impacto directo en funcionalidad principal
   - Tiempo real es crítico
   - Mayor complejidad técnica

2. **Módulo de Maquinaria**
   - Corazón del sistema
   - Formulario multi-paso complejo
   - Muchas peticiones API

3. **Módulo de Autenticación**
   - Punto de entrada al sistema
   - Primera impresión del usuario

### 🟡 Alta Prioridad
4. Módulo de Mantenimiento
5. Módulo de Solicitudes
6. Dashboard Principal

### 🟢 Media Prioridad
7. Gestión de Usuarios
8. Nómina
9. Parametrización
10. Perfil de Usuario

---

**Última actualización:** Noviembre 26, 2025
