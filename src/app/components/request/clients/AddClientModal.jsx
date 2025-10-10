"use client";
import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { useTheme } from "@/contexts/ThemeContext";
import { SuccessModal, ErrorModal } from "../../shared/SuccessErrorModal";

const AddClientModal = ({
  isOpen,
  onClose,
  onSuccess,
  defaultValues = {},
}) => {
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors }
  } = useForm({
    defaultValues,
  });
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  const [loading, setLoading] = useState(false);
  
  // Modales de éxito y error
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Datos para selects
  const identificationTypes = [
    { id: 1, name: "Cédula de Ciudadanía" },
    { id: 2, name: "Cédula de Extranjería" },
    { id: 3, name: "NIT" },
    { id: 4, name: "Pasaporte" },
  ];

  const personTypes = [
    { id: 1, name: "Persona Natural" },
    { id: 2, name: "Persona Jurídica" },
  ];

  const phoneCodes = [
    { code: "+57", country: "CO" },
    { code: "+1", country: "US" },
    { code: "+52", country: "MX" },
    { code: "+34", country: "ES" },
  ];

  const taxRegimes = [
    { id: 1, name: "Régimen Simplificado" },
    { id: 2, name: "Régimen Común" },
    { id: 3, name: "Gran Contribuyente" },
  ];

  const regions = [
    { id: 1, name: "Huila" },
    { id: 2, name: "Cundinamarca" },
    { id: 3, name: "Antioquia" },
    { id: 4, name: "Valle del Cauca" },
    { id: 5, name: "Atlántico" },
  ];

  const handleFormSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        identification_number: data.identificationNumber,
        identification_type: data.identificationType,
        check_digit: data.checkDigit,
        person_type: data.personType,
        legal_name: data.legalName,
        business_name: data.businessName,
        full_name: data.fullName,
        first_last_name: data.firstLastName,
        second_last_name: data.secondLastName,
        email: data.email,
        phone_code: data.phoneCode,
        phone_number: data.phoneNumber,
        address: data.address,
        tax_regime: data.taxRegime,
        region: data.region,
      };
      
      // Aquí iría la llamada al servicio API
      // const response = await createClient(payload);
      
      const isUpdate = defaultValues?.identificationNumber;
      setModalMessage(isUpdate ? "Cliente actualizado con éxito." : "Cliente registrado con éxito.");
      setSuccessOpen(true);
      
      if (onSuccess) {
        onSuccess();
      }
      
      setTimeout(() => {
        setSuccessOpen(false);
        reset();
        onClose();            
      }, 2000);
    } catch (error) {
      const apiError = error.response?.data;
      if (apiError) {
        let fullMessage = apiError.message;
        if (apiError.details) {
          const detailsArray = Object.values(apiError.details).flat();
          fullMessage += `: ${detailsArray.join(" ")}`;
        }
        setModalMessage(fullMessage);
        setErrorOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        id="Client Registration Modal"
      >
        <div
          className="bg-background rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 text-primary">
              {defaultValues?.identificationNumber ? "Actualizar Cliente" : "Registrar Cliente"}
            </h2>
            <button
              aria-label="Close Modal Button"
              onClick={() => {
                onClose();
                reset();
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Modal Content */}
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

              {/* Columna Izquierda */}
              <div className="space-y-6">
                {/* Número de Identificación */}
                <div>
                  <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                    Número de Identificación
                  </label>
                  <input
                    type="text"
                    {...register("identificationNumber", { 
                      required: "Este campo es obligatorio.",
                      pattern: {
                        value: /^[0-9]+$/,
                        message: "Solo se permiten números."
                      }
                    })}
                    className="parametrization-input w-full"
                    aria-label="Identification Number Input"
                    placeholder="Digite número de identificación"
                  />
                  {errors.identificationNumber && (
                    <span className="text-xs text-red-500 mt-1 block">
                      {errors.identificationNumber.message}
                    </span>
                  )}
                </div>

                {/* Check Digit */}
                <div>
                  <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                    Dígito de Verificación
                  </label>
                  <input
                    type="text"
                    {...register("checkDigit", { 
                      pattern: {
                        value: /^[0-9]{1}$/,
                        message: "Solo un dígito."
                      }
                    })}
                    className="parametrization-input w-full"
                    aria-label="Check Digit Input"
                    placeholder="Dígito de verificación"
                    maxLength={1}
                    onKeyDown={(e) => {
                      if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                        e.preventDefault();
                      }
                    }}
                  />
                  {errors.checkDigit && (
                    <span className="text-xs text-red-500 mt-1 block">
                      {errors.checkDigit.message}
                    </span>
                  )}
                </div>

                {/* Nombre Legal */}
                <div>
                  <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                    Nombre Legal
                  </label>
                  <input
                    type="text"
                    {...register("legalName")}
                    className="parametrization-input w-full"
                    aria-label="Legal Name Input"
                    placeholder="Nombre legal"
                  />
                </div>

                {/* Nombre Completo */}
                <div>
                  <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    {...register("fullName", { required: "Este campo es obligatorio." })}
                    className="parametrization-input w-full"
                    aria-label="Full Name Input"
                    placeholder="Nombre completo"
                  />
                  {errors.fullName && (
                    <span className="text-xs text-red-500 mt-1 block">
                      {errors.fullName.message}
                    </span>
                  )}
                </div>

                {/* Segundo Apellido */}
                <div>
                  <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                    Segundo Apellido
                  </label>
                  <input
                    type="text"
                    {...register("secondLastName")}
                    className="parametrization-input w-full"
                    aria-label="Second Last Name Input"
                    placeholder="Segundo apellido"
                  />
                </div>

                {/* Correo Electrónico */}
                <div>
                  <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    {...register("email", { 
                      required: "Este campo es obligatorio.",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Correo electrónico inválido."
                      }
                    })}
                    className="parametrization-input w-full"
                    aria-label="Email Input"
                    placeholder="Digite el email"
                  />
                  {errors.email && (
                    <span className="text-xs text-red-500 mt-1 block">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                {/* Régimen Fiscal */}
                <div>
                  <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                    Régimen Fiscal
                  </label>
                  <select
                    {...register("taxRegime")}
                    className="parametrization-input w-full"
                    aria-label="Tax Regime Select"
                    defaultValue=""
                  >
                    <option value="">Seleccione régimen fiscal</option>
                    {taxRegimes.map((regime) => (
                      <option key={regime.id} value={regime.id}>
                        {regime.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Columna Derecha */}
              <div className="space-y-6">
                {/* Tipo de Identificación */}
                <div>
                  <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Identificación
                  </label>
                  <select
                    {...register("identificationType", { required: "Este campo es obligatorio." })}
                    className="parametrization-input w-full"
                    aria-label="Identification Type Select"
                    defaultValue=""
                  >
                    <option value="">Seleccione el tipo</option>
                    {identificationTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {errors.identificationType && (
                    <span className="text-xs text-red-500 mt-1 block">
                      {errors.identificationType.message}
                    </span>
                  )}
                </div>

                {/* Tipo de Persona */}
                <div>
                  <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Persona
                  </label>
                  <select
                    {...register("personType", { required: "Este campo es obligatorio." })}
                    className="parametrization-input w-full"
                    aria-label="Person Type Select"
                    defaultValue=""
                  >
                    <option value="">Seleccione el tipo</option>
                    {personTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {errors.personType && (
                    <span className="text-xs text-red-500 mt-1 block">
                      {errors.personType.message}
                    </span>
                  )}
                </div>

                {/* Razón Social */}
                <div>
                  <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                    Razón Social
                  </label>
                  <input
                    type="text"
                    {...register("businessName")}
                    className="parametrization-input w-full"
                    aria-label="Business Name Input"
                    placeholder="Razón social"
                  />
                </div>

                {/* Primer Apellido */}
                <div>
                  <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                    Primer Apellido
                  </label>
                  <input
                    type="text"
                    {...register("firstLastName", { required: "Este campo es obligatorio." })}
                    className="parametrization-input w-full"
                    aria-label="First Last Name Input"
                    placeholder="Primer apellido"
                  />
                  {errors.firstLastName && (
                    <span className="text-xs text-red-500 mt-1 block">
                      {errors.firstLastName.message}
                    </span>
                  )}
                </div>

                {/* Número de Teléfono */}
                <div>
                  <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                    Número de Teléfono
                  </label>
                  <div className="flex gap-2">
                    <select
                      {...register("phoneCode", { required: true })}
                      className="parametrization-input w-24"
                      aria-label="Phone Code Select"
                      defaultValue="+57"
                    >
                      {phoneCodes.map((phone) => (
                        <option key={phone.code} value={phone.code}>
                          {phone.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      {...register("phoneNumber", { 
                        required: "Este campo es obligatorio.",
                        pattern: {
                          value: /^[0-9]{7,15}$/,
                          message: "Número de teléfono inválido."
                        }
                      })}
                      className="parametrization-input flex-1"
                      aria-label="Phone Number Input"
                      placeholder="Digite número de teléfono"
                      onKeyDown={(e) => {
                        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <span className="text-xs text-red-500 mt-1 block">
                      {errors.phoneNumber.message}
                    </span>
                  )}
                </div>

                {/* Dirección */}
                <div>
                  <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    {...register("address")}
                    className="parametrization-input w-full"
                    aria-label="Address Input"
                    placeholder="Digite la dirección"
                  />
                </div>

                {/* Región/Ciudad */}
                <div>
                  <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                    Región/Ciudad
                  </label>
                  <select
                    {...register("region")}
                    className="parametrization-input w-full"
                    aria-label="Region Select"
                    defaultValue=""
                  >
                    <option value="">Seleccione región</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  reset();
                }}
                className="btn-error btn-theme w-80 px-8 py-2 font-semibold rounded-lg"
                aria-label="Cancel Button"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary w-80 px-8 py-2 font-semibold rounded-lg text-white"
                aria-label="Save Button"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Éxito"
        message={modalMessage}
      />
      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Error"
        message={modalMessage}
      />
    </>
  );
};

export default AddClientModal;