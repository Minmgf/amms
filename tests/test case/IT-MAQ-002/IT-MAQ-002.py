"""
IT-MAQ-002: Automatización de validación de duplicados en número de serie

Este módulo automatiza el caso de prueba IT-MAQ-002:
Verificar que el sistema impida registrar maquinarias con números de serie duplicados.

Requiere que IT-MAQ-001 se haya ejecutado previamente para tener una maquinaria
con número de serie "TB001-2023" ya registrada.

Funciones principales disponibles para importación:
- setup_duplicate_validation(): Configura el entorno y asegura maquinaria base
- run_it_maq_002_validation(): Ejecuta la validación de duplicados
- run_it_maq_002(): Ejecuta el caso completo
- cleanup_test_environment(): Limpia el entorno después de la prueba

Uso desde otros archivos:
    from test_case.IT_MAQ_002.IT_MAQ_002 import run_it_maq_002

    success = run_it_maq_002(headless=False)
"""

import time
import sys
import os
from pathlib import Path

# Agregar el directorio raíz al path para importar los módulos
sys.path.append(str(Path(__file__).parent.parent.parent))
sys.path.append(str(Path(__file__).parent.parent))  # Agregar directorio test case

# Importar funciones del caso precedente IT-MAQ-001
import importlib.util

# Intentar importar IT_MAQ_001 dinámicamente
it_maq_001_path = Path(__file__).parent.parent / "IT-MAQ-001" / "IT-MAQ-001.py"
spec = importlib.util.spec_from_file_location("IT_MAQ_001", it_maq_001_path)
it_maq_001_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(it_maq_001_module)

# Importar las funciones necesarias
setup_test_environment = it_maq_001_module.setup_test_environment
run_it_maq_001_step1 = it_maq_001_module.run_it_maq_001_step1
cleanup_test_environment = it_maq_001_module.cleanup_test_environment
formData = it_maq_001_module.formData
test_data = it_maq_001_module.test_data

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

# Datos de prueba para IT-MAQ-002 (número serie duplicado)
duplicate_test_data = {
    "Nombre": "Tractor Banano 002",
    "Año fabricación": "2023",
    "Número de serie": "TB001-2023",  # DUPLICADO - mismo que IT-MAQ-001
    "Tipo maquinaria": "Tractor",
    "Marca": "Deutz",
    "Modelo": "Seleccione una marca primero",  # Se habilita después de seleccionar marca
    "Subpartida arancelaria": "8429.11.00",
    "Categoría de maquinaria": "Maquinaria amarilla",
    "País": "Colombia",
    "Región": "Antioquia",
    "Ciudad": "Medellín",
    "Telemetría": "Teltonika FMB140"
}

# Selectores de botones
btn_abrir_formulario = 'button:contains("Añadir maquinaria")'
btn_next = 'button[type="submit"]:contains("Siguiente")'


def capture_initial_html(driver, filename="modal_html_capture.html"):
    """
    Captura el HTML inicial del modal para análisis de selectores.

    Args:
        driver: WebDriver con el modal abierto
        filename: Nombre del archivo donde guardar el HTML
    """
    try:
        print("📸 Capturando HTML inicial del modal...")

        # Esperar a que el modal esté presente
        modal_selector = "div.modal-theme"
        wait = WebDriverWait(driver, 10)
        modal_element = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, modal_selector)))

        # Capturar HTML del modal
        modal_html = modal_element.get_attribute("outerHTML")

        # Guardar el HTML en un archivo para análisis
        html_file_path = filename
        with open(html_file_path, "w", encoding="utf-8") as f:
            f.write(modal_html)
        print(f"✅ HTML inicial guardado en: {html_file_path}")

        # Mostrar información básica de campos disponibles
        print("🔍 Análisis rápido de campos en el modal:")

        # Inputs
        inputs = driver.find_elements(By.CSS_SELECTOR, f"{modal_selector} input")
        print(f"   📝 Inputs encontrados ({len(inputs)}):")
        for i, input_elem in enumerate(inputs[:10]):  # Primeros 10
            input_type = input_elem.get_attribute("type") or ""
            name = input_elem.get_attribute("name") or ""
            placeholder = input_elem.get_attribute("placeholder") or ""
            if name or placeholder:
                print(f"      {i+1}. name='{name}' type='{input_type}' placeholder='{placeholder}'")

        # Selects
        selects = driver.find_elements(By.CSS_SELECTOR, f"{modal_selector} select")
        print(f"   📋 Selects encontrados ({len(selects)}):")
        for i, select_elem in enumerate(selects[:8]):  # Primeros 8
            name = select_elem.get_attribute("name") or ""
            if name:
                print(f"      {i+1}. name='{name}'")

    except Exception as e:
        print(f"⚠️  Error capturando HTML inicial: {str(e)}")


