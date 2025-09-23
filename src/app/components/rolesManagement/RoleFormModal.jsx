"use client";
import React from "react";
import { FiX } from "react-icons/fi";

import { useRoleForm } from "./hooks/useRoleForm";
import { usePermissions } from "./hooks/usePermissions";
import PermissionManager from "./PermissionManager";

const RoleFormModal = ({
    isOpen,
    onClose,
    mode = "add",
    roleData = null,
    onSave
}) => {
    const { formData, setFormData, errors, handleInputChange, validateForm } = useRoleForm(isOpen, mode, roleData)
    const permissionsData = usePermissions();

    const handleSubmit = () => {
        if (!validateForm()) return;

        onSave(formData);
        onClose();
    }

    const handleClearOrCancel = () => {
        if (mode === "add") {
            setFormData({
                roleName: "",
                description: "",
                isActive: true,
                permissions: [],
            });
        } else {
            onClose();
        }
    };

    // Cerrar modal al hacer clic fuera del contenido
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            id="role-form-modal"
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-background rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {mode === "edit" ? "Modificar Rol" : mode === "view" ? "Información del Rol" : "Añadir Rol"}
                    </h2>
                    <button
                        area-label="Close Button"
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close modal"
                    >
                        <FiX className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre del rol<span className="text-red-500">*</span>
                            </label>
                            <input
                                area-label="Role Name Input"
                                type="text"
                                value={formData.roleName}
                                disabled={mode === "view"}
                                onChange={(e) => handleInputChange('roleName', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.roleName
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:border-blue-500'
                                    } ${mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                placeholder="Enter role name"
                            />
                            {errors.roleName && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <span className="text-red-500 mr-1">⚠</span>
                                    {errors.roleName}
                                </p>
                            )}
                        </div>
                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción
                            </label>
                            <textarea
                                area-label="Description Role Textarea"
                                type="text"
                                value={formData.description}
                                disabled={mode === "view"}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                placeholder="Enter description"
                            />
                        </div>

                    </div>
                    {/* Permission Section */}
                    <PermissionManager
                        {...permissionsData}
                        formData={formData}
                        setFormData={setFormData}
                        mode={mode}
                    />
                    {/* Validation Error for permissions */}
                    {errors.permissions && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600 flex items-center">
                                <span className="text-red-500 mr-1">⚠</span>
                                {errors.permissions}
                            </p>
                        </div>
                    )}

                    {/* Footer buttons */}
                    {mode !== "view" && (
                        <div className="flex justify-end mt-6 gap-4">
                            <button
                                area-label="Clean Button"
                                type="button"
                                onClick={handleClearOrCancel}
                                className="btn-error btn-theme px-8 py-2 font-semibold rounded-lg"
                            >
                                {mode === "add" ? "Limpiar" : "Cancelar"}
                            </button>
                            <button
                                area-label="Submit Button"
                                onClick={handleSubmit}
                                className="btn-primary px-8 py-2 font-semibold rounded-lg text-white"
                            >
                                {mode === "add"
                                    ? "Crear Rol"
                                    : "Actualizar Rol"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoleFormModal;