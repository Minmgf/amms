#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Prueba robusta de IT-GM-003 con mejor manejo de errores
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
from selenium.common.exceptions import WebDriverException, TimeoutException, NoSuchElementException

# Agregar el directorio actual al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from test_config import APP_URL, LOGIN_EMAIL, LOGIN_PASSWORD

def robust_test():
    print("=== PRUEBA ROBUSTA IT-GM-003 ===")
    driver = None
    
    try:
        # Configurar Chrome con opciones mas robustas
        chrome_options = Options()
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--disable-web-security")
        chrome_options.add_argument("--disable-features=VizDisplayCompositor")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        print("1. Iniciando ChromeDriver...")
        service = Service("chromedriver.exe")
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.implicitly_wait(5)
        
        print("2. Navegando a la aplicacion...")
        print(f"   URL: {APP_URL}")
        driver.get(APP_URL)
        time.sleep(5)  # Esperar mas tiempo para que cargue
        
        print(f"   URL actual: {driver.current_url}")
        print(f"   Titulo: {driver.title}")
        
        print("3. Verificando elementos de la pagina...")
        
        # Verificar si hay elementos de login
        email_elements = driver.find_elements(By.XPATH, "//input[@type='email']")
        password_elements = driver.find_elements(By.XPATH, "//input[@type='password']")
        
        print(f"   Campos email encontrados: {len(email_elements)}")
        print(f"   Campos password encontrados: {len(password_elements)}")
        
        if email_elements and password_elements:
            print("4. Realizando login...")
            
            email_input = email_elements[0]
            password_input = password_elements[0]
            
            # Limpiar y llenar campos
            email_input.clear()
            email_input.send_keys(LOGIN_EMAIL)
            print(f"   Email ingresado: {LOGIN_EMAIL}")
            
            password_input.clear()
            password_input.send_keys(LOGIN_PASSWORD)
            print("   Password ingresado")
            
            # Buscar y hacer clic en boton de login
            login_buttons = driver.find_elements(By.XPATH, "//button[@type='submit']")
            if not login_buttons:
                login_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Login') or contains(text(), 'Iniciar')]")
            if not login_buttons:
                login_buttons = driver.find_elements(By.XPATH, "//input[@type='submit']")
            
            if login_buttons:
                login_button = login_buttons[0]
                print("   Boton de login encontrado")
                login_button.click()
                print("   Clic en boton realizado")
                
                time.sleep(5)  # Esperar respuesta del login
                
                current_url = driver.current_url
                print(f"   URL despues del login: {current_url}")
                
                if "login" not in current_url.lower():
                    print("   [SUCCESS] Login exitoso!")
                    
                    # Intentar navegar al modulo de mantenimientos
                    print("5. Navegando al modulo de mantenimientos...")
                    maintenance_url = APP_URL.replace("/sigma", "/sigma/maintenance/maintenanceManagement")
                    driver.get(maintenance_url)
                    time.sleep(3)
                    
                    print(f"   URL de mantenimientos: {driver.current_url}")
                    
                    # Verificar si hay tabla de mantenimientos
                    table_elements = driver.find_elements(By.XPATH, "//table//tbody//tr")
                    print(f"   Filas en tabla: {len(table_elements)}")
                    
                    if table_elements:
                        print("   [SUCCESS] Tabla de mantenimientos encontrada!")
                    else:
                        print("   [WARN] No se encontro tabla de mantenimientos")
                else:
                    print("   [WARN] Login puede haber fallado - URL contiene 'login'")
            else:
                print("   [ERROR] Boton de login no encontrado")
        else:
            print("   [ERROR] Campos de login no encontrados")
            print("   Verificando si la aplicacion esta corriendo...")
            
            # Verificar si la aplicacion responde
            page_source = driver.page_source
            if "error" in page_source.lower() or "not found" in page_source.lower():
                print("   [ERROR] La aplicacion no esta respondiendo correctamente")
            else:
                print("   [INFO] La aplicacion responde pero no se encontraron campos de login")
        
        print("=== PRUEBA COMPLETADA ===")
        
    except WebDriverException as e:
        print(f"[ERROR] Error de WebDriver: {e}")
    except TimeoutException as e:
        print(f"[ERROR] Timeout: {e}")
    except NoSuchElementException as e:
        print(f"[ERROR] Elemento no encontrado: {e}")
    except Exception as e:
        print(f"[ERROR] Error inesperado: {e}")
    finally:
        if driver:
            try:
                driver.quit()
                print("ChromeDriver cerrado correctamente")
            except:
                print("Error cerrando ChromeDriver")

if __name__ == "__main__":
    robust_test()


