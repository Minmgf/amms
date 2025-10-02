import React, { useMemo, useState } from 'react'
import { CiFilter } from 'react-icons/ci'
import TableList from '@/app/components/shared/TableList'
import MaintenanceFiltersModal from '@/app/components/machinery/history/MaintenanceFiltersModal'

const DEFAULT_FILTERS = {
  startDate: '',
  endDate: '',
  maintenanceType: '',
  status: ''
}

const formatDateTime = (value) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  const formattedDate = date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
  const formattedTime = date.toLocaleTimeString('es-ES', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).toLowerCase()
  return `${formattedDate}, ${formattedTime}`
}

const PriorityBadge = ({ priority }) => {
  const styles = {
    Baja: 'bg-green-100 text-green-800',
    Alta: 'bg-red-100 text-red-800'
  }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[priority] || 'bg-gray-100 text-gray-800'}`}>
      {priority}
    </span>
  )
}

const StatusBadge = ({ status }) => {
  const styles = {
    'En progreso': 'bg-yellow-100 text-yellow-800',
    Pendiente: 'bg-cyan-100 text-cyan-800'
  }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  )
}

const MaintenanceRequestSection = ({ requests, loading = false }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false)

  const requestData = Array.isArray(requests) ? requests : []

  const filteredRequestData = useMemo(() => {
    return requestData.filter((record) => {
      if (!record) return false

      // Filtro por fecha
      if (filters.startDate || filters.endDate) {
        if (!record.requestDate) return false
        
        // Extraer solo la fecha (YYYY-MM-DD) del timestamp para comparación
        const recordDateStr = record.requestDate.split('T')[0]
        
        if (filters.startDate && recordDateStr < filters.startDate) {
          return false
        }
        
        if (filters.endDate && recordDateStr > filters.endDate) {
          return false
        }
      }

      // Filtro por tipo de mantenimiento
      if (filters.maintenanceType && record.maintenanceType !== filters.maintenanceType) {
        return false
      }

      // Filtro por estado
      if (filters.status && record.status !== filters.status) {
        return false
      }

      return true
    })
  }, [requestData, filters])

  const columns = useMemo(() => [
    {
      accessorKey: 'requestDate',
      header: 'Fecha de solicitud',
      cell: ({ row }) => <span className="text-sm text-primary">{formatDateTime(row.original.requestDate)}</span>
    },
    {
      accessorKey: 'maintenanceType',
      header: 'Tipo de mantenimiento',
      cell: ({ row }) => <span className="text-sm text-primary">{row.original.maintenanceType || 'N/A'}</span>
    },
    {
      accessorKey: 'priority',
      header: 'Prioridad',
      cell: ({ row }) => <PriorityBadge priority={row.original.priority} />
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    }
  ], [])

  const globalFilterFn = useMemo(() => {
    return (row, _columnId, filterValue) => {
      if (!filterValue) return true
      const search = filterValue.toLowerCase().trim()
      if (!search) return true

      const record = row.original || {}
      const searchableFields = [
        formatDateTime(record.requestDate),
        record.maintenanceType,
        record.priority,
        record.status
      ]

      return searchableFields.some((field) => {
        if (!field) return false
        return field.toString().toLowerCase().includes(search)
      })
    }
  }, [])

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters)
    setIsFiltersModalOpen(false)
  }

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  // Extraer valores únicos de los datos actuales para los filtros
  const maintenanceTypes = useMemo(() => {
    const types = requestData
      .map(request => request.maintenanceType)
      .filter(Boolean)
    return [...new Set(types)].sort()
  }, [requestData])

  const statuses = useMemo(() => {
    const statusList = requestData
      .map(request => request.status)
      .filter(Boolean)
    return [...new Set(statusList)].sort()
  }, [requestData])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Buscar"
            className="input-theme pl-4"
            aria-label="Buscar en solicitudes de mantenimiento"
          />
        </div>
        <button
          type="button"
          onClick={() => setIsFiltersModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-primary hover:border-accent hover:text-accent transition-colors"
          aria-label="Abrir filtros de solicitudes"
        >
          <CiFilter className="w-5 h-5" aria-hidden="true" />
          Filtrar por
        </button>
      </div>

      <div className="rounded-xl p-0">
        {!loading && requestData.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-secondary text-sm">
            No hay solicitudes de mantenimiento registradas para esta maquinaria.
          </div>
        ) : (
          <TableList
            columns={columns}
            data={filteredRequestData}
            loading={loading}
            globalFilter={searchQuery}
            onGlobalFilterChange={setSearchQuery}
            globalFilterFn={globalFilterFn}
            pageSizeOptions={[5, 10, 20]}
          />
        )}
      </div>

      <MaintenanceFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        initialFilters={filters}
        maintenanceTypes={maintenanceTypes}
        statuses={statuses}
      />
    </div>
  )
}

export default MaintenanceRequestSection
