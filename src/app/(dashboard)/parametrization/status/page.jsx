"use client";
import React, { useState, useEffect, useMemo } from "react";
import { FiFilter, FiEdit3, FiBell, FiEye } from "react-icons/fi";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import NavigationMenu from "../../../components/parametrization/ParameterNavigation";
import StatusListModal from "../../../components/parametrization/StatusListModal";
import AddModifyStatusModal from "../../../components/parametrization/AddModifyStatusModal";
import { useTheme } from "@/contexts/ThemeContext";

// Componente para la vista de Status
const StatusParameterizationView = () => {
  const { currentTheme } = useTheme();
  const [activeMenuItem, setActiveMenuItem] = useState("Status");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Estados para los modales
  const [isStatusListModalOpen, setIsStatusListModalOpen] = useState(false);
  const [isAddModifyModalOpen, setIsAddModifyModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' o 'modify'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedParameter, setSelectedParameter] = useState(null);
  const [categoryParameters, setCategoryParameters] = useState([]);

  // Datos de ejemplo para Status según el mockup
  const mockData = [
    { 
      id: 1, 
      categoryName: "Estado de maquinaria", 
      description: "Módulo de maquinaria"
    },
    { 
      id: 2, 
      categoryName: "Estado de maquinaria", 
      description: "Módulo de maquinaria"
    },
    { 
      id: 3, 
      categoryName: "Estado de maquinaria", 
      description: "Módulo de maquinaria"
    },
  ];

  // Datos de ejemplo para los parámetros de cada categoría
  const mockCategoryParameters = [
    { 
      id: 1, 
      typeName: "Operativo", 
      description: "Maquinaria en funcionamiento normal", 
      status: "Active",
      isActive: true 
    },
    { 
      id: 2, 
      typeName: "Mantenimiento", 
      description: "Maquinaria en proceso de mantenimiento", 
      status: "Active",
      isActive: true 
    },
    { 
      id: 3, 
      typeName: "Fuera de servicio", 
      description: "Maquinaria temporalmente fuera de servicio", 
      status: "Inactive",
      isActive: false 
    },
  ];

  // Opciones del menú de navegación (mismo que el original)
  const menuItems = [
    "Type...",
    "Status",
    "Brands",
    "Units",
    "Styles",
    "Job Titles",
  ];

  // Función para obtener datos del backend
  const fetchData = async (menuItem = "Status") => {
    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setData(mockData);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeMenuItem);
  }, [activeMenuItem]);

  const handleMenuItemChange = (item) => {
    setActiveMenuItem(item);
  };

  // Handler para el botón de detalles - abre el StatusListModal
  const handleViewDetails = (categoryId) => {
    console.log("View details for category:", categoryId);
    const category = data.find(item => item.id === categoryId);
    if (category) {
      setSelectedCategory(category);
      setCategoryParameters(mockCategoryParameters); // En producción, esto vendría del API
      setIsStatusListModalOpen(true);
    }
  };

  // Handlers para el StatusListModal
  const handleCloseStatusListModal = () => {
    setIsStatusListModalOpen(false);
    setSelectedCategory(null);
    setCategoryParameters([]);
  };

  const handleAddParameter = () => {
    setModalMode('add');
    setSelectedParameter(null);
    setIsAddModifyModalOpen(true);
  };

  const handleEditParameter = (parameter) => {
    setModalMode('modify');
    setSelectedParameter(parameter);
    setIsAddModifyModalOpen(true);
  };

  // Handlers para el AddModifyStatusModal
  const handleCloseAddModifyModal = () => {
    setIsAddModifyModalOpen(false);
    setSelectedParameter(null);
    setModalMode('add');
  };

  const handleSaveParameter = (parameterData) => {
    console.log("Saving parameter:", parameterData);
    
    if (modalMode === 'add') {
      // Agregar nuevo parámetro
      const newParameter = {
        ...parameterData,
        id: categoryParameters.length + 1
      };
      setCategoryParameters(prev => [...prev, newParameter]);
    } else {
      // Modificar parámetro existente
      setCategoryParameters(prev => 
        prev.map(param => 
          param.id === selectedParameter.id 
            ? { ...param, ...parameterData }
            : param
        )
      );
    }
    
    // Cerrar el modal
    handleCloseAddModifyModal();
  };

  // ==================== TABLA PRINCIPAL ====================

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("categoryName", {
        header: "Category name",
        cell: (info) => (
          <div className="font-medium text-primary">{info.getValue()}</div>
        ),
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: (info) => <div className="text-secondary">{info.getValue()}</div>,
      }),
      columnHelper.accessor("id", {
        header: "Details",
        cell: (info) => (
            <button
            onClick={() => handleViewDetails(info.getValue())}
            className="parametrization-action-button p-2 transition-colors opacity-0 group-hover:opacity-100"
            title="View details"
          >
            <FiEye className="w-4 h-4" />
          </button>
        ),
      }),
    ],
    [handleViewDetails]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="parametrization-page p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <h1 className="parametrization-header text-2xl md:text-3xl font-bold">Parameterization</h1>
        </div>

        {/* Filter Section */}
        <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <button className="parametrization-filter-button flex items-center space-x-2 px-3 md:px-4 py-2 transition-colors w-fit">
            <FiFilter className="filter-icon w-4 h-4" />
            <span className="text-sm">Filter by</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="mb-6 md:mb-8">
          <NavigationMenu
            activeItem={activeMenuItem}
            onItemClick={handleMenuItemChange}
          />
        </div>

        {/* Table */}
        <div className="parametrization-table mb-6 md:mb-8">
          {loading ? (
            <div className="parametrization-loading p-8 text-center">Loading...</div>
          ) : error ? (
            <div className="parametrization-error p-8 text-center">Error: {error}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="parametrization-table-header">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="parametrization-table-cell px-4 md:px-6 py-3 md:py-4 text-left text-sm font-semibold last:border-r-0"
                          >
                            {header.isPlaceholder ? null : (
                              <div
                                {...{
                                  className: header.column.getCanSort()
                                    ? "cursor-pointer select-none flex items-center gap-2"
                                    : "",
                                  onClick:
                                    header.column.getToggleSortingHandler(),
                                }}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                {{
                                  asc: " 🔼",
                                  desc: " 🔽",
                                }[header.column.getIsSorted()] ?? null}
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="">
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="parametrization-table-row group">
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="parametrization-table-cell px-4 md:px-6 py-3 md:py-4 text-sm last:border-r-0"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="parametrization-pagination px-4 py-6 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="parametrization-pagination-button relative inline-flex items-center px-4 py-2 text-sm font-medium"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="parametrization-pagination-button ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium"
                    >
                      Next →
                    </button>
                  </div>

                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="parametrization-pagination-button inline-flex items-center px-3 py-2 text-sm font-medium transition-colors"
                      >
                        ← Previous
                      </button>

                      {(() => {
                        const currentPage =
                          table.getState().pagination.pageIndex + 1;
                        const totalPages = table.getPageCount();
                        const pages = [];

                        if (currentPage > 3) {
                          pages.push(
                            <button
                              key={1}
                              onClick={() => table.setPageIndex(0)}
                              className="parametrization-pagination-button inline-flex items-center justify-center w-10 h-10 text-sm font-medium transition-colors"
                            >
                              1
                            </button>
                          );
                        }

                        if (currentPage > 4) {
                          pages.push(
                            <span
                              key="ellipsis1"
                              className="parametrization-pagination-ellipsis inline-flex items-center justify-center w-10 h-10 text-sm"
                            >
                              ...
                            </span>
                          );
                        }

                        for (
                          let i = Math.max(1, currentPage - 2);
                          i <= Math.min(totalPages, currentPage + 2);
                          i++
                        ) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => table.setPageIndex(i - 1)}
                              className={`parametrization-pagination-button inline-flex items-center justify-center w-10 h-10 text-sm font-medium transition-colors ${
                                i === currentPage ? 'active' : ''
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }

                        if (currentPage < totalPages - 3) {
                          pages.push(
                            <span
                              key="ellipsis2"
                              className="parametrization-pagination-ellipsis inline-flex items-center justify-center w-10 h-10 text-sm"
                            >
                              ...
                            </span>
                          );
                        }

                        if (currentPage < totalPages - 2) {
                          pages.push(
                            <button
                              key={totalPages}
                              onClick={() => table.setPageIndex(totalPages - 1)}
                              className="parametrization-pagination-button inline-flex items-center justify-center w-10 h-10 text-sm font-medium transition-colors"
                            >
                              {totalPages}
                            </button>
                          );
                        }

                        return pages;
                      })()}

                      <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="parametrization-pagination-button inline-flex items-center px-3 py-2 text-sm font-medium transition-colors"
                      >
                        Next →
                      </button>
                    </div>
                  </div>

                  <div className="hidden sm:block">
                    <select
                      value={table.getState().pagination.pageSize}
                      onChange={(e) => {
                        table.setPageSize(Number(e.target.value));
                      }}
                      className="parametrization-pagination-select px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[10, 20, 30, 40, 50].map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
                          {pageSize} per page
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* StatusListModal - Modal de lista de parámetros */}
      <StatusListModal
        isOpen={isStatusListModalOpen}
        onClose={handleCloseStatusListModal}
        categoryName={selectedCategory?.categoryName || "Machinery Status"}
        data={categoryParameters}
        onAddParameter={handleAddParameter}
        onEditParameter={handleEditParameter}
      />

      {/* AddModifyStatusModal - Modal para agregar/editar parámetros */}
      <AddModifyStatusModal
        isOpen={isAddModifyModalOpen}
        onClose={handleCloseAddModifyModal}
        mode={modalMode}
        status={selectedParameter}
        category={selectedCategory?.categoryName || "Machinery Status"}
        onSave={handleSaveParameter}
      />
    </div>
  );
};

export default StatusParameterizationView;