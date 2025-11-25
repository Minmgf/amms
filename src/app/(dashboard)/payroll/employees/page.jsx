"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FiSearch, FiFilter, FiPlus, FiEye, FiFileText, FiPower, FiRefreshCw, FiX } from "react-icons/fi";
import { SuccessModal, ErrorModal, ConfirmModal } from "@/app/components/shared/SuccessErrorModal";
import FilterModal from "@/app/components/shared/FilterModal";
import TableList from "@/app/components/shared/TableList";
import { createColumnHelper } from "@tanstack/react-table";
import { useTheme } from "@/contexts/ThemeContext";
import RegisterEmployeeModal from "@/app/components/payroll/human-resources/employees/RegisterEmployeeModal";
import EmployeeDetailModal from "@/app/components/payroll/human-resources/employees/EmployeeDetailModal";
import GeneratePayrollModal from "@/app/components/payroll/payroll-runs/GenerateIndividualPayrollModal";
import ToggleStatusModal from "@/app/components/payroll/human-resources/employees/ToggleStatusModal";
import { getEmployeesList, toggleEmployeeStatus } from "@/services/employeeService";

const EmployeesPage = () => {
  useTheme();

  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState(null);
  const [registerModalMode, setRegisterModalMode] = useState("create");
  const [employeeIdToEdit, setEmployeeIdToEdit] = useState(null);

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
  const [isGeneratePayrollModalOpen, setIsGeneratePayrollModalOpen] = useState(false);
  const [employeeForPayroll, setEmployeeForPayroll] = useState(null);
  const [generatedPayrolls, setGeneratedPayrolls] = useState([]);
  
  const [isToggleStatusModalOpen, setIsToggleStatusModalOpen] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const response = await getEmployeesList();
      
      if (response.success) {
        // Mapear los datos del endpoint a la estructura esperada por el componente
        const mappedEmployees = response.data.map(employee => ({
          id: employee.id_employee,
          id_user: employee.id_user,
          document: employee.document_number,
          fullName: employee.full_name,
          position: employee.charge_name,
          positionId: employee.charge_id,
          status: employee.status_name,
          statusId: employee.status_id,
          email: employee.email,
          canGeneratePayroll: employee.status_id === 1, // Solo activos pueden generar nómina
        }));

        const ordered = orderEmployees(mappedEmployees);
        setEmployees(ordered);
        setFilteredEmployees(ordered);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      
      let errorMessage = "Error al cargar el listado de empleados.";
      
      // Manejo de errores específicos
      if (error.status) {
        switch (error.status) {
          case 401:
            errorMessage = "Su sesión ha expirado. Por favor, inicie sesión nuevamente.";
            break;
          case 403:
            errorMessage = "No tiene permisos para acceder al listado de empleados.";
            break;
          case 400:
            errorMessage = error.message || "Parámetros de consulta inválidos.";
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }
      
      setModalTitle("Error");
      setModalMessage(errorMessage);
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
            {info.getValue() || 'N/A'}
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
                onClick={() => handleViewDetails(employee)}
                className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-blue-500 hover:text-blue-600 text-gray-700"
              >
                <FiEye className="w-3 h-3" /> Ver
              </button>

              {isActive && employee.canGeneratePayroll && (
                <button
                  aria-label="Generar nómina individual"
                  onClick={() => handleGeneratePayroll(employee)}
                  className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-green-500 hover:text-green-600 text-gray-700"
                >
                  <FiFileText className="w-3 h-3" /> Nómina
                </button>
              )}

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

    if (!employee.canGeneratePayroll) {
      setModalTitle("Acceso restringido");
      setModalMessage(
        "No tiene permisos para generar la nómina individual de este empleado."
      );
      setErrorOpen(true);
      return;
    }

    setEmployeeForPayroll(employee);
    setIsGeneratePayrollModalOpen(true);
  };

  const handleToggleStatus = (employee, type) => {
    setSelectedEmployee(employee);
    setActionType(type);
    setIsToggleStatusModalOpen(true);
  };

  const handleConfirmToggleStatus = async (observation) => {
    console.log('handleConfirmToggleStatus called', { observation, selectedEmployee, actionType });
    
    if (!selectedEmployee || !actionType) {
      setIsToggleStatusModalOpen(false);
      return;
    }

    setIsTogglingStatus(true);
    
    try {
      const response = await toggleEmployeeStatus(
        selectedEmployee.id, 
        observation || null
      );

      // Actualizar el estado local del empleado
      setEmployees((prev) => {
        const updated = prev.map((emp) =>
          emp.id === selectedEmployee.id
            ? {
                ...emp,
                status: actionType === "deactivate" ? "Inactivo" : "Activo",
                statusId: actionType === "deactivate" ? 2 : 1,
                canGeneratePayroll: actionType === "activate",
              }
            : emp
        );
        const ordered = orderEmployees(updated);
        setFilteredEmployees(ordered);
        return ordered;
      });

      setIsToggleStatusModalOpen(false);
      setSelectedEmployee(null);
      setActionType(null);

      setModalTitle("Estado actualizado");
      setModalMessage(
        response.message || 
        `El empleado ha sido ${actionType === "deactivate" ? "desactivado" : "activado"} exitosamente.`
      );
      setSuccessOpen(true);
    } catch (error) {
      console.error('Error toggling employee status:', error);
      
      let errorMessage = "Error al cambiar el estado del empleado.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 403) {
        errorMessage = "No tiene permisos para cambiar el estado de empleados.";
      } else if (error.response?.status === 404) {
        errorMessage = "Empleado no encontrado.";
      }
      
      setModalTitle("Error");
      setModalMessage(errorMessage);
      setErrorOpen(true);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleViewDetails = (employee) => {
    setSelectedEmployeeForDetail(employee);
    setIsDetailModalOpen(true);
  };

  const handleEditEmployee = (employeeData) => {
    setIsDetailModalOpen(false);
    setRegisterModalMode("edit");
    // employeeData.id es id_user; employeeData.employeeId es id_employee
    setEmployeeIdToEdit(employeeData?.employeeId || selectedEmployeeForDetail?.id);
    setIsRegisterModalOpen(true);
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
              onClick={() => {
                setRegisterModalMode("create");
                setEmployeeIdToEdit(null);
                setIsRegisterModalOpen(true);
              }}
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
            onRowDoubleClick={handleViewDetails}
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
        onClose={() => {
          setIsRegisterModalOpen(false);
          setRegisterModalMode("create");
          setEmployeeIdToEdit(null);
        }}
        onSuccess={loadEmployees}
        mode={registerModalMode}
        employeeId={employeeIdToEdit}
      />

      <ToggleStatusModal
        isOpen={isToggleStatusModalOpen}
        onClose={() => {
          setIsToggleStatusModalOpen(false);
          setSelectedEmployee(null);
          setActionType(null);
        }}
        onConfirm={handleConfirmToggleStatus}
        title={actionType === "deactivate" ? "Desactivar empleado" : "Activar empleado"}
        message={
          actionType === "deactivate"
            ? `¿Está seguro que desea desactivar al empleado "${selectedEmployee?.fullName}"?`
            : `¿Está seguro que desea activar al empleado "${selectedEmployee?.fullName}"?`
        }
        type={actionType}
        isLoading={isTogglingStatus}
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

      <EmployeeDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        employeeId={selectedEmployeeForDetail?.id_employee || selectedEmployeeForDetail?.id}
        onEdit={handleEditEmployee}
      />

      <GeneratePayrollModal
        isOpen={isGeneratePayrollModalOpen}
        onClose={() => {
          setIsGeneratePayrollModalOpen(false);
          setEmployeeForPayroll(null);
        }}
        employee={employeeForPayroll}
        generatedPayrolls={generatedPayrolls}
        onRegisterPayroll={(newPayroll) => {
          setGeneratedPayrolls((prev) => [...prev, newPayroll]);
        }}
        canGeneratePayroll={employeeForPayroll?.canGeneratePayroll ?? true}
      />
    </>
  );
};

export default EmployeesPage;
