"use client";
import { useState, useEffect } from "react";
import { useForm, FormProvider, get } from "react-hook-form";
import Step1GeneralData from "./Step1GeneralData";
import Step2TrackerData from "./Step2TrackerData";
import Step3SpecificData from "./Step3SpecificData";
import Step4UsageInfo from "./Step4UsageInfo";
import Step5Maintenance from "./Step5Maintenance";
import Step6UploadDocs from "./Step6UploadDocs";
import { getCountries, getStates, getCities } from "@/services/locationService";
import { useTheme } from "@/contexts/ThemeContext";
import { FiX } from "react-icons/fi";
import {
  getActiveMachinery,
  getActiveMachine,
  getModelsByBrandId,
  getMachineryBrands,
  registerGeneralData,
  getMaintenanceTypes,
  getDistanceUnits,
  getTenureTypes,
  getUseStates,
  registerUsageInfo,
  getTelemetryDevices,
  getPowerUnits,
  registerInfoTracker,
  getVolumeUnits,
  getFlowConsumptionUnits,
  getWeightUnits,
  getSpeedUnits,
  getForceUnits,
  getDimensionUnits,
  getPerformanceUnits,
  getPressureUnits,
  getEngineTypes,
  getCylinderArrangementTypes,
  getTractionTypes,
  getTransmissionSystemTypes,
  getAirConditioningSystemTypes,
  getEmissionLevelTypes,
  getCabinTypes,
  createSpecificTechnicalSheet,
  confirmMachineryRegistration,
  getMachineryStatus,
  getGeneralData,
  updateGeneralData,
  getUsageInfo,
  updateUsageInfo,
  getSpecificTechnicalSheet,
  updateSpecificTechnicalSheet,
  getTrackerInfo,
  updateInfoTracker,
} from "@/services/machineryService";
import { SuccessModal, ErrorModal } from "../../shared/SuccessErrorModal";

