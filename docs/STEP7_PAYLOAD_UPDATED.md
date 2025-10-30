# Payload Actualizado - Paso 7: Configuración de Umbrales

## Estructura del Payload

El payload del paso 7 se ha actualizado para coincidir con la estructura esperada por el backend.

### Objeto Principal

```json
{
  "id_machinery": number,
  "tolerance_thresholds": Array<ToleranceThreshold>,
  "obd_fault_machinery": Array<OBDFault>,
  "event_type_machinery": Array<EventType>
}
```

## Tipos de Datos

### 1. Tolerance Thresholds (Parámetros con Sliders)

```json
{
  "id_parameter": number,
  "minimum_threshold": number | null,
  "maximum_threshold": number | null,
  "id_maintenance": number | null,
  "alert_enabled": boolean
}
```

**Campos:**
- `id_parameter`: ID del parámetro (3, 6, 7, 8, 9, 10, 11, 12, 14, 15)
- `minimum_threshold`: Valor mínimo del umbral
- `maximum_threshold`: Valor máximo del umbral
- `id_maintenance`: ID del tipo de mantenimiento (del select)
- `alert_enabled`: Si está activado el checkbox "Emitir alerta"

**Validación de Envío:**
- ✅ Se envía solo si `alert_enabled` O `autoRequest` están activados
- ✅ Si ninguno de los dos checkboxes está activado, NO se envía

### 2. OBD Fault Machinery (Códigos OBD)

```json
{
  "id_obd_fault": number,
  "alert_enabled": boolean,
  "id_maintenance": number | null
}
```

**Campos:**
- `id_obd_fault`: ID del código OBD (obtenido de la búsqueda)
- `alert_enabled`: Si está activado el checkbox "Emitir alerta"
- `id_maintenance`: ID del tipo de mantenimiento (del select)

**Validación de Envío:**
- ✅ Se envía solo si `alert_enabled` O `autoRequest` están activados
- ✅ Si ninguno de los dos checkboxes está activado, NO se envía
- ⚠️ Requiere que el código OBD haya sido buscado previamente

### 3. Event Type Machinery (Tipos de Eventos)

```json
{
  "id_event_type": number,
  "threshold": number | null,
  "alert_enabled": boolean,
  "id_maintenance": number | null
}
```

**Campos:**
- `id_event_type`: ID del tipo de evento (1, 2, 3, etc.)
- `threshold`: Valor del umbral (Event G-Value)
- `alert_enabled`: Si está activado el checkbox "Emitir alerta"
- `id_maintenance`: ID del tipo de mantenimiento (del select)

**Validación de Envío:**
- ✅ Se envía solo si `alert_enabled` O `autoRequest` están activados
- ✅ Si ninguno de los dos checkboxes está activado, NO se envía
- ⚠️ Solo se envían eventos que fueron expandidos/activados por el usuario

## Ejemplo Completo

```json
{
  "id_machinery": 12,
  "tolerance_thresholds": [
    {
      "id_parameter": 7,
      "minimum_threshold": -20.5,
      "maximum_threshold": 80.2,
      "id_maintenance": 1,
      "alert_enabled": true
    },
    {
      "id_parameter": 12,
      "minimum_threshold": 300,
      "maximum_threshold": 30000,
      "id_maintenance": 1,
      "alert_enabled": true
    }
  ],
  "obd_fault_machinery": [
    {
      "id_obd_fault": 1,
      "alert_enabled": true,
      "id_maintenance": 2
    },
    {
      "id_obd_fault": 3,
      "alert_enabled": false,
      "id_maintenance": null
    }
  ],
  "event_type_machinery": [
    {
      "id_event_type": 1,
      "threshold": 255,
      "alert_enabled": true,
      "id_maintenance": 3
    },
    {
      "id_event_type": 2,
      "threshold": 200,
      "alert_enabled": false,
      "id_maintenance": null
    }
  ]
}
```

## Mapeo de Campos del Formulario

### Tolerance Thresholds

| Campo del Formulario | Campo del Payload |
|---------------------|-------------------|
| `alerts.currentSpeed` | `alert_enabled` |
| `autoRequest.currentSpeed` | *(usado para validación)* |
| `requestType.currentSpeed` | `id_maintenance` |
| `thresholds.currentSpeedMin` | `minimum_threshold` |
| `thresholds.currentSpeedMax` | `maximum_threshold` |
| `thresholds.currentSpeedId` | `id_parameter` |

### OBD Fault Machinery

| Campo del Formulario | Campo del Payload |
|---------------------|-------------------|
| `alerts.obd.P0087` | `alert_enabled` |
| `autoRequest.obd.P0087` | *(usado para validación)* |
| `requestType.obd.P0087` | `id_maintenance` |
| `obdSearchResults[].id` | `id_obd_fault` |

### Event Type Machinery

