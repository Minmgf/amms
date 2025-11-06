"use client";
import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FaTimes } from "react-icons/fa";
import { HistoricalCharts } from "./HistoricalCharts";
import { PerformanceChart, FuelConsumptionChart } from "./TrackingDashboardComponents";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const RequestHistoricalModal = ({ isOpen, onClose, requestData }) => {
  const [activeTab, setActiveTab] = useState("historical");
  const [temporalFilter, setTemporalFilter] = useState({
    startDate: "2025-01-15 08:30",
    endDate: "2025-01-15 14:30"
  });

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Use actual request data if available, otherwise use mock data
  const requestInfo = requestData ? {
    trackingCode: requestData.tracking_code || "SOL-2025-001",
    client: requestData.legal_entity_name || requestData.client_name || "Cliente no disponible",
    startDate: requestData.scheduled_date ? formatDate(requestData.scheduled_date) : "N/A",
    endDate: requestData.completion_date ? formatDate(requestData.completion_date) : "N/A",
    totalDistance: "150 km",
  } : {
    trackingCode: "SOL-2025-001",
    client: "Constructora El Dorado S.A.S",
    startDate: "15/01/2025",
    endDate: "28/01/2025",
    totalDistance: "150 km",
  };

  // Mock data for machinery information
  const machineryInfo = [
    {
      id: 1,
      name: "Excavadora CAT 320",
      totalOperatingTime: "10h",
      averageSpeed: "20 km/h",
      averageConsumption: "14L/h",
      effectiveWorkingHours: "7h"
    },
    {
      id: 2,
      name: "Bulldozer CAT D6T",
      totalOperatingTime: "10h",
      averageSpeed: "20 km/h",
      averageConsumption: "14L/h",
      effectiveWorkingHours: "7h"
    },
    {
      id: 3,
      name: "Volqueta Mercedes M2",
      totalOperatingTime: "10h",
      averageSpeed: "20 km/h",
      averageConsumption: "14L/h",
      effectiveWorkingHours: "7h"
    }
  ];

  // Mock data for time percentage chart
  const timePercentageData = [
    { machinery: 'Excavadora CAT 320', off: 15, on: 85, inMotion: 72 },
    { machinery: 'Bulldozer CAT D6T', off: 23, on: 78, inMotion: 58 },
    { machinery: 'Volqueta Mercedes M2', off: 18, on: 82, inMotion: 65 }
  ];

  // Mock data for G-Events
  const gEvents = [
    { type: "Intensidad de Frenado", date: "2024-01-17 10:30", duration: "30 min", intensity: "-0.8G" },
    { type: "Intensidad de Aceleración", date: "2024-01-17 10:30", duration: "10 min", intensity: "+0.9G" },
    { type: "Intensidad de Curva", date: "2024-01-17 10:30", duration: "15 min", intensity: "0.7G" }
  ];

  // Mock data for OBD Faults
  const obdFaults = [
    { fault: "P0171", example: "Ejemplo", date: "2024-01-11 17:30" },
    { fault: "P0177", example: "Ejemplo", date: "2024-01-11 17:32" },
    { fault: "P0401", example: "Ejemplo", date: "2024-01-11 18:30" }
  ];

  const handleApplyTemporalFilter = () => {
    console.log("Applying temporal filter:", temporalFilter);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-[60]" />
        <Dialog.Content className="modal-theme fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[95vw] max-w-[1400px] max-h-[95vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b sticky top-0 modal-theme z-10" style={{ borderColor: 'var(--color-border)' }}>
            <Dialog.Title className="text-xl font-semibold text-primary">
              Datos Históricos
            </Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Cerrar modal" className="p-2 text-secondary hover:text-primary rounded-full transition-colors cursor-pointer" onClick={onClose}>
                <FaTimes className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="sr-only">Panel de monitoreo de datos históricos de la solicitud</Dialog.Description>

          <div className="p-6 space-y-6">
            
            {/* Request Information */}
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
              <h3 className="text-sm font-semibold text-primary mb-3">Información de Solicitud</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-secondary mb-1">Código de seguimiento</p>
                  <p className="text-primary font-medium">{requestInfo.trackingCode}</p>
                </div>
                <div>
                  <p className="text-secondary mb-1">Cliente</p>
                  <p className="text-primary font-medium">{requestInfo.client}</p>
                </div>
                <div>
                  <p className="text-secondary mb-1">Distancia total recorrida</p>
                  <p className="text-primary font-medium">{requestInfo.totalDistance}</p>
                </div>
                <div>
                  <p className="text-secondary mb-1">Fecha de inicio</p>
                  <p className="text-primary font-medium">{requestInfo.startDate}</p>
                </div>
                <div>
                  <p className="text-secondary mb-1">Fecha de fin</p>
                  <p className="text-primary font-medium">{requestInfo.endDate}</p>
                </div>                
              </div>
            </div>

            {/* Temporal Filter */}
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
              <h3 className="text-sm font-semibold text-primary mb-3">Filtro temporal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-secondary mb-2">Fecha de inicio</label>
                  <input 
                    type="datetime-local" 
                    className="input-theme w-full text-sm"
                    value={temporalFilter.startDate}
                    onChange={(e) => setTemporalFilter({...temporalFilter, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs text-secondary mb-2">Fecha de fin</label>
                  <input 
                    type="datetime-local" 
                    className="input-theme w-full text-sm"
                    value={temporalFilter.endDate}
                    onChange={(e) => setTemporalFilter({...temporalFilter, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button 
                  className="btn-primary px-6 py-2 rounded-lg text-sm font-medium"
                  onClick={handleApplyTemporalFilter}
                >
                  Aplicar
                </button>
              </div>
            </div>

            {/* Machinery Information */}
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
              <h3 className="text-sm font-semibold text-primary mb-4">Información de Maquinaria</h3>
              <div className="space-y-4">
                {machineryInfo.map((machinery) => (
                  <div key={machinery.id} className="flex gap-4 items-start p-3 rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="w-16 h-16 rounded flex-shrink-0" style={{ backgroundColor: 'var(--color-background-tertiary)' }}>
                      <div className="w-full h-full flex items-center justify-center text-secondary text-xs">IMG</div>
                    </div>
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                      <div>
                        <p className="text-secondary mb-1">Nombre</p>
                        <p className="text-primary font-medium">{machinery.name}</p>
                      </div>
                      <div>
                        <p className="text-secondary mb-1">Tiempo total de operación</p>
                        <p className="text-primary font-medium">{machinery.totalOperatingTime}</p>
                      </div>
                      <div>
                        <p className="text-secondary mb-1">Velocidad promedio</p>
                        <p className="text-primary font-medium">{machinery.averageSpeed}</p>
                      </div>
                      <div>
                        <p className="text-secondary mb-1">Consumo promedio</p>
                        <p className="text-primary font-medium">{machinery.averageConsumption}</p>
                      </div>
                      <div>
                        <p className="text-secondary mb-1">Horas efectivas de trabajo</p>
                        <p className="text-primary font-medium">{machinery.effectiveWorkingHours}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Percentage Chart */}
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
              <h3 className="text-sm font-semibold text-primary mb-4">Gráfico de porcentaje de tiempo</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={timePercentageData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                  <XAxis 
                    dataKey="machinery" 
                    tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    axisLine={{ stroke: 'var(--color-border)' }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                    axisLine={{ stroke: 'var(--color-border)' }}
                    label={{ value: 'Porcentaje %', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: 'var(--color-text-secondary)' } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-background)', 
                      borderColor: '#3B82F6',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value) => `${value}%`}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                    formatter={(value) => {
                      const labels = {
                        off: 'Apagado',
                        on: 'Encendido',
                        inMotion: 'En movimiento'
                      };
                      return labels[value] || value;
                    }}
                  />
                  <Bar dataKey="off" fill="#1F2937" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="on" fill="#EAB308" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="inMotion" fill="#22C55E" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-1 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <button 
                onClick={() => setActiveTab("historical")} 
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === "historical" ? 'text-primary' : 'text-secondary hover:text-primary'}`}
              >
                Gráficas Históricas
                {activeTab === "historical" && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--color-primary)' }} />}
              </button>
              <button 
                onClick={() => setActiveTab("performance")} 
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === "performance" ? 'text-primary' : 'text-secondary hover:text-primary'}`}
              >
                Información de Rendimiento
                {activeTab === "performance" && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--color-primary)' }} />}
              </button>
              <button 
                onClick={() => setActiveTab("map")} 
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === "map" ? 'text-primary' : 'text-secondary hover:text-primary'}`}
              >
                Mapa Interactivo
                {activeTab === "map" && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--color-primary)' }} />}
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              
              {/* Historical Charts Tab */}
              {activeTab === "historical" && (
                <div>
                  <HistoricalCharts />
                </div>
              )}

              {/* Performance Information Tab */}
              {activeTab === "performance" && (
                <div className="space-y-6">
                  {/* Fuel Consumption Information */}
                  <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                    <h3 className="text-base font-semibold text-primary mb-4">Información de Consumo de Combustible</h3>
                    <FuelConsumptionChart />
                  </div>

                  {/* Performance Information */}
                  <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                    <h3 className="text-base font-semibold text-primary mb-4">Información de Rendimiento</h3>
                    <PerformanceChart />
                  </div>

                  {/* Chart Information */}
                  <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                    <h3 className="text-base font-semibold text-primary mb-4">Información del Gráfico</h3>
                    <div className="flex items-center gap-8 mb-6 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                        <span className="text-secondary">Frenado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <span className="text-secondary">Aceleración</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        <span className="text-secondary">Curva</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                        <span className="text-secondary">Apagado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                        <span className="text-secondary">Estacionario</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-400"></div>
                        <span className="text-secondary">En movimiento</span>
                      </div>
                    </div>

                    {/* G-Events and OBD Faults */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* G-Events */}
                      <div>
                        <h4 className="text-sm font-semibold text-primary mb-3">Eventos G</h4>
                        <div className="space-y-3 text-xs">
                          {gEvents.map((event, index) => (
                            <div key={index} className="pb-3 border-b last:border-b-0" style={{ borderColor: 'var(--color-border)' }}>
                              <div className="flex items-start justify-between mb-1">
                                <p className="font-medium text-primary">{event.type}</p>
                                <span className="text-secondary text-[10px]">{event.date}</span>
                              </div>
                              <p className="text-secondary">Duración: <span className="text-primary font-medium">{event.duration}</span></p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* OBD Faults */}
                      <div>
                        <h4 className="text-sm font-semibold text-primary mb-3">Fallas OBD</h4>
                        <div className="space-y-3 text-xs">
                          {obdFaults.map((fault, index) => (
                            <div key={index} className="pb-3 border-b last:border-b-0" style={{ borderColor: 'var(--color-border)' }}>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-1 h-8 bg-error rounded"></div>
                                  <div>
                                    <p className="font-bold text-error text-sm">{fault.fault}</p>
                                    <p className="text-[10px] text-secondary">{fault.example}</p>
                                  </div>
                                </div>
                                <span className="text-[10px] text-secondary whitespace-nowrap">{fault.date}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive Map Tab */}
              {activeTab === "map" && (
                <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                  <div className="w-full h-[500px] flex items-center justify-center relative overflow-hidden rounded-lg" style={{ backgroundColor: '#D1D5DB' }}>
                    {/* Map placeholder */}
                    <p className="text-sm text-secondary">Mapa</p>
                    
                    {/* Example route visualization */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 500">
                      {/* Outbound route (green) */}
                      <path 
                        d="M 50 450 L 200 400" 
                        stroke="#22C55E" 
                        strokeWidth="4" 
                        fill="none"
                      />
                      
                      {/* Working route (blue) */}
                      <path 
                        d="M 200 400 L 250 200 L 300 200 L 300 100 L 350 100 L 350 200 L 400 200 L 400 100 L 450 100" 
                        stroke="#3B82F6" 
                        strokeWidth="4" 
                        fill="none"
                      />
                      
                      {/* Return route (red) */}
                      <path 
                        d="M 450 100 L 450 300 L 200 300" 
                        stroke="#EF4444" 
                        strokeWidth="4" 
                        fill="none"
                      />
                      
                      {/* Start marker (green) */}
                      <circle cx="50" cy="450" r="8" fill="white" stroke="#22C55E" strokeWidth="3" />
                      
                      {/* Intermediate markers (blue) */}
                      <circle cx="200" cy="400" r="8" fill="white" stroke="#3B82F6" strokeWidth="3" />
                      <circle cx="450" cy="100" r="8" fill="white" stroke="#3B82F6" strokeWidth="3" />
                      
                      {/* End marker (red) */}
                      <circle cx="200" cy="300" r="8" fill="white" stroke="#EF4444" strokeWidth="3" />
                    </svg>

                    {/* Legend */}
                    <div className="absolute bottom-4 left-4 p-3 rounded shadow-lg bg-white">
                      <div className="flex items-center gap-6 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-1 rounded" style={{ backgroundColor: '#22C55E' }}></div>
                          <span className="text-gray-700">Salida</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-1 rounded" style={{ backgroundColor: '#3B82F6' }}></div>
                          <span className="text-gray-700">Trabajando</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-1 rounded" style={{ backgroundColor: '#EF4444' }}></div>
                          <span className="text-gray-700">Retorno</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default RequestHistoricalModal;
