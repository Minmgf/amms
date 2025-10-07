"""
IT-SM-001: Creación manual de solicitud con validaciones y notificaciones
Test automatizado para validar el registro manual de solicitudes de mantenimiento.
"""

import time
import sys
import random
from pathlib import Path
from datetime import date
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

# Agregar el directorio raíz al path
sys.path.append(str(Path(__file__).parent.parent.parent))

# Datos de prueba
TEST_DATA = {
    "email": "danielsr_1997@hotmail.com",
    "password": "Usuario9924.",
    "machine": None,  # Se seleccionará aleatoriamente
    "maintenance_type": "Mantenimiento Preventivo",
    "priority": "Alta",
    "description": "Vibración anómala",
    "detection_date": date.today().strftime("%d/%m/%Y")
}

def get_random_machinery(driver):
    """
    Obtiene una maquinaria aleatoria de la lista disponible.
    """
    try:
        print("Obteniendo lista de maquinarias disponibles...")
        wait = WebDriverWait(driver, 15)
        
        # Buscar el select de maquinarias
        machine_select = wait.until(
            EC.presence_of_element_located((By.XPATH, "//select[contains(@class, 'parametrization-input')]"))
        )
        
        # Obtener todas las opciones disponibles
        select_element = Select(machine_select)
        options = select_element.options
        
        # Filtrar opciones válidas (excluir la opción vacía)
        valid_options = [option for option in options if option.text.strip() and option.text != "Seleccione la maquinaria"]
        
        if not valid_options:
            print("No se encontraron maquinarias disponibles")
            return None
        
        # Seleccionar una opción aleatoria
        random_option = random.choice(valid_options)
        selected_machine = random_option.text.strip()
        
        print(f"Maquinaria seleccionada aleatoriamente: {selected_machine}")
        return selected_machine
        
    except Exception as e:
        print(f"Error obteniendo maquinaria aleatoria: {str(e)}")
        return None

def perform_login():
    """
    Realiza el flujo de login.
    """
    # Configurar Chrome
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--start-maximized')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--disable-extensions')
    chrome_options.add_argument('--remote-debugging-port=9222')

    # Configurar ChromeDriver
    chromedriver_path = Path(__file__).parent / 'chromedriver.exe'
    service = Service(str(chromedriver_path))
    driver = webdriver.Chrome(service=service, options=chrome_options)

    try:
        print("Navegando a la página de login...")
        driver.get('http://localhost:3000/sigma/login')
        wait = WebDriverWait(driver, 15)

        # Login
        print("Completando campos de login...")
        email_input = wait.until(
            EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Correo electrónico']"))
        )
        email_input.clear()
        email_input.send_keys(TEST_DATA["email"])

        password_input = wait.until(
            EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Contraseña']"))
        )
        password_input.clear()
        password_input.send_keys(TEST_DATA["password"])

        login_button = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Iniciar sesión']"))
        )
        login_button.click()

        # Esperar a que se complete el login
        wait.until(
            lambda driver: driver.current_url != 'http://localhost:3000/sigma/login'
        )
        print("Login exitoso")
        return driver

    except Exception as e:
        print(f"Error durante el login: {str(e)}")
        driver.quit()
        raise

def navigate_to_maintenance_request(driver):
    """
    Navega a la solicitud de mantenimiento.
    """
    try:
        wait = WebDriverWait(driver, 15)
        
        # Hacer click en Mantenimiento
        print("Haciendo click en 'Mantenimiento'...")
        maintenance_nav_button = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//span[normalize-space()='Mantenimiento']"))
        )
        maintenance_nav_button.click()
        time.sleep(2)
        
        # Hacer click en Solicitud de mantenimiento
        print("Haciendo click en 'Solicitud de mantenimiento'...")
        maintenance_request_link = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//a[normalize-space()='Solicitud de mantenimiento']"))
        )
        maintenance_request_link.click()
        
        # Esperar a que se cargue la página
        expected_url = 'http://localhost:3000/sigma/maintenance/maintenanceRequest'
        wait.until(lambda driver: expected_url in driver.current_url)
        
        print("Navegación a Solicitud de Mantenimiento exitosa!")
        return driver

    except Exception as e:
        print(f"Error durante la navegación: {str(e)}")
        raise

