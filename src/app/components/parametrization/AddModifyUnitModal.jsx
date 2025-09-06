"use client";
import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const AddModifyUnitModal = ({ isOpen, onClose, mode = 'add', unit = null, category = 'Weight', onSave }) => {
  const [formData, setFormData] = useState({
    category: category,
    typeName: '',
    symbol: '',
    value: '',
    isActive: true
  });

  useEffect(() => {
    if (mode === 'modify' && unit) {
      setFormData({
        category: category,
        typeName: unit.unitName || unit.typeName || '',
        symbol: unit.symbol || '',
        value: unit.value || '',
        isActive: unit.status === 'Active' || unit.isActive === true
      });
    } else {
      setFormData({
        category: category,
        typeName: '',
        symbol: '',
        value: '',
        isActive: true
      });
    }
  }, [unit, mode, category]);

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
    
    if (mode === 'modify') {
      const updatedUnit = {
        ...unit,
        unitName: formData.typeName,
        typeName: formData.typeName,
        symbol: formData.symbol,
        value: formData.value,
        status: formData.isActive ? 'Active' : 'Inactive',
        isActive: formData.isActive
      };

      console.log('Updating parameter:', updatedUnit);
      
      if (onSave) {
        onSave(updatedUnit);
      }
    } else {
      const newUnit = {
        typeName: formData.typeName,
        symbol: formData.symbol,
        value: formData.value,
        status: formData.isActive ? 'Active' : 'Inactive',
        isActive: formData.isActive,
        category: formData.category
      };

      console.log('Adding parameter:', newUnit);
      
      if (onSave) {
        onSave(newUnit);
      }
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-medium text-gray-900">
            {mode === 'modify' ? 'Modify Unit' : 'Add Unit'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-6">
          {/* Row 1: Category and Type name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-700 cursor-not-allowed"
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
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder=""
                required
              />
            </div>
          </div>

          {/* Row 2: Symbol and Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Symbol
              </label>
              <input
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder=""
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
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder=""
              />
            </div>
          </div>

          {/* Row 3: Toggle */}
          <div className='flex justify-center items-center space-x-4 mb-6'>
            <span className="text-sm font-medium text-gray-700">
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

          {/* Action Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-12 py-2.5 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              {mode === 'modify' ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddModifyUnitModal;