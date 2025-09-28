"use client";
import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import {
  getActiveDataTypes,
  createUnits,
  updateUnit,
  toggleUnitStatus,
} from "@/services/parametrizationService";
import {
  SuccessModal,
  ErrorModal,
} from "@/app/components/shared/SuccessErrorModal";

const AddModifyUnitModal = ({
  isOpen,
  onClose,
  mode = "add",
  unit = null,
  category = "Weight",
  categoryId = 1,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    category: category,
    typeName: "",
    symbol: "",
    value: "",
    unitType: "",
    isActive: true,
  });

  const [dataTypes, setDataTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [id, setId] = useState("");

  // Cargar tipos de datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      fetchDataTypes();
    }
  }, [isOpen]);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setId(parsed.id);
      } catch (err) {
        console.error("Error parsing userData", err);
      }
    }
  }, []);

  const fetchDataTypes = async () => {
    try {
      setLoading(true);
      const response = await getActiveDataTypes();
      console.log("📊 Data types response:", response);

      // La respuesta puede ser directamente un array o tener una propiedad data
      const typesArray = response.data || response || [];
      setDataTypes(typesArray);
    } catch (err) {
      console.error("❌ Error fetching data types:", err);
      setError("Error loading data types");
      setDataTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "modify" && unit && dataTypes.length > 0) {
      console.log("🔍 Unit data for modify mode:", unit);

      // Mejorar la lógica de mapeo del unitType
      let unitTypeId = "";

      // Priorizar diferentes campos según lo que esté disponible
      if (unit.unitType) {
        unitTypeId = unit.unitType;
      } else if (unit.id_unit_type) {
        unitTypeId = unit.id_unit_type;
      } else if (unit.unit_type_id) {
        unitTypeId = unit.unit_type_id;
      } else if (unit.value && dataTypes.length > 0) {
        // Buscar por nombre del tipo
        const matchingType = dataTypes.find(
          (type) =>
            type.name === unit.value ||
            type.name.toLowerCase() === unit.value.toLowerCase()
        );
        unitTypeId = matchingType
          ? matchingType.id_types || matchingType.id
          : "";
      }

      console.log("🔍 Final resolved unitTypeId:", unitTypeId);

      setFormData({
        category: category,
        typeName: unit.unitName || unit.name || unit.typeName || "",
        symbol: unit.symbol || "",
        value: unit.value || "",
        unitType: String(unitTypeId), // Asegurar que sea string
        isActive:
          unit.statusId === 1 ||
          unit.status === "Activo" ||
          unit.status === "Active",
      });
    } else if (mode === "add") {
      // Resetear formulario para modo add
      setFormData({
        category: category,
        typeName: "",
        symbol: "",
        value: "",
        unitType: "",
        isActive: true,
      });
    }
  }, [unit, mode, category, dataTypes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleChange = async () => {
    if (mode === "modify" && unit?.id) {
      // Si estamos en modo edición, hacer toggle real en la API
      try {
        setLoading(true);
        console.log(`🔄 Toggling status for unit ID: ${unit.id}`);

        const response = await toggleUnitStatus(unit.id);
        console.log("✅ Status toggled successfully:", response);

        // Mostrar mensaje de éxito
        setModalMessage(response.message);
        setSuccessOpen(true);

        // Actualizar el estado local del formulario
        setFormData((prev) => ({
          ...prev,
          isActive: !prev.isActive,
        }));

        // Notificar al componente padre para recargar datos
        if (onSave) {
          await onSave({
            success: true,
            message: response.message,
            statusChanged: true,
          });
        }
      } catch (error) {
        console.error("❌ Error toggling unit status:", error);
        setModalMessage(
          error.response?.data?.message ||
            error.message ||
            "Error al cambiar estado"
        );
        setErrorOpen(true);
      } finally {
        setLoading(false);
      }
    } else {
      // Si estamos en modo agregar, solo cambiar el estado local
      setFormData((prev) => ({
        ...prev,
        isActive: !prev.isActive,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validar que unitType sea válido
    if (!formData.unitType || formData.unitType === "") {
      setError("Por favor selecciona un tipo de unidad");
      return;
    }

    try {
      if (mode === "modify") {
        const payload = {
          name: formData.typeName,
          symbol: formData.symbol,
          unit_type: parseInt(formData.unitType),
          responsible_user: id,
        };

        console.log("🔄 Updating unit with payload:", payload);

        const response = await updateUnit(unit.id, payload);
        console.log("✅ Unit updated successfully:", response);

        onClose();

        if (onSave) {
          await onSave({
            success: true,
            message: response.message || "Unidad actualizada correctamente",
          });
        }
      } else {
        // Validar campos obligatorios para creación
        if (!formData.typeName.trim()) {
          setError("El nombre de la unidad es obligatorio");
          return;
        }

        if (!formData.symbol.trim()) {
          setError("El símbolo es obligatorio");
          return;
        }

        const payload = {
          name: formData.typeName,
          symbol: formData.symbol,
          units_category: categoryId,
          unit_type: parseInt(formData.unitType),
          estado: formData.isActive ? 'Activo' : 'Inactivo', // ← AGREGAR ESTADO
          responsible_user: id,
        };

        console.log("📦 Creating unit with payload:", payload);

        const response = await createUnits(payload);
        console.log("✅ Unit created successfully:", response);

        onClose();

        if (onSave) {
          await onSave({
            success: true,
            message: response.message || "Unidad creada correctamente",
          });
        }
      }
    } catch (err) {
      console.error("❌ Error saving unit:", err);

      // Mejorar el manejo de errores
      let errorMessage = "Error al guardar la unidad";

      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.units_category) {
          errorMessage = `Error de categoría: ${errorData.units_category[0]}`;
        } else if (errorData.unit_type) {
          errorMessage = `Error de tipo: ${errorData.unit_type[0]}`;
        } else if (errorData.name) {
          errorMessage = `Error de nombre: ${errorData.name[0]}`;
        } else if (errorData.symbol) {
          errorMessage = `Error de símbolo: ${errorData.symbol[0]}`;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-medium text-gray-900">
            {mode === "modify" ? "Modificar unidad" : "Añadir unidad"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-6">
          {/* Row 1: Category and Type name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-700 cursor-not-allowed"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre unidad
              </label>
              <input
                type="text"
                name="typeName"
                value={formData.typeName}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder=""
                required
              />
            </div>
          </div>

          {/* Row 2: Symbol and Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Símbolo
              </label>
              <input
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="kg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor (Tipo)
              </label>
              {loading ? (
                <div className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm text-gray-500">
                  Cargando tipos...
                </div>
              ) : (
                <select
                  name="unitType"
                  value={formData.unitType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a type</option>
                  {dataTypes.map((type) => (
                    <option
                      key={type.id_types || type.id}
                      value={type.id_types || type.id}
                    >
                      {type.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Row 3: Toggle */}
          <div className="flex justify-center items-center space-x-4 mb-6">
            <span className="text-sm font-medium text-gray-700">
              Activar/Desactivar
            </span>
            <button
              type="button"
              onClick={handleToggleChange}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                formData.isActive ? "bg-red-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="btn-theme btn-primary not-disabled: w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mode === "modify" ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        message={modalMessage}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        message={modalMessage}
      />
    </div>
  );
};

export default AddModifyUnitModal;
