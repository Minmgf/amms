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
          <h2 className="hidden md:block md:text-[30px] font-bold">SIGMA</h2>
          <div className="bg-[#D9D9D9] w-[186px] h-[186px] md:w-[286px] md:h-[286px] rounded-full flex justify-center items-center absolute md:relative md:bottom-0 bottom-[-230px]">
            <span className="text-black text-[33px] md:text-[51px] font-bold">
              LOGO
            </span>
          </div>
        </div>

        <div className="px-4 md:px-0">
        
          <div className="bg-black/40 rounded-[16px] pb-10 md:pb-4 p-4 min-h-auto md:min-h-[70vh] flex flex-col justify-center items-center gap-12">
            <img className="w-24 mt-10" src="/images/activation-icon.png" alt="" srcset="" />
            <h1 className="text-center font-bold text-[31px] tracking-wide mb-0 mt-4 md:mt-0 md:mb-0">
              Email Confirmed!
            </h1>
            <div className="text-center px-7 flex flex-col gap-5">
              <div>
                <p>
                  Your email address has been successfully verified. Welcome to
                  SIGMA! You can now access all features of your account.
                </p>
              </div>
              <div>
                <p>
                  Before you start using our application, you will need to
                  provide some information to complete your account.
                </p>
              </div>
              <div>
                <p>Click Next to continue this process</p>
              </div>
            </div>
            <form className="space-y-4 w-[90%] md:w-[50%]">

              {/* Button */}
              <div className="flex justify-center items-center">
                <button
                  type="submit"
                  className="w-fit px-14 py-1 mt-8 rounded-xl bg-red-600 text-lg font-semibold shadow cursor-pointer hover:bg-red-500 active:bg-red-700 transition-colors"
                >
                  Next
                </button>
              </div>
            </form>
            <div className="flex justify-center mt-7 gap-2">
              <a href="" className="hover:underline">
                Already have an account
              </a>
              <Link href="/singup" className="hover:underline font-bold">
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
