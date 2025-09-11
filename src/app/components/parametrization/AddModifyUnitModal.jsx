"use client";
import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { getActiveDataTypes, createUnits, updateUnit } from '@/services/parametrizationService';

const AddModifyUnitModal = ({ isOpen, onClose, mode = 'add', unit = null, category = 'Weight', categoryId = 1, onSave }) => {
  const [formData, setFormData] = useState({
    category: category,
    typeName: '',
    symbol: '',
    value: '',
    unitType: '',
    isActive: true
  });

  const [dataTypes, setDataTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar tipos de datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      fetchDataTypes();
    }
  }, [isOpen]);

  const fetchDataTypes = async () => {
    try {
      setLoading(true);
      const response = await getActiveDataTypes();
      console.log('📊 Data types response:', response);
      
      // La respuesta puede ser directamente un array o tener una propiedad data
      const typesArray = Array.isArray(response) ? response : (response.data || []);
      setDataTypes(typesArray);
    } catch (err) {
      console.error('❌ Error fetching data types:', err);
      setError('Error loading data types');
      setDataTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'modify' && unit) {
      setFormData({
        category: category,
        typeName: unit.unitName || unit.typeName || '',
        symbol: unit.symbol || '',
        value: unit.value || '',
        unitType: unit.unitType || '',
        isActive: unit.status === 'Active' || unit.isActive === true
      });
    } else {
      setFormData({
        category: category,
        typeName: '',
        symbol: '',
        value: '',
        unitType: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (mode === 'modify') {
        // Actualizar unidad existente usando la API
        const payload = {
          name: formData.typeName,
          symbol: formData.symbol,
          unit_type: parseInt(formData.unitType),
          responsible_user: 1
        };

        console.log('🔄 Updating unit with payload:', payload);
        
        const response = await updateUnit(unit.id, payload);
        console.log('✅ Unit updated successfully:', response);
        
        // Cerrar el modal primero
        onClose();
        
        // Luego notificar al componente padre para recargar datos
        if (onSave) {
          await onSave({ success: true, message: response.message });
        }
      } else {
        // Crear nueva unidad usando la API
        const payload = {
          name: formData.typeName,
          symbol: formData.symbol,
          units_category: categoryId,
          unit_type: parseInt(formData.unitType),
          estado: formData.isActive ? 'Activo' : 'Inactivo', // ← AGREGAR ESTADO
          responsible_user: 1 // TODO: Obtener del contexto de usuario
        };

        console.log('📦 Creating unit with payload:', payload);
        
        const response = await createUnits(payload);
        console.log('✅ Unit created successfully:', response);
        
        // Cerrar el modal primero
        onClose();
        
        // Luego notificar al componente padre para recargar datos
        if (onSave) {
          await onSave({ success: true, message: response.message });
        }
      }
      
    } catch (err) {
      console.error('❌ Error saving unit:', err);
      
      // Manejar errores específicos de la API
      if (mode === 'add') {
        // Solo validar estos campos en modo "add"
        if (err.response?.data?.units_category) {
          setError(`Category error: ${err.response.data.units_category[0]}`);
        } else if (err.response?.data?.estado) {
          setError(`Status error: ${err.response.data.estado[0]}`);
        } else if (err.response?.data?.unit_type) {
          setError(`Unit type error: ${err.response.data.unit_type[0]}`);
        } else {
          setError(err.message || 'Error creating unit');
        }
      } else {
        // En modo "modify" solo validar campos básicos
        if (err.response?.data?.unit_type) {
          setError(`Unit type error: ${err.response.data.unit_type[0]}`);
        } else {
          setError(err.message || 'Error updating unit');
        }
      }
    }
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
                placeholder="kg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value (Type)
              </label>
              {loading ? (
                <div className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm text-gray-500">
                  Loading types...
                </div>
              ) : (
                <select
                  name="unitType"
                  value={formData.unitType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a type</option>
                  {dataTypes.map(type => (
                    <option key={type.id_types || type.id} value={type.id_types || type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

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
            className="btn-theme btn-primary not-disabled: w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
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