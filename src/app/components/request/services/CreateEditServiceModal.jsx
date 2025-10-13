"use client";

import React, { useState, useEffect } from "react";
import { FiX, FiSave } from "react-icons/fi";
import { createService, getServiceTypes, getCurrencyUnits } from "@/services/serviceService";

const getAuthToken = () => {
  let token = localStorage.getItem("token");
  if (!token) token = sessionStorage.getItem("token");
  return token;
};

export default function CreateEditServiceModal({ 
  isOpen, 
  onClose, 
  onCreated, 
  onUpdated, 
  serviceData, 
  mode = "create" 
}) {
  const [formData, setFormData] = useState({
    service_name: "",
    description: "",
    service_type: "",
    base_price: "",
    price_unit: "",
    applicable_tax: "",
    tax_rate: "",
    is_vat_exempt: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingData, setLoadingData] = useState(false);

  // Opciones para los selectores
  const [serviceTypes, setServiceTypes] = useState([]);
  const [currencyUnits, setCurrencyUnits] = useState([]);

  // Opciones de impuestos
  const taxOptions = [
    { id: 1, name: "19%", rate: 19.0, exempt: false },
    { id: 2, name: "5%", rate: 5.0, exempt: false },
    { id: 3, name: "Exento", rate: 0.0, exempt: true },
  ];

  // Cargar datos del API al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      resetForm();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const token = getAuthToken();
      if (!token) {
        setErrors({
          general: "No se encontró token de autenticación. Por favor, inicie sesión nuevamente."
        });
        return;
      }

      console.log("Loading service types and currency units...");
      
      // Intentar cargar datos del API
      try {
        const [typesData, unitsData] = await Promise.all([
          getServiceTypes(),
          getCurrencyUnits()
        ]);
        
        console.log("Service types response:", typesData);
        console.log("Currency units response:", unitsData);
        
        // Handle different possible response structures
        const types = Array.isArray(typesData) ? typesData : 
                     (typesData?.data ? (Array.isArray(typesData.data) ? typesData.data : []) : []);
        
        const units = Array.isArray(unitsData) ? unitsData : 
                     (unitsData?.data ? (Array.isArray(unitsData.data) ? unitsData.data : []) : []);
        
        console.log("Processed types:", types);
        console.log("Processed units:", units);
        
        setServiceTypes(types);
        setCurrencyUnits(units);
        
        // Si no hay datos del API, usar datos mock
        if (types.length === 0) {
          console.warn("No se encontraron tipos de servicios del API, usando datos mock");
          setServiceTypes([
            { id: 1, name: "Mantenimiento" },
            { id: 2, name: "Reparación" },
            { id: 3, name: "Consultoría" },
            { id: 4, name: "Instalación" }
          ]);
        }
        
        if (units.length === 0) {
          console.warn("No se encontraron unidades del API, usando datos mock");
          setCurrencyUnits([
            { id: 1, name: "Pesos Colombianos", code: "COP" },
            { id: 2, name: "Dólares Americanos", code: "USD" },
            { id: 3, name: "Euros", code: "EUR" }
          ]);
        }
        
      } catch (apiError) {
        console.warn("Error con API, usando datos mock:", apiError);
        
        // Usar datos mock como fallback
        setServiceTypes([
          { id: 1, name: "Mantenimiento" },
          { id: 2, name: "Reparación" },
          { id: 3, name: "Consultoría" },
          { id: 4, name: "Instalación" }
        ]);
        
        setCurrencyUnits([
          { id: 1, name: "Pesos Colombianos", code: "COP" },
          { id: 2, name: "Dólares Americanos", code: "USD" },
          { id: 3, name: "Euros", code: "EUR" }
        ]);
        
        setErrors({
          general: `Usando datos de ejemplo. Error del API: ${apiError.response?.status === 404 ? 'Endpoints no encontrados' : apiError.message}`
        });
      }
      
    } catch (error) {
      console.error("Error loading initial data:", error);
      setErrors({
        general: `Error al cargar los datos iniciales: ${error.message}`
      });
    } finally {
      setLoadingData(false);
    }
  };

  const resetForm = () => {
    setFormData({
      service_name: "",
      description: "",
      service_type: "",
      base_price: "",
      price_unit: "",
      applicable_tax: "",
      tax_rate: "",
      is_vat_exempt: false,
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario comience a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.service_name?.trim()) {
      newErrors.service_name = "El nombre del servicio es requerido";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "La descripción es requerida";
    }

    if (!formData.service_type) {
      newErrors.service_type = "El tipo de servicio es requerido";
    }

    if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
      newErrors.base_price = "El precio base debe ser mayor a 0";
    }

    if (!formData.price_unit) {
      newErrors.price_unit = "La unidad de precio es requerida";
    }

    if (!formData.applicable_tax) {
      newErrors.applicable_tax = "El impuesto aplicable es requerido";
    }

    if (!formData.tax_rate || parseFloat(formData.tax_rate) < 0) {
      newErrors.tax_rate = "La tasa de impuesto debe ser 0 o mayor";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setErrors({
        general: "No se encontró token de autenticación. Por favor, inicie sesión nuevamente."
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const serviceData = {
        service_name: formData.service_name,
        description: formData.description,
        service_type: parseInt(formData.service_type),
        base_price: parseFloat(formData.base_price),
        price_unit: parseInt(formData.price_unit),
        applicable_tax: parseFloat(formData.applicable_tax),
        tax_rate: parseFloat(formData.tax_rate),
        is_vat_exempt: formData.is_vat_exempt
      };

      const response = await createService(serviceData);
      
      console.log("Servicio creado exitosamente:", response);
      
      // Llamar al callback para recargar los datos
      if (onCreated) {
        onCreated();
      }
      
      // Cerrar el modal
      onClose();
      
    } catch (error) {
      console.error("Error al crear el servicio:", error);
      
      if (error.response?.data?.errors) {
        // Manejar errores específicos del servidor
        const serverErrors = {};
        Object.keys(error.response.data.errors).forEach(field => {
          serverErrors[field] = error.response.data.errors[field][0];
        });
        setErrors(serverErrors);
      } else {
        setErrors({
          general: error.response?.data?.message || "Error al crear el servicio. Por favor, intente nuevamente."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-primary">
            {mode === "edit" ? "Editar Servicio" : "Crear Nuevo Servicio"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar modal"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error general */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* General Information Section */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Service ID - Auto generated, read only */}
              <div>
                <label htmlFor="service_id" className="block text-sm font-medium text-gray-700 mb-2">
                  ID del Servicio
                </label>
                <input
                  type="text"
                  id="service_id"
                  name="service_id"
                  value="SVC-2024-0012"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-600 cursor-not-allowed"
                  placeholder="Se generará automáticamente"
                  aria-label="ID del servicio generado automáticamente"
                  disabled
                  readOnly
                />
              </div>

              {/* Service name */}
              <div>
                <label htmlFor="service_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Servicio *
                </label>
                <input
                  type="text"
                  id="service_name"
                  name="service_name"
                  value={formData.service_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-colors ${
                    errors.service_name ? 'ring-2 ring-red-300 bg-red-50' : ''
                  }`}
                  placeholder="Ej: Mantenimiento Preventivo"
                  aria-label="Nombre del servicio"
                  disabled={loading || loadingData}
                />
                {errors.service_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.service_name}</p>
                )}
              </div>

              {/* Description - Full width */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-colors resize-none ${
                    errors.description ? 'ring-2 ring-red-300 bg-red-50' : ''
                  }`}
                  placeholder="Descripción del servicio..."
                  aria-label="Descripción del servicio"
                  disabled={loading || loadingData}
                />
                <div className="mt-1 text-xs text-gray-500">
                  {formData.description?.length || 0}/500 caracteres
                </div>
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Service type */}
              <div className="md:col-span-1">
                <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Servicio *
                </label>
                <select
                  id="service_type"
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-colors appearance-none ${
                    errors.service_type ? 'ring-2 ring-red-300 bg-red-50' : ''
                  }`}
                  aria-label="Tipo de servicio"
                  disabled={loading || loadingData}
                >
                  <option value="">Seleccionar tipo...</option>
                  {serviceTypes.length > 0 ? (
                    serviceTypes.map((type) => (
                      <option key={type.id || type.id_types} value={type.id || type.id_types}>
                        {type.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No hay tipos disponibles</option>
                  )}
                </select>
                {errors.service_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.service_type}</p>
                )}
                {loadingData && (
                  <p className="mt-1 text-sm text-gray-500">Cargando tipos...</p>
                )}
              </div>
            </div>
          </div>

          {/* Commercial Data Section */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos Comerciales</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Base Price */}
              <div>
                <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Base *
                </label>
                <input
                  type="number"
                  id="base_price"
                  name="base_price"
                  value={formData.base_price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-colors ${
                    errors.base_price ? 'ring-2 ring-red-300 bg-red-50' : ''
                  }`}
                  placeholder="0.00"
                  aria-label="Precio base del servicio"
                  disabled={loading || loadingData}
                />
                {errors.base_price && (
                  <p className="mt-1 text-sm text-red-600">{errors.base_price}</p>
                )}
              </div>

              {/* Unit of Measure */}
              <div>
                <label htmlFor="price_unit" className="block text-sm font-medium text-gray-700 mb-2">
                  Unidad de Medida *
                </label>
                <select
                  id="price_unit"
                  name="price_unit"
                  value={formData.price_unit}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-colors appearance-none ${
                    errors.price_unit ? 'ring-2 ring-red-300 bg-red-50' : ''
                  }`}
                  aria-label="Unidad de medida"
                  disabled={loading || loadingData}
                >
                  <option value="">Seleccionar unidad...</option>
                  {currencyUnits.length > 0 ? (
                    currencyUnits.map((unit) => (
                      <option key={unit.id || unit.id_units} value={unit.id || unit.id_units}>
                        {unit.name} {unit.code ? `(${unit.code})` : ''}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No hay unidades disponibles</option>
                  )}
                </select>
                {errors.price_unit && (
                  <p className="mt-1 text-sm text-red-600">{errors.price_unit}</p>
                )}
                {loadingData && (
                  <p className="mt-1 text-sm text-gray-500">Cargando unidades...</p>
                )}
              </div>

              {/* Applicable taxes */}
              <div>
                <label htmlFor="applicable_tax" className="block text-sm font-medium text-gray-700 mb-2">
                  Impuestos Aplicables *
                </label>
                <select
                  id="applicable_tax"
                  name="applicable_tax"
                  value={formData.applicable_tax}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-colors appearance-none ${
                    errors.applicable_tax ? 'ring-2 ring-red-300 bg-red-50' : ''
                  }`}
                  aria-label="Impuestos aplicables"
                  disabled={loading || loadingData}
                >
                  <option value="">Seleccionar impuesto...</option>
                  <option value="19">IVA 19%</option>
                  <option value="5">IVA 5%</option>
                  <option value="0">Exento</option>
                </select>
                {errors.applicable_tax && (
                  <p className="mt-1 text-sm text-red-600">{errors.applicable_tax}</p>
                )}
              </div>

              {/* Tax rate */}
              <div>
                <label htmlFor="tax_rate" className="block text-sm font-medium text-gray-700 mb-2">
                  Tasa de Impuesto *
                </label>
                <input
                  type="number"
                  id="tax_rate"
                  name="tax_rate"
                  value={formData.tax_rate}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className={`w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-colors ${
                    errors.tax_rate ? 'ring-2 ring-red-300 bg-red-50' : ''
                  }`}
                  placeholder="0.00"
                  aria-label="Tasa de impuesto en porcentaje"
                  disabled={loading || loadingData}
                />
                {errors.tax_rate && (
                  <p className="mt-1 text-sm text-red-600">{errors.tax_rate}</p>
                )}
              </div>

              {/* VAT exempt checkbox */}
              <div className="flex items-center">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_vat_exempt"
                    checked={formData.is_vat_exempt}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      is_vat_exempt: e.target.checked
                    }))}
                    className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                    aria-label="Marcar si el servicio está exento de IVA"
                    disabled={loading || loadingData}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Exento de IVA
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Error general */}
          {errors.general && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 text-sm">
                <strong>Información:</strong> {errors.general}
              </p>
            </div>
          )}

          {/* Loading state */}
          {loadingData && (
            <div className="mt-6 flex items-center justify-center py-4">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <span>Cargando datos...</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="md:col-span-2 flex gap-4 mt-8 justify-center">
            <button
              type="button"
              onClick={onClose}
              className="btn-error btn-theme w-40 px-8 py-2 font-semibold rounded-lg"
              disabled={loading || loadingData}
              aria-label={mode === "edit" ? "Cancelar edición del servicio" : "Cancelar creación del servicio"}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || loadingData}
              className="btn-primary w-40 px-8 py-2 font-semibold rounded-lg text-white"
              aria-label={mode === "edit" ? "Actualizar servicio" : "Registrar servicio"}
            >
              {loading ? 
                (mode === "edit" ? "Actualizando..." : "Registrando...") : 
                (mode === "edit" ? "Actualizar" : "Registrar")
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}