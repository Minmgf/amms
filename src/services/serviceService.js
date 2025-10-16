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

// Actualizar servicio (placeholder para futura implementación)
export const updateService = async (serviceId, serviceData) => {
  const { data } = await apiMain.put(`/services/${serviceId}/update/`, serviceData);
  return data;
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