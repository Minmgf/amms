"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiX } from "react-icons/fi";
import { ConfirmModal } from "@/app/components/shared/SuccessErrorModal";

export default function GenerateAddendumModal({
  isOpen,
  onClose,
  onConfirm,
  contractData,
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      // General
      contractType: false,
      paymentFrequency: false,
      minimumHours: false,
      workday: false,
      endDate: false,
      paymentDay: false, // Payment day/date
      timePeriod: false, // Not sure what this maps to exactly, maybe effectiveFrom? Or just Start/End logic?
      workModality: false,
      
      // Terms
      baseSalary: false, // Hourly wage / Salary
      trialPeriod: false,
      effectiveFrom: false, // Since when can they be used
      maximumDisabilityDays: false,
      overtimePeriod: false,
      currency: false,
      vacationDays: false,
      vacationGrantFrequency: false, // frequency of grading additional vacation
      maximumOvertime: false,
      terminationNoticePeriod: false, // Notification of contract termination

      // Extras
      changeDeductions: false,
      changeIncrements: false,
    },
  });

  const onSubmit = (data) => {
    // Filter only selected fields
    const selectedFields = Object.keys(data).filter((key) => data[key]);
    
    if (selectedFields.length === 0) {
        // Logic to prevent submission if no fields selected is handled by disabling button usually, 
        // but requirement says "System must not allow...".
        return; 
    }

    onConfirm(selectedFields);
  };

  const hasSelectedFields = () => {
    const values = watch();
    return Object.values(values).some((val) => val === true);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ padding: "var(--spacing-sm)" }}>
      <div
        className="modal-theme"
        style={{
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <div className="p-theme-lg">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-theme-xl font-theme-bold text-primary">
              Generar Otro Sí
            </h2>
            <button
              onClick={handleClose}
              className="text-secondary hover:text-primary"
            >
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* General Section */}
              <div>
                <h3 className="text-theme-lg font-theme-semibold text-secondary mb-4 border-b border-border pb-2">
                  Generalidades
                </h3>
                <div className="space-y-3">
                  <CheckboxField label="Tipo de contrato" name="contractType" register={register} />
                  <CheckboxField label="Frecuencia de pago" name="paymentFrequency" register={register} />
                  <CheckboxField label="Horas mínimas" name="minimumHours" register={register} />
                  <CheckboxField label="Jornada laboral" name="workday" register={register} />
                  
                  <div className="pt-4"></div>
                  
                  <CheckboxField label="Fecha de finalización" name="endDate" register={register} />
                  <CheckboxField label="Día/Fecha de pago" name="paymentDay" register={register} />
                  <CheckboxField label="Periodo de tiempo" name="timePeriod" register={register} />
                  <CheckboxField label="Modalidad de trabajo" name="workModality" register={register} />

                  <div className="pt-6">
                     <CheckboxField label="Cambiar deducciones" name="changeDeductions" register={register} />
                     <CheckboxField label="Cambiar incrementos" name="changeIncrements" register={register} />
                  </div>
                </div>
              </div>

              {/* Terms Section */}
              <div>
                <h3 className="text-theme-lg font-theme-semibold text-secondary mb-4 border-b border-border pb-2">
                  Términos
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <CheckboxField label="Salario / Salario por hora" name="baseSalary" register={register} />
                    <CheckboxField label="Periodo de prueba" name="trialPeriod" register={register} />
                    <CheckboxField label="¿Desde cuándo se pueden usar?" name="effectiveFrom" register={register} />
                    <CheckboxField label="Días máximos de incapacidad" name="maximumDisabilityDays" register={register} />
                    <CheckboxField label="Periodo de horas extra" name="overtimePeriod" register={register} />
                    
                    <div className="pt-4"></div>

                    <CheckboxField label="Moneda" name="currency" register={register} />
                    <CheckboxField label="Días de vacaciones" name="vacationDays" register={register} />
                    <CheckboxField label="Frecuencia de vacaciones adicionales" name="vacationGrantFrequency" register={register} />
                    <CheckboxField label="Máximo de horas extra" name="maximumOvertime" register={register} />
                    <CheckboxField label="Notificación de terminación" name="terminationNoticePeriod" register={register} />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleClose}
                className="btn-theme btn-error"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!hasSelectedFields()}
                className="btn-theme btn-primary bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function CheckboxField({ label, name, register }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer hover:bg-hover p-1 rounded transition-colors">
      <label htmlFor={name} className="text-theme-sm text-primary cursor-pointer flex-grow">
        {label}
      </label>
      <input
        id={name}
        type="checkbox"
        {...register(name)}
        className="w-4 h-4 text-accent rounded border-gray-300 focus:ring-accent cursor-pointer"
      />
    </div>
  );
}

