"use client";
import React from "react";

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

// Performance Chart Component
export const PerformanceChart = () => {
  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-secondary">Speed (Km/h)</span>
          <span className="text-xs font-medium text-secondary">RPM</span>
        </div>
      </div>
      
      {/* Chart Area */}
      <div className="relative w-full h-80">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-secondary">
          <span>80</span>
          <span>60</span>
          <span>40</span>
          <span>20</span>
          <span>0</span>
        </div>

        {/* RPM Y-axis labels (right) */}
        <div className="absolute right-0 top-0 bottom-8 flex flex-col justify-between text-xs text-secondary">
          <span>2000</span>
          <span>1500</span>
          <span>1000</span>
          <span>500</span>
          <span>0</span>
        </div>

        {/* Chart content */}
        <div className="absolute inset-0 left-8 right-8">
          <svg viewBox="0 0 400 300" className="w-full h-full" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={`grid-${i}`}
                x1="0"
                y1={i * 60 + 30}
                x2="400"
                y2={i * 60 + 30}
                stroke="var(--color-border)"
                strokeWidth="0.5"
                opacity="0.3"
              />
            ))}

            {/* Speed area (blue) */}
            <path
              d="M 0 240 Q 50 180, 100 150 T 200 180 Q 250 200, 300 160 T 400 180 L 400 270 L 0 270 Z"
              fill="#3B82F6"
              opacity="0.3"
            />
            <path
              d="M 0 240 Q 50 180, 100 150 T 200 180 Q 250 200, 300 160 T 400 180"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
            />

            {/* RPM area (green) */}
            <path
              d="M 0 180 Q 50 120, 100 90 T 200 120 Q 250 140, 300 100 T 400 120 L 400 270 L 0 270 Z"
              fill="#22C55E"
              opacity="0.3"
            />
            <path
              d="M 0 180 Q 50 120, 100 90 T 200 120 Q 250 140, 300 100 T 400 120"
              fill="none"
              stroke="#22C55E"
              strokeWidth="2"
            />
          </svg>

          {/* X-axis time labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-secondary">
            <span>10:00</span>
            <span>12:00</span>
            <span>14:00</span>
            <span>16:00</span>
            <span>18:00</span>
            <span>Time</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: 'var(--color-background-tertiary)' }}>
          <div className="w-3 h-3 rounded-full bg-error"></div>
          <span className="text-secondary">Ending</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: 'var(--color-background-tertiary)' }}>
          <div className="w-3 h-3 rounded-full bg-warning"></div>
          <span className="text-secondary">Acceleration</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: 'var(--color-background-tertiary)' }}>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B82F6' }}></div>
          <span className="text-secondary">Curve</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: 'var(--color-background-tertiary)' }}>
          <div className="w-3 h-3 rounded-full bg-success"></div>
          <span className="text-secondary">Stationary</span>
        </div>
      </div>
    </div>
  );
};

// Fuel Consumption Chart Component
export const FuelConsumptionChart = () => {
  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-secondary">%</span>
          <span className="text-xs font-medium text-secondary">L/h</span>
        </div>
      </div>
      
      {/* Chart Area */}
      <div className="relative w-full h-80">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-secondary">
          <span>100</span>
          <span>80</span>
          <span>60</span>
          <span>40</span>
          <span>20</span>
          <span>0</span>
        </div>

        {/* L/h Y-axis labels (right) */}
        <div className="absolute right-0 top-0 bottom-8 flex flex-col justify-between text-xs text-secondary">
          <span>4</span>
          <span>3</span>
          <span>2</span>
          <span>1</span>
          <span>0</span>
        </div>

        {/* Chart content */}
        <div className="absolute inset-0 left-8 right-8">
          <svg viewBox="0 0 400 300" className="w-full h-full" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line
                key={`grid-${i}`}
                x1="0"
                y1={i * 50 + 20}
                x2="400"
                y2={i * 50 + 20}
                stroke="var(--color-border)"
                strokeWidth="0.5"
                opacity="0.3"
              />
            ))}

            {/* Fuel level area (blue) */}
            <path
              d="M 0 150 Q 60 130, 120 110 T 240 140 Q 300 150, 360 120 T 400 130 L 400 270 L 0 270 Z"
              fill="#3B82F6"
              opacity="0.3"
            />
            <path
              d="M 0 150 Q 60 130, 120 110 T 240 140 Q 300 150, 360 120 T 400 130"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
            />

            {/* Instant consumption area (green) */}
            <path
              d="M 0 200 Q 60 180, 120 170 T 240 200 Q 300 210, 360 190 T 400 200 L 400 270 L 0 270 Z"
              fill="#22C55E"
              opacity="0.3"
            />
            <path
              d="M 0 200 Q 60 180, 120 170 T 240 200 Q 300 210, 360 190 T 400 200"
              fill="none"
              stroke="#22C55E"
              strokeWidth="2"
            />

            {/* Refuel markers */}
            <circle cx="180" cy="100" r="4" fill="#F59E0B" />
          </svg>

          {/* X-axis time labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-secondary">
            <span>10:00</span>
            <span>12:00</span>
            <span>14:00</span>
            <span>16:00</span>
            <span>18:00</span>
            <span>Time</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-12 h-3 rounded" style={{ background: 'linear-gradient(to right, #3B82F6, #3B82F688)' }}></div>
          <span className="text-secondary">Fuel level</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-3 rounded" style={{ background: 'linear-gradient(to right, #22C55E, #22C55E88)' }}></div>
          <span className="text-secondary">Instant Fuel consumption(L/h)</span>
        </div>
      </div>
    </div>
  );
};
