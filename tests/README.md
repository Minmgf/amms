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

1. **Crear entorno virtual (opcional si ya existe):**
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
2. **Instalar dependencias:**
   ```powershell
   pip install -r requirements.txt
   ```

Esto instalará todos los paquetes necesarios para ejecutar las pruebas (Selenium, Pytest, etc.) definidos en `requirements.txt`.

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
/tests/chromedriver.exe
/tests/.vscode/
/tests/.idea/
```

Esto asegura que sólo los archivos y carpetas generados dentro de `tests` sean ignorados, manteniendo limpio el repositorio principal y permitiendo la colaboración en los scripts de automatización.
