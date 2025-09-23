// Step2TrackerData.jsx
import { useFormContext } from "react-hook-form";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export default function Step2TrackerData() {
  const { register, formState: { errors }, trigger } = useFormContext();
  const [checking, setChecking] = useState(false);
  const { getCurrentTheme } = useTheme();

  // Validación asíncrona contra la BD simulando un endpoint
  const validateDuplicate = async (field, value) => {
    if (!value) return true;
    try {
      setChecking(true);
      const res = await fetch(`/api/check-serial?field=${field}&value=${value}`);
      const data = await res.json();
      return data.exists ? `El ${field} ya está registrado en la base de datos` : true;
    } catch (error) {
      return "Error al validar en la base de datos";
    } finally {
      setChecking(false);
    }
  };

  return (
    <div id="step-2-tracker-data">
      <h3 className="text-lg md:text-xl font-semibold mb-4 text-primary">Ficha de Tracker</h3>

       {/* Grid responsive de 2 columnas */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6">
        {/* Columna izquierda */}
        <div className="space-y-4">
          {/* Número de serie del terminal */}
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
                },
                validate: (value) => validateDuplicate("número de serie del terminal", value)
              })}
              onBlur={() => trigger("terminalSerial")}
              placeholder="Ingrese el número de serie del terminal"
              className="parametrization-input"
            />
            {errors.terminalSerial && (
              <span className="text-red-500 text-xs mt-1">
                {errors.terminalSerial.message}
              </span>
            )}
          </div>

          {/* Número de serie del dispositivo GPS */}
          <div>
            <label className="block text-sm text-secondary mb-1">
              Número de serie del dispositivo GPS
            </label>
            <input
              {...register("gpsSerial", {
                minLength: {
                  value: 3,
                  message: "Debe tener al menos 3 caracteres"
                },
                validate: (value) => validateDuplicate("número de serie del dispositivo GPS", value)
              })}
              onBlur={() => trigger("gpsSerial")}
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

        {/* Columna derecha */}
        <div className="space-y-4">
          {/* Número de chasis */}
          <div>
            <label className="block text-sm text-secondary mb-1">
              Número de chasis
            </label>
            <input
              {...register("chasisNumber", {
                minLength: {
                  value: 3,
                  message: "Debe tener al menos 3 caracteres"
                },
                validate: (value) => validateDuplicate("número de chasis", value)
              })}
              onBlur={() => trigger("chasisNumber")}
              placeholder="Ingrese el número de chasis"
              className="parametrization-input"
            />
            {errors.chasisNumber && (
              <span className="text-red-500 text-xs mt-1">
                {errors.chasisNumber.message}
              </span>
            )}
          </div>

          {/* Número de motor */}
          <div>
            <label className="block text-sm text-secondary mb-1">
              Número de motor
            </label>
            <input
              {...register("engineNumber", {
                minLength: {
                  value: 3,
                  message: "Debe tener al menos 3 caracteres"
                },
                validate: (value) => validateDuplicate("número de motor", value)
              })}
              onBlur={() => trigger("engineNumber")}
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

      {checking && (
        <p className="text-xs text-gray-500 mt-4">Validando datos en la base de datos...</p>
      )}
    </div>
  );
}
