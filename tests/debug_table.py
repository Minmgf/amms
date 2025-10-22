# Script para inspeccionar la estructura real de la tabla
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

EMAIL = "u20191179903@usco.edu.co"
PASSWORD = "4L34J4CT4est"
LOGIN_URL = "http://localhost:3000/sigma/login"
SOLICITUDES_URL = "http://localhost:3000/sigma/maintenance/maintenanceRequest"

def inspect_table_structure():
    options = webdriver.ChromeOptions()
    options.binary_location = r"C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe"
    options.add_argument("--start-maximized")
    driver = webdriver.Chrome(options=options)
    
    try:
        # Login
        driver.get(LOGIN_URL)
        email_field = WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.NAME, "email"))
        )
        email_field.clear()
        email_field.send_keys(EMAIL)
        
        password_field = driver.find_element(By.NAME, "password")
        password_field.clear()
        password_field.send_keys(PASSWORD)
        
        login_btn = driver.find_element(By.XPATH, "//button[contains(.,'Iniciar sesión')]")
        login_btn.click()
        
        WebDriverWait(driver, 15).until(EC.url_contains("/sigma/home"))
        
        # Ir al módulo
        driver.get(SOLICITUDES_URL)
        time.sleep(3)
        
        # Esperar que cargue la tabla
        WebDriverWait(driver, 20).until(
            EC.visibility_of_element_located((By.XPATH, "//table"))
        )
        
        # Guardar el HTML completo
        with open("table_structure_debug.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        
        # Buscar todas las columnas (th)
        headers = driver.find_elements(By.XPATH, "//th")
        print("Columnas encontradas en la tabla:")
        for i, header in enumerate(headers):
            print(f"{i+1}. '{header.text.strip()}'")
        
        # Buscar toda la estructura de la tabla
        print("\nEstructura HTML de la tabla:")
        table = driver.find_element(By.XPATH, "//table")
        print(table.get_attribute('outerHTML')[:1000] + "...")
        
    except Exception as e:
        print(f"Error: {e}")
        with open("error_debug.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
    
    finally:
        time.sleep(5)  # Tiempo para inspeccionar manualmente
        driver.quit()

if __name__ == "__main__":
    inspect_table_structure()