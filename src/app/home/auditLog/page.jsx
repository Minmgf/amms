"use client";
import AuditLogFilter from "@/app/components/modals/filters/AuditLogFilter";
import { useEffect, useState } from "react";
import { FiSearch, FiFilter } from "react-icons/fi";

const badgeColors = [
    "bg-red-500 text-white",
    "bg-pink-500 text-white",
    "bg-orange-400 text-white",
    "bg-yellow-400 text-black",
    "bg-green-500 text-white",
    "bg-emerald-500 text-white",
    "bg-teal-500 text-white",
    "bg-blue-500 text-white",
    "bg-indigo-500 text-white",
    "bg-purple-500 text-white",
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
        <div className="p-6 w-full bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Access and Audit Log</h1>

            <div className="flex items-center gap-3 mb-6">
                <div className="relative flex-1 min-w-0 sm:flex-none sm:w-72">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Introduce a name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex bg-white items-center justify-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                    <FiFilter /> Filter by
                </button>
                <AuditLogFilter
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            </div>

            <div className="overflow-x-auto bg-white shadow rounded-xl">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-900 text-sm">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">User name</th>
                            <th className="px-6 py-3">Action type</th>
                            <th className="px-6 py-3">Description</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white text-gray-600 text-sm">
                        {currentData.map((item, index) => (
                            <tr key={index} className="border-t border-gray-300">
                                <td className="px-6 py-3 whitespace-nowrap">{item.date}</td>
                                <td className="px-6 py-3">{item.user}</td>
                                <td className="px-6 py-3">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getRandomColor(
                                            item.action
                                        )}`}
                                    >
                                        {item.action}
                                    </span>
                                </td>
                                <td className="px-6 py-3">{item.description}</td>
                            </tr>
                        ))}

                        {currentData.length === 0 && (
                            <tr>
                                <td
                                    colSpan="4"
                                    className="text-center text-gray-500 py-6"
                                >
                                    No results found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between mt-6 text-sm text-gray-700">
                <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
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
                                className={`px-3 py-1 rounded-lg ${currentPage === pageNum
                                    ? "bg-gray-900 text-white"
                                    : "border hover:bg-gray-100"
                                    }`}
                            >
                                {pageNum}
                            </button>
                        ))}

                    {totalPages > 5 && <span>...</span>}
                </div>

                <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                    Next →
                </button>
            </div>
        </div>
    )
}

export default page