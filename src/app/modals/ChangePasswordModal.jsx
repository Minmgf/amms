import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineClose, AiOutlineCheck } from "react-icons/ai";

const ChangePasswordModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Password validation
  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password)
    };
    return requirements;
  };

  const passwordRequirements = validatePassword(formData.newPassword);
  const passwordsMatch = formData.newPassword === formData.confirmPassword && formData.confirmPassword !== '';
  const hasCurrentPasswordError = formData.currentPassword !== '' && formData.currentPassword !== 'correct';
  const hasConfirmPasswordError = formData.confirmPassword !== '' && !passwordsMatch;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const handleCancel = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
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
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Enter your current password"
                className="w-full pr-12 pl-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700 placeholder-gray-200"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? <AiOutlineEyeInvisible className="w-4 h-4" /> : <AiOutlineEye className="w-4 h-4" />}
              </button>
            </div>
            {hasCurrentPasswordError && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                Incorrect current password
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
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter your new password"
                className="w-full pr-12 pl-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700 placeholder-gray-200"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <AiOutlineEyeInvisible className="w-4 h-4" /> : <AiOutlineEye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Requirements */}
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-600 mb-2">Password Requirements</p>
              <div className="space-y-1">
                <div className="flex items-center text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                    passwordRequirements.length ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <span className={passwordRequirements.length ? 'text-green-600' : 'text-red-600'}>
                    At least 8 characters
                  </span>
                  {passwordRequirements.length && <AiOutlineCheck className="w-3 h-3 text-green-600 ml-1" />}
                </div>
                <div className="flex items-center text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                    passwordRequirements.uppercase ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <span className={passwordRequirements.uppercase ? 'text-green-600' : 'text-red-600'}>
                    At least one uppercase letter
                  </span>
                  {passwordRequirements.uppercase && <AiOutlineCheck className="w-3 h-3 text-green-600 ml-1" />}
                </div>
                <div className="flex items-center text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                    passwordRequirements.number ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <span className={passwordRequirements.number ? 'text-green-600' : 'text-red-600'}>
                    At least one number
                  </span>
                  {passwordRequirements.number && <AiOutlineCheck className="w-3 h-3 text-green-600 ml-1" />}
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
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your new password"
                className="w-full pr-12 pl-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700 placeholder-gray-200"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <AiOutlineEyeInvisible className="w-4 h-4" /> : <AiOutlineEye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Password Match/Error Indicator */}
            {formData.confirmPassword && (
              <p className={`text-xs mt-1 flex items-center ${
                passwordsMatch ? 'text-green-600' : 'text-red-600'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                  passwordsMatch ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                {passwordsMatch && <AiOutlineCheck className="w-3 h-3 ml-1" />}
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
              onClick={handleSubmit}
              className="flex-1 px-4 py-2.5 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 transition-colors text-sm"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;