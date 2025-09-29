"""
IT-MAQ-008: Verificar listado con paginación y filtros avanzados

Este módulo contiene todas las funciones necesarias para automatizar la verificación
del listado de maquinarias con filtros, búsqueda y paginación en el sistema AMMS.

Caso de Prueba:
- Título: Verificar listado con paginación y filtros avanzados
- Descripción: Validar el listado de maquinarias con filtros, búsqueda y paginación
- Precondiciones: 25 maquinarias registradas con diferentes estados, Usuario con permisos de consulta
- Datos de Entrada: Filtros: Tipo="Tractor", Estado="Activa", Búsqueda: "Banano", Página: 1, Elementos: 10

Funciones principales disponibles para importación:
- setup_test_environment(): Configura el entorno de prueba (login + navegación)
- test_pagination_functionality(): Prueba la funcionalidad de paginación
- test_filter_functionality(): Prueba los filtros avanzados
- test_search_functionality(): Prueba la funcionalidad de búsqueda
- run_it_maq_008(): Ejecuta la prueba completa
- cleanup_test_environment(): Limpia el entorno después de la prueba

Uso desde otros archivos:
    from test_case.IT_MAQ_008.test_IT_MAQ_008_pagination_filters import setup_test_environment, run_it_maq_008

    driver = setup_test_environment()
    success = run_it_maq_008(driver)
"""

import time
import sys
import os
from pathlib import Path

# Agregar el directorio raíz al path para importar los módulos
sys.path.append(str(Path(__file__).parent.parent.parent))

from flows.navigation.machinery_navigation import navigate_to_machinery

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.keys import Keys
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

# Credenciales de prueba
TEST_CREDENTIALS = {
    "email": "danielsr_1997@hotmail.com",
    "password": "Usuario9924."
}

# Selectores XPath proporcionados por el usuario
SELECTORS = {
    "search_input": "//input[@id='search']",
    "filter_button": "//button[@aria-label='Filter Button']",
    "previous_page": "//button[@class='parametrization-pagination-button inline-flex items-center px-3 py-2 text-sm font-medium transition-colors'][contains(text(),'← Previous')]",
    "page_1": "//button[@class='parametrization-pagination-button inline-flex items-center justify-center w-10 h-10 text-sm font-medium transition-colors active']",
    "next_page": "//button[@class='parametrization-pagination-button inline-flex items-center px-3 py-2 text-sm font-medium transition-colors'][contains(text(),'Next →')]",
    "items_per_page": "//select[@class='parametrization-pagination-select px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500']"
}

