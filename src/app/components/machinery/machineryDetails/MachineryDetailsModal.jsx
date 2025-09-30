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
  getMachineryStatus, // <--- usa este nombre
} from "@/services/machineryService";

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

  // Extra data
  const [typeName, setTypeName] = useState("");
  const [secondaryTypeName, setSecondaryTypeName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [modelName, setModelName] = useState("");
  const [statusName, setStatusName] = useState("");
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    if (!selectedMachine) return;

    // Tipo principal
    getMachineryType().then((data) => {
      const found = data?.find((t) => t.id === selectedMachine.machinery_type);
      setTypeName(found?.name || "");
    });

    // Tipo secundario
    getMachinerySecondaryType().then((data) => {
      const found = data?.find(
        (t) => t.id === selectedMachine.machinery_secondary_type
      );
      setSecondaryTypeName(found?.name || "");
    });

    // Marca
    getMachineryBrands().then((data) => {
      const found = data?.find((b) => b.id === selectedMachine.brand);
      setBrandName(found?.name || "");
    });

    // Modelo
    if (selectedMachine.id_model && selectedMachine.brand) {
      getModelsByBrandId(selectedMachine.brand).then((data) => {
        const found = data?.find((m) => m.id === selectedMachine.id_model);
        setModelName(found?.name || "");
      });
    }

    // Estado operacional
    getMachineryStatus().then((data) => {
      const found = data?.find(
        (s) => s.id === selectedMachine.machinery_operational_status
      );
      setStatusName(found?.name || "");
    });
  }, [selectedMachine]);

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
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 text-primary">
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
          <div className="flex justify-center border-b border-[#737373] mb-6">
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
                <div className="bg-[#737373] h-full rounded-md flex items-center justify-center">
                  {selectedMachine?.image_path ? (
                    <img
                      src={selectedMachine.image_path}
                      alt="Machinery photo"
                      className="object-contain max-h-80 w-full rounded-md"
                      aria-label="Machinery photo"
                    />
                  ) : (
                    <span className="text-white">Photo here</span>
                  )}
                </div>

                <div className="border rounded-xl p-4 border-secondary">
                  <h3 className="font-semibold text-lg mb-3">
                    Datos Generales
                  </h3>
                  <div className="flex flex-col gap-3">
                    <Row
                      label="Número de serie"
                      value={selectedMachine?.serial_number}
                    />
                    <Row
                      label="Nombre"
                      value={selectedMachine?.machinery_name}
                    />
                    <Row label="Marca" value={brandName} />
                    <Row label="Modelo" value={modelName} />
                    <Row
                      label="Año fabricación"
                      value={selectedMachine?.manufacturing_year}
                    />
                    <Row label="Tipo" value={typeName} />
                    <Row label="Tipo secundario" value={secondaryTypeName} />
                    <Row label="Origen" value={selectedMachine?.id_city} />
                    <Row
                      label="Subpartida arancelaria"
                      value={selectedMachine?.tariff_subheading}
                    />
                    <Row label="Estado operacional" value={statusName} />
                  </div>
                </div>
              </div>
              {/* Mapa y badges */}
              <div className="mt-8">
                <h3 className="font-semibold text-lg mb-2">Ubicación GPS</h3>
                <div className="border border-[#E5E7EB] rounded-xl p-4">
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

              {/* NUEVO: Tracker Data Sheet y Usage Information */}
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="border rounded-xl p-4 border-[#E5E7EB]">
                  <h4 className="font-semibold mb-3">Tracker Data Sheet</h4>
                  <div className="flex flex-col gap-3">
                    <Row label="Serial Number" value={selectedMachine?.tracker_serial_number || "—"} />
                    <Row label="GPS Serial Number" value={selectedMachine?.gps_serial_number || "—"} />
                    <Row label="Chassis Number" value={selectedMachine?.chassis_number || "—"} />
                    <Row label="Engine Number" value={selectedMachine?.engine_number || "—"} />
                  </div>
                </div>
                <div className="border rounded-xl p-4 border-[#E5E7EB]">
                  <h4 className="font-semibold mb-3">Usage Information</h4>
                  <div className="flex flex-col gap-3">
                    <Row label="Acquisition Date" value={formatDate?.(selectedMachine?.acquisition_date) || "—"} />
                    <Row label="Usage Status" value={selectedMachine?.usage_status || "—"} />
                    <Row label="Used Hours" value={selectedMachine?.used_hours || "—"} />
                    <Row label="Mileage" value={selectedMachine?.mileage || "—"} />
                    <Row label="Tenure" value={selectedMachine?.tenure || "—"} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* === Especificaciones Técnicas (DESKTOP) === */}
          {activeTab === "tech" && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Capacidad y Rendimiento */}
              <div className="border rounded-xl p-4 border-[#E5E7EB]">
                <h3 className="font-semibold text-lg mb-3">
                  Capacidad y Rendimiento
                </h3>
                <div className="flex flex-col gap-3">
                  <Row label="Capacidad del tanque" value="410 L" />
                  <Row label="Capacidad de carga" value="1.2 m³" />
                  <Row label="Peso operativo" value="20,500 kg" />
                  <Row label="Velocidad máxima" value="5.5 km/h" />
                  <Row label="Fuerza de tiro" value="186 kN" />
                  <Row label="Altura máxima de operación" value="4,500 m" />
                  <Row label="Rendimiento mínimo" value="500 kg" />
                  <Row label="Rendimiento máximo" value="3,600 kg" />
                </div>
              </div>
              {/* ...más tarjetas técnicas aquí... */}
            </div>
          )}

          {/* === Documentos y Mantenimiento (DESKTOP) === */}
          {activeTab === "docs" && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-xl p-4 border-[#E5E7EB]">
                <h3 className="font-semibold text-lg mb-3">Documentación</h3>
                <ul className="flex flex-col gap-3">
                  <DocItem label="Manual de Operador" />
                  <DocItem label="Certificado de Importación" />
                </ul>
              </div>
              <div className="border rounded-xl p-4 border-[#E5E7EB]">
                <h3 className="font-semibold text-lg mb-3">
                  Mantenimiento Periódico
                </h3>
                <ul className="flex flex-col gap-3">
                  {[
                    ["Cambio de aceite", "250 hrs"],
                    ["Filtro hidráulico", "1000 hrs"],
                    ["Inspección general", "500 hrs"],
                    ["Reparación de motor", "2000 hrs"],
                  ].map(([label, hours]) => (
                    <li
                      key={label}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E7EB] hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <FaTools className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-sm text-[#525252]">{label}</span>
                      </div>
                      <span className="text-xs text-gray-500">{hours}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* ============== MOBILE ============== */}
        <div className="md:hidden bg-[#F0F0F0]">
          <div className="px-4 bg-white">
            {/* Imagen / placeholder */}
            <div className="w-full aspect-[16/9] bg-gray-200 rounded-lg flex items-center justify-center mb-4">
              <span className="text-gray-400">Foto aquí</span>
            </div>

            {/* General Technical Data */}
            <h3 className="text-xl font-semibold mb-3">
              Datos Técnicos Generales
            </h3>
            <div className="rounded-xl overflow-hidden">
              {[
                ["Nombre", selectedMachine?.machinery_name || "—"],
                ["Marca", brandName || "—"],
                ["Modelo", modelName || "—"],
                ["Año fabricación", selectedMachine?.manufacturing_year || "—"],
                ["Tipo", typeName || "—"],
                ["Tipo secundario", secondaryTypeName || "—"],
                ["Número de serie", selectedMachine?.serial_number || "—"],
                ["Ciudad origen", selectedMachine?.id_city || "—"],
                [
                  "Subpartida arancelaria",
                  selectedMachine?.tariff_subheading || "—",
                ],
                ["Estado operacional", statusName || "—"],
              ].map(([label, value], idx) => (
                <div
                  key={label}
                  className={`flex items-center justify-between px-4 py-3 ${
                    idx !== 0 ? "border-t" : ""
                  } border-gray-200`}
                >
                  <span className="text-sm text-gray-900 font-[500]">
                    {label}
                  </span>
                  <span className="text-sm text-gray-600">{value}</span>
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
              className="w-full flex items-center justify-between px-4 py-5 bg-white"
            >
              <span className="font-bold text-lg">Datos del Tracker</span>
              <FiChevronDown
                className={`transition ${accTrackerOpen ? "rotate-180" : ""}`}
              />
            </button>
            {accTrackerOpen && (
              <div className="bg-white">
                {[
                  ["Terminal Serial Number", "TRK-2024-987654"],
                  ["GPS Device Serial Number", "GPS-AXT-56789"],
                  ["Chasis", "1HGBH41JXMN019186"],
                  ["Motor", "D13-7654321"],
                ].map(([label, value], idx) => (
                  <div
                    key={label}
                    className={`flex items-center justify-between px-4 py-3 ${
                      idx !== 0 ? "border-t" : ""
                    } border-gray-200`}
                  >
                    <span className="text-sm text-gray-900 font-[500]">
                      {label}
                    </span>
                    <span className="text-sm text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accordion: Usage Information */}
          <div className="mt-2 overflow-hidden">
            <button
              type="button"
              onClick={() => setAccUsageOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-5 bg-white"
            >
              <span className="font-bold text-lg">Información de Uso</span>
              <FiChevronDown
                className={`transition ${accUsageOpen ? "rotate-180" : ""}`}
              />
            </button>
            {accUsageOpen && (
              <div className="bg-white">
                {[
                  [
                    "Fecha adquisición",
                    formatDate?.(selectedMachine?.acquisition_date) || "—",
                  ],
                  ["Estado de uso", selectedMachine?.status || "—"],
                  ["Horas usadas", "—"],
                  ["Kilometraje", "—"],
                  ["Tenencia", selectedMachine?.tenure || "—"],
                  ["Fin de contrato", "N/A"],
                ].map(([label, value], idx) => (
                  <div
                    key={label}
                    className={`flex items-center justify-between px-4 py-3 ${
                      idx !== 0 ? "border-t" : ""
                    } border-gray-200`}
                  >
                    <span className="text-sm text-gray-900 font-[500]">
                      {label}
                    </span>
                    <span className="text-sm text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accordion: Specific Technical Data */}
          <div className="mt-2 overflow-hidden">
            <button
              type="button"
              onClick={() => setAccSpecificOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-5 bg-white"
            >
              <span className="font-bold text-lg">
                Datos Técnicos Específicos
              </span>
              <FiChevronDown
                className={`transition ${accSpecificOpen ? "rotate-180" : ""}`}
              />
            </button>
            {accSpecificOpen && (
              <div className="bg-white">
                {[
                  ["Potencia Motor", "158 HP"],
                  ["Presión Hidráulica", "350 bar"],
                  ["Caudal de Bomba", "265 L/min"],
                ].map(([label, value], idx) => (
                  <div
                    key={label}
                    className={`flex items-center justify-between px-4 py-3 ${
                      idx !== 0 ? "border-t" : ""
                    } border-gray-200`}
                  >
                    <span className="text-sm text-gray-900 font-[500]">
                      {label}
                    </span>
                    <span className="text-sm text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documentation */}
          <div className="mt-2 overflow-hidden bg-white">
            <div className="px-4 py-5 font-bold text-lg">Documentación</div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <span className="text-sm text-gray-600">Manual de operación</span>
              <button className="px-3 py-1.5 rounded-md text-white bg-black text-sm">
                Ver
              </button>
            </div>
          </div>

          {/* Periodic maintenance (lista tipo chips) */}
          <div className="mt-3 bg-white p-4 md:p-0">
            <div className="font-bold text-lg mb-4">
              Mantenimiento periódico
            </div>
            <div className="space-y-2">
              {[
                ["Chequeo nivel aceite", "50 horas"],
                ["Cambio aceite y filtro transmisión", "500 horas"],
                ["Limpieza radiador", "2000 horas"],
              ].map(([task, hours]) => (
                <div
                  key={task}
                  className="flex items-center justify-between bg-gray-100 rounded-full px-3 py-2"
                >
                  <span className="text-sm text-gray-700 truncate">{task}</span>
                  <div className="flex items-center gap-2">
                    <span className="w-full block text-xs bg-white rounded-full px-2 py-0.5 text-gray-600 border">
                      {hours}
                    </span>
                    <button className="text-xs px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
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

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-primary">
      {label}: <span className="font-[400] text-secondary">{value ?? "—"}</span>
    </div>
  );
}

function DocItem({ label }) {
  return (
    <li className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E7EB] hover:bg-gray-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
          <FiFileText className="w-4 h-4 text-gray-600" />
        </div>
        <span className="text-sm text-[#525252]">{label}</span>
      </div>
      <button className="p-2 rounded-md hover:bg-gray-100" title="Download">
        <FiDownload className="w-5 h-5 text-gray-600" />
      </button>
    </li>
  );
}
