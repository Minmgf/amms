#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Configuración para la prueba IT-GM-005: Verificar eliminación de mantenimiento sin asociaciones
"""

# URL de la aplicación
APP_URL = "http://localhost:3000/sigma"

# Credenciales de login específicas para esta prueba
LOGIN_EMAIL = "camilomchis1@gmail.com"
LOGIN_PASSWORD = "Juancamilobarranco1"

# Configuración de ChromeDriver
CHROMEDRIVER_PATH = "chromedriver.exe"

# Timeouts
DEFAULT_TIMEOUT = 10
IMPLICIT_WAIT = 5

# Configuración de screenshots
SCREENSHOT_ON_ERROR = True
SCREENSHOT_ON_SUCCESS = True

# Datos específicos para la prueba de eliminación
TEST_MAINTENANCE_NAME = "Prueba eliminación"
TEST_MAINTENANCE_DESCRIPTION = "Mantenimiento de prueba para verificar eliminación sin asociaciones"

print("Configuración cargada desde test_config.py para IT-GM-005")
