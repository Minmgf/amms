import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Configuración para Brave Browser
options = webdriver.ChromeOptions()
options.binary_location = r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
options.add_argument("--start-maximized")

driver = webdriver.Chrome(options=options)

try:
    print("=== LOGIN ===")
    driver.get("http://localhost:3000/sigma/login")
    
    email = WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.NAME, "email")))
    email.send_keys("u20191179903@usco.edu.co")
    
    password = WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.NAME, "password")))
    password.send_keys("4L34J4CT4est")
    
    login_btn = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']")))
    login_btn.click()
    time.sleep(3)
    
    print("=== NAVEGANDO A MANTENIMIENTOS PROGRAMADOS ===")
    driver.get("http://localhost:3000/sigma/maintenance/scheduledMaintenance")
    time.sleep(3)
    
    print("=== BUSCANDO BOTÓN REPORTE ===")
    # Usar el selector exacto que sabemos que funciona
    report_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[@title='Registrar reporte del mantenimiento']"))
    )
    
    print("Botón encontrado, haciendo clic...")
    report_btn.click()
    
    print("=== ESPERANDO MODAL Y ANALIZANDO ===")
    time.sleep(2)
    
    # BUSCAR ESPECÍFICAMENTE EL MODAL SEGÚN EL CÓDIGO FUENTE
    modal_selectors = [
        "//div[contains(@class, 'fixed') and contains(@class, 'inset-0') and contains(@class, 'bg-black/50')]",
        "//div[contains(@class, 'z-50')]",
        "//h2[text()='Reporte de mantenimiento']",
        "//div[contains(@class, 'max-w-4xl')]",
        "//form[ancestor::div[contains(@class, 'max-w-4xl')]]"
    ]
    
    modal_found = False
    
    for i, selector in enumerate(modal_selectors):
        print(f"Buscando con selector {i+1}: {selector}")
        try:
            elements = driver.find_elements(By.XPATH, selector)
            print(f"  Elementos encontrados: {len(elements)}")
            
            for j, elem in enumerate(elements):
                try:
                    is_visible = elem.is_displayed()
                    print(f"    Elemento {j+1}: visible={is_visible}")
                    if is_visible:
                        classes = elem.get_attribute("class")
                        print(f"      ÉXITO! Classes: {classes}")
                        modal_found = True
                        break
                except Exception as e:
                    print(f"    Error verificando elemento {j+1}: {e}")
            
            if modal_found:
                break
                
        except Exception as e:
            print(f"  Error con selector {i+1}: {e}")
    
    if modal_found:
        print("\n🎉 MODAL ENCONTRADO EXITOSAMENTE!")
    else:
        print("\n❌ MODAL NO ENCONTRADO")
        print("\nCapturando HTML para análisis...")
        
        # Buscar todos los divs con clases potencialmente relevantes
        all_divs = driver.find_elements(By.XPATH, "//div")
        relevant_divs = []
        
        for div in all_divs:
            try:
                if div.is_displayed():
                    classes = div.get_attribute("class") or ""
                    if any(keyword in classes for keyword in ['fixed', 'modal', 'z-', 'max-w']):
                        relevant_divs.append({
                            'tag': div.tag_name,
                            'classes': classes,
                            'text': div.text[:100] if div.text else '',
                            'children': len(div.find_elements(By.XPATH, "./*"))
                        })
            except:
                continue
        
        print(f"\nDivs relevantes encontrados: {len(relevant_divs)}")
        for i, div_info in enumerate(relevant_divs[:10]):  # Solo primeros 10
            print(f"  {i+1}. Tag: {div_info['tag']}, Classes: {div_info['classes'][:100]}, Children: {div_info['children']}")
            if div_info['text']:
                print(f"      Text: {div_info['text']}")
        
        # También buscar forms
        all_forms = driver.find_elements(By.TAG_NAME, "form")
        visible_forms = [f for f in all_forms if f.is_displayed()]
        print(f"\nForms visibles: {len(visible_forms)}")
        
        # Y h2 con texto relevante
        all_h2 = driver.find_elements(By.XPATH, "//h2")
        for h2 in all_h2:
            try:
                if h2.is_displayed() and 'reporte' in h2.text.lower():
                    print(f"H2 relevante encontrado: '{h2.text}'")
            except:
                continue
    
    # Esperar para inspección manual si es necesario
    print("\n=== ANÁLISIS COMPLETADO ===")
    time.sleep(3)
    
except Exception as e:
    print(f"Error general: {e}")
finally:
    try:
        driver.quit()
    except:
        pass