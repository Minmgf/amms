import { apiMain } from "@/lib/axios";

// ===== CATEGORÍAS DE ESTADOS =====

// Crear categoría de estado
export const createStatuesCategory = async (payload) => {
    const { data } = await apiMain.post("statues_categories/", payload);
    return data;
};

// Listar categorías de estados
export const getStatues = async () => {
    const { data } = await apiMain.get(`statues_categories/list/`);
    return data;
};

// Actualizar categoría de estado
export const updateStatuesCategory = async (idStatusCategory, payload) => {
    const { data } = await apiMain.put(`statues_categories/${idStatusCategory}/`, payload);
    return data;
};

// ===== CATEGORÍAS DE TIPOS =====

// Crear categoría de tipo
export const createType = async (payload) => {
    const { data } = await apiMain.post("types_categories/", payload);
    return data;
};

// Listar categorías de tipos
export const getType = async () => {
    const { data } = await apiMain.get(`types_categories/list/`);
    return data;
};

// Actualizar categoría de tipo
export const updateType = async (idType, payload) => {
    const { data } = await apiMain.put(`types_categories/${idType}/`, payload);
    return data;
};

// ===== GESTIÓN DE ESTADOS =====

// Listar estados por categoría
export const getStatuesByCategory = async (idStatuesCategories) => {
    const { data } = await apiMain.get(`statues/list/${idStatuesCategories}/`);
    return data;
};

// Actualizar estado
export const updateStatue = async (idStatues, payload) => {
    const { data } = await apiMain.put(`statues/${idStatues}/`, payload);
    return data;
};

// ===== GESTIÓN DE TIPOS =====

// Crear tipo
export const createTypeItem = async (payload) => {
    const { data } = await apiMain.post("types/", payload);
    return data;
};

// Listar tipos por categoría
export const getTypesByCategory = async (idTypesCategories) => {
    const { data } = await apiMain.get(`types/list/${idTypesCategories}/`);
    return data;
};

// Actualizar tipo
export const updateTypeItem = async (idType, payload) => {
    const { data } = await apiMain.put(`types/${idType}/`, payload);
    return data;
};

// Listar tipos activos por categoría
export const getActiveTypesByCategory = async (idTypesCategories) => {
    const { data } = await apiMain.get(`types/list/active/${idTypesCategories}/`);
    return data;
};

// Activar/desactivar tipo
export const toggleTypeStatus = async (idType) => {
    const { data } = await apiMain.patch(`types/${idType}/toggle-status/`);
    return data;
};