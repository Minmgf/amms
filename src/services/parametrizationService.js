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

//Marcas y modelos
export const getBrandCategories = async () => {
  const { data } = await apiMain.get("/brands_categories/list/");
  return data;
};

export const getBrands = async (categoryId) => {
  const { data } = await apiMain.get(`/brands/list/${categoryId}/`);
  return data;
};

export const getModelsByBrand = async (brandId) => {
  const response = await apiMain.get(`/models/list/${brandId}/`);
  return response.data.data; // 👈 el backend devuelve { message, data }
};

export const createBrand = async (payload) => {
  const { data } = await apiMain.post("/brands/", payload);
  return data;
};

export const editBrand = async (payload, brandId) => {
  const { data } = await apiMain.put(`/brands/${brandId}/`, payload);
  return data;
};

export const editModel = async (payload, modelId) => {
  const { data } = await apiMain.put(`/models/${modelId}/`, payload);
  return data;
};

export const createModel = async (payload) => {
  const { data } = await apiMain.post("/models/", payload);
  return data;
};

export const toggleStatusBrand = async (brandId) => {
  const { data } = await apiMain.patch(`/brands/${brandId}/toggle-status/`);
  return data;
};

export const toggleStatusModel = async (modelId) => {
  const { data } = await apiMain.patch(`/models/${modelId}/toggle-status/`);
  return data;
};