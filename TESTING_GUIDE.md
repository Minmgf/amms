# Guía de Pruebas - Dashboard de Monitoreo en Tiempo Real

## 🧪 Pruebas Funcionales

### 1. Verificar Panel Informativo Superior
**Pasos:**
1. Abrir una solicitud en estado "en proceso"
2. Hacer clic en "Ver Monitoreo"
3. Verificar que aparezca:
   - ✅ Consecutivo de seguimiento
   - ✅ Nombre del cliente
   - ✅ Fechas de inicio y fin
   - ✅ Lugar del trabajo

**Resultado esperado:** Todos los datos visibles y correctamente formateados

---

### 2. Verificar Tarjetas de Maquinarias
**Pasos:**
1. En el dashboard, observar la sección "Información de Maquinaria"
2. Verificar cada tarjeta contiene:
   - ✅ Foto de la maquinaria
   - ✅ Serial y nombre
   - ✅ Operario asignado
   - ✅ Implemento
   - ✅ Velocidad actual
   - ✅ Nivel de combustible
   - ✅ Estado de ignición (icono)
   - ✅ Estado de movimiento (icono)
   - ✅ Intensidad GSM (icono)
   - ✅ Última actualización

**Resultado esperado:** Todas las tarjetas muestran información completa

---

### 3. Verificar Mapa con Leaflet
**Pasos:**
1. Observar la sección "Ubicación en Tiempo Real"
2. Verificar:
   - ✅ Mapa de Leaflet con OpenStreetMap tiles cargado
   - ✅ Sin contenedores blancos flotantes obstructivos
   - ✅ Pins de colores visibles en las ubicaciones

3. Verificar colores de estado:
   - ✅ Verde: Maquinaria en movimiento (ignición ON + movimiento ON)
   - ✅ Naranja: Maquinaria estacionaria (ignición ON + movimiento OFF)
   - ✅ Gris: Maquinaria apagada o sin conexión (ignición OFF o sin ubicación)

4. Verificar popup interactivo:
   - ✅ Hacer clic en un pin muestra popup con información
   - ✅ Popup muestra: Serial, Nombre, Estado, Velocidad, RPM, Temperatura, Combustible, Coordenadas
   - ✅ Estado con color indicador
   - ✅ Coordenadas exactas

**Resultado esperado:** Mapa Leaflet funcional con pins de colores y popup interactivo

---

### 4. Verificar Navegación Entre Maquinarias
**Pasos:**
1. Hacer clic en una tarjeta de maquinaria
2. Observar la sección "Sensores y Contadores del Vehículo"
3. Verificar cada indicador:

#### Velocímetro
- ✅ Rango: 0-60 km/h (tractores) o 0-180 km/h (vehículos)
- ✅ Aguja rota suavemente
- ✅ Valor mostrado debajo
- ✅ Si > 45 km/h: Fondo rojo, aguja roja

#### Tacómetro
- ✅ Rango: 0-3000 RPM
- ✅ Aguja rota suavemente
- ✅ Si > 2800 RPM: Fondo rojo, aguja roja

#### Termómetro
- ✅ Rango: -40°C a 130°C
- ✅ Líquido sube/baja suavemente
- ✅ Si > 110°C: Fondo rojo, número rojo

#### Indicador de Combustible
- ✅ Rango: 0-100%
- ✅ Aguja rota suavemente
- ✅ Si < 20%: Fondo rojo, aguja roja

#### Nivel de Aceite
- ✅ Barra circular de 0-100%
- ✅ Animación suave
- ✅ Si > 90%: Color rojo

#### Carga del Motor
- ✅ Barra circular de 0-100%
- ✅ Animación suave
- ✅ Si > 90%: Color rojo

#### Odómetro
- ✅ Números mostrados correctamente
- ✅ Total y Trip separados

#### Estado Logístico
- ✅ Dropdown editable
- ✅ Botón "Actualizar Estado" funcional

