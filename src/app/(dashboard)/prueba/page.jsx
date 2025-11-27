"use client";
import AddClientModal from "@/app/components/request/clients/AddClientModal";
import DetailsRequestModal from "@/app/components/request/services/DetailsRequestModal";
import TrackingDashboardModal from "@/app/components/monitoring/TrackingDashboardModal";
import AddContractModal from "@/app/components/payroll/contractManagement/contracts/AddContractModal";
import RegisterEmployeeModal from "@/app/components/payroll/human-resources/employees/RegisterEmployeeModal";
import IndividualPayrollAdjustmentsModal from "@/app/components/payroll/payroll-runs/AdditionalSettingsModal";
import { useState } from "react";
import HistoricalDataModal from "@/app/components/monitoring/HistoricalDataModal";
import ReportsGenerationModal from "@/app/components/payroll/reports/ReportsGenerationModal";

const Prueba = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isRequestDetailsOpen, setIsRequestDetailsOpen] = useState(false);
  const [isTrackingDashboardOpen, setIsTrackingDashboardOpen] = useState(false);
  const [isHistoricalModalOpen, setIsHistoricalModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isAdjustmentsModalOpen, setIsAdjustmentsModalOpen] = useState(false);
  const [mockAdjustments, setMockAdjustments] = useState({
    deductions: [],
    increments: [],
  });
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);

  const mockPayrollStartDate = "2025-11-01";
  const mockPayrollEndDate = "2025-11-30";

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Modal de Registro de Cliente</h2>

          <p className="text-gray-600 mb-6">
            Haz clic en el botón para abrir el modal de registro de cliente.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Abrir Modal de Registro
            </button>
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Abrir Modal de Actualizar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Modal de Detalles de Solicitud</h2>

          <p className="text-gray-600 mb-6">
            Haz clic en el botón para ver el modal de detalles de solicitud (HU-SOL-004).
          </p>

          <button
            onClick={() => setIsRequestDetailsOpen(true)}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            Ver Detalles de Solicitud
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Modal de Monitoreo en Tiempo Real</h2>

          <p className="text-gray-600 mb-6">
            Haz clic en el botón para ver el modal de monitoreo (Tracking Dashboard) con visualización de maquinarias en tiempo real (HU-MS-003).
          </p>

          <button
            onClick={() => setIsTrackingDashboardOpen(true)}
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
          >
            Ver Dashboard de Monitoreo
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Modal de Datos Historicos</h2>
          <button
            onClick={() => setIsHistoricalModalOpen(true)}
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
          >
            Ver Datos Historicos
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Modal de Contratos</h2>

          <p className="text-gray-600 mb-6">
            Formulario multipasos para añadir contratos. Incluye información general, términos del contrato, deducciones e incrementos.
          </p>

          <button
            onClick={() => setIsContractModalOpen(true)}
            className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
          >
            Añadir Contrato
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Modal de Registro de Empleado</h2>

          <p className="text-gray-600 mb-6">
            Formulario completo para registrar un nuevo empleado (HU-EMP-001). Incluye datos personales, de contacto y laborales con validaciones completas.
          </p>

          <button
            onClick={() => setIsEmployeeModalOpen(true)}
            className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Registrar Empleado
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Modal de Ajustes Adicionales de Nómina</h2>

          <p className="text-gray-600 mb-6">
            Prueba el flujo de registro de deducciones e incrementos adicionales para una nómina individual usando datos de ejemplo.
          </p>

          <button
            onClick={() => setIsAdjustmentsModalOpen(true)}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Abrir ajustes adicionales de nómina
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Modal de Generación de Reportes</h2>
          <p className="text-gray-600 mb-6">
            Modal para generar reportes de nómina (Vista de prueba).
          </p>
          <button
            onClick={() => setIsReportsModalOpen(true)}
            className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Ver Modal de Reportes
          </button>
        </div>
      </div>

      {/* Modal de Registro */}
      <AddClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Modal de Detalles de Solicitud */}
      <DetailsRequestModal
        isOpen={isRequestDetailsOpen}
        onClose={() => setIsRequestDetailsOpen(false)}
      />

      {/* Modal de Tracking Dashboard */}
      <TrackingDashboardModal
        isOpen={isTrackingDashboardOpen}
        onClose={() => setIsTrackingDashboardOpen(false)}
        requestData={null}
      />

      {/* Historical Data Modal */}
      <HistoricalDataModal
        isOpen={isHistoricalModalOpen}
        onClose={() => setIsHistoricalModalOpen(false)}
      />

      {/* Contract Modal */}
      <AddContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        onSuccess={() => {
          console.log("Contrato guardado exitosamente");
          setIsContractModalOpen(false);
        }}
      />

      {/* Employee Modal */}
      <RegisterEmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSuccess={() => {
          console.log("Empleado registrado exitosamente");
          setIsEmployeeModalOpen(false);
        }}
      />

      <IndividualPayrollAdjustmentsModal
        isOpen={isAdjustmentsModalOpen}
        onClose={() => setIsAdjustmentsModalOpen(false)}
        onSave={(ajustes) => {
          console.log("Ajustes adicionales guardados (vista de prueba):", ajustes);
          setMockAdjustments(ajustes || { deductions: [], increments: [] });
        }}
        initialAdjustments={mockAdjustments}
        payrollStartDate={mockPayrollStartDate}
        payrollEndDate={mockPayrollEndDate}
        canManagePayroll={true}
      />

      <ReportsGenerationModal
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
      />
    </div>
  );
};

export default Prueba;