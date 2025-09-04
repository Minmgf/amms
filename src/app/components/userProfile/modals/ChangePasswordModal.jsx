import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineClose,
  AiOutlineCheck,
} from "react-icons/ai";
import { changeUserPassword } from "@/services/profileService";
import { SuccessModal, ErrorModal } from "../../shared/SuccessErrorModal";

const ChangePasswordModal = ({ isOpen, onClose, onSubmit }) => {
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [id, setId] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const new_password = watch("new_password");
  const confirm_password = watch("confirm_password");

  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
    };
    return requirements;
  };

  const passwordRequirements = validatePassword(new_password || "");
  const passwordsMatch =
    new_password === confirm_password && confirm_password !== "";

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setId(userData.id);
      } catch (err) {
        console.error("Error parsing userData", err);
      }
    }
  }, []);

  const handleCancel = () => {
    onClose();
  };

  const onSubmitForm = async (data) => {
    try {
      const response = await changeUserPassword(id, data);
      setModalMessage(response.data);
      setSuccessOpen(true);
      setTimeout(() => {
        setSuccessOpen(false);
        reset();
        onClose();
      }, 2000);
    } catch (error) {
      setModalMessage(error.response.data.detail);
      setErrorOpen(true);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <AiOutlineClose className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  {...register("old_password", {
                    required: "Current password is required",
                  })}
                  placeholder="Enter your current password"
                  className="w-full pr-12 pl-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700 placeholder-gray-200"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? (
                    <AiOutlineEyeInvisible className="w-4 h-4" />
                  ) : (
                    <AiOutlineEye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.old_password && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                  {errors.old_password.message}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  {...register("new_password", {
                    required: "New password is required",
                    validate: {
                      length: (value) =>
                        value.length >= 12 || "At least 12 characters required",
                      uppercase: (value) =>
                        /[A-Z]/.test(value) ||
                        "At least one uppercase letter required",
                      number: (value) =>
                        /\d/.test(value) || "At least one number required",
                    },
                  })}
                  placeholder="Enter your new password"
                  className="w-full pr-12 pl-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700 placeholder-gray-200"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? (
                    <AiOutlineEyeInvisible className="w-4 h-4" />
                  ) : (
                    <AiOutlineEye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-600 mb-2">
                  Password Requirements
                </p>
                <div className="space-y-1">
                  <div className="flex items-center text-xs">
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-2 ${passwordRequirements.length
                          ? "bg-green-500"
                          : "bg-red-500"
                        }`}
                    ></span>
                    <span
                      className={
                        passwordRequirements.length
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      At least 12 characters
                    </span>
                    {passwordRequirements.length && (
                      <AiOutlineCheck className="w-3 h-3 text-green-600 ml-1" />
                    )}
                  </div>
                  <div className="flex items-center text-xs">
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-2 ${passwordRequirements.uppercase
                          ? "bg-green-500"
                          : "bg-red-500"
                        }`}
                    ></span>
                    <span
                      className={
                        passwordRequirements.uppercase
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      At least one uppercase letter
                    </span>
                    {passwordRequirements.uppercase && (
                      <AiOutlineCheck className="w-3 h-3 text-green-600 ml-1" />
                    )}
                  </div>
                  <div className="flex items-center text-xs">
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-2 ${passwordRequirements.number
                          ? "bg-green-500"
                          : "bg-red-500"
                        }`}
                    ></span>
                    <span
                      className={
                        passwordRequirements.number
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      At least one number
                    </span>
                    {passwordRequirements.number && (
                      <AiOutlineCheck className="w-3 h-3 text-green-600 ml-1" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  {...register("confirm_password", {
                    required: "Please confirm your new password",
                    validate: (value) =>
                      value === new_password || "Passwords do not match",
                  })}
                  placeholder="Confirm your new password"
                  className="w-full pr-12 pl-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700 placeholder-gray-200"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? (
                    <AiOutlineEyeInvisible className="w-4 h-4" />
                  ) : (
                    <AiOutlineEye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit(onSubmitForm)}
                className="flex-1 px-4 py-2.5 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 transition-colors text-sm"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
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
    </>
  );
};

export default ChangePasswordModal;
