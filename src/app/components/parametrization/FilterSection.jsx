"use client";
import React, { useState } from "react";
import { FiFilter } from "react-icons/fi";

const FilterSection = ({ globalFilter, setGlobalFilter, placeholder = "Search..." }) => {
    const [showFilters, setShowFilters] = useState(false);

    return (
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                {/* Botón para mostrar/ocultar filtros */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="parametrization-filter-button flex items-center space-x-2 px-3 md:px-4 py-2 transition-colors w-fit"
                >
                    <FiFilter className="filter-icon w-4 h-4" />
                    <span className="text-sm">Filtrar por</span>
                </button>

                {/* Input de búsqueda (expandible) */}
                {showFilters && (
                    <div className="relative w-full sm:w-auto">
                        <input
                            type="text"
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder={placeholder}
                            className="parametrization-input px-3 py-2 pr-10 text-sm rounded-md 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                            w-full sm:min-w-[200px]"
                        />
                        {globalFilter && (
                            <button
                                onClick={() => setGlobalFilter("")}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 
                                text-gray-400 hover:text-gray-600 transition-colors p-1"
                                title="Clear filter"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilterSection;