"use client";

import React, { useEffect, useState } from "react";
import { FiX, FiArrowLeft, FiEdit, FiPause, FiPlay } from "react-icons/fi";
import { getContractDetails, getContractHistory } from "@/services/employeeService";

export default function ContractDetailModal({
  isOpen,
  onClose,
  contractData,
  employeeData
}) {
  const [contractDetails, setContractDetails] = useState(null);
  const [contractHistory, setContractHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && contractData?.id) {
      loadContractDetails();
      loadContractHistory();
    }
  }, [isOpen, contractData]);

  const loadContractDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const details = await getContractDetails(contractData.id);
      setContractDetails(details);
    } catch (err) {
      setError("Error al cargar los detalles del contrato");
      console.error("Error loading contract details:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadContractHistory = async () => {
    try {
      const history = await getContractHistory(contractData.id);
      setContractHistory(history || []);
    } catch (err) {
      console.error("Error loading contract history:", err);
      setContractHistory([]);
    }
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

  const formatCurrency = (amount) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const isActiveContract = contractDetails?.status === "Active" || contractDetails?.status === "Activo";

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="modal-theme rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-theme-lg border-b border-primary">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-theme-sm hover:bg-hover rounded-theme-md transition-fast"
              aria-label="Volver a detalles del empleado"
            >
              <FiArrowLeft className="w-5 h-5 text-secondary" />
            </button>
            <h2 className="text-theme-2xl font-theme-bold text-primary">
              Información del Contrato
            </h2>
          </div>
          <button
            className="p-theme-sm hover:bg-hover rounded-theme-md transition-fast cursor-pointer"
            onClick={onClose}
            aria-label="Cerrar modal de detalles del contrato"
          >
            <FiX className="w-5 h-5 text-secondary" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
              <p className="text-secondary">Cargando detalles del contrato...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center text-error">
              <p>{error}</p>
            </div>
          </div>
        ) : contractDetails ? (
          <>
            <div className="p-theme-lg">
              {/* Action Buttons - Only show for active contracts */}
              {isActiveContract && (
                <div className="flex justify-center gap-3 mb-6">
                  <button className="btn-theme btn-primary gap-2">
                    <FiEdit className="w-4 h-4" />
                    Corrección de Contrato
                  </button>
                  <button className="btn-theme btn-primary gap-2">
                    <FiPause className="w-4 h-4" />
                    Terminar Contrato
                  </button>
                  <button className="btn-theme btn-primary gap-2">
                    <FiPlay className="w-4 h-4" />
                    Generar Otrosi
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Column - Contract History */}
                <div className="lg:col-span-1">
                  <div className="card-theme">
                    <div className="p-theme-md border-b border-primary bg-surface">
                      <h3 className="font-theme-semibold text-primary">Historial de Contratos</h3>
                    </div>
                    <div className="p-theme-md space-y-3 max-h-96 overflow-y-auto">
                      {contractHistory.map((contract, index) => (
                        <div
                          key={index}
                          className={`p-theme-sm rounded-theme-lg border cursor-pointer transition-fast ${
                            contract.id === contractDetails.id
                              ? "border-accent bg-accent/10"
                              : "border-primary hover:bg-hover"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-theme-medium text-theme-sm">{contract.code}</span>
                            <span className={`parametrization-badge ${
                              contract.status === "Active" || contract.status === "Activo"
                                ? "parametrization-badge-5"
                                : contract.status === "Finished" || contract.status === "Finalizado"
                                ? "parametrization-badge-10"
                                : "parametrization-badge-1"
                            }`}>
                              {contract.status}
                            </span>
                          </div>
                          <div className="text-theme-xs text-secondary">
                            <div>Cliente: {contract.client}</div>
                            <div>Creado: {formatDate(contract.createdDate)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contract Actions Historical */}
                  <div className="card-theme mt-6">
                    <div className="p-theme-md border-b border-primary bg-surface">
                      <h3 className="font-theme-semibold text-primary">Historial de Acciones del Contrato</h3>
                    </div>
                    <div className="p-theme-md space-y-3 max-h-64 overflow-y-auto">
                      {contractDetails.actionsHistory?.map((action, index) => (
                        <div key={index} className="p-theme-sm border border-primary rounded-theme-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-theme-medium text-theme-sm">{action.code}</span>
                            <span className={`parametrization-badge ${
                              action.type === "Creation" ? "parametrization-badge-5" :
                              action.type === "Termination" ? "parametrization-badge-1" :
                              action.type === "Modification" ? "parametrization-badge-8" :
                              "parametrization-badge-10"
                            }`}>
                              {action.type}
                            </span>
                          </div>
                          <div className="text-theme-xs text-secondary">
                            <div>Fecha: {formatDateTime(action.date)}</div>
                            <div>Usuario: {action.user}</div>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-4 text-secondary text-theme-sm">
                          No hay acciones registradas
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Contract Details */}
                <div className="lg:col-span-3 space-y-6">
                  {/* General Information */}
                  <div className="card-theme">
                    <h3 className="text-theme-lg font-theme-semibold text-primary mb-4">
                      Información General
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InfoField label="ID del Contrato" value={contractDetails.code} />
                      <InfoField label="Departamento" value={contractDetails.department} />
                      <InfoField label="Tipo de contrato" value={contractDetails.contractType} />
                      <InfoField label="Cargo" value={contractDetails.position} />
                      <InfoField label="Término fijo" value={formatDate(contractDetails.startDate)} />
                      <InfoField label="Fecha de finalización" value={formatDate(contractDetails.endDate)} />
                      <InfoField label="Frecuencia de pago" value={contractDetails.paymentFrequency} />
                      <InfoField label="Indefinido" value={contractDetails.indefinite ? "Sí" : "No"} />
                      <InfoField label="Mensual" value={contractDetails.monthly ? "Sí" : "No"} />
                      <InfoField label="Jornada laboral" value={contractDetails.workingDay} />
                      <InfoField label="Tiempo completo" value={contractDetails.fullTime ? "Sí" : "No"} />
                    </div>
                    <div className="mt-4">
                      <InfoField 
                        label="Descripción" 
                        value={contractDetails.description || "Desarrollo y mantenimiento de aplicaciones web usando tecnologías modernas"} 
                      />
                    </div>
                  </div>

                  {/* Contract Terms */}
                  <div className="card-theme">
                    <h3 className="text-theme-lg font-theme-semibold text-primary mb-4">
                      Términos del Contrato
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InfoField label="Modalidad base" value={contractDetails.baseModality} />
                      <InfoField label="Salario base" value={formatCurrency(contractDetails.monthlySalary)} />
                      <InfoField label="Moneda" value={contractDetails.currency} />
                      <InfoField label="Período base" value={contractDetails.basePeriod} />
                      <InfoField label="Días de vacaciones" value={contractDetails.fifteenDays} />
                      <InfoField label="Acumulación de vacaciones" value={contractDetails.vacationAccumulation} />
                      <InfoField label="3 meses" value={contractDetails.threeMonths} />
                      <InfoField label="15 días" value={contractDetails.fifteenDays} />
                      <InfoField label="Fecha de liquidación" value={formatDate(contractDetails.liquidationDate)} />
                      <InfoField label="Horas extra máximas" value={contractDetails.hoursPerWeek} />
                      <InfoField label="8 horas/semana" value={contractDetails.hoursPerWeek} />
                      <InfoField label="Semanal" value={contractDetails.weekly} />
                    </div>
                  </div>

                  {/* Associated Deductions */}
                  <div className="card-theme">
                    <h3 className="text-theme-lg font-theme-semibold text-primary mb-4">
                      Deducciones Asociadas
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Nombre</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Tipo</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Valor</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Aplicación</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Vigencia</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Descripción</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Cantidad</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contractDetails.deductions?.map((deduction, index) => (
                            <tr key={index} className="border-b border-gray-100">
                              <td className="py-2 px-3 text-gray-600">{deduction.name}</td>
                              <td className="py-2 px-3 text-gray-600">{deduction.type}</td>
                              <td className="py-2 px-3 text-gray-900">{deduction.value}</td>
                              <td className="py-2 px-3 text-gray-600">{deduction.application}</td>
                              <td className="py-2 px-3 text-gray-600">{deduction.validity}</td>
                              <td className="py-2 px-3 text-gray-600">{deduction.description}</td>
                              <td className="py-2 px-3 text-gray-600">{deduction.quantity}</td>
                            </tr>
                          )) || (
                            <tr>
                              <td colSpan="7" className="py-4 text-center text-gray-500">
                                No hay deducciones asociadas
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Associated Increments */}
                  <div className="card-theme">
                    <h3 className="text-theme-lg font-theme-semibold text-primary mb-4">
                      Incrementos Asociados
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Nombre</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Tipo</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Valor</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Aplicación</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Vigencia</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Descripción</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Cantidad</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contractDetails.increments?.map((increment, index) => (
                            <tr key={index} className="border-b border-gray-100">
                              <td className="py-2 px-3 text-gray-600">{increment.name}</td>
                              <td className="py-2 px-3 text-gray-600">{increment.type}</td>
                              <td className="py-2 px-3 text-gray-900">{increment.value}</td>
                              <td className="py-2 px-3 text-gray-600">{increment.application}</td>
                              <td className="py-2 px-3 text-gray-600">{increment.validity}</td>
                              <td className="py-2 px-3 text-gray-600">{increment.description}</td>
                              <td className="py-2 px-3 text-gray-600">{increment.quantity}</td>
                            </tr>
                          )) || (
                            <tr>
                              <td colSpan="7" className="py-4 text-center text-gray-500">
                                No hay incrementos asociados
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
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
