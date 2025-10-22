# ID
IT-MAQ_014

# Título
Actualizar Mantenimientos Periódicos

# Descripción
Validar que el sistema permite actualizar la información de los mantenimientos periódicos de una maquinaria registrada, cumpliendo los criterios de aceptación definidos en HU-MAQ-014.

# Precondiciones
- Usuario con credenciales válidas: u20191179903@usco.edu.co / 4L34J4CT4est
- Maquinaria registrada con mantenimientos periódicos existentes.
- Permisos de actualización de maquinaria asignados al usuario.
- Acceso al módulo de edición de maquinaria.
- Navegador de preferencia configurado para Selenium.
- Recomendaciones:
  - Verificar que los datos de prueba incluyan mantenimientos periódicos ya registrados.
  - Validar que el usuario tenga permisos de edición.
  - Revisar que los mensajes de error y confirmación sean claros y específicos.

# Datos de Entrada
```json
{
  "email": "u20191179903@usco.edu.co",
  "password": "4L34J4CT4est",
  "maquinaria_id": "<id_maquinaria_existente>",
  "mantenimiento": "<nombre_mantenimiento_existente>",
  "horas_uso": 100,
  "distancia_recorrida": 500,
  "justificacion": "Actualización por cambio de condiciones de uso"
}
```

# Pasos (AAA)
## Arrange
- Iniciar sesión con usuario autorizado.
- Acceder al módulo de edición de maquinaria y seleccionar una maquinaria con mantenimientos periódicos registrados.
- Abrir el formulario modal multipaso y avanzar al quinto paso (Mantenimientos Periódicos).

## Act
- Editar los valores precargados de mantenimiento, horas de uso y distancia recorrida.
- Modificar los parámetros y completar la justificación obligatoria.
- Intentar guardar los cambios.

## Assert
- Validar que:
  - El sistema muestra los valores existentes precargados y permite su edición.
  - Los campos obligatorios están completos y los valores numéricos son válidos.
  - No se permite guardar mantenimientos duplicados para la misma maquinaria.
  - Se exige justificación obligatoria para los cambios.
  - Si los datos son correctos, se muestra mensaje de confirmación y se registra el cambio en el historial.
  - Si hay error (datos inválidos, falta de justificación, permisos insuficientes), se muestra mensaje de error específico.
  - Los cambios se reflejan en tiempo real y permiten avanzar al siguiente paso.

# Resultado Esperado
- El sistema permite editar y guardar los mantenimientos periódicos, mostrando confirmación y registrando el historial de cambios.
- Los errores se muestran claramente si los datos son inválidos, falta justificación o permisos.
- Los cambios son visibles inmediatamente en la plataforma.

# Resultado Obtenido
```json
{
  "exito": true,
  "confirmacion": "Mantenimiento actualizado correctamente.",
  "historial": "Registro de modificación con fecha, usuario y justificación.",
  "errores": []
}
```

# Estado
Pendiente
# Fecha Ejecución
28/09/2025

# Ejecutado por
Alejandro Saenz

# Evidencias
- Capturas de pantalla y logs generados por Selenium en caso de fallo.
