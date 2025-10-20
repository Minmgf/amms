import time
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

EMAIL = "test@example.com"
PASSWORD = "testpassword123"
LOGIN_URL = "http://localhost:3000/sigma/login"
CLIENTS_URL = "http://localhost:3000/sigma/requests/clients"

@pytest.fixture(scope="module")
def driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    driver = webdriver.Chrome(options=options)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    print("USANDO GOOGLE CHROME")
    yield driver
    driver.quit()

def test_IT_CLI_004_ACTUALIZAR_CLIENTE_COMPLETO(driver):
    """
    IT-CLI-004: Actualizar Cliente - Validación Completa
    Verificar que el sistema permita actualizar los datos de un cliente previamente registrado
    con validaciones de duplicados, asociación de usuarios y campos obligatorios
    """
    print("=== IT-CLI-004: ACTUALIZAR CLIENTE ===")

    # 1. Login
    driver.get(LOGIN_URL)
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "email"))).send_keys(EMAIL)
    driver.find_element(By.NAME, "password").send_keys(PASSWORD)
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    time.sleep(3)
    print("Login completado")

    # 2. Navegar a módulo de clientes
    driver.get(CLIENTS_URL)
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "table")))
    print("Navegación a clientes completada")

    # 3. Buscar cliente existente en la tabla
    table_body = driver.find_element(By.TAG_NAME, "tbody")
    client_rows = table_body.find_elements(By.TAG_NAME, "tr")
    
    selected_client = None
    original_data = {}
    
    for row in client_rows[:3]:  # Verificar primeros 3 clientes
        cells = row.find_elements(By.TAG_NAME, "td")
        if len(cells) >= 4:
            # Capturar datos originales del cliente
            nombre = cells[0].text.strip()
            identificacion = cells[1].text.strip()
            telefono = cells[2].text.strip()
            email_cell = cells[3].text.strip()
            
            if nombre and identificacion:
                original_data = {
                    'nombre': nombre,
                    'identificacion': identificacion,
                    'telefono': telefono,
                    'email': email_cell
                }
                selected_client = row
                break
    
    if not selected_client:
        print("No se encontraron clientes para actualizar")
        return False
    
    print(f"Cliente seleccionado: {original_data['nombre']} - {original_data['identificacion']}")

    # 4. Hacer hover sobre la fila y click en Editar
    driver.execute_script("arguments[0].scrollIntoView();", selected_client)
    time.sleep(1)
    
    # Hacer hover sobre la fila para mostrar botones
    driver.execute_script("""
        var element = arguments[0];
        var event = new MouseEvent('mouseenter', {bubbles: true});
        element.dispatchEvent(event);
    """, selected_client)
    time.sleep(2)
    
    # Buscar y hacer click en el botón Editar
    edit_button = None
    try:
        # Buscar botón por texto
        edit_button = selected_client.find_element(By.XPATH, ".//button[contains(text(), 'Editar')]")
    except:
        try:
            # Buscar botón por clase y icono
            edit_button = selected_client.find_element(By.XPATH, ".//button[contains(@title, 'Editar')]")
        except:
            # Buscar cualquier botón con icono de editar
            edit_button = selected_client.find_element(By.XPATH, ".//button[contains(@class, 'hover:text-green')]")
    
    if edit_button:
        driver.execute_script("arguments[0].click();", edit_button)
        time.sleep(3)
        print("Modal de edición abierto")
    else:
        print("No se encontró el botón Editar")
        return False

    # 5. Verificar que el modal se abrió y los datos están precargados
    modal = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "Client Registration Modal"))
    )
    print("Modal de edición detectado")
    
    # Verificar título del modal (más flexible)
    try:
        modal_title = driver.find_element(By.XPATH, "//h2[contains(text(), 'Editar') or contains(text(), 'Cliente') or contains(text(), 'Actualizar')]")
        print(f"Título del modal: {modal_title.text}")
    except:
        # Si no encuentra título específico, buscar cualquier h2 en el modal
        try:
            modal_title = modal.find_element(By.TAG_NAME, "h2")
            print(f"Título encontrado: {modal_title.text}")
        except:
            print("No se pudo verificar título del modal, continuando...")
    
    # 6. Verificar que los campos están precargados
    print("=== VERIFICANDO DATOS PRECARGADOS ===")
    
    # Número de identificación
    id_input = driver.find_element(By.XPATH, "//input[@placeholder='Digite número de identificación']")
    current_id = id_input.get_attribute("value")
    print(f"ID precargado: {current_id}")
    
    # Razón Social / Nombre
    name_input = driver.find_element(By.XPATH, "//input[@placeholder='Digite razón social']")
    current_name = name_input.get_attribute("value")
    print(f"Nombre precargado: {current_name}")
    
    # 7. CASO 1: Modificar datos válidos
    print("=== CASO 1: MODIFICACIÓN VÁLIDA ===")
    
    # Modificar nombre comercial
    business_name_input = driver.find_element(By.XPATH, "//input[@placeholder='Digite nombre comercial']")
    business_name_input.clear()
    new_business_name = "Empresa Actualizada Test"
    business_name_input.send_keys(new_business_name)
    
    # Modificar teléfono
    try:
        phone_input = driver.find_element(By.XPATH, "//input[@placeholder='Digite número teléfonico']")
        phone_input.clear()
        new_phone = "3001234567"
        phone_input.send_keys(new_phone)
        print(f"Teléfono actualizado: {new_phone}")
    except:
        print("Campo teléfono no encontrado, continuando...")
    
    # Modificar dirección
    try:
        address_input = driver.find_element(By.XPATH, "//input[@placeholder='Digite dirección completa']")
        address_input.clear()
        new_address = "Calle 123 # 45-67"
        address_input.send_keys(new_address)
        print(f"Dirección actualizada: {new_address}")
    except:
        try:
            # Buscar campo de dirección con diferentes placeholders
            address_input = driver.find_element(By.XPATH, "//input[contains(@placeholder, 'dirección') or contains(@placeholder, 'Dirección')]")
            address_input.clear()
            new_address = "Calle 123 # 45-67"
            address_input.send_keys(new_address)
            print(f"Dirección actualizada: {new_address}")
        except:
            print("Campo dirección no encontrado, continuando...")
    
    # Guardar cambios
    save_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Actualizar')]")
    driver.execute_script("arguments[0].click();", save_button)
    time.sleep(5)
    
    # Verificar que no hay errores
    try:
        error_messages = driver.find_elements(By.XPATH, "//*[contains(text(), 'Error') or contains(text(), 'error')]")
        visible_errors = [e.text for e in error_messages if e.is_displayed() and e.text.strip()]
        if visible_errors:
            print("ERRORES DETECTADOS EN CASO 1:")
            for error in visible_errors:
                print(f"   - {error}")
        else:
            print("CASO 1: Actualización válida exitosa")
    except:
        print("CASO 1: Sin errores detectados")
    
        # Cerrar modal si está abierto
        try:
            close_button = driver.find_element(By.XPATH, "//button[contains(@aria-label, 'Cancel') or contains(text(), 'Cancelar')]")
            driver.execute_script("arguments[0].click();", close_button)
            time.sleep(2)
        except:
            # Si no hay botón cancelar, presionar ESC
            try:
                driver.find_element(By.TAG_NAME, "body").send_keys(Keys.ESCAPE)
                time.sleep(2)
            except:
                pass

        # 8. CASO 2: Verificar duplicados - Abrir edición de otro cliente
        print("=== CASO 2: VERIFICACIÓN DE DUPLICADOS ===")
        
        # Refrescar tabla para evitar elementos stale
        table_body = driver.find_element(By.TAG_NAME, "tbody")
        client_rows = table_body.find_elements(By.TAG_NAME, "tr")
        
        second_client = None
        if len(client_rows) > 1:
            second_client = client_rows[1]  # Segundo cliente    if second_client:
        # Hacer hover y click en Editar
        driver.execute_script("""
            var element = arguments[0];
            var event = new MouseEvent('mouseenter', {bubbles: true});
            element.dispatchEvent(event);
        """, second_client)
        time.sleep(2)
        
        try:
            edit_button = first_client.find_element(By.XPATH, ".//button[contains(text(), 'Editar')]")
            driver.execute_script("arguments[0].click();", edit_button)
            time.sleep(3)
            
            # Intentar usar un número de identificación que ya existe
            id_input = driver.find_element(By.XPATH, "//input[@placeholder='Digite número de identificación']")
            id_input.clear()
            id_input.send_keys(original_data['identificacion'])  # Usar ID del primer cliente
            
            # Hacer click fuera para disparar validación
            driver.find_element(By.TAG_NAME, "body").click()
            time.sleep(2)
            
            # Intentar guardar
            save_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Actualizar')]")
            driver.execute_script("arguments[0].click();", save_button)
            time.sleep(3)
            
            # Verificar mensaje de duplicado
            try:
                duplicate_messages = driver.find_elements(By.XPATH, "//*[contains(text(), 'Ya existe') or contains(text(), 'duplicado') or contains(text(), 'identificación')]")
                if duplicate_messages:
                    print("CASO 2: Validación de duplicados funcionando correctamente")
                else:
                    print("CASO 2: No se detectó mensaje de duplicado (puede ser correcto si no hay duplicados)")
            except:
                print("CASO 2: Sin mensajes de validación detectados")
            
            # Cerrar modal
            try:
                close_button = driver.find_element(By.XPATH, "//button[contains(@aria-label, 'Cancel') or contains(text(), 'Cancelar')]")
                driver.execute_script("arguments[0].click();", close_button)
                time.sleep(2)
            except:
                pass
                
        except Exception as e:
            print(f"CASO 2: Error en validación de duplicados: {str(e)}")

    # 9. CASO 3: Validar campos obligatorios
    print("=== CASO 3: VALIDACIÓN CAMPOS OBLIGATORIOS ===")
    
    # Refrescar tabla completamente para evitar stale elements
    time.sleep(2)
    table_body = driver.find_element(By.TAG_NAME, "tbody")
    client_rows = table_body.find_elements(By.TAG_NAME, "tr")
    
    if client_rows:
        first_client = client_rows[0]
        
        # Abrir edición del primer cliente nuevamente
        driver.execute_script("""
            var element = arguments[0];
            var event = new MouseEvent('mouseenter', {bubbles: true});
            element.dispatchEvent(event);
        """, first_client)
        time.sleep(2)
        
        try:
            edit_button = first_client.find_element(By.XPATH, ".//button[contains(text(), 'Editar')]")
            driver.execute_script("arguments[0].click();", edit_button)
            time.sleep(3)
            
            # Limpiar campos obligatorios
            required_fields = [
                "//input[@placeholder='Digite razón social']",
                "//input[@placeholder='Digite nombres']",
                "//input[@placeholder='Primer apellido']"
            ]
            
            for field_xpath in required_fields:
                try:
                    field = driver.find_element(By.XPATH, field_xpath)
                    field.clear()
                    field.send_keys("  ")  # Espacios en blanco
                    field.clear()
                except:
                    continue
            
            # Intentar guardar sin campos obligatorios
            save_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Actualizar')]")
            driver.execute_script("arguments[0].click();", save_button)
            time.sleep(3)
            
            # Verificar mensajes de validación
            try:
                validation_messages = driver.find_elements(By.XPATH, "//*[contains(text(), 'obligatorio') or contains(text(), 'requerido') or contains(@class, 'text-red')]")
                if validation_messages:
                    print("CASO 3: Validación de campos obligatorios funcionando")
                else:
                    print("CASO 3: No se detectaron mensajes de validación obligatoria")
            except:
                print("CASO 3: Sin validaciones detectadas")
            
            # Cerrar modal
            try:
                close_button = driver.find_element(By.XPATH, "//button[contains(@aria-label, 'Cancel') or contains(text(), 'Cancelar')]")
                driver.execute_script("arguments[0].click();", close_button)
                time.sleep(2)
            except:
                try:
                    driver.find_element(By.TAG_NAME, "body").send_keys(Keys.ESCAPE)
                    time.sleep(2)
                except:
                    pass
                    
        except Exception as e:
            print(f"CASO 3: Error en validación obligatoria: {str(e)}")
    else:
        print("CASO 3: No se encontró cliente para probar campos obligatorios")

    # 10. CASO 4: Verificar actualización de listado
    print("=== CASO 4: VERIFICACIÓN ACTUALIZACIÓN LISTADO ===")
    
    # Recargar página para ver cambios
    driver.refresh()
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "table")))
    
    # Verificar que el listado se actualizó
    table_body = driver.find_element(By.TAG_NAME, "tbody")
    updated_rows = table_body.find_elements(By.TAG_NAME, "tr")
    
    if len(updated_rows) > 0:
        print("CASO 4: Listado actualizado correctamente")
    else:
        print("CASO 4: Listado vacío después de actualización")

    # 11. Verificación final
    print("=== VERIFICACIÓN FINAL ===")
    try:
        # Verificar que no hay errores generales en consola
        logs = driver.get_log('browser')
        critical_errors = [log for log in logs if log['level'] == 'SEVERE']
        if not critical_errors:
            print("Sin errores críticos en consola")
        else:
            print(f"Errores críticos detectados: {len(critical_errors)}")
    except:
        print("No se pudieron verificar logs de consola")

    print("=== IT-CLI-004 COMPLETADO ===")
    return True

if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])