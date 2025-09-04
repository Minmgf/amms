"use client";
import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const ParameterModifyUnitModal = ({ isOpen, onClose, unit, onSave }) => {
  const [formData, setFormData] = useState({
    category: 'Weight',
    typeName: '',
    symbol: '',
    value: '',
    isActive: true
  });

  useEffect(() => {
    if (unit) {
      setFormData({
        category: 'Weight',
        typeName: unit.unitName || '',
        symbol: unit.symbol || '',
        value: unit.value || '',
        isActive: unit.status === 'Active'
      });
    }
  }, [unit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleChange = () => {
    setFormData(prev => ({
      ...prev,
      isActive: !prev.isActive
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Crear objeto con los datos actualizados
    const updatedUnit = {
      ...unit,
      unitName: formData.typeName,
      symbol: formData.symbol,
      value: formData.value,
      status: formData.isActive ? 'Active' : 'Inactive'
    };

    console.log('Updating unit:', updatedUnit);
    
    // Llamar la función onSave si existe
    if (onSave) {
      onSave(updatedUnit);
    }
    
    // Cerrar el modal
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Modify Unit
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Row 1: Category and Type name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-700 cursor-not-allowed"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type name
              </label>
              <input
                type="text"
                name="typeName"
                value={formData.typeName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Row 2: Symbol and Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Symbol
              </label>
              <input
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value
              </label>
              <input
                type="text"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Toggle */}
          <div className="pt-4">
            <div className="flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700 mr-3">
                Activate/Deactivate
              </span>
              <button
                type="button"
                onClick={handleToggleChange}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                  formData.isActive ? 'bg-red-500' : 'bg-gray-300'
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

          {/* Update Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              className="px-8 py-2.5 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParameterModifyUnitModal;