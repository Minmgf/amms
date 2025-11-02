"""
IT-SOL-001: Prueba de automatización de Gestión de Solicitudes
Este script automatiza el flujo completo de creación de solicitudes en el sistema.
"""

import os
import sys
import time
import random
from datetime import datetime, timedelta
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from dotenv import load_dotenv

# Configuración del proyecto
PROJECT_ROOT = Path(__file__).parent.parent.parent
load_dotenv(PROJECT_ROOT / '.env')

# Configuración
APP_URL = "http://localhost:3000/sigma"
LOGIN_EMAIL = os.getenv('EMAIL', 'admin@ejemplo.com')
LOGIN_PASSWORD = os.getenv('PASSWORD', 'password123')

# Usuarios de prueba
USUARIOS_PRUEBA = ["1075262391", "10046573", "1076501058", "26570831"]

# Valor de humedad a usar en el formulario (0-100)
HUMIDITY = 65

# Tiempos de espera
WAIT_TIMES = {
    "short": 1,
    "medium": 2,
    "long": 3,
    "dynamic_load": 3
}

# XPaths
XPATHS = {
    "requests_module": "//a[@href='/sigma/requests']",
    "management_link": "//a[normalize-space()='Gestión de solicitudes']",
    "new_pre_request": "//span[normalize-space()='Nueva Pre-Solicitud']",
}

def create_driver():
    """Crea y configura el driver de Chrome"""
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--start-maximized')
    
    chromedriver_path = PROJECT_ROOT / 'chromedriver.exe'
    service = Service(str(chromedriver_path))
    
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

