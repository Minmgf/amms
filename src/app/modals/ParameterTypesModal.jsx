"use client";
import React, { useState } from 'react';
import { FiX, FiEdit } from 'react-icons/fi';

const ParameterTypesModal = ({ 
  isOpen, 
  onClose, 
  category = "Maintenance Types",
  onAddParameter,
  onEditParameter 
}) => {
  const [types] = useState([
    { 
      id: 1, 
      name: 'Corrective', 
      description: 'Example', 
      status: 'Active' 
    },
    { 
      id: 2, 
      name: 'Corrective', 
      description: 'Example', 
      status: 'Inactive' 
    }
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            <span className="font-bold">Category:</span> {category}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="px-8 py-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-4">
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Type name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {types.map((type) => (
                    <tr key={type.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{type.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{type.description}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          type.status === 'Active'
                            ? 'bg-green-200 text-green-800'
                            : 'bg-pink-200 text-pink-800'
                        }`}>
                          {type.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => onEditParameter(type)}
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors"
                        >
                          <FiEdit className="w-3 h-3 mr-1" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center pt-4">
              <button
                onClick={onAddParameter}
                className="px-6 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
              >
                Add Parameter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParameterTypesModal;