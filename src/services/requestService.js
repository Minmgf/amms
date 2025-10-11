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