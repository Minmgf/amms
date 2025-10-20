"use client";
import TableList from "@/app/components/shared/TableList";
import FilterModal from "@/app/components/shared/FilterModal";
import ServiceFilterFields from "@/app/components/request/services/ServiceFilterFields";
import CreateEditServiceModal from "@/app/components/request/services/CreateEditServiceModal";
import { getServiceColumns } from "@/app/components/request/services/serviceColumns";
import { ConfirmModal, ErrorModal } from "@/app/components/shared/SuccessErrorModal";
import { getServicesList } from "@/services/serviceService";
import React, { useState, useMemo, useEffect } from "react";
import { CiFilter } from "react-icons/ci";
import { FaPlus, FaTimes } from "react-icons/fa";
import PermissionGuard from "@/app/(auth)/PermissionGuard";

/**
 * ServicesView Component
 *
 * Página principal para la gestión de servicios.
 * Muestra una tabla con listado de servicios, búsqueda global y filtros avanzados.
 *
 * Características:
 * - Tabla sortable y paginada usando TanStack Table
 * - Búsqueda global en todos los campos
 * - Filtros avanzados con modal (impuestos, estado, unidad, rango de precio)
 * - Contador de filtros activos
 * - Diseño responsive
 */
const ServicesView = () => {
  // Estado de búsqueda global
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados de datos
  const [servicesData, setServicesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // Estados de filtros
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [taxRateFilter, setTaxRateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [priceMinFilter, setPriceMinFilter] = useState(0);
  const [priceMaxFilter, setPriceMaxFilter] = useState(1000000);

  // Estados de modales
  const [isCreateServiceModalOpen, setIsCreateServiceModalOpen] = useState(false);
  const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedService, setSelectedService] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [servicesData, taxRateFilter, statusFilter, unitFilter, priceMinFilter, priceMaxFilter]);

  /**
   * Carga los datos iniciales usando la API real
   */
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const response = await getServicesList();
      setServicesData(response?.data || response || []);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
        "Error al cargar los servicios. Por favor, intente nuevamente."
      );
      setIsErrorModalOpen(true);
      setServicesData([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtiene valores únicos para los filtros
   */
  const uniqueStatuses = useMemo(() => {
    const statuses = servicesData.map((service) => service.status_name).filter(Boolean);
    return [...new Set(statuses)];
  }, [servicesData]);

  const uniqueUnits = useMemo(() => {
    const units = servicesData.map((service) => service.unit_name).filter(Boolean);
    return [...new Set(units)];
  }, [servicesData]);

  /**
   * Aplica todos los filtros activos sobre los datos
   */
  const applyFilters = () => {
    let filtered = servicesData;

    if (taxRateFilter) {
      filtered = filtered.filter((service) => {
        const taxDisplay = service.is_vat_exempt ? "exento" : `${service.tax_rate}`;
        return taxDisplay.toLowerCase().includes(taxRateFilter.toLowerCase());
      });
    }

    if (statusFilter) {
      filtered = filtered.filter((service) => service.status_name === statusFilter);
    }

    if (unitFilter) {
      filtered = filtered.filter((service) => service.unit_name === unitFilter);
    }

    if (priceMinFilter > 0 || priceMaxFilter < 1000000) {
      filtered = filtered.filter(
        (service) =>
          service.base_price >= priceMinFilter && service.base_price <= priceMaxFilter
      );
    }

    setFilteredData(filtered);
  };

  /**
   * Maneja la aplicación de filtros desde el modal
   */
  const handleApplyFilters = () => {
    applyFilters();
    setIsFilterModalOpen(false);
  };

  /**
   * Limpia todos los filtros activos
   */
  const handleClearFilters = () => {
    setTaxRateFilter("");
    setStatusFilter("");
    setUnitFilter("");
    setPriceMinFilter(0);
    setPriceMaxFilter(1000000);
  };

  /**
   * Función de filtro global personalizada
   */
  const globalFilterFn = useMemo(() => {
    return (row, columnId, filterValue) => {
      if (!filterValue) return true;

      const searchTerm = filterValue.toLowerCase().trim();
      if (!searchTerm) return true;

      const service = row.original;

      const taxDisplay = service.is_vat_exempt ? "exento" : `${service.tax_rate}%`;

      const searchableFields = [
        service.id?.toString(),
        service.name,
        service.base_price?.toString(),
        service.unit_name,
        taxDisplay,
        service.status_name,
      ];

      return searchableFields.some((field) => {
        if (!field) return false;
        return field.toString().toLowerCase().includes(searchTerm);
      });
    };
  }, []);

  /**
   * Cuenta el número de filtros activos
   */
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (taxRateFilter) count++;
    if (statusFilter) count++;
    if (unitFilter) count++;
    if (priceMinFilter > 0 || priceMaxFilter < 1000000) count++;
    return count;
  }, [taxRateFilter, statusFilter, unitFilter, priceMinFilter, priceMaxFilter]);

  /**
   * Verifica si hay algún filtro activo
   */
  const hasActiveFilters = activeFiltersCount > 0;

  /**
   * Maneja la edición de un servicio
   */
  const handleEdit = (service) => {
    setSelectedService(service);
    setIsEditServiceModalOpen(true);
  };

  /**
   * Maneja la eliminación de un servicio (abre el modal de confirmación)
   */
  const handleDelete = (service) => {
    setSelectedService(service);
    setIsConfirmDeleteOpen(true);
  };

  /**
   * Confirma y ejecuta la eliminación del servicio
   */
  const handleConfirmDelete = async () => {
    setIsConfirmDeleteOpen(false);

    if (!selectedService) return;

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      setServicesData((prevData) =>
        prevData.filter((service) => service.id !== selectedService.id)
      );
    } catch (error) {
      setErrorMessage("Error al eliminar el servicio. Por favor, intente nuevamente.");
      setIsErrorModalOpen(true);
    } finally {
      setSelectedService(null);
    }
  };

  /**
   * Maneja la creación de un nuevo servicio
   */
  const handleAddNewService = () => {
    setIsCreateServiceModalOpen(true);
  };

  // Obtener columnas de la tabla
  const columns = useMemo(() => getServiceColumns(handleEdit, handleDelete), []);

  // Determinar qué datos mostrar (filtrados o todos)
  const dataToDisplay = hasActiveFilters ? filteredData : servicesData;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold parametrization-text">
          Gestión de Servicios
        </h1>
      </div>

      {/* Barra de búsqueda y acciones */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Input de búsqueda global */}
        <div className="flex-1 max-w-md relative">
          <input
            id="search"
            type="text"
            placeholder="Buscar por nombre, precio, unidad..."
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            aria-label="Buscar servicios"
          />
          {globalFilter && (
            <button
              onClick={() => setGlobalFilter("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Limpiar búsqueda"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Botón de filtros */}
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className={`parametrization-filter-button ${hasActiveFilters ? "bg-blue-100 border-blue-300 text-blue-700" : ""
            }`}
          aria-label="Abrir filtros"
        >
          <CiFilter className="w-4 h-4" />
          Filtrar por
          {hasActiveFilters && (
            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Botón limpiar filtros */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-red-500 hover:text-red-700 underline flex items-center gap-1"
            aria-label="Limpiar filtros"
          >
            <FaTimes className="w-3 h-3" /> Limpiar filtros
          </button>
        )}

        {/* Botón agregar servicio */}
        <PermissionGuard permission={140}>
          <button
            onClick={handleAddNewService}
            className="parametrization-filter-button bg-black text-white hover:bg-gray-800"
            aria-label="Agregar nuevo servicio"
          >
            <FaPlus className="w-4 h-4" />
            Nuevo Servicio
          </button>
        </PermissionGuard>
      </div>

      {/* Tabla de servicios */}
      <PermissionGuard permission={142}>
        <TableList
          columns={columns}
          data={dataToDisplay}
          loading={loading}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          globalFilterFn={globalFilterFn}
          pageSizeOptions={[10, 20, 30, 50]}
        />
      </PermissionGuard>

      {/* Modal de filtros */}
      <FilterModal
        open={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onClear={handleClearFilters}
        onApply={handleApplyFilters}
      >
        <ServiceFilterFields
          taxesFilter={taxRateFilter}
          setTaxesFilter={setTaxRateFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          unitFilter={unitFilter}
          setUnitFilter={setUnitFilter}
          priceMin={priceMinFilter}
          setPriceMin={setPriceMinFilter}
          priceMax={priceMaxFilter}
          setPriceMax={setPriceMaxFilter}
          uniqueStatuses={uniqueStatuses}
          uniqueUnits={uniqueUnits}
        />
      </FilterModal>

      {/* Modal de error */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title="Error"
        message={errorMessage}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Acción"
        message="¿Está seguro que desea eliminar este servicio?"
        confirmText="Confirmar"
        cancelText="Cancelar"
        confirmColor="btn-primary"
        cancelColor="btn-error"
      />

      {/* Modal de creación de servicio */}
      <CreateEditServiceModal
        isOpen={isCreateServiceModalOpen}
        onClose={() => setIsCreateServiceModalOpen(false)}
        onCreated={loadInitialData}
        mode="create"
      />

      {/* Modal de edición de servicio */}
      <CreateEditServiceModal
        isOpen={isEditServiceModalOpen}
        onClose={() => {
          setIsEditServiceModalOpen(false);
          setSelectedService(null);
        }}
        onUpdated={loadInitialData}
        serviceData={selectedService}
        mode="edit"
      />
    </div>
  );
};

export default ServicesView;
