import Cookies from "js-cookie";
import { apiUsers } from "@/lib/axios";

// Helper para obtener el token desde localStorage o sessionStorage
const getAuthToken = () => {
    let token = localStorage.getItem("token");
    if (!token) {
        token = sessionStorage.getItem("token");
    }
    if (!token) {
        token = Cookies.get("token");
    }
    return token;
};

export const login = async (payload, rememberMe = false) => {
    const { data } = await apiUsers.post("/auth/login/", payload);

    // Guardar siempre en cookie para mantener consistencia
    // La cookie expira en 7 días si rememberMe es true, sino en 1 día
    const cookieExpiry = rememberMe ? 7 : 1;
    Cookies.set("token", data.access_token, { expires: cookieExpiry });

    // También guardar en localStorage o sessionStorage según preferencia
    if (rememberMe) {
        localStorage.setItem("token", data.access_token);
        // Limpiar sessionStorage si existe
        sessionStorage.removeItem("token");
    } else {
        sessionStorage.setItem("token", data.access_token);
        // Limpiar localStorage si existe
        localStorage.removeItem("token");
    }

    console.log("Token desde helper:", getAuthToken());
    console.log("Token desde cookie:", Cookies.get("token"));
    return data;
};

export const logout = async () => {
    try {
        const { data } = await apiUsers.post("/auth/logout");
        return data;
    } catch (error) {
        // Si falla el logout en el servidor, continuamos con la limpieza local
        console.error("Error en logout del servidor:", error);
    } finally {
        // Siempre limpiar los tokens locales
        Cookies.remove("token");
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("userData");
    }
};

// Nueva función para reenviar correo de activación
export const resendActivationEmail = async (email) => {
    const { data } = await apiUsers.post("/auth/resend-activation", { email });
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

// Esta función NO requiere autenticación
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

// Esta función NO requiere autenticación - solo necesita el token de validación
export const completePreregister = async (payload) => {
    const { data } = await apiUsers.post("/users/pre-register/complete", payload);
    return data;
};

export const recoverPassword = async (token, payload) => {
    const { data } = await apiUsers.post(
        `/auth/reset-password/${token}`,
        payload
    );
    return data;
};

// *! Metodos de integracion Minmgf

// * LLamar listado de usuarios
export const getUsersList = async (token) => {
    const { data } = await apiUsers.get(`/users/`);
    return data;
};

// * LLamar detalle de usuario
export const getUserInfo = async (userId) => {
    const { data } = await apiUsers.get(`/users/${userId}`);
    return data;
};

// * Crear usuario

// ? Obtener Tipos de Documentos
export const getDocumentTypes = async () => {
    const { data } = await apiUsers.get(`/users/type-documents`);
    return data;
};

// ? Obtener Generos
export const getGenderTypes = async () => {
    const { data } = await apiUsers.get(`/users/genders`);
    return data;
};

// ? Obtener Roles
export const getRoleTypes = async () => {
    const { data } = await apiUsers.get(`/roles/`);
    return data;
};

// * Función para verificar si el token está expirado
const isTokenExpired = (token) => {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp < currentTime;
    } catch (error) {
        console.error("Error al decodificar token:", error);
        return true;
    }
};

// * Función para verificar si el token es válido haciendo una petición de prueba
const validateToken = async () => {
    try {
        const response = await apiUsers.get("/users/");
        return response.status === 200;
    } catch (error) {
        console.error("Token no válido:", error.response?.status);
        return false;
    }
};

export const createUser = async (userData) => {
    try {
        // Verificar token antes de hacer la petición
        const token = getAuthToken();
        if (!token) {
            throw new Error("No hay token disponible");
        }

        if (isTokenExpired(token)) {
            throw new Error("Token expirado");
        }

        // Verificar si el token es válido haciendo una petición de prueba
        const isTokenValid = await validateToken();
        if (!isTokenValid) {
            throw new Error("Token no válido");
        }

        console.log(
            "URL del endpoint:",
            `${apiUsers.defaults.baseURL}/users/admin/create`
        );
        console.log("Datos enviados:", userData);
        console.log("Token válido:", !isTokenExpired(token));

        // Intentar con diferentes variaciones del endpoint
        let endpoint = `/users/admin/create`;
        console.log("Intentando endpoint:", endpoint);

        const { data } = await apiUsers.post(endpoint, userData);
        return data;
    } catch (error) {
        console.error(
            "Error en createUser:",
            error.response?.data || error.message
        );
        console.error("Status del error:", error.response?.status);
        console.error("Headers de respuesta:", error.response?.headers);
        throw error;
    }
};

// * Editar usuario
export const editUser = async (userId, userData) => {
    try {
        // Verificar token antes de hacer la petición
        const token = getAuthToken();
        if (!token) {
            throw new Error("No hay token disponible");
        }

        if (isTokenExpired(token)) {
            throw new Error("Token expirado");
        }

        // Verificar si el token es válido haciendo una petición de prueba
        const isTokenValid = await validateToken();
        if (!isTokenValid) {
            throw new Error("Token no válido");
        }

        console.log(
            "URL del endpoint:",
            `${apiUsers.defaults.baseURL}/users/admin/edit/${userId}`
        );
        console.log("Datos enviados:", userData);
        console.log("Token válido:", !isTokenExpired(token));

        const { data } = await apiUsers.put(
            `/users/admin/edit/${userId}`,
            userData
        );
        return data;
    } catch (error) {
        console.error("Error en editUser:", error.response?.data || error.message);
        console.error("Status del error:", error.response?.status);
        console.error("Headers de respuesta:", error.response?.headers);
        throw error;
    }
};

// * Cambiar estado usuario
export const changeUserStatus = async (userId, newStatus) => {
    try {
        // Verificar token antes de hacer la petición
        const token = getAuthToken();
        if (!token) {
            throw new Error("No hay token disponible");
        }

        if (isTokenExpired(token)) {
            throw new Error("Token expirado");
        }

        // Verificar si el token es válido haciendo una petición de prueba
        const isTokenValid = await validateToken();
        if (!isTokenValid) {
            throw new Error("Token no válido");
        }

        const payload = {
            user_id: userId,
            new_status: newStatus
        };

        console.log(
            "URL del endpoint:",
            `${apiUsers.defaults.baseURL}/users/change-user-status/`
        );
        console.log("Datos enviados:", payload);
        console.log("Token válido:", !isTokenExpired(token));

        const { data } = await apiUsers.post(
            `/users/change-user-status/`,
            payload
        );
        return data;
    } catch (error) {
        console.error("Error en changeUserStatus:", error.response?.data || error.message);
        console.error("Status del error:", error.response?.status);
        console.error("Headers de respuesta:", error.response?.headers);
        throw error;
    }
};