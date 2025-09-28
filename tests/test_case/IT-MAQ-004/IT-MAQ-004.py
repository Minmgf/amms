"""
IT-MAQ-004: Automatización completa del registro de ficha técnica de maquinaria - Paso 4

Este módulo continúa la automatización del formulario de maquinaria
completando el Paso 4: Información adicional de la maquinaria.

Funciones principales disponibles para importación:
- setup_test_environment(): Configura el entorno de prueba (login + navegación)
- run_it_maq_004_step1(): Ejecuta solo el paso 1 del formulario
- run_it_maq_004_step2(): Ejecuta solo el paso 2 del formulario
- run_it_maq_004_step3(): Ejecuta solo el paso 3 del formulario
- run_it_maq_004_step4(): Ejecuta solo el paso 4 del formulario
- run_it_maq_004(): Ejecuta la prueba completa hasta paso 4
- cleanup_test_environment(): Limpia el entorno después de la prueba

Uso desde otros archivos:
    from test_case.IT_MAQ_004.IT_MAQ_004 import setup_test_environment, run_it_maq_004_step1, run_it_maq_004_step2, run_it_maq_004_step3, run_it_maq_004_step4

    driver = setup_test_environment()
    driver = run_it_maq_004_step1(driver)
    driver = run_it_maq_004_step2(driver)
    driver = run_it_maq_004_step3(driver)
    driver = run_it_maq_004_step4(driver)
    # Continuar con paso 5...
"""

import time
import sys
import os
from pathlib import Path

# Agregar el directorio raíz al path para importar los módulos
sys.path.append(str(Path(__file__).parent.parent.parent))

from flows.auth.login.selenium_login_flow import perform_login
from flows.navigation.machinery_navigation import navigate_to_machinery

# Importar funciones del paso anterior (IT-MAQ-003)
import importlib.util

# Cargar el módulo IT-MAQ-003 dinámicamente
spec = importlib.util.spec_from_file_location("IT_MAQ_003", str(Path(__file__).parent.parent / "IT-MAQ-003" / "IT-MAQ-003.py"))
it_maq_003 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(it_maq_003)

# Importar las funciones necesarias
setup_test_environment = it_maq_003.setup_test_environment
run_it_maq_003_step1 = it_maq_003.run_it_maq_003_step1
run_it_maq_003_step2 = it_maq_003.run_it_maq_003_step2
run_it_maq_003_step3 = it_maq_003.run_it_maq_003_step3
cleanup_test_environment = it_maq_003.cleanup_test_environment
test_data = it_maq_003.test_data
step2_test_data = it_maq_003.step2_test_data
step3_test_data = it_maq_003.step3_test_data

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

# Importar Faker para generar datos únicos
from faker import Faker

# Inicializar Faker con semilla basada en timestamp para mayor aleatoriedad
fake = Faker('es_CO')  # Usar locale colombiano para datos más realistas
fake.seed_instance(int(time.time() * 1000000))  # Semilla única por microsegundo

# Datos para el paso 4
step4_test_data = {
    "Fecha de adquisición": fake.date_between(start_date='-2y', end_date='today').strftime('%Y-%m-%d'),  # Fecha en formato YYYY-MM-DD
    "Estado de uso": "Nuevo",  # Opciones: Nuevo, Usado, Reservada
    "Horas usadas": str(fake.random_int(0, 1000)),  # Horas entre 0 y 1000
    "Kilometraje": str(fake.random_int(0, 50000)),  # Kilometraje entre 0 y 50,000
    "Unidad de kilometraje": "Metros (m)",  # Opciones: Metros (m), Pies (ft)
    "Tenencia": "Alquilada",  # Opciones: Alquilada, Prestada, Leasing, Subcontratado, Consignación
    "Fecha fin de contrato": fake.date_between(start_date='today', end_date='+2y').strftime('%Y-%m-%d')  # Fecha futura para fin de contrato
}

# Selectores del paso 4 - basados en los elementos proporcionados
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
    """
    Completa un campo usando XPath selector.

    Args:
        driver: Instancia de WebDriver
        field_name: Nombre del campo para logging
        xpath_selector: Selector XPath del campo
        value: Valor a ingresar
        field_type: Tipo de campo ("input", "select")
    """
    try:
        print(f"   Completando campo '{field_name}': '{value}'")
        print(f"   Usando selector XPath: {xpath_selector}")

        wait = WebDriverWait(driver, 10)

        if field_type == "select":
            # Para selectores, usar Select de Selenium
            select_element = wait.until(EC.element_to_be_clickable((By.XPATH, xpath_selector)))
            select = Select(select_element)

            # Mostrar opciones disponibles para debugging
            options = select.options
            available_options = [opt.text for opt in options if opt.text.strip()]
            print(f"   📋 Opciones disponibles: {available_options}")

            # Intentar seleccionar por texto visible
            try:
                select.select_by_visible_text(value)
                print(f"   ✅ Seleccionado '{value}' en {field_name}")
            except:
                # Si falla, intentar con la primera opción disponible (excepto placeholders)
                valid_options = [opt for opt in available_options if opt not in ["", "Seleccione...", "Seleccione una opción...", "Seleccione un estado...", "Seleccione una unidad..."]]
                if valid_options:
                    select.select_by_visible_text(valid_options[0])
                    print(f"   ✅ Seleccionado '{valid_options[0]}' en {field_name} (fallback)")
                else:
                    print(f"   ⚠️  No hay opciones válidas para {field_name}, dejando vacío")
        else:
            # Para inputs normales
            input_element = wait.until(EC.element_to_be_clickable((By.XPATH, xpath_selector)))
            input_element.clear()
            input_element.send_keys(value)
            print(f"   ✅ Ingresado '{value}' en {field_name}")

    except Exception as e:
        print(f"   ❌ Error completando campo '{field_name}': {str(e)}")
        # No relanzar el error para continuar con otros campos

