# Tipos de Eventos Dinámicos

## Descripción
Se actualizó la sección de "Tipo de Evento (Conducción)" en el Paso 7 para que use datos dinámicos desde el backend en lugar de valores hardcodeados. Ahora los eventos se cargan desde `eventTypesList`.

## Cambios Implementados

### 1. **Eliminación de Datos Hardcodeados**
Se eliminó la constante estática:
```javascript
// ANTES (eliminado)
const eventTypes = [
  { key: "Acceleration", label: "Aceleración" },
  { key: "Braking", label: "Frenado" },
  { key: "Curve", label: "Curva" },
];
```

### 2. **Nuevo Estado para Eventos Dinámicos**
```javascript
const [expandedEventsByType, setExpandedEventsByType] = useState({});
```

### 3. **Nueva Función Toggle**
```javascript
const toggleEventByType = (eventId) => {
  setExpandedEventsByType((prev) => ({
    ...prev,
    [eventId]: !prev[eventId],
  }));
};
```

### 4. **Mapeo Dinámico desde eventTypesList**
Ahora los eventos se mapean desde la prop `eventTypesList`:
```javascript
{eventTypesList && eventTypesList.length > 0 ? (
  <div className="grid grid-cols-3 gap-4">
    {eventTypesList.map((event) => (
      <div key={event.id_event_type}>
        {/* Contenido del evento */}
      </div>
    ))}
  </div>
) : (
  <div>No hay tipos de eventos disponibles</div>
)}
```

## Estructura de Datos

### Prop `eventTypesList`
```javascript
[
  {
    id_event_type: 1,
    name: "Aceleracion"
  },
  {
    id_event_type: 2,
    name: "Frenado"
  },
  {
    id_event_type: 3,
    name: "Curva"
  }
]
```

### Registro en React Hook Form
Los datos ahora usan IDs numéricos en lugar de strings:
```javascript
// ANTES
alerts.event.Acceleration
autoRequest.event.Braking
requestType.event.Curve
thresholds.event.Acceleration

// AHORA
alerts.event.1          // ID del evento
autoRequest.event.2
requestType.event.3
thresholds.event.1
```

## Actualización en submitStep7

### Payload de Eventos Actualizado
```javascript
// ANTES
{
  parameter_id: null,
  event_type: "Acceleration",  // String
  emit_alert: true,
  automatic_request: false,
  request_type: 1,
  threshold_value: 5
}

// AHORA
{
  event_type_id: 1,            // Número (ID del tipo de evento)
  emit_alert: true,
  automatic_request: false,
  request_type: 1,
  threshold_value: 5
}
```

### Lógica de Construcción
```javascript
// Recolectar todos los IDs de eventos configurados
const eventIds = new Set([
  ...Object.keys(data.alerts?.event || {}),
  ...Object.keys(data.autoRequest?.event || {}),
  ...Object.keys(data.requestType?.event || {}),
  ...Object.keys(data.thresholds?.event || {})
]);

// Iterar sobre cada ID y construir el payload
eventIds.forEach((eventId) => {
  const alert = data.alerts?.event?.[eventId];
  const autoRequest = data.autoRequest?.event?.[eventId];
  const requestType = data.requestType?.event?.[eventId];
  const threshold = data.thresholds?.event?.[eventId];

  if (alert || autoRequest || requestType || threshold !== undefined) {
    thresholdPayload.parameters.push({
      event_type_id: Number(eventId),
      emit_alert: alert || false,
      automatic_request: autoRequest || false,
      request_type: requestType || null,
      threshold_value: threshold !== undefined ? Number(threshold) : null
    });
  }
});
```

## Flujo de Datos

1. **MultistepFormModal** carga `eventTypesList` desde el backend
2. **MultistepFormModal** pasa `eventTypesList` como prop a `Step7ThresholdSettings`
3. **Step7ThresholdSettings** mapea los eventos dinámicamente
4. Usuario activa/configura eventos por su ID
5. Datos se registran en React Hook Form con IDs numéricos
6. **submitStep7** construye el payload usando `event_type_id`
7. Payload se envía al backend con la estructura correcta

## Endpoint de Tipos de Eventos

**GET** `/event-types/` (o similar)

### Respuesta
```json
{
  "success": true,
  "message": "Tipos de eventos obtenidos exitosamente",
  "data": [
    {
      "id_event_type": 1,
      "name": "Aceleracion"
    },
    {
      "id_event_type": 2,
      "name": "Frenado"
    },
    {
      "id_event_type": 3,
      "name": "Curva"
    }
  ]
}
```

## Estado Vacío

Si `eventTypesList` está vacío o es null, se muestra:
```
[ícono]
No hay tipos de eventos disponibles
```

## Ventajas de la Implementación

✅ **Flexibilidad**: Los eventos se pueden agregar/modificar desde el backend sin cambiar código
✅ **Escalabilidad**: Soporta cualquier número de tipos de eventos
✅ **Consistencia**: Los IDs numéricos son más confiables que strings
✅ **Mantenibilidad**: Menos código hardcodeado = menos bugs
✅ **Internacionalización**: Los nombres pueden venir traducidos del backend

## Archivos Modificados

1. **Step7ThresholdSettings.jsx**
   - Eliminada constante `eventTypes`
   - Agregado estado `expandedEventsByType`
   - Agregada función `toggleEventByType`
   - Actualizado mapeo de eventos
   - Agregado estado vacío

2. **MultistepFormModal.jsx**
   - Actualizada lógica en `submitStep7`
   - Cambiado de `event_type` (string) a `event_type_id` (number)
   - Mejorada recolección de IDs de eventos

## Compatibilidad con Backend

Asegúrate de que el backend espere:
- `event_type_id`: número (ID del tipo de evento)
- `threshold_value`: número (valor del umbral)

Si el backend espera una estructura diferente, ajusta el payload en `submitStep7`.

## Notas Importantes

- Los eventos antiguos hardcodeados ya no existen
- Los IDs de eventos deben coincidir con los del backend
- El contenido interno de cada evento (checkboxes, select, input) se mantiene igual
- La funcionalidad de expandir/contraer eventos se mantiene
