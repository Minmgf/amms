import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

export default function Step3LocationConditions({ countriesList = [], areaUnits = [], altitudeUnits = [], fetchStates, fetchCities }) {
  const { register, setValue, watch, getValues, formState: { errors } } = useFormContext();

  const [departmentsList, setDepartmentsList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  // Siempre usa el valor ACTUAL del formulario, no solo el del watch
  const selectedCountry = getValues("country") || watch("country");
  const selectedDepartment = getValues("department") || watch("department");
  const selectedCity = getValues("city") || watch("city");

  // Cargar departamentos si hay país seleccionado (al montar y cuando cambie)
  useEffect(() => {
    let mounted = true;
    const loadStates = async () => {
      if (!selectedCountry) {
        setDepartmentsList([]);
        return;
      }
      const states = fetchStates ? await fetchStates(selectedCountry) : [];
      if (!mounted) return;
      setDepartmentsList(states || []);
    };
    loadStates();
    return () => { mounted = false; };
  }, [selectedCountry, fetchStates]);

  // Cargar ciudades si hay departamento seleccionado (al montar y cuando cambie)
  useEffect(() => {
    let mounted = true;
    const loadCities = async () => {
      if (!selectedCountry || !selectedDepartment) {
        setCitiesList([]);
        return;
      }
      const cities = fetchCities ? await fetchCities(selectedCountry, selectedDepartment) : [];
      if (!mounted) return;
      setCitiesList(cities || []);
    };
    loadCities();
    return () => { mounted = false; };
  }, [selectedCountry, selectedDepartment, fetchCities]);

  // Si el valor seleccionado no está en el array, agrégalo temporalmente para que el select lo muestre
  const safeDepartmentsList = React.useMemo(() => {
    if (
      selectedDepartment &&
      !departmentsList.some(
        d => String(d.iso2 || d.id) === String(selectedDepartment)
      )
    ) {
      return [
        ...departmentsList,
        { id: selectedDepartment, name: "(Seleccionado previamente)" }
      ];
    }
    return departmentsList;
  }, [departmentsList, selectedDepartment]);

  const safeCitiesList = React.useMemo(() => {
    if (
      selectedCity &&
      !citiesList.some(c => String(c.id) === String(selectedCity))
    ) {
      return [
        ...citiesList,
        { id: selectedCity, name: "(Seleccionado previamente)" }
      ];
    }
    return citiesList;
  }, [citiesList, selectedCity]);

  return (
    <div>
      <h3 className="text-theme-lg font-theme-semibold mb-theme-md text-primary">
        Condiciones de Ubicación y Terreno
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* País */}
        <div>
          <label className="block text-theme-sm text-secondary mb-1">País</label>
          <select
            {...register("country",{ required: "El país es obligatorio" })}
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

        {/* Región */}
        <div>
          <label className="block text-theme-sm text-secondary mb-1">Región</label>
          <select
            {...register("department",{ required: "La región es obligatoria" })}
            className="parametrization-input"
            aria-label="Region"
            disabled={!safeDepartmentsList.length}
          >
            <option value="">Seleccione región...</option>
            {safeDepartmentsList.map(dept => (
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

        {/* Ciudad */}
        <div>
          <label className="block text-theme-sm text-secondary mb-1">Ciudad</label>
          <select
            {...register("city",{ required: "La ciudad es obligatoria" })}
            className="parametrization-input"
            aria-label="Municipio"
            disabled={!safeCitiesList.length}
          >
            <option value="">Seleccione ciudad...</option>
            {safeCitiesList.map(city => (
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

        {/* Nombre del lugar */}
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

        {/* Coordenadas */}
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

        {/* Área */}
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
              step="0.01"
            />
          </div>
          {errors.area && (
            <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
              {errors.area.message}
            </span>
          )}
        </div>

        {/* Altitud */}
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