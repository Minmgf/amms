import axios from "axios";

// Función helper para obtener el token desde localStorage o sessionStorage
const getAuthToken = () => {
  // Primero intentar localStorage
  let token = localStorage.getItem('token');
  
  // Si no está en localStorage, intentar sessionStorage
  if (!token) {
    token = sessionStorage.getItem('token');
  }
  
  return token;
};

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
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Token enviado en request:', token);
        console.log('Headers completos:', config.headers);
      } else {
        console.warn('No se encontró token en localStorage ni sessionStorage');
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
