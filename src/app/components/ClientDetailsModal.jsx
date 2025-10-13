"use client";
import React, { useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FaTimes, FaFileInvoice } from "react-icons/fa";
import TableList from "@/app/components/shared/TableList";

const ClientDetailsModal = ({ isOpen, onClose, client }) => {
  if (!client) return null;

  // Mock data for request history
  const requestHistoryData = [
    {
      id: 1,
      request_id: "S-00001",
      request_date: "Example",
      billing_status: "Paid",
      request_status: "Finished",
    },
  ];

  // Table columns definition for request history
  const requestColumns = useMemo(
    () => [
      {
        accessorKey: "request_id",
        header: "ID de Solicitud",
        cell: ({ row }) => (
          <div className="text-sm font-medium text-primary">
            {row.getValue("request_id")}
          </div>
        ),
      },
      {
        accessorKey: "request_date",
        header: "Fecha de Solicitud",
        cell: ({ row }) => (
          <div className="text-sm text-primary">
            {row.getValue("request_date")}
          </div>
        ),
      },
      {
        accessorKey: "billing_status",
        header: "Estado de Facturación",
        cell: ({ row }) => {
          const status = row.getValue("billing_status");
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "request_status",
        header: "Estado de Solicitud",
        cell: ({ row }) => {
          const status = row.getValue("request_status");
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {status}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => console.log("Invoice:", row.original)}
                className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-blue-500 hover:text-blue-600 text-gray-700"
                title="Ver factura"
              >
                <FaFileInvoice className="w-3 h-3" /> Factura
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-[60]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-background rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-background z-10">
            <Dialog.Title className="text-2xl font-bold text-primary">
              Detalles del Cliente
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Cerrar modal"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <FaTimes className="w-6 h-6 text-gray-500" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Personal & Contact Data */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-primary">
                  Datos Personales y de Contacto
                </h3>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    client.customer_statues_id === 1
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {client.customer_statues_name}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Identification type */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Tipo de identificación
                  </label>
                  <div className="text-base text-primary font-medium">
                    {client.type_document_name}
                  </div>
                </div>

                {/* Type of person */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Tipo de persona
                  </label>
                  <div className="text-base text-primary font-medium">
                    {client.person_type_name}
                  </div>
                </div>

                {/* Identification number */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Número de identificación
                  </label>
                  <div className="text-base text-primary font-medium font-mono">
                    {client.document_number}
                  </div>
                </div>

                {/* Check digit */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Dígito de verificación
                  </label>
                  <div className="text-base text-primary font-medium">
                    {client.check_digit}
                  </div>
                </div>

                {/* Tax regime */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Régimen tributario
                  </label>
                  <div className="text-base text-primary font-medium">
                    {client.tax_regime_name}
                  </div>
                </div>

                {/* Legal name */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Razón social
                  </label>
                  <div className="text-base text-primary font-medium">
                    {client.legal_entity_name}
                  </div>
                </div>

                {/* Full name */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Nombre completo
                  </label>
                  <div className="text-base text-primary font-medium">
                    {`${client.name} ${client.first_last_name || ""} ${
                      client.second_last_name || ""
                    }`.trim()}
                  </div>
                </div>

                {/* Business name (if different from legal name) */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Nombre comercial
                  </label>
                  <div className="text-base text-primary font-medium">
                    {client.legal_entity_name}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Dirección
                  </label>
                  <div className="text-base text-primary font-medium">
                    {client.address}
                  </div>
                </div>

                {/* Region/City */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Región/Ciudad
                  </label>
                  <div className="text-base text-primary font-medium">
                    {client.municipality_name || `Municipio ID: ${client.id_municipality}`}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Correo electrónico
                  </label>
                  <div className="text-base text-blue-600 font-medium">
                    {client.email}
                  </div>
                </div>

                {/* Phone number */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Número de teléfono
                  </label>
                  <div className="text-base text-primary font-medium">
                    +{client.phone}
                  </div>
                </div>
              </div>
            </div>

            {/* Request History */}
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-primary">
                  Historial de Solicitudes
                </h3>
              </div>

              <TableList
                columns={requestColumns}
                data={requestHistoryData}
                loading={false}
                pageSizeOptions={[5, 10, 20]}
              />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ClientDetailsModal;
