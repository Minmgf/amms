'use client'

import TableList from '@/app/components/shared/TableList'
import React, { useState, useMemo, useEffect } from 'react'
import { CiFilter } from 'react-icons/ci'
import {
  FaPen, FaPlus, FaTimes, FaCog, FaTag, FaCheckCircle,
  FaTools, FaWrench, FaCheck, FaTrash
} from 'react-icons/fa'
import * as Dialog from '@radix-ui/react-dialog'
import { FiLayers } from 'react-icons/fi'
import { IoCalendarOutline } from 'react-icons/io5'
import { getMaintenanceList } from '@/services/maintenanceService'

// IMPORTA el modal de creación
import CreateMaintenanceModal from '@/app/components/maintenance/maintenanceManagementModal/page' 
import MachineryDetailsModal from '@/app/components/machinery/machineryDetails/MachineryDetailsModal'

const GestorMantenimientos = () => {
  // --------- Estado general
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [maintenanceData, setMaintenanceData] = useState([])
  const [error, setError] = useState(null)

  // --------- Filtros
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [maintenanceTypeFilter, setMaintenanceTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [filteredData, setFilteredData] = useState([])

  // --------- Modal crear
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // --------- Datos para selects de filtros
  const [availableMaintenanceTypes, setAvailableMaintenanceTypes] = useState([])
  const [availableStatuses, setAvailableStatuses] = useState([])

  // --------- Endpoints
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, '') ||
    'https://api.inmero.co/sigma/main'

  const LIST_ENDPOINT =
    process.env.NEXT_PUBLIC_LIST_MAINTENANCE_ENDPOINT ||
    `${API_BASE}/maintenance/`

  // --------- Efectos
  useEffect(() => {
    loadMaintenanceData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    applyFilters()
  }, [maintenanceData, maintenanceTypeFilter, statusFilter])

        try {
            const response = await getMaintenanceList();

            if (response && Array.isArray(response)) {
                setMaintenanceData(response)

                // Extraer tipos de mantenimiento únicos para filtros
                const uniqueTypes = [...new Set(response.map(item => item.tipo_mantenimiento).filter(Boolean))]
                setAvailableMaintenanceTypes(uniqueTypes)

                // Extraer estados únicos para filtros
                const uniqueStatuses = [...new Set(response.map(item => item.estado).filter(Boolean))]
                setAvailableStatuses(uniqueStatuses)
            } else {
                setError('Formato de datos inesperado del servidor.')
            }
        } catch (err) {
            setError('Error al cargar los datos de mantenimientos. Por favor, intenta de nuevo.')
        } finally {
            setLoading(false)
        }
    }
  }

  // --------- Filtros
  const applyFilters = () => {
    let filtered = maintenanceData
    if (maintenanceTypeFilter) {
      filtered = filtered.filter(
        (m) => m.tipo_mantenimiento === maintenanceTypeFilter
      )
    }
    if (statusFilter) {
      filtered = filtered.filter((m) => m.estado === statusFilter)
    }
    setFilteredData(filtered)
  }

  const handleApplyFilters = () => {
    applyFilters()
    setIsFilterModalOpen(false)
  }

  const handleClearFilters = () => {
    setMaintenanceTypeFilter('')
    setStatusFilter('')
    applyFilters()
  }

  // --------- Helpers visuales
  const getStatusColor = (status) => {
    const colors = {
      Habilitado: 'bg-green-100 text-green-800',
      Deshabilitado: 'bg-red-100 text-red-800',
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-red-100 text-red-800',
      Activo: 'bg-green-100 text-green-800',
      Inactivo: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusDisplayText = (apiStatus) => {
    // API viene “Habilitado/Deshabilitado”
    if (apiStatus === 'Habilitado') return 'Active'
    if (apiStatus === 'Deshabilitado') return 'Inactive'
    return apiStatus
  }

  const getMaintenanceTypeColor = () => '' // placeholder por si luego quieres chips por tipo

  // --------- Búsqueda global para TanStack Table
  const globalFilterFn = useMemo(() => {
    return (row, _columnId, filterValue) => {
      if (!filterValue) return true
      const searchTerm = filterValue.toLowerCase().trim()
      if (!searchTerm) return true

      const m = row.original
      const searchable = [
        m.id_maintenance?.toString(),
        m.name,
        m.description,
        m.estado,
        m.tipo_mantenimiento,
      ]
      return searchable.some((f) => f?.toString().toLowerCase().includes(searchTerm))
    }
  }, [])

  // --------- Columnas
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: () => (
          <div className="flex items-center gap-2">
            <FaWrench className="w-4 h-4" />
            Nombre del Mantenimiento
          </div>
        ),
        cell: ({ row }) => {
          const m = row.original
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                <FaWrench className="w-4 h-4 text-gray-400" />
              </div>
              <div className="font-medium parametrization-text">
                {m.name || 'N/A'}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'description',
        header: () => (
          <div className="flex items-center gap-2">
            <FaTag className="w-4 h-4" />
            Descripción
          </div>
        ),
        cell: ({ row }) => (
          <div
            className="text-sm parametrization-text max-w-xs truncate"
            title={row.getValue('description')}
          >
            {row.getValue('description') || 'N/A'}
          </div>
        ),
      },
      {
        accessorKey: 'tipo_mantenimiento',
        header: () => (
          <div className="flex items-center gap-2">
            <FaCog className="w-4 h-4" />
            Tipo de Mantenimiento
          </div>
        ),
        cell: ({ row }) => {
          const type = row.getValue('tipo_mantenimiento')
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMaintenanceTypeColor(
                type
              )}`}
            >
              {type || 'N/A'}
            </span>
          )
        },
      },
      {
        accessorKey: 'estado',
        header: () => (
          <div className="flex items-center gap-2">
            <FaCheckCircle className="w-4 h-4" />
            Estado
          </div>
        ),
        cell: ({ row }) => {
          const status = row.getValue('estado')
          const displayText = getStatusDisplayText(status)
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                displayText
              )}`}
            >
              {displayText || 'N/A'}
            </span>
          )
        },
      },
      {
        id: 'actions',
        header: () => (
          <div className="flex items-center gap-2">
            <FaTools className="w-4 h-4" />
            Acciones
          </div>
        ),
        cell: ({ row }) => {
          const m = row.original
          const isActive = m.estado === 'Habilitado'
          return (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => handleEdit(m)}
                className="inline-flex items-center px-3 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-gray-500 hover:text-gray-600"
                title="Editar mantenimiento"
              >
                <FaPen className="w-3 h-3" />
                Edit
              </button>

              {isActive && (
                <button
                  onClick={() => handleDelete(m)}
                  className="inline-flex items-center px-3 py-1.5 gap-2 border text-xs font-medium rounded border-red-300 bg-red-50 text-red-600 hover:border-red-500 hover:bg-red-100"
                  title="Eliminar mantenimiento"
                >
                  <FaTrash className="w-3 h-3" />
                  Delete
                </button>
              )}

              {!isActive && (
                <button
                  onClick={() => handleEnable(m)}
                  className="inline-flex items-center px-3 py-1.5 gap-2 border text-xs font-medium rounded border-green-300 bg-green-50 text-green-600 hover:border-green-500 hover:bg-green-100"
                  title="Habilitar mantenimiento"
                >
                  <FaCheck className="w-3 h-3" />
                  Enable
                </button>
              )}
            </div>
          )
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // --------- Acciones (placeholder hasta que tengas endpoints PUT/DELETE)
  const handleEdit = (m) => {
    alert(`(Pendiente) Editar mantenimiento: ${m.name}`)
  }

  const handleDelete = async (m) => {
    if (!confirm(`¿Eliminar "${m.name}"?`)) return
    // Aquí iría DELETE al backend — temporalmente solo quitamos del estado
    setMaintenanceData((prev) =>
      prev.filter((it) => it.id_maintenance !== m.id_maintenance)
    )
    alert('Mantenimiento eliminado (local).')
  }

  const handleEnable = async (m) => {
    if (!confirm(`¿Habilitar "${m.name}"?`)) return
    // Aquí iría PATCH/PUT al backend — temporalmente actualizamos estado local
    setMaintenanceData((prev) =>
      prev.map((it) =>
        it.id_maintenance === m.id_maintenance
          ? { ...it, estado: 'Habilitado', id_estado: 1 }
          : it
      )
    )
    alert('Mantenimiento habilitado (local).')
  }

  // --------- Refresh tras crear
  const handleCreatedMaintenance = () => {
    loadMaintenanceData()
  }

  // --------- Render
  return (
    <div style={{ position: 'fixed', right: 16, top: 16, zIndex: 100010 }}>
      {items.map(n => (
        <div
          key={n.id}
          style={{
            minWidth: 260, maxWidth: 360, marginBottom: 8, padding: '10px 12px',
            borderRadius: 10, boxShadow: '0 6px 20px rgba(0,0,0,.25)',
            color: '#fff',
            background: n.type === 'success' ? '#16a34a' : n.type === 'error' ? '#dc2626' : '#111827'
          }}
          role="status" aria-live="polite"
        >
          <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{ lineHeight: 1.25 }}>{n.text}</div>
            <button onClick={() => onClose(n.id)} style={{ opacity: .85 }}>×</button>
          </div>
        </div>
      ))}
    </div>
  )
}
function useNotifier() {
  const [notes, setNotes] = useState([])
  const nextId = useRef(0)
  const close = (id) => setNotes(prev => prev.filter(n => n.id !== id))
  const notify = ({ type = 'info', text = '', ttl = 2800 }) => {
    const id = ++nextId.current
    setNotes(prev => [...prev, { id, type, text }])
    setTimeout(() => close(id), ttl)
  }
  return { notes, notify, close }
}

