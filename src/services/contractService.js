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
    const { data } = await apiMain.patch(
      `/contracts/${contractId}/toggle-status/`
    );
    return data;
  } catch (error) {
    throw error;
  }
};

export const downloadContract = async (contractCode, fileType = 'pdf') => {
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
    const { data } = await apiMain.post(
      "/established_contracts/create_established_contract/",
      payload
    );
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
    const { data } = await apiMain.get(
      `/established_contracts/${contractCode}/detail/`
    );
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
    const { data } = await apiMain.put(
      `/established_contracts/${contractCode}/update_established_contract/`,
      payload
    );
    return data;
  } catch (error) {
    console.error("Error al actualizar contrato:", error);
    throw error;
  }
};

// =============================================================================
// DATOS PARA FORMULARIOS DE CONTRATOS
// =============================================================================

/**
 * Obtener departamentos activos
 * @returns {Promise} - Lista de departamentos activos
 */
export const getActiveDepartments = async () => {
  try {
    const { data } = await apiMain.get("/employee_departments/list/active/");
    return data;
  } catch (error) {
    console.error("Error al obtener departamentos activos:", error);
    throw error;
  }
};

/**
 * Obtener cargos activos de un departamento
 * @param {number} departmentId - ID del departamento
 * @returns {Promise} - Lista de cargos del departamento
 */
export const getActiveCharges = async (departmentId) => {
  try {
    const { data } = await apiMain.get(
      `/employee_charges/list/active/${departmentId}/`
    );
    return data;
  } catch (error) {
    console.error("Error al obtener cargos activos:", error);
    throw error;
  }
};

/**
 * Obtener tipos activos por categoría
 * @param {number} categoryId - ID de la categoría
 * @returns {Promise} - Lista de tipos de la categoría
 */
export const getActiveTypes = async (categoryId) => {
  try {
    const { data } = await apiMain.get(`/types/list/active/${categoryId}/`);
    return data;
  } catch (error) {
    console.error("Error al obtener tipos activos:", error);
    throw error;
  }
};

/**
 * Obtener unidades activas por categoría
 * @param {number} categoryId - ID de la categoría de unidades
 * @returns {Promise} - Lista de unidades de la categoría
 */
export const getActiveUnits = async (categoryId) => {
  try {
    const { data } = await apiMain.get(`/units/active/${categoryId}/`);
    return data;
  } catch (error) {
    console.error("Error al obtener unidades activas:", error);
    throw error;
  }
};

/**
 * Obtener días de la semana
 * @returns {Promise} - Lista de días de la semana
 */
export const getDaysOfWeek = async () => {
  try {
    const { data } = await apiMain.get("/days_of_week/");
    return data;
  } catch (error) {
    console.error("Error al obtener días de la semana:", error);
    throw error;
  }
};

// =============================================================================
// FINALIZACIÓN DE CONTRATOS
// =============================================================================

/**
 * Obtener tipos de razones de terminación de contrato (categoría 20)
 * @returns {Promise} - Lista de razones de terminación
 */
export const getContractTerminationReasons = async () => {
  try {
    const { data } = await apiMain.get("/types/list/active/20/");
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Finalizar contrato de empleado
 * @param {string} contractCode - Código del contrato
 * @param {Object} payload - Datos de finalización
 * @param {number} payload.contract_termination_reason - ID de la razón de terminación
 * @param {string} payload.observation - Observación de la finalización
 * @returns {Promise} - Respuesta del servidor
 */
export const terminateContract = async (contractCode, payload) => {
  try {
    const { data } = await apiMain.post(`/employees/${contractCode}/terminate-contract/`, payload);
    return data;
  } catch (error) {
    // Manejar errores específicos del endpoint
    if (error.response) {
      const status = error.response.status;
      let message = 'Error al finalizar el contrato';

      switch (status) {
        case 400:
          // Extraer errores de validación si están disponibles
          if (error.response.data?.errors) {
            const errors = error.response.data.errors;
            const errorMessages = [];
            
            Object.entries(errors).forEach(([field, messages]) => {
              if (Array.isArray(messages)) {
                errorMessages.push(...messages);
              }
            });
            
            if (errorMessages.length > 0) {
              message = errorMessages.join('. ');
            }
          } else if (error.response.data?.message) {
            message = error.response.data.message;
          }
          break;
        case 401:
          message = 'Usuario no autenticado';
          break;
        case 403:
          message = 'No tiene permisos para finalizar este contrato';
          break;
        case 404:
          message = 'Contrato no encontrado';
          break;
        case 500:
          message = 'Error interno del servidor al finalizar el contrato';
          break;
        default:
          message = error.response.data?.message || `Error del servidor: ${status}`;
      }

      const customError = new Error(message);
      customError.status = status;
      customError.validationErrors = error.response.data?.errors || {};
      throw customError;
    }

    throw error;
  }
};
