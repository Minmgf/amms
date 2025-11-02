# Script simple para identificar el punto de falla
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

EMAIL = "u20191179903@usco.edu.co"
PASSWORD = "4L34J4CT4est"
LOGIN_URL = "http://localhost:3000/sigma/login"
SOLICITUDES_URL = "http://localhost:3000/sigma/maintenance/maintenanceRequest"

def debug_step_by_step():
    options = webdriver.ChromeOptions()
    options.binary_location = r"C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe"
    options.add_argument("--start-maximized")
    driver = webdriver.Chrome(options=options)
    
    try:
        print("1. Iniciando login...")
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
        print("✓ Login exitoso")
        
        print("2. Navegando a solicitudes...")
        driver.get(SOLICITUDES_URL)
        time.sleep(3)
        
        print("3. Buscando tabla...")
        table = WebDriverWait(driver, 20).until(
            EC.visibility_of_element_located((By.XPATH, "//table"))
        )
        print("✓ Tabla encontrada")
        
        print("4. Verificando columnas...")
        headers = driver.find_elements(By.XPATH, "//th")
        for i, header in enumerate(headers):
            print(f"  Columna {i+1}: '{header.text.strip()}'")
        print("✓ Columnas verificadas")
        
        print("5. Buscando botón de detalles...")
        try:
            detalles_btn = driver.find_element(By.XPATH, "//tbody/tr[1]//button[contains(text(),'Detalles') or contains(@aria-label,'Detalles')]")
            print("✓ Botón de detalles encontrado")
        except:
            print("✗ Botón de detalles NO encontrado")
            # Buscar todos los botones en la primera fila
            buttons = driver.find_elements(By.XPATH, "//tbody/tr[1]//button")
            print(f"  Botones encontrados en primera fila: {len(buttons)}")
            for i, btn in enumerate(buttons):
                print(f"    Botón {i+1}: '{btn.text.strip()}' / aria-label: '{btn.get_attribute('aria-label')}'")
        
        print("6. Buscando botón de filtros...")
        try:
            filtros_btn = driver.find_element(By.XPATH, "//button[contains(text(),'Filtros') or contains(@aria-label,'Filtros')]")
            print("✓ Botón de filtros encontrado")
        except:
            print("✗ Botón de filtros NO encontrado")
            # Buscar todos los botones en la página
            buttons = driver.find_elements(By.XPATH, "//button")
            print(f"  Total de botones en la página: {len(buttons)}")
            for i, btn in enumerate(buttons[:10]):  # Solo los primeros 10
                print(f"    Botón {i+1}: '{btn.text.strip()}' / aria-label: '{btn.get_attribute('aria-label')}'")
        
        print("7. Buscando campo de búsqueda...")
        try:
            search_field = driver.find_element(By.XPATH, "//input[contains(@placeholder,'Buscar') or contains(@aria-label,'Buscar')]")
            print("✓ Campo de búsqueda encontrado")
        except:
            print("✗ Campo de búsqueda NO encontrado")
            # Buscar todos los inputs
            inputs = driver.find_elements(By.XPATH, "//input")
            print(f"  Total de inputs en la página: {len(inputs)}")
            for i, inp in enumerate(inputs):
                placeholder = inp.get_attribute('placeholder') or ''
                aria_label = inp.get_attribute('aria-label') or ''
                input_type = inp.get_attribute('type') or ''
                print(f"    Input {i+1}: type='{input_type}' placeholder='{placeholder}' aria-label='{aria_label}'")
        
        print("\n8. Guardando HTML para inspección...")
        with open("debug_full_page.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        print("✓ HTML guardado en debug_full_page.html")
        
    except Exception as e:
        print(f"ERROR: {e}")
        with open("debug_error.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
    
    finally:
        time.sleep(5)
        driver.quit()

if __name__ == "__main__":
    debug_step_by_step()