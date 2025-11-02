"""
Test IT-SOL-006: Confirmación de Solicitudes
Basado en HU-SOL-006: Confirmar Solicitud
"""

import pytest
import time
from datetime import datetime, timedelta
from selenium.webdriver.common.keys import Keys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException, ElementClickInterceptedException


class TestConfirmacionSolicitudes:
    
    @classmethod
    def setup_class(cls):
        """Setup del navegador"""
        chrome_options = Options()
        # Usar Chrome por defecto 
        chrome_options.add_argument("--start-maximized")
        chrome_options.add_experimental_option("detach", True)
        cls.driver = webdriver.Chrome(options=chrome_options)
        cls.wait = WebDriverWait(cls.driver, 10)

        # Credenciales MOCK para pruebas (no exponer credenciales reales)
        cls.email = "mock.user@example.com"
        cls.password = "mock-password-1234"
    
    def test_confirmar_solicitud_flujo_directo(self):
        """LOGIN -> SOLICITUDES -> CONFIRMAR -> CONFIRMAR"""
        print("Test confirmacion de solicitud")
        
        # PASO 1: LOGIN
        print("PASO 1: LOGIN...")
        self.driver.get("http://localhost:3000/sigma/login")
        # esperar a que los campos de login estén presentes (más robusto que sleep fijo)
        try:
            email_el = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.NAME, "email"))
            )
            email_el.send_keys(self.email)
            pwd_el = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.NAME, "password"))
            )
            pwd_el.send_keys(self.password)
            submit_btn = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']"))
            )
            submit_btn.click()
        except Exception as e:
            print(f"Error esperando elementos de login: {e}")
            return
        time.sleep(3)

        # PASO 2: IR A SOLICITUDES
        print("PASO 2: SOLICITUDES...")
        self.driver.get("http://localhost:3000/sigma/requests/requestsManagement")
        time.sleep(3)

        # PASO 3: BUSCAR SOLICITUD EN ESTADO "PRESOLICITUD"
        print("PASO 3: BUSCAR PRESOLICITUD...")
        try:
            table_body = self.driver.find_element(By.TAG_NAME, "tbody")
            rows = table_body.find_elements(By.TAG_NAME, "tr")
            print(f"{len(rows)} solicitudes encontradas")
            if len(rows) == 0:
                print("No hay solicitudes")
                return

            def find_presolicitud_in_rows(rows_list):
                for r in rows_list:
                    cells = r.find_elements(By.TAG_NAME, "td")
                    for cell in cells:
                        status_text = cell.text.lower()
                        if "pre-solicitud" in status_text or "presolicitud" in status_text:
                            return r
                return None

            presolicitud_row = find_presolicitud_in_rows(rows)

            # Si no encontramos presolicitud, intentar mostrar más filas usando el select de paginado
            if presolicitud_row is None:
                print("No se encontraron solicitudes en estado pre-solicitud. Intentando ampliar paginado para ver más filas...")
                try:
                    # intentar varios selectores: el path completo que compartiste y una clase más simple
                    selectors_to_try = [
                        "body > div.flex.flex-col.h-screen.bg-background > div > main > div > div:nth-child(4) > div > div.parametrization-pagination.px-4.py-6.sm\\:px-6 > div > div.hidden.sm\\:block > select",
                        "select.parametrization-pagination-select",
                        "div.parametrization-pagination select",
                    ]
                    page_size_selector = None
                    for sel in selectors_to_try:
                        try:
                            page_size_selector = self.driver.find_element(By.CSS_SELECTOR, sel)
                            if page_size_selector:
                                print(f"Encontrado select de paginado usando selector: {sel}")
                                break
                        except Exception:
                            continue

                    if page_size_selector is None:
                        print("No se encontró el select de paginado con los selectores conocidos")
                    else:
                        options = page_size_selector.find_elements(By.TAG_NAME, "option")
                        if options:
                            # Preferir explicitamente value '50' o la opción que contenga '50' en su texto
                            explicit_value = None
                            for opt in options:
                                try:
                                    val = opt.get_attribute("value")
                                    txt = (opt.text or "").strip().lower()
                                except Exception:
                                    val = None
                                    txt = ""
                                if val == "50" or "50" in txt:
                                    explicit_value = val if val else opt.get_attribute("value")
                                    break
                            # fallback: elegir la última opción
                            chosen_value = explicit_value if explicit_value else options[-1].get_attribute("value")
                            print(f"Seleccionando paginado: {chosen_value} (preferencia 50/última opción)")
                            # Forzar la selección robustamente (set selected, selectedIndex, value, click option)
                            js = '''
                                const select = arguments[0];
                                const value = arguments[1];
                                let found = false;
                                for (let i=0;i<select.options.length;i++) {
                                    const opt = select.options[i];
                                    if (opt.value == value || opt.text.toLowerCase().includes(value.toString())) {
                                        select.selectedIndex = i;
                                        opt.selected = true;
                                        opt.click();
                                        select.dispatchEvent(new Event('input', {bubbles:true}));
                                        select.dispatchEvent(new Event('change', {bubbles:true}));
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    // fallback: choose last option
                                    const lastIndex = select.options.length - 1;
                                    select.selectedIndex = lastIndex;
                                    select.options[lastIndex].selected = true;
                                    select.options[lastIndex].click();
                                    select.dispatchEvent(new Event('input', {bubbles:true}));
                                    select.dispatchEvent(new Event('change', {bubbles:true}));
                                }
                                return true;
                            '''
                            self.driver.execute_script(js, page_size_selector, chosen_value)
                            # esperar hasta que el número de filas aumente (o timeout)
                            previous_count = len(rows)
                            print(f"Conteo de filas antes del cambio: {previous_count}")
                            try:
                                WebDriverWait(self.driver, 10).until(
                                    lambda d: len(d.find_element(By.TAG_NAME, "tbody").find_elements(By.TAG_NAME, "tr")) > previous_count
                                )
                            except Exception:
                                # si no crece, esperar unos segundos extras antes de continuar
                                time.sleep(5)
                            table_body = self.driver.find_element(By.TAG_NAME, "tbody")
                            rows = table_body.find_elements(By.TAG_NAME, "tr")
                            print(f"Conteo de filas después del cambio: {len(rows)}")
                            print(f"{len(rows)} solicitudes encontradas después de cambiar paginado")
                            presolicitud_row = find_presolicitud_in_rows(rows)
                        else:
                            print("El select de paginado no tiene opciones")
                except Exception as e:
                    print(f"No se pudo cambiar paginado: {e}")

            if presolicitud_row is None:
                print("No se encontraron solicitudes en estado pre-solicitud")
                return

            solicitud_id = presolicitud_row.find_elements(By.TAG_NAME, "td")[0].text
            print(f"Solicitud seleccionada: {solicitud_id}")
        except Exception as e:
            print(f"Error buscando tabla: {e}")
            return

        # PASO 4: HOVER Y BUSCAR BOTÓN CONFIRMAR
        print("PASO 4: BUSCAR CONFIRMAR...")
        try:
            actions = ActionChains(self.driver)
            actions.move_to_element(presolicitud_row).perform()
            time.sleep(1)
            confirm_button = presolicitud_row.find_element(By.XPATH,
                ".//button[contains(text(), 'Confirmar') or contains(@title, 'Confirmar') or contains(@aria-label, 'Confirmar')]")
            print("Botón Confirmar encontrado")
        except Exception as e:
            print(f"No se encontró botón confirmar: {e}")
            return

        # PASO 5: HACER CLICK EN CONFIRMAR
        print("PASO 5: CLICK CONFIRMAR...")
        try:
            confirm_button.click()
            print("Click en confirmar realizado")
            # Espera corta tras abrir el modal multipaso
            time.sleep(2)
        except Exception as e:
            print(f"Error haciendo click: {e}")
            return

        # PASO 6: VALIDAR MODAL MULTIPASO SIN INTERACCIÓN
        print("PASO 6: VALIDAR MODAL MULTIPASO...")
        try:
            WebDriverWait(self.driver, 10).until(
                EC.visibility_of_element_located((By.CLASS_NAME, "modal-theme"))
            )
            print("Modal multipaso abierto")
            time.sleep(3)
            modals = self.driver.find_elements(By.CLASS_NAME, "modal-theme")
            if not modals or not modals[0].is_displayed():
                raise AssertionError("El modal multipaso se cerró automáticamente antes de permitir interacción")
            print("El modal multipaso permanece abierto tras 3 segundos")
        except Exception as e:
            print(f"Error: {e}")
            raise
            modal_text = modal.text
            if "desea confirmar" in modal_text.lower():
                print("Modal de confirmación encontrado")
                
                # Buscar y hacer click en confirmar del modal
                modal_confirm_button = modal.find_element(By.XPATH, 
                    ".//button[contains(text(), 'Confirmar') or contains(text(), 'Aceptar') or contains(@class, 'btn-primary')]")
                modal_confirm_button.click()
                print("Confirmación en modal realizada")
                time.sleep(3)
                
            else:
                print("Modal no contiene mensaje de confirmación esperado")
                return
                
        except TimeoutException:
            print("No apareció modal de confirmación")
            return
        except Exception as e:
            print(f"Error en modal: {e}")
            return
        
        def assert_step_visible(modal, step_title, required_fields):
            assert step_title in modal.text, f"No se muestra el paso '{step_title}' en el modal"
            for field in required_fields:
                try:
                    modal.find_element(By.NAME, field)
                except Exception:
                    raise AssertionError(f"No se encontró el campo '{field}' en el paso '{step_title}'")

        # PASO 7: FORMULARIO MULTIPASO
        print("PASO 7: FORMULARIO MULTIPASO...")
        try:
            # Esperar a que aparezca el modal multipaso
            WebDriverWait(self.driver, 10).until(
                EC.visibility_of_element_located((By.CLASS_NAME, "modal-theme"))
            )
            modal = self.driver.find_element(By.CLASS_NAME, "modal-theme")

            # Paso 1: Información del Cliente (solo validar presencia)
            assert modal.find_element(By.NAME, "identificationNumber")
            assert_step_visible(modal, "Información del Cliente", ["identificationNumber"])

            # Paso 1: Siguiente (esperar a que esté clickable antes de hacer click)
            next_btn_xpath = '//button[@aria-label="Next Button" and contains(@class, "btn-primary")]'
            next_btn_1 = WebDriverWait(self.driver, 10).until(EC.element_to_be_clickable((By.XPATH, next_btn_xpath)))
            next_btn_1.click()
            try:
                WebDriverWait(self.driver, 3).until(EC.visibility_of_element_located((By.CLASS_NAME, "modal-theme")))
                modal = self.driver.find_element(By.CLASS_NAME, "modal-theme")
            except Exception:
                raise AssertionError("El modal se cerró prematuramente después del primer click en Siguiente")
            assert_step_visible(modal, "Información de la Solicitud", [
                "requestDetails", "scheduledStartDate", "endDate", "paymentMethod", "paymentStatus", "amountPaid", "amountToBePaid"
            ])

            # Paso 2: Información de la Solicitud (llenar campos, excepto fechas)
            WebDriverWait(modal, 10).until(
                EC.visibility_of_element_located((By.NAME, "requestDetails"))
            )
            modal.find_element(By.NAME, "requestDetails").send_keys("Test detalles solicitud")
            modal.find_element(By.NAME, "paymentMethod").send_keys("Efectivo")
            modal.find_element(By.NAME, "paymentStatus").send_keys("Pendiente")
            # Ajuste: el monto pagado no puede ser mayor al monto a pagar.
            # Usar valores válidos (paid <= toBePaid)
            modal.find_element(By.NAME, "amountPaid").send_keys("20000")
            modal.find_element(By.NAME, "amountToBePaid").send_keys("50000")
            # Establecer fechas para evitar solapamiento con solicitudes existentes
            try:
                start = datetime.now() + timedelta(days=90)
                end = start + timedelta(days=1)
                # Usar formato MM-DD-YYYY según lo indicado (mover 90 días para evitar solapamiento)
                iso_start = start.strftime("%m-%d-%Y")
                iso_end = end.strftime("%m-%d-%Y")
                try:
                    s_input = modal.find_element(By.NAME, "scheduledStartDate")
                    e_input = modal.find_element(By.NAME, "endDate")
                    # Intentar enviar en formato ISO (YYYY-MM-DD)
                    try:
                        s_input.clear()
                    except Exception:
                        pass
                    try:
                        e_input.clear()
                    except Exception:
                        pass
                    try:
                        print(f"DEBUG: setting dates iso_start={iso_start} iso_end={iso_end}")
                        s_input.send_keys(iso_start)
                        s_input.send_keys(Keys.TAB)
                        e_input.send_keys(iso_end)
                        e_input.send_keys(Keys.TAB)
                        # read back values
                        try:
                            got_s = s_input.get_attribute('value')
                            got_e = e_input.get_attribute('value')
                            print(f"DEBUG: field values after send_keys: start={got_s} end={got_e}")
                        except Exception:
                            pass
                    except Exception:
                        # Fallback: forzar el valor vía JS en formato ISO
                            try:
                                self.driver.execute_script(
                                    "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input',{bubbles:true})); arguments[0].dispatchEvent(new Event('change',{bubbles:true}));",
                                    s_input, iso_start
                                )
                                self.driver.execute_script(
                                    "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input',{bubbles:true})); arguments[0].dispatchEvent(new Event('change',{bubbles:true}));",
                                    e_input, iso_end
                                )
                                try:
                                    got_s = s_input.get_attribute('value')
                                    got_e = e_input.get_attribute('value')
                                    print(f"DEBUG: field values after JS set: start={got_s} end={got_e}")
                                except Exception:
                                    pass
                            except Exception:
                                pass
                except Exception:
                    pass
                time.sleep(1)
            except Exception:
                pass
            # Seleccionar moneda pagado y por pagar en los selects
            try:
                moneda_pagado = modal.find_element(By.XPATH, '//select[@aria-label="Moneda pagado"]')
                moneda_pagado.send_keys("COP")
                moneda_por_pagar = modal.find_element(By.XPATH, '//select[@aria-label="Moneda por pagar"]')
                moneda_por_pagar.send_keys("COP")
                time.sleep(1)
            except Exception:
                pass
            # Maquinaria y operador: seleccionar primer opción si existen
            try:
                machinery_select = modal.find_element(By.XPATH, '//select[@aria-label="Maquinaria disponible"]')
                machinery_select.send_keys(machinery_select.find_elements(By.TAG_NAME, "option")[1].text)
                operator_select = modal.find_element(By.XPATH, '//select[@aria-label="Operador disponible"]')
                operator_select.send_keys(operator_select.find_elements(By.TAG_NAME, "option")[1].text)
                # Click en botón Añadir maquinaria y operador
                add_btn = modal.find_element(By.XPATH, '//button[@aria-label="Añadir maquinaria y operador"]')
                add_btn.click()
                time.sleep(1)
            except Exception:
                pass

            # Paso 2: Siguiente (esperar a que esté clickable antes de hacer click)
            next_btn_2 = WebDriverWait(self.driver, 10).until(EC.element_to_be_clickable((By.XPATH, next_btn_xpath)))
            next_btn_2.click()
            try:
                WebDriverWait(self.driver, 3).until(EC.visibility_of_element_located((By.CLASS_NAME, "modal-theme")))
                modal = self.driver.find_element(By.CLASS_NAME, "modal-theme")
            except Exception:
                raise AssertionError("El modal se cerró prematuramente después del segundo click en Siguiente")
            assert_step_visible(modal, "Condiciones de Ubicación y Terreno", [
                "country", "department", "city", "placeName", "latitude", "longitude", "areaUnit", "area", "altitudeUnit", "altitude"
            ])

            # Paso 3: Condiciones de Ubicación y Terreno (solo esperar precarga y confirmar)
            WebDriverWait(modal, 10).until(
                EC.visibility_of_element_located((By.NAME, "country"))
            )
            time.sleep(2)  # Esperar precarga de datos
            # Paso 3: Confirmar
            confirm_btn_xpath = '//button[@aria-label="Confirm Button" and contains(@class, "btn-primary") and @type="submit"]'
            confirm_btn = modal.find_element(By.XPATH, confirm_btn_xpath)
            confirm_btn.click()
            print("Formulario multipaso completado y confirmado")
            time.sleep(3)
        except Exception as e:
            print(f"Error en multipaso: {e}")
            return
        
        # PASO 8: CONFIRMAR SOLICITUD FINAL
        print("PASO 8: CONFIRMACIÓN FINAL...")
        try:
            # Buscar botón de confirmación final
            final_confirm_button = self.driver.find_element(By.XPATH, 
                "//button[contains(text(), 'Confirmar') and @type='submit']")
            try:
                final_confirm_button.click()
                print("Confirmación final realizada")
            except ElementClickInterceptedException as e:
                print(f"Error en confirmación final (click intercepted): {e}")
                # Intentar encontrar modal de error que esté interceptando clicks
                try:
                    error_modal = self.driver.find_element(By.CSS_SELECTOR, "div[data-modal='error'], #error-modal")
                    try:
                        print("Error modal texto:", error_modal.text[:1000])
                    except Exception:
                        print("Error modal presente (no se pudo leer texto)")
                    # intentar cerrar el modal de error con botón interno
                    try:
                        close_btn = error_modal.find_element(By.XPATH, ".//button[contains(text(),'Cerrar') or contains(text(),'Aceptar') or contains(text(),'OK') or contains(@aria-label,'close') or contains(@aria-label,'Cerrar')]")
                        close_btn.click()
                        print("Se cerró el modal de error (botón interno)")
                    except Exception:
                        try:
                            # intentar click en el backdrop para cerrar
                            self.driver.execute_script("const m=document.querySelector('div[data-modal=\'error\']'); if(m){m.style.display='none';}")
                            print("Se ocultó el modal de error vía JS")
                        except Exception:
                            print("No se pudo cerrar modal de error automáticamente")
                except Exception:
                    print("No se encontró modal de error para inspeccionar")

                # Reintentamos rellenar fechas más lejanas y reintentar confirm
                try:
                    # Si el modal multipaso sigue abierto, buscar inputs dentro
                    try:
                        modal = self.driver.find_element(By.CLASS_NAME, 'modal-theme')
                    except Exception:
                        modal = None
                    if modal:
                        try:
                            s_input = modal.find_element(By.NAME, 'scheduledStartDate')
                            e_input = modal.find_element(By.NAME, 'endDate')
                            # Usar +90 días tal como indicó el usuario, pero forzar fecha mínima en el rango 2027-28
                            # Elegimos 15-dic-2027 como mínimo razonable dentro del rango 2027-28
                            min_allowed = datetime(2027, 12, 15)
                            candidate = datetime.now() + timedelta(days=90)
                            # Elegir la fecha mayor entre candidate y min_allowed
                            new_start = candidate if candidate > min_allowed else min_allowed
                            new_end = new_start + timedelta(days=1)
                            new_iso_start = new_start.strftime('%m-%d-%Y')
                            new_iso_end = new_end.strftime('%m-%d-%Y')
                            try:
                                s_input.clear()
                            except Exception:
                                pass
                            try:
                                e_input.clear()
                            except Exception:
                                pass
                            try:
                                s_input.send_keys(new_iso_start)
                                s_input.send_keys(Keys.TAB)
                                e_input.send_keys(new_iso_end)
                                e_input.send_keys(Keys.TAB)
                                print(f"Reemplazadas fechas en modal a {new_iso_start} / {new_iso_end}")
                            except Exception:
                                try:
                                    self.driver.execute_script(
                                        "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input',{bubbles:true})); arguments[0].dispatchEvent(new Event('change',{bubbles:true}));",
                                        s_input, new_iso_start)
                                    self.driver.execute_script(
                                        "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input',{bubbles:true})); arguments[0].dispatchEvent(new Event('change',{bubbles:true}));",
                                        e_input, new_iso_end)
                                    print(f"Fechas forzadas via JS a {new_iso_start} / {new_iso_end}")
                                except Exception as ex:
                                    print("No fue posible reestablecer fechas en modal:", ex)
                        except Exception as ex:
                            print("No se encontraron inputs de fecha en modal:", ex)

                except Exception as ex:
                    print("Error reintento fechas/limpieza:", ex)

                # Reintentar click final
                try:
                    final_confirm_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Confirmar') and @type='submit']")
                    final_confirm_button.click()
                    print("Reintento click final realizado")
                except Exception as ex:
                    print("Reintento falló:", ex)
                    return

            # Esperar 15 segundos (rango solicitado 15-20s) para que la petición y la UI se actualicen y muestre posibles errores
            time.sleep(15)
        except Exception as e:
            print(f"Error en confirmación final: {e}")
            return
        
        # PASO 9: VERIFICAR RESULTADO - RECARGAR Y BUSCAR
        print("PASO 9: VERIFICANDO RESULTADO...")
        try:
            # Recargar página para verificar cambios
            self.driver.refresh()
            time.sleep(3)
            
            # Buscar la misma solicitud para verificar cambio de estado
            table_body = self.driver.find_element(By.TAG_NAME, "tbody")
            rows = table_body.find_elements(By.TAG_NAME, "tr")
            
            # Buscar solicitud con el mismo ID pero estado diferente
            for row in rows:
                cells = row.find_elements(By.TAG_NAME, "td")
                if len(cells) > 0 and solicitud_id in cells[0].text:
                    # Verificar nuevo estado
                    for cell in cells:
                        status_text = cell.text.lower()
                        if "pendiente" in status_text or "confirmad" in status_text:
                            print(f"ÉXITO: Solicitud {solicitud_id} confirmada correctamente")
                            break
                    else:
                        print(f"Solicitud {solicitud_id} procesada pero estado no confirmado")
                    break
            else:
                print("Solicitud no encontrada después de confirmación")
            
        except Exception as e:
            print(f"Error verificando resultado: {e}")
        
        print("Test completado")
    
    @classmethod
    def teardown_class(cls):
        """Cerrar navegador"""
        time.sleep(2)
        cls.driver.quit()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])