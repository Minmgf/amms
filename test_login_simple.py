#!/usr/bin/env python3
"""
Prueba simple para verificar la página de login
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

def test_login_page():
    """Prueba la página de login"""
    print("Probando pagina de login...")
    
    driver = setup_driver()
    if not driver:
        return False
    
    try:
        # Navegar a la página de login
        login_url = "http://localhost:3000/login"
        print(f"Navegando a: {login_url}")
        driver.get(login_url)
        
        # Esperar un poco para que cargue
        time.sleep(3)
        
        # Verificar el título de la página
        print(f"Titulo de la pagina: {driver.title}")
        
        # Verificar la URL actual
        print(f"URL actual: {driver.current_url}")
        
        # Buscar elementos de login con múltiples selectores
        print("Buscando elementos de login...")
        
        # Buscar campo de email
        email_selectors = [
            "input[name='email']",
            "input[type='email']",
            "input[placeholder*='email']",
            "input[placeholder*='Email']"
        ]
        
        email_found = False
        for selector in email_selectors:
            try:
                email_input = driver.find_element(By.CSS_SELECTOR, selector)
                print(f"Campo de email encontrado con selector: {selector}")
                email_found = True
                break
            except:
                continue
        
        if not email_found:
            print("No se encontro campo de email")
            # Mostrar todos los inputs disponibles
            inputs = driver.find_elements(By.TAG_NAME, "input")
            print(f"Inputs encontrados: {len(inputs)}")
            for i, input_elem in enumerate(inputs):
                try:
                    name = input_elem.get_attribute("name")
                    type_attr = input_elem.get_attribute("type")
                    placeholder = input_elem.get_attribute("placeholder")
                    print(f"  Input {i}: name='{name}', type='{type_attr}', placeholder='{placeholder}'")
                except:
                    print(f"  Input {i}: no se pudo obtener atributos")
        
        # Buscar campo de contraseña
        password_selectors = [
            "input[name='password']",
            "input[type='password']",
            "input[placeholder*='password']",
            "input[placeholder*='Password']"
        ]
        
        password_found = False
        for selector in password_selectors:
            try:
                password_input = driver.find_element(By.CSS_SELECTOR, selector)
                print(f"Campo de contraseña encontrado con selector: {selector}")
                password_found = True
                break
            except:
                continue
        
        if not password_found:
            print("No se encontro campo de contraseña")
        
        # Buscar botón de login
        button_selectors = [
            "button[type='submit']",
            "button:contains('Iniciar')",
            "button:contains('Login')",
            "input[type='submit']"
        ]
        
        button_found = False
        for selector in button_selectors:
            try:
                if ":contains" in selector:
                    # Usar XPath para contains
                    xpath_selector = f"//button[contains(text(), 'Iniciar') or contains(text(), 'Login')]"
                    button = driver.find_element(By.XPATH, xpath_selector)
                else:
                    button = driver.find_element(By.CSS_SELECTOR, selector)
                print(f"Boton de login encontrado con selector: {selector}")
                button_found = True
                break
            except:
                continue
        
        if not button_found:
            print("No se encontro boton de login")
            # Mostrar todos los botones disponibles
            buttons = driver.find_elements(By.TAG_NAME, "button")
            print(f"Botones encontrados: {len(buttons)}")
            for i, button in enumerate(buttons):
                try:
                    text = button.text
                    type_attr = button.get_attribute("type")
                    print(f"  Button {i}: text='{text}', type='{type_attr}'")
                except:
                    print(f"  Button {i}: no se pudo obtener atributos")
        
        # Tomar screenshot
        driver.save_screenshot("login_debug.png")
        print("Screenshot guardado: login_debug.png")
        
        if email_found and password_found and button_found:
            print("SUCCESS: Todos los elementos de login encontrados")
            return True
        else:
            print("ERROR: No se encontraron todos los elementos necesarios")
            return False
    
    except Exception as e:
        print(f"Error durante la prueba: {e}")
        return False
    
    finally:
        driver.quit()

def main():
    """Función principal"""
    print("PRUEBA SIMPLE DE LOGIN")
    print("="*30)
    
    success = test_login_page()
    
    if success:
        print("\nSUCCESS: La pagina de login funciona correctamente")
        print("Ahora puedes ejecutar la prueba completa:")
        print("  python test_hu_gm_003_improved.py")
    else:
        print("\nERROR: Hay problemas con la pagina de login")
        print("Verifica que la aplicacion este ejecutandose correctamente")

if __name__ == "__main__":
    main()



