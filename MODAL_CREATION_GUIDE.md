# 📋 Guía Completa de Creación de Modales - AMMS

> **Última actualización:** Noviembre 2025  
> **Basado en:** Análisis de 42+ modales existentes en el proyecto
> **Estándar actualizado:** Patrones comunes y mejores prácticas identificadas

## 🎯 Principios Fundamentales

### 1. **Todo Debe Ser Parametrizable**
Los modales **NUNCA** deben tener datos hardcodeados. Toda la información debe venir de endpoints o ser configurable.

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

## 🏗️ Estándar Mejorado de Modales (Basado en 42+ Modales Analizados)

### 📊 **Patrones Identificados en el Proyecto**

Después de analizar todos los modales existentes en AMMS, hemos identificado patrones consistentes que deben seguirse:

#### **1. Estructura de Componente Estándar**
```jsx
"use client";
import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";
import { SuccessModal, ErrorModal, ConfirmModal } from "../shared/SuccessErrorModal";

/**
 * ComponentNameModal Component
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controla si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSuccess - Callback opcional para éxito
 * @param {Object} props.defaultValues - Valores por defecto para el formulario
 * @param {string} props.mode - 'create' | 'edit' | 'view'
 */
const ComponentNameModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  defaultValues = {}, 
  mode = "create" 
}) => {
  const { getCurrentTheme } = useTheme();
  
  // Estados estándar
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  
  // Estados de datos (parametrizables)
  const [dataOptions, setDataOptions] = useState([]);
  
  // Estados de formulario
  const [formData, setFormData] = useState({
    // Campos del formulario
  });
  
  // Estados de errores
  const [errors, setErrors] = useState({});
};
```

#### **2. Patrones de Estados Identificados**

**Estados Siempre Requeridos:**
```jsx
// ✅ Estados estándar en TODOS los modales
const [loading, setLoading] = useState(false);
const [successOpen, setSuccessOpen] = useState(false);
const [errorOpen, setErrorOpen] = useState(false);
const [modalMessage, setModalMessage] = useState("");

// ✅ Estados de datos parametrizables
const [statuses, setStatuses] = useState([]);
const [types, setTypes] = useState([]);
const [priorities, setPriorities] = useState([]);

// ✅ Estados de formulario
const [formData, setFormData] = useState({});
const [errors, setErrors] = useState({});
```

#### **3. Patrones de useEffect Identificados**

**Patrón 1: Cargar datos al abrir modal**
```jsx
useEffect(() => {
  if (!isOpen) return;
  
  const fetchData = async () => {
    try {
      const [data1, data2, data3] = await Promise.all([
        getEndpoint1(),
        getEndpoint2(), 
        getEndpoint3()
      ]);
      setDataOptions(data1.data);
      setStatuses(data2.data);
      setTypes(data3.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  fetchData();
}, [isOpen]);
```

**Patrón 2: Resetear formulario al cerrar**
```jsx
useEffect(() => {
  if (!isOpen) {
    // Resetear estados
    setFormData(defaultValues);
    setErrors({});
    setLoading(false);
    return;
  }
  
  // Cargar datos en modo edición
  if (isOpen && mode === "edit" && editData) {
    setFormData({
      ...defaultValues,
      ...editData
    });
  }
}, [isOpen, mode, editData]);
```

#### **4. Patrones de Manejo de Formularios**

**Patrón A: React Hook Form (Más común)**
```jsx
const { 
  register, 
  handleSubmit, 
  reset, 
  watch, 
  setValue,
  formState: { errors } 
} = useForm({
  defaultValues,
});

const handleFormSubmit = async (data) => {
  setLoading(true);
  try {
    const response = await createItem(data);
    setModalMessage(response.message || "Item creado exitosamente");
    setSuccessOpen(true);
    if (onSuccess) onSuccess();
    setTimeout(() => {
      setSuccessOpen(false);
      reset();
      onClose();
    }, 2000);
  } catch (error) {
    const apiError = error.response?.data;
    let fullMessage = apiError?.message || "Error al crear el item";
    if (apiError?.details) {
      const detailsArray = Object.values(apiError.details).flat();
      fullMessage += `: ${detailsArray.join(" ")}`;
    }
    setModalMessage(fullMessage);
    setErrorOpen(true);
  } finally {
    setLoading(false);
  }
};
```

