"use client";
import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { getMonitoringParameters, getDeviceById, updateDevice, createTelemetryDevice } from "@/services/devicesService";

const RegisterDevice = ({ isOpen, onClose, onSuccess, deviceToEdit }) => {
  const isEditMode = !!deviceToEdit;

  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDevice, setLoadingDevice] = useState(false);
  const [errors, setErrors] = useState({
    deviceName: "",
    imei: ""
  });
  const [formData, setFormData] = useState({
    deviceName: "",
    imei: "",
    selectedParameters: [] // Array de IDs de parámetros seleccionados
  });

  // Cargar parámetros desde el API
  useEffect(() => {
    const fetchParameters = async () => {
      try {
        setLoading(true);
        const response = await getMonitoringParameters();
        if (response.success && response.data) {
          setParameters(response.data);
        }
      } catch (error) {
        console.error("Error al cargar parámetros:", error);
        setParameters([]);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchParameters();
    }
  }, [isOpen]);

  // Cargar datos del dispositivo en modo edición
  useEffect(() => {
    const loadDeviceData = async () => {
      if (isOpen && isEditMode && deviceToEdit && parameters.length > 0) {
        try {
          setLoadingDevice(true);
          const response = await getDeviceById(deviceToEdit.id_device);

          if (response.success && response.data) {
            // Extraer IDs de los parámetros del dispositivo
            const parameterIds = response.data.parameters.map(p => p.id);

            setFormData({
              deviceName: response.data.name || "",
              imei: response.data.IMEI?.toString() || "",
              selectedParameters: parameterIds
            });
          }
        } catch (error) {
          console.error("Error al cargar datos del dispositivo:", error);
          // Si falla, usar datos del prop deviceToEdit
          setFormData({
            deviceName: deviceToEdit.name || deviceToEdit.deviceName || "",
            imei: deviceToEdit.IMEI?.toString() || deviceToEdit.imei || "",
            selectedParameters: deviceToEdit.selectedParameters || []
          });
        } finally {
          setLoadingDevice(false);
        }
      } else if (isOpen && !isEditMode) {
        // Limpiar formulario en modo creación
        setFormData({
          deviceName: "",
          imei: "",
          selectedParameters: []
        });
      }
    };

    loadDeviceData();
  }, [isOpen, isEditMode, deviceToEdit, parameters]);

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
    // Limpiar error del campo al modificarlo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleCheckboxChange = (parameterId) => {
    setFormData(prev => {
      const isSelected = prev.selectedParameters.includes(parameterId);
      return {
        ...prev,
        selectedParameters: isSelected
          ? prev.selectedParameters.filter(id => id !== parameterId)
          : [...prev.selectedParameters, parameterId]
      };
    });
  };

  const isParameterSelected = (parameterId) => {
    return formData.selectedParameters.includes(parameterId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Limpiar errores previos
    setErrors({
      deviceName: "",
      imei: ""
    });

    // Validar que se haya ingresado nombre e IMEI
    if (!formData.deviceName || !formData.imei) {
      setErrors({
        deviceName: !formData.deviceName ? "El nombre del dispositivo es requerido" : "",
        imei: !formData.imei ? "El IMEI es requerido" : ""
      });
      return;
    }

    try {
      if (isEditMode) {
        // Actualizar dispositivo existente
        const payload = {
          name: formData.deviceName,
          IMEI: parseInt(formData.imei),
          parameters: formData.selectedParameters
        };

        console.log("Payload enviado:", payload);
        const response = await updateDevice(deviceToEdit.id_device, payload);
        console.log("Respuesta del API:", response);

        if (response && response.success) {
          // Llamar onSuccess con los datos actualizados
          if (onSuccess) {
            onSuccess({
              ...formData,
              id_device: response.data?.id_device || deviceToEdit.id_device
            });
          }
          onClose();
        } else {
          throw new Error(response?.message || "Error al actualizar el dispositivo");
        }
      } else {
        // Crear nuevo dispositivo
        const payload = {
          name: formData.deviceName,
          IMEI: parseInt(formData.imei),
          parameters: formData.selectedParameters
        };

        console.log("Payload para crear:", payload);
        const response = await createTelemetryDevice(payload);
        console.log("Respuesta de creación:", response);

        if (response && response.message) {
          // Llamar onSuccess con los datos creados
          if (onSuccess) {
            onSuccess({
              ...formData,
              id: response.id
            });
          }
          onClose();
        } else {
          throw new Error(response?.message || "Error al crear el dispositivo");
        }
      }
    } catch (error) {
      console.error("Error al guardar dispositivo:", error);
      
      // Manejar errores de validación del servidor (400)
      if (error.response?.status === 400 && error.response?.data) {
        const serverErrors = error.response.data;
        console.log("Errores del servidor:", serverErrors);
        
        // Mapear errores específicos a campos del formulario
        const newErrors = {
          deviceName: "",
          imei: ""
        };
        
        // Verificar si hay error de IMEI duplicado
        if (serverErrors.IMEI) {
          newErrors.imei = Array.isArray(serverErrors.IMEI) 
            ? serverErrors.IMEI[0] 
            : serverErrors.IMEI;
        }
        
        // Verificar si hay error de nombre
        if (serverErrors.name) {
          newErrors.deviceName = Array.isArray(serverErrors.name) 
            ? serverErrors.name[0] 
            : serverErrors.name;
        }
        
        setErrors(newErrors);
      } else {
        // Para otros errores, mostrar alert
        const errorMessage = error.response?.data?.message || error.message || "Error al guardar el dispositivo. Por favor, intente nuevamente.";
        alert(errorMessage);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      deviceName: "",
      imei: "",
      selectedParameters: []
    });
    setErrors({
      deviceName: "",
      imei: ""
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
                className={`parametrization-input w-full ${errors.deviceName ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Ej: AgroLink-001"
                required
              />
              {errors.deviceName && (
                <p className="text-red-500 text-xs mt-1">{errors.deviceName}</p>
              )}
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
                className={`parametrization-input w-full ${errors.imei ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Ej: 357984562034378"
                required
                pattern="[0-9]{15}"
                title="El IMEI debe contener exactamente 15 dígitos"
              />
              {errors.imei && (
                <p className="text-red-500 text-xs mt-1">{errors.imei}</p>
              )}
            </div>
          </div>

          {/* Parámetros de Monitoreo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-primary mb-3">
              Parámetros de Monitoreo
            </label>

            {loading || loadingDevice ? (
              <div className="text-center py-8">
                <p className="text-sm text-secondary">
                  {loadingDevice ? "Cargando datos del dispositivo..." : "Cargando parámetros..."}
                </p>
              </div>
            ) : parameters.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-secondary">No se encontraron parámetros disponibles</p>
              </div>
            ) : (
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-3 border border-blue-300 rounded-lg p-4"
                style={{
                  maxHeight: "400px",
                  overflowY: "auto",
                  borderColor: "var(--color-accent, #3b82f6)"
                }}
              >
                {parameters.map((parameter) => (
                  <label
                    key={parameter.id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    title={parameter.description || parameter.parameter_name}
                  >
                    <input
                      type="checkbox"
                      checked={isParameterSelected(parameter.id)}
                      onChange={() => handleCheckboxChange(parameter.id)}
                      className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                    />
                    <span className="text-sm text-secondary">
                      {parameter.parameter_name}
                      {parameter.unit && (
                        <span className="text-xs text-gray-400 ml-1">({parameter.unit})</span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            )}
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
