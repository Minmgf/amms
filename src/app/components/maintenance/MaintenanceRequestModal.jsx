"use client";
import React, {useState, useEffect} from "react";
import { FiX } from "react-icons/fi";
import { set, useForm } from "react-hook-form";
import { useTheme } from "@/contexts/ThemeContext";
import { createMaintenanceRequest, getActiveMachineries, getPrioritiesList, getMaintenanceTypes } from "@/services/maintenanceService";
import { SuccessModal, ErrorModal } from "../shared/SuccessErrorModal";

const MaintenanceRequestModal = ({
  isOpen,
  onClose,
  defaultValues = {},
}) => {
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors }
  } = useForm({
    defaultValues,
  });
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  // Datos para selects
  const [machines, setMachines] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modales de éxito y error
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Cargar datos al montar el componente
  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      try {
        const [machinesData, prioritiesData, maintenanceTypesData] = await Promise.all([
          getActiveMachineries(),
          getPrioritiesList(),
          getMaintenanceTypes()
        ]); 
        setMachines(machinesData.data);
        setPriorities(prioritiesData);
        setMaintenanceTypes(maintenanceTypesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [isOpen]);

  const handleFormSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        id_machinery: data.machine,
        maintenance_type: data.maintenanceType,
        description: data.description,
        priority: data.priority,
        detected_at: data.detectionDate,
      };
      const response = await createMaintenanceRequest(payload);
      setModalMessage(response.message || "Solicitud de mantenimiento creada con éxito.");
      setSuccessOpen(true);
      setTimeout(() => {
        setSuccessOpen(false);
        reset();
        onClose();            
      }, 2000);
    } catch (error) {
      const apiError = error.response?.data;
      if (apiError) {
    // Extraer el mensaje principal
        let fullMessage = apiError.message;
    // Extraer los detalles)
        if (apiError.details) {
          const detailsArray = Object.values(apiError.details).flat();
          fullMessage += `: ${detailsArray.join(" ")}`;
        }
        setModalMessage(fullMessage);
        setErrorOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        id="Maintenance Request Modal"
      >
        <div
          className="bg-background rounded-xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 text-primary">
              Solicitud de Mantenimiento
            </h2>
            <button
              aria-label="Close modal Button"
              onClick={() => {
                    onClose();
                    reset();
                  }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Modal Content */}
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="p-6 overflow-y-auto max-h-[calc(95vh-90px)]"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Machine selector */}
              <div>
                <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                  Maquinaria
                </label>
                <select
                  {...register("machine", { required: true })}
                  className="parametrization-input w-full max-w-full overflow-auto"
                  aria-label="Machine Select"
                  defaultValue=""
                >
                  <option value="">
                    Seleccione la maquinaria
                  </option>
                  {machines.map((machine) => (
                    <option key={machine.id_machinery} value={machine.id_machinery}>
                      {machine.serial_number} - {machine.machinery_name}
                    </option>
                  ))}
                </select>
                {errors.machine && (
                  <span className="text-xs text-red-500 mt-1 block">
                    Este campo es obligatorio.
                  </span>
                )}
              </div>
              {/* Maintenance type */}
              <div>
                <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Mantenimiento
                </label>
                <select
                  {...register("maintenanceType", { required: true })}
                  className="parametrization-input"
                  aria-label="Maintenance type Select"
                  defaultValue=""
                >
                  <option value="">
                    Seleccione el tipo
                  </option>
                  {maintenanceTypes.map((t) => (
                    <option key={t.id_types} value={t.id_types}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {errors.maintenanceType && (
                  <span className="text-xs text-red-500 mt-1 block">
                    Este campo es obligatorio.
                  </span>
                )}
              </div>
              {/* Problem description */}
              <div className="md:col-span-2">
                <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                  Descripción del problema
                </label>
                <textarea
                  {...register("description", { required: true })}
                  className="parametrization-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-none"
                  aria-label="Problem description Textarea"
                  rows={3}
                  placeholder="Describa el problema aquí..."
                />
                {errors.description && (
                  <span className="text-xs text-red-500 mt-1 block">
                    Este campo es obligatorio.
                  </span>
                )}
              </div>
              {/* Priority */}
              <div>
                <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                  Prioridad
                </label>
                <select
                  {...register("priority", { required: true })}
                  className="parametrization-input"
                  aria-label="Priority Select"
                  defaultValue=""
                >
                  <option value="">
                    Seleccione la prioridad
                  </option>
                  {priorities.map((p) => (
                    <option key={p.id_types} value={p.id_types}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {errors.priority && (
                  <span className="text-xs text-red-500 mt-1 block">
                    Este campo es obligatorio.
                  </span>
                )}
              </div>
              {/* Detection date */}
              <div>
                <label className="text-secondary block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Detección
                </label>
                <div className="relative">
                  <input
                    type="date"
                    {...register("detectionDate", { 
                      required: "Este campo es obligatorio.",
                      validate: value => {
                        if (!value) return true; 
                        const today = new Date();
                        const selected = new Date(value);
                        today.setHours(0,0,0,0);
                        selected.setHours(0,0,0,0);
                        return selected <= today || "No puede seleccionar una fecha futura.";
                      }
                    })}
                    className="parametrization-input"
                    aria-label="Detection date Input"
                  />
                  {errors.detectionDate && (
                    <span className="text-xs text-red-500 mt-1 block">
                      {errors.detectionDate.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* Footer buttons */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                  type="button"
                  onClick={() => {
                    onClose();
                    reset();
                  }}
                  className="btn-error btn-theme w-40 px-8 py-2 font-semibold rounded-lg"
                  aria-label="Cancel Button"
              >
                  Cancelar
              </button>
              <button
                  type="submit"
                  className="btn-primary w-40 px-8 py-2 font-semibold rounded-lg text-white"
                  aria-label="Request Button"
                  disabled={loading}
              >
                  {loading ? "Enviando..." : "Solicitar"}
              </button>
              </div>
          </form>
        </div>
      </div>
      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Éxito"
        message={modalMessage}
      />
      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Error"
        message={modalMessage}
      />
    </>
  );
};

export default MaintenanceRequestModal;