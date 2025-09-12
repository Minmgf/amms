"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { FiFilter, FiEye } from 'react-icons/fi';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import NavigationMenu from '../../../components/shared/ParameterNavigation';
import TypesModal from '../../../components/parametrization/TypesModal';
import AddModifyTypesModal from '../../../components/parametrization/AddModifyTypesModal';
import { SuccessModal, ErrorModal } from '../../../components/shared/SuccessErrorModal';
import { 
  getTypesCategories,
  getTypesByCategory, 
  createTypeItem, 
  updateTypeItem,
  toggleTypeStatus
} from "@/services/parametrizationService";
import { useTheme } from "@/contexts/ThemeContext";

// Componente principal
const ParameterizationView = () => {
  const { currentTheme } = useTheme();
  const [activeMenuItem, setActiveMenuItem] = useState('Types');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para Modal de detalles (lista de parámetros por categoría)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [parametersData, setParametersData] = useState([]);
  const [loadingParameters, setLoadingParameters] = useState(false);
  
  // Estados para Modal de agregar/editar parámetros
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [selectedParameter, setSelectedParameter] = useState(null);

  // Estados para los modales de success/error
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Función para mostrar modal de éxito
  const showSuccessModal = (message) => {
    setSuccessMessage(message);
    setIsSuccessModalOpen(true);
  };

  // Función para mostrar modal de error
  const showErrorModal = (message) => {
    setErrorMessage(message);
    setIsErrorModalOpen(true);
  };

  // Función para obtener categorías de Types
  const fetchCategoriesData = async () => {
    setLoading(true);

    try {
      const response = await getTypesCategories();
      
      // Mapear los datos del backend al formato esperado por la vista
      const mappedData = response.map((item) => ({
        id: item.id_types_categories,
        name: item.name,
        description: item.description,
        type: 'Types'
      }));
      
      setData(mappedData);
      
    } catch (err) {
      console.error('❌ MainView: Error al cargar categorías:', err);
      const errorMsg = `Error loading Types categories: ${err.message}`;
      showErrorModal(errorMsg);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener parámetros por categoría
  const fetchParametersByCategory = async (categoryId) => {
    setLoadingParameters(true);
    try {
      
      const response = await getTypesByCategory(categoryId);
      
      // Mapear los datos al formato esperado por el modal
      const mappedParameters = response.map(item => ({
        id: item.id_types,
        typeName: item.name,
        name: item.name,
        description: item.description,
        status: item.estado === 'Activo' ? 'Active' : 'Inactive',
        isActive: item.estado === 'Activo'
      }));
      
      setParametersData(mappedParameters);
      
    } catch (err) {
      const errorMsg = `Error loading parameters: ${err.message}`;
      showErrorModal(errorMsg);
      setParametersData([]);
    } finally {
      setLoadingParameters(false);
    }
  };

  // Función para validar nombres duplicados
  const validateDuplicateName = (name, excludeId = null) => {
    const normalizedName = name.trim().toLowerCase();
    return parametersData.some(param => 
      param.typeName.toLowerCase() === normalizedName && 
      param.id !== excludeId
    );
  };

  // Efecto para cargar datos
  useEffect(() => {
    fetchCategoriesData();
  }, []);

  const handleMenuItemChange = (item) => {
    setActiveMenuItem(item);
  };

  // ==================== HANDLERS PARA MODAL DE DETALLES ====================
  
  // Abrir modal de detalles (cuando se hace click en el ojo de la tabla principal)
  const handleViewDetails = async (categoryId) => {
    const category = data.find(item => item.id === categoryId);
    if (category) {
      setSelectedCategory(category);
      setIsDetailsModalOpen(true);
      
      // Cargar los parámetros de esta categoría
      await fetchParametersByCategory(categoryId);
    }
  };

  // Cerrar modal de detalles
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedCategory(null);
    setParametersData([]);
  };

  // ==================== HANDLERS PARA MODAL DE FORMULARIO ====================
  
  // Abrir modal de formulario en modo ADD
  const handleAddParameter = () => {
    setFormMode('add');
    setSelectedParameter(null);
    setIsFormModalOpen(true);
  };

  // Abrir modal de formulario en modo EDIT
  const handleEditParameter = (parameterId) => {
    const parameterToEdit = parametersData.find(param => param.id === parameterId);
    if (parameterToEdit) {
      setFormMode('modify');
      setSelectedParameter(parameterToEdit);
      setIsFormModalOpen(true);
    }
  };

  // Cerrar modal de formulario
  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedParameter(null);
    setFormMode('add');
  };

  // Guardar/Actualizar parámetro
  const handleSaveParameter = async (parameterData) => {
    try {
      // Validar nombres duplicados
      if (formMode === 'add') {
        if (validateDuplicateName(parameterData.typeName)) {
          throw new Error(`A parameter with the name "${parameterData.typeName}" already exists in this category`);
        }
      } else {
        if (validateDuplicateName(parameterData.typeName, selectedParameter.id)) {
          throw new Error(`A parameter with the name "${parameterData.typeName}" already exists in this category`);
        }
      }
      
      if (formMode === 'add') {
        // Crear nuevo parámetro
        const payload = {
          name: parameterData.typeName,
          description: parameterData.description,
          types_category: selectedCategory.id,
          responsible_user: 1 // TODO: Obtener del contexto de usuario
        };
        
        const createdResponse = await createTypeItem(payload);   
        // Si se crea como inactivo, hacer toggle después de crear
        if (!parameterData.isActive) {
          try {
            // Primero recargar la lista para obtener el ID del nuevo elemento
            await fetchParametersByCategory(selectedCategory.id);
            
            // Encontrar el elemento recién creado (será el último con el nombre correspondiente)
            const updatedParameters = await getTypesByCategory(selectedCategory.id);
            const newParameter = updatedParameters.find(p => p.name === parameterData.typeName);
            
            if (newParameter) {
              const newParameterId = newParameter.id_types;
              await toggleTypeStatus(newParameterId);
            }
          } catch (toggleError) {
            console.warn('⚠️ MainView: Error al desactivar parámetro recién creado:', toggleError);
          }
        }
        
        // Recargar la lista de parámetros después de crear
        await fetchParametersByCategory(selectedCategory.id);
        
        // Mostrar mensaje de éxito
        showSuccessModal(`Parameter "${parameterData.typeName}" has been created successfully.`);
        
      } else {
        // Actualizar parámetro existente
        const updatePayload = {
          name: parameterData.typeName,
          description: parameterData.description,
          responsible_user: 1 // TODO: Obtener del contexto de usuario
        };
        
        const updatedResponse = await updateTypeItem(selectedParameter.id, updatePayload);
        
        // Si el estado cambió, hacer toggle
        if (parameterData.isActive !== selectedParameter.isActive) {
          try {
            await toggleTypeStatus(selectedParameter.id);
          } catch (toggleError) {
            console.warn('⚠️ MainView: Error al cambiar estado:', toggleError);
          }
        }
        
        // Recargar la lista de parámetros después de actualizar
        await fetchParametersByCategory(selectedCategory.id);
        
        // Mostrar mensaje de éxito
        showSuccessModal(`Parameter "${parameterData.typeName}" has been updated successfully.`);
      }
      
      // Cerrar el modal
      handleCloseFormModal();
      
    } catch (err) {
      console.error('❌ MainView: Error al guardar parámetro:', err);
      const errorMsg = `Error ${formMode === 'add' ? 'creating' : 'updating'} parameter: ${err.message}`;
      
      // Mostrar modal de error
      showErrorModal(errorMsg);
      
      // Re-lanzar el error para que lo maneje el modal
      throw new Error(errorMsg);
    }
  };

  // ==================== TABLA PRINCIPAL ====================

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Category name',
        cell: info => (
          <div className="font-medium">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: info => (
          <div className="secondary">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('id', {
        header: 'Details',
        cell: info => (
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
    [data]
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="parametrization-filter-button flex items-center space-x-2 px-3 md:px-4 py-2 transition-colors w-fit"
            >
              <FiFilter className="filter-icon w-4 h-4" />
              <span className="text-sm">Filter by</span>
            </button>
            
            {/* Expandable Filter Input */}
            {showFilters && (
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Search categories..."
                  className="parametrization-filter-input px-3 py-2 pr-10 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:min-w-[200px]"
                />
                {globalFilter && (
                  <button
                    onClick={() => setGlobalFilter('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    title="Clear filter"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu - Tabs para Types, States, Brands, etc. */}
        <div className="mb-6 md:mb-8">
          <NavigationMenu
            activeItem={activeMenuItem}
            onItemClick={handleMenuItemChange}
          />
        </div>

        {/* Table */}
        <div className="parametrization-table mb-6 md:mb-8">
          {loading ? (
            <div className="parametrization-loading p-8 text-center">
              Loading...
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="parametrization-table-header">
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <th
                            key={header.id}
                            className="parametrization-table-cell px-4 md:px-6 py-3 md:py-4 text-left text-sm font-semibold last:border-r-0"
                          >
                            {header.isPlaceholder ? null : (
                              <div
                                {...{
                                  className: header.column.getCanSort()
                                    ? 'cursor-pointer select-none flex items-center gap-2'
                                    : '',
                                  onClick: header.column.getToggleSortingHandler(),
                                }}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                {{
                                  asc: ' 🔼',
                                  desc: ' 🔽',
                                }[header.column.getIsSorted()] ?? null}
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map(row => (
                      <tr key={row.id} className="parametrization-table-row group">
                        {row.getVisibleCells().map(cell => (
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
                        const currentPage = table.getState().pagination.pageIndex + 1;
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
                            <span key="ellipsis1" className="parametrization-pagination-ellipsis inline-flex items-center justify-center w-10 h-10 text-sm">
                              ...
                            </span>
                          );
                        }
                        
                        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
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
                            <span key="ellipsis2" className="parametrization-pagination-ellipsis inline-flex items-center justify-center w-10 h-10 text-sm">
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
                      onChange={e => {
                        table.setPageSize(Number(e.target.value))
                      }}
                      className="parametrization-pagination-select px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[10, 20, 30, 40, 50].map(pageSize => (
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
      
      {/* Modal de Detalles - Lista de parámetros por categoría */}
      <TypesModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        categoryName={selectedCategory?.name || ''}
        data={parametersData}
        loading={loadingParameters}
        onAddItem={handleAddParameter}
        onEditItem={handleEditParameter}
      />

      {/* Modal de Formulario - Agregar/editar parámetros */}
      <AddModifyTypesModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        mode={formMode}
        status={selectedParameter}
        category={selectedCategory?.name || ''}
        onSave={handleSaveParameter}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Success"
        message={successMessage}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title="Error"
        message={errorMessage}
      />
    </div>
  );
};

export default ParameterizationView;