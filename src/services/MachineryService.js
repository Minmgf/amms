import Cookies from "js-cookie";
import { apiMain } from "@/lib/axios";

/**
 * Obtiene la lista completa de maquinaria
 * @returns {Promise} - Promesa con la respuesta de la API
 */
export const getMachineryList = async () => {
    try {
        // console.log('Base URL configurada:', process.env.NEXT_PUBLIC_BASE_URL_MAIN);
        // console.log('URL completa sería:', `${process.env.NEXT_PUBLIC_BASE_URL_MAIN}/machinery/list/`);
        
        const response = await apiMain.get('/machinery/list/');
        
        console.log('Respuesta completa de la API:', response);
        console.log('Status de la respuesta:', response.status);
        console.log('Data de la respuesta:', response.data);
        
        return {
            success: true,
            data: response.data,
            message: 'Maquinaria obtenida exitosamente'
        };
    } catch (error) {
        console.error('Error completo:', error);
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response?.data);
        console.error('Error response status:', error.response?.status);
        
        return {
            success: false,
            data: null,
            message: error.response?.data?.message || error.message || 'Error al obtener la lista de maquinaria',
            error: error.response?.data || error.message
        };
    }
};