def close_existing_modal(driver):
    """
    Cierra cualquier modal existente antes de abrir uno nuevo.
    
    Args:
        driver: WebDriver con posible modal abierto
        
    Returns:
        WebDriver: Driver con modal cerrado
    """
    try:
        print("🔄 Verificando y cerrando modales existentes...")
        
        # Buscar botones de cerrar modal
        close_selectors = [
            "button[class*='close']",
            "button[aria-label*='close']",
            "button[aria-label*='Close']",
            ".modal-close",
            ".close-button",
            "button[class*='ant-modal-close']",
            "[class*='modal-overlay'] button:first-child"  # Primer botón en overlay
        ]
        
        modal_closed = False
        for selector in close_selectors:
            try:
                close_buttons = driver.find_elements(By.CSS_SELECTOR, selector)
                for button in close_buttons:
                    if button.is_displayed():
                        button.click()
                        print(f"   ✅ Modal cerrado con selector: {selector}")
                        time.sleep(1)
                        modal_closed = True
                        break
                if modal_closed:
                    break
            except:
                continue
        
        # Verificar si aún hay modal-overlay
        try:
            overlay = driver.find_element(By.CSS_SELECTOR, "[class*='modal-overlay']")
            if overlay.is_displayed():
                print("   ⚠️  Modal-overlay aún presente, intentando cerrar con ESC...")
                from selenium.webdriver.common.keys import Keys
                driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.ESCAPE)
                time.sleep(1)
        except:
            pass
        
        if not modal_closed:
            print("   ℹ️  No se encontraron modales para cerrar")
        
        return driver
        
    except Exception as e:
        print(f"   ⚠️  Error cerrando modal existente: {str(e)}")
        return driver


def open_machinery_form(driver):
    """
    Abre el formulario de añadir maquinaria y captura HTML inicial.
    Primero cierra cualquier modal existente.
    
    Args:
        driver: WebDriver posicionado en el módulo maquinaria
        
    Returns:
        WebDriver: Driver con el formulario abierto
    """
    try:
        print("📝 Abriendo formulario de añadir maquinaria...")
        
        # Primero cerrar cualquier modal existente
        driver = close_existing_modal(driver)
        
        wait = WebDriverWait(driver, 10)

        # Buscar y hacer click en el botón "Añadir maquinaria" o "Agregar maquinaria"
        add_buttons = [
            'button:contains("Añadir maquinaria")',
            'button:contains("Agregar maquinaria")',
            'button:contains("Nueva maquinaria")',
            'button:contains("Add machinery")',
            'button[class*="add"]',
            'button[class*="primary"]',
            'a:contains("Añadir maquinaria")',
            'a:contains("Agregar maquinaria")'
        ]

        add_button = None
        for selector in add_buttons:
            try:
                print(f"   Probando selector para botón añadir: {selector}")
                if ":contains" in selector:
                    text = selector.split("'")[1]
                    xpath_selector = f"//button[contains(text(), '{text}')]"
                    add_button = wait.until(EC.element_to_be_clickable((By.XPATH, xpath_selector)))
                else:
                    add_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))

                print(f"   ✅ Botón añadir encontrado con selector: {selector}")
                break
            except:
                continue

        if not add_button:
            raise Exception("No se pudo encontrar el botón 'Añadir maquinaria' o 'Agregar maquinaria'")

        # Hacer click con JavaScript para evitar problemas de overlay
        driver.execute_script("arguments[0].click();", add_button)
        print("🖱️  Click realizado en botón 'Agregar maquinaria' (usando JavaScript)")

        # Esperar a que se abra el modal
        time.sleep(2)

        # Verificar que el modal se abrió
        modal_selector = "div.modal-theme"
        try:
            modal_element = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, modal_selector)))
            print("✅ Modal de formulario abierto correctamente")

            # Capturar HTML inicial para análisis
            capture_initial_html(driver)

        except:
            print("❌ No se pudo detectar el modal")
            raise Exception("Modal de formulario no encontrado")

        return driver

    except Exception as e:
        raise Exception(f"Error abriendo formulario de maquinaria: {str(e)}")


