"use client";

import React, { useState, useEffect } from "react";
import { FiX, FiSave } from "react-icons/fi";
import {
  createService,
  updateService,
  getServiceTypes,
  getCurrencyUnits,
} from "@/services/serviceService";
import { authorization, getTributesNames } from "@/services/billingService";
import {
  SuccessModal,
  ErrorModal,
  ConfirmModal,
} from "@/app/components/shared/SuccessErrorModal";

const getAuthToken = () => {
  let token = localStorage.getItem("token");
  if (!token) token = sessionStorage.getItem("token");
  return token;
};

export default function CreateEditServiceModal({
  isOpen,
  onClose,
  onCreated,
  onUpdated,
  serviceData,
  mode = "create",
}) {
  const [formData, setFormData] = useState({
    service_name: "",
    description: "",
    service_type: "",
    base_price: "",
    price_unit: "",
    applicable_tax: "",
    tax_rate: "",
    is_vat_exempt: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingData, setLoadingData] = useState(false);

  const [serviceTypes, setServiceTypes] = useState([]);
  const [currencyUnits, setCurrencyUnits] = useState([]);
  const [taxTypes, setTaxTypes] = useState([]);
  const [billingToken, setBillingToken] = useState("");
  const [tributesNames, setTributesNames] = useState([]);

  // Estados para modales de éxito, error y confirmación
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Cargar datos del API al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
    const getTokenBilling = async () => {
      try {
        const response = await authorization();
        setBillingToken(response.access_token);

        if (response.access_token) {
          const tributes = await getTributesNames(response.access_token);
          setTributesNames(tributes.data);
        }
      } catch (error) {
        console.error("Error en inicialización:", error);
      }
    };
    getTokenBilling();
  }, []);

  // Cargar datos del servicio cuando cambie el modo o los datos
  useEffect(() => {
    if (isOpen && mode === "edit" && serviceData) {
      loadServiceData();
    } else if (isOpen && mode === "create") {
      resetForm();
    }
  }, [isOpen, mode, serviceData]);

  const loadInitialData = async () => {
    setLoadingData(true);
    setErrors({});

    try {
      const [typesData, unitsData, taxData] = await Promise.all([
        getServiceTypes(),
        getCurrencyUnits(),
      ]);

      // Procesar tipos de servicios
      const types = Array.isArray(typesData)
        ? typesData
        : typesData?.data && Array.isArray(typesData.data)
        ? typesData.data
        : [];

      // Procesar unidades de moneda
      const units = Array.isArray(unitsData)
        ? unitsData
        : unitsData?.data && Array.isArray(unitsData.data)
        ? unitsData.data
        : [];

      // Procesar tipos de impuestos
      const taxes = Array.isArray(taxData)
        ? taxData
        : taxData?.data && Array.isArray(taxData.data)
        ? taxData.data
        : [];

      // Solo actualizar si se obtuvieron datos de la API
      if (types.length > 0) {
        setServiceTypes(types);
      }

      if (units.length > 0) {
        setCurrencyUnits(units);
      }
    } catch (error) {
      console.error(
        "Error al cargar datos de API, manteniendo datos por defecto:",
        error
      );
    } finally {
      setLoadingData(false);
    }
  };

  const loadServiceData = () => {
    if (serviceData) {
      // Mapear los diferentes posibles nombres de campos de la API
      const mappedData = {
        service_name: serviceData.service_name || serviceData.name || "",
        description: serviceData.description || "",
        service_type: String(
          serviceData.service_type_id || serviceData.service_type || ""
        ),
        base_price: String(serviceData.base_price || ""),
        price_unit: String(
          serviceData.price_unit_id ||
            serviceData.price_unit ||
            serviceData.unit_id ||
            serviceData.currency_unit ||
            ""
        ),
        applicable_tax: String(serviceData.applicable_tax || ""),
        tax_rate: String(serviceData.tax_rate || ""),
        is_vat_exempt: Boolean(serviceData.is_vat_exempt),
      };
      setFormData(mappedData);
    }
  };

  const resetForm = () => {
    setFormData({
      service_name: "",
      description: "",
      service_type: "",
      base_price: "",
      price_unit: "",
      applicable_tax: "",
      tax_rate: "",
      is_vat_exempt: false,
    });
    setErrors({});
  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    // Resetear estados de modales
    setShowSuccess(false);
    setShowError(false);
    setShowConfirm(false);
    setSuccessMsg('');
    setErrorMsg('');
    onClose?.();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo cuando el usuario comience a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar nombre del servicio (requerido, máximo 100 caracteres)
    if (!formData.service_name?.trim()) {
      newErrors.service_name = "El nombre del servicio es requerido";
    } else if (formData.service_name.length > 100) {
      newErrors.service_name =
        "El nombre del servicio no puede exceder 100 caracteres";
    }

    // Validar descripción (opcional, máximo 500 caracteres)
    if (formData.description && formData.description.length > 500) {
      newErrors.description = "La descripción no puede exceder 500 caracteres";
    }

    if (!formData.service_type) {
      newErrors.service_type = "El tipo de servicio es requerido";
    }

    if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
      newErrors.base_price = "El precio base debe ser mayor a 0";
    }

    if (!formData.price_unit) {
      newErrors.price_unit = "La unidad de precio es requerida";
    }

    if (!formData.applicable_tax) {
      newErrors.applicable_tax = "El impuesto aplicable es requerido";
    }

    if (!formData.tax_rate || parseFloat(formData.tax_rate) < 0) {
      newErrors.tax_rate = "La tasa de impuesto debe ser 0 o mayor";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const submitData = {
        service_name: formData.service_name.trim(),
        description:
          formData.description?.trim() || "Servicio sin descripción específica",
        service_type: parseInt(formData.service_type),
        base_price: parseFloat(formData.base_price),
        price_unit: parseInt(formData.price_unit),
        applicable_tax: formData.applicable_tax,
        tax_rate: parseFloat(formData.tax_rate),
        is_vat_exempt: Boolean(formData.is_vat_exempt),
      };

      let response;
      const serviceId =
        serviceData?.id || serviceData?.id_service || serviceData?.service_id;
      const isEditMode = mode === "edit" && serviceId;

      if (isEditMode) {
        response = await updateService(serviceId, submitData);
        setSuccessMsg("Servicio actualizado exitosamente");
      } else {
        response = await createService(submitData);
        setSuccessMsg("Servicio creado exitosamente");
      }

      // Llamar al callback apropiado para recargar los datos
      if (isEditMode && onUpdated) {
        onUpdated();
      } else if (!isEditMode && onCreated) {
        onCreated();
      }

      // Mostrar modal de éxito
      setShowSuccess(true);
    } catch (error) {
      const action = mode === "edit" ? "actualizar" : "crear";

      // Manejar diferentes tipos de errores
      let errorMessage = `Error al ${action} el servicio.`;

      if (error.response) {
        const { status, data } = error.response;
        console.error("Error response:", { status, data });

        if (status === 405) {
          errorMessage = `Método no permitido. El servidor no acepta ${action} servicios en este endpoint.`;
        } else if (status === 404) {
          errorMessage =
            mode === "edit"
              ? "Servicio no encontrado."
              : "Endpoint no encontrado.";
        } else if (status === 400) {
          errorMessage =
            data?.message || "Datos inválidos enviados al servidor.";
        } else if (status === 401) {
          errorMessage = "No tienes autorización para realizar esta acción.";
        } else {
          errorMessage = data?.message || `Error del servidor (${status}).`;
        }

        // Manejar errores de campo específicos
        if (data?.errors) {
          const fieldErrors = Object.entries(data.errors)
            .map(
              ([field, messages]) =>
                `• ${field}: ${
                  Array.isArray(messages) ? messages.join(", ") : messages
                }`
            )
            .join("\n");
          errorMessage += fieldErrors
            ? `\n\nErrores específicos:\n${fieldErrors}`
            : "";
        }
      } else if (error.request) {
        errorMessage =
          "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
      }

      setErrorMsg(errorMessage);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    handleClose(); // Cerrar el modal principal después del éxito
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-primary">
            {mode === "edit" ? "Editar Servicio" : "Crear Nuevo Servicio"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error general */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* General Information Section */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-secondary mb-4">
              Información General
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service ID - Auto generated, read only */}
              <div>
                <label
                  htmlFor="service_id"
                  className="block text-sm font-medium text-secondary mb-2"
                >
                  ID del Servicio
                </label>
                <input
                  type="text"
                  id="service_id"
                  name="service_id"
                  value={
                    mode === "edit"
                      ? serviceData?.id ||
                        serviceData?.id_service ||
                        serviceData?.service_id ||
                        "N/A"
                      : "Se generará automáticamente"
                  }
                  className="parametrization-input cursor-not-allowed"
                  placeholder="Se generará automáticamente"
                  aria-label="Auto-generated service ID"
                  disabled
                  readOnly
                />
              </div>

              {/* Service name */}
              <div>
                <label
                  htmlFor="service_name"
                  className="block text-sm font-medium text-secondary mb-2"
                >
                  Nombre del Servicio *
                </label>
                <input
                  type="text"
                  id="service_name"
                  name="service_name"
                  value={formData.service_name}
                  onChange={handleInputChange}
                  maxLength={100}
                  className={`parametrization-input ${
                    errors.service_name ? "ring-2 ring-red-300 bg-red-50" : ""
                  }`}
                  placeholder="Ej: Mantenimiento Preventivo"
                  aria-label="Service name"
                  disabled={loading || loadingData}
                />
                <div className="mt-1 text-xs text-secondary">
                  {formData.service_name?.length || 0}/100 caracteres
                </div>
                {errors.service_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.service_name}
                  </p>
                )}
              </div>

              {/* Description - Full width */}
              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-secondary mb-2"
                >
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  maxLength={500}
                  rows={3}
                  className={`parametrization-input ${
                    errors.description ? "ring-2 ring-red-300 bg-red-50" : ""
                  }`}
                  placeholder="Descripción del servicio..."
                  aria-label="Service description"
                  disabled={loading || loadingData}
                />
                <div className="mt-1 text-xs text-gray-500">
                  {formData.description?.length || 0}/500 caracteres
                </div>
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Service type */}
              <div className="md:col-span-1">
                <label
                  htmlFor="service_type"
                  className="block text-sm font-medium text-secondary mb-2"
                >
                  Tipo de Servicio *
                </label>

                <div className="relative">
                  <select
                    id="service_type"
                    name="service_type"
                    value={formData.service_type}
                    onChange={handleInputChange}
                    className={`appearance-none parametrization-input pr-10 ${
                      errors.service_type ? "ring-2 ring-red-300 bg-red-50" : ""
                    }`}
                    aria-label="Service type"
                    disabled={loading || loadingData}
                  >
                    <option value="">Seleccionar tipo...</option>
                    {serviceTypes.length > 0 ? (
                      serviceTypes.map((type) => (
                        <option
                          key={type.id || type.id_types || type.type_id}
                          value={type.id || type.id_types || type.type_id}
                        >
                          {type.name || type.type_name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No hay tipos disponibles
                      </option>
                    )}
                  </select>

                  {/* 🔽 Flecha personalizada */}
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    width="20"
                    height="20"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {errors.service_type && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.service_type}
                  </p>
                )}
                {loadingData && (
                  <p className="mt-1 text-sm text-gray-500">
                    Cargando tipos...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Commercial Data Section */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Datos Comerciales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Base Price */}
              <div>
                <label
                  htmlFor="base_price"
                  className="block text-sm font-medium text-secondary mb-2"
                >
                  Precio Base *
                </label>
                <input
                  type="number"
                  id="base_price"
                  name="base_price"
                  value={formData.base_price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`parametrization-input ${
                    errors.base_price ? "ring-2 ring-red-300 bg-red-50" : ""
                  }`}
                  placeholder="0.00"
                  aria-label="Service base price"
                  disabled={loading || loadingData}
                />
                {errors.base_price && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.base_price}
                  </p>
                )}
              </div>

              {/* Unit of Measure */}
              <div>
                <label
                  htmlFor="price_unit"
                  className="block text-sm font-medium text-secondary mb-2"
                >
                  Unidad de Medida *
                </label>
                <select
                  id="price_unit"
                  name="price_unit"
                  value={formData.price_unit}
                  onChange={handleInputChange}
                  className={`parametrization-input ${
                    errors.price_unit ? "ring-2 ring-red-300 bg-red-50" : ""
                  }`}
                  aria-label="Unit of measurement"
                  disabled={loading || loadingData}
                >
                  <option value="">Seleccionar unidad...</option>
                  {currencyUnits.length > 0 ? (
                    currencyUnits.map((unit) => (
                      <option
                        key={unit.id || unit.id_units || unit.unit_id}
                        value={unit.id || unit.id_units || unit.unit_id}
                      >
                        {unit.name || unit.unit_name}{" "}
                        {unit.code || unit.unit_code
                          ? `(${unit.code || unit.unit_code})`
                          : ""}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No hay unidades disponibles
                    </option>
                  )}
                </select>
                {errors.price_unit && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.price_unit}
                  </p>
                )}
                {loadingData && (
                  <p className="mt-1 text-sm text-gray-500">
                    Cargando unidades...
                  </p>
                )}
              </div>

              {/* Applicable taxes */}
              <div>
                <label
                  htmlFor="applicable_tax"
                  className="block text-sm font-medium text-secondary mb-2"
                >
                  Impuesto *
                </label>
                <select
                  id="applicable_tax"
                  name="applicable_tax"
                  value={formData.applicable_tax}
                  onChange={handleInputChange}
                  className={`parametrization-input ${
                    errors.applicable_tax ? "ring-2 ring-red-300 bg-red-50" : ""
                  }`}
                  aria-label="Applicable tax"
                  disabled={loading || loadingData}
                >
                  <option value="">Seleccionar impuesto...</option>
                  {tributesNames.length > 0 ? (
                    tributesNames.map((tribute) => (
                      <option key={tribute.id} value={tribute.id}>
                        {tribute.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No hay tipos de impuestos disponibles
                    </option>
                  )}
                </select>
                {errors.applicable_tax && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.applicable_tax}
                  </p>
                )}
                {loadingData && (
                  <p className="mt-1 text-sm text-gray-500">
                    Cargando impuestos...
                  </p>
                )}
              </div>

              {/* Tax rate */}
              <div>
                <label
                  htmlFor="tax_rate"
                  className="block text-sm font-medium text-secondary mb-2"
                >
                  Tasa de Impuesto *
                </label>
                <input
                  type="number"
                  id="tax_rate"
                  name="tax_rate"
                  value={formData.tax_rate}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className={`parametrization-input ${
                    errors.tax_rate ? "ring-2 ring-red-300 bg-red-50" : ""
                  }`}
                  placeholder="0.00"
                  aria-label="Tax rate percentage"
                  disabled={loading || loadingData}
                />
                {errors.tax_rate && (
                  <p className="mt-1 text-sm text-red-600">{errors.tax_rate}</p>
                )}
              </div>

              {/* VAT exempt checkbox */}
              <div className="flex items-center">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_vat_exempt"
                    checked={formData.is_vat_exempt}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_vat_exempt: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                    aria-label="Mark if service is VAT exempt"
                    disabled={loading || loadingData}
                  />
                  <span className="text-sm font-medium text-secondary">
                    Exento de IVA
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {loadingData && (
            <div className="mt-6 flex items-center justify-center py-4">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <span>Cargando datos...</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="md:col-span-2 flex gap-4 mt-8 justify-center">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading || loadingData}
              className="btn-error btn-theme w-40 px-8 py-2 font-semibold rounded-lg"
              aria-label={
                mode === "edit"
                  ? "Cancel service edit"
                  : "Cancel service creation"
              }
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || loadingData}
              className="btn-primary w-40 px-8 py-2 font-semibold rounded-lg text-white"
              aria-label={
                mode === "edit" ? "Update service" : "Register service"
              }
            >
              {loading
                ? mode === "edit"
                  ? "Actualizando..."
                  : "Registrando..."
                : mode === "edit"
                ? "Actualizar"
                : "Registrar"}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        title={
          <span className="parametrization-text">
            {mode === "edit" ? "¡Actualizado!" : "¡Creado!"}
          </span>
        }
        message={<span className="parametrization-text">{successMsg}</span>}
      />

      {/* Modal de error */}
      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        title={<span className="parametrization-text">Error</span>}
        message={<span className="parametrization-text">{errorMsg}</span>}
      />
    </div>
  );
}
