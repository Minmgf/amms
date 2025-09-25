import React, { useMemo, useState, useEffect } from 'react'
import { FiSearch } from 'react-icons/fi'
import { CiFilter } from 'react-icons/ci'
import TableList from '@/app/components/shared/TableList'
import HistoryFiltersModal from '@/app/components/machinery/history/HistoryFiltersModal'
import { getUsersList } from '@/services/authService'

const fallbackHistory = [
  {
    id: 1,
    modificationDate: '2025-03-14T21:23:00Z',
    modifiedBy: 'Cristiano Ronaldo',
    sectionModified: 'Todo',
    performedAction: 'Create',
    justification: ''
  },
  {
    id: 2,
    modificationDate: '2025-03-14T21:23:00Z',
    modifiedBy: 'Juan Andres Pete',
    sectionModified: 'Specific Data Sheet',
    performedAction: 'Update',
    justification: 'Se cambió el dispositivo de telemetría'
  }
]

const DEFAULT_FILTERS = {
  startDate: '',
  endDate: '',
  user: ''
}

const formatDateTime = (value) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  const formattedDate = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).toLowerCase()
  return `${formattedDate}, ${formattedTime}`
}

const UpdateHistorySection = ({ history }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false)
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState(null)
  const [availableUsers, setAvailableUsers] = useState([])

  const historyData = Array.isArray(history) && history.length > 0 ? history : fallbackHistory

  useEffect(() => {
    const loadUsers = async () => {
      setUsersLoading(true)
      setUsersError(null)
      try {
        const response = await getUsersList()
        if (response?.success && Array.isArray(response.data)) {
          const mappedUsers = response.data
            .map((user) => {
              const fullName = `${user.name || ''} ${user.first_last_name || ''} ${user.second_last_name || ''}`
                .replace(/\s+/g, ' ')
                .trim()
              return fullName || user.email || null
            })
            .filter(Boolean)

          setAvailableUsers([...new Set(mappedUsers)])
        } else if (Array.isArray(response)) {
          const mappedUsers = response
            .map((user) => {
              const fullName = `${user.name || ''} ${user.first_last_name || ''} ${user.second_last_name || ''}`
                .replace(/\s+/g, ' ')
                .trim()
              return fullName || user.email || null
            })
            .filter(Boolean)

          setAvailableUsers([...new Set(mappedUsers)])
        } else {
          setUsersError('No se pudo obtener la lista de usuarios')
        }
      } catch (error) {
        console.error('Error al cargar usuarios:', error)
        setUsersError('Error al cargar usuarios')
      } finally {
        setUsersLoading(false)
      }
    }

    loadUsers()
  }, [])

  const filteredHistoryData = useMemo(() => {
    return historyData.filter((record) => {
      if (!record) return false

      const recordDate = record.modificationDate ? new Date(record.modificationDate) : null
      const startDate = filters.startDate ? new Date(filters.startDate) : null
      const endDate = filters.endDate ? new Date(filters.endDate) : null

      if (startDate) {
        const startOfDay = new Date(startDate)
        startOfDay.setHours(0, 0, 0, 0)
        if (!recordDate || recordDate < startOfDay) {
          return false
        }
      }

      if (endDate) {
        const endOfDay = new Date(endDate)
        endOfDay.setHours(23, 59, 59, 999)
        if (!recordDate || recordDate > endOfDay) {
          return false
        }
      }

      if (filters.user && record.modifiedBy !== filters.user) {
        return false
      }

      return true
    })
  }, [historyData, filters])

  const columns = useMemo(() => [
    {
      accessorKey: 'modificationDate',
      header: 'Modification date',
      cell: ({ row }) => (
        <span className="text-sm text-primary">{formatDateTime(row.original.modificationDate)}</span>
      )
    },
    {
      accessorKey: 'modifiedBy',
      header: 'Modified by',
      cell: ({ row }) => <span className="text-sm text-primary">{row.original.modifiedBy || 'N/A'}</span>
    },
    {
      accessorKey: 'sectionModified',
      header: 'Section Modified',
      cell: ({ row }) => (
        <span className="text-sm text-secondary">{row.original.sectionModified || 'N/A'}</span>
      )
    },
    {
      accessorKey: 'performedAction',
      header: 'Performed Action',
      cell: ({ row }) => <span className="text-sm text-primary">{row.original.performedAction || 'N/A'}</span>
    },
    {
      accessorKey: 'justification',
      header: 'Justification',
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search"
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
          Filter by
        </button>
      </div>

      <div className="card-theme rounded-xl p-0">
        <TableList
          columns={columns}
          data={filteredHistoryData}
          loading={false}
          globalFilter={searchQuery}
          onGlobalFilterChange={setSearchQuery}
          globalFilterFn={globalFilterFn}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>

      <HistoryFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        initialFilters={filters}
        users={availableUsers}
        loading={usersLoading}
        error={usersError}
      />
    </div>
  )
}

export default UpdateHistorySection

