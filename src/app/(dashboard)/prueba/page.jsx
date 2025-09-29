"use client";
import React, { useState } from "react";
import UpdateMaintenanceSchedule from "@/app/components/scheduledMaintenance/UpdateMaintenanceSchedule";

const PruebaPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      {isModalOpen && (
        <UpdateMaintenanceSchedule onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default PruebaPage;
