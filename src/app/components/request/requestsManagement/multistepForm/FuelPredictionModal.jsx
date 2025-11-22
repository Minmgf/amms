import React, { useState, useEffect } from "react";

export default function FuelPredictionModal({ isOpen, onClose, onSave, formData, soilTypes, implementTypes, textureTypes }) {

  const initialState = {
    implementation: "",
    implementWidth: "",
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
    
    // Implementación - obligatorio
    if (!form.implementation) e.implementation = "Seleccione la implementación";
    
    // Ancho del implemento - obligatorio, rango: 0.5 a 5.0 metros
    if (!form.implementWidth || form.implementWidth === "") {
      e.implementWidth = "El ancho del implemento es obligatorio";
    } else {
      const width = Number(form.implementWidth);
      if (width < 0.5 || width > 5.0) {
        e.implementWidth = "Debe estar entre 0.5 y 5.0 metros";
      }
    }
    
    // Profundidad de trabajo - obligatorio, rango: 0.1 a 0.5 metros
    if (!form.workDepth || form.workDepth === "") {
      e.workDepth = "La profundidad de trabajo es obligatoria";
    } else {
      const depth = Number(form.workDepth);
      if (depth < 0.1 || depth > 0.5) {
        e.workDepth = "Debe estar entre 0.1 y 0.5 metros";
      }
    }
    
    // Humedad - obligatorio, rango: 0% a 50%
    if (!form.humidity || form.humidity === "") {
      e.humidity = "La humedad es obligatoria";
    } else {
      const hum = Number(form.humidity);
      if (hum < 0 || hum > 50) {
        e.humidity = "Debe estar entre 0% y 50%";
      }
    }
    
    // Tipo de suelo - obligatorio
    if (!form.soilType) e.soilType = "Seleccione el tipo de suelo";
    
    // Textura - obligatorio
    if (!form.texture) e.texture = "Seleccione la textura";
    
    // Pendiente - obligatorio, rango: 0% a 30%
    if (!form.slope || form.slope === "") {
      e.slope = "La pendiente es obligatoria";
    } else {
      const slopeVal = Number(form.slope);
      if (slopeVal < 0 || slopeVal > 30) {
        e.slope = "Debe estar entre 0% y 30%";
      }
    }
    
    // Duración estimada - obligatorio, debe ser mayor a 0
    if (!form.estimatedHours || form.estimatedHours === "") {
      e.estimatedHours = "La duración estimada es obligatoria";
    } else {
      const hours = Number(form.estimatedHours);
      if (hours <= 0) {
        e.estimatedHours = "Debe ser mayor a 0 horas";
      }
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    // Limpiar el error del campo cuando el usuario ingresa un valor
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleClean = () => {
    setForm(initialState);
    setErrors({});
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = {
      implementation: form.implementation,
      implementWidth: form.implementWidth === "" ? null : Number(form.implementWidth),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center" id="fuel-prediction-modal">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="bg-background rounded-lg shadow-lg z-10 max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Predicción de Consumo de Combustible</h3>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-gray-600">✕</button>
        </div>

        <div className="card-theme">
          Con la información proporcionada a continuación se generará una predicción del consumo de combustible para su operación agrícola.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Implementación</label>
            <select
              value={form.implementation}
              onChange={e => handleChange("implementation", e.target.value)}
              className="parametrization-input w-full"
              aria-label="Seleccionar implementación"
            >
              <option value="">Seleccione...</option>
              {implementTypes.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
            {errors.implementation && <div className="text-red-600 text-xs mt-1">{errors.implementation}</div>}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Ancho del implemento (metros)</label>
            <input
              type="number"
              step="0.1"
              min="0.5"
              max="5.0"
              value={form.implementWidth}
              onChange={e => handleChange("implementWidth", e.target.value)}
              className="parametrization-input w-full"
              aria-label="Ancho del implemento en metros"
              placeholder="Ej: 2.5"
            />
            {errors.implementWidth && <div className="text-red-600 text-xs mt-1">{errors.implementWidth}</div>}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Profundidad de trabajo (metros)</label>
            <input
              type="number"
              step="0.01"
              min="0.1"
              max="0.5"
              value={form.workDepth}
              onChange={e => handleChange("workDepth", e.target.value)}
              className="parametrization-input w-full"
              aria-label="Profundidad de trabajo en metros"
              placeholder="Ej: 0.15"
            />
            {errors.workDepth && <div className="text-red-600 text-xs mt-1">{errors.workDepth}</div>}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Humedad (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="50"
              value={form.humidity}
              onChange={e => handleChange("humidity", e.target.value)}
              className="parametrization-input w-full"
              aria-label="Humedad en porcentaje"
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
              aria-label="Seleccionar tipo de suelo"
            >
              <option value="">Seleccione...</option>
              {soilTypes.map(opt => <option key={opt.id} value={opt.id}>{opt.surface}</option>)}
            </select>
            {errors.soilType && <div className="text-red-600 text-xs mt-1">{errors.soilType}</div>}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Textura</label>
            <select
              value={form.texture}
              onChange={e => handleChange("texture", e.target.value)}
              className="parametrization-input w-full"
              aria-label="Seleccionar textura"
            >
              <option value="">Seleccione...</option>
              {textureTypes.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
            {errors.texture && <div className="text-red-600 text-xs mt-1">{errors.texture}</div>}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Pendiente (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="30"
              value={form.slope}
              onChange={e => handleChange("slope", e.target.value)}
              className="parametrization-input w-full"
              aria-label="Pendiente en porcentaje"
              placeholder="Ej: 5"
            />
            {errors.slope && <div className="text-red-600 text-xs mt-1">{errors.slope}</div>}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">Duración estimada de trabajo (horas)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={form.estimatedHours}
              onChange={e => handleChange("estimatedHours", e.target.value)}
              className="parametrization-input w-full"
              aria-label="Duración estimada de trabajo en horas"
              placeholder="Ej: 2.5"
            />
            {errors.estimatedHours && <div className="text-red-600 text-xs mt-1">{errors.estimatedHours}</div>}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button type="button" onClick={handleClean} className="btn-theme btn-error" aria-label="Limpiar formulario">Limpiar</button>
          <button type="button" onClick={handleSave} className="btn-theme btn-primary" aria-label="Guardar formulario">Guardar</button>
        </div>
      </div>
    </div>
  );
}