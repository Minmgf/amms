import { apiMain } from "@/lib/axios";

// Crear un nuevo servicio
export const createService = async (serviceData) => {
  const { data } = await apiMain.post("/services/create/", serviceData);
  return data;
};

// Obtener tipos de servicios activos
export const getServiceTypes = async () => {
  const { data } = await apiMain.get("/types/list/active/14/");
  return data;
};

// Obtener unidades de moneda activas
export const getCurrencyUnits = async () => {
  const { data } = await apiMain.get("/units/active/10/");
  return data;
};

// Obtener lista de servicios
export const getServicesList = async () => {
  const { data } = await apiMain.get("/services/");
  return data;
};

// Obtener detalle de un servicio
export const getServiceDetail = async (serviceId) => {
  const { data } = await apiMain.get(`/services/${serviceId}/detail/`);
  return data;
};

// Actualizar servicio
export const updateService = async (serviceId, serviceData) => {
  try {
    console.log(`Llamando a API: /services/${serviceId}/update/ con datos:`, serviceData);
    
    // Intentar primero con PUT
    let response;
    try {
      response = await apiMain.put(`/services/${serviceId}/update/`, serviceData);
    } catch (putError) {
      console.log("PUT falló, intentando con PATCH:", putError.response?.status);
      if (putError.response?.status === 405) {
        response = await apiMain.patch(`/services/${serviceId}/update/`, serviceData);
      } else {
        throw putError;
      }
    }
    
    console.log("Respuesta de actualización de servicio:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    console.error("Respuesta de error:", error.response?.data);
    throw error;
  }
};

// Eliminar servicio
export const deleteService = async (serviceId) => {
  const { data } = await apiMain.delete(`/services/${serviceId}/`);
  return data;
};

// Cambiar estado de servicio (activar/inactivar)
export const toggleServiceStatus = async (serviceId) => {
  const { data } = await apiMain.patch(`/services/${serviceId}/toggle-status/`);
  return data;
};


// Obtener lista de solicitudes de servicio para gestión
export const getGestionServicesList = async () => {
  const { data } = await apiMain.get("/service_requests/list/");
  return data;
};