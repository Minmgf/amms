import React, { useEffect, useState } from 'react'
import { FaCalendarAlt } from 'react-icons/fa'
import FilterModal from '@/app/components/shared/FilterModal'

const defaultFilters = {
  startDate: '',
  endDate: '',
  assignedTechnician: ''
}

const MaintenancePerformedFiltersModal = ({
  isOpen,
  onClose,
  onApply,
  onClear,
  initialFilters = defaultFilters,
  technicians = []
}) => {
  const [filters, setFilters] = useState(initialFilters)

  useEffect(() => {
    if (isOpen) setFilters(initialFilters)
  }, [isOpen, initialFilters])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleClear = () => {
    setFilters(defaultFilters)
    onClear?.()
  }

  const handleApply = () => {
    onApply?.(filters)
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
          <span className="text-sm font-medium">Fecha de realización</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase">Inicio</label>
              <div className="relative">
                <input type="date" name="startDate" value={filters.startDate} onChange={handleInputChange} className="input-theme pr-10" />
                <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase">Fin</label>
              <div className="relative">
                <input type="date" name="endDate" value={filters.endDate} onChange={handleInputChange} className="input-theme pr-10" />
                <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Técnico Asignado</label>
          <select name="assignedTechnician" value={filters.assignedTechnician} onChange={handleInputChange} className="input-theme">
            <option value="">Todos</option>
            {technicians.map(tech => <option key={tech} value={tech}>{tech}</option>)}
          </select>
        </div>
      </div>
    </FilterModal>
  )
}

export default MaintenancePerformedFiltersModal
