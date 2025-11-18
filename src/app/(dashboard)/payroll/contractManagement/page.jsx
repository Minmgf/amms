"use client";
import ContractDetail from "@/app/components/contractManagement/contractDetail/ContractDetail";
import AddContractModal from "@/app/components/contracts/AddContractModal";
import { useEffect, useMemo, useState } from "react";
import { FiSearch, FiFilter, FiEdit2, FiTrash2, FiPlus, FiX, FiEye } from "react-icons/fi";
import { FaCalendar, FaCheckCircle, FaDollarSign, FaFileContract } from "react-icons/fa";
import { SuccessModal, ErrorModal, ConfirmModal } from "@/app/components/shared/SuccessErrorModal";
import FilterModal from "@/app/components/shared/FilterModal";
import { getContracts, deleteContract, toggleContractStatus } from "@/services/contractService";
import { useTheme } from "@/contexts/ThemeContext";
import TableList from "@/app/components/shared/TableList";
import { createColumnHelper } from "@tanstack/react-table";
import React from "react";
import PermissionGuard from "@/app/(auth)/PermissionGuard";

const ContractManagementPage = () => {
  useTheme();
  const [globalFilter, setGlobalFilter] = useState("");
  const [data, setData] = useState([]);
  const [isContractFormModalOpen, setIsContractFormModalOpen] = useState(false);
  const [contractFormMode, setContractFormMode] = useState("add");
  const [selectedContract, setSelectedContract] = useState(null);
  const [isContractDetailsOpen, setIsContractDetailsOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados de filtros
  const [contractTypeFilter, setContractTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [minSalaryFilter, setMinSalaryFilter] = useState("");
  const [maxSalaryFilter, setMaxSalaryFilter] = useState("");
  const [paymentModalityFilter, setPaymentModalityFilter] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  // Estado de modales
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmDeactivateOpen, setIsConfirmDeactivateOpen] = useState(false);
  const [isConfirmActivateOpen, setIsConfirmActivateOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [data, contractTypeFilter, statusFilter, startDateFilter, endDateFilter, minSalaryFilter, maxSalaryFilter, paymentModalityFilter]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulación de datos hasta que el servicio esté listo
      const mockContracts = [
        {
          id_contract: 1,
          contract_code: "CON-OPERATOR-0001",
          employee_name: "Cristiano Ronaldo",
          contract_type_id: 1,
          contract_type_name: "Fixed term",
          start_date: "2025-03-14T21:23:00",
          end_date: "2025-10-14T21:25:00",
          status_id: 1,
          status_name: "Activo",
          salary: 30000,
          payment_modality_id: 1,
          payment_modality_name: "Por hora",
        },
        {
          id_contract: 2,
          contract_code: "CON-OPERATOR-0002",
          employee_name: "Lionel Messi",
          contract_type_id: 2,
          contract_type_name: "Indefinido",
          start_date: "2024-01-15T08:00:00",
          end_date: null,
          status_id: 1,
          status_name: "Activo",
          salary: 5000000,
          payment_modality_id: 2,
          payment_modality_name: "Mensual",
        },
        {
          id_contract: 3,
          contract_code: "CON-OPERATOR-0003",
          employee_name: "Neymar Jr",
          contract_type_id: 1,
          contract_type_name: "Fixed term",
          start_date: "2024-06-01T09:00:00",
          end_date: "2025-12-31T18:00:00",
          status_id: 1,
          status_name: "Activo",
          salary: 25000,
          payment_modality_id: 1,
          payment_modality_name: "Por hora",
        },
        {
          id_contract: 4,
          contract_code: "CON-OPERATOR-0004",
          employee_name: "Kylian Mbappé",
          contract_type_id: 3,
          contract_type_name: "Obra o labor",
          start_date: "2024-08-20T10:00:00",
          end_date: "2025-02-20T18:00:00",
          status_id: 2,
          status_name: "Finalizado",
          salary: 4500000,
          payment_modality_id: 2,
          payment_modality_name: "Mensual",
        },
        {
          id_contract: 5,
          contract_code: "CON-OPERATOR-0005",
          employee_name: "Erling Haaland",
          contract_type_id: 2,
          contract_type_name: "Indefinido",
          start_date: "2023-11-01T08:30:00",
          end_date: null,
          status_id: 1,
          status_name: "Activo",
          salary: 6000000,
          payment_modality_id: 2,
          payment_modality_name: "Mensual",
        },
      ];
      
      // Simulación de delay para mostrar el loading
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setData(mockContracts);
      
      // Descomentar cuando el servicio esté listo:
      // const response = await getContracts();
      // if (response && Array.isArray(response)) {
      //   setData(response);
      // } else {
      //   setError("No se pudieron cargar los contratos.");
      //   setData([]);
      // }
    } catch (err) {
      console.error("Error loading contracts:", err);
      setError("Error al conectar con el servidor.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = data;

    if (contractTypeFilter) {
      filtered = filtered.filter((contract) => contract.contract_type_id === parseInt(contractTypeFilter));
    }
    if (statusFilter) {
      filtered = filtered.filter((contract) => contract.status_id === parseInt(statusFilter));
    }
    if (startDateFilter) {
      filtered = filtered.filter((contract) => {
        const contractDate = new Date(contract.start_date);
        const startDate = new Date(startDateFilter);
        return contractDate >= startDate;
      });
    }
    if (endDateFilter) {
      filtered = filtered.filter((contract) => {
        if (!contract.end_date) return false;
        const contractDate = new Date(contract.end_date);
        const endDate = new Date(endDateFilter);
        endDate.setDate(endDate.getDate() + 1);
        return contractDate < endDate;
      });
    }
    if (minSalaryFilter) {
      filtered = filtered.filter((contract) => parseFloat(contract.salary) >= parseFloat(minSalaryFilter));
    }
    if (maxSalaryFilter) {
      filtered = filtered.filter((contract) => parseFloat(contract.salary) <= parseFloat(maxSalaryFilter));
    }
    if (paymentModalityFilter) {
      filtered = filtered.filter((contract) => contract.payment_modality_id === parseInt(paymentModalityFilter));
    }

    setFilteredData(filtered);
  };

  const uniqueContractTypes = useMemo(() => {
    const types = data.map((contract) => ({ id: contract.contract_type_id, name: contract.contract_type_name }));
    const uniqueMap = new Map(types.map((t) => [t.id, t]));
    return Array.from(uniqueMap.values());
  }, [data]);

  const uniqueStatuses = useMemo(() => {
    const statuses = data.map((contract) => ({ id: contract.status_id, name: contract.status_name }));
    const uniqueMap = new Map(statuses.map((s) => [s.id, s]));
    return Array.from(uniqueMap.values());
  }, [data]);

  const uniquePaymentModalities = useMemo(() => {
    const modalities = data.map((contract) => ({ id: contract.payment_modality_id, name: contract.payment_modality_name }));
    const uniqueMap = new Map(modalities.map((m) => [m.id, m]));
    return Array.from(uniqueMap.values());
  }, [data]);

  const handleApplyFilters = () => {
    applyFilters();
    setFilterModalOpen(false);
  };

  const handleClearFilters = () => {
    setContractTypeFilter("");
    setStatusFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    setMinSalaryFilter("");
    setMaxSalaryFilter("");
    setPaymentModalityFilter("");
    applyFilters();
  };

  const handleOpenContractFormModal = (mode, contractId = null) => {
    if (mode === "add") {
      setContractFormMode("add");
      setSelectedContract(null);
      setIsContractFormModalOpen(true);
    } else if (mode === "view") {
      const contract = data.find((c) => c.id_contract === contractId);
      setSelectedContract(contract);
      setIsContractDetailsOpen(true);
    } else {
      // edit
      const contract = data.find((c) => c.id_contract === contractId);
      setContractFormMode(mode);
      setSelectedContract(contract);
      setIsContractFormModalOpen(true);
    }
  };

  const handleOpenDeleteConfirm = (contract) => {
    setSelectedContract(contract);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsConfirmDeleteOpen(false);
    if (!selectedContract) return;

    try {
      // Intentar eliminar el contrato directamente
      // El backend validará automáticamente si tiene asociaciones
      const response = await deleteContract(selectedContract.id_contract);
      
      if (response.success) {
        // Eliminación exitosa - remover contrato de la lista
        setData(prevData =>
          prevData.filter(contract => contract.id_contract !== selectedContract.id_contract)
        );

        // Mostrar modal de éxito
        setModalTitle("Eliminación Exitosa");
        setModalMessage(response.message || "El contrato ha sido eliminado exitosamente.");
        setIsSuccessModalOpen(true);
      }
    } catch (error) {
      console.error("Error deleting contract:", error);
      
      if (error.response?.status === 400 || error.response?.status === 409) {
        // Contrato tiene asociaciones - ofrecer desactivarlo
        setModalTitle("Contrato con Asociaciones");
        setModalMessage(
          error.response?.data?.message || 
          "Este contrato está asociado con registros de nómina, pagos o empleados y no puede ser eliminado. ¿Desea desactivarlo en su lugar? Esto lo ocultará de futuros formularios."
        );
        setIsConfirmDeactivateOpen(true);
      } else {
        // Otro tipo de error
        setModalTitle("Error");
        setModalMessage(
          error.response?.data?.message || 
          "Ocurrió un error al eliminar el contrato. Por favor, inténtelo de nuevo."
        );
        setIsErrorModalOpen(true);
        setSelectedContract(null);
      }
    }
  };

  const handleOpenActivateConfirm = (contract) => {
    setSelectedContract(contract);
    setIsConfirmActivateOpen(true);
  };

  const handleConfirmActivate = async () => {
    setIsConfirmActivateOpen(false);
    if (!selectedContract) return;

    try {
      const response = await toggleContractStatus(selectedContract.id_contract);
      
      if (response.success) {
        // Actualizar el contrato en la lista
        setData(prevData =>
          prevData.map(contract =>
            contract.id_contract === selectedContract.id_contract
              ? { 
                  ...contract, 
                  status_id: contract.status_id === 1 ? 2 : 1,
                  status_name: contract.status_id === 1 ? "Finalizado" : "Activo"
                }
              : contract
          )
        );

        // Mostrar modal de éxito
        setModalTitle("Estado Actualizado");
        setModalMessage(response.message || "El estado del contrato ha sido actualizado exitosamente.");
        setIsSuccessModalOpen(true);
      }
    } catch (error) {
      console.error("Error toggling contract status:", error);
      setModalTitle("Error");
      setModalMessage(
        error.response?.data?.message || 
        "Ocurrió un error al cambiar el estado del contrato. Por favor, inténtelo de nuevo."
      );
      setIsErrorModalOpen(true);
    } finally {
      setSelectedContract(null);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmDeleteOpen(false);
    setSelectedContract(null);
  };

  const handleConfirmDeactivate = async () => {
    setIsConfirmDeactivateOpen(false);
    if (!selectedContract) return;

    try {
      const response = await toggleContractStatus(selectedContract.id_contract);
      
      if (response.success) {
        // Actualizar el contrato en la lista
        setData(prevData =>
          prevData.map(contract =>
            contract.id_contract === selectedContract.id_contract
              ? { 
                  ...contract, 
                  status_id: contract.status_id === 1 ? 2 : 1,
                  status_name: contract.status_id === 1 ? "Finalizado" : "Activo"
                }
              : contract
          )
        );

        // Mostrar modal de éxito
        setModalTitle("Estado Actualizado");
        setModalMessage(response.message || "El estado del contrato ha sido actualizado exitosamente.");
        setIsSuccessModalOpen(true);
      }
    } catch (error) {
      console.error("Error toggling contract status:", error);
      setModalTitle("Error");
      setModalMessage(
        error.response?.data?.message || 
        "Ocurrió un error al cambiar el estado del contrato. Por favor, inténtelo de nuevo."
      );
      setIsErrorModalOpen(true);
    } finally {
      setSelectedContract(null);
    }
  };

  const deleteConfirmMessage = useMemo(() => {
    if (!selectedContract) return "";
    return `¿Está seguro que desea eliminar el contrato "${selectedContract?.contract_code}" de ${selectedContract?.employee_name}?`;
  }, [selectedContract]);

  const activateConfirmMessage = useMemo(() => {
    if (!selectedContract) return "";
    return `¿Está seguro que desea activar el contrato "${selectedContract?.contract_code}" de ${selectedContract?.employee_name}?`;
  }, [selectedContract]);

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("contract_code", {
        header: "Código del Contrato",
        cell: (info) => <div className="text-primary font-medium">{info.getValue()}</div>,
      }),
      columnHelper.accessor("employee_name", {
        header: "Nombre del Empleado",
        cell: (info) => <div className="text-secondary">{info.getValue()}</div>,
      }),
      columnHelper.accessor("contract_type_name", {
        header: "Tipo de Contrato",
        cell: (info) => <div className="text-secondary">{info.getValue()}</div>,
      }),
      columnHelper.accessor("start_date", {
        header: "Fecha de Inicio",
        cell: (info) => <div className="text-secondary">{formatDate(info.getValue())}</div>,
      }),
      columnHelper.accessor("end_date", {
        header: "Fecha de Finalización",
        cell: (info) => (
          <div className="text-secondary">
            {info.getValue() ? formatDate(info.getValue()) : "Indefinido"}
          </div>
        ),
      }),
      columnHelper.accessor("status_id", {
        header: "Estado",
        cell: (info) => {
          const status_id = info.getValue();
          const status_name = info.row.original.status_name;
          return (
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
              status_id === 1 ? "bg-green-100 text-green-800" : "bg-pink-100 text-pink-800"
            }`}>
              {status_name}
            </span>
          );
        },
      }),
      columnHelper.accessor("salary", {
        header: "Salario",
        cell: (info) => {
          const salary = info.getValue();
          const payment_modality = info.row.original.payment_modality_name;
          return (
            <div className="text-secondary">
              ${parseFloat(salary).toLocaleString("es-CO")}
              <span className="text-xs text-gray-500 ml-1">({payment_modality})</span>
            </div>
          );
        },
      }),
      columnHelper.accessor("id_contract", {
        header: "Acciones",
        cell: (info) => {
          const contract = info.row.original;
          const isActive = contract.status_id === 1;

          return (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {/* TODO: Descomentar PermissionGuards cuando los permisos estén configurados */}
              {/* <PermissionGuard permission={201}> */}
                <button
                  aria-label="View Details Button"
                  onClick={() => handleOpenContractFormModal("view", info.getValue())}
                  className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-blue-500 hover:text-blue-600 text-gray-700"
                  title="Ver detalles"
                >
                  <FiEye className="w-3 h-3" /> Ver
                </button>
              {/* </PermissionGuard> */}
              {/* <PermissionGuard permission={202}> */}
                <button
                  aria-label="Edit Button"
                  onClick={() => handleOpenContractFormModal("edit", info.getValue())}
                  className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-green-500 hover:text-green-600 text-gray-700"
                  title="Editar contrato"
                >
                  <FiEdit2 className="w-3 h-3" /> Editar
                </button>
              {/* </PermissionGuard> */}
              {isActive ? (
                // <PermissionGuard permission={203}>
                  <button
                    aria-label="Delete Button"
                    onClick={() => handleOpenDeleteConfirm(contract)}
                    className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-red-500 hover:text-red-600 text-gray-700"
                    title="Eliminar Contrato"
                  >
                    <FiTrash2 className="w-3 h-3" /> Eliminar
                  </button>
                // </PermissionGuard>
              ) : (
                // <PermissionGuard permission={204}>
                  <button
                    aria-label="Activate Button"
                    onClick={() => handleOpenActivateConfirm(contract)}
                    className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-green-500 hover:text-green-600 text-gray-700"
                    title="Activar Contrato"
                  >
                    <FaCheckCircle className="w-3 h-3" /> Activar
                  </button>
                // </PermissionGuard>
              )}
            </div>
          );
        },
      }),
    ],
    [data]
  );

  const displayData = useMemo(() => {
    let finalData = contractTypeFilter || statusFilter || startDateFilter || endDateFilter || minSalaryFilter || maxSalaryFilter || paymentModalityFilter ? filteredData : data;

    if (globalFilter.trim() !== "") {
      const searchTerm = globalFilter.toLowerCase();
      finalData = finalData.filter(
        (contract) =>
          contract.employee_name?.toLowerCase().includes(searchTerm) ||
          contract.contract_code?.toLowerCase().includes(searchTerm) ||
          contract.contract_type_name?.toLowerCase().includes(searchTerm)
      );
    }

    return finalData;
  }, [data, filteredData, contractTypeFilter, statusFilter, startDateFilter, endDateFilter, minSalaryFilter, maxSalaryFilter, paymentModalityFilter, globalFilter]);

  const activeFiltersCount = [contractTypeFilter, statusFilter, startDateFilter, endDateFilter, minSalaryFilter, maxSalaryFilter, paymentModalityFilter].filter(Boolean).length;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <>
      <div className="parametrization-page p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 md:mb-10">
            <h1 className="parametrization-header text-2xl md:text-3xl font-bold">
              Contract Management
            </h1>
          </div>

          <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-4 justify-between lg:justify-start">
            <div className="relative flex-1 max-w-md">
              <div className="flex items-center parametrization-input rounded-md px-3 py-2 w-full">
                <FiSearch className="text-secondary w-4 h-4 mr-2" />
                <input
                  type="text"
                  placeholder="Buscar por empleado, código o tipo..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="flex-1 outline-none bg-transparent"
                />
                {globalFilter && (
                  <button onClick={() => setGlobalFilter("")} className="text-gray-400 hover:text-gray-600">
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <button
              className={`parametrization-filter-button flex items-center space-x-2 px-3 md:px-4 py-2 transition-colors w-fit ${
                activeFiltersCount > 0 ? "bg-blue-100 border-blue-300 text-blue-700" : ""
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
              <button onClick={handleClearFilters} className="text-sm text-red-500 hover:text-red-700 underline flex items-center gap-1">
                <FiX className="w-3 h-3" /> Limpiar filtros
              </button>
            )}

            {/* <PermissionGuard permission={200}> */}
              <button
                onClick={() => handleOpenContractFormModal("add")}
                aria-label="Add Contract Button"
                className="parametrization-filter-button flex items-center space-x-2 px-3 md:px-4 py-2 transition-colors w-fit bg-black text-white hover:bg-gray-800"
              >
                <FiPlus className="w-4 h-4" />
                <span className="text-sm">Nuevo Contrato</span>
              </button>
            {/* </PermissionGuard> */}
          </div>

          {/* TODO: Descomentar PermissionGuard cuando los permisos estén configurados */}
          {/* <PermissionGuard permission={199}> */}
            <TableList
              columns={columns}
              data={displayData}
              loading={loading}
              globalFilter={globalFilter}
              onGlobalFilterChange={setGlobalFilter}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          {/* </PermissionGuard> */}

          {!loading && displayData.length === 0 && data.length > 0 && (globalFilter || activeFiltersCount > 0) && (
            <div className="text-center py-8 text-secondary">
              No se encontraron contratos con los criterios seleccionados.
            </div>
          )}
        </div>
      </div>

      <FilterModal open={filterModalOpen} onClose={() => setFilterModalOpen(false)} onClear={handleClearFilters} onApply={handleApplyFilters}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary mb-3">
              <FaFileContract className="inline w-4 h-4 mr-2" />
              Tipo de Contrato
            </label>
            <select value={contractTypeFilter} onChange={(e) => setContractTypeFilter(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none">
              <option value="">Todos los tipos</option>
              {uniqueContractTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary mb-3">
              <FaCheckCircle className="inline w-4 h-4 mr-2" />
              Estado del Contrato
            </label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none">
              <option value="">Todos los estados</option>
              {uniqueStatuses.map((status) => (
                <option key={status.id} value={status.id}>{status.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              <FaCalendar className="inline w-4 h-4 mr-2" />
              Fecha de Inicio (Desde)
            </label>
            <input type="date" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              <FaCalendar className="inline w-4 h-4 mr-2" />
              Fecha de Finalización (Hasta)
            </label>
            <input type="date" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              <FaDollarSign className="inline w-4 h-4 mr-2" />
              Salario Mínimo
            </label>
            <input type="number" value={minSalaryFilter} onChange={(e) => setMinSalaryFilter(e.target.value)} placeholder="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              <FaDollarSign className="inline w-4 h-4 mr-2" />
              Salario Máximo
            </label>
            <input type="number" value={maxSalaryFilter} onChange={(e) => setMaxSalaryFilter(e.target.value)} placeholder="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary mb-3">
              <FaDollarSign className="inline w-4 h-4 mr-2" />
              Modalidad de Pago
            </label>
            <select value={paymentModalityFilter} onChange={(e) => setPaymentModalityFilter(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none">
              <option value="">Todas las modalidades</option>
              {uniquePaymentModalities.map((modality) => (
                <option key={modality.id} value={modality.id}>{modality.name}</option>
              ))}
            </select>
          </div>
        </div>
      </FilterModal>

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

      <ConfirmModal
        isOpen={isConfirmActivateOpen}
        onClose={() => { setIsConfirmActivateOpen(false); setSelectedContract(null); }}
        onConfirm={handleConfirmActivate}
        title="Confirmar Activación"
        message={activateConfirmMessage}
        confirmText="Activar"
        cancelText="Cancelar"
        confirmColor="btn-primary"
        cancelColor="btn-error"
      />

      <ConfirmModal
        isOpen={isConfirmDeactivateOpen}
        onClose={() => { setIsConfirmDeactivateOpen(false); setSelectedContract(null); }}
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

      <ContractDetail
        isOpen={isContractDetailsOpen}
        onClose={() => { setIsContractDetailsOpen(false); setSelectedContract(null); }}
        contractData={selectedContract}
        onBackToList={() => { setIsContractDetailsOpen(false); setSelectedContract(null); }}
        onExport={(format) => { setModalTitle("Exportar"); setModalMessage(`Export solicitado: ${format} (pendiente de implementar)`); setIsSuccessModalOpen(true); }}
        themeColors={{}}
        canViewContract={true}
      />

      <AddContractModal
        isOpen={isContractFormModalOpen}
        onClose={() => { 
          setIsContractFormModalOpen(false); 
          setSelectedContract(null); 
          setContractFormMode("add"); 
        }}
        contractToEdit={contractFormMode === "edit" ? selectedContract : null}
        onSuccess={() => {
          setIsContractFormModalOpen(false);
          setSelectedContract(null);
          setContractFormMode("add");
          loadInitialData(); // Recargar los datos
        }}
      />
    </>
  );
};

export default ContractManagementPage;
