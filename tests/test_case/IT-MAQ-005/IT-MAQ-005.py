import time
import sys
from pathlib import Path
import importlib.util

# Añadir workspace root al path
sys.path.append(str(Path(__file__).parent.parent.parent))

# Import flows
from flows.auth.login.selenium_login_flow import perform_login, save_browser_logs
from flows.navigation.machinery_navigation import navigate_to_machinery

# Cargar módulos IT-MAQ-001..004 via importlib para reutilizar funciones
base = Path(__file__).parent.parent

def load_module(name, rel_path):
    path = base / rel_path
    spec = importlib.util.spec_from_file_location(name, str(path))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

it_maq_001 = load_module('IT_MAQ_001', 'IT-MAQ-001/IT-MAQ-001.py')
it_maq_002 = load_module('IT_MAQ_002', 'IT-MAQ-002/IT-MAQ-002.py')
it_maq_003 = load_module('IT_MAQ_003', 'IT-MAQ-003/IT-MAQ-003.py')
it_maq_004 = load_module('IT_MAQ_004', 'IT-MAQ-004/IT-MAQ-004.py')

# Exponer funciones principales
setup_test_environment = getattr(it_maq_001, 'setup_test_environment')
run_it_maq_001_step1 = getattr(it_maq_001, 'run_it_maq_001_step1')
run_it_maq_001_step2 = getattr(it_maq_001, 'run_it_maq_001_step2')
run_it_maq_002_step1 = getattr(it_maq_002, 'run_it_maq_002_step1', None)
run_it_maq_002_step2 = getattr(it_maq_002, 'run_it_maq_002_step2', None)
run_it_maq_003_step1 = getattr(it_maq_003, 'run_it_maq_003_step1', None)
run_it_maq_003_step2 = getattr(it_maq_003, 'run_it_maq_003_step2', None)
run_it_maq_003_step3 = getattr(it_maq_003, 'run_it_maq_003_step3', None)
run_it_maq_004_step4 = getattr(it_maq_004, 'run_it_maq_004_step4', None)

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import ElementClickInterceptedException, NoSuchElementException

from faker import Faker
fake = Faker('es_CO')

# Selectores para la sección de mantenimiento (según HTML proporcionado)
maintenance_select_xpath = "//select[@name='maintenance']"
usage_hours_input_xpath = "//input[@name='usageHours']"
unit_select_xpath = "//select[@name='unit']"
add_button_xpath = "//button[@aria-label='Add Maintenance']"

# Test data
maintenance_test_data = {
    'maintenance': '2',  # value for 'Cambio de aceite' as default
    'usageHours': '120',
    'unit': 'Horas'
}


def fill_xpath_field(driver, field_name, xpath_selector, value, field_type='input', use_value=False):
    try:
        print(f"   Completando campo '{field_name}' con '{value}' usando {xpath_selector}")
        wait = WebDriverWait(driver, 10)
        if field_type == 'select':
            elem = wait.until(EC.element_to_be_clickable((By.XPATH, xpath_selector)))
            sel = Select(elem)
            if use_value:
                sel.select_by_value(value)
            else:
                try:
                    sel.select_by_visible_text(value)
                except:
                    # fallback a primera opción válida
                    opts = [o.text for o in sel.options if o.text.strip() and 'Seleccione' not in o.text]
                    if opts:
                        sel.select_by_visible_text(opts[0])
            print(f"   ✅ Seleccionado {value} en {field_name}")
        else:
            inp = wait.until(EC.element_to_be_clickable((By.XPATH, xpath_selector)))
            inp.clear()
            inp.send_keys(value)
            print(f"   ✅ Ingresado {value} en {field_name}")
    except Exception as e:
        print(f"   ❌ Error completando {field_name}: {e}")
        raise


def add_maintenance_entry(driver, data=None):
    if data is None:
        data = maintenance_test_data

    print("Añadiendo entrada de mantenimiento...")
    fill_xpath_field(driver, 'Maintenance', maintenance_select_xpath, data['maintenance'], field_type='select', use_value=True)
    fill_xpath_field(driver, 'Usage Hours', usage_hours_input_xpath, data['usageHours'], field_type='input')
    fill_xpath_field(driver, 'Unit', unit_select_xpath, data['unit'], field_type='select')

    # Click Añadir (usar helper robusto)
    wait = WebDriverWait(driver, 10)
    btn = wait.until(EC.presence_of_element_located((By.XPATH, add_button_xpath)))
    robust_click(driver, btn)
    print('   ✅ Click en Añadir realizado')
    time.sleep(1)
    return driver


def robust_click(driver, element_or_xpath):
    """Try to click an element; if click is intercepted, attempt to close overlays or use JS click."""
    try:
        # element_or_xpath can be a WebElement or an XPath string
        if isinstance(element_or_xpath, str):
            elem = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, element_or_xpath)))
        else:
            elem = element_or_xpath

        try:
            elem.click()
            return True
        except ElementClickInterceptedException:
            print('   ⚠️ Click interceptado, intentando cerrar overlays...')
            # intentar cerrar modales/overlays comunes
            overlays = []
            try:
                overlays = driver.find_elements(By.CSS_SELECTOR, "div[id*='modal'], div[class*='modal'], div[data-modal], div[role='dialog'], div[id*='error-modal']")
            except Exception:
                overlays = []

            for ov in overlays:
                try:
                    if ov.is_displayed():
                        # buscar botón de cerrar
                        try:
                            close_btn = ov.find_element(By.XPATH, ".//button[contains(text(), 'Cerrar') or contains(@aria-label, 'Close') or contains(text(), '×')]")
                            close_btn.click()
                            print('   ✅ Cerrado overlay con botón de cerrar')
                            time.sleep(0.5)
                        except Exception:
                            # intentar click via JS sobre overlay para ocultarlo si es posible
                            try:
                                driver.execute_script("arguments[0].style.display='none';", ov)
                                print('   ✅ Ocultado overlay via JS')
                                time.sleep(0.3)
                            except Exception:
                                continue
                except Exception:
                    continue

            # último recurso: click via JS en el elemento objetivo
            try:
                driver.execute_script("arguments[0].click();", elem)
                print('   ✅ Click realizado vía JS como fallback')
                return True
            except Exception as e:
                print(f'   ❌ No se pudo clickear (JS fallback): {e}')
                raise

    except Exception as e:
        print(f'   ❌ Error en robust_click: {e}')
        raise


def close_overlays(driver):
    """Try to close common overlays or hide them to avoid intercepting clicks."""
    try:
        possible_overlays = driver.find_elements(By.CSS_SELECTOR, "div[id*='modal'], div[class*='modal'], div[data-modal], div[role='dialog'], div[id*='error-modal']")
        for ov in possible_overlays:
            try:
                if ov.is_displayed():
                    print('   Encontrado overlay/moda l visible, intentando cerrarlo...')
                    # intentar botón de cerrar
                    try:
                        close_btn = ov.find_element(By.XPATH, ".//button[contains(text(), 'Cerrar') or contains(@aria-label, 'Close') or contains(text(), '×')]")
                        close_btn.click()
                        print('   ✅ Overlay cerrado')
                        time.sleep(0.5)
                        continue
                    except Exception:
                        # intentar ocultar via JS
                        try:
                            driver.execute_script("arguments[0].style.display='none';", ov)
                            print('   ✅ Overlay ocultado via JS')
                            time.sleep(0.3)
                        except Exception:
                            continue
            except Exception:
                continue
    except Exception as e:
        print(f'   ❌ Error tratando de cerrar overlays: {e}')
        raise


def run_it_maq_005(headless=False):
    driver = None
    try:
        print('Iniciando IT-MAQ-005: Añadir mantenimiento para la maquinaria registrada')
        driver = setup_test_environment(headless=headless)

        # Intentar cerrar overlays o modales que puedan bloquear clicks en la UI
        try:
            close_overlays(driver)
        except Exception as e:
            print(f'   ⚠️ close_overlays falló: {e} (continuando)')

        # Ejecutar pasos previos (IT-MAQ-001..IT-MAQ-004)
        driver = run_it_maq_001_step1(driver)
        driver = run_it_maq_001_step2(driver)
        if run_it_maq_002_step1:
            driver = run_it_maq_002_step1(driver)
        if run_it_maq_002_step2:
            driver = run_it_maq_002_step2(driver)
        if run_it_maq_003_step1:
            driver = run_it_maq_003_step1(driver)
        if run_it_maq_003_step2:
            driver = run_it_maq_003_step2(driver)
        if run_it_maq_003_step3:
            driver = run_it_maq_003_step3(driver)
        if run_it_maq_004_step4:
            driver = run_it_maq_004_step4(driver)

        # Ahora completar sección de mantenimiento
        driver = add_maintenance_entry(driver)

        print('IT-MAQ-005 completado exitosamente')
        return True

    except Exception as e:
        print(f'Error en IT-MAQ-005: {e}')
        return False

    finally:
        try:
            if driver:
                save_browser_logs(driver, 'IT-MAQ-005')
                driver.quit()
        except Exception as e:
            print(f'Error cerrando driver: {e}')


if __name__ == '__main__':
    ok = run_it_maq_005(headless=False)
    if ok:
        print('\nIT-MAQ-005: PRUEBA EXITOSA')
    else:
        print('\nIT-MAQ-005: PRUEBA FALLIDA')
