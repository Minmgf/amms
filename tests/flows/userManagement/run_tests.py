"""
Script de configuración y ejecución para los flujos de User Management.

Este archivo facilita la ejecución de los tests y maneja la configuración
de paths y dependencias.

Autor: [Tu nombre]  
Fecha: 2025-09-05
"""

import os
import sys
import subprocess

def configurar_entorno():
    """
    Configura el entorno para ejecutar los flujos de User Management.
    """
    print("Configurando entorno para flujos de User Management...")
    
    # Obtener directorio actual
    current_dir = os.path.dirname(os.path.abspath(__file__))
    tests_dir = os.path.join(current_dir, '..', '..')
    
    # Agregar directorios necesarios al path
    sys.path.insert(0, current_dir)
    sys.path.insert(0, os.path.join(tests_dir, 'flows'))
    sys.path.insert(0, os.path.join(tests_dir, 'flows', 'auth', 'login'))
    
    print(f"Directorio actual: {current_dir}")
    print(f"Directorio tests: {tests_dir}")
    
    return current_dir, tests_dir

def verificar_dependencias():
    """
    Verifica que todas las dependencias estén instaladas.
    """
    print("Verificando dependencias...")
    
    dependencias = [
        'selenium',
        'python-dotenv'
    ]
    
    missing = []
    
    for dep in dependencias:
        try:
            __import__(dep.replace('-', '_'))
            print(f"✓ {dep}")
        except ImportError:
            print(f"✗ {dep}")
            missing.append(dep)
    
    if missing:
        print(f"\nDependencias faltantes: {', '.join(missing)}")
        print("Instala con: pip install " + " ".join(missing))
        return False
    
    return True

def verificar_chromedriver():
    """
    Verifica que chromedriver esté disponible.
    """
    print("Verificando chromedriver...")
    
    # Rutas posibles para chromedriver
    possible_paths = [
        "../../chromedriver/driver.exe",
        "../chromedriver/driver.exe", 
        "./chromedriver/driver.exe",
        "chromedriver.exe",
        "chromedriver"
    ]
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    for path in possible_paths:
        full_path = os.path.abspath(os.path.join(current_dir, path))
        if os.path.exists(full_path):
            print(f"✓ chromedriver encontrado en: {full_path}")
            return full_path
    
    print("✗ chromedriver no encontrado")
    print("Descarga chromedriver desde: https://chromedriver.chromium.org/")
    return None

def verificar_archivo_env():
    """
    Verifica que el archivo .env exista con las credenciales.
    """
    print("Verificando archivo .env...")
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    env_paths = [
        os.path.join(current_dir, '..', '..', '.env'),
        os.path.join(current_dir, '..', '.env'),
        os.path.join(current_dir, '.env')
    ]
    
    for env_path in env_paths:
        if os.path.exists(env_path):
            print(f"✓ .env encontrado en: {env_path}")
            
            # Verificar que tenga las variables necesarias
            try:
                with open(env_path, 'r') as f:
                    content = f.read()
                    
                if 'EMAIL=' in content and 'PASSWORD=' in content:
                    print("✓ Variables EMAIL y PASSWORD configuradas")
                    return env_path
                else:
                    print("⚠ .env existe pero falta EMAIL o PASSWORD")
            except Exception as e:
                print(f"⚠ Error leyendo .env: {e}")
    
    print("✗ Archivo .env no encontrado")
    print("Crea un archivo .env con:")
    print("EMAIL=tu_email@empresa.com")
    print("PASSWORD=tu_password")
    return None

