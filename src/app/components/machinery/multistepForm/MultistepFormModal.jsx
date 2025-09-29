"use client";
import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
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
  getTelemetryDevices, 
  registerGeneralData, 
  registerInfoTracker, 
  getMaintenanceTypes, 
  getDistanceUnits, 
  getTenureTypes, 
  getUseStates, 
  registerUsageInfo,
  getPowerUnits,
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
  updateUsageInfo
       } from "@/services/machineryService";
import { SuccessModal, ErrorModal } from "../../shared/SuccessErrorModal";

export default function MultiStepFormModal({ isOpen, onClose, machineryToEdit }) {
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
  const [isConfirmingRegistration, setIsConfirmingRegistration] = useState(false);
 
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
  // Hook del tema
  const { getCurrentTheme } = useTheme();

  const methods = useForm({
    defaultValues: {
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
    },
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
      setMachineryId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isEditMode && machineryToEdit && machineryList.length > 0) {
      // Aquí deberías hacer los GET de cada paso usando el ID
      // Paso 1:
      getGeneralData(machineryToEdit.id_machinery).then(data => {
        // Mapea los datos del backend a los nombres del formulario
        const mappedData = {
          name: data.machinery_name,
          manufactureYear: data.manufacturing_year,
          serialNumber: data.serial_number,
          machineryType: data.machinery_secondary_type,
          brand: data.brand, // Ajusta si el backend devuelve otro nombre
          model: data.id_model,
          tariff: data.tariff_subheading,
          category: data.machinery_type,
          country: data.country, // Ajusta si el backend devuelve otro nombre
          department: data.department, // Ajusta si el backend devuelve otro nombre
          city: data.id_city,
          telemetry: data.id_device,
          photo: null, // No puedes setear archivos directamente, solo si tienes la URL y lógica para cargarla
          machineryStatues: data.machinery_operational_status,
        };
        methods.reset({
          ...methods.getValues(),
          ...mappedData
        });
        setMachineryId(machineryToEdit.id_machinery);
      });
      //Paso 4:
      getUsageInfo(machineryToEdit.id_machinery).then(data => {
        // Mapea los datos del backend a los nombres del formulario
        const mappedData = {
          acquisitionDate: data.acquisition_date,
          usageState: data.usage_condition,
          usedHours: data.usage_hours,
          mileage: data.distance_value,
          mileageUnit: data.distance_unit,
          tenure: data.tenacy_type,
          ownership: data.is_own,
          contractEndDate: data.contract_end_date,  
        };
        methods.reset({
          ...methods.getValues(),
          ...mappedData
        });
        setIdUsageSheet(data.id_usage_sheet);
      });
    }
    if (isOpen && !isEditMode) {
      methods.reset();
      setMachineryId(null);
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
        methods.setValue("model", "");
      } catch (error) {
        console.error("Error loading models:", error);
        setModelsList([]);
      }
    };

    fetchModels();
  }, [watchBrand, methods]);

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

        setEngineTypesList(Array.isArray(engine.data || engine) ? engine.data || engine : []);
        setCylinderArrangementList(Array.isArray(cylinder.data || cylinder) ? cylinder.data || cylinder : []);
        setTractionTypesList(Array.isArray(traction.data || traction) ? traction.data || traction : []);
        setTransmissionSystemList(Array.isArray(transmission.data || transmission) ? transmission.data || transmission : []);
        setAirConditioningList(Array.isArray(airCond.data || airCond) ? airCond.data || airCond : []);
        setEmissionLevelList(Array.isArray(emission.data || emission) ? emission.data || emission : []);
        setCabinTypesList(Array.isArray(cabin.data || cabin) ? cabin.data || cabin : []);
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
        methods.setValue("department", "");
        methods.setValue("city", "");
      } catch (error) {
        console.error("Error loading states:", error);
        setStatesList([]);
      } finally {
        setIsLoadingStates(false);
      }
    };

    loadStates();
  }, [watchCountry, methods]);

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
        methods.setValue("city", "");
      } catch (error) {
        console.error("Error loading cities:", error);
        setCitiesList([]);
      } finally {
        setIsLoadingCities(false);
      }
    };

    loadCities();
  }, [watchCountry, watchState, methods]);

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
      'name', 'manufactureYear', 'serialNumber', 'machineryType',
      'brand', 'model', 'tariff', 'category', 'country',
      'department', 'city'
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
  const validateStep3 = () => {
    const currentValues = methods.getValues();
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
      "dimensionsUnit",
      "width",
      "length",
      "height",
      "netWeight",
      "netWeightUnit",
    ];

    const missingFields = requiredFields.filter((field) => {
      const value = currentValues[field];
      return !value || (typeof value === "string" && value.trim() === "");
    });

    if (missingFields.length > 0) {
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

  // Función para validar el paso 6
  const validateStep6 = () => {
    // El Step 6 maneja su propia validación y envío de documentos
    // No requiere validación adicional aquí ya que los documentos se gestionan directamente
    return true;
  };

  // Función para manejar el envío del paso 1
  const submitStep1 = async (data) => {
    try {
      setIsSubmittingStep(true);

      // Crear FormData para enviar el archivo
      const formData = new FormData();

      // Agregar todos los campos del paso 1
      formData.append("machinery_name", data.name);
      formData.append("manufacturing_year", data.manufactureYear);
      formData.append("serial_number", data.serialNumber);
      formData.append("machinery_secondary_type", data.machineryType);
      formData.append("id_model", data.model);
      formData.append("tariff_subheading", data.tariff);
      formData.append("machinery_type", data.category);
      formData.append("id_city", data.city);
      formData.append("responsible_user", id);

      // Telemetría es opcional
      if (data.telemetry) {
        formData.append("id_device", data.telemetry);
      }

      // Agregar foto si existe
      if (data.photo) {
        formData.append("image", data.photo);
      }

      // Agregar estado operativo si existe
      if (data.justification) {
        formData.append('machinery_operational_status', data.machineryStatues);
        formData.append('justification', data.justificationGeneralData);
      }

      // 1. GET datos actuales si es edición
      let existingData = null;
      if (isEditMode && machineryId) {
        existingData = await getGeneralData(machineryId);
      }

      // 2. Compara si hay cambios
      const hasChanges = !existingData || Object.keys(data).some(
        key => data[key] !== existingData[key]
      );

      // 3. Decide POST/PUT/NADA
      if (!existingData) {
        // No hay datos previos: POST
        const response = await registerGeneralData(formData);
        setMachineryId(response.machinery_id);
      } else if (hasChanges) {
        // Hay datos previos y cambios: PUT
        await updateGeneralData(machineryId, formData);
      } // Si no hay cambios, no hagas nada

      setCompletedSteps(prev => [...prev, 0]);
      setStep(1);
    } catch (error) {
      let message = "Error al guardar los datos. Por favor, inténtelo de nuevo.";

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

  const submitStep2 = async (data) => {
    try {
      setIsSubmittingStep(true);
      // Crear FormData para enviar el archivo
      const formData = new FormData();

      // Agregar todos los campos del paso 2
      formData.append("id_machinery", machineryId);
      formData.append("terminal_serial_number", data.terminalSerial);
      formData.append("gps_serial_number", data.gpsSerial);
      formData.append("chassis_number", data.chasisNumber);
      formData.append("engine_number", data.engineNumber);
      formData.append("responsible_user", id);

      const response = await registerInfoTracker(formData);

      // Marcar paso como completado y avanzar
      setCompletedSteps((prev) => [...prev, 1]);
      setStep(2);

    } catch (error) {
      console.error("Error submitting step 2:", error);

      // Mostrar error modal igual que en Step 1
      setModalMessage("El número de serie del terminal ya está registrado. Por favor, ingrese un número diferente.");
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

      // Crear FormData para enviar el archivo
      const formData = new FormData();

      // Agregar todos los campos del paso 1
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

      if (data.justificationUsage) {
        formData.append('justification', data.justificationUsageInfo);
      }

      let existingData = null;
      if (isEditMode && machineryId) {
        existingData = await getUsageInfo(machineryId);
      }

      const hasChanges = !existingData || Object.keys(data).some(
        key => data[key] !== existingData[key]
      );

      if (!existingData) {
        await registerUsageInfo(formData);
      } else if (hasChanges) {
        await updateUsageInfo(idUsageSheet, formData);
      }
      // Marcar paso como completado y avanzar
      setCompletedSteps((prev) => [...prev, 3]);
      setStep(4);
    } catch (error) {
      let message = "Error al guardar los datos. Por favor, inténtelo de nuevo.";

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

      // Mapear los datos del formulario al formato del backend
      const payload = {
        // Motor y transmisión
        power: parseFloat(data.enginePower),
        power_unit: parseInt(data.enginePowerUnit),
        engine_type: parseInt(data.engineType),
        cylinder_capacity: parseFloat(data.cylinderCapacity),
        cylinder_capacity_unit: parseInt(data.cylinderCapacityUnit),
        cylinder_arrangement_type: parseInt(data.arrangement),
        cylinder_count: parseInt(data.cylindersNumber),
        traction_type: data.traction ? parseInt(data.traction) : null,
        fuel_consumption: parseFloat(data.fuelConsumption),
        fuel_consumption_unit: parseInt(data.fuelConsumptionUnit),
        transmission_system_type: parseInt(data.transmissionSystem),

        // Capacidad y rendimiento
        fuel_capacity: data.tankCapacity ? parseFloat(data.tankCapacity) : null,
        fuel_capacity_unit: data.tankCapacityUnit
          ? parseInt(data.tankCapacityUnit)
          : null,
        carrying_capacity: data.carryingCapacity
          ? parseFloat(data.carryingCapacity)
          : null,
        carrying_capacity_unit: data.carryingCapacityUnit
          ? parseInt(data.carryingCapacityUnit)
          : null,
        operating_weight: parseFloat(data.operatingWeight),
        operating_weight_unit: parseInt(data.operatingWeightUnit),
        max_speed: parseFloat(data.maxSpeed),
        max_speed_unit: parseInt(data.maxSpeedUnit),
        draft_force: data.draftForce ? parseFloat(data.draftForce) : null,
        draft_force_unit: data.draftForceUnit
          ? parseInt(data.draftForceUnit)
          : null,
        maximum_altitude: data.maxOperatingAltitude
          ? parseFloat(data.maxOperatingAltitude)
          : null,
        maximum_altitude_unit: data.maxOperatingAltitudeUnit
          ? parseInt(data.maxOperatingAltitudeUnit)
          : null,
        minimum_performance: data.performanceMin
          ? parseFloat(data.performanceMin)
          : null,
        maximum_performance: data.performanceMax
          ? parseFloat(data.performanceMax)
          : null,
        performance_unit: data.performanceUnit
          ? parseInt(data.performanceUnit)
          : null,

        // Dimensiones y peso
        width: parseFloat(data.width),
        length: parseFloat(data.length),
        height: parseFloat(data.height),
        dimension_unit: parseInt(data.dimensionsUnit),
        net_weight: parseFloat(data.netWeight),
        net_weight_unit: parseInt(data.netWeightUnit),

        // Sistemas auxiliares
        air_conditioning_system_type: data.airConditioning
          ? parseInt(data.airConditioning)
          : null,
        air_conditioning_system_consumption: data.airConditioningConsumption
          ? parseFloat(data.airConditioningConsumption)
          : null,
        air_conditioning_system_consumption_unit:
          data.airConditioningConsumptionUnit
            ? parseInt(data.airConditioningConsumptionUnit)
            : null,
        maximum_working_pressure: data.maxHydraulicPressure
          ? parseFloat(data.maxHydraulicPressure)
          : null,
        maximum_working_pressure_unit: data.maxHydraulicPressureUnit
          ? parseInt(data.maxHydraulicPressureUnit)
          : null,
        pump_flow: data.hydraulicPumpFlowRate
          ? parseFloat(data.hydraulicPumpFlowRate)
          : null,
        pump_flow_unit: data.hydraulicPumpFlowRateUnit
          ? parseInt(data.hydraulicPumpFlowRateUnit)
          : null,
        hydraulic_tank_capacity: data.hydraulicReservoirCapacity
          ? parseFloat(data.hydraulicReservoirCapacity)
          : null,
        hydraulic_tank_capacity_unit: data.hydraulicReservoirCapacityUnit
          ? parseInt(data.hydraulicReservoirCapacityUnit)
          : null,

        // Normatividad
        emission_level_type: data.emissionLevel
          ? parseInt(data.emissionLevel)
          : null,
        cabin_type: data.cabinType ? parseInt(data.cabinType) : null,

        // IDs requeridos
        id_machinery: machineryId,
        id_responsible_user: parseInt(id),
      };

      const response = await createSpecificTechnicalSheet(payload);

      // Marcar paso como completado y avanzar
      setCompletedSteps((prev) => [...prev, 2]);
      setStep(3);

    } catch (error) {
      console.error("Error submitting step 3:", error);

      if (error.response?.data) {
        alert(
          "Error al guardar la ficha técnica específica. Por favor, verifique los datos."
        );
      }
    } finally {
      setIsSubmittingStep(false);
    }
  };

  const nextStep = () => {
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
        setModalMessage(response.message || "Registro de maquinaria confirmado exitosamente.");
        setSuccessOpen(true);     
        onSuccess();   
        methods.reset();
        setStep(0);
        setCompletedSteps([]);
        setMachineryId(null);
        
      }      
    } catch (error) {
      let message = "Error al confirmar el registro. Por favor, inténtelo de nuevo.";
      setModalMessage(error.response.data.details || message);
      setErrorOpen(true);      
    } finally {
      setIsConfirmingRegistration(false);
    }
  };

  const onSubmit = () => {
    // Si estamos en el último paso, finalizar el proceso
    if (step === steps.length - 1) {
      if (!validateStep6()) {
        return;
      }
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
                  className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xs sm:text-theme-sm font-theme-bold border-2 transition-all duration-300 ${
                    isActive
                      ? "bg-accent text-white"
                      : isCompleted
                      ? "bg-success text-white border-success"
                      : "bg-surface text-secondary border-primary"
                  } ${
                    !completedSteps.includes(index) && index !== 0
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
                    className={`text-xs sm:text-theme-xs font-theme-medium ${
                      status === "En progreso"
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
                    className={`text-xs sm:text-theme-xs mt-0.5 sm:mt-1 ${
                      status === "En progreso"
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
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-theme-bold border-2 transition-all duration-300 ${
                    isActive
                      ? "bg-accent text-white"
                      : isCompleted
                      ? "bg-success text-white border-success"
                      : "bg-surface text-secondary border-primary"
                  } ${
                    !completedSteps.includes(index) && index !== 0
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
                  currentStatusName={machineryToEdit?.machinery_operational_status_name?.toLowerCase()}
                />
              )}
              {step === 1 && <Step2TrackerData machineryId={machineryId} />}
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
                />
              )}
              {step === 3 && (
                <Step4UsageInfo
                  machineryId={machineryId}
                  distanceUnitsList={distanceUnitsList}
                  usageStatesList={usageStatesList}
                  tenureTypesList={tenureTypesList}
                  machineryStatuesList={machineryStatuesList}
                  currentStatusName={machineryToEdit?.machinery_operational_status_name?.toLowerCase()}
                />
              )}
              {step === 4 && (
                <Step5Maintenance
                  machineryId={machineryId}
                  maintenanceTypeList={maintenanceTypeList}
                  isEditMode={isEditMode}
                  currentStatusName={machineryToEdit?.machinery_operational_status_name?.toLowerCase()} 
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
                <button
                  type="submit"
                  aria-label="Save Button"
                  disabled={isSubmittingStep}
                  className="btn-theme btn-primary w-auto"
                >
                  {isSubmittingStep ? "Guardando..." : "Guardar"}
                </button>
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
