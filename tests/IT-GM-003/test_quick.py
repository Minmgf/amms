#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Prueba rapida de IT-GM-003 con timeout corto
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
from test_config import APP_URL, LOGIN_EMAIL, LOGIN_PASSWORD

def quick_test():
    print("=== PRUEBA RAPIDA IT-GM-003 ===")
    
    try:
        # Configurar Chrome
        chrome_options = Options()
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        
        service = Service("chromedriver.exe")
        driver = webdriver.Chrome(service=service, options=chrome_options)
        wait = WebDriverWait(driver, 5)  # Timeout corto
        
        print("1. Navegando a la aplicacion...")
        driver.get(APP_URL)
        time.sleep(3)
        
        print(f"   URL actual: {driver.current_url}")
        
        print("2. Buscando campos de login...")
        email_input = None
        password_input = None
        
        # Buscar campo de email
        email_selectors = [
            "//input[@type='email']", 
            "//input[@name='email']",
            "//input[@placeholder*='email' or @placeholder*='Email']"
        ]
        
        for selector in email_selectors:
            try:
                email_input = driver.find_element(By.XPATH, selector)
                if email_input.is_displayed():
                    print(f"   Campo email encontrado: {selector}")
                    break
            except:
                continue
        
        # Buscar campo de password
        password_selectors = [
            "//input[@type='password']", 
            "//input[@name='password']",
            "//input[@placeholder*='password' or @placeholder*='Password']"
        ]
        
        for selector in password_selectors:
            try:
                password_input = driver.find_element(By.XPATH, selector)
                if password_input.is_displayed():
                    print(f"   Campo password encontrado: {selector}")
                    break
            except:
                continue
        
        if email_input and password_input:
            print("3. Intentando login...")
            email_input.clear()
            email_input.send_keys(LOGIN_EMAIL)
            password_input.clear()
            password_input.send_keys(LOGIN_PASSWORD)
            
            # Buscar boton de login
            login_button = None
            button_selectors = [
                "//button[@type='submit']",
                "//button[contains(text(), 'Login') or contains(text(), 'Iniciar')]",
                "//input[@type='submit']"
            ]
            
            for selector in button_selectors:
                try:
                    login_button = driver.find_element(By.XPATH, selector)
                    if login_button.is_displayed() and login_button.is_enabled():
                        print(f"   Boton login encontrado: {selector}")
                        break
                except:
                    continue
            
            if login_button:
                login_button.click()
                print("   Clic en boton de login realizado")
                time.sleep(3)
                
                current_url = driver.current_url
                print(f"   URL despues del login: {current_url}")
                
                if "login" not in current_url:
                    print("   [SUCCESS] Login exitoso!")
                else:
                    print("   [WARN] Login puede haber fallado")
            else:
                print("   [ERROR] Boton de login no encontrado")
        else:
            print("   [ERROR] Campos de login no encontrados")
        
        driver.quit()
        print("=== PRUEBA COMPLETADA ===")
        
    except Exception as e:
        print(f"[ERROR] Error en la prueba: {e}")
        if 'driver' in locals():
            driver.quit()

if __name__ == "__main__":
    quick_test()


