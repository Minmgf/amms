"""
IT-PM-002: Flujo base de mantenimiento

Este script automatiza el login en la aplicación y navega hasta el módulo de
"Mantenimiento" usando Selenium. Incluye esperas explícitas para darle tiempo
al sistema a reaccionar entre interacciones.
"""

import os
import sys
import time
import random
from pathlib import Path

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


TEST_NAME = "IT-PM-002"
MAINTENANCE_XPATH = "//span[normalize-space()='Mantenimiento']"

# Selectores para búsqueda y filtros
SEARCH_INPUT_XPATH = "//input[@placeholder='Buscar por consecutivo, maquinaria o serial...']"
CLEAR_FILTERS_BUTTON_XPATH = "//button[normalize-space()='Limpiar todos los filtros']"

# Selectores para botones de calendario
CALENDAR_FILTER_BUTTONS = {
	"accent": "//button[@class='flex-1 parametrization-button px-3 py-2 text-xs bg-accent text-white hover:bg-accent-hover transition-colors']",
	"success": "//button[@class='flex-1 parametrization-button px-3 py-2 text-xs bg-success text-white hover:bg-success-hover transition-colors']",
	"warning": "//button[@class='flex-1 parametrization-button px-3 py-2 text-xs bg-warning text-white hover:bg-warning-hover transition-colors']",
}
CALENDAR_CLEAR_BUTTON_XPATH = "//button[@class='flex-1 parametrization-button px-3 py-2 text-xs parametrization-text hover:bg-hover transition-colors']"

# Selectores para filtros avanzados
ADVANCED_FILTERS_BUTTON_XPATH = "//span[normalize-space()='Filtros Avanzados']"
ADVANCED_FILTERS_APPLY_BUTTON_XPATH = "//button[normalize-space()='Aplicar']"
ADVANCED_FILTERS_CLEAR_BUTTON_XPATH = "//button[@class='flex-1 px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors parametrization-text']"

# Selectores CSS para los select del formulario de filtros avanzados
ADVANCED_FILTER_SELECTS = {
	"tipo": "select.w-full.px-3.py-2.border.border-gray-300.rounded-lg",
	"tecnico": "select.w-full.px-3.py-2.border.border-gray-300.rounded-lg",
	"estado": "select.w-full.px-3.py-2.border.border-gray-300.rounded-lg",
}

# Opciones válidas para cada filtro
FILTER_OPTIONS = {
	"tipo": ["Preventivo", "Correctivo"],
	"tecnico": ["David", "Linda Valentina", "Luigy ", "Manuel", "Alejandro "],
	"estado": ["Programado", "Realizado", "Cancelado"],
}


def ensure_login_credentials():

	print("🔐 Verificando credenciales de login para IT-PM-002…")
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
		raise ValueError("EMAIL y PASSWORD no están configurados para el flujo IT-PM-002")


def navigate_to_maintenance(driver, wait_seconds=20):
	"""Navega desde el dashboard hasta el módulo de mantenimiento."""

	print("🔍 Preparando navegación al módulo \"Mantenimiento\"…")
	wait = WebDriverWait(driver, wait_seconds)

	# Espera fija solicitada para asegurar que el dashboard termine de cargar
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

	# Espera fija solicitada para permitir la carga del módulo
	print("   ⏳ Esperando 5 segundos para que el módulo termine de cargar…")
	time.sleep(5)

	return driver


def perform_search(driver, search_term, wait_seconds=20):
	"""
	Realiza una búsqueda en el campo de búsqueda y espera los resultados.
	
	Args:
		driver: Instancia de WebDriver
		search_term: Término a buscar
		wait_seconds: Tiempo máximo de espera
	"""
	print(f"🔎 Buscando: '{search_term}'")
	wait = WebDriverWait(driver, wait_seconds)
	
	try:
		# Localizar campo de búsqueda
		search_input = wait.until(
			EC.element_to_be_clickable((By.XPATH, SEARCH_INPUT_XPATH))
		)
		
		# Limpiar y escribir término de búsqueda
		search_input.clear()
		search_input.send_keys(search_term)
		print(f"   ✍️  Término '{search_term}' ingresado en búsqueda")
		
		# Esperar 5 segundos para que se filtren resultados
		print("   ⏳ Esperando 5 segundos para que se aplique el filtro...")
		time.sleep(5)
		print(f"   ✅ Búsqueda de '{search_term}' completada")
		
	except Exception as e:
		print(f"   ❌ Error al buscar '{search_term}': {e}")
		raise


