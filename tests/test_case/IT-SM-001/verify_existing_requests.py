"""
Script independiente para verificar solicitudes de mantenimiento existentes
"""

import time
import sys
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

# Agregar el directorio raíz al path
sys.path.append(str(Path(__file__).parent.parent.parent))

# Datos de prueba
TEST_DATA = {
    "email": "danielsr_1997@hotmail.com",
    "password": "Usuario9924.",
}

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
    chrome_options.add_argument('--remote-debugging-port=9226')

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

def verify_specific_request(driver, search_terms):
    """
    Verifica una solicitud específica en la lista.
    """
    try:
        print("\n" + "=" * 60)
        print("VERIFICANDO SOLICITUD ESPECÍFICA")
        print("=" * 60)
        
        wait = WebDriverWait(driver, 15)
        
        # Navegar a la lista de solicitudes
        print("Navegando a la lista de solicitudes...")
        driver.get('http://localhost:3000/sigma/maintenance/maintenanceRequest')
        time.sleep(3)
        
        # Refrescar la página para asegurar datos actualizados
        print("Refrescando página para cargar datos actualizados...")
        driver.refresh()
        time.sleep(3)
        
        # Esperar a que la tabla se cargue
        print("Esperando a que se cargue la tabla de solicitudes...")
        wait.until(
            EC.presence_of_element_located((By.TAG_NAME, "table"))
        )
        time.sleep(2)
        
        print(f"Buscando solicitud con los siguientes términos:")
        for term in search_terms:
            print(f"  - {term}")
        
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
        
        # Tomar captura de pantalla para evidencia
        screenshot_path = Path(__file__).parent / f"verification_specific_{int(time.time())}.png"
        driver.save_screenshot(str(screenshot_path))
        print(f"Captura de pantalla guardada: {screenshot_path}")
        
        print("\n" + "=" * 60)
        if found_request:
            print("✓ VERIFICACIÓN EXITOSA: La solicitud se encontró")
            print("✓ La solicitud aparece en la lista de solicitudes de mantenimiento")
            return True
        else:
            print("✗ VERIFICACIÓN FALLIDA: No se encontró la solicitud")
            print("✗ La solicitud no aparece en la lista")
            return False
        print("=" * 60)
            
    except Exception as e:
        print(f"Error durante la verificación: {str(e)}")
        return False

def list_all_requests(driver):
    """
    Lista todas las solicitudes de mantenimiento existentes.
    """
    try:
        print("\n" + "=" * 60)
        print("LISTANDO TODAS LAS SOLICITUDES")
        print("=" * 60)
        
        wait = WebDriverWait(driver, 15)
        
        # Navegar a la lista de solicitudes
        print("Navegando a la lista de solicitudes...")
        driver.get('http://localhost:3000/sigma/maintenance/maintenanceRequest')
        time.sleep(3)
        
        # Esperar a que la tabla se cargue
        print("Esperando a que se cargue la tabla de solicitudes...")
        wait.until(
            EC.presence_of_element_located((By.TAG_NAME, "table"))
        )
        time.sleep(2)
        
        # Obtener todas las filas de la tabla
        try:
            table = driver.find_element(By.TAG_NAME, "table")
            rows = table.find_elements(By.TAG_NAME, "tr")
            print(f"Tabla encontrada con {len(rows)} fila(s)")
            
            print("\nSolicitudes encontradas:")
            for i, row in enumerate(rows):
                row_text = row.text.strip()
                if row_text and i > 0:  # Saltar la fila de encabezados
                    print(f"  {i}. {row_text}")
        except Exception as e:
            print(f"Error listando solicitudes: {str(e)}")
        
        # Tomar captura de pantalla
        screenshot_path = Path(__file__).parent / f"all_requests_{int(time.time())}.png"
        driver.save_screenshot(str(screenshot_path))
        print(f"Captura de pantalla guardada: {screenshot_path}")
        
    except Exception as e:
        print(f"Error listando solicitudes: {str(e)}")

def main():
    """
    Función principal del script de verificación.
    """
    driver = None
    try:
        print("=" * 60)
        print("VERIFICADOR DE SOLICITUDES DE MANTENIMIENTO")
        print("=" * 60)
        
        # Login
        driver = perform_login()
        
        # Mostrar opciones
        print("\nOpciones disponibles:")
        print("1. Listar todas las solicitudes")
        print("2. Verificar solicitud específica")
        
        choice = input("\nSeleccione una opción (1 o 2): ").strip()
        
        if choice == "1":
            list_all_requests(driver)
        elif choice == "2":
            print("\nIngrese los términos de búsqueda (separados por comas):")
            terms_input = input("Términos: ").strip()
            search_terms = [term.strip() for term in terms_input.split(",") if term.strip()]
            
            if search_terms:
                success = verify_specific_request(driver, search_terms)
                if success:
                    print("\n🎉 ¡Verificación exitosa!")
                else:
                    print("\n❌ Verificación fallida")
            else:
                print("No se ingresaron términos de búsqueda válidos")
        else:
            print("Opción no válida")
        
    except Exception as e:
        print(f"\nError durante la verificación: {str(e)}")
    finally:
        if driver:
            print("\nCerrando navegador...")
            driver.quit()

if __name__ == "__main__":
    main()
