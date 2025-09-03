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
        response?.message || "Preregister completed successfully"
      );
      setSuccessOpen(true);
      localStorage.removeItem("validationToken");
      reset();
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.message ||
        "Something went wrong. Please try again.";
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
        title="Preregister Successful"
        message={modalMessage}
      />
      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Preregister Failed"
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

          <LoginCard title="Sign Up">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4 relative">
                <label
                  className="block text-white mb-3 text-md font-medium"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email", { required: true })}
                  className="py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
                  placeholder="sigma1999@email.com"
                />
                {errors.email && (
                  <span className="text-red-400 text-xs absolute left-0 -bottom-6">
                    Este campo es requerido
                  </span>
                )}
              </div>
              <div className="mb-4 relative">
                <label
                  className="block text-white mb-3 text-md font-medium"
                  htmlFor="new-password"
                >
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
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
                  Confirm new password
                </label>
                <input
                  id="confirm-password"
                  type="password"
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
                  For security reasons, your password must meet the following
                  requirements:
                </p>
                <p
                  className={
                    validations.upper ? "text-green-400" : "text-red-400"
                  }
                >
                  ✔ Include at least one capital letter (A-Z).
                </p>
                <p
                  className={
                    validations.lower ? "text-green-400" : "text-red-400"
                  }
                >
                  ✔ Include at least one lowercase letter (a-z).
                </p>
                <p
                  className={
                    validations.number ? "text-green-400" : "text-red-400"
                  }
                >
                  ✔ Include at least one number (0-9).
                </p>
                <p
                  className={
                    validations.length ? "text-green-400" : "text-red-400"
                  }
                >
                  ✔ Have a minimum of 12 characters.
                </p>
              </div>
              <button
                type="submit"
                disabled={
                  loading ||
                  !(Object.values(validations).every(Boolean) && passwordsMatch)
                }
                className="w-full text-white py-2 mt-6 rounded-lg bg-red-600 text-lg font-semibold shadow hover:bg-red-500 active:bg-red-700 transition-colors"
              >
                Send
              </button>
            </form>
          </LoginCard>
        </div>
      </div>
    </>
  );
};

export default Page;
