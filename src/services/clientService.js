import { apiMain, apiUsers } from "@/lib/axios";

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

