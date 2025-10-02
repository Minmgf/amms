Consulta de historial de mantenimientos programados

El siguiente endpoint permite listar el historial de mantenimientos programados para maquinaria:

Método: GET

Endpoint:

http://localhost:8070/audit-events?module=machinery&submodule=maintenance_scheduling


Respuesta esperada:

[
  {
    "event_id": "60c1b114-cfc1-4661-ab7c-72e80ce2dd41",
    "ts": "2025-09-28T23:44:09-05:00", 
    "actor_id": "1",
    "actor_name": "Juan camilo", // Usuario responsable de programar mantenimiento
    "actor_role": "Administrador",
    "permission_id": 117,
    "module": "maintenance",
    "submodule": "maintenance_scheduling",
    "operation": "CREATE",
    "object_id": "23",
    "ip": null,
    "user_agent": "PostmanRuntime/7.48.0",
    "diff": {
      "changed": {},
      "created": {
        "details": "Cambio de filtros y revisión de frenos", // Descripción de mantenimiento
        "id_machinery": 1, // ID de maquinaria
        "scheduled_at": "2025-12-03 23:30:32+00:00", // Fecha de programación de mantenimiento
        "justification": null, // Justificación (si aplica)
        "id_consecutive": 24,
        "maintenance_type": 14,
        "modification_date": "2025-09-29 04:44:09.308931+00:00",
        "registration_date": "2025-09-29 04:44:09.308925+00:00",
        "assigned_technician": 2, // Técnico responsable
        "id_responsible_user": "1",
        "id_maintenance_request": null,
        "id_maintenance_scheduling": 23,
        "maintenance_scheduling_status": 13 // Estado 
      },
      "removed": {}
    },
    "meta": {}
  }
]


NOTA:

De momento no cumple con opción de generación de PDF debido a que esta HU es producto de una extensión/consumo del microservicio de auditoría.