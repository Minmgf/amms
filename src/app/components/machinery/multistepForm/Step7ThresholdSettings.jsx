import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FaChevronDown, FaChevronUp, FaInfoCircle } from "react-icons/fa";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

// SectionHeader reutilizado del paso 3
function SectionHeader({ title, sectionKey, isExpanded, toggleSection }) {
    return (
        <button
            type="button"
            onClick={() => toggleSection(sectionKey)}
            className="w-full grid grid-cols-[1fr_auto] items-center p-4 transition-colors rounded-theme-lg"
            style={{
                backgroundColor: "var(--color-surface)",
                borderRadius: "var(--border-radius-lg)",
                border: "1px solid var(--color-border)",
            }}
            onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = "var(--color-hover)";
            }}
            onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = "var(--color-surface)";
            }}
            aria-label={`${isExpanded ? "Contraer" : "Expandir"} ${title} Sección`}
        >
            <span className="font-theme-medium text-left" style={{ color: "var(--color-text)" }}>
                {title}
            </span>
            {isExpanded ? (
                <FaChevronUp className="w-5 h-5" style={{ color: "var(--color-text-secondary)" }} />
            ) : (
                <FaChevronDown className="w-5 h-5" style={{ color: "var(--color-text-secondary)" }} />
            )}
        </button>
    );
}

