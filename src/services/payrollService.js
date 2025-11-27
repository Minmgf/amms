import { apiMain } from "@/lib/axios";

export const uploadMassiveAdjustments = async (file, startDate, endDate, employees) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("start_date", startDate);
  formData.append("end_date", endDate);
  formData.append("employees", JSON.stringify(employees));

  try {
    const response = await apiMain.post("/temporary_adjustments/upload/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPayrollApplicableEmployees = async (chargeId, startDate, endDate) => {
  try {
    const response = await apiMain.get("/payroll/payroll-applicable-employees/", {
      params: {
        cargo_id: chargeId,
        fecha_desde: startDate,
        fecha_hasta: endDate,
      },
    });
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
