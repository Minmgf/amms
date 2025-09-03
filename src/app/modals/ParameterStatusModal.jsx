import React from 'react';
import { FiX, FiEdit3 } from 'react-icons/fi';

const ParameterStatusModal = ({ isOpen, onClose, category, onAddParameter, onEditParameter }) => {
  if (!isOpen) return null;

  // Datos de ejemplo para status
  const statusData = [
    { id: 1, name: 'Active', description: 'Example' },
    { id: 2, name: 'Inactive', description: 'Example' },
    { id: 3, name: 'Maintenance', description: 'Example' },
    { id: 4, name: 'Out of Service', description: 'Example' },
  ];

  const handleEditClick = (status) => {
    onEditParameter(status);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Category: <span className="font-normal">{category || 'Machinery Status'}</span>
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
          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">
                    Type name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statusData.map((status) => (
                  <tr key={status.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                      {status.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 border-r border-gray-200">
                      {status.description}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEditClick(status)}
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                        title="Edit parameter"
                      >
                        <FiEdit3 className="w-4 h-4 text-gray-500 hover:text-gray-700" />
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
              onClick={onAddParameter}
              className="bg-black text-white px-8 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium"
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