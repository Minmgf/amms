"use client";
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export const HistoricalCharts = () => {
  // Mock data for all charts
  const speedData = [
    { time: '8:30', value: 28 },
    { time: '9:30', value: 30 },
    { time: '10:30', value: 45 },
    { time: '11:30', value: 30 },
    { time: '12:30', value: 42 },
    { time: '13:30', value: 38 }
  ];

  const rpmData = [
    { time: '8:30', value: 800 },
    { time: '9:30', value: 850 },
    { time: '10:30', value: 1500 },
    { time: '11:30', value: 900 },
    { time: '12:30', value: 1400 },
    { time: '13:30', value: 1100 }
  ];

  const temperatureData = [
    { time: '8:30', value: 25 },
    { time: '9:30', value: 28 },
    { time: '10:30', value: 65 },
    { time: '11:30', value: 25 },
    { time: '12:30', value: 62 },
    { time: '13:30', value: 40 }
  ];

  const fuelLevelData = [
    { time: '8:30', value: 95 },
    { time: '9:30', value: 90 },
    { time: '10:30', value: 85 },
    { time: '11:30', value: 78 },
    { time: '12:30', value: 35 },
    { time: '13:30', value: 30 }
  ];

  const engineLoadData = [
    { time: '8:30', value: 0 },
    { time: '9:30', value: 20 },
    { time: '10:30', value: 85 },
    { time: '11:30', value: 50 },
    { time: '12:30', value: 78 },
    { time: '13:30', value: 45 }
  ];

  const oilLevelData = [
    { time: '8:30', value: 95 },
    { time: '9:30', value: 92 },
    { time: '10:30', value: 88 },
    { time: '11:30', value: 82 },
    { time: '12:30', value: 75 },
    { time: '13:30', value: 28 }
  ];

  const totalOdometerData = [
    { time: '8:30', value: 2000 },
    { time: '9:30', value: 2500 },
    { time: '10:30', value: 3200 },
    { time: '11:30', value: 3800 },
    { time: '12:30', value: 4500 },
    { time: '13:30', value: 5200 }
  ];

  const tripOdometerData = [
    { time: '8:30', value: 0 },
    { time: '9:30', value: 500 },
    { time: '10:30', value: 850 },
    { time: '11:30', value: 1200 },
    { time: '12:30', value: 1550 },
    { time: '13:30', value: 1850 }
  ];

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, unit }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 rounded border shadow-lg text-xs" style={{ backgroundColor: 'var(--color-background)', borderColor: '#3B82F6' }}>
          <p className="font-bold text-primary">{payload[0].payload.time}</p>
          <p className="text-secondary">
            {payload[0].value} {unit}
          </p>
        </div>
      );
    }
    return null;
  };

  // Chart Card Component
  const ChartCard = ({ title, data, color, unit, min, max, yAxisLabel }) => (
    <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-semibold text-primary">{title}</h4>
        <div className="text-xs text-secondary">
          Desde: {min} {unit} | Máx: {max} {unit} | Mín: {min} {unit}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
          />
          <YAxis 
            domain={[min, max]}
            tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: 'var(--color-text-secondary)' } }}
          />
          <Tooltip content={(props) => <CustomTooltip {...props} unit={unit} />} />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2}
            dot={{ r: 3, fill: color }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  // Area Chart Card for Engine Load
  const AreaChartCard = ({ title, data, color, unit, min, max, yAxisLabel }) => (
    <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-semibold text-primary">{title}</h4>
        <div className="text-xs text-secondary">
          Desde: {min}°C | Máx: {max}°C | Mín: {min}°C
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="engineLoadGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity={0.8}/>
              <stop offset="50%" stopColor="#EF4444" stopOpacity={0.4}/>
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
          />
          <YAxis 
            domain={[min, max]}
            tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: 'var(--color-text-secondary)' } }}
          />
          <Tooltip content={(props) => <CustomTooltip {...props} unit={unit} />} />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#EF4444"
            strokeWidth={2}
            fill="url(#engineLoadGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Row 1: Speed and RPM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard 
          title="Velocidad"
          data={speedData}
          color="#3B82F6"
          unit="km/h"
          min={0}
          max={50}
          yAxisLabel="km/h"
        />
        <ChartCard 
          title="Revoluciones"
          data={rpmData}
          color="#3B82F6"
          unit="RPM"
          min={0}
          max={1800}
          yAxisLabel="RPM"
        />
      </div>

      {/* Row 2: Temperature and Fuel Level */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard 
          title="Temperatura"
          data={temperatureData}
          color="#3B82F6"
          unit="°C"
          min={0}
          max={70}
          yAxisLabel="°C"
        />
        <ChartCard 
          title="Nivel de combustible"
          data={fuelLevelData}
          color="#3B82F6"
          unit="%"
          min={0}
          max={100}
          yAxisLabel="%"
        />
      </div>

      {/* Row 3: Engine Load and Oil Level */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AreaChartCard 
          title="Carga del motor"
          data={engineLoadData}
          color="#EF4444"
          unit="°C"
          min={0}
          max={90}
          yAxisLabel="%"
        />
        <ChartCard 
          title="Nivel de aceite"
          data={oilLevelData}
          color="#3B82F6"
          unit="%"
          min={0}
          max={100}
          yAxisLabel="%"
        />
      </div>

      {/* Row 4: Total Odometer and Trip Odometer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard 
          title="Odómetro Total"
          data={totalOdometerData}
          color="#3B82F6"
          unit="m"
          min={1500}
          max={5500}
          yAxisLabel="m"
        />
        <ChartCard 
          title="Odómetro de Viaje"
          data={tripOdometerData}
          color="#3B82F6"
          unit="m"
          min={0}
          max={2000}
          yAxisLabel="m"
        />
      </div>
    </div>
  );
};
