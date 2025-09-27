"use client";
import {
  SuccessModal,
  ErrorModal,
} from "@/app/components/shared/SuccessErrorModal";
import React, { useEffect, useState } from "react";
import Logo from "../../components/auth/Logo";
import LoginCard from "../../components/auth/LoginCard";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { validateDocument, getTypeDocuments } from "@/services/authService";
import Link from "next/link";

const Page = () => {
  const [identificationTypes, setIdentificationTypes] = useState([]);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const response = await getTypeDocuments();
        setIdentificationTypes(response.data);
      } catch (error) {
        console.error("Error al cargar tipos de documento:", error);
        setModalMessage("Error al cargar los tipos de documento. Intente recargar la página.");
        setErrorOpen(true);
      }
    };
    fetchDocumentTypes();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      const payload = {
        document_type_id: parseInt(data.selectedType), // Asegurar que sea un número
        document_number: data.identificationNumber,
        date_issuance_document: data.issueDate,
      };

      console.log("Enviando payload de validación:", payload);

      const response = await validateDocument(payload);
      
      // Guardar el token de validación
      localStorage.setItem("validationToken", response.token);
      
      setModalMessage(response.message || "Documento validado exitosamente");
      setSuccessOpen(true);
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        setSuccessOpen(false);
        router.push("/completeRegister");
      }, 2000);

    } catch (error) {
      console.error("Error al validar documento:", error);
      
      let errorMessage = "Error al validar documento";
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData.detail === "string") {
          errorMessage = errorData.detail;
        } else if (errorData.detail?.message) {
          errorMessage = errorData.detail.message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setModalMessage(errorMessage);
      setErrorOpen(true);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('./images/login-background.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center min-h-screen">
        <div className="flex flex-col items-center justify-center relative">
          <Logo variant="desktop" />
        </div>

        <LoginCard title="Registrarse">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 w-full">
              <div className="w-full sm:w-auto">
                <select
                  aria-label="Identification Type Select"
                  {...register("selectedType", { required: "Seleccione un tipo de identificación" })}
                  className="h-10 py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-2 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
                  disabled={loading}
                >
                  <option value="">Seleccione un tipo</option>
                  {identificationTypes.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name}
                    </option>
                  ))}
                </select>
                {errors.selectedType && (
                  <p className="text-red-500 text-sm mt-1">{errors.selectedType.message}</p>
                )}
              </div>

              <div className="w-full sm:w-auto">
                <input
                  type="text"
                  aria-label="Identification Number Input"
                  placeholder="Número de identificación"
                  disabled={loading}
                  {...register("identificationNumber", {
                    required: "El número de identificación es obligatorio",
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "El número de identificación debe ser numérico",
                    },
                    minLength: {
                      value: 6,
                      message: "El número debe tener al menos 6 dígitos"
                    }
                  })}
                  className="h-10 py-2 px-4 rounded-lg border border-gray-300 bg-white text-black w-full outline-none shadow focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {errors.identificationNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.identificationNumber.message}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="issueDate"
                className="block text-sm font-medium text-white mb-1"
              >
                Fecha de expedición
              </label>
              <input
                id="issueDate"
                aria-label="Issue Date Input"
                type="date"
                disabled={loading}
                {...register("issueDate", {
                  required: "La fecha de expedición es obligatoria",
                  validate: (value) => {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    const minDate = new Date();
                    minDate.setFullYear(minDate.getFullYear() - 100); // Hace 100 años
                    
                    if (selectedDate > today) {
                      return "La fecha de expedición no puede ser futura";
                    }
                    if (selectedDate < minDate) {
                      return "La fecha de expedición no puede ser tan antigua";
                    }
                    return true;
                  },
                })}
                max={new Date().toISOString().split('T')[0]} // Prevenir fechas futuras
                className="h-10 py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 w-full outline-none shadow focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {errors.issueDate && (
                <p className="text-red-500 text-sm">{errors.issueDate.message}</p>
              )}
            </div>

            <button
              aria-label="Continue Button"
              type="submit"
              disabled={loading}
              className={`w-full text-white py-2 mt-6 rounded-lg text-lg font-semibold shadow transition-colors
                ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-500 active:bg-red-700"
                }
              `}
            >
              {loading ? "Validando..." : "Continuar"}
            </button>
          </form>

          <p className="text-sm text-gray-300 mt-6 text-center">
            ¿Ya tiene una cuenta activa?{" "}
            <Link
              aria-label="Login Button"
              href="/login"
              className="hover:underline font-bold text-white"
            >
              Inicie sesión aquí
            </Link>
          </p>
        </LoginCard>
        
        <SuccessModal
          isOpen={successOpen}
          onClose={() => setSuccessOpen(false)}
          title="Validación Exitosa"
          message={modalMessage}
        />
        <ErrorModal
          isOpen={errorOpen}
          onClose={() => setErrorOpen(false)}
          title="Validación Fallida"
          message={modalMessage}
        />
      </div>
    </div>
  );
};

export default Page;