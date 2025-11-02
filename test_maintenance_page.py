#!/usr/bin/env python3
"""
Prueba específica para verificar la página de gestión de mantenimientos
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

def test_maintenance_page():
    """Prueba la página de gestión de mantenimientos"""
    print("Probando pagina de gestion de mantenimientos...")
    
    driver = setup_driver()
    if not driver:
        return False
    
    wait = WebDriverWait(driver, 10)
    
    try:
        # Login primero
        print("Realizando login...")
        login_url = "http://localhost:3000/sigma/login"
        driver.get(login_url)
        time.sleep(3)
        
        # Llenar credenciales
        email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        email_input.clear()
        email_input.send_keys("diegosamboni2001@gmail.com")
        
        password_input = driver.find_element(By.NAME, "password")
        password_input.clear()
        password_input.send_keys("Juandiego19!")
        
        login_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Iniciar sesión') or @type='submit']")
        login_button.click()
        
        # Esperar login
        time.sleep(3)
        print("Login completado")
        
        # Navegar a la página de mantenimientos
        maintenance_url = "http://localhost:3000/sigma/maintenance/maintenanceManagement"
        print(f"Navegando a: {maintenance_url}")
        driver.get(maintenance_url)
        
        # Esperar a que cargue
        time.sleep(5)
        
        print(f"Titulo de la pagina: {driver.title}")
        print(f"URL actual: {driver.current_url}")
        
        # Buscar elementos de la página
        print("Buscando elementos de la pagina...")
        
        # Buscar título
        try:
            title = driver.find_element(By.XPATH, "//h1[contains(text(), 'Gestión de Mantenimientos')]")
            print(f"Titulo encontrado: {title.text}")
        except:
            print("No se encontro el titulo esperado")
        
        # Buscar tabla
        print("Buscando tabla...")
        tables = driver.find_elements(By.TAG_NAME, "table")
        print(f"Tablas encontradas: {len(tables)}")
        
        # Buscar botones de editar
        print("Buscando botones de editar...")
        edit_buttons = driver.find_elements(By.XPATH, "//button[contains(@title, 'Editar') or contains(@title, 'Edit') or contains(@class, 'edit')]")
        print(f"Botones de editar encontrados: {len(edit_buttons)}")
        
        for i, button in enumerate(edit_buttons):
            try:
                title = button.get_attribute("title")
                text = button.text
                class_name = button.get_attribute("class")
                print(f"  Boton {i}: title='{title}', text='{text}', class='{class_name}'")
            except:
                print(f"  Boton {i}: no se pudo obtener atributos")
        
        # Buscar todos los botones
        print("Buscando todos los botones...")
        all_buttons = driver.find_elements(By.TAG_NAME, "button")
        print(f"Total de botones encontrados: {len(all_buttons)}")
        
        for i, button in enumerate(all_buttons[:10]):  # Solo los primeros 10
            try:
                text = button.text
                title = button.get_attribute("title")
                class_name = button.get_attribute("class")
                print(f"  Boton {i}: text='{text}', title='{title}', class='{class_name}'")
            except:
                print(f"  Boton {i}: no se pudo obtener atributos")
        
        # Buscar enlaces
        print("Buscando enlaces...")
        links = driver.find_elements(By.TAG_NAME, "a")
        print(f"Enlaces encontrados: {len(links)}")
        
        for i, link in enumerate(links[:5]):  # Solo los primeros 5
            try:
                href = link.get_attribute("href")
                text = link.text
                print(f"  Link {i}: href='{href}', text='{text}'")
            except:
                print(f"  Link {i}: no se pudo obtener atributos")
        
        # Tomar screenshot
        driver.save_screenshot("maintenance_page_debug.png")
        print("Screenshot guardado: maintenance_page_debug.png")
        
        return True
    
    except Exception as e:
        print(f"Error durante la prueba: {e}")
        # Tomar screenshot del error
        driver.save_screenshot("maintenance_page_error.png")
        print("Screenshot del error guardado: maintenance_page_error.png")
        return False
    
    finally:
        driver.quit()

def main():
    """Función principal"""
    print("PRUEBA DE PAGINA DE MANTENIMIENTOS")
    print("="*40)
    
    success = test_maintenance_page()
    
    if success:
        print("\nSUCCESS: La pagina se cargo correctamente")
        print("Revisa el screenshot para ver los elementos disponibles")
    else:
        print("\nERROR: Hay problemas con la pagina")

if __name__ == "__main__":
    main()