| Campo del Formulario | Campo del Payload |
|---------------------|-------------------|
| `alerts.event.1` | `alert_enabled` |
| `autoRequest.event.1` | *(usado para validación)* |
| `requestType.event.1` | `id_maintenance` |
| `thresholds.event.1` | `threshold` |
| `eventTypesList[].id_event_type` | `id_event_type` |

## Lógica de Construcción del Payload

### 1. Tolerance Thresholds

```javascript
const addToleranceThreshold = (parameterId, paramName) => {
  const alert = data.alerts?.[paramName];
  const autoRequest = data.autoRequest?.[paramName];
  const requestType = data.requestType?.[paramName];
  const minValue = data.thresholds?.[`${paramName}Min`];
  const maxValue = data.thresholds?.[`${paramName}Max`];

  // Solo agregar si al menos uno de los dos checkboxes está activado
  if (alert || autoRequest) {
    thresholdPayload.tolerance_thresholds.push({
      id_parameter: parameterId,
      minimum_threshold: minValue !== undefined ? Number(minValue) : null,
      maximum_threshold: maxValue !== undefined ? Number(maxValue) : null,
      id_maintenance: requestType ? Number(requestType) : null,
      alert_enabled: alert || false
    });
  }
};
```

### 2. OBD Fault Machinery

```javascript
obdCodes.forEach((obdCode) => {
  const alert = data.alerts?.obd?.[obdCode];
  const autoRequest = data.autoRequest?.obd?.[obdCode];
  const requestType = data.requestType?.obd?.[obdCode];

  // Solo agregar si al menos uno de los dos checkboxes está activado
  if (alert || autoRequest) {
    const obdFault = obdSearchResults?.find(item => item.code === obdCode);
    
    if (obdFault) {
      thresholdPayload.obd_fault_machinery.push({
        id_obd_fault: obdFault.id,
        alert_enabled: alert || false,
        id_maintenance: requestType ? Number(requestType) : null
      });
    }
  }
});
```

### 3. Event Type Machinery

```javascript
eventIds.forEach((eventId) => {
  const alert = data.alerts?.event?.[eventId];
  const autoRequest = data.autoRequest?.event?.[eventId];
  const requestType = data.requestType?.event?.[eventId];
  const threshold = data.thresholds?.event?.[eventId];

  // Solo agregar si al menos uno de los dos checkboxes está activado
  if (alert || autoRequest) {
    thresholdPayload.event_type_machinery.push({
      id_event_type: Number(eventId),
      threshold: threshold !== undefined && threshold !== "" ? Number(threshold) : null,
      alert_enabled: alert || false,
      id_maintenance: requestType ? Number(requestType) : null
    });
  }
});
```

## Validaciones Implementadas

### ✅ Validación de Checkboxes
- Un parámetro/evento/código OBD solo se envía si:
  - `alert_enabled` está activado, O
  - `autoRequest` está activado

### ✅ Validación de Datos Vacíos
- Si ningún array tiene elementos, el payload completo no se envía
- Se verifica: `tolerance_thresholds.length > 0 || obd_fault_machinery.length > 0 || event_type_machinery.length > 0`

### ✅ Conversión de Tipos
- Todos los IDs se convierten a `Number()`
- Los valores de umbral se convierten a `Number()`
- Los valores vacíos o undefined se convierten a `null`

### ✅ Validación de OBD Faults
- Solo se envían códigos OBD que existen en `obdSearchResults`
- Si un código no tiene `id`, no se incluye en el payload

## Diferencias con la Versión Anterior

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| Nombre del campo raíz | `machinery_id` | `id_machinery` |
| Estructura de parámetros | `parameters[]` | `tolerance_thresholds[]` |
| Campo de alerta | `emit_alert` | `alert_enabled` |
| Campo de solicitud automática | `automatic_request` | *(solo para validación)* |
| Campo de tipo de solicitud | `request_type` | `id_maintenance` |
| Valores min/max | `min_value`, `max_value` | `minimum_threshold`, `maximum_threshold` |
| Eventos | `event_type_id` en `parameters[]` | Objeto separado `event_type_machinery[]` |
| Códigos OBD | `obd_code` en `parameters[]` | Objeto separado `obd_fault_machinery[]` |

## Notas Importantes

1. **Checkbox "Solicitud automática"**: Aunque se captura en el formulario, NO se envía al backend. Solo se usa para validar si el item debe incluirse en el payload.

2. **ID de OBD Faults**: Se obtiene del resultado de la búsqueda (`obdSearchResults`), no del código directamente.

3. **Eventos Dinámicos**: Los IDs de eventos vienen de `eventTypesList` y son numéricos.

4. **Valores Null**: Los campos opcionales se envían como `null` si no tienen valor, no como cadenas vacías.

5. **Paso Opcional**: Si el usuario no configura nada en el paso 7, el payload no se envía, pero el registro se confirma de todas formas.
