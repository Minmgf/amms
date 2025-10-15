"use client";
import AddClientModal from "@/app/components/request/clients/AddClientModal";
import DetailsRequestModal from "@/app/components/request/services/DetailsRequestModal";
import { useState } from "react";

const Prueba = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isRequestDetailsOpen, setIsRequestDetailsOpen] = useState(false);

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

        <div className="bg-white rounded-lg shadow p-6">
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
    </div>
  );
};

export default Prueba;