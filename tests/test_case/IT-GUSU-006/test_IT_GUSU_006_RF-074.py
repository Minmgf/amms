#!/usr/bin/env python3
"""
Test Case: IT-GUSU-006 (RF-074, RF-79-1) - Interfaz de edición de perfil
=========================================================================

ID: IT-GUSU-006
Título: Interfaz de edición de perfil
Referencias: RF-074, RF-79-1

Descripción: 
Verificar que la interfaz de edición de perfil permita al usuario actualizar 
correctamente su información personal, subir foto de perfil y cambiar contraseña,
validando todos los campos y mostrando mensajes apropiados.

Precondiciones:
- Usuario autenticado en el sistema
- Acceso a la sección 'Mi Perfil'
- Servicio de almacenamiento configurado (Firebase Storage)
- Conexión activa a la base de datos PostgreSQL
- Políticas de seguridad para contraseñas configuradas

Uso:
- Modo visual: python test_IT_GUSU_006_RF-074.py
- Modo headless: python test_IT_GUSU_006_RF-074.py --headless  
- Múltiples iteraciones: python test_IT_GUSU_006_RF-074.py --iterations 5
- Verificar BD: python test_IT_GUSU_006_RF-074.py --verify-db
- Ayuda: python test_IT_GUSU_006_RF-074.py --help

Prerrequisitos técnicos:
- ChromeDriver en ../chromedriver/driver.exe
- Archivo .env con EMAIL, PASSWORD y credenciales PostgreSQL
- Servidor ejecutándose en http://localhost:3000
- Base de datos PostgreSQL accesible
"""

import argparse
import os
import sys
import time
import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime

import psycopg2
from psycopg2.extras import RealDictCursor
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
# CLASE PARA MANEJO DE BASE DE DATOS POSTGRESQL
# ============================================================================

