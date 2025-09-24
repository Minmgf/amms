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
import { Tab, Disclosure } from '@headlessui/react'
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

      {/* TODO: Agregar modales de detalles, edición y creación de maquinaria */}
      {/* Estos modales se crearán posteriormente siguiendo el mismo patrón de userManagement */}
      {/* Modal Detalle de Maquinaria */}
<Dialog.Root open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" />
    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
      w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-y-auto max-h-[90vh] z-[70]">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <Dialog.Title className="text-2xl font-medium">Detailed Information</Dialog.Title>
          <button onClick={() => setIsDetailsModalOpen(false)}>
            <FaTimes className="w-6 h-6 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* ============== DESKTOP (tu diseño tal cual) ============== */}
        <div className="hidden md:block">
          {/* --- TABS --- */}
          <Tab.Group>
            <Tab.List className="flex justify-center border-b border-[#737373] mb-6">
              {['General Information', 'Technical Specifications', 'Documents & Maintenance'].map(tab => (
                <Tab
                  key={tab}
                  className={({ selected }) =>
                    `w-40 px-4 py-2 -mb-px border-b-2 text-sm font-medium
                     whitespace-normal text-center leading-snug cursor-pointer
                     ${selected ? 'border-black text-black' : 'border-transparent text-gray-500'}`
                  }
                >
                  {tab}
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels>
              {/* === General Information (DESKTOP) === */}
              <Tab.Panel>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#737373] h-full rounded-md flex items-center justify-center">
                    <span className="text-white">Photo here</span>
                  </div>

                  <div className="border rounded-xl p-4 border-[#E5E7EB]">
                    <h3 className="font-semibold text-lg mb-3">General Data Sheet</h3>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between text-[#525252]">Serial Number:
                        <span className="font-[400] text-black">{selectedMachine?.serial_number}</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Name:
                        <span className="font-[400] text-black">{selectedMachine?.name}</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Brand:
                        <span className="font-[400] text-black">{selectedMachine?.brand}</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Model:
                        <span className="font-[400] text-black">{selectedMachine?.model}</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Manufacture Year:
                        <span className="font-[400] text-black">{selectedMachine?.year}</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Type:
                        <span className="font-[400] text-black">{selectedMachine?.type}</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Origin:
                        <span className="font-[400] text-black">{selectedMachine?.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ubication GPS */}
                <div className="mt-8">
                  <h3 className="font-semibold text-lg mb-2">Ubication GPS</h3>
                  <div className="border border-[#E5E7EB] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-medium text-emerald-700">ACTIVE</span>
                      </span>
                      <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 px-3 py-1.5 text-xs font-medium">
                        {selectedMachine?.location || 'Bogotá, Colombia'}
                      </span>
                    </div>
                    <div className="w-full h-56 md:h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">Map placeholder</span>
                    </div>
                  </div>
                </div>

                {/* Tracker & Usage (cards) */}
                <div className="grid md:grid-cols-2 gap-6 mt-5">
                  <div className="border rounded-xl p-4 border-[#E5E7EB]">
                    <h4 className="font-semibold mb-3">Tracker Data Sheet</h4>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between text-[#525252]">GPS Serial Number:
                        <span className="font-[400] text-black">—</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Chassis Number:
                        <span className="font-[400] text-black">—</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Engine Number:
                        <span className="font-[400] text-black">—</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-xl p-4 border-[#E5E7EB]">
                    <h4 className="font-semibold mb-3">Usage Information</h4>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between text-[#525252]">Acquisition Date:
                        <span className="font-[400] text-black">{formatDate(selectedMachine?.acquisition_date)}</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Usage Status:
                        <span className="font-[400] text-black">{selectedMachine?.status}</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Tenure:
                        <span className="font-[400] text-black">{selectedMachine?.tenure}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Tab.Panel>

              {/* === Technical Specifications (DESKTOP) === */}
              <Tab.Panel>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Capacity and Performance */}
                  <div className="border rounded-xl p-4 border-[#E5E7EB]">
                    <h3 className="font-semibold text-lg mb-3">Capacity and Performance</h3>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between text-[#525252]">Tank Capacity:
                        <span className="font-[400] text-black">410 L</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Carrying Capacity:
                        <span className="font-[400] text-black">1.2 m³</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Operating Weight:
                        <span className="font-[400] text-black">20,500 kg</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Max Speed:
                        <span className="font-[400] text-black">5.5 km/h</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Draft Force:
                        <span className="font-[400] text-black">186 kN</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Max Operating Altitude:
                        <span className="font-[400] text-black">4,500 m</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Min Performance:
                        <span className="font-[400] text-black">500 kg</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Max Performance:
                        <span className="font-[400] text-black">3,600 kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Dimensions and Weight */}
                  <div className="border rounded-xl p-4 border-[#E5E7EB]">
                    <h3 className="font-semibold text-lg mb-3">Dimensions and Weight</h3>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between text-[#525252]">Length:
                        <span className="font-[400] text-black">9.75 m</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Width:
                        <span className="font-[400] text-black">2.65 m</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Height:
                        <span className="font-[400] text-black">3.15 m</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Net Weight:
                        <span className="font-[400] text-black">19,800 kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Auxiliary and Hydraulic Systems */}
                  <div className="border rounded-xl p-4 border-[#E5E7EB]">
                    <h3 className="font-semibold text-lg mb-3">Auxiliary and Hydraulic Systems</h3>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between text-[#525252]">Air Conditioning:
                        <span className="font-[400] text-black">Automatic A/C</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">A/C Consumption:
                        <span className="font-[400] text-black">2.5 L/h</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Hydraulic Pressure:
                        <span className="font-[400] text-black">350 bar</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Pump Flow Rate:
                        <span className="font-[400] text-black">265 L/min</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Hydraulic Reservoir Capacity:
                        <span className="font-[400] text-black">240 L</span>
                      </div>
                    </div>
                  </div>

                  {/* Engine and Transmission */}
                  <div className="border rounded-xl p-4 border-[#E5E7EB]">
                    <h3 className="font-semibold text-lg mb-3">Engine and Transmission</h3>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between text-[#525252]">Engine Power:
                        <span className="font-[400] text-black">158 HP</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Engine Type:
                        <span className="font-[400] text-black">Diesel Turbo</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Cylinder Capacity:
                        <span className="font-[400] text-black">6.8 L</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Number of cylinders & arrangement:
                        <span className="font-[400] text-black">6 en línea</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Traction:
                        <span className="font-[400] text-black">Orugas</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Fuel Consumption:
                        <span className="font-[400] text-black">18 L/h</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Transmission System:
                        <span className="font-[400] text-black">Hidrostática</span>
                      </div>
                    </div>
                  </div>

                  {/* Regulations and Safety */}
                  <div className="border rounded-xl p-4 border-[#E5E7EB]">
                    <h3 className="font-semibold text-lg mb-3">Regulations and Safety</h3>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between text-[#525252]">Emissions Level:
                        <span className="font-[400] text-black">Euro 1</span>
                      </div>
                      <div className="flex justify-between text-[#525252]">Cabin Type:
                        <span className="font-[400] text-black">ROPS/FOPS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Tab.Panel>

              {/* === Documents & Maintenance (DESKTOP) === */}
              <Tab.Panel>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border rounded-xl p-4 border-[#E5E7EB]">
                    <h3 className="font-semibold text-lg mb-3">Documentation</h3>
                    <ul className="flex flex-col gap-3">
                      <li className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E7EB] hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <FiFileText className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="text-sm text-[#525252]">Operator's Manual</span>
                        </div>
                        <button className="p-2 rounded-md hover:bg-gray-100" title="Download">
                          <FiDownload className="w-5 h-5 text-gray-600" />
                        </button>
                      </li>
                      <li className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E7EB] hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <FiFileText className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="text-sm text-[#525252]">Import Certificate</span>
                        </div>
                        <button className="p-2 rounded-md hover:bg-gray-100" title="Download">
                          <FiDownload className="w-5 h-5 text-gray-600" />
                        </button>
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-xl p-4 border-[#E5E7EB]">
                    <h3 className="font-semibold text-lg mb-3">Periodic Maintenance</h3>
                    <ul className="flex flex-col gap-3">
                      {[
                        ['Oil Change','250 hrs'],
                        ['Hydraulic Filter','1000 hrs'],
                        ['General Inspection','500 hrs'],
                        ['Engine Overhaul','2000 hrs'],
                      ].map(([label,hours]) => (
                        <li key={label} className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E7EB] hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                              <FaTools className="w-4 h-4 text-gray-600" />
                            </div>
                            <span className="text-sm text-[#525252]">{label}</span>
                          </div>
                          <span className="text-xs text-gray-500">{hours}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>

        {/* ============== MOBILE (nuevo layout, no cambia desktop) ============== */}
        <div className="md:hidden">
          {/* Header visual ya está arriba, aquí va el contenido apilado */}
          {/* Imagen / placeholder */}
          <div className="w-full aspect-[16/9] bg-gray-200 rounded-lg flex items-center justify-center mb-4">
            <span className="text-gray-400">Photo here</span>
          </div>

          {/* General Technical Data */}
          <h3 className="text-xl font-semibold mb-3">General Technical Data</h3>
          <div className="border rounded-xl overflow-hidden">
            {[
              ['Name', selectedMachine?.name || '—'],
              ['Brand', selectedMachine?.brand || '—'],
              ['Model', selectedMachine?.model || '—'],
              ['Facturate In', selectedMachine?.year || '—'],
              ['Type', selectedMachine?.type || '—'],
              ['Manufacturer', 'Caterpillar Inc.'],              // placeholder si no tienes dato
              ['Serial Number', selectedMachine?.serial_number || '—'],
              ['Origin City', selectedMachine?.location || '—'],
              ['Tariff Subheading', '8429.11.00'],              // placeholder
              ['Machine Type', 'Crawler Tractor'],              // placeholder
            ].map(([label, value], idx) => (
              <div key={label} className={`flex items-center justify-between px-4 py-3 ${idx !== 0 ? 'border-t' : ''} border-gray-200`}>
                <span className="text-sm text-gray-600">{label}</span>
                <span className="text-sm text-gray-900">{value}</span>
              </div>
            ))}
          </div>

          {/* Mapa + badges */}
          <div className="mt-4">
            <div className="w-full aspect-[16/9] bg-gray-200 rounded-lg relative overflow-hidden">
              {/* Badges abajo como en el prototipo */}
              <div className="absolute bottom-2 left-2 inline-flex items-center gap-2 bg-white px-2.5 py-1 rounded-full shadow border">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-gray-700">Now in production</span>
              </div>
              <div className="absolute bottom-2 right-2 inline-flex items-center gap-2 bg-white px-2.5 py-1 rounded-full shadow border">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-xs text-gray-700">In Rivera</span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-400">Map placeholder</span>
              </div>
            </div>
          </div>

          {/* Accordion: Tracker Technical Data */}
          <Disclosure defaultOpen>
            {({ open }) => (
              <div className="mt-4 border rounded-xl overflow-hidden">
                <Disclosure.Button className="w-full flex items-center justify-between px-4 py-3">
                  <span className="font-semibold">Tracker Technical Data</span>
                  <FiChevronDown className={`transition ${open ? 'rotate-180' : ''}`} />
                </Disclosure.Button>
                <Disclosure.Panel>
                  {[
                    ['Terminal Serial Number', 'TRK-2024-987654'],
                    ['GPS Device Serial Number', 'GPS-AXT-56789'],
                    ['Chassis Number', '1HGBH41JXMN019186'],
                    ['Engine Number', 'D13-7654321'],
                  ].map(([label, value], idx) => (
                    <div key={label} className={`flex items-center justify-between px-4 py-3 ${idx !== 0 ? 'border-t' : ''} border-gray-200`}>
                      <span className="text-sm text-gray-600">{label}</span>
                      <span className="text-sm text-gray-900">{value}</span>
                    </div>
                  ))}
                </Disclosure.Panel>
              </div>
            )}
          </Disclosure>

          {/* Accordion: Usage Information */}
          <Disclosure defaultOpen>
            {({ open }) => (
              <div className="mt-3 border rounded-xl overflow-hidden">
                <Disclosure.Button className="w-full flex items-center justify-between px-4 py-3">
                  <span className="font-semibold">Usage Information</span>
                  <FiChevronDown className={`transition ${open ? 'rotate-180' : ''}`} />
                </Disclosure.Button>
                <Disclosure.Panel>
                  {[
                    ['Acquisition date', formatDate(selectedMachine?.acquisition_date) || '—'],
                    ['Usage status', selectedMachine?.status || '—'],
                    ['Used hours', '—'],
                    ['Mileage', '—'],
                    ['Tenure', selectedMachine?.tenure || '—'],
                    ['Ending contract date', 'N/A'],
                  ].map(([label, value], idx) => (
                    <div key={label} className={`flex items-center justify-between px-4 py-3 ${idx !== 0 ? 'border-t' : ''} border-gray-200`}>
                      <span className="text-sm text-gray-600">{label}</span>
                      <span className="text-sm text-gray-900">{value}</span>
                    </div>
                  ))}
                </Disclosure.Panel>
              </div>
            )}
          </Disclosure>

          {/* Accordion: Specific Technical Data */}
          <Disclosure>
            {({ open }) => (
              <div className="mt-3 border rounded-xl overflow-hidden">
                <Disclosure.Button className="w-full flex items-center justify-between px-4 py-3">
                  <span className="font-semibold">Specific Technical Data</span>
                  <FiChevronDown className={`transition ${open ? 'rotate-180' : ''}`} />
                </Disclosure.Button>
                <Disclosure.Panel>
                  {[
                    ['Engine Power', '158 HP'],
                    ['Hydraulic Pressure', '350 bar'],
                    ['Pump Flow Rate', '265 L/min'],
                  ].map(([label, value], idx) => (
                    <div key={label} className={`flex items-center justify-between px-4 py-3 ${idx !== 0 ? 'border-t' : ''} border-gray-200`}>
                      <span className="text-sm text-gray-600">{label}</span>
                      <span className="text-sm text-gray-900">{value}</span>
                    </div>
                  ))}
                </Disclosure.Panel>
              </div>
            )}
          </Disclosure>

          {/* Documentation */}
          <div className="mt-3 border rounded-xl overflow-hidden">
            <div className="px-4 py-3 font-semibold">Documentation</div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <span className="text-sm text-gray-600">Operational manual</span>
              <button className="px-3 py-1.5 rounded-md text-white bg-black text-sm">View</button>
            </div>
          </div>

          {/* Periodic maintenance (lista tipo chips) */}
          <div className="mt-3">
            <div className="font-semibold mb-2">Periodic maintenance</div>
            <div className="space-y-2">
              {[
                ['Oil level check', '50 hours'],
                ['Transmission oil and filter change', '500 hours'],
                ['Radiator cleaning', '2000 hours'],
              ].map(([task, hours]) => (
                <div key={task} className="flex items-center justify-between bg-gray-100 rounded-full px-3 py-2">
                  <span className="text-sm text-gray-700 truncate">{task}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-white rounded-full px-2 py-0.5 text-gray-600 border">{hours}</span>
                    <button className="text-xs px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">Delete</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-3 w-full rounded-md bg-gray-400/80 text-white py-2">Submit</button>
          </div>
        </div>
        {/* ============== FIN MOBILE ============== */}
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>




    </div>
  )
}

export default MachineryMainView
