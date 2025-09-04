"use client";
import { SuccessModal, ErrorModal } from "@/app/components/shared/SuccessErrorModal";
import { firstLogin } from "@/services/userService";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

const Page = () => {
  const [id, setId] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setId(userData.id); // esto se actualiza asincrónicamente
      } catch (err) {
        console.error("Error parsing userData", err);
      }
    }
  }, []);

  const onSubmit = async (data) => {
    try {
      // Armamos FormData para enviar archivo + texto
      const formData = new FormData();
      formData.append("user_id", id);
      formData.append("country", data.country);
      formData.append("department", data.region);
      formData.append("city", data.city);
      formData.append("address", data.address);
      formData.append("phoneCode", data.phoneCode);
      formData.append("phone", data.phone);

      if (data.photo && data.photo.length > 0) {
        formData.append("photo", data.photo[0]); // archivo real
      }

      // Aquí haces la petición con Axios
      const response = await firstLogin(
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setModalMessage(response.data.message);
      setSuccessOpen(true);
      setTimeout(() => {
        setSuccessOpen(false);
        router.push("/home");
      }, 2000);
    } catch (error) {
      setModalMessage(error.response.data.detail);
      setErrorOpen(true);
    }
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('./images/singup-background.jpg')" }}
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
                {...register("country", { required: "Country is required" })}
                className="h-10 py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select...</option>
                <option value="Colombia">Colombia</option>
                <option value="mexico">Mexico</option>
                <option value="usa">USA</option>
              </select>
              {errors.country && (
                <span className="text-red-400 text-xs absolute left-0 -bottom-5">
                  {errors.country.message}
                </span>
              )}
            </div>

            <div className="relative">
              <label className="block mb-2 text-sm font-medium">Region</label>
              <select
                {...register("region", { required: "Region is required" })}
                className="h-10 py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select...</option>
                <option value="huila">Huila</option>
                <option value="Antioquia">Antioquia</option>
              </select>
              {errors.region && (
                <span className="text-red-400 text-xs absolute left-0 -bottom-5">
                  {errors.region.message}
                </span>
              )}
            </div>

            <div className="relative">
              <label className="block mb-2 text-sm font-medium">City</label>
              <select
                {...register("city", { required: "City is required" })}
                className="h-10 py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select...</option>
                <option value="neiva">Neiva</option>
                <option value="101">Medellín</option>
              </select>
              {errors.city && (
                <span className="text-red-400 text-xs absolute left-0 -bottom-5">
                  {errors.city.message}
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
                {...register("address", { required: "Address is required" })}
                className="h-10 py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
              />
              {errors.address && (
                <span className="text-red-400 text-xs absolute left-0 -bottom-5">
                  {errors.address.message}
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
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9+\-()\s]*$/,
                      message: "Only numbers and characters + - ( ) are allowed"
                    }
                  })}
                  className="h-10 py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
                />
                {errors.phone && (
                  <span className="text-red-400 text-xs absolute left-0 -bottom-5">
                    {errors.phone.message}
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
                {...register("photo", {
                  validate: (fileList) => {
                    if (fileList.length === 0) return true;
                    const file = fileList[0];
                    const allowedTypes = ["image/jpeg", "image/png"];
                    if (!allowedTypes.includes(file.type)) {
                      return "Only JPG or PNG images are allowed";
                    }
                    if (file.size > 5 * 1024 * 1024) {
                      return "The file must not exceed 5MB";
                    }
                    return true;
                  }
                })}

                className="hidden"
              />
              {errors.photo?.message && (
                <span className="text-red-400 text-xs mt-2 block">
                  {errors.photo.message}
                </span>
              )}
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
        <SuccessModal
          isOpen={successOpen}
          onClose={() => setSuccessOpen(false)}
          title="Successfully Completed"
          message={modalMessage}
        />
        <ErrorModal
          isOpen={errorOpen}
          onClose={() => setErrorOpen(false)}
          title="Error Submitting data"
          message={modalMessage}
        />
      </div>
    </div>
  );
};

export default Page;
