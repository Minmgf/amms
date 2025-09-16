"use client";
import Link from "next/link";
import Cookies from "js-cookie";
import React, { useState, useEffect } from "react";
import { FaLock, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import Logo from "../../components/auth/Logo";
import LoginCard from "../../components/auth/LoginCard";
import { login } from "@/services/authService";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { usePermissions } from "@/contexts/PermissionsContext";
import {
  SuccessModal,
  ErrorModal,
} from "@/app/components/shared/SuccessErrorModal";

const Page = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const { loginSuccess } = usePermissions();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  function decodeToken(token) {
    try {
      const arrayToken = token.split(".");
      const tokenPayload = JSON.parse(atob(arrayToken[1]));
      return tokenPayload; // Aquí vienen todos los datos del token (claims)
    } catch (error) {
      console.error("Token inválido", error);
      return null;
    }
  }

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      router.replace("/home");
    } else {
      setLoading(false);
    }
  }, [router]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await login(data, data.rememberMe);
      const payload = decodeToken(response.access_token);
      
      // Guardar en localStorage
      localStorage.setItem("userData", JSON.stringify(payload));
      
      // Mostrar mensaje de éxito
      setModalMessage("Ha iniciado sesión correctamente.");
      setSuccessOpen(true);
      
      // Definir el redirect que se ejecutará después del procesamiento
      const handleRedirect = () => {
        setSuccessOpen(false);        
        if (payload.first_login_complete) {
          router.push("/home");
        } else {
          router.push("/editUser");
        }
      };
      
      // Procesar permisos Y pasar el callback para el redirect
      setTimeout(() => {
        loginSuccess(response.access_token, handleRedirect);
      }, 1000); // Dar tiempo para que se vea el modal de éxito
      
    } catch (error) {
      setModalMessage(error.response.data.detail || "Error al iniciar sesión");
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="relative min-h-screen bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('./images/login-background.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center min-h-screen">
          <div className="flex flex-col items-center justify-center relative">
            <Logo variant="desktop" />
          </div>

          <LoginCard title="Iniciar Sesión">
            <form
              className="space-y-5 w-[90%] md:w-[90%]"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    area-label="Email Input"
                    placeholder="Correo electrónico"
                    {...register("email", {
                      required: "El correo electrónico es obligatorio",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email format",
                      },
                    })}
                    className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 pl-12 pr-4 py-2 outline-none shadow focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="min-h-[20px]">
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type={showPassword ? "text" : "password"}
                    area-label="Password Input"
                    placeholder="Contraseña"
                    {...register("password", {
                      required: "La contraseña es obligatoria",
                    })}
                    className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 pl-12 pr-12 py-2 outline-none shadow focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    area-label="Show Password Button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <div className="min-h-[20px]">
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  area-label="Remember Me Checkbox"
                  {...register("rememberMe")}
                  className="h-4 w-4 rounded border-white/30 bg-black/30 accent-red-600"
                />
                <span className="text-white/90">Recuerdame</span>
              </label>

              <button
                type="submit"
                area-label="Login Button"
                disabled={loading}
                className={`w-full text-white py-2 mt-6 rounded-lg text-lg font-semibold shadow transition-colors
                  ${loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-500 active:bg-red-700"
                  }
                `}
              >
                Iniciar sesión
              </button>

              <div className="text-center mt-3">
                <Link
                  area-label="Forgot Password"
                  href="/passwordRecovery"
                  className="text-white/80 hover:text-white underline-offset-4 hover:underline"
                >
                  Olvidaste la contraseña?
                </Link>
              </div>
            </form>

            <div className="flex justify-center mt-6 gap-2 text-sm">
              <span className="text-white/80">Nuevo aquí?</span>
              <Link
                area-label="Signup"
                href="/preregister"
                className="hover:underline font-bold text-white"
              >
                Registrarse
              </Link>
            </div>
          </LoginCard>
        </div>
      </div>
      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="¡Bienvenido!"
        message={modalMessage}
      />
      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Autenticación Fallida"
        message={modalMessage}
      />
    </>
  );
};

export default Page;
