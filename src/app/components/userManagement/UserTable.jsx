"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { FaSearch, FaFilter, FaUserPlus, FaSort, FaSortUp, FaSortDown, FaExclamationTriangle } from 'react-icons/fa';
import { getUsersList, getUserInfo } from '../../../services/authService';
import AddUserModal from './AddUserModal';
import UserDetailsModal from './userDetailsModal';
import PermissionGuard from '@/app/(auth)/PermissionGuard';

const columnHelper = createColumnHelper();

const columns = [
  columnHelper.accessor('name', {
    header: 'Nombre',
    cell: info => {
      const user = info.row.original;
      const fullName = `${user.name} ${user.first_last_name} ${user.second_last_name || ''}`.trim();
      return fullName;
    },
    enableSorting: true,
  }),
  columnHelper.accessor('type_document_name', {
    header: 'Tipo de documento',
    cell: info => (
      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('document_number', {
    header: 'Número de documento',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: info => info.getValue() || 'No disponible',
    enableSorting: true,
  }),
  columnHelper.accessor('roles', {
    header: 'Roles',
    cell: info => (
      <div className="flex gap-1 flex-wrap">
        {info.getValue().map((role, index) => (
          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
            {role.name}
          </span>
        ))}
      </div>
    ),
  }),
  columnHelper.accessor('status_name', {
    header: 'Estado',
    cell: info => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        info.getValue() === 'Activo' 
          ? 'bg-green-100 text-green-700' 
          : info.getValue() === 'Pendiente'
          ? 'bg-yellow-100 text-yellow-700'
          : 'bg-red-100 text-red-700'
      }`}>
        {info.getValue()}
      </span>
    ),
    enableSorting: true,
  }),
];

export default function UserTable() {
  useTheme();
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Cargar datos de usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getUsersList();
        if (response.success) {
          setData(response.data);
        } else {
          setError('Error al cargar los usuarios');
        }
      } catch (err) {
        setError('Error al cargar los usuarios: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filtrar datos basado en los filtros
  const filteredData = useMemo(() => {
    return data.filter(user => {
      const fullName = `${user.name} ${user.first_last_name} ${user.second_last_name || ''}`.trim();
      const matchesGlobal = globalFilter === '' || 
        fullName.toLowerCase().includes(globalFilter.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(globalFilter.toLowerCase())) ||
        user.document_number.toString().includes(globalFilter);
      
      const matchesStatus = statusFilter === '' || user.status_name === statusFilter;
      const matchesRole = roleFilter === '' || user.roles.some(role => role.name === roleFilter);
      
      return matchesGlobal && matchesStatus && matchesRole;
    });
  }, [data, globalFilter, statusFilter, roleFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const handleUserCreated = () => {
    // Recargar la lista de usuarios después de crear uno nuevo
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getUsersList();
        if (response.success) {
          setData(response.data);
        } else {
          setError('Error al cargar los usuarios');
        }
      } catch (err) {
        setError('Error al cargar los usuarios: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  };

  const handleUserClick = async (user) => {
    try {
      console.log('Click en usuario:', user);
      setSelectedUser(user);
      setIsDetailsModalOpen(true);
      setDetailsLoading(true);
      setUserDetails(null);

      // Obtener información detallada del usuario
      const response = await getUserInfo(user.id);
      console.log('Respuesta del API:', response);
      if (response.success && response.data && response.data.length > 0) {
        // La respuesta tiene la estructura { success: true, data: [userObject] }
        setUserDetails(response.data[0]);
      } else {
        console.error('Error al obtener detalles del usuario');
        // Si falla, usar los datos básicos de la tabla
        setUserDetails(user);
      }
    } catch (err) {
      console.error('Error al obtener detalles del usuario:', err);
      // Si falla, usar los datos básicos de la tabla
      setUserDetails(user);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedUser(null);
    setUserDetails(null);
    setDetailsLoading(false);
  };



  return (
    <div className="space-y-6 parametrization-page">
      <h1 className="text-3xl font-bold text-primary">User Management</h1>
      
      {/* Controles superiores */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          {/* <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" /> */}
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            className="w-full parametrization-input pl-10 pr-4 py-2"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="parametrization-input px-3 py-2"
          >
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Inactivo">Inactivo</option>
          </select>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="parametrization-input px-3 py-2"
          >
            <option value="">Todos los roles</option>
            <option value="administrador">Administrador</option>
            <option value="usuario">Usuario</option>
          </select>
          
          <button 
            onClick={() => {
              setGlobalFilter('');
              setStatusFilter('');
              setRoleFilter('');
            }}
            className="parametrization-button flex items-center gap-2 px-4 py-2"
          >
            <FaFilter />
            Limpiar filtros
          </button>
          <PermissionGuard permission="users.create">
          <button onClick={() => setIsCreateModalOpen(true)} className="parametrization-button flex items-center gap-2 px-4 py-2">
            <FaUserPlus />
            Add user
          </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {(globalFilter || statusFilter || roleFilter) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            Mostrando {filteredData.length} de {data.length} usuarios
            {globalFilter && ` • Búsqueda: "${globalFilter}"`}
            {statusFilter && ` • Estado: ${statusFilter}`}
            {roleFilter && ` • Rol: ${roleFilter}`}
          </p>
        </div>
      )}

      {/* Loading y Error States */}
      {loading && (
        <div className="card-theme rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-secondary">Cargando usuarios...</p>
        </div>
      )}

      {error && (
        <div className="card-theme rounded-lg p-4 border border-danger/20">
          <p className="text-danger">{error}</p>
        </div>
      )}

      {/* Tabla */}
      {!loading && !error && (
        <div className="card-theme rounded-lg shadow overflow-hidden parametrization-table-wrapper">
          <div className="overflow-x-auto">
            <table className="w-full parametrization-table">
              <thead className="parametrization-table-header">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                          header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-2">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          {header.column.getCanSort() && (
                            <span>
                              {{
                                asc: <FaSortUp className="text-gray-400" />,
                                desc: <FaSortDown className="text-gray-400" />,
                              }[header.column.getIsSorted()] ?? <FaSort className="text-gray-300" />}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="parametrization-table-body">
                {table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className="hover:bg-surface-variant cursor-pointer transition-colors"
                    onClick={() => handleUserClick(row.original)}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
                    </div>

          {/* Paginación */}
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando{' '}
                  <span className="font-medium">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span>
                  {' '}a{' '}
                  <span className="font-medium">
                    {Math.min(
                      (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                      table.getFilteredRowModel().rows.length
                    )}
                  </span>
                  {' '}de{' '}
                  <span className="font-medium">{table.getFilteredRowModel().rows.length}</span>
                  {' '}resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                  
                  {/* Números de página */}
                  {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
                    const pageIndex = i;
                    return (
                      <button
                        key={pageIndex}
                        onClick={() => table.setPageIndex(pageIndex)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          table.getState().pagination.pageIndex === pageIndex
                            ? 'z-10 bg-black border-black text-white'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageIndex + 1}
                      </button>
                    );
                  })}
                  
                  {table.getPageCount() > 5 && (
                    <>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                      <button
                        onClick={() => table.setPageIndex(table.getPageCount() - 2)}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        {table.getPageCount() - 1}
                      </button>
                      <button
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        {table.getPageCount()}
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </nav>
              </div>
            </div>
          </div>
                 </div>
       </div>
     )}

     {/* Modal de Detalles del Usuario */}
     <UserDetailsModal
       isOpen={isDetailsModalOpen}
       onClose={handleCloseDetailsModal}
       userData={userDetails}
       onUserUpdated={handleUserCreated}
     />

     {/* Modal de Crear Usuario */}
     <AddUserModal
       isOpen={isCreateModalOpen}
       onClose={() => setIsCreateModalOpen(false)}
       onUserCreated={handleUserCreated}
     />
   </div>
 );
}
