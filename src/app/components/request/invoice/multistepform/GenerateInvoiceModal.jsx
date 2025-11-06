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
import { getMunicipalities, getUnitsMeasurement, getTributesName } from "@/services/billingService";
import { getTaxRegimens, getClientDetail, updateClient } from "@/services/clientService";
import { updateUser } from "@/services/clientService";
import { getPaymentMethods, createInvoice, updateInvoice, getInvoiceDetail, generateInvoice } from "@/services/requestService";

const GenerateInvoiceModal = ({ isOpen, onClose, onSuccess, billingToken, request }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [phoneCodes, setPhoneCodes] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [taxRegime, setTaxRegime] = useState([]);
    const [unitsMeasurement, setUnitsMeasurement] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [tributesName, setTributesName] = useState([]);
    const [loadingClientData, setLoadingClientData] = useState(false);
    const [originalClientData, setOriginalClientData] = useState(null);
    const [createdInvoice, setCreatedInvoice] = useState(null);
    const [existingInvoiceId, setExistingInvoiceId] = useState(null);
    const [originalInvoiceData, setOriginalInvoiceData] = useState(null);
    const [hasInvoiceLinesSaved, setHasInvoiceLinesSaved] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

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

    useEffect(() => {
        const loadAllData = async () => {
            if (!isOpen || !billingToken || !request) {
                return;
            }

            const clientId = request.client.idClient;
            if (!clientId) {
                return;
            }

            try {
                setLoadingClientData(true);

                // 1. PRIMERO: Cargar todos los selects en paralelo
                const [phone_codes, tax_regime_data, payment_methods_data, municipalities_data, units_data, tributes_data] = await Promise.all([
                    getCountries(),
                    getTaxRegimens(),
                    getPaymentMethods(),
                    getMunicipalities(billingToken, ""),
                    getUnitsMeasurement(billingToken, ""),
                    getTributesName()
                ]);

                // Setear los datos de los selects
                setPhoneCodes(phone_codes);
                setTaxRegime(tax_regime_data?.data || tax_regime_data);
                setPaymentMethods(payment_methods_data?.data || payment_methods_data);
                setMunicipalities(municipalities_data?.data || municipalities_data || []);
                setUnitsMeasurement(units_data?.data || units_data || []);
                setTributesName(tributes_data?.data.tributes || tributes_data.data.tributes)

                // 2. CARGAR INFORMACIÓN DEL CLIENTE
                const response = await getClientDetail(clientId);
                const clientData = response.data;

                // Poblar el formulario con los datos del cliente
                if (clientData) {
                    methods.setValue("typeOfPerson", clientData.person_type_name || "");
                    methods.setValue("documentationType", clientData.type_document_name || "");
                    methods.setValue("documentationNumber", clientData.document_number || "");
                    methods.setValue("checkDigit", clientData.check_digit || "");
                    methods.setValue("legalName", clientData.legal_entity_name || "");
                    methods.setValue("businessName", clientData.business_name || "");
                    methods.setValue("fullName", clientData.name || "");
                    methods.setValue("fullLastName", (clientData.first_last_name || "") + " " + (clientData.second_last_name || ""));
                    methods.setValue("taxRegime", clientData.id_tax_regime?.toString() || clientData.tax_regime?.toString() || "");
                    methods.setValue("address", clientData.address || "");
                    methods.setValue("email", clientData.email || "");
                    methods.setValue("regionCity", clientData.id_municipality?.toString() || "");

                    if (clientData.phone) {
                        const phoneMatch = clientData.phone.match(/^(\+\d+)\s*(.+)$/);
                        if (phoneMatch) {
                            methods.setValue("phoneCode", phoneMatch[1]);
                            methods.setValue("phoneNumber", phoneMatch[2]);
                        } else {
                            methods.setValue("phoneNumber", clientData.phone);
                        }
                    }

                    // Guardar valores originales de los campos editables
                    setOriginalClientData({
                        id_user: clientData.id_user,
                        taxRegime: clientData.id_tax_regime?.toString() || clientData.tax_regime?.toString() || "",
                        address: clientData.address || "",
                        email: clientData.email || "",
                        phoneCode: clientData.phone ? clientData.phone.match(/^(\+\d+)/)?.[1] || "+57" : "+57",
                        phoneNumber: clientData.phone ? clientData.phone.match(/^(\+\d+)\s*(.+)$/)?.[2] || clientData.phone : "",
                        regionCity: clientData.id_municipality?.toString() || ""
                    });
                }

                // 3. VERIFICAR Y CARGAR DATOS DE FACTURA SI EXISTE
                if (request.iDinvoice) {
                    setExistingInvoiceId(request.iDinvoice);

                    try {
                        const invoiceResponse = await getInvoiceDetail(request.iDinvoice);
                        const invoiceData = invoiceResponse.data || invoiceResponse;

                        // Poblar Step 2 - Información de la Factura
                        if (invoiceData) {
                            const paymentMethodCode = invoiceData.payment_method?.toString() || "";
                            const billingDate = invoiceData.billing_date || invoiceData.invoice_date || "";
                            const observations = invoiceData.observation || invoiceData.observations || "";

                            methods.setValue("referenceNumber", invoiceData.reference_code || "");
                            methods.setValue("billingDate", billingDate);
                            methods.setValue("paymentMethod", paymentMethodCode);
                            methods.setValue("observations", observations);

                            // Guardar valores originales de la factura para detectar cambios
                            setOriginalInvoiceData({
                                billingDate: billingDate,
                                paymentMethod: paymentMethodCode,
                                observations: observations
                            });

                            // Poblar Step 3 - Líneas de Factura (si existen)
                            if (invoiceData.lines && Array.isArray(invoiceData.lines)) {
                                const formattedLines = invoiceData.lines.map(line => ({
                                    id: line.id,
                                    serviceCode: line.service_code || "",
                                    serviceName: line.service_name || line.description || "",
                                    quantity: line.quantity || 1,
                                    unitOfMeasurement: line.unit_of_measurement_code || line.unit_code || "",
                                    unitPrice: line.unit_price || line.price || 0,
                                    amount: line.line_extension_amount || line.amount || 0,
                                    taxPercent: line.tax_percent || 0,
                                    taxAmount: line.tax_amount || 0,
                                    discountPercent: line.discount_percent || 0,
                                    discountAmount: line.discount_amount || 0,
                                    totalAmount: line.total_amount || 0
                                }));

                                methods.setValue("invoiceLines", formattedLines);
                            }

                            // Poblar Step 4 - Totales (si existen)
                            if (invoiceData.totals || invoiceData.legal_monetary_total) {
                                const totals = invoiceData.totals || invoiceData.legal_monetary_total;
                                methods.setValue("sumGrossLineValues", totals.line_extension_amount || 0);
                                methods.setValue("totalWithTaxes", totals.tax_inclusive_amount || 0);
                                methods.setValue("totalWithoutTaxes", totals.tax_exclusive_amount || 0);
                                methods.setValue("amountPayable", totals.payable_amount || 0);
                            }

                            // Guardar la factura en el estado
                            setCreatedInvoice(invoiceData);
                        }
                    } catch (invoiceError) {
                        console.error("Error al cargar datos de la factura:", invoiceError);
                        setModalMessage(`Advertencia: No se pudieron cargar los datos de la factura existente`);
                        setErrorOpen(true);
                    }
                }

            } catch (error) {
                console.error("Error loading data:", error);
                setModalMessage(`Error al cargar los datos: ${error.message || 'Error desconocido'}`);
                setErrorOpen(true);
                // Setear valores por defecto en caso de error
                setPhoneCodes([]);
                setMunicipalities([]);
                setTaxRegime([]);
                setUnitsMeasurement([]);
                setTributesName([]);
            } finally {
                setLoadingClientData(false);
            }
        };

        loadAllData();
    }, [isOpen, billingToken, request]);
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

    const checkAndUpdateClient = async () => {
        if (!originalClientData || !request?.client?.idClient) {
            return true; // Si no hay datos originales, continuar sin actualizar
        }

        const currentData = {
            taxRegime: methods.getValues("taxRegime"),
            address: methods.getValues("address"),
            email: methods.getValues("email"),
            phoneCode: methods.getValues("phoneCode"),
            phoneNumber: methods.getValues("phoneNumber"),
            regionCity: methods.getValues("regionCity")
        };

        // Detectar si hubo cambios
        const hasChanges =
            currentData.taxRegime !== originalClientData.taxRegime ||
            currentData.address !== originalClientData.address ||
            currentData.email !== originalClientData.email ||
            currentData.phoneCode !== originalClientData.phoneCode ||
            currentData.phoneNumber !== originalClientData.phoneNumber ||
            currentData.regionCity !== originalClientData.regionCity;

        if (!hasChanges) {
            return true; // No hay cambios, continuar
        }

        try {
            // Preparar datos para el servicio de editar cliente
            const updateData = {
                id_tax_regime: currentData.taxRegime,
                address: currentData.address,
                email: currentData.email,
                phone: `${currentData.phoneCode} ${currentData.phoneNumber}`,
                id_municipality: currentData.regionCity
            };

            // Llamar al servicio de editar cliente
            await updateClient(request.client.idClient, updateData);
            if (originalClientData.id_user) {
                const userUpdateData = {
                    email: currentData.email,
                    phone: `${currentData.phoneCode} ${currentData.phoneNumber}`,
                    id_tax_regime: currentData.taxRegime,
                    address: currentData.address,
                    id_municipality: currentData.regionCity
                };

                await updateUser(originalClientData.id_user, userUpdateData);
            }

            setOriginalClientData(currentData);
            return true;
        } catch (error) {
            setModalMessage(`Error al actualizar el cliente: ${error.message || 'Error desconocido'}`);
            setErrorOpen(true);
            return false;
        }
    };

    const createOrUpdateInvoice = async () => {
        if (!request?.id) {
            setModalMessage("No se encontró el ID de la solicitud");
            setErrorOpen(true);
            return false;
        }

        try {
            const currentData = {
                billingDate: methods.getValues("billingDate"),
                paymentMethod: methods.getValues("paymentMethod"),
                observations: methods.getValues("observations") || ""
            };

            // Verificar si existe una factura (ya sea cargada inicialmente o recién creada)
            if (existingInvoiceId || createdInvoice?.id_invoice) {
                const invoiceId = existingInvoiceId || createdInvoice?.id_invoice;

                // Detectar si hubo cambios en los datos de la factura
                const hasChanges =
                    currentData.billingDate !== originalInvoiceData?.billingDate ||
                    currentData.paymentMethod !== originalInvoiceData?.paymentMethod ||
                    currentData.observations !== originalInvoiceData?.observations;

                if (!hasChanges) {
                    return true;
                }

                // ACTUALIZAR factura existente solo si hay cambios
                const invoiceData = {
                    service_request: request.id,
                    observation: currentData.observations,
                    payment_method: currentData.paymentMethod,
                };

                const response = await updateInvoice(invoiceId, invoiceData);

                if (response) {
                    // Actualizar los valores originales después de la actualización exitosa
                    setOriginalInvoiceData(currentData);
                    // Asegurar que el ID esté guardado
                    if (!existingInvoiceId) {
                        setExistingInvoiceId(invoiceId);
                    }
                    return true;
                }
            } else {
                // CREAR nueva factura
                const invoiceData = {
                    service_request: request.id,
                    observation: currentData.observations,
                    payment_method: currentData.paymentMethod,
                };

                const response = await createInvoice(invoiceData);

                if (response) {
                    setCreatedInvoice(response);
                    setExistingInvoiceId(response.id_invoice);

                    // Si la respuesta incluye un reference_code, guardarlo en el formulario
                    if (response.reference_code) {
                        methods.setValue("referenceNumber", response.reference_code);
                    }

                    // Guardar los valores originales de la nueva factura
                    setOriginalInvoiceData(currentData);
                    return true;
                }
            }

            return false;
        } catch (error) {
            const action = (existingInvoiceId || createdInvoice?.id_invoice) ? "actualizar" : "crear";
            setModalMessage(`Error al ${action} la factura: ${error.message || 'Error desconocido'}`);
            setErrorOpen(true);
            return false;
        }
    };

    const handleNext = async () => {
        // Validar el paso actual primero
        const isValid = await validateCurrentStep();
        if (!isValid) {
            return;
        }

        // Si estamos en el paso 1 (información del cliente), verificar cambios
        if (currentStep === 1) {
            const updated = await checkAndUpdateClient();
            if (!updated) {
                return;
            }
        }

        if (currentStep === 2) {
            const processed = await createOrUpdateInvoice();
            if (!processed) {
                return;
            }
        }

        // Marcar paso como completado y avanzar
        if (!completedSteps.includes(currentStep)) {
            setCompletedSteps([...completedSteps, currentStep]);
        }
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleLinesValidation = (hasSavedLines) => {
        setHasInvoiceLinesSaved(hasSavedLines);
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
                // Validar que haya al menos una línea guardada
                if (!hasInvoiceLinesSaved) {
                    setModalMessage("Debe guardar al menos una línea de factura antes de continuar");
                    setErrorOpen(true);
                    return false;
                }

                const lines = methods.getValues("invoiceLines");
                if (!lines || lines.length === 0) {
                    setModalMessage("Debe agregar al menos una línea de servicios a la factura");
                    setErrorOpen(true);
                    return false;
                }

                return true;

            case 4:
                return true;

            default:
                return true;
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        const invoiceId = existingInvoiceId || createdInvoice?.id_invoice || request?.iDinvoice;
        try {
            const response = await generateInvoice(invoiceId);
            setModalMessage(response.detail);
            setSuccessOpen(true);
            setTimeout(() => {
                if (onSuccess) {
                    onSuccess();
                }
                handleClose();
            }, 3000);
        } catch (error) {
            setModalMessage("No se pudo generar la factura. Intente nuevamente.");
            setErrorOpen(true);
        } finally {
            setIsGenerating(false);
        }
    };


    const handleClose = () => {
        setCurrentStep(1);
        setCompletedSteps([]);
        setOriginalClientData(null);
        setCreatedInvoice(null);
        setExistingInvoiceId(null);
        setOriginalInvoiceData(null);
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
                            {loadingClientData ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                                        <p className="text-gray-600">Cargando información del cliente...</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {currentStep === 1 && (
                                        <Step1ClientInformation
                                            phoneCodes={phoneCodes}
                                            municipalities={municipalities}
                                            taxRegimens={taxRegime}
                                        />
                                    )}
                                    {currentStep === 2 && <Step2InvoiceInformation
                                        paymentMethods={paymentMethods} />}
                                    {currentStep === 3 && <Step3InvoiceLine onLinesValidation={handleLinesValidation} unitsMeasurement={unitsMeasurement} tributesName={tributesName} invoiceId={existingInvoiceId || createdInvoice?.id_invoice} />}
                                    {currentStep === 4 && <Step4TotalTaxes />}
                                </>
                            )}
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
                                disabled={isGenerating}
                                aria-label="Generate Invoice Button"
                                className="btn-theme btn-primary w-full sm:w-auto transition-all px-6 sm:px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generando...
                                    </span>
                                ) : (
                                    "Generar"
                                )}
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