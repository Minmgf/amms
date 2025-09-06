"""
Ejemplo de uso del flujo de Role Management

Este archivo muestra cómo importar y usar el flujo de Role Management
en casos de prueba de integración.

Autor: Juan Nicolás Urrutia Salcedo
Fecha: 2025-09-05
"""

# Ejemplo 1: Uso básico - Flujo completo
def ejemplo_flujo_completo():
    """Ejecutar el flujo completo de Role Management"""
    from role_management_flow import execute_role_management_flow
    
    result = execute_role_management_flow(
        driver_path="./chromedriver/driver.exe"
    )
    
    if result['success']:
        verification = result['verification_result']
        print(f"Role Management exitoso - {verification['role_count']} roles encontrados")
        return True
    else:
        print(f"Error: {result['error']}")
        return False

# Ejemplo 2: Uso avanzado - Con manejo de errores
def ejemplo_con_manejo_errores():
    """Ejemplo con manejo completo de errores"""
    from role_management_flow import RoleManagementFlow
    
    try:
        flow = RoleManagementFlow("./chromedriver/driver.exe")
        result = flow.execute_complete_flow()
        
        if result['success']:
            verification = result['verification_result']
            print(f"✓ Role Management cargado")
            print(f"  URL: {verification['current_url']}")
            print(f"  Roles encontrados: {verification['role_count']}")
            return True
        else:
            print(f"✗ Error: {result['error']}")
            return False
            
    except Exception as e:
        print(f"✗ Error inesperado: {e}")
        return False

# Ejemplo 3: Para pruebas de integración
def test_role_management_navigation():
    """Función de prueba que puede ser usada en pytest"""
    from role_management_flow import execute_role_management_flow
    
    result = execute_role_management_flow()
    assert result['success'], f"Role Management falló: {result.get('error', 'Error desconocido')}"
    
    # Verificar que se encontraron roles o al menos se cargó la página
    verification = result['verification_result']
    assert verification['role_count'] >= 0, "No se pudo obtener información de roles"
    
    print("Test de navegación a Role Management: EXITOSO")

if __name__ == "__main__":
    print("Probando flujo de Role Management...")
    ejemplo_flujo_completo()
