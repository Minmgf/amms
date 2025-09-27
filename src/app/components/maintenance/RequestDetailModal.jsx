"use client";
import React from "react";
import { FiX } from "react-icons/fi";

const RequestDetailModal = ({
  isOpen,
  onClose,
  request // Objeto con toda la información a mostrar
}) => {
  if (!isOpen || !request) return null;

  // Utilidades para mostrar valores
  const getStatusBadge = (status) => {
    if (status === "Pendiente") {
      return (
        <span className="parametrization-badge parametrization-badge-5 ml-2">
          Pendiente
        </span>
      );
    }
    if (status === "Programado") {
      return (
        <span className="parametrization-badge parametrization-badge-5 ml-2">
          Programado
        </span>
      );
    }
    if (status === "En Progreso") {
      return (
        <span className="parametrization-badge parametrization-badge-5 ml-2">
          En Progreso
        </span>
      );
    }
    if (status === "Completado") {
      return (
        <span className="parametrization-badge parametrization-badge-5 ml-2">
          Completado
        </span>
      );
    }
    return null;
  };

  const getPriorityBadge = (priority) => {
    if (priority === "Low" || priority === "Baja") {
      return (
        <span className="parametrization-badge parametrization-badge-5 ml-2">
          Baja
        </span>
      );
    }
    if (priority === "High" || priority === "Alta") {
      return (
        <span className="parametrization-badge parametrization-badge-1 ml-2">
          Alta
        </span>
      );
    }
    if (priority === "Medium" || priority === "Media") {
      return (
        <span className="parametrization-badge parametrization-badge-4 ml-2">
          Media
        </span>
      );
    }
    return null;
  };

  // Cerrar modal al hacer clic fuera del contenido
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      id="request-detail-modal"
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-5 border-b border-primary">
          <h2 className="text-theme-xl text-primary font-theme-semibold break-words">
            Detalles de Solicitud: {request.consecutiveNumber}
          </h2>
          <button
            onClick={onClose}
            className="self-end sm:self-auto p-2 hover:bg-hover rounded-full transition-colors"
            aria-label="Close Button"
          >
            <FiX className="w-5 h-5 text-secondary" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-2 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-90px)]">
          {/* Request information */}
          <section className="card-theme">
            <div className="font-theme-semibold text-theme-base mb-4">
              Información de la solicitud
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
              <div>
                <span className="text-theme-sm text-secondary">Número Consecutivo</span>
                <div className="font-theme-medium">{request.consecutiveNumber} SOL-1234 </div>
              </div>
              <div>
                <span className="text-theme-sm text-secondary">Fecha de la Solicitud</span>
                <div className="font-theme-medium">{request.requestDate} - 30 - Febrero - 2025</div>
              </div>
              <div>
                <span className="text-theme-sm text-secondary">Solicitante</span>
                <div className="font-theme-medium">{request.requester}</div>
              </div>
              <div>
                <span className="text-theme-sm text-secondary">Estado de Solicitud</span>
                <div className="flex items-center font-theme-medium mt-1">
                  {getStatusBadge(request.status)}
                </div>
              </div>
            </div>
          </section>

          {/* Machine information */}
          <section className="card-theme">
            <div className="font-theme-semibold text-theme-base mb-4">
              Información de la Máquina
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
              <div>
                <span className="text-theme-sm text-secondary">Número Serial</span>
                <div className="font-theme-medium">{request.serialNumber} SN-121314-AZ</div>
              </div>
              <div>
                <span className="text-theme-sm text-secondary">Nombre de la máquina</span>
                <div className="font-theme-medium">{request.machineName} Tractor Ejemplo</div>
              </div>
            </div>
          </section>

          {/* Maintenance information */}
          <section className="card-theme">
            <div className="font-theme-semibold text-theme-base mb-4">
              Información de Mantenimiento
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
              <div>
                <span className="text-theme-sm text-secondary">Tipo de Mantenimiento</span>
                <div className="font-theme-medium">{request.maintenanceType} Mantenimiento Ejemplo</div>
              </div>
              <div>
                <span className="text-theme-sm text-secondary">Prioridad</span>
                <div className="flex items-center font-theme-medium">
                  {getPriorityBadge(request.priority)}
                </div>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <span className="text-theme-sm text-secondary">Descripción del Problema</span>
                <div className="font-theme-medium whitespace-pre-line">{request.problemDescription} Ejemplo de la descripción del problema mientras se traen datos reales</div>
              </div>
            </div>
          </section>

          {/* Answer details */}
          <section className="card-theme">
            <div className="font-theme-semibold text-theme-base mb-4">
                Detalles de la Respuesta
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
              <div>
                <span className="text-theme-sm text-secondary">Fecha de Respuesta</span>
                <div className="font-theme-medium">{request.answerDate || "Respuesta Pendiente"}</div>
              </div>
              <div>
                <span className="text-theme-sm text-secondary">Gestionada por: </span>
                <div className="font-theme-medium">{request.handledBy || "Asignación Pendiente"}</div>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <span className="text-theme-sm text-secondary">Motivo de Rechazo</span>
                <div className="font-theme-medium whitespace-pre-line">{request.rejectionReason || "No Aplica – Solicitud Pendiente"}</div>
              </div>
              <div className="sm:col-span-1">
                <span className="text-theme-sm text-secondary">Fecha Programada</span>
                <div className="font-theme-medium">{request.scheduledDate || "Programación Pendiente"}</div>
              </div>
              <div className="sm:col-span-1">
                <span className="text-theme-sm text-secondary">Técnico Asignado</span>
                <div className="font-theme-medium">{request.assignedTechnician || "Asignación Pendiente"}</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailModal;