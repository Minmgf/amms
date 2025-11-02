# IT-GM-005: Verificar eliminación de mantenimiento sin asociaciones

## Descripción del Caso de Prueba

**Título:** Verificar eliminación de mantenimiento sin asociaciones  
**Historia de Usuario:** HU-GM-005  
**Tipo:** Prueba de Integración  
**Fecha:** 29/09/2025  
**Ejecutado por:** Juan Camilo  

### Descripción
Validar el flujo completo de creación y eliminación de mantenimiento sin asociaciones. La prueba crea un mantenimiento específico para luego eliminarlo, verificando que el mantenimiento pueda ser eliminado definitivamente del sistema y desaparezca del listado.

### Precondiciones
- Usuario con permisos de creación y eliminación de mantenimientos
- Aplicación funcionando en `http://localhost:3000/sigma`
- Acceso al módulo de gestión de mantenimientos

### Datos de Entrada
- **Credenciales de login:**
  - Email: `camilomchis1@gmail.com`
  - Password: `Juancamilobarranco1`
- **Datos del mantenimiento a crear:**
  - Nombre: "Prueba eliminacion [timestamp]"
  - Descripción: "Descripción de prueba para eliminación - [timestamp]"
  - Tipo: Preventivo (segunda opción disponible)

### Pasos de la Prueba (AAA)

#### Arrange (Preparación)
1. Realizar login con credenciales específicas
2. Navegar al módulo de gestión de mantenimientos
3. Verificar lista de mantenimientos existentes

#### Act (Acción)
4. **Crear mantenimiento:**
   - Hacer clic en "Agregar Mantenimiento"
   - Llenar formulario con datos únicos
   - Guardar el mantenimiento
5. **Eliminar mantenimiento:**
   - Buscar el mantenimiento recién creado
   - Hacer clic en el botón eliminar
   - Confirmar la eliminación

#### Assert (Verificación)
6. Verificar que el mantenimiento fue eliminado exitosamente
7. Confirmar que desaparece del listado
8. Verificar mensaje de confirmación al usuario

### Resultado Esperado
- Mantenimiento eliminado definitivamente
- Desaparece del listado
- Mensaje de confirmación mostrado al usuario

### Resultado Obtenido
_[Pendiente de ejecución]_

## Archivos del Caso de Prueba

### Estructura de Archivos
```
tests/IT-GM-005/
├── IT-GM-005.py          # Script principal de la prueba
├── test_config.py        # Configuración específica
├── README_IT_GM_005.md   # Esta documentación
├── chromedriver.exe      # Driver de Chrome para Selenium
├── screenshots/          # Capturas de pantalla (generadas automáticamente)
│   ├── screenshot_login_error_[timestamp].png
│   └── screenshot_IT_GM_005_final_[timestamp].png
├── reports/             # Reportes JSON (generados automáticamente)
│   └── IT_GM_005_Report_[timestamp].json
└── results/             # Resultados adicionales (generados automáticamente)
```

### Archivos Principales

#### `IT-GM-005.py`
Script principal que contiene la clase `TestITGM005DeleteMaintenanceWithoutAssociations` con los siguientes métodos:

- `setup_driver()`: Configuración del ChromeDriver
- `login_to_application()`: Realización del login
- `navigate_to_maintenance_management()`: Navegación al módulo
- `verify_maintenance_list()`: Verificación de la lista inicial
- `create_maintenance_for_deletion()`: **Creación de mantenimiento sin asociaciones**
- `find_maintenance_for_deletion()`: Búsqueda del mantenimiento creado
- `delete_maintenance()`: Eliminación del mantenimiento
- `confirm_deletion()`: Confirmación de la eliminación
- `verify_deletion_success()`: Verificación del éxito de eliminación
- `generate_report()`: Generación del reporte

#### `test_config.py`
Archivo de configuración que contiene:
- URL de la aplicación
- Credenciales específicas para esta prueba
- Configuración de ChromeDriver
- Timeouts y configuraciones adicionales

## Ejecución de la Prueba

### Prerrequisitos
1. **ChromeDriver:** Debe estar presente como `chromedriver.exe` en el directorio
2. **Aplicación:** Debe estar ejecutándose en `http://localhost:3000/sigma`
3. **Mantenimiento:** Debe existir un mantenimiento "Prueba eliminación" sin asociaciones
4. **Permisos:** El usuario debe tener permisos de eliminación

### Comando de Ejecución
```bash
cd tests/IT-GM-005
python IT-GM-005.py
```

### Salida Esperada
La prueba generará:
- Logs detallados en consola
- Screenshots en el directorio `screenshots/`
- Reporte JSON en el directorio `reports/`
- Resumen final con estadísticas

