# IT-GM-002: Verificar listado de mantenimientos con filtros y paginación

Este directorio contiene la automatización completa del caso de prueba **IT-GM-002**: Verificar listado de mantenimientos con filtros y paginación.

## 📁 Estructura de Archivos

```
IT-GM-002/
├── __init__.py                 # Paquete Python
├── IT-GM-002.py              # Prueba principal: Listado con filtros y paginación
├── Mantenimiento-Nav.py       # Funciones de navegación reutilizadas
├── README.md                  # Esta documentación
├── driver.exe                 # ChromeDriver
└── screenshots/               # Capturas de pantalla (generado)
└── reports/                   # Reportes JSON (generado)
```

## 🚀 Uso Básico

### Ejecutar Prueba Completa
```python
from test_case.IT_GM_002.IT_GM_002 import main

success = main()
```

### Ejecutar con Clase
```python
from test_case.IT_GM_002.IT_GM_002 import TestITGM002MaintenanceListFilters

test = TestITGM002MaintenanceListFilters()
success = test.run_test(headless=False)
```

## 📋 Funciones Disponibles

### IT-GM-002.py
- `setup_test_environment(headless=False)`: Configura login y navegación
- `verify_maintenance_list_display()`: Verifica que la lista se muestra correctamente
- `test_pagination_navigation()`: Prueba navegación entre páginas
- `test_search_functionality()`: Prueba funcionalidad de búsqueda
- `test_filters_by_type_and_status()`: Prueba filtros por tipo y estado
- `test_action_buttons_by_status()`: Prueba botones de acción según estado
- `run_test(headless=False)`: Ejecuta la prueba completa
- `generate_report()`: Genera reporte JSON de resultados

## 🔧 Configuración de Datos

Los datos de prueba están definidos en `IT-GM-002.py`:

### Credenciales (reutilizadas de Mantenimiento-Nav.py)
```python
email = "danielsr_1997@hotmail.com"
password = "Usuario9924."
```

### Filtros de Prueba
- **Tipo de mantenimiento**: "Preventivo"
- **Estado**: "Activo"
- **Página**: 1

## 📊 Pasos de la Prueba (AAA)

### Arrange
- Preparar datos de entrada y entorno según precondiciones
- Iniciar sesión con usuario autorizado
- Acceder al módulo de gestión de mantenimientos

### Act
- Verificar que la lista de mantenimientos se muestra correctamente
- Probar navegación entre páginas (botones Previous/Next)
- Probar funcionalidad de búsqueda
- Aplicar filtros por tipo de mantenimiento y estado
- Verificar botones de acción según estado

### Assert
- Listado filtrado correctamente
- Paginación funciona correctamente
- Botones apropiados según estado
- Búsqueda funciona correctamente

## 🎯 XPath Utilizados

### Navegación
- Cuadro de búsqueda: `//input[@id='search']`
- Botón filtrar: `//button[normalize-space()='Filtrar por']`

### Paginación
- Botón Previous: `//button[@class='parametrization-pagination-button inline-flex items-center px-3 py-2 text-sm font-medium transition-colors'][contains(text(),'← Previous')]`
- Botón Next: `//button[@class='parametrization-pagination-button inline-flex items-center px-3 py-2 text-sm font-medium transition-colors'][contains(text(),'Next →')]`
- Selector elementos por página: `//select[@class='parametrization-pagination-select px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500']`

### Filtros
- Filtro tipo: `//*[@id="radix-_r_3_"]/div[2]/div[1]/div[1]/select`
- Filtro estado: `//*[@id="radix-_r_3_"]/div[2]/div[1]/div[2]/select`
- Botón aplicar: `//*[@id="radix-_r_3_"]/div[2]/div[2]/button[2]`
- Botón limpiar: `//*[@id="radix-_r_3_"]/div[2]/div[2]/button[1]`

### Botones de Acción
- Botón editar: `//tbody/tr[1]/td[5]/div[1]/button[1]`
- Botón estado: `//tbody/tr[1]/td[5]/div[1]/button[2]`

## 📈 Resultados Esperados

- ✅ Listado de mantenimientos se muestra correctamente
- ✅ Navegación entre páginas funciona
- ✅ Búsqueda filtra resultados
- ✅ Filtros por tipo y estado funcionan
- ✅ Botones de acción están disponibles según estado
- ✅ Paginación muestra elementos correctos por página

## 🔍 Precondiciones

- 15 mantenimientos registrados (10 activos, 5 inactivos)
- Diferentes tipos (preventivo, correctivo, predictivo)
- Usuario con credenciales autorizadas
- Acceso al módulo de gestión de mantenimientos
- Navegador configurado para Selenium

## 📝 Notas Técnicas

- Reutiliza las funciones de navegación de `Mantenimiento-Nav.py`
- Utiliza importación dinámica para manejar el nombre del archivo con guiones
- Genera reportes JSON con resultados detallados
- Toma capturas de pantalla para debugging
- Guarda logs del navegador para análisis
