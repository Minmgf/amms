import { apiMain } from "@/lib/axios";
// =============================================================================
// GESTIÓN DE EMPLEADOS
// =============================================================================

// Mock data for development
const mockEmployeeDetails = {
  id: 1,
  // Datos desagregados para el formulario de edición
  firstName: "María Fernanda",
  secondName: "",
  firstLastName: "González",
  secondLastName: "Pérez",
  identificationTypeId: 1,
  fullName: "María Fernanda González Pérez",
  documentType: "Cédula de Ciudadanía",
  document: "1034567890",
  gender: "Femenino",
  genderId: 2,
  birthDate: "1990-03-15",
  status: "Activo",
  position: "Operador",
  positionId: 3,
  department: "Operaciones",
  departmentId: 2,
  email: "maria.gonzalez@empresa.com",
  phone: "+57 300 456 7890",
  country: "Colombia",
  countryId: 1,
  state: "Antioquia",
  city: "Medellín",
  address: "Carrera 43A #14-25",
  contractCode: "CON-EXAMPLE-0001",
  contractId: 3,
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
 * Update employee information and register novelty (mock implementation)
 * @param {number} employeeId - Employee ID
 * @param {Object} payload - Datos del formulario y novedad
 * @returns {Promise<Object>} Updated employee details
 */
export const updateEmployee = async (employeeId, payload) => {
  try {
    // TODO: Replace with actual API call
    // const response = await apiMain.put(`/employees/${employeeId}`, payload);
    // return response.data;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...mockEmployeeDetails,
          ...(payload?.formData || {})
        });
      }, 800);
    });
  } catch (error) {
    console.error("Error updating employee:", error);
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
