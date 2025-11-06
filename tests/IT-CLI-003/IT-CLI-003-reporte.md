# ID
IT-CLI-003

# Título
Vista Detallada Completa del Cliente - Validación de Búsqueda y Secciones de Información

# Descripción
Verificar que el sistema permita buscar y filtrar un cliente existente por número de identificación, acceder a su vista detallada desde el listado, y validar que todas las secciones de información se muestren correctamente organizadas: información general, datos de contacto, estado del cliente e historial de solicitudes. La prueba valida la funcionalidad completa de consulta detallada según los criterios de la historia de usuario HU-CLI-003.

# Precondiciones
- El sistema debe estar ejecutándose en http://localhost:3000
- Base de datos configurada con clientes existentes disponibles
- Credenciales de usuario con permisos para consultar detalles de clientes
- Al menos un cliente registrado con número de identificación 1075322278
- Cliente con historial de solicitudes asociadas (opcional, pero recomendado)
- Google Chrome y ChromeDriver instalados
- Permisos de usuario para acceder al módulo de clientes y ver detalles

# Datos de Entrada
```json
{
  "credentials": {
    "email": "danielsr_1997@hotmail.com",
    "password": "Usuario9924."
  },
  "urls": {
    "login": "http://localhost:3000/sigma/login",
    "clients": "http://localhost:3000/sigma/requests/clients"
  },
  "searchData": {
    "clientIdentification": "1075322278"
  },
  "validations": {
    "searchFunctionality": true,
    "filterFunctionality": true,
    "detailAccess": true,
    "generalInformation": true,
    "contactData": true,
    "clientStatus": true,
    "requestHistory": true
  }
}
```

# Pasos (AAA)

## Arrange (Preparar)
- Configurar driver de Selenium para Google Chrome con anti-detección
- Establecer timeouts y configuraciones de ventana maximizada (1920x1080)
- Definir selectores robustos para búsqueda, tabla y botón de detalles
- Preparar datos de búsqueda con número de identificación del cliente
- Configurar variables para validación de secciones de información

## Act (Actuar)

### 1. **Autenticación y Navegación**
   - Realizar login con credenciales (danielsr_1997@hotmail.com)
   - Navegar al módulo Solicitudes > Clientes
   - Verificar disponibilidad de tabla con listado de clientes
   - Verificar disponibilidad de campo de búsqueda

### 2. **Búsqueda y Filtrado de Cliente**
   - Refrescar página para cargar datos actualizados
   - Localizar campo de búsqueda con múltiples selectores de fallback
   - Ingresar número de identificación: 1075322278
   - Esperar a que la tabla se filtre automáticamente
   - Verificar que el cliente aparece en los resultados filtrados
   - Capturar información de la fila donde aparece el cliente

### 3. **Acceso a la Vista Detallada**
   - Localizar botón "Ver detalles" del cliente encontrado
   - Usar selector específico: //tbody/tr[{target_row}]/td[7]/div[1]/button[1]
   - Realizar scroll hasta el botón para asegurar visibilidad
   - Hacer clic en el botón "Ver detalles"
   - Esperar a que se cargue completamente la vista detallada

### 4. **Verificación de Sección: Información General**
   - Buscar títulos o elementos que identifiquen la sección de información general
   - Verificar presencia de campos: Razón Social, Identificación, Tipo de Persona, Nombre Comercial
   - Validar que los datos se muestran correctamente
   - Confirmar estructura y organización de la información

### 5. **Verificación de Sección: Datos de Contacto**
   - Buscar sección de datos de contacto
   - Verificar presencia de campos: Email, Teléfono, Dirección, Municipio
   - Validar que la información de contacto se muestra correctamente
   - Confirmar formato y presentación de datos

### 6. **Verificación de Sección: Estado del Cliente**
   - Buscar sección de estado del cliente
   - Verificar presencia de información sobre el estado del cliente
   - Validar indicadores de usuario activo/inactivo
   - Confirmar que el estado se muestra claramente

