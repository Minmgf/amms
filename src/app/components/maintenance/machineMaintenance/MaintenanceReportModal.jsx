"use client";
import React, { useState, useMemo } from "react";
import { IoClose } from "react-icons/io5";
import { FiTrash2, FiClock } from "react-icons/fi";

export default function MaintenanceReportModal({
  isOpen = true,
  onClose = () => {},
  onSave = () => {},
  maintenance = {},
  authToken,
}) {
  // Estado inicial del formulario
  const [form, setForm] = useState({
    description: "",
    investedTime: { hours: "", minutes: "" },
    technicians: [],
    performedMaintenances: [],
    spareParts: [],
    recommendations: "",
  });

  // Estados para las opciones de los selectores
  const [techniciansOptions, setTechniciansOptions] = useState([
    { id: 1, name: "Juan Pérez" },
    { id: 2, name: "María García" },
    { id: 3, name: "Carlos López" },
  ]);

  const [maintenanceOptions, setMaintenanceOptions] = useState([
    { id: 1, name: "Cambio de filtros" },
    { id: 2, name: "Revisión general" },
    { id: 3, name: "Lubricación" },
    { id: 4, name: "Ajuste de piezas" },
  ]);

  const [brandsOptions, setBrandsOptions] = useState([
    { id: 1, name: "Bosch" },
    { id: 2, name: "Siemens" },
    { id: 3, name: "ABB" },
    { id: 4, name: "Schneider" },
  ]);

  const [currency, setCurrency] = useState("USD");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Estado temporal para agregar nuevo mantenimiento realizado
  const [newMaintenance, setNewMaintenance] = useState({
    maintenance: "",
    technician: "",
    cost: "",
  });

  // Estado temporal para agregar nuevo repuesto
  const [newSparePart, setNewSparePart] = useState({
    name: "",
    brand: "",
    quantity: "",
    unitCost: "",
  });

  // Calcular el costo total de repuestos
  const sparePartsTotalCost = useMemo(() => {
    return form.spareParts.reduce((total, part) => {
      const partTotal = parseFloat(part.quantity || 0) * parseFloat(part.unitCost || 0);
      return total + (isNaN(partTotal) ? 0 : partTotal);
    }, 0);
  }, [form.spareParts]);

  // Calcular el costo total del mantenimiento
  const totalMaintenanceCost = useMemo(() => {
    const maintenancesCost = form.performedMaintenances.reduce((total, m) => {
      return total + parseFloat(m.cost || 0);
    }, 0);
    return maintenancesCost + sparePartsTotalCost;
  }, [form.performedMaintenances, sparePartsTotalCost]);

  // Manejadores de cambios
  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= 600) {
      setForm({ ...form, description: value });
    }
  };

  const handleTimeChange = (field, value) => {
    const numValue = value.replace(/\D/g, "");
    
    // Validar rangos
    if (field === "hours") {
      const hours = parseInt(numValue) || 0;
      if (hours > 23) return;
    } else if (field === "minutes") {
      const minutes = parseInt(numValue) || 0;
      if (minutes > 59) return;
    }
    
    setForm({
      ...form,
      investedTime: { ...form.investedTime, [field]: numValue },
    });
  };

  const handleTechnicianSelect = (technicianId) => {
    const technician = techniciansOptions.find((t) => t.id === parseInt(technicianId));
    if (technician && !form.technicians.find((t) => t.id === technician.id)) {
      setForm({ ...form, technicians: [...form.technicians, technician] });
    }
  };

  const removeTechnician = (technicianId) => {
    setForm({
      ...form,
      technicians: form.technicians.filter((t) => t.id !== technicianId),
    });
  };

  // Agregar mantenimiento realizado
  const addPerformedMaintenance = () => {
    if (!newMaintenance.maintenance || !newMaintenance.technician || !newMaintenance.cost) {
      setError("Completa todos los campos del mantenimiento");
      return;
    }

    const maintenance = maintenanceOptions.find(
      (m) => m.id === parseInt(newMaintenance.maintenance)
    );
    const technician = form.technicians.find(
      (t) => t.id === parseInt(newMaintenance.technician)
    );

    if (!maintenance || !technician) {
      setError("Selecciona opciones válidas");
      return;
    }

    const performedMaint = {
      id: Date.now(),
      maintenance: maintenance,
      technician: technician,
      cost: parseFloat(newMaintenance.cost),
    };

    setForm({
      ...form,
      performedMaintenances: [...form.performedMaintenances, performedMaint],
    });

    setNewMaintenance({ maintenance: "", technician: "", cost: "" });
    setError(null);
  };

  const removePerformedMaintenance = (id) => {
    setForm({
      ...form,
      performedMaintenances: form.performedMaintenances.filter((m) => m.id !== id),
    });
  };

  // Agregar repuesto
  const addSparePart = () => {
    if (
      !newSparePart.name ||
      !newSparePart.brand ||
      !newSparePart.quantity ||
      !newSparePart.unitCost
    ) {
      setError("Completa todos los campos del repuesto");
      return;
    }

    const brand = brandsOptions.find((b) => b.id === parseInt(newSparePart.brand));
    if (!brand) {
      setError("Selecciona una marca válida");
      return;
    }

    const sparePart = {
      id: Date.now(),
      name: newSparePart.name,
      brand: brand,
      quantity: parseInt(newSparePart.quantity),
      unitCost: parseFloat(newSparePart.unitCost),
    };

    setForm({
      ...form,
      spareParts: [...form.spareParts, sparePart],
    });

    setNewSparePart({ name: "", brand: "", quantity: "", unitCost: "" });
    setError(null);
  };

  const removeSparePart = (id) => {
    setForm({
      ...form,
      spareParts: form.spareParts.filter((p) => p.id !== id),
    });
  };

  // Manejo del envío
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!form.description.trim()) {
      setError("La descripción del mantenimiento es obligatoria");
      return;
    }

    if (!form.investedTime.hours && !form.investedTime.minutes) {
      setError("Debes ingresar el tiempo invertido");
      return;
    }

    if (form.technicians.length === 0) {
      setError("Debes seleccionar al menos un técnico");
      return;
    }

    if (form.performedMaintenances.length === 0) {
      setError("Debes agregar al menos un mantenimiento realizado");
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        ...form,
        maintenanceId: maintenance?.id_maintenance,
        totalCost: totalMaintenanceCost,
        currency: currency,
      });
      onClose();
    } catch (err) {
      setError("Error al guardar el reporte. Por favor intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Reporte de mantenimiento</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <IoClose className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Maintenance Information Section */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Información del mantenimiento
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column - Info Fields */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Número de serie
                      </label>
                      <input
                        type="text"
                        value="EXC-2024-0012"
                        readOnly
                        aria-label="Número de serie de la máquina"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Nombre de la máquina
                      </label>
                      <input
                        type="text"
                        value="Excavadora Caterpillar 320D"
                        readOnly
                        aria-label="Nombre de la máquina"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Tipo de maquinaria
                      </label>
                      <input
                        type="text"
                        value="Bulldozer"
                        readOnly
                        aria-label="Tipo de maquinaria"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Tiempo invertido
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={form.investedTime.hours}
                          onChange={(e) => handleTimeChange("hours", e.target.value)}
                          placeholder="hh"
                          maxLength="2"
                          aria-label="Horas invertidas"
                          className="w-16 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-400">:</span>
                        <input
                          type="text"
                          value={form.investedTime.minutes}
                          onChange={(e) => handleTimeChange("minutes", e.target.value)}
                          placeholder="mm"
                          maxLength="2"
                          aria-label="Minutos invertidos"
                          className="w-16 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <FiClock className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Machine Photo */}
                <div className="flex justify-center lg:justify-end">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-500">Foto de la máquina</span>
                  </div>
                </div>
              </div>

              {/* Maintenance Description */}
              <div className="mt-4">
                <label className="block text-sm text-gray-600 mb-1">
                  Descripción del mantenimiento
                </label>
                <textarea
                  value={form.description}
                  onChange={handleDescriptionChange}
                  placeholder="Describe el mantenimiento realizado..."
                  rows={3}
                  aria-label="Descripción del mantenimiento"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <div className="text-xs text-gray-400 mt-1">
                  {form.description.length}/600 caracteres
                </div>
              </div>

              {/* Attending Technicians */}
              <div className="mt-4">
                <label className="block text-sm text-gray-600 mb-2">
                  Técnicos asistentes
                </label>
                <div className="flex gap-2">
                  <select
                    onChange={(e) => handleTechnicianSelect(e.target.value)}
                    value=""
                    aria-label="Seleccionar técnico"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar un técnico</option>
                    {techniciansOptions
                      .filter((t) => !form.technicians.find((ft) => ft.id === t.id))
                      .map((tech) => (
                        <option key={tech.id} value={tech.id}>
                          {tech.name}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    aria-label="Agregar técnico seleccionado"
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    Agregar
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.technicians.map((tech) => (
                    <div
                      key={tech.id}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg"
                    >
                      <span className="text-sm text-gray-700">{tech.name}</span>
                      <button
                        type="button"
                        onClick={() => removeTechnician(tech.id)}
                        aria-label={`Eliminar técnico ${tech.name}`}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performed Maintenance Section */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Mantenimientos realizados
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
                <select
                  value={newMaintenance.maintenance}
                  onChange={(e) =>
                    setNewMaintenance({ ...newMaintenance, maintenance: e.target.value })
                  }
                  aria-label="Seleccionar tipo de mantenimiento"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Mantenimiento</option>
                  {maintenanceOptions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <select
                  value={newMaintenance.technician}
                  onChange={(e) =>
                    setNewMaintenance({ ...newMaintenance, technician: e.target.value })
                  }
                  aria-label="Seleccionar técnico responsable"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={form.technicians.length === 0}
                >
                  <option value="">Técnico responsable</option>
                  {form.technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={newMaintenance.cost}
                    onChange={(e) =>
                      setNewMaintenance({ ...newMaintenance, cost: e.target.value })
                    }
                    placeholder="0.00"
                    aria-label="Costo del mantenimiento"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                    min="0"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    aria-label="Seleccionar moneda"
                    className="px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="COP">COP</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={addPerformedMaintenance}
                  aria-label="Agregar mantenimiento realizado"
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
                >
                  Agregar
                </button>
              </div>

              {/* Maintenance Table */}
              {form.performedMaintenances.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">
                          Mantenimiento
                        </th>
                        <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">
                          Técnico
                        </th>
                        <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">
                          Costo
                        </th>
                        <th className="text-center px-4 py-2 text-sm font-medium text-gray-700">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.performedMaintenances.map((m) => (
                        <tr key={m.id} className="border-t border-gray-200">
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {m.maintenance.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {m.technician.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            ${m.cost.toFixed(2)} {currency}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removePerformedMaintenance(m.id)}
                              aria-label={`Eliminar mantenimiento ${m.maintenance.name}`}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Spare Parts Section */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Repuestos utilizados
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-3">
                <input
                  type="text"
                  value={newSparePart.name}
                  onChange={(e) =>
                    setNewSparePart({ ...newSparePart, name: e.target.value })
                  }
                  placeholder="Nombre del repuesto"
                  aria-label="Nombre del repuesto"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newSparePart.brand}
                  onChange={(e) =>
                    setNewSparePart({ ...newSparePart, brand: e.target.value })
                  }
                  aria-label="Seleccionar marca del repuesto"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Marca</option>
                  {brandsOptions.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={newSparePart.quantity}
                  onChange={(e) =>
                    setNewSparePart({ ...newSparePart, quantity: e.target.value })
                  }
                  placeholder="Cantidad"
                  aria-label="Cantidad del repuesto"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={newSparePart.unitCost}
                    onChange={(e) =>
                      setNewSparePart({ ...newSparePart, unitCost: e.target.value })
                    }
                    placeholder="0.00"
                    aria-label="Costo unitario del repuesto"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                    min="0"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    aria-label="Seleccionar moneda"
                    className="px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="COP">COP</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={addSparePart}
                  aria-label="Agregar repuesto"
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
                >
                  Agregar
                </button>
              </div>

              {/* Spare Parts Table */}
              {form.spareParts.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">
                          Repuesto
                        </th>
                        <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">
                          Marca
                        </th>
                        <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">
                          Cantidad
                        </th>
                        <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">
                          Costo unitario
                        </th>
                        <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">
                          Total
                        </th>
                        <th className="text-center px-4 py-2 text-sm font-medium text-gray-700">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.spareParts.map((part) => (
                        <tr key={part.id} className="border-t border-gray-200">
                          <td className="px-4 py-2 text-sm text-gray-900">{part.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {part.brand.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{part.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            ${part.unitCost.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            ${(part.quantity * part.unitCost).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeSparePart(part.id)}
                              aria-label={`Eliminar repuesto ${part.name}`}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-gray-300 bg-gray-50">
                        <td colSpan="4" className="px-4 py-2 text-sm font-medium text-gray-700 text-right">
                          Costo Total:
                        </td>
                        <td className="px-4 py-2 text-sm font-bold text-gray-900">
                          ${sparePartsTotalCost.toFixed(2)} {currency}
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recommendations Section */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                Recomendaciones
              </h3>
              <textarea
                value={form.recommendations}
                onChange={(e) => setForm({ ...form, recommendations: e.target.value })}
                placeholder="Ingresa recomendaciones para futuros mantenimientos..."
                rows={3}
                aria-label="Recomendaciones para futuros mantenimientos"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Total Cost Section */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-base font-medium text-gray-700">
                  Costo Total del Mantenimiento:
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  ${totalMaintenanceCost.toFixed(2)} {currency}
                </span>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-white">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting}
            aria-label="Guardar reporte de mantenimiento"
            className="w-full py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Guardando reporte..." : "Guardar reporte"}
          </button>
        </div>
      </div>
    </div>
  );
}