"use client";
import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FaTimes, FaSignal, FaMapMarkerAlt } from "react-icons/fa";
import { MdPowerSettingsNew, MdDirectionsCar, MdLocationOn } from "react-icons/md";
import { GaugeCard, CircularProgress, PerformanceChart, FuelConsumptionChart } from "./TrackingDashboardComponents";

const TrackingDashboardModal = ({ isOpen, onClose, requestData }) => {
  const [selectedMachinery, setSelectedMachinery] = useState(0);
  const [activeTab, setActiveTab] = useState("performance");
  
  // Mock data
  const mockRequestInfo = {
    trackingCode: "L-0000003",
    client: "Constructora el Dorado S.A.S",
    startDate: "06/V/2025",
    endDate: "28/III/2026",
    placeName: "Proyecto Urbanístico Villa del Sol - Medellín"
  };

  const mockMachineries = [
    {
      id: 1, serial: "EXC-3526-098", name: "Excavadora CAT 320",
      operator: "Carlos Andrés Martínez", implement: "Cucharón estándar 1.2m³",
      currentSpeed: "0 km/h", fuelLevel: "96%", ignition: true, moving: false,
      gsmSignal: 5, lastUpdate: "5 sec", status: "idle",
      location: { lat: 6.2442, lng: -75.5812 }
    },
    {
      id: 2, serial: "BUL-2526-456", name: "Bulldozer CAT D6T",
      operator: "Miguel Ángel Rodríguez", implement: "Hoja tipo U (3.9m³)",
      currentSpeed: "0 km/h", fuelLevel: "46%", ignition: true, moving: false,
      gsmSignal: 4, lastUpdate: "3 sec", status: "alert",
      location: { lat: 6.2445, lng: -75.5815 }
    },
    {
      id: 3, serial: "VOL-3055-123", name: "Volqueta CAT 797",
      operator: "Juan Martín Gonzales", implement: "Tolva tipo T",
      currentSpeed: "0 km/h", fuelLevel: "80%", ignition: false, moving: false,
      gsmSignal: 3, lastUpdate: "No conecta", status: "disconnected",
      location: { lat: 6.2448, lng: -75.5818 }
    }
  ];

  const mockIndicatorsData = {
    currentSpeed: { value: 135, max: 200, unit: "km/h" },
    rpm: { value: 1620, max: 3000, unit: "RPM", alert: true },
    engineTemp: { value: 92, min: 0, max: 120, unit: "°C" },
    fuelLevel: { value: 40, unit: "%" },
    oilLoad: { value: 30, unit: "%" },
    engineLoad: { value: 80, unit: "%" },
    totalOdometer: { value: "0 8 5 2 3 4", unit: "km" },
    tripOdometer: { value: "0 0 1 3 2 8", unit: "km" },
    logisticStatus: "En tránsito"
  };

  const getCardBackgroundColor = (status) => {
    switch (status) {
      case "alert": return "rgba(239, 68, 68, 0.1)";
      case "disconnected": return "rgba(156, 163, 175, 0.1)";
      case "moving": return "rgba(34, 197, 94, 0.05)";
      default: return "transparent";
    }
  };

  const getMarkerColor = (status) => {
    switch (status) {
      case "off": return "#9CA3AF";
      case "idle": return "#F59E0B";
      case "moving": return "#22C55E";
      default: return "#9CA3AF";
    }
  };

  const getFuelLevelColor = (level) => {
    const numLevel = parseInt(level);
    if (numLevel < 20) return "#EF4444";
    if (numLevel < 50) return "#F59E0B";
    return "#22C55E";
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-[60]" />
        <Dialog.Content className="modal-theme fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[95vw] max-w-[1400px] max-h-[95vh] overflow-y-auto">
          
          {/* FILA 1: Header - Título */}
          <div className="flex items-center justify-between p-4 border-b sticky top-0 modal-theme z-10" style={{ borderColor: 'var(--color-border)' }}>
            <Dialog.Title className="text-xl font-semibold text-primary">Panel de Seguimiento</Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Cerrar modal" className="p-2 text-secondary hover:text-primary rounded-full transition-colors cursor-pointer" onClick={onClose}>
                <FaTimes className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="sr-only">Dashboard de monitoreo en tiempo real</Dialog.Description>

          <div className="p-6 space-y-6">
            
            {/* FILA 2: Request Information */}
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
              <h3 className="text-sm font-semibold text-primary mb-3">Información de Solicitud</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div><p className="text-secondary mb-1">Código de seguimiento</p><p className="text-primary font-medium">{mockRequestInfo.trackingCode}</p></div>
                <div><p className="text-secondary mb-1">Cliente</p><p className="text-primary font-medium">{mockRequestInfo.client}</p></div>
                <div><p className="text-secondary mb-1">Fecha de inicio</p><p className="text-primary font-medium">{mockRequestInfo.startDate}</p></div>
                <div><p className="text-secondary mb-1">Fecha de fin</p><p className="text-primary font-medium">{mockRequestInfo.endDate}</p></div>
                <div className="col-span-2 md:col-span-4"><p className="text-secondary mb-1">Nombre del lugar</p><p className="text-primary font-medium">{mockRequestInfo.placeName}</p></div>
              </div>
            </div>

            {/* FILA 3: Dos columnas - Machinery Information + Real Time Ubication */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* FILA 3.1: Machinery Information */}
              <div>
                <h3 className="text-sm font-semibold text-primary mb-3">Información de Maquinaria</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {mockMachineries.map((machinery, index) => (
                    <div key={machinery.id} onClick={() => setSelectedMachinery(index)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedMachinery === index ? 'ring-2' : ''}`}
                      style={{ backgroundColor: getCardBackgroundColor(machinery.status), borderColor: selectedMachinery === index ? 'var(--color-primary)' : 'var(--color-border)', ringColor: 'var(--color-primary)' }}>
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded flex-shrink-0" style={{ backgroundColor: 'var(--color-background-tertiary)' }}>
                          <div className="w-full h-full flex items-center justify-center text-secondary text-xs">IMG</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-secondary">{machinery.serial}</p>
                              <p className="text-sm font-semibold text-primary truncate">{machinery.name}</p>
                            </div>
                            <FaSignal className={`flex-shrink-0 ml-2 ${machinery.gsmSignal >= 4 ? 'text-success' : machinery.gsmSignal >= 2 ? 'text-warning' : 'text-error'}`} size={12} />
                          </div>
                          <p className="text-xs text-secondary mb-1">Operador: {machinery.operator}</p>
                          <p className="text-xs text-secondary mb-2">Implemento: {machinery.implement}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><p className="text-secondary mb-0.5">Velocidad actual</p><p className="text-primary font-medium">{machinery.currentSpeed}</p></div>
                            <div><p className="text-secondary mb-0.5">Combustible actual</p><p className="font-medium" style={{ color: getFuelLevelColor(machinery.fuelLevel) }}>{machinery.fuelLevel}</p></div>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <div className="flex items-center gap-1"><MdPowerSettingsNew className={machinery.ignition ? 'text-success' : 'text-error'} size={14} /><span className="text-secondary">{machinery.ignition ? 'Encendido' : 'Apagado'}</span></div>
                            <div className="flex items-center gap-1"><MdDirectionsCar className={machinery.moving ? 'text-success' : 'text-warning'} size={14} /><span className="text-secondary">{machinery.moving ? 'En movimiento' : 'Estacionario'}</span></div>
                            <div className="ml-auto text-secondary text-xs">{machinery.lastUpdate}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FILA 3.2: Real Time Ubication */}
              <div>
                <h3 className="text-sm font-semibold text-primary mb-3">Ubicación en Tiempo Real</h3>
                <div className="w-full h-[400px] rounded-lg border flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                  <div className="absolute inset-0 flex items-center justify-center text-secondary">
                    <div className="text-center">
                      <FaMapMarkerAlt size={48} className="mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Mapa</p>
                    </div>
                  </div>

                  {/* Map markers */}
                  <div className="absolute inset-0">
                    {mockMachineries.map((machinery, index) => (
                      <div key={machinery.id} className="absolute" style={{ top: `${30 + index * 25}%`, left: `${40 + index * 10}%` }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg cursor-pointer transform hover:scale-110 transition-transform" style={{ backgroundColor: getMarkerColor(machinery.status) }}>
                          <MdLocationOn className="text-white" size={20} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 p-2 rounded shadow-lg text-xs" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22C55E' }} /><span className="text-secondary">En movimiento</span></div>
                      <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F59E0B' }} /><span className="text-secondary">Estacionario</span></div>
                      <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#9CA3AF' }} /><span className="text-secondary">Sin conexión</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FILA 4: Nombre del tractor + Last update */}
            {selectedMachinery !== null && (
              <div className="flex items-center gap-3 p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
                  {mockMachineries[selectedMachinery].name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-primary">{mockMachineries[selectedMachinery].name}</h3>
                  <p className="text-xs text-secondary">Serie: {mockMachineries[selectedMachinery].serial}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-secondary">Última actualización</p>
                  <p className="text-sm font-medium text-primary">{mockMachineries[selectedMachinery].lastUpdate}</p>
                </div>
              </div>
            )}

            {/* FILA 5: Grid de 8 sensores (4x2) */}
            {selectedMachinery !== null && (
              <div>
                <h3 className="text-sm font-semibold text-primary mb-3">Sensores y Contadores del Vehículo</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Sensor 1: Current speed */}
                  <GaugeCard label="Velocidad actual" value={mockIndicatorsData.currentSpeed.value} max={mockIndicatorsData.currentSpeed.max} unit={mockIndicatorsData.currentSpeed.unit} type="speed" />
                  
                  {/* Sensor 2: Revolutions(RPM) */}
                  <GaugeCard label="Revoluciones (RPM)" value={mockIndicatorsData.rpm.value} max={mockIndicatorsData.rpm.max} unit={mockIndicatorsData.rpm.unit} type="rpm" alert={mockIndicatorsData.rpm.alert} />

                  {/* Sensor 3: Engine Temperature */}
                  <div className="p-4 rounded-lg border flex flex-col items-center justify-center min-h-[200px]" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                    <p className="text-xs text-secondary mb-3">Temperatura del Motor</p>
                    <div className="relative">
                      {/* Termómetro */}
                      <svg width="50" height="100" viewBox="0 0 50 100" className="mb-2">
                        <defs>
                          <linearGradient id="tempGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
                            <stop offset="50%" style={{ stopColor: '#A78BFA', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#EF4444', stopOpacity: 1 }} />
                          </linearGradient>
                        </defs>
                        
                        {/* Bulbo inferior */}
                        <circle cx="25" cy="85" r="12" fill="url(#tempGradient)" stroke="#9CA3AF" strokeWidth="2" />
                        
                        {/* Tubo del termómetro */}
                        <rect x="20" y="15" width="10" height="70" rx="5" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2" />
                        
                        {/* Líquido del termómetro */}
                        <rect 
                          x="22" 
                          y={`${85 - (mockIndicatorsData.engineTemp.value / mockIndicatorsData.engineTemp.max) * 68}`} 
                          width="6" 
                          height={`${(mockIndicatorsData.engineTemp.value / mockIndicatorsData.engineTemp.max) * 68}`}
                          rx="3" 
                          fill="url(#tempGradient)"
                          className="transition-all duration-700"
                        />
                        
                        {/* Marcas de temperatura */}
                        <line x1="30" y1="25" x2="35" y2="25" stroke="#9CA3AF" strokeWidth="1" />
                        <line x1="30" y1="45" x2="35" y2="45" stroke="#9CA3AF" strokeWidth="1" />
                        <line x1="30" y1="65" x2="35" y2="65" stroke="#9CA3AF" strokeWidth="1" />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold text-primary">{mockIndicatorsData.engineTemp.value}°C</p>
                  </div>

                  {/* Sensor 4: Fuel Level */}
                  <div className="p-4 rounded-lg border flex flex-col items-center justify-center min-h-[200px]" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                    <p className="text-xs text-secondary mb-2">Nivel de combustible</p>
                    <div className="relative w-32 h-20">
                      <svg className="w-full h-full" viewBox="0 0 160 80">
                        {/* Arco de fondo */}
                        <path
                          d="M 20 70 A 60 60 0 0 1 140 70"
                          fill="none"
                          stroke="#E5E5E5"
                          strokeWidth="12"
                          strokeLinecap="round"
                        />
                        
                        {/* Arco de nivel de combustible */}
                        <path
                          d="M 20 70 A 60 60 0 0 1 140 70"
                          fill="none"
                          stroke={getFuelLevelColor(`${mockIndicatorsData.fuelLevel.value}`)}
                          strokeWidth="12"
                          strokeLinecap="round"
                          strokeDasharray={`${(mockIndicatorsData.fuelLevel.value / 100) * 188} 188`}
                        />
                        
                        {/* Etiqueta E (Empty) */}
                        <text x="15" y="75" fontSize="10" fill="#9CA3AF" fontWeight="bold">E</text>
                        
                        {/* Etiqueta F (Full) */}
                        <text x="138" y="75" fontSize="10" fill="#9CA3AF" fontWeight="bold">F</text>
                      </svg>
                      
                      {/* Aguja */}
                      <div 
                        className="absolute bottom-2 left-1/2 w-1 h-12 origin-bottom transition-all duration-700 ease-out"
                        style={{ 
                          backgroundColor: '#1F2937',
                          transform: `translateX(-50%) rotate(${(mockIndicatorsData.fuelLevel.value / 100) * 180 - 90}deg)`,
                          borderRadius: '2px'
                        }}
                      />
                      
                      {/* Centro de la aguja */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gray-800 border-2 border-white" />
                    </div>
                    <p className="text-2xl font-bold text-primary mt-2">{mockIndicatorsData.fuelLevel.value}%</p>
                    <p className="text-xs text-secondary">~36L / ~90L</p>
                  </div>

                  {/* Sensor 5: Oil level */}
                  <CircularProgress label="Nivel de aceite" value={mockIndicatorsData.oilLoad.value} color="#F59E0B" />

                  {/* Sensor 6: Engine load */}
                  <CircularProgress label="Carga del motor" value={mockIndicatorsData.engineLoad.value} color="#22C55E" />

                  {/* Sensor 7: Odometer */}
                  <div className="p-4 rounded-lg border flex flex-col items-center justify-center min-h-[200px]" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                    <p className="text-xs text-secondary mb-3">Odómetro</p>
                    
                    {/* Total */}
                    <div className="mb-3">
                      <p className="text-xs text-secondary mb-1 text-center">Total</p>
                      <div className="flex gap-0.5 bg-black p-2 rounded">
                        {mockIndicatorsData.totalOdometer.value.split(' ').map((digit, i) => (
                          <div key={i} className="w-6 h-8 flex items-center justify-center bg-gray-900 text-white font-mono text-lg font-bold border border-gray-700">
                            {digit}
                          </div>
                        ))}
                        <div className="flex items-end ml-1 text-white text-xs font-bold pb-1">KM</div>
                      </div>
                    </div>
                    
                    {/* Trip */}
                    <div>
                      <p className="text-xs text-secondary mb-1 text-center">Trip</p>
                      <div className="flex gap-0.5 bg-black p-2 rounded">
                        {mockIndicatorsData.tripOdometer.value.split(' ').map((digit, i) => (
                          <div key={i} className="w-6 h-8 flex items-center justify-center bg-gray-900 text-white font-mono text-lg font-bold border border-gray-700">
                            {digit}
                          </div>
                        ))}
                        <div className="flex items-end ml-1 text-white text-xs font-bold pb-1">KM</div>
                      </div>
                    </div>
                  </div>

                  {/* Sensor 8: Logistic status */}
                  <div className="p-4 rounded-lg border flex flex-col justify-center min-h-[200px]" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                    <p className="text-xs text-secondary mb-2">Estado logístico</p>
                    <select className="input-theme text-sm w-full mb-3" value={mockIndicatorsData.logisticStatus} onChange={(e) => {}}>
                      <option>Inactivo</option>
                      <option>En tránsito</option>
                      <option>En operación</option>
                      <option>Mantenimiento</option>
                    </select>
                    <button className="btn-primary w-full py-2 text-sm rounded-lg font-medium">Actualizar Estado</button>
                  </div>

                </div>
              </div>
            )}

            {/* FILA 6: Gráficas con tabs */}
            {selectedMachinery !== null && (
              <div>
                <div className="flex gap-1 mb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <button onClick={() => setActiveTab("performance")} className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === "performance" ? 'text-primary' : 'text-secondary hover:text-primary'}`}>
                    Información de Rendimiento
                    {activeTab === "performance" && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--color-primary)' }} />}
                  </button>
                  <button onClick={() => setActiveTab("fuel")} className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === "fuel" ? 'text-primary' : 'text-secondary hover:text-primary'}`}>
                    Información de Consumo de Combustible
                    {activeTab === "fuel" && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--color-primary)' }} />}
                  </button>
                </div>

                <div className="p-4 rounded-lg border min-h-[400px]" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                  {activeTab === "performance" ? <PerformanceChart /> : <FuelConsumptionChart />}
                </div>
              </div>
            )}

          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default TrackingDashboardModal;
