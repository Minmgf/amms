"use client";
import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { toggleTypeStatus } from '@/services/parametrizationService';
import { SuccessModal, ErrorModal } from '@/app/components/shared/SuccessErrorModal';

const AddModifyTypesModal = ({
  isOpen,
  onClose,
  mode = "add",
  status = null,
  category = "Machinery Status",
  onSave,
  existingNames = [], // Nueva prop para validación
}) => {
  const [formData, setFormData] = useState({
    category: category,
    typeName: "",
    description: "",
    isActive: true,
  });

  const [saving, setSaving] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (mode === "modify" && status) {
      setFormData({
        category: category,
        typeName: status.typeName || "",
        description: status.description || "",
        isActive: status.id_statues === 1 || status.status === "Active" || status.isActive === true,
      });
    } else {
      setFormData({
        category: category,
        typeName: "",
        description: "",
        isActive: true,
      });
    }
    setNameError("");
  }, [status, mode, category, isOpen]);

  const validateTypeName = (name) => {
    if (!name.trim()) {
      setNameError("");
      return false;
    }

    const normalizedName = name.trim().toLowerCase();
    const isDuplicate = existingNames.some(existingName => {
      if (mode === "modify" && status && existingName.toLowerCase() === status.typeName.toLowerCase()) {
        return false; // Ignore current item name in edit mode
      }
      return existingName.toLowerCase() === normalizedName;
    });

    if (isDuplicate) {
      setNameError("El nombre de este tipo ya existe");
      return false;
    }

    setNameError("");
    return true;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "typeName") {
      validateTypeName(value);
    }
  };

  const handleToggleChange = async () => {
    if (mode === "modify" && status?.id) {
      try {
        setSaving(true);

        const response = await toggleTypeStatus(status.id);

        setFormData(prev => ({
          ...prev,
          isActive: !prev.isActive
        }));

        if (onSave) {
          await onSave({ success: true, message: response.message, statusChanged: true });
        }

      } catch (error) {
        setModalMessage(error.response?.data?.message || error.message || "Error changing status");
        setErrorOpen(true);
      } finally {
        setSaving(false);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        isActive: !prev.isActive
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.typeName.trim()) {
      return;
    }

    if (!validateTypeName(formData.typeName)) {
      return;
    }

    setSaving(true);

    try {
      if (mode === "modify") {
        const updatedData = {
          typeName: formData.typeName.trim(),
          description: formData.description.trim(),
          isActive: formData.isActive,
        };

        if (onSave) {
          await onSave(updatedData);
        }
      } else {
        const newData = {
          typeName: formData.typeName.trim(),
          description: formData.description.trim(),
          isActive: formData.isActive,
        };

        if (onSave) {
          await onSave(newData);
        }
      }

      onClose();
    } catch (err) {
      throw err;
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const isAddMode = mode === "add";
  const hasNameError = !!nameError;
  const isFormValid = formData.typeName.trim() && !hasNameError;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {isAddMode ? "Añadir parámetro" : "Modificar parámetro"}
          </h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          {/* Form Fields */}
          <div className="space-y-4 sm:space-y-6">
            {/* First Row - Category and Type name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black focus:outline-none"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre tipo *
                </label>
                <input
                  type="text"
                  value={formData.typeName}
                  onChange={(e) =>
                    handleInputChange("typeName", e.target.value)
                  }
                  disabled={saving}
                  className={`w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${hasNameError ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="Ingrese el nombre de un tipo"
                />
                {hasNameError && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center text-red-600 text-sm">
                      <span className="inline-flex items-center justify-center w-4 h-4 mr-2 bg-red-600 rounded-full flex-shrink-0">
                        <span className="text-white text-xs">!</span>
                      </span>
                      {nameError}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Second Row - Description and Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  disabled={saving}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activar/Desactivar
                </label>
                <div className="mt-1 sm:mt-0">
                  <button
                    type="button"
                    onClick={handleToggleChange}
                    disabled={saving}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${formData.isActive ? "bg-red-500" : "bg-gray-200"
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleSave}
            disabled={saving || !isFormValid}
            className="btn-theme btn-primary not-disabled: w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isAddMode ? "Guardando..." : "Actualizando..."}
              </span>
            ) : (
              isAddMode ? "Guardar" : "Actualizar"
            )}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        message={modalMessage}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        message={modalMessage}
      />
    </div>
  );
};

export default AddModifyTypesModal;