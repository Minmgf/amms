import { useFormContext } from "react-hook-form";

export default function Step5Maintenance() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div>
      <h3 className="font-semibold mb-4">Paso 5: Mantenimiento</h3>
      <label>Última Fecha de Mantenimiento</label>
      <input
        type="date"
        {...register("maintenanceDate", { required: "La fecha es obligatoria" })}
        className="w-full border rounded p-2"
      />
      <p className="text-red-500 text-sm">{errors.maintenanceDate?.message}</p>
    </div>
  );
}