**Patrón B: Estado Controlado (Para formularios complejos)**
```jsx
const handleInputChange = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  
  // Limpiar error del campo
  if (errors[field]) {
    setErrors(prev => ({ ...prev, [field]: "" }));
  }
};

const validateForm = () => {
  const newErrors = {};
  // Validaciones...
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  
  setLoading(true);
  try {
    const response = await createItem(formData);
    setModalMessage(response.message || "Item creado exitosamente");
    setSuccessOpen(true);
    if (onSuccess) onSuccess();
  } catch (error) {
    setModalMessage(error.response?.data?.message || "Error al crear el item");
    setErrorOpen(true);
  } finally {
    setLoading(false);
  }
};
```

#### **5. Patrones de Estructura JSX**

**Estructura Base Estándar:**
```jsx
if (!isOpen) return null;

return (
  <>
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card-theme rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary">
          <h2 className="text-2xl font-bold text-primary">
            {mode === "edit" ? "Editar" : "Nuevo"} Componente
          </h2>
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
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Secciones del formulario */}
            
            {/* Botones */}
            <div className="flex gap-4 pt-6 border-t border-primary">
              <button
                type="button"
                onClick={onClose}
                className="btn-theme btn-secondary flex-1"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-theme btn-primary flex-1"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    {/* Modales de feedback */}
    <SuccessModal
      isOpen={successOpen}
      onClose={() => setSuccessOpen(false)}
      title="Éxito"
      message={modalMessage}
    />

    <ErrorModal
      isOpen={errorOpen}
      onClose={() => setErrorOpen(false)}
      title="Error"
      message={modalMessage}
    />
  </>
);
```

#### **6. Patrones de Validación**

**Validaciones Comunes Identificadas:**
```jsx
const validateForm = () => {
  const newErrors = {};
  
  // Campos obligatorios
  if (!formData.name?.trim()) newErrors.name = "El nombre es obligatorio";
  if (!formData.type) newErrors.type = "Debe seleccionar un tipo";
  
  // Validaciones de formato
  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = "El formato del email no es válido";
  }
  
  // Validaciones de longitud
  if (formData.phone && !/^\d{7,15}$/.test(formData.phone)) {
    newErrors.phone = "El teléfono debe tener entre 7 y 15 dígitos";
  }
  
  // Validaciones condicionales
  if (formData.requiresContract && !formData.contractId) {
    newErrors.contractId = "Debe seleccionar un contrato";
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

#### **7. Patrones de Loading y Estados**

**Loading States:**
```jsx
// Botón con loading
<button
  type="submit"
  className="btn-theme btn-primary flex-1"
  disabled={loading}
>
  {loading ? (
    <>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
      Guardando...
    </>
  ) : (
    "Guardar"
  )}
</button>

// Inputs con loading
<select 
  className="input-theme"
  disabled={loadingOptions}
>
  {loadingOptions ? (
    <option>Cargando opciones...</option>
  ) : (
    options.map(option => (
      <option key={option.id} value={option.id}>
        {option.name}
      </option>
    ))
  )}
</select>
```

#### **8. Patrones de Responsive**

**Grid Responsive Estándar:**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Campos del formulario */}
</div>

// Para formularios más complejos
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Campos del formulario */}
</div>
```

## 🏗️ Ejemplo Completo Actualizado

