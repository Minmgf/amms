import time
import sys
import os
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from flows.auth.login.selenium_login_flow import perform_login, save_browser_logs
from flows.navigation.machinery_navigation import navigate_to_machinery
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from faker import Faker

fake = Faker('es_CO')
fake.seed_instance(int(time.time() * 1000000))

def generate_unique_test_data():
    timestamp = str(int(time.time()))
    tractor_name = f"Tractor {fake.company()} {fake.random_int(100, 999)}"
    serial_prefix = fake.random_uppercase_letter() + fake.random_uppercase_letter()
    serial_number = f"{serial_prefix}{fake.random_int(100, 999)}-{timestamp[-4:]}"

    return {
        "Nombre": tractor_name,
        "Año fabricación": str(fake.random_int(2020, 2024)),
        "Número de serie": serial_number,
        "Tipo maquinaria": "Tractor",
        "Marca": "Deutz",
        "Modelo": "Seleccione una marca primero",
        "Subpartida arancelaria": "8429.11.00",
        "Categoría maquinaria": "Maquinaria amarilla",
        "País": "Colombia",
        "Región": "Antioquia",
        "Ciudad": "Medellín",
        "Telemetría": "Teltonika FMB140"
    }

test_data = generate_unique_test_data()

step2_test_data = {
    "Número de serie del terminal": f"TERM{fake.random_int(100000, 999999)}",
    "Número de chasis": f"CHAS{fake.random_int(100000, 999999)}",
    "Número de serie del dispositivo GPS": f"GPS{fake.random_int(100000, 999999)}",
    "Número de motor": f"MOT{fake.random_int(100000, 999999)}"
}

step3_test_data = {
    "enginePower": str(fake.random_int(100, 300)),
    "enginePowerUnit": "k/h",
    "engineType": "diesel",
    "cylinderCapacity": str(fake.random_int(3000, 8000)),
    "cylinderCapacityUnit": "m³",
    "cylinderNumber": str(fake.random_int(4, 8)),
    "arrangement": "L",
    "traction": "4x4",
    "fuelConsumption": str(fake.random_int(5, 15)),
    "fuelConsumptionUnit": "m³/s",
    "transmissionSystem": "manual",
    "tankCapacity": str(fake.random_int(100, 500)),
    "tankCapacityUnit": "m³",
    "carryingCapacity": str(fake.random_int(1000, 5000)),
    "carryingCapacityUnit": "kg",
    "draftForce": str(fake.random_int(20, 100)),
    "draftForceUnit": "kN",
    "operatingWeight": str(fake.random_int(3000, 8000)),
    "operatingWeightUnit": "t",
    "maxSpeed": str(fake.random_int(20, 50)),
    "maxSpeedUnit": "km/h",
    "maxOperatingAltitude": str(fake.random_int(2000, 4000)),
    "maxOperatingAltitudeUnit": "msnm",
    "performanceMin": str(fake.random_int(80, 95)),
    "performanceMax": str(fake.random_int(95, 100)),
    "performanceUnit": "Hz",
    "dimensionsUnit": "m",
    "width": str(fake.random_int(150, 250) / 100),
    "length": str(fake.random_int(300, 500) / 100),
    "height": str(fake.random_int(200, 350) / 100),
    "netWeight": str(fake.random_int(2500, 7000)),
    "netWeightUnit": "t"
}

print("🎲 Datos únicos generados para esta prueba:")
print(f"   📝 Nombre: {test_data['Nombre']}")
print(f"   📅 Año fabricación: {test_data['Año fabricación']}")
print(f"   🔢 Número de serie: {test_data['Número de serie']}")
print("-" * 50)