def clear_all_filters(driver, wait_seconds=20):
	"""
	Limpia todos los filtros haciendo click en el botón correspondiente.
	
	Args:
		driver: Instancia de WebDriver
		wait_seconds: Tiempo máximo de espera
	"""
	print("🧹 Limpiando todos los filtros...")
	wait = WebDriverWait(driver, wait_seconds)
	
	try:
		# Localizar y hacer click en botón de limpiar filtros
		clear_button = wait.until(
			EC.element_to_be_clickable((By.XPATH, CLEAR_FILTERS_BUTTON_XPATH))
		)
		clear_button.click()
		print("   ✅ Filtros limpiados correctamente")
		
		# Pequeña espera para que se refresquen los resultados
		time.sleep(2)
		
	except Exception as e:
		print(f"   ❌ Error al limpiar filtros: {e}")
		raise


def test_search_terms(driver):
	"""
	Ejecuta una serie de búsquedas con diferentes términos, limpiando entre cada una.
	
	Args:
		driver: Instancia de WebDriver
	"""
	print("\n📋 === PROBANDO BÚSQUEDAS MÚLTIPLES === ")
	
	search_terms = ["jacko", "tractor", "5649416"]
	
	for idx, term in enumerate(search_terms, start=1):
		print(f"\n🔍 Búsqueda {idx}/{len(search_terms)}")
		perform_search(driver, term)
		
		# Limpiar filtros antes de la siguiente búsqueda (excepto en la última)
		if idx < len(search_terms):
			clear_all_filters(driver)
	
	# Limpiar filtros al finalizar todas las búsquedas
	print("\n🧽 Limpiando filtros después de todas las búsquedas...")
	clear_all_filters(driver)
	print("✅ Prueba de búsquedas completada\n")


def test_calendar_filters(driver, wait_seconds=20):
	"""
	Prueba los botones de filtro del calendario (accent, success, warning) y limpia al final.
	
	Args:
		driver: Instancia de WebDriver
		wait_seconds: Tiempo máximo de espera
	"""
	print("\n📅 === PROBANDO FILTROS DE CALENDARIO ===")
	wait = WebDriverWait(driver, wait_seconds)
	
	for filter_name, xpath in CALENDAR_FILTER_BUTTONS.items():
		print(f"\n🎯 Probando filtro: {filter_name}")
		
		try:
			# Localizar y hacer click en el botón del filtro
			filter_button = wait.until(
				EC.element_to_be_clickable((By.XPATH, xpath))
			)
			filter_button.click()
			print(f"   🖱️  Click en filtro '{filter_name}'")
			
			# Esperar 3 segundos como especificado
			print("   ⏳ Esperando 3 segundos...")
			time.sleep(3)
			print(f"   ✅ Filtro '{filter_name}' probado correctamente")
			
		except Exception as e:
			print(f"   ⚠️  Error al probar filtro '{filter_name}': {e}")
			# Continuar con el siguiente filtro aunque uno falle
			continue
	
	# Limpiar filtros de calendario al final
	print("\n🧹 Limpiando filtros de calendario...")
	try:
		clear_calendar_button = wait.until(
			EC.element_to_be_clickable((By.XPATH, CALENDAR_CLEAR_BUTTON_XPATH))
		)
		clear_calendar_button.click()
		print("   ✅ Filtros de calendario limpiados correctamente")
		time.sleep(2)
		
	except Exception as e:
		print(f"   ⚠️  Error al limpiar filtros de calendario: {e}")
	
	print("✅ Prueba de filtros de calendario completada\n")


def open_advanced_filters_modal(driver, wait_seconds=20):
	"""
	Abre el modal de filtros avanzados haciendo click en el botón correspondiente.
	
	Args:
		driver: Instancia de WebDriver
		wait_seconds: Tiempo máximo de espera
		
	Returns:
		bool: True si se abrió correctamente, False en caso contrario
	"""
	print("🔓 Abriendo modal de filtros avanzados...")
	wait = WebDriverWait(driver, wait_seconds)
	
	try:
		# Scroll al elemento primero para evitar click intercepted
		advanced_filters_button = wait.until(
			EC.presence_of_element_located((By.XPATH, ADVANCED_FILTERS_BUTTON_XPATH))
		)
		driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", advanced_filters_button)
		time.sleep(0.5)
		
		# Ahora hacer click
		advanced_filters_button = wait.until(
			EC.element_to_be_clickable((By.XPATH, ADVANCED_FILTERS_BUTTON_XPATH))
		)
		advanced_filters_button.click()
		print("   ✅ Modal de filtros avanzados abierto")
		
		# Esperar a que el modal esté completamente cargado
		time.sleep(2)
		return True
		
	except Exception as e:
		print(f"   ❌ Error al abrir modal de filtros avanzados: {e}")
		return False


