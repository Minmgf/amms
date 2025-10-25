"use client";
import TableList from "@/app/components/shared/TableList";
import React, { useState, useMemo, useEffect } from "react";
import { CiFilter } from "react-icons/ci";
import {
  FaEye,
  FaPen,
  FaPlus,
  FaTimes,
  FaTrash,
  FaUser,
  FaIdCard,
  FaPhone,
  FaEnvelope,
  FaCheckCircle,
  FaTimesCircle,
  FaBuilding,
  FaHashtag,
} from "react-icons/fa";
import {
  SuccessModal,
  ErrorModal,
  ConfirmModal,
} from "@/app/components/shared/SuccessErrorModal";
import FilterModal from "@/app/components/shared/FilterModal";
import { getClientsList, deleteClient, toggleClientStatus } from "@/services/clientService";
import AddClientModal from "@/app/components/request/clients/AddClientModal";
import DetailsClientModal from "@/app/components/request/clients/DetailsClientModal";
import { authorization } from "@/services/billingService";
import PermissionGuard from "@/app/(auth)/PermissionGuard";

/**
 * ClientsView Component
 *
 * Displays a comprehensive table of clients with filtering and CRUD operations.
 *
 * Features:
 * - Sortable and filterable table using TanStack Table
 * - Advanced filter modal with multiple criteria
 * - Hover-based action buttons (Edit, Details, Delete)
 * - Pagination with customizable page size
 * - Global search functionality
 * - Responsive design
 *
 * Column Structure:
 * - Nombre/Razón Social (Name/Business Name)
 * - Número de Identificación (Identification Number)
 * - Número de Teléfono (Phone Number)
 * - Correo Electrónico (Email)
 * - Estado (Status)
 * - Usuario Activo (Active User)
 * - Acciones (Actions)
 *
 * @example
 * // Action buttons only appear on row hover for better UX
 * // Filter modal supports multiple criteria with Clean/Apply buttons
 */
