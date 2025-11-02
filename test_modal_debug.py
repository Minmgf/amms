#!/usr/bin/env python3
"""
Prueba para debuggear el modal de edición
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

def test_modal_debug():
    """Prueba para debuggear el modal de edición"""
    print("Debuggeando modal de edicion...")
    
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
        
        print("Buscando botones de editar...")
        edit_buttons = driver.find_elements(By.XPATH, "//button[@title='Editar mantenimiento']")
        print(f"Botones de editar encontrados: {len(edit_buttons)}")
        
        if len(edit_buttons) == 0:
            print("ERROR: No se encontraron botones de editar")
            return False
        
        # Hacer clic en el primer botón
        print("Haciendo clic en el primer boton de editar...")
        first_button = edit_buttons[0]
        driver.execute_script("arguments[0].scrollIntoView(true);", first_button)
        time.sleep(1)
        first_button.click()
        
        # Esperar un poco
        time.sleep(3)
        
        print("Buscando elementos que podrian indicar un modal...")
        
        # Buscar todos los posibles elementos de modal
        modal_selectors = [
            "//div[contains(@class, 'modal')]",
            "//div[contains(@class, 'dialog')]",
            "//div[contains(@class, 'popup')]",
            "//div[contains(@class, 'overlay')]",
            "//div[contains(@class, 'backdrop')]",
            "//div[contains(@class, 'fixed')]",
            "//div[contains(@class, 'absolute')]",
            "//div[contains(@class, 'z-50')]",
            "//div[contains(@class, 'z-40')]",
            "//div[contains(@class, 'z-30')]"
        ]
        
        for selector in modal_selectors:
            elements = driver.find_elements(By.XPATH, selector)
            if elements:
                print(f"Elementos encontrados con selector '{selector}': {len(elements)}")
                for i, element in enumerate(elements):
                    try:
                        text = element.text[:100] if element.text else "Sin texto"
                        class_name = element.get_attribute("class")
                        print(f"  Elemento {i}: class='{class_name}', text='{text}'")
                    except:
                        print(f"  Elemento {i}: no se pudo obtener atributos")
        
        # Buscar formularios
        print("Buscando formularios...")
        forms = driver.find_elements(By.TAG_NAME, "form")
        print(f"Formularios encontrados: {len(forms)}")
        
        # Buscar inputs
        print("Buscando inputs...")
        inputs = driver.find_elements(By.TAG_NAME, "input")
        print(f"Inputs encontrados: {len(inputs)}")
        
        for i, input_elem in enumerate(inputs[:10]):  # Solo los primeros 10
            try:
                name = input_elem.get_attribute("name")
                type_attr = input_elem.get_attribute("type")
                placeholder = input_elem.get_attribute("placeholder")
                print(f"  Input {i}: name='{name}', type='{type_attr}', placeholder='{placeholder}'")
            except:
                print(f"  Input {i}: no se pudo obtener atributos")
        
        # Buscar textareas
        print("Buscando textareas...")
        textareas = driver.find_elements(By.TAG_NAME, "textarea")
        print(f"Textareas encontrados: {len(textareas)}")
        
        # Buscar selects
        print("Buscando selects...")
        selects = driver.find_elements(By.TAG_NAME, "select")
        print(f"Selects encontrados: {len(selects)}")
        
        # Verificar si hay elementos ocultos
        print("Verificando elementos ocultos...")
        hidden_elements = driver.find_elements(By.XPATH, "//*[@style*='display: none' or @style*='visibility: hidden']")
        print(f"Elementos ocultos encontrados: {len(hidden_elements)}")
        
        # Tomar screenshot
        driver.save_screenshot("modal_debug.png")
        print("Screenshot guardado: modal_debug.png")
        
        return True
    
    except Exception as e:
        print(f"Error durante la prueba: {e}")
        # Tomar screenshot del error
        driver.save_screenshot("modal_debug_error.png")
        print("Screenshot del error guardado: modal_debug_error.png")
        return False
    
    finally:
        driver.quit()

def main():
    """Función principal"""
    print("DEBUGGING DE MODAL DE EDICION")
    print("="*35)
    
    success = test_modal_debug()
    
    if success:
        print("\nSUCCESS: Debugging completado")
        print("Revisa el screenshot para ver qué elementos están disponibles")
    else:
        print("\nERROR: Error durante el debugging")

if __name__ == "__main__":
    main()



