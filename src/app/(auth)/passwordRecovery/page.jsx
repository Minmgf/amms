'use client';
import React from 'react';
import Logo from "../../components/auth/Logo";
import LoginCard from "../../components/auth/LoginCard";
import { requestResetPassword } from '@/services/authService';
import { useForm } from "react-hook-form";

const Page = () => {
    const { 
        register, 
        handleSubmit, 
        formState: { errors } 
    } = useForm();

    const onSubmit = async (data) => {
        try {
            const response = await requestResetPassword({ email: data.email });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url("/images/login-background.jpg")' }}>
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center min-h-screen">
                <div className="flex flex-col items-center justify-center relative">
                    <Logo variant="desktop" />
                </div>

                <LoginCard title="Password Recovery">
                    <p className="mb-8 text-center text-white">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                        <label htmlFor="email" className="block text-sm font-medium text-white mb-1">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email address"
                            className="py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-1 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
                            {...register("email", { 
                                required: "Email is required", 
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Invalid email format"
                                }
                            })}
                        />
                        {errors.email && (
                            <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                        )}
                        <button 
                            type="submit" 
                            className="w-full text-white py-2 mt-6 rounded-lg bg-red-600 text-lg font-semibold shadow hover:bg-red-500 active:bg-red-700 transition-colors"
                        >
                            Send
                        </button>
                    </form>
                    <div className="mt-8 text-center text-white">
                        Already have an account? <a href="/login" className="text-white font-bold underline">Log in here</a>
                    </div>
                </LoginCard>
            </div>
        </div>
    );
};

export default Page;
