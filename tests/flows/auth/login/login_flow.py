import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException, WebDriverException
from dotenv import load_dotenv

load_dotenv()
EMAIL = os.getenv('EMAIL')
PASSWORD = os.getenv('PASSWORD')
HEADLESS = os.getenv('HEADLESS', 'False').lower() == 'true'

LOGIN_URL = "http://localhost:3000/sigma/login"  # Cambiar la URL si es diferente

class LoginFlow:
    def __init__(self, driver_path):
        self.driver_path = driver_path
        self.driver = None

    def start_browser(self):
        try:
            service = ChromeService(executable_path=self.driver_path)
            
            # Configurar opciones de Chrome
            chrome_options = ChromeOptions()
            
            # Configurar headless según variable de entorno
            if HEADLESS:
                chrome_options.add_argument("--headless")
            
            # Configuraciones para mejor estabilidad y resolución
            chrome_options.add_argument("--start-maximized")  # Ventana maximizada
            chrome_options.add_argument("--window-size=1920,1080")  # Resolución fija como respaldo
            chrome_options.add_argument("--disable-web-security")
            chrome_options.add_argument("--disable-features=VizDisplayCompositor")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-gpu")
            
            # Crear driver con opciones
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            
            # Asegurar ventana maximizada (doble verificación)
            if not HEADLESS:
                self.driver.maximize_window()
            
        except WebDriverException as e:
            print(f"Error iniciando el navegador: {e}")
            raise

    def login(self, email=EMAIL, password=PASSWORD):
        try:
            self.driver.get(LOGIN_URL)
            wait = WebDriverWait(self.driver, 10)
            
            # Buscar campos de login
            email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
            password_input = self.driver.find_element(By.NAME, "password")
            
            # Llenar y enviar formulario
            email_input.clear()
            email_input.send_keys(email)
            password_input.clear()
            password_input.send_keys(password)
            password_input.send_keys(Keys.RETURN)
            
            # Esperar procesamiento
            time.sleep(2)
            
        except Exception as e:
            raise Exception(f"Login falló: {e}")

    def is_logged_in(self):
        try:
            wait = WebDriverWait(self.driver, 5)
            
            # Verificar elemento que confirme login exitoso
            success_selectors = [
                (By.PARTIAL_LINK_TEXT, "Home"),
                (By.CSS_SELECTOR, "nav"),
                (By.ID, "dashboard")
            ]
            
            for by, selector in success_selectors:
                try:
                    wait.until(EC.presence_of_element_located((by, selector)))
                    return True
                except TimeoutException:
                    continue
            
            # Verificar cambio de URL como último recurso
            return self.driver.current_url != LOGIN_URL and "login" not in self.driver.current_url.lower()
            
        except Exception:
            return False

    def close_browser(self):
        if self.driver:
            self.driver.quit()

if __name__ == "__main__":
    DRIVER_PATH = "./chromedriver/driver.exe"
    flow = LoginFlow(DRIVER_PATH)
    try:
        flow.start_browser()
        flow.login()
        success = flow.is_logged_in()
        print("Login exitoso." if success else "Login fallido.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        flow.close_browser()
