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
    const response = await apiMain.get("/established_contracts/list/");
    return response.data;
  } catch (error) {
    console.error("Error al obtener contratos:", error);
    throw error;
  }
};

/**
 * Eliminar contrato
 * @param {number} contractId - ID del contrato a eliminar
 * @returns {Promise} - Respuesta del servidor
 */
export const deleteContract = async (contractId) => {
  try {
    const { data } = await apiMain.delete(`/contracts/${contractId}/`);
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Alternar estado del contrato (activar/desactivar)
 * @param {number} contractId - ID del contrato
 * @returns {Promise} - Respuesta del servidor
 */
export const toggleContractStatus = async (contractId) => {
  try {
    const { data } = await apiMain.patch(`/contracts/${contractId}/toggle-status/`);
    return data;
  } catch (error) {
    throw error;
  }
};