**Resultado esperado:** Todos los indicadores funcionan correctamente con animaciones suaves

---

### 6. Verificar Animaciones
**Pasos:**
1. Cambiar valores en el WebSocket (simular cambios)
2. Observar:
   - ✅ Transiciones suaves (no saltos abruptos)
   - ✅ Duración: 0.5-0.7 segundos
   - ✅ Easing: Suave y profesional

**Resultado esperado:** Animaciones fluidas sin saltos

---

### 7. Verificar Límites de Diseño
**Pasos:**
1. Simular valores fuera de rango:
   - Velocidad: 200 km/h (máximo 60)
   - RPM: 5000 (máximo 3000)
   - Temperatura: 150°C (máximo 130°C)
   - Combustible: 150% (máximo 100%)

2. Verificar:
   - ✅ Valores se clampean al máximo
   - ✅ Aguja no se sale del semicírculo (180°)
   - ✅ Números muestran valor clampeado

**Resultado esperado:** Valores limitados sin salirse del diseño

---

### 8. Verificar Alertas Visuales
**Pasos:**
1. Simular valores en zona crítica:
   - Velocidad > 45 km/h
   - RPM > 2800
   - Temperatura > 110°C
   - Combustible < 20%

2. Verificar:
   - ✅ Fondo rojo claro
   - ✅ Borde rojo
   - ✅ Sombra brillante
   - ✅ Aguja/número rojo
   - ✅ Animación glow

**Resultado esperado:** Alertas visuales claras y profesionales

---

### 9. Verificar Gráficas
**Pasos:**
1. Hacer clic en tab "Información de Rendimiento"
2. Verificar gráfica de Velocidad/RPM:
   - ✅ Dos líneas (azul y verde)
   - ✅ Marcadores de eventos
   - ✅ Tooltip con valores

3. Hacer clic en tab "Información de Consumo de Combustible"
4. Verificar gráfica de Consumo:
   - ✅ Línea de nivel de combustible
   - ✅ Línea de consumo instantáneo
   - ✅ Tooltip con valores

**Resultado esperado:** Gráficas visibles con datos correctos

---

### 10. Verificar Consumo de Combustible, OBD y Eventos G
**Pasos:**
1. Observar sección inferior con 3 tarjetas:

#### Consumo de Combustible
- ✅ Combustible usado
- ✅ Consumo instantáneo
- ✅ Predicción

#### Fallas OBD
- ✅ Lista de códigos
- ✅ Fecha y hora
- ✅ Si no hay: "Sin fallas OBD detectadas"

#### Eventos G
- ✅ Tipo de evento (Aceleración, Frenado, Curva)
- ✅ Intensidad en G
- ✅ Fecha y hora
- ✅ Si no hay: "Sin eventos G detectados"

**Resultado esperado:** Información completa y bien formateada

---

### 11. Verificar Navegación Entre Maquinarias
**Pasos:**
1. Hacer clic en diferentes tarjetas de maquinarias
2. Verificar:
   - ✅ Indicadores se actualizan
   - ✅ Gráficas se actualizan
   - ✅ Información se actualiza
   - ✅ Sin recargar página

**Resultado esperado:** Cambios instantáneos sin recargar

---

### 12. Verificar Actualización Automática (cada ~30 segundos)
**Pasos:**
1. Observar los datos iniciales
2. Esperar ~30 segundos (tiempo de llegada del siguiente mensaje WebSocket)
3. Verificar:
   - ✅ Datos se actualizan automáticamente
   - ✅ Animaciones suaves en la transición
   - ✅ Sin recargar página
   - ✅ Todos los indicadores se actualizan simultáneamente

**Resultado esperado:** Datos actualizados cada ~30 segundos cuando llegan del WebSocket

**Nota Importante:** Los datos NO se actualizan continuamente, sino cada ~30 segundos cuando el servidor envía nuevos datos a través del WebSocket.

