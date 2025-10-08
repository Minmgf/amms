import React, { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { FaTimes } from 'react-icons/fa'
import UpdateHistorySection from '@/app/components/machinery/history/UpdateHistorySection'
import MaintenanceRequestSection from '@/app/components/machinery/history/MaintenanceRequestSection'
import MaintenanceScheduledSection from '@/app/components/machinery/history/MaintenanceScheduledSection'
import MaintenancePerformedSection from '@/app/components/machinery/history/MaintenancePerformedSection'
import { getMachineryHistory, getMaintenanceRequestHistory, getMaintenanceScheduledHistory, getMaintenanceReports, getMaintenanceReportDetail } from '@/services/auditService'
import { getPrioritiesList, getMaintenanceTypes, getMaintenanceRequestStatuses, getActiveTechnicians, getMaintenanceSchedulingStatuses } from '@/services/maintenanceService'
import { ErrorModal } from '@/app/components/shared/SuccessErrorModal'

const historyTabs = [
  { id: 'updateHistory', label: 'Historial de Cambios' },
  { id: 'maintenanceRequest', label: 'Solicitud de Mantenimiento' },
  { id: 'maintenanceScheduled', label: 'Mantenimiento Programado' },
  { id: 'maintenancePerformed', label: 'Mantenimiento Realizado' }
]

const MachineryHistoryModal = ({ isOpen, onClose, machinery }) => {
  const [activeTab, setActiveTab] = useState(historyTabs[0].id)
  const [historyData, setHistoryData] = useState([])
  const [maintenanceRequestData, setMaintenanceRequestData] = useState([])
  const [maintenanceScheduledData, setMaintenanceScheduledData] = useState([])
  const [maintenancePerformedData, setMaintenancePerformedData] = useState([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  const [isLoadingScheduled, setIsLoadingScheduled] = useState(false)
  const [isLoadingPerformed, setIsLoadingPerformed] = useState(false)
  const [errorModalOpen, setErrorModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  
  // Estados para mapeo de datos (catálogos)
  const [priorities, setPriorities] = useState([])
  const [maintenanceTypes, setMaintenanceTypes] = useState([])
  const [requestStatuses, setRequestStatuses] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [schedulingStatuses, setSchedulingStatuses] = useState([])
  const [catalogsLoaded, setCatalogsLoaded] = useState(false)
  
  // Estados para trackear qué pestañas ya se han cargado
  const [loadedTabs, setLoadedTabs] = useState({
    updateHistory: false,
    maintenanceRequest: false,
    maintenanceScheduled: false,
    maintenancePerformed: false
  })

  const handleOpenChange = (open) => {
    if (!open && typeof onClose === 'function') {
      onClose()
    }
  }

  // Al abrir el modal, solo cargar catálogos y resetear estado
  useEffect(() => {
    if (isOpen && machinery?.id_machinery) {
      setActiveTab(historyTabs[0].id)
      
      // Limpiar datos anteriores y resetear estado de pestañas cargadas
      setHistoryData([])
      setMaintenanceRequestData([])
      setMaintenanceScheduledData([])
      setMaintenancePerformedData([])
      const resetTabs = {
        updateHistory: false,
        maintenanceRequest: false,
        maintenanceScheduled: false,
        maintenancePerformed: false
      }
      setLoadedTabs(resetTabs)
      
      // Solo cargar catálogos si no están cargados
      if (!catalogsLoaded) {
        loadCatalogs()
      } else {
        // Si ya hay catálogos, cargar directamente la primera pestaña
        // Usar setTimeout para asegurar que el estado se actualice antes de cargar
        setTimeout(() => loadTabData(historyTabs[0].id), 0)
      }
    }
  }, [isOpen, machinery?.id_machinery])

  // Cargar datos cuando cambia la pestaña activa
  useEffect(() => {
    if (isOpen && catalogsLoaded && !loadedTabs[activeTab]) {
      loadTabData(activeTab)
    }
  }, [activeTab, isOpen, catalogsLoaded, loadedTabs])

  const loadCatalogs = async () => {
    try {
      const [prioritiesData, typesData, requestStatusesData, techniciansData, schedulingStatusesData] = await Promise.all([
        getPrioritiesList(),
        getMaintenanceTypes(),
        getMaintenanceRequestStatuses(),
        getActiveTechnicians(),
        getMaintenanceSchedulingStatuses()
      ])
      
      setPriorities(prioritiesData || [])
      setMaintenanceTypes(typesData || [])
      setRequestStatuses(requestStatusesData || [])
      setTechnicians(techniciansData?.data || techniciansData || [])
      setSchedulingStatuses(schedulingStatusesData || [])
      setCatalogsLoaded(true)
      
      // Después de cargar catálogos, cargar la primera pestaña
      loadTabData(historyTabs[0].id)
    } catch (error) {
      setErrorMessage('No se pudieron cargar los catálogos necesarios.')
      setErrorModalOpen(true)
    }
  }

  const loadTabData = async (tabId) => {
    if (!machinery?.id_machinery || loadedTabs[tabId]) return

    switch (tabId) {
      case 'updateHistory':
        await loadMachineryHistory()
        break
      case 'maintenanceRequest':
        await loadMaintenanceRequests()
        break
      case 'maintenanceScheduled':
        await loadMaintenanceScheduled()
        break
      case 'maintenancePerformed':
        await loadMaintenancePerformed()
        break
      default:
        break
    }

    setLoadedTabs(prev => ({ ...prev, [tabId]: true }))
  }

  const loadMachineryHistory = async () => {
    if (!machinery?.id_machinery) return

    setIsLoadingHistory(true)
    try {
      const auditEvents = await getMachineryHistory(machinery.id_machinery)
      
      const mappedHistory = auditEvents.map((event) => ({
        id: event.event_id,
        modificationDate: event.ts,
        modifiedBy: event.actor_name,
        sectionModified: mapSubmoduleToSection(event.submodule),
        performedAction: mapOperationToAction(event.operation),
        justification: event.diff?.justification || event.diff?.created?.justification || event.diff?.changed?.justification?.to || ''
      }))
      
      setHistoryData(mappedHistory)
    } catch (error) {
      setErrorMessage('No se pudo cargar el historial de cambios. Por favor, intente nuevamente.')
      setErrorModalOpen(true)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const mapSubmoduleToSection = (submodule) => {
    const sectionMap = {
      'general_sheet': 'Datos Generales',
      'tracker_sheet': 'Datos de Rastreador',
      'specific_technical_sheet': 'Ficha Técnica Específica',
      'usage_info': 'Información de Uso',
      'periodic_maintenance': 'Mantenimiento Periódico',
      'machinery_documentation_sheet': 'Documentación',
      'machinery_documentation': 'Documentación',
      'maintenance_request': 'Solicitud de Mantenimiento'
    }
    return sectionMap[submodule] || submodule || 'General'
  }

  const mapOperationToAction = (operation) => {
    const actionMap = {
      'CREATE': 'Creación',
      'UPDATE': 'Actualización',
      'DELETE': 'Eliminación'
    }
    return actionMap[operation] || operation || 'N/A'
  }

  const loadMaintenanceRequests = async () => {
    if (!machinery?.id_machinery) return

    setIsLoadingRequests(true)
    try {
      const auditEvents = await getMaintenanceRequestHistory(machinery.id_machinery)
      const createEvents = auditEvents.filter(event => event.operation === 'CREATE')
      const mappedRequests = createEvents.map((event) => {
        const created = event.diff?.created || {}
        
        const priority = priorities?.find(p => p.id_types === created.priority)
        const type = maintenanceTypes?.find(t => t.id_types === created.maintenance_type)
        const status = requestStatuses?.find(s => s.id_statues === created.request_status)
        
        return {
          id: event.event_id,
          requestDate: event.ts,
          maintenanceType: type?.name || 'N/A',
          priority: priority?.name || 'N/A',
          status: status?.name || 'N/A',
          description: created.description || '',
          detectedAt: created.detected_at,
          requester: event.actor_name
        }
      })
      
      setMaintenanceRequestData(mappedRequests)
    } catch (error) {
      setErrorMessage('No se pudo cargar el historial de solicitudes. Por favor, intente nuevamente.')
      setErrorModalOpen(true)
    } finally {
      setIsLoadingRequests(false)
    }
  }

  const loadMaintenanceScheduled = async () => {
    if (!machinery?.id_machinery) return

    setIsLoadingScheduled(true)
    try {
      const auditEvents = await getMaintenanceScheduledHistory(machinery.id_machinery)
      const createEvents = auditEvents.filter(event => event.operation === 'CREATE')
      
      const mappedScheduled = createEvents.map((event) => {
        const created = event.diff?.created || {}
        const type = maintenanceTypes?.find(t => t.id_types === created.maintenance_type)
        const tech = technicians?.find(t => t.id === created.assigned_technician || t.user_id === created.assigned_technician)
        const status = schedulingStatuses?.find(s => s.id === created.maintenance_scheduling_status || s.id_statues === created.maintenance_scheduling_status)
        
        const technicianName = tech ? (tech.name || `${tech.first_name || ''} ${tech.last_name || ''}`.trim() || 
                                       `${tech.first_last_name || ''} ${tech.second_last_name || ''}`.trim()) : 'N/A'
        
        return {
          id: event.event_id,
          scheduledDate: created.scheduled_at,
          maintenanceType: type?.name || 'N/A',
          assignedTo: technicianName,
          status: status?.statue_name || status?.name || 'N/A',
          details: created.details || '',
          programmedBy: event.actor_name
        }
      })
      
      setMaintenanceScheduledData(mappedScheduled)
    } catch (error) {
      setErrorMessage('No se pudo cargar el historial de mantenimientos programados.')
      setErrorModalOpen(true)
    } finally {
      setIsLoadingScheduled(false)
    }
  }

  const loadMaintenancePerformed = async () => {
    if (!machinery?.id_machinery) return

    setIsLoadingPerformed(true)
    try {
      const reportsResponse = await getMaintenanceReports()
      const reports = reportsResponse?.data || []
      
      // Filtrar reportes que correspondan a esta maquinaria
      const machineryReports = []
      
      for (const report of reports) {
        try {
          // Obtener el detalle del reporte para verificar la maquinaria
          const detailResponse = await getMaintenanceReportDetail(report.id_maintenance_scheduling)
          const detail = detailResponse?.data
          
          if (detail?.machinery_id === machinery.id_machinery) {
            machineryReports.push(report)
          }
        } catch (error) {
          console.warn(`No se pudo obtener detalle del reporte ${report.id_maintenance_scheduling}:`, error)
        }
      }
      
      const mappedPerformed = machineryReports.map((report) => ({
        id: report.id_maintenance_report,
        idMaintenanceScheduling: report.id_maintenance_scheduling, // Necesario para la descarga del PDF
        performedDate: report.registration_date,
        assignedTechnician: report.assigned_technician,
        maintenancePerformed: report.maintenance_names,
        description: report.description,
        costs: `$${report.total_cost?.toLocaleString() || '0'}`
      }))
      
      setMaintenancePerformedData(mappedPerformed)
    } catch (error) {
      setErrorMessage('No se pudo cargar el historial de mantenimientos realizados.')
      setErrorModalOpen(true)
    } finally {
      setIsLoadingPerformed(false)
    }
  }

  const machineTitle = machinery?.machinery_name
    ? `Historial de Cambios de ${machinery.machinery_name}`
    : 'Historial de maquinaria'

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'updateHistory':
        return <UpdateHistorySection history={historyData} loading={isLoadingHistory} />
      case 'maintenanceRequest':
        return <MaintenanceRequestSection requests={maintenanceRequestData} loading={isLoadingRequests} />
      case 'maintenanceScheduled':
        return <MaintenanceScheduledSection scheduledMaint={maintenanceScheduledData} loading={isLoadingScheduled} />
      case 'maintenancePerformed':
        return <MaintenancePerformedSection performedMaint={maintenancePerformedData} loading={isLoadingPerformed} />
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
                  aria-label="Cerrar historial de maquinaria"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </Dialog.Close>
            </div>

            {machinery ? (
              <div className="space-y-6">


                <section className="rounded-2xl">
                  <div className="border-b border-gray-200 px-6 flex justify-center">
                    <nav className="flex flex-wrap items-center gap-6" aria-label="Navegación de historial de maquinaria">
                      {historyTabs.map((tab) => {
                        const isActive = tab.id === activeTab
  return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 text-sm font-semibold transition-colors border-b-2 ${
                              isActive
                                ? 'text-accent border-accent'
                                : 'text-secondary border-transparent hover:text-primary'
                            }`}
                            aria-label={`Ver ${tab.label}`}
                            aria-pressed={isActive}
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

      <ErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        title="Error al cargar historial"
        message={errorMessage}
      />
    </Dialog.Root>
  )
}

export default MachineryHistoryModal
