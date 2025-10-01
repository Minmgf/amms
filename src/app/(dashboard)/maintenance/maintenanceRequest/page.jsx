"use client";
import TableList from "@/app/components/shared/TableList";
import React, { useState, useMemo, useEffect } from "react";
import { CiFilter } from "react-icons/ci";
import {
  FaEye,
  FaPen,
  FaPlus,
  FaTimes,
  FaCog,
  FaCalendarAlt,
  FaBarcode,
  FaTag,
  FaCalendar,
  FaCheckCircle,
  FaTools,
  FaHashtag,
  FaRegPlayCircle,
  FaTractor,
  FaHistory,
  FaUser,
  FaExclamationTriangle,
  FaClock,
  FaWrench,
  FaCheck,
  FaBan,
  FaRegClock,
} from "react-icons/fa";
import PermissionGuard from "@/app/(auth)/PermissionGuard";
import * as Dialog from "@radix-ui/react-dialog";
import { FiLayers } from "react-icons/fi";
import { IoCalendarOutline } from "react-icons/io5";
import MaintenanceRequestModal from "@/app/components/maintenance/MaintenanceRequestModal";
import RequestDetailModal from "@/app/components/maintenance/RequestDetailModal";
import DeclineRequestModal from "@/app/components/maintenance/DeclineRequestModal";
import ScheduleMaintenanceModal from "@/app/components/maintenance/ScheduleMaintenanceModal";
import {
  SuccessModal,
  ErrorModal,
} from "@/app/components/shared/SuccessErrorModal";
import {
  getMaintenanceRequestList,
  getActiveTechnicians,
  getMaintenanceTypes,
  createMaintenanceScheduling,
  rejectMaintenanceRequest, // Agregar si no está
} from "@/services/maintenanceService";
import { getUserInfo } from "@/services/authService";

