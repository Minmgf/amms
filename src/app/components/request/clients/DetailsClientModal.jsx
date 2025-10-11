"use client";
import React, { useState, useMemo, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { FaFilter, FaDownload, FaTimes } from "react-icons/fa";
import { useTheme } from "@/contexts/ThemeContext";
import TableList from "../../shared/TableList";
import FilterModal from "../../shared/FilterModal";
import { getClientDetail, getClientRequestHistory, getClientStatuses, getRequestStatuses, getBillingStatuses } from "@/services/requestService";

/**
 * DetailsClientModal Component
 *
 * Modal parametrizable para mostrar detalles completos del cliente
 * Conectado con endpoint HU-CLI-003
 */
const DetailsClientModal = ({ isOpen, onClose, client }) => {
  const { getCurrentTheme } = useTheme();

  // Estados para filtros
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [billingFilter, setBillingFilter] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");

  // Estados para datos del cliente
  const [clientData, setClientData] = useState(null);
  const [requestHistory, setRequestHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados parametrizables (vendrán del endpoint)
  const [clientStatuses, setClientStatuses] = useState([]);
  const [requestStatuses, setRequestStatuses] = useState([]);
  const [billingStatuses, setBillingStatuses] = useState([]);
  const [personTypes] = useState([
    { id: 1, name: "Natural", description: "Persona natural" },
    { id: 2, name: "Jurídica", description: "Persona jurídica" },
  ]);
  const [identificationType] = useState([
    { id: 1, code: "CC", name: "Cédula de Ciudadanía" },
    { id: 2, code: "NIT", name: "Número de Identificación Tributaria" },
    { id: 3, code: "CE", name: "Cédula de Extranjería" },
    { id: 4, code: "PAS", name: "Pasaporte" },
  ]);

  // Cargar datos del cliente cuando se abre el modal
  useEffect(() => {
    if (isOpen && client?.id) {
      loadClientData();
      loadStatuses();
    }
  }, [isOpen, client]);

  // Cargar estados desde el backend
  const loadStatuses = async () => {
    try {
      // Cargar estados en paralelo
      const [clientStatusesRes, requestStatusesRes, billingStatusesRes] = await Promise.all([
        getClientStatuses().catch(() => ({ data: [] })),
        getRequestStatuses().catch(() => ({ data: [] })),
        getBillingStatuses().catch(() => ({ data: [] }))
      ]);

      // Si los endpoints no están disponibles, usar datos mock
      setClientStatuses(clientStatusesRes.data?.length > 0 ? clientStatusesRes.data : [
        { id_statues: 1, name: "Activo", description: "estado activo" },
        { id_statues: 2, name: "Inactivo", description: "estado inactivo" },
      ]);

      setRequestStatuses(requestStatusesRes.data?.length > 0 ? requestStatusesRes.data : [
        { id_statues: 13, name: "Finalizada", description: "Solicitud completada" },
        { id_statues: 14, name: "En proceso", description: "Solicitud en curso" },
        { id_statues: 15, name: "Cancelada", description: "Solicitud cancelada" },
        { id_statues: 16, name: "Pendiente", description: "Solicitud pendiente" },
      ]);

      setBillingStatuses(billingStatusesRes.data?.length > 0 ? billingStatusesRes.data : [
        { id_statues: 17, name: "Pagada", description: "Factura pagada" },
        { id_statues: 18, name: "Pendiente", description: "Pago pendiente" },
        { id_statues: 19, name: "No pagada", description: "Sin pago" },
      ]);
    } catch (error) {
      console.error("Error loading statuses:", error);
    }
  };

  // Cargar datos del cliente desde el endpoint
  const loadClientData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Llamar al endpoint real
      const response = await getClientDetail(client.id);
      
      if (response.success) {
        setClientData(response.data);
        
        // Cargar historial de solicitudes
        const historyResponse = await getClientRequestHistory(client.id);
        if (historyResponse.success && historyResponse.data?.length > 0) {
          setRequestHistory(historyResponse.data);
        } else {
          // Si no hay datos del endpoint, usar mock data para demostración
          setRequestHistory(generateMockRequestHistory());
        }
      } else {
        throw new Error(response.message || "Error al cargar datos del cliente");
      }
    } catch (err) {
      console.error("Error loading client data:", err);
      setError("Error al cargar los datos del cliente. Mostrando datos de ejemplo.");
      
      // Usar datos mock si falla el endpoint
      setClientData(generateMockClientData());
      setRequestHistory(generateMockRequestHistory());
    } finally {
      setLoading(false);
    }
  };

  // Generar datos mock para el cliente (fallback)
  const generateMockClientData = () => {
    return {
      id_customer: client?.id || 1,
      id_user: null,
      document_number: "800.197.268",
      type_document_id: 2,
      type_document_name: "NIT",
      check_digit: "4",
      person_type_id: 2,
      person_type_name: "Persona Jurídica",
      legal_entity_name: "Panadería El Trigal S.A.S.",
      name: "José Rómulo",
      first_last_name: "Sosa",
      second_last_name: "Ortiz",
      email: "badbaajdhduf@gmail.com",
      phone: "+57377777777",
      address: "Calle 45 # 18-22",
      id_municipality: 1,
      tax_regime: 2,
      customer_statues_id: 1,
      customer_statues_name: "Activo",
      // Campos adicionales para mostrar en el modal
      business_name: "Panadería y Café El Trigal",
      region_city: "Medellín"
    };
  };

  // Generar historial mock (fallback)
  const generateMockRequestHistory = () => {
    return [
      {
        id: "S-00001",
        date: "2024-01-15",
        billing_status_id: 17,
        request_status_id: 13,
        invoice_url: "/invoices/S-00001.pdf",
        total_amount: "$1,250,000",
      },
      ...Array.from({ length: 66 }, (_, i) => ({
        id: `S-${String(i + 2).padStart(5, "0")}`,
        date: "2024-01-15",
        billing_status_id: [17, 18, 19][i % 3],
        request_status_id: [13, 14, 15, 16][i % 4],
        invoice_url: i % 2 === 0 ? `/invoices/S-${String(i + 2).padStart(5, "0")}.pdf` : null,
        total_amount: `$${Math.floor(Math.random() * 5000000)}`,
      })),
    ];
  };

  // Funciones para obtener información por ID
  const getStatusById = (id, statusArray) => {
    return (
      statusArray.find((s) => s.id_statues === id) ||
      statusArray.find((s) => s.id === id)
    );
  };

  const getStatusColorById = (id, type = "request") => {
    if (type === "request") {
      switch (id) {
        case 13: return "bg-green-100 text-green-800";
        case 14: return "bg-blue-100 text-blue-800";
        case 15: return "bg-red-100 text-red-800";
        case 16: return "bg-yellow-100 text-yellow-800";
        default: return "bg-gray-100 text-gray-800";
      }
    } else if (type === "billing") {
      switch (id) {
        case 17: return "bg-green-100 text-green-800";
        case 18: return "bg-yellow-100 text-yellow-800";
        case 19: return "bg-red-100 text-red-800";
        default: return "bg-gray-100 text-gray-800";
      }
    } else if (type === "client") {
      switch (id) {
        case 1: return "bg-green-100 text-green-800";
        case 2: return "bg-red-100 text-red-800";
        default: return "bg-gray-100 text-gray-800";
      }
    }
  };

  // Obtener el régimen tributario
  const getTaxRegimeDisplay = (taxRegime, personType) => {
    if (personType === 2 || personType === "Persona Jurídica") {
      return "Régimen Ordinario - Persona Jurídica";
    }
    return taxRegime === 1 ? "Régimen Simplificado" : "Régimen Ordinario";
  };

  // Filtrar datos
  const filteredRequests = useMemo(() => {
    let filtered = requestHistory;

    if (statusFilter) {
      filtered = filtered.filter((req) => req.request_status_id === parseInt(statusFilter));
    }

    if (billingFilter) {
      filtered = filtered.filter((req) => req.billing_status_id === parseInt(billingFilter));
    }

    return filtered;
  }, [requestHistory, statusFilter, billingFilter]);

  // Manejar descarga de factura
  const handleDownloadInvoice = (invoiceUrl, requestId) => {
    console.log(`Descargando factura para solicitud ${requestId}:`, invoiceUrl);
    // TODO: Implementar descarga real cuando esté disponible el endpoint
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
        header: "ID Solicitud",
        cell: ({ row }) => (
          <div className="font-mono text-sm font-medium text-primary">
            {row.getValue("id")}
          </div>
        ),
      },
      {
        accessorKey: "date",
        header: "Fecha de solicitud",
        cell: ({ row }) => (
          <div className="text-sm text-secondary">{row.getValue("date")}</div>
        ),
      },
      {
        accessorKey: "billing_status_id",
        header: "Estado de facturación",
        cell: ({ row }) => {
          const statusId = row.getValue("billing_status_id");
          const status = getStatusById(statusId, billingStatuses);
          const statusName = status?.name || "N/A";

          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorById(
                statusId,
                "billing"
              )}`}
            >
              {statusName}
            </span>
          );
        },
      },
      {
        accessorKey: "request_status_id",
        header: "Estado de solicitud",
        cell: ({ row }) => {
          const statusId = row.getValue("request_status_id");
          const status = getStatusById(statusId, requestStatuses);
          const statusName = status?.name || "N/A";

          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorById(
                statusId,
                "request"
              )}`}
            >
              {statusName}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => {
          const request = row.original;
          const canDownload = request.invoice_url && request.billing_status_id === 17;

          return (
            <div className="flex items-center justify-center gap-2">
              {canDownload && (
                <button
                  onClick={() => handleDownloadInvoice(request.invoice_url, request.id)}
                  className="inline-flex items-center px-3 py-1.5 gap-2 border border-orange-500 text-orange-600 text-xs font-medium rounded-md hover:bg-orange-50 transition-all opacity-0 group-hover:opacity-100"
                  title="Descargar factura"
                >
                  <FaDownload className="w-3 h-3" /> Factura
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

  // Preparar datos para mostrar
  const displayData = clientData || generateMockClientData();

  // Formatear el nombre completo
  const getFullName = () => {
    const parts = [displayData.name, displayData.first_last_name, displayData.second_last_name].filter(Boolean);
    return parts.join(" ") || "N/A";
  };

  // Formatear región/ciudad
  const getRegionCity = () => {
    // TODO: Obtener el nombre del municipio desde un endpoint o catálogo
    return displayData.region_city || "Medellín";
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
            Detalles del cliente
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-hover rounded-full transition-colors"
            aria-label="Botón cerrar"
          >
            <FiX className="w-5 h-5 text-secondary" />
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-secondary">Cargando datos del cliente...</p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && !loading && (
          <div className="p-4 sm:p-6">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        )}

        {/* Content - Scrollable */}
        {!loading && (
          <div className="overflow-y-auto max-h-[calc(90vh-90px)]">
            {/* Personal & Contact Data Section */}
            <section className="p-4 sm:p-6 border-b border-primary">
              <div className="card-theme">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-6">
                  <h3 className="font-theme-semibold text-theme-base text-primary">
                    Datos personales y de contacto
                  </h3>
                  <span className={`inline-flex w-fit items-center px-3 py-1 rounded-full text-sm font-medium ${
                    getStatusColorById(displayData.customer_statues_id, "client")
                  }`}>
                    {displayData.customer_statues_name || "Activo"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  {/* Identification Type */}
                  <div>
                    <span className="text-theme-sm text-secondary">
                      Tipo de identificación
                    </span>
                    <div className="font-theme-medium text-primary mt-1">
                      {displayData.type_document_name || "N/A"}
                    </div>
                  </div>

                  {/* Type of person */}
                  <div>
                    <span className="text-theme-sm text-secondary">
                      Tipo de persona
                    </span>
                    <div className="font-theme-medium text-primary mt-1">
                      {displayData.person_type_name || "N/A"}
                    </div>
                  </div>

                  {/* Identification Number */}
                  <div>
                    <span className="text-theme-sm text-secondary">
                      Número de identificación
                    </span>
                    <div className="font-theme-medium text-primary mt-1">
                      {displayData.document_number || "N/A"}
                    </div>
                  </div>

                  {/* Check digit */}
                  <div>
                    <span className="text-theme-sm text-secondary">
                      Dígito de verificación
                    </span>
                    <div className="font-theme-medium text-primary mt-1">
                      {displayData.check_digit || "N/A"}
                    </div>
                  </div>

                  {/* Tax regime */}
                  <div>
                    <span className="text-theme-sm text-secondary">
                      Régimen tributario
                    </span>
                    <div className="font-theme-medium text-primary mt-1">
                      {getTaxRegimeDisplay(displayData.tax_regime, displayData.person_type_id)}
                    </div>
                  </div>

                  {/* Legal name */}
                  <div>
                    <span className="text-theme-sm text-secondary">
                      Razón social
                    </span>
                    <div className="font-theme-medium text-primary mt-1">
                      {displayData.legal_entity_name || "N/A"}
                    </div>
                  </div>

                  {/* Full name */}
                  <div>
                    <span className="text-theme-sm text-secondary">
                      Nombre completo
                    </span>
                    <div className="font-theme-medium text-primary mt-1">
                      {getFullName()}
                    </div>
                  </div>

                  {/* Business name */}
                  <div>
                    <span className="text-theme-sm text-secondary">
                      Nombre comercial
                    </span>
                    <div className="font-theme-medium text-primary mt-1">
                      {displayData.business_name || "N/A"}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <span className="text-theme-sm text-secondary">Dirección</span>
                    <div className="font-theme-medium text-primary mt-1">
                      {displayData.address || "N/A"}
                    </div>
                  </div>

                  {/* Region/City */}
                  <div>
                    <span className="text-theme-sm text-secondary">
                      Región/Ciudad
                    </span>
                    <div className="font-theme-medium text-primary mt-1">
                      {getRegionCity()}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <span className="text-theme-sm text-secondary">Correo electrónico</span>
                    <div className="font-theme-medium text-primary mt-1">
                      {displayData.email || "N/A"}
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <span className="text-theme-sm text-secondary">
                      Teléfono
                    </span>
                    <div className="font-theme-medium text-primary mt-1">
                      {displayData.phone || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Request History Section */}
            <section className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-theme-semibold text-theme-base text-primary">
                  Historial de solicitudes
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
                    Filtrar por
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
                      <FaTimes className="w-3 h-3" /> Limpiar filtros
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
                pageSizeOptions={[10, 20, 50, 100]}
                defaultPageSize={10}
              />
            </section>
          </div>
        )}
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
              Estado de solicitud
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
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
              Estado de facturación
            </label>
            <select
              value={billingFilter}
              onChange={(e) => setBillingFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados de facturación</option>
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