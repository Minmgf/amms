# IT-CLI-001: Registro de clientes en módulo de solicitudes

## Descripción
Esta prueba verifica que el formulario de registro de clientes en el submódulo "Clientes" funcione correctamente mediante Selenium, validando la estructura del formulario con todos los campos requeridos, validación automática de duplicados tanto en el módulo de clientes como en el microservicio de usuarios, precarga de datos cuando existe usuario previo, validación de campos obligatorios y medios de contacto, y almacenamiento exitoso de la información del cliente en el sistema.

## Precondiciones
- El usuario recepcionista debe estar autenticado en el sistema con permisos para acceder al módulo de "Solicitudes"
- El submódulo "Clientes" debe estar disponible dentro del módulo "Solicitudes"
- La base de datos debe contener algunos clientes existentes para probar validación de duplicados
- Debe existir al menos un usuario en el microservicio de usuarios con número de identificación específico
- El API de facturación debe estar disponible para consulta de municipios/ciudades
- El sistema debe estar completamente desplegado con funcionalidades de validación implementadas
- Selenium WebDriver configurado con ChromeDriver

## Datos de Entrada

### Credenciales de acceso:
- Usuario: "recepcionista@sistema.com"
- Contraseña: "Recepcionist123!"

### Datos de cliente nuevo (caso exitoso):
- Tipo de identificación: "3" (Cédula ciudadanía)
- Número de identificación: "12345678"
- Dígito de verificación: "9"
- Tipo de persona: "2" (Persona Natural)
- Razón social: "Juan Carlos Pérez González"
- Nombre comercial: "JC Consultoría" (opcional)
- Nombre: "Juan Carlos"
- Apellido: "Pérez"
- Segundo Apellido: "González"
- Correo electrónico: "juan.perez@email.com"
- Número telefónico: "+57 3001234567"
- Dirección: "Calle 123 #45-67"
- Régimen tributario: "Responsable IVA"
- Municipio: "Bogotá D.C."

### Datos para validar duplicado de cliente:
- Número de identificación: "87654321" (ya existe como cliente)

### Datos para validar usuario existente:
- Número de identificación: "11223344" (existe como usuario pero no como cliente)

## Pasos del Test (AAA)

### Arrange (Preparar datos y entorno)
1. Inicializar Selenium WebDriver con Chrome
2. Navegar a la URL del sistema de login
3. Verificar que existen clientes y usuarios de prueba en las bases de datos
4. Preparar datos de validación para verificación de campos y mensajes

### Act (Ejecutar la función o método)

#### 1. Navegación al módulo y submódulo:
- Realizar login con credenciales de recepcionista
- Verificar acceso exitoso al dashboard
- Navegar al módulo "Solicitudes" desde el menú principal
- Verificar que se muestra el submódulo "Clientes" en la interfaz
- Hacer clic en el submódulo "Clientes"
- Verificar que aparece el botón "Añadir cliente" en la parte superior

#### 2. Validación de estructura del formulario:
- Hacer clic en el botón "Añadir cliente"
- Verificar que se abre el formulario de registro de clientes
- Validar que todos los campos requeridos están presentes: Tipo de identificación*, Número de identificación*, Tipo de persona*, Razón social*, Dirección*, Municipio o ciudad*
- Verificar que los campos opcionales están disponibles: Dígito de verificación, Nombre comercial
- Comprobar que los campos de información personal están presentes: Nombre, Apellido, Segundo Apellido
- Validar presencia de campos de contacto: Correo electrónico, Número telefónico
- Verificar selector parametrizable para "Régimen tributario"

#### 3. Prueba de validación de cliente duplicado:
- Seleccionar tipo de identificación "3" (Cédula ciudadanía)
- Ingresar número de identificación "87654321" (que ya existe como cliente)
- Verificar que el sistema valida automáticamente
- Comprobar que se muestra mensaje "el cliente ya está registrado"
- Verificar que no se permite continuar con la creación

#### 4. Prueba de usuario existente (no cliente):
- Limpiar el formulario
- Ingresar número de identificación "11223344" (existe como usuario)
- Verificar que aparece mensaje informando que "el cliente ya se encuentra registrado como usuario"
- Comprobar que los datos del usuario se precargan en el formulario
- Verificar que se permite completar los campos faltantes para asociar como cliente

#### 5. Registro exitoso de cliente nuevo:
- Limpiar formulario y comenzar nuevo registro
- Completar todos los campos con datos de prueba del cliente nuevo
- Verificar validación de formato de email en tiempo real
- Comprobar validación de longitud de número telefónico
- Seleccionar municipio desde el API de facturación
- Intentar guardar sin medio de contacto (debe fallar validación)
- Agregar email y/o teléfono y verificar que se permite guardar
- Hacer clic en "Guardar" y verificar registro exitoso

#### 6. Validación de control de permisos:
- Verificar que solo usuarios con permisos pueden acceder al formulario
- Comprobar que usuarios sin permisos reciben mensaje de acceso denegado

### Assert (Comparar resultado obtenido con el esperado)

#### Validaciones de navegación e interfaz:
- El módulo "Solicitudes" es accesible desde el menú principal
- El submódulo "Clientes" aparece correctamente dentro de Solicitudes
- El botón "Añadir cliente" está visible en la parte superior de la interfaz
- El formulario se abre correctamente al hacer clic en el botón

#### Validaciones de estructura del formulario:
- Todos los campos requeridos (*) están marcados visualmente como obligatorios
- Los selectores de tipo de documento y tipo de persona contienen las opciones correctas según las tablas de códigos
- El campo de email tiene validación de formato implementada
- El campo telefónico incluye prefijo internacional y validación de longitud
- El selector de municipio se conecta correctamente al API de facturación
- El selector de régimen tributario es parametrizable según configuración del sistema

#### Validaciones de lógica de negocio:
- La validación automática detecta clientes duplicados correctamente
- Se muestra mensaje apropiado cuando el cliente ya está registrado
- La detección de usuarios existentes funciona contra el microservicio
- Los datos del usuario se precargan automáticamente en el formulario
- Se permite asociar información de cliente a cuenta de usuario existente
- La validación requiere al menos un medio de contacto (email o teléfono)
- No se permiten números de identificación duplicados
- El registro se almacena correctamente y queda disponible para solicitudes futuras
- Solo usuarios con permisos asignados pueden acceder y usar el formulario

## Resultado Esperado

### Funcionalidad completa del submódulo de registro de clientes:

#### Navegación e interfaz:
- Acceso exitoso al módulo "Solicitudes" con submódulo "Clientes" visible
- Botón "Añadir cliente" ubicado en la parte superior de la interfaz
- Formulario estructurado con todos los campos requeridos y opcionales organizados lógicamente

#### Validaciones automáticas:
- Detección exitosa de clientes duplicados con mensaje "el cliente ya está registrado"
- Identificación correcta de usuarios existentes con mensaje informativo y precarga de datos
- Validación de formato de email en tiempo real
- Verificación de longitud para número telefónico con prefijo internacional
- Validación obligatoria de al menos un medio de contacto antes del guardado

#### Integraciones funcionales:
- Conexión exitosa con microservicio de usuarios para validación de duplicados
- Integración correcta con API de facturación para selección de municipios/ciudades
- Selector parametrizable de régimen tributario funcionando según configuración del sistema

#### Registro y almacenamiento:
- Almacenamiento exitoso de clientes nuevos con todos los datos completos
- Asociación correcta de información de cliente a cuentas de usuario existentes
- Cliente registrado queda disponible inmediatamente para solicitudes, cotizaciones y alquileres

#### Control de acceso:
- Solo usuarios con permisos asignados pueden acceder al formulario de registro
- Usuarios sin permisos reciben mensaje de acceso denegado apropiado
- Todas las operaciones de guardado requieren permisos válidos

#### Performance y usabilidad:
- Validaciones automáticas completadas en menos de 2 segundos
- Interfaz responsiva y navegación fluida entre campos del formulario
- Mensajes informativos claros y contextuales para cada validación
- Precarga automática de datos sin retrasos perceptibles

## Selectores Utilizados

- Botón solicitudes: `//a[@class='nav-item-theme flex justify-between items-center w-full p-2 rounded-theme-lg transition-colors nav-item-active']`
- Botón clientes: `//a[@class='nav-sub-item-theme p-2 rounded-theme-lg text-left flex items-center gap-3 transition-colors nav-sub-item-active']`
- Número identificación: `//input[@placeholder='Digite número de identificación']`
- Dígito verificación: `//input[@placeholder='DV']`
- Tipo de identificación: `//select[@name='identificationType']`
- Nombre comercial: `//input[@placeholder='Digite nombre comercial']`
- Tipo de persona: `//select[@name='personType']`
- Razón social: `//input[@placeholder='Digite razón social']`
- Nombres: `//input[@placeholder='Digite nombres']`
- Primer apellido: `//input[@placeholder='Primer apellido']`
- Segundo apellido: `//input[@placeholder='Segundo apellido']`
- Régimen tributario: `//select[@name='taxRegime']`
- Código número teléfono: `//select[@name='phoneCode']`
- Número telefónico: `//input[@placeholder='Digite número teléfonico']`
- Dirección: `//input[@placeholder='Digite dirección']`
- Correo electrónico: `//input[@placeholder='Digite correo electrónico']`
- Municipio: `//select[@name='region']`
- Botón cancelar: `//button[@aria-label='Cancel Button']`
- Botón guardar: `//button[@type='submit']`
- Botón agregar cliente: `//button[@class='parametrization-filter-button bg-black text-white hover:bg-gray-800']`

## Ejecución del Test

```bash
cd tests/IT-CLI-001
python IT-CLI-001.py
```

## Dependencias

- Python 3.7+
- Selenium WebDriver
- ChromeDriver
- Chrome Browser

## Archivos del Test

- `IT-CLI-001.py`: Script principal del test
- `README_IT_CLI_001.md`: Documentación del test
- `chromedriver.exe`: Driver de Chrome (debe estar presente)

## Notas de Implementación

- El test reutiliza el flujo de login de IT-SM-001.py
- Se incluyen validaciones robustas para manejar diferentes estados del sistema
- El test es independiente y puede ejecutarse de forma aislada
- Se incluye manejo de errores y logging detallado para debugging
- El test valida tanto casos exitosos como casos de error

