"""
IT-SM-001: Creación manual de solicitud con validaciones y notificaciones

Paquete Python para el caso de prueba IT-SM-001 que automatiza la creación
de solicitudes de mantenimiento con validaciones completas.

Funciones principales exportadas:
- setup_test_environment: Configura el entorno de prueba
- run_it_sm_001: Ejecuta la prueba completa
- cleanup_test_environment: Limpia el entorno
"""

from .IT_SM_001 import (
    setup_test_environment,
    navigate_to_maintenance_request,
    fill_maintenance_request_form,
    submit_maintenance_request,
    validate_request_creation,
    run_it_sm_001,
    cleanup_test_environment,
    main
)

__all__ = [
    'setup_test_environment',
    'navigate_to_maintenance_request',
    'fill_maintenance_request_form',
    'submit_maintenance_request',
    'validate_request_creation',
    'run_it_sm_001',
    'cleanup_test_environment',
    'main'
]

__version__ = '1.0.0'
__author__ = 'Daniel Soto'
__description__ = 'Automatización del caso de prueba IT-SM-001 para creación de solicitudes de mantenimiento'

