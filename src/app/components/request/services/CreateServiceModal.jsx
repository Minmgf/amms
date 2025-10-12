"use client";

import React, { useState, useEffect } from "react";
import { FiX, FiSave } from "react-icons/fi";
import { createService, getServiceTypes, getCurrencyUnits } from "@/services/serviceService";

export default function CreateServiceModal({ isOpen, onClose, onCreated }) {
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
      const [typesData, unitsData] = await Promise.all([
        getServiceTypes(),
        getCurrencyUnits()
      ]);
      
      setServiceTypes(typesData || []);
      setCurrencyUnits(unitsData || []);
    } catch (error) {
      console.error("Error loading initial data:", error);
      setErrors({
        general: "Error al cargar los datos iniciales"
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
      <div className="modal-theme rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-primary">
            Crear Nuevo Servicio
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre del servicio */}
            <div className="md:col-span-2">
              <label htmlFor="service_name" className="block text-sm font-medium text-primary mb-2">
                Nombre del Servicio *
              </label>
              <input
                type="text"
                id="service_name"
                name="service_name"
                value={formData.service_name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${
                  errors.service_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: Mantenimiento Preventivo"
                disabled={loading || loadingData}
              />
              {errors.service_name && (
                <p className="mt-1 text-sm text-red-600">{errors.service_name}</p>
              )}
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-primary mb-2">
                Descripción *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Descripción del servicio..."
                disabled={loading || loadingData}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Tipo de servicio */}
            <div>
              <label htmlFor="service_type" className="block text-sm font-medium text-primary mb-2">
                Tipo de Servicio *
              </label>
              <select
                id="service_type"
                name="service_type"
                value={formData.service_type}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${
                  errors.service_type ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading || loadingData}
              >
                <option value="">Seleccionar tipo...</option>
                {serviceTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {errors.service_type && (
                <p className="mt-1 text-sm text-red-600">{errors.service_type}</p>
              )}
            </div>

            {/* Precio base */}
            <div>
              <label htmlFor="base_price" className="block text-sm font-medium text-primary mb-2">
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
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${
                  errors.base_price ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
                disabled={loading || loadingData}
              />
              {errors.base_price && (
                <p className="mt-1 text-sm text-red-600">{errors.base_price}</p>
              )}
            </div>

            {/* Unidad de precio */}
            <div>
              <label htmlFor="price_unit" className="block text-sm font-medium text-primary mb-2">
                Unidad de Precio *
              </label>
              <select
                id="price_unit"
                name="price_unit"
                value={formData.price_unit}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${
                  errors.price_unit ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading || loadingData}
              >
                <option value="">Seleccionar unidad...</option>
                {currencyUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} ({unit.code})
                  </option>
                ))}
              </select>
              {errors.price_unit && (
                <p className="mt-1 text-sm text-red-600">{errors.price_unit}</p>
              )}
            </div>

            {/* Impuesto aplicable */}
            <div>
              <label htmlFor="applicable_tax" className="block text-sm font-medium text-primary mb-2">
                Impuesto Aplicable *
              </label>
              <input
                type="number"
                id="applicable_tax"
                name="applicable_tax"
                value={formData.applicable_tax}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${
                  errors.applicable_tax ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
                disabled={loading || loadingData}
              />
              {errors.applicable_tax && (
                <p className="mt-1 text-sm text-red-600">{errors.applicable_tax}</p>
              )}
            </div>

            {/* Tasa de impuesto */}
            <div>
              <label htmlFor="tax_rate" className="block text-sm font-medium text-primary mb-2">
                Tasa de Impuesto (%) *
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
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${
                  errors.tax_rate ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
                disabled={loading || loadingData}
              />
              {errors.tax_rate && (
                <p className="mt-1 text-sm text-red-600">{errors.tax_rate}</p>
              )}
            </div>

            {/* Exento de IVA */}
            <div className="md:col-span-2">
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
                  disabled={loading || loadingData}
                />
                <span className="text-sm font-medium text-primary">
                  Exento de IVA
                </span>
              </label>
            </div>
          </div>

          {/* Error general */}
          {errors.general && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{errors.general}</p>
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
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading || loadingData}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || loadingData}
              className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  Crear Servicio
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}