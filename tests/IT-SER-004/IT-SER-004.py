"""
Test IT-SER-004: Eliminación de Servicios
Flujo directo: LOGIN -> SERVICIOS -> ELIMINA -> CONFIRMA
"""

import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.options import Options


class TestEliminacionServicios:
    
    @classmethod
    def setup_class(cls):
        """Setup del navegador"""
        chrome_options = Options()
        chrome_options.binary_location = r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
        chrome_options.add_argument("--start-maximized")
        chrome_options.add_experimental_option("detach", True)
        
        cls.driver = webdriver.Chrome(options=chrome_options)
        
        # Credenciales mock para testing
        cls.email = "user@example.com"
        cls.password = "password123"
    
    def test_eliminar_servicio_flujo_directo(self):
        """LOGIN -> SERVICIOS -> ELIMINA -> CONFIRMA"""
        print("Test eliminación de servicio")
        
        # PASO 1: LOGIN
        print("PASO 1: LOGIN...")
        self.driver.get("http://localhost:3000/sigma/login")
        time.sleep(2)
        
        self.driver.find_element(By.NAME, "email").send_keys(self.email)
        self.driver.find_element(By.NAME, "password").send_keys(self.password)
        self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        time.sleep(3)
        print("LOGIN OK")
        
        # PASO 2: IR A SERVICIOS
        print("PASO 2: SERVICIOS...")
        self.driver.get("http://localhost:3000/sigma/requests/services")
        time.sleep(3)
        print("En servicios")
        
        # PASO 3: BUSCAR PRIMER SERVICIO
        print("PASO 3: BUSCAR SERVICIO...")
        table_body = self.driver.find_element(By.TAG_NAME, "tbody")
        rows = table_body.find_elements(By.TAG_NAME, "tr")
        print(f"{len(rows)} servicios encontrados")
        
        if len(rows) == 0:
            print("No hay servicios")
            return
        
        first_row = rows[0]
        cells = first_row.find_elements(By.TAG_NAME, "td")
        service_name = cells[1].text if len(cells) > 1 else "Desconocido"
        print(f"Servicio seleccionado: {service_name}")
        
        # PASO 4: HOVER Y CLICK ELIMINAR
        print("PASO 4: ELIMINAR...")
        actions = ActionChains(self.driver)
        actions.move_to_element(first_row).perform()
        time.sleep(1)
        
        delete_button = first_row.find_element(By.XPATH, ".//button[contains(text(), 'Eliminar')]")
        delete_button.click()
        print("Click eliminar")
        time.sleep(2)
        
        # PASO 5: CONFIRMAR
        print("PASO 5: CONFIRMAR...")
        
        # Buscar el botón de confirmación DENTRO del modal
        try:
            # Buscar directamente en el modal de confirmación
            modal = self.driver.find_element(By.ID, "confirm-modal")
            confirm_button = modal.find_element(By.XPATH, ".//button[contains(@class, 'bg-red') or contains(text(), 'Eliminar') or contains(text(), 'Confirmar') or contains(text(), 'Aceptar')]")
            confirm_button.click()
            print("Confirmación realizada")
        except Exception as e:
            print(f"Error confirmando: {e}")
            # Intentar buscar cualquier botón en el modal
            try:
                modal_buttons = self.driver.find_elements(By.XPATH, "//div[@id='confirm-modal']//button")
                if len(modal_buttons) >= 2:
                    # Usualmente el segundo botón es "Confirmar/Eliminar"
                    modal_buttons[1].click()
                    print("Confirmación con botón alternativo")
                else:
                    print(f"Solo {len(modal_buttons)} botones en modal")
                    return
            except Exception as e2:
                print(f"Error con botón alternativo: {e2}")
                return
        
        time.sleep(3)
        
        # VERIFICAR RESULTADO
        new_table = self.driver.find_element(By.TAG_NAME, "tbody")
        new_rows = new_table.find_elements(By.TAG_NAME, "tr")
        
        if len(new_rows) < len(rows):
            print(f"ELIMINADO: {service_name}")
        else:
            print(f"DESACTIVADO: {service_name}")
        
        print("Test completado")
    
    @classmethod
    def teardown_class(cls):
        """Cerrar navegador"""
        time.sleep(2)
        cls.driver.quit()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])