import { apiUsers } from "@/lib/axios";

export const login = async (payload) => {
    const { data } = await apiUsers.post("/users/admin/create", payload);
    return data;
};