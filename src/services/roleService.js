import { apiUsers } from "@/lib/axios";

export const changeRoleStatus = async (payload) => {
    const { data } = await apiUsers.post("roles/change-rol-status/", payload);
    return data;
};