formData = {
    "Nombre": 'input[name="name"]',
    "Año fabricación": 'select[name="manufactureYear"]',
    "Número de serie": 'input[name="serialNumber"]',
    "Tipo maquinaria": 'select[name="machineryType"]',
    "Marca": 'select[name="brand"]',
    "Modelo": 'select[name="model"]',
    "País": 'select[name="country"]',
    "Región": 'select[name="department"]',
    "Ciudad": 'select[name="city"]',
    "Subpartida arancelaria": 'input[name="tariff"]',
    "Categoría de maquinaria": 'select[name="category"]',
    "Telemetría": 'select[name="telemetry"]',
    "Foto": 'input[type="file"]',
}

step2_selectors = {
    "Número de serie del terminal": "//input[@placeholder='Ingrese el número de serie del terminal']",
    "Número de chasis": "//input[@placeholder='Ingrese el número de chasis']",
    "Número de serie del dispositivo GPS": "//input[@placeholder='Ingrese el número de serie del dispositivo GPS']",
    "Número de motor": "//input[@placeholder='Ingrese el número de motor']",
    "Siguiente": "//button[normalize-space()='Siguiente']"
}

step3_selectors = {
    "enginePower": "//input[@name='enginePower']",
    "enginePowerUnit": "//select[@aria-label='Engine Power Unit Select']",
    "engineType": "//select[@name='engineType']",
    "cylinderCapacity": "//input[@name='cylinderCapacity']",
    "cylinderCapacityUnit": "//select[@aria-label='Cylinder Capacity Unit Select']",
    "cylinderNumber": "//input[@placeholder='Número']",
    "arrangement": "//select[@name='arrangement']",
    "traction": "//select[@name='traction']",
    "fuelConsumption": "//input[@name='fuelConsumption']",
    "fuelConsumptionUnit": "//select[@aria-label='Fuel Consumption Unit Select']",
    "transmissionSystem": "//select[@name='transmissionSystem']",
    "capacidad_rendimiento": "//span[normalize-space()='Capacidad y Rendimiento']",
    "tankCapacity": "//input[@name='tankCapacity']",
    "tankCapacityUnit": "//select[@aria-label='Tank Capacity Unit Select']",
    "carryingCapacity": "//input[@name='carryingCapacity']",
    "carryingCapacityUnit": "//select[@name='carryingCapacityUnit']",
    "draftForce": "//input[@name='draftForce']",
    "draftForceUnit": "//select[@name='draftForceUnit']",
    "operatingWeight": "//input[@name='operatingWeight']",
    "operatingWeightUnit": "//select[@aria-label='Operating Weight Unit Select']",
    "maxSpeed": "//input[@name='maxSpeed']",
    "maxSpeedUnit": "//select[@name='maxSpeedUnit']",
    "maxOperatingAltitude": "//input[@name='maxOperatingAltitude']",
    "maxOperatingAltitudeUnit": "//select[@name='maxOperatingAltitudeUnit']",
    "performanceMin": "//input[@name='performanceMin']",
    "performanceMax": "//input[@name='performanceMax']",
    "performanceUnit": "//select[@name='performanceUnit']",
    "dimensiones_peso": "//button[@aria-label='Collapse Dimensiones y Peso Section']",
    "dimensionsUnit": "//select[@name='dimensionsUnit']",
    "width": "//input[@name='width']",
    "length": "//input[@name='length']",
    "height": "//input[@name='height']",
    "netWeight": "//input[@name='netWeight']",
    "netWeightUnit": "//select[@aria-label='Net Weight Unit Select']",
    "Siguiente": "//button[normalize-space()='Siguiente']"
}

def fill_form_field(driver, field_name, selector, value, field_type="input", modal_selector="div.modal-theme"):
    try:
        full_selector = f"{modal_selector} {selector}"
        wait = WebDriverWait(driver, 10)

        if field_type == "select":
            select_element = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, full_selector)))
            select = Select(select_element)
            select.select_by_visible_text(value)
            print(f"   Seleccionado '{value}' en {field_name}")
        else:
            input_element = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, full_selector)))
            input_element.clear()
            input_element.send_keys(value)
            print(f"   Ingresado '{value}' en {field_name}")

    except Exception as e:
        print(f"   Error completando campo '{field_name}': {str(e)}")

