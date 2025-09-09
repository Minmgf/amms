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
  getTypesCategories, 
  getTypesByCategory, 
  createTypeItem, 
  updateTypeItem 
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
  
  // Estados para TypesModal (lista de types por categoría)
  const [isTypesModalOpen, setIsTypesModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [typesData, setTypesData] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  
  // Estados para AddModifyTypesModal (agregar/editar type)
  const [isAddModifyTypesModalOpen, setIsAddModifyTypesModalOpen] = useState(false);
  const [typeFormMode, setTypeFormMode] = useState('add');
  const [selectedType, setSelectedType] = useState(null);

  // Función para obtener categorías del backend
  const fetchData = async (menuItem = 'Types') => {
    setLoading(true);
    setError(null);
    
    console.log('🔄 MainView: Iniciando carga de datos...');
    console.log('🎯 MainView: Menu seleccionado:', menuItem);
    
    try {
      console.log('📞 MainView: Llamando a getTypesCategories...');
      const response = await getTypesCategories();
      
      console.log('✅ MainView: Respuesta recibida del servicio:');
      console.log('📊 MainView: Datos completos:', response);
      console.log('📈 MainView: Cantidad de registros:', Array.isArray(response) ? response.length : 'No es array');
      console.log('🔍 MainView: Primer elemento:', response?.[0]);
      
      // Mapear los datos del backend al formato esperado por la vista
      const mappedData = response.map((item, index) => {
        console.log(`🔄 MainView: Mapeando item ${index + 1}:`, item);
        return {
          id: item.id || item.id_types_categories,
          name: item.name,
          description: item.description,
          details: ''
        };
      });
      
      console.log('🎨 MainView: Datos mapeados para la vista:');
      console.log('📋 MainView: mappedData:', mappedData);
      
      setData(mappedData);
      console.log('✅ MainView: Datos establecidos en el estado exitosamente');
      
    } catch (err) {
      console.error('❌ MainView: Error completo:', err);
      console.error('📨 MainView: Error response:', err.response);
      console.error('⚠️ MainView: Error message:', err.message);
      
      setError(err.message || 'Error al cargar los datos');
      setData([]);
    } finally {
      setLoading(false);
      console.log('🏁 MainView: Proceso de carga finalizado');
    }
  };

  // Función para obtener types por categoría
  const fetchTypesByCategory = async (categoryId) => {
    setLoadingTypes(true);
    try {
      console.log('📞 MainView: Obteniendo types para categoría:', categoryId);
      const response = await getTypesByCategory(categoryId);
      
      console.log('✅ MainView: Types obtenidos:', response);
      
      // Mapear los datos al formato esperado por el TypesModal
      const mappedTypes = response.map(item => ({
        id: item.id || item.id_types,
        typeName: item.name,
        description: item.description,
        status: item.isActive ? 'Active' : 'Inactive',
        isActive: item.isActive
      }));
      
      setTypesData(mappedTypes);
      console.log('🎨 MainView: Types mapeados:', mappedTypes);
      
    } catch (err) {
      console.error('❌ MainView: Error al obtener types:', err);
      setTypesData([]);
    } finally {
      setLoadingTypes(false);
    }
  };

  useEffect(() => {
    console.log('🎬 MainView: useEffect ejecutado - activeMenuItem changed:', activeMenuItem);
    fetchData(activeMenuItem);
  }, [activeMenuItem]);

  const handleMenuItemChange = (item) => {
    console.log('🔄 MainView: Cambiando menu item de', activeMenuItem, 'a', item);
    setActiveMenuItem(item);
  };

  // ==================== HANDLERS PARA TypesModal ====================
  
  // Abrir TypesModal (cuando se hace click en el ojo de la tabla principal)
  const handleViewDetails = async (categoryId) => {
    const category = data.find(item => item.id === categoryId);
    if (category) {
      setSelectedCategory(category);
      setIsTypesModalOpen(true);
      
      // Cargar los types de esta categoría
      await fetchTypesByCategory(categoryId);
    }
  };

  // Cerrar TypesModal
  const handleCloseTypesModal = () => {
    setIsTypesModalOpen(false);
    setSelectedCategory(null);
    setTypesData([]);
  };

  // ==================== HANDLERS PARA AddModifyTypesModal ====================
  
  // Abrir AddModifyTypesModal en modo ADD
  const handleAddType = () => {
    setTypeFormMode('add');
    setSelectedType(null);
    setIsAddModifyTypesModalOpen(true);
  };

  // Abrir AddModifyTypesModal en modo EDIT
  const handleEditType = (typeId) => {
    const typeToEdit = typesData.find(type => type.id === typeId);
    if (typeToEdit) {
      setTypeFormMode('modify');
      setSelectedType(typeToEdit);
      setIsAddModifyTypesModalOpen(true);
    }
  };

  // Cerrar AddModifyTypesModal
  const handleCloseAddModifyTypesModal = () => {
    setIsAddModifyTypesModalOpen(false);
    setSelectedType(null);
    setTypeFormMode('add');
  };

  // Guardar/Actualizar type
  const handleSaveType = async (typeData) => {
    try {
      console.log('💾 MainView: Guardando type data:', typeData);
      
      if (typeFormMode === 'add') {
        // Crear nuevo type
        const payload = {
          name: typeData.typeName,
          description: typeData.description,
          isActive: typeData.isActive,
          id_types_categories: selectedCategory.id
        };
        
        console.log('📤 MainView: Creando type con payload:', payload);
        const newType = await createTypeItem(payload);
        console.log('✅ MainView: Type creado exitosamente:', newType);
        
        // Actualizar la lista local
        const mappedNewType = {
          id: newType.id,
          typeName: newType.name,
          description: newType.description,
          status: newType.isActive ? 'Active' : 'Inactive',
          isActive: newType.isActive
        };
        
        setTypesData(prev => [...prev, mappedNewType]);
        
      } else {
        // Actualizar type existente
        const payload = {
          name: typeData.typeName,
          description: typeData.description,
          isActive: typeData.isActive
        };
        
        console.log('📤 MainView: Actualizando type ID:', selectedType.id, 'con payload:', payload);
        const updatedType = await updateTypeItem(selectedType.id, payload);
        console.log('✅ MainView: Type actualizado exitosamente:', updatedType);
        
        // Actualizar la lista local
        const mappedUpdatedType = {
          id: updatedType.id,
          typeName: updatedType.name,
          description: updatedType.description,
          status: updatedType.isActive ? 'Active' : 'Inactive',
          isActive: updatedType.isActive
        };
        
        setTypesData(prev => 
          prev.map(type => 
            type.id === selectedType.id ? mappedUpdatedType : type
          )
        );
      }
      
      // Cerrar el modal
      handleCloseAddModifyTypesModal();
      
    } catch (err) {
      console.error('❌ MainView: Error al guardar type:', err);
      // Aquí podrías mostrar un mensaje de error al usuario
      setError(`Error al ${typeFormMode === 'add' ? 'crear' : 'actualizar'} el tipo: ${err.message}`);
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
    [data] // Cambiado la dependencia para evitar recrear innecesariamente
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
      
      {/* TypesModal - Modal de lista de types por categoría */}
      <TypesModal
        isOpen={isTypesModalOpen}
        onClose={handleCloseTypesModal}
        categoryName={selectedCategory?.name || ''}
        data={typesData}
        loading={loadingTypes}
        onAddItem={handleAddType}
        onEditItem={handleEditType}
      />

      {/* AddModifyTypesModal - Modal para agregar/editar types */}
      <AddModifyTypesModal
        isOpen={isAddModifyTypesModalOpen}
        onClose={handleCloseAddModifyTypesModal}
        mode={typeFormMode}
        status={selectedType}
        category={selectedCategory?.name || ''}
        onSave={handleSaveType}
      />
    </div>
  );
};

export default ParameterizationView;