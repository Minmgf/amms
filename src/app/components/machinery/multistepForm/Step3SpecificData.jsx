import { useFormContext } from "react-hook-form";

export default function Step3SpecificData() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-black">Specific Data Sheet</h3>
      <p className="text-gray-600 mb-6">Enter technical specifications and performance data.</p>

      <div className="space-y-6">
        {/* Engine Specifications */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">Engine Specifications</h4>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Engine Power (HP)</label>
              <input
                type="number"
                {...register("enginePower")}
                placeholder="0"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.enginePower && <span className="text-red-500 text-xs">{errors.enginePower.message}</span>}
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Engine Type</label>
              <select
                {...register("engineType")}
                className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select type</option>
                <option value="diesel">Diesel</option>
                <option value="gasoline">Gasoline</option>
                <option value="hybrid">Hybrid</option>
                <option value="electric">Electric</option>
              </select>
              {errors.engineType && <span className="text-red-500 text-xs">{errors.engineType.message}</span>}
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fuel Capacity (L)</label>
              <input
                type="number"
                {...register("fuelCapacity")}
                placeholder="0"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.fuelCapacity && <span className="text-red-500 text-xs">{errors.fuelCapacity.message}</span>}
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Cylinders</label>
              <input
                type="number"
                {...register("cylinders")}
                placeholder="0"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.cylinders && <span className="text-red-500 text-xs">{errors.cylinders.message}</span>}
            </div>
          </div>
        </div>

        {/* Physical Dimensions */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">Physical Dimensions</h4>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Length (m)</label>
              <input
                type="number"
                step="0.1"
                {...register("length")}
                placeholder="0.0"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.length && <span className="text-red-500 text-xs">{errors.length.message}</span>}
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Width (m)</label>
              <input
                type="number"
                step="0.1"
                {...register("width")}
                placeholder="0.0"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.width && <span className="text-red-500 text-xs">{errors.width.message}</span>}
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Height (m)</label>
              <input
                type="number"
                step="0.1"
                {...register("height")}
                placeholder="0.0"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.height && <span className="text-red-500 text-xs">{errors.height.message}</span>}
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Weight (kg)</label>
              <input
                type="number"
                {...register("weight")}
                placeholder="0"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.weight && <span className="text-red-500 text-xs">{errors.weight.message}</span>}
            </div>
          </div>
        </div>

        {/* Performance Specifications */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">Performance Specifications</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Max Speed (km/h)</label>
              <input
                type="number"
                {...register("maxSpeed")}
                placeholder="0"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.maxSpeed && <span className="text-red-500 text-xs">{errors.maxSpeed.message}</span>}
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Lifting Capacity (kg)</label>
              <input
                type="number"
                {...register("liftingCapacity")}
                placeholder="0"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.liftingCapacity && <span className="text-red-500 text-xs">{errors.liftingCapacity.message}</span>}
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Operating Temperature (°C)</label>
              <input
                {...register("operatingTemp")}
                placeholder="e.g., -10 to 45"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.operatingTemp && <span className="text-red-500 text-xs">{errors.operatingTemp.message}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}