# Prompt para Crear Test Cases Automatizados - Proyecto AMMS

## 📋 Instrucciones Generales

Crear un test case automatizado siguiendo exactamente el formato y estructura del archivo de referencia: `C:\Users\Nico\Documents\Proyecto Integrador\amms\tests\test_IT_GUSU_006_RF-074\test_IT_GUSU_006_RF-074.py`

## 🏗️ Estructura de Carpetas y Archivos

### Nomenclatura de Carpeta:
```
test_IT_{MODULO}_{NUMERO}_{REQUERIMIENTO}/
```
**Ejemplo:** `test_IT_GUSU_006_RF-074/`

### Nomenclatura de Archivo Principal:
```
test_IT_{MODULO}_{NUMERO}_{REQUERIMIENTO}.py
```
**Ejemplo:** `test_IT_GUSU_006_RF-074.py`

### Archivos Obligatorios en la Carpeta:
1. `test_IT_{MODULO}_{NUMERO}_{REQUERIMIENTO}.py` - Archivo principal
2. `README.md` - Documentación específica del caso
3. `.env.example` - Plantilla de configuración

## 📝 Datos de Entrada Requeridos

Proporcionar SIEMPRE esta información completa:

```json
{
  "test_info": {
    "id": "IT-XXXX-XXX",
    "titulo": "Descripción del caso",
    "modulo": "XXXX",
    "requerimientos": ["RF-XXX", "RF-XXX"],
    "descripcion": "Descripción completa del comportamiento a verificar"
  },
  "precondiciones": [
    "• Condición 1",
    "• Condición 2", 
    "• Condición N"
  ],
  "datos_entrada": {
    "datos_validos": {
      "campo1": "valor1",
      "campo2": "valor2"
    },
    "casos_error": {
      "campo_invalido": "valor_invalido",
      "otro_campo_invalido": "otro_valor_invalido"
    }
  },
  "pasos_aat": {
    "arrange": "Descripción de preparación",
    "act": [
      "1. Paso 1",
      "2. Paso 2",
      "N. Paso N"
    ],
    "assert": "Descripción de verificaciones esperadas"
  },
  "resultado_esperado": [
    "• Resultado 1",
    "• Resultado 2",
    "• Resultado N"
  ]
}
```

## 🔧 Configuración de .env

SIEMPRE incluir estas variables en el .env del proyecto raíz:

```env
# Credenciales de login
EMAIL=sigma.inmero@gmail.com
PASSWORD=Admin123456.
HEADLESS=False

# PostgreSQL Database Configuration
DB_HOST=158.69.200.27
DB_PORT=5436
DB_NAME=tester
DB_USER=tester
DB_PASSWORD=sigma.test.2025
```

## 🎯 Estructura del Código Principal

### 1. Imports y Configuración
Copiar EXACTAMENTE los imports del archivo de referencia, incluyendo:
- `psycopg2` para PostgreSQL
- `selenium` completo
- `faker` para datos de prueba
- `dotenv` para variables de entorno

### 2. Clase DatabaseManager
Copiar COMPLETA la clase `DatabaseManager` del archivo de referencia para:
- Conexión a PostgreSQL
- Verificación de datos actualizados
- Log de auditoría

### 3. Clase Principal del Test
Estructura obligatoria:
```python
class {ModuloTest}:
    def __init__(self, headless: bool = False, iterations: int = 3, verify_db: bool = True):
        # Configuración básica
        # Datos del caso de prueba específico
        # Métricas de resultados

    def verify_preconditions(self) -> bool:
        # Verificar BD, ChromeDriver, credenciales

    def setup_driver(self) -> bool:
        # Configuración Chrome (headless/visual)

    def login(self) -> bool:
        # Login usando LoginFlow

    def navigate_to_{seccion}(self) -> bool:
        # Navegación específica

    def verify_interface_elements(self) -> bool:
        # Verificar elementos clave de la interfaz

    def generate_test_data(self) -> Dict[str, str]:
        # Usar datos del caso de prueba + Faker

    def {accion_principal}(self, test_data: Dict[str, str]) -> bool:
        # Acción principal a probar

    def test_field_validations(self, test_data: Dict[str, str]) -> bool:
        # IMPORTANTE: Probar validaciones con datos inválidos
        # REPORTAR validaciones fallidas como BUGS

    def save_changes(self, test_data: Dict[str, str]) -> bool:
        # Guardar cambios Y verificar en BD

    def run_single_iteration(self, iteration_num: int) -> bool:
        # Ejecutar secuencia completa de tests

    def run_test(self) -> bool:
        # Método principal con verificación de precondiciones

    def _print_final_results(self, successful_iterations: int):
        # Reporte detallado + BUGS ENCONTRADOS

    def cleanup(self):
        # Cerrar navegador y BD
```

