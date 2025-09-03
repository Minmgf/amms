"use client";

import React, { useEffect, useState } from "react";
import Logo from "../../components/auth/Logo";
import LoginCard from "../../components/auth/LoginCard";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { validateDocument, getTypeDocuments } from "@/services/authService";

const Page = () => {
  const [identificationTypes, setIdentificationTypes] = useState([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const response = await getTypeDocuments();
        setIdentificationTypes(response.data);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchDocumentTypes();
  }, []);

  const onSubmit = async (data) => {
    try {
      const payload = {
        document_type_id: data.selectedType,
        document_number: data.identificationNumber,
        date_issuance_document: data.issueDate,
      };

      const response = await validateDocument(payload);

      localStorage.setItem("validationToken", response.token);
      console.log("exitoso:", response);
      router.push("/completeRegister");
    } catch (error) {
      console.error("Error en login:", error);
      alert("error");
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/images/login-background.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center min-h-screen">
        <div className="flex flex-col items-center justify-center relative">
          <Logo variant="desktop" />
        </div>

        <LoginCard title="Sign Up">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 w-full">
              <div className="w-full sm:w-auto">
                <select
                  {...register("selectedType", { required: "Select a document type" })}
                  className="h-10 py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-2 sm:mb-0 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select identification type</option>
                  {identificationTypes.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name}
                    </option>
                  ))}
                </select>
                {errors.selectedType && (
                  <p className="text-red-500 text-sm">{errors.selectedType.message}</p>
                )}
              </div>

              <div className="w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Identification number"
                  {...register("identificationNumber", {
                    required: "Identification number is required",
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Identification number must be numeric",
                    },
                  })}
                  className="h-10 py-2 px-4 rounded-lg border border-gray-300 bg-white text-black w-full outline-none shadow focus:ring-2 focus:ring-red-500"
                />
                {errors.identificationNumber && (
                  <p className="text-red-500 text-sm">{errors.identificationNumber.message}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="issueDate"
                className="text-sm font-medium text-white mb-1"
              >
                Date of issue
              </label>
              <input
                id="issueDate"
                type="date"
                {...register("issueDate", {
                  required: "Date of issue is required",
                  validate: (value) =>
                    new Date(value) <= new Date() ||
                    "Date of issue cannot be in the future",
                })}
                className="h-10 py-2 px-4 rounded-lg border border-gray-300 bg-white text-black mb-3 w-full outline-none shadow focus:ring-2 focus:ring-red-500"
              />
              {errors.issueDate && (
                <p className="text-red-500 text-sm">{errors.issueDate.message}</p>
              )}
            </div>

            <button
              className="w-full text-white py-2 mt-6 rounded-lg bg-red-600 text-lg font-semibold shadow hover:bg-red-500 active:bg-red-700 transition-colors"
            >
              Continue
            </button>
          </form>

          <p className="text-sm text-gray-300 mt-6 text-center">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-white font-semibold hover:underline"
            >
              Log in here
            </button>
          </p>
        </LoginCard>
      </div>
    </div>
  );
};

export default Page;
