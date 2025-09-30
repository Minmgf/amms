import { useFormContext } from "react-hook-form";
import { useTheme } from "@/contexts/ThemeContext";

export default function Step4UsageInfo({
  machineryId,
  distanceUnitsList = [],
  usageStatesList = [],
  tenureTypesList = [],
  isEditMode = false,
  currentStatusName = "",
}) {
  const { register, formState: { errors }, watch } = useFormContext();
  const { getCurrentTheme } = useTheme();

  // Watch para el valor del switch ownership
  const watchOwnership = watch("ownership");

  return (
    <div id="step-4-usage-info">
      <h3 className="text-theme-lg font-theme-semibold mb-theme-md text-primary">
        Información de uso
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Acquisition Date */}
        <div>
          <label
            className="block text-theme-sm text-secondary mb-1"
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
            className="block text-theme-sm text-secondary mb-1"
          >
            Estado de uso
          </label>
          <select
            aria-label="Usage State Select"
            {...register("usageState")}
            className="parametrization-input"
          >
            <option value="">Seleccione un estado...</option>
            {usageStatesList.map((usageState) => (
              <option key={usageState.id_statues} value={usageState.id_statues}>
                {usageState.name}
              </option>
            ))}
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
            className="block text-theme-sm text-secondary mb-1"
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
            className="block text-theme-sm text-secondary mb-1"
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
              <option value="">Seleccione una unidad...</option>
              {distanceUnitsList.map((mileageUnit) => (
                <option key={mileageUnit.id_units} value={mileageUnit.id_units}>
                  {mileageUnit.name} ({mileageUnit.symbol})
                </option>
              ))}
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
            className="block text-theme-sm text-secondary mb-1"
          >
            Tenencia
          </label>
          <select
            aria-label="Tenure Select"
            {...register("tenure")}
            className="parametrization-input"
          >
            <option value="">Seleccione una opción...</option>
            {tenureTypesList.map((tenure) => (
              <option key={tenure.id_types} value={tenure.id_types}>
                {tenure.name}
              </option>
            ))}
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

        {/* Ownership Switch */}
        <div className="lg:col-span-1">
          <label
            className="block text-theme-sm text-secondary mb-1"
          >
            Es propio
          </label>
          <div className="flex items-center mt-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                aria-label="Ownership Switch"
                type="checkbox"
                {...register("ownership")}
                className="sr-only peer"
              />
              <div
                className="relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                style={{
                  backgroundColor: watchOwnership ? 'var(--color-accent)' : 'var(--color-border)',
                }}
              />
            </label>
          </div>
          {errors.ownership && (
            <span
              className="text-theme-xs mt-1 block"
              style={{ color: 'var(--color-error)' }}
            >
              {errors.ownership.message}
            </span>
          )}
        </div>

        {/* Contract End Date */}
        <div className="sm:col-span-2 lg:col-span-2">
          <label
            className="block text-theme-sm text-secondary mb-1"
          >
            Fecha fin contrato
          </label>
          <input
            aria-label="Contract End Date Input"
            type="date"
            {...register("contractEndDate")}
            disabled={watchOwnership}
            className={`parametrization-input ${watchOwnership ? 'disabled:opacity-50 disabled:cursor-not-allowed' : ''}`}
          />
          {errors.contractEndDate && (
            <span
              className="text-theme-xs mt-1 block"
              style={{ color: 'var(--color-error)' }}
            >
              {errors.contractEndDate.message}
            </span>
          )}
        </div>
        {/* Mostrar solo si está en modo edición y el estado es activo */}
        {isEditMode && currentStatusName === "activa" && (
          <>            
            {/* Textarea de justificación */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-4">
              <label className="block text-theme-sm text-secondary mb-1">
                Justificación de cambio
              </label>
              <textarea
                aria-label="Justification Textarea"
                {...register("justificationUsageInfo")}
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