import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Brave Browser
options = webdriver.ChromeOptions()
options.binary_location = r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
options.add_argument("--start-maximized")

driver = webdriver.Chrome(options=options)

try:
    print("Login...")
    driver.get("http://localhost:3000/sigma/login")
    
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.NAME, "email"))).send_keys("u20191179903@usco.edu.co")
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.NAME, "password"))).send_keys("4L34J4CT4est")
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']"))).click()
    time.sleep(3)
    
    print("Navegando a mantenimientos...")
    driver.get("http://localhost:3000/sigma/maintenance/scheduledMaintenance")
    time.sleep(3)
    
    print("Buscando y haciendo clic en Reporte...")
    report_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[@title='Registrar reporte del mantenimiento']"))
    )
    report_btn.click()
    
    print("Esperando modal...")
    time.sleep(5)
    
    # Buscar modal por título
    try:
        title = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.XPATH, "//h2[contains(text(), 'Reporte de mantenimiento')]"))
        )
        print("✓ MODAL ENCONTRADO!")
        print(f"Título: {title.text}")
        
        # Buscar form
        form = driver.find_element(By.TAG_NAME, "form")
        print("✓ FORM ENCONTRADO!")
        
        # Buscar descripción
        desc = driver.find_element(By.XPATH, "//textarea")
        print("✓ TEXTAREA ENCONTRADA!")
        
        print("¡TODO FUNCIONA! El modal SÍ aparece correctamente")
        
    except Exception as e:
        print(f"✗ Modal no encontrado: {e}")
        
        # Debug básico
        forms = driver.find_elements(By.TAG_NAME, "form")
        print(f"Forms en página: {len(forms)}")
        
        modals = driver.find_elements(By.XPATH, "//*[contains(@class, 'fixed')]")
        print(f"Elementos fixed: {len(modals)}")

finally:
    input("Presiona Enter para cerrar...")
    driver.quit()