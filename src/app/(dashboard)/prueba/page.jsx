"use client";
import React, { useState } from "react";
import UpdateMaintenanceSchedule from "@/app/components/scheduledMaintenance/UpdateMaintenanceSchedule";
import CancelScheduledMaintenance from "@/app/components/scheduledMaintenance/CancelScheduledMaintenance";

const PruebaPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);


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
        className="mt-5 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="Abrir modal de actualización de mantenimiento"
        onClick={()=>setIsCancelModalOpen(true)}
      >
        Cancelar Mantenimiento Programado
      </button>
      {isModalOpen && (
        <UpdateMaintenanceSchedule onClose={handleCloseModal} />
      )}
      {isCancelModalOpen && (
        <CancelScheduledMaintenance 
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)} />
      )}
    </div>
  );
};

export default PruebaPage;
