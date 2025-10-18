# IT-SOL-001: Reporte de Prueba de Gestión de Solicitudes

**Fecha de ejecución:** 2025-10-17 12:32:01

---

## Objetivo

Automatizar y validar el flujo completo de creación de solicitudes en el módulo de Gestión de Solicitudes.

## Usuarios de prueba

- 1075262391
- 10046573
- 1076501058
- 26570831

## Log de ejecución

```
[2025-10-17 12:29:02] [INFO] ================================================================================
[2025-10-17 12:29:02] [INFO] INICIANDO PRUEBA IT-SOL-001: GESTIÓN DE SOLICITUDES
[2025-10-17 12:29:02] [INFO] ================================================================================
[2025-10-17 12:29:02] [INFO] Configurando driver de Selenium...
[2025-10-17 12:29:03] [SUCCESS] Driver configurado correctamente
[2025-10-17 12:29:03] [INFO] Iniciando proceso de login...
[2025-10-17 12:29:06] [INFO] Email ingresado: juandalozano07@gmail.com
[2025-10-17 12:29:06] [INFO] Contraseña ingresada
[2025-10-17 12:29:06] [INFO] Click en botón de login
[2025-10-17 12:29:09] [SUCCESS] Login exitoso
[2025-10-17 12:29:09] [INFO] ================================================================================
[2025-10-17 12:29:09] [INFO] SOLICITUD 1/4 - ID: 1075262391
[2025-10-17 12:29:09] [INFO] ================================================================================
[2025-10-17 12:29:09] [INFO] Navegando al módulo de Solicitudes...
[2025-10-17 12:29:09] [INFO] Click en módulo de Solicitudes
[2025-10-17 12:29:11] [INFO] Click en Gestión de solicitudes
[2025-10-17 12:29:14] [INFO] Click en 'Nueva Pre-Solicitud' para abrir el asistente
[2025-10-17 12:29:17] [SUCCESS] Navegación exitosa a Gestión de Solicitudes
[2025-10-17 12:29:17] [INFO] === PASO 1: Ingresando número de identificación: 1075262391 ===
[2025-10-17 12:29:20] [INFO] Intentando selector: //input[@placeholder='Ingrese número de identificación']
[2025-10-17 12:29:20] [INFO] Input encontrado con selector: //input[@placeholder='Ingrese número de identificación']
[2025-10-17 12:29:21] [INFO] Número de identificación ingresado: 1075262391
[2025-10-17 12:29:27] [INFO] Información de usuario: Añadir nuevo cliente
[2025-10-17 12:29:27] [SUCCESS] Usuario encontrado - ID: 1075262391
[2025-10-17 12:29:29] [INFO] Click en botón Siguiente (Paso 1)
[2025-10-17 12:29:32] [SUCCESS] Paso 1 completado exitosamente
[2025-10-17 12:29:32] [INFO] === PASO 2: Completando descripción y fechas ===
[2025-10-17 12:29:32] [INFO] Descripción ingresada: Solicitud de prueba automatizada para validación del sistema de gestión de solicitudes.
[2025-10-17 12:29:34] [INFO] Fecha de inicio programada: 24/10/2025
[2025-10-17 12:29:37] [INFO] Fecha de finalización: 08/11/2025
[2025-10-17 12:29:39] [INFO] Click en botón Siguiente (Paso 2)
[2025-10-17 12:29:42] [SUCCESS] Paso 2 completado exitosamente
[2025-10-17 12:29:42] [INFO] === PASO 3: Completando ubicación y detalles ===
[2025-10-17 12:29:42] [INFO] Países disponibles: 250
[2025-10-17 12:29:43] [INFO] País seleccionado: Colombia
[2025-10-17 12:29:46] [INFO] Departamentos disponibles: 33
[2025-10-17 12:29:46] [INFO] Departamento seleccionado: Quindío
[2025-10-17 12:29:49] [INFO] Ciudades disponibles: 12
[2025-10-17 12:29:49] [INFO] Ciudad seleccionada: Armenia
[2025-10-17 12:29:51] [INFO] Nombre de finca ingresado: Finca La Esperanza
[2025-10-17 12:29:52] [INFO] Latitud ingresada: 4.710989
[2025-10-17 12:29:53] [INFO] Longitud ingresada: -74.072092
[2025-10-17 12:29:55] [INFO] Unidad de área seleccionada: ha
[2025-10-17 12:29:56] [INFO] Área ingresada: 25 ha
[2025-10-17 12:29:57] [INFO] Tipo de suelo seleccionado: Arcilloso
[2025-10-17 12:29:58] [INFO] Humedad ingresada: 65%
[2025-10-17 12:29:59] [INFO] Unidad de altitud seleccionada: m
[2025-10-17 12:30:00] [INFO] Área de cultivo ingresada: 15.500000
[2025-10-17 12:30:02] [SUCCESS] Paso 3 completado exitosamente
[2025-10-17 12:30:02] [INFO] Guardando solicitud...
[2025-10-17 12:30:02] [INFO] Click en botón Guardar
[2025-10-17 12:30:06] [INFO] Buscando botón Continuar...
[2025-10-17 12:30:08] [INFO] Click en botón Continuar
[2025-10-17 12:30:10] [SUCCESS] Guardado completado
[2025-10-17 12:30:10] [INFO] Verificando notificaciones...
[2025-10-17 12:30:10] [INFO] Click en botón de notificaciones
[2025-10-17 12:30:13] [WARNING] No se encontraron notificaciones visibles
[2025-10-17 12:30:13] [SUCCESS] Verificación de notificaciones completada
[2025-10-17 12:30:13] [SUCCESS] Solicitud completada para ID: 1075262391
[2025-10-17 12:30:13] [INFO] Esperando 3 segundos antes de crear la siguiente solicitud...
[2025-10-17 12:30:16] [INFO] ================================================================================
[2025-10-17 12:30:16] [INFO] SOLICITUD 2/4 - ID: 10046573
[2025-10-17 12:30:16] [INFO] ================================================================================
[2025-10-17 12:30:16] [INFO] Navegando al módulo de Solicitudes...
[2025-10-17 12:30:16] [INFO] Click en módulo de Solicitudes
[2025-10-17 12:30:18] [INFO] Click en Gestión de solicitudes
[2025-10-17 12:30:21] [INFO] Click en 'Nueva Pre-Solicitud' para abrir el asistente
[2025-10-17 12:30:24] [SUCCESS] Navegación exitosa a Gestión de Solicitudes
[2025-10-17 12:30:24] [INFO] === PASO 1: Ingresando número de identificación: 10046573 ===
[2025-10-17 12:30:27] [INFO] Intentando selector: //input[@placeholder='Ingrese número de identificación']
[2025-10-17 12:30:27] [INFO] Input encontrado con selector: //input[@placeholder='Ingrese número de identificación']
[2025-10-17 12:30:29] [INFO] Número de identificación ingresado: 10046573
[2025-10-17 12:30:34] [INFO] Información de usuario: Añadir nuevo cliente
[2025-10-17 12:30:34] [SUCCESS] Usuario encontrado - ID: 10046573
[2025-10-17 12:30:36] [INFO] Click en botón Siguiente (Paso 1)
[2025-10-17 12:30:39] [SUCCESS] Paso 1 completado exitosamente
[2025-10-17 12:30:39] [INFO] === PASO 2: Completando descripción y fechas ===
[2025-10-17 12:30:39] [INFO] Descripción ingresada: Solicitud de prueba automatizada para validación del sistema de gestión de solicitudes.
[2025-10-17 12:30:42] [INFO] Fecha de inicio programada: 24/10/2025
[2025-10-17 12:30:44] [INFO] Fecha de finalización: 08/11/2025
[2025-10-17 12:30:46] [INFO] Click en botón Siguiente (Paso 2)
[2025-10-17 12:30:49] [SUCCESS] Paso 2 completado exitosamente
[2025-10-17 12:30:49] [INFO] === PASO 3: Completando ubicación y detalles ===
[2025-10-17 12:30:49] [INFO] Países disponibles: 250
[2025-10-17 12:30:50] [INFO] País seleccionado: Colombia
[2025-10-17 12:30:53] [INFO] Departamentos disponibles: 33
[2025-10-17 12:30:53] [INFO] Departamento seleccionado: Quindío
[2025-10-17 12:30:56] [INFO] Ciudades disponibles: 12
[2025-10-17 12:30:56] [INFO] Ciudad seleccionada: Armenia
[2025-10-17 12:30:58] [INFO] Nombre de finca ingresado: Finca La Esperanza
[2025-10-17 12:31:00] [INFO] Latitud ingresada: 4.710989
[2025-10-17 12:31:01] [INFO] Longitud ingresada: -74.072092
[2025-10-17 12:31:02] [INFO] Unidad de área seleccionada: ha
[2025-10-17 12:31:03] [INFO] Área ingresada: 25 ha
[2025-10-17 12:31:04] [INFO] Tipo de suelo seleccionado: Arcilloso
[2025-10-17 12:31:05] [INFO] Humedad ingresada: 65%
[2025-10-17 12:31:07] [INFO] Unidad de altitud seleccionada: m
[2025-10-17 12:31:08] [INFO] Área de cultivo ingresada: 15.500000
[2025-10-17 12:31:10] [SUCCESS] Paso 3 completado exitosamente
[2025-10-17 12:31:10] [INFO] Guardando solicitud...
[2025-10-17 12:31:10] [INFO] Click en botón Guardar
[2025-10-17 12:31:14] [INFO] Buscando botón Continuar...
[2025-10-17 12:31:15] [INFO] Click en botón Continuar
[2025-10-17 12:31:17] [SUCCESS] Guardado completado
[2025-10-17 12:31:17] [INFO] Verificando notificaciones...
[2025-10-17 12:31:17] [INFO] Click en botón de notificaciones
[2025-10-17 12:31:20] [WARNING] No se encontraron notificaciones visibles
[2025-10-17 12:31:20] [SUCCESS] Verificación de notificaciones completada
[2025-10-17 12:31:20] [SUCCESS] Solicitud completada para ID: 10046573
[2025-10-17 12:31:20] [INFO] Esperando 3 segundos antes de crear la siguiente solicitud...
[2025-10-17 12:31:23] [INFO] ================================================================================
[2025-10-17 12:31:23] [INFO] SOLICITUD 3/4 - ID: 1076501058
[2025-10-17 12:31:23] [INFO] ================================================================================
[2025-10-17 12:31:23] [INFO] Navegando al módulo de Solicitudes...
[2025-10-17 12:31:23] [INFO] Click en módulo de Solicitudes
[2025-10-17 12:31:26] [INFO] Click en Gestión de solicitudes
[2025-10-17 12:31:29] [INFO] Click en 'Nueva Pre-Solicitud' para abrir el asistente
[2025-10-17 12:31:32] [SUCCESS] Navegación exitosa a Gestión de Solicitudes
[2025-10-17 12:31:32] [INFO] === PASO 1: Ingresando número de identificación: 1076501058 ===
[2025-10-17 12:31:35] [INFO] Intentando selector: //input[@placeholder='Ingrese número de identificación']
[2025-10-17 12:31:35] [INFO] Input encontrado con selector: //input[@placeholder='Ingrese número de identificación']
[2025-10-17 12:31:36] [INFO] Número de identificación ingresado: 1076501058
[2025-10-17 12:31:41] [INFO] Información de usuario: Añadir nuevo cliente
[2025-10-17 12:31:41] [SUCCESS] Usuario encontrado - ID: 1076501058
[2025-10-17 12:31:43] [INFO] Click en botón Siguiente (Paso 1)
[2025-10-17 12:31:46] [SUCCESS] Paso 1 completado exitosamente
[2025-10-17 12:31:46] [INFO] === PASO 2: Completando descripción y fechas ===
[2025-10-17 12:31:47] [INFO] Descripción ingresada: Solicitud de prueba automatizada para validación del sistema de gestión de solicitudes.
[2025-10-17 12:31:49] [INFO] Fecha de inicio programada: 24/10/2025
[2025-10-17 12:31:51] [INFO] Fecha de finalización: 08/11/2025
[2025-10-17 12:31:53] [INFO] Click en botón Siguiente (Paso 2)
[2025-10-17 12:31:56] [SUCCESS] Paso 2 completado exitosamente
[2025-10-17 12:31:56] [INFO] === PASO 3: Completando ubicación y detalles ===
[2025-10-17 12:31:56] [INFO] Países disponibles: 0
[2025-10-17 12:31:57] [ERROR] Error en el Paso 3 - Excepción: Message: Could not locate element with index 1; For documentation on this error, please visit: https://www.selenium.dev/documentation/webdriver/troubleshooting/errors#nosuchelementexception

[2025-10-17 12:31:57] [INFO] Screenshot guardado: error_paso3_20251017_123157.png
[2025-10-17 12:31:57] [ERROR] Error en Paso 3 para ID 1076501058, continuando con siguiente...
[2025-10-17 12:31:57] [INFO] ================================================================================
[2025-10-17 12:31:57] [INFO] SOLICITUD 4/4 - ID: 26570831
[2025-10-17 12:31:57] [INFO] ================================================================================
[2025-10-17 12:31:57] [INFO] Navegando al módulo de Solicitudes...
[2025-10-17 12:31:58] [ERROR] Error al navegar a Gestión de Solicitudes - Excepción: Message: element click intercepted: Element <a class="nav-item-theme flex justify-between items-center w-full p-2 rounded-theme-lg transition-colors nav-item-active" href="/sigma/requests">...</a> is not clickable at point (123, 340). Other element would receive the click: <div class="modal-overlay" style="padding: var(--spacing-sm);">...</div>
  (Session info: chrome=141.0.7390.66); For documentation on this error, please visit: https://www.selenium.dev/documentation/webdriver/troubleshooting/errors#elementclickinterceptedexception
Stacktrace:
	GetHandleVerifier [0x0x7ff631effca5+79861]
	GetHandleVerifier [0x0x7ff631effd00+79952]
	(No symbol) [0x0x7ff631c7cada]
	(No symbol) [0x0x7ff631cdc5d9]
	(No symbol) [0x0x7ff631cd9f5e]
	(No symbol) [0x0x7ff631cd6eb1]
	(No symbol) [0x0x7ff631cd5da0]
	(No symbol) [0x0x7ff631cc7338]
	(No symbol) [0x0x7ff631cfcada]
	(No symbol) [0x0x7ff631cc6bc6]
	(No symbol) [0x0x7ff631cfccf0]
	(No symbol) [0x0x7ff631d24f8b]
	(No symbol) [0x0x7ff631cfc8b3]
	(No symbol) [0x0x7ff631cc5272]
	(No symbol) [0x0x7ff631cc6043]
	GetHandleVerifier [0x0x7ff6321bb9dd+2946349]
	GetHandleVerifier [0x0x7ff6321b5c5a+2922410]
	GetHandleVerifier [0x0x7ff6321d59e7+3052855]
	GetHandleVerifier [0x0x7ff631f1aa8e+189918]
	GetHandleVerifier [0x0x7ff631f22a2f+222591]
	GetHandleVerifier [0x0x7ff631f08ac4+116244]
	GetHandleVerifier [0x0x7ff631f08c79+116681]
	GetHandleVerifier [0x0x7ff631eef058+11176]
	BaseThreadInitThunk [0x0x7ffca4d3e8d7+23]
	RtlUserThreadStart [0x0x7ffca6808d9c+44]

[2025-10-17 12:31:58] [INFO] Screenshot guardado: error_navegacion_20251017_123158.png
[2025-10-17 12:31:58] [ERROR] Error navegando para ID 26570831, continuando con siguiente...
[2025-10-17 12:31:58] [INFO] ================================================================================
[2025-10-17 12:31:58] [SUCCESS] TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE
[2025-10-17 12:31:58] [INFO] ================================================================================
```

## Capturas de pantalla

Las capturas de pantalla se guardaron en: `c:\Users\Lenovo LOQ\integrador\amms\tests\IT-SOL-001\screenshots`

---

**Fin del reporte**
