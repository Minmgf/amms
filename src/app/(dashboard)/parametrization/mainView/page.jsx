"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { FiFilter, FiEdit3, FiBell, FiEye, FiPlus } from 'react-icons/fi';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import NavigationMenu from '../../../components/ParameterNavigation';
import TypesModal from '../../../components/parametrization/TypesModal';
import AddModifyTypesModal from '../../../components/parametrization/AddModifyTypesModal';
import { 
  // Servicios para Types
  getTypesCategories,
  getTypesByCategory, 
  createTypeItem, 
  updateTypeItem,
  toggleTypeStatus,
  // Servicios para States
  getStatuesCategories,
  getStatuesByCategory,
  createStatueItem,
  updateStatue,
  toggleStatueStatus
} from "@/services/parametrizationService";
import { useTheme } from "@/contexts/ThemeContext";

// Componente principal
const ParameterizationView = () => {
  const { currentTheme } = useTheme();
  const [activeMenuItem, setActiveMenuItem] = useState('Types');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  
  // Estados para Modal de detalles (lista de parámetros por categoría)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [parametersData, setParametersData] = useState([]);
  const [loadingParameters, setLoadingParameters] = useState(false);
  
  // Estados para Modal de agregar/editar parámetros
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [selectedParameter, setSelectedParameter] = useState(null);

  // Función para obtener categorías según el tipo de parámetro
  const fetchCategoriesData = async (parameterType) => {
    setLoading(true);
    setError(null);
    
    console.log('🔄 MainView: Cargando categorías para:', parameterType);
    
    try {
      let response = [];
      
      switch (parameterType) {
        case 'Types':
          response = await getTypesCategories();
          break;
        case 'States':
          response = await getStatuesCategories();
          break;
        case 'Brands':
        case 'Units':
        case 'Styles':
        case 'Positions':
          // Pendiente implementación de otros endpoints
          console.warn(`⚠️ Endpoint para ${parameterType} no implementado aún`);
          response = [];
          break;
        default:
          response = await getTypesCategories();
      }
      
      console.log('✅ MainView: Categorías obtenidas:', response);
      
      // Mapear los datos del backend al formato esperado por la vista
      const mappedData = response.map((item) => ({
        // Para Types: usar id_types_categories
        // Para States: usar id_statues_categories
        id: item.id_types_categories || item.id_statues_categories || item.id,
        name: item.name,
        description: item.description,
        type: parameterType
      }));
      
      setData(mappedData);
      console.log('🎨 MainView: Datos mapeados:', mappedData);
      
    } catch (err) {
      console.error('❌ MainView: Error al cargar categorías:', err);
      setError(`Error al cargar categorías de ${parameterType}: ${err.message}`);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener parámetros por categoría según el tipo
  const fetchParametersByCategory = async (categoryId, parameterType) => {
    setLoadingParameters(true);
    try {
      console.log('📞 MainView: Obteniendo parámetros para categoría:', categoryId, 'tipo:', parameterType);
      
      let response = [];
      
      switch (parameterType) {
        case 'Types':
          response = await getTypesByCategory(categoryId);
          break;
        case 'States':
          response = await getStatuesByCategory(categoryId);
          break;
        case 'Brands':
        case 'Units':
        case 'Styles':
        case 'Positions':
          // Pendiente implementación de otros endpoints
          console.warn(`⚠️ Endpoint para obtener ${parameterType} por categoría no implementado aún`);
          response = [];
          break;
        default:
          response = await getTypesByCategory(categoryId);
      }
      
      console.log('✅ MainView: Parámetros obtenidos:', response);
      
      // Mapear los datos al formato esperado por el modal
      const mappedParameters = response.map(item => ({
        // Para Types: usar id_types
        // Para States: usar id_statues
        id: item.id_types || item.id_statues || item.id,
        typeName: item.name,
        name: item.name,
        description: item.description,
        // El backend devuelve "estado" con valores "Activo"/"Inactivo"
        status: item.estado === 'Activo' ? 'Active' : 'Inactive',
        isActive: item.estado === 'Activo'
      }));
      
      setParametersData(mappedParameters);
      console.log('🎨 MainView: Parámetros mapeados:', mappedParameters);
      
    } catch (err) {
      console.error('❌ MainView: Error al obtener parámetros:', err);
      setError(`Error al obtener parámetros: ${err.message}`);
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

  // Efecto para cargar datos cuando cambia el tipo de parámetro
  useEffect(() => {
    console.log('🎬 MainView: Cambiando tipo de parámetro a:', activeMenuItem);
    fetchCategoriesData(activeMenuItem);
  }, [activeMenuItem]);

  const handleMenuItemChange = (item) => {
    console.log('🔄 MainView: Cambiando menu item de', activeMenuItem, 'a', item);
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
      await fetchParametersByCategory(categoryId, category.type);
    }
  };

  // Cerrar modal de detalles
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedCategory(null);
    setParametersData([]);
    // Limpiar errores relacionados con parámetros
    if (error && error.includes('parámetros')) {
      setError(null);
    }
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
      console.log('💾 MainView: Guardando parámetro:', parameterData);
      
      const parameterType = selectedCategory?.type || activeMenuItem;
      
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
        const basePayload = {
          name: parameterData.typeName,
          description: parameterData.description,
          responsible_user: 1 // TODO: Obtener del contexto de usuario
        };
        
        let payload = {};
        let createdResponse = {};
        
        switch (parameterType) {
          case 'Types':
            payload = {
              ...basePayload,
              types_category: selectedCategory.id
            };
            createdResponse = await createTypeItem(payload);
            break;
            
          case 'States':
            payload = {
              ...basePayload,
              statues_category: selectedCategory.id
            };
            createdResponse = await createStatueItem(payload);
            break;
            
          default:
            throw new Error(`Creación de ${parameterType} no implementada aún`);
        }
        
        console.log('✅ MainView: Parámetro creado exitosamente:', createdResponse);
        
        // Si se crea como inactivo, hacer toggle después de crear
        if (!parameterData.isActive) {
          try {
            console.log('🔄 MainView: Desactivando parámetro recién creado');
            
            // Primero recargar la lista para obtener el ID del nuevo elemento
            await fetchParametersByCategory(selectedCategory.id, parameterType);
            
            // Encontrar el elemento recién creado (será el último con el nombre correspondiente)
            const updatedParameters = await (parameterType === 'Types' 
              ? getTypesByCategory(selectedCategory.id)
              : getStatuesByCategory(selectedCategory.id));
            
            const newParameter = updatedParameters.find(p => p.name === parameterData.typeName);
            
            if (newParameter) {
              const newParameterId = newParameter.id_types || newParameter.id_statues || newParameter.id;
              
              switch (parameterType) {
                case 'Types':
                  await toggleTypeStatus(newParameterId);
                  break;
                case 'States':
                  await toggleStatueStatus(newParameterId);
                  break;
              }
            }
          } catch (toggleError) {
            console.warn('⚠️ MainView: Error al desactivar parámetro recién creado:', toggleError);
          }
        }
        
        // Recargar la lista de parámetros después de crear
        await fetchParametersByCategory(selectedCategory.id, parameterType);
        
      } else {
        // Actualizar parámetro existente
        const updatePayload = {
          name: parameterData.typeName,
          description: parameterData.description,
          responsible_user: 1 // TODO: Obtener del contexto de usuario
        };
        
        let updatedResponse = {};
        
        switch (parameterType) {
          case 'Types':
            updatedResponse = await updateTypeItem(selectedParameter.id, updatePayload);
            break;
            
          case 'States':
            updatedResponse = await updateStatue(selectedParameter.id, updatePayload);
            break;
            
          default:
            throw new Error(`Actualización de ${parameterType} no implementada aún`);
        }
        
        console.log('✅ MainView: Parámetro actualizado exitosamente:', updatedResponse);
        
        // Si el estado cambió, hacer toggle
        if (parameterData.isActive !== selectedParameter.isActive) {
          try {
            console.log('🔄 MainView: Cambiando estado del parámetro editado');
            
            switch (parameterType) {
              case 'Types':
                await toggleTypeStatus(selectedParameter.id);
                break;
              case 'States':
                await toggleStatueStatus(selectedParameter.id);
                break;
            }
          } catch (toggleError) {
            console.warn('⚠️ MainView: Error al cambiar estado:', toggleError);
          }
        }
        
        // Recargar la lista de parámetros después de actualizar
        await fetchParametersByCategory(selectedCategory.id, parameterType);
      }
      
      // Cerrar el modal
      handleCloseFormModal();
      
    } catch (err) {
      console.error('❌ MainView: Error al guardar parámetro:', err);
      // Re-lanzar el error para que lo maneje el modal
      throw new Error(`Error al ${formMode === 'add' ? 'crear' : 'actualizar'} el parámetro: ${err.message}`);
    }
  };

  // ==================== TABLA PRINCIPAL ====================

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Category name',
        cell: info => (
          <div className="font-medium parametrization-table-cell">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: info => (
          <div className="parametrization-table-cell secondary">
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
          <button className="parametrization-filter-button flex items-center space-x-2 px-3 md:px-4 py-2 transition-colors w-fit">
            <FiFilter className="filter-icon w-4 h-4" />
            <span className="text-sm">Filter by</span>
          </button>
        </div>

        {/* Navigation Menu - Tabs para Types, States, Brands, etc. */}
        <div className="mb-6 md:mb-8">
          <NavigationMenu
            activeItem={activeMenuItem}
            onItemClick={handleMenuItemChange}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="parametrization-error mb-4">
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 hover:underline text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Table */}
        <div className="parametrization-table mb-6 md:mb-8">
          {loading ? (
            <div className="parametrization-loading p-8 text-center">
              Loading {activeMenuItem.toLowerCase()} categories...
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
                  <tbody className="divide-y divide-gray-200">
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
    </div>
  );
};

export default ParameterizationView;