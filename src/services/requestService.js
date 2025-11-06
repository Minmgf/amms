import { apiMain, apiUsers } from "@/lib/axios";

// Obtener unidades de area
export const getAreaUnits = async () => {
    const { data } = await apiMain.get("/units/active/11/");
    return data;
}

// Obtener tipos de suelo
export const getSoilTypes = async () => {
    const { data } = await apiMain.get("/soil_types/");
    return data;
}

// Obtener tipos de texturas
export const getTextureTypes = async () => {
    const { data } = await apiMain.get("/textures/");
    return data;
}

// Obtener tipos de implementos
export const getImplementTypes = async () => {
    const { data } = await apiMain.get("/implementations/");
    return data;
}

// Obtener unidades de altitud
export const getAltitudeUnits = async () => {
    const { data } = await apiMain.get("/units/active/7/");
    return data;
}

// Obtener operarios activos
export const getActiveWorkers = async () => {
    const { data } = await apiUsers.get("/users/machinery_operators/active");
    return data;
}

// Obtener estados de pago
// Retorna: [{ id_statues: 16, name: "Pendiente" }, { id_statues: 17, name: "Parcial" }, { id_statues: 18, name: "Pagado" }]
export const getPaymentStatus = async () => {
    const { data } = await apiMain.get("/statues/list/6/");
    return data;
}

// Obtener metodos de pago
// Retorna: [{ code: "10", name: "Efectivo" }, { code: "42", name: "Consignación" }, ...]
export const getPaymentMethods = async () => {
    const { data } = await apiMain.get("/payment_methods/");
    return data;
}

// Obtener unidades de moneda activas
export const getCurrencyUnits = async () => {
    const { data } = await apiMain.get("/units/active/10/");
    return data;
}

// Crear preregistro
export const createPreRegister = async (payload) => {
    const { data } = await apiMain.post("/service_requests/create_pre_request/", payload);
    return data;
}

// Crear registro de solicitud
export const createRequest = async (payload) => {
    const { data } = await apiMain.post("/service_requests/create_request/", payload);
    return data;
}

// Buscar cliente por número de identificacion
export const getClientByIdentification = async (identification) => {
    const { data } = await apiMain.get(`/customers/search_by_document/?document_number=${identification}`);
    return data;
}

// Obtener detalles completos de una solicitud (HU-SOL-004)
export const getRequestDetails = async (requestId) => {
    const { data } = await apiMain.get(`/service_requests/${requestId}/details/`);
    return data;
}

// Cancelar una solicitud
export const cancelRequest = async (requestId, observations) => {
    const { data } = await apiMain.post(`/service_requests/${requestId}/cancel/`, {
        completion_cancellation_observations: observations
    });
    return data;
};

// Confirmar una solicitud (convertir presolicitud a solicitud pendiente)
export const confirmRequest = async (requestId, requestData) => {
    console.log('📤 Enviando confirmación - requestId:', requestId);
    console.log('📦 Payload:', requestData);
    try {
        const { data } = await apiMain.patch(`/service_requests/${requestId}/confirm/`, requestData);
        console.log('✅ Respuesta exitosa:', data);
        return data;
    } catch (error) {
        console.error('❌ Error en confirmRequest:', error);
        console.error('📋 Error response:', error.response);
        throw error;
    }
};

// Completar una solicitud (cambiar estado de En proceso a Finalizada)
export const completeRequest = async (requestId, requestData) => {
    console.log('📤 Completando solicitud - requestId:', requestId);

    // Soportar formato antiguo (solo string) y nuevo formato (objeto)
    let payload;
    if (typeof requestData === 'string') {
        // Formato antiguo: solo observaciones
        payload = {
            completion_cancellation_observations: requestData
        };
    } else {
        // Formato nuevo: objeto con observaciones y fechas
        payload = {
            completion_cancellation_observations: requestData.observations,
            actual_start_date: requestData.startDate,
            actual_end_date: requestData.endDate
        };
    }

    console.log('📦 Payload:', payload);

    try {
        const { data } = await apiMain.post(`/service_requests/${requestId}/complete/`, payload);
        console.log('✅ Solicitud completada exitosamente:', data);
        return data;
    } catch (error) {
        console.error('❌ Error en completeRequest:', error);
        console.error('📋 Error response:', error.response);
        throw error;
    }
};

// Actualizar una solicitud existente (HU-SOL-005)
export const updateRequest = async (requestId, requestData) => {
    console.log('📤 Actualizando solicitud - requestId:', requestId);
    console.log('📦 Payload:', requestData);
    try {
        const { data } = await apiMain.patch(`/service_requests/${requestId}/update_request/`, requestData);
        console.log('✅ Solicitud actualizada exitosamente:', data);
        return data;
    } catch (error) {
        console.error('❌ Error en updateRequest:', error);
        console.error('📋 Error response:', error.response);
        throw error;
    }
};

//Crear borrador de factura
export const createInvoice = async (payload) => {
    const { data } = await apiMain.post("/invoices/create-draft/", payload);
    return data;
}

//Actualizar borrador de factura
export const updateInvoice = async (invoiceId, payload) => {
    const { data } = await apiMain.put(`/invoices/${invoiceId}/update-draft/`, payload);
    return data;
};

export const getInvoiceDetail = async (invoiceId) => {
    const { data } = await apiMain.get(`/invoices/${invoiceId}/`);
    return data;
}

//Buscar servicio por código del servivio
export const searchServiceByCode = async (serviceCode) => {
    const { data } = await apiMain.get(`/services/search/`, {
        params: { query: serviceCode }
    });
    return data;
};

//Listar Servicios activos
export const getServicesActive = async () => {
    const { data } = await apiMain.get("/services/active/");
    return data;
}

//Guardar linea de factura
export const saveInvoiceLine = async (invoiceId, payload) => {
    const { data } = await apiMain.post(`/invoices/${invoiceId}/lines/`, payload);
    return data;
}

//Obtener lineas de factura
export const getInvoiceLines = async (invoiceId) => {
    const { data } = await apiMain.get(`/invoice-lines/`, {
        params: { invoice: invoiceId }
    });
    return data;
};

//Eliminar linea de factura
export const deleteInvoiceLine = async (invoiceId, lineId) => {
    try {
        const { data } = await apiMain.delete(`/invoices/${invoiceId}/lines/${lineId}/`);
        return data;
    } catch (error) {
        throw error;
    }
};

//Actualizar linea de factura
export const updateInvoiceLine = async (invoiceId, lineId, payload) => {
    try {
        const { data } = await apiMain.patch(`/invoices/${invoiceId}/lines/${lineId}/`, payload);
        return data;
    } catch (error) {
        throw error;
    }
};

//Enviar factura para generar y validar
export const generateInvoice = async (invoiceId) => {
    const { data } = await apiMain.post(`/invoices/${invoiceId}/generate_fe/`);
    return data;
}

//Descargar factura
export const downloadInvoicePDF = async (invoiceId) => {
    const response = await apiMain.get(`/invoices/${invoiceId}/download_pdf/`, {
        responseType: 'blob'
    });
    return response.data;
};

// Obtener listado de solicitudes para monitoreo (HU-MON-001)
// Retorna solicitudes en estado Pendiente (20), En proceso (21) y Finalizada (22)
export const getRequestMonitoringList = async () => {
    const { data } = await apiMain.get("/service_requests/monitoring-list/");
    return data;
};




