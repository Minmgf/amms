# Script simple que reproduce PASO A PASO lo que hace el test
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

EMAIL = "u20191179903@usco.edu.co"
PASSWORD = "4L34J4CT4est"
LOGIN_URL = "http://localhost:3000/sigma/login"
SOLICITUDES_URL = "http://localhost:3000/sigma/maintenance/maintenanceRequest"

def test_step_by_step():
    options = webdriver.ChromeOptions()
    options.binary_location = r"C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe"
    options.add_argument("--start-maximized")
    driver = webdriver.Chrome(options=options)
    
    try:
        print("PASO 1: Login...")
        driver.get(LOGIN_URL)
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.NAME, "email"))).send_keys(EMAIL)
        driver.find_element(By.NAME, "password").send_keys(PASSWORD)
        driver.find_element(By.XPATH, "//button[contains(.,'Iniciar sesión')]").click()
        WebDriverWait(driver, 15).until(EC.url_contains("/sigma/home"))
        print("✓ Login OK")

        print("\nPASO 2: Ir a solicitudes...")
        driver.get(SOLICITUDES_URL)
        WebDriverWait(driver, 20).until(EC.visibility_of_element_located((By.XPATH, "//table")))
        print("✓ Tabla cargada")

        print("\nPASO 3: Verificar columnas...")
        columnas = ["Id", "Nombre de Máquina", "Número de Serie", "Solicitante", "Tipo de Mantenimiento", "Fecha de Solicitud", "Prioridad", "Estado"]
        for col in columnas:
            try:
                WebDriverWait(driver, 5).until(EC.visibility_of_element_located((By.XPATH, f"//th[contains(text(),'{col}')]")))
                print(f"  ✓ Columna '{col}' encontrada")
            except:
                print(f"  ✗ Columna '{col}' NO encontrada")
                break
        
        print("\nPASO 4: Verificar botón Detalles...")
        try:
            WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.XPATH, "//tbody/tr[1]//button[text()='Detalles']")))
            print("✓ Botón Detalles OK")
        except Exception as e:
            print(f"✗ Botón Detalles FALLA: {e}")
            return

        print("\nPASO 5: Abrir modal filtros...")
        try:
            driver.find_element(By.XPATH, "//button[text()='Filtrar por']").click()
            time.sleep(2)
            print("✓ Modal filtros abierto")
        except Exception as e:
            print(f"✗ Modal filtros FALLA: {e}")
            return

        print("\nPASO 6: Verificar elementos del modal...")
        try:
            # Buscar cualquier select
            selects = driver.find_elements(By.XPATH, "//select")
            print(f"  Selects encontrados: {len(selects)}")
            
            # Buscar inputs de fecha
            date_inputs = driver.find_elements(By.XPATH, "//input[@type='date']")
            print(f"  Inputs de fecha encontrados: {len(date_inputs)}")
            
            # Buscar botón aplicar/filtrar
            apply_btns = driver.find_elements(By.XPATH, "//button[contains(text(),'Aplicar') or contains(text(),'Filtrar')]")
            print(f"  Botones aplicar/filtrar encontrados: {len(apply_btns)}")
            
            if len(selects) == 0:
                print("✗ NO HAY SELECTORES EN EL MODAL")
                return
            else:
                print("✓ Modal tiene elementos")
                
        except Exception as e:
            print(f"✗ Error verificando modal: {e}")
            return

        print("\nPASO 7: Probar búsqueda...")
        try:
            search_field = driver.find_element(By.XPATH, "//input[@placeholder='Buscar por ID, máquina, solicitante, tipo, estado...']")
            search_field.clear()
            search_field.send_keys("tractor")
            time.sleep(2)
            print("✓ Búsqueda OK")
        except Exception as e:
            print(f"✗ Búsqueda FALLA: {e}")
            return
            
        print("\n🎉 TODOS LOS PASOS COMPLETADOS EXITOSAMENTE")

    except Exception as e:
        print(f"\n💥 ERROR GENERAL: {e}")
        with open("error_debug.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
    
    finally:
        time.sleep(3)
        driver.quit()

if __name__ == "__main__":
    test_step_by_step()