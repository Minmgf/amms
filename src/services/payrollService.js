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
