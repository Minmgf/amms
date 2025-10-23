import { apiMain, apiUsers } from "@/lib/axios";

// Obtener unidades de area
export const getAreaUnits = async () => {
    const { data } = await apiMain.get("/units/active/11/");
    return data;
}

// Obtener tipos de suelo
export const getSoilTypes = async () => {
    const { data } = await apiMain.get("/soil_types/");
    return data;
}

// Obtener tipos de texturas
export const getTextureTypes = async () => {
    const { data } = await apiMain.get("/textures/");
    return data;
}

// Obtener tipos de implementos
export const getImplementTypes = async () => {
    const { data } = await apiMain.get("/implementations/");
    return data;
}

// Obtener unidades de altitud
export const getAltitudeUnits = async () => {
    const { data } = await apiMain.get("/units/active/7/");
    return data;
}

// Obtener operarios activos
export const getActiveWorkers = async () => {
    const { data } = await apiUsers.get("/users/machinery_operators/active");
    return data;
}

// Obtener estados de pago
export const getPaymentStatus = async () => {
    const { data } = await apiMain.get("/statues/list/6/");
    return data;
}

// Obtener metodos de pago
export const getPaymentMethods = async () => {
    const { data } = await apiMain.get("/payment_methods/");
    return data;
}

// Crear preregistro
export const createPreRegister = async (payload) => {
    const { data } = await apiMain.post("/service_requests/create_pre_request/", payload);
    return data;
}

// Crear registro de solicitud
export const createRequest = async (payload) => {
    const { data } = await apiMain.post("/service_requests/create_request/", payload);
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

// Cancelar una solicitud
export const cancelRequest = async (requestId, observations) => {
    const { data } = await apiMain.post(`/service_requests/${requestId}/cancel/`, {
        completion_cancellation_observations: observations
    });
    return data;
}