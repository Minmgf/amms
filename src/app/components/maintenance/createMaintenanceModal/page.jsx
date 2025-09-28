"use client";
import * as Dialog from "@radix-ui/react-dialog";
import axios from "axios";
import { useState, useMemo, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { FiX } from "react-icons/fi";

const BASE_URL = "https://api.inmero.co/sigma/main/maintenance/";

const getAuthToken = () => {
  let token = localStorage.getItem("token");
  if (!token) token = sessionStorage.getItem("token");
  return token;
};

export default function CreateMaintenanceModal({
  isOpen,
  onClose,
  onCreated,
  authToken,
  typeOptions: initialTypeOptions = [],
  defaultTypeId,
  responsibleUserId = 1,
}) {
  const [name, setName] = useState("");
  const [typeOptions, setTypeOptions] = useState(initialTypeOptions);
  const [typeId, setTypeId] = useState(defaultTypeId ?? "");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const axiosAuth = useMemo(() => {
    const token = authToken || getAuthToken();
    return axios.create({
      headers: token
        ? {
            Authorization: token.startsWith("Bearer")
              ? token
              : `Bearer ${token}`,
          }
        : {},
    });
  }, [authToken]);

  useEffect(() => {
    async function fetchTypes() {
      try {
        const token = authToken || getAuthToken();
        const { data } = await axios.get(
          "https://api.inmero.co/sigma/main/types/list/active/12/",
          {
            headers: token
              ? {
                  Authorization: token.startsWith("Bearer")
                    ? token
                    : `Bearer ${token}`,
                }
              : {},
          }
        );
        console.log("Tipos de mantenimiento API:", data);

        // Usa id_types en vez de id
        const typeArray = Array.isArray(data) ? data : [];
        const options = typeArray.map((t) => ({
          id: t.id_types, // <-- aquí el cambio
          label: t.name,
        }));
        setTypeOptions(options);
        if (options.length) setTypeId(options[0].id);
      } catch (e) {
        setTypeOptions(initialTypeOptions);
        if (initialTypeOptions.length) setTypeId(initialTypeOptions[0].id);
      }
    }
    fetchTypes();
    // Limpia el tipo al cerrar el modal
    if (!isOpen) setTypeId("");
  }, [authToken, isOpen]);

  const reset = () => {
    setName("");
    setTypeId(typeOptions[0]?.id ?? "");
    setDescription("");
    setError("");
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!typeOptions.some((o) => o.id === typeId)) {
      setError("Selecciona un tipo de mantenimiento válido.");
      return;
    }
    if (!responsibleUserId) {
      setError("No hay usuario responsable. (responsibleUserId)");
      return;
    }

    try {
      setLoading(true);
      // Body mínimo esperado por tu backend:
      const payload = {
        name: name.trim(),
        description: description?.trim() || "",
        maintenance_type: typeId, // id numérico
        responsible_user: Number(responsibleUserId),
      };

      const { data } = await axiosAuth.post(BASE_URL, payload);

      onCreated?.(data);
      reset();
      onClose?.();
    } catch (err) {
      const apiMsg =
        err?.response?.data?.message || "Error al crear el mantenimiento.";
      const fieldErrs = err?.response?.data?.errors;
      const extra = fieldErrs
        ? Object.entries(fieldErrs)
            .map(([k, v]) => `• ${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join("\n")
        : "";
      setError([apiMsg, extra].filter(Boolean).join("\n"));
    } finally {
      setLoading(false);
    }
  };

  // Cerrar modal al hacer clic fuera del contenido
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
            Crear Mantenimiento
          </h2>
          <button
            aria-label="Close modal Button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

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
                onChange={(e) => setName(e.target.value)}
                className="parametrization-input"
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
                className="parametrization-input"
                arial-label="Maintenance type Select"
                value={typeId}
                onChange={(e) => setTypeId(Number(e.target.value))}
              >
                {typeOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
 
            {/* Maintenance modal */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-2">
                Descripción del mantenimiento
              </label>
              <textarea
                className="parametrization-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-none"
                maxLength={300}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                aria-label="Problem description Textarea"
                placeholder="Describa el mantenimiento aquí..."
              />
              <div className="text-xs text-gray-400 mt-1">
                {description?.length || 0}/300 characters
              </div>
            </div>

          </div>

          {error && (
            <div className="mt-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 whitespace-pre-line">
              {error}
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex gap-4 mt-8 justify-center">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="btn-error btn-theme w-40 px-8 py-2 font-semibold rounded-lg"
              aria-label="Cancel Button"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-40 px-8 py-2 font-semibold rounded-lg text-white"
              aria-label="Request Button"
            >
              {loading ? "Guardandos..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
