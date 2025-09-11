import { useState, useEffect } from "react";
import { getPermissions } from "@/services/roleService";

export const usePermissions = () => {
    const [permissions, setPermissions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [filteredPermissions, setFilteredPermissions] = useState([]);

    // Fetch permissions on mount
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const data = await getPermissions();
                setPermissions(data);
                const uniqueCategories = [...new Set(data.map((p) => p.category))];
                setCategories(uniqueCategories);
                if (uniqueCategories.length > 0) {
                    setSelectedCategory(uniqueCategories[0]);
                }
            } catch (err) {
                console.error("Error fetching permissions:", err);
            }
        };
        fetchPermissions();
    }, []);

    // Filtrar permisos cuando cambia la categoría seleccionada
    useEffect(() => {
        if (selectedCategory) {
            const filtered = permissions.filter(
                (p) => p.category === selectedCategory
            );
            setFilteredPermissions(filtered);
        }
    }, [selectedCategory, permissions]);

    return {
        permissions,
        categories,
        selectedCategory,
        setSelectedCategory,
        filteredPermissions,
    };
}