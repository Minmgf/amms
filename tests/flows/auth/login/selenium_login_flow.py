"""
Flujo de login automatizado con Selenium para pruebas.
Este módulo proporciona una función reutilizable para realizar login en la aplicación.
"""

import os
import time
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from dotenv import load_dotenv

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

def perform_login(driver=None, headless=None):
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
    # Obtener credenciales del .env
    email = os.getenv('EMAIL')
    password = os.getenv('PASSWORD')
    
    # Leer configuración headless del .env si no se especifica
    if headless is None:
        headless_env = os.getenv('HEADLESS', 'false').lower()
        headless = headless_env in ('true', '1', 'yes', 'on')

    if not email or not password:
        raise ValueError("Credenciales EMAIL y PASSWORD no encontradas en .env")

    # Crear driver si no se proporciona
    if driver is None:
        chrome_options = Options()
        if headless:
            chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--start-maximized')  # Maximizar ventana al iniciar

        # Habilitar logging de consola del navegador
        chrome_options.add_experimental_option("useAutomationExtension", False)
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_argument("--enable-logging")
        chrome_options.add_argument("--log-level=0")
        chrome_options.add_argument("--v=1")

        # Configurar path del chromedriver
        chromedriver_path = PROJECT_ROOT / 'chromedriver' / 'driver.exe'
        service = Service(str(chromedriver_path))

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
            EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Contraseña']"))
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

    # Habilitar logging de consola del navegador
    chrome_options.add_experimental_option("useAutomationExtension", False)
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_argument("--enable-logging")
    chrome_options.add_argument("--log-level=0")
    chrome_options.add_argument("--v=1")

    # Configurar path del chromedriver
    chromedriver_path = PROJECT_ROOT / 'chromedriver' / 'driver.exe'
    service = Service(str(chromedriver_path))

    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver