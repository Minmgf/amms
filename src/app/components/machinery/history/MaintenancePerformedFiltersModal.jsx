import React, { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { FaTimes, FaCalendarAlt } from 'react-icons/fa'

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

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[60]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-lg rounded-2xl card-theme p-6 space-y-6">
          <div className="flex items-start justify-between">
            <Dialog.Title className="text-xl font-semibold">Filtros</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-secondary hover:text-primary"><FaTimes /></button>
            </Dialog.Close>
          </div>

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

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={handleClear} className="btn-error">Limpiar</button>
            <button onClick={() => onApply(filters)} className="btn-primary">Aplicar</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default MaintenancePerformedFiltersModal