export default function Step7ThresholdSettings({ requestTypes = [] }) {
    const { register, setValue } = useFormContext();

    const [expandedSections, setExpandedSections] = useState({
        mechanicalMotion: true,
        fluidLevels: false,
        distance: false,
        faultsEvents: false,
    });

    // Estado para los eventos expandidos
    const [expandedEvents, setExpandedEvents] = useState({
        Acceleration: false,
        Braking: false,
        Curve: false,
    });

    // Estado local para los rangos
    const [currentSpeedRange, setCurrentSpeedRange] = useState([0, 150]);
    const [rpmRange, setRpmRange] = useState([0, 8000]);
    const [engineTempRange, setEngineTempRange] = useState([-60, 68]);
    const [engineLoadRange, setEngineLoadRange] = useState([0, 50]);
    const [oilLevelRange, setOilLevelRange] = useState([0, 50]);
    const [fuelLevelRange, setFuelLevelRange] = useState([0, 50]);
    const [fuelUsedGpsRange, setFuelUsedGpsRange] = useState([0, 2294967]);
    const [instantFuelConsumptionRange, setInstantFuelConsumptionRange] = useState([0, 16000]);
    const [totalOdometerRange, setTotalOdometerRange] = useState([0, 1073741823.5]);
    const [tripOdometerRange, setTripOdometerRange] = useState([0, 1073741823.5]);

    const handleRangeChange = (name, value) => {
        setValue(`thresholds.${name}Min`, value[0]);
        setValue(`thresholds.${name}Max`, value[1]);
        if (name === "currentSpeed") setCurrentSpeedRange(value);
        else if (name === "rpm") setRpmRange(value);
        else if (name === "engineTemp") setEngineTempRange(value);
        else if (name === "engineLoad") setEngineLoadRange(value);
        else if (name === "oilLevel") setOilLevelRange(value);
        else if (name === "fuelLevel") setFuelLevelRange(value);
        else if (name === "fuelUsedGps") setFuelUsedGpsRange(value);
        else if (name === "instantFuelConsumption") setInstantFuelConsumptionRange(value);
        else if (name === "totalOdometer") setTotalOdometerRange(value);
        else if (name === "tripOdometer") setTripOdometerRange(value);
    };

    const toggleSection = (section) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const toggleEvent = (eventKey) => {
        setExpandedEvents((prev) => ({
            ...prev,
            [eventKey]: !prev[eventKey],
        }));
    };

    const obdCodes = [
        { code: "P0001", desc: "Circuito de Control del Regulador de Volumen de Combustible" },
        { code: "P0002", desc: "Rango del Circuito de Control del Regulador de Volumen de Combustible" },
        { code: "P0003", desc: "Circuito de Control del Regulador de Volumen de Combustible Bajo" },
    ];
    const eventTypes = [
        { key: "Acceleration", label: "Aceleración" },
        { key: "Braking", label: "Frenado" },
        { key: "Curve", label: "Curva" },
    ];

    return (
        <div className="space-y-4" id="step-7-threshold-settings">
            <h3 className="text-theme-lg font-theme-semibold mb-theme-md">Configuración de Umbrales</h3>
            <div className="mb-theme-md text-theme-sm text-secondary flex items-center gap-2">
                <FaInfoCircle className="w-4 h-4" style={{ color: "var(--color-text-secondary)" }} />
                <span>Este paso es opcional y puede completarse más tarde.</span>
            </div>

            {/* Mechanical and Motion Parameters */}
            <div className="rounded-theme-lg overflow-hidden" style={{ border: `1px solid var(--color-border)` }}>
                <SectionHeader
                    title="Parámetros Mecánicos y de Movimiento"
                    sectionKey="mechanicalMotion"
                    isExpanded={expandedSections.mechanicalMotion}
                    toggleSection={toggleSection}
                />
                {expandedSections.mechanicalMotion && (
                    <div className="p-theme-md space-y-4 bg-background">
                        {/* Current speed */}
                        <div className="card-theme">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-theme-sm font-theme-medium">Velocidad actual</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("alerts.currentSpeed")} aria-label="Emitir alerta para velocidad actual" />
                                        <span className="text-theme-sm">Emitir alerta</span>
                                    </label>
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("autoRequest.currentSpeed")} aria-label="Solicitud automática para velocidad actual" />
                                        <span className="text-theme-sm">Solicitud automática</span>
                                    </label>
                                    <select {...register("requestType.currentSpeed")} className="parametrization-input w-32" aria-label="Tipo de solicitud para velocidad actual">
                                        <option value="">Seleccionar solicitud</option>
                                        {requestTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <Slider
                                range
                                min={0}
                                max={150}
                                value={currentSpeedRange}
                                onChange={value => handleRangeChange("currentSpeed", value)}
                                allowCross={false}
                                className="w-full"
                                ariaLabelForHandle={["Velocidad mínima", "Velocidad máxima"]}
                            />
                            <div className="flex justify-between items-center gap-4 mt-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-theme-xs font-theme-medium">Mín:</label>
                                    <input 
                                        type="number" 
                                        value={currentSpeedRange[0]}
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                                            setCurrentSpeedRange([val, currentSpeedRange[1]]);
                                        }}
                                        onBlur={(e) => {
                                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                                            const newMin = Math.max(0, Math.min(val, currentSpeedRange[1]));
                                            setCurrentSpeedRange([newMin, currentSpeedRange[1]]);
                                            setValue("thresholds.currentSpeedMin", newMin);
                                        }}
                                        className="parametrization-input w-20"
                                        aria-label="Velocidad mínima"
                                    />
                                    <span className="text-theme-xs">km/h</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-theme-xs font-theme-medium">Máx:</label>
                                    <input 
                                        type="number" 
                                        value={currentSpeedRange[1]}
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                                            setCurrentSpeedRange([currentSpeedRange[0], val]);
                                        }}
                                        onBlur={(e) => {
                                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                                            const newMax = Math.min(150, Math.max(val, currentSpeedRange[0]));
                                            setCurrentSpeedRange([currentSpeedRange[0], newMax]);
                                            setValue("thresholds.currentSpeedMax", newMax);
                                        }}
                                        className="parametrization-input w-20"
                                        aria-label="Velocidad máxima"
                                    />
                                    <span className="text-theme-xs">km/h</span>
                                </div>
                            </div>
                        </div>
                        {/* Revolutions (RPM) */}
                        <div className="card-theme">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-theme-sm font-theme-medium">Revoluciones (RPM)</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("alerts.currentSpeed")} aria-label="Emitir alerta para revoluciones" />
                                        <span className="text-theme-sm">Emitir alerta</span>
                                    </label>
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("autoRequest.currentSpeed")} aria-label="Solicitud automática para revoluciones" />
                                        <span className="text-theme-sm">Solicitud automática</span>
                                    </label>
                                    <select {...register("requestType.rpm")} className="parametrization-input w-32" aria-label="Tipo de solicitud para revoluciones">
                                        <option value="">Seleccionar solicitud</option>
                                        {requestTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <Slider
                                range
                                min={0}
                                max={8000}
                                value={rpmRange}
                                onChange={value => handleRangeChange("rpm", value)}
                                allowCross={false}
                                className="w-full"
                                ariaLabelForHandle={["RPM mínimo", "RPM máximo"]}
                            />
                            <div className="flex justify-between items-center gap-4 mt-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-theme-xs font-theme-medium">Mín:</label>
                                    <input 
                                        type="number" 
                                        value={rpmRange[0]}
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                                            setRpmRange([val, rpmRange[1]]);
                                        }}
                                        onBlur={(e) => {
                                            const val = Number(e.target.value);
                                            const newMin = Math.max(0, Math.min(val, rpmRange[1]));
                                            setRpmRange([newMin, rpmRange[1]]);
                                            setValue("thresholds.rpmMin", newMin);
                                        }}
                                        className="parametrization-input w-20"
                                        aria-label="RPM mínimo"
                                    />
                                    <span className="text-theme-xs">RPM</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-theme-xs font-theme-medium">Máx:</label>
                                    <input 
                                        type="number" 
                                        value={rpmRange[1]}
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                                            setRpmRange([rpmRange[0], val]);
                                        }}
                                        onBlur={(e) => {
                                            const val = Number(e.target.value);
                                            const newMax = Math.min(8000, Math.max(val, rpmRange[0]));
                                            setRpmRange([rpmRange[0], newMax]);
                                            setValue("thresholds.rpmMax", newMax);
                                        }}
                                        className="parametrization-input w-20"
                                        aria-label="RPM máximo"
                                    />
                                    <span className="text-theme-xs">RPM</span>
                                </div>
                            </div>
                        </div>
                        {/* Engine temperature */}
                        <div className="card-theme">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-theme-sm font-theme-medium">Temperatura del motor</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("alerts.currentSpeed")} aria-label="Emitir alerta para temperatura del motor" />
                                        <span className="text-theme-sm">Emitir alerta</span>
                                    </label>
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("autoRequest.currentSpeed")} aria-label="Solicitud automática para temperatura del motor" />
                                        <span className="text-theme-sm">Solicitud automática</span>
                                    </label>
                                    <select {...register("requestType.engineTemp")} className="parametrization-input w-32" aria-label="Tipo de solicitud para temperatura del motor">
                                        <option value="">Seleccionar solicitud</option>
                                        {requestTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <Slider
                                range
                                min={-60}
                                max={68}
                                value={engineTempRange}
                                onChange={value => handleRangeChange("engineTemp", value)}
                                allowCross={false}
                                className="w-full"
                                ariaLabelForHandle={["Temperatura mínima", "Temperatura máxima"]}
                            />
                            <div className="flex justify-between items-center gap-4 mt-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-theme-xs font-theme-medium">Mín:</label>
                                    <input 
                                        type="number" 
                                        value={engineTempRange[0]}
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? -60 : Number(e.target.value);
                                            setEngineTempRange([val, engineTempRange[1]]);
                                        }}
                                        onBlur={(e) => {
                                            const val = Number(e.target.value);
                                            const newMin = Math.max(-60, Math.min(val, engineTempRange[1]));
                                            setEngineTempRange([newMin, engineTempRange[1]]);
                                            setValue("thresholds.engineTempMin", newMin);
                                        }}
                                        className="parametrization-input w-20"
                                        aria-label="Temperatura mínima"
                                    />
                                    <span className="text-theme-xs">°C</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-theme-xs font-theme-medium">Máx:</label>
                                    <input 
                                        type="number" 
                                        value={engineTempRange[1]}
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                                            setEngineTempRange([engineTempRange[0], val]);
                                        }}
                                        onBlur={(e) => {
                                            const val = Number(e.target.value);
                                            const newMax = Math.min(68, Math.max(val, engineTempRange[0]));
                                            setEngineTempRange([engineTempRange[0], newMax]);
                                            setValue("thresholds.engineTempMax", newMax);
                                        }}
                                        className="parametrization-input w-20"
                                        aria-label="Temperatura máxima"
                                    />
                                    <span className="text-theme-xs">°C</span>
                                </div>
                            </div>
                        </div>
                        {/* Engine load */}
                        <div className="card-theme">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-theme-sm font-theme-medium">Carga del motor</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("alerts.currentSpeed")} aria-label="Emitir alerta para carga del motor" />
                                        <span className="text-theme-sm">Emitir alerta</span>
                                    </label>
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("autoRequest.currentSpeed")} aria-label="Solicitud automática para carga del motor" />
                                        <span className="text-theme-sm">Solicitud automática</span>
                                    </label>
                                    <select {...register("requestType.engineLoad")} className="parametrization-input w-32" aria-label="Tipo de solicitud para carga del motor">
                                        <option value="">Seleccionar solicitud</option>
                                        {requestTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <Slider
                                range
                                min={0}
                                max={50}
                                value={engineLoadRange}
                                onChange={value => handleRangeChange("engineLoad", value)}
                                allowCross={false}
                                className="w-full"
                                ariaLabelForHandle={["Carga mínima", "Carga máxima"]}
                            />
                            <div className="flex justify-between items-center gap-4 mt-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-theme-xs font-theme-medium">Mín:</label>
                                    <input 
                                        type="number" 
                                        value={engineLoadRange[0]}
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                                            setEngineLoadRange([val, engineLoadRange[1]]);
                                        }}
                                        onBlur={(e) => {
                                            const val = Number(e.target.value);
                                            const newMin = Math.max(0, Math.min(val, engineLoadRange[1]));
                                            setEngineLoadRange([newMin, engineLoadRange[1]]);
                                            setValue("thresholds.engineLoadMin", newMin);
                                        }}
                                        className="parametrization-input w-20"
                                        aria-label="Carga mínima"
                                    />
                                    <span className="text-theme-xs">%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-theme-xs font-theme-medium">Máx:</label>
                                    <input 
                                        type="number" 
                                        value={engineLoadRange[1]}
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                                            setEngineLoadRange([engineLoadRange[0], val]);
                                        }}
                                        onBlur={(e) => {
                                            const val = Number(e.target.value);
                                            const newMax = Math.min(50, Math.max(val, engineLoadRange[0]));
                                            setEngineLoadRange([engineLoadRange[0], newMax]);
                                            setValue("thresholds.engineLoadMax", newMax);
                                        }}
                                        className="parametrization-input w-20"
                                        aria-label="Carga máxima"
                                    />
                                    <span className="text-theme-xs">%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Fluid Levels and Consumption */}
            <div className="rounded-theme-lg overflow-hidden" style={{ border: `1px solid var(--color-border)` }}>
                <SectionHeader
                    title="Niveles de Fluidos y Consumo"
                    sectionKey="fluidLevels"
                    isExpanded={expandedSections.fluidLevels}
                    toggleSection={toggleSection}
                />
                {expandedSections.fluidLevels && (
                    <div className="p-theme-md space-y-4 bg-background">
                        {/* Oil level */}
                        <div className="card-theme">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-theme-sm font-theme-medium">Nivel de aceite</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("alerts.currentSpeed")} aria-label="Emitir alerta para nivel de aceite" />
                                        <span className="text-theme-sm">Emitir alerta</span>
                                    </label>
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("autoRequest.currentSpeed")} aria-label="Solicitud automática para nivel de aceite" />
                                        <span className="text-theme-sm">Solicitud automática</span>
                                    </label>
                                    <select {...register("requestType.oilLevel")} className="parametrization-input w-32" aria-label="Tipo de solicitud para nivel de aceite">
                                        <option value="">Seleccionar solicitud</option>
                                        {requestTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <Slider
                                range
                                min={0}
                                max={50}
                                value={oilLevelRange}
                                onChange={value => handleRangeChange("oilLevel", value)}
                                allowCross={false}
                                className="w-full"
                                ariaLabelForHandle={["Nivel de aceite mínimo", "Nivel de aceite máximo"]}
                            />
                            <div className="flex justify-between items-center gap-4 mt-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-theme-xs font-theme-medium">Mín:</label>
                                    <input 
                                        type="number" 
                                        value={oilLevelRange[0]}
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                                            setOilLevelRange([val, oilLevelRange[1]]);
                                        }}
                                        onBlur={(e) => {
                                            const val = Number(e.target.value);
                                            const newMin = Math.max(0, Math.min(val, oilLevelRange[1]));
                                            setOilLevelRange([newMin, oilLevelRange[1]]);
                                            setValue("thresholds.oilLevelMin", newMin);
                                        }}
                                        className="parametrization-input w-20"
                                        aria-label="Nivel de aceite mínimo"
                                    />
                                    <span className="text-theme-xs">%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-theme-xs font-theme-medium">Máx:</label>
                                    <input 
                                        type="number" 
                                        value={oilLevelRange[1]}
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                                            setOilLevelRange([oilLevelRange[0], val]);
                                        }}
                                        onBlur={(e) => {
                                            const val = Number(e.target.value);
                                            const newMax = Math.min(50, Math.max(val, oilLevelRange[0]));
                                            setOilLevelRange([oilLevelRange[0], newMax]);
                                            setValue("thresholds.oilLevelMax", newMax);
                                        }}
                                        className="parametrization-input w-20"
                                        aria-label="Nivel de aceite máximo"
                                    />
                                    <span className="text-theme-xs">%</span>
                                </div>
                            </div>
                        </div>
                        {/* Fuel level */}
                        <div className="card-theme">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-theme-sm font-theme-medium">Nivel de combustible</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("alerts.currentSpeed")} aria-label="Emitir alerta para nivel de combustible" />
                                        <span className="text-theme-sm">Emitir alerta</span>
                                    </label>
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("autoRequest.currentSpeed")} aria-label="Solicitud automática para nivel de combustible" />
                                        <span className="text-theme-sm">Solicitud automática</span>
                                    </label>
                                    <select {...register("requestType.fuelLevel")} className="parametrization-input w-32" aria-label="Tipo de solicitud para nivel de combustible">
                                        <option value="">Seleccionar solicitud</option>
                                        {requestTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <Slider
                                range
                                min={0}
                                max={50}
                                value={fuelLevelRange}
                                onChange={value => handleRangeChange("fuelLevel", value)}
                                allowCross={false}
                                className="w-full"
                                ariaLabelForHandle={["Nivel de combustible mínimo", "Nivel de combustible máximo"]}
                            />
                            <div className="flex justify-between items-center gap-4 mt-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-theme-xs font-theme-medium">Mín:</label>
                                    <input 
                                        type="number" 
                                        value={fuelLevelRange[0]}
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                                            setFuelLevelRange([val, fuelLevelRange[1]]);
                                        }}
                                        onBlur={(e) => {
                                            const val = Number(e.target.value);
                                            const newMin = Math.max(0, Math.min(val, fuelLevelRange[1]));
                                            setFuelLevelRange([newMin, fuelLevelRange[1]]);
                                            setValue("thresholds.fuelLevelMin", newMin);
                                        }}
                                        className="parametrization-input w-20"
                                        aria-label="Nivel de combustible mínimo"
                                    />
                                    <span className="text-theme-xs">%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-theme-xs font-theme-medium">Máx:</label>
                                    <input 
                                        type="number" 
                                        value={fuelLevelRange[1]}
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                                            setFuelLevelRange([fuelLevelRange[0], val]);
                                        }}
                                        onBlur={(e) => {
                                            const val = Number(e.target.value);
                                            const newMax = Math.min(50, Math.max(val, fuelLevelRange[0]));
                                            setFuelLevelRange([fuelLevelRange[0], newMax]);
                                            setValue("thresholds.fuelLevelMax", newMax);
                                        }}
                                        className="parametrization-input w-20"
                                        aria-label="Nivel de combustible máximo"
                                    />
                                    <span className="text-theme-xs">%</span>
                                </div>
                            </div>
                        </div>
                        {/* Fuel Used (GPS) */}
                        <div className="card-theme">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-theme-sm font-theme-medium">Combustible usado (GPS)</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("alerts.currentSpeed")} aria-label="Emitir alerta para combustible usado" />
                                        <span className="text-theme-sm">Emitir alerta</span>
                                    </label>
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("autoRequest.currentSpeed")} aria-label="Solicitud automática para combustible usado" />
                                        <span className="text-theme-sm">Solicitud automática</span>
                                    </label>
                                    <select {...register("requestType.fuelUsedGps")} className="parametrization-input w-32" aria-label="Tipo de solicitud para combustible usado">
                                        <option value="">Seleccionar solicitud</option>
                                        {requestTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <Slider
                                range
                                min={0}
                                max={2294967}
                                value={fuelUsedGpsRange}
                                onChange={value => handleRangeChange("fuelUsedGps", value)}
                                allowCross={false}
                                className="w-full"
                                ariaLabelForHandle={["Combustible usado mínimo", "Combustible usado máximo"]}
                            />
                            <div className="flex justify-between items-center gap-4 mt-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-theme-xs font-theme-medium">Mín:</label>
                                    <input 
                                        type="number" 
                                        value={fuelUsedGpsRange[0]}
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                                            setFuelUsedGpsRange([val, fuelUsedGpsRange[1]]);
                                        }}
                                        onBlur={(e) => {
                                            const val = Number(e.target.value);
                                            const newMin = Math.max(0, Math.min(val, fuelUsedGpsRange[1]));
                                            setFuelUsedGpsRange([newMin, fuelUsedGpsRange[1]]);
                                            setValue("thresholds.fuelUsedGpsMin", newMin);
                                        }}
                                        className="parametrization-input w-24"
                                        aria-label="Combustible usado mínimo"
                                    />
                                    <span className="text-theme-xs">L</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-theme-xs font-theme-medium">Máx:</label>
                                    <input 
                                        type="number" 
                                        value={fuelUsedGpsRange[1]}
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                                            setFuelUsedGpsRange([fuelUsedGpsRange[0], val]);
                                        }}
                                        onBlur={(e) => {
                                            const val = Number(e.target.value);
                                            const newMax = Math.min(2294967, Math.max(val, fuelUsedGpsRange[0]));
                                            setFuelUsedGpsRange([fuelUsedGpsRange[0], newMax]);
                                            setValue("thresholds.fuelUsedGpsMax", newMax);
                                        }}
                                        className="parametrization-input w-24"
                                        aria-label="Combustible usado máximo"
                                    />
                                    <span className="text-theme-xs">L</span>
                                </div>
                            </div>
                        </div>
                        {/* Instant fuel consumption */}
                        <div className="card-theme">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-theme-sm font-theme-medium">Consumo instantáneo de combustible</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("alerts.currentSpeed")} aria-label="Emitir alerta para consumo instantáneo" />
                                        <span className="text-theme-sm">Emitir alerta</span>
                                    </label>
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("autoRequest.currentSpeed")} aria-label="Solicitud automática para consumo instantáneo" />
                                        <span className="text-theme-sm">Solicitud automática</span>
                                    </label>
                                    <select {...register("requestType.instantFuelConsumption")} className="parametrization-input w-32" aria-label="Tipo de solicitud para consumo instantáneo">
                                        <option value="">Seleccionar solicitud</option>
                                        {requestTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <Slider
                                range
                                min={0}
                                max={16000}
                                value={instantFuelConsumptionRange}
                                onChange={value => handleRangeChange("instantFuelConsumption", value)}
                                allowCross={false}
                                className="w-full"
                                ariaLabelForHandle={["Consumo mínimo", "Consumo máximo"]}
                            />
                            <div className="flex justify-between items-center gap-4 mt-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-theme-xs font-theme-medium">Mín:</label>
                                    <input 
                                        type="number" 
                                        value={instantFuelConsumptionRange[0]}
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                                            setInstantFuelConsumptionRange([val, instantFuelConsumptionRange[1]]);
                                        }}
                                        onBlur={(e) => {
                                            const val = Number(e.target.value);
                                            const newMin = Math.max(0, Math.min(val, instantFuelConsumptionRange[1]));
                                            setInstantFuelConsumptionRange([newMin, instantFuelConsumptionRange[1]]);
                                            setValue("thresholds.instantFuelConsumptionMin", newMin);
                                        }}
                                        className="parametrization-input w-20"
                                        aria-label="Consumo mínimo"
                                    />
                                    <span className="text-theme-xs">L/h</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-theme-xs font-theme-medium">Máx:</label>
                                    <input 
                                        type="number" 
                                        value={instantFuelConsumptionRange[1]}
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                                            setInstantFuelConsumptionRange([instantFuelConsumptionRange[0], val]);
                                        }}
                                        onBlur={(e) => {
                                            const val = Number(e.target.value);
                                            const newMax = Math.min(16000, Math.max(val, instantFuelConsumptionRange[0]));
                                            setInstantFuelConsumptionRange([instantFuelConsumptionRange[0], newMax]);
                                            setValue("thresholds.instantFuelConsumptionMax", newMax);
                                        }}
                                        className="parametrization-input w-20"
                                        aria-label="Consumo máximo"
                                    />
                                    <span className="text-theme-xs">L/h</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Distance */}
            <div className="rounded-theme-lg overflow-hidden" style={{ border: `1px solid var(--color-border)` }}>
                <SectionHeader
                    title="Distancia"
                    sectionKey="distance"
                    isExpanded={expandedSections.distance}
                    toggleSection={toggleSection}
                />
                {expandedSections.distance && (
                    <div className="p-theme-md space-y-4 bg-background">
                        {/* Total odometer */}
                        <div className="card-theme">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-theme-sm font-theme-medium">Odómetro total</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("alerts.currentSpeed")} aria-label="Emitir alerta para odómetro total" />
                                        <span className="text-theme-sm">Emitir alerta</span>
                                    </label>
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("autoRequest.currentSpeed")} aria-label="Solicitud automática para odómetro total" />
                                        <span className="text-theme-sm">Solicitud automática</span>
                                    </label>
                                    <select {...register("requestType.totalOdometer")} className="parametrization-input w-32" aria-label="Tipo de solicitud para odómetro total">
                                        <option value="">Seleccionar solicitud</option>
                                        {requestTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <Slider
                                range
                                min={0}
                                max={1073741823.5}
                                step={0.1}
                                value={totalOdometerRange}
                                onChange={value => handleRangeChange("totalOdometer", value)}
                                allowCross={false}
                                className="w-full"
                                ariaLabelForHandle={["Odómetro total mínimo", "Odómetro total máximo"]}
                            />
                            <div className="flex justify-between items-center gap-4 mt-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-theme-xs font-theme-medium">Mín:</label>
                                    <input 
                                        type="number" 
                                        value={totalOdometerRange[0]}
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                                            setTotalOdometerRange([val, totalOdometerRange[1]]);
                                        }}
                                        onBlur={(e) => {
                                            const val = Number(e.target.value);
                                            const newMin = Math.max(0, Math.min(val, totalOdometerRange[1]));
                                            setTotalOdometerRange([newMin, totalOdometerRange[1]]);
                                            setValue("thresholds.totalOdometerMin", newMin);
                                        }}
                                        className="parametrization-input w-24"
                                        aria-label="Odómetro total mínimo"
                                        step="0.1"
                                    />
                                    <span className="text-theme-xs">m</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-theme-xs font-theme-medium">Máx:</label>
                                    <input 
                                        type="number" 
                                        value={totalOdometerRange[1]}
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                                            setTotalOdometerRange([totalOdometerRange[0], val]);
                                        }}
                                        onBlur={(e) => {
                                            const val = Number(e.target.value);
                                            const newMax = Math.min(1073741823.5, Math.max(val, totalOdometerRange[0]));
                                            setTotalOdometerRange([totalOdometerRange[0], newMax]);
                                            setValue("thresholds.totalOdometerMax", newMax);
                                        }}
                                        className="parametrization-input w-24"
                                        aria-label="Odómetro total máximo"
                                        step="0.1"
                                    />
                                    <span className="text-theme-xs">m</span>
                                </div>
                            </div>
                        </div>
                        {/* Trip odometer */}
                        <div className="card-theme">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-theme-sm font-theme-medium">Odómetro de viaje</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("alerts.currentSpeed")} aria-label="Emitir alerta para odómetro de viaje" />
                                        <span className="text-theme-sm">Emitir alerta</span>
                                    </label>
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("autoRequest.currentSpeed")} aria-label="Solicitud automática para odómetro de viaje" />
                                        <span className="text-theme-sm">Solicitud automática</span>
                                    </label>
                                    <select {...register("requestType.tripOdometer")} className="parametrization-input w-32" aria-label="Tipo de solicitud para odómetro de viaje">
                                        <option value="">Seleccionar solicitud</option>
                                        {requestTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <Slider
                                range
                                min={0}
                                max={1073741823.5}
                                step={0.1}
                                value={tripOdometerRange}
                                onChange={value => handleRangeChange("tripOdometer", value)}
                                allowCross={false}
                                className="w-full"
                                ariaLabelForHandle={["Odómetro de viaje mínimo", "Odómetro de viaje máximo"]}
                            />
                            <div className="flex justify-between items-center gap-4 mt-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-theme-xs font-theme-medium">Mín:</label>
                                    <input 
                                        type="number" 
                                        value={tripOdometerRange[0]}
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                                            setTripOdometerRange([val, tripOdometerRange[1]]);
                                        }}
                                        onBlur={(e) => {
                                            const val = Number(e.target.value);
                                            const newMin = Math.max(0, Math.min(val, tripOdometerRange[1]));
                                            setTripOdometerRange([newMin, tripOdometerRange[1]]);
                                            setValue("thresholds.tripOdometerMin", newMin);
                                        }}
                                        className="parametrization-input w-24"
                                        aria-label="Odómetro de viaje mínimo"
                                        step="0.1"
                                    />
                                    <span className="text-theme-xs">m</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-theme-xs font-theme-medium">Máx:</label>
                                    <input 
                                        type="number" 
                                        value={tripOdometerRange[1]}
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                                            setTripOdometerRange([tripOdometerRange[0], val]);
                                        }}
                                        onBlur={(e) => {
                                            const val = Number(e.target.value);
                                            const newMax = Math.min(1073741823.5, Math.max(val, tripOdometerRange[0]));
                                            setTripOdometerRange([tripOdometerRange[0], newMax]);
                                            setValue("thresholds.tripOdometerMax", newMax);
                                        }}
                                        className="parametrization-input w-24"
                                        aria-label="Odómetro de viaje máximo"
                                        step="0.1"
                                    />
                                    <span className="text-theme-xs">m</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Faults and Events */}
            <div className="rounded-theme-lg overflow-hidden" style={{ border: `1px solid var(--color-border)` }}>
                <SectionHeader
                    title="Fallas y Eventos"
                    sectionKey="faultsEvents"
                    isExpanded={expandedSections.faultsEvents}
                    toggleSection={toggleSection}
                />
                {expandedSections.faultsEvents && (
                    <div className="p-theme-md space-y-4 bg-background">
                        {/* OBD Faults */}
                        <div className="card-theme">
                            <label className="block text-theme-sm font-theme-medium mb-4">Fallas OBD</label>
                            <input type="text" placeholder="Buscar códigos de falla..." className="parametrization-input w-full mb-4" aria-label="Buscar códigos de falla OBD" />
                            <div className="space-y-3">
                                {obdCodes.map(({ code, desc }) => (
                                    <div key={code} className="grid grid-cols-[2fr_auto_auto_1fr] gap-4 items-center">
                                        <span className="text-theme-sm">{code} - {desc}</span>
                                        <label className="flex items-center gap-2 whitespace-nowrap">
                                            <input type="checkbox" {...register(`alerts.obd.${code}`)} aria-label={`Emitir alerta para código ${code}`} />
                                            <span className="text-theme-sm">Emitir alerta</span>
                                        </label>
                                        <label className="flex items-center gap-2 whitespace-nowrap">
                                            <input type="checkbox" {...register(`autoRequest.obd.${code}`)} aria-label={`Solicitud automática para código ${code}`} />
                                            <span className="text-theme-sm">Solicitud automática</span>
                                        </label>
                                        <select {...register(`requestType.obd.${code}`)} className="parametrization-input" aria-label={`Tipo de solicitud para código ${code}`}>
                                            <option value="">Seleccionar solicitud</option>
                                            {requestTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Event Type (Driving) */}
                        <div className="space-y-4">
                            <label className="block text-theme-sm font-theme-medium">Tipo de Evento (Conducción)</label>
                            <div className="grid grid-cols-3 gap-4">
                                {eventTypes.map(({ key, label }) => (
                                    <div 
                                        key={key} 
                                        className="card-theme"
                                        style={{
                                            border: "1px solid var(--color-border)",
                                            borderRadius: "var(--border-radius-md)",
                                        }}
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <input 
                                                type="checkbox" 
                                                checked={expandedEvents[key]}
                                                onChange={() => toggleEvent(key)}
                                                aria-label={`Activar evento de ${label}`}
                                            />
                                            <span className="font-theme-medium text-theme-sm">{label}</span>
                                        </div>
                                        {expandedEvents[key] && (
                                            <div className="space-y-3 pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
                                                <div>
                                                    <label className="block text-theme-xs font-theme-medium mb-2">Event G - Value</label>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-theme-sm">Umbral:</span>
                                                        <input 
                                                            type="number" 
                                                            placeholder="150" 
                                                            {...register(`thresholds.event.${key}`)} 
                                                            className="parametrization-input w-20"
                                                            aria-label={`Umbral para ${label}`}
                                                        />
                                                        <span className="text-theme-xs text-secondary">G×100 (± 1.50 G)</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <label className="flex items-center gap-1">
                                                        <input type="checkbox" {...register(`alerts.event.${key}`)} aria-label={`Emitir alerta para evento de ${label}`} />
                                                        <span className="text-theme-xs">Emitir alerta</span>
                                                    </label>
                                                    <label className="flex items-center gap-1">
                                                        <input type="checkbox" {...register(`autoRequest.event.${key}`)} aria-label={`Solicitud automática para evento de ${label}`} />
                                                        <span className="text-theme-xs">Solicitud automática</span>
                                                    </label>
                                                </div>
                                                <select {...register(`requestType.event.${key}`)} className="parametrization-input w-full" aria-label={`Tipo de solicitud para evento de ${label}`}>
                                                    <option value="">Seleccionar solicitud</option>
                                                    {requestTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}