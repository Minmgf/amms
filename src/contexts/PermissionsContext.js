"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

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
  const [userRoles, setUserRoles] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [isProcessingLogin, setIsProcessingLogin] = useState(false); // Nuevo estado

  const updateFromToken = (token, isFromLogin = false) => {
    
    if (!token) {
      setPermissions([]);
      setUserRoles([]);
      setUserData(null);
      return null;
    }

    const payload = decodeToken(token);

    if (payload) {
      const allPermissions = [];
      const roles = [];

      if (payload.rol && Array.isArray(payload.rol)) {
        payload.rol.forEach(role => {
          roles.push({
            id: role.id,
            name: role.name
          });

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
      setUserRoles(roles);
      setUserData(payload);

      return { payload, roles, allPermissions };
    } else {
      console.log("");
    }
    
    return null;
  };

  // Inicialización al montar el componente (silenciosa)
  useEffect(() => {
    
    const token = Cookies.get('token');
    
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
    
    // Guardar token en cookies INMEDIATAMENTE
    Cookies.set('token', token);
    
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
    const token = Cookies.get('token');
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
    setUserRoles([]);
    setUserData(null);
    setLoading(false);
    setInitializing(false);
    setIsProcessingLogin(false);
  };

  const hasPermission = (permissionId) => {
    return permissions.some(permission => permission.id === permissionId);
  };

  const hasRole = (roleName) => {
    return userRoles.some(role => role.name === roleName);
  };

  const hasAnyRole = (rolesList) => {
    return rolesList.some(roleName =>
      userRoles.some(role => role.name === roleName)
    );
  };

  const hasAllRoles = (rolesList) => {
    return rolesList.every(roleName =>
      userRoles.some(role => role.name === roleName)
    );
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
    userRoles,
    userData,
    loading,
    isProcessingLogin, // Nuevo estado expuesto
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasAnyPermission,
    hasAllPermissions,
    refreshPermissions,
    clearPermissions,
    loginSuccess,
    permissionNames: permissions.map(p => p.id),
    roleNames: userRoles.map(r => r.name),
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