# 📁 Estructura de IT-GD-001

```
IT-GD-001/
│
├── 📄 IT-GD-001.py                    ⭐ Script principal de automatización
├── 📄 README.md                       📖 Guía de uso y documentación
├── 📄 README_IT_GD_001.md             📚 Documentación detallada del caso
├── 📄 IT-GD-001-reporte.md            📋 Plantilla de reporte
├── 📄 test_config.py                  ⚙️  Configuración y selectores
├── 📄 db_validator.py                 🗄️  Validación en base de datos
├── 📄 quick_test.py                   🐛 Script de debugging rápido
├── 📄 run_test.bat                    ▶️  Script de ejecución Windows
├── 📄 .gitignore                      🚫 Archivos ignorados por git
│
├── 📁 screenshots/                    📸 Capturas de pantalla
│   └── (generadas durante ejecución)
│
└── 📁 reports/                        📊 Reportes JSON
    └── (generados durante ejecución)
```

## 🎯 Archivos Clave

### ⭐ IT-GD-001.py
**Script principal de automatización**
- Genera datos únicos (nombre + IMEI)
- Realiza login automático
- Navega al módulo de Gestión de Dispositivos
- Completa y envía formulario de registro
- Valida registro exitoso
- Prueba registro duplicado
- Genera reportes y screenshots

### 📖 README.md
**Guía de uso rápido**
- Instrucciones de instalación
- Comandos de ejecución
- Troubleshooting
- Ejemplos de uso

### 📚 README_IT_GD_001.md
**Documentación completa**
- Descripción del caso de prueba
- Precondiciones
- Datos de entrada
- Pasos AAA (Arrange-Act-Assert)
- Resultados esperados
- Selectores utilizados

### ⚙️ test_config.py
**Configuración centralizada**
- URLs de la aplicación
- Selectores CSS/XPath
- Timeouts
- Parámetros de monitoreo
- Mensajes esperados

### 🐛 quick_test.py
**Debugging rápido**
- Verifica selectores
- Prueba navegación
- Lista elementos del formulario
- Útil para desarrollo

### ▶️ run_test.bat
**Ejecución fácil en Windows**
- Verifica dependencias
- Ejecuta el test
- Abre carpetas de resultados

## 🔄 Flujo de Ejecución

```
1. run_test.bat
   │
   ├─> Verifica Python
   ├─> Verifica .env
   ├─> Instala dependencias
   │
   └─> python IT-GD-001.py
       │
       ├─> Genera datos únicos
       │   ├─> Nombre: "Dispositivo GPS Test {timestamp}"
       │   └─> IMEI: 15 dígitos aleatorios (Luhn)
       │
       ├─> Setup & Login
       │   └─> 📸 screenshot_login_success
       │
       ├─> Navega a Monitoreo
       │   └─> 📸 screenshot_monitoring_menu_expanded
       │
       ├─> Navega a Gestión de Dispositivos
       │   └─> 📸 screenshot_devices_management_page
       │
       ├─> Abre modal "Nuevo Dispositivo"
       │   └─> 📸 screenshot_modal_opened
       │
       ├─> Completa formulario
       │   ├─> Ingresa nombre
       │   ├─> Ingresa IMEI
       │   ├─> Selecciona 5 parámetros
       │   └─> 📸 screenshot_form_filled
       │
       ├─> Envía formulario
       │   ├─> Verifica mensaje de éxito
       │   └─> 📸 screenshot_registration_success
       │
       ├─> Verifica en lista
       │   └─> 📸 screenshot_device_in_list
       │
       ├─> Prueba duplicado
       │   ├─> Abre modal nuevamente
       │   ├─> Ingresa mismos datos
       │   ├─> Verifica error
       │   └─> 📸 screenshot_duplicate_error_validation
       │
       ├─> 📸 screenshot_final_state
       │
       └─> Genera reporte JSON
           └─> 📊 IT_GD_001_Report_{timestamp}.json
```

## 📊 Salidas Generadas

### Screenshots (carpeta screenshots/)
```
screenshot_login_success_20251102_143022.png
screenshot_monitoring_menu_expanded_20251102_143025.png
screenshot_devices_management_page_20251102_143028.png
screenshot_modal_opened_20251102_143030.png
screenshot_form_filled_20251102_143035.png
screenshot_registration_success_20251102_143038.png
screenshot_device_in_list_20251102_143040.png
screenshot_form_filled_duplicate_20251102_143042.png
screenshot_duplicate_error_validation_20251102_143045.png
screenshot_final_state_20251102_143048.png
```

### Reporte JSON (carpeta reports/)
```json
IT_GD_001_Report_20251102_143048.json
{
  "test_id": "IT-GD-001",
  "timestamp": "20251102_143048",
  "test_data": {
    "device_name": "Dispositivo GPS Test 20251102_143022",
    "imei": "897654321098765"
  },
  "results": [
    {"step": "Setup", "success": true, ...},
    {"step": "Login", "success": true, ...},
    ...
  ],
  "summary": {
    "total_steps": 13,
    "passed": 13,
    "failed": 0,
    "success_rate": "100.0%"
  }
}
```

## 💡 Características Destacadas

### 🎲 Generación de Datos Únicos
- **Nombre**: Timestamp incluido → Sin duplicados
- **IMEI**: Algoritmo de Luhn → Válido y único
- **Evita conflictos** con datos existentes en BD

### 🔄 Prueba de Duplicados
- Registra dispositivo exitosamente
- Intenta registrar mismo IMEI nuevamente
- Valida que el sistema **rechaza correctamente**
- Verifica mensajes de error apropiados

### 📸 Documentación Visual
- Screenshot en cada paso importante
- Útil para debugging
- Evidencia de ejecución
- Timestamp en cada captura

### 🗄️ Validación en BD (Opcional)
- Conexión PostgreSQL
- Verifica registro real
- Valida parámetros
- Confirma integridad de datos

## 🚀 Uso Rápido

### Método 1: Script Batch (Recomendado)
```cmd
# Doble clic en:
run_test.bat
```

### Método 2: Python Directo
```powershell
python IT-GD-001.py
```

### Método 3: Debugging
```powershell
python quick_test.py
```

## 📝 Notas Importantes

✅ **Datos únicos**: Cada ejecución usa IMEI diferente
✅ **Prueba duplicados**: Valida comportamiento del sistema
✅ **Screenshots automáticos**: Evidencia completa
✅ **Reportes JSON**: Análisis y trazabilidad
✅ **Reutiliza flujo de login**: Código modular
✅ **Configuración centralizada**: Fácil mantenimiento

---

**Creado**: 2025-11-02
**Versión**: 1.0.0
