"use client";
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { FaSearch, FaFilter, FaPlus, FaCalendarAlt, FaFileDownload, FaFileInvoice } from 'react-icons/fa';
import { FiEdit3, FiX, FiCheck, FiEye } from 'react-icons/fi';
import Calendar from '@/app/components/scheduledMaintenance/Calendar';
import FilterModal from '@/app/components/shared/FilterModal';
import TableList from '@/app/components/shared/TableList';
import CancelRequestModal from '@/app/components/request/CancelRequestModal';
import DetailsRequestModal from '@/app/components/request/services/DetailsRequestModal';
import { SuccessModal, ConfirmModal } from '@/app/components/shared/SuccessErrorModal';
import CompleteRequestModal from '@/app/components/request/CompleteRequestModal';
import GenerateInvoiceModal from '@/app/components/request/invoice/multistepform/GenerateInvoiceModal';
import MultiStepFormModal from "@/app/components/request/requestsManagement/multistepForm/MultiStepFormModal";
import GenerateReportModal from '@/app/components/request/requestsManagement/GenerateReportModal';
import { getGestionServicesList } from '@/services/serviceService';
import { authorization } from "@/services/billingService";
import PermissionGuard from '@/app/(auth)/PermissionGuard';

const RequestsManagementPage = () => {
  // Estados principales
  const [loading, setLoading] = useState(false);
  const [requestsData, setRequestsData] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Estados de filtros
  const [requestStatusFilter, setRequestStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  // Estados de modales
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState(null);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [GenerateInvoiceModalOpen, setGenerateInvoiceModalOpen] = useState(false);
  const [confirmFormModalOpen, setConfirmFormModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedRequestForComplete, setSelectedRequestForComplete] = useState(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [mode, setMode] = useState('preregister'); // 'preregister' o 'register'
  const [billingToken, setBillingToken] = useState("");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  
  // Función para cargar solicitudes desde el API
  const loadRequests = async () => {
    console.log('🔄 loadRequests: Iniciando carga de solicitudes...');
    try {
      setLoading(true);
      const response = await getGestionServicesList();
      console.log('📥 Solicitudes recibidas del API:', response);

      if (response.success && response.results) {
        // Mapear datos del API a la estructura del componente
        const mappedData = response.results.map((item, index) => ({
          id: item.code || `temp-${index}`, // Usar code como ID único
          requestId: item.code, // ID real de la solicitud para el endpoint
          requestCode: item.code,
          client: {
            name: item.legal_entity_name,
            idNumber: item.customer_name // El nombre del cliente va en el subtítulo
          },
          requestStatus: item.request_status_name || 'N/A',
          requestStatusId: item.request_status_id,
          paymentStatus: item.payment_status_name || 'N/A',
          paymentStatusId: item.payment_status_id,
          scheduledDate: item.scheduled_date,
          completionDate: item.completion_date,
          hasInvoice: item.payment_status_id !== null // Asumimos que tiene factura si tiene estado de pago
        }));

        console.log('📊 Datos mapeados (mappedData.length):', mappedData.length);
        console.log('📋 IDs de las solicitudes:', mappedData.map(r => ({ id: r.id, requestCode: r.requestCode })));
        setRequestsData(mappedData);
        console.log('✅ setRequestsData ejecutado con', mappedData.length, 'solicitudes');

        const getTokenBilling = async () => {
              try {
                const response = await authorization();
                setBillingToken(response.access_token);
              } catch (error) {
                // Error en la autorización de facturación
              }
            };
            getTokenBilling();
      }
    } catch (error) {
      // En caso de error, mantener datos vacíos
      setRequestsData([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar solicitudes al montar el componente
  useEffect(() => {
    console.log('🎬 Componente montado, llamando loadRequests...');
    loadRequests();
  }, []);

  // Transformar datos para el calendario
  const calendarData = useMemo(() => {
    return requestsData.map(request => ({
      ...request,
      maintenanceDate: request.scheduledDate,
      machinery: { name: request.client.name },
      status_id: request.requestStatusId
    }));
  }, [requestsData]);

  // Estados únicos para filtros - calculados dinámicamente desde los datos
  const uniqueRequestStatuses = useMemo(() => {
    const statusMap = new Map();
    requestsData.forEach(request => {
      if (request.requestStatusId && request.requestStatus) {
        statusMap.set(request.requestStatusId, request.requestStatus);
      }
    });

    // Convertir Map a array de objetos
    return Array.from(statusMap, ([id, name]) => ({ id, name }))
      .sort((a, b) => a.id - b.id);
  }, [requestsData]);

  const uniquePaymentStatuses = useMemo(() => {
    const statusMap = new Map();
    requestsData.forEach(request => {
      if (request.paymentStatusId && request.paymentStatus) {
        statusMap.set(request.paymentStatusId, request.paymentStatus);
      }
    });

    // Convertir Map a array de objetos
    return Array.from(statusMap, ([id, name]) => ({ id, name }))
      .sort((a, b) => a.id - b.id);
  }, [requestsData]);

  // Función para obtener el estado de fecha (color)
  const getDateStatus = (scheduledDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const scheduled = new Date(scheduledDate);
    scheduled.setHours(0, 0, 0, 0);

    if (scheduled < today) return 'overdue'; // Rojo
    if (scheduled.getTime() === today.getTime()) return 'today'; // Naranja
    return 'upcoming'; // Azul
  };

  // Función para obtener la clase CSS según el estado de fecha
  const getDateStatusClass = (status) => {
    switch (status) {
      case 'overdue': return 'text-red-600 bg-red-50';
      case 'today': return 'text-orange-600 bg-orange-50';
      case 'upcoming': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Función para obtener clase de estado de solicitud
  const getRequestStatusClass = (statusId) => {
    switch (statusId) {
      case 1:
      case 19: return 'text-purple-800 bg-purple-100'; // Presolicitud (ID 19 del API)
      case 2: return 'text-yellow-800 bg-yellow-100'; // Pendiente
      case 3: return 'text-blue-800 bg-blue-100'; // Confirmada
      case 4: return 'text-cyan-800 bg-cyan-100'; // En ejecución
      case 5: return 'text-green-800 bg-green-100'; // Finalizada
      case 6: return 'text-gray-800 bg-gray-100'; // Cancelada
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  // Función para obtener clase de estado de pago
  const getPaymentStatusClass = (statusId) => {
    if (statusId === null || statusId === undefined) {
      return 'text-gray-800 bg-gray-100'; // Sin estado de pago
    }
    switch (statusId) {
      case 1: return 'text-red-800 bg-red-100'; // Pendiente
      case 2: return 'text-orange-800 bg-orange-100'; // Pago parcial
      case 3: return 'text-green-800 bg-green-100'; // Pagado
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  // Traducir estados al español
  const translateRequestStatus = (status) => {
    const translations = {
      'Pre-request': 'Presolicitud',
      'Pending': 'Pendiente',
      'Confirmed': 'Confirmada',
      'In execution': 'En ejecución',
      'Finished': 'Finalizada',
      'Canceled': 'Cancelada'
    };
    return translations[status] || status;
  };

  const translatePaymentStatus = (status) => {
    const translations = {
      'Pending': 'Pendiente',
      'Partial payment': 'Pago parcial',
      'Paid': 'Pagado'
    };
    return translations[status] || status;
  };

  // Función para transformar datos de la solicitud al formato del modal
  const getRequestDetailData = (requestId) => {
    const request = requestsData.find(r => r.id === requestId);
    if (!request) return null;

    // Transformar a formato esperado por el modal
    return {
      request_code: request.requestCode,
      status_id: request.requestStatusId,
      detail: "Servicio de mantenimiento y reparación",
      registration_date: "2025-09-28T10:45:00",
      scheduled_date: `${request.scheduledDate}T07:30:00`,
      completion_date: request.completionDate ? `${request.completionDate}T16:00:00` : null,
      
      // Client information
      client_name: request.client.name,
      client_document_type: request.client.idNumber.includes('900') ? "NIT" : "CC",
      client_document_number: request.client.idNumber,
      client_email: "contacto@" + request.client.name.toLowerCase().replace(/\s+/g, '') + ".com",
      client_phone: "+57 310 456 7821",
      
      // Machinery
      machinery: [
        {
          name: "Tractor para banano",
          serial_number: "CAT12381238109",
          operator: "Juan Pérez"
        }
      ],
      
      // Location
      location_country: "Colombia",
      location_department: "Tolima",
      location_municipality: "Espinal",
      location_place_name: "Finca La Esperanza",
      location_latitude: -12312,
      location_longitude: 813,
      location_area: 15,
      location_soil_type: "Clay loam",
      location_humidity: 42,
      location_altitude: 420,
      
      // Billing
      billing_total_amount: 8500.00,
      billing_amount_paid: request.paymentStatusId === 3 ? 8500.00 : request.paymentStatusId === 2 ? 4000.00 : 0,
      payment_status_id: request.paymentStatusId,
      payment_method_id: 2, // Crédito
    };
  };

  // Funciones de acciones
  const handleViewDetails = (requestCode) => {
    setSelectedRequestId(requestCode);
    setDetailsModalOpen(true);
  };

  const handleEditRequest = (requestId) => {
    setMode('edit');
    setIsRequestModalOpen(true);
  };

  const handleCancelRequest = useCallback((requestId) => {
    setRequestsData(currentData => {
      const request = currentData.find(r => r.id === requestId);
      
      if (!request) {
        const requestByCode = currentData.find(r => r.requestCode === requestId);
        if (requestByCode) {
          setRequestToCancel(requestByCode);
          setSelectedRequest(requestByCode);
          setCancelModalOpen(true);
          return currentData;
        }
      }
      
    setRequestToCancel(request);
    setSelectedRequest(request);
    setCancelModalOpen(true);
      return currentData;
    });
  }, []);

  const handleCancelSuccess = (requestCode) => {
    setSuccessMessage(`Solicitud cancelada exitosamente. Código: ${requestCode}`);
    setSuccessModalOpen(true);
    loadRequests();
  };

  const handleConfirmRequest = (request) => {
    console.log('🎯 handleConfirmRequest - request:', request);
    setSelectedRequest(request);
    setMode('confirm');
    setConfirmFormModalOpen(true);
  };

  const handleConfirmRequestSuccess = async () => {
    setConfirmFormModalOpen(false);
    setSuccessMessage(`Solicitud confirmada exitosamente. La solicitud pasó a estado "Pendiente".`);
    setSuccessModalOpen(true);
    await loadRequests();
  };

  const handleCompleteRequest = (request) => {
    setSelectedRequestForComplete(request);
    setCompleteModalOpen(true);
  };

  const handleCompleteSuccess = (requestCode) => {
    setSuccessMessage(`Solicitud completada exitosamente. Código: ${requestCode}`);
    setSuccessModalOpen(true);
    loadRequests();
  };

  const handleRegisterInvoice = (requestId) => {
    setGenerateInvoiceModalOpen(true);
  };

  const handleDownloadInvoice = (requestId) => {
    // TODO: Implementar descarga de factura
  };

  const handleNewPreRequest = () => {
    setMode('preregister');
    setIsRequestModalOpen(true);
  };

  const handleNewRequest = () => {
    setMode('register');
    setIsRequestModalOpen(true);
  };

  const handleRequestModalSuccess = async () => {
    console.log('✅ Pre-solicitud/Solicitud creada, recargando lista...');
    await loadRequests();
    console.log('✅ Lista recargada exitosamente');
  };

  const handleGenerateReport = () => {
    setReportModalOpen(true);
  };

  // Componente de acciones dinámicas con hover
  const ActionsCell = ({ request }) => {
    return (
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {/* Detalles - siempre disponible */}
        <PermissionGuard permission={154}>
          <button
            onClick={() => handleViewDetails(request.id)}
            className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-blue-500 hover:text-blue-600 text-gray-700"
            title="Ver detalles"
          >
            <FiEye className="w-3 h-3" /> Detalles
          </button>
        </PermissionGuard>

        {/* Confirmar - solo para presolicitudes */}
        {(request.requestStatusId === 1 || request.requestStatusId === 19) && (
          <PermissionGuard permission={150}>
            <button
              onClick={() => handleConfirmRequest(request)}
              className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-blue-300 hover:border-blue-500 hover:text-blue-600 text-blue-600"
              title="Confirmar solicitud"
            >
              <FiCheck className="w-3 h-3" /> Confirmar
            </button>
          </PermissionGuard>
        )}

        {/* Editar - solo para pendientes */}
        {request.requestStatusId === 20 && (
          <button
            onClick={() => handleEditRequest(request.id)}
            className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-green-300 hover:border-green-500 hover:text-green-600 text-green-600"
            title="Editar solicitud"
          >
            <FiEdit3 className="w-3 h-3" /> Editar
          </button>
        )}

        {/* Cancelar - solo para pendientes */}
        {request.requestStatusId === 20 && (
          <PermissionGuard permission={153}>
            <button
              onClick={() => handleCancelRequest(request.id)}
              className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-red-300 hover:border-red-500 hover:text-red-600 text-red-600"
              title="Cancelar solicitud"
            >
              <FiX className="w-3 h-3" /> Cancelar
            </button>
          </PermissionGuard>
        )}

        {/* Completar - solo para solicitudes en proceso (estado 21) */}
        {request.requestStatusId === 21 && (
          <PermissionGuard permission={152}>
            <button
              onClick={() => handleCompleteRequest(request)}
              className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-green-300 hover:border-green-500 hover:text-green-600 text-green-600"
              title="Completar solicitud"
            >
              <FiCheck className="w-3 h-3" /> Completar
            </button>
          </PermissionGuard>
        )}

        {/* Registrar factura - si no tiene factura */}
        {!request.hasInvoice && request.requestStatusId !== 6 && (
          <button
            onClick={() => handleRegisterInvoice(request.id)}
            className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-purple-300 hover:border-purple-500 hover:text-purple-600 text-purple-600"
            title="Registrar factura"
          >
            <FaFileInvoice className="w-3 h-3" /> Factura
          </button>
        )}

        {/* Descargar factura - si tiene factura */}
        {request.hasInvoice && (
          <button
            onClick={() => handleDownloadInvoice(request.id)}
            className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-blue-300 hover:border-blue-500 hover:text-blue-600 text-blue-600"
            title="Descargar factura"
          >
            <FaFileDownload className="w-3 h-3" /> Factura
          </button>
        )}
      </div>
    );
  };

  // Definición de columnas para TableList
  const columns = useMemo(() => [
    {
      id: 'requestCode',
      header: 'ID',
      accessorKey: 'requestCode',
      cell: ({ getValue }) => (
        <span className="text-sm parametrization-text font-mono font-medium">
          {getValue()}
        </span>
      ),
    },
    {
      id: 'client',
      header: 'Cliente',
      accessorFn: row => row.client.name,
      cell: ({ row }) => (
        <div>
          <div className="text-sm font-medium parametrization-text">
            {row.original.client.name}
          </div>
          <div className="text-xs text-gray-500">
            {row.original.client.idNumber}
          </div>
        </div>
      ),
    },
    {
      id: 'requestStatus',
      header: 'Estado de Solicitud',
      accessorKey: 'requestStatus',
      cell: ({ getValue, row }) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRequestStatusClass(row.original.requestStatusId)}`}>
          {translateRequestStatus(getValue())}
        </span>
      ),
    },
    {
      id: 'paymentStatus',
      header: 'Estado de Pago',
      accessorKey: 'paymentStatus',
      cell: ({ getValue, row }) => {
        const paymentStatus = getValue();
        const displayText = paymentStatus && paymentStatus !== 'N/A' ? translatePaymentStatus(paymentStatus) : 'N/A';
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusClass(row.original.paymentStatusId)}`}>
            {displayText}
          </span>
        );
      },
    },
    {
      id: 'scheduledDate',
      header: 'Fecha Programada',
      accessorKey: 'scheduledDate',
      cell: ({ getValue }) => {
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
      id: 'completionDate',
      header: 'Fecha de Realización',
      accessorKey: 'completionDate',
      cell: ({ getValue }) => (
        <span className="text-sm parametrization-text">
          {getValue() ? fixDate(getValue()).toLocaleDateString('es-ES') : 'N/A'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => <ActionsCell request={row.original} />,
      enableSorting: false,
    },
  ], []);

  // Filtrar datos
  const filteredData = useMemo(() => {
    return requestsData.filter(request => {
      // Filtro por rango de fechas
      if (selectedDateRange.startDate && selectedDateRange.endDate) {
        const requestDate = new Date(request.scheduledDate);
        const startDate = new Date(selectedDateRange.startDate);
        const endDate = new Date(selectedDateRange.endDate);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        if (requestDate < startDate || requestDate > endDate) {
          return false;
        }
      }

      // Filtro de búsqueda global
      const matchesGlobal = globalFilter === '' ||
        request.requestCode.toLowerCase().includes(globalFilter.toLowerCase()) ||
        request.client.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
        request.client.idNumber.includes(globalFilter);

      // Filtros específicos
      const matchesRequestStatus = requestStatusFilter === '' || request.requestStatusId.toString() === requestStatusFilter;
      const matchesPaymentStatus = paymentStatusFilter === '' || request.paymentStatusId?.toString() === paymentStatusFilter;

      return matchesGlobal && matchesRequestStatus && matchesPaymentStatus;
    });
  }, [requestsData, selectedDateRange, globalFilter, requestStatusFilter, paymentStatusFilter]);

  // Limpiar filtros
  const handleClearFilters = () => {
    setRequestStatusFilter('');
    setPaymentStatusFilter('');
    setGlobalFilter('');
    setSelectedDateRange({ startDate: null, endDate: null });
  };

  // Aplicar filtros
  const handleApplyFilters = () => {
    setFilterModalOpen(false);
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
          Gestión de Solicitudes
        </h1>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="rounded-lg mb-6">
        <div className="relative max-w-md flex gap-2 w-full">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por código, cliente..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full min-w-lg pl-10 pr-16 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          {/* Botón de Filtros */}
          <button
            onClick={() => setFilterModalOpen(true)}
            className="w-full parametrization-filter-button flex items-center justify-center space-x-2 px-4 py-2 transition-colors"
          >
            <FaFilter className="w-4 h-4" />
            <span className="text-sm">Filtrar por</span>
          </button>

          {/* Nueva Pre-Solicitud */}
          <PermissionGuard permission={146}>
            <button
              onClick={handleNewPreRequest}
              className="w-full parametrization-filter-button flex items-center justify-center space-x-2 px-4 py-2 transition-colors"
            >
              <FaCalendarAlt className="w-4 h-4" />
              <span className="text-sm">Nueva Pre-Solicitud</span>
            </button>
          </PermissionGuard>

          {/* Nueva Solicitud */}
          <PermissionGuard permission={151}>
            <button
              onClick={handleNewRequest}
              className="w-full parametrization-filter-button flex items-center justify-center space-x-2 px-4 py-2 transition-colors"
            >
              <FaPlus className="w-4 h-4" />
              <span className="text-sm">Nueva Solicitud</span>
            </button>
          </PermissionGuard>

          {/* Generar Reporte */}
          <PermissionGuard permission={163}>
            <button
              onClick={handleGenerateReport}
              className="w-full parametrization-filter-button flex items-center justify-center space-x-2 px-4 py-2 transition-colors"
            >
              <FaFileDownload className="w-4 h-4" />
              <span className="text-sm">Generar reporte</span>
            </button>
          </PermissionGuard>
        </div>

        {/* Indicador de filtros activos */}
        {(globalFilter || requestStatusFilter || paymentStatusFilter || selectedDateRange.startDate) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-blue-800">
              Mostrando {filteredData.length} de {requestsData.length} solicitudes
              {globalFilter && ` • Búsqueda: "${globalFilter}"`}
              {requestStatusFilter && ` • Estado: ${uniqueRequestStatuses.find(s => s.id.toString() === requestStatusFilter)?.name}`}
              {paymentStatusFilter && ` • Pago: ${uniquePaymentStatuses.find(s => s.id.toString() === paymentStatusFilter)?.name}`}
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

      {/* Sección del Calendario */}
      <div className="card-theme rounded-lg shadow mb-6 max-w-3xl mx-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold parametrization-text mb-4">
            Calendario de Solicitudes
          </h2>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Calendario - Columna Izquierda */}
            <div className="xl:col-span-2">
              <Calendar
                maintenanceData={calendarData}
                selectedDateRange={selectedDateRange}
                onDateRangeChange={setSelectedDateRange}
                disableRangeSelection={true}
              />
            </div>

            {/* Controles y Rango de Fechas - Columna Derecha */}
            <div className="space-y-4">
              {/* Información de fecha actual */}
              <div className="card-secondary bg-accent rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-2">Hoy</h3>
                <p className="text-lg font-bold text-white">
                  {new Date().toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long'
                  })}
                </p>
              </div>

              {/* Controles de Rango de Fechas */}
              <div className="card-secondary rounded-lg p-4">
                <h3 className="text-sm font-semibold parametrization-text mb-4">Seleccionar Rango de Fechas</h3>

                <div className="space-y-4">
                  {/* Fecha de inicio */}
                  <div>
                    <label className="block text-xs font-medium parametrization-text mb-2">
                      Inicio
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
                      Fin
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de solicitudes */}
      <PermissionGuard permission={149}>
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
          {/* Estado de solicitud */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado de la solicitud
            </label>
            <select
              value={requestStatusFilter}
              onChange={(e) => setRequestStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los estados</option>
              {uniqueRequestStatuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          {/* Estado de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado del pago
            </label>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los estados</option>
              {uniquePaymentStatuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FilterModal>

      {/* Modal de Formulario de Solicitud (Pre-registro, Registro y Confirmación) */}
      <MultiStepFormModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        mode={mode}
        onSuccess={handleRequestModalSuccess}
      />

      {/* Modal de Confirmación de Pre-Solicitud */}
      <MultiStepFormModal
        isOpen={confirmFormModalOpen}
        onClose={() => setConfirmFormModalOpen(false)}
        mode={mode}
        requestToEdit={selectedRequest}
        onSuccess={handleConfirmRequestSuccess}
      />

      {/* Modal de Cancelar Solicitud */}
      <CancelRequestModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        request={requestToCancel}
        onSuccess={handleCancelSuccess}
      />

      {/* Modal de Completar Solicitud */}
      <CompleteRequestModal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        request={selectedRequestForComplete}
        onSuccess={handleCompleteSuccess}
      />

      {/* Modal de Éxito */}
      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="Operación Exitosa"
        message={successMessage}
      />

      {/* Modal de Detalles de Solicitud */}
      <DetailsRequestModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedRequestId(null);
        }}
        requestId={selectedRequestId}
      />
      
      {/* Modal de Generar Factura */}
      <GenerateInvoiceModal
        isOpen={GenerateInvoiceModalOpen}
        onClose={() => setGenerateInvoiceModalOpen(false)}
        request={selectedRequest}
        billingToken={billingToken}
      />

      {/* Modal de Generar Reporte */}
      <GenerateReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </div>
  );
};

export default RequestsManagementPage;
