#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para verificar si la aplicacion esta corriendo
"""

import requests
import time
from test_config import APP_URL

def check_application():
    print("=== VERIFICANDO APLICACION ===")
    
    # Probar diferentes puertos
    ports_to_test = [3000, 3001, 3002, 8080, 8000]
    
    for port in ports_to_test:
        test_url = f"http://localhost:{port}"
        print(f"\nProbando puerto {port}...")
        
        try:
            response = requests.get(test_url, timeout=5)
            print(f"   Status: {response.status_code}")
            print(f"   URL: {test_url}")
            
            if response.status_code == 200:
                print(f"   [SUCCESS] Aplicacion encontrada en puerto {port}")
                
                # Probar con /sigma
                sigma_url = f"{test_url}/sigma"
                try:
                    sigma_response = requests.get(sigma_url, timeout=5)
                    print(f"   /sigma Status: {sigma_response.status_code}")
                    if sigma_response.status_code == 200:
                        print(f"   [SUCCESS] Ruta /sigma funciona en puerto {port}")
                        return port
                except:
                    print(f"   [WARN] Ruta /sigma no funciona en puerto {port}")
                    
        except requests.exceptions.ConnectionError:
            print(f"   [INFO] Puerto {port} no responde")
        except requests.exceptions.Timeout:
            print(f"   [WARN] Puerto {port} timeout")
        except Exception as e:
            print(f"   [ERROR] Error en puerto {port}: {e}")
    
    print("\n[ERROR] No se encontro la aplicacion en ningun puerto")
    return None

def check_current_config():
    print(f"\n=== CONFIGURACION ACTUAL ===")
    print(f"APP_URL configurado: {APP_URL}")
    
    try:
        response = requests.get(APP_URL, timeout=10)
        print(f"Status de APP_URL: {response.status_code}")
        if response.status_code == 200:
            print("[SUCCESS] La aplicacion esta corriendo en la URL configurada")
            return True
        else:
            print(f"[WARN] La aplicacion responde con status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("[ERROR] No se puede conectar a la URL configurada")
        return False
    except requests.exceptions.Timeout:
        print("[ERROR] Timeout al conectar a la URL configurada")
        return False
    except Exception as e:
        print(f"[ERROR] Error inesperado: {e}")
        return False

if __name__ == "__main__":
    print("Verificando si la aplicacion esta corriendo...")
    
    # Verificar configuracion actual
    current_works = check_current_config()
    
    if not current_works:
        print("\nBuscando aplicacion en otros puertos...")
        working_port = check_application()
        
        if working_port:
            print(f"\n[SOLUCION] La aplicacion esta en el puerto {working_port}")
            print(f"Actualiza test_config.py con: APP_URL = 'http://localhost:{working_port}/sigma'")
        else:
            print("\n[ERROR] No se encontro la aplicacion corriendo")
            print("Asegurate de que la aplicacion este iniciada con: npm run dev")
    else:
        print("\n[SUCCESS] La aplicacion esta funcionando correctamente")


