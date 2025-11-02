#!/usr/bin/env python3
"""
Prueba el login con debugging detallado
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

def test_login_debug():
    """Prueba el login con debugging detallado"""
    print("Probando login con debugging...")
    
    driver = setup_driver()
    if not driver:
        return False
    
    wait = WebDriverWait(driver, 10)
    
    try:
        # Navegar a la página de login
        login_url = "http://localhost:3000/sigma/login"
        print(f"Navegando a: {login_url}")
        driver.get(login_url)
        
        # Esperar a que cargue
        time.sleep(3)
        
        print(f"Titulo de la pagina: {driver.title}")
        print(f"URL actual: {driver.current_url}")
        
        # Buscar y llenar campo de email
        print("Buscando campo de email...")
        email_input = wait.until(
            EC.presence_of_element_located((By.NAME, "email"))
        )
        print("Campo de email encontrado")
        email_input.clear()
        email_input.send_keys("diegosamboni2001@gmail.com")
        print("Email ingresado")
        
        # Buscar y llenar campo de contraseña
        print("Buscando campo de contraseña...")
        password_input = driver.find_element(By.NAME, "password")
        print("Campo de contraseña encontrado")
        password_input.clear()
        password_input.send_keys("Juandiego19!")
        print("Contraseña ingresada")
        
        # Buscar y hacer clic en el botón de login
        print("Buscando botón de login...")
        login_button = driver.find_element(
            By.XPATH, "//button[contains(text(), 'Iniciar sesión') or @type='submit']"
        )
        print("Botón de login encontrado")
        print("Haciendo clic en el botón de login...")
        login_button.click()
        
        # Esperar un poco para ver qué pasa
        print("Esperando respuesta del login...")
        time.sleep(5)
        
        print(f"URL después del login: {driver.current_url}")
        print(f"Título después del login: {driver.title}")
        
        # Buscar mensajes de error
        print("Buscando mensajes de error...")
        error_elements = driver.find_elements(By.XPATH, "//div[contains(@class, 'error') or contains(@class, 'alert') or contains(@class, 'danger')]")
        if error_elements:
            for i, error in enumerate(error_elements):
                print(f"Error {i}: {error.text}")
        else:
            print("No se encontraron mensajes de error visibles")
        
        # Buscar cualquier mensaje de texto en la página
        print("Buscando mensajes de texto en la página...")
        all_text_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'error') or contains(text(), 'Error') or contains(text(), 'incorrecto') or contains(text(), 'Incorrecto')]")
        if all_text_elements:
            for i, element in enumerate(all_text_elements):
                print(f"Texto {i}: {element.text}")
        else:
            print("No se encontraron mensajes de error en el texto")
        
        # Verificar si hay elementos de validación
        print("Verificando elementos de validación...")
        validation_elements = driver.find_elements(By.XPATH, "//*[contains(@class, 'invalid') or contains(@class, 'is-invalid')]")
        if validation_elements:
            print(f"Elementos de validación encontrados: {len(validation_elements)}")
            for i, element in enumerate(validation_elements):
                print(f"Validación {i}: {element.get_attribute('class')}")
        else:
            print("No se encontraron elementos de validación")
        
        # Tomar screenshot
        driver.save_screenshot("login_debug_result.png")
        print("Screenshot guardado: login_debug_result.png")
        
        # Verificar si el login fue exitoso
        if "login" not in driver.current_url.lower():
            print("SUCCESS: Login exitoso - redirigido a otra página")
            return True
        else:
            print("ERROR: Login falló - sigue en la página de login")
            return False
    
    except Exception as e:
        print(f"Error durante la prueba: {e}")
        # Tomar screenshot del error
        driver.save_screenshot("login_debug_error.png")
        print("Screenshot del error guardado: login_debug_error.png")
        return False
    
    finally:
        driver.quit()

def main():
    """Función principal"""
    print("PRUEBA DE LOGIN CON DEBUGGING")
    print("="*40)
    
    success = test_login_debug()
    
    if success:
        print("\nSUCCESS: El login funciona correctamente")
    else:
        print("\nERROR: El login no funciona")
        print("Revisa los screenshots para ver qué está pasando")

if __name__ == "__main__":
    main()
