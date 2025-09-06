"""
Flujo de navegación al módulo de gestión de usuarios.

Este archivo contiene la automatización para navegar desde el login
hasta el módulo de User Management donde se lista todos los usuarios
y sus estados actuales.

Autor: [Tu nombre]
Fecha: 2025-09-05
"""

import os
import time
import sys
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException, WebDriverException

# Importar el flujo de login existente
# Agregar el directorio del flujo de login al path
login_flow_dir = os.path.join(os.path.dirname(__file__), '..', 'auth', 'login')
sys.path.append(login_flow_dir)

try:
    from login_flow import LoginFlow
except ImportError as e:
    print(f"Error importando login_flow: {e}")
    print(f"Directorio de login_flow: {login_flow_dir}")
    print("Asegúrate de que login_flow.py existe en tests/flows/auth/login/")
    raise

# URLs y constantes
USER_MANAGEMENT_URL = "http://localhost:3000/sigma/userManagement"
DASHBOARD_BASE_URL = "http://localhost:3000/sigma"

class NavigateToUserListFlow:
    """
    Clase para manejar la navegación al módulo de gestión de usuarios.
    
    Este flujo se puede ejecutar de forma independiente (incluyendo login)
    o importar y usar después de un login exitoso.
    """
    
    def __init__(self, driver_path=None, existing_driver=None):
        """
        Inicializa el flujo de navegación.
        
        Args:
            driver_path (str): Ruta al chromedriver (solo si no se pasa existing_driver)
            existing_driver: Driver existente de Selenium (opcional)
        """
        self.driver_path = driver_path
        self.driver = existing_driver
        self.login_flow = None
        self.own_driver = existing_driver is None  # Para saber si debemos cerrar el driver
        
    def start_browser(self):
        """
        Inicia el navegador Chrome solo si no se pasó un driver existente.
        """
        if self.driver is None:
            try:
                service = ChromeService(executable_path=self.driver_path)
                self.driver = webdriver.Chrome(service=service)
                print("Navegador iniciado correctamente")
            except WebDriverException as e:
                print(f"Error iniciando el navegador: {e}")
                raise
    
    def perform_login(self, email=None, password=None):
        """
        Ejecuta el flujo de login usando la clase LoginFlow existente.
        
        Args:
            email (str): Email para login (opcional, usa variable de entorno por defecto)
            password (str): Password para login (opcional, usa variable de entorno por defecto)
        
        Returns:
            bool: True si el login fue exitoso, False en caso contrario
        """
        try:
            print("Ejecutando flujo de login...")
            
            # Crear instancia del flujo de login con el driver existente
            self.login_flow = LoginFlow(self.driver_path)
            self.login_flow.driver = self.driver  # Usar el driver actual
            
            # Ejecutar login
            if email and password:
                self.login_flow.login(email, password)
            else:
                self.login_flow.login()
            
            # Verificar si el login fue exitoso
            login_success = self.login_flow.is_logged_in()
            
            if login_success:
                print("Login exitoso - Procediendo con la navegación")
                return True
            else:
                print("Login falló - No se puede continuar con la navegación")
                return False
                
        except Exception as e:
            print(f"Error durante el login: {e}")
            return False
    
    def navigate_to_user_management(self):
        """
        Navega al módulo de gestión de usuarios desde el dashboard.
        
        Busca el enlace "User Management" en la sidebar y hace clic en él.
        
        Returns:
            bool: True si la navegación fue exitosa, False en caso contrario
        """
        try:
            print("Navegando al módulo de gestión de usuarios...")
            
            wait = WebDriverWait(self.driver, 10)
            
            # Buscar diferentes selectores para el enlace de User Management
            user_management_selectors = [
                # Por texto del enlace
                (By.PARTIAL_LINK_TEXT, "User Management"),
                (By.LINK_TEXT, "User Management"),
                
                # Por estructura del sidebar (basado en el código JSX)
                (By.XPATH, "//span[contains(text(), 'User Management')]/parent::*"),
                (By.XPATH, "//a[contains(@href, '/userManagement')]"),
                
                # Por iconos y estructura de navegación
                (By.CSS_SELECTOR, "a[href*='userManagement']"),
                (By.CSS_SELECTOR, "nav a[href*='userManagement']"),
                
                # Por clases CSS que podrían estar presentes
                (By.CSS_SELECTOR, ".sidebar a[href*='userManagement']"),
                (By.CSS_SELECTOR, "aside a[href*='userManagement']"),
            ]
            
            user_management_link = None
            
            # Intentar encontrar el enlace con diferentes selectores
            for by, selector in user_management_selectors:
                try:
                    user_management_link = wait.until(
                        EC.element_to_be_clickable((by, selector))
                    )
                    print(f"Enlace 'User Management' encontrado con selector: {by}='{selector}'")
                    break
                except TimeoutException:
                    print(f"No se encontró elemento con {by}='{selector}'")
                    continue
            
            # Si no se encuentra el enlace, intentar navegación directa por URL
            if not user_management_link:
                print("No se pudo encontrar el enlace, intentando navegación directa por URL...")
                self.driver.get(USER_MANAGEMENT_URL)
                time.sleep(2)
                
                # Verificar si llegamos a la página correcta
                if "userManagement" in self.driver.current_url:
                    print("Navegación directa exitosa")
                    return True
                else:
                    print("Navegación directa falló")
                    return False
            
            # Hacer clic en el enlace encontrado
            print("Haciendo clic en el enlace de User Management...")
            user_management_link.click()
            
            # Esperar a que la página cargue
            time.sleep(2)
            
            # Verificar que estamos en la página correcta
            expected_urls = [USER_MANAGEMENT_URL, f"{DASHBOARD_BASE_URL}/userManagement"]
            current_url = self.driver.current_url
            
            if any(url in current_url for url in expected_urls):
                print(f"Navegación exitosa - URL actual: {current_url}")
                return True
            else:
                print(f"Navegación falló - URL actual: {current_url}")
                return False
                
        except Exception as e:
            print(f"Error navegando al módulo de usuarios: {e}")
            return False
    
    def verify_user_list_loaded(self):
        """
        Verifica que la tabla de usuarios se haya cargado correctamente.
        
        Busca elementos específicos de la tabla de usuarios basándose en el 
        componente UserTable.jsx.
        
        Returns:
            dict: Información sobre el estado de carga de la lista de usuarios
                {
                    'loaded': bool,
                    'user_count': int,
                    'has_table': bool,
                    'has_search': bool,
                    'has_filters': bool,
                    'loading_state': str
                }
        """
        try:
            print("Verificando que la lista de usuarios se haya cargado...")
            
            wait = WebDriverWait(self.driver, 15)  # Tiempo más largo para carga de datos
            result = {
                'loaded': False,
                'user_count': 0,
                'has_table': False,
                'has_search': False,
                'has_filters': False,
                'loading_state': 'unknown'
            }
            
            # Verificar si hay un indicador de carga
            loading_indicators = [
                (By.CSS_SELECTOR, ".animate-spin"),  # Spinner de carga
                (By.XPATH, "//*[contains(text(), 'Cargando usuarios')]"),
                (By.XPATH, "//*[contains(text(), 'Loading')]"),
            ]
            
            # Comprobar estado de carga inicial
            for by, selector in loading_indicators:
                try:
                    loading_element = self.driver.find_element(by, selector)
                    if loading_element.is_displayed():
                        print("Detectado indicador de carga, esperando...")
                        result['loading_state'] = 'loading'
                        
                        # Esperar a que desaparezca el indicador de carga
                        wait.until(EC.invisibility_of_element(loading_element))
                        print("Indicador de carga desapareció")
                        break
                except NoSuchElementException:
                    continue
            
            # Verificar título de la página
            title_selectors = [
                (By.XPATH, "//h1[contains(text(), 'User Management')]"),
                (By.CSS_SELECTOR, "h1"),
                (By.XPATH, "//*[contains(text(), 'User Management')]"),
            ]
            
            title_found = False
            for by, selector in title_selectors:
                try:
                    title_element = wait.until(EC.presence_of_element_located((by, selector)))
                    if "User Management" in title_element.text:
                        print(f"Título 'User Management' encontrado: {title_element.text}")
                        title_found = True
                        break
                except TimeoutException:
                    continue
            
            # Verificar campo de búsqueda
            search_selectors = [
                (By.CSS_SELECTOR, "input[placeholder*='Buscar usuarios']"),
                (By.CSS_SELECTOR, "input[placeholder*='buscar']"),
                (By.CSS_SELECTOR, "input[type='text']"),
                (By.XPATH, "//input[contains(@placeholder, 'Search')]"),
            ]
            
            for by, selector in search_selectors:
                try:
                    search_element = self.driver.find_element(by, selector)
                    if search_element.is_displayed():
                        print(f"Campo de búsqueda encontrado con selector: {by}='{selector}'")
                        result['has_search'] = True
                        break
                except NoSuchElementException:
                    continue
            
            # Verificar filtros (dropdowns de estado y rol)
            filter_selectors = [
                (By.CSS_SELECTOR, "select"),
                (By.XPATH, "//select[contains(@class, 'border')]"),
                (By.XPATH, "//option[contains(text(), 'Todos los estados')]"),
                (By.XPATH, "//option[contains(text(), 'Todos los roles')]"),
            ]
            
            filter_count = 0
            for by, selector in filter_selectors:
                try:
                    filters = self.driver.find_elements(by, selector)
                    filter_count += len(filters)
                except NoSuchElementException:
                    continue
            
            if filter_count > 0:
                print(f"Encontrados {filter_count} elementos de filtro")
                result['has_filters'] = True
            
            # Verificar la tabla de usuarios
            table_selectors = [
                (By.CSS_SELECTOR, "table"),
                (By.CSS_SELECTOR, "thead"),
                (By.CSS_SELECTOR, "tbody"),
                (By.XPATH, "//table//th[contains(text(), 'Nombre')]"),
                (By.XPATH, "//table//th[contains(text(), 'Email')]"),
                (By.XPATH, "//table//th[contains(text(), 'Estado')]"),
            ]
            
            table_elements_found = 0
            for by, selector in table_selectors:
                try:
                    elements = self.driver.find_elements(by, selector)
                    if elements:
                        table_elements_found += len(elements)
                        print(f"Elementos de tabla encontrados con {by}='{selector}': {len(elements)}")
                except NoSuchElementException:
                    continue
            
            if table_elements_found > 0:
                result['has_table'] = True
                print("Estructura de tabla detectada")
                
                # Contar filas de usuarios
                try:
                    # Buscar filas de datos (excluyendo header)
                    user_rows = self.driver.find_elements(By.CSS_SELECTOR, "tbody tr")
                    result['user_count'] = len(user_rows)
                    print(f"Encontradas {result['user_count']} filas de usuarios")
                    
                    # Verificar que no hay mensajes de "sin datos"
                    no_data_indicators = [
                        "No hay usuarios",
                        "No data",
                        "Sin resultados",
                        "0 usuarios"
                    ]
                    
                    page_text = self.driver.find_element(By.TAG_NAME, "body").text.lower()
                    has_no_data_message = any(indicator.lower() in page_text for indicator in no_data_indicators)
                    
                    if not has_no_data_message and result['user_count'] > 0:
                        print("Lista de usuarios cargada exitosamente con datos")
                        result['loaded'] = True
                        result['loading_state'] = 'loaded_with_data'
                    elif result['user_count'] == 0 and not has_no_data_message:
                        print("Tabla cargada pero sin usuarios visibles")
                        result['loaded'] = True
                        result['loading_state'] = 'loaded_empty'
                    else:
                        print("Tabla cargada pero indica que no hay datos")
                        result['loaded'] = True
                        result['loading_state'] = 'loaded_no_data'
                        
                except NoSuchElementException:
                    print("No se pudieron contar las filas de usuarios")
                    result['loading_state'] = 'table_structure_only'
            
            # Verificar errores de carga
            error_indicators = [
                (By.XPATH, "//*[contains(text(), 'Error')]"),
                (By.CSS_SELECTOR, ".bg-red-50"),  # Error styling del componente
                (By.CSS_SELECTOR, ".text-red-800"),
                (By.XPATH, "//*[contains(text(), 'Error al cargar')]"),
            ]
            
            for by, selector in error_indicators:
                try:
                    error_element = self.driver.find_element(by, selector)
                    if error_element.is_displayed():
                        print(f"Error detectado: {error_element.text}")
                        result['loading_state'] = 'error'
                        break
                except NoSuchElementException:
                    continue
            
            # Resultado final
            if result['loaded']:
                print(f"✓ Verificación exitosa - Estado: {result['loading_state']}")
                print(f"  - Tabla: {'✓' if result['has_table'] else '✗'}")
                print(f"  - Búsqueda: {'✓' if result['has_search'] else '✗'}")
                print(f"  - Filtros: {'✓' if result['has_filters'] else '✗'}")
                print(f"  - Usuarios encontrados: {result['user_count']}")
            else:
                print(f"✗ Verificación falló - Estado: {result['loading_state']}")
            
            return result
            
        except Exception as e:
            print(f"Error verificando la lista de usuarios: {e}")
            return {
                'loaded': False,
                'user_count': 0,
                'has_table': False,
                'has_search': False,
                'has_filters': False,
                'loading_state': 'error',
                'error': str(e)
            }
    
    def execute_complete_flow(self, email=None, password=None):
        """
        Ejecuta el flujo completo: login + navegación + verificación.
        
        Args:
            email (str): Email para login (opcional)
            password (str): Password para login (opcional)
            
        Returns:
            dict: Resultado completo del flujo
        """
        try:
            print("=== Iniciando flujo completo de navegación a User Management ===")
            
            result = {
                'success': False,
                'login_success': False,
                'navigation_success': False,
                'verification_result': None,
                'error': None
            }
            
            # Paso 1: Iniciar navegador
            if self.driver is None:
                self.start_browser()
            
            # Paso 2: Realizar login
            login_success = self.perform_login(email, password)
            result['login_success'] = login_success
            
            if not login_success:
                result['error'] = "Login falló"
                return result
            
            # Paso 3: Navegar al módulo de usuarios
            navigation_success = self.navigate_to_user_management()
            result['navigation_success'] = navigation_success
            
            if not navigation_success:
                result['error'] = "Navegación al módulo falló"
                return result
            
            # Paso 4: Verificar que la lista se cargó
            verification_result = self.verify_user_list_loaded()
            result['verification_result'] = verification_result
            
            if verification_result['loaded']:
                result['success'] = True
                print("=== Flujo completo ejecutado exitosamente ===")
            else:
                result['error'] = f"Verificación falló: {verification_result.get('error', 'Lista no cargó')}"
            
            return result
            
        except Exception as e:
            print(f"Error en el flujo completo: {e}")
            return {
                'success': False,
                'login_success': False,
                'navigation_success': False,
                'verification_result': None,
                'error': str(e)
            }
    
    def execute_navigation_only(self):
        """
        Ejecuta solo la navegación y verificación, asumiendo que ya hay login activo.
        
        Útil para usar después de otro flujo que ya haya hecho login.
        
        Returns:
            dict: Resultado de la navegación y verificación
        """
        try:
            print("=== Ejecutando solo navegación a User Management (sin login) ===")
            
            result = {
                'success': False,
                'navigation_success': False,
                'verification_result': None,
                'error': None
            }
            
            # Navegar al módulo
            navigation_success = self.navigate_to_user_management()
            result['navigation_success'] = navigation_success
            
            if not navigation_success:
                result['error'] = "Navegación falló"
                return result
            
            # Verificar carga
            verification_result = self.verify_user_list_loaded()
            result['verification_result'] = verification_result
            
            if verification_result['loaded']:
                result['success'] = True
                print("=== Navegación ejecutada exitosamente ===")
            else:
                result['error'] = f"Verificación falló: {verification_result.get('error', 'Lista no cargó')}"
            
            return result
            
        except Exception as e:
            print(f"Error en navegación: {e}")
            return {
                'success': False,
                'navigation_success': False,
                'verification_result': None,
                'error': str(e)
            }
    
    def close_browser(self):
        """
        Cierra el navegador solo si fue creado por esta instancia.
        """
        if self.driver and self.own_driver:
            print("Cerrando navegador...")
            self.driver.quit()
        elif not self.own_driver:
            print("Driver no cerrado (pertenece a otra instancia)")


