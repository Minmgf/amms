"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { HiOutlinePencilAlt } from "react-icons/hi";
import ChangePasswordModal from "../../components/userProfile/modals/ChangePasswordModal";
import ChangePhotoModal from "../../components/userProfile/modals/ChangePhotoModal";
import { useTheme } from '@/contexts/ThemeContext';
import { getUserData, updateBasicInformation } from "@/services/profileService";
import { getCountries, getStates, getCities } from "@/services/locationService";
import { SuccessModal, ErrorModal } from "@/app/components/shared/SuccessErrorModal";

const ProfilePage = () => {
  const { currentTheme } = useTheme();
  const [id, setId] = useState("");
  const [userData, setUserData] = useState({});
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [isChangePhotoModalOpen, setIsChangePhotoModalOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [countriesList, setCountriesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();
  const watchCountry = watch("country");
  const watchState = watch("department");

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

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setId(parsed.id);
      } catch (err) {
        console.error("Error parsing userData", err);
      }
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const response = await getUserData(id);
        if (response.success && response.data.length > 0) {
          const data = response.data[0];
          setUserData(data);

          if (data.country) {
            const states = await getStates(data.country);
            setStatesList(states);

            if (data.department) {
              const cities = await getCities(data.country, data.department);
              setCitiesList(cities);
            }
          }

          // Prefill form values
          setValue("country", data.country || "Colombia");
          setValue("department", data.department || "");
          setValue("address", data.address || "");
          setValue("phoneNumber", data.phone || "");

          if (data.profile_picture) {
            setProfilePhoto(data.profile_picture);
          }
        }
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    fetchData();
  }, [id, setValue]);

  useEffect(() => {
    if (citiesList.length > 0 && userData.city) {
      setValue("city", userData.city);
    }
  }, [citiesList, userData.city, setValue]);

  // Submit residencia
  const onSubmitResidence = async (data) => {
    try {
      const payload = {
        country: data.country,
        department: data.department,
        city: data.city,
        address: data.address,
        phone: data.phoneNumber,
      };
      const response = await updateBasicInformation(id, payload);
      setModalMessage(response.data.message);
      setSuccessOpen(true);
      setTimeout(() => {
        setSuccessOpen(false);
      }, 2000);
    } catch (error) {
      setModalMessage(error.response.data.detail);
      setErrorOpen(true);
    }
  };

  return (
    <div className="parametrization-page grid place-items-center py-8 px-4">
      {/* Title outside container */}
      <div className="w-full max-w-5xl 2xl:max-w-none xl:w-8/9 2xl:w-9/10">
        <h1 className="parametrization-header text-3xl font-bold mb-8">My profile</h1>

        <div className="bg-surface rounded-2xl shadow p-6 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Section */}
            <div className="grid place-items-center grid-rows-[auto_auto_auto_1fr] gap-6">
              {/* Avatar */}
              <div
                className="w-40 h-40 rounded-full parametrization-avatar relative cursor-pointer overflow-hidden flex items-center justify-center hadow-md transition-all duration-300 ease-in-out"
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
                    <HiOutlinePencilAlt className="text-4xl text-primary group-hover:text-primary-dark transition-colors" />
                    <div className="absolute -bottom-2 -right-2 parametrization-avatar-action opacity-0 group-hover:opacity-100 transition-opacity">
                      <HiOutlinePencilAlt className="w-4 h-4 text-white" />
                    </div>
                  </>
                )}
              </div>

              {/* Name */}
              <h2 className="text-xl font-bold text-center text-primary leading-tight">
                {userData.name} <br /> {userData.lastName}
              </h2>

              {/* Roles Section */}
              <div className="w-full">
                <div className="mb-3 text-center">
                  <span className="text-sm text-secondary font-medium">
                    Roles
                  </span>
                </div>

                {/* Roles Grid */}
                <div className="grid gap-2">
                  {userData?.roles?.map((role) => (
                    <span
                      key={role.id}
                      className="px-4 py-2 parametrization-badge text-sm rounded-full text-primary text-center font-medium"
                    >
                      {role.name}
                    </span>
                  ))}
                </div>

              </div>
            </div>

            {/* Right Section */}
            <div className="md:col-span-2 grid gap-6">
              {/* Personal info */}
              <h3 className="text-xl font-bold border-b pb-3 text-primary">
                Personal information
              </h3>

              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <p>
                  <span className="font-semibold">Name: </span>
                  {userData.name}
                </p>
                <p>
                  <span className="font-semibold">Last name: </span>
                  {`${userData.first_last_name || ""} ${userData.second_last_name || ""
                    }`}
                </p>
                <p>
                  <span className="font-semibold">Document type: </span>
                  {userData.type_document_name}
                </p>
                <p>
                  <span className="font-semibold">Document number: </span>
                  {userData.document_number}
                </p>
                <p>
                  <span className="font-semibold">Email: </span>
                  {userData.email}
                </p>
                <p>
                  <span className="font-semibold">Género: </span>
                  {userData.gender_name}
                </p>
                <p>
                  <span className="font-semibold">Birth date: </span>
                  {userData.birthday?.split("T")[0]}
                </p>
                <p>
                  <span className="font-semibold">Expedition date: </span>
                  {userData.date_issuance_document?.split("T")[0]}
                </p>
              </div>
              
              <h3 className="text-xl font-bold border-b pb-3 text-primary">
                Residencial information
              </h3>     
              <form
                id="residenceForm"
                onSubmit={handleSubmit(onSubmitResidence)}
                className="grid gap-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Country */}
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-2">
                      Country
                    </label>
                    <select
                      {...register("country", { required: true })}
                      className="w-full border rounded-lg px-3 py-2 bg-surface"
                    >
                      <option value="">Select...</option>
                      {countriesList.map((c) => (
                        <option key={c.iso2} value={c.iso2}>{c.name}</option>
                      ))}
                    </select>
                    {errors.country && (
                      <p className="text-red-500 text-xs mt-1">
                        Country is required
                      </p>
                    )}
                  </div>

                  {/* Region */}
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-2">
                      Region
                    </label>
                    <select
                      {...register("department", { required: true })} disabled={!statesList.length}
                      className="w-full border rounded-lg px-3 py-2 bg-surface"
                    >
                      <option value="">Select...</option>
                      {statesList.map((s) => (
                        <option key={s.iso2} value={s.iso2}>{s.name}</option>
                      ))}
                    </select>
                    {errors.department && (
                      <p className="text-red-500 text-xs mt-1">
                        Department is required
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-2">
                      City
                    </label>
                    <select
                      {...register("city", { required: true })} disabled={!citiesList.length}
                      className="w-full border rounded-lg px-3 py-2 bg-surface"
                    >
                      <option value="">Select...</option>
                      {citiesList.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">
                        City is required
                      </p>
                    )}
                  </div>
                </div>

                {/* Address + Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      {...register("address", {
                        required: "Address is required",
                        minLength: {
                          value: 10,
                          message: "At least 10 characters",
                        },
                      })}
                      placeholder="Example..."
                      className={`w-full border rounded-lg px-3 py-2 ${errors.address ? "border-red-500" : ""
                        }`}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-2">
                      Phone number
                    </label>
                    <input
                      type="text"
                      {...register("phoneNumber", {
                        required: "Phone number is required",
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "Must be 10 digits",
                        },
                      })}
                      className={`w-full border rounded-lg px-3 py-2 ${errors.phoneNumber
                        ? "border-red-500"
                        : ""
                        }`}
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.phoneNumber.message}
                      </p>
                    )}
                  </div>
                </div>
              </form>

              {/* Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
                <button
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  className="parametrization-action-button font-semibold px-8 py-3 rounded-lg justify-self-center md:justify-self-start"
                >
                  Change Password
                </button>
                <button
                  type="submit"
                  form="residenceForm"
                  className="parametrization-action-button font-semibold px-8 py-3 rounded-lg">
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />

      <ChangePhotoModal
        isOpen={isChangePhotoModalOpen}
        onClose={() => setIsChangePhotoModalOpen(false)}
        onSave={(newPhotoUrl) => setProfilePhoto(newPhotoUrl)}
      />
      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Update Successful"
        message={modalMessage}
      />
      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Update Failed"
        message={modalMessage}
      />
    </div>
  );
};

export default ProfilePage;
