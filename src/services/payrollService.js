import { apiMain } from "@/lib/axios";

/**
 * Listar nóminas generadas.
 * Endpoint: GET /payroll/list-generated/
 * @returns {Promise<Object>} Respuesta del backend con las nóminas generadas.
 */
export const getGeneratedPayrolls = async () => {
  try {
    const response = await apiMain.get("/payroll/list-generated/");
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Error fetching generated payrolls:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else {
      console.error(
        "Error fetching generated payrolls (no response):",
        error.message || error
      );
    }
    throw error;
  }
};

/**
 * Descargar una nómina en PDF.
 * Endpoint: GET /payroll/{id_payroll}/download/
 * @param {number|string} payrollId - ID de la nómina a descargar.
 * @returns {Promise<{blob: Blob, filename: string, headers: any}>} Datos del PDF.
 */
export const downloadPayrollPdf = async (payrollId) => {
  try {
    const response = await apiMain.get(`/payroll/${payrollId}/download/`, {
      responseType: "blob",
    });

    const disposition = response.headers?.["content-disposition"] || "";
    let filename = `nomina_${payrollId}.pdf`;
    const match = disposition.match(/filename="?([^";]+)"?/i);
    if (match && match[1]) {
      filename = match[1];
    }

    return {
      blob: response.data,
      filename,
      headers: response.headers,
    };
  } catch (error) {
    if (error.response) {
      console.error("Error downloading payroll PDF:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else {
      console.error(
        "Error downloading payroll PDF (no response):",
        error.message || error
      );
    }
    throw error;
  }
};

/**
 * Obtener el detalle de una nómina individual.
 * Endpoint: GET /payroll/{id_payroll}/view-payroll-detail/
 * @param {number|string} payrollId - ID de la nómina.
 * @returns {Promise<Object>} Detalle de la nómina.
 */
export const getPayrollDetail = async (payrollId) => {
  try {
    const response = await apiMain.get(
      `/payroll/${payrollId}/view-payroll-detail/`
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Error fetching payroll detail:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else {
      console.error(
        "Error fetching payroll detail (no response):",
        error.message || error
      );
    }
    throw error;
  }
};

