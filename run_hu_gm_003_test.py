#!/usr/bin/env python3
"""
Script principal para ejecutar la prueba de integración HU-GM-003
Maneja la configuración, ejecución y reporte de la prueba
"""

import os
import sys
import subprocess
import json
from datetime import datetime

def check_environment():
    """Verifica que el entorno esté configurado correctamente"""
    print("🔍 Verificando entorno...")
    
    # Verificar Python
    if sys.version_info < (3, 7):
        print("❌ Error: Se requiere Python 3.7 o superior")
        return False
    
    # Verificar dependencias
    required_packages = ["selenium", "requests"]
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Faltan dependencias: {', '.join(missing_packages)}")
        print("💡 Ejecuta: pip install -r requirements.txt")
        return False
    
    # Verificar ChromeDriver
    driver_paths = [
        os.path.join(os.getcwd(), "chromedriver.exe"),
        os.path.join(os.getcwd(), "tests", "chromedriver-win64", "chromedriver.exe")
    ]
    
    driver_found = False
    for path in driver_paths:
        if os.path.exists(path):
            driver_found = True
            print(f"✅ ChromeDriver encontrado en: {path}")
            break
    
    if not driver_found:
        print("⚠️  ChromeDriver no encontrado")
        print("💡 Ejecuta: python setup_hu_gm_003_test.py")
        return False
    
    print("✅ Entorno verificado correctamente")
    return True

def setup_environment():
    """Configura el entorno si es necesario"""
    print("🔧 Configurando entorno...")
    
    try:
        # Ejecutar script de configuración
        result = subprocess.run([sys.executable, "setup_hu_gm_003_test.py"], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Entorno configurado correctamente")
            return True
        else:
            print(f"❌ Error configurando entorno: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error ejecutando configuración: {e}")
        return False

def run_test(test_type="improved"):
    """Ejecuta la prueba especificada"""
    print(f"🧪 Ejecutando prueba HU-GM-003 ({test_type})...")
    
    test_files = {
        "basic": "test_hu_gm_003_update_maintenance.py",
        "improved": "test_hu_gm_003_improved.py"
    }
    
    test_file = test_files.get(test_type, test_files["improved"])
    
    if not os.path.exists(test_file):
        print(f"❌ Archivo de prueba no encontrado: {test_file}")
        return False
    
    try:
        # Ejecutar la prueba
        result = subprocess.run([sys.executable, test_file], 
                              capture_output=True, text=True)
        
        # Mostrar salida
        if result.stdout:
            print("📋 Salida de la prueba:")
            print(result.stdout)
        
        if result.stderr:
            print("⚠️  Errores:")
            print(result.stderr)
        
        if result.returncode == 0:
            print("✅ Prueba ejecutada exitosamente")
            return True
        else:
            print(f"❌ Prueba falló con código: {result.returncode}")
            return False
            
    except Exception as e:
        print(f"❌ Error ejecutando prueba: {e}")
        return False

def generate_summary_report():
    """Genera un resumen de los resultados"""
    print("📊 Generando reporte de resumen...")
    
    # Buscar reportes JSON generados
    report_files = [f for f in os.listdir(".") if f.startswith("test_report_hu_gm_003_") and f.endswith(".json")]
    
    if not report_files:
        print("⚠️  No se encontraron reportes de prueba")
        return
    
    # Leer el reporte más reciente
    latest_report = max(report_files, key=os.path.getctime)
    
    try:
        with open(latest_report, 'r', encoding='utf-8') as f:
            report = json.load(f)
        
        print("\n" + "=" * 60)
        print("📋 RESUMEN DE PRUEBA HU-GM-003")
        print("=" * 60)
        print(f"🕐 Fecha: {report['timestamp']}")
        print(f"📊 Total de pasos: {report['total_steps']}")
        print(f"✅ Pasos exitosos: {report['passed_steps']}")
        print(f"❌ Pasos fallidos: {report['failed_steps']}")
        print(f"📈 Tasa de éxito: {report['success_rate']:.1f}%")
        
        print("\n📋 DETALLE DE RESULTADOS:")
        for result in report['results']:
            status = "✅" if result['success'] else "❌"
            print(f"  {status} {result['step']}: {result['message']}")
        
        if report['screenshots']:
            print(f"\n📸 Screenshots generados: {len(report['screenshots'])}")
            for screenshot in report['screenshots']:
                print(f"  - {screenshot}")
        
        print("\n" + "=" * 60)
        
    except Exception as e:
        print(f"❌ Error leyendo reporte: {e}")

def main():
    """Función principal"""
    print("🚀 EJECUTOR DE PRUEBA HU-GM-003: ACTUALIZAR MANTENIMIENTO")
    print("=" * 70)
    
    # Verificar argumentos
    test_type = "improved"
    if len(sys.argv) > 1:
        test_type = sys.argv[1]
    
    print(f"🎯 Tipo de prueba: {test_type}")
    
    # Verificar entorno
    if not check_environment():
        print("\n💡 Configurando entorno automáticamente...")
        if not setup_environment():
            print("❌ No se pudo configurar el entorno")
            return False
    
    # Ejecutar prueba
    success = run_test(test_type)
    
    # Generar reporte
    generate_summary_report()
    
    if success:
        print("\n🎉 PRUEBA COMPLETADA EXITOSAMENTE")
        print("📚 Revisa la documentación en README_HU_GM_003.md")
    else:
        print("\n💥 PRUEBA FALLÓ")
        print("🔧 Revisa los logs y configuración")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
