"use client";
import React, { useState } from "react";
import { MdKeyboardArrowDown, MdWarning } from "react-icons/md";
import { HiOutlinePencilAlt } from "react-icons/hi";
import ChangePasswordModal from "../modals/ChangePasswordModal";
import ChangePhotoModal from "../modals/ChangePhotoModal";

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    name: 'Hernán Darío',
    lastName: 'Torres Ramírez',
    email: 'hernan.torres@company.com',
    documentType: 'C.C',
    documentNumber: '1033123123',
    gender: 'Masculino',
    birthDate: '14/3/1985',
    expeditionDate: '14/3/2003',
    country: 'Colombia',
    region: 'Cundinamarca',
    city: 'Bogotá',
    address: '',
    phoneNumber: '3123234234234'
  });

  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isChangePhotoModalOpen, setIsChangePhotoModalOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (passwordData) => {
    console.log('Password change submitted:', passwordData);
    // Aquí puedes agregar la lógica para cambiar la contraseña
    setIsChangePasswordModalOpen(false);
  };

  const handlePhotoChange = (file) => {
    console.log('Photo change submitted:', file);
    // Crear URL para mostrar la nueva foto
    const photoUrl = URL.createObjectURL(file);
    setProfilePhoto(photoUrl);
    // Aquí puedes agregar la lógica para subir la foto al servidor
    setIsChangePhotoModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 grid place-items-center py-8 px-4">
      {/* Title outside container */}
      <div className="w-full max-w-5xl 2xl:max-w-none xl:w-8/9 2xl:w-9/10">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">My profile</h1>
        
        <div className="bg-white rounded-2xl shadow p-6 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Section */}
            <div className="grid place-items-center grid-rows-[auto_auto_auto_1fr] gap-6">
              {/* Avatar */}
              <div 
                className="w-40 h-40 rounded-full bg-green-200 relative cursor-pointer group hover:bg-green-300 overflow-hidden flex items-center justify-center hadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 ease-in-out"
                onClick={() => setIsChangePhotoModalOpen(true)}
              >
                {profilePhoto ? (
                  <>
                    <img 
                      src={profilePhoto} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  </>
                ) : (
                  <>
                    <HiOutlinePencilAlt className="text-4xl text-green-800 group-hover:text-green-900 transition-colors" />
                    <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <HiOutlinePencilAlt className="w-4 h-4" />
                    </div>
                  </>
                )}
              </div>

              {/* Name */}
              <h2 className="text-xl font-bold text-center text-gray-900 leading-tight">
                {formData.name} <br /> {formData.lastName}
              </h2>

              {/* Roles Section */}
              <div className="w-full">
                <div className="mb-3 text-center">
                  <span className="text-sm text-gray-500 font-medium">Roles</span>
                </div>

                {/* Roles Grid */}
                <div className="grid gap-2">
                  <span className="px-4 py-2 bg-pink-200 text-sm rounded-full text-pink-800 text-center font-medium">
                    Administrator
                  </span>
                  <span className="px-4 py-2 bg-pink-200 text-sm rounded-full text-pink-800 text-center font-medium">
                    Maintenance Technician
                  </span>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="md:col-span-2 grid grid-rows-[auto_1fr_auto_auto_auto_auto] gap-6">
              {/* Personal info */}
              <h3 className="text-xl font-bold border-b border-gray-200 pb-3 text-gray-900">
                Personal information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 gap-y-6 gap-x-8 text-sm">
                <div>
                  <span className="font-semibold text-gray-800 block mb-2">Name</span>
                  <p className="text-gray-900 font-medium">{formData.name}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-800 block mb-2">Last name</span>
                  <p className="text-gray-900 font-medium">{formData.lastName}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-800 block mb-2">Document type</span>
                  <p className="text-gray-900 font-medium">{formData.documentType}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-800 block mb-2">Document number</span>
                  <p className="text-gray-900 font-medium">{formData.documentNumber}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-800 block mb-2">Email</span>
                  <p className="text-gray-900 font-medium">{formData.email}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-800 block mb-2">Género</span>
                  <p className="text-gray-900 font-medium">{formData.gender}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-800 block mb-2">Birth date</span>
                  <p className="text-gray-900 font-medium">{formData.birthDate}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-800 block mb-2">Expedition date</span>
                  <p className="text-gray-900 font-medium">{formData.expeditionDate}</p>
                </div>
              </div>

              {/* Información de Residencia */}
              <h3 className="text-xl font-bold text-gray-900">
                Información de Residencia
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3  gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Country</label>
                  <div className="relative">
                    <select 
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 appearance-none bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Colombia">Colombia</option>
                    </select>
                    <MdKeyboardArrowDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Region</label>
                  <div className="relative">
                    <select 
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 appearance-none bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Cundinamarca">Cundinamarca</option>
                    </select>
                    <MdKeyboardArrowDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">City</label>
                  <div className="relative">
                    <select 
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 appearance-none bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Bogotá">Bogotá</option>
                    </select>
                    <MdKeyboardArrowDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Address and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-red-600 mb-3">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Example..."
                    className="w-full border-2 border-red-300 rounded-lg p-3 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Phone number</label>
                  <div className="grid grid-cols-[auto_1fr] gap-3">
                    <div className="relative">
                      <select className="w-20 border border-gray-300 rounded-lg p-3 appearance-none bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>+57</option>
                      </select>
                      <MdKeyboardArrowDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="min-w-0 border border-gray-300 rounded-lg p-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              <div className="grid grid-cols-[auto_1fr] gap-3 items-center text-red-600 ">
                <MdWarning className="w-5 h-5" />
                <p className="text-sm font-medium">Please complete all required fields before submitting the form.</p>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
                <button 
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  className="bg-black text-white font-semibold px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors justify-self-center md:justify-self-start"
                >
                  Change Password
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <button className="bg-red-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-red-700 transition-colors">
                    Cancel
                  </button>
                  <button className="bg-black text-white font-semibold px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onSubmit={handlePasswordChange}
      />
      
      <ChangePhotoModal
        isOpen={isChangePhotoModalOpen}
        onClose={() => setIsChangePhotoModalOpen(false)}
        onSave={handlePhotoChange}
      />
    </div>
  );
};

export default ProfilePage;