import { apiMain } from "@/lib/axios";

// Obtener lista de paises
export const getAreaUnits = async () => {
    const { data } = await apiMain.get("/units/active/11/");
    return data;
}

// Obtener tipos de suelo
export const getSoilTypes = async () => {
    const { data } = await apiMain.get("/types/list/active/15/");
    return data;
}

// Obtener unidades de altitud
export const getAltitudeUnits = async () => {
    const { data } = await apiMain.get("/units/active/7/");
    return data;
}

// Crear preregistro
export const createPreRegister = async (payload) => {
    const { data } = await apiMain.post("/service_requests/create_pre_request/", payload);
    return data;
}

// Buscar cliente por número de identificacion
export const getClientByIdentification = async (identification) => {
    const { data } = await apiMain.get(`/customers/search_by_document/?document_number=${identification}`);    
    return data;
}

// Obtener detalles completos de una solicitud (HU-SOL-004)
export const getRequestDetails = async (requestId) => {
    const { data } = await apiMain.get(`/service_requests/${requestId}/details/`);
    return data;
}

/**
 * Completa una solicitud
 * @param {string} requestId - El código de la solicitud a completar
 * @param {object} payload - Objeto con las observaciones de finalización
 * @param {string} payload.completion_cancellation_observations - Observaciones obligatorias (máx 500 caracteres)
 * @returns {Promise} Respuesta de la API
 */
export const completeRequest = async (requestId, payload) => {
    const { data } = await apiMain.post(`/service_requests/${requestId}/complete/`, payload);
    return data;
}