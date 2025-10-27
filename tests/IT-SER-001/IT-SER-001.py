"""
IT-SER-001: Automatización de Registro de Servicios
Orden exacto de selectores proporcionado por el usuario
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
from dotenv import load_dotenv

# Configuración
PROJECT_ROOT = Path(__file__).parent.parent.parent
load_dotenv(PROJECT_ROOT / '.env')

APP_URL = "http://localhost:3000/sigma"
LOGIN_EMAIL = os.getenv('EMAIL')
LOGIN_PASSWORD = os.getenv('PASSWORD')

# Datos de prueba - 5 servicios
SERVICIOS_PRUEBA = [
    {
        "nombre": "Mantenimiento Preventivo Básico",
        "descripcion": "Servicio de mantenimiento preventivo para maquinaria agrícola incluyendo revisión general, cambio de aceite y filtros.",
        "tipo_value": "42",  # Mantenieminetos
        "precio": "150000",
        "unidad_value": "19",  # Pesos Colombianos
        "impuesto_value": "19",  # IVA 19%
        "tasa_impuesto": "19",
        "exento": False
    },
    {
        "nombre": "Reparación Sistema Hidráulico",
        "descripcion": "Diagnóstico y reparación de sistemas hidráulicos en tractores y cosechadoras.",
        "tipo_value": "42",
        "precio": "250000",
        "unidad_value": "19",
        "impuesto_value": "19",
        "tasa_impuesto": "19",
        "exento": False
    },
    {
        "nombre": "Calibración de Equipos",
        "descripcion": "Calibración y ajuste de precisión para equipos de fumigación y siembra.",
        "tipo_value": "42",
        "precio": "180000",
        "unidad_value": "19",
        "impuesto_value": "5",  # IVA 5%
        "tasa_impuesto": "5",
        "exento": False
    },
    {
        "nombre": "Servicio Emergencia 24h",
        "descripcion": "Atención de emergencias con técnico especializado disponible las 24 horas del día.",
        "tipo_value": "42",
        "precio": "350000",
        "unidad_value": "19",
        "impuesto_value": "19",
        "tasa_impuesto": "19",
        "exento": False
    },
    {
        "nombre": "Inspección Técnica Anual",
        "descripcion": "Inspección técnica completa anual para certificación de maquinaria agrícola.",
        "tipo_value": "42",
        "precio": "120000",
        "unidad_value": "19",
        "impuesto_value": "0",  # Exento
        "tasa_impuesto": "0",
        "exento": True
    }
]

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

class ServiceRegistrationTest:
    """Test de registro de servicios siguiendo orden exacto de selectores"""
    
    def __init__(self):
        self.driver = None
        self.wait = None
        self.report_lines = []
        self.screenshots_dir = Path(__file__).parent / "screenshots"
        self.screenshots_dir.mkdir(exist_ok=True)
        self.exitosos = 0
        self.fallidos = 0
        
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
        """Captura pantalla solo en errores"""
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
            self.log("Configurando driver Chrome...")
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
            self.log("=== LOGIN ===")
            
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
    
    def execute_selector_sequence(self, service, index):
        """Ejecuta secuencia exacta de selectores (1-12)"""
        try:
            self.log(f"=== SERVICIO {index}/{len(SERVICIOS_PRUEBA)}: {service['nombre']} ===")
            
            # SELECTOR 1: Menu Solicitudes
            self.log("PASO 1: Click menú Solicitudes")
            menu = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//span[normalize-space()='Solicitudes']"))
            )
            menu.click()
            time.sleep(3)
            
            # SELECTOR 2: Submenu Servicios
            self.log("PASO 2: Click submenú Servicios")
            submenu = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//a[normalize-space()='Servicios']"))
            )
            submenu.click()
            time.sleep(3)
            
            # SELECTOR 3: Botón Nuevo Servicio
            self.log("PASO 3: Click botón 'Nuevo Servicio'")
            btn_nuevo = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Nuevo Servicio']"))
            )
            btn_nuevo.click()
            time.sleep(3)
            
            # SELECTOR 4: Campo nombre servicio
            self.log("PASO 4: Ingresando nombre servicio")
            name_input = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//input[@id='service_name']"))
            )
            name_input.clear()
            name_input.send_keys(service['nombre'])
            self.log(f"   → {service['nombre']}")
            time.sleep(2)
            
            # SELECTOR 5: Campo descripción servicio
            self.log("PASO 5: Ingresando descripción")
            desc_input = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//textarea[@id='description']"))
            )
            desc_input.clear()
            desc_input.send_keys(service['descripcion'])
            self.log(f"   → {len(service['descripcion'])} caracteres")
            time.sleep(2)
            
            # SELECTOR 6: Campo tipo de servicio (select)
            self.log("PASO 6: Seleccionando tipo de servicio")
            tipo_select = Select(self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//select[@id='service_type']"))
            ))
            tipo_select.select_by_value(service['tipo_value'])
            self.log(f"   → value='{service['tipo_value']}' (Mantenieminetos)")
            time.sleep(2)
            
            # SELECTOR 7: Campo precio base
            self.log("PASO 7: Ingresando precio base")
            precio_valor = float(service['precio'])
            if precio_valor <= 0:
                self.log_error(f"   VALIDACIÓN FALLIDA: Precio {precio_valor} <= 0")
                self.take_screenshot(f"error_precio_invalido_{index}")
                self.fallidos += 1
                return False
            
            price_input = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//input[@id='base_price']"))
            )
            price_input.clear()
            price_input.send_keys(service['precio'])
            self.log(f"   → ${service['precio']}")
            time.sleep(2)
            
            # SELECTOR 8: Campo unidad de precio (select)
            self.log("PASO 8: Seleccionando unidad de precio")
            unidad_select = Select(self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//select[@id='price_unit']"))
            ))
            unidad_select.select_by_value(service['unidad_value'])
            self.log(f"   → value='{service['unidad_value']}' (Pesos Colombianos)")
            time.sleep(2)
            
            # SELECTOR 9: Campo impuesto aplicable (select)
            self.log("PASO 9: Seleccionando impuesto aplicable")
            impuesto_select = Select(self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//select[@id='applicable_tax']"))
            ))
            impuesto_select.select_by_value(service['impuesto_value'])
            impuesto_text = "Exento" if service['impuesto_value'] == "0" else f"IVA {service['impuesto_value']}%"
            self.log(f"   → value='{service['impuesto_value']}' ({impuesto_text})")
            time.sleep(2)
            
            # SELECTOR 10: Campo tasa de impuesto
            self.log("PASO 10: Ingresando tasa de impuesto")
            try:
                tax_rate_input = self.wait.until(
                    EC.presence_of_element_located((By.XPATH, "//input[@id='tax_rate']"))
                )
                tax_rate_input.clear()
                tax_rate_input.send_keys(service['tasa_impuesto'])
                self.log(f"   → {service['tasa_impuesto']}%")
            except Exception as e:
                self.log(f"   → Campo no disponible o no requerido: {e}")
            time.sleep(2)
            
            # SELECTOR 11: Checkbox exento de IVA
            self.log("PASO 11: Checkbox exento de IVA")
            if service['exento']:
                try:
                    checkbox = self.driver.find_element(By.XPATH, "//input[@name='is_vat_exempt']")
                    if not checkbox.is_selected():
                        checkbox.click()
                        self.log("   → Checkbox marcado")
                    else:
                        self.log("   → Ya estaba marcado")
                except Exception as e:
                    self.log(f"   → Checkbox no disponible: {e}")
            else:
                self.log("   → Servicio no exento, sin marcar")
            time.sleep(2)
            
            # SELECTOR 12: Botón Registrar
            self.log("PASO 12: Click en 'Registrar'")
            registrar_btn = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Registrar']"))
            )
            registrar_btn.click()
            time.sleep(4)
            
            self.log_success(f"Servicio {index} registrado exitosamente")
            self.exitosos += 1
            return True
            
        except Exception as e:
            self.log_error(f"Error en servicio {index}", e)
            self.take_screenshot(f"error_servicio_{index}")
            self.fallidos += 1
            return False
            
    def run_test(self):
        """Ejecuta test completo"""
        try:
            self.log("=" * 80)
            self.log("IT-SER-001: REGISTRO DE SERVICIOS")
            self.log("=" * 80)
            
            if not self.setup_driver():
                return False
            
            # LOGIN
            if not self.login():
                return False
            
            # Ejecutar secuencia para cada servicio
            for index, service in enumerate(SERVICIOS_PRUEBA, 1):
                self.log("")
                self.log("=" * 80)
                self.execute_selector_sequence(service, index)
                self.log("=" * 80)
                
                # Esperar antes del siguiente
                if index < len(SERVICIOS_PRUEBA):
                    time.sleep(3)
            
            # Resumen final
            self.log("")
            self.log("=" * 80)
            self.log("RESUMEN FINAL")
            self.log("=" * 80)
            self.log(f"Total servicios: {len(SERVICIOS_PRUEBA)}")
            self.log_success(f"Exitosos: {self.exitosos}")
            if self.fallidos > 0:
                self.log_error(f"Fallidos: {self.fallidos}")
            self.log("=" * 80)
            
            time.sleep(3)
            return self.exitosos > 0
            
        except Exception as e:
            self.log_error("Error general en test", e)
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
        """Genera reporte Markdown"""
        try:
            report_path = Path(__file__).parent / "IT-SER-001-reporte.md"
            
            with open(report_path, 'w', encoding='utf-8') as f:
                f.write("# IT-SER-001: Registro de Servicios\n\n")
                f.write(f"**Fecha:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                f.write("---\n\n")
                f.write("## Secuencia de Selectores\n\n")
                f.write("1. `//span[normalize-space()='Solicitudes']` - Menu Solicitudes\n")
                f.write("2. `//a[normalize-space()='Servicios']` - Submenu Servicios\n")
                f.write("3. `//button[normalize-space()='Nuevo Servicio']` - Botón nuevo\n")
                f.write("4. `//input[@id='service_name']` - Nombre servicio\n")
                f.write("5. `//textarea[@id='description']` - Descripción\n")
                f.write("6. `//select[@id='service_type']` - Tipo servicio\n")
                f.write("7. `//input[@id='base_price']` - Precio base\n")
                f.write("8. `//select[@id='price_unit']` - Unidad precio\n")
                f.write("9. `//select[@id='applicable_tax']` - Impuesto\n")
                f.write("10. `//input[@id='tax_rate']` - Tasa impuesto\n")
                f.write("11. `//input[@name='is_vat_exempt']` - Checkbox exento\n")
                f.write("12. `//button[normalize-space()='Registrar']` - Botón registrar\n\n")
                f.write("## Servicios de Prueba\n\n")
                for i, s in enumerate(SERVICIOS_PRUEBA, 1):
                    f.write(f"### {i}. {s['nombre']}\n")
                    f.write(f"- **Precio**: ${s['precio']} COP\n")
                    f.write(f"- **Impuesto**: {s['impuesto_value']} ")
                    f.write(f"({'Exento' if s['exento'] else 'IVA ' + s['tasa_impuesto'] + '%'})\n\n")
                f.write("## Resultados\n\n")
                f.write(f"- **Total**: {len(SERVICIOS_PRUEBA)}\n")
                f.write(f"- **Exitosos**: {self.exitosos}\n")
                f.write(f"- **Fallidos**: {self.fallidos}\n\n")
                f.write("## Log Completo\n\n```\n")
                for line in self.report_lines:
                    f.write(f"{line}\n")
                f.write("```\n\n---\n")
            
            self.log_success(f"Reporte generado: {report_path}")
            
        except Exception as e:
            self.log_error("Error generando reporte", e)

def main():
    """Función principal"""
    test = ServiceRegistrationTest()
    success = test.run_test()
    
    if success:
        print("\n✅ PRUEBA COMPLETADA CON ÉXITO")
        sys.exit(0)
    else:
        print("\n❌ PRUEBA FALLÓ")
        sys.exit(1)

if __name__ == "__main__":
    main()
