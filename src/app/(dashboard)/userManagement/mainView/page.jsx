'use client'
import TableList from '@/app/components/shared/TableList'
import React, { useState, useMemo, useEffect } from 'react'
import { getUsersList, changeUserStatus } from '@/services/authService'
import { CiFilter } from 'react-icons/ci'
import { FaEye, FaPen, FaUserPlus } from 'react-icons/fa'
import PermissionGuard from '@/app/(auth)/PermissionGuard'

const UserManagementMainView = () => {
  // Estado para el filtro global
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Estados para datos de la API
  const [userData, setUserData] = useState([])
  const [error, setError] = useState(null)

  // Cargar datos al montar el componente
  useEffect(() => {
    loadInitialData()
  }, [])

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

  // Definición de columnas para TanStack Table
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Full Name',
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
      header: 'Document Type',
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {row.getValue('type_document_name') || 'N/A'}
        </span>
      )
    },
    {
      accessorKey: 'document_number',
      header: 'Document Number',
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
      header: 'Roles',
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
      header: 'Status',
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
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => handleEdit(row.original)}
            className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-black "
          >
            <FaPen /> Edit
          </button>
          <button
            onClick={() => handleView(row.original)}
            className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-black "
          >
            <FaEye /> View
          </button>
          <button
            onClick={() => handleStatusToggle(row.original)}
            className="inline-flex items-center px-2.5 py-1.5 border text-xs font-medium rounded border-black "
          >
            {row.original.status === 1 ? 'Deactivate' : 'Activate'}
          </button>
        </div> 
      )
    }
  ], [])

  // Handlers para las acciones
  const handleEdit = (user) => {
    console.log('Editing user:', user)
    // Aquí implementarías la lógica para editar el usuario
    // Podrías navegar a una página de edición o abrir un modal
  }

  const handleView = (user) => {
    console.log('Viewing user:', user)
    // Aquí implementarías la lógica para ver el usuario
    // Podrías navegar a una página de detalle o abrir un modal
  }

  const handleStatusToggle = async (user) => {
    // Mapear el status numérico a string para el API
    const currentStatusIsActive = user.status === 1
    const newStatusString = currentStatusIsActive ? 'inactive' : 'active'
    
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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
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
            placeholder="Search by name, email, document..."
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
          Filter by
        </button>
        <PermissionGuard
          allowedRoles={["Administrator", "HR Manager"]}
          allowedPermissions={["users.create"]}
        >
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="parametrization-filter-button"
          >
            <FaUserPlus className="w-4 h-4" />
            Add User
          </button>
        </PermissionGuard>
      </div>

      {/* Tabla de usuarios */}
      <TableList
        columns={columns}
        data={userData}
        loading={loading}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        pageSizeOptions={[10, 20, 30, 50]}
      />
    </div>
  )
}

export default UserManagementMainView
