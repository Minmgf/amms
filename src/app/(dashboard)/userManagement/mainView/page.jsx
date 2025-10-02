'use client'
import TableList from '@/app/components/shared/TableList'
import React, { useState, useMemo, useEffect } from 'react'
import { getUsersList, changeUserStatus } from '@/services/authService'
import { CiFilter } from 'react-icons/ci'
import { FaEye, FaPen, FaUserPlus, FaTimes } from 'react-icons/fa'
import PermissionGuard from '@/app/(auth)/PermissionGuard'
import * as Dialog from '@radix-ui/react-dialog'
import UserInfo from '@/app/components/userManagement/UserInfoModal'
import UserEditModal from '@/app/components/userManagement/UserEditModal'
import AddUserModal from '@/app/components/userManagement/AddUserModal'

const UserManagementMainView = () => {
  // Estado para el filtro global
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Estados para datos de la API
  const [userData, setUserData] = useState([])
  const [error, setError] = useState(null)

  // Estados para el modal de filtros
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [filteredData, setFilteredData] = useState([])

  // Estados para el modal de detalles de usuario
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Estados para el modal de edición de usuario
  const [isUserEditModalOpen, setIsUserEditModalOpen] = useState(false)
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null)

  // Cargar datos al montar el componente
  useEffect(() => {
    loadInitialData()
  }, [])

  // Aplicar filtros cuando cambien los datos o los filtros
  useEffect(() => {
    applyFilters()
  }, [userData, statusFilter, roleFilter])

  const loadInitialData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Solo cargar usuarios ya que los datos de tipos de documento y roles vienen en la respuesta
      const usersResponse = await getUsersList()

      // Verificar si la respuesta tiene la estructura esperada
      if (usersResponse && usersResponse.success && Array.isArray(usersResponse.data)) {
        setUserData(usersResponse.data)
        console.log('Users loaded:', usersResponse.data)
      } else {
        console.error('Estructura de respuesta inesperada:', usersResponse)
        setError('Estructura de datos inesperada en la respuesta del servidor')
      }
      
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Error al cargar los datos. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // Obtener valores únicos para los filtros
  const uniqueStatuses = useMemo(() => {
    const statuses = userData.map(user => user.status_name).filter(Boolean)
    return [...new Set(statuses)]
  }, [userData])

  const uniqueRoles = useMemo(() => {
    const roles = userData.flatMap(user => 
      user.roles?.map(role => role.name) || []
    ).filter(Boolean)
    return [...new Set(roles)]
  }, [userData])

  // Aplicar filtros
  const applyFilters = () => {
    let filtered = userData

    if (statusFilter) {
      filtered = filtered.filter(user => user.status_name === statusFilter)
    }

    if (roleFilter) {
      filtered = filtered.filter(user => 
        user.roles?.some(role => role.name === roleFilter)
      )
    }

    setFilteredData(filtered)
  }

  // Función personalizada de filtrado global
  const globalFilterFn = useMemo(() => {
    return (row, columnId, filterValue) => {
      if (!filterValue) return true
      
      const searchTerm = filterValue.toLowerCase()
      const user = row.original
      
      // Crear texto completo para buscar
      const fullName = `${user.name || ''} ${user.first_last_name || ''} ${user.second_last_name || ''}`.trim().toLowerCase()
      const email = (user.email || '').toLowerCase()
      const documentNumber = (user.document_number || '').toString().toLowerCase()
      const documentType = (user.type_document_name || '').toLowerCase()
      
      // Buscar en cualquier parte de los campos
      return fullName.includes(searchTerm) ||
             email.includes(searchTerm) ||
             documentNumber.includes(searchTerm) ||
             documentType.includes(searchTerm)
    }
  }, [])

  // Handlers para filtros
  const handleApplyFilters = () => {
    applyFilters()
    setIsFilterModalOpen(false)
  }

  const handleClearFilters = () => {
    setStatusFilter('')
    setRoleFilter('')
    setFilteredData(userData)
    setIsFilterModalOpen(false)
  }

  // Definición de columnas para TanStack Table
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Nombre Completo',
      cell: ({ row }) => {
        const user = row.original
        const fullName = `${user.name || ''} ${user.first_last_name || ''} ${user.second_last_name || ''}`.trim()
        return (
          <div className="font-medium text-gray-900">
            {fullName || 'N/A'}
          </div>
        )
      }
    },
    {
      accessorKey: 'type_document_name',
      header: 'Tipo de Documento',
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {row.getValue('type_document_name') || 'N/A'}
        </span>
      )
    },
    {
      accessorKey: 'document_number',
      header: 'Número de Documento',
      cell: ({ row }) => (
        <div className="text-sm text-gray-900 font-mono">
          {row.getValue('document_number') || 'N/A'}
        </div>
      )
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="text-sm text-gray-600">
          {row.getValue('email') || 'No email'}
        </div>
      )
    },
    {
      accessorKey: 'roles',
      header: 'Rol',
      cell: ({ row }) => {
        const roles = row.getValue('roles')
        return (
          <div className="flex flex-wrap gap-1">
            {roles && Array.isArray(roles) && roles.length > 0 ? (
              roles.map((role, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800"
                >
                  {role.name || 'Unknown Role'}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400">No roles assigned</span>
            )}
          </div>
        )
      }
    },
    {
      accessorKey: 'status_name',
      header: 'Estado',
      cell: ({ row }) => {
        const statusName = row.getValue('status_name')
        const statusColors = {
          'Activo': 'bg-green-100 text-green-800',
          'Inactivo': 'bg-red-100 text-red-800',
          'Pendiente': 'bg-yellow-100 text-yellow-800',
          'Suspendido': 'bg-orange-100 text-orange-800'
        }
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[statusName] || 'bg-gray-100 text-gray-800'}`}>
            {statusName || 'Unknown'}
          </span>
        )
      }
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <PermissionGuard permission={4}>
            <button
              onClick={() => handleEdit(row.original)}
              className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-black "
            >
              <FaPen /> Editar
            </button>
          </PermissionGuard>
          <button
            onClick={() => handleView(row.original)}
            className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-black "
          >
            <FaEye /> Ver
          </button>
          <PermissionGuard permission={10}>
            <button
              onClick={() => handleStatusToggle(row.original)}
              className="inline-flex items-center px-2.5 py-1.5 border text-xs font-medium rounded border-black "
            >
              {row.original.status === 1 ? 'Desactivar' : 'Activar'}
            </button>
          </PermissionGuard>
        </div> 
      )
    }
  ], [])

  // Handlers para las acciones
  const handleEdit = (user) => {
    console.log('Editing user:', user)
    setSelectedUserForEdit(user)
    setIsUserEditModalOpen(true)
  }

  const handleView = (user) => {
    console.log('Viewing user:', user)
    setSelectedUser(user)
    setIsUserDetailsModalOpen(true)
  }

  const handleCloseUserDetailsModal = () => {
    setIsUserDetailsModalOpen(false)
    setSelectedUser(null)
  }

  const handleCloseUserEditModal = () => {
    setIsUserEditModalOpen(false)
    setSelectedUserForEdit(null)
  }

  const handleOpenAddUserModal = () => {
    setIsCreateModalOpen(true)
  }

  const handleCloseAddUserModal = () => {
    setIsCreateModalOpen(false)
  }

  const handleUserUpdated = async () => {
    // Recargar los datos cuando se actualiza un usuario
    console.log('Reloading user data after update...')
    await loadInitialData()
    // Los filtros se aplicarán automáticamente por el useEffect que escucha cambios en userData
  }

  const handleStatusToggle = async (user) => {
    // Mapear el status numérico a string para el API
    const currentStatusIsActive = user.status === 1
    const newStatusString = currentStatusIsActive ? '2' : '1'
    
    try {
      setLoading(true)
      await changeUserStatus(user.id, newStatusString)
      
      // Actualizar los datos localmente
      setUserData(prevData => 
        prevData.map(u => 
          u.id === user.id ? { 
            ...u, 
            status: currentStatusIsActive ? 2 : 1, // 1 = Activo, 2 = Inactivo
            status_name: currentStatusIsActive ? 'Inactivo' : 'Activo'
          } : u
        )
      )
      
      console.log(`User ${user.id} status changed to ${newStatusString}`)
    } catch (error) {
      console.error('Error changing user status:', error)
      setError('Error al cambiar el estado del usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadInitialData()
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Gestion de Usuarios y Roles</h1>
          {/* <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              'Refresh'
            )}
          </button> */}
        </div>
        
        {/* Mostrar error si existe */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => setError(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <span className="sr-only">Dismiss</span>
              ×
            </button>
          </div>
        )}
      </div>

      {/* Filtro de búsqueda global */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center  gap-4">
        <div className="max-w-md">
          <input
            id="search"
            type="text"
            placeholder="Buscar por nombre, email, tipo o número de documento..."
            value={globalFilter || ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="parametrization-filter-button"
        >
          <CiFilter className="w-4 h-4" />
          Filtrar por
        </button>
        <PermissionGuard permission={3}>
          <button
            onClick={handleOpenAddUserModal}
            className="parametrization-filter-button"
          >
            <FaUserPlus className="w-4 h-4" />
            Agregar Usuario
          </button>
        </PermissionGuard>
      </div>

      {/* Tabla de usuarios */}
      <PermissionGuard permission={2}>
        <TableList
          columns={columns}
          data={filteredData.length > 0 || statusFilter || roleFilter ? filteredData : userData}
          loading={loading}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          globalFilterFn={globalFilterFn}
          pageSizeOptions={[10, 20, 30, 50]}
        />
      </PermissionGuard>

      {/* Modal de filtros */}
      <Dialog.Root open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-xl z-50 w-full max-w-md">
            <div className="p-6 card-theme rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <Dialog.Title className="text-theme-xl font-theme-bold text-primary">Filters</Dialog.Title>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="text-secondary hover:text-primary"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-theme-sm font-theme-medium text-secondary mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-theme w-full"
                  >
                    <option value="">All statuses</option>
                    {uniqueStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role Filter */}
                <div>
                  <label className="block text-theme-sm font-theme-medium text-secondary mb-2">
                    Role
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="input-theme w-full"
                  >
                    <option value="">All roles</option>
                    {uniqueRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleClearFilters}
                  className="btn-theme btn-error flex-1"
                >
                  Clean
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="btn-theme btn-primary flex-1"
                >
                  Apply
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal de detalles de usuario */}
      <UserInfo
        isOpen={isUserDetailsModalOpen}
        onClose={handleCloseUserDetailsModal}
        userData={selectedUser}
      />

      {/* Modal de edición de usuario */}
      <UserEditModal
        isOpen={isUserEditModalOpen}
        onClose={handleCloseUserEditModal}
        userData={selectedUserForEdit}
        onUserUpdated={handleUserUpdated}
      />

      {/* Modal de agregar usuario */}
      <AddUserModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseAddUserModal}
        onUserCreated={handleUserUpdated}
      />
    </div>

    
  )
}

export default UserManagementMainView
