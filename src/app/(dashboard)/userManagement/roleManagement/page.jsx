"use client";
import { useEffect, useState } from "react";
import { FiSearch, FiFilter, FiEye, FiEdit2, FiLock, FiUnlock, FiPlus } from "react-icons/fi";
import RoleManagementFilter from "../../../components/roleManagement/filters/RoleManagementFilter";

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
                        roleName: "Admin",
                        description: "Full system access with all permissions including user management, system configuration, and data administration",
                        status: "Active",
                    },
                    {
                        roleName: "Employee",
                        description: "Standard employee access with basic functionality for daily operations and task management",
                        status: "Inactive",
                    },
                ]);
            });
    }, []);

    const filteredData = data.filter((item) =>
        item.roleName.toLowerCase().includes(search.toLowerCase())
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
                        placeholder="Introduce a role name..."
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
                <RoleManagementFilter
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
                <button
                    className="flex bg-white items-center justify-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                    <FiPlus /> Add role
                </button>
            </div>

            <div className="overflow-x-auto bg-white shadow rounded-xl">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-900 text-sm">
                        <tr>
                            <th className="px-6 py-3">Role name</th>
                            <th className="px-6 py-3">Description</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white text-gray-600 text-sm">
                        {currentData.map((item, index) => (
                            <tr key={index} className="group border-t border-gray-300">
                                <td className="px-6 py-3 whitespace-nowrap">{item.roleName}</td>
                                <td className="px-6 py-3">{item.description}</td>
                                <td className="px-6 py-3">
                                    <span
                                        className={`px-3 text-white py-1 rounded-full text-xs font-medium ${item.status === 'Active' ? "bg-green-500" : "bg-rose-500"}`}
                                    >
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-3">
                                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            type="button"
                                            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                                        >
                                            <FiEye className="text-gray-600" />
                                            <span>View</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                                        >
                                            <FiEdit2 className="text-gray-600" />
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                                        >
                                            {item.status === "Active" ? (
                                                <>
                                                    <FiLock className="text-rose-500" />
                                                    <span>Disable</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FiUnlock className="text-green-500" />
                                                    <span>Enable</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </td>
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