EndPoint para Activar/Desactivar Empleado

El método es PATCH con el siguiente url:

http://localhost:8000/employees/{id_employee}/toggle-status/


JSON OBSERVACIÓN OBLIGATORIA PARA DESACTIVAR (ACTIVAR NO OBLIGATORIO)

{
  "observation": "Motivo de la desactivación"
}


Permisos

INSERT INTO permission (id, name, description, category) 
VALUES (10, 'users.status.change', 'Cambiar estado de usuarios (habilitar/inhabilitar)', 'Usuarios');


Respuesta esperada activar

{
    "message": "Empleado activado exitosamente."
}


Respuesta de esperada desactivar

{
    "message": "Empleado desactivado exitosamente."
}


Respuesta esperada desactivar sin observación

{
    "message": "El campo observation es obligatorio al desactivar al empleado."
}
