# Prueba de Integración IT-GM-003: Actualizar Mantenimiento

## Descripción
Esta prueba de integración valida la funcionalidad de actualización de mantenimientos según la historia de usuario IT-GM-003.

## Historia de Usuario
**Código:** IT-GM-003  
**Como:** jefe de mantenimiento  
**Quiero:** actualizar la información de un mantenimiento ya registrado  
**Para:** asegurar que los datos disponibles para solicitudes y programaciones estén correctos y actualizados

## Criterios de Aceptación Validados

### ✅ CA1: Selección de mantenimiento del listado
- El sistema permite seleccionar un mantenimiento del listado (IT-GM-002 Listar Mantenimientos)
- Se muestra el detalle del mantenimiento seleccionado

### ✅ CA2: Modificación de campos editables
- **Nombre del mantenimiento*** (texto) - Campo obligatorio
- **Descripción** (texto de 300 caracteres)
- **Tipo de mantenimiento*** (maintenance_type, selección parametrizable: preventivo, correctivo, predictivo, etc.)

### ✅ CA3: Validación de campos obligatorios
- El sistema valida que los campos obligatorios estén completos antes de guardar
- Se muestran mensajes de error apropiados para campos faltantes

### ✅ CA4: Validación de nombres duplicados
- El sistema impide el registro de mantenimientos duplicados con el nombre
- Se muestra mensaje de error cuando se intenta usar un nombre existente

### ✅ CA5: Guardado y confirmación
- Al guardar, el sistema almacena el mantenimiento en la base de datos
- Se confirma la operación con mensaje de éxito

### ✅ CA6: Control de permisos
- Solo los usuarios con permisos de gestión de mantenimientos pueden actualizar mantenimientos

## Configuración de la Prueba

### Requisitos Previos
1. **ChromeDriver:** Debe estar disponible en el sistema
2. **Aplicación:** La aplicación AMMS debe estar ejecutándose
3. **Credenciales:** Usuario con permisos de gestión de mantenimientos

### Configuración del Entorno
```bash
# Instalar dependencias
pip install selenium requests

# Configurar entorno automáticamente
python setup_IT_GM_003_test.py
```

### Variables de Configuración
Antes de ejecutar la prueba, ajusta las siguientes variables en el script:

```python
# URL de la aplicación
APP_URL = "http://localhost:3000/sigma"  # Ajustar según tu configuración

# Credenciales de login
LOGIN_EMAIL = "diegosamboni2001@gmail.com"  # Ajustar credenciales
LOGIN_PASSWORD = "Juandiego19!"  # Ajustar credenciales
```

## Ejecución de la Prueba

### Comando de Ejecución
```bash
python test_IT_GM_003_update_maintenance.py
```

### Flujo de la Prueba
1. **Login:** Autenticación en la aplicación
2. **Navegación:** Acceso al módulo de gestión de mantenimientos
3. **Selección:** Selección de un mantenimiento del listado
4. **Edición:** Modificación de campos (nombre, descripción, tipo)
5. **Validación:** Prueba de validaciones de campos obligatorios
6. **Duplicados:** Prueba de validación de nombres duplicados
7. **Guardado:** Confirmación de guardado exitoso

### Resultados Esperados
- ✅ Navegación exitosa al módulo de mantenimientos
- ✅ Selección correcta del mantenimiento
- ✅ Edición exitosa de campos
- ✅ Validaciones funcionando correctamente
- ✅ Guardado exitoso con confirmación

## Screenshots
La prueba genera screenshots automáticamente:
- `screenshot_IT_GM_003_[timestamp].png` - Captura final del estado

## Logs de Ejecución
La prueba genera logs detallados de cada paso:
```
=== INICIANDO PRUEBA DE INTEGRACIÓN IT-GM-003: ACTUALIZAR MANTENIMIENTO ===
Realizando login...
Login exitoso
Navegando al módulo de gestión de mantenimientos...
Navegación exitosa al módulo de mantenimientos
Seleccionando mantenimiento del listado...
Mantenimiento seleccionado para edición
Editando campos del mantenimiento...
Nombre actualizado: Mantenimiento_Test_ABC123
Descripción actualizada: Descripción actualizada del mantenimiento - XYZ789
Tipo de mantenimiento actualizado
Validando campos obligatorios...
Validación de campos obligatorios funcionando correctamente
Probando validación de nombres duplicados...
Validación de nombres duplicados funcionando correctamente
Guardando cambios del mantenimiento...
Cambios guardados exitosamente
✅ PRUEBA DE INTEGRACIÓN IT-GM-003 COMPLETADA EXITOSAMENTE
```

## Troubleshooting

### Problemas Comunes
1. **ChromeDriver no encontrado:**
   - Verificar que chromedriver.exe esté en el directorio correcto
   - Ejecutar `python setup_IT_GM_003_test.py` si es necesario

2. **Error de login:**
   - Verificar que la aplicación esté ejecutándose
   - Ajustar credenciales en test_config.py
   - Verificar URL de la aplicación

3. **Elementos no encontrados:**
   - Verificar que la aplicación esté completamente cargada
   - Ajustar selectores XPath según la estructura de la aplicación
   - Aumentar tiempo de espera si es necesario

4. **Validaciones no detectadas:**
   - Verificar que los mensajes de error tengan las clases CSS esperadas
   - Ajustar selectores de validación según la implementación

## Personalización

### Ajustar Selectores
Si los selectores XPath no funcionan, ajusta según tu implementación:

```python
# Ejemplo de ajuste de selectores
name_input = driver.find_element(By.XPATH, "//input[@name='name']")  # Ajustar según tu formulario
description_input = driver.find_element(By.XPATH, "//textarea[@name='description']")
```

### Ajustar Tiempos de Espera
```python
wait = WebDriverWait(driver, 15)  # Aumentar tiempo de espera si es necesario
```

## Integración con CI/CD
Esta prueba puede integrarse en pipelines de CI/CD:

```yaml
# Ejemplo para GitHub Actions
- name: Run IT-GM-003 Integration Test
  run: |
    python test_IT_GM_003_update_maintenance.py
    if [ $? -eq 0 ]; then
      echo "✅ IT-GM-003 test passed"
    else
      echo "❌ IT-GM-003 test failed"
      exit 1
    fi
```

## Estado Actual de la Implementación

### ⚠️ **IMPORTANTE: Funcionalidad No Implementada**

La prueba actual **NO puede ejecutarse completamente** porque la funcionalidad de edición de mantenimientos **NO está implementada** en la aplicación AMMS actual.

#### Funcionalidades que SÍ están implementadas:
- ✅ Login y autenticación
- ✅ Navegación al módulo de mantenimientos
- ✅ Listado de mantenimientos
- ✅ Botones de "Editar mantenimiento" (pero no funcionales)

#### Funcionalidades que NO están implementadas:
- ❌ Modal de edición de mantenimientos
- ❌ Formulario de actualización
- ❌ Validaciones de campos obligatorios
- ❌ Validación de nombres duplicados
- ❌ Funcionalidad de guardado
- ❌ Endpoints de actualización

### Para que la prueba funcione completamente:
1. **Implementar el modal de edición** con los campos requeridos
2. **Crear el formulario de actualización** con validaciones
3. **Implementar la funcionalidad de guardado** en el backend
4. **Una vez implementado**, la prueba funcionará al 100%

## Reportes
La prueba genera reportes detallados en JSON con:
- Métricas de éxito/fallo
- Screenshots de cada paso
- Logs detallados de ejecución
- Análisis de funcionalidades implementadas vs. requeridas



