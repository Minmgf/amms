# IT-SOL-001: Reporte de Prueba de Gestión de Solicitudes

**Fecha de ejecución:** 2025-10-21 18:50:40

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
[2025-10-21 18:49:21] [INFO] ================================================================================
[2025-10-21 18:49:21] [INFO] INICIANDO PRUEBA IT-SOL-001: GESTIÓN DE SOLICITUDES
[2025-10-21 18:49:21] [INFO] ================================================================================
[2025-10-21 18:49:21] [INFO] Configurando driver de Selenium...
[2025-10-21 18:49:22] [SUCCESS] Driver configurado correctamente
[2025-10-21 18:49:22] [INFO] Iniciando proceso de login...
[2025-10-21 18:49:25] [INFO] Email ingresado: camilomchis1@gmail.com
[2025-10-21 18:49:25] [INFO] Contraseña ingresada
[2025-10-21 18:49:25] [INFO] Click en botón de login
[2025-10-21 18:49:29] [SUCCESS] Login exitoso
[2025-10-21 18:49:29] [INFO] ================================================================================
[2025-10-21 18:49:29] [INFO] SOLICITUD 1/4 - ID: 1075262391
[2025-10-21 18:49:29] [INFO] ================================================================================
[2025-10-21 18:49:29] [INFO] Navegando al módulo de Solicitudes...
[2025-10-21 18:49:29] [INFO] Click en módulo de Solicitudes
[2025-10-21 18:49:31] [INFO] Click en Gestión de solicitudes
[2025-10-21 18:49:34] [INFO] Click en 'Nueva Pre-Solicitud' para abrir el asistente
[2025-10-21 18:49:37] [SUCCESS] Navegación exitosa a Gestión de Solicitudes
[2025-10-21 18:49:37] [INFO] === PASO 1: Ingresando número de identificación: 1075262391 ===
[2025-10-21 18:49:40] [INFO] Intentando selector: //input[@placeholder='Ingrese número de identificación']
[2025-10-21 18:49:40] [INFO] Input encontrado con selector: //input[@placeholder='Ingrese número de identificación']
[2025-10-21 18:49:42] [INFO] Número de identificación ingresado: 1075262391
[2025-10-21 18:49:47] [INFO] Información de usuario: Añadir nuevo cliente
[2025-10-21 18:49:47] [SUCCESS] Usuario encontrado - ID: 1075262391
[2025-10-21 18:49:49] [INFO] Click en botón Siguiente (Paso 1)
[2025-10-21 18:49:52] [SUCCESS] Paso 1 completado exitosamente
[2025-10-21 18:49:52] [INFO] === PASO 2: Completando descripción y fechas ===
[2025-10-21 18:49:52] [INFO] Descripción ingresada: Solicitud de prueba automatizada para validación del sistema de gestión de solicitudes.
[2025-10-21 18:49:54] [INFO] Fechas generadas aleatoriamente para 2026:
[2025-10-21 18:49:54] [INFO]   - Inicio: 28/03/2026
[2025-10-21 18:49:54] [INFO]   - Finalización: 17/04/2026
[2025-10-21 18:49:54] [INFO]   - Duración: 20 días
[2025-10-21 18:49:54] [INFO] Fecha de inicio programada ingresada: 28/03/2026
[2025-10-21 18:49:57] [INFO] Fecha de finalización ingresada: 17/04/2026
[2025-10-21 18:49:59] [INFO] Click en botón Siguiente (Paso 2)
[2025-10-21 18:50:02] [SUCCESS] Paso 2 completado exitosamente
[2025-10-21 18:50:02] [INFO] === PASO 3: Completando ubicación y detalles ===
[2025-10-21 18:50:02] [INFO] Países disponibles: 250
[2025-10-21 18:50:02] [INFO] País seleccionado: Colombia
[2025-10-21 18:50:05] [INFO] Departamentos disponibles: 33
[2025-10-21 18:50:06] [INFO] Departamento seleccionado: Quindío
[2025-10-21 18:50:09] [INFO] Ciudades disponibles: 12
[2025-10-21 18:50:09] [INFO] Ciudad seleccionada: Armenia
[2025-10-21 18:50:11] [INFO] Nombre de finca ingresado: Finca La Esperanza
[2025-10-21 18:50:12] [INFO] Latitud ingresada: 4.710989
[2025-10-21 18:50:13] [INFO] Longitud ingresada: -74.072092
[2025-10-21 18:50:14] [INFO] Unidad de área seleccionada: ha
[2025-10-21 18:50:15] [INFO] Área ingresada: 25 ha
[2025-10-21 18:50:16] [INFO] Unidad de altitud seleccionada: m
[2025-10-21 18:50:17] [INFO] Altitud ingresada: 1500.000000 m
[2025-10-21 18:50:19] [SUCCESS] Paso 3 completado exitosamente
[2025-10-21 18:50:19] [INFO] Guardando solicitud...
[2025-10-21 18:50:20] [INFO] Click en botón Guardar
[2025-10-21 18:50:24] [INFO] Buscando botón Continuar...
[2025-10-21 18:50:25] [INFO] Click en botón Continuar
[2025-10-21 18:50:27] [SUCCESS] Guardado completado
[2025-10-21 18:50:27] [INFO] Verificando notificaciones...
[2025-10-21 18:50:27] [INFO] Click en botón de notificaciones
[2025-10-21 18:50:30] [WARNING] No se encontraron notificaciones visibles
[2025-10-21 18:50:30] [SUCCESS] Verificación de notificaciones completada
[2025-10-21 18:50:30] [SUCCESS] Solicitud completada para ID: 1075262391
[2025-10-21 18:50:30] [INFO] Esperando 3 segundos antes de crear la siguiente solicitud...
[2025-10-21 18:50:33] [INFO] ================================================================================
[2025-10-21 18:50:33] [INFO] SOLICITUD 2/4 - ID: 10046573
[2025-10-21 18:50:33] [INFO] ================================================================================
[2025-10-21 18:50:33] [INFO] Navegando al módulo de Solicitudes...
[2025-10-21 18:50:34] [ERROR] Error al navegar a Gestión de Solicitudes - Excepción: Message: element click intercepted: Element <a class="nav-item-theme flex justify-between items-center w-full p-2 rounded-theme-lg transition-colors nav-item-active" href="/sigma/requests">...</a> is not clickable at point (123, 340). Other element would receive the click: <div class="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
  (Session info: chrome=141.0.7390.108); For documentation on this error, please visit: https://www.selenium.dev/documentation/webdriver/troubleshooting/errors#elementclickinterceptedexception
Stacktrace:
	GetHandleVerifier [0x0x7ff7c00b1eb5+80197]
	GetHandleVerifier [0x0x7ff7c00b1f10+80288]
	(No symbol) [0x0x7ff7bfe302fa]
	(No symbol) [0x0x7ff7bfe8fe69]
	(No symbol) [0x0x7ff7bfe8d7ee]
	(No symbol) [0x0x7ff7bfe8a731]
	(No symbol) [0x0x7ff7bfe89620]
	(No symbol) [0x0x7ff7bfe7abc8]
	(No symbol) [0x0x7ff7bfeb037a]
	(No symbol) [0x0x7ff7bfe7a456]
	(No symbol) [0x0x7ff7bfeb0590]
	(No symbol) [0x0x7ff7bfed87fb]
	(No symbol) [0x0x7ff7bfeb0153]
	(No symbol) [0x0x7ff7bfe78b02]
	(No symbol) [0x0x7ff7bfe798d3]
	GetHandleVerifier [0x0x7ff7c036e83d+2949837]
	GetHandleVerifier [0x0x7ff7c0368c6a+2926330]
	GetHandleVerifier [0x0x7ff7c03886c7+3055959]
	GetHandleVerifier [0x0x7ff7c00ccfee+191102]
	GetHandleVerifier [0x0x7ff7c00d50af+224063]
	GetHandleVerifier [0x0x7ff7c00baf64+117236]
	GetHandleVerifier [0x0x7ff7c00bb119+117673]
	GetHandleVerifier [0x0x7ff7c00a10a8+11064]
	BaseThreadInitThunk [0x0x7ffbff40e8d7+23]
	RtlUserThreadStart [0x0x7ffc0018c53c+44]

[2025-10-21 18:50:34] [INFO] Screenshot guardado: error_navegacion_20251021_185034.png
[2025-10-21 18:50:34] [ERROR] Error navegando para ID 10046573, continuando con siguiente...
[2025-10-21 18:50:34] [INFO] ================================================================================
[2025-10-21 18:50:34] [INFO] SOLICITUD 3/4 - ID: 1076501058
[2025-10-21 18:50:34] [INFO] ================================================================================
[2025-10-21 18:50:34] [INFO] Navegando al módulo de Solicitudes...
[2025-10-21 18:50:35] [ERROR] Error al navegar a Gestión de Solicitudes - Excepción: Message: element click intercepted: Element <a class="nav-item-theme flex justify-between items-center w-full p-2 rounded-theme-lg transition-colors nav-item-active" href="/sigma/requests">...</a> is not clickable at point (123, 340). Other element would receive the click: <div class="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
  (Session info: chrome=141.0.7390.108); For documentation on this error, please visit: https://www.selenium.dev/documentation/webdriver/troubleshooting/errors#elementclickinterceptedexception
