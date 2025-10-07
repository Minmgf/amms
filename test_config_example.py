# Configuración de ejemplo para prueba HU-GM-003
# Copia este archivo como test_config.py y ajusta los valores según tu entorno

# URL de la aplicación AMMS (con prefijo /sigma)
APP_URL = "http://localhost:3000/sigma"

# Credenciales de login
# IMPORTANTE: Ajusta estas credenciales según tu entorno de prueba
LOGIN_EMAIL = "admin@test.com"
LOGIN_PASSWORD = "password123"

# Tiempos de espera (en segundos)
WAIT_TIMEOUT = 10  # Tiempo máximo de espera para elementos
IMPLICIT_WAIT = 5   # Tiempo de espera implícita

# Configuración de Chrome
CHROME_OPTIONS = [
    "--disable-blink-features=AutomationControlled",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--window-size=1920,1080"
]

# Datos de prueba para mantenimientos
TEST_MAINTENANCE_NAME = "Mantenimiento_Test"
TEST_MAINTENANCE_DESCRIPTION = "Descripción de prueba para mantenimiento"
TEST_MAINTENANCE_TYPE = "Preventivo"

# Configuración adicional para diferentes entornos
ENVIRONMENTS = {
    "development": {
        "APP_URL": "http://localhost:3000",
        "LOGIN_EMAIL": "admin@test.com",
        "LOGIN_PASSWORD": "password123"
    },
    "staging": {
        "APP_URL": "https://staging.amms.com",
        "LOGIN_EMAIL": "test@staging.com",
        "LOGIN_PASSWORD": "staging123"
    },
    "production": {
        "APP_URL": "https://amms.com",
        "LOGIN_EMAIL": "test@production.com",
        "LOGIN_PASSWORD": "prod123"
    }
}

# Seleccionar entorno (cambiar según necesidad)
CURRENT_ENVIRONMENT = "development"

# Configuración de reportes
GENERATE_SCREENSHOTS = True
SCREENSHOT_ON_ERROR = True
GENERATE_JSON_REPORT = True

# Configuración de validaciones
VALIDATE_REQUIRED_FIELDS = True
VALIDATE_DUPLICATE_NAMES = True
VALIDATE_PERMISSIONS = True

# Configuración de timeouts específicos
TIMEOUTS = {
    "login": 15,
    "navigation": 10,
    "element_click": 5,
    "form_submit": 10,
    "page_load": 30
}

# Selectores personalizados (ajustar según tu implementación)
SELECTORS = {
    "login_email": "input[name='email']",
    "login_password": "input[name='password']",
    "login_button": "button[type='submit']",
    "maintenance_link": "a[href*='maintenance']",
    "edit_button": "button[title*='Editar']",
    "name_input": "input[name='name']",
    "description_input": "textarea[name='description']",
    "type_select": "select[name='maintenanceType']",
    "save_button": "button:contains('Guardar')"
}

# Configuración de datos de prueba
TEST_DATA = {
    "maintenance_names": [
        "Mantenimiento Preventivo",
        "Mantenimiento Correctivo",
        "Mantenimiento Predictivo"
    ],
    "maintenance_descriptions": [
        "Descripción de mantenimiento preventivo",
        "Descripción de mantenimiento correctivo",
        "Descripción de mantenimiento predictivo"
    ],
    "maintenance_types": [
        "Preventivo",
        "Correctivo",
        "Predictivo"
    ]
}

# Configuración de validaciones específicas
VALIDATION_MESSAGES = {
    "required_field": "Este campo es obligatorio",
    "duplicate_name": "Ya existe un mantenimiento con este nombre",
    "invalid_type": "Tipo de mantenimiento no válido",
    "description_too_long": "La descripción no puede exceder 300 caracteres"
}

# Configuración de permisos
REQUIRED_PERMISSIONS = [
    "maintenance.read",
    "maintenance.update",
    "maintenance.manage"
]

# Configuración de navegación
NAVIGATION_STEPS = [
    "login",
    "navigate_to_maintenance",
    "select_maintenance",
    "edit_maintenance",
    "validate_fields",
    "save_changes"
]

# Configuración de reportes
REPORT_CONFIG = {
    "include_screenshots": True,
    "include_console_logs": True,
    "include_network_logs": False,
    "report_format": "json",
    "save_location": "./reports/"
}
