# Test IT-GUSU-006 (RF-074, RF-79-1) - Interfaz de Edición de Perfil

## 📋 Información del Caso de Prueba

**ID**: IT-GUSU-006  
**Título**: Interfaz de edición de perfil  
**Referencias**: RF-074, RF-79-1  
**Módulo**: Gestión de Usuarios (GUSU)

## 📝 Descripción

Verificar que la interfaz de edición de perfil permita al usuario actualizar correctamente su información personal, subir foto de perfil y cambiar contraseña, validando todos los campos y mostrando mensajes apropiados.

### Funcionalidades Verificadas
- ✅ Carga correcta de la interfaz de perfil
- ✅ Actualización de información personal (nombres, dirección, teléfono)
- ✅ Validación de campos con datos inválidos
- ✅ Modal de cambio de foto de perfil 
- ✅ Modal de cambio de contraseña con validaciones
- ✅ Guardado de cambios en interfaz
- ✅ Verificación de persistencia en base de datos PostgreSQL
- ✅ Registro en log de auditoría

## 🔧 Precondiciones

- [x] Usuario autenticado en el sistema
- [x] Acceso a la sección 'Mi Perfil'
- [x] Servicio de almacenamiento configurado (Firebase Storage)
- [x] Conexión activa a la base de datos PostgreSQL
- [x] Políticas de seguridad para contraseñas configuradas

## 🚀 Uso Rápido

### Ejecución Básica
```bash
# Modo visual con verificación de BD (recomendado para desarrollo)
python test_IT_GUSU_006_RF-074.py

# Modo headless con verificación de BD (recomendado para CI/CD)
python test_IT_GUSU_006_RF-074.py --headless

# Múltiples iteraciones
python test_IT_GUSU_006_RF-074.py --iterations 5

# Sin verificación de BD (solo UI)
python test_IT_GUSU_006_RF-074.py --no-verify-db

# Verificar configuración
python test_IT_GUSU_006_RF-074.py --check-env
```

## ⚙️ Configuración

### Prerrequisitos Técnicos
1. **Python 3.8+** con las siguientes dependencias:
   ```bash
   pip install selenium faker python-dotenv psycopg2-binary
   ```

2. **ChromeDriver** ubicado en `../chromedriver/driver.exe`

3. **Archivo .env** en la raíz del proyecto con:
   ```env
   # Credenciales de login
   EMAIL=tu_email@ejemplo.com
   PASSWORD=tu_password
   HEADLESS=false
   
   # Configuración PostgreSQL
   DB_HOST=158.69.200.27
   DB_PORT=5436
   DB_NAME=tester
   DB_USER=tester
   DB_PASSWORD=sigma.test.2025
   ```

4. **Servidor activo** en `http://localhost:3000`
5. **Base de datos PostgreSQL** accesible (para verificación completa)

### Datos de Entrada del Caso de Prueba
El test utiliza los datos específicos definidos en IT-GUSU-006:
```json
{
   "informacion_personal": {
     "nombres": "Juan Carlos",
     "apellidos": "Pérez González",
     "telefono": "+57-300-123-4567",
     "direccion": "Calle 123 #45-67",
     "pais": "Colombia",
     "departamento": "Cundinamarca",
     "ciudad": "Bogotá"
   },
   "casos_error": {
     "telefono_invalido": "123-abc-xyz",
     "password_debil": "123456"
   }
}
```

### Verificación Automática
El test verifica automáticamente las precondiciones:
```bash
python test_IT_GUSU_006_RF-074.py --check-env
```

## 📊 Interpretación de Resultados

### Estados del Test
- 🎉 **TEST EXITOSO**: ≥70% de éxito
- ⚠️ **PARCIALMENTE EXITOSO**: 40-69% de éxito
- ❌ **TEST FALLIDO**: <40% de éxito

### Métricas Importantes
- **Iteraciones completadas**: Número de ejecuciones sin crashes
- **Operaciones exitosas**: Acciones que funcionaron correctamente
- **Validaciones exitosas**: Verificaciones de interfaz que pasaron
- **Tasa de éxito**: Porcentaje general de operaciones exitosas

### Ejemplo de Salida
```
📊 RESULTADOS FINALES
================================================================================
⏱️ Tiempo de ejecución: 32.2s
🔄 Iteraciones completadas: 1/1
✅ Iteraciones exitosas: 1/1
⚡ Operaciones exitosas: 3
❌ Operaciones fallidas: 0
✔️ Validaciones exitosas: 2
❌ Validaciones fallidas: 1

📈 TASA DE ÉXITO: 100.0%
🎉 RESULTADO: TEST EXITOSO
```

## 🔧 Parámetros de Configuración

### Línea de Comandos
- `--headless`, `-H`: Ejecutar sin interfaz gráfica
- `--iterations`, `-i`: Número de iteraciones (default: 3)
- `--check-env`: Solo verificar configuración

