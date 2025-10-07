"""
Script simple para configurar Selenium con ChromeDriver
"""
import os
import sys

def install_requirements():
    """Instala las dependencias necesarias"""
    print("Instalando dependencias...")
    os.system("pip install selenium webdriver-manager")

def test_selenium():
    """Prueba que Selenium funciona correctamente"""
    try:
        print("Probando Selenium...")
        
        from selenium import webdriver
        from selenium.webdriver.chrome.service import Service
        from selenium.webdriver.chrome.options import Options
        from webdriver_manager.chrome import ChromeDriverManager
        
        # Configurar opciones de Chrome
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Ejecutar sin ventana
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        
        print("Descargando ChromeDriver...")
        service = Service(ChromeDriverManager().install())
        
        print("Inicializando driver...")
        driver = webdriver.Chrome(service=service, options=chrome_options)
        
        print("Probando navegación...")
        driver.get("https://www.google.com")
        
        title = driver.title
        print(f"✅ Selenium funciona correctamente! Título de la página: {title}")
        
        driver.quit()
        return True
        
    except Exception as e:
        print(f"❌ Error al probar Selenium: {e}")
        return False

def main():
    """Función principal"""
    print("=== Configurador de Selenium ===")
    
    # Instalar dependencias
    install_requirements()
    
    # Probar Selenium
    if test_selenium():
        print("\n🎉 ¡Selenium configurado exitosamente!")
        print("Ahora puedes ejecutar:")
        print("- python main_improved.py")
        print("- python main.py")
    else:
        print("\n❌ Error en la configuración")
        print("Verifica que tengas:")
        print("- Python instalado")
        print("- Google Chrome instalado")
        print("- Conexión a internet")

if __name__ == "__main__":
    main()










