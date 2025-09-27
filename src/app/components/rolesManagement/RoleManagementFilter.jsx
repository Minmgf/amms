"use client";
import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";

export default function RoleManagementFilter({ isOpen, onClose, statusFilter, onApply }) {
  useTheme();
  if (!isOpen) return null;
  const [localStatus, setLocalStatus] = useState(statusFilter || "");

  useEffect(() => {
    if (isOpen) {
      setLocalStatus(statusFilter || "");
    }
  }, [isOpen]);

  const handleApply = () => {
    onApply(localStatus);
    onClose();
  };

  const handleClean = () => {
    onApply("");
    setLocalStatus("");
    onClose();
  };

  return (
    <div id="role-filter-modal" className="modal-overlay">
      <div className="parametrization-modal card-theme w-96 p-6 relative">

        <button aria-label="Close Button" onClick={onClose} className="absolute top-2 right-2 text-secondary hover:text-primary">
          <FiX size={18} />
        </button>

        <h2 className="text-lg font-semibold mb-4 text-primary">Filtro</h2>

        <div>
          <label className="block text-sm font-medium mb-1 text-secondary">Estado</label>
          <select
            aria-label="Status Select"
            value={localStatus}
            onChange={(e) => setLocalStatus(e.target.value)}
            className="w-full parametrization-input"
          >
            <option value="">Todo</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

        <div className="flex gap-4 mt-6">
          <button aria-label="Clean Button" onClick={handleClean} className="btn-theme btn-secondary w-1/2 relative">
            Limpiar
          </button>
          <button aria-label="Apply Button" onClick={handleApply} className="btn-theme btn-primary w-1/2 relative">
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