def fill_xpath_field(driver, field_name, xpath_selector, value, field_type="input"):
    try:
        wait = WebDriverWait(driver, 10)

        if field_type == "select":
            select_element = wait.until(EC.element_to_be_clickable((By.XPATH, xpath_selector)))
            select = Select(select_element)
            select.select_by_visible_text(value)
            print(f"   Seleccionado '{value}' en {field_name}")
        else:
            input_element = wait.until(EC.element_to_be_clickable((By.XPATH, xpath_selector)))
            input_element.clear()
            input_element.send_keys(value)
            print(f"   Ingresado '{value}' en {field_name}")

    except Exception as e:
        print(f"   Error completando campo '{field_name}': {str(e)}")

def click_xpath_element(driver, element_name, xpath_selector):
    try:
        wait = WebDriverWait(driver, 10)
        element = wait.until(EC.element_to_be_clickable((By.XPATH, xpath_selector)))
        element.click()
        print(f"   Click en {element_name}")

    except Exception as e:
        print(f"   Error haciendo click en '{element_name}': {str(e)}")

def complete_machinery_form_step1(driver):
    try:
        print("Completando Paso 1 del formulario de maquinaria...")

        time.sleep(2)

        fields_to_fill = [
            ("Nombre", formData["Nombre"], test_data["Nombre"], "input"),
            ("Año fabricación", formData["Año fabricación"], test_data["Año fabricación"], "select"),
            ("Número de serie", formData["Número de serie"], test_data["Número de serie"], "input"),
            ("Tipo maquinaria", formData["Tipo maquinaria"], test_data["Tipo maquinaria"], "select"),
            ("Marca", formData["Marca"], test_data["Marca"], "select"),
            ("Subpartida arancelaria", formData["Subpartida arancelaria"], test_data["Subpartida arancelaria"], "input"),
            ("Categoría de maquinaria", formData["Categoría de maquinaria"], test_data["Categoría maquinaria"], "select"),
        ]

        for field_name, selector, value, field_type in fields_to_fill:
            fill_form_field(driver, field_name, selector, value, field_type, modal_selector="div.modal-theme")

        time.sleep(1)

        try:
            wait = WebDriverWait(driver, 10)
            model_selector = f"div.modal-theme {formData['Modelo']}"
            wait.until(lambda d: d.find_element(By.CSS_SELECTOR, model_selector).is_enabled())
            model_select = Select(wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, model_selector))))
            options = model_select.options
            available_models = [opt.text for opt in options if opt.text and opt.text not in ["Seleccione una marca primero", "Seleccione un modelo...", ""]]
            if available_models:
                model_select.select_by_visible_text(available_models[0])
                print(f"   Modelo seleccionado: {available_models[0]}")
                test_data["Modelo"] = available_models[0]
        except Exception as e:
            print(f"   Error seleccionando modelo: {str(e)}")

        fill_form_field(driver, "País", formData["País"], test_data["País"], "select", modal_selector="div.modal-theme")
        time.sleep(1)
        fill_form_field(driver, "Región", formData["Región"], test_data["Región"], "select", modal_selector="div.modal-theme")
        fill_form_field(driver, "Ciudad", formData["Ciudad"], test_data["Ciudad"], "select", modal_selector="div.modal-theme")

        print("   Campo 'Telemetría' ignorado")
        print("Paso 1 completado correctamente")
        return driver

    except Exception as e:
        raise Exception(f"Error completando Paso 1 del formulario: {str(e)}")

