"""
Ejemplos de uso de la automatización IT-MAQ-002

Este archivo demuestra cómo usar las funciones de validación de duplicados
en número de serie de maquinaria.

Uso:
    python example_usage.py
"""

import sys
from pathlib import Path

# Agregar el directorio raíz al path
sys.path.append(str(Path(__file__).parent.parent.parent))

def example_complete_validation():
    """
    Ejemplo: Ejecutar la validación completa de duplicados.
    """
    print("🎯 Ejemplo: Validación completa de duplicados")
    print("=" * 50)

    from test_case.IT_MAQ_002.IT_MAQ_002 import run_it_maq_002

    result = run_it_maq_002(headless=False)
    if result.get("success", False):
        print("✅ Validación de duplicados exitosa")
    else:
        print("❌ Error en validación de duplicados")


def example_step_by_step():
    """
    Ejemplo: Ejecutar paso a paso la validación.
    """
    print("🎯 Ejemplo: Ejecución paso a paso")
    print("=" * 50)

    from test_case.IT_MAQ_002.IT_MAQ_002 import setup_duplicate_validation, run_it_maq_002_validation
    from test_case.IT_MAQ_001.IT_MAQ_001 import cleanup_test_environment

    driver = None
    try:
        # Paso 1: Configurar validación (incluye asegurar maquinaria base)
        print("📋 Paso 1: Configurando validación...")
        driver = setup_duplicate_validation()

        # Paso 2: Ejecutar validación específica
        print("📋 Paso 2: Ejecutando validación de duplicados...")
        result = run_it_maq_002_validation(driver)

        if result["success"]:
            print("✅ Validación de duplicados exitosa")
        else:
            print("❌ Validación de duplicados fallida")

    except Exception as e:
        print(f"❌ Error en ejecución paso a paso: {str(e)}")

    finally:
        # Cleanup
        print("🧹 Limpiando entorno...")
        cleanup_test_environment(driver)


def example_development_testing():
    """
    Ejemplo: Testing de desarrollo para verificar configuración.
    """
    print("🎯 Ejemplo: Testing de desarrollo")
    print("=" * 50)

    from test_case.IT_MAQ_002.IT_MAQ_002 import setup_duplicate_validation
    from test_case.IT_MAQ_001.IT_MAQ_001 import cleanup_test_environment

    driver = None
    try:
        # Solo configurar para verificar que funciona
        print("🔧 Probando configuración de validación...")
        driver = setup_duplicate_validation()

        print("⏸️  Driver listo para pruebas manuales")
        print("💡 Puedes usar el driver para probar funciones específicas")

        input("Presiona Enter para continuar y cerrar...")

    except Exception as e:
        print(f"❌ Error en testing de desarrollo: {str(e)}")

    finally:
        cleanup_test_environment(driver)


if __name__ == "__main__":
    print("🚀 Ejemplos de uso de IT-MAQ-002")
    print("=" * 50)
    print("Selecciona un ejemplo:")
    print("1. Validación completa de duplicados")
    print("2. Ejecución paso a paso")
    print("3. Testing de desarrollo")
    print("0. Salir")
    print()

    while True:
        try:
            choice = input("Elige una opción (0-3): ").strip()

            if choice == "1":
                example_complete_validation()
                break
            elif choice == "2":
                example_step_by_step()
                break
            elif choice == "3":
                example_development_testing()
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