"use client";
import { FiX } from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";

export default function RoleManagementFilter({ isOpen, onClose, statusFilter, setStatusFilter }) {
  useTheme();
  if (!isOpen) return null;

  const handleApply = () => {
    onClose();
  };

  const handleClean = () => {
    setStatusFilter("");
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="parametrization-modal card-theme w-96 p-6 relative">

        <button onClick={onClose} className="absolute top-2 right-2 text-secondary hover:text-primary">
          <FiX size={18} />
        </button>

        <h2 className="text-lg font-semibold mb-4 text-primary">Filters</h2>

        <div>
          <label className="block text-sm font-medium mb-1 text-secondary">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full parametrization-input"
          >
            <option value="">All</option>
            <option value="Activo">Active</option>
            <option value="Inactivo">Inactive</option>
          </select>
        </div>

        <div className="flex gap-4 mt-6">
          <button onClick={handleClean} className="flex-1 parametrization-button parametrization-button-danger">
            Clean
          </button>
          <button onClick={handleApply} className="flex-1 parametrization-button">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
