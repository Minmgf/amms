import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FiUserPlus } from "react-icons/fi";
import AddClientModal from "@/app/components/request/clients/AddClientModal";
import { getClientByIdentification } from "@/services/requestService";

export default function Step1ClientInfo() {
  const { register, formState: { errors }, setValue, watch } = useFormContext();
  const identificationNumber = watch("identificationNumber");
  const [clientData, setClientData] = useState(null);
  const [checking, setChecking] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  // Buscar cliente por número de identificación
  const handleSearch = async () => {
    if (!identificationNumber) return;
    setChecking(true);
    try {
      const response = await getClientByIdentification(identificationNumber);
      setClientData(response);
      setValue("customer", response.id_customer || "");
    } catch {
      setClientData(null);
    } finally {
      setChecking(false);
    }
  };

  // Buscar automáticamente cuando el número cambia y tiene longitud suficiente
  // (puedes ajustar la longitud mínima)
  React.useEffect(() => {
    if (identificationNumber && identificationNumber.length >= 7) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setClientData(null);
    }
  }, [identificationNumber]);

  return (
    <>
      <h3 className="text-theme-lg font-theme-semibold mb-theme-md text-primary">
        Información del Cliente
      </h3>
      <div className="mb-6">
        <label className="block text-theme-sm text-secondary mb-1">
          Número de identificación
        </label>
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <input
              {...register("identificationNumber",{
                required: "Este campo es obligatorio",
              })}
              className="parametrization-input"
              placeholder="Ingrese número de identificación"
              aria-label="Número de identificación"
              autoComplete="off"
              onKeyDown={e => {
                if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                  e.preventDefault();
                }
              }}
            />
            {errors.identificationNumber && (
              <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
                {errors.identificationNumber.message}
              </span>
            )}
          </div>          
          <button
            type="button"
            className="btn-theme btn-secondary flex items-center gap-2"
            onClick={() => setShowAddClientModal(true)}
            aria-label="Añadir nuevo cliente"
          >
            <FiUserPlus className="w-5 h-5" />
            Añadir nuevo cliente
          </button>
        </div>
        {checking && (
          <span className="text-theme-xs text-secondary mt-2 block">Buscando cliente...</span>
        )}
      </div>
      {clientData && (
        <div className="bg-surface rounded-theme-lg p-theme-md mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <span className="text-theme-sm text-secondary">Tipo de cliente:</span>
              <span className="block font-theme-medium">{clientData.person_type_name || "Natural"}</span>
            </div>
            <div>
              <span className="text-theme-sm text-secondary">Nombre completo / Razón social:</span>
              <span className="block font-theme-medium">{clientData.name || clientData.legal_entity_name || "-"}</span>
            </div>
            <div>
              <span className="text-theme-sm text-secondary">Tipo de documento:</span>
              <span className="block font-theme-medium">{clientData.type_document_name || "-"}</span>
            </div>
            <div>
              <span className="text-theme-sm text-secondary">Identificación:</span>
              <span className="block font-theme-medium">{clientData.document_number || "-"}</span>
            </div>
            <div>
              <span className="text-theme-sm text-secondary">Email:</span>
              <span className="block font-theme-medium">{clientData.email || "-"}</span>
            </div>
            <div>
              <span className="text-theme-sm text-secondary">Teléfono:</span>
              <span className="block font-theme-medium">{clientData.phone || "-"}</span>
            </div>
          </div>
        </div>
      )}
      <AddClientModal
        isOpen={showAddClientModal}
        mode="create"
        onClose={() => setShowAddClientModal(false)}
        onSuccess={() => setShowAddClientModal(false)}
      />
    </>
  );
}