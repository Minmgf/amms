"use client";
import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import RequestInfoCard from "@/app/components/maintenance/RequestInfoCard";
import { getMaintenanceRequestDetail } from "@/services/maintenanceService";
import { getUserData } from "@/services/profileService";

const RequestDetailModal = ({
  isOpen,
  onClose,
  request
}) => {
  if (!isOpen || !request) return null;

  const [maintenanceDetail, setMaintenanceDetail] = useState(null);
  const [technicianName, setTechnicianName] = useState("");
  const [handleName, setHandleName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
    if (!request?.id) return;

    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const response = await getMaintenanceRequestDetail(request.id);
        console.log("Detalle mantenimiento:", response);
        setMaintenanceDetail(response.data);

        // Si hay un técnico asignado, obtener sus datos
        if (response.data?.assigned_technician_id) {
          try {
            const technicianResponse = await getUserData(response.data.assigned_technician_id);
            setTechnicianName(technicianResponse.data[0]);
          } catch (techError) {
            console.error("Error al obtener datos del técnico:", techError);
          }
        }

        if (response.data?.id_response_user) {
          try {
            const technicianResponse = await getUserData(response.data.id_response_user);
            setHandleName(technicianResponse.data[0]);
          } catch (techError) {
            console.error("Error al obtener datos del técnico:", techError);
          }
        }

      } catch (error) {
        console.error("Error al obtener detalle de mantenimiento:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [request?.id]);

  // Usar maintenanceDetail si existe, sino usar request como fallback
  const displayData = maintenanceDetail || request;

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
            Detalles de Solicitud: {request.id}
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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-secondary">Cargando detalles...</div>
            </div>
          ) : (
            <>
              {/* Request information */}
              <RequestInfoCard request={request} showMachineInfo={false} />

              {/* Machine information */}
              <section className="card-theme">
                <div className="font-theme-semibold text-theme-base mb-4">
                  Información de la Máquina
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
                  <div>
                    <span className="text-theme-sm text-secondary">Número Serial</span>
                    <div className="font-theme-medium">
                      {displayData.machinery_serial || "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="text-theme-sm text-secondary">Nombre de la máquina</span>
                    <div className="font-theme-medium">
                      {displayData.machinery_name || "N/A"}
                    </div>
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
                    <div className="font-theme-medium">
                      {displayData.maintenance_type_name || "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="text-theme-sm text-secondary">Prioridad</span>
                    <div className="flex items-center font-theme-medium">
                      {getPriorityBadge(displayData.priority_name)}
                    </div>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <span className="text-theme-sm text-secondary">Descripción del Problema</span>
                    <div className="font-theme-medium whitespace-pre-line">
                      {displayData.description || "N/A"}
                    </div>
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
                    <div className="font-theme-medium">
                      {displayData.response_date 
                        ? new Date(displayData.response_date).toLocaleString('es-CO', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })
                        : "Respuesta Pendiente"}
                    </div>
                  </div>
                  <div>
                    <span className="text-theme-sm text-secondary">Gestionada por: </span>
                    <div className="font-theme-medium">
                      {handleName?.name && handleName?.first_last_name
                        ? `${handleName.name} ${handleName.first_last_name}`.trim()
                          : "Pendiente"}
                    </div>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <span className="text-theme-sm text-secondary">Motivo de Rechazo</span>
                    <div className="font-theme-medium whitespace-pre-line">
                      {displayData.justification || "No Aplica"}
                    </div>
                  </div>
                  <div className="sm:col-span-1">
                    <span className="text-theme-sm text-secondary">Fecha Programada</span>
                    <div className="font-theme-medium">
                      {displayData.scheduled_at 
                        ? new Date(displayData.scheduled_at).toLocaleString('es-CO', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })
                        : "Respuesta Pendiente"}
                    </div>
                  </div>
                  <div className="sm:col-span-1">
                    <span className="text-theme-sm text-secondary">Técnico Asignado</span>
                    <div className="font-theme-medium">
                      {technicianName?.name && technicianName?.first_last_name
                        ? `${technicianName.name} ${technicianName.first_last_name}`.trim()
                          : "Asignación Pendiente"}
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetailModal;