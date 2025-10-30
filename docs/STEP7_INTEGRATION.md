# Integración del Paso 7 - Configuración de Umbrales

## Descripción
El paso 7 del formulario multistep permite configurar umbrales de tolerancia para diferentes parámetros de la maquinaria. Esta configuración se envía al backend mediante el servicio `registerThresholdSetting`.

## Endpoint
- **URL**: `/tolerance-thresholds/create/`
- **Método**: `POST`
- **Servicio**: `registerThresholdSetting(payload)`

## Estructura del Payload

### Objeto Principal
```json
{
  "machinery_id": number,
  "parameters": Array<Parameter>
}
```

### Tipos de Parámetros

#### 1. Parámetros Estándar (con rangos min/max)
```json
{
  "parameter_id": number,
  "emit_alert": boolean,
  "automatic_request": boolean,
  "request_type": number | null,
  "min_value": number | null,
  "max_value": number | null
}
```

**IDs de Parámetros Estándar:**
- `3` - Velocidad actual (currentSpeed)
- `6` - RPM (rpm)
- `7` - Temperatura del motor (engineTemp)
- `8` - Carga del motor (engineLoad)
- `9` - Nivel de aceite (oilLevel)
- `10` - Nivel de combustible (fuelLevel)
- `11` - Combustible usado GPS (fuelUsedGps)
- `12` - Consumo instantáneo de combustible (instantFuelConsumption)
- `14` - Odómetro total (totalOdometer)
- `15` - Odómetro de viaje (tripOdometer)

#### 2. Parámetros de Eventos
```json
{
  "parameter_id": null,
  "event_type": "Acceleration" | "Braking" | "Curve",
  "emit_alert": boolean,
  "automatic_request": boolean,
  "request_type": number | null,
  "threshold_value": number | null
}
```

#### 3. Códigos OBD
```json
{
  "obd_code": string,
  "emit_alert": boolean,
  "automatic_request": boolean,
  "request_type": number | null
}
```

## Campos del Formulario

### Estructura de Datos en React Hook Form

```javascript
{
  // Alertas
  alerts: {
    currentSpeed: boolean,
    rpm: boolean,
    engineTemp: boolean,
    engineLoad: boolean,
    oilLevel: boolean,
    fuelLevel: boolean,
    fuelUsedGps: boolean,
    instantFuelConsumption: boolean,
    totalOdometer: boolean,
    tripOdometer: boolean,
    obd: { [code: string]: boolean },
    event: {
      Acceleration: boolean,
      Braking: boolean,
      Curve: boolean
    }
  },
  
  // Solicitudes automáticas
  autoRequest: {
    // Misma estructura que alerts
  },
  
  // Tipos de solicitud
  requestType: {
    currentSpeed: number | "",
    rpm: number | "",
    // ... etc
  },
  
  // Umbrales
  thresholds: {
    currentSpeedId: 3,
    currentSpeedMin: number,
    currentSpeedMax: number,
    rpmId: 6,
    rpmMin: number,
    rpmMax: number,
    // ... etc
    event: {
      Acceleration: number,
      Braking: number,
      Curve: number
    }
  }
}
```

## Flujo de Envío

1. **Usuario completa el Paso 7** y hace clic en "Guardar"
2. **Se ejecuta `onSubmit()`** que llama a `submitStep7()`
3. **`submitStep7()` construye el payload**:
   - Itera sobre todos los parámetros configurados
   - Solo incluye parámetros con al menos una opción activada
   - Formatea los datos según el tipo de parámetro
4. **Se envía el payload** mediante `registerThresholdSetting()`
5. **Si es exitoso**, se llama a `confirmRegistration()`
6. **Se muestra mensaje de éxito** y se cierra el modal

## Validaciones

- El paso 7 es **opcional** - puede estar vacío
- Solo se envían parámetros que tengan al menos:
  - Una alerta activada, O
  - Una solicitud automática activada, O
  - Un tipo de solicitud seleccionado, O
  - Valores min/max configurados
- Si no hay parámetros configurados, se omite el envío pero se confirma el registro

## Manejo de Errores

```javascript
try {
  await registerThresholdSetting(payload);
  await confirmRegistration();
} catch (error) {
  // Muestra mensaje de error
  // No cierra el modal
  // Permite al usuario corregir y reintentar
}
```

## Ejemplo de Uso

Ver archivo `step7-payload-example.json` para un ejemplo completo del payload.

## Notas Importantes

1. **IDs de Eventos**: Los eventos usan `parameter_id: null` y especifican `event_type`
2. **Códigos OBD**: Los códigos OBD usan `obd_code` en lugar de `parameter_id`
3. **Request Type**: Puede ser `null` si no se selecciona ningún tipo
4. **Valores Opcionales**: Los campos `min_value`, `max_value`, `threshold_value` pueden ser `null`

## Modo Edición

En modo edición, el paso 7 permite actualizar la configuración existente:
- Se cargan los valores previos (si existen)
- Se usa el servicio `updateThresholdSetting()` en lugar de `registerThresholdSetting()`
- El flujo es similar pero no se llama a `confirmRegistration()` al final
