#!/usr/bin/env python3
"""
Verificación rápida de dependencias y estructura para IT-GUSU-007
"""

import sys
from pathlib import Path

def main():
    print('🔍 Verificando estructura para IT-GUSU-007...')
    print(f'   Python: {sys.version}')
    
    # Verificar dependencias
    dependencies = ['selenium', 'faker', 'psycopg2', 'dotenv']
    for dep in dependencies:
        try:
            __import__(dep)
            print(f'   ✅ {dep} disponible')
        except ImportError:
            print(f'   ❌ {dep} NO disponible')
    
    # Verificar estructura de archivos
    project_root = Path('../../..')
    print(f'\n🔍 Verificando estructura de archivos...')
    print(f'   Project root: {project_root.resolve()}')
    
    chromedriver_path = project_root / 'chromedriver' / 'driver.exe'
    print(f'   ChromeDriver: {"✅ Encontrado" if chromedriver_path.exists() else "❌ No encontrado"}')
    
    flows_path = project_root / 'flows' / 'auth' / 'login'
    print(f'   Flows path: {"✅ Encontrado" if flows_path.exists() else "❌ No encontrado"}')
    
    login_file = flows_path / 'login_flow.py'
    print(f'   login_flow.py: {"✅ Encontrado" if login_file.exists() else "❌ No encontrado"}')
    
    print('\n✅ Verificación completa')

if __name__ == "__main__":
    main()
