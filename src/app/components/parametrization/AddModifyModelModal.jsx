"use client";
import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { toggleStatusModel } from '@/services/parametrizationService';
import { SuccessModal, ErrorModal } from '../shared/SuccessErrorModal';

const ModelFormModal = ({
  isOpen,
  onClose,
  mode = 'add', // 'add' or 'edit'
  brandName = '',
  modelData = null, // Para modo edit
  onSave,
  onUpdate,
  brandModels = []
}) => {
  const [formData, setFormData] = useState({
    modelName: '',
    description: '',
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [modelNameExists, setModelNameExists] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Reset form cuando se abre/cierra el modal o cambia el modo
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && modelData) {
        setFormData({
          id: modelData.id_model,
          modelName: modelData.modelName || '',
          description: modelData.description || '',
          isActive: modelData.status === 'Active' || modelData.isActive !== false
        });
      } else {
        // Modo add - resetear form
        setFormData({
          modelName: '',
          description: '',
          isActive: true
        });
      }
      setErrors({});
      setModelNameExists(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, mode, modelData]);

  // Validación de nombre de modelo existente
  useEffect(() => {
    if (!formData.modelName) {
      setModelNameExists(false);
      return;
    }

    const exists = (brandModels || []).some(
      m => m?.modelName?.toLowerCase() === formData.modelName.toLowerCase() &&
        m.id_model !== modelData?.id_model
    );


    setModelNameExists(exists);
  }, [formData.modelName, brandModels, modelData]);

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

  const handleToggleStatus = async () => {
    if (!formData.id) return;

    try {
      const response = await toggleStatusModel(formData.id);
      setModalMessage(response.message || "Estado actualizado exitosamente");
      setSuccessOpen(true);
      setFormData((prev) => ({
        ...prev,
        isActive: !prev.isActive,
      }));
    } catch (error) {
      setModalMessage(error.response.data.detail || "Error al actualizar el estado");
      setErrorOpen(true);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.modelName.trim()) {
      newErrors.modelName = 'Please enter a name for the new model';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      brand: brandName,
      id: modelData?.id_model
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
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === 'edit' ? 'Modificar modelo' : 'Añadir modelo'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 pb-6">
          {/* Form Grid Layout */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Brand - Left Column */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca
              </label>
              <input
                type="text"
                value={brandName}
                disabled
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Model Name - Right Column */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Modelo
              </label>
              <input
                type="text"
                value={formData.modelName}
                onChange={(e) => handleInputChange('modelName', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.modelName || modelNameExists
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500'
                  }`}
                placeholder="Enter model name"
              />
              {errors.modelName && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <span className="text-red-500 mr-1">⚠</span>
                  {errors.modelName}
                </p>
              )}
              {modelNameExists && mode === 'add' && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <span className="text-red-500 mr-1">⚠</span>
                  Este modelo ya existe para esta marca
                </p>
              )}
            </div>
          </div>

          {/* Description - Full Width */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter description"
              />
            </div>

            {/* Activate/Deactivate Toggle - Right Column */}
            {mode === "edit" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activar/Desactivar
                </label>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleToggleStatus}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${formData.isActive ? 'bg-red-500' : 'bg-gray-200'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Button - Centered */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleSubmit}
              disabled={!formData.modelName.trim() || (mode === 'add' && modelNameExists)}
            className="btn-theme btn-primary not-disabled: w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mode === 'edit' ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Success"
        message={modalMessage}
      />
      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Failed"
        message={modalMessage}
      />
    </div>
  );
};

export default ModelFormModal;