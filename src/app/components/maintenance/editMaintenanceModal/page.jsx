'use client'
import React, { useEffect, useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import axios from 'axios'

const BASE_URL = 'https://api.inmero.co/sigma/main/maintenance/'
const TYPES_URL = 'https://api.inmero.co/sigma/main/types/list/active/12/'

const getAuthToken = () => {
  let token = localStorage.getItem("token");
  if (!token) token = sessionStorage.getItem("token");
  return token;
};

export default function EditMaintenanceModal({
  open,
  onClose,
  onUpdated,
  maintenance,
  typeOptions: initialTypeOptions = [],
  statusOptions = [
    { id: 1, label: 'Habilitado' },
    { id: 2, label: 'Deshabilitado' }
  ],
  authToken,
  defaultTypeId = 14
}) {
  const [typeOptions, setTypeOptions] = useState(initialTypeOptions);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    maintenance_type: '', // id numérico
    responsible_user: '',
    id_estado: '',
    estado: 'Habilitado'
  });

  const headers = useMemo(() => {
    const token = authToken || getAuthToken();
    const h = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = token.startsWith("Bearer") ? token : `Bearer ${token}`;
    return h;
  }, [authToken]);

  // Cargar tipos de mantenimiento dinámicamente
  useEffect(() => {
    if (!open) return;
    const fetchTypes = async () => {
      setLoadingTypes(true);
      try {
        const { data } = await axios.get(TYPES_URL, { headers });
        // Usa id_types como id y name como label
        const options = Array.isArray(data)
          ? data.map(t => ({
              id: t.id_types,
              label: t.name
            }))
          : [];
        setTypeOptions(options);
        // Selecciona el tipo actual o el primero
        setForm(f => ({
          ...f,
          maintenance_type: options.length
            ? (options.find(o => o.id === Number(f.maintenance_type))?.id ?? options[0].id)
            : ''
        }));
      } catch (e) {
        setTypeOptions(initialTypeOptions);
        if (initialTypeOptions.length) {
          setForm(f => ({
            ...f,
            maintenance_type: initialTypeOptions[0].id
          }));
        }
      } finally {
        setLoadingTypes(false);
      }
    };
    fetchTypes();
  }, [open, authToken]);

  // Cargar detalle del mantenimiento
  useEffect(() => {
    const loadDetail = async () => {
      if (!open || !maintenance?.id_maintenance) return;
      setError(null);
      setLoadingDetail(true);
      try {
        const { data } = await axios.get(`${BASE_URL}${maintenance.id_maintenance}/`, { headers });
        setForm({
          name: data.name ?? '',
          description: data.description ?? '',
          maintenance_type: data.maintenance_type ?? data.id_tipo_mantenimiento ?? '',
          responsible_user: data.responsible_user ? String(data.responsible_user) : '',
          id_estado: data.id_estado ? String(data.id_estado) : '',
          estado: data.estado ?? 'Habilitado'
        });
      } catch (e) {
        setForm(f => ({
          ...f,
          name: maintenance?.name ?? '',
          description: maintenance?.description ?? '',
          maintenance_type: maintenance?.maintenance_type ?? maintenance?.id_tipo_mantenimiento ?? '',
          responsible_user: maintenance?.responsible_user ? String(maintenance.responsible_user) : '',
          id_estado: maintenance?.id_estado ? String(maintenance.id_estado) : '',
          estado: maintenance?.estado ?? 'Habilitado'
        }));
        setError('No se pudo cargar el detalle. Puedes editar igualmente.');
      } finally {
        setLoadingDetail(false);
      }
    };
    loadDetail();
  }, [open, maintenance?.id_maintenance, headers]);

  const onChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  // Construir payload limpio
  const payload = useMemo(() => {
    const maintenance_type = form.maintenance_type ? Number(form.maintenance_type) : undefined;
    const responsible_user = form.responsible_user ? Number(form.responsible_user) : undefined;
    const id_estado = form.id_estado ? Number(form.id_estado) : undefined;

    let estadoTxt = form.estado;
    if (id_estado === 1) estadoTxt = 'Habilitado';
    if (id_estado === 2) estadoTxt = 'Deshabilitado';

    const base = {
      name: (form.name || '').trim(),
      description: form.description || '',
      maintenance_type,
      responsible_user
    };
    const full = id_estado ? { ...base, id_estado, estado: estadoTxt } : base;

    // quitar keys vacías/undefined
    return Object.fromEntries(Object.entries(full).filter(([_, v]) => v !== undefined && v !== ''));
  }, [form]);

  const doPut = async (body) => {
    return axios.put(
      `${BASE_URL}${maintenance.id_maintenance}/`,
      body,
      { headers }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!typeOptions.some((o) => o.id === Number(form.maintenance_type))) {
      setError("Selecciona un tipo de mantenimiento válido.");
      return;
    }
    if (!form.responsible_user) {
      setError("No hay usuario responsable.");
      return;
    }

    setSubmitting(true);
    try {
      await doPut(payload);
      onUpdated?.();
      onClose();
    } catch (err) {
      const apiMsg =
        err?.response?.data?.message || "Error al editar el mantenimiento.";
      const fieldErrs = err?.response?.data?.errors;
      const extra = fieldErrs
        ? Object.entries(fieldErrs)
            .map(([k, v]) => `• ${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join("\n")
        : "";
      setError([apiMsg, extra].filter(Boolean).join("\n"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-xl z-50 w-full max-w-2xl bg-background"
          aria-describedby="edit-maintenance-desc"
          aria-label="Edit maintenance dialog"
        >
          <div className="p-8">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-3xl font-bold text-center w-full parametrization-text">
                Edit maintenance
              </Dialog.Title>
              <button onClick={onClose} className="text-gray-600 hover:text-black absolute top-8 right-8 parametrization-text" aria-label="Close">×</button>
            </div>
            <Dialog.Description id="edit-maintenance-desc" className="sr-only parametrization-text">
              Use this form to edit a maintenance configuration.
            </Dialog.Description>

            {(loadingDetail || loadingTypes) && (
              <div className="mb-3 text-sm text-gray-500 parametrization-text">
                {loadingDetail ? 'Loading current data… ' : ''}
                {loadingTypes ? 'Loading types…' : ''}
              </div>
            )}

            {error && (
              <div className="mb-4 bg-red-50 text-red-700 border border-red-200 p-2 rounded whitespace-pre-line parametrization-text">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary mb-3 parametrization-text">
                  Maintenance name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => onChange('name', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#D7D7D7] rounded-lg bg-white parametrization-text"
                  required
                  maxLength={100}
                  placeholder="Ej. Cambio de aceite"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-3 parametrization-text">
                  Maintenance type
                </label>
                <select
                  value={form.maintenance_type}
                  onChange={e => onChange('maintenance_type', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#D7D7D7] rounded-lg bg-white parametrization-text"
                  required
                >
                  {typeOptions.map(o => (
                    <option key={o.id} value={o.id} className="parametrization-text">{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-3 parametrization-text">
                  Responsible user (ID)
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.responsible_user}
                  onChange={e => onChange('responsible_user', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#D7D7D7] rounded-lg bg-white parametrization-text"
                  required
                  placeholder="ID de usuario responsable"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary mb-3 parametrization-text">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e => onChange('description', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#D7D7D7] rounded-lg bg-white parametrization-text"
                  rows={4}
                  maxLength={300}
                  placeholder="Description..."
                />
                <div className="text-xs text-gray-400 mt-1 parametrization-text">
                  {form.description?.length || 0}/300 characters
                </div>
              </div>

              <div className="md:col-span-2 flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors parametrization-text"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60 parametrization-text"
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
  );
}