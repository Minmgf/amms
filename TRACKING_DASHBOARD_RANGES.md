# Tracking Dashboard - Rangos y Configuración de Sensores

## Resumen de Implementación

El dashboard de monitoreo en tiempo real cumple con la historia de usuario HU-MS-003 con las siguientes características:

### ✅ Características Implementadas

1. **Panel Superior de Información**
   - Consecutivo de seguimiento
   - Razón social/nombre del cliente
   - Fechas de inicio y finalización
   - Lugar del trabajo

2. **Tarjetas de Maquinarias**
   - Foto de la maquinaria
   - Serial y nombre
   - Operario asignado
   - Implemento asociado
   - Velocidad y combustible actual
   - Estado de ignición y movimiento
   - Intensidad de señal GSM
   - Color dinámico (Rojo=alerta, Gris=sin conexión)
   - Última actualización en segundos

3. **Mapa en Tiempo Real con Leaflet**
   - Leaflet con OpenStreetMap tiles (sin API key requerida)
   - Pins de colores dinámicos según estado:
     - **Verde (#22C55E):** En movimiento (ignición ON + movimiento ON)
     - **Naranja (#F59E0B):** Estacionario (ignición ON + movimiento OFF)
     - **Gris (#9CA3AF):** Apagado o Sin conexión (ignición OFF o sin ubicación)
   - Popup interactivo al hacer clic en cada pin con:
     - Serial y nombre de la maquinaria
     - Estado actual con color
     - Velocidad, RPM, Temperatura, Combustible
     - Coordenadas exactas
   - Mapa centrado automáticamente en todas las maquinarias
   - Sin contenedores flotantes obstructivos

4. **Indicadores y Sensores**
   - Velocímetro (velocidad actual)
   - Tacómetro (RPM)
   - Termómetro (temperatura del motor)
   - Indicador de combustible
   - Nivel de aceite (circular)
   - Carga del motor (circular)
   - Odómetro (total y viaje)
   - Estado logístico (editable)

5. **Información Adicional**
   - Consumo de combustible
   - Fallas OBD
   - Eventos G (conducción)

6. **Gráficas**
   - Velocidad/RPM vs eventos
   - Consumo de combustible

---

## Rangos de Sensores

### 1. Velocidad (Velocidad Actual)

**Para Tractores:**
- **Rango nominal:** 0 … 60 km/h (campo/traslado)
- **Ángulo de aguja:** -135° a +135° (barrido 270°)
- **Zona crítica:** > 45 km/h (naranja/roja para seguridad)

**Para Vehículos Ligeros:**
- **Rango alternativo:** 0 … 180 km/h
- **Mismo ángulo:** -135° a +135°

**Implementación:**
```javascript
// En GaugeCard
const clampedValue = Math.min(Math.max(value || 0, 0), max);
const percentage = (clampedValue / max) * 100;
const rotation = (percentage / 100) * 180 - 90;

// Alerta si > 45 km/h
const hasAlert = type === 'speed' && clampedValue > 45;
```

---

### 2. Revoluciones (RPM)

**Para Tractores Diésel:**
- **Rango nominal:** 0 … 3000 RPM (máx motor ~2500–3000)
- **Ángulo de aguja:** -135° a +135° (mismo mapeo que velocidad)
- **Zona roja:** > 2800 RPM

**Para Motores Gasolina/Maquinaria Pequeña:**
- **Rango alternativo:** 0 … 7000 RPM

**Implementación:**
```javascript
// En GaugeCard
const hasAlert = type === 'rpm' && clampedValue > 2800;

// Animación suave
transition: 'stroke-dasharray 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
```

---

### 3. Temperatura del Motor

**Rango de Visualización:**
- **Mínimo:** -40°C (sensores pueden leer bajo cero)
- **Máximo:** 130°C (límite visual común)

**Rango Operativo Normal:**
- **Óptimo:** 70 … 95°C

**Zona Crítica:**
- **Alerta:** > 110°C (rojo)

**Implementación:**
```javascript
// En Termómetro
const minTemp = -40;
const maxTemp = 130;
const clampedTemp = Math.min(Math.max(value, minTemp), maxTemp);
const percentage = (clampedTemp - minTemp) / (maxTemp - minTemp);
const height = percentage * 68; // altura del líquido

// Alerta si > 110°C
const hasAlert = clampedTemp > 110;
```

---

### 4. Nivel de Combustible

**Rango:** 0 … 100% (o en litros: 0 … capacidad_tanque)

**Capacidades Típicas:**
- Tractores: 60–300 L
- Vehículos ligeros: 40–80 L
- Ejemplo en UI: ~36L / ~90L (capacidad 90L)

**Ángulo de Aguja:**
- **Rango:** -135° a +135° (180° total, no se sale del diseño)
- **Mapeo:** (valor / 100) * 180 - 90

**Zona Crítica:**
- **Alerta:** < 20% (rojo)

**Implementación:**
```javascript
// En Indicador de Combustible
const clampedValue = Math.min(selectedMachineryData.fuelLevel.value, 100);
const rotation = (clampedValue / 100) * 180 - 90;

// Alerta si < 20%
const hasAlert = clampedValue < 20;

// Animación suave
transition: 'stroke-dasharray 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
```

---

## Animaciones Profesionales

### Transiciones Suaves

Todas las figuras tienen transiciones suaves según cómo cambien:

```css
/* Gauge Needle */
transition: transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);

/* Circular Progress */
transition: stroke-dashoffset 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.5s ease;

/* Thermometer Liquid */
transition: y 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);

/* Card Background */
transition: all 0.5s ease;
```

### Alertas Visuales

- **Fondo rojo:** `rgba(239, 68, 68, 0.1)`
- **Borde rojo:** `#EF4444`
- **Sombra brillante:** `0 0 10px rgba(239, 68, 68, 0.2)`
- **Aguja roja:** Cuando hay alerta
- **Número rojo:** Cuando hay alerta

### Animación de Entrada

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -110%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -100%);
  }
}
```

---

## Límites de Diseño

### Velocímetro y Tacómetro

- **Ángulo máximo:** +135° (no se sale del semicírculo)
- **Ángulo mínimo:** -135°
- **Barrido total:** 270°
- **Si valor > max:** Se clampea al máximo sin salirse del diseño

### Termómetro

- **Altura máxima:** 68px (dentro del tubo)
- **Rango visual:** -40°C a 130°C
- **Si valor > 130°C:** Se clampea a 130°C
- **Si valor < -40°C:** Se clampea a -40°C

### Indicador de Combustible

- **Ángulo máximo:** +135° (no se sale del semicírculo)
- **Ángulo mínimo:** -135°
- **Si valor > 100%:** Se clampea a 100%
- **Si valor < 0%:** Se clampea a 0%

### Barras Circulares (Aceite, Carga Motor)

- **Máximo:** 100%
- **Mínimo:** 0%
- **Si valor > 100%:** Se clampea a 100%
- **Si valor < 0%:** Se clampea a 0%

---

## Actualización de Datos

- **Frecuencia:** ~30 segundos (desde WebSocket - IMPORTANTE)
- **Actualización visual:** Inmediata con animaciones suaves cada 30 segundos
- **Sin recarga de página:** Los datos se actualizan automáticamente
- **Navegación entre maquinarias:** Sin recargar
- **Nota:** Los indicadores se actualizan cada vez que llegan nuevos datos (cada ~30 seg), no continuamente

---

## Validaciones

- ✅ Solo solicitudes activas (estados 20 o 21)
- ✅ Solo parámetros configurados para el dispositivo
- ✅ Sin duplicados (cache interno en WebSocket)
- ✅ Contraseña obligatoria
- ✅ Verificación de existencia de campos: `if (data.data.speed !== undefined)`
- ✅ Alertas pueden ser null, [], o [{...}]

---

## Archivos Actualizados

1. **`TrackingDashboardComponents.jsx`**
   - GaugeCard: Velocímetro/Tacómetro con límites
   - CircularProgress: Barras circulares con alertas
   - RealTimeMap: Mapa real con Google Maps embed
   - MapTooltip: Tooltip mejorado

2. **`TrackingDashboardModal.jsx`**
   - Termómetro con límites -40°C a 130°C
   - Indicador de combustible con límites 0-100%
   - Integración de RealTimeMap
   - Animaciones suaves en todas las transiciones

3. **`tracking-animations.css`**
   - Animaciones profesionales
   - Transiciones suaves
   - Efectos de alerta
   - Responsive animations

4. **`useTrackingWebSocket.js`**
   - Endpoint correcto: `wss://api.inmero.co/telemetry/ws/telemetria`
   - Actualización cada ~30 segundos
   - Procesamiento de datos con validaciones

---

## Notas Importantes

- Los valores se limitan automáticamente al rango máximo sin salirse del diseño
- Las animaciones usan `cubic-bezier(0.34, 1.56, 0.64, 1)` para efecto profesional
- Las alertas se muestran con cambio de color y sombra brillante
- El mapa usa Google Maps embed sin necesidad de API key
- Todos los componentes son responsivos y se adaptan a diferentes tamaños de pantalla
