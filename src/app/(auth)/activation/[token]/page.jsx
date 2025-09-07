"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Logo from "../../../components/auth/Logo";
import { useParams } from "next/navigation";
import { activateAccount } from "@/services/authService";
import { AiOutlineCloseCircle } from "react-icons/ai";

const page = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return; // token aún no está disponible
    console.log("Token recibido:", token);

    const activate = async () => {
      try {
        const data = await activateAccount(token);
        console.log("Activación exitosa:", data);
        setStatus("success");
        setMessage(data.message || "Cuenta activada correctamente");
      } catch (error) {
        console.error("Error activando cuenta:", error);
        setStatus("error");
        setMessage(error.response.data.detail || "Error al activar la cuenta");
      }
    };

    activate();
  }, [token]);

  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/sigma/images/login-background.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center min-h-screen">
        <div className="flex flex-col items-center justify-center relative">
          <Logo variant="desktop" />
        </div>

        <div className="px-4 md:px-0 relative flex justify-center">
          <div className="bg-black/60 rounded-xl p-6 md:p-10 min-h-[70vh] w-full md:w-4/5 lg:w-3/4 flex flex-col justify-center items-center relative">
            <Logo variant="mobile" />

            {status === "success" && (
              <img className="w-24 mt-10" src="/sigma/images/activation-icon.png" alt="" />
            )}
            {status === "error" && (
              <AiOutlineCloseCircle className="w-24 h-24 mt-10 text-red-600" />
            )}

            <h1 className="text-center font-bold text-xl text-white tracking-wide mb-4 mt-6">
              {status === "success" ? "Email Confirmed!" : status === "error" ? "Error" : "Activating..."}
            </h1>

            <div className="text-center px-7 flex flex-col gap-5 text-white">
              {status !== "loading" && <p>{message}</p>}
              {status === "loading" && <p>Por favor espera mientras activamos tu cuenta...</p>}
            </div>

            {status === "success" && (
              <Link
                href="/login"
                className="w-3/4 text-center text-white py-2 mt-6 rounded-lg bg-red-600 text-lg font-semibold shadow hover:bg-red-500 active:bg-red-700 transition-colors"
              >
                Next
              </Link>
            )}
            <div className="flex justify-center text-white text-md mt-7 mt-2 gap-2">
              <a href="" className="hover:underline">
                Already have an account
              </a>
              <Link href="/login" className="hover:underline font-bold">
                Log in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
