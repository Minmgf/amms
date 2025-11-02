from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import random
import string
import time
import os

def generate_random_string(length=8):
    """Genera una cadena aleatoria"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def setup_driver():
    """Configura y retorna el driver de Chrome"""
    # Configurar opciones de Chrome
    chrome_options = Options()
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    # Buscar el driver en el directorio actual o en tests
    driver_path = os.path.join(os.getcwd(), "chromedriver.exe")
    if not os.path.exists(driver_path):
        driver_path = os.path.join(os.getcwd(), "tests", "chromedriver-win64", "chromedriver.exe")
    
    if not os.path.exists(driver_path):
        print(f"Error: No se encontró chromedriver.exe en {os.getcwd()}")
        print("Por favor, descarga chromedriver desde: https://chromedriver.chromium.org/")
        return None
    
    try:
        service = Service(executable_path=driver_path)
        driver = webdriver.Chrome(service=service, options=chrome_options)
        
        # Ejecutar script para ocultar que es un bot
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        return driver
    except Exception as e:
        print(f"Error al inicializar el driver: {e}")
        return None

def main():
    """Función principal"""
    print("Iniciando automatización con Selenium...")
    
    # Configurar el driver
    driver = setup_driver()
    if not driver:
        return
    
    try:
        # Navegar a MercadoLibre
        print("Navegando a MercadoLibre...")
        driver.get("https://www.mercadolibre.com.co/")
        
        # Esperar a que la página cargue completamente
        wait = WebDriverWait(driver, 10)
        
        # Buscar y hacer clic en el botón "Ingresa"
        print("Buscando botón de ingreso...")
        try:
            login_button = wait.until(
                EC.element_to_be_clickable((By.XPATH, "//a[normalize-space()='Ingresa']"))
            )
            login_button.click()
            print("Botón de ingreso clickeado exitosamente")
        except Exception as e:
            print(f"Error al hacer clic en el botón de ingreso: {e}")
            
            # Intentar con otro selector
            try:
                login_button = wait.until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-link-id='login']"))
                )
                login_button.click()
                print("Botón de ingreso clickeado con selector alternativo")
            except Exception as e2:
                print(f"Error con selector alternativo: {e2}")
        
        # Esperar 5 segundos para ver el resultado
        print("Esperando 5 segundos...")
        time.sleep(5)
        
        # Tomar screenshot para verificar
        screenshot_path = f"screenshot_{generate_random_string()}.png"
        driver.save_screenshot(screenshot_path)
        print(f"Screenshot guardado como: {screenshot_path}")
        
    except Exception as e:
        print(f"Error durante la ejecución: {e}")
    
    finally:
        # Cerrar el navegador
        print("Cerrando navegador...")
        driver.quit()
        print("Automatización completada")

if __name__ == "__main__":
    main()
