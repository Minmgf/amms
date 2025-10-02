import React, { useMemo, useState } from 'react'
import { CiFilter } from 'react-icons/ci'
import TableList from '@/app/components/shared/TableList'
import HistoryFiltersModal from '@/app/components/machinery/history/HistoryFiltersModal'

const DEFAULT_FILTERS = {
  startDate: '',
  endDate: '',
  user: ''
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

const UpdateHistorySection = ({ history, loading = false }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false)

  const historyData = Array.isArray(history) ? history : []

  // Extraer usuarios únicos que han modificado esta maquinaria
  const availableUsers = useMemo(() => {
    const users = historyData
      .map(record => record.modifiedBy)
      .filter(Boolean)
    return [...new Set(users)].sort()
  }, [historyData])

  const filteredHistoryData = useMemo(() => {
    return historyData.filter((record) => {
      if (!record) return false

      // Filtro por fecha
      if (filters.startDate || filters.endDate) {
        if (!record.modificationDate) return false
        
        // Extraer solo la fecha (YYYY-MM-DD) del timestamp para comparación
        const recordDateStr = record.modificationDate.split('T')[0]
        
        if (filters.startDate && recordDateStr < filters.startDate) {
          return false
        }
        
        if (filters.endDate && recordDateStr > filters.endDate) {
          return false
        }
      }

      // Filtro por usuario
      if (filters.user && record.modifiedBy !== filters.user) {
        return false
      }

      return true
    })
  }, [historyData, filters])

  const columns = useMemo(() => [
    {
      accessorKey: 'modificationDate',
      header: 'Fecha de Modificación',
      cell: ({ row }) => (
        <span className="text-sm text-primary">{formatDateTime(row.original.modificationDate)}</span>
      )
    },
    {
      accessorKey: 'modifiedBy',
      header: 'Modificado por',
      cell: ({ row }) => <span className="text-sm text-primary">{row.original.modifiedBy || 'N/A'}</span>
    },
    {
      accessorKey: 'sectionModified',
      header: 'Sección Modificada',
      cell: ({ row }) => (
        <span className="text-sm text-secondary">{row.original.sectionModified || 'N/A'}</span>
      )
    },
    {
      accessorKey: 'performedAction',
      header: 'Acción Realizada',
      cell: ({ row }) => <span className="text-sm text-primary">{row.original.performedAction || 'N/A'}</span>
    },
    {
      accessorKey: 'justification',
      header: 'Justificación',
      cell: ({ row }) => (
        <span className="text-sm text-secondary">{row.original.justification || '—'}</span>
      )
    }
  ], [])

  const globalFilterFn = useMemo(() => {
    return (row, _columnId, filterValue) => {
      if (!filterValue) return true
      const search = filterValue.toLowerCase().trim()
      if (!search) return true

      const record = row.original || {}
      const searchableFields = [
        formatDateTime(record.modificationDate),
        record.modifiedBy,
        record.sectionModified,
        record.performedAction,
        record.justification
      ]

      return searchableFields.some((field) => {
        if (!field) return false
        return field.toString().toLowerCase().includes(search)
      })
    }
  }, [])

  const handleApplyFilters = (nextFilters) => {
    setFilters(nextFilters)
    setIsFiltersModalOpen(false)
  }

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

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
            aria-label="Buscar en historial"
          />
        </div>
        <button
          type="button"
          onClick={() => setIsFiltersModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-primary hover:border-accent hover:text-accent transition-colors"
          aria-label="Abrir filtros del historial"
        >
          <CiFilter className="w-5 h-5" aria-hidden="true" />
          Filtrar por
        </button>
      </div>

      <div className="rounded-xl p-0">
        {!loading && historyData.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-secondary text-sm">
            No hay historial de cambios disponible para esta maquinaria.
          </div>
        ) : (
          <TableList
            columns={columns}
            data={filteredHistoryData}
            loading={loading}
            globalFilter={searchQuery}
            onGlobalFilterChange={setSearchQuery}
            globalFilterFn={globalFilterFn}
            pageSizeOptions={[5, 10, 20]}
          />
        )}
      </div>

      <HistoryFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        initialFilters={filters}
        users={availableUsers}
        loading={false}
        error={null}
      />
    </div>
  )
}

export default UpdateHistorySection

