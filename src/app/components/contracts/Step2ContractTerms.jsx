"use client";
import { useFormContext } from "react-hook-form";
// TODO: Importar servicios cuando se integre
// import { getUnitsByCategory } from "@/services/parametrizationService";

export default function Step2ContractTerms() {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext();

  const cumulative = watch("cumulative");
  const salaryModality = watch("salaryType") || "";

  // TODO: Datos temporales MOCK - Reemplazar con servicios
  // Modalidad salarial (fija, no parametrizable)
  const salaryTypeOptions = [
    { id: "hourly", name: "Por horas" },
    { id: "daily", name: "Por días" },
    { id: "monthly", name: "Mensual fijo" },
  ];

  // PARAMETRIZABLE: Debe usar getUnitsByCategory(10) para monedas
  const currencyOptions = [
    { id: 18, name: "USD", symbol: "USD - Dólar Estadounidense" },
    { id: 19, name: "COP", symbol: "COP - Pesos Colombianos" },
    { id: 20, name: "EUR", symbol: "EUR - Euro" },
    { id: 21, name: "MXN", symbol: "MXN - Peso Mexicano" },
  ];

  const overtimePeriodOptions = [
    { id: 1, name: "Diario" },
    { id: 2, name: "Semanal" },
    { id: 3, name: "Mensual" },
  ];

  const terminationNoticePeriodOptions = [
    { id: 1, name: "15 días" },
    { id: 2, name: "30 días" },
    { id: 3, name: "60 días" },
    { id: 4, name: "90 días" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-lg sm:text-theme-lg font-theme-semibold text-primary mb-4">
        Términos del contrato
      </h3>

      {/* Primera fila: Modalidad salarial, Base salary, Currency */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Modalidad salarial */}
        <div>
          <label
            htmlFor="salaryType"
            className="block text-theme-sm font-theme-medium text-primary mb-2"
          >
            Modalidad salarial
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="salaryType"
            {...register("salaryType", {
              required: "Este campo es obligatorio",
            })}
            className={`input-theme w-full ${
              errors.salaryType ? "border-red-500" : ""
            }`}
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: errors.salaryType
                ? "#EF4444"
                : "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          >
            <option value="">Seleccione un tipo</option>
            {salaryTypeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          {errors.salaryType && (
            <p className="text-red-500 text-xs mt-1">
              {errors.salaryType.message}
            </p>
          )}
        </div>

        {/* Base salary */}
        <div>
          <label
            htmlFor="baseSalary"
            className="block text-theme-sm font-theme-medium text-primary mb-2"
          >
            Salario base
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            id="baseSalary"
            type="number"
            step="0.01"
            min="0"
            {...register("baseSalary", {
              required: "Este campo es obligatorio",
              min: {
                value: 0,
                message: "El salario debe ser mayor a 0",
              },
            })}
            className={`input-theme w-full ${
              errors.baseSalary ? "border-red-500" : ""
            }`}
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: errors.baseSalary
                ? "#EF4444"
                : "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
            placeholder="Ingrese el salario base"
          />
          {errors.baseSalary && (
            <p className="text-red-500 text-xs mt-1">
              {errors.baseSalary.message}
            </p>
          )}
        </div>

        {/* Currency */}
        <div>
          <label
            htmlFor="currency"
            className="block text-theme-sm font-theme-medium text-primary mb-2"
          >
            Moneda
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="currency"
            {...register("currency", {
              required: "Este campo es obligatorio",
            })}
            className={`input-theme w-full ${
              errors.currency ? "border-red-500" : ""
            }`}
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: errors.currency
                ? "#EF4444"
                : "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          >
            <option value="">Seleccione una moneda</option>
            {currencyOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          {errors.currency && (
            <p className="text-red-500 text-xs mt-1">
              {errors.currency.message}
            </p>
          )}
        </div>
      </div>

      {/* Campo condicional: Cantidad de horas/días contratados */}
      {(salaryModality === "hourly" || salaryModality === "daily") && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <label
              htmlFor="contractedAmount"
              className="block text-theme-sm font-theme-medium text-primary mb-2"
            >
              {salaryModality === "hourly" 
                ? "Cantidad de horas contratadas" 
                : "Cantidad de días contratados"}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="contractedAmount"
              type="number"
              min="1"
              {...register("contractedAmount", {
                required: (salaryModality === "hourly" || salaryModality === "daily") 
                  ? "Este campo es obligatorio" 
                  : false,
                min: { value: 1, message: "Debe ser mayor a 0" },
              })}
              className={`input-theme w-full ${
                errors.contractedAmount ? "border-red-500" : ""
              }`}
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: errors.contractedAmount
                  ? "#EF4444"
                  : "var(--color-border)",
                color: "var(--color-text-primary)",
              }}
              placeholder={salaryModality === "hourly" ? "Ej: 160 horas" : "Ej: 20 días"}
            />
            {errors.contractedAmount && (
              <p className="text-red-500 text-xs mt-1">
                {errors.contractedAmount.message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Segunda fila: Trial period, Vacation days, Cumulative?, Effective from */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
        {/* Trial period */}
        <div>
          <label
            htmlFor="trialPeriod"
            className="block text-theme-sm font-theme-medium text-primary mb-2"
          >
            Período de prueba
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            id="trialPeriod"
            type="number"
            min="0"
            {...register("trialPeriod", {
              required: "Este campo es obligatorio",
              min: {
                value: 0,
                message: "Debe ser mayor o igual a 0",
              },
            })}
            className={`input-theme w-full ${
              errors.trialPeriod ? "border-red-500" : ""
            }`}
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: errors.trialPeriod
                ? "#EF4444"
                : "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
            placeholder="Días"
          />
          {errors.trialPeriod && (
            <p className="text-red-500 text-xs mt-1">
              {errors.trialPeriod.message}
            </p>
          )}
        </div>

        {/* Vacation days */}
        <div>
          <label
            htmlFor="vacationDays"
            className="block text-theme-sm font-theme-medium text-primary mb-2"
          >
            Días de vacaciones
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            id="vacationDays"
            type="number"
            min="0"
            {...register("vacationDays", {
              required: "Este campo es obligatorio",
              min: {
                value: 0,
                message: "Debe ser mayor o igual a 0",
              },
            })}
            className={`input-theme w-full ${
              errors.vacationDays ? "border-red-500" : ""
            }`}
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: errors.vacationDays
                ? "#EF4444"
                : "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
            placeholder="Días"
          />
          {errors.vacationDays && (
            <p className="text-red-500 text-xs mt-1">
              {errors.vacationDays.message}
            </p>
          )}
        </div>

        {/* Cumulative? */}
        <div>
          <label className="block text-theme-sm font-theme-medium text-primary mb-2">
            ¿Acumulativo?
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex items-center space-x-6 mt-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="yes"
                {...register("cumulative", {
                  required: "Debe seleccionar una opción",
                })}
                className="w-4 h-4 cursor-pointer"
                style={{
                  accentColor: "var(--color-accent)",
                }}
              />
              <span className="ml-2 text-theme-sm text-primary">Sí</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="no"
                {...register("cumulative", {
                  required: "Debe seleccionar una opción",
                })}
                className="w-4 h-4 cursor-pointer"
                style={{
                  accentColor: "var(--color-accent)",
                }}
              />
              <span className="ml-2 text-theme-sm text-primary">No</span>
            </label>
          </div>
          {errors.cumulative && (
            <p className="text-red-500 text-xs mt-1">
              {errors.cumulative.message}
            </p>
          )}
        </div>

        {/* Effective from */}
        <div>
          <label
            htmlFor="effectiveFrom"
            className="block text-theme-sm font-theme-medium text-primary mb-2"
          >
            Efectivo desde
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            id="effectiveFrom"
            type="date"
            {...register("effectiveFrom", {
              required: "Este campo es obligatorio",
            })}
            className={`input-theme w-full ${
              errors.effectiveFrom ? "border-red-500" : ""
            }`}
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: errors.effectiveFrom
                ? "#EF4444"
                : "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          />
          {errors.effectiveFrom && (
            <p className="text-red-500 text-xs mt-1">
              {errors.effectiveFrom.message}
            </p>
          )}
        </div>
      </div>

      {/* Tercera fila: Vacation grant frequency, Maximum disability days, Maximum overtime */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Vacation grant frequency */}
        <div>
          <label
            htmlFor="vacationGrantFrequency"
            className="block text-theme-sm font-theme-medium text-primary mb-2"
          >
            Frecuencia de concesión de vacaciones
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            id="vacationGrantFrequency"
            type="number"
            min="0"
            {...register("vacationGrantFrequency", {
              required: "Este campo es obligatorio",
              min: {
                value: 0,
                message: "Debe ser mayor o igual a 0",
              },
            })}
            className={`input-theme w-full ${
              errors.vacationGrantFrequency ? "border-red-500" : ""
            }`}
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: errors.vacationGrantFrequency
                ? "#EF4444"
                : "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
            placeholder="Días"
          />
          {errors.vacationGrantFrequency && (
            <p className="text-red-500 text-xs mt-1">
              {errors.vacationGrantFrequency.message}
            </p>
          )}
        </div>

        {/* Maximum disability days */}
        <div>
          <label
            htmlFor="maximumDisabilityDays"
            className="block text-theme-sm font-theme-medium text-primary mb-2"
          >
            Días máximos de incapacidad
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            id="maximumDisabilityDays"
            type="number"
            min="0"
            {...register("maximumDisabilityDays", {
              required: "Este campo es obligatorio",
              min: {
                value: 0,
                message: "Debe ser mayor o igual a 0",
              },
            })}
            className={`input-theme w-full ${
              errors.maximumDisabilityDays ? "border-red-500" : ""
            }`}
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: errors.maximumDisabilityDays
                ? "#EF4444"
                : "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
            placeholder="Días"
          />
          {errors.maximumDisabilityDays && (
            <p className="text-red-500 text-xs mt-1">
              {errors.maximumDisabilityDays.message}
            </p>
          )}
        </div>

        {/* Maximum overtime */}
        <div>
          <label
            htmlFor="maximumOvertime"
            className="block text-theme-sm font-theme-medium text-primary mb-2"
          >
            Horas extras máximas
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            id="maximumOvertime"
            type="number"
            min="0"
            {...register("maximumOvertime", {
              required: "Este campo es obligatorio",
              min: {
                value: 0,
                message: "Debe ser mayor o igual a 0",
              },
            })}
            className={`input-theme w-full ${
              errors.maximumOvertime ? "border-red-500" : ""
            }`}
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: errors.maximumOvertime
                ? "#EF4444"
                : "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
            placeholder="Horas"
          />
          {errors.maximumOvertime && (
            <p className="text-red-500 text-xs mt-1">
              {errors.maximumOvertime.message}
            </p>
          )}
        </div>
      </div>

      {/* Cuarta fila: Overtime period, Termination notice period */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Overtime period */}
        <div>
          <label
            htmlFor="overtimePeriod"
            className="block text-theme-sm font-theme-medium text-primary mb-2"
          >
            Período de horas extras
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="overtimePeriod"
            {...register("overtimePeriod", {
              required: "Este campo es obligatorio",
            })}
            className={`input-theme w-full ${
              errors.overtimePeriod ? "border-red-500" : ""
            }`}
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: errors.overtimePeriod
                ? "#EF4444"
                : "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          >
            <option value="">Seleccione un período</option>
            {overtimePeriodOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          {errors.overtimePeriod && (
            <p className="text-red-500 text-xs mt-1">
              {errors.overtimePeriod.message}
            </p>
          )}
        </div>

        {/* Termination notice period */}
        <div>
          <label
            htmlFor="terminationNoticePeriod"
            className="block text-theme-sm font-theme-medium text-primary mb-2"
          >
            Período de preaviso de terminación
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="terminationNoticePeriod"
            {...register("terminationNoticePeriod", {
              required: "Este campo es obligatorio",
            })}
            className={`input-theme w-full ${
              errors.terminationNoticePeriod ? "border-red-500" : ""
            }`}
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: errors.terminationNoticePeriod
                ? "#EF4444"
                : "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          >
            <option value="">Seleccione un período</option>
            {terminationNoticePeriodOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          {errors.terminationNoticePeriod && (
            <p className="text-red-500 text-xs mt-1">
              {errors.terminationNoticePeriod.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

