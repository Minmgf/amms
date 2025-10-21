"use client";
import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { FiX } from "react-icons/fi";
import Step1ClientInformation from "./Step1ClientInformation";
import Step2InvoiceInformation from "./Step2InvoiceInformation";
import Step3InvoiceLine from "./Step3InvoiceLine";
import Step4TotalTaxes from "./Step4TotalTaxes";
import { SuccessModal, ErrorModal } from "@/app/components/shared/SuccessErrorModal";
import { getCountries } from "@/services/locationService";
import { getMunicipalities, getUnitsMeasurement } from "@/services/billingService";
import { getTaxRegimens } from "@/services/clientService";

const GenerateInvoiceModal = ({ isOpen, onClose, onSuccess, billingToken }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [phoneCodes, setPhoneCodes] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [taxRegime, setTaxRegime] = useState([]);
    const [unitsMeasurement, setUnitsMeasurement] = useState([]);

    const methods = useForm({
        mode: "onChange",
        defaultValues: {
            // Step 1 - Client Information
            typeOfPerson: "",
            documentationType: "",
            documentationNumber: "",
            checkDigit: "",
            legalName: "",
            businessName: "",
            fullName: "",
            fullLastName: "",
            taxRegime: "",
            address: "",
            email: "",
            phoneCode: "+57",
            phoneNumber: "",
            regionCity: "",

            // Step 2 - Invoice Information
            referenceNumber: "",
            billingDate: "",
            paymentMethod: "",
            observations: "",

            // Step 3 - Invoice Line
            invoiceLines: [],

            // Step 4 - Totals (calculated)
            sumGrossLineValues: 0,
            totalWithTaxes: 0,
            totalWithoutTaxes: 0,
            amountPayable: 0,
        },
    });

    //Carga de información para los selects
    useEffect(() => {
        const fetchSelects = async () => {
            try {
                // Cargar países
                const phone_codes = await getCountries();
                setPhoneCodes(phone_codes);
                await getTaxRegimensData();

                // Cargar municipios
                if (billingToken) {
                    const municipalities_data = await getMunicipalities(billingToken, "");
                    if (municipalities_data?.data) {
                        setMunicipalities(municipalities_data.data);
                    } else if (Array.isArray(municipalities_data)) {
                        setMunicipalities(municipalities_data);
                    }

                    const units_data = await getUnitsMeasurement(billingToken, "");
                    if (units_data?.data) {
                        setUnitsMeasurement(units_data.data);
                    } else if (Array.isArray(units_data)) {
                        setUnitsMeasurement(units_data);
                    }
                }
            } catch (error) {
                console.error("Error loading selects:", error);
                setPhoneCodes([]);
                setMunicipalities([]);
            }
        };
        if (isOpen && billingToken) {
            fetchSelects();
        }
    }, [isOpen, billingToken]);

    // Modales de éxito y error
    const [successOpen, setSuccessOpen] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    const steps = [
        { number: 1, label: "Información Cliente", status: "Completado" },
        { number: 2, label: "Información Factura", status: "In Progreso" },
        { number: 3, label: "Lineas Factura", status: "Pendiente" },
        { number: 4, label: "Total e Impuestos", status: "Pendiente" },
    ];

    const getStepStatus = (stepNumber) => {
        if (completedSteps.includes(stepNumber)) return "Completado";
        if (stepNumber === currentStep) return "En Progreso";
        return "Pendiente";
    };

    const validateInvoiceLines = async (lines) => {
        if (!lines || lines.length === 0) {
            setModalMessage("Debe agregar al menos una línea de servicios a la factura");
            setErrorOpen(true);
            return false;
        }

        const isValid = await methods.trigger("invoiceLines");
        if (!isValid) {
            return false;
        }

        // Validar cada línea
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Validar campos requeridos
            if (!line.serviceCode || line.serviceCode.trim() === "") {
                return false;
            }

            if (!line.serviceName || line.serviceName.trim() === "") {
                return false;
            }

            if (!line.amount) {
                return false;
            }

            if (!line.unitOfMeasurement || line.unitOfMeasurement.trim() === "") {
                return false;
            }

            // Validar que no sean negativos
            const amount = parseFloat(line.amount);
            const taxPercent = parseFloat(line.taxPercent);
            const discountPercent = parseFloat(line.discountPercent) || 0;

            if (amount < 0) {
                return false;
            }

            if (taxPercent < 0) {
                return false;
            }

            if (discountPercent < 0) {
                return false;
            }

            // Validar máximos razonables para porcentajes
            if (taxPercent > 100) {
                return false;
            }

            if (discountPercent > 100) {
                return false;
            }
        }

        return true;
    };

    const getTaxRegimensData = async () => {
        try {
            const response = await getTaxRegimens();
            setTaxRegime(response.data);
        } catch (error) {
            console.error("Error cargando regímenes tributarios:", error);
        }
    };

    const handleNext = async () => {
        const isValid = await validateCurrentStep();
        if (isValid) {
            if (!completedSteps.includes(currentStep)) {
                setCompletedSteps([...completedSteps, currentStep]);
            }
            if (currentStep < 4) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const validateCurrentStep = async () => {
        let fieldsToValidate = [];

        switch (currentStep) {
            case 1:
                fieldsToValidate = [
                    "taxRegime",
                    "address",
                    "email",
                    "phoneNumber",
                    "regionCity",
                ];
                return await methods.trigger(fieldsToValidate);

            case 2:
                fieldsToValidate = [
                    "referenceNumber",
                    "billingDate",
                    "paymentMethod",
                ];
                return await methods.trigger(fieldsToValidate);

            case 3:
                // Validación especial para Invoice Lines
                const lines = methods.getValues("invoiceLines");
                return validateInvoiceLines(lines);

            case 4:
                return true;

            default:
                return true;
        }
    };

    const handleGenerate = async () => {
        const formData = methods.getValues();
        console.log("Generating invoice with data:", formData);

        // TODO: Llamar al servicio de generación de factura
        // const response = await generateInvoice(formData);

        if (onSuccess) {
            onSuccess();
        }
        handleClose();
    };

    const handleClose = () => {
        setCurrentStep(1);
        setCompletedSteps([]);
        methods.reset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="bg-background rounded-xl shadow-2xl w-full max-w-4xl h-[95vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-primary">Generar Factura</h2>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Close Modal Button"
                        >
                            <FiX className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Stepper */}
                    <div className="px-6 pt-6 pb-4 flex-shrink-0">
                        <div className="flex items-center justify-between relative">
                            {steps.map((step, index) => (
                                <React.Fragment key={step.number}>
                                    <div className="flex flex-col items-center z-10 flex-1">
                                        {/* Circle */}
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${completedSteps.includes(step.number)
                                                ? "bg-red-500 text-white"
                                                : step.number === currentStep
                                                    ? "bg-red-500 text-white"
                                                    : "bg-gray-200 text-gray-400"
                                                }`}
                                        >
                                            {step.number}
                                        </div>
                                        {/* Label */}
                                        <div className="mt-2 text-center">
                                            <p
                                                className={`text-xs font-medium ${completedSteps.includes(step.number) ||
                                                    step.number === currentStep
                                                    ? "text-red-500"
                                                    : "text-gray-400"
                                                    }`}
                                            >
                                                {step.label}
                                            </p>
                                            <p
                                                className={`text-xs ${completedSteps.includes(step.number)
                                                    ? "text-red-500"
                                                    : step.number === currentStep
                                                        ? "text-red-500"
                                                        : "text-gray-400"
                                                    }`}
                                            >
                                                {getStepStatus(step.number)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Line connector */}
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`flex-1 h-0.5 mx-2 -mt-10 transition-all ${completedSteps.includes(step.number)
                                                ? "bg-red-500"
                                                : "bg-gray-200"
                                                }`}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <FormProvider {...methods}>
                        <form className="p-6 overflow-y-auto flex-1">
                            {currentStep === 1 && <Step1ClientInformation phoneCodes={phoneCodes} municipalities={municipalities} taxRegimens={taxRegime} />}
                            {currentStep === 2 && <Step2InvoiceInformation />}
                            {currentStep === 3 && <Step3InvoiceLine unitsMeasurement = {unitsMeasurement} />}
                            {currentStep === 4 && <Step4TotalTaxes />}
                        </form>
                    </FormProvider>

                    {/* Footer Navigation */}
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 p-6 border-t border-gray-200 flex-shrink-0">
                        {currentStep > 1 && (
                            <button
                                type="button"
                                onClick={handlePrevious}
                                aria-label="Previous Step Button"
                                className={`px-6 sm:px-8 py-2 rounded-lg font-semibold transition-all w-full sm:w-auto ${currentStep === 1
                                    ? "btn-theme btn-secondary cursor-not-allowed"
                                    : "btn-theme btn-secondary text-white hover:bg-gray-600"
                                    }`}
                            >
                                Anterior
                            </button>
                        )}
                        {currentStep < 4 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                aria-label="Next Step Button"
                                className="btn-theme btn-primary w-full sm:w-auto transition-all px-6 sm:px-8 py-2"
                            >
                                Siguiente
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleGenerate}
                                aria-label="Generate Invoice Button"
                                className="btn-theme btn-primary w-full sm:w-auto transition-all px-6 sm:px-8 py-2"
                            >
                                Generar
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <SuccessModal
                isOpen={successOpen}
                onClose={() => setSuccessOpen(false)}
                title="Exito"
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

export default GenerateInvoiceModal;