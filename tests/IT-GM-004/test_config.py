#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Configuracion para la prueba IT-GM-004: Eliminar Mantenimiento
"""

# URL de la aplicacion
APP_URL = "http://localhost:3001/sigma"

# Credenciales de login
LOGIN_EMAIL = "diegosamboni2001@gmail.com"
LOGIN_PASSWORD = "Juandiego19!"

# Configuracion de ChromeDriver
CHROMEDRIVER_PATH = "chromedriver.exe"

# Timeouts
DEFAULT_TIMEOUT = 10
IMPLICIT_WAIT = 5

# Configuracion de screenshots
SCREENSHOT_ON_ERROR = True
SCREENSHOT_ON_SUCCESS = True

print("Configuracion cargada desde test_config.py")