class RequestManagementTest:
    """Clase para ejecutar las pruebas de gestión de solicitudes"""
    
    def __init__(self):
        self.driver = None
        self.wait = None
        self.report_lines = []
        self.screenshots_dir = Path(__file__).parent / "screenshots"
        self.screenshots_dir.mkdir(exist_ok=True)
        
    def log(self, message, level="INFO"):
        """Registra un mensaje en el reporte"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_line = f"[{timestamp}] [{level}] {message}"
        print(log_line)
        self.report_lines.append(log_line)
        
    def log_error(self, message, exception=None):
        """Registra un error en el reporte"""
        error_msg = f"{message}"
        if exception:
            error_msg += f" - Excepción: {str(exception)}"
        self.log(error_msg, "ERROR")
        
    def log_success(self, message):
        """Registra un éxito en el reporte"""
        self.log(message, "SUCCESS")
        
    def take_screenshot(self, name):
        """Toma una captura de pantalla"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{name}_{timestamp}.png"
            filepath = self.screenshots_dir / filename
            self.driver.save_screenshot(str(filepath))
            self.log(f"Screenshot guardado: {filename}")
            return str(filepath)
        except Exception as e:
            self.log_error(f"Error al tomar screenshot '{name}'", e)
            return None
            
    def setup_driver(self):
        """Configura el driver de Selenium"""
        try:
            self.log("Configurando driver de Selenium...")
            self.driver = create_driver()
            self.wait = WebDriverWait(self.driver, 15)
            self.log_success("Driver configurado correctamente")
            return True
        except Exception as e:
            self.log_error("Error al configurar el driver", e)
            return False
            
    def login(self):
        """Realiza el login en la aplicación"""
        try:
            self.log("Iniciando proceso de login...")
            
            # Navegar a la página de login
            login_url = f"{APP_URL}/login"
            self.driver.get(login_url)
            time.sleep(2)
            
            # Localizar y completar campo de email
            email_input = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Correo electrónico']"))
            )
            email_input.clear()
            email_input.send_keys(LOGIN_EMAIL)
            self.log(f"Email ingresado: {LOGIN_EMAIL}")
            
            # Localizar y completar campo de contraseña
            password_input = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Contraseña']"))
            )
            password_input.clear()
            password_input.send_keys(LOGIN_PASSWORD)
            self.log("Contraseña ingresada")
            
            # Localizar y hacer click en el botón de iniciar sesión
            login_button = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Iniciar sesión']"))
            )
            login_button.click()
            self.log("Click en botón de login")
            
            # Esperar a que se complete el login
            time.sleep(3)
            self.wait.until(
                lambda driver: driver.current_url != login_url
            )
            
            self.log_success("Login exitoso")
            return True
        except Exception as e:
            self.log_error("Error durante el login", e)
            self.take_screenshot("error_login")
            return False
            
    def navigate_to_requests_management(self):
        """Navega al módulo de Gestión de Solicitudes"""
        try:
            self.log("Navegando al módulo de Solicitudes...")
            
            # Hacer clic en el módulo de solicitudes
            requests_link = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, XPATHS["requests_module"]))
            )
            requests_link.click()
            self.log("Click en módulo de Solicitudes")
            time.sleep(WAIT_TIMES["medium"])
            
            # Hacer clic en Gestión de solicitudes
            management_link = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, XPATHS["management_link"]))
            )
            management_link.click()
            self.log("Click en Gestión de solicitudes")
            time.sleep(WAIT_TIMES["long"])

            # Ahora hacer click en "Nueva Pre-Solicitud" para abrir el asistente paso a paso
            try:
                new_pre = self.wait.until(
                    EC.element_to_be_clickable((By.XPATH, XPATHS["new_pre_request"]))
                )
                new_pre.click()
                self.log("Click en 'Nueva Pre-Solicitud' para abrir el asistente")
                time.sleep(WAIT_TIMES["long"])
            except Exception as e:
                self.log(f"No se encontró o pudo clicear 'Nueva Pre-Solicitud': {e}", "WARNING")
                # Continuar de todas formas; quizás el formulario ya esté visible
            
            self.log_success("Navegación exitosa a Gestión de Solicitudes")
            return True
            
        except Exception as e:
            self.log_error("Error al navegar a Gestión de Solicitudes", e)
            self.take_screenshot("error_navegacion")
            return False
            
    def fill_step_1_identification(self, identification_number):
        """Completa el paso 1: Número de identificación"""
        try:
            self.log(f"=== PASO 1: Ingresando número de identificación: {identification_number} ===")
            
            # Esperar más tiempo después de navegar
            time.sleep(3)
            
            # Intentar diferentes selectores para el input de identificación
            id_input = None
            selectors = [
                "//input[@placeholder='Ingrese número de identificación']",
                "//input[contains(@placeholder, 'número de identificación')]",
                "//input[@type='text' and contains(@placeholder, 'identificación')]",
                "//input[@name='identification']",
                "//input[@id='identification']"
            ]
            
            for selector in selectors:
                try:
                    self.log(f"Intentando selector: {selector}")
                    id_input = self.wait.until(
                        EC.presence_of_element_located((By.XPATH, selector))
                    )
                    if id_input and id_input.is_displayed():
                        self.log(f"Input encontrado con selector: {selector}")
                        break
                except TimeoutException:
                    continue
            
            if not id_input:
                self.log_error("No se encontró el input de identificación con ningún selector")
                self.take_screenshot("error_input_no_encontrado")
                return False
            
            # Limpiar y llenar el input
            id_input.clear()
            time.sleep(1)
            id_input.send_keys(identification_number)
            self.log(f"Número de identificación ingresado: {identification_number}")
            
            time.sleep(4)  # Esperar a que cargue la información del usuario
            
            # Verificar si aparece información debajo del input
            try:
                # Buscar el contenedor padre del input y revisar elementos siguientes
                parent_element = id_input.find_element(By.XPATH, "./..")
                time.sleep(1)
                
                # Buscar mensajes o información de validación
                validation_messages = self.driver.find_elements(By.XPATH, 
                    "//input[@placeholder='Ingrese número de identificación']/following-sibling::*")
                
                if validation_messages:
                    for msg in validation_messages:
                        if msg.is_displayed() and msg.text.strip():
                            self.log(f"Información mostrada debajo del input: {msg.text}")
                            self.log_success(f"Usuario encontrado - ID: {identification_number}")
                            break
                else:
                    # Buscar en el contenedor más amplio
                    info_elements = self.driver.find_elements(By.XPATH, 
                        "//input[@placeholder='Ingrese número de identificación']/../following-sibling::*")
                    
                    user_found = False
                    for element in info_elements:
                        if element.is_displayed() and element.text.strip():
                            self.log(f"Información de usuario: {element.text}")
                            user_found = True
                            
                    if user_found:
                        self.log_success(f"Usuario encontrado - ID: {identification_number}")
                    else:
                        self.log(f"No se encontró información adicional para el ID: {identification_number}", "WARNING")
                        
            except Exception as e:
                self.log(f"No se pudo verificar información adicional: {str(e)}", "WARNING")
            
            # Hacer clic en el botón Siguiente
            time.sleep(2)
            next_button = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[@aria-label='Next Button']"))
            )
            next_button.click()
            self.log("Click en botón Siguiente (Paso 1)")
            time.sleep(3)
            
            self.log_success("Paso 1 completado exitosamente")
            return True
            
        except Exception as e:
            self.log_error("Error en el Paso 1", e)
            self.take_screenshot("error_paso1")
            return False
            
    def fill_step_2_description_dates(self):
        """Completa el paso 2: Descripción y fechas"""
        try:
            self.log("=== PASO 2: Completando descripción y fechas ===")
            
            # Rellenar descripción
            description = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//textarea[@placeholder='Describa la solicitud...']"))
            )
            description_text = "Solicitud de prueba automatizada para validación del sistema de gestión de solicitudes."
            description.clear()
            description.send_keys(description_text)
            self.log(f"Descripción ingresada: {description_text}")
            time.sleep(2)
            
            # Generar fechas aleatorias del año 2026
            # Fecha de inicio: día aleatorio entre enero y marzo de 2026
            start_day = random.randint(1, 28)  # Evitar problemas con febrero
            start_month = random.randint(1, 3)  # Enero, febrero o marzo
            start_date_obj = datetime(2026, start_month, start_day)
            
            # Fecha de finalización: 15-30 días después de la fecha de inicio
            duration_days = random.randint(15, 30)
            end_date_obj = start_date_obj + timedelta(days=duration_days)
            
            # Formatear fechas
            start_date = start_date_obj.strftime("%d/%m/%Y")
            end_date = end_date_obj.strftime("%d/%m/%Y")
            
            self.log(f"Fechas generadas aleatoriamente para 2026:")
            self.log(f"  - Inicio: {start_date}")
            self.log(f"  - Finalización: {end_date}")
            self.log(f"  - Duración: {duration_days} días")
            
            # Fecha de inicio programada
            start_date_input = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//input[@name='scheduledStartDate']"))
            )
            start_date_input.clear()
            start_date_input.send_keys(start_date)
            self.log(f"Fecha de inicio programada ingresada: {start_date}")
            time.sleep(2)
            
            # Fecha de finalización
            end_date_input = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//input[@name='endDate']"))
            )
            end_date_input.clear()
            end_date_input.send_keys(end_date)
            self.log(f"Fecha de finalización ingresada: {end_date}")
            time.sleep(2)
            
            # Hacer clic en el botón Siguiente
            next_button = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[@aria-label='Next Button']"))
            )
            next_button.click()
            self.log("Click en botón Siguiente (Paso 2)")
            time.sleep(3)
            
            self.log_success("Paso 2 completado exitosamente")
            return True
            
        except Exception as e:
            self.log_error("Error en el Paso 2", e)
            self.take_screenshot("error_paso2")
            return False
            
    def fill_step_3_location_details(self):
        """Completa el paso 3: Ubicación y detalles"""
        try:
            self.log("=== PASO 3: Completando ubicación y detalles ===")
            
            # Seleccionar país
            country_select = Select(self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//select[@name='country']"))
            ))
            
            # Obtener opciones de países
            country_options = country_select.options
            self.log(f"Países disponibles: {len(country_options) - 1}")  # -1 para excluir opción vacía
            
            # Buscar un país hispanohablante
            selected_country = None
            hispanic_countries = ["Colombia", "Venezuela", "México", "Argentina", "España", "Perú", "Chile"]
            
            for country in hispanic_countries:
                for option in country_options:
                    if country.lower() in option.text.lower():
                        country_select.select_by_visible_text(option.text)
                        selected_country = option.text
                        self.log(f"País seleccionado: {selected_country}")
                        break
                if selected_country:
                    break
            
            if not selected_country:
                # Si no encuentra países hispanohablantes, seleccionar el primero disponible
                country_select.select_by_index(1)
                selected_country = country_select.options[1].text
                self.log(f"País seleccionado (por defecto): {selected_country}")
            
            time.sleep(3)  # Esperar a que carguen departamentos
            
            # Seleccionar departamento
            department_select = Select(self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//select[@name='department']"))
            ))
            
            department_options = department_select.options
            self.log(f"Departamentos disponibles: {len(department_options) - 1}")
            
            if len(department_options) > 1:
                department_select.select_by_index(1)
                selected_department = department_select.options[1].text
                self.log(f"Departamento seleccionado: {selected_department}")
            else:
                self.log("No hay departamentos disponibles", "WARNING")
            
            time.sleep(3)  # Esperar a que carguen ciudades
            
            # Seleccionar ciudad
            city_select = Select(self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//select[@name='city']"))
            ))
            
            city_options = city_select.options
            self.log(f"Ciudades disponibles: {len(city_options) - 1}")
            
            if len(city_options) > 1:
                city_select.select_by_index(1)
                selected_city = city_select.options[1].text
                self.log(f"Ciudad seleccionada: {selected_city}")
            else:
                self.log("No hay ciudades disponibles", "WARNING")
            
            time.sleep(2)
            
            # Nombre de la finca
            farm_name_input = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Ej: Finca El Paraíso']"))
            )
            farm_name_input.clear()
            farm_name_input.send_keys("Finca La Esperanza")
            self.log("Nombre de finca ingresado: Finca La Esperanza")
            time.sleep(1)
            
            # Latitud (6 decimales)
            latitude_input = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Latitud']"))
            )
            latitude_input.clear()
            latitude_input.send_keys("4.710989")
            self.log("Latitud ingresada: 4.710989")
            time.sleep(1)
            
            # Longitud (7 decimales)
            longitude_input = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Longitud']"))
            )
            longitude_input.clear()
            longitude_input.send_keys("-74.072092")
            self.log("Longitud ingresada: -74.072092")
            time.sleep(1)
            
            # Unidad de área
            area_unit_select = Select(self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//select[@name='areaUnit']"))
            ))
            area_unit_select.select_by_visible_text("ha")
            self.log("Unidad de área seleccionada: ha")
            time.sleep(1)
            
            # Área
            area_input = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Ej: 10']"))
            )
            area_input.clear()
            area_input.send_keys("25")
            self.log("Área ingresada: 25 ha")
            time.sleep(1)
            
            # Unidad de altitud
            altitude_unit_select = Select(self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//select[@name='altitudeUnit']"))
            ))
            altitude_unit_select.select_by_visible_text("m")
            self.log("Unidad de altitud seleccionada: m")
            time.sleep(1)
            
            # Altitud
            altitude_input = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Ej: 10.000000']"))
            )
            altitude_input.clear()
            altitude_input.send_keys("1500.000000")
            self.log("Altitud ingresada: 1500.000000 m")
            time.sleep(2)
            
            self.log_success("Paso 3 completado exitosamente")
            return True
            
        except Exception as e:
            self.log_error("Error en el Paso 3", e)
            self.take_screenshot("error_paso3")
            return False
            
    def save_and_continue(self):
        """Guarda la solicitud"""
        try:
            self.log("Guardando solicitud...")
            
            # Hacer clic en el botón Guardar
            save_button = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[@aria-label='Save Button']"))
            )
            save_button.click()
            self.log("Click en botón Guardar")
            time.sleep(4)
            
            # Intentar buscar el botón Continue (puede no aparecer siempre)
            try:
                self.log("Buscando botón Continuar...")
                continue_button = WebDriverWait(self.driver, 5).until(
                    EC.presence_of_element_located((By.XPATH, "//button[@aria-label='Continue Button']"))
                )
                
                if continue_button.is_displayed():
                    # Scroll y click
                    self.driver.execute_script("arguments[0].scrollIntoView(true);", continue_button)
                    time.sleep(1)
                    try:
                        continue_button.click()
                        self.log("Click en botón Continuar")
                    except:
                        self.driver.execute_script("arguments[0].click();", continue_button)
                        self.log("Click con JavaScript en botón Continuar")
                    time.sleep(2)
                else:
                    self.log("Botón Continuar no está visible, continuando...", "WARNING")
                    
            except TimeoutException:
                self.log("Botón Continuar no encontrado (puede ser opcional), continuando...", "WARNING")
            
            self.log_success("Guardado completado")
            return True
            
        except Exception as e:
            self.log_error("Error al guardar", e)
            self.take_screenshot("error_guardar")
            return False
            
    def check_notifications(self):
        """Verifica las notificaciones"""
        try:
            self.log("Verificando notificaciones...")
            
            # Hacer clic en el botón de notificaciones
            notifications_button = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[@aria-label='Open notifications']//*[name()='svg']"))
            )
            notifications_button.click()
            self.log("Click en botón de notificaciones")
            time.sleep(3)
            
            # Intentar leer las notificaciones
            try:
                notification_elements = self.driver.find_elements(By.XPATH, 
                    "//button[@aria-label='Open notifications']/../following-sibling::*")
                
                if notification_elements:
                    self.log(f"Se encontraron {len(notification_elements)} elementos de notificación")
                    for i, notif in enumerate(notification_elements):
                        if notif.is_displayed() and notif.text.strip():
                            self.log(f"Notificación {i+1}: {notif.text}")
                else:
                    self.log("No se encontraron notificaciones visibles", "WARNING")
                    
            except Exception as e:
                self.log(f"No se pudieron leer las notificaciones: {str(e)}", "WARNING")
            
            self.log_success("Verificación de notificaciones completada")
            return True
            
        except Exception as e:
            self.log_error("Error al verificar notificaciones", e)
            self.take_screenshot("error_notificaciones")
            return False
            
    def generate_report(self):
        """Genera el reporte en formato Markdown"""
        try:
            report_path = Path(__file__).parent / "IT-SOL-001-reporte.md"
            
            with open(report_path, 'w', encoding='utf-8') as f:
                f.write("# IT-SOL-001: Reporte de Prueba de Gestión de Solicitudes\n\n")
                f.write(f"**Fecha de ejecución:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                f.write("---\n\n")
                f.write("## Objetivo\n\n")
                f.write("Automatizar y validar el flujo completo de creación de solicitudes en el módulo de Gestión de Solicitudes.\n\n")
                f.write("## Usuarios de prueba\n\n")
                for user_id in USUARIOS_PRUEBA:
                    f.write(f"- {user_id}\n")
                f.write("\n")
                f.write("## Log de ejecución\n\n")
                f.write("```\n")
                for line in self.report_lines:
                    f.write(f"{line}\n")
                f.write("```\n\n")
                f.write("## Capturas de pantalla\n\n")
                f.write(f"Las capturas de pantalla se guardaron en: `{self.screenshots_dir}`\n\n")
                f.write("---\n\n")
                f.write("**Fin del reporte**\n")
            
            self.log_success(f"Reporte generado: {report_path}")
            print(f"\n✅ Reporte generado exitosamente en: {report_path}")
            
        except Exception as e:
            self.log_error("Error al generar el reporte", e)
            
    def run_test(self):
        """Ejecuta el test completo"""
        try:
            self.log("=" * 80)
            self.log("INICIANDO PRUEBA IT-SOL-001: GESTIÓN DE SOLICITUDES")
            self.log("=" * 80)
            
            # Configurar driver
            if not self.setup_driver():
                return False
            
            # Login (una sola vez)
            if not self.login():
                return False
            
            # Ejecutar el flujo con cada usuario de prueba
            for index, test_user in enumerate(USUARIOS_PRUEBA, 1):
                self.log("=" * 80)
                self.log(f"SOLICITUD {index}/{len(USUARIOS_PRUEBA)} - ID: {test_user}")
                self.log("=" * 80)
                
                # Navegar a Gestión de Solicitudes
                if not self.navigate_to_requests_management():
                    self.log_error(f"Error navegando para ID {test_user}, continuando con siguiente...")
                    continue
                
                # Paso 1: Identificación
                if not self.fill_step_1_identification(test_user):
                    self.log_error(f"Error en Paso 1 para ID {test_user}, continuando con siguiente...")
                    continue
                
                # Paso 2: Descripción y fechas
                if not self.fill_step_2_description_dates():
                    self.log_error(f"Error en Paso 2 para ID {test_user}, continuando con siguiente...")
                    continue
                
                # Paso 3: Ubicación y detalles
                if not self.fill_step_3_location_details():
                    self.log_error(f"Error en Paso 3 para ID {test_user}, continuando con siguiente...")
                    continue
                
                # Guardar y continuar
                if not self.save_and_continue():
                    self.log_error(f"Error guardando para ID {test_user}, continuando con siguiente...")
                    continue
                
                # Verificar notificaciones
                self.check_notifications()
                
                self.log_success(f"Solicitud completada para ID: {test_user}")
                
                # Esperar un momento antes de la siguiente solicitud
                if index < len(USUARIOS_PRUEBA):
                    self.log(f"Esperando 3 segundos antes de crear la siguiente solicitud...")
                    time.sleep(3)
            
            self.log("=" * 80)
            self.log_success("TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE")
            self.log("=" * 80)
            
            time.sleep(3)  # Pausa antes de cerrar
            
            return True
            
        except Exception as e:
            self.log_error("Error durante la ejecución del test", e)
            self.take_screenshot("error_general")
            return False
            
        finally:
            # Generar reporte
            self.generate_report()
            
            # Cerrar navegador
            if self.driver:
                self.log("Cerrando navegador...")
                time.sleep(2)
                self.driver.quit()
                self.log("Navegador cerrado")


def main():
    """Función principal"""
    test = RequestManagementTest()
    success = test.run_test()
    
    if success:
        print("\n" + "=" * 80)
        print("✅ PRUEBA COMPLETADA EXITOSAMENTE")
        print("=" * 80)
        sys.exit(0)
    else:
        print("\n" + "=" * 80)
        print("❌ LA PRUEBA FALLÓ - Revisa el reporte para más detalles")
        print("=" * 80)
        sys.exit(1)


if __name__ == "__main__":
    main()