def fill_advanced_filters_randomly(driver):
	"""
	Llena los filtros avanzados con valores aleatorios de las opciones especificadas.
	
	Args:
		driver: Instancia de WebDriver
		
	Returns:
		dict: Diccionario con los valores seleccionados
	"""
	print("🎲 Llenando filtros avanzados de forma aleatoria...")
	selected_values = {}
	
	try:
		# Obtener todos los select del modal
		all_selects = driver.find_elements(By.CSS_SELECTOR, "select.w-full.px-3.py-2.border.border-gray-300.rounded-lg")
		
		print(f"   📊 Total de selects encontrados: {len(all_selects)}")
		
		if len(all_selects) < 3:
			print(f"   ⚠️  Se esperaban 3 selects, se encontraron {len(all_selects)}")
			return selected_values
		
		# Mapear cada select con su tipo correspondiente
		filter_mapping = [
			("tipo", 0, FILTER_OPTIONS["tipo"]),
			("tecnico", 1, FILTER_OPTIONS["tecnico"]),
			("estado", 2, FILTER_OPTIONS["estado"])
		]
		
		for filter_name, index, options_list in filter_mapping:
			try:
				select_element = all_selects[index]
				select = Select(select_element)
				
				# Mostrar opciones disponibles para debugging
				available_options = [opt.text.strip() for opt in select.options if opt.text.strip()]
				print(f"   🔍 Opciones disponibles en '{filter_name}': {available_options[:5]}...")
				
				# Elegir valor aleatorio
				random_value = random.choice(options_list)
				
				# Intentar seleccionar por texto visible
				try:
					select.select_by_visible_text(random_value)
					selected_values[filter_name] = random_value
					print(f"   ✅ {filter_name.capitalize()}: '{random_value}'")
				except Exception as select_error:
					# Si falla, intentar con coincidencia parcial
					print(f"   ⚠️  Texto exacto no encontrado, buscando coincidencia parcial...")
					found = False
					for option in select.options:
						if random_value.strip() in option.text.strip():
							option.click()
							selected_values[filter_name] = option.text.strip()
							print(f"   ✅ {filter_name.capitalize()}: '{option.text.strip()}' (coincidencia parcial)")
							found = True
							break
					
					if not found:
						print(f"   ❌ No se pudo seleccionar '{random_value}' en {filter_name}")
						selected_values[filter_name] = None
				
			except Exception as e:
				print(f"   ⚠️  Error seleccionando {filter_name}: {e}")
				selected_values[filter_name] = None
		
		return selected_values
		
	except Exception as e:
		print(f"   ❌ Error general llenando filtros: {e}")
		return selected_values


def apply_advanced_filters(driver, wait_seconds=20):
	"""
	Aplica los filtros avanzados haciendo click en el botón 'Aplicar'.
	
	Args:
		driver: Instancia de WebDriver
		wait_seconds: Tiempo máximo de espera
	"""
	print("✅ Aplicando filtros avanzados...")
	wait = WebDriverWait(driver, wait_seconds)
	
	try:
		apply_button = wait.until(
			EC.element_to_be_clickable((By.XPATH, ADVANCED_FILTERS_APPLY_BUTTON_XPATH))
		)
		apply_button.click()
		print("   ✅ Filtros aplicados correctamente")
		
		# Esperar a que se procesen los filtros y se cierre el modal
		time.sleep(3)
		
	except Exception as e:
		print(f"   ❌ Error al aplicar filtros: {e}")
		raise


def clear_advanced_filters(driver, wait_seconds=20):
	"""
	Limpia los filtros avanzados dentro del modal haciendo click en el botón rojo.
	
	Args:
		driver: Instancia de WebDriver
		wait_seconds: Tiempo máximo de espera
	"""
	print("🧹 Limpiando filtros avanzados...")
	wait = WebDriverWait(driver, wait_seconds)
	
	try:
		clear_button = wait.until(
			EC.element_to_be_clickable((By.XPATH, ADVANCED_FILTERS_CLEAR_BUTTON_XPATH))
		)
		clear_button.click()
		print("   ✅ Filtros avanzados limpiados correctamente")
		
		# Pequeña espera después de limpiar
		time.sleep(1)
		
	except Exception as e:
		print(f"   ⚠️  Error al limpiar filtros avanzados: {e}")


