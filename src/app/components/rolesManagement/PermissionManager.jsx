import React from "react";
import { usePermissions } from "@/contexts/PermissionsContext";

const PermissionManager  = ({
    permissions,
    categories,
    selectedCategory,
    setSelectedCategory,
    filteredPermissions,
    formData,
    setFormData,
    mode
}) => {

    const isPermissionSelected = (permissions, permissionId) => {
        return permissions.some(p => p.id === permissionId);
    };

    const countSelectedInCategory = (cat) => {
        const categoryPermissionIds = permissions
            .filter(p => p.category === cat)
            .map(p => p.id);

        return formData.permissions.filter(p =>
            categoryPermissionIds.includes(p.id)
        ).length;
    };

    const formatPermissionForSelection = (permission) => ({
        id: permission.id,
        name: permission.name,
        description: permission.description,
    });
    const { hasPermission } = usePermissions();
    const canEditPermissions = hasPermission(26);

    const handleCheckboxChange = (id) => {
        setFormData(prev => {
            const permission = permissions.find(p => p.id === id);
            if (!permission) return prev;

            const isCurrentlySelected = prev.permissions.some(p => p.id === id);

            let updatedPermissions;
            if (isCurrentlySelected) {
                // Remover permiso
                updatedPermissions = prev.permissions.filter(p => p.id !== id);
            } else {
                // Agregar permiso con formato consistente
                const formattedPermission = formatPermissionForSelection(permission)
                updatedPermissions = [...prev.permissions, formattedPermission];
            }

            return {
                ...prev,
                permissions: updatedPermissions,
            };
        });
    };

    const handleSelectAll = () => {
        const allSelected = filteredPermissions.every(perm =>
            isPermissionSelected(formData.permissions, perm.id)
        )

        if (allSelected) {
            //Desmarcar todos los permisos de la categoría
            setFormData(prev => ({
                ...prev,
                permissions: prev.permissions.filter(p =>
                    !filteredPermissions.some(fp => fp.id === p.id)
                )
            }));
        } else {
            // Marcar todos los permisos de la categoria
            const newPermissions = filteredPermissions
                .filter(perm => !isPermissionSelected(formData.permissions, perm.id))
                .map(formatPermissionForSelection)

            setFormData(prev => ({
                ...prev,
                permissions: [...prev.permissions, ...newPermissions]
            }));
        }
    }

    const resetPermissions = () => {
        setFormData(prev => ({ ...prev, permissions: [] }))
    }

    return (
        <>
            {/* Categories Select */}
            <div className="flex flex-col">
                <label className="font-semibold text-sm text-secondary">
                    Categorías de permisos
                </label>
                <select
                    area-label="Permissions Categories Select"
                    className="input-theme mt-2 w-64"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
                <p className="text-xs text-neutral-500 mt-2">
                    Seleccione una categoría arriba para configurar sus permisos específicos.
                </p>
            </div>
            {/* Permission Section */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mt-4">
                {/* Left side: permissions table */}
                <div className="flex flex-col gap-4">
                    <div className="table-theme overflow-hidden">
                        <div className="grid grid-cols-[1fr_auto] items-center px-4 py-2 font-semibold bg-hover text-secondary border-b">
                            <span>Nombre permiso</span>
                            <div className="flex items-center gap-2">
                                <span>Seleccionar todo</span>
                                <input
                                    area-label="Select All Checkbox"
                                    type="checkbox"
                                    className="h-4 w-4"
                                    disabled={mode === "view" || !canEditPermissions}
                                    checked={
                                        filteredPermissions.length > 0 &&
                                        filteredPermissions.every(perm =>
                                            isPermissionSelected(formData.permissions, perm.id)
                                        )
                                    }
                                    onChange={handleSelectAll}
                                />
                            </div>
                        </div>
                        {filteredPermissions.map((perm) => (
                            <div
                                key={perm.id}
                                className={`grid grid-cols-[1fr_auto] items-center px-4 py-2 border-b border-gray-300 last:border-b-0 ${isPermissionSelected(formData.permissions, perm.id) ? '' : 'bg-hover'
                                    }`}
                            >
                                <span className="text-primary">{perm.description}</span>
                                <input
                                    area-label="Permission Checkbox"
                                    type="checkbox"
                                    className="h-4 w-4"
                                    disabled={mode === "view" || !canEditPermissions}
                                    checked={isPermissionSelected(formData.permissions, perm.id)}
                                    onChange={() => handleCheckboxChange(perm.id)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Footer info */}
                    <div className="flex items-center gap-2 text-sm text-secondary">
                        <span className="h-2 w-2 rounded-full bg-accent inline-block"></span>
                        Configuración actual:
                        <span className="font-medium text-accent">{selectedCategory}</span>
                        <span className="ml-2">
                            Permisos activos:{" "}
                            <b>{countSelectedInCategory(selectedCategory)}</b> of{" "}
                            <b>{filteredPermissions.length}</b>
                        </span>
                    </div>

                    {/* Reset Button */}
                    {mode !== "view" && (
                        <div className="flex gap-3">
                            <button
                                area-label="Reset Button"
                                type="button"
                                disabled = {!canEditPermissions}
                                onClick={resetPermissions}
                                className="btn-theme btn-secondary px-6 py-2 rounded-lg"
                            >
                                Restablecer todo
                            </button>
                        </div>
                    )}
                </div>

                {/* Right side: categories summary */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                    {categories.map((cat) => (
                        <div key={cat} className="card-theme p-3 h-24 text-sm">
                            <div className="flex flex-col items-center justify-between">
                                <span className="text-primary">{cat}</span>
                                <span className="text-xs text-secondary">
                                    {countSelectedInCategory(cat)}/
                                    {permissions.filter((p) => p.category === cat).length} activo
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
};

export default PermissionManager;