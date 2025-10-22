import { apiMain } from "@/lib/axios";

// Crear un nuevo servicio
export const createService = async (serviceData) => {
  try {
    console.log("Llamando a API: /services/create/ con datos:", serviceData);
    const { data } = await apiMain.post("/services/create/", serviceData);
    console.log("Respuesta de creación de servicio:", data);
    return data;
  } catch (error) {
    console.error("Error al crear servicio:", error);
    console.error("Respuesta de error:", error.response?.data);
    throw error;
  }
};

// Obtener tipos de servicios activos
export const getServiceTypes = async () => {
  try {
    console.log("Llamando a API: /types/list/active/14/");
    const { data } = await apiMain.get("/types/list/active/14/");
    console.log("Respuesta tipos de servicios:", data);
    return data;
  } catch (error) {
    console.error("Error al obtener tipos de servicios:", error);
    throw error;
  }
};

// Obtener unidades de moneda activas
export const getCurrencyUnits = async () => {
  try {
    console.log("Llamando a API: /units/active/10/");
    const { data } = await apiMain.get("/units/active/10/");
    console.log("Respuesta unidades de moneda:", data);
    return data;
  } catch (error) {
    console.error("Error al obtener unidades de moneda:", error);
    throw error;
  }
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

// Eliminar servicio (placeholder para futura implementación)
export const deleteService = async (serviceId) => {
  const { data } = await apiMain.delete(`/services/${serviceId}/`);
  return data;
};


// Obtener lista de solicitudes de servicio para gestión
export const getGestionServicesList = async () => {
  const { data } = await apiMain.get("/service_requests/list/");
  return data;
};