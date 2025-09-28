"use client";
import React, { useState } from "react";

const mockData = {
  serialNumber: "EXC-2024-0012",
  machineName: "Excavadora Caterpillar 320D",
  requestDate: "14 Mar 2025, 9:23 pm",
  maintenanceDetails:
    "The excavator makes strange engine noises during start-up and operation.",
  scheduleDate: "2025-03-21",
  scheduleHour: "08",
  scheduleMinute: "00",
  schedulePeriod: "AM",
  assignedTechnician: "Jaime Peña",
  maintenanceType: "Preventive",
};

const technicians = ["Jaime Peña", "Ana Torres", "Luis Gómez"];
const maintenanceTypes = ["Preventivo", "Correctivo", "Predictivo"];

export default function UpdateMaintenanceModal({ onClose }) {
  const [scheduleDate, setScheduleDate] = useState(mockData.scheduleDate);
  const [hour, setHour] = useState(mockData.scheduleHour);
  const [minute, setMinute] = useState(mockData.scheduleMinute);
  const [period, setPeriod] = useState(mockData.schedulePeriod);
  const [assignedTechnician, setAssignedTechnician] = useState(
    mockData.assignedTechnician
  );
  const [maintenanceDetails, setMaintenanceDetails] = useState(
    mockData.maintenanceDetails
  );
  const [maintenanceType, setMaintenanceType] = useState(
    mockData.maintenanceType
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    // Validaciones básicas
    if (
      !scheduleDate ||
      !hour ||
      !minute ||
      !period ||
      !assignedTechnician ||
      !maintenanceDetails ||
      !maintenanceType
    ) {
      setError("Todos los campos marcados con * son obligatorios.");
      return;
    }
    if (maintenanceDetails.length > 350) {
      setError("Los detalles no pueden superar los 350 caracteres.");
      return;
    }
    setShowSuccess(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-auto">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 relative">
        <button
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4">Actualizar mantenimiento</h2>

        {/* Información de la solicitud */}
        <div className="border border-gray-300 rounded-lg mb-4">
          <h3 className="font-semibold px-6 pt-5 pb-3">
            Información de la solicitud
          </h3>
          <div className="divide-y divide-gray-200">
            <div className="grid grid-cols-2 divide-x divide-gray-200 text-sm">
              <div className="px-6 py-3">
                <p className="text-gray-500">Número de serie</p>
                <p className="mt-1 font-medium">{mockData.serialNumber}</p>
              </div>
              <div className="px-6 py-3">
                <p className="text-gray-500">Nombre de la máquina</p>
                <p className="mt-1 font-medium">{mockData.machineName}</p>
              </div>
            </div>
            <div className="px-6 py-3 text-sm">
              <p className="text-gray-500">Fecha de la solicitud</p>
              <p className="mt-1 font-medium">{mockData.requestDate}</p>
            </div>
          </div>
        </div>

        {/* Información del mantenimiento */}
        <div className="border border-gray-300 rounded-lg mb-4">
          <h3 className="font-semibold px-6 pt-5 pb-3">
            Información del mantenimiento
          </h3>
          <div className="px-6 pb-4">
            <div className="grid grid-cols-3 gap-3 mb-3">
              {/* Fecha programada */}
              <div className="flex flex-col">
                <label
                  htmlFor="scheduleDate"
                  className="text-sm text-gray-600 mb-1"
                >
                  Fecha programada*
                </label>
                <input
                  id="scheduleDate"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black/60"
                />
              </div>

              {/* Hora programada */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">
                  Hora programada*
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={hour}
                    onChange={(e) =>
                      setHour(e.target.value.padStart(2, "0"))
                    }
                    className="w-14 border border-gray-300 rounded-md text-center py-2 focus:outline-none focus:ring-2 focus:ring-black/60"
                  />
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minute}
                    onChange={(e) =>
                      setMinute(e.target.value.padStart(2, "0"))
                    }
                    className="w-14 border border-gray-300 rounded-md text-center py-2 focus:outline-none focus:ring-2 focus:ring-black/60"
                  />
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/60"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              {/* Técnico asignado */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">
                  Técnico asignado*
                </label>
                <div className="relative">
                  <select
                    value={assignedTechnician}
                    onChange={(e) =>
                      setAssignedTechnician(e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-black/60"
                  >
                    {technicians.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Detalles del mantenimiento y tipo en una sola fila */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Detalles del mantenimiento*
                </label>
                <textarea
                  value={maintenanceDetails}
                  onChange={(e) =>
                    setMaintenanceDetails(e.target.value)
                  }
                  maxLength={350}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-black/60"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {maintenanceDetails.length}/350 caracteres
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Tipo de mantenimiento*
                </label>
                <div className="relative">
                  <select
                    value={maintenanceType}
                    onChange={(e) =>
                      setMaintenanceType(e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-black/60"
                  >
                    {maintenanceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-600 mb-4 text-sm">{error}</p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-3 bg-black text-white rounded-lg font-semibold text-lg hover:bg-gray-800"
        >
          Actualizar
        </button>

        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full text-center">
              <h4 className="text-lg font-semibold mb-2">
                ¡Actualización exitosa!
              </h4>
              <p className="mb-4">
                La programación de mantenimiento se actualizó correctamente.
              </p>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  onClose();
                }}
                className="mt-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
