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
import NavigationMenu from '../components/ParameterNavigation';

// IMPORTAR LOS MODALES DE STATUS
import ParameterStatusModal from '../modals/ParameterStatusModal';
import ParameterModifyStatusModal from '../modals/ParameterModifyStatusModal';
import ParameterAddStatusModal from '../modals/ParameterAddStatusModal';

// Componente principal
const ParameterizationView = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('Status');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // ESTADOS PARA LOS MODALES DE STATUS
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showModifyStatusModal, setShowModifyStatusModal] = useState(false);
  const [showAddStatusModal, setShowAddStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

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
    { id: 30, name: 'Status', description: 'Estados de maquinaria', details: '' }
  ];

  // Función para obtener datos del backend
  const fetchData = async (menuItem = 'Status') => {
    setLoading(true);
    setError(null);
    
    try {
      // Simular delay del backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setData(mockData);
      
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente y cuando cambien las dependencias
  useEffect(() => {
    fetchData(activeMenuItem);
  }, [activeMenuItem]);

  const handleMenuItemChange = (item) => {
    setActiveMenuItem(item);
  };

  // FUNCIÓN MODIFICADA PARA ABRIR EL MODAL DE STATUS
  const handleViewDetails = (categoryId) => {
    console.log('View details for category:', categoryId);
    
    // Encontrar la categoría por ID
    const category = mockData.find(item => item.id === categoryId);
    
    // Si es la categoría "Status" o cualquier categoría cuando activeMenuItem es "Status"
    if (activeMenuItem === 'Status' || (category && category.name === 'Status')) {
      setShowStatusModal(true);
    } else {
      // Para otras categorías, aquí podrías agregar otros modales específicos
      console.log('Opening modal for category:', category?.name);
    }
  };

  // FUNCIONES PARA MANEJAR LOS MODALES DE STATUS
  const handleAddStatus = () => {
    setShowStatusModal(false);
    setShowAddStatusModal(true);
  };

  const handleEditStatus = (status) => {
    setSelectedStatus(status);
    setShowStatusModal(false);
    setShowModifyStatusModal(true);
  };

  const handleSaveNewStatus = (statusData) => {
    console.log('Saving new status:', statusData);
    // Aquí implementarías la lógica para guardar el nuevo status
    // Por ejemplo, hacer una petición POST a tu API
    
    // Cerrar el modal de agregar y volver al modal principal
    setShowAddStatusModal(false);
    setShowStatusModal(true);
    
    // Opcional: Refrescar los datos
    // fetchData(activeMenuItem);
  };

  const handleUpdateStatus = (statusData) => {
    console.log('Updating status:', statusData);
    // Aquí implementarías la lógica para actualizar el status
    // Por ejemplo, hacer una petición PUT a tu API
    
    // Cerrar el modal de modificar y volver al modal principal
    setShowModifyStatusModal(false);
    setShowStatusModal(true);
    
    // Opcional: Refrescar los datos
    // fetchData(activeMenuItem);
  };

  // FUNCIONES PARA CERRAR TODOS LOS MODALES
  const handleCloseAllModals = () => {
    setShowStatusModal(false);
    setShowModifyStatusModal(false);
    setShowAddStatusModal(false);
    setSelectedStatus(null);
  };

  // Definir columnas usando TanStack Table
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
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title="View details"
          >
            <FiEye className="w-4 h-4 text-gray-500 hover:text-gray-700" />
          </button>
        ),
      }),
    ],
    []
  );

  // Configurar la tabla
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
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-md">
              <FiEdit3 className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-md">
              <FiBell className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </button>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-xs md:text-sm font-semibold text-green-700">JV</span>
            </div>
          </div>
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
                      <tr key={row.id} className="hover:bg-gray-50">
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
                  {/* Mobile pagination */}
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
                  
                  {/* Desktop pagination */}
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
                    <div className="flex items-center gap-1">
                      {/* Previous button */}
                      <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        ← Previous
                      </button>
                      
                      {/* Page numbers */}
                      {(() => {
                        const currentPage = table.getState().pagination.pageIndex + 1;
                        const totalPages = table.getPageCount();
                        const pages = [];
                        
                        // Always show first page
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
                        
                        // Show ellipsis if there's a gap
                        if (currentPage > 4) {
                          pages.push(
                            <span key="ellipsis1" className="inline-flex items-center justify-center w-10 h-10 text-sm text-gray-400">
                              ...
                            </span>
                          );
                        }
                        
                        // Show pages around current page
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
                        
                        // Show ellipsis if there's a gap
                        if (currentPage < totalPages - 3) {
                          pages.push(
                            <span key="ellipsis2" className="inline-flex items-center justify-center w-10 h-10 text-sm text-gray-400">
                              ...
                            </span>
                          );
                        }
                        
                        // Always show last page
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
                      
                      {/* Next button */}
                      <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                  
                  {/* Page size selector */}
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

        {/* MODALES DE STATUS */}
        <ParameterStatusModal
          isOpen={showStatusModal}
          onClose={handleCloseAllModals}
          category="Machinery Status"
          onAddParameter={handleAddStatus}
          onEditParameter={handleEditStatus}
        />

        <ParameterModifyStatusModal
          isOpen={showModifyStatusModal}
          onClose={handleCloseAllModals}
          parameter={selectedStatus}
          onSave={handleUpdateStatus}
        />

        <ParameterAddStatusModal
          isOpen={showAddStatusModal}
          onClose={handleCloseAllModals}
          onSave={handleSaveNewStatus}
        />
      </div>
    </div>
  );
};

export default ParameterizationView;