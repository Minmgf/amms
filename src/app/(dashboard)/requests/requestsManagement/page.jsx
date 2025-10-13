"use client";
import React, { useState, useMemo } from 'react';
import { FaSearch, FaFilter, FaPlus, FaCalendarAlt, FaFileDownload, FaFileInvoice } from 'react-icons/fa';
import { FiEdit3, FiX, FiCheck, FiEye } from 'react-icons/fi';
import Calendar from '@/app/components/scheduledMaintenance/Calendar';
import FilterModal from '@/app/components/shared/FilterModal';
import TableList from '@/app/components/shared/TableList';
import CancelRequestModal from '@/app/components/request/CancelRequestModal';
import { SuccessModal, ConfirmModal } from '@/app/components/shared/SuccessErrorModal';

const RequestsManagementPage = () => {
  // Estados principales
  const [loading, setLoading] = useState(false);
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
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Mock data para solicitudes
  const mockRequestsData = [
    {
      id: 1,
      requestCode: 'SOL-2025-0001',
      client: {
        name: 'AgroCampos S.A.S.',
        idNumber: '900.123.456-7'
      },
      requestStatus: 'In progress',
      requestStatusId: 2, // 1: Presolicitud, 2: Pendiente, 3: Confirmada, 4: En ejecución, 5: Finalizada, 6: Cancelada
      paymentStatus: 'Pending',
      paymentStatusId: 1, // 1: Pendiente, 2: Pago parcial, 3: Pagado
      scheduledDate: '2025-03-10',
      completionDate: null,
      hasInvoice: false
    },
    {
      id: 2,
      requestCode: 'SOL-2025-0002',
      client: {
        name: 'Linda Valentina Lopez',
        idNumber: '1.098.765.432'
      },
      requestStatus: 'Pending',
      requestStatusId: 2,
      paymentStatus: 'Pending',
      paymentStatusId: 1,
      scheduledDate: '2025-12-30',
      completionDate: null,
      hasInvoice: false
    },
    {
      id: 3,
      requestCode: 'SOL-2025-0003',
      client: {
        name: 'Linda Valentina Lopez',
        idNumber: '1.098.765.432'
      },
      requestStatus: 'Pre-request',
      requestStatusId: 1,
      paymentStatus: 'Pending',
      paymentStatusId: 1,
      scheduledDate: '2025-12-30',
      completionDate: null,
      hasInvoice: false
    },
    {
      id: 4,
      requestCode: 'SOL-2025-0004',
      client: {
        name: 'Transportes del Norte S.A.S.',
        idNumber: '900.555.444-1'
      },
      requestStatus: 'Confirmed',
      requestStatusId: 3,
      paymentStatus: 'Paid',
      paymentStatusId: 3,
      scheduledDate: '2025-03-11',
      completionDate: null,
      hasInvoice: true
    },
    {
      id: 5,
      requestCode: 'SOL-2025-0005',
      client: {
        name: 'Maquinaria Pesada Ltda.',
        idNumber: '900.987.654-3'
      },
      requestStatus: 'In execution',
      requestStatusId: 4,
      paymentStatus: 'Partial payment',
      paymentStatusId: 2,
      scheduledDate: '2025-03-12',
      completionDate: null,
      hasInvoice: true
    },
    {
      id: 6,
      requestCode: 'SOL-2025-0006',
      client: {
        name: 'Juan Carlos Rodríguez',
        idNumber: '1.234.567.890'
      },
      requestStatus: 'Finished',
      requestStatusId: 5,
      paymentStatus: 'Paid',
      paymentStatusId: 3,
      scheduledDate: '2025-03-08',
      completionDate: '2025-03-08',
      hasInvoice: true
    },
    {
      id: 7,
      requestCode: 'SOL-2025-0007',
      client: {
        name: 'María Fernanda Gómez',
        idNumber: '52.123.456'
      },
      requestStatus: 'Canceled',
      requestStatusId: 6,
      paymentStatus: 'Pending',
      paymentStatusId: 1,
      scheduledDate: '2025-03-09',
      completionDate: null,
      hasInvoice: false
    },
    {
      id: 8,
      requestCode: 'SOL-2025-0008',
      client: {
        name: 'Tech Solutions Inc.',
        idNumber: '900.111.222-3'
      },
      requestStatus: 'Pending',
      requestStatusId: 2,
      paymentStatus: 'Pending',
      paymentStatusId: 1,
      scheduledDate: '2025-03-09',
      completionDate: null,
      hasInvoice: false
    },
    {
      id: 9,
      requestCode: 'SOL-2025-0009',
      client: {
        name: 'Industrial Services Co.',
        idNumber: '900.333.444-5'
      },
      requestStatus: 'Confirmed',
      requestStatusId: 3,
      paymentStatus: 'Partial payment',
      paymentStatusId: 2,
      scheduledDate: '2025-03-13',
      completionDate: null,
      hasInvoice: true
    },
    {
      id: 10,
      requestCode: 'SOL-2025-0010',
      client: {
        name: 'Pedro Martínez Silva',
        idNumber: '79.888.999'
      },
      requestStatus: 'Pending',
      requestStatusId: 2,
      paymentStatus: 'Pending',
      paymentStatusId: 1,
      scheduledDate: '2025-03-14',
      completionDate: null,
      hasInvoice: false
    }
  ];

  // Transformar datos para el calendario
  const calendarData = useMemo(() => {
    return mockRequestsData.map(request => ({
      ...request,
      maintenanceDate: request.scheduledDate,
      machinery: { name: request.client.name },
      status_id: request.requestStatusId
    }));
  }, []);

  // Estados únicos para filtros
  const uniqueRequestStatuses = [
    { id: 1, name: 'Presolicitud' },
    { id: 2, name: 'Pendiente' },
    { id: 3, name: 'Confirmada' },
    { id: 4, name: 'En ejecución' },
    { id: 5, name: 'Finalizada' },
    { id: 6, name: 'Cancelada' }
  ];

  const uniquePaymentStatuses = [
    { id: 1, name: 'Pendiente' },
    { id: 2, name: 'Pago parcial' },
    { id: 3, name: 'Pagado' }
  ];

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
      case 1: return 'text-purple-800 bg-purple-100'; // Presolicitud
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

  // Funciones de acciones (sin funcionalidad por ahora)
  const handleViewDetails = (requestId) => {
    console.log('Ver detalles:', requestId);
  };

  const handleEditRequest = (requestId) => {
    console.log('Editar solicitud:', requestId);
  };

  const handleCancelRequest = (requestId) => {
    const request = mockRequestsData.find(r => r.id === requestId);
    setSelectedRequest(request);
    setCancelModalOpen(true);
  };

  const handleCancelSuccess = (requestCode) => {
    setSuccessMessage(`Solicitud cancelada exitosamente. Código: ${requestCode}`);
    setSuccessModalOpen(true);
    // TODO: Aquí se debería recargar la lista de solicitudes desde el API
    console.log('Solicitud cancelada:', requestCode);
  };

  const handleConfirmRequest = (requestId) => {
    const request = mockRequestsData.find(r => r.id === requestId);
    setSelectedRequest(request);
    setConfirmModalOpen(true);
  };

  const handleConfirmSuccess = () => {
    setConfirmModalOpen(false);
    // TODO: Aquí se debería abrir el formulario de edición completo
    // Por ahora solo mostramos mensaje de éxito
    setSuccessMessage(`Solicitud confirmada exitosamente. La solicitud pasó a estado "Pendiente".`);
    setSuccessModalOpen(true);
    console.log('Abriendo formulario de confirmación para:', selectedRequest?.requestCode);
  };

  const handleCompleteRequest = (requestId) => {
    console.log('Completar solicitud:', requestId);
  };

  const handleRegisterInvoice = (requestId) => {
    console.log('Registrar factura:', requestId);
  };

  const handleDownloadInvoice = (requestId) => {
    console.log('Descargar factura:', requestId);
  };

  const handleNewPreRequest = () => {
    console.log('Nueva Pre-Solicitud');
  };

  const handleNewRequest = () => {
    console.log('Nueva Solicitud');
  };

  const handleGenerateReport = () => {
    console.log('Generar reporte');
  };

  // Componente de acciones dinámicas con hover
  const ActionsCell = ({ request }) => {
    return (
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {/* Detalles - siempre disponible */}
        <button
          onClick={() => handleViewDetails(request.id)}
          className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-blue-500 hover:text-blue-600 text-gray-700"
          title="Ver detalles"
        >
          <FiEye className="w-3 h-3" /> Detalles
        </button>

        {/* Confirmar - solo para presolicitudes */}
        {request.requestStatusId === 1 && (
          <button
            onClick={() => handleConfirmRequest(request.id)}
            className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-blue-300 hover:border-blue-500 hover:text-blue-600 text-blue-600"
            title="Confirmar solicitud"
          >
            <FiCheck className="w-3 h-3" /> Confirmar
          </button>
        )}

        {/* Editar - solo para pendientes */}
        {request.requestStatusId === 2 && (
          <button
            onClick={() => handleEditRequest(request.id)}
            className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-green-300 hover:border-green-500 hover:text-green-600 text-green-600"
            title="Editar solicitud"
          >
            <FiEdit3 className="w-3 h-3" /> Editar
          </button>
        )}

        {/* Cancelar - solo para pendientes */}
        {request.requestStatusId === 2 && (
          <button
            onClick={() => handleCancelRequest(request.id)}
            className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-red-300 hover:border-red-500 hover:text-red-600 text-red-600"
            title="Cancelar solicitud"
          >
            <FiX className="w-3 h-3" /> Cancelar
          </button>
        )}

        {/* Completar - solo para pendientes */}
        {request.requestStatusId === 2 && (
          <button
            onClick={() => handleCompleteRequest(request.id)}
            className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-green-300 hover:border-green-500 hover:text-green-600 text-green-600"
            title="Completar solicitud"
          >
            <FiCheck className="w-3 h-3" /> Completar
          </button>
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
      cell: ({ getValue, row }) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusClass(row.original.paymentStatusId)}`}>
          {translatePaymentStatus(getValue())}
        </span>
      ),
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
    return mockRequestsData.filter(request => {
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
      const matchesPaymentStatus = paymentStatusFilter === '' || request.paymentStatusId.toString() === paymentStatusFilter;

      return matchesGlobal && matchesRequestStatus && matchesPaymentStatus;
    });
  }, [selectedDateRange, globalFilter, requestStatusFilter, paymentStatusFilter]);

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
          <button
            onClick={handleNewPreRequest}
            className="w-full parametrization-filter-button flex items-center justify-center space-x-2 px-4 py-2 transition-colors"
          >
            <FaCalendarAlt className="w-4 h-4" />
            <span className="text-sm">Nueva Pre-Solicitud</span>
          </button>

          {/* Nueva Solicitud */}
          <button
            onClick={handleNewRequest}
            className="w-full parametrization-filter-button flex items-center justify-center space-x-2 px-4 py-2 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            <span className="text-sm">Nueva Solicitud</span>
          </button>

          {/* Generar Reporte */}
          <button
            onClick={handleGenerateReport}
            className="w-full parametrization-filter-button flex items-center justify-center space-x-2 px-4 py-2 transition-colors"
          >
            <FaFileDownload className="w-4 h-4" />
            <span className="text-sm">Generar reporte</span>
          </button>
        </div>

        {/* Indicador de filtros activos */}
        {(globalFilter || requestStatusFilter || paymentStatusFilter || selectedDateRange.startDate) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-blue-800">
              Mostrando {filteredData.length} de {mockRequestsData.length} solicitudes
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
      <div className="card-theme rounded-lg shadow">
        <TableList
          columns={columns}
          data={filteredData}
          loading={loading}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
        />
      </div>

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

      {/* Modal de Cancelar Solicitud */}
      <CancelRequestModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        request={selectedRequest}
        onSuccess={handleCancelSuccess}
      />

      {/* Modal de Confirmar Solicitud */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmSuccess}
        title="Confirmar Solicitud"
        message="¿Desea confirmar esta solicitud? Se abrirá el formulario de edición para completar la información."
        confirmText="Confirmar"
        cancelText="Cancelar"
        confirmColor="btn-primary"
        cancelColor="btn-error"
      />

      {/* Modal de Éxito */}
      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="Operación Exitosa"
        message={successMessage}
      />
    </div>
  );
};

export default RequestsManagementPage;
