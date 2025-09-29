"use client";
import { getToken } from '@/utils/tokenManager';
import React, { createContext, useContext, useState, useEffect } from 'react';

const PermissionsContext = createContext();

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

function decodeToken(token) {
  try {
    const arrayToken = token.split(".");
    const tokenPayload = JSON.parse(atob(arrayToken[1]));
    return tokenPayload;
  } catch (error) {
    return null;
  }
}

export const PermissionsProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [isProcessingLogin, setIsProcessingLogin] = useState(false); 

  const updateFromToken = (token, isFromLogin = false) => {
    
    if (!token) {
      setPermissions([]);
      setUserData(null);
      return null;
    }

    const payload = decodeToken(token);

    if (payload) {
      const allPermissions = [];

      if (payload.rol && Array.isArray(payload.rol)) {
        payload.rol.forEach(role => {
          if (role.permisos && Array.isArray(role.permisos)) {
            role.permisos.forEach(permiso => {
              if (!allPermissions.find(p => p.id === permiso.id)) {
                allPermissions.push({
                  id: permiso.id,
                  name: permiso.name
                });
              }
            });
          }
        });
      }
      // Actualizamos estado
      setPermissions(allPermissions);
      setUserData(payload);

      return { payload, allPermissions };
    }
        
    return null;
  };

  // Inicialización al montar el componente (silenciosa)
  useEffect(() => {
    const token = getToken();
    if (token) {
      // Carga silenciosa sin loading
      updateFromToken(token, false);
    }
  }, []);

  // Función para llamar después del login exitoso
  const loginSuccess = (token, callback) => {
    
    // Marcar que estamos procesando login INMEDIATAMENTE
    setIsProcessingLogin(true);
    setLoading(true);
    setInitializing(true);
    
    const startTime = Date.now();
    const minLoadingTime = 1200; // 1.2 segundos mínimo
    
    const finishLoading = () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
            
      setTimeout(() => {
        setLoading(false);
        setInitializing(false);
        setIsProcessingLogin(false);
        
        // Llamar callback si se proporcionó (para hacer redirect)
        if (callback) {
          callback();
        }
      }, remainingTime);
    };
    
    // Procesar permisos inmediatamente, sin delay
    updateFromToken(token, true);
    finishLoading();
  };

  const refreshPermissions = () => {
    setLoading(true);
    const token = getToken();
    if (token) {
      const result = updateFromToken(token);
      setLoading(false);
      return result;
    } else {
      setLoading(false);
      return null;
    }
  };

  const clearPermissions = () => {
    setPermissions([]);
    setUserData(null);
    setLoading(false);
    setInitializing(false);
    setIsProcessingLogin(false);
  };

  const hasPermission = (permissionId) => {
    return permissions.some(permission => permission.id === permissionId);
  };

  const hasAnyPermission = (permissionsList) => {
    return permissionsList.some(permissionId =>
      permissions.some(permission => permission.id === permissionId)
    );
  };

  const hasAllPermissions = (permissionsList) => {
    return permissionsList.every(permissionId =>
      permissions.some(permission => permission.id === permissionId)
    );
  };

  const value = {
    permissions,
    userData,
    loading,
    isProcessingLogin, 
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refreshPermissions,
    clearPermissions,
    loginSuccess,
    permissionNames: permissions.map(p => p.id),
    userId: userData?.id,
    userName: userData?.name,
    userEmail: userData?.email,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};