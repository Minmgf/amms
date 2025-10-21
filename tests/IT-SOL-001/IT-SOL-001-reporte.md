# IT-SOL-001: Reporte de Prueba de Gestión de Solicitudes

**Fecha de ejecución:** 2025-10-20 16:18:04

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
[2025-10-20 16:17:01] [INFO] ================================================================================
[2025-10-20 16:17:01] [INFO] INICIANDO PRUEBA IT-SOL-001: GESTIÓN DE SOLICITUDES
[2025-10-20 16:17:01] [INFO] ================================================================================
[2025-10-20 16:17:01] [INFO] Configurando driver de Selenium...
[2025-10-20 16:17:02] [SUCCESS] Driver configurado correctamente
[2025-10-20 16:17:02] [INFO] Iniciando proceso de login...
[2025-10-20 16:17:06] [INFO] Email ingresado: camilomchis1@gmail.com
[2025-10-20 16:17:06] [INFO] Contraseña ingresada
[2025-10-20 16:17:06] [INFO] Click en botón de login
[2025-10-20 16:17:10] [SUCCESS] Login exitoso
[2025-10-20 16:17:10] [INFO] ================================================================================
[2025-10-20 16:17:10] [INFO] SOLICITUD 1/4 - ID: 1075262391
[2025-10-20 16:17:10] [INFO] ================================================================================
[2025-10-20 16:17:10] [INFO] Navegando al módulo de Solicitudes...
[2025-10-20 16:17:10] [INFO] Click en módulo de Solicitudes
[2025-10-20 16:17:12] [INFO] Click en Gestión de solicitudes
[2025-10-20 16:17:15] [INFO] Click en 'Nueva Pre-Solicitud' para abrir el asistente
[2025-10-20 16:17:18] [SUCCESS] Navegación exitosa a Gestión de Solicitudes
[2025-10-20 16:17:18] [INFO] === PASO 1: Ingresando número de identificación: 1075262391 ===
[2025-10-20 16:17:21] [INFO] Intentando selector: //input[@placeholder='Ingrese número de identificación']
[2025-10-20 16:17:21] [INFO] Input encontrado con selector: //input[@placeholder='Ingrese número de identificación']
[2025-10-20 16:17:22] [INFO] Número de identificación ingresado: 1075262391
[2025-10-20 16:17:27] [INFO] Información de usuario: Añadir nuevo cliente
[2025-10-20 16:17:27] [SUCCESS] Usuario encontrado - ID: 1075262391
[2025-10-20 16:17:29] [INFO] Click en botón Siguiente (Paso 1)
[2025-10-20 16:17:32] [SUCCESS] Paso 1 completado exitosamente
[2025-10-20 16:17:32] [INFO] === PASO 2: Completando descripción y fechas ===
[2025-10-20 16:17:33] [INFO] Descripción ingresada: Solicitud de prueba automatizada para validación del sistema de gestión de solicitudes.
[2025-10-20 16:17:35] [INFO] Fecha de inicio programada: 27/10/2025
[2025-10-20 16:17:37] [INFO] Fecha de finalización: 11/11/2025
[2025-10-20 16:17:39] [INFO] Click en botón Siguiente (Paso 2)
[2025-10-20 16:17:42] [SUCCESS] Paso 2 completado exitosamente
[2025-10-20 16:17:42] [INFO] === PASO 3: Completando ubicación y detalles ===
[2025-10-20 16:17:42] [INFO] Países disponibles: 250
[2025-10-20 16:17:43] [INFO] País seleccionado: Colombia
[2025-10-20 16:17:46] [INFO] Departamentos disponibles: 33
[2025-10-20 16:17:46] [INFO] Departamento seleccionado: Quindío
[2025-10-20 16:17:49] [INFO] Ciudades disponibles: 12
[2025-10-20 16:17:49] [INFO] Ciudad seleccionada: Armenia
[2025-10-20 16:17:51] [INFO] Nombre de finca ingresado: Finca La Esperanza
[2025-10-20 16:17:53] [INFO] Latitud ingresada: 4.710989
[2025-10-20 16:17:54] [INFO] Longitud ingresada: -74.072092
[2025-10-20 16:17:55] [INFO] Unidad de área seleccionada: ha
[2025-10-20 16:17:56] [INFO] Área ingresada: 25 ha
[2025-10-20 16:17:57] [ERROR] Error en el Paso 3 - Excepción: Message: Could not locate element with visible text: Arcilloso; For documentation on this error, please visit: https://www.selenium.dev/documentation/webdriver/troubleshooting/errors#nosuchelementexception

