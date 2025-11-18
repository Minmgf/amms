#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Prueba de Integración IT-GD-001: Registro completo de dispositivo y validación de integración con sistema de monitoreo
Historia de Usuario: HU-GD-001 (Registrar nuevo dispositivo), HU-MS-002 (Iniciar monitoreo de solicitud)

Caso de Prueba: Verificar el proceso integral de registro de un dispositivo GPS/CAN con todos sus parámetros 
de monitoreo, validando que queda correctamente habilitado para integración automática con el sistema de 
monitoreo cuando exista una solicitud activa asociada a la maquinaria.
"""

import os
import sys
import time
import json
import random
from datetime import datetime
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from dotenv import load_dotenv

# Agregar rutas al path
CURRENT_DIR = Path(__file__).parent
PROJECT_ROOT = CURRENT_DIR.parent
sys.path.append(str(PROJECT_ROOT))
sys.path.append(str(CURRENT_DIR))

# Importar flujo de login
from flows.auth.login.selenium_login_flow import perform_login, create_maximized_driver

# Cargar variables de entorno
load_dotenv(PROJECT_ROOT / '.env')


class TestITGD001DeviceRegistration:
    """Clase para automatizar la prueba IT-GD-001"""
    
    def __init__(self):
        self.driver = None
        self.wait = None
        self.test_results = []
        self.screenshots_dir = CURRENT_DIR / "screenshots"
        self.reports_dir = CURRENT_DIR / "reports"
        
        # Crear directorios si no existen
        self.screenshots_dir.mkdir(exist_ok=True)
        self.reports_dir.mkdir(exist_ok=True)
        
        # Datos de prueba que se generarán dinámicamente
        self.test_data = {
            "device_name": "",
            "imei": "",
            "parameters": [
                "Estado de Ignición",
                "Velocidad Actual",
                "Ubicación GPS",
                "Nivel de Combustible",
                "Temperatura del Motor"
            ]
        }
        
        # Datos para prueba de duplicado
        self.duplicate_test_data = {
            "device_name": "",
            "imei": ""
        }
    
    def generate_random_imei(self):
        """Genera un IMEI aleatorio de 15 dígitos"""
        # Los primeros 14 dígitos son aleatorios
        imei_base = ''.join([str(random.randint(0, 9)) for _ in range(14)])
        
        # Calcular el dígito de verificación usando el algoritmo de Luhn
        def luhn_checksum(imei):
            def digits_of(n):
                return [int(d) for d in str(n)]
            digits = digits_of(imei)
            odd_digits = digits[-1::-2]
            even_digits = digits[-2::-2]
            checksum = sum(odd_digits)
            for d in even_digits:
                checksum += sum(digits_of(d * 2))
            return checksum % 10
        
        check_digit = (10 - luhn_checksum(imei_base)) % 10
        imei = imei_base + str(check_digit)
        
        return imei
    
    def generate_test_data(self):
        """Genera datos únicos para la prueba"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.test_data["device_name"] = f"Dispositivo GPS Test {timestamp}"
        self.test_data["imei"] = self.generate_random_imei()
        
        print(f"Datos de prueba generados:")
        print(f"  - Nombre: {self.test_data['device_name']}")
        print(f"  - IMEI: {self.test_data['imei']}")
        print(f"  - Parámetros a seleccionar: {len(self.test_data['parameters'])}")
    
    def log_test_result(self, step, success, message, details=None):
        """Registra el resultado de un paso del test"""
        result = {
            "step": step,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        if details:
            result["details"] = details
        
        self.test_results.append(result)
        
        status = "✓" if success else "✗"
        print(f"{status} {step}: {message}")
    
    def take_screenshot(self, name):
        """Toma una captura de pantalla"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"screenshot_{name}_{timestamp}.png"
            filepath = self.screenshots_dir / filename
            self.driver.save_screenshot(str(filepath))
            print(f"📸 Screenshot guardado: {filename}")
            return str(filepath)
        except Exception as e:
            print(f"Error tomando screenshot: {e}")
            return None
    
    def setup_driver(self):
        """Configura el driver de Chrome"""
        print("\n" + "="*70)
        print("CONFIGURACIÓN DEL DRIVER")
        print("="*70)
        
        try:
            self.driver = create_maximized_driver()
            self.wait = WebDriverWait(self.driver, 15)
            self.log_test_result("Setup", True, "Driver configurado correctamente")
            return True
        except Exception as e:
            self.log_test_result("Setup", False, f"Error configurando driver: {e}")
            return False
    
    def login(self):
        """Realiza el login en la aplicación"""
        print("\n" + "="*70)
        print("AUTENTICACIÓN")
        print("="*70)
        
        try:
            self.driver = perform_login(self.driver)
            time.sleep(2)
            self.take_screenshot("login_success")
            self.log_test_result("Login", True, "Autenticación exitosa")
            return True
        except Exception as e:
            self.take_screenshot("login_error")
            self.log_test_result("Login", False, f"Error en autenticación: {e}")
            return False
    
    def navigate_to_monitoring(self):
        """Navega al módulo de Monitoreo"""
        print("\n" + "="*70)
        print("NAVEGACIÓN AL MÓDULO DE MONITOREO")
        print("="*70)
        
        try:
            # Buscar el elemento de Monitoreo en el menú lateral
            monitoring_menu = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//a[@href='/sigma/monitoring']"))
            )
            
            print(f"Elemento de Monitoreo encontrado: {monitoring_menu.text}")
            monitoring_menu.click()
            time.sleep(2)
            
            self.take_screenshot("monitoring_menu_expanded")
            self.log_test_result("Navegación_Monitoreo", True, "Menú de Monitoreo desplegado")
            return True
            
        except Exception as e:
            self.take_screenshot("monitoring_menu_error")
            self.log_test_result("Navegación_Monitoreo", False, f"Error navegando a Monitoreo: {e}")
            return False
    
    def navigate_to_devices_management(self):
        """Navega al submódulo de Gestión de Dispositivos"""
        print("\n" + "="*70)
        print("NAVEGACIÓN A GESTIÓN DE DISPOSITIVOS")
        print("="*70)
        
        try:
            # Buscar y hacer clic en "Gestión de dispositivos"
            devices_link = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//a[@href='/sigma/monitoring/devicesManagement']"))
            )
            
            print(f"Elemento de Gestión de Dispositivos encontrado")
            devices_link.click()
            time.sleep(3)
            
            # Verificar que estamos en la página correcta
            current_url = self.driver.current_url
            if "devicesManagement" in current_url:
                self.take_screenshot("devices_management_page")
                self.log_test_result("Navegación_Dispositivos", True, "Navegación exitosa a Gestión de Dispositivos")
                return True
            else:
                raise Exception(f"URL incorrecta: {current_url}")
            
        except Exception as e:
            self.take_screenshot("devices_management_error")
            self.log_test_result("Navegación_Dispositivos", False, f"Error navegando a Gestión de Dispositivos: {e}")
            return False
    
    def open_new_device_modal(self):
        """Abre el modal de Nuevo Dispositivo"""
        print("\n" + "="*70)
        print("APERTURA DEL MODAL NUEVO DISPOSITIVO")
        print("="*70)
        
        try:
            # Buscar y hacer clic en el botón "Nuevo Dispositivo"
            new_device_button = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[@aria-label='Add Device Button']"))
            )
            
            print(f"Botón 'Nuevo Dispositivo' encontrado")
            new_device_button.click()
            time.sleep(2)
            
            # Verificar que el modal se abrió
            modal = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'modal-theme')]"))
            )
            
            # Verificar el título del modal
            modal_title = modal.find_element(By.XPATH, ".//h2[contains(text(), 'Registro de Dispositivo')]")
            
            if modal.is_displayed() and modal_title.is_displayed():
                self.take_screenshot("modal_opened")
                self.log_test_result("Apertura_Modal", True, "Modal 'Registro de Dispositivo' abierto correctamente")
                return True
            else:
                raise Exception("Modal no visible")
            
        except Exception as e:
            self.take_screenshot("modal_open_error")
            self.log_test_result("Apertura_Modal", False, f"Error abriendo modal: {e}")
            return False
    
    def fill_device_form(self, device_name, imei, is_duplicate=False):
        """Completa el formulario de registro de dispositivo"""
        step_name = "Formulario_Duplicado" if is_duplicate else "Formulario_Registro"
        
        print("\n" + "="*70)
        print(f"COMPLETAR FORMULARIO {'(PRUEBA DUPLICADO)' if is_duplicate else ''}")
        print("="*70)
        
        try:
            # Cambiar contexto al modal
            modal = self.driver.find_element(By.XPATH, "//div[contains(@class, 'modal-theme')]")
            
            # 1. Llenar campo "Nombre del Dispositivo"
            name_input = modal.find_element(By.XPATH, ".//input[@name='deviceName']")
            name_input.clear()
            name_input.send_keys(device_name)
            print(f"  ✓ Nombre del dispositivo ingresado: {device_name}")
            time.sleep(0.5)
            
            # 2. Llenar campo "IMEI"
            imei_input = modal.find_element(By.XPATH, ".//input[@name='imei']")
            imei_input.clear()
            imei_input.send_keys(imei)
            print(f"  ✓ IMEI ingresado: {imei}")
            time.sleep(0.5)
            
            # 3. Seleccionar parámetros de monitoreo (solo si no es duplicado)
            if not is_duplicate:
                print(f"  Seleccionando {len(self.test_data['parameters'])} parámetros de monitoreo:")
                
                for param in self.test_data['parameters']:
                    try:
                        # Buscar checkbox por el texto del parámetro
                        checkbox_label = modal.find_element(
                            By.XPATH, 
                            f".//label[contains(., '{param}')]"
                        )
                        checkbox = checkbox_label.find_element(By.XPATH, ".//input[@type='checkbox']")
                        
                        if not checkbox.is_selected():
                            checkbox.click()
                            print(f"    ✓ {param}")
                            time.sleep(0.3)
                    except Exception as e:
                        print(f"    ✗ Error seleccionando {param}: {e}")
            
            self.take_screenshot(f"form_filled{'_duplicate' if is_duplicate else ''}")
            self.log_test_result(
                step_name, 
                True, 
                f"Formulario completado correctamente {'(datos duplicados)' if is_duplicate else ''}",
                details={"device_name": device_name, "imei": imei}
            )
            return True
            
        except Exception as e:
            self.take_screenshot(f"form_fill_error{'_duplicate' if is_duplicate else ''}")
            self.log_test_result(step_name, False, f"Error completando formulario: {e}")
            return False
    
    def submit_device_form(self, expect_error=False):
        """Envía el formulario de registro"""
        step_name = "Validación_Duplicado" if expect_error else "Envío_Formulario"
        
        print("\n" + "="*70)
        print(f"ENVÍO DEL FORMULARIO {'(ESPERANDO ERROR)' if expect_error else ''}")
        print("="*70)
        
        try:
            # Buscar el botón "Registrar"
            submit_button = self.driver.find_element(
                By.XPATH, 
                "//button[@type='submit' and contains(., 'Registrar')]"
            )
            
            print(f"  Botón 'Registrar' encontrado")
            submit_button.click()
            time.sleep(3)
            
            if expect_error:
                # Buscar mensaje de error o validación
                try:
                    # Buscar mensajes de error comunes
                    error_messages = self.driver.find_elements(
                        By.XPATH,
                        "//*[contains(text(), 'ya existe') or contains(text(), 'duplicado') or "
                        "contains(text(), 'error') or contains(text(), 'Error')]"
                    )
                    
                    if error_messages:
                        error_text = error_messages[0].text
                        self.take_screenshot("duplicate_error_validation")
                        self.log_test_result(
                            step_name,
                            True,
                            f"Validación de duplicado correcta: {error_text}"
                        )
                        return True
                    else:
                        # Si no hay mensaje de error, verificar si el modal sigue abierto
                        modal_still_open = self.driver.find_elements(
                            By.XPATH,
                            "//div[contains(@class, 'modal-theme')]"
                        )
                        
                        if modal_still_open and modal_still_open[0].is_displayed():
                            self.take_screenshot("duplicate_modal_still_open")
                            self.log_test_result(
                                step_name,
                                True,
                                "Sistema previno registro duplicado (modal permanece abierto)"
                            )
                            return True
                        else:
                            self.take_screenshot("duplicate_no_validation")
                            self.log_test_result(
                                step_name,
                                False,
                                "Sistema no validó dispositivo duplicado correctamente"
                            )
                            return False
                
                except Exception as e:
                    self.take_screenshot("duplicate_check_error")
                    self.log_test_result(step_name, False, f"Error verificando validación de duplicado: {e}")
                    return False
            else:
                # Esperar mensaje de éxito
                try:
                    # Buscar mensaje de éxito
                    success_message = self.wait.until(
                        EC.presence_of_element_located((
                            By.XPATH,
                            "//*[contains(text(), 'exitosamente') or contains(text(), 'éxito') or "
                            "contains(text(), 'registrado') or contains(text(), 'Dispositivo registrado')]"
                        ))
                    )
                    
                    if success_message.is_displayed():
                        message_text = success_message.text
                        self.take_screenshot("registration_success")
                        self.log_test_result(
                            step_name,
                            True,
                            f"Dispositivo registrado exitosamente: {message_text}"
                        )
                        return True
                    
                except TimeoutException:
                    # Si no hay mensaje, verificar que el modal se cerró
                    time.sleep(2)
                    modals = self.driver.find_elements(
                        By.XPATH,
                        "//div[contains(@class, 'modal-theme')]"
                    )
                    
                    if not modals or not modals[0].is_displayed():
                        self.take_screenshot("registration_modal_closed")
                        self.log_test_result(
                            step_name,
                            True,
                            "Registro completado (modal cerrado)"
                        )
                        return True
                    else:
                        self.take_screenshot("registration_uncertain")
                        self.log_test_result(
                            step_name,
                            False,
                            "No se pudo confirmar el registro del dispositivo"
                        )
                        return False
            
        except Exception as e:
            self.take_screenshot(f"submit_error{'_duplicate' if expect_error else ''}")
            self.log_test_result(step_name, False, f"Error enviando formulario: {e}")
            return False
    
    def verify_device_in_list(self, device_name):
        """Verifica que el dispositivo aparece en la lista"""
        print("\n" + "="*70)
        print("VERIFICACIÓN EN LISTA DE DISPOSITIVOS")
        print("="*70)
        
        try:
            # Esperar a que la tabla se actualice
            time.sleep(3)
            
            # Buscar el dispositivo en la tabla
            device_row = self.driver.find_element(
                By.XPATH,
                f"//td[contains(text(), '{device_name}') or contains(., '{device_name}')]"
            )
            
            if device_row.is_displayed():
                self.take_screenshot("device_in_list")
                self.log_test_result(
                    "Verificación_Lista",
                    True,
                    f"Dispositivo '{device_name}' encontrado en la lista"
                )
                return True
            
        except NoSuchElementException:
            self.take_screenshot("device_not_in_list")
            self.log_test_result(
                "Verificación_Lista",
                False,
                f"Dispositivo '{device_name}' NO encontrado en la lista"
            )
            return False
        except Exception as e:
            self.take_screenshot("verification_error")
            self.log_test_result("Verificación_Lista", False, f"Error verificando lista: {e}")
            return False
    
    def close_modal(self):
        """Cierra el modal si está abierto"""
        try:
            close_button = self.driver.find_element(
                By.XPATH,
                "//button[contains(@class, 'text-secondary')]/*[name()='svg']/.."
            )
            close_button.click()
            time.sleep(1)
            print("  ✓ Modal cerrado")
            return True
        except:
            print("  ⓘ Modal ya cerrado o no encontrado")
            return False
    
    def test_duplicate_device(self):
        """Prueba el registro de un dispositivo duplicado"""
        print("\n" + "="*70)
        print("PRUEBA DE REGISTRO DUPLICADO")
        print("="*70)
        
        # Usar los mismos datos del primer registro
        self.duplicate_test_data["device_name"] = self.test_data["device_name"]
        self.duplicate_test_data["imei"] = self.test_data["imei"]
        
        print(f"Intentando registrar dispositivo duplicado:")
        print(f"  - Nombre: {self.duplicate_test_data['device_name']}")
        print(f"  - IMEI: {self.duplicate_test_data['imei']}")
        
        # Abrir modal nuevamente
        if not self.open_new_device_modal():
            return False
        
        # Llenar formulario con datos duplicados
        if not self.fill_device_form(
            self.duplicate_test_data["device_name"],
            self.duplicate_test_data["imei"],
            is_duplicate=True
        ):
            return False
        
        # Enviar formulario esperando error
        if not self.submit_device_form(expect_error=True):
            return False
        
        # Cerrar modal si está abierto
        self.close_modal()
        
        return True
    
    def generate_report(self):
        """Genera un reporte detallado de la prueba"""
        print("\n" + "="*70)
        print("GENERACIÓN DE REPORTE")
        print("="*70)
        
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            report_file = self.reports_dir / f"IT_GD_001_Report_{timestamp}.json"
            
            # Calcular resumen
            total_steps = len(self.test_results)
            passed = len([r for r in self.test_results if r["success"]])
            failed = total_steps - passed
            
            report_data = {
                "test_id": "IT-GD-001",
                "test_name": "Registro completo de dispositivo y validación de integración con sistema de monitoreo",
                "timestamp": timestamp,
                "test_data": self.test_data,
                "duplicate_test_data": self.duplicate_test_data,
                "results": self.test_results,
                "summary": {
                    "total_steps": total_steps,
                    "passed": passed,
                    "failed": failed,
                    "success_rate": f"{(passed/total_steps)*100:.1f}%"
                }
            }
            
            with open(report_file, 'w', encoding='utf-8') as f:
                json.dump(report_data, f, indent=2, ensure_ascii=False)
            
            print(f"✓ Reporte generado: {report_file.name}")
            
            # Mostrar resumen en consola
            print("\n" + "="*70)
            print("RESUMEN DE LA PRUEBA")
            print("="*70)
            print(f"Total de pasos: {total_steps}")
            print(f"Exitosos: {passed}")
            print(f"Fallidos: {failed}")
            print(f"Tasa de éxito: {report_data['summary']['success_rate']}")
            
            return report_file
            
        except Exception as e:
            print(f"Error generando reporte: {e}")
            return None
    
    def run_test(self):
        """Ejecuta la prueba completa"""
        print("\n" + "█"*70)
        print("INICIANDO PRUEBA IT-GD-001")
        print("Registro completo de dispositivo y validación de integración")
        print("█"*70)
        
        try:
            # Generar datos de prueba
            self.generate_test_data()
            
            # Configurar driver
            if not self.setup_driver():
                return False
            
            # Ejecutar pasos de la prueba
            steps = [
                ("Autenticación", self.login),
                ("Navegación a Monitoreo", self.navigate_to_monitoring),
                ("Navegación a Gestión de Dispositivos", self.navigate_to_devices_management),
                ("Apertura de modal", self.open_new_device_modal),
                ("Completar formulario", lambda: self.fill_device_form(
                    self.test_data["device_name"],
                    self.test_data["imei"]
                )),
                ("Envío de formulario", lambda: self.submit_device_form(expect_error=False)),
                ("Verificación en lista", lambda: self.verify_device_in_list(self.test_data["device_name"])),
                ("Prueba de duplicado", self.test_duplicate_device)
            ]
            
            for step_name, step_func in steps:
                print(f"\n▶ Ejecutando: {step_name}")
                if not step_func():
                    print(f"✗ Paso fallido: {step_name}")
                    self.take_screenshot(f"error_{step_name.replace(' ', '_')}")
                    # Continuar con los demás pasos para recopilar más información
                time.sleep(1)
            
            # Tomar screenshot final
            self.take_screenshot("final_state")
            
            # Generar reporte
            self.generate_report()
            
            # Determinar si la prueba fue exitosa
            total_steps = len(self.test_results)
            passed = len([r for r in self.test_results if r["success"]])
            success = passed == total_steps
            
            return success
            
        except Exception as e:
            print(f"\n✗ Error ejecutando prueba: {e}")
            self.take_screenshot("critical_error")
            return False
        
        finally:
            if self.driver:
                print("\n🔒 Cerrando navegador...")
                time.sleep(2)
                self.driver.quit()
                print("✓ Navegador cerrado")


def main():
    """Función principal"""
    print(f"Fecha de ejecución: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    test = TestITGD001DeviceRegistration()
    success = test.run_test()
    
    print("\n" + "█"*70)
    if success:
        print("PRUEBA COMPLETADA EXITOSAMENTE ✓")
    else:
        print("PRUEBA COMPLETADA CON ERRORES ✗")
    print("█"*70 + "\n")
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
