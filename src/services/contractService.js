import { apiMain } from "@/lib/axios";

// =============================================================================
// GESTIÓN DE CONTRATOS
// =============================================================================

/**
 * Eliminar contrato
 * @param {number} contractCode - ID del contrato a eliminar
 * @returns {Promise} - Respuesta del servidor
 */
export const deleteContract = async (contractCode) => {
  try {
    const { data } = await apiMain.delete(`/established_contracts/${contractCode}/`);
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Alternar estado del contrato (activar/desactivar)
 * @param {number} contractCode - ID del contrato
 * @returns {Promise} - Respuesta del servidor
 */
export const toggleContractStatus = async (contractCode) => {
  try {
    const { data } = await apiMain.patch(`/established_contracts/${contractCode}/toggle-status/`);
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
    const { data } = await apiMain.get(`/employee_charges/list/active/${departmentId}/`);
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
 * Descargar contrato en formato PDF o DOCX
 * @param {string} contractCode - Código del contrato
 * @param {string} fileType - Tipo de archivo ('pdf' o 'docx')
 * @returns {Promise} - Blob del archivo descargado
 */
export const downloadContract = async (contractCode, fileType = 'pdf') => {
  try {
    // Validar formato
    if (!['pdf', 'docx'].includes(fileType.toLowerCase())) {
      throw new Error('Formato inválido. Formatos permitidos: pdf, docx');
    }

    const response = await apiMain.get(
      `/established_contracts/${contractCode}/download/`,
      {
        params: { file_type: fileType.toLowerCase() },
        responseType: 'blob', // Importante para manejar archivos binarios
      }
    );

    // Crear nombre del archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '_');
    const filename = `contrato_${contractCode}_${timestamp}.${fileType.toLowerCase()}`;

    // Crear blob con el tipo de contenido correcto
    const contentType = fileType.toLowerCase() === 'pdf' 
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    const blob = new Blob([response.data], { type: contentType });

    // Crear URL temporal y descargar
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, filename };
  } catch (error) {
    // Manejar errores específicos del endpoint
    if (error.response) {
      const status = error.response.status;
      let message = 'Error al descargar el contrato';

      switch (status) {
        case 400:
          message = 'Formato inválido. Formatos permitidos: pdf, docx';
          break;
        case 401:
          message = 'Usuario no autenticado';
          break;
        case 403:
          message = 'No tiene permisos o el contrato seleccionado no se encuentra disponible para descarga.';
          break;
        case 404:
          message = 'No tiene permisos o el contrato seleccionado no se encuentra disponible para descarga.';
          break;
        case 500:
          message = 'Error al generar el documento del contrato.';
          break;
        default:
          message = `Error del servidor: ${status}`;
      }

      const customError = new Error(message);
      customError.status = status;
      throw customError;
    }

    console.error("Error al descargar contrato:", error);
    throw error;
  }
};
