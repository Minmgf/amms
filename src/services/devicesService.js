import { apiMain } from "@/lib/axios";

// =============================================================================
// DISPOSITIVOS DE MONITOREO
// =============================================================================

/**
 * Obtener todos los parametros de monitoreo disponibles
 * @returns {Promise} - { success, message, data: [{ id, parameter_name, avl_id_parameter, description, minimum_range, maximum_range, unit, category }] }
 */
export const getMonitoringParameters = async () => {
  try {
    const response = await apiMain.get("/parameters/");
    return response.data;
  } catch (error) {
    console.error("Error al obtener parametros de monitoreo:", error);
    throw error;
  }
};

/**
 * Crear un nuevo dispositivo de telemetria
 * @param {object} deviceData - { name: string, IMEI: number, parameters: [1, 2, 3] }
 * @returns {Promise} - { message: string, id: number }
 */
export const createTelemetryDevice = async (deviceData) => {
  try {
    const response = await apiMain.post("/telemetry-devices/", deviceData);
    return response.data;
  } catch (error) {
    console.error("Error al crear dispositivo:", error);
    throw error;
  }
};

/**
 * Actualizar un dispositivo existente
 * @param {number} deviceId - ID del dispositivo
 * @param {object} deviceData - { name: string, IMEI: number, parameters: [1, 2, 3] }
 * @returns {Promise} - { success, message, data: { id_device, name, IMEI, registration_date, status_id, status_name } }
 */
export const updateDevice = async (deviceId, deviceData) => {
  try {
    const response = await apiMain.put(`/telemetry-devices/${deviceId}/`, deviceData);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar dispositivo:", error);
    throw error;
  }
};

/**
 * Obtener detalles de un dispositivo por ID
 * @param {number} deviceId - ID del dispositivo
 * @returns {Promise} - { success, message, data: { name, IMEI, parameters: [{id, parameter_name, avl_id_parameter, category}] } }
 */
export const getDeviceById = async (deviceId) => {
  try {
    const response = await apiMain.get(`/telemetry-devices/${deviceId}/`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener dispositivo:", error);
    throw error;
  }
};



/**
 * Obtener lista de dispositivos
 */
export const getDevicesList = async () => {
  try {
    const response = await apiMain.get("/main/devices/");
    return response.data;
  } catch (error) {
    console.error("Error al obtener lista de dispositivos:", error);
    throw error;
  }
};

/**
 * Obtener lista de dispositivos de telemetria registrados
 */
export const getTelemetryDevices = async () => {
  try {
    const response = await apiMain.get("/telemetry-devices/");
    return response.data;
  } catch (error) {
    console.error("Error al obtener dispositivos de telemetria:", error);
    throw error;
  }
};
