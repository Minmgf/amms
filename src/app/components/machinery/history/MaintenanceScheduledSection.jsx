import React, { useMemo, useState } from 'react'
import { CiFilter } from 'react-icons/ci'
import TableList from '@/app/components/shared/TableList'
import MaintenanceScheduledFiltersModal from '@/app/components/machinery/history/MaintenanceScheduledFiltersModal'

const DEFAULT_FILTERS = {
  startDate: '',
  endDate: '',
  maintenanceType: '',
  assignedTo: '',
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

const MaintenanceScheduledSection = ({ scheduledMaint, loading = false }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false)

  const scheduledData = Array.isArray(scheduledMaint) ? scheduledMaint : []

  const filteredScheduledData = useMemo(() => {
    return scheduledData.filter((record) => {
      if (!record) return false

      if (filters.startDate || filters.endDate) {
        if (!record.scheduledDate) return false
        
        const recordDateStr = record.scheduledDate.split('T')[0].split(' ')[0]
        
        if (filters.startDate && recordDateStr < filters.startDate) {
          return false
        }
        
        if (filters.endDate && recordDateStr > filters.endDate) {
          return false
        }
      }

      if (filters.maintenanceType && record.maintenanceType !== filters.maintenanceType) return false
      if (filters.assignedTo && record.assignedTo !== filters.assignedTo) return false
      if (filters.status && record.status !== filters.status) return false

      return true
    })
  }, [scheduledData, filters])

  const columns = useMemo(() => [
    {
      accessorKey: 'scheduledDate',
      header: 'Fecha programada',
      cell: ({ row }) => <span className="text-sm text-primary">{formatDateTime(row.original.scheduledDate)}</span>
    },
    {
      accessorKey: 'maintenanceType',
      header: 'Tipo de mantenimiento',
      cell: ({ row }) => <span className="text-sm text-primary">{row.original.maintenanceType || 'N/A'}</span>
    },
    {
      accessorKey: 'assignedTo',
      header: 'Asignado a',
      cell: ({ row }) => <span className="text-sm text-primary">{row.original.assignedTo || 'N/A'}</span>
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
        formatDateTime(record.scheduledDate),
        record.maintenanceType,
        record.assignedTo,
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

  const maintenanceTypes = useMemo(() => {
    const types = scheduledData
      .map(record => record.maintenanceType)
      .filter(Boolean)
    return [...new Set(types)].sort()
  }, [scheduledData])

  const technicians = useMemo(() => {
    const techs = scheduledData
      .map(record => record.assignedTo)
      .filter(Boolean)
    return [...new Set(techs)].sort()
  }, [scheduledData])

  const statuses = useMemo(() => {
    const statusList = scheduledData
      .map(record => record.status)
      .filter(Boolean)
    return [...new Set(statusList)].sort()
  }, [scheduledData])

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
            aria-label="Buscar en mantenimientos programados"
          />
        </div>
        <button
          type="button"
          onClick={() => setIsFiltersModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-primary hover:border-accent hover:text-accent transition-colors"
          aria-label="Abrir filtros de mantenimientos programados"
        >
          <CiFilter className="w-5 h-5" aria-hidden="true" />
          Filtrar por
        </button>
      </div>

      <div className="rounded-xl p-0">
        {!loading && scheduledData.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-secondary text-sm">
            No hay mantenimientos programados registrados para esta maquinaria.
          </div>
        ) : (
          <TableList
            columns={columns}
            data={filteredScheduledData}
            loading={loading}
            globalFilter={searchQuery}
            onGlobalFilterChange={setSearchQuery}
            globalFilterFn={globalFilterFn}
            pageSizeOptions={[5, 10, 20]}
          />
        )}
      </div>

      <MaintenanceScheduledFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        initialFilters={filters}
        maintenanceTypes={maintenanceTypes}
        technicians={technicians}
        statuses={statuses}
      />
    </div>
  )
}

export default MaintenanceScheduledSection
