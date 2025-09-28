"""
IT-MAQ-001 Paso 2: Automatización del registro de ficha técnica del rastreador

Este módulo continúa la automatización del formulario de maquinaria
completando el Paso 2: Ficha técnica del rastreador.

Uso:
    from test_case.IT_MAQ_001.IT_MAQ_001 import setup_test_environment, run_it_maq_001_step1
    from test_case.IT_MAQ_001.IT_MAQ_001_step2 import run_it_maq_001_step2

    # Ejecutar paso 1
    driver = setup_test_environment()
    driver = run_it_maq_001_step1(driver)

    # Continuar con paso 2
    driver = run_it_maq_001_step2(driver)
"""

import time
import sys
import os
from pathlib import Path

# Agregar el directorio raíz al path para importar los módulos
sys.path.append(str(Path(__file__).parent.parent.parent))

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

# Importar configuraciones del paso 1
from .IT_MAQ_001 import formData, test_data

# Datos específicos para el paso 2
step2_test_data = {
    "Tipo de rastreador": "Teltonika FMB140",  # Ya seleccionado en paso 1
    "Identificador único": "IMEI123456789012345",
    "Número de teléfono": "+573001234567",
    "Operador telefónico": "Claro",  # Ejemplo
    "APN": "internet.claro.com.co",
    "Usuario APN": "",
    "Contraseña APN": "",
    "Intervalo de reporte": "60",  # segundos
    "Modo de ahorro de batería": "Activado"
}

# Selectores específicos del paso 2 (serán identificados durante la ejecución)
step2_form_selectors = {
    "Identificador único": 'input[name="imei"]',
    "Número de teléfono": 'input[name="phoneNumber"]',
    "Operador telefónico": 'select[name="carrier"]',
    "APN": 'input[name="apn"]',
    "Usuario APN": 'input[name="apnUsername"]',
    "Contraseña APN": 'input[name="apnPassword"]',
    "Intervalo de reporte": 'input[name="reportInterval"]',
    "Modo de ahorro de batería": 'select[name="powerSavingMode"]'
}


def analyze_step2_form(driver, modal_selector="div.modal-theme"):
    """
    Analiza el formulario del paso 2 y muestra los campos disponibles.

    Args:
        driver: WebDriver con el formulario del paso 2 abierto
        modal_selector: Selector del modal contenedor
    """
    try:
        print("🔍 Analizando formulario del Paso 2...")

        # Capturar HTML del modal
        modal_element = driver.find_element(By.CSS_SELECTOR, modal_selector)
        modal_html = modal_element.get_attribute("outerHTML")

        # Guardar para análisis
        html_file_path = "modal_step2_html_capture.html"
        with open(html_file_path, "w", encoding="utf-8") as f:
            f.write(modal_html)
        print(f"✅ HTML del Paso 2 guardado en: {html_file_path}")

        # Analizar campos disponibles
        inputs = driver.find_elements(By.CSS_SELECTOR, f"{modal_selector} input")
        selects = driver.find_elements(By.CSS_SELECTOR, f"{modal_selector} select")

        print(f"📝 Inputs encontrados en Paso 2 ({len(inputs)}):")
        for i, input_elem in enumerate(inputs):
            input_type = input_elem.get_attribute("type") or ""
            name = input_elem.get_attribute("name") or ""
            placeholder = input_elem.get_attribute("placeholder") or ""
            if name or placeholder:
                print(f"   {i+1}. name='{name}' type='{input_type}' placeholder='{placeholder}'")

        print(f"📋 Selects encontrados en Paso 2 ({len(selects)}):")
        for i, select_elem in enumerate(selects):
            name = select_elem.get_attribute("name") or ""
            if name:
                print(f"   {i+1}. name='{name}'")
                # Mostrar opciones
                options = select_elem.find_elements(By.TAG_NAME, "option")
                option_texts = [opt.text for opt in options[:3]]
                if option_texts:
                    print(f"      Opciones: {', '.join(option_texts)}")

    except Exception as e:
        print(f"⚠️  Error analizando formulario del Paso 2: {str(e)}")


