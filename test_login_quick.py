#!/usr/bin/env python3
"""
Prueba rápida para verificar que la ruta de login funciona
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
    print("Probando página de login...")
    
    driver = setup_driver()
    if not driver:
        return False
    
    try:
        # Navegar a la página de login
        login_url = "http://localhost:3000/login"
        print(f"Navegando a: {login_url}")
        driver.get(login_url)
        
        # Esperar a que cargue la página
        wait = WebDriverWait(driver, 10)
        
        # Verificar que la página cargó correctamente
        try:
            # Buscar elementos característicos de la página de login
            email_input = wait.until(
                EC.presence_of_element_located((By.NAME, "email"))
            )
            print("✅ Campo de email encontrado")
            
            password_input = driver.find_element(By.NAME, "password")
            print("✅ Campo de contraseña encontrado")
            
            login_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Iniciar sesión')]")
            print("✅ Botón de login encontrado")
            
            print("✅ Página de login cargada correctamente")
            
            # Tomar screenshot
            driver.save_screenshot("login_page_test.png")
            print("📸 Screenshot guardado: login_page_test.png")
            
            return True
            
        except Exception as e:
            print(f"❌ Error encontrando elementos de login: {e}")
            
            # Tomar screenshot del error
            driver.save_screenshot("login_error.png")
            print("📸 Screenshot del error guardado: login_error.png")
            
            return False
    
    except Exception as e:
        print(f"❌ Error navegando a la página: {e}")
        return False
    
    finally:
        driver.quit()

def main():
    """Función principal"""
    print("PRUEBA RAPIDA DE LOGIN")
    print("="*30)
    
    success = test_login_page()
    
    if success:
        print("\n✅ PRUEBA EXITOSA: La página de login funciona correctamente")
        print("💡 Ahora puedes ejecutar la prueba completa:")
        print("   python test_hu_gm_003_improved.py")
    else:
        print("\n❌ PRUEBA FALLIDA: Hay problemas con la página de login")
        print("💡 Verifica que la aplicación esté ejecutándose correctamente")

if __name__ == "__main__":
    main()



