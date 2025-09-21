import { useFormContext } from "react-hook-form";

export default function Step5Maintenance() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-black">Periodic Maintenance</h3>
      <p className="text-gray-600 mb-6">Configure maintenance schedules and service information.</p>

      <div className="space-y-6">
        {/* Maintenance Schedule */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">Maintenance Schedule</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Last Service Date</label>
              <input
                type="date"
                {...register("lastServiceDate")}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.lastServiceDate && <span className="text-red-500 text-xs">{errors.lastServiceDate.message}</span>}
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Service Interval (Hours)</label>
              <input
                type="number"
                {...register("serviceInterval")}
                placeholder="250"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.serviceInterval && <span className="text-red-500 text-xs">{errors.serviceInterval.message}</span>}
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Next Service Due</label>
              <input
                type="date"
                {...register("nextServiceDate")}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.nextServiceDate && <span className="text-red-500 text-xs">{errors.nextServiceDate.message}</span>}
            </div>
          </div>
        </div>

        {/* Service Provider */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">Service Provider Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Service Company</label>
              <input
                {...register("serviceCompany")}
                placeholder="Company name"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.serviceCompany && <span className="text-red-500 text-xs">{errors.serviceCompany.message}</span>}
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Contact Person</label>
              <input
                {...register("contactPerson")}
                placeholder="Contact name"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.contactPerson && <span className="text-red-500 text-xs">{errors.contactPerson.message}</span>}
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
              <input
                {...register("servicePhone")}
                placeholder="+1 (555) 123-4567"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.servicePhone && <span className="text-red-500 text-xs">{errors.servicePhone.message}</span>}
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                type="email"
                {...register("serviceEmail")}
                placeholder="service@company.com"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.serviceEmail && <span className="text-red-500 text-xs">{errors.serviceEmail.message}</span>}
            </div>
          </div>
        </div>

        {/* Maintenance Types */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">Maintenance Requirements</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Oil Change Interval (Hours)</label>
              <input
                type="number"
                {...register("oilChangeInterval")}
                placeholder="100"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.oilChangeInterval && <span className="text-red-500 text-xs">{errors.oilChangeInterval.message}</span>}
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Filter Replacement Interval (Hours)</label>
              <input
                type="number"
                {...register("filterInterval")}
                placeholder="250"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.filterInterval && <span className="text-red-500 text-xs">{errors.filterInterval.message}</span>}
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Hydraulic Service Interval (Hours)</label>
              <input
                type="number"
                {...register("hydraulicInterval")}
                placeholder="500"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.hydraulicInterval && <span className="text-red-500 text-xs">{errors.hydraulicInterval.message}</span>}
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Annual Inspection Required</label>
              <select
                {...register("annualInspection")}
                className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select option</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              {errors.annualInspection && <span className="text-red-500 text-xs">{errors.annualInspection.message}</span>}
            </div>
          </div>
        </div>

        {/* Warranty Information */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">Warranty Information</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Warranty Status</label>
              <select
                {...register("warrantyStatus")}
                className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="extended">Extended</option>
              </select>
              {errors.warrantyStatus && <span className="text-red-500 text-xs">{errors.warrantyStatus.message}</span>}
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Warranty Expiry Date</label>
              <input
                type="date"
                {...register("warrantyExpiry")}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.warrantyExpiry && <span className="text-red-500 text-xs">{errors.warrantyExpiry.message}</span>}
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Warranty Provider</label>
              <input
                {...register("warrantyProvider")}
                placeholder="Manufacturer/Provider"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.warrantyProvider && <span className="text-red-500 text-xs">{errors.warrantyProvider.message}</span>}
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Maintenance Notes</label>
          <textarea
            {...register("maintenanceNotes")}
            rows={3}
            placeholder="Any special maintenance requirements, known issues, or additional information..."
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.maintenanceNotes && <span className="text-red-500 text-xs">{errors.maintenanceNotes.message}</span>}
        </div>
      </div>
    </div>
  );
}