const SolicitudesMantenimientoView = () => {
  // Estado para el filtro global
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para datos
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [error, setError] = useState(null);

  // Estados para modales de feedback
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  // Estados para el modal de filtros
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [maintenanceTypeFilter, setMaintenanceTypeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [requesterFilter, setRequesterFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  // Datos de usuarios disponibles (esto vendría de la BD)
  const [availableRequesters, setAvailableRequesters] = useState([]);
  const [availableMaintenanceTypes, setAvailableMaintenanceTypes] = useState(
    []
  );
  const [availablePriorities, setAvailablePriorities] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState([]);

  // Estados para modales de detalles y edición
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [selectedRequestForDecline, setSelectedRequestForDecline] =
    useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedRequestForSchedule, setSelectedRequestForSchedule] =
    useState(null);

  // Datos de ejemplo
  const sampleMaintenanceData = [
    {
      id: "2025-01",
      machine_id: 1,
      machine_name: "Tractor",
      serial_number: "CAT00D5GPWGB01070",
      requester: "Hernan Torres",
      maintenance_type: "Preventivo",
      request_date: "2025-03-14T21:23:00Z",
      priority: "Alta",
      status: "Pendiente",
    },
    {
      id: "2025-02",
      machine_id: 1,
      machine_name: "Cosechadora",
      serial_number: "ZAR00D5GPWGB01070",
      requester: "Jairo Rojas",
      maintenance_type: "Correctivo",
      request_date: "2025-03-14T21:23:00Z",
      priority: "Alta",
      status: "Programado",
    },
    {
      id: "2025-03",
      machine_id: 1,
      machine_name: "Excavadora",
      serial_number: "JCB00X8HMWN02150",
      requester: "Maria Gonzalez",
      maintenance_type: "Preventivo",
      request_date: "2025-03-15T10:15:00Z",
      priority: "Media",
      status: "En Progreso",
    },
    {
      id: "2025-04",
      machine_id: 1,
      machine_name: "Bulldozer",
      serial_number: "CAT00D8TPWGB03280",
      requester: "Carlos Rodriguez",
      maintenance_type: "Emergencia",
      request_date: "2025-03-16T14:30:00Z",
      priority: "Alta",
      status: "Completado",
    },
  ];

  const loadModalData = async () => {
    try {
      // Cargar técnicos
      const techniciansList = await getActiveTechnicians();
      setTechnicians(techniciansList);

      // Cargar tipos de mantenimiento
      const types = await getMaintenanceTypes();
      // Formatear los tipos según tu necesidad
      const formattedTypes = types?.data?.map((type) => type.name) || [
        "Preventivo",
        "Correctivo",
        "Emergencia",
        "Predictivo",
      ];
      setMaintenanceTypes(formattedTypes);
    } catch (error) {
      setErrorModal({
        isOpen: true,
        title: "Error al cargar datos",
        message: `No se pudo aprobar la solicitud: ${
          error.message || error
        }. Por favor, intenta de nuevo.`,
      });
      // Usar datos de respaldo si falla
      setTechnicians([
        { value: "1", label: "Técnico 1" },
        { value: "2", label: "Técnico 2" },
      ]);
      setMaintenanceTypes(["Preventivo", "Correctivo", "Emergencia"]);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadInitialData();
    loadModalData();
  }, []);

  // Aplicar filtros cuando cambien los datos o los filtros
  useEffect(() => {
    applyFilters();
  }, [
    maintenanceData,
    maintenanceTypeFilter,
    priorityFilter,
    statusFilter,
    requesterFilter,
    startDateFilter,
    endDateFilter,
  ]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Cargar datos reales desde el backend
      const response = await getMaintenanceRequestList();

      if (response.success) {
        // Mapear la respuesta al formato esperado por la tabla con peticiones adicionales para obtener nombres de solicitantes
        const mappedDataPromises = response.data.map(async (item) => {
          let requesterName = `Usuario #${item.requester_id}`;

          // Hacer petición adicional para obtener nombre del solicitante
          if (item.requester_id) {
            try {
              const userResponse = await getUserInfo(item.requester_id);
              if (
                userResponse.success &&
                userResponse.data &&
                userResponse.data.length > 0
              ) {
                requesterName = userResponse.data[0].name;
              }
            } catch (userError) {
              console.error(
                `Error fetching user info for requester ${item.requester_id}:`,
                userError
              );
              // Mantener el valor por defecto si falla la petición
            }
          }

          return {
            id: item.id,
            machine_id: item.requester_id, // Usar requester_id como machine_id temporal
            machine_name: item.machinery_name || "N/A",
            serial_number: item.machinery_serial || "N/A",
            requester: requesterName,
            maintenance_type: item.maintenance_type_name || "N/A",
            request_date: item.fecha_solicitud
              ? `${item.fecha_solicitud}T12:00:00Z`
              : null,
            priority: item.priority_name || "Media",
            status: item.status_name || "Pendiente",
            description: "", // No viene en la respuesta actual
            justification: null, // No viene en la respuesta actual
            // Campos adicionales del API
            requester_id: item.requester_id,
            status_id: item.status_id,
          };
        });

        // Esperar a que todas las peticiones se completen
        const formattedData = await Promise.all(mappedDataPromises);
        setMaintenanceData(formattedData);

        // Extraer valores únicos para los filtros
        const requesters = [
          ...new Set(
            formattedData.map((item) => item.requester).filter(Boolean)
          ),
        ];
        const types = [
          ...new Set(
            formattedData.map((item) => item.maintenance_type).filter(Boolean)
          ),
        ];
        const priorities = [
          ...new Set(
            formattedData.map((item) => item.priority).filter(Boolean)
          ),
        ];

        setAvailableRequesters(requesters);
        setAvailableMaintenanceTypes(types);
        setAvailablePriorities(priorities);
      } else {
        setError("Error al cargar las solicitudes de mantenimiento");
        setMaintenanceData(sampleMaintenanceData);
      }
    } catch (err) {
      console.error("Error cargando solicitudes:", err);
      setError(
        "Error al conectar con el servidor. Por favor, intenta de nuevo."
      );

      // Si falla, usar datos de ejemplo
      setMaintenanceData(sampleMaintenanceData);

      setErrorModal({
        isOpen: true,
        title: "Error al cargar datos",
        message: `No se pudieron cargar las solicitudes: ${
          err.response?.data?.message || err.message || "Error desconocido"
        }. ${
          process.env.NODE_ENV === "development"
            ? "Mostrando datos de ejemplo."
            : ""
        }`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Obtener valores únicos para los filtros
  const uniqueMaintenanceTypes = useMemo(() => {
    const types = maintenanceData
      .map((request) => request.maintenance_type)
      .filter(Boolean);
    return [...new Set(types)];
  }, [maintenanceData]);

  const uniquePriorities = useMemo(() => {
    const priorities = maintenanceData
      .map((request) => request.priority)
      .filter(Boolean);
    return [...new Set(priorities)];
  }, [maintenanceData]);

  const uniqueStatuses = useMemo(() => {
    const statuses = maintenanceData
      .map((request) => request.status)
      .filter(Boolean);
    return [...new Set(statuses)];
  }, [maintenanceData]);

  // Aplicar filtros
  const applyFilters = () => {
    let filtered = maintenanceData;

    if (maintenanceTypeFilter) {
      filtered = filtered.filter(
        (request) => request.maintenance_type === maintenanceTypeFilter
      );
    }

    if (priorityFilter) {
      filtered = filtered.filter(
        (request) => request.priority === priorityFilter
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    if (requesterFilter) {
      filtered = filtered.filter(
        (request) => request.requester === requesterFilter
      );
    }

    // Filtro por rango de fechas
    if (startDateFilter || endDateFilter) {
      filtered = filtered.filter((request) => {
        if (!request.request_date) return false;

        const requestDate = new Date(request.request_date);
        const startDate = startDateFilter ? new Date(startDateFilter) : null;
        const endDate = endDateFilter
          ? new Date(endDateFilter + "T23:59:59")
          : null;

        let matchesDateRange = true;

        if (startDate && requestDate < startDate) {
          matchesDateRange = false;
        }

        if (endDate && requestDate > endDate) {
          matchesDateRange = false;
        }

        return matchesDateRange;
      });
    }

    setFilteredData(filtered);
  };

  // Función personalizada de filtrado global
  const globalFilterFn = useMemo(() => {
    return (row, columnId, filterValue) => {
      if (!filterValue) return true;

      const searchTerm = filterValue.toLowerCase().trim();
      if (!searchTerm) return true;

      const request = row.original;

      // Crear array de campos searchables
      const searchableFields = [
        request.id,
        request.machine_name,
        request.serial_number,
        request.requester,
        request.maintenance_type,
        request.priority,
        request.status,
      ];

      // Agregar fechas formateadas si existen
      if (request.request_date) {
        const date = new Date(request.request_date);
        searchableFields.push(
          date.toLocaleDateString("es-ES"),
          date.toLocaleDateString("en-US"),
          date.toISOString().split("T")[0],
          date.getFullYear().toString(),
          (date.getMonth() + 1).toString().padStart(2, "0"),
          date.getDate().toString().padStart(2, "0")
        );
      }

      // Buscar en cualquier campo que contenga el término
      return searchableFields.some((field) => {
        if (!field) return false;
        return field.toString().toLowerCase().includes(searchTerm);
      });
    };
  }, []);

  // Handlers para filtros
  const handleApplyFilters = () => {
    applyFilters();
    setIsFilterModalOpen(false);
  };

  const handleClearFilters = () => {
    setMaintenanceTypeFilter("");
    setPriorityFilter("");
    setStatusFilter("");
    setRequesterFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    applyFilters();
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("es-ES");
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Formatear hora
  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "";
    }
  };

  // Función para obtener color del estado
  const getStatusColor = (status) => {
    const colors = {
      Pendiente: "bg-yellow-100 text-yellow-800",
      Programado: "bg-green-100 text-green-800",
      "En Progreso": "bg-blue-100 text-blue-800",
      Completado: "bg-gray-100 text-gray-800",
      Cancelado: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Función para obtener color de prioridad
  const getPriorityColor = (priority) => {
    const colors = {
      Alta: "bg-red-100 text-red-800",
      Media: "bg-yellow-100 text-yellow-800",
      Baja: "bg-green-100 text-green-800",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  // Función para obtener color del tipo de mantenimiento
  const getMaintenanceTypeColor = (type) => {
    const colors = {
      Preventivo: "bg-pink-100 text-pink-800",
      Correctivo: "bg-purple-100 text-purple-800",
      Emergencia: "bg-red-100 text-red-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  // Definición de columnas para TanStack Table
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: () => (
          <div className="flex items-center gap-2">
            <FaHashtag className="w-4 h-4" />
            Id
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-sm parametrization-text font-mono font-medium">
            {row.getValue("id") || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "machine_name",
        header: () => (
          <div className="flex items-center gap-2">
            <FaTractor className="w-4 h-4" />
            Nombre de Máquina
          </div>
        ),
        cell: ({ row }) => {
          const request = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                <FaTractor className="w-4 h-4 text-gray-400" />
              </div>
              <div className="font-medium parametrization-text">
                {request.machine_name || "N/A"}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "serial_number",
        header: () => (
          <div className="flex items-center gap-1">
            <FaHashtag className="w-4 h-4" />
            Número de Serie
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-sm parametrization-text font-mono">
            {row.getValue("serial_number") || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "requester",
        header: () => (
          <div className="flex items-center gap-2">
            <FaUser className="w-4 h-4" />
            Solicitante
          </div>
        ),
        cell: ({ row }) => {
          const requester = row.getValue("requester");
          return (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                <FaUser className="w-3 h-3 text-gray-600" />
              </div>
              <span className="text-sm parametrization-text">
                {requester || "N/A"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "maintenance_type",
        header: () => (
          <div className="flex items-center gap-2">
            <FaWrench className="w-4 h-4" />
            Tipo de Mantenimiento
          </div>
        ),
        cell: ({ row }) => {
          const type = row.getValue("maintenance_type");
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMaintenanceTypeColor(
                type
              )}`}
            >
              {type || "N/A"}
            </span>
          );
        },
      },
      {
        accessorKey: "request_date",
        header: () => (
          <div className="flex items-center gap-2">
            <IoCalendarOutline className="w-4 h-4" />
            Fecha de Solicitud
          </div>
        ),
        cell: ({ row }) => {
          const date = row.getValue("request_date");
          return (
            <div className="text-sm parametrization-text">
              <div>{formatDate(date)}</div>
              <div className="text-xs parametrization-text">
                {formatTime(date)}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "priority",
        header: () => (
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="w-4 h-4" />
            Prioridad
          </div>
        ),
        cell: ({ row }) => {
          const priority = row.getValue("priority");
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                priority
              )}`}
            >
              {priority || "N/A"}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: () => (
          <div className="flex items-center gap-2">
            <FaClock className="w-4 h-4" />
            Estado
          </div>
        ),
        cell: ({ row }) => {
          const status = row.getValue("status");
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                status
              )}`}
            >
              {status || "N/A"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => (
          <div className="flex items-center gap-2">
            <FaTools className="w-4 h-4" />
            Acciones
          </div>
        ),
        cell: ({ row }) => {
          const request = row.original;
          const status = request.status;

          // Solo "Pendiente" puede ser aprobado
          const canApprove = status === "Pendiente";

          // Solo "Pendiente" puede ser rechazado según HU-SM-005
          const canReject = status === "Pendiente";

          return (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => handleView(request)}
                className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-blue-500 hover:text-blue-600"
                title="Ver detalles"
              >
                <FaHistory className="w-3 h-3" /> Detalles
              </button>

              {canApprove && (
                <button
                  onClick={() => handleOpenScheduleModal(request)}
                  className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-green-300 hover:border-green-500 hover:text-green-600 text-green-600"
                  title="Aprobar y programar solicitud"
                >
                  <FaRegClock className="w-3 h-3" /> Agendar
                </button>
              )}

              {canReject && (
                <PermissionGuard permission={122}>
                  <button
                    onClick={() => handleCancel(request)}
                    className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-red-300 hover:border-red-500 hover:text-red-600 text-red-600"
                    title="Rechazar solicitud"
                  >
                    <FaBan className="w-3 h-3" /> Rechazar
                  </button>
                </PermissionGuard>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  // Handlers para las acciones
  const handleEdit = (request) => {
    setSelectedRequest(request);
    setIsEditModalOpen(true);
  };

  const handleView = (request) => {
    setSelectedRequest(request);
    setIsDetailsModalOpen(true);
  };

  const handleApprove = async (request) => {
    try {
      // Actualizar el estado local
      setMaintenanceData((prevData) =>
        prevData.map((item) =>
          item.id === request.id ? { ...item, status: "Programado" } : item
        )
      );

      setSelectedRequestForSchedule(request);
      setIsScheduleModalOpen(true);

      // Mostrar mensaje de éxito (puedes usar un toast aquí)
      setSuccessModal({
        isOpen: true,
        title: "Solicitud Aprobada",
        message:
          "La solicitud ha sido aprobada y está lista para ser programada",
      });
    } catch (error) {
      setErrorModal({
        isOpen: true,
        title: "Error al Aprobar",
        message: `No se pudo aprobar la solicitud: ${
          error.message || error
        }. Por favor, intenta de nuevo.`,
      });
    }
  };

  const handleCancel = (request) => {
    // Validaciones de estados según la historia de usuario
    const notAllowedStatuses = [
      "Rechazada",
      "Completado",
      "En Progreso",
      "Programado",
    ];

    if (notAllowedStatuses.includes(request.status)) {
      let message = "Esta solicitud no puede ser rechazada.";

      switch (request.status) {
        case "Rechazada":
          message = "Esta solicitud ya fue rechazada previamente.";
          break;
        case "Completado":
          message = "No se puede rechazar una solicitud completada.";
          break;
        case "En Progreso":
          message = "No se puede rechazar una solicitud en progreso.";
          break;
        case "Programado":
          message =
            "No se puede rechazar una solicitud que ya fue programada o aceptada.";
          break;
        default:
          message =
            "Esta solicitud no puede ser rechazada en su estado actual.";
      }

      setErrorModal({
        isOpen: true,
        title: "Acción No Permitida",
        message: message,
      });
      return;
    }

    // Si pasa las validaciones, abrir el modal
    setSelectedRequestForDecline(request);
    setIsDeclineModalOpen(true);
  };

  const handleOpenScheduleModal = (request) => {
    // Guardar la solicitud seleccionada
    setSelectedRequestForSchedule(request);
    // Abrir el modal
    setIsScheduleModalOpen(true);
  };

  const handleSubmitSchedule = async (scheduleData) => {
    try {
      // Aquí usamos selectedRequestForSchedule que tiene los datos de la solicitud
      const payload = {
        id_machinery: selectedRequestForSchedule?.machine_id || 2, // Necesitas agregar machine_id a tus datos
        scheduled_at: `${scheduleData.scheduleDate}T${scheduleData.scheduleTime}:00Z`,
        details: scheduleData.maintenanceDetails,
        assigned_technician: parseInt(scheduleData.technician),
        maintenance_type: 35, // Este ID debe venir del tipo seleccionado
        // Si necesitas asociar con la solicitud original:
        maintenance_request_id: selectedRequestForSchedule?.id,
      };

      // Llamar al servicio cuando esté disponible
      const response = await createMaintenanceScheduling(payload);

      if (response.success) {
        // Actualizar el estado local
        setMaintenanceData((prevData) =>
          prevData.map((item) =>
            item.id === selectedRequestForSchedule.id
              ? { ...item, status: "Programado" }
              : item
          )
        );

        // Cerrar modal
        setIsScheduleModalOpen(false);
        setSelectedRequestForSchedule(null);

        // Recargar datos si es necesario
        await loadInitialData();
      }
    } catch (error) {
      setErrorModal({
        isOpen: true,
        title: "Error al programar el mantenimiento",
        message: `No se pudo aprobar la solicitud: ${
          error.message || error
        }. Por favor, intenta de nuevo.`,
      });
      // El error se maneja en el modal
    }
  };

  const handleDeclineRequest = async ({
    requestId,
    justification,
    response,
  }) => {
    try {
      // El modal ya llamó al servicio y obtuvo la respuesta
      // Solo actualizamos el estado local
      setMaintenanceData((prevData) =>
        prevData.map((item) =>
          item.id === requestId
            ? {
                ...item,
                status: "Rechazada",
                justification: justification,
                answerDate: new Date().toLocaleDateString("es-ES"),
                rejectionReason: justification,
              }
            : item
        )
      );

      // Cerrar el modal de rechazo
      setIsDeclineModalOpen(false);
      setSelectedRequestForDecline(null);

      // Mostrar mensaje de éxito
      setSuccessModal({
        isOpen: true,
        title: "Solicitud Rechazada",
        message:
          response.message ||
          `La solicitud #${requestId} ha sido rechazada exitosamente.`,
      });

      // Recargar datos después de un breve delay para sincronizar con el servidor
      setTimeout(async () => {
        await loadInitialData();
      }, 1500);
    } catch (error) {
      console.error("Error en handleDeclineRequest:", error);

      // Revertir cambios en caso de error
      await loadInitialData();

      setErrorModal({
        isOpen: true,
        title: "Error al procesar el rechazo",
        message: `Hubo un problema al actualizar los datos: ${
          error.message || "Error desconocido"
        }. Los datos se han recargado.`,
      });
    }
  };

  const handleOpenAddRequestModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleRefresh = () => {
    loadInitialData();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold parametrization-text">
            Solicitudes de Mantenimiento
          </h1>
        </div>

        {/* Mostrar error si existe */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => setError(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <span className="sr-only">Dismiss</span>×
            </button>
          </div>
        )}
      </div>

      {/* Filtro de búsqueda global */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="max-w-md relative">
          <input
            id="search"
            type="text"
            placeholder="Buscar por ID, máquina, solicitante, tipo, estado..."
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {globalFilter && (
            <div className="absolute -bottom-5 left-0 text-xs text-gray-500">
              Filtrando por: "{globalFilter}"
            </div>
          )}
        </div>
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className={`parametrization-filter-button ${
            maintenanceTypeFilter ||
            priorityFilter ||
            statusFilter ||
            requesterFilter ||
            startDateFilter ||
            endDateFilter
              ? "bg-blue-100 border-blue-300 text-blue-700"
              : ""
          }`}
        >
          <CiFilter className="w-4 h-4" />
          Filtrar por
          {(maintenanceTypeFilter ||
            priorityFilter ||
            statusFilter ||
            requesterFilter ||
            startDateFilter ||
            endDateFilter) && (
            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {
                [
                  maintenanceTypeFilter,
                  priorityFilter,
                  statusFilter,
                  requesterFilter,
                  startDateFilter,
                  endDateFilter,
                ].filter(Boolean).length
              }
            </span>
          )}
        </button>
        {(maintenanceTypeFilter ||
          priorityFilter ||
          statusFilter ||
          requesterFilter ||
          startDateFilter ||
          endDateFilter) && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-red-500 hover:text-red-700 underline flex items-center gap-1"
          ></button>
        )}
        {globalFilter && (
          <button
            onClick={() => setGlobalFilter("")}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Limpiar búsqueda
          </button>
        )}
        <button
          onClick={handleOpenAddRequestModal}
          className="parametrization-filter-button"
        >
          Nueva Solicitud
        </button>
      </div>

      {/* Tabla de solicitudes de mantenimiento */}
      <TableList
        columns={columns}
        data={
          filteredData.length > 0 ||
          maintenanceTypeFilter ||
          priorityFilter ||
          statusFilter ||
          requesterFilter ||
          startDateFilter ||
          endDateFilter
            ? filteredData
            : maintenanceData
        }
        loading={loading}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        globalFilterFn={globalFilterFn}
        pageSizeOptions={[10, 20, 30, 50]}
      />

      {/* Modal de filtros */}
      <Dialog.Root open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-xl z-50 w-full max-w-2xl">
            <div className="p-8 card-theme rounded-2xl">
              <div className="flex justify-between items-center mb-8">
                <Dialog.Title className="text-2xl font-bold text-primary">
                  Filtros
                </Dialog.Title>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="text-secondary hover:text-primary"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rango de Fechas de Solicitud */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary mb-3">
                    Rango de Fechas de Solicitud
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Fecha de Inicio
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={startDateFilter}
                          onChange={(e) => setStartDateFilter(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent pr-12"
                        />
                        <FaCalendarAlt className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Fecha de Fin
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={endDateFilter}
                          onChange={(e) => setEndDateFilter(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent pr-12"
                        />
                        <FaCalendarAlt className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Solicitante */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-3">
                    Solicitante
                  </label>
                  <select
                    value={requesterFilter}
                    onChange={(e) => setRequesterFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none"
                  >
                    <option value="">Todos los solicitantes</option>
                    {availableRequesters.map((requester) => (
                      <option key={requester} value={requester}>
                        {requester}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo de Mantenimiento */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-3">
                    Tipo de Mantenimiento
                  </label>
                  <select
                    value={maintenanceTypeFilter}
                    onChange={(e) => setMaintenanceTypeFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none"
                  >
                    <option value="">Todos los tipos</option>
                    {availableMaintenanceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prioridad */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-3">
                    Prioridad
                  </label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none"
                  >
                    <option value="">Todas las prioridades</option>
                    {availablePriorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-3">
                    Estado
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none"
                  >
                    <option value="">Todos los estados</option>
                    {uniqueStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
                >
                  Limpiar
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
        <MaintenanceRequestModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
        <RequestDetailModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          request={selectedRequest}
        />
        <DeclineRequestModal
          isOpen={isDeclineModalOpen}
          onClose={() => {
            setIsDeclineModalOpen(false);
            setSelectedRequestForDecline(null);
          }}
          onDecline={handleDeclineRequest}
          request={selectedRequestForDecline}
        />
        <ScheduleMaintenanceModal
          isOpen={isScheduleModalOpen}
          onClose={() => {
            setIsScheduleModalOpen(false);
            setSelectedRequestForSchedule(null);
          }}
          onSubmit={handleSubmitSchedule} // Handler para el submit
          request={selectedRequestForSchedule} // La solicitud seleccionada
          technicians={technicians}
          maintenanceTypes={maintenanceTypes}
        />
        <SuccessModal
          isOpen={successModal.isOpen}
          onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
          title={successModal.title}
          message={successModal.message}
        />
        <ErrorModal
          isOpen={errorModal.isOpen}
          onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
          title={errorModal.title}
          message={errorModal.message}
        />
      </Dialog.Root>
    </div>
  );
};

export default SolicitudesMantenimientoView;
