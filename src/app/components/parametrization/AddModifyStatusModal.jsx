"use client";
import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

const AddModifyStatusModal = ({
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
  }, [status, mode, category, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (mode === "modify") {
      const updatedStatus = {
        ...status,
        typeName: formData.typeName,
        description: formData.description,
        status: formData.isActive ? "Active" : "Inactive",
        isActive: formData.isActive,
      };

      console.log("Updating status parameter:", updatedStatus);

      if (onSave) {
        onSave(updatedStatus);
      }
    } else {
      const newStatus = {
        typeName: formData.typeName,
        description: formData.description,
        status: formData.isActive ? "Active" : "Inactive",
        isActive: formData.isActive,
        category: formData.category,
      };

      console.log("Adding status parameter:", newStatus);

      if (onSave) {
        onSave(newStatus);
      }
    }

    onClose();
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
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
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
                  Type name
                </label>
                <input
                  type="text"
                  value={formData.typeName}
                  onChange={(e) =>
                    handleInputChange("typeName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
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
            className="bg-black text-white px-6 sm:px-8 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium w-full sm:w-auto"
          >
            {isAddMode ? "Save" : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddModifyStatusModal;