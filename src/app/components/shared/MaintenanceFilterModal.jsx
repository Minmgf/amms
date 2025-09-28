import * as Dialog from "@radix-ui/react-dialog";
import { FaTimes, FaCalendarAlt } from "react-icons/fa";

const MaintenanceFilterModal = ({
  open,
  onClose,
  maintenanceTypeFilter,
  setMaintenanceTypeFilter,
  priorityFilter,
  setPriorityFilter,
  statusFilter,
  setStatusFilter,
  requesterFilter,
  setRequesterFilter,
  startDateFilter,
  setStartDateFilter,
  endDateFilter,
  setEndDateFilter,
  availableRequesters = [],
  availableMaintenanceTypes = [],
  availablePriorities = [],
  availableStatuses = [],
  onClear,
  onApply,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-xl z-50 w-full max-w-2xl bg-background">
          <div className="p-8 card-theme rounded-2xl">
            <div className="flex justify-between items-center mb-8">
              <Dialog.Title className="text-2xl font-bold text-primary parametrization-text">
                Filtros
              </Dialog.Title>
              <button
                onClick={onClose}
                className="text-secondary hover:text-primary"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rango de Fechas de Solicitud */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary mb-3 parametrization-text">
                  Rango de Fechas de Solicitud
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2 parametrization-text">
                      Fecha de Inicio
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={startDateFilter || ""}
                        onChange={e => setStartDateFilter(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent pr-12"
                      />
                      <FaCalendarAlt className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2 parametrization-text">
                      Fecha de Fin
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={endDateFilter || ""}
                        onChange={e => setEndDateFilter(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent pr-12"
                      />
                      <FaCalendarAlt className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Solicitante */}
              <div>
                <label className="block text-sm font-medium text-primary mb-3 parametrization-text">
                  Solicitante
                </label>
                <select
                  value={requesterFilter || ""}
                  onChange={e => setRequesterFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none"
                >
                  <option value="">Todos los solicitantes</option>
                  {availableRequesters.map((requester) => (
                    <option key={requester} value={requester}>
                      {requester}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de Mantenimiento */}
              <div>
                <label className="block text-sm font-medium text-primary mb-3 parametrization-text">
                  Tipo de Mantenimiento
                </label>
                <select
                  value={maintenanceTypeFilter || ""}
                  onChange={e => setMaintenanceTypeFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none"
                >
                  <option value="">Todos los tipos</option>
                  {availableMaintenanceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prioridad */}
              <div>
                <label className="block text-sm font-medium text-primary mb-3 parametrization-text">
                  Prioridad
                </label>
                <select
                  value={priorityFilter || ""}
                  onChange={e => setPriorityFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none"
                >
                  <option value="">Todas las prioridades</option>
                  {availablePriorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-primary mb-3 parametrization-text">
                  Estado
                </label>
                <select
                  value={statusFilter || ""}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none"
                >
                  <option value="">Todos los estados</option>
                  {availableStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={onClear}
                className="flex-1 px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors parametrization-text"
              >
                Limpiar
              </button>
              <button
                onClick={onApply}
                className="flex-1 px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors parametrization-text"
              >
                Aplicar
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default MaintenanceFilterModal;