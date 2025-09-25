import React, { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { FaTimes, FaCalendarAlt } from 'react-icons/fa'

const defaultFilters = {
  startDate: '',
  endDate: '',
  user: ''
}

const HistoryFiltersModal = ({
  isOpen,
  onClose,
  onApply,
  onClear,
  initialFilters = defaultFilters,
  users = [],
  loading = false,
  error = null
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

  const handleOpenChange = (open) => {
    if (!open && typeof onClose === 'function') {
      onClose()
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-lg rounded-2xl bg-white shadow-2xl">
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <Dialog.Title className="text-xl font-semibold text-primary">Filters</Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <button
                  onClick={onClose}
                  className="text-secondary hover:text-primary"
                  aria-label="Cerrar filtro"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="space-y-5">
              <div className="space-y-3">
                <span className="text-sm font-medium text-primary">Modification date</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-secondary uppercase tracking-wide">Start</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-200 py-2.5 pl-3 pr-10 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                      />
                      <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-secondary uppercase tracking-wide">End</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-200 py-2.5 pl-3 pr-10 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                      />
                      <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-primary">Responsible user</label>
                <select
                  name="user"
                  value={filters.user}
                  onChange={handleInputChange}
                  disabled={loading || !!error}
                  className="w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">Todos</option>
                  {users.map((user) => (
                    <option key={user} value={user}>
                      {user}
                    </option>
                  ))}
                </select>
                {loading && (
                  <p className="text-xs text-secondary">Cargando usuarios...</p>
                )}
                {error && (
                  <p className="text-xs text-red-500">{error}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClear}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold transition-colors hover:bg-red-600"
              >
                Clean
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-black text-white text-sm font-semibold transition-colors hover:bg-gray-900"
              >
                Apply
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default HistoryFiltersModal

