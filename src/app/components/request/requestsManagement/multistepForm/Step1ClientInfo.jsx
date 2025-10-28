import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FiUserPlus } from "react-icons/fi";
import AddClientModal from "@/app/components/request/clients/AddClientModal";
import { getClientByIdentification } from "@/services/requestService";
import {ErrorModal} from "@/app/components/shared/SuccessErrorModal";

export default function Step1ClientInfo({ mode = "preregister", customerData = null, setCustomerData = null }) {
  const { register, formState: { errors }, setValue, watch } = useFormContext();
  const identificationNumber = watch("identificationNumber");
  const customerId = watch("customer");
  const customerPhone = watch("customerPhone");
  const customerEmail = watch("customerEmail");
  const [clientData, setClientData] = useState(null);
  const [checking, setChecking] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [message, setMessage] = useState("");
  const isConfirmMode = mode === 'confirm';
  const isEditMode = mode === 'edit';

  // Buscar cliente por número de identificación
  const handleSearch = async () => {
    if (!identificationNumber) return;
    setChecking(true);
    try {
      const response = await getClientByIdentification(identificationNumber);
      setClientData(response);
      setValue("customer", response.id_customer || "");
    } catch {
      setMessage("No se encontró un cliente con el número de identificación proporcionado.");
      setShowErrorModal(true);
      setClientData(null);
      //no permitir cambiar de paso si no se encuentra el cliente
      setValue("customer", "");
      setValue("identificationNumber", "");
    } finally {
      setChecking(false);
    }
  };

  // En modo edición, usar customerData si está disponible
  React.useEffect(() => {
    if (isEditMode && customerData) {
      setClientData(customerData);
    }
  }, [isEditMode, customerData]);

  // Buscar automáticamente cuando el número cambia y tiene longitud suficiente
  // (puedes ajustar la longitud mínima)
  React.useEffect(() => {
    if (identificationNumber && identificationNumber.length >= 7 && !isConfirmMode && !isEditMode) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else if (!isConfirmMode && !isEditMode) {
      setClientData(null);
    }
  }, [identificationNumber, isConfirmMode, isEditMode]);

  // En modo confirmación, cargar el cliente automáticamente cuando cambie el customerId
  React.useEffect(() => {
    if (isConfirmMode && identificationNumber && !clientData) {
      handleSearch();
    }
  }, [isConfirmMode, identificationNumber, customerId]);

  return (
    <>
      <h3 className="text-theme-lg font-theme-semibold mb-theme-md text-primary">
        Información del Cliente
      </h3>
      <div className="mb-6">
        <label className="block text-theme-sm text-secondary mb-1">
          Número de identificación
          {(isConfirmMode || isEditMode) && <span className="text-xs ml-2 italic">(Precargado)</span>}
        </label>
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <input
              {...register("identificationNumber",{
                required: "Este campo es obligatorio",
                pattern: { value: /^[0-9]+$/, message: "Solo se permiten números" }
              })}
              className="parametrization-input"
              placeholder="Ingrese número de identificación"
              aria-label="Número de identificación"
              disabled={isConfirmMode || isEditMode}
              readOnly={isConfirmMode || isEditMode}
            />
            {errors.identificationNumber && (
              <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
                {errors.identificationNumber.message}
              </span>
            )}
          </div>          
          {!isConfirmMode && !isEditMode && (
            <button
              type="button"
              className="btn-theme btn-secondary flex items-center gap-2"
              onClick={() => setShowAddClientModal(true)}
              aria-label="Añadir nuevo cliente"
            >
              <FiUserPlus className="w-5 h-5" />
              Añadir nuevo cliente
            </button>
          )}
        </div>
        {checking && (
          <span className="text-theme-xs text-secondary mt-2 block">Buscando cliente...</span>
        )}
        {isConfirmMode && (
          <span className="text-theme-xs text-secondary mt-2 block">
            Los datos del cliente están precargados desde la presolicitud.
          </span>
        )}
        {isEditMode && (
          <span className="text-theme-xs text-secondary mt-2 block">
            Los datos del cliente están precargados. Solo el teléfono y email pueden ser editados.
          </span>
        )}
      </div>
      {clientData && (
        <div className={`rounded-theme-lg p-theme-md mb-4 ${(isConfirmMode || isEditMode) ? 'bg-blue-50 border border-blue-200' : 'bg-surface'}`}>
          {(isConfirmMode || isEditMode) && (
            <div className="mb-3 pb-2 border-b border-blue-300">
              <h4 className="font-theme-semibold text-blue-800">
                {isEditMode ? 'Información del Cliente (Edición)' : 'Información del Cliente (Precargada)'}
              </h4>
              {isEditMode && (
                <p className="text-xs text-accent mt-1">
                  Solo el teléfono y email pueden ser modificados
                </p>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            
            {/* Email - editable en modo edit */}
            <div>
              <label className="block text-theme-sm text-secondary mb-1">
                Email:
                {isEditMode && <span className="text-xs ml-1 text-green-600">(Editable)</span>}
              </label>
              {isEditMode ? (
                <input
                  {...register("customerEmail", {
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Formato de email inválido"
                    }
                  })}
                  className="parametrization-input"
                  placeholder="Ingrese email del cliente"
                  defaultValue={clientData.email || ""}
                />
              ) : (
                <span className="block font-theme-medium">{clientData.email || "-"}</span>
              )}
              {errors.customerEmail && (
                <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
                  {errors.customerEmail.message}
                </span>
              )}
            </div>
            
            {/* Teléfono - editable en modo edit */}
            <div>
              <label className="block text-theme-sm text-secondary mb-1">
                Teléfono:
                {isEditMode && <span className="text-xs ml-1 text-green-600">(Editable)</span>}
              </label>
              {isEditMode ? (
                <input
                  {...register("customerPhone", {
                    pattern: {
                      value: /^[+]?[0-9\s\-()]+$/,
                      message: "Formato de teléfono inválido"
                    }
                  })}
                  className="parametrization-input"
                  placeholder="Ingrese teléfono del cliente"
                  defaultValue={clientData.phone || ""}
                />
              ) : (
                <span className="block font-theme-medium">{clientData.phone || "-"}</span>
              )}
              {errors.customerPhone && (
                <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
                  {errors.customerPhone.message}
                </span>
              )}
            </div>
          </div>
          
          {/* Alerta de cliente inactivo para modo edit */}
          {isEditMode && clientData.customer_statues_name && clientData.customer_statues_name.toLowerCase() !== 'activo' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                <span className="text-red-800 font-medium">
                  El cliente asociado a esta solicitud está inactivo. Actualice el registro o asocie un nuevo cliente.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      <AddClientModal
        isOpen={showAddClientModal}
        mode="create"
        onClose={() => setShowAddClientModal(false)}
        onSuccess={() => setShowAddClientModal(false)}
      />
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={message}
        title="Usuario no encontrado"
      />
    </>
  );
}