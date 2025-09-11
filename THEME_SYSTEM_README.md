# 🎨 Sistema de Temas Global - AMMS

## 📋 Índice
- [Descripción General](#descripción-general)
- [Instalación y Configuración](#instalación-y-configuración)
- [Guía de Estilos](#guía-de-estilos)
- [Clases CSS Disponibles](#clases-css-disponibles)
- [Variables CSS](#variables-css)
- [Componentes de Ejemplo](#componentes-de-ejemplo)
- [Mejores Prácticas](#mejores-prácticas)
- [Troubleshooting](#troubleshooting)

## 🌟 Descripción General

El sistema de temas global de AMMS permite cambiar dinámicamente los colores, tipografías y espaciados de toda la aplicación desde un punto central. Los desarrolladores deben usar clases CSS predefinidas y variables CSS en lugar de clases hardcodeadas de Tailwind.

### ❌ NO hacer:
```jsx
<div className="bg-white border border-gray-200 text-gray-800 p-6 rounded-lg">
  <h3 className="text-lg font-semibold text-gray-900">Título</h3>
  <p className="text-gray-600">Descripción</p>
  <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
    Botón
  </button>
</div>
```

### ✅ SÍ hacer:
```jsx
<div className="card-theme">
  <h3 className="text-lg font-semibold text-primary">Título</h3>
  <p className="text-secondary">Descripción</p>
  <button className="btn-theme btn-primary">
    Botón
  </button>
</div>
```

## 🚀 Instalación y Configuración

### 1. Importar el contexto de tema
```jsx
import { useTheme } from '@/contexts/ThemeContext';
```

### 2. Usar el hook en componentes que necesiten acceso directo al tema
```jsx
const { currentTheme, applyTheme, availableThemes } = useTheme();
```

### 3. Importar estilos globales (ya configurado en layout.jsx)
```jsx
import '@/styles/theme.css';
```

## 🎨 Guía de Estilos

### Colores de Texto
- `text-primary` - Texto principal (títulos, contenido importante)
- `text-secondary` - Texto secundario (descripciones, subtítulos)
- `text-accent` - Texto de acento (enlaces, highlights)
- `text-success` - Texto de éxito (estados positivos)
- `text-warning` - Texto de advertencia (estados de atención)
- `text-error` - Texto de error (estados negativos)

### Colores de Fondo
- `bg-background` - Fondo principal de la aplicación
- `bg-surface` - Fondo de tarjetas y elementos elevados
- `bg-hover` - Fondo para estados hover
- `bg-accent` - Fondo de acento (botones primarios)
- `bg-success` - Fondo de éxito
- `bg-warning` - Fondo de advertencia
- `bg-error` - Fondo de error

### Bordes
- `border-primary` - Borde principal
- `border-accent` - Borde de acento

## 🧩 Clases CSS Disponibles

### Componentes Base

#### Tarjetas
```jsx
<div className="card-theme">
  {/* Contenido de la tarjeta */}
</div>
```

#### Botones
```jsx
<button className="btn-theme btn-primary">Primario</button>
<button className="btn-theme btn-secondary">Secundario</button>
<button className="btn-theme btn-success">Éxito</button>
<button className="btn-theme btn-warning">Advertencia</button>
<button className="btn-theme btn-error">Error</button>
```

#### Inputs
```jsx
<input className="input-theme" type="text" placeholder="Texto" />
<select className="input-theme">
  <option>Opción 1</option>
</select>
```

#### Modales
```jsx
<div className="modal-theme">
  {/* Contenido del modal */}
</div>
```

### Componentes de Layout

#### Header
```jsx
<header className="header-theme">
  {/* Contenido del header */}
</header>
```

#### Sidebar
```jsx
<aside className="sidebar-theme">
  {/* Contenido del sidebar */}
</aside>
```

#### Navegación
```jsx
{/* Elemento de navegación normal */}
<a className="nav-item-theme">Elemento</a>

{/* Elemento de navegación activo */}
<a className="nav-item-active">Elemento Activo</a>

{/* Sub-elementos de navegación */}
<a className="nav-sub-item-theme">Sub-elemento</a>
<a className="nav-sub-item-active">Sub-elemento Activo</a>
```

#### Tablas
```jsx
<table className="table-theme">
  <thead>
    <tr>
      <th>Columna 1</th>
      <th>Columna 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Dato 1</td>
      <td>Dato 2</td>
    </tr>
  </tbody>
</table>
```

### Border Radius Temático
- `rounded-theme-sm` - Border radius pequeño
- `rounded-theme-md` - Border radius medio
- `rounded-theme-lg` - Border radius grande
- `rounded-theme-xl` - Border radius extra grande
- `rounded-theme-full` - Border radius completo (círculo)

## 🔧 Variables CSS

### Colores
```css
var(--color-background)     /* Fondo principal */
var(--color-surface)        /* Fondo de elementos */
var(--color-text-primary)   /* Texto principal */
var(--color-text-secondary) /* Texto secundario */
var(--color-accent)         /* Color de acento */
var(--color-hover)          /* Color hover */
var(--color-border)         /* Color de bordes */
var(--color-success)        /* Color de éxito */
var(--color-warning)        /* Color de advertencia */
var(--color-error)          /* Color de error */
```

### Tipografía
```css
var(--font-family)          /* Familia de fuente */
var(--font-size-sm)         /* Tamaño pequeño */
var(--font-size-md)         /* Tamaño medio */
var(--font-size-lg)         /* Tamaño grande */
var(--font-weight-normal)   /* Peso normal */
var(--font-weight-medium)   /* Peso medio */
var(--font-weight-semibold) /* Peso semi-bold */
var(--font-weight-bold)     /* Peso bold */
```

### Espaciado
```css
var(--spacing-xs)           /* Espaciado extra pequeño */
var(--spacing-sm)           /* Espaciado pequeño */
var(--spacing-md)           /* Espaciado medio */
var(--spacing-lg)           /* Espaciado grande */
var(--spacing-xl)           /* Espaciado extra grande */
var(--spacing-2xl)          /* Espaciado 2x grande */
```

### Sombras
```css
var(--shadow-sm)            /* Sombra pequeña */
var(--shadow-md)            /* Sombra media */
var(--shadow-lg)            /* Sombra grande */
var(--shadow-xl)            /* Sombra extra grande */
var(--shadow-2xl)           /* Sombra 2x grande */
```

### Border Radius
```css
var(--border-radius-sm)     /* Radio pequeño */
var(--border-radius-md)     /* Radio medio */
var(--border-radius-lg)     /* Radio grande */
var(--border-radius-xl)     /* Radio extra grande */
var(--border-radius-full)   /* Radio completo */
```

### Transiciones
```css
var(--transition-fast)      /* Transición rápida */
var(--transition-normal)    /* Transición normal */
var(--transition-slow)      /* Transición lenta */
```

## 📝 Componentes de Ejemplo

### Tarjeta de Dashboard
```jsx
const DashboardCard = ({ title, description, children }) => {
  return (
    <div className="card-theme">
      <h3 className="text-lg font-semibold mb-4 text-primary">{title}</h3>
      <p className="text-secondary mb-4">{description}</p>
      {children}
    </div>
  );
};
```

### Formulario Temático
```jsx
const ThemedForm = () => {
  return (
    <form className="card-theme">
      <h2 className="text-xl font-semibold mb-4 text-primary">Formulario</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-secondary mb-2">
          Nombre
        </label>
        <input 
          type="text" 
          className="input-theme" 
          placeholder="Ingresa tu nombre"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-secondary mb-2">
          Email
        </label>
        <input 
          type="email" 
          className="input-theme" 
          placeholder="tu@email.com"
        />
      </div>
      
      <div className="flex gap-2">
        <button type="submit" className="btn-theme btn-primary">
          Guardar
        </button>
        <button type="button" className="btn-theme btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
};
```

### Lista de Navegación
```jsx
const NavigationList = ({ items, activeItem }) => {
  return (
    <nav className="space-y-1">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.path}
          className={
            activeItem === item.id 
              ? "nav-item-active" 
              : "nav-item-theme"
          }
        >
          {item.icon}
          {item.name}
        </Link>
      ))}
    </nav>
  );
};
```

## ✅ Mejores Prácticas

### 1. Siempre usar clases temáticas
- Usar `text-primary` en lugar de `text-gray-900`
- Usar `card-theme` en lugar de `bg-white p-6 rounded-lg shadow-md`
- Usar `btn-theme btn-primary` en lugar de `bg-blue-500 text-white px-4 py-2 rounded`

### 2. Componente con tema personalizado
```jsx
const CustomComponent = () => {
  const { currentTheme } = useTheme();
  
  return (
    <div 
      className="card-theme"
      style={{
        '--custom-color': currentTheme.colors?.custom || '#000'
      }}
    >
      {/* Contenido */}
    </div>
  );
};
```

### 3. Responsive con temas
```jsx
<div className="card-theme grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Las clases responsive de Tailwind siguen funcionando */}
</div>
```

### 4. Estados condicionales
```jsx
<button 
  className={`btn-theme ${
    isActive ? 'btn-primary' : 'btn-secondary'
  }`}
  disabled={loading}
>
  {loading ? 'Cargando...' : 'Enviar'}
</button>
```

## 🚨 Troubleshooting

### Problema: Los estilos no se aplican
**Solución**: Verificar que el archivo `theme.css` esté importado en `layout.jsx`

### Problema: Variables CSS no definidas
**Solución**: Asegurarse de que el `ThemeProvider` envuelva la aplicación

### Problema: Clases CSS no encontradas
**Solución**: Verificar que la clase esté definida en `theme.css`

### Problema: El tema no persiste al recargar
**Solución**: Verificar que localStorage esté funcionando correctamente

## 🎛️ Cambiar Temas Programáticamente

```jsx
import { useTheme } from '@/contexts/ThemeContext';

const ThemeSelector = () => {
  const { availableThemes, currentTheme, applyTheme } = useTheme();
  
  return (
    <select 
      value={currentTheme.name}
      onChange={(e) => applyTheme(e.target.value)}
      className="input-theme"
    >
      {availableThemes.map(theme => (
        <option key={theme.name} value={theme.name}>
          {theme.displayName}
        </option>
      ))}
    </select>
  );
};
```

## 🔧 Personalización Avanzada

Para personalizar completamente un tema, dirigirse a la página de personalización:
```
/sigma/parametrization/styles
```

O usar el hook `useTheme` para acceso programático a todas las funciones de tema.

---

**📧 Contacto**: Si tienes dudas sobre el sistema de temas, consulta este README o revisa la implementación en:
- `src/contexts/ThemeContext.jsx`
- `src/styles/theme.css`
- `src/app/(dashboard)/parametrization/styles/page.jsx`
