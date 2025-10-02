# ID
IT-SM-004

# Título
Ver Detalle de Solicitud de Mantenimiento - Funcionalidad Completa

# Descripción
Verificar que el sistema permita visualizar los detalles completos de una solicitud de mantenimiento desde el listado, incluyendo información de la solicitud, maquinaria asociada, detalles del mantenimiento y respuesta (si aplica). La prueba valida el acceso con permisos adecuados y que la información se muestre en modo solo lectura.

# Precondiciones
- El sistema debe estar ejecutándose en http://localhost:3000
- Base de datos configurada con datos de prueba de solicitudes de mantenimiento
- Al menos una solicitud de mantenimiento disponible en el listado
- Credenciales de usuario mock configuradas con permisos de visualización
- Google Chrome y ChromeDriver instalados

# Datos de Entrada
```json
{
  "credentials": {
    "email": "admin@test.com", 
    "password": "admin123"
  },
  "urls": {
    "login": "http://localhost:3000/sigma/login",
    "maintenanceRequests": "http://localhost:3000/sigma/maintenance/maintenanceRequest"
  },
  "expectedFields": {
    "solicitud": ["consecutivo", "fecha", "usuario", "estado"],
    "maquinaria": ["serial", "nombre"],
    "mantenimiento": ["tipo", "descripcion", "prioridad"],
    "respuesta": ["fecha_programado", "tecnico", "razon_rechazo"]
  },
  "readOnlyValidation": true
}
```

# Pasos (AAA)

## Arrange (Preparar)
- Configurar driver de Selenium para Google Chrome
- Establecer timeouts y configuraciones de ventana
- Definir selectores para botones de detalles y campos de información
- Preparar variables para validación de campos

## Act (Ejecutar)
1. **Login y Acceso al Listado**
   - Navegar a URL de login
   - Ingresar credenciales mock
   - Verificar redirección exitosa
   - Acceder al módulo de solicitudes de mantenimiento
   - Verificar que hay solicitudes disponibles

2. **Acceso a Detalles desde Listado**
   - Localizar botón "Detalle"/"Ver" en la primera solicitud
   - Hacer clic en botón de detalles
   - Verificar apertura de vista de detalles (modal o nueva página)

3. **Verificación de Información de Solicitud**
   - Buscar campo número/consecutivo de solicitud
   - Verificar fecha de solicitud
   - Validar usuario solicitante
   - Confirmar estado de la solicitud (Pendiente/Aprobado/Rechazado/Programado)

4. **Verificación de Datos de Maquinaria**
   - Buscar serial de la maquinaria
   - Verificar nombre de la maquinaria
   - Validar información completa del equipo

5. **Verificación de Detalles de Mantenimiento**
   - Confirmar tipo de mantenimiento (Preventivo/Correctivo)
   - Verificar descripción del problema
   - Validar prioridad (Alta/Media/Baja)

6. **Verificación de Detalles de Respuesta**
   - Buscar fecha y usuario de respuesta (si aplica)
   - Verificar razón de rechazo (si la solicitud fue rechazada)
   - Confirmar fecha programada y técnico asignado (si aplica)

7. **Validación de Modo Solo Lectura**
   - Verificar que no hay campos editables de contenido
   - Confirmar que la información se muestra sin posibilidad de modificación
   - Validar que solo hay elementos de navegación/consulta

8. **Verificación de Permisos**
   - Confirmar acceso exitoso a vista de detalles
   - Validar que el usuario tiene permisos apropiados

## Assert (Verificar)
- Acceso exitoso desde el listado de solicitudes
- Vista de detalles abierta correctamente (URL cambiada o modal visible)
- Mínimo 2 campos de información de solicitud presentes
- Mínimo 1 campo de datos de maquinaria presente  
- Mínimo 2 campos de detalles de mantenimiento presentes
- Información mostrada en modo solo lectura
- No hay campos de contenido editables
- Permisos de acceso validados implícitamente

# Resultado Esperado
- Acceso exitoso desde botón de detalles en listado
- Vista de detalles abierta (modal o nueva página)
- Información de solicitud visible: consecutivo, fecha, usuario, estado
- Datos de maquinaria mostrados: serial, nombre
- Detalles de mantenimiento presentes: tipo, descripción, prioridad
- Detalles de respuesta (si aplicable): fechas, técnico, razones
- Todos los campos en modo solo lectura
- Sin campos de contenido editables
- Permisos de acceso funcionando correctamente
- Tiempo de ejecución: 25-30 segundos
- Estado final: PASSED

# Resultado Obtenido
```
Login completado
Solicitudes disponibles: 10
=== ACCEDIENDO A DETALLES ===
Botón de detalles presionado
=== VERIFICANDO VISTA DE DETALLES ===
Vista de detalles abierta correctamente
=== VERIFICANDO INFORMACIÓN DE SOLICITUD ===
Campos de solicitud encontrados: Número/Consecutivo, Usuario solicitante, Estado
=== VERIFICANDO DATOS DE MAQUINARIA ===
Campos de maquinaria encontrados: Serial, Nombre de máquina
=== VERIFICANDO DETALLES DE MANTENIMIENTO ===
Campos de mantenimiento encontrados: Tipo de mantenimiento, Descripción, Prioridad
=== VERIFICANDO DETALLES DE RESPUESTA ===
Detalles de respuesta encontrados
=== VERIFICANDO LÓGICA DE FECHAS ===
Validación de lógica de fechas no aplicable (pocas fechas encontradas)
=== VERIFICANDO MODO SOLO LECTURA ===
Campo editable detectado - Tipo: select-one, Clase: parametrization-pagination-select (control de paginación)
Advertencia: 1 campo editable de contenido encontrado (solo paginación - normal)
=== VERIFICANDO ACCESO CON PERMISOS ===
Acceso a detalles exitoso (permisos correctos)
=== VERIFICANDO NAVEGACIÓN DE CIERRE ===
Botón de cierre no encontrado específicamente
IT-SM-004 COMPLETADO: Vista de detalles de solicitud verificada correctamente
PASSED - Tiempo: 24.35 segundos
```

# Estado
Aprobado

# Fecha Ejecución
2025-10-01 18:00:00

# Ejecutado por
Alejandro S