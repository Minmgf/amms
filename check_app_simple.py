#!/usr/bin/env python3
"""
Script simple para verificar el estado de la aplicación AMMS
"""

import requests
import subprocess
import os

def check_port_3000():
    """Verifica si hay algo ejecutándose en el puerto 3000"""
    print("Verificando puerto 3000...")
    
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        print(f"Puerto 3000 accesible - Status: {response.status_code}")
        return True
    except requests.exceptions.ConnectionError:
        print("No se puede conectar al puerto 3000")
        return False
    except Exception as e:
        print(f"Error verificando puerto 3000: {e}")
        return False

def check_nextjs_app():
    """Verifica si la aplicación Next.js está ejecutándose"""
    print("Verificando aplicación Next.js...")
    
    try:
        result = subprocess.run(["tasklist", "/FI", "IMAGENAME eq node.exe"], 
                              capture_output=True, text=True)
        
        if "node.exe" in result.stdout:
            print("Proceso Node.js detectado")
            return True
        else:
            print("No se detectó proceso Node.js")
            return False
            
    except Exception as e:
        print(f"Error verificando Node.js: {e}")
        return False

def check_package_json():
    """Verifica si existe package.json"""
    print("Verificando configuración del proyecto...")
    
    package_paths = [
        "package.json",
        "src/package.json",
        "amms-master/package.json"
    ]
    
    for path in package_paths:
        if os.path.exists(path):
            print(f"Encontrado package.json en: {path}")
            return path
    
    print("No se encontró package.json")
    return None

def main():
    """Función principal"""
    print("DIAGNOSTICO DE APLICACION AMMS")
    print("="*40)
    
    # Verificar puerto
    port_ok = check_port_3000()
    
    # Verificar Node.js
    node_ok = check_nextjs_app()
    
    # Verificar package.json
    package_path = check_package_json()
    
    print("\nRESUMEN:")
    print(f"Puerto 3000: {'OK' if port_ok else 'ERROR'}")
    print(f"Node.js: {'OK' if node_ok else 'ERROR'}")
    print(f"Package.json: {'OK' if package_path else 'ERROR'}")
    
    if not port_ok and not node_ok:
        print("\nPROBLEMA: La aplicación no está ejecutándose")
        print("\nSOLUCIONES:")
        print("1. Iniciar la aplicación:")
        print("   cd src")
        print("   npm install")
        print("   npm run dev")
        print("\n2. O desde el directorio raíz:")
        print("   npm install")
        print("   npm run dev")
        print("\n3. Verificar que no haya conflictos de puerto")
        print("   netstat -an | findstr :3000")
    elif port_ok:
        print("\nLa aplicación parece estar ejecutándose")
        print("Verifica que la ruta /login sea correcta")
    else:
        print("\nEstado mixto detectado")

if __name__ == "__main__":
    main()



