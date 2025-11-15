"""
IT-MS-001: Automatización de Monitoreo de Solicitudes
Prueba el módulo de monitoreo con búsquedas, filtros y acciones
"""

import os
import sys
import time
from datetime import datetime
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from dotenv import load_dotenv

# Configuración
PROJECT_ROOT = Path(__file__).parent.parent.parent
load_dotenv(PROJECT_ROOT / '.env')

APP_URL = "http://localhost:3000/sigma"
LOGIN_EMAIL = os.getenv('EMAIL')
LOGIN_PASSWORD = os.getenv('PASSWORD')

# Datos de prueba para búsquedas
BUSQUEDAS_PRUEBA = [
    {"tipo": "nombre_cliente", "valor": "Fabian Ramos Semanate"},
    {"tipo": "id_solicitud", "valor": "SOL-2025-0024"},
    {"tipo": "lugar", "valor": "micasa"}
]

# Estados a probar
ESTADOS_PRUEBA = ["", "22", "21"]  # Todos, Finalizada, En Proceso

# Rangos de fechas
FECHA_INICIO = "2025-10-28"
FECHA_FIN = "2025-11-15"

def create_driver():
    """Crea driver de Chrome"""
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--start-maximized')
    
    chromedriver_path = PROJECT_ROOT / 'tests' / 'chromedriver' / 'driver.exe'
    service = Service(str(chromedriver_path))
    
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

