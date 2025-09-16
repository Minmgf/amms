import React, { useState, useRef, useEffect } from "react";
import { AiOutlineClose, AiOutlinePlus } from "react-icons/ai";
import { HiOutlineUpload } from "react-icons/hi";
import { useForm } from "react-hook-form";
import { changeProfilePhoto, getUserData } from "@/services/profileService";
import { SuccessModal, ErrorModal } from "../../shared/SuccessErrorModal";

const ChangePhotoModal = ({ isOpen, onClose, onSave }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [id, setId] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // hook form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm();

  const selectedFile = watch("photo"); // campo controlado por hook-form

  // Arrastrar y soltar
  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    
    if (file) {
      // Validar formato de imagen (JPG, PNG)
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setModalMessage("Only JPG and PNG formats are allowed");
        setErrorOpen(true);
        return;
      }
      
      // Validar tamaño de archivo (5MB = 5 * 1024 * 1024 bytes)
      if (file.size > 5 * 1024 * 1024) {
        setModalMessage("The image size must be less than 5MB");
        setErrorOpen(true);
        return;
      }
      
      setValue("photo", file, { shouldValidate: true });
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setId(userData.id);
      } catch (err) {
        console.error("Error parsing userData", err);
      }
    }
  }, []);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("profile_picture", data.photo);

      const response = await changeProfilePhoto(id, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Obtener usuario actualizado
      const userResponse = await getUserData(id);
      const newPhotoUrl = userResponse.data[0]?.profile_picture || null;

      if (newPhotoUrl) {
        localStorage.setItem("userPhoto", newPhotoUrl);
        window.dispatchEvent(new Event("userPhotoChanged"));
        onSave?.(newPhotoUrl);
      }
      reset();
      setPreviewUrl(null);
      setModalMessage(response.data);
      setSuccessOpen(true);
      setTimeout(() => {
        setSuccessOpen(false);
        onClose();
      }, 2000);
      await getData(id);
    } catch (error) {
      setModalMessage(error.response.data.detail);
      setErrorOpen(true);
    }
  };

  const handleClose = () => {
    reset();
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div id="change-photo-modal" className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md"
             style={{ zIndex: 70 }}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              Cambiar foto de perfil
            </h2>
            <button
              area-label="Close Button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <AiOutlineClose className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6 space-y-6">
              {/* Preview Section */}
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <AiOutlinePlus className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Vista previa</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Esta será tu nueva foto de perfil. Asegúrate de que se vea
                    bien antes de guardarla.
                  </p>
                </div>
              </div>

              {/* Upload Area */}
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <HiOutlineUpload className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-red-600 mb-1">
                      Arrastra tu foto aquí
                    </p>
                    <p className="text-sm text-gray-500">
                      o haga clic para seleccionar un archivo
                    </p>
                  </div>
                  <button
                    area-label="Choose File Button"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
                  >
                    Seleccionar archivo
                  </button>
                </div>
              </div>

              {/* File Info */}
              <p className="text-xs text-gray-500 text-center">
                Formatos permitidos: JPG, PNG (max. 5MB)
              </p>

              {/* Hidden File Input */}
              <input
                area-label="Hidden File Input"
                type="file"
                accept="image/jpeg,image/png"
                {...register("photo", {
                  required: true,
                  onChange: (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Validar formato de imagen (JPG, PNG)
                      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
                        setModalMessage("Only JPG and PNG formats are allowed");
                        setErrorOpen(true);
                        // Limpiar el input
                        e.target.value = "";
                        return;
                      }
                      
                      // Validar tamaño de archivo (5MB = 5 * 1024 * 1024 bytes)
                      if (file.size > 5 * 1024 * 1024) {
                        setModalMessage("The image size must be less than 5MB");
                        setErrorOpen(true);
                        // Limpiar el input
                        e.target.value = "";
                        return;
                      }
                      
                      setValue("photo", file, { shouldValidate: true });
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  },
                })}
                ref={(e) => {
                  fileInputRef.current = e;
                }}
                className="hidden"
              />

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  area-label="Cancel Button"
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  area-label="Save Button"
                  type="submit"
                  disabled={!selectedFile || isSubmitting}
                  className="flex-1 px-4 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Successfully Completed"
        message={modalMessage}
      />
      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Error Submitting data"
        message={modalMessage}
      />
    </>
  );
};

export default ChangePhotoModal;