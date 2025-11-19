"use client";
import { useFormContext, useFieldArray } from "react-hook-form";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useState } from "react";
import { ConfirmModal } from "@/app/components/shared/SuccessErrorModal";

export default function Step4Increments() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "increments",
  });

  const [selectedRows, setSelectedRows] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Datos temporales para los selects - deberían venir de servicios
  const incrementNameOptions = [
    { id: 1, name: "Bonificación" },
    { id: 2, name: "Prima" },
    { id: 3, name: "Comisión" },
    { id: 4, name: "Auxilio de transporte" },
    { id: 5, name: "Auxilio de alimentación" },
  ];

  const incrementTypeOptions = [
    { id: 1, name: "Porcentual" },
    { id: 2, name: "Fijo" },
  ];

  const applicationOptions = [
    { id: 1, name: "Salario base" },
    { id: 2, name: "Salario total" },
    { id: 3, name: "Horas extras" },
  ];

  const handleAddIncrement = () => {
    append({
      name: "",
      type: "",
      amount: "",
      application: "",
      startDate: "",
      endDate: "",
      description: "",
      quantity: "1",
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
            disabled={selectedRows.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-theme-sm font-theme-medium rounded-lg transition-colors"
            style={{
              backgroundColor:
                selectedRows.length === 0
                  ? "var(--color-border)"
                  : "var(--color-error)",
              color: selectedRows.length === 0 ? "var(--color-text-secondary)" : "white",
              cursor: selectedRows.length === 0 ? "not-allowed" : "pointer",
            }}
            aria-label="Delete Selected Increments"
          >
            <FiTrash2 size={16} />
            Eliminar
          </button>
          <button
            type="button"
            onClick={handleAddIncrement}
            className="flex items-center gap-2 px-4 py-2 text-theme-sm font-theme-medium rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "white",
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
                className="w-4 h-4 cursor-pointer"
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
          {fields.length === 0 ? (
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
                    className="w-4 h-4 cursor-pointer"
                    style={{ accentColor: "var(--color-accent)" }}
                    aria-label={`Select increment ${index + 1}`}
                  />
                </div>

                {/* Name */}
                <div>
                  <select
                    {...register(`increments.${index}.name`, {
                      required: "Requerido",
                    })}
                    className={`input-theme w-full text-sm ${
                      errors.increments?.[index]?.name ? "border-red-500" : ""
                    }`}
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor: errors.increments?.[index]?.name
                        ? "#EF4444"
                        : "var(--color-border)",
                      color: "var(--color-text-primary)",
                      padding: "0.375rem 0.5rem",
                    }}
                  >
                    <option value="">Seleccionar</option>
                    {incrementNameOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div>
                  <select
                    {...register(`increments.${index}.type`, {
                      required: "Requerido",
                    })}
                    className={`input-theme w-full text-sm ${
                      errors.increments?.[index]?.type ? "border-red-500" : ""
                    }`}
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor: errors.increments?.[index]?.type
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
                </div>

                {/* Amount */}
                <div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register(`increments.${index}.amount`, {
                      required: "Requerido",
                      min: { value: 0, message: "Debe ser >= 0" },
                    })}
                    className={`input-theme w-full text-sm ${
                      errors.increments?.[index]?.amount ? "border-red-500" : ""
                    }`}
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
                </div>

                {/* Application */}
                <div>
                  <select
                    {...register(`increments.${index}.application`, {
                      required: "Requerido",
                    })}
                    className={`input-theme w-full text-sm ${
                      errors.increments?.[index]?.application ? "border-red-500" : ""
                    }`}
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor: errors.increments?.[index]?.application
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
                </div>

                {/* Start Date */}
                <div>
                  <input
                    type="date"
                    {...register(`increments.${index}.startDate`, {
                      required: "Requerido",
                    })}
                    className={`input-theme w-full text-sm ${
                      errors.increments?.[index]?.startDate ? "border-red-500" : ""
                    }`}
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor: errors.increments?.[index]?.startDate
                        ? "#EF4444"
                        : "var(--color-border)",
                      color: "var(--color-text-primary)",
                      padding: "0.375rem 0.5rem",
                    }}
                  />
                </div>

                {/* End Date */}
                <div>
                  <input
                    type="date"
                    {...register(`increments.${index}.endDate`, {
                      required: "Requerido",
                    })}
                    className={`input-theme w-full text-sm ${
                      errors.increments?.[index]?.endDate ? "border-red-500" : ""
                    }`}
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor: errors.increments?.[index]?.endDate
                        ? "#EF4444"
                        : "var(--color-border)",
                      color: "var(--color-text-primary)",
                      padding: "0.375rem 0.5rem",
                    }}
                  />
                </div>

                {/* Description */}
                <div>
                  <input
                    type="text"
                    {...register(`increments.${index}.description`)}
                    className="input-theme w-full text-sm"
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-primary)",
                      padding: "0.375rem 0.5rem",
                    }}
                    placeholder="Descripción"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <input
                    type="number"
                    min="1"
                    {...register(`increments.${index}.quantity`, {
                      required: "Requerido",
                      min: { value: 1, message: "Debe ser >= 1" },
                    })}
                    className={`input-theme w-full text-sm ${
                      errors.increments?.[index]?.quantity ? "border-red-500" : ""
                    }`}
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor: errors.increments?.[index]?.quantity
                        ? "#EF4444"
                        : "var(--color-border)",
                      color: "var(--color-text-primary)",
                      padding: "0.375rem 0.5rem",
                    }}
                    placeholder="1"
                  />
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

