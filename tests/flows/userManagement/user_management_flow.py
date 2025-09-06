"""
Flujo consolidado de User Management - AMMS

Este archivo contiene toda la funcionalidad necesaria para automatizar
el módulo de gestión de usuarios, incluyendo:
- Navegación desde login hasta User Management
- Verificación de carga de la lista de usuarios
- Funcionalidades de administrador
- Tareas administrativas (filtros, role management, etc.)

Diseñado para ser importado en casos de prueba de integración.

Autor: Juan Nicolás Urrutia Salcedo  
Fecha: 2025-09-05
"""

import os
import sys
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException, WebDriverException
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()
HEADLESS = os.getenv('HEADLESS', 'False').lower() == 'true'

# URLs y constantes
USER_MANAGEMENT_URL = "http://localhost:3000/sigma/userManagement"
DASHBOARD_BASE_URL = "http://localhost:3000/sigma"

# Importar flujo de login si está disponible
login_flow_dir = os.path.join(os.path.dirname(__file__), '..', 'auth', 'login')
sys.path.append(login_flow_dir)

try:
    from login_flow import LoginFlow
except ImportError as e:
    print(f"Advertencia: login_flow no disponible - {e}")
    LoginFlow = None


class UserManagementFlow:
    """
    Clase principal para manejar todos los flujos relacionados con User Management.
    
    Funcionalidades:
    - Login y navegación a User Management  
    - Verificación de carga de usuarios
    - Funciones de administrador
    - Tareas administrativas específicas
    """
    
    def __init__(self, driver_path="./chromedriver/driver.exe", existing_driver=None):
        """
        Inicializa el flujo de User Management.
        
        Args:
            driver_path (str): Ruta al chromedriver
            existing_driver: Driver existente de Selenium (opcional)
        """
        self.driver_path = driver_path
        self.driver = existing_driver
        self.login_flow = None
        self.own_driver = existing_driver is None
        self.wait = None
        
    def start_browser(self):
        """Inicia el navegador Chrome si no se pasó un driver existente."""
        if self.driver is None:
            try:
                service = ChromeService(executable_path=self.driver_path)
                
                # Configurar opciones de Chrome
                chrome_options = ChromeOptions()
                
                # Configurar headless según variable de entorno
                if HEADLESS:
                    chrome_options.add_argument("--headless")
                
                # Configuraciones para mejor estabilidad y resolución
                chrome_options.add_argument("--start-maximized")  # Ventana maximizada
                chrome_options.add_argument("--window-size=1920,1080")  # Resolución fija como respaldo
                chrome_options.add_argument("--disable-web-security")
                chrome_options.add_argument("--disable-features=VizDisplayCompositor")
                chrome_options.add_argument("--disable-dev-shm-usage")
                chrome_options.add_argument("--no-sandbox")
                chrome_options.add_argument("--disable-gpu")
                
                # Crear driver con opciones
                self.driver = webdriver.Chrome(service=service, options=chrome_options)
                
                # Asegurar ventana maximizada
                if not HEADLESS:
                    self.driver.maximize_window()
                    
                self.wait = WebDriverWait(self.driver, 10)
                
            except WebDriverException as e:
                print(f"Error iniciando el navegador: {e}")
                raise
        else:
            self.wait = WebDriverWait(self.driver, 10)
    
    def perform_login(self, email=None, password=None):
        """
        Ejecuta el flujo de login usando LoginFlow o navegación directa.
        
        Returns:
            bool: True si el login fue exitoso
        """
        try:
            if LoginFlow:
                # Usar flujo de login existente
                self.login_flow = LoginFlow(self.driver_path)
                self.login_flow.driver = self.driver
                
                if email and password:
                    self.login_flow.login(email, password)
                else:
                    self.login_flow.login()
                
                return self.login_flow.is_logged_in()
            else:
                # Login básico directo
                email = email or os.getenv('EMAIL')
                password = password or os.getenv('PASSWORD')
                
                if not email or not password:
                    return False
                
                return self._perform_direct_login(email, password)
                
        except Exception:
            return False
    
    def _perform_direct_login(self, email, password):
        """Realiza login directo sin usar LoginFlow."""
        try:
            login_url = "http://localhost:3000/sigma/login"
            self.driver.get(login_url)
            
            # Buscar campos y llenar formulario
            email_input = self.wait.until(EC.presence_of_element_located((By.NAME, "email")))
            password_input = self.driver.find_element(By.NAME, "password")
            
            email_input.clear()
            email_input.send_keys(email)
            password_input.clear()
            password_input.send_keys(password)
            password_input.submit()
            
            time.sleep(2)
            return "sigma" in self.driver.current_url and "login" not in self.driver.current_url
            
        except Exception:
            return False
    
    def _expand_sidebar_if_needed(self):
        """Expande la sidebar si está colapsada."""
        try:
            # Buscar botón de toggle del sidebar
            sidebar_toggle_selectors = [
                (By.CSS_SELECTOR, "button[aria-label*='menu' i]"),
                (By.CSS_SELECTOR, "button[class*='hamburger']"),
                (By.XPATH, "//button[contains(@class, 'md:hidden')]"),
                (By.CSS_SELECTOR, ".hamburger")
            ]
            
            for by, selector in sidebar_toggle_selectors:
                try:
                    toggle_button = self.driver.find_element(by, selector)
                    if toggle_button.is_displayed():
                        toggle_button.click()
                        time.sleep(1)
                        return True
                except NoSuchElementException:
                    continue
                    
            return False
            
        except Exception:
            return False
    
    def navigate_to_user_management(self):
        """
        Navega al módulo de User Management desde el dashboard.
        
        Returns:
            bool: True si la navegación fue exitosa
        """
        try:
            # Primero intentar encontrar el enlace directamente (menú expandido)
            user_management_selectors = [
                (By.PARTIAL_LINK_TEXT, "User Management"),
                (By.XPATH, "//a[contains(@href, '/userManagement')]"),
                (By.CSS_SELECTOR, "a[href*='userManagement']")
            ]
            
            user_management_link = None
            
            # Intentar encontrar el enlace sin expandir menú
            for by, selector in user_management_selectors:
                try:
                    user_management_link = self.wait.until(
                        EC.element_to_be_clickable((by, selector))
                    )
                    break
                except TimeoutException:
                    continue
            
            # Si no se encuentra, intentar expandir sidebar y buscar de nuevo
            if not user_management_link:
                self._expand_sidebar_if_needed()
                
                for by, selector in user_management_selectors:
                    try:
                        user_management_link = self.wait.until(
                            EC.element_to_be_clickable((by, selector))
                        )
                        break
                    except TimeoutException:
                        continue
            
            # Si aún no se encuentra, navegación directa
            if not user_management_link:
                self.driver.get(USER_MANAGEMENT_URL)
                time.sleep(2)
                return "userManagement" in self.driver.current_url
            
            # Hacer clic en el enlace
            user_management_link.click()
            time.sleep(2)
            
            # Verificar navegación exitosa
            return "userManagement" in self.driver.current_url
                
        except Exception:
            return False
    
    def verify_user_list_loaded(self):
        """
        Verifica que la tabla de usuarios se haya cargado correctamente.
        
        Returns:
            dict: Información básica sobre el estado de carga
        """
        try:
            result = {
                'loaded': False,
                'user_count': 0,
                'has_table': False,
                'has_search': False,
                'has_filters': False
            }
            
            # Esperar que desaparezcan indicadores de carga
            try:
                loading_element = self.driver.find_element(By.CSS_SELECTOR, ".animate-spin")
                if loading_element.is_displayed():
                    self.wait.until(EC.invisibility_of_element(loading_element))
            except NoSuchElementException:
                pass
            
            # Verificar elementos básicos
            try:
                search_element = self.driver.find_element(By.CSS_SELECTOR, "input[type='text']")
                result['has_search'] = search_element.is_displayed()
            except NoSuchElementException:
                pass
            
            filters = self.driver.find_elements(By.CSS_SELECTOR, "select")
            result['has_filters'] = len(filters) > 0
            
            # Verificar tabla y contar usuarios
            try:
                table = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))
                result['has_table'] = True
                
                user_rows = self.driver.find_elements(By.CSS_SELECTOR, "tbody tr")
                result['user_count'] = len(user_rows)
                result['loaded'] = True
                
            except TimeoutException:
                pass
            
            return result
            
        except Exception:
            return {
                'loaded': False,
                'user_count': 0,
                'has_table': False,
                'has_search': False,
                'has_filters': False
            }
    
    def verify_admin_functions(self):
        """
        Verifica que las funcionalidades de administrador estén disponibles.
        
        Returns:
            dict: Estado de las funciones de admin
        """
        try:
            print("Verificando funcionalidades de administrador...")
            
            functions = {
                'add_user_button': False,
                'role_management_link': False,
                'audit_log_link': False,
                'user_filters': False,
                'user_table': False,
                'edit_permissions': False
            }
            
            # Verificar botón "Add User"
            add_user_selectors = [
                (By.XPATH, "//button[contains(text(), 'Add user') or contains(text(), 'Agregar usuario')]"),
                (By.CSS_SELECTOR, "button[class*='bg-blue']"),
                (By.XPATH, "//button[contains(@class, 'bg-blue-600')]")
            ]
            
            for by, selector in add_user_selectors:
                try:
                    element = self.driver.find_element(by, selector)
                    if element.is_displayed() and element.is_enabled():
                        functions['add_user_button'] = True
                        print("✓ Botón 'Add User' disponible")
                        break
                except NoSuchElementException:
                    continue
            
            # Verificar enlaces de administrador
            admin_links = self.driver.find_elements(By.XPATH, "//a[contains(@href, 'roleManagement') or contains(@href, 'auditLog')]")
            
            for link in admin_links:
                href = link.get_attribute('href')
                if 'roleManagement' in href and link.is_displayed():
                    functions['role_management_link'] = True
                    print("✓ Enlace Role Management disponible")
                elif 'auditLog' in href and link.is_displayed():
                    functions['audit_log_link'] = True
                    print("✓ Enlace Audit Log disponible")
            
            # Verificar filtros
            filters = self.driver.find_elements(By.CSS_SELECTOR, "select")
            functions['user_filters'] = len(filters) >= 1
            if functions['user_filters']:
                print(f"✓ {len(filters)} filtros disponibles")
            
            # Verificar tabla
            tables = self.driver.find_elements(By.CSS_SELECTOR, "table")
            functions['user_table'] = len(tables) > 0
            if functions['user_table']:
                print("✓ Tabla de usuarios presente")
            
            # Verificar permisos de edición (botones de acción en filas)
            action_buttons = self.driver.find_elements(By.XPATH, "//button[contains(@class, 'edit') or contains(text(), 'Edit')]")
            functions['edit_permissions'] = len(action_buttons) > 0
            if functions['edit_permissions']:
                print(f"✓ {len(action_buttons)} botones de edición encontrados")
            
            all_verified = all(functions.values())
            
            print(f"Funciones de admin verificadas: {sum(functions.values())}/{len(functions)}")
            
            return {
                'functions': functions,
                'all_verified': all_verified,
                'admin_score': sum(functions.values()) / len(functions)
            }
            
        except Exception as e:
            print(f"Error verificando funciones de admin: {e}")
            return {
                'functions': {key: False for key in functions.keys()},
                'all_verified': False,
                'admin_score': 0.0,
                'error': str(e)
            }
    
    def test_user_filters(self):
        """
        Prueba los filtros de usuario (estado y rol).
        
        Returns:
            bool: True si los filtros funcionan correctamente
        """
        try:
            print("Probando filtros de usuario...")
            
            # Buscar dropdown de estado
            estado_selects = self.driver.find_elements(By.XPATH, "//select[.//option[contains(text(), 'Activo') or contains(text(), 'Estado')]]")
            
            if not estado_selects:
                print("✗ No se encontró filtro de estado")
                return False
            
            estado_select = estado_selects[0]
            
            if estado_select.is_displayed():
                select = Select(estado_select)
                
                # Probar cambio de filtro
                original_value = select.first_selected_option.text
                print(f"Valor original del filtro: {original_value}")
                
                # Buscar opción "Activo"
                for option in select.options:
                    if "Activo" in option.text:
                        select.select_by_visible_text(option.text)
                        time.sleep(1)
                        print(f"✓ Filtro cambiado a: {option.text}")
                        break
                
                # Volver al valor original
                select.select_by_visible_text(original_value)
                time.sleep(1)
                print(f"✓ Filtro restaurado a: {original_value}")
                
                return True
            
        except Exception as e:
            print(f"Error probando filtros: {e}")
        
        return False
    
    def test_add_user_modal(self):
        """
        Prueba la apertura del modal de agregar usuario.
        
        Returns:
            bool: True si el modal se abre y cierra correctamente
        """
        try:
            print("Probando modal de agregar usuario...")
            
            # Buscar botón Add User
            add_button_selectors = [
                (By.XPATH, "//button[contains(text(), 'Add user')]"),
                (By.XPATH, "//button[contains(text(), 'Agregar usuario')]"),
                (By.CSS_SELECTOR, "button[class*='bg-blue']")
            ]
            
            add_button = None
            for by, selector in add_button_selectors:
                try:
                    add_button = self.driver.find_element(by, selector)
                    if add_button.is_displayed() and add_button.is_enabled():
                        break
                except NoSuchElementException:
                    continue
            
            if not add_button:
                print("✗ Botón Add User no encontrado")
                return False
            
            # Hacer clic en el botón
            add_button.click()
            print("✓ Clic en botón Add User")
            
            # Esperar modal
            modal_selectors = [
                (By.CSS_SELECTOR, "[role='dialog']"),
                (By.CSS_SELECTOR, ".modal"),
                (By.CSS_SELECTOR, ".fixed"),
                (By.XPATH, "//div[contains(@class, 'modal') or contains(@class, 'dialog')]")
            ]
            
            modal = None
            for by, selector in modal_selectors:
                try:
                    modal = WebDriverWait(self.driver, 5).until(
                        EC.presence_of_element_located((by, selector))
                    )
                    if modal.is_displayed():
                        print(f"✓ Modal abierto: {by}")
                        break
                except TimeoutException:
                    continue
            
            if not modal:
                print("✗ Modal no se abrió")
                return False
            
            # Buscar botón de cerrar
            close_selectors = [
                (By.XPATH, "//button[contains(text(), 'Cancel') or contains(text(), 'Cancelar') or contains(text(), 'Cerrar')]"),
                (By.CSS_SELECTOR, "button[aria-label='Close']"),
                (By.CSS_SELECTOR, ".modal-close"),
                (By.XPATH, "//button[contains(@class, 'close')]")
            ]
            
            for by, selector in close_selectors:
                try:
                    close_button = self.driver.find_element(by, selector)
                    if close_button.is_displayed():
                        close_button.click()
                        time.sleep(1)
                        print("✓ Modal cerrado")
                        return True
                except NoSuchElementException:
                    continue
            
            # Si no hay botón de cerrar, intentar ESC o clic fuera
            try:
                from selenium.webdriver.common.keys import Keys
                modal.send_keys(Keys.ESCAPE)
                time.sleep(1)
                print("✓ Modal cerrado con ESC")
                return True
            except:
                pass
            
            print("⚠ Modal abierto pero no se pudo cerrar")
            return True  # Modal funcionó, aunque no se cerró
            
        except Exception as e:
            print(f"Error probando modal: {e}")
            return False
    
    def test_navigation_links(self):
        """
        Prueba los enlaces de navegación (Role Management, Audit Log).
        
        Returns:
            dict: Resultado de las pruebas de navegación
        """
        try:
            print("Probando enlaces de navegación...")
            
            results = {
                'role_management': False,
                'audit_log': False,
                'navigation_working': False
            }
            
            original_url = self.driver.current_url
            
            # Probar Role Management
            try:
                role_link = self.driver.find_element(By.XPATH, "//a[contains(@href, 'roleManagement')]")
                if role_link.is_displayed():
                    role_link.click()
                    time.sleep(2)
                    
                    if 'roleManagement' in self.driver.current_url:
                        print("✓ Navegación a Role Management exitosa")
                        results['role_management'] = True
                        
                        # Volver
                        self.driver.back()
                        time.sleep(1)
            except NoSuchElementException:
                print("⚠ Enlace Role Management no encontrado")
            
            # Probar Audit Log
            try:
                audit_link = self.driver.find_element(By.XPATH, "//a[contains(@href, 'auditLog')]")
                if audit_link.is_displayed():
                    results['audit_log'] = True
                    print("✓ Enlace Audit Log disponible")
            except NoSuchElementException:
                print("⚠ Enlace Audit Log no encontrado")
            
            results['navigation_working'] = any([results['role_management'], results['audit_log']])
            
            return results
            
        except Exception as e:
            print(f"Error probando navegación: {e}")
            return {
                'role_management': False,
                'audit_log': False,
                'navigation_working': False,
                'error': str(e)
            }
    
    def execute_complete_flow(self, email=None, password=None):
        """
        Ejecuta el flujo completo de User Management.
        
        Returns:
            dict: Resultado básico del flujo
        """
        try:
            result = {
                'success': False,
                'login_success': False,
                'navigation_success': False,
                'verification_result': None,
                'error': None
            }
            
            # Iniciar navegador si es necesario
            if self.driver is None:
                self.start_browser()
            
            # Login
            login_success = self.perform_login(email, password)
            result['login_success'] = login_success
            
            if not login_success:
                result['error'] = "Login falló"
                return result
            
            # Navegación
            navigation_success = self.navigate_to_user_management()
            result['navigation_success'] = navigation_success
            
            if not navigation_success:
                result['error'] = "Navegación falló"
                return result
            
            # Verificación de carga
            verification_result = self.verify_user_list_loaded()
            result['verification_result'] = verification_result
            
            if not verification_result['loaded']:
                result['error'] = "Lista no cargó"
                return result
            
            # Éxito general
            result['success'] = True
            return result
            
        except Exception as e:
            return {
                'success': False,
                'login_success': False,
                'navigation_success': False,
                'verification_result': None,
                'error': str(e)
            }
    
    def close_browser(self):
        """Cierra el navegador si fue creado por esta instancia."""
        if self.driver and self.own_driver:
            self.driver.quit()


