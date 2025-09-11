"use client";
import React, { useState, useEffect } from 'react';
import { FiX, FiEdit3 } from 'react-icons/fi';
import { toggleStatusBrand } from '@/services/parametrizationService';
import { SuccessModal, ErrorModal } from '../shared/SuccessErrorModal';

const BrandFormModal = ({
    isOpen,
    onClose,
    mode = 'add', // 'add' or 'edit'
    categoryName = '',
    brandData = null, // Para modo edit
    onSave,
    onUpdate,
    onAddModel, // Nueva prop para agregar modelo
    onEditModel, // Nueva prop para editar modelo
    onStatusChanged
}) => {
    const [formData, setFormData] = useState({
        brandName: '',
        description: '',
        isActive: true
    });

    const [models, setModels] = useState([]);

    const [errors, setErrors] = useState({});
    const [brandNameExists, setBrandNameExists] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    useEffect(() => {
        if (!isOpen) {
            // cada vez que se cierra, reseteamos el flag
            setHasInitialized(false);
            return;
        }

        if (mode === "edit" && brandData) {
            setFormData({
                id: brandData.id,
                brandName: brandData.brandName || "",
                description: brandData.description || "",
                isActive: !!brandData.isActive,
            });
            setModels(brandData.models || []);
            setHasInitialized(true);
        }

        if (mode === "add" && !hasInitialized) {
            // solo la primera vez que abro en add
            setFormData({
                brandName: "",
                description: "",
                isActive: true,
            });
            setModels([]);
            setHasInitialized(true);
        }
    }, [isOpen, mode, brandData, hasInitialized]);




    // Actualizar lista de modelos cuando brandData cambie (para reflejar cambios desde ModelFormModal)
    useEffect(() => {
        if (brandData && brandData.models) {
            setModels(brandData.models);
        }
    }, [brandData]);

    // Validación de nombre existente
    useEffect(() => {
        if (!brandData || !brandData.models) return;

        const exists = brandData.models.some(
            m => m.modelName?.toLowerCase() === formData.brandName.trim().toLowerCase()
        );

        setBrandNameExists(exists);
    }, [formData.brandName, brandData]);

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
            const response = await toggleStatusBrand(formData.id);
            setModalMessage(response.message || "Estado actualizado exitosamente");
            setSuccessOpen(true);
            setFormData((prev) => ({
                ...prev,
                isActive: !prev.isActive,
            }));
            onStatusChanged(formData.id);
        } catch (error) {
            setModalMessage(error.response.data.detail || "Error al actualizar el estado");
            setErrorOpen(true);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.brandName.trim()) {
            newErrors.brandName = 'Please enter a name for the new role';
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
            models: models,
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

    const handleAddModel = () => {
        if (onAddModel) {
            onAddModel();
        }
    };

    const handleEditModel = (modelId) => {
        if (onEditModel) {
            onEditModel(modelId);
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
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {mode === 'edit' ? 'Modify brand' : 'Add brand'}
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

                        {/* Brand Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <span className="text-red-500">*</span> Brand name
                            </label>
                            <input
                                type="text"
                                value={formData.brandName}
                                onChange={(e) => handleInputChange('brandName', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.brandName || brandNameExists
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:border-blue-500'
                                    }`}
                                placeholder="Enter brand name"
                            />
                            {errors.brandName && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <span className="text-red-500 mr-1">⚠</span>
                                    {errors.brandName}
                                </p>
                            )}
                            {brandNameExists && mode === 'add' && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <span className="text-red-500 mr-1">⚠</span>
                                    This brand name already exist for this category
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter description"
                            />
                        </div>

                        {/* Activate/Deactivate Toggle */}
                        {mode === "edit" && (
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-700">
                                    Activate/Deactivate
                                </label>
                                <div className="relative">
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

                    {/* Model List Section */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Model list</h3>

                        {/* Model Table */}
                        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden mb-4">
                            {models.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-100 border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                                                    Model
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                                                    Description
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {models.map((model) => (
                                                <tr key={model.id_model} className="hover:bg-gray-50 group">
                                                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                                                        {model.modelName}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200">
                                                        {model.description}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <button
                                                            onClick={() => handleEditModel(model.id_model)}
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
                                    No models added yet
                                </div>
                            )}
                        </div>

                        {/* Add Model Button */}
                        <button
                            onClick={handleAddModel}
                            className="px-6 py-2 btn-theme btn-secondary text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Add model
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={!formData.brandName.trim() || brandNameExists}
                            className="px-8 py-3 btn-theme btn-primary text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {mode === 'edit' ? 'Update' : 'Save'}
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
export default BrandFormModal;