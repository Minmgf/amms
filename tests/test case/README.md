# Test IT-GUSU-006 - Interfaz de Edición de Perfil

## 📋 Descripción
Test automatizado que verifica la funcionalidad completa de la interfaz de edición de perfil de usuario, incluyendo:
- ✅ Actualización de información personal
- ✅ Validación de campos
- ✅ Modal de cambio de foto de perfil 
- ✅ Modal de cambio de contraseña
- ✅ Guardado de cambios

## 🚀 Uso Rápido

### Ejecución Básica
```bash
# Modo visual (recomendado para desarrollo)
python test_profile_edit.py

# Modo headless (recomendado para CI/CD)
python test_profile_edit.py --headless

# Múltiples iteraciones
python test_profile_edit.py --iterations 5

# Verificar configuración
python test_profile_edit.py --check-env
```

## ⚙️ Configuración

### Prerrequisitos
1. **Python 3.8+** con las siguientes dependencias:
   ```bash
   pip install selenium faker python-dotenv
   ```

2. **ChromeDriver** ubicado en `../chromedriver/driver.exe`

3. **Archivo .env** en la raíz del proyecto con:
   ```env
   EMAIL=tu_email@ejemplo.com
   PASSWORD=tu_password
   HEADLESS=false
   ```

4. **Servidor activo** en `http://localhost:3000`

### Verificación Automática
El test verifica automáticamente la configuración y crea el archivo `.env` si no existe:
```bash
python test_profile_edit.py --check-env
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

---
**Versión**: 1.0 | **Test Case**: IT-GUSU-006 | **Autor**: Automatización QA
