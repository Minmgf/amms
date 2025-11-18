# IT-GD-001 - Automatización de Pruebas

## 📋 Descripción General

Carpeta de automatización para el caso de prueba **IT-GD-001**: Registro completo de dispositivo y validación de integración con sistema de monitoreo.

Esta automatización verifica el proceso integral de registro de un dispositivo GPS/CAN con todos sus parámetros de monitoreo, validando que queda correctamente habilitado para integración automática con el sistema de monitoreo.

## 🗂️ Estructura de Archivos

```
IT-GD-001/
├── IT-GD-001.py              # ⭐ Script principal de automatización
├── README.md                 # Este archivo
├── README_IT_GD_001.md       # Documentación detallada del caso de prueba
├── IT-GD-001-reporte.md      # Plantilla de reporte de ejecución
├── test_config.py            # Configuración y selectores
├── db_validator.py           # Validación en base de datos (opcional)
├── quick_test.py             # Script de prueba rápida para debugging
├── .gitignore                # Archivos a ignorar en git
├── screenshots/              # Capturas de pantalla generadas
└── reports/                  # Reportes JSON generados
```

## 🚀 Inicio Rápido

### 1. Requisitos Previos

```powershell
# Instalar dependencias
pip install selenium python-dotenv

# Opcional: para validación en BD
pip install psycopg2-binary
```

### 2. Configurar Credenciales

Asegurarse de que el archivo `.env` en la raíz del proyecto contiene:

```env
EMAIL=tu_email@example.com
PASSWORD=tu_password
HEADLESS=False
DB_HOST=158.69.200.27
DB_PORT=5436
DB_NAME=tester
DB_USER=tester
DB_PASSWORD=sigma.test.2025
```

### 3. Ejecutar el Test

```powershell
# Opción 1: Desde la carpeta IT-GD-001
cd IT-GD-001
python IT-GD-001.py

# Opción 2: Desde la raíz del proyecto
python IT-GD-001\IT-GD-001.py
```

## 🧪 Scripts Disponibles

### IT-GD-001.py (Principal)
Script completo de automatización que ejecuta:
- ✅ Login automático
- ✅ Navegación al módulo de Gestión de Dispositivos
- ✅ Registro de dispositivo con datos únicos
- ✅ Selección de parámetros de monitoreo
- ✅ Validación de registro exitoso
- ✅ Prueba de registro duplicado
- ✅ Generación de reportes y screenshots

```powershell
python IT-GD-001.py
```

### quick_test.py (Debugging)
Prueba rápida para verificar selectores y navegación:
```powershell
python quick_test.py
```

### db_validator.py (Validación BD)
Validación directa en base de datos:
```powershell
python db_validator.py
```

### test_config.py
Muestra la configuración actual:
```powershell
python test_config.py
```

## 📊 Resultados

### Screenshots Generados
Todas las capturas se guardan en `screenshots/` con timestamp:
- `screenshot_login_success_[timestamp].png`
- `screenshot_modal_opened_[timestamp].png`
- `screenshot_form_filled_[timestamp].png`
- `screenshot_registration_success_[timestamp].png`
- `screenshot_device_in_list_[timestamp].png`
- `screenshot_duplicate_error_validation_[timestamp].png`
- `screenshot_final_state_[timestamp].png`

### Reportes JSON
Los reportes se guardan en `reports/` con formato JSON:
```json
{
  "test_id": "IT-GD-001",
  "test_name": "Registro completo de dispositivo...",
  "timestamp": "20251102_143022",
  "test_data": {
    "device_name": "Dispositivo GPS Test 20251102_143022",
    "imei": "123456789012345",
    "parameters": [...]
  },
  "results": [...],
  "summary": {
    "total_steps": 13,
    "passed": 13,
    "failed": 0,
    "success_rate": "100.0%"
  }
}
```

## 🎯 Características Especiales

### ✨ Generación Automática de Datos
Cada ejecución genera:
- **Nombre de dispositivo único** con timestamp
- **IMEI válido de 15 dígitos** usando algoritmo de Luhn
- Evita conflictos con datos existentes

### 🔄 Prueba de Duplicados
Automáticamente intenta registrar el mismo dispositivo dos veces para validar:
- Rechazo de IMEI duplicado
- Mensaje de error apropiado
- Comportamiento del formulario

### 📸 Capturas Automáticas
Screenshots en cada paso importante para:
- Debugging
- Evidencia de ejecución
- Documentación

### 📝 Reportes Detallados
Generación automática de:
- Reporte JSON con todos los detalles
- Timestamp de cada paso
- Datos de prueba utilizados
- Resumen de éxito/fallo

## 🔧 Configuración Avanzada

### Modo Headless
Modificar en `.env`:
```env
HEADLESS=True  # Ejecutar sin interfaz gráfica
```

### Timeouts Personalizados
Editar en `test_config.py`:
```python
TIMEOUTS = {
    "page_load": 10,
    "element_wait": 15,
    "modal_open": 5,
    ...
}
```

### Parámetros de Monitoreo
Modificar lista en `test_config.py`:
```python
MONITORING_PARAMETERS = [
    "Estado de Ignición",
    "Velocidad Actual",
    "Ubicación GPS",
    # Agregar más parámetros...
]
```

## 🐛 Troubleshooting

### Error: ChromeDriver no encontrado
```powershell
# Verificar que existe:
ls ..\chromedriver\driver.exe

# Si no existe, descargar de:
# https://chromedriver.chromium.org/
```

### Error: Credenciales incorrectas
```powershell
# Verificar archivo .env
cat ..\.env

# Verificar que EMAIL y PASSWORD están configurados
```

### Error: Modal no se abre
```powershell
# Ejecutar quick_test.py para debugging
python quick_test.py

# Verificar selectores en test_config.py
```

### Error: Timeout esperando elemento
- Aumentar `EXPLICIT_WAIT` en `test_config.py`
- Verificar que la aplicación está corriendo en `http://localhost:3000/sigma`
- Verificar conexión de red

## 📖 Documentación Adicional

- **README_IT_GD_001.md**: Documentación completa del caso de prueba
- **IT-GD-001-reporte.md**: Plantilla para reporte manual
- **test_config.py**: Configuración de selectores y parámetros

## 🔍 Validación en Base de Datos (Opcional)

Si deseas validar directamente en la BD que el dispositivo se registró:

```python
from db_validator import DatabaseValidator

validator = DatabaseValidator()
if validator.connect():
    success, details = validator.validate_device_registration(
        device_name="Dispositivo GPS Test 20251102_143022",
        imei="123456789012345",
        expected_parameters=["Estado de Ignición", "Velocidad Actual", ...]
    )
    validator.disconnect()
```

## 📞 Soporte

Para problemas o preguntas sobre esta automatización:
1. Revisar logs en consola
2. Verificar screenshots generados
3. Revisar reporte JSON en `reports/`
4. Ejecutar `quick_test.py` para debugging

---

**Última actualización**: 2025-11-02
**Versión**: 1.0.0
**Autor**: Sistema de Automatización SIGMA
