"use client";
import { usePermissions } from "@/contexts/PermissionsContext";

export default function AppLoader({ children }) {
  const { loading } = usePermissions();

  // Solo mostrar loader cuando loading sea true (después del login)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-6 h-6 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Inicializando SIGMA
            </h2>
            <p className="text-gray-600 animate-pulse">
              Cargando permisos de usuario...
            </p>
            <div className="mt-4 flex space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}