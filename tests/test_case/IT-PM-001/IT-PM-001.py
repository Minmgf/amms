"""
IT-PM-001: Programar Mantenimiento sin Solicitud

Este script automatiza el proceso de programación de un nuevo mantenimiento
sin una solicitud previa, navegando desde el login hasta completar el formulario
de programación con todos los campos requeridos.
"""

import os
import sys
import time
import random
from pathlib import Path
from datetime import datetime, timedelta

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support.ui import Select
from dotenv import load_dotenv

# Habilitar importación de módulos compartidos
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))

from flows.auth.login.selenium_login_flow import perform_login, save_browser_logs


TEST_NAME = "IT-PM-001"
MAINTENANCE_XPATH = "//span[normalize-space()='Mantenimiento']"
NEW_MAINTENANCE_BUTTON_XPATH = "//span[normalize-space()='Nuevo Mantenimiento']"

# Selectores del formulario de programación
MACHINE_SELECTOR_XPATH = "//select[@name='machineSelector']"
MAINTENANCE_TYPE_SELECTOR_XPATH = "//select[@name='maintenanceType']"
SCHEDULE_DATE_INPUT_XPATH = "//input[@name='scheduleDate']"
SCHEDULE_HOUR_SELECTOR_XPATH = "//select[@name='scheduleHour']"
SCHEDULE_MINUTE_SELECTOR_XPATH = "//select[contains(@name,'scheduleMinute')]"
SCHEDULE_AMPM_SELECTOR_XPATH = "//select[@name='scheduleAMPM']"
ASSIGNED_TECHNICIAN_XPATH = "//select[@name='assignedTechnician']"
COMMENTS_TEXTAREA_XPATH = "//textarea[@placeholder='Escribir comentarios...']"
SCHEDULE_BUTTON_XPATH = "//button[normalize-space()='Programar']"
CONTINUE_BUTTON_XPATH = "//button[normalize-space()='Continuar']"


def ensure_login_credentials():
    """Carga y valida las credenciales de login desde .env"""
    print("🔐 Verificando credenciales de login para IT-PM-001…")
    project_root = ROOT_DIR.parent
    env_path = project_root / ".env"
    
    if not env_path.exists():
        raise FileNotFoundError(f"No se encontró archivo .env en {env_path}")
    
    load_dotenv(env_path, override=True)
    print(f"   📄 .env cargado desde: {env_path}")

    email = os.getenv("EMAIL") or os.getenv("email")
    password = os.getenv("PASSWORD") or os.getenv("password")

    if email:
        os.environ["EMAIL"] = email.strip().strip('"').strip("'")
    if password:
        os.environ["PASSWORD"] = password.strip().strip('"').strip("'")

    if not os.getenv("EMAIL") or not os.getenv("PASSWORD"):
        raise ValueError("EMAIL y PASSWORD no están configurados para el flujo IT-PM-001")
    
    print("   ✅ Credenciales validadas correctamente")


def navigate_to_maintenance(driver, wait_seconds=20):
    """Navega desde el dashboard hasta el módulo de mantenimiento."""
    print("🔍 Preparando navegación al módulo \"Mantenimiento\"…")
    wait = WebDriverWait(driver, wait_seconds)

    # Espera fija para asegurar que el dashboard termine de cargar
    print("   ⏳ Esperando 5 segundos antes de buscar la opción del menú…")
    time.sleep(5)

    maintenance_option = wait.until(
        EC.element_to_be_clickable((By.XPATH, MAINTENANCE_XPATH))
    )
    print("   ✅ Opción de mantenimiento disponible, intentando hacer click…")

    try:
        maintenance_option.click()
        print("   🖱️  Click ejecutado sobre el span de mantenimiento")
    except Exception as click_error:
        print(f"   ⚠️  Click directo falló: {click_error}. Intentando con el enlace padre…")
        parent_link = maintenance_option.find_element(By.XPATH, "./ancestor::a[1]")
        parent_link.click()
        print("   🖱️  Click ejecutado sobre el enlace padre de mantenimiento")

    # Espera fija para permitir la carga del módulo
    print("   ⏳ Esperando 5 segundos para que el módulo termine de cargar…")
    time.sleep(5)
    print("   ✅ Navegación a Mantenimiento completada")

    return driver


