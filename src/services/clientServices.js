import { apiMain } from "@/lib/axios";

export const getClientsList = async (token) => {
    const { data } = await apiMain.get(`/customers/`);
    return data;
};