export default function MultiStepFormModal({
  isOpen,
  onClose,
  machineryToEdit,
  onSuccess,
}) {
  const isEditMode = !!machineryToEdit;
  const [step, setStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [countriesList, setCountriesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [machineryList, setMachineryList] = useState([]);
  const [machineList, setMachineList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [modelsList, setModelsList] = useState([]);
  const [distanceUnitsList, setDistanceUnitsList] = useState([]);
  const [tenureTypesList, setTenureTypeList] = useState([]);
  const [usageStatesList, setUsageStatesList] = useState([]);
  const [telemetryDevicesList, setTelemetryDevicesList] = useState([]);
  const [maintenanceTypeList, setMaintenanceTypeList] = useState([]);
  const [isSubmittingStep, setIsSubmittingStep] = useState(false);
  const [machineryId, setMachineryId] = useState(null); // Para almacenar el ID devuelto por el backend
  const [id, setId] = useState(""); //id del usuario responsable
  const [isConfirmingRegistration, setIsConfirmingRegistration] =
    useState(false);

  const [specificTechnicalSheetId, setSpecificTechnicalSheetId] =
    useState(null);
  const [powerUnitsList, setPowerUnitsList] = useState([]);
  const [volumeUnitsList, setVolumeUnitsList] = useState([]);
  const [flowConsumptionUnitsList, setFlowConsumptionUnitsList] = useState([]);
  const [weightUnitsList, setWeightUnitsList] = useState([]);
  const [speedUnitsList, setSpeedUnitsList] = useState([]);
  const [forceUnitsList, setForceUnitsList] = useState([]);
  const [dimensionUnitsList, setDimensionUnitsList] = useState([]);
  const [performanceUnitsList, setPerformanceUnitsList] = useState([]);
  const [pressureUnitsList, setPressureUnitsList] = useState([]);

  const [engineTypesList, setEngineTypesList] = useState([]);
  const [cylinderArrangementList, setCylinderArrangementList] = useState([]);
  const [tractionTypesList, setTractionTypesList] = useState([]);
  const [transmissionSystemList, setTransmissionSystemList] = useState([]);
  const [airConditioningList, setAirConditioningList] = useState([]);
  const [emissionLevelList, setEmissionLevelList] = useState([]);
  const [cabinTypesList, setCabinTypesList] = useState([]);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [machineryStatuesList, setMachineryStatuesList] = useState([]);
  const [idUsageSheet, setIdUsageSheet] = useState(null); // Para almacenar el ID de la hoja de uso
  const [idTrackerSheet, setIdTrackerSheet] = useState(null); // Para almacenar el ID del tracker
  const [operationalStatus, setOperationalStatus] = useState(null); // Estado operativo actual de la maquinaria
  // Hook del tema
  const { getCurrentTheme } = useTheme();
  const defaultValues = {
    // Step 1 - General Data
    name: "",
    manufactureYear: "",
    serialNumber: "",
    machineryType: "",
    brand: "",
    model: "",
    tariff: "",
    category: "",
    country: "",
    department: "",
    city: "",
    telemetry: "", // Este es opcional
    photo: null,
    machineryStatues: "",
    justificationGeneralData: "",

    // Step 2 - Tracker Data
    terminalSerial: "",
    chasisNumber: "",
    gpsSerial: "",
    engineNumber: "",
    justificationTrackerInfo: "",

    // Step 3 - Specific Data
    enginePower: "",
    enginePowerUnit: "",
    engineType: "",
    cylinderCapacity: "",
    cylinderCapacityUnit: "",
    cylindersNumber: "",
    arrangement: "",
    traction: "",
    fuelConsumption: "",
    fuelConsumptionUnit: "",
    transmissionSystem: "",
    tankCapacity: "",
    tankCapacityUnit: "",
    carryingCapacity: "",
    carryingCapacityUnit: "",
    darftForce: "",
    darftForceUnit: "",
    operatingWeight: "",
    operatingWeightUnit: "",
    maxSpeed: "",
    maxSpeedUnit: "",
    maxOperatingAltitud: "",
    maxOperatingAltitudUnit: "",
    performanceUnit: "",
    performanceMin: "",
    performanceMax: "",
    dimensionsUnit: "",
    width: "",
    length: "",
    height: "",
    netWeight: "",
    netWeightUnit: "",
    airConditioning: "",
    airConditioningConsumption: "",
    airConditioningConsumptionUnit: "",
    maximumOperatingHydraulicPressure: "",
    maximumOperatingHydraulicPressureUnit: "",
    hydraulicPumpFlowRate: "",
    hydraulicPumpFlowRateUnit: "",
    hydraulicReservoryCapacity: "",
    hydraulicReservoryCapacityUnit: "",
    emissionLevel: "",
    cabinType: "",

    // Step 4 - Usage Information
    acquisitionDate: "",
    usageState: "",
    usedHours: "",
    mileage: "",
    mileageUnit: "",
    tenure: "",
    ownership: false,
    contractEndDate: "",
    justificationUsageInfo: "",

    // Step 5 - Maintenance Data
    maintenace: "",
    usageHours: "",

    // Step 6 - Documentation
    documentName: "",
    file: "",
  };

  const methods = useForm({
    defaultValues: defaultValues,
    mode: "onChange",
  });

  const watchCountry = methods.watch("country");
  const watchState = methods.watch("department");
  const watchBrand = methods.watch("brand");

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setId(parsed.id);
      } catch (err) {
        console.error("Error parsing userData", err);
      }
    }
  }, []);


  useEffect(() => {
    if (!isOpen) {
      // Cuando el modal se cierra, resetear todo
      methods.reset(defaultValues);
      setStep(0);
      setCompletedSteps([]);
      setMachineryId(null);
      setIdUsageSheet(null);
      setSpecificTechnicalSheetId(null);
      setIdTrackerSheet(null);
      return;
    }

    if (isOpen && isEditMode && machineryToEdit && brandsList.length > 0 && countriesList.length > 0) {
      // Cargar datos del Paso 1
      getGeneralData(machineryToEdit.id_machinery).then((data) => {
        const mappedData = {
          name: data.machinery_name,
          manufactureYear: data.manufacturing_year,
          serialNumber: data.serial_number,
          machineryType: data.machinery_secondary_type,
          brand: data.brand_id,
          model: data.id_model,
          tariff: data.tariff_subheading,
          category: data.machinery_type,
          country: data.id_country,
          department: data.id_department,
          city: data.id_city,
          telemetry: data.id_device,
          photo: null,
        };

        if (data.machinery_operational_status !== 3) {
          mappedData.machineryStatues = data.machinery_operational_status;
        };

        methods.reset({
          ...defaultValues,  // ← CAMBIO: Partir de valores limpios
          ...mappedData,
        });
        setMachineryId(machineryToEdit.id_machinery);
        setOperationalStatus(machineryToEdit.id_machinery_operational_status);
      });

      // Cargar datos del Paso 2 - Tracker
      getTrackerInfo(machineryToEdit.id_machinery)
        .then((trackerData) => {
          if (trackerData) {
            const trackerMappedData = {
              terminalSerial: trackerData.terminal_serial_number || "",
              gpsSerial: trackerData.gps_serial_number || "",
              chasisNumber: trackerData.chassis_number || "",
              engineNumber: trackerData.engine_number || "",
            };

            methods.reset({
              ...methods.getValues(),
              ...trackerMappedData,
            });
            setIdTrackerSheet(trackerData.id_tracker_sheet);
          }
        })
        .catch((error) => {
          console.warn("No tracker data found for this machinery:", error);
          setIdTrackerSheet(null);
        });

      // Cargar datos del Paso 3 - Ficha Técnica Específica
      getSpecificTechnicalSheet(machineryToEdit.id_machinery)
        .then((response) => {
          // IMPORTANTE: Verificar si la respuesta es exitosa Y tiene datos
          if (response && response.success !== false) {
            const data = response;
            const mappedStep3Data = {
              // Motor y Transmisión
              enginePower: data.power,
              enginePowerUnit: data.power_unit,
              engineType: data.engine_type,
              cylinderCapacity: data.cylinder_capacity,
              cylinderCapacityUnit: data.cylinder_capacity_unit,
              cylindersNumber: data.cylinder_count,
              arrangement: data.cylinder_arrangement_type,
              traction: data.traction_type,
              fuelConsumption: data.fuel_consumption,
              fuelConsumptionUnit: data.fuel_consumption_unit,
              transmissionSystem: data.transmission_system_type,

              // Capacidad y Rendimiento
              tankCapacity: data.fuel_capacity,
              tankCapacityUnit: data.fuel_capacity_unit,
              carryingCapacity: data.carrying_capacity,
              carryingCapacityUnit: data.carrying_capacity_unit,
              draftForce: data.draft_force,
              draftForceUnit: data.draft_force_unit,
              operatingWeight: data.operating_weight,
              operatingWeightUnit: data.operating_weight_unit,
              maxSpeed: data.max_speed,
              maxSpeedUnit: data.max_speed_unit,
              maxOperatingAltitude: data.maximum_altitude,
              maxOperatingAltitudeUnit: data.maximum_altitude_unit,
              performanceMin: data.minimum_performance,
              performanceMax: data.maximum_performance,
              performanceUnit: data.performance_unit,

              // Dimensiones y Peso
              width: data.width,
              length: data.length,
              height: data.height,
              dimensionsUnit: data.dimension_unit,
              netWeight: data.net_weight,
              netWeightUnit: data.net_weight_unit,

              // Sistemas Auxiliares
              airConditioning: data.air_conditioning_system_type,
              airConditioningConsumption:
                data.air_conditioning_system_consumption,
              airConditioningConsumptionUnit:
                data.air_conditioning_system_consumption_unit,
              maxHydraulicPressure: data.maximum_working_pressure,
              maxHydraulicPressureUnit: data.maximum_working_pressure_unit,
              hydraulicPumpFlowRate: data.pump_flow,
              hydraulicPumpFlowRateUnit: data.pump_flow_unit,
              hydraulicReservoirCapacity: data.hydraulic_tank_capacity,
              hydraulicReservoirCapacityUnit: data.hydraulic_tank_capacity_unit,

              // Normatividad
              emissionLevel: data.emission_level_type,
              cabinType: data.cabin_type,
            };

            methods.reset({
              ...methods.getValues(),
              ...mappedStep3Data,
            });

            setSpecificTechnicalSheetId(data.id_specific_sheet);
          } else {
            // No hay ficha técnica, pero NO es un error - es una situación normal
            setSpecificTechnicalSheetId(null);
          }
        })
        .catch((error) => {
          // CAMBIO IMPORTANTE: No mostrar error, solo log
          setSpecificTechnicalSheetId(null);
          // NO llamar setErrorOpen ni setModalMessage aquí
        });

      // Cargar datos del Paso 4 - Información de Uso
      getUsageInfo(machineryToEdit.id_machinery)
        .then((data) => {
          if (data) {
            const mappedData = {
              acquisitionDate: data.acquisition_date,
              usageState: data.usage_condition,
              usedHours: data.usage_hours,
              mileage: data.distance_value,
              mileageUnit: data.distance_unit,
              tenure: data.tenancy_type,
              ownership: data.is_own,
              contractEndDate: data.contract_end_date,
            };
            methods.reset({
              ...methods.getValues(),
              ...mappedData,
            });
            setIdUsageSheet(data.id_usage_sheet);
          }
        })
        .catch((error) => {
          console.warn("No usage info found for this machinery:", error);
          setIdUsageSheet(null);
        });
    } else {
      // MODO CREACIÓN: Resetear a valores por defecto
      methods.reset(defaultValues);
      setMachineryId(null);
      setIdUsageSheet(null);
      setSpecificTechnicalSheetId(null);
      setIdTrackerSheet(null);
    }
  }, [isOpen, isEditMode, machineryToEdit, methods, machineryList]);

  // Cuando cambia la marca, actualizamos los modelos
  useEffect(() => {
    const fetchModels = async () => {
      if (!watchBrand) {
        setModelsList([]);
        return;
      }

      try {
        const models = await getModelsByBrandId(watchBrand);
        setModelsList(models.data);
        if (!isEditMode || methods.getValues('model') === '') {
          methods.setValue("model", "");
        }
      } catch (error) {
        console.error("Error loading models:", error);
        setModelsList([]);
      }
    };

    fetchModels();
  }, [watchBrand]);

  // Cargar selects de todos los pasos
  useEffect(() => {
    const fetchSelects = async () => {
      try {
        const machinery = await getActiveMachinery();
        const machine = await getActiveMachine();
        const brands = await getMachineryBrands();
        const distanceUnits = await getDistanceUnits();
        const tenureTypes = await getTenureTypes();
        const usageStates = await getUseStates();
        const maintenanceTypes = await getMaintenanceTypes();
        const telemetryDevices = await getTelemetryDevices();
        const machineryStatues = await getMachineryStatus();

        // Units
        const power = await getPowerUnits();
        const volume = await getVolumeUnits();
        const flow = await getFlowConsumptionUnits();
        const weight = await getWeightUnits();
        const speed = await getSpeedUnits();
        const force = await getForceUnits();
        const dimension = await getDimensionUnits();
        const performance = await getPerformanceUnits();
        const pressure = await getPressureUnits();

        // Types
        const engine = await getEngineTypes();
        const cylinder = await getCylinderArrangementTypes();
        const traction = await getTractionTypes();
        const transmission = await getTransmissionSystemTypes();
        const airCond = await getAirConditioningSystemTypes();
        const emission = await getEmissionLevelTypes();
        const cabin = await getCabinTypes();

        setMachineryList(machinery);
        setMachineList(machine);
        setBrandsList(brands.data);
        setDistanceUnitsList(distanceUnits.data);
        setTenureTypeList(tenureTypes);
        setUsageStatesList(usageStates);
        setMaintenanceTypeList(maintenanceTypes.data);
        setTelemetryDevicesList(telemetryDevices);
        setMachineryStatuesList(machineryStatues);

        setEngineTypesList(
          Array.isArray(engine.data || engine) ? engine.data || engine : []
        );
        setCylinderArrangementList(
          Array.isArray(cylinder.data || cylinder)
            ? cylinder.data || cylinder
            : []
        );
        setTractionTypesList(
          Array.isArray(traction.data || traction)
            ? traction.data || traction
            : []
        );
        setTransmissionSystemList(
          Array.isArray(transmission.data || transmission)
            ? transmission.data || transmission
            : []
        );
        setAirConditioningList(
          Array.isArray(airCond.data || airCond) ? airCond.data || airCond : []
        );
        setEmissionLevelList(
          Array.isArray(emission.data || emission)
            ? emission.data || emission
            : []
        );
        setCabinTypesList(
          Array.isArray(cabin.data || cabin) ? cabin.data || cabin : []
        );
        setPowerUnitsList(power.data);
        setVolumeUnitsList(volume.data);
        setFlowConsumptionUnitsList(flow.data);
        setWeightUnitsList(weight.data);
        setSpeedUnitsList(speed.data);
        setForceUnitsList(force.data);
        setDimensionUnitsList(dimension.data);
        setPerformanceUnitsList(performance.data);
        setPressureUnitsList(pressure.data);
      } catch (error) {
        console.error("Error loading selects:", error);
      }
    };

    if (isOpen) {
      fetchSelects();
    }
  }, [isOpen]);

  // Cargar países al montar el componente
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countries = await getCountries();
        setCountriesList(countries);
      } catch (error) {
        console.error("Error loading countries:", error);
      }
    };
    console.log(watchCountry);
    if (isOpen) {
      loadCountries();
    }
  }, [isOpen]);

  // Cuando cambia el país, carga los estados/departamentos
  useEffect(() => {
    const loadStates = async () => {
      if (!watchCountry) {
        setStatesList([]);
        setCitiesList([]);
        return;
      }

      setIsLoadingStates(true);
      try {
        const states = await getStates(watchCountry);
        setStatesList(states);
        setCitiesList([]);
        if (!isEditMode || methods.getValues('department') === '') {
          methods.setValue("department", "");
          methods.setValue("city", "");
        }
      } catch (error) {
        console.error("Error loading states:", error);
        setStatesList([]);
      } finally {
        setIsLoadingStates(false);
      }
    };

    loadStates();
  }, [watchCountry]);

  // Cuando cambia el estado/departamento, carga las ciudades
  useEffect(() => {
    const loadCities = async () => {
      if (!watchCountry || !watchState) {
        setCitiesList([]);
        return;
      }

      setIsLoadingCities(true);
      try {
        const cities = await getCities(watchCountry, watchState);
        setCitiesList(cities);
        if (!isEditMode || methods.getValues('city') === '') {
          methods.setValue("city", "");
        }
      } catch (error) {
        console.error("Error loading cities:", error);
        setCitiesList([]);
      } finally {
        setIsLoadingCities(false);
      }
    };

    loadCities();
  }, [watchCountry, watchState]);

  const steps = [
    { id: 1, name: "Ficha técnica general" },
    { id: 2, name: "Ficha técnica del rastreador" },
    { id: 3, name: "Ficha técnica específica" },
    { id: 4, name: "Información de uso" },
    { id: 5, name: "Mantenimiento periódico" },
    { id: 6, name: "Subir documentación" },
  ];

  // Función para validar el paso 1
  const validateStep1 = () => {
    const currentValues = methods.getValues();
    const requiredFields = [
      "name",
      "manufactureYear",
      "serialNumber",
      "machineryType",
      "brand",
      "model",
      "tariff",
      "category",
      // 'telemetry' no está incluido porque es opcional
    ];

    // Verificar si todos los campos requeridos están completos
    const missingFields = requiredFields.filter((field) => {
      const value = currentValues[field];
      return !value || (typeof value === "string" && value.trim() === "");
    });

    if (missingFields.length > 0) {
      // Establecer errores manualmente para los campos faltantes
      missingFields.forEach((field) => {
        methods.setError(field, {
          type: "required",
          message: "Este campo es obligatorio",
        });
      });
      return false;
    }

    return true;
  };

  // Función para validar el paso 2
  const validateStep2 = () => {
    const currentValues = methods.getValues();
    const requiredFields = ["terminalSerial"];

    // Verificar si todos los campos requeridos están completos
    const missingFields = requiredFields.filter((field) => {
      const value = currentValues[field];
      return !value || (typeof value === "string" && value.trim() === "");
    });

    if (missingFields.length > 0) {
      // Establecer errores manualmente para los campos faltantes
      missingFields.forEach((field) => {
        methods.setError(field, {
          type: "required",
          message: "Este campo es obligatorio",
        });
      });
      return false;
    }

    return true;
  };

  // Función para validar el paso 3
  const validateStep3 = async () => {
    const currentValues = methods.getValues();

    // Limpiar errores existentes
    methods.clearErrors();

    // Campos obligatorios base
    const requiredFields = [
      "enginePower",
      "enginePowerUnit",
      "engineType",
      "cylinderCapacity",
      "cylinderCapacityUnit",
      "cylindersNumber",
      "arrangement",
      "fuelConsumption",
      "fuelConsumptionUnit",
      "transmissionSystem",
      "operatingWeight",
      "operatingWeightUnit",
      "maxSpeed",
      "maxSpeedUnit",
      "performanceUnit",
      "dimensionsUnit",
      "width",
      "length",
      "height",
      "netWeight",
      "netWeightUnit",
    ];

    let hasErrors = false;

    // Validar campos obligatorios
    requiredFields.forEach((field) => {
      const value = currentValues[field];
      if (
        !value ||
        value === "" ||
        (typeof value === "string" && value.trim() === "")
      ) {
        methods.setError(field, {
          type: "required",
          message: "Este campo es obligatorio",
        });
        hasErrors = true;
      }
    });

    // Validar que si hay un valor opcional, debe tener su unidad
    const optionalFieldsWithUnits = [
      { field: "tankCapacity", unit: "tankCapacityUnit" },
      { field: "carryingCapacity", unit: "carryingCapacityUnit" },
      { field: "draftForce", unit: "draftForceUnit" },
      { field: "maxOperatingAltitude", unit: "maxOperatingAltitudeUnit" },
      {
        field: "airConditioningConsumption",
        unit: "airConditioningConsumptionUnit",
      },
      { field: "maxHydraulicPressure", unit: "maxHydraulicPressureUnit" },
      { field: "hydraulicPumpFlowRate", unit: "hydraulicPumpFlowRateUnit" },
      {
        field: "hydraulicReservoirCapacity",
        unit: "hydraulicReservoirCapacityUnit",
      },
    ];

    optionalFieldsWithUnits.forEach(({ field, unit }) => {
      const fieldValue = currentValues[field];
      const unitValue = currentValues[unit];

      if (fieldValue && (!unitValue || unitValue === "")) {
        methods.setError(unit, {
          type: "required",
          message: "Debe seleccionar una unidad cuando hay un valor",
        });
        hasErrors = true;
      }
    });

    // Validar rangos de performance
    if (currentValues.performanceMin && currentValues.performanceMax) {
      if (
        parseFloat(currentValues.performanceMin) >=
        parseFloat(currentValues.performanceMax)
      ) {
        methods.setError("performanceMin", {
          type: "validate",
          message: "El RPM mínimo debe ser menor al máximo",
        });
        hasErrors = true;
      }
    }

    // Validar valores numéricos
    const numericValidations = [
      {
        field: "enginePower",
        min: 0.1,
        max: 10000,
        name: "La potencia del motor",
      },
      { field: "cylinderCapacity", min: 1, max: 50000, name: "El cilindraje" },
      {
        field: "cylindersNumber",
        min: 1,
        max: 32,
        name: "El número de cilindros",
        integer: true,
      },
      {
        field: "fuelConsumption",
        min: 0.1,
        max: 1000,
        name: "El consumo de combustible",
      },
      {
        field: "operatingWeight",
        min: 0.1,
        max: 1000000,
        name: "El peso operativo",
      },
      { field: "maxSpeed", min: 0.1, max: 500, name: "La velocidad máxima" },
      { field: "width", min: 0.01, max: 100, name: "El ancho" },
      { field: "length", min: 0.01, max: 100, name: "El largo" },
      { field: "height", min: 0.01, max: 50, name: "El alto" },
      { field: "netWeight", min: 0.1, max: 1000000, name: "El peso neto" },
    ];

    numericValidations.forEach(({ field, min, max, name, integer }) => {
      const value = currentValues[field];
      if (value && value !== "") {
        const numValue = parseFloat(value);

        if (isNaN(numValue)) {
          methods.setError(field, {
            type: "validate",
            message: `${name} debe ser un número válido`,
          });
          hasErrors = true;
        } else if (numValue < min) {
          methods.setError(field, {
            type: "validate",
            message: `${name} debe ser mayor a ${min}`,
          });
          hasErrors = true;
        } else if (numValue > max) {
          methods.setError(field, {
            type: "validate",
            message: `${name} no puede exceder ${max}`,
          });
          hasErrors = true;
        } else if (integer && !Number.isInteger(numValue)) {
          methods.setError(field, {
            type: "validate",
            message: `${name} debe ser un número entero`,
          });
          hasErrors = true;
        }
      }
    });

    // Trigger validation para actualizar UI si hay errores
    if (hasErrors) {
      await methods.trigger();
      return false;
    }

    return true;
  };

  // Función para validar el paso 4
  const validateStep4 = () => {
    const currentValues = methods.getValues();
    const requiredFields = [
      "acquisitionDate",
      "usageState",
      "usedHours",
      "mileage",
      "mileageUnit",
    ];
    // Si ownership es false (switch apagado), agregar campos adicionales requeridos
    if (!currentValues.ownership) {
      requiredFields.push("tenure", "contractEndDate");
    }

    // Verificar si todos los campos requeridos están completos
    const missingFields = requiredFields.filter((field) => {
      const value = currentValues[field];
      return !value || (typeof value === "string" && value.trim() === "");
    });

    if (missingFields.length > 0) {
      // Establecer errores manualmente para los campos faltantes
      missingFields.forEach((field) => {
        methods.setError(field, {
          type: "required",
          message: "Este campo es obligatorio",
        });
      });
      return false;
    }

    return true;
  };

  // Helper function para detectar cambios en datos
  const hasDataChanged = (currentData, existingData, fieldMapping) => {
    return Object.keys(fieldMapping).some((formKey) => {
      const backendKey = fieldMapping[formKey];
      const currentValue = currentData[formKey];
      const existingValue = existingData[backendKey];

      // Normalizar valores para comparación
      const normalizedCurrent =
        currentValue === "" || currentValue === null || currentValue === undefined
          ? null
          : currentValue;
      const normalizedExisting =
        existingValue === "" || existingValue === null || existingValue === undefined
          ? null
          : existingValue;

      // Comparar valores normalizados
      return String(normalizedCurrent) !== String(normalizedExisting);
    });
  };

  // Función para manejar el envío del paso 1
  const submitStep1 = async (data) => {
    try {
      setIsSubmittingStep(true);

      // 1. GET datos actuales si es edición
      let existingData = null;
      if (machineryId) {
        existingData = await getGeneralData(machineryId);
      }

      // 2. Verificar cambios
      const fieldMapping = {
        name: "machinery_name",
        manufactureYear: "manufacturing_year",
        serialNumber: "serial_number",
        machineryType: "machinery_secondary_type",
        model: "id_model",
        tariff: "tariff_subheading",
        category: "machinery_type",
        country: "id_country",
        department: "id_department",
        city: "id_city",
        telemetry: "id_device"
      };
      const currentStatusId = existingData ? existingData.machinery_operational_status : null;

      // Solo incluir campos de estado si está en modo edición y NO está en registro
      if (isEditMode && currentStatusId !== 3) {
        fieldMapping.machineryStatues = "machinery_operational_status";
      }

      // Verificar si hay cambios (incluyendo foto)
      const hasChanges =
        !existingData ||
        hasDataChanged(data, existingData, fieldMapping) ||
        data.photo !== null; // Si hay nueva foto, siempre actualizar

      if (!hasChanges) {
        // No hay cambios, solo avanzar al siguiente paso
        setCompletedSteps((prev) => [...prev, 0]);
        setStep(1);
        return;
      }

      // 3. Crear FormData solo si hay cambios
      const formData = new FormData();
      formData.append("machinery_name", data.name);
      formData.append("manufacturing_year", data.manufactureYear);
      formData.append("serial_number", data.serialNumber);
      formData.append("machinery_secondary_type", data.machineryType);
      formData.append("id_model", data.model);
      formData.append("tariff_subheading", data.tariff);
      formData.append("machinery_type", data.category);
      formData.append("id_country", data.country);
      formData.append("id_department", data.department);
      formData.append("id_city", data.city);
      formData.append("responsible_user", id);

      if (data.telemetry) {
        formData.append("id_device", data.telemetry);
      }

      if (data.photo) {
        formData.append("image", data.photo);
      }

      if (isEditMode && currentStatusId !== 3 && data.machineryStatues) {
        formData.append("machinery_operational_status", data.machineryStatues);
        formData.append("justification", data.justificationGeneralData);
      }

      // 4. POST o PUT según corresponda
      if (!existingData) {
        const response = await registerGeneralData(formData);
        setMachineryId(response.machinery_id);
      } else {
        await updateGeneralData(machineryId, formData);
      }

      onSuccess();
      setCompletedSteps((prev) => [...prev, 0]);
      setStep(1);
    } catch (error) {
      let message =
        "Error al guardar los datos. Por favor, inténtelo de nuevo.";

      if (error.response?.data?.details || error.response?.data?.errors) {
        const details = error.response.data.details || error.response.data.errors;
        message = Object.entries(details)
          .map(([field, value]) => {
            if (Array.isArray(value)) {
              return value.join(" ");
            } else if (typeof value === "object" && value !== null) {
              return Object.values(value).join(" ");
            } else {
              return value;
            }
          })
          .join(" ");
      }

      setModalMessage(message);
      setErrorOpen(true);
    } finally {
      setIsSubmittingStep(false);
    }
  };

  const submitStep2 = async (data) => {
    try {
      setIsSubmittingStep(true);

      // 1. GET datos actuales si es edición
      let existingData = null;
      if (machineryId) {
        try{
          existingData = await getTrackerInfo(machineryId);
        }catch (error){
          existingData = null;
        }        
      }

      // 2. Verificar cambios
      const fieldMapping = {
        terminalSerial: "terminal_serial_number",
        gpsSerial: "gps_serial_number",
        chasisNumber: "chassis_number",
        engineNumber: "engine_number",
      };

      // Verificar si hay cambioss
      const hasChanges =
        !existingData ||
        hasDataChanged(data, existingData, fieldMapping);

      if (!hasChanges) {
        // No hay cambios, solo avanzar al siguiente paso
        setCompletedSteps((prev) => [...prev, 1]);
        setStep(2);
        return;
      }

      // Crear FormData para enviar los datos
      const formData = new FormData();
      formData.append("terminal_serial_number", data.terminalSerial);
      formData.append("gps_serial_number", data.gpsSerial);
      formData.append("chassis_number", data.chasisNumber);
      formData.append("engine_number", data.engineNumber);
      formData.append("responsible_user", id);

      if (data.justificationTrackerInfo) {
        formData.append("justification", data.justificationTrackerInfo);
      }     

      // Decidir si es CREATE o UPDATE
      if (existingData) {
        // MODO EDICIÓN: Actualizar tracker existente
        await updateInfoTracker(idTrackerSheet, formData);
      } else {
        // MODO CREACIÓN: Crear nuevo tracker

        // Para CREATE sí necesitamos id_machinery
        formData.append("id_machinery", machineryId);
        await registerInfoTracker(formData);
        try {
          const newTrackerData = await getTrackerInfo(machineryId);
          if (newTrackerData && newTrackerData.id_tracker_sheet) {
            setIdTrackerSheet(newTrackerData.id_tracker_sheet);
          }
        } catch {}
      }

      onSuccess();
      setCompletedSteps((prev) => [...prev, 1]);
      setStep(2);
    } catch (error) {
      console.error("Error submitting step 2:", error);

      let errorMessage = "Error al guardar la información del tracker.";

      if (error.response?.data?.terminal_serial_number) {
        errorMessage =
          "El número de serie del terminal ya está registrado. Por favor, ingrese un número diferente.";
      } else if (error.response?.data?.details) {
        errorMessage = Object.values(error.response.data.details)
          .flat()
          .join(" ");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setModalMessage(errorMessage);
      setErrorOpen(true);

      // CRÍTICO: Bloquear el avance al siguiente paso cuando hay error
      return;
    } finally {
      setIsSubmittingStep(false);
    }
  };

  const submitStep4 = async (data) => {
    try {
      setIsSubmittingStep(true);

      let existingData = null;
      if (machineryId) {
        try{
          existingData = await getUsageInfo(machineryId);
        }catch (error){
          existingData = null;
        }        
      }

      // 2. Verificar cambios
      const fieldMapping = {
        acquisitionDate: "acquisition_date",
        usageState: "usage_condition",
        usedHours: "usage_hours",
        mileage: "distance_value",
        mileageUnit: "distance_unit",        
        tenure: "tenancy_type",
        ownership: "is_own",
        contractEndDate: "contract_end_date",        
      };

      // Verificar si hay cambios
      const hasChanges =
        !existingData ||
        hasDataChanged(data, existingData, fieldMapping);

      if (!hasChanges) {
        // No hay cambios, solo avanzar al siguiente paso
        setCompletedSteps((prev) => [...prev, 3]);
        setStep(4);
        return;
      }

      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append("id_machinery", machineryId);
      formData.append("is_own", data.ownership);
      formData.append("acquisition_date", data.acquisitionDate);
      formData.append("usage_condition", data.usageState);
      formData.append("usage_hours", data.usedHours);
      formData.append("distance_value", data.mileage);
      formData.append("distance_unit", data.mileageUnit);
      formData.append("tenancy_type", data.tenure);
      formData.append("contract_end_date", data.contractEndDate);
      formData.append("responsible_user", id);

      if (data.justificationUsageInfo) {
        formData.append("justification", data.justificationUsageInfo);
      }      

      if (!existingData) {
        await registerUsageInfo(formData);
        try {
          const newUsageData = await getUsageInfo(machineryId);
          if (newUsageData && newUsageData.id_usage_sheet) {
            setIdUsageSheet(newUsageData.id_usage_sheet);
          }
        } catch {}
      } else {
        await updateUsageInfo(idUsageSheet, formData);
      }
      onSuccess();
      setCompletedSteps((prev) => [...prev, 3]);
      setStep(4);
    } catch (error) {
      let message =
        "Error al guardar los datos. Por favor, inténtelo de nuevo.";

      if (error.response?.data?.details) {
        const details = error.response.data.details;
        // Recorre cada campo y concatena los mensajes
        message = Object.entries(details)
          .map(([field, value]) => {
            if (Array.isArray(value)) {
              // Si es un array de mensajes
              return value.join(" ");
            } else if (typeof value === "object" && value !== null) {
              // Si es un objeto anidado (como image.image)
              return Object.values(value).join(" ");
            } else {
              // Mensaje simple
              return value;
            }
          })
          .join(" ");
      }
      setModalMessage(message);
      setErrorOpen(true);
    } finally {
      setIsSubmittingStep(false);
    }
  };

  const submitStep3 = async (data) => {
    try {
      setIsSubmittingStep(true);

      // 1. Verificar si ya existen datos del Step3
      let existingStep3Data = null;
      if (machineryId) {
        try {
          existingStep3Data = await getSpecificTechnicalSheet(machineryId);
        } catch (error) {
          existingStep3Data = null;
        }
      }      
      // 2. Verificar cambios
      const fieldMapping = {
        enginePower: "power",
        enginePowerUnit: "power_unit",
        engineType: "engine_type",
        cylinderCapacity: "cylinder_capacity",
        cylinderCapacityUnit: "cylinder_capacity_unit",
        cylindersNumber: "cylinder_count",
        arrangement: "cylinder_arrangement_type",
        traction: "traction_type",
        fuelConsumption: "fuel_consumption",
        fuelConsumptionUnit: "fuel_consumption_unit",
        transmissionSystem: "transmission_system_type",
        tankCapacity: "fuel_capacity",
        tankCapacityUnit: "fuel_capacity_unit",
        carryingCapacity: "carrying_capacity",
        carryingCapacityUnit: "carrying_capacity_unit",
        draftForce: "draft_force",
        draftForceUnit: "draft_force_unit",
        operatingWeight: "operating_weight",
        operatingWeightUnit: "operating_weight_unit",
        maxSpeed: "max_speed",
        maxSpeedUnit: "max_speed_unit",
        maxOperatingAltitude: "maximum_altitude",
        maxOperatingAltitudeUnit: "maximum_altitude_unit",
        performanceMin: "minimum_performance",
        performanceMax: "maximum_performance",
        performanceUnit: "performance_unit",
        width: "width",
        length: "length",
        height: "height",
        dimensionsUnit: "dimension_unit",
        netWeight: "net_weight",
        netWeightUnit: "net_weight_unit",
        airConditioning: "air_conditioning_system_type",
        airConditioningConsumption: "air_conditioning_system_consumption",
        airConditioningConsumptionUnit: "air_conditioning_system_consumption_unit",
        maxHydraulicPressure: "maximum_working_pressure",
        maxHydraulicPressureUnit: "maximum_working_pressure_unit",
        hydraulicPumpFlowRate: "pump_flow",
        hydraulicPumpFlowRateUnit: "pump_flow_unit",
        hydraulicReservoirCapacity: "hydraulic_tank_capacity",
        hydraulicReservoirCapacityUnit: "hydraulic_tank_capacity_unit",
        emissionLevel: "emission_level_type",
        cabinType: "cabin_type",
      };

      // 3. Verificar si hay cambios
      const hasChanges = !existingStep3Data || hasDataChanged(data, existingStep3Data, fieldMapping);

      if (!hasChanges) {
        // No hay cambios, solo avanzar
        setCompletedSteps((prev) => [...prev, 2]);
        setStep(3);
        return;
      }

      // Crear FormData para mantener consistencia con otros pasos
      const formData = new FormData();

      // Mapear los datos del formulario al formato del backend
      // Motor y transmisión - campos obligatorios
      formData.append("power", data.enginePower);
      formData.append("power_unit", data.enginePowerUnit);
      formData.append("engine_type", data.engineType);
      formData.append("cylinder_capacity", data.cylinderCapacity);
      formData.append("cylinder_capacity_unit", data.cylinderCapacityUnit);
      formData.append("cylinder_arrangement_type", data.arrangement);
      formData.append("cylinder_count", data.cylindersNumber);
      formData.append("fuel_consumption", data.fuelConsumption);
      formData.append("fuel_consumption_unit", data.fuelConsumptionUnit);
      formData.append("transmission_system_type", data.transmissionSystem);

      // Campos opcionales con validación
      if (data.traction) {
        formData.append("traction_type", data.traction);
      }

      if (data.tankCapacity) {
        formData.append("fuel_capacity", data.tankCapacity);
        formData.append("fuel_capacity_unit", data.tankCapacityUnit);
      }

      if (data.carryingCapacity) {
        formData.append("carrying_capacity", data.carryingCapacity);
        formData.append("carrying_capacity_unit", data.carryingCapacityUnit);
      }

      // Capacidad y rendimiento - campos obligatorios
      formData.append("operating_weight", data.operatingWeight);
      formData.append("operating_weight_unit", data.operatingWeightUnit);
      formData.append("max_speed", data.maxSpeed);
      formData.append("max_speed_unit", data.maxSpeedUnit);
      formData.append("performance_unit", data.performanceUnit);

      // Campos opcionales de rendimiento
      if (data.draftForce) {
        formData.append("draft_force", data.draftForce);
        formData.append("draft_force_unit", data.draftForceUnit);
      }

      if (data.maxOperatingAltitude) {
        formData.append("maximum_altitude", data.maxOperatingAltitude);
        formData.append("maximum_altitude_unit", data.maxOperatingAltitudeUnit);
      }

      if (data.performanceMin) {
        formData.append("minimum_performance", data.performanceMin);
      }

      if (data.performanceMax) {
        formData.append("maximum_performance", data.performanceMax);
      }

      // Dimensiones y peso - campos obligatorios
      formData.append("width", data.width);
      formData.append("length", data.length);
      formData.append("height", data.height);
      formData.append("dimension_unit", data.dimensionsUnit);
      formData.append("net_weight", data.netWeight);
      formData.append("net_weight_unit", data.netWeightUnit);

      // Sistemas auxiliares - campos opcionales
      if (data.airConditioning) {
        formData.append("air_conditioning_system_type", data.airConditioning);
      }

      if (data.airConditioningConsumption) {
        formData.append(
          "air_conditioning_system_consumption",
          data.airConditioningConsumption
        );
        formData.append(
          "air_conditioning_system_consumption_unit",
          data.airConditioningConsumptionUnit
        );
      }

      if (data.maxHydraulicPressure) {
        formData.append("maximum_working_pressure", data.maxHydraulicPressure);
        formData.append(
          "maximum_working_pressure_unit",
          data.maxHydraulicPressureUnit
        );
      }

      if (data.hydraulicPumpFlowRate) {
        formData.append("pump_flow", data.hydraulicPumpFlowRate);
        formData.append("pump_flow_unit", data.hydraulicPumpFlowRateUnit);
      }

      if (data.hydraulicReservoirCapacity) {
        formData.append(
          "hydraulic_tank_capacity",
          data.hydraulicReservoirCapacity
        );
        formData.append(
          "hydraulic_tank_capacity_unit",
          data.hydraulicReservoirCapacityUnit
        );
      }

      // Normatividad - campos opcionales
      if (data.emissionLevel) {
        formData.append("emission_level_type", data.emissionLevel);
      }

      if (data.cabinType) {
        formData.append("cabin_type", data.cabinType);
      }

      // IDs requeridos
      formData.append("id_machinery", machineryId);
      formData.append("id_responsible_user", id);      

      // 3. Decidir POST/PUT/NADA
      if (!existingStep3Data) {
        // No hay datos previos: POST (crear)
        await createSpecificTechnicalSheet(formData);
        try {
          const newEspecificData = await getSpecificTechnicalSheet(machineryId);
          if (newEspecificData && newEspecificData.id_specific_sheet) {
            setSpecificTechnicalSheetId(newEspecificData.id_specific_sheet);
          }
        } catch {}
      } else if (hasChanges) {
        // Hay datos previos y cambios: PUT (actualizar)
        // CORRECCIÓN: Obtener el estado actual de la maquinaria
        const currentStatus =
          machineryToEdit?.id_machinery_operational_status;

        // Agregar justificación si es necesario para el estado activo
        if (isEditMode && currentStatus !== 3) {
          if (!data.justification || data.justification.trim() === "") {
            throw new Error(
              "La justificación es obligatoria cuando la maquinaria está en estado 'Activa'"
            );
          }
          formData.append("justification", data.justification);
        }

        await updateSpecificTechnicalSheet(specificTechnicalSheetId,formData);
      } // Si no hay cambios, no hacer nada

      onSuccess();
      setCompletedSteps((prev) => [...prev, 2]);
      setStep(3);
    } catch (error) {

      // Mostrar error al usuario
      if (error.response?.data) {
        const errorData = error.response.data;

        // Si el backend devuelve errores específicos por campo
        if (errorData.errors) {
          Object.keys(errorData.errors).forEach((field) => {
            if (
              errorData.errors[field] &&
              Array.isArray(errorData.errors[field])
            ) {
              // Mapear nombres de campo del backend a nombres del frontend
              const fieldMapping = {
                power: "enginePower",
                power_unit: "enginePowerUnit",
                engine_type: "engineType",
                cylinder_capacity: "cylinderCapacity",
                cylinder_capacity_unit: "cylinderCapacityUnit",
                cylinder_arrangement_type: "arrangement",
                cylinder_count: "cylindersNumber",
                fuel_consumption: "fuelConsumption",
                fuel_consumption_unit: "fuelConsumptionUnit",
                transmission_system_type: "transmissionSystem",
                operating_weight: "operatingWeight",
                operating_weight_unit: "operatingWeightUnit",
                max_speed: "maxSpeed",
                max_speed_unit: "maxSpeedUnit",
                performance_unit: "performanceUnit",
                width: "width",
                length: "length",
                height: "height",
                dimension_unit: "dimensionsUnit",
                net_weight: "netWeight",
                net_weight_unit: "netWeightUnit",
                justification: "justification",
              };

              const frontendField = fieldMapping[field] || field;
              methods.setError(frontendField, {
                type: "server",
                message: errorData.errors[field][0],
              });
            }
          });
        }

        // Mostrar mensaje de error general
        const message =
          errorData.message ||
          "Error al guardar los datos técnicos específicos.";
        setModalMessage(message);
        setErrorOpen(true);
      } else if (error.message) {
        setModalMessage(error.message);
        setErrorOpen(true);
      } else {
        // Error genérico
        const message =
          "Error al guardar los datos. Por favor, inténtelo de nuevo.";
        setModalMessage(message);
        setErrorOpen(true);
      }
    } finally {
      setIsSubmittingStep(false);
    }
  };

  const nextStep = async () => {
    if (step === 0) {
      // Validar paso 1 antes de enviar
      if (!validateStep1()) {
        return;
      }
      const currentData = methods.getValues();
      submitStep1(currentData);
    } else if (step === 1) {
      // Validar y enviar paso 2
      if (!validateStep2()) {
        return;
      }
      const currentData = methods.getValues();
      submitStep2(currentData);
    } else if (step === 2) {
      // Validar y enviar paso 3
      if (!validateStep3()) {
        return;
      }
      const currentData = methods.getValues();
      submitStep3(currentData);
    } else if (step === 3) {
      // Validar y enviar paso 4
      if (!validateStep4()) {
        return;
      }
      const currentData = methods.getValues();
      submitStep4(currentData);
    } else {
      // Para los otros pasos, avanzar normalmente
      setStep((s) => {
        const newStep = Math.min(s + 1, steps.length - 1);
        if (!completedSteps.includes(s)) {
          setCompletedSteps((prev) => [...prev, s]);
        }
        return newStep;
      });
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const goToStep = (targetStep) => {
    if (completedSteps.includes(targetStep) || targetStep === 0) {
      setStep(targetStep);
    }
  };

  // Función para confirmar el registro de maquinaria
  const confirmRegistration = async () => {
    try {
      setIsConfirmingRegistration(true);

      const response = await confirmMachineryRegistration(machineryId);

      if (response.success) {
        // Mostrar alerta de confirmación exitosa
        setModalMessage(
          response.message || "Registro de maquinaria confirmado exitosamente."
        );
        setSuccessOpen(true);
        onSuccess();
        methods.reset();
        setStep(0);
        setCompletedSteps([]);
        setMachineryId(null);
      }
    } catch (error) {
      let message =
        "Error al confirmar el registro. Por favor, inténtelo de nuevo.";
      setModalMessage(error.response.data.details || message);
      setErrorOpen(true);
    } finally {
      setIsConfirmingRegistration(false);
    }
  };

  const onSubmit = () => {
    // Si estamos en el último paso, finalizar el proceso
    if (step === steps.length - 1) {
      confirmRegistration();
    }
  };

  // Función separada para manejar el evento de Next
  const handleNext = (e) => {
    e.preventDefault();
    nextStep();
  };

  // Step Indicator Component con clases temáticas
  const StepIndicator = ({ steps, currentStep }) => (
    <div className="mb-4 sm:mb-6 md:mb-8">
      {/* Vista desktop y tablet - horizontal */}
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((stepItem, index) => {
          const isCompleted = completedSteps.includes(index);
          const isActive = currentStep === index;

          let status = "Pendiente";
          if (isCompleted && !isActive) {
            status = "Completo";
          } else if (isActive && !isCompleted) {
            status = "En progreso";
          } else if (isActive && isCompleted) {
            status = "Completo";
          }

          return (
            <div key={stepItem.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => goToStep(index)}
                  disabled={!completedSteps.includes(index) && index !== 0}
                  className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xs sm:text-theme-sm font-theme-bold border-2 transition-all duration-300 ${isActive
                      ? "bg-accent text-white"
                      : isCompleted
                        ? "bg-success text-white border-success"
                        : "bg-surface text-secondary border-primary"
                    } ${!completedSteps.includes(index) && index !== 0
                      ? "cursor-not-allowed opacity-50"
                      : "hover:shadow-md"
                    }`}
                  style={{
                    backgroundColor: isActive
                      ? "var(--color-accent)"
                      : isCompleted
                        ? "var(--color-success)"
                        : "var(--color-surface)",
                    borderColor: isActive
                      ? "var(--color-accent)"
                      : isCompleted
                        ? "var(--color-success)"
                        : "var(--color-border)",
                    color:
                      isActive || isCompleted
                        ? "white"
                        : "var(--color-text-secondary)",
                  }}
                >
                  {isCompleted && !isActive ? (
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    stepItem.id
                  )}
                </button>

                <div className="mt-1 sm:mt-2 text-center max-w-20 sm:max-w-none">
                  <div
                    className={`text-xs sm:text-theme-xs font-theme-medium ${status === "En progreso"
                        ? "text-accent"
                        : status === "Completo"
                          ? "text-success"
                          : "text-secondary"
                      }`}
                    style={{
                      color:
                        status === "En progreso"
                          ? "var(--color-accent)"
                          : status === "Completo"
                            ? "var(--color-success)"
                            : "var(--color-text-secondary)",
                    }}
                  >
                    <span className="hidden md:block">{stepItem.name}</span>
                    <span className="block md:hidden text-center leading-tight">
                      {stepItem.name.split(" ").slice(0, 2).join(" ")}
                    </span>
                  </div>
                  <div
                    className={`text-xs sm:text-theme-xs mt-0.5 sm:mt-1 ${status === "En progreso"
                        ? "text-accent"
                        : status === "Completo"
                          ? "text-success"
                          : "text-secondary"
                      }`}
                    style={{
                      color:
                        status === "En progreso"
                          ? "var(--color-accent)"
                          : status === "Completo"
                            ? "var(--color-success)"
                            : "var(--color-text-secondary)",
                    }}
                  >
                    {status}
                  </div>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className="h-0.5 w-8 sm:w-12 md:w-16 mx-2 sm:mx-4 transition-colors duration-300"
                  style={{
                    backgroundColor: isCompleted
                      ? "var(--color-success)"
                      : "var(--color-border)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Vista móvil - simplificada */}
      <div className="block sm:hidden">
        <div className="flex items-center justify-center space-x-1">
          {steps.map((stepItem, index) => {
            const isCompleted = completedSteps.includes(index);
            const isActive = currentStep === index;

            return (
              <div key={stepItem.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => goToStep(index)}
                  disabled={!completedSteps.includes(index) && index !== 0}
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-theme-bold border-2 transition-all duration-300 ${isActive
                      ? "bg-accent text-white"
                      : isCompleted
                        ? "bg-success text-white border-success"
                        : "bg-surface text-secondary border-primary"
                    } ${!completedSteps.includes(index) && index !== 0
                      ? "cursor-not-allowed opacity-50"
                      : ""
                    }`}
                  style={{
                    backgroundColor: isActive
                      ? "var(--color-accent)"
                      : isCompleted
                        ? "var(--color-success)"
                        : "var(--color-surface)",
                    borderColor: isActive
                      ? "var(--color-accent)"
                      : isCompleted
                        ? "var(--color-success)"
                        : "var(--color-border)",
                    color:
                      isActive || isCompleted
                        ? "white"
                        : "var(--color-text-secondary)",
                  }}
                >
                  {isCompleted && !isActive ? (
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    stepItem.id
                  )}
                </button>
                {index < steps.length - 1 && (
                  <div
                    className="h-0.5 w-4 mx-1 transition-colors duration-300"
                    style={{
                      backgroundColor: isCompleted
                        ? "var(--color-success)"
                        : "var(--color-border)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="text-center mt-2">
          <div className="text-sm font-theme-medium text-primary">
            {steps[currentStep].name}
          </div>
          <div className="text-xs text-secondary mt-1">
            Paso {currentStep + 1} de {steps.length}
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  const isLastStep = step === steps.length - 1;

  return (
    <div className="modal-overlay" style={{ padding: "var(--spacing-sm)" }}>
      <div
        className="modal-theme"
        style={{
          width: "100%",
          minWidth: "280px",
          maxWidth: "min(95vw, 1200px)",
          maxHeight: "min(95vh, 900px)",
          overflowY: "auto",
          margin: "0 auto",
        }}
      >
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="p-3 sm:p-6 md:p-8 lg:p-theme-xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4 sm:mb-6 md:mb-8">
              <h2 className="text-lg sm:text-xl md:text-theme-xl font-theme-semibold text-primary">
                {isEditMode ? "Actualizar maquinaria" : "Añadir maquinaria"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-secondary hover:text-primary"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Progress Bar */}
            <StepIndicator steps={steps} currentStep={step} />

            {/* Step Content */}
            <div style={{ minHeight: "300px" }} className="sm:min-h-[400px]">
              {step === 0 && (
                <Step1GeneralData
                  countriesList={countriesList}
                  statesList={statesList}
                  citiesList={citiesList}
                  isLoadingStates={isLoadingStates}
                  isLoadingCities={isLoadingCities}
                  machineryList={machineryList}
                  machineList={machineList}
                  brandsList={brandsList}
                  modelsList={modelsList}
                  telemetryDevicesList={telemetryDevicesList}
                  isEditMode={isEditMode}
                  machineryStatuesList={machineryStatuesList}
                  currentStatusId={machineryToEdit?.id_machinery_operational_status}
                />
              )}
              {step === 1 && (
                <Step2TrackerData 
                  isEditMode={isEditMode}
                  currentStatusId={machineryToEdit?.id_machinery_operational_status}
                />
                )}
              {step === 2 && (
                <Step3SpecificData
                  machineryId={machineryId}
                  powerUnitsList={powerUnitsList}
                  volumeUnitsList={volumeUnitsList}
                  flowConsumptionUnitsList={flowConsumptionUnitsList}
                  weightUnitsList={weightUnitsList}
                  speedUnitsList={speedUnitsList}
                  forceUnitsList={forceUnitsList}
                  dimensionUnitsList={dimensionUnitsList}
                  performanceUnitsList={performanceUnitsList}
                  pressureUnitsList={pressureUnitsList}
                  engineTypesList={engineTypesList}
                  cylinderArrangementList={cylinderArrangementList}
                  tractionTypesList={tractionTypesList}
                  transmissionSystemList={transmissionSystemList}
                  airConditioningList={airConditioningList}
                  emissionLevelList={emissionLevelList}
                  cabinTypesList={cabinTypesList}
                  isEditMode={isEditMode}
                  currentStatusId={machineryToEdit?.id_machinery_operational_status}
                />
              )}
              {step === 3 && (
                <Step4UsageInfo
                  machineryId={machineryId}
                  distanceUnitsList={distanceUnitsList}
                  usageStatesList={usageStatesList}
                  tenureTypesList={tenureTypesList}
                  isEditMode={isEditMode}
                  currentStatusId={machineryToEdit?.id_machinery_operational_status}
                />
              )}
              {step === 4 && (
                <Step5Maintenance
                  machineryId={machineryId}
                  maintenanceTypeList={maintenanceTypeList}
                  isEditMode={isEditMode}
                  currentStatusId={machineryToEdit?.id_machinery_operational_status}
                />
              )}
              {step === 5 && <Step6UploadDocs machineryId={machineryId} />}
            </div>

            {/* Navigation */}
            <div className="flex flex-row justify-between items-center mt-6 sm:mt-theme-xl pt-4 sm:pt-theme-lg">
              {/* Botón Anterior */}
              <button
                type="button"
                aria-label="Preview Button"
                onClick={prevStep}
                disabled={step === 0 || isSubmittingStep}
                className="btn-theme btn-secondary w-auto"
              >
                Anterior
              </button>

              {/* Botón Siguiente / Guardar */}
              {isLastStep ? (
                (!isEditMode || operationalStatus === 3) ? (
                  <button
                    type="submit"
                    aria-label="Save Button"
                    disabled={isSubmittingStep}
                    className="btn-theme btn-primary w-auto"
                  >
                    {isSubmittingStep ? "Guardando..." : "Guardar"}
                  </button>
                ) : null               
              ) : (
                <button
                  type="button"
                  aria-label="Next Button"
                  onClick={handleNext}
                  disabled={isSubmittingStep}
                  className="btn-theme btn-primary w-auto"
                >
                  {isSubmittingStep && step === 0
                    ? "Guardando..."
                    : "Siguiente"}
                </button>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
      <SuccessModal
        isOpen={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          onClose();
        }}
        title="Éxito"
        message={modalMessage}
      />
      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Error"
        message={modalMessage}
      />
    </div>
  );
}
