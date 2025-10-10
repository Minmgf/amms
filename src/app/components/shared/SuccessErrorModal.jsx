import React, { useState, useEffect } from "react";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";

// Modal de Éxito
const SuccessModal = ({ isOpen, onClose, title = "Success", message = "Lorem ipsum dolor sit amet, consectetur adipiscing elit." }) => {
  
  useEffect(() => {
    if (isOpen) {
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
      document.body.style.pointerEvents = 'none';
      
      // Permitir pointer events solo en el modal
      const modalElement = document.querySelector('[data-modal="success"]');
      if (modalElement) {
        modalElement.style.pointerEvents = 'auto';
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleModalClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      id="success-modal" 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
      onClick={handleOverlayClick}
      data-modal="success"
      style={{ 
        zIndex: 9999,
        pointerEvents: 'auto',
        userSelect: 'none'
      }}
    >
      <div 
        className="modal-theme w-full max-w-sm" 
        onClick={handleModalClick}
        style={{ 
          zIndex: 10000,
          pointerEvents: 'auto'
        }}
      >
        <div className="p-6 text-center">
          {/* Icono de éxito */}
          <div className="mx-auto w-16 h-16 bg-success rounded-full flex items-center justify-center mb-4">
            <AiOutlineCheck className="w-8 h-8 text-white" />
          </div>
          
          {/* Título */}
          <h2 className="text-2xl font-medium text-success mb-3">{title}</h2>
          
          {/* Mensaje */}
          <p className="text-secondary text-sm mb-6 leading-relaxed">
            {message}
          </p>
          
          {/* Botón */}
          <button
            aria-label="Continue Button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Success button clicked'); // Debug
              onClose();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="btn-theme btn-primary w-full relative"
            type="button"
            style={{ 
              zIndex: 10001, 
              position: 'relative',
              pointerEvents: 'auto',
              cursor: 'pointer'
            }}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal de Error
const ErrorModal = ({
  isOpen,
  onClose,
  title = "Error",
  message = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  buttonText = "Intentar de nuevo", // <-- default
}) => {
  
  useEffect(() => {
    if (isOpen) {
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
      document.body.style.pointerEvents = 'none';
      
      // Permitir pointer events solo en el modal
      const modalElement = document.querySelector('[data-modal="error"]');
      if (modalElement) {
        modalElement.style.pointerEvents = 'auto';
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleModalClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      id="error-modal" 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
      onClick={handleOverlayClick}
      data-modal="error"
      style={{ 
        zIndex: 9999,
        pointerEvents: 'auto',
        userSelect: 'none'
      }}
    >
      <div 
        className="modal-theme w-full max-w-sm" 
        onClick={handleModalClick}
        style={{ 
          zIndex: 10000,
          pointerEvents: 'auto'
        }}
      >
        <div className="p-6 text-center">
          {/* Icono de error */}
          <div className="mx-auto w-16 h-16 bg-error rounded-full flex items-center justify-center mb-4">
            <AiOutlineClose className="w-8 h-8 text-white" />
          </div>
          
          {/* Título */}
          <h2 className="text-2xl font-medium text-error mb-3">{title}</h2>
          
          {/* Mensaje */}
          <p className="text-secondary text-sm mb-6 leading-relaxed">
            {message}
          </p>
          
          {/* Botón */}
          <button
            aria-label="Try Again Button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="btn-theme btn-error w-full relative"
            type="button"
            style={{ 
              zIndex: 10001, 
              position: 'relative',
              pointerEvents: 'auto',
              cursor: 'pointer'
            }}
          >
            {buttonText}
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
  title = "Confirmar Acción",
  message = "Esta seguro que quiere continuar?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmColor = "btn-error",
  cancelColor = "btn-secondary",
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleModalClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      id="confirm-modal" 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
      onClick={handleOverlayClick}
      style={{ zIndex: 9999 }}
    >
      <div 
        className="modal-theme w-full max-w-sm relative" 
        onClick={handleModalClick}
        style={{ zIndex: 10000 }}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Close button clicked'); // Debug
            onClose();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute top-3 right-3 text-secondary hover:text-primary"
          type="button"
          style={{ 
            zIndex: 10001, 
            position: 'absolute',
            pointerEvents: 'auto',
            cursor: 'pointer'
          }}
        >
          <AiOutlineClose className="w-5 h-5" />
        </button>

        <div className="p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4 text-primary">{title}</h2>
          <p className="text-secondary text-sm mb-6 leading-relaxed">
            {message}
          </p>
          <div className="flex gap-3">
            <button
              aria-label="Cancel Button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Cancel button clicked'); // Debug
                onClose();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className={`btn-theme ${cancelColor} w-1/2 relative`}
              type="button"
              style={{ 
                zIndex: 10001, 
                position: 'relative',
                pointerEvents: 'auto',
                cursor: 'pointer'
              }}
            >
              {cancelText}
            </button>
            <button
              aria-label="Confirm Button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Confirm button clicked'); // Debug
                console.log('onConfirm function:', onConfirm);
                if (onConfirm) {
                  onConfirm();
                } else {
                  console.error('onConfirm function is not defined!');
                }
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className={`btn-theme ${confirmColor} w-1/2 relative`}
              type="button"
              style={{ 
                zIndex: 10001, 
                position: 'relative',
                pointerEvents: 'auto',
                cursor: 'pointer'
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal de Advertencia
const WarningModal = ({
  isOpen,
  onClose,
  title = "Advertencia",
  message = "Esta acción requiere su atención.",
  buttonText = "Aceptar",
}) => {

  useEffect(() => {
    if (isOpen) {
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
      document.body.style.pointerEvents = 'none';

      // Permitir pointer events solo en el modal
      const modalElement = document.querySelector('[data-modal="warning"]');
      if (modalElement) {
        modalElement.style.pointerEvents = 'auto';
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleModalClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      id="warning-modal"
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
      onClick={handleOverlayClick}
      data-modal="warning"
      style={{
        zIndex: 9999,
        pointerEvents: 'auto',
        userSelect: 'none'
      }}
    >
      <div
        className="modal-theme w-full max-w-sm"
        onClick={handleModalClick}
        style={{
          zIndex: 10000,
          pointerEvents: 'auto'
        }}
      >
        <div className="p-6 text-center">
          {/* Icono de advertencia - Círculo rojo con signo de exclamación */}
          <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Título */}
          <h2 className="text-2xl font-medium text-red-600 mb-3">{title}</h2>

          {/* Mensaje */}
          <p className="text-secondary text-sm mb-6 leading-relaxed">
            {message}
          </p>

          {/* Botón */}
          <button
            aria-label="Accept Warning Button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="btn-theme btn-primary w-full relative"
            type="button"
            style={{
              zIndex: 10001,
              position: 'relative',
              pointerEvents: 'auto',
              cursor: 'pointer'
            }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export { SuccessModal, ErrorModal, ConfirmModal, WarningModal };