"use client";
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AiOutlineClose } from 'react-icons/ai';

const ToggleStatusModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type, // 'activate' or 'deactivate'
  isLoading 
}) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const isDeactivate = type === 'deactivate';
  const buttonColor = isDeactivate ? 'btn-error' : 'btn-success';

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const onSubmit = (data) => {
    onConfirm(data.observation || null);
  };

  return (
    <div
      id="toggle-status-modal" 
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
            if (!isLoading) onClose();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          disabled={isLoading}
          className="absolute top-3 right-3 text-secondary hover:text-primary disabled:opacity-50"
          type="button"
          aria-label="Cerrar modal"
          style={{ 
            zIndex: 10001, 
            position: 'absolute',
            pointerEvents: 'auto',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          <AiOutlineClose className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4 text-primary">{title}</h2>
          <p className="text-secondary text-sm mb-6 leading-relaxed">
            {message}
          </p>

          {/* Campo de observación */}
          <div className="mb-6 text-left">
            <label htmlFor="observation" className="block text-sm font-medium text-primary mb-2">
              {isDeactivate ? (
                <>
                  Motivo de la desactivación <span className="text-red-500">*</span>
                </>
              ) : (
                'Observación (Opcional)'
              )}
            </label>
            <textarea
              id="observation"
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg text-primary bg-surface resize-none focus:outline-none focus:ring-2 focus:ring-accent ${
                errors.observation ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={isDeactivate ? "Ingrese el motivo de la desactivación..." : "Ingrese una observación si lo desea..."}
              disabled={isLoading}
              {...register('observation', { 
                required: isDeactivate ? "El motivo es obligatorio para desactivar" : false,
                maxLength: {
                  value: 255,
                  message: "Máximo 255 caracteres"
                }
              })}
            />
            {errors.observation && (
              <p className="mt-1 text-xs text-red-500">{errors.observation.message}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="button"
              aria-label="Cancelar acción"
              onClick={(e) => {
                e.stopPropagation();
                if (!isLoading) onClose();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              disabled={isLoading}
              className="btn-theme btn-secondary w-1/2 relative"
              style={{ 
                zIndex: 10001, 
                position: 'relative',
                pointerEvents: 'auto',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              aria-label="Confirmar acción"
              disabled={isLoading}
              className={`btn-theme ${buttonColor} w-1/2 relative ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ 
                zIndex: 10001, 
                position: 'relative',
                pointerEvents: 'auto',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Procesando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ToggleStatusModal;

