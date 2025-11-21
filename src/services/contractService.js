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

// =============================================================================
// GESTIÓN DE DEDUCCIONES E INCREMENTOS
// =============================================================================

/**
 * Obtener tipos de deducción activos (categoría 18)
 * @returns {Promise} - Lista de tipos de deducción
 */
export const getDeductionTypes = async () => {
  try {
    const { data } = await apiMain.get("/types/list/active/18/");
    return data;
  } catch (error) {
    console.error("Error al obtener tipos de deducción:", error);
    throw error;
  }
};

/**
 * Obtener tipos de incremento activos (categoría 19)
 * @returns {Promise} - Lista de tipos de incremento
 */
export const getIncreaseTypes = async () => {
  try {
    const { data } = await apiMain.get("/types/list/active/19/");
    return data;
  } catch (error) {
    console.error("Error al obtener tipos de incremento:", error);
    throw error;
  }
};

/**
 * Crear contrato establecido con deducciones e incrementos
 * @param {Object} payload - Datos del contrato
 * @returns {Promise} - Respuesta del servidor
 */
export const createEstablishedContract = async (payload) => {
  try {
    const { data } = await apiMain.post("/established_contracts/create_established_contract/", payload);
    return data;
  } catch (error) {
    console.error("Error al crear contrato:", error);
    throw error;
  }
};

/**
 * Obtener lista de contratos establecidos
 * @returns {Promise} - Lista de contratos
 */
export const getEstablishedContracts = async () => {
  try {
    const { data } = await apiMain.get("/established_contracts/list/");
    return data;
  } catch (error) {
    console.error("Error al obtener contratos:", error);
    throw error;
  }
};

/**
 * Obtener detalle de un contrato establecido
 * @param {string} contractCode - Código del contrato
 * @returns {Promise} - Detalle del contrato
 */
export const getContractDetail = async (contractCode) => {
  try {
    const { data } = await apiMain.get(`/established_contracts/${contractCode}/detail/`);
    return data;
  } catch (error) {
    console.error("Error al obtener detalle del contrato:", error);
    throw error;
  }
};

/**
 * Actualizar contrato establecido
 * @param {string} contractCode - Código del contrato
 * @param {Object} payload - Datos del contrato a actualizar
 * @returns {Promise} - Respuesta del servidor
 */
export const updateEstablishedContract = async (contractCode, payload) => {
  try {
    const { data } = await apiMain.put(`/established_contracts/${contractCode}/update_established_contract/`, payload);
    return data;
  } catch (error) {
    console.error("Error al actualizar contrato:", error);
    throw error;
  }
};
