import { apiUsers } from "@/lib/axios";

export const login = async (payload) => {
    const { data } = await apiUsers.post("/users/admin/create", payload);
    return data;
};

export const firstLogin = async (formData) => {
    const { data } = await apiUsers.post("users/first-login-register", formData,
        {headers: {"Content-Type": "multipart/form-data"}}
    );
    return data;
};