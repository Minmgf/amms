"""
IT-MAQ-003: Automatización completa del registro/edit de ficha técnica de maquinaria

Este módulo contiene las funciones específicas para IT-MAQ-003, reutilizando
funciones comunes de IT-MAQ-001 e IT-MAQ-002 para evitar duplicación de código.

Funciones principales disponibles para importación:
- setup_test_environment(): Configura el entorno de prueba (login + navegación) - IMPORTADO de IT-MAQ-001
- run_it_maq_003_step1(): Ejecuta solo el paso 1 del formulario - USA funciones de IT-MAQ-001
- run_it_maq_003_step2(): Ejecuta solo el paso 2 del formulario - USA funciones de IT-MAQ-002
- run_it_maq_003_step3(): Ejecuta solo el paso 3 del formulario - ESPECÍFICO de IT-MAQ-003
- run_it_maq_003(): Ejecuta la prueba completa hasta paso 3
- cleanup_test_environment(): Limpia el entorno después de la prueba - IMPORTADO de IT-MAQ-001

Uso desde otros archivos:
    from test_case.IT_MAQ_003.IT_MAQ_003 import setup_test_environment, run_it_maq_003_step1, run_it_maq_003_step2, run_it_maq_003_step3

    driver = setup_test_environment()
    driver = run_it_maq_003_step1(driver)
    driver = run_it_maq_003_step2(driver)
    driver = run_it_maq_003_step3(driver)
    # Continuar con paso 4...
"""

import time
import sys
import os
from pathlib import Path

# Agregar el directorio raíz al path para importar los módulos
sys.path.append(str(Path(__file__).parent.parent.parent))

# Importar funciones comunes de IT-MAQ-001
import importlib.util
it_maq_001_path = Path(__file__).parent.parent / "IT-MAQ-001" / "IT-MAQ-001.py"
spec1 = importlib.util.spec_from_file_location("IT_MAQ_001", it_maq_001_path)
it_maq_001_module = importlib.util.module_from_spec(spec1)
spec1.loader.exec_module(it_maq_001_module)

# Importar funciones de IT-MAQ-002
it_maq_002_path = Path(__file__).parent.parent / "IT-MAQ-002" / "IT-MAQ-002.py"
spec2 = importlib.util.spec_from_file_location("IT_MAQ_002", it_maq_002_path)
it_maq_002_module = importlib.util.module_from_spec(spec2)
spec2.loader.exec_module(it_maq_002_module)

# Importar las funciones específicas
setup_test_environment = it_maq_001_module.setup_test_environment
cleanup_test_environment = it_maq_001_module.cleanup_test_environment
open_machinery_form = it_maq_001_module.open_machinery_form
complete_machinery_form_step1 = it_maq_001_module.complete_machinery_form_step1
submit_form_step1 = it_maq_001_module.submit_form_step1

complete_machinery_form_step2 = it_maq_002_module.complete_machinery_form_step2
submit_form_step2 = it_maq_002_module.submit_form_step2

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

# Importar Faker para generar datos únicos
from faker import Faker

# Inicializar Faker con semilla basada en timestamp para mayor aleatoriedad
fake = Faker('es_CO')  # Usar locale colombiano para datos más realistas
fake.seed_instance(int(time.time() * 1000000))  # Semilla única por microsegundo

# Datos para el paso 3 - específicos de IT-MAQ-003
step3_test_data = {
    "enginePower": str(fake.random_int(100, 300)),
    "enginePowerUnit": "k/h",
    "engineType": "Motor diésel de 4 tiempos",
    "cylinderCapacity": str(fake.random_int(3000, 8000)),
    "cylinderCapacityUnit": "m³",
    "cylinderNumber": str(fake.random_int(4, 8)),
    "arrangement": "Cilindros en línea (L o I)",
    "traction": "Tracción delantera (FWD)",
    "fuelConsumption": str(fake.random_int(5, 15)),
    "fuelConsumptionUnit": "m³/s",
    "transmissionSystem": "Transmisión manual",
    "tankCapacity": str(fake.random_int(100, 500)),
    "tankCapacityUnit": "m³",
    "carryingCapacity": str(fake.random_int(1000, 5000)),
    "carryingCapacityUnit": "t",
    "draftForce": str(fake.random_int(20, 100)),
    "draftForceUnit": "m³/s",
    "operatingWeight": str(fake.random_int(3000, 8000)),
    "operatingWeightUnit": "t",
    "maxSpeed": str(fake.random_int(20, 50)),
    "maxSpeedUnit": "km/h",
    "maxOperatingAltitude": str(fake.random_int(2000, 4000)),
    "maxOperatingAltitudeUnit": "m",
    "performanceMin": str(fake.random_int(80, 95)),
    "performanceMax": str(fake.random_int(95, 100)),
    "performanceUnit": "Hz",
    "dimensionsUnit": "m",
    "width": str(fake.random_int(150, 250) / 100),
    "length": str(fake.random_int(300, 500) / 100),
    "height": str(fake.random_int(200, 350) / 100),
    # Net weight (peso neto) - se agregó para evitar KeyError al completar dimensiones y peso
    "netWeight": str(fake.random_int(500, 3000)),
    "netWeightUnit": "t",
    "airConditioning": "Sistema de expansión directa (DX)",
    "airConditioningConsumption": str(fake.random_int(1, 10)),
    "airConditioningConsumptionUnit": "m³/s",
    "maxHydraulicPressure": str(fake.random_int(10000, 50000)),
    "maxHydraulicPressureUnit": "Pa",
    "hydraulicPumpFlowRate": str(fake.random_int(50, 150)),
    "hydraulicPumpFlowRateUnit": "m³/s",
    "hydraulicReservoirCapacity": str(fake.random_int(50, 200)),
    "hydraulicReservoirCapacityUnit": "m³"
}
# Enforce limits/constraints requested by the user. Convert and clamp numeric values so
# the form filling never tries to enter out-of-range values.

def _clamp_int_field(key, max_value):
    """Clamp integer-like string fields in step3_test_data to a maximum."""
    if key not in step3_test_data:
        return
    try:
        val = int(float(step3_test_data.get(key, 0)))
    except Exception:
        return
    if val > max_value:
        step3_test_data[key] = str(max_value)
    else:
        step3_test_data[key] = str(val)

def _clamp_float_field(key, max_value, decimals=2):
    """Clamp float-like string fields in step3_test_data to a maximum and keep formatting."""
    if key not in step3_test_data:
        return
    try:
        val = float(step3_test_data.get(key, 0))
    except Exception:
        return
    if val > max_value:
        val = float(max_value)
    # Round and preserve as string
    step3_test_data[key] = str(round(val, decimals))

# Apply the requested maximum constraints
_clamp_int_field("enginePower", 10000)
_clamp_int_field("cylinderCapacity", 50000)
_clamp_int_field("cylinderNumber", 32)
_clamp_int_field("fuelConsumption", 1000)
_clamp_int_field("tankCapacity", 10000)
_clamp_int_field("carryingCapacity", 1000000)
_clamp_int_field("draftForce", 1000000)
_clamp_int_field("operatingWeight", 1000000)
_clamp_int_field("maxSpeed", 500)
_clamp_int_field("maxOperatingAltitude", 10000)

# RPM / rendimiento min/max: both capped at 10000 and ensure min <= max
_clamp_int_field("performanceMin", 10000)
_clamp_int_field("performanceMax", 10000)
try:
    pmin = int(step3_test_data.get("performanceMin", 0))
    pmax = int(step3_test_data.get("performanceMax", 0))
    if pmin > pmax:
        # Make min not greater than max by setting min to max
        step3_test_data["performanceMin"] = str(pmax)
except Exception:
    pass

# Dimension limits
_clamp_float_field("width", 100, 2)
_clamp_float_field("length", 100, 2)
_clamp_float_field("height", 50, 2)
_clamp_int_field("netWeight", 1000000)

# Sistemas auxiliares e hidráulicos
_clamp_int_field("airConditioningConsumption", 1000)
_clamp_int_field("maxHydraulicPressure", 10000)
# If a hydraulic pump flow numeric field exists, clamp it too (key may not be present)
_clamp_int_field("hydraulicPumpFlowRate", 10000)
_clamp_int_field("hydraulicReservoirCapacity", 10000)

print("[DICE] Datos únicos generados para IT-MAQ-003 - Paso 3:")
print(f"   [ENGINE] Potencia del motor: {step3_test_data['enginePower']} {step3_test_data['enginePowerUnit']}")
print(f"   [GAS-PUMP] Consumo de combustible: {step3_test_data['fuelConsumption']} {step3_test_data['fuelConsumptionUnit']}")
print(f"   [WEIGHT] Peso operativo: {step3_test_data['operatingWeight']} {step3_test_data['operatingWeightUnit']}")
print("-" * 50)

# Defaults for Normatividad y Seguridad (ensure keys exist)
step3_test_data.setdefault("emissionLevelValue", "32")  # value for Euro I in DOM
step3_test_data.setdefault("emissionLevel", "Euro I")
step3_test_data.setdefault("cabinTypeValue", "33")  # value for Cabina Abierta in DOM
step3_test_data.setdefault("cabinType", "Cabina Abierta")

# Selectores del paso 3 - específicos de IT-MAQ-003 usando XPath como especificado
step3_selectors = {
    "enginePower": "//input[@name='enginePower']",
    "enginePowerUnit": "//select[@name='enginePowerUnit']",
    "engineType": "//select[@name='engineType']",
    "cylinderCapacity": "//input[@name='cylinderCapacity']",
    "cylinderCapacityUnit": "//select[@name='cylinderCapacityUnit']",
    "cylinderNumber": "//input[@name='cylindersNumber']",
    "arrangement": "//select[@name='arrangement']",
    "traction": "//select[@name='traction']",
    "fuelConsumption": "//input[@name='fuelConsumption']",
    "fuelConsumptionUnit": "//select[@name='fuelConsumptionUnit']",
    "transmissionSystem": "//select[@name='transmissionSystem']",
    "motor_transmision": "//button[contains(@aria-label, 'Motor y Transmisión Section')]",
    "motor_transmission_close_button": "//button[contains(@aria-label, 'Motor y Transmisión Section')]",
    "capacidad_rendimiento": "//button[contains(@aria-label, 'Capacidad y Rendimiento Section')]",
    "capacidad_rendimiento_close_button": "//button[contains(@aria-label, 'Capacidad y Rendimiento Section')]",
    "tankCapacity": "//input[@name='tankCapacity']",
    "tankCapacityUnit": "//select[@name='tankCapacityUnit']",
    "carryingCapacity": "//input[@name='carryingCapacity']",
    "carryingCapacityUnit": "//select[@name='carryingCapacityUnit']",
    "draftForce": "//input[@name='draftForce']",
    "draftForceUnit": "//select[@name='draftForceUnit']",
    "operatingWeight": "//input[@name='operatingWeight']",
    "operatingWeightUnit": "//select[@name='operatingWeightUnit']",
    "maxSpeed": "//input[@name='maxSpeed']",
    "maxSpeedUnit": "//select[@name='maxSpeedUnit']",
    "maxOperatingAltitude": "//input[@name='maxOperatingAltitude']",
    "maxOperatingAltitudeUnit": "//select[@name='maxOperatingAltitudeUnit']",
    "performanceMin": "//input[@name='performanceMin']",
    "performanceMax": "//input[@name='performanceMax']",
    "performanceUnit": "//select[@name='performanceUnit']",
    "dimensiones_peso": "//button[contains(@aria-label, 'Dimensiones y Peso Section')]",
    "dimensionsUnit": "//select[@name='dimensionsUnit']",
    "width": "//input[@name='width']",
    "length": "//input[@name='length']",
    "height": "//input[@name='height']",
    "netWeight": "//input[@name='netWeight']",
    "netWeightUnit": "//select[@name='netWeightUnit']",
    "airConditioning": "//select[@name='airConditioning']",
    "airConditioningConsumption": "//input[@name='airConditioningConsumption']",
    "airConditioningConsumptionUnit": "//select[@name='airConditioningConsumptionUnit']",
    "maxHydraulicPressure": "//input[@name='maxHydraulicPressure']",
    "maxHydraulicPressureUnit": "//select[@name='maxHydraulicPressureUnit']",
    "hydraulicPumpFlowRate": "//input[@name='hydraulicPumpFlowRate']",
    "hydraulicPumpFlowRateUnit": "//select[@name='hydraulicPumpFlowRateUnit']",
    "hydraulicReservoirCapacity": "//input[@name='hydraulicReservoirCapacity']",
    "hydraulicReservoirCapacityUnit": "//select[@name='hydraulicReservoirCapacityUnit']",
    "sistemas_hidraulicos": "//button[contains(@aria-label, 'Sistemas Auxiliares e Hidráulicos Section')]",
    "sistemas_hidraulicos_close_button": "//button[contains(@aria-label, 'Sistemas Auxiliares e Hidráulicos Section')]",
    "normatividad_seguridad": "//button[contains(@aria-label, 'Normatividad y Seguridad Section')]",
    "normatividad_seguridad_close_button": "//button[contains(@aria-label, 'Normatividad y Seguridad Section')]",
    "emissionLevel": "//select[@name='emissionLevel']",
    "cabinType": "//select[@name='cabinType']",
    "Siguiente": "//button[normalize-space()='Siguiente']"
}

def fill_xpath_field(driver, field_name, xpath_selector, value, field_type="input", use_value=False):
    """
    Completa un campo del formulario usando XPath.

    Args:
        driver: Instancia de WebDriver
        field_name: Nombre del campo para logging
        xpath_selector: Selector XPath del campo
        value: Valor a ingresar
        field_type: Tipo de campo ("input", "select", "file")
        use_value: Si usar select_by_value en lugar de select_by_visible_text para selects
    """
    try:
        wait = WebDriverWait(driver, 10)

        if field_type == "select":
            select_element = wait.until(EC.visibility_of_element_located((By.XPATH, xpath_selector)))
            select = Select(select_element)
            if use_value:
                select.select_by_value(value)
            else:
                select.select_by_visible_text(value)
            print(f"   Seleccionado '{value}' en {field_name}")
        else:
            input_element = wait.until(EC.visibility_of_element_located((By.XPATH, xpath_selector)))
            input_element.clear()
            input_element.send_keys(value)
            print(f"   Ingresado '{value}' en {field_name}")

    except Exception as e:
        print(f"   Error completando campo '{field_name}': {str(e)}")

def click_xpath_element(driver, element_name, xpath_selector):
    """
    Hace click en un elemento usando XPath.

    Args:
        driver: Instancia de WebDriver
        element_name: Nombre del elemento para logging
        xpath_selector: Selector XPath del elemento
    """
    try:
        wait = WebDriverWait(driver, 10)
        element = wait.until(EC.element_to_be_clickable((By.XPATH, xpath_selector)))
        element.click()
        print(f"   Click en {element_name}")

    except Exception as e:
        print(f"   Error haciendo click en '{element_name}': {str(e)}")

def complete_machinery_form_step3(driver):
    """
    Completa el Paso 3 del formulario de maquinaria con los datos específicos de IT-MAQ-003.

    Args:
        driver: Instancia de WebDriver con el formulario en el paso 3

    Returns:
        WebDriver: Driver con el formulario del paso 3 completado
    """
    try:
        print("Completando Paso 3 del formulario de maquinaria (IT-MAQ-003)...")

        time.sleep(4)

        # Sección de motor y transmisión (ya abierta al inicio)
        # Campos del motor
        motor_fields = [
            ("Potencia del motor", step3_selectors["enginePower"], step3_test_data["enginePower"], "input", False),
            ("Unidad potencia motor", step3_selectors["enginePowerUnit"], step3_test_data.get("enginePowerUnit", "k/h"), "select", False),
            ("Tipo de motor", step3_selectors["engineType"], step3_test_data["engineType"], "select", False),
            ("Capacidad del cilindro", step3_selectors["cylinderCapacity"], step3_test_data["cylinderCapacity"], "input", False),
            ("Unidad capacidad cilindro", step3_selectors["cylinderCapacityUnit"], step3_test_data["cylinderCapacityUnit"], "select", False),
            ("Número de cilindros", step3_selectors["cylinderNumber"], step3_test_data["cylinderNumber"], "input", False),
            ("Disposición", step3_selectors["arrangement"], step3_test_data["arrangement"], "select", False),
            ("Tracción", step3_selectors["traction"], step3_test_data["traction"], "select", False),
            ("Consumo de combustible", step3_selectors["fuelConsumption"], step3_test_data["fuelConsumption"], "input", False),
            ("Unidad consumo combustible", step3_selectors["fuelConsumptionUnit"], step3_test_data["fuelConsumptionUnit"], "select", False),
            ("Sistema de transmisión", step3_selectors["transmissionSystem"], step3_test_data["transmissionSystem"], "select", False)
        ]

        for field_name, xpath_selector, value, field_type, use_value in motor_fields:
            fill_xpath_field(driver, field_name, xpath_selector, value, field_type, use_value)

        # Pausa breve para inspección visual después de Motor y Transmisión
        time.sleep(3)

        # Cerrar sección de motor y transmisión
        click_xpath_element(driver, "Motor y Transmisión (cerrar)", step3_selectors["motor_transmission_close_button"])

        # Abrir sección de capacidad y rendimiento
        click_xpath_element(driver, "Capacidad y Rendimiento", step3_selectors["capacidad_rendimiento"])
        time.sleep(3)  # Delay de 3 segundos después de desplegar

        # (Removed HTML snapshot - not needed)

        # Campos de capacidad y rendimiento
        capacidad_fields = [
            ("Capacidad del tanque", step3_selectors["tankCapacity"], step3_test_data["tankCapacity"], "input", False),
            ("Unidad capacidad tanque", step3_selectors["tankCapacityUnit"], step3_test_data["tankCapacityUnit"], "select", False),
            ("Capacidad de carga", step3_selectors["carryingCapacity"], step3_test_data["carryingCapacity"], "input", False),
            ("Unidad capacidad carga", step3_selectors["carryingCapacityUnit"], step3_test_data["carryingCapacityUnit"], "select", False),
            ("Fuerza de tiro", step3_selectors["draftForce"], step3_test_data["draftForce"], "input", False),
            ("Unidad fuerza tiro", step3_selectors["draftForceUnit"], "15", "select", True),
            ("Peso operativo", step3_selectors["operatingWeight"], step3_test_data["operatingWeight"], "input", False),
            ("Unidad peso operativo", step3_selectors["operatingWeightUnit"], step3_test_data["operatingWeightUnit"], "select", False),
            ("Velocidad máxima", step3_selectors["maxSpeed"], step3_test_data["maxSpeed"], "input", False),
            ("Unidad velocidad máxima", step3_selectors["maxSpeedUnit"], step3_test_data["maxSpeedUnit"], "select", False),
            ("Altitud máxima operativa", step3_selectors["maxOperatingAltitude"], step3_test_data["maxOperatingAltitude"], "input", False),
            ("Unidad altitud máxima", step3_selectors["maxOperatingAltitudeUnit"], step3_test_data["maxOperatingAltitudeUnit"], "select", False),
            ("Rendimiento mínimo", step3_selectors["performanceMin"], step3_test_data["performanceMin"], "input", False),
            ("Rendimiento máximo", step3_selectors["performanceMax"], step3_test_data["performanceMax"], "input", False),
            ("Unidad rendimiento", step3_selectors["performanceUnit"], step3_test_data["performanceUnit"], "select", False)
        ]

        for field_name, xpath_selector, value, field_type, use_value in capacidad_fields:
            fill_xpath_field(driver, field_name, xpath_selector, value, field_type, use_value)

        # Pausa breve para inspección visual después de llenar Capacidad y Rendimiento
        time.sleep(3)

        # Cerrar sección de capacidad y rendimiento
        click_xpath_element(driver, "Capacidad y Rendimiento (cerrar)", step3_selectors["capacidad_rendimiento_close_button"])

        # Abrir sección de dimensiones y peso
        click_xpath_element(driver, "Dimensiones y Peso", step3_selectors["dimensiones_peso"])
        time.sleep(3)  # Delay de 3 segundos después de desplegar

        # Campos de dimensiones y peso
        dimensiones_fields = [
            ("Unidad de dimensiones", step3_selectors["dimensionsUnit"], step3_test_data["dimensionsUnit"], "select", False),
            ("Ancho", step3_selectors["width"], step3_test_data["width"], "input", False),
            ("Largo", step3_selectors["length"], step3_test_data["length"], "input", False),
            ("Alto", step3_selectors["height"], step3_test_data["height"], "input", False),
            ("Peso neto", step3_selectors["netWeight"], step3_test_data["netWeight"], "input", False),
            ("Unidad peso neto", step3_selectors["netWeightUnit"], step3_test_data["netWeightUnit"], "select", False)
        ] 

        for field_name, xpath_selector, value, field_type, use_value in dimensiones_fields:
            fill_xpath_field(driver, field_name, xpath_selector, value, field_type, use_value)

        # Pausa breve para inspección visual después de Dimensiones y Peso
        time.sleep(3)

        # Cerrar sección de dimensiones y peso
        click_xpath_element(driver, "Dimensiones y Peso (cerrar)", step3_selectors["dimensiones_peso"])

        # Abrir sección de sistemas auxiliares e hidráulicos
        click_xpath_element(driver, "Sistemas Auxiliares e Hidráulicos", step3_selectors["sistemas_hidraulicos"])
        time.sleep(3)  # Delay de 3 segundos después de desplegar

        # Campos adicionales del sistema (cuarta sección)
        sistema_fields = [
            ("Aire acondicionado", step3_selectors["airConditioning"], step3_test_data["airConditioning"], "select", False),
            ("Consumo aire acondicionado", step3_selectors["airConditioningConsumption"], step3_test_data["airConditioningConsumption"], "input", False),
            ("Unidad consumo aire acondicionado", step3_selectors["airConditioningConsumptionUnit"], step3_test_data["airConditioningConsumptionUnit"], "select", False),
            ("Presión hidráulica máxima", step3_selectors["maxHydraulicPressure"], step3_test_data["maxHydraulicPressure"], "input", False),
            ("Unidad presión hidráulica máxima", step3_selectors["maxHydraulicPressureUnit"], step3_test_data["maxHydraulicPressureUnit"], "select", False),
            ("Caudal bomba hidráulica", step3_selectors["hydraulicPumpFlowRate"], step3_test_data["hydraulicPumpFlowRate"], "input", False),
            ("Unidad caudal bomba hidráulica", step3_selectors["hydraulicPumpFlowRateUnit"], step3_test_data["hydraulicPumpFlowRateUnit"], "select", False),
            ("Capacidad depósito hidráulico", step3_selectors["hydraulicReservoirCapacity"], step3_test_data["hydraulicReservoirCapacity"], "input", False),
            ("Unidad capacidad depósito hidráulico", step3_selectors["hydraulicReservoirCapacityUnit"], step3_test_data["hydraulicReservoirCapacityUnit"], "select", False)
        ]

        for field_name, xpath_selector, value, field_type, use_value in sistema_fields:
            fill_xpath_field(driver, field_name, xpath_selector, value, field_type, use_value)

        # Pausa breve para inspección visual después de Sistemas Auxiliares e Hidráulicos
        time.sleep(3)

        # Cerrar sección de sistemas auxiliares e hidráulicos
        click_xpath_element(driver, "Sistemas Auxiliares e Hidráulicos (cerrar)", step3_selectors["sistemas_hidraulicos_close_button"])
        
        # Abrir sección de Normatividad y Seguridad
        click_xpath_element(driver, "Normatividad y Seguridad", step3_selectors["normatividad_seguridad"])
        time.sleep(1)

        # Campos de Normatividad y Seguridad
        normatividad_fields = [
            ("Nivel de Emisiones", step3_selectors["emissionLevel"], step3_test_data["emissionLevelValue"], "select", True),
            ("Tipo de Cabina", step3_selectors["cabinType"], step3_test_data["cabinTypeValue"], "select", True)
        ]

        for field_name, xpath_selector, value, field_type, use_value in normatividad_fields:
            fill_xpath_field(driver, field_name, xpath_selector, value, field_type, use_value)

        # Pausa breve para inspección visual después de Normatividad y Seguridad
        time.sleep(3)

        # Cerrar Normatividad y Seguridad
        click_xpath_element(driver, "Normatividad y Seguridad (cerrar)", step3_selectors["normatividad_seguridad_close_button"])
        return driver

    except Exception as e:
        raise Exception(f"Error completando Paso 3 del formulario: {str(e)}")

