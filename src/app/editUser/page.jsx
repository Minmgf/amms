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
      className="relative min-h-screen bg-cover bg-center grid place-items-center p-4"
      style={{
        backgroundImage:
          "url('https://blog.carsync.com/hubfs/Maquinaria-pesada.jpg')"
      }}
    >
      <div className="relative z-10 bg-black/60 text-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:w-[85vw] lg:h-[90vh] lg:max-w-none h-auto py-6 px-6 sm:py-8 sm:px-8 md:py-10 md:px-16 lg:px-20 lg:py-20 xl:px-24 xl:py-24 2xl:px-32 grid mx-auto justify-items-center lg:content-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">
          Welcome to SIGMA!
        </h1>
        <p className="text-center text-gray-300 mb-6 lg:mb-10">
          Please complete the following information
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 sm:gap-8 lg:gap-2 xl:gap-8 2xl:gap-20 w-ful max-w-sm sm:max-w-md md:max-w-lg lg:max-w-4xl xl:max-w-5xl lg:grid-cols-1 lg:content-center lg:justify-items-center">
          {/* Country - Region - City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 w-full lg:max-w-4xl">
            <div className="relative">
              <label className="block mb-3 text-sm font-medium">Country</label>
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
              <label className="block mb-3 text-sm font-medium">Region</label>
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
              <label className="block mb-3 text-sm font-medium">City</label>
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

          {/* Address */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 w-full lg:max-w-4xl">
            <div className="relative">
              <label className="block mb-3 text-sm font-medium">Address</label>
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
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              <div>
                <label className="block mb-3 text-sm font-medium">Code</label>
                <select
                  {...register("phoneCode")}
                  defaultValue="+57"
                  className="w-full px-2 sm:px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-black text-sm"
                >
                  <option value="+57">+57</option>
                  <option value="+52">+52</option>
                  <option value="+1">+1</option>
                </select>
              </div>
              <div className="col-span-3 relative">
                <label className="block mb-3 text-sm font-medium">
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
          <div className="w-full lg:max-w-4xl">
            <label className="block mb-6 text-base font-medium text-white">
              Profile photo (Optional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] items-center gap-6 sm:gap-10">
              <label
                htmlFor="photo"
                className="grid place-items-center w-24 h-24 mx-auto sm:mx-0 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-200 transition-colors bg-black/20"
              >
                <div className="text-3xl mb-1 text-white">+</div>
                <span className="text-xs sm:text-sm text-white text-center">Upload photo</span>
              </label>
              <input
                id="photo"
                type="file"
                accept="image/png, image/jpeg"
                {...register("photo")}
                className="hidden"
              />
              <div className="grid gap-3 text-center sm:text-left">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors justify-self-center sm:justify-self-start"
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
            <p className="text-red-500 text-sm text-center px-4">
              ⚠ Please complete all required fields before submitting the form.
            </p>
          )}

          {/* Button */}
          <button
            type="submit"
            className="w-full max-w-xs bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-2 rounded-xl transition justify-self-center"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;