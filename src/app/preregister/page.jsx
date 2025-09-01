"use client";

import React from "react";
import { FaRegCalendarAlt } from "react-icons/fa";
import ChangeProfilePhoto from "../modals/ChangeProfilePhoto";
import { useState } from "react";

const page = () => {
  /* MOMENTANEO PARA ABRIR MODAL DE CAMBIAR FOTO */
  const [openModal, setOpenModal] = useState(false);
  /* MOMENTANEO PARA ABRIR MODAL DE CAMBIAR FOTO */

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: "url('/images/login-background.jpg')",
      }}
    >
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 md:gap-[40px] items-center min-h-screen">
        <div className="flex flex-col items-center justify-center gap-8 relative">
          <div className="bg-[#D9D9D9] w-[186px] h-[186px] md:w-[250px] md:h-[250px] rounded-full flex justify-center items-center absolute md:relative md:bottom-0 bottom-[-230px]">
            <span className="text-black text-[33px] md:text-[51px] font-bold">
              LOGO
            </span>
          </div>
          <h2 className="hidden text-white md:block md:text-[30px] font-bold">
            SIGMA
          </h2>
        </div>

        <div className="px-4 md:px-0 flex-1 flex items-center justify-center p-4">
          <div className="bg-black/60 backdrop-blur-md p-6 sm:p-8 md:p-10 rounded-xl w-full text-white shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-center">Sign up</h2>

            <form className="space-y-4 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 w-full">
                <select className="h-10 px-4 rounded-md border border-gray-300 bg-white text-black mb-3 sm:mb-0 sm:w-32">
                  <option>C.C</option>
                  <option>T.I</option>
                  <option>Pasaporte</option>
                </select>

                <input
                  type="text"
                  placeholder="Identification number"
                  className="h-10 px-4 rounded-md border border-gray-300 bg-white text-black flex-1"
                />
              </div>

              <div className="flex items-center border border-gray-300 rounded-md px-4 py-2 bg-white text-black w-full">
                <FaRegCalendarAlt className="text-gray-500 mr-2" />
                <input
                  type="date"
                  className="flex-1 outline-none bg-transparent"
                  required
                />
              </div>

              <button
                onClick={() => setOpenModal(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md transition"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
