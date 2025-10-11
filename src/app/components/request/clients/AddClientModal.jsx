"use client";
import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { get, useForm } from "react-hook-form";
import { useTheme } from "@/contexts/ThemeContext";
import { SuccessModal, ErrorModal } from "../../shared/SuccessErrorModal";
import { getMunicipalities } from "@/services/billingService";
import { getTypeDocuments } from "@/services/authService";
import { getPersonTypes } from "@/services/clientService";

const AddClientModal = ({
    isOpen,
    mode = "create",
    onClose,
    onSuccess,
    billingToken,
    defaultValues = {},
}) => {
    const isEditMode = mode === "edit";

    const {
        register,
        handleSubmit,
        reset,
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

    // Modales de éxito y error
    const [successOpen, setSuccessOpen] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

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

    const phoneCodes = [
        { code: "+57", country: "CO" },
        { code: "+1", country: "US" },
        { code: "+52", country: "MX" },
        { code: "+34", country: "ES" },
    ];

    const taxRegimes = [
        { id: 1, name: "Régimen Simplificado" },
        { id: 2, name: "Régimen Común" },
        { id: 3, name: "Gran Contribuyente" },
    ];

    useEffect(() => {
        if (isOpen && billingToken) {
            loadMunicipalities();
        }
        getTypeDocumentsData();
        getPersonTypesData();
    }, [isOpen, billingToken]);

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
        setLoading(true);
        try {
            const payload = {
                identification_number: data.identificationNumber,
                identification_type: data.identificationType,
                check_digit: data.checkDigit,
                person_type: data.personType,
                legal_name: data.legalName,
                business_name: data.businessName,
                full_name: data.fullName,
                first_last_name: data.firstLastName,
                second_last_name: data.secondLastName,
                email: data.email,
                phone_code: data.phoneCode,
                phone_number: data.phoneNumber,
                address: data.address,
                tax_regime: data.taxRegime,
                region: data.region,
            };

            // Aquí iría la llamada al servicio API
            // const response = await createClient(payload);

            const isUpdate = defaultValues?.identificationNumber;
            setModalMessage(isUpdate ? "Cliente actualizado con éxito." : "Cliente registrado con éxito.");
            setSuccessOpen(true);

            if (onSuccess) {
                onSuccess();
            }

            setTimeout(() => {
                setSuccessOpen(false);
                reset();
                onClose();
            }, 2000);
        } catch (error) {
            const apiError = error.response?.data;
            if (apiError) {
                let fullMessage = apiError.message;
                if (apiError.details) {
                    const detailsArray = Object.values(apiError.details).flat();
                    fullMessage += `: ${detailsArray.join(" ")}`;
                }
                setModalMessage(fullMessage);
                setErrorOpen(true);
            }
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
                            onClick={() => {
                                onClose();
                                reset();
                            }}
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
                            {/* Fila 1: Número de identificación y Tipo de identificación */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                                            Número de identificación
                                        </label>
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
                                            {...register("checkDigit", {
                                                pattern: {
                                                    value: /^[0-9]{1}$/,
                                                    message: "Solo un dígito."
                                                }
                                            })}
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

                            {/* Fila 2: Nombre Comercial y Tipo de persona */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                                        Nombre Comercial
                                    </label>
                                    <input
                                        type="text"
                                        {...register("legalName")}
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

                            {/* Fila 3: Razón Social y Nombres */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                                        Razón Social
                                    </label>
                                    <input
                                        type="text"
                                        {...register("businessName")}
                                        className="parametrization-input w-full"
                                        placeholder="Digite razón social"
                                    />
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

                            {/* Fila 4: Apellidos y Régimen */}
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
                                            {...register("secondLastName")}
                                            className="parametrization-input w-full"
                                            placeholder="Segundo apellido"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                                        Régimen Tributario
                                    </label>
                                    <select
                                        {...register("taxRegime")}
                                        className="parametrization-input w-full"
                                        defaultValue=""
                                    >
                                        <option value="">Seleccione régimen fiscal</option>
                                        {taxRegimes.map((regime) => (
                                            <option key={regime.id} value={regime.id}>
                                                {regime.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Fila 5: Teléfono y Dirección */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                                        Número Telefónico
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            {...register("phoneCode", { required: true })}
                                            className="parametrization-input w-20"
                                            defaultValue=""
                                        >
                                            <option value="">Códido del país</option>
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
                                            className="parametrization-input w-40"
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
                                        {...register("address")}
                                        className="parametrization-input w-full"
                                        placeholder="Digite dirección"
                                    />
                                </div>
                            </div>

                            {/* Fila 6: Email y Ciudad */}
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
                                        {...register("region")}
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
                                    {loadingMunicipalities && (
                                        <p className="text-xs text-gray-500 mt-1">Cargando...</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center gap-4 mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    reset();
                                }}
                                className="btn-error btn-theme w-80 px-8 py-2 font-semibold rounded-lg"
                                aria-label="Cancel Button"
                            >
                                Cancel
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
                title="Éxito"
                message={modalMessage}
            />
            <ErrorModal
                isOpen={errorOpen}
                onClose={() => setErrorOpen(false)}
                title="Error"
                message={modalMessage}
            />
        </>
    );
};

export default AddClientModal;