"use client";
import React, { useState, useMemo } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTheme } from '@/contexts/ThemeContext';

const Calendar = ({ maintenanceData = [], selectedDateRange, onDateRangeChange }) => {
  const { currentTheme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSelectingRange, setIsSelectingRange] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Obtener datos del mes actual
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);
    // Día de la semana del primer día (0 = domingo)
    const startingDayOfWeek = firstDay.getDay();
    
    return {
      year,
      month,
      firstDay,
      lastDay,
      startingDayOfWeek,
      daysInMonth: lastDay.getDate()
    };
  }, [currentDate]);

  // Obtener mantenimientos del mes
  const monthMaintenances = useMemo(() => {
    const maintenancesByDate = {};
    
    maintenanceData.forEach(maintenance => {
      const date = new Date(maintenance.maintenanceDate);
      if (date.getFullYear() === monthData.year && date.getMonth() === monthData.month) {
        const day = date.getDate();
        if (!maintenancesByDate[day]) {
          maintenancesByDate[day] = [];
        }
        maintenancesByDate[day].push(maintenance);
      }
    });
    
    return maintenancesByDate;
  }, [maintenanceData, monthData]);

  // Navegar meses
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // Obtener estado de fecha
  const getDateStatus = (day) => {
    const date = new Date(monthData.year, monthData.month, day);
    date.setHours(0, 0, 0, 0);
    
    const maintenances = monthMaintenances[day] || [];
    const hasOverdue = maintenances.some(m => {
      const mDate = new Date(m.maintenanceDate);
      mDate.setHours(0, 0, 0, 0);
      return mDate < today;
    });
    
    const hasToday = maintenances.some(m => {
      const mDate = new Date(m.maintenanceDate);
      mDate.setHours(0, 0, 0, 0);
      return mDate.getTime() === today.getTime();
    });
    
    if (hasOverdue) return 'overdue';
    if (hasToday) return 'today';
    if (maintenances.length > 0) return 'upcoming';
    
    return 'normal';
  };

  // Obtener clases CSS para el día
  const getDayClasses = (day) => {
    const date = new Date(monthData.year, monthData.month, day);
    const isToday = date.getTime() === today.getTime();
    const status = getDateStatus(day);
    const maintenances = monthMaintenances[day] || [];
    
    // Verificar si está en el rango seleccionado
    const isInRange = selectedDateRange.startDate && selectedDateRange.endDate && 
      date >= new Date(selectedDateRange.startDate) && 
      date <= new Date(selectedDateRange.endDate);
    
    const isStartDate = selectedDateRange.startDate && 
      date.getTime() === new Date(selectedDateRange.startDate).getTime();
    
    const isEndDate = selectedDateRange.endDate && 
      date.getTime() === new Date(selectedDateRange.endDate).getTime();

    let classes = 'w-12 h-12 flex items-center justify-center text-sm font-medium cursor-pointer transition-colors relative rounded-lg ';

    // Estado base
    if (isToday) {
      classes += 'ring-2 ring-blue-500 ';
    }

    // Estado de selección - mayor contraste
    if (isStartDate || isEndDate) {
      classes += 'bg-blue-600 text-white shadow-md ';
    } else if (isInRange) {
      classes += 'bg-blue-200 text-blue-900 ';
    } else {
      classes += 'hover:bg-gray-100 ';
    }

    // Estado de mantenimiento
    if (maintenances.length > 0 && !isInRange) {
      switch (status) {
        case 'overdue':
          classes += 'bg-red-100 text-red-800 border-2 border-red-300 ';
          break;
        case 'today':
          classes += 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300 ';
          break;
        case 'upcoming':
          classes += 'bg-green-100 text-green-800 border-2 border-green-300 ';
          break;
      }
    }

    return classes;
  };

  // Manejar clic en día
  const handleDayClick = (day) => {
    const clickedDate = new Date(monthData.year, monthData.month, day);
    
    if (!isSelectingRange && (!selectedDateRange.startDate || selectedDateRange.endDate)) {
      // Iniciar nueva selección
      setTempStartDate(clickedDate);
      setIsSelectingRange(true);
      onDateRangeChange({ startDate: clickedDate, endDate: null });
    } else if (isSelectingRange) {
      // Completar selección
      const startDate = tempStartDate;
      const endDate = clickedDate;
      
      // Asegurar que startDate sea anterior a endDate
      if (startDate <= endDate) {
        onDateRangeChange({ startDate, endDate });
      } else {
        onDateRangeChange({ startDate: endDate, endDate: startDate });
      }
      
      setIsSelectingRange(false);
      setTempStartDate(null);
    }
  };

  // Limpiar selección
  const clearSelection = () => {
    onDateRangeChange({ startDate: null, endDate: null });
    setIsSelectingRange(false);
    setTempStartDate(null);
  };

  // Generar días del calendario
  const renderCalendarDays = () => {
    const days = [];
    
    // Días del mes anterior (para completar la primera semana)
    for (let i = 0; i < monthData.startingDayOfWeek; i++) {
      const prevMonth = new Date(monthData.year, monthData.month - 1, 0);
      const day = prevMonth.getDate() - monthData.startingDayOfWeek + i + 1;
      days.push(
        <div key={`prev-${day}`} className="w-12 h-12 flex items-center justify-center text-sm text-gray-400">
          {day}
        </div>
      );
    }
    
    // Días del mes actual
    for (let day = 1; day <= monthData.daysInMonth; day++) {
      const maintenances = monthMaintenances[day] || [];
      days.push(
        <div
          key={day}
          className={getDayClasses(day)}
          onClick={() => handleDayClick(day)}
          title={maintenances.length > 0 ? 
            `${maintenances.length} mantenimiento(s): ${maintenances.map(m => m.machinery.name).join(', ')}` : 
            `${day} de ${monthNames[monthData.month]}`
          }
        >
          {day}
          {maintenances.length > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-sm">
              {maintenances.length > 9 ? '9+' : maintenances.length}
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="space-y-4">
      {/* Header del calendario */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold parametrization-text">
          {monthNames[monthData.month]} {monthData.year}
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Hoy
          </button>
          
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Información del rango seleccionado */}
      {(selectedDateRange.startDate || isSelectingRange) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-800">
              {isSelectingRange ? (
                `Selecciona la fecha final (inicio: ${new Date(tempStartDate).toLocaleDateString('es-ES')})`
              ) : selectedDateRange.endDate ? (
                `Rango: ${new Date(selectedDateRange.startDate).toLocaleDateString('es-ES')} - ${new Date(selectedDateRange.endDate).toLocaleDateString('es-ES')}`
              ) : (
                `Fecha seleccionada: ${new Date(selectedDateRange.startDate).toLocaleDateString('es-ES')}`
              )}
            </div>
            <button
              onClick={clearSelection}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Leyenda */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
          <span>Vencidos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
          <span>Hoy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
          <span>Próximos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded ring-2 ring-blue-500"></div>
          <span>Hoy ({new Date().getDate()})</span>
        </div>
      </div>

      {/* Calendario */}
      <div className="border border-gray-200 rounded-lg p-4">
        {/* Encabezados de días */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="w-12 h-8 flex items-center justify-center text-xs font-semibold text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        {/* Días del calendario */}
        <div className="grid grid-cols-7 gap-1">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Instrucciones */}
      <div className="text-sm text-gray-600 text-center">
        Haz clic en un día para seleccionar fecha de inicio, luego en otro día para seleccionar el rango
      </div>
    </div>
  );
};

export default Calendar;