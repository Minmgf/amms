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
