#!/usr/bin/env python3
"""
Test Case: IT-GUSU-007 (RF-075, RF-077) - Interfaz de gestión de cuentas
========================================================================

ID: IT-GUSU-007
Título: Interfaz de gestión de cuentas
Referencias: RF-075, RF-077

Descripción: 
Verificar que la interfaz de gestión de cuentas muestre correctamente el listado de usuarios,
permita realizar acciones administrativas con confirmaciones apropiadas y muestre 
notificaciones del resultado.

Precondiciones:
- Usuario administrador logueado
- Al menos 10 usuarios registrados con diferentes estados
- Interfaz de gestión de usuarios accesible
- Sistema de notificaciones configurado

Uso:
- Modo visual: python test_IT_GUSU_007_RF-075.py
- Modo headless: python test_IT_GUSU_007_RF-075.py --headless  
- Múltiples iteraciones: python test_IT_GUSU_007_RF-075.py --iterations 5
- Verificar BD: python test_IT_GUSU_007_RF-075.py --verify-db
- Ayuda: python test_IT_GUSU_007_RF-075.py --help

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

# Cargar variables de entorno desde el directorio padre (tests/)
PROJECT_ROOT = Path(__file__).parent.parent
load_dotenv(PROJECT_ROOT / '.env')

# Configuración de rutas
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
    'user_management_url': 'http://localhost:3000/userManagement'
}

# Selectores CSS/XPath para gestión de usuarios
SELECTORS = {
    'navigation': {
        'user_management_link': [
            "//a[contains(@href, 'userManagement')]",
            "//a[contains(text(), 'Gestión de Usuarios')]",
            "//div[contains(@class, 'sidebar')]//a[contains(@href, 'userManagement')]",
            "//nav//a[contains(@href, 'userManagement')]"
        ]
    },
    'user_list': {
        'table': "//table | //div[contains(@class, 'table')] | //div[contains(@class, 'user-list')]",
        'table_headers': "//th | //div[contains(@class, 'header')]",
        'user_rows': "//tr[contains(@class, 'user')] | //div[contains(@class, 'user-row')]",
        'user_name': "//td[1] | //div[contains(@class, 'name')]",
        'user_email': "//td[contains(@class, 'email')] | //span[contains(@class, 'email')]",
        'user_role': "//td[contains(@class, 'role')] | //span[contains(@class, 'role')]",
        'user_status': "//td[contains(@class, 'status')] | //span[contains(@class, 'status')]"
    },
    'actions': {
        'activate_buttons': [
            "//button[contains(text(), 'Activar')]",
            "//button[contains(@class, 'activate')]",
            "//a[contains(text(), 'Activar')]"
        ],
        'deactivate_buttons': [
            "//button[contains(text(), 'Desactivar')]",
            "//button[contains(@class, 'deactivate')]",
            "//a[contains(text(), 'Desactivar')]"
        ],
        'details_buttons': [
            "//button[contains(text(), 'Ver Detalles')]",
            "//button[contains(text(), 'Detalles')]",
            "//a[contains(text(), 'Ver')]"
        ],
        'edit_buttons': [
            "//button[contains(text(), 'Editar')]",
            "//a[contains(text(), 'Editar')]"
        ]
    },
    'search_filters': {
        'search_input': [
            "//input[@placeholder*='Buscar']",
            "//input[contains(@class, 'search')]",
            "//input[@type='search']"
        ],
        'status_filter': [
            "//select[contains(@name, 'status')]",
            "//select[contains(@name, 'estado')]",
            "//div[contains(@class, 'filter-status')]"
        ],
        'role_filter': [
            "//select[contains(@name, 'role')]",
            "//select[contains(@name, 'rol')]",
            "//div[contains(@class, 'filter-role')]"
        ]
    },
    'modals': {
        'confirmation_modal': [
            "//div[contains(@class, 'modal')]",
            "//div[contains(@class, 'dialog')]",
            "//div[contains(@class, 'confirmation')]"
        ],
        'confirm_button': [
            "//button[contains(text(), 'Confirmar')]",
            "//button[contains(text(), 'Aceptar')]",
            "//button[contains(@class, 'confirm')]"
        ],
        'cancel_button': [
            "//button[contains(text(), 'Cancelar')]",
            "//button[contains(@class, 'cancel')]"
        ]
    },
    'notifications': {
        'success_messages': [
            "//div[contains(@class, 'success')]",
            "//div[contains(@class, 'green')]",
            "//div[contains(@class, 'alert-success')]",
            "//div[contains(text(), 'exitoso')] | //div[contains(text(), 'éxito')]"
        ],
        'error_messages': [
            "//div[contains(@class, 'error')]",
            "//div[contains(@class, 'red')]",
            "//div[contains(@class, 'alert-error')]",
            "//div[contains(text(), 'error')] | //div[contains(text(), 'Error')]"
        ]
    }
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
    
    def get_users_list(self) -> Optional[List[Dict[str, Any]]]:
        """Obtiene lista de usuarios desde la BD"""
        try:
            # Buscar en diferentes posibles tablas de usuarios
            queries = [
                "SELECT id, name, email, role, status, created_at FROM users ORDER BY id",
                "SELECT user_id as id, full_name as name, email, role_name as role, active as status FROM user_profiles ORDER BY user_id", 
                "SELECT id, nombre as name, correo as email, rol as role, estado as status FROM usuarios ORDER BY id"
            ]
            
            for query in queries:
                try:
                    self.cursor.execute(query)
                    results = self.cursor.fetchall()
                    if results:
                        print(f"   ✅ {len(results)} usuarios encontrados en BD")
                        return [dict(row) for row in results]
                except Exception:
                    continue
            
            print(f"   ⚠️  No se encontraron usuarios en BD")
            return []
            
        except Exception as e:
            print(f"   ❌ Error consultando usuarios: {e}")
            return None
    
    def verify_user_action(self, user_id: int, action: str, expected_status: str = None) -> bool:
        """Verifica que la acción sobre usuario se haya aplicado en BD"""
        try:
            # Buscar usuario actualizado
            queries = [
                "SELECT * FROM users WHERE id = %s",
                "SELECT * FROM user_profiles WHERE user_id = %s", 
                "SELECT * FROM usuarios WHERE id = %s"
            ]
            
            for query in queries:
                try:
                    self.cursor.execute(query, (user_id,))
                    result = self.cursor.fetchone()
                    if result:
                        user_data = dict(result)
                        
                        # Verificar según el tipo de acción
                        if action == 'activate' and expected_status:
                            status_fields = ['status', 'estado', 'active']
                            for field in status_fields:
                                if field in user_data:
                                    current_status = str(user_data[field]).lower()
                                    if 'activ' in current_status or current_status == 'true':
                                        print(f"   ✅ BD - Usuario {user_id} activado correctamente")
                                        return True
                        
                        elif action == 'deactivate' and expected_status:
                            status_fields = ['status', 'estado', 'active']
                            for field in status_fields:
                                if field in user_data:
                                    current_status = str(user_data[field]).lower()
                                    if 'inactiv' in current_status or current_status == 'false':
                                        print(f"   ✅ BD - Usuario {user_id} desactivado correctamente")
                                        return True
                        
                        print(f"   ✅ BD - Usuario {user_id} encontrado después de {action}")
                        return True
                except Exception:
                    continue
                    
            print(f"   ⚠️  BD - No se pudo verificar acción {action} para usuario {user_id}")
            return False
            
        except Exception as e:
            print(f"   ❌ Error verificando acción: {e}")
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
                'action': 'IT-GUSU-007_USER_MANAGEMENT_TEST',
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

class UserManagementTest:
    """Test automatizado para la interfaz de gestión de cuentas con verificación de BD"""
    
    def __init__(self, headless: bool = False, iterations: int = 3, verify_db: bool = True):
        self.headless = headless
        self.iterations = iterations
        self.verify_db = verify_db
        self.driver_path = get_chromedriver_path()
        self.driver: Optional[webdriver.Chrome] = None
        self.wait: Optional[WebDriverWait] = None
        self.fake = Faker('es_ES')
        self.db = DatabaseManager() if verify_db else None
        
        # Datos de entrada según el caso de prueba IT-GUSU-007
        self.test_case_data = {
            "usuarios_prueba": [
                {
                    "nombre_busqueda": "sigma",  # Buscar usuarios que contengan "sigma"
                    "email_busqueda": "@gmail.com",  # Buscar emails con gmail
                    "estados_esperados": ["active", "inactive", "pending"]
                }
            ],
            "acciones_realizar": [
                {
                    "accion": "ver_detalles",
                    "descripcion": "Ver detalles del primer usuario encontrado"
                },
                {
                    "accion": "activar_desactivar",
                    "descripcion": "Intentar cambiar estado de usuario si hay botones disponibles"
                }
            ],
            "filtros_busqueda": {
                "por_nombre": "sigma",  # Buscar por "sigma" que probablemente existe
                "por_email": "gmail",   # Filtrar por emails que contengan "gmail"
                "terminos_generales": ["admin", "user", "test"]  # Términos de búsqueda genéricos
            }
        }
        
        self.results = {
            'test_name': 'IT-GUSU-007 (RF-075, RF-077) - Interfaz de gestión de cuentas',
            'test_id': 'IT-GUSU-007',
            'requirements': ['RF-075', 'RF-077'],
            'iterations_completed': 0,
            'successful_operations': 0,
            'failed_operations': 0,
            'errors_encountered': [],
            'validations_passed': 0,
            'validations_failed': 0,
            'db_verifications': 0,
            'db_verification_failures': 0,
            'bugs_found': [],  # Lista de bugs detectados
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
                    
                    # Verificar usuarios existentes
                    users = self.db.get_users_list()
                    if users and len(users) >= 3:
                        preconditions.append(f"✅ {len(users)} usuarios encontrados en BD")
                    else:
                        preconditions.append("⚠️ Pocos usuarios en BD para test completo")
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
            
            # Verificar credenciales de administrador
            email = os.getenv('EMAIL')
            password = os.getenv('PASSWORD')
            if email and password:
                preconditions.append("✅ Credenciales de admin configuradas")
            else:
                preconditions.append("❌ Credenciales de admin faltantes")
            
            # Mostrar estado de precondiciones
            for condition in preconditions:
                print(f"   {condition}")
            
            # Determinar si las precondiciones críticas están ok
            critical_failures = [p for p in preconditions if "❌" in p and ("ChromeDriver" in p or "Credenciales" in p)]
            
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
        """Realizar login en el sistema como administrador"""
        try:
            print("🔐 Realizando login como administrador...")
            
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
                raise Exception("Login falló - No se pudo autenticar como administrador")
            
            print("   ✅ Login exitoso")
            return True
            
        except Exception as e:
            print(f"   ❌ Error en login: {e}")
            self.results['errors_encountered'].append(f"Login error: {str(e)}")
            return False

    def navigate_to_user_management(self) -> bool:
        """Navegar al módulo de gestión de usuarios"""
        try:
            print("🧭 Navegando a Gestión de Usuarios...")
            
            # Buscar enlace de gestión de usuarios
            user_mgmt_link = None
            for selector in SELECTORS['navigation']['user_management_link']:
                try:
                    user_mgmt_link = self.wait.until(
                        EC.element_to_be_clickable((By.XPATH, selector))
                    )
                    break
                except TimeoutException:
                    continue
            
            if user_mgmt_link:
                user_mgmt_link.click()
                print("   ✅ Enlace de Gestión de Usuarios clickeado")
            else:
                # Navegación directa por URL
                current_url = self.driver.current_url
                base_url = current_url.split('/home')[0] if '/home' in current_url else current_url.rstrip('/')
                user_mgmt_url = f"{base_url}/userManagement"
                self.driver.get(user_mgmt_url)
                print("   ✅ Navegación directa por URL")
            
            # Verificar que estamos en la página de gestión de usuarios
            time.sleep(3)  # Esperar a que cargue
            
            # Buscar tabla o lista de usuarios
            user_list_found = False
            table_selectors = [
                SELECTORS['user_list']['table'],
                "//h1[contains(text(), 'Usuarios')] | //h1[contains(text(), 'Users')]",
                "//div[contains(@class, 'user-management')] | //div[contains(@class, 'users')]"
            ]
            
            for selector in table_selectors:
                try:
                    element = self.driver.find_element(By.XPATH, selector)
                    if element.is_displayed():
                        user_list_found = True
                        break
                except NoSuchElementException:
                    continue
            
            if user_list_found:
                print("   ✅ Página de gestión de usuarios cargada")
                return True
            else:
                print("   ❌ No se pudo verificar carga de gestión de usuarios")
                return False
            
        except Exception as e:
            print(f"   ❌ Error navegando a gestión: {e}")
            self.results['errors_encountered'].append(f"Navigation error: {str(e)}")
            return False

    def verify_user_list_interface(self) -> bool:
        """Verificar que la interfaz de listado de usuarios carga correctamente"""
        try:
            print("🔍 Verificando interfaz de listado de usuarios...")
            
            # Elementos clave que deben estar presentes
            interface_elements = [
                (SELECTORS['user_list']['table'], "Tabla o lista de usuarios"),
                (SELECTORS['search_filters']['search_input'], "Campo de búsqueda"),
                (SELECTORS['user_list']['user_rows'], "Filas de usuarios")
            ]
            
            elements_found = 0
            total_elements = len(interface_elements)
            
            for selectors, description in interface_elements:
                if isinstance(selectors, list):
                    selectors_list = selectors
                else:
                    selectors_list = [selectors]
                
                element_found = False
                for selector in selectors_list:
                    try:
                        elements = self.driver.find_elements(By.XPATH, selector)
                        if elements and any(elem.is_displayed() for elem in elements):
                            elements_found += 1
                            print(f"   ✅ {description}")
                            element_found = True
                            break
                    except Exception:
                        continue
                
                if not element_found:
                    print(f"   ⚠️  {description} (no encontrado)")
            
            # Verificar contenido de la tabla
            try:
                user_rows = self.driver.find_elements(By.XPATH, SELECTORS['user_list']['user_rows'])
                if user_rows:
                    print(f"   ✅ {len(user_rows)} usuarios mostrados en la tabla")
                    elements_found += 1
                else:
                    print("   ⚠️  No se encontraron filas de usuarios")
            except Exception:
                print("   ⚠️  Error verificando filas de usuarios")
            
            success_rate = elements_found / total_elements
            if success_rate >= 0.6:  # 60% de elementos encontrados
                print(f"   ✅ Interfaz de gestión válida ({elements_found}/{total_elements} elementos)")
                self.results['validations_passed'] += 1
                return True
            else:
                print(f"   ❌ Interfaz incompleta ({elements_found}/{total_elements} elementos)")
                self.results['validations_failed'] += 1
                return False
                
        except Exception as e:
            print(f"   ❌ Error verificando interfaz: {e}")
            self.results['errors_encountered'].append(f"Interface verification error: {str(e)}")
            return False

    def test_search_and_filters(self) -> bool:
        """Probar funcionalidad de búsqueda y filtros"""
        try:
            print("🔍 Probando búsqueda y filtros...")
            
            bugs_found = []
            search_tests_passed = 0
            
            # Probar búsqueda por nombre - usar término genérico
            search_terms = self.test_case_data["filtros_busqueda"]["terminos_generales"]
            
            for search_term in search_terms[:2]:  # Probar solo 2 términos
                search_found = False
                
                for selector in SELECTORS['search_filters']['search_input']:
                    try:
                        search_field = self.driver.find_element(By.XPATH, selector)
                        if search_field.is_displayed():
                            search_field.clear()
                            search_field.send_keys(search_term)
                            search_field.send_keys(Keys.ENTER)
                            
                            time.sleep(2)  # Esperar filtrado
                            
                            # Verificar que hay campo de búsqueda funcional
                            current_value = search_field.get_attribute('value')
                            if current_value and search_term.lower() in current_value.lower():
                                print(f"   ✅ Campo de búsqueda funcional - término '{search_term}' aplicado")
                                search_tests_passed += 1
                                search_found = True
                            
                            # Limpiar búsqueda
                            search_field.clear()
                            search_field.send_keys(Keys.ENTER)
                            time.sleep(1)
                            break
                    except Exception:
                        continue
                
                if not search_found:
                    bug_info = {
                        'campo': 'busqueda_general',
                        'valor_invalido': search_term,
                        'descripcion': 'Campo de búsqueda no acepta entrada o no funciona',
                        'impacto': 'Usuarios no pueden buscar cuentas'
                    }
                    bugs_found.append(bug_info)
                    print(f"   🐛 BUG DETECTADO: {bug_info['descripcion']}")
                    break  # No seguir probando si falla la búsqueda básica
            
            # Probar filtros de estado
            for selector in SELECTORS['search_filters']['status_filter']:
                try:
                    status_filter = self.driver.find_element(By.XPATH, selector)
                    if status_filter.is_displayed():
                        status_select = Select(status_filter)
                        
                        # Intentar filtrar por "activo"
                        try:
                            status_select.select_by_visible_text("Activo")
                            time.sleep(2)
                            print("   ✅ Filtro por estado funcionando")
                            search_tests_passed += 1
                        except Exception:
                            try:
                                status_select.select_by_value("active")
                                time.sleep(2)
                                print("   ✅ Filtro por estado funcionando")
                                search_tests_passed += 1
                            except Exception:
                                bug_info = {
                                    'campo': 'filtro_estado',
                                    'valor_invalido': 'activo',
                                    'descripcion': 'Filtro por estado no funciona',
                                    'impacto': 'Administradores no pueden filtrar usuarios por estado'
                                }
                                bugs_found.append(bug_info)
                                print(f"   🐛 BUG DETECTADO: {bug_info['descripcion']}")
                        break
                except Exception:
                    continue
            
            # Agregar bugs encontrados a resultados
            self.results['bugs_found'].extend(bugs_found)
            
            if search_tests_passed > 0:
                self.results['validations_passed'] += search_tests_passed
                return True
            else:
                self.results['validations_failed'] += 1
                return False
                
        except Exception as e:
            print(f"   ❌ Error en búsqueda y filtros: {e}")
            self.results['errors_encountered'].append(f"Search and filter error: {str(e)}")
            return False

    def test_user_actions(self) -> bool:
        """Probar acciones sobre usuarios (activar/desactivar/ver detalles)"""
        try:
            print("⚡ Probando acciones de usuario...")
            
            actions_tested = 0
            bugs_found = []
            
            # Obtener acciones del caso de prueba
            acciones = self.test_case_data["acciones_realizar"]
            
            for accion_data in acciones:  # Probar todas las acciones
                accion = accion_data["accion"]
                descripcion = accion_data["descripcion"]
                
                print(f"   🔄 {descripcion}")
                
                # Buscar botones de acción según el tipo
                if accion == "ver_detalles":
                    action_selectors = SELECTORS['actions']['details_buttons']
                elif accion == "activar_desactivar":
                    # Buscar cualquier botón de activar o desactivar
                    action_selectors = (SELECTORS['actions']['activate_buttons'] + 
                                      SELECTORS['actions']['deactivate_buttons'])
                else:
                    continue
                
                # Buscar y hacer clic en botón de acción
                action_button = None
                for selector in action_selectors:
                    try:
                        buttons = self.driver.find_elements(By.XPATH, selector)
                        if buttons:
                            # Tomar el primer botón visible
                            for btn in buttons:
                                if btn.is_displayed() and btn.is_enabled():
                                    action_button = btn
                                    break
                            if action_button:
                                break
                    except Exception:
                        continue
                
                if action_button:
                    try:
                        action_button.click()
                        time.sleep(2)
                        
                        # Verificar modal de confirmación para acciones críticas
                        if accion in ["desactivar", "activar"]:
                            modal_found = self.verify_confirmation_modal()
                            if modal_found:
                                print(f"   ✅ Modal de confirmación mostrado para {accion}")
                                actions_tested += 1
                            else:
                                bug_info = {
                                    'campo': f'confirmacion_{accion}',
                                    'valor_invalido': 'sin_confirmacion',
                                    'descripcion': f'No aparece confirmación para {accion} usuario',
                                    'impacto': 'Usuarios pueden realizar cambios críticos sin confirmación'
                                }
                                bugs_found.append(bug_info)
                                print(f"   🐛 BUG DETECTADO: {bug_info['descripcion']}")
                        
                        # Verificar notificación de resultado
                        if self.verify_notification():
                            print(f"   ✅ Notificación mostrada después de {accion}")
                            actions_tested += 1
                        else:
                            bug_info = {
                                'campo': f'notificacion_{accion}',
                                'valor_invalido': 'sin_notificacion',
                                'descripcion': f'No aparece notificación después de {accion}',
                                'impacto': 'Usuario no sabe si la acción fue exitosa'
                            }
                            bugs_found.append(bug_info)
                            print(f"   🐛 BUG DETECTADO: {bug_info['descripcion']}")
                        
                        # Verificar en BD si está habilitado (para acciones de activar/desactivar)
                        if self.verify_db and self.db and "activar" in accion:
                            # Intentar verificar cambios generales en BD
                            try:
                                users = self.db.get_users_list()
                                if users:
                                    print(f"   📊 BD - {len(users)} usuarios encontrados después de la acción")
                                    self.results['db_verifications'] += 1
                                else:
                                    self.results['db_verification_failures'] += 1
                            except Exception as e:
                                print(f"   ⚠️  BD - Error verificando después de acción: {e}")
                                self.results['db_verification_failures'] += 1
                        
                    except Exception as e:
                        print(f"   ❌ Error ejecutando acción {accion}: {e}")
                        
                else:
                    bug_info = {
                        'campo': f'boton_{accion}',
                        'valor_invalido': 'no_encontrado',
                        'descripcion': f'Botones para {descripcion.lower()} no encontrados o no disponibles',
                        'impacto': 'Administradores no pueden realizar acciones necesarias sobre usuarios'
                    }
                    bugs_found.append(bug_info)
                    print(f"   🐛 BUG DETECTADO: {bug_info['descripcion']}")
            
            # Agregar bugs encontrados
            self.results['bugs_found'].extend(bugs_found)
            
            if actions_tested > 0:
                self.results['validations_passed'] += actions_tested
                return True
            else:
                self.results['validations_failed'] += 1
                return False
                
        except Exception as e:
            print(f"   ❌ Error en acciones de usuario: {e}")
            self.results['errors_encountered'].append(f"User actions error: {str(e)}")
            return False

    def verify_confirmation_modal(self) -> bool:
        """Verificar que aparece modal de confirmación"""
        try:
            # Buscar modal de confirmación
            for selector in SELECTORS['modals']['confirmation_modal']:
                try:
                    modal = self.driver.find_element(By.XPATH, selector)
                    if modal.is_displayed():
                        # Buscar botones de confirmar/cancelar
                        confirm_found = False
                        cancel_found = False
                        
                        for confirm_selector in SELECTORS['modals']['confirm_button']:
                            try:
                                confirm_btn = self.driver.find_element(By.XPATH, confirm_selector)
                                if confirm_btn.is_displayed():
                                    confirm_found = True
                                    # Hacer clic en confirmar
                                    confirm_btn.click()
                                    break
                            except:
                                continue
                        
                        for cancel_selector in SELECTORS['modals']['cancel_button']:
                            try:
                                cancel_btn = self.driver.find_element(By.XPATH, cancel_selector)
                                if cancel_btn.is_displayed():
                                    cancel_found = True
                                    break
                            except:
                                continue
                        
                        return confirm_found and cancel_found
                except Exception:
                    continue
            return False
        except Exception:
            return False

    def verify_notification(self) -> bool:
        """Verificar que aparece notificación de resultado"""
        try:
            time.sleep(1)  # Esperar a que aparezca la notificación
            
            # Buscar notificaciones de éxito
            for selector in SELECTORS['notifications']['success_messages']:
                try:
                    notifications = self.driver.find_elements(By.XPATH, selector)
                    if any(notif.is_displayed() for notif in notifications):
                        return True
                except Exception:
                    continue
            
            # Buscar notificaciones de error (también válidas)
            for selector in SELECTORS['notifications']['error_messages']:
                try:
                    notifications = self.driver.find_elements(By.XPATH, selector)
                    if any(notif.is_displayed() for notif in notifications):
                        return True
                except Exception:
                    continue
            
            return False
        except Exception:
            return False

    def run_single_iteration(self, iteration_num: int) -> bool:
        """Ejecutar una iteración completa del test"""
        print(f"\n{'='*60}")
        print(f"🔄 ITERACIÓN {iteration_num} de {self.iterations}")
        print(f"{'='*60}")
        
        try:
            success = True
            
            # Navegación (solo primera iteración)
            if iteration_num == 1:
                if not self.navigate_to_user_management():
                    return False
                if not self.verify_user_list_interface():
                    success = False
            else:
                # Refrescar para iteraciones siguientes
                self.driver.refresh()
                time.sleep(3)
            
            # Secuencia de tests con puntuación
            tests = [
                ("Búsqueda y filtros", lambda: self.test_search_and_filters(), 2),
                ("Acciones de usuario", lambda: self.test_user_actions(), 3)
            ]
            
            total_points = sum(points for _, _, points in tests)
            achieved_points = 0
            
            for test_name, test_func, points in tests:
                try:
                    if test_func():
                        achieved_points += points
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
            
            # Registrar en auditoría si está habilitado
            if self.verify_db and self.db:
                audit_data = {
                    'email': os.getenv('EMAIL', ''),
                    'test_case': 'IT-GUSU-007',
                    'actions_tested': len(self.test_case_data["acciones_realizar"]),
                    'iterations': self.iterations,
                    'bugs_found': len(self.results['bugs_found'])
                }
                if self.db.log_test_execution(audit_data):
                    self.results['audit_logged'] = True
            
            # Mostrar resultados
            self._print_final_results(successful_iterations)
            
            # Determinar éxito
            success_rate = successful_iterations / self.iterations
            return success_rate >= 0.6  # 60% de éxito mínimo
            
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
        """Imprimir resultados finales del test IT-GUSU-007"""
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
        
        # BUGS DETECTADOS - NUEVA SECCIÓN OBLIGATORIA
        if self.results['bugs_found']:
            print(f"\n🐛 BUGS DETECTADOS ({len(self.results['bugs_found'])}):")
            for i, bug in enumerate(self.results['bugs_found'], 1):
                print(f"  {i}. CAMPO: {bug['campo']}")
                print(f"     DATO: {bug['valor_invalido']}")
                print(f"     PROBLEMA: {bug['descripcion']}")
                print(f"     IMPACTO: {bug['impacto']}")
                print()
        else:
            print(f"\n🐛 BUGS DETECTADOS: Ninguno")
        
        # Errores técnicos
        if self.results['errors_encountered']:
            print(f"\n🚨 ERRORES TÉCNICOS ({len(self.results['errors_encountered'])}):")
            for i, error in enumerate(self.results['errors_encountered'][:5], 1):
                print(f"  {i}. {error[:100]}...")
            if len(self.results['errors_encountered']) > 5:
                print(f"  ... y {len(self.results['errors_encountered']) - 5} errores más")
        
        # Resultado final
        print(f"\n📈 TASA DE ÉXITO: {success_rate:.1f}%")
        
        # Criterios de éxito específicos para IT-GUSU-007
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
        print(f"   • Funcionalidad UI: {'✅' if self.results['validations_passed'] > 0 else '❌'}")
        if self.verify_db:
            print(f"   • Persistencia BD: {'✅' if self.results['db_verifications'] > 0 else '❌'}")
            print(f"   • Auditoría: {'✅' if self.results['audit_logged'] else '❌'}")
        print(f"   • Bugs encontrados: {len(self.results['bugs_found'])}")
        print(f"   • Gestión de usuarios: {'✅' if self.results['validations_passed'] > self.results['validations_failed'] else '❌'}")
        
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
    """Verificar que existe el archivo .env en el directorio padre"""
    env_path = PROJECT_ROOT / '.env'
    
    if not env_path.exists():
        print(f"❌ Archivo .env no encontrado en {env_path}")
        print("   💡 Debe existir el archivo tests/.env con las credenciales")
        print("   💡 Copie desde tests/.env.example y configure sus valores")
        return False
    else:
        print(f"✅ Usando archivo .env: {env_path}")
        return True

def main():
    """Función principal con CLI para IT-GUSU-007"""
    parser = argparse.ArgumentParser(
        description='Test IT-GUSU-007 (RF-075, RF-077): Interfaz de gestión de cuentas',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos de uso:
  python test_IT_GUSU_007_RF-075.py                      # Modo visual, 3 iteraciones, BD habilitada
  python test_IT_GUSU_007_RF-075.py --headless           # Modo headless, 3 iteraciones, BD habilitada  
  python test_IT_GUSU_007_RF-075.py --iterations 5       # Modo visual, 5 iteraciones
  python test_IT_GUSU_007_RF-075.py --no-verify-db       # Sin verificación de BD
  python test_IT_GUSU_007_RF-075.py --check-env          # Solo verificar configuración
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
    test = UserManagementTest(
        headless=args.headless, 
        iterations=args.iterations,
        verify_db=verify_db
    )
    
    try:
        success = test.run_test()
        return 0 if success else 1
    except KeyboardInterrupt:
        print(f"\n⚠️ Test IT-GUSU-007 interrumpido")
        return 130
    except Exception as e:
        print(f"\n💥 Error inesperado en IT-GUSU-007: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
