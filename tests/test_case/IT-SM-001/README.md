# IT-SM-001: Creación manual de solicitud con validaciones y notificaciones

Este directorio contiene la automatización completa del caso de prueba **IT-SM-001**: Validar registro manual desde Solicitudes, con validaciones de estado de maquinaria, campos obligatorios, consecutivo, y notificación a autorizadores.

## Estructura de Archivos

```
IT-SM-001/
├── __init__.py                 # Paquete Python
├── IT-SM-001.py              # Prueba principal: Creación de solicitud de mantenimiento
├── README.md                 # Esta documentación
└── chromedriver.exe          # ChromeDriver
```

## Uso Básico

### Ejecutar Prueba Completa
```bash
python IT-SM-001.py
```

### Ejecutar desde Python
```python
from test_case.IT_SM_001.IT_SM_001 import main

success = main()
```

## Funciones Disponibles

### IT-SM-001.py
- `perform_login()`: Realiza el login con credenciales específicas
- `navigate_to_maintenance_request(driver)`: Navega a la página de solicitud
- `open_new_request_form(driver)`: Abre el formulario de nueva solicitud
- `fill_form(driver)`: Completa el formulario con datos de prueba
- `submit_form(driver)`: Envía la solicitud
- `main()`: Ejecuta la prueba completa

## Configuración de Datos

Los datos de prueba están definidos en `IT-SM-001.py`:

### Credenciales
```python
TEST_DATA = {
    "email": "danielsr_1997@hotmail.com",
    "password": "Usuario9924."
}
```

### Datos de Solicitud
```python
TEST_DATA = {
    "machine": "8289 - TractorGet",           # Maquinaria activa
    "maintenance_type": "mantenimiento preventivooo",  # Tipo de mantenimiento
    "priority": "Alta",                       # Prioridad
    "description": "Vibración anómala",       # Descripción del problema
    "detection_date": "01/10/2025"            # Fecha de detección (HOY)
}
```

## Caso de Prueba

### Título
Creación manual de solicitud con validaciones y notificaciones

### Descripción
Validar registro manual desde Solicitudes, con validaciones de estado de maquinaria, campos obligatorios, consecutivo, y notificación a autorizadores

### Precondiciones
- Usuario con permisos de creación
- Maquinaria activa y seleccionable (8289 - TractorGet)
- Tipos, prioridades y usuarios autorizadores parametrizados

### Datos de Entrada
- **Maquinaria activa**: 8289 - TractorGet
- **Tipo**: Mantenimiento Preventivooo
- **Prioridad**: Alta
- **Fecha detección**: HOY (01/10/2025)
- **Descripción**: "Vibración anómala"

### Pasos (AAA)
1. **Arrange**: Configurar permisos, datos maestros y una maquinaria activa
2. **Act**: Crear solicitud manual desde botón "Solicitar mantenimiento"
3. **Assert**: Verificar consecutivo, estado Pendiente, registro en BD y notificación a autorizadores

### Resultado Esperado
Solicitud creada con estado Pendiente, asociada a maquinaria y visible en el listado con notificación emitida

## Selectores Utilizados

```python
# Selectores principales
"maintenance_nav": "//span[normalize-space()='Mantenimiento']"
"maintenance_request_link": "//a[normalize-space()='Solicitud de mantenimiento']"
"new_request_button": "//button[contains(text(), 'Nueva Solicitud')]"
"machine_select": "//select[@name='machine']"
"maintenance_type_select": "//*[@id='Maintenance Request Modal']/div/form/div[1]/div[2]/select"
"priority_select": "//select[@name='priority']"
"description_textarea": "//textarea"
"detection_date_input": "//input[@name='detectionDate']"
"submit_button": "//button[contains(text(), 'Solicitar')]"
```

## Validaciones Implementadas

1. **Validación de Login**: Verifica que el usuario se autentique correctamente
2. **Validación de Navegación**: Confirma que se llegue a la página de solicitud
3. **Validación de Formulario**: Verifica que todos los campos se completen correctamente
4. **Validación de Envío**: Confirma que la solicitud se envíe sin errores
5. **Validación de Resultado**: Busca indicadores de éxito en la respuesta

## Reportes y Logs

El test genera logs detallados durante la ejecución:
- Estado de cada paso del proceso
- Validaciones realizadas
- Errores encontrados (si los hay)
- Confirmación de éxito o fallo

## Requisitos del Sistema

- Python 3.7+
- Selenium WebDriver
- Chrome/Chromium instalado
- ChromeDriver compatible
- Acceso a la aplicación en `http://localhost:3000`

## Notas de Implementación

- Utiliza credenciales específicas para el test
- Sigue el patrón AAA (Arrange-Act-Assert)
- Incluye manejo robusto de errores
- Genera logs detallados para debugging
- Compatible con modo headless para CI/CD

## Troubleshooting

### Error de ChromeDriver
```bash
# Verificar que chromedriver.exe esté en el directorio
ls tests/test_case/IT-SM-001/chromedriver.exe
```

### Error de Conexión
```bash
# Verificar que la aplicación esté ejecutándose
curl http://localhost:3000/sigma/login
```

### Error de Selectores
- Verificar que los selectores XPath sean correctos
- Usar herramientas de desarrollo del navegador para inspeccionar elementos
- Actualizar selectores si la interfaz cambia