"use client";
import React from "react";

/**
 * Componente reutilizable para mostrar información de solicitudes de mantenimiento
 * @param {Object} request - Objeto con la información de la solicitud
 * @param {boolean} showMachineInfo - Si debe mostrar la información de la máquina (número de serie y nombre)
 */
const RequestInfoCard = ({ request, showMachineInfo = false }) => {
  // Función para obtener el badge de estado
  const getStatusBadge = (status) => {
    const statusMap = {
      "Pendiente": "parametrization-badge parametrization-badge-5",
      "Programado": "parametrization-badge parametrization-badge-5",
      "En Progreso": "parametrization-badge parametrization-badge-5",
      "Completado": "parametrization-badge parametrization-badge-5",
      "Rechazado": "parametrization-badge parametrization-badge-1"
    };

    const badgeClass = statusMap[status] || "parametrization-badge parametrization-badge-5";

    return (
      <span className={`${badgeClass} ml-2`}>
        {status}
      </span>
    );
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) + ", " + date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Extraer información de la solicitud
  const requestInfo = {
    consecutiveNumber: request?.id || request?.consecutiveNumber || "N/A",
    requestDate: request?.request_date 
      ? formatDate(request.request_date) 
      : request?.requestDate || "N/A",
    requester: request?.requester || "N/A",
    status: request?.status || "N/A",
    serialNumber: request?.serial_number || request?.serialNumber || "N/A",
    machineName: request?.machine_name || request?.machineName || "N/A"
  };

  return (
    <section className="card-theme">
      <div className="font-theme-semibold text-theme-base mb-4">
        Información de la Solicitud
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
        <div>
          <span className="text-theme-sm text-secondary">Número Consecutivo</span>
          <div className="font-theme-medium">{requestInfo.consecutiveNumber}</div>
        </div>
        <div>
          <span className="text-theme-sm text-secondary">Fecha de Solicitud</span>
          <div className="font-theme-medium">{requestInfo.requestDate}</div>
        </div>
        <div>
          <span className="text-theme-sm text-secondary">Solicitante</span>
          <div className="font-theme-medium">{requestInfo.requester}</div>
        </div>
        <div>
          <span className="text-theme-sm text-secondary">Estado</span>
          <div className="flex items-center font-theme-medium mt-1">
            {getStatusBadge(requestInfo.status)}
          </div>
        </div>
        {showMachineInfo && (
          <>
            <div>
              <span className="text-theme-sm text-secondary">Número de Serie</span>
              <div className="font-theme-medium">{requestInfo.serialNumber}</div>
            </div>
            <div>
              <span className="text-theme-sm text-secondary">Nombre de Máquina</span>
              <div className="font-theme-medium">{requestInfo.machineName}</div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default RequestInfoCard;