"use client";
import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { FiX, FiUserPlus } from "react-icons/fi";
import { SuccessModal, ErrorModal } from "@/app/components/shared/SuccessErrorModal";

export default function ValidatePreRequestModal({ isOpen, onClose, request, onSuccess }) {
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [step, setStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isNewClient, setIsNewClient] = useState(false);
  const [clientData, setClientData] = useState(null);
  const [machineryOperatorList, setMachineryOperatorList] = useState([]);

  const steps = [
    { id: 1, name: "Información del Cliente" },
    { id: 2, name: "Información de la Solicitud" },
    { id: 3, name: "Condiciones de Ubicación y Terreno" },
  ];

  const defaultValues = {
    identificationNumber: "",
    clientType: "",
    fullName: "",
    documentType: "",
    email: "",
    phoneNumber: "",
    requestDetails: "",
    scheduledStartDate: "",
    endDate: "",
    paymentMethod: "",
    paymentStatus: "",
    amountPaid: "",
    amountToBePaid: "",
    amountPaidCurrency: "USD",
    amountToBePaidCurrency: "USD",
    availableMachinery: "",
    availableOperator: "",
    department: "",
    city: "",
    country: "",
    placeName: "",
    latitude: "",
    longitude: "",
    area: "",
    areaUnit: "ha",
    soilType: "",
    humidityLevel: "",
    altitude: "",
    altitudeUnit: "ft",
  };

  const methods = useForm({
    defaultValues,
    mode: "onTouched",
    shouldFocusError: false,
  });

  const { reset, watch } = methods;

  // Cuando se abre el modal, reiniciar el formulario
  useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
      setStep(0);
      setCompletedSteps([]);
      setIsNewClient(false);
      setClientData(null);
      setMachineryOperatorList([]);
    }
  }, [isOpen]);

  // Función para buscar cliente por número de identificación
  const handleSearchClient = async () => {
    const identificationNumber = methods.getValues("identificationNumber");

    if (!identificationNumber) {
      return;
    }

    try {
      // TODO: Llamar API para buscar cliente
      // const response = await searchClient(identificationNumber);

      // Simulación de respuesta (reemplazar con llamada real al API)
      const mockClient = {
        clientType: "Natural Person",
        fullName: "Linda Valentina Lopez Rubiano",
        documentType: "Cédula de Ciudadanía",
        identificationNumber: "1.222.333.444",
        email: "livaloru@correo.com",
        phoneNumber: "3101232345"
      };

      setClientData(mockClient);
      methods.setValue("clientType", mockClient.clientType);
      methods.setValue("fullName", mockClient.fullName);
      methods.setValue("documentType", mockClient.documentType);
      methods.setValue("email", mockClient.email);
      methods.setValue("phoneNumber", mockClient.phoneNumber);
      setIsNewClient(false);
    } catch (error) {
      console.error("Error al buscar cliente:", error);
      setClientData(null);
      setIsNewClient(false);
    }
  };

  // Agregar maquinaria y operador a la lista
  const handleAddMachineryOperator = () => {
    const machinery = methods.getValues("availableMachinery");
    const operator = methods.getValues("availableOperator");

    if (!machinery || !operator) {
      return;
    }

    const newItem = {
      id: Date.now(),
      machine: "Tractor para banano",
      serialNumber: "CAT123812381093",
      operator: operator
    };

    setMachineryOperatorList([...machineryOperatorList, newItem]);
    methods.setValue("availableMachinery", "");
    methods.setValue("availableOperator", "");
  };

  // Eliminar maquinaria y operador de la lista
  const handleRemoveMachineryOperator = (id) => {
    setMachineryOperatorList(machineryOperatorList.filter(item => item.id !== id));
  };

  const nextStep = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    let valid = true;
    let fieldsToValidate = [];

    // Validar SOLO los campos del paso actual
    if (step === 0) {
      fieldsToValidate = ["identificationNumber"];
    } else if (step === 1) {
      fieldsToValidate = ["requestDetails", "scheduledStartDate", "endDate"];
    } else if (step === 2) {
      fieldsToValidate = [
        "country",
        "department",
        "city",
        "placeName",
        "latitude",
        "longitude",
        "area",
        "areaUnit",
        "soilType",
        "humidityLevel",
        "altitude",
        "altitudeUnit",
      ];
    }

    // Validar solo los campos del paso actual
    valid = await methods.trigger(fieldsToValidate);

    if (!valid) {
      console.log('Validación fallida en paso:', step + 1);
      return;
    }

    // Marcar el paso como completado y avanzar
    setCompletedSteps((prev) => prev.includes(step) ? prev : [...prev, step]);
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const goToStep = (targetStep) => {
    if (completedSteps.includes(targetStep) || targetStep === 0) {
      setStep(targetStep);
    }
  };

  const handleConfirmValidation = async (formData) => {
    try {
      // TODO: Llamar API para validar y confirmar la pre-solicitud
      // const response = await validatePreRequest(request.id, formData);

      setModalMessage("Pre-solicitud validada exitosamente. La solicitud pasó a estado 'Pendiente'.");
      setSuccessOpen(true);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error al validar pre-solicitud:", error);
      setModalMessage("Error al validar la pre-solicitud.");
      setErrorOpen(true);
    }
  };

  // Step Indicator
  const StepIndicator = ({ steps, currentStep }) => (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {steps.map((stepItem, index) => {
          const isCompleted = completedSteps.includes(index);
          const isActive = currentStep === index;
          let status = "Pendiente";
          if (isCompleted && !isActive) status = "Completado";
          else if (isActive) status = "En progreso";

          return (
            <div key={stepItem.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => goToStep(index)}
                  disabled={!completedSteps.includes(index) && index !== 0}
                  className={`w-10 h-10 flex items-center justify-center rounded-full font-semibold border-2 transition-all duration-300
                    ${isActive ? "bg-red-500 text-white border-red-500" : isCompleted ? "bg-red-500 text-white border-red-500" : "bg-gray-200 text-gray-500 border-gray-300"}
                    ${!completedSteps.includes(index) && index !== 0 ? "cursor-not-allowed opacity-50" : "hover:shadow-md"}
                  `}
                >
                  {isCompleted && !isActive ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    stepItem.id
                  )}
                </button>
                <div className={`mt-2 text-xs text-center font-medium ${
                  isActive ? "text-red-500" : isCompleted ? "text-red-500" : "text-gray-500"
                }`}>
                  {stepItem.name}
                </div>
                <div className={`text-xs mt-1 ${
                  isActive ? "text-red-500" : isCompleted ? "text-red-500" : "text-gray-500"
                }`}>
                  {status}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 w-24 mx-4 transition-colors duration-300 ${
                  isCompleted ? "bg-red-500" : "bg-gray-300"
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="card-theme rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          <FormProvider {...methods}>
            <form
              className="p-6"
              onSubmit={(e) => {
                e.preventDefault();

                if (step !== steps.length - 1) {
                  return;
                }

                methods.handleSubmit(handleConfirmValidation)();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                  e.preventDefault();
                }
              }}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold parametrization-text">
                  Validar Pre-Solicitud
                </h2>
                <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
                  <FiX size={24} />
                </button>
              </div>

              {/* Progress Bar */}
              <StepIndicator steps={steps} currentStep={step} />

              {/* Step Content */}
              <div className="min-h-[400px]">
                {/* Step 1: Client Information */}
                {step === 0 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold parametrization-text mb-4">
                      Información del Cliente
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Busque un cliente existente ingresando su número de identificación o registre uno nuevo.
                    </p>

                    {/* Búsqueda de cliente */}
                    <div>
                      <label className="block text-sm font-medium parametrization-text mb-2">
                        Número de Identificación
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          {...methods.register("identificationNumber", { required: "Campo requerido" })}
                          className="parametrization-input flex-1"
                          placeholder="1222333444"
                          onBlur={handleSearchClient}
                        />
                        <button
                          type="button"
                          onClick={() => setIsNewClient(true)}
                          className="parametrization-filter-button flex items-center gap-2 px-4 py-2"
                        >
                          <FiUserPlus className="w-4 h-4" />
                          Agregar Nuevo Cliente
                        </button>
                      </div>
                      {methods.formState.errors.identificationNumber && (
                        <p className="text-red-500 text-xs mt-1">
                          {methods.formState.errors.identificationNumber.message}
                        </p>
                      )}
                    </div>

                    {/* Información del cliente encontrado */}
                    {clientData && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium parametrization-text">Tipo de Cliente:</p>
                            <p className="text-base parametrization-text">{clientData.clientType}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium parametrization-text">Nombre Completo/Razón Social:</p>
                            <p className="text-base parametrization-text">{clientData.fullName}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium parametrization-text">Tipo de Documento:</p>
                            <p className="text-base parametrization-text">{clientData.documentType}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium parametrization-text">Número de Identificación:</p>
                            <p className="text-base parametrization-text">{clientData.identificationNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium parametrization-text">Email:</p>
                            <p className="text-base parametrization-text">{clientData.email}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium parametrization-text">Número de Teléfono:</p>
                            <p className="text-base parametrization-text">{clientData.phoneNumber}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Request Information */}
                {step === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold parametrization-text mb-4">
                      Información de la Solicitud
                    </h3>

                    {/* Detalles de la solicitud */}
                    <div>
                      <label className="block text-sm font-medium parametrization-text mb-2">
                        Detalles de la Solicitud
                      </label>
                      <textarea
                        {...methods.register("requestDetails", { required: "Campo requerido" })}
                        className="parametrization-input"
                        rows="4"
                        placeholder="Describa los detalles de la solicitud..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {methods.watch("requestDetails")?.length || 0}/500 caracteres
                      </p>
                      {methods.formState.errors.requestDetails && (
                        <p className="text-red-500 text-xs mt-1">
                          {methods.formState.errors.requestDetails.message}
                        </p>
                      )}
                    </div>

                    {/* Fechas y pagos */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium parametrization-text mb-2">
                          Fecha de inicio programada
                        </label>
                        <input
                          type="date"
                          {...methods.register("scheduledStartDate", { required: "Campo requerido" })}
                          className="parametrization-input"
                        />
                        {methods.formState.errors.scheduledStartDate && (
                          <p className="text-red-500 text-xs mt-1">
                            {methods.formState.errors.scheduledStartDate.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium parametrization-text mb-2">
                          Fecha de fin
                        </label>
                        <input
                          type="date"
                          {...methods.register("endDate", { required: "Campo requerido" })}
                          className="parametrization-input"
                        />
                        {methods.formState.errors.endDate && (
                          <p className="text-red-500 text-xs mt-1">
                            {methods.formState.errors.endDate.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium parametrization-text mb-2">
                          Método de pago
                        </label>
                        <select
                          {...methods.register("paymentMethod")}
                          className="parametrization-input"
                        >
                          <option value="">Seleccione...</option>
                          <option value="cash">Efectivo</option>
                          <option value="card">Tarjeta</option>
                          <option value="transfer">Transferencia</option>
                        </select>
                      </div>
                    </div>

                    {/* Estados y montos */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium parametrization-text mb-2">
                          Estado de pago
                        </label>
                        <select
                          {...methods.register("paymentStatus")}
                          className="parametrization-input"
                        >
                          <option value="">Seleccione...</option>
                          <option value="pending">Pendiente</option>
                          <option value="partial">Pago parcial</option>
                          <option value="paid">Pagado</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium parametrization-text mb-2">
                          Monto pagado
                        </label>
                        <div className="flex gap-2">
                          <select
                            {...methods.register("amountPaidCurrency")}
                            className="parametrization-input w-24"
                          >
                            <option value="USD">USD</option>
                            <option value="COP">COP</option>
                          </select>
                          <input
                            type="number"
                            {...methods.register("amountPaid")}
                            className="parametrization-input flex-1"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium parametrization-text mb-2">
                          Monto por pagar
                        </label>
                        <div className="flex gap-2">
                          <select
                            {...methods.register("amountToBePaidCurrency")}
                            className="parametrization-input w-24"
                          >
                            <option value="USD">USD</option>
                            <option value="COP">COP</option>
                          </select>
                          <input
                            type="number"
                            {...methods.register("amountToBePaid")}
                            className="parametrization-input flex-1"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Maquinaria y Operador */}
                    <div>
                      <h4 className="text-base font-medium parametrization-text mb-3">
                        Maquinaria y Operador Disponibles
                      </h4>
                      <div className="flex gap-3 mb-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium parametrization-text mb-2">
                            Maquinaria disponible
                          </label>
                          <select
                            {...methods.register("availableMachinery")}
                            className="parametrization-input"
                          >
                            <option value="">Seleccione...</option>
                            <option value="tractor1">Tractor para banano</option>
                            <option value="excavator1">Excavadora CAT</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium parametrization-text mb-2">
                            Operador disponible
                          </label>
                          <select
                            {...methods.register("availableOperator")}
                            className="parametrization-input"
                          >
                            <option value="">Seleccione...</option>
                            <option value="Juan Pérez">Juan Pérez</option>
                            <option value="María García">María García</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={handleAddMachineryOperator}
                            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 whitespace-nowrap"
                          >
                            Agregar
                          </button>
                        </div>
                      </div>

                      {/* Lista de maquinaria y operadores */}
                      {machineryOperatorList.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full border border-gray-300">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium parametrization-text border-b">Máquina</th>
                                <th className="px-4 py-2 text-left text-sm font-medium parametrization-text border-b">Número de Serie</th>
                                <th className="px-4 py-2 text-left text-sm font-medium parametrization-text border-b">Operador</th>
                                <th className="px-4 py-2 text-left text-sm font-medium parametrization-text border-b">Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {machineryOperatorList.map((item) => (
                                <tr key={item.id} className="border-b">
                                  <td className="px-4 py-3 text-sm parametrization-text flex items-center gap-2">
                                    <span className="text-2xl">🚜</span>
                                    {item.machine}
                                  </td>
                                  <td className="px-4 py-3 text-sm parametrization-text">{item.serialNumber}</td>
                                  <td className="px-4 py-3 text-sm parametrization-text">{item.operator}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        className="text-blue-600 hover:text-blue-800 text-xs px-3 py-1 border border-blue-300 rounded"
                                      >
                                        ✏️ Editar
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveMachineryOperator(item.id)}
                                        className="text-red-600 hover:text-red-800 text-xs px-3 py-1 border border-red-300 rounded"
                                      >
                                        🗑️ Eliminar
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Location and Land Conditions */}
                {step === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold parametrization-text mb-4">
                      Condiciones de ubicación y terreno
                    </h3>

                    {/* Ubicación */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium parametrization-text mb-2">
                          Departamento
                        </label>
                        <select
                          {...methods.register("department", { required: "Campo requerido" })}
                          className="parametrization-input"
                        >
                          <option value="">Seleccione...</option>
                          <option value="valle">Valle del Cauca</option>
                          <option value="cundinamarca">Cundinamarca</option>
                        </select>
                        {methods.formState.errors.department && (
                          <p className="text-red-500 text-xs mt-1">
                            {methods.formState.errors.department.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium parametrization-text mb-2">
                          Municipio
                        </label>
                        <select
                          {...methods.register("city", { required: "Campo requerido" })}
                          className="parametrization-input"
                        >
                          <option value="">Seleccione...</option>
                          <option value="cali">Cali</option>
                          <option value="palmira">Palmira</option>
                        </select>
                        {methods.formState.errors.city && (
                          <p className="text-red-500 text-xs mt-1">
                            {methods.formState.errors.city.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium parametrization-text mb-2">
                          País
                        </label>
                        <select
                          {...methods.register("country", { required: "Campo requerido" })}
                          className="parametrization-input"
                        >
                          <option value="">Seleccione...</option>
                          <option value="colombia">Colombia</option>
                          <option value="ecuador">Ecuador</option>
                        </select>
                        {methods.formState.errors.country && (
                          <p className="text-red-500 text-xs mt-1">
                            {methods.formState.errors.country.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Nombre del lugar y coordenadas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium parametrization-text mb-2">
                          Nombre del lugar
                        </label>
                        <input
                          type="text"
                          {...methods.register("placeName", { required: "Campo requerido" })}
                          className="parametrization-input"
                          placeholder="Finca La Esperanza"
                        />
                        {methods.formState.errors.placeName && (
                          <p className="text-red-500 text-xs mt-1">
                            {methods.formState.errors.placeName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium parametrization-text mb-2">
                          Coordenadas
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            {...methods.register("latitude", { required: "Campo requerido" })}
                            className="parametrization-input flex-1"
                            placeholder="Latitud"
                          />
                          <input
                            type="text"
                            {...methods.register("longitude", { required: "Campo requerido" })}
                            className="parametrization-input flex-1"
                            placeholder="Longitud"
                          />
                        </div>
                        {(methods.formState.errors.latitude || methods.formState.errors.longitude) && (
                          <p className="text-red-500 text-xs mt-1">
                            Ambas coordenadas son requeridas
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium parametrization-text mb-2">
                          Área
                        </label>
                        <div className="flex gap-2">
                          <select
                            {...methods.register("areaUnit", { required: "Campo requerido" })}
                            className="parametrization-input w-24"
                          >
                            <option value="ha">ha</option>
                            <option value="m2">m²</option>
                          </select>
                          <input
                            type="number"
                            {...methods.register("area", { required: "Campo requerido" })}
                            className="parametrization-input flex-1"
                            placeholder="0.00"
                          />
                        </div>
                        {methods.formState.errors.area && (
                          <p className="text-red-500 text-xs mt-1">
                            {methods.formState.errors.area.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Condiciones del terreno */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium parametrization-text mb-2">
                          Tipo de suelo
                        </label>
                        <select
                          {...methods.register("soilType", { required: "Campo requerido" })}
                          className="parametrization-input"
                        >
                          <option value="">Seleccione...</option>
                          <option value="arcilloso">Arcilloso</option>
                          <option value="arenoso">Arenoso</option>
                          <option value="limoso">Limoso</option>
                        </select>
                        {methods.formState.errors.soilType && (
                          <p className="text-red-500 text-xs mt-1">
                            {methods.formState.errors.soilType.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium parametrization-text mb-2">
                          Nivel de humedad (%)
                        </label>
                        <input
                          type="number"
                          {...methods.register("humidityLevel", { required: "Campo requerido" })}
                          className="parametrization-input"
                          placeholder="0-100"
                        />
                        {methods.formState.errors.humidityLevel && (
                          <p className="text-red-500 text-xs mt-1">
                            {methods.formState.errors.humidityLevel.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium parametrization-text mb-2">
                          Altitud
                        </label>
                        <div className="flex gap-2">
                          <select
                            {...methods.register("altitudeUnit", { required: "Campo requerido" })}
                            className="parametrization-input w-24"
                          >
                            <option value="ft">ft</option>
                            <option value="m">m</option>
                          </select>
                          <input
                            type="number"
                            {...methods.register("altitude", { required: "Campo requerido" })}
                            className="parametrization-input flex-1"
                            placeholder="0"
                          />
                        </div>
                        {methods.formState.errors.altitude && (
                          <p className="text-red-500 text-xs mt-1">
                            {methods.formState.errors.altitude.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Anterior
                  </button>
                )}
                {step === 0 && <div></div>}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
                  >
                    Cancelar
                  </button>
                  {step < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
                    >
                      Confirmar
                    </button>
                  )}
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>

      {/* Modales de éxito y error */}
      <SuccessModal
        isOpen={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          onClose();
        }}
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
}
