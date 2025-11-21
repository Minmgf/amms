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
    return response.data;
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
    return response.data;
  } catch (error) {
    console.error('Error fetching positions:', error);
    throw error;
  }
};

/**
 * Get list of active established contracts for a specific position
 * @param {number} positionId - Position/charge ID
 * @returns {Promise<Array>} List of established contracts
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

// =============================================================================
// Mock data for development
// =============================================================================
const mockEmployeeDetails = {
  id: 1,
  fullName: "María Fernanda González Pérez",
  documentType: "Cédula de Ciudadanía",
  document: "1034567890",
  gender: "Female",
  birthDate: "1990-03-15",
  status: "Active",
  position: "Operator",
  department: "Operative team",
  email: "maria.gonzalez@empresa.com",
  phone: "+57 300 456 7890",
  country: "Colombia",
  state: "Antioquia",
  city: "Medellín",
  address: "Carrera 43A #14-25",
  contractCode: "CON-OPERATOR-0789",
  contract: {
    id: 1,
    code: "CON-2025-0003-00",
    status: "Active"
  }
};

const mockEmployeeHistory = [
  {
    date: "2025-01-01T10:30:00",
    user: "admin",
    description: "Employee creation",
    action: "creation"
  },
  {
    date: "2025-01-15T14:20:00",
    user: "admin",
    description: "Initial employee registration in the system",
    action: "creation"
  },
  {
    date: "2025-01-30T09:15:00",
    user: "admin",
    description: "Data update",
    action: "update"
  },
  {
    date: "2025-02-01T16:45:00",
    user: "admin",
    description: "Update contact information",
    action: "update"
  },
  {
    date: "2025-02-15T11:30:00",
    user: "admin",
    description: "Department change",
    action: "contract_change"
  },
  {
    date: "2025-03-01T08:00:00",
    user: "admin",
    description: "Transfer of Development to Technology",
    action: "contract_change"
  }
];

const mockContractDetails = {
  id: 1,
  code: "CON-2025-0003-00",
  status: "Active",
  department: "Example",
  contractType: "Example",
  position: "Example",
  startDate: "2025-01-01",
  endDate: "2025-12-31",
  paymentFrequency: "Payment date",
  indefinite: "Indefinite",
  monthly: "30th of each month",
  workingDay: "Work Monday",
  fullTime: "Full Time",
  description: "Development and maintenance of web applications using modern technologies",
  baseModality: "Example",
  currency: "COP",
  monthlySalary: 3500000,
  vacationAccumulation: "Vacation accumulation",
  basePeriod: "Vacation days",
  threeMonths: "3 months",
  fifteenDays: "15 days",
  liquidationDate: "2025-12-31",
  baseAvailability: "Payment period",
  hoursPerWeek: "40 hours/week",
  weekly: "30 days",
  deductions: [
    {
      name: "Health",
      type: "Percentage",
      value: "4%",
      application: "Monthly",
      validity: "01/01/2025 - Indefinite",
      description: "Example",
      quantity: 1
    },
    {
      name: "Pension",
      type: "Percentage",
      value: "4%",
      application: "Monthly",
      validity: "01/01/2025 - Indefinite",
      description: "Example",
      quantity: 1
    }
  ],
  increments: [
    {
      name: "Productivity Bonus",
      type: "Fixed",
      value: "$500,000",
      application: "Monthly",
      validity: "01/01/2025 - 31/12/2025",
      description: "Example",
      quantity: 1
    }
  ],
  actionsHistory: [
    {
      code: "CON-2025-0003-00",
      type: "Creation",
      date: "2025-01-01T08:00:00",
      user: "admin"
    }
  ]
};

const mockContractHistory = [
  {
    id: 1,
    code: "CON-2025-0003-00",
    status: "Active",
    client: "EMPRESA - EMPRESA",
    createdDate: "2025-01-01"
  },
  {
    id: 2,
    code: "CON-2025-0002-01",
    status: "Finished",
    client: "EMPRESA - EMPRESA",
    createdDate: "2024-06-01"
  },
  {
    id: 3,
    code: "CON-2025-0001-04",
    status: "Finished",
    client: "EMPRESA - EMPRESA",
    createdDate: "2024-01-01"
  }
];

/**
 * Get detailed information of an employee
 * @param {number} employeeId - Employee ID
 * @returns {Promise<Object>} Employee details
 */
export const getEmployeeDetails = async (employeeId) => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/employees/${employeeId}`);
    // if (!response.ok) throw new Error('Failed to fetch employee details');
    // return await response.json();
    
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockEmployeeDetails);
      }, 500);
    });
  } catch (error) {
    console.error('Error fetching employee details:', error);
    throw error;
  }
};

/**
 * Get employee novelty history
 * @param {number} employeeId - Employee ID
 * @param {string} startDate - Start date filter (optional)
 * @param {string} endDate - End date filter (optional)
 * @returns {Promise<Array>} Employee history
 */
export const getEmployeeHistory = async (employeeId, startDate = null, endDate = null) => {
  try {
    // TODO: Replace with actual API call
    // const params = new URLSearchParams();
    // if (startDate) params.append('startDate', startDate);
    // if (endDate) params.append('endDate', endDate);
    // const response = await fetch(`/api/employees/${employeeId}/history?${params}`);
    // if (!response.ok) throw new Error('Failed to fetch employee history');
    // return await response.json();
    
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        let history = [...mockEmployeeHistory];
        
        // Apply date filters if provided
        if (startDate || endDate) {
          history = history.filter(item => {
            const itemDate = new Date(item.date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            
            if (start && itemDate < start) return false;
            if (end && itemDate > end) return false;
            return true;
          });
        }
        
        resolve(history);
      }, 300);
    });
  } catch (error) {
    console.error('Error fetching employee history:', error);
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
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/contracts/${contractId}`);
    // if (!response.ok) throw new Error('Failed to fetch contract details');
    // return await response.json();
    
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockContractDetails);
      }, 500);
    });
  } catch (error) {
    console.error('Error fetching contract details:', error);
    throw error;
  }
};

/**
 * Get contract history for an employee
 * @param {number} contractId - Contract ID
 * @returns {Promise<Array>} Contract history
 */
export const getContractHistory = async (contractId) => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/contracts/${contractId}/history`);
    // if (!response.ok) throw new Error('Failed to fetch contract history');
    // return await response.json();
    
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockContractHistory);
      }, 300);
    });
  } catch (error) {
    console.error('Error fetching contract history:', error);
    throw error;
  }
};
