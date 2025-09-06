# Flujo de Navegación a User Management

Este módulo contiene la automatización para navegar desde el login hasta el módulo de gestión de usuarios donde se listan todos los usuarios y sus estados actuales.

## Archivos

- `navigate_to_user_list.py`: Flujo principal de navegación
- `ejemplo_uso_navigate_to_user_list.py`: Ejemplos de uso del flujo
- `README.md`: Esta documentación

## Funcionalidades

### Características Principales

1. **Login Automático**: Integra con el flujo de login existente
2. **Navegación Inteligente**: Busca múltiples selectores para encontrar el enlace de User Management
3. **Verificación Completa**: Confirma que la lista de usuarios se cargó correctamente
4. **Reutilizable**: Puede ser importado y usado en otros flujos
5. **Robusto**: Maneja errores y diferentes estados de carga

### Elementos Verificados

- ✅ Título "User Management"
- ✅ Campo de búsqueda de usuarios
- ✅ Filtros de estado (Activo, Pendiente, Inactivo)
- ✅ Filtros de rol
- ✅ Tabla de usuarios con columnas:
  - Nombre completo
  - Tipo de documento
  - Número de documento
  - Email
  - Roles
  - Estado
- ✅ Contador de usuarios
- ✅ Paginación
- ✅ Estados de carga y error

## Uso

### 1. Uso Simple (Flujo Completo)

```python
from navigate_to_user_list import navigate_to_user_list_flow

# Ejecutar flujo completo: login + navegación + verificación
result = navigate_to_user_list_flow(
    driver_path="./chromedriver/driver.exe",
    email=None,  # Usa variables de entorno
    password=None  # Usa variables de entorno
)

if result['success']:
    print(f"Usuarios encontrados: {result['verification_result']['user_count']}")
else:
    print(f"Error: {result['error']}")
```

### 2. Uso Después de Login Existente

```python
from navigate_to_user_list import navigate_to_user_list_after_login
from login_flow import LoginFlow

# Primero hacer login
login_flow = LoginFlow("./chromedriver/driver.exe")
login_flow.start_browser()
login_flow.login()

if login_flow.is_logged_in():
    # Usar el driver existente para navegación
    result = navigate_to_user_list_after_login(login_flow.driver)
    
    if result['success']:
        print("Navegación exitosa")
    
    # Continuar con otros flujos...
    
login_flow.close_browser()
```

### 3. Uso con Clase para Mayor Control

```python
from navigate_to_user_list import NavigateToUserListFlow

flow = NavigateToUserListFlow(driver_path="./chromedriver/driver.exe")

try:
    flow.start_browser()
    
    # Login
    if flow.perform_login():
        # Navegación
        if flow.navigate_to_user_management():
            # Verificación detallada
            verification = flow.verify_user_list_loaded()
            
            print(f"Lista cargada: {verification['loaded']}")
            print(f"Usuarios: {verification['user_count']}")
            print(f"Tiene tabla: {verification['has_table']}")
            print(f"Tiene búsqueda: {verification['has_search']}")
            print(f"Tiene filtros: {verification['has_filters']}")
            
finally:
    flow.close_browser()
```

### 4. Integración con Flujo de Admin

```python
# Flujo combinado para testing de admin
def flujo_admin_completo():
    # 1. Login como admin
    login_flow = LoginFlow("./chromedriver/driver.exe")
    login_flow.start_browser()
    login_flow.login("admin@empresa.com", "admin_password")
    
    if not login_flow.is_logged_in():
        return False
    
    # 2. Navegar a User Management
    result = navigate_to_user_list_after_login(login_flow.driver)
    
    if not result['success']:
        return False
    
    # 3. Verificar funciones de admin (crear usuario, etc.)
    # ... código de testing de admin ...
    
    login_flow.close_browser()
    return True
```

## Estructura del Resultado

### Resultado de `execute_complete_flow()`

```python
{
    'success': bool,           # True si todo fue exitoso
    'login_success': bool,     # True si login fue exitoso
    'navigation_success': bool,# True si navegación fue exitosa
    'verification_result': {   # Detalles de verificación
        'loaded': bool,        # True si lista cargó
        'user_count': int,     # Número de usuarios encontrados
        'has_table': bool,     # True si tabla está presente
        'has_search': bool,    # True si campo de búsqueda existe
        'has_filters': bool,   # True si filtros existen
        'loading_state': str   # Estado: 'loaded_with_data', 'loaded_empty', 'error', etc.
    },
    'error': str              # Mensaje de error si algo falló
}
```

