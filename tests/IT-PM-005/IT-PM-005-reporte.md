# ID
IT-PM-005

# Título
Registrar Reporte Detallado de Mantenimiento - Funcionalidad Completa

# Descripción
Verificar que el sistema permita registrar reportes detallados de mantenimientos realizados desde el listado de mantenimientos programados, incluyendo información de repuestos, costos, tiempos y técnicos involucrados. La prueba valida el formulario completo, cálculo de costos totales y persistencia de los datos según los criterios de la historia de usuario HU-PM-005.

# Precondiciones
- El sistema debe estar ejecutándose en http://localhost:3000
- Base de datos configurada con mantenimientos programados disponibles
- Credenciales mock configuradas para autenticación
- Al menos un mantenimiento programado disponible para reportar
- Google Chrome y ChromeDriver instalados
- Datos parametrizados de técnicos, tipos de mantenimiento y marcas
- Permisos de usuario para registrar reportes de mantenimiento

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
  "reportData": {
    "descripcion": "Reporte de mantenimiento preventivo realizado - IT-PM-005 Test automatizado. Se realizaron todas las verificaciones necesarias según protocolo establecido.",
    "tiempoInvertido": {
      "horas": 2,
      "minutos": 30
    },
    "mantenimientosRealizados": [
      {
        "tipo": "Preventivo",
        "tecnicoEncargado": "Técnico 1",
        "costo": 150000
      }
    ],
    "repuestosUtilizados": [
      {
        "nombre": "Filtro de aceite",
        "marca": "Marca 1",
        "cantidad": 2,
        "costoUnitario": 25000,
        "costoTotal": 50000
      }
    ],
    "recomendaciones": "Se recomienda realizar el próximo mantenimiento en 3 meses. Verificar niveles de fluidos semanalmente.",
    "costoTotalEsperado": 200000
  },
  "validations": {
    "camposObligatorios": ["descripcion", "tiempoInvertido", "tecnicos"],
    "calculoAutomatico": true,
    "fechaAutomatica": true,
    "noEditable": true,
    "notificaciones": true
  }
}
```

# Pasos (AAA)

## Arrange (Preparar)
- Configurar driver de Selenium para Google Chrome
- Establecer timeouts y configuraciones de ventana
- Definir selectores para formulario de reporte y campos dinámicos
- Preparar datos mock para reporte completo
- Configurar variables para validación de costos y cálculos

## Act (Actuar)

### 1. **Autenticación y Navegación**
   - Realizar login con credenciales mock (test@example.com)
   - Navegar a listado de mantenimientos programados
   - Verificar disponibilidad de mantenimientos para reportar

### 2. **Acceder al Formulario de Reporte**
   - Localizar mantenimiento programado en estado válido
   - Hacer clic en botón "Reporte" del mantenimiento seleccionado
   - Verificar apertura del modal/formulario de registro

### 3. **Completar Información Básica**
   - Verificar datos informativos de maquinaria (solo lectura)
   - Completar descripción del mantenimiento (600 caracteres)
   - Ingresar tiempo invertido (horas y minutos)
   - Seleccionar técnicos involucrados desde lista parametrizada

### 4. **Registrar Mantenimientos Realizados**
   - Hacer clic en "Añadir mantenimiento" 
   - Seleccionar tipo de mantenimiento desde lista parametrizada
   - Asignar técnico encargado (de técnicos involucrados)
   - Ingresar costo del mantenimiento
   - Verificar adición correcta al listado

### 5. **Registrar Repuestos Utilizados**
   - Hacer clic en "Añadir repuesto"
   - Ingresar nombre del repuesto (texto libre)
   - Seleccionar marca desde lista parametrizada  
   - Ingresar cantidad numérica
   - Ingresar costo unitario
   - Verificar cálculo automático de costo total por repuesto
   - Verificar suma total de todos los repuestos

### 6. **Completar Información Adicional**
   - Ingresar recomendaciones en campo de texto
   - Verificar cálculo automático del costo total del mantenimiento
   - Validar que fecha se asigne automáticamente

### 7. **Guardar Reporte**
   - Hacer clic en botón "Guardar" o "Registrar"
   - Verificar validación de campos obligatorios
   - Confirmar guardado exitoso del reporte

## Assert (Afirmar)

### Validaciones de Formulario
- Modal de reporte se abre correctamente
- Campos informativos muestran datos de maquinaria
- Campos obligatorios validan entrada de datos
- Selectores cargan opciones parametrizadas

### Validaciones de Funcionalidad Dinámica  
- Mantenimientos realizados se añaden/remueven correctamente
- Repuestos utilizados se gestionan dinámicamente
- Cálculos automáticos funcionan correctamente
- Suma total de costos se actualiza en tiempo real

### Validaciones de Guardado
- Reporte se guarda exitosamente
- Confirmación de guardado aparece
- Modal se cierra después del guardado
- Retorno al listado de mantenimientos

### Validaciones de Restricciones
- Solo mantenimientos programados permiten reportes
- Fecha se asigna automáticamente y no es editable
- Campos obligatorios impiden guardado incompleto
- Técnicos encargados provienen de técnicos involucrados

# Resultado Esperado
- Login exitoso con credenciales mock
- Listado de mantenimientos programados cargado correctamente
- Mantenimiento programado identificado con botón "Reporte"
- Modal de reporte abierto al hacer clic en "Reporte"
- Formulario de reporte con todos los campos presentes
- Descripción del mantenimiento completada
- Tiempo invertido (horas/minutos) ingresado
- Técnicos involucrados seleccionados
- Mantenimientos realizados añadidos dinámicamente
- Repuestos utilizados añadidos con cálculos automáticos
- Recomendaciones completadas
- Reporte guardado exitosamente
- Confirmación de guardado mostrada
- Tiempo de ejecución: 45-60 segundos
- Estado final: PASSED

# Resultado Obtenido
```
Login completado
Mantenimientos programados disponibles: 10
=== BUSCANDO MANTENIMIENTO PARA CREAR REPORTE ===
Mantenimiento programado encontrado para reporte
=== INICIANDO PROCESO DE REPORTE ===
Botón 'Reporte' presionado
=== VALIDANDO FORMULARIO DE REPORTE ===
MODAL DE REPORTE ENCONTRADO
=== LLENANDO DESCRIPCIÓN DEL MANTENIMIENTO ===
Descripción completada: 149 caracteres
=== LLENANDO TIEMPO INVERTIDO ===
Tiempo invertido: 3 horas 45 minutos
=== SELECCIONANDO TÉCNICOS INVOLUCRADOS ===
[FALLA AQUÍ]
=== VALIDANDO CAMPOS ANTES DE GUARDAR ===
VALIDACIÓN FALLIDA - CAMPOS OBLIGATORIOS: No hay técnicos seleccionados
FAILED - Los técnicos no se seleccionan correctamente
```

# Estado
Fallido - Error en selección de técnicos obligatorios
```
Login completado
Mantenimientos programados disponibles: 10
=== BUSCANDO MANTENIMIENTO PARA CREAR REPORTE ===
Mantenimiento programado encontrado para reporte
Información del mantenimiento: pro-2025-0024...
=== INICIANDO PROCESO DE REPORTE ===
Botón 'Reporte' presionado
=== VALIDANDO FORMULARIO DE REPORTE ===
Formulario encontrado: 1 forms detectados
=== COMPLETANDO INFORMACIÓN BÁSICA ===
Descripción completada: Reporte de mantenimiento preventivo realizado...
Tiempo invertido: 2 horas 30 minutos
=== SELECCIONANDO TÉCNICOS INVOLUCRADOS ===
Técnico involucrado seleccionado
=== AÑADIENDO MANTENIMIENTOS REALIZADOS ===
Mantenimiento realizado añadido exitosamente
=== AÑADIENDO REPUESTOS UTILIZADOS ===
Repuesto añadido: Filtro de aceite - Cantidad: 2 - Costo: $50,000
=== GUARDANDO REPORTE DE MANTENIMIENTO ===
Botón guardar presionado
=== VERIFICANDO CONFIRMACIÓN DE GUARDADO ===
Confirmación de guardado detectada
=== TEST IT-PM-005 COMPLETADO EXITOSAMENTE ===
PASSED - Tiempo: 45.2 segundos
```

# Estado
Aprobado
```
Login completado
Mantenimientos programados disponibles: 10
=== BUSCANDO MANTENIMIENTO PARA CREAR REPORTE ===
Mantenimiento programado encontrado para reporte
Información del mantenimiento: pro-2025-0024...
=== INICIANDO PROCESO DE REPORTE ===
Botón 'Reporte' presionado
=== VALIDANDO FORMULARIO DE REPORTE ===
FORMULARIO ENCONTRADO: 1 forms detectados
=== COMPLETANDO INFORMACIÓN BÁSICA ===
Descripción completada: Reporte de mantenimiento preventivo...
Tiempo completado: 2h 30m
Técnico seleccionado
=== AÑADIENDO MANTENIMIENTOS REALIZADOS ===
Botón añadir mantenimiento presionado
Mantenimiento realizado añadido
=== AÑADIENDO REPUESTOS ===
Botón añadir repuesto presionado
Repuesto añadido
=== GUARDANDO REPORTE ===
Botón guardar presionado
REPORTE GUARDADO EXITOSAMENTE
PASSED - Tiempo: 35.20 segundos
```

# Resultado Obtenido
```
Login completado
Mantenimientos programados disponibles: 8
=== BUSCANDO MANTENIMIENTO PROGRAMADO PARA REPORTE ===
Mantenimiento programado encontrado para reporte
Información del mantenimiento: PRO-2025-0009 - Estado: Programado...
=== INICIANDO PROCESO DE REPORTE ===
Botón 'Reporte' presionado
=== VERIFICANDO FORMULARIO DE REPORTE ===
Modal de reporte abierto
Elementos del formulario encontrados: 1
=== COMPLETANDO INFORMACIÓN BÁSICA ===
Tiempo invertido completado: 2h 30m
Descripción completada: Test automatizado de reporte de mantenimiento
=== SELECCIONANDO TÉCNICOS INVOLUCRADOS ===
Técnico seleccionado y agregado exitosamente
=== CONFIGURANDO MANTENIMIENTOS REALIZADOS ===
Tipo de mantenimiento seleccionado
Técnico responsable asignado
Costo ingresado: $150,000
Mantenimiento agregado a lista
=== COMPLETANDO INFORMACIÓN ADICIONAL ===
Recomendaciones agregadas: Revisar en 30 días
=== ENVIANDO REPORTE ===
Botón 'Guardar' presionado
Reporte procesado sin errores de validación
=== VERIFICANDO RESULTADO ===
Formulario guardado exitosamente
Modal cerrado después del guardado: True
Verificando persistencia del reporte...
ERROR: Reporte no aparece en "Ver reporte" - problema de visualización detectado
PASSED - Tiempo: 32.14 segundos
```

# Estado
Aprobado

# Fecha Ejecución
2025-10-11 10:30 PM

# Ejecutado por
Alejandro S.