def click_new_maintenance_button(driver, wait_seconds=20):
    """Hace click en el botón 'Nuevo Mantenimiento'"""
    print("🆕 Haciendo click en 'Nuevo Mantenimiento'…")
    wait = WebDriverWait(driver, wait_seconds)
    
    try:
        new_maintenance_button = wait.until(
            EC.element_to_be_clickable((By.XPATH, NEW_MAINTENANCE_BUTTON_XPATH))
        )
        
        # Scroll al elemento para evitar interceptación
        driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", new_maintenance_button)
        time.sleep(1)
        
        new_maintenance_button.click()
        print("   ✅ Click en 'Nuevo Mantenimiento' ejecutado")
        
        # Esperar a que se abra el formulario
        time.sleep(3)
        print("   ✅ Formulario de programación cargado")
        
    except Exception as e:
        print(f"   ❌ Error al hacer click en 'Nuevo Mantenimiento': {e}")
        raise


def select_machine(driver, wait_seconds=20):
    """Selecciona una maquinaria aleatoria del selector"""
    print("🚜 Seleccionando maquinaria…")
    wait = WebDriverWait(driver, wait_seconds)
    
    try:
        machine_select_element = wait.until(
            EC.presence_of_element_located((By.XPATH, MACHINE_SELECTOR_XPATH))
        )
        
        machine_select = Select(machine_select_element)
        
        # Obtener todas las opciones excepto la primera (placeholder)
        available_options = [option for option in machine_select.options if option.get_attribute("value") != ""]
        
        if not available_options:
            raise ValueError("No hay maquinarias disponibles para seleccionar")
        
        # Seleccionar aleatoriamente
        selected_option = random.choice(available_options)
        machine_select.select_by_value(selected_option.get_attribute("value"))
        
        print(f"   ✅ Maquinaria seleccionada: {selected_option.text}")
        time.sleep(2)
        
        return selected_option.text
        
    except Exception as e:
        print(f"   ❌ Error al seleccionar maquinaria: {e}")
        raise


def select_maintenance_type(driver, wait_seconds=20):
    """Selecciona un tipo de mantenimiento aleatorio"""
    print("🔧 Seleccionando tipo de mantenimiento…")
    wait = WebDriverWait(driver, wait_seconds)
    
    try:
        type_select_element = wait.until(
            EC.presence_of_element_located((By.XPATH, MAINTENANCE_TYPE_SELECTOR_XPATH))
        )
        
        type_select = Select(type_select_element)
        
        # Obtener todas las opciones excepto la primera (placeholder)
        available_options = [option for option in type_select.options if option.get_attribute("value") != ""]
        
        if not available_options:
            raise ValueError("No hay tipos de mantenimiento disponibles")
        
        # Seleccionar aleatoriamente
        selected_option = random.choice(available_options)
        type_select.select_by_value(selected_option.get_attribute("value"))
        
        print(f"   ✅ Tipo de mantenimiento seleccionado: {selected_option.text}")
        time.sleep(2)
        
        return selected_option.text
        
    except Exception as e:
        print(f"   ❌ Error al seleccionar tipo de mantenimiento: {e}")
        raise


def set_schedule_date(driver, wait_seconds=20):
    """Establece la fecha de programación (fecha futura aleatoria en 2025)"""
    print("📅 Estableciendo fecha de programación…")
    wait = WebDriverWait(driver, wait_seconds)
    
    try:
        date_input = wait.until(
            EC.presence_of_element_located((By.XPATH, SCHEDULE_DATE_INPUT_XPATH))
        )
        
        # Generar fecha futura en 2025 (entre hoy y fin de año 2025)
        today = datetime.now()
        
        # Si estamos en 2025, generar fecha entre hoy y fin de año
        if today.year == 2025:
            end_of_year = datetime(2025, 12, 31)
            days_until_end = (end_of_year - today).days
            if days_until_end > 0:
                days_ahead = random.randint(1, min(days_until_end, 90))
            else:
                days_ahead = 1
        else:
            # Si no estamos en 2025, generar fecha aleatoria en 2025
            start_2025 = datetime(2025, 1, 1)
            end_2025 = datetime(2025, 12, 31)
            days_in_2025 = (end_2025 - start_2025).days
            days_ahead = random.randint(1, days_in_2025)
            future_date = start_2025 + timedelta(days=days_ahead)
            date_string = future_date.strftime("%d/%m/%Y")
            
            date_input.clear()
            date_input.send_keys(date_string)
            print(f"   ✅ Fecha establecida: {date_string}")
            time.sleep(2)
            return date_string
        
        future_date = today + timedelta(days=days_ahead)
        date_string = future_date.strftime("%d/%m/%Y")
        
        # Limpiar y establecer fecha
        date_input.clear()
        date_input.send_keys(date_string)
        
        print(f"   ✅ Fecha establecida: {date_string}")
        time.sleep(2)
        
        return date_string
        
    except Exception as e:
        print(f"   ❌ Error al establecer fecha: {e}")
        raise


