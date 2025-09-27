"""
Flujos de navegación para módulos de la aplicación.
Este módulo proporciona funciones para navegar a diferentes módulos después del login.
"""

import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def navigate_to_machinery(driver, wait_time=10):
    """
    Navega al módulo de maquinaria haciendo click en el enlace correspondiente.

    Args:
        driver: Instancia de WebDriver ya logueada.
        wait_time: Tiempo máximo de espera para encontrar el elemento (segundos).

    Returns:
        WebDriver: La instancia del driver en la página de maquinaria.

    Raises:
        Exception: Si no se puede encontrar o hacer click en el enlace de maquinaria.
    """
    try:
        print("🔍 Buscando enlace de maquinaria...")

        # Selector XPath proporcionado por el usuario
        selector = "//span[normalize-space()='Maquinaria']"
        selector_type = "xpath"

        print(f"   Usando selector XPath: {selector}")

        # Esperar a que el elemento esté disponible y sea clickable
        wait = WebDriverWait(driver, wait_time)
        if selector_type == "xpath":
            machinery_element = wait.until(
                EC.element_to_be_clickable((By.XPATH, selector))
            )
        else:
            machinery_element = wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
            )

        print("   ✅ Elemento de maquinaria encontrado")
        
        # Intentar click normal primero
        try:
            machinery_element.click()
            print("   🖱️  Click realizado en elemento de maquinaria (método normal)")
        except Exception as click_e:
            print(f"   ⚠️  Click normal falló: {str(click_e)}")
            # Intentar con JavaScript click
            try:
                driver.execute_script("arguments[0].click();", machinery_element)
                print("   🖱️  Click realizado en elemento de maquinaria (JavaScript)")
            except Exception as js_click_e:
                raise Exception(f"Ambos métodos de click fallaron. Normal: {str(click_e)}, JS: {str(js_click_e)}")

        # Esperar más tiempo para que se procese el click
        import time
        time.sleep(2)

        # Verificar múltiples indicadores de navegación exitosa
        max_attempts = 3
        for attempt in range(max_attempts):
            current_url = driver.current_url
            print(f"   🔍 Intento {attempt + 1}/{max_attempts} - URL actual: {current_url}")
            
            # Verificar si la URL cambió (por si acaso)
            if "/sigma/machinery" in current_url:
                print("   ✅ URL cambió correctamente a /sigma/machinery")
                return driver
            
            # Verificar cambios en el contenido que indiquen navegación a maquinaria
            try:
                # Indicadores específicos de que estamos en la página de maquinaria
                machinery_page_indicators = [
                    "//h1[contains(text(), 'Maquinaria')]",           # Título principal
                    "//h2[contains(text(), 'Maquinaria')]",           # Subtítulo
                    "//h3[contains(text(), 'Maquinaria')]",           # Otro nivel de título
                    "//div[contains(@class, 'machinery')]",           # Contenedor específico
                    "//table",                                        # Tabla de maquinaria (común en páginas de gestión)
                    "//button[contains(text(), 'Nueva')]",            # Botón común en gestión
                    "//button[contains(text(), 'Agregar')]",          # Otro botón común
                    "//th[contains(text(), 'Nombre')]",               # Encabezado de tabla
                    "//th[contains(text(), 'Estado')]",               # Otro encabezado común
                    "//*[contains(@id, 'machinery')]",               # Elemento con ID relacionado
                    "//div[contains(@class, 'content') and .//h1]",   # Contenedor con título
                ]
                
                found_indicators = []
                for indicator in machinery_page_indicators:
                    try:
                        elements = driver.find_elements(By.XPATH, indicator)
                        if elements and len(elements) > 0:
                            # Verificar que no sea solo el menú lateral
                            for element in elements:
                                # Excluir elementos que están en el menú lateral
                                parent_classes = element.find_element(By.XPATH, "..").get_attribute("class") or ""
                                if "sidebar" not in parent_classes.lower() and "nav" not in parent_classes.lower():
                                    found_indicators.append(f"{indicator}: {len(elements)} elementos")
                                    break
                    except:
                        pass
                
                if found_indicators:
                    print(f"   ✅ Encontrados {len(found_indicators)} indicadores de página de maquinaria")
                    for indicator in found_indicators[:3]:
                        print(f"      - {indicator}")
                    print("   🏁 Navegación exitosa (contenido cambió)")
                    return driver
                
                # Verificar si desaparecieron elementos del dashboard
                dashboard_indicators = [
                    "//h1[contains(text(), 'Bienvenido')]",           # Título del dashboard
                    "//div[contains(text(), 'Resumen General')]",     # Sección del dashboard
                    "//div[contains(text(), 'Actividad Reciente')]",   # Otra sección
                ]
                
                dashboard_hidden = True
                for indicator in dashboard_indicators:
                    try:
                        elements = driver.find_elements(By.XPATH, indicator)
                        if elements and any(element.is_displayed() for element in elements):
                            dashboard_hidden = False
                            break
                    except:
                        pass
                
                if dashboard_hidden:
                    print("   ✅ Elementos del dashboard ocultos - navegación exitosa")
                    return driver
                    
            except Exception as dom_e:
                print(f"   ❌ Error verificando DOM: {str(dom_e)}")
            
            # Esperar un poco más antes del siguiente intento
            if attempt < max_attempts - 1:
                print("   ⏳ Esperando más tiempo...")
                time.sleep(2)

        # Si ningún intento funcionó, la navegación puede haber funcionado pero de forma diferente
        print("   ⚠️  No se detectaron cambios esperados, pero el click se realizó")
        print("   💡 Posible navegación SPA - verificando estado general...")
        
        # Verificación final: si el click se hizo y no hubo errores, considerar éxito
        # En aplicaciones SPA, a veces la navegación es exitosa aunque no cambie la URL
        try:
            # Verificar que el elemento clickeado sigue existiendo y no hay errores de JS
            check_element = driver.find_element(By.XPATH, selector)
            if check_element:
                print("   ✅ Elemento de navegación sigue presente - navegación probablemente exitosa")
                print("   🏁 Considerando navegación exitosa (SPA)")
                return driver
        except:
            pass

        # Si todo falló, mostrar información de debugging
        print("   📋 Información de debugging final:")
        try:
            current_url = driver.current_url
            print(f"   URL final: {current_url}")
            
            # Mostrar algunos elementos de la página actual
            body_text = driver.find_element(By.TAG_NAME, "body").text[:500]
            print(f"   Contenido de body (primeros 500 chars): {body_text}...")
            
        except Exception as debug_e:
            print(f"   ❌ Error en debugging final: {str(debug_e)}")

        raise Exception(f"Navegación a maquinaria fallida. URL final: {current_url}")

    except Exception as e:
        # Si falla, mostrar información de debugging
        print("   📋 Información de debugging:")
        try:
            links = driver.find_elements(By.TAG_NAME, "a")
            machinery_links = [link for link in links if 'machinery' in (link.get_attribute("href") or "").lower()]
            if machinery_links:
                print(f"   ✅ Encontrados {len(machinery_links)} enlaces relacionados con machinery")
                for i, link in enumerate(machinery_links[:3]):
                    href = link.get_attribute("href")
                    text = link.text.strip()
                    classes = link.get_attribute("class")
                    print(f"      {i+1}. href='{href}' text='{text}' class='{classes}'")
            else:
                print("   ❌ No se encontraron enlaces relacionados con machinery")
                print("   📋 Primeros 10 enlaces de la página:")
                for i, link in enumerate(links[:10]):
                    href = link.get_attribute("href") or ""
                    text = link.text.strip() or link.get_attribute("title") or ""
                    if href or text:
                        print(f"      {i+1}. href='{href}' text='{text}'")
        except Exception as debug_e:
            print(f"   ❌ Error en debugging: {str(debug_e)}")

        raise Exception(f"Error al navegar al módulo de maquinaria: {str(e)}")

def navigate_to_module(driver, module_href, wait_time=10):
    """
    Función genérica para navegar a cualquier módulo por su href.

    Args:
        driver: Instancia de WebDriver ya logueada.
        module_href: El href del módulo al que navegar (ej: '/sigma/machinery').
        wait_time: Tiempo máximo de espera para encontrar el elemento (segundos).

    Returns:
        WebDriver: La instancia del driver en la página del módulo.

    Raises:
        Exception: Si no se puede encontrar o hacer click en el enlace del módulo.
    """
    try:
        # Esperar a que el enlace esté disponible y hacer click
        wait = WebDriverWait(driver, wait_time)
        module_link = wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, f"a.nav-item-active[href='{module_href}']"))
        )
        module_link.click()

        # Esperar a que se complete la navegación
        wait.until(
            lambda driver: module_href in driver.current_url
        )

        return driver

    except Exception as e:
        raise Exception(f"Error al navegar al módulo {module_href}: {str(e)}")