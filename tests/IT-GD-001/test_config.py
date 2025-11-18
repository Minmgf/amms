"""
Configuración para la prueba IT-GD-001
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Cargar variables de entorno
PROJECT_ROOT = Path(__file__).parent.parent
load_dotenv(PROJECT_ROOT / '.env')

# URLs de la aplicación
APP_URL = "http://localhost:3000/sigma"
LOGIN_URL = f"{APP_URL}/login"
MONITORING_URL = f"{APP_URL}/monitoring"
DEVICES_MANAGEMENT_URL = f"{APP_URL}/monitoring/devicesManagement"

# Credenciales (desde .env)
LOGIN_EMAIL = os.getenv('EMAIL')
LOGIN_PASSWORD = os.getenv('PASSWORD')

# Configuración de Selenium
HEADLESS = os.getenv('HEADLESS', 'False').lower() in ('true', '1', 'yes', 'on')
IMPLICIT_WAIT = 10
EXPLICIT_WAIT = 15

# Configuración de capturas y reportes
SCREENSHOTS_DIR = Path(__file__).parent / "screenshots"
REPORTS_DIR = Path(__file__).parent / "reports"

# Parámetros de monitoreo a seleccionar (mínimo 5)
MONITORING_PARAMETERS = [
    "Estado de Ignición",
    "Velocidad Actual",
    "Ubicación GPS",
    "Nivel de Combustible",
    "Temperatura del Motor"
]

# Configuración de la base de datos (opcional para validación directa)
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT')
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')

# Selectores CSS/XPath
SELECTORS = {
    # Login
    "login": {
        "email_input": "//input[@placeholder='Correo electrónico']",
        "password_input": "//input[@placeholder='Contraseña']",
        "submit_button": "//button[normalize-space()='Iniciar sesión']"
    },
    
    # Navegación
    "navigation": {
        "monitoring_menu": "//a[@href='/sigma/monitoring']",
        "devices_management": "//a[@href='/sigma/monitoring/devicesManagement']"
    },
    
    # Gestión de Dispositivos
    "devices": {
        "new_device_button": "//button[@aria-label='Add Device Button']",
        "device_modal": "//div[contains(@class, 'modal-theme')]",
        "modal_title": "//h2[contains(text(), 'Registro de Dispositivo')]",
        "close_button": "//button[contains(@class, 'text-secondary')]/*[name()='svg']/.."
    },
    
    # Formulario de Registro
    "form": {
        "device_name_input": "//input[@name='deviceName']",
        "imei_input": "//input[@name='imei']",
        "parameter_checkbox": "//label[contains(., '{parameter}')]//input[@type='checkbox']",
        "submit_button": "//button[@type='submit' and contains(., 'Registrar')]",
        "cancel_button": "//button[contains(., 'Cancelar')]"
    },
    
    # Mensajes
    "messages": {
        "success": "//*[contains(text(), 'exitosamente') or contains(text(), 'éxito') or contains(text(), 'registrado')]",
        "error": "//*[contains(text(), 'error') or contains(text(), 'Error') or contains(text(), 'ya existe') or contains(text(), 'duplicado')]"
    },
    
    # Tabla de Dispositivos
    "table": {
        "device_row": "//td[contains(text(), '{device_name}') or contains(., '{device_name}')]",
        "device_imei": "//td[contains(text(), '{imei}')]"
    }
}

# Mensajes esperados
EXPECTED_MESSAGES = {
    "success": "Dispositivo registrado exitosamente",
    "duplicate_error": "ya existe",
    "validation_error": "debe contener exactamente 15 dígitos"
}

# Timeouts (en segundos)
TIMEOUTS = {
    "page_load": 10,
    "element_wait": 15,
    "modal_open": 5,
    "form_submit": 5,
    "message_display": 3
}

if __name__ == "__main__":
    print("Configuración de IT-GD-001")
    print(f"APP_URL: {APP_URL}")
    print(f"HEADLESS: {HEADLESS}")
    print(f"MONITORING_PARAMETERS: {MONITORING_PARAMETERS}")
    print(f"DB_HOST: {DB_HOST}")
