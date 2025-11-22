# Reporte de Caso de Prueba IT-GD-001

## Información General

| Campo | Valor |
|-------|-------|
| **ID del Caso** | IT-GD-001 |
| **Título** | Registro completo de dispositivo y validación de integración con sistema de monitoreo |
| **HU Cubiertas** | HU-GD-001 (Registrar nuevo dispositivo), HU-MS-002 (Iniciar monitoreo de solicitud) |
| **Fecha de Ejecución** | [Por diligenciar] |
| **Ejecutado por** | [Por diligenciar] |
| **Estado** | [Por diligenciar] |

---

## Descripción del Caso de Prueba

Verificar el proceso integral de registro de un dispositivo GPS/CAN con todos sus parámetros de monitoreo, validando que queda correctamente habilitado para integración automática con el sistema de monitoreo cuando exista una solicitud activa asociada a la maquinaria.

---

## Precondiciones

- [x] Usuario autenticado con permisos de registro de dispositivos
- [x] Submódulo de Gestión de Dispositivos disponible
- [x] Sistema de monitoreo operativo y accesible
- [x] Base de datos limpia o con IMEI único no registrado previamente
- [x] Conectividad con el servidor de telemetría
- [x] ChromeDriver configurado correctamente
- [x] Credenciales en archivo .env

---

## Datos de Entrada

| Campo | Valor | Tipo |
|-------|-------|------|
| **Nombre del Dispositivo** | Generado automáticamente con timestamp | Único |
| **IMEI** | 15 dígitos aleatorios (algoritmo Luhn) | Único |
| **Parámetros de Monitoreo** | 5 parámetros seleccionados | Requerido |

### Parámetros de Monitoreo Seleccionados:
1. Estado de Ignición
2. Velocidad Actual
3. Ubicación GPS
4. Nivel de Combustible
5. Temperatura del Motor

---

## Pasos Ejecutados

| # | Paso | Acción | Resultado Esperado | Resultado Obtenido | Estado |
|---|------|--------|-------------------|-------------------|--------|
| 1 | **Arrange** | Generar datos únicos de prueba | Datos generados correctamente | [Por diligenciar] | ⬜ |
| 2 | **Arrange** | Configurar driver y realizar login | Login exitoso | [Por diligenciar] | ⬜ |
| 3 | **Act** | Navegar al menú "Monitoreo" | Menú desplegado | [Por diligenciar] | ⬜ |
| 4 | **Act** | Acceder a "Gestión de Dispositivos" | Página cargada correctamente | [Por diligenciar] | ⬜ |
| 5 | **Act** | Hacer clic en "Nuevo Dispositivo" | Modal abierto | [Por diligenciar] | ⬜ |
| 6 | **Act** | Ingresar nombre del dispositivo | Campo completado | [Por diligenciar] | ⬜ |
| 7 | **Act** | Ingresar IMEI de 15 dígitos | Campo completado con validación | [Por diligenciar] | ⬜ |
| 8 | **Act** | Seleccionar 5 parámetros de monitoreo | Checkboxes marcados | [Por diligenciar] | ⬜ |
| 9 | **Act** | Presionar botón "Registrar" | Formulario enviado | [Por diligenciar] | ⬜ |
| 10 | **Assert** | Verificar mensaje de éxito | "Dispositivo registrado exitosamente" | [Por diligenciar] | ⬜ |
| 11 | **Assert** | Verificar dispositivo en lista | Dispositivo visible en tabla | [Por diligenciar] | ⬜ |
| 12 | **Assert** | Intentar registrar dispositivo duplicado | Sistema rechaza con mensaje de error | [Por diligenciar] | ⬜ |
| 13 | **Assert** | Verificar validación de duplicado | Error mostrado, formulario abierto | [Por diligenciar] | ⬜ |

---

## Resultados Esperados vs Obtenidos

### ✅ Criterios de Aceptación