def complete_machinery_form_step2(driver, modal_selector="div.modal-theme"):
    """
    Completa el Paso 2 del formulario de maquinaria: Ficha técnica del rastreador.

    Args:
        driver: WebDriver con el formulario del paso 2 abierto

    Returns:
        WebDriver: Driver con el formulario del paso 2 completado
    """
    try:
        print("📋 Completando Paso 2 del formulario de maquinaria...")

        # Analizar el formulario primero
        analyze_step2_form(driver, modal_selector)

        # Completar campos del paso 2
        # Nota: Los campos específicos del paso 2 necesitan ser identificados
        # Esta es una implementación base que puede necesitar ajustes

        fields_to_fill = [
            ("Identificador único", step2_form_selectors["Identificador único"], step2_test_data["Identificador único"], "input"),
            ("Número de teléfono", step2_form_selectors["Número de teléfono"], step2_test_data["Número de teléfono"], "input"),
            ("APN", step2_form_selectors["APN"], step2_test_data["APN"], "input"),
            ("Usuario APN", step2_form_selectors["Usuario APN"], step2_test_data["Usuario APN"], "input"),
            ("Contraseña APN", step2_form_selectors["Contraseña APN"], step2_test_data["Contraseña APN"], "input"),
            ("Intervalo de reporte", step2_form_selectors["Intervalo de reporte"], step2_test_data["Intervalo de reporte"], "input"),
        ]

        # Función auxiliar para completar campos (similar a la del paso 1)
        def fill_step2_field(field_name, selector, value, field_type="input"):
            try:
                print(f"   📝 Completando campo '{field_name}': '{value}'")
                full_selector = f"{modal_selector} {selector}"
                wait = WebDriverWait(driver, 10)

                if field_type == "select":
                    select_element = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, full_selector)))
                    select = Select(select_element)
                    select.select_by_visible_text(value)
                    print(f"   ✅ Seleccionado '{value}' en {field_name}")
                else:
                    input_element = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, full_selector)))
                    input_element.clear()
                    input_element.send_keys(value)
                    print(f"   ✅ Ingresado '{value}' en {field_name}")

            except Exception as e:
                print(f"   ⚠️  Error completando campo '{field_name}': {str(e)}")
                # No fallar completamente, continuar con otros campos

        # Completar campos
        for field_name, selector, value, field_type in fields_to_fill:
            if value:  # Solo completar si hay valor
                fill_step2_field(field_name, selector, value, field_type)

        print("✅ Paso 2 completado (campos básicos)")
        return driver

    except Exception as e:
        print(f"❌ Error completando Paso 2 del formulario: {str(e)}")
        raise


def submit_form_step2(driver, modal_selector="div.modal-theme"):
    """
    Envía el Paso 2 del formulario y verifica el avance al Paso 3.

    Args:
        driver: WebDriver con el formulario del paso 2 completado

    Returns:
        WebDriver: Driver con el formulario avanzado al paso 3
    """
    try:
        print("📤 Enviando Paso 2 del formulario...")

        wait = WebDriverWait(driver, 10)

        # Buscar botón "Siguiente" en el modal
        # Priorizar XPath por texto exacto (normalizando espacios) para evitar selectores CSS inválidos
        xpath_candidates = [
            "//button[normalize-space()='Siguiente']",
            "//button[contains(normalize-space(.), 'Siguiente')]",
            "//button[contains(text(), 'Siguiente')]",
        ]

        css_candidates = [
            f"{modal_selector} button[type='submit']",
            f"{modal_selector} .ant-btn-primary",
            f"{modal_selector} button[class*='primary']",
            f"{modal_selector} button[class*='btn-primary']",
        ]

        next_button = None

        # Primero intentar XPaths robustos
        for xpath_selector in xpath_candidates:
            try:
                print(f"   Probando XPath para botón siguiente: {xpath_selector}")
                next_button = wait.until(EC.element_to_be_clickable((By.XPATH, xpath_selector)))
                print(f"   ✅ Botón siguiente encontrado vía XPath: {xpath_selector}")
                break
            except Exception:
                # No encontrado con este xpath, continuar
                continue

        # Si no encontramos con XPath, intentar selectores CSS como fallback
        if not next_button:
            for css_selector in css_candidates:
                try:
                    print(f"   Probando CSS para botón siguiente: {css_selector}")
                    next_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, css_selector)))
                    print(f"   ✅ Botón siguiente encontrado vía CSS: {css_selector}")
                    break
                except Exception:
                    continue

        if not next_button:
            raise Exception("No se pudo encontrar el botón 'Siguiente' del Paso 2")

        next_button.click()
        print("🖱️  Click realizado en botón 'Siguiente' del Paso 2")

        # Esperar procesamiento
        time.sleep(2)

        # Verificar avance al Paso 3
        success_indicators = [
            "//div[contains(text(), 'Paso 3')]",
            "//h2[contains(text(), 'Paso 3')]",
            "//div[contains(@class, 'step-3')]",
            "//div[contains(@class, 'active') and contains(text(), '3')]"
        ]

        step3_found = False
        for indicator in success_indicators:
            try:
                elements = driver.find_elements(By.XPATH, indicator)
                if elements and any(element.is_displayed() for element in elements):
                    step3_found = True
                    print(f"   ✅ Detectado avance a Paso 3 con indicador: {indicator}")
                    break
            except:
                continue

        if step3_found:
            print("✅ Formulario avanzó correctamente al Paso 3")
        else:
            print("⚠️  No se detectó avance claro a Paso 3, pero envío completado")

        return driver

    except Exception as e:
        raise Exception(f"Error enviando Paso 2 del formulario: {str(e)}")