def fill_form_field(driver, field_name, selector, value, field_type="input", modal_selector="div.modal-theme"):
    """
    Completa un campo específico del formulario.

    Args:
        driver: Instancia de WebDriver
        field_name: Nombre del campo para logging
        selector: Selector CSS del campo
        value: Valor a ingresar
        field_type: Tipo de campo ("input" o "select")
        modal_selector: Selector del modal contenedor
    """
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
        print(f"   ❌ Error completando campo '{field_name}': {str(e)}")
        raise


def attempt_duplicate_registration(driver):
    """
    Intenta registrar una maquinaria con número de serie duplicado.

    Args:
        driver: WebDriver con el formulario abierto

    Returns:
        dict: Resultado de la validación con error encontrado
    """
    try:
        print("🚫 Intentando registrar maquinaria con número serie duplicado...")

        # Completar campos obligatorios con número serie duplicado
        fields_to_fill = [
            ("Nombre", formData["Nombre"], duplicate_test_data["Nombre"], "input"),
            ("Año fabricación", formData["Año fabricación"], duplicate_test_data["Año fabricación"], "select"),
            ("Número de serie", formData["Número de serie"], duplicate_test_data["Número de serie"], "input"),
            ("Tipo maquinaria", formData["Tipo maquinaria"], duplicate_test_data["Tipo maquinaria"], "select"),
            ("Marca", formData["Marca"], duplicate_test_data["Marca"], "select"),
            ("Subpartida arancelaria", formData["Subpartida arancelaria"], duplicate_test_data["Subpartida arancelaria"], "input"),
            ("Categoría de maquinaria", formData["Categoría de maquinaria"], duplicate_test_data["Categoría maquinaria"], "select"),
        ]

        for field_name, selector, value, field_type in fields_to_fill:
            fill_form_field(driver, field_name, selector, value, field_type, modal_selector="div.modal-theme")

        # Esperar a que se habiliten los campos dependientes
        time.sleep(2)

        # Completar País y esperar a que se habiliten Región y Ciudad
        fill_form_field(driver, "País", formData["País"], duplicate_test_data["País"], "select", modal_selector="div.modal-theme")

        # Esperar a que se habiliten Región y Ciudad
        time.sleep(2)

        # Completar Región y Ciudad
        fill_form_field(driver, "Región", formData["Región"], duplicate_test_data["Región"], "select", modal_selector="div.modal-theme")
        fill_form_field(driver, "Ciudad", formData["Ciudad"], duplicate_test_data["Ciudad"], "select", modal_selector="div.modal-theme")

        # Completar Telemetría
        fill_form_field(driver, "Telemetría", formData["Telemetría"], duplicate_test_data["Telemetría"], "select", modal_selector="div.modal-theme")

        print("✅ Formulario completado con datos duplicados")
        return {"form_completed": True, "error": None}

    except Exception as e:
        return {"form_completed": False, "error": str(e)}


def submit_and_check_validation(driver):
    """
    Intenta enviar el formulario y verifica si se muestra error de validación.

    Args:
        driver: WebDriver con el formulario completado

    Returns:
        dict: Resultado de la validación de duplicados
    """
    try:
        print("📤 Intentando enviar formulario con datos duplicados...")

        wait = WebDriverWait(driver, 10)

        # Buscar y hacer click en el botón "Siguiente"
        modal_selector = "div.modal-theme"
        next_selectors = [
            f"{modal_selector} button[type='submit']:contains('Siguiente')",
            f"{modal_selector} button:contains('Siguiente')",
            f"{modal_selector} button:contains('Next')",
            f"{modal_selector} button[type='submit']",
            f"{modal_selector} .ant-btn-primary",
            f"{modal_selector} button[class*='primary']",
            f"{modal_selector} button[class*='btn-primary']"
        ]

        next_button = None
        for selector in next_selectors:
            try:
                print(f"   Probando selector para botón siguiente: {selector}")
                if ":contains" in selector:
                    text = selector.split("'")[1]
                    xpath_selector = f"//button[contains(text(), '{text}')]"
                    next_button = wait.until(EC.element_to_be_clickable((By.XPATH, xpath_selector)))
                else:
                    next_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))

                print(f"   ✅ Botón siguiente encontrado con selector: {selector}")
                break
            except:
                continue

        if not next_button:
            print("⚠️  No se encontró botón siguiente, verificando errores existentes...")
            return check_for_validation_errors(driver)

        # Intentar hacer click en el botón
        try:
            next_button.click()
            print("🖱️  Click realizado en botón 'Siguiente'")
        except Exception as e:
            print(f"⚠️  Error al hacer click en botón siguiente: {str(e)}")
            return check_for_validation_errors(driver)

        # Esperar respuesta del servidor
        time.sleep(3)

        # Verificar si se mostró error de validación
        return check_for_validation_errors(driver)

    except Exception as e:
        print(f"❌ Error enviando formulario: {str(e)}")
        return {"validation_error": False, "error_message": str(e), "advanced_to_step2": False}


