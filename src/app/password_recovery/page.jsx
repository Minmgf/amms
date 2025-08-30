'use client';
import React, { useState } from 'react';
import Page from '../recovery/page';

const page = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Se ha enviado el enlace de recuperación a: ' + email);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url("/images/login-background.jpg")' }}>
            <div className="flex flex-col md:flex-row w-full max-w-5xl bg-transparent rounded-2xl overflow-hidden shadow-xl">
    
                {/* Columna Izquierda: Logo y Sigma */}
                <div className="flex flex-col items-center justify-center p-8 md:w-1/2 bg-transparent">
                    <div className="bg-[#D9D9D9] w-[186px] h-[186px] md:w-[286px] md:h-[286px] rounded-full flex justify-center items-center">
                    <span className="text-black text-[33px] md:text-[51px] font-bold">LOGO</span>
                    </div>
                    <span className="text-white font-bold text-2xl mt-4">SIGMA</span>
                </div>

                {/* Columna Derecha: Formulario */}
                <div className="flex flex-col justify-center p-10 md:w-1/2 bg-black/70 text-white rounded-xl shadow-2xl">
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
                        <button type="submit" className="w-full p-4 bg-red-600 text-white font-bold rounded-lg text-lg hover:bg-red-1000 transition">
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