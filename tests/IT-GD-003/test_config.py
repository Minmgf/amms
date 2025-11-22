"""
Configuración para la prueba IT-GD-003
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

# Configuración de paginación
ITEMS_PER_PAGE_OPTIONS = [10, 20, 30, 40, 50]
DEFAULT_ITEMS_PER_PAGE = 10

# Términos de búsqueda para pruebas
SEARCH_TERMS = {
    "by_name": "GPS Test",
    "by_imei": "358597",
    "partial": "CalAmp"
}

# Estados de dispositivos
DEVICE_STATES = {
    "active": "Activo",
    "inactive": "Inactivo"
}

# Selectores CSS/XPath
SELECTORS = {
    # Navegación
    "navigation": {
        "monitoring_menu": "//a[@href='/sigma/monitoring']",
        "devices_management": "//a[@href='/sigma/monitoring/devicesManagement']"
    },
    
    # Búsqueda y Filtros
    "search_filter": {
        "search_input": "//input[@placeholder='Buscar por nombre o IMEI...']",
        "filter_button": "//button[@aria-label='Filter Button']",
        "new_device_button": "//button[@aria-label='Add Device Button']"
    },
    
    # Tabla
    "table": {
        "table": "//table",
        "header": "//thead[@class='parametrization-table-header']",
        "body": "//tbody[@class='parametrization-table-body']",
        "rows": "//tbody[@class='parametrization-table-body']/tr",
        "columns": {
            "name": ".//td[1]//div",
            "imei": ".//td[2]//div",
            "status": ".//td[3]//span",
            "date": ".//td[4]//div",
            "actions": ".//td[5]"
        }
    },
    
    # Acciones en filas (aparecen con hover)
    "row_actions": {
        "edit_button": ".//button[@aria-label='Edit Button']",
        "delete_button": ".//button[@aria-label='Delete Button']",
        "activate_button": ".//button[@aria-label='Activate Button']"
    },
    
    # Paginación
    "pagination": {
        "container": "//div[contains(@class, 'parametrization-pagination')]",
        "previous": "//button[contains(text(), 'Previous') or contains(text(), '←')]",
        "next": "//button[contains(text(), 'Next') or contains(text(), '→')]",
        "page_number": "//button[contains(@class, 'parametrization-pagination-button') and not(contains(text(), 'Previous')) and not(contains(text(), 'Next'))]",
        "items_selector": "//select[contains(@class, 'parametrization-pagination-select')]"
    },
    
    # Modal de edición
    "edit_modal": {
        "modal": "//div[contains(@class, 'modal-theme')]",
        "title": "//h2",
        "close_button": "//button[contains(@class, 'text-secondary')]",
        "name_input": "//input[@name='deviceName']",
        "imei_input": "//input[@name='imei']",
        "save_button": "//button[@type='submit']",
        "cancel_button": "//button[contains(., 'Cancelar')]"
    },
    
    # Modal/Alert de confirmación de eliminación
    "delete_confirmation": {
        "modal": "//div[contains(@class, 'modal') or contains(@class, 'dialog')]",
        "confirm_button": "//button[contains(text(), 'Confirmar') or contains(text(), 'Eliminar')]",
        "cancel_button": "//button[contains(text(), 'Cancelar')]"
    },
    
    # Estados en badges
    "status_badges": {
        "active": "//span[contains(@class, 'bg-green-100') and contains(text(), 'Activo')]",
        "inactive": "//span[contains(@class, 'bg-pink-100') and contains(text(), 'Inactivo')]"
    }
}

# Timeouts (en segundos)
TIMEOUTS = {
    "page_load": 10,
    "element_wait": 15,
    "hover_wait": 2,
    "modal_open": 5,
    "search_filter": 3,
    "pagination_change": 2
}

# Mensajes esperados
EXPECTED_MESSAGES = {
    "delete_success": "eliminado exitosamente",
    "edit_success": "actualizado exitosamente",
    "activate_success": "activado exitosamente",
    "no_results": "No se encontraron resultados"
}

# Columnas de la tabla
TABLE_COLUMNS = [
    "Nombre del Dispositivo",
    "IMEI",
    "Estado Operativo",
    "Fecha de Registro",
    "Acciones"
]

if __name__ == "__main__":
    print("Configuración de IT-GD-003")
    print(f"APP_URL: {APP_URL}")
    print(f"DEVICES_MANAGEMENT_URL: {DEVICES_MANAGEMENT_URL}")
    print(f"HEADLESS: {HEADLESS}")
    print(f"DEFAULT_ITEMS_PER_PAGE: {DEFAULT_ITEMS_PER_PAGE}")
    print(f"SEARCH_TERMS: {SEARCH_TERMS}")