### Estados de Carga Posibles

- `'loading'`: Indicador de carga visible
- `'loaded_with_data'`: Lista cargada con usuarios
- `'loaded_empty'`: Lista cargada pero sin usuarios
- `'loaded_no_data'`: Lista cargada con mensaje de "sin datos"
- `'table_structure_only'`: Solo estructura de tabla visible
- `'error'`: Error en la carga
- `'unknown'`: Estado no determinado

## Selectores Utilizados

### Navegación a User Management

El flujo busca estos selectores en orden de prioridad:

1. `By.PARTIAL_LINK_TEXT, "User Management"`
2. `By.LINK_TEXT, "User Management"`
3. `By.XPATH, "//span[contains(text(), 'User Management')]/parent::*"`
4. `By.XPATH, "//a[contains(@href, '/userManagement')]"`
5. `By.CSS_SELECTOR, "a[href*='userManagement']"`

Si ningún selector funciona, intenta navegación directa por URL.

### Verificación de Elementos

- **Título**: `//h1[contains(text(), 'User Management')]`
- **Búsqueda**: `input[placeholder*='Buscar usuarios']`
- **Filtros**: `select` elements
- **Tabla**: `table`, `thead`, `tbody`
- **Filas de datos**: `tbody tr`
- **Estados**: `.rounded-full` (badges de estado)

## Configuración

### Variables de Entorno

Crear archivo `.env` en el directorio `tests/`:

```env
EMAIL=usuario@empresa.com
PASSWORD=tu_password
```

### Estructura de Archivos

```
tests/
├── flows/
│   ├── auth/
│   │   └── login/
│   │       └── login_flow.py
│   └── userManagement/
│       ├── navigate_to_user_list.py
│       ├── ejemplo_uso_navigate_to_user_list.py
│       └── README.md
├── chromedriver/
│   └── driver.exe
└── .env
```

## Manejo de Errores

### Errores Comunes y Soluciones

1. **Import Error**: Verificar que los paths en `sys.path.append()` sean correctos
2. **Driver Not Found**: Verificar ruta de `chromedriver.exe`
3. **Login Failed**: Verificar credenciales en `.env`
4. **Navigation Failed**: Verificar que la aplicación esté corriendo en `localhost:3000`
5. **Elements Not Found**: La aplicación puede haber cambiado, verificar selectores

### Debugging

Para ver más información durante la ejecución:

```python
# Activar modo debug (agregar prints adicionales)
import logging
logging.basicConfig(level=logging.DEBUG)

# Ver HTML de la página cuando falla
if not result['success']:
    print("HTML actual:", flow.driver.page_source[:1000])
```

## Testing

### Ejecutar Tests

```bash
# Ejecutar flujo completo
python navigate_to_user_list.py

# Ejecutar ejemplos
python ejemplo_uso_navigate_to_user_list.py

# Desde directorio raíz del proyecto
cd tests/flows/userManagement
python navigate_to_user_list.py
```

### Integración con Pytest

```python
import pytest
from navigate_to_user_list import NavigateToUserListFlow

class TestUserManagementNavigation:
    
    @pytest.fixture
    def flow(self):
        return NavigateToUserListFlow("../../chromedriver/driver.exe")
    
    def test_complete_flow(self, flow):
        result = flow.execute_complete_flow()
        assert result['success'] == True
        assert result['verification_result']['loaded'] == True
    
    def test_user_count_positive(self, flow):
        result = flow.execute_complete_flow()
        assert result['verification_result']['user_count'] >= 0
```

## Contribución

Al modificar este flujo:

1. Mantener compatibilidad con la estructura existente
2. Agregar comentarios descriptivos
3. Manejar nuevos casos de error
4. Actualizar selectores si la UI cambia
5. Mantener la documentación actualizada

## Notas

- El flujo está diseñado para la aplicación AMMS corriendo en `localhost:3000`
- Compatible con la estructura de rutas de Next.js
- Utiliza selectores robustos que funcionan con diferentes estados de la UI
- Puede ser extendido para verificar funcionalidades específicas de usuarios
