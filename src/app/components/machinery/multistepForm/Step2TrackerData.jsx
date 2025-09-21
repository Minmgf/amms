import { useFormContext } from "react-hook-form";

export default function Step2TrackerData() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div>
      <h3 className="font-semibold mb-4">Paso 2: Datos del Tracker</h3>
      <label>ID del Tracker</label>
      <input
        {...register("trackerId", { required: "El ID del tracker es obligatorio" })}
        className="w-full border rounded p-2"
      />
      <p className="text-red-500 text-sm">{errors.trackerId?.message}</p>
    </div>
  );
}
