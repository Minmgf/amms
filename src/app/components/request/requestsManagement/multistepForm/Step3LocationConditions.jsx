import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { getCountries, getStates, getCities } from "@/services/locationService";
import { getAreaUnits, getAltitudeUnits, getSoilTypes } from "@/services/requestService";

export default function Step3LocationConditions() {
  const { register, setValue, watch, formState: { errors } } = useFormContext();

  // Estados para selects
  const [countriesList, setCountriesList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [areaUnits, setAreaUnits] = useState([]);
  const [altitudeUnits, setAltitudeUnits] = useState([]);
  const [soilTypes, setSoilTypes] = useState([]);

  // Watch para selects dependientes
  const selectedCountry = watch("country");
  const selectedDepartment = watch("department");

  useEffect(() => {
    getCountries().then(data => setCountriesList(data || []));
    getAreaUnits().then(data => {
      // Ajusta aquí según la estructura real de la respuesta
      if (Array.isArray(data)) {
        setAreaUnits(data);
      } else if (Array.isArray(data?.data)) {
        setAreaUnits(data.data);
      } else {
        setAreaUnits([]);
      }
    });
    getAltitudeUnits().then(data => {
      if (Array.isArray(data)) {
        setAltitudeUnits(data);
      } else if (Array.isArray(data?.data)) {
        setAltitudeUnits(data.data);
      } else {
        setAltitudeUnits([]);
      }
    });
    getSoilTypes().then(data => {
      if (Array.isArray(data)) {
        setSoilTypes(data);
      } else if (Array.isArray(data?.data)) {
        setSoilTypes(data.data);
      } else {
        setSoilTypes([]);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      getStates(selectedCountry).then(data => setDepartmentsList(data || []));
      setValue("department", "");
      setCitiesList([]);
      setValue("city", "");
    }
  }, [selectedCountry, setValue]);

  useEffect(() => {
    if (selectedDepartment) {
      getCities(selectedCountry, selectedDepartment).then(data => setCitiesList(data || []));
      setValue("city", "");
    }
  }, [selectedDepartment, selectedCountry, setValue]);

  return (
    <div>
      <h3 className="text-theme-lg font-theme-semibold mb-theme-md text-primary">
        Condiciones de Ubicación y Terreno
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Columna 1 */}
        <div>
          <label className="block text-theme-sm text-secondary mb-1">País</label>
          <select
            {...register("country",{
              required: "El país es obligatorio",
            })}
            className="parametrization-input"
            aria-label="País"
          >
            <option value="">Seleccione país...</option>
            {countriesList.map(country => (
              <option key={country.iso2 || country.id} value={country.iso2 || country.id}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.country && (
            <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
              {errors.country.message}
            </span>
          )}
        </div>        
        {/* Columna 2 */}
        <div>
          <label className="block text-theme-sm text-secondary mb-1">Región</label>
          <select
            {...register("department",{
              required: "La región es obligatoria",
            })}
            className="parametrization-input"
            aria-label="Region"
            disabled={!departmentsList.length}
          >
            <option value="">Seleccione región...</option>
            {departmentsList.map(dept => (
              <option key={dept.iso2 || dept.id} value={dept.iso2 || dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {errors.department && (
            <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
              {errors.department.message}
            </span>
          )}
        </div>
        {/* Columna 3 */}
        <div>
          <label className="block text-theme-sm text-secondary mb-1">Ciudad</label>
          <select
            {...register("city",{
              required: "La ciudad es obligatoria",
            })}
            className="parametrization-input"
            aria-label="Municipio"
            disabled={!citiesList.length}
          >
            <option value="">Seleccione ciudad...</option>
            {citiesList.map(city => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
          {errors.city && (
            <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
              {errors.city.message}
            </span>
          )}
        </div>
        {/* Segunda fila */}
        <div>
          <label className="block text-theme-sm text-secondary mb-1">Nombre del lugar</label>
          <input
            {...register("placeName",{
              required: "El nombre del lugar es obligatorio",
            })}
            className="parametrization-input"
            placeholder="Ej: Finca El Paraíso"
            aria-label="Nombre del lugar"
          />
          {errors.placeName && (
            <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
              {errors.placeName.message}
            </span>
          )}
        </div>
        <div>
          <label className="block text-theme-sm text-secondary mb-1">Coordenadas</label>
          <div className="flex gap-2">
            <input
              {...register("latitude", {
                required: "La latitud es obligatoria",
                min: { value: -90, message: "La latitud mínima es -90" },
                max: { value: 90, message: "La latitud máxima es 90" },
                valueAsNumber: true,
              })}
              className="parametrization-input flex-1"
              placeholder="Latitud"
              aria-label="Latitud"
              type="number"
              step="0.000001"
            />
            <input
              {...register("longitude", {
                required: "La longitud es obligatoria",
                min: { value: -180, message: "La longitud mínima es -180" },
                max: { value: 180, message: "La longitud máxima es 180" },
                valueAsNumber: true,
              })}
              className="parametrization-input flex-1"
              placeholder="Longitud"
              aria-label="Longitud"
              type="number"
              step="0.000001"
            />
          </div>
          {(errors.latitude || errors.longitude) && (
            <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
              {errors.latitude?.message || errors.longitude?.message}
            </span>
          )}
        </div>
        <div>
          <label className="block text-theme-sm text-secondary mb-1">Área</label>
          <div className="flex gap-2">
            <select
              {...register("areaUnit",{
                required: "La unidad de área es obligatoria",
              })}
              className="parametrization-input"
              aria-label="Unidad de area"
            >
              <option value="">Unidad</option>
              {areaUnits.map(unit => (
                <option key={unit.id_units} value={unit.id_units}>
                  {unit.symbol}
                </option>
              ))}
            </select>
            <input
              {...register("area",{
                required: "El área es obligatoria",
              })}
              className="parametrization-input"
              placeholder="Ej: 10"
              aria-label="Area"
              type="number"
            />
          </div>
          {errors.area && (
            <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
              {errors.area.message}
            </span>
          )}
        </div>

        {/* Tercera fila */}
        <div>
          <label className="block text-theme-sm text-secondary mb-1">Tipo de suelo</label>
          <select
            {...register("soilType",{
              required: "El tipo de suelo es obligatorio",
            })}
            className="parametrization-input"
            aria-label="Tipo de suelo"
          >
            <option value="">Seleccione tipo...</option>
            {soilTypes.map(type => (
              <option key={type.id_types} value={type.id_types}>
                {type.name}
              </option>
            ))}
          </select>
          {errors.soilType && (
            <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
              {errors.soilType.message}
            </span>
          )}
        </div>
        <div>
          <label className="block text-theme-sm text-secondary mb-1">Nivel de humedad (%)</label>
          <input
            {...register("humidityLevel",{
              required: "El nivel de humedad es obligatorio",
              min: { value: 0, message: "El nivel mínimo es 0%" },
              max: { value: 100, message: "El nivel máximo es 100%" },
              valueAsNumber: true,
            })}
            className="parametrization-input"
            placeholder="Ej: 60"
            aria-label="Nivel de humedad (%)"
            type="number"
          />
          {errors.humidityLevel && (
            <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
              {errors.humidityLevel.message}
            </span>
          )}
        </div>
        <div>
          <label className="block text-theme-sm text-secondary mb-1">Altitud</label>
          <div className="flex gap-2">
            <select
              {...register("altitudeUnit",{
                required: "La unidad de altitud es obligatoria",
              })}
              className="parametrization-input"
              aria-label="Unidad de altitud"
            >
              <option value="">Unidad</option>
              {altitudeUnits.map(unit => (
                <option key={unit.id_units} value={unit.id_units}>
                  {unit.symbol}
                </option>
              ))}
            </select>
            <input
              {...register("altitude",{
                required: "La altitud es obligatoria",
                valueAsNumber: true,
              })}
              className="parametrization-input"
              placeholder="Ej: 10.000000"
              aria-label="Altitud"
              type="number"
              step="0.01"
            />
          </div>
          {errors.altitude && (
            <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
              {errors.altitude.message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}