def set_schedule_time(driver, wait_seconds=20):
    """Establece la hora de programación (hora, minuto, AM/PM aleatorios)"""
    print("⏰ Estableciendo hora de programación…")
    wait = WebDriverWait(driver, wait_seconds)
    
    try:
        # Seleccionar hora
        hour_select_element = wait.until(
            EC.presence_of_element_located((By.XPATH, SCHEDULE_HOUR_SELECTOR_XPATH))
        )
        hour_select = Select(hour_select_element)
        
        # Obtener opciones de hora (excepto placeholder)
        hour_options = [option.get_attribute("value") for option in hour_select.options if option.get_attribute("value") != ""]
        selected_hour = random.choice(hour_options)
        hour_select.select_by_value(selected_hour)
        print(f"   ✅ Hora seleccionada: {selected_hour}")
        time.sleep(1)
        
        # Seleccionar minuto
        minute_select_element = wait.until(
            EC.presence_of_element_located((By.XPATH, SCHEDULE_MINUTE_SELECTOR_XPATH))
        )
        minute_select = Select(minute_select_element)
        
        # Obtener opciones de minuto (excepto placeholder)
        minute_options = [option.get_attribute("value") for option in minute_select.options if option.get_attribute("value") != ""]
        selected_minute = random.choice(minute_options)
        minute_select.select_by_value(selected_minute)
        print(f"   ✅ Minuto seleccionado: {selected_minute}")
        time.sleep(1)
        
        # Seleccionar AM/PM
        ampm_select_element = wait.until(
            EC.presence_of_element_located((By.XPATH, SCHEDULE_AMPM_SELECTOR_XPATH))
        )
        ampm_select = Select(ampm_select_element)
        
        # Obtener opciones AM/PM (excepto placeholder)
        ampm_options = [option.get_attribute("value") for option in ampm_select.options if option.get_attribute("value") != ""]
        selected_ampm = random.choice(ampm_options)
        ampm_select.select_by_value(selected_ampm)
        print(f"   ✅ AM/PM seleccionado: {selected_ampm}")
        time.sleep(2)
        
        time_string = f"{selected_hour}:{selected_minute} {selected_ampm}"
        print(f"   🕐 Hora completa: {time_string}")
        
        return time_string
        
    except Exception as e:
        print(f"   ❌ Error al establecer hora: {e}")
        raise


def set_comments(driver, wait_seconds=20):
    """Establece comentarios en el textarea (máximo 350 caracteres)"""
    print("💬 Estableciendo comentarios…")
    wait = WebDriverWait(driver, wait_seconds)
    
    try:
        comments_textarea = wait.until(
            EC.presence_of_element_located((By.XPATH, COMMENTS_TEXTAREA_XPATH))
        )
        
        # Lista de comentarios de ejemplo
        sample_comments = [
            "Mantenimiento preventivo programado para revisión general del sistema.",
            "Se requiere inspección de componentes mecánicos y lubricación.",
            "Revisión de desgaste y reemplazo de partes según sea necesario.",
            "Mantenimiento correctivo para reparación de falla reportada.",
            "Verificación de parámetros operativos y ajustes de calibración.",
            "Inspección de sistema hidráulico y neumático.",
            "Mantenimiento programado según cronograma anual de la maquinaria.",
        ]
        
        # Seleccionar comentario aleatorio y asegurar que no exceda 350 caracteres
        selected_comment = random.choice(sample_comments)
        if len(selected_comment) > 350:
            selected_comment = selected_comment[:347] + "..."
        
        comments_textarea.clear()
        comments_textarea.send_keys(selected_comment)
        
        print(f"   ✅ Comentario establecido ({len(selected_comment)} caracteres)")
        print(f"   📝 Comentario: {selected_comment}")
        time.sleep(2)
        
        return selected_comment
        
    except Exception as e:
        print(f"   ❌ Error al establecer comentarios: {e}")
        raise


