"""
Ejemplo de integración del flujo de User Management con otros flujos.

Este archivo muestra cómo importar y usar el flujo de navegación a User Management
desde otros flujos, especialmente útil para flujos de administrador que necesitan
verificar la gestión de usuarios.

Autor: Juan Nicolás Urrutia Salcedo
Fecha: 2025-09-05
"""

import os
import sys
import time

# Configurar paths para imports
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)
sys.path.append(os.path.join(current_dir, '..', 'auth', 'login'))

def flujo_admin_completo():
    """
    Ejemplo de flujo completo de administrador que incluye:
    1. Login como admin
    2. Navegación a User Management
    3. Verificación de funcionalidades de admin
    4. Ejecución de tareas administrativas
    
    Returns:
        dict: Resultado del flujo completo
    """
    print("=== INICIANDO FLUJO DE ADMINISTRADOR COMPLETO ===")
    
    try:
        # Importar flujos necesarios
        from navigate_to_user_list import NavigateToUserListFlow
        
        # También se puede importar el flujo de login si existe
        try:
            from login_flow import LoginFlow
        except ImportError:
            print("Advertencia: login_flow no disponible, usando navegación directa")
            LoginFlow = None
        
        DRIVER_PATH = "../../chromedriver/driver.exe"
        
        # Credenciales de administrador
        ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'admin@empresa.com')
        ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'admin123')
        
        result = {
            'success': False,
            'login_success': False,
            'user_management_access': False,
            'admin_functions_verified': False,
            'tasks_completed': [],
            'error': None
        }
        
        # === PASO 1: LOGIN COMO ADMINISTRADOR ===
        print("\n1. Ejecutando login como administrador...")
        
        if LoginFlow:
            # Usar flujo de login existente
            login_flow = LoginFlow(DRIVER_PATH)
            login_flow.start_browser()
            login_flow.login(ADMIN_EMAIL, ADMIN_PASSWORD)
            
            if not login_flow.is_logged_in():
                result['error'] = "Login de administrador falló"
                return result
            
            driver = login_flow.driver
            result['login_success'] = True
            print("✓ Login de administrador exitoso")
        else:
            # Crear navegación directa si no hay flujo de login
            user_flow = NavigateToUserListFlow(driver_path=DRIVER_PATH)
            user_flow.start_browser()
            user_flow.perform_login(ADMIN_EMAIL, ADMIN_PASSWORD)
            driver = user_flow.driver
            result['login_success'] = True
        
        # === PASO 2: NAVEGAR A USER MANAGEMENT ===
        print("\n2. Navegando a User Management...")
        
        from navigate_to_user_list import navigate_to_user_list_after_login
        
        nav_result = navigate_to_user_list_after_login(driver)
        
        if not nav_result['success']:
            result['error'] = f"Navegación a User Management falló: {nav_result.get('error')}"
            return result
        
        result['user_management_access'] = True
        print("✓ Acceso a User Management confirmado")
        
        verification = nav_result['verification_result']
        print(f"  - Usuarios en lista: {verification['user_count']}")
        print(f"  - Tabla cargada: {verification['has_table']}")
        print(f"  - Búsqueda disponible: {verification['has_search']}")
        
        # === PASO 3: VERIFICAR FUNCIONALIDADES DE ADMIN ===
        print("\n3. Verificando funcionalidades de administrador...")
        
        admin_functions = verificar_funciones_admin(driver)
        result['admin_functions_verified'] = admin_functions['all_verified']
        
        for func, status in admin_functions['functions'].items():
            print(f"  - {func}: {'✓' if status else '✗'}")
        
        # === PASO 4: EJECUTAR TAREAS ADMINISTRATIVAS ===
        print("\n4. Ejecutando tareas administrativas...")
        
        # Tarea 1: Verificar filtros de usuario
        if ejecutar_tarea_filtros_usuario(driver):
            result['tasks_completed'].append('filtros_usuario')
            print("✓ Tarea: Filtros de usuario verificados")
        
        # Tarea 2: Verificar acceso a Role Management
        if ejecutar_tarea_role_management(driver):
            result['tasks_completed'].append('role_management_access')
            print("✓ Tarea: Acceso a Role Management verificado")
        
        # Tarea 3: Verificar botón de agregar usuario
        if ejecutar_tarea_agregar_usuario(driver):
            result['tasks_completed'].append('add_user_button')
            print("✓ Tarea: Botón 'Add User' verificado")
        
        # Tarea 4: Verificar acceso a Audit Log
        if ejecutar_tarea_audit_log(driver):
            result['tasks_completed'].append('audit_log_access')
            print("✓ Tarea: Acceso a Audit Log verificado")
        
        # === RESULTADO FINAL ===
        if (result['login_success'] and 
            result['user_management_access'] and 
            result['admin_functions_verified'] and
            len(result['tasks_completed']) >= 2):  # Al menos 2 tareas completadas
            
            result['success'] = True
            print("\n✓ FLUJO DE ADMINISTRADOR COMPLETADO EXITOSAMENTE")
        else:
            result['error'] = "No se completaron todos los requisitos del flujo"
        
        return result
        
    except Exception as e:
        print(f"\nError en flujo de administrador: {e}")
        return {
            'success': False,
            'error': str(e),
            'login_success': False,
            'user_management_access': False,
            'admin_functions_verified': False,
            'tasks_completed': []
        }
    
    finally:
        # Limpiar recursos
        try:
            if 'driver' in locals():
                driver.quit()
        except:
            pass

