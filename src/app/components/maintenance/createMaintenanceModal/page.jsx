"use client";
import * as Dialog from "@radix-ui/react-dialog";
import axios from "axios";
import { useState, useMemo, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

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

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl z-50">
          <form
            onSubmit={handleSubmit}
            className="p-8 bg-white rounded-2xl shadow-xl"
          >
            <div className="flex items-center justify-center mb-6">
              <Dialog.Title className="text-2xl font-bold mb-2">
                Add maintenance
              </Dialog.Title>
              {/* <button type="button" onClick={handleClose} className="text-gray-600 hover:text-black">
                <FaTimes className="w-5 h-5" />
              </button> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Maintenance name
                </label>
                <input
                  className="w-full px-4 py-3 border-2 border-[#D7D7D7] rounded-lg focus:outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Cambio de aceite"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Maintenance type
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-[#D7D7D7] rounded-lg bg-white"
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

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-[#D7D7D7] rounded-lg min-h-[120px] resize-y"
                  maxLength={300}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description..."
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

            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-60"
              >
                {loading ? "Saving..." : "Add"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
