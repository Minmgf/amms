"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { FiSearch, FiFilter, FiEye, FiEdit2, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import { FaCalendar, FaCheckCircle } from "react-icons/fa";
import { SuccessModal, ErrorModal, ConfirmModal } from "@/app/components/shared/SuccessErrorModal";
import FilterModal from "@/app/components/shared/FilterModal";
import { useTheme } from "@/contexts/ThemeContext";

import TableList from "@/app/components/shared/TableList";
import { createColumnHelper } from "@tanstack/react-table";
import React from "react";

const page = () => {
  useTheme();
  const [globalFilter, setGlobalFilter] = useState("");
  const [data, setData] = useState([
    {
      id: 1,
      deviceName: "AgroLink-001",
      imei: "357984562034378",
      operationalStatus: 1,
      statusName: "Active",
      registerDate: "2025-10-18",
    },
    {
      id: 2,
      deviceName: "JiLink-Tractor-05",
      imei: "864578902346677",
      operationalStatus: 2,
      statusName: "Inactive",
      registerDate: "2025-09-12",
    },
    {
      id: 3,
      deviceName: "FarmTech-012",
      imei: "123456789012345",
      operationalStatus: 1,
      statusName: "Active",
      registerDate: "2025-08-05",
    },
  ]);

  // Estados para el DeviceFormModal (Agregar/Editar Dispositivo)
  const [isDeviceFormModalOpen, setIsDeviceFormModalOpen] = useState(false);
  const [deviceFormMode, setDeviceFormMode] = useState("add");
  const [selectedDevice, setSelectedDevice] = useState(null);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados de filtros
  const [statusFilter, setStatusFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [isConfirmDeactivateOpen, setIsConfirmDeactivateOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  // Aplicar filtros cuando cambien los datos o los filtros
  useEffect(() => {
    applyFilters();
  }, [data, statusFilter, startDateFilter, endDateFilter]);

  // Función para aplicar filtros
  const applyFilters = () => {
    let filtered = data;

    // Filtro por estado
    if (statusFilter) {
      filtered = filtered.filter(
        (device) => device.operationalStatus === parseInt(statusFilter)
      );
    }

    // Filtro por rango de fechas
    if (startDateFilter) {
      filtered = filtered.filter(
        (device) => device.registerDate >= startDateFilter
      );
    }

    if (endDateFilter) {
      filtered = filtered.filter(
        (device) => device.registerDate <= endDateFilter
      );
    }

    setFilteredData(filtered);
  };

  // Obtener estados únicos para el select
  const uniqueStatuses = useMemo(() => {
    const statuses = data.map((device) => ({
      id: device.operationalStatus,
      name: device.statusName,
    }));
    const uniqueMap = new Map(statuses.map((s) => [s.id, s]));
    return Array.from(uniqueMap.values());
  }, [data]);

  // Handlers para el modal de filtros
  const handleApplyFilters = () => {
    applyFilters();
    setFilterModalOpen(false);
  };

  const handleClearFilters = () => {
    setStatusFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    applyFilters();
  };

  // Funciones para manejar el DeviceFormModal
  const handleOpenDeviceFormModal = (mode, deviceId) => {
    const device = data.find((d) => d.id === deviceId);
    setDeviceFormMode(mode);
    setSelectedDevice(device);
    setIsDeviceFormModalOpen(true);
  };

  const handleCloseDeviceFormModal = () => {
    setIsDeviceFormModalOpen(false);
    setSelectedDevice(null);
    setDeviceFormMode("add");
  };

  const handleOpenDeleteConfirm = useCallback(
    (deviceId) => {
      const device = data.find((d) => d.id === deviceId);
      setPendingDelete(deviceId);
      setConfirmMessage(
        `¿Está seguro que desea eliminar el dispositivo "${device?.deviceName}"?`
      );
      setConfirmModalOpen(true);
    },
    [data]
  );

  const handleConfirmDelete = useCallback(() => {
    if (!pendingDelete) return;

    setLoading(true);
    setConfirmModalOpen(false);

    try {
      // Simulación: verificar si el dispositivo tiene asociaciones
      const device = data.find((d) => d.id === pendingDelete);
      const hasAssociations = device?.id === 1 || device?.id === 3; // Simular que dispositivos 1 y 3 tienen asociaciones

      if (hasAssociations) {
        // El dispositivo tiene asociaciones, no se puede eliminar
        setModalTitle("Dispositivo con Asociaciones");
        setModalMessage(
          `El dispositivo "${device?.deviceName}" está asociado con maquinarias u otros registros y no puede ser eliminado. ¿Desea desactivarlo en su lugar? Esto lo ocultará de futuros formularios.`
        );
        setIsConfirmDeactivateOpen(true);
        setLoading(false);
        return;
      }

      // Si no tiene asociaciones, eliminar directamente
      setData(data.filter((device) => device.id !== pendingDelete));
      setModalTitle("Eliminación Exitosa");
      setModalMessage("El dispositivo ha sido eliminado exitosamente.");
      setSuccessOpen(true);
    } catch (error) {
      setModalTitle("Error");
      setModalMessage(
        error?.response?.data?.detail ?? "Error al eliminar el dispositivo"
      );
      setErrorOpen(true);
    } finally {
      setLoading(false);
      setPendingDelete(null);
    }
  }, [pendingDelete, data]);

  const handleCancelDelete = useCallback(() => {
    setConfirmModalOpen(false);
    setPendingDelete(null);
    setConfirmMessage("");
  }, []);

  // Handler para confirmar la desactivación
  const handleConfirmDeactivate = useCallback(() => {

    setIsConfirmDeactivateOpen(false);
    setLoading(true);

    try {
      // Actualizar el estado del dispositivo a inactivo
      setData(prevData =>
        prevData.map(device =>
          device.id === pendingDelete
            ? {
              ...device,
              operationalStatus: 2,
              statusName: "Inactive"
            }
            : device
        )
      );

      setModalTitle("Estado Actualizado");
      setModalMessage("El dispositivo ha sido desactivado exitosamente.");
      setSuccessOpen(true);
    } catch (error) {
      setModalTitle("Error");
      setModalMessage(
        error?.response?.data?.detail ?? "Error al desactivar el dispositivo"
      );
      setErrorOpen(true);
    } finally {
      setLoading(false);
      setPendingDelete(null);
    }
  }, [pendingDelete]);

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("deviceName", {
        header: "Nombre del Dispositivo",
        cell: (info) => <div className="text-primary">{info.getValue()}</div>,
      }),
      columnHelper.accessor("imei", {
        header: "IMEI",
        cell: (info) => <div className="text-secondary">{info.getValue()}</div>,
      }),
      columnHelper.accessor("operationalStatus", {
        header: "Estado Operativo",
        cell: (info) => {
          const statusId = info.getValue();
          const statusName = info.row.original.statusName;
          return (
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusId === 1
                ? "bg-green-100 text-green-800"
                : "bg-pink-100 text-pink-800"
                }`}
            >
              {statusName}
            </span>
          );
        },
      }),
      columnHelper.accessor("registerDate", {
        header: "Fecha de Registro",
        cell: (info) => <div className="text-secondary">{info.getValue()}</div>,
      }),
      columnHelper.accessor("id", {
        header: "Acciones",
        cell: (info) => {
          return (
            <div className="flex space-x-2">
              <button
                aria-label="Edit Button"
                onClick={() =>
                  handleOpenDeviceFormModal("edit", info.getValue())
                }
                className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-green-500 hover:text-green-600 text-gray-700"
                title="Editar dispositivo"
              >
                <FiEdit2 className="w-3 h-3" /> Editar
              </button>
              <button
                aria-label="Delete Button"
                onClick={() => handleOpenDeleteConfirm(info.getValue())}
                className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-red-500 hover:text-red-600 text-gray-700"
                title="Eliminar Dispositivo"
              >
                <FiTrash2 className="w-3 h-3" /> Eliminar
              </button>
            </div>
          );
        },
      }),
    ],
    [data]
  );

  // Datos finales para mostrar (filtrados o todos)
  const displayData = useMemo(() => {
    // Base: datos filtrados por estado y fechas
    let finalData = statusFilter || startDateFilter || endDateFilter ? filteredData : data;

    // Filtro por texto (nombre o IMEI)
    if (globalFilter.trim() !== "") {
      const searchTerm = globalFilter.toLowerCase();
      finalData = finalData.filter(
        (device) =>
          device.deviceName.toLowerCase().includes(searchTerm) ||
          device.imei.toLowerCase().includes(searchTerm)
      );
    }

    return finalData;
  }, [data, filteredData, statusFilter, startDateFilter, endDateFilter, globalFilter]);


  // Contar filtros activos
  const activeFiltersCount = [statusFilter, startDateFilter, endDateFilter].filter(
    Boolean
  ).length;

  return (
    <>
      <div className="parametrization-page p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 md:mb-10">
            <h1 className="parametrization-header text-2xl md:text-3xl font-bold">
              Gestión de Dispositivos
            </h1>
          </div>

          {/* Filter, Search and Add */}
          <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-4 justify-between lg:justify-start">
            <div className="relative flex-1 max-w-md">
              <div className="flex items-center parametrization-input rounded-md px-3 py-2 w-72">
                <FiSearch className="text-secondary w-4 h-4 mr-2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o IMEI..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="flex-1 outline-none bg-transparent"
                />
                {globalFilter && (
                  <button
                    onClick={() => setGlobalFilter("")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <button
              className={`parametrization-filter-button flex items-center space-x-2 px-3 md:px-4 py-2 transition-colors w-fit ${activeFiltersCount > 0
                ? "bg-blue-100 border-blue-300 text-blue-700"
                : ""
                }`}
              onClick={() => setFilterModalOpen(true)}
            >
              <FiFilter className="filter-icon w-4 h-4" />
              <span className="text-sm">Filtrar</span>
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-red-500 hover:text-red-700 underline flex items-center gap-1"
              >
                <FiX className="w-3 h-3" /> Limpiar filtros
              </button>
            )}

            <button
              onClick={() => handleOpenDeviceFormModal("add")}
              className="parametrization-filter-button flex items-center space-x-2 px-3 md:px-4 py-2 transition-colors w-fit bg-black text-white hover:bg-gray-800"
            >
              <FiPlus className="w-4 h-4" />
              <span className="text-sm">Nuevo Dispositivo</span>
            </button>
          </div>

          {/* Table */}
          <TableList
            columns={columns}
            data={displayData}
            loading={loading}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
          />
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onClear={handleClearFilters}
        onApply={handleApplyFilters}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Estado Operativo Filter */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary mb-3">
              <FaCheckCircle className="inline w-4 h-4 mr-2" />
              Estado Operativo
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none"
            >
              <option value="">Todos los estados</option>
              {uniqueStatuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha Inicio Filter */}
          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              <FaCalendar className="inline w-4 h-4 mr-2" />
              Fecha de Registro (Desde)
            </label>
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>

          {/* Fecha Fin Filter */}
          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              <FaCalendar className="inline w-4 h-4 mr-2" />
              Fecha de Registro (Hasta)
            </label>
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              min={startDateFilter}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>
        </div>
      </FilterModal>

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message={confirmMessage}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* Modal de confirmación para desactivar */}
      <ConfirmModal
        isOpen={isConfirmDeactivateOpen}
        onClose={() => {
          setIsConfirmDeactivateOpen(false);
          setPendingDelete(null);
        }}
        onConfirm={handleConfirmDeactivate}
        title={modalTitle}
        message={modalMessage}
        confirmText="Desactivar"
        cancelText="Cancelar"
        confirmColor="btn-success"
        cancelColor="btn-error"
      />

      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title={modalTitle || "Éxito"}
        message={modalMessage}
      />
      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title={modalTitle || "Error"}
        message={modalMessage}
      />
    </>
  );
};

export default page;