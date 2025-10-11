"use client";
import React from "react";

/**
 * ServiceFilterFields Component
 *
 * Componente que renderiza los campos de filtro para servicios.
 * Diseñado para ser usado como children del FilterModal compartido.
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.taxesFilter - Valor del filtro de impuestos
 * @param {Function} props.setTaxesFilter - Setter para el filtro de impuestos
 * @param {string} props.statusFilter - Valor del filtro de estado
 * @param {Function} props.setStatusFilter - Setter para el filtro de estado
 * @param {string} props.unitFilter - Valor del filtro de unidad de medida
 * @param {Function} props.setUnitFilter - Setter para el filtro de unidad
 * @param {number} props.priceMin - Valor mínimo del rango de precio
 * @param {Function} props.setPriceMin - Setter para el precio mínimo
 * @param {number} props.priceMax - Valor máximo del rango de precio
 * @param {Function} props.setPriceMax - Setter para el precio máximo
 * @param {Array} props.uniqueStatuses - Array de estados únicos para el select
 * @param {Array} props.uniqueUnits - Array de unidades únicas para el select
 */
const ServiceFilterFields = ({
  taxesFilter,
  setTaxesFilter,
  statusFilter,
  setStatusFilter,
  unitFilter,
  setUnitFilter,
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  uniqueStatuses,
  uniqueUnits,
}) => {
  // Valores para el slider
  const PRICE_MIN = 0;
  const PRICE_MAX = 1000000;

  /**
   * Formatea un número a moneda colombiana
   */
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  /**
   * Maneja el cambio del slider mínimo
   */
  const handleMinSliderChange = (e) => {
    const value = Number(e.target.value);
    if (value <= priceMax) {
      setPriceMin(value);
    }
  };

  /**
   * Maneja el cambio del slider máximo
   */
  const handleMaxSliderChange = (e) => {
    const value = Number(e.target.value);
    if (value >= priceMin) {
      setPriceMax(value);
    }
  };

  /**
   * Maneja el cambio del input de precio mínimo
   */
  const handleMinInputChange = (e) => {
    const value = e.target.value === "" ? PRICE_MIN : Number(e.target.value);
    if (value <= priceMax && value >= PRICE_MIN) {
      setPriceMin(value);
    }
  };

  /**
   * Maneja el cambio del input de precio máximo
   */
  const handleMaxInputChange = (e) => {
    const value = e.target.value === "" ? PRICE_MAX : Number(e.target.value);
    if (value >= priceMin && value <= PRICE_MAX) {
      setPriceMax(value);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Filtro de Impuestos */}
      <div>
        <label className="block text-sm font-medium text-primary mb-3">
          Impuestos
        </label>
        <input
          type="text"
          value={taxesFilter}
          onChange={(e) => setTaxesFilter(e.target.value)}
          placeholder="Ej: 19%, IVA..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
          aria-label="Filtrar por impuestos"
        />
      </div>

      {/* Filtro de Estado */}
      <div>
        <label className="block text-sm font-medium text-primary mb-3">
          Estado
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none cursor-pointer"
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          {uniqueStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro de Unidad de Medida */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-primary mb-3">
          Unidad de Medida
        </label>
        <select
          value={unitFilter}
          onChange={(e) => setUnitFilter(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none cursor-pointer"
          aria-label="Filtrar por unidad de medida"
        >
          <option value="">Todas las unidades</option>
          {uniqueUnits.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </div>

      {/* Rango de Precio */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-primary mb-3">
          Rango de Precio
        </label>

        {/* Slider visual */}
        <div className="relative pt-6 pb-8">
          {/* Labels de valores */}
          <div className="flex justify-between mb-4 text-sm font-medium text-primary">
            <span>{formatCurrency(priceMin)}</span>
            <span>{formatCurrency(priceMax)}</span>
          </div>

          {/* Contenedor del slider dual */}
          <div className="relative h-2">
            {/* Barra de fondo */}
            <div className="absolute w-full h-2 bg-gray-200 rounded-full"></div>

            {/* Barra de rango activo */}
            <div
              className="absolute h-2 bg-blue-600 rounded-full"
              style={{
                left: `${(priceMin / PRICE_MAX) * 100}%`,
                right: `${100 - (priceMax / PRICE_MAX) * 100}%`,
              }}
            ></div>

            {/* Slider mínimo */}
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={10000}
              value={priceMin}
              onChange={handleMinSliderChange}
              className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
              aria-label="Precio mínimo"
            />

            {/* Slider máximo */}
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={10000}
              value={priceMax}
              onChange={handleMaxSliderChange}
              className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
              aria-label="Precio máximo"
            />
          </div>
        </div>

        {/* Inputs numéricos */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Precio Mínimo
            </label>
            <input
              type="number"
              value={priceMin}
              onChange={handleMinInputChange}
              min={PRICE_MIN}
              max={priceMax}
              step={10000}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
              aria-label="Input precio mínimo"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Precio Máximo
            </label>
            <input
              type="number"
              value={priceMax}
              onChange={handleMaxInputChange}
              min={priceMin}
              max={PRICE_MAX}
              step={10000}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
              aria-label="Input precio máximo"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceFilterFields;

