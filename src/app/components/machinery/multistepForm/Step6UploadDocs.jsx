import { useFormContext } from "react-hook-form";

export default function Step6UploadDocs() {
  const { register } = useFormContext();

  return (
    <div>
      <h3 className="font-semibold mb-4">Paso 6: Subir Documentos</h3>
      <input
        type="file"
        {...register("docs")}
        className="w-full border rounded p-2"
      />
    </div>
  );
}
