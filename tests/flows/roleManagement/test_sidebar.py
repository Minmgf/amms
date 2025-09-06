"""
Script para probar específicamente el fallback del sidebar de Role Management
"""

import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from dotenv import load_dotenv

load_dotenv()
EMAIL = os.getenv('EMAIL')
PASSWORD = os.getenv('PASSWORD')
LOGIN_URL = "http://localhost:3000/sigma/login"

def test_sidebar_fallback():
    """Probar específicamente el método de fallback del sidebar"""
    
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    
    try:
        service = Service(executable_path="./chromedriver/driver.exe")
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.maximize_window()
        wait = WebDriverWait(driver, 10)
        
        print("🧪 PROBANDO FALLBACK DEL SIDEBAR")
        print("=" * 40)
        
        # Login
        print("1. Haciendo login...")
        driver.get(LOGIN_URL)
        
        email_field = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        email_field.send_keys(EMAIL)
        
        password_field = driver.find_element(By.NAME, "password")
        password_field.send_keys(PASSWORD)
        
        login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        login_button.click()
        time.sleep(3)
        
        print("   ✓ Login completado")
        
        # Probar el fallback
        print("\n2. Probando navegación por sidebar...")
        
        # Paso 1: Hacer clic en User Management
        print("   - Buscando enlace User Management...")
        try:
            user_management_link = wait.until(EC.element_to_be_clickable((By.XPATH, "//a[@href='/sigma/userManagement']")))
            print(f"   ✓ Encontrado: {user_management_link.text}")
            user_management_link.click()
            time.sleep(2)
            print("   ✓ Clic en User Management realizado")
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return False
        
        # Paso 2: Buscar Role Management en el submenú
        print("   - Buscando Role Management en submenú...")
        try:
            role_management_link = wait.until(EC.element_to_be_clickable((By.XPATH, "//a[normalize-space()='Role Management']")))
            print(f"   ✓ Encontrado: {role_management_link.text}")
            print(f"   ✓ Href: {role_management_link.get_attribute('href')}")
            role_management_link.click()
            time.sleep(3)
            print("   ✓ Clic en Role Management realizado")
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return False
        
        # Verificar resultado
        current_url = driver.current_url
        print(f"\n3. URL final: {current_url}")
        
        if 'roleManagement' in current_url:
            print("   ✅ ÉXITO: Navegación por sidebar funcionó correctamente")
            return True
        else:
            print("   ❌ FALLO: No se llegó a la página correcta")
            return False
        
    except Exception as e:
        print(f"❌ Error general: {e}")
        return False
    
    finally:
        print(f"\n🏁 Manteniendo navegador abierto por 5 segundos...")
        time.sleep(5)
        if 'driver' in locals():
            driver.quit()

if __name__ == "__main__":
    test_sidebar_fallback()
