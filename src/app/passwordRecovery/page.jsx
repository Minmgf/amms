'use client';
import React, { useState } from 'react';

const page = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Se ha enviado el enlace de recuperación a: ' + email);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url("/images/login-background.jpg")' }}>
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 md:gap-[40px] items-center min-h-screen">
                {/* Columna Izquierda: Logo y Sigma */}
                <div className="flex flex-col justify-center items-center h-full p-8 bg-transparent">
                    <div className="bg-[#D9D9D9] w-[186px] h-[186px] md:w-[286px] md:h-[286px] rounded-full flex justify-center items-center">
                        <span className="text-black text-[33px] md:text-[51px] font-bold">LOGO</span>
                    </div>
                    <span className="text-white font-bold text-2xl mt-4">SIGMA</span>
                </div>

                {/* Columna Derecha: Formulario */}
                <div className="bg-black/60 rounded-[16px] px-8 py-10 min-h-auto md:min-h-[70vh] flex flex-col justify-center items-center gap-12">
                    <h2 className="font-bold text-3xl mb-4 text-center">Password Recovery</h2>
                    <p className="mb-8 text-center">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                    <form onSubmit={handleSubmit} className="w-full">
                        <label htmlFor="email" className="mb-2 block text-lg">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                            required
                            className="w-full p-3 rounded-lg bg-white text-black text-base mb-6 shadow-md focus:outline-none focus:ring-2 focus:ring-red-400"
                        />
                        <button type="submit" className="w-full p-4 bg-red-600 text-white font-bold rounded-lg text-lg hover:bg-red-700 transition">
                            Send
                        </button>
                    </form>
                    <div className="mt-8 text-center">
                        Already have an account? <a href="/login" className="text-white font-bold underline">Log in here</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default page;