# IT-MAQ-003: Automatización del Registro Completo de Ficha Técnica de Maquinaria

Este directorio contiene la automatización completa del caso de prueba **IT-MAQ-003**: Verificar registro completo de ficha técnica de maquinaria (multipaso hasta paso 3).

## 📁 Estructura de Archivos

```
IT-MAQ-003/
├── __init__.py                 # Paquete Python
├── IT-MAQ-003.py              # Pasos 1, 2 y 3: Ficha técnica completa
├── README.md                  # Esta documentación
├── modal_html_capture.html    # Captura HTML del Paso 1 (generado)
└── test_tractor_image.jpg     # Imagen de prueba (generado)
```

## 🚀 Uso Básico

### Ejecutar Prueba Completa (Paso 1 + Paso 2 + Paso 3)
```python
from test_case.IT_MAQ_003.IT_MAQ_003 import run_it_maq_003

success = run_it_maq_003(headless=False)
```

### Ejecutar Paso a Paso (Recomendado para Desarrollo)

```python
from test_case.IT_MAQ_003.IT_MAQ_003 import setup_test_environment, run_it_maq_003_step1, run_it_maq_003_step2, run_it_maq_003_step3

# Configurar entorno (login + navegación)
driver = setup_test_environment(headless=False)

# Ejecutar Paso 1
driver = run_it_maq_003_step1(driver)

# Continuar con Paso 2
driver = run_it_maq_003_step2(driver)

# Continuar con Paso 3
driver = run_it_maq_003_step3(driver)

# Limpiar
from test_case.IT_MAQ_003.IT_MAQ_003 import cleanup_test_environment
cleanup_test_environment(driver)
```

## 📋 Funciones Disponibles

### IT_MAQ_003.py
- `setup_test_environment(headless=False)`: Configura login y navegación
- `run_it_maq_003_step1(driver)`: Completa el Paso 1 del formulario
- `run_it_maq_003_step2(driver)`: Completa el Paso 2 del formulario
- `run_it_maq_003_step3(driver)`: Completa el Paso 3 del formulario
- `run_it_maq_003(headless=False)`: Ejecuta la prueba completa
- `cleanup_test_environment(driver)`: Limpia el entorno

## 🔧 Configuración de Datos

Los datos de prueba están definidos en `IT_MAQ_003.py`:

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

