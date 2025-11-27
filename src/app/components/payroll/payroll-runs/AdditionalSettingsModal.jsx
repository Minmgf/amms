"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FiX } from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";
import {
  SuccessModal,
  ErrorModal,
  ConfirmModal,
} from "@/app/components/shared/SuccessErrorModal";
import { getTypesByCategory } from "@/services/parametrizationService";

// Datos mock de catálogos mientras se integran endpoints reales
const MOCK_AMOUNT_TYPES = [
  { id: "PERCENT", etiqueta: "Porcentual" },
  { id: "FIXED", etiqueta: "Fijo" },
];

const MOCK_APPLICATION_TYPES = [
  { id: "BASE", etiqueta: "Salario base" },
  { id: "FINAL", etiqueta: "Salario final" },
  { id: "HOUR", etiqueta: "Salario por hora" },
];

const createEmptyDeduction = () => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2),
  seleccionado: false,
  nombreId: "",
  tipoMonto: "",
  valorMonto: "",
  aplicacion: "",
  cantidad: "",
  descripcion: "",
  fechaInicio: "",
  fechaFin: "",
});

const createEmptyIncrement = () => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2),
  seleccionado: false,
  nombreId: "",
  tipoMonto: "",
  valorMonto: "",
  aplicacion: "",
  cantidad: "",
  descripcion: "",
  fechaInicio: "",
  fechaFin: "",
});

const isRowEmpty = (row) => {
  return (
    !row.nombreId &&
    !row.tipoMonto &&
    !row.valorMonto &&
    !row.aplicacion &&
    !row.cantidad &&
    !row.descripcion &&
    !row.fechaInicio &&
    !row.fechaFin
  );
};

