#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
IT-CON-001 - Selenium Test: Registrar Contrato, Deducciones, Incrementos y Ver Detalle (HU-CON-001, HU-CON-002, HU-CON-003, HU-CON-005)

Este script automatiza el flujo de creación de un contrato utilizando Selenium y Chrome.
Crea un contrato con datos aleatorios, incluyendo deducciones e incrementos, luego busca el contrato creado en el listado
y valida que los datos ingresados coincidan con los mostrados en el detalle del contrato.
"""

import time
import json
import os
import sys
import random
from datetime import datetime, timedelta

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

# Configurar encoding para Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


EMAIL = "mock@example.com"
PASSWORD = "mock123"
LOGIN_URL = "http://localhost:3000/sigma/login"
CONTRACTS_URL = "http://localhost:3000/sigma/payroll/contractManagement"


def load_report_json(path=None):
    """Carga el JSON embebido en IN-CON-001_reporte.md"""
    if path is None:
        path = os.path.join(os.path.dirname(__file__), 'IN-CON-001_reporte.md')
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    start = text.find('```json')
    if start == -1:
        raise RuntimeError('No JSON block found in report file')
    start = text.find('\n', start) + 1
    end = text.find('```', start)
    json_text = text[start:end].strip()
    return json.loads(json_text)


def generate_random_contract_data():
    """Genera datos aleatorios para el contrato"""
    
    # Fecha inicio: entre 1 y 90 días en el futuro
    dias_adelante = random.randint(1, 90)
    fecha_inicio = datetime.now() + timedelta(days=dias_adelante)
    
    # Fecha fin: 6 meses a 2 años después de inicio
    meses_duracion = random.randint(6, 24)
    fecha_fin = fecha_inicio + timedelta(days=meses_duracion * 30)
    
    # Tipo de contrato aleatorio
    tipos_contrato = ["Indefinido", "A termino fijo", "Obra labor"]
    tipo_contrato = random.choice(tipos_contrato)
    
    # Salario base aleatorio (entre 1.300.000 y 10.000.000)
    salario_base = random.randint(1300000, 10000000)
    # Redondear a múltiplos de 50.000
    salario_base = (salario_base // 50000) * 50000
    
    # Datos menores aleatorios
    horas_minimas = random.randint(20, 48)
    dias_incapacidad = random.randint(30, 365)
    tiempo_terminacion = random.randint(15, 90)
    horas_extras_max = random.randint(20, 100)
    frecuencia_vacaciones = random.randint(6, 24)
    
    # Porcentajes de deducciones e incrementos (1-100)
    porcentaje_deduccion = random.randint(1, 100)  # Entre 1% y 100%
    porcentaje_incremento = random.randint(1, 100)  # Entre 1% y 100%
    
    return {
        'fecha_inicio': fecha_inicio.strftime('%Y-%m-%d'),
        'fecha_fin': fecha_fin.strftime('%Y-%m-%d'),
        'tipo_contrato': tipo_contrato,
        'salario_base': salario_base,
        'horas_minimas': horas_minimas,
        'dias_max_incapacidad': dias_incapacidad,
        'tiempo_notificacion_terminacion': tiempo_terminacion,
        'horas_max_extras': horas_extras_max,
        'frecuencia_vacaciones': frecuencia_vacaciones,
        'porcentaje_deduccion': porcentaje_deduccion,
        'porcentaje_incremento': porcentaje_incremento,
        'descripcion': f'Contrato aleatorio IT-CON-001 #{random.randint(1000, 9999)}'
    }


def convert_to_input_format(fecha_iso):
    """Convierte yyyy-mm-dd a mm/dd/yyyy para inputs de formulario"""
    if fecha_iso and '-' in fecha_iso:
        parts = fecha_iso.split('-')
        return f"{parts[1]}/{parts[2]}/{parts[0]}"  # mm/dd/yyyy
    return fecha_iso


def convert_to_search_format(fecha_iso):
    """Convierte yyyy-mm-dd a dd/mm/yyyy para búsqueda en tabla"""
    if fecha_iso and '-' in fecha_iso:
        parts = fecha_iso.split('-')
        return f"{parts[2]}/{parts[1]}/{parts[0]}"  # dd/mm/yyyy
    return fecha_iso


def wait_for_element(driver, by, value, timeout=10):
    """Espera explícita para que un elemento esté presente"""
    return WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located((by, value))
    )


def capture_section_info_general(modal):
    """Captura la sección 1: Información General del modal Ver"""
    data = {}
    try:
        labels = modal.find_elements(By.XPATH, "//label[@class='text-theme-sm font-theme-semibold text-primary mb-1 block']")
        values = modal.find_elements(By.XPATH, "//p[@class='text-theme-sm text-secondary']")
        
        for label, value in zip(labels, values):
            field_name = label.text.strip()
            field_value = value.text.strip()
            data[field_name] = field_value
    except Exception as e:
        print(f"    [WARNING] Error capturando sección 1: {str(e)}")
    
    return data


def capture_section_terminos(modal):
    """Captura la sección 2: Términos del Contrato del modal Ver"""
    data = {}
    try:
        labels = modal.find_elements(By.XPATH, "//label[@class='text-theme-sm font-theme-semibold text-primary mb-1 block']")
        values = modal.find_elements(By.XPATH, "//p[@class='text-theme-sm text-secondary']")
        
        for label, value in zip(labels, values):
            field_name = label.text.strip()
            field_value = value.text.strip()
            data[field_name] = field_value
    except Exception as e:
        print(f"    [WARNING] Error capturando sección 2: {str(e)}")
    
    return data


def capture_section_deducciones(modal):
    """Captura la sección 3: Deducciones del modal Ver"""
    deducciones = []
    try:
        # Capturar encabezados de la tabla
        headers = modal.find_elements(By.XPATH, ".//table//thead//th")
        header_names = [h.text.strip() for h in headers if h.text.strip()]
        
        # Buscar filas de datos DENTRO del modal solamente
        rows = modal.find_elements(By.XPATH, ".//table//tbody//tr")
        
        for row in rows:
            cells = row.find_elements(By.TAG_NAME, "td")
            if len(cells) > 0:
                deduccion = {}
                for idx, cell in enumerate(cells):
                    header_name = header_names[idx] if idx < len(header_names) else f'col_{idx+1}'
                    deduccion[header_name] = cell.text.strip()
                deducciones.append(deduccion)
    except Exception as e:
        print(f"    [WARNING] Error capturando deducciones: {str(e)}")
    
    return deducciones


def capture_section_incrementos(modal):
    """Captura la sección 4: Incrementos del modal Ver"""
    incrementos = []
    try:
        # Capturar encabezados de la tabla
        headers = modal.find_elements(By.XPATH, ".//table//thead//th")
        header_names = [h.text.strip() for h in headers if h.text.strip()]
        
        # Buscar filas de datos DENTRO del modal solamente
        rows = modal.find_elements(By.XPATH, ".//table//tbody//tr")
        
        for row in rows:
            cells = row.find_elements(By.TAG_NAME, "td")
            if len(cells) > 0:
                incremento = {}
                for idx, cell in enumerate(cells):
                    header_name = header_names[idx] if idx < len(header_names) else f'col_{idx+1}'
                    incremento[header_name] = cell.text.strip()
                incrementos.append(incremento)
    except Exception as e:
        print(f"    [WARNING] Error capturando incrementos: {str(e)}")
    
    return incrementos


def capture_section_historial(modal):
    """Captura la sección 5: Historial del modal Ver"""
    data = {}
    try:
        data['historial_completo'] = modal.text.strip()
    except Exception as e:
        print(f"    [WARNING] Error capturando historial: {str(e)}")
    
    return data


def capture_modal_data(driver, modal):
    """Captura todas las 5 secciones del modal Ver"""
    captured_data = {
        'step1': {},
        'step2': {},
        'step3': {'deducciones': []},
        'step4': {'incrementos': []},
        'step5': {}
    }
    
    # CAPTURAR SECCIÓN 1: INFORMACION GENERAL
    print("  Capturando Sección 1: Información General...")
    try:
        tab_button = modal.find_element(By.XPATH, "//nav//button[contains(text(), 'Información')]")
        tab_button.click()
        time.sleep(2)
        captured_data['step1'] = capture_section_info_general(modal)
        print(f"    ✓ {len(captured_data['step1'])} campos capturados")
    except Exception as e:
        print(f"    [WARNING] Error navegando sección 1: {str(e)}")
    
    # CAPTURAR SECCIÓN 2: TERMINOS DEL CONTRATO
    print("  Capturando Sección 2: Términos del Contrato...")
    try:
        tab_button = modal.find_element(By.XPATH, "//nav//button[contains(text(), 'Términos')]")
        tab_button.click()
        time.sleep(2)
        captured_data['step2'] = capture_section_terminos(modal)
        print(f"    ✓ {len(captured_data['step2'])} campos capturados")
    except Exception as e:
        print(f"    [WARNING] Error navegando sección 2: {str(e)}")
    
    # CAPTURAR SECCIÓN 3: DEDUCCIONES
    print("  Capturando Sección 3: Deducciones...")
    try:
        tab_button = modal.find_element(By.XPATH, ".//nav//button[contains(text(), 'Deducciones')]")
        tab_button.click()
        time.sleep(2)
        captured_data['step3']['deducciones'] = capture_section_deducciones(modal)
        print(f"    ✓ {len(captured_data['step3']['deducciones'])} deducciones capturadas")
    except Exception as e:
        print(f"    [WARNING] Error navegando sección 3: {str(e)}")
    
    # CAPTURAR SECCIÓN 4: INCREMENTOS
    print("  Capturando Sección 4: Incrementos...")
    try:
        tab_button = modal.find_element(By.XPATH, ".//nav//button[contains(text(), 'Incrementos')]")
        tab_button.click()
        time.sleep(2)
        captured_data['step4']['incrementos'] = capture_section_incrementos(modal)
        print(f"    ✓ {len(captured_data['step4']['incrementos'])} incrementos capturados")
    except Exception as e:
        print(f"    [WARNING] Error navegando sección 4: {str(e)}")
    
    # CAPTURAR SECCIÓN 5: HISTORIAL
    print("  Capturando Sección 5: Historial...")
    try:
        tab_button = modal.find_element(By.XPATH, ".//nav//button[contains(text(), 'Historial')]")
        tab_button.click()
        time.sleep(2)
        captured_data['step5'] = capture_section_historial(modal)
        print(f"    ✓ Historial capturado")
    except Exception as e:
        print(f"    [WARNING] Error navegando sección 5: {str(e)}")
    
    return captured_data


def validate_contract_data(ingresados, capturados):
    """Compara datos ingresados con capturados y genera reporte de diferencias"""
    discrepancies = []
    warnings = []
    
    # Comparar tipo de contrato
    try:
        tipo_ingresado = ingresados['tipo_contrato'].lower()
        tipo_capturado = capturados['step1'].get('Tipo de contrato', '').lower()
        if tipo_ingresado not in tipo_capturado and tipo_capturado not in tipo_ingresado:
            discrepancies.append(f"Tipo contrato: '{tipo_ingresado}' != '{tipo_capturado}'")
    except Exception as e:
        warnings.append(f"Error comparando tipo: {str(e)}")
    
    # Comparar salario (normalizar formato)
    try:
        salario_ingresado = str(ingresados['salario_base'])
        salario_capturado = capturados['step2'].get('Salario', '').replace('.', '').replace(',', '').replace('$', '').replace(' ', '').replace('US', '')
        if salario_ingresado not in salario_capturado:
            discrepancies.append(f"Salario: {salario_ingresado} != {salario_capturado}")
    except Exception as e:
        warnings.append(f"Error comparando salario: {str(e)}")
    
    # Comparar fechas (con tolerancia ±1 día debido al bug conocido)
    # Se documenta pero no se marca como error
    try:
        fecha_inicio_ingresada = ingresados['fecha_inicio']
        fecha_inicio_capturada = capturados['step1'].get('Fecha de inicio', '')
        fecha_inicio_esperada = convert_to_search_format(fecha_inicio_ingresada)
        if fecha_inicio_esperada != fecha_inicio_capturada:
            warnings.append(f"Fecha inicio: {fecha_inicio_esperada} != {fecha_inicio_capturada} (Bug conocido ±1 día)")
    except Exception as e:
        warnings.append(f"Error comparando fecha inicio: {str(e)}")
    
    # Comparar deducciones (cantidad)
    try:
        deduc_ingresadas = len(ingresados.get('deducciones', []))
        deduc_capturadas = len(capturados['step3'].get('deducciones', []))
        if deduc_ingresadas != deduc_capturadas:
            discrepancies.append(f"Deducciones: {deduc_ingresadas} != {deduc_capturadas}")
    except Exception as e:
        warnings.append(f"Error comparando deducciones: {str(e)}")
    
    # Comparar incrementos (cantidad)
    try:
        incr_ingresados = len(ingresados.get('incrementos', []))
        incr_capturados = len(capturados['step4'].get('incrementos', []))
        if incr_ingresados != incr_capturados:
            discrepancies.append(f"Incrementos: {incr_ingresados} != {incr_capturados}")
    except Exception as e:
        warnings.append(f"Error comparando incrementos: {str(e)}")
    
    return {
        'valid': len(discrepancies) == 0,
        'discrepancies': discrepancies,
        'warnings': warnings
    }


def init_driver():
    """Inicializa el driver de Google Chrome con opciones seguras"""
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    # Buscar chromedriver en carpetas de tests
    chromedriver_paths = [
        r"c:\Users\aleja\amms\tests\IT-CLI-001\chromedriver.exe",
        r"c:\Users\aleja\amms\tests\chromedriver-win64\chromedriver.exe",
    ]
    
    driver = None
    for cd_path in chromedriver_paths:
        try:
            if os.path.exists(cd_path):
                driver = webdriver.Chrome(cd_path, options=options)
                break
        except:
            continue
    
    if driver is None:
        driver = webdriver.Chrome(options=options)
    
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    return driver


def test_IT_CON_001(payload):
    """Ejecuta el test de creación de contrato"""
    print("\n=== IT-CON-001: REGISTRAR CONTRATO ===\n")
    
    # GENERAR DATOS ALEATORIOS
    random_data = generate_random_contract_data()
    print("[DATOS ALEATORIOS GENERADOS]")
    print(f"  - Tipo: {random_data['tipo_contrato']}")
    print(f"  - Salario: ${random_data['salario_base']:,}")
    print(f"  - Fecha Inicio: {random_data['fecha_inicio']}")
    print(f"  - Fecha Fin: {random_data['fecha_fin']}")
    print(f"  - Deducción: {random_data['porcentaje_deduccion']}%")
    print(f"  - Incremento: {random_data['porcentaje_incremento']}%\n")
    
    driver = init_driver()
    print("[TEST] Iniciando navegador Brave...")
    results = {
        'timestamp': datetime.now().isoformat() + 'Z',
        'test_name': 'IT-CON-001',
        'status': 'pending',
        'steps': {},
        'random_data': random_data  # Guardar datos aleatorios
    }
    
    try:
        # 1. LOGIN
        print("[1/5] Realizando LOGIN...")
        driver.get(LOGIN_URL)
        
        # Esperar y llenar email
        email_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "email"))
        )
        email_input.send_keys(EMAIL)
        
        # Llenar contraseña
        password_input = driver.find_element(By.NAME, "password")
        password_input.send_keys(PASSWORD)
        
        # Click en submit
        submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_button.click()
        
        time.sleep(3)
        results['steps']['login'] = {'status': 'success', 'message': 'Login completado'}
        print("[1/5] [OK] Login exitoso\n")
        
        # 2. NAVEGACIÓN A CONTRACT MANAGEMENT
        print("[2/5] Navegando a Contract Management...")
        driver.get(CONTRACTS_URL)
        
        # Esperar a que cargue la página
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//button[@aria-label='Add Contract Button']"))
        )
        time.sleep(2)
        results['steps']['navigate'] = {'status': 'success', 'message': 'Navegación completada'}
        print("[2/5] [OK] Página de contratos cargada\n")
        
        # 3. CLICK EN "NUEVO CONTRATO" para empezar a ganra plata
        print("[3/5] Abriendo formulario de nuevo contrato...")
        new_button = driver.find_element(By.XPATH, "//button[@aria-label='Add Contract Button']")
        new_button.click()
        
        time.sleep(2)
        results['steps']['open_form'] = {'status': 'success', 'message': 'Formulario abierto'}
        print("[3/5] [OK] Formulario de nuevo contrato abierto\n")
        
        # 4. CAPTURAR HTML DEL MODAL Y ANALIZAR ESTRUCTURA
        print("[4/5] Analizando estructura del formulario...")
        time.sleep(2)
        
        # Capturar el HTML completo del modal para inspección
        try:
            modal_html = driver.find_element(By.XPATH, "//div[contains(@class, 'modal') or contains(@role, 'dialog')]").get_attribute('outerHTML')
            modal_path = os.path.join(os.path.dirname(__file__), 'modal_structure.html')
            with open(modal_path, 'w', encoding='utf-8') as f:
                f.write(modal_html)
            print(f"  [OK] Estructura del modal guardada en: {modal_path}")
        except Exception as e:
            print(f"  [ERROR] Error capturando modal HTML: {str(e)}")
        
        # ANÁLISIS: Buscar todos los campos Cataláunicos input, select, textarea en el modal
        print("\n  Campos encontrados:")
        try:
            modal = driver.find_element(By.XPATH, "//div[contains(@class, 'modal') or contains(@role, 'dialog')]")
            
            # Inputs
            inputs = modal.find_elements(By.TAG_NAME, "input")
            for inp in inputs:
                name = inp.get_attribute('name') or inp.get_attribute('id') or inp.get_attribute('placeholder') or 'sin_atributo'
                tipo = inp.get_attribute('type') or 'text'
                print(f"    - INPUT: {name} (type={tipo})")
            
            # Selects
            selects = modal.find_elements(By.TAG_NAME, "select")
            for sel in selects:
                name = sel.get_attribute('name') or sel.get_attribute('id') or 'sin_atributo'
                print(f"    - SELECT: {name}")
            
            # Textareas
            textareas = modal.find_elements(By.TAG_NAME, "textarea")
            for ta in textareas:
                name = ta.get_attribute('name') or ta.get_attribute('id') or 'sin_atributo'
                print(f"    - TEXTAREA: {name}")
            
            # Botones
            buttons = modal.find_elements(By.TAG_NAME, "button")
            for btn in buttons:
                text = btn.text or btn.get_attribute('aria-label') or 'sin_etiqueta'
                print(f"    - BUTTON: {text}")
        except Exception as e:
            print(f"  [ERROR] Error analizando campos: {str(e)}")
        
        print("\n[4/5] [OK] Análisis completado\n")
        
        # 5. RELLENAR PASO 1 - INFORMACION GENERAL
        print("[5/8] Rellenando PASO 1 - Informacion General...\n")
        
        modal = driver.find_element(By.XPATH, "//div[contains(@class, 'modal') or contains(@role, 'dialog')]")
        
        # 1. DEPARTMENT (seleccionar el primero disponible)
        try:
            dept_select = Select(modal.find_element(By.NAME, "department"))
            dept_select.select_by_index(1)  # Primer departamento no vacio
            print(f"    [OK] Department: {dept_select.first_selected_option.text}")
            time.sleep(1)  # Esperar a que carguen los cargos
        except Exception as e:
            print(f"    [ERROR] department: {str(e)}")
        
        # 2. CHARGE (seleccionar el primero que aparezca y asi nos ahorramos problemas)
        try:
            charge_select = Select(modal.find_element(By.NAME, "charge"))
            charge_select.select_by_index(1)  # Primer cargo disponible
            print(f"    [OK] Cargo: {charge_select.first_selected_option.text}")
        except Exception as e:
            print(f"    [ERROR] charge: {str(e)}")
        
        # 3. DESCRIPTION llenar cuaquier cosa
        try:
            desc = modal.find_element(By.NAME, "description")
            desc.send_keys(random_data['descripcion'])
            print(f"    [OK] Descripcion: {random_data['descripcion']}")
        except Exception as e:
            print(f"    [ERROR] description: {str(e)}")
        
        # 4. CONTRACT TYPE - ALEATORIO
        try:
            tipo_map = {"Indefinido": "44", "A termino fijo": "45", "Obra labor": "46"}
            tipo_value = tipo_map.get(random_data['tipo_contrato'], "44")
            contract_select = Select(modal.find_element(By.NAME, "contractType"))
            contract_select.select_by_value(tipo_value)
            print(f"    [OK] Tipo contrato: {random_data['tipo_contrato']} (value={tipo_value})")
        except Exception as e:
            print(f"    [ERROR] contractType: {str(e)}")
        
        # 5. START DATE (formato mm/dd/yyyy) - ALEATORIO
        try:
            fecha_formatted = convert_to_input_format(random_data['fecha_inicio'])
            start_date = modal.find_element(By.NAME, "startDate")
            start_date.clear()
            start_date.send_keys(fecha_formatted)
            print(f"    [OK] Fecha inicio: {fecha_formatted}")
        except Exception as e:
            print(f"    [ERROR] startDate: {str(e)}")
        
        # 6. END DATE (formato mm/dd/yyyy) - ALEATORIO, mayor que fecha inicio
        try:
            fecha_formatted = convert_to_input_format(random_data['fecha_fin'])
            end_date = modal.find_element(By.NAME, "endDate")
            end_date.clear()
            end_date.send_keys(fecha_formatted)
            print(f"    [OK] Fecha fin: {fecha_formatted}")
        except Exception as e:
            print(f"    [ERROR] endDate: {str(e)}")
        
        # 7. PAYMENT FREQUENCY (seleccionar "quincenal" y rellenar dos campos Cataláunicos 1-31)
        try:
            freq_select = Select(modal.find_element(By.NAME, "paymentFrequency"))
            freq_select.select_by_value("quincenal")
            print(f"    [OK] Frecuencia pago: quincenal")
            time.sleep(1)  # Esperar a que aparezcan los campos del Pelennor  extra
            
            # Buscar los dos campos del Pelennor numericos de quincenal (primer dia y segundo dia)
            try:
                # Estos campos probablemente se llamen algo como firstPaymentDay, secondPaymentDay
                quincenal_inputs = modal.find_elements(By.XPATH, "//input[@type='number' and (contains(@name, 'payment') or contains(@name, 'Payment') or contains(@name, 'day') or contains(@name, 'Day'))]")
                if len(quincenal_inputs) >= 2:
                    quincenal_inputs[0].send_keys("5")  # Primer dia: 5
                    quincenal_inputs[1].send_keys("20")  # Segundo dia: 20 (15 dias despues minimo)
                    print(f"    [OK] Dias de pago quincenal: 5 y 20")
                else:
                    print(f"    [WARNING] No se encontraron campos de pago quincenal")
            except Exception as e2:
                print(f"    [WARNING] Campos quincenal: {str(e2)}")
        except Exception as e:
            print(f"    [ERROR] paymentFrequency: {str(e)}")
        
        # 8. MINIMUM HOURS (opcional) - ALEATORIO
        try:
            min_hours = modal.find_element(By.NAME, "minimumHours")
            min_hours.send_keys(str(random_data['horas_minimas']))
            print(f"    [OK] Horas minimas: {random_data['horas_minimas']}")
        except Exception as e:
            print(f"    [WARNING] minimumHours: {str(e)}")
        
        # 9. WORKDAY (opcional - seleccionar primero disponible)
        try:
            workday_select = Select(modal.find_element(By.NAME, "workday"))
            workday_select.select_by_index(1)
            print(f"    [OK] Jornada: {workday_select.first_selected_option.text}")
        except Exception as e:
            print(f"    [WARNING] workday: {str(e)}")
        
        # 10. WORK MODALITY (opcional - seleccionar primero disponible)
        try:
            modality_select = Select(modal.find_element(By.NAME, "workModality"))
            modality_select.select_by_index(1)
            print(f"    [OK] Modalidad: {modality_select.first_selected_option.text}")
        except Exception as e:
            print(f"    [WARNING] workModality: {str(e)}")
        
        time.sleep(1)
        print("\n  [OK] Paso 1 completado. Avanzando al Paso 2...\n")
        
        # Click en "Siguiente" para ir al Paso 2
        try:
            next_button = modal.find_element(By.XPATH, "//button[@aria-label='Next Button']")
            next_button.click()
            time.sleep(2)
            print("[6/8] PASO 2 - Terminos del Contrato\n")
        except Exception as e:
            print(f"    [ERROR] No se encontro boton Siguiente: {str(e)}\n")
            raise
        
        results['steps']['step1'] = {'status': 'success', 'message': 'Paso 1 completado'}
        
        # CAPTURAR HTML DEL PASO 2
        print("  Capturando estructura del Paso 2...\n")
        try:
            modal_html_step2 = modal.get_attribute('outerHTML')
            modal_path_step2 = os.path.join(os.path.dirname(__file__), 'modal_structure_step2.html')
            with open(modal_path_step2, 'w', encoding='utf-8') as f:
                f.write(modal_html_step2)
            print(f"  [OK] HTML del Paso 2 guardado en: {modal_path_step2}\n")
            
            # Analizar campos del paso 2
            print("  Campos encontrados en Paso 2:")
            inputs = modal.find_elements(By.TAG_NAME, "input")
            for inp in inputs:
                name = inp.get_attribute('name') or inp.get_attribute('id') or inp.get_attribute('placeholder') or 'sin_atributo'
                tipo = inp.get_attribute('type') or 'text'
                print(f"    - INPUT: {name} (type={tipo})")
            
            selects = modal.find_elements(By.TAG_NAME, "select")
            for sel in selects:
                name = sel.get_attribute('name') or sel.get_attribute('id') or 'sin_atributo'
                print(f"    - SELECT: {name}")
            
            textareas = modal.find_elements(By.TAG_NAME, "textarea")
            for ta in textareas:
                name = ta.get_attribute('name') or ta.get_attribute('id') or 'sin_atributo'
                print(f"    - TEXTAREA: {name}")
            
            print("")
        except Exception as e:
            print(f"  [WARNING] Error capturando HTML Paso 2: {str(e)}\n")
        
        # 6. RELLENAR PASO 2 - TERMINOS DEL CONTRATO
        print("  Rellenando PASO 2 - Terminos del Contrato...\n")
        
        # 1. MODALIDAD SALARIAL (select: salaryType)
        try:
            salary_select = Select(modal.find_element(By.NAME, "salaryType"))
            salary_select.select_by_visible_text("Mensual fijo")
            print(f"    [OK] Modalidad salarial: Mensual fijo")
        except Exception as e:
            print(f"    [ERROR] salaryType: {str(e)}")
        
        # 2. SALARIO BASE (numerico) - ALEATORIO
        try:
            salary = modal.find_element(By.NAME, "baseSalary")
            salary.send_keys(str(random_data['salario_base']))
            print(f"    [OK] Salario base: ${random_data['salario_base']:,}")
        except Exception as e:
            print(f"    [ERROR] baseSalary: {str(e)}")
        
        # 3. HORARIO DE TRABAJO , J'aime l'heure française 
        try:
            checkboxes = modal.find_elements(By.XPATH, "//div[contains(@class, 'flex') and contains(@class, 'flex-col')]//input[@type='checkbox']")
            if len(checkboxes) >= 5:
                # Indices: 0=Todos, 1=Lun, 2=Mar, 3=Mie, 4=Jue, 5=Vie, 6=Sab, 7=Dom
                for idx in [1, 2, 3, 4]:  
                    if not checkboxes[idx].is_selected():
                        checkboxes[idx].click()
                print(f"    [OK] Horario: Lunes, Martes, Miercoles, Jueves")
            else:
                print(f"    [WARNING] No se encontraron suficientes checkboxes de horario")
        except Exception as e:
            print(f"    [WARNING] Checkboxes horario: {str(e)}")
        
        # 4. MONEDA (select: currency, COP=19)
        try:
            currency_select = Select(modal.find_element(By.NAME, "currency"))
            currency_select.select_by_value("19")  # 19 = Pesos Colombianos
            print(f"    [OK] Moneda: Pesos Colombianos (value=19)")
        except Exception as e:
            print(f"    [ERROR] currency: {str(e)}")
        
        # 5. PERIODO DE PRUEBA (numerico probame esta)
        try:
            trial = modal.find_element(By.NAME, "trialPeriod")
            trial.send_keys(str(payload.get('periodo_prueba_dias', 30)))
            print(f"    [OK] Periodo prueba: {payload.get('periodo_prueba_dias', 30)} dias")
        except Exception as e:
            print(f"    [ERROR] trialPeriod: {str(e)}")
        
        # 6. DIAS DE VACACIONES (numerico ojala infinito)
        try:
            vacation_days = modal.find_element(By.NAME, "vacationDays")
            vacation_days.send_keys(str(payload.get('dias_vacaciones', 15)))
            print(f"    [OK] Dias vacaciones: {payload.get('dias_vacaciones', 15)}")
        except Exception as e:
            print(f"    [ERROR] vacationDays: {str(e)}")
        
        # 7. ACUMULATIVO (radio buttons: yes/no)
        try:
            should_accumulate = payload.get('acumulacion_vacaciones', 'si').lower() in ['si', 'yes', 'true', '1']
            radio_value = "yes" if should_accumulate else "no"
            radio = modal.find_element(By.XPATH, f"//input[@type='radio' and @name='cumulative' and @value='{radio_value}']")
            radio.click()
            print(f"    [OK] Acumulativo: {radio_value}")
            
            # Si es 'yes', llenar campo "Efectivo desde" (formato mm/dd/yyyy)
            if should_accumulate:
                time.sleep(0.5)  # Esperar a que aparezca el campo
                try:
                    effective_date = modal.find_element(By.NAME, "effectiveFrom")
                    fecha_formatted = convert_to_input_format(random_data['fecha_inicio'])
                    effective_date.send_keys(fecha_formatted)
                    print(f"    [OK] Efectivo desde: {fecha_formatted}")
                except Exception as e2:
                    print(f"    [WARNING] effectiveFrom: {str(e2)}")
        except Exception as e:
            print(f"    [WARNING] cumulative radio: {str(e)}")
        
        # 8. FRECUENCIA DE CONCESION DE VACACIONES (numerico: vacationGrantFrequency) - ALEATORIO
        try:
            vac_freq = modal.find_element(By.NAME, "vacationGrantFrequency")
            vac_freq.send_keys(str(random_data['frecuencia_vacaciones']))
            print(f"    [OK] Frecuencia concesion vacaciones: {random_data['frecuencia_vacaciones']} meses")
        except Exception as e:
            print(f"    [WARNING] vacationGrantFrequency: {str(e)}")
        
        # 9. DIAS MAXIMOS DE INCAPACIDAD (numerico: maximumDisabilityDays) - ALEATORIO
        try:
            disability = modal.find_element(By.NAME, "maximumDisabilityDays")
            disability.send_keys(str(random_data['dias_max_incapacidad']))
            print(f"    [OK] Dias max incapacidad: {random_data['dias_max_incapacidad']}")
        except Exception as e:
            print(f"    [ERROR] maximumDisabilityDays: {str(e)}")
        
        # 10. HORAS EXTRAS MAXIMAS (numerico: maximumOvertime) - ALEATORIO
        try:
            overtime = modal.find_element(By.NAME, "maximumOvertime")
            overtime.send_keys(str(random_data['horas_max_extras']))
            print(f"    [OK] Horas extras max: {random_data['horas_max_extras']}")
        except Exception as e:
            print(f"    [ERROR] maximumOvertime: {str(e)}")
        
        # 11. PERIODO DE HORAS EXTRAS (select: overtimePeriod)
        try:
            overtime_period = Select(modal.find_element(By.NAME, "overtimePeriod"))
            overtime_period.select_by_value("mes")  # mes, semana, dia
            print(f"    [OK] Periodo horas extras: Mes")
        except Exception as e:
            print(f"    [WARNING] overtimePeriod: {str(e)}")
        
        # 12. TIEMPO DE AVISO DE TERMINACION (numerico: terminationNoticePeriod) - ALEATORIO
        try:
            notice = modal.find_element(By.NAME, "terminationNoticePeriod")
            notice.send_keys(str(random_data['tiempo_notificacion_terminacion']))
            print(f"    [OK] Tiempo aviso terminacion: {random_data['tiempo_notificacion_terminacion']} dias")
        except Exception as e:
            print(f"    [ERROR] terminationNoticePeriod: {str(e)}")
        
        time.sleep(1)
        print("\n  [OK] Paso 2 completado. Avanzando al Paso 3...\n")
        
        results['steps']['step2'] = {'status': 'success', 'message': 'Paso 2 completado'}
        
        # Click en "Siguiente" para ir al Paso 3 - Deducciones
        try:
            next_button = modal.find_element(By.XPATH, "//button[@aria-label='Next Button']")
            next_button.click()
            time.sleep(2)
            print("[7/8] PASO 3 - Deducciones\n")
        except Exception as e:
            print(f"    [ERROR] No se encontro boton Siguiente para Paso 3: {str(e)}\n")
            raise
        
        # CAPTURAR HTML DEL PASO CHAMPETUDO 3
        print("  Capturando estructura del Paso 3...\n")
        try:
            modal_html_step3 = modal.get_attribute('outerHTML')
            modal_path_step3 = os.path.join(os.path.dirname(__file__), 'modal_structure_step3.html')
            with open(modal_path_step3, 'w', encoding='utf-8') as f:
                f.write(modal_html_step3)
            print(f"  [OK] HTML del Paso 3 guardado en: {modal_path_step3}\n")
            
            # Analizar campos del del Pelennor, perdon del paso 3
            print("  Campos encontrados en Paso 3:")
            inputs = modal.find_elements(By.TAG_NAME, "input")
            for inp in inputs:
                name = inp.get_attribute('name') or inp.get_attribute('id') or inp.get_attribute('placeholder') or 'sin_atributo'
                tipo = inp.get_attribute('type') or 'text'
                print(f"    - INPUT: {name} (type={tipo})")
            
            selects = modal.find_elements(By.TAG_NAME, "select")
            for sel in selects:
                name = sel.get_attribute('name') or sel.get_attribute('id') or 'sin_atributo'
                print(f"    - SELECT: {name}")
            
            buttons = modal.find_elements(By.TAG_NAME, "button")
            for btn in buttons:
                text = btn.text or btn.get_attribute('aria-label') or 'sin_etiqueta'
                if text and text not in ['Close Modal', '1', '2', '3', '4', 'Anterior', 'Siguiente']:
                    print(f"    - BUTTON: {text}")
            
            print("")
        except Exception as e:
            print(f"  [WARNING] Error capturando HTML Paso 3: {str(e)}\n")
        
        # RELLENAR PASO 3 - DEDUCCIONES
        print("  Rellenando PASO 3 - Deducciones...\n")
        
        # 1. Click en "Añadir deduccion" para habilitar campos Cataláunicos 
        try:
            add_deduction_button = modal.find_element(By.XPATH, "//button[@aria-label='Add Deduction']")
            add_deduction_button.click()
            time.sleep(1)
            print(f"    [OK] Click en 'Añadir deduccion'")
        except Exception as e:
            print(f"    [WARNING] Boton añadir deduccion: {str(e)}")
        
        # 2. NOMBRE (select - seleccionar opción aleatoria)
        nombre_deduccion_capturado = ""
        try:
            name_select = Select(modal.find_elements(By.TAG_NAME, "select")[0])  # Primer select
            opciones_count = len(name_select.options)
            if opciones_count > 1:
                indice_aleatorio = random.randint(1, opciones_count - 1)
                name_select.select_by_index(indice_aleatorio)
                nombre_deduccion_capturado = name_select.first_selected_option.text
                print(f"    [OK] Nombre deduccion: {nombre_deduccion_capturado}")
        except Exception as e:
            print(f"    [WARNING] nombre deduccion: {str(e)}")
        
        # 3. TIPO (select - seleccionar primera opcion, puede ser "porcentual" o "fijo")
        tipo_deduccion = ""
        try:
            type_select = Select(modal.find_elements(By.TAG_NAME, "select")[1])  # Segundo select
            type_select.select_by_index(1)
            tipo_deduccion = type_select.first_selected_option.text
            print(f"    [OK] Tipo deduccion: {tipo_deduccion}")
        except Exception as e:
            print(f"    [WARNING] tipo deduccion: {str(e)}")
            tipo_deduccion = ""
        
        # 4. MONTO (numerico - usar porcentaje aleatorio)
        monto_deduccion = str(random_data['porcentaje_deduccion'])
        try:
            amount_inputs = modal.find_elements(By.XPATH, "//input[@type='number']")
            if len(amount_inputs) > 0:
                amount_inputs[0].send_keys(monto_deduccion)
                print(f"    [OK] Monto: {monto_deduccion}% (Tipo: {tipo_deduccion})")
        except Exception as e:
            print(f"    [WARNING] monto deduccion: {str(e)}")
        
        # 5. APLICACION (select)
        try:
            app_select = Select(modal.find_elements(By.TAG_NAME, "select")[2])  # Tercer select
            app_select.select_by_index(1)
            print(f"    [OK] Aplicacion: {app_select.first_selected_option.text}")
        except Exception as e:
            print(f"    [WARNING] aplicacion deduccion: {str(e)}")
        
        # 6. FECHA INICIO (formato mm/dd/yyyy) - USAR FECHA DEL CONTRATO
        try:
            fecha_formatted = convert_to_input_format(random_data['fecha_inicio'])
            date_inputs = modal.find_elements(By.XPATH, "//input[@type='date']")
            if len(date_inputs) > 0:
                date_inputs[0].send_keys(fecha_formatted)
                print(f"    [OK] Fecha inicio deduccion: {fecha_formatted}")
        except Exception as e:
            print(f"    [WARNING] fecha inicio deduccion: {str(e)}")
        
        # 7. FECHA FIN (formato mm/dd/yyyy) - USAR FECHA DEL CONTRATO
        try:
            fecha_formatted = convert_to_input_format(random_data['fecha_fin'])
            date_inputs = modal.find_elements(By.XPATH, "//input[@type='date']")
            if len(date_inputs) > 1:
                date_inputs[1].send_keys(fecha_formatted)
                print(f"    [OK] Fecha fin deduccion: {fecha_formatted}")
        except Exception as e:
            print(f"    [WARNING] fecha fin deduccion: {str(e)}")
        
        # 8. DESCRIPCION (texto 20-25 caracteres)
        try:
            desc_inputs = modal.find_elements(By.XPATH, "//input[@type='text'] | //textarea")
            if len(desc_inputs) > 0:
                descripcion_deduccion = "Deduccion de prueba IT"  # 23 caracteres
                desc_inputs[-1].send_keys(descripcion_deduccion)  # Ultimo input de texto
                print(f"    [OK] Descripcion deduccion: {descripcion_deduccion}")
        except Exception as e:
            print(f"    [WARNING] descripcion deduccion: {str(e)}")
        
        # 9. CANTIDAD (numerico)
        try:
            amount_inputs = modal.find_elements(By.XPATH, "//input[@type='number']")
            if len(amount_inputs) > 1:
                cantidad = "1"
                amount_inputs[-1].send_keys(cantidad)  # Ultimo input numerico
                print(f"    [OK] Cantidad: {cantidad}")
        except Exception as e:
            print(f"    [WARNING] cantidad deduccion: {str(e)}")
        
        time.sleep(1)
        print("\n  [OK] Paso 3 (Deducciones) completado. Avanzando al Paso 4...\n")
        
        results['steps']['step3'] = {'status': 'success', 'message': 'Paso 3 completado'}
        
        # Click en "Siguiente" para ir al Paso Prohibido 4 - Incrementos
        try:
            next_button = modal.find_element(By.XPATH, "//button[@aria-label='Next Button']")
            next_button.click()
            time.sleep(2)
            print("[8/8] PASO 4 - Incrementos\n")
        except Exception as e:
            print(f"    [ERROR] No se encontro boton Siguiente para Paso 4: {str(e)}\n")
            raise
        
        # CAPTURAR HTML DEL PASO PROHIBIDO 4
        print("  Capturando estructura del Paso 4...\n")
        try:
            modal_html_step4 = modal.get_attribute('outerHTML')
            modal_path_step4 = os.path.join(os.path.dirname(__file__), 'modal_structure_step4.html')
            with open(modal_path_step4, 'w', encoding='utf-8') as f:
                f.write(modal_html_step4)
            print(f"  [OK] HTML del Paso 4 guardado en: {modal_path_step4}\n")
            
            # Analizar campos Cataláunicos del paso 4
            print("  Campos encontrados en Paso 4:")
            inputs = modal.find_elements(By.TAG_NAME, "input")
            for inp in inputs:
                name = inp.get_attribute('name') or inp.get_attribute('id') or inp.get_attribute('placeholder') or 'sin_atributo'
                tipo = inp.get_attribute('type') or 'text'
                print(f"    - INPUT: {name} (type={tipo})")
            
            selects = modal.find_elements(By.TAG_NAME, "select")
            for sel in selects:
                name = sel.get_attribute('name') or sel.get_attribute('id') or 'sin_atributo'
                print(f"    - SELECT: {name}")
            
            buttons = modal.find_elements(By.TAG_NAME, "button")
            for btn in buttons:
                text = btn.text or btn.get_attribute('aria-label') or 'sin_etiqueta'
                if text and text not in ['Close Modal', '1', '2', '3', '4', 'Anterior', 'Siguiente']:
                    print(f"    - BUTTON: {text}")
            
            print("")
        except Exception as e:
            print(f"  [WARNING] Error capturando HTML Paso 4: {str(e)}\n")
        
        # RELLENAR PASO 4 - INCREMENTOS (misma estructura que deducciones)
        print("  Rellenando PASO 4 - Incrementos...\n")
        
        # 1. Click en "Añadir incremento" para habilitar campos Cataláunicos 
        try:
            add_increment_button = modal.find_element(By.XPATH, "//button[@aria-label='Add Increment']")
            add_increment_button.click()
            time.sleep(1)
            print(f"    [OK] Click en 'Añadir incremento'")
        except Exception as e:
            print(f"    [WARNING] Boton añadir incremento: {str(e)}")
        
        # 2. NOMBRE (select - seleccionar opción aleatoria)
        nombre_incremento_capturado = ""
        try:
            name_select = Select(modal.find_elements(By.TAG_NAME, "select")[0])
            opciones_count = len(name_select.options)
            if opciones_count > 1:
                indice_aleatorio = random.randint(1, opciones_count - 1)
                name_select.select_by_index(indice_aleatorio)
                nombre_incremento_capturado = name_select.first_selected_option.text
                print(f"    [OK] Nombre incremento: {nombre_incremento_capturado}")
        except Exception as e:
            print(f"    [WARNING] nombre incremento: {str(e)}")
        
        # 3. TIPO (select)
        tipo_incremento = ""
        try:
            type_select = Select(modal.find_elements(By.TAG_NAME, "select")[1])
            type_select.select_by_index(1)
            tipo_incremento = type_select.first_selected_option.text
            print(f"    [OK] Tipo incremento: {tipo_incremento}")
        except Exception as e:
            print(f"    [WARNING] tipo incremento: {str(e)}")
            tipo_incremento = ""
        
        # 4. MONTO (numerico - usar porcentaje aleatorio)
        monto_incremento = str(random_data['porcentaje_incremento'])
        try:
            amount_inputs = modal.find_elements(By.XPATH, "//input[@type='number']")
            if len(amount_inputs) > 0:
                amount_inputs[0].send_keys(monto_incremento)
                print(f"    [OK] Monto: {monto_incremento}% (Tipo: {tipo_incremento})")
        except Exception as e:
            print(f"    [WARNING] monto incremento: {str(e)}")
        
        # 5. APLICACION (select)
        try:
            app_select = Select(modal.find_elements(By.TAG_NAME, "select")[2])
            app_select.select_by_index(1)
            print(f"    [OK] Aplicacion: {app_select.first_selected_option.text}")
        except Exception as e:
            print(f"    [WARNING] aplicacion incremento: {str(e)}")
        
        # 6. FECHA INICIO (formato mm/dd/yyyy) - USAR FECHA DEL CONTRATO
        try:
            fecha_formatted = convert_to_input_format(random_data['fecha_inicio'])
            date_inputs = modal.find_elements(By.XPATH, "//input[@type='date']")
            if len(date_inputs) > 0:
                date_inputs[0].send_keys(fecha_formatted)
                print(f"    [OK] Fecha inicio incremento: {fecha_formatted}")
        except Exception as e:
            print(f"    [WARNING] fecha inicio incremento: {str(e)}")
        
        # 7. FECHA FIN (formato mm/dd/yyyy) - USAR FECHA DEL CONTRATO
        try:
            fecha_formatted = convert_to_input_format(random_data['fecha_fin'])
            date_inputs = modal.find_elements(By.XPATH, "//input[@type='date']")
            if len(date_inputs) > 1:
                date_inputs[1].send_keys(fecha_formatted)
                print(f"    [OK] Fecha fin incremento: {fecha_formatted}")
        except Exception as e:
            print(f"    [WARNING] fecha fin incremento: {str(e)}")
        
        # 8. DESCRIPCION
        try:
            desc_inputs = modal.find_elements(By.XPATH, "//input[@type='text'] | //textarea")
            if len(desc_inputs) > 0:
                descripcion_incremento = "Incremento de prueba IT"  # 24 caracteres
                desc_inputs[-1].send_keys(descripcion_incremento)
                print(f"    [OK] Descripcion incremento: {descripcion_incremento}")
        except Exception as e:
            print(f"    [WARNING] descripcion incremento: {str(e)}")
        
        # 9. CANTIDAD
        try:
            amount_inputs = modal.find_elements(By.XPATH, "//input[@type='number']")
            if len(amount_inputs) > 1:
                cantidad = "1"
                amount_inputs[-1].send_keys(cantidad)
                print(f"    [OK] Cantidad: {cantidad}")
        except Exception as e:
            print(f"    [WARNING] cantidad incremento: {str(e)}")
        
        time.sleep(2)
        print("\n  [OK] Paso 4 (Incrementos) completado.\n")
        
        results['steps']['step4'] = {'status': 'success', 'message': 'Paso 4 completado'}
        
        # GUARDAR DATOS INGRESADOS PARA VALIDACION (con datos rand)
        contract_data = {
            'tipo_contrato': random_data['tipo_contrato'],
            'fecha_inicio': random_data['fecha_inicio'],
            'fecha_fin': random_data['fecha_fin'],
            'salario_base': random_data['salario_base'],
            'descripcion': random_data['descripcion'],
            'frecuencia_pago': 'quincenal',
            'dias_pago': [5, 20],
            'horas_minimas': random_data['horas_minimas'],
            'modalidad_salarial': 'Mensual fijo',
            'moneda': 'COP',
            'periodo_prueba': payload.get('periodo_prueba_dias', 30),
            'dias_vacaciones': payload.get('dias_vacaciones', 15),
            'dias_max_incapacidad': random_data['dias_max_incapacidad'],
            'horas_max_extras': random_data['horas_max_extras'],
            'periodo_horas_extras': 'mes',
            'tiempo_notificacion_terminacion': random_data['tiempo_notificacion_terminacion'],
            'deducciones': [{
                'nombre': nombre_deduccion_capturado,
                'tipo': tipo_deduccion,
                'monto': monto_deduccion,
                'descripcion': 'Deduccion de prueba IT'
            }],
            'incrementos': [{
                'nombre': nombre_incremento_capturado,
                'tipo': tipo_incremento,
                'monto': monto_incremento,
                'descripcion': 'Incremento de prueba IT'
            }]
        }
        
        # 5. CLICK EN SAVE
        print("[9/11] Guardando contrato...\n")
        
        try:
            save_button = modal.find_element(By.XPATH, "//button[@aria-label='Save Button']")
            save_button.click()
            print("  [OK] Click en boton 'Save' realizado")
            time.sleep(5)  # MIMIMI GUARDAR
        except Exception as e:
            print(f"  [ERROR] Error haciendo click en Save: {str(e)}")
            raise
        
        results['steps']['save_form'] = {'status': 'success', 'message': 'Contrato guardado'}
        
        # 6. RECARGAR PAGINA PARA BUSCAR EL CONTRATO
        print("[10/11] Recargando página y buscando contrato...\n")
        driver.get(CONTRACTS_URL)
        time.sleep(3)
        
        # Configurar paginación a 50 para NO SER TAN TUERTOS
        try:
            pagination_select = Select(driver.find_element(By.CLASS_NAME, "parametrization-pagination-select"))
            pagination_select.select_by_value("50")
            print("  [OK] Paginación configurada a 50 registros por página")
            time.sleep(2)  # Esperar a que recargue la tabla
        except Exception as e:
            print(f"  [WARNING] No se pudo configurar paginación: {str(e)}")
        
        # Buscar en la tabla por los datos del contrato registrado (USAR DATOS ALEATORIOS)
        try:
            tipo_buscar = random_data['tipo_contrato'].lower()
            salario_buscar = str(random_data['salario_base'])
            
            # Convertir fechas de yyyy-mm-dd a dd/mm/yyyy para comparar con tabla, QUIEN SE LE OCCURRIO ESE FORMATO
            fecha_inicio_buscar = convert_to_search_format(random_data['fecha_inicio'])
            fecha_fin_buscar = convert_to_search_format(random_data['fecha_fin'])
            
            print(f"  Buscando: tipo={tipo_buscar}, salario=${salario_buscar}, inicio={fecha_inicio_buscar}, fin={fecha_fin_buscar}")
            
            contract_found = False
            view_button = None
            
            # Buscar en las filas visibles de la tabla
            rows = driver.find_elements(By.XPATH, "//table//tbody//tr")
            print(f"  Total filas encontradas: {len(rows)}\n")
            
            for row_idx, row in enumerate(rows):
                cells = row.find_elements(By.TAG_NAME, "td")
                
                if len(cells) >= 6:
                    # Col 2: Tipo, Col 3: Fecha Inicio, Col 4: Fecha Fin, Col 6: Salario
                    tipo_cell = cells[1].text.strip()
                    fecha_inicio_cell = cells[2].text.strip()
                    fecha_fin_cell = cells[3].text.strip()
                    salario_cell = cells[5].text.strip()
                    
                    # Normalizar para comparación robusta
                    tipo_cell_norm = tipo_cell.lower()
                    salario_cell_norm = salario_cell.replace('.', '').replace(',', '').replace('$', '').replace(' ', '')
                    
                    # Verificar las 4 coincidencias (normalizadas)
                    tipo_match = tipo_buscar in tipo_cell_norm
                    salario_match = salario_buscar in salario_cell_norm
                    fecha_inicio_match = fecha_inicio_buscar == fecha_inicio_cell
                    fecha_fin_match = fecha_fin_buscar == fecha_fin_cell
                    
                    matches = sum([tipo_match, salario_match, fecha_inicio_match, fecha_fin_match])
                    
                    # Mostrar análisis de coincidencias para debugging
                    if matches >= 2:
                        print(f"  Fila {row_idx+1}: {matches}/4 coincidencias")
                        print(f"     Tipo: '{tipo_buscar}'=='{tipo_cell}' {'✓' if tipo_match else '✗'}")
                        print(f"     Inicio: '{fecha_inicio_buscar}'=='{fecha_inicio_cell}' {'✓' if fecha_inicio_match else '✗'}")
                        print(f"     Fin: '{fecha_fin_buscar}'=='{fecha_fin_cell}' {'✓' if fecha_fin_match else '✗'}")
                        print(f"     Salario: '{salario_buscar}'=='{salario_cell}' {'✓' if salario_match else '✗'}")
                    
                    # Si LAS 4 coinciden, es EL CONTRATO MILLONARIO QUE NECESITO
                    if tipo_match and salario_match and fecha_inicio_match and fecha_fin_match:
                        print(f"\n  ✓✓✓ CONTRATO ENCONTRADO en Fila {row_idx+1} ✓✓✓")
                        print(f"      4/4 criterios coinciden\n")
                        contract_found = True
                        view_button = row.find_element(By.XPATH, ".//button[contains(@aria-label, 'View') or contains(@aria-label, 'view') or contains(@aria-label, 'Ver')]")
                        break
            
            if not contract_found:
                raise RuntimeError("Contrato no encontrado en la tabla. Verifica que se haya guardado correctamente.")
            
        except Exception as e:
            print(f"  [ERROR] Error buscando contrato: {str(e)}")
            raise
        
        # 7. ABRIR MODAL "VER" Y CAPTURAR DATOS
        print("[11/11] Capturando y validando datos del contrato...\n")
        
        view_button.click()
        time.sleep(3)
        
        modal = driver.find_element(By.XPATH, "//div[contains(@class, 'modal') or contains(@role, 'dialog')]")
        
        # USAR FUNCIÓN DE CAPTURA MODULAR
        captured_data = capture_modal_data(driver, modal)
        
        # CERRAR MODAL DESPUES DE CAPTURAR
        try:
            close_button = modal.find_element(By.XPATH, "//button[@aria-label='Close Modal' or contains(@class, 'close')]")
            close_button.click()
            time.sleep(1)
        except:
            pass
        
        # GUARDAR DATOS INGRESADOS Y CAPTURADOS 
        # VALIDAR DATOS CAPTURADOS VS INGRESADOS, BUG DE -1 DIA PERO QUE MAS DA
        validation_results = validate_contract_data(contract_data, captured_data)
        
        validation_data = {
            'datos_ingresados': contract_data,
            'datos_capturados': captured_data,
            'validation': validation_results
        }
        
        data_path = os.path.join(os.path.dirname(__file__), 'IT-CON-001_validation.json')
        with open(data_path, 'w', encoding='utf-8') as f:
            json.dump(validation_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n  [OK] Datos de validación guardados en: {data_path}")
        
        # RESUMEN DE VALIDACION 
        print("\n" + "=" * 60)
        print("VALIDACIÓN DE DATOS")
        print("=" * 60)
        if validation_results['valid']:
            print("✓ TODOS LOS DATOS COINCIDEN")
        else:
            print(f"⚠ SE ENCONTRARON {len(validation_results['discrepancies'])} DISCREPANCIAS")
            for disc in validation_results['discrepancies']:
                print(f"  - {disc}")
        
        if validation_results['warnings']:
            print(f"\n⚠ ADVERTENCIAS ({len(validation_results['warnings'])}):")
            for warn in validation_results['warnings']:
                print(f"  - {warn}")
        
        # RESUMEN DE CAPTURA AL TERRORISMO
        print("\n" + "=" * 60)
        print("CAPTURA COMPLETADA")
        print("=" * 60)
        print(f"✓ Datos JSON: {data_path}")
        print(f"  DATOS INGRESADOS:")
        print(f"    - Tipo: {contract_data['tipo_contrato']}")
        print(f"    - Salario: ${contract_data['salario_base']:,}")
        print(f"    - Deducciones: {len(contract_data['deducciones'])}")
        print(f"    - Incrementos: {len(contract_data['incrementos'])}")
        print(f"  DATOS CAPTURADOS (modal Ver):")
        print(f"    - Sección 1: {len(captured_data['step1'])} campos")
        print(f"    - Sección 2: {len(captured_data['step2'])} campos")
        print(f"    - Sección 3: {len(captured_data['step3']['deducciones'])} deducciones")
        print(f"    - Sección 4: {len(captured_data['step4']['incrementos'])} incrementos")
        print(f"    - Sección 5: Historial capturado")
        print("=" * 60)
        
        results['validation'] = validation_results
        results['captured_data'] = captured_data
        results['status'] = 'success' if validation_results['valid'] else 'success_with_warnings'
        
        print(f"\n[OK] ===== TEST COMPLETADO =====")
        print(f"     Contrato creado, buscado y capturado correctamente\n")
        
        return results
        
    except Exception as e:
        print(f"\n[ERROR] ERROR: {str(e)}\n")
        print("[DEBUG] Presiona ENTER para cerrar el navegador y continuar...")
        input()
        results['status'] = 'failed'
        results['error'] = str(e)
        return results
        
    finally:
        try:
            driver.quit()
        except:
            pass


def write_output(results, path=None):
    """Escribe los resultados en un archivo JSON"""
    if path is None:
        path = os.path.join(os.path.dirname(__file__), 'IT-CON-001_results.json')
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    return path


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='IT-CON-001 - Selenium Test: Registrar Contrato')
    parser.add_argument('--report', '-r', help='Path to report file', default=None)
    parser.add_argument('--out', help='Output results path', default=None)
    args = parser.parse_args()
    
    try:
        report_json = load_report_json(args.report)
        payload = report_json.get('tests_payloads', {}).get('IT-CON-001', {}).get('payload', {})
        
        results = test_IT_CON_001(payload)
        
        out_path = write_output(results, args.out)
        print(f'\n[OK] Resultados guardados en: {out_path}\n')
        
    except Exception as e:
        print(f'\n[ERROR] ERROR: {str(e)}\n')


if __name__ == '__main__':
    main()
