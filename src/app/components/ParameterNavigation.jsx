"use client";
import React from 'react';

const NavigationMenu = ({
  items = ['Type...', 'Status', 'Brands', 'Units', 'Styles', 'Job Titles'],
  activeItem = 'Brands',
  onItemClick = () => {}
}) => {
  return (
    <div className="flex items-center justify-center w-full">
      {/* Desktop version - centered and 70% width */}
      <div className="hidden md:flex items-center space-x-1" style={{ width: '70%' }}>
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => onItemClick(item)}
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
              onClick={() => onItemClick(item)}
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