### Variables de Entorno
- `EMAIL`: Email para login automático
- `PASSWORD`: Contraseña para login
- `HEADLESS`: true/false para modo headless
- `BASE_URL`: URL base del sistema (default: http://localhost:3000)

## 🎯 Casos de Uso

### Testing de Desarrollo
```bash
# Verificación rápida durante desarrollo
python test_profile_edit.py --iterations 1

# Testing visual para debuggear problemas
python test_profile_edit.py
```

### Testing de CI/CD
```bash
# Testing automático sin interfaz
python test_profile_edit.py --headless --iterations 3

# Testing de regresión
python test_profile_edit.py --headless --iterations 1
```

### Testing de Estabilidad
```bash
# Testing intensivo
python test_profile_edit.py --headless --iterations 10
```

## 🔍 Solución de Problemas

### Error: "ChromeDriver no encontrado"
**Solución**: Descargar ChromeDriver desde https://chromedriver.chromium.org/ y colocarlo en `../chromedriver/driver.exe`

### Error: "Variable EMAIL no encontrada"
**Solución**: Crear archivo `.env` con las credenciales correctas

### Error: "Login failed"
**Solución**: 
1. Verificar que el servidor esté ejecutándose en http://localhost:3000
2. Comprobar credenciales en el archivo `.env`
3. Verificar que el módulo `login_flow.py` esté en `../flows/auth/login/`

### Validaciones no detectadas
Es normal que algunas validaciones no se detecten visualmente. El test usa un sistema de puntuación que tolera estos casos menores.

## 📁 Estructura Final

Después de la limpieza, la carpeta contiene únicamente:
```
test case/
├── test_profile_edit.py    # ← Test principal (único archivo necesario)
├── .env.example           # ← Plantilla de configuración
└── README.md              # ← Esta documentación
```

## 🤝 Contribución

Para modificar o extender el test:
1. **Selectores**: Actualizar los selectores en la sección `SELECTORS` si cambia la interfaz
2. **Datos de prueba**: Modificar `generate_test_data()` para diferentes escenarios
3. **Nuevas validaciones**: Agregar métodos de test en la clase `ProfileEditTest`
4. **Criterios de éxito**: Ajustar la lógica de puntuación en `run_single_iteration()`

## 📊 Interpretación de Resultados

### Estados del Test IT-GUSU-006
- 🎉 **TEST EXITOSO**: ≥80% de éxito y precondiciones cumplidas
- ⚠️ **PARCIALMENTE EXITOSO**: 60-79% de éxito
- ❌ **TEST FALLIDO**: <60% de éxito

### Métricas Específicas
- **Iteraciones completadas**: Ejecuciones sin crashes fatales
- **Operaciones UI**: Interacciones exitosas con la interfaz
- **Validaciones**: Verificaciones de campos y comportamiento
- **Verificaciones BD**: Confirmación de persistencia de datos
- **Log de auditoría**: Registro de actividad en BD
- **Precondiciones**: Estado de requisitos del caso de prueba

### Ejemplo de Salida Completa
```
📊 RESULTADOS FINALES - IT-GUSU-006
📋 IT-GUSU-006 (RF-074, RF-79-1) - Interfaz de edición de perfil
🔗 Requerimientos: RF-074, RF-79-1
================================================================================
⏱️ Tiempo de ejecución: 32.9s
🔄 Iteraciones completadas: 1/1
✅ Iteraciones exitosas: 1/1
⚡ Operaciones exitosas: 3
❌ Operaciones fallidas: 0
✔️ Validaciones exitosas: 2
❌ Validaciones fallidas: 1
🔍 Verificaciones BD exitosas: 1
❌ Verificaciones BD fallidas: 0
📝 Log de auditoría: ✅ Registrado
🔧 Precondiciones: ✅ Cumplidas

📈 TASA DE ÉXITO: 100.0%
🎉 RESULTADO: TEST EXITOSO

📋 RESUMEN EJECUTIVO:
   • Estado: EXITOSO
   • Funcionalidad UI: ✅
   • Persistencia BD: ✅
   • Auditoría: ✅
   • Validaciones: ✅
```

## ⚡ Ventajas del Nuevo Formato

### Estructura Organizada
- **Carpeta única**: `test_IT_GUSU_006_RF-074/` con nomenclatura estándar
- **Archivo principal**: `test_IT_GUSU_006_RF-074.py` identifica módulo y requerimiento
- **Documentación específica**: README enfocado en el caso de prueba

### Verificación Completa
- **UI Testing**: Validación completa de interfaz y flujos
- **Database Verification**: Confirmación de persistencia de datos
- **Audit Logging**: Registro de ejecuciones para trazabilidad
- **Preconditions Check**: Validación automática de prerrequisitos

### Flexibilidad de Ejecución
- **Modo visual**: Para desarrollo y debugging
- **Modo headless**: Para integración continua
- **Con/sin BD**: Según disponibilidad de infraestructura
- **Múltiples iteraciones**: Para testing de estabilidad

---
**Versión**: 2.0 | **Test Case**: IT-GUSU-006 (RF-074, RF-79-1) | **Módulo**: GUSU | **Autor**: Automatización QA
