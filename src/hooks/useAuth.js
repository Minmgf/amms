"use client";
import { useRouter } from 'next/navigation';
import { usePermissions } from '../contexts/PermissionsContext';
import { getToken, removeToken } from '@/utils/tokenManager';

export const useAuth = () => {
  const router = useRouter();
  const {
    permissions,
    userRoles,
    userData,
    loading,
    clearPermissions,
    isActiveUser,
    loginSuccess
  } = usePermissions();

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

  const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;
    
    // Verificar si el token no está expirado
    if (isTokenExpired(token)) {
      // Limpiar tokens expirados
      removeToken();
      localStorage.removeItem('userData');
      return false;
    }
    
    return true;
  };

  // Función corregida para el login
  const login = async (token, redirectPath = '/home') => {
    try {
      // Definir el callback de redirect
      const handleRedirect = () => {
        router.push(redirectPath);
      };

      // Actualizar permisos y pasar callback para redirect automático
      loginSuccess(token, handleRedirect);
      
    } catch (error) {
      console.error('Error durante el login:', error);
    }
  };

  const logout = () => {
    // Limpiar todos los storages
    removeToken();
    localStorage.removeItem('userData');
    clearPermissions();
    
    // Redirigir al login con el prefijo correcto
    router.push('/sigma/login');
  };

  const isUserValid = () => {
    return isAuthenticated() && isActiveUser();
  };

  return {
    permissions,
    userRoles,
    userData,
    loading,
    isAuthenticated,
    isUserValid,
    login,
    logout,
  };
};