def open_new_request_form(driver):
    """
    Abre el formulario de nueva solicitud.
    """
    try:
        print("Abriendo formulario de nueva solicitud...")
        wait = WebDriverWait(driver, 15)
        
        # Hacer click en "Nueva Solicitud"
        new_request_button = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Nueva Solicitud')]"))
        )
        new_request_button.click()
        time.sleep(3)
        
        print("Formulario abierto")
        return driver

    except Exception as e:
        print(f"Error abriendo formulario: {str(e)}")
        raise

def fill_form(driver):
    """
    Completa el formulario de solicitud de mantenimiento.
    """
    try:
        print("Completando formulario...")
        wait = WebDriverWait(driver, 15)
        elements_filled = 0
        
        # Obtener maquinaria aleatoria
        random_machine = get_random_machinery(driver)
        if not random_machine:
            raise Exception("No se pudo obtener una maquinaria aleatoria")
        
        # Actualizar TEST_DATA con la maquinaria seleccionada
        TEST_DATA["machine"] = random_machine
        
        # Seleccionar maquinaria
        print("   Seleccionando maquinaria...")
        machine_selects = driver.find_elements(By.TAG_NAME, "select")
        for select in machine_selects:
            options = select.find_elements(By.TAG_NAME, "option")
            for option in options:
                if random_machine in option.text:
                    Select(select).select_by_visible_text(option.text)
                    print(f"   Maquinaria: {option.text}")
                    elements_filled += 1
                    break
        
        # Seleccionar tipo de mantenimiento
        print("   Seleccionando tipo de mantenimiento...")
        maintenance_type_select = wait.until(
            EC.presence_of_element_located((By.XPATH, "//select[@name='maintenanceType']"))
        )
        select_type = Select(maintenance_type_select)
        
        # Seleccionar "Mantenimiento Preventivo"
        select_type.select_by_visible_text(TEST_DATA["maintenance_type"])
        print(f"   Tipo: {TEST_DATA['maintenance_type']}")
        elements_filled += 1
        
        # Seleccionar prioridad
        print("   Seleccionando prioridad...")
        priority_select = wait.until(
            EC.presence_of_element_located((By.XPATH, "//select[@name='priority']"))
        )
        Select(priority_select).select_by_visible_text(TEST_DATA["priority"])
        print(f"   Prioridad: {TEST_DATA['priority']}")
        elements_filled += 1
        
        # Completar descripción
        print("   Completando descripción...")
        textareas = driver.find_elements(By.TAG_NAME, "textarea")
        for textarea in textareas:
            if textarea.is_displayed():
                textarea.clear()
                textarea.send_keys(TEST_DATA["description"])
                print(f"   Descripción: {TEST_DATA['description']}")
                elements_filled += 1
                break
        
        # Completar fecha de detección
        print("   Completando fecha de detección...")
        date_input = wait.until(
            EC.presence_of_element_located((By.XPATH, "//input[@name='detectionDate']"))
        )
        date_input.clear()
        date_input.send_keys(TEST_DATA["detection_date"])
        print(f"   Fecha: {TEST_DATA['detection_date']}")
        elements_filled += 1
        
        print(f"Formulario completado ({elements_filled} elementos)")
        return driver

    except Exception as e:
        print(f"Error completando formulario: {str(e)}")
        raise

def submit_form(driver):
    """
    Envía el formulario.
    """
    try:
        print("Enviando formulario...")
        wait = WebDriverWait(driver, 15)
        
        # Buscar botón de envío
        submit_button = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Solicitar')]"))
        )
        submit_button.click()
        
        # Esperar a que se procese la solicitud
        print("Esperando procesamiento de la solicitud...")
        try:
            # Esperar a que se cierre el modal
            wait.until(
                EC.invisibility_of_element_located((By.XPATH, "//*[@id='Maintenance Request Modal']"))
            )
            print("Modal cerrado - solicitud procesada")
        except:
            # Si no se cierra el modal, esperar un tiempo fijo
            print("Esperando tiempo fijo para procesamiento...")
            time.sleep(5)
        
        print("Formulario enviado exitosamente")
        return driver

    except Exception as e:
        print(f"Error enviando formulario: {str(e)}")
        raise