## 🚨 REPORTE DE BUGS OBLIGATORIO

### En el método `test_field_validations`:
```python
def test_field_validations(self, test_data: Dict[str, str]) -> bool:
    try:
        print("🧪 Probando validaciones...")
        
        bugs_found = []
        
        # Por cada validación que falle:
        if not validation_found:
            bug_info = {
                'campo': 'nombre_campo',
                'valor_invalido': test_data['campo_invalido'],
                'descripcion': 'Validación no muestra error con dato inválido',
                'impacto': 'Usuario puede introducir datos incorrectos'
            }
            bugs_found.append(bug_info)
            self.results['bugs_found'].append(bug_info)
            print(f"   🐛 BUG DETECTADO: {bug_info['descripcion']}")
```

### En `_print_final_results`:
```python
# Agregar sección de BUGS
if self.results['bugs_found']:
    print(f"\n🐛 BUGS DETECTADOS ({len(self.results['bugs_found'])}):")
    for i, bug in enumerate(self.results['bugs_found'], 1):
        print(f"  {i}. CAMPO: {bug['campo']}")
        print(f"     DATO: {bug['valor_invalido']}")
        print(f"     PROBLEMA: {bug['descripcion']}")
        print(f"     IMPACTO: {bug['impacto']}")
        print()
```

## 📊 Métricas de Resultados Obligatorias

```python
self.results = {
    'test_name': 'IT-XXXX (RF-XXX) - Título del test',
    'test_id': 'IT-XXXX',
    'requirements': ['RF-XXX'],
    'iterations_completed': 0,
    'successful_operations': 0,
    'failed_operations': 0,
    'validations_passed': 0,
    'validations_failed': 0,
    'db_verifications': 0,
    'db_verification_failures': 0,
    'bugs_found': [],  # ← NUEVO: Lista de bugs detectados
    'errors_encountered': [],
    'preconditions_met': False,
    'audit_logged': False
}
```

## 🚀 CLI Obligatoria

```python
def main():
    parser = argparse.ArgumentParser(
        description='Test IT-XXXX (RF-XXX): Descripción',
        epilog="""
Ejemplos de uso:
  python test_IT_XXXX_RF-XXX.py                      # Modo visual con BD
  python test_IT_XXXX_RF-XXX.py --headless           # Modo headless con BD
  python test_IT_XXXX_RF-XXX.py --no-verify-db       # Sin verificación BD
  python test_IT_XXXX_RF-XXX.py --check-env          # Solo verificar configuración
        """
    )
    
    # Argumentos estándar:
    # --headless, --iterations, --no-verify-db, --check-env
```

## 📖 README.md Obligatorio

Estructura del README:
1. **Título con ID y requerimientos**
2. **Descripción del caso de prueba**
3. **Precondiciones específicas**
4. **Datos de entrada del caso**
5. **Configuración técnica**
6. **Ejemplos de uso**
7. **Interpretación de resultados**
8. **Reporte de bugs**

## ✅ Verificaciones Finales

Antes de entregar, SIEMPRE verificar:

1. **Estructura de carpetas** correcta
2. **Nomenclatura** siguiendo el formato
3. **Conexión BD** funcionando
4. **Test en modo headless** y visual
5. **Reporte de bugs** implementado
6. **Documentación** completa
7. **Variables de entorno** configuradas

## 🎯 Ejemplo de Ejecución

```bash
# Verificar configuración
python test_IT_XXXX_RF-XXX.py --check-env

# Ejecutar con BD
python test_IT_XXXX_RF-XXX.py --headless --iterations 1

# Ejecutar sin BD  
python test_IT_XXXX_RF-XXX.py --headless --no-verify-db

# Modo desarrollo
python test_IT_XXXX_RF-XXX.py --iterations 1
```

## 📋 Salida Esperada

```
📊 RESULTADOS FINALES - IT-XXXX
📋 IT-XXXX (RF-XXX) - Título del test
🔗 Requerimientos: RF-XXX
================================================================================
⚡ Operaciones exitosas: X
🔍 Verificaciones BD exitosas: X
📝 Log de auditoría: ✅ Registrado
🔧 Precondiciones: ✅ Cumplidas

🐛 BUGS DETECTADOS (X):
  1. CAMPO: campo_telefono
     DATO: 123-abc-xyz
     PROBLEMA: Validación no muestra error con dato inválido
     IMPACTO: Usuario puede introducir datos incorrectos

📈 TASA DE ÉXITO: X.X%
🎉 RESULTADO: TEST EXITOSO
```

---

**USAR ESTE PROMPT COMPLETO** para todos los test cases futuros, referenciando siempre el archivo `test_IT_GUSU_006_RF-074.py` como modelo base y manteniendo la consistencia en estructura, nomenclatura y funcionalidad.
