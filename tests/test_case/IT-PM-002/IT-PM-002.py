"""
IT-PM-002: Flujo base de mantenimiento

Este script automatiza el login en la aplicación y navega hasta el módulo de
"Mantenimiento" usando Selenium. Incluye esperas explícitas para darle tiempo
al sistema a reaccionar entre interacciones.
"""

import os
import sys
import time
from pathlib import Path

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from dotenv import load_dotenv

# Habilitar importación de módulos compartidos
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
	sys.path.append(str(ROOT_DIR))

from flows.auth.login.selenium_login_flow import perform_login, save_browser_logs


TEST_NAME = "IT-PM-002"
MAINTENANCE_XPATH = "//span[normalize-space()='Mantenimiento']"


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
		print("⏳ Manteniendo la sesión abierta 5 segundos para observación…")
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
