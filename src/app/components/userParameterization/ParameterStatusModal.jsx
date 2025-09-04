"use client";
import React, { useState } from 'react';
import { FiX, FiEdit3, FiTrash2 } from 'react-icons/fi';

const ParameterStatusModal = ({ 
  isOpen, 
  onClose, 
  category = "Machinery Status",
  onAddParameter,
  onEditParameter 
}) => {
  // Datos de ejemplo para status
  const [statusList, setStatusList] = useState([
    { 
      id: 1, 
      name: 'Active', 
      description: 'Example',
      isActive: true 
    },
    { 
      id: 2, 
      name: 'Active', 
      description: 'Example',
      isActive: false 
    }
  ]);

  const handleEdit = (status) => {
    onEditParameter(status);
  };

  const handleDelete = (statusId) => {
    if (window.confirm('Are you sure you want to delete this status?')) {
      setStatusList(statusList.filter(status => status.id !== statusId));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Category: {category}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Table */}
          <div className="bg-gray-50 rounded-lg overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Type name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Description
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statusList.map((status) => (
                  <tr key={status.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className="font-medium">{status.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {status.description}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleEdit(status)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors"
                        >
                          <FiEdit3 className="w-3 h-3 mr-1.5" />
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Parameter Button */}
          <div className="flex justify-center">
            <button
              onClick={onAddParameter}
              className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
            >
              Add Parameter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParameterStatusModal;