# Role Management Flow

Automatización para navegar a la vista de Role Management después del login.

## Características

- ✅ **Login automático** usando credenciales del archivo `.env`
- ✅ **Navegación directa** via URL con fallback a sidebar
- ✅ **Modo headless** configurable via `HEADLESS=True/False` en `.env`
- ✅ **Ventana maximizada** por defecto (1920x1080 en headless)
- ✅ **Operación silenciosa** para integración en pruebas
- ✅ **Selectores robustos** que funcionan en diferentes estados del UI

## Uso Rápido

### Ejecución Directa
```bash
# Desde la raíz del proyecto tests/
python flows/roleManagement/role_management_flow.py
```

### Importación en Pruebas
```python
from flows.roleManagement.role_management_flow import execute_role_management_flow

# Uso básico
result = execute_role_management_flow("./chromedriver/driver.exe")

if result['success']:
    verification = result['verification_result']
    print(f"Role Management cargado - {verification['role_count']} roles encontrados")
    print(f"URL: {verification['current_url']}")
else:
    print(f"Error: {result['error']}")
```

### Uso Avanzado
```python
from flows.roleManagement.role_management_flow import RoleManagementFlow

# Control completo del flujo
flow = RoleManagementFlow("./chromedriver/driver.exe")
result = flow.execute_complete_flow()
```

## Configuración

### Variables de Entorno (archivo `.env`)
```env
EMAIL=tu_email@ejemplo.com
PASSWORD=tu_contraseña
HEADLESS=False  # True para modo sin ventana, False para ventana visible
```

### Dependencias
- Selenium >= 4.0.0
- python-dotenv
- ChromeDriver compatible

## Estrategia de Navegación

1. **Navegación Directa**: Intenta acceder directamente a `/dashboard/role-management`
2. **Fallback Sidebar**: Si falla, expande el sidebar y busca el enlace a Role Management
3. **Verificación Múltiple**: Valida carga usando URL y elementos característicos

## Selectores de Verificación

El flujo verifica la carga exitosa buscando:
- URLs que contengan 'role' y 'management'
- Elementos H1/H2 con texto "Role Management" o "Gestión de Roles"
- Botones para crear nuevos roles
- Elementos con clases relacionadas a roles

## Integración con Pytest

```python
def test_role_management_navigation():
    from flows.roleManagement.role_management_flow import execute_role_management_flow
    
    result = execute_role_management_flow()
    assert result['success'], f"Navegación falló: {result.get('error')}"
    
    verification = result['verification_result']
    assert verification['role_count'] >= 0, "No se pudo obtener información de roles"
```

## Notas de Desarrollo

- Este flujo sigue el mismo patrón que `userManagement` y `auth/login`
- Incluye funcionalidad de login integrada para evitar dependencias de importación
- Diseñado para ser silencioso y reutilizable en pruebas de integración
- Maneja automáticamente diferentes resoluciones y estados del sidebar

---

**Autor**: Juan Nicolás Urrutia Salcedo  
**Fecha**: 2025-09-05  
**Versión**: 1.0
