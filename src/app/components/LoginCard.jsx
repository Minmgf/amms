import React from "react";
import Logo from "./Logo";

const LoginCard = ({ title, children }) => {
  return (
    <div className="px-4 md:px-0 relative flex justify-center">
      <div className="bg-black/60 rounded-xl p-6 md:p-10 min-h-[70vh] w-full md:w-4/5 lg:w-3/4 flex flex-col justify-center items-center relative">
        {/* Logo mobile superpuesto */}
        <Logo variant="mobile" />

        {/* Título */}
        <h1 className="text-center text-white font-bold text-2xl tracking-wide mt-20 md:mt-0 mb-8">
          {title}
        </h1>

        {children}
      </div>
    </div>
  );
};

export default LoginCard;
