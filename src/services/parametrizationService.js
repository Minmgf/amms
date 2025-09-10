import { apiMain } from "@/lib/axios";

// =============================================================================
// VISTA PRINCIPAL - PESTAÑA ESTADOS (HU-PAR-001 / HU-PAR-002)
// =============================================================================

// ===== CATEGORÍAS DE ESTADOS =====

// Crear categoría de estado
export const createStatuesCategory = async (payload) => {
    const { data } = await apiMain.post("statues_categories/", payload);
    return data;
};

// Listar categorías de estados - VISTA: Pestaña Estados
export const getStatuesCategories = async () => {
    const { data } = await apiMain.get("statues_categories/list/");
    return data;
};

// Actualizar categoría de estado
export const updateStatuesCategory = async (idStatusCategory, payload) => {
    const { data } = await apiMain.put(`statues_categories/${idStatusCategory}/`, payload);
    return data;
};

// =============================================================================
// VISTA PRINCIPAL - PESTAÑA TIPOS (HU-PAR-001 / HU-PAR-002)
// =============================================================================

// ===== CATEGORÍAS DE TIPOS =====

// Crear categoría de tipo
export const createTypesCategory = async (payload) => {
    const { data } = await apiMain.post("types_categories/", payload);
    return data;
};

// Listar categorías de tipos - VISTA: Pestaña Tipos
export const getTypesCategories = async () => {
    const { data } = await apiMain.get("types_categories/list/");
    return data;
};

// Actualizar categoría de tipo
export const updateTypesCategory = async (idTypeCategory, payload) => {
    const { data } = await apiMain.put(`types_categories/${idTypeCategory}/`, payload);
    return data;
};

// =============================================================================
// MODAL DETALLE DE CATEGORÍA - ESTADOS (HU-PAR-003 / HU-PAR-004)
// =============================================================================

// ===== GESTIÓN DE ESTADOS INDIVIDUALES =====

// Listar estados por categoría - VISTA: Modal "Detalles" de categoría de estados
export const getStatuesByCategory = async (idStatuesCategories) => {
    const { data } = await apiMain.get(`statues/list/${idStatuesCategories}/`);
    return data;
};

// Crear estado individual - VISTA: Modal "Agregar Parámetro" dentro de categoría de estados
export const createStatueItem = async (payload) => {
    const { data } = await apiMain.post("statues/", payload);
    return data;
};

// Actualizar estado individual - VISTA: Modal "Editar" estado
export const updateStatue = async (idStatues, payload) => {
    const { data } = await apiMain.put(`statues/${idStatues}/`, payload);
    return data;
};

// Listar estados activos por categoría - VISTA: Formularios que usan estados como dropdown
export const getActiveStatuesByCategory = async (idStatuesCategories) => {
    const { data } = await apiMain.get(`statues/list/active/${idStatuesCategories}/`);
    return data;
};

// Activar/desactivar estado - VISTA: Switch en modal de detalles de estado
export const toggleStatueStatus = async (idStatues) => {
    const { data } = await apiMain.patch(`statues/${idStatues}/toggle-status/`);
    return data;
};

// =============================================================================
// MODAL DETALLE DE CATEGORÍA - TIPOS (HU-PAR-003 / HU-PAR-004)
// =============================================================================

// ===== GESTIÓN DE TIPOS INDIVIDUALES =====

// Listar tipos por categoría - VISTA: Modal "Detalles" de categoría de tipos
export const getTypesByCategory = async (idTypesCategories) => {
    const { data } = await apiMain.get(`types/list/${idTypesCategories}/`);
    return data;
};

// Crear tipo individual - VISTA: Modal "Agregar Parámetro" dentro de categoría de tipos
export const createTypeItem = async (payload) => {
    const { data } = await apiMain.post("types/", payload);
    return data;
};

// Actualizar tipo individual - VISTA: Modal "Editar" tipo
export const updateTypeItem = async (idType, payload) => {
    const { data } = await apiMain.put(`types/${idType}/`, payload);
    return data;
};

// Listar tipos activos por categoría - VISTA: Formularios que usan tipos como dropdown
export const getActiveTypesByCategory = async (idTypesCategories) => {
    const { data } = await apiMain.get(`types/list/active/${idTypesCategories}/`);
    return data;
};

// Activar/desactivar tipo - VISTA: Switch en modal de detalles de tipo
export const toggleTypeStatus = async (idType) => {
    const { data } = await apiMain.patch(`types/${idType}/toggle-status/`);
    return data;
};

// =============================================================================
// VISTA PRINCIPAL - PESTAÑA UNIDADES (HU-PAR-001 / HU-PAR-002)
// =============================================================================

// ===== CATEGORÍAS DE UNIDADES =====

// Listar categorías de unidades - VISTA: Pestaña Units
export const getUnitsCategories = async () => {
    const { data } = await apiMain.get("units_categories/");
    return data;
};

// =============================================================================
// MODAL DETALLE DE CATEGORÍA - UNIDADES (HU-PAR-003 / HU-PAR-004)
// =============================================================================

// ===== GESTIÓN DE UNIDADES INDIVIDUALES =====

// Listar unidades por categoría - VISTA: Modal "Detalles" de categoría de unidades
export const getUnitsByCategory = async (idUnitCategory) => {
    const { data } = await apiMain.get(`units/list/${idUnitCategory}/`);
    return data;
};

// Crear unidad individual - VISTA: Modal "Agregar Parámetro" dentro de categoría de unidades
export const createUnits = async (payload) => {
    const { data } = await apiMain.post("units/", payload);
    return data;
};

// Listar tipos activos para Value/unit_type - VISTA: Select en modal de agregar/editar unidad
export const getActiveDataTypes = async () => {
    const { data } = await apiMain.get("types/list/active/1/");
    return data;
};

// Actualizar unidad individual - VISTA: Modal "Modificar Unidad"
export const updateUnit = async (idUnit, payload) => {
    const { data } = await apiMain.put(`units/${idUnit}/`, payload);
    return data;
};

// Activar/desactivar unidad - VISTA: Toggle en modal de detalles de unidad
export const toggleUnitStatus = async (idUnit) => {
    const { data } = await apiMain.patch(`units/${idUnit}/toggle-status/`);
    return data;
};