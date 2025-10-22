"use client";
import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

const RegisterDevice = ({ isOpen, onClose, onSuccess, deviceToEdit }) => {
  const isEditMode = !!deviceToEdit;

  const [formData, setFormData] = useState({
    deviceName: "",
    imei: "",
    monitoringParameters: {
      ignitionStatus: false,
      movementStatus: false,
      currentSpeed: false,
      gpsLocation: false,
      gsmSignal: false,
      revolutions: false,
      engineTemperature: false,
      engineLoad: false,
      oilLevel: false,
      fuelLevel: false,
      fuelUsed: false,
      instantFuelConsumption: false,
      obdErrors: false,
      totalOdometer: false,
      tripOdometer: false,
      eventsGForce: false,
    }
  });

  // Precargar datos en modo edición
  useEffect(() => {
    if (isOpen && isEditMode && deviceToEdit) {
      setFormData({
        deviceName: deviceToEdit.deviceName || "",
        imei: deviceToEdit.imei || "",
        monitoringParameters: deviceToEdit.monitoringParameters || {
          ignitionStatus: false,
          movementStatus: false,
          currentSpeed: false,
          gpsLocation: false,
          gsmSignal: false,
          revolutions: false,
          engineTemperature: false,
          engineLoad: false,
          oilLevel: false,
          fuelLevel: false,
          fuelUsed: false,
          instantFuelConsumption: false,
          obdErrors: false,
          totalOdometer: false,
          tripOdometer: false,
          eventsGForce: false,
        }
      });
    } else if (isOpen && !isEditMode) {
      // Limpiar formulario en modo creación
      setFormData({
        deviceName: "",
        imei: "",
        monitoringParameters: {
          ignitionStatus: false,
          movementStatus: false,
          currentSpeed: false,
          gpsLocation: false,
          gsmSignal: false,
          revolutions: false,
          engineTemperature: false,
          engineLoad: false,
          oilLevel: false,
          fuelLevel: false,
          fuelUsed: false,
          instantFuelConsumption: false,
          obdErrors: false,
          totalOdometer: false,
          tripOdometer: false,
          eventsGForce: false,
        }
      });
    }
  }, [isOpen, isEditMode, deviceToEdit]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (parameterName) => {
    setFormData(prev => ({
      ...prev,
      monitoringParameters: {
        ...prev.monitoringParameters,
        [parameterName]: !prev.monitoringParameters[parameterName]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos del dispositivo:", formData);

    // Aquí llamarías al API para guardar
    if (onSuccess) {
      onSuccess(formData);
    }
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      deviceName: "",
      imei: "",
      monitoringParameters: {
        ignitionStatus: false,
        movementStatus: false,
        currentSpeed: false,
        gpsLocation: false,
        gsmSignal: false,
        revolutions: false,
        engineTemperature: false,
        engineLoad: false,
        oilLevel: false,
        fuelLevel: false,
        fuelUsed: false,
        instantFuelConsumption: false,
        obdErrors: false,
        totalOdometer: false,
        tripOdometer: false,
        eventsGForce: false,
      }
    });
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
      onClick={handleOverlayClick}
      style={{ zIndex: 9999 }}
    >
      <div
        className="modal-theme w-full max-w-xl relative"
        onClick={(e) => e.stopPropagation()}
        style={{
          zIndex: 10000,
          maxHeight: "90vh",
          overflowY: "auto"
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-primary">
            {isEditMode ? "Actualización de Dispositivo" : "Registro de Dispositivo"}
          </h2>
          <button
            onClick={handleCancel}
            className="text-secondary hover:text-primary transition-colors"
            type="button"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Nombre del Dispositivo e IMEI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Nombre del Dispositivo
              </label>
              <input
                type="text"
                name="deviceName"
                value={formData.deviceName}
                onChange={handleInputChange}
                className="parametrization-input w-full"
                placeholder="Ej: AgroLink-001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                IMEI
              </label>
              <input
                type="text"
                name="imei"
                value={formData.imei}
                onChange={handleInputChange}
                className="parametrization-input w-full"
                placeholder="Ej: 357984562034378"
                required
                pattern="[0-9]{15}"
                title="El IMEI debe contener exactamente 15 dígitos"
              />
            </div>
          </div>

          {/* Parámetros de Monitoreo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-primary mb-3">
              Parámetros de Monitoreo
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Columna Izquierda */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.monitoringParameters.ignitionStatus}
                    onChange={() => handleCheckboxChange('ignitionStatus')}
                    className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-secondary">Estado de Encendido</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.monitoringParameters.currentSpeed}
                    onChange={() => handleCheckboxChange('currentSpeed')}
                    className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-secondary">Velocidad Actual</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.monitoringParameters.gsmSignal}
                    onChange={() => handleCheckboxChange('gsmSignal')}
                    className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-secondary">Señal GSM</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.monitoringParameters.engineTemperature}
                    onChange={() => handleCheckboxChange('engineTemperature')}
                    className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-secondary">Temperatura del Motor</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.monitoringParameters.oilLevel}
                    onChange={() => handleCheckboxChange('oilLevel')}
                    className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-secondary">Nivel de Aceite</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.monitoringParameters.fuelUsed}
                    onChange={() => handleCheckboxChange('fuelUsed')}
                    className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-secondary">Combustible Usado (GPS)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.monitoringParameters.obdErrors}
                    onChange={() => handleCheckboxChange('obdErrors')}
                    className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-secondary">Errores OBD</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.monitoringParameters.tripOdometer}
                    onChange={() => handleCheckboxChange('tripOdometer')}
                    className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-secondary">Odómetro de Viaje</span>
                </label>
              </div>

              {/* Columna Derecha */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.monitoringParameters.movementStatus}
                    onChange={() => handleCheckboxChange('movementStatus')}
                    className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-secondary">Estado de Movimiento</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.monitoringParameters.gpsLocation}
                    onChange={() => handleCheckboxChange('gpsLocation')}
                    className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-secondary">Ubicación GPS</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.monitoringParameters.revolutions}
                    onChange={() => handleCheckboxChange('revolutions')}
                    className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-secondary">Revoluciones (RPM)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.monitoringParameters.engineLoad}
                    onChange={() => handleCheckboxChange('engineLoad')}
                    className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-secondary">Carga del Motor</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.monitoringParameters.fuelLevel}
                    onChange={() => handleCheckboxChange('fuelLevel')}
                    className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-secondary">Nivel de Combustible</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.monitoringParameters.instantFuelConsumption}
                    onChange={() => handleCheckboxChange('instantFuelConsumption')}
                    className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-secondary">Consumo Instantáneo de Combustible</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.monitoringParameters.totalOdometer}
                    onChange={() => handleCheckboxChange('totalOdometer')}
                    className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-secondary">Odómetro Total</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.monitoringParameters.eventsGForce}
                    onChange={() => handleCheckboxChange('eventsGForce')}
                    className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-secondary">Eventos - Valor de Fuerza G</span>
                </label>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-theme btn-error w-1/2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-theme btn-primary w-1/2"
              style={{ backgroundColor: "black", color: "white" }}
            >
              {isEditMode ? "Guardar" : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterDevice;
