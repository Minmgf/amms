"""
Ejemplo de uso del flujo de navegación a User Management.

Este archivo muestra diferentes formas de usar el flujo de navegación:
1. Ejecutar el flujo completo (login + navegación)
2. Usar el flujo después de un login existente
3. Integrar con otros flujos (como el flujo de admin)

Autor: [Tu nombre]
Fecha: 2025-09-05
"""

import os
import sys
import time

# Agregar el directorio de flows al path
current_dir = os.path.dirname(os.path.abspath(__file__))
flows_dir = os.path.join(current_dir, '..')
sys.path.append(flows_dir)

# Importar el flujo de navegación a usuarios
try:
    from navigate_to_user_list import NavigateToUserListFlow, navigate_to_user_list_flow, navigate_to_user_list_after_login
except ImportError as e:
    print(f"Error importando navigate_to_user_list: {e}")
    raise

# Importar el flujo de login
login_flow_dir = os.path.join(flows_dir, 'auth', 'login')
sys.path.append(login_flow_dir)

try:
    from login_flow import LoginFlow
except ImportError as e:
    print(f"Error importando login_flow: {e}")
    print(f"Directorio esperado: {login_flow_dir}")
    print("Asegúrate de que login_flow.py existe en tests/flows/auth/login/")
    # Para testing, crear una clase mock básica
    class LoginFlow:
        def __init__(self, driver_path):
            self.driver_path = driver_path
            self.driver = None
        def start_browser(self):
            pass
        def login(self, email=None, password=None):
            pass
        def is_logged_in(self):
            return False
        def close_browser(self):
            pass

def ejemplo_flujo_completo():
    """
    Ejemplo 1: Ejecutar el flujo completo desde cero.
    
    Incluye login + navegación + verificación.
    """
    print("=== EJEMPLO 1: Flujo completo ===")
    
    DRIVER_PATH = "../../chromedriver/driver.exe"  # Ajustar según tu estructura
    
    # Opción A: Usar la función wrapper simple
    result = navigate_to_user_list_flow(
        driver_path=DRIVER_PATH,
        email=None,  # Usará variables de entorno
        password=None  # Usará variables de entorno
    )
    
    print("Resultado:")
    print(f"- Éxito: {result['success']}")
    print(f"- Login: {result['login_success']}")
    print(f"- Navegación: {result['navigation_success']}")
    
    if result['verification_result']:
        ver = result['verification_result']
        print(f"- Usuarios encontrados: {ver['user_count']}")
        print(f"- Estado: {ver['loading_state']}")
    
    return result

def ejemplo_flujo_con_clase():
    """
    Ejemplo 2: Usar la clase directamente para mayor control.
    """
    print("=== EJEMPLO 2: Usando la clase directamente ===")
    
    DRIVER_PATH = "../../chromedriver/driver.exe"
    flow = NavigateToUserListFlow(driver_path=DRIVER_PATH)
    
    try:
        # Iniciar navegador
        flow.start_browser()
        
        # Ejecutar login
        login_success = flow.perform_login()
        if not login_success:
            print("Login falló, no se puede continuar")
            return False
        
        print("Login exitoso, navegando a User Management...")
        
        # Navegar al módulo
        nav_success = flow.navigate_to_user_management()
        if not nav_success:
            print("Navegación falló")
            return False
        
        # Verificar carga
        verification = flow.verify_user_list_loaded()
        
        print("Verificación completa:")
        print(f"- Lista cargada: {verification['loaded']}")
        print(f"- Tiene tabla: {verification['has_table']}")
        print(f"- Tiene búsqueda: {verification['has_search']}")
        print(f"- Tiene filtros: {verification['has_filters']}")
        print(f"- Usuarios: {verification['user_count']}")
        
        return verification['loaded']
        
    except Exception as e:
        print(f"Error en el flujo: {e}")
        return False
    finally:
        flow.close_browser()

def ejemplo_despues_de_login():
    """
    Ejemplo 3: Usar el flujo después de un login exitoso.
    
    Útil para combinar con otros flujos.
    """
    print("=== EJEMPLO 3: Navegación después de login existente ===")
    
    DRIVER_PATH = "../../chromedriver/driver.exe"
    
    # Primero hacer login por separado
    login_flow = LoginFlow(DRIVER_PATH)
    
    try:
        # Iniciar navegador y hacer login
        login_flow.start_browser()
        login_flow.login()
        
        if not login_flow.is_logged_in():
            print("Login falló")
            return False
        
        print("Login exitoso, ahora navegando con el flujo de usuarios...")
        
        # Usar el flujo de navegación con el driver existente
        result = navigate_to_user_list_after_login(login_flow.driver)
        
        print(f"Resultado de navegación: {result['success']}")
        
        if result['verification_result']:
            ver = result['verification_result']
            print(f"Usuarios encontrados: {ver['user_count']}")
        
        # Aquí podrías continuar con otros flujos usando el mismo driver
        # Por ejemplo: navegar a otras secciones, ejecutar flujo de admin, etc.
        
        return result['success']
        
    except Exception as e:
        print(f"Error: {e}")
        return False
    finally:
        login_flow.close_browser()

def ejemplo_flujo_combinado_con_admin():
    """
    Ejemplo 4: Combinar con flujo de administrador (simulado).
    
    Muestra cómo usar este flujo como parte de un flujo más grande.
    """
    print("=== EJEMPLO 4: Flujo combinado (Login -> User Management -> Admin Actions) ===")
    
    DRIVER_PATH = "../../chromedriver/driver.exe"
    
    # Paso 1: Ejecutar login
    login_flow = LoginFlow(DRIVER_PATH)
    
    try:
        login_flow.start_browser()
        login_flow.login()
        
        if not login_flow.is_logged_in():
            print("Login falló")
            return False
        
        print("✓ Login exitoso")
        
        # Paso 2: Navegar a User Management
        user_nav_result = navigate_to_user_list_after_login(login_flow.driver)
        
        if not user_nav_result['success']:
            print("✗ Navegación a User Management falló")
            return False
        
        print("✓ Navegación a User Management exitosa")
        print(f"  Usuarios encontrados: {user_nav_result['verification_result']['user_count']}")
        
        # Paso 3: Ejecutar acciones de admin (simulado)
        print("Ejecutando acciones de administrador...")
        
        # Aquí podrías:
        # - Verificar permisos de admin
        # - Navegar a Role Management
        # - Crear/editar usuarios
        # - Revisar audit logs
        # - etc.
        
        # Simulación de acciones adicionales
        time.sleep(2)  # Simular tiempo de procesamiento
        
        # Por ejemplo, navegar a Role Management
        try:
            role_mgmt_link = login_flow.driver.find_element("xpath", "//a[contains(@href, 'roleManagement')]")
            if role_mgmt_link.is_displayed():
                print("✓ Enlace a Role Management disponible (acceso de admin confirmado)")
            else:
                print("⚠ Enlace a Role Management no visible")
        except:
            print("⚠ No se pudo verificar acceso a Role Management")
        
        print("✓ Flujo combinado completado exitosamente")
        return True
        
    except Exception as e:
        print(f"Error en flujo combinado: {e}")
        return False
    finally:
        login_flow.close_browser()

def ejemplo_verificacion_estados_usuarios():
    """
    Ejemplo 5: Verificar estados específicos de usuarios.
    
    Muestra cómo usar el flujo para verificar datos específicos.
    """
    print("=== EJEMPLO 5: Verificación de estados de usuarios ===")
    
    DRIVER_PATH = "../../chromedriver/driver.exe"
    flow = NavigateToUserListFlow(driver_path=DRIVER_PATH)
    
    try:
        # Ejecutar flujo hasta llegar a la lista
        result = flow.execute_complete_flow()
        
        if not result['success']:
            print("No se pudo cargar la lista de usuarios")
            return False
        
        # Verificaciones adicionales específicas
        print("Realizando verificaciones específicas...")
        
        # Verificar que hay filtros de estado
        estado_filters = flow.driver.find_elements("xpath", "//option[contains(text(), 'Activo') or contains(text(), 'Pendiente') or contains(text(), 'Inactivo')]")
        print(f"Filtros de estado encontrados: {len(estado_filters)}")
        
        # Verificar columnas de la tabla
        column_headers = flow.driver.find_elements("css selector", "th")
        column_texts = [header.text for header in column_headers if header.text.strip()]
        print(f"Columnas de la tabla: {column_texts}")
        
        # Verificar que hay datos de usuarios
        user_rows = flow.driver.find_elements("css selector", "tbody tr")
        if user_rows:
            print(f"Filas de usuarios: {len(user_rows)}")
            
            # Verificar estados visibles en la tabla
            status_badges = flow.driver.find_elements("css selector", "tbody tr .rounded-full")
            status_texts = [badge.text for badge in status_badges if badge.text.strip()]
            unique_statuses = list(set(status_texts))
            print(f"Estados de usuario visibles: {unique_statuses}")
        
        return True
        
    except Exception as e:
        print(f"Error en verificación: {e}")
        return False
    finally:
        flow.close_browser()

# Función principal para ejecutar todos los ejemplos
def ejecutar_ejemplos():
    """
    Ejecuta todos los ejemplos disponibles.
    
    Permite seleccionar qué ejemplo ejecutar.
    """
    ejemplos = {
        "1": ("Flujo completo", ejemplo_flujo_completo),
        "2": ("Usando clase directamente", ejemplo_flujo_con_clase),
        "3": ("Después de login existente", ejemplo_despues_de_login),
        "4": ("Flujo combinado con admin", ejemplo_flujo_combinado_con_admin),
        "5": ("Verificación de estados", ejemplo_verificacion_estados_usuarios),
        "all": ("Ejecutar todos", None)
    }
    
    print("Ejemplos disponibles:")
    for key, (desc, _) in ejemplos.items():
        print(f"  {key}: {desc}")
    
    # Para testing automatico, ejecutar ejemplo 1
    print("\nEjecutando ejemplo por defecto...")
    return ejemplo_flujo_completo()

if __name__ == "__main__":
    # Ejecutar ejemplos
    result = ejecutar_ejemplos()
    print(f"\nResultado final: {'Éxito' if result else 'Falló'}")
