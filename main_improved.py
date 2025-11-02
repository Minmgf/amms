from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import random
import string
import time

def generate_random_string(length=8):
    """Genera una cadena aleatoria"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def setup_driver_auto():
    """Configura y retorna el driver de Chrome con descarga automática del driver"""
    # Configurar opciones de Chrome
    chrome_options = Options()
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    
    try:
        # Usar webdriver-manager para descargar automáticamente el driver
        service = Service(ChromeDriverManager().install())
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
    driver = setup_driver_auto()
    if not driver:
        return
    
    try:
        # Navegar a MercadoLibre
        print("Navegando a MercadoLibre...")
        driver.get("https://www.mercadolibre.com.co/")
        
        # Esperar a que la página cargue completamente
        wait = WebDriverWait(driver, 15)
        
        # Buscar y hacer clic en el botón "Ingresa"
        print("Buscando botón de ingreso...")
        selectors_to_try = [
            "//a[normalize-space()='Ingresa']",
            "//a[contains(text(), 'Ingresa')]",
            "[data-link-id='login']",
            ".nav-menu-item-link[href*='login']",
            "a[href*='login']"
        ]
        
        login_clicked = False
        for selector in selectors_to_try:
            try:
                if selector.startswith("//"):
                    # XPath
                    login_button = wait.until(
                        EC.element_to_be_clickable((By.XPATH, selector))
                    )
                else:
                    # CSS Selector
                    login_button = wait.until(
                        EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                    )
                
                login_button.click()
                print(f"Botón de ingreso clickeado exitosamente con selector: {selector}")
                login_clicked = True
                break
                
            except Exception as e:
                print(f"Selector {selector} falló: {e}")
                continue
        
        if not login_clicked:
            print("No se pudo encontrar el botón de ingreso")
            print("Títulos de enlaces encontrados:")
            try:
                links = driver.find_elements(By.TAG_NAME, "a")
                for link in links[:10]:  # Mostrar solo los primeros 10
                    text = link.text.strip()
                    if text:
                        print(f"- {text}")
            except:
                pass
        
        # Esperar 5 segundos para ver el resultado
        print("Esperando 5 segundos...")
        time.sleep(5)
        
        # Tomar screenshot para verificar
        screenshot_path = f"screenshot_{generate_random_string()}.png"
        driver.save_screenshot(screenshot_path)
        print(f"Screenshot guardado como: {screenshot_path}")
        
        # Mostrar la URL actual
        print(f"URL actual: {driver.current_url}")
        
    except Exception as e:
        print(f"Error durante la ejecución: {e}")
    
    finally:
        # Cerrar el navegador
        print("Cerrando navegador...")
        driver.quit()
        print("Automatización completada")

if __name__ == "__main__":
    main()


