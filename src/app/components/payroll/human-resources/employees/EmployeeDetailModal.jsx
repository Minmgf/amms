"use client";

import React, { useEffect, useState } from "react";
import { FiX, FiEdit, FiFileText, FiCalendar, FiUser, FiClock } from "react-icons/fi";
import { getEmployeeDetails, getEmployeeHistory } from "@/services/employeeService";
import ContractDetailModal from "./ContractDetailModal";

export default function EmployeeDetailModal({
  isOpen,
  onClose,
  employeeId,
  onEdit
}) {
  // Removed activeTab state as we don't need tabs
  const [employeeData, setEmployeeData] = useState(null);
  const [employeeHistory, setEmployeeHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  // Date range filter for history
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (isOpen && employeeId) {
      loadEmployeeData();
      loadEmployeeHistory();
    }
  }, [isOpen, employeeId]);

  const loadEmployeeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmployeeDetails(employeeId);
      setEmployeeData(data);
    } catch (err) {
      setError("Error al cargar la información del empleado");
      console.error("Error loading employee data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeHistory = async () => {
    try {
      const history = await getEmployeeHistory(employeeId);
      setEmployeeHistory(history || []);
    } catch (err) {
      console.error("Error loading employee history:", err);
      setEmployeeHistory([]);
    }
  };

  const handleContractView = (contract) => {
    setSelectedContract(contract);
    setIsContractModalOpen(true);
  };

  const handleDateFilter = () => {
    // Apply date filter to history
    loadEmployeeHistory();
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    loadEmployeeHistory();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <div className="modal-theme rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-theme-lg border-b border-primary">
            <h2 className="text-theme-2xl font-theme-bold text-primary">
              Información del Empleado
            </h2>
            <button
              className="p-theme-sm hover:bg-hover rounded-theme-md transition-fast cursor-pointer"
              onClick={onClose}
              aria-label="Cerrar modal de detalles del empleado"
            >
              <FiX className="w-5 h-5 text-secondary" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
                <p className="text-secondary">Cargando información del empleado...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center text-error">
                <p>{error}</p>
              </div>
            </div>
          ) : employeeData ? (
            <>

              {/* Content */}
              <div className="p-theme-lg">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Personal Information */}
                  <div className="space-y-6">
                    <div className="card-theme">
                      <h3 className="text-theme-lg font-theme-semibold text-primary mb-4">
                        Información Personal
                      </h3>
                      <div className="space-y-4">
                        <InfoField label="Nombre completo" value={employeeData.fullName} />
                        <InfoField label="Tipo de documento" value={employeeData.documentType} />
                        <InfoField label="Número de documento" value={employeeData.document} />
                        <InfoField label="Género" value={employeeData.gender} />
                        <InfoField label="Fecha de nacimiento" value={formatDate(employeeData.birthDate)} />
                        <InfoField label="Correo electrónico" value={employeeData.email} />
                        <InfoField label="Número telefónico" value={employeeData.phone} />
                        <InfoField label="País" value={employeeData.country} />
                        <InfoField label="Estado/Departamento" value={employeeData.state} />
                        <InfoField label="Ciudad" value={employeeData.city} />
                        <InfoField label="Dirección" value={employeeData.address} />
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Contract Information and Novelty History */}
                  <div className="space-y-6">
                    <div className="card-theme">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-theme-lg font-theme-semibold text-primary">
                          Información del Contrato
                        </h3>
                        {employeeData.contract && (
                          <button
                            onClick={() => handleContractView(employeeData.contract)}
                            className="btn-theme btn-outline text-theme-sm gap-2"
                          >
                            <FiFileText className="w-4 h-4" />
                            Contratos
                          </button>
                        )}
                      </div>
                      <div className="space-y-4">
                        <InfoField label="Cargo" value={employeeData.position} />
                        <InfoField label="Departamento" value={employeeData.department} />
                        <InfoField 
                          label="Estado" 
                          value={
                            <span className={`parametrization-badge ${
                              employeeData.status === "Activo" || employeeData.status === "Active"
                                ? "parametrization-badge-5"
                                : "parametrization-badge-1"
                            }`}>
                              {employeeData.status}
                            </span>
                          } 
                        />
                        <InfoField label="Contrato asociado" value={employeeData.contractCode} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Novelty History Section - Full Width */}
                <div className="mt-6">
                  <div className="card-theme">
                    <div className="p-theme-md border-b border-primary bg-surface">
                      <div className="flex items-center justify-between">
                        <h3 className="text-theme-lg font-theme-semibold text-primary">
                          Historial de Novedades
                        </h3>
                        <div className="flex gap-2">
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="input-theme text-theme-sm"
                            placeholder="Inicio"
                          />
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="input-theme text-theme-sm"
                            placeholder="Fin"
                          />
                          <button
                            onClick={clearDateFilter}
                            className="btn-theme btn-secondary text-theme-sm"
                          >
                            Limpiar
                          </button>
                          <button
                            onClick={handleDateFilter}
                            className="btn-theme btn-primary text-theme-sm"
                          >
                            Aplicar
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-theme-md">
                      {employeeHistory.length === 0 ? (
                        <div className="text-center py-8 text-secondary">
                          Este empleado no tiene novedades registradas.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {employeeHistory.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-theme-sm border border-primary rounded-theme-lg hover:bg-hover transition-fast"
                            >
                              <div className="flex items-center gap-4">
                                <div className="text-theme-sm text-secondary">
                                  {formatDateTime(item.date)}
                                </div>
                                <div className="text-theme-sm text-secondary">
                                  por {item.user}
                                </div>
                                <div className="text-theme-sm text-primary">
                                  {item.description}
                                </div>
                              </div>
                              <span className={`parametrization-badge ${
                                item.action === "creation" ? "parametrization-badge-5" :
                                item.action === "update" ? "parametrization-badge-8" :
                                item.action === "contract_change" ? "parametrization-badge-4" :
                                "parametrization-badge-10"
                              }`}>
                                {item.action}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-theme-lg border-t border-primary bg-surface">
                <button
                  onClick={() => onEdit?.(employeeData)}
                  className="btn-theme btn-primary gap-2"
                >
                  <FiEdit className="w-4 h-4" />
                  Editar información
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Contract Detail Modal */}
      <ContractDetailModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        contractData={selectedContract}
        employeeData={employeeData}
      />
    </>
  );
}

// Helper component for displaying information fields
function InfoField({ label, value }) {
  return (
    <div>
      <label className="block text-theme-sm font-theme-medium text-secondary mb-1">
        {label}
      </label>
      <div className="text-primary parametrization-text">
        {value || "—"}
      </div>
    </div>
  );
}
