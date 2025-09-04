import { apiUsers } from "@/lib/axios";

export const getUserData = async (userId) => {
    const { data } = await apiUsers.get(`/users/${userId}`);
    return data;
};

export const changeProfilePhoto = async (userId, formData) => {
    const { data } = await apiUsers.put(`users/update-photo/${userId}`, formData,
        {headers: {"Content-Type": "multipart/form-data"}}
    );
    return data;
};

export const changeUserPassword = async (userId, payload) => {
    const { data } = await apiUsers.post(`users/${userId}/change-password`, payload);
    return data;
};

export const getTypeDocuments = async () => {
    const { data } = await apiUsers.get("/users/type-documents");
    return data;
};

export const getGenders = async () => {
    const { data } = await apiUsers.get("/users/genders");
    return data;
};