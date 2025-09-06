"use client";
import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const UnitFormModal = ({ 
  isOpen, 
  onClose, 
  mode = 'add', // 'add' or 'edit'
  categoryName = 'Weight',
  unitData = null, // Para modo edit
  onSave,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    typeName: '',
    symbol: '',
    value: '',
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [typeNameExists, setTypeNameExists] = useState(false);

  // Reset form cuando se abre/cierra el modal o cambia el modo
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && unitData) {
        setFormData({
          typeName: unitData.unitName || unitData.typeName || '',
          symbol: unitData.symbol || '',
          value: unitData.value || '',
          isActive: unitData.status === 'Active'
        });
      } else {
        // Modo add - resetear form
        setFormData({
          typeName: '',
          symbol: '',
          value: '',
          isActive: true
        });
      }
      setErrors({});
      setTypeNameExists(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, mode, unitData]);

  // Simular validación de nombre existente
  useEffect(() => {
    if (formData.typeName && formData.typeName.toLowerCase() === 'ton') {
      setTypeNameExists(true);
    } else {
      setTypeNameExists(false);
    }
  }, [formData.typeName]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleToggleActive = () => {
    setFormData(prev => ({
      ...prev,
      isActive: !prev.isActive
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.typeName.trim()) {
      newErrors.typeName = 'Please enter a type name';
    }

    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Please enter a symbol';
    }

    if (!formData.value.trim()) {
      newErrors.value = 'Please enter a value';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const submitData = {
      id: unitData?.id || Date.now(), // Generar ID si es nuevo
      unitName: formData.typeName,
      typeName: formData.typeName,
      symbol: formData.symbol,
      value: formData.value,
      status: formData.isActive ? 'Active' : 'Inactive',
      category: categoryName
    };

    if (mode === 'edit' && onUpdate) {
      onUpdate(submitData);
    } else if (mode === 'add' && onSave) {
      onSave(submitData);
    }

    // Cerrar modal después de enviar
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEscapeKey = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'edit' ? 'Modify Unit' : 'Add Unit'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                value={categoryName}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Type Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Type name
              </label>
              <input
                type="text"
                value={formData.typeName}
                onChange={(e) => handleInputChange('typeName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.typeName || (typeNameExists && mode === 'add')
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Enter type name"
              />
              {errors.typeName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <span className="text-red-500 mr-1">⚠</span>
                  {errors.typeName}
                </p>
              )}
              {typeNameExists && mode === 'add' && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <span className="text-red-500 mr-1">⚠</span>
                  This type name already exists for this category
                </p>
              )}
            </div>

            {/* Symbol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Symbol
              </label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => handleInputChange('symbol', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.symbol
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Enter symbol"
              />
              {errors.symbol && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <span className="text-red-500 mr-1">⚠</span>
                  {errors.symbol}
                </p>
              )}
            </div>

            {/* Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Value
              </label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => handleInputChange('value', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.value
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Enter value"
              />
              {errors.value && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <span className="text-red-500 mr-1">⚠</span>
                  {errors.value}
                </p>
              )}
            </div>

            {/* Activate/Deactivate Toggle */}
            <div className="flex items-center justify-between md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Activate/Deactivate
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={handleToggleActive}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                    formData.isActive ? 'bg-red-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={!formData.typeName.trim() || !formData.symbol.trim() || !formData.value.trim() || (typeNameExists && mode === 'add')}
              className="px-8 py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {mode === 'edit' ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitFormModal;