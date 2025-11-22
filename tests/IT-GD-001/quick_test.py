#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de prueba rápida para IT-GD-001
Útil para debugging y verificación rápida de selectores
"""

import os
import sys
import time
from pathlib import Path
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Agregar rutas al path
CURRENT_DIR = Path(__file__).parent
PROJECT_ROOT = CURRENT_DIR.parent
sys.path.append(str(PROJECT_ROOT))

from flows.auth.login.selenium_login_flow import perform_login, create_maximized_driver


def quick_test():
    """Ejecuta una prueba rápida de navegación"""
    print("="*70)
    print("PRUEBA RÁPIDA IT-GD-001")
    print("="*70)
    
    driver = None
    
    try:
        # 1. Setup y Login
        print("\n1. Configurando driver y realizando login...")
        driver = create_maximized_driver()
        driver = perform_login(driver)
        time.sleep(2)
        print("✓ Login exitoso")
        
        # 2. Navegar a Monitoreo
        print("\n2. Navegando a Monitoreo...")
        wait = WebDriverWait(driver, 15)
        
        monitoring_menu = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//a[@href='/sigma/monitoring']"))
        )
        monitoring_menu.click()
        time.sleep(2)
        print("✓ Menú Monitoreo desplegado")
        
        # 3. Navegar a Gestión de Dispositivos
        print("\n3. Navegando a Gestión de Dispositivos...")
        devices_link = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//a[@href='/sigma/monitoring/devicesManagement']"))
        )
        devices_link.click()
        time.sleep(3)
        print(f"✓ URL actual: {driver.current_url}")
        
        # 4. Abrir modal
        print("\n4. Abriendo modal de Nuevo Dispositivo...")
        new_device_button = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[@aria-label='Add Device Button']"))
        )
        new_device_button.click()
        time.sleep(2)
        
        # Verificar modal
        modal = wait.until(
            EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'modal-theme')]"))
        )
        
        if modal.is_displayed():
            print("✓ Modal abierto")
            
            # Mostrar elementos del formulario
            print("\n5. Elementos del formulario encontrados:")
            
            name_input = modal.find_element(By.XPATH, ".//input[@name='deviceName']")
            print(f"  ✓ Campo Nombre: visible={name_input.is_displayed()}")
            
            imei_input = modal.find_element(By.XPATH, ".//input[@name='imei']")
            print(f"  ✓ Campo IMEI: visible={imei_input.is_displayed()}")
            
            checkboxes = modal.find_elements(By.XPATH, ".//input[@type='checkbox']")
            print(f"  ✓ Checkboxes encontrados: {len(checkboxes)}")
            
            submit_button = modal.find_element(By.XPATH, ".//button[@type='submit' and contains(., 'Registrar')]")
            print(f"  ✓ Botón Registrar: visible={submit_button.is_displayed()}")
            
            # Listar parámetros disponibles
            print("\n6. Parámetros de monitoreo disponibles:")
            labels = modal.find_elements(By.XPATH, ".//label[.//input[@type='checkbox']]")
            for i, label in enumerate(labels, 1):
                param_text = label.text.strip()
                print(f"  {i}. {param_text}")
            
        else:
            print("✗ Modal no visible")
        
        print("\n" + "="*70)
        print("PRUEBA RÁPIDA COMPLETADA")
        print("="*70)
        print("\n⏸️  El navegador permanecerá abierto por 10 segundos...")
        time.sleep(10)
        
    except Exception as e:
        print(f"\n✗ Error en prueba rápida: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        if driver:
            print("\nCerrando navegador...")
            driver.quit()
            print("✓ Navegador cerrado")


if __name__ == "__main__":
    quick_test()
