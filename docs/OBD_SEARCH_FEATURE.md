# Funcionalidad de Búsqueda de Códigos OBD

## Descripción
Se implementó una funcionalidad de búsqueda dinámica de códigos OBD en el Paso 7 del formulario de registro de maquinaria. Los usuarios pueden buscar códigos OBD específicos que se consultan desde el backend y agregarlos a la lista de configuración.

## Cambios Implementados

### 1. **Estados Agregados**
```javascript
const [obdSearchCode, setObdSearchCode] = useState("");        // Código a buscar
const [obdSearchResults, setObdSearchResults] = useState([]);  // Resultados encontrados
const [isSearchingObd, setIsSearchingObd] = useState(false);   // Estado de carga
const [obdSearchError, setObdSearchError] = useState("");      // Mensajes de error
```

### 2. **Función de Búsqueda**
```javascript
const handleSearchObd = async () => {
  // Valida que se haya ingresado un código
  // Llama al servicio getOBDFaults(code)
  // Agrega el resultado a la lista si no existe
  // Muestra errores si el código no se encuentra
}
```

### 3. **Función de Eliminación**
```javascript
const handleRemoveObdCode = (codeToRemove) => {
  // Elimina un código de la lista de resultados
}
```

### 4. **UI Actualizada**

#### Buscador
- Input de texto para ingresar el código OBD
- Convierte automáticamente a mayúsculas
- Permite buscar presionando Enter o el botón "Buscar"
- Muestra estado de carga mientras busca
- Muestra mensajes de error si:
  - No se ingresa un código
  - El código ya está en la lista
  - El código no se encuentra en el backend

#### Lista de Resultados
- Muestra los códigos OBD encontrados con su descripción
- Cada código tiene:
  - Checkbox "Emitir alerta"
  - Checkbox "Solicitud automática"
  - Select para tipo de solicitud (mantenimiento)
  - Botón para eliminar el código de la lista
- Si no hay códigos, muestra un mensaje informativo

#### Estado Vacío
- Muestra un ícono y mensaje cuando no hay códigos agregados
- Invita al usuario a buscar códigos

## Endpoint Utilizado

**GET** `/obd-faults/by-code/?code={code}`

### Respuesta Exitosa
```json
{
  "success": true,
  "message": "Fallo OBD encontrado exitosamente",
  "data": {
    "id_obd_fault": 1,
    "code": "P0087",
    "description": "Fuel Rail/System Pressure - Too Low"
  }
}
```

### Respuesta de Error
```json
{
  "success": false,
  "message": "Código OBD no encontrado"
}
```

## Flujo de Uso

1. Usuario ingresa un código OBD (ej: "P0087") en el campo de búsqueda
2. Usuario presiona Enter o hace clic en "Buscar"
3. Se muestra "Buscando..." mientras se consulta el backend
4. Si el código existe:
   - Se agrega a la lista con su descripción
   - Se limpian el campo de búsqueda
   - Se muestran los controles (checkboxes y select)
5. Si el código no existe:
   - Se muestra un mensaje de error
6. Usuario puede eliminar códigos usando el botón de basura
7. Usuario configura alertas y solicitudes para cada código
8. Al guardar el formulario, se envían los códigos configurados

## Validaciones

- ✅ No permite agregar códigos vacíos
- ✅ No permite agregar códigos duplicados
- ✅ Convierte códigos a mayúsculas automáticamente
- ✅ Muestra mensajes de error claros
- ✅ Deshabilita el input y botón mientras busca

## Integración con el Formulario

Los códigos OBD se registran en React Hook Form con la estructura:
```javascript
alerts.obd.{code}         // boolean
autoRequest.obd.{code}    // boolean
requestType.obd.{code}    // number | ""
```

Estos datos se envían al backend en el payload del paso 7 mediante la función `submitStep7()`.

## Mejoras Futuras (Opcionales)

1. **Búsqueda por descripción**: Permitir buscar por palabras clave en la descripción
2. **Autocompletado**: Sugerir códigos mientras el usuario escribe
3. **Historial de búsqueda**: Guardar códigos buscados recientemente
4. **Búsqueda múltiple**: Permitir agregar varios códigos a la vez
5. **Categorización**: Agrupar códigos por tipo (P, C, B, U)
6. **Exportar/Importar**: Permitir guardar y cargar configuraciones de códigos

## Archivos Modificados

- `Step7ThresholdSettings.jsx`: Componente principal con la funcionalidad
- Importaciones agregadas: `FaTrash` de react-icons
- Servicio utilizado: `getOBDFaults` de `machineryService.js`

## Notas Técnicas

- Los datos de ejemplo (P0001, P0002, P0003) fueron eliminados
- La lista de códigos es dinámica y se construye mediante búsquedas
- Los códigos se almacenan en el estado local del componente
- Al cerrar el modal, los códigos buscados se pierden (no se persisten)
- Para persistir códigos entre sesiones, se necesitaría implementar carga desde el backend
