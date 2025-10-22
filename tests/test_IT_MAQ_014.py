import time
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import datetime

EMAIL = "u20191179903@usco.edu.co"
PASSWORD = "4L34J4CT4est"
LOGIN_URL = "http://localhost:3000/sigma/login"
MAQUINARIA_URL = "http://localhost:3000/sigma/machinery/maintenance"  # Ajusta si la URL es diferente

# Helpers

def wait_and_send_keys(driver, by, selector, value, timeout=20):
    elem = WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located((by, selector))
    )
    WebDriverWait(driver, timeout).until(
        EC.element_to_be_clickable((by, selector))
    )
    elem.clear()
    elem.send_keys(value)
    return elem

def wait_and_click(driver, by, selector, timeout=20):
    elem = WebDriverWait(driver, timeout).until(
        EC.element_to_be_clickable((by, selector))
    )
    elem.click()
    return elem

@pytest.fixture(scope="module")
def driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    driver = webdriver.Chrome(options=options)
    yield driver
    driver.quit()

# Test principal

def test_update_periodic_maintenance_full_flow(driver):
    # Arrange: Login y navegar a edición de maquinaria
    driver.get(LOGIN_URL)
    wait_and_send_keys(driver, By.NAME, "email", EMAIL)
    wait_and_send_keys(driver, By.NAME, "password", PASSWORD)
    wait_and_click(driver, By.XPATH, "//button[contains(.,'Iniciar sesión')]")
    WebDriverWait(driver, 15).until(EC.url_contains("/sigma/home"))

    driver.get(MAQUINARIA_URL)
    # Seleccionar maquinaria (ajusta selector según la tabla/lista)
    wait_and_click(driver, By.XPATH, "//tr[1]//button[contains(@aria-label,'Editar')]" )
    # Avanzar al paso 5 del modal multipaso
    for _ in range(4):
        wait_and_click(driver, By.XPATH, "//button[contains(.,'Siguiente')]")
        time.sleep(1)
    WebDriverWait(driver, 20).until(
        EC.visibility_of_element_located((By.XPATH, "//h2[contains(text(),'Mantenimientos Periódicos')]") )
    )

    # Act: Editar valores y justificar
    # Precargar y modificar mantenimiento, horas de uso, distancia recorrida
    wait_and_click(driver, By.XPATH, "//select[@aria-label='Maintenance Select']")
    wait_and_click(driver, By.XPATH, "//select[@aria-label='Maintenance Select']/option[2]")
    wait_and_send_keys(driver, By.XPATH, "//input[@aria-label='Horas de uso']", "150")
    wait_and_send_keys(driver, By.XPATH, "//input[@aria-label='Distancia recorrida']", "600")
    wait_and_send_keys(driver, By.XPATH, "//textarea[@aria-label='Justificación']", "Actualización por cambio de condiciones de uso")
    wait_and_click(driver, By.XPATH, "//button[contains(.,'Guardar')]")

    # Assert: Validar confirmación y errores
    try:
        confirm_modal = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//*[contains(text(),'actualizado') or contains(text(),'confirmación') or contains(text(),'exito')]") )
        )
        assert confirm_modal.is_displayed(), "No se mostró el mensaje de confirmación."
    except TimeoutException:
        pytest.fail("No se mostró el mensaje de confirmación tras actualizar mantenimiento.")

    # Intentar guardar con datos inválidos (horas negativas)
    wait_and_send_keys(driver, By.XPATH, "//input[@aria-label='Horas de uso']", "-10")
    wait_and_click(driver, By.XPATH, "//button[contains(.,'Guardar')]")
    try:
        error_modal = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//*[contains(text(),'no puede ser negativo') or contains(text(),'inválido')]") )
        )
        assert error_modal.is_displayed(), "No se mostró el mensaje de error por valor negativo."
    except TimeoutException:
        pytest.fail("No se mostró el mensaje de error por horas de uso negativas.")

    # Intentar guardar sin justificación
    wait_and_send_keys(driver, By.XPATH, "//textarea[@aria-label='Justificación']", "")
    wait_and_click(driver, By.XPATH, "//button[contains(.,'Guardar')]")
    try:
        error_modal = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//*[contains(text(),'justificación es obligatoria') or contains(text(),'campo obligatorio')]") )
        )
        assert error_modal.is_displayed(), "No se mostró el mensaje de error por falta de justificación."
    except TimeoutException:
        pytest.fail("No se mostró el mensaje de error por justificación obligatoria.")

    # Intentar guardar mantenimiento duplicado
    # (Simula seleccionando el mismo mantenimiento ya registrado)
    wait_and_click(driver, By.XPATH, "//select[@aria-label='Maintenance Select']")
    wait_and_click(driver, By.XPATH, "//select[@aria-label='Maintenance Select']/option[1]")
    wait_and_click(driver, By.XPATH, "//button[contains(.,'Guardar')]")
    try:
        error_modal = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//*[contains(text(),'duplicado') or contains(text(),'ya existe')]") )
        )
        assert error_modal.is_displayed(), "No se mostró el mensaje de error por mantenimiento duplicado."
    except TimeoutException:
        pytest.fail("No se mostró el mensaje de error por mantenimiento duplicado.")

    # Validar que se puede avanzar al siguiente paso si todo es correcto
    wait_and_click(driver, By.XPATH, "//button[contains(.,'Siguiente')]")
    try:
        next_step = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//h2[contains(text(),'Documentación')]") )
        )
        assert next_step.is_displayed(), "No se avanzó al siguiente paso (Documentación)."
    except TimeoutException:
        pytest.fail("No se avanzó al siguiente paso tras actualizar mantenimiento.")
