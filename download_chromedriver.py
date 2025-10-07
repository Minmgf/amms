import os
import requests
import zipfile
import platform
from pathlib import Path

def get_chrome_version():
    """Obtiene la versión de Chrome instalada"""
    try:
        if platform.system() == "Windows":
            import winreg
            try:
                # Intentar diferentes rutas del registro
                paths = [
                    r"Software\Google\Chrome\BLBeacon",
                    r"Software\Google\Chrome",
                    r"SOFTWARE\Google\Chrome\BLBeacon",
                    r"SOFTWARE\Google\Chrome"
                ]
                
                for path in paths:
                    try:
                        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, path)
                        version, _ = winreg.QueryValueEx(key, "version")
                        if version and isinstance(version, str):
                            return version.split('.')[0]  # Solo el número mayor
                    except:
                        continue
                        
                # Intentar con HKEY_LOCAL_MACHINE
                for path in paths:
                    try:
                        key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, path)
                        version, _ = winreg.QueryValueEx(key, "version")
                        if version and isinstance(version, str):
                            return version.split('.')[0]  # Solo el número mayor
                    except:
                        continue
                        
            except Exception as e:
                print(f"Error al acceder al registro: {e}")
                
        else:
            # Para Linux/Mac
            import subprocess
            try:
                result = subprocess.run(['google-chrome', '--version'], capture_output=True, text=True)
                if result.stdout:
                    return result.stdout.split()[2].split('.')[0]
            except:
                pass
                
    except Exception as e:
        print(f"Error al obtener versión de Chrome: {e}")
        
    print("No se pudo detectar la versión de Chrome, usando versión por defecto")
    return "119"  # Versión por defecto

def download_chromedriver():
    """Descarga chromedriver automáticamente"""
    print("Descargando chromedriver...")
    
    # Obtener versión de Chrome
    chrome_version = get_chrome_version()
    print(f"Versión de Chrome detectada: {chrome_version}")
    
    # URL base para descargar chromedriver
    base_url = f"https://chromedriver.storage.googleapis.com/LATEST_RELEASE_{chrome_version}"
    
    try:
        # Obtener la versión más reciente del driver
        response = requests.get(base_url)
        if response.status_code == 200:
            driver_version = response.text.strip()
            print(f"Versión del driver a descargar: {driver_version}")
        else:
            print("Error al obtener la versión del driver")
            return False
            
        # URL de descarga
        system = platform.system().lower()
        if system == "windows":
            download_url = f"https://chromedriver.storage.googleapis.com/{driver_version}/chromedriver_win32.zip"
            filename = "chromedriver_win32.zip"
        elif system == "darwin":  # Mac
            download_url = f"https://chromedriver.storage.googleapis.com/{driver_version}/chromedriver_mac64.zip"
            filename = "chromedriver_mac64.zip"
        else:  # Linux
            download_url = f"https://chromedriver.storage.googleapis.com/{driver_version}/chromedriver_linux64.zip"
            filename = "chromedriver_linux64.zip"
        
        print(f"Descargando desde: {download_url}")
        
        # Descargar el archivo
        response = requests.get(download_url)
        if response.status_code == 200:
            with open(filename, 'wb') as f:
                f.write(response.content)
            print(f"Archivo descargado: {filename}")
            
            # Extraer el archivo
            with zipfile.ZipFile(filename, 'r') as zip_ref:
                zip_ref.extractall('.')
            
            # Eliminar el archivo zip
            os.remove(filename)
            
            # Renombrar el ejecutable si es necesario
            if system == "windows":
                if os.path.exists("chromedriver.exe"):
                    print("✅ chromedriver.exe descargado exitosamente")
                    return True
                else:
                    print("❌ Error: chromedriver.exe no encontrado después de la extracción")
                    return False
            else:
                if os.path.exists("chromedriver"):
                    # Hacer ejecutable
                    os.chmod("chromedriver", 0o755)
                    print("✅ chromedriver descargado exitosamente")
                    return True
                else:
                    print("❌ Error: chromedriver no encontrado después de la extracción")
                    return False
        else:
            print(f"Error al descargar: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Error durante la descarga: {e}")
        return False

if __name__ == "__main__":
    print("=== Descargador de ChromeDriver ===")
    success = download_chromedriver()
    if success:
        print("\n✅ ChromeDriver descargado exitosamente!")
        print("Ahora puedes ejecutar: python main.py")
    else:
        print("\n❌ Error al descargar ChromeDriver")
        print("Intenta descargarlo manualmente desde: https://chromedriver.chromium.org/")
