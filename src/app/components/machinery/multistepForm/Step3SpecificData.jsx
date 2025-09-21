import { useFormContext } from "react-hook-form";

export default function Step3SpecificData() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div>
      <h3 className="font-semibold mb-4">Paso 3: Datos Específicos</h3>
      <label>Modelo</label>
      <input
        {...register("model", { required: "El modelo es obligatorio" })}
        className="w-full border rounded p-2"
      />
      <p className="text-red-500 text-sm">{errors.model?.message}</p>
    </div>
  );
}