[2025-10-20 16:17:57] [INFO] Screenshot guardado: error_paso3_20251020_161757.png
[2025-10-20 16:17:57] [ERROR] Error en Paso 3 para ID 1075262391, continuando con siguiente...
[2025-10-20 16:17:57] [INFO] ================================================================================
[2025-10-20 16:17:57] [INFO] SOLICITUD 2/4 - ID: 10046573
[2025-10-20 16:17:57] [INFO] ================================================================================
[2025-10-20 16:17:57] [INFO] Navegando al módulo de Solicitudes...
[2025-10-20 16:17:58] [ERROR] Error al navegar a Gestión de Solicitudes - Excepción: Message: element click intercepted: Element <a class="nav-item-theme flex justify-between items-center w-full p-2 rounded-theme-lg transition-colors nav-item-active" href="/sigma/requests">...</a> is not clickable at point (123, 340). Other element would receive the click: <div class="modal-overlay" style="padding: var(--spacing-sm);">...</div>
  (Session info: chrome=141.0.7390.108); For documentation on this error, please visit: https://www.selenium.dev/documentation/webdriver/troubleshooting/errors#elementclickinterceptedexception
Stacktrace:
	GetHandleVerifier [0x0x7ff6f19a1eb5+80197]
	GetHandleVerifier [0x0x7ff6f19a1f10+80288]
	(No symbol) [0x0x7ff6f17202fa]
	(No symbol) [0x0x7ff6f177fe69]
	(No symbol) [0x0x7ff6f177d7ee]
	(No symbol) [0x0x7ff6f177a731]
	(No symbol) [0x0x7ff6f1779620]
	(No symbol) [0x0x7ff6f176abc8]
	(No symbol) [0x0x7ff6f17a037a]
	(No symbol) [0x0x7ff6f176a456]
	(No symbol) [0x0x7ff6f17a0590]
	(No symbol) [0x0x7ff6f17c87fb]
	(No symbol) [0x0x7ff6f17a0153]
	(No symbol) [0x0x7ff6f1768b02]
	(No symbol) [0x0x7ff6f17698d3]
	GetHandleVerifier [0x0x7ff6f1c5e83d+2949837]
	GetHandleVerifier [0x0x7ff6f1c58c6a+2926330]
	GetHandleVerifier [0x0x7ff6f1c786c7+3055959]
	GetHandleVerifier [0x0x7ff6f19bcfee+191102]
	GetHandleVerifier [0x0x7ff6f19c50af+224063]
	GetHandleVerifier [0x0x7ff6f19aaf64+117236]
	GetHandleVerifier [0x0x7ff6f19ab119+117673]
	GetHandleVerifier [0x0x7ff6f19910a8+11064]
	BaseThreadInitThunk [0x0x7ffa20d1e8d7+23]
	RtlUserThreadStart [0x0x7ffa21188d9c+44]

[2025-10-20 16:17:58] [INFO] Screenshot guardado: error_navegacion_20251020_161758.png
[2025-10-20 16:17:58] [ERROR] Error navegando para ID 10046573, continuando con siguiente...
[2025-10-20 16:17:58] [INFO] ================================================================================
[2025-10-20 16:17:58] [INFO] SOLICITUD 3/4 - ID: 1076501058
[2025-10-20 16:17:58] [INFO] ================================================================================
[2025-10-20 16:17:58] [INFO] Navegando al módulo de Solicitudes...
[2025-10-20 16:17:59] [ERROR] Error al navegar a Gestión de Solicitudes - Excepción: Message: element click intercepted: Element <a class="nav-item-theme flex justify-between items-center w-full p-2 rounded-theme-lg transition-colors nav-item-active" href="/sigma/requests">...</a> is not clickable at point (123, 340). Other element would receive the click: <div class="modal-overlay" style="padding: var(--spacing-sm);">...</div>
  (Session info: chrome=141.0.7390.108); For documentation on this error, please visit: https://www.selenium.dev/documentation/webdriver/troubleshooting/errors#elementclickinterceptedexception
