"use client";
import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Step1ClientInfo from "./Step1ClientInfo";
import Step2RequestInfo from "./Step2RequestInfo";
import Step3LocationConditions from "./Step3LocationConditions";
// import de servicios
import { getCountries, getStates, getCities } from "@/services/locationService";
import { getAreaUnits, getAltitudeUnits, getSoilTypes, getActiveWorkers, getImplementTypes, getTextureTypes, getPaymentMethods, getPaymentStatus, getCurrencyUnits } from "@/services/requestService";
import { createPreRegister, createRequest, getRequestDetails, confirmRequest } from "@/services/requestService";
import { FiX } from "react-icons/fi";
import { SuccessModal, ErrorModal } from "@/app/components/shared/SuccessErrorModal";
// importa tus servicios reales para obtener options
import { getActiveMachineries } from "@/services/maintenanceService";

export default function MultiStepFormModal({ isOpen, onClose, requestToEdit, mode, onSuccess }) {
  const isEditMode = !!requestToEdit;
  const isConfirmMode = mode === 'confirm';
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [step, setStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const steps = [
    { id: 1, name: "Información del Cliente" },
    { id: 2, name: "Información de la Solicitud" },
    { id: 3, name: "Condiciones de Ubicación y Terreno" },
  ];
  const [fuelPrediction, setFuelPrediction] = useState({});
  const [loadingRequestData, setLoadingRequestData] = useState(false);

  const defaultValues = {
    customer: "",
    requestDetails: "",
    scheduledStartDate: "",
    endDate: "",
    paymentMethod: "",
    paymentStatus: "",
    amountPaid: "",
    amountToBePaid: "",
    amountPaidCurrency: "",
    amountToBePaidCurrency: "",
    department: "",
    city: "",
    country: "",
    placeName: "",
    latitude: "",
    longitude: "",
    area: "",
    areaUnit: "",
    soilType: "",
    humidityLevel: "",
    altitude: "",
    altitudeUnit: "",
    machineryList: [], // persistir lista temporal aquí
  };

  // Datos estáticos de ejemplo para el modo de confirmación
  const getConfirmModeData = () => ({
    identificationNumber: requestToEdit?.client?.idNumber || "900123456",
    customer: "1", // ID del cliente (estático)
    customerName: requestToEdit?.client?.name || "Empresa Agrícola S.A.",
    customerPhone: "+57 310 456 7821",
    customerEmail: "contacto@empresaagricola.com",
    requestDetails: "Servicio de mantenimiento preventivo y correctivo de maquinaria agrícola en terreno de cultivo de banano",
    scheduledStartDate: "2025-02-15",
    endDate: "2025-02-20",
    paymentMethod: "2", // Crédito
    paymentStatus: "1", // Pendiente
    amountPaid: "0",
    amountToBePaid: "8500000",
    amountPaidCurrency: "COP",
    amountToBePaidCurrency: "COP",
    requestedMachinery: "Tractor para banano - CAT12381238109",
    requestedOperator: "Juan Pérez",
    country: "48", // Colombia
    department: "73", // Tolima
    city: "268", // Espinal
    placeName: "Finca La Esperanza - Vereda El Cocal",
    latitude: "4.1530",
    longitude: "-74.8830",
    area: "15.5",
    areaUnit: "ha",
    soilType: "1", // Arcilloso
    humidityLevel: "42",
    altitude: "420",
    altitudeUnit: "m",
  });

  const methods = useForm({
    defaultValues,
    mode: "onTouched",
    shouldFocusError: false,
  });
  const { reset } = methods;

  // cachear options en el padre para que no se vuelvan a fetch al montar/desmontar
  const [machineryOptions, setMachineryOptions] = useState([]);
  const [operatorOptions, setOperatorOptions] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  // estados para options de Step3 (elevados al padre)
  const [countriesList, setCountriesList] = useState([]);
  const [areaUnits, setAreaUnits] = useState([]);
  const [altitudeUnits, setAltitudeUnits] = useState([]);
  const [soilTypes, setSoilTypes] = useState([]);
  const [implementTypes, setImplementTypes] = useState([]);
  const [textureTypes, setTextureTypes] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentStatuses, setPaymentStatuses] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const machs = await getActiveMachineries();
        const ops = await getActiveWorkers();
        const cur = await getCurrencyUnits();
        const countries = await getCountries();
        const areas = await getAreaUnits();
        const altitudes = await getAltitudeUnits();
        const soils = await getSoilTypes();
        const implement = await getImplementTypes();
        const texture = await getTextureTypes();
        const payMethods = await getPaymentMethods();
        const payStatus = await getPaymentStatus();

        if (!mounted) return;
        setMachineryOptions(Array.isArray(machs?.data) ? machs.data : (Array.isArray(machs) ? machs : []));
        setOperatorOptions(Array.isArray(ops?.data) ? ops.data : (Array.isArray(ops) ? ops : []));
        const currencyArray = Array.isArray(cur?.data) ? cur.data : (Array.isArray(cur) ? cur : []);
        setCurrencies(currencyArray);
        setCountriesList(Array.isArray(countries) ? countries : (Array.isArray(countries?.data) ? countries.data : []));
        setAreaUnits(Array.isArray(areas) ? areas : (Array.isArray(areas?.data) ? areas.data : []));
        setAltitudeUnits(Array.isArray(altitudes) ? altitudes : (Array.isArray(altitudes?.data) ? altitudes.data : []));
        setSoilTypes(Array.isArray(soils) ? soils : (Array.isArray(soils?.data) ? soils.data : []));
        setImplementTypes(Array.isArray(implement) ? implement : (Array.isArray(implement?.data) ? implement.data : []));
        setTextureTypes(Array.isArray(texture) ? texture : (Array.isArray(texture?.data) ? texture.data : []));
        setPaymentMethods(Array.isArray(payMethods) ? payMethods : (Array.isArray(payMethods?.data) ? payMethods.data : []));
        setPaymentStatuses(Array.isArray(payStatus) ? payStatus : (Array.isArray(payStatus?.data) ? payStatus.data : []));
        // opcional: set default currency in form if exist
        if (currencyArray.length > 0 && mode !== 'confirm') {
          methods.setValue("amountPaidCurrency", currencyArray[0].id);
          methods.setValue("amountToBePaidCurrency", currencyArray[0].id);
        }
      } catch (err) {
        console.error("Error cargando opciones", err);
      }
    })();
    return () => { mounted = false; };
  }, [isOpen]); // fetch cuando se abra el modal

  const fetchStates = async (countryCode) => {
    try {
      const res = await getStates(countryCode);
      return Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetchStates:", err);
      return [];
    }
  };

  const fetchCities = async (countryCode, stateCode) => {
    try {
      const res = await getCities(countryCode, stateCode);
      return Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetchCities:", err);
      return [];
    }
  };

  // Cuando se abre el modal, configurar valores según el modo
  useEffect(() => {
    if (isOpen && (mode === "preregister" || mode === "register")) {
      reset(defaultValues);
      setStep(0);
      setCompletedSteps([]);
    }
  }, [isOpen]);

  // Cargar datos de la solicitud cuando está en modo confirm
  useEffect(() => {
    if (isOpen && mode === 'confirm' && requestToEdit) {
      const loadRequestData = async () => {
        setLoadingRequestData(true);
        try {
          // Obtener el ID de la solicitud desde requestToEdit
          const requestId = requestToEdit.requestCode || requestToEdit.id;
          console.log('📥 Cargando datos de solicitud:', requestId);
          
          const requestData = await getRequestDetails(requestId);
          console.log('✅ Datos de solicitud obtenidos:', requestData);

          // Mapear los datos del API a los valores del formulario
          const mappedValues = {
            // Step 1 - Cliente
            identificationNumber: requestData.customer_document_number?.toString() || "",
            customer: requestData.customer_id || "",
            
            // Step 2 - Información de solicitud
            requestDetails: requestData.request_detail || "",
            scheduledStartDate: requestData.scheduled_start_date || "",
            endDate: requestData.scheduled_end_date || "",
            paymentMethod: requestData.payment_method_code || "",
            paymentStatus: requestData.payment_status_id || "",
            amountPaid: requestData.amount_paid || "",
            amountToBePaid: requestData.amount_to_pay || "",
            amountPaidCurrency: requestData.currency_unit_amount_paid_id || "",
            amountToBePaidCurrency: requestData.currency_unit_amount_to_pay_id || "",
            
            // Step 3 - Ubicación
            country: requestData.request_location?.country || "",
            department: requestData.request_location?.department || "",
            city: requestData.request_location?.city_id || "",
            placeName: requestData.request_location?.place_name || "",
            latitude: requestData.request_location?.latitude?.toString() || "",
            longitude: requestData.request_location?.longitude?.toString() || "",
            area: requestData.request_location?.area?.toString() || "",
            areaUnit: requestData.request_location?.area_unit_id || "",
            altitude: requestData.request_location?.altitude?.toString() || "",
            altitudeUnit: requestData.request_location?.altitude_unit_id || "",
            
            // Maquinaria y operarios
            machineryList: (requestData.request_machinery_user || []).map(item => ({
              machinery: { 
                id_machinery: item.machinery_id,
                name: item.machinery_name || "Maquinaria"
              },
              operator: { 
                id: item.user_id,
                name: item.user_name || "Operario"
              }
            }))
          };

          // Aplicar todos los valores al formulario
          Object.entries(mappedValues).forEach(([key, value]) => {
            methods.setValue(key, value);
          });

          setStep(0);
          setCompletedSteps([]);
          console.log('✅ Formulario precargado con datos de la solicitud');
        } catch (error) {
          console.error('❌ Error cargando datos de solicitud:', error);
          setModalMessage("Error al cargar los datos de la solicitud. Por favor, intente nuevamente.");
          setErrorOpen(true);
        } finally {
          setLoadingRequestData(false);
        }
      };

      loadRequestData();
    }
  }, [isOpen, mode, requestToEdit]);

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

  function formatBackendErrors(errors) {
    let messages = [];
    for (const key in errors) {
      if (Array.isArray(errors[key])) {
        // Muestra non_field_errors sin el prefijo si quieres
        if (key === "non_field_errors") {
          messages.push(...errors[key]);
        } else {
          messages.push(`${key}: ${errors[key].join(" ")}`);
        }
      } else if (typeof errors[key] === "object" && errors[key] !== null) {
        for (const subKey in errors[key]) {
          messages.push(`${subKey}: ${errors[key][subKey].join(" ")}`);
        }
      }
    }
    return messages.join("\n");
  }

  const handleSubmitForm = async (formData) => {
    // Modo confirmación: enviar datos al endpoint de confirmar solicitud
    if (mode === "confirm") {
      console.log("🔄 Confirmando solicitud con datos:", formData);
      
      const requestId = requestToEdit?.requestCode || requestToEdit?.id;
      
      // Construir payload según la estructura requerida por el API
      const payload = {
        customer: formData.customer,
        request_detail: formData.requestDetails,
        scheduled_start_date: formData.scheduledStartDate,
        scheduled_end_date: formData.endDate,
        payment_method: formData.paymentMethod || null,
        payment_status: formData.paymentStatus || null,
        amount_paid: formData.amountPaid ? Number(formData.amountPaid) : null,
        currency_unit_amount_paid: formData.amountPaidCurrency || null,
        amount_to_pay: formData.amountToBePaid ? Number(formData.amountToBePaid) : null,
        currency_unit_amount_to_pay: formData.amountToBePaidCurrency || null,
        location: {
          country: formData.country,
          department: formData.department,
          city_id: formData.city,
          place_name: formData.placeName,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          area: formData.area ? Number(formData.area) : null,
          area_unit: formData.areaUnit || null,
          altitude: formData.altitude ? Number(formData.altitude) : null,
          altitude_unit: formData.altitudeUnit || null
        },
        machinery_users: (formData.machineryList || []).map((item, idx) => {
          const prediction = fuelPrediction[idx] || {};
          return {
            machinery_id: item.machinery?.id_machinery || null,
            user_id: item.operator?.id || null,
            soil_type: prediction.soilType ?? null,
            texture: prediction.texture ?? null,
            humidity_level: prediction.humidity ?? null,
            implementation: prediction.implementation ?? null,
            depth: prediction.workDepth ?? null,
            slope: prediction.slope ?? null,
            work_duration: prediction.estimatedHours ?? null
          };
        })
      };

      console.log('📤 Payload para confirmar solicitud:', payload);

      try {
        const response = await confirmRequest(requestId, payload);
        console.log('✅ Solicitud confirmada exitosamente:', response);
        setModalMessage(response.message || "Solicitud confirmada exitosamente. La solicitud pasó a estado 'Pendiente'.");
        setSuccessOpen(true);
        reset();
        setFuelPrediction({});
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error('❌ Error confirmando solicitud:', error);
        const errorMessage = error.response?.data?.errors 
          ? formatBackendErrors(error.response.data.errors)
          : error.response?.data?.message || "Error al confirmar la solicitud. Por favor, intente nuevamente.";
        setModalMessage(errorMessage);
        setErrorOpen(true);
      }
      return;
    }

    // Construir el payload para preregistro/registro
    const payload = {
      customer: formData.customer,
      request_detail: formData.requestDetails,
      scheduled_start_date: formData.scheduledStartDate,
      scheduled_end_date: formData.endDate,
      location: {
        country: formData.country,
        department: formData.department,
        city_id: formData.city,
        place_name: formData.placeName,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        area: formData.area,
        area_unit: formData.areaUnit,
        altitude: parseFloat(formData.altitude),
        altitude_unit: formData.altitudeUnit,
      }
    };

    if (mode === "preregister") {
      try{
        const response = await createPreRegister(payload);
        setModalMessage(response.message || "Preregistro creado exitosamente.");
        setSuccessOpen(true);
        reset();
        onSuccess();
      } catch (error) {
        console.log(error);
        setModalMessage(formatBackendErrors(error.response.data.errors) || "Error al crear el preregistro.");
        setErrorOpen(true);
      }
    } else if (mode === "register"){
      // completar campos de pago y montos
      payload.payment_method = formData.paymentMethod || null;
      payload.payment_status = formData.paymentStatus !== "" && formData.paymentStatus != null
        ? (isNaN(Number(formData.paymentStatus)) ? formData.paymentStatus : Number(formData.paymentStatus))
        : null;
      payload.amount_paid = formData.amountPaid !== "" ? Number(formData.amountPaid) : null;
      payload.currency_unit_amount_paid = formData.amountPaidCurrency;
      payload.amount_to_pay = formData.amountToBePaid !== "" ? Number(formData.amountToBePaid) : null;
      payload.currency_unit_amount_to_pay = formData.amountToBePaidCurrency;

      // mapear machineryList -> machinery_users
      const machineryList = formData.machineryList || [];
      const machinery_users = machineryList.map((item, idx) => {
        const machineryId = item.machinery.id_machinery || {};
        const userId = item.operator.id || {};
        const prediction = fuelPrediction[idx] || {};

        return {
          machinery_id: machineryId,
          user_id: userId,
          soil_type: prediction.soilType ?? null,
          texture: prediction.texture ?? null,
          humidity_level: prediction.humidity ?? null,
          implementation: prediction.implementation ?? null,
          depth: prediction.workDepth ?? null,
          slope: prediction.slope ?? null,
          work_duration: prediction.estimatedHours ?? null
        };
      });

      payload.machinery_users = machinery_users;

      // Aquí puedes enviar payload al servicio correspondiente (ejemplo console.log)
      console.log("Payload para registro:", payload);
      try{
        const response = await createRequest(payload);
        setModalMessage(response.message || "Solicitud creada exitosamente.");
        setSuccessOpen(true);
        reset();
        setFuelPrediction(null);
        onSuccess();
      } catch (error) {
        console.log(error);
        setModalMessage(formatBackendErrors(error.response.data.errors) || "Error al crear la solicitud.");
        setErrorOpen(true);        
      }
    }else{
      console.log("Modo desconocido:", mode);
    }    
  };

  // Step Indicator
  const StepIndicator = ({ steps, currentStep }) => (
    <div className="mb-4 sm:mb-6 md:mb-8">
      <div className="flex items-center justify-between">
        {steps.map((stepItem, index) => {
          const isCompleted = completedSteps.includes(index);
          const isActive = currentStep === index;
          let status = "Pendiente";
          if (isCompleted && !isActive) status = "Completo";
          else if (isActive) status = "En progreso";
          return (
            <div key={stepItem.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => goToStep(index)}
                  disabled={!completedSteps.includes(index) && index !== 0}
                  className={`w-8 h-8 flex items-center justify-center rounded-full font-theme-bold border-2 transition-all duration-300
                    ${isActive ? "bg-accent text-white" : isCompleted ? "bg-success text-white border-success" : "bg-surface text-secondary border-primary"}
                    ${!completedSteps.includes(index) && index !== 0 ? "cursor-not-allowed opacity-50" : "hover:shadow-md"}
                  `}
                  style={{
                    backgroundColor: isActive
                      ? "var(--color-accent)"
                      : isCompleted
                        ? "var(--color-success)"
                        : "var(--color-surface)",
                    borderColor: isActive
                      ? "var(--color-accent)"
                      : isCompleted
                        ? "var(--color-success)"
                        : "var(--color-border)",
                    color: isActive || isCompleted ? "white" : "var(--color-text-secondary)",
                  }}
                >
                  {isCompleted && !isActive ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    stepItem.id
                  )}
                </button>
                <div className="mt-2 text-xs text-center font-theme-medium"
                  style={{
                    color: status === "En progreso"
                      ? "var(--color-accent)"
                      : status === "Completo"
                        ? "var(--color-success)"
                        : "var(--color-text-secondary)",
                  }}>
                  {stepItem.name}
                </div>
                <div className="text-xs mt-1"
                  style={{
                    color: status === "En progreso"
                      ? "var(--color-accent)"
                      : status === "Completo"
                        ? "var(--color-success)"
                        : "var(--color-text-secondary)",
                  }}>
                  {status}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="h-0.5 w-12 mx-4 transition-colors duration-300"
                  style={{
                    backgroundColor: isCompleted
                      ? "var(--color-success)"
                      : "var(--color-border)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ padding: "var(--spacing-sm)" }}>
      <div className="modal-theme" style={{
        width: "100%",
        minWidth: "280px",
        maxWidth: "min(95vw, 900px)",
        maxHeight: "min(95vh, 700px)",
        overflowY: "auto",
        margin: "0 auto",
      }}>
        <FormProvider {...methods}>
          <form
            className="p-3 sm:p-6 md:p-8 lg:p-theme-xl"
            onSubmit={(e) => {
              e.preventDefault();
              
              // Solo permitir submit en el último paso
              if (step !== steps.length - 1) {
                return;
              }
              
              // Ejecutar el submit solo en el último paso
              methods.handleSubmit(handleSubmitForm)();
            }}
            onKeyDown={(e) => {
              // Prevenir Enter en todos los inputs excepto textareas
              if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
              }
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4 sm:mb-6 md:mb-8">
              <h2 className="text-lg sm:text-xl md:text-theme-xl font-theme-semibold text-primary">
                {mode === "confirm"
                  ? "Confirmar Solicitud de Servicio"
                  : isEditMode
                    ? "Editar Solicitud de Servicio"
                    : mode === "preregister"
                      ? "Preregistro de Solicitud de Servicio"
                      : "Nueva Solicitud de Servicio"}
              </h2>
              <button type="button" onClick={onClose} className="text-secondary hover:text-primary">
                <FiX size={18} />
              </button>
            </div>
            {/* Progress Bar */}
            <StepIndicator steps={steps} currentStep={step} />
            {/* Step Content */}
            <div style={{ minHeight: "300px" }} className="sm:min-h-[400px]">
              {loadingRequestData ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
                    <p className="text-secondary">Cargando datos de la solicitud...</p>
                  </div>
                </div>
              ) : (
                <>
                  {step === 0 && <Step1ClientInfo mode={mode} />}
                  {step === 1 && (
                    <Step2RequestInfo
                      mode={mode}
                      // pasar options y handlers como props para evitar remount resets
                      machineryOptions={machineryOptions}
                      operatorOptions={operatorOptions}
                      currencies={currencies}
                      soilTypes={soilTypes}
                      implementTypes={implementTypes}
                      textureTypes={textureTypes}
                      paymentMethods={paymentMethods}
                      paymentStatuses={paymentStatuses}
                      setFuelPrediction={setFuelPrediction}
                      fuelPrediction={fuelPrediction}
                    />
                  )}
                  {step === 2 && (
                    <Step3LocationConditions
                      countriesList={countriesList}
                      areaUnits={areaUnits}
                      altitudeUnits={altitudeUnits}
                      fetchStates={fetchStates}
                      fetchCities={fetchCities}
                    />
                  )}
                </>
              )}
            </div>
            {/* Navigation */}
            <div className="flex flex-row justify-between items-center mt-6 sm:mt-theme-xl pt-4 sm:pt-theme-lg">
              <button
                type="button"
                aria-label="Preview Button"
                onClick={prevStep}
                disabled={step === 0}
                className="btn-theme btn-secondary w-auto"
              >
                Anterior
              </button>
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  aria-label="Next Button"
                  onClick={nextStep}
                  className="btn-theme btn-primary w-auto"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  aria-label={mode === "confirm" ? "Confirm Button" : "Save Button"}
                  className="btn-theme btn-primary w-auto"
                >
                  {mode === "confirm" ? "Confirmar" : "Guardar"}
                </button>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
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
    </div>
  );
}