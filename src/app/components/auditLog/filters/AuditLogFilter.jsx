"use client";
import { FiX } from "react-icons/fi";
import { useTheme } from '@/contexts/ThemeContext';

export default function AuditLogFilter({ isOpen, onClose }) {
  const { currentTheme } = useTheme();
  if (!isOpen) return null; // si no está abierto, no se renderiza

  return (
    <div className="modal-overlay">
      <div className="parametrization-modal">
        {/* Botón cerrar (X) */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-secondary hover:text-primary"
        >
          <FiX size={18} />
        </button>

        <h2 className="text-lg font-semibold mb-4 text-primary">Filters</h2>

        {/* Campos */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-secondary mb-1">Date</label>
              <input
                type="date"
                className="parametrization-input"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-secondary mb-1">Action type</label>
              <select className="parametrization-input">
                <option value="">Select</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">User</label>
            <input
              type="text"
              placeholder="Enter user"
              className="parametrization-input"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4 mt-6">
          <button className="parametrization-button parametrization-button-danger flex-1">
            Clean
          </button>
          <button className="parametrization-action-button flex-1">
            Apply
          </button>
        </div>
      </div>
    </div>

  );
}