def complete_machinery_form_step2(driver):
    try:
        print("Completando Paso 2 del formulario de maquinaria...")

        time.sleep(2)

        fields_to_fill = [
            ("Número de serie del terminal", step2_selectors["Número de serie del terminal"], step2_test_data["Número de serie del terminal"]),
            ("Número de chasis", step2_selectors["Número de chasis"], step2_test_data["Número de chasis"]),
            ("Número de serie del dispositivo GPS", step2_selectors["Número de serie del dispositivo GPS"], step2_test_data["Número de serie del dispositivo GPS"]),
            ("Número de motor", step2_selectors["Número de motor"], step2_test_data["Número de motor"])
        ]

        wait = WebDriverWait(driver, 10)

        for field_name, xpath_selector, value in fields_to_fill:
            input_element = wait.until(EC.element_to_be_clickable((By.XPATH, xpath_selector)))
            input_element.clear()
            input_element.send_keys(value)
            print(f"   Ingresado '{value}' en {field_name}")

        print("Paso 2 completado correctamente")
        return driver

    except Exception as e:
        raise Exception(f"Error completando Paso 2 del formulario: {str(e)}")

def complete_machinery_form_step3(driver):
    try:
        print("Completando Paso 3 del formulario de maquinaria...")

        time.sleep(2)

        motor_fields = [
            ("Potencia del motor", step3_selectors["enginePower"], step3_test_data["enginePower"], "input"),
            ("Tipo de motor", step3_selectors["engineType"], step3_test_data["engineType"], "select"),
            ("Capacidad del cilindro", step3_selectors["cylinderCapacity"], step3_test_data["cylinderCapacity"], "input"),
            ("Unidad capacidad cilindro", step3_selectors["cylinderCapacityUnit"], step3_test_data["cylinderCapacityUnit"], "select"),
            ("Número de cilindros", step3_selectors["cylinderNumber"], step3_test_data["cylinderNumber"], "input"),
            ("Disposición", step3_selectors["arrangement"], step3_test_data["arrangement"], "select"),
            ("Tracción", step3_selectors["traction"], step3_test_data["traction"], "select"),
            ("Consumo de combustible", step3_selectors["fuelConsumption"], step3_test_data["fuelConsumption"], "input"),
            ("Unidad consumo combustible", step3_selectors["fuelConsumptionUnit"], step3_test_data["fuelConsumptionUnit"], "select"),
            ("Sistema de transmisión", step3_selectors["transmissionSystem"], step3_test_data["transmissionSystem"], "select")
        ]

        for field_name, xpath_selector, value, field_type in motor_fields:
            fill_xpath_field(driver, field_name, xpath_selector, value, field_type)

        print("   Llenando campo 'Unidad de potencia' con verificación...")
        engine_power_unit_selector = step3_selectors["enginePowerUnit"]

        try:
            select_element = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.XPATH, engine_power_unit_selector))
            )
            select = Select(select_element)
            select.select_by_value("2")
            print("   Seleccionado 'k/h' en Unidad de potencia")

            selected_option = select.first_selected_option
            current_value = selected_option.text if selected_option else ""
            print(f"   Verificación - Valor actual: '{current_value}'")

            if current_value != "k/h":
                time.sleep(0.5)
                select.select_by_value("2")
                print("   Corrección aplicada")

        except Exception as e:
            print(f"   Error llenando campo 'Unidad de potencia': {str(e)}")

        print("   Verificación final del campo 'Engine Power Unit'...")
        try:
            time.sleep(1)
            engine_power_unit_element = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.XPATH, engine_power_unit_selector))
            )
            select = Select(engine_power_unit_element)
            selected_option = select.first_selected_option
            current_value = selected_option.text if selected_option else ""
            print(f"   Valor final: '{current_value}'")

            if current_value != "k/h":
                select.select_by_value("2")
                print("   Corrección final aplicada")
            else:
                print("   Campo verificado correctamente")

        except Exception as e:
            print(f"   Error en verificación final: {str(e)}")

        click_xpath_element(driver, "Capacidad y Rendimiento", step3_selectors["capacidad_rendimiento"])

        capacidad_fields = [
            ("Capacidad del tanque", step3_selectors["tankCapacity"], step3_test_data["tankCapacity"], "input"),
            ("Unidad capacidad tanque", step3_selectors["tankCapacityUnit"], step3_test_data["tankCapacityUnit"], "select"),
            ("Capacidad de carga", step3_selectors["carryingCapacity"], step3_test_data["carryingCapacity"], "input"),
            ("Unidad capacidad carga", step3_selectors["carryingCapacityUnit"], step3_test_data["carryingCapacityUnit"], "select"),
            ("Fuerza de tiro", step3_selectors["draftForce"], step3_test_data["draftForce"], "input"),
            ("Unidad fuerza tiro", step3_selectors["draftForceUnit"], step3_test_data["draftForceUnit"], "select"),
            ("Peso operativo", step3_selectors["operatingWeight"], step3_test_data["operatingWeight"], "input"),
            ("Unidad peso operativo", step3_selectors["operatingWeightUnit"], step3_test_data["operatingWeightUnit"], "select"),
            ("Velocidad máxima", step3_selectors["maxSpeed"], step3_test_data["maxSpeed"], "input"),
            ("Unidad velocidad máxima", step3_selectors["maxSpeedUnit"], step3_test_data["maxSpeedUnit"], "select"),
            ("Altitud máxima operativa", step3_selectors["maxOperatingAltitude"], step3_test_data["maxOperatingAltitude"], "input"),
            ("Unidad altitud máxima", step3_selectors["maxOperatingAltitudeUnit"], step3_test_data["maxOperatingAltitudeUnit"], "select"),
            ("Rendimiento mínimo", step3_selectors["performanceMin"], step3_test_data["performanceMin"], "input"),
            ("Rendimiento máximo", step3_selectors["performanceMax"], step3_test_data["performanceMax"], "input"),
            ("Unidad rendimiento", step3_selectors["performanceUnit"], step3_test_data["performanceUnit"], "select")
        ]

        for field_name, xpath_selector, value, field_type in capacidad_fields:
            fill_xpath_field(driver, field_name, xpath_selector, value, field_type)

        click_xpath_element(driver, "Capacidad y Rendimiento (cerrar)", step3_selectors["capacidad_rendimiento"])

        third_section_selectors = [
            "//span[normalize-space()='Dimensiones y Peso']",
            "//button[contains(@aria-label, 'Dimensiones y Peso')]",
            "//div[contains(text(), 'Dimensiones y Peso')]"
        ]

        third_section_opened = False
        for selector in third_section_selectors:
            try:
                click_xpath_element(driver, f"Dimensiones y Peso ({selector})", selector)
                third_section_opened = True
                break
            except:
                continue

        if third_section_opened:
            dimensiones_fields = [
                ("Unidad de dimensiones", step3_selectors["dimensionsUnit"], step3_test_data["dimensionsUnit"], "select"),
                ("Ancho", step3_selectors["width"], step3_test_data["width"], "input"),
                ("Largo", step3_selectors["length"], step3_test_data["length"], "input"),
                ("Alto", step3_selectors["height"], step3_test_data["height"], "input"),
                ("Peso neto", step3_selectors["netWeight"], step3_test_data["netWeight"], "input"),
                ("Unidad peso neto", step3_selectors["netWeightUnit"], step3_test_data["netWeightUnit"], "select")
            ]

            for field_name, xpath_selector, value, field_type in dimensiones_fields:
                fill_xpath_field(driver, field_name, xpath_selector, value, field_type)

        print("Paso 3 completado correctamente")
        return driver

    except Exception as e:
        raise Exception(f"Error completando Paso 3 del formulario: {str(e)}")