const IndividualPayrollAdjustmentsModal = ({
  isOpen,
  onClose,
  onSave,
  initialAdjustments = { deductions: [], increments: [] },
  payrollStartDate,
  payrollEndDate,
  canManagePayroll = true,
}) => {
  useTheme();

  const [activeTab, setActiveTab] = useState("deductions");
  const [deductions, setDeductions] = useState([]);
  const [increments, setIncrements] = useState([]);
  const [deductionTypes, setDeductionTypes] = useState([]);
  const [incrementTypes, setIncrementTypes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [rowErrors, setRowErrors] = useState({
    deductions: {},
    increments: {},
    globalMessages: [],
  });

  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const parsedStartDate = useMemo(
    () => (payrollStartDate ? new Date(payrollStartDate) : null),
    [payrollStartDate]
  );

  const parsedEndDate = useMemo(
    () => (payrollEndDate ? new Date(payrollEndDate) : null),
    [payrollEndDate]
  );

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const [deductionsRes, incrementsRes] = await Promise.all([
          getTypesByCategory(18),
          getTypesByCategory(19),
        ]);
        if (deductionsRes.success) setDeductionTypes(deductionsRes.data);
        if (incrementsRes.success) setIncrementTypes(incrementsRes.data);
      } catch (error) {
        console.error("Error fetching types", error);
      }
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const initialDeductions =
      initialAdjustments?.deductions &&
      Array.isArray(initialAdjustments.deductions)
        ? initialAdjustments.deductions
        : [];

    const initialIncrements =
      initialAdjustments?.increments &&
      Array.isArray(initialAdjustments.increments)
        ? initialAdjustments.increments
        : [];

    setDeductions(
      initialDeductions.length > 0
        ? initialDeductions.map((item) => ({
            ...createEmptyDeduction(),
            ...item,
            seleccionado: false,
          }))
        : []
    );

    setIncrements(
      initialIncrements.length > 0
        ? initialIncrements.map((item) => ({
            ...createEmptyIncrement(),
            ...item,
            seleccionado: false,
          }))
        : []
    );

    setActiveTab("deductions");
    setRowErrors({ deductions: {}, increments: {}, globalMessages: [] });
    setLoading(false);
    setSuccessOpen(false);
    setErrorOpen(false);
    setSuccessMessage("");
    setErrorMessage("");
    setShowCancelConfirm(false);
  }, [isOpen]);

  const hasChanges = useMemo(() => {
    if (!isOpen) return false;

    const cleanInitialDeductions = (initialAdjustments?.deductions || []).filter(
      (item) => !isRowEmpty(item)
    );
    const cleanInitialIncrements = (initialAdjustments?.increments || []).filter(
      (item) => !isRowEmpty(item)
    );

    const cleanCurrentDeductions = deductions.filter((item) => !isRowEmpty(item));
    const cleanCurrentIncrements = increments.filter((item) => !isRowEmpty(item));

    const serialize = (arr) =>
      JSON.stringify(
        arr.map((item) => ({
          nombreId: item.nombreId,
          tipoMonto: item.tipoMonto,
          valorMonto: item.valorMonto,
          aplicacion: item.aplicacion,
          cantidad: item.cantidad,
          descripcion: item.descripcion,
          fechaInicio: item.fechaInicio,
          fechaFin: item.fechaFin,
        }))
      );

    return (
      serialize(cleanInitialDeductions) !== serialize(cleanCurrentDeductions) ||
      serialize(cleanInitialIncrements) !== serialize(cleanCurrentIncrements)
    );
  }, [isOpen, deductions, increments, initialAdjustments]);

  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelConfirm(true);
      return;
    }
    onClose?.();
  };

  const handleNextStep = () => {
    if (activeTab === "deductions") {
      setActiveTab("increments");
    }
  };

  const handlePreviousStep = () => {
    if (activeTab === "increments") {
      setActiveTab("deductions");
    }
  };

  const handleAddDeduction = () => {
    setDeductions((prev) => [...prev, createEmptyDeduction()]);
  };

  const handleAddIncrement = () => {
    setIncrements((prev) => [...prev, createEmptyIncrement()]);
  };

  const handleDeductionChange = (id, field, value) => {
    setDeductions((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const toggleAllDeductionsSelected = () => {
    setDeductions((prev) => {
      if (prev.length === 0) return prev;
      const allSelected = prev.every((item) => item.seleccionado);
      return prev.map((item) => ({ ...item, seleccionado: !allSelected }));
    });
  };

  const toggleAllIncrementsSelected = () => {
    setIncrements((prev) => {
      if (prev.length === 0) return prev;
      const allSelected = prev.every((item) => item.seleccionado);
      return prev.map((item) => ({ ...item, seleccionado: !allSelected }));
    });
  };

  const handleIncrementChange = (id, field, value) => {
    setIncrements((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const toggleDeductionSelected = (id) => {
    setDeductions((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              seleccionado: !item.seleccionado,
            }
          : item
      )
    );
  };

  const toggleIncrementSelected = (id) => {
    setIncrements((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              seleccionado: !item.seleccionado,
            }
          : item
      )
    );
  };

  const removeSelectedDeductions = () => {
    setDeductions((prev) => prev.filter((item) => !item.seleccionado));
  };

  const removeSelectedIncrements = () => {
    setIncrements((prev) => prev.filter((item) => !item.seleccionado));
  };

  const validateCollection = (items, kind) => {
    const rowErrorMap = {};
    const duplicateKeyCount = {};

    items.forEach((row) => {
      if (isRowEmpty(row)) {
        return;
      }

      const mensajes = [];

      if (!row.nombreId) {
        mensajes.push("Debe seleccionar un nombre.");
      }

      if (!row.tipoMonto) {
        mensajes.push("Debe seleccionar el tipo de monto.");
      }

      const valor = parseFloat(String(row.valorMonto).replace(",", "."));
      if (isNaN(valor) || valor <= 0) {
        mensajes.push("El valor del monto debe ser un número positivo.");
      }

      if (row.tipoMonto === "PERCENT" && valor > 100) {
        mensajes.push("El valor porcentual no puede superar el 100%.");
      }

      if (!row.aplicacion) {
        mensajes.push("Debe seleccionar la forma de aplicación del monto.");
      }

      const cantidad = parseFloat(String(row.cantidad).replace(",", "."));
      if (isNaN(cantidad) || cantidad <= 0) {
        mensajes.push("La cantidad debe ser un número positivo.");
      }

      if (row.descripcion && row.descripcion.length > 255) {
        mensajes.push("La descripción no puede superar los 255 caracteres.");
      }

      if (row.fechaInicio && parsedStartDate && parsedEndDate) {
        const fechaInicio = new Date(row.fechaInicio);
        if (fechaInicio < parsedStartDate || fechaInicio > parsedEndDate) {
          mensajes.push(
            "La fecha de inicio debe estar dentro del rango de fechas de la nómina."
          );
        }
      }

      if (row.fechaFin && parsedStartDate && parsedEndDate) {
        const fechaFin = new Date(row.fechaFin);
        if (fechaFin < parsedStartDate || fechaFin > parsedEndDate) {
          mensajes.push(
            "La fecha de fin debe estar dentro del rango de fechas de la nómina."
          );
        }
      }

      if (row.fechaInicio && row.fechaFin) {
        const fechaInicio = new Date(row.fechaInicio);
        const fechaFin = new Date(row.fechaFin);
        if (fechaFin < fechaInicio) {
          mensajes.push("La fecha de fin no puede ser anterior a la fecha de inicio.");
        }
      }

      if (mensajes.length > 0) {
        rowErrorMap[row.id] = mensajes.join(" ");
      }

      if (row.nombreId && row.aplicacion) {
        const key = `${row.nombreId}__${row.aplicacion}`;
        duplicateKeyCount[key] = (duplicateKeyCount[key] || 0) + 1;
      }
    });

    const hasDuplicates = Object.values(duplicateKeyCount).some(
      (count) => count > 1
    );

    return {
      rowErrorMap,
      hasDuplicates,
    };
  };

  const validateAndSave = () => {
    const globalMessages = [];

    const {
      rowErrorMap: deductionErrors,
      hasDuplicates: hasDuplicateDeductions,
    } = validateCollection(deductions, "deductions");

    const {
      rowErrorMap: incrementErrors,
      hasDuplicates: hasDuplicateIncrements,
    } = validateCollection(increments, "increments");

    if (hasDuplicateDeductions) {
      globalMessages.push(
        "Hay deducciones adicionales duplicadas con el mismo nombre y aplicación."
      );
    }

    if (hasDuplicateIncrements) {
      globalMessages.push(
        "Hay incrementos adicionales duplicados con el mismo nombre y aplicación."
      );
    }

    const hasRowErrors =
      Object.keys(deductionErrors).length > 0 ||
      Object.keys(incrementErrors).length > 0;

    if (hasRowErrors || globalMessages.length > 0) {
      setRowErrors({
        deductions: deductionErrors,
        increments: incrementErrors,
        globalMessages,
      });
      setErrorMessage(
        globalMessages.length > 0
          ? globalMessages.join(" ")
          : "Por favor, revise los campos marcados en rojo antes de continuar."
      );
      setErrorOpen(true);
      return false;
    }

    setRowErrors({ deductions: {}, increments: {}, globalMessages: [] });
    return true;
  };

  const handleSave = () => {
    if (!validateAndSave()) return;

    setLoading(true);

    const ajustes = {
      deductions: deductions.filter((item) => !isRowEmpty(item)),
      increments: increments.filter((item) => !isRowEmpty(item)),
    };

    if (onSave) {
      onSave(ajustes);
    }

    setSuccessMessage("Ajustes adicionales guardados correctamente.");
    setSuccessOpen(true);
    setLoading(false);
  };

  if (!isOpen) return null;

  if (!canManagePayroll) {
    return (
      <ErrorModal
        isOpen={true}
        onClose={onClose}
        title="Acceso restringido"
        message="No tiene permisos para gestionar ajustes adicionales de nómina."
        buttonText="Cerrar"
      />
    );
  }

  return (
    <>
      <div
        className="modal-overlay"
        style={{ padding: "var(--spacing-sm)", zIndex: 60 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleCancel();
          }
        }}
      >
        <div
          className="modal-theme"
          style={{
            width: "100%",
            minWidth: "280px",
            maxWidth: "min(95vw, 1400px)",
            maxHeight: "min(95vh, 900px)",
            overflowY: "auto",
            margin: "0 auto",
          }}
        >
          <div className="p-3 sm:p-6 md:p-8 lg:p-theme-xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 sm:mb-6 md:mb-8">
              <h2 className="text-lg sm:text-xl md:text-theme-xl font-theme-semibold text-primary">
                Ajustes adicionales de nómina
              </h2>
              <button
                type="button"
                onClick={handleCancel}
                className="text-secondary hover:text-primary cursor-pointer"
                aria-label="Cerrar modal de ajustes adicionales"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Paso / Tabs - reutilizando el estilo del wizard de contratos */}
              <AdjustmentsStepIndicator
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

              {/* Rango de nómina */}
              {payrollStartDate && payrollEndDate && (
                <div className="text-xs text-secondary">
                  Rango de nómina seleccionado:{" "}
                  <span className="text-primary font-medium">
                    {payrollStartDate}
                  </span>{" "}
                  a{" "}
                  <span className="text-primary font-medium">
                    {payrollEndDate}
                  </span>
                </div>
              )}

              {/* Secciones */}
              {activeTab === "deductions" ? (
                <AdditionalDeductionsSection
                  deductions={deductions}
                  onAdd={handleAddDeduction}
                  onRemoveSelected={removeSelectedDeductions}
                  onFieldChange={handleDeductionChange}
                  onToggleSelected={toggleDeductionSelected}
                  onToggleAll={toggleAllDeductionsSelected}
                  errors={rowErrors.deductions}
                  payrollStartDate={payrollStartDate}
                  payrollEndDate={payrollEndDate}
                  types={deductionTypes}
                />
              ) : (
                <AdditionalIncrementsSection
                  increments={increments}
                  onAdd={handleAddIncrement}
                  onRemoveSelected={removeSelectedIncrements}
                  onFieldChange={handleIncrementChange}
                  onToggleSelected={toggleIncrementSelected}
                  onToggleAll={toggleAllIncrementsSelected}
                  errors={rowErrors.increments}
                  payrollStartDate={payrollStartDate}
                  payrollEndDate={payrollEndDate}
                  types={incrementTypes}
                />
              )}

              {rowErrors.globalMessages.length > 0 && (
                <div className="mt-2 text-xs text-red-500">
                  {rowErrors.globalMessages.map((msg, index) => (
                    <div key={index}>• {msg}</div>
                  ))}
                </div>
              )}

              {/* Footer con navegación tipo wizard */}
              <AdjustmentsFooter
                activeTab={activeTab}
                loading={loading}
                onCancel={handleCancel}
                onNext={handleNextStep}
                onPrevious={handlePreviousStep}
                onSave={handleSave}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Confirmación de cancelación */}
      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={() => {
          setShowCancelConfirm(false);
          onClose?.();
        }}
        title="Confirmar Acción"
        message="¿Desea descartar los cambios realizados? Los ajustes no se guardarán."
        confirmText="Confirmar"
        cancelText="Cancelar"
        confirmColor="btn-primary"
        cancelColor="btn-error"
      />

      {/* Feedback de éxito y error */}
      <SuccessModal
        isOpen={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          onClose?.();
        }}
        title="Ajustes guardados"
        message={
          successMessage ||
          "Los ajustes adicionales se han guardado correctamente."
        }
      />

      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="No fue posible guardar los ajustes"
        message={errorMessage}
        buttonText="Cerrar"
      />
    </>
  );
};

