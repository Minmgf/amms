import React, { useEffect, useState } from 'react'
import { FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa'
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
  const [dateRangeError, setDateRangeError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters)
      setDateRangeError('')
    }
  }, [isOpen, initialFilters])

  // Validar rango de fechas
  const validateDateRange = (startDate, endDate) => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      if (start > end) {
        setDateRangeError('La fecha inicial no puede ser posterior a la fecha final')
        return false
      }
    }
    setDateRangeError('')
    return true
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    const newFilters = { ...filters, [name]: value }
    setFilters(newFilters)
    
    // Validar si se cambió alguna fecha
    if (name === 'startDate' || name === 'endDate') {
      validateDateRange(newFilters.startDate, newFilters.endDate)
    }
  }

  const handleClear = () => {
    setFilters(defaultFilters)
    setDateRangeError('')
    onClear?.()
  }

  const handleApply = () => {
    // Validar antes de aplicar
    if (!validateDateRange(filters.startDate, filters.endDate)) {
      return
    }
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
                <input 
                  type="date" 
                  name="startDate" 
                  value={filters.startDate} 
                  max={filters.endDate || undefined}
                  onChange={handleInputChange} 
                  className={`input-theme pr-10 ${dateRangeError ? 'border-red-500' : ''}`}
                />
                <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase">Fin</label>
              <div className="relative">
                <input 
                  type="date" 
                  name="endDate" 
                  value={filters.endDate} 
                  min={filters.startDate || undefined}
                  onChange={handleInputChange} 
                  className={`input-theme pr-10 ${dateRangeError ? 'border-red-500' : ''}`}
                />
                <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
          {dateRangeError && (
            <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 p-2 rounded">
              <FaExclamationTriangle className="w-4 h-4" />
              <span>{dateRangeError}</span>
            </div>
          )}
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
