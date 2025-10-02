import React, { useMemo, useState } from 'react'
import { CiFilter } from 'react-icons/ci'
import { FaDownload } from 'react-icons/fa'
import TableList from '@/app/components/shared/TableList'
import MaintenancePerformedFiltersModal from '@/app/components/machinery/history/MaintenancePerformedFiltersModal'

const fallbackPerformed = [
  {
    id: 1,
    performedDate: '2025-03-14T21:23:00Z',
    assignedTechnician: 'Cristiano Ronaldo',
    maintenancePerformed: 'Descripción...........',
    description: 'Descripción...........',
    costs: '450.00 USD',
    pdfUrl: '#'
  },
  {
    id: 2,
    performedDate: '2025-03-14T21:23:00Z',
    assignedTechnician: 'Ousmane Dembélé',
    maintenancePerformed: 'Descripción...........',
    description: 'Descripción...........',
    costs: '450.00 USD',
    pdfUrl: '#'
  }
]

const DEFAULT_FILTERS = {
  startDate: '',
  endDate: '',
  assignedTechnician: ''
}

const formatDateTime = (value) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
         date.toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()
}

const MaintenancePerformedSection = ({ performedMaint }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false)

  const performedData = Array.isArray(performedMaint) && performedMaint.length > 0 ? performedMaint : fallbackPerformed

  const filteredPerformedData = useMemo(() => {
    return performedData.filter(record => {
      const recordDate = new Date(record.performedDate)
      if (filters.startDate && recordDate < new Date(filters.startDate)) return false
      if (filters.endDate && recordDate > new Date(filters.endDate)) return false
      if (filters.assignedTechnician && record.assignedTechnician !== filters.assignedTechnician) return false
      return true
    })
  }, [performedData, filters])

  const columns = useMemo(() => [
    {
      accessorKey: 'performedDate',
      header: 'Fecha de realización',
      cell: ({ row }) => <span className="text-sm text-primary">{formatDateTime(row.original.performedDate)}</span>
    },
    {
      accessorKey: 'assignedTechnician',
      header: 'Técnico asignado',
      cell: ({ row }) => <span className="text-sm text-primary">{row.original.assignedTechnician || 'N/A'}</span>
    },
    {
      accessorKey: 'maintenancePerformed',
      header: 'Mantenimiento realizado',
      cell: ({ row }) => <span className="text-sm text-secondary">{row.original.maintenancePerformed || 'N/A'}</span>
    },
    {
      accessorKey: 'description',
      header: 'Descripción',
      cell: ({ row }) => <span className="text-sm text-secondary">{row.original.description || 'N/A'}</span>
    },
    {
      accessorKey: 'costs',
      header: 'Costos',
      cell: ({ row }) => <span className="text-sm text-primary font-semibold">{row.original.costs || 'N/A'}</span>
    },
    {
      id: 'pdf',
      cell: ({ row }) => (
        <a
          href={row.original.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-1 border border-gray-200 rounded-lg text-red-500 hover:bg-gray-100 transition-colors"
          aria-label="Descargar PDF"
        >
          <FaDownload className="w-4 h-4" />
          <span className="font-semibold text-sm">PDF</span>
        </a>
      )
    }
  ], [])

  const globalFilterFn = (row, _, filterValue) => {
    const search = filterValue.toLowerCase()
    return Object.values(row.original).some(value =>
      String(value).toLowerCase().includes(search)
    )
  }

  const technicians = ['Cristiano Ronaldo', 'Ousmane Dembélé', 'Juan Andres Pete']

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar"
            className="input-theme pl-4"
          />
        </div>
        <button onClick={() => setIsFiltersModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-primary hover:border-accent hover:text-accent transition-colors">
          <CiFilter className="w-5 h-5" /> Filtrar por
        </button>
      </div>
      <TableList
        columns={columns}
        data={filteredPerformedData}
        globalFilter={searchQuery}
        onGlobalFilterChange={setSearchQuery}
        globalFilterFn={globalFilterFn}
      />
      <MaintenancePerformedFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        onApply={(newFilters) => {
          setFilters(newFilters)
          setIsFiltersModalOpen(false)
        }}
        onClear={() => setFilters(DEFAULT_FILTERS)}
        initialFilters={filters}
        technicians={technicians}
      />
    </div>
  )
}

export default MaintenancePerformedSection
