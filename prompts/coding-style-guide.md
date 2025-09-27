# Guía de Estilo y Arquitectura del Proyecto

## 1. Visión General y Principios

El objetivo de esta guía es establecer un conjunto de reglas y buenas prácticas para mantener el código base limpio, consistente y fácil de mantener.

-   **Consistencia sobre preferencia:** Sigue los patrones establecidos en el proyecto aunque no coincidan con tu preferencia personal.
-   **No te repitas (DRY - Don't Repeat Yourself):** Centraliza y reutiliza la lógica siempre que sea posible.
-   **Simplicidad:** Prefiere soluciones claras y sencillas sobre las complejas.

---

## 2. Estructura de Carpetas

La estructura del proyecto está organizada por funcionalidad. Es crucial mantener este orden.

-   `src/app/`: Contiene las páginas y rutas de la aplicación, siguiendo las convenciones de Next.js App Router.
    -   `(auth)/`: Rutas y páginas relacionadas con la autenticación (login, registro, etc.).
    -   `(dashboard)/`: Rutas y páginas del panel principal de la aplicación.
-   `src/components/`: Componentes de React.
    -   `shared/`: Componentes genéricos y reutilizables en toda la aplicación (botones, modales, tablas).
    -   `[feature]/`: Componentes específicos de una funcionalidad (ej. `machinery/`, `userManagement/`).
-   `src/contexts/`: React Contexts para el manejo de estado global (ej. `PermissionsContext.js`).
-   `src/hooks/`: Hooks personalizados para encapsular lógica reutilizable (ej. `useAuth.js`).
-   `src/services/`: Funciones para comunicarse con la API backend.
-   `src/lib/`: Configuraciones de librerías de terceros (ej. `axios.js`).
-   `src/styles/`: Archivos de estilos globales.
-   `public/`: Archivos estáticos como imágenes y fuentes.

---

## 3. Convenciones de Nomenclatura

-   **Archivos de Componentes:** `PascalCase.jsx` (ej. `UserInfoModal.jsx`).
-   **Otros archivos JS (.js, .jsx):** `camelCase.js` (ej. `authService.js`, `useAuth.js`).
-   **Variables y Funciones:** `camelCase` (ej. `const userList`, `function getUser()`).
-   **Constantes:** `UPPER_SNAKE_CASE` si son constantes globales hardcodeadas (ej. `const API_URL = '...'`).

---

## 4. Componentes (React)

-   **Componentes Funcionales:** Todos los componentes deben ser funciones.
-   **Pequeños y Enfocados:** Un componente debe tener una única responsabilidad. Si un componente se vuelve muy grande o complejo, divídelo en componentes más pequeños.
-   **Props:** Desestructura las props al inicio del componente.
    ```jsx
    // Correcto
    const UserCard = ({ userName, userRole }) => {
      // ...
    };

    // Incorrecto
    const UserCard = (props) => {
      const { userName, userRole } = props;
      // ...
    };
    ```
-   **Importaciones:** Usa siempre los alias de ruta configurados en `jsconfig.json`.
    ```jsx
    // Correcto
    import { Button } from '@/components/shared/buttons/Button';

    // Incorrecto
    import { Button } from '../../shared/buttons/Button';
    ```

-   **Componentes Reutilizables:** Antes de crear un componente nuevo, revisa siempre la carpeta `src/components/shared`. Contiene elementos de UI genéricos (botones, modales, tablas, etc.) que deben ser utilizados para mantener la consistencia visual y funcional en toda la aplicación.
    -   **Notificaciones y Alertas:** Para mostrar mensajes de éxito o error al usuario, utiliza siempre los modales `SuccessModal` y `ErrorModal` que se encuentran en `@/app/components/shared/SuccessErrorModal`.
---

## 5. Estilos y Temas

-   **Tailwind CSS:** Utiliza las clases de utilidad de Tailwind CSS directamente en el atributo `className`. Evita usar valores arbitrarios (ej. `top-[13px]`).
-   **Sistema de Temas:** Todos los componentes deben ser compatibles con el sistema de temas del proyecto. Utiliza las variables CSS definidas en `src/styles/theme.css` para colores, fuentes y otros aspectos visuales para asegurar que los componentes se adapten correctamente al tema activo.

---

## 6. Manejo de Estado

-   **Estado Local:** Usa el hook `useState` para el estado que solo afecta a un componente.
-   **Estado Global:** Usa `useContext` para el estado que necesita ser compartido por múltiples componentes (ej. datos de usuario autenticado, tema de la aplicación). El `PermissionsContext` es el lugar central para gestionar los permisos y roles del usuario.

---

## 7. Peticiones a la API (Services)

-   **Toda la lógica de API debe estar en `src/services/`**. Los componentes no deben hacer llamadas a `axios` directamente.
-   Cada archivo de servicio debe agrupar funciones relacionadas con un recurso de la API (ej. `authService.js`, `machineryService.js`).
-   Usa la instancia de `axios` preconfigurada en `src/lib/axios.js`. Esto asegura que todas las peticiones usen la misma URL base y configuración (como los interceptores de autenticación).
-   Las funciones de servicio deben ser `async/await` y, por lo general, solo deben retornar la propiedad `data` de la respuesta de axios. El manejo de errores debe ocurrir donde se llama a la función (en la página o componente).

    ```javascript
    // En authService.js
    import { apiUsers } from "@/lib/axios";

    export const login = async (credentials) => {
        const { data } = await apiUsers.post("/auth/login/", credentials);
        return data;
    };
    ```

-   **Mejora recomendada (centralizar manejo de token):** La lógica para obtener, guardar y eliminar el token de autenticación está duplicada en varios lugares (`authService.js`, `useAuth.js`, `login/page.jsx`). Esto debería centralizarse en un único lugar.
    -   **Propuesta:** Crear un módulo `tokenManager.js` que se encargue de interactuar con `Cookies`, `localStorage` y `sessionStorage`. Los servicios y hooks usarían este módulo.

-   **Manejo de Errores:** Todas las llamadas a la API que puedan fallar deben estar envueltas en un bloque `try...catch`. Cuando ocurra un error que deba ser comunicado al usuario, utiliza el componente `ErrorModal` para mostrar un mensaje claro y consistente.

    ```jsx
    // En un componente o página
    const handleAction = async () => {
      try {
        await someApiService();
        // Mostrar modal de éxito si es necesario
      } catch (error) {
        // Usa el estado para abrir el ErrorModal con un mensaje apropiado
        setErrorMessage("Ocurrió un error al realizar la acción.");
        setErrorModalOpen(true);
      }
    };
    ```

---

## 8. Hooks Personalizados (`use...`)

-   Encapsula lógica compleja o reutilizable en hooks personalizados. Por ejemplo, `useAuth` es el lugar correcto para centralizar la lógica de `isAuthenticated`, `logout`, etc.
-   **Mejora recomendada (`useAuth`):** El hook `useAuth` debe ser la única fuente de verdad sobre el estado de autenticación. Lógica como la decodificación del token o la comprobación de expiración que se encuentra en la página de login debería moverse a este hook o a un helper para ser reutilizada.

---

## 9. Funciones de Utilidad (Utils)

-   Crea una carpeta `src/utils` para centralizar funciones puras y reutilizables que no son específicas de un componente o servicio.
-   **Agrupa por dominio:** Organiza las utilidades en archivos según su funcionalidad.
    -   `dateUtils.js`: Para formatear fechas y horas (ej. `formatDate(date)`).
    -   `validationUtils.js`: Para lógicas de validación complejas (ej. `isValidEmail(email)`).
    -   `stringUtils.js`: Para manipulación de strings (ej. `capitalize(text)`).
-   **Evita la duplicación:** Antes de crear una nueva función de utilidad, verifica si ya existe una que haga lo mismo o algo similar.

    ```javascript
    // src/utils/dateUtils.js
    export const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };
    ```

---

## 10. Formularios

-   Usa la librería `react-hook-form` para todos los formularios.
-   Define las reglas de validación en el objeto que se pasa a la función `register`.

---

## 11. Código Limpio

-   **Elimina código no utilizado:** Antes de hacer commit, elimina `console.log`, comentarios de código antiguo y variables no utilizadas.
-   **Comentarios:** Escribe comentarios solo para explicar lógica de negocio compleja o algoritmos que no son evidentes a simple vista. No comentes lo obvio.
-   **ESLint:** Asegúrate de que no haya errores de linting antes de subir tu código. `eslint-config-next` ya provee una buena base de reglas.

---

## 12. Reglas Generales de Desarrollo

-   **Idioma:** Todos los textos visibles para el usuario en la interfaz (labels, botones, mensajes de error, etc.) deben estar en **español**.
-   **Accesibilidad y Pruebas:** Todo elemento interactivo (botones, enlaces, inputs, etc.) debe tener un atributo `aria-label` descriptivo. Esto es fundamental para la accesibilidad y facilita la creación de pruebas automatizadas.
-   **Dependencias Externas:** No se deben agregar nuevas librerías o paquetes (`npm install`) sin consultarlo previamente y obtener la aprobación del líder técnico. Esto previene la inclusión de dependencias innecesarias o conflictivas.
-   **Parametrización:** Antes de escribir valores fijos en el código (conocido como "hardcodear"), siempre pregúntate si esos valores podrían cambiar en el futuro. La mayoría de las opciones en este sistema son parametrizables. En lugar de valores fijos, usa props o consume los datos desde un servicio. Si tienes dudas, consulta el código existente o pregunta directamente antes de continuar.

---

## 13. Flujo de Trabajo con Git

-   **Nomenclatura de Ramas:** Para mantener un historial claro, las ramas deben seguir la siguiente convención:
    -   **Nuevas funcionalidades:** `feature/descripcion-corta-de-la-funcionalidad` (ej. `feature/login-con-google`)
    -   **Corrección de errores:** `fix/descripcion-corta-del-bug` (ej. `fix/error-en-formulario-de-registro`)
    -   **Mejoras o refactorización:** `chore/descripcion-corta` (ej. `chore/refactor-servicio-de-usuarios`)

-   **Pull Requests (PRs):**
    1.  Cuando tu trabajo en una rama esté completo, sube los cambios al repositorio.
    2.  Crea un Pull Request (PR) dirigido a la rama principal (`main` o `develop`).
    3.  En la descripción del PR, explica qué cambios hiciste y por qué.
    4.  Asigna el PR a uno o más compañeros para su revisión.
    5.  Una vez aprobado, el PR podrá ser fusionado a la rama principal.
----
Analiza bien el proyecto, para que tengas el contexto necesario antes de actuar además de pensar en un plan que puedas ir siguiendo.