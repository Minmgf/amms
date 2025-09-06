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
import NavigationMenu from "../../../components/ParameterNavigation";
import UnitListModal from "../../../components/userParameterization/UnitListModal";
import AddModifyUnitModal from "../../../components/userParameterization/AddModifyUnitModal";

// Componente principal
const ParameterizationView = () => {
  const [activeMenuItem, setActiveMenuItem] = useState("Units");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Estados para UnitListModal
  const [isUnitListModalOpen, setIsUnitListModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryParameters, setCategoryParameters] = useState([]);

  // Estados para AddModifyUnitModal
  const [isAddModifyModalOpen, setIsAddModifyModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedParameter, setSelectedParameter] = useState(null);

  // Datos de ejemplo actualizados
  const mockData = [
    { 
      id: 1, 
      name: "Weight", 
      description: "Módulo de maquinaria", 
      details: "",
      parameters: [
        { id: 1, unitName: 'Ton', symbol: 'T', value: 'Decimal', status: 'Active' },
        { id: 2, unitName: 'Kg', symbol: 'kg', value: 'Decimal', status: 'Active' },
        { id: 3, unitName: 'Lb', symbol: 'lb', value: 'Decimal', status: 'Inactive' }
      ]
    },
    { 
      id: 2, 
      name: "Length", 
      description: "Módulo de maquinaria", 
      details: "",
      parameters: [
        { id: 4, unitName: 'Meter', symbol: 'm', value: 'Decimal', status: 'Active' },
        { id: 5, unitName: 'Feet', symbol: 'ft', value: 'Decimal', status: 'Active' }
      ]
    },
    { 
      id: 3, 
      name: "Volume", 
      description: "Módulo de maquinaria", 
      details: "",
      parameters: [
        { id: 6, unitName: 'Liter', symbol: 'L', value: 'Decimal', status: 'Active' }
      ]
    },
  ];

  // Opciones del menú de navegación
  const menuItems = [
    "Type...",
    "Status",
    "Brands",
    "Units",
    "Styles",
    "Job Titles",
  ];

  // Función para obtener datos del backend
  const fetchData = async (menuItem = "Units") => {
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

  // ==================== HANDLERS PARA UnitListModal ====================

  // Abrir UnitListModal (cuando se hace click en el ojo de la tabla principal)
  const handleViewDetails = (categoryId) => {
    const category = data.find((item) => item.id === categoryId);
    if (category) {
      setSelectedCategory(category);
      setCategoryParameters(category.parameters || []);
      setIsUnitListModalOpen(true);
    }
  };

  // Cerrar UnitListModal
  const handleCloseUnitListModal = () => {
    setIsUnitListModalOpen(false);
    setSelectedCategory(null);
    setCategoryParameters([]);
  };

  // ==================== HANDLERS PARA AddModifyUnitModal ====================

  // Abrir AddModifyUnitModal en modo ADD (desde botón "Add Parameter" del UnitListModal)
  const handleAddParameter = () => {
    setModalMode("add");
    setSelectedParameter(null);
    setIsAddModifyModalOpen(true);
  };

  // Abrir AddModifyUnitModal en modo EDIT (desde botón "Edit" de la tabla del UnitListModal)
  const handleEditParameter = (parameterId) => {
    const parameter = categoryParameters.find((p) => p.id === parameterId);
    if (parameter) {
      setModalMode("modify");
      setSelectedParameter(parameter);
      setIsAddModifyModalOpen(true);
    }
  };

  // Cerrar AddModifyUnitModal
  const handleCloseAddModifyModal = () => {
    setIsAddModifyModalOpen(false);
    setSelectedParameter(null);
    setModalMode("add");
  };

  // Guardar/actualizar parameter
  const handleSaveParameter = (parameterData) => {
    console.log("Saving/updating parameter:", parameterData);
    
    if (modalMode === "add") {
      // Agregar nuevo parámetro
      const newParameter = {
        ...parameterData,
        id: Date.now(), // ID temporal
      };
      
      const updatedParameters = [...categoryParameters, newParameter];
      setCategoryParameters(updatedParameters);
      
      // Actualizar también en los datos principales
      const updatedData = data.map(item => 
        item.id === selectedCategory.id 
          ? { ...item, parameters: updatedParameters }
          : item
      );
      setData(updatedData);
      
    } else if (modalMode === "modify") {
      // Actualizar parámetro existente
      const updatedParameters = categoryParameters.map(param =>
        param.id === selectedParameter.id ? { ...param, ...parameterData } : param
      );
      setCategoryParameters(updatedParameters);
      
      // Actualizar también en los datos principales
      const updatedData = data.map(item => 
        item.id === selectedCategory.id 
          ? { ...item, parameters: updatedParameters }
          : item
      );
      setData(updatedData);
    }

    // Cerrar el modal
    handleCloseAddModifyModal();
  };

  // ==================== TABLA PRINCIPAL ====================

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Category name",
        cell: (info) => (
          <div className="font-medium text-gray-900">{info.getValue()}</div>
        ),
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: (info) => <div className="text-gray-600">{info.getValue()}</div>,
      }),
      columnHelper.accessor("id", {
        header: "Details",
        cell: (info) => (
          <button
            onClick={() => handleViewDetails(info.getValue())}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors opacity-0 group-hover:opacity-100"
            title="View details"
          >
            <FiEye className="w-4 h-4 text-gray-500 hover:text-gray-700" />
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Parameterization
          </h1>
        </div>

        {/* Filter Section */}
        <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <button className="flex items-center space-x-2 px-3 md:px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors w-fit">
            <FiFilter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Filter by</span>
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
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6 md:mb-8">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">Error: {error}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-4 md:px-6 py-3 md:py-4 text-left text-sm font-semibold text-gray-900 border-r border-gray-200 last:border-r-0"
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
                  <tbody className="divide-y divide-gray-200">
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 group">
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-4 md:px-6 py-3 md:py-4 text-sm border-r border-gray-200 last:border-r-0"
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
              <div className="px-4 py-6 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next →
                    </button>
                  </div>

                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                              className="inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                              1
                            </button>
                          );
                        }

                        if (currentPage > 4) {
                          pages.push(
                            <span
                              key="ellipsis1"
                              className="inline-flex items-center justify-center w-10 h-10 text-sm text-gray-400"
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
                              className={`inline-flex items-center justify-center w-10 h-10 text-sm font-medium rounded-md transition-colors ${
                                i === currentPage
                                  ? "bg-gray-800 text-white"
                                  : "text-gray-600 bg-gray-100 hover:bg-gray-200"
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
                              className="inline-flex items-center justify-center w-10 h-10 text-sm text-gray-400"
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
                              className="inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
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
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      {/* UnitListModal - Modal de lista de parámetros */}
      <UnitListModal
        isOpen={isUnitListModalOpen}
        onClose={handleCloseUnitListModal}
        categoryName={selectedCategory?.name || ""}
        data={categoryParameters}
        onAddParameter={handleAddParameter}
        onEditParameter={handleEditParameter}
      />

      {/* AddModifyUnitModal - Modal para agregar/editar parámetros */}
      <AddModifyUnitModal
        isOpen={isAddModifyModalOpen}
        onClose={handleCloseAddModifyModal}
        mode={modalMode}
        unit={selectedParameter}
        category={selectedCategory?.name || ""}
        onSave={handleSaveParameter}
      />
    </div>
  );
};

export default ParameterizationView;