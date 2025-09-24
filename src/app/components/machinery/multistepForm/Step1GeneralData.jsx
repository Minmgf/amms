import { useFormContext } from "react-hook-form";
import { useState, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export default function Step1GeneralData({
  countriesList = [],
  statesList = [],
  citiesList = [],
  isLoadingStates = false,
  isLoadingCities = false,
  machineryList = [],
  machineList = [],
  brandsList = [],
  modelsList = [],
}) {
  const { register, formState: { errors }, setValue, watch } = useFormContext();
  const [previewImage, setPreviewImage] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const fileInputRef = useRef(null);
  const { getCurrentTheme } = useTheme();

  const watchedPhoto = watch("photo");

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      // Actualizar información del archivo
      setFileName(file.name);
      setFileSize((file.size / 1024 / 1024).toFixed(2)); // Convertir a MB

      // Crear preview si es una imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);

      // Actualizar el valor en react-hook-form
      setValue("photo", file);
    }
  };

  const removeFile = () => {
    setPreviewImage(null);
    setFileName("");
    setFileSize("");
    setValue("photo", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div id="step-1-genereal-data">
      <h3 className="text-theme-lg font-theme-semibold mb-theme-md text-primary">
        Ficha técnica general
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label
            className="block text-theme-sm text-secondary mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Nombre
          </label>
          <input
            aria-label="Name Input"
            placeholder="Ej: Tractor agrícola"
            {...register("name")}
            className="parametrization-input"
          />
          {errors.name && (
            <span
              className="text-theme-xs mt-1 block"
              style={{ color: 'var(--color-error)' }}
            >
              {errors.name.message}
            </span>
          )}
        </div>

        <div>
          <label
            className="block text-theme-sm text-secondary mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Año de fabricación
          </label>
          <select
            aria-label="Manufacture Year Select"
            {...register("manufactureYear")}
            className="parametrization-input"
          >
            <option value="">Seleccione año...</option>
            {Array.from({ length: 30 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
          {errors.manufactureYear && (
            <span
              className="text-theme-xs mt-1 block"
              style={{ color: 'var(--color-error)' }}
            >
              {errors.manufactureYear.message}
            </span>
          )}
        </div>

        <div>
          <label
            className="block text-theme-sm text-secondary mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Número de serie
          </label>
          <input
            aria-label="Serial Number Input"
            placeholder="Ej: SN-12345-XYZ"
            {...register("serialNumber")}
            className="parametrization-input"
          />
          {errors.serialNumber && (
            <span
              className="text-theme-xs mt-1 block"
              style={{ color: 'var(--color-error)' }}
            >
              {errors.serialNumber.message}
            </span>
          )}
        </div>

        <div>
          <label
            className="block text-theme-sm text-secondary mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Tipo de maquina
          </label>
          <select
            aria-label="Machinery Type Select"
            {...register("machineryType")}
            className="parametrization-input"
          >
            <option value="">Seleccione un tipo...</option>
            {machineList.map((machineryType) => (
              <option key={machineryType.id_types} value={machineryType.id_types}>
                {machineryType.name}
              </option>
            ))}
          </select>
          {errors.machineryType && (
            <span
              className="text-theme-xs mt-1 block"
              style={{ color: 'var(--color-error)' }}
            >
              {errors.machineryType.message}
            </span>
          )}
        </div>

        <div>
          <label
            className="block text-theme-sm text-secondary mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Marca
          </label>
          <select
            aria-label="Brand Select"
            {...register("brand")}
            className="parametrization-input"
          >
            <option value="">Seleccione una marca...</option>
            {brandsList.map((brand) => (
              <option key={brand.id_brands} value={brand.id_brands}>
                {brand.name}
              </option>
            ))}
          </select>
          {errors.brand && (
            <span
              className="text-theme-xs mt-1 block"
              style={{ color: 'var(--color-error)' }}
            >
              {errors.brand.message}
            </span>
          )}
        </div>

        <div>
          <label
            className="block text-theme-sm text-secondary mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Modelo
          </label>
          <select
            aria-label="Model Select"
            {...register("model")}
            className="parametrization-input disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={modelsList.length === 0}
          >
            <option value="">
              {modelsList.length === 0 ? "Seleccione una marca primero" : "Seleccione un modelo..."}
            </option>
            {modelsList.map((model) => (
              <option key={model.id_model} value={model.id_model}>
                {model.name}
              </option>
            ))}
          </select>
          {errors.model && (
            <span
              className="text-theme-xs mt-1 block"
              style={{ color: 'var(--color-error)' }}
            >
              {errors.model.message}
            </span>
          )}
        </div>

        <div>
          <label
            className="block text-theme-sm text-secondary mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Subpartida arancelaria
          </label>
          <input
            aria-label="Tariff Input"
            placeholder="Ej: 8429.11.00"
            {...register("tariff")}
            className="parametrization-input"
          />
          {errors.tariff && (
            <span
              className="text-theme-xs mt-1 block"
              style={{ color: 'var(--color-error)' }}
            >
              {errors.tariff.message}
            </span>
          )}
        </div>

        <div>
          <label
            className="block text-theme-sm text-secondary mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Categoría de maquinaria
          </label>
          <select
            aria-label="Machinery Category Select"
            {...register("category")}
            className="parametrization-input"
          >
            <option value="">Seleccione una categoría...</option>
            {machineryList.map((category) => (
              <option key={category.id_types} value={category.id_types}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <span
              className="text-theme-xs mt-1 block"
              style={{ color: 'var(--color-error)' }}
            >
              {errors.category.message}
            </span>
          )}
        </div>

        <div>
          <label
            className="block text-theme-sm text-secondary mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            País
          </label>
          <select
            aria-label="Country Select"
            {...register("country")}
            className="parametrization-input"
          >
            <option value="">Seleccione un país...</option>
            {countriesList.map((country) => (
              <option key={country.iso2} value={country.iso2}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.country && (
            <span
              className="text-theme-xs mt-1 block"
              style={{ color: 'var(--color-error)' }}
            >
              {errors.country.message}
            </span>
          )}
        </div>

        <div>
          <label
            className="block text-theme-sm text-secondary mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Región
          </label>
          <select
            aria-label="Department Select"
            {...register("department")}
            disabled={isLoadingStates || statesList.length === 0}
            className="parametrization-input disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              opacity: (isLoadingStates || statesList.length === 0) ? 0.5 : 1,
              cursor: (isLoadingStates || statesList.length === 0) ? 'not-allowed' : 'default'
            }}
          >
            <option value="">
              {isLoadingStates
                ? "Loading..."
                : statesList.length === 0
                  ? "Seleccione un país primero"
                  : "Seleccione una región..."
              }
            </option>
            {statesList.map((state) => (
              <option key={state.iso2} value={state.iso2}>
                {state.name}
              </option>
            ))}
          </select>
          {errors.department && (
            <span
              className="text-theme-xs mt-1 block"
              style={{ color: 'var(--color-error)' }}
            >
              {errors.department.message}
            </span>
          )}
        </div>

        <div>
          <label
            className="block text-theme-sm text-secondary mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            City
          </label>
          <select
            aria-label="City Select"
            {...register("city")}
            disabled={isLoadingCities || citiesList.length === 0}
            className="parametrization-input disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              opacity: (isLoadingCities || citiesList.length === 0) ? 0.5 : 1,
              cursor: (isLoadingCities || citiesList.length === 0) ? 'not-allowed' : 'default'
            }}
          >
            <option value="">
              {isLoadingCities
                ? "Loading..."
                : citiesList.length === 0
                  ? "Seleccione una región primero"
                  : "Seleccione una ciudad..."
              }
            </option>
            {citiesList.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
          {errors.city && (
            <span
              className="text-theme-xs mt-1 block"
              style={{ color: 'var(--color-error)' }}
            >
              {errors.city.message}
            </span>
          )}
        </div>

        <div>
          <label
            className="block text-theme-sm text-secondary mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Telemetría
          </label>
          <select
            aria-label="Telemetry Select"
            {...register("telemetry")}
            className="parametrization-input"
          >
            <option value="">Selecciona...</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          {errors.telemetry && (
            <span
              className="text-theme-xs mt-1 block"
              style={{ color: 'var(--color-error)' }}
            >
              {errors.telemetry.message}
            </span>
          )}
        </div>
      </div>

      {/* File Upload */}
      <div className="mt-theme-lg">
        <label
          className="block text-theme-sm text-secondary mb-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Foto
        </label>

        {!fileName ? (
          // Mostrar zona de drop cuando no hay archivo
          <div className="group">
            <input
              aria-label="Photo Input"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              id="photoUpload"
            />
            <label
              htmlFor="photoUpload"
              className="block border-2 border-dashed rounded-theme-lg p-theme-xl text-center transition-all duration-300 cursor-pointer hover:shadow-md"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
              }}
            >
              <div className="flex flex-col items-center">
                <div className="mb-theme-md">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--color-border)' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <div>
                  <span
                    className="font-theme-medium"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Sube un archivo o arrastra y suelta
                  </span>
                  <br />
                  <span
                    className="text-theme-sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    PNG, JPG, GIF hasta 10 MB
                  </span>
                </div>
              </div>
            </label>
          </div>
        ) : (
          // Mostrar archivo cargado
          <div
            className="border rounded-theme-lg p-theme-md"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)'
            }}
          >
            <div className="flex items-start space-x-4">
              {/* Preview de la imagen */}
              {previewImage && (
                <div className="flex-shrink-0">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-theme-md border"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                </div>
              )}

              {/* Información del archivo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-theme-sm font-theme-medium truncate"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {fileName}
                    </p>
                    <p
                      className="text-theme-sm"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {fileSize} MB
                    </p>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex items-center space-x-2">
                    <button
                      aria-label="Change Button"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-theme btn-secondary "

                    >
                      Cambiar
                    </button>
                    <button
                      aria-label="Remove Button"
                      type="button"
                      onClick={removeFile}
                      className="btn-theme btn-error"

                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="mt-2">
                  <div
                    className="rounded-full h-1.5"
                    style={{ backgroundColor: 'var(--color-surface)' }}
                  >
                    <div
                      className="h-1.5 rounded-full w-full transition-all duration-300"
                      style={{ backgroundColor: 'var(--color-success)' }}
                    ></div>
                  </div>
                  <p
                    className="text-theme-xs mt-1"
                    style={{ color: 'var(--color-success)' }}
                  >
                    Carga completada
                  </p>
                </div>
              </div>
            </div>

            {/* Input oculto para cambiar archivo */}
            <input
              aria-label="Hidden File Input"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        )}

        {errors.photo && (
          <span
            className="text-theme-xs mt-1 block"
            style={{ color: 'var(--color-error)' }}
          >
            {errors.photo.message}
          </span>
        )}
      </div>
    </div>
  );
}