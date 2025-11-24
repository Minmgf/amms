"use client";
import { useFormContext } from "react-hook-form";
import { useState, useEffect } from "react";
import {
  getActiveDepartments,
  getActiveCharges,
  getActiveTypes
} from "@/services/contractService";

export default function Step1GeneralInfo({ isAddendum = false, modifiableFields = [] }) {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext();

  const isDisabled = (fieldName) => {
    if (!isAddendum) return false;
    // Special case: startDate is never modifiable in addendum
    if (fieldName === "startDate") return true;
    return !modifiableFields.includes(fieldName);
  };

  const description = watch("description") || "";
  const paymentFrequency = watch("paymentFrequency") || "";
  const selectedDepartment = watch("department") || "";
  const selectedCharge = watch("charge") || "";
  const selectedContractType = watch("contractType") || "";
  const selectedWorkday = watch("workday") || "";
  const selectedWorkModality = watch("workModality") || "";
  const maxDescriptionLength = 100;

  // Estados para datos dinámicos
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [chargeOptions, setChargeOptions] = useState([]);
  const [contractTypeOptions, setContractTypeOptions] = useState([]);
  const [workdayOptions, setWorkdayOptions] = useState([]);
  const [workModalityOptions, setWorkModalityOptions] = useState([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingCharges, setIsLoadingCharges] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);

  // Cargar departamentos al montar el componente
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setIsLoadingDepartments(true);
        const response = await getActiveDepartments();
        const departments = response.data.map(dept => ({
          id: dept.id_employee_department,
          name: dept.name
        }));
        setDepartmentOptions(departments);
      } catch (error) {
        console.error("Error al cargar datos del Step 1:", error);
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, []);

  // Cargar tipos de contrato, jornada laboral y modalidad de trabajo al montar
  useEffect(() => {
    const loadTypes = async () => {
      try {
        setIsLoadingTypes(true);

        // Tipo de contrato - Categoría 15
        const contractTypes = await getActiveTypes(15);
        setContractTypeOptions(contractTypes.map(type => ({
          id: type.id_types,
          name: type.name
        })));

        // Jornada laboral - Categoría 16
        const workdays = await getActiveTypes(16);
        setWorkdayOptions(workdays.map(type => ({
          id: type.id_types,
          name: type.name
        })));

        // Modalidad de trabajo - Categoría 17
        const workModalities = await getActiveTypes(17);
        setWorkModalityOptions(workModalities.map(type => ({
          id: type.id_types,
          name: type.name
        })));
      } catch (error) {
        console.error("Error al cargar datos del Step 1:", error);
      } finally {
        setIsLoadingTypes(false);
      }
    };

    loadTypes();
  }, []);

  // Cargar cargos cuando cambie el departamento seleccionado
  useEffect(() => {
    const loadCharges = async () => {
      if (!selectedDepartment) {
        setChargeOptions([]);
        return;
      }

      try {
        setIsLoadingCharges(true);
        const charges = await getActiveCharges(selectedDepartment);
        setChargeOptions(charges.map(charge => ({
          id: charge.id_employee_charge,
          name: charge.name
        })));
      } catch (error) {
        console.error("Error al cargar datos del Step 1:", error);
        setChargeOptions([]);
      } finally {
        setIsLoadingCharges(false);
      }
    };

    loadCharges();
  }, [selectedDepartment]);

  // Frecuencia de pago: diario, semanal, quincenal, mensual
  const paymentFrequencyOptions = [
    { id: "diario", name: "Diario" },
    { id: "semanal", name: "Semanal" },
    { id: "quincenal", name: "Quincenal" },
    { id: "mensual", name: "Mensual" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-lg sm:text-theme-lg font-theme-semibold text-primary mb-4">
        Información general
      </h3>

      {/* Campo de Observación - Solo visible para Addendum */}
      {isAddendum && (
        <div>
          <label
            htmlFor="observation"
            className="block text-theme-sm font-theme-medium text-primary mb-2"
          >
            Observación
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <textarea
              id="observation"
              {...register("observation", {
                required: isAddendum ? "Este campo es obligatorio" : false,
                maxLength: {
                  value: 255,
                  message: "Máximo 255 caracteres",
                },
              })}
              rows={3}
              maxLength={255}
              className={`input-theme w-full resize-none ${
                errors.observation ? "border-red-500" : ""
              }`}
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: errors.observation
                  ? "#EF4444"
                  : "var(--color-border)",
                color: "var(--color-text-primary)",
              }}
              placeholder="Ingrese el motivo del cambio o resumen de modificaciones"
            />
          </div>
          {errors.observation && (
            <p className="text-red-500 text-xs mt-1">
              {errors.observation.message}
            </p>
          )}
        </div>
      )}

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
            value={selectedDepartment}
            disabled={isDisabled("department")}
            className={`input-theme w-full ${
              errors.department ? "border-red-500" : ""
            } ${isDisabled("department") ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
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
            value={selectedCharge}
            disabled={isDisabled("charge")}
            className={`input-theme w-full ${
              errors.charge ? "border-red-500" : ""
            } ${isDisabled("charge") ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
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
            disabled={isDisabled("description")}
            rows={3}
            maxLength={maxDescriptionLength}
            className={`input-theme w-full resize-none ${
              errors.description ? "border-red-500" : ""
            } ${isDisabled("description") ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
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
            disabled={isDisabled("contractType")}
            value={selectedContractType}
            className={`input-theme w-full ${
              errors.contractType ? "border-red-500" : ""
            } ${isDisabled("contractType") ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
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
            disabled={isDisabled("startDate")}
            className={`input-theme w-full ${
              errors.startDate ? "border-red-500" : ""
            } ${isDisabled("startDate") ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
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
            disabled={isDisabled("endDate")}
            className={`input-theme w-full ${
              errors.endDate ? "border-red-500" : ""
            } ${isDisabled("endDate") ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
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
            disabled={isDisabled("paymentFrequency")}
            className={`input-theme w-full ${
              errors.paymentFrequency ? "border-red-500" : ""
            } ${isDisabled("paymentFrequency") ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
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
        {paymentFrequency === "semanal" && (
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
                required: paymentFrequency === "semanal" ? "Este campo es obligatorio" : false,
              })}
              disabled={isDisabled("paymentDay")}
              className={`input-theme w-full ${
                errors.paymentDay ? "border-red-500" : ""
              } ${isDisabled("paymentDay") ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: errors.paymentDay
                  ? "#EF4444"
                  : "var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            >
              <option value="">Seleccione un día</option>
              <option value="1">Lunes</option>
              <option value="2">Martes</option>
              <option value="3">Miércoles</option>
              <option value="4">Jueves</option>
              <option value="5">Viernes</option>
              <option value="6">Sábado</option>
              <option value="7">Domingo</option>
            </select>
            {errors.paymentDay && (
              <p className="text-red-500 text-xs mt-1">
                {errors.paymentDay.message}
              </p>
            )}
          </div>
        )}

        {/* Si es MENSUAL: mostrar "Fecha de pago" */}
        {paymentFrequency === "mensual" && (
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
                required: paymentFrequency === "mensual" ? "Este campo es obligatorio" : false,
                min: { value: 1, message: "Debe ser entre 1 y 31" },
                max: { value: 31, message: "Debe ser entre 1 y 31" },
              })}
              disabled={isDisabled("paymentDay")} // Using paymentDay logic for paymentDate as generic payment timing
              className={`input-theme w-full ${
                errors.paymentDate ? "border-red-500" : ""
              } ${isDisabled("paymentDay") ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
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
        {paymentFrequency === "quincenal" && (
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
                  required: paymentFrequency === "quincenal" ? "Este campo es obligatorio" : false,
                  min: { value: 1, message: "Debe ser entre 1 y 31" },
                  max: { value: 31, message: "Debe ser entre 1 y 31" },
                })}
                disabled={isDisabled("paymentDay")}
                className={`input-theme w-full ${
                  errors.firstPaymentDate ? "border-red-500" : ""
                } ${isDisabled("paymentDay") ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
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
                  required: paymentFrequency === "quincenal" ? "Este campo es obligatorio" : false,
                  min: { value: 1, message: "Debe ser entre 1 y 31" },
                  max: { value: 31, message: "Debe ser entre 1 y 31" },
                })}
                disabled={isDisabled("paymentDay")}
                className={`input-theme w-full ${
                  errors.secondPaymentDate ? "border-red-500" : ""
                } ${isDisabled("paymentDay") ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
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
            disabled={isDisabled("minimumHours")}
            className={`input-theme w-full ${
              errors.minimumHours ? "border-red-500" : ""
            } ${isDisabled("minimumHours") ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
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
            disabled={isDisabled("workday")}
            value={selectedWorkday}
            className={`input-theme w-full ${
              errors.workday ? "border-red-500" : ""
            } ${isDisabled("workday") ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
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
            disabled={isDisabled("workModality")}
            value={selectedWorkModality}
            className={`input-theme w-full ${
              errors.workModality ? "border-red-500" : ""
            } ${isDisabled("workModality") ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
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

