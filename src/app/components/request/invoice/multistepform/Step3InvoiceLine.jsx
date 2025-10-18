import { useFormContext, useFieldArray } from "react-hook-form";
import { FiSearch, FiMenu, FiTrash2 } from "react-icons/fi";
import { useState } from "react";
import ServicesModal from "../ServicesModal";

export default function Step3InvoiceLine() {
    const {
        register,
        control,
        watch,
        setValue,
        trigger,
        formState: { errors },
    } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name: "invoiceLines",
    });

    const invoiceLines = watch("invoiceLines");
    const [charCount, setCharCount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLineIndex, setSelectedLineIndex] = useState(null);

    const calculateLineTotals = (index) => {
        const line = invoiceLines[index];
        if (!line) return;

        const amount = parseFloat(line.amount) || 0;
        const taxPercent = parseFloat(line.taxPercent) || 0;
        const discountPercent = parseFloat(line.discountPercent) || 0;

        const taxValue = (amount * taxPercent) / 100;
        const discountValue = (amount * discountPercent) / 100;
        const totalValue = amount + taxValue - discountValue;

        setValue(`invoiceLines.${index}.totalDiscount`, discountValue.toFixed(2));
        setValue(`invoiceLines.${index}.totalValue`, totalValue.toFixed(2));
    };

    const calculateSummary = () => {
        let subtotal = 0;
        let totalDiscounts = 0;
        let totalTaxes = 0;

        invoiceLines?.forEach((line) => {
            const amount = parseFloat(line.amount) || 0;
            const discount = parseFloat(line.totalDiscount) || 0;
            const taxPercent = parseFloat(line.taxPercent) || 0;

            subtotal += amount;
            totalDiscounts += discount;
            totalTaxes += (amount * taxPercent) / 100;
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
            amount: "",
            unitOfMeasurement: "",
            tax: "",
            taxPercent: "",
            discountPercent: "",
            totalDiscount: "0.00",
            totalValue: "0.00",
        });
    };

    const handleOpenModal = (index) => {
        setSelectedLineIndex(index);
        setIsModalOpen(true);
    };

    const handleSelectService = (serviceName) => {
        if (selectedLineIndex !== null) {
            setValue(`invoiceLines.${selectedLineIndex}.serviceName`, serviceName);
            // Validar el campo cuando se selecciona del modal
            trigger(`invoiceLines.${selectedLineIndex}.serviceName`);
        }
        setIsModalOpen(false);
        setSelectedLineIndex(null);
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
        // Validar el campo específico cuando cambia
        trigger(fieldPath);
    };

    return (
        <>
            <div id="Step-3-Invoice-Line">
                <h3 className="text-xl font-semibold mb-6 text-primary">Líneas de la Factura</h3>

                <div className="space-y-6">
                    {fields.map((field, index) => (
                        <div key={field.id} className="space-y-4">
                            {/* Service Line Header */}
                            <div className="flex items-center justify-between">
                                <h4 className="text-base font-semibold text-secondary">
                                    Línea de Servicio #{index + 1}
                                </h4>
                                {fields.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Service code */}
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-2">
                                        Código del Servicio
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            {...register(`invoiceLines.${index}.serviceCode`, {
                                                required: "Campo obligatorio",
                                                onChange: () => handleFieldChange(`invoiceLines.${index}.serviceCode`),
                                            })}
                                            className="parametrization-input w-full pr-10"
                                            placeholder="Código de Servicio"
                                            aria-label="Service Code Input"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <FiSearch className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {errors.invoiceLines?.[index]?.serviceCode && (
                                        <span className="text-xs text-red-500 mt-1 block">
                                            {errors.invoiceLines[index].serviceCode.message}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-2">
                                        Nombre del Servicio
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            {...register(`invoiceLines.${index}.serviceName`, {
                                                required: "Campo obligatorio",
                                                onChange: () => handleFieldChange(`invoiceLines.${index}.serviceName`),
                                            })}
                                            className="parametrization-input w-full pr-10"
                                            placeholder="Nombre del Servicio"
                                            aria-label="Service Name Input"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                handleOpenModal(index);
                                            }}
                                            aria-label="Active Services Button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none p-1"
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
                                        Cantidad
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
                                        Unidad de Medida
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
                                        <option value="Unit">Unit</option>
                                        <option value="Hour">Hour</option>
                                        <option value="Day">Day</option>
                                        <option value="Service">Service</option>
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
                                        setCharCount(e.target.value.length);
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
                                    <span className="text-xs text-gray-500">{charCount}/500 caracteres</span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-2">
                                        Impuesto
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
                                        <option value="IVA">IVA</option>
                                        <option value="INC">INC</option>
                                        <option value="Exempt">Exempt</option>
                                    </select>
                                    {errors.invoiceLines?.[index]?.tax && (
                                        <span className="text-xs text-red-500 mt-1 block">
                                            {errors.invoiceLines[index].tax.message}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-2">
                                        % de Impuesto
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
        </>
    );
}