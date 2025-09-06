"use client";
import React, { useState } from 'react';
import { FiX, FiEdit3 } from 'react-icons/fi';

const ParameterTypesModal = ({ isOpen, onClose, category = "Maintenance Types", onOpenModifyModal, onOpenAddModal }) => {
  const [units, setUnits] = useState([
    {
      id: 1,
      typeName: "Corrective",
      description: "Example",
      status: "Active"
    },
    {
      id: 2,
      typeName: "Corrective",
      description: "Example",
      status: "Inactive"
    }
  ]);

  const handleEdit = (unit) => {
    if (onOpenModifyModal) {
      onOpenModifyModal(unit);
    }
  };

  const handleAddParameter = () => {
    if (onOpenAddModal) {
      onOpenAddModal();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-medium text-gray-900">
            Category: {category}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Table Container */}
          <div className="bg-gray-50 rounded-lg p-4 mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Type name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {units.map((unit) => (
                  <tr key={unit.id} className="hover:bg-gray-100">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {unit.typeName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {unit.description}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        unit.status === 'Active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-pink-100 text-pink-700'
                      }`}>
                        {unit.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleEdit(unit)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <FiEdit3 className="w-3 h-3 mr-1" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Parameter Button */}
          <div className="flex justify-center">
            <button
              onClick={handleAddParameter}
              className="px-8 py-2.5 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Add Parameter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParameterTypesModal;