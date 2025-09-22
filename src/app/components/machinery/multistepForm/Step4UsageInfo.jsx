import { useFormContext } from "react-hook-form";

export default function Step4UsageInfo() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div id="step-4-usage-info">
      <h3 className="text-lg font-semibold mb-4 text-black">Información de uso</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Acquisition Date */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Fecha de adquisición</label>
          <input
            area-label="Acquisition Date Input"
            type="date"
            {...register("acquisitionDate")}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.acquisitionDate && (
            <span className="text-red-500 text-xs">{errors.acquisitionDate.message}</span>
          )}
        </div>

        {/* Usage Status */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Estado de uso</label>
          <select
            area-label="Usage Status Select"
            {...register("usageStatus")}
            className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccione estado...</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Under Maintenance</option>
            <option value="retired">Retired</option>
            <option value="standby">Standby</option>
          </select>
          {errors.usageStatus && (
            <span className="text-red-500 text-xs">{errors.usageStatus.message}</span>
          )}
        </div>

        {/* Used Hours */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Horas de uso</label>
          <input
            area-label="Used Hours Input"
            type="number"
            placeholder="Value"
            min="0"
            step="0.1"
            {...register("usedHours")}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.usedHours && (
            <span className="text-red-500 text-xs">{errors.usedHours.message}</span>
          )}
        </div>

        {/* Mileage */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Kilometraje</label>
          <div className="flex">
            <input
              area-label="Mileage Input"
              type="number"
              placeholder="Value"
              min="0"
              step="0.1"
              {...register("mileage")}
              className="flex-1 border border-gray-300 p-2 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              area-label="Mileage Unit Select"
              {...register("mileageUnit")}
              className="w-20 border-l-0 border border-gray-300 p-2 rounded-r bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="km">KM</option>
              <option value="miles">Miles</option>
              <option value="hours">Hours</option>
            </select>
          </div>
          {(errors.mileage || errors.mileageUnit) && (
            <span className="text-red-500 text-xs">
              {errors.mileage?.message || errors.mileageUnit?.message}
            </span>
          )}
        </div>

        {/* Tenure */}
        <div className="sm:col-span-2 lg:col-span-2">
          <label className="block text-sm text-gray-600 mb-1">Tenencia</label>
          <select
            area-label="Tenure Select"
            {...register("tenure")}
            className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select tenure...</option>
            <option value="owned">Owned</option>
            <option value="leased">Leased</option>
            <option value="rented">Rented</option>
            <option value="financed">Financed</option>
            <option value="contract">Under Contract</option>
          </select>
          {errors.tenure && (
            <span className="text-red-500 text-xs">{errors.tenure.message}</span>
          )}
        </div>
      </div>
    </div>
  );
}