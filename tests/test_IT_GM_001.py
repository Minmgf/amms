
# ======================= IMPORTS Y CONFIGURACIÓN =======================
import time
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import datetime

EMAIL = "usuario.autorizado@dominio.com"
PASSWORD = "PasswordAutorizado123"
LOGIN_URL = "http://localhost:3000/sigma/login"
MAINTENANCE_URL = "http://localhost:3000/sigma/maintenance/maintenanceManagement"

# ======================= HELPERS =======================
def wait_and_send_keys(driver, by, selector, value, timeout=20):
    try:
        elem = WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((by, selector))
        )
        WebDriverWait(driver, timeout).until(
            EC.element_to_be_clickable((by, selector))
        )
        elem.clear()
        elem.send_keys(value)
        return elem
    except Exception as e:
        ts = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        fname = f"selenium_error_{selector.replace(' ', '_').replace('/', '_')}_{ts}.html"
        with open(fname, "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        print(f"Timeout or error for field {selector}: {e}. HTML guardado en {fname}")
        raise

def wait_and_click(driver, by, selector, timeout=20):
    try:
        elem = WebDriverWait(driver, timeout).until(
            EC.element_to_be_clickable((by, selector))
        )
        elem.click()
        return elem
    except Exception as e:
        ts = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        fname = f"selenium_error_{selector.replace(' ', '_').replace('/', '_')}_{ts}.html"
        with open(fname, "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        print(f"Timeout or error for field {selector}: {e}. HTML guardado en {fname}")
        raise

@pytest.fixture(scope="module")
def driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    driver = webdriver.Chrome(options=options)
    yield driver
    driver.quit()

# ======================= PRUEBAS SELENIUM =======================

def test_register_maintenance_full_flow(driver):
    # 1. Login
    driver.get(LOGIN_URL)
    wait_and_send_keys(driver, By.NAME, "email", EMAIL)
    wait_and_send_keys(driver, By.NAME, "password", PASSWORD)
    wait_and_click(driver, By.XPATH, "//button[contains(.,'Iniciar sesión')]")
    WebDriverWait(driver, 15).until(EC.url_contains("/sigma/home"))

    driver.get(MAINTENANCE_URL)

    # CASO 1: Registro exitoso
    wait_and_click(driver, By.XPATH, "//button[span[contains(text(),'Agregar Mantenimiento')]]")
    WebDriverWait(driver, 20).until(
        EC.visibility_of_element_located((By.XPATH, "//input[@placeholder='Ej. Cambio de aceite']"))
    )
    nombre = f"Mantenimiento Selenium {int(time.time())}"
    wait_and_send_keys(driver, By.XPATH, "//input[@placeholder='Ej. Cambio de aceite']", nombre)
    wait_and_send_keys(driver, By.XPATH, "//textarea[@aria-label='Problem description Textarea']", "Prueba automatizada para ver exito o fracaso")
    wait_and_click(driver, By.XPATH, "//select[@aria-label='Maintenance type Select']")
    wait_and_click(driver, By.XPATH, "//select[@aria-label='Maintenance type Select']/option[2]")
    wait_and_click(driver, By.XPATH, "//button[@aria-label='Request Button']")
    try:
        success_modal = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//*[contains(text(),'creado') or contains(text(),'exito') or contains(text(),'registrado') or contains(text(),'Mantenimiento')]" ) )
        )
        assert success_modal.is_displayed()
    except TimeoutException:
        WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, f"//*[contains(text(),'{nombre}')]" ) )
        )
    # Cerrar modal si es necesario (adaptar si hay botón de cerrar)
    try:
        close_btn = driver.find_element(By.XPATH, "//button[contains(@aria-label,'Close') or contains(text(),'Cerrar')]")
        close_btn.click()
    except:
        pass

    # CASO 2: Duplicidad
    wait_and_click(driver, By.XPATH, "//button[span[contains(text(),'Agregar Mantenimiento')]]")
    WebDriverWait(driver, 20).until(
        EC.visibility_of_element_located((By.XPATH, "//input[@placeholder='Ej. Cambio de aceite']"))
    )
    wait_and_send_keys(driver, By.XPATH, "//input[@placeholder='Ej. Cambio de aceite']", nombre)
    wait_and_send_keys(driver, By.XPATH, "//textarea[@aria-label='Problem description Textarea']", "Prueba duplicidad")
    wait_and_click(driver, By.XPATH, "//select[@aria-label='Maintenance type Select']")
    wait_and_click(driver, By.XPATH, "//select[@aria-label='Maintenance type Select']/option[2]")
    wait_and_click(driver, By.XPATH, "//button[@aria-label='Request Button']")
    try:
        error_modal = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//*[contains(text(),'Datos inválidos') or contains(text(),'ya existe') or contains(text(),'mantenimiento')]" ) )
        )
        assert error_modal.is_displayed(), "El modal de error por duplicidad no está visible."
        assert (
            "ya existe" in error_modal.text or "Datos inválidos" in error_modal.text or "mantenimiento" in error_modal.text
        ), f"El mensaje de error por duplicidad no coincide: {error_modal.text}"
    except TimeoutException:
        pytest.fail("No se mostró el mensaje de error esperado para duplicidad de nombre")
    try:
        close_btn = driver.find_element(By.XPATH, "//button[contains(@aria-label,'Close') or contains(text(),'Cerrar')]")
        close_btn.click()
    except:
        pass

    # CASO 3: Longitud
    wait_and_click(driver, By.XPATH, "//button[span[contains(text(),'Agregar Mantenimiento')]]")
    WebDriverWait(driver, 20).until(
        EC.visibility_of_element_located((By.XPATH, "//input[@placeholder='Ej. Cambio de aceite']"))
    )
    nombre_invalido = "X" * 101  # Solo longitud, sin símbolos
    descripcion_invalida = "Y" * 400
    wait_and_send_keys(driver, By.XPATH, "//input[@placeholder='Ej. Cambio de aceite']", nombre_invalido)
    wait_and_send_keys(driver, By.XPATH, "//textarea[@aria-label='Problem description Textarea']", descripcion_invalida)
    wait_and_click(driver, By.XPATH, "//select[@aria-label='Maintenance type Select']")
    wait_and_click(driver, By.XPATH, "//select[@aria-label='Maintenance type Select']/option[2]")
    wait_and_click(driver, By.XPATH, "//button[@aria-label='Request Button']")
    try:
        error_modal = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//*[contains(text(),'no puede exceder') or contains(text(),'Datos inválidos')]" ) )
        )
        assert error_modal.is_displayed(), "El modal de error no está visible."
        assert (
            "no puede exceder" in error_modal.text or "Datos inválidos" in error_modal.text
        ), f"El mensaje de error de longitud no coincide: {error_modal.text}"
    except TimeoutException:
        pytest.fail("No se mostró el mensaje de error esperado para longitud de nombre")
    try:
        close_btn = driver.find_element(By.XPATH, "//button[contains(@aria-label,'Close') or contains(text(),'Cerrar')]")
        close_btn.click()
    except:
        pass

    # CASO 4: Campos obligatorios
    wait_and_click(driver, By.XPATH, "//button[span[contains(text(),'Agregar Mantenimiento')]]")
    WebDriverWait(driver, 20).until(
        EC.visibility_of_element_located((By.XPATH, "//input[@placeholder='Ej. Cambio de aceite']"))
    )
    # No llenar ningún campo
    wait_and_click(driver, By.XPATH, "//button[@aria-label='Request Button']")
    try:
        error_modal = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//div[contains(@class,'bg-red-50') and contains(@class,'border-red-200')]" ) )
        )
        assert error_modal.is_displayed(), "El modal de error por campos obligatorios no está visible."
        assert (
            "obligatorio" in error_modal.text or "requerido" in error_modal.text or "campo" in error_modal.text or len(error_modal.text) > 0
        ), f"El mensaje de error por campos obligatorios no coincide: {error_modal.text}"
    except TimeoutException:
        pytest.fail("No se mostró el mensaje de error esperado para campos obligatorios")
    try:
        close_btn = driver.find_element(By.XPATH, "//button[contains(@aria-label,'Close') or contains(text(),'Cerrar')]")
        close_btn.click()
    except:
        pass
