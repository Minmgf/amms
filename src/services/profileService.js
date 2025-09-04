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