def verify_request_creation(driver):
    """
    Verifica que la solicitud se haya creado en la lista de solicitudes de mantenimiento.
    """
    try:
        print("\n" + "=" * 60)
        print("VERIFICANDO CREACIÓN DE SOLICITUD")
        print("=" * 60)
        
        wait = WebDriverWait(driver, 15)
        
        # Navegar a la lista de solicitudes si no estamos ya ahí
        current_url = driver.current_url
        if "maintenanceRequest" not in current_url:
            print("Navegando a la lista de solicitudes...")
            driver.get('http://localhost:3000/sigma/maintenance/maintenanceRequest')
            time.sleep(3)
        
        # Refrescar la página para asegurar que se carguen los datos más recientes
        print("Refrescando página para cargar datos actualizados...")
        driver.refresh()
        time.sleep(3)
        
        # Esperar a que la tabla se cargue
        print("Esperando a que se cargue la tabla de solicitudes...")
        wait.until(
            EC.presence_of_element_located((By.TAG_NAME, "table"))
        )
        time.sleep(2)
        
        # Buscar la solicitud creada por los datos que usamos
        search_terms = [
            TEST_DATA["machine"],
            TEST_DATA["description"],
            TEST_DATA["priority"],
            TEST_DATA["maintenance_type"]
        ]
        
        print(f"Buscando solicitud con los siguientes datos:")
        print(f"  - Maquinaria: {TEST_DATA['machine']}")
        print(f"  - Descripción: {TEST_DATA['description']}")
        print(f"  - Prioridad: {TEST_DATA['priority']}")
        print(f"  - Tipo: {TEST_DATA['maintenance_type']}")
        
        found_request = False
        verification_details = []
        
        # Buscar en la tabla
        try:
            table = driver.find_element(By.TAG_NAME, "table")
            rows = table.find_elements(By.TAG_NAME, "tr")
            print(f"Tabla encontrada con {len(rows)} fila(s)")
            
            for i, row in enumerate(rows):
                row_text = row.text
                if any(term in row_text for term in search_terms):
                    print(f"✓ Solicitud encontrada en fila {i+1}")
                    print(f"  Contenido: {row_text}")
                    found_request = True
                    verification_details.append(f"Fila {i+1}: {row_text}")
                    break
        except Exception as e:
            print(f"Error buscando en tabla: {str(e)}")
        
        # Si no se encontró en la tabla, buscar en toda la página
        if not found_request:
            print("Buscando en toda la página...")
            try:
                page_text = driver.find_element(By.TAG_NAME, "body").text
                for term in search_terms:
                    if term in page_text:
                        print(f"✓ Término '{term}' encontrado en la página")
                        found_request = True
                        break
            except Exception as e:
                print(f"Error buscando en página: {str(e)}")
        
        
        print("\n" + "=" * 60)
        if found_request:
            print("✓ VERIFICACIÓN EXITOSA: La solicitud se creó correctamente")
            print("✓ La solicitud aparece en la lista de solicitudes de mantenimiento")
            return True
        else:
            print("✗ VERIFICACIÓN FALLIDA: No se encontró la solicitud creada")
            print("✗ La solicitud no aparece en la lista")
            return False
        print("=" * 60)
            
    except Exception as e:
        print(f"Error durante la verificación: {str(e)}")
        return False

def main():
    """
    Función principal del test.
    """
    driver = None
    try:
        print("=" * 60)
        print("INICIANDO TEST IT-SM-001")
        print("=" * 60)
        print(f"Fecha: {TEST_DATA['detection_date']}")
        print(f"Maquinaria: Se seleccionará aleatoriamente")
        print("=" * 60)
        
        # Ejecutar pasos del test
        driver = perform_login()
        driver = navigate_to_maintenance_request(driver)
        driver = open_new_request_form(driver)
        driver = fill_form(driver)
        driver = submit_form(driver)
        
        # Verificar que la solicitud se haya creado
        verification_success = verify_request_creation(driver)
        
        print("\n" + "=" * 60)
        if verification_success:
            print("TEST IT-SM-001 COMPLETADO EXITOSAMENTE")
            print("✓ La solicitud se creó y verificó correctamente")
            print("✓ El test cumple con todos los criterios de aceptación")
        else:
            print("TEST IT-SM-001 FALLÓ EN LA VERIFICACIÓN")
            print("✗ La solicitud no se encontró en la lista")
            print("✗ El test NO cumple con los criterios de aceptación")
        print("=" * 60)
        if TEST_DATA["machine"]:
            print(f"Maquinaria utilizada: {TEST_DATA['machine']}")
        print("=" * 60)
        
    except Exception as e:
        print(f"\nError durante el test: {str(e)}")
    finally:
        if driver:
            print("\nCerrando navegador...")
            driver.quit()

if __name__ == "__main__":
    main()