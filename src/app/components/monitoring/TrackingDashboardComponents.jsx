"use client";
import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Dot } from 'recharts';

// Gauge Card Component (Velocímetro/Tacómetro)
export const GaugeCard = ({ label, value, max, unit, type, alert }) => {
  const percentage = (value / max) * 100;
  const rotation = (percentage / 100) * 180 - 90;
  
  // Determinar el color según el tipo y el valor
  const getGradient = () => {
    if (type === 'speed') {
      return 'url(#speedGradient)';
    } else if (type === 'rpm') {
      return 'url(#rpmGradient)';
    }
    return 'var(--color-primary)';
  };

  return (
    <div 
      className="p-4 rounded-lg border flex flex-col items-center justify-center min-h-[200px]"
      style={{ 
        backgroundColor: alert ? '#FED7E2' : 'var(--color-background-secondary)',
        borderColor: 'var(--color-border)' 
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
            backgroundColor: '#1F2937',
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            borderRadius: '2px'
          }}
        />
        
        {/* Centro de la aguja */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gray-800 border-2 border-white" />
      </div>
      <p className="text-2xl font-bold text-primary mt-2">{value}</p>
      <p className="text-xs text-secondary">{unit}</p>
    </div>
  );
};

// Circular Progress Component
export const CircularProgress = ({ label, value, color = "#3B82F6" }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div 
      className="p-4 rounded-lg border flex flex-col items-center justify-center min-h-[200px]"
      style={{ 
        backgroundColor: 'var(--color-background-secondary)',
        borderColor: 'var(--color-border)' 
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
            stroke={color}
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{value}%</p>
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
      return (
        <div className="p-3 rounded border shadow-lg" style={{ backgroundColor: 'var(--color-background)', borderColor: '#3B82F6' }}>
          <p className="text-xs font-bold text-primary mb-2">{payload[0].payload.time}</p>
          <p className="text-xs text-secondary">Velocidad: <span className="text-primary font-medium">{payload[0].value} km/h</span></p>
          <p className="text-xs text-secondary">RPM: <span className="text-primary font-medium">{payload[1].value}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Header con leyenda */}
      <div className="mb-4 flex items-center justify-between">
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
          {chartData.filter(d => d.event).map((point, index) => (
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
                <polygon points="4,0 8,8 0,8" fill="#1F2937" />
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
  // Si no hay datos, usar datos por defecto
  const chartData = data.length > 0 ? data : [
    { time: '--', fuelLevel: 0, consumption: 0 }
  ];

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded border shadow-lg" style={{ backgroundColor: 'var(--color-background)', borderColor: '#3B82F6' }}>
          <p className="text-xs font-bold text-primary mb-2">{payload[0].payload.time}</p>
          <p className="text-xs text-secondary">Nivel de combustible: <span className="text-primary font-medium">{payload[0].value}%</span></p>
          <p className="text-xs text-secondary">Consumo instantáneo: <span className="text-primary font-medium">{payload[1].value} L/h</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Header con leyenda */}
      <div className="mb-4 flex items-center justify-between">
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
      className="fixed z-[100] p-4 rounded-lg border shadow-xl min-w-[200px] pointer-events-none"
      style={{ 
        backgroundColor: 'var(--color-background)',
        borderColor: '#3B82F6',
        borderWidth: '2px',
        left: `${position.x}px`,
        top: `${position.y - 10}px`,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <h3 className="text-sm font-bold text-primary mb-2">{machinery.name}</h3>
      <p className="text-xs text-secondary mb-3">Serial: {machinery.serial}</p>
      
      <div className="space-y-2 text-xs">
        <div>
          <p className="text-secondary font-medium">Velocidad actual</p>
          <p className="text-primary">{machinery.currentSpeed || "0 km/h"}</p>
        </div>
        <div>
          <p className="text-secondary font-medium">RPM</p>
          <p className="text-primary">{machinery.rpm || "3000"}</p>
        </div>
        <div>
          <p className="text-secondary font-medium">Temperatura</p>
          <p className="text-primary">{machinery.temperature || "45°C"}</p>
        </div>
        <div>
          <p className="text-secondary font-medium">Nivel de combustible</p>
          <p className="text-primary">{machinery.fuelLevel || "45%"}</p>
        </div>
      </div>
    </div>
  );
};

