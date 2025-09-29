
# ID
IT-GM-001

# Título
Registrar Mantenimiento

# Descripción
Se detalla la validación del flujo de registro de mantenimiento, cubriendo escenarios de éxito y errores (duplicidad, longitud, campos obligatorios).

# Precondiciones
- Usuario con credenciales autorizadas genéricas.
- Acceso al módulo de gestión de mantenimientos.
- Navegador de preferencia configurado para Selenium.
- Recomendaciones:
  - Mantener la validación de errores en el frontend alineada con los mensajes esperados por el test.
  - Revisar los límites de longitud en el backend y frontend para evitar inconsistencias.
  - Mejorar la accesibilidad de los modales de error para facilitar la automatización y el diagnóstico.
  - Documentar los mensajes de error en el manual de usuario para mayor claridad.

# Datos de Entrada
```json
{
  "email": "usuario.autorizado@dominio.com",
  "password": "PasswordAutorizado123",
  "nombre": "Mantenimiento Selenium <timestamp>",
  "descripcion": "Prueba automatizada para ver exito o fracaso",
  "nombre_invalido": "X...X (101 caracteres)",
  "descripcion_invalida": "Y...Y (400 caracteres)"
}
```

# Pasos (AAA)
## Arrange
- Preparar datos de entrada y entorno según precondiciones.
- Iniciar sesión con usuario autorizado.
- Acceder al módulo de gestión de mantenimientos.

## Act
- Abrir el modal de registro de mantenimiento.
- Realizar los siguientes escenarios:
  - Registro exitoso: Completar todos los campos con datos válidos y enviar.
  - Duplicidad: Intentar registrar un mantenimiento con el mismo nombre que el anterior.
  - Longitud: Ingresar nombre y descripción excediendo el límite permitido.
  - Campos obligatorios: Enviar el formulario vacío.

## Assert
- Comparar el resultado obtenido con el esperado para cada escenario:
  - Éxito: El mantenimiento se registra y aparece en la lista. Modal de confirmación visible.
  - Duplicidad: Se muestra un mensaje de error indicando que el nombre ya existe o es duplicado.
  - Longitud: Se muestra un mensaje de error indicando que el nombre o descripción exceden el límite.
  - Campos obligatorios: Se muestra un mensaje de error indicando que los campos son requeridos.

# Resultado Esperado
Descripción del comportamiento esperado si la función o método opera correctamente:
- Éxito: El mantenimiento se registra y aparece en la lista. Modal de confirmación visible.
- Duplicidad: Se muestra un mensaje de error indicando que el nombre ya existe o es duplicado.
- Longitud: Se muestra un mensaje de error indicando que el nombre o descripción exceden el límite.
- Campos obligatorios: Se muestra un mensaje de error indicando que los campos son requeridos.

# Resultado Obtenido
```json
{
  "exito": true,
  "duplicidad": "Mensaje de error por nombre duplicado mostrado correctamente.",
  "longitud": "Mensaje de error por longitud mostrado correctamente.",
  "obligatorios": "Mensaje de error por campos obligatorios mostrado correctamente."
}
```

# Estado
Pendiente/Completado

# Fecha Ejecución
28/09/2025

# Ejecutado por
GitHub Copilot

# Evidencias
- Capturas de pantalla y logs generados por Selenium en caso de fallo.
