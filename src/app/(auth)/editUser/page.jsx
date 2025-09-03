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
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/sigma/images/singup-background.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative z-10 bg-black/60 text-white rounded-2xl shadow-2xl w-full max-w-4xl p-12 flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-center mb-4">
          Welcome to SIGMA!
        </h2>
        <p className="text-center text-gray-300 mb-10">
          Please complete the following information
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <label className="block mb-2 text-sm font-medium">Country</label>
              <select
                {...register("country", { required: true })}
                className="h-10 py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
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
                className="h-10 py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
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

            <div className="relative">
              <label className="block mb-2 text-sm font-medium">City</label>
              <select
                {...register("city", { required: true })}
                className="h-10 py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block mb-2 text-sm font-medium">Address</label>
              <input
                type="text"
                placeholder="Ej: Calle 123 # 45-67"
                {...register("address", { required: true })}
                className="h-10 py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
              />
              {errors.address && (
                <span className="text-red-400 text-xs absolute left-0 -bottom-5">
                  Este campo es requerido
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Code</label>
                <select
                  {...register("phoneCode")}
                  defaultValue="+57"
                  className="h-10 py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
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
                  placeholder="Ej: 3112224444"
                  {...register("phone", { required: true })}
                  className="h-10 py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
                />
                {errors.phone && (
                  <span className="text-red-400 text-xs absolute left-0 -bottom-5">
                    Este campo es requerido
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block mb-4 text-base font-medium text-white">
              Profile photo (Optional)
            </label>
            <div className="flex items-center gap-8">
              <label
                htmlFor="photo"
                className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-200 transition-colors bg-black/20"
              >
                <div className="text-xl md:text-3xl mb-1 text-white">+</div>
                <span className="text-xs md:text-sm text-white">Upload photo</span>
              </label>
              <input
                id="photo"
                type="file"
                accept="image/png, image/jpeg"
                {...register("photo")}
                className="hidden"
              />
              <div className="flex flex-col">
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-500 border border-gray-300 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors mb-2"
                  onClick={() => document.getElementById('photo').click()}
                >
                  Choose file
                </button>
                <span className="text-sm text-gray-300">
                  Allowed formats: JPG, PNG (max. 5MB)
                </span>
              </div>
            </div>
          </div>

          {(errors.country || errors.region || errors.city || errors.address || errors.phone) && (
            <p className="text-red-500 text-sm text-center">
              ⚠ Please complete all required fields before submitting the form.
            </p>
          )}

          <button
            type="submit"
            className="w-full text-white py-2 mt-6 rounded-lg bg-red-600 text-lg font-semibold shadow hover:bg-red-500 active:bg-red-700 transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;