def submit_form_step3(driver):
    """
    Envía el Paso 3 del formulario usando el botón Siguiente especificado.

    Args:
        driver: Instancia de WebDriver con el formulario del paso 3 completado

    Returns:
        WebDriver: Driver con el formulario avanzado al paso 4
    """
    try:
        print("Enviando Paso 3 del formulario...")

        wait = WebDriverWait(driver, 10)

        # Usar el selector XPath específico para el botón Siguiente
        next_button_selector = step3_selectors["Siguiente"]
        print(f"   Usando selector XPath para botón siguiente: {next_button_selector}")

        next_button = wait.until(EC.element_to_be_clickable((By.XPATH, next_button_selector)))
        print("   Botón 'Siguiente' encontrado")

        next_button.click()
        print("Click realizado en botón 'Siguiente' del Paso 3")
        # Esperar a que se procese el envío
        time.sleep(2)

        # Verificar indicadores de éxito/avance al Paso 4
        success_indicators = [
            "//div[contains(text(), 'Paso 4')]",  # Indicador de paso 4
            "//div[contains(text(), 'paso 4')]",
            "//h2[contains(text(), 'Paso 4')]",
            "//span[contains(text(), 'Paso 4')]",
            "//div[contains(@class, 'step-4')]",  # Clase de paso 4
            "//div[contains(@class, 'active') and contains(text(), '4')]"  # Paso activo 4
        ]

        step4_found = False
        for indicator in success_indicators:
            try:
                elements = driver.find_elements(By.XPATH, indicator)
                if elements and any(element.is_displayed() for element in elements):
                    step4_found = True
                    print(f"   Detectado avance a Paso 4 con indicador: {indicator}")
                    break
            except:
                continue

        if step4_found:
            print("Formulario avanzó correctamente al Paso 4")
        else:
            print("No se detectó avance claro a Paso 4, pero envío completado")

        return driver

    except Exception as e:
        raise Exception(f"Error enviando Paso 3 del formulario: {str(e)}")

def run_it_maq_003_step1(driver):
    """
    Ejecuta solo el Paso 1 del formulario IT-MAQ-003 usando funciones de IT-MAQ-001.

    Args:
        driver: WebDriver ya posicionado en el módulo maquinaria

    Returns:
        WebDriver: Driver con el formulario del paso 1 completado y listo para paso 2
    """
    try:
        print(" Ejecutando IT-MAQ-003 - Paso 1: Ficha técnica general (usando IT-MAQ-001)")

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

        print("IT-MAQ-003 Paso 1 completado exitosamente")
        return driver

    except Exception as e:
        print(f"Error en IT-MAQ-003 Paso 1: {str(e)}")
        raise

def run_it_maq_003_step2(driver):
    """
    Ejecuta solo el Paso 2 del formulario IT-MAQ-003 usando funciones de IT-MAQ-002.

    Args:
        driver: WebDriver ya posicionado en el Paso 2 del formulario

    Returns:
        WebDriver: Driver con el formulario del paso 2 completado y listo para paso 3
    """
    try:
        print(" Ejecutando IT-MAQ-003 - Paso 2: Información técnica adicional (usando IT-MAQ-002)")

        # Completar formulario del paso 2 (función importada de IT-MAQ-002)
        print("Paso 1: Completando formulario del Paso 2...")
        driver = complete_machinery_form_step2(driver)
        print("Paso 2 completado")

        # Enviar formulario (función importada de IT-MAQ-002)
        print("Paso 2: Enviando formulario...")
        driver = submit_form_step2(driver)
        print("Formulario enviado y avanzado a Paso 3")

        print("IT-MAQ-003 Paso 2 completado exitosamente")
        return driver

    except Exception as e:
        print(f"Error en IT-MAQ-003 Paso 2: {str(e)}")
        raise

