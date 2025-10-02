import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import {
  registerPeriodicMaintenance,
  getPeriodicMaintenancesById,
  deletePeriodicMaintenance,
  updatePeriodicMaintenance,
} from "@/services/machineryService";
import { SuccessModal, ErrorModal } from "../../shared/SuccessErrorModal";

export default function Step5Maintenance({
  machineryId,
  maintenanceTypeList = [],
  isEditMode = false,
  currentStatusId = null,
}) {
  const {
    register,
    setValue,
    formState: { errors },
    getValues,
    trigger,
    resetField,
    clearErrors,
  } = useFormContext();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [editId, setEditId] = useState(null);
  const [editJustification, setEditJustification] = useState("");

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
    // Limpiar edición al cambiar maquinaria
    setEditId(null);
    setEditJustification("");
    resetField("maintenance");
    resetField("usageHours");
    resetField("unit");
    clearErrors();
  }, [machineryId]);

  // Filtrar tipos de mantenimiento ya registrados (excepto si estamos editando uno)
  const registeredIds = items.map((item) => item.id_maintenance);
  const availableMaintenanceTypes = (maintenanceTypeList || []).filter(
    (maintenanceType) =>
      !registeredIds.includes(maintenanceType.id_maintenance) ||
      (editId &&
        maintenanceType.id_maintenance ===
          items.find((i) => i.id_periodic_maintenance_scheduling === editId)
            ?.id_maintenance)
  );

  // Cuando se da click en editar, cargar datos al formulario
  const handleEdit = (item) => {
    setEditId(item.id_periodic_maintenance_scheduling);
    setValue("maintenance", Number(item.id_maintenance));
    setValue("usageHours", item.usage_hours || item.distance_km);
    setValue("unit", item.usage_hours ? "Horas" : "Kilómetros");
    setEditJustification("");
    clearErrors();
  };

  useEffect(() => {
    if (editId) {
      const item = items.find(
        (i) => i.id_periodic_maintenance_scheduling === editId
      );
      if (item) {
        setValue("maintenance", Number(item.id_maintenance), {
          shouldValidate: true,
        });
      }
    }
  }, [editId, items, setValue]);

  // Añadir o actualizar mantenimiento
  const handleAddOrUpdate = async () => {
    const isValid = await trigger([
      "maintenance",
      "usageHours",
      "unit",
      ...(editId ? ["justification"] : []),
    ]);
    if (!isValid) return;

    const maintenance = getValues("maintenance");
    const usageHours = getValues("usageHours");
    const unit = getValues("unit");
    const justification = getValues("justification");

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
      let response;
      if (editId) {
        // Actualizar mantenimiento
        payload.justification = justification; // <-- Agrega la justificación al payload
        response = await updatePeriodicMaintenance(editId, payload);
        setModalMessage(response.message || "Mantenimiento actualizado con éxito");
      } else {
        // Registrar mantenimiento
        response = await registerPeriodicMaintenance(payload);
        setModalMessage(response.message || "Mantenimiento registrado con éxito");
      }
      setSuccessOpen(true);
      await fetchMaintenances();
      setEditId(null);
      resetField("maintenance");
      resetField("usageHours");
      resetField("unit");
      resetField("justification");
    } catch (error) {
      const data = error?.response?.data;
      setModalMessage(
        data?.errors?.non_field_errors?.[0] ||
          data?.message ||
          "No se pudo registrar/actualizar el mantenimiento"
      );
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar mantenimiento
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await deletePeriodicMaintenance(id);
      setModalMessage(response.message || "Mantenimiento eliminado con éxito");
      setSuccessOpen(true);
      await fetchMaintenances();
    } catch (error) {
      const data = error?.response?.data;
      setModalMessage(data?.message || "No se pudo eliminar el mantenimiento");
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditId(null);
    setEditJustification("");
    resetField("maintenance");
    resetField("usageHours");
    resetField("unit");
    resetField("justification");
    clearErrors();
  };

  // Solo modo edición y estado activo
  const showEditButton = isEditMode && currentStatusId !== 3;

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
              aria-label="Maintenance Select"
              className="parametrization-input"
              disabled={loading}
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
              aria-label="Usage Hours Select"
              className="parametrization-input"
              disabled={loading}
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
              aria-label="Unit Select"
              className="parametrization-input"
              disabled={loading}
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

        {/* Justificación solo en modo edición */}
        {editId && (
          <div className="mb-4">
            <label className="block text-theme-sm text-secondary mb-1">
              Justificación de la actualización
            </label>
            <textarea
              className="parametrization-input"
              placeholder="Explique por qué está actualizando este mantenimiento"
              rows={3}
              {...register("justification", {
                required: "Debe justificar la actualización",
              })}
              aria-label="Justification Textarea"
            />
            {errors.justification && (
              <span className="text-theme-xs mt-1 block text-red-500">
                {errors.justification.message}
              </span>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            aria-label={editId ? "Edit Maintenance" : "Add Maintenance"}
            onClick={handleAddOrUpdate}
            disabled={loading}
            className="btn-theme btn-secondary text-theme-sm px-theme-md py-theme-sm rounded-theme-md transition-all duration-200 hover:shadow-md"
          >
            {loading
              ? editId
                ? "Actualizando..."
                : "Guardando..."
              : editId
              ? "Actualizar"
              : "Añadir"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              aria-label="Cancel Edit Button"
              className="btn-theme btn-error text-theme-sm px-theme-md py-theme-sm rounded-theme-md transition-all duration-200 hover:shadow-md"
              style={{
                backgroundColor: "var(--color-error)",
                color: "white",
                border: "none",
              }}
              disabled={loading}
            >
              Cancelar
            </button>
          )}
        </div>

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
              {showEditButton ? (
                <button
                  type="button"
                  aria-label="Edit Maintenance Button"
                  onClick={() => handleEdit(item)}
                  className="btn-theme btn-primary text-theme-sm px-theme-md py-theme-sm rounded-theme-md transition-all duration-200 hover:shadow-md"
                  disabled={loading}
                >
                  Editar
                </button>
              ) : (
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
                  disabled={loading}
                >
                  Borrar
                </button>
              )}
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
