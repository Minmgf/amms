"use client";
import { useFormContext, useFieldArray } from "react-hook-form";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useState, useEffect } from "react";
import { ConfirmModal } from "@/app/components/shared/SuccessErrorModal";
import { getIncreaseTypes } from "@/services/contractService";

export default function Step4Increments({ isAddendum = false, modifiableFields = [] }) {
  const {
    register,
    control,
    formState: { errors },
    watch,
  } = useFormContext();

  const isDisabled = isAddendum && !modifiableFields.includes("changeIncrements");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "increments",
  });

  const [selectedRows, setSelectedRows] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [incrementNameOptions, setIncrementNameOptions] = useState([]);
  const [loadingIncrements, setLoadingIncrements] = useState(true);

  // Cargar tipos de incremento desde el servicio
  useEffect(() => {
    const fetchIncreaseTypes = async () => {
      try {
        setLoadingIncrements(true);
        const data = await getIncreaseTypes();
        console.log("Tipos de incremento cargados:", data);
        setIncrementNameOptions(data || []);
      } catch (error) {
        console.error("Error al cargar tipos de incremento:", error);
        setIncrementNameOptions([]);
      } finally {
        setLoadingIncrements(false);
      }
    };

    fetchIncreaseTypes();
  }, []);

  // Opciones de tipo de monto (según especificación del backend)
  const incrementTypeOptions = [
    { id: "Porcentaje", name: "Porcentaje" },
    { id: "fijo", name: "Fijo" },
  ];

  // Opciones de aplicación (según especificación del backend)
  const applicationOptions = [
    { id: "SalarioBase", name: "Salario Base" },
    { id: "SalarioFinal", name: "Salario Final" },
  ];

  const handleAddIncrement = () => {
    append({
      increase_type: "",
      amount_type: "",
      amount_value: "",
      application_increase_type: "",
      start_date_increase: "",
      end_date_increase: "",
      description: "",
      amount: "",
    });
  };

  const handleDeleteClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    const sortedIndexes = [...selectedRows].sort((a, b) => b - a);
    sortedIndexes.forEach((index) => remove(index));
    setSelectedRows([]);
    setShowConfirmModal(false);
  };

  const handleSelectRow = (index) => {
    setSelectedRows((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(fields.map((_, index) => index));
    } else {
      setSelectedRows([]);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header con botones */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg sm:text-theme-lg font-theme-semibold text-primary">
          Incrementos
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={selectedRows.length === 0 || isDisabled}
            className="flex items-center gap-2 px-4 py-2 text-theme-sm font-theme-medium rounded-lg transition-colors"
            style={{
              backgroundColor:
                selectedRows.length === 0 || isDisabled
                  ? "var(--color-border)"
                  : "var(--color-error)",
              color: selectedRows.length === 0 || isDisabled ? "var(--color-text-secondary)" : "white",
              cursor: selectedRows.length === 0 || isDisabled ? "not-allowed" : "pointer",
            }}
            aria-label="Delete Selected Increments"
          >
            <FiTrash2 size={16} />
            Eliminar
          </button>
          <button
            type="button"
            onClick={handleAddIncrement}
            disabled={isDisabled}
            className="flex items-center gap-2 px-4 py-2 text-theme-sm font-theme-medium rounded-lg transition-colors"
            style={{
              backgroundColor: isDisabled ? "var(--color-border)" : "var(--color-accent)",
              color: isDisabled ? "var(--color-text-secondary)" : "white",
              cursor: isDisabled ? "not-allowed" : "pointer",
            }}
            aria-label="Add Increment"
          >
            <FiPlus size={16} />
            Añadir incremento
          </button>
        </div>
      </div>

      {/* Tabla de incrementos */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Header de la tabla */}
          <div className="grid grid-cols-[40px_150px_150px_120px_150px_150px_150px_200px_100px] gap-2 mb-2 px-2">
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedRows.length === fields.length && fields.length > 0}
                disabled={isDisabled}
                className="w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                style={{ accentColor: "var(--color-accent)" }}
                aria-label="Select All"
              />
            </div>
            <div className="text-theme-sm font-theme-semibold text-primary">Nombre</div>
            <div className="text-theme-sm font-theme-semibold text-primary">Tipo</div>
            <div className="text-theme-sm font-theme-semibold text-primary">Monto</div>
            <div className="text-theme-sm font-theme-semibold text-primary">Aplicación</div>
            <div className="text-theme-sm font-theme-semibold text-primary">Inicio</div>
            <div className="text-theme-sm font-theme-semibold text-primary">Fin</div>
            <div className="text-theme-sm font-theme-semibold text-primary">Descripción</div>
            <div className="text-theme-sm font-theme-semibold text-primary">Cantidad</div>
          </div>

          {/* Filas de incrementos */}
          {loadingIncrements ? (
            <div className="text-center py-8 text-secondary">
              <p>Cargando tipos de incremento...</p>
            </div>
          ) : fields.length === 0 ? (
            <div className="text-center py-8 text-secondary">
              <p>No hay incrementos añadidos</p>
              <p className="text-sm mt-2">Haz clic en "Añadir incremento" para comenzar</p>
            </div>
          ) : (
            fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-[40px_150px_150px_120px_150px_150px_150px_200px_100px] gap-2 mb-2 px-2 py-2 rounded-lg"
                style={{
                  backgroundColor: selectedRows.includes(index)
                    ? "var(--color-surface-hover)"
                    : "var(--color-surface)",
                }}
              >
                {/* Checkbox */}
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(index)}
                    onChange={() => handleSelectRow(index)}
                    disabled={isDisabled}
                    className="w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                    style={{ accentColor: "var(--color-accent)" }}
                    aria-label={`Select increment ${index + 1}`}
                  />
                </div>

                {/* Name - increase_type */}
                <div>
                  <select
                    {...register(`increments.${index}.increase_type`, {
                      required: "Este campo es obligatorio.",
                    })}
                    className={`input-theme w-full text-sm ${errors.increments?.[index]?.increase_type ? "border-red-500" : ""
                      }`}
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor: errors.increments?.[index]?.increase_type
                        ? "#EF4444"
                        : "var(--color-border)",
                      color: "var(--color-text-primary)",
                      padding: "0.375rem 0.5rem",
                    }}
                    disabled={loadingIncrements || isDisabled}
                  >
                    <option value="">
                      {loadingIncrements ? "Cargando..." : "Seleccionar"}
                    </option>
                    {incrementNameOptions.map((option) => (
                      <option key={option.id_types} value={option.id_types}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  {errors.increments?.[index]?.increase_type && (
                    <p className="text-red-500 text-[10px] mt-1 leading-tight">
                      {errors.increments[index].increase_type.message}
                    </p>
                  )}
                </div>

                {/* Type - amount_type */}
                <div>
                  <select
                    {...register(`increments.${index}.amount_type`, {
                      required: "Este campo es obligatorio.",
                    })}
                    className={`input-theme w-full text-sm ${errors.increments?.[index]?.amount_type ? "border-red-500" : ""
                      }`}
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor: errors.increments?.[index]?.amount_type
                        ? "#EF4444"
                        : "var(--color-border)",
                      color: "var(--color-text-primary)",
                      padding: "0.375rem 0.5rem",
                    }}
                  >
                    <option value="">Seleccionar</option>
                    {incrementTypeOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  {errors.increments?.[index]?.amount_type && (
                    <p className="text-red-500 text-[10px] mt-1 leading-tight">
                      {errors.increments[index].amount_type.message}
                    </p>
                  )}
                </div>

                {/* Amount - amount_value */}
                <div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register(`increments.${index}.amount_value`, {
                      required: "Este campo es obligatorio.",
                      min: { value: 0, message: "El monto debe ser mayor que cero." },
                      validate: (value) => {
                        const type = watch(`increments.${index}.amount_type`);
                        if (type === "Porcentaje" && parseFloat(value) > 100) {
                          return "El porcentaje no puede ser mayor a 100%.";
                        }
                        return true;
                      }
                    })}
                    disabled={isDisabled}
                    className={`input-theme w-full text-sm ${errors.increments?.[index]?.amount_value ? "border-red-500" : ""
                      } ${isDisabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor: errors.increments?.[index]?.amount_value
                        ? "#EF4444"
                        : "var(--color-border)",
                      color: "var(--color-text-primary)",
                      padding: "0.375rem 0.5rem",
                    }}
                    placeholder="0.00"
                  />
                  {errors.increments?.[index]?.amount_value && (
                    <p className="text-red-500 text-[10px] mt-1 leading-tight">
                      {errors.increments[index].amount_value.message}
                    </p>
                  )}
                </div>

                {/* Application - application_increase_type */}
                <div>
                  <select
                    {...register(`increments.${index}.application_increase_type`, {
                      required: "Este campo es obligatorio.",
                    })}
                    className={`input-theme w-full text-sm ${errors.increments?.[index]?.application_increase_type ? "border-red-500" : ""
                      }`}
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor: errors.increments?.[index]?.application_increase_type
                        ? "#EF4444"
                        : "var(--color-border)",
                      color: "var(--color-text-primary)",
                      padding: "0.375rem 0.5rem",
                    }}
                  >
                    <option value="">Seleccionar</option>
                    {applicationOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  {errors.increments?.[index]?.application_increase_type && (
                    <p className="text-red-500 text-[10px] mt-1 leading-tight">
                      {errors.increments[index].application_increase_type.message}
                    </p>
                  )}
                </div>

                {/* Start Date - start_date_increase */}
                <div>
                  <input
                    type="date"
                    {...register(`increments.${index}.start_date_increase`, {
                      required: "Este campo es obligatorio.",
                      validate: (value) => {
                        const contractStart = watch("startDate");
                        const contractEnd = watch("endDate");
                        if (contractStart && value < contractStart) return "La fecha debe estar dentro del rango de vigencia del contrato.";
                        if (contractEnd && value > contractEnd) return "La fecha debe estar dentro del rango de vigencia del contrato.";
                        return true;
                      }
                    })}
                    disabled={isDisabled}
                    className={`input-theme w-full text-sm ${errors.increments?.[index]?.start_date_increase ? "border-red-500" : ""
                      } ${isDisabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor: errors.increments?.[index]?.start_date_increase
                        ? "#EF4444"
                        : "var(--color-border)",
                      color: "var(--color-text-primary)",
                      padding: "0.375rem 0.5rem",
                    }}
                  />
                  {errors.increments?.[index]?.start_date_increase && (
                    <p className="text-red-500 text-[10px] mt-1 leading-tight">
                      {errors.increments[index].start_date_increase.message}
                    </p>
                  )}
                </div>

                {/* End Date - end_date_increase */}
                <div>
                  <input
                    type="date"
                    {...register(`increments.${index}.end_date_increase`, {
                      required: "Este campo es obligatorio.",
                      validate: (value) => {
                        const start = watch(`increments.${index}.start_date_increase`);
                        const contractEnd = watch("endDate");
                        if (start && value <= start) return "La fecha de fin debe ser posterior a la fecha de inicio.";
                        if (contractEnd && value > contractEnd) return "La fecha debe estar dentro del rango de vigencia del contrato.";
                        return true;
                      }
                    })}
                    disabled={isDisabled}
                    className={`input-theme w-full text-sm ${errors.increments?.[index]?.end_date_increase ? "border-red-500" : ""
                      } ${isDisabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor: errors.increments?.[index]?.end_date_increase
                        ? "#EF4444"
                        : "var(--color-border)",
                      color: "var(--color-text-primary)",
                      padding: "0.375rem 0.5rem",
                    }}
                  />
                  {errors.increments?.[index]?.end_date_increase && (
                    <p className="text-red-500 text-[10px] mt-1 leading-tight">
                      {errors.increments[index].end_date_increase.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <input
                    type="text"
                    {...register(`increments.${index}.description`, {
                      maxLength: { value: 255, message: "La descripción excede el límite permitido." }
                    })}
                    disabled={isDisabled}
                    className={`input-theme w-full text-sm ${isDisabled ? "bg-gray-100 cursor-not-allowed" : ""} ${errors.increments?.[index]?.description ? "border-red-500" : ""
                      }`}
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor: errors.increments?.[index]?.description ? "#EF4444" : "var(--color-border)",
                      color: "var(--color-text-primary)",
                      padding: "0.375rem 0.5rem",
                    }}
                    placeholder="Descripción"
                  />
                  {errors.increments?.[index]?.description && (
                    <p className="text-red-500 text-[10px] mt-1 leading-tight">
                      {errors.increments[index].description.message}
                    </p>
                  )}
                </div>

                {/* Quantity - amount */}
                <div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register(`increments.${index}.amount`, {
                      min: { value: 0, message: "El monto debe ser mayor que cero." },
                    })}
                    disabled={isDisabled}
                    className={`input-theme w-full text-sm ${errors.increments?.[index]?.amount ? "border-red-500" : ""
                      } ${isDisabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor: errors.increments?.[index]?.amount
                        ? "#EF4444"
                        : "var(--color-border)",
                      color: "var(--color-text-primary)",
                      padding: "0.375rem 0.5rem",
                    }}
                    placeholder="0.00"
                  />
                  {errors.increments?.[index]?.amount && (
                    <p className="text-red-500 text-[10px] mt-1 leading-tight">
                      {errors.increments[index].amount.message}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mensaje de error general si hay errores en los incrementos */}
      {errors.increments && (
        <p className="text-red-500 text-sm mt-2">
          Por favor, completa todos los campos obligatorios en los incrementos
        </p>
      )}

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Acción"
        message={`¿Está seguro que desea eliminar ${selectedRows.length === 1 ? 'este incremento' : `estos ${selectedRows.length} incrementos`}?`}
        confirmText="Confirm"
        cancelText="Cancel"
        confirmColor="btn-primary"
        cancelColor="btn-error"
      />
    </div>
  );
}

