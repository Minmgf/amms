"use client";
import { useEffect, useState, useMemo } from "react";
import TableList from "@/app/components/shared/TableList";
import { useTheme } from "@/contexts/ThemeContext";
import { createColumnHelper } from "@tanstack/react-table";
import { FiSearch, FiFilter } from "react-icons/fi";
import { getAudit } from "@/services/auditService";
import { getPermissions } from "@/services/roleService";
import AuditLogFilter from "@/app/components/auditLog/filters/AuditLogFilter";

const page = () => {
    useTheme();
    const [globalFilter, setGlobalFilter] = useState("");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({});

    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
    };

    const handleCleanFilters = () => {
        setFilters({});
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const audits = await getAudit();
                const perms = await getPermissions();
                
                const enriched = audits.map((item) => {
                    const dateObj = new Date(item.ts);
                    const rawDate = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
                    
                    // Obtener el nombre del usuario desde actor_name
                    const userName = item.actor_name || "Desconocido";
                    
                    // Buscar el permiso por id
                    const permDesc =
                        perms.find((p) => p.id === item.permission_id)?.description ||
                        (item.permission_id ? `ID: ${item.permission_id}` : "N/A");
                    
                    // Formatear el diff según la operación
                    let diffText = "";
                    const diff = item.diff || {};
                    
                    if (item.operation === "CREATE" && diff.created) {
                        const fields = Object.entries(diff.created)
                            .filter(([key]) => key !== "id_machinery" && key !== "id_tracker_sheet")
                            .map(([key, value]) => `${key}: ${value ?? "null"}`)
                            .join(", ");
                        diffText = `Creado: ${fields}`;
                    } else if (item.operation === "UPDATE" && diff.changed) {
                        const changes = Object.entries(diff.changed)
                            .map(([field, change]) => 
                                `${field}: ${change.from ?? "null"} → ${change.to ?? "null"}`
                            )
                            .join(", ");
                        diffText = `Modificado: ${changes}`;
                    } else if (item.operation === "DELETE" && diff.removed) {
                        const fields = Object.entries(diff.removed)
                            .map(([key, value]) => `${key}: ${value ?? "null"}`)
                            .join(", ");
                        diffText = `Eliminado: ${fields}`;
                    }

                    return {
                        ts: formatDate(item.ts),
                        rawDate,
                        actor: userName,
                        actorRole: item.actor_role ?? "N/A",
                        module: item.module ?? "N/A",
                        submodule: item.submodule ?? "N/A",
                        permission: permDesc,
                        operation: item.operation,
                        diff: diffText || "Sin cambios",
                        diffRaw: diff, // Guardamos el diff original para usarlo en la columna
                    };
                });

                setData(enriched);
            } catch (error) {
                console.error("Error cargando auditorías:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString("es-CO", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    const columnHelper = createColumnHelper();
    const columns = useMemo(
        () => [
            columnHelper.accessor("ts", {
                header: "Fecha y Hora",
                cell: (info) => <div className="text-primary">{info.getValue()}</div>,
            }),
            columnHelper.accessor("actor", {
                header: "Usuario",
                cell: (info) => <div className="text-secondary">{info.getValue()}</div>,
            }),
            columnHelper.accessor("actorRole", {
                header: "Rol",
                cell: (info) => <div className="text-secondary">{info.getValue()}</div>,
            }),
            columnHelper.accessor("module", {
                header: "Módulo",
                cell: (info) => <div className="text-secondary">{info.getValue()}</div>,
            }),
            columnHelper.accessor("submodule", {
                header: "Submódulo",
                cell: (info) => <div className="text-secondary">{info.getValue()}</div>,
            }),
            columnHelper.accessor("permission", {
                header: "Permiso",
                cell: (info) => <div className="text-secondary">{info.getValue()}</div>,
            }),
            columnHelper.accessor("operation", {
                header: "Operación",
                cell: (info) => {
                    const operation = info.getValue();
                    const colors = {
                        CREATE: "text-green-600",
                        UPDATE: "text-blue-600",
                        DELETE: "text-red-600",
                    };
                    return (
                        <div className={`font-semibold ${colors[operation] || "text-secondary"}`}>
                            {operation}
                        </div>
                    );
                },
            }),
            columnHelper.accessor("diff", {
                header: "Cambios",
                cell: (info) => {
                    const value = info.getValue();
                    const row = info.row.original;
                    
                    if (!value || value === "Sin cambios") {
                        return <div className="text-secondary text-sm">Sin cambios</div>;
                    }
                    
                    const diff = row.operation === "CREATE" 
                        ? Object.entries(info.row.original.diffRaw?.created || {})
                        : row.operation === "UPDATE"
                        ? Object.entries(info.row.original.diffRaw?.changed || {})
                        : Object.entries(info.row.original.diffRaw?.removed || {});
                    
                    if (diff.length === 0) {
                        return <div className="text-secondary text-sm">Sin cambios</div>;
                    }
                    
                    return (
                        <div className="space-y-1">
                            {diff.map(([key, val], idx) => {
                                if (key === "id_machinery" || key === "id_tracker_sheet") return null;
                                
                                return (
                                    <div key={idx} className="flex items-start gap-2">
                                        <span className="text-primary text-sm">
                                            {key}: 
                                        </span>
                                        <span className="text-secondary text-sm">
                                            {row.operation === "UPDATE" 
                                                ? `${val.from ?? "null"} → ${val.to ?? "null"}`
                                                : `${val ?? "null"}`
                                            }
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    );
                },
            }),
        ],
        []
    );

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const matchesGlobal =
                item.actor?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                item.module?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                item.submodule?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                item.operation?.toLowerCase().includes(globalFilter.toLowerCase());

            const matchesDate = filters.date
                ? item.rawDate === filters.date
                : true;

            const matchesAction =
                filters.actionType ? item.operation === filters.actionType : true;

            const matchesUser = filters.user
                ? item.actor?.toLowerCase().includes(filters.user.toLowerCase())
                : true;

            return matchesGlobal && matchesDate && matchesAction && matchesUser;
        });
    }, [data, globalFilter, filters]);

    return (
        <>
            <div className="parametrization-page p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 md:mb-10">
                        <h1 className="parametrization-header text-2xl md:text-3xl font-bold">
                            Registro de acceso y Auditoría
                        </h1>
                    </div>

                    {/* Filter & Search */}
                    <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-4 justify-between lg:justify-start">
                        <div className="relative flex-1 max-w-md">
                            <div className="flex items-center parametrization-input rounded-md px-3 py-2 w-72">
                                <FiSearch className="text-secondary w-4 h-4 mr-2" />
                                <input
                                    type="text"
                                    placeholder="Buscar por usuario, módulo u operación"
                                    value={globalFilter}
                                    onChange={(e) => setGlobalFilter(e.target.value)}
                                    className="flex-1 outline-none"
                                />
                            </div>
                        </div>

                        <button
                            className="parametrization-filter-button flex items-center space-x-2 px-3 md:px-4 py-2 transition-colors w-fit"
                            onClick={() => setIsFilterOpen(true)}
                        >
                            <FiFilter className="filter-icon w-4 h-4" />
                            <span className="text-sm">Filtrar por</span>
                        </button>
                    </div>

                    {/* Table */}
                    <TableList
                        columns={columns}
                        data={filteredData}
                        loading={loading}
                        globalFilter={globalFilter}
                        onGlobalFilterChange={setGlobalFilter}
                    />
                </div>
            </div>
            <AuditLogFilter
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onApply={handleApplyFilters}
                onClean={handleCleanFilters}
            />
        </>
    );
};

export default page;