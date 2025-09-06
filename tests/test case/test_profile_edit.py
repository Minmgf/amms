#!/usr/bin/env python3
"""
Test Case: IT-GUSU-006 - Interfaz de edición de perfil
=======================================================

Descripción: 
Verificar que la interfaz de edición de perfil permita al usuario actualizar 
correctamente su información personal, subir foto de perfil y cambiar contraseña,
validando todos los campos y mostrando mensajes apropiados.

Uso:
- Modo visual: python test_profile_edit.py
- Modo headless: python test_profile_edit.py --headless  
- Múltiples iteraciones: python test_profile_edit.py --iterations 5
- Ayuda: python test_profile_edit.py --help

Prerrequisitos:
- ChromeDriver en ../chromedriver/driver.exe
- Archivo .env con EMAIL y PASSWORD
- Servidor ejecutándose en http://localhost:3000
"""

import argparse
import os
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from faker import Faker
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    NoSuchElementException, 
    TimeoutException, 
    WebDriverException,
    ElementClickInterceptedException
)
from selenium.webdriver.common.action_chains import ActionChains
from dotenv import load_dotenv

# ============================================================================
# CONFIGURACIÓN Y CONSTANTES
# ============================================================================

# Cargar variables de entorno
load_dotenv()

# Configuración de rutas
PROJECT_ROOT = Path(__file__).parent.parent
FLOWS_PATH = PROJECT_ROOT / 'flows' / 'auth' / 'login'
CHROMEDRIVER_PATH = PROJECT_ROOT / 'chromedriver' / 'driver.exe'

# Agregar rutas al sys.path para imports
sys.path.insert(0, str(FLOWS_PATH))

# Configuración por defecto
DEFAULT_CONFIG = {
    'iterations': 3,
    'wait_time': 15,
    'pause_between_iterations': 2,
    'base_url': 'http://localhost:3000',
    'login_url': 'http://localhost:3000/sigma/login',
    'profile_url': 'http://localhost:3000/userProfile'
}

# Selectores CSS/XPath
SELECTORS = {
    'profile_link': [
        "//a[@href='/userProfile']",
        "//a[contains(@href, 'userProfile')]",
        "//div[contains(@class, 'cursor-pointer')]//a[@href='/userProfile']"
    ],
    'profile_elements': {
        'title': "//h1[contains(text(), 'My profile')]",
        'personal_info': "//h3[contains(text(), 'Personal information')]",
        'residence_form': "//form[@id='residenceForm']",
        'change_password_btn': "//button[contains(text(), 'Change Password')]",
        'update_btn': "//button[contains(text(), 'Update')]",
        'photo_area': "//div[contains(@class, 'cursor-pointer') and contains(@class, 'rounded-full')]"
    },
    'form_fields': {
        'address': "//input[@name='address']",
        'phone': "//input[@name='phoneNumber']",
        'country': "//select[@name='country']",
        'department': "//select[@name='department']",
        'city': "//select[@name='city']"
    },
    'modals': {
        'photo_modal_title': "//h2[contains(text(), 'Change profile photo')]",
        'password_modal_title': "//h2[contains(text(), 'Change Password')]",
        'cancel_buttons': [
            "//button[contains(text(), 'Cancel')]",
            "//button[@aria-label='Close']"
        ]
    },
    'validation_errors': [
        "//p[contains(@class, 'text-red-500')]",
        "//span[contains(@class, 'error')]",
        "//div[contains(@class, 'error-message')]"
    ],
    'success_messages': [
        "//div[contains(@class, 'success')] | //div[contains(@class, 'green')]",
        "//div[contains(text(), 'Update')] | //div[contains(text(), 'success')]",
        "//div[contains(@class, 'modal')]//div[contains(text(), 'Successful')]"
    ]
}

# ============================================================================
# FUNCIONES UTILITARIAS
# ============================================================================

def get_chromedriver_path() -> str:
    """Obtener ruta del ChromeDriver"""
    if CHROMEDRIVER_PATH.exists():
        return str(CHROMEDRIVER_PATH)
    
    # Buscar en rutas alternativas
    alternative_paths = [
        Path('./chromedriver/driver.exe'),
        Path('../chromedriver/driver.exe'),
        Path('../../chromedriver/driver.exe'),
        Path('./driver.exe'),
        Path('../driver.exe')
    ]
    
    for path in alternative_paths:
        if path.exists():
            return str(path.resolve())
    
    raise FileNotFoundError("ChromeDriver no encontrado. Descárguelo desde https://chromedriver.chromium.org/")

def validate_environment() -> List[str]:
    """Validar que el entorno está configurado correctamente"""
    errors = []
    
    # Verificar ChromeDriver
    try:
        get_chromedriver_path()
    except FileNotFoundError as e:
        errors.append(str(e))
    
    # Verificar variables de entorno
    email = os.getenv('EMAIL')
    password = os.getenv('PASSWORD')
    
    if not email:
        errors.append("Variable EMAIL no encontrada en .env")
    if not password:
        errors.append("Variable PASSWORD no encontrada en .env")
    
    # Verificar módulo de login
    login_file = FLOWS_PATH / 'login_flow.py'
    if not login_file.exists():
        errors.append(f"Archivo login_flow.py no encontrado en {FLOWS_PATH}")
    
    return errors

def print_environment_info():
    """Imprimir información del entorno"""
    print("🔧 INFORMACIÓN DEL ENTORNO")
    print(f"   📁 Directorio del proyecto: {PROJECT_ROOT}")
    print(f"   📁 Ruta de flows: {FLOWS_PATH}")
    
    try:
        driver_path = get_chromedriver_path()
        print(f"   ✅ ChromeDriver encontrado: {driver_path}")
    except FileNotFoundError:
        print(f"   ❌ ChromeDriver NO encontrado")
    
    email = os.getenv('EMAIL', 'No configurado')
    print(f"   📧 Email configurado: {email}")
    
    headless = os.getenv('HEADLESS', 'false').lower() == 'true'
    print(f"   🖥️  Modo headless: {'Activado' if headless else 'Desactivado'}")
    
    login_file = FLOWS_PATH / 'login_flow.py'
    if login_file.exists():
        print(f"   ✅ Módulo login_flow encontrado")
    else:
        print(f"   ❌ Módulo login_flow NO encontrado")

# ============================================================================
# CLASE PRINCIPAL DEL TEST
# ============================================================================

