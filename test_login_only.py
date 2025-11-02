#!/usr/bin/env python3
"""
Prueba solo el login para verificar que funciona
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

def test_login_only():
    """Prueba solo el proceso de login"""
    print("Probando solo el login...")
    
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
        email_input.send_keys("Diegosamboni2001@gmail.com")
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
        
        # Tomar screenshot
        driver.save_screenshot("login_test_result.png")
        print("Screenshot guardado: login_test_result.png")
        
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
        driver.save_screenshot("login_error.png")
        print("Screenshot del error guardado: login_error.png")
        return False
    
    finally:
        driver.quit()

def main():
    """Función principal"""
    print("PRUEBA DE LOGIN SOLO")
    print("="*30)
    
    success = test_login_only()
    
    if success:
        print("\nSUCCESS: El login funciona correctamente")
    else:
        print("\nERROR: El login no funciona")
        print("Posibles causas:")
        print("1. Credenciales incorrectas")
        print("2. La aplicación no está configurada correctamente")
        print("3. Hay un problema con la validación del login")

if __name__ == "__main__":
    main()
