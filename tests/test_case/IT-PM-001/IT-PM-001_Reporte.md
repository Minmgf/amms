# Título
Verificar programación de mantenimiento sin solicitud previa

## Descripción
Validar el flujo completo de programación de un nuevo mantenimiento sin solicitud previa, incluyendo la selección de maquinaria, tipo de mantenimiento, fecha/hora de programación, asignación de técnico y registro de comentarios.

## Precondiciones
- Usuario autenticado en el sistema AMMS
- Acceso al módulo de Mantenimiento habilitado
- Maquinarias registradas en el sistema
- Tipos de mantenimiento configurados (Preventivo, Correctivo)
- Técnicos registrados y disponibles para asignación
- Permisos para crear nuevos mantenimientos

## Datos de Entrada

### Selección de Maquinaria (Aleatorio)
Opciones disponibles:
- asd123qsd1234, jacko, monstermachine, tractor, Tractor002, Tractor234, TractorCall, TractorConf, Tractorebug, TractorGet, TractorHard, TractorHU7, tractorprueba100, tractorPrueba200, tractorPrueba300, tractorPrueba600, TRACTOR UALA

### Tipo de Mantenimiento (Aleatorio)
- Mantenimiento Correctivo
- Mantenimiento Preventivooo

### Fecha de Programación
- Formato: dd/mm/yyyy
- Rango: Fecha futura en 2025 (entre 1 y 90 días desde hoy)

### Hora de Programación
- Hora: 01-12 (formato 12 horas)
- Minutos: 00, 15, 30, 45
- Período: AM/PM

### Técnico Asignado (Aleatorio)
Opciones disponibles:
- Luigy, Manuel, Juan Diego, Admin, Julian, Fabian, Juan Nicolás, Juan Camilo, Juan David, Juan Andres, cesar, Alejandro, David, Linda Valentina, David Felipe, Daniel, Laura Nathalia, Prueba, Cristian

### Comentarios/Detalles
- Longitud máxima: 350 caracteres
- Comentarios de ejemplo:
  - "Mantenimiento preventivo programado para revisión general del sistema."
  - "Se requiere inspección de componentes mecánicos y lubricación."
  - "Revisión de desgaste y reemplazo de partes según sea necesario."
  - "Mantenimiento correctivo para reparación de falla reportada."
  - "Verificación de parámetros operativos y ajustes de calibración."
  - "Inspección de sistema hidráulico y neumático."
  - "Mantenimiento programado según cronograma anual de la maquinaria."

## Pasos (AAA)

### Arrange
1. Configurar credenciales de acceso (email/password desde .env)
2. Inicializar ChromeDriver y navegador
3. Realizar login en http://localhost:3000/sigma/
4. Navegar al módulo "Mantenimiento"
5. Esperar 5 segundos para carga completa del módulo

### Act (Se repite 3 veces con datos aleatorios diferentes)
1. **Abrir formulario de nuevo mantenimiento**:
   - Hacer click en botón "Nuevo Mantenimiento"
   - Esperar 3 segundos para carga del formulario

2. **Seleccionar maquinaria**:
   - Localizar select de maquinarias (`machineSelector`)
   - Seleccionar maquinaria aleatoria de las opciones disponibles
   - Esperar 2 segundos

3. **Seleccionar tipo de mantenimiento**:
   - Localizar select de tipos (`maintenanceType`)
   - Seleccionar tipo aleatorio (Preventivo/Correctivo)
   - Esperar 2 segundos

4. **Establecer fecha de programación**:
   - Localizar input de fecha (`scheduleDate`)
   - Generar fecha aleatoria futura en 2025
   - Ingresar fecha en formato dd/mm/yyyy
   - Esperar 2 segundos

5. **Establecer hora de programación**:
   - Seleccionar hora aleatoria (01-12)
   - Seleccionar minuto aleatorio (00, 15, 30, 45)
   - Seleccionar período aleatorio (AM/PM)
   - Esperar 2 segundos después de cada selección

6. **Asignar técnico**:
   - Localizar select de técnicos (`assignedTechnician`)
   - Seleccionar técnico aleatorio de las opciones disponibles
   - Esperar 2 segundos

7. **Ingresar comentarios**:
   - Localizar textarea de comentarios
   - Ingresar comentario aleatorio (máximo 350 caracteres)
   - Esperar 2 segundos

8. **Programar mantenimiento**:
   - Scroll al botón "Programar"
   - Hacer click en "Programar"
   - Esperar 2 segundos

9. **Confirmar creación**:
   - Esperar modal de confirmación
   - Hacer click en botón "Continuar"
   - Esperar 2 segundos para cierre de modal

