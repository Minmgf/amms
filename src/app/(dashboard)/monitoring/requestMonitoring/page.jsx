"use client";
import { useEffect, useMemo, useState } from "react";
import { FiSearch, FiFilter, FiX, FiEye } from "react-icons/fi";
import { FaCalendar, FaCheckCircle, FaHistory } from "react-icons/fa";
import { SuccessModal, ErrorModal } from "@/app/components/shared/SuccessErrorModal";
import FilterModal from "@/app/components/shared/FilterModal";
import { useTheme } from "@/contexts/ThemeContext";
import TableList from "@/app/components/shared/TableList";
import { createColumnHelper } from "@tanstack/react-table";
import React from "react";
import { getRequestMonitoringList } from "@/services/requestService";
import PermissionGuard from "@/app/(auth)/PermissionGuard";
import HistoricalDataModal from "@/app/components/monitoring/HistoricalDataModal";
import TrackingDashboardModal from "@/app/components/monitoring/TrackingDashboardModal";
import RequestHistoricalModal from "@/app/components/monitoring/RequestHistoricalModal";

const RequestMonitoringPage = () => {
  useTheme();
  const [globalFilter, setGlobalFilter] = useState("");
  const [data, setData] = useState([]);

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados de filtros
  const [statusFilter, setStatusFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  // Estado de modales
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [error, setError] = useState(null);
  const [isHistoricalModalOpen, setIsHistoricalModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isRequestHistoricalModalOpen, setIsRequestHistoricalModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadInitialData();
  }, []);

  // Aplicar filtros cada vez que cambian los filtros o los datos cargados
  useEffect(() => {
    applyFilters();
  }, [data, statusFilter, startDateFilter, endDateFilter]);

  // Función para cargar datos del API
  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRequestMonitoringList();

      if (response.status && response.data) {
        // Mapear los datos del API a la estructura del componente
        const mappedData = response.data.map((item) => ({
          id: item.code,
          tracking_code: item.code,
          customer_id: item.customer_id,
          legal_entity_name: item.legal_entity_name,
          client_name: item.customer_name,
          place_name: item.place_name,
          status_id: item.request_status_id,
          status_name: item.request_status_name,
          scheduled_date: item.scheduled_date,
          completion_date: item.completion_date,
          city_id: item.city_id,
        }));
        setData(mappedData);
      } else {
        setError("No se pudieron cargar las solicitudes.");
        setData([]);
      }
    } catch (err) {
      console.error("Error loading request monitoring:", err);
      setModalTitle("Error");
      setModalMessage(
        err?.response?.data?.message ||
        "Error al conectar con el servidor. Por favor, inténtelo de nuevo."
      );
      setIsErrorModalOpen(true);
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
        (request) => request.status_id === parseInt(statusFilter)
      );
    }

    // Filtro por rango de fechas (fecha programada)
    if (startDateFilter) {
      filtered = filtered.filter((request) => {
        const requestDate = new Date(request.scheduled_date);
        const startDate = new Date(startDateFilter);
        return requestDate >= startDate;
      });
    }

    if (endDateFilter) {
      filtered = filtered.filter((request) => {
        const requestDate = new Date(request.scheduled_date);
        const endDate = new Date(endDateFilter);
        endDate.setDate(endDate.getDate() + 1);
        return requestDate < endDate;
      });
    }

    setFilteredData(filtered);
  };

  // Obtener estados únicos para el select
  const uniqueStatuses = useMemo(() => {
    const statuses = data.map((request) => ({
      id: request.status_id,
      name: request.status_name,
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

  // Función para ver monitoreo en tiempo real
  const handleViewMonitoring = (requestCode) => {
    // Buscar los datos completos de la solicitud
    const request = data.find(req => req.tracking_code === requestCode);
    if (request) {
      setSelectedRequest(request);
      setIsTrackingModalOpen(true);
    }
  };

  // Función para ver historial de monitoreo
  const handleViewHistory = (requestCode) => {
    // Buscar los datos completos de la solicitud
    const request = data.find(req => req.tracking_code === requestCode);
    if (request) {
      setSelectedRequest(request);
      setIsRequestHistoricalModalOpen(true);
    }
  };

  // Función para abrir modal de historial por maquinaria/operador
  const handleOpenHistoricalModal = () => {
    setIsHistoricalModalOpen(true);
  };

  // Función para obtener clase de badge según el estado
  const getStatusClass = (statusId) => {
    switch (statusId) {
      case 20:
        return "bg-yellow-100 text-yellow-800"; // Pendiente
      case 21:
        return "bg-blue-100 text-blue-800"; // En proceso
      case 22:
        return "bg-green-100 text-green-800"; // Finalizada
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("tracking_code", {
        header: "Código de Seguimiento",
        cell: (info) => (
          <div className="text-primary font-medium">{info.getValue()}</div>
        ),
      }),
      columnHelper.accessor("client_name", {
        header: "Cliente",
        cell: (info) => <div className="text-secondary">{info.getValue()}</div>,
      }),
      columnHelper.accessor("place_name", {
        header: "Nombre del Lugar",
        cell: (info) => <div className="text-secondary">{info.getValue()}</div>,
      }),
      columnHelper.accessor("status_id", {
        header: "Estado",
        cell: (info) => {
          const status_name = info.row.original.status_name;
          return (
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                info.getValue()
              )}`}
            >
              {status_name}
            </span>
          );
        },
      }),
      columnHelper.accessor("scheduled_date", {
        header: "Fecha Programada",
        cell: (info) => (
          <div className="text-secondary">{formatDate(info.getValue())}</div>
        ),
      }),
      columnHelper.accessor("completion_date", {
        header: "Fecha de Finalización",
        cell: (info) => (
          <div className="text-secondary">
            {info.getValue() ? formatDate(info.getValue()) : "N/A"}
          </div>
        ),
      }),
      columnHelper.accessor("id", {
        header: "Acciones",
        cell: (info) => {
          const request = info.row.original;
          const isCompleted = request.status_id === 22; // Finalizada
          const isInProcess = request.status_id === 21; // En proceso

          return (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {isInProcess && (
                <PermissionGuard permission={170}>
                  <button
                    aria-label="View Monitoring Button"
                    onClick={() => handleViewMonitoring(request.tracking_code)}
                    className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-blue-500 hover:text-blue-600 text-gray-700"
                    title="Ver monitoreo"
                  >
                    <FiEye className="w-3 h-3" /> Ver Monitoreo
                  </button>
                </PermissionGuard>
              )}
              {isCompleted && (
                <PermissionGuard permission={172}>
                  <button
                    aria-label="View History Button"
                    onClick={() => handleViewHistory(request.tracking_code)}
                    className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-green-500 hover:text-green-600 text-gray-700"
                    title="Ver historial de monitoreo"
                  >
                    <FaHistory className="w-3 h-3" /> Ver Historial
                  </button>
                </PermissionGuard>
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
    let finalData =
      statusFilter || startDateFilter || endDateFilter ? filteredData : data;

    // Filtro por texto (código, cliente o lugar)
    if (globalFilter.trim() !== "") {
      const searchTerm = globalFilter.toLowerCase();
      finalData = finalData.filter(
        (request) =>
          request.tracking_code?.toLowerCase().includes(searchTerm) ||
          request.client_name?.toLowerCase().includes(searchTerm) ||
          request.place_name?.toLowerCase().includes(searchTerm)
      );
    }

    return finalData;
  }, [data, filteredData, statusFilter, startDateFilter, endDateFilter, globalFilter]);

  // Contar filtros activos
  const activeFiltersCount = [statusFilter, startDateFilter, endDateFilter].filter(
    Boolean
  ).length;

  // Formatear Fecha
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${year}-${month}-${day}`;
  };

  return (
    <>
      <div className="parametrization-page p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 md:mb-10">
            <h1 className="parametrization-header text-2xl md:text-3xl font-bold">
              Monitoreo de Solicitudes
            </h1>
          </div>

          {/* Filter and Search */}
          <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-4 justify-between lg:justify-start">
            <div className="relative flex-1 max-w-md">
              <div className="flex items-center parametrization-input rounded-md px-3 py-2 w-72">
                <FiSearch className="text-secondary w-4 h-4 mr-2" />
                <input
                  type="text"
                  placeholder="Buscar por código, cliente o lugar..."
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
            <PermissionGuard permission={172}>
              <button
                onClick={handleOpenHistoricalModal}
                className="parametrization-filter-button flex items-center space-x-2 px-3 md:px-4 py-2 transition-colors w-fit"
                aria-label="Historical per Machine/Operator"
              >
                <FaHistory className="w-4 h-4" />
                <span className="text-sm">Historial por Maquinaria/Operador</span>
              </button>
            </PermissionGuard>
          </div>

          {/* Table */}
          <PermissionGuard permission={170}>
            <TableList
              columns={columns}
              data={displayData}
              loading={loading}
              globalFilter={globalFilter}
              onGlobalFilterChange={setGlobalFilter}
            />
          </PermissionGuard>
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
          {/* Estado Filter */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary mb-3">
              <FaCheckCircle className="inline w-4 h-4 mr-2" />
              Estado
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
              Fecha Programada (Desde)
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
              Fecha Programada (Hasta)
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

      {/* Historical Data Machine/Operator Modal */}
      <HistoricalDataModal
        isOpen={isHistoricalModalOpen}
        onClose={() => setIsHistoricalModalOpen(false)}
      />

      {/* Tracking Dashboard Modal */}
      <TrackingDashboardModal
        isOpen={isTrackingModalOpen}
        onClose={() => {
          setIsTrackingModalOpen(false);
          setSelectedRequest(null);
        }}
        requestData={selectedRequest}
      />

      {/* Request Historical Modal */}
      <RequestHistoricalModal
        isOpen={isRequestHistoricalModalOpen}
        onClose={() => {
          setIsRequestHistoricalModalOpen(false);
          setSelectedRequest(null);
        }}
        requestData={selectedRequest}
      />
    </>
  );
};

export default RequestMonitoringPage;

