# Script específico para mapear solo el modal de filtros
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

EMAIL = "u20191179903@usco.edu.co"
PASSWORD = "4L34J4CT4est"
LOGIN_URL = "http://localhost:3000/sigma/login"
SOLICITUDES_URL = "http://localhost:3000/sigma/maintenance/maintenanceRequest"

def map_modal_only():
    options = webdriver.ChromeOptions()
    options.binary_location = r"C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe"
    options.add_argument("--start-maximized")
    driver = webdriver.Chrome(options=options)
    
    try:
        # Login rápido
        driver.get(LOGIN_URL)
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.NAME, "email"))).send_keys(EMAIL)
        driver.find_element(By.NAME, "password").send_keys(PASSWORD)
        driver.find_element(By.XPATH, "//button[contains(.,'Iniciar sesión')]").click()
        WebDriverWait(driver, 15).until(EC.url_contains("/sigma/home"))
        
        # Ir al módulo y abrir modal
        driver.get(SOLICITUDES_URL)
        time.sleep(3)
        
        # Hacer click en "Filtrar por"
        filtrar_btn = WebDriverWait(driver, 20).until(
            EC.element_to_be_clickable((By.XPATH, "//button[text()='Filtrar por']"))
        )
        filtrar_btn.click()
        time.sleep(3)
        
        print("=== ELEMENTOS DEL MODAL DE FILTROS ===\n")
        
        # Buscar todos los selects en el modal
        print("1. SELECTORES EN EL MODAL:")
        selects = driver.find_elements(By.XPATH, "//div[contains(@class,'modal') or contains(@role,'dialog')]//select")
        if not selects:
            selects = driver.find_elements(By.XPATH, "//select")
        
        for i, select in enumerate(selects):
            name = select.get_attribute('name') or '[Sin name]'
            aria_label = select.get_attribute('aria-label') or '[Sin aria-label]'
            id_attr = select.get_attribute('id') or '[Sin id]'
            classes = select.get_attribute('class') or '[Sin clases]'
            
            # Obtener opciones
            options = select.find_elements(By.XPATH, ".//option")
            options_text = []
            for opt in options[:5]:  # Primeras 5 opciones
                text = opt.text.strip()
                if text:
                    options_text.append(text)
            
            print(f"  Select {i+1}:")
            print(f"    name='{name}' | id='{id_attr}' | aria-label='{aria_label}'")
            print(f"    classes='{classes[:50]}...'")
            print(f"    opciones: {options_text}")
            print()
        
        # Buscar inputs de fecha en el modal
        print("2. INPUTS DE FECHA EN EL MODAL:")
        date_inputs = driver.find_elements(By.XPATH, "//input[@type='date']")
        for i, inp in enumerate(date_inputs):
            name = inp.get_attribute('name') or '[Sin name]'
            placeholder = inp.get_attribute('placeholder') or '[Sin placeholder]'
            aria_label = inp.get_attribute('aria-label') or '[Sin aria-label]'
            print(f"  Date Input {i+1}: name='{name}' | placeholder='{placeholder}' | aria-label='{aria_label}'")
        
        # Buscar botones en el modal
        print("\n3. BOTONES EN EL MODAL:")
        modal_buttons = driver.find_elements(By.XPATH, "//div[contains(@class,'modal')]//button")
        if not modal_buttons:
            modal_buttons = driver.find_elements(By.XPATH, "//button")[-5:]  # Últimos 5 botones
            
        for i, btn in enumerate(modal_buttons):
            text = btn.text.strip() or '[Sin texto]'
            aria_label = btn.get_attribute('aria-label') or '[Sin aria-label]'
            classes = btn.get_attribute('class') or '[Sin clases]'
            print(f"  Modal Botón {i+1}: '{text}' | aria-label='{aria_label}' | classes='{classes[:30]}...'")
        
        print("\n=== MAPEO DEL MODAL COMPLETADO ===")
        
    except Exception as e:
        print(f"ERROR: {e}")
    
    finally:
        time.sleep(5)
        driver.quit()

if __name__ == "__main__":
    map_modal_only()