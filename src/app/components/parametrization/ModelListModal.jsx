"use client";
import React, { useState, useEffect } from 'react';
import { FiX, FiEdit3 } from 'react-icons/fi';

const CategoryModal = ({
  isOpen,
  onClose,
  categoryId,
  categoryName,
  data = [],
  onAddItem,
  onEditItem
}) => {

  const handleEdit = (brandId) => {
    if (!data) return;
    // Buscar solo la marca seleccionada
    const brand = data.find(b => Number(b.id) === Number(brandId));

    if (brand) {
      // Abrir el BrandFormModal con esa marca
      onEditItem(brand);
    }
  };

  const handleAddBrand = () => {
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
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            <span className="text-gray-500">Categoría: </span>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-90px)]">
          {/* Table Container */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                      Marca
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                      Descripción
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 border-r border-gray-200">
                        {item.description}
                      </td>
                      <td className="px-6 py-4 text-sm border-r border-gray-200">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${item.idStatues === 1
                              ? 'bg-green-100 text-green-800'
                              : item.idStatues  === 2
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors"
                        >
                          <FiEdit3 className="w-3 h-3 mr-1.5" />
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Brand Button */}
          <div className="flex justify-center">
            <button
              onClick={handleAddBrand}
              className="px-8 py-3 btn-theme btn-primary relative"
            >
              Añadir marca
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;