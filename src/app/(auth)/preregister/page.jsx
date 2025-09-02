"use client";

import React from "react";
import Logo from "../../components/auth/Logo";
import LoginCard from "../../components/auth/LoginCard";
import ChangeProfilePhoto from "../../components/userProfile/modals/ChangeProfilePhoto";
import { useState } from "react";

const page = () => {
  /* MOMENTANEO PARA ABRIR MODAL DE CAMBIAR FOTO */
  const [openModal, setOpenModal] = useState(false);
  /* MOMENTANEO PARA ABRIR MODAL DE CAMBIAR FOTO */

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center"
      style={{backgroundImage: "url('/images/login-background.jpg')"}}
    >
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center min-h-screen">
        <div className="flex flex-col items-center justify-center relative">
          <Logo variant="desktop" />
        </div>

        <LoginCard title="Sing Up">
          <form className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 w-full">
              <select className="py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full sm:w-auto outline-none shadow focus:ring-2 focus:ring-red-500">
                <option>C.C</option>
                <option>T.I</option>
                <option>Pasaporte</option>
              </select>

              <input
                type="text"
                placeholder="Identification number"
                className="py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full sm:w-auto outline-none shadow focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="expeditionDate"
                className="text-sm font-medium text-white mb-1"
              >
                Date of issue
              </label>
              <input
                id="expeditionDate"
                type="date"
                className="py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <button
              onClick={() => setOpenModal(true)}
              className="w-full text-white py-2 mt-6 rounded-lg bg-red-600 text-lg font-semibold shadow hover:bg-red-500 active:bg-red-700 transition-colors"
            >
              Continue
            </button>
            {openModal && (
                <ChangeProfilePhoto onClose={() => setOpenModal(false)} />
              )}
          </form>

          <p className="text-sm text-gray-300 mt-6 text-center">
            Already have an account?{" "}
            <a href="#" className="text-white font-semibold hover:underline">
              Log in here
            </a>
          </p>
        </LoginCard>
      </div>
    </div>
  );
};

export default page;
