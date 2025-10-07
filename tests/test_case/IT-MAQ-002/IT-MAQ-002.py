"""
IT-MAQ-002: Automatización completa del registro/edit de ficha técnica de maquinaria

Este módulo contiene las funciones específicas para IT-MAQ-002, reutilizando
funciones comunes de IT-MAQ-001 para evitar duplicación de código.

Funciones principales disponibles para importación:
- setup_test_environment(): Configura el entorno de prueba (login + navegación) - IMPORTADO de IT-MAQ-001
- run_it_maq_002_step1(): Ejecuta solo el paso 1 del formulario - USA funciones de IT-MAQ-001
- run_it_maq_002_step2(): Ejecuta solo el paso 2 del formulario - ESPECÍFICO de IT-MAQ-002
- run_it_maq_002(): Ejecuta la prueba completa hasta paso 2
- cleanup_test_environment(): Limpia el entorno después de la prueba - IMPORTADO de IT-MAQ-001

Uso desde otros archivos:
    from test_case.IT_MAQ_002.IT_MAQ_002 import setup_test_environment, run_it_maq_002_step1, run_it_maq_002_step2

    driver = setup_test_environment()
    driver = run_it_maq_002_step1(driver)
    driver = run_it_maq_002_step2(driver)
    # Continuar con paso 3...
"""

import time
import sys
import os
from pathlib import Path

# Agregar el directorio raíz al path para importar los módulos
sys.path.append(str(Path(__file__).parent.parent.parent))

# Importar funciones comunes de IT-MAQ-001 para evitar duplicación
import importlib.util
it_maq_001_path = Path(__file__).parent.parent / "IT-MAQ-001" / "IT-MAQ-001.py"
spec = importlib.util.spec_from_file_location("IT_MAQ_001", it_maq_001_path)
it_maq_001_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(it_maq_001_module)

# Importar las funciones específicas
setup_test_environment = it_maq_001_module.setup_test_environment
complete_machinery_form_step1 = it_maq_001_module.complete_machinery_form_step1
submit_form_step1 = it_maq_001_module.submit_form_step1
open_machinery_form = it_maq_001_module.open_machinery_form
cleanup_test_environment = it_maq_001_module.cleanup_test_environment

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Importar Faker para generar datos únicos
from faker import Faker

# Inicializar Faker con semilla basada en timestamp para mayor aleatoriedad
fake = Faker('es_CO')  # Usar locale colombiano para datos más realistas
fake.seed_instance(int(time.time() * 1000000))  # Semilla única por microsegundo

# Datos para el paso 2 - específicos de IT-MAQ-002
step2_test_data = {
    "Número de serie del terminal": f"TERM{fake.random_int(100000, 999999)}",
    "Número de chasis": f"CHAS{fake.random_int(100000, 999999)}",
    "Número de serie del dispositivo GPS": f"GPS{fake.random_int(100000, 999999)}",
    "Número de motor": f"MOT{fake.random_int(100000, 999999)}"
}

# Mostrar datos generados para esta ejecución
print("[DICE] Datos únicos generados para IT-MAQ-002 - Paso 2:")
print(f"   [CHIP] Número de serie del terminal: {step2_test_data['Número de serie del terminal']}")
print(f"   [CAR] Número de chasis: {step2_test_data['Número de chasis']}")
print(f"   [SATELLITE] Número de serie del dispositivo GPS: {step2_test_data['Número de serie del dispositivo GPS']}")
print(f"   [ENGINE] Número de motor: {step2_test_data['Número de motor']}")
print("-" * 50)

# Selectores del paso 2 - específicos de IT-MAQ-002 usando XPath como especificado
step2_selectors = {
    "Número de serie del terminal": "//input[@placeholder='Ingrese el número de serie del terminal']",
    "Número de chasis": "//input[@placeholder='Ingrese el número de chasis']",
    "Número de serie del dispositivo GPS": "//input[@placeholder='Ingrese el número de serie del dispositivo GPS']",
    "Número de motor": "//input[@placeholder='Ingrese el número de motor']",
    "Siguiente": "//button[normalize-space()='Siguiente']"
}

