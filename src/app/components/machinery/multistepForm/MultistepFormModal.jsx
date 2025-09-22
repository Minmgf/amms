"use client";
import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Step1GeneralData from "./Step1GeneralData";
import Step2TrackerData from "./Step2TrackerData";
import Step3SpecificData from "./Step3SpecificData";
import Step4UsageInfo from "./Step4UsageInfo";
import Step5Maintenance from "./Step5Maintenance";
import Step6UploadDocs from "./Step6UploadDocs";
import { getCountries, getStates, getCities } from "@/services/locationService";
import { useTheme } from "@/contexts/ThemeContext";
import { FiX } from "react-icons/fi";

export default function MultiStepFormModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [countriesList, setCountriesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  
  // Hook del tema
  const { getCurrentTheme } = useTheme();

  const methods = useForm({
    defaultValues: {
      // Step 1 - General Data
      name: "",
      manufactureYear: "",
      serialNumber: "",
      machineryType: "",
      brand: "",
      model: "",
      tariff: "",
      category: "",
      country: "",
      department: "",
      city: "",
      telemetry: "",
      photo: null,

      // Step 2 - Tracker Data
      terminalSerial: "",
      chasisNumber: "",
      gpsSerial: "",
      engineNumber: "",

      // Step 3 - Specific Data
      enginePower: "",
      enginePowerUnit: "",
      engineType: "",
      cylinderCapacity: "",
      cylinderCapacityUnit: "",
      cylindersNumber: "",
      arrangement: "",
      traction: "",
      fuelConsumption: "",
      fuelConsumptionUnit: "",
      transmissionSystem: "",
      tankCapacity: "",
      tankCapacityUnit: "",
      carryingCapacity: "",
      carryingCapacityUnit: "",
      darftForce: "",
      darftForceUnit: "",
      operatingWeight: "",
      operatingWeightUnit: "",
      maxSpeed: "",
      maxSpeedUnit: "",
      maxOperatingAltitud: "",
      maxOperatingAltitudUnit: "",
      performanceUnit: "",
      performanceMin: "",
      performanceMax: "",
      dimensionsUnit: "",
      width: "",
      lenght: "",
      height: "",
      netWeight: "",
      netWeightUnit: "",
      airConditioning: "",
      airConditioningConsumption: "",
      airConditioningConsumptionUnit: "",
      maximumOperatingHydraulicPressure: "",
      maximumOperatingHydraulicPressureUnit: "",
      hydraulicPumpFlowRate: "",
      hydraulicPumpFlowRateUnit: "",
      hydraulicReservoryCapacity: "",
      hydraulicReservoryCapacityUnit: "",
      emissionLevel: "",
      cabinType: "",

      // Step 4 - Usage Information
      acquisitionDate: "",
      usageStatus: "",
      usedHours: "",
      mileage: "",
      mileageUnit: "",
      tenure: "",

      // Step 5 - Maintenance Data
      maintenace: "",
      usageHours: "",

      // Step 6 - Documentation
      documentName: "",
      file: "",
    },
  });

  const watchCountry = methods.watch("country");
  const watchState = methods.watch("department");

  // Cargar países al montar el componente
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countries = await getCountries();
        setCountriesList(countries);
      } catch (error) {
        console.error("Error loading countries:", error);
      }
    };

    if (isOpen) {
      loadCountries();
    }
  }, [isOpen]);

  // Cuando cambia el país, carga los estados/departamentos
  useEffect(() => {
    const loadStates = async () => {
      if (!watchCountry) {
        setStatesList([]);
        setCitiesList([]);
        return;
      }

      setIsLoadingStates(true);
      try {
        const states = await getStates(watchCountry);
        setStatesList(states);
        setCitiesList([]);
        // Resetear los campos dependientes
        methods.setValue("department", "");
        methods.setValue("city", "");
      } catch (error) {
        console.error("Error loading states:", error);
        setStatesList([]);
      } finally {
        setIsLoadingStates(false);
      }
    };

    loadStates();
  }, [watchCountry, methods]);

  // Cuando cambia el estado/departamento, carga las ciudades
  useEffect(() => {
    const loadCities = async () => {
      if (!watchCountry || !watchState) {
        setCitiesList([]);
        return;
      }

      setIsLoadingCities(true);
      try {
        const cities = await getCities(watchCountry, watchState);
        setCitiesList(cities);
        // Resetear el campo de ciudad
        methods.setValue("city", "");
      } catch (error) {
        console.error("Error loading cities:", error);
        setCitiesList([]);
      } finally {
        setIsLoadingCities(false);
      }
    };

    loadCities();
  }, [watchCountry, watchState, methods]);

  const steps = [
    { id: 1, name: "Ficha técnica general" },
    { id: 2, name: "Ficha técnica del rastreador" },
    { id: 3, name: "Ficha técnica específica" },
    { id: 4, name: "Información de uso" },
    { id: 5, name: "Mantenimiento periódico" },
    { id: 6, name: "Subir documentación" }
  ];

  const nextStep = () => {
    setStep((s) => {
      const newStep = Math.min(s + 1, steps.length - 1);
      if (!completedSteps.includes(s)) {
        setCompletedSteps((prev) => [...prev, s]);
      }
      return newStep;
    });
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const goToStep = (targetStep) => {
    if (completedSteps.includes(targetStep)) {
      setStep(targetStep);
    }
  };

  const onSubmit = (data) => {
    console.log("Final Data:", data);
    alert("Formulario enviado exitosamente!");
    onClose();
    methods.reset();
    setStep(0);
    setCompletedSteps([]);
  };

  // Función separada para manejar el evento de Next
  const handleNext = (e) => {
    e.preventDefault(); // Prevenir el submit del formulario
    nextStep();
  };

  // Step Indicator Component con clases temáticas
  const StepIndicator = ({ steps, currentStep }) => (
    <div className="mb-4 sm:mb-6 md:mb-8">
      {/* Vista desktop y tablet - horizontal */}
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((stepItem, index) => {
          const isCompleted = completedSteps.includes(index);
          const isActive = currentStep === index;

          let status = "Pendiente";
          if (isCompleted && !isActive) {
            status = "Completo";
          } else if (isActive && !isCompleted) {
            status = "En progreso";
          } else if (isActive && isCompleted) {
            status = "Completo";
          }

          return (
            <div key={stepItem.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => goToStep(index)}
                  disabled={!isCompleted && index !== 0}
                  className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xs sm:text-theme-sm font-theme-bold border-2 transition-all duration-300 ${
                    isActive
                      ? "bg-accent text-white" 
                      : isCompleted
                        ? "bg-success text-white border-success" 
                        : "bg-surface text-secondary border-primary"
                    } ${!isCompleted && index !== 0 ? "cursor-not-allowed opacity-50" : "hover:shadow-md"}`}
                  style={{
                    backgroundColor: isActive ? 'var(--color-accent)' : isCompleted ? 'var(--color-success)' : 'var(--color-surface)',
                    borderColor: isActive ? 'var(--color-accent)' : isCompleted ? 'var(--color-success)' : 'var(--color-border)',
                    color: isActive || isCompleted ? 'white' : 'var(--color-text-secondary)'
                  }}
                >
                  {isCompleted && !isActive ? (
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    stepItem.id
                  )}
                </button>

                <div className="mt-1 sm:mt-2 text-center max-w-20 sm:max-w-none">
                  <div
                    className={`text-xs sm:text-theme-xs font-theme-medium ${
                      status === "En progreso"
                        ? "text-accent"
                        : status === "Completo"
                          ? "text-success"
                          : "text-secondary"
                    }`}
                    style={{
                      color: status === "En progreso" 
                        ? 'var(--color-accent)' 
                        : status === "Completo" 
                          ? 'var(--color-success)' 
                          : 'var(--color-text-secondary)'
                    }}
                  >
                    <span className="hidden md:block">{stepItem.name}</span>
                    <span className="block md:hidden text-center leading-tight">{stepItem.name.split(' ').slice(0, 2).join(' ')}</span>
                  </div>
                  <div
                    className={`text-xs sm:text-theme-xs mt-0.5 sm:mt-1 ${
                      status === "En progreso"
                        ? "text-accent"
                        : status === "Completo"
                          ? "text-success"
                          : "text-secondary"
                    }`}
                    style={{
                      color: status === "En progreso" 
                        ? 'var(--color-accent)' 
                        : status === "Completo" 
                          ? 'var(--color-success)' 
                          : 'var(--color-text-secondary)'
                    }}
                  >
                    {status}
                  </div>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className="h-0.5 w-8 sm:w-12 md:w-16 mx-2 sm:mx-4 transition-colors duration-300"
                  style={{
                    backgroundColor: isCompleted ? 'var(--color-success)' : 'var(--color-border)'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Vista móvil - simplificada */}
      <div className="block sm:hidden">
        <div className="flex items-center justify-center space-x-1">
          {steps.map((stepItem, index) => {
            const isCompleted = completedSteps.includes(index);
            const isActive = currentStep === index;

            return (
              <div key={stepItem.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => goToStep(index)}
                  disabled={!isCompleted && index !== 0}
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-theme-bold border-2 transition-all duration-300 ${
                    isActive
                      ? "bg-accent text-white" 
                      : isCompleted
                        ? "bg-success text-white border-success" 
                        : "bg-surface text-secondary border-primary"
                    } ${!isCompleted && index !== 0 ? "cursor-not-allowed opacity-50" : ""}`}
                  style={{
                    backgroundColor: isActive ? 'var(--color-accent)' : isCompleted ? 'var(--color-success)' : 'var(--color-surface)',
                    borderColor: isActive ? 'var(--color-accent)' : isCompleted ? 'var(--color-success)' : 'var(--color-border)',
                    color: isActive || isCompleted ? 'white' : 'var(--color-text-secondary)'
                  }}
                >
                  {isCompleted && !isActive ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    stepItem.id
                  )}
                </button>
                {index < steps.length - 1 && (
                  <div
                    className="h-0.5 w-4 mx-1 transition-colors duration-300"
                    style={{
                      backgroundColor: isCompleted ? 'var(--color-success)' : 'var(--color-border)'
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="text-center mt-2">
          <div className="text-sm font-theme-medium text-primary">
            {steps[currentStep].name}
          </div>
          <div className="text-xs text-secondary mt-1">
            Paso {currentStep + 1} de {steps.length}
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  const isLastStep = step === steps.length - 1;

  return (
    <div className="modal-overlay" style={{ padding: 'var(--spacing-sm)' }}>
      <div 
        className="modal-theme" 
        style={{ 
          width: '100%',
          minWidth: '280px',
          maxWidth: 'min(95vw, 1200px)', 
          maxHeight: 'min(95vh, 900px)', 
          overflowY: 'auto',
          margin: '0 auto'
        }}
      >
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="p-3 sm:p-6 md:p-8 lg:p-theme-xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 sm:mb-6 md:mb-8">
              <h2 className="text-lg sm:text-xl md:text-theme-xl font-theme-semibold text-primary">
                Add Machinery
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-secondary hover:text-primary transition-colors duration-200 text-xl sm:text-theme-2xl font-theme-bold w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-theme-md hover:bg-hover"
                style={{ 
                  color: 'var(--color-text-secondary)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'var(--color-text)';
                  e.target.style.backgroundColor = 'var(--color-hover)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'var(--color-text-secondary)';
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <FiX size={16} className="sm:hidden" />
                <FiX size={18} className="hidden sm:block" />
              </button>
            </div>

            {/* Progress Bar */}
            <StepIndicator steps={steps} currentStep={step} />

            {/* Step Content */}
            <div style={{ minHeight: '300px' }} className="sm:min-h-[400px]">
              {step === 0 && 
                <Step1GeneralData 
                  countriesList={countriesList}
                  statesList={statesList}
                  citiesList={citiesList}
                  isLoadingStates={isLoadingStates}
                  isLoadingCities={isLoadingCities}
                />
              }
              {step === 1 && <Step2TrackerData />}
              {step === 2 && <Step3SpecificData />}
              {step === 3 && <Step4UsageInfo />}
              {step === 4 && <Step5Maintenance />}
              {step === 5 && <Step6UploadDocs />}
            </div>

            {/* Navigation */}
            <div 
              className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-theme-xl pt-4 sm:pt-theme-lg"
              style={{ 
                marginTop: 'var(--spacing-lg)', 
                paddingTop: 'var(--spacing-md)',
                borderTop: `1px solid var(--color-border)`
              }}
            >
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 0}
                className={`btn-theme px-4 sm:px-theme-lg py-2 sm:py-theme-sm rounded-theme-md font-theme-medium transition-all duration-200 w-full sm:w-auto ${
                  step === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "btn-secondary hover:shadow-md"
                }`}
                style={{
                  backgroundColor: step === 0 ? 'var(--color-surface)' : 'var(--color-secondary)',
                  color: step === 0 ? 'var(--color-text-secondary)' : 'white',
                  cursor: step === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                {isLastStep ? (
                  <button
                    type="submit"
                    className="btn-theme btn-success px-6 sm:px-theme-xl py-2 sm:py-theme-sm rounded-theme-md font-theme-medium hover:shadow-md transition-all duration-200 w-full sm:w-auto"
                    style={{
                      backgroundColor: 'var(--color-success)',
                      color: 'white',
                      padding: 'var(--spacing-sm) var(--spacing-lg)'
                    }}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-theme btn-primary px-6 sm:px-theme-xl py-2 sm:py-theme-sm rounded-theme-md font-theme-medium hover:shadow-md transition-all duration-200 w-full sm:w-auto"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      padding: 'var(--spacing-sm) var(--spacing-lg)'
                    }}
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}