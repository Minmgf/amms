# 📋 Guía Completa de Creación de Modales - AMMS

> **Última actualización:** Octubre 2025  
> **Basado en:** `DetailsClientModal.jsx` (Ejemplo de referencia completo)

## 🎯 Principios Fundamentales

### 1. **Todo Debe Ser Parametrizable**
Los modales **NUNCA** deben tener datos hardcodeados. Toda la información debe venir de endpoints o ser configurable.

**Regla de oro:** Si un dato puede cambiar desde la interfaz de parametrización, DEBE venir de un endpoint.

**Regla de oro:** Si un dato puede cambiar desde la interfaz de parametrización, DEBE venir de un endpoint.

#### ❌ **ERRORES COMUNES:**
```jsx
// ❌ Nombres hardcodeados
const statuses = ["Activo", "Inactivo", "Pendiente"];

// ❌ Colores basados en nombres (que pueden cambiar)
const statusColor = status === "Activo" ? "green" : "red";

// ❌ Lógica condicional con strings
if (item.status === "Finalizada") {
  // puede fallar si cambian el nombre
}

// ❌ Mapeo directo de nombres a colores
const colorMap = {
  "Activo": "bg-green-100",
  "Inactivo": "bg-red-100"
};
```

#### ✅ **FORMA CORRECTA:**
```jsx
// ✅ Estados vienen del endpoint con estructura completa
const [statuses] = useState([
  { 
    id_statues: 1, 
    name: "Activo", 
    description: "estado activo" 
  },
  { 
    id_statues: 2, 
    name: "Inactivo", 
    description: "estado inactivo" 
  },
]);

// ✅ Colores basados en ID (inmutable, no cambia aunque editen el nombre)
const getStatusColorById = (id) => {
  switch (id) {
    case 1: return "bg-green-100 text-green-800"; // Activo
    case 2: return "bg-red-100 text-red-800"; // Inactivo
    default: return "bg-gray-100 text-gray-800";
  }
};

// ✅ Lógica condicional basada en IDs
if (item.status_id === 1) { // ID nunca cambia
  // Siempre funcionará
}

// ✅ Obtener información completa del estado
const status = getStatusById(item.status_id, statuses);
const statusName = status?.name || "N/A"; // Nombre para mostrar
const statusColor = getStatusColorById(item.status_id); // Color basado en ID
```

### 2. **Los IDs Son Inmutables, Los Nombres Son Modificables**

**Concepto clave:** La parametrización permite a los usuarios cambiar nombres y descripciones, pero los IDs permanecen constantes.

#### 📊 Flujo de Datos Correcto

```
Endpoint → ID + Nombre + Descripción → Componente
           ↓         ↓           ↓
       INMUTABLE  MODIFICABLE  MODIFICABLE
           ↓         ↓           ↓
       Lógica    Mostrar     Tooltip/Info
```

#### 🔒 Reglas de Uso de IDs vs Nombres

| Uso | ¿Qué usar? | Ejemplo |
|-----|-----------|---------|
| **Lógica condicional** | ✅ ID | `if (item.status_id === 1)` |
| **Mapeo de colores** | ✅ ID | `getStatusColorById(item.status_id)` |
| **Filtros** | ✅ ID | `filter(x => x.status_id === selectedId)` |
| **Comparaciones** | ✅ ID | `item.status_id === 13` |
| **Visualización** | ✅ Nombre | `{status?.name}` |
| **Tooltips** | ✅ Descripción | `title={status?.description}` |
| **Búsqueda de texto** | ✅ Nombre | Usuario busca por nombre |

#### 💡 Ejemplos Prácticos

```jsx
// ✅ CORRECTO - Lógica basada en ID, visualización con nombre
const status = getStatusById(item.status_id, statuses);

// Condicional
if (item.status_id === 1) { // ✅ Usa ID
  console.log("Estado activo");
}

// Visualización
<span className={getStatusColorById(item.status_id)}> {/* ✅ ID para color */}
  {status?.name || "N/A"} {/* ✅ Nombre para mostrar */}
</span>

// ❌ INCORRECTO - Lógica basada en nombre
if (item.status === "Activo") { // ❌ Puede cambiar
  console.log("Estado activo");
}

// ❌ INCORRECTO - Color basado en nombre
<span className={item.status === "Activo" ? "bg-green-100" : "bg-red-100"}>
  {item.status}
</span>
```

## 🏗️ Estructura Base de un Modal

### Ejemplo Completo de Estructura
```jsx
"use client";
import React, { useState, useMemo } from "react";
import { FiX } from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";
import FilterModal from "@/app/components/shared/FilterModal";
import TableList from "@/app/components/shared/TableList";

/**
 * ExampleModal Component
 * 
 * Descripción clara del propósito del modal
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controla si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Object} props.data - Datos a mostrar en el modal
 */
const ExampleModal = ({ isOpen, onClose, data }) => {
  const { getCurrentTheme } = useTheme();
  
  // Estados para filtros y control
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Mock data - Estados parametrizables (TEMPORAL - vendrá del endpoint)
  const [statuses] = useState([
    { id_statues: 1, name: "Activo", description: "estado activo" },
    { id_statues: 2, name: "Inactivo", description: "estado inactivo" },
  ]);

  // Función para obtener información por ID
  const getStatusById = (id, statusArray) => {
    return statusArray.find((s) => s.id_statues === id) || 
           statusArray.find((s) => s.id === id);
  };

  // Función para obtener colores por ID (BASADA EN ID, NO EN NOMBRE)
  const getStatusColorById = (id, type = "status") => {
    // Colores inmutables basados en ID
    switch (id) {
      case 1: return "bg-green-100 text-green-800"; // Activo
      case 2: return "bg-red-100 text-red-800"; // Inactivo
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!data) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="card-theme rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-primary">
            <h2 className="text-2xl font-bold text-primary">Título del Modal</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-hover rounded-full transition-colors"
              aria-label="Cerrar modal"
            >
              <FiX className="w-6 h-6 text-secondary" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto max-h-[calc(95vh-90px)]">
            {/* Secciones del contenido */}
          </div>
        </div>
      </div>

      {/* Modales adicionales (filtros, confirmación, etc.) */}
      <FilterModal
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onClear={() => setFilters({})}
        onApply={() => setFilterModalOpen(false)}
      >
        {/* Campos de filtro */}
      </FilterModal>
    </>
  );
};

export default ExampleModal;
```

## 🎨 Diseño y Estilos

### 1. **Seguir el Patrón de ScheduleMaintenanceModal**
Todos los modales deben seguir el diseño establecido en `ScheduleMaintenanceModal.jsx`:

```jsx
// Header consistente
<div className="flex items-center justify-between p-6 border-b border-primary">
  <h2 className="text-2xl font-bold text-primary">Título</h2>
  <button 
    onClick={onClose} 
    className="p-2 hover:bg-hover rounded-full transition-colors"
    aria-label="Cerrar modal"
  >
    <FiX className="w-6 h-6 text-secondary" />
  </button>
</div>

// Contenedor principal con scroll
<div className="flex-1 overflow-y-auto max-h-[calc(95vh-90px)]">
  {/* Contenido */}
</div>
```

### 2. **Usar Clases Temáticas**
Siempre usar clases del sistema de temas:

```jsx
// ✅ CORRECTO
<div className="card-theme">
  <p className="text-primary">Texto principal</p>
  <p className="text-secondary">Texto secundario</p>
  <button className="btn-theme btn-primary">Acción</button>
</div>

// ❌ INCORRECTO
<div className="bg-white rounded-lg shadow-md p-6">
  <p className="text-gray-900">Texto principal</p>
  <p className="text-gray-600">Texto secundario</p>
  <button className="bg-blue-500 text-white px-4 py-2 rounded">Acción</button>
</div>
```

### 3. **Iconos y Visualización de Datos**
Patrón estándar para mostrar información con iconos:

```jsx
<div className="flex items-start gap-3">
  <div className="w-10 h-10 rounded-md bg-purple-100 flex items-center justify-center flex-shrink-0">
    <FaIdCard className="w-5 h-5 text-purple-600" />
  </div>
  <div className="flex-1">
    <div className="text-sm text-secondary mb-1">Etiqueta</div>
    <div className="font-medium text-primary">{data.value || "N/A"}</div>
  </div>
</div>
```

### 4. **Secciones del Modal**
```jsx
{/* Sección con fondo alternativo */}
<div className="p-6 border-b border-primary bg-surface/50">
  <div className="flex items-center justify-between mb-6">
    <h3 className="text-lg font-semibold text-primary">
      Título de Sección
    </h3>
    {/* Badge de estado u otra información */}
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
      getStatusColorById(data.status_id, "client")
    }`}>
      {status?.name || "N/A"}
    </span>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Campos de información */}
  </div>
</div>
```

## 📊 Manejo de Estados

### 1. **Estados Parametrizables**
```jsx
// Mock data - Estados parametrizables (vendrá del endpoint)
// TODO: Cuando se implemente el endpoint, reemplazar con llamada a la API

// Estados de cliente
const [clientStatuses] = useState([
  { id_statues: 1, name: "Activo", description: "estado activo" },
  { id_statues: 2, name: "Inactivo", description: "estado inactivo" },
]);

// Estados de solicitudes
const [requestStatuses] = useState([
  { id_statues: 13, name: "Finalizada", description: "Solicitud completada" },
  { id_statues: 14, name: "En proceso", description: "Solicitud en curso" },
  { id_statues: 15, name: "Cancelada", description: "Solicitud cancelada" },
  { id_statues: 16, name: "Pendiente", description: "Solicitud pendiente" },
]);

// Estados de facturación
const [billingStatuses] = useState([
  { id_statues: 17, name: "Pagada", description: "Factura pagada" },
  { id_statues: 18, name: "Pendiente", description: "Pago pendiente" },
  { id_statues: 19, name: "No pagada", description: "Sin pago" },
]);

// Tipos de persona
const [personTypes] = useState([
  { id: 1, name: "Natural", description: "Persona natural" },
  { id: 2, name: "Juridica", description: "Persona jurídica" },
]);

// Tipos de identificación
const [identificationType] = useState([
  { id: 1, code: "CC", name: "Cédula de Ciudadanía" },
  { id: 2, code: "NIT", name: "Número de Identificación Tributaria" },
  { id: 3, code: "CE", name: "Cédula de Extranjería" },
  { id: 4, code: "PAS", name: "Pasaporte" },
]);
```

### 2. **Función Helper para Obtener Estado por ID**
```jsx
/**
 * Obtiene un estado/tipo de un array por su ID
 * Busca tanto en id_statues como en id para flexibilidad
 */
const getStatusById = (id, statusArray) => {
  return statusArray.find((s) => s.id_statues === id) || 
         statusArray.find((s) => s.id === id);
};

// Uso
const status = getStatusById(item.status_id, statuses);
<span>{status?.name || "N/A"}</span>
```

### 3. **Colores Basados en ID (Inmutables)**
```jsx
/**
 * Retorna clases de color basadas en el ID del estado
 * Los IDs son inmutables, por lo que los colores son consistentes
 * 
 * @param {number} id - ID del estado
 * @param {string} type - Tipo de estado (client, request, billing, etc.)
 * @returns {string} Clases de Tailwind para el color
 */
const getStatusColorById = (id, type = "status") => {
  // Estados de cliente
  if (type === "client") {
    switch (id) {
      case 1: return "bg-green-100 text-green-800"; // Activo
      case 2: return "bg-red-100 text-red-800"; // Inactivo
      default: return "bg-gray-100 text-gray-800";
    }
  } 
  
  // Estados de solicitud
  else if (type === "request") {
    switch (id) {
      case 13: return "bg-green-100 text-green-800"; // Finalizada
      case 14: return "bg-blue-100 text-blue-800"; // En proceso
      case 15: return "bg-red-100 text-red-800"; // Cancelada
      case 16: return "bg-yellow-100 text-yellow-800"; // Pendiente
      default: return "bg-gray-100 text-gray-800";
    }
  } 
  
  // Estados de facturación
  else if (type === "billing") {
    switch (id) {
      case 17: return "bg-green-100 text-green-800"; // Pagada
      case 18: return "bg-yellow-100 text-yellow-800"; // Pendiente
      case 19: return "bg-red-100 text-red-800"; // No pagada
      default: return "bg-gray-100 text-gray-800";
    }
  }
  
  return "bg-gray-100 text-gray-800";
};

