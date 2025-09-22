import { useFormContext } from "react-hook-form";
import { useState, useRef } from "react";

export default function Step1GeneralData({ 
  countriesList = [], 
  statesList = [], 
  citiesList = [],
  isLoadingStates = false,
  isLoadingCities = false 
}) {
  const { register, formState: { errors }, setValue, watch } = useFormContext();
  const [previewImage, setPreviewImage] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const fileInputRef = useRef(null);
  
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
      <h3 className="text-lg font-semibold mb-4 text-black">Ficha técnica general</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Nombre</label>
          <input
            area-label="Name Input"
            {...register("name")}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Año de fabricación</label>
          <select
            area-label="Manufacture Year Select"
            {...register("manufactureYear")}
            className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          {errors.manufactureYear && <span className="text-red-500 text-xs">{errors.manufactureYear.message}</span>}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Número de serie</label>
          <input
            area-label="Serial Number Input"
            {...register("serialNumber")}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.serialNumber && <span className="text-red-500 text-xs">{errors.serialNumber.message}</span>}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Tipo de maquinaria</label>
          <select
            area-label="Machinery Type Select"
            {...register("machineryType")}
            className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccione un tipo...</option>
            <option value="tractor">Tractor</option>
            <option value="excavator">Excavator</option>
            <option value="bulldozer">Bulldozer</option>
            <option value="crane">Crane</option>
            <option value="loader">Loader</option>
            <option value="grader">Grader</option>
          </select>
          {errors.machineryType && <span className="text-red-500 text-xs">{errors.machineryType.message}</span>}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Marca</label>
          <select
            area-label="Brand Select"
            {...register("brand")}
            className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccione marca...</option>
            <option value="caterpillar">Caterpillar</option>
            <option value="john-deere">John Deere</option>
            <option value="komatsu">Komatsu</option>
            <option value="volvo">Volvo</option>
            <option value="case">Case</option>
            <option value="new-holland">New Holland</option>
          </select>
          {errors.brand && <span className="text-red-500 text-xs">{errors.brand.message}</span>}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Modelo</label>
          <input
            area-label="Model Input"
            {...register("model")}
            placeholder="Enter model"
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.model && <span className="text-red-500 text-xs">{errors.model.message}</span>}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Subpartida arancelaria</label>
          <input
            area-label="Tariff Input"
            {...register("tariff")}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.tariff && <span className="text-red-500 text-xs">{errors.tariff.message}</span>}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Categoría de maquinaria</label>
          <select
            area-label="Machinery Category Select"
            {...register("category")}
            className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccione categoría...</option>
            <option value="heavy">Heavy</option>
            <option value="light">Light</option>
            <option value="medium">Medium</option>
          </select>
          {errors.category && <span className="text-red-500 text-xs">{errors.category.message}</span>}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">País</label>
          <select
            area-label="Country Select"
            {...register("country")}
            className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccione un país...</option>
            {countriesList.map((country) => (
              <option key={country.iso2} value={country.iso2}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.country && <span className="text-red-500 text-xs">{errors.country.message}</span>}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Región</label>
          <select
            area-label="Department Select"
            {...register("department")}
            disabled={isLoadingStates || statesList.length === 0}
            className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
          {errors.department && <span className="text-red-500 text-xs">{errors.department.message}</span>}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">City</label>
          <select
            area-label="City Select"
            {...register("city")}
            disabled={isLoadingCities || citiesList.length === 0}
            className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
          {errors.city && <span className="text-red-500 text-xs">{errors.city.message}</span>}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Telemetría</label>
          <select
            area-label="Telemetry Select"
            {...register("telemetry")}
            className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecciona...</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          {errors.telemetry && <span className="text-red-500 text-xs">{errors.telemetry.message}</span>}
        </div>
      </div>

      {/* File Upload */}
      <div className="mt-6">
        <label className="block text-sm text-gray-600 mb-2">Foto</label>
        
        {!fileName ? (
          // Mostrar zona de drop cuando no hay archivo
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors">
            <input
              area-label="Photo Input"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              id="photoUpload"
            />
            <label htmlFor="photoUpload" className="cursor-pointer flex flex-col items-center">
              <div className="mb-4">
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Sube un archivo o arrastra y suelta</span>
                <br />
                <span className="text-sm text-gray-400">PNG, JPG, GIF hasta 10 MB</span>
              </div>
            </label>
          </div>
        ) : (
          // Mostrar archivo cargado
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex items-start space-x-4">
              {/* Preview de la imagen */}
              {previewImage && (
                <div className="flex-shrink-0">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="w-16 h-16 object-cover rounded border"
                  />
                </div>
              )}
              
              {/* Información del archivo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {fileSize} MB
                    </p>
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="flex items-center space-x-2">
                    <button
                      area-label="Change Button"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Cambiar
                    </button>
                    <button
                      area-label="Remove Button"
                      type="button"
                      onClick={removeFile}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                
                {/* Barra de progreso (opcional - siempre completa ya que el archivo se carga instantáneamente) */}
                <div className="mt-2">
                  <div className="bg-green-100 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full w-full"></div>
                  </div>
                  <p className="text-xs text-green-600 mt-1">Carga completada</p>
                </div>
              </div>
            </div>

            {/* Input oculto para cambiar archivo */}
            <input
              area-label="Hidden File Input"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        )}
        
        {errors.photo && <span className="text-red-500 text-xs">{errors.photo.message}</span>}
      </div>
    </div>
  );
}