Consulta de historial de cambios - Maquinaria
El siguiente endpoint permite listar el histórico de los cambios asociados a maquinaria y mantenimiento, incluyendo operaciones “CREATE”, “UPDATE”, y “DELETE”.

Método: GET

Endpoint:

http://localhost:8070/audit-events?module=machinery
Respuesta esperada:
[
  {
    "event_id": "9df40a93-5942-460b-af21-75537cd81dd2",
    "ts": "2025-09-30T00:40:43-05:00",
    "actor_id": "1",
    "actor_name": "Juan camilo",
    "actor_role": "Administrador",
    "permission_id": 119,
    "module": "machinery",
    "submodule": "maintenance_request",
    "operation": "CREATE",
    "object_id": "9",
    "ip": null,
    "user_agent": "PostmanRuntime/7.48.0",
    "diff": {
      "changed": {},
      "created": {
        "priority": 16,
        "description": "Ruidos anómalos al encender; posible rodamiento.",
        "detected_at": "2025-09-26",
        "id_machinery": 1,
        "justification": null,
        "request_status": 10,
        "maintenance_type": 14,
        "modification_date": "2025-09-30T05:40:43.854317+00:00",
        "registration_date": "2025-09-30T05:40:43.854292+00:00",
        "id_responsible_user": 1,
        "id_maintenance_request": 9
      },
      "removed": {}
    },
    "meta": {}
  },
  {
    "event_id": "39b0092a-4f1a-4372-a3ff-6e76d49905ab",
    "ts": "2025-09-30T00:04:09-05:00",
    "actor_id": "1",
    "actor_name": "Juan camilo",
    "actor_role": "Administrador",
    "permission_id": 103,
    "module": "machinery",
    "submodule": "machinery_documentation_sheet",
    "operation": "DELETE",
    "object_id": "2",
    "ip": null,
    "user_agent": "PostmanRuntime/7.48.0",
    "diff": {
      "changed": {},
      "created": {},
      "removed": {
        "path": "https://storage.googleapis.com/sigma-18f5c.firebasestorage.app/machinery/documents/a9b83f3d-345f-4dd4-af6b-b3651bbe0218_20250927_001702.jpg",
        "document": "Manual de Operaci├│n CAT 455",
        "id_machinery": 1,
        "creation_date": "2025-09-23",
        "justification": "",
        "responsible_user": "1",
        "id_machinery_documentation": 2
      }
    },
    "meta": {
      "action": "delete"
    }
  },
  {
    "event_id": "97913c5a-e321-4f7c-ba5f-5ff02d9fd98d",
    "ts": "2025-09-29T23:59:23-05:00",
    "actor_id": "1",
    "actor_name": "Juan camilo",
    "actor_role": "Administrador",
    "permission_id": 92,
    "module": "machinery",
    "submodule": "specific_technical_sheet",
    "operation": "UPDATE",
    "object_id": "6",
    "ip": null,
    "user_agent": "PostmanRuntime/7.48.0",
    "diff": {
      "changed": {
        "power": {
          "to": 60.9,
          "from": 69.9
        },
        "operating_weight": {
          "to": "2500.0",
          "from": 2500.0
        }
      },
      "created": {},
      "removed": {}
    },
    "meta": {
      "id_machinery": 5
    }
  }
]
Si se requiere filtrar por una maquinaria en concreto (a partir de su ID) se puede usar el atributo: “id_machinery”

Endpoint para listar maquinaria (en caso de ser requerido):

http://localhost:8000/machinery/list/
Si se requiere filtrar por operación/acción se puede usar el atributo: “operation”

CREATE
UPDATE
DELETE