// Uso
<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
  getStatusColorById(item.status_id, "client")
}`}>
  {status?.name || "N/A"}
</span>
```

## 🔍 Filtros y Tablas

### 1. **Integración con FilterModal**
```jsx
const [filterModalOpen, setFilterModalOpen] = useState(false);
const [statusFilter, setStatusFilter] = useState("");
const [billingFilter, setBillingFilter] = useState("");

// Botón de filtro con indicador visual
<button
  onClick={() => setFilterModalOpen(true)}
  className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg font-medium transition-colors ${
    statusFilter || billingFilter
      ? "bg-blue-100 border-blue-300 text-blue-700"
      : "border-gray-300 text-gray-700 hover:bg-gray-50"
  }`}
>
  <FaFilter className="w-4 h-4" />
  Filter by
  {(statusFilter || billingFilter) && (
    <span className="ml-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
      {[statusFilter, billingFilter].filter(Boolean).length}
    </span>
  )}
</button>

// Botón para limpiar filtros
{(statusFilter || billingFilter) && (
  <button
    onClick={handleClearFilters}
    className="text-sm text-red-500 hover:text-red-700 underline flex items-center gap-1"
  >
    <FaTimes className="w-3 h-3" /> Clear filters
  </button>
)}

// Modal de filtros
<FilterModal
  open={filterModalOpen}
  onClose={() => setFilterModalOpen(false)}
  onClear={handleClearFilters}
  onApply={handleApplyFilters}
>
  <div className="space-y-4">
    {/* Filtro por estado */}
    <div>
      <label className="block text-sm font-medium text-primary mb-2">
        Estado
      </label>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="input-theme w-full"
      >
        <option value="">Todos los estados</option>
        {statuses.map((status) => (
          <option key={status.id_statues} value={status.id_statues}>
            {status.name}
          </option>
        ))}
      </select>
    </div>
  </div>
</FilterModal>
```

### 2. **Filtrado de Datos con useMemo**
```jsx
// Filtrar datos basándose en IDs
const filteredData = useMemo(() => {
  let filtered = originalData;

  // Filtro por estado (usando ID)
  if (statusFilter) {
    filtered = filtered.filter((item) => 
      item.status_id === parseInt(statusFilter)
    );
  }

  // Filtro por facturación (usando ID)
  if (billingFilter) {
    filtered = filtered.filter((item) => 
      item.billing_status_id === parseInt(billingFilter)
    );
  }

  return filtered;
}, [statusFilter, billingFilter, originalData]);

// Funciones para manejar filtros
const handleApplyFilters = () => {
  setFilterModalOpen(false);
};

