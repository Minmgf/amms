"use client";
import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { FaTractor, FaMapMarkerAlt } from "react-icons/fa";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * DetailsRequestModal Component
 * 
 * Modal para visualizar el detalle completo de una solicitud (HU-SOL-004)
 * Muestra información general, datos del cliente, detalles del servicio,
 * ubicación del trabajo e información económica
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controla si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Object} props.request - Datos de la solicitud a mostrar
 */
const DetailsRequestModal = ({ isOpen, onClose, request }) => {
  const { getCurrentTheme } = useTheme();

  // Estados para datos parametrizables
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock data - Estados parametrizables (vendrá del endpoint)
  // TODO: Cuando se implemente el endpoint, reemplazar con llamada a la API
  const [requestStatuses] = useState([
    { id_statues: 1, name: "Presolicitud", description: "Solicitud en estado inicial" },
    { id_statues: 2, name: "Pendiente", description: "Solicitud pendiente de aprobación" },
    { id_statues: 3, name: "Confirmada", description: "Solicitud confirmada" },
    { id_statues: 4, name: "En ejecución", description: "Solicitud en proceso" },
    { id_statues: 5, name: "Finalizada", description: "Solicitud completada" },
    { id_statues: 6, name: "Cancelada", description: "Solicitud cancelada" },
  ]);

  const [paymentStatuses] = useState([
    { id_statues: 1, name: "Pendiente", description: "Pago pendiente" },
    { id_statues: 2, name: "Pago parcial", description: "Pago parcial realizado" },
    { id_statues: 3, name: "Pagado", description: "Pago completado" },
  ]);

  const [paymentMethods] = useState([
    { id: 1, name: "Contado", description: "Pago al contado" },
    { id: 2, name: "Crédito", description: "Pago a crédito" },
    { id: 3, name: "Anticipado", description: "Pago anticipado" },
    { id: 4, name: "Por cuotas", description: "Pago en cuotas" },
  ]);

  // Mock data - Datos de prueba de la solicitud
  // TODO: Estos datos vendrán del prop 'request' cuando se integre con el endpoint real
  const mockRequestData = {
    request_code: "EXCO01-2025",
    status_id: 3, // En ejecución
    detail: "Example",
    registration_date: "2025-09-28T10:45:00",
    scheduled_date: "2025-10-12T07:30:00",
    completion_date: null,
    
    // Client information
    client_name: "AgroCampos S.A.S.",
    client_document_type: "NIT",
    client_document_number: "901.457.236-5",
    client_email: "contacto@agrocampos.com",
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
    billing_amount_paid: 4000.00,
    payment_status_id: 2, // Pago parcial
    payment_method_id: 2, // Crédito
  };

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Función para obtener información por ID
  const getStatusById = (id, statusArray) => {
    return (
      statusArray.find((s) => s.id_statues === id) ||
      statusArray.find((s) => s.id === id)
    );
  };

  // Función para obtener colores por ID (basada en ID, no en nombre)
  // Los colores están mapeados según el diseño del sistema
  const getRequestStatusColorById = (id) => {
    switch (id) {
      case 1: return "bg-purple-100 text-purple-800"; // Presolicitud
      case 2: return "bg-yellow-100 text-yellow-800"; // Pendiente
      case 3: return "bg-blue-100 text-blue-800"; // Confirmada
      case 4: return "bg-cyan-100 text-cyan-800"; // En ejecución
      case 5: return "bg-green-100 text-green-800"; // Finalizada
      case 6: return "bg-gray-100 text-gray-800"; // Cancelada
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColorById = (id) => {
    switch (id) {
      case 1: return "bg-yellow-100 text-yellow-800"; // Pendiente
      case 2: return "bg-green-100 text-green-800"; // Pago parcial / Pending (paid partially)
      case 3: return "bg-green-100 text-green-800"; // Pagado
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Formatear fecha y hora
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateString;
    }
  };

  // Formatear moneda
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!isOpen) return null;

  // Usar datos mock si no se proporciona request, o usar request si está disponible
  const requestData = request || mockRequestData;

  // Obtener información de estados
  const requestStatus = getStatusById(requestData.status_id, requestStatuses);
  const paymentStatus = getStatusById(requestData.payment_status_id, paymentStatuses);
  const paymentMethod = getStatusById(requestData.payment_method_id, paymentMethods);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background flex items-center justify-between px-4 sm:px-6 py-5 border-b border-primary">
          <h2 className="text-theme-xl text-primary font-theme-semibold">
            Request Information
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-hover rounded-full transition-colors"
            aria-label="Cerrar modal"
          >
            <FiX className="w-5 h-5 text-secondary" />
          </button>
        </div>

        {/* Error message */}
        {error && !loading && (
          <div className="p-4 sm:p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Content - Scrollable */}
        <div className="overflow-y-auto max-h-[calc(90vh-90px)]">
          <div className="p-4 sm:p-6 space-y-6">
            {/* Cards Container */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* General Information Card */}
              <div className="card-theme">
                <h3 className="font-theme-semibold text-theme-base text-primary mb-6">
                  General Information
                </h3>
                
                <div className="space-y-4">
                  {/* Request ID */}
                  <div>
                    <span className="text-theme-sm text-secondary">Request ID:</span>
                    <div className="font-theme-medium text-primary mt-1">{requestData.request_code || "N/A"}</div>
                  </div>

                  {/* Status */}
                  <div>
                    <span className="text-theme-sm text-secondary">Status:</span>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        getRequestStatusColorById(requestData.status_id)
                      }`}>
                        {requestStatus?.name || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Request detail */}
                  <div>
                    <span className="text-theme-sm text-secondary">Request detail:</span>
                    <div className="font-theme-medium text-primary mt-1">{requestData.detail || "Example"}</div>
                  </div>

                  {/* Registration date */}
                  <div>
                    <span className="text-theme-sm text-secondary">Registration date:</span>
                    <div className="font-theme-medium text-primary mt-1">{formatDateTime(requestData.registration_date)}</div>
                  </div>

                  {/* Scheduled date */}
                  <div>
                    <span className="text-theme-sm text-secondary">Scheduled date:</span>
                    <div className="font-theme-medium text-primary mt-1">{formatDateTime(requestData.scheduled_date)}</div>
                  </div>

                  {/* Completion date */}
                  <div>
                    <span className="text-theme-sm text-secondary">Completion date:</span>
                    <div className="font-theme-medium text-primary mt-1">{formatDateTime(requestData.completion_date) || "N/A"}</div>
                  </div>
                </div>
              </div>

              {/* Client Information Card */}
              <div className="card-theme">
                <h3 className="font-theme-semibold text-theme-base text-primary mb-6">
                  Client Information
                </h3>
                
                <div className="space-y-4">
                  {/* Name/Legal name */}
                  <div>
                    <span className="text-theme-sm text-secondary">Name/Legal name:</span>
                    <div className="font-theme-medium text-primary mt-1">{requestData.client_name || "N/A"}</div>
                  </div>

                  {/* Documentation type */}
                  <div>
                    <span className="text-theme-sm text-secondary">Documentation type:</span>
                    <div className="font-theme-medium text-primary mt-1">{requestData.client_document_type || "N/A"}</div>
                  </div>

                  {/* Documentation number */}
                  <div>
                    <span className="text-theme-sm text-secondary">Documentation number:</span>
                    <div className="font-theme-medium text-primary mt-1">{requestData.client_document_number || "N/A"}</div>
                  </div>

                  {/* Email */}
                  <div>
                    <span className="text-theme-sm text-secondary">Email:</span>
                    <div className="font-theme-medium text-primary mt-1">{requestData.client_email || "N/A"}</div>
                  </div>

                  {/* Phone number */}
                  <div>
                    <span className="text-theme-sm text-secondary">Phone number:</span>
                    <div className="font-theme-medium text-primary mt-1">{requestData.client_phone || "N/A"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service details and assigned resources Card */}
            <div className="card-theme">
              <h3 className="font-theme-semibold text-theme-base text-primary mb-6">
                Service details and assigned resources
              </h3>

              {/* Machinery table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface">
                    <tr>
                      <th className="px-4 py-3 text-left text-theme-sm font-theme-semibold text-primary">Machine</th>
                      <th className="px-4 py-3 text-left text-theme-sm font-theme-semibold text-primary">Serial Number</th>
                      <th className="px-4 py-3 text-left text-theme-sm font-theme-semibold text-primary">Operator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary">
                    {requestData.machinery && requestData.machinery.length > 0 ? (
                      requestData.machinery.map((machine, index) => (
                        <tr key={index} className="hover:bg-hover transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-md bg-green-100 flex items-center justify-center flex-shrink-0">
                                <FaTractor className="w-5 h-5 text-green-600" />
                              </div>
                              <span className="font-theme-medium text-primary">{machine.name || "N/A"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-secondary">{machine.serial_number || "N/A"}</td>
                          <td className="px-4 py-3 text-secondary">{machine.operator || "N/A"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-4 py-6 text-center text-secondary">
                          No hay maquinaria asignada
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Location Information Card */}
            <div className="card-theme">
              <h3 className="font-theme-semibold text-theme-base text-primary mb-6">
                Location Information
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Location details */}
                <div className="space-y-4">
                  {/* Country */}
                  <div>
                    <span className="text-theme-sm text-secondary">Country:</span>
                    <div className="font-theme-medium text-primary mt-1">{requestData.location_country || "N/A"}</div>
                  </div>

                  {/* Department */}
                  <div>
                    <span className="text-theme-sm text-secondary">Department:</span>
                    <div className="font-theme-medium text-primary mt-1">{requestData.location_department || "N/A"}</div>
                  </div>

                  {/* Municipality */}
                  <div>
                    <span className="text-theme-sm text-secondary">Municipality:</span>
                    <div className="font-theme-medium text-primary mt-1">{requestData.location_municipality || "N/A"}</div>
                  </div>

                  {/* Place name */}
                  <div>
                    <span className="text-theme-sm text-secondary">Place name:</span>
                    <div className="font-theme-medium text-primary mt-1">{requestData.location_place_name || "N/A"}</div>
                  </div>

                  {/* Area */}
                  <div>
                    <span className="text-theme-sm text-secondary">Area:</span>
                    <div className="font-theme-medium text-primary mt-1">
                      {requestData.location_area ? `${requestData.location_area} hectares` : "N/A"}
                    </div>
                  </div>

                  {/* Type of soil */}
                  <div>
                    <span className="text-theme-sm text-secondary">Type of soil:</span>
                    <div className="font-theme-medium text-primary mt-1">{requestData.location_soil_type || "N/A"}</div>
                  </div>

                  {/* Humidity level */}
                  <div>
                    <span className="text-theme-sm text-secondary">Humidity level:</span>
                    <div className="font-theme-medium text-primary mt-1">
                      {requestData.location_humidity ? `${requestData.location_humidity}%` : "N/A"}
                    </div>
                  </div>

                  {/* Altitude */}
                  <div>
                    <span className="text-theme-sm text-secondary">Altitude:</span>
                    <div className="font-theme-medium text-primary mt-1">
                      {requestData.location_altitude ? `${requestData.location_altitude} m a.s.l` : "N/A"}
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className="h-[400px] flex flex-col">
                  {requestData.location_latitude && requestData.location_longitude ? (
                    <div className="flex-1 bg-surface rounded-lg flex items-center justify-center relative overflow-hidden">
                      {/* Placeholder for map - TODO: Integrate with map library */}
                      <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100"></div>
                      <div className="relative z-10 text-center">
                        <FaMapMarkerAlt className="w-16 h-16 text-red-500 mx-auto mb-2" />
                      </div>
                      
                      {/* Coordinates overlay */}
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-3 border border-gray-200">
                        <div className="text-xs font-medium text-gray-600 mb-1">Coords</div>
                        <div className="text-xs text-gray-700">Latitude: {requestData.location_latitude}</div>
                        <div className="text-xs text-gray-700">Longitude: {requestData.location_longitude}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 bg-surface rounded-lg flex items-center justify-center">
                      <p className="text-secondary">No hay coordenadas disponibles</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Billing Information Card */}
            <div className="card-theme">
              <h3 className="font-theme-semibold text-theme-base text-primary mb-6">
                Billing Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {/* Total amount */}
                <div>
                  <span className="text-theme-sm text-secondary">Total amount:</span>
                  <div className="font-theme-medium text-primary mt-1">{formatCurrency(requestData.billing_total_amount)}</div>
                </div>

                {/* Amount paid */}
                <div>
                  <span className="text-theme-sm text-secondary">Amount paid:</span>
                  <div className="font-theme-medium text-primary mt-1">{formatCurrency(requestData.billing_amount_paid)}</div>
                </div>

                {/* Payment status */}
                <div>
                  <span className="text-theme-sm text-secondary">Payment status:</span>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      getPaymentStatusColorById(requestData.payment_status_id)
                    }`}>
                      {paymentStatus?.name || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Payment method */}
                <div>
                  <span className="text-theme-sm text-secondary">Payment method:</span>
                  <div className="font-theme-medium text-primary mt-1">{paymentMethod?.name || "N/A"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsRequestModal;
