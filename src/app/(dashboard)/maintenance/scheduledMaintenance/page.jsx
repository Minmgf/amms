"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { FaSearch, FaFilter, FaPlus, FaCalendarAlt } from 'react-icons/fa';
import { FiEdit3, FiX, FiCheck, FiEye } from 'react-icons/fi';
import Calendar from '@/app/components/scheduledMaintenance/Calendar';
import FilterModal from '@/app/components/shared/FilterModal';
import MaintenanceDetailModal from '@/app/components/scheduledMaintenance/MaintenanceDetailModal';
import UpdateMaintenanceSchedule from '@/app/components/scheduledMaintenance/UpdateMaintenanceSchedule';
import ScheduleMaintenanceModal from '@/app/components/scheduledMaintenance/CreateScheduleMaintenance';
import CancelScheduledMaintenance from '@/app/components/scheduledMaintenance/CancelScheduledMaintenance';
import { SuccessModal, ErrorModal } from '@/app/components/shared/SuccessErrorModal';
import TableList from '@/app/components/shared/TableList';
import { useTheme } from '@/contexts/ThemeContext';
import { getScheduledMaintenanceList, getMaintenanceSchedulingStatuses, getMaintenanceTypes } from '@/services/maintenanceService';
import { getUserInfo } from '@/services/authService';
import MaintenanceReportModal from '@/app/components/maintenance/machineMaintenance/MaintenanceReportModal';
import PermissionGuard from '@/app/(auth)/PermissionGuard';

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

  // Estados de modales
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);

  // Estados para los nuevos modales de acciones
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);


  // Datos precargados para filtros
  const [availableMaintenanceTypes, setAvailableMaintenanceTypes] = useState(
    []
  );
  const [availableMaintenanceStatues, setAvailableMaintenanceStatues] = useState(
    []
  );

  // Función para cargar mantenimientos
  const loadMaintenanceData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Obtener mantenimientos y estados en paralelo
      const maintenanceResponse = await getScheduledMaintenanceList()

      // Verificar que ambas respuestas sean exitosas y tengan datos
      if (maintenanceResponse && maintenanceResponse.success && Array.isArray(maintenanceResponse.data)) {

        // Mapear los datos del API con peticiones adicionales para obtener nombres de técnicos
        const mappedDataPromises = maintenanceResponse.data.map(async (item) => {
          let technicianName = item.technician_name || `Técnico #${item.assigned_technician_id}`;

          // Si no hay technician_name y hay assigned_technician_id, hacer petición adicional
          if (!item.technician_name && item.assigned_technician_id) {
            try {
              const userResponse = await getUserInfo(item.assigned_technician_id);
              if (userResponse.success && userResponse.data && userResponse.data.length > 0) {
                technicianName = userResponse.data[0].name;
              }
            } catch (userError) {
              console.error(`Error fetching user info for technician ${item.assigned_technician_id}:`, userError);
              // Mantener el valor por defecto si falla la petición
            }
          }

          return {
            id: item.id_maintenance_scheduling,
            machinery: {
              name: item.machinery_name || 'N/A',
              serial: item.machinery_serial || 'N/A',
              image: item.machinery_image
            },
            maintenanceDate: item.scheduled_at ? new Date(item.scheduled_at).toISOString().split('T')[0] : null,
            technician: technicianName,
            maintenance_type: item.maintenance_type_name,
            maintenance_type_id: item.maintenance_type, // AGREGAR ESTE CAMPO
            details: `Mantenimiento programado para ${item.machinery_name}`,
            // Campos adicionales del API
            assigned_technician_id: item.assigned_technician_id,
            status_id: item.status_id,
            status_name: item.status_name,
            scheduled_at: item.scheduled_at,
            request_creation_date: item.request_creation_date,
            // CONSERVAR TODOS LOS DATOS ORIGINALES
            ...item, // Esto conserva todos los campos originales del API
            // Sobrescribir solo los campos que queremos formatear especialmente
            id_maintenance_scheduling: item.id_maintenance_scheduling,
            machinery_name: item.machinery_name,
            machinery_serial: item.machinery_serial,
          };
        });

        // Esperar a que todas las peticiones se completen
        const mappedData = await Promise.all(mappedDataPromises);
        setMaintenanceData(mappedData);

        const types = [
          ...new Set(
            mappedData.map((item) => item.maintenance_type).filter(Boolean)
          )
        ];

        const statues = [
          ...new Set(
            mappedData.map((item) => item.status_name).filter(Boolean)
          )
        ]

        setAvailableMaintenanceTypes(types);
        setAvailableMaintenanceStatues(statues);


      } else {
        setError('Error al cargar los mantenimientos programados o estados');
        console.error('Invalid response structure:', {
          maintenanceResponse,
          maintenanceSuccess: maintenanceResponse?.success,
          maintenanceDataIsArray: Array.isArray(maintenanceResponse?.data),
        });
      }
    } catch (err) {
      setError('Error al conectar con el servidor. Por favor, intenta de nuevo.');
      console.error('Error loading scheduled maintenance:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadMaintenanceData();
  }, []);

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

  // Funciones de acciones
  const handleViewReport = (maintenanceId) => {
    const maintenance = maintenanceData.find(m => m.id === maintenanceId);
    setSelectedMaintenance(maintenance);
    setReportModalOpen(true);
  };

  const handleUpdateMaintenance = (maintenanceId) => {
    const maintenance = maintenanceData.find(m => m.id === maintenanceId);
    setSelectedMaintenance(maintenance);
    setUpdateModalOpen(true);
  };

  const handleCancelMaintenance = (maintenanceId) => {
    const maintenance = maintenanceData.find(m => m.id === maintenanceId);
    setSelectedMaintenance(maintenance);
    setCancelModalOpen(true);
  };

  const handleCreateMaintenance = () => {
    setCreateModalOpen(true);
  };

  // Funciones de callback para modales
  const handleModalSuccess = (message) => {
    setModalMessage(message);
    setSuccessOpen(true);
    loadMaintenanceData(); // Refrescar datos
  };

  const handleModalError = (message) => {
    setModalMessage(message);
    setErrorOpen(true);
  };

  // Componente de acciones con hover
  const ActionsCell = ({ maintenance }) => {
    return (
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {/* Ver reporte - siempre disponible */}
        {[13, 15].includes(maintenance.status_id) && (
          <PermissionGuard permission={127}>
            <button
              onClick={() => handleViewReport(maintenance.id)}
              className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-blue-500 hover:text-blue-600"
              title="Ver reporte del mantenimiento"
            >
              <FiEye className="w-3 h-3" /> Reporte
            </button>
          </PermissionGuard>
        )}

        {/* Actualizar - siempre disponible */}
        {maintenance.status_id == 13 && (
          <PermissionGuard permission={126}>
            <button
              onClick={() => handleUpdateMaintenance(maintenance.id)}
              className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-green-300 hover:border-green-500 hover:text-green-600 text-green-600"
              title="Actualizar mantenimiento"
            >
              <FiEdit3 className="w-3 h-3" /> Actualizar
            </button>
          </PermissionGuard>
        )}

        {/* Cancelar - solo para pendientes */}
        {maintenance.status_id == 13 && (
          <PermissionGuard permission={121}>
            <button
              onClick={() => handleCancelMaintenance(maintenance.id)}
              className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-red-300 hover:border-red-500 hover:text-red-600 text-red-600"
              title="Cancelar mantenimiento"
            >
              <FiX className="w-3 h-3" /> Cancelar
            </button>
          </PermissionGuard>
        )}
      </div>
    );
  };

  // Definición de columnas para TableList
  const columns = useMemo(() => [
    {
      id: 'id_maintenance_scheduling',
      header: 'Consecutivo',
      accessorKey: 'id_maintenance_scheduling',
      cell: ({ getValue }) => (
        <span className="text-sm parametrization-text font-mono">
          {getValue()}
        </span>
      ),
    },
    {
      id: 'machinery',
      header: 'Maquinaria',
      accessorFn: row => row.machinery.name,
      cell: ({ row }) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
            {row.original.machinery.image ? (
              <img
                src={row.original.machinery.image}
                alt={row.original.machinery.name}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : (
              <span className="text-xs font-semibold text-gray-600">
                {row.original.machinery.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <div className="text-sm font-medium parametrization-text">
              {row.original.machinery.name}
            </div>
            <div className="text-sm parametrization-text">
              {row.original.type}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'serial',
      header: 'Serial',
      accessorKey: 'machinery.serial',
      cell: ({ getValue }) => (
        <span className="text-sm parametrization-text font-mono">
          {getValue()}
        </span>
      ),
    },
    {
      id: 'technician',
      header: 'Técnico',
      accessorKey: 'technician',
      cell: ({ getValue }) => (
        <span className="text-sm parametrization-text">
          {getValue()}
        </span>
      ),
    },
    {
      id: 'maintenanceDate',
      header: 'Fecha Mantenimiento',
      accessorKey: 'maintenanceDate',
      cell: ({ getValue, row }) => {
        const dateStatus = getDateStatus(getValue());
        const dateStatusClass = getDateStatusClass(dateStatus);
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${dateStatusClass}`}>
            {fixDate(getValue()).toLocaleDateString('es-ES')}
          </span>
        );
      },
    },
    {
      id: 'status_name',
      header: 'Estado',
      accessorKey: 'status_name',
      cell: ({ getValue, row }) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${row.original.status_id === 13 ? 'text-blue-800 bg-blue-100' : //pendiente
          row.original.status_id === 15 ? 'text-green-800 bg-green-100' : //realizado
            row.original.status_id === 14 ? 'text-red-800 bg-red-100' : //cancelado
              'text-gray-800 bg-gray-100'
          }`}>
          {getValue()}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => <ActionsCell maintenance={row.original} />,
      enableSorting: false,
    },
  ], [maintenanceData]);

  // Obtener técnicos únicos de los datos
  const uniqueTechnicians = useMemo(() => {
    const technicians = maintenanceData
      .map(item => item.technician)
      .filter(technician => technician && technician !== 'N/A')
      .filter((technician, index, array) => array.indexOf(technician) === index)
      .sort();
    return technicians;
  }, [maintenanceData]);

  // Filtrar datos
  const filteredData = useMemo(() => {
    return maintenanceData.filter(maintenance => {
      // Filtro por rango de fechas
      if (selectedDateRange.startDate && selectedDateRange.endDate) {
        const maintenanceDate = new Date(maintenance.maintenanceDate);
        const startDate = new Date(selectedDateRange.startDate);
        const endDate = new Date(selectedDateRange.endDate);

        // Ajustar la fecha de inicio al comienzo del día (00:00:00)
        startDate.setHours(0, 0, 0, 0);
        // Ajustar la fecha de fin al final del día (23:59:59)
        endDate.setHours(23, 59, 59, 999);

        if (maintenanceDate < startDate || maintenanceDate > endDate) {
          return false;
        }
      } else if (selectedDateRange.startDate) {
        // Solo fecha de inicio - mostrar desde esa fecha en adelante
        const maintenanceDate = new Date(maintenance.maintenanceDate);
        const startDate = new Date(selectedDateRange.startDate);
        startDate.setHours(0, 0, 0, 0);

        if (maintenanceDate < startDate) {
          return false;
        }
      } else if (selectedDateRange.endDate) {
        // Solo fecha de fin - mostrar hasta esa fecha
        const maintenanceDate = new Date(maintenance.maintenanceDate);
        const endDate = new Date(selectedDateRange.endDate);
        endDate.setHours(23, 59, 59, 999);

        if (maintenanceDate > endDate) {
          return false;
        }
      }

      // Filtro de búsqueda global
      const matchesGlobal = globalFilter === '' ||
        maintenance.machinery.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
        maintenance.machinery.serial.toLowerCase().includes(globalFilter.toLowerCase()) ||
        maintenance.id.toString().includes(globalFilter);

      // Filtros específicos
      const matchesStatus = statusFilter === '' || maintenance.status_name === statusFilter;
      const matchesTechnician = technicianFilter === '' || maintenance.technician === technicianFilter;
      const matchesType = typeFilter === '' || maintenance.maintenance_type === typeFilter;

      return matchesGlobal && matchesStatus && matchesTechnician && matchesType;
    });
  }, [maintenanceData, selectedDateRange, globalFilter, statusFilter, technicianFilter, typeFilter]);

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

  // Función para ajustar el desfase (zona horaria)
  const fixDate = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    return d;
  };


  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold parametrization-text">
          Mantenimientos Programados
        </h1>
        {/* <button 
          onClick={loadMaintenanceData}
          disabled={loading}
          className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Cargando...' : 'Actualizar'}
        </button> */}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Panel de estadísticas detalladas */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
      </div> */}

      {/* Búsqueda y Filtros */}
      <div className=" rounded-lg  mb-6">
        <div className="">
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
            <PermissionGuard permission={117}>
              <button
                onClick={handleCreateMaintenance}
                className="w-full parametrization-filter-button flex items-center justify-center space-x-2 px-4 py-2 transition-colors"
              >
                <FaPlus className="w-4 h-4" />
                <span className="text-sm">Nuevo Mantenimiento</span>
              </button>
            </PermissionGuard>

            <button
              onClick={() => setFilterModalOpen(true)}
              className="w-full parametrization-filter-button flex items-center justify-center space-x-2 px-4 py-2 transition-colors"
            >
              <FaFilter className="w-4 h-4" />
              <span className="text-sm">Filtros Avanzados</span>
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

      {/* Sección del Calendario - Layout según mockup */}
      <div className="card-theme rounded-lg shadow mb-6 max-w-3xl mx-auto">
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
                disableRangeSelection={true}
              />
            </div>

            {/* Controles y Rango de Fechas - Columna Derecha */}
            <div className="space-y-4">
              {/* Información de fecha actual */}
              {/* <div className="card-secondary bg-accent rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-2">Hoy</h3>
                <p className="text-lg font-bold text-white">
                  {new Date().toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </p>
              </div> */}

              {/* Controles de Rango de Fechas */}
              <div className="card-secondary rounded-lg p-4">
                <h3 className="text-sm font-semibold parametrization-text mb-4">Seleccionar Rango de Fechas</h3>

                <div className="space-y-4">
                  {/* Fecha de inicio */}
                  <div>
                    <label className="block text-xs font-medium parametrization-text mb-2">
                      Fecha de Inicio
                    </label>
                    <input
                      type="date"
                      value={selectedDateRange.startDate || ''}
                      onChange={(e) => setSelectedDateRange(prev => ({
                        ...prev,
                        startDate: e.target.value
                      }))}
                      className="parametrization-input text-sm"
                    />
                  </div>

                  {/* Fecha de fin */}
                  <div>
                    <label className="block text-xs font-medium parametrization-text mb-2">
                      Fecha de Fin
                    </label>
                    <input
                      type="date"
                      value={selectedDateRange.endDate || ''}
                      onChange={(e) => setSelectedDateRange(prev => ({
                        ...prev,
                        endDate: e.target.value
                      }))}
                      min={selectedDateRange.startDate || undefined}
                      className="parametrization-input text-sm"
                    />
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const today = new Date().toISOString().split('T')[0];
                        setSelectedDateRange({ startDate: today, endDate: today });
                      }}
                      className="flex-1 parametrization-button px-3 py-2 text-xs bg-accent text-white hover:bg-accent-hover transition-colors"
                    >
                      Hoy
                    </button>
                    <button
                      onClick={() => {
                        const today = new Date();
                        const nextWeek = new Date(today);
                        nextWeek.setDate(today.getDate() + 7);
                        setSelectedDateRange({
                          startDate: today.toISOString().split('T')[0],
                          endDate: nextWeek.toISOString().split('T')[0]
                        });
                      }}
                      className="flex-1 parametrization-button px-3 py-2 text-xs bg-success text-white hover:bg-success-hover transition-colors"
                    >
                      7 días
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const today = new Date();
                        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                        setSelectedDateRange({
                          startDate: firstDay.toISOString().split('T')[0],
                          endDate: lastDay.toISOString().split('T')[0]
                        });
                      }}
                      className="flex-1 parametrization-button px-3 py-2 text-xs bg-warning text-white hover:bg-warning-hover transition-colors"
                    >
                      Este mes
                    </button>
                    <button
                      onClick={() => setSelectedDateRange({ startDate: null, endDate: null })}
                      className="flex-1 parametrization-button px-3 py-2 text-xs parametrization-text hover:bg-hover transition-colors"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              </div>

              {/* Información del rango seleccionado */}
              {(selectedDateRange.startDate || selectedDateRange.endDate) && (
                <div className="card-secondary bg-success rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">Rango Seleccionado</h3>
                  {selectedDateRange.startDate && selectedDateRange.endDate ? (
                    <div className="space-y-1">
                      <p className="text-sm text-white">
                        <span className="font-medium">Desde:</span>{' '}
                        {fixDate(selectedDateRange.startDate).toLocaleDateString('es-ES')}
                      </p>
                      <p className="text-sm text-white">
                        <span className="font-medium">Hasta:</span>{' '}
                        {fixDate(selectedDateRange.endDate).toLocaleDateString('es-ES')}
                      </p>

                      <p className="text-xs text-white opacity-90 mt-2">
                        {Math.ceil((new Date(selectedDateRange.endDate) - new Date(selectedDateRange.startDate)) / (1000 * 60 * 60 * 24)) + 1} días seleccionados
                      </p>
                    </div>
                  ) : selectedDateRange.startDate ? (
                    <p className="text-sm text-white">
                      <span className="font-medium">Inicio:</span> {new Date(selectedDateRange.startDate).toLocaleDateString('es-ES')}
                      <br />
                      <span className="text-xs text-white opacity-90">Selecciona fecha final</span>
                    </p>
                  ) : selectedDateRange.endDate ? (
                    <p className="text-sm text-white">
                      <span className="font-medium">Fin:</span> {new Date(selectedDateRange.endDate).toLocaleDateString('es-ES')}
                      <br />
                      <span className="text-xs text-white opacity-90">Selecciona fecha inicial</span>
                    </p>
                  ) : null}
                </div>
              )}

              {/* Estadísticas rápidas del rango */}
              {selectedDateRange.startDate && selectedDateRange.endDate && (
                <div className="card-secondary rounded-lg p-4">
                  <h3 className="text-sm font-semibold parametrization-text mb-2">En este rango</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="parametrization-text">Total:</span>
                      <span className="font-medium parametrization-text">{filteredData.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="parametrization-text">Programados:</span>
                      <span className="font-medium text-blue-600">
                        {filteredData.filter(m => m.status_id === 13).length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="parametrization-text">Vencidos:</span>
                      <span className="font-medium text-error">
                        {filteredData.filter(m =>
                          m.status_id === 13 && getDateStatus(m.maintenanceDate) === 'overdue'
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

      {/* Lista de mantenimientos */}
      <PermissionGuard permission={125}>
        <div className="card-theme rounded-lg shadow">
          <TableList
            columns={columns}
            data={filteredData}
            loading={loading}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
          />
        </div>
      </PermissionGuard>

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
              {availableMaintenanceTypes.map((type) => (
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
              {uniqueTechnicians.map((technician) => (
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
              {availableMaintenanceStatues.map((type) => (
                <option key={type} value={type}>
                  {type}
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

      {/* Modales de Acciones */}
      {updateModalOpen && (
        <UpdateMaintenanceSchedule
          onClose={() => setUpdateModalOpen(false)}
          requestData={selectedMaintenance}
          onSuccess={handleModalSuccess}
          onError={handleModalError}
        />
      )}

      <ScheduleMaintenanceModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={loadMaintenanceData}
      />

      {cancelModalOpen && (
        <CancelScheduledMaintenance
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          maintenanceData={selectedMaintenance}
          onSuccess={handleModalSuccess}
          onError={handleModalError}
        />
      )}

      {/* Modal de Reporte de Mantenimiento */}
      {reportModalOpen && (
        <MaintenanceReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          maintenance={selectedMaintenance}
          onSave={(reportData) => {

            setReportModalOpen(false);
            handleModalSuccess('Reporte de mantenimiento guardado exitosamente');
          }}
        />
      )}

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
