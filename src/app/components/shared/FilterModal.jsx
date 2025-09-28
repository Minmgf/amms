import { FaTimes } from "react-icons/fa";
import React from "react";

const FilterModal = ({
  open,
  onClose,
  onClear,
  onApply,
  children,
}) => {

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      id="Filter Modal"
    >
      <div
        className="bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 text-primary">
            Filtrar por
          </h2>
          <button
            aria-label="Cerrar modal"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Campos personalizados */}
        <div className="p-8">
          {children}
          <div className="flex gap-4 mt-8 justify-center">
            <button
              onClick={onClear}
              className="flex-1 px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors parametrization-text"
            >
              Limpiar
            </button>
            <button
              onClick={onApply}
              className="flex-1 px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors parametrization-text"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;