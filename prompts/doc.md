Requisitos

EndPoint para obtener contrato más reciente del empleado por id_empleado

Permisos

INSERT INTO permission (id, name, description, category) 
VALUES (181, 'employee.employee_contract_detail', 'Obtener contrato empleado', 'Nomina');


El método es GET con el siguiente url:

http://localhost:8000/employees/{id_employee}/latest_employee_contract/


Respuesta esperada

{
    "contract_code": "CON-2025-0001-00",
    "id_employee_charge": 1,
    "employee_charge_name": "Encargado de ventas",
    "description": "Contrato de prueba 2",
    "contract_type": 19,
    "contract_type_name": "contrato indefinido",
    "start_date": "2025-11-17",
    "end_date": null,
    "payment_frequency_type": "diario",
    "minimum_hours": 8,
    "workday_type": 22,
    "workday_type_name": "jornada completa",
    "work_mode_type": 25,
    "work_mode_type_name": "modalidad presencial",
    "salary_type": "Mensual fijo",
    "salary_base": 100000.0,
    "currency_type": 17,
    "currency_type_name": "Dollar",
    "trial_period_days": 30,
    "vacation_days": 15,
    "vacation_frequency_days": 360,
    "cumulative_vacation": true,
    "start_cumulative_vacation": "2025-11-28",
    "maximum_disability_days": 15,
    "overtime": 40.0,
    "overtime_period": "dia",
    "notice_period_days": 9,
    "contract_status": 28,
    "contract_status_name": "Creada",
    "contract_payments": [
        {
            "id_day_of_week": null,
            "day_of_week_name": null,
            "date_payment": null
        }
    ],
    "days_of_week": [
        {
            "id_day_of_week": 1,
            "name": "Lunes"
        },
        {
            "id_day_of_week": 3,
            "name": "Miercoles"
        },
        {
            "id_day_of_week": 4,
            "name": "Jueves"
        },
        {
            "id_day_of_week": 5,
            "name": "Viernes"
        }
    ],
    "employee_contract_deductions": [
        {
            "deduction_type": 29,
            "deduction_type_name": "deduccion de embargos",
            "amount_type": "fijo",
            "amount_value": 10000.0,
            "application_deduction_type": "SalarioBase",
            "start_date_deduction": "2025-11-18",
            "end_date_deductions": "2025-11-27",
            "description": "deduccion 1",
            "amount": 1.0
        },
        {
            "deduction_type": 30,
            "deduction_type_name": "deduccion de seguridad social",
            "amount_type": "Porcentaje",
            "amount_value": 90.0,
            "application_deduction_type": "SalarioBase",
            "start_date_deduction": "2025-11-17",
            "end_date_deductions": "2025-11-23",
            "description": "deduccion 1",
            "amount": null
        }
    ],
    "employee_contract_increases": [
        {
            "increase_type": 31,
            "increase_type_name": "incremento por antig??edad",
            "amount_type": "Porcentaje",
            "amount_value": 100.0,
            "application_increase_type": "SalarioBase",
            "start_date_increase": "2025-11-18",
            "end_date_increase": "2025-11-30",
            "description": "aumento 1",
            "amount": null
        },
        {
            "increase_type": 32,
            "increase_type_name": "incremento por desempe??o",
            "amount_type": "fijo",
            "amount_value": 100000.0,
            "application_increase_type": "SalarioFinal",
            "start_date_increase": "2025-11-17",
            "end_date_increase": "2025-11-24",
            "description": "aumento 2",
            "amount": 1.0
        }
    ]
}


Listar unidades de moneda para el currency_type (GET) *PARA FRONTEND*

http://localhost:8000/units/active/10/


Listar tipos de contratos para contract_type (GET) *PARA FRONTEND*

http://localhost:8000/types/list/active/15/


Listar tipos de jornada laboral para workday_type (GET) *PARA FRONTEND*

http://localhost:8000/types/list/active/16/


Listar tipos de modalidad de trabajo para work_mode_type (GET) *PARA FRONTEND*

http://localhost:8000/types/list/active/17/


Listar tipos de deducción para deduction_type (GET) *PARA FRONTEND*

http://localhost:8000/types/list/active/18/


