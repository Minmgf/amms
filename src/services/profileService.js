import { apiUsers } from "@/lib/axios";

export const getUserData = async (userId) => {
    const { data } = await apiUsers.get(`/users/${userId}`);
    return data;
};