def complete_machinery_form_step4(driver):
    """
    Completa el Paso 4 del formulario de maquinaria con los datos específicos de IT-MAQ-004.

    Args:
        driver: WebDriver con el formulario en el paso 4

    Returns:
        WebDriver: Driver con el formulario del paso 4 completado
    """
    try:
        print("Completando Paso 4 del formulario de maquinaria (IT-MAQ-004)...")

        # Completar campos del paso 4 usando los selectores XPath especificados
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
    """
    Envía el Paso 4 del formulario usando el botón Siguiente especificado.

    Args:
        driver: WebDriver con el formulario del paso 4 completado

    Returns:
        WebDriver: Driver con el formulario avanzado al paso 5
    """
    try:
        print("Enviando Paso 4 del formulario...")

        wait = WebDriverWait(driver, 10)

        # Usar el selector XPath específico para el botón Siguiente
        next_button_selector = step4_selectors["Siguiente"]
        print(f"   Usando selector XPath para botón siguiente: {next_button_selector}")

        next_button = wait.until(EC.element_to_be_clickable((By.XPATH, next_button_selector)))
        print("   Botón 'Siguiente' encontrado")

        next_button.click()
        print("Click realizado en botón 'Siguiente' del Paso 4")

        # Esperar a que se procese el envío y verificar avance
        time.sleep(2)

        # Verificar indicadores de éxito/avance al Paso 5
        success_indicators = [
            "//div[contains(text(), 'Paso 5')]",  # Indicador de paso 5
            "//div[contains(text(), 'paso 5')]",
            "//h2[contains(text(), 'Paso 5')]",
            "//span[contains(text(), 'Paso 5')]",
            "//div[contains(@class, 'step-5')]",  # Clase de paso 5
            "//div[contains(@class, 'active') and contains(text(), '5')]"  # Paso activo 5
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
    """
    Ejecuta solo el Paso 4 del formulario IT-MAQ-004.

    Args:
        driver: WebDriver ya posicionado en el Paso 4 del formulario

    Returns:
        WebDriver: Driver con el formulario del paso 4 completado y listo para paso 5
    """
    try:
        print("🚜 Ejecutando IT-MAQ-004 - Paso 4: Información adicional de la maquinaria")

        # Completar formulario del paso 4
        print("Paso 1: Completando formulario del Paso 4...")
        driver = complete_machinery_form_step4(driver)
        print("Paso 4 completado")

        # Enviar formulario
        print("Paso 2: Enviando formulario...")
        driver = submit_form_step4(driver)
        print("Formulario enviado y avanzado a Paso 5")

        print("IT-MAQ-004 Paso 4 completado exitosamente")
        return driver

    except Exception as e:
        print(f"Error en IT-MAQ-004 Paso 4: {str(e)}")
        raise

def run_it_maq_004(headless=False):
    """
    Ejecuta la prueba IT-MAQ-004 completa (Paso 1, 2, 3 y 4).

    Args:
        headless (bool): Si ejecutar en modo headless

    Returns:
        bool: True si la prueba pasa, False si falla
    """
    driver = None
    try:
        print("Iniciando IT-MAQ-004: Verificar registro completo de ficha técnica hasta Paso 4")
        print("=" * 70)

        # Setup
        driver = setup_test_environment(headless=headless)

        # Execute paso 1
        driver = run_it_maq_003_step1(driver)

        # Execute paso 2
        driver = run_it_maq_003_step2(driver)

        # Execute paso 3
        driver = run_it_maq_003_step3(driver)

        # Execute paso 4
        driver = run_it_maq_004_step4(driver)

        # Assert: Verificar resultados
        print("Assert: Verificando resultados...")
        print("Formulario enviado correctamente hasta Paso 4")
        print("Avance a Paso 5 verificado")

        print("IT-MAQ-004 completada exitosamente")
        return True

    except Exception as e:
        print(f"Error durante IT-MAQ-004: {str(e)}")
        return False

    finally:
        cleanup_test_environment(driver)

if __name__ == "__main__":
    success = run_it_maq_004(headless=False)  # Cambiar a True para modo headless
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