const AdjustmentsStepIndicator = ({ activeTab, onTabChange }) => {
  const steps = [
    { id: 1, key: "deductions", label: "Deducciones adicionales" },
    { id: 2, key: "increments", label: "Incrementos adicionales" },
  ];

  const getStatus = (key) => {
    if (key === "deductions") {
      return activeTab === "deductions" ? "En progreso" : "Completo";
    }
    if (key === "increments") {
      return activeTab === "increments" ? "En progreso" : "Pendiente";
    }
    return "Pendiente";
  };

  return (
    <div className="mb-4 sm:mb-6 md:mb-8">
      <div className="flex items-center justify-center gap-8 sm:gap-12">
        {steps.map((step, index) => {
          const isActive = activeTab === step.key;
          const status = getStatus(step.key);
          const isCompleted =
            step.key === "deductions" && activeTab === "increments";

          return (
            <React.Fragment key={step.key}>
              <button
                type="button"
                className="flex flex-col items-center gap-1 focus:outline-none"
                onClick={() => onTabChange(step.key)}
              >
                <div
                  className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xs sm:text-theme-sm font-theme-bold border-2 mb-1 transition-all duration-300"
                  style={{
                    backgroundColor:
                      isActive || isCompleted
                        ? "var(--color-accent)"
                        : "var(--color-surface)",
                    borderColor:
                      isActive || isCompleted
                        ? "var(--color-accent)"
                        : "var(--color-border)",
                    color:
                      isActive || isCompleted
                        ? "white"
                        : "var(--color-text-secondary)",
                  }}
                >
                  {step.id}
                </div>
                <div className="mt-1 text-center max-w-24">
                  <div
                    className="text-xs sm:text-theme-xs font-theme-medium"
                    style={{
                      color:
                        isActive || isCompleted
                          ? "var(--color-accent)"
                          : "var(--color-text-secondary)",
                    }}
                  >
                    {step.label}
                  </div>
                  <div
                    className="text-[10px] sm:text-theme-xs mt-0.5"
                    style={{
                      color:
                        isActive || isCompleted
                          ? "var(--color-accent)"
                          : "var(--color-text-secondary)",
                    }}
                  >
                    {status}
                  </div>
                </div>
              </button>
              {index < steps.length - 1 && (
                <div
                  className="h-0.5 w-8 sm:w-12 md:w-16 mx-2 sm:mx-4 rounded-full transition-colors duration-300"
                  style={{
                    backgroundColor:
                      activeTab === "increments"
                        ? "var(--color-accent)"
                        : "var(--color-border)",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const AdjustmentsFooter = ({
  activeTab,
  loading,
  onCancel,
  onNext,
  onPrevious,
  onSave,
}) => {
  const isLastStep = activeTab === "increments";

  return (
    <div className="flex flex-row justify-between items-center mt-6 sm:mt-theme-xl pt-4 sm:pt-theme-lg border-t border-primary">
      {/* Botón Anterior */}
      <button
        type="button"
        aria-label="Previous Button"
        onClick={onPrevious}
        disabled={activeTab === "deductions" || loading}
        className="btn-theme btn-secondary w-auto"
      >
        Anterior
      </button>

      <div className="flex gap-4">
        {/* Botón Cancelar */}
        <button
          type="button"
          aria-label="Cancel Button"
          onClick={onCancel}
          disabled={loading}
          className="btn-theme w-auto"
          style={{
            backgroundColor: "#EF4444",
            color: "white",
            border: "none",
          }}
        >
          Cancelar
        </button>

        {/* Botón Siguiente / Guardar */}
        <button
          type="button"
          aria-label={isLastStep ? "Save Button" : "Next Button"}
          onClick={isLastStep ? onSave : onNext}
          disabled={loading}
          className="btn-theme btn-primary w-auto"
          style={{
            backgroundColor: "#000000",
            color: "white",
          }}
        >
          {loading
            ? "Guardando..."
            : isLastStep
            ? "Guardar ajustes"
            : "Siguiente"}
        </button>
      </div>
    </div>
  );
};

const AdditionalDeductionsSection = ({
  deductions,
  onAdd,
  onRemoveSelected,
  onFieldChange,
  onToggleSelected,
  onToggleAll,
  errors,
  payrollStartDate,
  payrollEndDate,
  types = [],
}) => {
  const allSelected =
    deductions.length > 0 && deductions.every((item) => !!item.seleccionado);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-primary">
          Deducciones adicionales
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-theme btn-secondary text-xs px-3 py-1"
            onClick={onRemoveSelected}
          >
            Eliminar
          </button>
          <button
            type="button"
            className="btn-theme btn-primary text-xs px-3 py-1"
            onClick={onAdd}
          >
            Añadir deducción
          </button>
        </div>
      </div>

      <div className="border border-primary rounded-theme-lg overflow-x-auto">
        <div className="min-w-max">
          {/* Encabezado */}
          <div className="grid grid-cols-[40px_150px_150px_120px_150px_150px_150px_200px_100px] gap-2 px-4 py-2 bg-surface text-xs font-medium text-secondary border-b border-primary">
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                className="cursor-pointer"
                checked={allSelected}
                disabled={deductions.length === 0}
                onChange={onToggleAll}
                aria-label="Seleccionar todas las deducciones adicionales"
              />
            </div>
            <div>Nombre</div>
            <div>Tipo</div>
            <div>Monto</div>
            <div>Aplicación</div>
            <div>Inicio</div>
            <div>Fin</div>
            <div>Descripción</div>
            <div>Cantidad</div>
          </div>

          {deductions.length === 0 ? (
            <div className="px-4 py-4 text-xs text-secondary">
              No se han agregado deducciones adicionales.
            </div>
          ) : (
            deductions.map((item) => {
              const rowError = errors?.[item.id];
              return (
                <div
                  key={item.id}
                  className={`grid grid-cols-[40px_150px_150px_120px_150px_150px_150px_200px_100px] gap-2 px-4 py-2 border-b border-primary/40 items-start text-xs ${
                    rowError ? "bg-error/5" : ""
                  }`}
                >
                  {/* Checkbox fila */}
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={!!item.seleccionado}
                      onChange={() => onToggleSelected(item.id)}
                      className="cursor-pointer"
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <select
                      className="input-theme text-xs"
                      value={item.nombreId}
                      onChange={(e) =>
                        onFieldChange(item.id, "nombreId", e.target.value)
                      }
                    >
                      <option value="">Seleccione</option>
                      {types.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Type */}
                  <div>
                    <select
                      className="input-theme text-xs"
                      value={item.tipoMonto}
                      onChange={(e) =>
                        onFieldChange(item.id, "tipoMonto", e.target.value)
                      }
                    >
                      <option value="">Seleccione</option>
                      {MOCK_AMOUNT_TYPES.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.etiqueta}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <input
                      type="number"
                      className="input-theme text-xs"
                      min="0"
                      step="0.01"
                      value={item.valorMonto}
                      onChange={(e) =>
                        onFieldChange(item.id, "valorMonto", e.target.value)
                      }
                    />
                  </div>

                  {/* Application */}
                  <div>
                    <select
                      className="input-theme text-xs"
                      value={item.aplicacion}
                      onChange={(e) =>
                        onFieldChange(item.id, "aplicacion", e.target.value)
                      }
                    >
                      <option value="">Seleccione</option>
                      {MOCK_APPLICATION_TYPES.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.etiqueta}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Start */}
                  <div>
                    <input
                      type="date"
                      className="input-theme text-xs"
                      value={item.fechaInicio || ""}
                      min={payrollStartDate || undefined}
                      max={payrollEndDate || undefined}
                      onChange={(e) =>
                        onFieldChange(item.id, "fechaInicio", e.target.value)
                      }
                    />
                  </div>

                  {/* End */}
                  <div>
                    <input
                      type="date"
                      className="input-theme text-xs"
                      value={item.fechaFin || ""}
                      min={payrollStartDate || undefined}
                      max={payrollEndDate || undefined}
                      onChange={(e) =>
                        onFieldChange(item.id, "fechaFin", e.target.value)
                      }
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <input
                      type="text"
                      className="input-theme text-xs"
                      maxLength={255}
                      value={item.descripcion}
                      onChange={(e) =>
                        onFieldChange(item.id, "descripcion", e.target.value)
                      }
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <input
                      type="number"
                      className="input-theme text-xs"
                      min="0"
                      step="0.01"
                      value={item.cantidad}
                      onChange={(e) =>
                        onFieldChange(item.id, "cantidad", e.target.value)
                      }
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const AdditionalIncrementsSection = ({
  increments,
  onAdd,
  onRemoveSelected,
  onFieldChange,
  onToggleSelected,
  onToggleAll,
  errors,
  payrollStartDate,
  payrollEndDate,
  types = [],
}) => {
  const allSelected =
    increments.length > 0 && increments.every((item) => !!item.seleccionado);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-primary">
          Incrementos adicionales
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-theme btn-secondary text-xs px-3 py-1"
            onClick={onRemoveSelected}
          >
            Eliminar
          </button>
          <button
            type="button"
            className="btn-theme btn-primary text-xs px-3 py-1"
            onClick={onAdd}
          >
            Añadir incremento
          </button>
        </div>
      </div>

      <div className="border border-primary rounded-theme-lg overflow-x-auto">
        <div className="min-w-max">
          {/* Encabezado */}
          <div className="grid grid-cols-[40px_150px_150px_120px_150px_150px_150px_200px_100px] gap-2 px-4 py-2 bg-surface text-xs font-medium text-secondary border-b border-primary">
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                className="cursor-pointer"
                checked={allSelected}
                disabled={increments.length === 0}
                onChange={onToggleAll}
                aria-label="Seleccionar todos los incrementos adicionales"
              />
            </div>
            <div>Nombre</div>
            <div>Tipo</div>
            <div>Monto</div>
            <div>Aplicación</div>
            <div>Inicio</div>
            <div>Fin</div>
            <div>Descripción</div>
            <div>Cantidad</div>
          </div>

          {increments.length === 0 ? (
            <div className="px-4 py-4 text-xs text-secondary">
              No se han agregado incrementos adicionales.
            </div>
          ) : (
            increments.map((item) => {
              const rowError = errors?.[item.id];
              return (
                <div
                  key={item.id}
                  className={`grid grid-cols-[40px_150px_150px_120px_150px_150px_150px_200px_100px] gap-2 px-4 py-2 border-b border-primary/40 items-start text-xs ${
                    rowError ? "bg-error/5" : ""
                  }`}
                >
                  {/* Checkbox fila */}
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={!!item.seleccionado}
                      onChange={() => onToggleSelected(item.id)}
                      className="cursor-pointer"
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <select
                      className="input-theme text-xs"
                      value={item.nombreId}
                      onChange={(e) =>
                        onFieldChange(item.id, "nombreId", e.target.value)
                      }
                    >
                      <option value="">Seleccione</option>
                      {types.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Type */}
                  <div>
                    <select
                      className="input-theme text-xs"
                      value={item.tipoMonto}
                      onChange={(e) =>
                        onFieldChange(item.id, "tipoMonto", e.target.value)
                      }
                    >
                      <option value="">Seleccione</option>
                      {MOCK_AMOUNT_TYPES.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.etiqueta}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <input
                      type="number"
                      className="input-theme text-xs"
                      min="0"
                      step="0.01"
                      value={item.valorMonto}
                      onChange={(e) =>
                        onFieldChange(item.id, "valorMonto", e.target.value)
                      }
                    />
                  </div>

                  {/* Application */}
                  <div>
                    <select
                      className="input-theme text-xs"
                      value={item.aplicacion}
                      onChange={(e) =>
                        onFieldChange(item.id, "aplicacion", e.target.value)
                      }
                    >
                      <option value="">Seleccione</option>
                      {MOCK_APPLICATION_TYPES.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.etiqueta}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Start */}
                  <div>
                    <input
                      type="date"
                      className="input-theme text-xs"
                      value={item.fechaInicio || ""}
                      min={payrollStartDate || undefined}
                      max={payrollEndDate || undefined}
                      onChange={(e) =>
                        onFieldChange(item.id, "fechaInicio", e.target.value)
                      }
                    />
                  </div>

                  {/* End */}
                  <div>
                    <input
                      type="date"
                      className="input-theme text-xs"
                      value={item.fechaFin || ""}
                      min={payrollStartDate || undefined}
                      max={payrollEndDate || undefined}
                      onChange={(e) =>
                        onFieldChange(item.id, "fechaFin", e.target.value)
                      }
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <input
                      type="text"
                      className="input-theme text-xs"
                      maxLength={255}
                      value={item.descripcion}
                      onChange={(e) =>
                        onFieldChange(item.id, "descripcion", e.target.value)
                      }
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <input
                      type="number"
                      className="input-theme text-xs"
                      min="0"
                      step="0.01"
                      value={item.cantidad}
                      onChange={(e) =>
                        onFieldChange(item.id, "cantidad", e.target.value)
                      }
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default IndividualPayrollAdjustmentsModal;
