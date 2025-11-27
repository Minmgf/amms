"use client";

import React, { useMemo, useState } from "react";
import { FiX } from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";

const MassiveAdjustmentsProcessingModal = ({
  isOpen,
  onClose,
  fileName,
  description,
  rows = [],
  onAcceptAndContinue,
  onUploadNewFile,
}) => {
  useTheme();

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const hasAnyRejected = useMemo(
    () => rows.some((row) => row.status === "rejected"),
    [rows]
  );

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch =
        !search.trim() ||
        row.document?.toLowerCase().includes(search.toLowerCase()) ||
        row.employeeName?.toLowerCase().includes(search.toLowerCase());

      const matchesState =
        stateFilter === "ALL" ||
        (stateFilter === "ACCEPTED" && row.status === "accepted") ||
        (stateFilter === "REJECTED" && row.status === "rejected");

      const matchesType =
        typeFilter === "ALL" ||
        (typeFilter === "INCREMENT" && row.adjustmentType === "increment") ||
        (typeFilter === "DEDUCTION" && row.adjustmentType === "deduction");

      return matchesSearch && matchesState && matchesType;
    });
  }, [rows, search, stateFilter, typeFilter]);

  if (!isOpen) return null;

  const handleAccept = () => {
    if (onAcceptAndContinue) {
      const acceptedRows = rows.filter((row) => row.status === "accepted");
      onAcceptAndContinue({
        fileName,
        description,
        acceptedRows,
        allRows: rows,
      });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-6"
      style={{ zIndex: 70 }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        className="card-theme rounded-xl shadow-2xl w-full max-w-[1600px] max-h-[98vh] overflow-hidden flex flex-col"
        style={{ zIndex: 71 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-primary">
              Resultados del procesamiento
            </h2>
            {fileName && (
              <p className="text-xs text-secondary mt-1">Archivo: {fileName}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-hover rounded-full transition-colors cursor-pointer"
            aria-label="Cerrar modal de resultados"
          >
            <FiX className="w-5 h-5 text-secondary" />
          </button>
        </div>

        {/* Filtros y búsqueda */}
        <div className="p-4 border-b border-primary flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <div className="w-full sm:w-64 md:w-72 lg:w-80">
              <input
                type="text"
                placeholder="Buscar por documento o nombre..."
                className="input-theme text-[11px] h-7 w-full px-3"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="input-theme text-[10px] h-7 min-w-[120px] px-2"
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
              >
                <option value="ALL">Todos los estados</option>
                <option value="ACCEPTED">Aceptados</option>
                <option value="REJECTED">Rechazados</option>
              </select>
              <select
                className="input-theme text-[10px] h-7 min-w-[140px] px-2"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="ALL">Todos los ajustes</option>
                <option value="INCREMENT">Incremento</option>
                <option value="DEDUCTION">Deducción</option>
              </select>
            </div>
          </div>
          {description && (
            <p className="text-[11px] text-secondary max-w-xs">
              Descripción: <span className="font-medium">{description}</span>
            </p>
          )}
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-[1000px]">
            <table className="w-full text-xs">
              <thead className="bg-surface border-b border-primary text-[11px] text-secondary">
                <tr>
                  <th className="px-3 py-2 text-left">Documento</th>
                  <th className="px-3 py-2 text-left">Empleado</th>
                  <th className="px-3 py-2 text-left">Nombre del ajuste</th>
                  <th className="px-3 py-2 text-left">Tipo de ajuste</th>
                  <th className="px-3 py-2 text-left">Tipo de monto</th>
                  <th className="px-3 py-2 text-right">Valor</th>
                  <th className="px-3 py-2 text-left">Aplicación</th>
                  <th className="px-3 py-2 text-right">Cantidad</th>
                  <th className="px-3 py-2 text-left">Fecha inicio</th>
                  <th className="px-3 py-2 text-left">Fecha fin</th>
                  <th className="px-3 py-2 text-left">Descripción</th>
                  <th className="px-3 py-2 text-left">Estado</th>
                  <th className="px-3 py-2 text-left">Motivo de rechazo</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={13}
                      className="px-3 py-4 text-center text-xs text-secondary"
                    >
                      No se encontraron registros con los filtros seleccionados.
                    </td>
                  </tr>
                )}
                {filteredRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-primary/40 last:border-b-0"
                  >
                    <td className="px-3 py-2">{row.document}</td>
                    <td className="px-3 py-2">{row.employeeName}</td>
                    <td className="px-3 py-2">{row.adjustmentName}</td>
                    <td className="px-3 py-2 capitalize">
                      {row.adjustmentType === "increment" ? "Incremento" : "Deducción"}
                    </td>
                    <td className="px-3 py-2 capitalize">
                      {row.amountType === "percentage" ? "Porcentaje" : "Fijo"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {row.amountType === "percentage" ? `${row.amount}%` : `$${row.amount.toLocaleString()}`}
                    </td>
                    <td className="px-3 py-2">{row.application}</td>
                    <td className="px-3 py-2 text-right">{row.quantity}</td>
                    <td className="px-3 py-2">{row.startDate}</td>
                    <td className="px-3 py-2">{row.endDate}</td>
                    <td className="px-3 py-2 text-left">{row.description}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          row.status === "accepted"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {row.status === "accepted" ? "Aceptado" : "Rechazado"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-secondary">
                      {row.rejectionReason || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-primary flex flex-col sm:flex-row gap-3 justify-between">
          <button
            type="button"
            onClick={onUploadNewFile}
            className="btn-theme btn-secondary flex-1 sm:flex-none sm:min-w-[170px]"
          >
            Cargar nuevo archivo
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="btn-theme btn-primary flex-1 sm:flex-none sm:min-w-[190px] disabled:opacity-50"
            disabled={rows.length === 0}
          >
            Aceptar y continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MassiveAdjustmentsProcessingModal;
