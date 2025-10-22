# ID
IT-SER-004

# Título
Eliminar/Desactivar Servicios - Validación de Integridad de Datos

# Descripción
Verificar que el sistema permita eliminar o desactivar servicios desde el listado manteniendo la integridad de la información asociada. La prueba valida la detección de información relacionada, eliminación definitiva para servicios sin datos asociados, soft delete para preservar integridad referencial, validaciones de permisos y registro de auditoría según los criterios de la historia de usuario HU-SER-004.

# Precondiciones
- El sistema debe estar ejecutándose en http://localhost:3000
- Base de datos configurada con servicios existentes disponibles
- Credenciales mock configuradas para autenticación
- Al menos un servicio registrado disponible para eliminar
- Brave Browser y ChromeDriver instalados
- Servicios con y sin información asociada (facturas, registros dependientes)
- Permisos de usuario para gestión de servicios (permiso 144)

# Datos de Entrada
```json
{
  "credentials": {
    "email": "test@example.com",
    "password": "testpassword123"
  },
  "urls": {
    "login": "http://localhost:3000/sigma/login",
    "services": "http://localhost:3000/sigma/requests/services"
  },
  "testScenarios": {
    "serviceWithoutAssociatedData": {
      "description": "Servicio sin información relacionada para eliminación definitiva",
      "expectedAction": "physical_delete"
    },
    "serviceWithAssociatedData": {
      "description": "Servicio con facturas o datos relacionados para soft delete",
      "expectedAction": "soft_delete"
    }
  },
  "permissions": {
    "deleteService": 144,
    "listServices": 142,
    "editService": 141
  },
  "validations": {
    "confirmationModal": true,
    "integrityCheck": true,
    "permissionValidation": true,
    "realTimeUpdate": true,
    "auditLogging": true
  }
}
```

# Pasos (AAA)

## Arrange (Preparar)
- Configurar driver de Selenium para Brave Browser con anti-detección
- Establecer timeouts y configuraciones de ventana maximizada
- Definir selectores para botones de eliminación y modales de confirmación
- Preparar identificación de servicios con y sin información asociada
- Configurar variables para validación de permisos y mensajes del sistema

## Act (Actuar)

### 1. **Autenticación y Navegación**
   - Realizar login con credenciales mock (test@example.com)
   - Navegar al módulo de gestión de servicios
   - Verificar disponibilidad de tabla con listado de servicios

### 2. **Verificación de Opciones de Eliminación**
   - Localizar servicios existentes en tabla
   - Realizar hover sobre filas para mostrar botones de acción
   - Verificar presencia de botones "Eliminar" en columna de acciones
   - Confirmar que botones sean interactuables

### 3. **Caso 1: Eliminación de Servicio sin Información Asociada**
   - Seleccionar servicio candidato sin datos relacionados
   - Hacer clic en botón "Eliminar" del servicio seleccionado
   - Verificar aparición de modal de confirmación
   - Confirmar eliminación en modal
   - Verificar mensaje de éxito y desaparición del servicio del listado

### 4. **Caso 2: Soft Delete de Servicio con Información Asociada**
   - Seleccionar servicio con facturas o datos relacionados
   - Intentar eliminar servicio haciendo clic en "Eliminar"
   - Verificar mensaje indicando información asociada
   - Confirmar aplicación de soft delete (cambio a estado "Inactivo")
   - Verificar que servicio permanece visible pero desactivado

### 5. **Caso 3: Validación de Permisos**
   - Verificar controles de permisos en botones de eliminación
   - Intentar eliminación para verificar validaciones de autorización
   - Confirmar mensajes apropiados para usuarios no autorizados
   - Verificar que solo usuarios con permisos puedan realizar eliminación

### 6. **Caso 4: Actualización en Tiempo Real**
   - Realizar acción de eliminación o desactivación
   - Verificar actualización inmediata del listado sin refrescar página
   - Confirmar reflejo del nuevo estado en tiempo real
   - Validar persistencia de cambios en la interfaz

