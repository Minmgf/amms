"use client";
import LoginCard from "@/app/components/auth/LoginCard";
import Logo from "@/app/components/auth/Logo";
import React from "react";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { FaCheck } from "react-icons/fa";
import { completePreregister } from "@/services/authService";
import Link from "next/link";
import {
  SuccessModal,
  ErrorModal,
} from "@/app/components/shared/SuccessErrorModal";
import { useRouter } from "next/navigation";

const Page = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const password = watch("password", "");
  const password_confirmation = watch("password_confirmation", "");
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationToken, setValidationToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Verificar si hay token de validación
    const token = localStorage.getItem("validationToken");
    if (!token) {
      setModalMessage("No se encontró token de validación. Debe completar primero la validación de documento.");
      setErrorOpen(true);
      setTimeout(() => {
        router.push("/preregister");
      }, 3000);
      return;
    }
    setValidationToken(token);
  }, [router]);

  const validations = {
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    length: password.length >= 12,
  };

  const passwordsMatch =
    password && password_confirmation && password === password_confirmation;

  const onSubmit = async (data) => {
    if (!validationToken) {
      setModalMessage("Token de validación no disponible");
      setErrorOpen(true);
      return;
    }

    setLoading(true);

    try {
      // Incluir el token de validación en el payload
      const payload = {
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        token: validationToken
      };

      console.log("Enviando payload:", payload);

      const response = await completePreregister(payload);
      
      setModalMessage(
        response?.message || "Preregistro completado exitosamente. Verifica tu correo para activar tu cuenta."
      );
      setSuccessOpen(true);
      
      // Limpiar el token de validación
      localStorage.removeItem("validationToken");
      reset();
      
      setTimeout(() => {
        setSuccessOpen(false);
        router.push("/login");
      }, 3000);
      
    } catch (error) {
      console.error("Error en completePreregister:", error);
      
      let message = "Algo salió mal, intente de nuevo.";
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData.detail === "string") {
          message = errorData.detail;
        } else if (errorData.detail?.message) {
          message = errorData.detail.message;
        } else if (errorData.message) {
          message = errorData.message;
        } else if (typeof errorData === "string") {
          message = errorData;
        }
      } else if (error.message) {
        message = error.message;
      }
      
      setModalMessage(message);
      setErrorOpen(true);
      
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading mientras se verifica el token
  if (!validationToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Verificando token de validación...</div>
      </div>
    );
  }

  return (
    <>
      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Preregistro Exitoso"
        message={modalMessage}
      />
      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Preregistro Fallido"
        message={modalMessage}
      />
      <div
        className="relative min-h-screen w-full bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('./images/login-background.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center min-h-screen">
          <div className="flex flex-col items-center justify-center relative">
            <Logo variant="desktop" />
          </div>

          <LoginCard title="Completar Registro">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4 relative">
                <label
                  className="block text-white mb-3 text-md font-medium"
                  htmlFor="email"
                >
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  aria-label="Email Input"
                  {...register("email", { 
                    required: "El correo electrónico es obligatorio",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Formato de correo inválido",
                    }
                  })}
                  className="py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
                  placeholder="ejemplo@correo.com"
                />
                {errors.email && (
                  <span className="text-red-400 text-xs absolute left-0 -bottom-6">
                    {errors.email.message}
                  </span>
                )}
              </div>
              
              <div className="mb-4 relative">
                <label
                  className="block text-white mb-3 text-md font-medium"
                  htmlFor="new-password"
                >
                  Contraseña
                </label>
                <input
                  id="new-password"
                  type="password"
                  aria-label="Password Input"
                  {...register("password", { 
                    required: "La contraseña es obligatoria",
                    validate: () => Object.values(validations).every(Boolean) || "La contraseña no cumple con los requisitos"
                  })}
                  className="py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
                  placeholder="Ingrese su contraseña"
                />
                {Object.values(validations).every(Boolean) && (
                  <FaCheck className="absolute right-5 top-12 text-green-500" />
                )}
                {errors.password && (
                  <span className="text-red-400 text-xs absolute left-0 -bottom-6">
                    {errors.password.message}
                  </span>
                )}
              </div>
              
              <div className="mb-4 relative">
                <label
                  className="block text-white mb-3 text-md font-medium"
                  htmlFor="confirm-password"
                >
                  Confirmar contraseña
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  aria-label="Confirm Password Input"
                  {...register("password_confirmation", {
                    required: "La confirmación de contraseña es obligatoria",
                    validate: (value) => value === password || "Las contraseñas no coinciden",
                  })}
                  className="py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
                  placeholder="Confirme su contraseña"
                />
                {passwordsMatch && (
                  <FaCheck className="absolute right-5 top-12 text-green-500" />
                )}
                {errors.password_confirmation && (
                  <span className="text-red-400 text-xs absolute left-0 -bottom-6">
                    {errors.password_confirmation.message}
                  </span>
                )}
              </div>
              
              <div className="text-sm text-white mb-6">
                <p className="mb-2 font-semibold">
                  Por motivos de seguridad, su contraseña debe cumplir los siguientes
                  requisitos:
                </p>
                <p
                  className={
                    validations.upper ? "text-green-400" : "text-red-400"
                  }
                >
                  ✔ Debe incluir al menos una letra mayúscula (A-Z).
                </p>
                <p
                  className={
                    validations.lower ? "text-green-400" : "text-red-400"
                  }
                >
                  ✔ Debe incluir al menos una letra minúscula (a-z).
                </p>
                <p
                  className={
                    validations.number ? "text-green-400" : "text-red-400"
                  }
                >
                  ✔ Debe incluir al menos un número (0-9).
                </p>
                <p
                  className={
                    validations.length ? "text-green-400" : "text-red-400"
                  }
                >
                  ✔ Debe tener un mínimo de 12 caracteres.
                </p>
              </div>
              
              <button
                type="submit"
                aria-label="Send Button"
                disabled={
                  loading ||
                  !(Object.values(validations).every(Boolean) && passwordsMatch)
                }
                className={`w-full text-white py-2 mt-6 rounded-lg text-lg font-semibold shadow transition-colors
                  ${
                    loading ||
                    !(Object.values(validations).every(Boolean) && passwordsMatch)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-500 active:bg-red-700"
                  }
                `}
              >
                {loading ? "Procesando..." : "Completar Registro"}
              </button>
            </form>
            
            <div className="flex justify-center mt-6 gap-2 text-sm">
              <span className="text-white/80">¿Ya tienes una cuenta?</span>
              <Link
                href="/login"
                aria-label="Login Button"
                className="hover:underline font-bold text-white"
              >
                Inicia sesión
              </Link>
            </div>
          </LoginCard>
        </div>
      </div>
    </>
  );
};

export default Page;