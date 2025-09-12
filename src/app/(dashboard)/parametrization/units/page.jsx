"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import NavigationMenu from "../../../components/shared/ParameterNavigation";
import UnitListModal from "../../../components/parametrization/UnitListModal";
import AddModifyUnitModal from "../../../components/parametrization/AddModifyUnitModal";
import FilterSection from '@/app/components/parametrization/FilterSection';
import { getUnitsCategories, getUnitsByCategory } from "@/services/parametrizationService";
import { useTheme } from "@/contexts/ThemeContext";

// Componente principal
const ParameterizationView = () => {
  const { currentTheme } = useTheme();
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

  // Datos mock para otras pestañas (no Units)
  const mockDataForOtherTabs = [
    {
      id: 1,
      name: "Sample Category",
      description: "Sample description",
      details: "",
      parameters: []
    }
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
    console.log("🚀 fetchData called with:", menuItem);
    setLoading(true);
    setError(null);

    try {
      if (menuItem === "Units") {
        console.log("📡 About to call getUnitsCategories()");
        const response = await getUnitsCategories();
        console.log("✅ Categories API Response:", response);

        const transformedData = response.data.map(category => ({
          id: category.id_units_categories,
          name: category.name,
          description: category.description,
          details: "",
          parameters: []
        }));

        console.log("🔄 Transformed categories data:", transformedData);
        setData(transformedData);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setData(mockDataForOtherTabs);
      }
    } catch (err) {
      console.error("❌ Error in fetchData:", err);
      setError(err.message);
      if (menuItem === "Units") {
        setData([]);
      } else {
        setData(mockDataForOtherTabs);
      }
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

  // Función para recargar los datos de la categoría seleccionada
  const handleReloadCategoryData = useCallback(async () => {
    if (selectedCategory) {
      try {
        console.log("🔄 Reloading category data...");
        const response = await getUnitsByCategory(selectedCategory.id);
        console.log("🔍 Raw unit data from reload:", response.data[0]); // ← Debug del primer elemento

        const transformedUnits = response.data.map(unit => {
          console.log("🔍 Individual unit from reload:", unit); // ← Debug individual unit
          return {
            id: unit.id_units,
            unitName: unit.name,
            symbol: unit.symbol, // ← Cambiado para usar el symbol real del JSON
            value: unit.unit_type_name, // ← Cambiado de unit.description a unit.unit_type_name
            unitType: unit.unit_type || unit.id_types || unit.unit_type_id || unit.id_unit_type, // ← unit_type es el correcto según logs
            status: unit.statues_name, // ← Usar statues_name directamente del JSON
            statusId: unit.id_statues, // ← Agregar el ID para referencia
            description: unit.description
          };
        });
        
        console.log("🔍 Transformed units from reload:", transformedUnits[0]); // ← Debug del primer elemento transformado

        setCategoryParameters(transformedUnits);
      } catch (error) {
        console.error("❌ Error reloading category data:", error);
      }
    }
  }, [selectedCategory]);

  // ==================== HANDLERS PARA UnitListModal ====================

  // Abrir UnitListModal (cuando se hace click en el ojo de la tabla principal)
  const handleViewDetails = useCallback(async (categoryId) => {
    const category = data.find((item) => item.id === categoryId);

    if (category) {
      setSelectedCategory(category);
      setIsUnitListModalOpen(true);

      try {
        const response = await getUnitsByCategory(categoryId);
        console.log("✅ Units API Response:", response);
        console.log("🔍 Raw unit data from API:", response.data[0]); // ← Debug del primer elemento

        const transformedUnits = response.data.map(unit => {
          console.log("🔍 Individual unit from handleViewDetails:", unit); // ← Debug individual unit
          return {
            id: unit.id_units,
            unitName: unit.name,
            symbol: unit.symbol, // ← Cambiado para usar el symbol real del JSON
            value: unit.unit_type_name, // ← Cambiado de unit.description a unit.unit_type_name
            unitType: unit.unit_type || unit.id_types || unit.unit_type_id || unit.id_unit_type, // ← unit_type es el correcto según logs
            status: unit.statues_name, // ← Usar statues_name directamente del JSON
            statusId: unit.id_statues, // ← Agregar el ID para referencia
            description: unit.description
          };
        });
        
        console.log("🔍 Transformed units:", transformedUnits[0]); // ← Debug del primer elemento transformado

        setCategoryParameters(transformedUnits);
      } catch (error) {
        console.error("❌ Error in handleViewDetails:", error);
        setCategoryParameters([]);
      }
    }
  }, [data]); // ← Dependencia del estado data

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
  const handleSaveParameter = async (parameterData) => {
    console.log("💾 Saving/updating parameter:", parameterData);

    try {
      if (modalMode === "add") {
        // Si es modo agregar y hay mensaje de éxito, recargar datos
        if (parameterData.success) {
          console.log("✅ Unit created successfully, reloading data...");
          // Recargar la lista de parámetros
          if (selectedCategory) {
            const response = await getUnitsByCategory(selectedCategory.id);
            console.log("🔄 Reloaded units:", response);

            const transformedUnits = response.data.map(unit => {
              console.log("🔍 Individual unit from add save:", unit); // ← Debug individual unit
              return {
                id: unit.id_units,
                unitName: unit.name,
                symbol: unit.symbol, // ← Cambiado para usar el symbol real del JSON
                value: unit.unit_type_name, // ← Cambiado de unit.description a unit.unit_type_name
                unitType: unit.unit_type || unit.id_types || unit.unit_type_id || unit.id_unit_type, // ← unit_type es el correcto según logs
                status: unit.statues_name, // ← Usar statues_name directamente del JSON
                statusId: unit.id_statues, // ← Agregar el ID para referencia
                description: unit.description
              };
            });

            setCategoryParameters(transformedUnits);
          }
        } else {
          // Lógica anterior para modo mock (mantener por compatibilidad)
          const newParameter = {
            ...parameterData,
            id: Date.now(),
          };

          const updatedParameters = [...categoryParameters, newParameter];
          setCategoryParameters(updatedParameters);

          const updatedData = data.map(item =>
            item.id === selectedCategory.id
              ? { ...item, parameters: updatedParameters }
              : item
          );
          setData(updatedData);
        }
      } else if (modalMode === "modify") {
        // Si es modo modificar y hay mensaje de éxito O cambio de estado, recargar datos
        if (parameterData.success || parameterData.statusChanged) {
          console.log("✅ Unit updated/status changed successfully, reloading data...");
          // Recargar la lista de parámetros desde la API
          if (selectedCategory) {
            const response = await getUnitsByCategory(selectedCategory.id);
            console.log("🔄 Reloaded units after update:", response);

            console.log("🔍 Raw unit data from API:", response.data[0]); // ← Debug del primer elemento
            
            const transformedUnits = response.data.map(unit => {
              console.log("🔍 Individual unit from modify save:", unit); // ← Debug individual unit
              return {
                id: unit.id_units,
                unitName: unit.name,
                symbol: unit.symbol, // ← Cambiado para usar el symbol real del JSON
                value: unit.unit_type_name,
                unitType: unit.unit_type || unit.id_types || unit.unit_type_id || unit.id_unit_type, // ← unit_type es el correcto según logs
                status: unit.statues_name, // ← Usar statues_name directamente del JSON
                statusId: unit.id_statues, // ← Agregar el ID para referencia
                description: unit.description
              };
            });
            
            console.log("🔍 Transformed units:", transformedUnits[0]); // ← Debug del primer elemento transformado

            setCategoryParameters(transformedUnits);
          }
        } else {
          // Lógica anterior para modo mock (mantener por compatibilidad)
          const updatedParameters = categoryParameters.map(param =>
            param.id === selectedParameter.id ? { ...param, ...parameterData } : param
          );
          setCategoryParameters(updatedParameters);

          const updatedData = data.map(item =>
            item.id === selectedCategory.id
              ? { ...item, parameters: updatedParameters }
              : item
          );
          setData(updatedData);
        }
      }
    } catch (error) {
      console.error("❌ Error in handleSaveParameter:", error);
    }
  };

  // ==================== TABLA PRINCIPAL ====================

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
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
    [handleViewDetails] // Ahora sí podemos incluirlo ya que es useCallback
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
        <FilterSection
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          placeholder="Search categories..."
        />

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
                              className={`parametrization-pagination-button inline-flex items-center justify-center w-10 h-10 text-sm font-medium transition-colors ${i === currentPage ? 'active' : ''
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

      {/* UnitListModal - Modal de lista de parámetros */}
      <UnitListModal
        isOpen={isUnitListModalOpen}
        onClose={handleCloseUnitListModal}
        categoryName={selectedCategory?.name || ""}
        data={categoryParameters}
        onAddParameter={handleAddParameter}
        onEditParameter={handleEditParameter}
        onReloadData={handleReloadCategoryData}
      />

      {/* AddModifyUnitModal - Modal para agregar/editar parámetros */}
      <AddModifyUnitModal
        isOpen={isAddModifyModalOpen}
        onClose={handleCloseAddModifyModal}
        mode={modalMode}
        unit={selectedParameter}
        category={selectedCategory?.name || ""}
        categoryId={selectedCategory?.id || 1}
        onSave={handleSaveParameter}
      />
    </div>
  );
};

export default ParameterizationView;