import React, { useMemo, useState } from 'react'
import { CiFilter } from 'react-icons/ci'
import { FaDownload } from 'react-icons/fa'
import TableList from '@/app/components/shared/TableList'
import MaintenancePerformedFiltersModal from '@/app/components/machinery/history/MaintenancePerformedFiltersModal'
import { downloadMaintenanceReportPDF } from '@/services/auditService'

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

const MaintenancePerformedSection = ({ performedMaint, loading = false }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false)
  const [downloadingPDF, setDownloadingPDF] = useState(null) // Para trackear qué PDF se está descargando

  const performedData = Array.isArray(performedMaint) ? performedMaint : []

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
      cell: ({ row }) => {
        const isDownloading = downloadingPDF === row.original.id
        const hasIdMaintenanceScheduling = row.original.idMaintenanceScheduling
        
        return (
          <button
            onClick={() => hasIdMaintenanceScheduling && handleDownloadPDF(row.original.idMaintenanceScheduling, row.original.id)}
            disabled={!hasIdMaintenanceScheduling || isDownloading}
            className={`inline-flex items-center gap-2 px-3 py-1 border border-gray-200 rounded-lg transition-colors ${
              hasIdMaintenanceScheduling && !isDownloading
                ? 'text-red-500 hover:bg-gray-100 cursor-pointer'
                : 'text-gray-400 cursor-not-allowed'
            }`}
            aria-label={isDownloading ? 'Descargando PDF...' : 'Descargar PDF'}
          >
            <FaDownload className={`w-4 h-4 ${isDownloading ? 'animate-spin' : ''}`} />
            <span className="font-semibold text-sm">
              {isDownloading ? 'Descargando...' : 'PDF'}
            </span>
          </button>
        )
      }
    }
  ], [])

  const globalFilterFn = (row, _, filterValue) => {
    const search = filterValue.toLowerCase()
    return Object.values(row.original).some(value =>
      String(value).toLowerCase().includes(search)
    )
  }

  const handleDownloadPDF = async (idMaintenanceScheduling, reportId) => {
    if (!idMaintenanceScheduling) {
      console.error('ID de mantenimiento programado no disponible')
      return
    }

    setDownloadingPDF(reportId)
    try {
      const pdfBlob = await downloadMaintenanceReportPDF(idMaintenanceScheduling)
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `reporte_mantenimiento_${idMaintenanceScheduling}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error al descargar el PDF:', error)
      alert('Error al descargar el reporte. Por favor, intente nuevamente.')
    } finally {
      setDownloadingPDF(null)
    }
  }

  // Extraer técnicos únicos de los datos reales
  const technicians = useMemo(() => {
    const techs = performedData
      .map(record => record.assignedTechnician)
      .filter(Boolean)
    return [...new Set(techs)].sort()
  }, [performedData])

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
            aria-label="Buscar en mantenimientos realizados"
          />
        </div>
        <button 
          onClick={() => setIsFiltersModalOpen(true)} 
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-primary hover:border-accent hover:text-accent transition-colors"
          aria-label="Abrir filtros de mantenimientos realizados"
        >
          <CiFilter className="w-5 h-5" /> Filtrar por
        </button>
      </div>
      
      <div className="rounded-xl p-0">
        {!loading && performedData.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-secondary text-sm">
            No hay mantenimientos realizados registrados para esta maquinaria.
          </div>
        ) : (
          <TableList
            columns={columns}
            data={filteredPerformedData}
            loading={loading}
            globalFilter={searchQuery}
            onGlobalFilterChange={setSearchQuery}
            globalFilterFn={globalFilterFn}
            pageSizeOptions={[5, 10, 20]}
          />
        )}
      </div>
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
