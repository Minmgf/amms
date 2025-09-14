"use client";
import { useRouter } from 'next/navigation';
import { usePermissions } from '../contexts/PermissionsContext';
import Cookies from 'js-cookie';

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

  const isAuthenticated = () => {
    return !!Cookies.get('token');
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
    Cookies.remove('token');
    localStorage.removeItem('userData');
    clearPermissions();
    router.push('/login');
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