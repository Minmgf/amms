"use client";
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

const NavigationMenu = ({
  items = ['Tipos', 'Estados', 'Marcas', 'Unidades', 'Estilos', 'Cargos'],
  onItemClick = () => {},
  // Mapeo de elementos a rutas
  routeMap = {
    'Tipos': '/parametrization/mainView',
    'Estados': '/parametrization/status', 
    'Marcas': '/parametrization/brands',
    'Unidades': '/parametrization/units',
    'Estilos': '/parametrization/styles',
    'Cargos': '/parametrization/jobTitles'
  }
}) => {
  const router = useRouter();
  const pathname = usePathname();

  // Determinar el item activo basado en la ruta actual
  const getActiveItem = () => {
    for (const [item, route] of Object.entries(routeMap)) {
      if (pathname === route) {
        return item;
      }
    }
    return null;
  };

  const activeItem = getActiveItem();

  const handleItemClick = (item) => {
    // Ejecutar la función callback si existe
    onItemClick(item);
    // Navegar a la ruta correspondiente
    if (routeMap[item]) {
      router.push(routeMap[item]);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-2 mt-4 sm:px-4">
      {/* Desktop y Tablet (md y superior) - Grid responsivo */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-3">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => handleItemClick(item)}
            className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 ${
              item === activeItem
                ? 'bg-blue-100 text-blue-600 border border-blue-200 shadow-md'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm border border-transparent'
            }`}
          >
            <span className="block truncate">{item}</span>
          </button>
        ))}
      </div>

      {/* Tablet pequeño (sm a md) - Grid 2 columnas */}
      <div className="hidden sm:grid md:hidden grid-cols-2 gap-2">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => handleItemClick(item)}
            className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              item === activeItem
                ? 'bg-blue-100 text-blue-600 border border-blue-200 shadow-md'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm border border-transparent'
            }`}
          >
            <span className="block truncate">{item}</span>
          </button>
        ))}
      </div>

      {/* Mobile (hasta sm) - Grid 2 columnas compacto */}
      <div className="sm:hidden grid grid-cols-2 gap-1.5">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => handleItemClick(item)}
            className={`px-2.5 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
              item === activeItem
                ? 'bg-blue-100 text-blue-600 border border-blue-200 shadow-sm'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
            }`}
          >
            <span className="block truncate leading-tight">{item}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NavigationMenu;