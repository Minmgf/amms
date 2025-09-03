'use client';
import React, { useState } from 'react';
import Logo from "../../components/auth/Logo";
import LoginCard from "../../components/auth/LoginCard";

const page = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Se ha enviado el enlace de recuperación a: ' + email);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url("/sigma/images/login-background.jpg")' }}>
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center min-h-screen">
                <div className="flex flex-col items-center justify-center relative">
                    <Logo variant="desktop" />
                </div>

                <LoginCard title="Password Recovery">
                    <p className="mb-8 text-center text-white">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                    <form onSubmit={handleSubmit} className="w-full">
                        <label htmlFor="email" className="block text-sm font-medium text-white mb-1">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                            required
                            className="py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
                        />
                        <button type="submit" className="w-full text-white py-2 mt-6 rounded-lg bg-red-600 text-lg font-semibold shadow hover:bg-red-500 active:bg-red-700 transition-colors">
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

export default page;