"use client";
import React from "react";
import { useForm } from "react-hook-form";

const Page = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = (data) => {
    console.log("Form Data:", data);
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center p-4"
      style={{
        backgroundImage:
          "url('https://blog.carsync.com/hubfs/Maquinaria-pesada.jpg')"
      }}
    >
      <div className="relative z-10 bg-black/60 text-white rounded-2xl shadow-2xl w-[90%] sm:w-[85%] md:w-[85%] lg:w-[85%] xl:w-[85%] 2xl:w-[85%] py-6 px-6 sm:py-8 sm:px-8 md:py-10 md:px-10 lg:py-12 lg:px-12 xl:py-16 xl:px-16">
        <div className="text-center mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
            Welcome to SIGMA!
          </h1>
          <p className="text-gray-300 mt-2 text-sm sm:text-base lg:text-lg">
            Please complete the following information
          </p>
        </div>

        <div className="lg:w-[60vw] mx-auto px-4 lg:px-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 lg:space-y-8">
          {/* Country - Region - City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="relative">
              <label className="block mb-2 text-sm font-medium">Country</label>
              <select
                {...register("country", { required: true })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-black"
              >
                <option value="">Select...</option>
                <option value="colombia">Colombia</option>
                <option value="mexico">Mexico</option>
                <option value="usa">USA</option>
              </select>
              {errors.country && (
                <span className="text-red-400 text-xs absolute left-0 -bottom-5">
                  Este campo es requerido
                </span>
              )}
            </div>

            <div className="relative">
              <label className="block mb-2 text-sm font-medium">Region</label>
              <select
                {...register("region", { required: true })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-black"
              >
                <option value="">Select...</option>
                <option value="huila">Huila</option>
                <option value="cundinamarca">Cundinamarca</option>
              </select>
              {errors.region && (
                <span className="text-red-400 text-xs absolute left-0 -bottom-5">
                  Este campo es requerido
                </span>
              )}
            </div>

            <div className="relative sm:col-span-2 lg:col-span-1">
              <label className="block mb-2 text-sm font-medium">City</label>
              <select
                {...register("city", { required: true })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-black"
              >
                <option value="">Select...</option>
                <option value="neiva">Neiva</option>
                <option value="bogota">Bogotá</option>
              </select>
              {errors.city && (
                <span className="text-red-400 text-xs absolute left-0 -bottom-5">
                  Este campo es requerido
                </span>
              )}
            </div>
          </div>

          {/* Address and Phone */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="relative">
              <label className="block mb-2 text-sm font-medium">Address</label>
              <input
                type="text"
                {...register("address", { required: true })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-black"
              />
              {errors.address && (
                <span className="text-red-400 text-xs absolute left-0 -bottom-5">
                  Este campo es requerido
                </span>
              )}
            </div>

            {/* Phone */}
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block mb-2 text-sm font-medium">Code</label>
                <select
                  {...register("phoneCode")}
                  defaultValue="+57"
                  className="w-full px-2 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-black text-sm"
                >
                  <option value="+57">+57</option>
                  <option value="+52">+52</option>
                  <option value="+1">+1</option>
                </select>
              </div>
              <div className="col-span-3 relative">
                <label className="block mb-2 text-sm font-medium">
                  Phone number
                </label>
                <input
                  type="text"
                  {...register("phone", { required: true })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-black"
                />
                {errors.phone && (
                  <span className="text-red-400 text-xs absolute left-0 -bottom-5">
                    Este campo es requerido
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile photo */}
          <div className="w-full">
            <label className="block mb-4 text-base font-medium text-white">
              Profile photo (Optional)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <label
                htmlFor="photo"
                className="flex-shrink-0 grid place-items-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-200 transition-colors bg-black/20"
              >
                <div className="text-3xl mb-1 text-white">+</div>
                <span className="text-xs text-white text-center">Upload photo</span>
              </label>
              <input
                id="photo"
                type="file"
                accept="image/png, image/jpeg"
                {...register("photo")}
                className="hidden"
              />
              <div className="flex flex-col gap-3 text-center sm:text-left">
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
                  onClick={() => document.getElementById('photo').click()}
                >
                  Choose file
                </button>
                <span className="text-xs sm:text-sm text-gray-300">
                  Allowed formats: JPG, PNG (max. 5MB)
                </span>
              </div>
            </div>
          </div>

          {/* Error message */}
          {(errors.country || errors.region || errors.city || errors.address || errors.phone) && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm text-center">
                ⚠ Please complete all required fields before submitting the form.
              </p>
            </div>
          )}

          {/* Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="w-full max-w-xs bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
            >
              Continue
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;