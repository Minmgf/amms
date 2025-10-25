"use client";
import { useEffect, useMemo, useState } from "react";
import { FiSearch, FiFilter, FiEdit2, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import { FaCalendar, FaCheckCircle } from "react-icons/fa";
import { SuccessModal, ErrorModal, ConfirmModal } from "@/app/components/shared/SuccessErrorModal";
import FilterModal from "@/app/components/shared/FilterModal";
import RegisterDevice from "@/app/components/monitoring/RegisterEditDevice";
import { useTheme } from "@/contexts/ThemeContext";
import TableList from "@/app/components/shared/TableList";
import { createColumnHelper } from "@tanstack/react-table";
import React from "react";
import { getDevicesList, deleteDevice, toggleDeviceStatus } from "@/services/deviceService";

const page = () => {
  useTheme();
  const [globalFilter, setGlobalFilter] = useState("");
  const [data, setData] = useState([]);

  // Estados para el DeviceFormModal (Agregar/Editar Dispositivo)
  const [isDeviceFormModalOpen, setIsDeviceFormModalOpen] = useState(false);
  const [deviceFormMode, setDeviceFormMode] = useState("add");
  const [selectedDevice, setSelectedDevice] = useState(null);

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados de filtros
  const [statusFilter, setStatusFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  // Estado de modales de eliminar y confirmar 
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmDeactivateOpen, setIsConfirmDeactivateOpen] = useState(false);
  const [isConfirmActivateOpen, setIsConfirmActivateOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [error, setError] = useState(null);

  // Listar dispositivos registrados
  useEffect(() => {
    loadInitialData();
  }, []);

  // Aplicar filtros cada vez que cambian los filtros o los datos cargados
  useEffect(() => {
    applyFilters();
  }, [data, statusFilter, startDateFilter, endDateFilter]);

  //Función para obtener el listado de dispositivos registrados
  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDevicesList();
      if (response) {
        setData(response);
      } else {
        setError("No se pudieron cargar los Dispositivos.");
        setData([]);
      }
    } catch (err) {
      console.error("Error loading devices:", err);
      setError("Error al conectar con el servidor.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para aplicar filtros
  const applyFilters = () => {
    let filtered = data;

    // Filtro por estado
    if (statusFilter) {
      filtered = filtered.filter(
        (device) => device.status_id === parseInt(statusFilter)
      );
    }

    // Filtro por rango de fechas
    if (startDateFilter) {
      filtered = filtered.filter((device) => {
        const deviceDate = new Date(device.registration_date);
        const startDate = new Date(startDateFilter);
        return deviceDate >= startDate;
      });
    }

    if (endDateFilter) {
      filtered = filtered.filter((device) => {
        const deviceDate = new Date(device.registration_date);
        const endDate = new Date(endDateFilter);
        endDate.setDate(endDate.getDate() + 1);
        return deviceDate < endDate;
      });
    }

    setFilteredData(filtered);
  };

  // Obtener estados únicos para el select
  const uniqueStatuses = useMemo(() => {
    const statuses = data.map((device) => ({
      id: device.status_id,
      name: device.status_name,
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

  const handleDeviceRegistrationSuccess = (deviceData) => {
    if (deviceFormMode === "edit") {
      // Actualizar dispositivo existente
      setData(prevData =>
        prevData.map(device =>
          device.id === selectedDevice.id
            ? { ...device, ...deviceData, id: device.id }
            : device
        )
      );
      setModalTitle("Actualización Exitosa");
      setModalMessage("El dispositivo ha sido actualizado exitosamente.");
    } else {
      // Agregar nuevo dispositivo
      const newDevice = {
        id: data.length + 1,
        deviceName: deviceData.deviceName,
        imei: deviceData.imei,
        operationalStatus: 1,
        statusName: "Active",
        registerDate: new Date().toISOString().split('T')[0],
        monitoringParameters: deviceData.monitoringParameters
      };
      setData([...data, newDevice]);
      setModalTitle("Registro Exitoso");
      setModalMessage("El dispositivo ha sido registrado exitosamente.");
    }
    setIsSuccessModalOpen(true);
  };

  const handleOpenDeleteConfirm = (device) => {
    setSelectedDevice(device);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsConfirmDeleteOpen(false);

    if (!selectedDevice) return;

    try {
      const response = await deleteDevice(selectedDevice.id_device);

      if (response.success) {
        await loadInitialData();
        setModalTitle("Exito");
        setModalMessage(response.message || "El dispositivo ha sido eliminado exitosamente.");
        setIsSuccessModalOpen(true);
        setSelectedDevice(null);
      }
    } catch (error) {
      if (error?.response?.data?.code === 400 || error?.response?.data?.code === 409) {
        setModalTitle("Dispositivo con Asociaciones");
        const backendMessage = error?.response?.data?.message;
        setModalMessage(
          `${backendMessage} ¿Desea desactivarlo en su lugar? Esto lo ocultará de futuros formularios.`
        );
        setIsConfirmDeactivateOpen(true);
      } else {
        setModalTitle("Error");
        setModalMessage(
          error?.response?.data?.message ||
          "Ocurrió un error al eliminar el dispositivo. Por favor, inténtelo de nuevo."
        );
        setIsErrorModalOpen(true);
        setSelectedDevice(null);
      }
    }
  };

  // Función para abrir confirmación de activación
  const handleOpenActivateConfirm = (device) => {
    setSelectedDevice(device);
    setIsConfirmActivateOpen(true);
  };

  // Confirmar activación
  const handleConfirmActivate = async () => {
    setIsConfirmActivateOpen(false);
    
    if (!selectedDevice) return;

    try {
      const response = await toggleDeviceStatus(selectedDevice.id_device);      
      setModalTitle("Éxito");
      setModalMessage(response.message || "El dispositivo ha sido activado exitosamente.");
      setIsSuccessModalOpen(true);
      await loadInitialData();

    } catch (error) {
      setModalTitle("Error");
      setModalMessage(
        error?.response?.data?.message ||
        "Ocurrió un error al activar el dispositivo. Por favor, inténtelo de nuevo."
      );
      setIsErrorModalOpen(true);
    } finally {
      setSelectedDevice(null);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmDeleteOpen(false);
    setSelectedDevice(null);
  };

  // Handler para confirmar la desactivación
  const handleConfirmDeactivate = async () => {
    setIsConfirmDeactivateOpen(false);
    
    if (!selectedDevice) return;

    try {
      const response = await toggleDeviceStatus(selectedDevice.id_device);      
      setModalTitle("Éxito");
      setModalMessage(response.message || "El dispositivo ha sido desactivado exitosamente.");
      setIsSuccessModalOpen(true);
      await loadInitialData();
    } catch (error) {
      setModalTitle("Error");
      setModalMessage(
        error?.response?.data?.message ||
        "Ocurrió un error al desactivar el dispositivo. Por favor, inténtelo de nuevo."
      );
      setIsErrorModalOpen(true);
    } finally {
      setSelectedDevice(null);
    }
  };

  // Calcular el mensaje de confirmación de eliminación dinámicamente
  const deleteConfirmMessage = useMemo(() => {
    if (!selectedDevice) return "";
    return `¿Está seguro que desea eliminar el dispositivo "${selectedDevice?.name}"?`;
  }, [selectedDevice]);

  // Calcular mensaje de confirmación de activación
  const activateConfirmMessage = useMemo(() => {
    if (!selectedDevice) return "";
    return `¿Está seguro que desea activar el dispositivo "${selectedDevice?.name}"?`;
  }, [selectedDevice]);

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Nombre del Dispositivo",
        cell: (info) => <div className="text-primary">{info.getValue()}</div>,
      }),
      columnHelper.accessor("IMEI", {
        header: "IMEI",
        cell: (info) => <div className="text-secondary">{info.getValue()}</div>,
      }),
      columnHelper.accessor("status_id", {
        header: "Estado Operativo",
        cell: (info) => {
          const status_id = info.getValue();
          const status_name = info.row.original.status_name;
          return (
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${status_id === 1
                ? "bg-green-100 text-green-800"
                : "bg-pink-100 text-pink-800"
                }`}
            >
              {status_name}
            </span>
          );
        },
      }),
      columnHelper.accessor("registration_date", {
        header: "Fecha de Registro",
        cell: (info) => <div className="text-secondary">{formatDate(info.getValue())}</div>,
      }),
      columnHelper.accessor("id_device", {
        header: "Acciones",
        cell: (info) => {
          const device = info.row.original;
          const isActive = device.status_id === 1;

          return (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                aria-label="Edit Button"
                onClick={() => handleOpenDeviceFormModal("edit", info.getValue())}
                className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-green-500 hover:text-green-600 text-gray-700"
                title="Editar dispositivo"
              >
                <FiEdit2 className="w-3 h-3" /> Editar
              </button>

              {isActive ? (
                <button
                  aria-label="Delete Button"
                  onClick={() => handleOpenDeleteConfirm(device)}
                  className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-red-500 hover:text-red-600 text-gray-700"
                  title="Eliminar Dispositivo"
                >
                  <FiTrash2 className="w-3 h-3" /> Eliminar
                </button>
              ) : (
                <button
                  aria-label="Activate Button"
                  onClick={() => handleOpenActivateConfirm(device)}
                  className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-green-500 hover:text-green-600 text-gray-700"
                  title="Activar Dispositivo"
                >
                  <FaCheckCircle className="w-3 h-3" /> Activar
                </button>
              )}
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
          device.name?.toLowerCase().includes(searchTerm) ||
          String(device.IMEI)?.toLowerCase().includes(searchTerm)

      );
    }

    return finalData;
  }, [data, filteredData, statusFilter, startDateFilter, endDateFilter, globalFilter]);

  // Contar filtros activos
  const activeFiltersCount = [statusFilter, startDateFilter, endDateFilter].filter(
    Boolean
  ).length;

  //Formatear Fecha
  const formatDate = (dateString) => {
    if (!dateString) return "";
    // Toma solo la parte de la fecha antes de la "T"
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${year}/${month}/${day}`;
  };

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
              aria-label="Filter Button"
            >
              <FiFilter className="filter-icon w-4 h-4" />
              <span className="text-sm">Filtrar Por</span>
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
              aria-label="Add Device Button"
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
        isOpen={isConfirmDeleteOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message={deleteConfirmMessage}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmColor="btn-primary"
        cancelColor="btn-error"
      />

      {/* Modal de confirmación para activar */}
      <ConfirmModal
        isOpen={isConfirmActivateOpen}
        onClose={() => {
          setIsConfirmActivateOpen(false);
          setSelectedDevice(null);
        }}
        onConfirm={handleConfirmActivate}
        title="Confirmar Activación"
        message={activateConfirmMessage}
        confirmText="Activar"
        cancelText="Cancelar"
        confirmColor="btn-primary"
        cancelColor="btn-error"
      />

      {/* Modal de confirmación para desactivar */}
      <ConfirmModal
        isOpen={isConfirmDeactivateOpen}
        onClose={() => {
          setIsConfirmDeactivateOpen(false);
          setSelectedDevice(null);
        }}
        onConfirm={handleConfirmDeactivate}
        title={modalTitle}
        message={modalMessage}
        confirmText="Desactivar"
        cancelText="Cancelar"
        confirmColor="btn-primary"
        cancelColor="btn-error"
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={modalTitle || "Éxito"}
        message={modalMessage}
      />
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title={modalTitle || "Error"}
        message={modalMessage}
      />

      {/* Modal de Registro/Edición de Dispositivo */}
      <RegisterDevice
        isOpen={isDeviceFormModalOpen}
        onClose={handleCloseDeviceFormModal}
        onSuccess={handleDeviceRegistrationSuccess}
        deviceToEdit={deviceFormMode === "edit" ? selectedDevice : null}
      />
    </>
  );
};

export default page;