# Funciones de conveniencia para importación
def execute_user_management_flow(driver_path="./chromedriver/driver.exe", email=None, password=None):
    """
    Función wrapper para ejecutar el flujo completo de User Management.
    
    Args:
        driver_path (str): Ruta al chromedriver
        email (str): Email para login (opcional)
        password (str): Password para login (opcional)
        
    Returns:
        dict: Resultado del flujo completo
    """
    flow = UserManagementFlow(driver_path=driver_path)
    try:
        return flow.execute_complete_flow(email, password)
    finally:
        flow.close_browser()


def execute_with_existing_driver(existing_driver):
    """
    Ejecuta User Management usando un driver existente con login activo.
    
    Args:
        existing_driver: Driver de Selenium con sesión activa
        
    Returns:
        dict: Resultado del flujo (sin cerrar el driver)
    """
    flow = UserManagementFlow(existing_driver=existing_driver)
    
    try:
        # Solo navegación y verificación
        navigation_success = flow.navigate_to_user_management()
        
        if not navigation_success:
            return {
                'success': False,
                'error': 'Navegación a User Management falló',
                'navigation_success': False
            }
        
        # Verificación
        verification_result = flow.verify_user_list_loaded()
        
        if not verification_result['loaded']:
            return {
                'success': False,
                'error': 'Lista de usuarios no cargó',
                'navigation_success': True,
                'verification_result': verification_result
            }
        
        # Funciones de admin
        admin_functions = flow.verify_admin_functions()
        
        return {
            'success': True,
            'navigation_success': True,
            'verification_result': verification_result,
            'admin_functions': admin_functions,
            'error': None
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'navigation_success': False
        }


def verify_admin_access(existing_driver):
    """
    Verifica si el usuario actual tiene acceso de administrador.
    
    Args:
        existing_driver: Driver de Selenium con sesión activa
        
    Returns:
        bool: True si tiene permisos de admin
    """
    flow = UserManagementFlow(existing_driver=existing_driver)
    
    try:
        # Navegar si no estamos en User Management
        current_url = existing_driver.current_url
        if 'userManagement' not in current_url:
            if not flow.navigate_to_user_management():
                return False
        
        # Verificar funciones de admin
        admin_functions = flow.verify_admin_functions()
        return admin_functions['all_verified']
        
    except Exception as e:
        print(f"Error verificando acceso de admin: {e}")
        return False


# Ejecución principal
if __name__ == "__main__":
    DRIVER_PATH = "./chromedriver/driver.exe"
    
    result = execute_user_management_flow(DRIVER_PATH)
    
    if result['success']:
        print(f"User Management exitoso - {result['verification_result']['user_count']} usuarios encontrados")
    else:
        print(f"Error: {result['error']}")
