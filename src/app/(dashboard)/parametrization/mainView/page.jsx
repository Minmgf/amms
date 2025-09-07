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
import { getTypesCategories } from "@/services/typeCategoriesService";

// Componente principal
const ParameterizationView = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('Types');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  
  // Estados para TypesModal (lista de brands)
  const [isTypesModalOpen, setIsTypesModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Estados para AddModifyTypesModal (agregar/editar brand)
  const [isAddModifyTypesModalOpen, setIsAddModifyTypesModalOpen] = useState(false);
  const [brandFormMode, setBrandFormMode] = useState('add'); // 'add' o 'edit'
  const [selectedBrand, setSelectedBrand] = useState(null);

  // Estados para AddModifyTypesModal (agregar/editar model)
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [modelModalMode, setModelModalMode] = useState('add');
  const [selectedModelData, setSelectedModelData] = useState(null);

  // Función para obtener datos del backend
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
          details: '' // Este campo se mantiene vacío como en el mock original
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
  const handleViewDetails = (categoryId) => {
    const category = data.find(item => item.id === categoryId);
    if (category) {
      setSelectedCategory(category);
      setIsTypesModalOpen(true);
    }
  };

  // Cerrar TypesModal
  const handleCloseTypesModal = () => {
    setIsTypesModalOpen(false);
    setSelectedCategory(null);
  };

  // ==================== HANDLERS PARA AddModifyTypesModal ====================
  
  // Abrir AddModifyTypesModal en modo ADD (desde botón "Add Brand" del TypesModal)
  const handleAddBrand = () => {
    setBrandFormMode('add');
    setSelectedBrand(null);
    setIsAddModifyTypesModalOpen(true);
  };

  // Abrir AddModifyTypesModal en modo EDIT (desde botón "Edit" de la tabla del TypesModal)
  const handleEditBrand = (brandId) => {
    // Aquí normalmente harías una llamada a la API para obtener los datos del brand
    // Por ahora uso datos mock basados en el brandId
    const mockBrandData = {
      id: brandId,
      brandName: 'Carterpillar',
      description: 'Example',
      status: 'Active',
      models: [
        { id: 1, model: 'CAT1000', description: 'Example' },
        { id: 2, model: 'CAT1000', description: 'Example' },
        { id: 3, model: 'CAT1000', description: 'Example' }
      ]
    };
    
    setBrandFormMode('edit');
    setSelectedBrand(mockBrandData);
    setIsAddModifyTypesModalOpen(true);
  };

  // Cerrar AddModifyTypesModal
  const handleCloseAddModifyTypesModal = () => {
    setIsAddModifyTypesModalOpen(false);
    setSelectedBrand(null);
    setBrandFormMode('add');
  };

  // Guardar nuevo brand
  const handleSaveBrand = (brandData) => {
    console.log('Saving new brand:', brandData);
    // Aquí harías la llamada a tu API para guardar el nuevo brand
    // Por ejemplo: await api.brands.create(brandData);
    
    // Cerrar el modal después de guardar exitosamente
    handleCloseAddModifyTypesModal();
    
    // Opcionalmente, podrías actualizar la lista de brands en TypesModal
    // o recargar los datos
  };

  // Actualizar brand existente
  const handleUpdateBrand = (brandData) => {
    console.log('Updating brand:', brandData);
    // Aquí harías la llamada a tu API para actualizar el brand
    // Por ejemplo: await api.brands.update(brandData.id, brandData);
    
    // Cerrar el modal después de actualizar exitosamente
    handleCloseAddModifyTypesModal();
    
    // Opcionalmente, podrías actualizar la lista de brands en TypesModal
  };

  // ==================== HANDLERS PARA AddModifyTypesModal ====================
  
  // Abrir AddModifyTypesModal en modo ADD (desde botón "Add model" del AddModifyTypesModal)
  const handleAddModel = () => {
    setModelModalMode('add');
    setSelectedModelData(null);
    setIsModelModalOpen(true);
  };

  // Abrir AddModifyTypesModal en modo EDIT (desde botón "Edit" de la tabla del AddModifyTypesModal)
  const handleEditModel = (modelId) => {
    // Buscar el modelo en los datos del brand seleccionado
    const model = selectedBrand?.models?.find(m => m.id === modelId);
    if (model) {
      setModelModalMode('edit');
      setSelectedModelData(model);
      setIsModelModalOpen(true);
    }
  };

  // Cerrar AddModifyTypesModal
  const handleModelModalClose = () => {
    setIsModelModalOpen(false);
    setSelectedModelData(null);
    setModelModalMode('add');
  };

  // Guardar nuevo model
  const handleModelSave = (modelData) => {
    console.log('Saving new model:', modelData);
    // Aquí harías la llamada a tu API para guardar el nuevo model
    // Por ejemplo: await api.models.create(modelData);
    
    // Actualizar la lista de modelos en el brand actual
    if (selectedBrand) {
      const updatedBrand = {
        ...selectedBrand,
        models: [...(selectedBrand.models || []), modelData]
      };
      setSelectedBrand(updatedBrand);
    }
    
    // Cerrar el modal después de guardar exitosamente
    handleModelModalClose();
  };

  // Actualizar model existente
  const handleModelUpdate = (modelData) => {
    console.log('Updating model:', modelData);
    // Aquí harías la llamada a tu API para actualizar el model
    // Por ejemplo: await api.models.update(modelData.id, modelData);
    
    // Actualizar la lista de modelos en el brand actual
    if (selectedBrand) {
      const updatedModels = selectedBrand.models.map(model => 
        model.id === modelData.id ? modelData : model
      );
      const updatedBrand = {
        ...selectedBrand,
        models: updatedModels
      };
      setSelectedBrand(updatedBrand);
    }
    
    // Cerrar el modal después de actualizar exitosamente
    handleModelModalClose();
  };

  // ==================== TABLA PRINCIPAL ====================

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Category name',
        cell: info => (
          <div className="font-medium text-gray-900">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: info => (
          <div className="text-gray-600">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('id', {
        header: 'Details',
        cell: info => (
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Parameterization</h1>
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
            <div className="p-8 text-center text-gray-500">
              Loading...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              Error: {error}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <th
                            key={header.id}
                            className="px-4 md:px-6 py-3 md:py-4 text-left text-sm font-semibold text-gray-900 border-r border-gray-200 last:border-r-0"
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
                      <tr key={row.id} className="hover:bg-gray-50 group">
                        {row.getVisibleCells().map(cell => (
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
                        const currentPage = table.getState().pagination.pageIndex + 1;
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
                            <span key="ellipsis1" className="inline-flex items-center justify-center w-10 h-10 text-sm text-gray-400">
                              ...
                            </span>
                          );
                        }
                        
                        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => table.setPageIndex(i - 1)}
                              className={`inline-flex items-center justify-center w-10 h-10 text-sm font-medium rounded-md transition-colors ${
                                i === currentPage
                                  ? 'bg-gray-800 text-white'
                                  : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }
                        
                        if (currentPage < totalPages - 3) {
                          pages.push(
                            <span key="ellipsis2" className="inline-flex items-center justify-center w-10 h-10 text-sm text-gray-400">
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
                      onChange={e => {
                        table.setPageSize(Number(e.target.value))
                      }}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
      
      {/* TypesModal - Modal de lista de brands */}
      <TypesModal
        isOpen={isTypesModalOpen}
        onClose={handleCloseTypesModal}
        categoryName={selectedCategory?.name || ''}
        data={[]} // Aquí pasarías la lista de brands de la categoría seleccionada
        onAddItem={handleAddBrand} // Se ejecuta cuando se presiona "Add Brand"
        onEditItem={handleEditBrand} // Se ejecuta cuando se presiona "Edit" en la tabla
      />

      <AddModifyTypesModal
        isOpen={isAddModifyTypesModalOpen}
        onClose={handleCloseAddModifyTypesModal}
        mode={brandFormMode} // 'add' o 'edit'
        categoryName={selectedCategory?.name || ''}
        brandData={selectedBrand} // Datos del brand en modo edición
        onSave={handleSaveBrand} // Se ejecuta al guardar nuevo brand
        onUpdate={handleUpdateBrand} // Se ejecuta al actualizar brand existente
        onAddModel={handleAddModel} // Se ejecuta cuando se presiona "Add model"
        onEditModel={handleEditModel} // Se ejecuta cuando se presiona "Edit" en la tabla de modelos
      />

      <AddModifyTypesModal
        isOpen={isModelModalOpen}
        onClose={handleModelModalClose}
        mode={modelModalMode} // 'add' o 'edit'
        brandName={selectedBrand?.brandName || ''}
        modelData={selectedModelData} // Datos del model en modo edición
        onSave={handleModelSave} // Se ejecuta al guardar nuevo model
        onUpdate={handleModelUpdate} // Se ejecuta al actualizar model existente
      />
    </div>
  );
};

export default ParameterizationView;