import React from "react";
import { FiX, FiCalendar } from "react-icons/fi";

export default function ReportsGenerationModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="modal-theme rounded-xl shadow-2xl w-full max-w-2xl bg-surface">
                {/* Header */}
                <div className="flex items-center justify-between p-theme-lg border-b border-gray-200 relative">
                    <h2 className="text-theme-2xl font-theme-bold text-center w-full text-primary">
                        Reports Generation
                    </h2>
                    <button
                        onClick={onClose}
                        className="absolute right-6 p-theme-sm hover:bg-hover rounded-theme-md transition-fast"
                    >
                        <FiX className="w-6 h-6 text-secondary" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-theme-lg space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Employee ID */}
                            <div>
                                <label className="block text-theme-sm font-theme-medium text-primary mb-2">
                                    Enter the employee's ID
                                </label>
                                <input
                                    type="text"
                                    defaultValue="1234567890"
                                    className="parametrization-input"
                                />
                            </div>

                            {/* Info Section */}
                            <div className="space-y-3 pl-1 pt-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-theme-bold text-primary">Departament:</span>
                                    <span className="text-primary">Maintenance</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-theme-bold text-primary">Charge:</span>
                                    <span className="text-primary">Maintenance Technician</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-theme-bold text-primary">Employee:</span>
                                    <span className="text-primary">Herny Luis Ramirez Collazos</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Report Type */}
                            <div>
                                <label className="block text-theme-sm font-theme-medium text-primary mb-2">
                                    Type of report to generate
                                </label>
                                <select className="parametrization-input appearance-none bg-no-repeat bg-right pr-8">
                                    <option value=""></option>
                                </select>
                            </div>

                            {/* Date Range */}
                            <div>
                                <label className="block text-theme-sm font-theme-medium text-primary mb-2">
                                    Select the date range for the report
                                </label>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="From"
                                            className="parametrization-input pr-10"
                                        />
                                        <FiCalendar className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary w-5 h-5" />
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="To"
                                            className="parametrization-input pr-10"
                                        />
                                        <FiCalendar className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Button */}
                    <div className="flex justify-center mt-8 mb-2">
                        <button
                            className="btn-theme btn-primary px-8 py-3 text-theme-base font-theme-bold rounded-theme-xl"
                            style={{
                                backgroundColor: "#000000",
                                color: "white",
                            }}
                        >
                            Generate and download
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
