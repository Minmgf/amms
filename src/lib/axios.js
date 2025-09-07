import axios from "axios";

// Instancia para el microservicio de usuarios
export const apiUsers = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL_USERS,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Instancia para el microservicio principal
export const apiMain = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL_MAIN,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});


export const apiLocation = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL_LOCATION,
  headers: {
    "X-CSCAPI-KEY": process.env.NEXT_PUBLIC_CSC_API_KEY, // tu API key
  },
});

// Función para agregar interceptores
const addInterceptors = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('No se encontró token en localStorage');
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