### Ejemplo de Salida
```
INICIANDO PRUEBA DE INTEGRACIÓN IT-GM-005: VERIFICAR ELIMINACIÓN DE MANTENIMIENTO SIN ASOCIACIONES
================================================================================
Configurando ChromeDriver...
ChromeDriver configurado correctamente
Realizando login...
Navegando a: http://localhost:3000/sigma/login
...
================================================================================
RESUMEN DE LA PRUEBA
================================================================================
Total de pasos: 7
Exitosos: 7
Fallidos: 0
Tasa de éxito: 100.0%

PRUEBA COMPLETADA EXITOSAMENTE
```

## Configuración Específica

### Credenciales
Este caso de prueba utiliza credenciales específicas diferentes a otros casos:
- **Email:** `camilomchis1@gmail.com`
- **Password:** `Juancamilobarranco1`

### Datos de Prueba
- **Nombre del mantenimiento:** "Prueba eliminación"
- **Descripción:** "Mantenimiento de prueba para verificar eliminación sin asociaciones"

## Reportes y Evidencias

### Screenshots
Se generan automáticamente screenshots en momentos clave en el directorio `screenshots/`:
- `screenshot_login_debug_[timestamp].png`
- `screenshot_login_error_[timestamp].png`
- `screenshot_IT_GM_005_final_[timestamp].png`

### Reporte JSON
El reporte se genera automáticamente en el directorio `reports/` e incluye:
- Información del caso de prueba
- Resultados detallados de cada paso
- Timestamps de ejecución
- Resumen estadístico
- Precondiciones y resultados esperados

### Estructura del Reporte
```json
{
  "test_name": "IT-GM-005: Verificar eliminación de mantenimiento sin asociaciones",
  "timestamp": "20250929_200443",
  "test_case": {
    "title": "Verificar eliminación de mantenimiento sin asociaciones",
    "description": "Validar eliminación definitiva de mantenimiento no asociado",
    "preconditions": [...],
    "expected_result": "..."
  },
  "results": [...],
  "summary": {
    "total_steps": 7,
    "passed": 7,
    "failed": 0
  }
}
```

## Troubleshooting

### Problemas Comunes

1. **ChromeDriver no encontrado**
   - Verificar que `chromedriver.exe` esté en el directorio
   - Descargar la versión compatible con Chrome instalado

2. **Login fallido**
   - Verificar que las credenciales sean correctas
   - Verificar que la aplicación esté ejecutándose
   - Revisar la URL en `test_config.py`

3. **Mantenimiento no encontrado**
   - Verificar que existe un mantenimiento "Prueba eliminación"
   - Verificar que no tiene asociaciones
   - Crear el mantenimiento manualmente si es necesario

4. **Botón eliminar no encontrado**
   - Verificar permisos del usuario
   - Verificar que la funcionalidad esté implementada
   - Revisar selectores en el código

### Logs de Debug
El script incluye logs detallados para facilitar el debugging:
- Información de elementos encontrados
- Selectores utilizados
- Estados de elementos
- URLs actuales
- Contenido de páginas

## Integración con Otros Casos

Este caso de prueba forma parte de la suite de pruebas de gestión de mantenimientos junto con:
- **IT-GM-003:** Actualizar Mantenimiento
- **IT-GM-004:** Eliminar Mantenimiento

Todos comparten la misma estructura base pero con configuraciones específicas para cada escenario.

## Funcionalidades Verificadas

### 🎯 Flujo Completo de Creación y Eliminación:
- ✅ **Login:** Autenticación con credenciales específicas (`camilomchis1@gmail.com`)
- ✅ **Navegación:** Acceso al módulo de gestión de mantenimientos
- ✅ **Visualización:** Lista de mantenimientos existentes
- ✅ **Creación:** Nuevo mantenimiento sin asociaciones con datos únicos
- ✅ **Búsqueda:** Localización del mantenimiento recién creado
- ✅ **Eliminación:** Proceso de eliminación del mantenimiento
- ✅ **Confirmación:** Verificación de eliminación exitosa
- ✅ **Evidencias:** Generación de reportes y screenshots

### 📋 Datos del Mantenimiento Creado:
- **Nombre:** "Prueba eliminacion [timestamp]" (único por ejecución)
- **Descripción:** "Descripción de prueba para eliminación - [timestamp]"
- **Tipo:** Preventivo (segunda opción disponible)
- **Estado:** Sin asociaciones a maquinarias

### 🔄 Flujo de la Prueba:
1. **Arrange:** Login y navegación al módulo
2. **Act:** Crear mantenimiento → Eliminar mantenimiento
3. **Assert:** Verificar eliminación exitosa y desaparición del listado