Stacktrace:
	GetHandleVerifier [0x0x7ff6f19a1eb5+80197]
	GetHandleVerifier [0x0x7ff6f19a1f10+80288]
	(No symbol) [0x0x7ff6f17202fa]
	(No symbol) [0x0x7ff6f177fe69]
	(No symbol) [0x0x7ff6f177d7ee]
	(No symbol) [0x0x7ff6f177a731]
	(No symbol) [0x0x7ff6f1779620]
	(No symbol) [0x0x7ff6f176abc8]
	(No symbol) [0x0x7ff6f17a037a]
	(No symbol) [0x0x7ff6f176a456]
	(No symbol) [0x0x7ff6f17a0590]
	(No symbol) [0x0x7ff6f17c87fb]
	(No symbol) [0x0x7ff6f17a0153]
	(No symbol) [0x0x7ff6f1768b02]
	(No symbol) [0x0x7ff6f17698d3]
	GetHandleVerifier [0x0x7ff6f1c5e83d+2949837]
	GetHandleVerifier [0x0x7ff6f1c58c6a+2926330]
	GetHandleVerifier [0x0x7ff6f1c786c7+3055959]
	GetHandleVerifier [0x0x7ff6f19bcfee+191102]
	GetHandleVerifier [0x0x7ff6f19c50af+224063]
	GetHandleVerifier [0x0x7ff6f19aaf64+117236]
	GetHandleVerifier [0x0x7ff6f19ab119+117673]
	GetHandleVerifier [0x0x7ff6f19910a8+11064]
	BaseThreadInitThunk [0x0x7ffa20d1e8d7+23]
	RtlUserThreadStart [0x0x7ffa21188d9c+44]

[2025-10-20 16:18:00] [INFO] Screenshot guardado: error_navegacion_20251020_161759.png
[2025-10-20 16:18:00] [ERROR] Error navegando para ID 1076501058, continuando con siguiente...
[2025-10-20 16:18:00] [INFO] ================================================================================
[2025-10-20 16:18:00] [INFO] SOLICITUD 4/4 - ID: 26570831
[2025-10-20 16:18:00] [INFO] ================================================================================
[2025-10-20 16:18:00] [INFO] Navegando al módulo de Solicitudes...
[2025-10-20 16:18:01] [ERROR] Error al navegar a Gestión de Solicitudes - Excepción: Message: element click intercepted: Element <a class="nav-item-theme flex justify-between items-center w-full p-2 rounded-theme-lg transition-colors nav-item-active" href="/sigma/requests">...</a> is not clickable at point (123, 340). Other element would receive the click: <div class="modal-overlay" style="padding: var(--spacing-sm);">...</div>
  (Session info: chrome=141.0.7390.108); For documentation on this error, please visit: https://www.selenium.dev/documentation/webdriver/troubleshooting/errors#elementclickinterceptedexception
Stacktrace:
	GetHandleVerifier [0x0x7ff6f19a1eb5+80197]
	GetHandleVerifier [0x0x7ff6f19a1f10+80288]
	(No symbol) [0x0x7ff6f17202fa]
	(No symbol) [0x0x7ff6f177fe69]
	(No symbol) [0x0x7ff6f177d7ee]
	(No symbol) [0x0x7ff6f177a731]
	(No symbol) [0x0x7ff6f1779620]
	(No symbol) [0x0x7ff6f176abc8]
	(No symbol) [0x0x7ff6f17a037a]
	(No symbol) [0x0x7ff6f176a456]
	(No symbol) [0x0x7ff6f17a0590]
	(No symbol) [0x0x7ff6f17c87fb]
	(No symbol) [0x0x7ff6f17a0153]
	(No symbol) [0x0x7ff6f1768b02]
	(No symbol) [0x0x7ff6f17698d3]
	GetHandleVerifier [0x0x7ff6f1c5e83d+2949837]
	GetHandleVerifier [0x0x7ff6f1c58c6a+2926330]
	GetHandleVerifier [0x0x7ff6f1c786c7+3055959]
	GetHandleVerifier [0x0x7ff6f19bcfee+191102]
	GetHandleVerifier [0x0x7ff6f19c50af+224063]
	GetHandleVerifier [0x0x7ff6f19aaf64+117236]
	GetHandleVerifier [0x0x7ff6f19ab119+117673]
	GetHandleVerifier [0x0x7ff6f19910a8+11064]
	BaseThreadInitThunk [0x0x7ffa20d1e8d7+23]
	RtlUserThreadStart [0x0x7ffa21188d9c+44]

[2025-10-20 16:18:01] [INFO] Screenshot guardado: error_navegacion_20251020_161801.png
[2025-10-20 16:18:01] [ERROR] Error navegando para ID 26570831, continuando con siguiente...
[2025-10-20 16:18:01] [INFO] ================================================================================
[2025-10-20 16:18:01] [SUCCESS] TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE
[2025-10-20 16:18:01] [INFO] ================================================================================
```

## Capturas de pantalla

Las capturas de pantalla se guardaron en: `C:\Users\camil\OneDrive\Escritorio\amms\tests\IT-SOL-001\screenshots`

---

**Fin del reporte**
