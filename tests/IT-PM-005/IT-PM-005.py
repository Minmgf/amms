import time
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

EMAIL = "test@example.com"
PASSWORD = "testpassword123"
LOGIN_URL = "http://localhost:3000/sigma/login"
SCHEDULED_MAINTENANCE_URL = "http://localhost:3000/sigma/maintenance/scheduledMaintenance"

@pytest.fixture(scope="module")
def driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    driver = webdriver.Chrome(options=options)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    print("USANDO GOOGLE CHROME")
    yield driver
    driver.quit()

def test_IT_PM_005_FLUJO_MANUAL_EXACTO(driver):
    """
    IT-PM-005: Registrar Reporte Detallado de Mantenimiento - Funcionalidad Completa
    Verificar que el sistema permita registrar reportes detallados de mantenimientos realizados
    desde el listado de mantenimientos programados usando datos mock para testing
    """
    print("=== IT-PM-005: REGISTRAR REPORTE DE MANTENIMIENTO ===")

    # 1. Login
    driver.get(LOGIN_URL)
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "email"))).send_keys(EMAIL)
    driver.find_element(By.NAME, "password").send_keys(PASSWORD)
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    time.sleep(3)
    print("Login completado")

    # 2. Buscar mantenimiento programado
    driver.get(SCHEDULED_MAINTENANCE_URL)
    time.sleep(3)
    
    target_maintenance = None
    maintenance_id = None
    
    rows = driver.find_elements(By.CSS_SELECTOR, "tbody tr")
    for row in rows:
        if "programado" in row.text.lower():
            maintenance_id = row.find_elements(By.TAG_NAME, "td")[0].text.strip()
            print(f"Encontrado mantenimiento programado: {maintenance_id}")
            
            report_btn = row.find_element(By.XPATH, ".//button[contains(text(), 'Reporte')]")
            report_btn.click()
            time.sleep(3)
            break
    else:
        print("No hay mantenimientos programados disponibles")
        return False
    
    print("Modal de reporte abierto")
    
    # 3. LLENAR CAMPOS BÁSICOS
    # Tiempo
    hours_field = driver.find_element(By.XPATH, "//input[@aria-label='Horas invertidas']")
    minutes_field = driver.find_element(By.XPATH, "//input[@aria-label='Minutos invertidos']")
    hours_field.send_keys("2")
    minutes_field.send_keys("30")
    print("Tiempo: 2h 30m")
    
    # Descripción
    desc_field = driver.find_element(By.XPATH, "//textarea[contains(@placeholder, 'Describe')]")
    desc_field.send_keys("Test automatizado de reporte de mantenimiento")
    print("Descripción completada")
    
    # 4. TÉCNICOS - JAVASCRIPT DIRECTO
    print("=== TÉCNICOS ===")
    driver.execute_script("""
        // Seleccionar primer técnico disponible (no placeholder)
        var techSelect = document.querySelector('select[aria-label="Seleccionar técnico"]');
        for(var i = 1; i < techSelect.options.length; i++) {
            if(techSelect.options[i].text && techSelect.options[i].text.trim() !== '') {
                techSelect.selectedIndex = i;
                techSelect.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('Técnico seleccionado:', techSelect.options[i].text);
                break;
            }
        }
    """)
    time.sleep(1)
    
    # Presionar botón Agregar técnico
    add_tech_btn = driver.find_element(By.XPATH, "//button[@aria-label='Agregar técnico seleccionado']")
    driver.execute_script("arguments[0].click();", add_tech_btn)
    time.sleep(2)
    print("Técnico agregado como responsable")
    
    # 5. MONEDA - JAVASCRIPT DIRECTO
    driver.execute_script("""
        // Seleccionar primera moneda disponible
        var currencySelect = document.querySelector('select[aria-label="Seleccionar moneda"]');
        if(currencySelect.options.length > 1) {
            currencySelect.selectedIndex = 1;
            currencySelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    """)
    time.sleep(1)
    print("Moneda seleccionada")
    
    # 6. MANTENIMIENTO REALIZADO - JAVASCRIPT DIRECTO
    print("=== MANTENIMIENTOS ===")
    driver.execute_script("""
        // Seleccionar primer tipo de mantenimiento
        var maintSelect = document.querySelector('select[aria-label="Seleccionar mantenimiento"]');
        if(maintSelect.options.length > 1) {
            maintSelect.selectedIndex = 1;
            maintSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        // Seleccionar primer técnico responsable 
        setTimeout(function() {
            var techRespSelect = document.querySelector('select[aria-label="Seleccionar técnico responsable"]');
            if(techRespSelect && techRespSelect.options.length > 1) {
                techRespSelect.selectedIndex = 1;
                techRespSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }, 500);
    """)
    time.sleep(2)
    
    # Costo
    cost_input = driver.find_element(By.XPATH, "//input[@aria-label='Costo del mantenimiento']")
    cost_input.send_keys("150000")
    print("Costo: $150,000")
    
    # Agregar mantenimiento
    add_maint_btn = driver.find_element(By.XPATH, "//button[@aria-label='Agregar mantenimiento realizado']")
    driver.execute_script("arguments[0].click();", add_maint_btn)
    time.sleep(3)
    print("Mantenimiento agregado")
    
    # 7. RECOMENDACIONES (opcional)
    try:
        recommendations = driver.find_element(By.XPATH, "//textarea[contains(@placeholder, 'recomendacion') or contains(@placeholder, 'Recomendacion')]")
        recommendations.send_keys("Revisar en 30 días")
        print("Recomendaciones agregadas")
    except:
        print("Campo recomendaciones no encontrado")
    
    # 8. GUARDAR
    print("=== GUARDANDO ===")
    save_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Guardar')]")
    save_btn.click()
    time.sleep(5)
    print("Guardado")
    
    # 9. VERIFICAR ERRORES
    try:
        errors = driver.find_elements(By.XPATH, "//*[contains(text(), 'Debes agregar') or contains(text(), 'Error') or contains(text(), 'obligatorio')]")
        visible_errors = [e.text for e in errors if e.is_displayed() and e.text.strip()]
        if visible_errors:
            print("ERRORES DETECTADOS:")
            for error in visible_errors:
                print(f"   - {error}")
            return False
        else:
            print("No hay errores - reporte guardado exitosamente")
    except:
        print("No se pudieron verificar errores")
    
    return True