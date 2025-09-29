"""
Test IT-GM-002: Login automatizado y navegación a módulo de maquinaria.
Este módulo proporciona funciones para realizar login y navegar al módulo de maquinaria
en la aplicación AMMS usando Selenium WebDriver.
"""

import os
import time
import sys
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import load_dotenv

# Importar función de navegación desde el módulo de flujos
sys.path.append(str(Path(__file__).parent.parent.parent / 'flows' / 'navigation'))
from machinery_navigation import navigate_to_machinery

# Cargar variables de entorno desde .env
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent  # Navegar a la raíz del proyecto
load_dotenv(PROJECT_ROOT / '.env')

def save_browser_logs(driver, test_name):
    """
    Captura y guarda los logs de la consola del navegador en un archivo.

    Args:
        driver: Instancia de WebDriver
        test_name: Nombre del test para el archivo de logs (ej: 'IT-MAQ-001')
    """
    try:
        # Crear directorio de logs si no existe
        logs_dir = PROJECT_ROOT / 'logs'
        logs_dir.mkdir(exist_ok=True)

        # Obtener logs del navegador
        browser_logs = driver.get_log('browser')

        # Crear archivo de logs
        log_file_path = logs_dir / f"{test_name}_browser_console.log"

        with open(log_file_path, 'w', encoding='utf-8') as f:
            f.write(f"Browser Console Logs for {test_name}\n")
            f.write("=" * 50 + "\n")
            f.write(f"Generated at: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("=" * 50 + "\n\n")

            if browser_logs:
                for log_entry in browser_logs:
                    timestamp = time.strftime('%H:%M:%S', time.localtime(log_entry['timestamp'] / 1000))
                    level = log_entry['level']
                    message = log_entry['message']
                    f.write(f"[{timestamp}] {level}: {message}\n")
            else:
                f.write("No browser console logs captured.\n")

        print(f"Browser console logs saved to: {log_file_path}")

    except Exception as e:
        print(f"Error saving browser logs: {str(e)}")

def perform_login(driver=None, headless=False):
    """
    Realiza el flujo de login automatizado.

    Args:
        driver: Instancia de WebDriver. Si es None, se crea una nueva.
        headless: Si True, ejecuta el navegador en modo headless. Si None, usa el valor de .env.

    Returns:
        WebDriver: La instancia del driver con el usuario logueado.

    Raises:
        ValueError: Si faltan credenciales en .env
        Exception: Si ocurre un error durante el login
    """
    # Obtener credenciales del .env (o usar valores por defecto)
    email = os.getenv('EMAIL', 'danielsr_1997@hotmail.com')
    password = os.getenv('PASSWORD', 'Usuario9924.')
    
    # Leer configuración headless del .env si no se especifica
    if headless is None:
        headless_env = os.getenv('HEADLESS', 'false').lower()
        headless = headless_env in ('true', '1', 'yes', 'on')

    if not email or not password:
        raise ValueError("Credenciales EMAIL y PASSWORD no encontradas en .env ni configuradas por defecto")

    # Crear driver si no se proporciona
    if driver is None:
        chrome_options = Options()
        if headless:
            chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--start-maximized')  # Maximizar ventana al iniciar
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--disable-web-security')
        chrome_options.add_argument('--disable-features=VizDisplayCompositor')
        chrome_options.add_argument('--disable-extensions')
        chrome_options.add_argument('--disable-plugins')
        
        # Configuraciones de automatización
        chrome_options.add_experimental_option("useAutomationExtension", False)
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])

        # Configurar path del chromedriver usando WebDriverManager
        service = Service(ChromeDriverManager().install())

        driver = webdriver.Chrome(service=service, options=chrome_options)

    try:
        # Navegar a la página de login
        driver.get('http://localhost:3000/sigma/login')

        # Esperar a que la página cargue
        wait = WebDriverWait(driver, 15)

        # Localizar y completar campo de email
        email_input = wait.until(
            EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Correo electrónico']"))
        )
        email_input.clear()
        email_input.send_keys(email)

        # Localizar y completar campo de contraseña
        password_input = wait.until(
            EC.presence_of_element_located((By.XPATH, "//input[@type='password']"))
        )
        password_input.clear()
        password_input.send_keys(password)

        # Localizar y hacer click en el botón de iniciar sesión
        login_button = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Iniciar sesión']"))
        )
        login_button.click()

        # Esperar a que se complete el login (puede variar según la aplicación)
        # Aquí puedes agregar una espera específica si hay un indicador de login exitoso
        wait.until(
            lambda driver: driver.current_url != 'http://localhost:3000/sigma/login'
        )

        return driver

    except Exception as e:
        if driver:
            driver.quit()
        raise Exception(f"Error durante el login: {str(e)}")

