import { apiMain } from "@/lib/axios";
import axios from "axios";

// Instancia de axios para rutas internas (sin baseURL externo)
const apiInternal = axios.create({
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Agregar interceptor para el token
apiInternal.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ===== CATEGORÍAS DE ESTADOS =====

/**
 * Crear categoría de estado
 * @param {Object} payload - Datos de la nueva categoría de estado
 */
export const createStatuesCategory = async (payload) => {
    try {
        console.log('🔄 statuesCategoriesService: Creando nueva categoría de estado...');
        console.log('📝 statuesCategoriesService: Datos:', payload);
        const { data } = await apiMain.post("statues_categories/", payload);
        console.log('✅ statuesCategoriesService: Categoría creada exitosamente');
        return data;
    } catch (error) {
        console.error('❌ statuesCategoriesService: Error al crear categoría:', error);
        throw error;
    }
};

/**
 * Listar categorías de estados
 */
export const getStatues = async () => {
    try {
        console.log('🔄 statuesCategoriesService: Obteniendo categorías de estados...');
        const { data } = await apiMain.get(`statues_categories/list/`);
        console.log('✅ statuesCategoriesService: Categorías obtenidas exitosamente');
        console.log('📊 statuesCategoriesService: Cantidad de registros:', Array.isArray(data) ? data.length : 'No es array');
        return data;
    } catch (error) {
        console.error('❌ statuesCategoriesService: Error al obtener categorías:', error);
        throw error;
    }
};

/**
 * Actualizar categoría de estado
 * @param {number|string} idStatusCategory - ID de la categoría de estado
 * @param {Object} payload - Datos actualizados
 */
export const updateStatuesCategory = async (idStatusCategory, payload) => {
    try {
        console.log(`🔄 statuesCategoriesService: Actualizando categoría ID: ${idStatusCategory}...`);
        console.log('📝 statuesCategoriesService: Datos:', payload);
        const { data } = await apiMain.put(`statues_categories/${idStatusCategory}/`, payload);
        console.log('✅ statuesCategoriesService: Categoría actualizada exitosamente');
        return data;
    } catch (error) {
        console.error(`❌ statuesCategoriesService: Error al actualizar categoría ${idStatusCategory}:`, error);
        throw error;
    }
};

// ===== CATEGORÍAS DE TIPOS =====

/**
 * Crear categoría de tipo
 * @param {Object} payload - Datos de la nueva categoría de tipo
 */
export const createType = async (payload) => {
    try {
        console.log('🔄 typeCategoriesService: Creando nueva categoría de tipo...');
        console.log('📝 typeCategoriesService: Datos:', payload);
        const { data } = await apiMain.post("types_categories/", payload);
        console.log('✅ typeCategoriesService: Categoría creada exitosamente');
        return data;
    } catch (error) {
        console.error('❌ typeCategoriesService: Error al crear categoría:', error);
        throw error;
    }
};

/**
 * Listar categorías de tipos
 */
export const getType = async () => {
    try {
        console.log('🔄 typeCategoriesService: Obteniendo categorías de tipos...');
        const { data } = await apiMain.get(`types_categories/list`);
        console.log('✅ typeCategoriesService: Categorías obtenidas exitosamente');
        console.log('📊 typeCategoriesService: Cantidad de registros:', Array.isArray(data) ? data.length : 'No es array');
        return data;
    } catch (error) {
        console.error('❌ typeCategoriesService: Error al obtener categorías:', error);
        throw error;
    }
};

/**
 * Obtener todas las categorías de tipos desde la API externa
 * Usa el API route como proxy para evitar problemas de CORS
 */
export const getTypesCategories = async () => {
    try {
        console.log('🔄 typeCategoriesService: Obteniendo tipos de categorías...');
        // Usamos axios interno para rutas locales (evita baseURL externo)
        const { data } = await apiInternal.get('/sigma/api/types_categories/list');
        console.log('✅ typeCategoriesService: Datos obtenidos exitosamente');
        console.log('📊 typeCategoriesService: Cantidad de registros:', Array.isArray(data) ? data.length : 'No es array');
        return data;
    } catch (error) {
        console.error('❌ typeCategoriesService: Error al obtener categorías:', error);
        console.error('📨 typeCategoriesService: Response:', error.response?.data);
        console.error('⚠️ typeCategoriesService: Status:', error.response?.status);
        throw error;
    }
};

/**
 * Actualizar categoría de tipo
 * @param {number|string} idType - ID del tipo
 * @param {Object} payload - Datos actualizados
 */
export const updateType = async (idType, payload) => {
    try {
        console.log(`🔄 typeCategoriesService: Actualizando tipo ID: ${idType}...`);
        console.log('📝 typeCategoriesService: Datos:', payload);
        const { data } = await apiMain.put(`types_categories/${idType}/`, payload);
        console.log('✅ typeCategoriesService: Tipo actualizado exitosamente');
        return data;
    } catch (error) {
        console.error(`❌ typeCategoriesService: Error al actualizar tipo ${idType}:`, error);
        throw error;
    }
};

// ===== GESTIÓN DE ESTADOS =====

/**
 * Listar estados por categoría
 * @param {number|string} idStatuesCategories - ID de la categoría de estados
 */
export const getStatuesByCategory = async (idStatuesCategories) => {
    try {
        console.log(`🔄 statuesService: Obteniendo estados para categoría ID: ${idStatuesCategories}...`);
        const { data } = await apiMain.get(`statues/list/${idStatuesCategories}/`);
        console.log('✅ statuesService: Estados obtenidos exitosamente');
        console.log('📊 statuesService: Cantidad de registros:', Array.isArray(data) ? data.length : 'No es array');
        return data;
    } catch (error) {
        console.error(`❌ statuesService: Error al obtener estados para categoría ${idStatuesCategories}:`, error);
        throw error;
    }
};

/**
 * Actualizar estado
 * @param {number|string} idStatues - ID del estado
 * @param {Object} payload - Datos actualizados
 */
export const updateStatue = async (idStatues, payload) => {
    try {
        console.log(`🔄 statuesService: Actualizando estado ID: ${idStatues}...`);
        console.log('📝 statuesService: Datos:', payload);
        const { data } = await apiMain.put(`statues/${idStatues}/`, payload);
        console.log('✅ statuesService: Estado actualizado exitosamente');
        return data;
    } catch (error) {
        console.error(`❌ statuesService: Error al actualizar estado ${idStatues}:`, error);
        throw error;
    }
};

// ===== GESTIÓN DE TIPOS =====

/**
 * Crear tipo
 * @param {Object} payload - Datos del nuevo tipo
 */
export const createTypeItem = async (payload) => {
    try {
        console.log('🔄 typesService: Creando nuevo tipo...');
        console.log('📝 typesService: Datos:', payload);
        const { data } = await apiMain.post("types/", payload);
        console.log('✅ typesService: Tipo creado exitosamente');
        return data;
    } catch (error) {
        console.error('❌ typesService: Error al crear tipo:', error);
        throw error;
    }
};

/**
 * Listar tipos por categoría
 * @param {number|string} idTypesCategories - ID de la categoría de tipos
 */
export const getTypesByCategory = async (idTypesCategories) => {
    try {
        console.log(`🔄 typesService: Obteniendo tipos para categoría ID: ${idTypesCategories}...`);
        const { data } = await apiMain.get(`types/list/${idTypesCategories}/`);
        console.log('✅ typesService: Tipos obtenidos exitosamente');
        console.log('📊 typesService: Cantidad de registros:', Array.isArray(data) ? data.length : 'No es array');
        return data;
    } catch (error) {
        console.error(`❌ typesService: Error al obtener tipos para categoría ${idTypesCategories}:`, error);
        throw error;
    }
};

/**
 * Actualizar tipo
 * @param {number|string} idType - ID del tipo
 * @param {Object} payload - Datos actualizados
 */
export const updateTypeItem = async (idType, payload) => {
    try {
        console.log(`🔄 typesService: Actualizando tipo ID: ${idType}...`);
        console.log('📝 typesService: Datos:', payload);
        const { data } = await apiMain.put(`types/${idType}/`, payload);
        console.log('✅ typesService: Tipo actualizado exitosamente');
        return data;
    } catch (error) {
        console.error(`❌ typesService: Error al actualizar tipo ${idType}:`, error);
        throw error;
    }
};

/**
 * Listar tipos activos por categoría
 * @param {number|string} idTypesCategories - ID de la categoría de tipos
 */
export const getActiveTypesByCategory = async (idTypesCategories) => {
    try {
        console.log(`🔄 typesService: Obteniendo tipos activos para categoría ID: ${idTypesCategories}...`);
        const { data } = await apiMain.get(`types/list/active/${idTypesCategories}/`);
        console.log('✅ typesService: Tipos activos obtenidos exitosamente');
        console.log('📊 typesService: Cantidad de registros:', Array.isArray(data) ? data.length : 'No es array');
        return data;
    } catch (error) {
        console.error(`❌ typesService: Error al obtener tipos activos para categoría ${idTypesCategories}:`, error);
        throw error;
    }
};

/**
 * Activar/desactivar tipo
 * @param {number|string} idType - ID del tipo
 */
export const toggleTypeStatus = async (idType) => {
    try {
        console.log(`🔄 typesService: Cambiando estado del tipo ID: ${idType}...`);
        const { data } = await apiMain.patch(`types/${idType}/toggle-status/`);
        console.log('✅ typesService: Estado del tipo cambiado exitosamente');
        return data;
    } catch (error) {
        console.error(`❌ typesService: Error al cambiar estado del tipo ${idType}:`, error);
        throw error;
    }
};

// ===== FUNCIONES ADICIONALES (del servicio original) =====

/**
 * Obtener una categoría específica por ID
 * @param {number|string} categoryId - ID de la categoría
 */
export const getTypeCategoryById = async (categoryId) => {
    try {
        console.log(`🔄 typeCategoriesService: Obteniendo categoría ID: ${categoryId}...`);
        const { data } = await apiMain.get(`/api/types_categories/${categoryId}/`);
        console.log('✅ typeCategoriesService: Categoría obtenida exitosamente');
        return data;
    } catch (error) {
        console.error(`❌ typeCategoriesService: Error al obtener categoría ${categoryId}:`, error);
        throw error;
    }
};

/**
 * Crear una nueva categoría de tipo (función alternativa)
 * @param {Object} categoryData - Datos de la nueva categoría
 */
export const createTypeCategory = async (categoryData) => {
    try {
        console.log('🔄 typeCategoriesService: Creando nueva categoría...');
        console.log('📝 typeCategoriesService: Datos:', categoryData);
        const { data } = await apiMain.post('/api/types_categories/', categoryData);
        console.log('✅ typeCategoriesService: Categoría creada exitosamente');
        return data;
    } catch (error) {
        console.error('❌ typeCategoriesService: Error al crear categoría:', error);
        throw error;
    }
};

/**
 * Actualizar una categoría existente (función alternativa)
 * @param {number|string} categoryId - ID de la categoría
 * @param {Object} categoryData - Datos actualizados
 */
export const updateTypeCategory = async (categoryId, categoryData) => {
    try {
        console.log(`🔄 typeCategoriesService: Actualizando categoría ID: ${categoryId}...`);
        console.log('📝 typeCategoriesService: Datos:', categoryData);
        const { data } = await apiMain.put(`/api/types_categories/${categoryId}/`, categoryData);
        console.log('✅ typeCategoriesService: Categoría actualizada exitosamente');
        return data;
    } catch (error) {
        console.error(`❌ typeCategoriesService: Error al actualizar categoría ${categoryId}:`, error);
        throw error;
    }
};

/**
 * Eliminar una categoría
 * @param {number|string} categoryId - ID de la categoría
 */
export const deleteTypeCategory = async (categoryId) => {
    try {
        console.log(`🔄 typeCategoriesService: Eliminando categoría ID: ${categoryId}...`);
        const { data } = await apiMain.delete(`/api/types_categories/${categoryId}/`);
        console.log('✅ typeCategoriesService: Categoría eliminada exitosamente');
        return data;
    } catch (error) {
        console.error(`❌ typeCategoriesService: Error al eliminar categoría ${categoryId}:`, error);
        throw error;
    }
};

/**
 * Verificar conexión con el servicio
 * Útil para debugging y health checks
 */
export const checkServiceHealth = async () => {
    try {
        console.log('🔄 servicioCompleto: Verificando estado del servicio...');
        // Intentamos obtener las categorías como health check
        const response = await getTypesCategories();
        console.log('✅ servicioCompleto: Servicio funcionando correctamente');
        return {
            status: 'healthy',
            message: 'Servicio funcionando correctamente',
            data: response
        };
    } catch (error) {
        console.error('❌ servicioCompleto: Servicio no disponible:', error);
        return {
            status: 'unhealthy',
            message: error.message,
            error: error
        };
    }
};


//DEPARTAMENTOS Y CARGOS DE TRABAJO

//Listar Departamentos
export const getDepartments = async () => {
    const { data } = await apiMain.get(`employee_departments/list/`);
    return data;
};

//Crear nuevo departamento
export const createDepartment = async (payload) => {
    const { data } = await apiMain.post("employee_departments/", payload);
    return data;
};

//Obtener cargos por departamento
export const getChargesDepartments = async (id_employee_deparment) => {
    const { data } = await apiMain.get(`employee_charges/list/${id_employee_deparment}/`);
    return data;
};

//Activar o desactivar departamento
export const changeDepartmentStatus = async (id_employee_department) => {
    const { data } = await apiMain.patch(`employee_departments/${id_employee_department}/toggle-status/`);
    return data;
};

//Actualizar departamento
export const updateDepartment = async (id_employee_department ,payload) => {
    const { data } = await apiMain.put(`employee_departments/${id_employee_department}/`, payload);
    return data;
};

//Crear nuevo puesto de trabajo
export const createJob = async (payload) => {
    const { data } = await apiMain.post("employee_charges/", payload);
    return data;
};

//Actualizar puesto de trabajo
export const updateJob = async (id_charge ,payload) => {
    const { data } = await apiMain.put(`employee_charges/${id_charge}/`, payload);
    return data;
};

//Activar o desactivar puesto de trabajo
export const changeJobStatus = async (id_charge) => {
    const { data } = await apiMain.patch(`employee_charges/${id_charge}/toggle-status/`);
    return data;
};







