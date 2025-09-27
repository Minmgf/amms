"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FaCheck, FaEye, FaEyeSlash } from "react-icons/fa";
import { useParams, useRouter } from "next/navigation";
import { recoverPassword } from "@/services/authService";
import {
  SuccessModal,
  ErrorModal,
} from "@/app/components/shared/SuccessErrorModal";

const Page = () => {
  const { token } = useParams();
  const router = useRouter();
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const validations = {
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    length: password.length >= 12,
  };

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const onSubmit = async (data) => {
    setLoading(true);
    const payload = {
      new_password: data.password,
      confirm_password: data.confirmPassword,
    };
    try {
      const response = await recoverPassword(token, payload);
      setModalMessage(response.message || "Recuperación exitosa");
      setSuccessOpen(true);
      setTimeout(() => {
        setSuccessOpen(false);
        router.push("/login");
      }, 2000);

    } catch (error) {
      console.log(error);
      setModalMessage(error.response.data.detail);
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/sigma/images/singup-background.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative z-10 bg-black/60 text-white rounded-2xl shadow-2xl w-full max-w-3xl py-10 px-16 flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-center mb-10">Restablecer Contraseña</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-8 relative">
            <label className="block text-white mb-3 text-md font-medium" htmlFor="new-password">
              Nueva contraseña
            </label>
            <input
              id="new-password"
              aria-label="New Password Input"
              type={showPassword ? "text" : "password"}
              {...register("password", { required: true })}
              className="py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
              placeholder="Sigma1999"
            />
            <button
              aria-label="Show Password Button"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-10 top-12 text-gray-600 hover:text-gray-800"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {Object.values(validations).every(Boolean) && (
              <FaCheck className="absolute right-5 top-12 text-green-500" />
            )}
            {errors.password && (
              <span className="text-red-400 text-xs absolute left-0 -bottom-6">Este campo es requerido</span>
            )}
          </div>
          <div className="mb-8 relative">
            <label className="block text-white mb-3 text-md font-medium" htmlFor="confirm-password">
              Confirmar nueva contraseña
            </label>
            <input
              id="confirm-password"
              aria-label="Confirm New Password Input"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword", {
                required: true,
                validate: (value) => value === password
              })}
              className="py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
              placeholder="Sigma1999"
            />
            <button
              type="button"
              aria-label="Show Confirm Password Button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-10 top-12 text-gray-600 hover:text-gray-800"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {passwordsMatch && (
              <FaCheck className="absolute right-5 top-12 text-green-500" />
            )}
            {errors.confirmPassword && (
              <span className="text-red-400 text-xs absolute left-0 -bottom-6">
                {errors.confirmPassword.type === "validate"
                  ? "Las contraseñas no coinciden"
                  : "Este campo es requerido"}
              </span>
            )}
          </div>
          <div className="text-sm text-white mb-6">
            <p className="mb-2 font-semibold">Por motivos de seguridad, su contraseña debe cumplir los siguientes requisitos:</p>
            <p className={validations.upper ? "text-green-400" : "text-red-400"}>✔ Debe incluir al menos una letra mayúscula (A-Z).</p>
            <p className={validations.lower ? "text-green-400" : "text-red-400"}>✔ Debe incluir al menos una letra minúscula (a-z).</p>
            <p className={validations.number ? "text-green-400" : "text-red-400"}>✔ Debe incluir al menos un número (0-9).</p>
            <p className={validations.length ? "text-green-400" : "text-red-400"}>✔ Debe tener un mínimo de 12 caracteres.</p>
          </div>
          <button
            aria-label="Send Button"
            type="submit"
            disabled={!(Object.values(validations).every(Boolean) && passwordsMatch) || loading}
            className="w-full text-white py-2 mt-6 rounded-lg bg-red-600 text-lg font-semibold shadow hover:bg-red-500 active:bg-red-700 transition-colors"
          >
            Enviar
          </button>
        </form>
        <SuccessModal
          isOpen={successOpen}
          onClose={() => setSuccessOpen(false)}
          title="Restablecimiento exitoso"
          message={modalMessage}
        />
        <ErrorModal
          isOpen={errorOpen}
          onClose={() => setErrorOpen(false)}
          title="Restablecimiento Fallido"
          message={modalMessage}
        />
      </div>
    </div>
  );
};

export default Page;
