import { useFormContext } from "react-hook-form";
import { useState, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export default function Step6UploadDocs() {
  const { register, formState: { errors }, setValue, watch, getValues } = useFormContext();
  const [docs, setDocs] = useState([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const fileInputRef = useRef(null);
  const { getCurrentTheme } = useTheme();

  const MAX_SIZE = 8 * 1024 * 1024; // 8MB
  const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

  const watchedFile = watch("file");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      // Actualizar información del archivo
      setFileName(file.name);
      setFileSize((file.size / 1024 / 1024).toFixed(2)); // Convertir a MB
      
      // Crear preview si es una imagen
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewFile(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewFile(null);
      }
      
      // Actualizar el valor en react-hook-form
      setValue("file", file);
      setError("");
      setSuccessMsg("");
    }
  };

  const removeFile = () => {
    setPreviewFile(null);
    setFileName("");
    setFileSize("");
    setValue("file", null);
    setError("");
    setSuccessMsg("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAdd = () => {
    const name = getValues("documentName");
    const file = getValues("file");

    if (!name) {
      setError("El nombre del documento es obligatorio");
      return;
    }
    if (!file) {
      setError("Debe seleccionar un archivo");
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Formato no permitido. Solo PDF, JPG o PNG.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("El archivo supera el tamaño máximo permitido (8MB).");
      return;
    }

    const newDoc = { name, file };
    setDocs([...docs, newDoc]);

    setValue("documentName", "");
    setValue("file", null);
    setPreviewFile(null);
    setFileName("");
    setFileSize("");
    setError("");
    setSuccessMsg("Documento agregado correctamente");
  };

  const handleDelete = (index) => {
    setDocs(docs.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div id="step-6-upload-docs">
      <h3 className="text-theme-lg font-theme-semibold mb-theme-md text-primary">
        Subir Documentación
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Columna izquierda - Formulario */}
        <div className="space-y-6">
          {/* Nombre del documento */}
          <div>
            <label 
              className="block text-theme-sm text-secondary mb-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Nombre del documento
            </label>
            <input
              aria-label="Document Name Input"
              placeholder="Ingrese el nombre del documento"
              {...register("documentName")}
              className="parametrization-input"
            />
            {errors.documentName && (
              <span 
                className="text-theme-xs mt-1 block" 
                style={{ color: 'var(--color-error)' }}
              >
                {errors.documentName.message}
              </span>
            )}
          </div>

          {/* Selector de archivo */}
          <div>
            <label 
              className="block text-theme-sm text-secondary mb-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Archivo
            </label>
            
            {!fileName ? (
              // Mostrar zona de drop cuando no hay archivo
              <div className="group">
                <input
                  aria-label="File Input"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  id="fileUpload"
                />
                <label 
                  htmlFor="fileUpload" 
                  className="block border-2 border-dashed rounded-theme-lg p-theme-xl text-center transition-all duration-300 cursor-pointer hover:shadow-md"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-secondary)',
                    minHeight: '120px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full">
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
                        Seleccione o arrastre un archivo
                      </span>
                      <br />
                      <span 
                        className="text-theme-sm"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        Máx: 8MB • PDF, JPG, PNG
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
                  {/* Preview del archivo */}
                  {previewFile ? (
                    <div className="flex-shrink-0">
                      <img 
                        src={previewFile} 
                        alt="Preview" 
                        className="w-16 h-16 object-cover rounded-theme-md border"
                        style={{ borderColor: 'var(--color-border)' }}
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0">
                      <div 
                        className="w-16 h-16 flex items-center justify-center rounded-theme-md border"
                        style={{ 
                          borderColor: 'var(--color-border)',
                          backgroundColor: 'var(--color-background)'
                        }}
                      >
                        <svg 
                          className="w-8 h-8" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                  
                  {/* Información del archivo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p 
                          className="text-theme-sm font-theme-medium truncate"
                          style={{ color: 'var(--color-text)' }}
                          title={fileName}
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
                      
                      {/* Botones de acción - siempre visibles */}
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          aria-label="Change Button"
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="btn-theme btn-secondary text-theme-sm px-theme-sm py-theme-sm rounded-theme-md transition-all duration-200 whitespace-nowrap"
                        >
                          Cambiar
                        </button>
                        <button
                          aria-label="Remove Button"
                          type="button"
                          onClick={removeFile}
                          className="btn-theme btn-error text-theme-sm px-theme-sm py-theme-sm rounded-theme-md transition-all duration-200 whitespace-nowrap"
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
                        Archivo seleccionado
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
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
              </div>
            )}
            
            {errors.file && (
              <span 
                className="text-theme-xs mt-1 block" 
                style={{ color: 'var(--color-error)' }}
              >
                {errors.file.message}
              </span>
            )}
          </div>

          {/* Botón Agregar */}
          <div className="pt-4">
            <button
              aria-label="Add Document Button"
              type="button"
              onClick={handleAdd}
              className="btn-theme btn-secondary px-theme-lg py-theme-sm rounded-theme-md font-theme-medium transition-all duration-200"
            >
              Agregar
            </button>
          </div>

          {/* Mensajes de validación */}
          {error && (
            <p 
              className="text-theme-sm mt-2" 
              style={{ color: 'var(--color-error)' }}
            >
              {error}
            </p>
          )}
          {successMsg && (
            <p 
              className="text-theme-sm mt-2" 
              style={{ color: 'var(--color-success)' }}
            >
              {successMsg}
            </p>
          )}
        </div>

        {/* Columna derecha - Lista de documentos */}
        <div className="space-y-4">
          <label 
            className="block text-theme-sm text-secondary mb-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Documentos existentes
          </label>
          <div className="space-y-4">
            {docs.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-theme-md border rounded-theme-md"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)'
                }}
              >
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    <svg 
                      className="w-5 h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <span 
                    className="text-theme-sm truncate" 
                    style={{ color: 'var(--color-text)' }}
                  >
                    {doc.name}
                  </span>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                  {/* Descargar */}
                  <button
                    aria-label="Download Button"
                    type="button"
                    onClick={() => {
                      const url = URL.createObjectURL(doc.file);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = doc.file.name;
                      a.click();
                    }}
                    className="p-1 transition-colors duration-200 hover:bg-hover rounded-theme-sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'var(--color-hover)';
                      e.target.style.color = 'var(--color-text)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = 'var(--color-text-secondary)';
                    }}
                    title="Descargar"
                  >
                    <svg 
                      className="w-5 h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </button>
                  {/* Eliminar */}
                  <button
                    aria-label="Delete Button"
                    type="button"
                    onClick={() => handleDelete(index)}
                    className="p-1 transition-colors duration-200 hover:bg-hover rounded-theme-sm"
                    style={{ color: 'var(--color-error)' }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'var(--color-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                    title="Eliminar"
                  >
                    <svg 
                      className="w-5 h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}