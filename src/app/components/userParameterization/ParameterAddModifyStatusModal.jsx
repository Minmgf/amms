"use client";
import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const ParameterAddModifyStatusModal = ({ 
  isOpen, 
  onClose, 
  parameter = null,
  onSave,
  mode = null // Add mode prop to determine if it's add or edit
}) => {
  const [formData, setFormData] = useState({
    category: 'Machinery Types',
    typeName: '',
    description: '',
    isActive: true
  });

  // Determine the mode based on parameter prop
  const currentMode = mode || (parameter ? 'edit' : 'add');

  // Cargar datos cuando se abre el modal o cambia el parámetro
  useEffect(() => {
    if (parameter) {
      setFormData({
        category: 'Machinery Types',
        typeName: parameter.name || '',
        description: parameter.description || '',
        isActive: parameter.isActive ?? true
      });
    } else {
      // Reset form for add mode
      setFormData({
        category: 'Machinery Types',
        typeName: '',
        description: '',
        isActive: true
      });
    }
  }, [parameter, isOpen]);

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
    if (formData.typeName.trim() && formData.description.trim()) {
      onSave({
        ...parameter,
        name: formData.typeName,
        description: formData.description,
        isActive: formData.isActive
      });
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setFormData({
      category: 'Machinery Types',
      typeName: '',
      description: '',
      isActive: true
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md md:max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-base md:text-lg font-medium text-gray-900">
            {currentMode === 'add' ? 'Add parameter' : 'Modify parameter'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          {/* First Row - Category and Type name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                disabled
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
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
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder=""
                required
              />
            </div>
          </div>

          {/* Second Row - Description and Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 md:mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder=""
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-center h-full">
                <label className="block text-sm font-medium text-gray-700 mr-4">
                  Activate/Deactivate
                </label>
                <button
                  type="button"
                  onClick={handleToggleChange}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formData.isActive ? 'bg-red-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      formData.isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Update Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition-colors font-medium"
            >
              {currentMode === 'add' ? 'Save' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParameterAddModifyStatusModal;