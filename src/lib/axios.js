import axios from "axios";

// Instancia para el microservicio de usuarios
export const apiUsers = axios.create({
  baseURL: "http://localhost:8001/users",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Instancia para el microservicio principal
export const apiMain = axios.create({
  baseURL: "https://api.inmero.co/sigma/main" || "http://localhost:8000",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Función para agregar interceptores
const addInterceptors = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.error("No autorizado, redirigiendo al login...");
      }
      return Promise.reject(error);
    }
  );
};

// Aplicar interceptores a ambas instancias
addInterceptors(apiUsers);
addInterceptors(apiMain);
