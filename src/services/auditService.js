import { apiAudit, apiMain } from "@/lib/axios";

/**
 * Obtiene todos los eventos de auditoría
 */
export const getAudit = async () => {
    const { data } = await apiAudit.get("/audit-events");
    return data;
};

export const getContractHistory = async (code) => {
    const { data } = await apiAudit.get(`audit-events?object_id=${code}`);
    return data;
};

/**
 * Obtiene el historial de cambios de una maquinaria específica
 * @param {number|string} machineryId - ID de la maquinaria
 * @param {object} filters - Filtros opcionales (operation: CREATE/UPDATE/DELETE)
 * @returns {Promise} - Promesa con los eventos de auditoría
 */
export const getMachineryHistory = async (machineryId, filters = {}) => {
    const params = {
        module: 'machinery',
        ...(machineryId && { id_machinery: machineryId }),
        ...(filters.operation && { operation: filters.operation })
    };
    
    const { data } = await apiAudit.get("/audit-events", { params });
    return data;
};

/**
 * Obtiene el historial de solicitudes de mantenimiento de una maquinaria
 * @param {number|string} machineryId - ID de la maquinaria
 * @returns {Promise} - Promesa con los eventos de auditoría de solicitudes de mantenimiento
 */
export const getMaintenanceRequestHistory = async (machineryId) => {
    const params = {
        submodule: 'maintenance_request',
        ...(machineryId && { id_machinery: machineryId })
    };
    
    const { data } = await apiAudit.get("/audit-events", { params });
    return data;
};

/**
 * Obtiene el historial de mantenimientos programados de una maquinaria
 * @param {number|string} machineryId - ID de la maquinaria
 * @returns {Promise} - Promesa con los eventos de auditoría de mantenimientos programados
 */
export const getMaintenanceScheduledHistory = async (machineryId) => {
    const params = {
        submodule: 'maintenance_scheduling',
        ...(machineryId && { id_machinery: machineryId })
    };
    
    const { data } = await apiAudit.get("/audit-events", { params });
    return data;
};

/**
 * Obtiene la lista de reportes de mantenimiento
 * @returns {Promise} - Promesa con la lista de reportes de mantenimiento
 */
export const getMaintenanceReports = async () => {
    const { data } = await apiMain.get("/maintenance_reports/list/");
    return data;
};

/**
 * Obtiene el detalle de un reporte de mantenimiento específico
 * @param {string} idMaintenanceScheduling - ID del mantenimiento programado
 * @returns {Promise} - Promesa con los detalles del reporte
 */
export const getMaintenanceReportDetail = async (idMaintenanceScheduling) => {
    const { data } = await apiMain.get(`/maintenance_reports/${idMaintenanceScheduling}/detail/`);
    return data;
};

/**
 * Descarga el PDF de un reporte de mantenimiento
 * @param {string} idMaintenanceScheduling - ID del mantenimiento programado
 * @returns {Promise} - Promesa con el blob del PDF
 */
export const downloadMaintenanceReportPDF = async (idMaintenanceScheduling) => {
    const response = await apiMain.get(`/maintenance_reports/${idMaintenanceScheduling}/download/`, {
        responseType: 'blob'
    });
    return response.data;
};