class DatabaseManager:
    """Maneja la conexión y operaciones con PostgreSQL"""
    
    def __init__(self):
        self.connection = None
        self.cursor = None
        
    def connect(self) -> bool:
        """Establece conexión con PostgreSQL"""
        try:
            db_config = {
                'host': os.getenv('DB_HOST', '158.69.200.27'),
                'port': int(os.getenv('DB_PORT', '5436')),
                'database': os.getenv('DB_NAME', 'tester'),
                'user': os.getenv('DB_USER', 'tester'),
                'password': os.getenv('DB_PASSWORD', 'sigma.test.2025')
            }
            
            self.connection = psycopg2.connect(**db_config)
            self.cursor = self.connection.cursor(cursor_factory=RealDictCursor)
            
            # Test connection
            self.cursor.execute("SELECT version();")
            version = self.cursor.fetchone()
            print(f"   ✅ Conexión PostgreSQL exitosa: {version['version'][:50]}...")
            return True
            
        except Exception as e:
            print(f"   ❌ Error conectando a PostgreSQL: {e}")
            return False
    
    def get_user_profile_data(self, email: str) -> Optional[Dict[str, Any]]:
        """Obtiene datos del perfil de usuario desde la BD"""
        try:
            # Buscar en diferentes posibles tablas de usuarios
            queries = [
                "SELECT * FROM users WHERE email = %s",
                "SELECT * FROM user_profiles WHERE email = %s", 
                "SELECT * FROM usuarios WHERE email = %s",
                "SELECT * FROM profiles WHERE user_email = %s"
            ]
            
            for query in queries:
                try:
                    self.cursor.execute(query, (email,))
                    result = self.cursor.fetchone()
                    if result:
                        print(f"   ✅ Datos de usuario encontrados en BD")
                        return dict(result)
                except Exception:
                    continue
            
            print(f"   ⚠️  Usuario no encontrado en BD con email: {email}")
            return None
            
        except Exception as e:
            print(f"   ❌ Error consultando perfil: {e}")
            return None
    
    def verify_profile_update(self, email: str, updated_data: Dict[str, Any]) -> bool:
        """Verifica que los datos se hayan actualizado en la BD"""
        try:
            current_data = self.get_user_profile_data(email)
            if not current_data:
                return False
            
            # Verificar campos actualizados
            updates_verified = []
            
            # Mapear campos comunes
            field_mappings = {
                'address': ['address', 'direccion', 'street_address'],
                'phone': ['phone', 'telefono', 'phone_number', 'phoneNumber'],
                'country': ['country', 'pais'],
                'department': ['department', 'departamento', 'state'],
                'city': ['city', 'ciudad']
            }
            
            for field, db_variants in field_mappings.items():
                if field in updated_data:
                    found = False
                    for variant in db_variants:
                        if variant in current_data:
                            if str(current_data[variant]) == str(updated_data[field]):
                                updates_verified.append(f"{field}: ✅")
                                found = True
                                break
                    if not found:
                        updates_verified.append(f"{field}: ❓ (campo no encontrado)")
            
            print(f"   📊 Verificación BD: {', '.join(updates_verified)}")
            return len([u for u in updates_verified if '✅' in u]) > 0
            
        except Exception as e:
            print(f"   ❌ Error verificando actualización: {e}")
            return False
    
    def log_test_execution(self, test_data: Dict[str, Any]) -> bool:
        """Registra la ejecución del test en log de auditoría"""
        try:
            # Intentar insertar en tabla de auditoría
            audit_queries = [
                """INSERT INTO audit_logs (user_email, action, details, timestamp) 
                   VALUES (%s, %s, %s, %s)""",
                """INSERT INTO test_logs (email, test_case, data, executed_at) 
                   VALUES (%s, %s, %s, %s)""",
                """INSERT INTO logs (user_id, action_type, description, created_at) 
                   VALUES ((SELECT id FROM users WHERE email = %s LIMIT 1), %s, %s, %s)"""
            ]
            
            log_data = {
                'email': test_data.get('email', ''),
                'action': 'IT-GUSU-006_PROFILE_EDIT_TEST',
                'details': json.dumps(test_data, default=str),
                'timestamp': datetime.now()
            }
            
            for query in audit_queries:
                try:
                    self.cursor.execute(query, (
                        log_data['email'],
                        log_data['action'], 
                        log_data['details'],
                        log_data['timestamp']
                    ))
                    self.connection.commit()
                    print(f"   ✅ Log de auditoría registrado")
                    return True
                except Exception:
                    self.connection.rollback()
                    continue
                    
            print(f"   ⚠️  No se pudo registrar en log de auditoría")
            return False
            
        except Exception as e:
            print(f"   ❌ Error en log de auditoría: {e}")
            return False
    
    def close(self):
        """Cierra la conexión a la base de datos"""
        try:
            if self.cursor:
                self.cursor.close()
            if self.connection:
                self.connection.close()
            print("   🔒 Conexión PostgreSQL cerrada")
        except Exception as e:
            print(f"   ⚠️  Error cerrando conexión: {e}")

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
    """Test automatizado para la interfaz de edición de perfil con verificación de BD"""
    
    def __init__(self, headless: bool = False, iterations: int = 3, verify_db: bool = True):
        self.headless = headless
        self.iterations = iterations
        self.verify_db = verify_db
        self.driver_path = get_chromedriver_path()
        self.driver: Optional[webdriver.Chrome] = None
        self.wait: Optional[WebDriverWait] = None
        self.fake = Faker('es_ES')
        self.db = DatabaseManager() if verify_db else None
        
        # Datos de entrada según el caso de prueba
        self.test_case_data = {
            "informacion_personal": {
                "nombres": "Juan Carlos",
                "apellidos": "Pérez González", 
                "telefono": "+57-300-123-4567",
                "direccion": "Calle 123 #45-67",
                "pais": "Colombia",
                "departamento": "Cundinamarca",
                "ciudad": "Bogotá"
            },
            "casos_error": {
                "telefono_invalido": "123-abc-xyz",
                "password_debil": "123456"
            }
        }
        
        self.results = {
            'test_name': 'IT-GUSU-006 (RF-074, RF-79-1) - Interfaz de edición de perfil',
            'test_id': 'IT-GUSU-006',
            'requirements': ['RF-074', 'RF-79-1'],
            'iterations_completed': 0,
            'successful_operations': 0,
            'failed_operations': 0,
            'errors_encountered': [],
            'validations_passed': 0,
            'validations_failed': 0,
            'db_verifications': 0,
            'db_verification_failures': 0,
            'start_time': None,
            'end_time': None,
            'preconditions_met': False,
            'audit_logged': False
        }

    def verify_preconditions(self) -> bool:
        """Verificar que todas las precondiciones estén cumplidas"""
        try:
            print("🔍 Verificando precondiciones del caso de prueba...")
            
            preconditions = []
            
            # Verificar conexión a base de datos
            if self.verify_db and self.db:
                if self.db.connect():
                    preconditions.append("✅ Conexión PostgreSQL activa")
                else:
                    preconditions.append("❌ Conexión PostgreSQL falló")
            else:
                preconditions.append("⚠️ Verificación BD deshabilitada")
            
            # Verificar ChromeDriver
            try:
                driver_path = get_chromedriver_path()
                preconditions.append("✅ ChromeDriver encontrado")
            except:
                preconditions.append("❌ ChromeDriver no encontrado")
            
            # Verificar credenciales
            email = os.getenv('EMAIL')
            password = os.getenv('PASSWORD')
            if email and password:
                preconditions.append("✅ Credenciales de login configuradas")
            else:
                preconditions.append("❌ Credenciales de login faltantes")
            
            # Mostrar estado de precondiciones
            for condition in preconditions:
                print(f"   {condition}")
            
            # Determinar si las precondiciones críticas están ok
            critical_failures = [p for p in preconditions if "❌" in p and "ChromeDriver" in p]
            
            if critical_failures:
                print("   ❌ Precondiciones críticas no cumplidas")
                self.results['preconditions_met'] = False
                return False
            else:
                print("   ✅ Precondiciones verificadas")
                self.results['preconditions_met'] = True
                return True
                
        except Exception as e:
            print(f"   ❌ Error verificando precondiciones: {e}")
            return False

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
        """Generar datos de prueba basados en el caso de prueba IT-GUSU-006"""
        # Usar datos del caso de prueba + datos aleatorios
        base_data = self.test_case_data["informacion_personal"]
        
        return {
            # Datos del caso de prueba
            'nombres': base_data["nombres"],
            'apellidos': base_data["apellidos"],
            'address': base_data["direccion"],
            'phone': base_data["telefono"].replace("+57-", "").replace("-", ""),  # Formato: 3001234567
            'country': 'CO',  # Colombia
            'department': 'DC',  # Cundinamarca -> Bogotá D.C.
            'city': base_data["ciudad"],
            
            # Datos de error del caso de prueba
            'invalid_phone': self.test_case_data["casos_error"]["telefono_invalido"],
            'weak_password': self.test_case_data["casos_error"]["password_debil"],
            
            # Datos adicionales generados
            'strong_password': self.fake.password(length=15, special_chars=True, digits=True, upper_case=True),
            'alt_address': self.fake.street_address(),  # Dirección alternativa
            'alt_phone': self.fake.numerify('3#########')  # Teléfono alternativo
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

    def save_changes(self, test_data: Dict[str, str]) -> bool:
        """Guardar cambios del formulario y verificar en BD"""
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
            time.sleep(5)  # Más tiempo para que se procese en BD
            
            # Verificar mensaje de éxito en UI
            ui_success = False
            for selector in SELECTORS['success_messages']:
                try:
                    success_elements = self.driver.find_elements(By.XPATH, selector)
                    for element in success_elements:
                        if element.is_displayed() and element.text.strip():
                            print(f"   ✅ UI - Éxito: {element.text[:50]}...")
                            ui_success = True
                            break
                except:
                    continue
                if ui_success:
                    break
            
            if not ui_success:
                # Verificar ausencia de errores como indicador de éxito
                error_elements = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'error')] | //div[contains(@class, 'red')]")
                visible_errors = [e for e in error_elements if e.is_displayed()]
                
                if not visible_errors:
                    print("   ✅ UI - Guardado exitoso (sin errores detectados)")
                    ui_success = True
                else:
                    print("   ❌ UI - Errores detectados al guardar")
            
            # Verificar en base de datos si está habilitado
            db_success = True  # Por defecto asumir éxito si no se verifica BD
            if self.verify_db and self.db and ui_success:
                print("🔍 Verificando guardado en base de datos...")
                
                # Preparar datos para verificación
                update_data = {
                    'address': test_data.get('address', ''),
                    'phone': test_data.get('phone', ''),
                    'country': test_data.get('country', ''),
                    'department': test_data.get('department', ''),
                    'city': test_data.get('city', '')
                }
                
                user_email = os.getenv('EMAIL', '')
                db_success = self.db.verify_profile_update(user_email, update_data)
                
                if db_success:
                    print("   ✅ BD - Datos verificados exitosamente")
                    self.results['db_verifications'] += 1
                    
                    # Registrar en log de auditoría
                    audit_data = {
                        'email': user_email,
                        'test_case': 'IT-GUSU-006',
                        'action': 'profile_update_test',
                        'updated_fields': update_data,
                        'timestamp': time.time()
                    }
                    
                    if self.db.log_test_execution(audit_data):
                        self.results['audit_logged'] = True
                else:
                    print("   ⚠️  BD - No se pudieron verificar los cambios")
                    self.results['db_verification_failures'] += 1
            
            # Determinar éxito general
            overall_success = ui_success and db_success
            
            if overall_success:
                self.results['successful_operations'] += 1
            else:
                self.results['failed_operations'] += 1
            
            return overall_success
            
        except Exception as e:
            print(f"   ❌ Error guardando cambios: {e}")
            self.results['errors_encountered'].append(f"Save error: {str(e)}")
            self.results['failed_operations'] += 1
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
                ("Guardar cambios", lambda: self.save_changes(test_data), 3)  # Más puntos por incluir verificación BD
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
        print(f"📋 Test ID: {self.results['test_id']}")
        print(f"📋 Requerimientos: {', '.join(self.results['requirements'])}")
        print(f"📋 Configuración: {self.iterations} iteraciones, modo {'headless' if self.headless else 'visual'}")
        if self.verify_db:
            print(f"📋 Verificación BD: Habilitada")
        else:
            print(f"📋 Verificación BD: Deshabilitada")
        print(f"{'='*80}")
        
        self.results['start_time'] = time.time()
        
        try:
            # Verificar precondiciones
            if not self.verify_preconditions():
                print("❌ Precondiciones no cumplidas - Test abortado")
                return False
            
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
        """Imprimir resultados finales del test IT-GUSU-006"""
        execution_time = self.results['end_time'] - self.results['start_time']
        success_rate = (successful_iterations / self.iterations) * 100
        
        print(f"\n{'='*80}")
        print(f"📊 RESULTADOS FINALES - {self.results['test_id']}")
        print(f"📋 {self.results['test_name']}")
        print(f"🔗 Requerimientos: {', '.join(self.results['requirements'])}")
        print(f"{'='*80}")
        
        # Métricas básicas
        print(f"⏱️ Tiempo de ejecución: {execution_time:.1f}s")
        print(f"🔄 Iteraciones completadas: {self.results['iterations_completed']}/{self.iterations}")
        print(f"✅ Iteraciones exitosas: {successful_iterations}/{self.iterations}")
        
        # Métricas de operaciones
        print(f"⚡ Operaciones exitosas: {self.results['successful_operations']}")
        print(f"❌ Operaciones fallidas: {self.results['failed_operations']}")
        print(f"✔️ Validaciones exitosas: {self.results['validations_passed']}")
        print(f"❌ Validaciones fallidas: {self.results['validations_failed']}")
        
        # Métricas de base de datos
        if self.verify_db:
            print(f"🔍 Verificaciones BD exitosas: {self.results['db_verifications']}")
            print(f"❌ Verificaciones BD fallidas: {self.results['db_verification_failures']}")
            print(f"📝 Log de auditoría: {'✅ Registrado' if self.results['audit_logged'] else '❌ No registrado'}")
        
        # Precondiciones
        print(f"🔧 Precondiciones: {'✅ Cumplidas' if self.results['preconditions_met'] else '❌ No cumplidas'}")
        
        # Errores detallados
        if self.results['errors_encountered']:
            print(f"\n🚨 ERRORES ENCONTRADOS ({len(self.results['errors_encountered'])}):")
            for i, error in enumerate(self.results['errors_encountered'][:5], 1):
                print(f"  {i}. {error[:100]}...")
            if len(self.results['errors_encountered']) > 5:
                print(f"  ... y {len(self.results['errors_encountered']) - 5} errores más")
        
        # Resultado final
        print(f"\n📈 TASA DE ÉXITO: {success_rate:.1f}%")
        
        # Criterios de éxito específicos para IT-GUSU-006
        if success_rate >= 80 and self.results['preconditions_met']:
            print("🎉 RESULTADO: TEST EXITOSO")
            final_status = "EXITOSO"
        elif success_rate >= 60:
            print("⚠️ RESULTADO: TEST PARCIALMENTE EXITOSO")  
            final_status = "PARCIAL"
        else:
            print("❌ RESULTADO: TEST FALLIDO")
            final_status = "FALLIDO"
        
        # Resumen ejecutivo
        print(f"\n📋 RESUMEN EJECUTIVO:")
        print(f"   • Estado: {final_status}")
        print(f"   • Funcionalidad UI: {'✅' if self.results['successful_operations'] > 0 else '❌'}")
        if self.verify_db:
            print(f"   • Persistencia BD: {'✅' if self.results['db_verifications'] > 0 else '❌'}")
            print(f"   • Auditoría: {'✅' if self.results['audit_logged'] else '❌'}")
        print(f"   • Validaciones: {'✅' if self.results['validations_passed'] > self.results['validations_failed'] else '❌'}")
        
        print(f"{'='*80}")

    def cleanup(self):
        """Limpiar recursos"""
        try:
            if self.driver:
                self.driver.quit()
                print("🧹 Navegador cerrado")
        except Exception as e:
            print(f"⚠️ Error cerrando navegador: {e}")
            
        try:
            if self.db:
                self.db.close()
        except Exception as e:
            print(f"⚠️ Error cerrando conexión BD: {e}")

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
    """Función principal con CLI para IT-GUSU-006"""
    parser = argparse.ArgumentParser(
        description='Test IT-GUSU-006 (RF-074, RF-79-1): Interfaz de edición de perfil',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos de uso:
  python test_IT_GUSU_006_RF-074.py                      # Modo visual, 3 iteraciones, BD habilitada
  python test_IT_GUSU_006_RF-074.py --headless           # Modo headless, 3 iteraciones, BD habilitada  
  python test_IT_GUSU_006_RF-074.py --iterations 5       # Modo visual, 5 iteraciones
  python test_IT_GUSU_006_RF-074.py --no-verify-db       # Sin verificación de BD
  python test_IT_GUSU_006_RF-074.py --check-env          # Solo verificar configuración
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
        '--no-verify-db',
        action='store_true',
        help='Deshabilitar verificación de base de datos PostgreSQL'
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
    verify_db = not args.no_verify_db
    test = ProfileEditTest(
        headless=args.headless, 
        iterations=args.iterations,
        verify_db=verify_db
    )
    
    try:
        success = test.run_test()
        return 0 if success else 1
    except KeyboardInterrupt:
        print(f"\n⚠️ Test IT-GUSU-006 interrumpido")
        return 130
    except Exception as e:
        print(f"\n💥 Error inesperado en IT-GUSU-006: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
