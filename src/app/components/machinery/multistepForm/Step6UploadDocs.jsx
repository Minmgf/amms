// Step6UploadDocs.jsx
import { useFormContext } from "react-hook-form";
import { useState } from "react";
import { Trash2, Download, FileText } from "lucide-react";

export default function Step6UploadDocs() {
  const { register, setValue, getValues } = useFormContext();
  const [docs, setDocs] = useState([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const MAX_SIZE = 8 * 1024 * 1024; // 8MB
  const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

  const handleAdd = () => {
    const name = getValues("documentName");
    const file = getValues("file");

    if (!name) {
      setError("El nombre del documento es obligatorio");
      return;
    }
    if (!file || file.length === 0) {
      setError("Debe seleccionar un archivo");
      return;
    }

    const selectedFile = file[0];
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError("Formato no permitido. Solo PDF, JPG o PNG.");
      return;
    }
    if (selectedFile.size > MAX_SIZE) {
      setError("El archivo supera el tamaño máximo permitido (8MB).");
      return;
    }

    const newDoc = { name, file: selectedFile };
    setDocs([...docs, newDoc]);

    setValue("documentName", "");
    setValue("file", null);
    setError("");
    setSuccessMsg("Documento agregado correctamente ✅");
  };

  const handleDelete = (index) => {
    setDocs(docs.filter((_, i) => i !== index));
  };

  return (
    <div>
      {/* Título */}
      <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-black">
        Subir Documentación
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Columna izquierda */}
        <div className="space-y-4">
          {/* Nombre del documento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del documento
            </label>
            <input
              {...register("documentName")}
              placeholder="Ingrese el nombre del documento"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none 
                         focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Selector de archivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo
            </label>
            <div className="w-full border-2 border-dashed border-gray-300 rounded-md p-4 md:p-6 
                            flex flex-col items-center justify-center text-gray-500 cursor-pointer 
                            hover:border-red-500 hover:text-red-500 transition min-h-[120px]">
              <input
                type="file"
                {...register("file")}
                className="hidden"
                id="fileUpload"
              />
              <label htmlFor="fileUpload" className="flex flex-col items-center cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 8l-3-3m3 3l3-3" />
                </svg>
                <span>Seleccione o arrastre un archivo</span>
                <span className="text-xs mt-1">Máx: 8MB • PDF, JPG, PNG</span>
              </label>
            </div>
          </div>

          {/* Botón Agregar */}
          <button
            type="button"
            onClick={handleAdd}
            className="mt-3 w-full sm:w-auto px-4 md:px-6 py-2 bg-gray-200 text-gray-700 rounded-md font-medium 
                       hover:bg-gray-300 transition text-sm md:text-base"
          >
            Agregar
          </button>

          {/* Mensajes de validación */}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {successMsg && <p className="text-green-600 text-sm mt-2">{successMsg}</p>}
        </div>

        {/* Columna derecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Documentos existentes
          </label>
          <div className="space-y-3">
            {docs.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 md:px-4 py-2 border border-gray-200 
                           rounded-md bg-gray-50"
              >
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <FileText className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0" />
                  <span className="text-xs md:text-sm text-gray-700 truncate">{doc.name}</span>
                </div>
                <div className="flex space-x-2 md:space-x-3 flex-shrink-0">
                  {/* Descargar */}
                  <button
                    type="button"
                    onClick={() => {
                      const url = URL.createObjectURL(doc.file);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = doc.file.name;
                      a.click();
                    }}
                    className="text-gray-500 hover:text-black p-1"
                    title="Descargar"
                  >
                    <Download className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  {/* Eliminar */}
                  <button
                    type="button"
                    onClick={() => handleDelete(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
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