Stacktrace:
	GetHandleVerifier [0x0x7ff7c00b1eb5+80197]
	GetHandleVerifier [0x0x7ff7c00b1f10+80288]
	(No symbol) [0x0x7ff7bfe302fa]
	(No symbol) [0x0x7ff7bfe8fe69]
	(No symbol) [0x0x7ff7bfe8d7ee]
	(No symbol) [0x0x7ff7bfe8a731]
	(No symbol) [0x0x7ff7bfe89620]
	(No symbol) [0x0x7ff7bfe7abc8]
	(No symbol) [0x0x7ff7bfeb037a]
	(No symbol) [0x0x7ff7bfe7a456]
	(No symbol) [0x0x7ff7bfeb0590]
	(No symbol) [0x0x7ff7bfed87fb]
	(No symbol) [0x0x7ff7bfeb0153]
	(No symbol) [0x0x7ff7bfe78b02]
	(No symbol) [0x0x7ff7bfe798d3]
	GetHandleVerifier [0x0x7ff7c036e83d+2949837]
	GetHandleVerifier [0x0x7ff7c0368c6a+2926330]
	GetHandleVerifier [0x0x7ff7c03886c7+3055959]
	GetHandleVerifier [0x0x7ff7c00ccfee+191102]
	GetHandleVerifier [0x0x7ff7c00d50af+224063]
	GetHandleVerifier [0x0x7ff7c00baf64+117236]
	GetHandleVerifier [0x0x7ff7c00bb119+117673]
	GetHandleVerifier [0x0x7ff7c00a10a8+11064]
	BaseThreadInitThunk [0x0x7ffbff40e8d7+23]
	RtlUserThreadStart [0x0x7ffc0018c53c+44]

[2025-10-21 18:50:35] [INFO] Screenshot guardado: error_navegacion_20251021_185035.png
[2025-10-21 18:50:35] [ERROR] Error navegando para ID 1076501058, continuando con siguiente...
[2025-10-21 18:50:35] [INFO] ================================================================================
[2025-10-21 18:50:35] [INFO] SOLICITUD 4/4 - ID: 26570831
[2025-10-21 18:50:35] [INFO] ================================================================================
[2025-10-21 18:50:35] [INFO] Navegando al módulo de Solicitudes...
[2025-10-21 18:50:37] [ERROR] Error al navegar a Gestión de Solicitudes - Excepción: Message: element click intercepted: Element <a class="nav-item-theme flex justify-between items-center w-full p-2 rounded-theme-lg transition-colors nav-item-active" href="/sigma/requests">...</a> is not clickable at point (123, 340). Other element would receive the click: <div class="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
  (Session info: chrome=141.0.7390.108); For documentation on this error, please visit: https://www.selenium.dev/documentation/webdriver/troubleshooting/errors#elementclickinterceptedexception
Stacktrace:
	GetHandleVerifier [0x0x7ff7c00b1eb5+80197]
	GetHandleVerifier [0x0x7ff7c00b1f10+80288]
	(No symbol) [0x0x7ff7bfe302fa]
	(No symbol) [0x0x7ff7bfe8fe69]
	(No symbol) [0x0x7ff7bfe8d7ee]
	(No symbol) [0x0x7ff7bfe8a731]
	(No symbol) [0x0x7ff7bfe89620]
	(No symbol) [0x0x7ff7bfe7abc8]
	(No symbol) [0x0x7ff7bfeb037a]
	(No symbol) [0x0x7ff7bfe7a456]
	(No symbol) [0x0x7ff7bfeb0590]
	(No symbol) [0x0x7ff7bfed87fb]
	(No symbol) [0x0x7ff7bfeb0153]
	(No symbol) [0x0x7ff7bfe78b02]
	(No symbol) [0x0x7ff7bfe798d3]
	GetHandleVerifier [0x0x7ff7c036e83d+2949837]
	GetHandleVerifier [0x0x7ff7c0368c6a+2926330]
	GetHandleVerifier [0x0x7ff7c03886c7+3055959]
	GetHandleVerifier [0x0x7ff7c00ccfee+191102]
	GetHandleVerifier [0x0x7ff7c00d50af+224063]
	GetHandleVerifier [0x0x7ff7c00baf64+117236]
	GetHandleVerifier [0x0x7ff7c00bb119+117673]
	GetHandleVerifier [0x0x7ff7c00a10a8+11064]
	BaseThreadInitThunk [0x0x7ffbff40e8d7+23]
	RtlUserThreadStart [0x0x7ffc0018c53c+44]

[2025-10-21 18:50:37] [INFO] Screenshot guardado: error_navegacion_20251021_185037.png
[2025-10-21 18:50:37] [ERROR] Error navegando para ID 26570831, continuando con siguiente...
[2025-10-21 18:50:37] [INFO] ================================================================================
[2025-10-21 18:50:37] [SUCCESS] TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE
[2025-10-21 18:50:37] [INFO] ================================================================================
```

## Capturas de pantalla

Las capturas de pantalla se guardaron en: `C:\Users\camil\OneDrive\Escritorio\amms\tests\IT-SOL-001\screenshots`

---

**Fin del reporte**