def ejecutar_flujo_navegacion():
    """
    Ejecuta el flujo de navegación a User Management.
    """
    print("\n=== EJECUTANDO FLUJO DE NAVEGACIÓN ===")
    
    try:
        # Configurar entorno
        configurar_entorno()
        
        # Importar y ejecutar
        from navigate_to_user_list import navigate_to_user_list_flow
        
        # Buscar chromedriver
        driver_path = verificar_chromedriver()
        if not driver_path:
            print("No se puede ejecutar sin chromedriver")
            return False
        
        # Ejecutar flujo
        result = navigate_to_user_list_flow(driver_path=driver_path)
        
        print(f"\n=== RESULTADO ===")
        print(f"Éxito general: {result['success']}")
        print(f"Login exitoso: {result['login_success']}")
        print(f"Navegación exitosa: {result['navigation_success']}")
        
        if result['verification_result']:
            ver = result['verification_result']
            print(f"Lista cargada: {ver['loaded']}")
            print(f"Usuarios encontrados: {ver['user_count']}")
            print(f"Estado de carga: {ver['loading_state']}")
        
        if result['error']:
            print(f"Error: {result['error']}")
        
        return result['success']
        
    except Exception as e:
        print(f"Error ejecutando flujo: {e}")
        return False

def ejecutar_ejemplos():
    """
    Ejecuta los ejemplos de uso.
    """
    print("\n=== EJECUTANDO EJEMPLOS ===")
    
    try:
        configurar_entorno()
        from ejemplo_uso_navigate_to_user_list import ejecutar_ejemplos
        return ejecutar_ejemplos()
        
    except Exception as e:
        print(f"Error ejecutando ejemplos: {e}")
        return False

def mostrar_menu():
    """
    Muestra el menú de opciones.
    """
    print("\n" + "="*50)
    print("FLUJOS DE USER MANAGEMENT - AMMS")
    print("="*50)
    print("1. Verificar configuración del entorno")
    print("2. Ejecutar flujo de navegación")
    print("3. Ejecutar ejemplos de uso")
    print("4. Mostrar ayuda")
    print("0. Salir")
    print("="*50)

def mostrar_ayuda():
    """
    Muestra información de ayuda.
    """
    print("\n=== AYUDA ===")
    print()
    print("CONFIGURACIÓN NECESARIA:")
    print("1. chromedriver.exe en tests/chromedriver/")
    print("2. Archivo .env con EMAIL y PASSWORD")
    print("3. Aplicación AMMS corriendo en localhost:3000")
    print("4. Dependencias: selenium, python-dotenv")
    print()
    print("ESTRUCTURA DE ARCHIVOS:")
    print("tests/")
    print("├── flows/")
    print("│   ├── auth/login/login_flow.py")
    print("│   └── userManagement/")
    print("│       ├── navigate_to_user_list.py")
    print("│       ├── ejemplo_uso_*.py")
    print("│       └── run_tests.py")
    print("├── chromedriver/driver.exe")
    print("└── .env")
    print()
    print("EJECUCIÓN:")
    print("- Opción 1: Verifica que todo esté configurado")
    print("- Opción 2: Ejecuta el flujo completo")
    print("- Opción 3: Ejecuta ejemplos de uso")
    print()

def main():
    """
    Función principal del script.
    """
    while True:
        mostrar_menu()
        
        try:
            opcion = input("Selecciona una opción: ").strip()
            
            if opcion == "0":
                print("¡Hasta luego!")
                break
                
            elif opcion == "1":
                print("\n=== VERIFICACIÓN DEL ENTORNO ===")
                configurar_entorno()
                deps_ok = verificar_dependencias()
                driver_ok = verificar_chromedriver() is not None
                env_ok = verificar_archivo_env() is not None
                
                print(f"\nResumen:")
                print(f"Dependencias: {'✓' if deps_ok else '✗'}")
                print(f"ChromeDriver: {'✓' if driver_ok else '✗'}")
                print(f"Archivo .env: {'✓' if env_ok else '✗'}")
                
                if deps_ok and driver_ok and env_ok:
                    print("\n✓ Entorno configurado correctamente")
                else:
                    print("\n✗ Hay problemas en la configuración")
                
            elif opcion == "2":
                ejecutar_flujo_navegacion()
                
            elif opcion == "3":
                ejecutar_ejemplos()
                
            elif opcion == "4":
                mostrar_ayuda()
                
            else:
                print("Opción no válida")
                
        except KeyboardInterrupt:
            print("\n\nInterrumpido por el usuario")
            break
        except Exception as e:
            print(f"Error: {e}")
        
        input("\nPresiona Enter para continuar...")

if __name__ == "__main__":
    main()
