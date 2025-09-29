# Configuración para prueba IT-GM-003
# Ajusta estos valores según tu entorno

# URL de la aplicación (con prefijo /sigma)
APP_URL = "http://localhost:3000/sigma"

# Credenciales de login
LOGIN_EMAIL = "diegosamboni2001@gmail.com"
LOGIN_PASSWORD = "Juandiego19!"

# Tiempos de espera (en segundos)
WAIT_TIMEOUT = 10
IMPLICIT_WAIT = 5

# Configuración de Chrome
CHROME_OPTIONS = [
    "--disable-blink-features=AutomationControlled",
    "--no-sandbox",
    "--disable-dev-shm-usage"
]

# Datos de prueba
TEST_MAINTENANCE_NAME = "Mantenimiento_Test"
TEST_MAINTENANCE_DESCRIPTION = "Descripción de prueba para mantenimiento"
TEST_MAINTENANCE_TYPE = "Preventivo"

