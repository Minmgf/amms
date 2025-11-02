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
    
    print("=== ESPERANDO Y ANALIZANDO QUE APARECE ===")
    time.sleep(5)
    
    # Capturar TODO lo que hay en la página después del clic
    print(f"URL actual después del clic: {driver.current_url}")
    
    # Buscar CUALQUIER elemento nuevo que tenga formularios, inputs, etc.
    all_forms = driver.find_elements(By.TAG_NAME, "form")
    print(f"FORMS encontrados: {len(all_forms)}")
    for i, form in enumerate(all_forms):
        if form.is_displayed():
            print(f"  Form {i+1}: class='{form.get_attribute('class')}' id='{form.get_attribute('id')}'")
    
    all_modals = driver.find_elements(By.XPATH, "//*[contains(@class, 'modal') or contains(@class, 'Modal') or contains(@class, 'dialog') or contains(@class, 'Dialog') or contains(@class, 'overlay') or contains(@class, 'popup')]")
    print(f"MODALS encontrados: {len(all_modals)}")
    for i, modal in enumerate(all_modals):
        if modal.is_displayed():
            print(f"  Modal {i+1}: tag='{modal.tag_name}' class='{modal.get_attribute('class')}' visible={modal.is_displayed()}")
    
    # Buscar inputs y textareas que podrían ser del formulario
    all_inputs = driver.find_elements(By.XPATH, "//input | //textarea | //select")
    visible_inputs = [inp for inp in all_inputs if inp.is_displayed()]
    print(f"INPUTS/TEXTAREAS visibles: {len(visible_inputs)}")
    for i, inp in enumerate(visible_inputs):
        name = inp.get_attribute("name")
        placeholder = inp.get_attribute("placeholder")
        print(f"  Input {i+1}: type='{inp.get_attribute('type')}' name='{name}' placeholder='{placeholder}'")
    
    # Guardar screenshot para análisis
    driver.save_screenshot("debug_after_report_click.png")
    print("Screenshot guardado como 'debug_after_report_click.png'")
    
    print("\n=== ANALISIS TERMINADO - CERRANDO ===")
    time.sleep(2)
    
except Exception as e:
    print(f"Error: {e}")
    driver.save_screenshot("debug_error.png")
finally:
    driver.quit()