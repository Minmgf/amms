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
import {
  getMaintenanceList,
  getMaintenanceTypes,
  updateMaintenance,
  toggleMaintenanceStatus,
  deleteMaintenance,
} from "@/services/maintenanceService";
import { Edit } from "lucide-react";
import CreateMaintenanceModal from "@/app/components/maintenance/machineMaintenance/createMaintenanceModal";
import EditMaintenanceModal from "@/app/components/maintenance/machineMaintenance/editMaintenanceModal";
import {
  SuccessModal,
  ErrorModal,
  ConfirmModal,
} from "@/app/components/shared/SuccessErrorModal";
import FilterModal from "@/app/components/shared/FilterModal";

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
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  // Estados para modales de detalles y edición
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);

  // Datos precargados para filtros
  const [availableMaintenanceTypes, setAvailableMaintenanceTypes] = useState(
    []
  );
  const [availableStatuses, setAvailableStatuses] = useState([]);

  // Estados para mensajes de éxito y error
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [maintenanceToDelete, setMaintenanceToDelete] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  // Nuevo estado para saber si hay que desactivar después del warning
  const [pendingDeactivate, setPendingDeactivate] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadMaintenanceData();
  }, []);

  // Aplicar filtros cuando cambien los datos o los filtros
  useEffect(() => {
    applyFilters();
  }, [maintenanceData]);

  // Efecto para cargar tipos de mantenimiento
  useEffect(() => {
    async function fetchTypes() {
      try {
        const data = await getMaintenanceTypes();
        // Ajusta el mapeo según la estructura real de la respuesta
        const options = Array.isArray(data)
          ? data.map((t) => ({
              id: t.id_types || t.id,
              label: t.name,
            }))
          : [];
        setTypeOptions(options);
        if (options.length) setTypeId(options[0].id);
      } catch (e) {
        setTypeOptions([]);
      }
    }
    fetchTypes();
  }, []);

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

        // Extraer estados únicos para filtros
        const uniqueStatuses = [
          ...new Set(response.map((item) => item.estado).filter(Boolean)),
        ];
        setAvailableStatuses(uniqueStatuses);
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
    setFilteredData([]);
    setIsFilterModalOpen(false);
  };

  // Función para obtener color del estado
  const getStatusColor = (status_id) => {
    const colors = {
      1: "bg-green-100 text-green-800", // Habilitado
      2: "bg-red-100 text-red-800",     // Inactivo
    };
    return colors[status_id] || "bg-gray-100 text-gray-800";
  };

  const statusLabel = (status) => {
    if (status === "Habilitado" || status === "Activo") return "Habilitado";
    if (status === "Inactivo" || status === "Deshabilitado") return "Inactivo";
    return status;
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
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
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
          const maintenance = row.original;
          const status_id = maintenance.id_estado;
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status_id)}`}
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
          const isActive = maintenance.estado === "Activo";
          const isInactive = maintenance.estado === "Inactivo";

          return (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => handleEdit(maintenance)}
                className="inline-flex items-center px-3 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-gray-500 hover:text-gray-600 cursor-pointer"
                title="Editar mantenimiento"
              >
                <FaPen className="w-3 h-3" />
                Editar
              </button>
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
              {isInactive && (
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

  const handleDelete = (maintenance) => {
    setMaintenanceToDelete(maintenance);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setShowConfirm(false);
    const maintenance = maintenanceToDelete;
    if (!maintenance) return;

    try {
      await deleteMaintenance(maintenance.id_maintenance);
      setMaintenanceData((prevData) =>
        prevData.filter(
          (item) => item.id_maintenance !== maintenance.id_maintenance
        )
      );
      setSuccessMsg("Mantenimiento eliminado exitosamente.");
      setShowSuccess(true);
    } catch (error) {
      // Si el error es 409 (Conflict), muestra advertencia y guarda el mantenimiento pendiente
      if (error?.response?.status === 409) {
        setPendingDeactivate(maintenance);
        setShowWarning(true);
      } else {
        setErrorMsg("Error al eliminar el mantenimiento.");
        setShowError(true);
      }
    }
  };

  const handleEnable = async (maintenance) => {
    try {
      const result = await toggleMaintenanceStatus(maintenance.id_maintenance);

      setMaintenanceData((prevData) =>
        prevData.map((item) =>
          item.id_maintenance === maintenance.id_maintenance
            ? {
                ...item,
                estado: item.estado === "Activo" ? "Inactivo" : "Activo",
                id_estado: item.estado === "Activo" ? 2 : 1,
              }
            : item
        )
      );
      setSuccessMsg(result.message || "Estado actualizado correctamente.");
      setShowSuccess(true);
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

  const handleToggleStatus = async (maintenance) => {
    const nuevoEstado = maintenance.id_estado === 1 ? 2 : 1;
    const nuevoTextoEstado = nuevoEstado === 1 ? "Habilitado" : "Inactivo";

    try {
      const result = await updateMaintenance(maintenance.id_maintenance, {
        id_estado: nuevoEstado,
        estado: nuevoTextoEstado,
        name: maintenance.name,
        description: maintenance.description,
        maintenance_type: maintenance.maintenance_type ?? maintenance.tipo_mantenimiento,
        responsible_user: maintenance.responsible_user,
      });

      if (result && result.success) {
        setMaintenanceData((prevData) =>
          prevData.map((item) =>
            item.id_maintenance === maintenance.id_maintenance
              ? {
                  ...item,
                  estado: result.data?.estado ?? item.estado,
                  id_estado: result.data?.id_estado ?? item.id_estado,
                }
              : item
          )
        );
        setSuccessMsg(result.message || "Estado actualizado correctamente.");
        setShowSuccess(true);
      } else {
        setErrorMsg(
          result?.message || "Error al actualizar el estado del mantenimiento."
        );
        setShowError(true);
      }
    } catch (error) {
      setErrorMsg("Error de conexión al actualizar el estado.");
      setShowError(true);
    }
  };

  const handleEditMaintenance = async (id, payload) => {
    try {
      await updateMaintenance(id, payload);
      loadMaintenanceData();
      setSuccessMsg("Mantenimiento actualizado correctamente.");
      setShowSuccess(true);
    } catch (error) {
      setErrorMsg("Error al actualizar el mantenimiento.");
      setShowError(true);
    }
  };

  // Cuando el usuario cierra el modal de advertencia, desactiva el mantenimiento
  const handleWarningAccept = async () => {
    setShowWarning(false);
    if (pendingDeactivate) {
      await handleEnable(pendingDeactivate); 
      setPendingDeactivate(null);
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
        {globalFilter && (
          <button
            onClick={() => setGlobalFilter("")}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Limpiar búsqueda
          </button>
        )}

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
          filteredData.length > 0
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
            {successMsg.includes("eliminado")
              ? "¡Eliminado!"
              : successMsg.includes("desactivado")
              ? "¡Desactivado!"
              : "¡Activado!"}
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
        onClose={handleWarningAccept}
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
      <FilterModal
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
      </FilterModal>
    </div>
  );
};

export default GestorMantenimientos;
