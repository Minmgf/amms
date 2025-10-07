import { apiMain, apiUsers } from "@/lib/axios";

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

// Obtener detalle de mantenimiento programado por ID
export const getScheduledMaintenanceDetail = async (id_maintenance_scheduling) => {
    const { data } = await apiMain.get(`/maintenance_scheduling/${id_maintenance_scheduling}/`);
    return data;
};

// Actualizar mantenimiento programado
export const updateMaintenanceScheduling = async (id, payload) => {
    const { data } = await apiMain.patch(`/maintenance_scheduling/${id}/update/`, payload);
    return data;
};

// Rechazar solicitud de mantenimiento
export const rejectMaintenanceRequest = async (id, justification) => {
    const { data } = await apiMain.post(
        `/maintenance_request/${id}/reject/`,
        { justification }
    );
    return data;
};

export const getMaintenanceRequests = async () => {
    const { data } = await apiMain.get("/maintenance_request/");
    return data;
};

export const createRequestMaintenance = async (requestId, payload) => {
    const { data } = await apiMain.post(
        `/maintenance_request/${requestId}/schedule/`,
        payload
    );
    return data;
};

// Obtener técnicos activos
export const getActiveTechnicians = async () => {
    const { data } = await apiUsers.get("/users/technicians/active");
    return data;
};

// Crear programación de mantenimiento
export const createMaintenanceScheduling = async (payload) => {
    const { data } = await apiMain.post("/maintenance_scheduling/create/", payload);
    return data;
};

//SERVICIOS PARA SOLICITUDES DE MANTENIMIENTO

//Obtener lista de prioridades
export const getPrioritiesList = async () => {
    const { data } = await apiMain.get("/types/list/active/13/");
    return data;
};

//Obtener listado de maquinarias activas
export const getActiveMachineries = async () => {
    const { data } = await apiMain.get("/machinery/active/");
    return data;
};

//Crear solicitud de mantenimiento
export const createMaintenanceRequest = async (payload) => {
    const { data } = await apiMain.post("/maintenance_request/create/", payload);
    return data;
};

//Obtener detalle de solicitud de mantenimiento
export const getMaintenanceRequestDetail = async (id_request) => {
    const { data } = await apiMain.get(`maintenance_request/${id_request}/detail/`);
    return data;
};

//MANTENIMIENTOS PROGRAMADOS

//Cancelar mantenimiento programado
export const cancelScheduledMaintenance = async (id, payload) => {
    const { data } = await apiMain.post(`maintenance_scheduling/${id}/cancel/`,payload);
    return data;
};

// Obtener estados de mantenimiento programado
export const getMaintenanceSchedulingStatuses = async () => {
    const { data } = await apiMain.get("/statues/list/5/");
    return data;
};

// Obtener estados de solicitudes de mantenimiento
export const getMaintenanceRequestStatuses = async () => {
    const { data } = await apiMain.get("/statues/list/4/");
    return data;
};

// SERVICIOS PARA REPORTE DE MANTENIMIENTO (HU-PM-005)

// Crear reporte de mantenimiento
export const createMaintenanceReport = async (id_maintenance_scheduling, payload) => {
    const { data } = await apiMain.post(
        `/maintenance_reports/${id_maintenance_scheduling}/create-report/`,
        payload
    );
    return data;
};

// Obtener unidades de moneda activas
export const getActiveCurrencyUnits = async () => {
    const { data } = await apiMain.get("/units/active/10/");
    return data;
};

// Obtener marcas de repuestos activas
export const getActiveSparePartsBrands = async () => {
    const { data } = await apiMain.get("/brands/list/active/2/");
    return data;
};

export const getActiveMaintenance = async () => {
    const { data } = await apiMain.get("/maintenance/active/");
    return data;
};