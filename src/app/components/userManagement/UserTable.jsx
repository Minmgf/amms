"use client";
import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { FaSearch, FaFilter, FaUserPlus, FaEdit, FaTrash, FaEye, FaSort, FaSortUp, FaSortDown, FaArrowLeft, FaPlus, FaExclamationTriangle } from 'react-icons/fa';
import * as Dialog from '@radix-ui/react-dialog';
import userData from '../../data/users.json';

const columnHelper = createColumnHelper();

const columns = [
  columnHelper.accessor('fullName', {
    header: 'Full name',
    cell: info => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('documentType', {
    header: 'Document type',
    cell: info => (
      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('documentNumber', {
    header: 'Document number',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: info => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('roles', {
    header: 'Roles',
    cell: info => (
      <div className="flex gap-1 flex-wrap">
        {info.getValue().map((role, index) => (
          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
            {role}
          </span>
        ))}
      </div>
    ),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: info => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        info.getValue() === 'Active' 
          ? 'bg-green-100 text-green-700' 
          : 'bg-pink-100 text-pink-700'
      }`}>
        {info.getValue()}
      </span>
    ),
    enableSorting: true,
  }),
  columnHelper.accessor('id', {
    header: 'Actions',
    cell: info => (
      <div className="flex gap-2">
        <button className="p-1 text-blue-600 hover:text-blue-800" title="Ver">
          <FaEye size={14} />
        </button>
        <button className="p-1 text-green-600 hover:text-green-800" title="Editar">
          <FaEdit size={14} />
        </button>
        <button className="p-1 text-red-600 hover:text-red-800" title="Eliminar">
          <FaTrash size={14} />
        </button>
      </div>
    ),
  }),
];

export default function UserTable() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [data] = useState(() => userData);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    identificationType: 'C.C',
    identificationNumber: '',
    gender: '',
    expeditionDate: '',
    birthDate: '',
    role: '',
    selectedRoles: [],
    name: '',
    lastName: ''
  });

  // Filtrar datos basado en los filtros
  const filteredData = useMemo(() => {
    return data.filter(user => {
      const matchesGlobal = globalFilter === '' || 
        user.fullName.toLowerCase().includes(globalFilter.toLowerCase()) ||
        user.email.toLowerCase().includes(globalFilter.toLowerCase()) ||
        user.documentNumber.includes(globalFilter);
      
      const matchesStatus = statusFilter === '' || user.status === statusFilter;
      const matchesRole = roleFilter === '' || user.roles.includes(roleFilter);
      
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

  const handleAddRole = () => {
    if (formData.role && !formData.selectedRoles.includes(formData.role)) {
      setFormData(prev => ({
        ...prev,
        selectedRoles: [...prev.selectedRoles, prev.role],
        role: ''
      }));
    }
  };

  const handleRemoveRole = (roleToRemove) => {
    setFormData(prev => ({
      ...prev,
      selectedRoles: prev.selectedRoles.filter(role => role !== roleToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes agregar la lógica para crear el usuario
    console.log('Datos del formulario:', formData);
    setIsCreateModalOpen(false);
    // Resetear el formulario
    setFormData({
      identificationType: 'C.C',
      identificationNumber: '',
      gender: '',
      expeditionDate: '',
      birthDate: '',
      role: '',
      selectedRoles: [],
      name: '',
      lastName: ''
    });
  };

  const isFormValid = formData.name && formData.lastName && formData.identificationNumber;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
      
      {/* Controles superiores */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="Active">Activo</option>
            <option value="Inactive">Inactivo</option>
          </select>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los roles</option>
            <option value="Administrator">Administrador</option>
            <option value="Manager">Gerente</option>
            <option value="Employee">Empleado</option>
          </select>
          
          <button 
            onClick={() => {
              setGlobalFilter('');
              setStatusFilter('');
              setRoleFilter('');
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <FaFilter />
            Limpiar filtros
          </button>
          
          <Dialog.Root open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <Dialog.Trigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                <FaUserPlus />
                Add user
              </button>
            </Dialog.Trigger>
            
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
              <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <button
                      onClick={() => setIsCreateModalOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <FaArrowLeft className="text-gray-600" />
                    </button>
                    <h2 className="text-xl font-semibold text-gray-800">Register User</h2>
                  </div>

                  {/* Formulario */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tipo de identificación */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Identification type
                        </label>
                        <select
                          value={formData.identificationType}
                          onChange={(e) => setFormData(prev => ({ ...prev, identificationType: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="C.C">C.C</option>
                          <option value="T.I">T.I</option>
                          <option value="C.E">C.E</option>
                          <option value="PASSPORT">PASSPORT</option>
                        </select>
                      </div>

                      {/* Número de identificación */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Identification number
                        </label>
                        <input
                          type="text"
                          value={formData.identificationNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, identificationNumber: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ingrese número de identificación"
                        />
                      </div>

                      {/* Género */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender
                        </label>
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Seleccionar género</option>
                          <option value="Male">Masculino</option>
                          <option value="Female">Femenino</option>
                          <option value="Other">Otro</option>
                        </select>
                      </div>

                      {/* Fecha de expedición */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expedition date
                        </label>
                        <input
                          type="date"
                          value={formData.expeditionDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, expeditionDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Fecha de nacimiento */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Birth date
                        </label>
                        <input
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Rol */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={formData.role}
                            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Seleccionar rol</option>
                            <option value="Administrator">Administrador</option>
                            <option value="Manager">Gerente</option>
                            <option value="Employee">Empleado</option>
                            <option value="User">Usuario</option>
                          </select>
                          <button
                            type="button"
                            onClick={handleAddRole}
                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                          >
                            <FaPlus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Roles seleccionados */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selected roles
                      </label>
                      <div className="bg-gray-100 rounded-lg p-3 min-h-[60px]">
                        {formData.selectedRoles.length === 0 ? (
                          <p className="text-gray-500 text-sm">
                            No roles added yet. Select an item from the dropdown above and click 'Add'.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {formData.selectedRoles.map((role, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm flex items-center gap-2"
                              >
                                {role}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRole(role)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Nombre */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            !formData.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Ingrese nombre"
                        />
                      </div>

                      {/* Apellido */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ingrese apellido"
                        />
                      </div>
                    </div>

                    {/* Mensaje de advertencia */}
                    {!isFormValid && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <FaExclamationTriangle />
                        Please complete all required fields before submitting the form.
                      </div>
                    )}

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(false)}
                        className="px-6 py-2 border border-gray-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!isFormValid}
                        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
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

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
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
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
    </div>
  );
}
