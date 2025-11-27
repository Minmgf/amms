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
export const getEmployeeNews = async (params = {}) => {
  try {
    const response = await apiMain.get("/employee_news/list/", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching employee news:", error);
    throw error;
  }
};

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

/**
 * Generar informe de historial de nóminas en PDF.
 * Endpoint: POST /payroll/generate-history-report/
 * @param {Object} payload - Datos para el reporte { employeeIdentification, dateFrom, dateTo, reportType }
 * @returns {Promise<Blob>} Blob del PDF generado.
 */
export const generatePayrollHistoryReport = async (payload) => {
  try {
    const response = await apiMain.post(
      "/payroll/generate-history-report/",
      payload,
      {
        responseType: "blob", // Importante para recibir el archivo binario
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