### 7. **Verificación de Sección: Historial de Solicitudes**
   - Buscar sección de historial de solicitudes
   - Verificar presencia de tabla de solicitudes
   - Validar columnas de la tabla (Código, Estado, Fecha, etc.)
   - Confirmar que el historial está organizado correctamente
   - Verificar que las solicitudes se muestran ordenadas (si aplica)

## Assert (Verificar)

### **Verificaciones de Funcionalidad Principal**
- Búsqueda de cliente funciona correctamente por número de identificación
- Filtrado de resultados en el listado se ejecuta automáticamente
- Botón "Ver detalles" está disponible y accesible en la tabla
- Vista detallada se carga completamente sin errores
- Navegación entre listado y detalle funciona correctamente

### **Verificaciones de Secciones de Información**
- Sección de información general se muestra con todos los campos esperados
- Sección de datos de contacto contiene información completa y válida
- Sección de estado del cliente muestra el estado actual del cliente
- Sección de historial de solicitudes está organizada y estructurada correctamente
- Todas las secciones tienen formato consistente y legible

### **Verificaciones Técnicas**
- No hay errores críticos en consola del navegador
- Selectores robustos funcionan con múltiples opciones de fallback
- Timeouts y esperas funcionan correctamente
- La página se carga sin problemas de rendimiento
- Interfaz responde apropiadamente a las interacciones

# Resultados Esperados
- **Búsqueda exitosa**: El cliente con identificación 1075322278 se encuentra en los resultados filtrados
- **Filtrado automático**: La tabla se actualiza automáticamente al ingresar el número de identificación
- **Acceso al detalle**: El botón "Ver detalles" funciona correctamente y carga la vista detallada
- **Información General**: Se muestra con campos: Razón Social, Identificación, Tipo de Persona, Nombre Comercial
- **Datos de Contacto**: Se muestra información completa: Email, Teléfono, Dirección, Municipio
- **Estado del Cliente**: Se muestra el estado actual del cliente de forma clara
- **Historial de Solicitudes**: Se muestra organizado en tabla con columnas apropiadas (Código, Estado, Fecha)
- **Organización correcta**: Todas las secciones están bien estructuradas y fáciles de leer

# Resultados Obtenidos
- **Búsqueda y filtrado**: Cliente encontrado exitosamente por número de identificación 1075322278
- **Acceso al detalle**: Botón "Ver detalles" encontrado y funcionando correctamente
- **Información General**: Sección verificada con campos encontrados (Razón Social, Identificación, Tipo de Persona, Nombre Comercial)
- **Datos de Contacto**: Sección verificada con campos encontrados (Email, Teléfono, Dirección, Municipio)
- **Estado del Cliente**: Sección verificada con información de estado encontrada
- **Historial de Solicitudes**: Sección verificada con tabla de solicitudes organizada correctamente
- **Selectores robustos**: Múltiples opciones de fallback funcionando correctamente
- **Navegación**: Todas las transiciones entre pantallas funcionando sin errores
- **Status**: PASSED - Todas las secciones verificadas exitosamente

# Criterios de Aceptación Validados
1. Sistema permite buscar cliente existente por número de identificación
2. Filtrado de resultados funciona automáticamente al ingresar búsqueda
3. Acceso al detalle desde el listado funciona correctamente
4. Vista detallada muestra sección de información general completa
5. Vista detallada muestra sección de datos de contacto completa
6. Vista detallada muestra sección de estado del cliente
7. Vista detallada muestra sección de historial de solicitudes organizada
8. Todas las secciones están estructuradas y organizadas correctamente
9. Navegación entre listado y detalle funciona sin errores
10. Selectores robustos permiten encontrar elementos con múltiples opciones

# Estado
Aprobado

# Fecha Ejecución
2025-01-15 14:30:00

# Ejecutado por
Sistema Automatizado

