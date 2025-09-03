import React, { useState } from "react";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";

// Modal de Éxito
const SuccessModal = ({ isOpen, onClose, title = "Success", message = "Lorem ipsum dolor sit amet, consectetur adipiscing elit." }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="p-6 text-center">
          {/* Icono de éxito */}
          <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <AiOutlineCheck className="w-8 h-8 text-white" />
          </div>
          
          {/* Título */}
          <h2 className="text-2xl font-medium text-green-500 mb-3">{title}</h2>
          
          {/* Mensaje */}
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            {message}
          </p>
          
          {/* Botón */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors text-sm"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal de Error
const ErrorModal = ({ isOpen, onClose, title = "Error", message = "Lorem ipsum dolor sit amet, consectetur adipiscing elit." }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="p-6 text-center">
          {/* Icono de error */}
          <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
            <AiOutlineClose className="w-8 h-8 text-white" />
          </div>
          
          {/* Título */}
          <h2 className="text-2xl font-medium text-red-500 mb-3">{title}</h2>
          
          {/* Mensaje */}
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            {message}
          </p>
          
          {/* Botón */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
};

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "bg-red-600 hover:bg-red-500 active:bg-red-700",
  cancelColor = "bg-black hover:bg-gray-800",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <AiOutlineClose className="w-5 h-5" />
        </button>

        <div className="p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4">{title}</h2>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            {message}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`w-1/2 px-6 py-2 text-white font-medium rounded-md transition-colors text-sm ${cancelColor}`}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`w-1/2 px-6 py-2 text-white font-medium rounded-md transition-colors text-sm ${confirmColor}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SuccessModal, ErrorModal, ConfirmModal };