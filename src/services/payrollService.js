import { apiMain } from "@/lib/axios";

export const uploadMassiveAdjustments = async (
  file,
  startDate,
  endDate,
  employees
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("start_date", startDate);
  formData.append("end_date", endDate);
  formData.append("employees", JSON.stringify(employees));

  try {
    const response = await apiMain.post(
      "/temporary_adjustments/upload/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPayrollApplicableEmployees = async (
  departmentId,
  chargeId,
  startDate,
  endDate
) => {
  try {
    const response = await apiMain.get(
      "/employees/payroll-applicable-employees/",
      {
        params: {
          cargo_id: chargeId,
          fecha_desde: startDate,
          fecha_hasta: endDate,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const generateMassivePayroll = async (payload) => {
  try {
    const response = await apiMain.post("/payroll/generate-massive/", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const generateIndividualPayroll = async (payload) => {
  try {
    const response = await apiMain.post("/payroll/create-payroll/", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get list of employee news (novedades)
 * @param {Object} params - Query parameters for filtering
 * @returns {Promise<Object>} List of employee news
 */
export const getEmployeeNews = async (params = {}) => {};

/**
 * Listar nóminas generadas.
 * Endpoint: GET /payroll/list-generated/
 * @returns {Promise<Object>} Respuesta del backend con las nóminas generadas.
 */
export const getGeneratedPayrolls = async () => {};

/**
 * Descargar una nómina en PDF.
 * Endpoint: GET /payroll/{id_payroll}/download/
 * @param {number|string} payrollId - ID de la nómina a descargar.
 * @returns {Promise<{blob: Blob, filename: string, headers: any}>} Datos del PDF.
 */
export const downloadPayrollPdf = async (payrollId) => {};

/**
 * Obtener el detalle de una nómina individual.
 * Endpoint: GET /payroll/{id_payroll}/view-payroll-detail/
 * @param {number|string} payrollId - ID de la nómina.
 * @returns {Promise<Object>} Detalle de la nómina.
 */
export const getPayrollDetail = async (payrollId) => {};
