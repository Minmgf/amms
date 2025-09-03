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