### Paso 3: Especificaciones Técnicas Detalladas
```python
step3_test_data = {
    # Sección Motor
    "enginePower": "100-300",  # HP
    "enginePowerUnit": "HP",
    "engineType": "diesel",
    "cylinderCapacity": "3000-8000",  # cc
    "cylinderCapacityUnit": "cc",
    "cylinderNumber": "4-8",
    "arrangement": "L",
    "traction": "4x4",
    "fuelConsumption": "5-15",  # L/h
    "fuelConsumptionUnit": "L/h",
    "transmissionSystem": "manual",

    # Sección Capacidad y Rendimiento
    "tankCapacity": "100-500",  # L
    "tankCapacityUnit": "L",
    "carryingCapacity": "1000-5000",  # kg
    "carryingCapacityUnit": "kg",
    "draftForce": "20-100",  # kN
    "draftForceUnit": "kN",
    "operatingWeight": "3000-8000",  # kg
    "operatingWeightUnit": "kg",
    "maxSpeed": "20-50",  # km/h
    "maxSpeedUnit": "km/h",
    "maxOperatingAltitude": "2000-4000",  # msnm
    "maxOperatingAltitudeUnit": "msnm",
    "performanceMin": "80-95",  # %
    "performanceMax": "95-100",  # %

    # Sección Dimensiones y Peso
    "dimensionsUnit": "m",
    "width": "1.5-2.5",  # m
    "length": "3.0-5.0",  # m
    "height": "2.0-3.5",  # m
    "netWeight": "2500-7000",  # kg
    "netWeightUnit": "kg",
    "airConditioning": "cooling",
    "airConditioningConsumption": "1-5",  # kWh
    "airConditioningConsumptionUnit": "kWh",
    "maxHydraulicPressure": "150-300",  # bar
    "maxHydraulicPressureUnit": "bar",
    "hydraulicPumpFlowRate": "50-150",  # L/min
    "hydraulicPumpFlowRateUnit": "L/min",
    "hydraulicReservoirCapacity": "50-200",  # L
    "hydraulicReservoirCapacityUnit": "L",

    # Sección Normatividad y Seguridad
    "emissionLevel": "euro5",
    "cabinType": "closed"
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

### Paso 3: Especificaciones Técnicas Detalladas (4 secciones, 32 campos)

#### Sección 1: Motor (11 campos)
- ✅ Potencia del motor
- ✅ Unidad de potencia
- ✅ Tipo de motor
- ✅ Capacidad del cilindro
- ✅ Unidad capacidad cilindro
- ✅ Número de cilindros
- ✅ Disposición
- ✅ Tracción
- ✅ Consumo de combustible
- ✅ Unidad consumo combustible
- ✅ Sistema de transmisión

#### Sección 2: Capacidad y Rendimiento (13 campos)
- ✅ Capacidad del tanque
- ✅ Unidad capacidad tanque
- ✅ Capacidad de carga
- ✅ Unidad capacidad carga
- ✅ Fuerza de tiro
- ✅ Unidad fuerza tiro
- ✅ Peso operativo
- ✅ Unidad peso operativo
- ✅ Velocidad máxima
- ✅ Unidad velocidad máxima
- ✅ Altitud máxima operativa
- ✅ Unidad altitud máxima
- ✅ Rendimiento mínimo
- ✅ Rendimiento máximo

#### Sección 3: Dimensiones y Peso (14 campos)
- ✅ Unidad de dimensiones
- ✅ Ancho
- ✅ Largo
- ✅ Alto
- ✅ Peso neto
- ✅ Unidad peso neto
- ✅ Aire acondicionado
- ✅ Consumo aire acondicionado
- ✅ Unidad consumo aire acondicionado
- ✅ Presión hidráulica máxima
- ✅ Unidad presión hidráulica
- ✅ Caudal bomba hidráulica
- ✅ Unidad caudal bomba
- ✅ Capacidad depósito hidráulico
- ✅ Unidad capacidad depósito

#### Sección 4: Normatividad y Seguridad (2 campos)
- ✅ Nivel de emisiones
- ✅ Tipo de cabina

## 🔧 Selectores del Paso 3

Los selectores XPath están organizados por secciones desplegables:

### Sección Motor (ya desplegada)
- `//input[@name='enginePower']`
- `//select[@name='enginePowerUnit']`
- `//select[@name='engineType']`
- etc.

### Navegación entre secciones
- `//span[normalize-space()='Capacidad y Rendimiento']`
- `//button[@aria-label='Collapse Dimensiones y Peso Section']`
- `//button[@aria-label='Expand Normatividad y Seguridad Section']`

### Botón siguiente
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

1. **Completar Paso 4**: Información de uso
2. **Paso 5**: Mantenimiento periódico
3. **Paso 6**: Subir documentación

## 📝 Notas Técnicas

- **Selenium WebDriver**: ChromeDriver con manejo automático
- **SPA Navigation**: Manejo especial para aplicaciones de página única
- **Modal Context**: Cambio automático de contexto al modal del formulario
- **File Upload**: Subida automática de imagen de prueba
- **Error Handling**: Recuperación automática de errores no críticos
- **Cross-platform**: Compatible con Windows, Linux y macOS
- **Data Uniqueness**: Generación automática de datos únicos usando Faker
- **Expandable Sections**: Manejo automático de secciones desplegables

## 🤝 Contribución

Para modificar o extender la automatización:

1. Los selectores están centralizados en `formData`, `step2_selectors` y `step3_selectors`
2. Los datos de prueba están en `test_data`, `step2_test_data` y `step3_test_data`
3. Cada paso es modular y puede ejecutarse independientemente
4. Incluir logging detallado para debugging
5. Manejar errores gracefully

---

**Versión**: 1.0.0
**Última actualización**: Septiembre 2025
**Estado**: Pasos 1, 2 y 3 completos, listo para Paso 4