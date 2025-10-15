"use client";
import React, { useState, useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { useTheme } from "@/contexts/ThemeContext";
import { SuccessModal, ErrorModal } from "../../shared/SuccessErrorModal";
import { getMunicipalities } from "@/services/billingService";
import { getTypeDocuments } from "@/services/authService";
import { getPersonTypes, getTaxRegimens, checkUserExists, createClient, updateClient, updateUser } from "@/services/clientService";

const AddClientModal = ({
    isOpen,
    mode = "create",
    client,
    onClose,
    onSuccess,
    billingToken,
    defaultValues = {},
    existingClientDocuments = [],
}) => {
    const isEditMode = mode === "edit";
    const shouldCheckDocument = useRef(false); // Flag para controlar verificación

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm({
        defaultValues,
    });
    const { getCurrentTheme } = useTheme();
    const theme = getCurrentTheme();

    const [loading, setLoading] = useState(false);
    const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
    const [municipalities, setMunicipalities] = useState([]);
    const [typeDocuments, setTypeDocuments] = useState([]);
    const [personTypes, setPersonTypes] = useState([]);
    const [taxRegimens, setTaxRegimens] = useState([]);
    const [checkingDocument, setCheckingDocument] = useState(false);
    const [documentExists, setDocumentExists] = useState(false);
    const [existingUserId, setExistingUserId] = useState(null);

    // Modales de éxito y error
    const [successOpen, setSuccessOpen] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [tittle, setTittle] = useState("");

    // Observar el campo de número de identificación
    const identificationNumber = watch("identificationNumber");

    // Datos para selects
    const getTypeDocumentsData = async () => {
        try {
            const response = await getTypeDocuments();
            setTypeDocuments(response.data);
        } catch (error) {
            console.error("Error cargando tipos de documento:", error);
        }
    };

    const getPersonTypesData = async () => {
        try {
            const response = await getPersonTypes();
            setPersonTypes(response.data);
        } catch (error) {
            console.error("Error cargando tipos de persona:", error);
        }
    }

    const getTaxRegimensData = async () => {
        try {
            const response = await getTaxRegimens();
            setTaxRegimens(response.data);
        } catch (error) {
            console.error("Error cargando regímenes tributarios:", error);
        }
    };

    const phoneCodes = [
        { code: "+57", country: "CO" },
        { code: "+1", country: "US" },
        { code: "+52", country: "MX" },
        { code: "+34", country: "ES" },
    ];

    const resetForm = () => {
        reset({
            identificationType: "",
            checkDigit: "",
            personType: "",
            legalName: "",
            businessName: "",
            fullName: "",
            firstLastName: "",
            secondLastName: "",
            email: "",
            phoneCode: "+57",
            phoneNumber: "",
            address: "",
            taxRegime: "",
            region: "",
        });
    };

    // Función para cerrar el modal y resetear todo
    const handleCloseModal = () => {
        shouldCheckDocument.current = false; // Desactivar verificación
        resetForm();
        reset({ identificationNumber: "" });
        setDocumentExists(false);
        setExistingUserId(null);
        onClose();
    };

    // Verificar documento existente
    // Verificar documento existente
    const checkDocument = async (documentNumber) => {
        if (!documentNumber) return;

        setCheckingDocument(true);
        try {
            //Verificar primero si el documento ya existe como cliente
            const isAlreadyClient = existingClientDocuments.includes(documentNumber.toString());

            if (isAlreadyClient) {
                setDocumentExists(false);
                setExistingUserId(null);
                resetForm();
                reset({ identificationNumber: documentNumber });
                setTittle("Cliente Ya Registrado");
                setModalMessage("Este número de identificación ya está registrado como cliente en el sistema.");
                setErrorOpen(true);
                setCheckingDocument(false);
                return;
            }

            // Si no existe como cliente, buscar en usuarios.
            const response = await checkUserExists(documentNumber);

            if (response.success && response.data) {
                setDocumentExists(true);
                setExistingUserId(response.data.id_user || null);
                // Resetear el formulario con los datos del usuario existente
                reset({
                    identificationNumber: response.data.document_number || documentNumber,
                    identificationType: response.data.type_document || "",
                    checkDigit: response.data.check_digit || "",
                    personType: response.data.person_type || "",
                    legalName: response.data.legal_entity_name || "",
                    businessName: response.data.business_name || "",
                    fullName: response.data.name || "",
                    firstLastName: response.data.first_last_name || "",
                    secondLastName: response.data.second_last_name || "",
                    email: response.data.email || "",
                    phoneCode: response.data.phone_code || "+57",
                    phoneNumber: response.data.phone || "",
                    address: response.data.address || "",
                    taxRegime: response.data.tax_regime || "",
                    region: response.data.id_municipality || "",
                });
                setTittle("Usuario Encontrado");
                setModalMessage("Los datos han sido precargados. Puede continuar el registro como cliente llenando los campos faltantes.");
                setSuccessOpen(true);
            }
        } catch (error) {
            setDocumentExists(false);
            setExistingUserId(null);
            resetForm();
            setTittle("Usuario No Encontrado");
            setModalMessage("No se encontró un usuario con ese número de identificación. Puede continuar con el registro.");
            setSuccessOpen(true);
        } finally {
            setCheckingDocument(false);
        }
    };

    useEffect(() => {
        if (isOpen && billingToken) {
            shouldCheckDocument.current = true; // Activar verificación cuando abre el modal
            loadMunicipalities();
            getTypeDocumentsData();
            getPersonTypesData();
            getTaxRegimensData();
        }
    }, [isOpen, billingToken]);

    // Cargar datos del cliente en modo edición
    useEffect(() => {
        if (isEditMode && client && isOpen &&
            typeDocuments.length > 0 &&
            personTypes.length > 0 &&
            taxRegimens.length > 0 &&
            municipalities.length > 0) {

            console.log("Cargando datos del cliente para edición:", client);
            shouldCheckDocument.current = false; // No verificar en modo edición

            // Extraer código y número de teléfono
            let phoneCode = "+57";
            let phoneNumber = "";

            if (client.phone) {
                const phone = client.phone.toString();
                // Buscar el código de país
                const matchedCode = phoneCodes.find(pc => phone.startsWith(pc.code.replace('+', '')));
                if (matchedCode) {
                    phoneCode = matchedCode.code;
                    phoneNumber = phone.substring(matchedCode.code.replace('+', '').length);
                } else {
                    phoneNumber = phone;
                }
            }

            reset({
                identificationNumber: client.document_number || "",
                identificationType: client.type_document_id || "",
                checkDigit: client.check_digit || "",
                personType: client.person_type_id || "",
                legalName: client.legal_entity_name || "",
                businessName: client.business_name || "",
                fullName: client.name || "",
                firstLastName: client.first_last_name || "",
                secondLastName: client.second_last_name || "",
                email: client.email || "",
                phoneCode: phoneCode,
                phoneNumber: phoneNumber,
                address: client.address || "",
                taxRegime: client.tax_regime || "",
                region: client.id_municipality || "",
            });

            setExistingUserId(client.id_user || null);
        } else if (!isEditMode && isOpen) {
            shouldCheckDocument.current = true;
            resetForm();
        }
    }, [isEditMode, client, isOpen, typeDocuments, personTypes, taxRegimens, municipalities]);

    // useEffect para verificar cuando el número esté completo
    useEffect(() => {
        // Solo verificar si el flag está activo
        if (!shouldCheckDocument.current || isEditMode) return;

        if (identificationNumber && identificationNumber.length >= 7) {
            const timeoutId = setTimeout(() => {
                checkDocument(identificationNumber);
            }, 500);

            return () => clearTimeout(timeoutId);
        } else {
            setDocumentExists(false);
            setExistingUserId(null);
        }
    }, [identificationNumber]);

    const loadMunicipalities = async (searchTerm = "") => {
        if (!billingToken) {
            console.error("No hay token disponible");
            return;
        }

        setLoadingMunicipalities(true);
        try {
            const response = await getMunicipalities(billingToken, searchTerm);
            if (response.data) {
                setMunicipalities(response.data);
            } else if (Array.isArray(response)) {
                setMunicipalities(response);
            }
        } catch (error) {
            console.error("Error cargando municipios:", error);
        } finally {
            setLoadingMunicipalities(false);
        }
    };

    const handleFormSubmit = async (data) => {
        shouldCheckDocument.current = false; // Desactivar verificación durante envío
        setLoading(true);
        try {
            const payload = {
                id_user: existingUserId,
                document_number: data.identificationNumber,
                type_document_id: data.identificationType,
                check_digit: data.checkDigit,
                person_type: data.personType,
                legal_entity_name: data.legalName,
                business_name: data.businessName,
                name: data.fullName,
                first_last_name: data.firstLastName,
                second_last_name: data.secondLastName,
                email: data.email,
                phone_code: data.phoneCode,
                phone: data.phoneNumber,
                address: data.address,
                tax_regime: data.taxRegime,
                id_municipality: data.region,
            };

            let response;

            if (isEditMode) {
                // Llamar al endpoint de actualizar cliente
                response = await updateClient(client.id_customer, payload);

                if (existingUserId !== null) {
                    if (response.success) {
                        try {
                            const userPayload = {
                                name: data.fullName,
                                first_last_name: data.firstLastName,
                                second_last_name: data.secondLastName,
                                type_document_id: data.identificationType,
                                document_number: data.identificationNumber.toString(),
                                email: data.email,
                                phone: data.phoneNumber,
                                address: data.address,
                            };

                            // Actualizar también el usuario asociado
                            const userResponse = await updateUser(existingUserId, userPayload);
                            setTittle("Éxito");
                            setModalMessage(userResponse.message || "Cliente actualizado con éxito.");
                            setSuccessOpen(true);

                            setTimeout(() => {
                                setSuccessOpen(false);
                                handleCloseModal();
                            }, 2000);
                        } catch (userError) {
                            setTittle("Error");
                            setModalMessage(userError.message || "Ocurrio un error al actualizar el cliente.");
                            setErrorOpen(true);
                        }
                    }
                } else {
                    setTittle("Éxito");
                    setModalMessage(response.message || "Cliente actualizado con éxito.");
                    setSuccessOpen(true);

                    setTimeout(() => {
                        setSuccessOpen(false);
                        handleCloseModal();
                    }, 2000);
                }
            } else {
                // Llamar al endpoint de creación
                response = await createClient(payload);
                setTittle("Éxito");
                setModalMessage(response.message || "Cliente registrado con éxito.");
                setSuccessOpen(true);

                setTimeout(() => {
                    setSuccessOpen(false);
                    handleCloseModal();
                }, 2000);
            }

            if (onSuccess) {
                onSuccess();
            }

        } catch (error) {
            setTittle("Error");
            const apiError = error.response?.data;
            if (apiError) {
                let fullMessage = apiError.message || "Ocurrió un error al registrar el cliente.";

                // Verificar si es un error de clave duplicada (usuario ya existe como cliente)
                if (apiError.error && apiError.error.includes("duplicate key value violates unique constraint")) {
                    fullMessage += "\n\nEste usuario ya está registrado como cliente en el sistema.";
                }

                if (apiError.details) {
                    const detailsArray = Object.values(apiError.details).flat();
                    fullMessage += `: ${detailsArray.join(" ")}`;
                }
                setModalMessage(fullMessage);
            } else {
                setModalMessage(error.message || "Ocurrió un error inesperado.");
            }
            setErrorOpen(true);
            shouldCheckDocument.current = true; // Reactivar verificación después del error
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                id="Client Registration Modal"
            >
                <div
                    className="bg-background rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 text-primary">
                            {isEditMode ? "Actualizar Cliente" : "Registrar Nuevo Cliente"}
                        </h2>
                        <button
                            aria-label="Close Modal Button"
                            onClick={() => { handleCloseModal(); }}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FiX className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Modal Content */}
                    <form
                        onSubmit={handleSubmit(handleFormSubmit)}
                        className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]"
                    >
                        <div className="space-y-6 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                                            Número de identificación
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                {...register("identificationNumber", {
                                                    required: "Este campo es obligatorio.",
                                                    pattern: {
                                                        value: /^[0-9]+$/,
                                                        message: "Solo se permiten números."
                                                    }
                                                })}
                                                className="parametrization-input w-full"
                                                placeholder="Digite número de identificación"
                                                onKeyDown={(e) => {
                                                    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                            {checkingDocument && (
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                        {errors.identificationNumber && (
                                            <span className="text-xs text-red-500 mt-1 block">
                                                {errors.identificationNumber.message}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                                            Dígito Verificación
                                        </label>
                                        <input
                                            type="text"
                                            {...register("checkDigit", { required: "Este campo es obligatorio." })}
                                            className="parametrization-input w-full"
                                            placeholder="DV"
                                            onKeyDown={(e) => {
                                                if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                                                    e.preventDefault();
                                                }
                                            }}
                                        />
                                        {errors.checkDigit && (
                                            <span className="text-xs text-red-500 mt-1 block">
                                                {errors.checkDigit.message}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de identificación
                                    </label>
                                    <select
                                        {...register("identificationType", { required: "Este campo es obligatorio." })}
                                        className="parametrization-input w-full"
                                        defaultValue=""
                                    >
                                        <option value="">Seleccione el tipo</option>
                                        {typeDocuments.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.identificationType && (
                                        <span className="text-xs text-red-500 mt-1 block">
                                            {errors.identificationType.message}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                                        Nombre Comercial
                                    </label>
                                    <input
                                        type="text"
                                        {...register("businessName")}
                                        className="parametrization-input w-full"
                                        placeholder="Digite nombre comercial"
                                    />
                                </div>

                                <div>
                                    <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de persona
                                    </label>
                                    <select
                                        {...register("personType", { required: "Este campo es obligatorio." })}
                                        className="parametrization-input w-full"
                                        defaultValue=""
                                    >
                                        <option value="">Seleccione el tipo</option>
                                        {personTypes.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.personType && (
                                        <span className="text-xs text-red-500 mt-1 block">
                                            {errors.personType.message}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                                        Razón Social
                                    </label>
                                    <input
                                        type="text"
                                        {...register("legalName", { required: "Este campo es obligatorio." })}
                                        className="parametrization-input w-full"
                                        placeholder="Digite razón social"
                                    />
                                    {errors.legalName && (
                                        <span className="text-xs text-red-500 mt-1 block">
                                            {errors.legalName.message}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                                        Nombres
                                    </label>
                                    <input
                                        type="text"
                                        {...register("fullName", { required: "Este campo es obligatorio." })}
                                        className="parametrization-input w-full"
                                        placeholder="Digite nombres"
                                    />
                                    {errors.fullName && (
                                        <span className="text-xs text-red-500 mt-1 block">
                                            {errors.fullName.message}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                                            Primer Apellido
                                        </label>
                                        <input
                                            type="text"
                                            {...register("firstLastName", { required: "Este campo es obligatorio." })}
                                            className="parametrization-input w-full"
                                            placeholder="Primer apellido"
                                        />
                                        {errors.firstLastName && (
                                            <span className="text-xs text-red-500 mt-1 block">
                                                {errors.firstLastName.message}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                                            Segundo Apellido
                                        </label>
                                        <input
                                            type="text"
                                            {...register("secondLastName", { required: "Este campo es obligatorio." })}
                                            className="parametrization-input w-full"
                                            placeholder="Segundo apellido"
                                        />
                                        {errors.secondLastName && (
                                            <span className="text-xs text-red-500 mt-1 block">
                                                {errors.secondLastName.message}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                                        Régimen Tributario
                                    </label>
                                    <select
                                        {...register("taxRegime", { required: "Este campo es obligatorio." })}
                                        className="parametrization-input w-full"
                                        defaultValue=""
                                    >
                                        <option value="">Seleccione régimen fiscal</option>
                                        {taxRegimens.map((regime) => (
                                            <option key={regime.id} value={regime.id}>
                                                {regime.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.taxRegime && (
                                        <span className="text-xs text-red-500 mt-1 block">
                                            {errors.taxRegime.message}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                                        Número Telefónico
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            {...register("phoneCode", { required: "Este campo es obligatorio." })}
                                            className="parametrization-input w-24"
                                            defaultValue=""
                                        >
                                            <option value="">Código</option>
                                            {phoneCodes.map((phone) => (
                                                <option key={phone.code} value={phone.code}>
                                                    {phone.code}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="tel"
                                            {...register("phoneNumber", {
                                                required: "Este campo es obligatorio.",
                                                pattern: {
                                                    value: /^[0-9]{7,15}$/,
                                                    message: "Número de teléfono inválido."
                                                }
                                            })}
                                            className="parametrization-input w-24"
                                            placeholder="Digite número teléfonico"
                                            onKeyDown={(e) => {
                                                if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                                                    e.preventDefault();
                                                }
                                            }}
                                        />
                                    </div>
                                    {errors.phoneNumber && (
                                        <span className="text-xs text-red-500 mt-1 block">
                                            {errors.phoneNumber.message}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                                        Dirección
                                    </label>
                                    <input
                                        type="text"
                                        {...register("address", { required: "Este campo es obligatorio." })}
                                        className="parametrization-input w-full"
                                        placeholder="Digite dirección"
                                    />
                                    {errors.address && (
                                        <span className="text-xs text-red-500 mt-1 block">
                                            {errors.address.message}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                                        Correo Electrónico
                                    </label>
                                    <input
                                        type="email"
                                        {...register("email", {
                                            required: "Este campo es obligatorio.",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Correo electrónico inválido."
                                            }
                                        })}
                                        className="parametrization-input w-full"
                                        placeholder="Digite correo electrónico"
                                    />
                                    {errors.email && (
                                        <span className="text-xs text-red-500 mt-1 block">
                                            {errors.email.message}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                                        Ciudad/Municipio
                                    </label>
                                    <select
                                        {...register("region", { required: "Este campo es obligatorio." })}
                                        className="parametrization-input w-full"
                                        defaultValue=""
                                        disabled={loadingMunicipalities}
                                    >
                                        <option value="">
                                            {loadingMunicipalities ? "Cargando municipios..." : "Seleccione municipio"}
                                        </option>
                                        {municipalities.map((municipality) => (
                                            <option key={municipality.id} value={municipality.id}>
                                                {municipality.name} ({municipality.department})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.region && (
                                        <span className="text-xs text-red-500 mt-1 block">
                                            {errors.region.message}
                                        </span>
                                    )}
                                    {loadingMunicipalities && (
                                        <p className="text-xs text-gray-500 mt-1">Cargando...</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center gap-4 mt-6">
                            <button
                                type="button"
                                onClick={() => { handleCloseModal(); }}
                                className="btn-error btn-theme w-80 px-8 py-2 font-semibold rounded-lg"
                                aria-label="Cancel Button"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn-primary w-80 px-8 py-2 font-semibold rounded-lg text-white"
                                disabled={loading}
                            >
                                {loading
                                    ? (isEditMode ? "Actualizando..." : "Guardando...")
                                    : (isEditMode ? "Actualizar" : "Guardar")
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <SuccessModal
                isOpen={successOpen}
                onClose={() => setSuccessOpen(false)}
                title={tittle}
                message={modalMessage}
            />
            <ErrorModal
                isOpen={errorOpen}
                onClose={() => setErrorOpen(false)}
                title={tittle}
                message={modalMessage}
            />
        </>
    );
};

export default AddClientModal;