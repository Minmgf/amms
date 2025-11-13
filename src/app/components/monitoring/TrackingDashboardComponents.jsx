"use client";
import React, { useEffect, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Dot } from 'recharts';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Importar Leaflet dinámicamente para evitar SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// Iconos personalizados para Leaflet
const createCustomIcon = (color) => {
  if (typeof window !== 'undefined') {
    const L = require('leaflet');
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      "><div style="
        background-color: white;
        width: 6px;
        height: 6px;
        border-radius: 50%;
      "></div></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10]
    });
  }
  return null;
};

// Gauge Card Component (Velocímetro/Tacómetro)
export const GaugeCard = ({ label, value, max, unit, type, alert }) => {
  // Valor real sin limitar (para mostrar)
  const realValue = value || 0;
  
  // Valor clampeado solo para la rotación gráfica (no superar 180°)
  const clampedValue = Math.min(Math.max(realValue, 0), max);
  const percentage = (clampedValue / max) * 100;
  const rotation = (percentage / 100) * 180 - 90;
  
  // Determinar el color según el tipo y el valor real
  const getGradient = () => {
    if (type === 'speed') {
      return 'url(#speedGradient)';
    } else if (type === 'rpm') {
      return 'url(#rpmGradient)';
    }
    return 'var(--color-primary)';
  };

  // Determinar si hay alerta basado en umbrales (usando valor real)
  const hasAlert = alert || (type === 'speed' && realValue > 45) || (type === 'rpm' && realValue > 2800);

  return (
    <div 
      className="p-4 rounded-lg border flex flex-col items-center justify-center min-h-[200px] transition-all duration-500"
      style={{ 
        backgroundColor: hasAlert ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-background-secondary)',
        borderColor: hasAlert ? '#EF4444' : 'var(--color-border)',
        boxShadow: hasAlert ? '0 0 10px rgba(239, 68, 68, 0.2)' : 'none'
      }}
    >
      <p className="text-xs text-secondary mb-2">{label}</p>
      <div className="relative w-32 h-20">
        <svg className="w-full h-full" viewBox="0 0 160 80">
          {/* Definir gradientes */}
          <defs>
            <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#22C55E', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#F59E0B', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#EF4444', stopOpacity: 1 }} />
            </linearGradient>
            <linearGradient id="rpmGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#9CA3AF', stopOpacity: 1 }} />
              <stop offset="70%" style={{ stopColor: '#9CA3AF', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#EF4444', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          
          {/* Arco de fondo */}
          <path
            d="M 20 70 A 60 60 0 0 1 140 70"
            fill="none"
            stroke="#E5E5E5"
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          {/* Arco con gradiente */}
          <path
            d="M 20 70 A 60 60 0 0 1 140 70"
            fill="none"
            stroke={getGradient()}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * 188} 188`}
            style={{ transition: 'stroke-dasharray 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          />
          
          {/* Marcadores */}
          {[0, 25, 50, 75, 100].map((mark, i) => {
            const angle = (mark / 100) * 180 - 90;
            const rad = (angle * Math.PI) / 180;
            const x1 = 80 + 50 * Math.cos(rad);
            const y1 = 70 + 50 * Math.sin(rad);
            const x2 = 80 + 58 * Math.cos(rad);
            const y2 = 70 + 58 * Math.sin(rad);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#9CA3AF"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        
        {/* Aguja */}
        <div 
          className="absolute bottom-2 left-1/2 w-1 h-12 origin-bottom transition-all duration-700 ease-out"
          style={{ 
            backgroundColor: hasAlert ? '#EF4444' : '#1F2937',
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            borderRadius: '2px'
          }}
        />
        
        {/* Centro de la aguja */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gray-800 border-2 border-white transition-colors duration-500" style={{ backgroundColor: hasAlert ? '#EF4444' : '#1F2937' }} />
      </div>
      <p className="text-2xl font-bold text-primary mt-2 transition-colors duration-500" style={{ color: hasAlert ? '#EF4444' : 'var(--color-primary)' }}>{Math.round(realValue)}</p>
      <p className="text-xs text-secondary">{unit}</p>
    </div>
  );
};

// Circular Progress Component
export const CircularProgress = ({ label, value, color = "#3B82F6", alert = false }) => {
  // Valor real sin limitar (para mostrar)
  const realValue = value || 0;
  
  // Valor clampeado solo para la visualización gráfica (no superar 100%)
  const clampedValue = Math.min(Math.max(realValue, 0), 100);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;
  
  // Determinar alerta si el valor es muy alto (usando valor real)
  const hasAlert = alert || realValue > 90;
  const displayColor = hasAlert ? '#EF4444' : color;

  return (
    <div 
      className="p-4 rounded-lg border flex flex-col items-center justify-center min-h-[200px] transition-all duration-500"
      style={{ 
        backgroundColor: hasAlert ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-background-secondary)',
        borderColor: hasAlert ? '#EF4444' : 'var(--color-border)',
        boxShadow: hasAlert ? '0 0 10px rgba(239, 68, 68, 0.2)' : 'none'
      }}
    >
      <p className="text-xs text-secondary mb-3">{label}</p>
      <div className="relative w-28 h-28">
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
          {/* Círculo de fondo */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#E5E7EB"
            strokeWidth="10"
            fill="none"
          />
          {/* Círculo de progreso */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={displayColor}
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ 
              transition: 'stroke-dashoffset 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.5s ease'
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-3xl font-bold transition-colors duration-500" style={{ color: displayColor }}>{Math.round(realValue)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Info Card Component
export const InfoCard = ({ label, value, sublabel }) => {
  return (
    <div 
      className="p-3 rounded-lg border"
      style={{ 
        backgroundColor: 'var(--color-background-secondary)',
        borderColor: 'var(--color-border)' 
      }}
    >
      <p className="text-xs text-secondary mb-1">{label}</p>
      <p className="text-sm font-bold text-primary mb-0.5">{value}</p>
      {sublabel && <p className="text-xs text-secondary">{sublabel}</p>}
    </div>
  );
};

// Performance Chart Component with Recharts
export const PerformanceChart = ({ data = [] }) => {
  console.log('📈 PerformanceChart recibiendo datos:', {
    dataPoints: data.length,
    firstPoint: data[0],
    lastPoint: data[data.length - 1]
  });
  
  // Si no hay datos, usar datos por defecto
  const chartData = data.length > 0 ? data : [
    { time: '--', speed: 0, rpm: 0 }
  ];

  // Función para obtener el color del punto según el evento
  const getEventColor = (event) => {
    switch(event) {
      case 'braking': return '#F97316';
      case 'acceleration': return '#EF4444';
      case 'curve': return '#3B82F6';
      case 'off': return '#1F2937';
      case 'stationary': return '#EAB308';
      case 'motion': return '#22C55E';
      default: return '#3B82F6';
    }
  };

  // Custom Dot para mostrar puntos de eventos
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload.event) {
      return (
        <circle 
          cx={cx} 
          cy={cy} 
          r={4} 
          fill={getEventColor(payload.event)}
          stroke="white"
          strokeWidth={1}
        />
      );
    }
    return null;
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 rounded border shadow-lg" style={{ backgroundColor: 'var(--color-background)', borderColor: '#3B82F6' }}>
          <p className="text-xs font-bold text-primary mb-2">{data.time}</p>
          <p className="text-xs text-secondary">Velocidad: <span className="text-primary font-medium">{data.speed} km/h</span></p>
          <p className="text-xs text-secondary">RPM: <span className="text-primary font-medium">{data.rpm}</span></p>
          {data.event && (
            <p className="text-xs text-secondary mt-1">
              Evento: <span className="font-medium" style={{ color: getEventColor(data.event) }}>
                {data.event === 'acceleration' ? 'Aceleración' :
                 data.event === 'braking' ? 'Frenado' :
                 data.event === 'curve' ? 'Curva' :
                 data.event === 'motion' ? 'En movimiento' :
                 data.event === 'stationary' ? 'Estacionario' : 'Apagado'}
              </span>
            </p>
          )}
          {data.eventGValue && (
            <p className="text-xs text-secondary">Intensidad: <span className="text-primary font-medium">{data.eventGValue}G</span></p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Header con información de datos */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-primary">Velocidad (Km/h)</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B82F6' }}></div>
              <span className="text-xs text-secondary">Velocidad</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22C55E' }}></div>
              <span className="text-xs text-secondary">RPM</span>
            </div>
          </div>
          <span className="text-sm font-medium text-primary">RPM</span>
        </div>
        <div className="text-xs text-secondary bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
          📊 Mostrando {chartData.length} puntos de datos históricos (últimos ~25 minutos)
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorRpm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22C55E" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
            label={{ value: 'Velocidad (Km/h)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: 'var(--color-text-secondary)' } }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
            label={{ value: 'RPM', angle: 90, position: 'insideRight', style: { fontSize: 12, fill: 'var(--color-text-secondary)' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            yAxisId="left"
            type="monotone" 
            dataKey="speed" 
            stroke="#3B82F6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorSpeed)"
            dot={<CustomDot />}
            activeDot={{ r: 6 }}
          />
          <Area 
            yAxisId="right"
            type="monotone" 
            dataKey="rpm" 
            stroke="#22C55E" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorRpm)"
            dot={<CustomDot />}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Marcadores de eventos en el eje X */}
      <div className="relative w-full h-6 -mt-2">
        <div className="absolute inset-0 flex justify-around items-center px-12">
          {chartData.filter(d => d.event && d.event !== 'off' && d.event !== 'stationary' && d.event !== 'motion').map((point, index) => (
            <div 
              key={index}
              className="flex flex-col items-center"
              style={{ 
                position: 'absolute',
                left: `${(chartData.indexOf(point) / (chartData.length - 1)) * 100}%`,
                transform: 'translateX(-50%)'
              }}
            >
              <svg width="8" height="8" viewBox="0 0 8 8">
                <polygon points="4,0 8,8 0,8" fill={getEventColor(point.event)} />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Legend - Chart Information */}
      <div className="mt-4">
        <h4 className="text-xs font-semibold text-primary mb-3">Información del Gráfico</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F97316' }}></div>
            <span className="text-secondary">Frenado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
            <span className="text-secondary">Aceleración</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B82F6' }}></div>
            <span className="text-secondary">Curva</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#1F2937' }}></div>
            <span className="text-secondary">Apagado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EAB308' }}></div>
            <span className="text-secondary">Estacionario</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22C55E' }}></div>
            <span className="text-secondary">En movimiento</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fuel Consumption Chart Component with Recharts
export const FuelConsumptionChart = ({ data = [] }) => {
  console.log('⛽ FuelConsumptionChart recibiendo datos:', {
    dataPoints: data.length,
    firstPoint: data[0],
    lastPoint: data[data.length - 1]
  });
  
  // Si no hay datos, usar datos por defecto
  const chartData = data.length > 0 ? data : [
    { time: '--', fuelLevel: 0, consumption: 0 }
  ];

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 rounded border shadow-lg" style={{ backgroundColor: 'var(--color-background)', borderColor: '#3B82F6' }}>
          <p className="text-xs font-bold text-primary mb-2">{data.time}</p>
          <p className="text-xs text-secondary">Nivel de combustible: <span className="text-primary font-medium">{data.fuelLevel}%</span></p>
          <p className="text-xs text-secondary">Consumo instantáneo: <span className="text-primary font-medium">{data.consumption} L/h</span></p>
          {data.fuelUsedGps && (
            <p className="text-xs text-secondary mt-1">Combustible usado: <span className="text-primary font-medium">{data.fuelUsedGps.toFixed(1)} L</span></p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Header con información de datos */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-primary">%</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B82F6' }}></div>
              <span className="text-xs text-secondary">Nivel de combustible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22C55E' }}></div>
              <span className="text-xs text-secondary">Consumo instantáneo</span>
            </div>
          </div>
          <span className="text-sm font-medium text-primary">L/h</span>
        </div>
        <div className="text-xs text-secondary bg-green-50 dark:bg-green-900/20 p-2 rounded">
          ⛽ Mostrando {chartData.length} puntos de datos históricos (últimos ~25 minutos)
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22C55E" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
          />
          <YAxis 
            yAxisId="left"
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
            label={{ value: '%', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: 'var(--color-text-secondary)' } }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            domain={[0, 10]}
            tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
            label={{ value: 'L/h', angle: 90, position: 'insideRight', style: { fontSize: 12, fill: 'var(--color-text-secondary)' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            yAxisId="left"
            type="monotone" 
            dataKey="fuelLevel" 
            stroke="#3B82F6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorFuel)"
            dot={false}
          />
          <Area 
            yAxisId="right"
            type="monotone" 
            dataKey="consumption" 
            stroke="#22C55E" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorConsumption)"
            dot={{ r: 4, fill: '#6B7280', strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Tooltip Component - Para marcadores del mapa
export const MapTooltip = ({ machinery, position, visible }) => {
  if (!visible || !machinery || !position) return null;

  return (
    <div 
      className="fixed z-[100] p-4 rounded-lg border shadow-xl min-w-[220px] pointer-events-none animate-fadeIn"
      style={{ 
        backgroundColor: 'var(--color-background)',
        borderColor: '#3B82F6',
        borderWidth: '2px',
        left: `${position.x}px`,
        top: `${position.y - 10}px`,
        transform: 'translate(-50%, -100%)',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <h3 className="text-sm font-bold text-primary mb-1">{machinery.name}</h3>
      <p className="text-xs text-secondary mb-3">Serial: {machinery.serial}</p>
      
      <div className="space-y-2 text-xs border-t border-gray-200 pt-2">
        <div className="flex justify-between">
          <p className="text-secondary font-medium">Velocidad:</p>
          <p className="text-primary font-semibold">{machinery.currentSpeed || "0 km/h"}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-secondary font-medium">RPM:</p>
          <p className="text-primary font-semibold">{machinery.rpm || "0"}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-secondary font-medium">Temperatura:</p>
          <p className="text-primary font-semibold">{machinery.engineTemp || "0°C"}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-secondary font-medium">Combustible:</p>
          <p className="text-primary font-semibold">{machinery.fuelLevel || "0%"}</p>
        </div>
      </div>
    </div>
  );
};

// Helper function to get marker color based on machinery status
const getMarkerColor = (machinery) => {
  // Sin conexión: Gris
  if (!machinery.location?.lat || !machinery.location?.lng) {
    return '#9CA3AF'; // Gris
  }
  
  // En movimiento: Verde
  if (machinery.moving && machinery.ignition) {
    return '#22C55E'; // Verde
  }
  
  // Estacionario (encendido pero sin movimiento): Naranja
  if (machinery.ignition && !machinery.moving) {
    return '#F59E0B'; // Naranja
  }
  
  // Apagado: Gris
  return '#9CA3AF'; // Gris
};

// Real Map Component - Leaflet con múltiples pins
export const RealTimeMap = ({ machineries = [], selectedMachinery = null }) => {
  const [isClient, setIsClient] = React.useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Centrar mapa en la maquinaria seleccionada cada 30 segundos
  useEffect(() => {
    if (!isClient || !mapInstanceRef.current || !selectedMachinery) return;

    const machinery = machineries.find(m => m.id === selectedMachinery.id);
    if (!machinery || !machinery.location?.lat || !machinery.location?.lng) return;

    // Centrar el mapa en la maquinaria seleccionada
    const L = require('leaflet');
    mapInstanceRef.current.setView([machinery.location.lat, machinery.location.lng], 13);
  }, [machineries, selectedMachinery, isClient]);

  if (!machineries || machineries.length === 0) {
    return (
      <div className="w-full h-[400px] rounded-lg border flex items-center justify-center" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
        <div className="text-center">
          <p className="text-secondary">No hay ubicaciones disponibles</p>
        </div>
      </div>
    );
  }

  // Filtrar maquinarias con ubicación válida
  const machineriesWithLocation = machineries.filter(m => m.location?.lat && m.location?.lng);
  
  if (machineriesWithLocation.length === 0) {
    return (
      <div className="w-full h-[400px] rounded-lg border flex items-center justify-center" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
        <div className="text-center">
          <p className="text-secondary">No hay coordenadas disponibles</p>
        </div>
      </div>
    );
  }

  // Calcular centro del mapa
  const centerLat = machineriesWithLocation.reduce((sum, m) => sum + m.location.lat, 0) / machineriesWithLocation.length;
  const centerLng = machineriesWithLocation.reduce((sum, m) => sum + m.location.lng, 0) / machineriesWithLocation.length;

  if (!isClient) {
    return (
      <div className="w-full h-[400px] rounded-lg border flex items-center justify-center" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
        <div className="text-center">
          <p className="text-secondary">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-lg border overflow-hidden" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={(map) => {
          if (map) {
            mapInstanceRef.current = map;
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {machineriesWithLocation.map((machinery, idx) => {
          const color = getMarkerColor(machinery);
          const status = !machinery.location?.lat || !machinery.location?.lng 
            ? 'Sin conexión'
            : machinery.moving && machinery.ignition 
              ? 'En movimiento'
              : machinery.ignition && !machinery.moving
                ? 'Estacionario'
                : 'Apagado';

          return (
            <Marker
              key={idx}
              position={[machinery.location.lat, machinery.location.lng]}
              icon={createCustomIcon(color)}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="text-sm font-bold text-primary mb-1">{machinery.name}</h3>
                  <p className="text-xs text-secondary mb-2">Serial: {machinery.serial}</p>
                  <div className="space-y-1 text-xs border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-secondary">Estado:</span>
                      <span className="font-medium" style={{ color }}>{status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Velocidad:</span>
                      <span className="font-medium">{machinery.currentSpeed || "0 km/h"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">RPM:</span>
                      <span className="font-medium">{machinery.rpm || "0"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Temperatura:</span>
                      <span className="font-medium">{machinery.engineTemp || "0°C"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Combustible:</span>
                      <span className="font-medium">{machinery.fuelLevel || "0%"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Coordenadas:</span>
                      <span className="font-medium text-xs">
                        {machinery.location.lat.toFixed(5)}, {machinery.location.lng.toFixed(5)}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

