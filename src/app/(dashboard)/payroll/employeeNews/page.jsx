"use client";

import React, { useState, useEffect, useMemo } from "react";
import PermissionGuard from "@/app/(auth)/PermissionGuard";
import TableList from "@/app/components/shared/TableList";
import FilterModal from "@/app/components/shared/FilterModal";
import { getEmployeeNews } from "@/services/payrollService";
import { FaFilter, FaFileAlt } from "react-icons/fa";

const NEWS_TYPE_CHOICES = [
    { value: 'CREACION_EMPLEADO', label: 'Creación de empleado' },
    { value: 'ACTUALIZACION_EMPLEADO', label: 'Actualizar empleado' },
    { value: 'DESACTIVACION_EMPLEADO', label: 'Desactivar empleado' },
    { value: 'ACTIVACION_EMPLEADO', label: 'Activar empleado' },
    { value: 'GENERAR_OTRO_SI', label: 'Generar otro si' },
    { value: 'CAMBIO_CONTRATO', label: 'Cambio de contrato' },
    { value: 'FINALIZACION_CONTRATO', label: 'Finalización de contrato' },
];

const EmployeeNewsPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState("");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        news_type: "",
        start_date: "",
        end_date: "",
        document_number: ""
    });
    const [tempFilters, setTempFilters] = useState({
        news_type: "",
        start_date: "",
        end_date: "",
        document_number: ""
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            // Obtenemos todos los datos sin filtros del servidor
            const response = await getEmployeeNews({});
            if (response && response.data) {
                setData(response.data);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error("Error fetching employee news:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFilterApply = () => {
        setFilters(tempFilters);
        setIsFilterModalOpen(false);
    };

    const handleFilterClear = () => {
        const resetFilters = { news_type: "", start_date: "", end_date: "", document_number: "" };
        setTempFilters(resetFilters);
        setFilters(resetFilters);
        setIsFilterModalOpen(false);
    };

    // Filtrado específico (tipo, fecha, documento)
    const filteredData = useMemo(() => {
        return data.filter(item => {
            // Filtro por tipo de novedad
            if (filters.news_type && item.news_type !== filters.news_type) {
                return false;
            }

            // Filtro por fecha (rango)
            if (filters.start_date || filters.end_date) {
                const itemDate = new Date(item.news_date);
                
                if (filters.start_date) {
                    const startDate = new Date(filters.start_date);
                    startDate.setHours(0, 0, 0, 0);
                    if (itemDate < startDate) return false;
                }
                
                if (filters.end_date) {
                    const endDate = new Date(filters.end_date);
                    endDate.setHours(23, 59, 59, 999);
                    if (itemDate > endDate) return false;
                }
            }

            // Filtro por número de documento (asumiendo que está en employee_associated)
            if (filters.document_number) {
                const docNum = filters.document_number.toLowerCase();
                // Check if employee_associated exists and check against it
                if (!item.employee_associated || !item.employee_associated.toLowerCase().includes(docNum)) {
                    return false;
                }
            }

            return true;
        });
    }, [data, filters]);

    // Función de filtrado global personalizada
    const globalFilterFn = useMemo(() => {
        return (row, columnId, filterValue) => {
            if (!filterValue) return true;
            const search = filterValue.toLowerCase();
            const item = row.original;
            
            return (
                item.employee_associated?.toLowerCase().includes(search) ||
                item.news_type_display?.toLowerCase().includes(search) ||
                item.author_name?.toLowerCase().includes(search) ||
                item.origin?.toLowerCase().includes(search) ||
                item.observation?.toLowerCase().includes(search)
            );
        };
    }, []);

    const hasActiveFilters = useMemo(() => {
        return filters.news_type || filters.start_date || filters.end_date || filters.document_number;
    }, [filters]);

    const columns = useMemo(() => [
        {
            header: "Fecha",
            accessorKey: "news_date",
            cell: (info) => {
                const date = new Date(info.getValue());
                return date.toLocaleString("es-ES", {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        },
        {
            header: "Empleado Asociado",
            accessorKey: "employee_associated",
        },
        {
            header: "Tipo de Novedad",
            accessorKey: "news_type_display",
        },
        {
            header: "Autor",
            accessorKey: "author_name",
        },
        {
            header: "Origen",
            accessorKey: "origin",
        },
        {
            header: "Observación",
            accessorKey: "observation",
            cell: (info) => (
                <span className="truncate max-w-xs block" title={info.getValue()}>
                    {info.getValue()}
                </span>
            )
        },
    ], []);

    return (
        <PermissionGuard permission={189}>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Novedades de Empleados</h1>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="w-full sm:w-96">
                        <input
                            type="text"
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Buscar..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setTempFilters(filters);
                                setIsFilterModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                        >
                            <FaFilter className="text-gray-500" />
                            <span>Filtrar por</span>
                            {hasActiveFilters && (
                                <span className="ml-1 flex h-2 w-2 rounded-full bg-blue-500" />
                            )}
                        </button>
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                        >
                            <FaFileAlt className="text-gray-500" />
                            <span>Generar Reporte</span>
                        </button>
                    </div>
                </div>

                <TableList
                    data={filteredData}
                    columns={columns}
                    loading={loading}
                    globalFilter={globalFilter}
                    onGlobalFilterChange={setGlobalFilter}
                    globalFilterFn={globalFilterFn}
                />

                <FilterModal
                    open={isFilterModalOpen}
                    onClose={() => setIsFilterModalOpen(false)}
                    onApply={handleFilterApply}
                    onClear={handleFilterClear}
                >
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Fecha de novedad</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Inicio</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={tempFilters.start_date}
                                            onChange={(e) => setTempFilters({ ...tempFilters, start_date: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white pr-8"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Fin</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={tempFilters.end_date}
                                            onChange={(e) => setTempFilters({ ...tempFilters, end_date: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white pr-8"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-900">
                                    Tipo de novedad
                                </label>
                                <select
                                    value={tempFilters.news_type}
                                    onChange={(e) => setTempFilters({ ...tempFilters, news_type: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                >
                                    <option value="">Seleccionar tipo</option>
                                    {NEWS_TYPE_CHOICES.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-900">
                                    Número de documento del empleado
                                </label>
                                <input
                                    type="text"
                                    value={tempFilters.document_number}
                                    onChange={(e) => setTempFilters({ ...tempFilters, document_number: e.target.value })}
                                    placeholder="Escribe el número"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                />
                            </div>
                        </div>
                    </div>
                </FilterModal>
            </div>
        </PermissionGuard>
    );
};

export default EmployeeNewsPage;
