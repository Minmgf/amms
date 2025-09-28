# IT-MAQ-002: Automatización del Registro Completo de Ficha Técnica de Maquinaria

Este directorio contiene la automatización completa del caso de prueba **IT-MAQ-002**: Verificar registro completo de ficha técnica de maquinaria (multipaso).

## 📁 Estructura de Archivos

```
IT-MAQ-002/
├── __init__.py                 # Paquete Python
├── IT-MAQ-002.py              # Pasos 1 y 2: Ficha técnica completa
├── README.md                  # Esta documentación
├── modal_html_capture.html    # Captura HTML del Paso 1 (generado)
└── test_tractor_image.jpg     # Imagen de prueba (generado)
```

## 🚀 Uso Básico

### Ejecutar Prueba Completa (Paso 1 + Paso 2)
```python
from test_case.IT_MAQ_002.IT_MAQ_002 import run_it_maq_002

success = run_it_maq_002(headless=False)
```

### Ejecutar Paso a Paso (Recomendado para Desarrollo)

```python
from test_case.IT_MAQ_002.IT_MAQ_002 import setup_test_environment, run_it_maq_002_step1, run_it_maq_002_step2

# Configurar entorno (login + navegación)
driver = setup_test_environment(headless=False)

# Ejecutar Paso 1
driver = run_it_maq_002_step1(driver)

# Continuar con Paso 2
driver = run_it_maq_002_step2(driver)

# Limpiar
from test_case.IT_MAQ_002.IT_MAQ_002 import cleanup_test_environment
cleanup_test_environment(driver)
```

## 📋 Funciones Disponibles

### IT_MAQ_002.py
- `setup_test_environment(headless=False)`: Configura login y navegación
- `run_it_maq_002_step1(driver)`: Completa el Paso 1 del formulario
- `run_it_maq_002_step2(driver)`: Completa el Paso 2 del formulario
- `run_it_maq_002(headless=False)`: Ejecuta la prueba completa
- `cleanup_test_environment(driver)`: Limpia el entorno

## 🔧 Configuración de Datos

Los datos de prueba están definidos en `IT_MAQ_002.py`:

### Paso 1: Ficha Técnica General
```python
test_data = {
    "Nombre": "Tractor [Empresa] [Número]",  # Generado dinámicamente
    "Año fabricación": "2020-2024",  # Aleatorio
    "Número de serie": "[Prefijo][Número]-[Timestamp]",  # Único
    "Tipo maquinaria": "Tractor",
    "Marca": "Deutz",
    "Modelo": "Seleccione una marca primero",  # Se actualiza dinámicamente
    "Subpartida arancelaria": "8429.11.00",
    "Categoría maquinaria": "Maquinaria amarilla",
    "País": "Colombia",
    "Región": "Antioquia",
    "Ciudad": "Medellín",
    "Telemetría": "Teltonika FMB140"
}
```

### Paso 2: Información Técnica Adicional
```python
step2_test_data = {
    "Número de serie del terminal": "TERM[6 dígitos]",
    "Número de chasis": "CHAS[6 dígitos]",
    "Número de serie del dispositivo GPS": "GPS[6 dígitos]",
    "Número de motor": "MOT[6 dígitos]"
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
- ✅ Telemetría (ignorado)
- ✅ Foto (archivo subido)

### Paso 2: Información Técnica Adicional (4 campos)
- ✅ Número de serie del terminal
- ✅ Número de chasis
- ✅ Número de serie del dispositivo GPS
- ✅ Número de motor

## 🔧 Selectores del Paso 2

Los selectores XPath específicos para el Paso 2:
- `//input[@placeholder='Ingrese el número de serie del terminal']`
- `//input[@placeholder='Ingrese el número de chasis']`
- `//input[@placeholder='Ingrese el número de serie del dispositivo GPS']`
- `//input[@placeholder='Ingrese el número de motor']`
- `//button[normalize-space()='Siguiente']`

## 🐛 Debugging

### Captura de HTML
Los archivos generan automáticamente capturas HTML del modal:
- `modal_html_capture.html`: Paso 1

### Logging Detallado
Cada función incluye logging detallado para debugging:
- 🔍 Búsqueda de elementos
- ✅ Éxito en operaciones
- ❌ Errores específicos
- ⚠️ Advertencias

## 🔄 Próximos Pasos

1. **Completar Paso 3**: Información específica de la maquinaria
2. **Paso 4**: Información de uso
3. **Paso 5**: Mantenimiento periódico
4. **Paso 6**: Subir documentación

## 📝 Notas Técnicas

- **Selenium WebDriver**: ChromeDriver con manejo automático
- **SPA Navigation**: Manejo especial para aplicaciones de página única
- **Modal Context**: Cambio automático de contexto al modal del formulario
- **File Upload**: Subida automática de imagen de prueba
- **Error Handling**: Recuperación automática de errores no críticos
- **Cross-platform**: Compatible con Windows, Linux y macOS
- **Data Uniqueness**: Generación automática de datos únicos usando Faker

## 🤝 Contribución

Para modificar o extender la automatización:

1. Los selectores están centralizados en `formData` y `step2_selectors`
2. Los datos de prueba están en `test_data` y `step2_test_data`
3. Cada paso es modular y puede ejecutarse independientemente
4. Incluir logging detallado para debugging
5. Manejar errores gracefully

---

**Versión**: 1.0.0
**Última actualización**: Septiembre 2025
**Estado**: Pasos 1 y 2 completos, listo para Paso 3