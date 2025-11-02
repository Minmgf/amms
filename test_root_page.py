#!/usr/bin/env python3
"""
Prueba la página raíz para ver qué rutas están disponibles
"""

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import os
import time

def setup_driver():
    """Configura el driver de Chrome"""
    chrome_options = Options()
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    # Buscar el driver
    driver_paths = [
        os.path.join(os.getcwd(), "chromedriver.exe"),
        os.path.join(os.getcwd(), "tests", "chromedriver-win64", "chromedriver.exe")
    ]
    
    driver_path = None
    for path in driver_paths:
        if os.path.exists(path):
            driver_path = path
            break
    
    if not driver_path:
        print("ChromeDriver no encontrado")
        return None
    
    try:
        service = Service(executable_path=driver_path)
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        return driver
    except Exception as e:
        print(f"Error configurando ChromeDriver: {e}")
        return None

def test_root_page():
    """Prueba la página raíz"""
    print("Probando pagina raiz...")
    
    driver = setup_driver()
    if not driver:
        return False
    
    try:
        # Navegar a la página raíz
        root_url = "http://localhost:3000"
        print(f"Navegando a: {root_url}")
        driver.get(root_url)
        
        # Esperar un poco para que cargue
        time.sleep(3)
        
        # Verificar el título de la página
        print(f"Titulo de la pagina: {driver.title}")
        
        # Verificar la URL actual
        print(f"URL actual: {driver.current_url}")
        
        # Buscar enlaces de navegación
        print("Buscando enlaces de navegacion...")
        links = driver.find_elements(By.TAG_NAME, "a")
        print(f"Enlaces encontrados: {len(links)}")
        
        for i, link in enumerate(links[:10]):  # Solo los primeros 10
            try:
                href = link.get_attribute("href")
                text = link.text
                print(f"  Link {i}: href='{href}', text='{text}'")
            except:
                print(f"  Link {i}: no se pudo obtener atributos")
        
        # Buscar botones
        print("Buscando botones...")
        buttons = driver.find_elements(By.TAG_NAME, "button")
        print(f"Botones encontrados: {len(buttons)}")
        
        for i, button in enumerate(buttons[:5]):  # Solo los primeros 5
            try:
                text = button.text
                onclick = button.get_attribute("onclick")
                print(f"  Button {i}: text='{text}', onclick='{onclick}'")
            except:
                print(f"  Button {i}: no se pudo obtener atributos")
        
        # Tomar screenshot
        driver.save_screenshot("root_page_debug.png")
        print("Screenshot guardado: root_page_debug.png")
        
        return True
    
    except Exception as e:
        print(f"Error durante la prueba: {e}")
        return False
    
    finally:
        driver.quit()

def main():
    """Función principal"""
    print("PRUEBA DE PAGINA RAIZ")
    print("="*30)
    
    success = test_root_page()
    
    if success:
        print("\nSUCCESS: La pagina raiz se cargo correctamente")
    else:
        print("\nERROR: Hay problemas con la pagina raiz")

if __name__ == "__main__":
    main()



