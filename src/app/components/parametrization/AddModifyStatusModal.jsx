"use client";
import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";

const AddModifyStatusModal = ({
  isOpen,
  onClose,
  mode = "add",          // 'add' | 'modify'
  status = null,         // { id, typeName|name, description, isActive|status }
  category = "Machinery Status",
  onSave,                // async (payload) => void  (lanza error si falla)
}) => {
  const [formData, setFormData] = useState({
    category,
    typeName: "",
    description: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  // Precargar datos al abrir / cambiar modo
  useEffect(() => {
    if (!isOpen) return;

    if (mode === "modify" && status) {
      const isActive =
        status.isActive ??
        (status.status
          ? status.status === "Active"
          : (status.estado ?? "").toString().toLowerCase() === "activo");

      setFormData({
        category,
        typeName: status.typeName || status.name || "",
        description: status.description || "",
        isActive: !!isActive,
      });
    } else {
      setFormData({
        category,
        typeName: "",
        description: "",
        isActive: true,
      });
    }
  }, [isOpen, mode, status, category]);

  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    // Validación mínima
    if (!formData.typeName.trim()) return;

    setSaving(true);
    try {
      if (mode === "modify") {
        const updatedData = {
          typeName: formData.typeName.trim(),
          description: formData.description.trim(),
          isActive: formData.isActive,
        };
        await onSave?.(updatedData);
      } else {
        const newData = {
          typeName: formData.typeName.trim(),
          description: formData.description.trim(),
          isActive: formData.isActive,
        };
        await onSave?.(newData);
      }
      onClose(); // cerrar solo si onSave no lanzó error
    } catch (err) {
      // El padre muestra el modal de error
      console.error("AddModifyStatusModal: save error ->", err);
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
          <div className="space-y-4 sm:space-y-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <input
                  type="text"
                  value={formData.category}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre estado *
                </label>
                <input
                  type="text"
                  value={formData.typeName}
                  onChange={(e) => handleInputChange("typeName", e.target.value)}
                  disabled={saving}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter status name"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  cols={30}
                  rows={4}
                  maxLength={200} // Límite de 200 caracteres
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  disabled={saving}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter description"
                />
              </div>

              {/* <div>
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
                      formData.isActive ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isActive ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleSave}
            disabled={saving || !formData.typeName.trim()}
            className="btn-theme btn-primary not-disabled: w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {isAddMode ? "Guardando..." : "Actualizando..."}
              </span>
            ) : (
              isAddMode ? "Guardar" : "Actualizar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddModifyStatusModal;