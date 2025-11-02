import { apiUsers } from "@/lib/axios";

export const changeRoleStatus = async (payload) => {
    const { data } = await apiUsers.post("roles/change-rol-status/", payload);
    return data;
};

export const getPermissions = async () => {
    const { data } = await apiUsers.get(`roles/permissions/`);
    return data;
};

export const createRole = async (payload) => {
    const { data } = await apiUsers.post("roles/", payload);
    return data;
};

export const updateRole = async (idRole, payload) => {
    const { data } = await apiUsers.post(`roles/${idRole}/edit`, payload);
    return data;
};

export const getDetailsRole = async (idRole) => {
    const { data } = await apiUsers.get(`roles/${idRole}`);
    return data;
};