"use client";
import React, { useState, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  FaTimes,
  FaUser,
  FaIdCard,
  FaPhone,
  FaEnvelope,
  FaBuilding,
  FaCheckCircle,
  FaTimesCircle,
  FaFilter,
  FaFileInvoiceDollar,
  FaDownload,
  FaHashtag,
  FaCalendar,
} from "react-icons/fa";
import { useTheme } from "@/contexts/ThemeContext";
import TableList from "../../shared/TableList";

/**
 * DetailsClientModal Component
 * 
 * Modal para mostrar el detalle completo de un cliente, incluyendo:
 * - Información personal y de contacto
 * - Estado del cliente
 * - Historial de solicitudes con filtros
 * - Información de facturación
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controla si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Object} props.client - Datos del cliente a mostrar
 */
const DetailsClientModal = ({ isOpen, onClose, client }) => {
  const { getCurrentTheme } = useTheme();
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Estados para filtros
  const [statusFilter, setStatusFilter] = useState("");
  const [billingFilter, setBillingFilter] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");

  // Mock data - Historial de solicitudes del cliente
  const requestHistory = [
    {
      id: "S-00001",
      date: "2024-01-15",
      billing_status: "Pagada",
      request_status: "Finalizada",
      invoice_url: "/invoices/S-00001.pdf",
      total_amount: "$1,250,000",
    },
    {
      id: "S-00005",
      date: "2024-02-10",
      billing_status: "Pendiente",
      request_status: "En proceso",
      invoice_url: null,
      total_amount: "$850,000",
    },
    {
      id: "S-00012",
      date: "2024-03-05",
      billing_status: "Pagada",
      request_status: "Finalizada",
      invoice_url: "/invoices/S-00012.pdf",
      total_amount: "$2,100,000",
    },
    {
      id: "S-00018",
      date: "2024-04-20",
      billing_status: "No pagada",
      request_status: "Cancelada",
      invoice_url: null,
      total_amount: "$0",
    },
  ];

  // Filtrar datos según los filtros aplicados
  const filteredRequests = useMemo(() => {
    let filtered = requestHistory;

    if (statusFilter) {
      filtered = filtered.filter((req) => req.request_status === statusFilter);
    }

    if (billingFilter) {
      filtered = filtered.filter((req) => req.billing_status === billingFilter);
    }

    return filtered;
  }, [statusFilter, billingFilter]);

  // Obtener valores únicos para los filtros
  const uniqueStatuses = useMemo(() => {
    return [...new Set(requestHistory.map((req) => req.request_status))];
  }, []);

  const uniqueBillingStatuses = useMemo(() => {
    return [...new Set(requestHistory.map((req) => req.billing_status))];
  }, []);

  // Función para obtener color de badge según el estado
  const getStatusColor = (status) => {
    const colors = {
      Finalizada: "bg-green-100 text-green-800",
      "En proceso": "bg-blue-100 text-blue-800",
      Cancelada: "bg-red-100 text-red-800",
      Pendiente: "bg-yellow-100 text-yellow-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getBillingStatusColor = (status) => {
    const colors = {
      Pagada: "bg-green-100 text-green-800",
      Pendiente: "bg-yellow-100 text-yellow-800",
      "No pagada": "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Manejar descarga de factura
  const handleDownloadInvoice = (invoiceUrl, requestId) => {
    // TODO: Implementar lógica real de descarga
    console.log(`Descargando factura para solicitud ${requestId}:`, invoiceUrl);
    alert(`Descargando factura para solicitud ${requestId}`);
  };

  // Aplicar filtros
  const handleApplyFilters = () => {
    setFilterModalOpen(false);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setStatusFilter("");
    setBillingFilter("");
    setFilterModalOpen(false);
  };

  // Columnas de la tabla de historial
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: () => (
          <div className="flex items-center gap-2">
            <FaHashtag className="w-4 h-4" />
            Request ID
          </div>
        ),
        cell: ({ row }) => (
          <div className="font-mono text-sm font-medium text-primary">
            {row.getValue("id")}
          </div>
        ),
      },
      {
        accessorKey: "date",
        header: () => (
          <div className="flex items-center gap-2">
            <FaCalendar className="w-4 h-4" />
            Request date
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-sm text-secondary">
            {new Date(row.getValue("date")).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        ),
      },
      {
        accessorKey: "billing_status",
        header: () => (
          <div className="flex items-center gap-2">
            <FaFileInvoiceDollar className="w-4 h-4" />
            Billing status
          </div>
        ),
        cell: ({ row }) => {
          const status = row.getValue("billing_status");
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBillingStatusColor(
                status
              )}`}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "request_status",
        header: () => (
          <div className="flex items-center gap-2">
            <FaCheckCircle className="w-4 h-4" />
            Request status
          </div>
        ),
        cell: ({ row }) => {
          const status = row.getValue("request_status");
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                status
              )}`}
            >
              {status}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const request = row.original;
          return (
            <div className="flex items-center gap-2">
              {request.invoice_url && request.billing_status === "Pagada" && (
                <button
                  onClick={() =>
                    handleDownloadInvoice(request.invoice_url, request.id)
                  }
                  className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-green-500 hover:text-green-600 text-gray-700"
                  title="Descargar factura"
                >
                  <FaDownload className="w-3 h-3" /> Descargar factura
                </button>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  if (!client) return null;

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="card-theme rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <Dialog.Title className="text-2xl font-bold text-primary">
                  Client Example details
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="text-secondary hover:text-primary transition-colors"
                  aria-label="Cerrar modal"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                {/* Personal & Contact Data Section */}
                <div className="p-6 border-b border-gray-200 bg-surface/50">
                  <h3 className="text-lg font-semibold text-primary mb-4">
                    Personal & Contact data
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name/Business Name */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                        {client.document_type === "NIT" ? (
                          <FaBuilding className="w-5 h-5 text-blue-600" />
                        ) : (
                          <FaUser className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm text-secondary mb-1">
                          Name/Business name
                        </div>
                        <div className="font-medium text-primary">
                          {client.name}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-md bg-green-100 flex items-center justify-center flex-shrink-0">
                        {client.status === "Activo" ? (
                          <FaCheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <FaTimesCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm text-secondary mb-1">Status</div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            client.status === "Activo"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {client.status}
                        </span>
                      </div>
                    </div>

                    {/* Identification Type */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-md bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <FaIdCard className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm text-secondary mb-1">
                          Identification type
                        </div>
                        <div className="font-medium text-primary">
                          {client.document_type}
                        </div>
                      </div>
                    </div>

                    {/* Identification Number */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-md bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <FaHashtag className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-sm text-secondary mb-1">
                          Identification number
                        </div>
                        <div className="font-medium text-primary font-mono">
                          {client.identification_number}
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-md bg-pink-100 flex items-center justify-center flex-shrink-0">
                        <FaEnvelope className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <div className="text-sm text-secondary mb-1">Email</div>
                        <div className="font-medium text-blue-600 hover:underline">
                          {client.email}
                        </div>
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-md bg-cyan-100 flex items-center justify-center flex-shrink-0">
                        <FaPhone className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <div className="text-sm text-secondary mb-1">
                          Phone number
                        </div>
                        <div className="font-medium text-primary">
                          {client.phone_number}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Request History Section */}
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-primary">
                      Request History
                    </h3>

                    <div className="flex items-center gap-3">
                      {/* Filter button */}
                      <button
                        onClick={() => setFilterModalOpen(true)}
                        className={`parametrization-filter-button ${
                          statusFilter || billingFilter
                            ? "bg-blue-100 border-blue-300 text-blue-700"
                            : ""
                        }`}
                      >
                        <FaFilter className="w-4 h-4" />
                        Filter by
                        {(statusFilter || billingFilter) && (
                          <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            {[statusFilter, billingFilter].filter(Boolean).length}
                          </span>
                        )}
                      </button>

                      {/* Clear filters */}
                      {(statusFilter || billingFilter) && (
                        <button
                          onClick={handleClearFilters}
                          className="text-sm text-red-500 hover:text-red-700 underline flex items-center gap-1"
                        >
                          <FaTimes className="w-3 h-3" /> Clear filters
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Table */}
                  <TableList
                    columns={columns}
                    data={filteredRequests}
                    loading={false}
                    globalFilter={globalFilter}
                    onGlobalFilterChange={setGlobalFilter}
                    pageSizeOptions={[5, 10, 20]}
                  />
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Filter Modal */}
      <Dialog.Root open={filterModalOpen} onOpenChange={setFilterModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80]" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[90] w-full max-w-md">
            <div className="card-theme rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <Dialog.Title className="text-xl font-bold text-primary">
                  Filter Requests
                </Dialog.Title>
                <button
                  onClick={() => setFilterModalOpen(false)}
                  className="text-secondary hover:text-primary"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Request Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Request Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-theme w-full"
                  >
                    <option value="">All statuses</option>
                    {uniqueStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Billing Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Billing Status
                  </label>
                  <select
                    value={billingFilter}
                    onChange={(e) => setBillingFilter(e.target.value)}
                    className="input-theme w-full"
                  >
                    <option value="">All billing statuses</option>
                    {uniqueBillingStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 btn-theme btn-error"
                >
                  Clear
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 btn-theme btn-primary"
                >
                  Apply
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default DetailsClientModal;
