"use client";
import { useFormContext } from "react-hook-form";
import { useState } from "react";
// TODO: Importar servicios cuando se integre
// import { getDepartments, getChargesDepartments, getActiveTypesByCategory } from "@/services/parametrizationService";

export default function Step1GeneralInfo() {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext();

  const description = watch("description") || "";
  const paymentFrequency = watch("paymentFrequency") || "";
  const maxDescriptionLength = 100;

  // TODO: Datos temporales MOCK - Reemplazar con servicios
  
  // PARAMETRIZABLE: Departamentos
  const departmentOptions = [
    { id: 1, name: "Administración" },
    { id: 2, name: "Operaciones" },
    { id: 3, name: "Recursos Humanos" },
    { id: 4, name: "Tecnología" },
  ];

  // PARAMETRIZABLE: Debe usar getChargesDepartments(id_employee_department)
  const chargeOptions = [
    { id: 1, name: "Gerente" },
    { id: 2, name: "Supervisor" },
    { id: 3, name: "Operario" },
    { id: 4, name: "Técnico" },
  ];

  // PARAMETRIZABLE: Debe usar getActiveTypesByCategory(idTypeCategory)
  // Tipos: Indefinido, A término fijo, Obra labor, etc.
  const contractTypeOptions = [
    { id: 1, name: "Indefinido" },
    { id: 2, name: "A término fijo" },
    { id: 3, name: "Obra labor" },
    { id: 4, name: "Prestación de servicios" },
  ];

  // Frecuencia de pago: diario, semanal, quincenal, mensual
  const paymentFrequencyOptions = [
    { id: "daily", name: "Diario" },
    { id: "weekly", name: "Semanal" },
    { id: "biweekly", name: "Quincenal" },
    { id: "monthly", name: "Mensual" },
  ];

  // PARAMETRIZABLE: Jornada laboral
  const workdayOptions = [
    { id: 1, name: "Lunes a Viernes" },
    { id: 2, name: "Lunes a Sábado" },
    { id: 3, name: "Rotativo" },
    { id: 4, name: "Turnos" },
  ];

  // PARAMETRIZABLE: Modalidad de trabajo
  const workModalityOptions = [
    { id: 1, name: "Presencial" },
    { id: 2, name: "Remoto" },
    { id: 3, name: "Híbrido" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-lg sm:text-theme-lg font-theme-semibold text-primary mb-4">
        Información general
      </h3>

      {/* Primera fila: Departamento y Cargo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Departamento */}
        <div>
          <label
            htmlFor="department"
            className="block text-theme-sm font-theme-medium text-primary mb-2"
          >
            Departamento
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="department"
            {...register("department", {
              required: "Este campo es obligatorio",
            })}
            className={`input-theme w-full ${
              errors.department ? "border-red-500" : ""
            }`}
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: errors.department
                ? "#EF4444"
                : "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          >
            <option value="">Seleccione un departamento</option>
            {departmentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          {errors.department && (
            <p className="text-red-500 text-xs mt-1">
              {errors.department.message}
            </p>
          )}
        </div>

        {/* Cargo */}
        <div>
          <label
            htmlFor="charge"
            className="block text-theme-sm font-theme-medium text-primary mb-2"
          >
            Cargo
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="charge"
            {...register("charge", {
              required: "Este campo es obligatorio",
            })}
            className={`input-theme w-full ${
              errors.charge ? "border-red-500" : ""
            }`}
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: errors.charge
                ? "#EF4444"
                : "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          >
            <option value="">Seleccione un cargo</option>
            {chargeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          {errors.charge && (
            <p className="text-red-500 text-xs mt-1">
              {errors.charge.message}
            </p>
          )}
        </div>
      </div>

      {/* Segunda fila: Descripción */}
      <div>
        <label
          htmlFor="description"
          className="block text-theme-sm font-theme-medium text-primary mb-2"
        >
          Descripción
        </label>
        <div className="relative">
          <textarea
            id="description"
            {...register("description", {
              maxLength: {
                value: maxDescriptionLength,
                message: `Máximo ${maxDescriptionLength} caracteres`,
              },
            })}
            rows={3}
            maxLength={maxDescriptionLength}
            className={`input-theme w-full resize-none ${
              errors.description ? "border-red-500" : ""
            }`}
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: errors.description
                ? "#EF4444"
                : "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
            placeholder="Ingrese una descripción"
          />
          <div className="absolute bottom-2 right-2 text-xs text-secondary">
            {description.length}/{maxDescriptionLength} caracteres
          </div>
        </div>
        {errors.description && (
          <p className="text-red-500 text-xs mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Segunda fila: Tipo de contrato, Fecha de inicio, Fecha de fin */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Tipo de contrato */}
        <div>
          <label
            htmlFor="contractType"
            className="block text-theme-sm font-theme-medium text-primary mb-2"
          >
            Tipo de contrato
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="contractType"
            {...register("contractType", {
              required: "Este campo es obligatorio",
            })}
            className={`input-theme w-full ${
              errors.contractType ? "border-red-500" : ""
            }`}
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: errors.contractType
                ? "#EF4444"
                : "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          >
            <option value="">Seleccione un tipo</option>
            {contractTypeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          {errors.contractType && (
            <p className="text-red-500 text-xs mt-1">
              {errors.contractType.message}
            </p>
          )}
        </div>

        {/* Fecha de inicio */}
        <div>
          <label
            htmlFor="startDate"
            className="block text-theme-sm font-theme-medium text-primary mb-2"
          >
            Fecha de inicio
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            id="startDate"
            type="date"
            {...register("startDate", {
              required: "Este campo es obligatorio",
            })}
            className={`input-theme w-full ${
              errors.startDate ? "border-red-500" : ""
            }`}
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: errors.startDate
                ? "#EF4444"
                : "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          />
          {errors.startDate && (
            <p className="text-red-500 text-xs mt-1">
              {errors.startDate.message}
            </p>
          )}
        </div>

        {/* Fecha de fin */}
        <div>
          <label
            htmlFor="endDate"
            className="block text-theme-sm font-theme-medium text-primary mb-2"
          >
            Fecha de fin
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            id="endDate"
            type="date"
            {...register("endDate", {
              required: "Este campo es obligatorio",
            })}
            className={`input-theme w-full ${
              errors.endDate ? "border-red-500" : ""
            }`}
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: errors.endDate
                ? "#EF4444"
                : "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          />
          {errors.endDate && (
            <p className="text-red-500 text-xs mt-1">
              {errors.endDate.message}
            </p>
          )}
        </div>
      </div>

      {/* Tercera fila: Frecuencia de pago y campos condicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Frecuencia de pago */}
        <div>
          <label
            htmlFor="paymentFrequency"
            className="block text-theme-sm font-theme-medium text-primary mb-2"
          >
            Frecuencia de pago
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="paymentFrequency"
            {...register("paymentFrequency", {
              required: "Este campo es obligatorio",
            })}
            className={`input-theme w-full ${
              errors.paymentFrequency ? "border-red-500" : ""
            }`}
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: errors.paymentFrequency
                ? "#EF4444"
                : "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          >
            <option value="">Seleccione una frecuencia</option>
            {paymentFrequencyOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          {errors.paymentFrequency && (
            <p className="text-red-500 text-xs mt-1">
              {errors.paymentFrequency.message}
            </p>
          )}
        </div>

        {/* Campos condicionales según frecuencia de pago */}
        {/* Si es SEMANAL: mostrar "Día de pago" */}
        {paymentFrequency === "weekly" && (
          <div className="md:col-span-2">
            <label
              htmlFor="paymentDay"
              className="block text-theme-sm font-theme-medium text-primary mb-2"
            >
              Día de pago
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="paymentDay"
              {...register("paymentDay", {
                required: paymentFrequency === "weekly" ? "Este campo es obligatorio" : false,
              })}
              className={`input-theme w-full ${
                errors.paymentDay ? "border-red-500" : ""
              }`}
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: errors.paymentDay
                  ? "#EF4444"
                  : "var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            >
              <option value="">Seleccione un día</option>
              <option value="monday">Lunes</option>
              <option value="tuesday">Martes</option>
              <option value="wednesday">Miércoles</option>
              <option value="thursday">Jueves</option>
              <option value="friday">Viernes</option>
              <option value="saturday">Sábado</option>
              <option value="sunday">Domingo</option>
            </select>
            {errors.paymentDay && (
              <p className="text-red-500 text-xs mt-1">
                {errors.paymentDay.message}
              </p>
            )}
          </div>
        )}

        {/* Si es MENSUAL: mostrar "Fecha de pago" */}
        {paymentFrequency === "monthly" && (
          <div className="md:col-span-2">
            <label
              htmlFor="paymentDate"
              className="block text-theme-sm font-theme-medium text-primary mb-2"
            >
              Fecha de pago
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="paymentDate"
              type="number"
              min="1"
              max="31"
              {...register("paymentDate", {
                required: paymentFrequency === "monthly" ? "Este campo es obligatorio" : false,
                min: { value: 1, message: "Debe ser entre 1 y 31" },
                max: { value: 31, message: "Debe ser entre 1 y 31" },
              })}
              className={`input-theme w-full ${
                errors.paymentDate ? "border-red-500" : ""
              }`}
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: errors.paymentDate
                  ? "#EF4444"
                  : "var(--color-border)",
                color: "var(--color-text-primary)",
              }}
              placeholder="Día del mes (1-31)"
            />
            {errors.paymentDate && (
              <p className="text-red-500 text-xs mt-1">
                {errors.paymentDate.message}
              </p>
            )}
          </div>
        )}

        {/* Si es QUINCENAL: mostrar "Primera fecha" y "Segunda fecha" */}
        {paymentFrequency === "biweekly" && (
          <>
            <div>
              <label
                htmlFor="firstPaymentDate"
                className="block text-theme-sm font-theme-medium text-primary mb-2"
              >
                Primera fecha de pago
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="firstPaymentDate"
                type="number"
                min="1"
                max="31"
                {...register("firstPaymentDate", {
                  required: paymentFrequency === "biweekly" ? "Este campo es obligatorio" : false,
                  min: { value: 1, message: "Debe ser entre 1 y 31" },
                  max: { value: 31, message: "Debe ser entre 1 y 31" },
                })}
                className={`input-theme w-full ${
                  errors.firstPaymentDate ? "border-red-500" : ""
                }`}
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: errors.firstPaymentDate
                    ? "#EF4444"
                    : "var(--color-border)",
                  color: "var(--color-text-primary)",
                }}
                placeholder="Día del mes (1-31)"
              />
              {errors.firstPaymentDate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.firstPaymentDate.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="secondPaymentDate"
                className="block text-theme-sm font-theme-medium text-primary mb-2"
              >
                Segunda fecha de pago
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="secondPaymentDate"
                type="number"
                min="1"
                max="31"
                {...register("secondPaymentDate", {
                  required: paymentFrequency === "biweekly" ? "Este campo es obligatorio" : false,
                  min: { value: 1, message: "Debe ser entre 1 y 31" },
                  max: { value: 31, message: "Debe ser entre 1 y 31" },
                })}
                className={`input-theme w-full ${
                  errors.secondPaymentDate ? "border-red-500" : ""
                }`}
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: errors.secondPaymentDate
                    ? "#EF4444"
                    : "var(--color-border)",
                  color: "var(--color-text-primary)",
                }}
                placeholder="Día del mes (1-31)"
              />
              {errors.secondPaymentDate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.secondPaymentDate.message}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Cuarta fila: Horas mínimas, Jornada laboral, Modalidad de trabajo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Horas mínimas (opcional) */}
        <div>
          <label
            htmlFor="minimumHours"
            className="block text-theme-sm font-theme-medium text-primary mb-2"
          >
            Número de horas mínimas
          </label>
          <input
            id="minimumHours"
            type="number"
            min="1"
            {...register("minimumHours", {
              min: { value: 1, message: "Debe ser mayor a 0" },
            })}
            className={`input-theme w-full ${
              errors.minimumHours ? "border-red-500" : ""
            }`}
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: errors.minimumHours
                ? "#EF4444"
                : "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
            placeholder="Ej: 40 (por día, semana o mes)"
          />
          {errors.minimumHours && (
            <p className="text-red-500 text-xs mt-1">
              {errors.minimumHours.message}
            </p>
          )}
        </div>

        {/* Jornada laboral (opcional, parametrizable) */}
        <div>
          <label
            htmlFor="workday"
            className="block text-theme-sm font-theme-medium text-primary mb-2"
          >
            Jornada laboral
          </label>
          <select
            id="workday"
            {...register("workday")}
            className={`input-theme w-full ${
              errors.workday ? "border-red-500" : ""
            }`}
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: errors.workday
                ? "#EF4444"
                : "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          >
            <option value="">Seleccione la jornada</option>
            {workdayOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          {errors.workday && (
            <p className="text-red-500 text-xs mt-1">
              {errors.workday.message}
            </p>
          )}
        </div>

        {/* Modalidad de trabajo (opcional, parametrizable) */}
        <div>
          <label
            htmlFor="workModality"
            className="block text-theme-sm font-theme-medium text-primary mb-2"
          >
            Modalidad de trabajo
          </label>
          <select
            id="workModality"
            {...register("workModality")}
            className={`input-theme w-full ${
              errors.workModality ? "border-red-500" : ""
            }`}
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: errors.workModality
                ? "#EF4444"
                : "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          >
            <option value="">Seleccione la modalidad</option>
            {workModalityOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          {errors.workModality && (
            <p className="text-red-500 text-xs mt-1">
              {errors.workModality.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

