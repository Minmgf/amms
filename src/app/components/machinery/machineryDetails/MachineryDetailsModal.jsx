"use client";

import React, { useEffect, useState } from "react";
import { FaTimes, FaTools } from "react-icons/fa";
import { FiChevronDown, FiDownload, FiFileText, FiX } from "react-icons/fi";
import {
  getGeneralData,
  getMachineryType,
  getMachinerySecondaryType,
  getMachineryBrands,
  getModelsByBrandId,
  getMachineryStatus,
  getUsageInfo,
  getTrackerInfo,
  getSpecificTechnicalSheet,
  getMachineryDocs,
  getPeriodicMaintenance,
} from "@/services/machineryService";
import { getMachineryTracker } from "@/services/machineryService";

import { getCountries, getStates, getCities } from "@/services/locationService";

export default function MachineryDetailsModal({
  isOpen,
  onClose,
  selectedMachine,
  formatDate,
}) {
  // Desktop tabs
  const [activeTab, setActiveTab] = useState("general");
  // Mobile accordions
  const [accTrackerOpen, setAccTrackerOpen] = useState(true);
  const [accUsageOpen, setAccUsageOpen] = useState(true);
  const [accSpecificOpen, setAccSpecificOpen] = useState(false);

  const [generalData, setGeneralData] = useState({});
  const [generalDataLoading, setGeneralDataLoading] = useState(false);
  const [generalDataError, setGeneralDataError] = useState(null);

  // Machinery data from getMachineryType
  const [machineryTypeData, setMachineryTypeData] = useState({});

  // Extra data
  const [typeName, setTypeName] = useState("");
  const [secondaryTypeName, setSecondaryTypeName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [modelName, setModelName] = useState("");
  const [statusName, setStatusName] = useState("");
  const [photoUrl, setPhotoUrl] = useState(null);
  const [cityName, setCityName] = useState("");
  const [cityOriginName, setCityOriginName] = useState("");
  const [manufactureYear, setManufactureYear] = useState("");
  const [tariffSubheading, setTariffSubheading] = useState("");
  const [usageInfo, setUsageInfo] = useState(null);
  const [trackerInfo, setTrackerInfo] = useState(null);
  const [specificSheet, setSpecificSheet] = useState(null);
  const [specificSheetLoading, setSpecificSheetLoading] = useState(false); // Added loading state
  const [specificSheetError, setSpecificSheetError] = useState(null); // Error state
  const [docs, setDocs] = useState([]);
  const [periodicMaintenances, setPeriodicMaintenances] = useState([]);

  useEffect(() => {
    if (!selectedMachine) return;

    // Datos generales
    getGeneralData(selectedMachine.id_machinery)
      .then((data) => {
        setGeneralData(data);
      })
      .catch((error) => {
        console.error("Error en getGeneralData:", error);
      });

    // Tipo principal
    getMachineryType(selectedMachine.id_machinery)
      .then((data) => {
        const found = data?.find(
          (t) => t.id === selectedMachine.machinery_type
        );
        setTypeName(found?.name || "");
      })
      .catch((error) => {
        console.error("Error en getMachineryType:", error);
      });

    // Tipo secundario
    getMachinerySecondaryType(selectedMachine.id_machinery)
      .then((data) => {
        const found = data?.find(
          (t) => t.id === selectedMachine.machinery_secondary_type
        );
        setSecondaryTypeName(found?.name || "");
      })
      .catch((error) => {
        console.error("Error en getMachinerySecondaryType:", error);
      });

    // Estado operacional
    getMachineryStatus(selectedMachine.id_machinery)
      .then((data) => {
        const found = data?.find(
          (s) => s.id === selectedMachine.machinery_operational_status
        );
        setStatusName(found?.name || "");
      })
      .catch((error) => {
        console.error("Error en getMachineryStatus:", error);
      });

    // Informacion de uso
    getUsageInfo(selectedMachine.id_machinery)
      .then((res) => {
        setUsageInfo(res || null);
      })
      .catch((error) => {
        console.error("Error en getUsageInfo:", error);
      });

    // Informacion de tracker
    getTrackerInfo(selectedMachine.id_machinery)
      .then((res) => {
        setTrackerInfo(res || null);
      })
      .catch((error) => {
        console.error("Error en getTrackerInfo:", error);
      });

    // Documentos
    getMachineryDocs(selectedMachine.id_machinery)
      .then((res) => {
        setDocs(Array.isArray(res?.data) ? res.data : []);
      })
      .catch((error) => {
        console.error("Error en getMachineryDocs:", error);
      });

    // Mantenimientos periodicos
    getPeriodicMaintenance(selectedMachine.id_machinery)
      .then((res) => {
        setPeriodicMaintenances(Array.isArray(res) ? res : []);
      })
      .catch(() => setPeriodicMaintenances([]));

    // Ficha tecnica especifica
    getSpecificTechnicalSheet(selectedMachine.id_machinery)
      .then((res) => {
        setSpecificSheet(res || null);
      })
      .catch(() => setSpecificSheet(null));
  }, [selectedMachine]);

  // ciudad origen
  useEffect(() => {
    if (!generalData?.id_country || !generalData?.id_department || !generalData?.id_city) return;
    
    const fetchCityName = async () => {
      try {

        const countries = await getCountries();
        const country = countries.find(c => c.iso2 === generalData.id_country);
        
        if (!country) {
          setCityOriginName(`${generalData.id_country} - Desconocido`);
          return;
        }

        const states = await getStates(generalData.id_country);
        const state = states.find(s => s.iso2 === generalData.id_department);
        
        if (!state) {
          setCityOriginName(`${country.name} - ${generalData.id_department}`);
          return;
        }
        const cities = await getCities(generalData.id_country, generalData.id_department);
        const city = cities.find(c => c.id === generalData.id_city);
        
        if (city) {
          setCityOriginName(`${city.name}, ${state.name}, ${country.name}`);
        } else {
          setCityOriginName(`Ciudad ID: ${generalData.id_city}, ${state.name}, ${country.name}`);
        }

      } catch (error) {
        setCityOriginName(`${generalData.id_country} - Error al cargar`);
      }
    };

    fetchCityName();
  }, [generalData]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      id="Machinery Details Modal"
    >
      <div className="modal-theme rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-primary">
            Detalle de Maquinaria
          </h2>
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            onClick={onClose}
            aria-label="Close machinery details modal"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ============== DESKTOP ============== */}
        <div className="hidden md:block p-6">
          {/* --- TABS --- */}
          <div className="flex justify-center border-b border-primary mb-6">
            {["general", "tech", "docs"].map((key, idx) => {
              const labels = [
                "Ficha General",
                "Especificaciones Técnicas",
                "Documentos y Mantenimiento",
              ];
              const label = labels[idx];
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  type="button"
                  aria-label={`Show ${label} tab`}
                  className={`w-40 px-4 py-2 -mb-px border-b-2 text-sm font-medium
        whitespace-normal text-center leading-snug cursor-pointer
        ${
          activeTab === key
            ? "border-secondary text-secondary"
            : "border-transparent text-gray-500"
        }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* === Ficha General (DESKTOP) === */}
          {activeTab === "general" && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-fit rounded-md flex items-center justify-center overflow-hidden bg-gray-200">
                  {generalData.image_path ? (
                    <img
                      src={generalData.image_path}
                      alt="Machinery photo"
                      className="object-contain w-full h-full"
                      aria-label="Machinery photo"
                    />
                  ) : (
                    <span className="text-secondary min-h-[150px] flex items-center">
                      Ingresa una imagen
                    </span>
                  )}
                </div>

                <div className="border rounded-xl p-4 border-secondary">
                  <h3 className="font-semibold text-lg mb-3 text-primary">
                    Datos Generales
                  </h3>
                  <div className="flex flex-col gap-3">
                    <Row
                      label="Número de serie"
                      value={generalData.serial_number}
                    />
                    <Row label="Nombre" value={generalData.machinery_name} />
                    <Row label="Marca" value={generalData.brand_name} />
                    <Row label="Modelo" value={generalData.model_name} />
                    <Row
                      label="Año fabricación"
                      value={generalData.manufacturing_year}
                    />
                    <Row label="Tipo" value={typeName} />
                    <Row label="Tipo secundario" value={secondaryTypeName} />
                    <Row label="Ciudad origen" value={cityOriginName || "—"} />
                    <Row
                      label="Subpartida arancelaria"
                      value={generalData.tariff_subheading}
                    />
                    <Row label="Estado operacional" value={statusName} />
                  </div>
                </div>
              </div>
              {/* Mapa y badges */}
              <div className="mt-8">
                <h3 className="font-semibold text-lg mb-2">Ubicación GPS</h3>
                <div className="border border-primary rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-medium text-emerald-700">
                        ACTIVO
                      </span>
                    </span>
                    <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 px-3 py-1.5 text-xs font-medium">
                      {selectedMachine?.id_city || "Bogotá, Colombia"}
                    </span>
                  </div>
                  <div className="w-full h-56 md:h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">Mapa aquí</span>
                  </div>
                </div>
              </div>

              {/* Tracker Data Sheet y Usage Information */}
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="border rounded-xl p-4 border-primary">
                  <h4 className="font-semibold mb-3 text-primary">
                    Datos del Rastreador
                  </h4>
                  <div className="flex flex-col gap-3">
                    <Row
                      label="Número de serie terminal"
                      value={trackerInfo?.terminal_serial_number || "—"}
                    />
                    <Row
                      label="Número de serie GPS"
                      value={trackerInfo?.gps_serial_number || "—"}
                    />
                    <Row
                      label="Número de chasis"
                      value={trackerInfo?.chassis_number || "—"}
                    />
                    <Row
                      label="Número de motor"
                      value={trackerInfo?.engine_number || "—"}
                    />
                  </div>
                </div>
                <div className="border rounded-xl p-4 border-primary">
                  <h4 className="font-semibold mb-3 text-primary">
                    Información de Uso
                  </h4>
                  <div className="flex flex-col gap-3">
                    <Row
                      label="Fecha de adquisición"
                      value={formatDate?.(usageInfo?.acquisition_date) || "—"}
                    />
                    <Row
                      label="Estado de uso"
                      value={usageInfo?.usage_condition || "—"}
                    />
                    <Row
                      label="Horas usadas"
                      value={
                        usageInfo?.usage_hours
                          ? `${usageInfo.usage_hours} hrs`
                          : "—"
                      }
                    />
                    <Row
                      label="Kilometraje"
                      value={
                        usageInfo?.distance_value
                          ? `${usageInfo.distance_value} km`
                          : "—"
                      }
                    />
                    <Row
                      label="Tenencia"
                      value={
                        usageInfo?.tenancy_type ||
                        (usageInfo?.is_own ? "Propia" : "—")
                      }
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* === Especificaciones Técnicas (DESKTOP) === */}
          {activeTab === "tech" && specificSheet && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Capacidad y Rendimiento */}
              <div className="border rounded-xl p-4 border-primary mb-6">
                <h3 className="font-semibold text-lg mb-3 text-primary">
                  Capacidad y Rendimiento
                </h3>
                <div className="flex flex-col gap-3">
                  <Row
                    label="Capacidad del tanque"
                    value={specificSheet?.fuel_capacity ?? "—"}
                    unit={specificSheet?.fuel_capacity_unit_name}
                  />
                  <Row
                    label="Capacidad de carga"
                    value={specificSheet?.carrying_capacity ?? "—"}
                    unit={specificSheet?.carrying_capacity_unit_name}
                  />
                  <Row
                    label="Peso operativo"
                    value={specificSheet?.operating_weight ?? "—"}
                    unit={specificSheet?.operating_weight_unit_name}
                  />
                  <Row
                    label="Velocidad máxima"
                    value={specificSheet?.max_speed ?? "—"}
                    unit={specificSheet?.max_speed_unit_name}
                  />
                  <Row
                    label="Fuerza de tiro"
                    value={specificSheet?.draft_force ?? "—"}
                    unit={specificSheet?.draft_force_unit_name}
                  />
                  <Row
                    label="Altura máxima de operación"
                    value={specificSheet?.maximum_altitude ?? "—"}
                    unit={specificSheet?.maximum_altitude_unit_name}
                  />
                  <Row
                    label="Rendimiento mínimo"
                    value={specificSheet?.minimum_performance ?? "—"}
                    unit={specificSheet?.performance_unit_name}
                  />
                  <Row
                    label="Rendimiento máximo"
                    value={specificSheet?.maximum_performance ?? "—"}
                    unit={specificSheet?.performance_unit_name}
                  />
                </div>
              </div>

              {/* Motor y Transmisión */}
              <div className="border rounded-xl p-4 border-primary mb-6">
                <h3 className="font-semibold text-lg mb-3 text-primary">
                  Motor y Transmisión
                </h3>
                <div className="flex flex-col gap-3">
                  <Row
                    label="Potencia"
                    value={specificSheet?.power ?? "—"}
                    unit={specificSheet?.power_unit_name}
                  />
                  <Row
                    label="Tipo de motor"
                    value={
                      specificSheet?.engine_type_name ??
                      specificSheet?.engine_type ??
                      "—"
                    }
                  />
                  <Row
                    label="Cilindrada"
                    value={specificSheet?.cylinder_capacity ?? "—"}
                    unit={specificSheet?.cylinder_capacity_unit_name}
                  />
                  <Row
                    label="Tipo de arreglo de cilindros"
                    value={
                      specificSheet?.cylinder_arrangement_type_name ??
                      specificSheet?.cylinder_arrangement_type ??
                      "—"
                    }
                  />
                  <Row
                    label="Cantidad de cilindros"
                    value={specificSheet?.cylinder_count ?? "—"}
                  />
                  <Row
                    label="Tipo de tracción"
                    value={
                      specificSheet?.traction_type_name ??
                      specificSheet?.traction_type ??
                      "—"
                    }
                  />
                  <Row
                    label="Consumo de combustible"
                    value={specificSheet?.fuel_consumption ?? "—"}
                    unit={specificSheet?.fuel_consumption_unit_name}
                  />
                  <Row
                    label="Tipo de sistema de transmisión"
                    value={
                      specificSheet?.transmission_system_type_name ??
                      specificSheet?.transmission_system_type ??
                      "—"
                    }
                  />
                </div>
              </div>

              {/* Sistema Hidráulico y Otros */}
              <div className="border rounded-xl p-4 border-primary mb-6">
                <h3 className="font-semibold text-lg mb-3 text-primary">
                  Sistema Hidráulico y Otros
                </h3>
                <div className="flex flex-col gap-3">
                  <Row
                    label="Presión máxima de trabajo"
                    value={specificSheet?.maximum_working_pressure ?? "—"}
                    unit={specificSheet?.maximum_working_pressure_unit_name}
                  />
                  <Row
                    label="Caudal de bomba"
                    value={specificSheet?.pump_flow ?? "—"}
                    unit={specificSheet?.pump_flow_unit_name}
                  />
                  <Row
                    label="Capacidad del tanque hidráulico"
                    value={specificSheet?.hydraulic_tank_capacity ?? "—"}
                    unit={specificSheet?.hydraulic_tank_capacity_unit_name}
                  />
                </div>
              </div>

              {/* Cabina, Emisiones y Aire Acondicionado */}
              <div className="border rounded-xl p-4 border-primary mb-6">
                <h3 className="font-semibold text-lg mb-3 text-primary">
                  Cabina, Emisiones y Aire Acondicionado
                </h3>
                <div className="flex flex-col gap-3">
                  <Row
                    label="Tipo de cabina"
                    value={
                      specificSheet?.cabin_type_name ??
                      specificSheet?.cabin_type ??
                      "—"
                    }
                  />
                  <Row
                    label="Nivel de emisión"
                    value={
                      specificSheet?.emission_level_type_name ??
                      specificSheet?.emission_level_type ??
                      "—"
                    }
                  />
                  <Row
                    label="Tipo de aire acondicionado"
                    value={
                      specificSheet?.air_conditioning_system_type_name ??
                      specificSheet?.air_conditioning_system_type ??
                      "—"
                    }
                  />
                  <Row
                    label="Consumo aire acondicionado"
                    value={
                      specificSheet?.air_conditioning_system_consumption ?? "—"
                    }
                    unit={
                      specificSheet?.air_conditioning_system_consumption_unit_name
                    }
                  />
                </div>
              </div>

              {/* Otros */}
              <div className="border rounded-xl p-4 border-primary mb-6">
                <h3 className="font-semibold text-lg mb-3 text-primary">
                  Otros
                </h3>
                <div className="flex flex-col gap-3">
                  <Row
                    label="Ancho"
                    value={specificSheet?.width ?? "—"}
                    unit={specificSheet?.dimension_unit_name}
                  />
                  <Row
                    label="Largo"
                    value={specificSheet?.length ?? "—"}
                    unit={specificSheet?.dimension_unit_name}
                  />
                  <Row
                    label="Altura"
                    value={specificSheet?.height ?? "—"}
                    unit={specificSheet?.dimension_unit_name}
                  />
                  <Row
                    label="Peso neto"
                    value={specificSheet?.net_weight ?? "—"}
                    unit={specificSheet?.net_weight_unit_name}
                  />
                </div>
              </div>

              {/* ...más tarjetas técnicas aquí... */}
            </div>
          )}
          {activeTab === "tech" && specificSheetLoading && (
            <div className="text-center text-secondary py-8">
              Cargando especificaciones técnicas...
            </div>
          )}
          {activeTab === "tech" &&
            !specificSheetLoading &&
            specificSheetError && (
              <div className="text-center text-red-600 py-8">
                {specificSheetError}
              </div>
            )}
          {activeTab === "tech" &&
            !specificSheetLoading &&
            !specificSheetError &&
            !specificSheet && (
              <div className="text-center text-secondary py-8">
                No existe ficha técnica específica registrada.
              </div>
            )}

          {/* === Documentos y Mantenimiento (DESKTOP) === */}
          {activeTab === "docs" && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Documentación dinámica */}
              <div className="border rounded-xl p-4 border-primary">
                <h3 className="text-secondary font-semibold text-lg mb-3">
                  Documentación
                </h3>
                <ul className="flex flex-col gap-3">
                  {docs.length === 0 ? (
                    <li className="text-sm text-gray-400">
                      No hay documentos registrados
                    </li>
                  ) : (
                    docs.map((doc) => (
                      <li
                        key={doc.id_machinery_documentation}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-primary hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <FiFileText className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="text-sm text-secondary">
                            {doc.document}
                          </span>
                          <span className="text-xs text-secondary ml-2">
                            {doc.file_type}
                          </span>
                        </div>
                        <a
                          href={doc.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-md hover:bg-gray-100"
                          title="Ver"
                          aria-label={`Ver documento ${doc.document}`}
                        >
                          <FiDownload className="w-5 h-5 text-gray-600" />
                        </a>
                      </li>
                    ))
                  )}
                </ul>
              </div>
              {/* Mantenimiento Periódico */}
              <div className="border rounded-xl p-4 border-primary">
                <h3 className="text-secondary font-semibold text-lg mb-3">
                  Mantenimiento Periódico
                </h3>
                <ul className="flex flex-col gap-3">
                  {periodicMaintenances.length === 0 ? (
                    <li className="text-sm text-gray-400">
                      No hay mantenimientos registrados
                    </li>
                  ) : (
                    periodicMaintenances.map((item) => (
                      <div key={item.id_periodic_maintenance_scheduling}>
                        {item.maintenance_name}
                      </div>
                    ))
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* ============== MOBILE ============== */}
        <div className="md:hidden bg-background">
          {/* Imagen / placeholder */}
          <div className="w-full aspect-[16/9] bg-gray-200 flex items-center justify-center">
            {selectedMachine?.image_path ? (
              <img
                src={selectedMachine.image_path}
                alt="Machinery photo"
                className="object-contain max-h-60 w-full"
                aria-label="Machinery photo"
              />
            ) : (
              <span className="text-secondary text-white min-h-[150px] flex items-center">
                Ingresa una imagen
              </span>
            )}
          </div>
          <div className="px-4 pt-4 bg-surface">
            {/* General Technical Data */}
            <h3 className="text-primary text-xl font-semibold mb-3">
              Datos Técnicos Generales
            </h3>
            <div className="rounded-xl overflow-hidden">
              {[
                ["Nombre", generalData.machinery_name || "—"],
                ["Marca", generalData.brand_name || "—"],
                ["Modelo", generalData.model_name || "—"],
                ["Año fabricación", generalData.manufacturing_year || "—"],
                ["Tipo", typeName || "—"],
                ["Tipo secundario", secondaryTypeName || "—"],
                ["Número de serie", generalData.serial_number || "—"],
                ["Ciudad origen", cityOriginName || "—"],
                ["Subpartida arancelaria", generalData.tariff_subheading || "—"],
                ["Estado operacional", statusName || "—"],
              ].map(([label, value], idx) => (
                <div
                  key={label}
                  className={`flex items-center justify-between px-4 py-3 ${
                    idx !== 0 ? "border-t" : ""
                  } border-primary`}
                >
                  <span className="text-sm text-gray-900 font-[500]">
                    {label}
                  </span>
                  <span className="text-sm text-secondary">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mapa + badges */}
          <div className="w-full aspect-[16/9] bg-gray-200 relative overflow-hidden mb-2">
            <div className="absolute bottom-2 left-2 inline-flex items-center gap-2 bg-white px-2.5 py-1 rounded-full shadow border">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-700">En operación</span>
            </div>
            <div className="absolute bottom-2 right-2 inline-flex items-center gap-2 bg-white px-2.5 py-1 rounded-full shadow border">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-xs text-gray-700">En Rivera</span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-400">Mapa aquí</span>
            </div>
          </div>

          {/* Accordion: Tracker Technical Data */}
          <div className="mt-2 overflow-hidden">
            <button
              type="button"
              onClick={() => setAccTrackerOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-5 bg-surface"
              aria-label="Toggle Tracker Data"
            >
              <span className="text-primary font-bold text-lg ">
                Datos del Tracker
              </span>
              <FiChevronDown
                className={`transition ${accTrackerOpen ? "rotate-180" : ""}`}
              />
            </button>
            {accTrackerOpen && (
              <div className="bg-surface">
                <div className="px-4 py-3 border-t border-primary">
                  <Row
                    label="Número de serie terminal"
                    value={trackerInfo?.terminal_serial_number || "—"}
                  />
                  <Row
                    label="Número de serie GPS"
                    value={trackerInfo?.gps_serial_number || "—"}
                  />
                  <Row
                    label="Número de chasis"
                    value={trackerInfo?.chassis_number || "—"}
                  />
                  <Row
                    label="Número de motor"
                    value={trackerInfo?.engine_number || "—"}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Accordion: Usage Information */}
          <div className="mt-2 overflow-hidden">
            <button
              type="button"
              onClick={() => setAccUsageOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-5 bg-surface"
              aria-label="Toggle Usage Information"
            >
              <span className="font-bold text-lg">Información de Uso</span>
              <FiChevronDown
                className={`transition ${accUsageOpen ? "rotate-180" : ""}`}
              />
            </button>
            {accUsageOpen && (
              <div className="bg-surface">
                <div className="px-4 py-3 border-t border-primary">
                  <Row
                    label="Fecha de adquisición"
                    value={formatDate?.(usageInfo?.acquisition_date) || "—"}
                  />
                  <Row
                    label="Estado de uso"
                    value={usageInfo?.usage_condition || "—"}
                  />
                  <Row
                    label="Horas usadas"
                    value={
                      usageInfo?.usage_hours
                        ? `${usageInfo.usage_hours} hrs`
                        : "—"
                    }
                  />
                  <Row
                    label="Kilometraje"
                    value={
                      usageInfo?.distance_value
                        ? `${usageInfo.distance_value} km`
                        : "—"
                    }
                  />
                  <Row
                    label="Tenencia"
                    value={
                      usageInfo?.tenancy_type ||
                      (usageInfo?.is_own ? "Propia" : "—")
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Accordion: Specific Technical Data */}
          <div className="mt-2 overflow-hidden">
            <button
              type="button"
              onClick={() => setAccSpecificOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-5 bg-surface"
              aria-label="Toggle Specific Technical Data"
            >
              <span className="font-bold text-lg">
                Datos Técnicos Específicos
              </span>
              <FiChevronDown
                className={`transition ${accSpecificOpen ? "rotate-180" : ""}`}
              />
            </button>
            {accSpecificOpen && (
              <div className="bg-surface">
                <div className="px-4 py-3 border-t border-primary">
                  <span className="block font-bold mb-2 text-primary">
                    Capacidad y Rendimiento
                  </span>
                  <Row
                    label="Capacidad del tanque"
                    value={specificSheet?.fuel_capacity ?? "—"}
                    unit={specificSheet?.fuel_capacity_unit_name}
                  />
                  <Row
                    label="Capacidad de carga"
                    value={specificSheet?.carrying_capacity ?? "—"}
                    unit={specificSheet?.carrying_capacity_unit_name}
                  />
                  <Row
                    label="Peso operativo"
                    value={specificSheet?.operating_weight ?? "—"}
                    unit={specificSheet?.operating_weight_unit_name}
                  />
                  <Row
                    label="Velocidad máxima"
                    value={specificSheet?.max_speed ?? "—"}
                    unit={specificSheet?.max_speed_unit_name}
                  />
                  <Row
                    label="Fuerza de tiro"
                    value={specificSheet?.draft_force ?? "—"}
                    unit={specificSheet?.draft_force_unit_name}
                  />
                  <Row
                    label="Altura máxima de operación"
                    value={specificSheet?.maximum_altitude ?? "—"}
                    unit={specificSheet?.maximum_altitude_unit_name}
                  />
                  <Row
                    label="Rendimiento mínimo"
                    value={specificSheet?.minimum_performance ?? "—"}
                    unit={specificSheet?.performance_unit_name}
                  />
                  <Row
                    label="Rendimiento máximo"
                    value={specificSheet?.maximum_performance ?? "—"}
                    unit={specificSheet?.performance_unit_name}
                  />
                </div>
                <div className="px-4 py-3 border-t border-primary">
                  <span className="block font-bold mb-2 text-primary">
                    Motor y Transmisión
                  </span>
                  <Row
                    label="Potencia"
                    value={specificSheet?.power ?? "—"}
                    unit={specificSheet?.power_unit_name}
                  />
                  <Row
                    label="Tipo de motor"
                    value={
                      specificSheet?.engine_type_name ??
                      specificSheet?.engine_type ??
                      "—"
                    }
                  />
                  <Row
                    label="Cilindrada"
                    value={specificSheet?.cylinder_capacity ?? "—"}
                    unit={specificSheet?.cylinder_capacity_unit_name}
                  />
                  <Row
                    label="Tipo de arreglo de cilindros"
                    value={
                      specificSheet?.cylinder_arrangement_type_name ??
                      specificSheet?.cylinder_arrangement_type ??
                      "—"
                    }
                  />
                  <Row
                    label="Cantidad de cilindros"
                    value={specificSheet?.cylinder_count ?? "—"}
                  />
                  <Row
                    label="Tipo de tracción"
                    value={
                      specificSheet?.traction_type_name ??
                      specificSheet?.traction_type ??
                      "—"
                    }
                  />
                  <Row
                    label="Consumo de combustible"
                    value={specificSheet?.fuel_consumption ?? "—"}
                    unit={specificSheet?.fuel_consumption_unit_name}
                  />
                  <Row
                    label="Tipo de sistema de transmisión"
                    value={
                      specificSheet?.transmission_system_type_name ??
                      specificSheet?.transmission_system_type ??
                      "—"
                    }
                  />
                </div>
                <div className="px-4 py-3 border-t border-primary">
                  <span className="block font-bold mb-3 text-primary">
                    Sistema Hidráulico y Otros
                  </span>
                  <Row
                    label="Presión máxima de trabajo"
                    value={specificSheet?.maximum_working_pressure ?? "—"}
                    unit={specificSheet?.maximum_working_pressure_unit_name}
                  />
                  <Row
                    label="Caudal de bomba"
                    value={specificSheet?.pump_flow ?? "—"}
                    unit={specificSheet?.pump_flow_unit_name}
                  />
                  <Row
                    label="Capacidad del tanque hidráulico"
                    value={specificSheet?.hydraulic_tank_capacity ?? "—"}
                    unit={specificSheet?.hydraulic_tank_capacity_unit_name}
                  />
                </div>
                <div className="px-4 py-3 border-t border-primary">
                  <span className="block font-bold mb-3 text-primary">
                    Cabina, Emisiones y Aire Acondicionado
                  </span>
                  <Row
                    label="Tipo de cabina"
                    value={
                      specificSheet?.cabin_type_name ??
                      specificSheet?.cabin_type ??
                      "—"
                    }
                  />
                  <Row
                    label="Nivel de emisión"
                    value={
                      specificSheet?.emission_level_type_name ??
                      specificSheet?.emission_level_type ??
                      "—"
                    }
                  />
                  <Row
                    label="Tipo de aire acondicionado"
                    value={
                      specificSheet?.air_conditioning_system_type_name ??
                      specificSheet?.air_conditioning_system_type ??
                      "—"
                    }
                  />
                  <Row
                    label="Consumo aire acondicionado"
                    value={
                      specificSheet?.air_conditioning_system_consumption ?? "—"
                    }
                    unit={
                      specificSheet?.air_conditioning_system_consumption_unit_name
                    }
                  />
                </div>
                <div className="px-4 py-3 border-t border-primary">
                  <span className="block font-bold mb-3 text-primary">
                    Otros
                  </span>
                  <Row
                    label="Ancho"
                    value={specificSheet?.width ?? "—"}
                    unit={specificSheet?.dimension_unit_name}
                  />
                  <Row
                    label="Largo"
                    value={specificSheet?.length ?? "—"}
                    unit={specificSheet?.dimension_unit_name}
                  />
                  <Row
                    label="Altura"
                    value={specificSheet?.height ?? "—"}
                    unit={specificSheet?.dimension_unit_name}
                  />
                  <Row
                    label="Peso neto"
                    value={specificSheet?.net_weight ?? "—"}
                    unit={specificSheet?.net_weight_unit_name}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Documentation */}
          <div className="mt-2 overflow-hidden bg-surface">
            <div className="px-4 py-5 font-bold text-lg">Documentación</div>
            {docs.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400">
                No hay documentos registrados
              </div>
            ) : (
              docs.map((doc) => (
                <div
                  key={doc.id_machinery_documentation}
                  className="flex items-center justify-between px-4 py-3 border-t border-primary"
                >
                  <span className="text-sm text-secondary">{doc.document}</span>
                  <a
                    href={doc.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-md hover:bg-gray-100"
                    aria-label={`Ver documento ${doc.document}`}
                  >
                    Ver
                  </a>
                </div>
              ))
            )}
          </div>

          {/* Periodic maintenance (lista tipo chips) */}
          <div className="mt-3 bg-surface p-4 md:p-0">
            <div className="font-bold text-lg mb-4">
              Mantenimiento periódico
            </div>
            <div className="space-y-2">
              {periodicMaintenances.length === 0 ? (
                <div className="text-sm text-gray-400">
                  No hay mantenimientos registrados
                </div>
              ) : (
                periodicMaintenances.map((item) => (
                  <div
                    key={item.id_periodic_maintenance_scheduling}
                    className="flex items-center justify-between bg-gray-100 rounded-full px-3 py-2"
                  >
                    <span className="text-sm text-gray-700 truncate">
                      {item.maintenance_name}
                    </span>
                    <span className="w-full block text-xs bg-white rounded-full px-2 py-0.5 text-gray-600 border">
                      {item.usage_hours
                        ? `${item.usage_hours} hrs`
                        : item.distance_km
                        ? `${item.distance_km} km`
                        : "—"}
                    </span>
                  </div>
                ))
              )}
            </div>
            <button className="mt-3 w-full rounded-md bg-gray-400/80 text-white py-2">
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, unit }) {
  return (
    <div className="flex justify-between">
      <span className="text-primary">{label}:</span>
      <span className="font-[400] text-secondary">
        {value ?? "—"}
        {unit ? ` ${unit}` : ""}
      </span>
    </div>
  );
}

function DocItem({ label, url, fileType }) {
  return (
    <li className="flex items-center justify-between p-2.5 rounded-lg border border-primary hover:bg-gray-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
          <FiFileText className="w-4 h-4 text-secondary" />
        </div>
        <span className="text-sm text-secondary">{label}</span>
        <span className="text-xs text-secondary ml-2">{fileType}</span>
      </div>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-md hover:bg-gray-100"
          title="Download"
          aria-label="Download document"
        >
          <FiDownload className="w-5 h-5 text-secondary" />
        </a>
      )}
    </li>
  );
}
