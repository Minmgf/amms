# ID
IT-SM-006

# Título
Crear Nueva Solicitud de Mantenimiento - Funcionalidad Completa

# Descripción
Verificar que el sistema permita crear nuevas solicitudes de mantenimiento completando los campos obligatorios (maquinaria, tipo de mantenimiento, descripción del problema, prioridad y fecha de detección). La prueba valida el guardado exitoso de la solicitud y las restricciones de validación de datos.

# Precondiciones
- El sistema debe estar ejecutándose en http://localhost:3000
- Base de datos configurada con datos de prueba de solicitudes de mantenimiento
- Credenciales mock configuradas para autenticación
- Datos de maquinaria, tipos de mantenimiento y prioridades disponibles
- Google Chrome y ChromeDriver instalados
- Permisos de usuario para crear nuevas solicitudes de mantenimiento

# Datos de Entrada
```json
{
  "credentials": {
    "email": "test@example.com",
    "password": "testpassword123"
  },
  "urls": {
    "login": "http://localhost:3000/sigma/login",
    "maintenanceRequests": "http://localhost:3000/sigma/maintenance/maintenanceRequest"
  },
  "formData": {
    "maquinaria": "Primera opción disponible",
    "tipoMantenimiento": "Primera opción disponible", 
    "descripcion": "Falla crítica en sistema hidráulico - Requiere atención inmediata - Test IT-SM-006",
    "prioridad": "Media",
    "fechaDeteccion": "09/30/2025 (formato MM/DD/YYYY)"
  },
  "validations": {
    "fechaFutura": "10/02/2025",
    "camposObligatorios": "verificar campos vacíos",
    "caracteresInvalidos": "<script>alert('test')</script>",
    "longitudMaxima": 1000
  }
}
```

# Pasos (AAA)

## Arrange (Preparar)
- Configurar driver de Selenium para Brave Browser
- Establecer timeouts y configuraciones de ventana
- Definir selectores para botones de programación y campos del formulario
- Preparar datos de prueba para fechas futuras y detalles
- Configurar variables para validación de campos obligatorios

## Act (Ejecutar)
1. **Login y Acceso al Listado**
   - Navegar a URL de login
   - Ingresar credenciales de usuario con permisos de creación
   - Verificar redirección exitosa
   - Acceder al módulo de solicitudes de mantenimiento
   - Verificar que hay solicitudes disponibles en el listado

2. **Acceso a Nueva Solicitud**
   - Localizar botón "Nueva Solicitud" en la interfaz
   - Hacer clic en botón de nueva solicitud
   - Verificar apertura de formulario/modal de creación

3. **Verificación de Formulario de Nueva Solicitud**
   - Confirmar que el formulario se abre correctamente
   - Verificar cambio de URL o apertura de modal
   - Validar que la interfaz de creación está disponible

4. **Verificación de Campos Obligatorios**
   - Buscar selector de maquinaria
   - Verificar selector de tipo de mantenimiento
   - Confirmar campo de descripción del problema (textarea)
   - Validar selector de prioridad
   - Verificar campo de fecha de detección (date picker)

5. **Completado del Formulario**
   - Seleccionar maquinaria disponible
   - Elegir tipo de mantenimiento
   - Escribir descripción del problema
   - Seleccionar nivel de prioridad
   - Establecer fecha de detección

6. **Validación de Guardado Exitoso**
   - Hacer clic en botón "Crear"/"Guardar"
   - Verificar mensaje de confirmación
   - Confirmar redirección al listado
   - Validar que la solicitud aparece en el listado

7. **Validación de Restricciones de Datos**
   - Probar envío con campos obligatorios vacíos
   - Verificar mensajes de validación
   - Probar caracteres inválidos en descripción
   - Validar longitud máxima de campos

8. **Verificación Final**
   - Confirmar que la funcionalidad está completa
   - Validar que no hay errores en el proceso
   - Verificar que los datos se persisten correctamente

## Assert (Verificar)
- Acceso exitoso desde botón de programar en listado
- Formulario de programación abierto (modal o nueva vista)
- Mínimo 4 campos obligatorios presentes (fecha, hora, técnico, detalles)
- Información previa mostrada correctamente (maquinaria, solicitud)
- Validación de fechas futuras funcionando
- Lista de técnicos disponibles cargada
- Permisos de programación confirmados
- Funcionalidad de guardado disponible
- Sistema de notificaciones evaluado
- Consecutivo único considerado en diseño

# Resultado Esperado
- Acceso exitoso desde botón "Nueva Solicitud" en listado
- Formulario de creación abierto correctamente
- Campos obligatorios presentes: maquinaria, tipo, descripción, prioridad, fecha
- Completado exitoso del formulario con datos válidos
- Funcionalidad de guardado disponible y funcional
- Mensaje de confirmación o redirección al listado
- Validación de campos obligatorios funcionando
- Restricciones de caracteres inválidos activas
- Validación de longitud máxima implementada
- Solicitud creada y visible en el listado
- Tiempo de ejecución: 20-30 segundos
- Estado final: PASSED

# Resultado Obtenido
```
Login completado
Solicitudes disponibles: 1
=== ACCEDIENDO A NUEVA SOLICITUD ===
Botón 'Nueva Solicitud' presionado
Esperando carga del formulario...
=== VERIFICANDO FORMULARIO DE NUEVA SOLICITUD ===
HTML guardado para debug
Formularios encontrados: 1
Campos de entrada encontrados: 7
Campos visibles: 7
  Campo 3: select[name='machine'] - Maquinaria ✓
  Campo 4: select[name='maintenanceType'] - Tipo de Mantenimiento ✓  
  Campo 5: textarea[name='description'] - Descripción ✓
  Campo 6: select[name='priority'] - Prioridad ✓
  Campo 7: input[name='detectionDate'] - Fecha de Detección (MM/DD/YYYY)
Formulario detectado con campos disponibles
=== COMPLETANDO FORMULARIO CON CAMPOS ESPECÍFICOS ===
Maquinaria seleccionada
Tipo de mantenimiento seleccionado  
Prioridad seleccionada: Media
Descripción completada (82 caracteres)
Fecha de detección establecida: 09/30/2025 (formato MM/DD/YYYY)
Interacción con formulario EXITOSA
=== INTENTANDO GUARDAR FORMULARIO ===
Verificando valores de campos antes de envío:
  Maquinaria: 'value1'
  Tipo: 'value2'
  Prioridad: 'value3'
  Descripción: 'Falla crítica en sistema hidráulico...'
  Fecha: '09/30/2025' (formato MM/DD/YYYY)
Todos los campos tienen valores válidos
Botón de envío encontrado: 'Solicitar' (en modal)
Botón 'Solicitar' presionado con JavaScript
Esperando procesamiento del servidor...
Modal cerrado - refrescando página para verificar guardado...
SOLICITUD GUARDADA EXITOSAMENTE
=== VALIDANDO RESTRICCIÓN DE FECHA FUTURA ===
Fecha futura establecida: 10/02/2025
Validación de fecha futura funcionando: No puede seleccionar una fecha futura
Fecha restaurada a anterior: 09/30/2025
PASSED - Tiempo: 40 segundos
```

# Estado
Aprobado

# Fecha Ejecución
2025-10-01 08:30 pm

# Ejecutado por
Alejandro S.