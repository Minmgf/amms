"use client";
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, Scatter, ReferenceDot } from 'recharts';

// Función para reducir datos cuando hay demasiados puntos
const reduceDataPoints = (dataPoints, maxPoints = 50) => {
  if (dataPoints.length <= maxPoints) return dataPoints;
  
  const step = Math.ceil(dataPoints.length / maxPoints);
  return dataPoints.filter((_, index) => index % step === 0);
};

// Función para formatear tiempo según la cantidad de datos
const formatTimeLabel = (timeStr, totalPoints) => {
  if (totalPoints > 100) {
    // Solo mostrar hora:minuto para muchos datos
    return timeStr.substring(0, 5); // HH:MM
  } else if (totalPoints > 50) {
    // Mostrar cada 2 puntos
    return timeStr.substring(0, 8); // HH:MM:SS
  }
  return timeStr; // HH:MM:SS completo
};

// Performance Chart Component con datos reales
export const PerformanceChart = ({ data: chartData }) => {
  if (!chartData || chartData.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-secondary">No hay datos de rendimiento disponibles</p>
      </div>
    );
  }

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const getEventText = (eventType) => {
        switch(eventType) {
          case 1: return 'Aceleración';
          case 2: return 'Frenado';
          case 3: return 'Curva';
          default: return null;
        }
      };

      return (
        <div className="p-3 rounded border shadow-lg" style={{ backgroundColor: 'var(--color-background)', borderColor: '#3B82F6' }}>
          <p className="text-xs font-bold text-primary mb-2">{data.time}</p>
          <p className="text-xs text-secondary">Velocidad: <span className="text-primary font-medium">{data.speed} km/h</span></p>
          <p className="text-xs text-secondary">RPM: <span className="text-primary font-medium">{data.rpm}</span></p>
          {data.gEvent && (
            <p className="text-xs text-secondary">Evento G: <span className="text-primary font-medium">{getEventText(data.gEvent)}</span></p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Header con leyenda */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-primary">Velocidad (Km/h)</span>
          <span className="text-sm font-medium text-primary">RPM</span>
        </div>
        <div className="flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF6B35' }}></div>
            <span className="text-secondary">Aceleración</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
            <span className="text-secondary">Frenado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8B5CF6' }}></div>
            <span className="text-secondary">Curva</span>
          </div>
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
            dot={(props) => {
              const { cx, cy, payload } = props;
              if (!payload.gEvent) return <circle cx={cx} cy={cy} r={3} fill="#3B82F6" />;
              
              const eventColors = {
                1: '#FF6B35', // Aceleración - Naranja
                2: '#EF4444', // Frenado - Rojo
                3: '#8B5CF6'  // Curva - Púrpura
              };
              
              return (
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={8} 
                  fill={eventColors[payload.gEvent]} 
                  stroke="#FFFFFF" 
                  strokeWidth={2}
                />
              );
            }}
            activeDot={false}
          />
          <Area 
            yAxisId="right"
            type="monotone" 
            dataKey="rpm" 
            stroke="#22C55E" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorRpm)"
            dot={{ r: 3, fill: '#22C55E' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Fuel Consumption Chart Component con datos reales
export const FuelConsumptionChart = ({ data: chartData }) => {
  if (!chartData || chartData.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-secondary">No hay datos de consumo de combustible disponibles</p>
      </div>
    );
  }

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

export const HistoricalCharts = ({ data, fuelData, performanceData, additionalMetrics }) => {

  // Función para extraer datos específicos de parámetros
  const getParameterData = (parameterName) => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    
    const parameter = data[0]?.parameters?.find(p => p.parameter_name === parameterName);
    if (!parameter || !parameter.data_points) return [];
    
    let processedData = parameter.data_points.map(point => {
      // Extraer la hora directamente del string sin conversión de zona horaria
      const dateStr = point.registered_at;
      // Formato: "2025-11-12T21:57:37.671318Z"
      const timeMatch = dateStr.match(/T(\d{2}):(\d{2}):(\d{2})/);
      
      if (timeMatch) {
        const [, hours, minutes, seconds] = timeMatch;
        return {
          time: `${hours}:${minutes}:${seconds}`,
          value: point.data,
          fullTimestamp: `${dateStr.split('T')[0]} ${hours}:${minutes}:${seconds}`,
          originalTime: `${hours}:${minutes}:${seconds}`
        };
      }
      
      // Fallback si no se puede parsear
      const date = new Date(point.registered_at);
      const timeStr = date.toISOString().substring(11, 19);
      return {
        time: timeStr,
        value: point.data,
        fullTimestamp: date.toISOString().replace('T', ' ').substring(0, 19),
        originalTime: timeStr
      };
    });

    // Reducir puntos si hay demasiados datos
    if (processedData.length > 100) {
      processedData = reduceDataPoints(processedData, 50);
    }

    // Formatear etiquetas de tiempo según la cantidad
    return processedData.map(point => ({
      ...point,
      time: formatTimeLabel(point.originalTime, processedData.length)
    }));
  };

  // Datos reales extraídos del JSON - solo si hay datos disponibles
  const speedData = getParameterData("Velocidad Actual");
  const rpmData = getParameterData("Revoluciones (RPM)");
  const temperatureData = getParameterData("Temperatura del Motor");
  const fuelLevelData = getParameterData("Nivel de Combustible");
  const engineLoadData = getParameterData("Carga del Motor");
  const oilLevelData = getParameterData("Nivel de Aceite");
  
  const totalOdometerData = getParameterData("Odómetro Total").length > 0 ? 
    getParameterData("Odómetro Total").map(point => ({ ...point, value: point.value / 1000 })) : []; // Convertir de metros a km
  
  const tripOdometerData = getParameterData("Odómetro del Viaje").length > 0 ? 
    getParameterData("Odómetro del Viaje").map(point => ({ ...point, value: point.value / 1000 })) : []; // Convertir de metros a km

  // Componente para mostrar cuando no hay datos
  const NoDataCard = ({ title }) => (
    <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-semibold text-primary">{title}</h4>
      </div>
      <div className="flex items-center justify-center h-[180px]">
        <div className="text-center">
          <p className="text-secondary text-sm">Sin datos disponibles</p>
          <p className="text-secondary text-xs mt-1">No se encontraron registros para este parámetro</p>
        </div>
      </div>
    </div>
  );

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, unit }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 rounded border shadow-lg text-xs" style={{ backgroundColor: 'var(--color-background)', borderColor: '#3B82F6' }}>
          <p className="font-bold text-primary">{payload[0].payload.time}</p>
          {payload[0].payload.fullTimestamp && (
            <p className="text-secondary text-[10px] mb-1">{payload[0].payload.fullTimestamp}</p>
          )}
          <p className="text-secondary">
            <span className="font-medium">{payload[0].value}</span> {unit}
          </p>
        </div>
      );
    }
    return null;
  };

  // Función para calcular rangos dinámicos
  const calculateRange = (data, padding = 0.1) => {
    if (!data || data.length === 0) return { min: 0, max: 100 };
    
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    return {
      min: Math.max(0, Math.floor(min - range * padding)),
      max: Math.ceil(max + range * padding)
    };
  };

  // Chart Card Component
  const ChartCard = ({ title, data, color, unit, min, max, yAxisLabel }) => {
    const range = calculateRange(data);
    const actualMin = min !== undefined ? min : range.min;
    const actualMax = max !== undefined ? max : range.max;
    
    // Configuración dinámica basada en cantidad de datos
    const dataCount = data.length;
    const tickCount = dataCount > 50 ? 5 : dataCount > 20 ? 8 : 10;
    const showDots = dataCount <= 50;
    const strokeWidth = dataCount > 100 ? 1 : 2;
    
    return (
    <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-semibold text-primary">{title}</h4>
        <div className="text-xs text-secondary">
          Mín: {actualMin} {unit} | Máx: {actualMax} {unit} | Puntos: {dataCount}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
            tickCount={tickCount}
            interval={dataCount > 20 ? 'preserveStartEnd' : 0}
            angle={dataCount > 30 ? -45 : 0}
            textAnchor={dataCount > 30 ? 'end' : 'middle'}
            height={dataCount > 30 ? 60 : 30}
          />
          <YAxis 
            domain={[actualMin, actualMax]}
            tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: 'var(--color-text-secondary)' } }}
          />
          <Tooltip content={(props) => <CustomTooltip {...props} unit={unit} />} />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={strokeWidth}
            dot={showDots ? { r: 2, fill: color } : false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
    );
  };

  // Area Chart Card for Engine Load
  const AreaChartCard = ({ title, data, color, unit, min, max, yAxisLabel }) => {
    const range = calculateRange(data);
    const actualMin = min !== undefined ? min : range.min;
    const actualMax = max !== undefined ? max : range.max;
    
    // Configuración dinámica basada en cantidad de datos
    const dataCount = data.length;
    const tickCount = dataCount > 50 ? 5 : dataCount > 20 ? 8 : 10;
    const strokeWidth = dataCount > 100 ? 1 : 2;
    
    return (
    <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-semibold text-primary">{title}</h4>
        <div className="text-xs text-secondary">
          Mín: {actualMin}{unit} | Máx: {actualMax}{unit} | Puntos: {dataCount}
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
            tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
            tickCount={tickCount}
            interval={dataCount > 20 ? 'preserveStartEnd' : 0}
            angle={dataCount > 30 ? -45 : 0}
            textAnchor={dataCount > 30 ? 'end' : 'middle'}
            height={dataCount > 30 ? 60 : 30}
          />
          <YAxis 
            domain={[actualMin, actualMax]}
            tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: 'var(--color-text-secondary)' } }}
          />
          <Tooltip content={(props) => <CustomTooltip {...props} unit={unit} />} />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#EF4444"
            strokeWidth={strokeWidth}
            fill="url(#engineLoadGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Row 1: Speed and RPM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {speedData.length > 0 ? (
          <ChartCard 
            title="Velocidad"
            data={speedData}
            color="#3B82F6"
            unit="km/h"
            yAxisLabel="km/h"
          />
        ) : (
          <NoDataCard title="Velocidad" />
        )}
        
        {rpmData.length > 0 ? (
          <ChartCard 
            title="Revoluciones"
            data={rpmData}
            color="#3B82F6"
            unit="RPM"
            yAxisLabel="RPM"
          />
        ) : (
          <NoDataCard title="Revoluciones" />
        )}
      </div>

      {/* Row 2: Temperature and Fuel Level */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {temperatureData.length > 0 ? (
          <ChartCard 
            title="Temperatura"
            data={temperatureData}
            color="#3B82F6"
            unit="°C"
            yAxisLabel="°C"
          />
        ) : (
          <NoDataCard title="Temperatura" />
        )}
        
        {fuelLevelData.length > 0 ? (
          <ChartCard 
            title="Nivel de combustible"
            data={fuelLevelData}
            color="#3B82F6"
            unit="%"
            min={0}
            max={100}
            yAxisLabel="%"
          />
        ) : (
          <NoDataCard title="Nivel de combustible" />
        )}
      </div>

      {/* Row 3: Engine Load and Oil Level */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {engineLoadData.length > 0 ? (
          <AreaChartCard 
            title="Carga del motor"
            data={engineLoadData}
            color="#EF4444"
            unit="%"
            min={0}
            max={100}
            yAxisLabel="%"
          />
        ) : (
          <NoDataCard title="Carga del motor" />
        )}
        
        {oilLevelData.length > 0 ? (
          <ChartCard 
            title="Nivel de aceite"
            data={oilLevelData}
            color="#3B82F6"
            unit="%"
            min={0}
            max={100}
            yAxisLabel="%"
          />
        ) : (
          <NoDataCard title="Nivel de aceite" />
        )}
      </div>

      {/* Row 4: Total Odometer and Trip Odometer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {totalOdometerData.length > 0 ? (
          <ChartCard 
            title="Odómetro Total"
            data={totalOdometerData}
            color="#3B82F6"
            unit="km"
            yAxisLabel="km"
          />
        ) : (
          <NoDataCard title="Odómetro Total" />
        )}
        
        {tripOdometerData.length > 0 ? (
          <ChartCard 
            title="Odómetro de Viaje"
            data={tripOdometerData}
            color="#3B82F6"
            unit="km"
            yAxisLabel="km"
          />
        ) : (
          <NoDataCard title="Odómetro de Viaje" />
        )}
      </div>
    </div>
  );
};