def verificar_funciones_admin(driver):
    """
    Verifica que las funcionalidades de administrador estén disponibles.
    
    Args:
        driver: Driver de Selenium activo
        
    Returns:
        dict: Estado de las funciones de admin
    """
    from selenium.webdriver.common.by import By
    from selenium.common.exceptions import NoSuchElementException
    
    functions = {
        'add_user_button': False,
        'role_management_link': False,
        'audit_log_link': False,
        'user_filters': False,
        'user_table': False
    }
    
    try:
        # Verificar botón "Add User"
        add_user_selectors = [
            (By.XPATH, "//button[contains(text(), 'Add user')]"),
            (By.CSS_SELECTOR, "button[class*='bg-blue']"),
            (By.XPATH, "//button[contains(@class, 'bg-blue-600')]")
        ]
        
        for by, selector in add_user_selectors:
            try:
                element = driver.find_element(by, selector)
                if element.is_displayed():
                    functions['add_user_button'] = True
                    break
            except NoSuchElementException:
                continue
        
        # Verificar enlaces de administrador
        admin_links = driver.find_elements(By.XPATH, "//a[contains(@href, 'roleManagement') or contains(@href, 'auditLog')]")
        
        for link in admin_links:
            if 'roleManagement' in link.get_attribute('href'):
                functions['role_management_link'] = True
            elif 'auditLog' in link.get_attribute('href'):
                functions['audit_log_link'] = True
        
        # Verificar filtros de usuario
        filters = driver.find_elements(By.CSS_SELECTOR, "select")
        functions['user_filters'] = len(filters) >= 2  # Estado y Rol
        
        # Verificar tabla de usuarios
        table = driver.find_elements(By.CSS_SELECTOR, "table")
        functions['user_table'] = len(table) > 0
        
    except Exception as e:
        print(f"Error verificando funciones de admin: {e}")
    
    all_verified = all(functions.values())
    
    return {
        'functions': functions,
        'all_verified': all_verified
    }

def ejecutar_tarea_filtros_usuario(driver):
    """
    Tarea: Verificar y probar los filtros de usuario.
    """
    try:
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import Select
        
        print("    Probando filtros de usuario...")
        
        # Buscar dropdown de estado
        estado_select = driver.find_element(By.XPATH, "//select[.//option[contains(text(), 'Activo')]]")
        
        if estado_select.is_displayed():
            # Probar cambio de filtro
            select = Select(estado_select)
            select.select_by_visible_text("Activo")
            time.sleep(1)
            
            # Volver a "Todos los estados"
            select.select_by_index(0)
            time.sleep(1)
            
            return True
            
    except Exception as e:
        print(f"    Error en filtros: {e}")
        
    return False

