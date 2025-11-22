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
  const { data } = await apiMain.get(`/data/${requestCode}/by_request/?machinery_id=${machineryId}&operator_id=${operatorId}`, {
    timeout: 300000 // 5 minutos timeout para datos históricos
  });
  return data;
};

export const getHistoricalRequestData = async (requestCode) => {
  const { data } = await apiMain.get(`/data/${requestCode}/by_request/`, {
    timeout: 300000 // 5 minutos timeout para datos históricos
  });
  return data;
};

export const downloadTelemetryReport = async (requestCode, reportFormat = 'excel') => {
  try {
    const response = await apiMain.get(`/data/generate-report/`, {
      params: {
        request_id: requestCode,
        report_format: reportFormat
      },
      responseType: 'blob',
      timeout: 120000 // 120 segundos timeout para descarga
    });

    // Verificar si la respuesta es un JSON con error (no datos disponibles)
    const contentType = response.headers['content-type'];
    console.log('Content-Type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      // Leer el blob como texto para verificar el mensaje
      const text = await response.data.text();
      console.log('JSON Response text:', text);
      const jsonResponse = JSON.parse(text);
      console.log('Parsed JSON:', jsonResponse);
      
      if (jsonResponse.success === false) {
        console.log('Returning no data response:', jsonResponse.message);
        return { 
          success: false, 
          message: jsonResponse.message
        };
      }
    }

    // Crear un blob y descargarlo
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Determinar la extensión del archivo
    const extension = reportFormat === 'csv' ? 'csv' : 'xlsx';
    link.setAttribute('download', `reporte_telemetria_${requestCode}.${extension}`);
    
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('Error downloading telemetry report:', error);
    throw error;
  }
};