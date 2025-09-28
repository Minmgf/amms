// Step2TrackerData.jsx
import { useFormContext } from "react-hook-form";
import { useState, useImperativeHandle, forwardRef } from "react";
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

const Step2TrackerData = forwardRef((props, ref) => {
  const { register, formState: { errors } } = useFormContext();
  const { getCurrentTheme } = useTheme();
  const [submitError, setSubmitError] = useState("");

  // Función para manejar errores del paso 2
  const handleStep2Error = (error) => {
    setSubmitError('El número de serie del terminal ya está registrado. Por favor, ingrese un número diferente.');
    
    // Limpiar el error después de 8 segundos
    setTimeout(() => setSubmitError(''), 8000);
  };

  // Exponer la función para que pueda ser llamada desde el componente padre
  useImperativeHandle(ref, () => ({
    handleError: handleStep2Error,
    clearError: () => setSubmitError('')
  }));

  // También mantener el método global como fallback
  React.useEffect(() => {
    window.handleStep2Error = handleStep2Error;
    return () => {
      delete window.handleStep2Error;
    };
  }, []);

  return (
    <div id="step-2-tracker-data">
      <h3 className="text-lg md:text-xl font-semibold mb-4 text-primary">Ficha de Tracker</h3>

      {/* Mensaje de error del paso */}
      {submitError && (
        <div 
          className="mb-4 p-3 rounded-md border text-sm"
          style={{ 
            backgroundColor: 'var(--color-error-bg, #fef2f2)', 
            borderColor: 'var(--color-error, #dc2626)', 
            color: 'var(--color-error, #dc2626)' 
          }}
        >
          {submitError}
        </div>
      )}

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-secondary mb-1">
              Número de serie del terminal <span className="text-red-500">*</span>
            </label>
            <input
              {...register("terminalSerial", {
                required: "El número de serie del terminal es obligatorio",
                minLength: {
                  value: 3,
                  message: "Debe tener al menos 3 caracteres"
                }
              })}
              placeholder="Ingrese el número de serie del terminal"
              className="parametrization-input"
            />
            {errors.terminalSerial && (
              <span className="text-red-500 text-xs mt-1">
                {errors.terminalSerial.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1">
              Número de serie del dispositivo GPS
            </label>
            <input
              {...register("gpsSerial", {
                minLength: {
                  value: 3,
                  message: "Debe tener al menos 3 caracteres"
                }
              })}
              placeholder="Ingrese el número de serie del dispositivo GPS"
              className="parametrization-input"
            />
            {errors.gpsSerial && (
              <span className="text-red-500 text-xs mt-1">
                {errors.gpsSerial.message}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-secondary mb-1">
              Número de chasis
            </label>
            <input
              {...register("chasisNumber", {
                minLength: {
                  value: 3,
                  message: "Debe tener al menos 3 caracteres"
                }
              })}
              placeholder="Ingrese el número de chasis"
              className="parametrization-input"
            />
            {errors.chasisNumber && (
              <span className="text-red-500 text-xs mt-1">
                {errors.chasisNumber.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1">
              Número de motor
            </label>
            <input
              {...register("engineNumber", {
                minLength: {
                  value: 3,
                  message: "Debe tener al menos 3 caracteres"
                }
              })}
              placeholder="Ingrese el número de motor"
              className="parametrization-input"
            />
            {errors.engineNumber && (
              <span className="text-red-500 text-xs mt-1">
                {errors.engineNumber.message}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

Step2TrackerData.displayName = 'Step2TrackerData';

export default Step2TrackerData;