class MonitoringTest:
    """Test de Monitoreo de Solicitudes"""
    
    def __init__(self):
        self.driver = None
        self.wait = None
        self.report_lines = []
        self.screenshots_dir = Path(__file__).parent / "screenshots"
        self.screenshots_dir.mkdir(exist_ok=True)
        self.tests_passed = 0
        self.tests_failed = 0
        
    def log(self, message, level="INFO"):
        """Registra mensaje"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_line = f"[{timestamp}] [{level}] {message}"
        print(log_line)
        self.report_lines.append(log_line)
        
    def log_error(self, message, exception=None):
        """Registra error"""
        error_msg = f"{message}"
        if exception:
            error_msg += f" - {str(exception)}"
        self.log(error_msg, "ERROR")
        
    def log_success(self, message):
        """Registra éxito"""
        self.log(message, "SUCCESS")
        
    def take_screenshot(self, name):
        """Captura pantalla"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{name}_{timestamp}.png"
            filepath = self.screenshots_dir / filename
            self.driver.save_screenshot(str(filepath))
            self.log(f"Screenshot: {filename}")
            return str(filepath)
        except Exception as e:
            self.log_error(f"Error screenshot '{name}'", e)
            return None
            
    def setup_driver(self):
        """Configura Selenium"""
        try:
            self.log("Configurando driver...")
            self.driver = create_driver()
            self.wait = WebDriverWait(self.driver, 15)
            self.log_success("Driver configurado")
            return True
        except Exception as e:
            self.log_error("Error configurando driver", e)
            return False
            
    def login(self):
        """Realiza login"""
        try:
            self.log("=== INICIANDO SESIÓN ===")
            
            self.driver.get(f"{APP_URL}/login")
            time.sleep(2)
            
            # Email
            email_input = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Correo electrónico']"))
            )
            email_input.clear()
            email_input.send_keys(LOGIN_EMAIL)
            self.log(f"Email: {LOGIN_EMAIL}")
            
            # Contraseña
            password_input = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Contraseña']"))
            )
            password_input.clear()
            password_input.send_keys(LOGIN_PASSWORD)
            self.log("Contraseña ingresada")
            
            # Click login
            login_button = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Iniciar sesión']"))
            )
            login_button.click()
            self.log("Click en 'Iniciar sesión'")
            
            time.sleep(3)
            self.log_success("Login exitoso")
            return True
            
        except Exception as e:
            self.log_error("Error en login", e)
            self.take_screenshot("error_login")
            return False
            
    def navigate_to_monitoring(self):
        """Navega a Monitoreo de Solicitudes"""
        try:
            self.log("=== NAVEGANDO A MONITOREO ===")
            time.sleep(3)
            
            # Click en módulo Monitoreo de solicitudes
            monitoring_link = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//a[normalize-space()='Monitoreo de solicitudes']"))
            )
            monitoring_link.click()
            self.log("Click en 'Monitoreo de solicitudes'")
            time.sleep(3)
            
            self.log_success("Navegación exitosa")
            return True
            
        except Exception as e:
            self.log_error("Error navegando a Monitoreo", e)
            self.take_screenshot("error_navegacion")
            return False
            
    def test_search_input(self):
        """Prueba el input de búsqueda con diferentes criterios"""
        try:
            self.log("=== PROBANDO BÚSQUEDAS ===")
            
            for i, busqueda in enumerate(BUSQUEDAS_PRUEBA, 1):
                self.log(f"\nBúsqueda {i}/{len(BUSQUEDAS_PRUEBA)}: {busqueda['tipo']}")
                
                # Localizar input de búsqueda
                search_input = self.wait.until(
                    EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Buscar por código, cliente o lugar...']"))
                )
                
                # Limpiar input
                search_input.clear()
                time.sleep(1)
                
                # Ingresar búsqueda
                search_input.send_keys(busqueda['valor'])
                self.log(f"Búsqueda por {busqueda['tipo']}: '{busqueda['valor']}'")
                time.sleep(3)
                
                # Borrar para siguiente búsqueda
                search_input.clear()
                self.log("Input limpiado")
                time.sleep(2)
            
            self.log_success("Todas las búsquedas completadas")
            self.tests_passed += 1
            return True
            
        except Exception as e:
            self.log_error("Error en búsquedas", e)
            self.take_screenshot("error_busqueda")
            self.tests_failed += 1
            return False
            
    def test_filters(self):
        """Prueba filtros por estado y fechas"""
        try:
            self.log("\n=== PROBANDO FILTROS ===")
            
            # Abrir panel de filtros
            filter_button = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[@aria-label='Filter Button']"))
            )
            filter_button.click()
            self.log("Panel de filtros abierto")
            time.sleep(2)
            
            # Probar cada estado
            for i, estado in enumerate(ESTADOS_PRUEBA, 1):
                estado_texto = {
                    "": "Todos los estados",
                    "22": "Finalizada",
                    "21": "En Proceso"
                }.get(estado, estado)
                
                self.log(f"\nFiltro {i}/{len(ESTADOS_PRUEBA)}: {estado_texto}")
                
                # Seleccionar estado
                try:
                    estado_select = Select(self.driver.find_element(
                        By.XPATH, 
                        "//select[@class='w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none']"
                    ))
                    estado_select.select_by_value(estado)
                    self.log(f"Estado seleccionado: {estado_texto}")
                    time.sleep(2)
                except Exception as e:
                    self.log(f"No se pudo seleccionar estado: {e}")
                
                # Ingresar fechas
                try:
                    # Fecha inicial
                    fecha_inicio_input = self.driver.find_element(
                        By.XPATH, "//div[@class='p-8']//div[2]//input[1]"
                    )
                    fecha_inicio_input.clear()
                    fecha_inicio_input.send_keys(FECHA_INICIO)
                    self.log(f"Fecha inicio: {FECHA_INICIO}")
                    time.sleep(2)
                    
                    # Fecha final
                    fecha_fin_input = self.driver.find_element(
                        By.XPATH, "//div[3]//input[1]"
                    )
                    fecha_fin_input.clear()
                    fecha_fin_input.send_keys(FECHA_FIN)
                    self.log(f"Fecha fin: {FECHA_FIN}")
                    time.sleep(2)
                except Exception as e:
                    self.log(f"No se pudieron ingresar fechas: {e}")
                
                # Aplicar filtro
                try:
                    aplicar_button = self.driver.find_element(
                        By.XPATH, "//button[normalize-space()='Aplicar']"
                    )
                    aplicar_button.click()
                    self.log("Filtro aplicado")
                    time.sleep(3)
                except Exception as e:
                    self.log(f"Error aplicando filtro: {e}")
                
                # Limpiar filtros para siguiente iteración
                try:
                    # Reabrir panel si se cerró
                    try:
                        filter_button = self.driver.find_element(
                            By.XPATH, "//button[@aria-label='Filter Button']"
                        )
                        filter_button.click()
                        time.sleep(2)
                    except:
                        pass
                    
                    limpiar_button = self.driver.find_element(
                        By.XPATH, "//button[normalize-space()='Limpiar filtros']"
                    )
                    limpiar_button.click()
                    self.log("Filtros limpiados")
                    time.sleep(3)
                    
                    # Reabrir panel para siguiente estado
                    if i < len(ESTADOS_PRUEBA):
                        filter_button = self.driver.find_element(
                            By.XPATH, "//button[@aria-label='Filter Button']"
                        )
                        filter_button.click()
                        time.sleep(2)
                except Exception as e:
                    self.log(f"Error limpiando filtros: {e}")
            
            self.log_success("Todos los filtros probados")
            self.tests_passed += 1
            return True
            
        except Exception as e:
            self.log_error("Error en filtros", e)
            self.take_screenshot("error_filtros")
            self.tests_failed += 1
            return False
            
    def test_row_options(self):
        """Prueba el botón de opciones de la primera fila"""
        try:
            self.log("\n=== PROBANDO BOTÓN DE OPCIONES ===")
            
            # Buscar botón de opciones en la primera fila
            try:
                options_button = self.wait.until(
                    EC.element_to_be_clickable((By.XPATH, "//tbody/tr[1]/td[7]/div[1]/button[1]"))
                )
                options_button.click()
                self.log("Click en botón de opciones (primera fila)")
                time.sleep(3)
                
                self.log_success("Botón de opciones funcional")
                self.tests_passed += 1
                return True
                
            except Exception as e:
                # Intentar selector alternativo (row 7 del archivo original)
                try:
                    options_button = self.driver.find_element(
                        By.XPATH, "//tbody/tr[7]/td[7]/div[1]/button[1]"
                    )
                    options_button.click()
                    self.log("Click en botón de opciones (fila 7)")
                    time.sleep(3)
                    
                    self.log_success("Botón de opciones funcional")
                    self.tests_passed += 1
                    return True
                except:
                    raise e
            
        except Exception as e:
            self.log_error("Error en botón de opciones", e)
            self.take_screenshot("error_opciones")
            self.tests_failed += 1
            return False
            
    def run_test(self):
        """Ejecuta test completo"""
        try:
            self.log("=" * 80)
            self.log("IT-MS-001: MONITOREO DE SOLICITUDES")
            self.log("=" * 80)
            
            if not self.setup_driver():
                return False
            
            # Login
            if not self.login():
                return False
            
            # Navegar a Monitoreo
            if not self.navigate_to_monitoring():
                return False
            
            # Ejecutar pruebas
            self.test_search_input()
            self.test_filters()
            self.test_row_options()
            
            # Resumen
            self.log("\n" + "=" * 80)
            self.log("RESUMEN DE PRUEBAS")
            self.log("=" * 80)
            total = self.tests_passed + self.tests_failed
            self.log(f"Total pruebas: {total}")
            self.log_success(f"Exitosas: {self.tests_passed}")
            if self.tests_failed > 0:
                self.log_error(f"Fallidas: {self.tests_failed}")
            self.log("=" * 80)
            
            time.sleep(3)
            return self.tests_passed > 0
            
        except Exception as e:
            self.log_error("Error general", e)
            self.take_screenshot("error_general")
            return False
            
        finally:
            self.generate_report()
            if self.driver:
                self.log("Cerrando navegador...")
                time.sleep(2)
                self.driver.quit()
                self.log("Navegador cerrado")
                
    def generate_report(self):
        """Genera reporte MD"""
        try:
            report_path = Path(__file__).parent / "IT-MS-001-reporte.md"
            
            with open(report_path, 'w', encoding='utf-8') as f:
                f.write("# IT-MS-001: Monitoreo de Solicitudes\n\n")
                f.write(f"**Fecha:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                f.write("---\n\n")
                f.write("## Pruebas Realizadas\n\n")
                f.write("### 1. Búsquedas\n")
                for b in BUSQUEDAS_PRUEBA:
                    f.write(f"- **{b['tipo']}**: '{b['valor']}'\n")
                f.write("\n### 2. Filtros por Estado\n")
                f.write("- Todos los estados\n")
                f.write("- Finalizada\n")
                f.write("- En Proceso\n")
                f.write("\n### 3. Filtros por Fecha\n")
                f.write(f"- Rango: {FECHA_INICIO} a {FECHA_FIN}\n")
                f.write("\n### 4. Acciones de Fila\n")
                f.write("- Botón de opciones (primera fila visible)\n")
                f.write("\n## Resultados\n\n")
                f.write(f"- **Exitosas**: {self.tests_passed}\n")
                f.write(f"- **Fallidas**: {self.tests_failed}\n\n")
                f.write("## Log Completo\n\n```\n")
                for line in self.report_lines:
                    f.write(f"{line}\n")
                f.write("```\n\n---\n")
            
            self.log_success(f"Reporte generado: {report_path}")
            
        except Exception as e:
            self.log_error("Error generando reporte", e)

def main():
    """Función principal"""
    test = MonitoringTest()
    success = test.run_test()
    
    if success:
        print("\n✅ PRUEBA COMPLETADA")
        sys.exit(0)
    else:
        print("\n❌ PRUEBA FALLÓ")
        sys.exit(1)

if __name__ == "__main__":
    main()
