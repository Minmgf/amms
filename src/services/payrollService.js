import { apiMain } from "@/lib/axios";

/**
 * Get list of employee news (novedades)
 * @param {Object} params - Query parameters for filtering
 * @returns {Promise<Object>} List of employee news
 */
export const getEmployeeNews = async (params = {}) => {
  try {
    const response = await apiMain.get('/employee_news/list/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching employee news:', error);
    throw error;
  }
};

