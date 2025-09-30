# Configuración para prueba IT-SM-005
# Ajusta estos valores según tu entorno

# URL de la aplicación (con prefijo /sigma)
APP_URL = "http://localhost:3000/sigma"

# Credenciales de login
LOGIN_EMAIL = "diegosamboni2001@gmail.com"
LOGIN_PASSWORD = "Juandiego19!"

# Configuración de la prueba
TEST_NAME = "IT-SM-005"
TEST_DESCRIPTION = "Rechazar Solicitud de Mantenimiento"

# Tiempos de espera (en segundos)
WAIT_TIMEOUT = 10
SHORT_WAIT = 3
LONG_WAIT = 5

# Configuración del navegador
BROWSER_HEADLESS = False
BROWSER_WINDOW_SIZE = "--window-size=1920,1080"

# Motivo de rechazo para la prueba
REJECTION_REASON = "Solicitud rechazada por falta de información técnica detallada y recursos no disponibles en el momento solicitado."
