import axios from "axios";
import Cookies from "js-cookie";

// Función helper para obtener el token desde localStorage o sessionStorage
const getAuthToken = () => {
  // Primero intentar localStorage
  let token = localStorage.getItem('token');
  // Si no está en localStorage, intentar sessionStorage
  if (!token) {
    token = sessionStorage.getItem('token');
  }
  // Si tampoco está en storage, intentar cookies
  if (!token) {
    token = Cookies.get('token');
  }
  return token;
};

// Función para verificar si el token está expirado
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error("Error al decodificar token:", error);
    return true;
  }
};

// Función para limpiar todos los tokens
const clearAllTokens = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  localStorage.removeItem('userData');
  Cookies.remove('token');
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

export const apiAudit = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL_AUDIT,
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

// Lista de endpoints que NO requieren autenticación
const PUBLIC_ENDPOINTS = [
  '/auth/login/',
  '/auth/request-reset-password',
  '/auth/reset-password',
  '/auth/resend-activation',
  '/users/pre-register/validate',
  '/users/pre-register/complete',
  '/users/activate-account',
  '/users/type-documents',
  '/users/genders'
];

// Función para verificar si un endpoint es público
const isPublicEndpoint = (url) => {
  return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

// Función para agregar interceptores
const addInterceptors = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      // Si es un endpoint público, no agregar token
      if (isPublicEndpoint(config.url)) {
        return config;
      }

      const token = getAuthToken();
      
      if (token) {
        // Verificar si el token está expirado antes de usarlo
        if (isTokenExpired(token)) {
          console.warn('Token expirado, limpiando storage...');
          clearAllTokens();
          
          // Redirigir al login solo si no estamos ya en la página de login
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/sigma/login';
          }
          
          // Cancelar la petición
          return Promise.reject(new axios.Cancel('Token expirado'));
        }
        
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('No se encontró token en localStorage, sessionStorage ni cookies');
        
        // Si no hay token y no estamos en rutas públicas, redirigir al login
        if (typeof window !== 'undefined') {
          const publicPaths = ['/sigma/login', '/sigma/preregister', '/sigma/passwordRecovery', '/sigma/activate', '/sigma/completeRegister'];
          const isPublicPath = publicPaths.some(path => window.location.pathname.includes(path));
          
          if (!isPublicPath && !window.location.pathname.includes('/login')) {
            window.location.href = '/sigma/login';
            return Promise.reject(new axios.Cancel('No hay token disponible'));
          }
        }
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Si la petición fue cancelada por nosotros, no hacer nada más
      if (axios.isCancel(error)) {
        return Promise.reject(error);
      }
      
      // Solo redirigir al login si es un 401 Y no es una petición pública
      if (error.response?.status === 401) {
        // Si es una petición de endpoints públicos, dejar que el componente maneje el error
        if (isPublicEndpoint(error.config?.url)) {
          return Promise.reject(error);
        }
        
        // Para otras peticiones 401, limpiar tokens y redirigir
        console.error("Error 401: Token inválido o expirado, redirigiendo al login...");
        clearAllTokens();
        
        // Redirigir al login con el prefijo correcto
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/sigma/login';
        }
      }
      
      return Promise.reject(error);
    }
  );
};

// Aplicar interceptores a ambas instancias
addInterceptors(apiUsers);
addInterceptors(apiMain);