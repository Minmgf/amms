"use client";
import React, { useState, useEffect } from 'react';
import { FiX, FiEdit3 } from 'react-icons/fi';

const TypesModal = ({ 
  isOpen, 
  onClose, 
  categoryName, 
  data = [], 
  loading = false,
  onAddItem, 
  onEditItem,
  onToggleStatus
}) => {
  const [modalData, setModalData] = useState([]);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setModalData(data);
      // Bloquear scroll del body
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurar scroll del body
      document.body.style.overflow = 'unset';
    }

    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, data]);

  const handleEdit = (itemId) => {
    if (onEditItem) {
      onEditItem(itemId);
    }
  };

  const handleToggleStatus = async (itemId) => {
    if (!onToggleStatus) return;
    
    setTogglingId(itemId);
    try {
      await onToggleStatus(itemId);
    } catch (error) {
      console.error('Error toggling status:', error);
    } finally {
      setTogglingId(null);
    }
  };

  const handleAddParameter = () => {
    if (onAddItem) {
      onAddItem();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEscapeKey = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            <span className="text-gray-500">Category: </span>
            <span className="text-gray-900">{categoryName}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Table Container */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                      Type name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : modalData.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    modalData.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                          {item.typeName || item.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 border-r border-gray-200">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 text-sm border-r border-gray-200">
                          <div className="flex items-center space-x-3">
                            {/* Status Badge */}
                            <span 
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                item.status === 'Active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-pink-100 text-pink-800'
                              }`}
                            >
                              {item.status}
                            </span>
                            
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleEdit(item.id)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors"
                          >
                            <FiEdit3 className="w-3 h-3 mr-1.5" />
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Parameter Button */}
          <div className="flex justify-center">
            <button
              onClick={handleAddParameter}
              className="btn-theme btn-primary"
            >
              Add Parameter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypesModal;