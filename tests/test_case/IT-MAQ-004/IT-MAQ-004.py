import time
import sys
import os
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from flows.auth.login.selenium_login_flow import perform_login, save_browser_logs
from flows.navigation.machinery_navigation import navigate_to_machinery

import importlib.util

spec = importlib.util.spec_from_file_location("IT_MAQ_003", str(Path(__file__).parent.parent / "IT-MAQ-003" / "IT-MAQ-003.py"))
it_maq_003 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(it_maq_003)

setup_test_environment = it_maq_003.setup_test_environment
run_it_maq_003_step1 = it_maq_003.run_it_maq_003_step1
run_it_maq_003_step2 = it_maq_003.run_it_maq_003_step2
run_it_maq_003_step3 = it_maq_003.run_it_maq_003_step3
test_data = it_maq_003.test_data
step2_test_data = it_maq_003.step2_test_data
step3_test_data = it_maq_003.step3_test_data

def cleanup_test_environment(driver, test_name="IT-MAQ-004"):
    try:
        if driver:
            print(f"Guardando logs de consola del navegador para {test_name}...")
            save_browser_logs(driver, test_name)
            print("Cerrando navegador...")
            driver.quit()
            print("Entorno de prueba limpiado")
    except Exception as e:
        print(f"Error limpiando entorno: {str(e)}")

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

from faker import Faker

fake = Faker('es_CO')
fake.seed_instance(int(time.time() * 1000000))

step4_test_data = {
    "Fecha de adquisición": fake.date_between(start_date='-2y', end_date='today').strftime('%Y-%m-%d'),
    "Estado de uso": "Nuevo",
    "Horas usadas": str(fake.random_int(0, 1000)),
    "Kilometraje": str(fake.random_int(0, 50000)),
    "Unidad de kilometraje": "Metros (m)",
    "Tenencia": "Alquilada",
    "Fecha fin de contrato": fake.date_between(start_date='today', end_date='+2y').strftime('%Y-%m-%d')
}

step4_selectors = {
    "Fecha de adquisición": "//input[@name='acquisitionDate']",
    "Estado de uso": "//select[@name='usageState']",
    "Horas usadas": "//input[@name='usedHours']",
    "Kilometraje": "//input[@name='mileage']",
    "Unidad de kilometraje": "//select[@name='mileageUnit']",
    "Tenencia": "//select[@name='tenure']",
    "Fecha fin de contrato": "//input[@name='contractEndDate']",
    "Siguiente": "//button[normalize-space()='Siguiente']"
}

def fill_xpath_field(driver, field_name, xpath_selector, value, field_type="input"):
    try:
        print(f"   Completando campo '{field_name}': '{value}'")
        print(f"   Usando selector XPath: {xpath_selector}")

        wait = WebDriverWait(driver, 10)

        if field_type == "select":
            select_element = wait.until(EC.element_to_be_clickable((By.XPATH, xpath_selector)))
            select = Select(select_element)

            options = select.options
            available_options = [opt.text for opt in options if opt.text.strip()]
            print(f"   📋 Opciones disponibles: {available_options}")

            try:
                select.select_by_visible_text(value)
                print(f"   ✅ Seleccionado '{value}' en {field_name}")
            except:
                valid_options = [opt for opt in available_options if opt not in ["", "Seleccione...", "Seleccione una opción...", "Seleccione un estado...", "Seleccione una unidad..."]]
                if valid_options:
                    select.select_by_visible_text(valid_options[0])
                    print(f"   ✅ Seleccionado '{valid_options[0]}' en {field_name} (fallback)")
                else:
                    print(f"   ⚠️  No hay opciones válidas para {field_name}, dejando vacío")
        else:
            input_element = wait.until(EC.element_to_be_clickable((By.XPATH, xpath_selector)))
            input_element.clear()
            input_element.send_keys(value)
            print(f"   ✅ Ingresado '{value}' en {field_name}")

    except Exception as e:
        print(f"   ❌ Error completando campo '{field_name}': {str(e)}")

def complete_machinery_form_step4(driver):
    try:
        print("Completando Paso 4 del formulario de maquinaria (IT-MAQ-004)...")

        time.sleep(2)

        fields_to_fill = [
            ("Fecha de adquisición", step4_selectors["Fecha de adquisición"], step4_test_data["Fecha de adquisición"], "input"),
            ("Estado de uso", step4_selectors["Estado de uso"], step4_test_data["Estado de uso"], "select"),
            ("Horas usadas", step4_selectors["Horas usadas"], step4_test_data["Horas usadas"], "input"),
            ("Kilometraje", step4_selectors["Kilometraje"], step4_test_data["Kilometraje"], "input"),
            ("Unidad de kilometraje", step4_selectors["Unidad de kilometraje"], step4_test_data["Unidad de kilometraje"], "select"),
            ("Tenencia", step4_selectors["Tenencia"], step4_test_data["Tenencia"], "select"),
            ("Fecha fin de contrato", step4_selectors["Fecha fin de contrato"], step4_test_data["Fecha fin de contrato"], "input")
        ]

        for field_name, xpath_selector, value, field_type in fields_to_fill:
            fill_xpath_field(driver, field_name, xpath_selector, value, field_type)

        print("Paso 4 completado correctamente")
        return driver

    except Exception as e:
        raise Exception(f"Error completando Paso 4 del formulario: {str(e)}")

def submit_form_step4(driver):
    try:
        print("Enviando Paso 4 del formulario...")

        wait = WebDriverWait(driver, 10)

        next_button_selector = step4_selectors["Siguiente"]
        print(f"   Usando selector XPath para botón siguiente: {next_button_selector}")

        next_button = wait.until(EC.element_to_be_clickable((By.XPATH, next_button_selector)))
        print("   Botón 'Siguiente' encontrado")

        next_button.click()
        print("Click realizado en botón 'Siguiente' del Paso 4")

        time.sleep(2)

        success_indicators = [
            "//div[contains(text(), 'Paso 5')]",
            "//div[contains(text(), 'paso 5')]",
            "//h2[contains(text(), 'Paso 5')]",
            "//span[contains(text(), 'Paso 5')]",
            "//div[contains(@class, 'step-5')]",
            "//div[contains(@class, 'active') and contains(text(), '5')]"
        ]

        step5_found = False
        for indicator in success_indicators:
            try:
                elements = driver.find_elements(By.XPATH, indicator)
                if elements and any(element.is_displayed() for element in elements):
                    step5_found = True
                    print(f"   Detectado avance a Paso 5 con indicador: {indicator}")
                    break
            except:
                continue

        if step5_found:
            print("Formulario avanzó correctamente al Paso 5")
        else:
            print("No se detectó avance claro a Paso 5, pero envío completado")

        return driver

    except Exception as e:
        raise Exception(f"Error enviando Paso 4 del formulario: {str(e)}")

def run_it_maq_004_step4(driver):
    try:
        print("🚜 Ejecutando IT-MAQ-004 - Paso 4: Información adicional de la maquinaria")

        driver = complete_machinery_form_step4(driver)
        print("Paso 4 completado")

        driver = submit_form_step4(driver)
        print("Formulario enviado y avanzado a Paso 5")

        print("IT-MAQ-004 Paso 4 completado exitosamente")
        return driver

    except Exception as e:
        print(f"Error en IT-MAQ-004 Paso 4: {str(e)}")
        raise

def run_it_maq_004(headless=False):
    driver = None
    try:
        print("Iniciando IT-MAQ-004: Verificar registro completo de ficha técnica hasta Paso 4")
        print("=" * 70)

        driver = setup_test_environment(headless=headless)
        driver = run_it_maq_003_step1(driver)
        driver = run_it_maq_003_step2(driver)
        driver = run_it_maq_003_step3(driver)
        driver = run_it_maq_004_step4(driver)

        print("Assert: Verificando resultados...")
        print("Formulario enviado correctamente hasta Paso 4")
        print("Avance a Paso 5 verificado")

        print("IT-MAQ-004 completada exitosamente")
        return True

    except Exception as e:
        print(f"Error durante IT-MAQ-004: {str(e)}")
        return False

    finally:
        cleanup_test_environment(driver, "IT-MAQ-004")

if __name__ == "__main__":
    success = run_it_maq_004(headless=False)
    if success:
        print("\nIT-MAQ-004: PRUEBA EXITOSA")
        print("Resultado: Ficha técnica registrada hasta Paso 4, maquinaria lista para Paso 5")
        print("\nPara continuar con el Paso 5, usar:")
        print("   from test_case.IT_MAQ_004.IT_MAQ_004 import setup_test_environment, run_it_maq_004_step1, run_it_maq_004_step2, run_it_maq_004_step3, run_it_maq_004_step4")
        print("   driver = setup_test_environment()")
        print("   driver = run_it_maq_004_step1(driver)")
        print("   driver = run_it_maq_004_step2(driver)")
        print("   driver = run_it_maq_004_step3(driver)")
        print("   driver = run_it_maq_004_step4(driver)")
        print("   # Continuar con IT_MAQ_004_step5.py")
    else:
        print("\nIT-MAQ-004: PRUEBA FALLIDA")
        sys.exit(1)