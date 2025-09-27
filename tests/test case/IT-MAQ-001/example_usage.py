"""
Ejemplo de uso de la automatización modular IT-MAQ-001

Este archivo demuestra cómo usar las funciones modulares para ejecutar
la automatización paso a paso, permitiendo desarrollo y debugging incremental.

Uso:
    python example_usage.py
"""

import sys
from pathlib import Path

# Agregar el directorio raíz al path
sys.path.append(str(Path(__file__).parent.parent.parent))

def example_complete_test():
    """
    Ejemplo: Ejecutar la prueba completa usando las funciones modulares.
    """
    print("🎯 Ejemplo: Prueba completa modular")
    print("=" * 50)

    from test_case.IT_MAQ_001.IT_MAQ_001 import run_it_maq_001

    success = run_it_maq_001(headless=False)
    if success:
        print("✅ Prueba completa exitosa")
    else:
        print("❌ Prueba completa fallida")


def example_step_by_step():
    """
    Ejemplo: Ejecutar paso a paso para desarrollo y debugging.
    """
    print("🎯 Ejemplo: Ejecución paso a paso")
    print("=" * 50)

    from test_case.IT_MAQ_001.IT_MAQ_001 import (
        setup_test_environment,
        run_it_maq_001_step1,
        cleanup_test_environment
    )
    from test_case.IT_MAQ_001.IT_MAQ_001_step2 import run_it_maq_001_step2

    driver = None
    try:
        # Paso 1: Setup (login + navegación)
        print("📋 Paso 1: Configurando entorno...")
        driver = setup_test_environment(headless=False)

        # Paso 2: Completar formulario paso 1
        print("📋 Paso 2: Ejecutando Paso 1 del formulario...")
        driver = run_it_maq_001_step1(driver)

        # Paso 3: Continuar con paso 2 (futuro)
        print("📋 Paso 3: Ejecutando Paso 2 del formulario...")
        # driver = run_it_maq_001_step2(driver)  # Descomentado cuando esté listo

        print("✅ Ejecución paso a paso completada")

    except Exception as e:
        print(f"❌ Error en ejecución paso a paso: {str(e)}")

    finally:
        # Cleanup
        print("🧹 Limpiando entorno...")
        cleanup_test_environment(driver)


def example_development_testing():
    """
    Ejemplo: Testing individual de componentes para desarrollo.
    """
    print("🎯 Ejemplo: Testing de desarrollo")
    print("=" * 50)

    from test_case.IT_MAQ_001.IT_MAQ_001 import setup_test_environment, cleanup_test_environment

    driver = None
    try:
        # Solo setup para verificar login y navegación
        print("🔧 Probando solo setup...")
        driver = setup_test_environment(headless=False)

        print("⏸️  Driver listo para pruebas manuales o debugging")
        print("💡 Puedes usar el driver para probar funciones específicas")

        # Aquí podrías agregar código para probar funciones específicas
        # Por ejemplo: analizar el DOM, probar selectores, etc.

        input("Presiona Enter para continuar y cerrar...")

    except Exception as e:
        print(f"❌ Error en testing de desarrollo: {str(e)}")

    finally:
        cleanup_test_environment(driver)


def example_step2_only():
    """
    Ejemplo: Ejecutar solo el paso 2 (requiere que paso 1 esté completado).
    """
    print("🎯 Ejemplo: Solo Paso 2")
    print("=" * 50)

    from test_case.IT_MAQ_001.IT_MAQ_001_step2 import test_step2_only

    success = test_step2_only()
    if success:
        print("✅ Paso 2 probado exitosamente")
    else:
        print("❌ Error probando Paso 2")


if __name__ == "__main__":
    print("🚀 Ejemplos de uso de IT-MAQ-001")
    print("=" * 50)
    print("Selecciona un ejemplo:")
    print("1. Prueba completa modular")
    print("2. Ejecución paso a paso")
    print("3. Testing de desarrollo")
    print("4. Solo Paso 2")
    print("0. Salir")
    print()

    while True:
        try:
            choice = input("Elige una opción (0-4): ").strip()

            if choice == "1":
                example_complete_test()
                break
            elif choice == "2":
                example_step_by_step()
                break
            elif choice == "3":
                example_development_testing()
                break
            elif choice == "4":
                example_step2_only()
                break
            elif choice == "0":
                print("👋 Hasta luego!")
                break
            else:
                print("❌ Opción inválida. Intenta de nuevo.")

        except KeyboardInterrupt:
            print("\n👋 Interrumpido por usuario. Hasta luego!")
            break
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            break