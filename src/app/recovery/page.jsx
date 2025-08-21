"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { Check } from "lucide-react";

const Page = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");

  const validations = {
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    length: password.length >= 8,
  };

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const onSubmit = (data) => {
    // Aquí puedes manejar el envío del formulario
    console.log(data);
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: "url('https://blog.carsync.com/hubfs/Maquinaria-pesada.jpg')"
      }}
    >
      <div className="relative z-10 bg-black/30 text-white rounded-2xl shadow-2xl w-full max-w-3xl p-16 flex flex-col justify-center">
        <h2 className="text-4xl font-bold text-center mb-10">Password recovery</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-8 relative">
            <label className="block text-white mb-3 text-lg font-medium" htmlFor="new-password">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              {...register("password", { required: true })}
              className="w-full px-6 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-black text-lg"
            />
            {Object.values(validations).every(Boolean) && (
              <Check className="absolute right-5 top-14 text-green-500" size={32} />
            )}
            {errors.password && (
              <span className="text-red-400 text-xs absolute left-0 -bottom-6">Este campo es requerido</span>
            )}
          </div>
          <div className="mb-8 relative">
            <label className="block text-white mb-3 text-lg font-medium" htmlFor="confirm-password">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              {...register("confirmPassword", {
                required: true,
                validate: (value) => value === password
              })}
              className="w-full px-6 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-black text-lg"
            />
            {passwordsMatch && (
              <Check className="absolute right-5 top-14 text-green-500" size={32} />
            )}
            {errors.confirmPassword && (
              <span className="text-red-400 text-xs absolute left-0 -bottom-6">
                {errors.confirmPassword.type === "validate"
                  ? "Las contraseñas no coinciden"
                  : "Este campo es requerido"}
              </span>
            )}
          </div>
          <div className="text-base text-white mb-10">
            <p className="mb-2 font-semibold">Por seguridad, tu contraseña debe cumplir con los siguientes requisitos:</p>
            <p className={validations.upper ? "text-green-400" : "text-red-400"}>✔ Incluir al menos una letra mayúscula (A-Z).</p>
            <p className={validations.lower ? "text-green-400" : "text-red-400"}>✔ Incluir al menos una letra minúscula (a-z).</p>
            <p className={validations.number ? "text-green-400" : "text-red-400"}>✔ Incluir al menos un número (0-9).</p>
            <p className={validations.length ? "text-green-400" : "text-red-400"}>✔ Tener un mínimo de 8 caracteres.</p>
          </div>
          <button
            type="submit"
            disabled={!(Object.values(validations).every(Boolean) && passwordsMatch)}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl text-lg transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;