def check_for_validation_errors(driver):
    """
    Verifica si se muestran errores de validación en el formulario.

    Args:
        driver: WebDriver después del intento de envío

    Returns:
        dict: Resultado del análisis de errores
    """
    try:
        print("🔍 Verificando errores de validación...")

        modal_selector = "div.modal-theme"

        # Buscar mensajes de error comunes
        error_selectors = [
            ".error-message",
            ".ant-form-item-explain-error",
            ".validation-error",
            "[class*='error']",
            ".text-danger",
            ".alert-danger",
            ".notification-error",
            "div[role='alert']",
            ".ant-message-error",
            ".toast-error"
        ]

        error_messages = []
        for selector in error_selectors:
            try:
                error_elements = driver.find_elements(By.CSS_SELECTOR, f"{modal_selector} {selector}")
                for elem in error_elements:
                    if elem.is_displayed() and elem.text.strip():
                        error_messages.append(elem.text.strip())
            except:
                continue

        # Buscar mensajes de error por texto específico
        duplicate_error_texts = [
            "duplicado",
            "ya existe",
            "already exists",
            "número de serie",
            "serial number",
            "repetido",
            "duplicate"
        ]

        duplicate_found = False
        for text in duplicate_error_texts:
            try:
                xpath = f"//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{text.lower()}')]"
                elements = driver.find_elements(By.XPATH, xpath)
                for elem in elements:
                    if elem.is_displayed():
                        error_messages.append(f"DUPLICATE_FOUND: {elem.text.strip()}")
                        duplicate_found = True
            except:
                continue

        # Verificar si avanzó al paso 2
        step2_indicators = [
            "//div[contains(text(), 'Paso 2')]",
            "//h2[contains(text(), 'Paso 2')]",
            "//div[contains(@class, 'step-2')]",
            "//div[contains(@class, 'active') and contains(text(), '2')]"
        ]

        advanced_to_step2 = False
        for indicator in step2_indicators:
            try:
                elements = driver.find_elements(By.XPATH, indicator)
                if elements and any(element.is_displayed() for element in elements):
                    advanced_to_step2 = True
                    break
            except:
                continue

        result = {
            "validation_error": len(error_messages) > 0,
            "duplicate_error": duplicate_found,
            "error_messages": error_messages,
            "advanced_to_step2": advanced_to_step2
        }

        print(f"📊 Resultado de validación:")
        print(f"   - Errores encontrados: {len(error_messages)}")
        print(f"   - Error de duplicado: {duplicate_found}")
        print(f"   - Avanzó a paso 2: {advanced_to_step2}")

        if error_messages:
            print("   📝 Mensajes de error:")
            for msg in error_messages[:5]:  # Primeros 5 mensajes
                print(f"      • {msg}")

        return result

    except Exception as e:
        print(f"❌ Error verificando validación: {str(e)}")
        return {"validation_error": False, "error": str(e)}


def setup_duplicate_validation():
    """
    Configura el entorno completo para validación de duplicados.
    Asegura que existe una maquinaria base antes de proceder.

    Returns:
        WebDriver: Driver configurado y listo para validación
    """
    try:
        print("🚀 Configurando validación de duplicados IT-MAQ-002...")

        # Paso 1: Setup básico (login + navegación)
        print("📋 Paso 1: Configurando entorno base...")
        driver = setup_test_environment(headless=False)
        print("✅ Entorno base configurado")

        # Paso 2: Asegurar maquinaria base existe (ejecutar IT-MAQ-001)
        print("📋 Paso 2: Asegurando maquinaria base existe...")
        try:
            driver = run_it_maq_001_step1(driver)
            print("✅ Maquinaria base confirmada (IT-MAQ-001 ejecutado)")
        except Exception as e:
            print(f"⚠️  Error ejecutando IT-MAQ-001: {str(e)}")
            print("   Continuando de todos modos (maquinaria podría ya existir)...")

        print("✅ Configuración de validación de duplicados completada")
        return driver

    except Exception as e:
        print(f"❌ Error configurando validación de duplicados: {str(e)}")
        raise


