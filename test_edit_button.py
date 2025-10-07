#!/usr/bin/env python3
"""
Prueba específica para hacer clic en el botón de editar
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

def test_edit_button():
    """Prueba hacer clic en el botón de editar"""
    print("Probando boton de editar...")
    
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
        
        # Buscar todos los botones de editar
        edit_buttons = driver.find_elements(By.XPATH, "//button[@title='Editar mantenimiento']")
        print(f"Botones de editar encontrados: {len(edit_buttons)}")
        
        if len(edit_buttons) == 0:
            print("ERROR: No se encontraron botones de editar")
            return False
        
        # Intentar hacer clic en el primer botón
        print("Intentando hacer clic en el primer boton de editar...")
        try:
            first_button = edit_buttons[0]
            print(f"Botón encontrado: {first_button.get_attribute('outerHTML')[:100]}...")
            
            # Hacer scroll hasta el botón
            driver.execute_script("arguments[0].scrollIntoView(true);", first_button)
            time.sleep(1)
            
            # Intentar hacer clic
            first_button.click()
            print("Clic realizado exitosamente")
            
            # Esperar un poco para ver qué pasa
            time.sleep(3)
            
            # Verificar si se abrió un modal o cambió algo
            print(f"URL después del clic: {driver.current_url}")
            
            # Buscar elementos que podrían indicar que se abrió un modal
            modals = driver.find_elements(By.XPATH, "//div[contains(@class, 'modal') or contains(@class, 'dialog')]")
            print(f"Modales encontrados después del clic: {len(modals)}")
            
            # Buscar campos de formulario
            form_inputs = driver.find_elements(By.XPATH, "//input[@name='name' or @name='nombre']")
            print(f"Campos de nombre encontrados: {len(form_inputs)}")
            
            if len(form_inputs) > 0:
                print("SUCCESS: Se abrió el modal de edición")
                return True
            else:
                print("ERROR: No se abrió el modal de edición")
                return False
                
        except Exception as e:
            print(f"Error haciendo clic en el botón: {e}")
            return False
        
        # Tomar screenshot
        driver.save_screenshot("edit_button_test.png")
        print("Screenshot guardado: edit_button_test.png")
        
        return True
    
    except Exception as e:
        print(f"Error durante la prueba: {e}")
        # Tomar screenshot del error
        driver.save_screenshot("edit_button_error.png")
        print("Screenshot del error guardado: edit_button_error.png")
        return False
    
    finally:
        driver.quit()

def main():
    """Función principal"""
    print("PRUEBA DE BOTON DE EDITAR")
    print("="*30)
    
    success = test_edit_button()
    
    if success:
        print("\nSUCCESS: El boton de editar funciona correctamente")
    else:
        print("\nERROR: El boton de editar no funciona")

if __name__ == "__main__":
    main()