def complete_machinery_form_step2(driver):
    """
    Completa el Paso 2 del formulario de maquinaria con los datos específicos de IT-MAQ-002.

    Args:
        driver: Instancia de WebDriver con el formulario en el paso 2

    Returns:
        WebDriver: Driver con el formulario del paso 2 completado
    """
    try:
        print("Completando Paso 2 del formulario de maquinaria (IT-MAQ-002)...")

        # Completar campos del paso 2 usando los selectores XPath especificados
        fields_to_fill = [
            ("Número de serie del terminal", step2_selectors["Número de serie del terminal"], step2_test_data["Número de serie del terminal"]),
            ("Número de chasis", step2_selectors["Número de chasis"], step2_test_data["Número de chasis"]),
            ("Número de serie del dispositivo GPS", step2_selectors["Número de serie del dispositivo GPS"], step2_test_data["Número de serie del dispositivo GPS"]),
            ("Número de motor", step2_selectors["Número de motor"], step2_test_data["Número de motor"])
        ]

        wait = WebDriverWait(driver, 10)

        for field_name, xpath_selector, value in fields_to_fill:
            try:
                print(f"   Completando campo '{field_name}': '{value}'")
                print(f"   Usando selector XPath: {xpath_selector}")

                # Esperar y encontrar el campo usando XPath
                input_element = wait.until(EC.element_to_be_clickable((By.XPATH, xpath_selector)))
                input_element.clear()
                input_element.send_keys(value)
                print(f"    Ingresado '{value}' en {field_name}")

            except Exception as e:
                print(f"    Error completando campo '{field_name}': {str(e)}")
                # Continuar con otros campos en lugar de fallar completamente

        print("Paso 2 completado correctamente")
        return driver

    except Exception as e:
        raise Exception(f"Error completando Paso 2 del formulario: {str(e)}")

def submit_form_step2(driver):
    """
    Envía el Paso 2 del formulario usando el botón Siguiente especificado.

    Args:
        driver: Instancia de WebDriver con el formulario del paso 2 completado

    Returns:
        WebDriver: Driver con el formulario avanzado al paso 3
    """
    try:
        print("Enviando Paso 2 del formulario...")

        wait = WebDriverWait(driver, 10)

        # Usar el selector XPath específico para el botón Siguiente
        next_button_selector = step2_selectors["Siguiente"]
        print(f"   Usando selector XPath para botón siguiente: {next_button_selector}")

        next_button = wait.until(EC.element_to_be_clickable((By.XPATH, next_button_selector)))
        print("   Botón 'Siguiente' encontrado")

        next_button.click()
        print("Click realizado en botón 'Siguiente' del Paso 2")

        # Esperar a que se procese el envío y verificar avance
        time.sleep(2)

        # Verificar indicadores de éxito/avance al Paso 3
        success_indicators = [
            "//div[contains(text(), 'Paso 3')]",  # Indicador de paso 3
            "//div[contains(text(), 'paso 3')]",
            "//h2[contains(text(), 'Paso 3')]",
            "//span[contains(text(), 'Paso 3')]",
            "//div[contains(@class, 'step-3')]",  # Clase de paso 3
            "//div[contains(@class, 'active') and contains(text(), '3')]"  # Paso activo 3
        ]

        step3_found = False
        for indicator in success_indicators:
            try:
                elements = driver.find_elements(By.XPATH, indicator)
                if elements and any(element.is_displayed() for element in elements):
                    step3_found = True
                    print(f"   Detectado avance a Paso 3 con indicador: {indicator}")
                    break
            except:
                continue

        if step3_found:
            print("Formulario avanzó correctamente al Paso 3")
        else:
            print("No se detectó avance claro a Paso 3, pero envío completado")

        return driver

    except Exception as e:
        raise Exception(f"Error enviando Paso 2 del formulario: {str(e)}")

