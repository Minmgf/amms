import { useFormContext } from "react-hook-form";
import { useTheme } from "@/contexts/ThemeContext";

export default function Step4UsageInfo() {
  const { register, formState: { errors } } = useFormContext();
  const { getCurrentTheme } = useTheme();

  return (
    <div id="step-4-usage-info">
      <h3 className="text-theme-lg font-theme-semibold mb-theme-md text-primary">
        Información de uso
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Acquisition Date */}
        <div>
          <label 
            className="block text-theme-sm mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Fecha de adquisición
          </label>
          <input
            aria-label="Acquisition Date Input"
            type="date"
            {...register("acquisitionDate")}
            className="parametrization-input"
          />
          {errors.acquisitionDate && (
            <span 
              className="text-theme-xs mt-1 block" 
              style={{ color: 'var(--color-error)' }}
            >
              {errors.acquisitionDate.message}
            </span>
          )}
        </div>

        {/* Usage Status */}
        <div>
          <label 
            className="block text-theme-sm mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Estado de uso
          </label>
          <select
            aria-label="Usage Status Select"
            {...register("usageStatus")}
            className="parametrization-input"
          >
            <option value="">Seleccione estado...</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="maintenance">En mantenimiento</option>
            <option value="retired">Retirado</option>
            <option value="standby">En espera</option>
          </select>
          {errors.usageStatus && (
            <span 
              className="text-theme-xs mt-1 block" 
              style={{ color: 'var(--color-error)' }}
            >
              {errors.usageStatus.message}
            </span>
          )}
        </div>

        {/* Used Hours */}
        <div>
          <label 
            className="block text-theme-sm mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Horas de uso
          </label>
          <input
            aria-label="Used Hours Input"
            type="number"
            placeholder="Ingrese las horas"
            min="0"
            step="0.1"
            {...register("usedHours")}
            className="parametrization-input"
          />
          {errors.usedHours && (
            <span 
              className="text-theme-xs mt-1 block" 
              style={{ color: 'var(--color-error)' }}
            >
              {errors.usedHours.message}
            </span>
          )}
        </div>

        {/* Mileage */}
        <div>
          <label 
            className="block text-theme-sm mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Kilometraje
          </label>
          <div className="flex">
            <input
              aria-label="Mileage Input"
              type="number"
              placeholder="Valor"
              min="0"
              step="0.1"
              {...register("mileage")}
              className="parametrization-input"
            />
            <select
              aria-label="Mileage Unit Select"
              {...register("mileageUnit")}
              className="parametrization-input"
            >
              <option value="km">KM</option>
              <option value="miles">Millas</option>
              <option value="hours">Horas</option>
            </select>
          </div>
          {(errors.mileage || errors.mileageUnit) && (
            <span 
              className="text-theme-xs mt-1 block" 
              style={{ color: 'var(--color-error)' }}
            >
              {errors.mileage?.message || errors.mileageUnit?.message}
            </span>
          )}
        </div>

        {/* Tenure */}
        <div className="sm:col-span-2 lg:col-span-2">
          <label 
            className="block text-theme-sm mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Tenencia
          </label>
          <select
            aria-label="Tenure Select"
            {...register("tenure")}
            className="parametrization-input"
          >
            <option value="">Seleccione tenencia...</option>
            <option value="owned">Propio</option>
            <option value="leased">Arrendado</option>
            <option value="rented">Rentado</option>
            <option value="financed">Financiado</option>
            <option value="contract">Bajo contrato</option>
          </select>
          {errors.tenure && (
            <span 
              className="text-theme-xs mt-1 block" 
              style={{ color: 'var(--color-error)' }}
            >
              {errors.tenure.message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}