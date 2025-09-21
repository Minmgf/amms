import { useFormContext } from "react-hook-form";

export default function Step1GeneralData() {
  const { register } = useFormContext();

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">General Data Sheet</h3>

      <div className="grid grid-cols-4 gap-4">
        <input {...register("name")} placeholder="Name" className="border p-2 rounded" />
        <input {...register("manufactureYear")} placeholder="Manufacture year" type="number" className="border p-2 rounded" />
        <input {...register("serialNumber")} placeholder="Serial number" className="border p-2 rounded" />
        <select {...register("machineryType")} className="border p-2 rounded">
          <option value="">Machinery type</option>
          <option value="tractor">Tractor</option>
          <option value="excavator">Excavator</option>
        </select>

        <input {...register("brand")} placeholder="Brand" className="border p-2 rounded" />
        <input {...register("model")} placeholder="Model" className="border p-2 rounded" />
        <input {...register("tariff")} placeholder="Tariff subheading" className="border p-2 rounded" />
        <select {...register("category")} className="border p-2 rounded">
          <option value="">Machinery category</option>
          <option value="heavy">Heavy</option>
          <option value="light">Light</option>
        </select>

        <input {...register("country")} placeholder="Country" className="border p-2 rounded" />
        <input {...register("region")} placeholder="Region" className="border p-2 rounded" />
        <input {...register("city")} placeholder="City" className="border p-2 rounded" />
        <select {...register("telemetry")} className="border p-2 rounded">
          <option value="">Telemetry</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      {/* File Upload */}
      <div className="mt-6">
        <label className="block mb-2">Photo</label>
        <div className="border-2 border-dashed rounded-lg p-6 text-center text-gray-500">
          <input type="file" {...register("photo")} className="hidden" id="photoUpload" />
          <label htmlFor="photoUpload" className="cursor-pointer">
            Upload a file or drag and drop
            <br />
            <span className="text-sm text-gray-400">PNG, JPG, GIF up to 10MB</span>
          </label>
        </div>
      </div>
    </div>
  );
}