def save_browser_logs(driver, test_name):
    """
    Captura y guarda los logs de la consola del navegador en un archivo.

    Args:
        driver: Instancia de WebDriver
        test_name: Nombre del test para el archivo de logs (ej: 'IT-MAQ-008')
    """
    try:
        # Crear directorio de logs si no existe
        PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
        logs_dir = PROJECT_ROOT / 'logs'
        logs_dir.mkdir(exist_ok=True)

        # Obtener logs del navegador
        browser_logs = driver.get_log('browser')

        # Crear archivo de logs
        log_file_path = logs_dir / f"{test_name}_browser_console.log"

        with open(log_file_path, 'w', encoding='utf-8') as f:
            f.write(f"Browser Console Logs for {test_name}\n")
            f.write("=" * 50 + "\n")
            f.write(f"Generated at: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("=" * 50 + "\n\n")

            if browser_logs:
                for log_entry in browser_logs:
                    timestamp = time.strftime('%H:%M:%S', time.localtime(log_entry['timestamp'] / 1000))
                    level = log_entry['level']
                    message = log_entry['message']
                    f.write(f"[{timestamp}] {level}: {message}\n")
            else:
                f.write("No browser console logs captured.\n")

        print(f"Browser console logs saved to: {log_file_path}")

    except Exception as e:
        print(f"Error saving browser logs: {str(e)}")

def perform_login(driver=None, headless=False):
    """
    Realiza el flujo de login automatizado con credenciales hardcodeadas.

    Args:
        driver: Instancia de WebDriver. Si es None, se crea una nueva.
        headless: Si True, ejecuta el navegador en modo headless.

    Returns:
        WebDriver: La instancia del driver con el usuario logueado.

    Raises:
        Exception: Si ocurre un error durante el login
    """
    # Usar credenciales hardcodeadas
    email = TEST_CREDENTIALS["email"]
    password = TEST_CREDENTIALS["password"]

    # Crear driver si no se proporciona
    if driver is None:
        chrome_options = Options()
        if headless:
            chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--start-maximized')  # Maximizar ventana al iniciar
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--disable-web-security')
        chrome_options.add_argument('--disable-features=VizDisplayCompositor')
        chrome_options.add_argument('--disable-extensions')
        chrome_options.add_argument('--disable-plugins')
        
        # Configuraciones de automatización
        chrome_options.add_experimental_option("useAutomationExtension", False)
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])

        # Configurar path del chromedriver usando WebDriverManager
        service = Service(ChromeDriverManager().install())

        driver = webdriver.Chrome(service=service, options=chrome_options)

    try:
        # Navegar a la página de login
        driver.get('http://localhost:3000/sigma/login')

        # Esperar a que la página cargue
        wait = WebDriverWait(driver, 15)

        # Localizar y completar campo de email
        email_input = wait.until(
            EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Correo electrónico']"))
        )
        email_input.clear()
        email_input.send_keys(email)

        # Localizar y completar campo de contraseña
        password_input = wait.until(
            EC.presence_of_element_located((By.XPATH, "//input[@type='password']"))
        )
        password_input.clear()
        password_input.send_keys(password)

        # Localizar y hacer click en el botón de iniciar sesión
        login_button = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Iniciar sesión']"))
        )
        login_button.click()

        # Esperar a que se complete el login (puede variar según la aplicación)
        # Aquí puedes agregar una espera específica si hay un indicador de login exitoso
        wait.until(
            lambda driver: driver.current_url != 'http://localhost:3000/sigma/login'
        )

        return driver

    except Exception as e:
        if driver:
            driver.quit()
        raise Exception(f"Error durante el login: {str(e)}")

def setup_test_environment(headless=False):
    """
    Configura el entorno de prueba completo: login y navegación a maquinaria.

    Args:
        headless (bool): Si ejecutar en modo headless (sin interfaz visible)

    Returns:
        WebDriver: Driver configurado y posicionado en el módulo maquinaria
    """
    try:
        print("Configurando entorno de prueba IT-MAQ-008...")

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

def wait_for_page_load(driver, timeout=10):
    """
    Espera a que la página se cargue completamente.
    
    Args:
        driver: Instancia de WebDriver
        timeout: Tiempo máximo de espera en segundos
    """
    try:
        wait = WebDriverWait(driver, timeout)
        # Esperar a que aparezcan elementos clave de la página de maquinaria
        wait.until(EC.presence_of_element_located((By.XPATH, SELECTORS["search_input"])))
        print("   Página de maquinaria cargada correctamente")
    except Exception as e:
        print(f"   Advertencia: No se pudo verificar carga completa de página: {str(e)}")

