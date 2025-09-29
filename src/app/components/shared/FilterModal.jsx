import { FaTimes } from "react-icons/fa";
import React from "react";
import * as Dialog from '@radix-ui/react-dialog';

const FilterModal = ({
  open,
  onClose,
  onClear,
  onApply,
  children,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-[60]" />
        <Dialog.Content 
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Dialog.Title className="text-xl font-bold text-primary">
              Filtrar por
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Cerrar modal"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            </Dialog.Close>
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default FilterModal;