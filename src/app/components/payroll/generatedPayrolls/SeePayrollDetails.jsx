"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FiX } from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";
import { getPayrollDetail } from "@/services/payrollService";

const formatCurrency = (value) => {
  if (value == null || isNaN(value)) return "—";
  return value.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

function DetailRow({ label, value, isTotal = false }) {
  return (
    <div className="flex items-start justify-between py-1">
      <span
        className={`block text-theme-sm ${
          isTotal
            ? "font-theme-semibold text-primary"
            : "font-theme-medium text-secondary"
        }`}
      >
        {label}
      </span>
      <span
        className={`text-primary parametrization-text text-right ml-4 ${
          isTotal ? "font-theme-semibold" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function InfoBlock({ label, value }) {
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

function SectionCard({ title, children }) {
  return (
    <section className="card-theme rounded-theme-lg border border-primary overflow-hidden">
      <header className="px-4 md:px-6 py-3 md:py-4 border-b border-primary bg-surface flex items-center justify-between">
        <h3 className="text-theme-lg font-theme-semibold text-primary mb-4">
          {title}
        </h3>
      </header>
      <div className="px-4 md:px-6 py-4 md:py-5">{children}</div>
    </section>
  );
}

export default function SeePayrollDetails({ isOpen, onClose, payroll }) {
  useTheme();

  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (!isOpen || !payroll) {
      setDetail(null);
      return;
    }

    const payrollId = payroll.id_payroll ?? payroll.id;
    if (!payrollId) return;

    let cancelled = false;

    const fetchDetail = async () => {
      try {
        const result = await getPayrollDetail(payrollId);
        const payload =
          result && result.data && !Array.isArray(result.data)
            ? result.data
            : result?.data?.[0] || result;

        if (!payload) {
          console.error("No se encontró detalle de la nómina:", result);
          return;
        }

        const mapped = {
          ...payroll,
          employeeDocument: payload.document_number ?? payroll.employeeDocument,
          employeeName: payload.employee_full_name ?? payroll.employeeName,
          position: payroll.position,
          generationDate: payload.creation_date ?? payroll.generationDate,
          contractCode:
            payload.id_employee_contract ?? payroll.contractCode ?? payroll.id,
          payrollPeriod:
            payload.start_date && payload.end_date
              ? `${payload.start_date} - ${payload.end_date}`
              : payroll.payrollPeriod,
          generatedBy:
            payload.responsible_user_full_name ?? payroll.generatedBy,
          baseSalary: payload.base_salary,
          timeWorked: payload.time_worked,
          baseSalaryTotal: payload.base_salary,
          accruedFixed: [],
          accruedAdditional:
            payload.payroll_increases?.map((item) => ({
              name:
                item.description ||
                `Incremento #${item.id_payroll_increase}`,
              amount:
                item.calculated_amount ??
                item.amount ??
                item.amount_value ??
                0,
            })) || [],
          totalAccrued: payload.total_increments,
          deductionsFixed: [],
          deductionsAdditional:
            payload.payroll_deductions?.map((item) => ({
              name:
                item.description ||
                `Deducción #${item.id_payroll_deduction}`,
              amount:
                item.calculated_amount ??
                item.amount ??
                item.amount_value ??
                0,
            })) || [],
          totalDeductions: payload.total_deductions,
          netAmount: payload.net_pay,
        };

        if (!cancelled) {
          setDetail(mapped);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error loading payroll detail:", err);
        }
      }
    };

    fetchDetail();

    return () => {
      cancelled = true;
    };
  }, [isOpen, payroll]);

  const currentPayroll = detail || payroll;

  const accruedFixed = currentPayroll?.accruedFixed || [];
  const accruedAdditional = currentPayroll?.accruedAdditional || [];
  const deductionsFixed = currentPayroll?.deductionsFixed || [];
  const deductionsAdditional = currentPayroll?.deductionsAdditional || [];

  const totals = useMemo(() => {
    if (!currentPayroll) {
      return {
        baseTotal: 0,
        totalAccruedFixed: 0,
        totalAccruedAdditional: 0,
        totalAccrued: 0,
        totalDeductionsFixed: 0,
        totalDeductionsAdditional: 0,
        totalDeductions: 0,
        netAmount: 0,
      };
    }

    const sum = (items) =>
      (items || []).reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

    const baseTotal = Number(payroll.baseSalaryTotal) || 0;
    const totalAccruedFixed = sum(accruedFixed);
    const totalAccruedAdditional = sum(accruedAdditional);
    const totalAccrued =
      payroll.totalAccrued != null
        ? Number(payroll.totalAccrued)
        : totalAccruedFixed + totalAccruedAdditional;

    const totalDeductionsFixed = sum(deductionsFixed);
    const totalDeductionsAdditional = sum(deductionsAdditional);
    const totalDeductions =
      payroll.totalDeductions != null
        ? Number(payroll.totalDeductions)
        : totalDeductionsFixed + totalDeductionsAdditional;

    const netAmount =
      payroll.netAmount != null
        ? Number(payroll.netAmount)
        : baseTotal + totalAccrued - totalDeductions;

    return {
      baseTotal,
      totalAccruedFixed,
      totalAccruedAdditional,
      totalAccrued,
      totalDeductionsFixed,
      totalDeductionsAdditional,
      totalDeductions,
      netAmount,
    };
  }, [
    currentPayroll?.baseSalaryTotal,
    currentPayroll?.totalAccrued,
    currentPayroll?.totalDeductions,
    currentPayroll?.netAmount,
    accruedFixed,
    accruedAdditional,
    deductionsFixed,
    deductionsAdditional,
  ]);

  if (!isOpen || !payroll) return null;

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="card-theme rounded-theme-xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-primary bg-background">
          <h2 className="text-theme-2xl font-theme-bold text-primary">
            Información de nómina
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-hover rounded-theme-md transition-colors cursor-pointer"
            aria-label="Cerrar detalles de nómina"
          >
            <FiX className="w-5 h-5 text-secondary" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-6">
          <SectionCard title="Información del empleado">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <InfoBlock
                  label="Número de identificación"
                  value={currentPayroll.employeeDocument}
                />
                <InfoBlock
                  label="Cargo"
                  value={currentPayroll.position || "Ejemplo"}
                />
                <InfoBlock
                  label="Fecha de generación"
                  value={currentPayroll.generationDate}
                />
                <InfoBlock
                  label="Código de contrato seleccionado"
                  value={currentPayroll.contractCode || currentPayroll.id}
                />
              </div>

              <div className="space-y-4">
                <InfoBlock
                  label="Nombre completo"
                  value={currentPayroll.employeeName}
                />
                <InfoBlock
                  label="Período de nómina"
                  value={currentPayroll.payrollPeriod}
                />
                <InfoBlock
                  label="Autor"
                  value={currentPayroll.generatedBy}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Salario base">
            <div className="space-y-1.5">
              <DetailRow
                label="Salario base"
                value={formatCurrency(Number(currentPayroll.baseSalary) || 0)}
              />
              <DetailRow
                label="Tiempo trabajado"
                value={currentPayroll.timeWorked || "2 meses"}
              />
              <div className="mt-3 pt-3 border-t border-dashed border-primary">
                <DetailRow
                  label="Total salario base"
                  value={formatCurrency(totals.baseTotal)}
                  isTotal
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Devengados (Incrementos / Bonificaciones)">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-theme-medium text-secondary mb-2">
                  Fijos del contrato
                </p>
                <div className="space-y-1.5">
                  {accruedFixed.length === 0 && (
                    <p className="text-xs text-secondary">Sin devengados fijos.</p>
                  )}
                  {accruedFixed.map((item, index) => (
                    <DetailRow
                      key={`af-${index}`}
                      label={item.name}
                      value={formatCurrency(Number(item.amount) || 0)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-theme-medium text-secondary mb-2">
                  Adicionales (ajustes adicionales aplicados)
                </p>
                <div className="space-y-1.5">
                  {accruedAdditional.length === 0 && (
                    <p className="text-xs text-secondary">Sin devengados adicionales.</p>
                  )}
                  {accruedAdditional.map((item, index) => (
                    <DetailRow
                      key={`aa-${index}`}
                      label={item.name}
                      value={formatCurrency(Number(item.amount) || 0)}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-2 pt-3 border-t border-dashed border-primary">
                <DetailRow
                  label="Total devengado"
                  value={formatCurrency(totals.totalAccrued)}
                  isTotal
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Deducciones">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-theme-medium text-secondary mb-2">
                  Fijas del contrato
                </p>
                <div className="space-y-1.5">
                  {deductionsFixed.length === 0 && (
                    <p className="text-xs text-secondary">Sin deducciones fijas.</p>
                  )}
                  {deductionsFixed.map((item, index) => (
                    <DetailRow
                      key={`df-${index}`}
                      label={item.name}
                      value={formatCurrency(Number(item.amount) || 0)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-theme-medium text-secondary mb-2">
                  Adicionales (ajustes adicionales aplicados)
                </p>
                <div className="space-y-1.5">
                  {deductionsAdditional.length === 0 && (
                    <p className="text-xs text-secondary">Sin deducciones adicionales.</p>
                  )}
                  {deductionsAdditional.map((item, index) => (
                    <DetailRow
                      key={`da-${index}`}
                      label={item.name}
                      value={formatCurrency(Number(item.amount) || 0)}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-2 pt-3 border-t border-dashed border-primary">
                <DetailRow
                  label="Total deducciones"
                  value={formatCurrency(totals.totalDeductions)}
                  isTotal
                />
              </div>
            </div>
          </SectionCard>

          <section className="rounded-theme-lg bg-black text-white px-4 md:px-6 py-4 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-xs md:text-sm text-gray-300 mb-1">Neto a pagar</p>
              <p className="text-2xl md:text-3xl font-theme-bold">
                {formatCurrency(totals.netAmount)}
              </p>
            </div>
            <div className="text-xs md:text-sm text-gray-300 max-w-md md:text-right">
              Cálculo: (Salario base × tiempo trabajado) + Total devengado 
              − Total deducciones
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

