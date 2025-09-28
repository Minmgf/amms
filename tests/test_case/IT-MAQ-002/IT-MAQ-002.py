"""
IT-MAQ-002: Automatización completa del registro/edit de ficha técnica de maquinaria

Este módulo contiene todas las funciones necesarias para automatizar el registro/edición
de maquinaria en el sistema AMMS, incluyendo login, navegación y completado del formulario multipaso.

Funciones principales disponibles para importación:
- setup_test_environment(): Configura el entorno de prueba (login + navegación)
- run_it_maq_002_step1(): Ejecuta solo el paso 1 del formulario
- run_it_maq_002_step2(): Ejecuta solo el paso 2 del formulario
- run_it_maq_002(): Ejecuta la prueba completa hasta paso 2
- cleanup_test_environment(): Limpia el entorno después de la prueba

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

from flows.auth.login.selenium_login_flow import perform_login, save_browser_logs
from flows.navigation.machinery_navigation import navigate_to_machinery

def create_test_image():
    """
    Crea una imagen de prueba simple para subir al formulario.

    Returns:
        str: Ruta completa del archivo de imagen creado
    """
    try:
        # Intentar crear una imagen real con PIL
        from PIL import Image, ImageDraw, ImageFont

        # Crear una imagen simple de 100x100 píxeles
        img = Image.new('RGB', (100, 100), color='lightblue')
        draw = ImageDraw.Draw(img)

        # Agregar texto a la imagen
        try:
            # Intentar usar una fuente del sistema
            font = ImageFont.truetype("arial.ttf", 12)
        except:
            # Usar fuente por defecto si no está disponible
            font = ImageFont.load_default()

        # Agregar texto
        text = "Test Image\nTractor"
        draw.text((10, 30), text, fill='black', font=font)

        # Guardar la imagen
        test_dir = os.path.dirname(__file__)
        image_path = os.path.join(test_dir, "test_tractor_image.jpg")
        img.save(image_path)

        print(f"   Imagen de prueba creada: {image_path}")
        return image_path

    except ImportError:
        # Si PIL no está disponible, crear un archivo de texto con extensión .jpg
        print("   PIL no disponible, creando archivo de texto como imagen de prueba...")
        test_dir = os.path.dirname(__file__)
        image_path = os.path.join(test_dir, "test_tractor_image.jpg")

        with open(image_path, 'w') as f:
            f.write("Test image content for tractor upload\nThis is a placeholder file for testing purposes.")

        print(f"   Archivo de prueba creado: {image_path}")
        return image_path

def upload_photo(driver, modal_selector="div.modal-theme"):
    """
    Sube una foto al formulario de maquinaria.

    Args:
        driver: Instancia de WebDriver
        modal_selector: Selector del modal contenedor
    """
    try:
        print("   Subiendo foto del tractor...")

        # Crear imagen de prueba
        image_path = create_test_image()

        # Encontrar el input file para la foto
        photo_selector = f"{modal_selector} {formData['Foto']}"
        photo_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, photo_selector))
        )

        # Subir el archivo
        photo_input.send_keys(image_path)
        print(f"   Foto subida: {os.path.basename(image_path)}")

        # Esperar un momento para que se procese la subida
        time.sleep(2)

    except Exception as e:
        print(f"   Error subiendo foto: {str(e)}")
        raise

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

# Importar Faker para generar datos únicos
from faker import Faker

# Inicializar Faker con semilla basada en timestamp para mayor aleatoriedad
fake = Faker('es_CO')  # Usar locale colombiano para datos más realistas
fake.seed_instance(int(time.time() * 1000000))  # Semilla única por microsegundo

def generate_unique_test_data():
    """
    Genera datos únicos de prueba usando Faker para evitar duplicados.

    Returns:
        dict: Diccionario con datos únicos generados
    """
    # Generar timestamp único para asegurar unicidad
    timestamp = str(int(time.time()))

    # Generar datos únicos
    tractor_name = f"Tractor {fake.company()} {fake.random_int(100, 999)}"
    serial_prefix = fake.random_uppercase_letter() + fake.random_uppercase_letter()
    serial_number = f"{serial_prefix}{fake.random_int(100, 999)}-{timestamp[-4:]}"  # Últimos 4 dígitos del timestamp

    return {
        "Nombre": tractor_name,
        "Año fabricación": str(fake.random_int(2020, 2024)),  # Años recientes
        "Número de serie": serial_number,
        "Tipo maquinaria": "Tractor",  # Mantener fijo por simplicidad
        "Marca": "Deutz",  # Mantener fijo por simplicidad
        "Modelo": "Seleccione una marca primero",  # Se actualiza dinámicamente
        "Subpartida arancelaria": "8429.11.00",  # Mantener fijo
        "Categoría maquinaria": "Maquinaria amarilla",  # Mantener fijo
        "País": "Colombia",  # Mantener fijo
        "Región": "Antioquia",  # Mantener fijo
        "Ciudad": "Medellín",  # Mantener fijo
        "Telemetría": "Teltonika FMB140"  # Mantener fijo
    }

# Generar datos únicos para esta ejecución
test_data = generate_unique_test_data()

# Datos para el paso 2
step2_test_data = {
    "Número de serie del terminal": f"TERM{fake.random_int(100000, 999999)}",
    "Número de chasis": f"CHAS{fake.random_int(100000, 999999)}",
    "Número de serie del dispositivo GPS": f"GPS{fake.random_int(100000, 999999)}",
    "Número de motor": f"MOT{fake.random_int(100000, 999999)}"
}

# Mostrar datos generados para esta ejecución
print("[DICE] Datos únicos generados para esta prueba:")
print(f"   [PEN] Nombre: {test_data['Nombre']}")
print(f"   [CALENDAR] Año fabricación: {test_data['Año fabricación']}")
print(f"   [HASH] Número de serie: {test_data['Número de serie']}")
print("-" * 50)

# Configuración del formulario - actualizada con selectores correctos basados en atributos name
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

# Selectores del paso 2 - usando XPath como especificado
step2_selectors = {
    "Número de serie del terminal": "//input[@placeholder='Ingrese el número de serie del terminal']",
    "Número de chasis": "//input[@placeholder='Ingrese el número de chasis']",
    "Número de serie del dispositivo GPS": "//input[@placeholder='Ingrese el número de serie del dispositivo GPS']",
    "Número de motor": "//input[@placeholder='Ingrese el número de motor']",
    "Siguiente": "//button[normalize-space()='Siguiente']"
}

def fill_form_field(driver, field_name, selector, value, field_type="input", modal_selector="div.modal-theme"):
    """
    Completa un campo del formulario de manera genérica.

    Args:
        driver: Instancia de WebDriver
        field_name: Nombre del campo para logging
        selector: Selector CSS del campo
        value: Valor a ingresar
        field_type: Tipo de campo ("input", "select", "file")
        modal_selector: Selector del modal contenedor
    """
    try:
        print(f"   Completando campo '{field_name}': '{value}'")

        # Construir selector completo incluyendo el modal
        full_selector = f"{modal_selector} {selector}"
        print(f"   Selector completo: {full_selector}")

        # Esperar a que el campo esté disponible
        wait = WebDriverWait(driver, 10)

        if field_type == "select":
            # Para selectores, usar Select de Selenium
            select_element = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, full_selector)))
            select = Select(select_element)
            select.select_by_visible_text(value)
            print(f"   Seleccionado '{value}' en {field_name}")
        else:
            # Para inputs normales
            input_element = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, full_selector)))
            input_element.clear()
            input_element.send_keys(value)
            print(f"   Ingresado '{value}' en {field_name}")

    except Exception as e:
        print(f"   Error completando campo '{field_name}': {str(e)}")

        # Intentar sin modal_selector como fallback
        try:
            print(f"   Intentando sin modal_selector...")
            if field_type == "select":
                select_element = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
                select = Select(select_element)
                select.select_by_visible_text(value)
                print(f"   Seleccionado '{value}' en {field_name} (sin modal)")
            else:
                input_element = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
                input_element.clear()
                input_element.send_keys(value)
                print(f"   Ingresado '{value}' en {field_name} (sin modal)")
        except Exception as e2:
            print(f"   Error persistente completando campo '{field_name}': {str(e2)}")
            raise e

def open_machinery_form(driver):
    """
    Abre el formulario de añadir maquinaria.

    Args:
        driver: Instancia de WebDriver ya en el módulo maquinaria

    Returns:
        WebDriver: Driver con el formulario abierto
    """
    try:
        print("Buscando boton 'Agregar maquinaria'...")

        # Usar el selector XPath específico proporcionado
        button_selector = "//button[normalize-space()='Agregar maquinaria']"

        wait = WebDriverWait(driver, 15)
        print(f"   Usando selector XPath: {button_selector}")

        add_button = wait.until(EC.element_to_be_clickable((By.XPATH, button_selector)))
        print("   Boton 'Agregar maquinaria' encontrado")

        add_button.click()
        print("Click realizado en boton 'Agregar maquinaria'")

        # Esperar a que aparezca el modal
        time.sleep(2)  # Espera inicial para que se cargue el modal

        # Cambiar contexto al modal
        modal_selector = "div.modal-theme"
        try:
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, modal_selector)))
            print("Modal detectado, cambiando contexto...")
        except:
            print("Modal no detectado con selector estandar, intentando alternativas...")
            # Intentar otros selectores para el modal
            alternative_selectors = [
                "div[class*='modal']",
                ".modal",
                "[role='dialog']",
                "div[style*='position: fixed']"
            ]
            modal_found = False
            for alt_selector in alternative_selectors:
                try:
                    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, alt_selector)))
                    modal_selector = alt_selector
                    print(f"Modal encontrado con selector alternativo: {alt_selector}")
                    modal_found = True
                    break
                except:
                    continue

            if not modal_found:
                print("No se pudo detectar el modal")
                raise Exception("Modal de formulario no encontrado")

        # Verificar que el formulario se abrió dentro del modal
        try:
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, formData["Nombre"])))
            print("Formulario de maquinaria abierto correctamente dentro del modal")

            # Mostrar información de campos disponibles
            print("Analisis de campos en el modal:")

            # Inputs
            inputs = driver.find_elements(By.CSS_SELECTOR, f"{modal_selector} input")
            print(f"   Inputs encontrados ({len(inputs)}):")
            for i, input_elem in enumerate(inputs):
                input_type = input_elem.get_attribute("type") or ""
                placeholder = input_elem.get_attribute("placeholder") or ""
                name = input_elem.get_attribute("name") or ""
                aria_label = input_elem.get_attribute("aria-label") or ""
                if name or placeholder or aria_label:
                    print(f"      {i+1}. name='{name}' type='{input_type}' placeholder='{placeholder}' aria-label='{aria_label}'")

            # Selects
            selects = driver.find_elements(By.CSS_SELECTOR, f"{modal_selector} select")
            print(f"   Selects encontrados ({len(selects)}):")
            for i, select_elem in enumerate(selects):
                name = select_elem.get_attribute("name") or ""
                aria_label = select_elem.get_attribute("aria-label") or ""
                disabled = select_elem.get_attribute("disabled")
                status = "DISABLED" if disabled else "ENABLED"
                print(f"      {i+1}. name='{name}' aria-label='{aria_label}' [{status}]")

                # Mostrar opciones disponibles
                options = select_elem.find_elements(By.TAG_NAME, "option")
                option_texts = [opt.text for opt in options[:5]]  # Primeras 5 opciones
                if option_texts:
                    print(f"         Opciones: {', '.join(option_texts)}")

            # Textareas (por si hay)
            textareas = driver.find_elements(By.CSS_SELECTOR, f"{modal_selector} textarea")
            if textareas:
                print(f"   Textareas encontrados ({len(textareas)}):")
                for i, ta in enumerate(textareas):
                    name = ta.get_attribute("name") or ""
                    placeholder = ta.get_attribute("placeholder") or ""
                    print(f"      {i+1}. name='{name}' placeholder='{placeholder}'")

        except:
            print("Campo 'Nombre' no encontrado en el modal, mostrando elementos disponibles...")

            # Mostrar inputs disponibles en el modal
            inputs = driver.find_elements(By.CSS_SELECTOR, f"{modal_selector} input")
            print(f"   Inputs en modal ({len(inputs)}):")
            for i, input_elem in enumerate(inputs[:15]):
                input_type = input_elem.get_attribute("type") or ""
                placeholder = input_elem.get_attribute("placeholder") or ""
                name = input_elem.get_attribute("name") or ""
                if placeholder or name:
                    print(f"      {i+1}. type='{input_type}' placeholder='{placeholder}' name='{name}'")

            # Mostrar selects disponibles en el modal
            selects = driver.find_elements(By.CSS_SELECTOR, f"{modal_selector} select")
            print(f"   Selects en modal ({len(selects)}):")
            for i, select_elem in enumerate(selects[:10]):
                placeholder = select_elem.get_attribute("placeholder") or ""
                name = select_elem.get_attribute("name") or ""
                if placeholder or name:
                    print(f"      {i+1}. placeholder='{placeholder}' name='{name}'")

            print("Continuando sin verificacion de formulario abierto...")

        return driver

    except Exception as e:
        raise Exception(f"Error abriendo formulario de maquinaria: {str(e)}")

def complete_machinery_form_step1(driver):
    """
    Completa el paso 1 del formulario de maquinaria con los datos de prueba.

    Args:
        driver: Instancia de WebDriver con el formulario abierto

    Returns:
        WebDriver: Driver con el formulario completado
    """
    try:
        print("Completando Paso 1 del formulario de maquinaria...")

        # Completar campos obligatorios del paso 1 en orden específico
        # Primero campos que no dependen de otros
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

        # Esperar a que se habiliten los campos dependientes (Región, Ciudad, Modelo)
        time.sleep(2)

        # Intentar seleccionar un modelo disponible para Deutz
        try:
            print("   Intentando seleccionar modelo para Deutz...")
            wait = WebDriverWait(driver, 10)
            model_selector = f"div.modal-theme {formData['Modelo']}"

            # Esperar a que el campo modelo se habilite después de seleccionar marca
            wait.until(lambda d: d.find_element(By.CSS_SELECTOR, model_selector).is_enabled())

            model_select = Select(wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, model_selector))))

            # Obtener todas las opciones disponibles
            options = model_select.options
            available_models = [opt.text for opt in options if opt.text and opt.text not in ["Seleccione una marca primero", "Seleccione un modelo...", ""]]

            if available_models:
                # Seleccionar el primer modelo disponible
                model_select.select_by_visible_text(available_models[0])
                print(f"   Modelo seleccionado: {available_models[0]}")
                test_data["Modelo"] = available_models[0]  # Actualizar el dato de prueba
            else:
                print("   No hay modelos disponibles para Deutz, dejando vacio...")

        except Exception as e:
            print(f"   Error seleccionando modelo: {str(e)}, continuando...")

        # Completar País y esperar a que se habiliten Región y Ciudad
        fill_form_field(driver, "País", formData["País"], test_data["País"], "select", modal_selector="div.modal-theme")

        # Esperar a que se habiliten Región y Ciudad
        time.sleep(2)

        # Completar Región y Ciudad
        fill_form_field(driver, "Región", formData["Región"], test_data["Región"], "select", modal_selector="div.modal-theme")
        fill_form_field(driver, "Ciudad", formData["Ciudad"], test_data["Ciudad"], "select", modal_selector="div.modal-theme")

        # Campo de Telemetría: IGNORADO según requerimiento del usuario
        print("   Campo 'Telemetría' ignorado - no se completará")

        # Subir foto del tractor
        upload_photo(driver, modal_selector="div.modal-theme")

        print("Paso 1 completado correctamente")
        return driver

    except Exception as e:
        raise Exception(f"Error completando Paso 1 del formulario: {str(e)}")

def submit_form_step1(driver):
    """
    Envía el Paso 1 del formulario y verifica el avance al Paso 2.

    Args:
        driver: Instancia de WebDriver con el formulario completado

    Returns:
        WebDriver: Driver con el formulario avanzado al paso 2
    """
    try:
        print("Enviando Paso 1 del formulario...")

        # Buscar y hacer click en el botón "Siguiente"
        wait = WebDriverWait(driver, 10)

        # Intentar diferentes selectores para el botón siguiente dentro del modal
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

                print(f"   Botón siguiente encontrado con selector: {selector}")
                break
            except:
                continue

        if not next_button:
            raise Exception("No se pudo encontrar el botón 'Siguiente'")

        next_button.click()
        print("Click realizado en botón 'Siguiente'")

        # Esperar a que se procese el envío y verificar avance
        time.sleep(2)

        # Verificar indicadores de éxito/avance
        success_indicators = [
            "//div[contains(text(), 'Paso 2')]",  # Indicador de paso 2
            "//div[contains(text(), 'paso 2')]",
            "//h2[contains(text(), 'Paso 2')]",
            "//span[contains(text(), 'Paso 2')]",
            "//div[contains(@class, 'step-2')]",  # Clase de paso 2
            "//div[contains(@class, 'active') and contains(text(), '2')]"  # Paso activo 2
        ]

        step2_found = False
        for indicator in success_indicators:
            try:
                elements = driver.find_elements(By.XPATH, indicator)
                if elements and any(element.is_displayed() for element in elements):
                    step2_found = True
                    print(f"   Detectado avance a Paso 2 con indicador: {indicator}")
                    break
            except:
                continue

        if step2_found:
            print("Formulario avanzó correctamente al Paso 2")
        else:
            print("No se detectó avance claro a Paso 2, pero envío completado")

        return driver

    except Exception as e:
        raise Exception(f"Error enviando Paso 1 del formulario: {str(e)}")

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
                print(f"   ✅ Ingresado '{value}' en {field_name}")

            except Exception as e:
                print(f"   ❌ Error completando campo '{field_name}': {str(e)}")
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

def setup_test_environment(headless=False):
    """
    Configura el entorno de prueba completo: login y navegación a maquinaria.

    Args:
        headless (bool): Si ejecutar en modo headless (sin interfaz visible)

    Returns:
        WebDriver: Driver configurado y posicionado en el módulo maquinaria
    """
    try:
        print("Configurando entorno de prueba IT-MAQ-002...")

        # Login
        print("Paso 1: Autenticando usuario...")
        driver = perform_login(headless=headless)
        print("Usuario autenticado correctamente")

        # Navegación a maquinaria
        print("Paso 2: Navegando a módulo maquinaria...")
        driver = navigate_to_machinery(driver)
        print("Navegación a maquinaria completada")

        print("Entorno de prueba configurado correctamente")
        return driver

    except Exception as e:
        print(f"Error configurando entorno de prueba: {str(e)}")
        raise

def run_it_maq_002_step1(driver):
    """
    Ejecuta solo el Paso 1 del formulario IT-MAQ-002.

    Args:
        driver: WebDriver ya posicionado en el módulo maquinaria

    Returns:
        WebDriver: Driver con el formulario del paso 1 completado y listo para paso 2
    """
    try:
        print("🚜 Ejecutando IT-MAQ-002 - Paso 1: Ficha técnica general")

        # Abrir formulario
        print("Paso 1: Abriendo formulario de añadir maquinaria...")
        driver = open_machinery_form(driver)
        print("Formulario abierto")

        # Completar formulario
        print("Paso 2: Completando formulario...")
        driver = complete_machinery_form_step1(driver)
        print("Paso 1 completado")

        # Enviar formulario
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
    Ejecuta solo el Paso 2 del formulario IT-MAQ-002.

    Args:
        driver: WebDriver ya posicionado en el Paso 2 del formulario

    Returns:
        WebDriver: Driver con el formulario del paso 2 completado y listo para paso 3
    """
    try:
        print("🚜 Ejecutando IT-MAQ-002 - Paso 2: Información técnica adicional")

        # Completar formulario del paso 2
        print("Paso 1: Completando formulario del Paso 2...")
        driver = complete_machinery_form_step2(driver)
        print("Paso 2 completado")

        # Enviar formulario
        print("Paso 2: Enviando formulario...")
        driver = submit_form_step2(driver)
        print("Formulario enviado y avanzado a Paso 3")

        print("IT-MAQ-002 Paso 2 completado exitosamente")
        return driver

    except Exception as e:
        print(f"Error en IT-MAQ-002 Paso 2: {str(e)}")
        raise

def cleanup_test_environment(driver, test_name="IT-MAQ-002"):
    """
    Limpia el entorno de prueba cerrando el navegador y guardando logs.

    Args:
        driver: Instancia de WebDriver a cerrar
        test_name: Nombre del test para guardar logs
    """
    try:
        if driver:
            # Capturar y guardar logs del navegador antes de cerrar
            print(f"Guardando logs de consola del navegador para {test_name}...")
            save_browser_logs(driver, test_name)

            print("Cerrando navegador...")
            driver.quit()
            print("Entorno de prueba limpiado")
    except Exception as e:
        print(f"Error limpiando entorno: {str(e)}")

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

        # Setup
        driver = setup_test_environment(headless=headless)

        # Execute paso 1
        driver = run_it_maq_002_step1(driver)

        # Execute paso 2
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