def run_it_maq_002_validation(driver):
    """
    Ejecuta la validación específica de duplicados en número de serie.

    Args:
        driver: WebDriver ya configurado con maquinaria base existente

    Returns:
        dict: Resultado completo de la validación
    """
    try:
        print("🔍 Ejecutando validación de duplicados IT-MAQ-002...")

        # Paso 1: Abrir formulario de nueva maquinaria
        print("📝 Paso 1: Abriendo formulario para nueva maquinaria...")
        driver = open_machinery_form(driver)
        print("✅ Formulario abierto")

        # Paso 2: Intentar registro con número serie duplicado
        print("🚫 Paso 2: Intentando registro con serie duplicada...")
        form_result = attempt_duplicate_registration(driver)

        if not form_result["form_completed"]:
            return {
                "success": False,
                "error": f"No se pudo completar el formulario: {form_result['error']}",
                "validation_performed": False
            }

        print("✅ Formulario completado con datos duplicados")

        # Paso 3: Intentar enviar y verificar validación
        print("📤 Paso 3: Enviando formulario y verificando validación...")
        validation_result = submit_and_check_validation(driver)
        print("✅ Validación verificada")

        # Analizar resultado
        success = (
            validation_result.get("validation_error", False) and
            validation_result.get("duplicate_error", False) and
            not validation_result.get("advanced_to_step2", True)
        )

        result = {
            "success": success,
            "validation_error_shown": validation_result.get("validation_error", False),
            "duplicate_error_detected": validation_result.get("duplicate_error", False),
            "prevented_advance": not validation_result.get("advanced_to_step2", True),
            "error_messages": validation_result.get("error_messages", []),
            "validation_performed": True
        }

        print("📊 Resultado final de IT-MAQ-002:")
        print(f"   - Validación exitosa: {success}")
        print(f"   - Error de validación mostrado: {result['validation_error_shown']}")
        print(f"   - Error de duplicado detectado: {result['duplicate_error_detected']}")
        print(f"   - Avance prevenido: {result['prevented_advance']}")

        return result

    except Exception as e:
        print(f"❌ Error en validación de duplicados: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "validation_performed": False
        }


def run_it_maq_002(headless=False):
    """
    Ejecuta el caso de prueba IT-MAQ-002 completo.

    Args:
        headless (bool): Si ejecutar en modo headless

    Returns:
        dict: Resultado completo del caso de prueba
    """
    driver = None
    try:
        print("🚀 Iniciando IT-MAQ-002: Verificar validación de duplicados en número de serie")
        print("=" * 80)

        # Setup
        driver = setup_duplicate_validation()

        # Execute validation
        result = run_it_maq_002_validation(driver)

        # Assert: Verificar resultados según especificación
        print("🔍 Assert: Verificando resultados según especificación...")

        if result["validation_performed"]:
            if result["success"]:
                print("✅ IT-MAQ-002: VALIDACIÓN EXITOSA")
                print("   ✓ Error de validación mostrado")
                print("   ✓ Error específico de duplicado detectado")
                print("   ✓ Avance al paso 2 prevenido")
                print("   ✓ Formulario permanece en paso 1")
            else:
                print("❌ IT-MAQ-002: VALIDACIÓN FALLIDA")
                if not result["validation_error_shown"]:
                    print("   ✗ No se mostró error de validación")
                if not result["duplicate_error_detected"]:
                    print("   ✗ No se detectó error específico de duplicado")
                if result["prevented_advance"]:
                    print("   ✗ Se permitió avanzar al paso 2")
        else:
            print("❌ IT-MAQ-002: No se pudo realizar la validación")
            print(f"   Error: {result.get('error', 'Desconocido')}")

        # Espera para verificación visual
        print("👁️  Esperando 5 segundos para verificación visual...")
        time.sleep(5)

        return result

    except Exception as e:
        print(f"❌ Error durante IT-MAQ-002: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "validation_performed": False
        }

    finally:
        cleanup_test_environment(driver)


if __name__ == "__main__":
    result = run_it_maq_002(headless=False)

    if result.get("success", False):
        print("\n🎉 IT-MAQ-002: PRUEBA EXITOSA")
        print("Resultado: Validación de duplicados funciona correctamente")
        print("- Error de validación mostrado ✓")
        print("- Duplicado detectado ✓")
        print("- Avance prevenido ✓")
    else:
        print("\n💥 IT-MAQ-002: PRUEBA FALLIDA")
        if result.get("validation_performed", False):
            print("Resultado: La validación de duplicados no funcionó como esperado")
        else:
            print(f"Error: {result.get('error', 'Desconocido')}")
        sys.exit(1)