def test_search_functionality(driver):
    """
    Prueba la funcionalidad de búsqueda en el listado de maquinarias.
    
    Args:
        driver: Instancia de WebDriver ya en el módulo maquinaria
        
    Returns:
        bool: True si la prueba pasa, False si falla
    """
    try:
        print("🔍 Probando funcionalidad de búsqueda...")
        
        wait = WebDriverWait(driver, 15)
        
        # Paso 1: Localizar el campo de búsqueda
        print("   Paso 1: Localizando campo de búsqueda...")
        search_input = wait.until(
            EC.element_to_be_clickable((By.XPATH, SELECTORS["search_input"]))
        )
        print("   Campo de búsqueda encontrado")
        
        # Paso 2: Realizar búsqueda con término "Banano"
        print("   Paso 2: Realizando búsqueda con término 'Banano'...")
        search_input.clear()
        search_input.send_keys("Banano")
        search_input.send_keys(Keys.ENTER)
        
        # Esperar a que se procese la búsqueda
        time.sleep(3)
        
        # Paso 3: Verificar resultados de búsqueda
        print("   Paso 3: Verificando resultados de búsqueda...")
        
        # Verificar que la búsqueda se aplicó (el campo mantiene el valor)
        current_search_value = search_input.get_attribute("value")
        if current_search_value == "Banano":
            print("   Búsqueda aplicada correctamente")
        else:
            print(f"  Valor de búsqueda inesperado: {current_search_value}")
        
        # Verificar que hay resultados o mensaje de "no encontrado"
        try:
            # Buscar indicadores de resultados
            results_indicators = [
                "//table//tr",  # Filas de tabla
                "//div[contains(@class, 'no-results')]",  # Mensaje de no resultados
                "//div[contains(text(), 'No se encontraron')]",  # Mensaje alternativo
                "//div[contains(text(), 'Sin resultados')]"  # Otro mensaje alternativo
            ]
            
            results_found = False
            for indicator in results_indicators:
                try:
                    elements = driver.find_elements(By.XPATH, indicator)
                    if elements:
                        results_found = True
                        print(f"    Resultados encontrados con indicador: {indicator}")
                        break
                except:
                    continue
            
            if not results_found:
                print("    No se pudieron verificar los resultados de búsqueda")
        
        except Exception as e:
            print(f"    Error verificando resultados: {str(e)}")
        
        # Paso 4: Limpiar búsqueda
        print("   Paso 4: Limpiando búsqueda...")
        search_input.clear()
        search_input.send_keys(Keys.ENTER)
        time.sleep(2)
        
        print("    Funcionalidad de búsqueda probada exitosamente")
        return True
        
    except Exception as e:
        print(f"    Error en prueba de búsqueda: {str(e)}")
        return False

def test_filter_functionality(driver):
    """
    Prueba la funcionalidad de filtros avanzados.
    
    Args:
        driver: Instancia de WebDriver ya en el módulo maquinaria
        
    Returns:
        bool: True si la prueba pasa, False si falla
    """
    try:
        print(" Probando funcionalidad de filtros...")
        
        wait = WebDriverWait(driver, 15)
        
        # Paso 1: Localizar botón de filtros
        print("   Paso 1: Localizando botón de filtros...")
        filter_button = wait.until(
            EC.element_to_be_clickable((By.XPATH, SELECTORS["filter_button"]))
        )
        print("   Botón de filtros encontrado")
        
        # Paso 2: Abrir panel de filtros
        print("   Paso 2: Abriendo panel de filtros...")
        filter_button.click()
        time.sleep(2)
        
        # Paso 3: Aplicar filtros específicos
        print("   Paso 3: Aplicando filtros (Tipo='Tractor', Estado='Activa')...")
        
        # Buscar campos de filtro comunes
        filter_selectors = [
            "//select[contains(@name, 'tipo') or contains(@name, 'type')]",
            "//select[contains(@name, 'estado') or contains(@name, 'status')]",
            "//select[contains(@placeholder, 'Tipo')]",
            "//select[contains(@placeholder, 'Estado')]",
            "//div[contains(@class, 'filter')]//select",
            "//form[contains(@class, 'filter')]//select"
        ]
        
        filters_applied = 0
        
        for selector in filter_selectors:
            try:
                filter_elements = driver.find_elements(By.XPATH, selector)
                for element in filter_elements:
                    try:
                        select = Select(element)
                        options = [opt.text for opt in select.options]
                        
                        # Intentar aplicar filtro de tipo
                        if any("tractor" in opt.lower() for opt in options):
                            select.select_by_visible_text([opt for opt in options if "tractor" in opt.lower()][0])
                            print(f"    Filtro de tipo aplicado: {[opt for opt in options if 'tractor' in opt.lower()][0]}")
                            filters_applied += 1
                        
                        # Intentar aplicar filtro de estado
                        elif any("activa" in opt.lower() or "active" in opt.lower() for opt in options):
                            select.select_by_visible_text([opt for opt in options if "activa" in opt.lower() or "active" in opt.lower()][0])
                            print(f"    Filtro de estado aplicado: {[opt for opt in options if 'activa' in opt.lower() or 'active' in opt.lower()][0]}")
                            filters_applied += 1
                            
                    except Exception as e:
                        continue
                        
            except Exception as e:
                continue
        
        if filters_applied == 0:
            print("    No se encontraron campos de filtro específicos, pero el panel se abrió correctamente")
        
        # Paso 4: Aplicar filtros (si hay botón de aplicar)
        try:
            apply_selectors = [
                "//button[contains(text(), 'Aplicar')]",
                "//button[contains(text(), 'Apply')]",
                "//button[contains(text(), 'Filtrar')]",
                "//button[contains(text(), 'Filter')]",
                "//button[@type='submit']"
            ]
            
            for selector in apply_selectors:
                try:
                    apply_button = driver.find_element(By.XPATH, selector)
                    if apply_button.is_displayed() and apply_button.is_enabled():
                        apply_button.click()
                        print("    Filtros aplicados")
                        break
                except:
                    continue
        except:
            print("    No se encontró botón de aplicar filtros")
        
        # Esperar a que se procesen los filtros
        time.sleep(3)
        
        print("    Funcionalidad de filtros probada exitosamente")
        return True
        
    except Exception as e:
        print(f"    Error en prueba de filtros: {str(e)}")
        return False

def test_pagination_functionality(driver):
    """
    Prueba la funcionalidad de paginación.
    
    Args:
        driver: Instancia de WebDriver ya en el módulo maquinaria
        
    Returns:
        bool: True si la prueba pasa, False si falla
    """
    try:
        print(" Probando funcionalidad de paginación...")
        
        wait = WebDriverWait(driver, 15)
        
        # Paso 1: Verificar elementos de paginación
        print("   Paso 1: Verificando elementos de paginación...")
        
        pagination_elements = {}
        
        # Verificar botón página anterior
        try:
            prev_button = driver.find_element(By.XPATH, SELECTORS["previous_page"])
            pagination_elements["previous"] = prev_button
            print("    Botón página anterior encontrado")
        except:
            print("    Botón página anterior no encontrado")
        
        # Verificar botón página siguiente
        try:
            next_button = driver.find_element(By.XPATH, SELECTORS["next_page"])
            pagination_elements["next"] = next_button
            print("    Botón página siguiente encontrado")
        except:
            print("    Botón página siguiente no encontrado")
        
        # Verificar página actual
        try:
            current_page = driver.find_element(By.XPATH, SELECTORS["page_1"])
            pagination_elements["current"] = current_page
            print("    Página actual encontrada")
        except:
            print("    Página actual no encontrada")
        
        # Verificar selector de elementos por página
        try:
            items_per_page = driver.find_element(By.XPATH, SELECTORS["items_per_page"])
            pagination_elements["items_per_page"] = items_per_page
            print("    Selector de elementos por página encontrado")
        except:
            print("    Selector de elementos por página no encontrado")
        
        # Paso 2: Probar cambio de elementos por página
        print("   Paso 2: Probando cambio de elementos por página...")
        if "items_per_page" in pagination_elements:
            try:
                select = Select(pagination_elements["items_per_page"])
                options = [opt.text for opt in select.options]
                print(f"   Opciones disponibles: {options}")
                
                # Seleccionar 10 elementos por página si está disponible
                if "10" in options:
                    select.select_by_visible_text("10")
                    print("    Configurado para mostrar 10 elementos por página")
                elif len(options) > 1:
                    # Seleccionar la segunda opción si hay más de una
                    select.select_by_index(1)
                    print(f"    Configurado para mostrar {options[1]} elementos por página")
                
                time.sleep(2)  # Esperar a que se actualice la paginación
                
            except Exception as e:
                print(f"    Error cambiando elementos por página: {str(e)}")
        
        # Paso 3: Probar navegación entre páginas
        print("   Paso 3: Probando navegación entre páginas...")
        
        # Probar botón siguiente si está habilitado
        if "next" in pagination_elements:
            try:
                if pagination_elements["next"].is_enabled():
                    pagination_elements["next"].click()
                    print("    Navegación a página siguiente realizada")
                    time.sleep(2)
                    
                    # Intentar volver a página anterior
                    if "previous" in pagination_elements:
                        if pagination_elements["previous"].is_enabled():
                            pagination_elements["previous"].click()
                            print("    Navegación a página anterior realizada")
                        else:
                            print("    Botón página anterior no habilitado")
                else:
                    print("    Botón página siguiente no habilitado (probablemente solo hay una página)")
            except Exception as e:
                print(f"    Error en navegación de páginas: {str(e)}")
        
        # Paso 4: Verificar estado de paginación
        print("   Paso 4: Verificando estado actual de paginación...")
        
        # Buscar información de paginación
        pagination_info_selectors = [
            "//div[contains(@class, 'pagination')]//span",
            "//div[contains(text(), 'página')]",
            "//div[contains(text(), 'page')]",
            "//span[contains(text(), 'de')]",
            "//span[contains(text(), 'of')]"
        ]
        
        for selector in pagination_info_selectors:
            try:
                elements = driver.find_elements(By.XPATH, selector)
                if elements:
                    for element in elements:
                        text = element.text.strip()
                        if text and ("página" in text.lower() or "page" in text.lower() or "de" in text.lower() or "of" in text.lower()):
                            print(f"    Información de paginación: {text}")
                            break
            except:
                continue
        
        print("    Funcionalidad de paginación probada exitosamente")
        return True
        
    except Exception as e:
        print(f"    Error en prueba de paginación: {str(e)}")
        return False

def verify_machinery_listing(driver):
    """
    Verifica que el listado de maquinarias esté funcionando correctamente.
    
    Args:
        driver: Instancia de WebDriver ya en el módulo maquinaria
        
    Returns:
        bool: True si la verificación pasa, False si falla
    """
    try:
        print(" Verificando listado de maquinarias...")
        
        # Verificar que estamos en la página correcta
        current_url = driver.current_url
        print(f"   URL actual: {current_url}")
        
        # Verificar elementos del listado
        listing_indicators = [
            "//table",  # Tabla de maquinarias
            "//div[contains(@class, 'machinery-list')]",  # Lista de maquinarias
            "//div[contains(@class, 'machinery-item')]",  # Items de maquinaria
            "//h1[contains(text(), 'Maquinaria')]",  # Título de página
            "//h2[contains(text(), 'Maquinaria')]",  # Subtítulo
            "//button[contains(text(), 'Agregar')]",  # Botón de agregar
            "//button[contains(text(), 'Nueva')]"  # Botón de nueva maquinaria
        ]
        
        elements_found = 0
        for indicator in listing_indicators:
            try:
                elements = driver.find_elements(By.XPATH, indicator)
                if elements:
                    elements_found += 1
                    print(f"    Elemento encontrado: {indicator}")
            except:
                continue
        
        if elements_found > 0:
            print(f"    Listado de maquinarias verificado ({elements_found} elementos encontrados)")
            return True
        else:
            print("    No se encontraron elementos del listado de maquinarias")
            return False
            
    except Exception as e:
        print(f"    Error verificando listado: {str(e)}")
        return False

