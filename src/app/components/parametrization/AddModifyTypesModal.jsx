"use client";
import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

const AddModifyTypesModal = ({
  isOpen,
  onClose,
  mode = "add",
  status = null,
  category = "Machinery Status",
  onSave,
}) => {
  const [formData, setFormData] = useState({
    category: category,
    typeName: "",
    description: "",
    isActive: true,
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mode === "modify" && status) {
      setFormData({
        category: category,
        typeName: status.typeName || "",
        description: status.description || "",
        isActive: status.status === "Active" || status.isActive === true,
      });
    } else {
      setFormData({
        category: category,
        typeName: "",
        description: "",
        isActive: true,
      });
    }
    // Limpiar errores cuando se abre el modal
    setError(null);
  }, [status, mode, category, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpiar error cuando el usuario hace cambios
    if (error) setError(null);
  };

  const handleSave = async () => {
    // Validación básica
    if (!formData.typeName.trim()) {
      setError("Type name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (mode === "modify") {
        // Preparar datos para modificación
        const updatedData = {
          typeName: formData.typeName.trim(),
          description: formData.description.trim(),
          isActive: formData.isActive,
        };

        console.log("Updating status parameter:", updatedData);

        if (onSave) {
          await onSave(updatedData);
        }
      } else {
        // Preparar datos para creación
        const newData = {
          typeName: formData.typeName.trim(),
          description: formData.description.trim(),
          isActive: formData.isActive,
        };

        console.log("Adding status parameter:", newData);

        if (onSave) {
          await onSave(newData);
        }
      }

      // Solo cerrar el modal si todo salió bien
      onClose();
    } catch (err) {
      console.error("Error saving type:", err);
      setError(`Error ${mode === "add" ? "creating" : "updating"} type: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const isAddMode = mode === "add";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {isAddMode ? "Add parameter" : "Modify parameter"}
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
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4 sm:space-y-6">
            {/* First Row - Category and Type name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 focus:outline-none"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type name *
                </label>
                <input
                  type="text"
                  value={formData.typeName}
                  onChange={(e) =>
                    handleInputChange("typeName", e.target.value)
                  }
                  disabled={saving}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter type name"
                />
              </div>
            </div>

            {/* Second Row - Description and Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  disabled={saving}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activate/Deactivate
                </label>
                <div className="mt-1 sm:mt-0">
                  <button
                    onClick={() =>
                      handleInputChange("isActive", !formData.isActive)
                    }
                    disabled={saving}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      formData.isActive ? "bg-red-500" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isActive ? "translate-x-6" : "translate-x-1"
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
            disabled={saving || !formData.typeName.trim()}
            className="bg-black text-white px-6 sm:px-8 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isAddMode ? "Saving..." : "Updating..."}
              </span>
            ) : (
              isAddMode ? "Save" : "Update"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddModifyTypesModal;