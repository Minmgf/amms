# WebSocket Telemetry Configuration

## Overview
The real-time monitoring dashboard uses a WebSocket connection to receive telemetry data from machinery devices. The endpoint format is:

```
wss://api.inmero.co/telemetry/ws/telemetria?password={password}
```

**Data updates approximately every 30 seconds** - Los datos llegan del servidor cada ~30 segundos, no continuamente.

## Environment Variables

### Required Variables
Set these in your `.env.local` file:

```env
# WebSocket Telemetry Configuration
NEXT_PUBLIC_TELEMETRY_WS_URL=wss://api.inmero.co/telemetry/ws/telemetria
NEXT_PUBLIC_TELEMETRY_WS_PASSWORD=telemetry_password_2024
WEBSOCKET_PASSWORD=telemetry_password_2024
```

### Variable Descriptions

- **NEXT_PUBLIC_TELEMETRY_WS_URL**: Base URL for the WebSocket endpoint
  - Default: `wss://api.inmero.co/telemetry/ws/telemetria`
  - Password is passed as a query parameter

- **NEXT_PUBLIC_TELEMETRY_WS_PASSWORD** or **WEBSOCKET_PASSWORD**: Authentication password
  - Default: `telemetry_password_2024`
  - Must be provided as a query parameter in the WebSocket URL
  - The hook checks both variables, preferring `NEXT_PUBLIC_TELEMETRY_WS_PASSWORD`

## Hook Usage

### Basic Usage
```javascript
import { useTrackingWebSocket } from '@/hooks/useTrackingWebSocket';

const { 
  machineriesData,      // Object with machinery data organized by IMEI
  connectionStatus,     // 'conectando', 'conectado', 'desconectado', 'error'
  reconnect,            // Manual reconnect function
  lastMessage,          // Last received message
  alerts                // Array of received alerts
} = useTrackingWebSocket({
  imeiFilter: ['357894561234567', '352099001761482']  // Optional: filter by IMEIs
});
```

### Parameters

- **imeiFilter** (optional): Array of IMEI numbers to filter. If null, all devices are accepted.

## Data Format Received

The WebSocket sends JSON messages with the following structure:

```json
{
  "imei": "352099001761481",
  "timestamp": "2025-11-05T10:00:00.123456-05:00",
  "data": {
    "ignition_status": 1,
    "movement_status": 1,
    "speed": 120,
    "gps_location": "+04.60971-074.08175/",
    "gsm_signal": 4,
    "rpm": 2500,
    "engine_temp": 92,
    "engine_load": 57,
    "oil_level": 80,
    "fuel_level": 68,
    "fuel_used_gps": 153.2,
    "instant_consumption": 14.5,
    "obd_faults": ["P0135"],
    "odometer_total": 2456789,
    "odometer_trip": 34567,
    "event_type": 2,
    "event_g_value": 45
  },
  "alerts": [
    {
      "parameter": "speed",
      "reason": "Valor por encima del máximo"
    }
  ]
}
```

### Field Descriptions

- **imei**: Device identifier
- **timestamp**: ISO 8601 timestamp with timezone
- **data**: Telemetry data object
  - **ignition_status**: 0 = OFF, 1 = ON
  - **movement_status**: 0 = Stopped, 1 = Moving
  - **speed**: km/h (0-350)
  - **gps_location**: GPS coordinates in format "+LAT-LNG/"
  - **gsm_signal**: Signal strength 1-5 (1=Excellent, 5=Loss)
  - **rpm**: Engine revolutions per minute
  - **engine_temp**: Temperature in °C
  - **engine_load**: Load percentage
  - **oil_level**: Oil level percentage
  - **fuel_level**: Fuel level percentage
  - **fuel_used_gps**: Total fuel used in liters
  - **instant_consumption**: Current consumption in L/h
  - **obd_faults**: Array of OBD fault codes
  - **odometer_total**: Total distance in meters
  - **odometer_trip**: Trip distance in meters
  - **event_type**: 1=Acceleration, 2=Braking, 3=Curve
  - **event_g_value**: G-force value of the event
- **alerts**: Array of alerts or null

## Important Notes

1. **Field Existence**: Not all fields are guaranteed to be present. Always check field existence before using:
   ```javascript
   if (data.data.speed !== undefined) {
     console.log('Speed:', data.data.speed);
   }
   ```

2. **Update Frequency**: Data updates approximately every 30 seconds without page reload

3. **Alerts**: Can be null, empty array [], or array with alert objects

4. **Only Configured Parameters**: Only parameters configured for each device will be sent

5. **No Duplicates**: Internal caching prevents duplicate messages

6. **Active Requests Only**: Only requests with status 20 or 21 are supported

## Connection Status Values

- **conectando**: Attempting to establish connection
- **conectado**: Successfully connected
- **desconectado**: Connection closed
- **error**: Connection error or invalid credentials

## Dashboard Components

The monitoring dashboard displays:

- **Request Information Panel**: Code, client, dates, location
- **Machinery Cards**: Photo, serial, operator, implement, speed, fuel, ignition, movement, GSM signal, last update
- **Real-time Map**: Location pins with color coding:
  - Gray: Off
  - Orange: Idle/Stopped
  - Green: Moving
- **Indicators**: Speedometer, tachometer, thermometer, fuel/oil levels, engine load, odometer, logistics status
- **Charts**: Speed/RPM vs events, fuel consumption over time
- **Alerts**: Color-coded backgrounds (Red=alert, Gray=disconnected)

## Troubleshooting

### Connection Failed
- Check that `requestCode` is provided to the hook
- Verify environment variables are set correctly
- Check browser console for detailed error messages

### No Data Received
- Ensure the request code is correct and active (status 20 or 21)
- Verify machinery devices have telemetry enabled
- Check that IMEI numbers match if using `imeiFilter`

### Reconnection Issues
- The hook automatically attempts to reconnect up to 10 times
- Manual reconnection available via `reconnect()` function
- Check network connectivity and WebSocket support

## Files Updated

- `src/hooks/useTrackingWebSocket.js`: WebSocket hook with correct endpoint format
- `src/app/components/monitoring/TrackingDashboardModal.jsx`: Dashboard component passing requestCode
- `src/app/components/monitoring/TrackingDashboardComponents.jsx`: UI components (no changes needed)
