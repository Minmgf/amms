import { useFormContext } from "react-hook-form";

export default function Step1GeneralData() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-black">General Data Sheet</h3>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Name</label>
          <input 
            {...register("name")}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
          {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Manufacture year</label>
          <select 
            {...register("manufactureYear")}
            className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value=""></option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
          </select>
          {errors.manufactureYear && <span className="text-red-500 text-xs">{errors.manufactureYear.message}</span>}
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Serial number</label>
          <input 
            {...register("serialNumber")}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
          {errors.serialNumber && <span className="text-red-500 text-xs">{errors.serialNumber.message}</span>}
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Machinery type</label>
          <select 
            {...register("machineryType")}
            className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value=""></option>
            <option value="tractor">Tractor</option>
            <option value="excavator">Excavator</option>
            <option value="bulldozer">Bulldozer</option>
            <option value="crane">Crane</option>
          </select>
          {errors.machineryType && <span className="text-red-500 text-xs">{errors.machineryType.message}</span>}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Brand</label>
          <select 
            {...register("brand")}
            className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value=""></option>
            <option value="caterpillar">Caterpillar</option>
            <option value="john-deere">John Deere</option>
            <option value="komatsu">Komatsu</option>
            <option value="volvo">Volvo</option>
          </select>
          {errors.brand && <span className="text-red-500 text-xs">{errors.brand.message}</span>}
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Model</label>
          <select 
            {...register("model")}
            className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value=""></option>
            <option value="model1">Model 1</option>
            <option value="model2">Model 2</option>
            <option value="model3">Model 3</option>
          </select>
          {errors.model && <span className="text-red-500 text-xs">{errors.model.message}</span>}
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Tariff subheading</label>
          <input 
            {...register("tariff")}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
          {errors.tariff && <span className="text-red-500 text-xs">{errors.tariff.message}</span>}
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Machinery category</label>
          <select 
            {...register("category")}
            className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value=""></option>
            <option value="heavy">Heavy</option>
            <option value="light">Light</option>
            <option value="medium">Medium</option>
          </select>
          {errors.category && <span className="text-red-500 text-xs">{errors.category.message}</span>}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Country</label>
          <select 
            {...register("country")}
            className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value=""></option>
            <option value="usa">USA</option>
            <option value="canada">Canada</option>
            <option value="mexico">Mexico</option>
            <option value="germany">Germany</option>
          </select>
          {errors.country && <span className="text-red-500 text-xs">{errors.country.message}</span>}
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Region</label>
          <select 
            {...register("region")}
            className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value=""></option>
            <option value="north">North</option>
            <option value="south">South</option>
            <option value="east">East</option>
            <option value="west">West</option>
          </select>
          {errors.region && <span className="text-red-500 text-xs">{errors.region.message}</span>}
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">City</label>
          <select 
            {...register("city")}
            className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value=""></option>
            <option value="city1">City 1</option>
            <option value="city2">City 2</option>
            <option value="city3">City 3</option>
          </select>
          {errors.city && <span className="text-red-500 text-xs">{errors.city.message}</span>}
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Telemetry</label>
          <select 
            {...register("telemetry")}
            className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value=""></option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          {errors.telemetry && <span className="text-red-500 text-xs">{errors.telemetry.message}</span>}
        </div>
      </div>

      {/* File Upload */}
      <div className="mt-6">
        <label className="block text-sm text-gray-600 mb-2">Photo</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors">
          <input 
            type="file" 
            {...register("photo")}
            accept="image/*"
            className="hidden" 
            id="photoUpload" 
          />
          <label htmlFor="photoUpload" className="cursor-pointer flex flex-col items-center">
            <div className="mb-4">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                />
              </svg>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Upload a file or drag and drop</span>
              <br />
              <span className="text-sm text-gray-400">PNG, JPG, GIF up to 10MB</span>
            </div>
          </label>
        </div>
        {errors.photo && <span className="text-red-500 text-xs">{errors.photo.message}</span>}
      </div>
    </div>
  );
}