const handleClearFilters = () => {
  setStatusFilter("");
  setBillingFilter("");
  setFilterModalOpen(false);
};
```

### 3. **Columnas de Tabla con Estados Parametrizables**
```jsx
const columns = useMemo(
  () => [
    {
      accessorKey: "id",
      header: () => (
        <div className="flex items-center gap-2">
          <FaHashtag className="w-4 h-4" />
          ID
        </div>
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm font-medium text-primary">
          {row.getValue("id")}
        </div>
      ),
    },
    {
      accessorKey: "status_id",
      header: () => (
        <div className="flex items-center gap-2">
          <FaCheckCircle className="w-4 h-4" />
          Estado
        </div>
      ),
      cell: ({ row }) => {
        const statusId = row.getValue("status_id");
        const status = getStatusById(statusId, statuses);
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            getStatusColorById(statusId, "request")
          }`}>
            {status?.name || "N/A"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const item = row.original;
        // Lógica condicional basada en ID
        const canPerformAction = item.status_id === 1;
        
        return (
          <div className="flex items-center gap-2">
            {canPerformAction && (
              <button
                onClick={() => handleAction(item)}
                className="btn-theme btn-sm"
              >
                Acción
              </button>
            )}
          </div>
        );
      },
    },
  ],
  [statuses] // Dependencias
);
```

### 4. **Uso de TableList**
```jsx
<TableList
  columns={columns}
  data={filteredData}
  loading={false}
  globalFilter={globalFilter}
  onGlobalFilterChange={setGlobalFilter}
  pageSizeOptions={[5, 10, 20]}
/>
```

## 📝 Validación de Datos

### 1. **Validar Existencia de Datos**
```jsx
// Validar que el modal reciba datos antes de renderizar
if (!data) return null;

// Siempre usar fallback para datos opcionales
<div className="font-medium text-primary">
  {data.field || "N/A"}
</div>

// Para arrays
{data.items?.length > 0 ? (
  data.items.map(item => <div key={item.id}>{item.name}</div>)
) : (
  <p className="text-secondary">No hay elementos</p>
)}
```

### 2. **Validar IDs y Relaciones**
```jsx
// Obtener información relacionada con validación de fallback
const status = getStatusById(data.status_id || 1, statuses);
const type = getStatusById(data.type_id || 1, types);
const personType = getStatusById(data.person_type_id || 2, personTypes);

// Siempre tener fallback en la visualización
<span>{status?.name || "Desconocido"}</span>
<span>{status?.description || "Sin descripción"}</span>
```

### 3. **Validación de Acciones Condicionales**
```jsx
// Lógica condicional basada en IDs
const canDownload = item.invoice_url && item.billing_status_id === 17; // Pagada
const canEdit = item.status_id === 1; // Activo
const canDelete = item.status_id === 2 && !item.has_dependencies; // Inactivo y sin dependencias

{canDownload && (
  <button onClick={() => handleDownload(item)}>
    <FaDownload /> Descargar
  </button>
)}
```

## 🔄 Integración con Endpoints

### 1. **Estructura de Datos del Endpoint**
```jsx
// TODO: Cuando se implemente el endpoint, reemplazar con:
// const [statuses, setStatuses] = useState([]);
// 
// useEffect(() => {
//   const fetchStatuses = async () => {
//     try {
//       const response = await getStatuses();
//       setStatuses(response.data);
//     } catch (error) {
//       console.error("Error al cargar estados:", error);
//       // Manejar error
//     }
//   };
//   fetchStatuses();
// }, []);

// TEMPORAL - Mock data para desarrollo
const [statuses] = useState([
  { id_statues: 1, name: "Activo", description: "estado activo" },
  { id_statues: 2, name: "Inactivo", description: "estado inactivo" },
]);
```

### 2. **Formato Esperado del Endpoint**
```javascript
// Formato de estados/tipos
{
  "data": [
    {
      "id_statues": 1,
      "name": "Activo",
      "description": "estado activo"
    },
    {
      "id_statues": 2,
      "name": "Inactivo",
      "description": "estado inactivo"
    }
  ]
}

// Formato de entidades con relaciones
{
  "data": {
    "id": 123,
    "name": "Nombre",
    "status_id": 1, // ID del estado, no el nombre
    "type_id": 2, // ID del tipo, no el nombre
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### 3. **Comentarios para Endpoints Futuros**
```jsx
// Mock data - Estados parametrizables (vendrá del endpoint /api/statuses?type=client)
const [clientStatuses] = useState([...]);

// Mock data - Historial de solicitudes (vendrá del endpoint /api/clients/{id}/requests)
const requestHistory = [...];

// TODO: Implementar llamada al endpoint para descarga de factura
const handleDownloadInvoice = async (invoiceUrl, requestId) => {
  // Temporal: solo log
  console.log(`Descargando factura para solicitud ${requestId}:`, invoiceUrl);
  
  // TODO: Cuando esté el endpoint, usar:
  // try {
  //   const response = await downloadInvoice(requestId);
  //   // Manejar descarga
  // } catch (error) {
  //   // Manejar error
  // }
};
```

## 📋 Checklist de Creación de Modal

### ✅ Estructura Base
- [ ] Header con título usando `text-primary`
- [ ] Botón de cierre con icono `FiX`
- [ ] Contenedor scrollable con `max-h-[calc(95vh-90px)]`
- [ ] Clases temáticas (`card-theme`, `border-primary`, etc.)
- [ ] Cierre al hacer click fuera del modal
- [ ] Validación `if (!data) return null`

### ✅ Parametrización
- [ ] Estados vienen de mock data con estructura de endpoint
- [ ] Comentarios TODO para endpoints futuros
- [ ] IDs usados para toda la lógica
- [ ] Nombres usados solo para visualización
- [ ] Función `getStatusById` implementada
- [ ] Función `getStatusColorById` con switch basado en IDs
- [ ] Colores mapeados a IDs específicos (inmutables)

### ✅ Datos y Validación
- [ ] Validación de existencia de datos principales
- [ ] Fallbacks con "N/A" en todos los campos opcionales
- [ ] Uso de optional chaining (`?.`)
- [ ] Valores por defecto en obtención de estados

### ✅ Estilos y Diseño
- [ ] Uso exclusivo de clases temáticas (no hardcoded)
- [ ] `text-primary` para textos principales
- [ ] `text-secondary` para textos secundarios
- [ ] `border-primary` para bordes
- [ ] `bg-surface` para fondos alternativos
- [ ] `hover:bg-hover` para estados hover
- [ ] Grid responsive (`grid-cols-1 md:grid-cols-2`)
- [ ] Iconos con contenedores de color consistentes

### ✅ Filtros y Tablas (si aplica)
- [ ] Integración con `FilterModal` compartido
- [ ] Integración con `TableList` compartido
- [ ] Filtros basados en IDs (no en nombres)
- [ ] Indicador visual de filtros activos (contador)
- [ ] Botón para limpiar filtros
- [ ] `useMemo` para datos filtrados
- [ ] Columnas de tabla con estados parametrizables

### ✅ Documentación
- [ ] JSDoc con descripción del componente
- [ ] Parámetros documentados con `@param`
- [ ] Comentarios explicativos en secciones clave
- [ ] TODO para funcionalidad pendiente de endpoints
- [ ] Comentarios sobre formato esperado de datos

## 🚨 Errores Comunes a Evitar

### 1. **Hardcodear Datos**
```jsx
// ❌ INCORRECTO
const status = item.status === "Activo" ? "green" : "red";
const colors = {
  "Activo": "bg-green-100",
  "Inactivo": "bg-red-100"
};

// ✅ CORRECTO
const statusId = item.status_id;
const color = getStatusColorById(statusId, "client");
```

### 2. **Usar Nombres en Lugar de IDs para Lógica**
```jsx
// ❌ INCORRECTO
if (item.status === "Activo") {
  // Puede fallar si cambian el nombre desde parametrización
}

// ✅ CORRECTO
if (item.status_id === 1) {
  // Siempre funcionará porque el ID no cambia
}
```

### 3. **No Validar Datos**
```jsx
// ❌ INCORRECTO
<span>{item.name}</span>
<div>{user.email}</div>

// ✅ CORRECTO
<span>{item.name || "N/A"}</span>
<div>{user?.email || "Sin email"}</div>
```

### 4. **Clases de Tailwind Hardcodeadas**
```jsx
// ❌ INCORRECTO
<div className="bg-white text-gray-900 border-gray-200 p-6 rounded-lg">
<p className="text-gray-600">Descripción</p>
<button className="bg-blue-500 hover:bg-blue-600 text-white">
  Acción
</button>

// ✅ CORRECTO
<div className="card-theme">
<p className="text-secondary">Descripción</p>
<button className="btn-theme btn-primary">
  Acción
</button>
```

### 5. **No Preparar para Endpoints**
```jsx
// ❌ INCORRECTO
const statuses = ["Activo", "Inactivo"];
const types = ["Natural", "Juridica"];

// ✅ CORRECTO
// Mock data - Estados parametrizables (vendrá del endpoint)
const [statuses] = useState([
  { id_statues: 1, name: "Activo", description: "estado activo" },
  { id_statues: 2, name: "Inactivo", description: "estado inactivo" },
]);
```

### 6. **Mezclar Lógica de Negocio con Presentación**
```jsx
// ❌ INCORRECTO
<span className={
  item.status === "Finalizada" ? "bg-green-100" :
  item.status === "En proceso" ? "bg-blue-100" :
  item.status === "Cancelada" ? "bg-red-100" : "bg-gray-100"
}>
  {item.status}
</span>

// ✅ CORRECTO
const status = getStatusById(item.status_id, statuses);
<span className={`${getStatusColorById(item.status_id, "request")}`}>
  {status?.name || "N/A"}
</span>
```

### 7. **No Usar Dependencias en useMemo/useCallback**
```jsx
// ❌ INCORRECTO
const columns = useMemo(() => [...], []); // Falta dependencias

// ✅ CORRECTO
const columns = useMemo(() => [...], [statuses, types]); // Con dependencias
```

## 🎯 Ejemplos Completos de Referencia

### Archivos de Referencia en el Proyecto:

1. **`DetailsClientModal.jsx`** - Ejemplo completo implementado
   - ✅ Datos parametrizables completos
   - ✅ IDs para lógica, nombres para visualización
   - ✅ Colores basados en ID
   - ✅ Diseño consistente con sistema de temas
   - ✅ Filtros integrados con FilterModal
   - ✅ Tabla con TableList
   - ✅ Preparado para endpoints con TODOs
   - ✅ Validación completa de datos

2. **`ScheduleMaintenanceModal.jsx`** - Patrón de diseño base
   - Estructura de header
   - Contenedores scrollables
   - Uso de clases temáticas
   - Layout de secciones

3. **`FilterModal.jsx`** - Modal de filtros compartido
   - Componente reutilizable
   - Props personalizables
   - Children para campos custom

4. **`TableList.jsx`** - Tabla parametrizable
   - Componente compartido
   - Paginación
   - Ordenamiento
   - Filtrado global

## 📚 Recursos Adicionales

### Clases Temáticas Disponibles

Consultar `THEME_SYSTEM_README.md` para lista completa de clases:

- **Colores de texto**: `text-primary`, `text-secondary`, `text-accent`, `text-success`, `text-warning`, `text-error`
- **Colores de fondo**: `bg-background`, `bg-surface`, `bg-hover`, `bg-accent`
- **Borders**: `border-primary`, `border-secondary`
- **Inputs**: `input-theme`
- **Botones**: `btn-theme`, `btn-primary`, `btn-secondary`
- **Cards**: `card-theme`

### Convenciones de Nomenclatura

- **Estados**: Usar formato `{ id_statues: number, name: string, description: string }`
- **Tipos**: Usar formato `{ id: number, name: string, description: string }`
- **IDs en datos**: Usar sufijo `_id` (ej: `status_id`, `type_id`, `person_type_id`)
- **Funciones helpers**: Prefijo `get` + nombre descriptivo (ej: `getStatusById`, `getStatusColorById`)

### Mapeo de IDs de Estados (Referencia)

```javascript
// Estados de Cliente
1 - Activo (verde)
2 - Inactivo (rojo)

// Estados de Solicitud
13 - Finalizada (verde)
14 - En proceso (azul)
15 - Cancelada (rojo)
16 - Pendiente (amarillo)

// Estados de Facturación
17 - Pagada (verde)
18 - Pendiente (amarillo)
19 - No pagada (rojo)
```

---

## 📧 Contacto y Soporte

Si tienes dudas sobre la creación de modales:

1. Consulta este README primero
2. Revisa los archivos de ejemplo mencionados
3. Verifica el `THEME_SYSTEM_README.md` para clases temáticas
4. Asegúrate de seguir todos los items del checklist

**Recuerda**: La parametrización y el uso de IDs son fundamentales. Nunca hardcodees datos que puedan cambiar desde la interfaz de parametrización.
