"use client";
import { useEffect, useState, useMemo } from "react";
import TableList from "@/app/components/shared/TableList";
import { useTheme } from "@/contexts/ThemeContext";
import { createColumnHelper } from "@tanstack/react-table";
import { FiSearch, FiFilter } from "react-icons/fi";
import { getAudit } from "@/services/auditService";
import { getUserInfo } from "@/services/authService";
import { getPermissions } from "@/services/roleService";
import AuditLogFilter from "@/app/components/auditLog/filters/AuditLogFilter";

const page = () => {
    useTheme();
    const [globalFilter, setGlobalFilter] = useState("");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userCache, setUserCache] = useState({}); // Cache de usuarios
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({});

    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
        // aquí decides: si llamas al backend con query params o filtras data en frontend
    };

    const handleCleanFilters = () => {
        setFilters({});
        // recargar todo o quitar filtros
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Traer auditorías
                const audits = await getAudit();
                // Traer todos los permisos
                const perms = await getPermissions();
                // Enriquecer datos
                const enriched = await Promise.all(
                    audits.map(async (item) => {
                        // usuario: usar actor_id o sino object_id
                        const userId = item.actor_id ?? item.object_id;
                        const dateObj = new Date(item.ts);
                        const rawDate = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
                        let userName = "Desconocido";

                        if (userId) {
                            // si ya lo tenemos en cache, usarlo
                            if (userCache[userId]) {
                                userName = userCache[userId];
                            } else {
                                try {
                                    const userResp = await getUserInfo(userId);
                                    // tu endpoint devuelve data: [ { ... } ]
                                    const user = userResp?.data?.[0];
                                    if (user) {
                                        userName = user.name;
                                        setUserCache((prev) => ({ ...prev, [userId]: userName }));
                                    }
                                } catch {
                                    userName = `ID: ${userId}`;
                                }
                            }
                        }

                        // permiso: buscar por id
                        const permDesc =
                            perms.find((p) => p.id === item.permission_id)?.description ||
                            (item.permission_id ? `ID: ${item.permission_id}` : "N/A");

                        return {
                            ts: formatDate(item.ts),
                            rawDate,
                            actor: userName,
                            actorRole: item.actor_role ?? "N/A",
                            feature: item.feature,
                            operation: item.operation,
                            permission: permDesc,
                            change: Object.entries(item.diff?.changed || {})
                                .map(
                                    ([field, { from, to }]) =>
                                        `${field}: ${from ?? "null"} → ${to ?? "null"}`
                                )
                                .join(", "),
                        };
                    })
                );

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
            columnHelper.accessor("feature", {
                header: "Funcionalidad",
                cell: (info) => <div className="text-secondary">{info.getValue()}</div>,
            }),
            columnHelper.accessor("permission", {
                header: "Permiso",
                cell: (info) => <div className="text-secondary">{info.getValue()}</div>,
            }),
            columnHelper.accessor("operation", {
                header: "Operación",
                cell: (info) => <div className="text-secondary">{info.getValue()}</div>,
            }),
            columnHelper.accessor("change", {
                header: "Cambios",
                cell: (info) => <div className="text-secondary">{info.getValue()}</div>,
            }),
        ],
        []
    );

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const matchesGlobal =
                item.actor?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                item.feature?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                item.operation?.toLowerCase().includes(globalFilter.toLowerCase());

            const matchesDate = filters.date
                ? item.rawDate === filters.date // ✅ comparar con rawDate
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
                                    placeholder="Buscar por usuario, funcionalidad u operación"
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
