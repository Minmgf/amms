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
  FaTrash,
} from "react-icons/fa";
import PermissionGuard from "@/app/(auth)/PermissionGuard";
import * as Dialog from "@radix-ui/react-dialog";
import { FiLayers } from "react-icons/fi";
import { IoCalendarOutline } from "react-icons/io5";
import { getMaintenanceList } from "@/services/maintenanceService";
import { Edit } from "lucide-react";
import CreateMaintenanceModal from "@/app/components/maintenance/createMaintenanceModal/page";
import EditMaintenanceModal from "@/app/components/maintenance/editMaintenanceModal/page";
import {
  SuccessModal,
  ErrorModal,
  ConfirmModal,
} from "@/app/components/shared/SuccessErrorModal";
import MaintenanceFilterModal from "@/app/components/shared/FilterModal";

const GestorMantenimientos = () => {
  // Estado para el filtro global
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para datos
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [error, setError] = useState(null);

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

  // Estados para modales de detalles y edición
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);

  // Datos precargados para filtros
  const [availableMaintenanceTypes, setAvailableMaintenanceTypes] = useState(
    []
  );
  const [availablePriorities, setAvailablePriorities] = useState([]);
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [availableRequesters, setAvailableRequesters] = useState([]);

  // Estados para mensajes de éxito y error
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [maintenanceToDelete, setMaintenanceToDelete] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadMaintenanceData();
  }, []);

  // Aplicar filtros cuando cambien los datos o los filtros
  useEffect(() => {
    applyFilters();
  }, [maintenanceData, maintenanceTypeFilter, statusFilter]);

  const loadMaintenanceData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getMaintenanceList();

      if (response && Array.isArray(response)) {
        setMaintenanceData(response);

        // Extraer tipos de mantenimiento únicos para filtros
        const uniqueTypes = [
          ...new Set(
            response.map((item) => item.tipo_mantenimiento).filter(Boolean)
          ),
        ];
        setAvailableMaintenanceTypes(uniqueTypes);

        // Extraer prioridades únicas para filtros
        const uniquePriorities = [
          ...new Set(response.map((item) => item.prioridad).filter(Boolean)),
        ];
        setAvailablePriorities(uniquePriorities);

        // Extraer estados únicos para filtros
        const uniqueStatuses = [
          ...new Set(response.map((item) => item.estado).filter(Boolean)),
        ];
        setAvailableStatuses(uniqueStatuses);

        // Extraer solicitantes únicos para filtros
        const uniqueRequesters = [
          ...new Set(response.map((item) => item.solicitante).filter(Boolean)),
        ];
        setAvailableRequesters(uniqueRequesters);
      } else {
        setError("Formato de datos inesperado del servidor.");
      }
    } catch (err) {
      setError(
        "Error al cargar los datos de mantenimientos. Por favor, intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const applyFilters = () => {
    let filtered = maintenanceData;

    if (maintenanceTypeFilter) {
      filtered = filtered.filter(
        (maintenance) =>
          maintenance.tipo_mantenimiento === maintenanceTypeFilter
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(
        (maintenance) => maintenance.estado === statusFilter
      );
    }

    if (requesterFilter) {
      filtered = filtered.filter(
        (maintenance) => maintenance.solicitante === requesterFilter
      );
    }

    if (priorityFilter) {
      filtered = filtered.filter(
        (maintenance) => maintenance.prioridad === priorityFilter
      );
    }

    // Filtrado por rango de fechas
    if (startDateFilter && endDateFilter) {
      filtered = filtered.filter((maintenance) => {
        const maintenanceDate = new Date(maintenance.fecha_creacion);
        return (
          maintenanceDate >= new Date(startDateFilter) &&
          maintenanceDate <= new Date(endDateFilter)
        );
      });
    } else if (startDateFilter) {
      filtered = filtered.filter((maintenance) => {
        const maintenanceDate = new Date(maintenance.fecha_creacion);
        return maintenanceDate >= new Date(startDateFilter);
      });
    } else if (endDateFilter) {
      filtered = filtered.filter((maintenance) => {
        const maintenanceDate = new Date(maintenance.fecha_creacion);
        return maintenanceDate <= new Date(endDateFilter);
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

      const maintenance = row.original;

      // Crear array de campos searchables
      const searchableFields = [
        maintenance.id_maintenance?.toString(),
        maintenance.name,
        maintenance.description,
        maintenance.estado,
        maintenance.tipo_mantenimiento,
      ];

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
    setStatusFilter("");
    setPriorityFilter("");
    setRequesterFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    applyFilters();
  };

  // Función para obtener color del estado
  const getStatusColor = (status) => {
    const colors = {
      Habilitado: "bg-green-100 text-green-800",
      Deshabilitado: "bg-red-100 text-red-800",
      Active: "bg-green-100 text-green-800",
      Inactive: "bg-red-100 text-red-800",
      Activo: "bg-green-100 text-green-800",
      Inactivo: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Función para mapear estado de API a texto mostrado
  const getStatusDisplayText = (apiStatus) => {
    return apiStatus === "Habilitado" ? "Active" : "Inactive";
  };

  // Función para obtener color del tipo de mantenimiento
  const getMaintenanceTypeColor = (type) => {
    const colors = {
      "Mantenimiento Preventivo": "",
      "Mantenimiento Correctivo": "",
      "Mantenimiento Predictivo": "",
      "Mantenimiento de Emergencia": "",
    };
    return colors[type] || "";
  };

  // Definición de columnas para TanStack Table
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: () => (
          <div className="flex items-center gap-2">
            <FaWrench className="w-4 h-4" />
            Nombre del Mantenimiento
          </div>
        ),
        cell: ({ row }) => {
          const maintenance = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                <FaWrench className="w-4 h-4 text-gray-400" />
              </div>
              <div className="font-medium parametrization-text">
                {maintenance.name || "N/A"}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        header: () => (
          <div className="flex items-center gap-2">
            <FaTag className="w-4 h-4" />
            Descripción
          </div>
        ),
        cell: ({ row }) => (
          <div
            className="text-sm parametrization-text max-w-xs truncate"
            title={row.getValue("description")}
          >
            {row.getValue("description") || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "tipo_mantenimiento",
        header: () => (
          <div className="flex items-center gap-2">
            <FaCog className="w-4 h-4" />
            Tipo de Mantenimiento
          </div>
        ),
        cell: ({ row }) => {
          const type = row.getValue("tipo_mantenimiento");
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
        accessorKey: "estado",
        header: () => (
          <div className="flex items-center gap-2">
            <FaCheckCircle className="w-4 h-4" />
            Estado
          </div>
        ),
        cell: ({ row }) => {
          const status = row.getValue("estado");
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
          const maintenance = row.original;
          const isActive = maintenance.estado === "Habilitado";

          return (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {/* Botón Editar - siempre visible */}
              <button
                onClick={() => handleEdit(maintenance)}
                className="inline-flex items-center px-3 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-gray-500 hover:text-gray-600 cursor-pointer"
                title="Editar mantenimiento"
              >
                <FaPen className="w-3 h-3" />
                Editar
              </button>

              {/* Botón Eliminar - solo visible si está activo */}
              {isActive && (
                <button
                  onClick={() => handleDelete(maintenance)}
                  className="inline-flex items-center px-3 py-1.5 gap-2 border text-xs font-medium rounded border-red-300 bg-red-50 text-red-600 hover:border-red-500 hover:bg-red-100 cursor-pointer"
                  title="Eliminar mantenimiento"
                >
                  <FaTrash className="w-3 h-3" />
                  Eliminar
                </button>
              )}

              {/* Botón Habilitar - solo visible si está inactivo */}
              {!isActive && (
                <button
                  onClick={() => handleEnable(maintenance)}
                  className="inline-flex items-center px-3 py-1.5 gap-2 border text-xs font-medium rounded border-green-300 bg-green-50 text-green-600 hover:border-green-500 hover:bg-green-100"
                  title="Habilitar mantenimiento"
                >
                  <FaCheck className="w-3 h-3" />
                  Habilitar
                </button>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  // Handlers para las acciones
  const handleEdit = (maintenance) => {
    setSelectedMaintenance(maintenance);
    setIsEditModalOpen(true);
  };

  const handleView = (maintenance) => {
    setSelectedMaintenance(maintenance);
    setIsDetailsModalOpen(true);
  };

  const handleDelete = (maintenance) => {
    setMaintenanceToDelete(maintenance);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setShowConfirm(false);
    const maintenance = maintenanceToDelete;
    if (!maintenance) return;

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setErrorMsg("No hay token de autenticación. Inicia sesión.");
      setShowError(true);
      return;
    }

    try {
      const response = await fetch(
        `https://api.inmero.co/sigma/main/maintenance/${maintenance.id_maintenance}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: token.startsWith("Bearer")
              ? token
              : `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();

      if (response.ok && result.success) {
        setMaintenanceData((prevData) =>
          prevData.filter(
            (item) => item.id_maintenance !== maintenance.id_maintenance
          )
        );
        setSuccessMsg("Mantenimiento eliminado exitosamente."); // <-- Cambia el mensaje aquí
        setShowSuccess(true);
      } else if (response.status === 409) {
        setMaintenanceData((prevData) =>
          prevData.map((item) =>
            item.id_maintenance === maintenance.id_maintenance
              ? { ...item, id_estado: 2, estado: "Inactivo" }
              : item
          )
        );
        setShowWarning(true);
      } else {
        setErrorMsg(result.message || "No se pudo eliminar el mantenimiento.");
        setShowError(true);
      }
    } catch (error) {
      setErrorMsg("Error al eliminar el mantenimiento.");
      setShowError(true);
    }
  };

  const handleEnable = async (maintenance) => {
    setSuccessMsg("");
    setErrorMsg("");

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setErrorMsg("No hay token de autenticación. Inicia sesión.");
      setShowError(true);
      return;
    }

    try {
      const response = await fetch(
        `https://api.inmero.co/sigma/main/maintenance/${maintenance.id_maintenance}/toggle-status/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token.startsWith("Bearer")
              ? token
              : `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();

      if (response.ok && result.success) {
        // Actualiza el estado local
        setMaintenanceData((prevData) =>
          prevData.map((item) =>
            item.id_maintenance === maintenance.id_maintenance
              ? {
                  ...item,
                  estado:
                    item.estado === "Habilitado"
                      ? "Deshabilitado"
                      : "Habilitado",
                  id_estado: item.estado === "Habilitado" ? 2 : 1,
                }
              : item
          )
        );
        setSuccessMsg(result.message || "Estado actualizado correctamente.");
        setShowSuccess(true);
      } else {
        setErrorMsg(result.message || "No se pudo actualizar el estado.");
        setShowError(true);
      }
    } catch (error) {
      setErrorMsg("Error al actualizar el estado del mantenimiento.");
      setShowError(true);
    }
  };

  const handleOpenAddMaintenanceModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleRefresh = () => {
    loadMaintenanceData();
  };

  // Nueva función para alternar estado
  const handleToggleStatus = async (maintenance) => {
    const nuevoEstado = maintenance.id_estado === 1 ? 2 : 1;
    const nuevoTextoEstado = nuevoEstado === 1 ? "Habilitado" : "Inactivo";

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(
        `https://api.inmero.co/sigma/main/maintenance/${maintenance.id_maintenance}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token.startsWith("Bearer")
              ? token
              : `Bearer ${token}`,
          },
          body: JSON.stringify({
            id_estado: nuevoEstado,
            estado: nuevoTextoEstado,
          }),
        }
      );
      const result = await response.json();

      if (response.ok && result.success) {
        // Actualiza el estado local
        setMaintenanceData((prevData) =>
          prevData.map((item) =>
            item.id_maintenance === maintenance.id_maintenance
              ? { ...item, id_estado: nuevoEstado, estado: nuevoTextoEstado }
              : item
          )
        );
        setSuccessMsg("Estado actualizado correctamente.");
        setShowSuccess(true);
      } else {
        setErrorMsg(
          result.message || "Error al actualizar el estado del mantenimiento."
        );
        setShowError(true);
      }
    } catch (error) {
      setErrorMsg("Error de conexión al actualizar el estado.");
      setShowError(true);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold parametrization-text">
            Gestión de Mantenimientos
          </h1>
        </div>

        {/* Mostrar error si existe */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative parametrization-text">
            <span className="block sm:inline parametrization-text">
              {error}
            </span>
            <button
              onClick={() => setError(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3 parametrization-text"
            >
              <span className="sr-only parametrization-text">Dismiss</span>×
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
            placeholder="Buscar por ID, nombre, descripción, tipo..."
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {globalFilter && (
            <div className="absolute -bottom-5 left-0 text-xs text-gray-500 parametrization-text">
              Filtrando por: "{globalFilter}"
            </div>
          )}
        </div>

        <button
          onClick={() => setIsFilterModalOpen(true)}
          className={`parametrization-filter-button flex justify-center items-center gap-2 cursor-pointer parametrization-text ${
            maintenanceTypeFilter || statusFilter
              ? "bg-blue-100 border-blue-300 text-blue-700"
              : ""
          }`}
        >
          <CiFilter className="w-4 h-4" />
          <span className="parametrization-text">Filtrar por</span>
          {(maintenanceTypeFilter || statusFilter) && (
            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full parametrization-text">
              {[maintenanceTypeFilter, statusFilter].filter(Boolean).length}
            </span>
          )}
        </button>

        {(maintenanceTypeFilter || statusFilter) && (
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
          onClick={handleOpenAddMaintenanceModal}
          className="parametrization-filter-button flex justify-center items-center gap-2 cursor-pointer parametrization-text"
        >
          <FaTools className="w-4 h-4" />
          <span className="parametrization-text">Agregar Mantenimiento</span>
        </button>
      </div>

      {/* Tabla de mantenimientos */}
      <TableList
        columns={columns}
        data={
          filteredData.length > 0 || maintenanceTypeFilter || statusFilter
            ? filteredData
            : maintenanceData
        }
        loading={loading}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        globalFilterFn={globalFilterFn}
        pageSizeOptions={[10, 20, 30, 50]}
        className="parametrization-table"
      />

      <EditMaintenanceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdated={loadMaintenanceData}
        maintenance={selectedMaintenance}
      />

      {/* Modal de agregar mantenimiento */}
      <CreateMaintenanceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={loadMaintenanceData}
      />

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title={
          <span className="parametrization-text">
            ¿Estás seguro de que quieres eliminar el mantenimiento?
          </span>
        }
        message={
          <span className="parametrization-text">
            {maintenanceToDelete
              ? `Mantenimiento: ${maintenanceToDelete.name}`
              : ""}
          </span>
        }
        confirmText={<span className="parametrization-text">Eliminar</span>}
        cancelText={<span className="parametrization-text">Cancelar</span>}
        confirmColor="btn-error"
      />

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title={
          <span className="parametrization-text">
            {successMsg.includes("eliminado") ? "¡Eliminado!" : "¡Activado!"}
          </span>
        }
        message={<span className="parametrization-text">{successMsg}</span>}
      />

      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        title={<span className="parametrization-text">Error</span>}
        message={<span className="parametrization-text">{errorMsg}</span>}
      />

      {/* Modal de advertencia */}
      <ErrorModal
        isOpen={showWarning}
        onClose={() => setShowWarning(false)}
        title={<span className="text-red-600 font-bold">Advertencia</span>}
        message={
          <span>
            Este mantenimiento está asociado a solicitudes o mantenimientos
            programados.
            <br />
            No se puede eliminar, pero será desactivado para que no esté
            disponible en futuros formularios.
          </span>
        }
        buttonText="Aceptar"
      />

      {/* Modal de filtros - componente separado */}
      <MaintenanceFilterModal
        open={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onClear={handleClearFilters}
        onApply={handleApplyFilters}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo de Mantenimiento */}
          <div>
            <label className="block text-sm font-medium text-primary mb-3 parametrization-text">
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

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-primary mb-3 parametrization-text">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none"
            >
              <option value="">Todos los estados</option>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </MaintenanceFilterModal>
    </div>
  );
};

export default GestorMantenimientos;
