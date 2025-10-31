# Título
Confirmación de Solicitudes (IT-SOL-006)

# Descripción
Verificar que el sistema permita confirmar solicitudes en estado "Presolicitud" y que el flujo de confirmación (modal multipaso + confirmación final) funcione según la historia de usuario HU-SOL-006.

# Precondiciones
- El sistema debe estar ejecutándose en http://localhost:3000
- Existen solicitudes en la base de datos (al menos una en estado "Presolicitud")
- Chrome y ChromeDriver instalados y compatibles en el entorno donde se ejecuta la prueba
- Permisos de usuario para confirmar solicitudes

# Datos de Entrada
```json
{
  "credentials": {
    "email": "mock.user@example.com",
    "password": "mock-password-1234"
  },
  "urls": {
    "login": "http://localhost:3000/sigma/login",
    "requests": "http://localhost:3000/sigma/requests/requestsManagement"
  },
  "payload": {
    "requestDetails": "Test detalles solicitud",
    "amountPaid": 20000,
    "amountToBePaid": 50000,
    "currency": "COP",
    "scheduledStartDate": "2027-12-15",
    "endDate": "2027-12-16"
  }
}
```

# Pasos (AAA)

## Arrange
- Configurar Selenium WebDriver para Chrome
- Establecer timeouts y maximizar ventana
- Asegurar que las credenciales mock están configuradas en el test

## Act
1. Abrir la página de login y autenticarse con las credenciales mock
2. Navegar a la gestión de solicitudes
3. Buscar una solicitud en estado "Presolicitud" (ampliar paginado si es necesario)
4. Hacer hover sobre la fila y hacer click en "Confirmar"
5. Completar modal multipaso (detalles de solicitud, montos, fechas, moneda, maquinaria/operador si aplica)
6. Confirmar el formulario multipaso y, finalmente, hacer click en el confirm final

## Assert
- Verificar que el modal multipaso aparece y permite navegación por pasos
- Verificar que los campos obligatorios están presentes
- Verificar que la solicitud cambia su estado a "Pendiente" o que el sistema muestra el mensaje esperado

# Resultado Esperado
- El flujo de confirmación completa sin errores de validación (fechas/formato/montos) y la solicitud queda en estado "Pendiente".

# Resultado Obtenido
 ÉXITO: La prueba completó correctamente en ejecución local.

 Detalles:
 - Se realizó login en la UI (usando credenciales mock para el flujo de UI).
 - Se encontró una solicitud en estado "Presolicitud" después de ampliar el paginado.
 - Se abrió el modal multipaso y se navegó por los pasos requeridos.
 - Se rellenaron los campos de solicitud (detalles, montos, moneda) y se establecieron las fechas protegidas (se utilizó la fecha mínima forzada 2027-12-15 cuando fue necesario).
 - Se confirmó el formulario multipaso y se realizó la confirmación final.
 - Tras la confirmación, la UI reflejó el cambio de estado de la solicitud a "Pendiente".
 - No se detectaron hooks de captura de red ni modificación de tráfico.

# Estado / Fecha / Ejecutado Por
- Aprobado
- 2025-10-31T14:40:00
- Alejandro S.