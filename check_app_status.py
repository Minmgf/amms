#!/usr/bin/env python3
"""
Script para verificar el estado de la aplicación AMMS
"""

import requests
import time
import subprocess
import sys
import os

def check_port_3000():
    """Verifica si hay algo ejecutándose en el puerto 3000"""
    print("🔍 Verificando puerto 3000...")
    
    try:
        # Intentar conectar al puerto
        response = requests.get("http://localhost:3000", timeout=5)
        print(f"✅ Puerto 3000 accesible - Status: {response.status_code}")
        return True
    except requests.exceptions.ConnectionError:
        print("❌ No se puede conectar al puerto 3000")
        return False
    except requests.exceptions.Timeout:
        print("⚠️  Timeout al conectar al puerto 3000")
        return False
    except Exception as e:
        print(f"❌ Error verificando puerto 3000: {e}")
        return False

def check_nextjs_app():
    """Verifica si la aplicación Next.js está ejecutándose"""
    print("🔍 Verificando aplicación Next.js...")
    
    try:
        # Verificar si hay un proceso de Node.js ejecutándose
        result = subprocess.run(["tasklist", "/FI", "IMAGENAME eq node.exe"], 
                              capture_output=True, text=True)
        
        if "node.exe" in result.stdout:
            print("✅ Proceso Node.js detectado")
            return True
        else:
            print("❌ No se detectó proceso Node.js")
            return False
            
    except Exception as e:
        print(f"❌ Error verificando Node.js: {e}")
        return False

def check_package_json():
    """Verifica si existe package.json y sus scripts"""
    print("🔍 Verificando configuración del proyecto...")
    
    package_paths = [
        "package.json",
        "src/package.json",
        "amms-master/package.json"
    ]
    
    for path in package_paths:
        if os.path.exists(path):
            print(f"✅ Encontrado package.json en: {path}")
            return path
    
    print("❌ No se encontró package.json")
    return None

def start_application():
    """Intenta iniciar la aplicación"""
    print("🚀 Intentando iniciar la aplicación...")
    
    # Buscar el directorio correcto
    possible_dirs = ["src", "amms-master", "."]
    
    for dir_path in possible_dirs:
        if os.path.exists(os.path.join(dir_path, "package.json")):
            print(f"📁 Encontrado proyecto en: {dir_path}")
            
            try:
                # Cambiar al directorio y ejecutar npm run dev
                print(f"🔄 Ejecutando 'npm run dev' en {dir_path}...")
                result = subprocess.run(
                    ["npm", "run", "dev"], 
                    cwd=dir_path,
                    capture_output=True, 
                    text=True,
                    timeout=10
                )
                
                if result.returncode == 0:
                    print("✅ Aplicación iniciada correctamente")
                    return True
                else:
                    print(f"❌ Error iniciando aplicación: {result.stderr}")
                    
            except subprocess.TimeoutExpired:
                print("⚠️  Timeout al iniciar aplicación")
            except Exception as e:
                print(f"❌ Error ejecutando npm: {e}")
    
    return False

def suggest_solutions():
    """Sugiere soluciones al problema"""
    print("\n" + "="*50)
    print("💡 SOLUCIONES SUGERIDAS:")
    print("="*50)
    
    print("\n1. 🔧 Iniciar la aplicación manualmente:")
    print("   cd src")
    print("   npm install")
    print("   npm run dev")
    
    print("\n2. 🔧 O desde el directorio raíz:")
    print("   npm install")
    print("   npm run dev")
    
    print("\n3. 🔧 Verificar que no haya conflictos de puerto:")
    print("   netstat -an | findstr :3000")
    
    print("\n4. 🔧 Usar un puerto diferente:")
    print("   npm run dev -- --port 3001")
    
    print("\n5. 🔧 Verificar configuración en test_config.py:")
    print("   APP_URL = 'http://localhost:3001'  # Cambiar puerto si es necesario")

def main():
    """Función principal"""
    print("🔍 DIAGNÓSTICO DE APLICACIÓN AMMS")
    print("="*40)
    
    # Verificar puerto
    port_ok = check_port_3000()
    
    # Verificar Node.js
    node_ok = check_nextjs_app()
    
    # Verificar package.json
    package_path = check_package_json()
    
    print("\n📊 RESUMEN:")
    print(f"Puerto 3000: {'✅' if port_ok else '❌'}")
    print(f"Node.js: {'✅' if node_ok else '❌'}")
    print(f"Package.json: {'✅' if package_path else '❌'}")
    
    if not port_ok and not node_ok:
        print("\n🚨 PROBLEMA DETECTADO: La aplicación no está ejecutándose")
        suggest_solutions()
    elif port_ok:
        print("\n✅ La aplicación parece estar ejecutándose")
        print("💡 Verifica que la ruta /login sea correcta en tu aplicación")
    else:
        print("\n⚠️  Estado mixto detectado")
        suggest_solutions()

if __name__ == "__main__":
    main()



