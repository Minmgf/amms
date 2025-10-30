import { apiMain } from "@/lib/axios";

//Función para listar todos los dispositivos 
export const getDevicesList = async () => {
    const { data } = await apiMain.get(`/telemetry-devices/`);
    return data;
};

//Función para Eliminar un dispositivo
export const deleteDevice = async (deviceId) => {
    try {
        const { data } = await apiMain.delete(`/telemetry-devices/${deviceId}/`);
        return data;
    } catch (error) {
        throw error;
    }
};

// Alternar estado del dispositivo (activar/desactivar)
export const toggleDeviceStatus = async (deviceId) => {
    try {
        const { data } = await apiMain.patch(`/telemetry-devices/${deviceId}/toggle-status/`);
        return data;
    } catch (error) {
        throw error;
    }
};