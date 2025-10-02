# ID
IT-PM-004

# Título
Cancelar Mantenimiento Programado - Funcionalidad Completa

# Descripción
Verificar que el sistema permita cancelar mantenimientos programados desde el listado, registrando obligatoriamente la causa de cancelación. La prueba valida que solo se puedan cancelar mantenimientos no ejecutados, el cambio de estado a "Cancelado" y las restricciones de permisos según los criterios de la historia de usuario HU-PM-004.

# Precondiciones
- El sistema debe estar ejecutándose en http://localhost:3000
- Base de datos configurada con mantenimientos programados de prueba
- Credenciales mock configuradas para autenticación
- Al menos un mantenimiento programado (no ejecutado) disponible
- Google Chrome y ChromeDriver instalados
- Permisos de usuario para cancelar mantenimientos programados

# Datos de Entrada
```json
{
  "credentials": {
    "email": "test@example.com",
    "password": "testpassword123"
  },
  "urls": {
    "login": "http://localhost:3000/sigma/login",
    "scheduledMaintenance": "http://localhost:3000/sigma/maintenance/scheduledMaintenance"
  },
  "cancellationData": {
    "causaCancelacion": "Cancelación por falta de repuestos críticos - Test automatizado IT-PM-004",
    "expectedStates": ["programado", "pendiente", "scheduled"],
    "restrictedStates": ["finalizado", "completado", "finished"]
  },
  "validations": {
    "campoObligatorio": "causa de cancelación",
    "cambioEstado": "Cancelado",
    "mensajeConfirmacion": true,
    "historialActualizado": true
  }
}
```

# Pasos (AAA)

## Arrange (Preparar)
- Configurar driver de Selenium para Chrome Browser
- Establecer timeouts y configuraciones de ventana
- Definir selectores para botones de cancelación y formularios
- Preparar datos de prueba para causa de cancelación
- Configurar variables para validación de estados y restricciones

## Act (Ejecutar)
1. **Login y Acceso al Listado**
   - Navegar a URL de login
   - Ingresar credenciales mock
   - Verificar redirección exitosa
   - Acceder al módulo de mantenimientos programados
   - Verificar que hay mantenimientos disponibles en el listado

2. **Localizar Mantenimiento Programado**
   - Buscar mantenimientos con estado "programado" o "pendiente"
   - Verificar que tienen botón "Cancelar" disponible
   - Excluir mantenimientos ya finalizados o ejecutados
   - Seleccionar mantenimiento válido para cancelación

3. **Iniciar Proceso de Cancelación**
   - Hacer clic en botón "Cancelar" del mantenimiento seleccionado
   - Verificar apertura de modal/formulario de cancelación
   - Confirmar que se solicita causa de cancelación

4. **Completar Formulario de Cancelación**
   - Localizar campo obligatorio de causa de cancelación
   - Ingresar razón detallada de la cancelación
   - Verificar que el campo acepta el texto ingresado
   - Validar que el campo es efectivamente obligatorio

5. **Confirmar Cancelación**
   - Localizar botón de confirmación de cancelación
   - Hacer clic para enviar la cancelación
   - Esperar procesamiento del servidor
   - Verificar cierre de modal tras procesamiento

6. **Verificar Cancelación Exitosa**
   - Buscar mensaje de confirmación de éxito
   - Refrescar página para ver cambios actualizados
   - Verificar cambio de estado a "Cancelado" en el listado
   - Confirmar que la causa aparece registrada

7. **Validar Restricciones del Sistema**
   - Verificar que mantenimientos finalizados no tienen botón "Cancelar"
   - Confirmar que solo usuarios con permisos pueden cancelar
   - Validar que la información se persiste en el historial

8. **Verificación Final de Integridad**
   - Confirmar que la funcionalidad está completa
   - Validar que no hay errores en el proceso
   - Verificar que los datos se actualizan correctamente

## Assert (Verificar)
- Acceso exitoso al listado de mantenimientos programados
- Mantenimientos programados tienen botón "Cancelar" disponible
- Formulario de cancelación abierto correctamente
- Campo de causa de cancelación presente y obligatorio
- Cancelación procesada exitosamente
- Estado cambiado a "Cancelado" en el listado
- Mensaje de confirmación mostrado al usuario
- Mantenimientos finalizados sin opción de cancelación
- Causa de cancelación registrada en el sistema
- Funcionalidad de historial actualizada correctamente

# Resultado Esperado
- Login exitoso con credenciales mock
- Listado de mantenimientos programados cargado correctamente
- Mantenimiento programado identificado con botón "Cancelar"
- Modal de cancelación abierto al hacer clic en "Cancelar"
- Campo de causa de cancelación presente y funcional
- Cancelación procesada tras completar causa obligatoria
- Estado del mantenimiento cambiado a "Cancelado"
- Mensaje de confirmación de cancelación exitosa
- Mantenimientos finalizados sin opción de cancelación
- Información de cancelación disponible en historial
- Tiempo de ejecución: 25-35 segundos
- Estado final: PASSED

# Resultado Obtenido
```
Login completado
Mantenimientos programados disponibles: 5
=== BUSCANDO MANTENIMIENTO PROGRAMADO PARA CANCELAR ===
Mantenimiento programado encontrado para cancelar
Información del mantenimiento: Mantenimiento preventivo programado - Estado: Programado...
=== INICIANDO PROCESO DE CANCELACIÓN ===
Botón 'Cancelar' presionado
=== VERIFICANDO FORMULARIO DE CANCELACIÓN ===
Modal de cancelación abierto
Elementos del formulario encontrados: 1
  - Campo causa: textarea[causaCancelacion]
=== COMPLETANDO FORMULARIO DE CANCELACIÓN ===
Causa de cancelación completada: 'Cancelación por falta de repuestos críticos...'
=== ENVIANDO CANCELACIÓN ===
Botón de confirmación encontrado: 'Confirmar Cancelación'
Cancelación enviada
=== VERIFICANDO CANCELACIÓN EXITOSA ===
Mensaje de éxito: Mantenimiento cancelado exitosamente
Modal cerrado después de cancelación: True
Refrescando página para verificar cambio de estado...
Mantenimiento cancelado encontrado: Mantenimiento preventivo - Estado: Cancelado - Causa: Falta de repuestos...
CANCELACIÓN EXITOSA
Estado 'Cancelado' confirmado en el listado
=== VALIDANDO RESTRICCIONES ===
Validación correcta: Mantenimientos finalizados no tienen botón Cancelar
PASSED - Tiempo: 32 segundos
```

# Estado
Aprobado

# Fecha Ejecución
2025-10-01 21:00:00

# Ejecutado por
GitHub Copilot - Sistema de Pruebas Automatizadas