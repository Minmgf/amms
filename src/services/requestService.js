import { apiMain, apiUsers } from "@/lib/axios";

// Obtener estados
export const getMaintenanceRequestStatuses = async () => {
    const { data } = await apiMain.get("/statues/list/1/");
    return data;
};

// Obtener estados de solicitudes de facturación
export const getBillingRequestStatuses = async () => {
    const { data } = await apiMain.get("/statues/list/5/");
    return data;
};

// Obtener tipos de personas
export const getPersonTypes = async () => {
    const { data } = await apiMain.get("/statues/list/6/");
    return data;
};

// Obtener tipos de identificación
export const getIdentificationTypes = async () => {
    const { data } = await apiMain.get("/statues/list/7/");
    return data;
};

// Obtener detalle del cliente (HU-CLI-003)
export const getClientDetail = async (clientId) => {
    try {
        const { data } = await apiMain.get(`/customer/detail/${clientId}/`);
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error?.message || "Error al obtener el detalle del cliente" };
    }
};

// Obtener historial de solicitudes del cliente (HU-CLI-003)
export const getClientRequestHistory = async (clientId) => {
    try {
        const { data } = await apiMain.get(`/customer/requests/${clientId}/`);
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error?.message || "Error al obtener el historial de solicitudes" };
    }
};

// Obtener estados del cliente
export const getClientStatuses = async () => {
    const { data } = await apiMain.get("/statues/list/1/");
    return { data };
};

// Obtener estados de solicitudes
export const getRequestStatuses = async () => {
    const { data } = await apiMain.get("/statues/list/4/");
    return { data };
};

// Obtener estados de facturación
export const getBillingStatuses = async () => {
    const { data } = await apiMain.get("/statues/list/5/");
    return { data };
};