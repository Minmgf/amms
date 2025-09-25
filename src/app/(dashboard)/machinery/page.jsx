'use client'
import TableList from '@/app/components/shared/TableList'
import React, { useState, useMemo, useEffect } from 'react'
import { CiFilter } from 'react-icons/ci'
import {
  FaEye, FaPen, FaPlus, FaTimes, FaCog, FaCalendarAlt, FaBarcode, FaTag,
  FaCalendar, FaCheckCircle, FaTools, FaHashtag, FaRegPlayCircle, FaTractor,
  FaOilCan, FaFilter as FaFilterSolid, FaSearch, FaCogs
} from 'react-icons/fa'
import PermissionGuard from '@/app/(auth)/PermissionGuard'
import * as Dialog from '@radix-ui/react-dialog'
import { FiLayers, FiDownload, FiFileText } from 'react-icons/fi'
import { IoCalendarOutline } from 'react-icons/io5'
import MultiStepFormModal from '@/app/components/machinery/multistepForm/MultistepFormModal'
import MachineryDetailsModal from '@/app/components/machinery/machineryDetails/MachineryDetailsModal'
import { FiChevronDown } from 'react-icons/fi'



const MachineryMainView = () => {
  // Estado para el filtro global
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(false)

  // Estados para datos de la API
  const [machineryData, setMachineryData] = useState([])
  const [error, setError] = useState(null)

  // Estados para el modal de filtros
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [machineryTypeFilter, setMachineryTypeFilter] = useState('')
  const [tenureFilter, setTenureFilter] = useState('')
  const [operativeStatusFilter, setOperativeStatusFilter] = useState('')
  const [acquisitionDateFilter, setAcquisitionDateFilter] = useState('')
  const [filteredData, setFilteredData] = useState([])

  // Estados para modales de detalles y edición
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedMachine, setSelectedMachine] = useState(null)
  const [activeTab, setActiveTab] = useState('general') // 'general' | 'tech' | 'docs'


  // Datos de ejemplo (posteriormente se reemplazará con llamadas a API)
  const sampleData = [
    {
      id: 1,
      name: 'Tractor para banano',
      serial_number: 'CAT00D5GPWGB01070',
      type: 'Tractor',
      acquisition_date: '2025-03-14T09:23:00Z',
      status: 'Producción',
      status_id: 1,
      brand: 'Caterpillar',
      model: 'D5G',
      year: 2023,
      location: 'Campo A - Sector 1',
      tenure: 'Propio'
    },
    {
      id: 2,
      name: 'Tractor para banano',
      serial_number: 'CAT00D5GPWGB01070',
      type: 'Tractor',
      acquisition_date: '2025-03-14T09:23:00Z',
      status: 'Producción',
      status_id: 1,
      brand: 'Caterpillar',
      model: 'D5G',
      year: 2023,
      location: 'Campo A - Sector 2',
      tenure: 'Arrendado'
    }
  ]

  // Cargar datos al montar el componente
  useEffect(() => {
    loadInitialData()
  }, [])

  // Aplicar filtros cuando cambien los datos o los filtros
  useEffect(() => {
    applyFilters()
  }, [machineryData, machineryTypeFilter, tenureFilter, operativeStatusFilter, acquisitionDateFilter])

  const loadInitialData = async () => {
    setLoading(true)
    setError(null)

    try {
      // TODO: Reemplazar con llamada real a la API
      // const machineryResponse = await getMachineryList()

      // Simulando carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMachineryData(sampleData)

    } catch (err) {
      console.error('Error loading data:', err)
      setError('Error al cargar los datos. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // Obtener valores únicos para los filtros
  const uniqueMachineryTypes = useMemo(() => {
    const types = machineryData.map(machine => machine.type).filter(Boolean)
    return [...new Set(types)]
  }, [machineryData])

  const uniqueTenures = useMemo(() => {
    const tenures = machineryData.map(machine => machine.tenure).filter(Boolean)
    return [...new Set(tenures)]
  }, [machineryData])

  const uniqueOperativeStatuses = useMemo(() => {
    const statuses = machineryData.map(machine => machine.status).filter(Boolean)
    return [...new Set(statuses)]
  }, [machineryData])

  // Aplicar filtros
  const applyFilters = () => {
    let filtered = machineryData

    if (machineryTypeFilter) {
      filtered = filtered.filter(machine => machine.type === machineryTypeFilter)
    }

    if (tenureFilter) {
      filtered = filtered.filter(machine => machine.tenure === tenureFilter)
    }

    if (operativeStatusFilter) {
      filtered = filtered.filter(machine => machine.status === operativeStatusFilter)
    }

    if (acquisitionDateFilter) {
      filtered = filtered.filter(machine => {
        const machineDate = new Date(machine.acquisition_date).toISOString().split('T')[0]
        return machineDate === acquisitionDateFilter
      })
    }

    setFilteredData(filtered)
  }

  // Función personalizada de filtrado global
  const globalFilterFn = useMemo(() => {
    return (row, columnId, filterValue) => {
      if (!filterValue) return true

      const searchTerm = filterValue.toLowerCase()
      const machine = row.original

      // Crear texto completo para buscar
      const name = (machine.name || '').toLowerCase()
      const serialNumber = (machine.serial_number || '').toLowerCase()
      const type = (machine.type || '').toLowerCase()
      const brand = (machine.brand || '').toLowerCase()
      const model = (machine.model || '').toLowerCase()

      // Buscar en cualquier parte de los campos
      return name.includes(searchTerm) ||
        serialNumber.includes(searchTerm) ||
        type.includes(searchTerm) ||
        brand.includes(searchTerm) ||
        model.includes(searchTerm)
    }
  }, [])

  // Handlers para filtros
  const handleApplyFilters = () => {
    applyFilters()
    setIsFilterModalOpen(false)
  }

  const handleClearFilters = () => {
    setMachineryTypeFilter('')
    setTenureFilter('')
    setOperativeStatusFilter('')
    setAcquisitionDateFilter('')
    setFilteredData(machineryData)
    setIsFilterModalOpen(false)
  }

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Formatear hora
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Definición de columnas para TanStack Table
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: () => (
        <div className="flex items-center gap-2">
          <FaTractor className="w-4 h-4" />
          Máquina
        </div>
      ),
      cell: ({ row }) => {
        const machine = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8  rounded-md flex items-center justify-center">
              <FaTractor className="w-4 h-4 " />
            </div>
            <div className="font-medium parametrization-text">
              {machine.name || 'N/A'}
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: 'serial_number',
      header: () => (
        <div className="flex items-center gap-1">
          <FaHashtag className="w-4 h-4 " />
          Número de Serie
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-sm parametrization-text font-mono">
          {row.getValue('serial_number') || 'N/A'}
        </div>
      )
    },
    {
      accessorKey: 'type',
      header: () => (
        <div className="flex items-center gap-2">
          <FiLayers className="w-4 h-4 " />
          Tipo
        </div>
      ),
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium parametrization-text">
          {row.getValue('type') || 'N/A'}
        </span>
      )
    },
    {
      accessorKey: 'acquisition_date',
      header: () => (
        <div className="flex items-center gap-2">
          <IoCalendarOutline className="w-4 h-4 " />
          Fecha de Adquisición
        </div>
      ),
      cell: ({ row }) => {
        const date = row.getValue('acquisition_date')
        return (
          <div className="text-sm parametrization-text">
            <div>{formatDate(date)}</div>
            <div className="text-xs parametrization-text">{formatTime(date)}</div>
          </div>
        )
      }
    },
    {
      accessorKey: 'status',
      header: () => (
        <div className="flex items-center gap-2">
          <FaRegPlayCircle className="w-4 h-4 " />
          Estado
        </div>
      ),
      cell: ({ row }) => {
        const status = row.getValue('status')
        const statusColors = {
          'Producción': 'parametrization-text',
          'Mantenimiento': 'parametrization-text',
          'Fuera de Servicio': 'parametrization-text',
          'Disponible': 'parametrization-text'
        }

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
            {status || 'Desconocido'}
          </span>
        )
      }
    },
    {
      id: 'actions',
      header: () => (
        <div className="flex items-center gap-2">
          <FaTools className="w-4 h-4 " />
          Acciones
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => handleEdit(row.original)}
            className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-black"
          >
            <FaPen /> Editar
          </button>
          <button
            onClick={() => handleView(row.original)}
            className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-black"
          >
            <FaEye /> Ver
          </button>
        </div>
      )
    }
  ], [])

  // Handlers para las acciones
  const handleEdit = (machine) => {
    console.log('Editing machine:', machine)
    setSelectedMachine(machine)
    setIsEditModalOpen(true)
  }

  const handleView = (machine) => {
    console.log('Viewing machine:', machine)
    setSelectedMachine(machine)
    setIsDetailsModalOpen(true)
  }

  const handleOpenAddMachineModal = () => {
    setIsCreateModalOpen(true)
  }

  const handleRefresh = () => {
    loadInitialData()
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Maquinaria</h1>
        </div>

        {/* Mostrar error si existe */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => setError(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <span className="sr-only">Dismiss</span>
              ×
            </button>
          </div>
        )}
      </div>

      {/* Filtro de búsqueda global */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="max-w-md">
          <input
            id="search"
            type="text"
            placeholder="Buscar maquinaria..."
            value={globalFilter || ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="parametrization-filter-button"
        >
          <CiFilter className="w-4 h-4" />
          Filtrar por
        </button>
        <button
          onClick={handleOpenAddMachineModal}
          className="parametrization-filter-button"
        >
          <FaPlus className="w-4 h-4" />
          Agregar maquinaria
        </button>
      </div>

      {/* Tabla de maquinaria */}
      <TableList
        columns={columns}
        data={filteredData.length > 0 || machineryTypeFilter || tenureFilter || operativeStatusFilter || acquisitionDateFilter ? filteredData : machineryData}
        loading={loading}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        globalFilterFn={globalFilterFn}
        pageSizeOptions={[10, 20, 30, 50]}
      />

      {/* Modal de filtros */}
      <Dialog.Root open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-xl z-50 w-full max-w-2xl">
            <div className="p-8 card-theme rounded-2xl">
              <div className="flex justify-between items-center mb-8">
                <Dialog.Title className="text-2xl font-bold text-primary">Filtros</Dialog.Title>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="text-secondary hover:text-primary"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Machinery Type */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-3">
                    Tipo de Maquinaria
                  </label>
                  <select
                    value={machineryTypeFilter}
                    onChange={(e) => setMachineryTypeFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none"
                  >
                    <option value=""></option>
                    {uniqueMachineryTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tenure */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-3">
                    Tenencia
                  </label>
                  <select
                    value={tenureFilter}
                    onChange={(e) => setTenureFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none"
                  >
                    <option value=""></option>
                    {uniqueTenures.map((tenure) => (
                      <option key={tenure} value={tenure}>
                        {tenure}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Operative Status */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-3">
                    Estado Operativo
                  </label>
                  <select
                    value={operativeStatusFilter}
                    onChange={(e) => setOperativeStatusFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none"
                  >
                    <option value=""></option>
                    {uniqueOperativeStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Acquisition Date */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-3">
                    Fecha de Adquisición
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={acquisitionDateFilter}
                      onChange={(e) => setAcquisitionDateFilter(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent pr-12"
                    />
                    <FaCalendarAlt className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
                >
                  Limpiar
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <MultiStepFormModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

      <MachineryDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        selectedMachine={selectedMachine}
        formatDate={formatDate}
      />
    </div>
  )
}

export default MachineryMainView
