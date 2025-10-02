'use client';
import { useRouter } from "next/navigation";
import React, { useState } from 'react';
import Logo from "../../components/auth/Logo";
import LoginCard from "../../components/auth/LoginCard";
import { requestResetPassword } from '@/services/authService';
import { useForm } from "react-hook-form";
import Link from "next/link";
import {
    SuccessModal,
    ErrorModal,
} from "@/app/components/shared/SuccessErrorModal";

const Page = () => {
    const [successOpen, setSuccessOpen] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const onSubmit = async (data) => {
        try {
            const response = await requestResetPassword({ email: data.email });
            setModalMessage(response.message);
            setSuccessOpen(true);            
        } catch (error) {
            setModalMessage(error.response.data.detail);
            setErrorOpen(true);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url("./images/login-background.jpg")' }}>
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center min-h-screen">
                <div className="flex flex-col items-center justify-center relative">
                    <Logo variant="desktop" />
                </div>

                <LoginCard title="Restablecer Contraseña">
                    <p className="mb-8 text-center text-white">
                        Introduce tu dirección de correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                    </p>
                    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                        <label htmlFor="email" className="block text-sm font-medium text-white mb-1">Correo electrónico</label>
                        <input
                            id="email"
                            aria-label="Email Input"
                            type="email"
                            placeholder="Ingrese su correo electrónico"
                            className="py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-1 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
                            {...register("email", {
                                required: "El correo electrónico es obligatorio",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Formato de correo electrónico invalido"
                                }
                            })}
                        />
                        {errors.email && (
                            <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                        )}
                        <button
                            aria-label="Send-Button"
                            type="submit"
                            className="w-full text-white py-2 mt-6 rounded-lg bg-red-600 text-lg font-semibold shadow hover:bg-red-500 active:bg-red-700 transition-colors"
                        >
                            Enviar
                        </button>
                    </form>
                    <div className="mt-8 text-center text-white">
                        Ya tiene una cuenta activa? 
                        <Link
                            aria-label="Login Button"
                            href="/login"
                            className="hover:underline font-bold text-white"
                        >
                            Inicie sesión aquí
                        </Link>
                    </div>
                </LoginCard>
                <SuccessModal
                    isOpen={successOpen}
                    onClose={() => setSuccessOpen(false)}
                    title="Solicitud exitosa"
                    message={modalMessage}
                />
                <ErrorModal
                    isOpen={errorOpen}
                    onClose={() => setErrorOpen(false)}
                    title="Solicitud Fallida"
                    message={modalMessage}
                />
            </div>
        </div>
    );
};

export default Page;