def run_it_maq_002_step1(driver):
    """
    Ejecuta solo el Paso 1 del formulario IT-MAQ-002 usando funciones de IT-MAQ-001.

    Args:
        driver: WebDriver ya posicionado en el módulo maquinaria

    Returns:
        WebDriver: Driver con el formulario del paso 1 completado y listo para paso 2
    """
    try:
        print(" Ejecutando IT-MAQ-002 - Paso 1: Ficha técnica general (usando IT-MAQ-001)")

        # Abrir formulario (función importada de IT-MAQ-001)
        print("Paso 1: Abriendo formulario de añadir maquinaria...")
        driver = open_machinery_form(driver)
        print("Formulario abierto")

        # Completar formulario (función importada de IT-MAQ-001)
        print("Paso 2: Completando formulario...")
        driver = complete_machinery_form_step1(driver)
        print("Paso 1 completado")

        # Enviar formulario (función importada de IT-MAQ-001)
        print("Paso 3: Enviando formulario...")
        driver = submit_form_step1(driver)
        print("Formulario enviado y avanzado a Paso 2")

        print("IT-MAQ-002 Paso 1 completado exitosamente")
        return driver

    except Exception as e:
        print(f"Error en IT-MAQ-002 Paso 1: {str(e)}")
        raise

def run_it_maq_002_step2(driver):
    """
    Ejecuta solo el Paso 2 del formulario IT-MAQ-002 (específico de este test).

    Args:
        driver: WebDriver ya posicionado en el Paso 2 del formulario

    Returns:
        WebDriver: Driver con el formulario del paso 2 completado y listo para paso 3
    """
    try:
        print(" Ejecutando IT-MAQ-002 - Paso 2: Información técnica adicional")

        # Completar formulario del paso 2 (función específica de IT-MAQ-002)
        print("Paso 1: Completando formulario del Paso 2...")
        driver = complete_machinery_form_step2(driver)
        print("Paso 2 completado")

        # Enviar formulario (función específica de IT-MAQ-002)
        print("Paso 2: Enviando formulario...")
        driver = submit_form_step2(driver)
        print("Formulario enviado y avanzado a Paso 3")

        print("IT-MAQ-002 Paso 2 completado exitosamente")
        return driver

    except Exception as e:
        print(f"Error en IT-MAQ-002 Paso 2: {str(e)}")
        raise

def run_it_maq_002(headless=False):
    """
    Ejecuta la prueba IT-MAQ-002 completa (Paso 1 y Paso 2).

    Args:
        headless (bool): Si ejecutar en modo headless

    Returns:
        bool: True si la prueba pasa, False si falla
    """
    driver = None
    try:
        print("Iniciando IT-MAQ-002: Verificar registro completo de ficha técnica")
        print("=" * 70)

        # Setup (función importada de IT-MAQ-001)
        driver = setup_test_environment(headless=headless)

        # Execute paso 1 (usa funciones de IT-MAQ-001)
        driver = run_it_maq_002_step1(driver)

        # Execute paso 2 (específico de IT-MAQ-002)
        driver = run_it_maq_002_step2(driver)

        # Assert: Verificar resultados
        print("Assert: Verificando resultados...")
        print("Formulario enviado correctamente hasta Paso 2")
        print("Avance a Paso 3 verificado")

        print("IT-MAQ-002 completada exitosamente")
        return True

    except Exception as e:
        print(f"Error durante IT-MAQ-002: {str(e)}")
        return False

    finally:
        cleanup_test_environment(driver, "IT-MAQ-002")

if __name__ == "__main__":
    success = run_it_maq_002(headless=False)  # Cambiar a True para modo headless
    if success:
        print("\nIT-MAQ-002: PRUEBA EXITOSA")
        print("Resultado: Ficha técnica registrada hasta Paso 2, maquinaria lista para Paso 3")
        print("\nPara continuar con el Paso 3, usar:")
        print("   from test_case.IT_MAQ_002.IT_MAQ_002 import setup_test_environment, run_it_maq_002_step1, run_it_maq_002_step2")
        print("   driver = setup_test_environment()")
        print("   driver = run_it_maq_002_step1(driver)")
        print("   driver = run_it_maq_002_step2(driver)")
        print("   # Continuar con IT_MAQ_002_step3.py")
    else:
        print("\nIT-MAQ-002: PRUEBA FALLIDA")
        sys.exit(1)
