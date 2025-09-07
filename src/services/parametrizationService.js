import { apiMain } from "@/lib/axios";

export const getType = async () => {
    const { data } = await apiMain.get(`types_categories/list`);
    return data;
};

export const getStatues = async () => {
    const { data } = await apiMain.get(`statues_categories/list/`);
    return data;
};
