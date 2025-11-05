import React, { useState } from "react";
import { FiX } from "react-icons/fi";

const HistoricalDataModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("general");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[40] flex items-center justify-center">
      <div className="fixed inset-0 z-[0]" onClick={onClose}></div>
      <div className="relative modal-theme rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-auto">
        {/* Header del Modal */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-primary">
            Datos históricos por Máquina u Operador
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6">
          {/* Filtros Generales */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-primary mb-4">
              Filtro general
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maquinaria
                </label>
                <select className="parametrization-input w-full">
                  <option value=""></option>
                  <option value="excavadora">Excavadora CAT-320</option>
                  <option value="tractor">Tractor John Deere</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operador
                </label>
                <select className="parametrization-input w-full">
                  <option value=""></option>
                  <option value="juan">Juan Pérez</option>
                  <option value="maria">María García</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  defaultValue="2025-01-15"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de fin
                </label>
                <input
                  type="date"
                  defaultValue="2025-01-15"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            <div className="mt-4">
              <button className="bg-black text-white px-8 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium">
                Aplicar
              </button>
            </div>
          </div>

          {/* Contenido siempre visible */}
          {/* General Metrics Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-primary mb-4">
              Información de Métricas Generales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="mb-2">
                  <span className="text-sm text-secondary">Tiempo total</span>
                </div>
                <div className="text-base font-medium text-primary">
                  8h 43 min
                </div>
                <div className="mt-4 mb-2">
                  <span className="text-sm text-secondary">
                    Distancia total recorrida
                  </span>
                </div>
                <div className="text-base font-medium text-primary">
                  150 km
                </div>
              </div>
              <div>
                <div className="mb-2">
                  <span className="text-sm text-secondary">Velocidad promedio</span>
                </div>
                <div className="text-base font-medium text-primary">
                  25.3 km/h
                </div>
                <div className="mt-4 mb-2">
                  <span className="text-sm text-secondary">
                    Horas de trabajo efectivas
                  </span>
                </div>
                <div className="text-base font-medium text-primary">
                  7h 20 min
                </div>
              </div>
              <div>
                <div className="mb-2">
                  <span className="text-sm text-secondary">
                    Consumo promedio
                  </span>
                </div>
                <div className="text-base font-medium text-primary">
                  12.5 L/h
                </div>
              </div>
            </div>
          </div>

          {/* Completed Requests */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-primary mb-4">
              Solicitudes Completadas
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y">
                <thead className="">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                      ID Solicitud
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha inicio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha fin
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Maquinaria
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operador
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Distancia recorrida
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-primary">
                      SOL-2025-001
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary">
                      15/01/2025 12:30
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary">
                      28/01/2025 14:30
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary">
                      Excavadora CAT-320
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary">
                      Juan Pérez
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary">
                      Constructora ABC
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary">
                      45.2 km
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Finished
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-center mt-4 space-x-2">
              <button className="px-3 py-1 text-sm text-gray-500">
                Previous
              </button>
              <button className="px-3 py-1 text-sm bg-black text-white rounded">
                1
              </button>
              <button className="px-3 py-1 text-sm text-gray-500">2</button>
              <button className="px-3 py-1 text-sm text-gray-500">3</button>
              <span className="px-3 py-1 text-sm text-gray-500">...</span>
              <button className="px-3 py-1 text-sm text-gray-500">67</button>
              <button className="px-3 py-1 text-sm text-gray-500">68</button>
              <button className="px-3 py-1 text-sm text-gray-500">Next</button>
            </div>
          </div>

          {/* Request Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-primary mb-4">
              Request Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
              <div>
                <div className="mb-4">
                  <span className="text-secondary">Tracking code</span>
                  <div className="font-medium text-primary">SOL-2025-001</div>
                </div>
                <div>
                  <span className="text-secondary">Total distance traveled</span>
                  <div className="font-medium text-primary">150 km</div>
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <span className="text-secondary">Client</span>
                  <div className="font-medium text-primary">
                    Constructora El Dorado S.A.S
                  </div>
                </div>
                <div>
                  <span className="text-secondary">Machinery</span>
                  <div className="font-medium text-primary">Excavadora CAT-320</div>
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <span className="text-secondary">Start date</span>
                  <div className="font-medium text-primary">15/01/2025 12:30</div>
                </div>
                <div>
                  <span className="text-secondary">Operator</span>
                  <div className="font-medium text-primary">Juan Pérez</div>
                </div>
              </div>
              <div>
                <span className="text-secondary">End date</span>
                <div className="font-medium text-primary">28/01/2025 14:30</div>
              </div>
            </div>
          </div>

          {/* Temporal filter */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-primary mb-4">
              Temporal filter
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start date
                </label>
                <input
                  type="datetime-local"
                  defaultValue="2025-01-15T08:30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End date
                </label>
                <input
                  type="datetime-local"
                  defaultValue="2025-01-15T14:30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <button className="w-full bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium">
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Tabs de Navegación - Siempre visibles */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("general")}
                  className={`py-2 px-1 text-sm font-medium ${
                    activeTab === "general"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Rendimiento General
                </button>
                <button
                  onClick={() => setActiveTab("historical")}
                  className={`py-2 px-1 text-sm font-medium ${
                    activeTab === "historical"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Gráficos Históricos
                </button>
                <button
                  onClick={() => setActiveTab("performance")}
                  className={`py-2 px-1 text-sm font-medium ${
                    activeTab === "performance"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Información de Rendimiento
                </button>
                <button
                  onClick={() => setActiveTab("map")}
                  className={`py-2 px-1 text-sm font-medium ${
                    activeTab === "map"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Mapa Interactivo
                </button>
              </nav>
            </div>
          </div>

          {/* Contenido de General Performance */}
          {activeTab === "general" && (
            <div className="mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Información de la máquina */}
                <div className=" modal-theme p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-primary mb-4">Excavadora CAT 320</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-secondary">Tiempo total de operación:</span> <span className="font-medium text-primary">10h</span></div>
                    <div><span className="text-secondary">Operador:</span> <span className="font-medium text-primary">Juan Perez</span></div>
                    <div><span className="text-secondary">Consumo promedio:</span> <span className="font-medium text-primary">14L/h</span></div>
                    <div><span className="text-secondary">Total de eventos:</span> <span className="font-medium text-primary">4</span></div>
                    <div><span className="text-secondary">Temperatura promedio:</span> <span className="font-medium text-primary">78 °C</span></div>
                    <div><span className="text-secondary">Carga promedio del motor:</span> <span className="font-medium text-primary">75%</span></div>
                  </div>
                </div>

                {/* Gráfico de porcentajes */}
                <div className="lg:col-span-2 modal-theme p-4 rounded-lg border">
                  <h4 className="text-lg font-medium text-primary mb-4">Gráfico de porcentaje de uso</h4>
                  <div className="h-64 flex items-end justify-center space-x-8">
                    {/* Selected Journey */}
                    <div className="flex flex-col items-center">
                      <div className="text-xs text-gray-600 mb-2">Viaje Seleccionado</div>
                      <div className="w-16 bg-gray-200 rounded-t relative" style={{height: '80px'}}>
                        <div className="absolute bottom-0 w-full bg-yellow-400 rounded-t text-white text-xs font-bold flex items-center justify-center" style={{height: '70px'}}>85</div>
                        <div className="absolute bottom-0 w-full bg-green-500 text-white text-xs font-bold flex items-center justify-center" style={{height: '45px'}}>76</div>
                        <div className="absolute bottom-0 w-full bg-black text-white text-xs font-bold flex items-center justify-center" style={{height: '15px'}}>15</div>
                      </div>
                    </div>
                    
                    {/* Total Journey */}
                    <div className="flex flex-col items-center">
                      <div className="text-xs text-gray-600 mb-2">Viaje Total</div>
                      <div className="w-16 bg-gray-200 rounded-t relative" style={{height: '80px'}}>
                        <div className="absolute bottom-0 w-full bg-yellow-400 rounded-t text-white text-xs font-bold flex items-center justify-center" style={{height: '60px'}}>81</div>
                        <div className="absolute bottom-0 w-full bg-green-500 text-white text-xs font-bold flex items-center justify-center" style={{height: '35px'}}>54</div>
                        <div className="absolute bottom-0 w-full bg-black text-white text-xs font-bold flex items-center justify-center" style={{height: '20px'}}>20</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Leyenda */}
                  <div className="flex justify-center space-x-6 mt-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-black rounded-full mr-2"></div>
                      <span>Apagado</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                      <span>Encendido</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span>En movimiento</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contenido de Historical Charts - 8 gráficos */}
          {activeTab === "historical" && (
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Speed */}
                <div className="modal-theme p-4 rounded-lg border">
                  <h4 className="text-md font-medium text-primary mb-2">Velocidad</h4>
                  <p className="text-sm text-secondary mb-3">Prom: 32.5 km/h | Max: 65.2 km/h | Min: 0.1 km/h</p>
                  <div className="h-40 bg-gray-50 rounded flex items-center justify-center mb-2">
                    <div className="w-full h-full relative">
                      <svg className="w-full h-full" viewBox="0 0 300 120">
                        <polyline
                          fill="none"
                          stroke="#00BFFF"
                          strokeWidth="2"
                          points="20,100 40,90 60,50 80,60 100,40 120,30 140,50 160,70 180,60 200,50 220,40 240,45 260,50 280,55"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>8:30</span>
                    <span>9:30</span>
                    <span>10:30</span>
                    <span>11:30</span>
                    <span>12:30</span>
                    <span>13:30</span>
                    <span>14:30</span>
                  </div>
                </div>

                {/* Revolutions */}
                <div className="modal-theme p-4 rounded-lg border">
                  <h4 className="text-md font-medium text-primary mb-2">Revoluciones</h4>
                  <p className="text-sm text-secondary mb-3">Prom: 750 RPM | Max: 1800 RPM | Min: 0.3 RPM</p>
                  <div className="h-40 bg-gray-50 rounded flex items-center justify-center mb-2">
                    <div className="w-full h-full relative">
                      <svg className="w-full h-full" viewBox="0 0 300 120">
                        <polyline
                          fill="none"
                          stroke="#00BFFF"
                          strokeWidth="2"
                          points="20,100 40,85 60,45 80,55 100,35 120,25 140,45 160,65 180,55 200,45 220,35 240,40 260,45 280,50"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>8:30</span>
                    <span>9:30</span>
                    <span>10:30</span>
                    <span>11:30</span>
                    <span>12:30</span>
                    <span>13:30</span>
                    <span>14:30</span>
                  </div>
                </div>

                {/* Temperature */}
                <div className="modal-theme p-4 rounded-lg border">
                  <h4 className="text-md font-medium text-primary mb-2">Temperatura</h4>
                  <p className="text-sm text-secondary mb-3">Prom: 60°C | Max: 95°C | Min: 0°C</p>
                  <div className="h-40 bg-gray-50 rounded flex items-center justify-center mb-2">
                    <div className="w-full h-full relative">
                      <svg className="w-full h-full" viewBox="0 0 300 120">
                        <polyline
                          fill="none"
                          stroke="#00BFFF"
                          strokeWidth="2"
                          points="20,90 40,80 60,45 80,35 100,20 120,25 140,40 160,60 180,55 200,50 220,45 240,50 260,55 280,60"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>8:30</span>
                    <span>9:30</span>
                    <span>10:30</span>
                    <span>11:30</span>
                    <span>12:30</span>
                    <span>13:30</span>
                    <span>14:30</span>
                  </div>
                </div>

                {/* Fuel level */}
                <div className="modal-theme p-4 rounded-lg border">
                  <h4 className="text-md font-medium text-primary mb-2">Nivel de combustible</h4>
                  <p className="text-sm text-secondary mb-3">Prom: 43% | Max: 100% | Min: 10%</p>
                  <div className="h-40 bg-gray-50 rounded flex items-center justify-center mb-2">
                    <div className="w-full h-full relative">
                      <svg className="w-full h-full" viewBox="0 0 300 120">
                        <polyline
                          fill="none"
                          stroke="#00BFFF"
                          strokeWidth="2"
                          points="20,30 40,25 60,35 80,45 100,55 120,65 140,70 160,75 180,80 200,85 220,90 240,95 260,100 280,105"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>8:30</span>
                    <span>9:30</span>
                    <span>10:30</span>
                    <span>11:30</span>
                    <span>12:30</span>
                    <span>13:30</span>
                    <span>14:30</span>
                  </div>
                </div>

                {/* Engine load */}
                <div className="modal-theme p-4 rounded-lg border">
                  <h4 className="text-md font-medium text-primary mb-2">Carga del motor</h4>
                  <p className="text-sm text-secondary mb-3">Prom: 75°C | Max: 95°C | Min: 0°C</p>
                  <div className="h-40 bg-gray-50 rounded flex items-center justify-center mb-2">
                    <div className="w-full h-full relative">
                      <svg className="w-full h-full" viewBox="0 0 300 120">
                        {/* Área rellena con gradiente rojo-azul */}
                        <defs>
                          <linearGradient id="engineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{stopColor: '#FF6B6B', stopOpacity: 0.8}} />
                            <stop offset="100%" style={{stopColor: '#4FC3F7', stopOpacity: 0.8}} />
                          </linearGradient>
                        </defs>
                        <polygon
                          fill="url(#engineGradient)"
                          points="20,120 20,40 60,25 100,15 140,30 180,20 220,35 260,25 280,30 280,120"
                        />
                        <polyline
                          fill="none"
                          stroke="#FF6B6B"
                          strokeWidth="2"
                          points="20,40 60,25 100,15 140,30 180,20 220,35 260,25 280,30"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>8:30</span>
                    <span>9:30</span>
                    <span>10:30</span>
                    <span>11:30</span>
                    <span>12:30</span>
                    <span>13:30</span>
                    <span>14:30</span>
                  </div>
                </div>

                {/* Oil level */}
                <div className="modal-theme p-4 rounded-lg border">
                  <h4 className="text-md font-medium text-primary mb-2">Nivel de aceite</h4>
                  <p className="text-sm text-secondary mb-3">Prom: 60% | Max: 100% | Min: 20%</p>
                  <div className="h-40 bg-gray-50 rounded flex items-center justify-center mb-2">
                    <div className="w-full h-full relative">
                      <svg className="w-full h-full" viewBox="0 0 300 120">
                        <polyline
                          fill="none"
                          stroke="#00BFFF"
                          strokeWidth="2"
                          points="20,25 40,30 60,35 80,40 100,45 120,50 140,55 160,60 180,65 200,70 220,75 240,80 260,85 280,90"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>8:30</span>
                    <span>9:30</span>
                    <span>10:30</span>
                    <span>11:30</span>
                    <span>12:30</span>
                    <span>13:30</span>
                    <span>14:30</span>
                  </div>
                </div>

                {/* Total Odometer */}
                <div className="modal-theme p-4 rounded-lg border">
                  <h4 className="text-md font-medium text-primary mb-2">Odómetro total</h4>
                  <p className="text-sm text-secondary mb-3">Max: 6550 m | Min: 1500 m</p>
                  <div className="h-40 bg-gray-50 rounded flex items-center justify-center mb-2">
                    <div className="w-full h-full relative">
                      <svg className="w-full h-full" viewBox="0 0 300 120">
                        <polyline
                          fill="none"
                          stroke="#00BFFF"
                          strokeWidth="2"
                          points="20,100 40,95 60,90 80,85 100,80 120,75 140,70 160,65 180,60 200,55 220,50 240,45 260,40 280,35"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>8:30</span>
                    <span>9:30</span>
                    <span>10:30</span>
                    <span>11:30</span>
                    <span>12:30</span>
                    <span>13:30</span>
                    <span>14:30</span>
                  </div>
                </div>

                {/* Trip Odometer */}
                <div className="modal-theme p-4 rounded-lg border">
                  <h4 className="text-md font-medium text-primary mb-2">Odómetro de viaje</h4>
                  <p className="text-sm text-secondary mb-3">Max: 2000 m | Min: 0 m</p>
                  <div className="h-40 bg-gray-50 rounded flex items-center justify-center mb-2">
                    <div className="w-full h-full relative">
                      <svg className="w-full h-full" viewBox="0 0 300 120">
                        <polyline
                          fill="none"
                          stroke="#00BFFF"
                          strokeWidth="2"
                          points="20,110 40,105 60,100 80,90 100,80 120,70 140,60 160,55 180,50 200,45 220,40 240,35 260,30 280,25"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>8:30</span>
                    <span>9:30</span>
                    <span>10:30</span>
                    <span>11:30</span>
                    <span>12:30</span>
                    <span>13:30</span>
                    <span>14:30</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contenido de Performance Information */}
          {activeTab === "performance" && (
            <div className="mb-6">
              {/* Fuel Consumption Information */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-primary mb-4">Información de Consumo de Combustible</h3>
                <div className="modal-theme p-6 rounded-lg border">
                  <div className="h-64 relative">
                    <svg className="w-full h-full" viewBox="0 0 400 200">
                      <defs>
                        <linearGradient id="fuelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{stopColor: '#4FC3F7', stopOpacity: 0.8}} />
                          <stop offset="100%" style={{stopColor: '#4FC3F7', stopOpacity: 0.1}} />
                        </linearGradient>
                        <linearGradient id="consumptionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{stopColor: '#66BB6A', stopOpacity: 0.8}} />
                          <stop offset="100%" style={{stopColor: '#66BB6A', stopOpacity: 0.1}} />
                        </linearGradient>
                      </defs>
                      
                      {/* Fuel level area */}
                      <polygon
                        fill="url(#fuelGradient)"
                        points="20,180 20,40 60,35 100,30 140,40 180,45 220,50 260,60 300,70 340,80 380,85 380,180"
                      />
                      
                      {/* Instant fuel consumption area */}
                      <polygon
                        fill="url(#consumptionGradient)"
                        points="20,180 20,120 60,110 100,100 140,95 180,90 220,85 260,80 300,75 340,70 380,65 380,180"
                      />
                      
                      {/* Líneas */}
                      <polyline
                        fill="none"
                        stroke="#4FC3F7"
                        strokeWidth="2"
                        points="20,40 60,35 100,30 140,40 180,45 220,50 260,60 300,70 340,80 380,85"
                      />
                      <polyline
                        fill="none"
                        stroke="#66BB6A"
                        strokeWidth="2"
                        points="20,120 60,110 100,100 140,95 180,90 220,85 260,80 300,75 340,70 380,65"
                      />
                    </svg>
                    
                    {/* Ejes Y */}
                    <div className="absolute left-0 top-0 text-xs text-gray-500 flex flex-col justify-between h-full py-2">
                      <span>100</span>
                      <span>80</span>
                      <span>60</span>
                      <span>40</span>
                      <span>20</span>
                      <span>0</span>
                    </div>
                    
                    {/* Eje Y derecho */}
                    <div className="absolute right-0 top-0 text-xs text-gray-500 flex flex-col justify-between h-full py-2">
                      <span>10</span>
                      <span>8</span>
                      <span>6</span>
                      <span>4</span>
                      <span>2</span>
                      <span>0</span>
                    </div>
                  </div>
                  
                  {/* Eje X */}
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>8:30</span>
                    <span>9:30</span>
                    <span>10:30</span>
                    <span>11:30</span>
                    <span>12:30</span>
                    <span>13:30</span>
                    <span>14:30 Time</span>
                  </div>
                  
                  {/* Leyenda */}
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center space-x-6">
                      <span className="flex items-center text-sm">
                        <span className="w-3 h-3 bg-blue-400 rounded mr-2"></span>
                        Nivel de combustible
                      </span>
                      <span className="flex items-center text-sm">
                        <span className="w-3 h-3 bg-green-500 rounded mr-2"></span>
                        Consumo instantáneo de combustible
                      </span>
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <span>%</span>
                      <span>L/h</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Information */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-primary mb-4">Información de Rendimiento</h3>
                <div className="modal-theme p-6 rounded-lg border">
                  <div className="h-64 relative">
                    <svg className="w-full h-full" viewBox="0 0 400 200">
                      <defs>
                        <linearGradient id="speedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{stopColor: '#4FC3F7', stopOpacity: 0.8}} />
                          <stop offset="100%" style={{stopColor: '#4FC3F7', stopOpacity: 0.1}} />
                        </linearGradient>
                        <linearGradient id="rpmGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{stopColor: '#66BB6A', stopOpacity: 0.8}} />
                          <stop offset="100%" style={{stopColor: '#66BB6A', stopOpacity: 0.1}} />
                        </linearGradient>
                      </defs>
                      
                      {/* Speed area */}
                      <polygon
                        fill="url(#speedGradient)"
                        points="20,180 20,80 60,70 100,50 140,60 180,40 220,45 260,50 300,55 340,60 380,65 380,180"
                      />
                      
                      {/* RPM area */}
                      <polygon
                        fill="url(#rpmGradient)"
                        points="20,180 20,100 60,90 100,70 140,80 180,60 220,65 260,70 300,75 340,80 380,85 380,180"
                      />
                      
                      {/* Líneas */}
                      <polyline
                        fill="none"
                        stroke="#4FC3F7"
                        strokeWidth="2"
                        points="20,80 60,70 100,50 140,60 180,40 220,45 260,50 300,55 340,60 380,65"
                      />
                      <polyline
                        fill="none"
                        stroke="#66BB6A"
                        strokeWidth="2"
                        points="20,100 60,90 100,70 140,80 180,60 220,65 260,70 300,75 340,80 380,85"
                      />
                      
                      {/* Puntos en la línea */}
                      <circle cx="180" cy="40" r="3" fill="#FF6B6B" />
                      <circle cx="220" cy="65" r="3" fill="#FFD54F" />
                    </svg>
                    
                    {/* Ejes Y */}
                    <div className="absolute left-0 top-0 text-xs text-gray-500 flex flex-col justify-between h-full py-2">
                      <span>100</span>
                      <span>80</span>
                      <span>60</span>
                      <span>40</span>
                      <span>20</span>
                      <span>0</span>
                    </div>
                    
                    {/* Eje Y derecho */}
                    <div className="absolute right-0 top-0 text-xs text-gray-500 flex flex-col justify-between h-full py-2">
                      <span>2500</span>
                      <span>2000</span>
                      <span>1500</span>
                      <span>1000</span>
                      <span>500</span>
                      <span>0</span>
                    </div>
                  </div>
                  
                  {/* Eje X */}
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>8:30</span>
                    <span>9:30</span>
                    <span>10:30</span>
                    <span>11:30</span>
                    <span>12:30</span>
                    <span>13:30</span>
                    <span>14:30 Time</span>
                  </div>
                  
                  {/* Leyenda */}
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center space-x-6">
                      <span className="flex items-center text-sm">
                        <span className="w-3 h-3 bg-blue-400 rounded mr-2"></span>
                        Velocidad
                      </span>
                      <span className="flex items-center text-sm">
                        <span className="w-3 h-3 bg-green-500 rounded mr-2"></span>
                        RPM
                      </span>
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <span>Velocidad (Km/h)</span>
                      <span>RPM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Information */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-primary mb-4">Información de Gráficos</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* G-Events */}
                  <div>
                    <h4 className="text-md font-medium text-primary mb-4">Eventos G</h4>
                    <div className="modal-theme border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <tbody className="modal-theme divide-y divide-gray-200">
                          <tr>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                                <span className="text-primary">Frenado</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-secondary">2025-01-17 10:30</td>
                            <td className="px-4 py-3 text-sm text-secondary">Intensidad: +0.63</td>
                            <td className="px-4 py-3 text-sm text-secondary">Duración: 10 min</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                                <span className="text-primary">Aceleración</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-secondary">2025-01-17 10:45</td>
                            <td className="px-4 py-3 text-sm text-secondary">Intensidad: +0.61</td>
                            <td className="px-4 py-3 text-sm text-secondary">Duración: 8 min</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-black rounded mr-2"></div>
                                <span className="text-primary">Curva</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-secondary">2025-01-17 11:15</td>
                            <td className="px-4 py-3 text-sm text-secondary">Intensidad: +0.75</td>
                            <td className="px-4 py-3 text-sm text-secondary">Duración: 15 min</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* OBD Faults */}
                  <div>
                    <h4 className="text-md font-medium text-primary mb-4">Fallas OBD</h4>
                    <div className="modal-theme border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <tbody className="modal-theme divide-y divide-gray-200">
                          <tr>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                                <span className="text-primary">P0171</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-secondary">Example</td>
                            <td className="px-4 py-3 text-sm text-secondary">2025-01-17 11:30</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                                <span className="text-primary">P0420</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-secondary">Example</td>
                            <td className="px-4 py-3 text-sm text-secondary">2025-01-17 12:30</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                                <span className="text-primary">P0507</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-secondary">Example</td>
                            <td className="px-4 py-3 text-sm text-secondary">2025-01-17 13:30</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leyenda de colores */}
              <div className="flex justify-center space-x-8 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                  <span>Aceleración</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                  <span>Curva</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                  <span>Estacionario</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                  <span>En movimiento</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-black rounded mr-2"></div>
                  <span>Apagado</span>
                </div>
              </div>
            </div>
          )}

          {/* Contenido de Interactive Map */}
          {activeTab === "map" && (
            <div className="mb-6">
              <div className="modal-theme p-6 rounded-lg border">
                <div className="h-96 bg-gray-100 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 600 400">
                      {/* Fondo del mapa */}
                      <rect width="600" height="400" fill="#f3f4f6" />
                      
                      {/* Rutas */}
                      {/* Outbound route (verde) */}
                      <path
                        d="M 50 350 L 150 300 L 250 250"
                        stroke="#22C55E"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                      />
                      
                      {/* Working route (azul) */}
                      <path
                        d="M 250 250 L 350 200 L 450 150 L 500 100 L 550 80 L 580 50"
                        stroke="#3B82F6"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                      />
                      
                      {/* Return route (rojo) */}
                      <path
                        d="M 200 150 L 300 200 L 400 250"
                        stroke="#EF4444"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                      />
                      
                      {/* Puntos de inicio y fin */}
                      <circle cx="50" cy="350" r="6" fill="#22C55E" stroke="white" strokeWidth="2" />
                      <circle cx="350" cy="200" r="6" fill="#3B82F6" stroke="white" strokeWidth="2" />
                      <circle cx="400" cy="250" r="6" fill="#EF4444" stroke="white" strokeWidth="2" />
                      
                      {/* Texto "Map" */}
                      <text x="300" y="200" textAnchor="middle" className="text-lg font-medium" fill="#6B7280">
                        Map
                      </text>
                    </svg>
                  </div>
                </div>
                
                {/* Leyenda del mapa */}
                <div className="flex justify-center space-x-8 mt-6 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span>Salida</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                    <span>Trabajando</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                    <span>Regreso</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoricalDataModal;
