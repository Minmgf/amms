"use client";
import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FaTimes, FaFileDownload, FaSpinner } from "react-icons/fa";
import { ErrorModal, SuccessModal } from "@/app/components/shared/SuccessErrorModal";
import { generateServiceRequestsReport } from "@/services/serviceService";
import { getStatuesByCategory } from "@/services/parametrizationService";
import { getClientsList } from "@/services/clientService";
import { getPaymentMethods } from "@/services/requestService";

const GenerateReportModal = ({ isOpen, onClose }) => {
  // Estados del formulario
  const [reportFormat, setReportFormat] = useState("excel");
  const [customerId, setCustomerId] = useState("");
  const [requestStatus, setRequestStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [scheduledStartDateFrom, setScheduledStartDateFrom] = useState("");
  const [scheduledStartDateTo, setScheduledStartDateTo] = useState("");
  
  // Estados para opciones de los selects
  const [clients, setClients] = useState([]);
  const [requestStatuses, setRequestStatuses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  
  // Estados de UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    setIsLoadingData(true);
    try {
      // Cargar clientes - API devuelve {success: true, data: Array}
      const clientsResponse = await getClientsList();
      if (clientsResponse.success && clientsResponse.data) {
        const activeClients = clientsResponse.data.filter(client => client.customer_statues_id === 1);
        setClients(activeClients);
      }

      // Cargar estados de solicitudes (categoría 7) - API devuelve Array directamente
      const statusesResponse = await getStatuesByCategory(7);
      if (Array.isArray(statusesResponse)) {
        setRequestStatuses(statusesResponse);
      }

      // Cargar métodos de pago - API devuelve {success: true, data: Array}
      const paymentMethodsResponse = await getPaymentMethods();
      console.log("Payment Methods Response:", paymentMethodsResponse);
      if (paymentMethodsResponse.success && paymentMethodsResponse.data) {
        console.log("Payment Methods Data:", paymentMethodsResponse.data);
        setPaymentMethods(paymentMethodsResponse.data);
      }
    } catch (error) {
      // Silenciar errores de carga de filtros opcionales
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleGenerateReport = async () => {
    // Validaciones
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      setErrorMessage("La fecha de inicio no puede ser mayor a la fecha de fin");
      setIsErrorModalOpen(true);
      return;
    }

    if (scheduledStartDateFrom && scheduledStartDateTo && new Date(scheduledStartDateFrom) > new Date(scheduledStartDateTo)) {
      setErrorMessage("La fecha programada de inicio no puede ser mayor a la fecha programada de fin");
      setIsErrorModalOpen(true);
      return;
    }

    // Validar que fechas no sean futuras
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validar fechas de registro
    if (dateFrom && new Date(dateFrom) > today) {
      setErrorMessage("La fecha de registro inicial no puede ser futura");
      setIsErrorModalOpen(true);
      return;
    }

    if (dateTo && new Date(dateTo) > today) {
      setErrorMessage("La fecha de registro final no puede ser futura");
      setIsErrorModalOpen(true);
      return;
    }

    // WORKAROUND: Validar fechas programadas no futuras (debido a validación incorrecta del backend)
    // TODO: Remover estas validaciones cuando el backend se corrija para permitir fechas programadas futuras
    if (scheduledStartDateFrom && new Date(scheduledStartDateFrom) > today) {
      setErrorMessage("La fecha programada inicial no puede ser futura (limitación temporal del sistema)");
      setIsErrorModalOpen(true);
      return;
    }

    if (scheduledStartDateTo && new Date(scheduledStartDateTo) > today) {
      setErrorMessage("La fecha programada final no puede ser futura (limitación temporal del sistema)");
      setIsErrorModalOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const filters = {
        report_format: reportFormat,
      };

      // Agregar filtros opcionales solo si tienen valor
      if (customerId) filters.customer_id = customerId;
      if (requestStatus) filters.request_status = requestStatus;
      if (dateFrom) filters.date_from = dateFrom;
      if (dateTo) filters.date_to = dateTo;
      if (paymentMethod) filters.payment_method = paymentMethod;
      if (scheduledStartDateFrom) filters.scheduled_start_date_from = scheduledStartDateFrom;
      if (scheduledStartDateTo) filters.scheduled_start_date_to = scheduledStartDateTo;

      console.log("Filters being sent:", filters);

      const response = await generateServiceRequestsReport(filters);

      // Verificar si no hay resultados
      if (response.data.type === 'application/json') {
        const text = await response.data.text();
        const jsonResponse = JSON.parse(text);
        
        if (jsonResponse.message === "No se encontraron resultados para los criterios aplicados") {
          setErrorMessage("No se encontraron resultados para los criterios aplicados");
          setIsErrorModalOpen(true);
          setIsSubmitting(false);
          return;
        }
      }

      // Descargar archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Obtener el nombre del archivo del header Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      let filename = `RF_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.${reportFormat === 'excel' ? 'xlsx' : 'csv'}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMessage(`Reporte generado exitosamente: ${filename}`);
      setIsSuccessModalOpen(true);
      handleClose();
    } catch (error) {
      let errorMsg = "Error al generar el reporte. Por favor, intente de nuevo.";
      
      if (error.response?.status === 403) {
        errorMsg = "No tiene permisos para generar reportes";
      } else if (error.response?.status === 401) {
        errorMsg = "Usuario no autenticado";
      } else if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.message) {
          errorMsg = errorData.message;
        } else if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors).flat();
          errorMsg = errorMessages.join(", ");
        }
      }

      setErrorMessage(errorMsg);
      setIsErrorModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Limpiar formulario
    setReportFormat("excel");
    setCustomerId("");
    setRequestStatus("");
    setDateFrom("");
    setDateTo("");
    setPaymentMethod("");
    setScheduledStartDateFrom("");
    setScheduledStartDateTo("");
    onClose();
  };

  const handleClearFilters = () => {
    setCustomerId("");
    setRequestStatus("");
    setDateFrom("");
    setDateTo("");
    setPaymentMethod("");
    setScheduledStartDateFrom("");
    setScheduledStartDateTo("");
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={handleClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-[60]" />
          <Dialog.Content className="modal-theme fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b sticky top-0 modal-theme z-10" style={{ borderColor: 'var(--color-border)' }}>
              <Dialog.Title className="text-2xl font-semibold text-primary">
                Generar Reporte de Solicitudes
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  aria-label="Cerrar modal"
                  className="p-2 text-secondary hover:text-primary rounded-full transition-colors cursor-pointer"
                  onClick={handleClose}
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            {/* Content */}
            <Dialog.Description className="sr-only">
              Formulario para generar reportes de solicitudes de servicio con filtros opcionales
            </Dialog.Description>
            <div className="p-6">
              {isLoadingData ? (
                <div className="flex items-center justify-center py-8">
                  <FaSpinner className="animate-spin text-4xl text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Formato del reporte */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Formato del Reporte <span className="text-error">*</span>
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          value="excel"
                          checked={reportFormat === "excel"}
                          onChange={(e) => setReportFormat(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-primary">Excel (.xlsx)</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          value="csv"
                          checked={reportFormat === "csv"}
                          onChange={(e) => setReportFormat(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-primary">CSV (.csv)</span>
                      </label>
                    </div>
                  </div>

                  {/* Separador */}
                  <div className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <h3 className="text-lg font-semibold text-primary mt-4 mb-4">
                      Filtros Opcionales
                    </h3>
                  </div>

                  {/* Filtros en grid de 2 columnas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cliente */}
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Documento del Cliente
                      </label>
                      <select
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        className="input-theme"
                      >
                        <option value="">Todos los clientes</option>
                        {clients.map((client) => (
                          <option key={client.id_customer} value={client.id_customer}>
                            {client.legal_entity_name} - {client.document_number}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Estado de solicitud */}
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Estado de la Solicitud
                      </label>
                      <select
                        value={requestStatus}
                        onChange={(e) => setRequestStatus(e.target.value)}
                        className="input-theme"
                      >
                        <option value="">Todos los estados</option>
                        {requestStatuses.map((status) => (
                          <option key={status.id_statues} value={status.id_statues}>
                            {status.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Modalidad de pago */}
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Modalidad de Pago
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="input-theme"
                      >
                        <option value="">Todas las modalidades</option>
                        {paymentMethods.map((method) => (
                          <option key={method.code} value={method.code}>
                            {method.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Rango de fechas de registro */}
                  <div>
                    <h4 className="text-sm font-medium text-primary mb-3">
                      Rango de Fechas de Registro
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-secondary mb-2">
                          Desde
                        </label>
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          max={dateTo || new Date().toISOString().split('T')[0]}
                          className="input-theme"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-secondary mb-2">
                          Hasta
                        </label>
                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          min={dateFrom}
                          max={new Date().toISOString().split('T')[0]}
                          className="input-theme"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rango de fechas programadas */}
                  <div>
                    <h4 className="text-sm font-medium text-primary mb-3">
                      Rango de Fechas Programadas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-secondary mb-2">
                          Desde
                        </label>
                        <input
                          type="date"
                          value={scheduledStartDateFrom}
                          onChange={(e) => setScheduledStartDateFrom(e.target.value)}
                          max={scheduledStartDateTo || new Date().toISOString().split('T')[0]}
                          className="input-theme"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-secondary mb-2">
                          Hasta
                        </label>
                        <input
                          type="date"
                          value={scheduledStartDateTo}
                          onChange={(e) => setScheduledStartDateTo(e.target.value)}
                          min={scheduledStartDateFrom || undefined}
                          max={new Date().toISOString().split('T')[0]}
                          className="input-theme"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botón de limpiar filtros */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleClearFilters}
                      className="text-sm text-secondary hover:text-primary transition-colors"
                      type="button"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer con botones */}
            <div className="flex gap-3 p-6 border-t sticky bottom-0 modal-theme" style={{ borderColor: 'var(--color-border)' }}>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="btn-theme btn-secondary w-1/2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Cancelar"
                type="button"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={isSubmitting || isLoadingData}
                className="btn-theme btn-primary w-1/2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                aria-label="Generar reporte"
                type="button"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <FaFileDownload />
                    Generar Reporte
                  </>
                )}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal de Error */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title="Error"
        message={errorMessage}
      />

      {/* Modal de Éxito */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Reporte Generado"
        message={successMessage}
      />
    </>
  );
};

export default GenerateReportModal;
