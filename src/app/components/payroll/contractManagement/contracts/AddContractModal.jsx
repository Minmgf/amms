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
import {
  createEstablishedContract,
  getContractDetail,
  updateEstablishedContract,
  getActiveDepartments,
  getActiveCharges,
  changeEmployeeContract
} from "@/services/contractService";
import { createContractAddendum, getLatestEmployeeContract } from "@/services/employeeService";

export default function AddContractModal({
  isOpen,
  onClose,
  contractToEdit,
  onSuccess,
  isAddendum = false,
  modifiableFields = [],
  employeeId,
  preventTemplateUpdate = false,
  isChangeContract = false,
  changeContractObservation = "",
}) {
  // Si es Addendum, NO es modo edición (se crea un nuevo registro), pero sí necesitamos cargar los datos del contrato base.
  const isEditMode = !!contractToEdit && !isAddendum && !isChangeContract;
  const modalTitle = isAddendum
    ? "Generar Otro Sí"
    : (isChangeContract
        ? "Añadir contrato"
        : (isEditMode ? "Editar contrato" : "Añadir contrato"));
  const [step, setStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isSubmittingStep, setIsSubmittingStep] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [isLoadingContract, setIsLoadingContract] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const { getCurrentTheme } = useTheme();

  const defaultValues = {
    // Step 1 - General Information
    observation: "", // Required for Addendum
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

    // Step 3 - Deductions (con nombres según backend)
    deductions: [],

    // Step 4 - Increments (con nombres según backend)
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
      setIsLoadingContract(false);
      return;
    }

    // Función para cargar los datos del contrato
    const loadContractData = async () => {
      // Cargamos datos si es modo edición O si es modo Addendum (usando el contrato base)
      if (isOpen && (isEditMode || isAddendum)) {
        try {
          setIsLoadingContract(true);
          
          let contractData;
          
          // AJUSTE: Usar el endpoint de la doc para Otro Sí
          if (isAddendum && employeeId) {
             contractData = await getLatestEmployeeContract(employeeId);
          } else if (contractToEdit && contractToEdit.contract_code) {
             // Comportamiento normal para editar
             contractData = await getContractDetail(contractToEdit.contract_code);
          } else {
             // Fallback o caso donde no hay datos
             throw new Error("No se pudo identificar el contrato a cargar");
          }

          // Obtener el departamento del cargo
          let departmentId = "";
          let chargeData = null;

          if (contractData.id_employee_charge) {
            try {
              // Obtener todos los departamentos activos
              const departmentsResponse = await getActiveDepartments();
              const departments = departmentsResponse.data;

              // Estrategia: Buscar en cada departamento hasta encontrar el cargo
              // Esto es necesario porque el endpoint de cargos no retorna el id_employee_department
              for (const dept of departments) {
                try {
                  const charges = await getActiveCharges(dept.id_employee_department);
                  const chargeFound = charges.find(
                    charge => charge.id_employee_charge === contractData.id_employee_charge
                  );

                  if (chargeFound) {
                    departmentId = String(dept.id_employee_department);
                    chargeData = chargeFound;
                    break;
                  }
                } catch (err) {
                  // Continuar buscando en otros departamentos
                }
              }
            } catch (error) {
              console.error("Error al cargar datos del contrato:", error);
            }
          }

          // Mapear datos del backend al formato del formulario
          const mappedData = {
            // Paso 1 - Generalidades
            observation: "", // Observation should be empty for new addendum, or loaded from contract if exists (but here we are loading base contract, so empty)
            department: departmentId, // ID del departamento encontrado
            charge: contractData.id_employee_charge ? String(contractData.id_employee_charge) : "",
            description: contractData.description || "",
            contractType: contractData.contract_type ? String(contractData.contract_type) : "",
            startDate: contractData.start_date || "",
            endDate: contractData.end_date || "",
            paymentFrequency: contractData.payment_frequency_type || "",
            minimumHours: contractData.minimum_hours ? String(contractData.minimum_hours) : "",
            workday: contractData.workday_type ? String(contractData.workday_type) : "",
            workModality: contractData.work_mode_type ? String(contractData.work_mode_type) : "",

            // Mapear campos de pago según la frecuencia
            paymentDay: "", // Inicializar vacío
            paymentDate: "", // Inicializar vacío
            firstPaymentDate: "", // Inicializar vacío
            secondPaymentDate: "", // Inicializar vacío
          };

          // Mapear campos de pago según la frecuencia
          if (contractData.payment_frequency_type === "semanal" && contractData.contract_payments?.[0]) {
            mappedData.paymentDay = contractData.contract_payments[0].id_day_of_week ? String(contractData.contract_payments[0].id_day_of_week) : "";
          } else if (contractData.payment_frequency_type === "mensual" && contractData.contract_payments?.[0]) {
            mappedData.paymentDate = contractData.contract_payments[0].date_payment ? String(contractData.contract_payments[0].date_payment) : "";
          } else if (contractData.payment_frequency_type === "quincenal" && contractData.contract_payments?.length === 2) {
            mappedData.firstPaymentDate = contractData.contract_payments[0].date_payment ? String(contractData.contract_payments[0].date_payment) : "";
            mappedData.secondPaymentDate = contractData.contract_payments[1].date_payment ? String(contractData.contract_payments[1].date_payment) : "";
          }

          // Paso 2 - Términos del contrato
          mappedData.salaryType = contractData.salary_type || "";
          mappedData.baseSalary = contractData.salary_base ? String(contractData.salary_base) : "";
          mappedData.currency = contractData.currency_type ? String(contractData.currency_type) : "";
          mappedData.trialPeriod = contractData.trial_period_days ? String(contractData.trial_period_days) : "";
          mappedData.vacationDays = contractData.vacation_days ? String(contractData.vacation_days) : "";
          mappedData.cumulative = contractData.cumulative_vacation ? "yes" : "no";
          mappedData.effectiveFrom = contractData.start_cumulative_vacation || "";
          mappedData.vacationGrantFrequency = contractData.vacation_frequency_days ? String(contractData.vacation_frequency_days) : "";
          mappedData.maximumDisabilityDays = contractData.maximum_disability_days ? String(contractData.maximum_disability_days) : "";
          mappedData.maximumOvertime = contractData.overtime ? String(contractData.overtime) : "";
          mappedData.overtimePeriod = contractData.overtime_period || "";
          mappedData.terminationNoticePeriod = contractData.notice_period_days ? String(contractData.notice_period_days) : "";
          mappedData.contractedAmount = contractData.working_hours ? String(contractData.working_hours) : "";

          // Horario de trabajo: mapear days_of_week del backend al formato del formulario
          // Soporta tanto arrays de IDs (por ejemplo [1,1,2,3,4,5]) como arrays de objetos
          mappedData.days_of_week = (contractData.days_of_week || []).map((d) => {
            if (typeof d === "number") {
              return { id_day_of_week: d, day_of_week_name: "" };
            }
            return {
              id_day_of_week: d.id_day_of_week,
              day_of_week_name: d.day_of_week_name || "",
            };
          });

          // Paso 3 - Deducciones
          mappedData.deductions = (contractData.established_deductions || []).map(d => ({
            deduction_type: d.deduction_type ? String(d.deduction_type) : "",
            amount_type: d.amount_type || "",
            amount_value: d.amount_value ? String(d.amount_value) : "",
            application_deduction_type: d.application_deduction_type || "",
            start_date_deduction: d.start_date_deduction || "",
            end_date_deductions: d.end_date_deductions || "",
            description: d.description || "",
            amount: d.amount ? String(d.amount) : "",
          }));

          // Paso 4 - Incrementos
          mappedData.increments = (contractData.established_increases || []).map(i => ({
            increase_type: i.increase_type ? String(i.increase_type) : "",
            amount_type: i.amount_type || "",
            amount_value: i.amount_value ? String(i.amount_value) : "",
            application_increase_type: i.application_increase_type || "",
            start_date_increase: i.start_date_increase || "",
            end_date_increase: i.end_date_increase || "",
            description: i.description || "",
            amount: i.amount ? String(i.amount) : "",
          }));

          // Aplicar datos al formulario
          setPendingData(mappedData);
          methods.reset(mappedData);
          // Limpiar errores de validación después de resetear
          methods.clearErrors();
          setIsLoadingContract(false);
        } catch (error) {
          console.error("Error al cargar datos del contrato:", error);
          setModalMessage("Error al cargar los datos del contrato");
          setErrorOpen(true);
          setIsLoadingContract(false);
        }
      } else {
        // Modo creación
        methods.reset(defaultValues);
        setIsLoadingContract(false);
      }
    };

    loadContractData();
  }, [isOpen, isEditMode, isAddendum, contractToEdit]);

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
    // Si es Addendum, solo validamos los campos que son modificables (y por ende, visibles/habilitados)
    // OJO: Si un campo está deshabilitado, su valor igual se envía (react-hook-form mantiene el valor).
    // Pero startDate está deshabilitado en Addendum y NO debe ser validado como si el usuario lo hubiera ingresado (ya tiene valor).
    
    const requiredFields = [
      "department",
      "charge",
      "contractType",
      "startDate",
      "endDate",
      "paymentFrequency",
    ];

    if (isAddendum) {
      requiredFields.push("observation");
    }

    // ... (resto de validación)

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
    
    if (paymentFrequency === "semanal") {
      if (!currentValues.paymentDay || currentValues.paymentDay.trim() === "") {
        methods.setError("paymentDay", {
          type: "required",
          message: "Este campo es obligatorio",
        });
        return false;
      }
    } else if (paymentFrequency === "mensual") {
      if (!currentValues.paymentDate || currentValues.paymentDate === "") {
        methods.setError("paymentDate", {
          type: "required",
          message: "Este campo es obligatorio",
        });
        return false;
      }
    } else if (paymentFrequency === "quincenal") {
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
      const requiredFields = [
        "deduction_type",
        "amount_type",
        "amount_value",
        "application_deduction_type",
        "start_date_deduction",
        "end_date_deductions"
      ];
      
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
      if (deduction.start_date_deduction && deduction.end_date_deductions) {
        const startDate = new Date(deduction.start_date_deduction);
        const endDate = new Date(deduction.end_date_deductions);
        
        if (endDate <= startDate) {
          methods.setError(`deductions.${index}.end_date_deductions`, {
            type: "validate",
            message: "Debe ser posterior a la fecha de inicio",
          });
          hasErrors = true;
        }
      }

      // Validar que amount_value sea mayor o igual a 0
      if (deduction.amount_value !== "" && parseFloat(deduction.amount_value) < 0) {
        methods.setError(`deductions.${index}.amount_value`, {
          type: "validate",
          message: "Debe ser >= 0",
        });
        hasErrors = true;
      }

      // Validar que amount sea mayor o igual a 0
      if (deduction.amount !== "" && deduction.amount !== undefined && parseFloat(deduction.amount) < 0) {
        methods.setError(`deductions.${index}.amount`, {
          type: "validate",
          message: "Debe ser >= 0",
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
      const requiredFields = [
        "increase_type",
        "amount_type",
        "amount_value",
        "application_increase_type",
        "start_date_increase",
        "end_date_increase"
      ];
      
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
      if (increment.start_date_increase && increment.end_date_increase) {
        const startDate = new Date(increment.start_date_increase);
        const endDate = new Date(increment.end_date_increase);
        
        if (endDate <= startDate) {
          methods.setError(`increments.${index}.end_date_increase`, {
            type: "validate",
            message: "Debe ser posterior a la fecha de inicio",
          });
          hasErrors = true;
        }
      }

      // Validar que amount_value sea mayor o igual a 0
      if (increment.amount_value !== "" && parseFloat(increment.amount_value) < 0) {
        methods.setError(`increments.${index}.amount_value`, {
          type: "validate",
          message: "Debe ser >= 0",
        });
        hasErrors = true;
      }

      // Validar que amount sea mayor o igual a 0
      if (increment.amount !== "" && increment.amount !== undefined && parseFloat(increment.amount) < 0) {
        methods.setError(`increments.${index}.amount`, {
          type: "validate",
          message: "Debe ser >= 0",
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

  // Función para mapear datos del formulario al formato del backend
  const transformDataForBackend = (formData) => {
    // Mapear contract_payments según payment_frequency_type
    const mapContractPayments = () => {
      const frequency = formData.paymentFrequency;

      if (frequency === "quincenal") {
        // Para quincenal: 2 pagos con fechas diferentes
        return [
          {
            id_day_of_week: null,
            date_payment: parseInt(formData.firstPaymentDate) || null
          },
          {
            id_day_of_week: null,
            date_payment: parseInt(formData.secondPaymentDate) || null
          }
        ];
      } else if (frequency === "semanal") {
        // Para semanal: 1 pago con día de la semana
        return [
          {
            id_day_of_week: parseInt(formData.paymentDay) || null,
            date_payment: null
          }
        ];
      } else if (frequency === "mensual") {
        // Para mensual: 1 pago con fecha específica
        return [
          {
            id_day_of_week: null,
            date_payment: parseInt(formData.paymentDate) || null
          }
        ];
      } else {
        // Para diario
        return [
          {
            id_day_of_week: null,
            date_payment: null
          }
        ];
      }
    };

    const contractData = {
      id_employee_charge: parseInt(formData.charge),
      description: formData.description || null,
      contract_type: parseInt(formData.contractType),
      start_date: formData.startDate,
      end_date: formData.endDate,
      payment_frequency_type: formData.paymentFrequency,
      minimum_hours: formData.minimumHours ? parseInt(formData.minimumHours) : null,
      workday_type: parseInt(formData.workday),
      work_mode_type: parseInt(formData.workModality),
      salary_type: formData.salaryType,
      salary_base: parseFloat(formData.baseSalary),
      currency_type: parseInt(formData.currency),
      trial_period_days: formData.trialPeriod ? parseInt(formData.trialPeriod) : null,
      vacation_days: parseInt(formData.vacationDays),
      vacation_frequency_days: parseInt(formData.vacationGrantFrequency),
      cumulative_vacation: formData.cumulative === "yes",
      start_cumulative_vacation: formData.cumulative === "yes" ? formData.effectiveFrom : null,
      maximum_disability_days: parseInt(formData.maximumDisabilityDays),
      overtime: parseInt(formData.maximumOvertime),
      overtime_period: formData.overtimePeriod,
      notice_period_days: formData.terminationNoticePeriod ? parseInt(formData.terminationNoticePeriod) : null,
      working_hours: formData.contractedAmount ? parseInt(formData.contractedAmount) : null,
      
      // Solo para creación/actualización normal, para addendum se estructura diferente
      // Horario de trabajo: enviar arreglo de IDs de día de la semana, por ejemplo [1,1,2,3,4,5]
      days_of_week: (formData.days_of_week || []).map((d) => d.id_day_of_week),

      // Mapeo de pagos según frecuencia
      contract_payments: mapContractPayments(),

      // Mapeo de deducciones (ya tienen los nombres correctos)
      established_deductions: (formData.deductions || []).map(d => ({
        deduction_type: parseInt(d.deduction_type),
        amount_type: d.amount_type,
        amount_value: parseFloat(d.amount_value),
        application_deduction_type: d.application_deduction_type,
        start_date_deduction: d.start_date_deduction,
        end_date_deductions: d.end_date_deductions,
        description: d.description || null,
        amount: d.amount ? parseFloat(d.amount) : null
      })),

      // Mapeo de incrementos (ya tienen los nombres correctos)
      established_increases: (formData.increments || []).map(i => ({
        increase_type: parseInt(i.increase_type),
        amount_type: i.amount_type,
        amount_value: parseFloat(i.amount_value),
        application_increase_type: i.application_increase_type,
        start_date_increase: i.start_date_increase,
        end_date_increase: i.end_date_increase,
        description: i.description || null,
        amount: i.amount ? parseFloat(i.amount) : null
      }))
    };

    if (isAddendum) {
      return {
        observation: formData.observation,
        id_employee_charge: parseInt(formData.charge),
        contract: [contractData]
      };
    }

    if (isChangeContract) {
      return {
        observation: changeContractObservation,
        id_employee_charge: parseInt(formData.charge),
        contract: [contractData]
      };
    }

    return contractData;
  };

  // Envío del paso 4
  const submitStep4 = async (data) => {
    try {
      setIsSubmittingStep(true);

      // Transformar datos al formato del backend (sin id_employee_charge para actualización)
      const payload = transformDataForBackend(data);
      const shouldUpdateTemplate = isEditMode && !preventTemplateUpdate && !isChangeContract;

      // Para actualización, remover id_employee_charge ya que no se envía en el PUT
      if (shouldUpdateTemplate) {
        delete payload.id_employee_charge;
      }

      // Si es Addendum, asegurarnos de que se envíe como una creación (POST) pero quizás con alguna marca de que es un addendum
      // O simplemente se crea un nuevo contrato asociado al empleado (el backend manejará la versión/otro sí).

      const actionLabel = isAddendum
        ? "generar otro sí"
        : (isChangeContract
            ? "cambiar contrato"
            : (shouldUpdateTemplate ? "actualizar" : "crear"));

      console.log(`Payload a ${actionLabel}:`, payload);

      let response;
      let newContractId = null;

      if (isAddendum) {
        // Llamar al endpoint de generar otro sí (requiere employeeId)
        if (!employeeId) {
          throw new Error("ID de empleado no encontrado para generar Otro Sí");
        }
        response = await createContractAddendum(employeeId, payload);
      } else if (isChangeContract) {
        // Llamar al endpoint de cambio de contrato (requiere employeeId)
        if (!employeeId) {
          throw new Error("ID de empleado no encontrado para cambiar contrato");
        }
        response = await changeEmployeeContract(employeeId, payload);
      } else if (shouldUpdateTemplate) {
        // Llamar al endpoint PUT para actualizar contrato establecido
        response = await updateEstablishedContract(contractToEdit.contract_code, payload);
      } else {
        // Llamar al endpoint POST de creación normal
        response = await createEstablishedContract(payload);

        newContractId =
          response.contract_code ||
          (response.data && (response.data.contract_code || response.data.id)) ||
          response.id ||
          null;
      }

      console.log("Respuesta del servidor:", response);

      setCompletedSteps((prev) => [...prev, 3]);

      // Mostrar mensaje de éxito
      const fallbackMessage = isAddendum
        ? "Otro Sí generado exitosamente"
        : (isChangeContract
            ? "Contrato cambiado exitosamente"
            : (shouldUpdateTemplate
                ? "Contrato actualizado exitosamente"
                : "Contrato creado exitosamente"));

      setModalMessage(response.message || fallbackMessage);

      setSuccessOpen(true);

      // Cerrar el modal y recargar datos
      setTimeout(() => {
        methods.reset(defaultValues);
        setStep(0);
        setCompletedSteps([]);
        if (onSuccess) onSuccess(newContractId); // Recargar lista de contratos
        onClose();
      }, 1500);
    } catch (error) {
      console.error(`Error al ${isEditMode ? 'actualizar' : 'crear'} contrato:`, error);
      let message = "Error al crear el contrato. Por favor, inténtelo de nuevo.";

      if (error.response?.data?.errors) {
        // Formatear errores del backend
        const errors = error.response.data.errors;
        const errorMessages = [];

        Object.entries(errors).forEach(([field, value]) => {
          if (Array.isArray(value)) {
            errorMessages.push(`${field}: ${value.join(", ")}`);
          } else if (typeof value === "object" && value !== null) {
            // Para errores anidados (como established_deductions)
            Object.entries(value).forEach(([nestedKey, nestedValue]) => {
              if (Array.isArray(nestedValue)) {
                errorMessages.push(`${field}[${nestedKey}]: ${Object.values(nestedValue).join(", ")}`);
              }
            });
          } else {
            errorMessages.push(`${field}: ${value}`);
          }
        });

        message = errorMessages.join("\n");
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
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
                {modalTitle}
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
              {isLoadingContract ? (
                <div className="flex items-center justify-center h-full min-h-[300px]">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
                    <p className="text-secondary text-theme-sm">Cargando datos del contrato...</p>
                  </div>
                </div>
              ) : (
                <>
              {step === 0 && <Step1GeneralInfo isAddendum={isAddendum} modifiableFields={modifiableFields} />}
              {step === 1 && <Step2ContractTerms isAddendum={isAddendum} modifiableFields={modifiableFields} />}
              {step === 2 && <Step3Deductions isAddendum={isAddendum} modifiableFields={modifiableFields} />}
              {step === 3 && <Step4Increments isAddendum={isAddendum} modifiableFields={modifiableFields} />}
                </>
              )}
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
                    {isSubmittingStep
                      ? (isEditMode ? "Actualizando..." : "Guardando...")
                      : (isEditMode ? "Guardar cambios" : "Save")
                    }
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
        message={
          isEditMode
            ? "¿Desea descartar los cambios realizados en este contrato?"
            : "¿Está seguro que desea cancelar? Se perderán todos los cambios no guardados."
        }
        confirmText="Confirm"
        cancelText="Cancel"
        confirmColor="btn-primary"
        cancelColor="btn-error"
      />
    </div>
  );
}

