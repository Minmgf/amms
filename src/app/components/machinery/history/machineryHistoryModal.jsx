import React, { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { FaTimes } from 'react-icons/fa'
import UpdateHistorySection from '@/app/components/machinery/history/UpdateHistorySection'

const PlaceholderTabContent = ({ label }) => (
  <div className="flex items-center justify-center py-12 text-secondary text-sm">
    Próximamente: {label}
  </div>
)

const historyTabs = [
  { id: 'updateHistory', label: 'Update History' },
  { id: 'maintenanceRequest', label: 'Maintenance Request' },
  { id: 'maintenanceScheduled', label: 'Maintenance Scheduled' },
  { id: 'maintenancePerformed', label: 'Maintenance Performed' }
]

const MachineryHistoryModal = ({ isOpen, onClose, machinery }) => {
  const [activeTab, setActiveTab] = useState(historyTabs[0].id)

  const handleOpenChange = (open) => {
    if (!open && typeof onClose === 'function') {
      onClose()
    }
  }

  useEffect(() => {
    if (isOpen) {
      setActiveTab(historyTabs[0].id)
    }
  }, [isOpen])

  const machineTitle = machinery?.machinery_name
    ? `${machinery.machinery_name} Change History`
    : 'Historial de maquinaria'

  const updateHistoryData = machinery?.history?.updateHistory || machinery?.history?.update

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'updateHistory':
        return <UpdateHistorySection history={updateHistoryData} />
      case 'maintenanceRequest':
        return <PlaceholderTabContent label="Maintenance Request" />
      case 'maintenanceScheduled':
        return <PlaceholderTabContent label="Maintenance Scheduled" />
      case 'maintenancePerformed':
        return <PlaceholderTabContent label="Maintenance Performed" />
      default:
        return null
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-xl z-50 w-full max-w-5xl">
          <div className="p-8 card-theme rounded-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <Dialog.Title className="text-2xl font-bold text-primary flex items-center gap-3">
        
                  {machineTitle}
                </Dialog.Title>

              </div>
              <Dialog.Close asChild>
                <button
                  onClick={onClose}
                  className="text-secondary hover:text-primary"
                  aria-label="Cerrar modal"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </Dialog.Close>
            </div>

            {machinery ? (
              <div className="space-y-6">


                <section className="rounded-2xl  ">
                  <div className="border-b border-gray-200 px-6">
                    <nav className="flex flex-wrap items-center gap-6">
                      {historyTabs.map((tab) => {
                        const isActive = tab.id === activeTab
  return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 text-sm font-semibold transition-colors border-b-2 ${
                              isActive
                                ? 'text-blue-600 border-blue-600'
                                : 'text-secondary border-transparent hover:text-primary'
                            }`}
                          >
                            {tab.label}
                          </button>
                        )
                      })}
                    </nav>
                  </div>

                  <div className="px-6 py-5">
                    {renderActiveTabContent()}
                  </div>
                </section>
              </div>
            ) : (
              <div className="bg-white/80 rounded-xl border border-gray-100 p-6 text-center text-secondary">
                Selecciona una maquinaria para ver su historial.
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default MachineryHistoryModal