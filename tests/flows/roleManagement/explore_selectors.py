"""
Script de exploración para capturar los selectores correctos de Role Management

Este script navegará paso a paso y capturará información sobre:
1. URL después del login
2. Elementos del sidebar
3. Enlaces disponibles
4. URL correcta de Role Management

Autor: Juan Nicolás Urrutia Salcedo
Fecha: 2025-09-05
"""

import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from dotenv import load_dotenv

load_dotenv()
EMAIL = os.getenv('EMAIL')
PASSWORD = os.getenv('PASSWORD')
LOGIN_URL = "http://localhost:3000/sigma/login"

def explore_role_management():
    """Explorar la navegación a Role Management paso a paso"""
    
    # Configurar navegador
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-web-security")
    
    try:
        service = Service(executable_path="./chromedriver/driver.exe")
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.maximize_window()
        wait = WebDriverWait(driver, 10)
        
        print("🔍 EXPLORANDO ROLE MANAGEMENT")
        print("=" * 50)
        
        # Paso 1: Login
        print("1. Ejecutando login...")
        driver.get(LOGIN_URL)
        
        email_field = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        email_field.send_keys(EMAIL)
        
        password_field = driver.find_element(By.NAME, "password")
        password_field.send_keys(PASSWORD)
        
        login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        login_button.click()
        
        time.sleep(3)
        current_url = driver.current_url
        print(f"   ✓ Login exitoso. URL después del login: {current_url}")
        
        # Paso 2: Explorar sidebar
        print("\n2. Explorando sidebar...")
        try:
            # Buscar elementos del sidebar
            sidebar_elements = driver.find_elements(By.XPATH, "//nav//a | //aside//a | //div[contains(@class, 'sidebar')]//a")
            print(f"   📋 Encontrados {len(sidebar_elements)} enlaces en sidebar:")
            
            for i, element in enumerate(sidebar_elements[:10]):  # Limitar a los primeros 10
                try:
                    text = element.text.strip()
                    href = element.get_attribute('href')
                    if text and href:
                        print(f"      {i+1}. Texto: '{text}' - Href: {href}")
                except:
                    continue
                    
        except Exception as e:
            print(f"   ⚠️ Error explorando sidebar: {e}")
        
        # Paso 3: Buscar elementos relacionados con roles
        print("\n3. Buscando elementos relacionados con 'role'...")
        try:
            role_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'role') or contains(text(), 'Role') or contains(text(), 'rol') or contains(text(), 'Rol')]")
            print(f"   🎭 Encontrados {len(role_elements)} elementos con 'role':")
            
            for i, element in enumerate(role_elements[:5]):  # Limitar a los primeros 5
                try:
                    text = element.text.strip()
                    tag = element.tag_name
                    onclick = element.get_attribute('onclick')
                    href = element.get_attribute('href')
                    
                    print(f"      {i+1}. Tag: {tag}, Texto: '{text}'")
                    if href:
                        print(f"         Href: {href}")
                    if onclick:
                        print(f"         OnClick: {onclick}")
                except:
                    continue
                    
        except Exception as e:
            print(f"   ⚠️ Error buscando elementos role: {e}")
        
        # Paso 4: Intentar URLs posibles
        print("\n4. Probando URLs posibles para Role Management...")
        base_url = current_url.split('/dashboard')[0] if '/dashboard' in current_url else current_url.rstrip('/')
        
        possible_urls = [
            f"{base_url}/sigma/userManagement/roleManagement"
        ]
        
        for url in possible_urls:
            try:
                print(f"   🌐 Probando: {url}")
                driver.get(url)
                time.sleep(2)
                
                page_title = driver.title
                page_source_snippet = driver.page_source[:500] if driver.page_source else ""
                
                print(f"      Título: {page_title}")
                
                # Verificar si es una página válida (no 404)
                if "404" not in page_title.lower() and "not found" not in page_title.lower():
                    if "role" in page_title.lower() or "role" in page_source_snippet.lower():
                        print(f"      ✅ PÁGINA VÁLIDA ENCONTRADA: {url}")
                        
                        # Explorar esta página
                        try:
                            h1_elements = driver.find_elements(By.TAG_NAME, "h1")
                            h2_elements = driver.find_elements(By.TAG_NAME, "h2")
                            
                            print(f"         H1s encontrados:")
                            for h1 in h1_elements[:3]:
                                print(f"           - {h1.text}")
                                
                            print(f"         H2s encontrados:")
                            for h2 in h2_elements[:3]:
                                print(f"           - {h2.text}")
                                
                        except Exception as inner_e:
                            print(f"         Error explorando página: {inner_e}")
                        
                        break
                else:
                    print(f"      ❌ Página inválida (404 o similar)")
                    
            except Exception as e:
                print(f"      ⚠️ Error accediendo a {url}: {e}")
        
        print(f"\n🏁 Exploración completada. El navegador permanecerá abierto por 10 segundos...")
        time.sleep(10)
        
    except Exception as e:
        print(f"❌ Error general: {e}")
    
    finally:
        if 'driver' in locals():
            driver.quit()

if __name__ == "__main__":
    explore_role_management()