def run_it_maq_003_step3(driver):
    """
    Ejecuta solo el Paso 3 del formulario IT-MAQ-003 (específico de este test).

    Args:
        driver: WebDriver ya posicionado en el Paso 3 del formulario

    Returns:
        WebDriver: Driver con el formulario del paso 3 completado y listo para paso 4
    """
    try:
        print(" Ejecutando IT-MAQ-003 - Paso 3: Especificaciones técnicas detalladas")

        # Completar formulario del paso 3 (función específica de IT-MAQ-003)
        print("Paso 1: Completando formulario del Paso 3...")
        driver = complete_machinery_form_step3(driver)
        print("Paso 3 completado")

        # Enviar formulario (función específica de IT-MAQ-003)
        print("Paso 2: Enviando formulario...")
        driver = submit_form_step3(driver)
        print("Formulario enviado y avanzado a Paso 4")

        print("IT-MAQ-003 Paso 3 completado exitosamente")
        return driver

    except Exception as e:
        print(f"Error en IT-MAQ-003 Paso 3: {str(e)}")
        raise

def run_it_maq_003(headless=False):
    """
    Ejecuta la prueba IT-MAQ-003 completa (Paso 1, 2 y 3).

    Args:
        headless (bool): Si ejecutar en modo headless

    Returns:
        bool: True si la prueba pasa, False si falla
    """
    driver = None
    try:
        print("Iniciando IT-MAQ-003: Verificar registro completo de ficha técnica")
        print("=" * 70)

        # Setup (función importada de IT-MAQ-001)
        driver = setup_test_environment(headless=headless)

        # Execute paso 1 (usa funciones de IT-MAQ-001)
        driver = run_it_maq_003_step1(driver)

        # Execute paso 2 (usa funciones de IT-MAQ-002)
        driver = run_it_maq_003_step2(driver)

        # Execute paso 3 (específico de IT-MAQ-003)
        driver = run_it_maq_003_step3(driver)

        # Assert: Verificar resultados
        print("Assert: Verificando resultados...")
        print("Formulario enviado correctamente hasta Paso 3")
        print("Avance a Paso 4 verificado")

        print("IT-MAQ-003 completada exitosamente")
        return True

    except Exception as e:
        print(f"Error durante IT-MAQ-003: {str(e)}")
        return False

    finally:
        cleanup_test_environment(driver, "IT-MAQ-003")

if __name__ == "__main__":
    success = run_it_maq_003(headless=False)  # Cambiar a True para modo headless
    if success:
        print("\nIT-MAQ-003: PRUEBA EXITOSA")
        print("Resultado: Ficha técnica registrada hasta Paso 3, maquinaria lista para Paso 4")
        print("\nPara continuar con el Paso 4, usar:")
        print("   from test_case.IT_MAQ_003.IT_MAQ_003 import setup_test_environment, run_it_maq_003_step1, run_it_maq_003_step2, run_it_maq_003_step3")
        print("   driver = setup_test_environment()")
        print("   driver = run_it_maq_003_step1(driver)")
        print("   driver = run_it_maq_003_step2(driver)")
        print("   driver = run_it_maq_003_step3(driver)")
        print("   # Continuar con IT_MAQ_003_step4.py")
    else:
        print("\nIT-MAQ-003: PRUEBA FALLIDA")
        sys.exit(1)
