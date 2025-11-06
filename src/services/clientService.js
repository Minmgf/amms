import { apiMain, apiUsers } from "@/lib/axios";

//Obtener lista de clientes
export const getClientsList = async (token) => {
    const { data } = await apiMain.get(`/customers/`);
    return data;
};

//Obtener tipos de persona
export const getPersonTypes = async () => {
    const { data } = await apiMain.get("/person_types/");
    return data;
};

//Obtener regimen tributario
export const getTaxRegimens = async () => {
    const { data } = await apiMain.get("/tax_regimes/");
    return data;
};

//Verificar si el usuario ya existe
export const checkUserExists = async (documentNumber) => {
    const { data } = await apiUsers.get(`/users/by-document/${documentNumber}`);
    return data;
};

//Crear un nuevo cliente
export const createClient = async (payload) => {
    const { data } = await apiMain.post("customers/create_customer/", payload);
    return data;
};

// Obtener detalle del cliente (HU-CLI-003)
export const getClientDetail = async (clientId) => {
    try {
        const { data } = await apiMain.get(`/customers/${clientId}/detail/`);
        return data; // Mantener la respuesta tal como el backend la entrega ({success, message, data})
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || error?.message || "Error al obtener el detalle del cliente"
        };
    }
};

// Obtener historial de solicitudes del cliente (HU-CLI-003)
export const getClientRequestHistory = async (clientId) => {
    try {
        const { data } = await apiMain.get(`/service_requests/list-by-customer/`, {
            params: { customer_id: clientId }
        });
        
        // El endpoint devuelve { success: true, results: [...] }
        if (data.success && Array.isArray(data.results)) {
            return { success: true, data: data.results };
        }
        
        // Por si devuelve directamente un array
        if (Array.isArray(data)) {
            return { success: true, data };
        }
        
        return data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || error?.message || "Error al obtener el historial de solicitudes",
            data: []
        };
    }
};

// Obtener estados del cliente
export const getClientStatuses = async () => {
    const { data } = await apiMain.get("/statues/list/1/");
    return { data };
};

// Obtener estados de solicitudes
export const getRequestStatuses = async () => {
    const { data } = await apiMain.get("/statues/list/7/");
    return { data };
};

// Obtener estados de facturación
export const getBillingStatuses = async () => {
    const { data } = await apiMain.get("/statues/list/6/");
    return { data };
};

// Actualizar un cliente existente
export const updateClient = async (clientId, payload) => {
    const { data } = await apiMain.patch(`/customers/${clientId}/update_customer/`, payload);
    return data;
};

// Actualizar un usuario
export const updateUser = async (userId, payload) => {
    const { data } = await apiUsers.put(`/users/${userId}/profile`, payload);
    return data;
};

// Eliminar cliente (HU-CLI-004)
export const deleteClient = async (clientId) => {
    try {
        const { data } = await apiMain.delete(`/customers/${clientId}/`);
        return data;
    } catch (error) {
        throw error;
    }
};

// Alternar estado del cliente (activar/desactivar) (HU-CLI-004)
export const toggleClientStatus = async (clientId) => {
    try {
        const { data } = await apiMain.patch(`/customers/${clientId}/toggle-status/`);
        return data;
    } catch (error) {
        throw error;
    }
};

// Descargar factura en formato PDF (HU-CLI-003)
// Permiso requerido: 161 (request.download_invoice)
export const downloadInvoicePDF = async (invoiceId) => {
    try {
        const response = await apiMain.get(`/invoices/${invoiceId}/download_pdf/`, {
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        console.error('Error descargando factura:', error);
        throw error;
    }
};
