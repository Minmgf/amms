import React, { useState, useEffect } from "react";

export default function FuelPredictionModal({ isOpen, onClose, onSave, formData }) {
  const implementationOptions = [
    { value: "", label: "Seleccione..." },
    { value: "Arado Vertedera", label: "Arado Vertedera" },
    { value: "Arado Disco", label: "Arado Disco" },
  ];
  const soilTypes = [
    { value: "", label: "Seleccione..." },
    { value: "sandy", label: "Arenoso" },
    { value: "loam", label: "Franco" },
    { value: "clay", label: "Arcilloso" }
  ];
  const textureOptions = [
    { value: "", label: "Seleccione..." },
    { value: "fine", label: "Fina" },
    { value: "medium", label: "Media" },
    { value: "coarse", label: "Gruesa" }
  ];

  const initialState = {
    implementation: "",
    workDepth: "",
    humidity: "",
    soilType: "",
    texture: "",
    slope: "",
    estimatedHours: ""
  };

  const [form, setForm] = useState(formData || initialState);
  const [errors, setErrors] = useState({});

  // Solo limpiar si el multistep se cierra, NO al cerrar el modal
  useEffect(() => {
    if (isOpen && formData) {
      setForm(formData);
    } else if (isOpen && !formData) {
      setForm(initialState);
    }
  }, [isOpen, formData]);

  if (!isOpen) return null;

  const validate = () => {
    const e = {};
    if (!form.implementation) e.implementation = "Seleccione la implementación";
    if (form.workDepth !== "" && Number(form.workDepth) < 0) e.workDepth = "Debe ser >= 0";
    if (form.humidity !== "" && (Number(form.humidity) < 0 || Number(form.humidity) > 100)) e.humidity = "Debe estar entre 0 y 100";
    if (!form.soilType) e.soilType = "Seleccione el tipo de suelo";
    if (form.slope !== "" && (Number(form.slope) < 0)) e.slope = "Debe ser >= 0";
    if (form.estimatedHours !== "" && (Number(form.estimatedHours) < 0)) e.estimatedHours = "Debe ser >= 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleClean = () => {
    setForm(initialState);
    setErrors({});
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = {
      implementation: form.implementation,
      workDepth: form.workDepth === "" ? null : Number(form.workDepth),
      humidity: form.humidity === "" ? null : parseFloat(form.humidity),
      soilType: form.soilType,
      texture: form.texture,
      slope: form.slope === "" ? null : parseFloat(form.slope),
      estimatedHours: form.estimatedHours === "" ? null : parseFloat(form.estimatedHours)
    };
    if (onSave) onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="bg-white rounded-lg shadow-lg z-10 max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Predicción de Consumo de Combustible</h3>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-gray-600">✕</button>
        </div>

        <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">
          Con la información proporcionada a continuación se generará una predicción del consumo de combustible para su operación agrícola.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Implementación</label>
            <select
              value={form.implementation}
              onChange={e => handleChange("implementation", e.target.value)}
              className="parametrization-input w-full"
            >
              {implementationOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.implementation && <div className="text-red-600 text-xs mt-1">{errors.implementation}</div>}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Profundidad de trabajo (metros)</label>
            <input
              type="number"
              step="any"
              value={form.workDepth}
              onChange={e => handleChange("workDepth", e.target.value)}
              className="parametrization-input w-full"
              placeholder="Ej: 0.15"
            />
            {errors.workDepth && <div className="text-red-600 text-xs mt-1">{errors.workDepth}</div>}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Humedad (%)</label>
            <input
              type="number"
              step="any"
              min="0"
              max="100"
              value={form.humidity}
              onChange={e => handleChange("humidity", e.target.value)}
              className="parametrization-input w-full"
              placeholder="Ej: 12.5"
            />
            {errors.humidity && <div className="text-red-600 text-xs mt-1">{errors.humidity}</div>}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Tipo de suelo</label>
            <select
              value={form.soilType}
              onChange={e => handleChange("soilType", e.target.value)}
              className="parametrization-input w-full"
            >
              {soilTypes.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            {errors.soilType && <div className="text-red-600 text-xs mt-1">{errors.soilType}</div>}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Textura</label>
            <select
              value={form.texture}
              onChange={e => handleChange("texture", e.target.value)}
              className="parametrization-input w-full"
            >
              {textureOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Pendiente (%)</label>
            <input
              type="number"
              step="any"
              value={form.slope}
              onChange={e => handleChange("slope", e.target.value)}
              className="parametrization-input w-full"
              placeholder="Ej: 5"
            />
            {errors.slope && <div className="text-red-600 text-xs mt-1">{errors.slope}</div>}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">Duración estimada de trabajo (horas)</label>
            <input
              type="number"
              step="any"
              value={form.estimatedHours}
              onChange={e => handleChange("estimatedHours", e.target.value)}
              className="parametrization-input w-full"
              placeholder="Ej: 2.5"
            />
            {errors.estimatedHours && <div className="text-red-600 text-xs mt-1">{errors.estimatedHours}</div>}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button type="button" onClick={handleClean} className="btn-theme btn-error">Limpiar</button>
          <button type="button" onClick={handleSave} className="btn-theme btn-primary">Guardar</button>
        </div>
      </div>
    </div>
  );
}