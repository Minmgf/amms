import { apiMain } from "@/lib/axios";

//Obtener tipos de persona
export const getPersonTypes = async () => {
    const { data } = await apiMain.get("/person_types/");
    return data;
};