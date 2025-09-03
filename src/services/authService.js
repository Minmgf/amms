import Cookies from "js-cookie";
import { apiUsers } from "@/lib/axios";

export const login = async (payload) => {
    const { data } = await apiUsers.post("/auth/login", payload);
    // guardar token en cookie (expira en 1 hora por ejemplo)
    Cookies.set("token", data.access_token, { expires: 12 / 24 });

    // opcional: también en localStorage
    localStorage.setItem("token", data.access_token);
    console.log(localStorage.getItem("token"));
    console.log(Cookies.get("token"));
    return data;
};

export const logout = async () => {
    const { data } = await apiUsers.post("/auth/logout");
    Cookies.remove("token");
    localStorage.removeItem("token");
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

export const getRoles = async () => {
    const { data } = await apiUsers.get("/roles");
    return data;
};

export const validateDocument = async (payload) => {
    const { data } = await apiUsers.post("/users/pre-register/validate", payload);
    return data;
};

export const requestResetPassword = async (payload) => {
    const { data } = await apiUsers.post("/auth/request-reset-password", payload);
    return data;
};

export const activateAccount = async (token) => {
    const { data } = await apiUsers.get(`/users/activate-account/${token}`);
    return data;
};

export const completePreregister = async (payload) => {
    const { data } = await apiUsers.post("/users/pre-register/complete", payload);
    return data;
};

export const recoverPassword = async (token, payload) => {
    const { data } = await apiUsers.post(`/auth/reset-password/${token}`, payload);
    return data;
};