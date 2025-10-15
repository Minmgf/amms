import { useFormContext } from "react-hook-form";

export default function Step1ClientInformation() {
  const {
    register,
    formState: { errors },
    getValues,
  } = useFormContext();

  const phoneCodes = [
    { code: "+57", country: "CO" },
    { code: "+1", country: "US" },
    { code: "+52", country: "MX" },
    { code: "+34", country: "ES" },
  ];

  // Valores por defecto / lectura (toman lo que tenga el form)
  const typeOfPerson = getValues("typeOfPerson") || "Natural";
  const documentationType = getValues("documentationType") || "Cédula de ciudadanía";
  const documentationNumber = getValues("documentationNumber") || "901457236";
  const checkDigit = getValues("checkDigit") || "4";
  const legalName = getValues("legalName") || "AgroCampos S.A.S";
  const businessName = getValues("businessName") || "AgroCampos";
  const fullName = getValues("fullName") || "AgroCampos S.A.S";
  const fullLastName = getValues("fullLastName") || "AgroCampos";

  return (
    <div id="Step-1-Client-Information">
      <h3 className="text-xl font-semibold mb-6 text-primary">
        Información del Cliente
      </h3>

      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex items-center">
                <span className="text-sm font-medium text-secondary w-48">Tipo de Persona:</span>
                <span className="text-sm text-gray-700">{typeOfPerson}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-secondary w-48">Tipo de Documento:</span>
                <span className="text-sm text-gray-700">{documentationType}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex items-center">
                <span className="text-sm font-medium text-secondary w-48">Número de Documento:</span>
                <span className="text-sm text-gray-700">{documentationNumber}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-secondary w-48">Dígito de Verificación:</span>
                <span className="text-sm text-gray-700">{checkDigit}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex items-center">
                <span className="text-sm font-medium text-secondary w-48">Razón Social:</span>
                <span className="text-sm text-gray-700">{legalName}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-secondary w-48">Nombre Comercial:</span>
                <span className="text-sm text-gray-700">{businessName}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex items-center">
                <span className="text-sm font-medium text-secondary w-48">Nombres:</span>
                <span className="text-sm text-gray-700">{fullName}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-secondary w-48">Apellidos:</span>
                <span className="text-sm text-gray-700">{fullLastName}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Régimen tributario
            </label>
            <select
              {...register("taxRegime", {
                required: "Este campo es obligatorio",
              })}
              className="parametrization-input w-full"
              aria-label="Tax Regime Select"
            >
              <option value="">Seleccione</option>
              <option value="Responsable IVA">Responsable IVA</option>
              <option value="No Responsable">No Responsable</option>
            </select>
            {errors.taxRegime && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.taxRegime.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Dirección:
            </label>
            <input
              type="text"
              {...register("address", {
                required: "Este campo es obligatorio",
              })}
              className="parametrization-input w-full"
              aria-label="Address Input"
              placeholder="Dirección"
            />
            {errors.address && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.address.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Email:
            </label>
            <input
              type="email"
              {...register("email", {
                required: "Este campo es obligatorio",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Correo electrónico inválido",
                },
              })}
              className="parametrization-input w-full"
              placeholder="correo@ejemplo.com"
              aria-label="Email Input"
            />
            {errors.email && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Número de teléfono:
            </label>
            <div className="flex gap-2">
              <select
                {...register("phoneCode")}
                className="parametrization-input w-24"
                aria-label="Phone Code Select"
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
                  required: "Este campo es obligatorio",
                  pattern: {
                    value: /^[0-9]{7,15}$/,
                    message: "Número de teléfono inválido",
                  },
                })}
                className="parametrization-input w-40"
                placeholder="3001234567"
                aria-label="Phone Number Input"
              />
            </div>
            {errors.phoneNumber && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.phoneNumber.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Region/City:
            </label>
            <select
              {...register("regionCity", {
                required: "Este campo es obligatorio",
              })}
              className="parametrization-input w-full"
              aria-label="Region/City Select"
            >
              <option value="">Seleccione</option>
              <option value="Bogotá">Bogotá</option>
              <option value="Medellín">Medellín</option>
              <option value="Cali">Cali</option>
            </select>
            {errors.regionCity && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.regionCity.message}
              </span>
            )}
          </div>

          <div />
        </div>
      </div>
    </div>
  );
}