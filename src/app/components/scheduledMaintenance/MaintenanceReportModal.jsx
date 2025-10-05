"use client";
import React, { useState, useMemo, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { FiTrash2, FiClock } from "react-icons/fi";
import {
  getActiveTechnicians,
  getMaintenanceTypes,
  getActiveCurrencyUnits,
  getActiveSparePartsBrands,
  createMaintenanceReport,
} from "@/services/maintenanceService";

export default function MaintenanceReportModal({
  isOpen = true,
  onClose = () => {},
  onSave = () => {},
  maintenance = {},
  authToken,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    investedTime: { hours: "", minutes: "", seconds: "" },
    technicians: [],
    performedMaintenances: [],
    spareParts: [],
    recommendations: "",
  });

  // Estados para opciones del API
  const [techniciansOptions, setTechniciansOptions] = useState([]);
  const [maintenanceOptions, setMaintenanceOptions] = useState([]);
  const [brandsOptions, setBrandsOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);

  const [currency, setCurrency] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newMaintenance, setNewMaintenance] = useState({
    maintenance: "",
    technician: "",
    cost: "",
  });

  const [newSparePart, setNewSparePart] = useState({
    name: "",
    brand: "",
    partNumber: "",
    description: "",
    quantity: "",
    unitCost: "",
  });

  // Cargar datos del API al montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [technicians, maintenanceTypes, brands, currencies] = await Promise.all([
          getActiveTechnicians(),
          getMaintenanceTypes(),
          getActiveSparePartsBrands(),
          getActiveCurrencyUnits()
        ]);

        // Mapear técnicos
        setTechniciansOptions(
          technicians.map(tech => ({
            id: tech.id_user || tech.id,
            name: tech.name || `${tech.first_name || ''} ${tech.last_name || ''}`.trim() || tech.username
          }))
        );

        // Mapear tipos de mantenimiento
        setMaintenanceOptions(
          maintenanceTypes.map(type => ({
            id: type.id_types,
            name: type.name
          }))
        );

        // Mapear marcas - CORRECCIÓN: usar data del response
        const brandsData = brands.data || brands;
        setBrandsOptions(
          brandsData.map(brand => ({
            id: brand.id_brands || brand.id_brand,
            name: brand.name
          }))
        );

        // Mapear monedas - CORRECCIÓN: usar data del response
        const currenciesData = currencies.data || currencies;
        setCurrencyOptions(
          currenciesData.map(curr => ({
            id: curr.id_units || curr.id_unit,
            name: curr.name,
            symbol: curr.symbol || curr.name
          }))
        );

        // Establecer moneda por defecto (primera disponible)
        if (currenciesData.length > 0) {
          setCurrency((currenciesData[0].id_units || currenciesData[0].id_unit).toString());
        }

      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("Error al cargar los datos del formulario");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const sparePartsTotalCost = useMemo(() => {
    return form.spareParts.reduce((total, part) => {
      const partTotal =
        parseFloat(part.quantity || 0) * parseFloat(part.unitCost || 0);
      return total + (isNaN(partTotal) ? 0 : partTotal);
    }, 0);
  }, [form.spareParts]);

  const totalMaintenanceCost = useMemo(() => {
    const maintenancesCost = form.performedMaintenances.reduce((total, m) => {
      return total + parseFloat(m.cost || 0);
    }, 0);
    return maintenancesCost + sparePartsTotalCost;
  }, [form.performedMaintenances, sparePartsTotalCost]);

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= 600) {
      setForm({ ...form, description: value });
    }
  };

  const handleTimeChange = (field, value) => {
    const numValue = value.replace(/\D/g, "");
    if (field === "hours") {
      const hours = parseInt(numValue) || 0;
      if (hours > 99) return;
    } else if (field === "minutes" || field === "seconds") {
      const timeValue = parseInt(numValue) || 0;
      if (timeValue > 59) return;
    }
    setForm({
      ...form,
      investedTime: { ...form.investedTime, [field]: numValue },
    });
  };

  const handleTechnicianSelect = (technicianId) => {
    const technician = techniciansOptions.find(
      (t) => t.id === parseInt(technicianId)
    );
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

  const addPerformedMaintenance = () => {
    if (
      !newMaintenance.maintenance ||
      !newMaintenance.technician ||
      !newMaintenance.cost
    ) {
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
      performedMaintenances: form.performedMaintenances.filter(
        (m) => m.id !== id
      ),
    });
  };

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

    const brand = brandsOptions.find(
      (b) => b.id === parseInt(newSparePart.brand)
    );
    if (!brand) {
      setError("Selecciona una marca válida");
      return;
    }

    const sparePart = {
      id: Date.now(),
      name: newSparePart.name,
      brand: brand,
      partNumber: newSparePart.partNumber,
      description: newSparePart.description,
      quantity: parseInt(newSparePart.quantity),
      unitCost: parseFloat(newSparePart.unitCost),
    };

    setForm({
      ...form,
      spareParts: [...form.spareParts, sparePart],
    });

    setNewSparePart({
      name: "",
      brand: "",
      partNumber: "",
      description: "",
      quantity: "",
      unitCost: "",
    });
    setError(null);
  };

  const removeSparePart = (id) => {
    setForm({
      ...form,
      spareParts: form.spareParts.filter((p) => p.id !== id),
    });
  };

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

    if (!currency) {
      setError("Debes seleccionar una unidad de moneda");
      return;
    }

    setSubmitting(true);
    try {
      // Preparar payload según el formato del API
      const payload = {
        title: form.description.substring(0, 100), // Usar primeros 100 caracteres de la descripción como título
        description: form.description.trim(),
        time_invested_hours: parseInt(form.investedTime.hours) || 0,
        time_invested_minutes: parseInt(form.investedTime.minutes) || 0,
        time_invested_seconds: parseInt(form.investedTime.seconds) || 0,
        recommendations: form.recommendations?.trim() || "",
        technicians: form.technicians.map(t => t.id),
        currency_unit: parseInt(currency),
        maintenance_items: form.performedMaintenances.map(m => ({
          id_maintenance: m.maintenance.id,
          id_technician: m.technician.id,
          maintenance_cost: parseFloat(m.cost)
        })),
        spare_parts: form.spareParts.map(p => ({
          name: p.name,
          spare_part_brand: p.brand.id,
          part_number: p.partNumber || "",
          description: p.description || "",
          quantity_used: p.quantity,
          cost_at_time: parseFloat(p.unitCost)
        }))
      };

      // Llamar al endpoint
      const response = await createMaintenanceReport(
        maintenance.id_maintenance_scheduling || maintenance.id,
        payload
      );

      if (response.success) {
        await onSave({
          ...form,
          maintenanceId: maintenance.id_maintenance_scheduling || maintenance.id,
          totalCost: totalMaintenanceCost,
          currency: currencyOptions.find(c => c.id === parseInt(currency))?.symbol || currency,
        });
        onClose();
      } else {
        throw new Error(response.message || "Error al guardar el reporte");
      }
    } catch (err) {
      console.error("Error al guardar reporte:", err);
      
      let errorMessage = "Error al guardar el reporte. Por favor intenta nuevamente.";
      
      if (err.response?.data) {
        const apiError = err.response.data;
        
        if (apiError.message) {
          errorMessage = apiError.message;
        }
        
        if (apiError.details) {
          const detailsArray = Array.isArray(apiError.details) 
            ? apiError.details 
            : Object.values(apiError.details).flat();
          
          if (detailsArray.length > 0) {
            errorMessage += `: ${detailsArray.join(', ')}`;
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  // Obtener información de la maquinaria
  const machineryInfo = {
    serial: maintenance?.machinery_serial || maintenance?.machinery?.serial || "N/A",
    name: maintenance?.machinery_name || maintenance?.machinery?.name || "N/A",
    type: maintenance?.machinery_type || maintenance?.type || "N/A",
    image: maintenance?.machinery_image || maintenance?.machinery?.image || null
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={handleBackdropClick}
      style={{ fontFamily: "var(--font-family)" }}
    >
      <div
        className="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden rounded-lg shadow-xl"
        style={{
          backgroundColor: "var(--color-surface)",
          borderRadius: "var(--border-radius-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4"
          style={{
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <h2
            className="text-lg sm:text-xl font-semibold"
            style={{
              color: "var(--color-text)",
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-semibold)",
            }}
          >
            Reporte de mantenimiento
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1 rounded-lg transition-colors"
            style={{
              color: "var(--color-text-secondary)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--color-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p style={{ color: "var(--color-text-secondary)" }}>Cargando datos...</p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="p-4 sm:p-6 space-y-4 sm:space-y-6"
            >
              {/* Maintenance Information Section */}
              <div>
                <h3
                  className="text-sm sm:text-base font-semibold mb-3 sm:mb-4"
                  style={{
                    color: "var(--color-text)",
                    fontSize: "var(--font-size-base)",
                    fontWeight: "var(--font-weight-semibold)",
                  }}
                >
                  Informacion del mantenimiento
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Left Column - Info Fields */}
                  <div className="lg:col-span-8 space-y-4">
                    {/* ELIMINAR: Campo de título del reporte */}
                    {/* <div>
                      <label
                        className="block text-sm mb-2"
                        style={{
                          color: "var(--color-text-secondary)",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        Título del reporte*
                      </label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Ej: Reporte de mantenimiento preventivo"
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{
                          backgroundColor: "var(--color-input-bg)",
                          border: "1px solid var(--color-border)",
                          color: "var(--color-text)",
                          borderRadius: "var(--border-radius-md)",
                          fontSize: "var(--font-size-sm)",
                        }}
                      />
                    </div> */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          className="block text-sm mb-2"
                          style={{
                            color: "var(--color-text-secondary)",
                            fontSize: "var(--font-size-sm)",
                          }}
                        >
                          Numero de serie
                        </label>
                        <input
                          type="text"
                          value={machineryInfo.serial}
                          readOnly
                          aria-label="Número de serie de la máquina"
                          className="w-full px-3 py-2 rounded-lg text-sm"
                          style={{
                            backgroundColor: "var(--color-background)",
                            border: "1px solid var(--color-border)",
                            color: "var(--color-text)",
                            borderRadius: "var(--border-radius-md)",
                            fontSize: "var(--font-size-sm)",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          className="block text-sm mb-2"
                          style={{
                            color: "var(--color-text-secondary)",
                            fontSize: "var(--font-size-sm)",
                          }}
                        >
                          Nombre de la máquina
                        </label>
                        <input
                          type="text"
                          value={machineryInfo.name}
                          readOnly
                          aria-label="Nombre de la máquina"
                          className="w-full px-3 py-2 rounded-lg text-sm"
                          style={{
                            backgroundColor: "var(--color-background)",
                            border: "1px solid var(--color-border)",
                            color: "var(--color-text)",
                            borderRadius: "var(--border-radius-md)",
                            fontSize: "var(--font-size-sm)",
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          className="block text-sm mb-2"
                          style={{
                            color: "var(--color-text-secondary)",
                            fontSize: "var(--font-size-sm)",
                          }}
                        >
                          Tipo de maquinaria
                        </label>
                        <input
                          type="text"
                          value={machineryInfo.type}
                          readOnly
                          aria-label="Tipo de maquinaria"
                          className="w-full px-3 py-2 rounded-lg text-sm"
                          style={{
                            backgroundColor: "var(--color-background)",
                            border: "1px solid var(--color-border)",
                            color: "var(--color-text)",
                            borderRadius: "var(--border-radius-md)",
                            fontSize: "var(--font-size-sm)",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          className="block text-sm mb-2"
                          style={{
                            color: "var(--color-text-secondary)",
                            fontSize: "var(--font-size-sm)",
                          }}
                        >
                          Tiempo invertido*
                        </label>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <input
                            type="text"
                            value={form.investedTime.hours}
                            onChange={(e) =>
                              handleTimeChange("hours", e.target.value)
                            }
                            placeholder="hh"
                            maxLength="2"
                            aria-label="Horas invertidas"
                            className="w-12 sm:w-16 px-2 sm:px-3 py-2 rounded-lg text-sm text-center"
                            style={{
                              backgroundColor: "var(--color-input-bg)",
                              border: "1px solid var(--color-border)",
                              color: "var(--color-text)",
                              borderRadius: "var(--border-radius-md)",
                              fontSize: "var(--font-size-sm)",
                            }}
                          />
                          <span style={{ color: "var(--color-text-secondary)" }}>
                            :
                          </span>
                          <input
                            type="text"
                            value={form.investedTime.minutes}
                            onChange={(e) =>
                              handleTimeChange("minutes", e.target.value)
                            }
                            placeholder="mm"
                            maxLength="2"
                            aria-label="Minutos invertidos"
                            className="w-12 sm:w-16 px-2 sm:px-3 py-2 rounded-lg text-sm text-center"
                            style={{
                              backgroundColor: "var(--color-input-bg)",
                              border: "1px solid var(--color-border)",
                              color: "var(--color-text)",
                              borderRadius: "var(--border-radius-md)",
                              fontSize: "var(--font-size-sm)",
                            }}
                          />
                          <span style={{ color: "var(--color-text-secondary)" }}>
                            :
                          </span>
                          <input
                            type="text"
                            value={form.investedTime.seconds}
                            onChange={(e) =>
                              handleTimeChange("seconds", e.target.value)
                            }
                            placeholder="ss"
                            maxLength="2"
                            aria-label="Segundos invertidos"
                            className="w-12 sm:w-16 px-2 sm:px-3 py-2 rounded-lg text-sm text-center"
                            style={{
                              backgroundColor: "var(--color-input-bg)",
                              border: "1px solid var(--color-border)",
                              color: "var(--color-text)",
                              borderRadius: "var(--border-radius-md)",
                              fontSize: "var(--font-size-sm)",
                            }}
                          />
                          <FiClock
                            className="w-4 h-4 flex-shrink-0"
                            style={{ color: "var(--color-text-secondary)" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Machine Photo */}
                  <div className="lg:col-span-4 flex items-start justify-center lg:justify-end">
                    <div
                      className="w-full max-w-xs lg:max-w-none h-32 rounded-lg flex items-center justify-center overflow-hidden"
                      style={{
                        backgroundColor: "var(--color-background)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--border-radius-lg)",
                      }}
                    >
                      {machineryInfo.image ? (
                        <img
                          src={machineryInfo.image}
                          alt={machineryInfo.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <span
                          className="text-xs"
                          style={{
                            color: "var(--color-text-secondary)",
                            fontSize: "var(--font-size-xs)",
                          }}
                        >
                          Sin imagen
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Maintenance Description */}
                <div className="mt-4">
                  <label
                    className="block text-sm mb-2"
                    style={{
                      color: "var(--color-text-secondary)",
                      fontSize: "var(--font-size-sm)",
                    }}
                  >
                    Descripción del mantenimiento*
                  </label>
                  <textarea
                    value={form.description}
                    onChange={handleDescriptionChange}
                    placeholder="Describe el mantenimiento realizado..."
                    rows={3}
                    aria-label="Descripción del mantenimiento"
                    className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                    style={{
                      backgroundColor: "var(--color-input-bg)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text)",
                      borderRadius: "var(--border-radius-md)",
                      fontSize: "var(--font-size-sm)",
                    }}
                  />
                  <div
                    className="text-xs mt-1"
                    style={{
                      color: "var(--color-text-secondary)",
                      fontSize: "var(--font-size-xs)",
                    }}
                  >
                    {form.description.length}/600 caracteres
                  </div>
                </div>

                {/* Attending Technicians and Currency Unit */}
                <div className="mt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Attending Technicians */}
                    <div className="lg:col-span-9">
                      <label
                        className="block text-sm mb-2"
                        style={{
                          color: "var(--color-text-secondary)",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        Atendido por (técnicos)*
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          onChange={(e) => handleTechnicianSelect(e.target.value)}
                          value=""
                          aria-label="Seleccionar técnico"
                          className="flex-1 px-3 py-2 rounded-lg text-sm"
                          style={{
                            backgroundColor: "var(--color-input-bg)",
                            border: "1px solid var(--color-border)",
                            color: "var(--color-text)",
                            borderRadius: "var(--border-radius-md)",
                            fontSize: "var(--font-size-sm)",
                          }}
                        >
                          <option value="">Seleccionar técnico</option>
                          {techniciansOptions
                            .filter(
                              (t) =>
                                !form.technicians.find((ft) => ft.id === t.id)
                            )
                            .map((tech) => (
                              <option key={tech.id} value={tech.id}>
                                {tech.name}
                              </option>
                            ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const select = document.querySelector('select[aria-label="Seleccionar técnico"]');
                            if (select.value) {
                              handleTechnicianSelect(select.value);
                            }
                          }}
                          aria-label="Agregar técnico seleccionado"
                          className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm transition-colors"
                          style={{
                            backgroundColor: "var(--color-background)",
                            color: "var(--color-text)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "var(--border-radius-md)",
                            fontSize: "var(--font-size-sm)",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "var(--color-hover)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "var(--color-background)")
                          }
                        >
                          Agregar
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {form.technicians.map((tech) => (
                          <div
                            key={tech.id}
                            className="flex items-center gap-2 px-3 py-1 rounded-lg"
                            style={{
                              backgroundColor: "var(--color-background)",
                              border: "1px solid var(--color-border)",
                              borderRadius: "var(--border-radius-md)",
                            }}
                          >
                            <span
                              className="text-sm"
                              style={{
                                color: "var(--color-text)",
                                fontSize: "var(--font-size-sm)",
                              }}
                            >
                              {tech.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeTechnician(tech.id)}
                              aria-label={`Eliminar técnico ${tech.name}`}
                              style={{ color: "var(--color-error)" }}
                            >
                              <FiTrash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Currency Unit */}
                    <div className="lg:col-span-3">
                      <label
                        className="block text-sm mb-2"
                        style={{
                          color: "var(--color-text-secondary)",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        Unidad de moneda*
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        aria-label="Seleccionar moneda"
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{
                          backgroundColor: "var(--color-input-bg)",
                          border: "1px solid var(--color-border)",
                          color: "var(--color-text)",
                          borderRadius: "var(--border-radius-md)",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        <option value="">Seleccionar moneda</option>
                        {currencyOptions.map((curr) => (
                          <option key={curr.id} value={curr.id}>
                            {curr.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            
              {/* Performed Maintenance Section */}
              <div>
                <h3
                  className="text-base font-semibold mb-4"
                  style={{
                    color: "var(--color-text)",
                    fontSize: "var(--font-size-base)",
                    fontWeight: "var(--font-weight-semibold)",
                  }}
                >
                  Mantenimiento realizado*
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-3">
                  <div className="sm:col-span-3">
                    <select
                      value={newMaintenance.maintenance}
                      onChange={(e) =>
                        setNewMaintenance({
                          ...newMaintenance,
                          maintenance: e.target.value,
                        })
                      }
                      aria-label="Seleccionar tipo de mantenimiento"
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{
                        backgroundColor: "var(--color-input-bg)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text)",
                        borderRadius: "var(--border-radius-md)",
                        fontSize: "var(--font-size-sm)",
                      }}
                    >
                      <option value="">Mantenimiento</option>
                      {maintenanceOptions.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <select
                      value={newMaintenance.technician}
                      onChange={(e) =>
                        setNewMaintenance({
                          ...newMaintenance,
                          technician: e.target.value,
                        })
                      }
                      aria-label="Seleccionar técnico responsable"
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{
                        backgroundColor: "var(--color-input-bg)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text)",
                        borderRadius: "var(--border-radius-md)",
                        fontSize: "var(--font-size-sm)",
                      }}
                      disabled={form.technicians.length === 0}
                    >
                      <option value="">Técnico responsable</option>
                      {form.technicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="number"
                      value={newMaintenance.cost}
                      onChange={(e) =>
                        setNewMaintenance({
                          ...newMaintenance,
                          cost: e.target.value,
                        })
                      }
                      placeholder="0.00"
                      aria-label="Costo del mantenimiento"
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{
                        backgroundColor: "var(--color-input-bg)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text)",
                        borderRadius: "var(--border-radius-md)",
                        fontSize: "var(--font-size-sm)",
                      }}
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={addPerformedMaintenance}
                      aria-label="Agregar mantenimiento realizado"
                      className="w-full px-4 py-2 rounded-lg text-sm transition-colors"
                      style={{
                        backgroundColor: "var(--color-background)",
                        color: "var(--color-text)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--border-radius-md)",
                        fontSize: "var(--font-size-sm)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--color-hover)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--color-background)")
                      }
                    >
                      Agregar
                    </button>
                  </div>
                </div>

                {/* Maintenance Table */}
                {form.performedMaintenances.length > 0 && (
                  <div
                    className="rounded-lg overflow-x-auto"
                    style={{
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--border-radius-lg)",
                    }}
                  >
                    <table className="w-full">
                      <thead
                        style={{
                          backgroundColor: "var(--color-background)",
                          borderBottom: "1px solid var(--color-border)",
                        }}
                      >
                        <tr>
                          <th
                            className="text-left px-4 py-2 text-sm font-medium"
                            style={{
                              color: "var(--color-text)",
                              fontSize: "var(--font-size-sm)",
                              fontWeight: "var(--font-weight-medium)",
                            }}
                          >
                            Mantenimiento
                          </th>
                          <th
                            className="text-left px-4 py-2 text-sm font-medium"
                            style={{
                              color: "var(--color-text)",
                              fontSize: "var(--font-size-sm)",
                              fontWeight: "var(--font-weight-medium)",
                            }}
                          >
                            Técnico
                          </th>
                          <th
                            className="text-left px-4 py-2 text-sm font-medium"
                            style={{
                              color: "var(--color-text)",
                              fontSize: "var(--font-size-sm)",
                              fontWeight: "var(--font-weight-medium)",
                            }}
                          >
                            Costo
                          </th>
                          <th
                            className="text-center px-4 py-2 text-sm font-medium"
                            style={{
                              color: "var(--color-text)",
                              fontSize: "var(--font-size-sm)",
                              fontWeight: "var(--font-weight-medium)",
                            }}
                          >
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.performedMaintenances.map((m) => (
                          <tr
                            key={m.id}
                            style={{ borderTop: "1px solid var(--color-border)" }}
                          >
                            <td
                              className="px-4 py-2 text-sm"
                              style={{
                                color: "var(--color-text)",
                                fontSize: "var(--font-size-sm)",
                              }}
                            >
                              {m.maintenance.name}
                            </td>
                            <td
                              className="px-4 py-2 text-sm"
                              style={{
                                color: "var(--color-text)",
                                fontSize: "var(--font-size-sm)",
                              }}
                            >
                              {m.technician.name}
                            </td>
                            <td
                              className="px-4 py-2 text-sm"
                              style={{
                                color: "var(--color-text)",
                                fontSize: "var(--font-size-sm)",
                              }}
                            >
                              ${m.cost.toFixed(2)} {currencyOptions.find(c => c.id === parseInt(currency))?.symbol || ''}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => removePerformedMaintenance(m.id)}
                                aria-label={`Eliminar mantenimiento ${m.maintenance.name}`}
                                style={{ color: "var(--color-error)" }}
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
                <h3
                  className="text-base font-semibold mb-4"
                  style={{
                    color: "var(--color-text)",
                    fontSize: "var(--font-size-base)",
                    fontWeight: "var(--font-weight-semibold)",
                  }}
                >
                  Repuestos utilizados
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={newSparePart.name}
                      onChange={(e) =>
                        setNewSparePart({ ...newSparePart, name: e.target.value })
                      }
                      placeholder="Nombre del repuesto"
                      aria-label="Nombre del repuesto"
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{
                        backgroundColor: "var(--color-input-bg)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text)",
                        borderRadius: "var(--border-radius-md)",
                        fontSize: "var(--font-size-sm)",
                      }}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <select
                      value={newSparePart.brand}
                      onChange={(e) =>
                        setNewSparePart({
                          ...newSparePart,
                          brand: e.target.value,
                        })
                      }
                      aria-label="Seleccionar marca del repuesto"
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{
                        backgroundColor: "var(--color-input-bg)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text)",
                        borderRadius: "var(--border-radius-md)",
                        fontSize: "var(--font-size-sm)",
                      }}
                    >
                      <option value="">Marca</option>
                      {brandsOptions.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      value={newSparePart.quantity}
                      onChange={(e) =>
                        setNewSparePart({
                          ...newSparePart,
                          quantity: e.target.value,
                        })
                      }
                      placeholder="Cantidad"
                      aria-label="Cantidad del repuesto"
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{
                        backgroundColor: "var(--color-input-bg)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text)",
                        borderRadius: "var(--border-radius-md)",
                        fontSize: "var(--font-size-sm)",
                      }}
                      min="1"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="number"
                      value={newSparePart.unitCost}
                      onChange={(e) =>
                        setNewSparePart({
                          ...newSparePart,
                          unitCost: e.target.value,
                        })
                      }
                      placeholder="0.00"
                      aria-label="Costo unitario del repuesto"
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{
                        backgroundColor: "var(--color-input-bg)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text)",
                        borderRadius: "var(--border-radius-md)",
                        fontSize: "var(--font-size-sm)",
                      }}
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={addSparePart}
                      aria-label="Agregar repuesto"
                      className="w-full px-4 py-2 rounded-lg text-sm transition-colors"
                      style={{
                        backgroundColor: "var(--color-background)",
                        color: "var(--color-text)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--border-radius-md)",
                        fontSize: "var(--font-size-sm)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--color-hover)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--color-background)")
                      }
                    >
                      Agregar
                    </button>
                  </div>
                </div>

                {/* Spare Parts Table */}
                {form.spareParts.length > 0 && (
                  <div
                    className="rounded-lg overflow-x-auto"
                    style={{
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--border-radius-lg)",
                    }}
                  >
                    <table className="w-full">
                      <thead
                        style={{
                          backgroundColor: "var(--color-background)",
                          borderBottom: "1px solid var(--color-border)",
                        }}
                      >
                        <tr>
                          <th
                            className="text-left px-4 py-2 text-sm font-medium"
                            style={{
                              color: "var(--color-text)",
                              fontSize: "var(--font-size-sm)",
                              fontWeight: "var(--font-weight-medium)",
                            }}
                          >
                            Repuesto
                          </th>
                          <th
                            className="text-left px-4 py-2 text-sm font-medium"
                            style={{
                              color: "var(--color-text)",
                              fontSize: "var(--font-size-sm)",
                              fontWeight: "var(--font-weight-medium)",
                            }}
                          >
                            Marca
                          </th>
                          <th
                            className="text-left px-4 py-2 text-sm font-medium"
                            style={{
                              color: "var(--color-text)",
                              fontSize: "var(--font-size-sm)",
                              fontWeight: "var(--font-weight-medium)",
                            }}
                          >
                            Cantidad
                          </th>
                          <th
                            className="text-left px-4 py-2 text-sm font-medium"
                            style={{
                              color: "var(--color-text)",
                              fontSize: "var(--font-size-sm)",
                              fontWeight: "var(--font-weight-medium)",
                            }}
                          >
                            Costo unitario
                          </th>
                          <th
                            className="text-left px-4 py-2 text-sm font-medium"
                            style={{
                              color: "var(--color-text)",
                              fontSize: "var(--font-size-sm)",
                              fontWeight: "var(--font-weight-medium)",
                            }}
                          >
                            Total
                          </th>
                          <th
                            className="text-center px-4 py-2 text-sm font-medium"
                            style={{
                              color: "var(--color-text)",
                              fontSize: "var(--font-size-sm)",
                              fontWeight: "var(--font-weight-medium)",
                            }}
                          >
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.spareParts.map((part) => (
                          <tr
                            key={part.id}
                            style={{ borderTop: "1px solid var(--color-border)" }}
                          >
                            <td
                              className="px-4 py-2 text-sm"
                              style={{
                                color: "var(--color-text)",
                                fontSize: "var(--font-size-sm)",
                              }}
                            >
                              {part.name}
                            </td>
                            <td
                              className="px-4 py-2 text-sm"
                              style={{
                                color: "var(--color-text)",
                                fontSize: "var(--font-size-sm)",
                              }}
                            >
                              {part.brand.name}
                            </td>
                            <td
                              className="px-4 py-2 text-sm"
                              style={{
                                color: "var(--color-text)",
                                fontSize: "var(--font-size-sm)",
                              }}
                            >
                              {part.quantity}
                            </td>
                            <td
                              className="px-4 py-2 text-sm"
                              style={{
                                color: "var(--color-text)",
                                fontSize: "var(--font-size-sm)",
                              }}
                            >
                              ${part.unitCost.toFixed(2)}
                            </td>
                            <td
                              className="px-4 py-2 text-sm"
                              style={{
                                color: "var(--color-text)",
                                fontSize: "var(--font-size-sm)",
                              }}
                            >
                              ${(part.quantity * part.unitCost).toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => removeSparePart(part.id)}
                                aria-label={`Eliminar repuesto ${part.name}`}
                                style={{ color: "var(--color-error)" }}
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        <tr
                          style={{
                            borderTop: "2px solid var(--color-border)",
                            backgroundColor: "var(--color-background)",
                          }}
                        >
                          <td
                            colSpan="4"
                            className="px-4 py-2 text-sm font-medium text-right"
                            style={{
                              color: "var(--color-text)",
                              fontSize: "var(--font-size-sm)",
                              fontWeight: "var(--font-weight-medium)",
                            }}
                          >
                            Costo total:
                          </td>
                          <td
                            className="px-4 py-2 text-sm font-bold"
                            style={{
                              color: "var(--color-text)",
                              fontSize: "var(--font-size-sm)",
                              fontWeight: "var(--font-weight-bold)",
                            }}
                          >
                            ${sparePartsTotalCost.toFixed(2)} {currencyOptions.find(c => c.id === parseInt(currency))?.symbol || ''}
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
                <h3
                  className="text-base font-semibold mb-2"
                  style={{
                    color: "var(--color-text)",
                    fontSize: "var(--font-size-base)",
                    fontWeight: "var(--font-weight-semibold)",
                  }}
                >
                  Recomendaciones
                </h3>
                <textarea
                  value={form.recommendations}
                  onChange={(e) =>
                    setForm({ ...form, recommendations: e.target.value })
                  }
                  placeholder="Ingrese recomendaciones para futuros mantenimientos..."
                  rows={3}
                  aria-label="Recomendaciones para futuros mantenimientos"
                  className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                  style={{
                    backgroundColor: "var(--color-input-bg)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                    borderRadius: "var(--border-radius-md)",
                    fontSize: "var(--font-size-sm)",
                  }}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div
                  className="p-3 rounded-lg text-sm"
                  style={{
                    backgroundColor: "rgba(220, 38, 38, 0.1)",
                    color: "var(--color-error)",
                    border: "1px solid var(--color-error)",
                    borderRadius: "var(--border-radius-md)",
                    fontSize: "var(--font-size-sm)",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Total Cost Section */}
              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: "var(--color-background)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--border-radius-lg)",
                }}
              >
                <div className="flex justify-between items-center">
                  <span
                    className="text-base font-medium"
                    style={{
                      color: "var(--color-text)",
                      fontSize: "var(--font-size-base)",
                      fontWeight: "var(--font-weight-medium)",
                    }}
                  >
                    Costo total de mantenimiento:
                  </span>
                  <span
                    className="text-2xl font-bold"
                    style={{
                      color: "var(--color-text)",
                      fontSize: "var(--font-size-2xl)",
                      fontWeight: "var(--font-weight-bold)",
                    }}
                  >
                    ${totalMaintenanceCost.toFixed(2)} {currencyOptions.find(c => c.id === parseInt(currency))?.symbol || ''}
                  </span>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 sm:px-6 py-4"
          style={{
            borderTop: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <div className="flex justify-center">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={submitting || loading}
              aria-label="Guardar reporte de mantenimiento"
              className="w-full sm:w-auto sm:min-w-[200px] lg:min-w-[180px] px-6 py-2.5 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--color-text)",
                color: "var(--color-surface)",
                borderRadius: "var(--border-radius-md)",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-medium)",
              }}
              onMouseEnter={(e) => {
                if (!submitting && !loading) {
                  e.currentTarget.style.opacity = "0.9";
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting && !loading) {
                  e.currentTarget.style.opacity = "1";
                }
              }}
            >
              {loading ? 'Cargando...' : submitting ? "Guardando reporte..." : "Guardar reporte"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}