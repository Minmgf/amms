import { useFormContext } from "react-hook-form";
import { useState } from "react";

export default function Step2InvoiceInformation() {
    const {
        register,
        formState: { errors },
    } = useFormContext();

    const [charCount, setCharCount] = useState(0);

    return (
        <div id="Step-2-Invoice-Information">
            <h3 className="text-xl font-semibold mb-6 text-primary">
                Información de la Factura
            </h3>

            <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                            <div className="flex items-center">
                                <span className="text-sm font-medium text-secondary w-48">Código de Referencia:</span>
                                <span className="text-sm text-gray-700">Example Code</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                            Fecha de Facturación:
                        </label>
                        <input
                            type="date"
                            {...register("billingDate", {
                                required: "Este campo es obligatorio",
                            })}
                            className="parametrization-input w-full"
                            aria-label="Billing Date Input"
                        />
                        {errors.billingDate && (
                            <span className="text-xs text-red-500 mt-1 block">
                                {errors.billingDate.message}
                            </span>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                            Método de Pago:
                        </label>
                        <select
                            {...register("paymentMethod", {
                                required: "Este campo es obligatorio",
                            })}
                            className="parametrization-input w-full"
                            aria-label="Payment Method Select"
                        >
                            <option value="">Seleccione</option>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                            <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                        </select>
                        {errors.paymentMethod && (
                            <span className="text-xs text-red-500 mt-1 block">
                                {errors.paymentMethod.message}
                            </span>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                        Observaciones
                    </label>
                    <textarea
                        {...register("observations", {
                            required: "Este campo es obligatorio",
                            maxLength: {
                                value: 500,
                                message: "Máximo 500 caracteres",
                            },
                        })}
                        className="parametrization-input w-full"
                        rows={6}
                        onChange={(e) => setCharCount(e.target.value.length)}
                        aria-label="Observations Textarea"
                        placeholder="Describa las observaciones necesarias..."
                    />
                    <div className="flex justify-between items-center mt-1">
                        {errors.observations ? (
                            <span className="text-xs text-red-500">
                                {errors.observations.message}
                            </span>
                        ) : (
                            <span className="text-xs text-gray-500">{charCount}/500 caracteres</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}