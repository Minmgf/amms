import { apiMain } from "@/lib/axios";

// =============================================================================
// FORMULARIO MODAL MULTIPASOS
// =============================================================================

// ===== PASO 1 =====

// traer maquinarias activas
export const getActiveMachinery = async () => {
    const { data } = await apiMain.get("/types/list/active/2/");
    return data;
};

// traer maquinas activas
export const getActiveMachine = async () => {
    const { data } = await apiMain.get("/types/list/active/3/");
    return data;
};

// traer marcas de maquinarias activas
export const getMachineryBrands = async () => {
    const { data } = await apiMain.get("/brands/list/active/1/");
    return data;
};

// traer modelos de marcas de maquinarias activas
export const getModelsByBrandId = async (brandId) => {
    const { data } = await apiMain.get(`/models/list/active/${brandId}/`);
    return data;
};

// traer dispositivos de telemetria activos
export const getTelemetryDevices = async () => {
    const { data } = await apiMain.get(`/telemetry-devices/active/`);
    return data;
};


// iniciar formulario y registrar datos generales
export const registerGeneralData = async (formData) => {
    const { data } = await apiMain.post("/machinery/create-general-sheet/", formData,
        {headers: {"Content-Type": "multipart/form-data"}}
    );
    return data;
};

// ===== PASO 3 - FICHA TÉCNICA ESPECÍFICA =====

// Crear ficha técnica específica
export const createSpecificTechnicalSheet = async (payload) => {
    const { data } = await apiMain.post("/machinery-specific-sheet/", payload);
    return data;
};

// ENDPOINTS PARA UNIDADES (Units)

// Unidades de Potencia
export const getPowerUnits = async () => {
    const { data } = await apiMain.get("/units/active/1/");
    return data;
};

// Unidades de Capacidad/Volumen
export const getVolumeUnits = async () => {
    const { data } = await apiMain.get("/units/active/2/");
    return data;
};

// Unidades de Caudal/Consumo
export const getFlowConsumptionUnits = async () => {
    const { data } = await apiMain.get("/units/active/3/");
    return data;
};

// Unidades de Peso/Carga
export const getWeightUnits = async () => {
    const { data } = await apiMain.get("/units/active/4/");
    return data;
};

// Unidades de Velocidad
export const getSpeedUnits = async () => {
    const { data } = await apiMain.get("/units/active/5/");
    return data;
};

// Unidades de Fuerza
export const getForceUnits = async () => {
    const { data } = await apiMain.get("/units/active/6/");
    return data;
};

// Unidades de Altitud/Dimensión
export const getDimensionUnits = async () => {
    const { data } = await apiMain.get("/units/active/7/");
    return data;
};

// Unidades de Rendimiento (Frecuencia/Velocidad angular)
export const getPerformanceUnits = async () => {
    const { data } = await apiMain.get("/units/active/8/");
    return data;
};

// Unidades de Presión
export const getPressureUnits = async () => {
    const { data } = await apiMain.get("/units/active/9/");
    return data;
};

// ENDPOINTS PARA TIPOS (Types)

// Tipos de Motores
export const getEngineTypes = async () => {
    const { data } = await apiMain.get("/types/list/active/4/");
    return data;
};

// Tipos de Disposición de Cilindros
export const getCylinderArrangementTypes = async () => {
    const { data } = await apiMain.get("/types/list/active/5/");
    return data;
};

// Tipos de Tracción
export const getTractionTypes = async () => {
    const { data } = await apiMain.get("/types/list/active/6/");
    return data;
};

// Tipos de Sistemas de Transmisión
export const getTransmissionSystemTypes = async () => {
    const { data } = await apiMain.get("/types/list/active/7/");
    return data;
};

// Tipos de Sistemas de Aire Acondicionado
export const getAirConditioningSystemTypes = async () => {
    const { data } = await apiMain.get("/types/list/active/8/");
    return data;
};

// Tipos de Niveles de Emisión
export const getEmissionLevelTypes = async () => {
    const { data } = await apiMain.get("/types/list/active/9/");
    return data;
};

// Tipos de Cabinas
export const getCabinTypes = async () => {
    const { data } = await apiMain.get("/types/list/active/10/");
    return data;
};
// ===== PASO 2 =====
export const registerInfoTracker = async (formData) => {
    const { data } = await apiMain.post("/machinery-tracker/create/", formData,
        {headers: {"Content-Type": "multipart/form-data"}}
    );
    return data;
};

// ===== PASO 4 =====

// traer estados de uso
export const getUseStates = async () => {
    const { data } = await apiMain.get("/statues/list/3/");
    return data;
};

// traer unidades de distancia
export const getDistanceUnits = async () => {
    const { data } = await apiMain.get("/units/active/7/");
    return data;
};

// traer tipos de tenencia
export const getTenureTypes = async () => {
    const { data } = await apiMain.get("/types/list/active/11/");
    return data;
};

// registrar información de uso
export const registerUsageInfo = async (formData) => {
    const { data } = await apiMain.post("/machinery-usage/create/", formData,
        {headers: {"Content-Type": "multipart/form-data"}}
    );
    return data;
};

// ===== PASO 5 =====

//traer listado de tipos de mantenimiento activos
export const getMaintenanceTypes = async () => {
    const { data } = await apiMain.get(`/maintenance/active/`);
    return data;
};

//registrar mantenimiento periodico de una maquinaria
export const registerPeriodicMaintenance = async (payload) => {
    const { data } = await apiMain.post("/machinery/periodic-maintenance/", payload);
    return data;
};

//traer listado de mantenimientos periodicos de maquinaria por id
export const getPeriodicMaintenancesById = async (id_machinery) => {
    const { data } = await apiMain.get(`/machinery/periodic-maintenance/`,
        { params: { machinery: id_machinery } }
    );
    return data;
};

// eliminar mantenimiento periódico de maquinaria por id
export const deletePeriodicMaintenance = async (id_periodic_maintenance) => {
    const { data } = await apiMain.delete(`/machinery/periodic-maintenance/${id_periodic_maintenance}/`);
    return data;
};

// ===== PASO 6 =====

// crear documento de maquinaria
export const createMachineryDoc = async (formData) => {
    const { data } = await apiMain.post("/machinery-documentation/", formData, 
        {headers: {"Content-Type": "multipart/form-data"}}
    );
    return data;
};

// descargar documento de maquinaria
export const downloadMachineryDoc = async (documentId) => {
    try {
        // Intentar primero como JSON (información del archivo)
        const response = await apiMain.get(`/machinery-documentation/${documentId}/download/`);
        
        // Si la respuesta es JSON, devolver la data
        if (response.headers['content-type']?.includes('application/json')) {
            return response.data;
        }
        
        // Si es un archivo binario, devolver la respuesta completa
        return response;
    } catch (error) {
        // Si falla como JSON, intentar como archivo binario
        try {
            const response = await apiMain.get(`/machinery-documentation/${documentId}/download/`, {
                responseType: 'blob'
            });
            return response.data; // Devolver el blob
        } catch (blobError) {
            throw error; // Lanzar el error original
        }
    }
};

// eliminar documento de maquinaria
export const deleteMachineryDoc = async (documentId) => {
    const { data } = await apiMain.delete(`/machinery-documentation/${documentId}/`);
    return data;
};

// listar documentos de maquinaria
export const getMachineryDocs = async (machineryId) => {
    const { data } = await apiMain.get(`/machinery-documentation/list/${machineryId}/`);
    return data;
};