import { useFormContext, useFieldArray } from "react-hook-form";
import { FiSearch, FiMenu, FiTrash2, FiSave, FiCheck } from "react-icons/fi";
import { useState, useEffect } from "react";
import { SuccessModal, ErrorModal } from "@/app/components/shared/SuccessErrorModal";
import ServicesModal from "../ServicesModal";
import { searchServiceByCode, saveInvoiceLine, updateInvoiceLine, getInvoiceLines, deleteInvoiceLine } from "@/services/requestService";

export default function Step3InvoiceLine({ unitsMeasurement = [], tributesName = [], invoiceId, onLinesValidation }) {
    const {
        register,
        control,
        watch,
        setValue,
        trigger,
        formState: { errors },
    } = useFormContext();

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "invoiceLines",
    });

    const invoiceLines = watch("invoiceLines");
    const [charCount, setCharCount] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLineIndex, setSelectedLineIndex] = useState(null);
    const [loadingSearch, setLoadingSearch] = useState({});
    const [searchError, setSearchError] = useState({});
    const [savingLine, setSavingLine] = useState({});
    const [savedLines, setSavedLines] = useState({});
    const [successOpen, setSuccessOpen] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    // Cargar líneas guardadas al montar el componente
    useEffect(() => {
        if (invoiceId) {
            loadSavedLines();
        }
    }, [invoiceId]);

    const loadSavedLines = async () => {
        if (!invoiceId) return;

        try {
            const response = await getInvoiceLines(invoiceId);
            if (response) {
                const lines = response;

                // Formatear las líneas para el formulario usando factus_payload
                const formattedLines = lines.map(line => {
                    const payload = line.factus_payload;
                    const lineId = line.id_invoice_line || line.id;

                    return {
                        id: lineId,
                        serviceCode: payload.code_reference,
                        serviceName: payload.name,
                        description: line.service_item_description,
                        basePrice: payload.price || line.price_unit || "",
                        amount: payload.quantity || line.quantity || "",
                        unitOfMeasurement: payload.unit_measure_id || line.units_measurement_id || "",
                        tax: payload.tribute_id || line.tribute_id || "",
                        taxPercent: payload.tax_rate || line.percentage_taxes_per_line || "",
                        discountPercent: payload.discount_rate || line.discount_percentage || "0",
                        totalDiscount: line.discount_amount || "0.00",
                        totalValue: line.total_line_amount ? line.total_line_amount.toFixed(2) : "0.00",
                        isSaved: true  // ✅ <-- agrega esto directamente aquí
                    };
                });

                // Reemplazar las líneas en el formulario
                replace(formattedLines);

                // Marcar líneas como guardadas usando el ID de la línea como clave
                const savedStatus = {};
                formattedLines.forEach((line) => {
                    if (line.id && line.id !== null && line.id !== undefined) {
                        savedStatus[line.id] = true; // Usar line.id como clave, no el índice
                    }
                });

                setTimeout(() => {
                    setSavedLines(savedStatus);

                    // Notificar al componente padre que hay líneas guardadas
                    const hasSavedLines = Object.values(savedStatus).some(saved => saved === true);
                    if (onLinesValidation) {
                        onLinesValidation(hasSavedLines);
                    }
                }, 100);
            }
        } catch (error) {
            console.error("Error cargando líneas guardadas:", error);
        }
    };

    const calculateLineTotals = (index) => {
        const line = invoiceLines[index];
        if (!line) return;

        const basePrice = parseFloat(line.basePrice) || 0;
        const amount = parseFloat(line.amount) || 0;
        const subtotal = basePrice * amount;

        const taxPercent = parseFloat(line.taxPercent) || 0;
        const discountPercent = parseFloat(line.discountPercent) || 0;

        // 1. Calcular el descuento sobre el subtotal
        const discountValue = (subtotal * discountPercent) / 100;

        // 2. Restar el descuento del subtotal
        const subtotalAfterDiscount = subtotal - discountValue;

        // 3. Aplicar el impuesto sobre el valor ya descontado
        const taxValue = (subtotalAfterDiscount * taxPercent) / 100;

        // 4. Total final
        const totalValue = subtotalAfterDiscount + taxValue;

        setValue(`invoiceLines.${index}.totalDiscount`, discountValue.toFixed(2));
        setValue(`invoiceLines.${index}.totalValue`, totalValue.toFixed(2));
    };

    const calculateSummary = () => {
        let subtotal = 0;
        let totalDiscounts = 0;
        let totalTaxes = 0;

        invoiceLines?.forEach((line) => {
            const basePrice = parseFloat(line.basePrice) || 0;
            const amount = parseFloat(line.amount) || 0;
            const lineSubtotal = basePrice * amount;
            const discountPercent = parseFloat(line.discountPercent) || 0;
            const taxPercent = parseFloat(line.taxPercent) || 0;

            // 1. Calcular el descuento
            const discount = (lineSubtotal * discountPercent) / 100;

            // 2. Subtotal después del descuento
            const subtotalAfterDiscount = lineSubtotal - discount;

            // 3. Aplicar impuesto sobre el valor ya descontado
            const taxValue = (subtotalAfterDiscount * taxPercent) / 100;

            subtotal += lineSubtotal;
            totalDiscounts += discount;
            totalTaxes += taxValue;
        });

        return {
            subtotal: subtotal.toFixed(2),
            discounts: totalDiscounts.toFixed(2),
            taxes: totalTaxes.toFixed(2),
            total: (subtotal + totalTaxes - totalDiscounts).toFixed(2),
        };
    };

    const summary = calculateSummary();

    const addNewLine = () => {
        append({
            serviceCode: "",
            serviceName: "",
            description: "",
            basePrice: "",
            amount: "",
            unitOfMeasurement: "",
            tax: "",
            taxPercent: "",
            discountPercent: "",
            totalDiscount: "0.00",
            totalValue: "0.00",
            isSaved: false
        });
    };

    const handleOpenModal = (index) => {
        setSelectedLineIndex(index);
        setIsModalOpen(true);
    };

    const clearServiceFields = (index) => {
        setValue(`invoiceLines.${index}.serviceName`, "");
        setValue(`invoiceLines.${index}.description`, "");
        setValue(`invoiceLines.${index}.basePrice`, "");
        setValue(`invoiceLines.${index}.unitOfMeasurement`, "");
        setValue(`invoiceLines.${index}.tax`, "");
        setValue(`invoiceLines.${index}.taxPercent`, "");
        setValue(`invoiceLines.${index}.discountPercent`, "");
        setValue(`invoiceLines.${index}.totalDiscount`, "0.00");
        setValue(`invoiceLines.${index}.totalValue`, "0.00");
    };

    const handleSearchByCode = async (index) => {
        const serviceCode = watch(`invoiceLines.${index}.serviceCode`);

        if (!serviceCode || serviceCode.trim() === "") {
            setSearchError({
                ...searchError,
                [index]: "Ingrese un código de servicio"
            });
            return;
        }

        try {
            setLoadingSearch({ ...loadingSearch, [index]: true });
            setSearchError({ ...searchError, [index]: null });

            const response = await searchServiceByCode(serviceCode.trim());

            if (response) {
                const service = response.data[0];

                setValue(`invoiceLines.${index}.serviceName`, service.name || service.service_name || "");
                setValue(`invoiceLines.${index}.description`, service.description || "");
                setValue(`invoiceLines.${index}.basePrice`, service.price || service.base_price || "");

                if (service.applicable_tax) {
                    setValue(`invoiceLines.${index}.tax`, service.applicable_tax);
                }

                if (service.tax_rate) {
                    setValue(`invoiceLines.${index}.taxPercent`, service.tax_rate);
                }

                setTimeout(() => calculateLineTotals(index), 100);

                trigger(`invoiceLines.${index}.serviceName`);
                trigger(`invoiceLines.${index}.amount`);
                trigger(`invoiceLines.${index}.unitOfMeasurement`);

            } else {
                clearServiceFields(index);
                setSearchError({
                    ...searchError,
                    [index]: "Servicio no encontrado"
                });
            }
        } catch (error) {
            console.error("Error buscando servicio:", error);
            clearServiceFields(index);
            setSearchError({
                ...searchError,
                [index]: "Servicio no encontrado"
            });
        } finally {
            setLoadingSearch({ ...loadingSearch, [index]: false });
        }
    };

    const handleSelectService = (service) => {
        if (selectedLineIndex !== null) {
            setValue(`invoiceLines.${selectedLineIndex}.serviceName`, service.name);
            setValue(`invoiceLines.${selectedLineIndex}.serviceCode`, service.id);
            setValue(`invoiceLines.${selectedLineIndex}.description`, service.description);
            setValue(`invoiceLines.${selectedLineIndex}.basePrice`, service.price || service.base_price || "");
            setValue(`invoiceLines.${selectedLineIndex}.tax`, service.applicable_tax);
            setValue(`invoiceLines.${selectedLineIndex}.taxPercent`, service.tax_rate);

            setTimeout(() => calculateLineTotals(selectedLineIndex), 100);

            trigger(`invoiceLines.${selectedLineIndex}.serviceName`);
            trigger(`invoiceLines.${selectedLineIndex}.amount`);
        }
        setIsModalOpen(false);
        setSelectedLineIndex(null);
    };

    const handleSaveLine = async (index) => {
        // Validar campos obligatorios de la línea
        const fieldsToValidate = [
            `invoiceLines.${index}.serviceCode`,
            `invoiceLines.${index}.serviceName`,
            `invoiceLines.${index}.amount`,
            `invoiceLines.${index}.unitOfMeasurement`,
            `invoiceLines.${index}.tax`,
            `invoiceLines.${index}.taxPercent`
        ];

        const isValid = await trigger(fieldsToValidate);

        if (!isValid) {
            return;
        }

        const line = invoiceLines[index];

        try {
            setSavingLine({ ...savingLine, [index]: true });

            // Preparar datos para enviar
            const lineData = {
                service_item: line.serviceCode,
                quantity: parseFloat(line.amount),
                units_measurement_id: Number(line.unitOfMeasurement),
                tribute_id: line.tax,
                percentage_taxes_per_line: parseFloat(line.taxPercent),
                discount_percentage: parseFloat(line.discountPercent) || 0,
            };

            let response;

            // Si la línea tiene ID (viene del GET), actualizar usando id_invoice_line
            if (line.id) {
                response = await updateInvoiceLine(invoiceId, line.id, lineData);
            } else {
                // Si es una línea nueva, crear
                response = await saveInvoiceLine(invoiceId, lineData);
            }

            if (response) {
                setModalMessage(response.detail);
                setSuccessOpen(true);
                await loadSavedLines();
                // Solo actualizar el ID si es una línea nueva (no tiene ID previo)
                if (!line.id && response.id_invoice_line) {
                    setValue(`invoiceLines.${index}.id`, response.id_invoice_line);
                }

                // Marcar como guardada
                const newSavedLines = { ...savedLines, [index]: true };
                setSavedLines(newSavedLines);
                setValue(`invoiceLines.${index}.isSaved`, true);

                // Notificar al componente padre que hay líneas guardadas
                if (onLinesValidation) {
                    onLinesValidation(true);
                }
            }
        } catch (error) {
            setModalMessage(error.response.data.message);
            setErrorOpen(true);
        } finally {
            setSavingLine({ ...savingLine, [index]: false });
        }
    };

    const handleDeleteLine = async (index) => {
        const line = invoiceLines[index];

        if (line.id) {
            // Si la línea está guardada, confirmar eliminación
            try {
                // Usar id_invoice_line para eliminar
                const response = await deleteInvoiceLine(invoiceId, line.id);
                setModalMessage(response.detail);
                setSuccessOpen(true);

                // Eliminar del estado de líneas guardadas usando el ID
                const newSavedLines = { ...savedLines };
                delete newSavedLines[line.id];
                setSavedLines(newSavedLines);

                // Remover la línea del formulario
                remove(index);

                // Verificar si quedan líneas guardadas después de eliminar
                const hasSavedLines = Object.values(newSavedLines).some(saved => saved === true);
                if (onLinesValidation) {
                    onLinesValidation(hasSavedLines);
                }
            } catch (error) {
                console.error("Error eliminando línea:", error);
                alert(`Error al eliminar la línea: ${error.message || 'Error desconocido'}`);
            }
        } else {
            // Si no está guardada, solo removerla del formulario
            remove(index);
        }
    };

    const handleNegativeInput = (e) => {
        if (e.target.value < 0) {
            e.target.value = 0;
        }
    };

    const validateNonNegative = (value) => {
        const numValue = parseFloat(value);
        if (numValue < 0) {
            return "No puede ser negativo";
        }
        return true;
    };

    const handleFieldChange = (fieldPath) => {
        trigger(fieldPath);
    };

    const isLineSaved = (index) => {
        const line = invoiceLines[index];
        if (!line) return false;
        return line.isSaved || savedLines[line.id] || false;
    };


    return (
        <>
            <div id="Step-3-Invoice-Line">
                <h3 className="text-xl font-semibold mb-6 text-primary">Líneas de la Factura</h3>

                <div className="space-y-6">
                    {fields.map((field, index) => (
                        <div key={field.id} className="space-y-4 p-4 border rounded-lg relative" style={{
                            backgroundColor: isLineSaved(index) ? '#f0fdf4' : '#ffffff',
                            borderColor: isLineSaved(index) ? '#86efac' : '#e5e7eb'
                        }}>
                            {/* Indicador de línea guardada */}
                            {isLineSaved(index) && (
                                <div className="absolute top-2 right-2 flex items-center gap-1 text-green-600 text-xs">
                                    <FiCheck className="w-4 h-4" />
                                    <span>Guardada</span>
                                </div>
                            )}

                            {/* Service Line Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-base font-semibold text-secondary">
                                    Línea de Servicio #{index + 1}
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteLine(index)}
                                    className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-md flex items-center gap-1"
                                    title="Eliminar línea"
                                    aria-label="Delete Line Button"
                                >
                                    <FiTrash2 className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Campo oculto para basePrice e id */}
                            <input type="hidden" {...register(`invoiceLines.${index}.basePrice`)} />
                            <input type="hidden" {...register(`invoiceLines.${index}.id`)} />
                            <input type="hidden" {...register(`invoiceLines.${index}.isSaved`)} />

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Service code */}
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-2">
                                        Código del Servicio *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            {...register(`invoiceLines.${index}.serviceCode`, {
                                                required: "Campo obligatorio",
                                                onChange: () => {
                                                    handleFieldChange(`invoiceLines.${index}.serviceCode`);
                                                    if (searchError[index]) {
                                                        setSearchError({ ...searchError, [index]: null });
                                                    }
                                                },
                                            })}
                                            className="parametrization-input w-full pr-10"
                                            placeholder="Código de Servicio"
                                            aria-label="Service Code Input"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleSearchByCode(index);
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleSearchByCode(index)}
                                            disabled={loadingSearch[index]}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            title="Buscar servicio por código"
                                        >
                                            {loadingSearch[index] ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                            ) : (
                                                <FiSearch className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.invoiceLines?.[index]?.serviceCode && (
                                        <span className="text-xs text-red-500 mt-1 block">
                                            {errors.invoiceLines[index].serviceCode.message}
                                        </span>
                                    )}
                                    {searchError[index] && (
                                        <span className="text-xs text-red-500 mt-1 block">
                                            {searchError[index]}
                                        </span>
                                    )}
                                    {loadingSearch[index] && (
                                        <span className="text-xs text-blue-500 mt-1 block">
                                            Buscando servicio...
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-2">
                                        Nombre del Servicio *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            {...register(`invoiceLines.${index}.serviceName`, {
                                                required: "Campo obligatorio",
                                                onChange: () => handleFieldChange(`invoiceLines.${index}.serviceName`),
                                            })}
                                            className="parametrization-input w-full pr-12 whitespace-nowrap overflow-hidden text-ellipsis"
                                            placeholder="Nombre del Servicio"
                                            aria-label="Service Name Input"
                                            title={watch(`invoiceLines.${index}.serviceName`)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleOpenModal(index)}
                                            aria-label="Active Services Button"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none"
                                        >
                                            <FiMenu className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {errors.invoiceLines?.[index]?.serviceName && (
                                        <span className="text-xs text-red-500 mt-1 block">
                                            {errors.invoiceLines[index].serviceName.message}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-2">
                                        Cantidad *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        {...register(`invoiceLines.${index}.amount`, {
                                            required: "Campo obligatorio",
                                            validate: validateNonNegative,
                                            onChange: () => {
                                                calculateLineTotals(index);
                                                handleFieldChange(`invoiceLines.${index}.amount`);
                                            },
                                        })}
                                        onBlur={handleNegativeInput}
                                        className="parametrization-input w-full"
                                        placeholder="0.00"
                                        aria-label="Amount Input"
                                    />
                                    {errors.invoiceLines?.[index]?.amount && (
                                        <span className="text-xs text-red-500 mt-1 block">
                                            {errors.invoiceLines[index].amount.message}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-2">
                                        Unidad de Medida *
                                    </label>
                                    <select
                                        {...register(`invoiceLines.${index}.unitOfMeasurement`, {
                                            required: "Campo obligatorio",
                                            onChange: () => handleFieldChange(`invoiceLines.${index}.unitOfMeasurement`),
                                        })}
                                        className="parametrization-input w-full"
                                        aria-label="Unit of Measurement Select"
                                    >
                                        <option value="">Seleccione</option>
                                        {unitsMeasurement && unitsMeasurement.length > 0 ? (
                                            unitsMeasurement.map((unit) => (
                                                <option key={unit.id} value={unit.id}>
                                                    {unit.name}
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>Cargando unidades...</option>
                                        )}
                                    </select>
                                    {errors.invoiceLines?.[index]?.unitOfMeasurement && (
                                        <span className="text-xs text-red-500 mt-1 block">
                                            {errors.invoiceLines[index].unitOfMeasurement.message}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary mb-2">
                                    Descripción del Servicio
                                </label>
                                <textarea
                                    {...register(`invoiceLines.${index}.description`, {
                                        maxLength: {
                                            value: 500,
                                            message: "Máximo 500 caracteres",
                                        },
                                        onChange: () => handleFieldChange(`invoiceLines.${index}.description`),
                                    })}
                                    className="parametrization-input w-full"
                                    rows={3}
                                    onChange={(e) => {
                                        setCharCount({ ...charCount, [index]: e.target.value.length });
                                        handleFieldChange(`invoiceLines.${index}.description`);
                                    }}
                                    aria-label="Service Description Textarea"
                                    placeholder="Describa el servicio prestado..."
                                />
                                {errors.invoiceLines?.[index]?.description ? (
                                    <span className="text-xs text-red-500 mt-1 block">
                                        {errors.invoiceLines[index].description.message}
                                    </span>
                                ) : (
                                    <span className="text-xs text-gray-500">{charCount[index] || 0}/500 caracteres</span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-2">
                                        Impuesto *
                                    </label>
                                    <select
                                        {...register(`invoiceLines.${index}.tax`, {
                                            required: "Campo obligatorio",
                                            onChange: () => handleFieldChange(`invoiceLines.${index}.tax`),
                                        })}
                                        className="parametrization-input w-full"
                                        aria-label="Tax Select"
                                    >
                                        <option value="">Select</option>
                                        {tributesName && tributesName.length > 0 ? (
                                            tributesName.map((tribute) => (
                                                <option key={tribute.id} value={tribute.id}>
                                                    {tribute.name}
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>Cargando impuestos...</option>
                                        )}
                                    </select>
                                    {errors.invoiceLines?.[index]?.tax && (
                                        <span className="text-xs text-red-500 mt-1 block">
                                            {errors.invoiceLines[index].tax.message}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-2">
                                        % de Impuesto *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        {...register(`invoiceLines.${index}.taxPercent`, {
                                            required: "Campo obligatorio",
                                            validate: validateNonNegative,
                                            onChange: () => {
                                                calculateLineTotals(index);
                                                handleFieldChange(`invoiceLines.${index}.taxPercent`);
                                            },
                                        })}
                                        className="parametrization-input w-full"
                                        placeholder="0.00"
                                        onBlur={handleNegativeInput}
                                        aria-label="Tax Percent Input"
                                    />
                                    {errors.invoiceLines?.[index]?.taxPercent && (
                                        <span className="text-xs text-red-500 mt-1 block">
                                            {errors.invoiceLines[index].taxPercent.message}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-2">
                                        % de Descuento
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        {...register(`invoiceLines.${index}.discountPercent`, {
                                            validate: validateNonNegative,
                                            onChange: () => {
                                                calculateLineTotals(index);
                                                handleFieldChange(`invoiceLines.${index}.discountPercent`);
                                            },
                                        })}
                                        className="parametrization-input w-full"
                                        placeholder="0.00"
                                        aria-label="Discount Percent Input"
                                        onBlur={handleNegativeInput}
                                    />
                                    {errors.invoiceLines?.[index]?.discountPercent && (
                                        <span className="text-xs text-red-500 mt-1 block">
                                            {errors.invoiceLines[index].discountPercent.message}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-2">
                                        Total Descuento
                                    </label>
                                    <input
                                        type="text"
                                        {...register(`invoiceLines.${index}.totalDiscount`)}
                                        className="parametrization-input w-full bg-gray-50"
                                        readOnly
                                        placeholder="0.00"
                                        disabled
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-2">
                                        Valor Total
                                    </label>
                                    <input
                                        type="text"
                                        {...register(`invoiceLines.${index}.totalValue`)}
                                        className="parametrization-input w-full bg-gray-50"
                                        readOnly
                                        placeholder="0.00"
                                        disabled
                                    />
                                </div>
                            </div>

                            {/* Botón de Guardar línea debajo del Valor Total */}
                            <div className="col-span-12 flex justify-end mt-4">
                                <button
                                    type="button"
                                    aria-label="Add/Update Line Button"
                                    onClick={() => handleSaveLine(index)}
                                    disabled={savingLine[index]}
                                    className="flex btn-primary items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {savingLine[index] ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span className="text-sm">Guardando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiSave className="w-4 h-4" />
                                            <span className="text-sm">
                                                {isLineSaved(index) ? "Actualizar línea" : "Guardar línea"}
                                            </span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {index < fields.length - 1 && (
                                <hr className="border-gray-200 my-6" />
                            )}
                        </div>
                    ))}

                    {/* Add line button */}
                    <button
                        type="button"
                        onClick={addNewLine}
                        aria-label="Add Service Line Button"
                        className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                        <span className="text-xl">+</span> Agregar Línea de Servicio
                    </button>

                    {/* Summary Section */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h4 className="text-base font-semibold text-secondary mb-4">
                            Resumen de Totales
                        </h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-secondary">Subtotal:</span>
                                <span className="text-sm font-medium text-secondary">
                                    ${summary.subtotal}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-secondary">Descuentos:</span>
                                <span className="text-sm font-medium text-secondary">
                                    ${summary.discounts}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-secondary">Impuestos:</span>
                                <span className="text-sm font-medium text-secondary">
                                    ${summary.taxes}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                <span className="text-base font-semibold text-primary">
                                    Total:
                                </span>
                                <span className="text-base font-bold text-primary">
                                    ${summary.total}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ServicesModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedLineIndex(null);
                }}
                onSelectService={handleSelectService}
            />
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
}