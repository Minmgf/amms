import { useFormContext } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { createMachineryDoc, getMachineryDocs, downloadMachineryDoc, deleteMachineryDoc } from "@/services/machineryService";

export default function Step6UploadDocs({ machineryId }) {
  const { register, formState: { errors }, setValue, watch, getValues } = useFormContext();
  const [existingDocs, setExistingDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [creatingDoc, setCreatingDoc] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState(null);
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

  // Cargar documentos existentes cuando se monta el componente o cambia machineryId
  useEffect(() => {
    const loadExistingDocs = async () => {
      if (!machineryId) return;
      
      try {
        setLoadingDocs(true);
        const response = await getMachineryDocs(machineryId);
        const documents = response.data || response || [];        
        
        setExistingDocs(documents);
      } catch (error) {
        console.error('Error cargando documentos:', error);
        setError('Error al cargar documentos existentes');
        setTimeout(() => setError(''), 3000);
      } finally {
        setLoadingDocs(false);
      }
    };

    loadExistingDocs();
  }, [machineryId]);

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

  // Función para agregar documento usando el endpoint
  const handleAdd = async () => {
    const name = getValues("documentName");
    const file = getValues("file");

    if (!name) {
      setError("El nombre del documento es obligatorio");
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (!file) {
      setError("Debe seleccionar un archivo");
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (!machineryId) {
      setError("ID de maquinaria no disponible");
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Formato no permitido. Solo PDF, JPG o PNG.");
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("El archivo supera el tamaño máximo permitido (8MB).");
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setCreatingDoc(true);
      setError('');
      
      // Crear FormData para el endpoint
      const formData = new FormData();
      formData.append('document', name);
      formData.append('machinery', machineryId);
      
      // Obtener usuario responsable de localStorage
      const storedUser = localStorage.getItem("userData");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        formData.append('responsible_user', parsed.id);
      }
      
      formData.append('file', file);

      const response = await createMachineryDoc(formData);
      
      // Verificar respuesta de éxito del backend
      if (response.status === "success") {
        // Limpiar formulario
        setValue("documentName", "");
        setValue("file", null);
        setPreviewFile(null);
        setFileName("");
        setFileSize("");
        
        setSuccessMsg(response.message || "Documento creado exitosamente");
        setTimeout(() => setSuccessMsg(''), 3000);
        
        // Recargar lista de documentos
        const docsResponse = await getMachineryDocs(machineryId);
        setExistingDocs(docsResponse.data || docsResponse || []);
      } else {
        // Manejar respuesta de error del backend
        if (response.errors) {
          const errorMessages = Object.entries(response.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
          setError(errorMessages);
        } else {
          setError(response.message || 'Error al crear el documento');
        }
        setTimeout(() => setError(''), 5000);
      }
      
    } catch (error) {
      console.error('Error creando documento:', error);
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.status === "error") {
          if (errorData.errors) {
            // Buscar errores de nombre duplicado y convertir a mensaje claro
            const hasUniqueError = errorData.errors.non_field_errors?.some(msg => 
              msg.includes('unique set') || msg.includes('must make a unique set')
            );
            
            if (hasUniqueError) {
              setError('Ya existe un documento con este nombre para esta maquinaria. Por favor, use un nombre diferente.');
            } else {
              const errorMessages = Object.entries(errorData.errors)
                .filter(([field]) => field !== 'non_field_errors')
                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                .join('; ');
              setError(errorMessages || 'Error en los datos ingresados');
            }
          } else {
            setError(errorData.message || 'Datos de entrada inválidos');
          }
        } else {
          setError(errorData.message || 'Error al crear el documento');
        }
      } else {
        setError('Error de conexión al crear el documento');
      }
      setTimeout(() => setError(''), 5000);
    } finally {
      setCreatingDoc(false);
    }
  };

  // Función para descargar documento
  const handleDownload = async (documentId, documentName) => {
    if (!documentId) {
      setError('ID de documento no válido para descarga');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setError("");
      
      const data = await downloadMachineryDoc(documentId);
      
      if (data.status === "success" && data.data && data.data.path) {
        const fileUrl = data.data.path;
        const fileName = data.data.document || documentName || `documento_${documentId}`;
        
        window.open(fileUrl, '_blank');
        
        setSuccessMsg("Descarga iniciada - Se abrirá en nueva ventana");
        setTimeout(() => setSuccessMsg(""), 3000);
        
      } else {
        setError("No se pudo obtener la URL del documento");
        setTimeout(() => setError(""), 3000);
      }
      
    } catch (error) {
      console.error('Error descargando el archivo:', error);
      setError('Error al descargar el documento. Por favor, inténtelo de nuevo.');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Función para eliminar documento
  const handleDeleteDoc = async (documentId) => {
    if (!documentId) {
      setError('ID de documento no válido');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    try {
      setDeletingDoc(documentId);
      const response = await deleteMachineryDoc(documentId);
      
      // Verificar respuesta de éxito
      if (response.status === "success") {
        // Actualizar lista de documentos - filtrar usando todos los posibles campos de ID
        setExistingDocs(existingDocs.filter(doc => {
          const docId = doc.id || doc.id_machinery_documentation || doc.document_id;
          return docId !== documentId;
        }));
        setSuccessMsg(response.message || 'Documento eliminado exitosamente');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        // Manejar respuesta de error
        setError(response.message || 'Error al eliminar el documento');
        setTimeout(() => setError(''), 3000);
      }
      
    } catch (error) {
      console.error('Error eliminando documento:', error);
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.status === "error") {
          if (errorData.errors) {
            const errorMessages = Object.entries(errorData.errors)
              .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
              .join('; ');
            setError(errorMessages);
          } else {
            setError(errorData.message || 'Error al eliminar el documento');
          }
        } else {
          setError(errorData.message || 'Error al eliminar el documento');
        }
      } else {
        setError('Error de conexión al eliminar el documento');
      }
      setTimeout(() => setError(''), 3000);
    } finally {
      setDeletingDoc(null);
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

          {/* Botón Agregar */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleAdd}
              disabled={creatingDoc || !getValues("documentName") || !getValues("file")}
              className="btn-theme btn-primary text-theme-sm px-theme-lg py-theme-md rounded-theme-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingDoc ? "Agregando..." : "Agregar"}
            </button>
          </div>
        </div>

        {/* Columna derecha - Documentos existentes */}
        <div className="space-y-4">
          <label 
            className="block text-theme-sm text-secondary mb-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Documentos existentes
          </label>
          
          {loadingDocs ? (
            <div className="text-center py-8">
              <p 
                className="text-theme-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Cargando documentos...
              </p>
            </div>
          ) : existingDocs.length === 0 ? (
            <div className="text-center py-8">
              <p 
                className="text-theme-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {machineryId ? "No hay documentos existentes" : "No hay maquinaria seleccionada"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {existingDocs.map((doc, index) => {
                // Obtener el ID del documento - puede venir como 'id', 'id_machinery_documentation', etc.
                const documentId = doc.id_machinery_documentation || doc.id || doc.document_id;
                const documentName = doc.document || doc.name || doc.document_name || 'Documento sin nombre';
                
                return (
                  <div 
                    key={documentId || index}
                    className="border rounded-theme-lg p-theme-md"
                    style={{
                      borderColor: 'var(--color-border)',
                      backgroundColor: 'var(--color-surface)'
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p 
                          className="text-theme-sm font-theme-medium truncate"
                          style={{ color: 'var(--color-text)' }}
                          title={documentName}
                        >
                          {documentName}
                        </p>
                        {doc.file && (
                          <p 
                            className="text-theme-xs"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {doc.file.split('/').pop()}
                          </p>
                        )}
                        {doc.created_at && (
                          <p 
                            className="text-theme-xs"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDownload(documentId, documentName)}
                          disabled={!documentId}
                          className="btn-theme btn-secondary text-theme-xs px-theme-sm py-theme-xs rounded-theme-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Descargar documento"
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
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(documentId)}
                          disabled={deletingDoc === documentId || !documentId}
                          className="btn-theme btn-error text-theme-xs px-theme-sm py-theme-xs rounded-theme-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Eliminar documento"
                        >
                          {deletingDoc === documentId ? (
                          <svg 
                            className="w-4 h-4 animate-spin" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        ) : (
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}