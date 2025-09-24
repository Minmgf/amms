import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { registerPeriodicMaintenance, getPeriodicMaintenancesById, deletePeriodicMaintenance } from "@/services/machineryService";
import { SuccessModal, ErrorModal } from "../../shared/SuccessErrorModal";

export default function Step5Maintenance({ machineryId, maintenanceTypeList = [] }) {
  const {
    register,
    formState: { errors },
    getValues,
    trigger,
    resetField,
  } = useFormContext();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  //Cargar mantenimientos cuando tengo el ID de la maquinaria
  const fetchMaintenances = async () => {
    try {
      if (!machineryId) return;
      const data = await getPeriodicMaintenancesById(machineryId);
      setItems(data);
    } catch (err) {
      console.error("Error al traer mantenimientos:", err);
    }
  };

  useEffect(() => {
    fetchMaintenances();
  }, [machineryId]);

  const handleAdd = async () => {
    const isValid = await trigger(["maintenance", "usageHours", "unit"]);
    if (!isValid) return;

    const maintenance = getValues("maintenance");
    const usageHours = getValues("usageHours");
    const unit = getValues("unit");

    let payload = {
      id_machinery: machineryId,
      id_maintenance: maintenance,
    };

    if (unit === "Horas") {
      payload.usage_hours = usageHours;
    } else if (unit === "Kilómetros") {
      payload.distance_km = usageHours;
    }

    try {
      setLoading(true);
      const response = await registerPeriodicMaintenance(payload);
      setModalMessage(response.message || "Mantenimiento registrado con éxito");
      setSuccessOpen(true);
      await fetchMaintenances();
      resetField("maintenance");
      resetField("usageHours");
      resetField("unit");
    } catch (error) {
      const data = error?.response?.data;
      setModalMessage(
        data?.errors?.non_field_errors?.[0] ||
          data?.message ||
          "No se pudo registrar el mantenimiento"
      );
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  //Eliminar mantenimiento
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await deletePeriodicMaintenance(id);
      setModalMessage(response.message || "Mantenimiento eliminado con éxito");
      setSuccessOpen(true);
      await fetchMaintenances(); // refresca la lista y devuelve el mantenimiento al select
    } catch (error) {
      const data = error?.response?.data;
      setModalMessage(
        data?.message || "No se pudo eliminar el mantenimiento"
      );
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  //Filtrar tipos de mantenimiento ya registrados
  const registeredIds = items.map((item) => item.id_maintenance);
  const availableMaintenanceTypes = maintenanceTypeList.filter(
    (maintenanceType) => !registeredIds.includes(maintenanceType.id_maintenance)
  );

  return (
    <>
      <div id="step-5-maintenance">
        <h3 className="text-theme-lg font-theme-semibold mb-theme-md text-primary">
          Mantenimiento Periódico
        </h3>

        <div className="grid grid-cols-3 gap-6 mb-4">
          {/* Maintenance */}
          <div>
            <label className="block text-theme-sm text-secondary mb-1">
              Mantenimiento
            </label>
            <select
              {...register("maintenance", {
                required: "Debe seleccionar un tipo de mantenimiento",
              })}
              className="parametrization-input"
            >
              <option value="">Seleccione un tipo de mantenimiento</option>
              {availableMaintenanceTypes.map((maintenanceType) => (
                <option
                  key={maintenanceType.id_maintenance}
                  value={maintenanceType.id_maintenance}
                >
                  {maintenanceType.name}
                </option>
              ))}
            </select>
            {errors.maintenance && (
              <span className="text-theme-xs mt-1 block text-red-500">
                {errors.maintenance.message}
              </span>
            )}
          </div>

          {/* Usage Value */}
          <div>
            <label className="block text-theme-sm text-secondary mb-1">
              Horas de Uso o Kilómetros
            </label>
            <input
              type="number"
              placeholder="Digite el valor"
              {...register("usageHours", {
                required: "Este campo es requerido",
              })}
              className="parametrization-input"
            />
            {errors.usageHours && (
              <span className="text-theme-xs mt-1 block text-red-500">
                {errors.usageHours.message}
              </span>
            )}
          </div>

          {/* Unit Select */}
          <div>
            <label className="block text-theme-sm text-secondary mb-1">
              Unidad
            </label>
            <select
              {...register("unit", {
                required: "Debe seleccionar una unidad",
              })}
              className="parametrization-input"
            >
              <option value="">Seleccione unidad</option>
              <option value="Horas">Horas</option>
              <option value="Kilómetros">Kilómetros</option>
            </select>
            {errors.unit && (
              <span className="text-theme-xs mt-1 block text-red-500">
                {errors.unit.message}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={loading}
          className="btn-theme btn-secondary text-theme-sm px-theme-md py-theme-sm rounded-theme-md transition-all duration-200 hover:shadow-md"
          style={{
            backgroundColor: "var(--color-secondary)",
            color: "white",
            border: "none",
          }}
        >
          {loading ? "Guardando..." : "Añadir"}
        </button>

        <div className="mt-4 space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-theme-sm rounded-theme-md border"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface)",
              }}
            >
              <span className="font-theme text-secondary">
                {item.maintenance_name} –{" "}
                {item.usage_hours || item.distance_km}{" "}
                {item.usage_hours ? "Horas" : "Km"}
              </span>
              <button
                type="button"
                aria-label="Delete Button"
                onClick={() => handleDelete(item.id_periodic_maintenance_scheduling)}
                className="btn-theme btn-error text-theme-sm px-theme-md py-theme-sm rounded-theme-md transition-all duration-200 hover:shadow-md"
                style={{
                  backgroundColor: "var(--color-error)",
                  color: "white",
                  border: "none",
                }}
              >
                Borrar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modales */}
      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Éxito"
        message={modalMessage}
      />
      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Error"
        message={modalMessage}
      />
    </>
  );
}
