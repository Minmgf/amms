# IT-GD-001: Registro completo de dispositivo y validación de integración con sistema de monitoreo

## Descripción

Prueba de integración que verifica el proceso integral de registro de un dispositivo GPS/CAN con todos sus parámetros de monitoreo, validando que queda correctamente habilitado para integración automática con el sistema de monitoreo cuando exista una solicitud activa asociada a la maquinaria.

## Historias de Usuario Cubiertas

- **HU-GD-001**: Registrar nuevo dispositivo
- **HU-MS-002**: Iniciar monitoreo de solicitud

## Información del Caso de Prueba

| Campo | Valor |
|-------|-------|
| **ID** | IT-GD-001 |
| **Título** | Registro completo de dispositivo y validación de integración con sistema de monitoreo |
| **Prioridad** | Alta |
| **Tipo** | Funcional |

## Precondiciones

- Usuario autenticado con permisos de registro de dispositivos
- Submódulo de Gestión de Dispositivos disponible
- Sistema de monitoreo operativo y accesible
- Base de datos limpia o con IMEI único no registrado previamente
- Conectividad con el servidor de telemetría
- Aplicación SIGMA corriendo en `http://localhost:3000/sigma`
- Credenciales configuradas en archivo `.env`

## Datos de Entrada

Los datos se generan automáticamente en cada ejecución:

- **Nombre del dispositivo**: `Dispositivo GPS Test {timestamp}` (único por ejecución)
- **IMEI**: 15 dígitos aleatorios generados con algoritmo de Luhn (único por ejecución)
- **Parámetros de monitoreo seleccionados** (mínimo 5):
  - Estado de Ignición
  - Velocidad Actual
  - Ubicación GPS
  - Nivel de Combustible
  - Temperatura del Motor

## Pasos del Test (Patrón AAA)

### Arrange (Preparación)
1. Generar datos únicos de prueba (nombre y IMEI aleatorios)
2. Configurar driver de Chrome
3. Realizar login en la aplicación

### Act (Acción)
1. Navegar al menú "Monitoreo"
2. Acceder al submódulo "Gestión de Dispositivos"
3. Hacer clic en botón "Nuevo Dispositivo"
4. Completar formulario:
   - Ingresar nombre del dispositivo
   - Ingresar IMEI de 15 dígitos
   - Seleccionar 5 parámetros de monitoreo
5. Presionar botón "Registrar"
6. **Prueba adicional**: Intentar registrar el mismo dispositivo nuevamente para validar manejo de duplicados

### Assert (Verificación)
1. Verificar mensaje de éxito "Dispositivo registrado exitosamente"
2. Confirmar que el dispositivo aparece en la lista
3. Verificar que el registro incluye:
   - Nombre del dispositivo
   - IMEI
   - Parámetros seleccionados
   - Fecha de registro
   - Usuario que registró
4. Validar que el sistema rechaza correctamente dispositivos duplicados
5. Confirmar registro en historial/auditoría del sistema

## Estructura de Archivos

```
IT-GD-001/
├── IT-GD-001.py              # Script principal de automatización
├── README_IT_GD_001.md       # Este archivo (documentación)
├── test_config.py            # Configuración del test (opcional)
├── screenshots/              # Capturas de pantalla de la ejecución
└── reports/                  # Reportes JSON generados
```

## Ejecución

### Requisitos Previos

1. Instalar dependencias:
   ```powershell
   pip install selenium python-dotenv
   ```

2. Configurar archivo `.env` en la raíz del proyecto con:
   ```
   EMAIL=tu_email@example.com
   PASSWORD=tu_password
   HEADLESS=False
   ```

3. Asegurarse de que ChromeDriver está en la carpeta `chromedriver/`

### Ejecutar el Test

```powershell
# Desde la carpeta IT-GD-001
python IT-GD-001.py

# O desde la raíz del proyecto
python IT-GD-001/IT-GD-001.py
```

## Resultados Esperados

### Registro Exitoso
- ✓ El dispositivo se registra exitosamente en la base de datos
- ✓ Se muestra mensaje de confirmación "Dispositivo registrado exitosamente"
- ✓ El registro incluye: nombre, IMEI, parámetros seleccionados, fecha de registro y usuario
- ✓ La acción queda registrada en el historial/auditoría del sistema
- ✓ El dispositivo queda habilitado para integración automática con el módulo de monitoreo
- ✓ Al recibir datos de telemetría con solicitud activa, el sistema inicia monitoreo automáticamente (según HU-MS-002)

### Validación de Duplicados
- ✓ El sistema previene el registro de dispositivos con IMEI duplicado
- ✓ Se muestra mensaje de error apropiado
- ✓ El formulario permanece abierto para corrección

## Características Especiales

### Generación de Datos Únicos
- Cada ejecución genera un **nombre de dispositivo único** con timestamp
- Cada ejecución genera un **IMEI único de 15 dígitos** usando el algoritmo de Luhn
- Esto evita conflictos con datos existentes en la base de datos

### Prueba de Duplicados
- Después del registro exitoso, el test intenta registrar el mismo dispositivo nuevamente
- Valida que el sistema rechace correctamente los datos duplicados
- Verifica mensajes de error y comportamiento del formulario

### Capturas de Pantalla
El test toma capturas automáticas en puntos clave:
- Login exitoso
- Modal de registro abierto
- Formulario completado
- Registro exitoso
- Intento de duplicado
- Estado final

### Reportes
Se genera un reporte JSON detallado con:
- Datos de prueba utilizados
- Resultado de cada paso
- Timestamps
- Resumen de éxito/fallo
- Tasa de éxito

## Selectores Utilizados

### Navegación
- **Menú Monitoreo**: `//a[@href='/sigma/monitoring']`
- **Gestión de Dispositivos**: `//a[@href='/sigma/monitoring/devicesManagement']`

### Modal de Registro
- **Botón Nuevo Dispositivo**: `//button[@aria-label='Add Device Button']`
- **Modal**: `//div[contains(@class, 'modal-theme')]`
- **Título Modal**: `//h2[contains(text(), 'Registro de Dispositivo')]`

### Formulario
- **Campo Nombre**: `//input[@name='deviceName']`
- **Campo IMEI**: `//input[@name='imei']`
- **Checkboxes Parámetros**: `//label[contains(., '{nombre_parametro}')]//input[@type='checkbox']`
- **Botón Registrar**: `//button[@type='submit' and contains(., 'Registrar')]`

## Manejo de Errores

El test incluye manejo robusto de errores:
- Timeouts configurables
- Screenshots automáticos en caso de error
- Logs detallados en consola
- Continuación de pasos para recopilar máxima información
- Cierre seguro del navegador

## Notas Técnicas

- Usa el flujo de login reutilizable de `flows/auth/login/selenium_login_flow.py`
- Implementa esperas explícitas con `WebDriverWait`
- Genera IMEIs válidos usando el algoritmo de Luhn
- Compatible con Windows PowerShell
- Soporta modo headless configurado en `.env`

## Autor

Automatización desarrollada para el sistema SIGMA - AMMS

## Fecha de Creación

2025-11-02
