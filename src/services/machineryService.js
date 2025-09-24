import { apiMain } from "@/lib/axios";

// =============================================================================
// FORMULARIO MODAL MULTIPASOS
// =============================================================================

// ===== PASO 1 =====

// traer maquinarias activas
export const getActiveMachinery = async () => {
    const { data } = await apiMain.get("/types/list/active/2/");
    return data;
};

// traer maquinas activas
export const getActiveMachine = async () => {
    const { data } = await apiMain.get("/types/list/active/3/");
    return data;
};

// traer marcas de maquinarias activas
export const getMachineryBrands = async () => {
    const { data } = await apiMain.get("/brands/list/active/1/");
    return data;
};

// traer modelos de marcas de maquinarias activas
export const getModelsByBrandId = async (brandId) => {
    const { data } = await apiMain.get(`/models/list/active/${brandId}/`);
    return data;
};

// iniciar formulario y registrar datos generales
export const registerGeneralData = async (formData) => {
    const { data } = await apiMain.post("/machinery/create-general-sheet/", formData,
        {headers: {"Content-Type": "multipart/form-data"}}
    );
    return data;
};

// ===== PASO 2 - FICHA DE TRACKER =====

/**
 * Crear ficha técnica de seguimiento de maquinaria (Step 2)
 * @param {Object} payload - Datos de la ficha técnica
 * @param {number} payload.id_machinery - ID de la maquinaria obtenido del Step 1
 * @param {string} payload.terminal_serial_number - Número de serie del terminal (requerido)
 * @param {string} payload.gps_serial_number - Número de serie GPS (opcional)
 * @param {string} payload.chassis_number - Número de chasis (opcional)
 * @param {string} payload.engine_number - Número de motor (opcional)
 * @param {number} payload.responsible_user - Usuario responsable (requerido)
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const createMachineryTracker = async (payload) => {
    try {
        console.log('🚀 [POST] Creating machinery tracker with payload:', payload);
        console.log('📡 Endpoint: POST /machinery-tracker/create/');
        
        // Validaciones básicas del lado cliente
        if (!payload.id_machinery) {
            throw new Error('ID de maquinaria es requerido (debe venir del Step 1)');
        }
        
        if (!payload.terminal_serial_number || payload.terminal_serial_number.trim() === '') {
            throw new Error('Número de serie del terminal es requerido');
        }
        
        if (!payload.responsible_user) {
            throw new Error('Usuario responsable es requerido');
        }
        
        // Hacer la petición POST al endpoint
        const { data } = await apiMain.post("/machinery-tracker/create/", payload);
        
        console.log('✅ [POST] Machinery tracker created successfully:', data);
        console.log('📋 Expected response format:', {
            success: data.success,
            message: data.message
        });
        
        return data;
        
    } catch (error) {
        console.error('❌ [POST] Error creating machinery tracker:', error);
        
        // Manejar errores del servidor
        if (error.response?.data) {
            const errorData = error.response.data;
            console.error('🔍 Server error response:', errorData);
            throw new Error(errorData.message || 'Error al crear la ficha técnica de seguimiento');
        }
        
        // Re-lanzar errores de validación del cliente
        throw error;
    }
};