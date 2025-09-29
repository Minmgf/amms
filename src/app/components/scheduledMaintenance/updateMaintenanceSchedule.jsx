"use client";
import React, { useState } from "react";
import { SuccessModal, ErrorModal } from "@/app/components/shared/SuccessErrorModal";

const mockData = {
  serialNumber: "EXC-2024-0012",
  machineName: "Excavadora Caterpillar 320D",
  requestDate: "14 Mar 2025, 9:23 pm",
  maintenanceDetails: "",
  scheduleDate: "",
  scheduleHour: "00",
  scheduleMinute: "00",
  schedulePeriod: "",
  assignedTechnician: "",
  maintenanceType: "",
};

const technicians = ["Cesar Ramirez", "Luigy Rodriguez", "Luis Gómez", "Jaime Peña"];
const maintenanceTypes = ["Preventivo", "Correctivo", "Predictivo"];

const UpdateMaintenanceSchedule = ({ onClose }) => {
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
  const [showError, setShowError] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setError("");
    setShowError(false);
    setIsSubmitting(true);
    
    try {
      // Validaciones de campos obligatorios
      if (!scheduleDate || scheduleDate === "" || scheduleDate === "2000-00-00") {
        throw new Error("Debe seleccionar una fecha programada.");
      }
      
      if (!hour || hour === "00" || hour === "") {
        throw new Error("Debe ingresar una hora válida.");
      }
      
      if (!minute || minute === "") {
        throw new Error("Debe ingresar los minutos.");
      }
      
      if (!period || period === "") {
        throw new Error("Debe seleccionar AM o PM.");
      }
      
      if (!assignedTechnician || assignedTechnician === "" || assignedTechnician === "Selecciona tu tecnico") {
        throw new Error("Debe seleccionar un técnico asignado.");
      }
      
      if (!maintenanceDetails || maintenanceDetails.trim() === "" || maintenanceDetails === "Descripcion....") {
        throw new Error("Debe ingresar los detalles del mantenimiento.");
      }
      
      if (!maintenanceType || maintenanceType === "" || maintenanceType === "Tipo de mantenimiento") {
        throw new Error("Debe seleccionar un tipo de mantenimiento.");
      }
      
      // Validación de longitud de detalles
      if (maintenanceDetails.length > 350) {
        throw new Error("Los detalles no pueden superar los 350 caracteres.");
      }
      
      // Validación de fecha futura
      const selectedDate = new Date(scheduleDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        throw new Error("La fecha programada debe ser igual o posterior a hoy.");
      }
      
      // Validación de hora válida
      const hourNum = parseInt(hour);
      const minuteNum = parseInt(minute);
      
      if (hourNum < 1 || hourNum > 12 || minuteNum < 0 || minuteNum > 59) {
        throw new Error("Por favor ingrese una hora válida.");
      }
      
      // Simulación de llamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulación de guardado exitoso
      setShowSuccess(true);
      
    } catch (error) {
      setError(error.message);
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-theme w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-secondary hover:text-primary z-10"
        >
          ×
        </button>
        <h2 className="text-theme-2xl font-theme-bold mb-4 text-primary">Actualizar mantenimiento</h2>

        {/* Información de la solicitud */}
        <div className="border-primary rounded-theme-lg mb-4 border">
          <h3 className="font-theme-semibold px-6 pt-5 pb-3 text-primary">
            Información de la solicitud
          </h3>
          <div className="divide-y border-primary">
            <div className="grid grid-cols-2 divide-x border-primary text-theme-sm">
              <div className="px-6 py-3">
                <p className="text-secondary">Número de serie</p>
                <p className="mt-1 font-theme-medium text-primary">{mockData.serialNumber}</p>
              </div>
              <div className="px-6 py-3">
                <p className="text-secondary">Nombre de la máquina</p>
                <p className="mt-1 font-theme-medium text-primary">{mockData.machineName}</p>
              </div>
            </div>
            <div className="px-6 py-3 text-theme-sm">
              <p className="text-secondary">Fecha de la solicitud</p>
              <p className="mt-1 font-theme-medium text-primary">{mockData.requestDate}</p>
            </div>
          </div>
        </div>

        {/* Información del mantenimiento */}
        <div className="border-primary rounded-theme-lg mb-4 border">
          <h3 className="font-theme-semibold px-6 pt-5 pb-3 text-primary">
            Información del mantenimiento
          </h3>
          <div className="px-6 pb-4">
            <div className="grid grid-cols-3 gap-6 mb-4">
              {/* Fecha programada */}
              <div className="flex flex-col">
                <label
                  htmlFor="scheduleDate"
                  className="text-theme-sm text-secondary mb-1"
                >
                  Fecha programada*
                </label>
                <input
                  id="scheduleDate"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="input-theme w-full"
                />
              </div>

              {/* Hora programada */}
              <div className="flex flex-col">
                <label className="text-theme-sm text-secondary mb-1">
                  Hora programada*
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={parseInt(hour) || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
                        // mantener dos dígitos al guardar, con ‘01’ como valor por defecto
                        setHour(value === '' ? '01' : value.padStart(2, '0'));
                      }
                    }}
                    className="input-theme w-20 text-center"
                    placeholder="HH"
                  />
                  <span className="text-secondary font-theme-medium text-lg">:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={parseInt(minute) || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                        // mantener dos dígitos al guardar, con ‘00’ como valor por defecto
                        setMinute(value === '' ? '00' : value.padStart(2, '0'));
                      }
                    }}
                    className="input-theme w-20 text-center"
                    placeholder="MM"
                  />
                  <div className="relative">
                    <select
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="input-theme px-4 py-2 pr-8 min-w-[70px] appearance-none text-center font-theme-medium"
                      
                    > 
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                      
                    </select>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary pointer-events-none"
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

                  

              {/* Técnico asignado */}
              <div className="flex flex-col">
                <label className="text-theme-sm text-secondary mb-1">
                  Técnico asignado*
                </label>
                <div className="relative">
                  <select
                    value={assignedTechnician}
                    onChange={(e) =>
                      setAssignedTechnician(e.target.value)
                    }
                    className="input-theme w-full pr-8 appearance-none"
                  >
                    <option value="">Seleccione un técnico...</option>
                    {technicians.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary pointer-events-none"
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
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-theme-sm text-secondary mb-1">
                  Detalles del mantenimiento*
                </label>
                <textarea
                  value={maintenanceDetails}
                  onChange={(e) =>
                    setMaintenanceDetails(e.target.value)
                  }
                  placeholder="Ingrese los detalles del mantenimiento..."
                  maxLength={350}
                  rows={4}
                  className="input-theme w-full resize-none"
                />
                <div className="text-theme-xs text-secondary mt-1">
                  {maintenanceDetails.length}/350 caracteres
                </div>
              </div>
              <div>
                <label className="block text-theme-sm text-secondary mb-1">
                  Tipo de mantenimiento*
                </label>
                <div className="relative">
                  <select
                    value={maintenanceType}
                    onChange={(e) =>
                      setMaintenanceType(e.target.value)
                    }
                    className="input-theme w-full pr-8 appearance-none"
                  >
                    <option value="">Seleccione un tipo...</option>
                    {maintenanceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary pointer-events-none"
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

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`btn-theme btn-primary w-full py-3 text-theme-lg font-theme-semibold ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Actualizar programación de mantenimiento"
        >
          {isSubmitting ? 'Actualizando...' : 'Actualizar'}
        </button>

        <SuccessModal
          isOpen={showSuccess}
          title="¡Actualización exitosa!"
          message="La programación de mantenimiento se actualizó correctamente."
          onClose={() => {
            setShowSuccess(false);
            onClose();
          }}
        />

        <ErrorModal
          isOpen={showError}
          title="Error de validación"
          message={error}
          onClose={() => setShowError(false)}
        />
      </div>
    </div>
  );
};

export default UpdateMaintenanceSchedule;