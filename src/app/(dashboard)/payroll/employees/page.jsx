"use client";
import React, { useEffect, useMemo, useState } from "react";
import { FiSearch, FiFilter, FiPlus, FiEye, FiFileText, FiPower, FiRefreshCw, FiX } from "react-icons/fi";
import { SuccessModal, ErrorModal, ConfirmModal } from "@/app/components/shared/SuccessErrorModal";
import FilterModal from "@/app/components/shared/FilterModal";
import TableList from "@/app/components/shared/TableList";
import { createColumnHelper } from "@tanstack/react-table";
import { useTheme } from "@/contexts/ThemeContext";
import RegisterEmployeeModal from "@/app/components/payroll/human-resources/employees/RegisterEmployeeModal";

const EmployeesPage = () => {
  useTheme();

  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const [searchType, setSearchType] = useState("document");
  const [advancedSearchText, setAdvancedSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [actionType, setActionType] = useState(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const mockEmployees = [
        {
          id: 1,
          document: "1076500031",
          fullName: "Cristiano Ronaldo",
          position: "Operador",
          status: "Activo",
          canGeneratePayroll: true,
        },
        {
          id: 2,
          document: "1076500032",
          fullName: "Cristiano Ronaldo",
          position: "Operador",
          status: "Inactivo",
          canGeneratePayroll: false,
        },
      ];

      const ordered = orderEmployees(mockEmployees);
      setEmployees(ordered);
      setFilteredEmployees(ordered);
    } catch (error) {
      setModalTitle("Error");
      setModalMessage("Error al cargar el listado de empleados.");
      setErrorOpen(true);
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const orderEmployees = (data) => {
    if (!Array.isArray(data)) return [];

    return [...data].sort((a, b) => {
      const statusA = a.status === "Activo" ? 0 : 1;
      const statusB = b.status === "Activo" ? 0 : 1;
      if (statusA !== statusB) return statusA - statusB;
      return (a.fullName || "").localeCompare(b.fullName || "", "es", { sensitivity: "base" });
    });
  };

  const applyFilters = () => {
    let data = [...employees];

    if (advancedSearchText.trim()) {
      const term = advancedSearchText.toLowerCase();
      if (searchType === "document") {
        data = data.filter((emp) => emp.document?.toLowerCase().includes(term));
      } else {
        data = data.filter((emp) => emp.fullName?.toLowerCase().includes(term));
      }
    }

    if (statusFilter) {
      data = data.filter((emp) => emp.status === statusFilter);
    }

    data = orderEmployees(data);
    setFilteredEmployees(data);
  };

  const handleApplyFilters = () => {
    applyFilters();
    setIsFilterModalOpen(false);
  };

  const handleClearFilters = () => {
    setAdvancedSearchText("");
    setSearchType("document");
    setStatusFilter("");
    setFilteredEmployees(orderEmployees(employees));
  };

  const activeFiltersCount = useMemo(
    () => [advancedSearchText, statusFilter].filter(Boolean).length,
    [advancedSearchText, statusFilter]
  );

  const displayData = useMemo(() => {
    let data = [...filteredEmployees];

    if (globalFilter.trim()) {
      const term = globalFilter.toLowerCase();
      data = data.filter(
        (emp) =>
          emp.fullName?.toLowerCase().includes(term) ||
          emp.document?.toLowerCase().includes(term)
      );
    }

    return data;
  }, [filteredEmployees, globalFilter]);

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("document", {
        header: "Documento",
        cell: (info) => (
          <div className="text-primary font-medium parametrization-text">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("fullName", {
        header: "Nombre completo",
        cell: (info) => (
          <div className="text-secondary parametrization-text">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("position", {
        header: "Cargo",
        cell: (info) => (
          <div className="text-secondary parametrization-text">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Estado",
        cell: (info) => {
          const status = info.getValue();
          const isActive = status === "Activo";
          return (
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-pink-100 text-pink-800"
              }`}
            >
              {status}
            </span>
          );
        },
      }),
      columnHelper.accessor("id", {
        header: "Acciones",
        cell: (info) => {
          const employee = info.row.original;
          const isActive = employee.status === "Activo";

          return (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                aria-label="Ver detalles del empleado"
                className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-blue-500 hover:text-blue-600 text-gray-700"
              >
                <FiEye className="w-3 h-3" /> Ver
              </button>

              <button
                aria-label="Generar nómina individual"
                onClick={() => handleGeneratePayroll(employee)}
                className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-green-500 hover:text-green-600 text-gray-700"
              >
                <FiFileText className="w-3 h-3" /> Nómina
              </button>

              {isActive ? (
                <button
                  aria-label="Desactivar empleado"
                  onClick={() => handleToggleStatus(employee, "deactivate")}
                  className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-red-500 hover:text-red-600 text-gray-700"
                >
                  <FiPower className="w-3 h-3" /> Desactivar
                </button>
              ) : (
                <button
                  aria-label="Activar empleado"
                  onClick={() => handleToggleStatus(employee, "activate")}
                  className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-green-500 hover:text-green-600 text-gray-700"
                >
                  <FiRefreshCw className="w-3 h-3" /> Activar
                </button>
              )}
            </div>
          );
        },
      }),
    ],
    []
  );

  const handleGeneratePayroll = (employee) => {
    if (employee.status !== "Activo") {
      setModalTitle("No es posible generar nómina");
      setModalMessage("No es posible generar nómina para un empleado inactivo.");
      setErrorOpen(true);
      return;
    }

    setModalTitle("Generar nómina");
    setModalMessage(
      "Redirigir a la vista de generación de nómina individual (pendiente de integración)."
    );
    setSuccessOpen(true);
  };

  const handleToggleStatus = (employee, type) => {
    setSelectedEmployee(employee);
    setActionType(type);
    setModalTitle(type === "deactivate" ? "Desactivar empleado" : "Activar empleado");
    setModalMessage(
      type === "deactivate"
        ? `¿Está seguro que desea desactivar al empleado "${employee.fullName}"?`
        : `¿Está seguro que desea activar al empleado "${employee.fullName}"?`
    );
    setConfirmOpen(true);
  };

  const handleConfirmToggleStatus = () => {
    if (!selectedEmployee || !actionType) {
      setConfirmOpen(false);
      return;
    }

    setEmployees((prev) => {
      const updated = prev.map((emp) =>
        emp.id === selectedEmployee.id
          ? {
              ...emp,
              status: actionType === "deactivate" ? "Inactivo" : "Activo",
            }
          : emp
      );
      const ordered = orderEmployees(updated);
      setFilteredEmployees(ordered);
      return ordered;
    });

    setConfirmOpen(false);
    setSelectedEmployee(null);
    setActionType(null);

    setModalTitle("Estado actualizado");
    setModalMessage("El estado del empleado se actualizó correctamente.");
    setSuccessOpen(true);
  };

  const noResultsByFilter =
    !loading && displayData.length === 0 && employees.length > 0 && (globalFilter || activeFiltersCount > 0);

  return (
    <>
      <div className="parametrization-page p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 md:mb-10">
            <h1 className="parametrization-header text-2xl md:text-3xl font-bold">
              Lista de empleados
            </h1>
          </div>

          <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-4 justify-between lg:justify-start">
            <div className="relative flex-1 max-w-md">
              <div className="flex items-center parametrization-input rounded-md px-3 py-2 w-full">
                <FiSearch className="text-secondary w-4 h-4 mr-2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o documento..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="flex-1 outline-none bg-transparent"
                />
                {globalFilter && (
                  <button
                    onClick={() => setGlobalFilter("")}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Limpiar búsqueda rápida"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <button
              className={`parametrization-filter-button flex items-center space-x-2 px-3 md:px-4 py-2 transition-colors w-fit ${
                activeFiltersCount > 0 ? "bg-blue-100 border-blue-300 text-blue-700" : ""
              }`}
              onClick={() => setIsFilterModalOpen(true)}
              aria-label="Abrir filtros avanzados"
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
                aria-label="Limpiar filtros avanzados"
              >
                <FiX className="w-3 h-3" /> Limpiar filtros
              </button>
            )}

            <button
              onClick={() => setIsRegisterModalOpen(true)}
              aria-label="Nuevo empleado"
              className="parametrization-filter-button flex items-center space-x-2 px-3 md:px-4 py-2 transition-colors w-fit bg-black text-white hover:bg-gray-800"
            >
              <FiPlus className="w-4 h-4" />
              <span className="text-sm">Nuevo empleado</span>
            </button>
          </div>

          <TableList
            columns={columns}
            data={displayData}
            loading={loading}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            pageSizeOptions={[10, 25, 50, 100]}
          />

          {noResultsByFilter && (
            <div className="text-center py-8 text-secondary">
              No se encontraron empleados con los criterios seleccionados.
            </div>
          )}
        </div>
      </div>

      <FilterModal
        open={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onClear={handleClearFilters}
        onApply={handleApplyFilters}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary mb-3">
              Búsqueda avanzada
            </label>
            <input
              type="text"
              value={advancedSearchText}
              onChange={(e) => setAdvancedSearchText(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
              placeholder="Escriba nombre o número de identificación"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              Tipo de búsqueda
            </label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none"
            >
              <option value="document">Documento</option>
              <option value="name">Nombre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none"
            >
              <option value="">Todos</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>
      </FilterModal>

      <RegisterEmployeeModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={loadEmployees}
      />

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmToggleStatus}
        title={modalTitle}
        message={modalMessage}
        confirmText="Confirmar"
        cancelText="Cancelar"
        confirmColor="btn-primary"
        cancelColor="btn-error"
      />

      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title={modalTitle || "Acción exitosa"}
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

export default EmployeesPage;