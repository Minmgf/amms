import React, { useState, useEffect } from "react";
import { FiX, FiCalendar, FiSearch, FiDownload, FiAlertCircle } from "react-icons/fi";
import { getUserByDocument } from "@/services/employeeService";
import { generatePayrollHistoryReport } from "@/services/payrollService";

export default function ReportsGenerationModal({ isOpen, onClose }) {
    const [employeeId, setEmployeeId] = useState("");
    const [employeeData, setEmployeeData] = useState(null);
    const [reportType, setReportType] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const [loadingSearch, setLoadingSearch] = useState(false);
    const [loadingGenerate, setLoadingGenerate] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setEmployeeId("");
            setEmployeeData(null);
            setReportType("");
            setDateFrom("");
            setDateTo("");
            setError("");
            setSuccessMessage("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSearchEmployee = async () => {
        if (!employeeId.trim()) {
            setError("Por favor ingrese un número de documento.");
            return;
        }

        setLoadingSearch(true);
        setError("");
        setEmployeeData(null);

        try {
            const response = await getUserByDocument(employeeId);
            if (response && response.success && response.data) {
                const userData = response.data;

                // Correct name mapping based on API response
                const fullName = `${userData.name || ''} ${userData.first_last_name || ''} ${userData.second_last_name || ''}`.trim();

                setEmployeeData({
                    name: fullName,
                    department: userData.employee_department_name || "N/A",
                    charge: userData.employee_charge_name || "N/A",
                    document: userData.document_number
                });
            } else {
                setError("El documento ingresado no se encuentra registrado en el sistema.");
            }
        } catch (err) {
            console.error("Error searching employee:", err);
            setError("El documento ingresado no se encuentra registrado en el sistema.");
        } finally {
            setLoadingSearch(false);
        }
    };

    const handleGenerateReport = async () => {
        // Validations
        if (!employeeData) {
            setError("Debe buscar y seleccionar un empleado válido.");
            return;
        }
        if (!reportType) {
            setError("Debe seleccionar un tipo de informe.");
            return;
        }
        if (!dateFrom || !dateTo) {
            setError("Debe seleccionar el rango de fechas.");
            return;
        }
        if (new Date(dateFrom) > new Date(dateTo)) {
            setError("La fecha 'Desde' no puede ser mayor a la fecha 'Hasta'.");
            return;
        }

        setLoadingGenerate(true);
        setError("");
        setSuccessMessage("");

        try {
            const payload = {
                employeeIdentification: employeeData.document,
                dateFrom: dateFrom,
                dateTo: dateTo,
                reportType: reportType
            };

            const blob = await generatePayrollHistoryReport(payload);

            // Create download link
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;

            // Generate filename with current date
            const dateStr = new Date().toISOString().split('T')[0];
            link.setAttribute('download', `Historial_Nomina_${employeeData.document}_${dateStr}.pdf`);

            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            setSuccessMessage("Informe generado y descargado exitosamente.");
        } catch (err) {
            console.error("Error generating report:", err);
            setError("No fue posible generar el informe. Intente nuevamente.");
        } finally {
            setLoadingGenerate(false);
        }
    };

    const isFormValid = employeeData && reportType && dateFrom && dateTo && !loadingGenerate;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="modal-theme rounded-xl shadow-2xl w-full max-w-3xl bg-white overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">
                        Generación de Informes
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 space-y-8">

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 text-sm">
                            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-green-50 text-green-600 p-4 rounded-lg flex items-center gap-3 text-sm">
                            <FiDownload className="w-5 h-5 flex-shrink-0" />
                            {successMessage}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Employee Search */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Identificación del empleado
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={employeeId}
                                        onChange={(e) => setEmployeeId(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearchEmployee()}
                                        placeholder="Ingrese documento"
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                    <button
                                        onClick={handleSearchEmployee}
                                        disabled={loadingSearch}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {loadingSearch ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FiSearch className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Employee Info Card */}
                            <div className={`bg-gray-50 rounded-xl p-5 border border-gray-200 transition-all duration-300 ${employeeData ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                                    Información del Empleado
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">Nombre Completo</span>
                                        <span className="font-medium text-gray-900">{employeeData?.name || "---"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">Departamento</span>
                                        <span className="font-medium text-gray-900">{employeeData?.department || "---"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">Cargo</span>
                                        <span className="font-medium text-gray-900">{employeeData?.charge || "---"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Report Options */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de informe
                                </label>
                                <select
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                >
                                    <option value="">Seleccione un tipo...</option>
                                    <option value="PAYROLL_HISTORY">Historial de nóminas generadas</option>
                                    {/* <option value="CONTRACT_HISTORY">Historial de contratos y cargos</option> */}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rango de fechas
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-xs text-gray-500">Desde</span>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={dateFrom}
                                                max={dateTo}
                                                onChange={(e) => setDateFrom(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-gray-500">Hasta</span>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={dateTo}
                                                min={dateFrom}
                                                onChange={(e) => setDateTo(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Button */}
                    <div className="flex justify-center pt-4">
                        <button
                            onClick={handleGenerateReport}
                            disabled={!isFormValid}
                            className={`
                                flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all transform hover:scale-105 active:scale-95
                                ${isFormValid
                                    ? 'bg-black hover:bg-gray-800 shadow-lg hover:shadow-xl'
                                    : 'bg-gray-300 cursor-not-allowed'}
                            `}
                        >
                            {loadingGenerate ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Generando...</span>
                                </>
                            ) : (
                                <>
                                    <FiDownload className="w-5 h-5" />
                                    <span>Generar informe</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