def ejecutar_tarea_role_management(driver):
    """
    Tarea: Verificar acceso a Role Management.
    """
    try:
        from selenium.webdriver.common.by import By
        
        print("    Verificando acceso a Role Management...")
        
        # Buscar enlace de Role Management
        role_mgmt_link = driver.find_element(By.XPATH, "//a[contains(@href, 'roleManagement')]")
        
        if role_mgmt_link.is_displayed():
            # Hacer clic y verificar navegación
            original_url = driver.current_url
            role_mgmt_link.click()
            time.sleep(2)
            
            # Verificar que navegamos
            if driver.current_url != original_url and 'roleManagement' in driver.current_url:
                # Volver a User Management
                driver.back()
                time.sleep(1)
                return True
                
    except Exception as e:
        print(f"    Error en Role Management: {e}")
        
    return False

def ejecutar_tarea_agregar_usuario(driver):
    """
    Tarea: Verificar botón de agregar usuario.
    """
    try:
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        
        print("    Verificando botón 'Add User'...")
        
        # Buscar botón Add User
        add_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Add user')]")
        
        if add_button.is_displayed() and add_button.is_enabled():
            # Hacer clic para abrir modal
            add_button.click()
            
            # Esperar que aparezca el modal
            wait = WebDriverWait(driver, 5)
            modal = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[role='dialog'], .modal, .fixed")))
            
            if modal.is_displayed():
                # Cerrar modal (buscar botón de cerrar)
                close_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Cancel') or contains(text(), 'Cerrar')]")
                if close_buttons:
                    close_buttons[0].click()
                    time.sleep(1)
                    
                return True
                
    except Exception as e:
        print(f"    Error en Add User: {e}")
        
    return False

def ejecutar_tarea_audit_log(driver):
    """
    Tarea: Verificar acceso a Audit Log.
    """
    try:
        from selenium.webdriver.common.by import By
        
        print("    Verificando acceso a Audit Log...")
        
        # Buscar enlace de Audit Log
        audit_link = driver.find_element(By.XPATH, "//a[contains(@href, 'auditLog')]")
        
        return audit_link.is_displayed()
        
    except Exception as e:
        print(f"    Error en Audit Log: {e}")
        
    return False

def ejecutar_con_login_existente(existing_driver):
    """
    Ejecuta el flujo de admin usando un driver con login ya realizado.
    
    Args:
        existing_driver: Driver de Selenium con sesión activa
        
    Returns:
        dict: Resultado del flujo
    """
    print("=== FLUJO DE ADMIN CON LOGIN EXISTENTE ===")
    
    try:
        from navigate_to_user_list import navigate_to_user_list_after_login
        
        # Navegar a User Management
        nav_result = navigate_to_user_list_after_login(existing_driver)
        
        if not nav_result['success']:
            return {
                'success': False,
                'error': 'No se pudo acceder a User Management',
                'navigation_result': nav_result
            }
        
        # Verificar funciones de admin
        admin_functions = verificar_funciones_admin(existing_driver)
        
        return {
            'success': admin_functions['all_verified'],
            'navigation_result': nav_result,
            'admin_functions': admin_functions,
            'error': None if admin_functions['all_verified'] else 'Funciones de admin incompletas'
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'navigation_result': None,
            'admin_functions': None
        }

# Funciones de conveniencia para importar en otros flujos
def import_user_management_flow():
    """Importa el flujo de User Management de forma segura."""
    try:
        from navigate_to_user_list import navigate_to_user_list_after_login
        return navigate_to_user_list_after_login
    except ImportError as e:
        print(f"Error importando User Management flow: {e}")
        return None

def verificar_es_admin(driver):
    """
    Verifica si el usuario actual tiene permisos de administrador.
    
    Args:
        driver: Driver de Selenium activo
        
    Returns:
        bool: True si tiene permisos de admin
    """
    admin_check = verificar_funciones_admin(driver)
    return admin_check['all_verified']

if __name__ == "__main__":
    # Ejecutar flujo completo de admin
    result = flujo_admin_completo()
    
    print("\n" + "="*50)
    print("RESULTADO FINAL DEL FLUJO DE ADMINISTRADOR")
    print("="*50)
    print(f"Éxito general: {result['success']}")
    print(f"Login exitoso: {result['login_success']}")
    print(f"Acceso a User Management: {result['user_management_access']}")
    print(f"Funciones de admin verificadas: {result['admin_functions_verified']}")
    print(f"Tareas completadas: {len(result['tasks_completed'])}")
    
    for task in result['tasks_completed']:
        print(f"  ✓ {task}")
    
    if result['error']:
        print(f"Error: {result['error']}")
    
    print("="*50)