Listar tipos de incrementos para increase_type (GET) *PARA FRONTEND*

http://localhost:8000/types/list/active/19/


Listar departamentos (GET) *PARA FRONTEND*

http://localhost:8000/employee_departments/list/active/


Listar cargos para id_employee_charge (GET) *PARA FRONTEND*

http://localhost:8000/employee_charges/list/active/1/


Listar los días de la semana days_of_week (GET) *PARA FRONTEND*

http://localhost:8000/days_of_week/


En la base de datos de maquinaria en la tabla days_of_week, este es el insert:

INSERT INTO days_of_week(id_day_of_week, name)
VALUES (1, 'Lunes'), (2, 'Martes'), (3, 'Miercoles'), (4, 'Jueves'), (5, 'Viernes'), (6, 'Sabado'), (7, 'Domingo');


Para el enum de payment_frequency_type las opciones son:

    PAYMENT_FREQUENCY_CHOICES = [
        ('diario', 'Diario'),
        ('semanal', 'Semanal'),
        ('quincenal', 'Quincenal'),
        ('mensual', 'Mensual'),
    ]


Para el enum de salary_type las opciones son:

    SALARY_TYPE_CHOICES = [
        ('Por horas', 'Por horas'),
        ('Por días', 'Por días'),
        ('Mensual fijo', 'Mensual fijo'),
    ]


Para el enum de overtime_period las opciones son:

    OVERTIME_PERIOD_CHOICES = [
        ('dia', 'Día'),
        ('semana', 'Semana'),
        ('mes', 'Mes'),
    ]


Para el enum de amount_type las opciones son:

    AMOUNT_TYPE_CHOICES = [
        ('Porcentaje', 'Porcentaje'),
        ('fijo', 'Fijo'),
    ] 


Para el enum de overtime_period las opciones son:

    OVERTIME_PERIOD_CHOICES = [
        ('dia', 'Día'),
        ('semana', 'Semana'),
        ('mes', 'Mes'),
    ]


Para el enum de application_deduction_type y application_increase_type las opciones son:

    APPLICATION_CHOICES = [
        ('SalarioBase', 'Salario Base'),
        ('SalarioFinal', 'Salario Final'),
        ('SalarioPorHora', 'Salario Por Hora'),
    ]


Permisos usados en el endpoint

INSERT INTO permission (id, name, description, category) 
VALUES (187, 'employee.create_secundary_petition', 'Gerenar Otro Si', 'Nomina');


ENDPOINT PRINCIPAL

El método es POST con el siguiente url:

http://localhost:8000/employees/{id_employee}/generate-otro-si/


JSON CAMBIAR CONTRATO

{

  "observation": "Ingreso por contratación directa",
  "id_employee_charge": 1,
  "contract": [
    {
      "description": "Contrato de prueba 2",
      "contract_type": 19,
      "end_date": null,
      "payment_frequency_type": "diario",
      "minimum_hours": 8,
      "workday_type": 22,
      "work_mode_type": 25,
      "salary_type": "Mensual fijo",
      "salary_base": 100000,
      "currency_type": 17,
      "trial_period_days": 30,
      "vacation_days": 15,
      "vacation_frequency_days": 360,
      "cumulative_vacation": true,
      "start_cumulative_vacation": "2025-11-28",
      "maximum_disability_days": 15,
      "overtime": 40,
      "overtime_period": "dia",
      "notice_period_days": 9,
      "days_of_week": [ 1, 3, 4, 5],
      "contract_payments": [
        {
          "id_day_of_week": null,
          "date_payment": null
        }
      ],
      "established_deductions": [
        {
          "deduction_type": 29,
          "amount_type": "fijo",
          "amount_value": 10000,
          "application_deduction_type": "SalarioBase",
          "start_date_deduction": "2025-11-18",
          "end_date_deductions": "2025-11-27",
          "description": "deduccion 1",
          "amount": 1
        },
        {
          "deduction_type": 30,
          "amount_type": "Porcentaje",
          "amount_value": 90,
          "application_deduction_type": "SalarioBase",
          "start_date_deduction": "2025-11-17",
          "end_date_deductions": "2025-11-23",
          "description": "deduccion 1",
          "amount": null
        }
      ],
      "established_increases": [
        {
          "increase_type": 31,
          "amount_type": "Porcentaje",
          "amount_value": 100,
          "application_increase_type": "SalarioBase",
          "start_date_increase": "2025-11-18",
          "end_date_increase": "2025-11-30",
          "description": "aumento 1",
          "amount": null
        },
        {
          "increase_type": 32,
          "amount_type": "fijo",
          "amount_value": 100000,
          "application_increase_type": "SalarioFinal",
          "start_date_increase": "2025-11-17",
          "end_date_increase": "2025-11-24",
          "description": "aumento 2",
          "amount": 1
        }
      ]
    }
  ]
}


