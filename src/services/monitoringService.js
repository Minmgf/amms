import { apiMain } from "@/lib/axios";

export const getDataMacineryhOperator = async (filters = {}) => {
    const params = {};    
    if (filters.machinery_id) params.machinery_id = filters.machinery_id;
    if (filters.operator_id) params.operator_id = filters.operator_id;
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    
    const { data } = await apiMain.get("/data/service_requests/", { 
        params,
        timeout: 60000 // 60 segundos timeout
    });
    return data;
};

export const getRequestData = async (requestCode, machineryId, operatorId) => {
  const { data } = await apiMain.get(`/data/${requestCode}/by_request/?machinery_id=${machineryId}&operator_id=${operatorId}`);
  return data;
};