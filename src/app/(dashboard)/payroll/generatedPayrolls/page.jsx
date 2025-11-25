"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FiSearch, FiFilter, FiPlus, FiEye, FiFileText, FiX } from "react-icons/fi";
import FilterModal from "@/app/components/shared/FilterModal";
import TableList from "@/app/components/shared/TableList";
import { createColumnHelper } from "@tanstack/react-table";
import { useTheme } from "@/contexts/ThemeContext";

const GeneratedPayrollsPage = () => {
  useTheme();

  const [payrolls, setPayrolls] = useState([]);
  const [filteredPayrolls, setFilteredPayrolls] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [employeeDocument, setEmployeeDocument] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Datos mock para las nóminas generadas
  const mockPayrollData = [
    {
      id: 'Example',
      employeeDocument: '1073950432',
      employeeName: 'Juan Andrés Vera',
      generatedBy: 'Nestor Javier Rojas',
      generationDate: '16 Nov 2024, 9:23 pm',
      payrollPeriod: '14/01/2025 - 14/02/2025',
      status: 'Generada'
    }
  ];

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID Nómina",
        cell: (info) => (
          <div className="text-primary font-medium parametrization-text">
            {info.getValue() || 'N/A'}
          </div>
        ),
      }),
      columnHelper.accessor("employeeDocument", {
        header: "Documento",
        cell: (info) => (
          <div className="text-secondary parametrization-text">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("employeeName", {
        header: "Empleado",
        cell: (info) => (
          <div className="text-secondary parametrization-text">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("generatedBy", {
        header: "Generado por",
        cell: (info) => (
          <div className="text-secondary parametrization-text">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("generationDate", {
        header: "Fecha de Generación",
        cell: (info) => (
          <div className="text-secondary parametrization-text">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("payrollPeriod", {
        header: "Período de Nómina",
        cell: (info) => (
          <div className="text-secondary parametrization-text">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("actions", {
        header: "Acciones",
        cell: (info) => {
          const payroll = info.row.original;

          return (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                aria-label="Ver detalles de la nómina"
                onClick={() => handleViewDetails(payroll)}
                className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-blue-500 hover:text-blue-600 text-gray-700"
              >
                <FiEye className="w-3 h-3" /> Ver
              </button>

              <button
                aria-label="Descargar PDF de la nómina"
                onClick={() => handleDownloadPDF(payroll)}
                className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-red-500 hover:text-red-600 text-gray-700"
              >
                <FiFileText className="w-3 h-3" /> PDF
              </button>
            </div>
          );
        },
        enableSorting: false,
      }),
    ],
    []
  );

  useEffect(() => {
    loadPayrolls();
  }, []);

  const loadPayrolls = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      setPayrolls(mockPayrollData);
      setFilteredPayrolls(mockPayrollData);
    } catch (error) {
      console.error('Error loading payrolls:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let data = [...payrolls];

    if (employeeDocument.trim()) {
      const term = employeeDocument.toLowerCase();
      data = data.filter((payroll) => payroll.employeeDocument?.toLowerCase().includes(term));
    }

    if (dateFrom) {
      // Implementar filtro por fecha desde
    }

    if (dateTo) {
      // Implementar filtro por fecha hasta
    }

    setFilteredPayrolls(data);
  };

  const displayData = useMemo(() => {
    let data = [...filteredPayrolls];

    if (globalFilter.trim()) {
      const term = globalFilter.toLowerCase();
      data = data.filter(
        (payroll) =>
          payroll.employeeName?.toLowerCase().includes(term) ||
          payroll.employeeDocument?.toLowerCase().includes(term) ||
          payroll.id?.toLowerCase().includes(term)
      );
    }

    return data;
  }, [filteredPayrolls, globalFilter]);

  const filteredData = displayData;

  const handleApplyFilters = () => {
    applyFilters();
    setIsFilterModalOpen(false);
  };

  const handleClearFilters = () => {
    setEmployeeDocument("");
    setDateFrom("");
    setDateTo("");
    setFilteredPayrolls(payrolls);
  };

  const handleViewDetails = (payroll) => {
    // Implementar lógica para mostrar detalles en modal
    console.log('Ver detalles de:', payroll);
  };

  const handleDownloadPDF = (payroll) => {
    // Implementar lógica para descargar PDF
    console.log('Descargar PDF de:', payroll);
  };

  const handleGenerateMassivePayroll = () => {
    // Redirigir a la página de generación masiva de nóminas (HU-NOM-003)
    console.log('Redirigir a generación masiva');
  };

  // Función de filtro global personalizada
  const globalFilterFn = (row, columnId, value) => {
    const searchValue = value.toLowerCase();
    const rowValues = Object.values(row.original).join(' ').toLowerCase();
    return rowValues.includes(searchValue);
  };

  const noResultsByFilter =
    !loading && filteredData.length === 0 && payrolls.length > 0 && (globalFilter || (employeeDocument || dateFrom || dateTo));

  return (
    <>
      <div className="parametrization-page p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 md:mb-10">
            <h1 className="parametrization-header text-2xl md:text-3xl font-bold">
              Nóminas Generadas
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
                (employeeDocument || dateFrom || dateTo) ? "bg-blue-100 border-blue-300 text-blue-700" : ""
              }`}
              onClick={() => setIsFilterModalOpen(true)}
              aria-label="Abrir filtros avanzados"
            >
              <FiFilter className="filter-icon w-4 h-4" />
              <span className="text-sm">Filtrar</span>
            </button>

            <button
              onClick={handleGenerateMassivePayroll}
              aria-label="Generar nómina masiva"
              className="parametrization-filter-button flex items-center space-x-2 px-3 md:px-4 py-2 transition-colors w-fit bg-black text-white hover:bg-gray-800"
            >
              <FiPlus className="w-4 h-4" />
              <span className="text-sm">Nómina Masiva</span>
            </button>
          </div>

          <TableList
            columns={columns}
            data={filteredData}
            loading={loading}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            pageSizeOptions={[10, 25, 50, 100]}
            onRowDoubleClick={handleViewDetails}
          />

          {noResultsByFilter && (
            <div className="text-center py-8 text-secondary">
              No se encontraron nóminas con los criterios seleccionados.
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
              ID (Documento) del empleado
            </label>
            <input
              type="text"
              value={employeeDocument}
              onChange={(e) => setEmployeeDocument(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
              placeholder="Escriba el documento del empleado"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              Fecha Desde
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>
        </div>
      </FilterModal>
    </>
  );
};

export default GeneratedPayrollsPage;