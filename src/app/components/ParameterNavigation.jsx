"use client";
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

const NavigationMenu = ({
  items = ['Type...', 'Status', 'Brands', 'Units', 'Styles', 'Job Titles'],
  onItemClick = () => {},
  // Mapeo de elementos a rutas
  routeMap = {
    'Type...': '/parametrization/mainView',
    'Status': '/parametrization/status', 
    'Brands': '/parametrization/brands',
    'Units': '/parametrization/units',
    'Styles': '/parametrization/styles',
    'Job Titles': '/parametrization/jobTitles'
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
    <div className="flex items-center justify-center w-full">
      {/* Desktop version - centered and 70% width */}
      <div className="hidden md:flex items-center space-x-1" style={{ width: '70%' }}>
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => handleItemClick(item)}
            className={`px-4 py-2 text-sm w-full font-medium rounded-md transition-colors ${
              item === activeItem
                ? 'bg-blue-100 text-blue-600 border border-blue-200'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
     
      {/* Mobile version with horizontal scroll */}
      <div className="md:hidden w-full overflow-x-auto">
        <div className="flex items-center space-x-1 min-w-max px-4">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemClick(item)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                item === activeItem
                  ? 'bg-blue-100 text-blue-600 border border-blue-200'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavigationMenu;