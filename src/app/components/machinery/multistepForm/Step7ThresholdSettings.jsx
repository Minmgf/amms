import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FaChevronDown, FaChevronUp, FaInfoCircle, FaTrash } from "react-icons/fa";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { getOBDFaults } from "@/services/machineryService";

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

export default function Step7ThresholdSettings({ 
    machineryId, 
    maintenanceTypeList = [], 
    eventTypesList,
    obdSearchResults,
    setObdSearchResults,
    isEditMode,
    loadedThresholdData
}) {
    const { register, setValue, watch } = useFormContext();
    
    // Watch individual para cada checkbox de autoRequest
    const watchAutoRequestCurrentSpeed = watch('autoRequest.currentSpeed');
    const watchAutoRequestRpm = watch('autoRequest.rpm');
    const watchAutoRequestEngineTemp = watch('autoRequest.engineTemp');
    const watchAutoRequestEngineLoad = watch('autoRequest.engineLoad');
    const watchAutoRequestOilLevel = watch('autoRequest.oilLevel');
    const watchAutoRequestFuelLevel = watch('autoRequest.fuelLevel');
    const watchAutoRequestFuelUsedGps = watch('autoRequest.fuelUsedGps');
    const watchAutoRequestInstantFuelConsumption = watch('autoRequest.instantFuelConsumption');
    const watchAutoRequestTotalOdometer = watch('autoRequest.totalOdometer');
    const watchAutoRequestTripOdometer = watch('autoRequest.tripOdometer');
    const watchAutoRequestObd = watch('autoRequest.obd');
    const watchAutoRequestEvent = watch('autoRequest.event');

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

    // Estados para búsqueda de códigos OBD
    const [obdSearchCode, setObdSearchCode] = useState("");
    const [isSearchingObd, setIsSearchingObd] = useState(false);
    const [obdSearchError, setObdSearchError] = useState("");

    // Estado para eventos expandidos dinámicos basado en eventTypesList
    const [expandedEventsByType, setExpandedEventsByType] = useState({});

    // Estado local para los rangos
    const [currentSpeedRange, setCurrentSpeedRange] = useState([0, 350]);
    const [rpmRange, setRpmRange] = useState([0, 16384]);
    const [engineTempRange, setEngineTempRange] = useState([-60, 127]);
    const [engineLoadRange, setEngineLoadRange] = useState([0, 100]);
    const [oilLevelRange, setOilLevelRange] = useState([0, 100]);
    const [fuelLevelRange, setFuelLevelRange] = useState([0, 100]);
    const [fuelUsedGpsRange, setFuelUsedGpsRange] = useState([0, 4294967]);
    const [instantFuelConsumptionRange, setInstantFuelConsumptionRange] = useState([0, 32767]);
    const [totalOdometerRange, setTotalOdometerRange] = useState([0, 2147483647]);
    const [tripOdometerRange, setTripOdometerRange] = useState([0, 2147483647]);

    // useEffect para inicializar los rangos cuando se cargan los datos en modo edición
    useEffect(() => {
        if (isEditMode && loadedThresholdData) {
            // Inicializar rangos de parámetros
            if (loadedThresholdData.tolerance_thresholds) {
                loadedThresholdData.tolerance_thresholds.forEach((threshold) => {
                    const min = threshold.minimum_threshold ?? 0;
                    const max = threshold.maximum_threshold ?? 0;
                    
                    switch(threshold.id_parameter) {
                        case 3: // currentSpeed
                            setCurrentSpeedRange([min, max]);
                            break;
                        case 6: // rpm
                            setRpmRange([min, max]);
                            break;
                        case 7: // engineTemp
                            setEngineTempRange([min, max]);
                            break;
                        case 8: // engineLoad
                            setEngineLoadRange([min, max]);
                            break;
                        case 9: // oilLevel
                            setOilLevelRange([min, max]);
                            break;
                        case 10: // fuelLevel
                            setFuelLevelRange([min, max]);
                            break;
                        case 11: // fuelUsedGps
                            setFuelUsedGpsRange([min, max]);
                            break;
                        case 12: // instantFuelConsumption
                            setInstantFuelConsumptionRange([min, max]);
                            break;
                        case 14: // totalOdometer
                            setTotalOdometerRange([min, max]);
                            break;
                        case 15: // tripOdometer
                            setTripOdometerRange([min, max]);
                            break;
                    }
                });
            }
            
            // Inicializar eventos expandidos
            if (loadedThresholdData.event_type_machinery) {
                const expandedEvents = {};
                loadedThresholdData.event_type_machinery.forEach((event) => {
                    expandedEvents[event.id_event_type] = true;
                });
                setExpandedEventsByType(expandedEvents);
            }
        }
    }, [isEditMode, loadedThresholdData]);

    // useEffect para limpiar los valores de requestType cuando autoRequest se desmarca
    useEffect(() => {
        if (!watchAutoRequestCurrentSpeed) {
            setValue('requestType.currentSpeed', '');
        }
    }, [watchAutoRequestCurrentSpeed, setValue]);

    useEffect(() => {
        if (!watchAutoRequestRpm) {
            setValue('requestType.rpm', '');
        }
    }, [watchAutoRequestRpm, setValue]);

    useEffect(() => {
        if (!watchAutoRequestEngineTemp) {
            setValue('requestType.engineTemp', '');
        }
    }, [watchAutoRequestEngineTemp, setValue]);

    useEffect(() => {
        if (!watchAutoRequestEngineLoad) {
            setValue('requestType.engineLoad', '');
        }
    }, [watchAutoRequestEngineLoad, setValue]);

    useEffect(() => {
        if (!watchAutoRequestOilLevel) {
            setValue('requestType.oilLevel', '');
        }
    }, [watchAutoRequestOilLevel, setValue]);

    useEffect(() => {
        if (!watchAutoRequestFuelLevel) {
            setValue('requestType.fuelLevel', '');
        }
    }, [watchAutoRequestFuelLevel, setValue]);

    useEffect(() => {
        if (!watchAutoRequestFuelUsedGps) {
            setValue('requestType.fuelUsedGps', '');
        }
    }, [watchAutoRequestFuelUsedGps, setValue]);

    useEffect(() => {
        if (!watchAutoRequestInstantFuelConsumption) {
            setValue('requestType.instantFuelConsumption', '');
        }
    }, [watchAutoRequestInstantFuelConsumption, setValue]);

    useEffect(() => {
        if (!watchAutoRequestTotalOdometer) {
            setValue('requestType.totalOdometer', '');
        }
    }, [watchAutoRequestTotalOdometer, setValue]);

    useEffect(() => {
        if (!watchAutoRequestTripOdometer) {
            setValue('requestType.tripOdometer', '');
        }
    }, [watchAutoRequestTripOdometer, setValue]);

    // Limpiar requestType para OBD codes
    useEffect(() => {
        if (watchAutoRequestObd) {
            Object.keys(watchAutoRequestObd).forEach(code => {
                if (!watchAutoRequestObd[code]) {
                    setValue(`requestType.obd.${code}`, '');
                }
            });
        }
    }, [watchAutoRequestObd, setValue]);

    // Limpiar requestType para eventos
    useEffect(() => {
        if (watchAutoRequestEvent) {
            Object.keys(watchAutoRequestEvent).forEach(eventId => {
                if (!watchAutoRequestEvent[eventId]) {
                    setValue(`requestType.event.${eventId}`, '');
                }
            });
        }
    }, [watchAutoRequestEvent, setValue]);

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

    // Función para toggle de eventos dinámicos
    const toggleEventByType = (eventId) => {
        setExpandedEventsByType((prev) => ({
            ...prev,
            [eventId]: !prev[eventId],
        }));
    };

    // Función para buscar códigos OBD
    const handleSearchObd = async () => {
        if (!obdSearchCode.trim()) {
            setObdSearchError("Por favor ingrese un código OBD");
            return;
        }

        setIsSearchingObd(true);
        setObdSearchError("");

        try {
            const response = await getOBDFaults(obdSearchCode.trim());
            
            if (response.success && response.data) {
                // Verificar si el código ya existe en los resultados
                const codeExists = obdSearchResults.some(
                    item => item.code === response.data.code
                );

                if (!codeExists) {
                    setObdSearchResults(prev => [...prev, {
                        id: response.data.id_obd_fault,
                        code: response.data.code,
                        desc: response.data.description
                    }]);
                    setObdSearchCode("");
                } else {
                    setObdSearchError("Este código ya está en la lista");
                }
            }
        } catch (error) {
            console.error("Error searching OBD code:", error);
            setObdSearchError(
                error.response?.data?.message || 
                "No se encontró el código OBD o ocurrió un error"
            );
        } finally {
            setIsSearchingObd(false);
        }
    };

    // Función para eliminar un código de la lista
    const handleRemoveObdCode = (codeToRemove) => {
        setObdSearchResults(prev => prev.filter(item => item.code !== codeToRemove));
    };

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
                                    {watchAutoRequestCurrentSpeed && (
                                        <select {...register("requestType.currentSpeed", { required: watchAutoRequestCurrentSpeed })} className="parametrization-input w-32" aria-label="Tipo de solicitud para velocidad actual">
                                            <option value="">Seleccione...</option>
                                            {maintenanceTypeList.map(rt => <option key={rt.id_maintenance} value={rt.id_maintenance}>{rt.name}</option>)}
                                        </select>
                                    )}
                                </div>
                            </div>
                            <Slider
                                range
                                min={0}
                                max={350}
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
                                            const newMax = Math.min(350, Math.max(val, currentSpeedRange[0]));
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
                                        <input type="checkbox" {...register("alerts.rpm")} aria-label="Emitir alerta para revoluciones" />
                                        <span className="text-theme-sm">Emitir alerta</span>
                                    </label>
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("autoRequest.rpm")} aria-label="Solicitud automática para revoluciones" />
                                        <span className="text-theme-sm">Solicitud automática</span>
                                    </label>
                                    {watchAutoRequestRpm && (
                                        <select {...register("requestType.rpm", { required: watchAutoRequestRpm })} className="parametrization-input w-32" aria-label="Tipo de solicitud para revoluciones">
                                            <option value="">Seleccione...</option>
                                            {maintenanceTypeList.map(rt => <option key={rt.id_maintenance} value={rt.id_maintenance}>{rt.name}</option>)}
                                        </select>
                                    )}
                                </div>
                            </div>
                            <Slider
                                range
                                min={0}
                                max={16384}
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
                                            const newMax = Math.min(16384, Math.max(val, rpmRange[0]));
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
                                        <input type="checkbox" {...register("alerts.engineTemp")} aria-label="Emitir alerta para temperatura del motor" />
                                        <span className="text-theme-sm">Emitir alerta</span>
                                    </label>
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("autoRequest.engineTemp")} aria-label="Solicitud automática para temperatura del motor" />
                                        <span className="text-theme-sm">Solicitud automática</span>
                                    </label>
                                    {watchAutoRequestEngineTemp && (
                                        <select {...register("requestType.engineTemp", { required: watchAutoRequestEngineTemp })} className="parametrization-input w-32" aria-label="Tipo de solicitud para temperatura del motor">
                                            <option value="">Seleccione...</option>
                                            {maintenanceTypeList.map(rt => <option key={rt.id_maintenance} value={rt.id_maintenance}>{rt.name}</option>)}
                                        </select>
                                    )}
                                </div>
                            </div>
                            <Slider
                                range
                                min={-60}
                                max={127}
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
                                            const newMax = Math.min(127, Math.max(val, engineTempRange[0]));
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
                                        <input type="checkbox" {...register("alerts.engineLoad")} aria-label="Emitir alerta para carga del motor" />
                                        <span className="text-theme-sm">Emitir alerta</span>
                                    </label>
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("autoRequest.engineLoad")} aria-label="Solicitud automática para carga del motor" />
                                        <span className="text-theme-sm">Solicitud automática</span>
                                    </label>
                                    {watchAutoRequestEngineLoad && (
                                        <select {...register("requestType.engineLoad", { required: watchAutoRequestEngineLoad })} className="parametrization-input w-32" aria-label="Tipo de solicitud para carga del motor">
                                            <option value="">Seleccione...</option>
                                            {maintenanceTypeList.map(rt => <option key={rt.id_maintenance} value={rt.id_maintenance}>{rt.name}</option>)}
                                        </select>
                                    )}
                                </div>
                            </div>
                            <Slider
                                range
                                min={0}
                                max={100}
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
                                            const newMax = Math.min(100, Math.max(val, engineLoadRange[0]));
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
                                        <input type="checkbox" {...register("alerts.oilLevel")} aria-label="Emitir alerta para nivel de aceite" />
                                        <span className="text-theme-sm">Emitir alerta</span>
                                    </label>
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("autoRequest.oilLevel")} aria-label="Solicitud automática para nivel de aceite" />
                                        <span className="text-theme-sm">Solicitud automática</span>
                                    </label>
                                    {watchAutoRequestOilLevel && (
                                        <select {...register("requestType.oilLevel", { required: watchAutoRequestOilLevel })} className="parametrization-input w-32" aria-label="Tipo de solicitud para nivel de aceite">
                                            <option value="">Seleccione...</option>
                                            {maintenanceTypeList.map(rt => <option key={rt.id_maintenance} value={rt.id_maintenance}>{rt.name}</option>)}
                                        </select>
                                    )}
                                </div>
                            </div>
                            <Slider
                                range
                                min={0}
                                max={100}
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
                                            const newMax = Math.min(100, Math.max(val, oilLevelRange[0]));
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
                                        <input type="checkbox" {...register("alerts.fuelLevel")} aria-label="Emitir alerta para nivel de combustible" />
                                        <span className="text-theme-sm">Emitir alerta</span>
                                    </label>
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("autoRequest.fuelLevel")} aria-label="Solicitud automática para nivel de combustible" />
                                        <span className="text-theme-sm">Solicitud automática</span>
                                    </label>
                                    {watchAutoRequestFuelLevel && (
                                        <select {...register("requestType.fuelLevel", { required: watchAutoRequestFuelLevel })} className="parametrization-input w-32" aria-label="Tipo de solicitud para nivel de combustible">
                                            <option value="">Seleccione...</option>
                                            {maintenanceTypeList.map(rt => <option key={rt.id_maintenance} value={rt.id_maintenance}>{rt.name}</option>)}
                                        </select>
                                    )}
                                </div>
                            </div>
                            <Slider
                                range
                                min={0}
                                max={100}
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
                                            const newMax = Math.min(100, Math.max(val, fuelLevelRange[0]));
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
                                        <input type="checkbox" {...register("alerts.fuelUsedGps")} aria-label="Emitir alerta para combustible usado" />
                                        <span className="text-theme-sm">Emitir alerta</span>
                                    </label>
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("autoRequest.fuelUsedGps")} aria-label="Solicitud automática para combustible usado" />
                                        <span className="text-theme-sm">Solicitud automática</span>
                                    </label>
                                    {watchAutoRequestFuelUsedGps && (
                                        <select {...register("requestType.fuelUsedGps", { required: watchAutoRequestFuelUsedGps })} className="parametrization-input w-32" aria-label="Tipo de solicitud para combustible usado">
                                            <option value="">Seleccione...</option>
                                            {maintenanceTypeList.map(rt => <option key={rt.id_maintenance} value={rt.id_maintenance}>{rt.name}</option>)}
                                        </select>
                                    )}
                                </div>
                            </div>
                            <Slider
                                range
                                min={0}
                                max={4294967}
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
                                            const newMax = Math.min(4294967, Math.max(val, fuelUsedGpsRange[0]));
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
                                        <input type="checkbox" {...register("alerts.instantFuelConsumption")} aria-label="Emitir alerta para consumo instantáneo" />
                                        <span className="text-theme-sm">Emitir alerta</span>
                                    </label>
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("autoRequest.instantFuelConsumption")} aria-label="Solicitud automática para consumo instantáneo" />
                                        <span className="text-theme-sm">Solicitud automática</span>
                                    </label>
                                    {watchAutoRequestInstantFuelConsumption && (
                                        <select {...register("requestType.instantFuelConsumption", { required: watchAutoRequestInstantFuelConsumption })} className="parametrization-input w-32" aria-label="Tipo de solicitud para consumo instantáneo">
                                            <option value="">Seleccione...</option>
                                            {maintenanceTypeList.map(rt => <option key={rt.id_maintenance} value={rt.id_maintenance}>{rt.name}</option>)}
                                        </select>
                                    )}
                                </div>
                            </div>
                            <Slider
                                range
                                min={0}
                                max={32767}
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
                                            const newMax = Math.min(32767, Math.max(val, instantFuelConsumptionRange[0]));
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
                                        <input type="checkbox" {...register("alerts.totalOdometer")} aria-label="Emitir alerta para odómetro total" />
                                        <span className="text-theme-sm">Emitir alerta</span>
                                    </label>
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("autoRequest.totalOdometer")} aria-label="Solicitud automática para odómetro total" />
                                        <span className="text-theme-sm">Solicitud automática</span>
                                    </label>
                                    {watchAutoRequestTotalOdometer && (
                                        <select {...register("requestType.totalOdometer", { required: watchAutoRequestTotalOdometer })} className="parametrization-input w-32" aria-label="Tipo de solicitud para odómetro total">
                                            <option value="">Seleccione...</option>
                                            {maintenanceTypeList.map(rt => <option key={rt.id_maintenance} value={rt.id_maintenance}>{rt.name}</option>)}
                                        </select>
                                    )}
                                </div>
                            </div>
                            <Slider
                                range
                                min={0}
                                max={2147483647}
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
                                            const newMax = Math.min(2147483647, Math.max(val, totalOdometerRange[0]));
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
                                        <input type="checkbox" {...register("alerts.tripOdometer")} aria-label="Emitir alerta para odómetro de viaje" />
                                        <span className="text-theme-sm">Emitir alerta</span>
                                    </label>
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input type="checkbox" {...register("autoRequest.tripOdometer")} aria-label="Solicitud automática para odómetro de viaje" />
                                        <span className="text-theme-sm">Solicitud automática</span>
                                    </label>
                                    {watchAutoRequestTripOdometer && (
                                        <select {...register("requestType.tripOdometer", { required: watchAutoRequestTripOdometer })} className="parametrization-input w-32" aria-label="Tipo de solicitud para odómetro de viaje">
                                            <option value="">Seleccione...</option>
                                            {maintenanceTypeList.map(rt => <option key={rt.id_maintenance} value={rt.id_maintenance}>{rt.name}</option>)}
                                        </select>
                                    )}
                                </div>
                            </div>
                            <Slider
                                range
                                min={0}
                                max={2147483647}
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
                                            const newMax = Math.min(2147483647, Math.max(val, tripOdometerRange[0]));
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
                            
                            {/* Buscador de códigos OBD */}
                            <div className="mb-4">
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={obdSearchCode}
                                        onChange={(e) => {
                                            setObdSearchCode(e.target.value.toUpperCase());
                                            setObdSearchError("");
                                        }}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSearchObd();
                                            }
                                        }}
                                        placeholder="Ingrese código OBD (ej: P0087)" 
                                        className="parametrization-input flex-1" 
                                        aria-label="Buscar códigos de falla OBD"
                                        disabled={isSearchingObd}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSearchObd}
                                        disabled={isSearchingObd}
                                        className="btn-theme btn-primary px-4"
                                        aria-label="Buscar código OBD"
                                    >
                                        {isSearchingObd ? "Buscando..." : "Buscar"}
                                    </button>
                                </div>
                                {obdSearchError && (
                                    <p className="text-theme-xs text-error mt-2">{obdSearchError}</p>
                                )}
                            </div>

                            {/* Lista de códigos OBD encontrados */}
                            {obdSearchResults.length > 0 ? (
                                <div className="space-y-3">
                                    {obdSearchResults.map(({ code, desc }) => (
                                        <div key={code} className="grid grid-cols-[2fr_auto_auto_1fr_auto] gap-4 items-center p-3 rounded-theme-md" style={{ backgroundColor: "var(--color-surface)" }}>
                                            <span className="text-theme-sm font-theme-medium">{code} - {desc}</span>
                                            <label className="flex items-center gap-2 whitespace-nowrap">
                                                <input type="checkbox" {...register(`alerts.obd.${code}`)} aria-label={`Emitir alerta para código ${code}`} />
                                                <span className="text-theme-sm">Emitir alerta</span>
                                            </label>
                                            <label className="flex items-center gap-2 whitespace-nowrap">
                                                <input type="checkbox" {...register(`autoRequest.obd.${code}`)} aria-label={`Solicitud automática para código ${code}`} />
                                                <span className="text-theme-sm">Solicitud automática</span>
                                            </label>
                                            {watchAutoRequestObd?.[code] && (
                                                <select {...register(`requestType.obd.${code}`, { required: watchAutoRequestObd?.[code] })} className="parametrization-input" aria-label={`Tipo de solicitud para código ${code}`}>
                                                    <option value="">Seleccione...</option>
                                                    {maintenanceTypeList.map(rt => <option key={rt.id_maintenance} value={rt.id_maintenance}>{rt.name}</option>)}
                                                </select>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveObdCode(code)}
                                                className="text-error hover:opacity-80 transition-opacity"
                                                aria-label={`Eliminar código ${code}`}
                                                title="Eliminar código"
                                            >
                                                <FaTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-secondary">
                                    <FaInfoCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-theme-sm">No hay códigos OBD agregados</p>
                                    <p className="text-theme-xs mt-1">Busque un código para agregarlo a la lista</p>
                                </div>
                            )}
                        </div>
                        {/* Event Type (Driving) */}
                        <div className="space-y-4">
                            <label className="block text-theme-sm font-theme-medium">Tipo de Evento (Conducción)</label>
                            {eventTypesList && eventTypesList.length > 0 ? (
                                <div className="grid grid-cols-3 gap-4">
                                    {eventTypesList.map((event) => (
                                        <div 
                                            key={event.id_event_type} 
                                            className="card-theme"
                                            style={{
                                                border: "1px solid var(--color-border)",
                                                borderRadius: "var(--border-radius-md)",
                                            }}
                                        >
                                            <div className="flex items-center gap-2 mb-3">
                                                <input 
                                                    type="checkbox" 
                                                    checked={expandedEventsByType[event.id_event_type] || false}
                                                    onChange={() => toggleEventByType(event.id_event_type)}
                                                    aria-label={`Activar evento de ${event.name}`}
                                                />
                                                <span className="font-theme-medium text-theme-sm">{event.name}</span>
                                            </div>
                                            {expandedEventsByType[event.id_event_type] && (
                                                <div className="space-y-3 pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
                                                    <div>
                                                        <label className="block text-theme-xs font-theme-medium mb-2">Event G - Value</label>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-theme-sm">Umbral:</span>
                                                            <input 
                                                                type="number" 
                                                                placeholder="0" 
                                                                min="0"
                                                                max="255"
                                                                {...register(`thresholds.event.${event.id_event_type}`, {
                                                                    min: 0,
                                                                    max: 255
                                                                })} 
                                                                className="parametrization-input w-20"
                                                                aria-label={`Umbral para ${event.name}`}
                                                            />
                                                            <span className="text-theme-xs text-secondary">G×100 (± 1.50 G)</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <label className="flex items-center gap-1">
                                                            <input type="checkbox" {...register(`alerts.event.${event.id_event_type}`)} aria-label={`Emitir alerta para evento de ${event.name}`} />
                                                            <span className="text-theme-xs">Emitir alerta</span>
                                                        </label>
                                                        <label className="flex items-center gap-1">
                                                            <input type="checkbox" {...register(`autoRequest.event.${event.id_event_type}`)} aria-label={`Solicitud automática para evento de ${event.name}`} />
                                                            <span className="text-theme-xs">Solicitud automática</span>
                                                        </label>
                                                    </div>
                                                    {watchAutoRequestEvent?.[event.id_event_type] && (
                                                        <select {...register(`requestType.event.${event.id_event_type}`, { required: watchAutoRequestEvent?.[event.id_event_type] })} className="parametrization-input w-full" aria-label={`Tipo de solicitud para evento de ${event.name}`}>
                                                            <option value="">Seleccione...</option>
                                                            {maintenanceTypeList.map(rt => <option key={rt.id_maintenance} value={rt.id_maintenance}>{rt.name}</option>)}
                                                        </select>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-secondary">
                                    <FaInfoCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-theme-sm">No hay tipos de eventos disponibles</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}