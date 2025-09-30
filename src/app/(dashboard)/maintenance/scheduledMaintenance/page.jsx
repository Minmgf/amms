"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { FaSearch, FaFilter, FaPlus, FaCalendarAlt } from 'react-icons/fa';
import { FiEdit3, FiX, FiCheck, FiFile, FiDownload, FiEye } from 'react-icons/fi';
import Calendar from '@/app/components/scheduledMaintenance/Calendar';
import FilterModal from '@/app/components/shared/FilterModal';
import MaintenanceDetailModal from '@/app/components/scheduledMaintenance/MaintenanceDetailModal';
import { SuccessModal, ErrorModal } from '@/app/components/shared/SuccessErrorModal';
import { useTheme } from '@/contexts/ThemeContext';
import { getMaintenanceList } from '@/services/maintenanceService';

const ScheduledMaintenancePage = () => {
  const { currentTheme } = useTheme();
  
  // Estados principales
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState({ 
    startDate: null, 
    endDate: null 
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  
  // Estados de filtros
  const [statusFilter, setStatusFilter] = useState('');
  const [technicianFilter, setTechnicianFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Estados de modales
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);

  // Cargar datos del API
  useEffect(() => {
    loadMaintenanceData();
  }, []);

  const loadMaintenanceData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getMaintenanceList();
      
      if (response.success && response.data) {
        // Mapear los datos del API a la estructura esperada por el componente
        const mappedData = response.data.map(item => ({
          id: item.id,
          machinery: {
            name: item.machinery_name || 'N/A',
            serial: item.machinery_serial || 'N/A',
            image: item.machinery_image || null
          },
          maintenanceDate: item.scheduled_date || item.fecha_mantenimiento,
          technician: item.technician_name || item.tecnico || 'N/A',
          status: item.status_name || item.estado || 'Pendiente',
          type: item.maintenance_type_name || item.tipo_mantenimiento || 'N/A',
          details: item.description || item.descripcion || 'Sin descripción disponible'
        }));
        
        setMaintenanceData(mappedData);
      } else {
        setError('Error al cargar los datos del servidor');
        setMaintenanceData([]);
      }
      
    } catch (err) {
      console.error('Error loading maintenance data:', err);
      setError('Error al cargar los datos. Por favor, intenta de nuevo.');
      setMaintenanceData([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener el estado de fecha (color)
  const getDateStatus = (maintenanceDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const maintenance = new Date(maintenanceDate);
    maintenance.setHours(0, 0, 0, 0);
    
    if (maintenance < today) return 'overdue'; // Rojo
    if (maintenance.getTime() === today.getTime()) return 'today'; // Amarillo
    return 'upcoming'; // Verde
  };

  // Función para obtener la clase CSS según el estado de fecha
  const getDateStatusClass = (status) => {
    switch (status) {
      case 'overdue': return 'text-red-600 bg-red-50';
      case 'today': return 'text-yellow-600 bg-yellow-50';
      case 'upcoming': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Obtener valores únicos para los filtros
  const availableTechnicians = useMemo(() => {
    return [...new Set(maintenanceData.map(m => m.technician).filter(Boolean))];
  }, [maintenanceData]);

  const availableTypes = useMemo(() => {
    return [...new Set(maintenanceData.map(m => m.type).filter(Boolean))];
  }, [maintenanceData]);

  const availableStatuses = useMemo(() => {
    return [...new Set(maintenanceData.map(m => m.status).filter(Boolean))];
  }, [maintenanceData]);

  // Filtrar datos
  const filteredData = useMemo(() => {
    return maintenanceData.filter(maintenance => {
      // Filtro por rango de fechas
      if (selectedDateRange.startDate && selectedDateRange.endDate) {
        const maintenanceDate = new Date(maintenance.maintenanceDate);
        const startDate = new Date(selectedDateRange.startDate);
        const endDate = new Date(selectedDateRange.endDate);
        
        if (maintenanceDate < startDate || maintenanceDate > endDate) {
          return false;
        }
      }

      // Filtro de búsqueda global
      const matchesGlobal = globalFilter === '' || 
        maintenance.machinery.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
        maintenance.machinery.serial.toLowerCase().includes(globalFilter.toLowerCase()) ||
        maintenance.id.toString().includes(globalFilter);

      // Filtros específicos
      const matchesStatus = statusFilter === '' || maintenance.status === statusFilter;
      const matchesTechnician = technicianFilter === '' || maintenance.technician === technicianFilter;
      const matchesType = typeFilter === '' || maintenance.type === typeFilter;

      return matchesGlobal && matchesStatus && matchesTechnician && matchesType;
    });
  }, [maintenanceData, selectedDateRange, globalFilter, statusFilter, technicianFilter, typeFilter]);

  // Paginación
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Reset página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [globalFilter, statusFilter, technicianFilter, typeFilter, selectedDateRange]);

  // Calcular estadísticas
  const statistics = useMemo(() => {
    const total = filteredData.length;
    const pending = filteredData.filter(m => m.status === 'Pendiente').length;
    const completed = filteredData.filter(m => m.status === 'Realizado').length;
    const cancelled = filteredData.filter(m => m.status === 'Cancelado').length;
    const overdue = filteredData.filter(m => 
      m.status === 'Pendiente' && getDateStatus(m.maintenanceDate) === 'overdue'
    ).length;
    const today = filteredData.filter(m => 
      getDateStatus(m.maintenanceDate) === 'today'
    ).length;
    
    return { total, pending, completed, cancelled, overdue, today };
  }, [filteredData]);

  // Limpiar filtros
  const handleClearFilters = () => {
    setStatusFilter('');
    setTechnicianFilter('');
    setTypeFilter('');
    setGlobalFilter('');
    setSelectedDateRange({ startDate: null, endDate: null });
  };

  // Aplicar filtros
  const handleApplyFilters = () => {
    setFilterModalOpen(false);
    // Los filtros ya se aplican automáticamente a través de useMemo
  };

  // Mostrar detalles del mantenimiento
  const handleViewDetails = (maintenance) => {
    setSelectedMaintenance(maintenance);
    setDetailModalOpen(true);
  };

  // Acciones de mantenimiento
  const handleUpdateMaintenance = (id) => {
    setModalMessage('Función de actualización en desarrollo');
    setSuccessOpen(true);
  };

  const handleCancelMaintenance = (id) => {
    setModalMessage('Mantenimiento cancelado exitosamente');
    setSuccessOpen(true);
  };

  const handleRegisterReport = (id) => {
    setModalMessage('Función de registro de reporte en desarrollo');
    setSuccessOpen(true);
  };

  const handleGenerateReport = (id) => {
    setModalMessage('Función de generación de reporte en desarrollo');
    setSuccessOpen(true);
  };

  // Renderizar acciones según estado y permisos
  const renderActions = (maintenance) => {
    const actions = [];
    
    // Botón de ver detalles (siempre disponible)
    actions.push(
      <button
        key="view"
        onClick={() => handleViewDetails(maintenance)}
        className="text-blue-600 hover:text-blue-800 p-1 rounded"
        title="Ver detalles"
      >
        <FiEye className="w-4 h-4" />
      </button>
    );
    
    if (maintenance.status === 'Pendiente') {
      actions.push(
        <button
          key="update"
          onClick={() => handleUpdateMaintenance(maintenance.id)}
          className="text-green-600 hover:text-green-800 p-1 rounded"
          title="Actualizar"
        >
          <FiEdit3 className="w-4 h-4" />
        </button>
      );
      
      actions.push(
        <button
          key="cancel"
          onClick={() => handleCancelMaintenance(maintenance.id)}
          className="text-red-600 hover:text-red-800 p-1 rounded"
          title="Cancelar"
        >
          <FiX className="w-4 h-4" />
        </button>
      );
      
      actions.push(
        <button
          key="register"
          onClick={() => handleRegisterReport(maintenance.id)}
          className="text-purple-600 hover:text-purple-800 p-1 rounded"
          title="Registrar reporte"
        >
          <FiFile className="w-4 h-4" />
        </button>
      );
    }
    
    if (maintenance.status === 'Realizado') {
      actions.push(
        <button
          key="generate"
          onClick={() => handleGenerateReport(maintenance.id)}
          className="text-orange-600 hover:text-orange-800 p-1 rounded"
          title="Generar reporte"
        >
          <FiDownload className="w-4 h-4" />
        </button>
      );
    }
    
    return <div className="flex gap-1">{actions}</div>;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold parametrization-text">
          Mantenimientos Programados
        </h1>
      </div>

      {/* Panel de estadísticas detalladas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-theme rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Mantenimientos</p>
              <p className="text-2xl font-bold text-blue-600">{statistics.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaCalendarAlt className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="card-theme rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{statistics.pending}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaFilter className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="card-theme rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completados</p>
              <p className="text-2xl font-bold text-green-600">{statistics.completed}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FiCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="card-theme rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vencidos</p>
              <p className="text-2xl font-bold text-red-600">{statistics.overdue}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <FiX className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Sección del Calendario - Layout según mockup */}
      <div className="card-theme rounded-lg shadow mb-6 max-w-6xl mx-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold parametrization-text mb-4">
            Calendario de Mantenimientos
          </h2>
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Calendario - Columna Izquierda */}
            <div className="xl:col-span-2">
              <Calendar
                maintenanceData={maintenanceData}
                selectedDateRange={selectedDateRange}
                onDateRangeChange={setSelectedDateRange}
              />
            </div>
            
            {/* Controles y Rango de Fechas - Columna Derecha */}
            <div className="space-y-4">
              {/* Información de fecha actual */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Hoy</h3>
                <p className="text-lg font-bold text-blue-700">
                  {new Date().toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </p>
              </div>

              {/* Rango de fechas seleccionado */}
              {(selectedDateRange.startDate || selectedDateRange.endDate) && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-green-900 mb-2">Rango Seleccionado</h3>
                  {selectedDateRange.startDate && selectedDateRange.endDate ? (
                    <div className="space-y-1">
                      <p className="text-sm text-green-800">
                        <span className="font-medium">Desde:</span> {new Date(selectedDateRange.startDate).toLocaleDateString('es-ES')}
                      </p>
                      <p className="text-sm text-green-800">
                        <span className="font-medium">Hasta:</span> {new Date(selectedDateRange.endDate).toLocaleDateString('es-ES')}
                      </p>
                      <p className="text-xs text-green-600 mt-2">
                        {Math.ceil((new Date(selectedDateRange.endDate) - new Date(selectedDateRange.startDate)) / (1000 * 60 * 60 * 24)) + 1} días seleccionados
                      </p>
                    </div>
                  ) : selectedDateRange.startDate ? (
                    <p className="text-sm text-green-800">
                      <span className="font-medium">Inicio:</span> {new Date(selectedDateRange.startDate).toLocaleDateString('es-ES')}
                      <br />
                      <span className="text-xs text-green-600">Selecciona fecha final</span>
                    </p>
                  ) : null}
                  
                  <button
                    onClick={() => setSelectedDateRange({ startDate: null, endDate: null })}
                    className="mt-3 text-xs text-green-700 hover:text-green-900 underline"
                  >
                    Limpiar selección
                  </button>
                </div>
              )}

              {/* Estadísticas rápidas del rango */}
              {selectedDateRange.startDate && selectedDateRange.endDate && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">En este rango</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-medium">{filteredData.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pendientes:</span>
                      <span className="font-medium text-yellow-600">
                        {filteredData.filter(m => m.status === 'Pendiente').length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Vencidos:</span>
                      <span className="font-medium text-red-600">
                        {filteredData.filter(m => 
                          m.status === 'Pendiente' && getDateStatus(m.maintenanceDate) === 'overdue'
                        ).length}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="card-theme rounded-lg shadow mb-6">
        <div className="p-4">
          {/* Búsqueda */}
          <div className="relative max-w-md flex gap-2 w-full">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por consecutivo, maquinaria o serial..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full min-w-lg pl-10 pr-16 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            {/* Acciones rápidas */}
            <button
              onClick={() => {
                setModalMessage('Función de nuevo mantenimiento en desarrollo');
                setSuccessOpen(true);
              }}
              className="w-full parametrization-filter-button flex items-center justify-center space-x-2 px-4 py-2 transition-colors"
            >
              <FaPlus className="w-4 h-4" />
              <span className="text-sm">Nuevo Mantenimiento</span>
            </button>

            <button
              onClick={() => setFilterModalOpen(true)}
              className="w-full parametrization-filter-button flex items-center justify-center space-x-2 px-4 py-2 transition-colors"
            >
              <FaFilter className="w-4 h-4" />
              <span className="text-sm">Filtros Avanzados</span>
            </button>

            <button
              onClick={loadMaintenanceData}
              disabled={loading}
              className="w-full parametrization-filter-button flex items-center justify-center space-x-2 px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSearch className="w-4 h-4" />
              <span className="text-sm">{loading ? 'Actualizando...' : 'Actualizar'}</span>
            </button>
          </div>

          {/* Indicador de filtros activos */}
          {(globalFilter || statusFilter || technicianFilter || typeFilter || selectedDateRange.startDate) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-sm text-blue-800">
                Mostrando {filteredData.length} de {maintenanceData.length} mantenimientos
                {globalFilter && ` • Búsqueda: "${globalFilter}"`}
                {statusFilter && ` • Estado: ${statusFilter}`}
                {technicianFilter && ` • Técnico: ${technicianFilter}`}
                {typeFilter && ` • Tipo: ${typeFilter}`}
                {selectedDateRange.startDate && ` • Rango de fechas aplicado`}
              </p>
              <button
                onClick={handleClearFilters}
                className="text-blue-600 hover:text-blue-800 text-sm mt-1"
              >
                Limpiar todos los filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lista de mantenimientos */}
      <div className="card-theme rounded-lg shadow">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Cargando mantenimientos...
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-red-600 mb-2">{error}</div>
              <button
                onClick={loadMaintenanceData}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Reintentar
              </button>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {globalFilter || statusFilter || technicianFilter || typeFilter || selectedDateRange.startDate
                ? "No se encontraron resultados"
                : "No hay mantenimientos programados"
              }
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Maquinaria
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Serial
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Técnico
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Fecha Mantenimiento
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((maintenance) => {
                  const dateStatus = getDateStatus(maintenance.maintenanceDate);
                  const dateStatusClass = getDateStatusClass(dateStatus);
                  
                  return (
                    <tr key={maintenance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-xs font-semibold text-gray-600">
                              {maintenance.machinery.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {maintenance.machinery.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {maintenance.type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                        {maintenance.machinery.serial}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {maintenance.technician}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${dateStatusClass}`}>
                          {new Date(maintenance.maintenanceDate).toLocaleDateString('es-ES')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          maintenance.status === 'Pendiente' ? 'text-yellow-800 bg-yellow-100' :
                          maintenance.status === 'Realizado' ? 'text-green-800 bg-green-100' :
                          'text-red-800 bg-red-100'
                        }`}>
                          {maintenance.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {renderActions(maintenance)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)} al{' '}
              {Math.min(currentPage * itemsPerPage, filteredData.length)} de {filteredData.length} resultados
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm border border-gray-300 rounded-lg ${
                    page === currentPage 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Filtros */}
      <FilterModal
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onClear={handleClearFilters}
        onApply={handleApplyFilters}
      >
        <div className="space-y-6">
          {/* Tipo de mantenimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de mantenimiento
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los tipos</option>
              {availableTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Técnico asignado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Técnico asignado
            </label>
            <select
              value={technicianFilter}
              onChange={(e) => setTechnicianFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los técnicos</option>
              {availableTechnicians.map((technician) => (
                <option key={technician} value={technician}>
                  {technician}
                </option>
              ))}
            </select>
          </div>

          {/* Estado del mantenimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado del mantenimiento
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los estados</option>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FilterModal>

      {/* Modal de Detalles */}
      <MaintenanceDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maintenance={selectedMaintenance}
      />

      {/* Modales de éxito y error */}
      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Operación Exitosa"
        message={modalMessage}
      />
      
      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Error"
        message={modalMessage}
      />
    </div>
  );
};

export default ScheduledMaintenancePage;