/* =============================================================================
   PORTAL & MODALES (sin libs)
============================================================================= */
function ModalPortal({ children }) {
  if (typeof window === 'undefined') return null
  return createPortal(children, document.body)
}

function BaseOverlay({ children }) {
  const content = (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100000,
        background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(2px)',
        display: 'grid', placeItems: 'center'
      }}
    >
      {children}
    </div>
  )
  return <ModalPortal>{content}</ModalPortal>
}

function ConfirmModal({ open, title, message, confirmText = 'Confirm', onConfirm, onClose }) {
  if (!open) return null
  return (
    <BaseOverlay>
      <div style={{ width: 420, borderRadius: 16, background: '#fff', padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,.35)' }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{title}</div>
        <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 18 }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #d1d5db' }}
          >
            Cancel
          </button>
          <button
            onClick={async () => { try { await onConfirm?.() } finally { onClose() } }}
            style={{ padding: '8px 14px', borderRadius: 8, background: '#000', color: '#fff' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </BaseOverlay>
  )
}

function WarningModal({ open, onAccept, onClose }) {
  if (!open) return null
  return (
    <BaseOverlay>
      <div style={{ width: 480, borderRadius: 16, background: '#fff', padding: 28, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,.35)' }}>
        <div
          style={{
            width: 72, height: 72, borderRadius: 9999, background: '#fee2e2',
            margin: '0 auto 14px', display: 'grid', placeItems: 'center', color: '#ef4444', fontSize: 34, fontWeight: 800
          }}
        >
          !
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Warning</div>
        <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.45 }}>
          This maintenance is associated with requests or scheduled maintenance.
          It cannot be deleted, but it will be <b>deactivated</b> so it won’t be available on future forms.
        </p>
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center', gap: 10 }}>
          <button
            onClick={onClose}
            style={{ padding: '10px 18px', borderRadius: 10, background: '#e5e7eb', color: '#111827' }}
          >
            Cancel
          </button>
          <button
            onClick={async () => { try { await onAccept?.() } finally { onClose() } }}
            style={{ padding: '10px 18px', borderRadius: 10, background: '#111827', color: '#fff' }}
          >
            Accept
          </button>
        </div>
      </div>
    </BaseOverlay>
  )
}

/* =============================================================================
   API CONFIG
============================================================================= */
const API_BASE = 'https://api.inmero.co/sigma/main/maintenance/'
const RAW_BASE = API_BASE.endsWith('/') ? API_BASE : API_BASE + '/'
const ALT_BASE = RAW_BASE.replace('/sigma/main/maintenance/', '/maintenance/')

const tryPatchFirstOk = async (urls) => {
  let lastErr
  for (const u of urls) {
    try {
      const res = await axios.patch(u, {}, { headers: { 'Content-Type': 'application/json' } })
      // LOG éxito de endpoint
      console.log('[MM] PATCH toggle OK →', u, 'data:', res.data)
      return res
    } catch (e) { lastErr = e }
  }
  throw lastErr
}

/* =============================================================================
   PAGE
============================================================================= */
export default function MaintenanceManagement() {
  const { notes, notify, close } = useNotifier()

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [globalFilter, setGlobalFilter] = useState('')

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selected, setSelected] = useState(null)

  // Confirmaciones
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', confirmText: 'Confirm', onConfirm: null })
  const [warn, setWarn] = useState({ open: false, onAccept: null })

  const isEnabled = (estado) => ['Habilitado', 'Activo', 'Active'].includes((estado || '').toString())

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const res = await axios.get(API_BASE)
      const arr = Array.isArray(res.data) ? res.data : (res.data?.results ?? [])
      // LOG de datos traídos
      console.log('[MM] GET /maintenance → raw:', res.data)
      console.log('[MM] Parsed list for table →', arr)
      setData(arr)
    } catch (err) {
      const msg = err?.response?.status
        ? `${err.response.status}: ${JSON.stringify(err.response.data)}`
        : err?.message
      setError(msg || 'Error loading list')
      notify({ type: 'error', text: 'Error loading list' })
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const detailMaintenance = async (id) => {
    const { data } = await axios.get(`${API_BASE}${id}/`)
    console.log('[MM] GET /maintenance/:id →', id, data)
    return data
  }

  const putWithEstado = async (id, estadoId, estadoTxt) => {
    const d = await detailMaintenance(id)
    const payload = {
      name: d.name,
      description: d.description ?? '',
      maintenance_type: d.maintenance_type ?? d.id_tipo_mantenimiento,
      responsible_user: d.responsible_user,
      id_estado: estadoId,
      estado: estadoTxt
    }
    console.log('[MM] PUT /maintenance/:id payload →', id, payload)
    await axios.put(`${API_BASE}${id}/`, payload, { headers: { 'Content-Type': 'application/json' } })
  }

  const toggleStatus = async (row, target = 'auto') => {
    const id = row.id_maintenance
    const urls = [
      `${RAW_BASE}${id}/toggle-status/`,
      `${RAW_BASE}${id}/toggle_status/`,
      `${ALT_BASE}${id}/toggle-status/`,
      `${ALT_BASE}${id}/toggle_status/`,
    ]
    const currentlyOn = isEnabled(row.estado)
    const wantEnable = target === 'enable' ? true : target === 'disable' ? false : !currentlyOn
    const optimistic = wantEnable ? 'Habilitado' : 'Deshabilitado'

    // optimistic UI
    setData(prev => prev.map(x => x.id_maintenance === id ? { ...x, estado: optimistic } : x))

    try {
      const res = await tryPatchFirstOk(urls)
      const msg = (res?.data?.message || '').toLowerCase()
      let finalEstado = optimistic
      if (msg.includes('activado')) finalEstado = 'Habilitado'
      if (msg.includes('desactivado')) finalEstado = 'Deshabilitado'

      setData(prev => prev.map(x => x.id_maintenance === id ? { ...x, estado: finalEstado } : x))
      notify({ type: 'success', text: finalEstado === 'Habilitado' ? 'Maintenance enabled' : 'Maintenance disabled' })
    } catch (err) {
      console.warn('[MM] PATCH toggle FAILED →', err?.response?.status, err?.response?.data || err)
      try {
        if (!wantEnable) {
          await putWithEstado(id, 2, 'Deshabilitado')
          setData(prev => prev.map(x => x.id_maintenance === id ? { ...x, estado: 'Deshabilitado' } : x))
          notify({ type: 'success', text: 'Maintenance disabled' })
        } else {
          await putWithEstado(id, 1, 'Habilitado')
          setData(prev => prev.map(x => x.id_maintenance === id ? { ...x, estado: 'Habilitado' } : x))
          notify({ type: 'success', text: 'Maintenance enabled' })
        }
      } catch (e2) {
        console.warn('[MM] PUT fallback FAILED →', e2?.response?.status, e2?.response?.data || e2)
        // rollback
        setData(prev => prev.map(x => x.id_maintenance === id ? { ...x, estado: currentlyOn ? 'Habilitado' : 'Deshabilitado' } : x))
        notify({ type: 'error', text: 'Could not change status' })
      }
    }
  }

  const handleDelete = async (row) => {
    const id = row.id_maintenance
    try {
      await axios.delete(`${API_BASE}${id}/`)
      console.log('[MM] DELETE /maintenance/:id OK →', id)
      setData(prev => prev.filter(x => x.id_maintenance !== id))
      notify({ type: 'success', text: 'Maintenance deleted' })
    } catch (err) {
      const code = err?.response?.status
      const body = err?.response?.data
      const bodyStr = typeof body === 'string' ? body : JSON.stringify(body || {})
      console.warn('[MM] DELETE failed →', code, body)

      const looksRelated =
        code === 400 || code === 409 || /associated|relacionad/i.test(bodyStr)

      if (looksRelated) {
        setWarn({
          open: true,
          onAccept: async () => { await toggleStatus(row, 'disable') }
        })
      } else {
        notify({ type: 'error', text: 'Could not delete maintenance' })
      }
    }
  }

  const columns = useMemo(() => [
    {
      accessorKey: 'id_maintenance',
      header: '#',
      cell: ({ row }) => row.original.id_maintenance ?? row.index + 1
    },
    {
      accessorKey: 'name',
      header: 'Maintenance name',
      cell: ({ row }) => row.original.name || '—'
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => <span title={row.original.description}>{row.original.description || '—'}</span>
    },
    {
      accessorKey: 'tipo_mantenimiento',
      header: 'Maintenance type',
      cell: ({ row }) => row.original.tipo_mantenimiento || row.original.maintenance_type_label || '—',
    },
    {
      accessorKey: 'estado',
      header: 'Status',
      cell: ({ row }) => {
        const s = row.original.estado
        const on = isEnabled(s)
        return (
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${on ? 'bg-green-100 text-green-700' : 'bg-pink-100 text-pink-700'}`}>
            {on ? 'Active' : 'Inactive'}
          </span>
        )
      }
    },
    {
      id: 'actions',
      header: () => <div className="flex items-center gap-2"><FaTools className="w-4 h-4" /> Actions</div>,
      cell: ({ row }) => {
        const m = row.original
        const on = isEnabled(m.estado)
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setSelected(m); setIsEditOpen(true) }}
              className="inline-flex items-center px-3 py-1.5 gap-2 border text-xs rounded border-gray-300 hover:border-gray-500"
            >
              <FaPen className="w-3 h-3" /> Edit
            </button>

            {/* Enable (solo si está inactivo) */}
            {!on && (
              <button
                onClick={() =>
                  setConfirm({
                    open: true,
                    title: 'Confirm Action',
                    message: 'Are you sure you want to activate this maintenance?',
                    confirmText: 'Confirm',
                    onConfirm: () => toggleStatus(m, 'enable')
                  })
                }
                className="inline-flex items-center px-3 py-1.5 text-xs rounded border border-green-300 bg-green-50 text-green-600 hover:border-green-500"
              >
                Enable
              </button>
            )}

            {/* Delete con confirmación */}
            <button
              onClick={() =>
                setConfirm({
                  open: true,
                  title: 'Confirm Delete',
                  message: 'This action cannot be undone.',
                  confirmText: 'Delete',
                  onConfirm: () => handleDelete(m)
                })
              }
              className="inline-flex items-center px-3 py-1.5 gap-2 border text-xs rounded border-red-300 hover:border-red-500 text-red-600"
            >
              <FaTrash className="w-3 h-3" /> Delete
            </button>
          </div>
        )
      }
    }
  ], [])

  const typeOptions = useMemo(() => {
    const uniq = [...new Set(data.map(d => d.tipo_mantenimiento).filter(Boolean))]
    return uniq.map((label, idx) => ({ id: idx + 1, label }))
  }, [data])

  const statusOptions = useMemo(() => ([
    { id: 1, label: 'Habilitado' },
    { id: 2, label: 'Deshabilitado' }
  ]), [])

  return (
    <div className="p-6">
      <Notifier items={notes} onClose={close} />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Maintenance Management</h1>
        <button onClick={() => setIsCreateOpen(true)} className="px-3 py-2 rounded bg-black text-white hover:bg-gray-800">
          + Add maintenance
        </button>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <input
          type="text"
          placeholder="Search by id, name, description…"
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          className="w-full sm:w-80 border px-3 py-2 rounded"
        />
        <button className="inline-flex items-center gap-2 border px-3 py-2 rounded">
          <CiFilter className="w-4 h-4" /> Filter by
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">
          {error}
        </div>
      )}

      <TableList
        columns={columns}
        data={useMemo(() => {
          const q = globalFilter.toLowerCase()
          return q
            ? data.filter(r =>
                (r.name?.toLowerCase()?.includes(q)) ||
                (r.description?.toLowerCase()?.includes(q)) ||
                (r.tipo_mantenimiento?.toLowerCase()?.includes(q)) ||
                (String(r.id_maintenance || r.id)?.includes(q))
              )
            : data
        }, [data, globalFilter])}
        loading={loading}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        pageSizeOptions={[10, 20, 30, 50]}
      />

      {/* Create */}
      {isCreateOpen && (
        <CreateMaintenanceModal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={load}
        />
      )}

      {/* Edit */}
      <EditMaintenanceModal
        open={isEditOpen}
        onClose={() => { setIsEditOpen(false); setSelected(null) }}
        onUpdated={() => { notify({ type: 'success', text: 'Maintenance updated' }); load() }}
        maintenance={selected}
        typeOptions={typeOptions}
        statusOptions={statusOptions}
      />

      {/* Confirm genérico */}
      <ConfirmModal
        open={!!confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmText={confirm.confirmText}
        onConfirm={confirm.onConfirm}
        onClose={() => setConfirm({ open: false, title: '', message: '', confirmText: 'Confirm', onConfirm: null })}
      />

      {/* Warning previo a delete cuando está relacionado -> desactivar */}
      <WarningModal
        open={!!warn.open}
        onAccept={warn.onAccept}
        onClose={() => setWarn({ open: false, onAccept: null })}
      />
    </div>
  )
}
