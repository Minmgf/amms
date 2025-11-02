#!/usr/bin/env python3
"""
Script de configuración para la prueba de integración HU-GM-003
Configura el entorno necesario para ejecutar la prueba de actualización de mantenimientos
"""

import os
import sys
import subprocess
import requests
import zipfile
import platform

def check_python_version():
    """Verifica que la versión de Python sea compatible"""
    if sys.version_info < (3, 7):
        print("❌ Error: Se requiere Python 3.7 o superior")
        print(f"Versión actual: {sys.version}")
        return False
    
    print(f"✅ Python {sys.version.split()[0]} detectado")
    return True

def install_requirements():
    """Instala las dependencias necesarias"""
    print("📦 Instalando dependencias...")
    
    requirements = [
        "selenium>=4.0.0",
        "requests>=2.25.0"
    ]
    
    for package in requirements:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"✅ {package} instalado correctamente")
        except subprocess.CalledProcessError as e:
            print(f"❌ Error instalando {package}: {e}")
            return False
    
    return True

def download_chromedriver():
    """Descarga ChromeDriver si no está disponible"""
    print("🔍 Verificando ChromeDriver...")
    
    # Verificar si ya existe
    driver_paths = [
        os.path.join(os.getcwd(), "chromedriver.exe"),
        os.path.join(os.getcwd(), "tests", "chromedriver-win64", "chromedriver.exe")
    ]
    
    for path in driver_paths:
        if os.path.exists(path):
            print(f"✅ ChromeDriver encontrado en: {path}")
            return True
    
    print("📥 ChromeDriver no encontrado, descargando...")
    
    try:
        # Obtener la versión de Chrome instalada
        chrome_version = get_chrome_version()
        if not chrome_version:
            print("❌ No se pudo detectar la versión de Chrome")
            return False
        
        print(f"🔍 Versión de Chrome detectada: {chrome_version}")
        
        # Descargar ChromeDriver compatible
        driver_url = get_chromedriver_url(chrome_version)
        if not driver_url:
            print("❌ No se pudo obtener URL de ChromeDriver")
            return False
        
        # Crear directorio si no existe
        os.makedirs("tests/chromedriver-win64", exist_ok=True)
        
        # Descargar archivo
        print(f"📥 Descargando ChromeDriver desde: {driver_url}")
        response = requests.get(driver_url, stream=True)
        response.raise_for_status()
        
        # Guardar archivo
        zip_path = "tests/chromedriver.zip"
        with open(zip_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        # Extraer archivo
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall("tests/")
        
        # Limpiar archivo zip
        os.remove(zip_path)
        
        print("✅ ChromeDriver descargado e instalado correctamente")
        return True
        
    except Exception as e:
        print(f"❌ Error descargando ChromeDriver: {e}")
        return False

def get_chrome_version():
    """Obtiene la versión de Chrome instalada"""
    try:
        if platform.system() == "Windows":
            # Buscar en el registro de Windows
            import winreg
            key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Google\Chrome\BLBeacon")
            version, _ = winreg.QueryValueEx(key, "version")
            return version
        else:
            # Para otros sistemas operativos
            result = subprocess.run(["google-chrome", "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                return result.stdout.strip().split()[-1]
    except:
        pass
    
    return None

def get_chromedriver_url(chrome_version):
    """Obtiene la URL de descarga de ChromeDriver compatible"""
    try:
        # Obtener la versión mayor de Chrome
        major_version = chrome_version.split('.')[0]
        
        # API de ChromeDriver para obtener la versión compatible
        api_url = f"https://chromedriver.storage.googleapis.com/LATEST_RELEASE_{major_version}"
        response = requests.get(api_url)
        
        if response.status_code == 200:
            driver_version = response.text.strip()
            return f"https://chromedriver.storage.googleapis.com/{driver_version}/chromedriver_win32.zip"
        
    except Exception as e:
        print(f"⚠️  Error obteniendo URL de ChromeDriver: {e}")
    
    return None

def create_test_config():
    """Crea archivo de configuración para la prueba"""
    config_content = """# Configuración para prueba HU-GM-003
# Ajusta estos valores según tu entorno

# URL de la aplicación
APP_URL = "http://localhost:3000"

# Credenciales de login
LOGIN_EMAIL = "admin@test.com"
LOGIN_PASSWORD = "password123"

# Tiempos de espera (en segundos)
WAIT_TIMEOUT = 10
IMPLICIT_WAIT = 5

# Configuración de Chrome
CHROME_OPTIONS = [
    "--disable-blink-features=AutomationControlled",
    "--no-sandbox",
    "--disable-dev-shm-usage"
]

# Datos de prueba
TEST_MAINTENANCE_NAME = "Mantenimiento_Test_{timestamp}"
TEST_MAINTENANCE_DESCRIPTION = "Descripción de prueba para mantenimiento"
TEST_MAINTENANCE_TYPE = "Preventivo"
"""
    
    with open("test_config.py", "w", encoding="utf-8") as f:
        f.write(config_content)
    
    print("✅ Archivo de configuración creado: test_config.py")

def verify_application_access():
    """Verifica que la aplicación esté accesible"""
    print("🔍 Verificando acceso a la aplicación...")
    
    try:
        # Intentar conectar a la aplicación
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("✅ Aplicación accesible en http://localhost:3000")
            return True
        else:
            print(f"⚠️  Aplicación responde con código: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ No se puede acceder a la aplicación: {e}")
        print("💡 Asegúrate de que la aplicación esté ejecutándose en http://localhost:3000")
        return False

def main():
    """Función principal de configuración"""
    print("🚀 Configurando entorno para prueba HU-GM-003")
    print("=" * 50)
    
    # Verificar Python
    if not check_python_version():
        return False
    
    # Instalar dependencias
    if not install_requirements():
        return False
    
    # Descargar ChromeDriver
    if not download_chromedriver():
        print("⚠️  ChromeDriver no disponible, la prueba podría fallar")
    
    # Crear configuración
    create_test_config()
    
    # Verificar aplicación
    verify_application_access()
    
    print("\n" + "=" * 50)
    print("✅ Configuración completada")
    print("\n📋 Próximos pasos:")
    print("1. Ajusta la configuración en test_config.py si es necesario")
    print("2. Asegúrate de que la aplicación esté ejecutándose")
    print("3. Ejecuta: python test_hu_gm_003_update_maintenance.py")
    print("\n📚 Documentación: README_HU_GM_003.md")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)



