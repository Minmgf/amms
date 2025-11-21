"use client";
import React, { useState, useEffect } from "react";
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiCalendar, FiEdit2 } from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";
import { SuccessModal, ErrorModal, ConfirmModal } from "@/app/components/shared/SuccessErrorModal";
import AddContractModal from "@/app/components/payroll/contractManagement/contracts/AddContractModal";
import * as employeeService from "@/services/employeeService";
import * as locationService from "@/services/locationService";

/**
 * RegisterEmployeeModal Component
 * 
 * Modal para registrar un nuevo empleado con datos personales, de contacto y laborales
 * Basado en HU-EMP-001
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controla si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSuccess - Función llamada cuando se registra exitosamente
 */
const RegisterEmployeeModal = ({ isOpen, onClose, onSuccess }) => {
  const { getCurrentTheme } = useTheme();

  // Estados del formulario
  const [formData, setFormData] = useState({
    // Datos personales
    firstName: "",
    secondName: "",
    firstLastName: "",
    secondLastName: "",
    identificationType: "",
    identificationNumber: "",
    gender: "",
    birthDate: "",
    
    // Datos de contacto
    email: "",
    phoneNumber: "",
    countryCode: "+57",
    country: "",
    state: "",
    city: "",
    address: "",
    
    // Datos laborales
    department: "",
    position: "",
    associatedContract: "",
    noveltyDescription: ""
  });

  // Estados de control
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [userExists, setUserExists] = useState(false);
  const [existingUserId, setExistingUserId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractTemplateToEdit, setContractTemplateToEdit] = useState(null);

  // Estados parametrizables (cargados desde el endpoint)
  const [identificationTypes, setIdentificationTypes] = useState([]);
  const [genders, setGenders] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [allPositions, setAllPositions] = useState([]); // Almacena todas las posiciones
  const [contracts, setContracts] = useState([]);

  // Datos de ubicación (cargados desde la API)
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Limpiar formulario y cargar datos parametrizables al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      // Limpiar formulario
      setFormData({
        firstName: "",
        secondName: "",
        firstLastName: "",
        secondLastName: "",
        identificationType: "",
        identificationNumber: "",
        gender: "",
        birthDate: "",
        email: "",
        phoneNumber: "",
        countryCode: "+57",
        country: "",
        state: "",
        city: "",
        address: "",
        department: "",
        position: "",
        associatedContract: "",
        noveltyDescription: ""
      });
      setErrors({});
      setUserExists(false);
      setExistingUserId(null);

      // Cargar datos parametrizables
      loadParametrizableData();
    }
  }, [isOpen]);

  // Función para cargar todos los datos parametrizables
  const loadParametrizableData = async () => {
    setLoading(true);
    try {
      const [
        documentTypesData,
        gendersData,
        departmentsData,
        countriesData
      ] = await Promise.all([
        employeeService.getDocumentTypes(),
        employeeService.getGenders(),
        employeeService.getDepartments(),
        locationService.getCountries()
      ]);

      if (documentTypesData.success) {
        setIdentificationTypes(documentTypesData.data || []);
      }

      if (gendersData.success) {
        setGenders(gendersData.data || []);
      }

      if (departmentsData.success) {
        setDepartments(departmentsData.data || []);
      }

      if (countriesData) {
        setCountries(countriesData || []);
      }
    } catch (error) {
      console.error("Error cargando datos parametrizables:", error);
      setErrorMessage("Error al cargar los datos del formulario. Por favor, intente nuevamente.");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Buscar usuario existente por documento
  const searchUserByDocument = async (documentNumber) => {
    if (!documentNumber || documentNumber.length < 5) {
      setUserExists(false);
      setExistingUserId(null);
      return;
    }
    
    setLoading(true);
    try {
      const response = await employeeService.getUserByDocument(documentNumber);
      
      if (response && response.success && response.data) {
        // Usuario encontrado - precargar datos
        setUserExists(true);
        setExistingUserId(response.data.id);
        
        setFormData(prev => ({
          ...prev,
          firstName: response.data.name || "",
          firstLastName: response.data.first_last_name || "",
          secondLastName: response.data.second_last_name || "",
          identificationType: response.data.type_document?.toString() || "",
          email: response.data.email || "",
          phoneNumber: response.data.phone || "",
          address: response.data.address || "",
          gender: response.data.gender_id?.toString() || "",
          birthDate: response.data.birthday || "",
          country: response.data.country || "",
          state: response.data.department || "",
          city: response.data.city?.toString() || "" // Ya viene como ID
        }));
        
        // Cargar estados y ciudades si hay datos de ubicación
        if (response.data.country) {
          const selectedCountry = countries.find(c => c.name === response.data.country);
          if (selectedCountry && selectedCountry.iso2) {
            const statesData = await locationService.getStates(selectedCountry.iso2);
            setStates(statesData || []);
            
            if (response.data.department) {
              const selectedState = statesData?.find(s => s.name === response.data.department);
              if (selectedState && selectedState.iso2) {
                const citiesData = await locationService.getCities(selectedCountry.iso2, selectedState.iso2);
                setCities(citiesData || []);
              }
            }
          }
        }
      } else {
        // Usuario no encontrado
        setUserExists(false);
        setExistingUserId(null);
      }
    } catch (error) {
      console.error("Error buscando usuario:", error);
      setUserExists(false);
      setExistingUserId(null);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = async (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }

    // Buscar usuario si es número de documento
    if (field === "identificationNumber") {
      searchUserByDocument(value);
    }

    // Cargar posiciones cuando se selecciona departamento
    if (field === "department" && value) {
      setFormData(prev => ({ ...prev, position: "", associatedContract: "" }));
      setPositions([]);
      setContracts([]);
      
      try {
        const response = await employeeService.getPositions(value);
        if (response.success) {
          setAllPositions(response.data || []);
          setPositions(response.data || []);
        }
      } catch (error) {
        console.error("Error cargando posiciones:", error);
      }
    }

    // Cargar contratos cuando se selecciona posición
    if (field === "position" && value) {
      setFormData(prev => ({ ...prev, associatedContract: "" }));
      setContracts([]);
      
      try {
        const response = await employeeService.getEstablishedContracts(value);
        if (response.success) {
          setContracts(response.data || []);
        }
      } catch (error) {
        console.error("Error cargando contratos:", error);
      }
    }

    // Cargar estados cuando se selecciona país
    if (field === "country" && value) {
      setFormData(prev => ({ ...prev, state: "", city: "" }));
      setStates([]);
      setCities([]);
      
      try {
        // Buscar el código ISO2 del país seleccionado
        const selectedCountry = countries.find(c => c.name === value || c.iso2 === value);
        if (selectedCountry && selectedCountry.iso2) {
          const statesData = await locationService.getStates(selectedCountry.iso2);
          setStates(statesData || []);
        }
      } catch (error) {
        console.error("Error cargando estados:", error);
      }
    }

    // Cargar ciudades cuando se selecciona estado
    if (field === "state" && value) {
      setFormData(prev => ({ ...prev, city: "" }));
      setCities([]);
      
      try {
        // Buscar el país y estado seleccionados
        const selectedCountry = countries.find(c => c.name === formData.country || c.iso2 === formData.country);
        const selectedState = states.find(s => s.name === value || s.iso2 === value);
        
        if (selectedCountry && selectedCountry.iso2 && selectedState && selectedState.iso2) {
          const citiesData = await locationService.getCities(selectedCountry.iso2, selectedState.iso2);
          setCities(citiesData || []);
        }
      } catch (error) {
        console.error("Error cargando ciudades:", error);
      }
    }
  };

  // Abrir modal de creación de contrato
  const handleOpenCreateContract = () => {
    setContractTemplateToEdit(null);
    setIsContractModalOpen(true);
  };

  // Abrir modal de edición de contrato (cuando hay contrato seleccionado)
  const handleOpenEditContract = async () => {
    if (!formData.associatedContract) return;

    try {
      setLoading(true);
      
      // Obtener los detalles del contrato desde la API
      const contractDetails = await employeeService.getEstablishedContractDetails(
        formData.associatedContract
      );

      if (!contractDetails) {
        setErrorMessage("No se pudieron cargar los detalles del contrato");
        setShowErrorModal(true);
        return;
      }

      // Preparar template con los datos del contrato para el modal de edición
      const templateForEdit = {
        // Información general
        department: formData.department,
        charge: formData.position,
        description: contractDetails.description || "",
        contractType: contractDetails.contract_type?.toString() || "",
        startDate: contractDetails.start_date || "",
        endDate: contractDetails.end_date || "",
        paymentFrequency: contractDetails.payment_frequency_type || "",
        minimumHours: contractDetails.minimum_hours?.toString() || "",
        workday: contractDetails.workday_type?.toString() || "",
        workModality: contractDetails.work_mode_type?.toString() || "",
        
        // Términos del contrato
        salaryType: contractDetails.salary_type || "",
        baseSalary: contractDetails.salary_base?.toString() || "",
        currency: contractDetails.currency_type || "",
        trialPeriod: contractDetails.trial_period_days?.toString() || "",
        vacationDays: contractDetails.vacation_days?.toString() || "",
        cumulative: contractDetails.cumulative_vacation ? "yes" : "no",
        effectiveFrom: contractDetails.start_cumulative_vacation || "",
        vacationGrantFrequency: contractDetails.vacation_frequency_days?.toString() || "",
        maximumDisabilityDays: contractDetails.maximum_disability_days?.toString() || "",
        maximumOvertime: contractDetails.overtime?.toString() || "",
        overtimePeriod: contractDetails.overtime_period || "",
        terminationNoticePeriod: contractDetails.notice_period_days?.toString() || "",
        
        // Pagos, deducciones e incrementos
        contract_payments: contractDetails.contract_payments || [],
        established_deductions: contractDetails.established_deductions || [],
        established_increases: contractDetails.established_increases || []
      };

      setContractTemplateToEdit(templateForEdit);
      setIsContractModalOpen(true);
    } catch (error) {
      console.error("Error cargando detalles del contrato:", error);
      setErrorMessage("Error al cargar los detalles del contrato");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Campos obligatorios
    if (!formData.firstName.trim()) newErrors.firstName = "El primer nombre es obligatorio";
    if (!formData.firstLastName.trim()) newErrors.firstLastName = "El primer apellido es obligatorio";
    if (!formData.identificationType) newErrors.identificationType = "El tipo de documento es obligatorio";
    if (!formData.identificationNumber.trim()) newErrors.identificationNumber = "El número de documento es obligatorio";
    if (!formData.gender) newErrors.gender = "El género es obligatorio";
    if (!formData.birthDate) newErrors.birthDate = "La fecha de nacimiento es obligatoria";
    if (!formData.country) newErrors.country = "El país es obligatorio";
    if (!formData.department) newErrors.department = "El departamento es obligatorio";
    if (!formData.position) newErrors.position = "El cargo es obligatorio";
    if (!formData.associatedContract) newErrors.associatedContract = "Debe seleccionar un contrato";
    if (!formData.noveltyDescription.trim()) newErrors.noveltyDescription = "La descripción de la novedad es obligatoria";

    // Validar mayoría de edad
    if (formData.birthDate) {
      const today = new Date();
      const birthDate = new Date(formData.birthDate);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        newErrors.birthDate = "El empleado debe ser mayor de edad";
      }
    }

    // Validar email si se proporciona
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El formato del correo electrónico no es válido";
    }

    // Validar teléfono si se proporciona
    if (formData.phoneNumber && !/^\d{7,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "El teléfono debe tener entre 7 y 15 dígitos";
    }

    // Al menos email o teléfono
    if (!formData.email && !formData.phoneNumber) {
      newErrors.email = "Debe proporcionar al menos email o teléfono";
      newErrors.phoneNumber = "Debe proporcionar al menos email o teléfono";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      let userId = existingUserId;

      // Paso 1: Crear o actualizar usuario si es necesario
      if (userExists && existingUserId) {
        // Actualizar usuario existente si hay cambios
        const userData = {
          name: formData.firstName,
          first_last_name: formData.firstLastName,
          second_last_name: formData.secondLastName || null,
          type_document_id: parseInt(formData.identificationType),
          date_issuance_document: formData.birthDate, // Nota: ajustar si hay campo separado
          birthday: formData.birthDate,
          gender_id: parseInt(formData.gender),
          country: formData.country,
          department: formData.state,
          city: parseInt(formData.city) || null,
          address: formData.address,
          phone: formData.phoneNumber || null
        };

        await employeeService.updateUser(existingUserId, userData);
      } else {
        // Crear nuevo usuario
        const userData = {
          name: formData.firstName,
          first_last_name: formData.firstLastName,
          second_last_name: formData.secondLastName || null,
          type_document_id: parseInt(formData.identificationType),
          document_number: formData.identificationNumber,
          date_issuance_document: formData.birthDate, // Nota: ajustar según requerimientos
          birthday: formData.birthDate,
          gender_id: parseInt(formData.gender),
          country: formData.country,
          department: formData.state,
          city: parseInt(formData.city) || null,
          address: formData.address,
          phone: formData.phoneNumber || null
        };

        const createUserResponse = await employeeService.createUser(userData);
        if (createUserResponse.success && createUserResponse.data) {
          userId = createUserResponse.data.id;
        } else {
          throw new Error("No se pudo crear el usuario");
        }
      }

      // Paso 2: Obtener detalles del contrato seleccionado
      const contractDetailsResponse = await employeeService.getEstablishedContractDetails(
        formData.associatedContract
      );

      if (!contractDetailsResponse || !contractDetailsResponse.contract_code) {
        throw new Error("No se pudieron obtener los detalles del contrato");
      }

      const contractDetails = contractDetailsResponse;

      // Paso 3: Preparar datos del empleado con contrato
      const employeeData = {
        id_user: userId,
        email: formData.email || null,
        observation: formData.noveltyDescription,
        id_employee_charge: parseInt(formData.position),
        contract: [
          {
            description: contractDetails.description || "",
            contract_type: contractDetails.contract_type,
            start_date: contractDetails.start_date,
            end_date: contractDetails.end_date || null,
            payment_frequency_type: contractDetails.payment_frequency_type,
            minimum_hours: contractDetails.minimum_hours,
            workday_type: contractDetails.workday_type,
            work_mode_type: contractDetails.work_mode_type,
            salary_type: contractDetails.salary_type,
            salary_base: contractDetails.salary_base,
            currency_type: contractDetails.currency_type,
            trial_period_days: contractDetails.trial_period_days,
            vacation_days: contractDetails.vacation_days,
            vacation_frequency_days: contractDetails.vacation_frequency_days,
            cumulative_vacation: contractDetails.cumulative_vacation,
            start_cumulative_vacation: contractDetails.start_cumulative_vacation || null,
            maximum_disability_days: contractDetails.maximum_disability_days,
            overtime: contractDetails.overtime,
            overtime_period: contractDetails.overtime_period,
            notice_period_days: contractDetails.notice_period_days,
            contract_payments: contractDetails.contract_payments || [],
            established_deductions: contractDetails.established_deductions || [],
            established_increases: contractDetails.established_increases || []
          }
        ]
      };

      // Paso 4: Crear empleado
      const createEmployeeResponse = await employeeService.createEmployee(employeeData);

      if (createEmployeeResponse.success) {
        setShowSuccessModal(true);
        if (onSuccess) onSuccess();
      } else {
        throw new Error(createEmployeeResponse.message || "Error al crear el empleado");
      }
    } catch (error) {
      console.error("Error al registrar empleado:", error);
      
      let errorMsg = "Error al registrar el empleado. Por favor, intente nuevamente.";
      
      // Manejar errores específicos del backend
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.errors) {
          // Construir mensaje de error detallado
          const errorMessages = [];
          Object.entries(errorData.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              errorMessages.push(`${field}: ${messages.join(", ")}`);
            }
          });
          errorMsg = errorMessages.length > 0 
            ? errorMessages.join("\n") 
            : errorData.message || errorMsg;
        } else if (errorData.message) {
          errorMsg = errorData.message;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cancelación
  const handleCancel = () => {
    const hasData = Object.values(formData).some(value => value.trim() !== "");
    if (hasData) {
      setShowConfirmModal(true);
    } else {
      onClose();
    }
  };

  // Confirmar cancelación
  const confirmCancel = () => {
    setShowConfirmModal(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && handleCancel()}
      >
        <div className="card-theme rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-primary">
            <h2 className="text-2xl font-bold text-primary">Nuevo Empleado</h2>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-hover rounded-full transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <FiX className="w-6 h-6 text-secondary" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto max-h-[calc(95vh-90px)]">
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              
              {/* Personal Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FiUser className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary">Información Personal</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Primer nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={`input-theme ${errors.firstName ? 'border-red-500' : ''}`}
                      placeholder="Ingrese primer nombre"
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Segundo nombre
                    </label>
                    <input
                      type="text"
                      value={formData.secondName}
                      onChange={(e) => handleInputChange("secondName", e.target.value)}
                      className="input-theme"
                      placeholder="Ingrese segundo nombre"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Primer apellido *
                    </label>
                    <input
                      type="text"
                      value={formData.firstLastName}
                      onChange={(e) => handleInputChange("firstLastName", e.target.value)}
                      className={`input-theme ${errors.firstLastName ? 'border-red-500' : ''}`}
                      placeholder="Ingrese primer apellido"
                    />
                    {errors.firstLastName && <p className="text-red-500 text-xs mt-1">{errors.firstLastName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Segundo apellido
                    </label>
                    <input
                      type="text"
                      value={formData.secondLastName}
                      onChange={(e) => handleInputChange("secondLastName", e.target.value)}
                      className="input-theme"
                      placeholder="Ingrese segundo apellido"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Tipo de identificación *
                    </label>
                    <select
                      value={formData.identificationType}
                      onChange={(e) => handleInputChange("identificationType", e.target.value)}
                      className={`input-theme ${errors.identificationType ? 'border-red-500' : ''}`}
                    >
                      <option value="">Seleccione tipo de identificación</option>
                      {identificationTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    {errors.identificationType && <p className="text-red-500 text-xs mt-1">{errors.identificationType}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Número de identificación *
                    </label>
                    <input
                      type="text"
                      value={formData.identificationNumber}
                      onChange={(e) => handleInputChange("identificationNumber", e.target.value)}
                      className={`input-theme ${errors.identificationNumber ? 'border-red-500' : ''}`}
                      placeholder="Ingrese número de identificación"
                    />
                    {errors.identificationNumber && <p className="text-red-500 text-xs mt-1">{errors.identificationNumber}</p>}
                    {userExists && (
                      <p className="text-blue-600 text-xs mt-1">✓ Usuario encontrado - datos precargados</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Género *
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      className={`input-theme ${errors.gender ? 'border-red-500' : ''}`}
                    >
                      <option value="">Seleccione género</option>
                      {genders.map(gender => (
                        <option key={gender.id} value={gender.id}>
                          {gender.name}
                        </option>
                      ))}
                    </select>
                    {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Fecha de nacimiento *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange("birthDate", e.target.value)}
                        placeholder=""
                        className={`input-theme pr-12 ${errors.birthDate ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
                  </div>
                </div>
              </div>

              {/* Contact Data */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-md bg-green-100 flex items-center justify-center flex-shrink-0">
                    <FiMail className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary">Datos de Contacto</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`input-theme ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="Ingrese correo electrónico"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Número de teléfono
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={formData.countryCode}
                        onChange={(e) => handleInputChange("countryCode", e.target.value)}
                        className="input-theme flex-shrink-0"
                        style={{ width: '25%' }}
                      >
                        <option value="+57">+57</option>
                        <option value="+1">+1</option>
                        <option value="+34">+34</option>
                      </select>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                        className={`input-theme flex-1 ${errors.phoneNumber ? 'border-red-500' : ''}`}
                        placeholder="Ingrese numero de telefono"
                      />
                    </div>
                    {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      País *
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      className={`input-theme ${errors.country ? 'border-red-500' : ''}`}
                    >
                      <option value="">Seleccione país</option>
                      {countries.map(country => (
                        <option key={country.iso2} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Departamento/Estado
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      className="input-theme"
                      disabled={!formData.country}
                    >
                      <option value="">Seleccione departamento/estado</option>
                      {states.map(state => (
                        <option key={state.iso2} value={state.name}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Ciudad
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="input-theme"
                      disabled={!formData.state}
                    >
                      <option value="">Seleccione ciudad</option>
                      {cities.map(city => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="input-theme"
                      placeholder="Ingrese dirección"
                    />
                  </div>
                </div>
              </div>

              {/* Contract Data */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-md bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <FiBriefcase className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary">Datos Contractuales</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Departamento *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => handleInputChange("department", e.target.value)}
                      className={`input-theme ${errors.department ? 'border-red-500' : ''}`}
                    >
                      <option value="">Seleccione departamento</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Cargo *
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) => handleInputChange("position", e.target.value)}
                      className={`input-theme ${errors.position ? 'border-red-500' : ''}`}
                      disabled={!formData.department}
                    >
                      <option value="">Seleccione cargo</option>
                      {positions.map(pos => (
                        <option key={pos.id} value={pos.id}>
                          {pos.name}
                        </option>
                      ))}
                    </select>
                    {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Contrato asociado *
                    </label>
                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                      <select
                        value={formData.associatedContract}
                        onChange={(e) => handleInputChange("associatedContract", e.target.value)}
                        className={`input-theme flex-1 ${errors.associatedContract ? 'border-red-500' : ''}`}
                        disabled={!formData.position}
                      >
                        <option value="">Seleccione contrato</option>
                        {contracts.map(contract => (
                          <option key={contract.id || contract.contract_code} value={contract.id || contract.contract_code}>
                            {contract.contract_code} - {contract.contract_type_name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn-theme btn-primary whitespace-nowrap flex items-center gap-2"
                        onClick={handleOpenCreateContract}
                      >
                        <FiBriefcase className="w-4 h-4" />
                        Crear contrato
                      </button>
                      {formData.associatedContract && (
                        <button
                          type="button"
                          className="btn-theme btn-secondary whitespace-nowrap flex items-center gap-2"
                          onClick={handleOpenEditContract}
                        >
                          <FiEdit2 className="w-4 h-4" />
                          Editar contrato
                        </button>
                      )}
                    </div>
                    {errors.associatedContract && <p className="text-red-500 text-xs mt-1">{errors.associatedContract}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Descripción de la novedad *
                    </label>
                    <textarea
                      value={formData.noveltyDescription}
                      onChange={(e) => handleInputChange("noveltyDescription", e.target.value)}
                      className={`input-theme ${errors.noveltyDescription ? 'border-red-500' : ''}`}
                      rows={4}
                      placeholder="Ingrese descripción de la novedad o justificación para el registro del empleado"
                    />
                    {errors.noveltyDescription && <p className="text-red-500 text-xs mt-1">{errors.noveltyDescription}</p>}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6 pb-6 border-t border-primary">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-theme btn-error flex-1"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-theme btn-primary flex-1 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block" />
                      Registrando...
                    </>
                  ) : (
                    "Registrar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modales de confirmación y resultado */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmCancel}
        title="Confirmar Acción"
        message="¿Desea descartar los datos ingresados? Los cambios no se guardarán."
        confirmText="Confirmar"
        cancelText="Cancelar"
        confirmColor="btn-primary"
        cancelColor="btn-error"
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
        }}
        title="Empleado Registrado"
        message="Empleado registrado correctamente y contrato asociado con éxito."
      />

      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error de Registro"
        message={errorMessage}
        buttonText="Intentar de Nuevo"
      />

      <AddContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        contractToEdit={contractTemplateToEdit}
        onSuccess={() => {
          setIsContractModalOpen(false);
        }}
      />
    </>
  );
};

export default RegisterEmployeeModal;