# Función para uso directo e importación
def navigate_to_user_list_flow(driver_path="./chromedriver/driver.exe", email=None, password=None):
    """
    Función wrapper para ejecutar el flujo completo de forma simple.
    
    Args:
        driver_path (str): Ruta al chromedriver
        email (str): Email para login (opcional)
        password (str): Password para login (opcional)
        
    Returns:
        dict: Resultado del flujo
    """
    flow = NavigateToUserListFlow(driver_path=driver_path)
    try:
        return flow.execute_complete_flow(email, password)
    finally:
        flow.close_browser()


def navigate_to_user_list_after_login(existing_driver):
    """
    Función para ejecutar solo navegación cuando ya se tiene un driver con login activo.
    
    Args:
        existing_driver: Driver de Selenium ya configurado y con login exitoso
        
    Returns:
        dict: Resultado de la navegación
    """
    flow = NavigateToUserListFlow(existing_driver=existing_driver)
    return flow.execute_navigation_only()


# Ejecución principal cuando se ejecuta el archivo directamente
if __name__ == "__main__":
    DRIVER_PATH = "./chromedriver/driver.exe"  # Ajustar ruta según necesidad
    
    print("Ejecutando flujo de navegación a User Management...")
    result = navigate_to_user_list_flow(DRIVER_PATH)
    
    print("\n=== RESULTADO FINAL ===")
    print(f"Éxito general: {result['success']}")
    print(f"Login exitoso: {result['login_success']}")
    print(f"Navegación exitosa: {result['navigation_success']}")
    
    if result['verification_result']:
        ver = result['verification_result']
        print(f"Lista cargada: {ver['loaded']}")
        print(f"Usuarios encontrados: {ver['user_count']}")
        print(f"Estado de carga: {ver['loading_state']}")
    
    if result['error']:
        print(f"Error: {result['error']}")
    
    print("=== FIN DEL FLUJO ===")
