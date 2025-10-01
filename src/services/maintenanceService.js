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

export const getActiveTechnicians = async () => {
    try {
        // Cuando el endpoint esté en producción, cambiar a:
        // const { data } = await apiMain.get("/users/technicians/active/");
        
        // Por ahora, retornar datos mock
        return [
            { value: "7", label: "Juan Pérez" },
            { value: "8", label: "María García" },
            { value: "9", label: "Carlos López" }
        ];
    } catch (error) {
        console.error("Error obteniendo técnicos:", error);
        // Retornar array vacío en caso de error
        return [];
    }
};

// Crear programación de mantenimiento
export const createMaintenanceScheduling = async (payload) => {
    try {
        // Cuando el endpoint esté disponible, descomentar:
        // const { data } = await apiMain.post("/maintenance_scheduling/create/", payload);
        // return data;
        
        // Por ahora, simular respuesta exitosa
        return {
            success: true,
            message: "Mantenimiento programado creado exitosamente",
            data: { id_maintenance_scheduling: Math.random() }
        };
    } catch (error) {
        console.error("Error creando programación:", error);
        throw error;
    }
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

// Obtener estados de mantenimiento programado
export const getMaintenanceSchedulingStatuses = async () => {
    const { data } = await apiMain.get("/statues/list/5/");
    return data;
};