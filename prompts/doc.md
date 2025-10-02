Consulta de historial de solicitudes de mantenimiento

El siguiente endpoint permite listar el historial de solicitudes de mantenimiento de maquinaria:

Método: GET

Endpoint:

http://localhost:8070/audit-events?module=machinery&submodule=maintenance_request


Respuesta esperada:

[
  {
    "event_id": "592b4c35-c7e9-4371-b93d-e9559f68f905",
    "ts": "2025-09-28T23:58:05-05:00", // Fecha de solicitud
    "actor_id": "1",
    "actor_name": "Juan camilo", // Solicitante
    "actor_role": "Administrador",
    "permission_id": 119,
    "module": "machinery",
    "submodule": "maintenance_request",
    "operation": "CREATE",
    "object_id": "41",
    "ip": null,
    "user_agent": "PostmanRuntime/7.48.0",
    "diff": {
      "changed": {},
      "created": {
        "priority": 16,
        "description": "Ruidos anómalos al encender; posible rodamiento.",
        "detected_at": "2025-09-26",
        "id_machinery": 1, // ID de maquinaria 
        "justification": null,
        "request_status": 10, // Estado de solicitud
        "maintenance_type": 14, // Tipo de mantenimiento
        "modification_date": "2025-09-29T04:58:05.051176+00:00",
        "registration_date": "2025-09-29T04:58:05.051160+00:00",
        "id_responsible_user": 1,
        "id_maintenance_request": 41
      },
      "removed": {}
    },
    "meta": {}
  },
  {
    "event_id": "ef0afabe-ba6b-4f0f-880c-c464b5aeb874",
    "ts": "2025-09-28T23:52:54-05:00",
    "actor_id": "1",
    "actor_name": "Juan camilo",
    "actor_role": "Administrador",
    "permission_id": 119,
    "module": "machinery",
    "submodule": "maintenance_request",
    "operation": "CREATE",
    "object_id": "40",
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
        "modification_date": "2025-09-29T04:52:54.749254+00:00",
        "registration_date": "2025-09-29T04:52:54.749230+00:00",
        "id_responsible_user": 1,
        "id_maintenance_request": 40
      },
      "removed": {}
    },
    "meta": {}
  },
  {
    "event_id": "4d6beaed-3f24-4614-8404-d05df97617b3",
    "ts": "2025-09-28T23:41:38-05:00",
    "actor_id": "1",
    "actor_name": "Juan camilo",
    "actor_role": "Administrador",
    "permission_id": 119,
    "module": "machinery",
    "submodule": "maintenance_request",
    "operation": "CREATE",
    "object_id": "39",
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
        "modification_date": "2025-09-29T04:41:38.502180+00:00",
        "registration_date": "2025-09-29T04:41:38.502156+00:00",
        "id_responsible_user": 1,
        "id_maintenance_request": 39
      },
      "removed": {}
    },
    "meta": {}
  },
  {
    "event_id": "fe782676-2551-4351-a1be-f61f2f42b5a1",
    "ts": "2025-09-28T23:24:11-05:00",
    "actor_id": "1",
    "actor_name": "Juan camilo",
    "actor_role": "Administrador",
    "permission_id": 119,
    "module": "maintenance",
    "submodule": "maintenance_request",
    "operation": "CREATE",
    "object_id": "38",
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
        "modification_date": "2025-09-29T04:24:11.336109+00:00",
        "registration_date": "2025-09-29T04:24:11.336075+00:00",
        "id_responsible_user": 1,
        "id_maintenance_request": 38
      },
      "removed": {}
    },
    "meta": {}
  },
  {
    "event_id": "bcb807bd-0bec-4860-a42d-ed749ed8c8fe",
    "ts": "2025-09-28T23:22:39-05:00",
    "actor_id": "1",
    "actor_name": "Juan camilo",
    "actor_role": "Administrador",
    "permission_id": 119,
    "module": "maintenance",
    "submodule": "maintenance_request",
    "operation": "CREATE",
    "object_id": "37",
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
        "maintenance_type": 15,
        "modification_date": "2025-09-29T04:22:39.340001+00:00",
        "registration_date": "2025-09-29T04:22:39.339966+00:00",
        "id_responsible_user": 1,
        "id_maintenance_request": 37
      },
      "removed": {}
    },
    "meta": {}
  },
  {
    "event_id": "f4ee8638-b7e9-4b9d-9dc1-afa6fddfa41b",
    "ts": "2025-09-28T23:20:22-05:00",
    "actor_id": "1",
    "actor_name": "Juan camilo",
    "actor_role": "Administrador",
    "permission_id": 119,
    "module": "maintenance",
    "submodule": "maintenance_request",
    "operation": "CREATE",
    "object_id": "",
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
        "maintenance_type": 15,
        "modification_date": "2025-09-29T04:20:22.801065+00:00",
        "registration_date": "2025-09-29T04:20:22.801046+00:00",
        "id_responsible_user": 1,
        "id_maintenance_request": 4
      },
      "removed": {}
    },
    "meta": {}
  }
]
