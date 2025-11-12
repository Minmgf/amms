"use client";
import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FaTimes } from "react-icons/fa";
import { HistoricalCharts } from "./HistoricalCharts";
import { PerformanceChart, FuelConsumptionChart } from "./TrackingDashboardComponents";
import TableList from "../shared/TableList";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  getHistoricalDataByRequest, 
  processParameterData, 
  calculateTimePercentages,
  processGPSData,
  getGEvents,
  getOBDFaults
} from '@/services/monitoringService';

const getAuthToken = () => {
  let token = localStorage.getItem("token");
  if (!token) token = sessionStorage.getItem("token");
  return token;
};

const HistoricalDataModal = ({ isOpen, onClose, trackingCode = "SOL-2025-0072" }) => {
  const [activeTab, setActiveTab] = useState("historical");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [machineryList, setMachineryList] = useState([]);
  
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    machineryId: "",
    operatorId: ""
  });
  
  const [temporalFilter, setTemporalFilter] = useState({
    startDate: "2025-01-15T08:30",
    endDate: "2025-01-15T14:30"
  });

  // Función para cargar datos históricos
  const loadHistoricalData = async () => {
    if (!trackingCode) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const filterParams = {};
      
      if (filters.startDate) filterParams.start_date = filters.startDate;
      if (filters.endDate) filterParams.end_date = filters.endDate;
      if (filters.machineryId) filterParams.machinery_id = filters.machineryId;
      if (filters.operatorId) filterParams.operator_id = filters.operatorId;
      
      const data = await getHistoricalDataByRequest(trackingCode, filterParams);
      
      debugger; // 🔍 Inspecciona 'data' aquí
      
      setHistoricalData(data);
      setMachineryList(data || []);
    } catch (err) {
      console.error("Error loading historical data:", err);
      
      // Extraer mensaje de error específico
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.message 
        || "Error al cargar los datos históricos";
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen && trackingCode) {
      loadHistoricalData();
    }
  }, [isOpen, trackingCode]);

  // Aplicar filtros
  const handleApplyFilters = () => {
    loadHistoricalData();
  };

  // Mock data for general metrics
  const generalMetrics = {
    totalTime: "8h 31 min",
    averageSpeed: "25.3 km/h",
    averageConsumption: "12.5 L/h",
    totalDistance: "80 km",
    effectiveWorkingHours: "7h 20 min"
  };

  // Mock data for completed requests table
  const completedRequests = [
    {
      id: "SOL-2025-001",
      startDate: "15/01/2025 12:30",
      finishDate: "28/01/2025 14:30",
      machinery: "Excavadora CAT-320",
      operator: "Juan Pérez",
      client: "Constructora ABC",
      distanceTraveled: "45.2 km",
      status: "Finalizado"
    }
  ];

  // Columns for completed requests table
  const tableColumns = [
    { accessorKey: "id", header: "ID de Solicitud" },
    { accessorKey: "startDate", header: "Fecha de inicio" },
    { accessorKey: "finishDate", header: "Fecha de finalización" },
    { accessorKey: "machinery", header: "Maquinaria" },
    { accessorKey: "operator", header: "Operador" },
    { accessorKey: "client", header: "Cliente" },
    { accessorKey: "distanceTraveled", header: "Distancia recorrida" },
    { 
      accessorKey: "status", 
      header: "Estado",
      cell: ({ getValue }) => (
        <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
          {getValue()}
        </span>
      )
    }
  ];

  // Mock data for request information
  const requestInfo = {
    trackingCode: "SOL-2025-001",
    client: "Constructora El Dorado S.A.S",
    startDate: "15/01/2025 12:30",
    endDate: "28/01/2025 14:30",
    totalDistance: "45.2 km",
    machinery: "Excavadora CAT-320",
    operator: "Juan Pérez"
  };

  // Mock data for general performance
  const performanceData = {
    machineName: "Excavadora CAT 320",
    totalOperatingTime: "10h",
    operator: "Juan Pérez",
    averageConsumption: "14L/h",
    totalGEvents: "5",
    averageTemperature: "78°C",
    averageEngineLoad: "76%",
    chartData: [
      { name: 'Viaje seleccionado', off: 15, on: 85, inMotion: 72 },
      { name: 'Viaje total', off: 23, on: 78, inMotion: 58 }
    ]
  };

  // Mock data for G-Events
  const gEvents = [
    { type: "Intensidad de Frenado", date: "2024-01-17 10:30", duration: "30 min", intensity: "-0.8G" },
    { type: "Intensidad de Aceleración", date: "2024-01-17 10:30", duration: "10 min", intensity: "+0.9G" },
    { type: "Intensidad de Curva", date: "2024-01-17 10:30", duration: "15 min", intensity: "0.7G" }
  ];

  // Mock data for OBD Faults
  const obdFaults = [
    { fault: "P0171", example: "Ejemplo", date: "2024-01-11 17:30" },
    { fault: "P0177", example: "Ejemplo", date: "2024-01-11 17:32" }
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
              Datos históricos por Máquina u Operador
            </Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Cerrar modal" className="p-2 text-secondary hover:text-primary rounded-full transition-colors cursor-pointer" onClick={onClose}>
                <FaTimes className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="sr-only">Panel de monitoreo de datos históricos</Dialog.Description>

          <div className="p-6 space-y-6">
            
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="text-sm text-secondary">Cargando datos históricos...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-4 rounded-lg border border-red-500 bg-red-50 dark:bg-red-900/20">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            )}
            
            {/* General Filter */}
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
              <h3 className="text-sm font-semibold text-primary mb-3">Filtro general</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-secondary mb-2">Maquinaria</label>
                  <select 
                    className="input-theme w-full text-sm"
                    value={filters.machinery}
                    onChange={(e) => setFilters({...filters, machinery: e.target.value})}
                  >
                    <option value="">Maquinaria</option>
                    <option value="cat320">Excavadora CAT-320</option>
                    <option value="cat797">Volqueta CAT-797</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-secondary mb-2">Operador</label>
                  <select 
                    className="input-theme w-full text-sm"
                    value={filters.operator}
                    onChange={(e) => setFilters({...filters, operator: e.target.value})}
                  >
                    <option value="">Operador</option>
                    <option value="juan">Juan Pérez</option>
                    <option value="carlos">Carlos Martínez</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-secondary mb-2">Fecha de inicio</label>
                  <input 
                    type="datetime-local" 
                    className="input-theme w-full text-sm"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs text-secondary mb-2">Fecha de fin</label>
                  <input 
                    type="datetime-local" 
                    className="input-theme w-full text-sm"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button 
                  className="btn-primary px-6 py-2 rounded-lg text-sm font-medium"
                  onClick={handleApplyFilters}
                >
                  Aplicar
                </button>
              </div>
            </div>

            {/* General Metrics Information */}
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
              <h3 className="text-sm font-semibold text-primary mb-4">Información de Métricas Generales</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-secondary mb-1">Tiempo total</p>
                  <p className="text-sm font-bold text-primary">{generalMetrics.totalTime}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary mb-1">Velocidad promedio</p>
                  <p className="text-sm font-bold text-primary">{generalMetrics.averageSpeed}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary mb-1">Consumo promedio</p>
                  <p className="text-sm font-bold text-primary">{generalMetrics.averageConsumption}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary mb-1">Distancia total recorrida</p>
                  <p className="text-sm font-bold text-primary">{generalMetrics.totalDistance}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary mb-1">Horas efectivas de trabajo</p>
                  <p className="text-sm font-bold text-primary">{generalMetrics.effectiveWorkingHours}</p>
                </div>
              </div>
            </div>

            {/* Completed Requests Table */}
            <div>
              <h3 className="text-sm font-semibold text-primary mb-3">Solicitudes Completadas</h3>
              <TableList 
                columns={tableColumns}
                data={completedRequests}
                loading={false}
                globalFilter=""
                onGlobalFilterChange={() => {}}
              />
            </div>

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
                  <p className="text-secondary mb-1">Fecha de inicio</p>
                  <p className="text-primary font-medium">{requestInfo.startDate}</p>
                </div>
                <div>
                  <p className="text-secondary mb-1">Fecha de fin</p>
                  <p className="text-primary font-medium">{requestInfo.endDate}</p>
                </div>
                <div>
                  <p className="text-secondary mb-1">Distancia total recorrida</p>
                  <p className="text-primary font-medium">{requestInfo.totalDistance}</p>
                </div>
                <div>
                  <p className="text-secondary mb-1">Maquinaria</p>
                  <p className="text-primary font-medium">{requestInfo.machinery}</p>
                </div>
                <div className="md:col-span-3">
                  <p className="text-secondary mb-1">Operador</p>
                  <p className="text-primary font-medium">{requestInfo.operator}</p>
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

            {/* Tabs Navigation */}
            <div className="flex gap-1 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <button 
                onClick={() => setActiveTab("general")} 
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === "general" ? 'text-primary' : 'text-secondary hover:text-primary'}`}
              >
                Rendimiento General
                {activeTab === "general" && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--color-primary)' }} />}
              </button>
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
              {/* General Performance Tab */}
              {activeTab === "general" && (
                <div className="space-y-6">
                  <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                    <h3 className="text-base font-semibold text-primary mb-4">Rendimiento General</h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left side - Machine info */}
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded flex-shrink-0" style={{ backgroundColor: 'var(--color-background-tertiary)' }}>
                          <div className="w-full h-full flex items-center justify-center text-secondary text-xs">IMG</div>
                        </div>
                        <div className="flex-1 space-y-2 text-sm">
                          <p className="font-bold text-primary text-lg">{performanceData.machineName}</p>
                          <p className="text-secondary">Tiempo total de operación: <span className="text-primary font-medium">{performanceData.totalOperatingTime}</span></p>
                          <p className="text-secondary">Operador: <span className="text-primary font-medium">{performanceData.operator}</span></p>
                          <p className="text-secondary">Consumo promedio: <span className="text-primary font-medium">{performanceData.averageConsumption}</span></p>
                          <p className="text-secondary">Total eventos G: <span className="text-primary font-medium">{performanceData.totalGEvents}</span></p>
                          <p className="text-secondary">Temperatura promedio: <span className="text-primary font-medium">{performanceData.averageTemperature}</span></p>
                          <p className="text-secondary">Carga promedio del motor: <span className="text-primary font-medium">{performanceData.averageEngineLoad}</span></p>
                        </div>
                      </div>

                      {/* Right side - Chart */}
                      <div className="flex flex-col items-center justify-center w-full">
                        <h4 className="text-sm font-semibold text-primary mb-4">Gráfico de porcentaje de uso</h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={performanceData.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
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
                              wrapperStyle={{ fontSize: '12px' }}
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
                    </div>
                  </div>
                </div>
              )}

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

                  {/* G-Events and OBD Faults */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* G-Events */}
                    <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                      <h3 className="text-sm font-semibold text-primary mb-4">Eventos G</h3>
                      <div className="space-y-3 text-xs">
                        {gEvents.map((event, index) => (
                          <div key={index} className="pb-3 border-b last:border-b-0" style={{ borderColor: 'var(--color-border)' }}>
                            <div className="flex items-start justify-between mb-1">
                              <p className="font-medium text-primary">{event.type}</p>
                              <span className="text-secondary text-[10px]">{event.date}</span>
                            </div>
                            <p className="text-secondary">Duración: <span className="text-primary font-medium">{event.duration}</span></p>
                            <p className="text-secondary">Intensidad: <span className="text-error font-bold">{event.intensity}</span></p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* OBD Faults */}
                    <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                      <h3 className="text-sm font-semibold text-primary mb-4">Fallas OBD</h3>
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

export default HistoricalDataModal;
