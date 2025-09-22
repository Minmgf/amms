import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function Step3SpecificData() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

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
      className="w-full grid grid-cols-[1fr_auto] items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg border border-gray-200"
    >
      <span className="font-medium text-gray-800 text-left">{title}</span>
      {isExpanded ? (
        <FaChevronUp className="w-5 h-5 text-gray-600" />
      ) : (
        <FaChevronDown className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-black">
          Ficha Técnica Específica
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Ingrese las especificaciones técnicas y datos de rendimiento de la maquinaria.
        </p>
      </div>

      {/* Motor y Transmisión */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <SectionHeader
          title="Motor y Transmisión"
          sectionKey="engineTransmission"
          isExpanded={expandedSections.engineTransmission}
        />
        {expandedSections.engineTransmission && (
          <div className="p-4 space-y-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Potencia del motor */}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Potencia del Motor *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register("enginePower", { required: "Requerido" })}
                    placeholder="Valor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.enginePower && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.enginePower.message}
                    </span>
                  )}
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    &nbsp;
                  </label>
                  <select
                    {...register("enginePowerUnit", { required: "Requerido" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="HP">HP</option>
                    <option value="CV">CV</option>
                    <option value="kW">kW</option>
                  </select>
                </div>
              </div>

              {/* Tipo de motor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Motor *
                </label>
                <select
                  {...register("engineType", { required: "Requerido" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <span className="text-red-500 text-xs mt-1">
                    {errors.engineType.message}
                  </span>
                )}
              </div>

              {/* Cilindraje */}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cilindraje *
                  </label>
                  <input
                    type="number"
                    step="1"
                    {...register("cylinderCapacity", { required: "Requerido" })}
                    placeholder="Valor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.cylinderCapacity && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.cylinderCapacity.message}
                    </span>
                  )}
                </div>
                <div className="w-20">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    &nbsp;
                  </label>
                  <select
                    {...register("cylinderCapacityUnit", {
                      required: "Requerido",
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cc">cc</option>
                    <option value="ci">ci</option>
                  </select>
                </div>
              </div>

              {/* Número de cilindros */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Cilindros *
                </label>
                <input
                  type="number"
                  {...register("cylindersNumber", { required: "Requerido" })}
                  placeholder="Número"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.cylindersNumber && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.cylindersNumber.message}
                  </span>
                )}
              </div>

              {/* Disposición */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disposición *
                </label>
                <select
                  {...register("arrangement", { required: "Requerido" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar disposición</option>
                  <option value="L">L (En línea)</option>
                  <option value="V">V</option>
                  <option value="B">B (Boxer)</option>
                  <option value="R">R (Rotativo)</option>
                  <option value="E">E</option>
                </select>
                {errors.arrangement && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.arrangement.message}
                  </span>
                )}
              </div>

              {/* Tracción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tracción
                </label>
                <select
                  {...register("traction")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consumo de Combustible *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register("fuelConsumption", { required: "Requerido" })}
                    placeholder="Valor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.fuelConsumption && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.fuelConsumption.message}
                    </span>
                  )}
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    &nbsp;
                  </label>
                  <select
                    {...register("fuelConsumptionUnit", {
                      required: "Requerido",
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="L/h">L/h</option>
                    <option value="km/L">km/L</option>
                    <option value="mpg">mpg</option>
                  </select>
                </div>
              </div>

              {/* Sistema de transmisión */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sistema de Transmisión *
                </label>
                <select
                  {...register("transmissionSystem", { required: "Requerido" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar transmisión</option>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automática</option>
                  <option value="hydrostatic">Hidrostática</option>
                  <option value="cvt">CVT</option>
                  <option value="other">Otro</option>
                </select>
                {errors.transmissionSystem && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.transmissionSystem.message}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Capacidad y Rendimiento */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <SectionHeader
          title="Capacidad y Rendimiento"
          sectionKey="capacityPerformance"
          isExpanded={expandedSections.capacityPerformance}
        />
        {expandedSections.capacityPerformance && (
          <div className="p-4 space-y-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Capacidad del tanque */}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacidad del Tanque
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register("tankCapacity")}
                    placeholder="Valor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    &nbsp;
                  </label>
                  <select
                    {...register("tankCapacityUnit")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="L">L</option>
                    <option value="gal">Gal</option>
                  </select>
                </div>
              </div>

              {/* Capacidad de carga */}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacidad de Carga
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register("carryingCapacity")}
                    placeholder="Valor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    &nbsp;
                  </label>
                  <select
                    {...register("carryingCapacityUnit")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuerza de Tiro
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register("draftForce")}
                    placeholder="Valor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    &nbsp;
                  </label>
                  <select
                    {...register("draftForceUnit")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="kN">kN</option>
                    <option value="lbf">lbf</option>
                  </select>
                </div>
              </div>

              {/* Peso operativo */}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peso Operativo *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register("operatingWeight", { required: "Requerido" })}
                    placeholder="Valor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.operatingWeight && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.operatingWeight.message}
                    </span>
                  )}
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    &nbsp;
                  </label>
                  <select
                    {...register("operatingWeightUnit", {
                      required: "Requerido",
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Velocidad Máxima *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register("maxSpeed", { required: "Requerido" })}
                    placeholder="Valor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.maxSpeed && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.maxSpeed.message}
                    </span>
                  )}
                </div>
                <div className="w-28">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    &nbsp;
                  </label>
                  <select
                    {...register("maxSpeedUnit", { required: "Requerido" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="km/h">Km/h</option>
                    <option value="mph">mph</option>
                  </select>
                </div>
              </div>

              {/* Altitud máxima */}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Altitud Máxima de Operación
                  </label>
                  <input
                    type="number"
                    {...register("maxOperatingAltitude")}
                    placeholder="Valor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-28">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    &nbsp;
                  </label>
                  <select
                    {...register("maxOperatingAltitudeUnit")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="msnm">msnm</option>
                    <option value="ft">ft</option>
                  </select>
                </div>
              </div>

              {/* Rendimiento RPM */}
              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rendimiento (RPM)
                </label>
                <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-4 items-center">
                  <span className="text-sm text-gray-600">Mín:</span>
                  <input
                    type="number"
                    {...register("performanceMin")}
                    placeholder="Valor"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Máx:</span>
                  <input
                    type="number"
                    {...register("performanceMax")}
                    placeholder="Valor"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dimensiones y Peso */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <SectionHeader
          title="Dimensiones y Peso"
          sectionKey="dimensionsWeight"
          isExpanded={expandedSections.dimensionsWeight}
        />
        {expandedSections.dimensionsWeight && (
          <div className="p-4 space-y-4 bg-white">
            <div className="space-y-4">
              {/* Unidad de dimensiones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidad de Dimensiones *
                </label>
                <select
                  {...register("dimensionsUnit", { required: "Requerido" })}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="m">m</option>
                  <option value="ft">ft</option>
                </select>
                {errors.dimensionsUnit && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.dimensionsUnit.message}
                  </span>
                )}
              </div>

              {/* Dimensiones */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ancho *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("width", { required: "Requerido" })}
                    placeholder="Valor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.width && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.width.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Largo *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("length", { required: "Requerido" })}
                    placeholder="Valor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.length && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.length.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alto *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("height", { required: "Requerido" })}
                    placeholder="Valor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.height && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.height.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Peso neto */}
              <div className="grid grid-cols-[1fr_auto] gap-2 max-w-sm">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peso Neto *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register("netWeight", { required: "Requerido" })}
                    placeholder="Valor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.netWeight && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.netWeight.message}
                    </span>
                  )}
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    &nbsp;
                  </label>
                  <select
                    {...register("netWeightUnit", { required: "Requerido" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <SectionHeader
          title="Sistemas Auxiliares e Hidráulicos"
          sectionKey="auxiliaryHydraulic"
          isExpanded={expandedSections.auxiliaryHydraulic}
        />
        {expandedSections.auxiliaryHydraulic && (
          <div className="p-4 space-y-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Climatización */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Climatización
                </label>
                <select
                  {...register("airConditioning")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consumo de Climatización
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register("airConditioningConsumption")}
                    placeholder="Valor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-28">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    &nbsp;
                  </label>
                  <select
                    {...register("airConditioningConsumptionUnit")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Presión Hidráulica Máxima
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register("maxHydraulicPressure")}
                    placeholder="Valor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    &nbsp;
                  </label>
                  <select
                    {...register("maxHydraulicPressureUnit")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caudal de Bomba Hidráulica
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register("hydraulicPumpFlowRate")}
                    placeholder="Valor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-28">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    &nbsp;
                  </label>
                  <select
                    {...register("hydraulicPumpFlowRateUnit")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="L/min">L/min</option>
                    <option value="gal/min">gal/min</option>
                  </select>
                </div>
              </div>

              {/* Capacidad depósito hidráulico */}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacidad del Depósito Hidráulico
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register("hydraulicReservoirCapacity")}
                    placeholder="Valor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    &nbsp;
                  </label>
                  <select
                    {...register("hydraulicReservoirCapacityUnit")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <SectionHeader
          title="Normatividad y Seguridad"
          sectionKey="regulationsSafety"
          isExpanded={expandedSections.regulationsSafety}
        />
        {expandedSections.regulationsSafety && (
          <div className="p-4 space-y-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nivel de emisiones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel de Emisiones
                </label>
                <select
                  {...register("emissionLevel")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Cabina
                </label>
                <select
                  {...register("cabinType")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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