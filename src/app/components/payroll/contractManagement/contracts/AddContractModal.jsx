"use client";
import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Step1GeneralInfo from "./Step1GeneralInfo";
import Step2ContractTerms from "./Step2ContractTerms";
import Step3Deductions from "./Step3Deductions";
import Step4Increments from "./Step4Increments";
import { useTheme } from "@/contexts/ThemeContext";
import { FiX } from "react-icons/fi";
import { SuccessModal, ErrorModal, ConfirmModal } from "@/app/components/shared/SuccessErrorModal";

export default function AddContractModal({
  isOpen,
  onClose,
  contractToEdit,
  onSuccess,
}) {
  const isEditMode = !!contractToEdit;
  const [step, setStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isSubmittingStep, setIsSubmittingStep] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const { getCurrentTheme } = useTheme();

  const defaultValues = {
    // Step 1 - General Information
    department: "",
    charge: "",
    description: "",
    contractType: "",
    startDate: "",
    endDate: "",
    paymentFrequency: "",
    // Campos condicionales de pago
    paymentDay: "", // Para semanal
    paymentDate: "", // Para mensual
    firstPaymentDate: "", // Para quincenal
    secondPaymentDate: "", // Para quincenal
    minimumHours: "",
    workday: "",
    workModality: "",

    // Step 2 - Contract Terms
    salaryType: "",
    baseSalary: "",
    contractedAmount: "", // Para "Por horas" o "Por días"
    currency: "",
    trialPeriod: "",
    vacationDays: "",
    cumulative: "",
    effectiveFrom: "",
    vacationGrantFrequency: "",
    maximumDisabilityDays: "",
    maximumOvertime: "",
    overtimePeriod: "",
    terminationNoticePeriod: "",

    // Step 3 - Deductions
    deductions: [],

    // Step 4 - Increments
    increments: [],
  };

  const methods = useForm({
    defaultValues: defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) {
      // Resetear cuando el modal se cierra
      methods.reset(defaultValues);
      setStep(0);
      setCompletedSteps([]);
      return;
    }

    if (isOpen && isEditMode && contractToEdit) {
      // Cargar datos en modo edición
      const mappedData = {
        // Paso 1
        department: contractToEdit.department || "",
        charge: contractToEdit.charge || "",
        description: contractToEdit.description || "",
        contractType: contractToEdit.contractType || "",
        startDate: contractToEdit.startDate || "",
        endDate: contractToEdit.endDate || "",
        paymentFrequency: contractToEdit.paymentFrequency || "",
        paymentDay: contractToEdit.paymentDay || "",
        minimumHours: contractToEdit.minimumHours || "",
        workday: contractToEdit.workday || "",
        workModality: contractToEdit.workModality || "",
        // Paso 2
        salaryType: contractToEdit.salaryType || "",
        baseSalary: contractToEdit.baseSalary || "",
        currency: contractToEdit.currency || "",
        trialPeriod: contractToEdit.trialPeriod || "",
        vacationDays: contractToEdit.vacationDays || "",
        cumulative: contractToEdit.cumulative || "",
        effectiveFrom: contractToEdit.effectiveFrom || "",
        vacationGrantFrequency: contractToEdit.vacationGrantFrequency || "",
        maximumDisabilityDays: contractToEdit.maximumDisabilityDays || "",
        maximumOvertime: contractToEdit.maximumOvertime || "",
        overtimePeriod: contractToEdit.overtimePeriod || "",
        terminationNoticePeriod: contractToEdit.terminationNoticePeriod || "",
        // Paso 3
        deductions: contractToEdit.deductions || [],
        // Paso 4
        increments: contractToEdit.increments || [],
      };

      methods.reset({
        ...defaultValues,
        ...mappedData,
      });
    } else {
      // Modo creación
      methods.reset(defaultValues);
    }
  }, [isOpen, isEditMode, contractToEdit, methods]);

  const steps = [
    { id: 1, name: "Información general" },
    { id: 2, name: "Términos del contrato" },
    { id: 3, name: "Deducciones" },
    { id: 4, name: "Incrementos" },
  ];

  // Validación del paso 1
  const validateStep1 = () => {
    const currentValues = methods.getValues();
    
    // Campos obligatorios básicos
    const requiredFields = [
      "department",
      "charge",
      "contractType",
      "startDate",
      "endDate",
      "paymentFrequency",
    ];

    // Validar campos obligatorios básicos
    const missingFields = requiredFields.filter((field) => {
      const value = currentValues[field];
      return !value || (typeof value === "string" && value.trim() === "");
    });

    if (missingFields.length > 0) {
      missingFields.forEach((field) => {
        methods.setError(field, {
          type: "required",
          message: "Este campo es obligatorio",
        });
      });
      return false;
    }

    // Validar campos condicionales según frecuencia de pago
    const paymentFrequency = currentValues.paymentFrequency;
    
    if (paymentFrequency === "weekly") {
      if (!currentValues.paymentDay || currentValues.paymentDay.trim() === "") {
        methods.setError("paymentDay", {
          type: "required",
          message: "Este campo es obligatorio",
        });
        return false;
      }
    } else if (paymentFrequency === "monthly") {
      if (!currentValues.paymentDate || currentValues.paymentDate === "") {
        methods.setError("paymentDate", {
          type: "required",
          message: "Este campo es obligatorio",
        });
        return false;
      }
    } else if (paymentFrequency === "biweekly") {
      if (!currentValues.firstPaymentDate || currentValues.firstPaymentDate === "") {
        methods.setError("firstPaymentDate", {
          type: "required",
          message: "Este campo es obligatorio",
        });
        return false;
      }
      if (!currentValues.secondPaymentDate || currentValues.secondPaymentDate === "") {
        methods.setError("secondPaymentDate", {
          type: "required",
          message: "Este campo es obligatorio",
        });
        return false;
      }
    }

    // Validar que la fecha de fin sea posterior a la fecha de inicio
    if (currentValues.startDate && currentValues.endDate) {
      const startDate = new Date(currentValues.startDate);
      const endDate = new Date(currentValues.endDate);
      
      if (endDate <= startDate) {
        methods.setError("endDate", {
          type: "validate",
          message: "La fecha de fin debe ser posterior a la fecha de inicio",
        });
        return false;
      }
    }

    return true;
  };

  // Validación del paso 2
  const validateStep2 = () => {
    const currentValues = methods.getValues();
    const requiredFields = [
      "salaryType",
      "baseSalary",
      "currency",
      "trialPeriod",
      "vacationDays",
      "cumulative",
      "vacationGrantFrequency",
      "maximumDisabilityDays",
      "maximumOvertime",
      "overtimePeriod",
      "terminationNoticePeriod",
    ];

    const missingFields = requiredFields.filter((field) => {
      const value = currentValues[field];
      return !value || (typeof value === "string" && value.trim() === "");
    });

    if (missingFields.length > 0) {
      missingFields.forEach((field) => {
        methods.setError(field, {
          type: "required",
          message: "Este campo es obligatorio",
        });
      });
      return false;
    }

    // Validar campo condicional: contractedAmount (Para "Por horas" o "Por días")
    const salaryType = currentValues.salaryType;
    if (salaryType === "hourly" || salaryType === "daily") {
      if (!currentValues.contractedAmount || currentValues.contractedAmount === "") {
        methods.setError("contractedAmount", {
          type: "required",
          message: "Este campo es obligatorio",
        });
        return false;
      }
    }

    // Validar campo condicional: effectiveFrom (Solo si cumulative es "yes")
    const cumulative = currentValues.cumulative;
    if (cumulative === "yes") {
      if (!currentValues.effectiveFrom || currentValues.effectiveFrom === "") {
        methods.setError("effectiveFrom", {
          type: "required",
          message: "Este campo es obligatorio",
        });
        return false;
      }
    }

    // Validar que el salario sea mayor a 0
    if (currentValues.baseSalary && parseFloat(currentValues.baseSalary) <= 0) {
      methods.setError("baseSalary", {
        type: "validate",
        message: "El salario debe ser mayor a 0",
      });
      return false;
    }

    return true;
  };

  // Validación del paso 3
  const validateStep3 = () => {
    const currentValues = methods.getValues();
    const deductions = currentValues.deductions || [];

    // No hay error si no hay deducciones, ya que son opcionales
    if (deductions.length === 0) {
      return true;
    }

    // Validar cada deducción
    let hasErrors = false;
    deductions.forEach((deduction, index) => {
      const requiredFields = ["name", "type", "amount", "application", "startDate", "endDate", "quantity"];
      
      requiredFields.forEach((field) => {
        const value = deduction[field];
        if (!value || (typeof value === "string" && value.trim() === "")) {
          methods.setError(`deductions.${index}.${field}`, {
            type: "required",
            message: "Requerido",
          });
          hasErrors = true;
        }
      });

      // Validar que la fecha de fin sea posterior a la fecha de inicio
      if (deduction.startDate && deduction.endDate) {
        const startDate = new Date(deduction.startDate);
        const endDate = new Date(deduction.endDate);
        
        if (endDate <= startDate) {
          methods.setError(`deductions.${index}.endDate`, {
            type: "validate",
            message: "Debe ser posterior a la fecha de inicio",
          });
          hasErrors = true;
        }
      }

      // Validar que amount sea mayor o igual a 0
      if (deduction.amount !== "" && parseFloat(deduction.amount) < 0) {
        methods.setError(`deductions.${index}.amount`, {
          type: "validate",
          message: "Debe ser >= 0",
        });
        hasErrors = true;
      }

      // Validar que quantity sea mayor o igual a 1
      if (deduction.quantity !== "" && parseInt(deduction.quantity) < 1) {
        methods.setError(`deductions.${index}.quantity`, {
          type: "validate",
          message: "Debe ser >= 1",
        });
        hasErrors = true;
      }
    });

    return !hasErrors;
  };

  // Validación del paso 4
  const validateStep4 = () => {
    const currentValues = methods.getValues();
    const increments = currentValues.increments || [];

    // No hay error si no hay incrementos, ya que son opcionales
    if (increments.length === 0) {
      return true;
    }

    // Validar cada incremento
    let hasErrors = false;
    increments.forEach((increment, index) => {
      const requiredFields = ["name", "type", "amount", "application", "startDate", "endDate", "quantity"];
      
      requiredFields.forEach((field) => {
        const value = increment[field];
        if (!value || (typeof value === "string" && value.trim() === "")) {
          methods.setError(`increments.${index}.${field}`, {
            type: "required",
            message: "Requerido",
          });
          hasErrors = true;
        }
      });

      // Validar que la fecha de fin sea posterior a la fecha de inicio
      if (increment.startDate && increment.endDate) {
        const startDate = new Date(increment.startDate);
        const endDate = new Date(increment.endDate);
        
        if (endDate <= startDate) {
          methods.setError(`increments.${index}.endDate`, {
            type: "validate",
            message: "Debe ser posterior a la fecha de inicio",
          });
          hasErrors = true;
        }
      }

      // Validar que amount sea mayor o igual a 0
      if (increment.amount !== "" && parseFloat(increment.amount) < 0) {
        methods.setError(`increments.${index}.amount`, {
          type: "validate",
          message: "Debe ser >= 0",
        });
        hasErrors = true;
      }

      // Validar que quantity sea mayor o igual a 1
      if (increment.quantity !== "" && parseInt(increment.quantity) < 1) {
        methods.setError(`increments.${index}.quantity`, {
          type: "validate",
          message: "Debe ser >= 1",
        });
        hasErrors = true;
      }
    });

    return !hasErrors;
  };

  // Envío del paso 1
  const submitStep1 = async (data) => {
    try {
      setIsSubmittingStep(true);

      // Aquí iría la lógica para enviar los datos al backend
      console.log("Datos del paso 1:", data);

      // Simulación de llamada API
      await new Promise(resolve => setTimeout(resolve, 500));

      setCompletedSteps((prev) => [...prev, 0]);
      setStep(1);
    } catch (error) {
      let message = "Error al guardar los datos. Por favor, inténtelo de nuevo.";
      
      if (error.response?.data?.details || error.response?.data?.errors) {
        const details = error.response.data.details || error.response.data.errors;
        message = Object.entries(details)
          .map(([field, value]) => {
            if (Array.isArray(value)) {
              return value.join(" ");
            } else if (typeof value === "object" && value !== null) {
              return Object.values(value).join(" ");
            } else {
              return value;
            }
          })
          .join(" ");
      }

      setModalMessage(message);
      setErrorOpen(true);
    } finally {
      setIsSubmittingStep(false);
    }
  };

  // Envío del paso 2
  const submitStep2 = async (data) => {
    try {
      setIsSubmittingStep(true);

      // Aquí iría la lógica para enviar los datos al backend
      console.log("Datos del paso 2:", data);

      // Simulación de llamada API
      await new Promise(resolve => setTimeout(resolve, 500));

      setCompletedSteps((prev) => [...prev, 1]);
      setStep(2);
    } catch (error) {
      let message = "Error al guardar los datos. Por favor, inténtelo de nuevo.";
      
      if (error.response?.data?.details || error.response?.data?.errors) {
        const details = error.response.data.details || error.response.data.errors;
        message = Object.entries(details)
          .map(([field, value]) => {
            if (Array.isArray(value)) {
              return value.join(" ");
            } else if (typeof value === "object" && value !== null) {
              return Object.values(value).join(" ");
            } else {
              return value;
            }
          })
          .join(" ");
      }

      setModalMessage(message);
      setErrorOpen(true);
    } finally {
      setIsSubmittingStep(false);
    }
  };

  // Envío del paso 3
  const submitStep3 = async (data) => {
    try {
      setIsSubmittingStep(true);

      // Aquí iría la lógica para enviar los datos al backend
      console.log("Datos del paso 3:", data);

      // Simulación de llamada API
      await new Promise(resolve => setTimeout(resolve, 500));

      setCompletedSteps((prev) => [...prev, 2]);
      setStep(3);
    } catch (error) {
      let message = "Error al guardar los datos. Por favor, inténtelo de nuevo.";
      
      if (error.response?.data?.details || error.response?.data?.errors) {
        const details = error.response.data.details || error.response.data.errors;
        message = Object.entries(details)
          .map(([field, value]) => {
            if (Array.isArray(value)) {
              return value.join(" ");
            } else if (typeof value === "object" && value !== null) {
              return Object.values(value).join(" ");
            } else {
              return value;
            }
          })
          .join(" ");
      }

      setModalMessage(message);
      setErrorOpen(true);
    } finally {
      setIsSubmittingStep(false);
    }
  };

  // Envío del paso 4
  const submitStep4 = async (data) => {
    try {
      setIsSubmittingStep(true);

      // Aquí iría la lógica para enviar los datos al backend
      console.log("Datos del paso 4:", data);
      console.log("Todos los datos del formulario:", data);

      // Simulación de llamada API
      await new Promise(resolve => setTimeout(resolve, 500));

      setCompletedSteps((prev) => [...prev, 3]);
      
      // Notificar al componente padre que el contrato se creó/actualizó correctamente
      if (onSuccess) {
        try {
          onSuccess(data);
        } catch (callbackError) {
          console.error("Error en callback onSuccess de AddContractModal:", callbackError);
        }
      }
      
      // Mostrar mensaje de éxito y cerrar el modal
      setModalMessage(isEditMode 
        ? "Contrato actualizado exitosamente" 
        : "Contrato creado exitosamente");
      setSuccessOpen(true);

      // Cerrar el modal después de mostrar el mensaje
      setTimeout(() => {
        methods.reset(defaultValues);
        setStep(0);
        setCompletedSteps([]);
        onClose();
      }, 1500);
    } catch (error) {
      let message = "Error al guardar los datos. Por favor, inténtelo de nuevo.";
      
      if (error.response?.data?.details || error.response?.data?.errors) {
        const details = error.response.data.details || error.response.data.errors;
        message = Object.entries(details)
          .map(([field, value]) => {
            if (Array.isArray(value)) {
              return value.join(" ");
            } else if (typeof value === "object" && value !== null) {
              return Object.values(value).join(" ");
            } else {
              return value;
            }
          })
          .join(" ");
      }

      setModalMessage(message);
      setErrorOpen(true);
    } finally {
      setIsSubmittingStep(false);
    }
  };

  const nextStep = async () => {
    if (step === 0) {
      if (!validateStep1()) {
        return;
      }
      const currentData = methods.getValues();
      submitStep1(currentData);
    } else if (step === 1) {
      if (!validateStep2()) {
        return;
      }
      const currentData = methods.getValues();
      submitStep2(currentData);
    } else if (step === 2) {
      if (!validateStep3()) {
        return;
      }
      const currentData = methods.getValues();
      submitStep3(currentData);
    } else if (step === 3) {
      if (!validateStep4()) {
        return;
      }
      const currentData = methods.getValues();
      submitStep4(currentData);
    } else {
      // Para los otros pasos (por si acaso se agregan más en el futuro)
      setStep((s) => {
        const newStep = Math.min(s + 1, steps.length - 1);
        if (!completedSteps.includes(s)) {
          setCompletedSteps((prev) => [...prev, s]);
        }
        return newStep;
      });
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const goToStep = (targetStep) => {
    if (completedSteps.includes(targetStep) || targetStep === 0) {
      setStep(targetStep);
    }
  };

  // Función para manejar el cierre del modal con confirmación
  const handleCloseAttempt = () => {
    setShowCancelConfirmModal(true);
  };

  // Función para confirmar el cierre y descartar cambios
  const handleConfirmClose = () => {
    setShowCancelConfirmModal(false);
    methods.reset(defaultValues);
    setStep(0);
    setCompletedSteps([]);
    onClose();
  };

  const onSubmit = () => {
    if (step === steps.length - 1) {
      // El paso 4 (último paso) se maneja directamente en nextStep/submitStep4
      // Esta función se ejecuta cuando se hace submit del form, pero el botón de Save
      // llama a submitStep4 directamente a través de nextStep
      const currentData = methods.getValues();
      submitStep4(currentData);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    nextStep();
  };

  // Step Indicator Component
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
                  disabled={!completedSteps.includes(index) && index !== 0}
                  className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xs sm:text-theme-sm font-theme-bold border-2 transition-all duration-300 ${
                    isActive
                      ? "bg-accent text-white"
                      : isCompleted
                      ? "bg-success text-white border-success"
                      : "bg-surface text-secondary border-primary"
                  } ${
                    !completedSteps.includes(index) && index !== 0
                      ? "cursor-not-allowed opacity-50"
                      : "hover:shadow-md"
                  }`}
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
                    color:
                      isActive || isCompleted
                        ? "white"
                        : "var(--color-text-secondary)",
                  }}
                >
                  {isCompleted && !isActive ? (
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
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
                      color:
                        status === "En progreso"
                          ? "var(--color-accent)"
                          : status === "Completo"
                          ? "var(--color-success)"
                          : "var(--color-text-secondary)",
                    }}
                  >
                    <span className="hidden md:block">{stepItem.name}</span>
                    <span className="block md:hidden text-center leading-tight">
                      {stepItem.name.split(" ").slice(0, 2).join(" ")}
                    </span>
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
                      color:
                        status === "En progreso"
                          ? "var(--color-accent)"
                          : status === "Completo"
                          ? "var(--color-success)"
                          : "var(--color-text-secondary)",
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
                  disabled={!completedSteps.includes(index) && index !== 0}
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-theme-bold border-2 transition-all duration-300 ${
                    isActive
                      ? "bg-accent text-white"
                      : isCompleted
                      ? "bg-success text-white border-success"
                      : "bg-surface text-secondary border-primary"
                  } ${
                    !completedSteps.includes(index) && index !== 0
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
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
                    color:
                      isActive || isCompleted
                        ? "white"
                        : "var(--color-text-secondary)",
                  }}
                >
                  {isCompleted && !isActive ? (
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
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
    <div
      className="modal-overlay"
      style={{ padding: "var(--spacing-sm)", zIndex: 60 }}
    >
      <div
        className="modal-theme"
        style={{
          width: "100%",
          minWidth: "280px",
          maxWidth: "min(95vw, 1200px)",
          maxHeight: "min(95vh, 900px)",
          overflowY: "auto",
          margin: "0 auto",
        }}
      >
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="p-3 sm:p-6 md:p-8 lg:p-theme-xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4 sm:mb-6 md:mb-8">
              <h2 className="text-lg sm:text-xl md:text-theme-xl font-theme-semibold text-primary">
                {isEditMode ? "Editar contrato" : "Añadir contrato"}
              </h2>
              <button
                type="button"
                onClick={handleCloseAttempt}
                className="text-secondary hover:text-primary cursor-pointer"
                aria-label="Close Modal"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Progress Bar */}
            <StepIndicator steps={steps} currentStep={step} />

            {/* Step Content */}
            <div style={{ minHeight: "300px" }} className="sm:min-h-[400px]">
              {step === 0 && <Step1GeneralInfo />}
              {step === 1 && <Step2ContractTerms />}
              {step === 2 && <Step3Deductions />}
              {step === 3 && <Step4Increments />}
            </div>

            {/* Navigation */}
            <div className="flex flex-row justify-between items-center mt-6 sm:mt-theme-xl pt-4 sm:pt-theme-lg">
              {/* Botón Anterior */}
              <button
                type="button"
                aria-label="Previous Button"
                onClick={prevStep}
                disabled={step === 0 || isSubmittingStep}
                className="btn-theme btn-secondary w-auto"
              >
                Anterior
              </button>

              <div className="flex gap-4">
                {/* Botón Cancelar - solo visible después del paso 0 */}
                {step > 0 && (
                  <button
                    type="button"
                    aria-label="Cancel Button"
                    onClick={handleCloseAttempt}
                    disabled={isSubmittingStep}
                    className="btn-theme w-auto"
                    style={{
                      backgroundColor: "#EF4444",
                      color: "white",
                      border: "none",
                    }}
                  >
                    Cancelar
                  </button>
                )}

                {/* Botón Siguiente / Save */}
                {isLastStep ? (
                  <button
                    type="button"
                    aria-label="Save Button"
                    onClick={handleNext}
                    disabled={isSubmittingStep}
                    className="btn-theme btn-primary w-auto"
                    style={{
                      backgroundColor: "#000000",
                      color: "white",
                    }}
                  >
                    {isSubmittingStep ? "Guardando..." : "Save"}
                  </button>
                ) : (
                  <button
                    type="button"
                    aria-label="Next Button"
                    onClick={handleNext}
                    disabled={isSubmittingStep}
                    className="btn-theme btn-primary w-auto"
                    style={{
                      backgroundColor: "#000000",
                      color: "white",
                    }}
                  >
                    {isSubmittingStep ? "Guardando..." : "Siguiente"}
                  </button>
                )}
              </div>
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
      <ConfirmModal
        isOpen={showCancelConfirmModal}
        onClose={() => setShowCancelConfirmModal(false)}
        onConfirm={handleConfirmClose}
        title="Confirmar Acción"
        message="¿Está seguro que desea cancelar? Se perderán todos los cambios no guardados."
        confirmText="Confirm"
        cancelText="Cancel"
        confirmColor="btn-primary"
        cancelColor="btn-error"
      />
    </div>
  );
}

