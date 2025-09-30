# IT-MAQ-008: Verificar listado con paginación y filtros avanzados

## Descripción del Caso de Prueba

**Título:** Verificar listado con paginación y filtros avanzados  
**Descripción:** Validar el listado de maquinarias con filtros, búsqueda y paginación  
**Precondiciones:** 
- 25 maquinarias registradas con diferentes estados
- Usuario con permisos de consulta

**Datos de Entrada:**
- Filtros: Tipo="Tractor", Estado="Activa"
- Búsqueda: "Banano"
- Página: 1, Elementos: 10

## Estructura del Test

### Pasos (AAA)

#### Arrange
- Crear 25 maquinarias con variedad de datos
- Configurar entorno de prueba (login + navegación a maquinaria)
- Verificar que estamos en la página correcta

#### Act
- Aplicar filtros y búsqueda
- Navegar páginas
- Probar funcionalidades de paginación

#### Assert
- Verificar resultados filtrados
- Verificar paginación correcta
- Verificar acciones disponibles según permisos

## Funcionalidades Probadas

### 1. Funcionalidad de Búsqueda
- **Campo de búsqueda:** `//input[@id='search']`
- **Término de prueba:** "Banano"
- **Verificaciones:**
  - Campo de búsqueda es clickeable
  - Búsqueda se aplica correctamente
  - Resultados se muestran o mensaje de "no encontrado"
  - Búsqueda se puede limpiar

### 2. Funcionalidad de Filtros
- **Botón de filtros:** `//button[@aria-label='Filter Button']`
- **Filtros aplicados:**
  - Tipo: "Tractor"
  - Estado: "Activa"
- **Verificaciones:**
  - Panel de filtros se abre correctamente
  - Campos de filtro son funcionales
  - Filtros se aplican correctamente

### 3. Funcionalidad de Paginación
- **Elementos probados:**
  - Página anterior: `//button[@class='parametrization-pagination-button inline-flex items-center px-3 py-2 text-sm font-medium transition-colors'][contains(text(),'← Previous')]`
  - Página actual: `//button[@class='parametrization-pagination-button inline-flex items-center justify-center w-10 h-10 text-sm font-medium transition-colors active']`
  - Página siguiente: `//button[@class='parametrization-pagination-button inline-flex items-center px-3 py-2 text-sm font-medium transition-colors'][contains(text(),'Next →')]`
  - Elementos por página: `//select[@class='parametrization-pagination-select px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500']`

- **Verificaciones:**
  - Elementos de paginación son visibles
  - Navegación entre páginas funciona
  - Cambio de elementos por página funciona
  - Estado de paginación se actualiza correctamente

## Archivos del Test

### `test_IT_MAQ_008_pagination_filters.py`
Archivo principal que contiene todas las funciones de prueba:

#### Funciones Principales
- `setup_test_environment(headless=False)`: Configura login y navegación
- `test_search_functionality(driver)`: Prueba la funcionalidad de búsqueda
- `test_filter_functionality(driver)`: Prueba los filtros avanzados
- `test_pagination_functionality(driver)`: Prueba la paginación
- `verify_machinery_listing(driver)`: Verifica el listado básico
- `run_it_maq_008(driver=None, headless=False)`: Ejecuta la prueba completa
- `cleanup_test_environment(driver, test_name)`: Limpia el entorno

#### Funciones Auxiliares
- `wait_for_page_load(driver, timeout=10)`: Espera carga completa de página

## Uso del Test

### Ejecución Directa
```bash
cd tests/test_case/IT-MAQ-008
python test_IT_MAQ_008_pagination_filters.py
```

### Importación desde Otros Tests
```python
from test_case.IT_MAQ_008.test_IT_MAQ_008_pagination_filters import setup_test_environment, run_it_maq_008

# Configurar entorno
driver = setup_test_environment(headless=False)

# Ejecutar prueba completa
success = run_it_maq_008(driver)

# Limpiar entorno
cleanup_test_environment(driver, "IT-MAQ-008")
```

### Ejecución de Funciones Individuales
```python
from test_case.IT_MAQ_008.test_IT_MAQ_008_pagination_filters import setup_test_environment, test_search_functionality, test_filter_functionality, test_pagination_functionality

driver = setup_test_environment()

# Probar solo búsqueda
search_success = test_search_functionality(driver)

# Probar solo filtros
filter_success = test_filter_functionality(driver)

# Probar solo paginación
pagination_success = test_pagination_functionality(driver)
```

## Configuración

### Variables de Entorno
El test utiliza las siguientes variables del archivo `.env`:
- `EMAIL`: Email del usuario para login
- `PASSWORD`: Contraseña del usuario
- `HEADLESS`: Si ejecutar en modo headless (true/false)

### Credenciales por Defecto
Si no se encuentran en `.env`, se usan:
- Email: `danielsr_1997@hotmail.com`
- Contraseña: `Usuario9924.`

## Resultados Esperados

### Resultado Esperado
- Listado filtrado correcto
- Paginación funcional
- Acciones disponibles según permisos

### Criterios de Éxito
-  **Todas las pruebas exitosas:** 100% de funcionalidades funcionando
-  **Pruebas mayormente exitosas:** ≥66.7% de funcionalidades funcionando
-  **Pruebas fallidas:** <66.7% de funcionalidades funcionando

### Reporte de Resultados
El test genera un reporte detallado que incluye:
- Estado de cada funcionalidad probada
- Tasa de éxito general
- Información de debugging
- Logs del navegador (en caso de errores)

## Dependencias

### Módulos Requeridos
- `selenium`: Para automatización del navegador
- `webdriver-manager`: Para gestión automática de ChromeDriver
- `python-dotenv`: Para carga de variables de entorno

### Módulos del Proyecto
- `flows.auth.login.selenium_login_flow`: Para autenticación
- `flows.navigation.machinery_navigation`: Para navegación a maquinaria

## Troubleshooting

### Problemas Comunes

1. **Elementos no encontrados:**
   - Verificar que la página de maquinaria esté cargada completamente
   - Revisar que los selectores XPath sean correctos
   - Aumentar tiempo de espera si es necesario

2. **Filtros no funcionan:**
   - Verificar que el panel de filtros se abra correctamente
   - Revisar nombres de campos de filtro
   - Comprobar que los valores de filtro existan en las opciones

3. **Paginación no responde:**
   - Verificar que hay suficientes elementos para paginar
   - Comprobar que los botones estén habilitados
   - Revisar que la página se actualice después de cambios

### Logs y Debugging
- Los logs del navegador se guardan automáticamente en caso de errores
- Ubicación de logs: `logs/IT-MAQ-008_browser_console.log`
- El test incluye información detallada de debugging en consola

## Estado del Test

- **Estado:** Pendiente de ejecución
- **Fecha:** Pendiente
- **Ejecutado por:** Pendiente
- **Resultado Obtenido:** Pendiente

---

*Este test forma parte de la suite de pruebas automatizadas del sistema AMMS (Agricultural Machinery Management System).*
