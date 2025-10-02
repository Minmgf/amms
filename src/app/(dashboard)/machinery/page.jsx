"use client";
import TableList from "@/app/components/shared/TableList";
import MachineryHistoryModal from "@/app/components/machinery/history/MachineryHistoryModal";
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
} from "react-icons/fa";
import PermissionGuard from "@/app/(auth)/PermissionGuard";
import * as Dialog from "@radix-ui/react-dialog";
import { FiLayers, FiDownload, FiFileText } from "react-icons/fi";
import { IoCalendarOutline } from "react-icons/io5";
import { getMachineryList } from "@/services/machineryService";
import MultiStepFormModal from "@/app/components/machinery/multistepForm/MultistepFormModal";
import MachineryDetailsModal from "@/app/components/machinery/machineryDetails/MachineryDetailsModal";
import { FiChevronDown } from "react-icons/fi";

const MachineryMainView = () => {
  // Estado para el filtro global
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para datos de la API
  const [machineryData, setMachineryData] = useState([]);
  const [error, setError] = useState(null);

  // Estados para el modal de filtros
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [machineryTypeFilter, setMachineryTypeFilter] = useState("");
  const [tenureFilter, setTenureFilter] = useState("");
  const [operativeStatusFilter, setOperativeStatusFilter] = useState("");
  const [acquisitionDateFilter, setAcquisitionDateFilter] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  // Estados para modales de detalles y edición
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [activeTab, setActiveTab] = useState("general"); // 'general' | 'tech' | 'docs'
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadInitialData();
  }, []);

  // Aplicar filtros cuando cambien los datos o los filtros
  useEffect(() => {
    applyFilters();
  }, [
    machineryData,
    machineryTypeFilter,
    tenureFilter,
    operativeStatusFilter,
    acquisitionDateFilter,
  ]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Cargar datos de maquinaria
      const machineryResponse = await getMachineryList();

      console.log("=== DEBUG: Respuesta completa ===");
      console.log("machineryResponse:", machineryResponse);
      console.log("Type of response:", typeof machineryResponse);
      console.log("Keys:", Object.keys(machineryResponse || {}));
      console.log("Success:", machineryResponse?.success);
      console.log("Data:", machineryResponse?.data);
      console.log("Type of data:", typeof machineryResponse?.data);
      console.log("Is data array?:", Array.isArray(machineryResponse?.data));

      // Verificar si la respuesta es exitosa
      if (machineryResponse && machineryResponse.success) {
        const data = machineryResponse.data;

        if (Array.isArray(data)) {
          setMachineryData(data);
          console.log("✅ Maquinaria cargada correctamente:", data);
        } else if (data && typeof data === "object") {
          // Si es un objeto, intentar extraer el array
          if (data.data && Array.isArray(data.data)) {
            setMachineryData(data.data);
            console.log("✅ Maquinaria cargada desde data.data:", data.data);
          } else if (data.results && Array.isArray(data.results)) {
            setMachineryData(data.results);
            console.log(
              "✅ Maquinaria cargada desde data.results:",
              data.results
            );
          } else {
            console.error("❌ Data no es un array válido:", data);
            setError("Los datos recibidos no tienen el formato esperado");
          }
        } else {
          console.error("❌ Data es null o undefined");
          setError("No se recibieron datos de maquinaria");
        }
      } else {
        console.error("❌ Respuesta no exitosa:", machineryResponse);
        setError(machineryResponse?.message || "Error al cargar la maquinaria");
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Error al cargar los datos. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Obtener valores únicos para los filtros
  const uniqueMachineryTypes = useMemo(() => {
    const types = machineryData
      .map((machine) => machine.machinery_secondary_type_name)
      .filter(Boolean);
    return [...new Set(types)];
  }, [machineryData]);

  const uniqueTenures = useMemo(() => {
    // Este campo no existe en la API actual, mantener vacío por ahora
    return [];
  }, [machineryData]);

  const uniqueOperativeStatuses = useMemo(() => {
    const statuses = machineryData
      .map((machine) => machine.machinery_operational_status_name)
      .filter(Boolean);
    return [...new Set(statuses)];
  }, [machineryData]);

  // Aplicar filtros
  const applyFilters = () => {
    let filtered = machineryData;

    if (machineryTypeFilter) {
      filtered = filtered.filter(
        (machine) =>
          machine.machinery_secondary_type_name === machineryTypeFilter
      );
    }

    if (tenureFilter) {
      // Campo tenure no existe en la API actual, omitir filtro
    }

    if (operativeStatusFilter) {
      filtered = filtered.filter(
        (machine) =>
          machine.machinery_operational_status_name === operativeStatusFilter
      );
    }

    if (acquisitionDateFilter) {
      filtered = filtered.filter((machine) => {
        if (!machine.acquisition_date) return false;
        const machineDate = new Date(machine.acquisition_date)
          .toISOString()
          .split("T")[0];
        return machineDate === acquisitionDateFilter;
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

      const machine = row.original;

      // Crear array de campos searchables usando los campos de la API
      const searchableFields = [
        machine.machinery_name,
        machine.serial_number,
        machine.machinery_secondary_type_name,
        machine.machinery_operational_status_name,
        machine.id_machinery?.toString(),
        machine.id_machinery_secondary_type?.toString(),
        machine.id_machinery_operational_status?.toString(),
      ];

      // Agregar fechas formateadas si existen
      if (machine.acquisition_date) {
        const date = new Date(machine.acquisition_date);
        searchableFields.push(
          date.toLocaleDateString("es-ES"), // dd/mm/yyyy
          date.toLocaleDateString("en-US"), // mm/dd/yyyy
          date.toISOString().split("T")[0], // yyyy-mm-dd
          date.getFullYear().toString(), // año
          (date.getMonth() + 1).toString().padStart(2, "0"), // mes
          date.getDate().toString().padStart(2, "0") // día
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
    setMachineryTypeFilter("");
    setTenureFilter("");
    setOperativeStatusFilter("");
    setAcquisitionDateFilter("");
    setFilteredData(machineryData);
    setIsFilterModalOpen(false);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Formatear hora
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Definición de columnas para TanStack Table
  const columns = useMemo(
    () => [
      {
        accessorKey: "machinery_name",
        header: () => (
          <div className="flex items-center gap-2">
            <FaTractor className="w-4 h-4" />
            Maquinaria
          </div>
        ),
        cell: ({ row }) => {
          const machine = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md overflow-hidden flex items-center justify-center bg-gray-100">
                {machine.image_path ? (
                  <img
                    src={machine.image_path}
                    alt={machine.machinery_name || "Maquinaria"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <FaTractor
                  className="w-4 h-4 text-gray-400"
                  style={{ display: machine.image_path ? "none" : "block" }}
                />
              </div>
              <div className="font-medium parametrization-text">
                {machine.machinery_name || "N/A"}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "serial_number",
        header: () => (
          <div className="flex items-center gap-1">
            <FaHashtag className="w-4 h-4 " />
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
        accessorKey: "machinery_secondary_type_name",
        header: () => (
          <div className="flex items-center gap-2">
            <FiLayers className="w-4 h-4 " />
            Tipo
          </div>
        ),
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium parametrization-text">
            {row.getValue("machinery_secondary_type_name") || "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "machinery_operational_status_name",
        header: () => (
          <div className="flex items-center gap-2">
            <FaCheckCircle className="w-4 h-4 " />
            Estado
          </div>
        ),
        cell: ({ row }) => {
          const status = row.getValue("machinery_operational_status_name");
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium parametrization-text">
              {status || "N/A"}
            </span>
          );
        },
      },
      {
        accessorKey: "acquisition_date",
        header: () => (
          <div className="flex items-center gap-2">
            <IoCalendarOutline className="w-4 h-4 " />
            Fecha de Adquisición
          </div>
        ),
        cell: ({ row }) => {
          const date = row.getValue("acquisition_date");
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
        id: "actions",
        header: () => (
          <div className="flex items-center gap-2">
            <FaTools className="w-4 h-4 " />
            Acciones
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2 opacity-30 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <PermissionGuard permission={83}> 
              <button
                aria-label="Edit Button"
                onClick={() => handleEdit(row.original)}
                className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-black cursor-pointer"
              >
                <FaPen /> Editar
              </button>
            </PermissionGuard>
            <button
              aria-label="History Button"
              onClick={() => handleHistory(row.original)}
              className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-black cursor-pointer"
            >
              <FaHistory /> Historial
            </button>
            <PermissionGuard permission={86}>
              <button
                aria-label="View Button"
                onClick={() => handleView(row.original)}
                className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-black cursor-pointer"
              >
                <FaEye /> Ver
              </button>
            </PermissionGuard>
          </div>
        ),
      },
    ],
    []
  );

  // Handlers para las acciones
  const handleEdit = (machine) => {
    console.log("Editing machine:", machine);
    setSelectedMachine(machine);
    setIsEditModalOpen(true);
  };

  const handleView = (machine) => {
    console.log("Viewing machine:", machine);
    setSelectedMachine(machine);
    setIsDetailsModalOpen(true);
  };

  const handleHistory = (machine) => {
    console.log("Viewing history for machine:", machine);
    setSelectedMachine(machine);
    setIsHistoryModalOpen(true);
  };

  const handleOpenAddMachineModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleRefresh = () => {
    loadInitialData();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-primary text-2xl font-bold text-gray-900">Maquinaria</h1>
        </div>

        {/* Mostrar error si existe */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
            <button
              aria-label="Dismiss Error Button"
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
            aria-label="Search Input"
            id="search"
            type="text"
            placeholder="Buscar por nombre, serie, tipo, estado..."
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
          aria-label="Filter Button"
          onClick={() => setIsFilterModalOpen(true)}
          className="parametrization-filter-button"
        >
          <CiFilter className="w-4 h-4" />
          Filtrar por
        </button>
        {globalFilter && (
          <button
            aria-label="Clear Search Button"
            onClick={() => setGlobalFilter("")}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Limpiar búsqueda
          </button>
        )}
        <PermissionGuard permission={84}>
          <button
            aria-label="Add Machinery Button"
            onClick={handleOpenAddMachineModal}
            className="parametrization-filter-button"
          >
            <FaPlus className="w-4 h-4" />
            Agregar maquinaria
          </button>
        </PermissionGuard>
      </div>

      {/* Tabla de maquinaria */}
      <PermissionGuard permission={82}>
        <TableList
          columns={columns}
          data={
            filteredData.length > 0 ||
            machineryTypeFilter ||
            tenureFilter ||
            operativeStatusFilter ||
            acquisitionDateFilter
              ? filteredData
              : machineryData
          }
          loading={loading}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          globalFilterFn={globalFilterFn}
          pageSizeOptions={[10, 20, 30, 50]}
        />
      </PermissionGuard>

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
                  aria-label="Close Filter Modal Button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="text-secondary hover:text-primary"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Machinery Type */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-3">
                    Tipo de Maquinaria
                  </label>
                  <select
                    aria-label="Machinery Type Select"
                    value={machineryTypeFilter}
                    onChange={(e) => setMachineryTypeFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none"
                  >
                    <option value=""></option>
                    {uniqueMachineryTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tenure */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-3">
                    Tenencia
                  </label>
                  <select
                    aria-label="Tenure Select"
                    value={tenureFilter}
                    onChange={(e) => setTenureFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none"
                  >
                    <option value=""></option>
                    {uniqueTenures.map((tenure) => (
                      <option key={tenure} value={tenure}>
                        {tenure}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Operative Status */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-3">
                    Estado Operativo
                  </label>
                  <select
                    aria-label="Operative Status Select"
                    value={operativeStatusFilter}
                    onChange={(e) => setOperativeStatusFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none"
                  >
                    <option value=""></option>
                    {uniqueOperativeStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Acquisition Date */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-3">
                    Fecha de Adquisición
                  </label>
                  <div className="relative">
                    <input
                      aria-label="Acquisition Date Input"
                      type="date"
                      value={acquisitionDateFilter}
                      onChange={(e) => setAcquisitionDateFilter(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent pr-12"
                    />
                    <FaCalendarAlt className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 mt-8">
                <button
                  aria-label="Clear Filters Button"
                  onClick={handleClearFilters}
                  className="flex-1 px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
                >
                  Limpiar
                </button>
                <button
                  aria-label="Apply Filters Button"
                  onClick={handleApplyFilters}
                  className="flex-1 px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <MultiStepFormModal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          setIsEditModalOpen(false)
          setSelectedMachine(null)
        }}
        machineryToEdit={isEditModalOpen ? selectedMachine : null}
        onSuccess={handleRefresh}
      />
      <MachineryHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        machinery={selectedMachine}
      />

      <MachineryDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        selectedMachine={selectedMachine}
        formatDate={formatDate}
      />
    </div>
  );
};

export default MachineryMainView;
