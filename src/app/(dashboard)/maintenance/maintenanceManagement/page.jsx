'use client'

import TableList from '@/app/components/shared/TableList'
import React, { useState, useMemo, useEffect } from 'react'
import { CiFilter } from 'react-icons/ci'
import {
  FaPen, FaPlus, FaTimes, FaCog, FaTag, FaCheckCircle,
  FaTools, FaWrench, FaCheck, FaTrash
} from 'react-icons/fa'
import * as Dialog from '@radix-ui/react-dialog'
import axios from 'axios'

// IMPORTA el modal de creación
import CreateMaintenanceModal from '@/app/components/maintenance/maintenanceManagementModal/page' 
import MachineryDetailsModal from '@/app/components/machinery/machineryDetails/MachineryDetailsModal'

const GestorMantenimientos = () => {
  // --------- Estado general
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [maintenanceData, setMaintenanceData] = useState([])
  const [error, setError] = useState(null)

  // --------- Filtros
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [maintenanceTypeFilter, setMaintenanceTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [filteredData, setFilteredData] = useState([])

  // --------- Modal crear
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // --------- Datos para selects de filtros
  const [availableMaintenanceTypes, setAvailableMaintenanceTypes] = useState([])
  const [availableStatuses, setAvailableStatuses] = useState([])

  // --------- Endpoints
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, '') ||
    'https://api.inmero.co/sigma/main'

  const LIST_ENDPOINT =
    process.env.NEXT_PUBLIC_LIST_MAINTENANCE_ENDPOINT ||
    `${API_BASE}/maintenance/`

  // --------- Efectos
  useEffect(() => {
    loadMaintenanceData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    applyFilters()
  }, [maintenanceData, maintenanceTypeFilter, statusFilter])

  // --------- Cargar lista
  const loadMaintenanceData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(LIST_ENDPOINT)

      if (response.data && Array.isArray(response.data)) {
        setMaintenanceData(response.data)

        // Tipos únicos
        const uniqueTypes = [
          ...new Set(response.data.map((i) => i.tipo_mantenimiento).filter(Boolean)),
        ]
        setAvailableMaintenanceTypes(uniqueTypes)

        // Estados únicos
        const uniqueStatuses = [
          ...new Set(response.data.map((i) => i.estado).filter(Boolean)),
        ]
        setAvailableStatuses(uniqueStatuses)
      } else {
        setError('Formato de datos inesperado del servidor.')
      }
    } catch (err) {
      console.error('Error loading maintenance data:', err)
      setError('Error al cargar los datos de mantenimientos.')
    } finally {
      setLoading(false)
    }
  }

  // --------- Filtros
  const applyFilters = () => {
    let filtered = maintenanceData
    if (maintenanceTypeFilter) {
      filtered = filtered.filter(
        (m) => m.tipo_mantenimiento === maintenanceTypeFilter
      )
    }
    if (statusFilter) {
      filtered = filtered.filter((m) => m.estado === statusFilter)
    }
    setFilteredData(filtered)
  }

  const handleApplyFilters = () => {
    applyFilters()
    setIsFilterModalOpen(false)
  }

  const handleClearFilters = () => {
    setMaintenanceTypeFilter('')
    setStatusFilter('')
    applyFilters()
  }

  // --------- Helpers visuales
  const getStatusColor = (status) => {
    const colors = {
      Habilitado: 'bg-green-100 text-green-800',
      Deshabilitado: 'bg-red-100 text-red-800',
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-red-100 text-red-800',
      Activo: 'bg-green-100 text-green-800',
      Inactivo: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusDisplayText = (apiStatus) => {
    // API viene “Habilitado/Deshabilitado”
    if (apiStatus === 'Habilitado') return 'Active'
    if (apiStatus === 'Deshabilitado') return 'Inactive'
    return apiStatus
  }

  const getMaintenanceTypeColor = () => '' // placeholder por si luego quieres chips por tipo

  // --------- Búsqueda global para TanStack Table
  const globalFilterFn = useMemo(() => {
    return (row, _columnId, filterValue) => {
      if (!filterValue) return true
      const searchTerm = filterValue.toLowerCase().trim()
      if (!searchTerm) return true

      const m = row.original
      const searchable = [
        m.id_maintenance?.toString(),
        m.name,
        m.description,
        m.estado,
        m.tipo_mantenimiento,
      ]
      return searchable.some((f) => f?.toString().toLowerCase().includes(searchTerm))
    }
  }, [])

  // --------- Columnas
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: () => (
          <div className="flex items-center gap-2">
            <FaWrench className="w-4 h-4" />
            Nombre del Mantenimiento
          </div>
        ),
        cell: ({ row }) => {
          const m = row.original
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                <FaWrench className="w-4 h-4 text-gray-400" />
              </div>
              <div className="font-medium parametrization-text">
                {m.name || 'N/A'}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'description',
        header: () => (
          <div className="flex items-center gap-2">
            <FaTag className="w-4 h-4" />
            Descripción
          </div>
        ),
        cell: ({ row }) => (
          <div
            className="text-sm parametrization-text max-w-xs truncate"
            title={row.getValue('description')}
          >
            {row.getValue('description') || 'N/A'}
          </div>
        ),
      },
      {
        accessorKey: 'tipo_mantenimiento',
        header: () => (
          <div className="flex items-center gap-2">
            <FaCog className="w-4 h-4" />
            Tipo de Mantenimiento
          </div>
        ),
        cell: ({ row }) => {
          const type = row.getValue('tipo_mantenimiento')
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMaintenanceTypeColor(
                type
              )}`}
            >
              {type || 'N/A'}
            </span>
          )
        },
      },
      {
        accessorKey: 'estado',
        header: () => (
          <div className="flex items-center gap-2">
            <FaCheckCircle className="w-4 h-4" />
            Estado
          </div>
        ),
        cell: ({ row }) => {
          const status = row.getValue('estado')
          const displayText = getStatusDisplayText(status)
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                displayText
              )}`}
            >
              {displayText || 'N/A'}
            </span>
          )
        },
      },
      {
        id: 'actions',
        header: () => (
          <div className="flex items-center gap-2">
            <FaTools className="w-4 h-4" />
            Acciones
          </div>
        ),
        cell: ({ row }) => {
          const m = row.original
          const isActive = m.estado === 'Habilitado'
          return (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => handleEdit(m)}
                className="inline-flex items-center px-3 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-gray-500 hover:text-gray-600"
                title="Editar mantenimiento"
              >
                <FaPen className="w-3 h-3" />
                Edit
              </button>

              {isActive && (
                <button
                  onClick={() => handleDelete(m)}
                  className="inline-flex items-center px-3 py-1.5 gap-2 border text-xs font-medium rounded border-red-300 bg-red-50 text-red-600 hover:border-red-500 hover:bg-red-100"
                  title="Eliminar mantenimiento"
                >
                  <FaTrash className="w-3 h-3" />
                  Delete
                </button>
              )}

              {!isActive && (
                <button
                  onClick={() => handleEnable(m)}
                  className="inline-flex items-center px-3 py-1.5 gap-2 border text-xs font-medium rounded border-green-300 bg-green-50 text-green-600 hover:border-green-500 hover:bg-green-100"
                  title="Habilitar mantenimiento"
                >
                  <FaCheck className="w-3 h-3" />
                  Enable
                </button>
              )}
            </div>
          )
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // --------- Acciones (placeholder hasta que tengas endpoints PUT/DELETE)
  const handleEdit = (m) => {
    alert(`(Pendiente) Editar mantenimiento: ${m.name}`)
  }

  const handleDelete = async (m) => {
    if (!confirm(`¿Eliminar "${m.name}"?`)) return
    // Aquí iría DELETE al backend — temporalmente solo quitamos del estado
    setMaintenanceData((prev) =>
      prev.filter((it) => it.id_maintenance !== m.id_maintenance)
    )
    alert('Mantenimiento eliminado (local).')
  }

  const handleEnable = async (m) => {
    if (!confirm(`¿Habilitar "${m.name}"?`)) return
    // Aquí iría PATCH/PUT al backend — temporalmente actualizamos estado local
    setMaintenanceData((prev) =>
      prev.map((it) =>
        it.id_maintenance === m.id_maintenance
          ? { ...it, estado: 'Habilitado', id_estado: 1 }
          : it
      )
    )
    alert('Mantenimiento habilitado (local).')
  }

  // --------- Refresh tras crear
  const handleCreatedMaintenance = () => {
    loadMaintenanceData()
  }

  // --------- Render
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="parametrization-text text-2xl font-bold">
            Gestión de Mantenimientos
          </h1>
        </div>

        {error && (
          <div className="relative mt-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => setError(null)}
              className="absolute right-0 top-0 px-4 py-3"
            >
              <span className="sr-only">Dismiss</span>×
            </button>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-md">
          <input
            id="search"
            type="text"
            placeholder="Buscar por ID, nombre, descripción, tipo..."
            value={globalFilter || ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
          {globalFilter && (
            <div className="absolute -bottom-5 left-0 text-xs text-gray-500">
              Filtrando por: "{globalFilter}"
            </div>
          )}
        </div>

        <button
          onClick={() => setIsFilterModalOpen(true)}
          className={`parametrization-filter-button ${
            maintenanceTypeFilter || statusFilter
              ? 'border-blue-300 bg-blue-100 text-blue-700'
              : ''
          }`}
        >
          <CiFilter className="h-4 w-4" />
          Filtrar por
          {(maintenanceTypeFilter || statusFilter) && (
            <span className="ml-2 rounded-full bg-blue-500 px-2 py-1 text-xs text-white">
              {[maintenanceTypeFilter, statusFilter].filter(Boolean).length}
            </span>
          )}
        </button>

        {globalFilter && (
          <button
            onClick={() => setGlobalFilter('')}
            className="text-sm text-gray-500 underline hover:text-gray-700"
          >
            Limpiar búsqueda
          </button>
        )}

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="parametrization-filter-button"
        >
          <FaPlus className="h-4 w-4" />
          Agregar Mantenimiento
        </button>
      </div>

      {/* Tabla */}
      <TableList
        columns={columns}
        data={
          filteredData.length > 0 || maintenanceTypeFilter || statusFilter
            ? filteredData
            : maintenanceData
        }
        loading={loading}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        globalFilterFn={globalFilterFn}
        pageSizeOptions={[10, 20, 30, 50]}
      />

      {/* Modal Filtros */}
      <Dialog.Root open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-xl">
            <div className="card-theme rounded-2xl p-8">
              <div className="mb-8 flex items-center justify-between">
                <Dialog.Title className="text-2xl font-bold text-primary">
                  Filtros
                </Dialog.Title>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="text-secondary hover:text-primary"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-3 block text-sm font-medium text-primary">
                    Tipo de Mantenimiento
                  </label>
                  <select
                    value={maintenanceTypeFilter}
                    onChange={(e) => setMaintenanceTypeFilter(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Todos los tipos</option>
                    {availableMaintenanceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-primary">
                    Estado
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Todos los estados</option>
                    {availableStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 rounded-lg bg-red-500 px-6 py-3 font-medium text-white transition-colors hover:bg-red-600"
                >
                  Limpiar
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 rounded-lg bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal Crear */}
      <CreateMaintenanceModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreated={handleCreatedMaintenance}
        // responsibleUserId={user?.id} // pásalo si ya lo tienes
      />
    </div>
  )
}

export default GestorMantenimientos
