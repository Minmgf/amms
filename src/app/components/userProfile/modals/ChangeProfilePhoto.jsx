"use client";
import { useRef } from "react";

export default function ProfilePhotoModal({ onClose }) {
  const fileInputRef = useRef(null);

  const handleChooseFile = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Imagen seleccionada:", file.name);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative">
        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-lg"
        >
          ✕
        </button>

        {/* Título */}
        <h2 className="text-lg text-black font-semibold mb-6">
          Change profile photo
        </h2>

        {/* Vista previa */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-30 h-20 bg-[#F5F5F5] border border-[#d7d7d7] rounded-lg flex flex-col items-center justify-center text-xs text-gray-500">
            <span className="text-lg text-gray-400 mb-1">＋</span>
            <span className="text-center">Current photo</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-black mb-2">Preview</h3>
            <p className="text-xs text-gray-500">
              This will be your new profile picture. Make sure it looks good
              before saving.
            </p>
          </div>
        </div>

        {/* Área de drag & drop */}
        <div className="border-2 border-[#d7d7d7] rounded-xl p-8 text-center flex flex-col items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-red-500 flex items-center justify-center mb-3">
            <span className="text-red-500 text-2xl">＋</span>
          </div>
          <p className="text-red-500 font-medium">Drag your photo here</p>
          <p className="text-sm text-gray-500 mb-3">
            or click to select a file
          </p>
          
          {/* Botón personalizado */}
          <button
            type="button"
            onClick={handleChooseFile}
            className="px-5 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700"
          >
            Choose file
          </button>

          {/* Input oculto */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Texto formatos */}
        <p className="text-xs text-gray-400 text-center mb-6">
          Allowed formats: JPG, PNG (max. 5MB)
        </p>

        {/* Botones */}
        <div className="flex justify-between gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700"
          >
            Cancel
          </button>
          <button className="flex-1 px-6 py-2 bg-[#757575] text-white rounded-md font-medium hover:bg-gray-400">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
