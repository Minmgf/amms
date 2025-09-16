"use client";
import LoginCard from "@/app/components/auth/LoginCard";
import Logo from "@/app/components/auth/Logo";
import React from "react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { completePreregister } from "@/services/authService";
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
  const router = useRouter();
  const validations = {
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    length: password.length >= 12,
  };

  const passwordsMatch =
    password && password_confirmation && password === password_confirmation;

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const token = localStorage.getItem("validationToken");
      if (!token) {
        setModalMessage("Token inválido o expirado");
        setErrorOpen(true);
        return;
      }
      const response = await completePreregister({ ...data, token });
      setModalMessage(
        response?.message || "Preregistro completado exitosamente"
      );
      setSuccessOpen(true);
      localStorage.removeItem("validationToken");
      reset();
      setTimeout(() => {
        setSuccessOpen(false);
        router.push("/login");
      }, 2000);
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.message ||
        "Algo salió mal, intente de nuevo.";
      setModalMessage(message);
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

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

          <LoginCard title="Registrarse">
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
                  area-label="Email Input"
                  {...register("email", { required: true })}
                  className="py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
                  placeholder="sigma1999@email.com"
                />
                {errors.email && (
                  <span className="text-red-400 text-xs absolute left-0 -bottom-6">
                    Este campo es obligatorio.
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
                  area-label="Password Input"
                  {...register("password", { required: true })}
                  className="py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
                  placeholder="Sigma1999"
                />
                {Object.values(validations).every(Boolean) && (
                  <FaCheck className="absolute right-5 top-12 text-green-500" />
                )}
                {errors.password && (
                  <span className="text-red-400 text-xs absolute left-0 -bottom-6">
                    Este campo es requerido
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
                  area-label="Confirm Password Input"
                  {...register("password_confirmation", {
                    required: true,
                    validate: (value) => value === password,
                  })}
                  className="py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
                  placeholder="Sigma1999"
                />
                {passwordsMatch && (
                  <FaCheck className="absolute right-5 top-12 text-green-500" />
                )}
                {errors.password_confirmation && (
                  <span className="text-red-400 text-xs absolute left-0 -bottom-6">
                    {errors.password_confirmation.type === "validate"
                      ? "Las contraseñas no coinciden"
                      : "Este campo es requerido"}
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
                  ✔ Debe uncluir al menos un aletra minúscula (a-z).
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
                area-label="Send Button"
                disabled={
                  loading ||
                  !(Object.values(validations).every(Boolean) && passwordsMatch)
                }
                className="w-full text-white py-2 mt-6 rounded-lg bg-red-600 text-lg font-semibold shadow hover:bg-red-500 active:bg-red-700 transition-colors"
              >
                Enviar
              </button>
            </form>
          </LoginCard>
        </div>
      </div>
    </>
  );
};

export default Page;