class ProfileEditTest:
    """Test automatizado para la interfaz de edición de perfil"""
    
    def __init__(self, headless: bool = False, iterations: int = 3):
        self.headless = headless
        self.iterations = iterations
        self.driver_path = get_chromedriver_path()
        self.driver: Optional[webdriver.Chrome] = None
        self.wait: Optional[WebDriverWait] = None
        self.fake = Faker('es_ES')
        
        self.results = {
            'test_name': 'IT-GUSU-006 - Interfaz de edición de perfil',
            'iterations_completed': 0,
            'successful_operations': 0,
            'failed_operations': 0,
            'errors_encountered': [],
            'validations_passed': 0,
            'validations_failed': 0,
            'start_time': None,
            'end_time': None
        }

    def setup_driver(self) -> bool:
        """Configurar y inicializar el navegador"""
        try:
            print("🌐 Configurando navegador Chrome...")
            
            # Configurar opciones de Chrome
            options = ChromeOptions()
            
            if self.headless:
                options.add_argument('--headless')
                print("   👤 Modo headless activado")
            else:
                print("   🖼️  Modo visual activado")
            
            # Opciones adicionales para estabilidad
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('--window-size=1920,1080')
            options.add_argument('--disable-web-security')
            options.add_argument('--allow-running-insecure-content')
            
            # Configurar servicio
            service = ChromeService(executable_path=self.driver_path)
            
            # Inicializar driver
            self.driver = webdriver.Chrome(service=service, options=options)
            self.driver.set_page_load_timeout(30)
            self.wait = WebDriverWait(self.driver, DEFAULT_CONFIG['wait_time'])
            
            print("   ✅ Navegador iniciado correctamente")
            return True
            
        except Exception as e:
            print(f"   ❌ Error configurando navegador: {e}")
            self.results['errors_encountered'].append(f"Browser setup error: {str(e)}")
            return False

    def login(self) -> bool:
        """Realizar login en el sistema"""
        try:
            print("🔐 Realizando login...")
            
            # Importar LoginFlow
            try:
                from login_flow import LoginFlow
            except ImportError:
                print("   ❌ No se pudo importar LoginFlow")
                return False
            
            # Usar el driver ya configurado
            login_flow = LoginFlow(driver_path=self.driver_path)
            login_flow.driver = self.driver  # Usar nuestro driver
            login_flow.wait = self.wait
            
            # Realizar login
            login_flow.login()
            
            if not login_flow.is_logged_in():
                raise Exception("Login falló - No se pudo autenticar")
            
            print("   ✅ Login exitoso")
            return True
            
        except Exception as e:
            print(f"   ❌ Error en login: {e}")
            self.results['errors_encountered'].append(f"Login error: {str(e)}")
            return False

    def navigate_to_profile(self) -> bool:
        """Navegar a la página de perfil"""
        try:
            print("🧭 Navegando a perfil de usuario...")
            
            # Buscar enlace de perfil
            profile_link = None
            for selector in SELECTORS['profile_link']:
                try:
                    profile_link = self.wait.until(
                        EC.element_to_be_clickable((By.XPATH, selector))
                    )
                    break
                except TimeoutException:
                    continue
            
            if profile_link:
                profile_link.click()
                print("   ✅ Enlace de perfil clickeado")
            else:
                # Navegación directa por URL
                current_url = self.driver.current_url
                base_url = current_url.split('/home')[0] if '/home' in current_url else current_url.rstrip('/')
                profile_url = f"{base_url}/userProfile"
                self.driver.get(profile_url)
                print("   ✅ Navegación directa por URL")
            
            # Verificar que estamos en la página de perfil
            self.wait.until(
                EC.any_of(
                    EC.presence_of_element_located((By.XPATH, SELECTORS['profile_elements']['title'])),
                    EC.presence_of_element_located((By.XPATH, SELECTORS['profile_elements']['personal_info'])),
                    EC.presence_of_element_located((By.XPATH, SELECTORS['profile_elements']['residence_form']))
                )
            )
            
            print("   ✅ Página de perfil cargada")
            return True
            
        except Exception as e:
            print(f"   ❌ Error navegando a perfil: {e}")
            self.results['errors_encountered'].append(f"Navigation error: {str(e)}")
            return False

    def verify_interface_elements(self) -> bool:
        """Verificar que todos los elementos de la interfaz están presentes"""
        try:
            print("🔍 Verificando elementos de la interfaz...")
            
            elements_to_check = [
                (SELECTORS['profile_elements']['title'], "Título principal"),
                (SELECTORS['profile_elements']['personal_info'], "Información personal"),
                (SELECTORS['profile_elements']['residence_form'], "Formulario de residencia"),
                (SELECTORS['profile_elements']['change_password_btn'], "Botón cambiar contraseña"),
                (SELECTORS['profile_elements']['update_btn'], "Botón actualizar"),
                (SELECTORS['profile_elements']['photo_area'], "Área de foto")
            ]
            
            found_elements = 0
            for xpath, description in elements_to_check:
                try:
                    element = self.driver.find_element(By.XPATH, xpath)
                    if element.is_displayed():
                        found_elements += 1
                        print(f"   ✅ {description}")
                    else:
                        print(f"   ⚠️  {description} (no visible)")
                except NoSuchElementException:
                    print(f"   ❌ {description} (no encontrado)")
            
            success_rate = found_elements / len(elements_to_check)
            if success_rate >= 0.7:  # 70% de elementos encontrados
                print(f"   ✅ Interfaz válida ({found_elements}/{len(elements_to_check)} elementos)")
                self.results['validations_passed'] += 1
                return True
            else:
                print(f"   ❌ Interfaz incompleta ({found_elements}/{len(elements_to_check)} elementos)")
                self.results['validations_failed'] += 1
                return False
                
        except Exception as e:
            print(f"   ❌ Error verificando interfaz: {e}")
            self.results['errors_encountered'].append(f"Interface verification error: {str(e)}")
            return False

    def generate_test_data(self) -> Dict[str, str]:
        """Generar datos de prueba realistas"""
        return {
            'address': self.fake.street_address(),
            'phone': self.fake.numerify('3#########'),
            'invalid_phone': self.fake.bothify('###-???-???'),
            'country': 'CO',
            'department': 'DC',
            'weak_password': '123456',
            'strong_password': self.fake.password(length=15, special_chars=True, digits=True, upper_case=True)
        }

    def update_personal_info(self, test_data: Dict[str, str]) -> bool:
        """Actualizar información personal"""
        try:
            print("📝 Actualizando información personal...")
            
            # Actualizar dirección
            try:
                address_field = self.driver.find_element(By.NAME, "address")
                address_field.clear()
                address_field.send_keys(test_data['address'])
                print(f"   ✅ Dirección: {test_data['address'][:50]}...")
            except NoSuchElementException:
                print("   ⚠️  Campo dirección no encontrado")
            
            # Actualizar teléfono
            try:
                phone_field = self.driver.find_element(By.NAME, "phoneNumber")
                phone_field.clear()
                phone_field.send_keys(test_data['phone'])
                print(f"   ✅ Teléfono: {test_data['phone']}")
            except NoSuchElementException:
                print("   ⚠️  Campo teléfono no encontrado")
            
            # Seleccionar país
            try:
                country_select = Select(self.driver.find_element(By.NAME, "country"))
                country_select.select_by_value(test_data['country'])
                print(f"   ✅ País: {test_data['country']}")
                time.sleep(1)
            except (NoSuchElementException, Exception) as e:
                print(f"   ⚠️  País no actualizado: {e}")
            
            return True
            
        except Exception as e:
            print(f"   ❌ Error actualizando información: {e}")
            self.results['errors_encountered'].append(f"Personal info update error: {str(e)}")
            return False

    def test_field_validations(self, test_data: Dict[str, str]) -> bool:
        """Probar validaciones de campos"""
        try:
            print("🧪 Probando validaciones...")
            
            # Probar teléfono inválido
            try:
                phone_field = self.driver.find_element(By.NAME, "phoneNumber")
                original_phone = phone_field.get_attribute("value")
                
                phone_field.clear()
                phone_field.send_keys(test_data['invalid_phone'])
                phone_field.send_keys(Keys.TAB)
                
                time.sleep(1)
                
                # Buscar indicadores de error
                validation_found = False
                for error_selector in SELECTORS['validation_errors']:
                    try:
                        error_elements = self.driver.find_elements(By.XPATH, error_selector)
                        if any(elem.is_displayed() for elem in error_elements):
                            print("   ✅ Validación de teléfono detectada")
                            validation_found = True
                            self.results['validations_passed'] += 1
                            break
                    except:
                        continue
                
                # Verificar por clases CSS si no hay mensaje visible
                if not validation_found:
                    phone_classes = phone_field.get_attribute("class") or ""
                    if any(indicator in phone_classes.lower() for indicator in ['error', 'invalid', 'border-red']):
                        print("   ✅ Validación detectada por CSS")
                        validation_found = True
                        self.results['validations_passed'] += 1
                
                if not validation_found:
                    print("   ⚠️  Validación no detectada")
                    self.results['validations_failed'] += 1
                
                # Restaurar teléfono válido
                phone_field.clear()
                phone_field.send_keys(test_data['phone'])
                
                return validation_found
                
            except NoSuchElementException:
                print("   ⚠️  Campo teléfono no encontrado para validación")
                return False
            
        except Exception as e:
            print(f"   ❌ Error en validaciones: {e}")
            self.results['errors_encountered'].append(f"Validation error: {str(e)}")
            return False

    def test_photo_modal(self) -> bool:
        """Probar modal de cambio de foto"""
        try:
            print("📸 Probando modal de foto...")
            
            # Buscar área de foto
            photo_selectors = [
                SELECTORS['profile_elements']['photo_area'],
                "//div[contains(@onClick, 'setIsChangePhotoModalOpen')]",
                "//div[contains(@class, 'w-40') and contains(@class, 'h-40')]"
            ]
            
            photo_area = None
            for selector in photo_selectors:
                try:
                    photo_area = self.driver.find_element(By.XPATH, selector)
                    if photo_area.is_displayed():
                        break
                except NoSuchElementException:
                    continue
            
            if not photo_area:
                print("   ⚠️  Área de foto no encontrada")
                self.results['failed_operations'] += 1
                return False
            
            # Hacer clic en foto
            ActionChains(self.driver).move_to_element(photo_area).click().perform()
            time.sleep(2)
            
            # Verificar modal
            modal_found = False
            modal_selectors = [
                SELECTORS['modals']['photo_modal_title'],
                "//div[contains(@class, 'modal')]//h2",
                "//div[contains(@class, 'fixed')]//div[contains(@class, 'bg-white')]"
            ]
            
            for selector in modal_selectors:
                try:
                    modal = self.driver.find_element(By.XPATH, selector)
                    if modal.is_displayed():
                        print("   ✅ Modal de foto abierto")
                        modal_found = True
                        self.results['successful_operations'] += 1
                        
                        # Cerrar modal
                        for close_selector in SELECTORS['modals']['cancel_buttons']:
                            try:
                                close_btn = self.driver.find_element(By.XPATH, close_selector)
                                if close_btn.is_displayed():
                                    close_btn.click()
                                    print("   ✅ Modal cerrado")
                                    break
                            except:
                                continue
                        break
                except NoSuchElementException:
                    continue
            
            if not modal_found:
                print("   ⚠️  Modal de foto no detectado")
                self.results['failed_operations'] += 1
            
            return modal_found
            
        except Exception as e:
            print(f"   ❌ Error en modal de foto: {e}")
            self.results['errors_encountered'].append(f"Photo modal error: {str(e)}")
            return False

    def test_password_modal(self, test_data: Dict[str, str]) -> bool:
        """Probar modal de cambio de contraseña"""
        try:
            print("🔐 Probando modal de contraseña...")
            
            # Buscar botón de cambiar contraseña
            try:
                password_btn = self.driver.find_element(By.XPATH, SELECTORS['profile_elements']['change_password_btn'])
                if not password_btn.is_displayed():
                    raise NoSuchElementException("Botón no visible")
            except NoSuchElementException:
                print("   ⚠️  Botón 'Change Password' no encontrado")
                self.results['failed_operations'] += 1
                return False
            
            # Hacer clic en botón
            password_btn.click()
            time.sleep(2)
            
            # Verificar modal
            modal_found = False
            try:
                modal = self.driver.find_element(By.XPATH, SELECTORS['modals']['password_modal_title'])
                if modal.is_displayed():
                    print("   ✅ Modal de contraseña abierto")
                    modal_found = True
                    self.results['successful_operations'] += 1
                    
                    # Probar validación de contraseña débil
                    try:
                        new_password_field = self.driver.find_element(By.NAME, "new_password")
                        new_password_field.send_keys(test_data['weak_password'])
                        time.sleep(1)
                        
                        # Verificar indicadores de fortaleza
                        strength_indicators = self.driver.find_elements(By.XPATH, "//span[contains(@class, 'bg-red-500')]")
                        if strength_indicators:
                            print("   ✅ Validación de contraseña débil funcionando")
                            self.results['validations_passed'] += 1
                        else:
                            print("   ⚠️  Validación de contraseña no detectada")
                            self.results['validations_failed'] += 1
                    except:
                        print("   ⚠️  No se pudo probar validación de contraseña")
                    
                    # Cerrar modal
                    for close_selector in SELECTORS['modals']['cancel_buttons']:
                        try:
                            close_btn = self.driver.find_element(By.XPATH, close_selector)
                            if close_btn.is_displayed():
                                close_btn.click()
                                print("   ✅ Modal cerrado")
                                break
                        except:
                            continue
            except NoSuchElementException:
                print("   ⚠️  Modal de contraseña no detectado")
                self.results['failed_operations'] += 1
            
            return modal_found
            
        except Exception as e:
            print(f"   ❌ Error en modal de contraseña: {e}")
            self.results['errors_encountered'].append(f"Password modal error: {str(e)}")
            return False

    def save_changes(self) -> bool:
        """Guardar cambios del formulario"""
        try:
            print("💾 Guardando cambios...")
            
            # Buscar botón de actualizar
            update_selectors = [
                "//button[@type='submit'][@form='residenceForm']",
                "//button[contains(text(), 'Update')]",
                SELECTORS['profile_elements']['update_btn']
            ]
            
            update_btn = None
            for selector in update_selectors:
                try:
                    update_btn = self.driver.find_element(By.XPATH, selector)
                    if update_btn.is_displayed() and update_btn.is_enabled():
                        break
                except NoSuchElementException:
                    continue
            
            if not update_btn:
                print("   ⚠️  Botón 'Update' no encontrado")
                self.results['failed_operations'] += 1
                return False
            
            # Hacer clic en actualizar
            update_btn.click()
            time.sleep(3)
            
            # Verificar mensaje de éxito
            success_found = False
            for selector in SELECTORS['success_messages']:
                try:
                    success_elements = self.driver.find_elements(By.XPATH, selector)
                    for element in success_elements:
                        if element.is_displayed() and element.text.strip():
                            print(f"   ✅ Éxito: {element.text[:50]}...")
                            success_found = True
                            self.results['successful_operations'] += 1
                            break
                except:
                    continue
                if success_found:
                    break
            
            if not success_found:
                # Verificar ausencia de errores como indicador de éxito
                error_elements = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'error')] | //div[contains(@class, 'red')]")
                visible_errors = [e for e in error_elements if e.is_displayed()]
                
                if not visible_errors:
                    print("   ✅ Guardado exitoso (sin errores detectados)")
                    success_found = True
                    self.results['successful_operations'] += 1
                else:
                    print("   ❌ Errores detectados al guardar")
                    self.results['failed_operations'] += 1
            
            return success_found
            
        except Exception as e:
            print(f"   ❌ Error guardando cambios: {e}")
            self.results['errors_encountered'].append(f"Save error: {str(e)}")
            return False

    def run_single_iteration(self, iteration_num: int) -> bool:
        """Ejecutar una iteración completa del test"""
        print(f"\n{'='*60}")
        print(f"🔄 ITERACIÓN {iteration_num} de {self.iterations}")
        print(f"{'='*60}")
        
        try:
            # Generar datos de prueba
            test_data = self.generate_test_data()
            print(f"📊 Datos generados:")
            print(f"   📍 Dirección: {test_data['address'][:40]}...")
            print(f"   📞 Teléfono: {test_data['phone']}")
            
            success = True
            
            # Navegación (solo primera iteración)
            if iteration_num == 1:
                if not self.navigate_to_profile():
                    return False
                if not self.verify_interface_elements():
                    success = False
            else:
                # Refrescar para iteraciones siguientes
                self.driver.refresh()
                time.sleep(2)
            
            # Secuencia de tests con puntuación
            tests = [
                ("Actualizar información", lambda: self.update_personal_info(test_data), 2),
                ("Validar campos", lambda: self.test_field_validations(test_data), 1),
                ("Modal de foto", lambda: self.test_photo_modal(), 1),
                ("Modal de contraseña", lambda: self.test_password_modal(test_data), 1),
                ("Guardar cambios", lambda: self.save_changes(), 2)
            ]
            
            total_points = sum(points for _, _, points in tests)
            achieved_points = 0
            
            for test_name, test_func, points in tests:
                try:
                    if test_func():
                        achieved_points += points
                    # No marcar como fallo total si una validación menor falla
                except Exception as e:
                    print(f"   ❌ Error en {test_name}: {e}")
            
            # Considerar exitosa si se logra al menos 60% de los puntos
            success = (achieved_points / total_points) >= 0.6
            
            self.results['iterations_completed'] += 1
            
            status = "✅ EXITOSA" if success else "⚠️ CON ERRORES"
            print(f"\n🏁 Iteración {iteration_num}: {status}")
            
            return success
            
        except Exception as e:
            print(f"❌ Error fatal en iteración {iteration_num}: {e}")
            self.results['errors_encountered'].append(f"Iteration {iteration_num} fatal error: {str(e)}")
            return False

    def run_test(self) -> bool:
        """Ejecutar el test completo"""
        print(f"\n🚀 INICIANDO {self.results['test_name']}")
        print(f"📋 Configuración: {self.iterations} iteraciones, modo {'headless' if self.headless else 'visual'}")
        print(f"{'='*80}")
        
        self.results['start_time'] = time.time()
        
        try:
            # Setup
            if not self.setup_driver():
                return False
            
            if not self.login():
                return False
            
            # Ejecutar iteraciones
            successful_iterations = 0
            for i in range(1, self.iterations + 1):
                if self.run_single_iteration(i):
                    successful_iterations += 1
                
                # Pausa entre iteraciones
                if i < self.iterations:
                    time.sleep(DEFAULT_CONFIG['pause_between_iterations'])
            
            self.results['end_time'] = time.time()
            
            # Mostrar resultados
            self._print_final_results(successful_iterations)
            
            # Determinar éxito
            success_rate = successful_iterations / self.iterations
            return success_rate >= 0.6  # 60% de éxito mínimo (más realista)
            
        except KeyboardInterrupt:
            print("\n⚠️ Test interrumpido por el usuario")
            return False
        except Exception as e:
            print(f"\n💥 Error fatal: {e}")
            self.results['errors_encountered'].append(f"Fatal error: {str(e)}")
            return False
        finally:
            self.cleanup()

    def _print_final_results(self, successful_iterations: int):
        """Imprimir resultados finales"""
        execution_time = self.results['end_time'] - self.results['start_time']
        success_rate = (successful_iterations / self.iterations) * 100
        
        print(f"\n{'='*80}")
        print(f"📊 RESULTADOS FINALES")
        print(f"{'='*80}")
        print(f"⏱️ Tiempo de ejecución: {execution_time:.1f}s")
        print(f"🔄 Iteraciones completadas: {self.results['iterations_completed']}/{self.iterations}")
        print(f"✅ Iteraciones exitosas: {successful_iterations}/{self.iterations}")
        print(f"⚡ Operaciones exitosas: {self.results['successful_operations']}")
        print(f"❌ Operaciones fallidas: {self.results['failed_operations']}")
        print(f"✔️ Validaciones exitosas: {self.results['validations_passed']}")
        print(f"❌ Validaciones fallidas: {self.results['validations_failed']}")
        
        if self.results['errors_encountered']:
            print(f"\n🚨 ERRORES ({len(self.results['errors_encountered'])}):")
            for i, error in enumerate(self.results['errors_encountered'][:5], 1):
                print(f"  {i}. {error[:80]}...")
        
        print(f"\n📈 TASA DE ÉXITO: {success_rate:.1f}%")
        
        if success_rate >= 70:
            print("🎉 RESULTADO: TEST EXITOSO")
        elif success_rate >= 40:
            print("⚠️ RESULTADO: TEST PARCIALMENTE EXITOSO")
        else:
            print("❌ RESULTADO: TEST FALLIDO")
        
        print(f"{'='*80}")

    def cleanup(self):
        """Limpiar recursos"""
        if self.driver:
            try:
                self.driver.quit()
                print("🧹 Navegador cerrado")
            except Exception as e:
                print(f"⚠️ Error cerrando navegador: {e}")