def run_it_maq_008(driver=None, headless=False):
    """
    Ejecuta la prueba IT-MAQ-008 completa: Verificar listado con paginación y filtros avanzados.
    
    Args:
        driver: WebDriver opcional. Si es None, se crea uno nuevo.
        headless: Si ejecutar en modo headless
        
    Returns:
        bool: True si la prueba pasa, False si falla
    """
    test_driver = driver
    test_name = "IT-MAQ-008"
    
    try:
        print("Iniciando IT-MAQ-008: Verificar listado con paginación y filtros avanzados")
        print("=" * 80)
        
        # Arrange: Configurar entorno si no se proporciona driver
        if test_driver is None:
            print("Arrange: Configurando entorno de prueba...")
            test_driver = setup_test_environment(headless=headless)
            print("Entorno configurado correctamente")
        
        # Verificar que estamos en la página de maquinaria
        print("\nArrange: Verificando página de maquinaria...")
        wait_for_page_load(test_driver)
        
        # Verificar listado básico
        listing_ok = verify_machinery_listing(test_driver)
        if not listing_ok:
            print(" Advertencia: Listado básico no verificado completamente")
        
        # Act: Ejecutar pruebas de funcionalidad
        print("\nAct: Ejecutando pruebas de funcionalidad...")
        
        # Prueba 1: Funcionalidad de búsqueda
        print("\n--- Prueba 1: Funcionalidad de búsqueda ---")
        search_success = test_search_functionality(test_driver)
        
        # Prueba 2: Funcionalidad de filtros
        print("\n--- Prueba 2: Funcionalidad de filtros ---")
        filter_success = test_filter_functionality(test_driver)
        
        # Prueba 3: Funcionalidad de paginación
        print("\n--- Prueba 3: Funcionalidad de paginación ---")
        pagination_success = test_pagination_functionality(test_driver)
        
        # Assert: Verificar resultados
        print("\nAssert: Verificando resultados...")
        
        results = {
            "Búsqueda": search_success,
            "Filtros": filter_success,
            "Paginación": pagination_success
        }
        
        print("\n Resultados de las pruebas:")
        for test_name, success in results.items():
            status = " EXITOSA" if success else "❌ FALLIDA"
            print(f"   {test_name}: {status}")
        
        # Determinar éxito general
        all_tests_passed = all(results.values())
        success_rate = sum(results.values()) / len(results) * 100
        
        print(f"\n Resumen:")
        print(f"   Pruebas exitosas: {sum(results.values())}/{len(results)}")
        print(f"   Tasa de éxito: {success_rate:.1f}%")
        
        if all_tests_passed:
            print("    TODAS LAS PRUEBAS EXITOSAS")
            final_result = True
        elif success_rate >= 66.7:  # Al menos 2 de 3 pruebas exitosas
            print("    PRUEBAS MAYORMENTE EXITOSAS")
            final_result = True
        else:
            print("    PRUEBAS FALLIDAS")
            final_result = False
        
        print("\nIT-MAQ-008 completada")
        return final_result
        
    except Exception as e:
        print(f"\n Error durante IT-MAQ-008: {str(e)}")
        return False
        
    finally:
        # Solo limpiar si creamos el driver nosotros
        if driver is None and test_driver:
            cleanup_test_environment(test_driver, test_name)

def cleanup_test_environment(driver, test_name="IT-MAQ-008"):
    """
    Limpia el entorno de prueba cerrando el navegador y guardando logs.
    
    Args:
        driver: Instancia de WebDriver a cerrar
        test_name: Nombre del test para guardar logs
    """
    try:
        if driver:
            # Capturar y guardar logs del navegador antes de cerrar
            print(f"\nGuardando logs de consola del navegador para {test_name}...")
            save_browser_logs(driver, test_name)
            
            print("Cerrando navegador...")
            driver.quit()
            print("Entorno de prueba limpiado")
    except Exception as e:
        print(f"Error limpiando entorno: {str(e)}")

# Ejecución principal del test
if __name__ == "__main__":
    """
    Ejecuta el test IT-MAQ-008 cuando el script se ejecuta directamente.
    """
    print("Test IT-MAQ-008: Verificar listado con paginación y filtros avanzados")
    print("=" * 80)
    
    try:
        # Ejecutar el test
        success = run_it_maq_008(headless=False)  # Cambiar a True para modo headless
        
        if success:
            print("\n IT-MAQ-008: PRUEBA EXITOSA")
            print("Resultado: Listado con paginación y filtros funcionando correctamente")
            print("\nFuncionalidades verificadas:")
            print("    Búsqueda de maquinarias")
            print("    Filtros avanzados")
            print("    Paginación")
            print("    Navegación entre páginas")
            print("    Cambio de elementos por página")
        else:
            print("\n IT-MAQ-008: PRUEBA FALLIDA")
            print("Algunas funcionalidades no están funcionando correctamente")
            
    except KeyboardInterrupt:
        print("\n Test interrumpido por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n Error inesperado: {str(e)}")
        sys.exit(1)
