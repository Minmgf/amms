#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para inspeccionar los elementos de la pagina de login
"""

import os
import sys
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

# Agregar el directorio actual al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from test_config import APP_URL, LOGIN_EMAIL, LOGIN_PASSWORD

def inspect_login_page():
    print("=== INSPECCIONANDO PAGINA DE LOGIN ===")
    driver = None
    
    try:
        # Configurar Chrome
        chrome_options = Options()
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        
        service = Service("chromedriver.exe")
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.implicitly_wait(5)
        
        print(f"Navegando a: {APP_URL}")
        driver.get(APP_URL)
        time.sleep(5)
        
        print(f"URL actual: {driver.current_url}")
        print(f"Titulo: {driver.title}")
        
        # Buscar todos los inputs
        print("\n=== BUSCANDO TODOS LOS INPUTS ===")
        all_inputs = driver.find_elements(By.TAG_NAME, "input")
        print(f"Total de inputs encontrados: {len(all_inputs)}")
        
        for i, input_elem in enumerate(all_inputs):
            try:
                input_type = input_elem.get_attribute("type")
                input_name = input_elem.get_attribute("name")
                input_id = input_elem.get_attribute("id")
                input_class = input_elem.get_attribute("class")
                input_placeholder = input_elem.get_attribute("placeholder")
                is_displayed = input_elem.is_displayed()
                is_enabled = input_elem.is_enabled()
                
                print(f"  Input {i+1}:")
                print(f"    Type: {input_type}")
                print(f"    Name: {input_name}")
                print(f"    ID: {input_id}")
                print(f"    Class: {input_class}")
                print(f"    Placeholder: {input_placeholder}")
                print(f"    Visible: {is_displayed}")
                print(f"    Enabled: {is_enabled}")
                print()
            except Exception as e:
                print(f"    Error obteniendo atributos: {e}")
        
        # Buscar campos de email con diferentes selectores
        print("=== BUSCANDO CAMPOS DE EMAIL ===")
        email_selectors = [
            "//input[@type='email']",
            "//input[@name='email']",
            "//input[@id='email']",
            "//input[contains(@placeholder, 'email')]",
            "//input[contains(@placeholder, 'Email')]",
            "//input[contains(@class, 'email')]",
            "//input[@name='username']",
            "//input[@name='user']",
            "//input[@name='login']"
        ]
        
        for selector in email_selectors:
            try:
                elements = driver.find_elements(By.XPATH, selector)
                if elements:
                    print(f"  Selector '{selector}': {len(elements)} elementos encontrados")
                    for elem in elements:
                        print(f"    - Visible: {elem.is_displayed()}, Enabled: {elem.is_enabled()}")
                else:
                    print(f"  Selector '{selector}': No encontrado")
            except Exception as e:
                print(f"  Selector '{selector}': Error - {e}")
        
        # Buscar campos de password
        print("\n=== BUSCANDO CAMPOS DE PASSWORD ===")
        password_selectors = [
            "//input[@type='password']",
            "//input[@name='password']",
            "//input[@id='password']",
            "//input[contains(@placeholder, 'password')]",
            "//input[contains(@placeholder, 'Password')]",
            "//input[contains(@class, 'password')]"
        ]
        
        for selector in password_selectors:
            try:
                elements = driver.find_elements(By.XPATH, selector)
                if elements:
                    print(f"  Selector '{selector}': {len(elements)} elementos encontrados")
                    for elem in elements:
                        print(f"    - Visible: {elem.is_displayed()}, Enabled: {elem.is_enabled()}")
                else:
                    print(f"  Selector '{selector}': No encontrado")
            except Exception as e:
                print(f"  Selector '{selector}': Error - {e}")
        
        # Buscar botones
        print("\n=== BUSCANDO BOTONES ===")
        button_selectors = [
            "//button[@type='submit']",
            "//button[contains(text(), 'Login')]",
            "//button[contains(text(), 'Iniciar')]",
            "//button[contains(text(), 'Entrar')]",
            "//input[@type='submit']",
            "//button[contains(@class, 'login')]",
            "//button[contains(@class, 'submit')]"
        ]
        
        for selector in button_selectors:
            try:
                elements = driver.find_elements(By.XPATH, selector)
                if elements:
                    print(f"  Selector '{selector}': {len(elements)} elementos encontrados")
                    for elem in elements:
                        print(f"    - Text: '{elem.text}', Visible: {elem.is_displayed()}, Enabled: {elem.is_enabled()}")
                else:
                    print(f"  Selector '{selector}': No encontrado")
            except Exception as e:
                print(f"  Selector '{selector}': Error - {e}")
        
        # Obtener el HTML de la pagina para inspeccionar
        print("\n=== HTML DE LA PAGINA ===")
        page_source = driver.page_source
        print(f"Tamaño del HTML: {len(page_source)} caracteres")
        
        # Buscar palabras clave en el HTML
        keywords = ["email", "password", "login", "username", "user"]
        for keyword in keywords:
            count = page_source.lower().count(keyword.lower())
            print(f"  '{keyword}' aparece {count} veces en el HTML")
        
        print("\n=== INSPECCION COMPLETADA ===")
        
    except Exception as e:
        print(f"[ERROR] Error durante la inspeccion: {e}")
    finally:
        if driver:
            try:
                driver.quit()
            except:
                pass

if __name__ == "__main__":
    inspect_login_page()


