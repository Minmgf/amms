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

// ===== PASO 4 =====

// traer estados de uso
export const getUseStates = async () => {
    const { data } = await apiMain.get("/statues/list/3/");
    return data;
};

// traer unidades de distancia
export const getDistanceUnits = async () => {
    const { data } = await apiMain.get("/units/active/7/");
    return data;
};

// traer tipos de tenencia
export const getTenureTypes = async () => {
    const { data } = await apiMain.get("/types/list/active/11/");
    return data;
};

// registrar información de uso
export const registerUsageInfo = async (formData) => {
    const { data } = await apiMain.post("/machinery-usage/create/", formData,
        {headers: {"Content-Type": "multipart/form-data"}}
    );

// ===== PASO 5 =====

//traer listado de tipos de mantenimiento activos
export const getMaintenanceTypes = async () => {
    const { data } = await apiMain.get(`/maintenance/active/`);
    return data;
};

//registrar mantenimiento periodico de una maquinaria
export const registerPeriodicMaintenance = async (payload) => {
    const { data } = await apiMain.post("/machinery/periodic-maintenance/", payload);
    return data;
};

//traer listado de mantenimientos periodicos de maquinaria por id
export const getPeriodicMaintenancesById = async (id_machinery) => {
    const { data } = await apiMain.get(`/machinery/periodic-maintenance/`,
        { params: { machinery: id_machinery } }
    );
    return data;
};

// eliminar mantenimiento periódico de maquinaria por id
export const deletePeriodicMaintenance = async (id_periodic_maintenance) => {
    const { data } = await apiMain.delete(`/machinery/periodic-maintenance/${id_periodic_maintenance}/`);
    return data;
};