"use client";
import React, { useState, useEffect } from "react";
import { MdKeyboardArrowDown, MdWarning } from "react-icons/md";
import { HiOutlinePencilAlt } from "react-icons/hi";
import ChangePasswordModal from "../../components/userProfile/modals/ChangePasswordModal";
import ChangePhotoModal from "../../components/userProfile/modals/ChangePhotoModal";
import { getUserData } from "@/services/profileService";

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    name: "",             
    lastName: "",         
    email: "",            
    documentType: "",     
    documentNumber: "",   
    gender: "",           
    birthDate: "",        
    expeditionDate: "",   
    country: "",          
    region: "",           
    city: "",             
    address: "",          
    phoneNumber: "",      
  });
  const [id, setId] = useState("");
  const [userData, setUserData] = useState([]);
  const [errors, setErrors] = useState({});
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isChangePhotoModalOpen, setIsChangePhotoModalOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

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

  // este efecto depende de id
  useEffect(() => {
    if (!id) return; // si id aún no existe, no ejecuto nada

    const getData = async () => {
      try {
        const response = await getUserData(id);
        if (response.success && response.data.length > 0) {
          setUserData(response.data[0]);
          setFormData({
            name: userData.name || "",
            lastName: `${userData.first_last_name || ""} ${userData.second_last_name || ""}`.trim(),
            email: userData.email || "",
            documentType: userData.type_document_name || "C.C",
            documentNumber: userData.document_number?.toString() || "",
            gender: userData.gender_name || "",
            birthDate: userData.birthday ? userData.birthday.split("T")[0] : "",
            expeditionDate: userData.date_issuance_document ? userData.date_issuance_document.split("T")[0] : "",
            country: userData.country || "",
            region: userData.department || "",
            city: userData.city?.toString() || "",
            address: userData.address || "",
            phoneNumber: userData.phone || "",
          });

          // Foto de perfil
          if (userData.profile_picture) {
            setProfilePhoto(userData.profile_picture);
          }
        }
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    getData();
  }, [id]);

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'name':
      case 'lastName':
        if (!value.trim()) {
          error = 'Este campo es requerido';
        } else if (value.trim().length < 2) {
          error = 'Debe tener al menos 2 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = 'Solo se permiten letras y espacios';
        }
        break;

      case 'email':
        if (!value.trim()) {
          error = 'El email es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Formato de email inválido';
        }
        break;

      case 'documentNumber':
        if (!value.trim()) {
          error = 'El número de documento es requerido';
        } else if (formData.documentType === 'C.C' && !/^\d{8,10}$/.test(value)) {
          error = 'Cédula debe tener entre 8 y 10 dígitos';
        } else if (formData.documentType === 'C.E' && !/^\d{6,12}$/.test(value)) {
          error = 'Cédula de extranjería debe tener entre 6 y 12 dígitos';
        } else if (formData.documentType === 'Passport' && !/^[A-Z0-9]{6,12}$/.test(value)) {
          error = 'Pasaporte debe tener entre 6 y 12 caracteres alfanuméricos';
        }
        break;

      case 'birthDate':
        if (!value) {
          error = 'La fecha de nacimiento es requerida';
        } else {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 18 || age > 100) {
            error = 'Debe ser mayor de 18 años y menor de 100';
          }
        }
        break;

      case 'expeditionDate':
        if (!value) {
          error = 'La fecha de expedición es requerida';
        } else {
          const expeditionDate = new Date(value);
          const birthDate = new Date(formData.birthDate);
          const today = new Date();

          if (expeditionDate > today) {
            error = 'La fecha no puede ser futura';
          } else if (expeditionDate < birthDate) {
            error = 'No puede ser anterior a la fecha de nacimiento';
          }
        }
        break;

      case 'phoneNumber':
        if (!value.trim()) {
          error = 'El número de teléfono es requerido';
        } else if (!/^\d{10}$/.test(value.replace(/\s/g, ''))) {
          error = 'Debe tener exactamente 10 dígitos';
        }
        break;

      case 'address':
        if (!value.trim()) {
          error = 'La dirección es requerida';
        } else if (value.trim().length < 10) {
          error = 'La dirección debe tener al menos 10 caracteres';
        }
        break;
    }

    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Actualizar el valor
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar el campo y actualizar errores
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
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
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg p-2 text-gray-900 font-medium focus:outline-none focus:ring-2 ${errors.name
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <span className="font-semibold text-gray-800 block mb-2">Last name</span>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg p-2 text-gray-900 font-medium focus:outline-none focus:ring-2 ${errors.lastName
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
                <div>
                  <span className="font-semibold text-gray-800 block mb-2">Document type</span>
                  <div className="relative">
                    <select
                      name="documentType"
                      value={formData.documentType}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-2 appearance-none bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="C.C">C.C</option>
                      <option value="C.E">C.E</option>
                      <option value="Passport">Passport</option>
                    </select>
                    <MdKeyboardArrowDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-gray-800 block mb-2">Document number</span>
                  <input
                    type="text"
                    name="documentNumber"
                    value={formData.documentNumber}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg p-2 text-gray-900 font-medium focus:outline-none focus:ring-2 ${errors.documentNumber
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                  {errors.documentNumber && <p className="text-red-500 text-xs mt-1">{errors.documentNumber}</p>}
                </div>
                <div>
                  <span className="font-semibold text-gray-800 block mb-2">Email</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg p-2 text-gray-900 font-medium focus:outline-none focus:ring-2 ${errors.email
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <span className="font-semibold text-gray-800 block mb-2">Género</span>
                  <div className="relative">
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-2 appearance-none bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                    <MdKeyboardArrowDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-gray-800 block mb-2">Birth date</span>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg p-2 text-gray-900 font-medium focus:outline-none focus:ring-2 ${errors.birthDate
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                  {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
                </div>
                <div>
                  <span className="font-semibold text-gray-800 block mb-2">Expedition date</span>
                  <input
                    type="date"
                    name="expeditionDate"
                    value={formData.expeditionDate}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg p-2 text-gray-900 font-medium focus:outline-none focus:ring-2 ${errors.expeditionDate
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                  {errors.expeditionDate && <p className="text-red-500 text-xs mt-1">{errors.expeditionDate}</p>}
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
                    className={`w-full border-2 rounded-lg p-3 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 ${errors.address
                      ? 'border-red-300 focus:ring-red-500 focus:border-transparent'
                      : 'border-red-300 focus:ring-red-500 focus:border-transparent'
                      }`}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
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
                    <div>
                      <input
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg p-3 text-gray-900 font-medium focus:outline-none focus:ring-2 ${errors.phoneNumber
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                          }`}
                      />
                      {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {(Object.keys(errors).some(key => errors[key]) || !formData.address.trim()) && (
                <div className="grid grid-cols-[auto_1fr] gap-3 items-center text-red-600">
                  <MdWarning className="w-5 h-5" />
                  <p className="text-sm font-medium">Please complete all required fields before submitting the form.</p>
                </div>
              )}

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