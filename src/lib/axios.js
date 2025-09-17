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
    "X-CSCAPI-KEY": process.env.NEXT_PUBLIC_CSC_API_KEY,
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
        console.warn('No se encontró token en localStorage ni sessionStorage');
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Solo redirigir al login si es un 401 Y no es una petición de login
      if (error.response?.status === 401) {
        // Si es una petición de login, dejar que el componente maneje el error
        if (error.config?.url?.includes('/auth/login')) {
          // No hacer nada, dejar que el componente maneje el error de login
          return Promise.reject(error);
        }
        
        // Para otras peticiones 401, verificar si hay token
        const token = getAuthToken();
        
        // Si no hay token o el token es inválido, redirigir al login
        if (!token) {
          console.error("No hay token, redirigiendo al login...");
          // Solo redirigir si estamos en el cliente
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        } else {
          console.error("Token inválido o expirado, redirigiendo al login...");
          // Limpiar tokens inválidos
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          localStorage.removeItem('userData');
          
          // Redirigir al login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      }
      return Promise.reject(error);
    }
  );
};

// Aplicar interceptores a ambas instancias
addInterceptors(apiUsers);
addInterceptors(apiMain);