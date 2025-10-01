import { apiMain } from "@/lib/axios";

// Lista de mantenimientos
export const getMaintenanceList = async () => {
    const { data } = await apiMain.get("/maintenance/");
    return data;
};

// Crear mantenimiento
export const createMaintenance = async (payload) => {
    const { data } = await apiMain.post("/maintenance/", payload);
    return data;
};

// Tipos de mantenimiento
export const getMaintenanceTypes = async () => {
    const { data } = await apiMain.get("/types/list/active/12/");
    return data;
};

// PATCH: Actualizar mantenimiento
export const updateMaintenance = async (id, payload) => {
    const { data } = await apiMain.patch(`/maintenance/${id}/`, payload);
    return data;
};

// PATCH: Alternar estado (activar/desactivar)
export const toggleMaintenanceStatus = async (id) => {
    const { data } = await apiMain.patch(`/maintenance/${id}/toggle-status/`);
    return data;
};

// DELETE: Eliminar mantenimiento
export const deleteMaintenance = async (id) => {
    const { data } = await apiMain.delete(`/maintenance/${id}/`);
    return data;
};

// Obtener detalle de mantenimiento
export const getMaintenanceDetail = async (id) => {
    const { data } = await apiMain.get(`/maintenance/${id}/`);
    return data;
};

// Lista de solicitudes de mantenimientos 
export const getMaintenanceRequestList = async () => {
    const { data } = await apiMain.get("/maintenance_request/list/");
    return data;
};

// Lista de mantenimientos programados
export const getScheduledMaintenanceList = async () => {
    const { data } = await apiMain.get("/maintenance_scheduling/list/");
    return data;
};