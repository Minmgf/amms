# IT## 📁 Estructura de Archivos

```
IT-MAQ-001/
├── __init__.py                 # Paquete Python
├── IT-MAQ-001.py              # Paso 1: Ficha técnica general
├── IT_MAQ_001_step2.py        # Paso 2: Ficha técnica del rastreador
├── example_usage.py           # Ejemplos de uso modular
├── README.md                  # Esta documentación
├── modal_html_capture.html    # Captura HTML del Paso 1 (generado)
└── test_tractor_image.jpg     # Imagen de prueba (generado)
```utomatización del Registro de Maquinaria

Este directorio contiene la automatización completa del caso de prueba **IT-MAQ-001**: Verificar registro de ficha técnica general de maquinaria.

## 📁 Estructura de Archivos

```
IT-MAQ-001/
├── __init__.py                 # Paquete Python
├── IT_MAQ_001.py              # Paso 1: Ficha técnica general
├── IT_MAQ_001_step2.py        # Paso 2: Ficha técnica del rastreador
├── README.md                  # Esta documentación
├── modal_html_capture.html    # Captura HTML del Paso 1 (generado)
└── test_tractor_image.jpg     # Imagen de prueba (generado)
```

## 🚀 Uso Básico

### Ejecutar Prueba Completa (Paso 1)
```python
from test_case.IT_MAQ_001.IT_MAQ_001 import run_it_maq_001

success = run_it_maq_001(headless=False)
```

### Ejecutar Paso a Paso (Recomendado para Desarrollo)

```python
from test_case.IT_MAQ_001.IT_MAQ_001 import setup_test_environment, run_it_maq_001_step1
from test_case.IT_MAQ_001.IT_MAQ_001_step2 import run_it_maq_001_step2

# Configurar entorno (login + navegación)
driver = setup_test_environment(headless=False)

# Ejecutar Paso 1
driver = run_it_maq_001_step1(driver)

# Continuar con Paso 2
driver = run_it_maq_001_step2(driver)

# Limpiar
from test_case.IT_MAQ_001.IT_MAQ_001 import cleanup_test_environment
cleanup_test_environment(driver)
```

### Ejemplos Interactivos
Para ver ejemplos completos de uso, ejecuta:
```bash
python example_usage.py
```

Este archivo incluye:
- **Prueba completa modular**: Ejecuta todo el flujo de una vez
- **Ejecución paso a paso**: Desarrollo y debugging incremental  
- **Testing de desarrollo**: Solo setup para pruebas manuales
- **Solo Paso 2**: Para probar específicamente el segundo paso

## 📋 Funciones Disponibles

### IT_MAQ_001.py
- `setup_test_environment(headless=False)`: Configura login y navegación
- `run_it_maq_001_step1(driver)`: Completa el Paso 1 del formulario
- `run_it_maq_001(headless=False)`: Ejecuta la prueba completa
- `cleanup_test_environment(driver)`: Limpia el entorno

### IT_MAQ_001_step2.py
- `run_it_maq_001_step2(driver)`: Completa el Paso 2 del formulario
- `analyze_step2_form(driver)`: Analiza campos del Paso 2
- `complete_machinery_form_step2(driver)`: Completa formulario del Paso 2

## 🔧 Configuración de Datos

Los datos de prueba están definidos en `IT_MAQ_001.py`:

```python
test_data = {
    "Nombre": "Tractor Banano 001",
    "Año fabricación": "2023",
    "Número de serie": "TB001-2023",
    "Tipo maquinaria": "Tractor",
    "Marca": "Deutz",
    "Modelo": "Deutz TCD 4.1 L4",  # Se selecciona automáticamente
    "Subpartida arancelaria": "8429.11.00",
    "Categoría maquinaria": "Maquinaria amarilla",
    "País": "Colombia",
    "Región": "Antioquia",
    "Ciudad": "Medellín",
    "Telemetría": "Teltonika FMB140"
}
```

## 📊 Campos Completados

### Paso 1: Ficha Técnica General (13 campos)
- ✅ Nombre
- ✅ Año fabricación
- ✅ Número de serie
- ✅ Tipo maquinaria
- ✅ Marca
- ✅ Modelo (automático)
- ✅ Subpartida arancelaria
- ✅ Categoría de maquinaria
- ✅ País
- ✅ Región
- ✅ Ciudad
- ✅ Telemetría
- ✅ Foto (archivo subido)

### Paso 2: Ficha Técnica del Rastreador (En desarrollo)
- 🔄 Identificador único (IMEI)
- 🔄 Número de teléfono
- 🔄 Operador telefónico
- 🔄 Configuración APN
- 🔄 Intervalo de reporte
- 🔄 Modo de ahorro de batería

## 🐛 Debugging

### Captura de HTML
Los archivos generan automáticamente capturas HTML del modal:
- `modal_html_capture.html`: Paso 1
- `modal_step2_html_capture.html`: Paso 2

### Logging Detallado
Cada función incluye logging detallado para debugging:
- 🔍 Búsqueda de elementos
- ✅ Éxito en operaciones
- ❌ Errores específicos
- ⚠️ Advertencias

## 🔄 Próximos Pasos

1. **Completar Paso 2**: Identificar y completar todos los campos del rastreador
2. **Paso 3**: Ficha técnica específica
3. **Paso 4**: Información de uso
4. **Paso 5**: Mantenimiento periódico
5. **Paso 6**: Subir documentación

## 📝 Notas Técnicas

- **Selenium WebDriver**: ChromeDriver con manejo automático
- **SPA Navigation**: Manejo especial para aplicaciones de página única
- **Modal Context**: Cambio automático de contexto al modal del formulario
- **File Upload**: Subida automática de imagen de prueba
- **Error Handling**: Recuperación automática de errores no críticos
- **Cross-platform**: Compatible con Windows, Linux y macOS

## 🤝 Contribución

Para modificar o extender la automatización:

1. Los selectores están centralizados en `formData`
2. Los datos de prueba están en `test_data`
3. Cada paso es modular y puede ejecutarse independientemente
4. Incluir logging detallado para debugging
5. Manejar errores gracefully

---

**Versión**: 1.0.0
**Última actualización**: Septiembre 2025
**Estado**: Paso 1 completo, Paso 2 en desarrollo