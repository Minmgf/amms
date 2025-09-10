"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { FiFilter, FiEdit3, FiBell, FiEye } from 'react-icons/fi';
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
import CategoryModal from '../../../components/parametrization/ModelListModal';
import BrandFormModal from '../../../components/parametrization/BrandFormModal';
import AddModifyModelModal from '../../../components/parametrization/AddModifyModelModal'; 
import { useTheme } from "@/contexts/ThemeContext";

// Componente principal
const ParameterizationView = () => {
  const { currentTheme } = useTheme();
  const [activeMenuItem, setActiveMenuItem] = useState('Brands');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  
  // Estados para CategoryModal (lista de brands)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Estados para BrandFormModal (agregar/editar brand)
  const [isBrandFormModalOpen, setIsBrandFormModalOpen] = useState(false);
  const [brandFormMode, setBrandFormMode] = useState('add'); // 'add' o 'edit'
  const [selectedBrand, setSelectedBrand] = useState(null);

  // Estados para AddModifyModelModal (agregar/editar model)
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [modelModalMode, setModelModalMode] = useState('add');
  const [selectedModelData, setSelectedModelData] = useState(null);

  // Datos de ejemplo
  const mockData = [
    { id: 1, name: 'Machinery', description: 'Módulo de maquinaria', details: '' },
    { id: 2, name: 'Motors', description: 'Módulo de maquinaria', details: '' },
    { id: 3, name: 'Wheels', description: 'Módulo de maquinaria', details: '' },
    { id: 4, name: 'Engines', description: 'Módulo de motores', details: '' },
    { id: 5, name: 'Transmissions', description: 'Módulo de transmisiones', details: '' },
    { id: 6, name: 'Hydraulics', description: 'Sistema hidráulico', details: '' },
    { id: 7, name: 'Electronics', description: 'Componentes electrónicos', details: '' },
    { id: 8, name: 'Cooling', description: 'Sistema de refrigeración', details: '' },
    { id: 9, name: 'Fuel System', description: 'Sistema de combustible', details: '' },
    { id: 10, name: 'Brakes', description: 'Sistema de frenos', details: '' },
    { id: 11, name: 'Suspension', description: 'Sistema de suspensión', details: '' },
    { id: 12, name: 'Steering', description: 'Sistema de dirección', details: '' },
    { id: 13, name: 'Exhaust', description: 'Sistema de escape', details: '' },
    { id: 14, name: 'Lighting', description: 'Sistema de iluminación', details: '' },
    { id: 15, name: 'Safety', description: 'Sistemas de seguridad', details: '' },
    { id: 16, name: 'Comfort', description: 'Sistemas de confort', details: '' },
    { id: 17, name: 'Navigation', description: 'Sistemas de navegación', details: '' },
    { id: 18, name: 'Communication', description: 'Sistemas de comunicación', details: '' },
    { id: 19, name: 'Storage', description: 'Sistemas de almacenamiento', details: '' },
    { id: 20, name: 'Maintenance', description: 'Sistemas de mantenimiento', details: '' },
    { id: 21, name: 'Monitoring', description: 'Sistemas de monitoreo', details: '' },
    { id: 22, name: 'Control', description: 'Sistemas de control', details: '' },
    { id: 23, name: 'Power', description: 'Sistemas de energía', details: '' },
    { id: 24, name: 'Tools', description: 'Herramientas', details: '' },
    { id: 25, name: 'Accessories', description: 'Accesorios', details: '' },
    { id: 26, name: 'Spare Parts', description: 'Repuestos', details: '' },
    { id: 27, name: 'Consumables', description: 'Consumibles', details: '' },
    { id: 28, name: 'Lubricants', description: 'Lubricantes', details: '' },
    { id: 29, name: 'Filters', description: 'Filtros', details: '' },
    { id: 30, name: 'Belts', description: 'Correas', details: '' }
  ];

  // Función para obtener datos del backend
  const fetchData = async (menuItem = 'Brands') => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
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

  // ==================== HANDLERS PARA CategoryModal ====================
  
  // Abrir CategoryModal (cuando se hace click en el ojo de la tabla principal)
  const handleViewDetails = (categoryId) => {
    const category = data.find(item => item.id === categoryId);
    if (category) {
      setSelectedCategory(category);
      setIsCategoryModalOpen(true);
    }
  };

  // Cerrar CategoryModal
  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setSelectedCategory(null);
  };

  // ==================== HANDLERS PARA BrandFormModal ====================
  
  // Abrir BrandFormModal en modo ADD (desde botón "Add Brand" del CategoryModal)
  const handleAddBrand = () => {
    setBrandFormMode('add');
    setSelectedBrand(null);
    setIsBrandFormModalOpen(true);
  };

  // Abrir BrandFormModal en modo EDIT (desde botón "Edit" de la tabla del CategoryModal)
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
    setIsBrandFormModalOpen(true);
  };

  // Cerrar BrandFormModal
  const handleCloseBrandFormModal = () => {
    setIsBrandFormModalOpen(false);
    setSelectedBrand(null);
    setBrandFormMode('add');
  };

  // Guardar nuevo brand
  const handleSaveBrand = (brandData) => {
    console.log('Saving new brand:', brandData);
    // Aquí harías la llamada a tu API para guardar el nuevo brand
    // Por ejemplo: await api.brands.create(brandData);
    
    // Cerrar el modal después de guardar exitosamente
    handleCloseBrandFormModal();
    
    // Opcionalmente, podrías actualizar la lista de brands en CategoryModal
    // o recargar los datos
  };

  // Actualizar brand existente
  const handleUpdateBrand = (brandData) => {
    console.log('Updating brand:', brandData);
    // Aquí harías la llamada a tu API para actualizar el brand
    // Por ejemplo: await api.brands.update(brandData.id, brandData);
    
    // Cerrar el modal después de actualizar exitosamente
    handleCloseBrandFormModal();
    
    // Opcionalmente, podrías actualizar la lista de brands en CategoryModal
  };

  // ==================== HANDLERS PARA AddModifyModelModal ====================
  
  // Abrir AddModifyModelModal en modo ADD (desde botón "Add model" del BrandFormModal)
  const handleAddModel = () => {
    setModelModalMode('add');
    setSelectedModelData(null);
    setIsModelModalOpen(true);
  };

  // Abrir AddModifyModelModal en modo EDIT (desde botón "Edit" de la tabla del BrandFormModal)
  const handleEditModel = (modelId) => {
    // Buscar el modelo en los datos del brand seleccionado
    const model = selectedBrand?.models?.find(m => m.id === modelId);
    if (model) {
      setModelModalMode('edit');
      setSelectedModelData(model);
      setIsModelModalOpen(true);
    }
  };

  // Cerrar AddModifyModelModal
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
          <div className="font-medium text-primary">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: info => (
          <div className="text-secondary">
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
                  <tbody className="">
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
                                i === currentPage
                                  ? 'active'
                                  : ''
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
      
      {/* CategoryModal - Modal de lista de brands */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        categoryName={selectedCategory?.name || ''}
        data={[]} // Aquí pasarías la lista de brands de la categoría seleccionada
        onAddItem={handleAddBrand} // Se ejecuta cuando se presiona "Add Brand"
        onEditItem={handleEditBrand} // Se ejecuta cuando se presiona "Edit" en la tabla
      />

      {/* BrandFormModal - Modal para agregar/editar brand */}
      <BrandFormModal
        isOpen={isBrandFormModalOpen}
        onClose={handleCloseBrandFormModal}
        mode={brandFormMode} // 'add' o 'edit'
        categoryName={selectedCategory?.name || ''}
        brandData={selectedBrand} // Datos del brand en modo edición
        onSave={handleSaveBrand} // Se ejecuta al guardar nuevo brand
        onUpdate={handleUpdateBrand} // Se ejecuta al actualizar brand existente
        onAddModel={handleAddModel} // Se ejecuta cuando se presiona "Add model"
        onEditModel={handleEditModel} // Se ejecuta cuando se presiona "Edit" en la tabla de modelos
      />

      {/* AddModifyModelModal - Modal para agregar/editar model */}
      <AddModifyModelModal
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