Validaciones

{
    "success": false,
    "message": "No se puede generar un Otro Si para un empleado inactivo."
}


{
    "success": false,
    "message": "Error al crear el contrato",
    "errors": {
        "contract_type": [
            "El tipo de contrato no es válido." # debe pertenecer a la catergoria de tipos con id 15
        ],     
        "end_date": [
            "La fecha de fin debe ser posterior a la fecha de inicio."
        ],
        "minimum_hours": [
            "Las horas mínimas no pueden ser negativas."
        ],
        "workday_type": [
            "El tipo de jornada no es válido." # debe pertenecer a la catergoria de tipos con id 16
        ],
        "work_mode_type": [
            "El modo de trabajo no es válido." # debe pertenecer a la catergoria de tipos con id 17
        ],
        "salary_base": [
            "El salario base no puede ser negativo."
        ],
        "currency_type": [
            "El tipo de moneda no es válido." # debe pertenecer a la catergoria de unidades con id 10
        ],
        "trial_period_days": [
            "El período de prueba no puede ser negativo."
        ],
        "vacation_days": [
            "Los días de vacaciones no pueden ser negativos."
        ],
        "vacation_frequency_days": [
            "La frecuencia de vacaciones no puede ser negativa."
        ],
        "start_cumulative_vacation": [
            "Este campo es obligatorio cuando las vacaciones son acumulativas."
        ],
        "start_cumulative_vacation": [
            "La fecha de inicio de acumulación no puede ser posterior a la fecha de finalización del contrato (2025-11-30)."
        ],
        "maximum_disability_days": [
            "Los días máximos de incapacidad no pueden ser negativos."
        ],
        "overtime": [
            "El valor de horas extras no puede ser negativo."
        ],
        "notice_period_days": [
            "El período de preaviso no puede ser negativo."
        ],
        "contract_payments": [
            "Debe existir exactamente 1 registro de pago para frecuencia diaria, semanal o mensual." # solo un registro de contract_payments
        ],
        "days_of_week": [
            "No se permiten días duplicados."
        ],
        "contract_payments": [
            {
                "date_payment": [
                    "Ensure this value is greater than or equal to 1."
                ],
                "date_payment": [
                    "Ensure this value is less than or equal to 31."
                ]
            }
        ],
        "contract_payments": [
            "Para pago diario, no se deben especificar fecha de pago ni día de la semana."
        ],
        "contract_payments": [
            "Para pago quincenal deben existir exactamente 2 registros de pago." # deben haber solo 2 registros de contract_payments
        ],
        "contract_payments": [
            "Para pago quincenal, id_day_of_week debe ser nulo en ambos registros."
        ],
        "contract_payments": [
            "Para pago quincenal, los dos date_payment deben ser distintos."
        ],
        "contract_payments": [
            "Para pago quincenal, un date_payment debe estar entre 1-15 y el otro entre 16-31."
        ],
        "contract_payments": [
            "Para pago quincenal, la diferencia entre ambos date_payment debe ser de al menos 15 días."
        ],
        "contract_payments": [
            "Para pago semanal, se debe especificar el día de la semana (id_day_of_week)."
        ],
        "contract_payments": [
            "Para pago semanal, no se debe especificar fecha de pago."
        ],
        "contract_payments": [
            "Para pago mensual, no se debe especificar día de la semana."
        ],
        "contract_payments": [
            "Para pago mensual, la fecha de pago debe estar entre 1 y 31."
        ],
        "established_deductions": [
            "No puede haber dos deducciones con el mismo tipo: 29."
        ],
        "established_deductions": [
            {
                "deduction_type": [
                    "El tipo de deducción especificado no existe." # debe pertenecer a la catergoria de tipos con id 18
                ],
                "amount_value": [
                    "Ensure this value is greater than or equal to 0."
                ],
                "amount_value": [
                    "El valor no puede ser mayor a 100 cuando el tipo es porcentaje."
                ],
                "start_date_deduction": [
                    "La fecha de inicio de la deducción no puede ser anterior a la fecha de inicio del contrato (2025-11-17)."
                ],
                "start_date_deduction": [
                    "La fecha de inicio de la deducción no puede ser posterior a la fecha de finalización del contrato (2025-11-30)."
                ],
                "end_date_deductions": [
                    "La fecha de fin debe ser posterior a la fecha de inicio."
                ],
                "end_date_deductions": [
                    "La fecha de fin de la deducción no puede ser posterior a la fecha de finalización del contrato (2025-11-30)."
                ],
                "amount": [
                    "Ensure this value is greater than or equal to 0."
                ]
            }
        ],
        "established_increases": [
            "No puede haber dos incrementos con el mismo tipo: 31."
        ],
        "established_increases": [
            {
                "increase_type": [
                    "El tipo de incremento especificado no existe." # debe pertenecer a la catergoria de tipos con id 19
                ],
                "amount_value": [
                    "Ensure this value is greater than or equal to 0."
                ],
                "amount_value": [
                    "El valor no puede ser mayor a 100 cuando el tipo es porcentaje."
                ],
                "start_date_increase": [
                    "La fecha de inicio del incremento no puede ser anterior a la fecha de inicio del contrato (2025-11-17)."
                ],
                "start_date_increase": [
                    "La fecha de inicio del incremento no puede ser posterior a la fecha de finalización del contrato (2025-11-30)."
                ],
                "end_date_increase": [
                    "La fecha de fin debe ser posterior a la fecha de inicio."
                ],
                "end_date_increase": [
                    "La fecha de fin del incremento no puede ser posterior a la fecha de finalización del contrato (2025-11-30)."
                ],
                "amount": [
                    "Ensure this value is greater than or equal to 0."
                ]
            }
        ]
    }
}