---

## 🎨 Pruebas de UX/UI

### 1. Responsividad
**Pasos:**
1. Abrir en diferentes tamaños de pantalla:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)

2. Verificar:
   - ✅ Layout se adapta
   - ✅ Texto legible
   - ✅ Botones accesibles
   - ✅ Gráficas visibles

**Resultado esperado:** Interfaz adaptable a todos los tamaños

---

### 2. Contraste y Legibilidad
**Pasos:**
1. Verificar contraste de colores
2. Verificar tamaños de fuente
3. Verificar iconos visibles

**Resultado esperado:** Todo legible y accesible

---

### 3. Accesibilidad
**Pasos:**
1. Usar navegación por teclado (Tab)
2. Usar lector de pantalla
3. Verificar etiquetas ARIA

**Resultado esperado:** Interfaz accesible

---

## 🔧 Pruebas Técnicas

### 1. WebSocket Connection
**Pasos:**
1. Abrir DevTools (F12)
2. Ir a Network > WS
3. Verificar:
   - ✅ Conexión a `wss://api.inmero.co/telemetry/ws/telemetria`
   - ✅ Mensajes cada ~30 segundos
   - ✅ Estructura JSON correcta

**Resultado esperado:** WebSocket conectado y recibiendo datos

---

### 2. Performance
**Pasos:**
1. Abrir DevTools > Performance
2. Grabar mientras se actualizan datos
3. Verificar:
   - ✅ FPS > 60
   - ✅ Sin memory leaks
   - ✅ Animaciones fluidas

**Resultado esperado:** Rendimiento óptimo

---

### 3. Console Errors
**Pasos:**
1. Abrir DevTools > Console
2. Verificar:
   - ✅ Sin errores críticos
   - ✅ Sin warnings importantes

**Resultado esperado:** Console limpia

---

## 📊 Pruebas de Datos

### 1. Validación de Campos
**Pasos:**
1. Simular datos incompletos
2. Verificar:
   - ✅ Campos faltantes muestran "--"
   - ✅ No hay errores
   - ✅ UI sigue funcionando

**Resultado esperado:** Manejo graceful de datos incompletos

---

### 2. Valores Extremos
**Pasos:**
1. Simular valores muy altos
2. Simular valores negativos
3. Simular valores nulos

**Resultado esperado:** Todos manejados correctamente

---

## ✅ Checklist Final

- [ ] Panel informativo completo
- [ ] Tarjetas de maquinarias correctas
- [ ] Mapa funcional
- [ ] Tooltips del mapa
- [ ] Velocímetro funcional
- [ ] Tacómetro funcional
- [ ] Termómetro funcional
- [ ] Indicador de combustible funcional
- [ ] Nivel de aceite funcional
- [ ] Carga del motor funcional
- [ ] Odómetro correcto
- [ ] Estado logístico editable
- [ ] Consumo de combustible visible
- [ ] Fallas OBD visibles
- [ ] Eventos G visibles
- [ ] Gráficas funcionales
- [ ] Navegación entre maquinarias
- [ ] Actualización automática
- [ ] Animaciones suaves
- [ ] Alertas visuales
- [ ] Límites de diseño respetados
- [ ] Responsividad correcta
- [ ] WebSocket conectado
- [ ] Performance óptimo
- [ ] Sin errores en console

---

## 🐛 Reporte de Bugs

Si encuentras algún problema, reporta:

1. **Descripción:** ¿Qué sucedió?
2. **Pasos para reproducir:** ¿Cómo lo hiciste?
3. **Resultado esperado:** ¿Qué debería pasar?
4. **Resultado actual:** ¿Qué pasó?
5. **Capturas de pantalla:** Si es posible
6. **Navegador/Dispositivo:** ¿Dónde ocurrió?

---

## 📞 Soporte

Para preguntas o problemas, contacta al equipo de desarrollo.
