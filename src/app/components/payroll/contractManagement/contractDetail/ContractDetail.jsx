"use client";

import React, { useEffect, useState } from "react";
import { getContractDetail } from "@/services/contractService";

/**
 * Multistep modal (structure-only) for HU-CON-005 — Contract Detail Viewer
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - contractData: object (not read/populated in this structural version)
 * - onBackToList: () => void
 * - onExport: (format) => void
 * - canViewContract: boolean

 * IMPORTANT: This file provides only the structural UI and placeholders. Do NOT
 * populate fields with real data here — that will be implemented later.
 */

export default function ContractDetail({
  isOpen = false,
  onClose = () => {},
  contractData = null,
  onBackToList = () => {},
  onExport = () => {},
  canViewContract = true,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDetail = async () => {
      if (!isOpen || !contractData?.contract_code) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getContractDetail(contractData.contract_code);
        setDetail(data);
      } catch (err) {
        if (err?.response?.status === 404) {
          setError("No se encontró información de contrato para este código.");
        } else {
          setError("Error al cargar la información del contrato.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [isOpen, contractData?.contract_code]);

  const formatDate = (value) => {
    if (!value) return "";
    try {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return value;
    }
  };

  const formatCurrency = (value) => {
    if (value == null) return "";
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(Number(value));
  };

  const tabs = [
    { id: 0, key: "general", label: "Información\nGeneral" },
    { id: 1, key: "terms", label: "Términos del\ncontrato" },
    { id: 2, key: "deductions", label: "Deducciones\nasociadas" },
    { id: 3, key: "increments", label: "Incrementos\nconfigurados" },
    { id: 4, key: "history", label: "Historial del\ncontrato" },

  ];



  // Don't render if modal is closed — all hooks above always run
  if (!isOpen) return null;

  const onExportClick = (format = "pdf") => {
    if (onExport) onExport(format);
  };

  const renderTabs = () => (
    <div className="border-b border-primary">
      <nav className="flex justify-center gap-[45px] overflow-auto px-4">
        {tabs.map((t, idx) => {
          const active = idx === activeTab;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(idx)}
              className={`py-3 px-3 text-sm font-theme-medium whitespace-pre-line text-center rounded-t-md focus:outline-none transition-colors ${
                active ? 'border-b-[3px] border-accent text-accent' : 'border-b-[3px] border-transparent'
              }`}
              aria-current={active ? "page" : undefined}
            >
              {t.label}
            </button>
          );
        })}
      </nav>
    </div>
  );

  // Each tab returns skeleton placeholders only
  const GeneralTab = () => (
    <section className="p-theme-lg">
      <div className="card-theme">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-theme-lg font-theme-semibold text-primary">Información General</h3>
          {detail && (
            <span
              className={`text-theme-xs px-3 py-1 rounded-full font-theme-medium ${
                detail.established_contract_status === 1
                  ? "bg-green-100 text-green-800"
                  : "bg-pink-100 text-pink-800"
              }`}
            >
              {detail.established_contract_status_name}
            </span>
          )}
        </div>
        
        {/* Two column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="text-theme-sm font-theme-semibold text-primary mb-1 block">ID del Contrato</label>
              <p className="text-theme-sm text-secondary">{detail?.contract_code || ""}</p>
            </div>
            
            <div>
              <label className="text-theme-sm font-theme-semibold text-primary mb-1 block">Descripción</label>
              <p className="text-theme-sm text-secondary">{detail?.description || ""}</p>
            </div>
            
            <div>
              <label className="text-theme-sm font-theme-semibold text-primary mb-1 block">Fecha de inicio</label>
              <p className="text-theme-sm text-secondary">{formatDate(detail?.start_date)}</p>
            </div>
            
            <div>
              <label className="text-theme-sm font-theme-semibold text-primary mb-1 block">Frecuencia de pago</label>
              <p className="text-theme-sm text-secondary">{detail?.payment_frequency_type || ""}</p>
            </div>
            
            <div>
              <label className="text-theme-sm font-theme-semibold text-primary mb-1 block">Segundo día de pago</label>
              <p className="text-theme-sm text-secondary">{detail?.contract_payments?.[1]?.date_payment ?? ""}</p>
            </div>
            
            <div>
              <label className="text-theme-sm font-theme-semibold text-primary mb-1 block">Jornada laboral</label>
              <p className="text-theme-sm text-secondary">{detail?.workday_type_name || ""}</p>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className="text-theme-sm font-theme-semibold text-primary mb-1 block">Cargo</label>
              <p className="text-theme-sm text-secondary">{detail?.employee_charge_name || ""}</p>
            </div>
            
            <div>
              <label className="text-theme-sm font-theme-semibold text-primary mb-1 block">Tipo de contrato</label>
              <p className="text-theme-sm text-secondary">{detail?.contract_type_name || ""}</p>
            </div>
            
            <div>
              <label className="text-theme-sm font-theme-semibold text-primary mb-1 block">Fecha de finalización</label>
              <p className="text-theme-sm text-secondary">{formatDate(detail?.end_date)}</p>
            </div>
            
            <div>
              <label className="text-theme-sm font-theme-semibold text-primary mb-1 block">Primer día de pago</label>
              <p className="text-theme-sm text-secondary">{detail?.contract_payments?.[0]?.date_payment ?? ""}</p>
            </div>
            
            <div>
              <label className="text-theme-sm font-theme-semibold text-primary mb-1 block">Horas mínimas</label>
              <p className="text-theme-sm text-secondary">{detail?.minimum_hours ?? ""}</p>
            </div>
            
            <div>
              <label className="text-theme-sm font-theme-semibold text-primary mb-1 block">Modalidad de trabajo</label>
              <p className="text-theme-sm text-secondary">{detail?.work_mode_type_name || ""}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const TermsTab = () => (
    <section className="p-theme-lg">
      <div className="card-theme">
        <h3 className="text-theme-lg font-theme-semibold text-primary mb-6">Términos del Contrato</h3>
        
        {/* Two column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="text-theme-sm font-theme-semibold text-primary mb-1 block">Salario</label>
              <p className="text-theme-sm text-secondary">{formatCurrency(detail?.salary_base)}</p>
            </div>
            
            <div>
              <label className="text-theme-sm font-theme-semibold text-primary mb-1 block">Moneda</label>
              <p className="text-theme-sm text-secondary">{detail?.currency_type_name || ""}</p>
            </div>
            
            <div>
              <label className="text-theme-sm font-theme-semibold text-primary mb-1 block">Días de vacaciones</label>
              <p className="text-theme-sm text-secondary">{detail?.vacation_days ?? ""}</p>
            </div>
            
            <div>
              <label className="text-theme-sm font-theme-semibold text-primary mb-1 block">Vigente desde</label>
              <p className="text-theme-sm text-secondary">{formatDate(detail?.start_cumulative_vacation)}</p>
            </div>
            
            <div>
              <label className="text-theme-sm font-theme-semibold text-primary mb-1 block">Días máximos de incapacidad</label>
              <p className="text-theme-sm text-secondary">{detail?.maximum_disability_days ?? ""}</p>
            </div>
            
            <div>
              <label className="text-theme-sm font-theme-semibold text-primary mb-1 block">Período de horas extras</label>
              <p className="text-theme-sm text-secondary">{detail?.overtime_period || ""}</p>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className="text-theme-sm font-theme-semibold text-primary mb-1 block">Horas contratadas</label>
              <p className="text-theme-sm text-secondary">{detail?.minimum_hours ?? ""}</p>
            </div>
            
            <div>
              <label className="text-theme-sm font-theme-semibold text-primary mb-1 block">Período de prueba (días)</label>
              <p className="text-theme-sm text-secondary">{detail?.trial_period_days ?? ""}</p>
            </div>
            
            <div>
              <label className="text-theme-sm font-theme-semibold text-primary mb-1 block">Vacaciones acumulativas</label>
              <p className="text-theme-sm text-secondary">{detail?.cumulative_vacation ? "Sí" : "No"}</p>
            </div>
            
            <div>
              <label className="text-theme-sm font-theme-semibold text-primary mb-1 block">Frecuencia de otorgamiento de vacaciones (días)</label>
              <p className="text-theme-sm text-secondary">{detail?.vacation_frequency_days ?? ""}</p>
            </div>
            
            <div>
              <label className="text-theme-sm font-theme-semibold text-primary mb-1 block">Horas extras máximas</label>
              <p className="text-theme-sm text-secondary">{detail?.overtime ?? ""}</p>
            </div>
            
            <div>
              <label className="text-theme-sm font-theme-semibold text-primary mb-1 block">Período de notificación de terminación (días)</label>
              <p className="text-theme-sm text-secondary">{detail?.notice_period_days ?? ""}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const DeductionsTab = () => (
    <section className="p-theme-lg">
      <div className="card-theme">
        <h3 className="text-theme-lg font-theme-semibold text-primary mb-6">Deducciones Asociadas</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-primary">
                <th className="text-left text-theme-sm font-theme-semibold text-primary py-3 px-4">Nombre</th>
                <th className="text-left text-theme-sm font-theme-semibold text-primary py-3 px-4">Tipo monto</th>
                <th className="text-left text-theme-sm font-theme-semibold text-primary py-3 px-4">Valor</th>
                <th className="text-left text-theme-sm font-theme-semibold text-primary py-3 px-4">Aplicación</th>
                <th className="text-left text-theme-sm font-theme-semibold text-primary py-3 px-4">Vigencia</th>
                <th className="text-left text-theme-sm font-theme-semibold text-primary py-3 px-4">Descripción</th>
                <th className="text-left text-theme-sm font-theme-semibold text-primary py-3 px-4">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {detail?.established_deductions?.length ? (
                detail.established_deductions.map((ded, index) => (
                  <tr key={index} className="border-b border-primary hover:bg-surface transition-colors">
                    <td className="text-theme-sm text-secondary py-3 px-4">{ded.deduction_type_name}</td>
                    <td className="text-theme-sm text-secondary py-3 px-4">{ded.amount_type}</td>
                    <td className="text-theme-sm text-secondary py-3 px-4">{ded.amount_value}</td>
                    <td className="text-theme-sm text-secondary py-3 px-4">{ded.application_deduction_type}</td>
                    <td className="text-theme-sm text-secondary py-3 px-4">
                      {`${formatDate(ded.start_date_deduction)} - ${formatDate(ded.end_date_deductions)}`}
                    </td>
                    <td className="text-theme-sm text-secondary py-3 px-4">{ded.description}</td>
                    <td className="text-theme-sm text-secondary py-3 px-4">{ded.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center text-theme-sm text-secondary py-4">
                    No hay deducciones configuradas para este contrato.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );

  const IncrementsTab = () => (
    <section className="p-theme-lg">
      <div className="card-theme">
        <h3 className="text-theme-lg font-theme-semibold text-primary mb-6">Incrementos Asociados</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-primary">
                <th className="text-left text-theme-sm font-theme-semibold text-primary py-3 px-4">Nombre</th>
                <th className="text-left text-theme-sm font-theme-semibold text-primary py-3 px-4">Tipo monto</th>
                <th className="text-left text-theme-sm font-theme-semibold text-primary py-3 px-4">Valor</th>
                <th className="text-left text-theme-sm font-theme-semibold text-primary py-3 px-4">Aplicación</th>
                <th className="text-left text-theme-sm font-theme-semibold text-primary py-3 px-4">Vigencia</th>
                <th className="text-left text-theme-sm font-theme-semibold text-primary py-3 px-4">Descripción</th>
                <th className="text-left text-theme-sm font-theme-semibold text-primary py-3 px-4">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {detail?.established_increases?.length ? (
                detail.established_increases.map((inc, index) => (
                  <tr key={index} className="border-b border-primary hover:bg-surface transition-colors">
                    <td className="text-theme-sm text-secondary py-3 px-4">{inc.increase_type_name}</td>
                    <td className="text-theme-sm text-secondary py-3 px-4">{inc.amount_type}</td>
                    <td className="text-theme-sm text-secondary py-3 px-4">{inc.amount_value}</td>
                    <td className="text-theme-sm text-secondary py-3 px-4">{inc.application_increase_type}</td>
                    <td className="text-theme-sm text-secondary py-3 px-4">
                      {`${formatDate(inc.start_date_increase)} - ${formatDate(inc.end_date_increase)}`}
                    </td>
                    <td className="text-theme-sm text-secondary py-3 px-4">{inc.description}</td>
                    <td className="text-theme-sm text-secondary py-3 px-4">{inc.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center text-theme-sm text-secondary py-4">
                    No hay incrementos configurados para este contrato.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );

  const HistoryTab = () => (
    <section className="p-theme-lg">
      <div className="card-theme">
        <h3 className="text-theme-lg font-theme-semibold text-primary mb-6">Historial del Contrato</h3>
        
        <div className="space-y-1">
          {/* Timeline events */}
          <div className="flex items-start py-3 border-l-4 border-red-500 pl-4">
            <div className="flex-1">
              <div className="text-theme-sm font-theme-semibold text-primary">Desactivación</div>
            </div>
            <div className="flex-1">
              <div className="text-theme-sm text-secondary">
                <span className="font-theme-semibold text-primary">Usuario Responsable: </span>
              </div>
            </div>
            <div className="text-theme-sm text-secondary text-right"></div>
          </div>
          
          <div className="flex items-start py-3 border-l-4 border-yellow-500 pl-4">
            <div className="flex-1">
              <div className="text-theme-sm font-theme-semibold text-primary">Modificación</div>
            </div>
            <div className="flex-1">
              <div className="text-theme-sm text-secondary">
                <span className="font-theme-semibold text-primary">Usuario Responsable: </span>
              </div>
            </div>
            <div className="text-theme-sm text-secondary text-right"></div>
          </div>
          
          <div className="flex items-start py-3 border-l-4 border-green-500 pl-4">
            <div className="flex-1">
              <div className="text-theme-sm font-theme-semibold text-primary">Creación</div>
            </div>
            <div className="flex-1">
              <div className="text-theme-sm text-secondary">
                <span className="font-theme-semibold text-primary">Usuario Responsable: </span>
              </div>
            </div>
            <div className="text-theme-sm text-secondary text-right"></div>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden
        onClick={() => onClose && onClose()}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="modal-theme relative w-[min(900px,96%)] max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <header className="flex items-center justify-between p-theme-lg bg-surface border-b border-primary">
          <div className="flex items-center space-x-3">
            <h2 className="text-theme-lg font-theme-semibold text-primary">Informacion del contrato</h2>
          </div>

          <div className="flex items-center space-x-3">
            <button
              className="p-2 rounded-theme-md hover:bg-hover transition-colors"
              onClick={() => onClose && onClose()}
              aria-label="Cerrar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
                <path d="M6 18L18 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
              </svg>
            </button>
          </div>
        </header>

        {/* Tabs */}
        {renderTabs()}

        {/* Body: scrollable */}
        <div className="overflow-auto" style={{ maxHeight: "calc(90vh - 220px)" }}>
          {!canViewContract ? (
            <div className="p-theme-lg">
              <div className="card-theme">
                <h3 className="text-theme-lg font-theme-semibold mb-2 text-primary">Acceso denegado</h3>
                <p className="text-theme-sm text-secondary mb-4">No tiene permisos para ver los detalles de este contrato.</p>
                <button
                  onClick={() => onBackToList && onBackToList()}
                  className="btn-theme btn-primary"
                >
                  Volver al listado
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="p-theme-lg">
              <div className="card-theme text-center">
                <p className="text-theme-sm text-secondary">Cargando información del contrato...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-theme-lg">
              <div className="card-theme text-center">
                <h3 className="text-theme-lg font-theme-semibold mb-2 text-primary">No fue posible cargar el contrato</h3>
                <p className="text-theme-sm text-secondary mb-4">{error}</p>
                <button
                  onClick={() => onBackToList && onBackToList()}
                  className="btn-theme btn-primary"
                >
                  Volver al listado
                </button>
              </div>
            </div>
          ) : (
            <div>
              {activeTab === 0 && <GeneralTab />}
              {activeTab === 1 && <TermsTab />}
              {activeTab === 2 && <DeductionsTab />}
              {activeTab === 3 && <IncrementsTab />}
              {activeTab === 4 && <HistoryTab />}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-end p-theme-lg border-t border-primary bg-surface">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onExportClick("pdf")}
              className="btn-theme btn-outline"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Export PDF
            </button>

            <button
              onClick={() => onExportClick("docx")}
              className="btn-theme btn-primary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Export Word
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
