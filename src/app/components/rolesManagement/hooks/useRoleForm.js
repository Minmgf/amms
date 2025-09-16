import { useState, useEffect } from "react";
import { getPermissions } from "@/services/roleService";

export const useRoleForm = (isOpen, mode, roleData) => {
    const [formData, setFormData] = useState({
        roleName: "",
        description: "",
        isActive: true,
        permissions: [],
    });

    const [errors, setErrors] = useState({});

    // Inicializar formulario cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            if ((mode === "edit" || mode === "view") && roleData) {
                setFormData({
                    roleName: roleData.roleName || "",
                    description: roleData.description || "",
                    isActive: roleData.status === "Active" || roleData.isActive === true,
                    permissions: roleData.permissions || []
                });
            } else {
                setFormData({
                    roleName: "",
                    description: "",
                    isActive: true,
                    permissions: [],
                });
            }
            setErrors({});
        }
    }, [isOpen, mode, roleData]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.roleName.trim()) {
            newErrors.roleName = "Role Name is required";
        }
        if (!formData.permissions.length) {
            newErrors.permissions = "At least one permission must be selected";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    return {
        formData,
        setFormData,
        errors,
        handleInputChange,
        validateForm,
    };
};
