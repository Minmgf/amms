#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script rapido para identificar errores
"""

import os
import sys

print("=== DIAGNOSTICO RAPIDO ===")

# 1. Verificar archivos
print("\n1. Verificando archivos:")
files = ["IT-GM-003.py", "test_config.py", "chromedriver.exe"]
for f in files:
    exists = os.path.exists(f)
    print(f"   {f}: {'EXISTE' if exists else 'NO EXISTE'}")

# 2. Verificar imports
print("\n2. Verificando imports:")
try:
    import selenium
    print("   selenium: OK")
except:
    print("   selenium: ERROR")

try:
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    from test_config import APP_URL, LOGIN_EMAIL, LOGIN_PASSWORD
    print("   test_config: OK")
    print(f"   APP_URL: {APP_URL}")
except Exception as e:
    print(f"   test_config: ERROR - {e}")

# 3. Verificar ChromeDriver
print("\n3. Verificando ChromeDriver:")
try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    service = Service("chromedriver.exe")
    driver = webdriver.Chrome(service=service, options=chrome_options)
    print("   ChromeDriver: OK")
    driver.quit()
except Exception as e:
    print(f"   ChromeDriver: ERROR - {e}")

print("\n=== FIN DIAGNOSTICO ===")