| Criterio | Esperado | Obtenido | Estado |
|----------|----------|----------|--------|
| Registro en BD | Dispositivo almacenado con todos los parámetros | [Por diligenciar] | ⬜ |
| Mensaje de confirmación | "Dispositivo registrado exitosamente" visible | [Por diligenciar] | ⬜ |
| Datos registrados | Nombre, IMEI, parámetros, fecha, usuario | [Por diligenciar] | ⬜ |
| Historial/Auditoría | Acción registrada en el sistema | [Por diligenciar] | ⬜ |
| Integración con monitoreo | Dispositivo habilitado para monitoreo automático | [Por diligenciar] | ⬜ |
| Validación de duplicados | Sistema rechaza IMEI duplicado correctamente | [Por diligenciar] | ⬜ |
| Mensaje de error duplicado | Error claro y específico | [Por diligenciar] | ⬜ |

---

## Evidencias

### Capturas de Pantalla

1. **Login exitoso**: `screenshot_login_success_[timestamp].png`
2. **Página de Gestión de Dispositivos**: `screenshot_devices_management_page_[timestamp].png`
3. **Modal de registro abierto**: `screenshot_modal_opened_[timestamp].png`
4. **Formulario completado**: `screenshot_form_filled_[timestamp].png`
5. **Registro exitoso**: `screenshot_registration_success_[timestamp].png`
6. **Dispositivo en lista**: `screenshot_device_in_list_[timestamp].png`
7. **Intento de duplicado**: `screenshot_form_filled_duplicate_[timestamp].png`
8. **Validación de duplicado**: `screenshot_duplicate_error_validation_[timestamp].png`
9. **Estado final**: `screenshot_final_state_[timestamp].png`

### Reportes Generados

- **Reporte JSON**: `IT_GD_001_Report_[timestamp].json`
  - Contiene datos de prueba utilizados
  - Resultado detallado de cada paso
  - Timestamps de ejecución
  - Resumen con tasa de éxito

---

## Datos de Prueba Utilizados

### Registro Inicial (Exitoso)
```
Nombre: Dispositivo GPS Test [timestamp]
IMEI: [15 dígitos generados aleatoriamente]
Parámetros: 5 seleccionados
```

### Prueba de Duplicado
```
Nombre: Dispositivo GPS Test [timestamp] (mismo que inicial)
IMEI: [mismo IMEI del registro inicial]
```

---

## Defectos Encontrados

| ID Defecto | Descripción | Severidad | Estado |
|------------|-------------|-----------|--------|
| - | [Por diligenciar si aplica] | - | - |

---

## Observaciones y Notas

- El test genera datos únicos automáticamente en cada ejecución
- Se utiliza el algoritmo de Luhn para generar IMEIs válidos
- La prueba incluye validación de duplicados como caso de prueba adicional
- Screenshots automáticos en cada paso importante
- Reporte JSON detallado para análisis posterior

---

## Configuración del Entorno

| Elemento | Valor |
|----------|-------|
| **SO** | Windows |
| **Navegador** | Chrome (versión más reciente) |
| **Driver** | ChromeDriver |
| **URL Base** | http://localhost:3000/sigma |
| **Framework** | Selenium WebDriver |
| **Lenguaje** | Python 3.x |

---

## Conclusión

**Estado Final**: [Por diligenciar - ✅ Exitoso / ❌ Fallido / ⚠️ Con observaciones]

**Resumen**: [Por diligenciar - Descripción breve del resultado general de la prueba]

**Recomendaciones**: [Por diligenciar - Acciones a tomar basadas en los resultados]

---

## Firma

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| **Ejecutor** | [Por diligenciar] | [Por diligenciar] | __________ |
| **Revisor** | [Por diligenciar] | [Por diligenciar] | __________ |

---

**Nota**: Este reporte es generado automáticamente por el script de automatización. Los campos marcados como "[Por diligenciar]" deben ser completados manualmente después de la ejecución.
