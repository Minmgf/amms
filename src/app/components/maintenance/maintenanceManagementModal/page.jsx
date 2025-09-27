'use client'

import React, { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import axios from 'axios'

export default function CreateMaintenanceModal({
  open,
  onClose,
  onCreated,
  statusOptions = [
    { id: 1, label: 'Habilitado' },
    { id: 2, label: 'Deshabilitado' },
  ],
}) {
  // Endpoints de producción
  const CREATE_URL = 'https://api.inmero.co/sigma/main/maintenance/'
  const TYPES_URL = 'https://api.inmero.co/sigma/main/types/list/active/12/'

  // State hooks
  const [types, setTypes] = useState([])
  const [loadingTypes, setLoadingTypes] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    maintenance_type: '',
    responsible_user: '',
    id_estado: 1,
  })

  // Helper functions
  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const formatBackendErrors = (data) => {
    try {
      if (!data) return null
      const lines = []
      if (data.message) lines.push(String(data.message))
      if (data.errors && typeof data.errors === 'object') {
        for (const [key, value] of Object.entries(data.errors)) {
          lines.push(`${key}: ${Array.isArray(value) ? value.join(' | ') : String(value)}`)
        }
      }
      return lines.length ? lines.join('\n') : (typeof data === 'string' ? data : JSON.stringify(data))
    } catch {
      return null
    }
  }

  // Effects
  useEffect(() => {
    if (!open) return
    setError(null)
    setLoadingTypes(true)

    axios
      .get(TYPES_URL)
      .then((res) => {
        const arr = Array.isArray(res.data) ? res.data : res.data?.results ?? []
        const mapped = arr
          .map((t) => ({
            id: t.id ?? t.pk ?? t.value,
            label: t.name ?? t.nombre ?? t.label ?? `Tipo ${t.id}`,
          }))
          .filter((t) => t.id != null)

        setTypes(mapped)
        if (mapped.length && !form.maintenance_type) {
          setForm((prev) => ({ ...prev, maintenance_type: String(mapped[0].id) }))
        }
      })
      .catch((err) => {
        console.error('Error cargando tipos', err)
        setError('No se pudieron cargar los tipos de mantenimiento.')
      })
      .finally(() => setLoadingTypes(false))
  }, [open])

  // Handlers
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const maintenance_type = Number(form.maintenance_type)
    const responsible_user = Number(form.responsible_user)
    const id_estado = Number(form.id_estado) || 1

    if (!form.name.trim()) return setError('El nombre es obligatorio.')
    if (!Number.isFinite(maintenance_type)) return setError('Selecciona un tipo de mantenimiento válido.')
    if (!Number.isFinite(responsible_user) || responsible_user <= 0)
      return setError('Ingresa un ID de responsable válido (> 0).')

    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || '',
      maintenance_type,
      responsible_user,
      id_estado,
    }

    setSubmitting(true)
    try {
      const resp = await axios.post(CREATE_URL, payload, {
        headers: { 'Content-Type': 'application/json' },
      })

      setForm({
        name: '',
        description: '',
        maintenance_type: types[0]?.id ? String(types[0].id) : '',
        responsible_user: '',
        id_estado: 1,
      })
      onCreated && onCreated(resp.data)
      onClose && onClose()
    } catch (err) {
      const status = err?.response?.status
      const data = err?.response?.data
      const pretty = formatBackendErrors(data)
      setError(status ? `Error ${status} al crear:\n${pretty || '(sin detalles)'}` : `Error de red: ${err?.message}`)
      console.warn('Create maintenance error', err)
    } finally {
      setSubmitting(false)
    }
  }

  // JSX
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-xl z-50 w-full max-w-md">
          <div className="p-6 bg-white rounded-2xl">
            <div className="flex justify-between mb-4">
              <Dialog.Title className="text-lg font-semibold">Crear mantenimiento</Dialog.Title>
              <button onClick={onClose} className="h-8 w-8 rounded hover:bg-gray-100" aria-label="Cerrar">
                ×
              </button>
            </div>

            {error && (
              <div className="mb-4 whitespace-pre-wrap bg-red-50 text-red-700 border border-red-200 p-3 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Nombre (único)"
                value={form.name}
                onChange={(e) => onChange('name', e.target.value)}
                maxLength={100}
                required
              />

              <textarea
                className="w-full border px-3 py-2 rounded"
                placeholder="Descripción"
                value={form.description}
                onChange={(e) => onChange('description', e.target.value)}
                maxLength={300}
              />

              <select
                value={form.maintenance_type}
                onChange={(e) => onChange('maintenance_type', e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">{loadingTypes ? 'Cargando tipos…' : 'Selecciona el tipo'}</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} (ID {t.id})
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                className="w-full border px-3 py-2 rounded"
                placeholder="ID del responsable"
                value={form.responsible_user}
                onChange={(e) => onChange('responsible_user', e.target.value)}
                required
              />

              <select
                value={form.id_estado}
                onChange={(e) => onChange('id_estado', e.target.value)}
                className="w-full border px-3 py-2 rounded"
              >
                {statusOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-black text-white rounded disabled:opacity-60"
                >
                  {submitting ? 'Creando…' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}