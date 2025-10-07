#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Ejecutor completo para IT-SM-005: Rechazar Solicitud de Mantenimiento
Este archivo importa y ejecuta toda la prueba con toda su información
"""

import sys
import os
import time
from datetime import datetime

# Agregar el directorio raíz al path para importaciones
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Importar toda la prueba IT-SM-005
from tests.IT-SM-005.IT-SM-005 import ITSM005RejectMaintenanceRequest
from tests.IT-SM-005.test_config import *

def main():
    """
    Función principal que ejecuta toda la prueba IT-SM-005
    """
    print("=" * 80)
    print("🚀 INICIANDO PRUEBA IT-SM-005: RECHAZAR SOLICITUD DE MANTENIMIENTO")
    print("=" * 80)
    print(f"📅 Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 URL: {APP_URL}")
    print(f"👤 Usuario: {LOGIN_EMAIL}")
    print(f"⏱️  Timeout: {WAIT_TIMEOUT}s")
    print("=" * 80)
    
    # Crear instancia de la prueba
    test_instance = ITSM005RejectMaintenanceRequest()
    
    try:
        # Ejecutar todos los pasos de la prueba
        print("\n🔧 PASO 1: Configurando driver...")
        if not test_instance.setup_driver():
            print("❌ Error configurando driver")
            return False
            
        print("\n🔐 PASO 2: Iniciando sesión...")
        if not test_instance.login_to_application():
            print("❌ Error en login")
            return False
            
        print("\n🧭 PASO 3: Navegando a solicitudes de mantenimiento...")
        if not test_instance.navigate_to_maintenance_requests():
            print("❌ Error navegando a solicitudes")
            return False
            
        print("\n📋 PASO 4: Verificando lista de solicitudes...")
        if not test_instance.verify_maintenance_list():
            print("❌ Error verificando lista")
            return False
            
        print("\n🎯 PASO 5: Seleccionando solicitud para rechazar...")
        if not test_instance.select_request_for_rejection():
            print("❌ Error seleccionando solicitud")
            return False
            
        print("\n📝 PASO 6: Llenando formulario de rechazo...")
        if not test_instance.fill_rejection_form():
            print("❌ Error llenando formulario")
            return False
            
        print("\n✅ PASO 7: Confirmando rechazo...")
        if not test_instance.confirm_rejection():
            print("❌ Error confirmando rechazo")
            return False
            
        print("\n🔍 PASO 8: Verificando resultado del rechazo...")
        if not test_instance.verify_rejection_result():
            print("❌ Error verificando resultado")
            return False
            
        print("\n" + "=" * 80)
        print("🎉 ¡PRUEBA COMPLETADA EXITOSAMENTE!")
        print("=" * 80)
        
        # Mostrar resumen de resultados
        test_instance.print_test_summary()
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR CRÍTICO: {e}")
        test_instance.take_screenshot("critical_error")
        return False
        
    finally:
        # Limpiar recursos
        print("\n🧹 Limpiando recursos...")
        test_instance.teardown_driver()

def run_with_configuration():
    """
    Ejecuta la prueba con información de configuración detallada
    """
    print("\n📊 INFORMACIÓN DE CONFIGURACIÓN:")
    print(f"   • Test Name: {TEST_NAME}")
    print(f"   • Test Description: {TEST_DESCRIPTION}")
    print(f"   • App URL: {APP_URL}")
    print(f"   • Login Email: {LOGIN_EMAIL}")
    print(f"   • Wait Timeout: {WAIT_TIMEOUT}s")
    print(f"   • Short Wait: {SHORT_WAIT}s")
    print(f"   • Long Wait: {LONG_WAIT}s")
    print(f"   • Browser Headless: {BROWSER_HEADLESS}")
    print(f"   • Window Size: {BROWSER_WINDOW_SIZE}")
    print(f"   • Rejection Reason: {REJECTION_REASON}")
    
    return main()

if __name__ == "__main__":
    """
    Punto de entrada principal
    """
    print("🔧 EJECUTOR COMPLETO IT-SM-005")
    print("Importando toda la información de la prueba...")
    
    # Ejecutar con configuración completa
    success = run_with_configuration()
    
    if success:
        print("\n✅ Ejecución completada exitosamente")
        sys.exit(0)
    else:
        print("\n❌ Ejecución falló")
        sys.exit(1)