### 7. **Caso 5: Manejo de Errores**
   - Intentar acciones que puedan generar errores del sistema
   - Verificar aparición de mensajes de error claros e informativos
   - Confirmar que sistema no se bloquea ante fallos
   - Validar que errores proporcionen información útil al usuario

## Assert (Verificar)

### Validaciones de Acceso y Listado
- Página de gestión de servicios carga correctamente
- Título "Gestión de Servicios" está presente
- Tabla de servicios contiene registros disponibles
- Botones de eliminar están presentes en cada fila de servicio

### Validaciones de Eliminación Definitiva
- Modal de confirmación aparece al intentar eliminar
- Servicio sin información asociada se elimina completamente
- Mensaje de éxito se muestra tras eliminación exitosa
- Servicio desaparece del listado tras eliminación física

### Validaciones de Soft Delete
- Sistema detecta servicios con información asociada
- Mensaje explicativo aparece indicando datos relacionados
- Soft delete se aplica cambiando estado a "Inactivo"
- Servicio permanece visible para consulta histórica

### Validaciones de Permisos y Seguridad
- Sistema valida permisos antes de permitir eliminación
- Usuarios no autorizados reciben mensajes de restricción
- Controles de acceso funcionan correctamente
- Solo usuarios con permiso 144 pueden eliminar servicios

### Validaciones de Experiencia de Usuario
- Listado se actualiza en tiempo real sin recargar página
- Cambios de estado se reflejan inmediatamente
- Mensajes de error son claros e informativos
- Sistema mantiene estabilidad ante errores

### Validaciones de Integridad de Datos
- Información asociada se preserva mediante soft delete
- Eliminación física solo ocurre sin datos relacionados
- Integridad referencial se mantiene en el sistema
- Auditoría de acciones se registra apropiadamente

# Resultados Esperados
- Login exitoso con credenciales mock
- Listado de servicios cargado correctamente
- Botones de eliminar visibles al hacer hover
- Modal de confirmación aparece al intentar eliminar
- Servicios sin datos asociados se eliminan definitivamente
- Servicios con datos asociados se desactivan (soft delete)
- Mensajes de error/éxito apropiados se muestran
- Listado se actualiza en tiempo real
- Permisos se validan correctamente
- Tiempo de ejecución: 40-60 segundos
- Estado final: PASSED

# Resultados Obtenidos
```
Login completado
Navegando al módulo de gestión de servicios
=== TEST 1: ACCESO MODULO SERVICIOS Y LISTADO ===
Página de gestión de servicios cargada correctamente
Título "Gestión de Servicios" encontrado
Tabla de servicios con registros disponibles
PASSED

=== TEST 2: VERIFICAR PRESENCIA BOTONES ELIMINAR ===
Se encontraron 3 botones de eliminar en servicios
Botones interactuables y visibles al hacer hover
PASSED

=== TEST 3: ELIMINAR SERVICIO SIN INFORMACIÓN ASOCIADA ===
Eliminación exitosa del servicio 'Servicio Test'
Sistema procesó eliminación correctamente
PASSED

=== TEST 4: VERIFICAR SOFT DELETE SERVICIO CON INFORMACIÓN ASOCIADA ===
Sistema detectó información asociada para servicio
Respuesta apropiada del sistema aplicada
PASSED

=== TEST 5: VERIFICAR PERMISOS ELIMINACIÓN ===
Usuario tiene permisos para eliminar servicios
Validación de permisos funcionando correctamente
PASSED

=== TEST 6: VERIFICAR ACTUALIZACIÓN TIEMPO REAL LISTADO ===
Listado actualizado en tiempo real - posible soft delete aplicado
Cambios reflejados inmediatamente
PASSED

=== TEST 7: VERIFICAR MANEJO DE ERRORES ===
No se generaron errores durante las pruebas
Sistema estable ante diferentes acciones
PASSED

=== RESUMEN ===
Todos los criterios de aceptación validados exitosamente
Tiempo total: 150.70 segundos (2m 30s)
7/7 casos de prueba aprobados
```

# Estado
Aprobado

# Fecha Ejecución
2025-10-20 12:44:00

# Ejecutado por
Alejandro S.