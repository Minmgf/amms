"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { FiFilter, FiEdit3, FiBell, FiEye, FiUsers } from 'react-icons/fi';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import NavigationMenu from '../../../components/parametrization/ParameterNavigation';
import DepartmentModal from '../../../components/parametrization/DepartmentModal';
import { useTheme } from '@/contexts/ThemeContext';

// Componente principal
const ParameterizationView = () => {
  const { currentTheme } = useTheme();
  const [activeMenuItem, setActiveMenuItem] = useState('Job Titles');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  
  // Estados para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Datos de ejemplo para departamentos
  const mockData = [
    { id: 1, department: 'Department #1', description: 'Módulo de nómina', status: 'Active' },
    { id: 2, department: 'Department #2', description: 'Módulo de nómina', status: 'Inactive' },
    { id: 3, department: 'Department #3', description: 'Módulo de nómina', status: 'Active' },
    { id: 4, department: 'Human Resources', description: 'Gestión de recursos humanos', status: 'Active' },
    { id: 5, department: 'Finance', description: 'Departamento financiero', status: 'Active' },
    { id: 6, department: 'IT Department', description: 'Tecnología de la información', status: 'Active' },
    { id: 7, department: 'Marketing', description: 'Departamento de marketing', status: 'Inactive' },
    { id: 8, department: 'Sales', description: 'Departamento de ventas', status: 'Active' },
    { id: 9, department: 'Operations', description: 'Operaciones generales', status: 'Active' },
    { id: 10, department: 'Legal', description: 'Departamento legal', status: 'Active' },
    { id: 11, department: 'Customer Service', description: 'Atención al cliente', status: 'Inactive' },
    { id: 12, department: 'Research and Development', description: 'I+D', status: 'Active' },
    { id: 13, department: 'Logistics', description: 'Logística y distribución', status: 'Active' },
    { id: 14, department: 'Procurement', description: 'Compras y aprovisionamiento', status: 'Inactive' },
    { id: 15, department: 'Quality Assurance', description: 'Aseguramiento de la calidad', status: 'Active' },
    { id: 16, department: 'Public Relations', description: 'Relaciones públicas', status: 'Active' },
    { id: 17, department: 'Administration', description: 'Administración general', status: 'Active' },
    { id: 18, department: 'Training', description: 'Capacitación y desarrollo', status: 'Inactive' },
    { id: 19, department: 'Security', description: 'Seguridad y vigilancia', status: 'Active' },
    { id: 20, department: 'Maintenance', description: 'Mantenimiento de instalaciones', status: 'Active' },
  ];

  // Función para obtener datos del backend
  const fetchData = async (menuItem = 'Job Titles') => {
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

  const handleViewDetails = (departmentId) => {
    const department = data.find(d => d.id === departmentId);
    setSelectedDepartment(department);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleAddDepartment = () => {
    setSelectedDepartment(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDepartment(null);
  };

  const handleSaveDepartment = (departmentData) => {
    if (modalMode === 'add') {
      // Lógica para añadir nuevo departamento
      const newDepartment = {
        id: data.length + 1,
        department: departmentData.categoryName,
        description: departmentData.description,
        status: departmentData.isActive ? 'Active' : 'Inactive'
      };
      setData(prev => [...prev, newDepartment]);
      console.log('Adding new department:', newDepartment);
    } else {
      // Lógica para actualizar departamento existente
      setData(prev => prev.map(dept => 
        dept.id === selectedDepartment.id 
          ? {
              ...dept,
              department: departmentData.categoryName,
              description: departmentData.description,
              status: departmentData.isActive ? 'Active' : 'Inactive'
            }
          : dept
      ));
      console.log('Updating department:', departmentData);
    }
  };

  // Definir columnas usando TanStack Table
  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor('department', {
        header: 'Department',
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
      columnHelper.accessor('status', {
        header: 'Status',
        cell: info => {
          const status = info.getValue();
          return (
            <span 
              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                status === 'Active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-pink-100 text-pink-800'
              }`}
            >
              {status}
            </span>
          );
        },
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
    [data]
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
    <>
      <div className="parametrization-page p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 md:mb-10">
            <h1 className="parametrization-header text-2xl md:text-3xl font-bold">Parameterization</h1>
          </div>

          {/* Filter and Add Department Section */}
          <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-4 justify-between lg:justify-start">
            <button className="parametrization-filter-button flex items-center space-x-2 px-3 md:px-4 py-2 transition-colors w-fit">
              <FiFilter className="filter-icon w-4 h-4" />
              <span className="text-sm">Filter by</span>
            </button>
            
            <button 
              onClick={handleAddDepartment}
              className="parametrization-filter-button flex items-center space-x-2 px-3 md:px-4 py-2 transition-colors w-fit"
            >
              <FiUsers className="w-4 h-4" />
              <span className="text-sm">Add department</span>
            </button>
          </div>

          {/* Navigation Menu(component) */}
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
                    {/* Mobile pagination */}
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
                    
                    {/* Desktop pagination */}
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
                      <div className="flex items-center gap-1">
                        {/* Previous button */}
                        <button
                          onClick={() => table.previousPage()}
                          disabled={!table.getCanPreviousPage()}
                          className="parametrization-pagination-button inline-flex items-center px-3 py-2 text-sm font-medium transition-colors"
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
                                className="parametrization-pagination-button inline-flex items-center justify-center w-10 h-10 text-sm font-medium transition-colors"
                              >
                                1
                              </button>
                            );
                          }
                          
                          // Show ellipsis if there's a gap
                          if (currentPage > 4) {
                            pages.push(
                              <span key="ellipsis1" className="parametrization-pagination-ellipsis inline-flex items-center justify-center w-10 h-10 text-sm">
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
                                className={`parametrization-pagination-button inline-flex items-center justify-center w-10 h-10 text-sm font-medium transition-colors ${
                                  i === currentPage ? 'active' : ''
                                }`}
                              >
                                {i}
                              </button>
                            );
                          }
                          
                          // Show ellipsis if there's a gap
                          if (currentPage < totalPages - 3) {
                            pages.push(
                              <span key="ellipsis2" className="parametrization-pagination-ellipsis inline-flex items-center justify-center w-10 h-10 text-sm">
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
                                className="parametrization-pagination-button inline-flex items-center justify-center w-10 h-10 text-sm font-medium transition-colors"
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
                          className="parametrization-pagination-button inline-flex items-center px-3 py-2 text-sm font-medium transition-colors"
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
      </div>

      {/* Modal */}
      <DepartmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        departmentData={selectedDepartment}
        onSave={handleSaveDepartment}
      />
    </>
  );
};

export default ParameterizationView;