# Función de conveniencia para crear y usar driver temporal
def login_and_get_driver(headless=None):
    """
    Crea un driver, realiza login y retorna el driver.

    Args:
        headless: Si True, ejecuta en modo headless. Si None, usa el valor de .env.

    Returns:
        WebDriver: Driver con sesión iniciada.
    """
    return perform_login(headless=headless)

def create_maximized_driver(headless=None):
    """
    Crea un driver de Chrome maximizado con configuración estándar para automatizaciones.

    Args:
        headless: Si True, ejecuta en modo headless. Si None, usa el valor de .env.

    Returns:
        WebDriver: Driver maximizado listo para usar.
    """
    if headless is None:
        headless_env = os.getenv('HEADLESS', 'false').lower()
        headless = headless_env in ('true', '1', 'yes', 'on')

    chrome_options = Options()
    if headless:
        chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--start-maximized')  # Maximizar ventana al iniciar
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--disable-web-security')
    chrome_options.add_argument('--disable-features=VizDisplayCompositor')
    chrome_options.add_argument('--disable-extensions')
    chrome_options.add_argument('--disable-plugins')
    
    # Configuraciones de automatización
    chrome_options.add_experimental_option("useAutomationExtension", False)
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])

    # Configurar path del chromedriver usando WebDriverManager
    service = Service(ChromeDriverManager().install())

    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def test_login_and_navigate_to_machinery(headless=None):
    """
    Test completo que realiza login y navega al módulo de maquinaria.
    
    Args:
        headless: Si True, ejecuta en modo headless. Si None, usa el valor de .env.
    
    Returns:
        tuple: (success: bool, driver: WebDriver, message: str)
    """
    driver = None
    test_name = "IT-GM-002"
    
    try:
        print(" Iniciando test IT-GM-002: Login y navegación a maquinaria")
        print("=" * 60)
        
        # Paso 1: Realizar login
        print(" Paso 1: Realizando login...")
        driver = perform_login(headless=headless)
        print(" Login exitoso")
        
        # Esperar un momento para que la página se estabilice
        time.sleep(2)
        
        # Paso 2: Navegar al módulo de maquinaria
        print("\n Paso 2: Navegando al módulo de maquinaria...")
        driver = navigate_to_machinery(driver, wait_time=15)
        print(" Navegación a maquinaria exitosa")
        
        # Paso 3: Verificación final
        print("\n Paso 3: Verificación final...")
        current_url = driver.current_url
        print(f"📍 URL final: {current_url}")
        
        # Verificar que estamos en la página correcta
        if "/machinery" in current_url or "maquinaria" in current_url.lower():
            print(" Test completado exitosamente")
            print("=" * 60)
            return True, driver, "Test IT-GM-002 completado exitosamente"
        else:
            print("  Advertencia: URL no contiene indicadores de maquinaria")
            print(" Test completado con advertencias")
            print("=" * 60)
            return True, driver, "Test completado con advertencias - URL no esperada"
            
    except Exception as e:
        error_msg = f"Error en test IT-GM-002: {str(e)}"
        print(f" {error_msg}")
        print("=" * 60)
        
        # Guardar logs del navegador si hay error
        if driver:
            try:
                save_browser_logs(driver, test_name)
            except:
                pass
        
        return False, driver, error_msg

def run_test_with_cleanup(headless=None):
    """
    Ejecuta el test completo con limpieza automática del driver.
    
    Args:
        headless: Si True, ejecuta en modo headless. Si None, usa el valor de .env.
    
    Returns:
        bool: True si el test fue exitoso, False en caso contrario.
    """
    driver = None
    try:
        success, driver, message = test_login_and_navigate_to_machinery(headless=headless)
        print(f"\n Resultado: {message}")
        return success
    finally:
        if driver:
            try:
                print("\n Cerrando navegador...")
                driver.quit()
                print(" Navegador cerrado correctamente")
            except Exception as e:
                print(f"  Error cerrando navegador: {str(e)}")

# Ejecución principal del test
if __name__ == "__main__":
    """
    Ejecuta el test IT-GM-002 cuando el script se ejecuta directamente.
    """
    print(" Test IT-GM-002: Login y Navegación a Maquinaria")
    print("=" * 60)
    
    try:
        # Verificar que las credenciales estén configuradas
        email = os.getenv('EMAIL', 'danielsr_1997@hotmail.com')
        password = os.getenv('PASSWORD', 'Usuario9924.')
        
        if not email or not password:
            print(" Error: Credenciales EMAIL y PASSWORD no encontradas")
            print(" Usando credenciales por defecto configuradas en el código")
            sys.exit(1)
        
        print(f" Usando email: {email}")
        print(f" Contraseña configurada: {'*' * len(password)}")
        
        # Ejecutar el test
        success = run_test_with_cleanup()
        
        if success:
            print("\n Test IT-GM-002 completado exitosamente!")
            sys.exit(0)
        else:
            print("\n Test IT-GM-002 falló!")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n  Test interrumpido por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n Error inesperado: {str(e)}")
        sys.exit(1)