import React from "react";
import { FaRegCalendarAlt } from "react-icons/fa";

const page = () => {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: "url('/images/login-background.jpg')",
      }}
    >

      <div className="flex flex-col lg:flex-row w-full h-full">
      
        <div className="hidden lg:flex w-1/2 h-screen flex-col items-center justify-center">
          <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold shadow-lg">
            LOGO
          </div>
          <h1 className="text-white text-xl font-semibold mt-4">SIGMA</h1>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-black/60 backdrop-blur-md p-6 sm:p-8 md:p-10 rounded-xl w-full max-w-md text-white shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-center">Sign up</h2>

            <form className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 w-full">
                <select className="h-10 px-4 rounded-md border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full sm:w-auto">
                  <option>C.C</option>
                  <option>T.I</option>
                  <option>Pasaporte</option>
                </select>

                <input
                  type="text"
                  placeholder="Identification number"
                  className="h-10 px-4 rounded-md border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full sm:w-auto"
                  required
                />
              </div>

              <div className="flex items-center border border-gray-300 rounded-md px-4 py-2 bg-white text-black">
                <FaRegCalendarAlt className="text-gray-500 mr-2" />
                <input
                  type="date"
                  className="flex-1 outline-none bg-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md transition"
              >
                Continue
              </button>
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