10. **Preparar siguiente iteración**:
    - Esperar 3 segundos antes de la siguiente programación

### Assert
- ✅ Login exitoso y navegación al módulo de Mantenimiento
- ✅ Botón "Nuevo Mantenimiento" clickeable y funcional
- ✅ Formulario de programación se carga correctamente
- ✅ Select de maquinarias contiene opciones disponibles
- ✅ Select de tipos de mantenimiento contiene opciones disponibles
- ✅ Input de fecha acepta formato dd/mm/yyyy
- ✅ Selects de hora (hora, minuto, AM/PM) funcionan correctamente
- ✅ Select de técnicos contiene opciones disponibles
- ✅ Textarea de comentarios acepta hasta 350 caracteres
- ✅ Botón "Programar" ejecuta la programación
- ✅ Modal de confirmación aparece después de programar
- ✅ Botón "Continuar" cierra el modal correctamente
- ✅ Sistema permite crear múltiples mantenimientos consecutivos
- ✅ Todas las combinaciones aleatorias de datos son válidas
- ✅ 3 iteraciones completas ejecutadas exitosamente

## Resultado Esperado
- 3 mantenimientos programados exitosamente con diferentes combinaciones de datos
- Cada programación incluye:
  - Maquinaria seleccionada
  - Tipo de mantenimiento asignado
  - Fecha de programación en formato dd/mm/yyyy (año 2025)
  - Hora de programación en formato 12 horas con AM/PM
  - Técnico asignado
  - Comentarios descriptivos del mantenimiento
- Modal de confirmación aparece después de cada programación
- Sistema permite continuar y crear nuevos mantenimientos sin errores
- Navegador se cierra automáticamente al finalizar

## Resultado Obtenido
✅ **Iteración 1**: Mantenimiento programado exitosamente
- Maquinaria: [Maquinaria aleatoria seleccionada]
- Tipo: [Preventivo/Correctivo]
- Fecha: [dd/mm/2025]
- Hora: [HH:MM AM/PM]
- Técnico: [Técnico asignado]
- Comentarios: [Comentario descriptivo]
- Modal de confirmación cerrado correctamente

✅ **Iteración 2**: Mantenimiento programado exitosamente
- Maquinaria: [Maquinaria aleatoria diferente]
- Tipo: [Preventivo/Correctivo]
- Fecha: [dd/mm/2025]
- Hora: [HH:MM AM/PM]
- Técnico: [Técnico asignado diferente]
- Comentarios: [Comentario descriptivo diferente]
- Modal de confirmación cerrado correctamente

✅ **Iteración 3**: Mantenimiento programado exitosamente
- Maquinaria: [Maquinaria aleatoria diferente]
- Tipo: [Preventivo/Correctivo]
- Fecha: [dd/mm/2025]
- Hora: [HH:MM AM/PM]
- Técnico: [Técnico asignado diferente]
- Comentarios: [Comentario descriptivo diferente]
- Modal de confirmación cerrado correctamente

✅ **Validaciones generales**:
- Formato de fecha dd/mm/yyyy aplicado correctamente
- Todas las fechas generadas en año 2025
- Selección aleatoria funcionando para todos los campos
- Scroll automático evitando interceptación de clicks
- Modal de confirmación manejado correctamente en todas las iteraciones
- Navegador cerrado automáticamente al finalizar

## Observaciones Técnicas
- Se implementó generación de fechas aleatorias asegurando año 2025 (evitando fechas del año 5000+)
- Formato de fecha cambiado de YYYY-MM-DD a DD/MM/YYYY según especificación del sistema
- Se agregó selección de técnico asignado antes de los comentarios según flujo del sistema
- Se implementó manejo de modal de confirmación con botón "Continuar" para permitir múltiples iteraciones
- Sistema de scroll automático (`scrollIntoView`) antes de cada click para evitar interceptación
- Esperas explícitas de 2 segundos entre acciones para estabilidad
- Selección aleatoria garantiza diferentes combinaciones en cada iteración
- Navegador se cierra automáticamente al completar las 3 iteraciones
- Logs del navegador guardados en: `tests/logs/IT-PM-001_browser_console.log`

## Estado / Fecha / Ejecutor
**Estado**: ✅ APROBADO

**Fecha**: 01/10/2025

**Ejecutado por**: David Lozano

---

## Información Técnica
- **Framework**: Selenium WebDriver + Python 3.13
- **Navegador**: Google Chrome 140.0.7339.208
- **Archivo de prueba**: `tests/test_case/IT-PM-001/IT-PM-001.py`
- **Servidor**: http://localhost:3000/sigma/
- **Iteraciones ejecutadas**: 3
- **Código de salida**: 0 (éxito)
- **Cierre automático**: Habilitado