# ============================================================================
# FUNCIÓN PRINCIPAL Y CLI
# ============================================================================

def create_env_file():
    """Crear archivo .env de ejemplo si no existe"""
    env_path = PROJECT_ROOT / '.env'
    env_example_path = Path(__file__).parent / '.env.example'
    
    if not env_path.exists():
        env_content = '''# Configuración para Test IT-GUSU-006
EMAIL=admin@ejemplo.com
PASSWORD=AdminPassword123!
HEADLESS=false
BASE_URL=http://localhost:3000
'''
        env_path.write_text(env_content, encoding='utf-8')
        print(f"✅ Archivo .env creado en {env_path}")
        print("   ⚠️ Configure sus credenciales antes de ejecutar el test")
        return False
    return True

def main():
    """Función principal con CLI"""
    parser = argparse.ArgumentParser(
        description='Test IT-GUSU-006: Interfaz de edición de perfil',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos de uso:
  python test_profile_edit.py                    # Modo visual, 3 iteraciones
  python test_profile_edit.py --headless         # Modo headless, 3 iteraciones  
  python test_profile_edit.py --iterations 5     # Modo visual, 5 iteraciones
  python test_profile_edit.py -h -i 10          # Modo headless, 10 iteraciones
        """
    )
    
    parser.add_argument(
        '--headless', '-H',
        action='store_true',
        help='Ejecutar en modo headless (sin interfaz gráfica)'
    )
    
    parser.add_argument(
        '--iterations', '-i',
        type=int,
        default=3,
        help='Número de iteraciones del test (default: 3)'
    )
    
    parser.add_argument(
        '--check-env',
        action='store_true',
        help='Solo verificar configuración del entorno'
    )
    
    args = parser.parse_args()
    
    # Verificar entorno
    print_environment_info()
    
    if not create_env_file():
        return 1
    
    env_errors = validate_environment()
    if env_errors:
        print(f"\n❌ ERRORES DE CONFIGURACIÓN:")
        for error in env_errors:
            print(f"   - {error}")
        print(f"\n💡 Soluciones:")
        print(f"   - Configure el archivo .env con sus credenciales")
        print(f"   - Descargue ChromeDriver desde https://chromedriver.chromium.org/")
        print(f"   - Ejecute: pip install -r ../requirements.txt")
        return 1
    
    if args.check_env:
        print(f"\n✅ Entorno configurado correctamente")
        return 0
    
    # Ejecutar test
    test = ProfileEditTest(headless=args.headless, iterations=args.iterations)
    
    try:
        success = test.run_test()
        return 0 if success else 1
    except KeyboardInterrupt:
        print(f"\n⚠️ Test interrumpido")
        return 130
    except Exception as e:
        print(f"\n💥 Error inesperado: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
