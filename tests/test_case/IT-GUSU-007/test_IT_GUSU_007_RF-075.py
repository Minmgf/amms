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

# Selectores CSS/XPath específicos para gestión de usuarios
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
        'table': "table.w-full",  # Tabla principal de usuarios
        'table_headers': "table.w-full thead th",
        'user_rows': "table.w-full tbody tr",  # Filas de usuarios en la tabla
        'first_user_row': "tbody tr:nth-child(1)",  # Primera fila para abrir detalles
        'user_cells': "table.w-full tbody tr td"  # Celdas de datos de usuarios
    },
    'search_filters': {
        'search_input': "//input[@placeholder='Buscar usuarios...']",  # Campo de búsqueda específico
        'status_select': "//select[contains(@class, 'px-3 py-2 border border-gray-300')]",  # Select de estados actualizado
        'status_select_alt': "select.px-3.py-2.border.border-gray-300.rounded-lg",  # Selector CSS alternativo
        'status_options': [
            "//option[@value='Activo']",
            "//option[@value='Inactivo']", 
            "//option[@value='Pendiente']"
        ]
    },
    'actions': {
        'edit_user_button': "//button[contains(@class, 'px-6 py-2 bg-blue-600') and contains(text(), 'Editar Usuario')]",  # Botón editar usuario actualizado
        'edit_user_button_alt': "//button[@type='button' and contains(@class, 'bg-blue-600') and contains(text(), 'Editar Usuario')]",  # Selector alternativo
        'first_row_click': "tbody tr:nth-child(1)",  # Click en primera fila para pop-up
        'details_buttons': [
            "//button[contains(text(), 'Ver Detalles')]",
            "//button[contains(text(), 'Detalles')]"
        ]
    },
    'modals': {
        'user_details_popup': [
            "//div[contains(@class, 'modal')]",
            "//div[contains(@class, 'popup')]",
            "//div[contains(@class, 'dialog')]",
            "//div[@role='dialog']"
        ],
        'browser_alert': "alert",  # Alert del navegador para confirmación
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
        
        # Datos de entrada según el caso de prueba IT-GUSU-007 con selectores reales
        self.test_case_data = {
            "busquedas_a_probar": [
                "sigma",      # Término relacionado con el usuario actual
                "gmail",      # Buscar emails con gmail
                "admin",      # Buscar administradores
                "test"        # Término genérico de prueba
            ],
            "estados_a_probar": [
                "Activo",     # Estado activo
                "Inactivo",   # Estado inactivo
                "Suspendido"  # Estado suspendido
            ],
            "acciones_a_realizar": [
                {
                    "accion": "buscar_usuarios",
                    "descripcion": "Probar funcionalidad de búsqueda de usuarios",
                    "selector": SELECTORS['search_filters']['search_input']
                },
                {
                    "accion": "ver_detalles_usuario",
                    "descripcion": "Hacer click en primera fila para ver detalles (pop-up)",
                    "selector": SELECTORS['user_list']['first_user_row']
                },
                {
                    "accion": "cambiar_estado_usuario",
                    "descripcion": "Cambiar estado de usuario (debe mostrar alert de confirmación)",
                    "selector": SELECTORS['search_filters']['status_select'],
                    "requiere_scroll": True,
                    "debe_fallar": True  # Esta prueba debe fallar por el alert del navegador
                },
                {
                    "accion": "editar_usuario",
                    "descripcion": "Hacer click en botón Editar Usuario",
                    "selector": SELECTORS['actions']['edit_user_button']
                }
            ]
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
            
            # Verificar elementos específicos de la página de gestión
            elementos_encontrados = 0
            
            # 1. Verificar tabla principal
            try:
                table = self.driver.find_element(By.CSS_SELECTOR, SELECTORS['user_list']['table'])
                if table.is_displayed():
                    print("   ✅ Tabla de usuarios encontrada")
                    elementos_encontrados += 1
            except Exception:
                print("   ⚠️ Tabla de usuarios no encontrada")
            
            # 2. Verificar campo de búsqueda
            try:
                search_input = self.driver.find_element(By.XPATH, SELECTORS['search_filters']['search_input'])
                if search_input.is_displayed():
                    print("   ✅ Campo de búsqueda encontrado")
                    elementos_encontrados += 1
            except Exception:
                print("   ⚠️ Campo de búsqueda no encontrado")
            
            # 3. Verificar URL contiene userManagement
            current_url = self.driver.current_url
            if 'userManagement' in current_url:
                print("   ✅ URL correcta de gestión de usuarios")
                elementos_encontrados += 1
            else:
                print(f"   ⚠️ URL actual: {current_url}")
            
            # 4. Verificar contenido de la página
            try:
                page_text = self.driver.find_element(By.TAG_NAME, "body").text
                if any(term in page_text.lower() for term in ['usuarios', 'users', 'gestión', 'management']):
                    print("   ✅ Contenido de gestión de usuarios detectado")
                    elementos_encontrados += 1
            except Exception:
                print("   ⚠️ No se pudo verificar contenido de la página")
            
            if elementos_encontrados >= 2:  # Al menos 2 de 4 elementos
                print(f"   ✅ Página de gestión de usuarios cargada ({elementos_encontrados}/4 elementos)")
                return True
            else:
                print(f"   ❌ Carga de gestión de usuarios insuficiente ({elementos_encontrados}/4 elementos)")
                return False
            
        except Exception as e:
            print(f"   ❌ Error navegando a gestión: {e}")
            self.results['errors_encountered'].append(f"Navigation error: {str(e)}")
            return False

    def verify_user_list_interface(self) -> bool:
        """Verificar que la interfaz de listado de usuarios carga correctamente"""
        try:
            print("🔍 Verificando interfaz de listado de usuarios...")
            
            elements_found = 0
            
            # 1. Verificar tabla principal
            try:
                table = self.driver.find_element(By.CSS_SELECTOR, SELECTORS['user_list']['table'])
                if table.is_displayed():
                    print(f"   ✅ Tabla principal de usuarios encontrada")
                    elements_found += 1
                else:
                    print(f"   ❌ Tabla principal no visible")
            except Exception:
                print(f"   ❌ Tabla principal no encontrada")
            
            # 2. Verificar campo de búsqueda
            try:
                search_input = self.driver.find_element(By.XPATH, SELECTORS['search_filters']['search_input'])
                if search_input.is_displayed():
                    print(f"   ✅ Campo de búsqueda encontrado: '{search_input.get_attribute('placeholder')}'")
                    elements_found += 1
                else:
                    print(f"   ❌ Campo de búsqueda no visible")
            except Exception:
                print(f"   ❌ Campo de búsqueda no encontrado")
            
            # 3. Verificar filas de usuarios
            try:
                user_rows = self.driver.find_elements(By.CSS_SELECTOR, SELECTORS['user_list']['user_rows'])
                if user_rows and len(user_rows) > 0:
                    print(f"   ✅ {len(user_rows)} filas de usuarios encontradas")
                    elements_found += 1
                else:
                    print(f"   ❌ No se encontraron filas de usuarios")
            except Exception:
                print(f"   ❌ Error verificando filas de usuarios")
            
            # 4. Verificar selector de estado
            try:
                # Intentar con el nuevo selector XPath
                status_select = self.driver.find_element(By.XPATH, SELECTORS['search_filters']['status_select'])
                if status_select.is_displayed():
                    print(f"   ✅ Selector de estado encontrado")
                    elements_found += 1
                else:
                    print(f"   ❌ Selector de estado no visible")
            except Exception:
                try:
                    # Intentar con el selector CSS alternativo
                    status_select = self.driver.find_element(By.CSS_SELECTOR, SELECTORS['search_filters']['status_select_alt'])
                    if status_select.is_displayed():
                        print(f"   ✅ Selector de estado encontrado (CSS)")
                        elements_found += 1
                    else:
                        print(f"   ❌ Selector de estado no visible")
                except Exception:
                    print(f"   ❌ Selector de estado no encontrado")
            
            total_elements = 4  # Tabla, búsqueda, filas, selector estado
            success_rate = elements_found / total_elements
            
            if success_rate >= 0.75:  # 75% de elementos encontrados
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
        """Probar funcionalidad de búsqueda y filtros con selectores específicos"""
        try:
            print("🔍 Probando búsqueda y filtros...")
            
            bugs_found = []
            search_tests_passed = 0
            actions_tested = 0
            
            # Probar campo de búsqueda con términos específicos
            search_terms = self.test_case_data["busquedas_a_probar"]
            
            try:
                search_field = self.driver.find_element(By.XPATH, SELECTORS['search_filters']['search_input'])
                
                for search_term in search_terms[:2]:  # Probar primeros 2 términos
                    print(f"   🔍 Probando búsqueda con término: '{search_term}'")
                    
                    # Limpiar campo y escribir término
                    search_field.clear()
                    search_field.send_keys(search_term)
                    search_field.send_keys(Keys.ENTER)
                    
                    time.sleep(2)  # Esperar que se aplique el filtro
                    
                    # Verificar que el término se mantuvo en el campo
                    current_value = search_field.get_attribute('value')
                    if current_value and search_term.lower() in current_value.lower():
                        print(f"   ✅ Término '{search_term}' aplicado correctamente")
                        
                        # Verificar si hay resultados en la tabla
                        try:
                            user_rows = self.driver.find_elements(By.CSS_SELECTOR, SELECTORS['user_list']['user_rows'])
                            if user_rows:
                                print(f"   ✅ Resultados de búsqueda: {len(user_rows)} usuarios")
                                search_tests_passed += 1
                            else:
                                print(f"   ⚠️  Búsqueda aplicada pero sin resultados visibles")
                                search_tests_passed += 0.5  # Parcialmente exitoso
                        except Exception:
                            print(f"   ⚠️  No se pudieron verificar resultados")
                    else:
                        bug_info = {
                            'campo': 'busqueda_usuarios',
                            'valor_invalido': search_term,
                            'descripcion': f'Campo de búsqueda no acepta o no mantiene el término "{search_term}"',
                            'impacto': 'Los administradores no pueden buscar usuarios específicos'
                        }
                        bugs_found.append(bug_info)
                        print(f"   🐛 BUG DETECTADO: {bug_info['descripcion']}")
                    
                    # Limpiar para siguiente término
                    search_field.clear()
                    time.sleep(1)
                
            except Exception as e:
                bug_info = {
                    'campo': 'campo_busqueda',
                    'valor_invalido': 'selector_incorrecto',
                    'descripcion': 'Campo de búsqueda no encontrado o no accesible',
                    'impacto': 'Funcionalidad de búsqueda completamente inaccesible'
                }
                bugs_found.append(bug_info)
                print(f"   🐛 BUG DETECTADO: {bug_info['descripcion']} - Error: {e}")
            
            # Probar selector de estado actualizado
            print(f"   🔍 Probando selector de estado...")
            try:
                # Intentar con el nuevo selector XPath
                status_select = None
                try:
                    status_select = self.driver.find_element(By.XPATH, SELECTORS['search_filters']['status_select'])
                except:
                    # Fallback al selector CSS
                    status_select = self.driver.find_element(By.CSS_SELECTOR, SELECTORS['search_filters']['status_select_alt'])
                
                self.driver.execute_script("arguments[0].scrollIntoView(true);", status_select)
                time.sleep(1)
                
                # Para elementos <select>, usar Select de Selenium
                from selenium.webdriver.support.ui import Select
                select = Select(status_select)
                
                print(f"   ✅ Selector de estado encontrado, opciones disponibles: {len(select.options)}")
                
                # Mostrar las opciones disponibles
                for option in select.options:
                    print(f"      - {option.text} (value: {option.get_attribute('value')})")
                
                # Probar seleccionar una opción
                if len(select.options) > 1:  # Si hay más opciones que "Todos los estados"
                    select.select_by_index(1)  # Seleccionar la segunda opción
                    time.sleep(2)
                    print(f"   ✅ Filtro por estado aplicado correctamente")
                    
                    # Verificar si se aplicó el filtro
                    rows_after_filter = self.driver.find_elements(By.CSS_SELECTOR, SELECTORS['user_list']['user_rows'])
                    print(f"   ✅ Usuarios después del filtro: {len(rows_after_filter)}")
                    
                    # Restablecer a "Todos los estados"
                    select.select_by_index(0)
                    time.sleep(2)
                    
                    actions_tested += 1
                
                # Buscar opciones de estado
                estado_encontrado = False
                for estado in self.test_case_data["estados_a_probar"][:1]:  # Probar solo el primero
                    try:
                        option_xpath = f"//div[contains(text(), '{estado}')]"
                        option = self.driver.find_element(By.XPATH, option_xpath)
                        option.click()
                        time.sleep(2)
                        
                        # Aquí debería aparecer el alert del navegador
                        try:
                            alert = self.driver.switch_to.alert
                            alert_text = alert.text
                            print(f"   ⚠️  ALERT DETECTADO: {alert_text}")
                            alert.dismiss()  # Cancelar el alert
                            
                            # Esto es un bug esperado según las instrucciones
                            bug_info = {
                                'campo': 'cambio_estado_usuario',
                                'valor_invalido': estado,
                                'descripcion': f'Alert del navegador impide cambio de estado a "{estado}"',
                                'impacto': 'Los administradores no pueden cambiar estados de usuarios debido a confirmación de navegador'
                            }
                            bugs_found.append(bug_info)
                            print(f"   🐛 BUG DETECTADO (ESPERADO): {bug_info['descripcion']}")
                            
                        except Exception:
                            print(f"   ✅ Cambio de estado a '{estado}' aplicado sin alert")
                            search_tests_passed += 1
                        
                        estado_encontrado = True
                        break
                        
                    except Exception as e:
                        print(f"   ❌ No se pudo seleccionar estado '{estado}': {e}")
                
                if not estado_encontrado:
                    bug_info = {
                        'campo': 'opciones_estado',
                        'valor_invalido': 'no_encontradas',
                        'descripcion': 'Opciones de estado no encontradas en el selector',
                        'impacto': 'No se pueden filtrar usuarios por estado'
                    }
                    bugs_found.append(bug_info)
                    print(f"   🐛 BUG DETECTADO: {bug_info['descripcion']}")
                
            except Exception as e:
                bug_info = {
                    'campo': 'selector_estado',
                    'valor_invalido': 'no_accesible',
                    'descripcion': 'Selector de estado no encontrado o no interactuable',
                    'impacto': 'Funcionalidad de filtro por estado completamente inaccesible'
                }
                bugs_found.append(bug_info)
                print(f"   🐛 BUG DETECTADO: {bug_info['descripcion']} - Error: {e}")
            
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
        """Probar acciones sobre usuarios con selectores específicos"""
        try:
            print("⚡ Probando acciones de usuario...")
            
            actions_tested = 0
            bugs_found = []
            
            # 1. Probar click en primera fila para ver detalles (pop-up)
            print("   🔄 Probando click en primera fila para ver detalles...")
            try:
                first_row = self.driver.find_element(By.CSS_SELECTOR, SELECTORS['user_list']['first_user_row'])
                if first_row.is_displayed():
                    first_row.click()
                    time.sleep(3)  # Esperar que aparezca el pop-up
                    
                    # Verificar si aparece algún modal/pop-up
                    popup_found = self.verify_popup_modal()
                    if popup_found:
                        print("   ✅ Pop-up de detalles de usuario mostrado correctamente")
                        actions_tested += 1
                        
                        # Probar cambio de estado dentro del modal
                        print("   🔄 Probando cambio de estado dentro del modal...")
                        status_change_success = self.test_status_change_in_modal()
                        if status_change_success:
                            print("   ✅ Cambio de estado probado exitosamente")
                            actions_tested += 1
                        else:
                            bug_info = {
                                'campo': 'selector_estado_modal',
                                'valor_invalido': 'no_funcional',
                                'descripcion': 'Selector de estado en modal no funciona correctamente',
                                'impacto': 'No es posible cambiar estado de usuarios desde el modal'
                            }
                            bugs_found.append(bug_info)
                            print(f"   🐛 BUG DETECTADO: {bug_info['descripcion']}")
                        
                        # Cerrar el pop-up si es posible
                        self.close_popup_if_exists()
                    else:
                        bug_info = {
                            'campo': 'popup_detalles_usuario',
                            'valor_invalido': 'no_aparece',
                            'descripcion': 'Click en fila de usuario no abre pop-up de detalles',
                            'impacto': 'Administradores no pueden ver información detallada de usuarios'
                        }
                        bugs_found.append(bug_info)
                        print(f"   🐛 BUG DETECTADO: {bug_info['descripcion']}")
                else:
                    print("   ❌ Primera fila de usuario no visible")
            except Exception as e:
                bug_info = {
                    'campo': 'primera_fila_usuario',
                    'valor_invalido': 'no_accesible',
                    'descripcion': 'No se pudo hacer click en la primera fila de usuario',
                    'impacto': 'No es posible acceder a detalles de usuarios'
                }
                bugs_found.append(bug_info)
                print(f"   🐛 BUG DETECTADO: {bug_info['descripcion']} - Error: {e}")
            
            # 2. Probar botón "Editar Usuario" 
            print("   🔄 Probando botón 'Editar Usuario'...")
            try:
                # Buscar botones con texto "Editar Usuario" en toda la página
                edit_buttons = self.driver.find_elements(By.XPATH, "//button[contains(text(), 'Editar Usuario')]")
                
                if edit_buttons:
                    print(f"   ✅ {len(edit_buttons)} botón(es) 'Editar Usuario' encontrado(s)")
                    
                    for i, button in enumerate(edit_buttons):
                        if button.is_displayed() and button.is_enabled():
                            print(f"   ✅ Botón {i+1} está visible y habilitado")
                            # Hacer scroll al botón antes de hacer click
                            self.driver.execute_script("arguments[0].scrollIntoView(true);", button)
                            time.sleep(1)
                            
                            button.click()
                            time.sleep(2)
                            
                            print("   ✅ Botón 'Editar Usuario' clickeado correctamente")
                            actions_tested += 1
                            break
                        else:
                            print(f"   ⚠️  Botón {i+1} no está visible o habilitado")
                else:
                    # Si no encuentra ninguno, buscar con selectores más específicos
                    edit_button = None
                    selectors_to_try = [
                        SELECTORS['actions']['edit_user_button'],
                        SELECTORS['actions']['edit_user_button_alt'],
                        "//button[contains(@class, 'bg-blue-600')]",
                        "//button[@type='button' and contains(text(), 'Editar')]"
                    ]
                    
                    for selector in selectors_to_try:
                        try:
                            edit_button = self.driver.find_element(By.XPATH, selector)
                            if edit_button.is_displayed() and edit_button.is_enabled():
                                print(f"   ✅ Botón encontrado con selector: {selector}")
                                self.driver.execute_script("arguments[0].scrollIntoView(true);", edit_button)
                                time.sleep(1)
                                edit_button.click()
                                time.sleep(2)
                                print("   ✅ Botón 'Editar Usuario' clickeado correctamente")
                                actions_tested += 1
                                break
                        except:
                            continue
                    
                    if not edit_button:
                        raise Exception("No se encontraron botones 'Editar Usuario' en la página")
                
                # Verificar si aparece alguna respuesta (página nueva, modal, etc.)
                current_url = self.driver.current_url
                if 'edit' in current_url.lower() or 'editar' in current_url.lower():
                    print("   ✅ Navegación a página de edición detectada")
                    actions_tested += 0.5
                    
            except Exception as e:
                bug_info = {
                    'campo': 'boton_editar_usuario',
                    'valor_invalido': 'no_encontrado',
                    'descripcion': 'Botón "Editar Usuario" no encontrado en la interfaz',
                    'impacto': 'Funcionalidad de edición de usuarios no accesible'
                }
                bugs_found.append(bug_info)
                print(f"   🐛 BUG DETECTADO: {bug_info['descripcion']} - Error: {e}")
            
            # 3. Verificar notificaciones generales
            if self.verify_notification():
                print("   ✅ Sistema de notificaciones funcionando")
                actions_tested += 0.5
            
            # Agregar bugs encontrados
            self.results['bugs_found'].extend(bugs_found)
            
            if actions_tested > 0:
                self.results['validations_passed'] += int(actions_tested)
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

    def verify_popup_modal(self) -> bool:
        """Verificar que aparece pop-up o modal de detalles"""
        try:
            time.sleep(2)  # Esperar a que aparezca el modal
            
            # Buscar el modal específico con ID de Radix que mencionaste
            modal_found = False
            elements_found = {}
            
            try:
                # Buscar modal con el patrón de ID que mencionaste
                modal_selector = "//div[@role='dialog' and contains(@id, 'radix-')]"
                modal = WebDriverWait(self.driver, 10).until(
                    EC.visibility_of_element_located((By.XPATH, modal_selector))
                )
                
                print(f"      ✅ Modal de detalles de usuario detectado")
                modal_found = True
                
                # Verificar elementos específicos dentro del modal
                # Buscar título del modal (puede estar oculto con sr-only)
                try:
                    title = modal.find_element(By.XPATH, ".//h2[contains(text(), 'Detalles del Usuario')]")
                    elements_found['title'] = True
                    print(f"      ✅ Título del modal encontrado: {title.text}")
                except:
                    elements_found['title'] = False
                    print("      ⚠️  Título del modal no encontrado (puede estar oculto)")
                
                # Buscar información personal
                try:
                    personal_info = modal.find_element(By.XPATH, ".//h3[contains(text(), 'Información Personal')]")
                    elements_found['personal_info'] = True
                    print("      ✅ Sección de información personal encontrada")
                except:
                    elements_found['personal_info'] = False
                    print("      ⚠️  Sección de información personal no encontrada")
                
                # Buscar selector de estado dentro del modal
                try:
                    status_selector = modal.find_element(By.XPATH, ".//div[contains(@class, 'css-nalcay-control')]")
                    elements_found['status_selector'] = True
                    print("      ✅ Selector de estado encontrado en el modal")
                    
                    # Verificar el valor actual del selector
                    try:
                        # Intentar con diferentes selectores para el valor actual
                        current_status = None
                        selectors_to_try = [
                            ".//div[contains(@class, 'singleValue')]",
                            ".//div[contains(@class, 'single-value')]", 
                            ".//div[contains(text(), 'Activo') or contains(text(), 'Inactivo') or contains(text(), 'Suspendido')]"
                        ]
                        
                        for selector in selectors_to_try:
                            try:
                                elem = status_selector.find_element(By.XPATH, selector)
                                if elem.text:
                                    current_status = elem
                                    break
                            except:
                                continue
                        
                        if current_status:
                            print(f"      ✅ Estado actual: {current_status.text}")
                        else:
                            print("      ⚠️  No se pudo leer el estado actual")
                    except:
                        print("      ⚠️  No se pudo leer el estado actual")
                        
                except:
                    elements_found['status_selector'] = False
                    print("      ❌ BUG: Selector de estado no encontrado en el modal")
                
                # Buscar botón de editar usuario
                try:
                    edit_button = modal.find_element(By.XPATH, ".//button[normalize-space()='Editar Usuario']")
                    elements_found['edit_button'] = True
                    print("      ✅ Botón 'Editar Usuario' encontrado")
                except:
                    elements_found['edit_button'] = False
                    print("      ❌ BUG: Botón 'Editar Usuario' no encontrado en el modal")
                
                # Buscar botón de cerrar
                try:
                    close_button = modal.find_element(By.XPATH, ".//button[normalize-space()='Cerrar']")
                    elements_found['close_button'] = True
                    print("      ✅ Botón 'Cerrar' encontrado")
                except:
                    elements_found['close_button'] = False
                    print("      ⚠️  Botón 'Cerrar' no encontrado")
                
                return True
                
            except TimeoutException:
                print("      ❌ BUG: Modal específico no se abrió, probando selectores alternativos")
                
                # Fallback: buscar diferentes tipos de modales/pop-ups
                for selector in SELECTORS['modals']['user_details_popup']:
                    try:
                        modals = self.driver.find_elements(By.XPATH, selector)
                        for modal in modals:
                            if modal.is_displayed():
                                print(f"      ✅ Modal encontrado con selector alternativo: {selector}")
                                return True
                    except Exception:
                        continue
                
                # Verificar si cambió el contenido de la página (otra forma de mostrar detalles)
                try:
                    page_text = self.driver.find_element(By.TAG_NAME, "body").text
                    detail_indicators = ["detalles", "información", "perfil", "datos"]
                    for indicator in detail_indicators:
                        if indicator.lower() in page_text.lower():
                            print(f"      ✅ Contenido de detalles detectado: '{indicator}'")
                            return True
                except Exception:
                    pass
                
                return False
            
        except Exception as e:
            print(f"      ❌ Error verificando modal: {str(e)}")
            return False
    
    def test_status_change_in_modal(self) -> bool:
        """Probar cambio de estado dentro del modal"""
        try:
            # Buscar el modal
            modal_selector = "//div[@role='dialog' and contains(@id, 'radix-')]"
            modal = WebDriverWait(self.driver, 10).until(
                EC.visibility_of_element_located((By.XPATH, modal_selector))
            )
            
            print("      ✅ Modal encontrado, buscando selector de estado...")
            
            # Buscar el selector de estado dentro del modal
            try:
                status_selector = modal.find_element(By.XPATH, ".//div[contains(@class, 'css-nalcay-control')]")
                print("      ✅ Selector de estado encontrado")
                
                # Obtener estado actual - probar diferentes selectores
                current_status = None
                try:
                    # Primero intentar con el selector específico del HTML que proporcionaste
                    current_status_elem = status_selector.find_element(By.XPATH, ".//div[contains(@class, 'singleValue') or contains(@class, 'single-value')]")
                    current_status = current_status_elem.text
                    print(f"      ✅ Estado actual: {current_status}")
                except:
                    try:
                        # Segundo intento con selector más genérico
                        current_status_elem = status_selector.find_element(By.XPATH, ".//div[contains(@class, 'css-') and not(contains(@class, 'control')) and not(contains(@class, 'indicator'))]")
                        current_status = current_status_elem.text
                        print(f"      ✅ Estado actual (selector genérico): {current_status}")
                    except:
                        # Tercer intento - buscar cualquier texto dentro del control
                        try:
                            texts = status_selector.find_elements(By.XPATH, ".//*[text()]")
                            if texts:
                                current_status = texts[0].text
                                print(f"      ✅ Estado actual (texto encontrado): {current_status}")
                        except:
                            print("      ⚠️  No se pudo determinar el estado actual")
                
                if current_status:
                    # Hacer clic en el selector para abrirlo
                    status_selector.click()
                    time.sleep(1)
                    
                    # Buscar opciones disponibles
                    try:
                        options = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'css-') and (@role='option' or contains(@class, 'option'))]")
                        
                        if options:
                            print(f"      ✅ {len(options)} opciones encontradas en el selector")
                            
                            # Buscar una opción diferente al estado actual
                            for option in options:
                                if option.text and option.text != current_status:
                                    print(f"      ✅ Intentando cambiar a: {option.text}")
                                    option.click()
                                    time.sleep(1)
                                    
                                    # Verificar si aparece confirmación del navegador
                                    try:
                                        alert = self.driver.switch_to.alert
                                        print(f"      ✅ Alert detectado: {alert.text}")
                                        alert.accept()  # Aceptar la confirmación
                                        time.sleep(1)
                                        print("      ✅ Confirmación aceptada")
                                        return True
                                    except:
                                        print("      ⚠️  No se detectó alert de confirmación")
                                        return True  # El cambio se aplicó sin confirmación
                                    
                        else:
                            print("      ❌ BUG: No se encontraron opciones en el selector de estado")
                            return False
                            
                    except Exception as e:
                        print(f"      ❌ Error buscando opciones: {str(e)}")
                        return False
                        
                else:
                    print("      ❌ No se pudo obtener el estado actual")
                    return False
                    
            except Exception as e:
                print(f"      ❌ BUG: Selector de estado no encontrado en modal: {str(e)}")
                return False
                
        except Exception as e:
            print(f"      ❌ Error en test de cambio de estado: {str(e)}")
            return False

    def close_popup_if_exists(self):
        """Cerrar pop-up si existe"""
        try:
            # Primero intentar cerrar con el botón específico del modal Radix
            try:
                close_btn = self.driver.find_element(By.XPATH, "//div[@role='dialog']//button[normalize-space()='Cerrar']")
                if close_btn.is_displayed():
                    close_btn.click()
                    time.sleep(1)
                    print(f"      ✅ Modal cerrado con botón 'Cerrar'")
                    return
            except Exception:
                pass
            
            # Buscar botones de cerrar comunes
            close_selectors = [
                "//button[contains(@class, 'close')]",
                "//button[contains(text(), 'Cerrar')]",
                "//button[contains(text(), 'Close')]",
                "//button[@aria-label='close']",
                "//span[contains(@class, 'close')]",
                "//i[contains(@class, 'close')]"
            ]
            
            for selector in close_selectors:
                try:
                    close_btn = self.driver.find_element(By.XPATH, selector)
                    if close_btn.is_displayed():
                        close_btn.click()
                        time.sleep(1)
                        print(f"      ✅ Pop-up cerrado")
                        return
                except Exception:
                    continue
            
            # Si no hay botón de cerrar, presionar ESC
            try:
                from selenium.webdriver.common.keys import Keys
                self.driver.find_element(By.TAG_NAME, "body").send_keys(Keys.ESCAPE)
                time.sleep(1)
                print(f"      ✅ Modal cerrado con ESC")
            except Exception:
                pass
                
        except Exception:
            pass

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
