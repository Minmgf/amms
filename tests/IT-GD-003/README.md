# IT-GD-003 - Gestión Integral del Listado de Dispositivos

## 📋 Descripción General

Automatización para el caso de prueba **IT-GD-003**: Gestión integral del listado de dispositivos con filtros, búsqueda, paginación y acciones CRUD.

Esta prueba verifica el funcionamiento completo del módulo de gestión de dispositivos, incluyendo filtros por fecha y estado, búsqueda rápida, paginación, y operaciones de edición y eliminación.

## 🎯 Casos de Uso Cubiertos

- **HU-GD-002**: Listar dispositivos
- **HU-GD-003**: Modificar dispositivo  
- **HU-GD-004**: Eliminar dispositivo

## 🚀 Inicio Rápido

### Ejecutar el Test

```powershell
cd IT-GD-003
python IT-GD-003.py
```

## 📊 Funcionalidades Probadas

### 1. ✅ Listado de Dispositivos
- Visualización de la tabla completa
- Conteo de dispositivos
- Verificación de columnas (Nombre, IMEI, Estado, Fecha, Acciones)

### 2. 🔍 Búsqueda Rápida
- Campo de búsqueda por nombre o IMEI
- Filtrado en tiempo real
- Validación de resultados coincidentes

### 3. 🎛️ Filtros
- Botón de filtros accesible
- Filtro por estado (Activo/Inactivo)
- Filtro por rango de fechas

### 4. 📄 Paginación
- Navegación entre páginas (Anterior/Siguiente)
- Botones numéricos de página
- Selector de items por página (10, 20, 30, 40, 50)
- Contador de páginas totales

### 5. ✏️ Edición de Dispositivos
- Botón de edición en cada fila
- Apertura de modal de edición
- Modificación de datos
- Actualización en tiempo real

### 6. 🗑️ Eliminación de Dispositivos
- Botón de eliminar para dispositivos activos
- Confirmación antes de eliminar
- Eliminación física vs lógica (soft delete)
- Actualización de lista tras eliminación

### 7. 🔄 Activación de Dispositivos
- Botón de activar para dispositivos inactivos
- Cambio de estado a activo
- Actualización visual del estado

## 📝 Pasos del Test

1. **Setup y Login** - Configuración del driver y autenticación
2. **Navegación** - Acceso al módulo de Gestión de Dispositivos
3. **Conteo Inicial** - Verificación de dispositivos en el listado
4. **Búsqueda** - Prueba de búsqueda rápida por "GPS Test"
5. **Filtros** - Aplicación de filtros por estado
6. **Paginación** - Navegación entre páginas
7. **Selector Items** - Prueba del selector de items por página
8. **Edición** - Apertura y prueba del modal de edición
9. **Eliminación** - Prueba de eliminación con confirmación
10. **Activación** - Prueba de activación de dispositivos inactivos

## 📸 Screenshots Generados

El test captura evidencia en cada paso:
- `screenshot_login_success_[timestamp].png`
- `screenshot_devices_management_page_[timestamp].png`
- `screenshot_initial_device_list_[timestamp].png`
- `screenshot_search_results_[timestamp].png`
- `screenshot_filter_activated_[timestamp].png`
- `screenshot_page_2_[timestamp].png`
- `screenshot_edit_modal_opened_[timestamp].png`
- `screenshot_delete_confirmation_[timestamp].png`
- `screenshot_activate_button_visible_[timestamp].png`
- `screenshot_final_state_[timestamp].png`

## 📊 Reporte JSON

Cada ejecución genera un reporte detallado:

```json
{
  "test_id": "IT-GD-003",
  "test_metrics": {
    "initial_device_count": 10,
    "search_results_count": 2,
    "total_pages": 4,
    "devices_per_page": 10
  },
  "results": [...],
  "summary": {
    "total_steps": 12,
    "passed": 12,
    "failed": 0,
    "success_rate": "100.0%"
  }
}
```

## 🔧 Selectores Utilizados

### Navegación
```python
monitoring_menu = "//a[@href='/sigma/monitoring']"
devices_link = "//a[@href='/sigma/monitoring/devicesManagement']"
```

### Búsqueda y Filtros
```python
search_input = "//input[@placeholder='Buscar por nombre o IMEI...']"
filter_button = "//button[@aria-label='Filter Button']"
```

### Tabla
```python
table_body = "//tbody[@class='parametrization-table-body']"
device_rows = "//tbody[@class='parametrization-table-body']/tr"
```

### Acciones en Filas
```python
edit_button = ".//button[@aria-label='Edit Button']"
delete_button = ".//button[@aria-label='Delete Button']"
activate_button = ".//button[@aria-label='Activate Button']"
```

### Paginación
```python
next_button = "//button[contains(text(), 'Next')]"
previous_button = "//button[contains(text(), 'Previous')]"
page_selector = "//select[contains(@class, 'parametrization-pagination-select')]"
```

## 📋 Precondiciones

- ✅ Al menos 10-25 dispositivos registrados
- ✅ Dispositivos con diferentes estados (Activo/Inactivo)
- ✅ Usuario con permisos de consulta, modificación y eliminación
- ✅ Sistema de paginación configurado
- ✅ Aplicación corriendo en `http://localhost:3000/sigma`

## 🎯 Resultados Esperados

- ✅ El listado muestra todos los dispositivos correctamente
- ✅ La búsqueda filtra por nombre e IMEI
- ✅ Los filtros reducen el listado apropiadamente
- ✅ La paginación funciona correctamente
- ✅ Las modificaciones se reflejan en tiempo real
- ✅ La eliminación muestra confirmación
- ✅ Dispositivos inactivos pueden activarse
- ✅ Todas las acciones son registradas

## 💡 Notas Importantes

### Hover para Mostrar Acciones
Los botones de Editar/Eliminar/Activar se muestran al hacer hover sobre las filas:
```python
actions = ActionChains(self.driver)
actions.move_to_element(row).perform()
time.sleep(2)  # Esperar que aparezcan los botones
```

### Diferencia entre Eliminar y Activar
- **Dispositivos Activos**: Muestran botón "Eliminar"
- **Dispositivos Inactivos**: Muestran botón "Activar"

### Manejo de Alertas y Modales
El test maneja tanto alertas JavaScript como modales React:
```python
try:
    alert = self.driver.switch_to.alert
    alert.dismiss()  # o alert.accept()
except:
    # Buscar modal
    modal = self.driver.find_element(...)
```

## 🐛 Troubleshooting

### Error: Botones no visibles
- Asegúrate de hacer hover sobre la fila antes de buscar los botones
- Aumenta el tiempo de espera después del hover

### Error: Búsqueda no filtra
- Verifica que hay tiempo suficiente para que se aplique el filtro
- Comprueba que el campo de búsqueda esté limpio antes de escribir

### Error: Paginación no funciona
- Verifica que hay suficientes dispositivos para múltiples páginas
- Comprueba que los botones no estén deshabilitados

## 📖 Documentación Adicional

- `README.md` - Esta documentación
- `IT-GD-003.py` - Script principal
- `IT-GD-003-reporte.md` - Plantilla de reporte manual
- `test_config.py` - Configuración de selectores

---

**Última actualización**: 2025-11-02
**Versión**: 1.0.0