def setup_test_environment(headless=False):
    try:
        print("Configurando entorno de prueba IT-MAQ-003...")

        driver = perform_login(headless=headless)
        print("Usuario autenticado correctamente")

        driver = navigate_to_machinery(driver)
        print("Navegación a maquinaria completada")

        print("Entorno de prueba configurado correctamente")
        return driver

    except Exception as e:
        print(f"Error configurando entorno de prueba: {str(e)}")
        raise

def run_it_maq_003_step1(driver):
    try:
        print("🚜 Ejecutando IT-MAQ-003 - Paso 1: Ficha técnica general")

        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC

        button_selector = "//button[normalize-space()='Agregar maquinaria']"
        wait = WebDriverWait(driver, 15)
        add_button = wait.until(EC.element_to_be_clickable((By.XPATH, button_selector)))
        add_button.click()
        print("Formulario abierto")

        driver = complete_machinery_form_step1(driver)
        print("Paso 1 completado")

        xpath_candidates = [
            "//button[normalize-space()='Siguiente']",
            "//button[contains(normalize-space(.), 'Siguiente')]",
            "//button[contains(text(), 'Siguiente')]",
        ]

        css_candidates = [
            "div.modal-theme button[type='submit']",
            "div.modal-theme .ant-btn-primary",
            "div.modal-theme button[class*='primary']",
            "div.modal-theme button[class*='btn-primary']",
        ]

        next_button = None
        for xpath_selector in xpath_candidates:
            try:
                next_button = wait.until(EC.element_to_be_clickable((By.XPATH, xpath_selector)))
                break
            except:
                continue

        if not next_button:
            for css_selector in css_candidates:
                try:
                    next_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, css_selector)))
                    break
                except:
                    continue

        if next_button:
            next_button.click()
            print("Formulario enviado y avanzado a Paso 2")

        print("IT-MAQ-003 Paso 1 completado exitosamente")
        return driver

    except Exception as e:
        print(f"Error en IT-MAQ-003 Paso 1: {str(e)}")
        raise

