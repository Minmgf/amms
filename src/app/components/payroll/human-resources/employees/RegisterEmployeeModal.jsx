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
 * Modal para registrar o editar un empleado con datos personales, de contacto y laborales
 * Basado en HU-EMP-001 (Creación) y HU-EMP-009 (Edición)
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controla si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSuccess - Función llamada cuando se registra/actualiza exitosamente
 * @param {string} props.mode - Modo del modal: "create" o "edit" (default: "create")
 * @param {number} props.employeeId - ID del empleado (requerido en modo "edit")
 */
const RegisterEmployeeModal = ({
  isOpen,
  onClose,
  onSuccess,
  mode = "create",
  employeeId = null
}) => {
  const { getCurrentTheme } = useTheme();
  const isEditMode = mode === "edit";

  // Estados del formulario
  const [formData, setFormData] = useState({
    // Datos personales
    firstName: "",
    secondName: "",
    firstLastName: "",
    secondLastName: "",
    identificationType: "",
    identificationNumber: "",
    dateIssuance: "",
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
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractTemplateToEdit, setContractTemplateToEdit] = useState(null);
  const [contractsLoading, setContractsLoading] = useState(false);

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

  // Estado para almacenar ID de usuario (necesario para actualización)
  const [userId, setUserId] = useState(null);

  // Limpiar formulario y cargar datos parametrizables al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && employeeId) {
        // Modo edición: cargar datos del empleado
        loadEmployeeDataForEdit();
      } else {
        // Modo creación: limpiar formulario
        setFormData({
          firstName: "",
          secondName: "",
          firstLastName: "",
          secondLastName: "",
          identificationType: "",
          identificationNumber: "",
          dateIssuance: "",
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
        setUserId(null);
      }

      // Cargar datos parametrizables
      loadParametrizableData();
    }
  }, [isOpen, isEditMode, employeeId]);

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

  // Función para cargar datos del empleado en modo edición (HU-EMP-009)
  const loadEmployeeDataForEdit = async () => {
    setLoading(true);
    try {
      // 1. Obtener detalles del empleado
      const employeeDetails = await employeeService.getEmployeeDetails(employeeId);

      if (!employeeDetails) {
        throw new Error("No se pudieron cargar los detalles del empleado");
      }

      // 2. Obtener información del usuario
      const userIdFromEmployee = employeeDetails.id_user;
      setUserId(userIdFromEmployee);
      setExistingUserId(userIdFromEmployee);
      setUserExists(true);

      const userData = await employeeService.getUserById(userIdFromEmployee);
      const userInfo = userData.success && userData.data && userData.data.length > 0
        ? userData.data[0]
        : null;

      if (!userInfo) {
        throw new Error("No se pudo cargar la información del usuario");
      }

      // 3. Obtener contrato actual
      const contractData = await employeeService.getLatestEmployeeContract(employeeId);

      // 4. Separar nombre completo en primer y segundo nombre
      const fullName = userInfo.name || "";
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const secondName = nameParts.slice(1).join(" ") || "";

      // 5. Precargar formulario con datos del empleado
      setFormData({
        firstName: firstName,
        secondName: secondName,
        firstLastName: userInfo.first_last_name || "",
        secondLastName: userInfo.second_last_name || "",
        identificationType: userInfo.type_document_id?.toString() || "",
        identificationNumber: userInfo.document_number?.toString() || "",
        dateIssuance: userInfo.date_issuance_document?.split('T')[0] || "",
        gender: userInfo.gender_id?.toString() || "",
        birthDate: userInfo.birthday?.split('T')[0] || "",
        email: employeeDetails.email || userInfo.email || "",
        phoneNumber: userInfo.phone || "",
        countryCode: "+57",
        country: userInfo.country || "",
        state: userInfo.department || "",
        city: userInfo.city?.toString() || "",
        address: userInfo.address || "",
        department: employeeDetails.id_employee_department?.toString() || "",
        position: contractData?.id_employee_charge?.toString() || "",
        associatedContract: contractData?.contract_code || "",
        noveltyDescription: ""
      });

      // 6. Cargar posiciones según departamento
      if (employeeDetails.id_employee_department) {
        const positionsData = await employeeService.getPositions(employeeDetails.id_employee_department);
        if (positionsData.success) {
          setAllPositions(positionsData.data || []);
          setPositions(positionsData.data || []);
        }
      }

      // 7. Cargar estados y ciudades según país
      if (userInfo.country) {
        const selectedCountry = countries.find(c => c.name === userInfo.country);
        if (selectedCountry && selectedCountry.iso2) {
          const statesData = await locationService.getStates(selectedCountry.iso2);
          setStates(statesData || []);

          if (userInfo.department) {
            const selectedState = statesData?.find(s => s.name === userInfo.department);
            if (selectedState && selectedState.iso2) {
              const citiesData = await locationService.getCities(selectedCountry.iso2, selectedState.iso2);
              setCities(citiesData || []);
            }
          }
        }
      }

      setErrors({});
    } catch (error) {
      console.error("Error cargando datos del empleado para edición:", error);
      setErrorMessage("Error al cargar los datos del empleado. Por favor, intente nuevamente.");
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

        // Intentar separar el primer nombre del segundo nombre
        const fullName = response.data.name || "";
        const nameParts = fullName.trim().split(/\s+/); // Dividir por espacios
        const firstName = nameParts[0] || "";
        const secondName = nameParts.slice(1).join(" ") || ""; // Todo después del primer espacio

        // Resolver ubicación (País, Departamento, Ciudad)
        let countryName = response.data.country || "";
        let stateName = response.data.department || "";
        let cityId = response.data.city?.toString() || "";

        // 1. Resolver País (puede venir como ISO2 "CO" o nombre "Colombia")
        const selectedCountry = countries.find(c => 
          c.name === response.data.country || c.iso2 === response.data.country
        );
        
        if (selectedCountry) {
          countryName = selectedCountry.name;
          
          // Cargar estados del país encontrado
          const statesData = await locationService.getStates(selectedCountry.iso2);
          setStates(statesData || []);

          // 2. Resolver Departamento (puede venir como ISO2 "HUI" o nombre "Huila")
          if (response.data.department) {
            const selectedState = statesData?.find(s => 
              s.name === response.data.department || s.iso2 === response.data.department
            );

            if (selectedState) {
              stateName = selectedState.name;

              // Cargar ciudades del departamento encontrado
              const citiesData = await locationService.getCities(selectedCountry.iso2, selectedState.iso2);
              setCities(citiesData || []);
            }
          }
        }

        setFormData(prev => ({
          ...prev,
          firstName: firstName,
          secondName: secondName,
          firstLastName: response.data.first_last_name || "",
          secondLastName: response.data.second_last_name || "",
          identificationType: response.data.type_document?.toString() || "",
          email: response.data.email || "",
          phoneNumber: response.data.phone || "",
          address: response.data.address || "",
          gender: response.data.gender_id?.toString() || "",
          birthDate: response.data.birthday || "",
          country: countryName,
          state: stateName,
          city: cityId
        }));

      } else {
        // Usuario no encontrado
        setUserExists(false);
        setExistingUserId(null);
      }
    } catch (error) {
      console.error("Error buscando usuario:", error);

      // Mostrar error al usuario cuando falla la búsqueda
      if (error.response?.status !== 404) {
        setErrorMessage("Error al buscar el usuario. Por favor, verifique su conexión e intente nuevamente.");
        setShowErrorModal(true);
      }

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
    if (field === "identificationNumber" && !isEditMode) {
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
      setContractsLoading(true);
      
      try {
        const response = await employeeService.getEstablishedContracts(value);
        if (response.success) {
          // ⚠️ ADVERTENCIA: El endpoint de listar contratos NO retorna el campo 'id'
          // Ver documentación en employeeService.js líneas 67-94 para más detalles
          // Workaround: Se usa contract.id || contract.contract_code en el selector
          setContracts(response.data || []);
        }
      } catch (error) {
        console.error("Error cargando contratos:", error);
      } finally {
        setContractsLoading(false);
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
  const handleOpenEditContract = () => {
    if (!formData.associatedContract) return;

    // Pasar solo el código del contrato; AddContractModal se encarga de
    // obtener y mapear el detalle completo usando getContractDetail
    setContractTemplateToEdit({
      contract_code: formData.associatedContract
    });
    setIsContractModalOpen(true);
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Campos obligatorios - Datos personales
    if (!formData.firstName.trim()) newErrors.firstName = "El primer nombre es obligatorio";
    if (!formData.firstLastName.trim()) newErrors.firstLastName = "El primer apellido es obligatorio";
    if (!formData.identificationType) newErrors.identificationType = "El tipo de documento es obligatorio";
    if (!formData.identificationNumber.trim()) newErrors.identificationNumber = "El número de documento es obligatorio";
    if (!formData.dateIssuance) newErrors.dateIssuance = "La fecha de expedición del documento es obligatoria";
    if (!formData.gender) newErrors.gender = "El género es obligatorio";
    if (!formData.birthDate) newErrors.birthDate = "La fecha de nacimiento es obligatoria";
    
    // Campos obligatorios - Datos de contacto
    if (!formData.country) newErrors.country = "El país es obligatorio";
    if (!formData.state) newErrors.state = "El estado/departamento es obligatorio";
    if (!formData.city) newErrors.city = "La ciudad es obligatoria";
    if (!formData.address.trim()) newErrors.address = "La dirección es obligatoria";
    
    // Campos obligatorios - Datos laborales
    if (!formData.department) newErrors.department = "El departamento es obligatorio";
    if (!formData.position) newErrors.position = "El cargo es obligatorio";
    if (!formData.associatedContract) newErrors.associatedContract = "Debe seleccionar o crear un contrato antes de guardar";
    if (!formData.noveltyDescription.trim()) newErrors.noveltyDescription = "La descripción de la novedad es obligatoria";

    // Validar fecha de expedición no futura
    if (formData.dateIssuance) {
      const today = new Date();
      const issuanceDate = new Date(formData.dateIssuance);
      if (issuanceDate > today) {
        newErrors.dateIssuance = "La fecha de expedición no puede ser posterior a la fecha actual";
      }
    }

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
        newErrors.birthDate = "El empleado debe ser mayor de edad (18 años)";
      }
      
      // Validar que no sea fecha futura
      if (birthDate > today) {
        newErrors.birthDate = "La fecha de nacimiento no puede ser posterior a la fecha actual";
      }
    }

    // Validar email si se proporciona
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El formato del correo electrónico no es válido";
    }

    // Validar teléfono si se proporciona
    if (formData.phoneNumber) {
      // Remover espacios, guiones y paréntesis para contar solo dígitos
      const digitsOnly = formData.phoneNumber.replace(/[\s\-()]/g, '');

      // Validar que contenga solo dígitos (después de remover caracteres permitidos)
      if (!/^\d{7,15}$/.test(digitsOnly)) {
        newErrors.phoneNumber = "El teléfono debe tener entre 7 y 15 dígitos numéricos";
      }
    }

    // Al menos email o teléfono
    if (!formData.email && !formData.phoneNumber) {
      newErrors.email = "Debe proporcionar al menos correo electrónico o teléfono";
      newErrors.phoneNumber = "Debe proporcionar al menos correo electrónico o teléfono";
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
      // Limpiar número de teléfono (solo dígitos) antes de enviar al backend
      const cleanPhoneNumber = formData.phoneNumber
        ? formData.phoneNumber.replace(/[\s\-()]/g, '')
        : null;

      // Concatenar primer y segundo nombre para el campo 'name' del backend
      // El backend espera primer y segundo nombre en un solo campo 'name'
      const fullName = formData.secondName
        ? `${formData.firstName} ${formData.secondName}`.trim()
        : formData.firstName;

      // Preparar datos del usuario
      const userData = {
        name: fullName,
        first_last_name: formData.firstLastName,
        second_last_name: formData.secondLastName || null,
        type_document_id: parseInt(formData.identificationType),
        date_issuance_document: formData.dateIssuance,
        birthday: formData.birthDate,
        gender_id: parseInt(formData.gender),
        country: formData.country,
        department: formData.state,
        city: parseInt(formData.city),
        address: formData.address,
        phone: cleanPhoneNumber
      };

      if (isEditMode) {
        // ============ MODO EDICIÓN (HU-EMP-009) ============

        // Paso 1: Actualizar usuario
        await employeeService.updateUser(userId, userData);

        // Paso 2: Actualizar empleado
        const employeeUpdateData = {
          email: formData.email || null,
          id_employee_charge: parseInt(formData.position),
          observation: formData.noveltyDescription
        };

        const updateResponse = await employeeService.updateEmployee(employeeId, employeeUpdateData);

        if (updateResponse || updateResponse?.message) {
          setSuccessMessage(updateResponse.message || "La información del empleado se ha actualizado correctamente.");
          setShowSuccessModal(true);
          if (onSuccess) onSuccess();
        } else {
          throw new Error(updateResponse?.message || "Error al actualizar el empleado");
        }

      } else {
        // ============ MODO CREACIÓN (HU-EMP-001) ============

        let userIdForEmployee = existingUserId;

        // Paso 1: Crear o actualizar usuario
        if (userExists && existingUserId) {
          // Actualizar usuario existente si hay cambios
          await employeeService.updateUser(existingUserId, userData);
        } else {
          // Crear nuevo usuario
          const createUserData = {
            ...userData,
            document_number: formData.identificationNumber
          };

          const createUserResponse = await employeeService.createUser(createUserData);

          if (createUserResponse && createUserResponse.success) {
            const newUserId = parseInt(
              createUserResponse.id_user ||
              createUserResponse.user_id ||
              (createUserResponse.data && (createUserResponse.data.id_user || createUserResponse.data.id)) ||
              createUserResponse.id,
              10
            );

            if (!newUserId || Number.isNaN(newUserId)) {
              throw new Error("El usuario se creó pero no se pudo obtener su identificador (id_user) desde el servidor.");
            }

            userIdForEmployee = newUserId;
          } else {
            throw new Error(createUserResponse?.message || "No se pudo crear el usuario");
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
          id_user: userIdForEmployee,
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

        // Validar respuesta exitosa (puede venir con success:true o con data)
        if (createEmployeeResponse.success || createEmployeeResponse.data) {
          setSuccessMessage(createEmployeeResponse.message || "Empleado registrado correctamente y contrato asociado exitosamente.");
          setShowSuccessModal(true);
          if (onSuccess) onSuccess();
        } else {
          throw new Error(createEmployeeResponse.message || "Error al crear el empleado");
        }
      }
    } catch (error) {
      console.error(`Error al ${isEditMode ? 'actualizar' : 'registrar'} empleado:`, error);

      let errorMsg = `Error al ${isEditMode ? 'actualizar' : 'registrar'} el empleado. Por favor, intente nuevamente.`;

      // Manejar errores específicos del backend
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.errors) {
          // Mapear errores específicos según la HU
          const errorMessages = [];
          Object.entries(errorData.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              const errorText = messages.join(", ");

              // Mensajes específicos según la HU
              if (field === "id_user" && errorText.includes("asociado a otro empleado")) {
                errorMessages.push("El número de documento ya se encuentra registrado.");
              } else if (field === "email" && errorText.includes("Ya existe")) {
                errorMessages.push("Ya existe un empleado con este correo electrónico.");
              } else if (field === "document_number" && errorText.includes("usado")) {
                errorMessages.push("El número de documento ya se encuentra registrado.");
              } else if (errorText.includes("correo") || errorText.includes("email")) {
                errorMessages.push("El formato del correo electrónico no es válido.");
              } else {
                errorMessages.push(`${field}: ${errorText}`);
              }
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
            <h2 className="text-2xl font-bold text-primary">
              {isEditMode ? "Editar Empleado" : "Nuevo Empleado"}
            </h2>
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
                      Número de identificación * {isEditMode && "(Solo lectura)"}
                    </label>
                    <input
                      type="text"
                      value={formData.identificationNumber}
                      onChange={(e) => handleInputChange("identificationNumber", e.target.value)}
                      className={`input-theme ${errors.identificationNumber ? 'border-red-500' : ''} ${isEditMode ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
                      placeholder="Ingrese número de identificación"
                      disabled={isEditMode}
                      readOnly={isEditMode}
                    />
                    {errors.identificationNumber && <p className="text-red-500 text-xs mt-1">{errors.identificationNumber}</p>}
                    {userExists && !isEditMode && (
                      <p className="text-blue-600 text-xs mt-1">✓ Usuario encontrado - datos precargados</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Fecha de expedición del documento *
                    </label>
                    <input
                      type="date"
                      value={formData.dateIssuance}
                      onChange={(e) => handleInputChange("dateIssuance", e.target.value)}
                      className={`input-theme ${errors.dateIssuance ? 'border-red-500' : ''}`}
                    />
                    {errors.dateIssuance && <p className="text-red-500 text-xs mt-1">{errors.dateIssuance}</p>}
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
                      Departamento/Estado *
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      className={`input-theme ${errors.state ? 'border-red-500' : ''}`}
                      disabled={!formData.country}
                    >
                      <option value="">Seleccione departamento/estado</option>
                      {states.map(state => (
                        <option key={state.iso2} value={state.name}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Ciudad *
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className={`input-theme ${errors.city ? 'border-red-500' : ''}`}
                      disabled={!formData.state}
                    >
                      <option value="">Seleccione ciudad</option>
                      {cities.map(city => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className={`input-theme ${errors.address ? 'border-red-500' : ''}`}
                      placeholder="Ingrese dirección"
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
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
                        <option key={dept.id_employee_department} value={dept.id_employee_department}>
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
                        <option key={pos.id_employee_charge} value={pos.id_employee_charge}>
                          {pos.name}
                        </option>
                      ))}
                    </select>
                    {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Contrato asociado * {isEditMode && "(Solo lectura)"}
                    </label>
                    {isEditMode ? (
                      // En modo edición: mostrar contrato como solo lectura
                      <div className="input-theme bg-gray-100 dark:bg-gray-800 cursor-not-allowed flex items-center">
                        <span className="text-secondary">{formData.associatedContract || "Sin contrato"}</span>
                      </div>
                    ) : (
                      // En modo creación: permitir seleccionar y editar contrato
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
                          {/* ⚠️ WORKAROUND: Se usa contract.id || contract.contract_code porque
                              el backend NO retorna el campo 'id' en el listado de contratos.
                              Ver employeeService.js para más detalles sobre este problema. */}
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
                    )}
                    {errors.associatedContract && <p className="text-red-500 text-xs mt-1">{errors.associatedContract}</p>}
                    {!isEditMode && !contractsLoading && contracts.length === 0 && formData.department && formData.position && (
                      <p className="text-yellow-600 text-xs mt-1">
                        ⚠️ No hay contratos disponibles para este departamento y cargo. Debe seleccionar o crear un contrato antes de guardar.
                      </p>
                    )}
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
                      placeholder={isEditMode
                        ? "Ingrese descripción de la novedad o justificación para la actualización de la información del empleado"
                        : "Ingrese descripción de la novedad o justificación para el registro del empleado"
                      }
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
                      {isEditMode ? "Actualizando..." : "Registrando..."}
                    </>
                  ) : (
                    isEditMode ? "Guardar Cambios" : "Registrar"
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
        message={isEditMode ? "¿Desea descartar los cambios realizados? Los datos no se guardarán." : "¿Desea descartar los datos ingresados? Los cambios no se guardarán."}
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
        title={isEditMode ? "Empleado Actualizado" : "Empleado Registrado"}
        message={successMessage}
      />

      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={isEditMode ? "Error de Actualización" : "Error de Registro"}
        message={errorMessage}
        buttonText="Intentar de Nuevo"
      />

      <AddContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        contractToEdit={contractTemplateToEdit}
        onSuccess={async (newContractId) => {
          setIsContractModalOpen(false);
          
          // Recargar lista de contratos después de crear/editar
          if (formData.position) {
            try {
              const response = await employeeService.getEstablishedContracts(formData.position);
              if (response.success && response.data) {
                setContracts(response.data);
                
                // Si se creó un nuevo contrato, seleccionarlo automáticamente
                if (newContractId) {
                  setFormData(prev => ({ ...prev, associatedContract: newContractId }));
                }
              }
            } catch (error) {
              console.error("Error recargando contratos:", error);
            }
          }
        }}
      />
    </>
  );
};

export default RegisterEmployeeModal;
