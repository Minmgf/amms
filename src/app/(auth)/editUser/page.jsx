"use client";
import { SuccessModal, ErrorModal } from "@/app/components/shared/SuccessErrorModal";
import { firstLogin } from "@/services/userService";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { getCountries, getStates, getCities } from "@/services/locationService";

const Page = () => {
  const [id, setId] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [countriesList, setCountriesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();
  const watchCountry = watch("country");
  const watchState = watch("region");

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

  useEffect(() => {
    getCountries().then((data) => setCountriesList(data)).catch(console.error);
  }, []);

  // Cuando cambia el país, carga los estados
  useEffect(() => {
    if (!watchCountry) return; // watchCountry vendrá de React Hook Form
    getStates(watchCountry)
      .then(setStatesList)
      .catch(console.error);
    setCitiesList([]);
  }, [watchCountry]);

  // Cuando cambia el estado, carga las ciudades
  useEffect(() => {
    if (!watchState) return; // watchState vendrá de React Hook Form
    getCities(watchCountry, watchState)
      .then(setCitiesList)
      .catch(console.error);
  }, [watchState]);


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
          ¡Bienvenido a SIGMA!
        </h2>
        <p className="text-center text-gray-300 mb-10">
          Por favor complete la siguiente información
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <label className="block mb-2 text-sm font-medium">País</label>
              <select
                area-label="Country Select"
                {...register("country", { required: "El país es obligatorio" })}
                className="h-10 py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
              >
                <option value="">Seleccione...</option>
                {countriesList.map((c) => (
                  <option key={c.iso2} value={c.iso2}>{c.name}</option>
                ))}
              </select>
              {errors.country && (
                <span className="text-red-400 text-xs absolute left-0 -bottom-5">
                  {errors.country.message}
                </span>
              )}
            </div>

            <div className="relative">
              <label className="block mb-2 text-sm font-medium">Región</label>
              <select
                area-label="Region Select"
                {...register("region", { required: "La región es obligatoria" })} disabled={!statesList.length}
                className="h-10 py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
              >
                <option value="">Seleccione...</option>
                {statesList.map((s) => (
                  <option key={s.iso2} value={s.iso2}>{s.name}</option>
                ))}
              </select>
              {errors.region && (
                <span className="text-red-400 text-xs absolute left-0 -bottom-5">
                  {errors.region.message}
                </span>
              )}
            </div>

            <div className="relative">
              <label className="block mb-2 text-sm font-medium">Ciudad</label>
              <select
                area-label="City Select"
                {...register("city", { required: "La ciudad es obligatoria" })} disabled={!citiesList.length}
                className="h-10 py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
              >
                <option value="">Seleccione...</option>
                {citiesList.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
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
              <label className="block mb-2 text-sm font-medium">Dirección de residencia</label>
              <input
                type="text"
                area-label="Address Input"
                placeholder="Ej: Calle 123 # 45-67"
                {...register("address", { required: "La dirección es obligatoria" })}
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
                <label className="block mb-2 text-sm font-medium">Código</label>
                <select
                  area-label="Code Select"
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
                  Número de teléfono
                </label>
                <input
                  area-label="Phone Number Input"
                  type="text"
                  placeholder="Ej: 3112224444"
                  {...register("phone", {
                    required: "El número de teléfono es obligatorio",
                    pattern: {
                      value: /^[0-9+\-()\s]*$/,
                      message: "Sólo números y caracteres + - ( ) son permitidos"
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
              Foto de perfil (Opcional)
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
                area-label="Profile Photo Input"
                id="photo"
                type="file"
                accept="image/png, image/jpeg"
                {...register("photo", {
                  validate: (fileList) => {
                    if (fileList.length === 0) return true;
                    const file = fileList[0];
                    const allowedTypes = ["image/jpeg", "image/png"];
                    if (!allowedTypes.includes(file.type)) {
                      return "Sólo imágenes JPG o PNG son permitidas";
                    }
                    if (file.size > 5 * 1024 * 1024) {
                      return "El archivo no debe exceder de 5MB";
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
                  area-label="Profile Photo Button"
                  type="button"
                  className="px-6 py-2 bg-gray-500 border border-gray-300 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors mb-2"
                  onClick={() => document.getElementById('photo').click()}
                >
                  Elegir archivo
                </button>
                <span className="text-sm text-gray-300">
                  Formatos permitidos: JPG, PNG (max. 5MB)
                </span>
              </div>
            </div>
          </div>

          {(errors.country || errors.region || errors.city || errors.address || errors.phone) && (
            <p className="text-red-500 text-sm text-center">
              ⚠ Rellene todos los campos obligatorios antes de enviar el formulario..
            </p>
          )}

          <button
            area-label="Continue Button"
            type="submit"
            className="w-full text-white py-2 mt-6 rounded-lg bg-red-600 text-lg font-semibold shadow hover:bg-red-500 active:bg-red-700 transition-colors"
          >
            Continuar
          </button>
        </form>
        <SuccessModal
          isOpen={successOpen}
          onClose={() => setSuccessOpen(false)}
          title="Completado Exitosamente"
          message={modalMessage}
        />
        <ErrorModal
          isOpen={errorOpen}
          onClose={() => setErrorOpen(false)}
          title="Error al enviar los datos"
          message={modalMessage}
        />
      </div>
    </div>
  );
};

export default Page;
