import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useTheme } from "@/contexts/ThemeContext";

export default function Step3SpecificData({
  machineryId,
  powerUnitsList = [],
  volumeUnitsList = [],
  flowConsumptionUnitsList = [],
  weightUnitsList = [],
  speedUnitsList = [],
  forceUnitsList = [],
  dimensionUnitsList = [],
  performanceUnitsList = [],
  pressureUnitsList = [],
  engineTypesList = [],
  cylinderArrangementList = [],
  tractionTypesList = [],
  transmissionSystemList = [],
  airConditioningList = [],
  emissionLevelList = [],
  cabinTypesList = [],
}) {
  const {
    register,
    formState: { errors },
    watch,
    trigger,
    setValue,
  } = useFormContext();

  const { getCurrentTheme } = useTheme();

  // Estado para controlar qué secciones están expandidas
  const [expandedSections, setExpandedSections] = useState({
    engineTransmission: true,
    capacityPerformance: false,
    dimensionsWeight: false,
    auxiliaryHydraulic: false,
    regulationsSafety: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Reglas de validación
  const validationRules = {
    // Motor y Transmisión - Campos obligatorios
    enginePower: {
      required: "La potencia del motor es obligatoria",
      min: { value: 0.1, message: "La potencia debe ser mayor a 0" },
      max: { value: 10000, message: "La potencia no puede exceder 10,000" },
    },
    enginePowerUnit: {
      required: "La unidad de potencia es obligatoria",
    },
    engineType: {
      required: "El tipo de motor es obligatorio",
    },
    cylinderCapacity: {
      required: "El cilindraje es obligatorio",
      min: { value: 1, message: "El cilindraje debe ser mayor a 0" },
      max: { value: 50000, message: "El cilindraje no puede exceder 50,000" },
    },
    cylinderCapacityUnit: {
      required: "La unidad de cilindraje es obligatoria",
    },
    cylindersNumber: {
      required: "El número de cilindros es obligatorio",
      min: { value: 1, message: "Debe tener al menos 1 cilindro" },
      max: { value: 32, message: "No puede exceder 32 cilindros" },
      pattern: { value: /^\d+$/, message: "Solo números enteros" },
    },
    arrangement: {
      required: "La disposición de cilindros es obligatoria",
    },
    fuelConsumption: {
      required: "El consumo de combustible es obligatorio",
      min: { value: 0.1, message: "El consumo debe ser mayor a 0" },
      max: { value: 1000, message: "El consumo no puede exceder 1,000" },
    },
    fuelConsumptionUnit: {
      required: "La unidad de consumo es obligatoria",
    },
    transmissionSystem: {
      required: "El sistema de transmisión es obligatorio",
    },

    // Capacidad y Rendimiento - Campos obligatorios
    operatingWeight: {
      required: "El peso operativo es obligatorio",
      min: { value: 0.1, message: "El peso debe ser mayor a 0" },
      max: { value: 1000000, message: "El peso no puede exceder 1,000,000" },
    },
    operatingWeightUnit: {
      required: "La unidad de peso operativo es obligatoria",
    },
    maxSpeed: {
      required: "La velocidad máxima es obligatoria",
      min: { value: 0.1, message: "La velocidad debe ser mayor a 0" },
      max: { value: 500, message: "La velocidad no puede exceder 500" },
    },
    maxSpeedUnit: {
      required: "La unidad de velocidad es obligatoria",
    },
    performanceUnit: {
      required: "La unidad de rendimiento es obligatoria",
    },

    // Dimensiones y Peso - Campos obligatorios
    dimensionsUnit: {
      required: "La unidad de dimensiones es obligatoria",
    },
    width: {
      required: "El ancho es obligatorio",
      min: { value: 0.01, message: "El ancho debe ser mayor a 0" },
      max: { value: 100, message: "El ancho no puede exceder 100" },
    },
    length: {
      required: "El largo es obligatorio",
      min: { value: 0.01, message: "El largo debe ser mayor a 0" },
      max: { value: 100, message: "El largo no puede exceder 100" },
    },
    height: {
      required: "El alto es obligatorio",
      min: { value: 0.01, message: "El alto debe ser mayor a 0" },
      max: { value: 50, message: "El alto no puede exceder 50" },
    },
    netWeight: {
      required: "El peso neto es obligatorio",
      min: { value: 0.1, message: "El peso neto debe ser mayor a 0" },
      max: {
        value: 1000000,
        message: "El peso neto no puede exceder 1,000,000",
      },
    },
    netWeightUnit: {
      required: "La unidad de peso neto es obligatoria",
    },

    // Campos opcionales con validaciones
    tankCapacity: {
      min: { value: 0.1, message: "La capacidad debe ser mayor a 0" },
      max: { value: 10000, message: "La capacidad no puede exceder 10,000" },
    },
    carryingCapacity: {
      min: { value: 0.1, message: "La capacidad de carga debe ser mayor a 0" },
      max: {
        value: 1000000,
        message: "La capacidad no puede exceder 1,000,000",
      },
    },
    draftForce: {
      min: { value: 0.1, message: "La fuerza debe ser mayor a 0" },
      max: { value: 1000000, message: "La fuerza no puede exceder 1,000,000" },
    },
    maxOperatingAltitude: {
      min: { value: 0, message: "La altitud no puede ser negativa" },
      max: { value: 10000, message: "La altitud no puede exceder 10,000" },
    },
    performanceMin: {
      min: { value: 0, message: "El RPM mínimo no puede ser negativo" },
      max: { value: 10000, message: "El RPM no puede exceder 10,000" },
      validate: (value, formValues) => {
        const maxValue = formValues.performanceMax;
        if (value && maxValue && parseFloat(value) >= parseFloat(maxValue)) {
          return "El RPM mínimo debe ser menor al máximo";
        }
        return true;
      },
    },
    performanceMax: {
      min: { value: 1, message: "El RPM máximo debe ser mayor a 0" },
      max: { value: 10000, message: "El RPM no puede exceder 10,000" },
      validate: (value, formValues) => {
        const minValue = formValues.performanceMin;
        if (value && minValue && parseFloat(value) <= parseFloat(minValue)) {
          return "El RPM máximo debe ser mayor al mínimo";
        }
        return true;
      },
    },
    airConditioningConsumption: {
      min: { value: 0.1, message: "El consumo debe ser mayor a 0" },
      max: { value: 1000, message: "El consumo no puede exceder 1,000" },
    },
    maxHydraulicPressure: {
      min: { value: 0.1, message: "La presión debe ser mayor a 0" },
      max: { value: 10000, message: "La presión no puede exceder 10,000" },
    },
    hydraulicPumpFlowRate: {
      min: { value: 0.1, message: "El caudal debe ser mayor a 0" },
      max: { value: 10000, message: "El caudal no puede exceder 10,000" },
    },
    hydraulicReservoirCapacity: {
      min: { value: 0.1, message: "La capacidad debe ser mayor a 0" },
      max: { value: 10000, message: "La capacidad no puede exceder 10,000" },
    },
    tankCapacityUnit: {
      validate: (value, formValues) => {
        if (formValues.tankCapacity && !value) {
          return "Debe seleccionar una unidad cuando hay un valor";
        }
        return true;
      },
    },
    carryingCapacityUnit: {
      validate: (value, formValues) => {
        if (formValues.carryingCapacity && !value) {
          return "Debe seleccionar una unidad cuando hay un valor";
        }
        return true;
      },
    },
    draftForceUnit: {
      validate: (value, formValues) => {
        if (formValues.draftForce && !value) {
          return "Debe seleccionar una unidad cuando hay un valor";
        }
        return true;
      },
    },
    maxOperatingAltitudeUnit: {
      validate: (value, formValues) => {
        if (formValues.maxOperatingAltitude && !value) {
          return "Debe seleccionar una unidad cuando hay un valor";
        }
        return true;
      },
    },
    airConditioningConsumptionUnit: {
      validate: (value, formValues) => {
        if (formValues.airConditioningConsumption && !value) {
          return "Debe seleccionar una unidad cuando hay un valor";
        }
        return true;
      },
    },
    maxHydraulicPressureUnit: {
      validate: (value, formValues) => {
        if (formValues.maxHydraulicPressure && !value) {
          return "Debe seleccionar una unidad cuando hay un valor";
        }
        return true;
      },
    },
    hydraulicPumpFlowRateUnit: {
      validate: (value, formValues) => {
        if (formValues.hydraulicPumpFlowRate && !value) {
          return "Debe seleccionar una unidad cuando hay un valor";
        }
        return true;
      },
    },
    hydraulicReservoirCapacityUnit: {
      validate: (value, formValues) => {
        if (formValues.hydraulicReservoirCapacity && !value) {
          return "Debe seleccionar una unidad cuando hay un valor";
        }
        return true;
      },
    },

    // Validación especial para performanceUnit cuando hay valores de performance
    performanceUnit: {
      required: "La unidad de rendimiento es obligatoria",
      validate: (value, formValues) => {
        if (
          (formValues.performanceMin || formValues.performanceMax) &&
          !value
        ) {
          return "Debe seleccionar una unidad cuando hay valores de rendimiento";
        }
        return true;
      },
    },
  };

  // Componente para el header de cada sección
  const SectionHeader = ({ title, sectionKey, isExpanded }) => (
    <button
      type="button"
      onClick={() => toggleSection(sectionKey)}
      className="w-full grid grid-cols-[1fr_auto] items-center p-4 transition-colors rounded-theme-lg"
      style={{
        backgroundColor: "var(--color-surface)",
        borderRadius: "var(--border-radius-lg)",
        border: `1px solid var(--color-border)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--color-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--color-surface)";
      }}
      aria-label={`${isExpanded ? "Collapse" : "Expand"} ${title} Section`}
    >
      <span
        className="font-theme-medium text-left"
        style={{ color: "var(--color-text)" }}
      >
        {title}
      </span>
      {isExpanded ? (
        <FaChevronUp
          className="w-5 h-5"
          style={{ color: "var(--color-text-secondary)" }}
        />
      ) : (
        <FaChevronDown
          className="w-5 h-5"
          style={{ color: "var(--color-text-secondary)" }}
        />
      )}
    </button>
  );

  return (
    <div className="space-y-4" id="step-3-specific-data">
      <div>
        <h3
          className="text-theme-lg font-theme-semibold mb-2"
          style={{ color: "var(--color-text)" }}
        >
          Ficha Técnica Específica
        </h3>
        <p
          className="text-theme-sm mb-4"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Ingrese las especificaciones técnicas y datos de rendimiento de la
          maquinaria. Los campos marcados con * son obligatorios.
        </p>
      </div>

      {/* Motor y Transmisión */}
      <div
        className="rounded-theme-lg overflow-hidden"
        style={{ border: `1px solid var(--color-border)` }}
      >
        <SectionHeader
          title="Motor y Transmisión"
          sectionKey="engineTransmission"
          isExpanded={expandedSections.engineTransmission}
        />
        {expandedSections.engineTransmission && (
          <div
            className="p-4 space-y-4"
            style={{ backgroundColor: "var(--color-background)" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Potencia del motor */}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div>
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Potencia del Motor *
                  </label>
                  <input
                    aria-label="Engine Power Input"
                    type="number"
                    step="0.1"
                    {...register("enginePower", validationRules.enginePower)}
                    placeholder="Valor"
                    className="parametrization-input"
                    onBlur={async () => {
                      const value = watch("tankCapacity");
                      const unitValue = watch("tankCapacityUnit");
                      if (value && !unitValue) {
                        await trigger("tankCapacityUnit");
                      }
                    }}
                  />
                  {errors.enginePower && (
                    <span
                      className="text-theme-xs mt-1 block"
                      style={{ color: "var(--color-error)" }}
                    >
                      {errors.enginePower.message}
                    </span>
                  )}
                </div>
                <div className="w-24">
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    &nbsp;
                  </label>
                  <select
                    aria-label="Engine Power Unit Select"
                    {...register(
                      "enginePowerUnit",
                      validationRules.enginePowerUnit
                    )}
                    className="parametrization-input"
                  >
                    <option value="">Unidad</option>
                    {powerUnitsList.map((unit) => (
                      <option key={unit.id_units} value={unit.id_units}>
                        {unit.symbol}
                      </option>
                    ))}
                  </select>
                  {errors.enginePowerUnit && (
                    <span
                      className="text-theme-xs mt-1 block"
                      style={{ color: "var(--color-error)" }}
                    >
                      {errors.enginePowerUnit.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Tipo de motor */}
              <div>
                <label
                  className="block text-theme-sm font-theme-medium mb-1"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Tipo de Motor *
                </label>
                <select
                  aria-label="Engine Type Select"
                  {...register("engineType", validationRules.engineType)}
                  className="parametrization-input"
                >
                  <option value="">Seleccionar tipo</option>
                  {engineTypesList.map((type) => (
                    <option key={type.id_types} value={type.id_types}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {errors.engineType && (
                  <span
                    className="text-theme-xs mt-1 block"
                    style={{ color: "var(--color-error)" }}
                  >
                    {errors.engineType.message}
                  </span>
                )}
              </div>

              {/* Cilindraje */}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div>
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Cilindraje *
                  </label>
                  <input
                    aria-label="Cylinder Capacity Input"
                    type="number"
                    step="1"
                    {...register(
                      "cylinderCapacity",
                      validationRules.cylinderCapacity
                    )}
                    placeholder="Valor"
                    className="parametrization-input"
                  />
                  {errors.cylinderCapacity && (
                    <span
                      className="text-theme-xs mt-1 block"
                      style={{ color: "var(--color-error)" }}
                    >
                      {errors.cylinderCapacity.message}
                    </span>
                  )}
                </div>
                <div className="w-20">
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    &nbsp;
                  </label>
                  <select
                    aria-label="Cylinder Capacity Unit Select"
                    {...register(
                      "cylinderCapacityUnit",
                      validationRules.cylinderCapacityUnit
                    )}
                    className="parametrization-input"
                  >
                    <option value="">Unidad</option>
                    {volumeUnitsList.map((unit) => (
                      <option key={unit.id_units} value={unit.id_units}>
                        {unit.symbol}
                      </option>
                    ))}
                  </select>
                  {errors.cylinderCapacityUnit && (
                    <span
                      className="text-theme-xs mt-1 block"
                      style={{ color: "var(--color-error)" }}
                    >
                      {errors.cylinderCapacityUnit.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Número de cilindros */}
              <div>
                <label
                  className="block text-theme-sm font-theme-medium mb-1"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Número de Cilindros *
                </label>
                <input
                  aria-label="Cylinders Number Input"
                  type="number"
                  min="1"
                  max="32"
                  {...register(
                    "cylindersNumber",
                    validationRules.cylindersNumber
                  )}
                  placeholder="Número"
                  className="parametrization-input"
                />
                {errors.cylindersNumber && (
                  <span
                    className="text-theme-xs mt-1 block"
                    style={{ color: "var(--color-error)" }}
                  >
                    {errors.cylindersNumber.message}
                  </span>
                )}
              </div>

              {/* Disposición */}
              <div>
                <label
                  className="block text-theme-sm font-theme-medium mb-1"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Disposición *
                </label>
                <select
                  aria-label="Arrangement Select"
                  {...register("arrangement", validationRules.arrangement)}
                  className="parametrization-input"
                >
                  <option value="">Seleccionar disposición</option>
                  {cylinderArrangementList.map((arrangement) => (
                    <option
                      key={arrangement.id_types}
                      value={arrangement.id_types}
                    >
                      {arrangement.name}
                    </option>
                  ))}
                </select>
                {errors.arrangement && (
                  <span
                    className="text-theme-xs mt-1 block"
                    style={{ color: "var(--color-error)" }}
                  >
                    {errors.arrangement.message}
                  </span>
                )}
              </div>

              {/* Tracción */}
              <div>
                <label
                  className="block text-theme-sm font-theme-medium mb-1"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Tracción
                </label>
                <select
                  aria-label="Traction Select"
                  {...register("traction")}
                  className="parametrization-input"
                >
                  <option value="">Seleccionar tracción</option>
                  {tractionTypesList.map((traction) => (
                    <option key={traction.id_types} value={traction.id_types}>
                      {traction.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Consumo de combustible */}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div>
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Consumo de Combustible *
                  </label>
                  <input
                    aria-label="Fuel Consumption Input"
                    type="number"
                    step="0.1"
                    {...register(
                      "fuelConsumption",
                      validationRules.fuelConsumption
                    )}
                    placeholder="Valor"
                    className="parametrization-input"
                  />
                  {errors.fuelConsumption && (
                    <span
                      className="text-theme-xs mt-1 block"
                      style={{ color: "var(--color-error)" }}
                    >
                      {errors.fuelConsumption.message}
                    </span>
                  )}
                </div>
                <div className="w-24">
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    &nbsp;
                  </label>
                  <select
                    aria-label="Fuel Consumption Unit Select"
                    {...register(
                      "fuelConsumptionUnit",
                      validationRules.fuelConsumptionUnit
                    )}
                    className="parametrization-input"
                  >
                    <option value="">Unidad</option>
                    {flowConsumptionUnitsList.map((unit) => (
                      <option key={unit.id_units} value={unit.id_units}>
                        {unit.symbol}
                      </option>
                    ))}
                  </select>
                  {errors.fuelConsumptionUnit && (
                    <span
                      className="text-theme-xs mt-1 block"
                      style={{ color: "var(--color-error)" }}
                    >
                      {errors.fuelConsumptionUnit.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Sistema de transmisión */}
              <div>
                <label
                  className="block text-theme-sm font-theme-medium mb-1"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Sistema de Transmisión *
                </label>
                <select
                  aria-label="Transmission System Select"
                  {...register(
                    "transmissionSystem",
                    validationRules.transmissionSystem
                  )}
                  className="parametrization-input"
                >
                  <option value="">Seleccionar transmisión</option>
                  {transmissionSystemList.map((system) => (
                    <option key={system.id_types} value={system.id_types}>
                      {system.name}
                    </option>
                  ))}
                </select>
                {errors.transmissionSystem && (
                  <span
                    className="text-theme-xs mt-1 block"
                    style={{ color: "var(--color-error)" }}
                  >
                    {errors.transmissionSystem.message}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Capacidad y Rendimiento */}
      <div
        className="rounded-theme-lg overflow-hidden"
        style={{ border: `1px solid var(--color-border)` }}
      >
        <SectionHeader
          title="Capacidad y Rendimiento"
          sectionKey="capacityPerformance"
          isExpanded={expandedSections.capacityPerformance}
        />
        {expandedSections.capacityPerformance && (
          <div
            className="p-4 space-y-4"
            style={{ backgroundColor: "var(--color-background)" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Capacidad del tanque */}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div>
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Capacidad del Tanque
                  </label>
                  <input
                    aria-label="Tank Capacity Input"
                    type="number"
                    step="0.1"
                    {...register("tankCapacity", validationRules.tankCapacity)}
                    placeholder="Valor"
                    className="parametrization-input"
                  />
                  {errors.tankCapacity && (
                    <span
                      className="text-theme-xs mt-1 block"
                      style={{ color: "var(--color-error)" }}
                    >
                      {errors.tankCapacity.message}
                    </span>
                  )}
                </div>
                <div className="w-24">
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    &nbsp;
                  </label>
                  <select
                    aria-label="Tank Capacity Unit Select"
                    {...register("tankCapacityUnit")}
                    className="parametrization-input"
                  >
                    <option value="">Unidad</option>
                    {volumeUnitsList.map((unit) => (
                      <option key={unit.id_units} value={unit.id_units}>
                        {unit.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Capacidad de carga */}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div>
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Capacidad de Carga
                  </label>
                  <input
                    aria-label="Carrying Capacity Input"
                    type="number"
                    step="0.1"
                    {...register(
                      "carryingCapacity",
                      validationRules.carryingCapacity
                    )}
                    placeholder="Valor"
                    className="parametrization-input"
                    onBlur={async () => {
                      const value = watch("carryingCapacity");
                      const unitValue = watch("carryingCapacityUnit");
                      if (value && !unitValue) {
                        await trigger("carryingCapacityUnit");
                      }
                    }}
                  />
                  {errors.carryingCapacity && (
                    <span
                      className="text-theme-xs mt-1 block"
                      style={{ color: "var(--color-error)" }}
                    >
                      {errors.carryingCapacity.message}
                    </span>
                  )}
                </div>
                <div className="w-24">
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    &nbsp;
                  </label>
                  <select
                    aria-label="Carrying Capacity Unit Select"
                    {...register("carryingCapacityUnit")}
                    className="parametrization-input"
                  >
                    <option value="">Unidad</option>
                    {weightUnitsList.map((unit) => (
                      <option key={unit.id_units} value={unit.id_units}>
                        {unit.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fuerza de tiro */}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div>
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Fuerza de Tiro
                  </label>
                  <input
                    aria-label="Draft Force Input"
                    type="number"
                    step="0.1"
                    {...register("draftForce", validationRules.draftForce)}
                    placeholder="Valor"
                    className="parametrization-input"
                    onBlur={async () => {
                      const value = watch("draftForce");
                      const unitValue = watch("draftForceUnit");
                      if (value && !unitValue) {
                        await trigger("draftForceUnit");
                      }
                    }}
                  />
                  {errors.draftForce && (
                    <span
                      className="text-theme-xs mt-1 block"
                      style={{ color: "var(--color-error)" }}
                    >
                      {errors.draftForce.message}
                    </span>
                  )}
                </div>
                <div className="w-24">
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    &nbsp;
                  </label>
                  <select
                    aria-label="Draft Force Unit Select"
                    {...register("draftForceUnit")}
                    className="parametrization-input"
                  >
                    <option value="">Unidad</option>
                    {forceUnitsList.map((unit) => (
                      <option key={unit.id_units} value={unit.id_units}>
                        {unit.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Peso operativo */}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div>
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Peso Operativo *
                  </label>
                  <input
                    aria-label="Operating Weight Input"
                    type="number"
                    step="0.1"
                    {...register(
                      "operatingWeight",
                      validationRules.operatingWeight
                    )}
                    placeholder="Valor"
                    className="parametrization-input"
                  />
                  {errors.operatingWeight && (
                    <span
                      className="text-theme-xs mt-1 block"
                      style={{ color: "var(--color-error)" }}
                    >
                      {errors.operatingWeight.message}
                    </span>
                  )}
                </div>
                <div className="w-24">
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    &nbsp;
                  </label>
                  <select
                    aria-label="Operating Weight Unit Select"
                    {...register(
                      "operatingWeightUnit",
                      validationRules.operatingWeightUnit
                    )}
                    className="parametrization-input"
                  >
                    <option value="">Unidad</option>
                    {weightUnitsList.map((unit) => (
                      <option key={unit.id_units} value={unit.id_units}>
                        {unit.symbol}
                      </option>
                    ))}
                  </select>
                  {errors.operatingWeightUnit && (
                    <span
                      className="text-theme-xs mt-1 block"
                      style={{ color: "var(--color-error)" }}
                    >
                      {errors.operatingWeightUnit.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Velocidad máxima */}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div>
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Velocidad Máxima *
                  </label>
                  <input
                    aria-label="Max Speed Input"
                    type="number"
                    step="0.1"
                    {...register("maxSpeed", validationRules.maxSpeed)}
                    placeholder="Valor"
                    className="parametrization-input"
                  />
                  {errors.maxSpeed && (
                    <span
                      className="text-theme-xs mt-1 block"
                      style={{ color: "var(--color-error)" }}
                    >
                      {errors.maxSpeed.message}
                    </span>
                  )}
                </div>
                <div className="w-28">
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    &nbsp;
                  </label>
                  <select
                    aria-label="Max Speed Unit Select"
                    {...register("maxSpeedUnit", validationRules.maxSpeedUnit)}
                    className="parametrization-input"
                  >
                    <option value="">Unidad</option>
                    {speedUnitsList.map((unit) => (
                      <option key={unit.id_units} value={unit.id_units}>
                        {unit.symbol}
                      </option>
                    ))}
                  </select>
                  {errors.maxSpeedUnit && (
                    <span
                      className="text-theme-xs mt-1 block"
                      style={{ color: "var(--color-error)" }}
                    >
                      {errors.maxSpeedUnit.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Altitud máxima */}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div>
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Altitud Máxima de Operación
                  </label>
                  <input
                    aria-label="Max Operating Altitude Input"
                    type="number"
                    {...register(
                      "maxOperatingAltitude",
                      validationRules.maxOperatingAltitude
                    )}
                    placeholder="Valor"
                    className="parametrization-input"
                    onBlur={async () => {
                      const value = watch("maxOperatingAltitude");
                      const unitValue = watch("maxOperatingAltitudeUnit");
                      if (value && !unitValue) {
                        await trigger("maxOperatingAltitudeUnit");
                      }
                    }}
                  />
                  {errors.maxOperatingAltitude && (
                    <span
                      className="text-theme-xs mt-1 block"
                      style={{ color: "var(--color-error)" }}
                    >
                      {errors.maxOperatingAltitude.message}
                    </span>
                  )}
                </div>
                <div className="w-28">
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    &nbsp;
                  </label>
                  <select
                    aria-label="Max Operating Altitude Unit Select"
                    {...register("maxOperatingAltitudeUnit")}
                    className="parametrization-input"
                  >
                    <option value="">Unidad</option>
                    {dimensionUnitsList.map((unit) => (
                      <option key={unit.id_units} value={unit.id_units}>
                        {unit.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rendimiento RPM */}
              <div className="col-span-full">
                <label
                  className="block text-theme-sm font-theme-medium mb-1"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Rendimiento (RPM) *
                </label>

                <div className="mb-2">
                  <select
                    aria-label="Performance Unit Select"
                    {...register(
                      "performanceUnit",
                      validationRules.performanceUnit
                    )}
                    className="parametrization-input w-48"
                  >
                    <option value="">Seleccionar unidad</option>
                    {performanceUnitsList.map((unit) => (
                      <option key={unit.id_units} value={unit.id_units}>
                        {unit.symbol}
                      </option>
                    ))}
                  </select>
                  {errors.performanceUnit && (
                    <span
                      className="text-theme-xs mt-1 block"
                      style={{ color: "var(--color-error)" }}
                    >
                      {errors.performanceUnit.message}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-4 items-center">
                  <span
                    className="text-theme-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Mín:
                  </span>
                  <div>
                    <input
                      aria-label="Performance Min Input"
                      type="number"
                      {...register(
                        "performanceMin",
                        validationRules.performanceMin
                      )}
                      placeholder="Valor"
                      className="parametrization-input"
                      onBlur={async () => {
                        const minValue = watch("performanceMin");
                        const maxValue = watch("performanceMax");
                        const unitValue = watch("performanceUnit");

                        if ((minValue || maxValue) && !unitValue) {
                          await trigger("performanceUnit");
                        }
                        if (minValue && maxValue) {
                          await trigger("performanceMax");
                        }
                      }}
                    />
                    {errors.performanceMin && (
                      <span
                        className="text-theme-xs mt-1 block"
                        style={{ color: "var(--color-error)" }}
                      >
                        {errors.performanceMin.message}
                      </span>
                    )}
                  </div>
                  <span
                    className="text-theme-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Máx:
                  </span>
                  <div>
                    <input
                      aria-label="Performance Max Input"
                      type="number"
                      {...register(
                        "performanceMax",
                        validationRules.performanceMax
                      )}
                      placeholder="Valor"
                      className="parametrization-input"
                      onBlur={async () => {
                        const minValue = watch("performanceMin");
                        const maxValue = watch("performanceMax");
                        const unitValue = watch("performanceUnit");

                        if ((minValue || maxValue) && !unitValue) {
                          await trigger("performanceUnit");
                        }
                        if (minValue && maxValue) {
                          await trigger("performanceMin");
                        }
                      }}
                    />
                    {errors.performanceMax && (
                      <span
                        className="text-theme-xs mt-1 block"
                        style={{ color: "var(--color-error)" }}
                      >
                        {errors.performanceMax.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dimensiones y Peso */}
      <div
        className="rounded-theme-lg overflow-hidden"
        style={{ border: `1px solid var(--color-border)` }}
      >
        <SectionHeader
          title="Dimensiones y Peso"
          sectionKey="dimensionsWeight"
          isExpanded={expandedSections.dimensionsWeight}
        />
        {expandedSections.dimensionsWeight && (
          <div
            className="p-4 space-y-4"
            style={{ backgroundColor: "var(--color-background)" }}
          >
            <div className="space-y-4">
              {/* Unidad de dimensiones */}
              <div>
                <label
                  className="block text-theme-sm font-theme-medium mb-1"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Unidad de Dimensiones *
                </label>
                <select
                  aria-label="Dimensions Unit Select"
                  {...register(
                    "dimensionsUnit",
                    validationRules.dimensionsUnit
                  )}
                  className="parametrization-input w-32"
                >
                  <option value="">Unidad</option>
                  {dimensionUnitsList.map((unit) => (
                    <option key={unit.id_units} value={unit.id_units}>
                      {unit.symbol}
                    </option>
                  ))}
                </select>
                {errors.dimensionsUnit && (
                  <span
                    className="text-theme-xs mt-1 block"
                    style={{ color: "var(--color-error)" }}
                  >
                    {errors.dimensionsUnit.message}
                  </span>
                )}
              </div>

              {/* Dimensiones */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Ancho *
                  </label>
                  <input
                    aria-label="Width Input"
                    type="number"
                    step="0.01"
                    {...register("width", validationRules.width)}
                    placeholder="Valor"
                    className="parametrization-input"
                  />
                  {errors.width && (
                    <span
                      className="text-theme-xs mt-1 block"
                      style={{ color: "var(--color-error)" }}
                    >
                      {errors.width.message}
                    </span>
                  )}
                </div>

                <div>
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Largo *
                  </label>
                  <input
                    aria-label="Length Input"
                    type="number"
                    step="0.01"
                    {...register("length", validationRules.length)}
                    placeholder="Valor"
                    className="parametrization-input"
                  />
                  {errors.length && (
                    <span
                      className="text-theme-xs mt-1 block"
                      style={{ color: "var(--color-error)" }}
                    >
                      {errors.length.message}
                    </span>
                  )}
                </div>

                <div>
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Alto *
                  </label>
                  <input
                    aria-label="Height Input"
                    type="number"
                    step="0.01"
                    {...register("height", validationRules.height)}
                    placeholder="Valor"
                    className="parametrization-input"
                  />
                  {errors.height && (
                    <span
                      className="text-theme-xs mt-1 block"
                      style={{ color: "var(--color-error)" }}
                    >
                      {errors.height.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Peso neto */}
              <div className="grid grid-cols-[1fr_auto] gap-2 max-w-sm">
                <div>
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Peso Neto *
                  </label>
                  <input
                    aria-label="Net Weight Input"
                    type="number"
                    step="0.1"
                    {...register("netWeight", validationRules.netWeight)}
                    placeholder="Valor"
                    className="parametrization-input"
                  />
                  {errors.netWeight && (
                    <span
                      className="text-theme-xs mt-1 block"
                      style={{ color: "var(--color-error)" }}
                    >
                      {errors.netWeight.message}
                    </span>
                  )}
                </div>
                <div className="w-24">
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    &nbsp;
                  </label>
                  <select
                    aria-label="Net Weight Unit Select"
                    {...register(
                      "netWeightUnit",
                      validationRules.netWeightUnit
                    )}
                    className="parametrization-input"
                  >
                    <option value="">Unidad</option>
                    {weightUnitsList.map((unit) => (
                      <option key={unit.id_units} value={unit.id_units}>
                        {unit.symbol}
                      </option>
                    ))}
                  </select>
                  {errors.netWeightUnit && (
                    <span
                      className="text-theme-xs mt-1 block"
                      style={{ color: "var(--color-error)" }}
                    >
                      {errors.netWeightUnit.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sistemas Auxiliares e Hidráulicos */}
      <div
        className="rounded-theme-lg overflow-hidden"
        style={{ border: `1px solid var(--color-border)` }}
      >
        <SectionHeader
          title="Sistemas Auxiliares e Hidráulicos"
          sectionKey="auxiliaryHydraulic"
          isExpanded={expandedSections.auxiliaryHydraulic}
        />
        {expandedSections.auxiliaryHydraulic && (
          <div
            className="p-4 space-y-4"
            style={{ backgroundColor: "var(--color-background)" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Climatización */}
              <div>
                <label
                  className="block text-theme-sm font-theme-medium mb-1"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Climatización
                </label>
                <select
                  aria-label="Air Conditioning Select"
                  {...register("airConditioning")}
                  className="parametrization-input"
                >
                  <option value="">Seleccionar tipo</option>
                  {airConditioningList.map((type) => (
                    <option key={type.id_types} value={type.id_types}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Consumo climatización */}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div>
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Consumo de Climatización
                  </label>
                  <input
                    aria-label="Air Conditioning Consumption Input"
                    type="number"
                    step="0.1"
                    {...register(
                      "airConditioningConsumption",
                      validationRules.airConditioningConsumption
                    )}
                    placeholder="Valor"
                    className="parametrization-input"
                    onBlur={async () => {
                      const value = watch("airConditioningConsumption");
                      const unitValue = watch("airConditioningConsumptionUnit");
                      if (value && !unitValue) {
                        await trigger("airConditioningConsumptionUnit");
                      }
                    }}
                  />
                  {errors.airConditioningConsumption && (
                    <span
                      className="text-theme-xs mt-1 block"
                      style={{ color: "var(--color-error)" }}
                    >
                      {errors.airConditioningConsumption.message}
                    </span>
                  )}
                </div>
                <div className="w-28">
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    &nbsp;
                  </label>
                  <select
                    aria-label="Air Conditioning Consumption Unit Select"
                    {...register("airConditioningConsumptionUnit")}
                    className="parametrization-input"
                  >
                    <option value="">Unidad</option>
                    {flowConsumptionUnitsList.map((unit) => (
                      <option key={unit.id_units} value={unit.id_units}>
                        {unit.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Presión hidráulica */}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div>
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Presión Hidráulica Máxima
                  </label>
                  <input
                    aria-label="Max Hydraulic Pressure Input"
                    type="number"
                    step="0.1"
                    {...register(
                      "maxHydraulicPressure",
                      validationRules.maxHydraulicPressure
                    )}
                    placeholder="Valor"
                    className="parametrization-input"
                    onBlur={async () => {
                      const value = watch("maxHydraulicPressure");
                      const unitValue = watch("maxHydraulicPressureUnit");
                      if (value && !unitValue) {
                        await trigger("maxHydraulicPressureUnit");
                      }
                    }}
                  />
                  {errors.maxHydraulicPressure && (
                    <span
                      className="text-theme-xs mt-1 block"
                      style={{ color: "var(--color-error)" }}
                    >
                      {errors.maxHydraulicPressure.message}
                    </span>
                  )}
                </div>
                <div className="w-24">
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    &nbsp;
                  </label>
                  <select
                    aria-label="Max Hydraulic Pressure Unit Select"
                    {...register("maxHydraulicPressureUnit")}
                    className="parametrization-input"
                  >
                    <option value="">Unidad</option>
                    {pressureUnitsList.map((unit) => (
                      <option key={unit.id_units} value={unit.id_units}>
                        {unit.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Caudal bomba hidráulica */}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div>
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Caudal de Bomba Hidráulica
                  </label>
                  <input
                    aria-label="Hydraulic Pump Flow Rate Input"
                    type="number"
                    step="0.1"
                    {...register(
                      "hydraulicPumpFlowRate",
                      validationRules.hydraulicPumpFlowRate
                    )}
                    placeholder="Valor"
                    className="parametrization-input"
                    onBlur={async () => {
                      const value = watch("hydraulicPumpFlowRate");
                      const unitValue = watch("hydraulicPumpFlowRateUnit");
                      if (value && !unitValue) {
                        await trigger("hydraulicPumpFlowRateUnit");
                      }
                    }}
                  />
                  {errors.hydraulicPumpFlowRate && (
                    <span
                      className="text-theme-xs mt-1 block"
                      style={{ color: "var(--color-error)" }}
                    >
                      {errors.hydraulicPumpFlowRate.message}
                    </span>
                  )}
                </div>
                <div className="w-28">
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    &nbsp;
                  </label>
                  <select
                    aria-label="Hydraulic Pump Flow Rate Unit Select"
                    {...register("hydraulicPumpFlowRateUnit")}
                    className="parametrization-input"
                  >
                    <option value="">Unidad</option>
                    {flowConsumptionUnitsList.map((unit) => (
                      <option key={unit.id_units} value={unit.id_units}>
                        {unit.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Capacidad depósito hidráulico */}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div>
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Capacidad del Depósito Hidráulico
                  </label>
                  <input
                    aria-label="Hydraulic Reservoir Capacity Input"
                    type="number"
                    step="0.1"
                    {...register(
                      "hydraulicReservoirCapacity",
                      validationRules.hydraulicReservoirCapacity
                    )}
                    placeholder="Valor"
                    className="parametrization-input"
                    onBlur={async () => {
                      const value = watch("hydraulicReservoirCapacity");
                      const unitValue = watch("hydraulicReservoirCapacityUnit");
                      if (value && !unitValue) {
                        await trigger("hydraulicReservoirCapacityUnit");
                      }
                    }}
                  />
                  {errors.hydraulicReservoirCapacity && (
                    <span
                      className="text-theme-xs mt-1 block"
                      style={{ color: "var(--color-error)" }}
                    >
                      {errors.hydraulicReservoirCapacity.message}
                    </span>
                  )}
                </div>
                <div className="w-24">
                  <label
                    className="block text-theme-sm font-theme-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    &nbsp;
                  </label>
                  <select
                    aria-label="Hydraulic Reservoir Capacity Unit Select"
                    {...register("hydraulicReservoirCapacityUnit")}
                    className="parametrization-input"
                  >
                    <option value="">Unidad</option>
                    {volumeUnitsList.map((unit) => (
                      <option key={unit.id_units} value={unit.id_units}>
                        {unit.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Normatividad y Seguridad */}
      <div
        className="rounded-theme-lg overflow-hidden"
        style={{ border: `1px solid var(--color-border)` }}
      >
        <SectionHeader
          title="Normatividad y Seguridad"
          sectionKey="regulationsSafety"
          isExpanded={expandedSections.regulationsSafety}
        />
        {expandedSections.regulationsSafety && (
          <div
            className="p-4 space-y-4"
            style={{ backgroundColor: "var(--color-background)" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nivel de emisiones */}
              <div>
                <label
                  className="block text-theme-sm font-theme-medium mb-1"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Nivel de Emisiones
                </label>
                <select
                  aria-label="Emission Level Select"
                  {...register("emissionLevel")}
                  className="parametrization-input"
                >
                  <option value="">Seleccionar nivel</option>
                  {emissionLevelList.map((level) => (
                    <option key={level.id_types} value={level.id_types}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de cabina */}
              <div>
                <label
                  className="block text-theme-sm font-theme-medium mb-1"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Tipo de Cabina
                </label>
                <select
                  aria-label="Cabin Type Select"
                  {...register("cabinType")}
                  className="parametrization-input"
                >
                  <option value="">Seleccionar tipo</option>
                  {cabinTypesList.map((type) => (
                    <option key={type.id_types} value={type.id_types}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mensaje informativo sobre validaciones */}
      <div
        className="p-3 rounded-theme-md text-theme-sm"
        style={{
          backgroundColor: "var(--color-info-bg)",
          color: "var(--color-info)",
          border: `1px solid var(--color-info-border)`,
        }}
      >
        <strong>Nota:</strong> Complete todos los campos obligatorios (*) antes
        de continuar. Los valores numéricos deben estar dentro de los rangos
        permitidos.
      </div>
    </div>
  );
}
