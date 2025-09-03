import Link from "next/link";
import React from "react";
import Logo from "../../components/auth/Logo";

const page = () => {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('./images/login-background.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center min-h-screen">
        <div className="flex flex-col items-center justify-center relative">
          <Logo variant="desktop" />
        </div>

        <div className="px-4 md:px-0 relative flex justify-center">
          <div className="bg-black/60 rounded-xl p-6 md:p-10 min-h-[70vh] w-full md:w-4/5 lg:w-3/4 flex flex-col justify-center items-center relative">
            <Logo variant="mobile" />

            <img className="w-24 mt-10" src="./images/activation-icon.png" alt="" srcset="" />
            <h1 className="text-center font-bold text-xl text-white tracking-wide mb-4 mt-6">
              Email Confirmed!
            </h1>
            <div className="text-center px-7 flex flex-col gap-5 text-white">
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
            <form className="space-y-4 w-3/4">
              <button
                type="submit"
                className="w-full text-white py-2 mt-6 rounded-lg bg-red-600 text-lg font-semibold shadow hover:bg-red-500 active:bg-red-700 transition-colors"
              >
                Next
              </button>
            </form>
            <div className="flex justify-center text-white text-md mt-7 mt-2 gap-2">
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
