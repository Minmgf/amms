"use client";
import React, { useState, useEffect, useMemo } from "react";
import { FiX, FiTrash2, FiClock } from "react-icons/fi";

export default function MaintenanceReportModal({
  isOpen,
  onClose,
  onSave,
  maintenance,
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

    // Limpiar el formulario temporal
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

    // Limpiar el formulario temporal
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
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      id="maintenance-report-modal"
    >
      <div
        className="bg-background rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-primary">Maintenance report</h2>
          <button
            aria-label="Close report modal"
            onClick={onClose}
            className="p-2 hover:bg-hover rounded-full transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-180px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Maintenance Information */}
            <div>
              <h3 className="text-lg font-semibold text-text mb-4">
                Maintenance information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">
                      Serial number
                    </label>
                    <p className="font-medium text-text">
                      {maintenance?.serial || "EXC-2024-0012"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">
                      Machine name
                    </label>
                    <p className="font-medium text-text">
                      {maintenance?.machineName || "Excavadora Caterpillar 320D"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">
                      Machinery type
                    </label>
                    <p className="font-medium text-text">
                      {maintenance?.type || "Bulldozer"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">
                      Invested time
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={form.investedTime.hours}
                        onChange={(e) => handleTimeChange("hours", e.target.value)}
                        placeholder="hh"
                        maxLength="2"
                        className="w-16 px-2 py-1 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Hours"
                      />
                      <span className="text-text-secondary">:</span>
                      <input
                        type="text"
                        value={form.investedTime.minutes}
                        onChange={(e) => handleTimeChange("minutes", e.target.value)}
                        placeholder="mm"
                        maxLength="2"
                        className="w-16 px-2 py-1 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Minutes"
                      />
                      <FiClock className="w-4 h-4 text-text-secondary" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-32 h-32 bg-surface rounded-lg flex items-center justify-center text-text-secondary">
                    <span className="text-sm">Machine photo here</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Maintenance Description */}
            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Maintenance description
              </label>
              <textarea
                value={form.description}
                onChange={handleDescriptionChange}
                placeholder="Describe the maintenance performed..."
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                aria-label="Maintenance description"
              />
              <div className="text-xs text-text-secondary mt-1">
                {form.description.length}/600 characters
              </div>
            </div>

            {/* Attending Technicians */}
            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Attending technicians
              </label>
              <div className="flex gap-2 items-start">
                <select
                  onChange={(e) => handleTechnicianSelect(e.target.value)}
                  value=""
                  className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Select technician"
                >
                  <option value="">Select a technician</option>
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
                  onClick={() => {}}
                  className="px-4 py-2 bg-surface text-text-secondary border border-border rounded-md hover:bg-hover"
                  aria-label="Add technician"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {form.technicians.map((tech) => (
                  <div
                    key={tech.id}
                    className="flex items-center gap-2 px-3 py-1 bg-surface rounded-md border border-border"
                  >
                    <span className="text-sm text-text">{tech.name}</span>
                    <button
                      type="button"
                      onClick={() => removeTechnician(tech.id)}
                      className="text-error hover:text-error/80"
                      aria-label={`Remove ${tech.name}`}
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Performed Maintenance */}
            <div>
              <h3 className="text-lg font-semibold text-text mb-4">
                Performed maintenance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                <select
                  value={newMaintenance.maintenance}
                  onChange={(e) =>
                    setNewMaintenance({ ...newMaintenance, maintenance: e.target.value })
                  }
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Select maintenance type"
                >
                  <option value="">Maintenance</option>
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
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Select responsible technician"
                  disabled={form.technicians.length === 0}
                >
                  <option value="">Responsible Technician</option>
                  {form.technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={newMaintenance.cost}
                    onChange={(e) =>
                      setNewMaintenance({ ...newMaintenance, cost: e.target.value })
                    }
                    placeholder="0.00"
                    className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Maintenance cost"
                    step="0.01"
                    min="0"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="px-2 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Currency"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="COP">COP</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={addPerformedMaintenance}
                  className="px-4 py-2 bg-surface text-text-secondary border border-border rounded-md hover:bg-hover"
                  aria-label="Add maintenance"
                >
                  Add
                </button>
              </div>

              {/* Maintenance List */}
              {form.performedMaintenances.length > 0 && (
                <div className="border border-border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-surface">
                      <tr>
                        <th className="text-left px-4 py-2 text-sm font-medium text-text">
                          Maintenance
                        </th>
                        <th className="text-left px-4 py-2 text-sm font-medium text-text">
                          Technician
                        </th>
                        <th className="text-left px-4 py-2 text-sm font-medium text-text">
                          Cost
                        </th>
                        <th className="text-left px-4 py-2 text-sm font-medium text-text">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.performedMaintenances.map((m) => (
                        <tr key={m.id} className="border-t border-border">
                          <td className="px-4 py-2 text-sm text-text">
                            {m.maintenance.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-text">
                            {m.technician.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-text">
                            ${m.cost.toFixed(2)} {currency}
                          </td>
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              onClick={() => removePerformedMaintenance(m.id)}
                              className="text-error hover:text-error/80"
                              aria-label="Remove maintenance"
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

            {/* Spare Parts Used */}
            <div>
              <h3 className="text-lg font-semibold text-text mb-4">Spare parts used</h3>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
                <input
                  type="text"
                  value={newSparePart.name}
                  onChange={(e) =>
                    setNewSparePart({ ...newSparePart, name: e.target.value })
                  }
                  placeholder="Spare part name"
                  className="md:col-span-2 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Spare part name"
                />
                <select
                  value={newSparePart.brand}
                  onChange={(e) =>
                    setNewSparePart({ ...newSparePart, brand: e.target.value })
                  }
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Select brand"
                >
                  <option value="">Brand</option>
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
                  placeholder="Quantity"
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Quantity"
                  min="1"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={newSparePart.unitCost}
                    onChange={(e) =>
                      setNewSparePart({ ...newSparePart, unitCost: e.target.value })
                    }
                    placeholder="0.00"
                    className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Unit cost"
                    step="0.01"
                    min="0"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="px-2 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Currency"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="COP">COP</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={addSparePart}
                  className="px-4 py-2 bg-surface text-text-secondary border border-border rounded-md hover:bg-hover"
                  aria-label="Add spare part"
                >
                  Add
                </button>
              </div>

              {/* Spare Parts List */}
              {form.spareParts.length > 0 && (
                <div className="border border-border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-surface">
                      <tr>
                        <th className="text-left px-4 py-2 text-sm font-medium text-text">
                          Spare part
                        </th>
                        <th className="text-left px-4 py-2 text-sm font-medium text-text">
                          Brand
                        </th>
                        <th className="text-left px-4 py-2 text-sm font-medium text-text">
                          Quantity
                        </th>
                        <th className="text-left px-4 py-2 text-sm font-medium text-text">
                          Unit cost
                        </th>
                        <th className="text-left px-4 py-2 text-sm font-medium text-text">
                          Total
                        </th>
                        <th className="text-left px-4 py-2 text-sm font-medium text-text">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.spareParts.map((part) => (
                        <tr key={part.id} className="border-t border-border">
                          <td className="px-4 py-2 text-sm text-text">{part.name}</td>
                          <td className="px-4 py-2 text-sm text-text">
                            {part.brand.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-text">{part.quantity}</td>
                          <td className="px-4 py-2 text-sm text-text">
                            ${part.unitCost.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-sm text-text">
                            ${(part.quantity * part.unitCost).toFixed(2)}
                          </td>
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              onClick={() => removeSparePart(part.id)}
                              className="text-error hover:text-error/80"
                              aria-label="Remove spare part"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-border bg-surface">
                        <td colSpan="4" className="px-4 py-2 text-sm font-medium text-text text-right">
                          Total Cost:
                        </td>
                        <td className="px-4 py-2 text-sm font-bold text-text">
                          ${sparePartsTotalCost.toFixed(2)} {currency}
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-lg font-semibold text-text mb-2">Recommendations</h3>
              <textarea
                value={form.recommendations}
                onChange={(e) => setForm({ ...form, recommendations: e.target.value })}
                placeholder="Enter recommendations for future maintenance..."
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                aria-label="Recommendations"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-error/10 text-error border border-error/20 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Total Maintenance Cost */}
            <div className="p-4 bg-surface rounded-lg border border-border">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-text">
                  Total Maintenance Cost:
                </span>
                <span className="text-2xl font-bold text-primary">
                  ${totalMaintenanceCost.toFixed(2)} {currency}
                </span>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-surface">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Save maintenance report"
          >
            {submitting ? "Saving report..." : "Save report"}
          </button>
        </div>
      </div>
    </div>
  );
}