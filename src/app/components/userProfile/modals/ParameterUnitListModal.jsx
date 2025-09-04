"use client";
import React, { useState } from 'react';
import { FiX, FiEdit3 } from 'react-icons/fi';

const ParameterUnitListModal = ({ isOpen, onClose, category = "Weight", onOpenModifyModal, onOpenAddModal }) => {
  const [units, setUnits] = useState([
    {
      id: 1,
      unitName: "Ton",
      symbol: "T",
      value: "Decimal",
      status: "Active"
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

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
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Category: {category}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <FiX className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r border-gray-200">
                      Unit name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r border-gray-200">
                      Symbol
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r border-gray-200">
                      Value
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r border-gray-200">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {units.map((unit) => (
                    <tr key={unit.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                        {unit.unitName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                        {unit.symbol}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                        {unit.value}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
                className="px-6 py-2.5 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Add Parameter
              </button>
            </div>
          </div>
        </div>
      </div>


        
    
      </>
  );
};

export default ParameterUnitListModal;