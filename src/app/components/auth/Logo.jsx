import React from "react";

const Logo = ({ variant = "desktop" }) => {
    const isMobile = variant === "mobile";

    return (
        <div
            className={`flex flex-col items-center ${isMobile ? "absolute -top-16 left-1/2 transform -translate-x-1/2 md:hidden" : "hidden md:flex"
                }`}
        >
            <div
                className={`bg-[#D9D9D9] rounded-full flex justify-center items-center 
                ${isMobile ? "w-[140px] h-[140px]" : "w-[200px] h-[200px] md:w-[250px] md:h-[250px]"}`}
            >
                <span
                    className={`text-black font-bold ${isMobile ? "text-[28px]" : "text-[40px] md:text-[51px]"}`}
                >
                    LOGO
                </span>
            </div>
            <h2
                className={`text-white font-bold ${isMobile ? "hidden" : "mt-4 text-[24px] md:text-[30px]"}`}
            >
                SIGMA
            </h2>
        </div>
    );
};

export default Logo;
