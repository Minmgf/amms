"use client";
import { FiX } from "react-icons/fi";

export default function RoleManagementFilter({ isOpen, onClose }) {
    if (!isOpen) return null; // si no está abierto, no se renderiza

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
                {/* Botón cerrar (X) */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-black"
                >
                    <FiX size={18} />
                </button>

                <h2 className="text-lg font-semibold mb-4">Filters</h2>

                {/* Campos */}
                <div>
                    <label className="block text-sm font-medium mb-1">Satus</label>
                    <select className="w-full border border-gray-300 rounded-md p-2 outline-none shadow focus:ring-2 focus:ring-red-500">
                        <option value="">Select</option>
                        <option value="create">Active</option>
                        <option value="update">Inactive</option>
                    </select>
                </div>

                {/* Botones */}
                <div className="flex gap-4 mt-6">
                    <button className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-500">
                        Clean
                    </button>
                    <button className="flex-1 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">
                        Apply
                    </button>
                </div>
            </div>
        </div>

    );
}
