"use client";
import AuditLogFilter from "@/app/components/auditLog/filters/AuditLogFilter";
import { useEffect, useState } from "react";
import { FiSearch, FiFilter } from "react-icons/fi";

const badgeColors = [
    'parametrization-badge parametrization-badge-1',
    'parametrization-badge parametrization-badge-2',
    'parametrization-badge parametrization-badge-3',
    'parametrization-badge parametrization-badge-4',
    'parametrization-badge parametrization-badge-5',
    'parametrization-badge parametrization-badge-6',
    'parametrization-badge parametrization-badge-7',
    'parametrization-badge parametrization-badge-8',
    'parametrization-badge parametrization-badge-9',
    'parametrization-badge parametrization-badge-10',
];

// 🔄 Función para asignar siempre el mismo color a cada acción
const getRandomColor = (action) => {
    const index =
        action
            .split("")
            .reduce((acc, char) => acc + char.charCodeAt(0), 0) % badgeColors.length;
    return badgeColors[index];
};

const page = () => {
    const [search, setSearch] = useState("");
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetch("https://api.tu-backend.com/audit-log")
            .then((res) => res.json())
            .then((resData) => setData(resData))
            .catch(() => {
                setData([
                    {
                        date: "2024-01-15 14:30:25",
                        user: "Torres Hernán Darío",
                        action: "Edit",
                        description: "Edited personal information",
                    },
                    {
                        date: "2024-01-15 13:45:12",
                        user: "María Elena Rodríguez",
                        action: "Change password",
                        description: "Example",
                    },
                    {
                        date: "2024-01-15 12:20:08",
                        user: "Carlos Alberto Mendez",
                        action: "Deactivate account",
                        description: "Example",
                    },
                    {
                        date: "2024-01-15 11:15:33",
                        user: "Ana Patricia Silva",
                        action: "Assign role",
                        description: "Example",
                    },
                ]);
            });
    }, []);

    const filteredData = data.filter((item) =>
        item.user.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = filteredData.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    return (
        <div className="parametrization-page p-6 w-full min-h-screen">
            <h1 className="parametrization-header text-2xl font-bold mb-6">Access and Audit Log</h1>

            <div className="flex items-center gap-3 mb-6">
                <div className="relative flex-1 min-w-0 sm:flex-none sm:w-72">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                    <input
                        type="text"
                        placeholder="Introduce a name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="parametrization-input w-full pl-10 pr-4 py-2"
                    />
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="parametrization-filter-button flex items-center justify-center gap-2 px-4 py-2"
                >
                    <FiFilter /> Filter by
                </button>
                <AuditLogFilter
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            </div>

            <div className="overflow-x-auto parametrization-table shadow rounded-xl">
                <table className="w-full text-left">
                    <thead className="parametrization-table-header text-sm">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">User name</th>
                            <th className="px-6 py-3">Action type</th>
                            <th className="px-6 py-3">Description</th>
                        </tr>
                    </thead>
                    <tbody className="parametrization-table-body text-sm">
                        {currentData.map((item, index) => (
                            <tr key={index} className="parametrization-table-row">
                                <td className="px-6 py-3 whitespace-nowrap text-secondary">{item.date}</td>
                                <td className="px-6 py-3 text-primary">{item.user}</td>
                                <td className="px-6 py-3">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getRandomColor(
                                            item.action
                                        )}`}
                                    >
                                        {item.action}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-secondary">{item.description}</td>
                            </tr>
                        ))}

                        {currentData.length === 0 && (
                            <tr>
                                <td
                                    colSpan="4"
                                    className="text-center parametrization-empty py-6"
                                >
                                    No results found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between mt-6 text-sm">
                <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="parametrization-pagination-button flex items-center gap-1 px-3 py-1"
                >
                    ← Previous
                </button>

                <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .slice(0, 5)
                        .map((pageNum) => (
                            <button
                                key={pageNum}
                                onClick={() => goToPage(pageNum)}
                                className={`parametrization-pagination-button px-3 py-1 rounded-lg ${currentPage === pageNum ? 'active' : ''}`}
                            >
                                {pageNum}
                            </button>
                        ))}

                    {totalPages > 5 && <span className="text-secondary">...</span>}
                </div>

                <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="parametrization-pagination-button flex items-center gap-1 px-3 py-1"
                >
                    Next →
                </button>
            </div>
        </div>
    )
}

export default page