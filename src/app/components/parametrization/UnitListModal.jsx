"use client";
import React, { useState, useEffect } from 'react';
import { FiX, FiEdit3 } from 'react-icons/fi';
import { toggleUnitStatus } from '@/services/parametrizationService';

const UnitListModal = ({ 
  isOpen, 
  onClose, 
  categoryName = 'Weight',
  data = [], // Lista de parámetros existentes
  onAddParameter,
  onEditParameter,
  onReloadData // ← NUEVA PROP para recargar datos
}) => {
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(false);

  // Reset form cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      // Usar solo los datos que vienen del props, sin fallback a datos mock
      setParameters(data);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, data]);

  const handleAddParameter = () => {
    if (onAddParameter) {
      onAddParameter();
    }
  };

  const handleEditParameter = (parameterId) => {
    if (onEditParameter) {
      onEditParameter(parameterId);
    }
  };

  // ← NUEVA FUNCIÓN para toggle de estado
  const handleToggleStatus = async (unitId) => {
    try {
      setLoading(true);
      console.log(`🔄 Toggling status for unit ID: ${unitId}`);
      
      const response = await toggleUnitStatus(unitId);
      console.log('✅ Status toggled successfully:', response);
      
      // Actualizar el estado local optimistamente
      setParameters(prevParams => 
        prevParams.map(param => 
          param.id === unitId 
            ? { 
                ...param, 
                status: param.status === 'Activo' ? 'Inactivo' : 'Activo'
              }
            : param
        )
      );
      
      // Recargar datos desde el componente padre si está disponible
      if (onReloadData) {
        await onReloadData();
      }
      
    } catch (error) {
      console.error('❌ Error toggling unit status:', error);
      // Aquí podrías mostrar un toast de error
    } finally {
      setLoading(false);
    }
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
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            <span className="font-normal text-gray-600">Category:</span> {categoryName}
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
          {/* Parameter Table */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden mb-6">
            {parameters.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                        Unit name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                        Symbol
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                        Value
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parameters.map((parameter) => (
                      <tr key={parameter.id} className="hover:bg-gray-50 group">
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                          {parameter.unitName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200 text-center">
                          {parameter.symbol}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200">
                          {parameter.value}
                        </td>
                        <td className="px-4 py-3 text-sm border-r border-gray-200">
                          <button
                            onClick={() => handleToggleStatus(parameter.id)}
                            disabled={loading}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                              parameter.status === 'Activo' || parameter.status === 'Active' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {parameter.status === 'Activo' || parameter.status === 'Active' ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => handleEditParameter(parameter.id)}
                            className="invisible group-hover:visible inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors"
                          >
                            <FiEdit3 className="w-3 h-3 mr-1.5" />
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No parameters added yet
              </div>
            )}
          </div>

          {/* Add Parameter Button */}
          <div className="flex justify-center">
            <button
              onClick={handleAddParameter}
              className="px-8 py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Add Parameter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitListModal;