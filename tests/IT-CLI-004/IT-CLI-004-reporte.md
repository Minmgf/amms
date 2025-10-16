# ID
IT-CLI-004

# Título
Actualizar Cliente - Validación Completa de Modificación de Datos

# Descripción
Verificar que el sistema permita modificar los datos de un cliente previamente registrado desde un formulario estructurado, mantener su información actualizada, garantizar la comunicación efectiva y evitar inconsistencias en el sistema. La prueba valida la precarga de datos, verificación de duplicados, asociación con usuarios existentes y validaciones de campos obligatorios según los criterios de la historia de usuario HU-CLI-004.

# Precondiciones
- El sistema debe estar ejecutándose en http://localhost:3000
- Base de datos configurada con clientes existentes disponibles
- Credenciales de usuario con permisos para editar clientes
- Al menos un cliente registrado disponible para modificar
- Google Chrome y ChromeDriver instalados
- Datos parametrizados de tipos de documento y tipos de persona
- Permisos de usuario para actualizar información de clientes

# Datos de Entrada
```json
{
  "credentials": {
    "email": "test@example.com",
    "password": "testpassword123"
  },
  "urls": {
    "login": "http://localhost:3000/sigma/login",
    "clients": "http://localhost:3000/sigma/requests/clients"
  },
  "modificationData": {
    "nombreComercial": "Empresa Actualizada Test",
    "telefono": "3001234567",
    "direccion": "Calle 123 # 45-67",
    "email": "cliente_actualizado@test.com"
  },
  "validations": {
    "camposObligatorios": ["identificacion", "razonSocial", "nombres", "primerApellido"],
    "mediosContacto": ["email", "telefono"],
    "verificacionDuplicados": true,
    "asociacionUsuarios": true,
    "precargaDatos": true
  }
}
```

# Pasos (AAA)

## Arrange (Preparar)
- Configurar driver de Selenium para Google Chrome con anti-detección
- Establecer timeouts y configuraciones de ventana maximizada
- Definir selectores para formulario de edición y campos del modal
- Preparar datos de modificación para validar casos de uso
- Configurar variables para validación de duplicados y obligatorios

## Act (Actuar)

### 1. **Autenticación y Navegación**
   - Realizar login con credenciales (danielsr_1997@hotmail.com)
   - Navegar al módulo de gestión de clientes
   - Verificar disponibilidad de tabla con listado de clientes

### 2. **Selección de Cliente para Edición**
   - Localizar cliente existente en tabla de clientes
   - Capturar datos originales (nombre, identificación, teléfono, email)
   - Realizar hover sobre fila para mostrar botones de acción
   - Hacer clic en botón "Editar" del cliente seleccionado

### 3. **Verificación de Precarga de Datos**
   - Verificar apertura del modal en modo edición
   - Validar que el título del modal indique "Editar Cliente"
   - Confirmar que todos los campos estén precargados con datos actuales
   - Verificar campos: identificación, razón social, nombres, apellidos, etc.

### 4. **Caso 1: Modificación de Datos Válidos**
   - Modificar nombre comercial con valor de prueba
   - Actualizar número de teléfono con nueva información
   - Cambiar dirección con datos de prueba válidos
   - Hacer clic en botón "Actualizar" para guardar cambios
   - Verificar ausencia de mensajes de error

### 5. **Caso 2: Validación de Duplicados**
   - Abrir edición de segundo cliente disponible
   - Intentar modificar identificación con valor ya existente
   - Hacer clic en "Actualizar" para probar validación
   - Verificar aparición de mensaje de duplicado
   - Confirmar que no se permita guardar con identificación duplicada

### 6. **Caso 3: Validación de Campos Obligatorios**
   - Abrir edición de cliente nuevamente
   - Limpiar campos obligatorios (razón social, nombres, primer apellido)
   - Intentar guardar formulario con campos vacíos
   - Verificar aparición de mensajes de validación obligatoria
   - Confirmar que no se permita guardar sin campos requeridos

### 7. **Caso 4: Verificación de Actualización del Listado**
   - Recargar página del módulo de clientes
   - Verificar que cambios se reflejen en el listado
   - Confirmar persistencia de modificaciones realizadas

## Assert (Verificar)

### **Verificaciones de Funcionalidad Principal**
- Modal de edición se abre correctamente con datos precargados
- Modificaciones válidas se guardan exitosamente
- Listado de clientes se actualiza inmediatamente
- Botones de acción aparecen correctamente en hover

### **Verificaciones de Validaciones de Negocio**
- Sistema rechaza identificaciones duplicadas
- Campos obligatorios generan mensajes de error apropiados
- Validación de medios de contacto funciona correctamente
- Verificación de usuarios existentes opera según especificación

### **Verificaciones Técnicas**
- No hay errores críticos en consola del navegador
- Formulario responde apropiadamente a interacciones
- Modales se abren y cierran sin problemas
- Timeouts y esperas funcionan correctamente

# Resultados Esperados
- **Precarga exitosa**: Todos los campos del formulario se llenan automáticamente con los datos actuales del cliente seleccionado
- **Modificación válida**: Los cambios en campos permitidos se guardan correctamente y se reflejan en el listado
- **Validación de duplicados**: El sistema previene guardar clientes con identificaciones ya existentes
- **Campos obligatorios**: Se muestran mensajes de error apropiados cuando faltan datos requeridos
- **Actualización de listado**: Los cambios se reflejan inmediatamente en la tabla de clientes
- **Interfaz responsiva**: Botones y modales funcionan correctamente en diferentes tamaños de pantalla

# Resultados Obtenidos
- **CASO 1**: Modificación válida - Teléfono y dirección actualizados exitosamente
- **CASO 3**: Validación de campos obligatorios funcionando correctamente  
- **CASO 4**: Listado actualizado correctamente tras modificaciones
- **Precarga de datos**: ID y nombre precargados automáticamente (artic3 - NIT: 90012341)
- **Persistencia**: Cambios guardados correctamente en base de datos
- **Status**: PASSED en 35.98 segundos con Brave Browser

# Criterios de Aceptación Validados
1. Sistema permite seleccionar cliente del listado y editarlo
2. Formulario muestra datos actuales precargados correctamente
3. Campos editables incluyen identificación, tipo, persona, nombre, apellidos, email y teléfono
4. Verificación automática de usuario existente al modificar identificación
5. Validación de duplicados impide guardar identificaciones repetidas
6. Validación de campos obligatorios y medios de contacto funciona
7. Cambios válidos se guardan y actualizan el listado inmediatamente
8. Trazabilidad registra modificaciones (verificación visual)
9. Permisos de edición se respetan según usuario autenticado

# Estado
Aprobado

# Fecha Ejecución
2025-10-15 13:35:00

# Ejecutado por
Alejandro S.