Campos obligatorios

{
    "success": false,
    "message": "Error al crear el contrato",
    "errors": {
        "observation": [
            "This field is required."
        ],
        "id_employee_charge": [
            "This field is required."
        ],
        "contract_type": [
            "This field is required."
        ],
        "payment_frequency_type": [
            "This field is required."
        ],
        "salary_type": [
            "This field is required."
        ],
        "salary_base": [
            "This field is required."
        ],
        "currency_type": [
            "This field is required."
        ],
        "vacation_days": [
            "This field is required."
        ],
        "cumulative_vacation": [
            "This field is required."
        ],
        "maximum_disability_days": [
            "This field is required."
        ],
        "overtime": [
            "This field is required."
        ],
        "established_deductions": [ # established_deductions son opcionales, pero si se ingresa los siguientes campos son obligatorio
            {
                "deduction_type": [
                    "This field is required."
                ],
                "amount_type": [
                    "This field is required."
                ],
                "amount_value": [
                    "This field is required."
                ],
                "application_deduction_type": [
                    "This field is required."
                ]
            }
        ],
        "established_increases": [ # established_increases son opcionales, pero si se ingresa los siguientes campos son obligatorio
            {
                "increase_type": [
                    "This field is required."
                ],
                "amount_type": [
                    "This field is required."
                ],
                "amount_value": [
                    "This field is required."
                ],
                "application_increase_type": [
                    "This field is required."
                ]
            }
        ]
    }
}


Cantidad caracteres

El dato “max_length ” representa la cantidad máxima de caracteres de los atributos, y "validators" representa los rangos del valor

description = models.CharField(max_length=100, null=True, blank=True, db_column="description") # del contrato
description = models.CharField(max_length=255, null=True, blank=True, db_column="description") # de una deduccion
description = models.CharField(max_length=255, null=True, blank=True, db_column="description") # de un incremento
date_payment = models.IntegerField(db_column="date_payment", null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(31)])
observation = models.CharField(max_length=255, null=True, blank=True)
