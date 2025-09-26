'use client'

import React, { useEffect, useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { FaTimes } from 'react-icons/fa'
import axios from 'axios'

/**
 * Modal para crear mantenimientos.
 *
 * Props:
 * - open: boolean (controlado desde el padre)
 * - onOpenChange: (boolean) => void
 * - onCreated: (createdItem) => void   // úsalo para recargar la lista
 * - responsibleUserId?: number         // si ya lo tienes en sesión, pásalo
 */
const CreateMaintenanceModal = ({
  open,
  onOpenChange,
  onCreated,
  responsibleUserId = 1, // valor de respaldo
}) => {
  // ----- Config API
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, '') ||
    'https://api.inmero.co/sigma/main' // respaldo; ajústalo si trabajas local

  const TYPES_ENDPOINT =
    process.env.NEXT_PUBLIC_TYPES_ENDPOINT ||
    // En Taiga indican /types/list/active/12/ para “tipos de mantenimiento”
    `${API_BASE}/types/list/active/12/`

  const CREATE_ENDPOINT =
    process.env.NEXT_PUBLIC_CREATE_MAINTENANCE_ENDPOINT ||
    `${API_BASE}/maintenance/`

  // ----- State form
  const [name, setName] = useState('')
  const [typeId, setTypeId] = useState('')
  const [description, setDescription] = useState('')

  const [types, setTypes] = useState([])
  const [loadingTypes, setLoadingTypes] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // ----- Derivados
  const descCount = useMemo(() => (description || '').length, [description])
  const isValid = useMemo(() => {
    const okName = name.trim().length > 0 && name.trim().length <= 100
    const okType = !!typeId
    const okDesc = descCount <= 300
    return okName && okType && okDesc
  }, [name, typeId, descCount])

  // ----- Cargar tipos de mantenimiento
  useEffect(() => {
    if (!open) return
    let mounted = true
    ;(async () => {
      try {
        setLoadingTypes(true)
        setError(null)
        const { data } = await axios.get(TYPES_ENDPOINT)

        // Normaliza posibles formatos de respuesta
        // Acepta: array plano, {results: [...]}, {data: [...]}
        const raw =
          Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : data?.data || []

        // Intentamos detectar claves comunes: id / id_type, name / type_name
        const normalized = raw.map((t) => ({
          id: t.id ?? t.id_type ?? t.type_id ?? t.value ?? t.key ?? t?.Id,
          name: t.name ?? t.type_name ?? t.label ?? t.descripcion ?? t?.Name,
        })).filter((t) => t.id != null)

        if (mounted) setTypes(normalized)
      } catch (err) {
        console.error('Error fetching maintenance types', err)
        if (mounted) setError('No fue posible cargar los tipos de mantenimiento.')
      } finally {
        if (mounted) setLoadingTypes(false)
      }
    })()

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // ----- Reset al cerrar
  const handleOpenChange = (val) => {
    if (!val) {
      // reset suave
      setTimeout(() => {
        setName('')
        setTypeId('')
        setDescription('')
        setError(null)
      }, 200)
    }
    onOpenChange?.(val)
  }

  // ----- Submit
  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    if (!isValid || submitting) return

    try {
      setSubmitting(true)
      setError(null)

      // Body esperado por backend (según Taiga):
      // {
      //   "name": "cambio de motor",
      //   "description": "se necesita cambiar motor",
      //   "maintenance_type": 14,
      //   "id_responsible_user": 1
      // }
      const payload = {
        name: name.trim(),
        description: description?.trim() || '',
        maintenance_type: Number(typeId),
        id_responsible_user: Number(responsibleUserId),
      }

      const { data } = await axios.post(CREATE_ENDPOINT, payload)

      // Heurística de éxito (Taiga muestra { success: true, message: "..."} )
      const ok =
        data?.success === true ||
        data?.id ||
        data?.created === true

      if (ok) {
        // Avísale al padre para refrescar la tabla
        onCreated?.(data)
        handleOpenChange(false)
        // feedback mínimo
        if (typeof window !== 'undefined') alert('Mantenimiento creado correctamente.')
      } else {
        throw new Error(data?.message || 'No se pudo crear el mantenimiento.')
      }
    } catch (err) {
      console.error('Error creating maintenance', err)
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Error al crear el mantenimiento.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-xl">
          <form onSubmit={handleSubmit} className="card-theme rounded-2xl p-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <Dialog.Title className="text-2xl font-bold">Add maintenance</Dialog.Title>
              <Dialog.Close asChild>
                <button type="button" className="text-secondary hover:text-primary">
                  <FaTimes className="h-6 w-6" />
                </button>
              </Dialog.Close>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Name */}
              <div className="md:col-span-1">
                <label className="mb-2 block text-sm font-medium text-primary">
                  Maintenance name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  placeholder="Cambio de aceite"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-primary placeholder-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                />
                <p className="mt-1 text-xs text-gray-500">Máx. 100 caracteres</p>
              </div>

              {/* Type */}
              <div className="md:col-span-1">
                <label className="mb-2 block text-sm font-medium text-primary">
                  Maintenance type
                </label>
                <select
                  value={typeId}
                  onChange={(e) => setTypeId(e.target.value)}
                  required
                  disabled={loadingTypes}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-primary focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                >
                  <option value="">{loadingTypes ? 'Loading...' : 'Select a type'}</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description (full width) */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-primary">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={300}
                  rows={4}
                  placeholder="Description..."
                  className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-primary placeholder-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                />
                <div className="mt-1 text-xs text-gray-500">{descCount}/300 characters</div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex items-center justify-end gap-4">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-lg bg-red-600 px-6 py-3 font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
              </Dialog.Close>

              <button
                type="submit"
                className="rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!isValid || submitting}
              >
                {submitting ? 'Saving…' : 'Add'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default CreateMaintenanceModal
