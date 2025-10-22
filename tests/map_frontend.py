# Script completo para mapear TODOS los elementos del frontend
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

EMAIL = "u20191179903@usco.edu.co"
PASSWORD = "4L34J4CT4est"
LOGIN_URL = "http://localhost:3000/sigma/login"
SOLICITUDES_URL = "http://localhost:3000/sigma/maintenance/maintenanceRequest"

def map_complete_frontend():
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
        
        print("=== MAPEO COMPLETO DEL FRONTEND ===\n")
        
        # 1. Tabla y columnas
        print("1. COLUMNAS DE LA TABLA:")
        headers = driver.find_elements(By.XPATH, "//th")
        for i, header in enumerate(headers):
            print(f"   {i+1}. '{header.text.strip()}'")
        
        # 2. Todos los botones
        print("\n2. TODOS LOS BOTONES EN LA PÁGINA:")
        buttons = driver.find_elements(By.XPATH, "//button")
        for i, btn in enumerate(buttons):
            text = btn.text.strip() or '[Sin texto]'
            aria_label = btn.get_attribute('aria-label') or '[Sin aria-label]'
            classes = btn.get_attribute('class') or '[Sin clases]'
            print(f"   Botón {i+1}: '{text}' | aria-label: '{aria_label}' | classes: '{classes[:50]}...'")
        
        # 3. Todos los inputs
        print("\n3. TODOS LOS CAMPOS INPUT:")
        inputs = driver.find_elements(By.XPATH, "//input")
        for i, inp in enumerate(inputs):
            input_type = inp.get_attribute('type') or '[Sin type]'
            placeholder = inp.get_attribute('placeholder') or '[Sin placeholder]'
            aria_label = inp.get_attribute('aria-label') or '[Sin aria-label]'
            name = inp.get_attribute('name') or '[Sin name]'
            classes = inp.get_attribute('class') or '[Sin clases]'
            print(f"   Input {i+1}: type='{input_type}' | placeholder='{placeholder}' | aria-label='{aria_label}' | name='{name}' | classes: '{classes[:30]}...'")
        
        # 4. Hacer click en "Filtrar por" para ver el modal
        print("\n4. ABRIENDO MODAL DE FILTROS...")
        try:
            filtrar_btn = driver.find_element(By.XPATH, "//button[contains(text(),'Filtrar por')]")
            filtrar_btn.click()
            time.sleep(2)
            
            print("   MODAL DE FILTROS ABIERTO")
            
            # Mapear elementos del modal
            print("\n   4.1. SELECTORES EN EL MODAL:")
            selects = driver.find_elements(By.XPATH, "//select")
            for i, select in enumerate(selects):
                aria_label = select.get_attribute('aria-label') or '[Sin aria-label]'
                name = select.get_attribute('name') or '[Sin name]'
                classes = select.get_attribute('class') or '[Sin clases]'
                
                # Ver las opciones del select
                options = select.find_elements(By.XPATH, ".//option")
                options_text = [opt.text.strip() for opt in options[:5]]  # Primeras 5 opciones
                
                print(f"     Select {i+1}: aria-label='{aria_label}' | name='{name}' | primeras opciones: {options_text}")
            
            print("\n   4.2. INPUTS EN EL MODAL:")
            modal_inputs = driver.find_elements(By.XPATH, "//div[contains(@class,'modal') or contains(@role,'dialog')]//input")
            for i, inp in enumerate(modal_inputs):
                input_type = inp.get_attribute('type') or '[Sin type]'
                placeholder = inp.get_attribute('placeholder') or '[Sin placeholder]'
                aria_label = inp.get_attribute('aria-label') or '[Sin aria-label]'
                print(f"     Modal Input {i+1}: type='{input_type}' | placeholder='{placeholder}' | aria-label='{aria_label}'")
            
            print("\n   4.3. BOTONES EN EL MODAL:")
            modal_buttons = driver.find_elements(By.XPATH, "//div[contains(@class,'modal') or contains(@role,'dialog')]//button")
            for i, btn in enumerate(modal_buttons):
                text = btn.text.strip() or '[Sin texto]'
                aria_label = btn.get_attribute('aria-label') or '[Sin aria-label]'
                print(f"     Modal Botón {i+1}: '{text}' | aria-label: '{aria_label}'")
        
        except Exception as e:
            print(f"   ERROR al abrir modal: {e}")
        
        # 5. Guardar HTML completo
        print("\n5. GUARDANDO HTML COMPLETO...")
        with open("frontend_complete_map.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        print("   ✓ HTML guardado en 'frontend_complete_map.html'")
        
        print("\n=== MAPEO COMPLETADO ===")
        
    except Exception as e:
        print(f"ERROR GENERAL: {e}")
        with open("mapping_error.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
    
    finally:
        time.sleep(5)
        driver.quit()

if __name__ == "__main__":
    map_complete_frontend()