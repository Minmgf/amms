// Step2TrackerData.jsx
import { useFormContext } from "react-hook-form";
import { useTheme } from "@/contexts/ThemeContext";

export default function Step2TrackerData({
  isEditMode = false,
  currentStatusId = null,
}) {
  const { register, formState: { errors } } = useFormContext();
  const { getCurrentTheme } = useTheme();

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
                }
              })}
              aria-label="Terminal Serial Input"
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
                }
              })}
              aria-label="GPS Serial Input"
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
                }
              })}
              aria-label="Chasis Number Input"
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
                }
              })}
              aria-label="Engine Number Input"
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
        {/* Mostrar solo si está en modo edición y el estado es activo */}
          {isEditMode && currentStatusId !== 3 && (
            <>            
              {/* Textarea de justificación */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-4">
                <label className="block text-theme-sm text-secondary mb-1">
                  Justificación de cambio
                </label>
                <textarea
                  aria-label="Justification Textarea"
                  {...register("justificationTrackerInfo")}
                  className="parametrization-input"
                  rows={3}
                  placeholder="Describa la justificación del cambio..."
                />
                {errors.justification && (
                  <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
                    {errors.justification.message}
                  </span>
                )}
              </div>
            </>
          )}
      </div>
    </div>
  );
}
