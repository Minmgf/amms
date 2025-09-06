"use client";
import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

const JobModal = ({
  isOpen,
  onClose,
  mode = "add", // 'add' or 'modify'
  jobData = null,
  departmentName = "Department X",
  onSave,
  existingJobs = [], // Array de jobs existentes para validar unicidad
}) => {
  const [formData, setFormData] = useState({
    department: "",
    jobTitle: "",
    description: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({
    jobTitle: "",
  });

  useEffect(() => {
    if (jobData && mode === "modify") {
      setFormData({
        department: departmentName || "Department X",
        jobTitle: jobData.name || "",
        description: jobData.description || "",
        isActive: jobData.status === "Active",
      });
    } else {
      // Reset form for add mode
      setFormData({
        department: departmentName || "Department X",
        jobTitle: "",
        description: "",
        isActive: true,
      });
    }

    // Reset errors when modal opens/closes
    setErrors({
      jobTitle: "",
    });
  }, [jobData, mode, isOpen, departmentName]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validación de campo obligatorio
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = "Please enter a job title";
    } else {
      // Validación de unicidad dentro del departamento
      const isDuplicate = existingJobs.some((job) => {
        if (mode === "modify" && job.id === jobData.id) {
          return false; // Excluir el job actual en modo edición
        }
        return (
          job.name.toLowerCase().trim() ===
          formData.jobTitle.toLowerCase().trim()
        );
      });

      if (isDuplicate) {
        newErrors.jobTitle = "This job title already exists in this department";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const dataToSave = {
      ...formData,
    };
    onSave(dataToSave);
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
            {isAddMode ? "Add Job" : "Modify Job"}
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
            {/* First Row - Department and Job Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) =>
                    handleInputChange("department", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 focus:outline-none"
                  readOnly
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    errors.jobTitle ? "text-red-500" : "text-gray-700"
                  }`}
                >
                  Job Title
                </label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) =>
                    handleInputChange("jobTitle", e.target.value)
                  }
                  placeholder={isAddMode ? "" : ""}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.jobTitle
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                {errors.jobTitle && (
                  <div className="flex items-center mt-1 text-red-500 text-xs">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.jobTitle}
                  </div>
                )}
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

export default JobModal;
