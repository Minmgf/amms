"use client";
import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { FaTractor, FaMapMarkerAlt } from "react-icons/fa";
import { useTheme } from "@/contexts/ThemeContext";
import { getRequestDetails } from "@/services/requestService";
import { getCountries, getStates, getCities } from "@/services/locationService";

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
 * @param {string} props.requestId - ID de la solicitud a cargar
 */
const DetailsRequestModal = ({ isOpen, onClose, requestId }) => {
  const { getCurrentTheme } = useTheme();

  // Estados para datos parametrizables
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requestData, setRequestData] = useState(null);
  
  // Estados para nombres de ubicaciones
  const [locationNames, setLocationNames] = useState({
    country: null,
    department: null,
    city: null
  });

  // Estados parametrizables (sincronizados con el backend)
  const [requestStatuses] = useState([
    { id_statues: 19, name: "Presolicitud", description: "Solicitud en estado inicial" },
    { id_statues: 20, name: "Pendiente", description: "Solicitud pendiente de aprobación" },
    { id_statues: 21, name: "Confirmada", description: "Solicitud confirmada" },
    { id_statues: 4, name: "En ejecución", description: "Solicitud en proceso" },
    { id_statues: 22, name: "Finalizada", description: "Solicitud completada" },
    { id_statues: 23, name: "Cancelada", description: "Solicitud cancelada" },
  ]);

  const [paymentStatuses] = useState([
    { id_statues: 15, name: "Pendiente", description: "Pago pendiente" },
    { id_statues: 17, name: "Pago Parcial", description: "Pago parcial realizado" },
    { id_statues: 16, name: "Pagado", description: "Pago completado" },
  ]);

  const [paymentMethods] = useState([
    { id: "1", name: "Medio de pago no definido", description: "Método no especificado" },
    { id: "2", name: "Contado", description: "Pago al contado" },
    { id: "3", name: "Crédito", description: "Pago a crédito" },
    { id: "4", name: "Anticipado", description: "Pago anticipado" },
    { id: "5", name: "Por cuotas", description: "Pago en cuotas" },
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

  // Cargar detalles de la solicitud cuando se proporciona requestId
  useEffect(() => {
    const loadRequestDetails = async () => {
      if (!requestId || !isOpen) {
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await getRequestDetails(requestId);
        setRequestData(data);
      } catch (err) {
        setError('No se pudieron cargar los detalles de la solicitud. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    loadRequestDetails();
  }, [requestId, isOpen]);

  // Cargar nombres de ubicaciones cuando se reciben los datos
  useEffect(() => {
    const loadLocationNames = async () => {
      if (!requestData?.request_location) return;
      
      const location = requestData.request_location;
      const countryIso2 = location.country;
      const departmentIso2 = location.department;
      const cityId = location.city_id;
      
      if (!countryIso2) return;
      
      try {
        // Cargar país
        const countries = await getCountries();
        const country = countries.find(c => c.iso2 === countryIso2);
        
        let department = null;
        let city = null;
        
        // Cargar departamento si existe
        if (departmentIso2) {
          const states = await getStates(countryIso2);
          department = states.find(s => s.iso2 === departmentIso2);
          
          // Cargar ciudad si existe
          if (cityId && departmentIso2) {
            const cities = await getCities(countryIso2, departmentIso2);
            city = cities.find(c => c.id === cityId);
          }
        }
        
        setLocationNames({
          country: country?.name || null,
          department: department?.name || null,
          city: city?.name || null
        });
      } catch (err) {
        console.error('Error cargando nombres de ubicaciones:', err);
      }
    };
    
    loadLocationNames();
  }, [requestData]);

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
  // Los colores están mapeados según el diseño del sistema y sincronizados con el backend
  const getRequestStatusColorById = (id) => {
    switch (id) {
      case 19: return "bg-purple-100 text-purple-800"; // Presolicitud
      case 20: return "bg-yellow-100 text-yellow-800"; // Pendiente
      case 21: return "bg-blue-100 text-blue-800"; // Confirmada
      case 4: return "bg-cyan-100 text-cyan-800"; // En ejecución
      case 22: return "bg-green-100 text-green-800"; // Finalizada
      case 23: return "bg-gray-100 text-gray-800"; // Cancelada
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColorById = (id) => {
    switch (id) {
      case 15: return "bg-yellow-100 text-yellow-800"; // Pendiente
      case 17: return "bg-orange-100 text-orange-800"; // Pago parcial
      case 16: return "bg-green-100 text-green-800"; // Pagado
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Formatear fecha y hora
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) return "N/A";
      
      return date.toLocaleString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return dateString;
    }
  };
  
  // Formatear solo fecha (sin hora)
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) return "N/A";
      
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Formatear moneda
  const formatCurrency = (amount, currencySymbol = null) => {
    if (!amount && amount !== 0) return "N/A";
    
    // Si hay símbolo de moneda del endpoint, usarlo
    if (currencySymbol) {
      return `${currencySymbol} ${new Intl.NumberFormat('es-CO').format(amount)}`;
    }
    
    // Si no, usar formato USD por defecto
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Formatear número de teléfono
  const formatPhoneNumber = (phone) => {
    if (!phone) return "N/A";
    
    // Convertir a string y limpiar espacios
    const cleanPhone = String(phone).replace(/\s+/g, '');
    
    // Si el número comienza con 57 (indicativo de Colombia) y tiene 12 dígitos
    if (cleanPhone.startsWith('57') && cleanPhone.length === 12) {
      const countryCode = cleanPhone.substring(0, 2); // 57
      const part1 = cleanPhone.substring(2, 5); // 310
      const part2 = cleanPhone.substring(5, 8); // 235
      const part3 = cleanPhone.substring(8, 12); // 5419
      return `+${countryCode} ${part1} ${part2} ${part3}`;
    }
    
    // Si ya tiene formato con +, devolverlo tal cual
    if (cleanPhone.startsWith('+')) {
      return phone;
    }
    
    // Retornar el número sin modificar
    return phone;
  };

  if (!isOpen) return null;

  // Mapear datos del endpoint al formato del modal
  const mappedData = requestData ? {
    // Información general
    request_code: requestData.id_request,
    status_id: requestData.request_status_id,
    status_name: requestData.request_status_name,
    detail: requestData.request_detail,
    registration_date: requestData.confirmation_datetime,
    scheduled_start_date: requestData.scheduled_start_date,
    scheduled_end_date: requestData.scheduled_end_date,
    completion_date: requestData.completion_cancellation_datetime,
    completion_observations: requestData.completion_cancellation_observations,
    confirmation_user: requestData.confirmation_user_name,
    completion_user: requestData.completion_cancellation_user_name,
    
    // Información del cliente
    client_name: (() => {
      const fullName = `${requestData.customer_name || ''} ${requestData.customer_first_last_name || ''} ${requestData.customer_second_last_name || ''}`.trim();
      return fullName || requestData.customer_legal_entity_name || 'N/A';
    })(),
    client_document_type: requestData.customer_document_type,
    client_document_number: requestData.customer_document_number,
    client_email: requestData.customer_email,
    client_phone: requestData.customer_phone,
    
    // Maquinaria asignada
    machinery: (requestData.request_machinery_user || []).map(m => ({
      image: m.machinery_image_path,
      serial_number: m.serial_number,
      name: `Maquinaria ${m.serial_number}`,
      operator: m.user_name
    })),
    
    // Ubicación
    location_country: requestData.request_location?.country,
    location_department: requestData.request_location?.department,
    location_municipality: requestData.request_location?.city_id,
    location_place_name: requestData.request_location?.place_name,
    location_latitude: requestData.request_location?.latitude,
    location_longitude: requestData.request_location?.longitude,
    location_area: requestData.request_location?.area,
    location_area_unit: requestData.request_location?.area_unit_symbol,
    location_altitude: requestData.request_location?.altitude,
    location_altitude_unit: requestData.request_location?.altitude_unit_symbol,
    
    // Información económica
    billing_total_amount: requestData.amount_to_pay,
    billing_currency: requestData.currency_unit_amount_to_pay_symbol,
    billing_amount_paid: requestData.amount_paid,
    billing_currency_paid: requestData.currency_unit_amount_paid_symbol,
    payment_status_id: requestData.payment_status_id,
    payment_method_id: requestData.payment_method_code,
  } : mockRequestData;

  // Obtener información de estados
  const requestStatus = getStatusById(mappedData.status_id, requestStatuses);
  const paymentStatus = getStatusById(mappedData.payment_status_id, paymentStatuses);
  const paymentMethod = getStatusById(mappedData.payment_method_id, paymentMethods);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background flex items-center justify-between px-4 sm:px-6 py-5 border-b border-primary">
          <h2 className="text-theme-xl text-primary font-theme-semibold">
            Información de la Solicitud
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-hover rounded-full transition-colors"
            aria-label="Cerrar modal"
          >
            <FiX className="w-5 h-5 text-secondary" />
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        )}

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
        {!loading && (
          <div className="overflow-y-auto max-h-[calc(90vh-90px)]">
            <div className="p-4 sm:p-6 space-y-6">
            {/* Cards Container */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* General Information Card */}
              <div className="card-theme">
                <h3 className="font-theme-semibold text-theme-base text-primary mb-6">
                  Información General
                </h3>
                
                <div className="space-y-3">
                  {/* Request ID */}
                  <div className="flex justify-between items-start">
                    <span className="text-theme-sm text-secondary">ID de Solicitud:</span>
                    <span className="font-theme-medium text-primary text-right">{mappedData.request_code || "N/A"}</span>
                  </div>

                  {/* Status */}
                  <div className="flex justify-between items-center">
                    <span className="text-theme-sm text-secondary">Estado:</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      getRequestStatusColorById(mappedData.status_id)
                    }`}>
                      {requestStatus?.name || "N/A"}
                    </span>
                  </div>

                  {/* Request detail */}
                  <div className="flex justify-between items-start">
                    <span className="text-theme-sm text-secondary">Detalle de solicitud:</span>
                    <span className="font-theme-medium text-primary text-right max-w-[60%]">{mappedData.detail || "N/A"}</span>
                  </div>

                  {/* Registration date */}
                  <div className="flex justify-between items-start">
                    <span className="text-theme-sm text-secondary">Fecha de registro:</span>
                    <span className="font-theme-medium text-primary text-right">{formatDateTime(mappedData.registration_date)}</span>
                  </div>

                  {/* Scheduled start date */}
                  <div className="flex justify-between items-start">
                    <span className="text-theme-sm text-secondary">Fecha y hora programada:</span>
                    <span className="font-theme-medium text-primary text-right">{formatDateTime(mappedData.scheduled_start_date)}</span>
                  </div>

                  {/* Completion date */}
                  {mappedData.completion_date && (
                    <div className="flex justify-between items-start">
                      <span className="text-theme-sm text-secondary">Fecha de realización:</span>
                      <span className="font-theme-medium text-primary text-right">{formatDateTime(mappedData.completion_date)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Client Information Card */}
              <div className="card-theme">
                <h3 className="font-theme-semibold text-theme-base text-primary mb-6">
                  Información del Cliente
                </h3>
                
                <div className="space-y-3">
                  {/* Name/Legal name */}
                  <div className="flex justify-between items-start">
                    <span className="text-theme-sm text-secondary">Nombre/Razón social:</span>
                    <span className="font-theme-medium text-primary text-right max-w-[60%]">{mappedData.client_name || "N/A"}</span>
                  </div>

                  {/* Documentation type */}
                  <div className="flex justify-between items-start">
                    <span className="text-theme-sm text-secondary">Tipo de documento:</span>
                    <span className="font-theme-medium text-primary text-right">{mappedData.client_document_type || "N/A"}</span>
                  </div>

                  {/* Documentation number */}
                  <div className="flex justify-between items-start">
                    <span className="text-theme-sm text-secondary">Número de documento:</span>
                    <span className="font-theme-medium text-primary text-right">{mappedData.client_document_number || "N/A"}</span>
                  </div>

                  {/* Email */}
                  <div className="flex justify-between items-start">
                    <span className="text-theme-sm text-secondary">Correo electrónico:</span>
                    <span className="font-theme-medium text-primary text-right">{mappedData.client_email || "N/A"}</span>
                  </div>

                  {/* Phone number */}
                  <div className="flex justify-between items-start">
                    <span className="text-theme-sm text-secondary">Número de teléfono:</span>
                    <span className="font-theme-medium text-primary text-right">{formatPhoneNumber(mappedData.client_phone)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Service details and assigned resources Card */}
            <div className="card-theme">
              <h3 className="font-theme-semibold text-theme-base text-primary mb-6">
                Detalles del servicio y recursos asignados
              </h3>

              {/* Machinery table */}
              <div className="overflow-x-auto">
                <div className="border border-primary rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-surface border-b border-primary">
                        <th className="px-6 py-3 text-left text-theme-sm font-theme-medium text-secondary">Máquina</th>
                        <th className="px-6 py-3 text-left text-theme-sm font-theme-medium text-secondary">Número de Serie</th>
                        <th className="px-6 py-3 text-left text-theme-sm font-theme-medium text-secondary">Operador</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mappedData.machinery && mappedData.machinery.length > 0 ? (
                        mappedData.machinery.map((machine, index) => (
                          <tr key={index} className="bg-background hover:bg-hover transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {machine.image ? (
                                  <img src={machine.image} alt={machine.name} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                                ) : (
                                  <div className="w-10 h-10 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                    <FaTractor className="w-5 h-5 text-green-600 dark:text-green-500" />
                                  </div>
                                )}
                                <span className="font-theme-medium text-primary">{machine.name || "N/A"}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-secondary">{machine.serial_number || "N/A"}</td>
                            <td className="px-6 py-4 text-secondary">{machine.operator || "N/A"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr className="bg-background">
                          <td colSpan="3" className="px-6 py-8 text-center text-secondary">
                            No hay maquinaria asignada
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Location Information Card */}
            <div className="card-theme">
              <h3 className="font-theme-semibold text-theme-base text-primary mb-6">
                Información de Ubicación
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Location details */}
                <div className="space-y-5">
                  {/* Country */}
                  <div className="flex justify-between items-start">
                    <span className="text-theme-sm text-secondary">País:</span>
                    <span className="font-theme-medium text-primary text-right">{locationNames.country || "N/A"}</span>
                  </div>

                  {/* Department */}
                  <div className="flex justify-between items-start">
                    <span className="text-theme-sm text-secondary">Departamento:</span>
                    <span className="font-theme-medium text-primary text-right">{locationNames.department || "N/A"}</span>
                  </div>

                  {/* Municipality */}
                  <div className="flex justify-between items-start">
                    <span className="text-theme-sm text-secondary">Municipio:</span>
                    <span className="font-theme-medium text-primary text-right">{locationNames.city || "N/A"}</span>
                  </div>

                  {/* Place name */}
                  <div className="flex justify-between items-start">
                    <span className="text-theme-sm text-secondary">Nombre del lugar:</span>
                    <span className="font-theme-medium text-primary text-right">{mappedData.location_place_name || "N/A"}</span>
                  </div>

                  {/* Area */}
                  <div className="flex justify-between items-start">
                    <span className="text-theme-sm text-secondary">Área:</span>
                    <span className="font-theme-medium text-primary text-right">
                      {mappedData.location_area ? `${mappedData.location_area} ${mappedData.location_area_unit || ''}` : "N/A"}
                    </span>
                  </div>

                  {/* Altitude */}
                  <div className="flex justify-between items-start">
                    <span className="text-theme-sm text-secondary">Altitud:</span>
                    <span className="font-theme-medium text-primary text-right">
                      {mappedData.location_altitude ? `${mappedData.location_altitude} ${mappedData.location_altitude_unit || 'msnm'}` : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Map */}
                <div className="flex items-center justify-center">
                  {mappedData.location_latitude && mappedData.location_longitude ? (
                    <div className="w-full h-[280px] bg-surface rounded-lg relative overflow-hidden">
                      {/* Google Maps Embed - Sin necesidad de API Key */}
                      <iframe
                        src={`https://www.google.com/maps?q=${mappedData.location_latitude},${mappedData.location_longitude}&output=embed&z=15`}
                        className="w-full h-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Mapa de ubicación"
                      ></iframe>
                      
                      {/* Coordinates overlay */}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-2 border border-gray-200 z-10">
                        <div className="text-xs font-semibold text-gray-700 mb-1">Coordenadas</div>
                        <div className="text-xs text-gray-600">Latitud: {mappedData.location_latitude}</div>
                        <div className="text-xs text-gray-600">Longitud: {mappedData.location_longitude}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-[280px] bg-surface rounded-lg flex items-center justify-center">
                      <p className="text-secondary">No hay coordenadas disponibles</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Billing Information Card */}
            <div className="card-theme">
              <h3 className="font-theme-semibold text-theme-base text-primary mb-6">
                Información de Facturación
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                {/* Total amount */}
                <div className="flex justify-between items-start">
                  <span className="text-theme-sm text-secondary">Monto total:</span>
                  <span className="font-theme-medium text-primary text-right">{formatCurrency(mappedData.billing_total_amount, mappedData.billing_currency)}</span>
                </div>

                {/* Amount paid */}
                <div className="flex justify-between items-start">
                  <span className="text-theme-sm text-secondary">Monto pagado:</span>
                  <span className="font-theme-medium text-primary text-right">{formatCurrency(mappedData.billing_amount_paid, mappedData.billing_currency_paid)}</span>
                </div>

                {/* Payment status */}
                <div className="flex justify-between items-center">
                  <span className="text-theme-sm text-secondary">Estado de pago:</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    getPaymentStatusColorById(mappedData.payment_status_id)
                  }`}>
                    {paymentStatus?.name || "N/A"}
                  </span>
                </div>

                {/* Payment method */}
                <div className="flex justify-between items-start">
                  <span className="text-theme-sm text-secondary">Método de pago:</span>
                  <span className="font-theme-medium text-primary text-right">{paymentMethod?.name || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default DetailsRequestModal;
