"use client";
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { FaTimes, FaCalendarAlt, FaUser, FaCog, FaFileAlt } from 'react-icons/fa';
import { useTheme } from '@/contexts/ThemeContext';

const MaintenanceDetailModal = ({ isOpen, onClose, maintenance }) => {
  const { currentTheme } = useTheme();

  if (!maintenance) return null;

  const getDateStatus = (maintenanceDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const maintenanceDay = new Date(maintenanceDate);
    maintenanceDay.setHours(0, 0, 0, 0);
    
    if (maintenanceDay < today) return 'overdue';
    if (maintenanceDay.getTime() === today.getTime()) return 'today';
    return 'upcoming';
  };

  const getStatusBadge = (status) => {
    const baseClasses = 'inline-flex px-3 py-1 text-sm font-semibold rounded-full';
    switch (status) {
      case 'Pendiente':
        return `${baseClasses} text-yellow-800 bg-yellow-100`;
      case 'Realizado':
        return `${baseClasses} text-green-800 bg-green-100`;
      case 'Cancelado':
        return `${baseClasses} text-red-800 bg-red-100`;
      default:
        return `${baseClasses} text-gray-800 bg-gray-100`;
    }
  };

  const getDateStatusBadge = (dateStatus) => {
    const baseClasses = 'inline-flex px-3 py-1 text-sm font-semibold rounded-full';
    switch (dateStatus) {
      case 'overdue':
        return `${baseClasses} text-red-800 bg-red-100`;
      case 'today':
        return `${baseClasses} text-yellow-800 bg-yellow-100`;
      case 'upcoming':
        return `${baseClasses} text-green-800 bg-green-100`;
      default:
        return `${baseClasses} text-gray-800 bg-gray-100`;
    }
  };

  const dateStatus = getDateStatus(maintenance.maintenanceDate);
  const dateStatusText = {
    overdue: 'Vencido',
    today: 'Hoy',
    upcoming: 'Próximo'
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-[60]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Dialog.Title className="text-xl font-bold text-primary">
              Detalle del Mantenimiento
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Cerrar modal"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            </Dialog.Close>
          </div>

          {/* Contenido */}
          <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
            <div className="space-y-6">
              {/* Información de la maquinaria */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FaCog className="w-5 h-5" />
                  Información de la Maquinaria
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Nombre
                    </label>
                    <div className="text-sm text-gray-900 font-medium">
                      {maintenance.machinery.name}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Número de Serie
                    </label>
                    <div className="text-sm text-gray-900 font-mono">
                      {maintenance.machinery.serial}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información del mantenimiento */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FaCalendarAlt className="w-5 h-5" />
                  Información del Mantenimiento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Tipo de Mantenimiento
                    </label>
                    <div className="text-sm text-gray-900 font-medium">
                      {maintenance.type}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Estado Actual
                    </label>
                    <div>
                      <span className={getStatusBadge(maintenance.status)}>
                        {maintenance.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Fecha Programada
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900 font-medium">
                        {new Date(maintenance.maintenanceDate).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span className={getDateStatusBadge(dateStatus)}>
                        {dateStatusText[dateStatus]}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Técnico Asignado
                    </label>
                    <div className="flex items-center gap-2">
                      <FaUser className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900 font-medium">
                        {maintenance.technician}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalles del mantenimiento */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FaFileAlt className="w-5 h-5" />
                  Detalles
                </h3>
                <div className="text-sm text-gray-700 leading-relaxed">
                  {maintenance.details || 'No hay detalles adicionales disponibles.'}
                </div>
              </div>

              {/* ID del mantenimiento */}
              <div className="text-center">
                <span className="text-xs text-gray-500">
                  ID del Mantenimiento: #{maintenance.id}
                </span>
              </div>
            </div>
          </div>

          {/* Footer con acciones */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cerrar
              </button>
            </Dialog.Close>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              Editar Mantenimiento
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default MaintenanceDetailModal;