import { apiMain } from "@/lib/axios";

// =============================================================================
// GESTIÓN DE CONTRATOS
// =============================================================================

/**
 * Obtener lista de contratos registrados
 * @returns {Promise} - Lista de contratos
 */
export const getContracts = async () => {
  try {
    const response = await apiMain.get("/contracts/");
    return response.data;
  } catch (error) {
    console.error("Error al obtener contratos:", error);
    throw error;
  }
};
