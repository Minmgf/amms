import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useTheme } from "@/contexts/ThemeContext";

export default function Step3SpecificData() {
  const {
    register,
    formState: { errors },
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
          maquinaria.
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
                    {...register("enginePower", { required: "Requerido" })}
                    placeholder="Valor"
                    className="parametrization-input"
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
                    {...register("enginePowerUnit", { required: "Requerido" })}
                    className="parametrization-input"
                  >
                    <option value="HP">HP</option>
                    <option value="CV">CV</option>
                    <option value="kW">kW</option>
                  </select>
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
                  {...register("engineType", { required: "Requerido" })}
                  className="parametrization-input"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="diesel">Diésel</option>
                  <option value="gasoline">Gasolina</option>
                  <option value="electric">Eléctrico</option>
                  <option value="hybrid">Híbrido</option>
                  <option value="lpg">Gas LP</option>
                  <option value="hydrogen">Hidrógeno</option>
                  <option value="other">Otro</option>
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
                    {...register("cylinderCapacity", { required: "Requerido" })}
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
                    {...register("cylinderCapacityUnit", {
                      required: "Requerido",
                    })}
                    className="parametrization-input"
                  >
                    <option value="cc">cc</option>
                    <option value="ci">ci</option>
                  </select>
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
                  {...register("cylindersNumber", { required: "Requerido" })}
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
                  {...register("arrangement", { required: "Requerido" })}
                  className="parametrization-input"
                >
                  <option value="">Seleccionar disposición</option>
                  <option value="L">L (En línea)</option>
                  <option value="V">V</option>
                  <option value="B">B (Boxer)</option>
                  <option value="R">R (Rotativo)</option>
                  <option value="E">E</option>
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
                  <option value="4x2">4x2</option>
                  <option value="4x4">4x4</option>
                  <option value="tracks">Orugas</option>
                  <option value="6x4">6x4</option>
                  <option value="6x6">6x6</option>
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
                    {...register("fuelConsumption", { required: "Requerido" })}
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
                    {...register("fuelConsumptionUnit", {
                      required: "Requerido",
                    })}
                    className="parametrization-input"
                  >
                    <option value="L/h">L/h</option>
                    <option value="km/L">km/L</option>
                    <option value="mpg">mpg</option>
                  </select>
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
                  {...register("transmissionSystem", { required: "Requerido" })}
                  className="parametrization-input"
                >
                  <option value="">Seleccionar transmisión</option>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automática</option>
                  <option value="hydrostatic">Hidrostática</option>
                  <option value="cvt">CVT</option>
                  <option value="other">Otro</option>
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
                    {...register("tankCapacity")}
                    placeholder="Valor"
                    className="parametrization-input"
                  />
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
                    <option value="L">L</option>
                    <option value="gal">Gal</option>
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
                    {...register("carryingCapacity")}
                    placeholder="Valor"
                    className="parametrization-input"
                  />
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
                    <option value="ton">Ton</option>
                    <option value="kg">Kg</option>
                    <option value="lb">Lb</option>
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
                    {...register("draftForce")}
                    placeholder="Valor"
                    className="parametrization-input"
                  />
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
                    <option value="kN">kN</option>
                    <option value="lbf">lbf</option>
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
                    {...register("operatingWeight", { required: "Requerido" })}
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
                    {...register("operatingWeightUnit", {
                      required: "Requerido",
                    })}
                    className="parametrization-input"
                  >
                    <option value="kg">Kg</option>
                    <option value="ton">Ton</option>
                    <option value="lb">Lb</option>
                  </select>
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
                    {...register("maxSpeed", { required: "Requerido" })}
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
                    {...register("maxSpeedUnit", { required: "Requerido" })}
                    className="parametrization-input"
                  >
                    <option value="km/h">Km/h</option>
                    <option value="mph">mph</option>
                  </select>
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
                    {...register("maxOperatingAltitude")}
                    placeholder="Valor"
                    className="parametrization-input"
                  />
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
                    <option value="msnm">msnm</option>
                    <option value="ft">ft</option>
                  </select>
                </div>
              </div>

              {/* Rendimiento RPM */}
              <div className="col-span-full">
                <label
                  className="block text-theme-sm font-theme-medium mb-1"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Rendimiento (RPM)
                </label>
                <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-4 items-center">
                  <span
                    className="text-theme-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Mín:
                  </span>
                  <input
                    aria-label="Performance Min Input"
                    type="number"
                    {...register("performanceMin")}
                    placeholder="Valor"
                    className="parametrization-input"
                  />
                  <span
                    className="text-theme-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Máx:
                  </span>
                  <input
                    aria-label="Performance Max Input"
                    type="number"
                    {...register("performanceMax")}
                    placeholder="Valor"
                    className="parametrization-input"
                  />
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
                  {...register("dimensionsUnit", { required: "Requerido" })}
                  className="parametrization-input w-32"
                >
                  <option value="m">m</option>
                  <option value="ft">ft</option>
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
                    {...register("width", { required: "Requerido" })}
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
                    {...register("length", { required: "Requerido" })}
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
                    {...register("height", { required: "Requerido" })}
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
                    {...register("netWeight", { required: "Requerido" })}
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
                    {...register("netWeightUnit", { required: "Requerido" })}
                    className="parametrization-input"
                  >
                    <option value="kg">Kg</option>
                    <option value="ton">Ton</option>
                    <option value="lb">Lb</option>
                  </select>
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
                  <option value="heating">Calefacción</option>
                  <option value="cooling">Aire Acondicionado</option>
                  <option value="both">Ambos</option>
                  <option value="none">Ninguno</option>
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
                    {...register("airConditioningConsumption")}
                    placeholder="Valor"
                    className="parametrization-input"
                  />
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
                    <option value="kWh">kWh</option>
                    <option value="L/h">L/h</option>
                    <option value="gal/h">gal/h</option>
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
                    {...register("maxHydraulicPressure")}
                    placeholder="Valor"
                    className="parametrization-input"
                  />
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
                    <option value="bar">bar</option>
                    <option value="psi">psi</option>
                    <option value="Pa">Pa</option>
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
                    {...register("hydraulicPumpFlowRate")}
                    placeholder="Valor"
                    className="parametrization-input"
                  />
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
                    <option value="L/min">L/min</option>
                    <option value="gal/min">gal/min</option>
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
                    {...register("hydraulicReservoirCapacity")}
                    placeholder="Valor"
                    className="parametrization-input"
                  />
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
                    <option value="L">L</option>
                    <option value="gal">Gal</option>
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
                  <option value="euro1">Euro 1</option>
                  <option value="euro2">Euro 2</option>
                  <option value="euro3">Euro 3</option>
                  <option value="euro4">Euro 4</option>
                  <option value="euro5">Euro 5</option>
                  <option value="euro6">Euro 6</option>
                  <option value="tier1">Tier 1</option>
                  <option value="tier2">Tier 2</option>
                  <option value="tier3">Tier 3</option>
                  <option value="tier4">Tier 4</option>
                  <option value="phase1">Fase I</option>
                  <option value="phase2">Fase II</option>
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
                  <option value="open">Abierta</option>
                  <option value="closed">Cerrada</option>
                  <option value="rops">ROPS</option>
                  <option value="fops">FOPS</option>
                  <option value="rops-fops">ROPS/FOPS</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
