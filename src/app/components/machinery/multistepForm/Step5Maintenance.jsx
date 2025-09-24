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
    <div id="step-5-maintenance">
      <h3 className="text-theme-lg font-theme-semibold mb-theme-md text-primary">
        Mantenimiento Periódico
      </h3>

      <div className="grid grid-cols-2 gap-6 mb-4">
        {/* Maintenance */}
        <div>
          <label 
            className="block text-theme-sm text-secondary mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Mantenimiento
          </label>
          <select
            aria-label="Maintenance Type Select"
            {...register("maintenance", {
              required: "Debe seleccionar un tipo de mantenimiento",
            })}
            className="parametrization-input"
          >
            <option value="">Seleccione un tipo de mantenimiento</option>
            <option value="Oil change">Cambio de Aceite</option>
            <option value="Filter replacement">Reemplazo de filtros</option>
            <option value="Hydraulic service">Servicio Hidraúlico</option>
            <option value="Inspection">Inspección</option>
          </select>
          {errors.maintenance && (
            <span 
              className="text-theme-xs mt-1 block" 
              style={{ color: 'var(--color-error)' }}
            >
              {errors.maintenance.message}
            </span>
          )}
        </div>

        {/* Usage Hours */}
        <div>
          <label 
            className="block text-theme-sm text-secondary mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Horas de Uso
          </label>
          <input
            type="number"
            placeholder="Digite el número de horas de uso"
            aria-label="Usage Hours Input"
            {...register("usageHours", {
              required: "Las horas de uso son requeridas",
            })}
            className="parametrization-input"
          />
          {errors.usageHours && (
            <span 
              className="text-theme-xs mt-1 block" 
              style={{ color: 'var(--color-error)' }}
            >
              {errors.usageHours.message}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        aria-label="Add Button"
        onClick={handleAdd}
        className="btn-theme btn-secondary text-theme-sm px-theme-md py-theme-sm rounded-theme-md transition-all duration-200 hover:shadow-md"
        style={{
          backgroundColor: 'var(--color-secondary)',
          color: 'white',
          border: 'none'
        }}
      >
        Añadir
      </button>

      <div className="mt-4 space-y-2">
        {items.map((item, index) => (
          <div 
            key={index} 
            className="flex justify-between items-center p-theme-sm rounded-theme-md border"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)'
            }}
          >
            <span 
              className="font-theme text-secondary"
            >
              {item.maintenance} – {item.usageHours} horas
            </span>
            <button
              type="button"
              aria-label="Delete Button"
              onClick={() => handleDelete(index)}
              className="btn-theme btn-error text-theme-sm px-theme-md py-theme-sm rounded-theme-md transition-all duration-200 hover:shadow-md"
              style={{
                backgroundColor: 'var(--color-error)',
                color: 'white',
                border: 'none'
              }}
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