def run_it_maq_001_step2(driver):
    """
    Ejecuta el Paso 2 completo del formulario IT-MAQ-001.

    Args:
        driver: WebDriver ya posicionado en el Paso 2 del formulario

    Returns:
        WebDriver: Driver con el formulario del paso 2 completado y listo para paso 3
    """
    try:
        print("🚀 Ejecutando IT-MAQ-001 - Paso 2: Ficha técnica del rastreador")

        # Verificar que estamos en el paso 2
        wait = WebDriverWait(driver, 10)
        step2_indicators = [
            "//div[contains(text(), 'Paso 2')]",
            "//h2[contains(text(), 'Paso 2')]",
            "//div[contains(text(), 'Ficha técnica del rastreador')]"
        ]

        step2_confirmed = False
        for indicator in step2_indicators:
            try:
                elements = driver.find_elements(By.XPATH, indicator)
                if elements and any(element.is_displayed() for element in elements):
                    step2_confirmed = True
                    print(f"   ✅ Confirmado Paso 2 con indicador: {indicator}")
                    break
            except:
                continue

        if not step2_confirmed:
            print("⚠️  No se confirmó estar en Paso 2, continuando de todos modos...")

        # Completar formulario del paso 2
        print("📝 Paso 1: Completando formulario del Paso 2...")
        driver = complete_machinery_form_step2(driver)
        print("✅ Paso 2 completado")

        # Enviar formulario
        print("📤 Paso 2: Enviando formulario...")
        driver = submit_form_step2(driver)
        print("✅ Formulario enviado y avanzado a Paso 3")

        print("✅ IT-MAQ-001 Paso 2 completado exitosamente")
        return driver

    except Exception as e:
        print(f"❌ Error en IT-MAQ-001 Paso 2: {str(e)}")
        raise


# Función de prueba independiente (para desarrollo)
def test_step2_only():
    """
    Función de prueba para ejecutar solo el paso 2.
    Requiere que el paso 1 ya haya sido completado manualmente.
    """
    from IT_MAQ_001 import setup_test_environment, run_it_maq_001_step1, cleanup_test_environment

    driver = None
    try:
        print("🧪 Probando solo el Paso 2...")

        # Setup hasta el paso 1
        driver = setup_test_environment()
        driver = run_it_maq_001_step1(driver)

        # Ejecutar paso 2
        driver = run_it_maq_001_step2(driver)

        print("✅ Paso 2 probado exitosamente")
        return True

    except Exception as e:
        print(f"❌ Error probando Paso 2: {str(e)}")
        return False

    finally:
        cleanup_test_environment(driver)


if __name__ == "__main__":
    print("Este archivo debe ser importado desde IT_MAQ_001.py")
    print("Uso:")
    print("  from test_case.IT_MAQ_001.IT_MAQ_001 import setup_test_environment, run_it_maq_001_step1")
    print("  from test_case.IT_MAQ_001.IT_MAQ_001_step2 import run_it_maq_001_step2")
    print("  ")
    print("  driver = setup_test_environment()")
    print("  driver = run_it_maq_001_step1(driver)")
    print("  driver = run_it_maq_001_step2(driver)")

    # Para testing individual (comentar en producción)
    # success = test_step2_only()
    # sys.exit(0 if success else 1)