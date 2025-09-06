"""
Ejemplo de uso del flujo consolidado de User Management

Este archivo muestra cómo importar y usar el flujo de User Management
en casos de prueba de integración.

Autor: Juan Nicolás Urrutia Salcedo
Fecha: 2025-09-05
"""

# Ejemplo 1: Uso básico - Flujo completo
def ejemplo_flujo_completo():
    """Ejecutar el flujo completo de User Management"""
    from user_management_flow import execute_user_management_flow
    
    result = execute_user_management_flow(
        driver_path="./chromedriver/driver.exe"
    )
    
    if result['success']:
        print(f"User Management exitoso - {result['verification_result']['user_count']} usuarios encontrados")
        return True
    else:
        print(f"Error: {result['error']}")
        return False


# Ejemplo 2: Uso con driver existente
def ejemplo_con_driver_existente():
    """Usar User Management después de un login previo"""
    from user_management_flow import execute_with_existing_driver
    from login_flow import LoginFlow  # Si existe
    
    # Login previo
    login = LoginFlow("../../chromedriver/driver.exe")
    login.start_browser()
    login.login()
    
    if login.is_logged_in():
        # Usar el driver existente
        result = execute_with_existing_driver(login.driver)
        
        if result['success']:
            print("✓ User Management accesible")
            # Continuar con otros flujos...
        
        login.close_browser()
        return result['success']
    
    return False


# Ejemplo 3: Verificar si es admin
def ejemplo_verificar_admin():
    """Verificar permisos de administrador"""
    from user_management_flow import verify_admin_access
    from login_flow import LoginFlow
    
    login = LoginFlow("../../chromedriver/driver.exe")
    login.start_browser()
    login.login()
    
    if login.is_logged_in():
        is_admin = verify_admin_access(login.driver)
        print(f"Usuario es admin: {'✓' if is_admin else '✗'}")
        
        login.close_browser()
        return is_admin
    
    return False


if __name__ == "__main__":
    print("=== Ejemplo 1: Flujo completo ===")
    ejemplo_flujo_completo()
