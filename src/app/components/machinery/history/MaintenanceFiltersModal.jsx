import React, { useEffect, useState } from 'react'
import { FaCalendarAlt } from 'react-icons/fa'
import FilterModal from '@/app/components/shared/FilterModal'

const defaultFilters = {
  startDate: '',
  endDate: '',
  maintenanceType: '',
  status: ''
}

const MaintenanceFiltersModal = ({
  isOpen,
  onClose,
  onApply,
  onClear,
  initialFilters = defaultFilters,
  maintenanceTypes = [],
  statuses = []
}) => {
  const [filters, setFilters] = useState(initialFilters)

  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters)
    }
  }, [isOpen, initialFilters])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleClear = () => {
    setFilters(defaultFilters)
    if (typeof onClear === 'function') {
      onClear()
    }
  }

  const handleApply = () => {
    if (typeof onApply === 'function') {
      onApply(filters)
    }
  }

  return (
    <FilterModal
      open={isOpen}
      onClose={onClose}
      onApply={handleApply}
      onClear={handleClear}
    >
      <div className="space-y-5">
        <div className="space-y-3">
          <span className="text-sm font-medium text-primary">Fecha de solicitud</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary uppercase tracking-wide">Inicio</label>
              <div className="relative">
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-3 pr-10 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  aria-label="Fecha de inicio"
                />
                <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary uppercase tracking-wide">Fin</label>
              <div className="relative">
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-3 pr-10 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  aria-label="Fecha de fin"
                />
                <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-primary">Tipo de mantenimiento</label>
            <select
              name="maintenanceType"
              value={filters.maintenanceType}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              aria-label="Seleccionar tipo de mantenimiento"
            >
              <option value="">Todos</option>
              {maintenanceTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-primary">Estado de la solicitud</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              aria-label="Seleccionar estado de la solicitud"
            >
              <option value="">Todos</option>
              {statuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </FilterModal>
  )
}

export default MaintenanceFiltersModal
