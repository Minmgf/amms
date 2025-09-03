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

// Componente principal para Status
const ParameterizationStatus = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('Status');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // ESTADOS PARA LOS MODALES DE STATUS
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showModifyStatusModal, setShowModifyStatusModal] = useState(false);
  const [showAddStatusModal, setShowAddStatusModal] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState(null);

  // Datos de ejemplo para Status
  const mockStatusData = [
    { id: 1, name: 'Active Status', description: 'Status activos del sistema', details: '' },
    { id: 2, name: 'Inactive Status', description: 'Status inactivos del sistema', details: '' },
    { id: 3, name: 'Maintenance Status', description: 'Status de mantenimiento', details: '' },
    { id: 4, name: 'Out of Service Status', description: 'Status fuera de servicio', details: '' },
    { id: 5, name: 'Operational Status', description: 'Status operacionales', details: '' },
    { id: 6, name: 'Standby Status', description: 'Status en espera', details: '' },
    { id: 7, name: 'Emergency Status', description: 'Status de emergencia', details: '' },
    { id: 8, name: 'Testing Status', description: 'Status de prueba', details: '' },
    { id: 9, name: 'Repair Status', description: 'Status en reparación', details: '' },
    { id: 10, name: 'Inspection Status', description: 'Status en inspección', details: '' },
    { id: 11, name: 'Calibration Status', description: 'Status de calibración', details: '' },
    { id: 12, name: 'Cleaning Status', description: 'Status de limpieza', details: '' },
    { id: 13, name: 'Upgrade Status', description: 'Status de actualización', details: '' },
    { id: 14, name: 'Retired Status', description: 'Status retirado', details: '' },
    { id: 15, name: 'Reserved Status', description: 'Status reservado', details: '' }
  ];

  // Función para obtener datos del backend
  const fetchStatusData = async (menuItem = 'Status') => {
    setLoading(true);
    setError(null);
    
    try {
      // Simular delay del backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setData(mockStatusData);
      
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente y cuando cambien las dependencias
  useEffect(() => {
    fetchStatusData(activeMenuItem);
  }, [activeMenuItem]);

  const handleMenuItemChange = (item) => {
    setActiveMenuItem(item);
  };

  // FUNCIÓN PARA ABRIR EL MODAL DE STATUS
  const handleViewStatusDetails = (statusId) => {
    console.log('View status details for:', statusId);
    setShowStatusModal(true);
  };

  // FUNCIONES PARA MANEJAR LOS MODALES DE STATUS
  const handleAddStatusParameter = () => {
    setShowStatusModal(false);
    setShowAddStatusModal(true);
  };

  const handleEditStatusParameter = (parameter) => {
    setSelectedParameter(parameter);
    setShowStatusModal(false);
    setShowModifyStatusModal(true);
  };

  const handleSaveNewStatusParameter = (parameterData) => {
    console.log('Saving new status parameter:', parameterData);
    // Aquí implementarías la lógica para guardar el nuevo parámetro de status
    // Por ejemplo, hacer una petición POST a tu API
    setShowAddStatusModal(false);
  };

  const handleUpdateStatusParameter = (parameterData) => {
    console.log('Updating status parameter:', parameterData);
    // Aquí implementarías la lógica para actualizar el parámetro de status
    // Por ejemplo, hacer una petición PUT a tu API
    setShowModifyStatusModal(false);
    setSelectedParameter(null);
  };

  // Funciones para cerrar modales
  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
  };

  const handleCloseModifyModal = () => {
    setShowModifyStatusModal(false);
    setSelectedParameter(null);
  };

  const handleCloseAddModal = () => {
    setShowAddStatusModal(false);
  };

  // Definir columnas usando TanStack Table
  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Status Category',
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
            onClick={() => handleViewStatusDetails(info.getValue())}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title="View status details"
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Status Parameterization</h1>
          
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
              Loading status data...
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
          onClose={handleCloseStatusModal}
          category="Machinery Status"
          onAddParameter={handleAddStatusParameter}
          onEditParameter={handleEditStatusParameter}
        />

        <ParameterModifyStatusModal
          isOpen={showModifyStatusModal}
          onClose={handleCloseModifyModal}
          parameter={selectedParameter}
          onSave={handleUpdateStatusParameter}
        />

        <ParameterAddStatusModal
          isOpen={showAddStatusModal}
          onClose={handleCloseAddModal}
          onSave={handleSaveNewStatusParameter}
        />
      </div>
    </div>
  );
};

export default ParameterizationStatus;