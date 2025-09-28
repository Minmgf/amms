"use client";
import React, { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FiX } from "react-icons/fi";
import {
  getMaintenanceTypes,
  getMaintenanceDetail,
  updateMaintenance,
} from "@/services/maintenanceService";

export default function EditMaintenanceModal({
  isOpen,
  onClose,
  onUpdated,
  maintenance,
  typeOptions: initialTypeOptions = [],
  authToken,
}) {
  const [typeOptions, setTypeOptions] = useState(initialTypeOptions);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    maintenance_type: "",
    responsible_user: "",
    id_estado: "",
  });

  // Cargar tipos de mantenimiento dinámicamente
  useEffect(() => {
    if (!isOpen) return;
    const fetchTypes = async () => {
      setLoadingTypes(true);
      try {
        const data = await getMaintenanceTypes();
        const options = Array.isArray(data)
          ? data.map((t) => ({
              id: t.id_types,
              label: t.name,
            }))
          : [];
        setTypeOptions(options);
        setForm((f) => ({
          ...f,
          maintenance_type: options.length
            ? options.find((o) => o.id === Number(f.maintenance_type))?.id ??
              options[0].id
            : "",
        }));
      } catch (e) {
        setTypeOptions(initialTypeOptions);
        if (initialTypeOptions.length) {
          setForm((f) => ({
            ...f,
            maintenance_type: initialTypeOptions[0].id,
          }));
        }
      } finally {
        setLoadingTypes(false);
      }
    };
    fetchTypes();
  }, [authToken, isOpen]);

  // Cargar detalle del mantenimiento
  useEffect(() => {
    const loadDetail = async () => {
      if (!isOpen || !maintenance?.id_maintenance) return;
      setError(null);
      setLoadingDetail(true);
      try {
        const data = await getMaintenanceDetail(maintenance.id_maintenance);
        setForm({
          name: data.name ?? "",
          description: data.description ?? "",
          maintenance_type: data.maintenance_type ?? data.id_tipo_mantenimiento ?? "",
          responsible_user: data.responsible_user
            ? String(data.responsible_user)
            : "1",
          id_estado: data.id_estado ? String(data.id_estado) : "",
        });
      } catch (e) {
        setForm((f) => ({
          ...f,
          name: maintenance?.name ?? "",
          description: maintenance?.description ?? "",
          maintenance_type:
            maintenance?.maintenance_type ??
            maintenance?.id_tipo_mantenimiento ??
            "",
          responsible_user: maintenance?.responsible_user
            ? String(maintenance.responsible_user)
            : "",
          id_estado: maintenance?.id_estado
            ? String(maintenance.id_estado)
            : "",
        }));
        setError("No se pudo cargar el detalle. Puedes editar igualmente.");
      } finally {
        setLoadingDetail(false);
      }
    };
    loadDetail();
  }, [isOpen, maintenance?.id_maintenance]);

  const onChange = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));
  const payload = useMemo(() => {
    const maintenance_type = form.maintenance_type
      ? Number(form.maintenance_type)
      : undefined;
    const responsible_user = form.responsible_user
      ? Number(form.responsible_user)
      : undefined;
    const id_estado = form.id_estado ? Number(form.id_estado) : undefined;

    const base = {
      name: (form.name || "").trim(),
      description: form.description || "",
      maintenance_type,
      responsible_user,
    };
    const full = id_estado ? { ...base, id_estado } : base;

    return Object.fromEntries(
      Object.entries(full).filter(([_, v]) => v !== undefined && v !== "")
    );
  }, [form]);

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
      await updateMaintenance(maintenance.id_maintenance, payload);
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

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      id="Maintenance Request Modal"
    >
      <div
        className="bg-background rounded-xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 text-primary">
            Editar Mantenimiento
          </h2>
          <button
            aria-label="Close modal Button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {(loadingDetail || loadingTypes) && (
          <div className="mb-3 text-sm text-gray-500 parametrization-text">
            {loadingDetail ? "Loading current data… " : ""}
            {loadingTypes ? "Loading types…" : ""}
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 text-red-700 border border-red-200 p-2 rounded whitespace-pre-line parametrization-text">
            {error}
          </div>
        )}

        {/* Modal Content */}
        <form
          onSubmit={handleSubmit}
          className="p-8 bg-white rounded-2xl shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                Tipo de Mantenimiento
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => onChange("name", e.target.value)}
                className="parametrization-input"
                required
                maxLength={100}
                placeholder="Ej. Cambio de aceite"
                aria-label="Maintenance type Select"
              />
            </div>

            {/* Maintenance type */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Seleccione el tipo
              </label>
              <select
                value={form.maintenance_type}
                onChange={(e) => onChange("maintenance_type", e.target.value)}
                className="parametrization-input"
                aria-label="Maintenance type Select"
                required
              >
                {typeOptions.map((o) => (
                  <option
                    key={o.id}
                    value={o.id}
                    className="parametrization-text"
                  >
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-2">
                Descripción del mantenimiento
              </label>
              <textarea
                className="parametrization-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-none"
                value={form.description}
                onChange={(e) => onChange("description", e.target.value)}
                aria-label="Problem description Textarea"
                placeholder="Describa el mantenimiento aquí..."
                rows={4}
                maxLength={300}
              />
              <div className="text-xs text-gray-400 mt-1 parametrization-text">
                {form.description?.length || 0}/300 characters
              </div>
            </div>

            <div className="md:col-span-2 flex gap-4 mt-8 justify-center">
              <button
                type="button"
                onClick={onClose}
                className="btn-error btn-theme w-40 px-8 py-2 font-semibold rounded-lg"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary w-40 px-8 py-2 font-semibold rounded-lg text-white"
                disabled={submitting}
              >
                {submitting ? "Editando..." : "Editar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
