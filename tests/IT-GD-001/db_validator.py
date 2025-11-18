#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Utilidades para validación de datos en base de datos
Este módulo permite verificar directamente en la BD que los dispositivos se registraron correctamente
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Cargar variables de entorno
PROJECT_ROOT = Path(__file__).parent.parent
load_dotenv(PROJECT_ROOT / '.env')

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False
    print("⚠️  psycopg2 no instalado. Validación de base de datos no disponible.")
    print("   Para instalar: pip install psycopg2-binary")


class DatabaseValidator:
    """Clase para validar datos directamente en la base de datos"""
    
    def __init__(self):
        if not PSYCOPG2_AVAILABLE:
            raise ImportError("psycopg2 no está instalado. Instalar con: pip install psycopg2-binary")
        
        self.connection = None
        self.db_config = {
            'host': os.getenv('DB_HOST'),
            'port': os.getenv('DB_PORT'),
            'database': os.getenv('DB_NAME'),
            'user': os.getenv('DB_USER'),
            'password': os.getenv('DB_PASSWORD')
        }
    
    def connect(self):
        """Establece conexión con la base de datos"""
        try:
            self.connection = psycopg2.connect(**self.db_config)
            print(f"✓ Conexión establecida con {self.db_config['database']}")
            return True
        except Exception as e:
            print(f"✗ Error conectando a la base de datos: {e}")
            return False
    
    def disconnect(self):
        """Cierra la conexión con la base de datos"""
        if self.connection:
            self.connection.close()
            print("✓ Conexión cerrada")
    
    def check_device_exists(self, imei):
        """Verifica si existe un dispositivo con el IMEI dado"""
        try:
            cursor = self.connection.cursor(cursor_factory=RealDictCursor)
            
            # Ajustar la consulta según el esquema real de la BD
            query = """
                SELECT * FROM devices 
                WHERE imei = %s
                LIMIT 1
            """
            
            cursor.execute(query, (imei,))
            result = cursor.fetchone()
            cursor.close()
            
            if result:
                print(f"✓ Dispositivo encontrado en BD con IMEI: {imei}")
                return True, dict(result)
            else:
                print(f"✗ Dispositivo NO encontrado en BD con IMEI: {imei}")
                return False, None
                
        except Exception as e:
            print(f"✗ Error consultando base de datos: {e}")
            return False, None
    
    def get_device_by_name(self, device_name):
        """Busca un dispositivo por nombre"""
        try:
            cursor = self.connection.cursor(cursor_factory=RealDictCursor)
            
            query = """
                SELECT * FROM devices 
                WHERE name LIKE %s
                LIMIT 1
            """
            
            cursor.execute(query, (f"%{device_name}%",))
            result = cursor.fetchone()
            cursor.close()
            
            if result:
                print(f"✓ Dispositivo encontrado: {device_name}")
                return True, dict(result)
            else:
                print(f"✗ Dispositivo NO encontrado: {device_name}")
                return False, None
                
        except Exception as e:
            print(f"✗ Error consultando base de datos: {e}")
            return False, None
    
    def get_device_parameters(self, device_id):
        """Obtiene los parámetros de monitoreo asociados a un dispositivo"""
        try:
            cursor = self.connection.cursor(cursor_factory=RealDictCursor)
            
            # Ajustar según el esquema real
            query = """
                SELECT p.* 
                FROM device_parameters dp
                JOIN parameters p ON dp.parameter_id = p.id
                WHERE dp.device_id = %s
            """
            
            cursor.execute(query, (device_id,))
            results = cursor.fetchall()
            cursor.close()
            
            parameters = [dict(row) for row in results]
            print(f"✓ {len(parameters)} parámetros encontrados para device_id: {device_id}")
            return parameters
                
        except Exception as e:
            print(f"✗ Error consultando parámetros: {e}")
            return []
    
    def validate_device_registration(self, device_name, imei, expected_parameters):
        """
        Valida que un dispositivo se registró correctamente con todos sus datos
        
        Args:
            device_name: Nombre del dispositivo
            imei: IMEI del dispositivo
            expected_parameters: Lista de nombres de parámetros esperados
        
        Returns:
            tuple: (success: bool, validation_details: dict)
        """
        print("\n" + "="*70)
        print("VALIDACIÓN EN BASE DE DATOS")
        print("="*70)
        
        validation_details = {
            "device_exists": False,
            "imei_correct": False,
            "name_correct": False,
            "parameters_count": 0,
            "parameters_correct": False,
            "missing_parameters": [],
            "device_data": None
        }
        
        try:
            # 1. Verificar que existe el dispositivo por IMEI
            exists, device_data = self.check_device_exists(imei)
            validation_details["device_exists"] = exists
            validation_details["device_data"] = device_data
            
            if not exists:
                print("✗ Validación fallida: Dispositivo no encontrado en BD")
                return False, validation_details
            
            # 2. Verificar nombre
            if device_data.get('name') == device_name or device_name in device_data.get('name', ''):
                validation_details["name_correct"] = True
                print(f"✓ Nombre correcto: {device_data.get('name')}")
            else:
                print(f"✗ Nombre incorrecto. Esperado: {device_name}, Encontrado: {device_data.get('name')}")
            
            # 3. Verificar IMEI
            if device_data.get('imei') == imei:
                validation_details["imei_correct"] = True
                print(f"✓ IMEI correcto: {imei}")
            else:
                print(f"✗ IMEI incorrecto. Esperado: {imei}, Encontrado: {device_data.get('imei')}")
            
            # 4. Verificar parámetros
            device_id = device_data.get('id')
            if device_id:
                parameters = self.get_device_parameters(device_id)
                validation_details["parameters_count"] = len(parameters)
                
                # Obtener nombres de parámetros encontrados
                found_param_names = [p.get('name', '') for p in parameters]
                
                # Verificar que todos los parámetros esperados están presentes
                missing = []
                for expected_param in expected_parameters:
                    if not any(expected_param in found for found in found_param_names):
                        missing.append(expected_param)
                
                validation_details["missing_parameters"] = missing
                
                if not missing and len(parameters) >= len(expected_parameters):
                    validation_details["parameters_correct"] = True
                    print(f"✓ Todos los parámetros registrados correctamente ({len(parameters)})")
                else:
                    print(f"✗ Parámetros faltantes: {missing}")
                    print(f"  Esperados: {len(expected_parameters)}, Encontrados: {len(parameters)}")
            
            # Determinar éxito general
            success = (
                validation_details["device_exists"] and
                validation_details["imei_correct"] and
                validation_details["name_correct"] and
                validation_details["parameters_correct"]
            )
            
            if success:
                print("\n✓ VALIDACIÓN EXITOSA: Dispositivo registrado correctamente en BD")
            else:
                print("\n✗ VALIDACIÓN FALLIDA: Revisar detalles arriba")
            
            return success, validation_details
            
        except Exception as e:
            print(f"✗ Error en validación: {e}")
            return False, validation_details


def test_database_connection():
    """Prueba la conexión a la base de datos"""
    print("Probando conexión a la base de datos...")
    
    if not PSYCOPG2_AVAILABLE:
        print("✗ psycopg2 no está disponible")
        return False
    
    validator = DatabaseValidator()
    
    if validator.connect():
        print("✓ Conexión exitosa")
        validator.disconnect()
        return True
    else:
        print("✗ Conexión fallida")
        return False


if __name__ == "__main__":
    # Probar conexión
    test_database_connection()
    
    # Ejemplo de uso
    if PSYCOPG2_AVAILABLE:
        print("\nEjemplo de validación:")
        validator = DatabaseValidator()
        
        if validator.connect():
            # Buscar un dispositivo de ejemplo
            exists, data = validator.check_device_exists("123456789012345")
            
            if exists:
                print(f"\nDatos del dispositivo:")
                for key, value in data.items():
                    print(f"  {key}: {value}")
            
            validator.disconnect()
