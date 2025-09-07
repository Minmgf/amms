import { apiMain } from "@/lib/axios";
import axios from "axios";

// * Servicio para Types Categories
// * Usando el patrón similar a authService

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
 * Obtener una categoría específica por ID
 * @param {number|string} categoryId - ID de la categoría
 */
export const getTypeCategoryById = async (categoryId) => {
    try {
        console.log(`🔄 typeCategoriesService: Obteniendo categoría ID: ${categoryId}...`);

        // Nota: Este endpoint sería para obtener una categoría específica
        // Asumiendo que existe en tu API externa
        const { data } = await apiMain.get(`/api/types_categories/${categoryId}/`);

        console.log('✅ typeCategoriesService: Categoría obtenida exitosamente');
        return data;
    } catch (error) {
        console.error(`❌ typeCategoriesService: Error al obtener categoría ${categoryId}:`, error);
        throw error;
    }
};

/**
 * Crear una nueva categoría de tipo
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
 * Actualizar una categoría existente
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
        console.log('🔄 typeCategoriesService: Verificando estado del servicio...');

        // Intentamos obtener las categorías como health check
        const response = await getTypesCategories();

        console.log('✅ typeCategoriesService: Servicio funcionando correctamente');
        return {
            status: 'healthy',
            message: 'Servicio funcionando correctamente',
            data: response
        };
    } catch (error) {
        console.error('❌ typeCategoriesService: Servicio no disponible:', error);
        return {
            status: 'unhealthy',
            message: error.message,
            error: error
        };
    }
};
