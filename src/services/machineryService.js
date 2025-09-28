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

// traer estado de una maquinaria
export const getMachineryStatus = async () => {
    const { data } = await apiMain.get("/statues/list/2/");
    return data;
};

// traer datos generales de una maquinaria por id
export const getGeneralData = async (machineryId) => {
    const { data } = await apiMain.get(`/machinery/${machineryId}/`);
    return data.data;
};

// actualizar datos generales de una maquinaria por id
export const updateGeneralData = async (machineryId, formData) => {
    const { data } = await apiMain.put(`/machinery/${machineryId}/update/`, formData,
        {headers: {"Content-Type": "multipart/form-data"}}
    );
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

// traer información de uso por id de maquinaria
export const getUsageInfo = async (machineryId) => {
    const { data } = await apiMain.get(`/machinery-usage/by-machinery/${machineryId}`);
    return data;
};

// actualizar información de uso por id de uso
export const updateUsageInfo = async (usageId, formData) => {
    const { data } = await apiMain.put(`/machinery-usage/${usageId}/update/`, formData,
        {headers: {"Content-Type": "multipart/form-data"}}
    );
    return data;
}

// ===== PASO 5 =====

//traer listado de tipos de mantenimiento activos
export const getMaintenanceTypes = async () => {
    const { data } = await apiMain.get(`/maintenance/active/`);
    return data;
};

//registrar mantenimiento periodico de una maquinaria
export const registerPeriodicMaintenance = async (payload) => {
    const { data } = await apiMain.post("/periodic-maintenance/", payload);
    return data;
};
//actualizar mantenimiento periodico de una maquinaria
export const updatePeriodicMaintenance = async (id_periodic_maintenance, payload) => {
    const { data } = await apiMain.put(`/periodic-maintenance/${id_periodic_maintenance}/`, payload);
    return data;
};

//traer listado de mantenimientos periodicos de maquinaria por id
export const getPeriodicMaintenancesById = async (id_machinery) => {
    const { data } = await apiMain.get(`/periodic-maintenance/`,
        { params: { machinery: id_machinery } }
    );
    return data;
};

// eliminar mantenimiento periódico de maquinaria por id
export const deletePeriodicMaintenance = async (id_periodic_maintenance) => {
    const { data } = await apiMain.delete(`/periodic-maintenance/${id_periodic_maintenance}/`);
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

/**
 * Obtiene la lista completa de maquinaria
 * @returns {Promise} - Promesa con la respuesta de la API
 */
export const getMachineryList = async () => {
    try {
        // console.log('Base URL configurada:', process.env.NEXT_PUBLIC_BASE_URL_MAIN);
        // console.log('URL completa sería:', `${process.env.NEXT_PUBLIC_BASE_URL_MAIN}/machinery/list/`);
        
        const response = await apiMain.get('/machinery/list/');
        
        console.log('Respuesta completa de la API:', response);
        console.log('Status de la respuesta:', response.status);
        console.log('Data de la respuesta:', response.data);
        
        return {
            success: true,
            data: response.data,
            message: 'Maquinaria obtenida exitosamente'
        };
    } catch (error) {
        console.error('Error completo:', error);
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response?.data);
        console.error('Error response status:', error.response?.status);
        
        return {
            success: false,
            data: null,
            message: error.response?.data?.message || error.message || 'Error al obtener la lista de maquinaria',
            error: error.response?.data || error.message
        };
    }
};