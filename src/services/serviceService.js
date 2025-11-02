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

// Generar reporte de solicitudes de servicio
export const generateServiceRequestsReport = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Agregar filtros solo si tienen valor
    if (filters.report_format) params.append('report_format', filters.report_format);
    if (filters.customer_id) params.append('customer_id', filters.customer_id);
    if (filters.request_status) params.append('request_status', filters.request_status);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.payment_method) params.append('payment_method', filters.payment_method);
    if (filters.scheduled_start_date_from) params.append('scheduled_start_date_from', filters.scheduled_start_date_from);
    if (filters.scheduled_start_date_to) params.append('scheduled_start_date_to', filters.scheduled_start_date_to);

    const queryString = params.toString();
    const url = queryString 
      ? `/service_requests/generate-report/?${queryString}`
      : '/service_requests/generate-report/';
    
    console.log('Requesting report from:', url);

    const response = await apiMain.get(url, {
      responseType: 'blob', // Importante para archivos
    });

    return response;
  } catch (error) {
    console.error("Error al generar reporte:", error);
    throw error;
  }
};