import { apiAudit } from "@/lib/axios";

/**
 * Obtiene todos los eventos de auditoría
 */
export const getAudit = async () => {
    const { data } = await apiAudit.get("/audit-events");
    return data;
};

/**
 * Obtiene el historial de cambios de una maquinaria específica
 * @param {number|string} machineryId - ID de la maquinaria para filtrar en frontend
 * @param {object} filters - Filtros opcionales (operation: CREATE/UPDATE/DELETE)
 * @returns {Promise} - Promesa con los eventos de auditoría filtrados
 */
export const getMachineryHistory = async (machineryId, filters = {}) => {
    const params = {
        module: 'machinery',
        ...(filters.operation && { operation: filters.operation })
    };
    
    console.log('🔍 getMachineryHistory - Params:', params);
    const { data } = await apiAudit.get("/audit-events", { params });
    console.log('📦 getMachineryHistory - Total eventos:', data.length);
    
    // Filtrar por maquinaria en el frontend
    const filtered = machineryId 
        ? data.filter(event => {
            const eventMachineryId = event.diff?.created?.id_machinery || 
                                     event.diff?.changed?.id_machinery || 
                                     event.diff?.removed?.id_machinery ||
                                     event.meta?.id_machinery;
            return eventMachineryId == machineryId;
          })
        : data;
    
    console.log('📦 getMachineryHistory - Eventos filtrados:', filtered.length, `(id_machinery: ${machineryId})`);
    return filtered;
};

/**
 * Obtiene el historial de solicitudes de mantenimiento de una maquinaria
 * @param {number|string} machineryId - ID de la maquinaria para filtrar en frontend
 * @returns {Promise} - Promesa con los eventos de auditoría de solicitudes filtrados
 */
export const getMaintenanceRequestHistory = async (machineryId) => {
    const params = {
        module: 'machinery',
        submodule: 'maintenance_request'
    };
    
    console.log('🔍 getMaintenanceRequestHistory - Params:', params);
    const { data } = await apiAudit.get("/audit-events", { params });
    console.log('📦 getMaintenanceRequestHistory - Total eventos:', data.length);
    
    // Filtrar por maquinaria en el frontend
    const filtered = machineryId
        ? data.filter(event => event.diff?.created?.id_machinery == machineryId)
        : data;
    
    console.log('📦 getMaintenanceRequestHistory - Eventos filtrados:', filtered.length, `(id_machinery: ${machineryId})`);
    return filtered;
};

/**
 * Obtiene el historial de mantenimientos programados de una maquinaria
 * @param {number|string} machineryId - ID de la maquinaria para filtrar en frontend
 * @returns {Promise} - Promesa con los eventos de auditoría de mantenimientos filtrados
 */
export const getMaintenanceScheduledHistory = async (machineryId) => {
    const params = {
        module: 'machinery',
        submodule: 'maintenance_scheduling'
    };
    
    console.log('🔍 getMaintenanceScheduledHistory - Params:', params);
    const { data } = await apiAudit.get("/audit-events", { params });
    console.log('📦 getMaintenanceScheduledHistory - Total eventos:', data.length);
    
    // Filtrar por maquinaria en el frontend
    const filtered = machineryId
        ? data.filter(event => event.diff?.created?.id_machinery == machineryId)
        : data;
    
    console.log('📦 getMaintenanceScheduledHistory - Eventos filtrados:', filtered.length, `(id_machinery: ${machineryId})`);
    return filtered;
};