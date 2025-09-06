#!/usr/bin/env python3
"""
Explorador de selectores para IT-GUSU-007 - Interfaz de gestión de cuentas
========================================================================

Este archivo sirve para explorar paso a paso la interfaz de gestión de usuarios
y recolectar los selectores CSS/XPath correctos para el test principal.
"""

import time
import sys
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from dotenv import load_dotenv
import os

# Cargar configuración
PROJECT_ROOT = Path(__file__).parent.parent
load_dotenv(PROJECT_ROOT / '.env')
sys.path.insert(0, str(PROJECT_ROOT / 'flows' / 'auth' / 'login'))

class UserManagementExplorer:
    """Explorador para recopilar selectores de gestión de usuarios"""
    
    def __init__(self):
        self.driver = None
        self.wait = None
        self.found_selectors = {
            'search_input': [],
            'user_rows': [],
            'user_data': [],
            'action_buttons': [],
            'modals': [],
            'notifications': []
        }
    
    def setup_driver(self):
        """Configurar navegador"""
        print("🌐 Configurando navegador...")
        
        options = ChromeOptions()
        options.add_argument('--window-size=1920,1080')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        
        chromedriver_path = PROJECT_ROOT / 'chromedriver' / 'driver.exe'
        service = ChromeService(executable_path=str(chromedriver_path))
        
        self.driver = webdriver.Chrome(service=service, options=options)
        self.wait = WebDriverWait(self.driver, 15)
        print("   ✅ Navegador iniciado")
    
    def login(self):
        """Realizar login"""
        print("🔐 Realizando login...")
        
        try:
            from login_flow import LoginFlow
            
            login_flow = LoginFlow(driver_path=str(PROJECT_ROOT / 'chromedriver' / 'driver.exe'))
            login_flow.driver = self.driver
            login_flow.wait = self.wait
            
            login_flow.login()
            
            if login_flow.is_logged_in():
                print("   ✅ Login exitoso")
                return True
            else:
                print("   ❌ Login falló")
                return False
                
        except Exception as e:
            print(f"   ❌ Error en login: {e}")
            return False
    
    def navigate_to_user_management(self):
        """Navegar a gestión de usuarios"""
        print("🧭 Navegando a Gestión de Usuarios...")
        
        # Buscar enlace de gestión de usuarios
        selectors_to_try = [
            "//a[contains(@href, 'userManagement')]",
            "//a[contains(text(), 'Gestión de Usuarios')]",
            "//a[contains(text(), 'User Management')]",
            "//div[contains(@class, 'sidebar')]//a[contains(@href, 'userManagement')]",
            "//nav//a[contains(@href, 'userManagement')]"
        ]
        
        for selector in selectors_to_try:
            try:
                element = self.wait.until(EC.element_to_be_clickable((By.XPATH, selector)))
                element.click()
                print(f"   ✅ Navegación exitosa usando: {selector}")
                time.sleep(3)  # Esperar carga
                return True
            except TimeoutException:
                continue
        
        print("   ⚠️ Intentando navegación directa...")
        try:
            current_url = self.driver.current_url
            base_url = current_url.split('/home')[0] if '/home' in current_url else current_url.rstrip('/')
            user_mgmt_url = f"{base_url}/userManagement"
            self.driver.get(user_mgmt_url)
            print(f"   ✅ Navegación directa a: {user_mgmt_url}")
            time.sleep(3)
            return True
        except Exception as e:
            print(f"   ❌ Error en navegación: {e}")
            return False
    
    def explore_page_elements(self):
        """Explorar elementos de la página paso a paso"""
        print("\n🔍 EXPLORANDO ELEMENTOS DE LA PÁGINA...")
        print("="*60)
        
        # 1. Explorar campo de búsqueda
        print("\n1. 🔎 BUSCANDO CAMPO DE BÚSQUEDA...")
        search_selectors = [
            "//input[@placeholder='Buscar usuarios...']",  # Selector proporcionado
            "//input[contains(@placeholder, 'Buscar')]",
            "//input[@type='search']",
            "//input[contains(@class, 'search')]",
            "//input[@name='search']"
        ]
        
        for selector in search_selectors:
            try:
                element = self.driver.find_element(By.XPATH, selector)
                if element.is_displayed():
                    print(f"   ✅ ENCONTRADO: {selector}")
                    print(f"      - Placeholder: {element.get_attribute('placeholder')}")
                    print(f"      - Clase: {element.get_attribute('class')}")
                    print(f"      - ID: {element.get_attribute('id')}")
                    self.found_selectors['search_input'].append(selector)
                    break
            except NoSuchElementException:
                print(f"   ❌ No encontrado: {selector}")
        
        # 2. Explorar lista de usuarios
        print("\n2. 👥 BUSCANDO LISTA DE USUARIOS...")
        user_list_selectors = [
            "//table",
            "//tbody//tr",
            "//div[contains(@class, 'user')]",
            "//div[contains(@class, 'table-row')]",
            "//li[contains(@class, 'user')]"
        ]
        
        for selector in user_list_selectors:
            try:
                elements = self.driver.find_elements(By.XPATH, selector)
                if elements:
                    print(f"   ✅ ENCONTRADO: {selector} ({len(elements)} elementos)")
                    if len(elements) <= 10:  # Mostrar algunos ejemplos
                        for i, elem in enumerate(elements[:3]):
                            print(f"      Ejemplo {i+1}: {elem.text[:100]}...")
                    self.found_selectors['user_rows'].append(selector)
            except Exception as e:
                print(f"   ❌ Error con {selector}: {e}")
        
        # 3. Obtener datos de usuarios existentes
        print("\n3. 📊 RECOPILANDO DATOS DE USUARIOS EXISTENTES...")
        self.collect_user_data()
        
        # 4. Explorar botones de acción
        print("\n4. ⚡ BUSCANDO BOTONES DE ACCIÓN...")
        action_selectors = [
            "//button[contains(text(), 'Ver')]",
            "//button[contains(text(), 'Editar')]", 
            "//button[contains(text(), 'Eliminar')]",
            "//button[contains(text(), 'Activar')]",
            "//button[contains(text(), 'Desactivar')]",
            "//a[contains(text(), 'Ver')]",
            "//i[contains(@class, 'eye')]/../..",
            "//i[contains(@class, 'edit')]/../..",
            "//i[contains(@class, 'trash')]/../.."
        ]
        
        for selector in action_selectors:
            try:
                elements = self.driver.find_elements(By.XPATH, selector)
                if elements:
                    print(f"   ✅ ENCONTRADO: {selector} ({len(elements)} elementos)")
                    self.found_selectors['action_buttons'].append(selector)
            except Exception:
                pass
    
    def collect_user_data(self):
        """Recopilar datos de usuarios existentes"""
        print("   📋 Recopilando información de usuarios...")
        
        # Intentar obtener texto de toda la página para extraer nombres/emails
        try:
            page_text = self.driver.find_element(By.TAG_NAME, "body").text
            lines = page_text.split('\n')
            
            # Buscar patrones de email
            emails = []
            names = []
            
            for line in lines:
                # Buscar emails
                if '@' in line and '.' in line:
                    words = line.split()
                    for word in words:
                        if '@' in word and '.' in word:
                            emails.append(word)
                
                # Buscar posibles nombres (palabras con mayúscula inicial)
                words = line.strip().split()
                if len(words) >= 2:
                    if all(word[0].isupper() and word[1:].islower() for word in words[:2] if len(word) > 1):
                        names.append(' '.join(words[:2]))
            
            # Mostrar algunos ejemplos únicos
            unique_emails = list(set(emails))[:5]
            unique_names = list(set(names))[:5]
            
            if unique_emails:
                print(f"      📧 Emails encontrados: {', '.join(unique_emails)}")
                self.found_selectors['user_data'].extend(unique_emails)
            
            if unique_names:
                print(f"      👤 Nombres encontrados: {', '.join(unique_names)}")
                self.found_selectors['user_data'].extend(unique_names)
                
        except Exception as e:
            print(f"   ⚠️ Error recopilando datos: {e}")
    
    def test_search_functionality(self):
        """Probar la funcionalidad de búsqueda con datos reales"""
        print("\n5. 🧪 PROBANDO FUNCIONALIDAD DE BÚSQUEDA...")
        
        if not self.found_selectors['search_input']:
            print("   ❌ No se encontró campo de búsqueda")
            return
        
        search_selector = self.found_selectors['search_input'][0]
        
        # Términos de búsqueda basados en datos encontrados
        search_terms = []
        if self.found_selectors['user_data']:
            # Usar primeras palabras de los datos encontrados
            for data in self.found_selectors['user_data'][:3]:
                if '@' in data:
                    # Es un email, usar parte antes de @
                    search_terms.append(data.split('@')[0])
                else:
                    # Es un nombre, usar primera palabra
                    search_terms.append(data.split()[0])
        
        # Términos de respaldo
        search_terms.extend(['sigma', 'admin', 'test', 'user'])
        
        for term in search_terms[:3]:  # Probar máximo 3 términos
            try:
                print(f"   🔍 Probando búsqueda con: '{term}'")
                
                search_field = self.driver.find_element(By.XPATH, search_selector)
                search_field.clear()
                search_field.send_keys(term)
                search_field.send_keys(Keys.ENTER)
                
                time.sleep(2)  # Esperar resultados
                
                # Verificar si cambió algo en la página
                current_text = self.driver.find_element(By.TAG_NAME, "body").text
                if term.lower() in current_text.lower():
                    print(f"      ✅ Búsqueda funcionando - término '{term}' encontrado en resultados")
                else:
                    print(f"      ⚠️ Término '{term}' no visible en resultados")
                
                # Limpiar búsqueda
                search_field.clear()
                search_field.send_keys(Keys.ENTER)
                time.sleep(1)
                
            except Exception as e:
                print(f"      ❌ Error probando '{term}': {e}")
    
    def check_for_modals_popups(self):
        """Buscar modales o pop-ups"""
        print("\n6. 🪟 BUSCANDO MODALES/POP-UPS...")
        
        modal_selectors = [
            "//div[contains(@class, 'modal')]",
            "//div[contains(@class, 'popup')]", 
            "//div[contains(@class, 'dialog')]",
            "//div[@role='dialog']",
            "//div[contains(@class, 'overlay')]"
        ]
        
        for selector in modal_selectors:
            try:
                elements = self.driver.find_elements(By.XPATH, selector)
                if elements:
                    print(f"   ✅ Modal encontrado: {selector} ({len(elements)} elementos)")
                    for elem in elements:
                        if elem.is_displayed():
                            print(f"      - Visible: {elem.text[:100]}...")
                            self.found_selectors['modals'].append(selector)
            except Exception:
                pass
    
    def generate_summary_report(self):
        """Generar reporte resumen"""
        print("\n" + "="*80)
        print("📋 REPORTE FINAL DE SELECTORES ENCONTRADOS")
        print("="*80)
        
        for category, selectors in self.found_selectors.items():
            if selectors:
                print(f"\n📌 {category.upper()}:")
                for selector in set(selectors):  # Eliminar duplicados
                    print(f"   - {selector}")
            else:
                print(f"\n❌ {category.upper()}: No encontrados")
        
        # Generar código de selectores actualizado
        print(f"\n🔧 SELECTORES PARA ACTUALIZAR EN EL TEST:")
        print("-" * 50)
        
        if self.found_selectors['search_input']:
            print("'search_input': [")
            for selector in set(self.found_selectors['search_input']):
                print(f'    "{selector}",')
            print("],")
        
        if self.found_selectors['user_rows']:
            print("'user_rows': [")
            for selector in set(self.found_selectors['user_rows']):
                print(f'    "{selector}",')
            print("],")
        
        if self.found_selectors['action_buttons']:
            print("'action_buttons': [")
            for selector in set(self.found_selectors['action_buttons']):
                print(f'    "{selector}",')
            print("],")
        
        if self.found_selectors['user_data']:
            print(f"\n🎯 DATOS DE PRUEBA SUGERIDOS:")
            print("search_terms = [")
            for data in set(self.found_selectors['user_data'][:5]):
                print(f'    "{data}",')
            print("]")
    
    def run_exploration(self):
        """Ejecutar exploración completa"""
        try:
            print("🚀 INICIANDO EXPLORACIÓN DE GESTIÓN DE USUARIOS")
            print("="*60)
            
            self.setup_driver()
            
            if not self.login():
                return
            
            if not self.navigate_to_user_management():
                return
            
            # Pausa para observación manual
            print(f"\n⏸️  PAUSA PARA OBSERVACIÓN MANUAL (10 segundos)")
            print(f"   📍 URL actual: {self.driver.current_url}")
            print(f"   🔍 Observe la página abierta en el navegador...")
            time.sleep(10)
            
            self.explore_page_elements()
            self.test_search_functionality()
            self.check_for_modals_popups()
            self.generate_summary_report()
            
            # Pausa final para análisis
            print(f"\n⏸️  EXPLORACIÓN COMPLETADA - Presione Enter para cerrar...")
            input()
            
        except KeyboardInterrupt:
            print(f"\n⚠️ Exploración interrumpida por el usuario")
        except Exception as e:
            print(f"\n💥 Error en exploración: {e}")
        finally:
            if self.driver:
                self.driver.quit()
                print("🧹 Navegador cerrado")

def main():
    """Función principal"""
    explorer = UserManagementExplorer()
    explorer.run_exploration()

if __name__ == "__main__":
    main()
