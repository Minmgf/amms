EndPoint para listar novedades

Enum para los filtros

    NEWS_TYPE_CHOICES = [
        ('CREACION_EMPLEADO', 'Creación de empleado'),
        ('ACTUALIZACION_EMPLEADO', 'Actualizar empleado'),
        ('DESACTIVACION_EMPLEADO', 'Desactivar empleado'),
        ('ACTIVACION_EMPLEADO', 'Activar empleado'),
        ('GENERAR_OTRO_SI', 'Generar otro si'),
        ('CAMBIO_CONTRATO', 'Cambio de contrato'),
        ('FINALIZACION_CONTRATO', 'Finalización de contrato'),
    ]


Permisos

INSERT INTO permission (id, name, description, category) 
VALUES (189, 'employee_news.list', 'listar novedades', 'Nomina');


El método es GET con el siguiente url:

http://localhost:8000/employee_news/list/


Respuesta esperada

{
    "message": "Novedades obtenidas exitosamente.",
    "data": [
        {
            "id_employee_new": 13,
            "news_date": "2025-11-22T14:30:55.589917Z",
            "author_name": "Juan Andres Veru Sarmiento",
            "news_type": "FINALIZACION_CONTRATO",
            "news_type_display": "Finalización de contrato",
            "observation": "Motivo: Finalizacion de contrato por tiempo, Contrato finalizado por t??rmino de per??odo de prueba",
            "employee_associated": "1079172267 - Juan pablo de la Cruz",
            "origin": "Automática"
        },
        {
            "id_employee_new": 12,
            "news_date": "2025-11-22T14:05:02.038846Z",
            "author_name": "Juan Andres Veru Sarmiento",
            "news_type": "GENERAR_OTRO_SI",
            "news_type_display": "Generar otro si",
            "observation": "Ingreso por contrataci??n directa",
            "employee_associated": "1079172267 - Juan pablo de la Cruz",
            "origin": "Automática"
        },
        {
            "id_employee_new": 11,
            "news_date": "2025-11-22T14:03:43.760427Z",
            "author_name": "Juan Andres Veru Sarmiento",
            "news_type": "CAMBIO_CONTRATO",
            "news_type_display": "Cambio de contrato",
            "observation": "Otro contrato por cambio de cargo",
            "employee_associated": "1079172267 - Juan pablo de la Cruz",
            "origin": "Automática"
        },
        {
            "id_employee_new": 10,
            "news_date": "2025-11-22T13:59:00.016782Z",
            "author_name": "Juan Andres Veru Sarmiento",
            "news_type": "ACTIVACION_EMPLEADO",
            "news_type_display": "Activar empleado",
            "observation": "Reactivacion",
            "employee_associated": "1079172267 - Juan pablo de la Cruz",
            "origin": "Automática"
        },
        {
            "id_employee_new": 9,
            "news_date": "2025-11-22T13:47:19.856403Z",
            "author_name": "Juan Andres Veru Sarmiento",
            "news_type": "DESACTIVACION_EMPLEADO",
            "news_type_display": "Desactivar empleado",
            "observation": "Motivo de la desactivaci??n",
            "employee_associated": "1079172267 - Juan pablo de la Cruz",
            "origin": "Automática"
        },
        {
            "id_employee_new": 8,
            "news_date": "2025-11-22T13:44:47.585076Z",
            "author_name": "Juan Andres Veru Sarmiento",
            "news_type": "CAMBIO_CONTRATO",
            "news_type_display": "Cambio de contrato",
            "observation": "Otro contrato por cambio de cargo",
            "employee_associated": "1079172267 - Juan pablo de la Cruz",
            "origin": "Automática"
        },
        {
            "id_employee_new": 7,
            "news_date": "2025-11-21T10:54:48.375266Z",
            "author_name": "Juan Andres Veru Sarmiento",
            "news_type": "ACTUALIZACION_EMPLEADO",
            "news_type_display": "Actualizar empleado",
            "observation": "Actualizaci??n de informaci??n del empleado2",
            "employee_associated": "1079172265 - Juan Andres Veru Sarmiento",
            "origin": "Automática"
        },
        {
            "id_employee_new": 6,
            "news_date": "2025-11-21T10:54:48.355393Z",
            "author_name": "Juan Andres Veru Sarmiento",
            "news_type": "ACTUALIZACION_EMPLEADO",
            "news_type_display": "Actualizar empleado",
            "observation": "Actualizaci??n de informaci??n del empleado2",
            "employee_associated": "1079172265 - Juan Andres Veru Sarmiento",
            "origin": "Automática"
        },
        {
            "id_employee_new": 5,
            "news_date": "2025-11-21T10:47:37.700542Z",
            "author_name": "Juan Andres Veru Sarmiento",
            "news_type": "ACTUALIZACION_EMPLEADO",
            "news_type_display": "Actualizar empleado",
            "observation": "Actualizaci??n de informaci??n del empleado",
            "employee_associated": "1079172265 - Juan Andres Veru Sarmiento",
            "origin": "Automática"
        },
        {
            "id_employee_new": 4,
            "news_date": "2025-11-21T10:47:37.632839Z",
            "author_name": "Juan Andres Veru Sarmiento",
            "news_type": "ACTUALIZACION_EMPLEADO",
            "news_type_display": "Actualizar empleado",
            "observation": "Actualizaci??n de informaci??n del empleado",
            "employee_associated": "1079172265 - Juan Andres Veru Sarmiento",
            "origin": "Automática"
        },
        {
            "id_employee_new": 3,
            "news_date": "2025-11-21T04:07:19.648570Z",
            "author_name": "Juan Andres Veru Sarmiento",
            "news_type": "CREACION_EMPLEADO",
            "news_type_display": "Creación de empleado",
            "observation": "Ingreso por contrataci??n directa",
            "employee_associated": "1079172267 - Juan pablo de la Cruz",
            "origin": "Automática"
        },
        {
            "id_employee_new": 2,
            "news_date": "2025-11-19T22:28:25.275985Z",
            "author_name": "Juan Andres Veru Sarmiento",
            "news_type": "CREACION_EMPLEADO",
            "news_type_display": "Creación de empleado",
            "observation": "Ingreso por contrataci??n directa",
            "employee_associated": "1079172264 - Juan peralta petro Sarmiento",
            "origin": "Automática"
        },
        {
            "id_employee_new": 1,
            "news_date": "2025-11-19T22:27:02.324451Z",
            "author_name": "Juan Andres Veru Sarmiento",
            "news_type": "CREACION_EMPLEADO",
            "news_type_display": "Creación de empleado",
            "observation": "Ingreso por contrataci??n directa",
            "employee_associated": "1079172265 - Juan Andres Veru Sarmiento",
            "origin": "Automática"
        }
    ]
}
