"use client";
import { useState } from "react";
import { FiX } from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";

export default function AuditLogFilter({ isOpen, onClose, onApply, onClean }) {
  const { currentTheme } = useTheme();

  // Estado local de filtros
  const [date, setDate] = useState("");
  const [actionType, setActionType] = useState("");
  const [user, setUser] = useState("");

  if (!isOpen) return null; // si no está abierto, no se renderiza

  const handleApply = () => {
    onApply({ date, actionType, user }); // pasa filtros al padre
    onClose();
  };

  const handleClean = () => {
    setDate("");
    setActionType("");
    setUser("");
    onClean?.(); // notifica al padre
  };

  return (
    <div className="modal-overlay">
      <div className="parametrization-modal relative">
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
              <label className="block text-sm font-medium text-secondary mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="parametrization-input"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-secondary mb-1">
                Action type
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="parametrization-input"
              >
                <option value="">Select</option>
                <option value="ACCESS">Access</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              User
            </label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Enter user"
              className="parametrization-input"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4 mt-6">
          <button area-label="Clean Button" onClick={handleClean} className="btn-theme btn-secondary w-1/2 relative">
            Limpiar
          </button>
          <button area-label="Apply Button" onClick={handleApply} className="btn-theme btn-primary w-1/2 relative">
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