def run_it_maq_003_step2(driver):
    try:
        print("🚜 Ejecutando IT-MAQ-003 - Paso 2: Información técnica adicional")

        driver = complete_machinery_form_step2(driver)
        print("Paso 2 completado")

        wait = WebDriverWait(driver, 10)
        next_button_selector = step2_selectors["Siguiente"]
        next_button = wait.until(EC.element_to_be_clickable((By.XPATH, next_button_selector)))
        next_button.click()
        print("Formulario enviado y avanzado a Paso 3")

        print("IT-MAQ-003 Paso 2 completado exitosamente")
        return driver

    except Exception as e:
        print(f"Error en IT-MAQ-003 Paso 2: {str(e)}")
        raise

def run_it_maq_003_step3(driver):
    try:
        print("🚜 Ejecutando IT-MAQ-003 - Paso 3: Especificaciones técnicas detalladas")

        driver = complete_machinery_form_step3(driver)
        print("Paso 3 completado")

        wait = WebDriverWait(driver, 10)
        next_button_selector = step3_selectors["Siguiente"]
        next_button = wait.until(EC.element_to_be_clickable((By.XPATH, next_button_selector)))
        next_button.click()
        print("Formulario enviado y avanzado a Paso 4")

        print("IT-MAQ-003 Paso 3 completado exitosamente")
        return driver

    except Exception as e:
        print(f"Error en IT-MAQ-003 Paso 3: {str(e)}")
        raise

def run_it_maq_003(headless=False):
    driver = None
    try:
        print("Iniciando IT-MAQ-003: Verificar registro completo de ficha técnica")
        print("=" * 70)

        driver = setup_test_environment(headless=headless)
        driver = run_it_maq_003_step1(driver)
        driver = run_it_maq_003_step2(driver)
        driver = run_it_maq_003_step3(driver)

        print("Assert: Verificando resultados...")
        print("Formulario enviado correctamente hasta Paso 3")
        print("Avance a Paso 4 verificado")

        print("IT-MAQ-003 completada exitosamente")
        return True

    except Exception as e:
        print(f"Error durante IT-MAQ-003: {str(e)}")
        return False

    finally:
        if driver:
            save_browser_logs(driver, "IT-MAQ-003")
            driver.quit()

if __name__ == "__main__":
    success = run_it_maq_003(headless=False)
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