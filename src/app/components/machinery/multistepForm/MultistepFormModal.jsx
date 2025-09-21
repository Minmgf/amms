"use client";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Step1GeneralData from "./Step1GeneralData";

export default function MultiStepFormModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0);

  const methods = useForm({
    defaultValues: {
      name: "",
      manufactureYear: "",
      serialNumber: "",
      machineryType: "",
      brand: "",
      model: "",
      tariff: "",
      category: "",
      country: "",
      region: "",
      city: "",
      telemetry: "",
      photo: null,
    },
  });

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const onSubmit = (data) => {
    console.log("Final Data:", data);
    alert("Formulario enviado!");
    onClose(); // cerrar modal después de enviar
  };

  if (!isOpen) return null; // 👈 si está cerrado, no renderiza nada

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="w-[900px] bg-white rounded-lg shadow-lg p-6"
      >
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Add Machinery</h2>
          <button type="button"  onClick={() => onClose()}className="text-gray-500 hover:text-black">✕</button>
        </div>

        {/* Barra de pasos */}
        <div className="flex justify-between items-center mb-8">
          {["General Data Sheet", "Tracker Data Sheet", "Specific Data Sheet", "Usage Information", "Periodic Maintenance", "Upload Documentation"].map(
            (label, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                    step === i
                      ? "bg-red-500 text-white"
                      : step > i
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-sm ${
                    step === i ? "text-red-500 font-medium" : "text-gray-600"
                  }`}
                >
                  {label}
                </span>
              </div>
            )
          )}
        </div>

        {/* Paso actual */}
        {step === 0 && <Step1GeneralData />}

        {/* Navegación */}
        <div className="flex justify-end mt-6">
          {step < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2 bg-black text-white rounded"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded"
            >
              Save
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