### Modal Estándar Completo (2025)
```jsx
"use client";
import React, { useState, useEffect } from "react";
import { FiX, FiUser, FiMail } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { useTheme } from "@/contexts/ThemeContext";
import { SuccessModal, ErrorModal } from "../shared/SuccessErrorModal";

/**
 * StandardModal Component
 * 
 * Ejemplo completo siguiendo el estándar actualizado
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controla si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSuccess - Callback para éxito
 * @param {Object} props.editData - Datos para modo edición
 * @param {string} props.mode - 'create' | 'edit'
 */
const StandardModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editData, 
  mode = "create" 
}) => {
  const { getCurrentTheme } = useTheme();
  const isEditMode = mode === "edit";
  
  // Estados estándar
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  
  // Estados de datos parametrizables
  const [statuses, setStatuses] = useState([]);
  const [types, setTypes] = useState([]);
  
  // React Hook Form
  const { 
    register, 
    handleSubmit, 
    reset, 
    watch, 
    setValue,
    formState: { errors } 
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      status: "",
      type: "",
    },
  });

  // Cargar datos parametrizables
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchData = async () => {
      setLoadingOptions(true);
      try {
        const [statusesData, typesData] = await Promise.all([
          getStatuses(),
          getTypes()
        ]);
        setStatuses(statusesData.data);
        setTypes(typesData.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingOptions(false);
      }
    };
    
    fetchData();
  }, [isOpen]);

  // Resetear/Cargar formulario
  useEffect(() => {
    if (!isOpen) {
      reset();
      return;
    }
    
    if (isEditMode && editData) {
      reset({
        name: editData.name || "",
        email: editData.email || "",
        status: editData.status_id || "",
        type: editData.type_id || "",
      });
    }
  }, [isOpen, isEditMode, editData, reset]);

  // Manejar envío
  const handleFormSubmit = async (data) => {
    setLoading(true);
    try {
      const endpoint = isEditMode ? updateItem : createItem;
      const payload = isEditMode ? { id: editData.id, ...data } : data;
      
      const response = await endpoint(payload);
      setModalMessage(response.message || 
        (isEditMode ? "Item actualizado exitosamente" : "Item creado exitosamente"));
      setSuccessOpen(true);
      
      if (onSuccess) onSuccess();
      
      setTimeout(() => {
        setSuccessOpen(false);
        reset();
        onClose();
      }, 2000);
    } catch (error) {
      const apiError = error.response?.data;
      let fullMessage = apiError?.message || "Error al procesar la solicitud";
      if (apiError?.details) {
        const detailsArray = Object.values(apiError.details).flat();
        fullMessage += `: ${detailsArray.join(" ")}`;
      }
      setModalMessage(fullMessage);
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="card-theme rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-primary">
            <h2 className="text-2xl font-bold text-primary">
              {isEditMode ? "Editar" : "Nuevo"} Item
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-hover rounded-full transition-colors"
              aria-label="Cerrar modal"
            >
              <FiX className="w-6 h-6 text-secondary" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto max-h-[calc(95vh-90px)]">
            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
              {/* Sección Información General */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary">Información General</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      {...register("name", { required: "El nombre es obligatorio" })}
                      className={`input-theme ${errors.name ? 'border-red-500' : ''}`}
                      placeholder="Ingrese el nombre"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      {...register("email", { 
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Formato de email inválido"
                        }
                      })}
                      className={`input-theme ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="Ingrese el email"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Estado *
                    </label>
                    <select
                      {...register("status", { required: "Debe seleccionar un estado" })}
                      className={`input-theme ${errors.status ? 'border-red-500' : ''}`}
                      disabled={loadingOptions}
                    >
                      <option value="">Seleccione un estado</option>
                      {statuses.map(status => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                    {errors.status && (
                      <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Tipo *
                    </label>
                    <select
                      {...register("type", { required: "Debe seleccionar un tipo" })}
                      className={`input-theme ${errors.type ? 'border-red-500' : ''}`}
                      disabled={loadingOptions}
                    >
                      <option value="">Seleccione un tipo</option>
                      {types.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    {errors.type && (
                      <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-6 border-t border-primary">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-theme btn-secondary flex-1"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-theme btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      {isEditMode ? "Actualizando..." : "Creando..."}
                    </>
                  ) : (
                    isEditMode ? "Actualizar" : "Crear"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modales de feedback */}
      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Éxito"
        message={modalMessage}
      />

      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Error"
        message={modalMessage}
      />
    </>
  );
};

export default StandardModal;
```

## 📋 **Checklist de Creación de Modales (2025)**

### ✅ **Obligatorio en Todo Modal**
- [ ] **"use client"** al inicio del archivo
- [ ] **Importar useTheme** desde `@/contexts/ThemeContext`
- [ ] **Importar SuccessModal, ErrorModal** desde `../shared/SuccessErrorModal`
- [ ] **Estados estándar**: `loading`, `successOpen`, `errorOpen`, `modalMessage`
- [ ] **Estructura base**: overlay + modal container + header + content
- [ ] **Cerrar al hacer click fuera**: `onClick={(e) => e.target === e.currentTarget && onClose()}`
- [ ] **Botón de cerrar** en el header con icono FiX
- [ ] **Contenido scrollable**: `overflow-y-auto max-h-[calc(95vh-90px)]`
- [ ] **Clases temáticas**: `card-theme`, `input-theme`, `btn-theme`
- [ ] **Responsive**: grid responsive para formularios

### ✅ **Para Modales con Formularios**
- [ ] **React Hook Form** o estado controlado
- [ ] **Validaciones** obligatorias y de formato
- [ ] **Loading states** en botones y selects
- [ ] **Manejo de errores** con mensajes específicos
- [ ] **Resetear formulario** al cerrar
- [ ] **Callback onSuccess** opcional
- [ ] **Modo edición** con `editData` y `mode`

### ✅ **Para Modales con Datos Parametrizables**
- [ ] **useEffect para cargar datos** al abrir modal
- [ ] **Promise.all** para múltiples endpoints
- [ ] **Estados de loading** para selects
- [ ] **IDs para lógica, nombres para display**
- [ ] **Manejo de datos vacíos** o error de carga

### ✅ **Accesibilidad y UX**
- [ ] **aria-label** en botones de cerrar
- [ ] **disabled states** durante loading
- [ ] **Feedback visual** (spinners, mensajes)
- [ ] **Confirmación al cancelar** si hay datos
- [ ] **Focus management** (opcional pero recomendado)

## 🚨 **Errores Comunes Identificados y Soluciones**

### **Error 1: Modal no se cierra al hacer click fuera**
```jsx
// ❌ Incorrecto - no maneja click en overlay
<div className="fixed inset-0 bg-black/60 flex items-center justify-center">

// ✅ Correcto - maneja click solo en overlay
<div 
  className="fixed inset-0 bg-black/60 flex items-center justify-center"
  onClick={(e) => e.target === e.currentTarget && onClose()}
>
```

### **Error 2: Estados no se resetean al cerrar**
```jsx
// ❌ Incorrecto - no resetea estados
const handleSubmit = async (data) => {
  // ... lógica
  onClose(); // estados permanecen
};

// ✅ Correcto - resetea estados
useEffect(() => {
  if (!isOpen) {
    reset();
    setErrors({});
    setLoading(false);
  }
}, [isOpen, reset]);
```

### **Error 3: Datos hardcodeados**
```jsx
// ❌ Incorrecto - datos fijos
const options = ["Activo", "Inactivo"];

// ✅ Correcto - del endpoint
const [options, setOptions] = useState([]);
useEffect(() => {
  if (isOpen) getOptions().then(setOptions);
}, [isOpen]);
```

### **Error 4: No manejar loading en selects**
```jsx
// ❌ Incorrecto - no muestra loading
<select className="input-theme">
  {options.map(option => ...)}
</select>

// ✅ Correcto - muestra estado de carga
<select className="input-theme" disabled={loadingOptions}>
  {loadingOptions ? (
    <option>Cargando...</option>
  ) : (
    options.map(option => ...)
  )}
</select>
```

## 🎯 **Tipos de Modales Identificados en el Proyecto**

### **1. Form Modal (60% de los casos)**
- Propósito: Crear/editar entidades
- Características: Formulario, validaciones, loading states
- Ejemplos: `AddClientModal`, `MaintenanceRequestModal`, `RegisterEmployeeModal`

### **2. Detail Modal (25% de los casos)**
- Propósito: Mostrar información detallada
- Características: Solo lectura, tabs, datos complejos
- Ejemplos: `TrackingDashboardModal`, `DetailsClientModal`

### **3. Filter Modal (10% de los casos)**
- Propósito: Filtrar listados
- Características: Inputs de filtro, botones apply/clear
- Ejemplos: `HistoryFiltersModal`, `MaintenanceFiltersModal`

### **4. Confirmation Modal (5% de los casos)**
- Propósito: Confirmar acciones destructivas
- Características: Mensaje, botones confirm/cancel
- Ejemplos: `CancelRequestModal`, `DeclineRequestModal`

## 📚 **Referencias Rápidas**

### **Imports Estándar**
```jsx
import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";
import { SuccessModal, ErrorModal, ConfirmModal } from "../shared/SuccessErrorModal";
import { useForm } from "react-hook-form"; // si usa formulario
```

### **Clases CSS Temáticas**
```jsx
// Contenedor principal
className="card-theme rounded-xl shadow-2xl"

// Header
className="flex items-center justify-between p-6 border-b border-primary"

// Form inputs
className="input-theme"

// Botones
className="btn-theme btn-primary"
className="btn-theme btn-secondary"
className="btn-theme btn-error"

// Textos
className="text-primary"     // títulos
className="text-secondary"   // descripciones
className="text-error"       // errores
```

### **Estructura de Directorios**
```
src/app/components/
├── shared/
│   └── SuccessErrorModal.jsx     # ✅ Siempre importar
├── [feature]/
│   └── FeatureModal.jsx          # Tu modal aquí
└── contexts/
    └── ThemeContext.jsx          # ✅ Siempre usar
```

---

**🎯 Conclusión:** Siguiendo este estándar actualizado basado en los 42+ modales existentes, garantizarás consistencia, mantenibilidad y las mejores prácticas en todo el proyecto AMMS.
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

### 5. **Estilos Parametrizables con el Sistema de Temas**

Los modales deben seguir las reglas globales del sistema de temas para que sean **100% parametrizables**:

- **Usar siempre** clases temáticas definidas en `theme.css` (`card-theme`, `modal-theme`, `btn-theme`, `input-theme`, `text-*`, `bg-*`, `border-*`).
- **Nunca** usar colores fijos como `bg-white`, `text-gray-900`, `bg-blue-500`, `border-gray-200`, etc.
- Recordar la regla de la guía de estilo: *"Usa siempre los colores estilos de los temas, para que sean parametrizable"*.

```jsx
<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
  <div className="modal-theme card-theme rounded-theme-lg w-full max-w-4xl max-h-[95vh] overflow-hidden">
    {/* Header temático */}
    <div className="flex items-center justify-between p-6 border-b border-primary">
      <h2 className="text-2xl font-bold text-primary">Título del modal</h2>
      <button
        onClick={onClose}
        className="p-2 hover:bg-hover rounded-full transition-colors"
        aria-label="Cerrar modal"
      >
        <FiX className="w-6 h-6 text-secondary" />
      </button>
    </div>

    {/* Contenido scrollable */}
    <div className="flex-1 overflow-y-auto max-h-[calc(95vh-90px)] bg-surface">
      {/* Campos e información del modal */}
    </div>
  </div>
</div>
```

#### 5.1. Colores de estados usando clases temáticas

En vez de devolver clases con colores fijos, se deben usar las clases **semánticas** del tema (`bg-success`, `bg-warning`, `bg-error`, `text-success`, `text-error`, etc.).

```jsx
// ❌ NO usar colores fijos
const getStatusColorById = (id, type = "status") => {
  if (type === "client") {
    switch (id) {
      case 1: return "bg-green-100 text-green-800";
      case 2: return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }
  return "bg-gray-100 text-gray-800";
};

// ✅ Sí usar clases del tema (parametrizables)
const getStatusThemeClassesById = (id, type = "status") => {
  if (type === "client") {
    switch (id) {
      case 1: return "bg-success text-success";      // Activo
      case 2: return "bg-error text-error";          // Inactivo
      default: return "bg-surface text-secondary";
    }
  }

  if (type === "request") {
    switch (id) {
      case 13: return "bg-success text-success";     // Finalizada
      case 14: return "bg-accent text-primary";      // En proceso
      case 15: return "bg-error text-error";         // Cancelada
      case 16: return "bg-warning text-warning";     // Pendiente
      default: return "bg-surface text-secondary";
    }
  }

  return "bg-surface text-secondary";
};

// Uso en el modal
const status = getStatusById(item.status_id, statuses);

<span
  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    getStatusThemeClassesById(item.status_id, "request")
  }`}
>
  {status?.name || "N/A"}
</span>
```

#### 5.2. Uso de `useTheme` y variables CSS

Para casos avanzados donde el modal necesite estilos muy específicos (por ejemplo, un color de acento propio del módulo), se puede combinar el sistema de temas con variables CSS.

```jsx
import { useTheme } from "@/contexts/ThemeContext";

const ExampleThemedModal = ({ isOpen, onClose }) => {
  const { currentTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        className="modal-theme card-theme rounded-theme-lg max-w-3xl w-full"
        style={{
          // Ejemplo: variable CSS derivada del tema actual
          "--modal-accent": currentTheme.colors?.custom || "#000000",
        }}
      >
        {/* Contenido del modal */}
      </div>
    </div>
  );
};
```

**Regla general:** todo color o estilo que deba poder cambiarse desde la parametrización debe provenir del sistema de temas (`THEME_SYSTEM_README.md`) o de variables CSS derivadas de `currentTheme`, **nunca** de clases Tailwind con colores fijos.

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
