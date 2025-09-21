import { useFormContext } from "react-hook-form";

export default function Step2TrackerData() {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-black">Tracker Data Sheet</h3>
      <p className="text-gray-600 mb-6">Configure tracking and monitoring settings for this machinery.</p>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Tracker ID</label>
          <input
            {...register("trackerId")}
            placeholder="Enter tracker ID"
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.trackerId && <span className="text-red-500 text-xs">{errors.trackerId.message}</span>}
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">GPS Provider</label>
          <select
            {...register("gpsProvider")}
            className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select provider</option>
            <option value="garmin">Garmin</option>
            <option value="tomtom">TomTom</option>
            <option value="trimble">Trimble</option>
            <option value="gps-insight">GPS Insight</option>
          </select>
          {errors.gpsProvider && <span className="text-red-500 text-xs">{errors.gpsProvider.message}</span>}
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Update Frequency</label>
          <select
            {...register("updateFrequency")}
            className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select frequency</option>
            <option value="real-time">Real-time</option>
            <option value="5min">Every 5 minutes</option>
            <option value="15min">Every 15 minutes</option>
            <option value="30min">Every 30 minutes</option>
            <option value="1hour">Every hour</option>
          </select>
          {errors.updateFrequency && <span className="text-red-500 text-xs">{errors.updateFrequency.message}</span>}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Installation Date</label>
          <input
            type="date"
            {...register("installationDate")}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.installationDate && <span className="text-red-500 text-xs">{errors.installationDate.message}</span>}
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Technician</label>
          <input
            {...register("technician")}
            placeholder="Technician name"
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.technician && <span className="text-red-500 text-xs">{errors.technician.message}</span>}
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Status</label>
          <select
            {...register("trackerStatus")}
            className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Under Maintenance</option>
            <option value="testing">Testing</option>
          </select>
          {errors.trackerStatus && <span className="text-red-500 text-xs">{errors.trackerStatus.message}</span>}
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm text-gray-600 mb-1">Additional Notes</label>
        <textarea
          {...register("trackerNotes")}
          rows={3}
          placeholder="Any additional information about the tracker setup..."
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.trackerNotes && <span className="text-red-500 text-xs">{errors.trackerNotes.message}</span>}
      </div>
    </div>
  );
}