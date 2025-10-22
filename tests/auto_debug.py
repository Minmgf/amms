# Script que ejecuta el test y captura automáticamente el error
import subprocess
import sys

def run_test_and_capture():
    try:
        # Ejecutar el test y capturar toda la salida
        result = subprocess.run([
            sys.executable, "-m", "pytest", 
            "tests/test_IT_SM_003.py::test_list_maintenance_requests_full_flow", 
            "-v", "--tb=short"
        ], capture_output=True, text=True, cwd="C:\\Users\\aleja\\amms")
        
        print("=== RESULTADO DEL TEST ===")
        print(f"Exit Code: {result.returncode}")
        print(f"STDOUT:\n{result.stdout}")
        print(f"STDERR:\n{result.stderr}")
        
        # Analizar el error automáticamente
        if result.returncode != 0:
            print("\n=== ANÁLISIS DEL ERROR ===")
            output = result.stdout + result.stderr
            
            if "TimeoutException" in output and "boton_detalles" in output:
                print("ERROR: No encuentra el botón 'Detalles'")
                return "detalles_button"
            elif "TimeoutException" in output and "filtros_btn" in output:
                print("ERROR: No encuentra el botón 'Filtrar por'")
                return "filter_button"
            elif "modal" in output.lower() and "timeout" in output.lower():
                print("ERROR: Problemas con el modal de filtros")
                return "modal_elements"
            elif "search" in output.lower() or "buscador" in output.lower():
                print("ERROR: Problemas con el campo de búsqueda")
                return "search_field"
            else:
                print("ERROR: No identificado automáticamente")
                return "unknown"
        else:
            print("✅ TEST PASÓ CORRECTAMENTE")
            return "passed"
            
    except Exception as e:
        print(f"Error ejecutando el test: {e}")
        return "execution_error"

if __name__ == "__main__":
    error_type = run_test_and_capture()
    print(f"\nTipo de error detectado: {error_type}")