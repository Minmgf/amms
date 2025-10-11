"use client";
import React, { useState, useMemo } from "react";
import { FiX } from "react-icons/fi";
import { FaFilter, FaDownload, FaTimes } from "react-icons/fa";
import { useTheme } from "@/contexts/ThemeContext";
import TableList from "../../shared/TableList";
import FilterModal from "../../shared/FilterModal";

/**
 * DetailsClientModal Component
 *
 * Modal parametrizable para mostrar detalles completos del cliente
 */
const DetailsClientModal = ({ isOpen, onClose, client }) => {
  const { getCurrentTheme } = useTheme();

  // Estados para filtros
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [billingFilter, setBillingFilter] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");

  // Mock data - Estados parametrizables (vendrá del endpoint)
  const [clientStatuses] = useState([
    { id_statues: 1, name: "Activo", description: "estado activo" },
    { id_statues: 2, name: "Inactivo", description: "estado inactivo" },
  ]);

  const [requestStatuses] = useState([
    { id_statues: 13, name: "Finalizada", description: "Solicitud completada" },
    { id_statues: 14, name: "En proceso", description: "Solicitud en curso" },
    { id_statues: 15, name: "Cancelada", description: "Solicitud cancelada" },
    { id_statues: 16, name: "Pendiente", description: "Solicitud pendiente" },
  ]);

  const [billingStatuses] = useState([
    { id_statues: 17, name: "Pagada", description: "Factura pagada" },
    { id_statues: 18, name: "Pendiente", description: "Pago pendiente" },
    { id_statues: 19, name: "No pagada", description: "Sin pago" },
  ]);

  const [personTypes] = useState([
    { id: 1, name: "Natural", description: "Persona natural" },
    { id: 2, name: "Juridica", description: "Persona jurídica" },
  ]);

  const [identificationType] = useState([
    { id: 1, code: "CC", name: "Cédula de Ciudadanía" },
    { id: 2, code: "NIT", name: "Número de Identificación Tributaria" },
    { id: 3, code: "CE", name: "Cédula de Extranjería" },
    { id: 4, code: "PAS", name: "Pasaporte" },
  ]);

  // Mock data - Historial de solicitudes (vendrá del endpoint)
  const requestHistory = [
    {
      id: "S-00001",
      date: "Example",
      billing_status_id: 17, // Pagada
      request_status_id: 13, // Finalizada
      invoice_url: "/invoices/S-00001.pdf",
      total_amount: "$1,250,000",
    },
    // Más registros para simular paginación (67 páginas como en el mockup)
    ...Array.from({ length: 66 }, (_, i) => ({
      id: `S-${String(i + 2).padStart(5, "0")}`,
      date: "2024-01-15",
      billing_status_id: [17, 18, 19][i % 3],
      request_status_id: [13, 14, 15, 16][i % 4],
      invoice_url:
        i % 2 === 0
          ? `/invoices/S-${String(i + 2).padStart(5, "0")}.pdf`
          : null,
      total_amount: `$${Math.floor(Math.random() * 5000000)}`,
    })),
  ];

  // Funciones para obtener información por ID
  const getStatusById = (id, statusArray) => {
    return (
      statusArray.find((s) => s.id_statues === id) ||
      statusArray.find((s) => s.id === id)
    );
  };

  const getStatusColorById = (id, type = "request") => {
    // Colores basados en ID (no modificables)
    if (type === "request") {
      switch (id) {
        case 13:
          return "bg-green-100 text-green-800"; // Finalizada
        case 14:
          return "bg-blue-100 text-blue-800"; // En proceso
        case 15:
          return "bg-red-100 text-red-800"; // Cancelada
        case 16:
          return "bg-yellow-100 text-yellow-800"; // Pendiente
        default:
          return "bg-gray-100 text-gray-800";
      }
    } else if (type === "billing") {
      switch (id) {
        case 17:
          return "bg-green-100 text-green-800"; // Pagada
        case 18:
          return "bg-yellow-100 text-yellow-800"; // Pendiente
        case 19:
          return "bg-red-100 text-red-800"; // No pagada
        default:
          return "bg-gray-100 text-gray-800";
      }
    } else if (type === "client") {
      switch (id) {
        case 1:
          return "bg-green-100 text-green-800"; // Activo
        case 2:
          return "bg-red-100 text-red-800"; // Inactivo
        default:
          return "bg-gray-100 text-gray-800";
      }
    }
  };

  // Filtrar datos
  const filteredRequests = useMemo(() => {
    let filtered = requestHistory;

    if (statusFilter) {
      filtered = filtered.filter(
        (req) => req.request_status_id === parseInt(statusFilter)
      );
    }

    if (billingFilter) {
      filtered = filtered.filter(
        (req) => req.billing_status_id === parseInt(billingFilter)
      );
    }

    return filtered;
  }, [statusFilter, billingFilter]);

  // Manejar descarga de factura
  const handleDownloadInvoice = (invoiceUrl, requestId) => {
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

  // Columnas de la tabla
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Request ID",
        cell: ({ row }) => (
          <div className="font-mono text-sm font-medium text-primary">
            {row.getValue("id")}
          </div>
        ),
      },
      {
        accessorKey: "date",
        header: "Request date",
        cell: ({ row }) => (
          <div className="text-sm text-secondary">{row.getValue("date")}</div>
        ),
      },
      {
        accessorKey: "billing_status_id",
        header: "Billing status",
        cell: ({ row }) => {
          const statusId = row.getValue("billing_status_id");
          const status = getStatusById(statusId, billingStatuses);
          const statusName = status?.name || "N/A";

          // Mapeo específico para el mockup
          const displayName =
            statusName === "Pagada"
              ? "Paid"
              : statusName === "Pendiente"
              ? "Pending"
              : statusName === "No pagada"
              ? "Unpaid"
              : statusName;

          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorById(
                statusId,
                "billing"
              )}`}
            >
              {displayName}
            </span>
          );
        },
      },
      {
        accessorKey: "request_status_id",
        header: "Request status",
        cell: ({ row }) => {
          const statusId = row.getValue("request_status_id");
          const status = getStatusById(statusId, requestStatuses);
          const statusName = status?.name || "N/A";

          // Mapeo específico para el mockup
          const displayName =
            statusName === "Finalizada"
              ? "Finished"
              : statusName === "En proceso"
              ? "In progress"
              : statusName === "Cancelada"
              ? "Cancelled"
              : statusName === "Pendiente"
              ? "Pending"
              : statusName;

          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorById(
                statusId,
                "request"
              )}`}
            >
              {displayName}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const request = row.original;
          const canDownload =
            request.invoice_url && request.billing_status_id === 17;

          return (
            <div className="flex items-center justify-center gap-2">
              {canDownload && (
                <button
                  onClick={() =>
                    handleDownloadInvoice(request.invoice_url, request.id)
                  }
                  className="inline-flex items-center px-3 py-1.5 gap-2 border border-orange-500 text-orange-600 text-xs font-medium rounded-md hover:bg-orange-50 transition-all opacity-0 group-hover:opacity-100"
                  title="Descargar factura"
                >
                  <FaDownload className="w-3 h-3" /> Invoice
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [billingStatuses, requestStatuses]
  );

  if (!isOpen || !client) return null;

  // Obtener información parametrizable del cliente
  const clientStatus = getStatusById(client.status_id || 1, clientStatuses);
  const clientPersonType = getStatusById(
    client.person_type_id || 2,
    personTypes
  );
  const clientIdType = getStatusById(
    client.identification_type_id || 2,
    identificationType
  );

  // Datos del cliente según mockup
  const mockupClientData = {
    identification_type: "NIT",
    identification_number: "800.197.268",
    check_digit: "4",
    type_of_person: "Juridic Entity",
    tax_regime: "Ordinary Regime - Legal Entity",
    legal_name: "Panadería El Trigal S.A.S.",
    full_name: "José Rómulo Sosa Ortiz",
    business_name: "Panadería y Café El Trigal",
    address: "Calle 45 # 18-22",
    region_city: "Medellín",
    email: "badbaajdhduf@gmail.com",
    phone_number: "+57377777777",
    status: "Active",
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background flex items-center justify-between px-4 sm:px-6 py-5 border-b border-primary">
          <h2 className="text-theme-xl text-primary font-theme-semibold">
            Client Example details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-hover rounded-full transition-colors"
            aria-label="Close Button"
          >
            <FiX className="w-5 h-5 text-secondary" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto max-h-[calc(90vh-90px)]">
          {/* Personal & Contact Data Section */}
          <section className="p-4 sm:p-6 border-b border-primary">
            <div className="card-theme">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-6">
                <h3 className="font-theme-semibold text-theme-base text-primary">
                  Personal & Contact data
                </h3>
                <span className="inline-flex w-fit items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {mockupClientData.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {/* Identification Type */}
                <div>
                  <span className="text-theme-sm text-secondary">
                    Identification type
                  </span>
                  <div className="font-theme-medium text-primary mt-1">
                    {mockupClientData.identification_type}
                  </div>
                </div>

                {/* Type of person */}
                <div>
                  <span className="text-theme-sm text-secondary">
                    Type of person
                  </span>
                  <div className="font-theme-medium text-primary mt-1">
                    {mockupClientData.type_of_person}
                  </div>
                </div>

                {/* Identification Number */}
                <div>
                  <span className="text-theme-sm text-secondary">
                    Identification number
                  </span>
                  <div className="font-theme-medium text-primary mt-1">
                    {mockupClientData.identification_number}
                  </div>
                </div>

                {/* Check digit */}
                <div>
                  <span className="text-theme-sm text-secondary">
                    Check digit
                  </span>
                  <div className="font-theme-medium text-primary mt-1">
                    {mockupClientData.check_digit}
                  </div>
                </div>

                {/* Tax regime */}
                <div>
                  <span className="text-theme-sm text-secondary">
                    Tax regime
                  </span>
                  <div className="font-theme-medium text-primary mt-1">
                    {mockupClientData.tax_regime}
                  </div>
                </div>

                {/* Legal name */}
                <div>
                  <span className="text-theme-sm text-secondary">
                    Legal name
                  </span>
                  <div className="font-theme-medium text-primary mt-1">
                    {mockupClientData.legal_name}
                  </div>
                </div>

                {/* Full name */}
                <div>
                  <span className="text-theme-sm text-secondary">
                    Full name
                  </span>
                  <div className="font-theme-medium text-primary mt-1">
                    {mockupClientData.full_name}
                  </div>
                </div>

                {/* Business name */}
                <div>
                  <span className="text-theme-sm text-secondary">
                    Business name
                  </span>
                  <div className="font-theme-medium text-primary mt-1">
                    {mockupClientData.business_name}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <span className="text-theme-sm text-secondary">Address</span>
                  <div className="font-theme-medium text-primary mt-1">
                    {mockupClientData.address}
                  </div>
                </div>

                {/* Region/City */}
                <div>
                  <span className="text-theme-sm text-secondary">
                    Region/City
                  </span>
                  <div className="font-theme-medium text-primary mt-1">
                    {mockupClientData.region_city}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <span className="text-theme-sm text-secondary">Email</span>
                  <div className="font-theme-medium text-primary mt-1">
                    {mockupClientData.email}
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <span className="text-theme-sm text-secondary">
                    Phone number
                  </span>
                  <div className="font-theme-medium text-primary mt-1">
                    {mockupClientData.phone_number}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Request History Section */}
          <section className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-theme-semibold text-theme-base text-primary">
                Request History
              </h3>

              <div className="flex items-center gap-3">
                {/* Filter button */}
                <button
                  onClick={() => setFilterModalOpen(true)}
                  className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                    statusFilter || billingFilter
                      ? "bg-blue-100 border-blue-300 text-blue-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <FaFilter className="w-4 h-4" />
                  Filter by
                  {(statusFilter || billingFilter) && (
                    <span className="ml-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
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
              pageSizeOptions={[1, 5, 10, 20]}
              defaultPageSize={1}
            />
          </section>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onClear={handleClearFilters}
        onApply={handleApplyFilters}
      >
        <div className="space-y-4">
          {/* Request Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All statuses</option>
              {requestStatuses.map((status) => (
                <option key={status.id_statues} value={status.id_statues}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          {/* Billing Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Billing Status
            </label>
            <select
              value={billingFilter}
              onChange={(e) => setBillingFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All billing statuses</option>
              {billingStatuses.map((status) => (
                <option key={status.id_statues} value={status.id_statues}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FilterModal>
    </div>
  );
};

export default DetailsClientModal;
