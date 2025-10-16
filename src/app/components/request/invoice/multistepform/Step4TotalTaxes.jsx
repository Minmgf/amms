import { useFormContext } from "react-hook-form";
import { useEffect } from "react";

export default function Step4TotalTaxes() {
  const { watch, setValue } = useFormContext();

  const invoiceLines = watch("invoiceLines");

  useEffect(() => {
    calculateTotals();
  }, [invoiceLines]);

  const calculateTotals = () => {
    let sumGrossLineValues = 0;
    let totalTaxes = 0;
    let totalDiscounts = 0;

    invoiceLines?.forEach((line) => {
      const amount = parseFloat(line.amount) || 0;
      const taxPercent = parseFloat(line.taxPercent) || 0;
      const discountPercent = parseFloat(line.discountPercent) || 0;

      sumGrossLineValues += amount;
      totalTaxes += (amount * taxPercent) / 100;
      totalDiscounts += (amount * discountPercent) / 100;
    });

    const totalWithoutTaxes = sumGrossLineValues - totalDiscounts;
    const totalWithTaxes = totalWithoutTaxes + totalTaxes;
    const amountPayable = sumGrossLineValues + totalTaxes - totalDiscounts;

    setValue("sumGrossLineValues", sumGrossLineValues.toFixed(2));
    setValue("totalWithTaxes", totalWithTaxes.toFixed(2));
    setValue("totalWithoutTaxes", totalWithoutTaxes.toFixed(2));
    setValue("amountPayable", amountPayable.toFixed(2));
  };

  const sumGrossLineValues = watch("sumGrossLineValues") || "0.00";
  const totalWithTaxes = watch("totalWithTaxes") || "0.00";
  const totalWithoutTaxes = watch("totalWithoutTaxes") || "0.00";
  const amountPayable = watch("amountPayable") || "0.00";

  return (
    <div id="Step-4-Total-Taxes">
      <h3 className="text-xl font-semibold mb-6 text-primary">
        Total e Impuestos
      </h3>

      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex items-center">
                <span className="text-sm font-medium text-secondary w-48">Suma de Valores Brutos de Línea:</span>
                <span className="text-sm text-gray-700">${sumGrossLineValues}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-secondary w-48">Total sin Impuestos:</span>
                <span className="text-sm text-gray-700">${totalWithoutTaxes}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex items-center">
                <span className="text-sm font-medium text-secondary w-48">Total con Impuestos</span>
                <span className="text-sm text-gray-700">${totalWithTaxes}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-secondary w-48">Total a Pagar</span>
                <span className="text-sm text-gray-700">${amountPayable}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}