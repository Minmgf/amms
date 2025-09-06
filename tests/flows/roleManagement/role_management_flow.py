"""
Flujo automatizado para Role Management

Este módulo proporciona una automatización completa para navegar
a la vista de Role Management después del login.

Características:
- Navegación directa via URL
- Fallback a expansión del sidebar si es necesario
- Modo headless configurable
- Ventana maximizada por defecto
- Operación silenciosa para integración

Autor: Juan Nicolás Urrutia Salcedo
Fecha: 2025-09-05
"""

import os
import sys
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, WebDriverException
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración de login (copiamos la funcionalidad básica)
EMAIL = os.getenv('EMAIL')
PASSWORD = os.getenv('PASSWORD')
LOGIN_URL = "http://localhost:3000/sigma/login"

class RoleManagementFlow:
    """Clase para manejar el flujo de Role Management"""
    
    def __init__(self, driver_path="./chromedriver/driver.exe"):
        self.driver_path = driver_path
        self.driver = None
        
    def start_browser(self):
        """Inicializar el navegador con configuraciones optimizadas"""
        chrome_options = Options()
        
        # Configurar modo headless desde variable de entorno
        headless = os.getenv('HEADLESS', 'False').lower() == 'true'
        if headless:
            chrome_options.add_argument('--headless')
            chrome_options.add_argument('--window-size=1920,1080')
        
        # Opciones para estabilidad
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--disable-web-security')
        chrome_options.add_argument('--allow-running-insecure-content')
        
        try:
            from selenium.webdriver.chrome.service import Service
            service = Service(executable_path=self.driver_path)
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            if not headless:
                self.driver.maximize_window()
            self.driver.implicitly_wait(10)
            return True
        except Exception as e:
            print(f"Error al inicializar navegador: {e}")
            return False
    
    def login(self):
        """Realizar login en la aplicación"""
        try:
            self.driver.get(LOGIN_URL)
            wait = WebDriverWait(self.driver, 10)
            
            # Encontrar y llenar el campo de email
            email_field = wait.until(EC.presence_of_element_located((By.NAME, "email")))
            email_field.clear()
            email_field.send_keys(EMAIL)
            
            # Encontrar y llenar el campo de password
            password_field = self.driver.find_element(By.NAME, "password")
            password_field.clear()
            password_field.send_keys(PASSWORD)
            
            # Hacer clic en el botón de login
            login_button = self.driver.find_element(By.XPATH, "//button[@type='submit']")
            login_button.click()
            
            # Esperar a que se complete el login
            time.sleep(3)
            
            # Verificar que el login fue exitoso
            return self.is_logged_in()
            
        except Exception as e:
            print(f"Error en login: {e}")
            return False
    
    def is_logged_in(self):
        """Verificar si el usuario está logueado"""
        try:
            # Verificar si estamos en el dashboard o si hay elementos del usuario logueado
            current_url = self.driver.current_url
            return "/dashboard" in current_url or "/home" in current_url
            
        except Exception:
            return False
    
    def navigate_to_role_management(self):
        """Navegar a la vista de Role Management"""
        try:
            # Estrategia 1: Navegación directa via URL correcta
            current_url = self.driver.current_url
            base_url = current_url.split('/sigma')[0] if '/sigma' in current_url else current_url.rstrip('/')
            role_management_url = f"{base_url}/sigma/userManagement/roleManagement"
            
            self.driver.get(role_management_url)
            time.sleep(2)
            
            # Verificar si llegamos correctamente
            if self.verify_role_management_loaded():
                return True
            
            # Estrategia 2: Fallback - usar el sidebar
            return self._navigate_via_sidebar()
            
        except Exception as e:
            print(f"Error en navegación: {e}")
            return False
    
    def _navigate_via_sidebar(self):
        """Navegación de fallback usando el sidebar"""
        try:
            wait = WebDriverWait(self.driver, 10)
            
            # Paso 1: Hacer clic en User Management para desplegar el submenú
            try:
                user_management_link = wait.until(EC.element_to_be_clickable((By.XPATH, "//a[@href='/sigma/userManagement']")))
                user_management_link.click()
                time.sleep(1)  # Esperar a que se despliegue el menú
            except TimeoutException:
                print("No se pudo encontrar el enlace de User Management en el sidebar")
                return False
            
            # Paso 2: Hacer clic en Role Management
            try:
                role_management_link = wait.until(EC.element_to_be_clickable((By.XPATH, "//a[normalize-space()='Role Management']")))
                role_management_link.click()
                time.sleep(2)
                
                # Verificar que se cargó correctamente
                if self.verify_role_management_loaded():
                    return True
                else:
                    return False
                    
            except TimeoutException:
                print("No se pudo encontrar el enlace de Role Management en el submenú")
                return False
            
        except Exception as e:
            print(f"Error en navegación por sidebar: {e}")
            return False
    
    def verify_role_management_loaded(self):
        """Verificar que la página de Role Management se haya cargado correctamente"""
        try:
            wait = WebDriverWait(self.driver, 5)
            
            # Verificar URL específica
            current_url = self.driver.current_url.lower()
            if 'usermanagement/rolemanagement' in current_url or 'rolemanagement' in current_url:
                return True
            
            # Verificar que no sea una página de error
            if '404' in self.driver.title.lower() or 'not found' in self.driver.title.lower():
                return False
            
            # Verificar elementos característicos de Role Management
            role_indicators = [
                "//h1[contains(text(), 'Role Management')]",
                "//h1[contains(text(), 'Gestión de Roles')]",
                "//h2[contains(text(), 'Role Management')]",
                "//h2[contains(text(), 'Gestión de Roles')]",
                "//div[contains(@class, 'role')]",
                "//button[contains(text(), 'New Role')]",
                "//button[contains(text(), 'Nuevo Rol')]",
                "//table[contains(@class, 'role')]",
                "//div[contains(text(), 'role')]"
            ]
            
            for indicator in role_indicators:
                try:
                    element = wait.until(EC.presence_of_element_located((By.XPATH, indicator)))
                    return True
                except:
                    continue
            
            # Si llegamos aquí y la URL es correcta, asumimos que se cargó
            return 'rolemanagement' in current_url
            
        except Exception:
            return False
    
    def get_role_count(self):
        """Obtener el número de roles visibles (opcional)"""
        try:
            # Selectores comunes para tablas de roles
            role_selectors = [
                "//table//tbody//tr",
                "//div[contains(@class, 'role-item')]",
                "//div[contains(@class, 'role-card')]",
                "//li[contains(@class, 'role')]"
            ]
            
            for selector in role_selectors:
                try:
                    elements = self.driver.find_elements(By.XPATH, selector)
                    if elements:
                        return len(elements)
                except:
                    continue
            
            return 0
            
        except Exception:
            return 0
    
    def execute_complete_flow(self):
        """Ejecutar el flujo completo de Role Management"""
        try:
            # Inicializar navegador
            if not self.start_browser():
                return {"success": False, "error": "Error al inicializar navegador"}
            
            # Ejecutar login
            if not self.login():
                return {"success": False, "error": "Error en login"}
            
            # Navegar a Role Management
            if not self.navigate_to_role_management():
                return {"success": False, "error": "Error navegando a Role Management"}
            
            # Verificar que se cargó correctamente
            if not self.verify_role_management_loaded():
                return {"success": False, "error": "Role Management no se cargó correctamente"}
            
            # Obtener información adicional
            role_count = self.get_role_count()
            
            return {
                "success": True, 
                "message": "Role Management cargado correctamente",
                "verification_result": {
                    "role_count": role_count,
                    "current_url": self.driver.current_url
                }
            }
            
        except Exception as e:
            return {"success": False, "error": f"Error inesperado: {str(e)}"}
        
        finally:
            if self.driver:
                self.driver.quit()

def execute_role_management_flow(driver_path="./chromedriver/driver.exe"):
    """
    Función de conveniencia para ejecutar el flujo completo de Role Management
    
    Args:
        driver_path (str): Ruta al ChromeDriver
        
    Returns:
        dict: Resultado del flujo con success, message/error y verification_result
    """
    flow = RoleManagementFlow(driver_path)
    return flow.execute_complete_flow()

# Ejecución directa para testing
if __name__ == "__main__":
    result = execute_role_management_flow()
    
    if result['success']:
        verification = result['verification_result']
        print(f"Role Management exitoso - {verification['role_count']} roles encontrados")
    else:
        print(f"Error: {result['error']}")