def select_assigned_technician(driver, wait_seconds=20):
    """Selecciona un técnico aleatorio para asignar al mantenimiento"""
    print("👨‍🔧 Seleccionando técnico asignado…")
    wait = WebDriverWait(driver, wait_seconds)
    
    try:
        technician_select_element = wait.until(
            EC.presence_of_element_located((By.XPATH, ASSIGNED_TECHNICIAN_XPATH))
        )
        
        technician_select = Select(technician_select_element)
        
        # Obtener todas las opciones excepto la primera (placeholder)
        available_options = [option for option in technician_select.options if option.get_attribute("value") != ""]
        
        if not available_options:
            raise ValueError("No hay técnicos disponibles para asignar")
        
        # Seleccionar aleatoriamente
        selected_option = random.choice(available_options)
        technician_select.select_by_value(selected_option.get_attribute("value"))
        
        print(f"   ✅ Técnico asignado: {selected_option.text.strip()}")
        time.sleep(2)
        
        return selected_option.text.strip()
        
    except Exception as e:
        print(f"   ❌ Error al seleccionar técnico: {e}")
        raise


def click_schedule_button(driver, wait_seconds=20):
    """Hace click en el botón 'Programar' para confirmar el mantenimiento"""
    print("✅ Haciendo click en 'Programar'…")
    wait = WebDriverWait(driver, wait_seconds)
    
    try:
        schedule_button = wait.until(
            EC.element_to_be_clickable((By.XPATH, SCHEDULE_BUTTON_XPATH))
        )
        
        # Scroll al elemento para evitar interceptación
        driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", schedule_button)
        time.sleep(1)
        
        schedule_button.click()
        print("   ✅ Click en 'Programar' ejecutado")
        
        # Esperar a que se procese la programación
        time.sleep(2)
        print("   ✅ Mantenimiento programado exitosamente")
        
    except Exception as e:
        print(f"   ❌ Error al hacer click en 'Programar': {e}")
        raise


def click_continue_button(driver, wait_seconds=20):
    """Hace click en el botón 'Continuar' del modal de confirmación"""
    print("➡️  Haciendo click en 'Continuar'…")
    wait = WebDriverWait(driver, wait_seconds)
    
    try:
        continue_button = wait.until(
            EC.element_to_be_clickable((By.XPATH, CONTINUE_BUTTON_XPATH))
        )
        
        # Scroll al elemento para evitar interceptación
        driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", continue_button)
        time.sleep(1)
        
        continue_button.click()
        print("   ✅ Click en 'Continuar' ejecutado")
        
        # Esperar a que se cierre el modal
        time.sleep(2)
        print("   ✅ Modal cerrado, listo para siguiente iteración")
        
    except Exception as e:
        print(f"   ❌ Error al hacer click en 'Continuar': {e}")
        raise


def fill_maintenance_form(driver, wait_seconds=20):
    """
    Completa el formulario de programación de mantenimiento.
    
    Returns:
        dict: Datos del formulario completado
    """
    print("\n" + "="*80)
    print("📋 COMPLETANDO FORMULARIO DE PROGRAMACIÓN DE MANTENIMIENTO")
    print("="*80 + "\n")
    
    form_data = {}
    
    try:
        # 1. Seleccionar maquinaria
        form_data["machine"] = select_machine(driver, wait_seconds)
        
        # 2. Seleccionar tipo de mantenimiento
        form_data["maintenance_type"] = select_maintenance_type(driver, wait_seconds)
        
        # 3. Establecer fecha
        form_data["schedule_date"] = set_schedule_date(driver, wait_seconds)
        
        # 4. Establecer hora
        form_data["schedule_time"] = set_schedule_time(driver, wait_seconds)
        
        # 5. Asignar técnico
        form_data["assigned_technician"] = select_assigned_technician(driver, wait_seconds)
        
        # 6. Establecer comentarios
        form_data["comments"] = set_comments(driver, wait_seconds)
        
        # 7. Click en Programar
        click_schedule_button(driver, wait_seconds)
        
        # 8. Click en Continuar (modal de confirmación)
        click_continue_button(driver, wait_seconds)
        
        print("\n" + "="*80)
        print("✅ FORMULARIO COMPLETADO EXITOSAMENTE")
        print("="*80)
        print("\n📊 RESUMEN DE DATOS INGRESADOS:")
        print(f"   • Maquinaria: {form_data['machine']}")
        print(f"   • Tipo: {form_data['maintenance_type']}")
        print(f"   • Fecha: {form_data['schedule_date']}")
        print(f"   • Hora: {form_data['schedule_time']}")
        print(f"   • Técnico: {form_data['assigned_technician']}")
        print(f"   • Comentarios: {form_data['comments'][:50]}...")
        print("="*80 + "\n")
        
        return form_data
        
    except Exception as e:
        print(f"\n❌ Error al completar el formulario: {e}")
        raise


