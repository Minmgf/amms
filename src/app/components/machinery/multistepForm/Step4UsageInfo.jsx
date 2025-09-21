import { useFormContext } from "react-hook-form";

export default function Step4UsageInfo() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div>
      <h3 className="font-semibold mb-4">Paso 4: Información de Uso</h3>
      <label>Horas de Uso</label>
      <input
        type="number"
        {...register("hoursUsed", { required: "Las horas de uso son obligatorias" })}
        className="w-full border rounded p-2"
      />
      <p className="text-red-500 text-sm">{errors.hoursUsed?.message}</p>
    </div>
  );
}
