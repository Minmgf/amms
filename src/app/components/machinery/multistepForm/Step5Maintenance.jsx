import { useState } from "react";
import { useFormContext } from "react-hook-form";

export default function Step5Maintenance() {
  const {
    register,
    formState: { errors },
    getValues,
    trigger,
  } = useFormContext();

  const [items, setItems] = useState([]);

  const handleAdd = async () => {
    // Validación de los dos campos
    const isValid = await trigger(["maintenance", "usageHours"]);
    if (!isValid) return;

    const maintenance = getValues("maintenance");
    const usageHours = getValues("usageHours");

    setItems([...items, { maintenance, usageHours }]);
  };

  const handleDelete = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-black">
        Mantenimiento Periódico
      </h3>

      <div className="grid grid-cols-2 gap-6 mb-4">
        {/* Maintenance */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Mantenimiento</label>
          <select
            {...register("maintenance", {
              required: "Debe seleccionar un tipo de mantenimiento",
            })}
            className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccione un tipo de mantenimiento</option>
            <option value="Oil change">Cambio de Aceite</option>
            <option value="Filter replacement">Reemplazo de filtros</option>
            <option value="Hydraulic service">Servicio Hidraúlico</option>
            <option value="Inspection">Inspección</option>
          </select>
          {errors.maintenance && (
            <p className="text-red-500 text-sm mt-1">
              {errors.maintenance.message}
            </p>
          )}
        </div>

        {/* Usage Hours */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Horas de Uso</label>
          <input
            type="number"
            {...register("usageHours", {
              required: "Las horas de uso son requeridas",
              min: { value: 1, message: "Must be greater than 0" },
            })}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.usageHours && (
            <p className="text-red-500 text-sm mt-1">
              {errors.usageHours.message}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="px-4 py-1 bg-gray-200 text-gray-700 rounded"
      >
        Añadir
      </button>

      <div className="mt-4 space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span>
              {item.maintenance} – {item.usageHours} horas
            </span>
            <button
              type="button"
              onClick={() => handleDelete(index)}
              className="text-red-500"
            >
              Borrar
            </button>
          </div>
        ))}
      </div>

      {/* Guarda la lista completa en el form */}
      <input
        type="hidden"
        {...register("maintenanceItems")}
        value={JSON.stringify(items)}
      />
    </div>
  );
}