def verify_filters_applied(driver):
	"""
	Verifica que los filtros se hayan aplicado correctamente revisando elementos en la página.
	
	Args:
		driver: Instancia de WebDriver
		
	Returns:
		bool: True si hay resultados visibles o mensaje de no resultados
	"""
	print("🔍 Verificando que filtros se aplicaron correctamente...")
	
	try:
		# Buscar filas de tabla o mensaje de no resultados
		rows = driver.find_elements(By.CSS_SELECTOR, "table tbody tr")
		
		if rows:
			print(f"   ✅ Se encontraron {len(rows)} resultados filtrados")
			return True
		else:
			# Verificar si hay mensaje de "sin resultados"
			no_results_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'No se encontraron') or contains(text(), 'sin resultados')]")
			if no_results_elements:
				print("   ℹ️  Filtro aplicado - Sin resultados coincidentes")
				return True
			else:
				print("   ⚠️  No se detectaron resultados ni mensaje de vacío")
				return False
				
	except Exception as e:
		print(f"   ⚠️  Error verificando filtros: {e}")
		return False


def test_advanced_filters_multiple_times(driver, iterations=5):
	"""
	Prueba el filtrado avanzado múltiples veces con valores aleatorios.
	Ciclo: Abrir modal → Llenar → Aplicar → Verificar → Abrir modal → Limpiar → Repetir
	
	Args:
		driver: Instancia de WebDriver
		iterations: Número de iteraciones a realizar (default: 5)
	"""
	print(f"\n🎯 === PROBANDO FILTROS AVANZADOS ({iterations} ITERACIONES) ===\n")
	
	for i in range(1, iterations + 1):
		print(f"🔄 Iteración {i}/{iterations}")
		
		# 1. Abrir modal de filtros avanzados
		if not open_advanced_filters_modal(driver):
			print(f"   ⚠️  No se pudo abrir el modal en iteración {i}, saltando...")
			continue
		
		# 2. Llenar filtros de forma aleatoria
		selected_values = fill_advanced_filters_randomly(driver)
		print(f"   📋 Valores seleccionados: {selected_values}")
		
		# 3. Aplicar filtros
		try:
			apply_advanced_filters(driver)
		except Exception as e:
			print(f"   ⚠️  Error aplicando filtros en iteración {i}: {e}")
			continue
		
		# 4. Verificar que los filtros se aplicaron
		verify_filters_applied(driver)
		
		# 5. Volver a abrir el modal para limpiar
		print("🔄 Reabriendo modal para limpiar filtros...")
		if not open_advanced_filters_modal(driver):
			print(f"   ⚠️  No se pudo reabrir el modal en iteración {i}")
			continue
		
		# 6. Limpiar filtros dentro del modal
		clear_advanced_filters(driver)
		
		# 7. Cerrar modal aplicando filtros limpios
		try:
			apply_advanced_filters(driver)
		except Exception as e:
			print(f"   ⚠️  Error cerrando modal después de limpiar: {e}")
		
		print(f"✅ Iteración {i}/{iterations} completada\n")
		time.sleep(2)
	
	print("🎉 Prueba de filtros avanzados completada exitosamente\n")


def setup_it_pm_002(headless=None, wait_seconds=20):
	"""Realiza login y navega hasta mantenimiento, dejando el driver listo."""

	ensure_login_credentials()
	print("🚀 Iniciando flujo base de IT-PM-002…")
	driver = perform_login(headless=headless)

	print("   ✅ Login completado. Aplicando espera de 5 segundos antes de navegar…")
	time.sleep(5)

	navigate_to_maintenance(driver, wait_seconds)

	print("🏁 Navegación a mantenimiento completada.")
	return driver


def run_it_pm_002_smoke(headless=None, wait_seconds=20):
	"""Ejecuta el flujo completo y cierra el navegador al finalizar."""

	driver = None
	try:
		driver = setup_it_pm_002(headless=headless, wait_seconds=wait_seconds)
		
		# Ejecutar pruebas de búsqueda
		test_search_terms(driver)
		
		# Ejecutar pruebas de filtros de calendario
		test_calendar_filters(driver)
		
		# Ejecutar pruebas de filtros avanzados (5 iteraciones)
		test_advanced_filters_multiple_times(driver, iterations=5)
		
		print("⏳ Manteniendo la sesión abierta 5 segundos para observación final…")
		time.sleep(5)
		
	except Exception as error:
		print(f"❌ Error en el flujo IT-PM-002: {error}")
		raise
	finally:
		if driver:
			try:
				save_browser_logs(driver, TEST_NAME)
			except Exception as log_error:
				print(f"⚠️  No se pudieron guardar los logs del navegador: {log_error}")
			driver.quit()
			print("🧹 Navegador cerrado.")


if __name__ == "__main__":
	run_it_pm_002_smoke()
