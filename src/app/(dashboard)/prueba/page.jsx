"use client";
import React, { useState } from "react";
import UpdateMaintenanceSchedule from "@/app/components/scheduledMaintenance/UpdateMaintenanceSchedule";
import ScheduleMaintenanceModal from "@/app/components/scheduledMaintenance/CreateScheduleMaintenance";
import CancelScheduledMaintenance from "@/app/components/scheduledMaintenance/CancelScheduledMaintenance";
import MaintenanceReportModal from "@/app/components/maintenance/machineMaintenance/MaintenanceReportModal";

const PruebaPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="Abrir modal de actualización de mantenimiento"
        onClick={handleOpenModal}
      >
        Visualizar Modal de Mantenimiento
      </button>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="Abrir modal de crear de mantenimiento"
        onClick={() => setIsCreateModalOpen(true)}
      >
        crear matenimiento programado
      </button>
      <button
        className="mt-5 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="Abrir modal de cancelar de mantenimiento"
        onClick={()=>setIsCancelModalOpen(true)}
      >
        Cancelar Mantenimiento Programado
      </button>
      <button
        className="mt-5 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="Abrir modal de reporte de mantenimiento"
        onClick={()=>setIsReportModalOpen(true)}
      >
        Reporte de Mantenimiento
      </button>
      {isReportModalOpen && (
        <MaintenanceReportModal 
          isOpen={isReportModalOpen} 
          onClose={() => setIsReportModalOpen(false)} 
        />
      )}
      {isModalOpen && (
        <UpdateMaintenanceSchedule onClose={handleCloseModal} />
      )}
      <ScheduleMaintenanceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      {isCancelModalOpen && (
        <CancelScheduledMaintenance 
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)} />
      )}
    </div>
  );
};

export default PruebaPage;