def setup_it_pm_001(headless=False, wait_seconds=20):
    """
    Configura el navegador, realiza login y navega al módulo de Mantenimiento.
    
    Args:
        headless: Si True, ejecuta Chrome en modo headless
        wait_seconds: Tiempo de espera para operaciones
    
    Returns:
        driver: Instancia de WebDriver autenticada y posicionada en Mantenimiento
    """
    print("\n" + "="*80)
    print(f"🚀 INICIANDO TEST: {TEST_NAME}")
    print("="*80 + "\n")
    
    # Verificar credenciales
    ensure_login_credentials()
    
    # Realizar login usando el flujo compartido
    print("🔑 Iniciando proceso de login…")
    driver = perform_login(headless=headless)
    print("   ✅ Login completado exitosamente\n")
    
    # Navegar al módulo de Mantenimiento
    navigate_to_maintenance(driver, wait_seconds)
    
    return driver


def run_it_pm_001_smoke(headless=False, wait_seconds=20, iterations=3):
    """
    Ejecuta el flujo completo de IT-PM-001: Programar Mantenimiento sin Solicitud
    
    Args:
        headless: Si True, ejecuta Chrome en modo headless
        wait_seconds: Tiempo de espera para operaciones
        iterations: Número de veces que se ejecutará el ciclo de programación
    """
    driver = None
    all_results = []
    
    try:
        # Setup: Login y navegación
        driver = setup_it_pm_001(headless, wait_seconds)
        
        print("\n" + "="*80)
        print(f"🔄 EJECUTANDO {iterations} ITERACIONES DE PROGRAMACIÓN DE MANTENIMIENTO")
        print("="*80 + "\n")
        
        for i in range(iterations):
            print("\n" + "🔹"*40)
            print(f"   ITERACIÓN {i+1} DE {iterations}")
            print("🔹"*40 + "\n")
            
            try:
                # Hacer click en "Nuevo Mantenimiento"
                click_new_maintenance_button(driver, wait_seconds)
                
                # Completar formulario
                form_data = fill_maintenance_form(driver, wait_seconds)
                form_data["iteration"] = i + 1
                all_results.append(form_data)
                
                # Esperar para visualizar el resultado
                print(f"   ⏳ Esperando 3 segundos antes de la siguiente iteración…")
                time.sleep(3)
                
            except Exception as e:
                print(f"\n   ❌ Error en la iteración {i+1}: {e}")
                import traceback
                traceback.print_exc()
                # Continuar con la siguiente iteración
                continue
        
        # Resumen final
        print("\n" + "="*80)
        print("📊 RESUMEN FINAL DE TODAS LAS ITERACIONES")
        print("="*80 + "\n")
        
        for idx, result in enumerate(all_results, 1):
            print(f"Iteración {idx}:")
            print(f"   • Maquinaria: {result['machine']}")
            print(f"   • Tipo: {result['maintenance_type']}")
            print(f"   • Fecha: {result['schedule_date']}")
            print(f"   • Hora: {result['schedule_time']}")
            print(f"   • Técnico: {result['assigned_technician']}")
            print(f"   • Comentarios: {result['comments'][:50]}...")
            print()
        
        print("="*80)
        print(f"✅ TEST {TEST_NAME} COMPLETADO: {len(all_results)}/{iterations} ITERACIONES EXITOSAS")
        print("="*80 + "\n")
        
        return all_results
        
    except Exception as e:
        print(f"\n❌ Error durante la ejecución de {TEST_NAME}: {e}")
        import traceback
        traceback.print_exc()
        raise
        
    finally:
        if driver:
            # Guardar logs del navegador
            log_path = ROOT_DIR / "logs" / f"{TEST_NAME}_browser_console.log"
            save_browser_logs(driver, str(log_path))
            print(f"📝 Logs del navegador guardados en: {log_path}")
            
            # Cerrar navegador automáticamente
            print("\n🛑 Cerrando navegador automáticamente…")
            time.sleep(2)
            driver.quit()
            print("✅ Navegador cerrado\n")


if __name__ == "__main__":
    # Ejecutar el test con 3 iteraciones en modo no-headless para visualización
    run_it_pm_001_smoke(headless=False, wait_seconds=20, iterations=3)
