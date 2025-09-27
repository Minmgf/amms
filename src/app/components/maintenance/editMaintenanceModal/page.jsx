'use client'
import React, { useEffect, useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import axios from 'axios'

// Endpoint base
const BASE_URL = 'https://api.inmero.co/sigma/main/maintenance/'

export default function EditMaintenanceModal({
  open,
  onClose,
  onUpdated,                 // callback para recargar la lista
  maintenance,               // fila seleccionada
  typeOptions = [],          // [{ id, label }]
  statusOptions = []         // [{ id:1,label:'Habilitado' },{ id:2,label:'Deshabilitado' }]
}) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    id_tipo_mantenimiento: '',  // string (para <select>)
    responsible_user: '',       // string (pk en input number)
    id_estado: '',              // string (para <select>)
    estado: 'Habilitado'
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Helper: busca option por label y devuelve id
  const findTypeIdByLabel = (label) => (
    typeOptions.find(t => t.label === label)?.id
  )
  const findStatusIdByLabel = (label) => (
    statusOptions.find(s => s.label === label)?.id
  )

  // Cargar detalle real del mantenimiento al abrir (para traer responsible_user e ids reales)
  useEffect(() => {
    const loadDetail = async () => {
      if (!open || !maintenance?.id_maintenance) return
      setError(null)
      setLoadingDetail(true)
      try {
        const { data } = await axios.get(`${BASE_URL}${maintenance.id_maintenance}/`)

        // Derivar IDs de tipo y estado
        const typeId =
          data.maintenance_type ?? data.id_tipo_mantenimiento ??
          findTypeIdByLabel(data.tipo_mantenimiento) ??
          findTypeIdByLabel(maintenance?.tipo_mantenimiento) ?? ''

        const statusId =
          data.id_estado ??
          findStatusIdByLabel(data.estado) ??
          findStatusIdByLabel(maintenance?.estado) ?? ''

        setForm({
          name: data.name ?? maintenance?.name ?? '',
          description: (data.description ?? maintenance?.description ?? ''),
          id_tipo_mantenimiento: typeId ? String(typeId) : '',
          responsible_user: data.responsible_user ? String(data.responsible_user) : '',
          id_estado: statusId ? String(statusId) : '',
          estado: data.estado ?? maintenance?.estado ?? 'Habilitado'
        })
      } catch (e) {
        // Si el GET de detalle falla, al menos precarga desde la fila
        setForm(f => ({
          ...f,
          name: maintenance?.name ?? '',
          description: maintenance?.description ?? '',
          id_tipo_mantenimiento:
            maintenance?.id_tipo_mantenimiento
              ? String(maintenance.id_tipo_mantenimiento)
              : (findTypeIdByLabel(maintenance?.tipo_mantenimiento) ? String(findTypeIdByLabel(maintenance?.tipo_mantenimiento)) : ''),
          responsible_user: maintenance?.responsible_user ? String(maintenance.responsible_user) : '',
          id_estado:
            maintenance?.id_estado
              ? String(maintenance.id_estado)
              : (findStatusIdByLabel(maintenance?.estado) ? String(findStatusIdByLabel(maintenance?.estado)) : ''),
          estado: maintenance?.estado ?? 'Habilitado'
        }))
        setError('No se pudo cargar el detalle. Puedes intentar editar igualmente.')
        console.warn('GET detail error ->', e?.response?.data || e)
      } finally {
        setLoadingDetail(false)
      }
    }
    loadDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, maintenance?.id_maintenance])

  const onChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const payload = useMemo(() => {
    const maintenance_type = form.id_tipo_mantenimiento ? Number(form.id_tipo_mantenimiento) : undefined
    const responsible_user = form.responsible_user ? Number(form.responsible_user) : undefined
    const id_estado = form.id_estado ? Number(form.id_estado) : undefined

    // Mapear texto del estado por conveniencia (1/2)
    let estadoTxt = form.estado
    if (id_estado === 1) estadoTxt = 'Habilitado'
    if (id_estado === 2) estadoTxt = 'Deshabilitado'

    // HU indica PUT con: name, description, maintenance_type, responsible_user
    const base = {
      name: form.name,
      description: form.description || '',
      maintenance_type,  
      responsible_user
    }
    if (id_estado) {
      return { ...base, id_estado, estado: estadoTxt }
    }
    return base
  }, [form])

  const doPut = async (body) => {
    return axios.put(
      `${BASE_URL}${maintenance.id_maintenance}/`,
      body,
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!maintenance?.id_maintenance) {
      setError('Missing maintenance id.')
      return
    }
    if (!payload.maintenance_type || !payload.responsible_user) {
      setError('Maintenance type and responsible user are required.')
      return
    }

    setSubmitting(true); setError(null)
    try {
      await doPut(payload)
      onUpdated?.()
      onClose()
    } catch (err) {
      // Si el backend rechaza id_estado/estado, reintentamos sin status
      const data = err?.response?.data
      const text = typeof data === 'string' ? data : JSON.stringify(data || {})
      const complainsStatus = /id_estado|estado/i.test(text)

      if (complainsStatus && ('id_estado' in payload || 'estado' in payload)) {
        try {
          const { id_estado, estado, ...withoutStatus } = payload
          await doPut(withoutStatus)
          onUpdated?.()
          onClose()
          return
        } catch (e2) {
          setError(formatErr(e2))
          console.warn('PUT retry without status →', e2?.response?.data || e2)
        }
      } else {
        setError(formatErr(err))
      }
      console.warn('PUT update error →', err?.response?.data || err)
    } finally {
      setSubmitting(false)
    }
  }

  const formatErr = (err) => {
    const status = err?.response?.status
    const data = err?.response?.data
    return status
      ? `${status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`
      : `Request failed: ${err?.message}`
  }

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-xl z-50 w-full max-w-md"
          aria-describedby="edit-maintenance-desc"
        >
          <div className="p-6 bg-white rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-semibold">Edit maintenance</Dialog.Title>
              <button onClick={onClose} className="text-gray-600 hover:text-black">×</button>
            </div>
            <Dialog.Description id="edit-maintenance-desc" className="sr-only">
              Use this form to edit a maintenance configuration.
            </Dialog.Description>

            {loadingDetail && (
              <div className="mb-3 text-sm text-gray-500">Loading current data…</div>
            )}

            {error && (
              <div className="mb-4 bg-red-50 text-red-700 border border-red-200 p-2 rounded">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => onChange('name', e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => onChange('description', e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Maintenance type</label>
                <select
                  value={form.id_tipo_mantenimiento}
                  onChange={e => onChange('id_tipo_mantenimiento', e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  required
                >
                  <option value="" disabled>Select…</option>
                  {typeOptions.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Will send: <code>maintenance_type = {form.id_tipo_mantenimiento || '—'}</code>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Responsible user (ID)</label>
                <input
                  type="number"
                  min="1"
                  value={form.responsible_user}
                  onChange={e => onChange('responsible_user', e.target.value)}
                  placeholder="Enter a valid user ID"
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={form.id_estado}
                  onChange={e => onChange('id_estado', e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="">Select…</option>
                  {statusOptions.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  (Optional) If your API updates status via toggle, puedes dejar este campo vacío.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800 disabled:opacity-60"
                  disabled={submitting}
                >
                  {submitting ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
