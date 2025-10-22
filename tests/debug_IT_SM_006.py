import time
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

EMAIL = "u20191179903@usco.edu.co"
PASSWORD = "4L34J4CT4est"
LOGIN_URL = "http://localhost:3000/sigma/login"
SOLICITUDES_URL = "http://localhost:3000/sigma/maintenance/maintenanceRequest"

def wait_and_send_keys(driver, by, selector, value, timeout=10):
    elem = WebDriverWait(driver, timeout).until(
        EC.visibility_of_element_located((by, selector))
    )
    elem.clear()
    elem.send_keys(value)
    return elem

def wait_and_click(driver, by, selector, timeout=10):
    elem = WebDriverWait(driver, timeout).until(
        EC.element_to_be_clickable((by, selector))
    )
    elem.click()
    return elem

@pytest.fixture(scope="module")
def driver():
    options = webdriver.ChromeOptions()
    options.binary_location = r"C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe"
    options.add_argument("--start-maximized")
    driver = webdriver.Chrome(options=options)
    yield driver
    driver.quit()

def test_debug_schedule_form(driver):
    """Debug test para entender la estructura del formulario de programación"""
    
    # Login
    driver.get(LOGIN_URL)
    wait_and_send_keys(driver, By.NAME, "email", EMAIL)
    wait_and_send_keys(driver, By.NAME, "password", PASSWORD)
    wait_and_click(driver, By.CSS_SELECTOR, "button[type='submit']")
    time.sleep(3)
    print("Login completado")
    
    # Ir a solicitudes
    driver.get(SOLICITUDES_URL)
    time.sleep(2)
    print("En página de solicitudes")
    
    # Buscar cualquier botón en la primera fila
    try:
        first_row = driver.find_element(By.CSS_SELECTOR, "table tbody tr:first-child")
        all_buttons = first_row.find_elements(By.CSS_SELECTOR, "button")
        
        print(f"Botones encontrados en primera fila: {len(all_buttons)}")
        
        for i, button in enumerate(all_buttons):
            text = button.text.strip()
            title = button.get_attribute("title") or ""
            onclick = button.get_attribute("onclick") or ""
            classes = button.get_attribute("class") or ""
            
            print(f"Botón {i+1}:")
            print(f"  Texto: '{text}'")
            print(f"  Title: '{title}'")
            print(f"  Classes: '{classes}'")
            print(f"  OnClick: '{onclick}'")
            print()
        
        # Hacer clic en cada botón para ver qué pasa
        for i, button in enumerate(all_buttons):
            print(f"=== PROBANDO BOTÓN {i+1} ===")
            
            try:
                button.click()
                time.sleep(3)
                
                # Verificar URL actual
                current_url = driver.current_url
                print(f"URL después del clic: {current_url}")
                
                # Verificar si aparece modal
                modals = driver.find_elements(By.CSS_SELECTOR, "[class*='modal']")
                if modals:
                    print(f"Modales encontrados: {len(modals)}")
                    for modal in modals:
                        if modal.is_displayed():
                            print("Modal visible detectado")
                            
                            # Buscar campos dentro del modal
                            inputs = modal.find_elements(By.CSS_SELECTOR, "input, select, textarea")
                            print(f"Campos en modal: {len(inputs)}")
                            
                            for j, inp in enumerate(inputs):
                                input_type = inp.get_attribute("type") or inp.tag_name
                                name = inp.get_attribute("name") or ""
                                placeholder = inp.get_attribute("placeholder") or ""
                                
                                print(f"  Campo {j+1}: {input_type} - name='{name}' - placeholder='{placeholder}'")
                            
                            # Cerrar modal si hay botón de cerrar
                            close_buttons = modal.find_elements(By.CSS_SELECTOR, "button")
                            for close_btn in close_buttons:
                                close_text = close_btn.text.strip().lower()
                                if "cerrar" in close_text or "close" in close_text or "x" in close_text:
                                    close_btn.click()
                                    time.sleep(1)
                                    break
                            
                            break
                
                # Si cambió la URL, verificar la nueva página
                if current_url != SOLICITUDES_URL:
                    print("Navegó a nueva página")
                    
                    # Buscar todos los campos
                    all_inputs = driver.find_elements(By.CSS_SELECTOR, "input, select, textarea")
                    print(f"Campos en nueva página: {len(all_inputs)}")
                    
                    for j, inp in enumerate(all_inputs):
                        input_type = inp.get_attribute("type") or inp.tag_name
                        name = inp.get_attribute("name") or ""
                        placeholder = inp.get_attribute("placeholder") or ""
                        
                        print(f"  Campo {j+1}: {input_type} - name='{name}' - placeholder='{placeholder}'")
                    
                    # Regresar a la página de solicitudes
                    driver.get(SOLICITUDES_URL)
                    time.sleep(2)
                
            except Exception as e:
                print(f"Error probando botón {i+1}: {str(e)}")
                # Regresar a solicitudes en caso de error
                driver.get(SOLICITUDES_URL)
                time.sleep(2)
        
    except Exception as e:
        print(f"Error general: {str(e)}")
        
        # Guardar HTML para análisis
        with open("debug_schedule_page.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        print("HTML guardado en debug_schedule_page.html")