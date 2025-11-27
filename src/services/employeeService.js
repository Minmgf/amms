import { apiMain, apiUsers } from "@/lib/axios";
// =============================================================================
// GESTIÓN DE EMPLEADOS
// =============================================================================

// =============================================================================
// PARAMETRIZACIÓN - Endpoints para formularios
// =============================================================================

/**
 * Get list of identification/document types
 * @returns {Promise<Array>} List of document types
 */
export const getDocumentTypes = async () => {
  try {
    const response = await apiUsers.get('/users/type-documents');
    return response.data;
  } catch (error) {
    console.error('Error fetching document types:', error);
    throw error;
  }
};

/**
 * Get list of genders
 * @returns {Promise<Array>} List of genders
 */
export const getGenders = async () => {
  try {
    const response = await apiUsers.get('/users/genders');
    return response.data;
  } catch (error) {
    console.error('Error fetching genders:', error);
    throw error;
  }
};

/**
 * Get list of active departments
 * @returns {Promise<Array>} List of departments
 */
export const getDepartments = async () => {
  try {
    const response = await apiMain.get('/employee_departments/list/active/');
    const payload = response.data;

    if (Array.isArray(payload)) {
      return {
        success: true,
        data: payload
      };
    }

    if (payload && Array.isArray(payload.data)) {
      return {
        success: true,
        data: payload.data,
        message: payload.message
      };
    }

    return {
      success: false,
      data: [],
      message: 'Unexpected departments response format'
    };
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

/**
 * Get list of active positions/charges for a specific department
 * @param {number} departmentId - Department ID
 * @returns {Promise<Array>} List of positions
 */
export const getPositions = async (departmentId) => {
  try {
    const response = await apiMain.get(`/employee_charges/list/active/${departmentId}/`);
    const payload = response.data;

    if (Array.isArray(payload)) {
      return {
        success: true,
        data: payload
      };
    }

    if (payload && Array.isArray(payload.data)) {
      return {
        success: true,
        data: payload.data,
        message: payload.message
      };
    }

    return {
      success: false,
      data: [],
      message: 'Unexpected positions response format'
    };
  } catch (error) {
    console.error('Error fetching positions:', error);
    throw error;
  }
};

/**
 * Get list of active established contracts for a specific position
 * @param {number} positionId - Position/charge ID
 * @returns {Promise<Array>} List of established contracts
 *
 * ⚠️ PROBLEMA CRÍTICO DEL BACKEND:
 * El endpoint GET /established_contracts/{id}/list_active_established_contracts/
 * NO retorna el campo 'id' en la respuesta, solo retorna 'contract_code'.
 *
 * IMPACTO:
 * - No se puede obtener los detalles del contrato usando getEstablishedContractDetails()
 * - El endpoint de detalles espera un ID: /established_contracts/{contractId}/detail/
 * - El código actual usa contract.id || contract.contract_code como workaround
 *
 * SOLUCIÓN REQUERIDA:
 * El backend debe agregar el campo 'id' a la respuesta del listado:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 123,  // ← ESTE CAMPO DEBE SER AGREGADO POR EL BACKEND
 *       "contract_code": "CON-ENCARGADODEVENTAS-0002",
 *       "contract_type": 19,
 *       ...
 *     }
 *   ]
 * }
 */
export const getEstablishedContracts = async (positionId) => {
  try {
    const response = await apiMain.get(`/established_contracts/${positionId}/list_active_established_contracts/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching established contracts:', error);
    throw error;
  }
};

/**
 * Get details of a specific established contract
 * @param {number} contractId - Established contract ID
 * @returns {Promise<Object>} Contract details
 */
export const getEstablishedContractDetails = async (contractId) => {
  try {
    const response = await apiMain.get(`/established_contracts/${contractId}/detail/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching established contract details:', error);
    throw error;
  }
};

/**
 * Get list of currency types
 * @returns {Promise<Array>} List of currencies
 */
export const getCurrencyTypes = async () => {
  try {
    const response = await apiMain.get('/units/active/10/');
    return response.data;
  } catch (error) {
    console.error('Error fetching currency types:', error);
    throw error;
  }
};

/**
 * Get list of contract types
 * @returns {Promise<Array>} List of contract types
 */
export const getContractTypes = async () => {
  try {
    const response = await apiMain.get('/types/list/active/15/');
    return response.data;
  } catch (error) {
    console.error('Error fetching contract types:', error);
    throw error;
  }
};

/**
 * Get list of workday types
 * @returns {Promise<Array>} List of workday types
 */
export const getWorkdayTypes = async () => {
  try {
    const response = await apiMain.get('/types/list/active/16/');
    return response.data;
  } catch (error) {
    console.error('Error fetching workday types:', error);
    throw error;
  }
};

/**
 * Get list of work mode types
 * @returns {Promise<Array>} List of work mode types
 */
export const getWorkModeTypes = async () => {
  try {
    const response = await apiMain.get('/types/list/active/17/');
    return response.data;
  } catch (error) {
    console.error('Error fetching work mode types:', error);
    throw error;
  }
};

/**
 * Get list of deduction types
 * @returns {Promise<Array>} List of deduction types
 */
export const getDeductionTypes = async () => {
  try {
    const response = await apiMain.get('/types/list/active/18/');
    return response.data;
  } catch (error) {
    console.error('Error fetching deduction types:', error);
    throw error;
  }
};

/**
 * Get list of increase types
 * @returns {Promise<Array>} List of increase types
 */
export const getIncreaseTypes = async () => {
  try {
    const response = await apiMain.get('/types/list/active/19/');
    return response.data;
  } catch (error) {
    console.error('Error fetching increase types:', error);
    throw error;
  }
};

/**
 * Get list of days of the week
 * @returns {Promise<Array>} List of days
 */
export const getDaysOfWeek = async () => {
  try {
    const response = await apiMain.get('/days_of_week/');
    return response.data;
  } catch (error) {
    console.error('Error fetching days of week:', error);
    throw error;
  }
};

// =============================================================================
// USER MANAGEMENT
// =============================================================================

/**
 * Search for a user by document number
 * @param {string} documentNumber - Document number to search
 * @returns {Promise<Object>} User data if found
 */
export const getUserByDocument = async (documentNumber) => {
  try {
    const response = await apiUsers.get(`/users/by-document/${documentNumber}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // User not found
    }
    console.error('Error searching user by document:', error);
    throw error;
  }
};

/**
 * Create a new user for employee registration
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user with id
 */
export const createUser = async (userData) => {
  try {
    const response = await apiUsers.post('/users/admin/create-employee', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Update existing user data
 * @param {number} userId - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Updated user
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await apiUsers.put(`/users/admin/${userId}/update-employee/`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// =============================================================================
// EMPLOYEE MANAGEMENT
// =============================================================================

/**
 * Obtener lista de empleados
 * @returns {Promise<Object>} Lista de empleados
 */
export const getEmployeesList = async () => {
  try {
    const response = await apiMain.get('/employees/list/');
    return response.data;
  } catch (error) {
    // Manejo de errores específicos del endpoint
    if (error.response) {
      const status = error.response.status;
      let message = 'Error al obtener la lista de empleados';

      switch (status) {
        case 400:
          message = error.response.data?.message || 'Parámetros inválidos';
          break;
        case 401:
          message = 'Usuario no autenticado';
          break;
        case 403:
          message = 'No tiene permisos para acceder al listado de empleados.';
          break;
        default:
          message = `Error del servidor: ${status}`;
      }

      const customError = new Error(message);
      customError.status = status;
      throw customError;
    }

    console.error('Error fetching employees list:', error);
    throw error;
  }
};

/**
 * Create a new employee with contract
 * @param {Object} employeeData - Employee and contract data
 * @returns {Promise<Object>} Created employee
 */
export const createEmployee = async (employeeData) => {
  try {
    const response = await apiMain.post('/employees/', employeeData);
    return response.data;
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
};

/**
 * Create a new established contract
 * @param {Object} contractData - Contract data
 * @returns {Promise<Object>} Created contract
 */
export const createEstablishedContract = async (contractData) => {
  try {
    const response = await apiMain.post('/established_contracts/create_established_contract/', contractData);
    return response.data;
  } catch (error) {
    console.error('Error creating established contract:', error);
    throw error;
  }
};

/**
 * Update an existing employee (HU-EMP-009)
 * @param {number} employeeId - Employee ID
 * @param {Object} employeeData - Employee data to update
 * @returns {Promise<Object>} Updated employee
 */
export const updateEmployee = async (employeeId, employeeData) => {
  try {
    const response = await apiMain.patch(`/employees/${employeeId}/update-employee/`, employeeData);
    return response.data;
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
};

/**
 * Get latest employee contract (HU-EMP-009)
 * @param {number} employeeId - Employee ID
 * @returns {Promise<Object>} Latest contract details
 */
export const getLatestEmployeeContract = async (employeeId) => {
  try {
    const response = await apiMain.get(`/employees/${employeeId}/latest_employee_contract/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching latest employee contract:', error);
    throw error;
  }
};

/**
 * Create a contract addendum (Otro Sí) for an employee (HU-EMP-006)
 * @param {number} employeeId - Employee ID
 * @param {Object} payload - Addendum data
 * @returns {Promise<Object>} Created addendum/contract
 */
export const createContractAddendum = async (employeeId, payload) => {
  try {
    const response = await apiMain.post(`/employees/${employeeId}/generate-otro-si/`, payload);
    return response.data;
  } catch (error) {
    console.error('Error creating contract addendum:', error);
    throw error;
  }
};

/**
 * Get user information by ID (HU-EMP-009)
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User information
 */
export const getUserById = async (userId) => {
  try {
    const response = await apiUsers.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

/**
 * Toggle employee status (activate/deactivate)
 * @param {number} employeeId - Employee ID
 * @param {string|null} observation - Observation (required for deactivation, optional for activation)
 * @returns {Promise<Object>} Response message
 */
export const toggleEmployeeStatus = async (employeeId, observation = null) => {
  try {
    const payload = observation ? { observation } : {};
    const response = await apiMain.patch(`/employees/${employeeId}/toggle-status/`, payload);
    return response.data;
  } catch (error) {
    console.error('Error toggling employee status:', error);
    throw error;
  }
};

/**
 * Get detailed information of an employee
 * @param {number} employeeId - Employee ID
 * @returns {Promise<Object>} Employee details
 */
export const getEmployeeDetails = async (employeeId) => {
  try {
    const response = await apiMain.get(`/employees/${employeeId}/detail/`);
    return response.data;
    
  } catch (error) {
    console.error('Error fetching employee details:', error);
    throw error;
  }
};

/**
 * Get detailed information of a contract
 * @param {number} contractId - Contract ID
 * @returns {Promise<Object>} Contract details
 */
export const getContractDetails = async (contractId) => {
  try {
    const response = await apiMain.get(`/employees/${contractId}/employee_contract_detail/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching contract details:', error);
    throw error;
  }
};

/**
 * Get contract history for an employee
 * @param {number} employeeId - Employee ID
 * @returns {Promise<Array>} Contract history
 */
export const getContractHistory = async (employeeId) => {
  try {
    const response = await apiMain.get(`/employees/${employeeId}/contract-history/`);
    return response.data;

  } catch (error) {
    console.error('Error fetching contract history:', error);
    throw error;
  }
};

/**
 * Get history for a contract
 * @param {number} contractId - Contract ID
 * @returns {Promise<Array>} Contract history
 */
export const getHistoryByContract = async (contractId) => {
  try {
    const response = await apiMain.get(`/employees/contract-detail-history/?contract_code=${contractId}`);
    return response.data;

  } catch (error) {
    console.error('Error fetching contract history:', error);
    throw error;
  }
};

/**
 * Generar informe de historial de contratos y cargos en PDF.
 * Endpoint: POST /employees/contract-history-pdf/
 * @param {Object} payload - Datos para el reporte { employee_document, date_from, date_to }
 * @returns {Promise<Blob>} Blob del PDF generado.
 */
export const generateContractHistoryReport = async (payload) => {
  try {
    const response = await apiMain.post(
      "/employees/contract-history-pdf/",
      payload,
      {
        responseType: "blob",
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error generating contract history report:", error);
    throw error;
  }
};
