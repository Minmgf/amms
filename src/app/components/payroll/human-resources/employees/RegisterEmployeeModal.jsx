"use client";
import React, { useState, useEffect } from "react";
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiCalendar, FiEdit2 } from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";
import { SuccessModal, ErrorModal, ConfirmModal } from "@/app/components/shared/SuccessErrorModal";
import AddContractModal from "@/app/components/payroll/contractManagement/contracts/AddContractModal";
import { updateEmployee } from "@/services/employeeService";
import { getCountries, getStates, getCities } from "@/services/locationService";

/**
 * RegisterEmployeeModal Component
 *
 * Modal para registrar un nuevo empleado con datos personales, de contacto y laborales
 * Basado en HU-EMP-001 y HU-EMP-009
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controla si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSuccess - Función llamada cuando se registra exitosamente
 * @param {string} props.mode - Modo del modal: "create" o "edit"
 * @param {Object} props.employeeData - Datos del empleado para modo edición
 * @param {Function} props.onValidateDocument - Función para validar si documento existe (recibe documentNumber, retorna boolean)
 * @param {boolean} props.canCreate - Si el usuario tiene permiso para crear empleados
 * @param {boolean} props.canEdit - Si el usuario tiene permiso para editar empleados
 */
const RegisterEmployeeModal = ({
  isOpen,
  onClose,
  onSuccess,
  mode = "create",
  employeeData = null,
  onValidateDocument = null,
  canCreate = true,
  canEdit = true
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractTemplateToEdit, setContractTemplateToEdit] = useState(null);

  // Mock data - Estados parametrizables (vendrá del endpoint)
  const [identificationTypes] = useState([
    { id: 1, code: "CC", name: "Cédula de Ciudadanía" },
    { id: 2, code: "CE", name: "Cédula de Extranjería" },
    { id: 3, code: "PAS", name: "Pasaporte" },
    { id: 4, code: "NIT", name: "NIT" }
  ]);

  const [genders] = useState([
    { id: 1, name: "Masculino" },
    { id: 2, name: "Femenino" },
    { id: 3, name: "Otro" }
  ]);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [departments] = useState([
    { id: 1, name: "Recursos Humanos" },
    { id: 2, name: "Operaciones" },
    { id: 3, name: "Mantenimiento" },
    { id: 4, name: "Administración" }
  ]);

  const [positions] = useState([
    { id: 1, name: "Gerente", departmentId: 4 },
    { id: 2, name: "Analista", departmentId: 1 },
    { id: 3, name: "Operador", departmentId: 2 },
    { id: 4, name: "Técnico", departmentId: 3 }
  ]);

  const [contracts] = useState([
    { id: 1, name: "Contrato Indefinido - Gerencial", departmentId: 4, positionId: 1 },
    { id: 2, name: "Contrato Fijo - Analista", departmentId: 1, positionId: 2 },
    { id: 3, name: "Contrato Temporal - Operador", departmentId: 2, positionId: 3 }
  ]);

  // Cargar países desde el servicio de localización cuando se abre el modal
  useEffect(() => {
    if (!isOpen) return;

    const fetchCountries = async () => {
      try {
        const data = await getCountries();
        const mappedCountries = Array.isArray(data)
          ? data.map((country) => ({
              id: country.iso2 || country.id || country.code,
              code: country.iso2 || country.code,
              name: country.name,
            }))
          : [];
        setCountries(mappedCountries);
      } catch (error) {
        console.error("Error cargando países:", error);
        setCountries([]);
      }
    };

    fetchCountries();
  }, [isOpen]);

  // Limpiar formulario al abrir/cerrar y precargar datos en modo edición
  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && employeeData) {
      let firstName = employeeData.firstName || "";
      let secondName = employeeData.secondName || "";
      let firstLastName = employeeData.firstLastName || "";
      let secondLastName = employeeData.secondLastName || "";

      // Si el backend envía primer y segundo nombre concatenados en firstName
      if (firstName && !secondName) {
        const nameParts = String(firstName).trim().split(/\s+/);
        if (nameParts.length > 1) {
          firstName = nameParts[0];
          secondName = nameParts.slice(1).join(" ");
        }
      }

      if (!firstName && employeeData.fullName) {
        const parts = String(employeeData.fullName).split(" ");
        firstName = parts[0] || "";
        if (!secondName && parts.length > 3) {
          secondName = parts[1] || "";
        }
        if (!firstLastName && parts.length > 1) {
          firstLastName = parts[parts.length - 2] || "";
        }
        if (!secondLastName && parts.length > 2) {
          secondLastName = parts[parts.length - 1] || "";
        }
      }

      let identificationType = "";
      if (employeeData.identificationTypeId) {
        identificationType = String(employeeData.identificationTypeId);
      } else if (employeeData.documentType) {
        const typeMatch = identificationTypes.find(
          (type) =>
            type.name === employeeData.documentType ||
            type.code === employeeData.documentType
        );
        if (typeMatch) identificationType = String(typeMatch.id);
      }

      let gender = "";
      if (employeeData.genderId) {
        gender = String(employeeData.genderId);
      } else if (employeeData.gender) {
        const normalizedGender = String(employeeData.gender).toLowerCase();
        const genderMatch = genders.find(
          (item) => item.name.toLowerCase() === normalizedGender
        );
        if (genderMatch) gender = String(genderMatch.id);
      }

      let country = "";
      if (employeeData.countryCode) {
        country = String(employeeData.countryCode);
      } else if (employeeData.country) {
        const countryMatch = countries.find(
          (item) =>
            item.name === employeeData.country ||
            item.code === employeeData.country
        );
        if (countryMatch) country = String(countryMatch.code);
      }

      let department = "";
      if (employeeData.departmentId) {
        department = String(employeeData.departmentId);
      } else if (employeeData.department) {
        const departmentMatch = departments.find(
          (item) => item.name === employeeData.department
        );
        if (departmentMatch) department = String(departmentMatch.id);
      }

      let position = "";
      if (employeeData.positionId) {
        position = String(employeeData.positionId);
      } else if (employeeData.position) {
        const positionMatch = positions.find(
          (item) => item.name === employeeData.position
        );
        if (positionMatch) position = String(positionMatch.id);
      }

      let phoneNumber = "";
      if (employeeData.phone) {
        phoneNumber = String(employeeData.phone).replace(/\D/g, "");
      }

      setFormData({
        firstName,
        secondName,
        firstLastName,
        secondLastName,
        identificationType,
        identificationNumber: employeeData.document ? String(employeeData.document) : "",
        gender,
        birthDate: employeeData.birthDate || "",
        email: employeeData.email || "",
        phoneNumber,
        countryCode: "+57",
        country,
        state: employeeData.state || "",
        city: employeeData.city || "",
        address: employeeData.address || "",
        department,
        position,
        // Usar el código de contrato para edición; si el backend usa otro campo, ajustarlo aquí
        associatedContract: employeeData.contractCode
          ? String(employeeData.contractCode)
          : employeeData.contractId
            ? String(employeeData.contractId)
            : "",
        noveltyDescription: ""
      });
      setErrors({});
      setUserExists(false);
      if (country) {
        loadStates(country);
      }
      return;
    }

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
  }, [isOpen, isEditMode, employeeData, countries]);

  // Cuando se edita, una vez cargados los estados, mapear el nombre del estado al código
  useEffect(() => {
    if (!isOpen || !isEditMode || !employeeData || !formData.country || states.length === 0) {
      return;
    }

    const matchedState = states.find(
      (state) =>
        state.name === employeeData.state ||
        state.code === employeeData.state
    );

    if (!matchedState || formData.state === matchedState.code) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      state: matchedState.code,
    }));

    loadCities(formData.country, matchedState.code);
  }, [isOpen, isEditMode, employeeData, formData.country, formData.state, states]);

  // Buscar usuario existente por documento
  const searchUserByDocument = async (documentNumber) => {
    if (!documentNumber || documentNumber.length < 5) return;
    
    setLoading(true);
    try {
      // TODO: Implementar llamada al endpoint
      // Simulación de búsqueda
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulación: si el documento es "12345678" existe el usuario
      if (documentNumber === "12345678") {
        setUserExists(true);
        setFormData(prev => ({
          ...prev,
          firstName: "Juan",
          secondName: "Carlos",
          firstLastName: "Pérez",
          secondLastName: "González",
          email: "juan.perez@example.com",
          phoneNumber: "3001234567",
          country: "1",
          address: "Calle 123 #45-67"
        }));
      } else {
        setUserExists(false);
      }
    } catch (error) {
      console.error("Error buscando usuario:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estados/departamentos según país seleccionado
  const loadStates = async (countryCode) => {
    if (!countryCode) {
      setStates([]);
      setCities([]);
      return;
    }

    setLoading(true);
    try {
      const data = await getStates(countryCode);
      const mappedStates = Array.isArray(data)
        ? data.map((state) => ({
            id: state.iso2 || state.id,
            code: state.iso2 || state.id,
            name: state.name,
          }))
        : [];
      setStates(mappedStates);
      setCities([]);
    } catch (error) {
      console.error("Error cargando departamentos/estados:", error);
      setStates([]);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar ciudades según país y estado seleccionados
  const loadCities = async (countryCode, stateCode) => {
    if (!countryCode || !stateCode) {
      setCities([]);
      return;
    }

    setLoading(true);
    try {
      const data = await getCities(countryCode, stateCode);
      const mappedCities = Array.isArray(data)
        ? data.map((city) => ({
            id: city.id || city.name,
            name: city.name,
          }))
        : [];
      setCities(mappedCities);
    } catch (error) {
      console.error("Error cargando ciudades:", error);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }

    // Buscar usuario si es número de documento
    if (field === "identificationNumber" && !isEditMode) {
      searchUserByDocument(value);
    }

    // Actualizar jerarquía de ubicación
    if (field === "country") {
      setFormData(prev => ({ ...prev, state: "", city: "" }));
      if (value) {
        loadStates(value);
      } else {
        setStates([]);
        setCities([]);
      }
    }

    if (field === "state") {
      setFormData(prev => ({ ...prev, city: "" }));
      if (formData.country && value) {
        loadCities(formData.country, value);
      } else {
        setCities([]);
      }
    }

    // Filtrar contratos por departamento y cargo
    if (field === "department" || field === "position") {
      setFormData(prev => ({ ...prev, associatedContract: "" }));
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

    const selectedContract = contracts.find(
      (contract) => String(contract.id) === String(formData.associatedContract)
    );

    // Preferir el contract_code si viene desde backend, de lo contrario usar el valor seleccionado
    const contractCode = selectedContract?.contract_code || formData.associatedContract;

    if (!contractCode) {
      return;
    }

    const templateForEdit = {
      contract_code: contractCode,
    };

    setContractTemplateToEdit(templateForEdit);
    setIsContractModalOpen(true);
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
    if (!formData.state) newErrors.state = "El estado/departamento es obligatorio";
    if (!formData.city) newErrors.city = "La ciudad es obligatoria";
    if (!formData.department) newErrors.department = "El departamento es obligatorio";
    if (!formData.position) newErrors.position = "El cargo es obligatorio";
    // En creación, el contrato es obligatorio. En edición, debe existir pero ya viene precargado
    if (!formData.associatedContract) {
      if (isEditMode) {
        newErrors.associatedContract = "El empleado debe tener un contrato asociado";
      } else {
        newErrors.associatedContract = "Debe seleccionar un contrato";
      }
    }
    if (!formData.noveltyDescription.trim()) newErrors.noveltyDescription = "La descripción de la novedad es obligatoria";

    if (formData.noveltyDescription && formData.noveltyDescription.length > 255) {
      newErrors.noveltyDescription = "La descripción de la novedad no puede superar 255 caracteres";
    }

    // Validar documento duplicado (solo en modo creación)
    if (!isEditMode && formData.identificationNumber.trim() && onValidateDocument) {
      const isDuplicate = onValidateDocument(formData.identificationNumber.trim());
      if (isDuplicate) {
        newErrors.identificationNumber = "El número de documento ya se encuentra registrado";
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

    // Validar permisos según el modo
    if (isEditMode && !canEdit) {
      setErrorMessage("No tiene permisos para editar empleados");
      setShowErrorModal(true);
      return;
    }

    if (!isEditMode && !canCreate) {
      setErrorMessage("No tiene permisos para crear empleados");
      setShowErrorModal(true);
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isEditMode && employeeData?.id) {
        await updateEmployee(employeeData.id, {
          formData,
          noveltyDescription: formData.noveltyDescription,
          actionType: "employee_update"
        });
      } else {
        // TODO: Implementar llamada real al endpoint de creación
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Simulación de éxito
      setShowSuccessModal(true);
      if (onSuccess) onSuccess();
    } catch (error) {
      setErrorMessage(
        isEditMode
          ? "Error al actualizar la información del empleado. Por favor, intente nuevamente."
          : "Error al registrar el empleado. Por favor, intente nuevamente."
      );
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

  // Filtrar posiciones por departamento
  const filteredPositions = positions.filter(pos => 
    !formData.department || pos.departmentId === parseInt(formData.department)
  );

  // Filtrar contratos por departamento y posición
  const filteredContracts = contracts.filter(contract => 
    (!formData.department || contract.departmentId === parseInt(formData.department)) &&
    (!formData.position || contract.positionId === parseInt(formData.position))
  );

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
            <h2 className="text-2xl font-bold text-primary">{isEditMode ? "Editar empleado" : "Nuevo Empleado"}</h2>
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
                      readOnly={isEditMode}
                      disabled={isEditMode}
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
                        <option key={country.id} value={country.code}>
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
                      {states.map((state) => (
                        <option key={state.id} value={state.code}>
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
                      {cities.map((city) => (
                        <option key={city.id} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
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
                      {filteredPositions.map(pos => (
                        <option key={pos.id} value={pos.id}>
                          {pos.name}
                        </option>
                      ))}
                    </select>
                    {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Contrato asociado * {isEditMode && <span className="text-xs text-gray-500">(solo lectura)</span>}
                    </label>
                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                      <select
                        value={formData.associatedContract}
                        onChange={(e) => handleInputChange("associatedContract", e.target.value)}
                        className={`input-theme flex-1 ${errors.associatedContract ? 'border-red-500' : ''}`}
                        disabled={isEditMode || !formData.department || !formData.position}
                      >
                        <option value="">
                          {!formData.department || !formData.position
                            ? "Seleccione primero departamento y cargo"
                            : filteredContracts.length === 0
                            ? "No hay contratos disponibles - Crear uno nuevo"
                            : "Seleccione contrato"}
                        </option>
                        {filteredContracts.map(contract => (
                          <option key={contract.id} value={contract.id}>
                            {contract.name}
                          </option>
                        ))}
                      </select>
                      {!isEditMode && (
                        <>
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
                        </>
                      )}
                    </div>
                    {errors.associatedContract && <p className="text-red-500 text-xs mt-1">{errors.associatedContract}</p>}
                    {!isEditMode && filteredContracts.length === 0 && formData.department && formData.position && (
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
                  disabled={loading || (isEditMode && !canEdit) || (!isEditMode && !canCreate)}
                  title={(isEditMode && !canEdit) ? "No tiene permisos para editar empleados" : (!isEditMode && !canCreate) ? "No tiene permisos para crear empleados" : ""}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block" />
                      {isEditMode ? "Guardando cambios..." : "Registrando..."}
                    </>
                  ) : (
                    isEditMode ? "Guardar cambios" : "Registrar"
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
        title={isEditMode ? "Cambios guardados" : "Empleado Registrado"}
        message={
          isEditMode
            ? "La información del empleado se actualizó correctamente y la novedad fue registrada."
            : "Empleado registrado correctamente y contrato asociado con éxito."
        }
      />

      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={isEditMode ? "Error al actualizar" : "Error de Registro"}
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
