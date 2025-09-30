#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de diagnóstico para identificar errores en IT-GM-003
"""

import os
import sys
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Agregar el directorio actual al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from test_config import APP_URL, LOGIN_EMAIL, LOGIN_PASSWORD
    print("[OK] Configuracion importada correctamente")
    print(f"   APP_URL: {APP_URL}")
    print(f"   EMAIL: {LOGIN_EMAIL}")
    print(f"   PASSWORD: {'*' * len(LOGIN_PASSWORD)}")
except Exception as e:
    print(f"[ERROR] Error importando configuracion: {e}")
    sys.exit(1)

def test_chromedriver():
    """Prueba la configuracion de ChromeDriver"""
    print("\n[TEST] Probando ChromeDriver...")
    try:
        chrome_options = Options()
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--headless")  # Ejecutar en modo headless para diagnostico
        
        service = Service("chromedriver.exe")
        driver = webdriver.Chrome(service=service, options=chrome_options)
        print("[OK] ChromeDriver configurado correctamente")
        
        # Probar navegacion basica
        print("[TEST] Probando navegacion...")
        driver.get(APP_URL)
        time.sleep(3)
        
        current_url = driver.current_url
        print(f"   URL actual: {current_url}")
        
        if "localhost" in current_url:
            print("[OK] Conexion a localhost exitosa")
        else:
            print("[WARN] Posible problema de conexion")
            
        driver.quit()
        print("[OK] ChromeDriver cerrado correctamente")
        return True
        
    except Exception as e:
        print(f"[ERROR] Error con ChromeDriver: {e}")
        return False

def test_application_connection():
    """Prueba la conexion a la aplicacion"""
    print("\n[TEST] Probando conexion a la aplicacion...")
    try:
        chrome_options = Options()
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        
        service = Service("chromedriver.exe")
        driver = webdriver.Chrome(service=service, options=chrome_options)
        
        print(f"   Navegando a: {APP_URL}")
        driver.get(APP_URL)
        time.sleep(5)
        
        current_url = driver.current_url
        print(f"   URL despues de navegacion: {current_url}")
        
        # Verificar si hay elementos de login
        try:
            email_inputs = driver.find_elements(By.XPATH, "//input[@type='email']")
            password_inputs = driver.find_elements(By.XPATH, "//input[@type='password']")
            print(f"   Campos de email encontrados: {len(email_inputs)}")
            print(f"   Campos de password encontrados: {len(password_inputs)}")
            
            if email_inputs and password_inputs:
                print("[OK] Pagina de login detectada")
            else:
                print("[WARN] No se detectaron campos de login")
                
        except Exception as e:
            print(f"[WARN] Error buscando campos de login: {e}")
        
        driver.quit()
        return True
        
    except Exception as e:
        print(f"[ERROR] Error de conexion: {e}")
        return False

def main():
    print("DIAGNOSTICO DE IT-GM-003")
    print("=" * 50)
    
    # Verificar archivos
    print("Verificando archivos...")
    files_to_check = ["IT-GM-003.py", "test_config.py", "chromedriver.exe"]
    for file in files_to_check:
        if os.path.exists(file):
            print(f"   [OK] {file}")
        else:
            print(f"   [ERROR] {file} - NO ENCONTRADO")
    
    # Probar ChromeDriver
    chromedriver_ok = test_chromedriver()
    
    # Probar conexion a la aplicacion
    if chromedriver_ok:
        connection_ok = test_application_connection()
    else:
        connection_ok = False
    
    print("\nRESUMEN DEL DIAGNOSTICO:")
    print("=" * 50)
    print(f"ChromeDriver: {'[OK]' if chromedriver_ok else '[ERROR]'}")
    print(f"Conexion App: {'[OK]' if connection_ok else '[ERROR]'}")
    
    if chromedriver_ok and connection_ok:
        print("\n[SUCCESS] Todo parece estar funcionando correctamente!")
        print("   Puedes ejecutar: python IT-GM-003.py")
    else:
        print("\n[WARN] Se encontraron problemas. Revisa los errores arriba.")

if __name__ == "__main__":
    main()
