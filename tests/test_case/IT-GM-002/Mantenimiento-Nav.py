"""
Flujo de navegación hasta el Gestor de Mantenimientos usando Selenium.
Este módulo proporciona una función para navegar desde el login hasta el gestor de mantenimientos.
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
        test_name: Nombre del test para el archivo de logs (ej: 'IT-GM-002')
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

def perform_login(driver, email, password):
    """
    Realiza el flujo de login automatizado.

    Args:
        driver: Instancia de WebDriver
        email: Email del usuario
        password: Contraseña del usuario

    Returns:
        WebDriver: La instancia del driver con el usuario logueado.

    Raises:
        Exception: Si ocurre un error durante el login
    """
    try:
        # Navegar a la página de login
        print("Navegando a la página de login...")
        driver.get('http://localhost:3000/sigma/login')

        # Esperar a que la página cargue
        wait = WebDriverWait(driver, 15)

        # Localizar y completar campo de email
        print("Completando campo de email...")
        email_input = wait.until(
            EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Correo electrónico']"))
        )
        email_input.clear()
        email_input.send_keys(email)

        # Localizar y completar campo de contraseña
        print("Completando campo de contraseña...")
        password_input = wait.until(
            EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Contraseña']"))
        )
        password_input.clear()
        password_input.send_keys(password)

        # Localizar y hacer click en el botón de iniciar sesión
        print("Haciendo click en el botón de iniciar sesión...")
        login_button = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Iniciar sesión']"))
        )
        login_button.click()

        # Esperar a que se complete el login
        print("Esperando a que se complete el login...")
        wait.until(
            lambda driver: driver.current_url != 'http://localhost:3000/sigma/login'
        )

        print("Login completado exitosamente!")
        return driver

    except Exception as e:
        raise Exception(f"Error durante el login: {str(e)}")

def navigate_to_maintenance_manager(driver):
    """
    Navega desde el dashboard hasta el Gestor de Mantenimientos.

    Args:
        driver: Instancia de WebDriver con sesión iniciada

    Returns:
        WebDriver: La instancia del driver en la página del gestor de mantenimientos

    Raises:
        Exception: Si ocurre un error durante la navegación
    """
    try:
        wait = WebDriverWait(driver, 15)
        
        # Paso 1: Hacer click en el botón de navegación "Mantenimiento"
        print("Buscando botón de navegación 'Mantenimiento'...")
        maintenance_nav_button = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//span[normalize-space()='Mantenimiento']"))
        )
        print("Haciendo click en 'Mantenimiento'...")
        maintenance_nav_button.click()
        
        # Esperar un momento para que se cargue el menú
        time.sleep(2)
        
        # Paso 2: Hacer click en "Gestor de mantenimientos"
        print("Buscando enlace 'Gestor de mantenimientos'...")
        maintenance_manager_link = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//a[normalize-space()='Gestor de mantenimientos']"))
        )
        print("Haciendo click en 'Gestor de mantenimientos'...")
        maintenance_manager_link.click()
        
        # Esperar a que se cargue la página del gestor de mantenimientos
        print("Esperando a que se cargue la página del gestor de mantenimientos...")
        wait.until(
            lambda driver: 'mantenimiento' in driver.current_url.lower()
        )
        
        print("Navegación al Gestor de Mantenimientos completada exitosamente!")
        print(f"URL actual: {driver.current_url}")
        
        return driver

    except Exception as e:
        raise Exception(f"Error durante la navegación al gestor de mantenimientos: {str(e)}")

def create_maximized_driver(headless=False):
    """
    Crea un driver de Chrome maximizado con configuración estándar para automatizaciones.

    Args:
        headless: Si True, ejecuta en modo headless. Si False, muestra la ventana del navegador.

    Returns:
        WebDriver: Driver maximizado listo para usar.
    """
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
    chromedriver_path = Path(__file__).parent / 'driver.exe'
    service = Service(str(chromedriver_path))

    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def main():
    """
    Función principal que ejecuta el flujo completo de navegación.
    """
    driver = None
    try:
        # Credenciales proporcionadas
        email = "danielsr_1997@hotmail.com"
        password = "Usuario9924."
        
        print("=== INICIANDO FLUJO DE NAVEGACIÓN AL GESTOR DE MANTENIMIENTOS ===")
        print(f"Email: {email}")
        print(f"Password: {'*' * len(password)}")
        
        # Crear driver maximizado (no headless para visualizar el proceso)
        print("Creando driver de Chrome...")
        driver = create_maximized_driver(headless=False)
        
        # Realizar login
        print("\n--- PASO 1: REALIZANDO LOGIN ---")
        driver = perform_login(driver, email, password)
        
        # Navegar al gestor de mantenimientos
        print("\n--- PASO 2: NAVEGANDO AL GESTOR DE MANTENIMIENTOS ---")
        driver = navigate_to_maintenance_manager(driver)
        
        # Guardar logs del navegador
        print("\n--- GUARDANDO LOGS ---")
        save_browser_logs(driver, "IT-GM-002")
        
        print("\n=== FLUJO COMPLETADO EXITOSAMENTE ===")
        print("El navegador permanecerá abierto para inspección manual.")
        print("Presiona Ctrl+C para cerrar el navegador.")
        
        # Mantener el navegador abierto para inspección
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nCerrando navegador...")
            
    except Exception as e:
        print(f"\nERROR: {str(e)}")
        if driver:
            save_browser_logs(driver, "IT-GM-002-ERROR")
    finally:
        if driver:
            driver.quit()
            print("Driver cerrado.")

if __name__ == "__main__":
    main()
