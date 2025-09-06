# Estructura de pruebas de integración Selenium

Este directorio contiene la arquitectura para los flujos automatizables del sistema, listos para ser importados en los casos de prueba. Cada carpeta representa un flujo funcional del sistema, facilitando la organización y el desarrollo colaborativo de pruebas automatizadas.

## Estructura

- `flows/` - Flujos automatizables organizados por módulo y funcionalidad.
  - `auth/` - Flujos de autenticación (activation, completeRegister, editUser, login, passwordRecovery, preregister, recovery).
  - `dashboard/` - Flujos del dashboard (home, userManagement, userProfile).
  - `userManagement/` - Gestión de usuarios (auditLog, roleManagement [newRole, updateRole], userInformation).
  - `roleManagement/`, `userProfile/`, `auditLog/` - Flujos específicos.
  - `parameterization/` - Flujos de parametrización (managementBrandsModels, managementPositionsDepartments, parameterizationMeasure, parameterizationStatus, parameterizationView, stylesSystemAppearance).
  - `shared/` - Flujos y utilidades compartidas entre módulos.
- `chromedriver/` - Carpeta para el archivo `chromedriver.exe` necesario para la ejecución de pruebas con Selenium.

## Uso
- Los flujos pueden ser importados directamente en los casos de prueba.
- Los archivos `.gitkeep` permiten que las carpetas vacías se mantengan en el repositorio.
- Agrega los scripts y archivos de prueba en la carpeta correspondiente según el flujo funcional.

## Equipo
Esta estructura está pensada para facilitar la colaboración y el mantenimiento de las pruebas automatizadas. Si necesitas agregar nuevos flujos, sigue la organización propuesta.

## Preparación del entorno Python

Para preparar el entorno y trabajar con las pruebas automatizadas, sigue estos pasos:

### Requisitos previos
- Python 3.8 o superior instalado
- Google Chrome instalado
- Git para clonar el repositorio

### Configuración paso a paso

1. **Navegar a la carpeta tests:**
   ```powershell
   cd "ruta\al\proyecto\amms\tests"
   ```

2. **Crear entorno virtual (si no existe):**
   ```powershell
   python -m venv .venv
   ```

3. **Activar el entorno virtual:**
   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```
   
   > **Nota**: Si obtienes un error de política de ejecución en PowerShell, ejecuta:
   > ```powershell
   > Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   > ```

4. **Instalar dependencias:**
   ```powershell
   pip install -r requirements.txt
   ```

5. **Verificar instalación:**
   ```powershell
   pip list
   ```
   
   Deberías ver paquetes como: selenium, pytest, faker, python-dotenv

### Configuración de ChromeDriver

El ChromeDriver debie estar en la carpeta `chromedriver/driver.exe`. Si necesitas actualizarlo:

1. Descarga la versión compatible con tu Chrome desde [ChromeDriver](https://chromedriver.chromium.org/)
2. Reemplaza el archivo en `chromedriver/driver.exe`

### Probar la configuración

Ejecuta el flujo de login para verificar que todo funciona:

```powershell
python "flows\auth\login\login_flow.py"
```

Si todo está configurado correctamente, verás mensajes como:
- "Navegando a: http://localhost:3000/sigma/login"
- "Campo email encontrado..."
- "Login exitoso detectado..."

## Exclusiones recomendadas en .gitignore

Asegúrate de tener un archivo `.gitignore` en la raíz del proyecto con las siguientes exclusiones:

```
.venv/
__pycache__/
*.pyc
*.pyo
*.pyd
*.log
htmlcov/
.env
.DS_Store
Thumbs.db
chromedriver.exe
.vscode/
.idea/
```

Esto evitará subir archivos generados, binarios, configuraciones locales y el entorno virtual al repositorio.

## Exclusiones correctas para la carpeta tests

Si todo lo relacionado con Python y Selenium está dentro de la carpeta `tests`, las exclusiones en el `.gitignore` deben ser relativas a esa carpeta. Ejemplo:

```
/tests/.venv/
/tests/__pycache__/
/tests/**/*.pyc
/tests/**/*.pyo
/tests/**/*.pyd
/tests/**/*.log
/tests/htmlcov/
/tests/.env
/tests/.DS_Store
/tests/Thumbs.db
/tests/chromedriver/driver.exe
/tests/.vscode/
/tests/.idea/
```

Esto asegura que sólo los archivos y carpetas generados dentro de `tests` sean ignorados, manteniendo limpio el repositorio principal y permitiendo la colaboración en los scripts de automatización.

## Configuración de credenciales (.env)

Para ejecutar flujos que requieren autenticación, crea un archivo `.env` en la carpeta `tests` con las credenciales de prueba:

```bash
EMAIL=sigma.inmero@gmail.com
PASSWORD=Admin123456.
HEADLESS=False
```

> **Importante**: 
> - No incluyas comillas en los valores
> - Este archivo está en `.gitignore` por seguridad
> - Las credenciales son para el entorno de pruebas únicamente
> - `HEADLESS=True` ejecuta las pruebas sin interfaz gráfica (más rápido)
> - `HEADLESS=False` ejecuta con interfaz gráfica (para debugging)

## Comandos útiles para el equipo

### Activar entorno virtual
```powershell
.\.venv\Scripts\Activate.ps1
```

### Desactivar entorno virtual
```powershell
deactivate
```

### Ejecutar un flujo específico
```powershell
python "flows\auth\login\login_flow.py"
python "flows\userManagement\user_management_flow.py"
python "flows\roleManagement\role_management_flow.py"
```

### Ejecutar en modo headless (sin interfaz)
```powershell
# Cambiar HEADLESS=True en .env, luego ejecutar
python "flows\auth\login\login_flow.py"
```

### Ejecutar tests con pytest
```powershell
pytest flows/ -v
```

### Actualizar dependencias
```powershell
pip freeze > requirements.txt
```

## Solución de problemas comunes

### Error: "ModuleNotFoundError: No module named 'selenium'"
- Asegúrate de tener el entorno virtual activado
- Reinstala las dependencias: `pip install -r requirements.txt`

### Error: "selenium.common.exceptions.WebDriverException"
- Verifica que Chrome esté instalado
- Asegúrate de que `chromedriver/driver.exe` existe y es compatible con tu versión de Chrome

### Error: PowerShell execution policy
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### El servidor no está corriendo (localhost:3000)
- Asegúrate de que la aplicación web esté ejecutándose en el puerto 3000
- Verifica con: `Test-NetConnection -ComputerName "localhost" -Port 3000`

## Estructura de archivos generados (ignorados por Git)

```
tests/
├── .venv/              # Entorno virtual (ignorado)
├── __pycache__/        # Cache de Python (ignorado)
├── .env               # Credenciales (ignorado)
├── htmlcov/           # Reportes de cobertura (ignorado)
└── *.log              # Logs de ejecución (ignorados)
```