const ClientsView = () => {
  // Global filter state
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(false);

  // Data states
  const [clientsData, setClientsData] = useState([]);
  const [error, setError] = useState(null);

  // Filter modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [identificationFilter, setIdentificationFilter] = useState("");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  // Modal states for CRUD operations
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [billingToken, setBillingToken] = useState("");

  // Delete flow modal states
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmDeactivateOpen, setIsConfirmDeactivateOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  // Load initial data
  useEffect(() => {
    loadInitialData();
    const getTokenBilling = async () => {
      try {
        const response = await authorization();
        setBillingToken(response.access_token);
      } catch (error) {
        console.error("Error en inicialización:", error);
      }
    };
    getTokenBilling();
  }, []);

  // Apply filters when data or filters change
  useEffect(() => {
    applyFilters();
  }, [
    clientsData,
    nameFilter,
    identificationFilter,
    documentTypeFilter,
    statusFilter,
    phoneFilter,
    emailFilter,
  ]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getClientsList();
      if (response.success) {
        setClientsData(response.data);
      } else {
        setError("No se pudieron cargar los clientes.");
        setClientsData([]);
      }
    } catch (err) {
      console.error("Error loading clients:", err);
      setError("Error al conectar con el servidor.");
      setClientsData([]);
    } finally {
      setLoading(false);
    }
  };

  // Get unique values for filters
  const uniqueDocumentTypes = useMemo(() => {
    const types = clientsData.map((client) => client.type_document_name).filter(Boolean);
    return [...new Set(types)];
  }, [clientsData]);

  const uniqueStatuses = useMemo(() => {
    const statuses = clientsData.map((client) => ({
      id: client.customer_statues_id,
      name: client.customer_statues_name,
    })).filter(Boolean);
    // Remove duplicates based on id
    const uniqueMap = new Map(statuses.map(s => [s.id, s]));
    return Array.from(uniqueMap.values());
  }, [clientsData]);

  // Apply filters
  const applyFilters = () => {
    let filtered = clientsData;

    if (nameFilter) {
      filtered = filtered.filter((client) =>
        client.legal_entity_name?.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (identificationFilter) {
      filtered = filtered.filter((client) =>
        client.document_number?.toString().includes(identificationFilter)
      );
    }

    if (documentTypeFilter) {
      filtered = filtered.filter(
        (client) => client.type_document_name === documentTypeFilter
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((client) => client.customer_statues_id === parseInt(statusFilter));
    }

    if (phoneFilter) {
      filtered = filtered.filter((client) =>
        client.phone?.includes(phoneFilter)
      );
    }

    if (emailFilter) {
      filtered = filtered.filter((client) =>
        client.email?.toLowerCase().includes(emailFilter.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  // Filter handlers
  const handleApplyFilters = () => {
    applyFilters();
    setIsFilterModalOpen(false);
  };

  const handleClearFilters = () => {
    setNameFilter("");
    setIdentificationFilter("");
    setDocumentTypeFilter("");
    setStatusFilter("");
    setPhoneFilter("");
    setEmailFilter("");
    applyFilters();
  };

  // Custom global filter function
  const globalFilterFn = useMemo(() => {
    return (row, columnId, filterValue) => {
      if (!filterValue) return true;

      const searchTerm = filterValue.toLowerCase().trim();
      if (!searchTerm) return true;

      const client = row.original;

      const searchableFields = [
        client.legal_entity_name,
        client.document_number,
        client.type_document_name,
        client.phone,
        client.email,
        client.customer_statues_name,
        client.id_user ? "Sí" : "No",
      ];

      return searchableFields.some((field) => {
        if (!field) return false;
        return field.toString().toLowerCase().includes(searchTerm);
      });
    };
  }, []);

  // Get status badge color by ID
  const getStatusColor = (statusId) => {
    const colors = {
      1: "bg-green-100 text-green-800", // Activo
      2: "bg-red-100 text-red-800",     // Inactivo
      3: "bg-yellow-100 text-yellow-800", // Pendiente
    };
    return colors[statusId] || "bg-gray-100 text-gray-800";
  };

  // Action handlers
  const handleEdit = (client) => {
    setSelectedClient(client);
    setModalMode("edit");
    setIsCreateModalOpen(true);
  };

  const handleView = (client) => {
    setSelectedClient(client);
    setIsDetailsModalOpen(true);
    console.log("View client details:", client);
    // TODO: Open details modal
  };

  const handleDelete = (client) => {
    setSelectedClient(client);
    setIsConfirmDeleteOpen(true);
  };

  // Handle toggle client status (activate/deactivate)
  const handleToggleClientStatus = async () => {
    setIsConfirmDeactivateOpen(false);

    if (!selectedClient) return;

    try {
      const response = await toggleClientStatus(selectedClient.id_customer || selectedClient.id);
      
      if (response.success) {
        // Actualizar el cliente en la lista
        setClientsData(prevData =>
          prevData.map(client =>
            (client.id_customer || client.id) === (selectedClient.id_customer || selectedClient.id)
              ? { 
                  ...client, 
                  customer_statues_id: client.customer_statues_id === 1 ? 2 : 1,
                  customer_statues_name: client.customer_statues_id === 1 ? "Inactivo" : "Activo"
                }
              : client
          )
        );

        // Mostrar modal de éxito
        setModalTitle("Estado Actualizado");
        setModalMessage(response.message || "El estado del cliente ha sido actualizado exitosamente.");
        setIsSuccessModalOpen(true);
      }
    } catch (error) {
      console.error("Error toggling client status:", error);
      setModalTitle("Error");
      setModalMessage(
        error.response?.data?.message || 
        "Ocurrió un error al cambiar el estado del cliente. Por favor, inténtelo de nuevo."
      );
      setIsErrorModalOpen(true);
    }
  };

  // Handle confirm delete action
  const handleConfirmDelete = async () => {
    setIsConfirmDeleteOpen(false);

    if (!selectedClient) return;

    try {
      // Intentar eliminar el cliente directamente
      // El backend validará automáticamente si tiene asociaciones
      const response = await deleteClient(selectedClient.id_customer || selectedClient.id);
      
      if (response.success) {
        // Eliminación exitosa - remover cliente de la lista
        setClientsData(prevData =>
          prevData.filter(client => (client.id_customer || client.id) !== (selectedClient.id_customer || selectedClient.id))
        );

        // Mostrar modal de éxito
        setModalTitle("Eliminación Exitosa");
        setModalMessage(response.message || "El cliente ha sido eliminado exitosamente.");
        setIsSuccessModalOpen(true);
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      
      if (error.response?.status === 400 || error.response?.status === 409) {
        // Cliente tiene asociaciones - ofrecer desactivarlo
        setModalTitle("Cliente con Asociaciones");
        setModalMessage(
          error.response?.data?.message || 
          "Este cliente está asociado con solicitudes, registros o facturas y no puede ser eliminado. ¿Desea desactivarlo en su lugar? Esto lo ocultará de futuros formularios."
        );
        setIsConfirmDeactivateOpen(true);
      } else {
        // Otro tipo de error
        setModalTitle("Error");
        setModalMessage(
          error.response?.data?.message || 
          "Ocurrió un error al eliminar el cliente. Por favor, inténtelo de nuevo."
        );
        setIsErrorModalOpen(true);
      }
    }
  };

  const handleAddNewClient = () => {
    setIsCreateModalOpen(true);
    setSelectedClient(null);
    setModalMode("create");
  };

  // Table columns definition
  const columns = useMemo(
    () => [
      {
        accessorKey: "legal_entity_name",
        header: () => (
          <div className="flex items-center gap-2">
            <FaBuilding className="w-4 h-4" />
            Nombre/Razón Social
          </div>
        ),
        cell: ({ row }) => {
          const client = row.original;
          const isCompany = client.person_type_id === 1; // 1 = Juridic Entity, 2 = Natural Person
          return (
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-md flex items-center justify-center ${isCompany ? "bg-blue-100" : "bg-purple-100"
                }`}>
                {isCompany ? (
                  <FaBuilding className="w-4 h-4 text-blue-600" />
                ) : (
                  <FaUser className="w-4 h-4 text-purple-600" />
                )}
              </div>
              <div>
                <div className="font-medium parametrization-text">
                  {client.legal_entity_name}
                </div>
                <div className="text-xs text-gray-500">
                  {client.type_document_name}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "document_number",
        header: () => (
          <div className="flex items-center gap-2">
            <FaIdCard className="w-4 h-4" />
            Número de Identificación
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-sm parametrization-text font-mono">
            {row.getValue("document_number")}
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: () => (
          <div className="flex items-center gap-2">
            <FaPhone className="w-4 h-4" />
            Número de Teléfono
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-sm parametrization-text">
            +{row.getValue("phone")}
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: () => (
          <div className="flex items-center gap-2">
            <FaEnvelope className="w-4 h-4" />
            Correo Electrónico
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-sm parametrization-text text-blue-600 hover:underline">
            {row.getValue("email")}
          </div>
        ),
      },
      {
        accessorKey: "customer_statues_id",
        header: () => (
          <div className="flex items-center gap-2">
            <FaCheckCircle className="w-4 h-4" />
            Estado
          </div>
        ),
        cell: ({ row }) => {
          const client = row.original;
          const statusId = client.customer_statues_id;
          const statusName = client.customer_statues_name;
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                statusId
              )}`}
            >
              {statusName}
            </span>
          );
        },
      },
      {
        accessorKey: "id_user",
        header: () => (
          <div className="flex items-center gap-2">
            <FaUser className="w-4 h-4" />
            Usuario Activo
          </div>
        ),
        cell: ({ row }) => {
          const isActive = row.getValue("id_user");
          return (
            <div className="flex items-center gap-2">
              {isActive ? (
                <FaCheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <FaTimesCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="text-sm parametrization-text">
                {isActive ? "Sí" : "No"}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => (
          <div className="flex items-center gap-2">
            <FaHashtag className="w-4 h-4" />
            Acciones
          </div>
        ),
        cell: ({ row }) => {
          const client = row.original;
          return (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <PermissionGuard permission={134}>
                <button
                  onClick={() => handleView(client)}
                  className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-blue-500 hover:text-blue-600 text-gray-700 cursor-pointer"
                  title="Ver detalles"
                >
                  <FaEye className="w-3 h-3" /> Detalles
                </button>
              </PermissionGuard>
              <PermissionGuard permission={137}>
                <button
                  onClick={() => handleEdit(client)}
                  className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-green-500 hover:text-green-600 text-gray-700 cursor-pointer"
                  title="Editar cliente"
                >
                  <FaPen className="w-3 h-3" /> Editar
                </button>
              </PermissionGuard>
              <PermissionGuard permission={138}>
                <button
                  onClick={() => handleDelete(client)}
                  className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-red-500 hover:text-red-600 text-gray-700 cursor-pointer"
                  title="Eliminar cliente"
                >
                  <FaTrash className="w-3 h-3" /> Eliminar
                </button>
              </PermissionGuard>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold parametrization-text">
            Gestión de Clientes
          </h1>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => setError(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <span className="sr-only">Dismiss</span>×
            </button>
          </div>
        )}
      </div>

      {/* Search bar and action buttons */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Search input */}
        <div className="flex-1 max-w-md relative">
          <input
            id="search"
            type="text"
            placeholder="Buscar por nombre, identificación, teléfono, correo..."
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {globalFilter && (
            <button
              onClick={() => setGlobalFilter("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter button */}
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className={`parametrization-filter-button ${nameFilter ||
            identificationFilter ||
            documentTypeFilter ||
            statusFilter ||
            phoneFilter ||
            emailFilter
            ? "bg-blue-100 border-blue-300 text-blue-700"
            : ""
            }`}
        >
          <CiFilter className="w-4 h-4" />
          Filtrar por
          {(nameFilter ||
            identificationFilter ||
            documentTypeFilter ||
            statusFilter ||
            phoneFilter ||
            emailFilter) && (
              <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {
                  [
                    nameFilter,
                    identificationFilter,
                    documentTypeFilter,
                    statusFilter,
                    phoneFilter,
                    emailFilter,
                  ].filter(Boolean).length
                }
              </span>
            )}
        </button>

        {/* Clear filters button */}
        {(nameFilter ||
          identificationFilter ||
          documentTypeFilter ||
          statusFilter ||
          phoneFilter ||
          emailFilter) && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-red-500 hover:text-red-700 underline flex items-center gap-1"
            >
              <FaTimes className="w-3 h-3" /> Limpiar filtros
            </button>
          )}

        {/* Add new client button */}
        <PermissionGuard permission={133}>
          <button
            onClick={handleAddNewClient}
            className="parametrization-filter-button bg-black text-white hover:bg-gray-800"
          >
            <FaPlus className="w-4 h-4" />
            Agregar Cliente
          </button>
        </PermissionGuard>
      </div>

      {/* Clients table */}
      <PermissionGuard permission={135}>
        <TableList
          columns={columns}
          data={
            filteredData.length > 0 ||
              nameFilter ||
              identificationFilter ||
              documentTypeFilter ||
              statusFilter ||
              phoneFilter ||
              emailFilter
              ? filteredData
              : clientsData
          }
          loading={loading}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          globalFilterFn={globalFilterFn}
          pageSizeOptions={[10, 20, 30, 50]}
        />
      </PermissionGuard>

      {/* Filter Modal */}
      <FilterModal
        open={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onClear={handleClearFilters}
        onApply={handleApplyFilters}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name/Business Name Filter */}
          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              <FaBuilding className="inline w-4 h-4 mr-2" />
              Nombre/Razón Social
            </label>
            <input
              type="text"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>

          {/* Identification Number Filter */}
          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              <FaIdCard className="inline w-4 h-4 mr-2" />
              Número de Identificación
            </label>
            <input
              type="text"
              value={identificationFilter}
              onChange={(e) => setIdentificationFilter(e.target.value)}
              placeholder="Ej: 900123456-7"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>

          {/* Document Type Filter */}
          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              <FaIdCard className="inline w-4 h-4 mr-2" />
              Tipo de Documento
            </label>
            <select
              value={documentTypeFilter}
              onChange={(e) => setDocumentTypeFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none"
            >
              <option value="">Todos los tipos</option>
              {uniqueDocumentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              <FaCheckCircle className="inline w-4 h-4 mr-2" />
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent appearance-none"
            >
              <option value="">Todos los estados</option>
              {uniqueStatuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          {/* Phone Number Filter */}
          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              <FaPhone className="inline w-4 h-4 mr-2" />
              Número de Teléfono
            </label>
            <input
              type="text"
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value)}
              placeholder="Ej: +57 310 555 1234"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>

          {/* Email Filter */}
          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              <FaEnvelope className="inline w-4 h-4 mr-2" />
              Correo Electrónico
            </label>
            <input
              type="email"
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              placeholder="Ej: ejemplo@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>
        </div>
      </FilterModal>

      {/* Create Client Modal */}
      <AddClientModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedClient(null);
        }}
        mode={modalMode}
        client={selectedClient}
        billingToken={billingToken}
        existingClientDocuments={clientsData.map(c => c.document_number?.toString())}
        onSuccess={() => {
          loadInitialData();
        }}
      />

      {/* Details Client Modal */}
      <DetailsClientModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        client={selectedClient}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Acción"
        message="¿Está seguro que desea eliminar este cliente?"
        confirmText="Confirmar"
        cancelText="Cancelar"
        confirmColor="btn-primary"
        cancelColor="btn-error"
      />

      {/* Deactivate Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmDeactivateOpen}
        onClose={() => setIsConfirmDeactivateOpen(false)}
        onConfirm={handleToggleClientStatus}
        title={modalTitle}
        message={modalMessage}
        confirmText="Desactivar"
        cancelText="Cancelar"
        confirmColor="btn-primary"
        cancelColor="btn-error"
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={modalTitle}
        message={modalMessage}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title={modalTitle}
        message={modalMessage}
        buttonText="Cerrar"
      />

      {/* TODO: Add modals for Create, Edit operations */}
      {/* These will be implemented in separate modal components */}
    </div>
  );
};

export default ClientsView;
