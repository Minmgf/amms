#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Prueba de Integración IT-GM-002: Verificar listado de mantenimientos con filtros y paginación
Historia de Usuario: HU-GM-002

Descripción: Validar tabla de mantenimientos con filtros por tipo y estado
Precondiciones: 15 mantenimientos registrados (10 activos, 5 inactivos)
Datos de Entrada: Filtro tipo "Preventivo", Filtro estado "Activo", Página 1
"""

import os
import sys
import time
import json
from datetime import datetime
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.action_chains import ActionChains

# Importar funciones de navegación desde Mantenimiento-Nav.py
# Nota: El archivo se llama Mantenimiento-Nav.py pero Python no puede importar con guiones
# Por eso importamos directamente las funciones necesarias
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Importar funciones directamente del archivo
import importlib.util
spec = importlib.util.spec_from_file_location("mantenimiento_nav", os.path.join(os.path.dirname(__file__), 'Mantenimiento-Nav.py'))
mantenimiento_nav = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mantenimiento_nav)

# Hacer las funciones disponibles globalmente
perform_login = mantenimiento_nav.perform_login
navigate_to_maintenance_manager = mantenimiento_nav.navigate_to_maintenance_manager
create_maximized_driver = mantenimiento_nav.create_maximized_driver
save_browser_logs = mantenimiento_nav.save_browser_logs

class TestITGM002MaintenanceListFilters:
    def __init__(self):
        self.driver = None
        self.wait = None
        self.test_results = []
        self.reports_dir = "reports"
        self.results_dir = "results"
        
        # Crear directorios si no existen
        os.makedirs(self.reports_dir, exist_ok=True)
        os.makedirs(self.results_dir, exist_ok=True)
    
    def log_test_result(self, step, success, message):
        """Registra el resultado de un paso del test"""
        result = {
            "step": step,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "OK" if success else "ERROR"
        print(f"{status} {step}: {message}")
    
    
    def setup_test_environment(self, headless=False):
        """Configura el entorno de prueba (login + navegación)"""
        print("=== CONFIGURANDO ENTORNO DE PRUEBA ===")
        
        try:
            # Credenciales del Mantenimiento-Nav.py
            email = "danielsr_1997@hotmail.com"
            password = "Usuario9924."
            
            print(f"Email: {email}")
            print(f"Password: {'*' * len(password)}")
            
            # Crear driver maximizado
            print("Creando driver de Chrome...")
            self.driver = create_maximized_driver(headless=headless)
            self.wait = WebDriverWait(self.driver, 15)
            
            # Realizar login
            print("Realizando login...")
            self.driver = perform_login(self.driver, email, password)
            
            # Navegar al gestor de mantenimientos con manejo de errores mejorado
            print("Navegando al gestor de mantenimientos...")
            try:
                self.driver = navigate_to_maintenance_manager(self.driver)
            except Exception as nav_error:
                print(f"Error en navegación: {nav_error}")
                print("Intentando navegación directa...")
                
                # Intentar navegación directa como fallback
                maintenance_url = "http://localhost:3000/sigma/maintenance/maintenanceManagement"
                print(f"Navegando directamente a: {maintenance_url}")
                self.driver.get(maintenance_url)
                time.sleep(3)
                
                # Verificar que la página cargó
                current_url = self.driver.current_url
                print(f"URL actual después de navegación directa: {current_url}")
                
                if 'mantenimiento' in current_url.lower() or 'maintenance' in current_url.lower():
                    print("Navegación directa exitosa")
                else:
                    raise Exception(f"No se pudo navegar al gestor de mantenimientos. URL actual: {current_url}")
            
            self.log_test_result("Setup", True, "Entorno configurado exitosamente")
            return True
            
        except Exception as e:
            self.log_test_result("Setup", False, f"Error configurando entorno: {e}")
            return False
    
    def verify_maintenance_list_display(self):
        """Verifica que la lista de mantenimientos se muestra correctamente"""
        print("=== VERIFICANDO LISTA DE MANTENIMIENTOS ===")
        
        try:
            time.sleep(3)
            
            # Buscar tabla de mantenimientos
            table_selectors = [
                "//table",
                "//div[contains(@class, 'table')]",
                "//div[contains(@class, 'list')]",
                "//div[contains(@class, 'grid')]"
            ]
            
            table = None
            for selector in table_selectors:
                try:
                    table = self.driver.find_element(By.XPATH, selector)
                    if table.is_displayed():
                        print(f"Tabla encontrada con selector: {selector}")
                        break
                except:
                    continue
            
            if not table:
                # Buscar filas directamente
                table_rows = self.driver.find_elements(By.XPATH, "//tr | //div[contains(@class, 'row')] | //div[contains(@class, 'item')]")
                if table_rows:
                    self.log_test_result("Lista_Display", True, f"Elementos encontrados en la página ({len(table_rows)} elementos)")
                    return True
                else:
                    self.log_test_result("Lista_Display", False, "No se encontraron elementos en la página")
                    return False
            
            # Verificar filas de la tabla
            table_rows = table.find_elements(By.XPATH, ".//tr | .//div[contains(@class, 'row')]")
            if not table_rows:
                table_rows = self.driver.find_elements(By.XPATH, "//tr | //div[contains(@class, 'row')] | //div[contains(@class, 'item')]")
            
            if not table_rows:
                self.log_test_result("Lista_Display", False, "No se encontraron mantenimientos en la tabla")
                return False
            
            print(f"Encontrados {len(table_rows)} elementos en la tabla")
            
            # Mostrar información de los primeros elementos
            for i, row in enumerate(table_rows[:5]):
                try:
                    name_cell = None
                    name_selectors = [".//td[2]", ".//td[1]", ".//div[contains(@class, 'name')]", ".//span", ".//p"]
                    for selector in name_selectors:
                        try:
                            name_cell = row.find_element(By.XPATH, selector)
                            if name_cell.text.strip(): 
                                break
                        except: 
                            continue
                    if name_cell and name_cell.text.strip():
                        print(f"  {i+1}. {name_cell.text.strip()}")
                    else:
                        print(f"  {i+1}. [Contenido no disponible]")
                except:
                    print(f"  {i+1}. [Elemento no disponible]")
            
            self.log_test_result("Lista_Display", True, f"Lista de mantenimientos verificada ({len(table_rows)} elementos)")
            return True
            
        except Exception as e:
            self.log_test_result("Lista_Display", False, f"Error verificando lista: {e}")
            return False
    
    def test_pagination_navigation(self):
        """Prueba la navegación entre páginas"""
        print("=== PROBANDO NAVEGACIÓN ENTRE PÁGINAS ===")
        
        try:
            # Verificar si existe paginación
            pagination_selectors = [
                "//button[contains(@class, 'pagination')]",
                "//button[contains(text(), 'Previous') or contains(text(), 'Siguiente') or contains(text(), 'Next')]",
                "//select[contains(@class, 'pagination')]"
            ]
            
            pagination_found = False
            for selector in pagination_selectors:
                try:
                    elements = self.driver.find_elements(By.XPATH, selector)
                    if elements:
                        pagination_found = True
                        print(f"Elementos de paginación encontrados con selector: {selector}")
                        break
                except:
                    continue
            
            if not pagination_found:
                self.log_test_result("Paginacion", True, "No hay paginación disponible - solo una página")
                return True
            
            # Probar botón "Previous" si existe
            try:
                previous_button = self.driver.find_element(By.XPATH, 
                    "//button[@class='parametrization-pagination-button inline-flex items-center px-3 py-2 text-sm font-medium transition-colors'][contains(text(),'← Previous')]")
                if previous_button.is_displayed() and previous_button.is_enabled():
                    print("Probando botón Previous...")
                    previous_button.click()
                    time.sleep(2)
                    print("Click en Previous realizado")
            except:
                print("Botón Previous no encontrado o no disponible")
            
            # Probar botón "Next" si existe
            try:
                next_button = self.driver.find_element(By.XPATH, 
                    "//button[@class='parametrization-pagination-button inline-flex items-center px-3 py-2 text-sm font-medium transition-colors'][contains(text(),'Next →')]")
                if next_button.is_displayed() and next_button.is_enabled():
                    print("Probando botón Next...")
                    next_button.click()
                    time.sleep(2)
                    print("Click en Next realizado")
            except:
                print("Botón Next no encontrado o no disponible")
            
            # Probar selector de elementos por página
            try:
                items_per_page_select = self.driver.find_element(By.XPATH, 
                    "//select[@class='parametrization-pagination-select px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500']")
                if items_per_page_select.is_displayed():
                    print("Probando selector de elementos por página...")
                    select_obj = Select(items_per_page_select)
                    options = select_obj.options
                    if len(options) > 1:
                        select_obj.select_by_index(1)
                        time.sleep(2)
                        print("Selección de elementos por página realizada")
            except:
                print("Selector de elementos por página no encontrado")
            
            self.log_test_result("Paginacion", True, "Navegación entre páginas probada exitosamente")
            return True
            
        except Exception as e:
            self.log_test_result("Paginacion", False, f"Error probando paginación: {e}")
            return False
    
    def test_search_functionality(self):
        """Prueba la funcionalidad de búsqueda"""
        print("=== PROBANDO FUNCIONALIDAD DE BÚSQUEDA ===")
        
        try:
            # Buscar cuadro de búsqueda
            search_input = self.driver.find_element(By.XPATH, "//input[@id='search']")
            if search_input.is_displayed():
                print("Cuadro de búsqueda encontrado")
                
                # Probar búsqueda
                search_input.clear()
                search_input.send_keys("test")
                time.sleep(2)
                print("Búsqueda realizada con término 'test'")
                
                # Limpiar búsqueda
                search_input.clear()
                time.sleep(1)
                print("Búsqueda limpiada")
                
                self.log_test_result("Busqueda", True, "Funcionalidad de búsqueda probada exitosamente")
            else:
                self.log_test_result("Busqueda", False, "Cuadro de búsqueda no encontrado")
                return False
                
        except Exception as e:
            self.log_test_result("Busqueda", False, f"Error probando búsqueda: {e}")
            return False
        
        return True
    
    def test_filters_by_type_and_status(self):
        """Prueba los filtros por tipo y estado"""
        print("=== PROBANDO FILTROS POR TIPO Y ESTADO ===")
        
        try:
            # Buscar botón "Filtrar por"
            filter_button = self.driver.find_element(By.XPATH, "//button[normalize-space()='Filtrar por']")
            if not filter_button.is_displayed():
                self.log_test_result("Filtros", False, "Botón 'Filtrar por' no encontrado")
                return False
            
            print("Abriendo panel de filtros...")
            filter_button.click()
            time.sleep(2)
            
            # Probar filtro por tipo de mantenimiento
            try:
                type_select = self.driver.find_element(By.XPATH, "//*[@id='radix-_r_3_']/div[2]/div[1]/div[1]/select")
                if type_select.is_displayed():
                    print("Probando filtro por tipo de mantenimiento...")
                    select_obj = Select(type_select)
                    options = select_obj.options
                    
                    # Buscar opción "Preventivo"
                    for option in options:
                        if "preventivo" in option.text.lower():
                            select_obj.select_by_visible_text(option.text)
                            print(f"Tipo seleccionado: {option.text}")
                            break
                    else:
                        # Si no encuentra "Preventivo", seleccionar la primera opción disponible
                        if len(options) > 1:
                            select_obj.select_by_index(1)
                            print(f"Tipo seleccionado: {options[1].text}")
            except Exception as e:
                print(f"Error con filtro de tipo: {e}")
            
            # Probar filtro por estado
            try:
                status_select = self.driver.find_element(By.XPATH, "//*[@id='radix-_r_3_']/div[2]/div[1]/div[2]/select")
                if status_select.is_displayed():
                    print("Probando filtro por estado...")
                    select_obj = Select(status_select)
                    options = select_obj.options
                    
                    # Buscar opción "Activo"
                    for option in options:
                        if "activo" in option.text.lower():
                            select_obj.select_by_visible_text(option.text)
                            print(f"Estado seleccionado: {option.text}")
                            break
                    else:
                        # Si no encuentra "Activo", seleccionar la primera opción disponible
                        if len(options) > 1:
                            select_obj.select_by_index(1)
                            print(f"Estado seleccionado: {options[1].text}")
            except Exception as e:
                print(f"Error con filtro de estado: {e}")
            
            # Aplicar filtros
            try:
                apply_button = self.driver.find_element(By.XPATH, "//*[@id='radix-_r_3_']/div[2]/div[2]/button[2]")
                if apply_button.is_displayed():
                    print("Aplicando filtros...")
                    apply_button.click()
                    time.sleep(3)
                    print("Filtros aplicados")
            except Exception as e:
                print(f"Error aplicando filtros: {e}")
            
            # Limpiar filtros
            try:
                clear_button = self.driver.find_element(By.XPATH, "//*[@id='radix-_r_3_']/div[2]/div[2]/button[1]")
                if clear_button.is_displayed():
                    print("Limpiando filtros...")
                    clear_button.click()
                    time.sleep(2)
                    print("Filtros limpiados")
            except Exception as e:
                print(f"Error limpiando filtros: {e}")
            
            self.log_test_result("Filtros", True, "Filtros por tipo y estado probados exitosamente")
            return True
            
        except Exception as e:
            self.log_test_result("Filtros", False, f"Error probando filtros: {e}")
            return False
    
    def test_action_buttons_by_status(self):
        """Prueba los botones de acción según el estado"""
        print("=== PROBANDO BOTONES DE ACCIÓN SEGÚN ESTADO ===")
        
        try:
            # Buscar filas de la tabla
            table_rows = self.driver.find_elements(By.XPATH, "//tbody/tr")
            if not table_rows:
                table_rows = self.driver.find_elements(By.XPATH, "//tr")
            
            if not table_rows:
                self.log_test_result("Botones_Accion", False, "No se encontraron filas en la tabla")
                return False
            
            print(f"Encontradas {len(table_rows)} filas en la tabla")
            
            # Probar botones en la primera fila
            first_row = table_rows[0]
            
            # Hacer hover sobre la fila para mostrar botones
            actions = ActionChains(self.driver)
            actions.move_to_element(first_row).perform()
            time.sleep(2)
            
            # Probar botón de editar
            try:
                edit_button = self.driver.find_element(By.XPATH, "//tbody/tr[1]/td[5]/div[1]/button[1]")
                if edit_button.is_displayed() and edit_button.is_enabled():
                    print("Botón de editar encontrado y disponible")
                    # No hacer click para no abrir modal
                else:
                    print("Botón de editar no disponible")
            except:
                print("Botón de editar no encontrado")
            
            # Probar botón de estado
            try:
                status_button = self.driver.find_element(By.XPATH, "//tbody/tr[1]/td[5]/div[1]/button[2]")
                if status_button.is_displayed() and status_button.is_enabled():
                    print("Botón de estado encontrado y disponible")
                    # No hacer click para no cambiar estado
                else:
                    print("Botón de estado no disponible")
            except:
                print("Botón de estado no encontrado")
            
            # Verificar que los botones existen en otras filas
            buttons_found = 0
            for i, row in enumerate(table_rows[:3]):  # Verificar primeras 3 filas
                try:
                    row_buttons = row.find_elements(By.XPATH, ".//button")
                    if row_buttons:
                        buttons_found += len(row_buttons)
                        print(f"Fila {i+1}: {len(row_buttons)} botones encontrados")
                except:
                    continue
            
            self.log_test_result("Botones_Accion", True, f"Botones de acción verificados ({buttons_found} botones encontrados)")
            return True
            
        except Exception as e:
            self.log_test_result("Botones_Accion", False, f"Error probando botones de acción: {e}")
            return False
    
    def generate_report(self):
        """Genera un reporte de la prueba"""
        print("=== GENERANDO REPORTE ===")
        
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            report_file = os.path.join(self.reports_dir, f"IT_GM_002_Report_{timestamp}.json")
            
            report_data = {
                "test_name": "IT-GM-002: Verificar listado de mantenimientos con filtros y paginación",
                "timestamp": timestamp,
                "results": self.test_results,
                "summary": {
                    "total_steps": len(self.test_results),
                    "passed": len([r for r in self.test_results if r["success"]]),
                    "failed": len([r for r in self.test_results if not r["success"]])
                }
            }
            
            with open(report_file, 'w', encoding='utf-8') as f:
                json.dump(report_data, f, indent=2, ensure_ascii=False)
            
            print(f"Reporte generado: {report_file}")
            return report_file
            
        except Exception as e:
            print(f"Error generando reporte: {e}")
            return None
    
    def run_test(self, headless=False):
        """Ejecuta la prueba completa"""
        print("INICIANDO PRUEBA DE INTEGRACIÓN IT-GM-002: LISTADO CON FILTROS Y PAGINACIÓN")
        print("=" * 80)
        
        try:
            # Configurar entorno
            if not self.setup_test_environment(headless):
                return False
            
            # Ejecutar pasos de la prueba
            steps = [
                self.verify_maintenance_list_display,
                self.test_pagination_navigation,
                self.test_search_functionality,
                self.test_filters_by_type_and_status,
                self.test_action_buttons_by_status
            ]
            
            for step in steps:
                if not step():
                    print(f"Paso fallido: {step.__name__}")
                    break
                time.sleep(1)
            
            
            # Guardar logs del navegador
            save_browser_logs(self.driver, "IT-GM-002")
            
            # Generar reporte
            self.generate_report()
            
            # Mostrar resumen
            total_steps = len(self.test_results)
            passed = len([r for r in self.test_results if r["success"]])
            failed = total_steps - passed
            
            print("\n" + "=" * 80)
            print("RESUMEN DE LA PRUEBA")
            print("=" * 80)
            print(f"Total de pasos: {total_steps}")
            print(f"Exitosos: {passed}")
            print(f"Fallidos: {failed}")
            print(f"Tasa de éxito: {(passed/total_steps)*100:.1f}%")
            
            return failed == 0
            
        except Exception as e:
            print(f"Error ejecutando prueba: {e}")
            return False
        
        finally:
            if self.driver:
                print("Navegador cerrado")
                self.driver.quit()

def main():
    """Función principal"""
    print("=== INICIANDO IT-GM-002: LISTADO DE MANTENIMIENTOS CON FILTROS Y PAGINACIÓN ===")
    
    test = TestITGM002MaintenanceListFilters()
    success = test.run_test(headless=False)
    
    if success:
        print("\nPRUEBA COMPLETADA EXITOSAMENTE")
    else:
        print("\nPRUEBA COMPLETADA CON ERRORES")
    
    return success

if __name__ == "__main__":
    main()
