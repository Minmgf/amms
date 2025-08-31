import Link from "next/link";
import React from "react";
import { FaLock, FaUser } from "react-icons/fa";


const page = () => {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/login-background.jpg')" }}
    >
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 md:gap-[40px] items-center min-h-screen">
        <div className="flex flex-col items-center justify-center gap-8 relative">
          <h2 className="hidden md:block md:text-[30px] font-bold">
            SIGMA
          </h2>
          <div className="bg-[#D9D9D9] w-[186px] h-[186px] md:w-[286px] md:h-[286px] rounded-full flex justify-center items-center absolute md:relative md:bottom-0 bottom-[-230px]">
            <span className="text-black text-[33px] md:text-[51px] font-bold">LOGO</span>
          </div>
        </div>

        <div className="px-4 md:px-0">
          <div className="bg-black/40 rounded-[16px] pb-10 md:pb-4 p-4 min-h-auto md:min-h-[70vh] flex flex-col justify-center items-center gap-12">
            <h1 className="text-center font-bold text-[31px] tracking-wide mb-0 mt-20 md:mt-0 md:mb-6">
              LOGIN
            </h1>

            <form className="space-y-4 w-[90%] md:w-[50%]">
              {/* Username */}
              <label className="block">
                <span className="sr-only">Username</span>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    placeholder="Username"
                    className="w-full rounded-xl bg-white text-gray-900 placeholder-gray-400 shadow pl-12 pr-4 py-2 outline-none ring-0 focus:ring-2 focus:ring-[#D7D7D7]"
                  />
                </div>
              </label>

              {/* Password */}
              <label className="block">
                <span className="sr-only">Password</span>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full rounded-xl bg-white text-gray-900 placeholder-gray-400 shadow pl-12 pr-4 py-2 outline-none ring-0 focus:ring-2 focus:ring-[#D7D7D7]"
                  />
                </div>
              </label>

              {/* Remember me */}
              <label className="mt-2 w-full flex items-center gap-3 select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/30 bg-black/30 accent-black"
                />
                <span className="text-white/90 font-xl">Remember me</span>
              </label>

              {/* Button */}
              <div className="flex justify-center items-center">
                <button
                  type="submit"
                  className="w-fit px-14 py-1 mt-8 rounded-xl bg-red-600 text-lg font-semibold shadow cursor-pointer hover:bg-red-500 active:bg-red-700 transition-colors"
                >
                  Login
                </button>
              </div>

              {/* Forgot password */}
              <div className="text-center">
                <Link
                  href="/recovery"
                  className="text-white/80 hover:text-white underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
            </form>
                      <div className="flex justify-center mt-7 gap-2">
            <a href="" className="hover:underline">New here?</a>
            <Link href="/singup" className="hover:underline font-bold">Sign Up</Link>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
