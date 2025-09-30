"use client";
import Link from "next/link";
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
import { getToken } from "@/utils/tokenManager";

const Page = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showResendActivation, setShowResendActivation] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
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
      return tokenPayload;
    } catch (error) {
      console.error("Token inválido", error);
      return null;
    }
  }

  useEffect(() => {
    // Usar la misma lógica que usa el interceptor de axios
    const token = getToken();
    if (token) {
      // Verificar si el token es válido antes de redirigir
      try {
        const payload = decodeToken(token);
        if (payload && payload.exp) {
          const currentTime = Math.floor(Date.now() / 1000);
          if (payload.exp > currentTime) {
            // Token válido, redirigir a home con el prefijo correcto
            router.replace("/home");
            return;
          }
        }
      } catch (error) {
        console.error("Error al verificar token:", error);
      }
      
      // Si llegamos aquí, el token no es válido, limpiarlo
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("userData");
    }
    
    setLoading(false);
  }, [router]);

  // Timer para cooldown del reenvío
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendActivation = async () => {
    if (resendCooldown > 0) return;

    try {
      // Aquí deberías llamar a tu endpoint de reenvío de activación
      // Por ejemplo: await resendActivationEmail({ email: resendEmail });

      setModalMessage(
        "Se ha reenviado el correo de activación. Por favor revisa tu bandeja de entrada."
      );
      setSuccessOpen(true);
      setResendCooldown(60); // 60 segundos de cooldown
      setShowResendActivation(false);
    } catch (error) {
      setModalMessage("Error al reenviar el correo de activación.");
      setErrorOpen(true);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await login(data, data.rememberMe);
      const payload = decodeToken(response.access_token);

      // Guardar en localStorage
      localStorage.setItem("userData", JSON.stringify(payload));
      localStorage.setItem("token", response.access_token);

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
      }, 1000);
    } catch (error) {
      const errorData = error.response?.data;
      const statusCode = error.response?.status;

      // Extraer el mensaje de error correctamente
      let errorMessage = "Error al iniciar sesión";

      if (errorData) {
        // Si errorData.detail existe y es un objeto con message
        if (
          errorData.detail &&
          typeof errorData.detail === "object" &&
          errorData.detail.message
        ) {
          errorMessage = errorData.detail.message;
        }
        // Si errorData.detail es un string
        else if (errorData.detail && typeof errorData.detail === "string") {
          errorMessage = errorData.detail;
        }
        // Si errorData es un string directamente
        else if (typeof errorData === "string") {
          errorMessage = errorData;
        }
        // Si hay message en el nivel superior
        else if (errorData.message) {
          errorMessage = errorData.message;
        }
        // Fallback para otros casos
        else if (typeof errorData === "object") {
          errorMessage = errorData.error || JSON.stringify(errorData);
        }
      }

      // Convertir errorMessage a string si no lo es
      const errorString =
        typeof errorMessage === "string" ? errorMessage : String(errorMessage);

      // Manejar específicamente el caso de cuenta no activada
      if (statusCode === 401) {
        const lowerErrorString = errorString.toLowerCase();

        if (
          lowerErrorString.includes("activada") ||
          lowerErrorString.includes("activation")
        ) {
          setModalMessage(errorString); // Usar el mensaje exacto del servidor
          setResendEmail(data.email);
          setShowResendActivation(true);
        } else if (lowerErrorString.includes("pendiente")) {
          setModalMessage(
            "Tu cuenta está pendiente de activación. Por favor revisa tu correo electrónico."
          );
          setResendEmail(data.email);
          setShowResendActivation(true);
        } else {
          setModalMessage(errorString);
          setShowResendActivation(false);
        }
      } else {
        setModalMessage(errorString);
        setShowResendActivation(false);
      }

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
                    aria-label="Email Input"
                    placeholder="Correo electrónico"
                    {...register("email", {
                      required: "El correo electrónico es obligatorio",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Formato de correo inválido",
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
                    aria-label="Password Input"
                    placeholder="Contraseña"
                    {...register("password", {
                      required: "La contraseña es obligatoria",
                    })}
                    className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 pl-12 pr-12 py-2 outline-none shadow focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    aria-label="Show Password Button"
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
                  aria-label="Remember Me Checkbox"
                  {...register("rememberMe")}
                  className="h-4 w-4 rounded border-white/30 bg-black/30 accent-red-600"
                />
                <span className="text-white/90">Recuérdame</span>
              </label>

              <button
                type="submit"
                aria-label="Login Button"
                disabled={loading}
                className={`w-full text-white py-2 mt-6 rounded-lg text-lg font-semibold shadow transition-colors
                  ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-500 active:bg-red-700"
                  }
                `}
              >
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>

              <div className="text-center mt-3">
                <Link
                  aria-label="Forgot Password"
                  href="/passwordRecovery"
                  className="text-white/80 hover:text-white underline-offset-4 hover:underline"
                >
                  ¿Olvidaste la contraseña?
                </Link>
              </div>
            </form>

            <div className="flex justify-center mt-6 gap-2 text-sm">
              <span className="text-white/80">¿Nuevo aquí?</span>
              <Link
                aria-label="Signup"
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
        onClose={() => {
          setErrorOpen(false);
        }}
        title="Autenticación Fallida"
        message={modalMessage}
        footer={
          showResendActivation && (
            <div className="mt-4 text-center">
              <button
                onClick={handleResendActivation}
                disabled={resendCooldown > 0}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors
                  ${
                    resendCooldown > 0
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-500"
                  }
                `}
              >
                {resendCooldown > 0
                  ? `Reenviar en ${resendCooldown}s`
                  : "Reenviar correo de activación"}
              </button>
            </div>
          )
        }
      />
    </>
  );
};

export default Page;
